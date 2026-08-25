-- =============================================================================
-- RPGym · Clasificaciones por periodo (histórica, mensual y semanal)
--
-- El problema: profiles solo guarda el XP ACUMULADO, así que no se puede saber
-- cuánto hiciste esta semana. Hace falta el XP fechado.
--
-- La solución mínima: una fila por entreno con SOLO la fecha y el XP ganado.
-- NO se sube el detalle del entreno (ejercicios, series, pesos, récords): eso
-- sigue viviendo únicamente en el móvil, como promete la política de privacidad.
-- =============================================================================

create table if not exists public.workout_points (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  client_id  text not null,              -- id del entreno en el móvil: evita duplicar al reintentar
  day        date not null,
  xp         int  not null default 0 check (xp >= 0 and xp <= 5000),
  created_at timestamptz not null default now(),
  unique (user_id, client_id)
);

create index if not exists workout_points_user_day_idx on public.workout_points (user_id, day desc);
create index if not exists workout_points_day_idx      on public.workout_points (day desc);

alter table public.workout_points enable row level security;

-- Todos los que tengan sesión ven los puntos: hace falta para las clasificaciones.
-- Solo hay fecha y XP; ni ejercicios, ni pesos, ni nada personal.
drop policy if exists "puntos visibles para usuarios con sesión" on public.workout_points;
create policy "puntos visibles para usuarios con sesión"
  on public.workout_points for select to authenticated using (true);

drop policy if exists "cada uno registra sus puntos" on public.workout_points;
create policy "cada uno registra sus puntos"
  on public.workout_points for insert to authenticated with check (auth.uid() = user_id);

-- OJO: no hay política de UPDATE a propósito. Un entreno registrado no se
-- reescribe; así nadie puede inflar retroactivamente una semana ya cerrada.
drop policy if exists "cada uno borra sus puntos" on public.workout_points;
create policy "cada uno borra sus puntos"
  on public.workout_points for delete to authenticated using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- VISTAS DE CLASIFICACIÓN
-- security_invoker: sin esto, una vista se ejecuta con los permisos de su dueño
-- y se salta las RLS de las tablas de debajo.
-- date_trunc('week') empieza en LUNES, que es lo que espera la app.
-- ---------------------------------------------------------------------------

create or replace view public.leaderboard_semanal
  with (security_invoker = on) as
  select p.id, p.handle, p.display_name, p.level,
         coalesce(sum(w.xp), 0)::int as xp,
         count(w.id)::int            as entrenos
  from public.profiles p
  left join public.workout_points w
         on w.user_id = p.id and w.day >= date_trunc('week', current_date)::date
  group by p.id, p.handle, p.display_name, p.level
  order by xp desc, entrenos desc;

create or replace view public.leaderboard_mensual
  with (security_invoker = on) as
  select p.id, p.handle, p.display_name, p.level,
         coalesce(sum(w.xp), 0)::int as xp,
         count(w.id)::int            as entrenos
  from public.profiles p
  left join public.workout_points w
         on w.user_id = p.id and w.day >= date_trunc('month', current_date)::date
  group by p.id, p.handle, p.display_name, p.level
  order by xp desc, entrenos desc;

-- La histórica sigue saliendo de profiles: es el total de siempre, incluido lo
-- que se entrenó antes de tener cuenta.
create or replace view public.leaderboard_historica
  with (security_invoker = on) as
  select id, handle, display_name, level, xp, total_workouts as entrenos, best_streak
  from public.profiles
  order by xp desc, total_workouts desc;

grant select on public.leaderboard_semanal, public.leaderboard_mensual,
                public.leaderboard_historica to authenticated;
