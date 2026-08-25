-- =============================================================================
-- RPGym · Copia de seguridad en la nube, CIFRADA EN EL MÓVIL
--
-- El objetivo de la fase 2 era "cambiar de móvil sin perder nada". Subir los
-- entrenos en claro habría roto la promesa de que el detalle no sale del
-- dispositivo, así que se sube un BLOB CIFRADO que el servidor no puede leer.
--
-- La clave se deriva de la contraseña de la cuenta (PBKDF2) en el propio móvil
-- y NUNCA se sube. Supabase almacena bytes opacos: ni el desarrollador, ni
-- Supabase, ni nadie con acceso a la base puede ver qué entrenas.
--
-- CONSECUENCIA A TENER PRESENTE: si el usuario cambia su contraseña, la clave
-- cambia y la copia antigua deja de poder descifrarse. Hay que volver a subirla.
-- =============================================================================

create table if not exists public.backups (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  cifrado    text not null,                  -- base64 del contenido cifrado (AES-GCM)
  iv         text not null,                  -- vector de inicialización, base64
  dispositivo text not null default '',      -- para saber desde dónde se subió
  bytes      int  not null default 0,
  version    int  not null default 1,        -- versión del formato de la copia
  updated_at timestamptz not null default now(),
  constraint backups_tamano check (length(cifrado) <= 4000000)   -- ~4 MB de margen
);

alter table public.backups enable row level security;

-- Nadie más que tú. Ni siquiera tus amigos: esto no es contenido social.
drop policy if exists "solo mi copia" on public.backups;
create policy "solo mi copia" on public.backups for select to authenticated using (auth.uid() = user_id);

drop policy if exists "subo mi copia" on public.backups;
create policy "subo mi copia" on public.backups for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "actualizo mi copia" on public.backups;
create policy "actualizo mi copia" on public.backups for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "borro mi copia" on public.backups;
create policy "borro mi copia" on public.backups for delete to authenticated using (auth.uid() = user_id);
