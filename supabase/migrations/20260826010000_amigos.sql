-- =============================================================================
-- RPGym · Amigos por código de invitación
--
-- Círculo cerrado: nada de buscador de usuarios ni solicitudes pendientes.
-- Generas un código de 6 caracteres, lo mandas por WhatsApp, y quien lo canjea
-- queda como amigo directamente. Es lo acordado en ROADMAP-SOCIAL.md §2.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- AMISTADES
-- Se guarda UNA fila por pareja, con los uuid ordenados (a < b). Así no hay
-- filas duplicadas en los dos sentidos ni hay que consultar dos veces.
-- ---------------------------------------------------------------------------
create table if not exists public.friendships (
  a          uuid not null references auth.users(id) on delete cascade,
  b          uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (a, b),
  constraint friendships_ordenada check (a < b)     -- fuerza la forma canónica
);

alter table public.friendships enable row level security;

-- Solo ves las amistades en las que estás tú.
drop policy if exists "veo mis amistades" on public.friendships;
create policy "veo mis amistades"
  on public.friendships for select to authenticated
  using (auth.uid() = a or auth.uid() = b);

-- OJO: no hay política de INSERT. Las amistades se crean SOLO canjeando un
-- código, a través de la función de abajo. Si dejáramos insertar libremente,
-- cualquiera podría añadirse a sí mismo como amigo de quien quisiera.
drop policy if exists "puedo dejar de ser amigo" on public.friendships;
create policy "puedo dejar de ser amigo"
  on public.friendships for delete to authenticated
  using (auth.uid() = a or auth.uid() = b);

-- ---------------------------------------------------------------------------
-- INVITACIONES
-- ---------------------------------------------------------------------------
create table if not exists public.invites (
  code       text primary key,
  owner_id   uuid not null references auth.users(id) on delete cascade,
  usos       int  not null default 0,
  max_usos   int  not null default 10,
  expira     timestamptz not null default (now() + interval '30 days'),
  created_at timestamptz not null default now()
);

create index if not exists invites_owner_idx on public.invites (owner_id);

alter table public.invites enable row level security;

-- Cada uno ve y borra solo sus códigos. Nadie puede listar los de otro: el
-- canje va por función security definer, que no necesita esta política.
drop policy if exists "veo mis códigos" on public.invites;
create policy "veo mis códigos" on public.invites for select to authenticated using (auth.uid() = owner_id);

drop policy if exists "borro mis códigos" on public.invites;
create policy "borro mis códigos" on public.invites for delete to authenticated using (auth.uid() = owner_id);

-- ---------------------------------------------------------------------------
-- CREAR UN CÓDIGO
-- Alfabeto sin caracteres que se confundan al dictarlo por teléfono:
-- fuera 0/O, 1/I/L. Se reutiliza el código vigente si ya hay uno.
-- ---------------------------------------------------------------------------
create or replace function public.crear_invitacion()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text;
  v_alfabeto text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  i int;
begin
  if auth.uid() is null then raise exception 'Necesitas iniciar sesión.'; end if;

  -- ¿Ya tiene uno vivo? Se devuelve ese, para no llenar la tabla de códigos.
  select code into v_code from public.invites
   where owner_id = auth.uid() and expira > now() and usos < max_usos
   order by created_at desc limit 1;
  if v_code is not null then return v_code; end if;

  for intento in 1..10 loop
    v_code := '';
    for i in 1..6 loop
      v_code := v_code || substr(v_alfabeto, 1 + floor(random() * length(v_alfabeto))::int, 1);
    end loop;
    begin
      insert into public.invites (code, owner_id) values (v_code, auth.uid());
      return v_code;
    exception when unique_violation then
      -- código repetido (improbable): se reintenta
    end;
  end loop;
  raise exception 'No se ha podido generar un código. Inténtalo otra vez.';
end;
$$;

revoke all on function public.crear_invitacion() from public, anon;
grant execute on function public.crear_invitacion() to authenticated;

