-- =============================================================================
-- RPGym · Publicar la versión 1.0.19 en `app_versions`
--
-- Misma mecánica que 20260831000000_version_1_0_18.sql: esta fila es lo que
-- enciende el aviso de "hay versión nueva" dentro de la app.
-- =============================================================================

insert into public.app_versions (version_code, version_name, download_url, notes, mandatory)
values (
  20,
  '1.0.19',
  'https://github.com/danmelendo/RPGym/releases/download/v1.0.19/RPGym-1.0.19.apk',
  'Si el móvil cierra la app a mitad del entreno ya no pierdes las series, y se corrigen las demostraciones de cuatro ejercicios y los datos de la bici reclinada',
  false
)
on conflict (version_code) do update
  set version_name = excluded.version_name,
      download_url = excluded.download_url,
      notes        = excluded.notes,
      mandatory    = excluded.mandatory;
