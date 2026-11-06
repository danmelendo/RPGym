-- =============================================================================
-- RPGym · Publicar la versión 1.0.24 en `app_versions`
--
-- Sin esta fila, quien ya tiene la app instalada no ve el aviso de versión nueva.
-- Ver 20260831000000_version_1_0_18.sql para el porqué de hacerlo como migración.
-- =============================================================================

insert into public.app_versions (version_code, version_name, download_url, notes, mandatory)
values (
  25,
  '1.0.24',
  'https://github.com/danmelendo/RPGym/releases/download/v1.0.24/RPGym-1.0.24.apk',
  'Tu héroe hace contigo el ejercicio que toca. La mazmorra tiene tres zonas con su fondo y un paso animado entre salas, y hay 18 logros nuevos. Tus amigos salen en tarjetas con su héroe entero.',
  false
)
on conflict (version_code) do update
  set version_name = excluded.version_name,
      download_url = excluded.download_url,
      notes        = excluded.notes,
      mandatory    = excluded.mandatory;
