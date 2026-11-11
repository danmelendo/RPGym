-- =============================================================================
-- RPGym · Resumen quincenal con IA y canal "alt" de versiones
--
-- 1. RESUMEN QUINCENAL
--    Cada dos semanas, un script (scripts/resumen-quincenal.mjs) lee los entrenos
--    de quien lo haya ACTIVADO, se los pasa a Claude en modo headless y guarda aquí
--    el texto. Es OPT-IN: sin `profiles.resumen_ia = true` no se manda nada a
--    nadie. Lo que viaja a Anthropic es lo mismo que ya está en la nube (entrenos
--    con su detalle y marcas). El ciclo menstrual no sale del móvil y no está aquí.
--
--    El script escribe con la contraseña de la base (se salta la RLS): por eso no
--    hay política de INSERT. El cliente solo lee y borra lo suyo.
--
-- 2. CANAL ALT
--    La versión sin juego (mismo paquete, misma firma, mismos datos) se publica en
--    su propia tabla. NO es una columna `canal` en app_versions a propósito: las
--    versiones ≤ 1.0.25 piden "la fila con el version_code más alto" sin filtrar,
--    y con dos filas por versión podrían ofrecerle el APK alt a quien no lo pidió.
-- =============================================================================

alter table public.profiles
  add column if not exists resumen_ia boolean not null default false;

create table if not exists public.resumenes (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  desde       date not null,
  hasta       date not null,
  texto       text not null check (char_length(texto) <= 6000),
  modelo      text not null default '',
  created_at  timestamptz not null default now()
);

create index if not exists resumenes_user_idx on public.resumenes (user_id, created_at desc);

alter table public.resumenes enable row level security;

drop policy if exists "leo mis resúmenes" on public.resumenes;
create policy "leo mis resúmenes"
  on public.resumenes for select to authenticated using (auth.uid() = user_id);

drop policy if exists "borro mis resúmenes" on public.resumenes;
create policy "borro mis resúmenes"
  on public.resumenes for delete to authenticated using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Versiones del canal alt. Misma forma que app_versions.
-- ---------------------------------------------------------------------------
create table if not exists public.app_versions_alt (
  version_code  int primary key,
  version_name  text not null,
  download_url  text not null,
  notes         text not null default '',
  mandatory     boolean not null default false,
  published_at  timestamptz not null default now()
);

alter table public.app_versions_alt enable row level security;

drop policy if exists "versiones alt visibles" on public.app_versions_alt;
create policy "versiones alt visibles"
  on public.app_versions_alt for select to anon, authenticated using (true);
