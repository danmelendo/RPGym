-- =============================================================================
-- RPGym · Rutinas publicadas a los amigos
--
-- OJO CON LA PRIVACIDAD: por defecto las rutinas NO salen del móvil, y así lo
-- promete la política. Publicar una es una acción EXPLÍCITA por rutina: el
-- usuario decide cuál comparte. Nada se sube solo.
--
-- El payload reutiliza el formato de encodeRoutine() que ya existe en la app y
-- está probado: aguanta versiones distintas porque los ejercicios van por
-- nombre, no por índice.
-- =============================================================================

create table if not exists public.shared_routines (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null references auth.users(id) on delete cascade,
  client_id  text not null,                    -- id de la rutina en el móvil
  name       text not null,
  dias       int  not null default 1,
  payload    jsonb not null,
  updated_at timestamptz not null default now(),
  unique (owner_id, client_id)
);

create index if not exists shared_routines_owner_idx on public.shared_routines (owner_id);

alter table public.shared_routines enable row level security;

-- ¿Somos amigos? La amistad se guarda con los uuid ordenados (a < b).
create or replace function public.es_amigo(p_otro uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.friendships
     where a = least(auth.uid(), p_otro) and b = greatest(auth.uid(), p_otro)
  );
$$;

revoke all on function public.es_amigo(uuid) from public, anon;
grant execute on function public.es_amigo(uuid) to authenticated;

-- Ves tus rutinas publicadas y las de tus amigos. De un desconocido, nada.
drop policy if exists "veo las rutinas de mi círculo" on public.shared_routines;
create policy "veo las rutinas de mi círculo"
  on public.shared_routines for select to authenticated
  using (auth.uid() = owner_id or public.es_amigo(owner_id));

drop policy if exists "publico mis rutinas" on public.shared_routines;
create policy "publico mis rutinas"
  on public.shared_routines for insert to authenticated with check (auth.uid() = owner_id);

drop policy if exists "actualizo mis rutinas" on public.shared_routines;
create policy "actualizo mis rutinas"
  on public.shared_routines for update to authenticated
  using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists "dejo de compartir mis rutinas" on public.shared_routines;
create policy "dejo de compartir mis rutinas"
  on public.shared_routines for delete to authenticated using (auth.uid() = owner_id);

-- ---------------------------------------------------------------------------
-- Rutinas de mis amigos, con el nombre de quién las comparte.
-- ---------------------------------------------------------------------------
create or replace view public.rutinas_de_amigos
  with (security_invoker = on) as
  select r.id, r.owner_id, r.name, r.dias, r.payload, r.updated_at,
         p.handle, p.display_name
  from public.shared_routines r
  join public.profiles p on p.id = r.owner_id
  where r.owner_id <> auth.uid()
  order by r.updated_at desc;

grant select on public.rutinas_de_amigos to authenticated;
