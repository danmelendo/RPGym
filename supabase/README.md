# Puesta en marcha de Supabase (fase 1)

Todo lo de la app ya está escrito. Falta lo que solo puedes hacer tú, que es crear el
proyecto y pegar dos valores. **Mientras no lo hagas, la app compila y funciona 100% en
local, exactamente como antes: ni siquiera aparece el botón de cuenta.**

---

## 1. Crear el proyecto

1. [supabase.com](https://supabase.com) → nuevo proyecto.
2. **Región: Europa** (Frankfurt o Londres). Cuesta lo mismo y evita mover datos de
   entrenamiento fuera de la UE.
3. Guarda la contraseña de la base de datos donde no se pierda.

## 2. Crear las tablas

Copia [schema.sql](schema.sql) entero → **SQL Editor** → **Run**.

Es idempotente: puedes volver a ejecutarlo sin romper nada. Crea `profiles`,
`heartbeat`, `app_versions`, la vista `leaderboard` y **todas las políticas RLS**.

## 3. Ajustar el login

**Authentication → Providers → Email**:

- Deja **Email** activado.
- **Confirm email**: si lo dejas activado, cada uno tendrá que abrir un correo antes de
  poder entrar (más seguro). Si lo desactivas, se entra al instante tras registrarse
  (más cómodo para un grupo cerrado). La app soporta las dos: con confirmación muestra
  *"Confirma el correo que te hemos mandado"* y crea el perfil en el primer login.

## 4. Pegar las credenciales

**Project Settings → API**, y con esos dos valores crea un fichero `.env` en la raíz del
proyecto (hay plantilla en `.env.example`):

```
VITE_SUPABASE_URL=https://xxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

- La **anon key** es pública por diseño: viaja dentro del APK. No pasa nada porque se vea,
  la seguridad son las políticas RLS.
- La **service_role key NO se pone aquí jamás**: esa sí es secreta y salta todas las RLS.
- `.env` está en `.gitignore`.

Luego `npm run apk` y ya aparece el botón de cuenta en Inicio.

> Detalle útil: si `.env` está vacío o no existe, **Vite elimina Supabase entero del
> bundle** (0 referencias, ~226 KB menos). O sea que la build local no arrastra nada.

## 5. Repartir el APK

> **Recomendado: GitHub Releases.** Desde que el repositorio es público
> (<https://github.com/danmelendo/RPGym>), publicar el APK como *release* es mejor que
> Storage: enlace directo sin autenticación, hasta 2 GB por fichero y **sin gastar la
> transferencia de Supabase**. La tabla `app_versions` funciona igual: en `download_url`
> pones la URL del release en vez de la de Storage.
>
> ```bash
> gh release create v1.1.0 android/app/build/outputs/apk/debug/app-debug.apk \
>   --title "RPGym 1.1.0" --notes "Máquinas nuevas y compartir rutinas"
> ```
>
> Y luego el `insert` de abajo con esa URL. **Ojo**: si algún día haces el repo privado,
> las descargas de releases pasan a pedir token y esto deja de servir — vuelve a Storage.

### Alternativa: Supabase Storage

El APK **no va en la base de datos** —el plan gratis da 500 MB y los backups se inflarían—
sino en **Storage**, que tiene 1 GB aparte:

1. **Storage → New bucket** → nombre `apk` → márcalo **Public**.
2. Sube `android/app/build/outputs/apk/debug/app-debug.apk`.
3. Copia su URL pública y registra la versión:

```sql
insert into public.app_versions (version_code, version_name, download_url, notes)
values (2, '1.1.0', 'https://xxxx.supabase.co/storage/v1/object/public/apk/app-debug.apk',
        'Máquinas nuevas y compartir rutinas');
```

4. Sube `APP_VERSION_CODE` en [src/App.jsx](../src/App.jsx) **y** `versionCode` en
   [android/version.properties](../android/version.properties) antes de compilar la
   siguiente. Si no, cada uno se verá a sí mismo como desactualizado.

Quien tenga una versión menor verá un aviso en Inicio con el enlace de descarga.
Android **no permite** que la app se actualice sola sin intervención: descarga el APK y
el usuario confirma la instalación. Eso es lo máximo que se puede hacer sin Play.

**Cuentas de transferencia**: 33 MB por descarga y 5 GB/mes gratis → unas 150 descargas
al mes. Para tu círculo, de sobra.

---

## Comprobaciones rápidas

Con el proyecto montado y `.env` puesto:

| Qué | Cómo se ve |
|---|---|
| Registro | Crea cuenta con un usuario tipo `dani` → aparece @dani y sales en la clasificación. |
| Usuario duplicado | Intenta registrar otro `dani` → *"Ese nombre de usuario ya está cogido"*. |
| Keep-alive | En **Table Editor → heartbeat**, `pings` sube cada vez que alguien abre la app. |
| Sin red | Modo avión → la app entrena igual; al entrar en Cuenta avisa de que no hay conexión. |

## Lo que NO sube al servidor

Peso, altura, edad, medidas, ciclo menstrual, dieta, rutinas y entrenos detallados: **todo
eso sigue solo en el móvil**. A `profiles` solo van nombre, usuario, nivel, XP, número de
entrenos, mejor racha y versión de app — lo justo para la clasificación.
