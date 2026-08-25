-- =============================================================================
-- RPGym · Quedadas para ir juntos al gimnasio
--
-- Alguien propone día y hora, sus amigos lo ven y contestan. El objetivo es
-- dinamizar: saber que va alguien más es lo que hace que no te rajes.
-- =============================================================================

create table if not exists public.meetups (
  id         uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users(id) on delete cascade,
  cuando     timestamptz not null,
  lugar      text not null default '',
  nota       text not null default '',
  created_at timestamptz not null default now(),
  constraint meetups_lugar_corto check (char_length(lugar) <= 60),
  constraint meetups_nota_corta  check (char_length(nota)  <= 200)
);

create index if not exists meetups_cuando_idx on public.meetups (cuando);

alter table public.meetups enable row level security;

-- Ves las tuyas y las de tus amigos. De un desconocido, nada.
drop policy if exists "veo las quedadas de mi círculo" on public.meetups;
create policy "veo las quedadas de mi círculo"
  on public.meetups for select to authenticated
  using (auth.uid() = created_by or public.es_amigo(created_by));

drop policy if exists "propongo quedadas" on public.meetups;
create policy "propongo quedadas"
  on public.meetups for insert to authenticated with check (auth.uid() = created_by);

drop policy if exists "edito mis quedadas" on public.meetups;
create policy "edito mis quedadas"
  on public.meetups for update to authenticated
  using (auth.uid() = created_by) with check (auth.uid() = created_by);

drop policy if exists "cancelo mis quedadas" on public.meetups;
create policy "cancelo mis quedadas"
  on public.meetups for delete to authenticated using (auth.uid() = created_by);

-- ---------------------------------------------------------------------------
-- RESPUESTAS · "Yo voy" / "No puedo"
-- ---------------------------------------------------------------------------
create table if not exists public.meetup_guests (
  meetup_id  uuid not null references public.meetups(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  respuesta  text not null default 'voy' check (respuesta in ('voy','no')),
  updated_at timestamptz not null default now(),
  primary key (meetup_id, user_id)
);

alter table public.meetup_guests enable row level security;

-- ¿Puedo ver esta quedada? Se reutiliza para las respuestas: si ves la quedada,
-- ves quién va. security definer porque consulta meetups saltándose su RLS.
create or replace function public.puedo_ver_quedada(p_meetup uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.meetups m
     where m.id = p_meetup
       and (m.created_by = auth.uid() or public.es_amigo(m.created_by))
  );
$$;

revoke all on function public.puedo_ver_quedada(uuid) from public, anon;
grant execute on function public.puedo_ver_quedada(uuid) to authenticated;

drop policy if exists "veo quién va" on public.meetup_guests;
create policy "veo quién va"
  on public.meetup_guests for select to authenticated
  using (public.puedo_ver_quedada(meetup_id));

-- Solo puedes contestar por TI, y solo a quedadas que puedes ver.
drop policy if exists "contesto por mí" on public.meetup_guests;
create policy "contesto por mí"
  on public.meetup_guests for insert to authenticated
  with check (auth.uid() = user_id and public.puedo_ver_quedada(meetup_id));

drop policy if exists "cambio mi respuesta" on public.meetup_guests;
create policy "cambio mi respuesta"
  on public.meetup_guests for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "retiro mi respuesta" on public.meetup_guests;
create policy "retiro mi respuesta"
  on public.meetup_guests for delete to authenticated using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- VISTA · las quedadas que me tocan, con quién va y qué he contestado yo
-- Se mantienen visibles 6 h después de la hora: una quedada de esta mañana
-- sigue teniendo sentido a mediodía, pero no al día siguiente.
-- ---------------------------------------------------------------------------
create or replace view public.quedadas
  with (security_invoker = on) as
  select m.id, m.created_by, m.cuando, m.lugar, m.nota, m.created_at,
         p.handle, p.display_name,
         (select count(*) from public.meetup_guests g
           where g.meetup_id = m.id and g.respuesta = 'voy')::int as van,
         (select g.respuesta from public.meetup_guests g
           where g.meetup_id = m.id and g.user_id = auth.uid())    as mi_respuesta,
         (m.created_by = auth.uid())                               as es_mia
  from public.meetups m
  join public.profiles p on p.id = m.created_by
  where m.cuando > now() - interval '6 hours'
  order by m.cuando;

grant select on public.quedadas to authenticated;

-- Quién va a una quedada concreta (nombres, para pintarlos).
create or replace view public.quedada_asistentes
  with (security_invoker = on) as
  select g.meetup_id, g.respuesta, p.id, p.handle, p.display_name, p.level
  from public.meetup_guests g
  join public.profiles p on p.id = g.user_id;

grant select on public.quedada_asistentes to authenticated;
