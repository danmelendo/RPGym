# Notificaciones push con Firebase

> **Estado a 26/08/2026**: pasos 1, 2 y 4 hechos. El proyecto es `rpgym-36f9e`, el
> plugin está instalado y el APK ya lleva Firebase dentro. **Falta el paso 3**:
> desplegar la Edge Function, que necesita entrar con tu cuenta de Supabase.
> Mientras no esté, la app funciona igual y los avisos siguen siendo los locales.

## 1. Crear el proyecto de Firebase ✅

1. <https://console.firebase.google.com> → **Añadir proyecto** → nómbralo `RPGym`.
   Puedes desactivar Google Analytics: no hace falta.
2. Dentro, **Añadir app → Android**:
   - **Nombre del paquete**: `app.melendo.forjahabito` — tiene que ser exactamente
     ese, es el `applicationId` de la app.
   - Apodo: RPGym.
3. Descarga el **`google-services.json`** y déjalo en `android/app/google-services.json`.

## 2. Sacar la cuenta de servicio ✅

**Configuración del proyecto → Cuentas de servicio → Generar nueva clave privada**.
Se descarga un JSON con un nombre largo, tipo
`rpgym-36f9e-firebase-adminsdk-fbsvc-xxxxxxxx.json`.

### Son DOS ficheros distintos y es fácil confundirlos

| Fichero | Qué es | Dónde va |
|---|---|---|
| `google-services.json` | Identifica la app ante Firebase. **No** da permiso para enviar nada. | **Dentro del proyecto**: `android/app/google-services.json`. Viaja en el APK. |
| `…firebase-adminsdk-….json` | La llave para **enviar** notificaciones a cualquiera de tus usuarios. | **Fuera de la app**: sus valores van como secretos de Supabase. No se compila nunca. |

El segundo no lo usa nadie en el móvil: aunque el navegador lo descargue en
`android/app/`, ahí solo está de paso. Los dos están en `.gitignore` para que no
acaben en GitHub, que es público.

De ese JSON salen tres valores:

| Del JSON | Secreto de Supabase |
|---|---|
| `project_id` | `FIREBASE_PROJECT_ID` |
| `client_email` | `FIREBASE_CLIENT_EMAIL` |
| `private_key` | `FIREBASE_PRIVATE_KEY` |

## 3. Desplegar la función que envía ⏳ PENDIENTE

La clave privada lleva saltos de línea, y pelearse con las comillas en la consola
de Windows es una fuente de errores tonta. Por eso los tres valores van en un
fichero, `supabase/.env.firebase` (ignorado por git), **que ya está generado**
a partir de tu JSON. Si alguna vez hay que rehacerlo:

```bash
node -e "const fs=require('fs'),j=require('./android/app/TU-adminsdk.json');fs.writeFileSync('supabase/.env.firebase',['FIREBASE_PROJECT_ID='+j.project_id,'FIREBASE_CLIENT_EMAIL='+j.client_email,'FIREBASE_PRIVATE_KEY=\"'+j.private_key.replace(/\n/g,'\\n')+'\"',''].join('\n'))"
```

Con eso hecho, cuatro órdenes:

```bash
npx supabase login                                     # abre el navegador
npx supabase link --project-ref svmxsnvjjddxgolkjwjb
npx supabase secrets set --env-file supabase/.env.firebase
npx supabase functions deploy avisar
```

**`login` es el único paso que no se puede automatizar**: hay que autorizar en el
navegador. Si prefieres no hacerlo a mano, crea un token en
<https://supabase.com/dashboard/account/tokens> y expórtalo:

```bash
export SUPABASE_ACCESS_TOKEN=sbp_...     # en PowerShell: $env:SUPABASE_ACCESS_TOKEN="sbp_..."
```

Con el token puesto, `link`, `secrets set` y `functions deploy` van solos.

Para comprobar que quedó bien:

```bash
npx supabase secrets list       # deben salir los tres FIREBASE_*
npx supabase functions list     # avisar, desplegada
```

Mientras la función no esté desplegada, la app la llama y recibe un error de CORS
que **se traga sin romper nada**: `avisarAmigos` es "manda y olvida". Se ve en la
consola del navegador y es normal.

## 4. Compilar ✅

```bash
npm run apk
```

Capacitor detecta `google-services.json` y engancha el plugin solo. El APK engorda
unos 3,5 MB: es Google Play Services entrando en la app.

## Cuándo avisa

| Situación | Aviso a tus amigos |
|---|---|
| Empiezas un entreno | *"X está entrenando ahora"* |
| Bates un récord | *"X acaba de batir un récord"* |
| Superas la marca de un amigo | *"X te ha superado en press banca"* |
| Propones una quedada | *"X ha propuesto quedar para entrenar"* |
| Te mandan una rutina o una solicitud de amistad | va a la campana de Inicio |

Con la app abierta Android no las muestra: se enseñan como aviso dentro de la app.

## Lo que esto cambia

Entra **Google Play Services** en la app: unos MB más de APK y una dependencia de
Google en algo que hasta ahora no llamaba a nadie salvo a tu Supabase. Es el precio
del push real y estaba avisado en [ROADMAP-SOCIAL.md](../ROADMAP-SOCIAL.md) §0.3.

## Si algo va mal

- **La app se cierra al abrir** → falta `google-services.json` con el plugin
  instalado. Es el crash de la 1.0.1: `FirebaseMessaging.getInstance()` revienta
  sin ese fichero. La bandera `__PUSH_CONFIGURADO__` de `vite.config.js` existe
  justo para que no pueda volver a pasar.
- **No llegan avisos pero la app va bien** → la función no está desplegada, o los
  secretos no están puestos. `npx supabase functions list` lo dice.
- **Nadie recibe nada aunque la función esté** → hace falta conceder el permiso de
  notificaciones en Android 13+, y que el token se haya guardado (tabla
  `push_tokens`).
