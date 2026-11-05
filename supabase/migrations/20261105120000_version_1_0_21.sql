-- =============================================================================
-- RPGym · Publicar la versión 1.0.21 en `app_versions`
--
-- Sin esta fila, quien ya tiene la app instalada no ve el aviso de versión nueva.
-- Ver 20260831000000_version_1_0_18.sql para el porqué de hacerlo como migración.
-- =============================================================================

insert into public.app_versions (version_code, version_name, download_url, notes, mandatory)
values (
  22,
  '1.0.21',
  'https://github.com/danmelendo/RPGym/releases/download/v1.0.21/RPGym-1.0.21.apk',
  'Crea tu héroe y gana armaduras según cómo entrenes. Nuevo fondo de gimnasio, minijuego en el descanso, y arreglados el aviso de actualización y la copia en la nube.',
  false
)
on conflict (version_code) do update
  set version_name = excluded.version_name,
      download_url = excluded.download_url,
      notes        = excluded.notes,
      mandatory    = excluded.mandatory;
