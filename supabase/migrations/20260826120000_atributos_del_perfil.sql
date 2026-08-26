-- =============================================================================
-- RPGym · XP por atributo en el perfil
--
-- Los niveles de Pecho, Espalda, Piernas… se calculan en el móvil a partir de
-- state.muscleXp, que nunca salía de ahí. Por eso la ficha de un amigo solo
-- podía enseñar "qué ejercicios ha marcado", no su nivel en cada atributo.
--
-- Se sube el XP en crudo (un número por grupo), no el nivel: la escala
-- (catLevel) puede cambiar con el tiempo y así el receptor la recalcula con
-- SU versión de la app en vez de heredar la del otro.
-- =============================================================================

alter table public.profiles
  add column if not exists atributos jsonb not null default '{}'::jsonb;

-- Tope de tamaño: son 7 claves con un número. Sin esto, el campo es una puerta
-- abierta a meter cualquier cosa en un sitio que todo el mundo puede leer.
alter table public.profiles drop constraint if exists profiles_atributos_pequenos;
alter table public.profiles add constraint profiles_atributos_pequenos
  check (pg_column_size(atributos) <= 400);
