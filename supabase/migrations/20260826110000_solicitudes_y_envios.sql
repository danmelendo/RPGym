-- =============================================================================
-- RPGym · Solicitudes de amistad y envío de rutinas dentro de la app
--
-- CAMBIO DE CRITERIO respecto a 20260826010000_amigos.sql, que decía "nada de
-- buscador ni solicitudes": ahora sí. El código de invitación sigue existiendo
-- (es lo cómodo para meter a alguien de cero), pero además se puede buscar a
-- alguien por su nombre y pedirle amistad, y él decide.
--
-- Y las rutinas dejan de compartirse pegando texto por WhatsApp: se mandan por
-- dentro, el otro las ve en su campana y las acepta o las rechaza.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- SOLICITUDES DE AMISTAD
-- ---------------------------------------------------------------------------
create table if not exists public.friend_requests (
  id         uuid primary key default gen_random_uuid(),
  de         uuid not null references auth.users(id) on delete cascade,
  para       uuid not null references auth.users(id) on delete cascade,
  estado     text not null default 'pendiente' check (estado in ('pendiente','aceptada','rechazada')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint friend_requests_no_yo check (de <> para)
);

-- Una sola solicitud viva por pareja y sentido.
create unique index if not exists friend_requests_viva_idx
  on public.friend_requests (de, para) where estado = 'pendiente';
create index if not exists friend_requests_para_idx on public.friend_requests (para, estado);

alter table public.friend_requests enable row level security;

-- Ves las tuyas: las que mandas y las que te llegan.
drop policy if exists "veo mis solicitudes" on public.friend_requests;
create policy "veo mis solicitudes"
  on public.friend_requests for select to authenticated
  using (auth.uid() = de or auth.uid() = para);

-- Pides amistad tú, a alguien que no sea ya amigo.
drop policy if exists "pido amistad" on public.friend_requests;
create policy "pido amistad"
  on public.friend_requests for insert to authenticated
  with check (auth.uid() = de and estado = 'pendiente' and not public.es_amigo(para));

-- Retiras la tuya mientras esté pendiente.
drop policy if exists "retiro mi solicitud" on public.friend_requests;
create policy "retiro mi solicitud"
  on public.friend_requests for delete to authenticated
  using (auth.uid() = de and estado = 'pendiente');

-- OJO: no hay política de UPDATE. Aceptar y rechazar van por función, porque
-- aceptar tiene que crear además la amistad, y friendships no admite insert.

-- Lo que ves de quien te la manda: nombre y nivel, nada más.
create or replace view public.solicitudes_recibidas
  with (security_invoker = on) as
  select r.id, r.de, r.created_at, p.handle, p.display_name, p.level, p.total_workouts
    from public.friend_requests r
    join public.profiles p on p.id = r.de
   where r.para = auth.uid() and r.estado = 'pendiente'
   order by r.created_at desc;

grant select on public.solicitudes_recibidas to authenticated;

create or replace function public.responder_solicitud(p_id uuid, p_acepto boolean)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sol public.friend_requests%rowtype;
  v_yo  uuid := auth.uid();
  v_a   uuid;
  v_b   uuid;
begin
  if v_yo is null then return jsonb_build_object('ok', false, 'msg', 'Necesitas iniciar sesión.'); end if;

  select * into v_sol from public.friend_requests where id = p_id and para = v_yo and estado = 'pendiente';
  if not found then return jsonb_build_object('ok', false, 'msg', 'Esa solicitud ya no está.'); end if;

  update public.friend_requests
     set estado = case when p_acepto then 'aceptada' else 'rechazada' end, updated_at = now()
   where id = p_id;

  if p_acepto then
    v_a := least(v_sol.de, v_yo);
    v_b := greatest(v_sol.de, v_yo);
    insert into public.friendships (a, b) values (v_a, v_b) on conflict do nothing;
  end if;

  return jsonb_build_object('ok', true, 'aceptada', p_acepto);
end;
$$;

revoke all on function public.responder_solicitud(uuid, boolean) from public, anon;
grant execute on function public.responder_solicitud(uuid, boolean) to authenticated;

-- ---------------------------------------------------------------------------
-- BUSCAR GENTE
-- Los perfiles ya son visibles para cualquiera con sesión (así funciona la
-- clasificación "Todos"), así que buscar no abre nada nuevo. Se hace por
-- función para acotar el resultado y no permitir listados completos.
-- ---------------------------------------------------------------------------
create or replace function public.buscar_gente(p_texto text)
returns table (id uuid, handle text, display_name text, level int, ya_amigo boolean, pendiente boolean)
language sql
stable
security definer
set search_path = public
as $$
  select p.id, p.handle, p.display_name, p.level,
         public.es_amigo(p.id) as ya_amigo,
         exists (select 1 from public.friend_requests r
                  where r.estado = 'pendiente'
                    and ((r.de = auth.uid() and r.para = p.id)
                      or (r.para = auth.uid() and r.de = p.id))) as pendiente
    from public.profiles p
   where auth.uid() is not null
     and p.id <> auth.uid()
     and length(trim(p_texto)) >= 2
     and (p.handle ilike '%' || trim(p_texto) || '%'
       or p.display_name ilike '%' || trim(p_texto) || '%')
   order by (p.handle ilike trim(p_texto) || '%') desc, p.level desc
   limit 20;
$$;

revoke all on function public.buscar_gente(text) from public, anon;
grant execute on function public.buscar_gente(text) to authenticated;

-- ---------------------------------------------------------------------------
-- ENVÍO DE RUTINAS
-- La rutina viaja como el mismo payload que el código de texto: ejercicios por
-- NOMBRE, sin músculo ni imágenes, que los pone el receptor de su catálogo.
-- ---------------------------------------------------------------------------
create table if not exists public.routine_sends (
  id         uuid primary key default gen_random_uuid(),
  de         uuid not null references auth.users(id) on delete cascade,
  para       uuid not null references auth.users(id) on delete cascade,
  name       text not null default '',
  dias       int  not null default 0,
  payload    jsonb not null,
  estado     text not null default 'pendiente' check (estado in ('pendiente','aceptada','rechazada')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint routine_sends_no_yo check (de <> para),
  constraint routine_sends_nombre_corto check (char_length(name) <= 60)
);

create index if not exists routine_sends_para_idx on public.routine_sends (para, estado);

alter table public.routine_sends enable row level security;

drop policy if exists "veo mis envíos de rutina" on public.routine_sends;
create policy "veo mis envíos de rutina"
  on public.routine_sends for select to authenticated
  using (auth.uid() = de or auth.uid() = para);

-- Solo se manda a un amigo: no es un buzón abierto para cualquiera.
drop policy if exists "mando rutinas a mis amigos" on public.routine_sends;
create policy "mando rutinas a mis amigos"
  on public.routine_sends for insert to authenticated
  with check (auth.uid() = de and estado = 'pendiente' and public.es_amigo(para));

-- El que la recibe decide; el que la manda puede retirarla.
drop policy if exists "contesto a la rutina que me mandan" on public.routine_sends;
create policy "contesto a la rutina que me mandan"
  on public.routine_sends for update to authenticated
  using (auth.uid() = para) with check (auth.uid() = para);

drop policy if exists "retiro la rutina que mandé" on public.routine_sends;
create policy "retiro la rutina que mandé"
  on public.routine_sends for delete to authenticated
  using (auth.uid() = de and estado = 'pendiente');

create or replace view public.rutinas_recibidas
  with (security_invoker = on) as
  select s.id, s.de, s.name, s.dias, s.payload, s.created_at,
         p.handle, p.display_name
    from public.routine_sends s
    join public.profiles p on p.id = s.de
   where s.para = auth.uid() and s.estado = 'pendiente'
   order by s.created_at desc;

grant select on public.rutinas_recibidas to authenticated;
