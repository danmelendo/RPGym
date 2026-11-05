-- =============================================================================
-- RPGym · Publicar la versión 1.0.20 en `app_versions`
--
-- Sin esta fila, quien ya tiene la app instalada no ve el aviso de versión nueva.
-- Ver 20260831000000_version_1_0_18.sql para el porqué de hacerlo como migración.
-- =============================================================================

insert into public.app_versions (version_code, version_name, download_url, notes, mandatory)
values (
  21,
  '1.0.20',
  'https://github.com/danmelendo/RPGym/releases/download/v1.0.20/RPGym-1.0.20.apk',
  'Nuevo aspecto pixel RPG con LEVEL UP, EXTRA LIFE y GAME OVER, desglose de cada entreno en el calendario, y añadir series y ejercicios sin salir del entreno',
  false
)
on conflict (version_code) do update
  set version_name = excluded.version_name,
      download_url = excluded.download_url,
      notes        = excluded.notes,
      mandatory    = excluded.mandatory;
