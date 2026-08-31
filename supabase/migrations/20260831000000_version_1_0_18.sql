-- =============================================================================
-- RPGym · Publicar la versión 1.0.18 en `app_versions`
--
-- La app pregunta por la fila de mayor `version_code` (`cloud.versionMasNueva`)
-- y, si es más alta que la suya, enseña el aviso de "hay versión nueva" con el
-- enlace de descarga. Sin esta fila, quien ya tiene la app instalada no se
-- entera de la actualización: tendría que pasarse por las releases a mano.
--
-- Va como migración a propósito: publicar una versión es parte del despliegue y
-- así queda en el repositorio junto al código que describe. `on conflict` la
-- deja repetible, que es lo que se le pide a una migración.
--
-- Los acentos de `notes` se ven en el aviso dentro de la app, así que el fichero
-- es UTF-8 y el CLI lo manda tal cual. Para comprobar que llegaron bien, lee la
-- fila forzando la codificación (`encoding="utf-8"`): la consola de Windows
-- decodifica en cp1252 y hace creer que hay mojibake donde no lo hay.
-- =============================================================================

insert into public.app_versions (version_code, version_name, download_url, notes, mandatory)
values (
  19,
  '1.0.18',
  'https://github.com/danmelendo/RPGym/releases/download/v1.0.18/RPGym-1.0.18.apk',
  'Informe semanal de tu semana, el cheat day pasa a ser un día de descanso que resta una sesión, y vacaciones que no rompen la racha',
  false
)
on conflict (version_code) do update
  set version_name = excluded.version_name,
      download_url = excluded.download_url,
      notes        = excluded.notes,
      mandatory    = excluded.mandatory;
