-- =============================================================================
-- RPGym · La lista de rutinas de amigos dice de cuál se trata
--
-- Sin client_id, quien copia una rutina de la lista no puede quedar apuntado
-- como seguidor y su copia nace ya congelada.
-- =============================================================================

drop view if exists public.rutinas_de_amigos;
create view public.rutinas_de_amigos
  with (security_invoker = on) as
  select r.id, r.owner_id, r.client_id, r.name, r.dias, r.payload, r.updated_at,
         p.handle, p.display_name
    from public.shared_routines r
    join public.profiles p on p.id = r.owner_id
   where r.owner_id <> auth.uid() and not r.privada
   order by r.updated_at desc;

grant select on public.rutinas_de_amigos to authenticated;
