-- =============================================================================
-- RPGym · Las rutinas importadas siguen a su dueño
--
-- Hasta ahora importar una rutina era hacerse una FOTOCOPIA: si el dueño le
-- cambiaba una serie, el que se la había llevado seguía con la versión vieja y
-- no había forma de enterarse. Ahora quien la importa queda apuntado como
-- seguidor y su copia se actualiza sola cuando el dueño la edita.
--
-- El dueño manda siempre: el seguidor no puede escribir en la rutina de otro.
-- Y puede dejar de seguirla cuando quiera (borrando su fila de aquí), con lo
-- que la copia se le queda congelada pero NO se le borra.
-- =============================================================================

create table if not exists public.routine_followers (
  owner_id    uuid not null references auth.users(id) on delete cascade,
  client_id   text not null,                  -- id de la rutina en el móvil del dueño
  follower_id uuid not null references auth.users(id) on delete cascade,
  local_id    text not null default '',       -- id que tiene la copia en MI móvil
  created_at  timestamptz not null default now(),
  primary key (owner_id, client_id, follower_id),
  constraint routine_followers_no_yo check (owner_id <> follower_id)
);

create index if not exists routine_followers_seguidor_idx on public.routine_followers (follower_id);

alter table public.routine_followers enable row level security;

-- Ves a quién sigues tú, y el dueño ve quién le sigue.
drop policy if exists "veo a quién sigo y quién me sigue" on public.routine_followers;
create policy "veo a quién sigo y quién me sigue"
  on public.routine_followers for select to authenticated
  using (auth.uid() = follower_id or auth.uid() = owner_id);

drop policy if exists "sigo la rutina de un amigo" on public.routine_followers;
create policy "sigo la rutina de un amigo"
  on public.routine_followers for insert to authenticated
  with check (auth.uid() = follower_id and public.es_amigo(owner_id));

drop policy if exists "dejo de seguirla" on public.routine_followers;
create policy "dejo de seguirla"
  on public.routine_followers for delete to authenticated
  using (auth.uid() = follower_id);

-- ---------------------------------------------------------------------------
-- Quien sigue una rutina puede LEERLA aunque el dueño la tenga en privado:
-- mandársela a alguien es un acto explícito de compartirla con esa persona.
-- Lo que "privada" impide sigue siendo que salga en la lista de todo el
-- círculo, que es para lo que se puso.
-- ---------------------------------------------------------------------------
drop policy if exists "veo las rutinas de mi círculo" on public.shared_routines;
create policy "veo las rutinas de mi círculo"
  on public.shared_routines for select to authenticated
  using (
    auth.uid() = owner_id
    or (not privada and public.es_amigo(owner_id))
    or exists (select 1 from public.routine_followers f
                where f.owner_id = shared_routines.owner_id
                  and f.client_id = shared_routines.client_id
                  and f.follower_id = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- Lo que el móvil consulta para ponerse al día: las rutinas que sigo, con la
-- fecha de su último cambio. La app compara con la que guardó y decide.
-- ---------------------------------------------------------------------------
create or replace view public.rutinas_seguidas
  with (security_invoker = on) as
  select f.local_id, f.owner_id, f.client_id,
         r.name, r.dias, r.payload, r.updated_at,
         p.handle, p.display_name
    from public.routine_followers f
    join public.shared_routines r on r.owner_id = f.owner_id and r.client_id = f.client_id
    join public.profiles p        on p.id = f.owner_id
   where f.follower_id = auth.uid();

grant select on public.rutinas_seguidas to authenticated;
