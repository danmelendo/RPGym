# TODO — siguiente paso inmediato

## 🔴 0. Volver a crear la cuenta de la nube

Limpiando datos de prueba se borró por error `danmelendo@gmail.com` (`@atletap5vn6`),
que estaba vacía: 0 entrenos, 0 récords, 0 amigos. **El progreso del móvil no se
tocó** (vive en local). Solo hay que registrarse otra vez desde la app — y ya de paso
elegir un nombre de usuario decente en vez del generado. El script culpable
(`scratchpad/dbtool/limpiar.js`) borraba `auth.users` entera; ya está acotado a las
direcciones de prueba con `+`.

## 🟡 1. Firebase, para el push real

El cableado del servidor está hecho (Edge Function `avisar`, tabla de tokens), pero
**el plugin de push está desinstalado** desde la 1.0.2: sin `google-services.json`
tumbaba la app al arrancar. Para reactivarlo, por orden:

1. Crear el proyecto de Firebase y bajar `google-services.json` a `android/app/`
   (pasos en **[supabase/FIREBASE.md](supabase/FIREBASE.md)**).
2. `npm i @capacitor/push-notifications@^7 && npx cap sync android`.
3. Comprobar que el build dice que el push queda **activado** (si sigue diciendo
   `[push] sin google-services.json`, el fichero no está donde toca).

Sin ello la app funciona igual, con los avisos locales al abrir.

## 🟡 2. Traducir los correos de Supabase

Siguen llegando en inglés. Las plantillas en español están escritas en
[supabase/email-templates/](supabase/email-templates/): solo hay que pegarlas en
*Authentication → Email Templates*.

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

La `SUPABASE_SECRET_KEY` ya **no** está en `.env`. Para administrar se usa la conexión
directa a Postgres con la contraseña de la base, que es menos llave maestra que la
secret key.

Si añades un secreto, **nunca** le pongas `VITE_` delante.

## ⚪ 5. Fases siguientes (ver [ROADMAP-SOCIAL.md](ROADMAP-SOCIAL.md))

Sincronización de rutinas y entrenos → amigos por código de invitación → hacer la
rutina de un amigo → avisos → entrenar juntos.

---

## ✅ Hecho

- **v1.0.0 PUBLICADA**: <https://github.com/danmelendo/RPGym/releases/tag/v1.0.0>
  (36 MB). Registrada en `app_versions`, así que el aviso de actualización ya
  funciona para las siguientes.

- **ROADMAP SOCIAL COMPLETO**: las seis fases implementadas y verificadas contra el
  proyecto real. Ocho migraciones aplicadas, todas con RLS atacada desde fuera.
- **Entreno conjunto**: ves quién entrena ahora, te unes, y +60 XP si había alguien más.
- **Copia cifrada en el móvil**: el servidor guarda bytes que no puede leer.

- **Nombres de ejercicios revisados**: corregidas traducciones literales ("elevación de
  gemelos" → "elevación de talones", que es el movimiento; "gemelos" es el músculo) y
  deshechos los nombres con barra que mezclaban dos ejercicios. Con migración
  automática: nadie pierde marcas al actualizar.

- **Quedadas con "Yo voy"**: proponer día/hora/sitio, contestar, ver quién va y
  cancelar. Tarjeta de la próxima en Inicio. Verificado que un extraño no ve las
  quedadas del círculo ni puede apuntarse, y que nadie contesta por otro.
- **Rutinas de amigos**: publicar con interruptor explícito, copiarlas y +75 XP al
  estrenarlas.

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
