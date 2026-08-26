-- =============================================================================
-- RPGym · El envío de una rutina lleva de cuál se trata
--
-- Sin el client_id, quien acepta una rutina mandada no sabe a qué rutina del
-- otro seguir, y su copia se queda congelada. Con él queda apuntado como
-- seguidor y recibe los cambios, igual que si la hubiera copiado de la lista.
-- =============================================================================

alter table public.routine_sends
  add column if not exists client_id text not null default '';

drop view if exists public.rutinas_recibidas;
create view public.rutinas_recibidas
  with (security_invoker = on) as
  select s.id, s.de, s.client_id, s.name, s.dias, s.payload, s.created_at,
         p.handle, p.display_name
    from public.routine_sends s
    join public.profiles p on p.id = s.de
   where s.para = auth.uid() and s.estado = 'pendiente'
   order by s.created_at desc;

grant select on public.rutinas_recibidas to authenticated;
