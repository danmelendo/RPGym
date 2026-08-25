-- =============================================================================
-- RPGym · Novedades de tus amigos desde la última vez que abriste la app
--
-- No hay tabla de "actividad": las novedades se DERIVAN de lo que ya existe
-- (entrenos, quedadas, amistades). Menos datos, menos que mantener y nada
-- nuevo que proteger.
--
-- PRIVACIDAD: para poder decir "ha batido un récord" basta con el NÚMERO de
-- récords de esa sesión. Ni el ejercicio ni el peso salen del móvil, que es lo
-- que promete la política. Comparar récords entre amigos ("te ha superado en
-- press banca") exigiría subir ejercicio y peso: eso es una decisión de
-- privacidad distinta y no se hace aquí.
-- =============================================================================

alter table public.workout_points
  add column if not exists prs int not null default 0 check (prs >= 0 and prs <= 50);

-- ---------------------------------------------------------------------------
-- NOVEDADES · una fila por cosa que ha pasado en tu círculo
-- ---------------------------------------------------------------------------
create or replace view public.novedades
  with (security_invoker = on) as

  -- Entrenos de tus amigos (no los tuyos: ya sabes lo que has hecho)
  select w.created_at                                as cuando,
         case when w.prs > 0 then 'record' else 'entreno' end as tipo,
         p.id, p.handle, p.display_name,
         w.xp, w.prs, null::uuid as ref
  from public.workout_points w
  join public.profiles p on p.id = w.user_id
  where w.user_id <> auth.uid() and public.es_amigo(w.user_id)

  union all

  -- Quedadas propuestas por tus amigos
  select m.created_at, 'quedada', p.id, p.handle, p.display_name,
         0, 0, m.id
  from public.meetups m
  join public.profiles p on p.id = m.created_by
  where m.created_by <> auth.uid() and public.es_amigo(m.created_by)

  union all

  -- Gente que se ha unido a tu círculo
  select f.created_at, 'amistad', p.id, p.handle, p.display_name,
         0, 0, null::uuid
  from public.friendships f
  join public.profiles p
    on p.id = case when f.a = auth.uid() then f.b else f.a end
  where auth.uid() in (f.a, f.b);

grant select on public.novedades to authenticated;
