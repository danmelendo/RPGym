# TODO — siguiente paso inmediato

## 🟡 1. Traducir los correos (están en inglés)

Los correos de confirmación llegan con la plantilla por defecto de Supabase, en inglés
(*"Confirm your email address"*), en una app que está entera en español. Es lo primero
que van a ver tus amigos.

Ya están escritas en [supabase/email-templates/](supabase/email-templates/): solo hay
que pegarlas en *Authentication → Email Templates*.

| Plantilla de Supabase | Fichero | Asunto sugerido |
|---|---|---|
| Confirm signup | `confirmar-registro.html` | Confirma tu cuenta de RPGym |
| Reset password | `restablecer-contrasena.html` | Restablece tu contraseña de RPGym |
| Change Email Address | `cambiar-correo.html` | Confirma tu nuevo correo de RPGym |
| Magic Link | `enlace-magico.html` | Entra en RPGym |

## 🟡 2. Compilar y repartir

- [ ] `npm run apk` (ahora sí con `.env`, así que llevará la nube activa).
- [ ] Probarlo en el móvil: registro real y clasificación.
- [ ] Publicarlo como GitHub Release y registrar la versión en `app_versions`:
      ```bash
      gh release create v1.0.0 android/app/build/outputs/apk/debug/app-debug.apk         --title "RPGym 1.0.0" --notes "Primera versión con cuentas"
      ```
- [ ] Subir a la vez `APP_VERSION_CODE` en [src/App.jsx](src/App.jsx) y `versionCode`
      en [android/version.properties](android/version.properties).

## 🟠 3. Higiene pendiente

- [ ] **Rotar la contraseña de la base de datos**: se compartió por chat para aplicar la
      migración. *Settings → Database → Reset password*. La app **no la usa** (solo la
      anon key), así que rotarla no rompe nada.

## 🔵 4. Higiene de credenciales

En `.env` (ignorado por git) conviven ahora públicas y secretas. **Regla: el prefijo
`VITE_` hace que Vite incruste la variable dentro del APK.**

| Variable | Prefijo | Dónde acaba |
|---|---|---|
| `VITE_SUPABASE_URL` | `VITE_` | Dentro del APK — correcto, es pública |
| `VITE_SUPABASE_ANON_KEY` | `VITE_` | Dentro del APK — correcto, es pública |
| `SUPABASE_DB_PASSWORD` | sin prefijo | Solo en este PC |
| `SUPABASE_SECRET_KEY` | sin prefijo | Solo en este PC |

Si añades un secreto, **nunca** le pongas `VITE_` delante.

## ⚪ 5. Fases siguientes (ver [ROADMAP-SOCIAL.md](ROADMAP-SOCIAL.md))

Sincronización de rutinas y entrenos → amigos por código de invitación → hacer la
rutina de un amigo → avisos → entrenar juntos.

---

## ✅ Hecho

- **Clasificaciones semanal, mensual e histórica** (tabla `workout_points`: solo fecha
  y XP por entreno, sin detalle) y **saludos** reescritos sin épica medieval.
- **Amigos por código de invitación** de 6 caracteres, compartible por WhatsApp.
  Verificado con tres usuarios: dos se hacen amigos, el tercero queda fuera de sus
  clasificaciones. Probado que nadie puede autoañadirse como amigo (no hay política
  de INSERT: solo la función de canje), ni listar códigos o amistades ajenas, ni
  canjear su propio código.

- **SMTP de Brevo funcionando de punta a punta**: alta real, correo de confirmación
  entregado **en bandeja de entrada, no en spam** (Brevo reescribe el remitente a su
  propio dominio, así que no hay conflicto de DMARC con gmail.com).
- **Ciclo completo verificado** contra el proyecto real: alta → confirmación → login →
  reserva de nombre → keep-alive → clasificación. Los dos Danieles funcionan: el segundo
  es rechazado y entra como `@daniel2`. Un usuario **no puede** editar el perfil de otro
  (RLS). Cuentas de prueba borradas: la base quedó en 0 perfiles y 0 usuarios.
- **Texto de privacidad reescrito** ([public/privacidad.html](public/privacidad.html) y
  `Ajustes → Privacidad`): ahora dice la verdad sobre la cuenta opcional, qué se sube,
  qué no sale nunca del móvil, y que Supabase (Alemania) y Brevo son los proveedores.

- Migración de la fase 1 **aplicada** en `svmxsnvjjddxgolkjwjb` (eu-central-1,
  PostgreSQL 17.6) y registrada en `supabase_migrations.schema_migrations`.
- `profiles`, `heartbeat`, `app_versions` y la vista `leaderboard` creadas, con RLS
  activa en las tres tablas.
- **Fallo de seguridad corregido**: `ping()` se podía llamar sin sesión. Postgres
  concede `EXECUTE` a `PUBLIC` por defecto, así que `grant ... to authenticated` no
  restringía nada; hacía falta `revoke ... from public, anon` primero.
- Verificado con la clave pública que un anónimo **no** puede leer perfiles, crear
  perfiles falsos, escribir versiones de app ni llamar a `ping()`.
- Verificado el caso de los dos Danieles: mismo handle rechazado, `@DANIEL` rechazado,
  handles con espacios o demasiado cortos rechazados, `@daniel2` aceptado. Todo en una
  transacción revertida: la base sigue con 0 perfiles y 0 usuarios.

---

## Deuda técnica anotada

- **La clasificación es confiable, no verificable.** Cada uno escribe su propio XP
  desde el móvil. Entre amigos es asumible; el arreglo está explicado al final de la
  migración: subir los entrenos y calcular la XP en el servidor.
- **Un solo fichero de ~5.200 líneas** ([src/App.jsx](src/App.jsx)).
- **APK de 33 MB**, casi todo imágenes sin recomprimir (decisión consciente).
