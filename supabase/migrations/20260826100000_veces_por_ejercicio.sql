-- =============================================================================
-- RPGym · Cuántas veces ha hecho cada ejercicio
--
-- La marca sola no dice cuál es "su ejercicio". Con el número de sesiones se
-- puede señalar el favorito de cada grupo en la ficha de un amigo, que es lo
-- que sirve para quedar a hacer el mismo ejercicio en pareja.
--
-- Sale del historial local (cuántas sesiones incluyen ese ejercicio) y se sube
-- junto a la marca. No añade detalle nuevo: es un contador.
-- =============================================================================

alter table public.exercise_records
  add column if not exists veces int not null default 0
  check (veces >= 0 and veces <= 100000);
