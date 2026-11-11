-- Publica la 1.0.27 en los dos canales: enciende el aviso de "hay versión nueva".
insert into public.app_versions (version_code, version_name, download_url, notes, mandatory)
values (28, '1.0.27', 'https://github.com/danmelendo/RPGym/releases/download/v1.0.27/RPGym-1.0.27.apk',
        'Entrenar en casa con kettlebell, gomas y tonificador, rutina Casa con material e informe quincenal con todos tus resúmenes.', false)
on conflict (version_code) do update set version_name=excluded.version_name, download_url=excluded.download_url, notes=excluded.notes, mandatory=excluded.mandatory;

insert into public.app_versions_alt (version_code, version_name, download_url, notes, mandatory)
values (28, '1.0.27', 'https://github.com/danmelendo/RPGym/releases/download/v1.0.27/RPGym-Alt-1.0.27.apk',
        'Entrenar en casa con kettlebell, gomas y tonificador, rutina Casa con material e informe quincenal con todos tus resúmenes.', false)
on conflict (version_code) do update set version_name=excluded.version_name, download_url=excluded.download_url, notes=excluded.notes, mandatory=excluded.mandatory;
