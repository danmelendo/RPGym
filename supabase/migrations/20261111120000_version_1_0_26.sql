-- =============================================================================
-- RPGym · Publicar la versión 1.0.26 en los DOS canales
--
-- Desde la 1.0.26 cada versión sale dos veces: la RPG en `app_versions` y la
-- versión sin juego en `app_versions_alt`. Sin estas filas, quien ya tiene la
-- app instalada no ve el aviso de versión nueva. Ver
-- 20260831000000_version_1_0_18.sql para el porqué de hacerlo como migración.
-- =============================================================================

insert into public.app_versions (version_code, version_name, download_url, notes, mandatory)
values (
  27,
  '1.0.26',
  'https://github.com/danmelendo/RPGym/releases/download/v1.0.26/RPGym-1.0.26.apk',
  'Resumen de tus dos semanas con recomendaciones (actívalo en Ajustes → Privacidad), una versión sin juego que puedes elegir en Ajustes → Perfil, y tus máquinas con el nombre que pone en ellas.',
  false
)
on conflict (version_code) do update
  set version_name = excluded.version_name,
      download_url = excluded.download_url,
      notes        = excluded.notes,
      mandatory    = excluded.mandatory;

insert into public.app_versions_alt (version_code, version_name, download_url, notes, mandatory)
values (
  27,
  '1.0.26',
  'https://github.com/danmelendo/RPGym/releases/download/v1.0.26/RPGym-Alt-1.0.26.apk',
  'La versión sin juego: solo entrenos, rutinas y progreso. Instálala encima y conservas todo. Trae también el resumen de tus dos semanas (Ajustes → Privacidad) y tus máquinas con su nombre.',
  false
)
on conflict (version_code) do update
  set version_name = excluded.version_name,
      download_url = excluded.download_url,
      notes        = excluded.notes,
      mandatory    = excluded.mandatory;
