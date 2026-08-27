-- =============================================================================
-- RPGym · Avisos push dirigidos a UNA persona
--
-- Hasta ahora la Edge Function solo sabía avisar a TODO tu círculo. Vale para
-- "X está entrenando", pero no para lo que va con nombre y apellidos:
--
--   · "X te ha superado en press banca"  -> solo a quien ha sido superado.
--     Antes le llegaba a todos tus amigos, y a los que no habías adelantado el
--     mensaje les mentía directamente.
--   · "X te ha invitado a quedar"        -> solo al invitado.
--   · "X quiere ser tu amigo"            -> solo a quien recibe la solicitud.
--   · "X te ha mandado una rutina"       -> solo al destinatario.
--
-- Las solicitudes de amistad son el caso raro: todavía NO sois amigos, así que
-- no vale la comprobación de amistad. Se acepta si hay una solicitud viva.
-- =============================================================================

create or replace function public.tokens_de_una_persona(p_de uuid, p_para uuid)
returns table (token text)
language sql
security definer
set search_path = public
as $$
  select t.token
    from public.push_tokens t
   where t.user_id = p_para
     and t.user_id <> p_de
     -- O sois amigos, o hay una solicitud viva entre los dos: nadie puede
     -- usar esto para colarle una notificación a un desconocido.
     and (
       exists (select 1 from public.friendships f
                where f.a = least(p_de, p_para) and f.b = greatest(p_de, p_para))
       or exists (select 1 from public.friend_requests r
                   where r.estado = 'pendiente'
                     and ((r.de = p_de and r.para = p_para)
                       or (r.de = p_para and r.para = p_de)))
     );
$$;

revoke all on function public.tokens_de_una_persona(uuid, uuid) from public, anon, authenticated;
-- Solo la clave de servicio (Edge Function). Si esto fuera llamable desde la
-- app, cualquiera podría averiguar los tokens de otro y suplantarle avisos.
grant execute on function public.tokens_de_una_persona(uuid, uuid) to service_role;
