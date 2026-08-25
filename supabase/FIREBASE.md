# Notificaciones push con Firebase

Todo el lado de la app está escrito. Falta lo que solo puedes hacer tú: crear el
proyecto de Firebase y dar dos ficheros. **Mientras no lo hagas, la app funciona
igual**: el plugin no existe, `pushDisponible()` devuelve `false` y los avisos
siguen siendo los locales al abrir.

## 1. Crear el proyecto de Firebase

1. <https://console.firebase.google.com> → **Añadir proyecto** → nómbralo `RPGym`.
   Puedes desactivar Google Analytics: no hace falta.
2. Dentro, **Añadir app → Android**:
   - **Nombre del paquete**: `app.melendo.forjahabito` — tiene que ser exactamente
     ese, es el `applicationId` de la app.
   - Apodo: RPGym.
3. Descarga el **`google-services.json`** y déjalo en `android/app/google-services.json`.
   Ese fichero **no es secreto** (identifica la app, no da permisos de envío), pero
   está en `.gitignore` por si acaso.

## 2. Sacar la cuenta de servicio (esto SÍ es secreto)

**Configuración del proyecto → Cuentas de servicio → Generar nueva clave privada**.
Se descarga un JSON. De ahí salen tres valores:

| Del JSON | Secreto de Supabase |
|---|---|
| `project_id` | `FIREBASE_PROJECT_ID` |
| `client_email` | `FIREBASE_CLIENT_EMAIL` |
| `private_key` | `FIREBASE_PRIVATE_KEY` |

> Esa clave permite mandar notificaciones a cualquiera de tus usuarios. **Nunca**
> va dentro del APK: vive solo en la Edge Function.

## 3. Desplegar la función que envía

```bash
npx supabase login
npx supabase link --project-ref svmxsnvjjddxgolkjwjb
npx supabase secrets set FIREBASE_PROJECT_ID=...
npx supabase secrets set FIREBASE_CLIENT_EMAIL=...
npx supabase secrets set FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMII...\n-----END PRIVATE KEY-----\n"
npx supabase functions deploy avisar
```

## 4. Compilar

```bash
npm run apk
```

Capacitor detecta `google-services.json` y engancha el plugin solo.

## Cuándo avisa

| Situación | Aviso a tus amigos |
|---|---|
| Empiezas un entreno | *"X está entrenando ahora"* |
| Bates un récord | *"X acaba de batir un récord"* |
| Superas la marca de un amigo | *"X te ha superado en press banca"* |
| Propones una quedada | *"X ha propuesto quedar para entrenar"* |

Con la app abierta Android no las muestra: se enseñan como aviso dentro de la app.

## Lo que esto cambia

Entra **Google Play Services** en la app: unos MB más de APK y una dependencia de
Google en algo que hasta ahora no llamaba a nadie salvo a tu Supabase. Es el precio
del push real y estaba avisado en [ROADMAP-SOCIAL.md](../ROADMAP-SOCIAL.md) §0.3.
