-- =============================================================================
-- RPGym · Invitar a alguien concreto a una quedada
--
-- Hasta ahora una quedada la veían todos tus amigos y cada uno contestaba por su
-- cuenta. Eso sirve para "quién se apunta", pero no para "he quedado contigo".
-- Se añade un tercer valor a la respuesta: 'invitado', que pone quien propone la
-- quedada y el invitado convierte en 'voy' o 'no' al contestar.
-- =============================================================================

alter table public.meetup_guests drop constraint if exists meetup_guests_respuesta_check;
alter table public.meetup_guests add constraint meetup_guests_respuesta_check
  check (respuesta in ('voy','no','invitado'));

-- Quien propone puede invitar, pero SOLO a sus amigos y SOLO a sus quedadas, y
-- solo con 'invitado': nadie puede apuntar a otro como que va.
drop policy if exists "invito a mis amigos" on public.meetup_guests;
create policy "invito a mis amigos"
  on public.meetup_guests for insert to authenticated
  with check (
    respuesta = 'invitado'
    and public.es_amigo(user_id)
    and exists (select 1 from public.meetups m
                 where m.id = meetup_id and m.created_by = auth.uid())
  );

-- Y puede retirar la invitación mientras el otro no haya contestado.
drop policy if exists "retiro una invitación mía" on public.meetup_guests;
create policy "retiro una invitación mía"
  on public.meetup_guests for delete to authenticated
  using (
    respuesta = 'invitado'
    and exists (select 1 from public.meetups m
                 where m.id = meetup_id and m.created_by = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- La vista de quedadas gana dos datos: a quién se ha invitado y si me toca a mí
-- contestar. 'van' sigue contando solo los que han dicho que sí.
-- ---------------------------------------------------------------------------
-- Se añade una columna en medio, así que no vale "create or replace": hay que
-- tirar la vista y volver a crearla.
drop view if exists public.quedadas;
create view public.quedadas
  with (security_invoker = on) as
  select m.id, m.created_by, m.cuando, m.lugar, m.nota, m.created_at,
         p.handle, p.display_name,
         (select count(*) from public.meetup_guests g
           where g.meetup_id = m.id and g.respuesta = 'voy')::int      as van,
         (select count(*) from public.meetup_guests g
           where g.meetup_id = m.id and g.respuesta = 'invitado')::int as invitados,
         (select g.respuesta from public.meetup_guests g
           where g.meetup_id = m.id and g.user_id = auth.uid())        as mi_respuesta,
         (m.created_by = auth.uid())                                   as es_mia
  from public.meetups m
  join public.profiles p on p.id = m.created_by
  where m.cuando > now() - interval '6 hours'
  order by m.cuando;

grant select on public.quedadas to authenticated;

-- Los invitados también salen en la lista de gente, con su estado, para poder
-- pintar "invitado, sin contestar" al lado de los que ya han dicho que van.
create or replace view public.quedada_asistentes
  with (security_invoker = on) as
  select g.meetup_id, g.respuesta, p.id, p.handle, p.display_name, p.level
  from public.meetup_guests g
  join public.profiles p on p.id = g.user_id;

grant select on public.quedada_asistentes to authenticated;
