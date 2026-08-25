-- =============================================================================
-- RPGym · Tokens de dispositivo para las notificaciones push (FCM)
--
-- Supabase no envía push: quien las manda es la Edge Function
-- supabase/functions/avisar, que tiene la clave de servicio de Firebase. Aquí
-- solo se guarda a qué dispositivos hay que avisar.
-- =============================================================================

create table if not exists public.push_tokens (
  token      text primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  plataforma text not null default 'android',
  updated_at timestamptz not null default now()
);

create index if not exists push_tokens_user_idx on public.push_tokens (user_id);

alter table public.push_tokens enable row level security;

-- Cada uno gestiona los suyos. Nadie lee los de otro: un token ajeno permitiría
-- mandarle notificaciones a esa persona.
drop policy if exists "veo mis tokens" on public.push_tokens;
create policy "veo mis tokens" on public.push_tokens for select to authenticated using (auth.uid() = user_id);

drop policy if exists "registro mi dispositivo" on public.push_tokens;
create policy "registro mi dispositivo" on public.push_tokens for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "actualizo mi dispositivo" on public.push_tokens;
create policy "actualizo mi dispositivo" on public.push_tokens for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "borro mi dispositivo" on public.push_tokens;
create policy "borro mi dispositivo" on public.push_tokens for delete to authenticated using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- A QUIÉN AVISAR
-- Devuelve los tokens de los amigos de quien llama. La Edge Function la invoca
-- con la clave de servicio; por eso es security definer y comprueba la amistad
-- por dentro en vez de fiarse de quien pregunta.
-- ---------------------------------------------------------------------------
create or replace function public.tokens_de_mis_amigos(p_user uuid)
returns table (token text)
language sql
security definer
set search_path = public
as $$
  select t.token
  from public.push_tokens t
  join public.friendships f
    on (f.a = least(p_user, t.user_id) and f.b = greatest(p_user, t.user_id))
  where t.user_id <> p_user;
$$;

revoke all on function public.tokens_de_mis_amigos(uuid) from public, anon, authenticated;
-- Solo la clave de servicio (Edge Function) puede pedirlos.
grant execute on function public.tokens_de_mis_amigos(uuid) to service_role;

-- ---------------------------------------------------------------------------
-- PREFERENCIAS DE AVISO
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists avisos jsonb not null default
    '{"entreno":true,"record":true,"quedada":true,"superado":true}'::jsonb;
