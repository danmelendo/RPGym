-- =============================================================================
-- RPGym · Fase 1 (cuentas, perfiles, keep-alive, leaderboard, aviso de versión)
--
-- Cómo aplicarlo:
--   Supabase → tu proyecto → SQL Editor → pega esto entero → Run.
--   Es idempotente: puedes volver a ejecutarlo sin romper nada.
--
-- IMPORTANTE: la anon key viaja DENTRO del APK (es pública por diseño). Toda la
-- seguridad son estas políticas RLS. Ninguna tabla puede quedarse sin RLS.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- PERFILES
-- El id es el uuid de auth.users: ESE es el identificador único de verdad.
-- El handle es el nombre único que se ve (para que dos Danieles no choquen).
-- NUNCA metas aquí peso, altura, edad ni ciclo menstrual: eso no sale del móvil.
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  handle        text not null unique,
  display_name  text not null default '',
  level         int  not null default 1,
  total_workouts int not null default 0,
  xp            int  not null default 0,
  best_streak   int  not null default 0,
  app_version   text not null default '',
  last_seen     timestamptz not null default now(),
  created_at    timestamptz not null default now()
);

-- handle: 3-20 caracteres, minúsculas, números, guion bajo y punto.
alter table public.profiles drop constraint if exists profiles_handle_format;
alter table public.profiles add constraint profiles_handle_format
  check (handle ~ '^[a-z0-9_.]{3,20}$');

-- Búsqueda de handle sin distinguir mayúsculas (el cliente ya lo baja a minúsculas).
create unique index if not exists profiles_handle_lower_idx on public.profiles (lower(handle));

alter table public.profiles enable row level security;

-- Cualquiera con sesión ve los perfiles (hace falta para el leaderboard y para
-- buscar amigos). Solo se exponen datos de juego, nada personal.
drop policy if exists "perfiles visibles para usuarios con sesión" on public.profiles;
create policy "perfiles visibles para usuarios con sesión"
  on public.profiles for select
  to authenticated
  using (true);

drop policy if exists "cada uno crea su perfil" on public.profiles;
create policy "cada uno crea su perfil"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "cada uno edita su perfil" on public.profiles;
create policy "cada uno edita su perfil"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "cada uno borra su perfil" on public.profiles;
create policy "cada uno borra su perfil"
  on public.profiles for delete
  to authenticated
  using (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- ¿ESTÁ LIBRE ESTE HANDLE?
-- Se necesita ANTES de registrarse, cuando aún no hay sesión. Por eso va como
-- función security definer: responde sí/no sin dejar leer la tabla entera.
-- ---------------------------------------------------------------------------
create or replace function public.handle_disponible(p_handle text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select not exists (select 1 from public.profiles where lower(handle) = lower(p_handle));
$$;

-- OJO: Postgres concede EXECUTE a PUBLIC por defecto en toda función nueva, así que
-- un `grant ... to authenticated` NO restringe nada. Hay que REVOCAR primero.
revoke all on function public.handle_disponible(text) from public;
grant execute on function public.handle_disponible(text) to anon, authenticated;  -- ésta SÍ es pública a propósito

-- ---------------------------------------------------------------------------
-- KEEP-ALIVE
-- El plan gratis de Supabase pausa el proyecto tras ~1 semana sin actividad.
-- Cada vez que alguien abre la app con sesión se llama a esto: cuenta como
-- actividad y de paso deja constancia de cuándo se le vio por última vez.
-- ---------------------------------------------------------------------------
create table if not exists public.heartbeat (
  id         int primary key default 1,
  last_ping  timestamptz not null default now(),
  pings      bigint not null default 0,
  constraint heartbeat_una_fila check (id = 1)
);
insert into public.heartbeat (id) values (1) on conflict (id) do nothing;

alter table public.heartbeat enable row level security;

drop policy if exists "heartbeat visible" on public.heartbeat;
create policy "heartbeat visible" on public.heartbeat for select to authenticated using (true);

create or replace function public.ping()
returns timestamptz
language plpgsql
security definer
set search_path = public
as $$
declare t timestamptz;
begin
  update public.heartbeat set last_ping = now(), pings = pings + 1 where id = 1
    returning last_ping into t;
  -- Deja también rastro en el propio perfil (si ya lo tiene creado).
  update public.profiles set last_seen = now() where id = auth.uid();
  return t;
end;
$$;

-- Sin este revoke, cualquiera con la anon key podría llamar a ping() sin registrarse
-- y escribir en heartbeat. Es un endpoint de escritura: exige sesión.
revoke all on function public.ping() from public, anon;
grant execute on function public.ping() to authenticated;

-- ---------------------------------------------------------------------------
-- VERSIONES DE LA APP
-- El APK NO va en la base de datos (500 MB de límite y los backups se inflarían):
-- va en Storage, y aquí solo el número de versión y la URL de descarga.
--
-- Crea a mano el bucket:  Storage → New bucket → nombre "apk" → Public.
-- Sube ahí app-debug.apk y pega su URL pública en download_url.
-- ---------------------------------------------------------------------------
create table if not exists public.app_versions (
  version_code  int primary key,
  version_name  text not null,
  download_url  text not null,
  notes         text not null default '',
  mandatory     boolean not null default false,
  published_at  timestamptz not null default now()
);

alter table public.app_versions enable row level security;

drop policy if exists "versiones visibles" on public.app_versions;
create policy "versiones visibles"
  on public.app_versions for select
  to anon, authenticated
  using (true);
-- Publicar versiones se hace desde el panel de Supabase, no desde la app:
-- no hay política de insert/update a propósito.

-- ---------------------------------------------------------------------------
-- LEADERBOARD
-- Vista para no exponer last_seen ni app_version a los demás.
-- ---------------------------------------------------------------------------
-- OJO: una vista normal se ejecuta con los permisos de su DUEÑO y se salta las RLS
-- de las tablas de debajo. security_invoker hace que apliquen las políticas de quien
-- consulta, que es lo que queremos.
create or replace view public.leaderboard
  with (security_invoker = on) as
  select id, handle, display_name, level, xp, total_workouts, best_streak
  from public.profiles
  order by xp desc;

grant select on public.leaderboard to authenticated;

-- =============================================================================
-- MODELO DE CONFIANZA (léelo antes de presumir de clasificación)
--
-- Cada uno escribe su propio level/xp/total_workouts desde el móvil, así que
-- técnicamente alguien con ganas podría inflar sus números editando la petición.
-- Para un grupo de amigos es asumible y es lo que permite que la app siga siendo
-- offline primero (la XP se calcula en el móvil, no en el servidor).
--
-- Si algún día molesta, el arreglo es subir los ENTRENOS (fase 2) y calcular la XP
-- en el servidor con un trigger, dejando profiles.xp de solo lectura para el cliente.
-- =============================================================================
