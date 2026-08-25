-- =============================================================================
-- RPGym · Récords por ejercicio y detalle de entrenos
--
-- CAMBIO DE CRITERIO (decisión del dueño): la app es de uso privado entre
-- amigos, no comercial. Se levanta la restricción de subir datos de
-- entrenamiento. Ahora se sincroniza el detalle y las marcas por ejercicio, que
-- es lo que permite comparar récords entre amigos.
--
-- SIGUEN SIN SALIR DEL MÓVIL, y esto no se toca:
--   · Los datos del ciclo menstrual (categoría especial: se quedan en local).
--   · Las rutinas marcadas como PRIVADAS por su dueño.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- RÉCORDS POR EJERCICIO
-- Una fila por persona y ejercicio: su mejor marca.
-- ---------------------------------------------------------------------------
create table if not exists public.exercise_records (
  user_id    uuid not null references auth.users(id) on delete cascade,
  ejercicio  text not null,
  peso       numeric(6,2) not null default 0 check (peso >= 0 and peso <= 999),
  reps       int not null default 0 check (reps >= 0 and reps <= 999),
  fecha      date not null default current_date,
  updated_at timestamptz not null default now(),
  primary key (user_id, ejercicio),
  constraint records_ejercicio_corto check (char_length(ejercicio) <= 60)
);

create index if not exists exercise_records_ej_idx on public.exercise_records (ejercicio);

alter table public.exercise_records enable row level security;

-- Tus marcas y las de tus amigos: es justo el sentido de compararse.
drop policy if exists "veo los récords de mi círculo" on public.exercise_records;
create policy "veo los récords de mi círculo"
  on public.exercise_records for select to authenticated
  using (auth.uid() = user_id or public.es_amigo(user_id));

drop policy if exists "subo mis récords" on public.exercise_records;
create policy "subo mis récords"
  on public.exercise_records for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "actualizo mis récords" on public.exercise_records;
create policy "actualizo mis récords"
  on public.exercise_records for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "borro mis récords" on public.exercise_records;
create policy "borro mis récords"
  on public.exercise_records for delete to authenticated using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- QUIÉN ME HA ADELANTADO
-- Amigos cuya marca supera la mía en el mismo ejercicio. Es lo que pedía el
-- aviso de "te ha superado en press banca".
-- ---------------------------------------------------------------------------
create or replace view public.me_han_superado
  with (security_invoker = on) as
  select r.user_id, p.handle, p.display_name, r.ejercicio,
         r.peso as suyo, mio.peso as mio, (r.peso - mio.peso) as diferencia,
         r.updated_at
  from public.exercise_records r
  join public.profiles p          on p.id = r.user_id
  join public.exercise_records mio on mio.user_id = auth.uid() and mio.ejercicio = r.ejercicio
  where r.user_id <> auth.uid()
    and public.es_amigo(r.user_id)
    and r.peso > mio.peso
  order by r.updated_at desc;

grant select on public.me_han_superado to authenticated;

-- A quién he adelantado yo (para celebrarlo al terminar el entreno).
create or replace view public.he_superado
  with (security_invoker = on) as
  select r.user_id, p.handle, p.display_name, r.ejercicio,
         mio.peso as mio, r.peso as suyo
  from public.exercise_records r
  join public.profiles p           on p.id = r.user_id
  join public.exercise_records mio on mio.user_id = auth.uid() and mio.ejercicio = r.ejercicio
  where r.user_id <> auth.uid()
    and public.es_amigo(r.user_id)
    and mio.peso > r.peso;

grant select on public.he_superado to authenticated;

-- ---------------------------------------------------------------------------
-- DETALLE DE LOS ENTRENOS
-- Se añade a workout_points, que ya existía. jsonb con los ejercicios y series.
-- ---------------------------------------------------------------------------
alter table public.workout_points
  add column if not exists detalle jsonb,
  add column if not exists rutina  text;

-- ---------------------------------------------------------------------------
-- RUTINAS: marcar como privada
-- Por defecto las rutinas se sincronizan con los amigos. Quien quiera guardarse
-- una se la marca privada y deja de subirse.
-- ---------------------------------------------------------------------------
alter table public.shared_routines
  add column if not exists privada boolean not null default false;

-- Las privadas solo las ve su dueño, aunque estén subidas.
drop policy if exists "veo las rutinas de mi círculo" on public.shared_routines;
create policy "veo las rutinas de mi círculo"
  on public.shared_routines for select to authenticated
  using (auth.uid() = owner_id or (not privada and public.es_amigo(owner_id)));

create or replace view public.rutinas_de_amigos
  with (security_invoker = on) as
  select r.id, r.owner_id, r.name, r.dias, r.payload, r.updated_at,
         p.handle, p.display_name
  from public.shared_routines r
  join public.profiles p on p.id = r.owner_id
  where r.owner_id <> auth.uid() and not r.privada
  order by r.updated_at desc;

grant select on public.rutinas_de_amigos to authenticated;
