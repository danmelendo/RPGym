-- =============================================================================
-- RPGym · Publicar la versión 1.0.22 en `app_versions`
--
-- Sin esta fila, quien ya tiene la app instalada no ve el aviso de versión nueva.
-- Ver 20260831000000_version_1_0_18.sql para el porqué de hacerlo como migración.
-- =============================================================================

insert into public.app_versions (version_code, version_name, download_url, notes, mandatory)
values (
  23,
  '1.0.22',
  'https://github.com/danmelendo/RPGym/releases/download/v1.0.22/RPGym-1.0.22.apk',
  'Llega la mazmorra: un juego de dados contra tus malos hábitos, con tus amigos en el grupo y clasificación. Tu héroe es tan fuerte como lo que entrenas.',
  false
)
on conflict (version_code) do update
  set version_name = excluded.version_name,
      download_url = excluded.download_url,
      notes        = excluded.notes,
      mandatory    = excluded.mandatory;
