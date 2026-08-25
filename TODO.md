# TODO — siguiente paso inmediato

## 🔴 1. Desactivar la confirmación por correo (bloquea el registro)

**El registro está roto ahora mismo**, y no por un fallo del código: con *Confirm
email* activado, Supabase manda un correo por cada alta y el SMTP gratuito tiene un
límite muy bajo (2-3 por hora). Al probarlo saltó `over_email_send_rate_limit` a la
segunda alta. Registrando a varios amigos seguidos, os quedaríais fuera.

**Arreglo (1 clic, desde el móvil vale):**
<https://supabase.com/dashboard/project/svmxsnvjjddxgolkjwjb/auth/providers>
→ Email → **Confirm email: OFF**.

Sin confirmación, el alta devuelve sesión al instante, no se manda ningún correo y no
hay límite. Para un grupo cerrado es lo razonable. El código ya soporta las dos
opciones, así que no hay que tocar nada.

> Si prefieres mantener la confirmación, la alternativa es configurar un SMTP propio
> (*Authentication → SMTP Settings*), pero es bastante más trabajo.

## 🟡 2. Después

- [ ] Registrar tu usuario real y comprobar que sales en la clasificación.
- [ ] Regenerar el APK **con** credenciales (`npm run apk`) y probarlo en el móvil.
- [ ] Publicarlo como GitHub Release y registrar la versión en `app_versions`:
      ```bash
      gh release create v1.0.0 android/app/build/outputs/apk/debug/app-debug.apk         --title "RPGym 1.0.0" --notes "Primera versión con cuentas"
      ```
- [ ] Subir a la vez `APP_VERSION_CODE` en [src/App.jsx](src/App.jsx) y `versionCode`
      en [android/version.properties](android/version.properties).

## 🟠 3. Antes de repartirlo a los amigos

- [ ] **Reescribir `Ajustes → Privacidad`** en [src/App.jsx](src/App.jsx) y
      [public/privacidad.html](public/privacidad.html). Prometen que *"no se recoge, no
      se envía y no se comparte ningún dato"* y que *"no hay servidores, ni cuentas"*.
      Con la nube activa **es falso**, y es lo que van a leer tus amigos.
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
