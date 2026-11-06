-- =============================================================================
-- RPGym · Publicar la versión 1.0.23 en `app_versions`
--
-- Sin esta fila, quien ya tiene la app instalada no ve el aviso de versión nueva.
-- Ver 20260831000000_version_1_0_18.sql para el porqué de hacerlo como migración.
-- =============================================================================

insert into public.app_versions (version_code, version_name, download_url, notes, mandatory)
values (
  24,
  '1.0.23',
  'https://github.com/danmelendo/RPGym/releases/download/v1.0.23/RPGym-1.0.23.apk',
  'Amigos ya tiene su pestaña, con toda la gente de RPGym para buscar. En la mazmorra tu héroe evoluciona por 30 clases con sinergias, eliges tus especiales y el combate va animado.',
  false
)
on conflict (version_code) do update
  set version_name = excluded.version_name,
      download_url = excluded.download_url,
      notes        = excluded.notes,
      mandatory    = excluded.mandatory;
