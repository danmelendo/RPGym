-- =============================================================================
-- RPGym · Entrenar juntos
--
-- Dos o más amigos entrenando a la vez, contado como sesión conjunta.
--
-- SIN TIEMPO REAL a propósito: nada de websockets ni suscripciones. Cada uno
-- registra su sesión y la app consulta quién está entrenando al abrirse. Para
-- un grupo de amigos es indistinguible y es MUCHO menos frágil: si falla la
-- red, cada uno sigue entrenando en su móvil y ya se cuadrará al terminar.
--
-- Del entreno solo viaja el NOMBRE de la rutina y el XP aportado. Ni ejercicios,
-- ni series, ni pesos: el detalle sigue sin salir del dispositivo.
-- =============================================================================

create table if not exists public.joint_sessions (
  id         uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users(id) on delete cascade,
  rutina     text not null default '',
  started_at timestamptz not null default now(),
  ended_at   timestamptz,
  constraint joint_rutina_corta check (char_length(rutina) <= 60)
);

create index if not exists joint_sessions_activas_idx on public.joint_sessions (started_at desc) where ended_at is null;

create table if not exists public.joint_members (
  session_id uuid not null references public.joint_sessions(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  joined_at  timestamptz not null default now(),
  xp         int not null default 0 check (xp >= 0 and xp <= 5000),
  primary key (session_id, user_id)
);

alter table public.joint_sessions enable row level security;
alter table public.joint_members  enable row level security;

-- ¿Puedo ver esta sesión? Si es mía o la abrió un amigo.
create or replace function public.puedo_ver_sesion(p_sesion uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.joint_sessions s
     where s.id = p_sesion
       and (s.created_by = auth.uid() or public.es_amigo(s.created_by))
  );
$$;

revoke all on function public.puedo_ver_sesion(uuid) from public, anon;
grant execute on function public.puedo_ver_sesion(uuid) to authenticated;

drop policy if exists "veo las sesiones de mi círculo" on public.joint_sessions;
create policy "veo las sesiones de mi círculo"
  on public.joint_sessions for select to authenticated
  using (auth.uid() = created_by or public.es_amigo(created_by));

drop policy if exists "abro sesiones" on public.joint_sessions;
create policy "abro sesiones"
  on public.joint_sessions for insert to authenticated with check (auth.uid() = created_by);

drop policy if exists "cierro mis sesiones" on public.joint_sessions;
create policy "cierro mis sesiones"
  on public.joint_sessions for update to authenticated
  using (auth.uid() = created_by) with check (auth.uid() = created_by);

drop policy if exists "veo quién entrena" on public.joint_members;
create policy "veo quién entrena"
  on public.joint_members for select to authenticated using (public.puedo_ver_sesion(session_id));

-- Te apuntas TÚ, y solo a sesiones que puedes ver.
drop policy if exists "me apunto yo" on public.joint_members;
create policy "me apunto yo"
  on public.joint_members for insert to authenticated
  with check (auth.uid() = user_id and public.puedo_ver_sesion(session_id));

-- Solo puedes tocar TU aportación (el XP que sumaste al terminar).
drop policy if exists "actualizo mi aportación" on public.joint_members;
create policy "actualizo mi aportación"
  on public.joint_members for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "me borro de la sesión" on public.joint_members;
create policy "me borro de la sesión"
  on public.joint_members for delete to authenticated using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- QUIÉN ESTÁ ENTRENANDO AHORA
-- Se considera "en marcha" hasta 3 h después de empezar: nadie entrena más, y
-- así una sesión que se quedó sin cerrar no aparece para siempre.
-- ---------------------------------------------------------------------------
create or replace view public.entrenando_ahora
  with (security_invoker = on) as
  select s.id, s.created_by, s.rutina, s.started_at,
         p.handle, p.display_name, p.level,
         (select count(*) from public.joint_members m where m.session_id = s.id)::int as cuantos,
         exists (select 1 from public.joint_members m
                  where m.session_id = s.id and m.user_id = auth.uid())               as estoy
  from public.joint_sessions s
  join public.profiles p on p.id = s.created_by
  where s.ended_at is null
    and s.started_at > now() - interval '3 hours'
  order by s.started_at desc;

grant select on public.entrenando_ahora to authenticated;

create or replace view public.compañeros_sesion
  with (security_invoker = on) as
  select m.session_id, m.xp, m.joined_at, p.id, p.handle, p.display_name
  from public.joint_members m
  join public.profiles p on p.id = m.user_id;

grant select on public.compañeros_sesion to authenticated;
