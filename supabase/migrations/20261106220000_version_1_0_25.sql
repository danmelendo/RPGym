-- =============================================================================
-- RPGym · Publicar la versión 1.0.25 en `app_versions`
--
-- Sin esta fila, quien ya tiene la app instalada no ve el aviso de versión nueva.
-- Ver 20260831000000_version_1_0_18.sql para el porqué de hacerlo como migración.
-- =============================================================================

insert into public.app_versions (version_code, version_name, download_url, notes, mandatory)
values (
  26,
  '1.0.25',
  'https://github.com/danmelendo/RPGym/releases/download/v1.0.25/RPGym-1.0.25.apk',
  'Tu héroe entrena en las máquinas del gimnasio. Hay cuatro ejercicios nuevos, y en el jalón puedes cambiar entre agarre abierto y cerrado en cada serie, con su peso y sus marcas.',
  false
)
on conflict (version_code) do update
  set version_name = excluded.version_name,
      download_url = excluded.download_url,
      notes        = excluded.notes,
      mandatory    = excluded.mandatory;
