# TODO — siguiente paso inmediato

## 🔴 1. Aplicar la migración en Supabase (bloquea todo lo demás)

Es lo único pendiente para que la parte social funcione. **30 segundos.**

1. Entra en <https://supabase.com/dashboard/project/svmxsnvjjddxgolkjwjb/sql/new>
   (funciona igual desde el móvil, no hace falta ordenador).
2. Pega entero el contenido de
   [supabase/migrations/20260825000000_fase1_cuentas.sql](supabase/migrations/20260825000000_fase1_cuentas.sql).
3. **Run**.

Sabrás que ha ido bien porque en **Table Editor** aparecen `profiles`, `heartbeat`
y `app_versions`.

> **Por qué no se aplicó sola al conectar el repo**: la integración de GitHub que
> despliega migraciones va con *Branching*, que es de **plan de pago**. En el plan
> gratuito se aplican con el SQL Editor o con el CLI. El fichero ya está en
> `supabase/migrations/`, así que si algún día pasas a Pro se aplicará solo.

> **Qué credencial haría falta para aplicarlo en remoto** (por si vuelve a surgir):
> - ❌ **service_role key**: NO sirve. Solo se salta las RLS sobre tablas que ya
>   existen; no puede ejecutar DDL. No la compartas: es la más peligrosa y aquí no
>   aportaría nada.
> - ⚠️ **Contraseña de la base de datos** (cadena de conexión): sí serviría, vía un
>   cliente Postgres. Está acotada a esta base y se puede rotar después desde
>   *Project Settings → Database → Reset password*.
> - ⚠️ **Personal Access Token**: serviría vía Management API, pero da acceso a
>   **toda tu cuenta y todos tus proyectos**. Peor opción que la anterior.
>
> La anon key que ya está en `.env` es pública por diseño y no supone riesgo.

## 🟡 2. Después de aplicar la migración

- [ ] Probar el ciclo completo: registro con usuario único, intento de usuario
      duplicado, keep-alive (`heartbeat.pings` sube) y clasificación.
- [ ] Regenerar el APK **con** credenciales (`npm run apk`). Ojo: hasta ahora los APK
      se han generado sin `.env`, así que no llevaban nada de Supabase.
- [ ] Publicarlo como GitHub Release y registrar la versión en `app_versions`:
      ```bash
      gh release create v1.0.0 android/app/build/outputs/apk/debug/app-debug.apk \
        --title "RPGym 1.0.0" --notes "Primera versión con cuentas"
      ```
- [ ] Subir a la vez `APP_VERSION_CODE` en [src/App.jsx](src/App.jsx) y `versionCode`
      en [android/version.properties](android/version.properties). Si no coinciden,
      cada uno se verá a sí mismo como desactualizado.

## 🟠 3. Antes de repartirlo a los amigos

- [ ] **Reescribir `Ajustes → Privacidad`** en [src/App.jsx](src/App.jsx) y
      [public/privacidad.html](public/privacidad.html). Ahora mismo prometen que
      *"no se recoge, no se envía y no se comparte ningún dato"* y que *"no hay
      servidores, ni cuentas"*. Con la nube activada **eso es falso**, y es el texto
      que van a leer tus amigos.
- [ ] Decidir si dejas la confirmación por correo activada. Está **activada**: hay
      que abrir un correo antes de poder entrar. Para un grupo cerrado quizá
      prefieras *Authentication → Providers → Email → Confirm email* → desactivar.

## ⚪ 4. Fases siguientes (ver [ROADMAP-SOCIAL.md](ROADMAP-SOCIAL.md))

Sincronización de rutinas y entrenos → amigos por código de invitación → hacer la
rutina de un amigo → avisos → entrenar juntos.

---

## Deuda técnica anotada

- **La clasificación es confiable, no verificable.** Cada uno escribe su propio XP
  desde el móvil. Entre amigos es asumible; el arreglo (si molesta) está explicado al
  final de la migración: subir los entrenos y calcular la XP en el servidor.
- **Un solo fichero de ~5.200 líneas** ([src/App.jsx](src/App.jsx)). Funciona y está
  ordenado por secciones, pero es el candidato obvio a partir en módulos si sigue
  creciendo.
- **APK de 33 MB**, casi todo imágenes de ejercicios sin recomprimir (decisión
  consciente). `ffmpeg -q:v 7` recorta ~20% sin pérdida visible si algún día pesa.