-- ---------------------------------------------------------------------------
-- CANJEAR UN CÓDIGO
-- security definer porque quien canjea NO puede leer la tabla de invitaciones
-- de otro ni escribir una amistad por su cuenta. Devuelve el perfil del amigo.
-- ---------------------------------------------------------------------------
create or replace function public.canjear_invitacion(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_inv   public.invites%rowtype;
  v_yo    uuid := auth.uid();
  v_a     uuid;
  v_b     uuid;
  v_perfil jsonb;
begin
  if v_yo is null then return jsonb_build_object('ok', false, 'msg', 'Necesitas iniciar sesión.'); end if;

  select * into v_inv from public.invites where upper(code) = upper(trim(p_code));
  if not found            then return jsonb_build_object('ok', false, 'msg', 'Ese código no existe. Repásalo.'); end if;
  if v_inv.expira <= now() then return jsonb_build_object('ok', false, 'msg', 'Ese código ha caducado. Pide uno nuevo.'); end if;
  if v_inv.usos >= v_inv.max_usos then return jsonb_build_object('ok', false, 'msg', 'Ese código ya se ha usado demasiadas veces.'); end if;
  if v_inv.owner_id = v_yo then return jsonb_build_object('ok', false, 'msg', 'Ese es tu propio código: pásaselo a otra persona.'); end if;

  -- Forma canónica: siempre el uuid menor en 'a'.
  v_a := least(v_inv.owner_id, v_yo);
  v_b := greatest(v_inv.owner_id, v_yo);

  if exists (select 1 from public.friendships where a = v_a and b = v_b) then
    select to_jsonb(p) into v_perfil from public.profiles p where p.id = v_inv.owner_id;
    return jsonb_build_object('ok', true, 'yaEra', true, 'amigo', v_perfil);
  end if;

  insert into public.friendships (a, b) values (v_a, v_b);
  update public.invites set usos = usos + 1 where code = v_inv.code;

  select jsonb_build_object('id', p.id, 'handle', p.handle, 'display_name', p.display_name, 'level', p.level)
    into v_perfil from public.profiles p where p.id = v_inv.owner_id;
  return jsonb_build_object('ok', true, 'yaEra', false, 'amigo', v_perfil);
end;
$$;

revoke all on function public.canjear_invitacion(text) from public, anon;
grant execute on function public.canjear_invitacion(text) to authenticated;

-- ---------------------------------------------------------------------------
-- MIS AMIGOS · y las clasificaciones limitadas a ellos
-- Las vistas resuelven auth.uid() por dentro, así cada uno ve lo suyo.
-- ---------------------------------------------------------------------------
create or replace view public.mis_amigos
  with (security_invoker = on) as
  select case when f.a = auth.uid() then f.b else f.a end as amigo_id,
         f.created_at
  from public.friendships f
  where auth.uid() in (f.a, f.b);

grant select on public.mis_amigos to authenticated;

-- Yo + mis amigos, que es el conjunto de todas las clasificaciones de abajo.
create or replace view public.circulo
  with (security_invoker = on) as
  select p.* from public.profiles p
  where p.id = auth.uid()
     or p.id in (select amigo_id from public.mis_amigos);

grant select on public.circulo to authenticated;

create or replace view public.amigos_semanal
  with (security_invoker = on) as
  select c.id, c.handle, c.display_name, c.level,
         coalesce(sum(w.xp), 0)::int as xp, count(w.id)::int as entrenos
  from public.circulo c
  left join public.workout_points w
         on w.user_id = c.id and w.day >= date_trunc('week', current_date)::date
  group by c.id, c.handle, c.display_name, c.level
  order by xp desc, entrenos desc;

create or replace view public.amigos_mensual
  with (security_invoker = on) as
  select c.id, c.handle, c.display_name, c.level,
         coalesce(sum(w.xp), 0)::int as xp, count(w.id)::int as entrenos
  from public.circulo c
  left join public.workout_points w
         on w.user_id = c.id and w.day >= date_trunc('month', current_date)::date
  group by c.id, c.handle, c.display_name, c.level
  order by xp desc, entrenos desc;

create or replace view public.amigos_historica
  with (security_invoker = on) as
  select id, handle, display_name, level, xp, total_workouts as entrenos, best_streak
  from public.circulo
  order by xp desc, total_workouts desc;

grant select on public.amigos_semanal, public.amigos_mensual, public.amigos_historica to authenticated;
