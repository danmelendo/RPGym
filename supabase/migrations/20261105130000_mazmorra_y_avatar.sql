-- =============================================================================
-- RPGym · Avatar y mazmorra en el perfil
--
-- Dos cosas que necesita ver un amigo:
--   · `avatar`: aspecto y equipo, para llevarte en su grupo con tus dados reales.
--   · Gloria, salas y mazmorras, para la clasificación entre amigos.
--
-- Son columnas de `profiles`, así que la política de SELECT y la de UPDATE que ya
-- existen las cubren: cada uno edita solo lo suyo. Ninguna lleva datos de salud.
-- El tope de tamaño es el mismo cinturón que tiene `atributos`.
-- =============================================================================

alter table public.profiles
  add column if not exists avatar          jsonb,
  add column if not exists gloria          int not null default 0,
  add column if not exists salas_superadas int not null default 0,
  add column if not exists mazmorras       int not null default 0,
  add column if not exists mejor_sala      int not null default 0;

alter table public.profiles drop constraint if exists profiles_avatar_pequeno;
alter table public.profiles add constraint profiles_avatar_pequeno
  check (avatar is null or pg_column_size(avatar) <= 800);

alter table public.profiles drop constraint if exists profiles_mazmorra_positivos;
alter table public.profiles add constraint profiles_mazmorra_positivos
  check (gloria >= 0 and salas_superadas >= 0 and mazmorras >= 0 and mejor_sala between 0 and 10);
