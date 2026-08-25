# Publicar RPGym en Google Play

Guía completa para pasar del APK de depuración (el que usan ahora tus betatesters)
a una app en Google Play que puedas ir actualizando sin que nadie pierda progreso.

---

## 0. Lo más importante: el cambio de APK a Play BORRA el progreso

Léelo antes de nada, porque afecta a tus testers actuales.

El APK que tienen instalado está firmado con la **clave de depuración**. La versión de
Play irá firmada con tu **clave de release**. Android no deja actualizar una app si
cambia la firma: al intentarlo da `INSTALL_FAILED_UPDATE_INCOMPATIBLE`. La única salida
es **desinstalar y volver a instalar**, y al desinstalar Android borra el
almacenamiento del WebView, que es exactamente donde vive todo el progreso
(nivel, XP, historial, récords, mediciones y ajustes).

**Esto ocurre UNA sola vez.** A partir de que estén en Play, las actualizaciones se
instalan encima y no se pierde nada.

### Cómo evitar que pierdan el progreso en ese salto

La app ya trae **copia de seguridad** en `Ajustes → Copia de seguridad`:

1. **Antes de desinstalar**, cada tester entra en Ajustes → Copia de seguridad → **Crear copia**.
2. Pulsa **Copiar al portapapeles** y se lo pega a sí mismo donde quiera
   (una nota, un WhatsApp a su propio chat, un correo). Es un texto JSON.
   *"Descargar archivo" funciona en el navegador; dentro de la app puede no hacer nada,
   por eso la vía recomendada es copiar y pegar.*
3. Desinstala el APK antiguo e instala la versión de Play.
4. Ajustes → Copia de seguridad → **Restaurar**, pega el texto y confirma.

> Avisa a tus testers **antes** de subir nada a Play. Si desinstalan sin copia, no hay
> forma de recuperar sus datos: no existe servidor, todo es local en el móvil.

Como red de seguridad adicional, el manifiesto ya tiene `android:allowBackup="true"`,
así que una vez estén en Play, Android puede restaurar los datos automáticamente al
reinstalar en un móvil con la misma cuenta de Google. Es "mejor esfuerzo", no una
garantía: la copia manual sigue siendo lo fiable.

---

## 1. Crear la clave de firma (solo una vez, y no la pierdas)

`keytool` viene con el JDK de Android Studio.

```bash
"C:/Program Files/Android/Android Studio/jbr/bin/keytool.exe" -genkeypair -v \
  -keystore C:/claves/rpgym.jks \
  -alias rpgym \
  -keyalg RSA -keysize 2048 -validity 10000
```

Te pedirá una contraseña y unos datos (nombre, organización, país). Apunta:

- la **ruta** del `.jks`
- la **contraseña del almacén** (`storePassword`)
- el **alias** (`keyAlias`)
- la **contraseña de la clave** (`keyPassword`, normalmente la misma)

> **Guarda el `.jks` y las contraseñas en un sitio seguro y con copia** (gestor de
> contraseñas + copia en la nube). Guárdalo **fuera** del repositorio.
> Con Play App Signing (paso 5) una pérdida es recuperable pidiendo un reseteo de la
> clave de subida, pero es un trámite que tarda días. Mejor no llegar ahí.

### Configurar el proyecto para que la use

```bash
cp android/keystore.properties.example android/keystore.properties
```

Y edítalo con tus datos reales:

```properties
storeFile=C:/claves/rpgym.jks
storePassword=tu_contraseña
keyAlias=rpgym
keyPassword=tu_contraseña
```

`android/keystore.properties` está en `.gitignore` — **nunca** lo subas al repositorio.
Si el fichero no existe, el build de release sigue funcionando pero sale **sin firmar**
(Play lo rechazaría).

---

## 2. Poner la versión

Edita [android/version.properties](android/version.properties):

```properties
versionCode=1
versionName=1.0.0
```

- `versionCode` — entero. **Tiene que subir en CADA subida a Play** (1 → 2 → 3…).
  No se puede repetir ni bajar. Es el error más habitual al publicar una actualización.
- `versionName` — el texto que ve el usuario en la ficha de Play. Libre.

---

## 3. Generar el AAB

Google Play ya no acepta APK para apps nuevas: hay que subir un **Android App Bundle** (`.aab`).

```bash
npm run bundle
```

Equivale a `vite build` + `cap sync android` + `gradlew bundleRelease`.

Resultado → `android/app/build/outputs/bundle/release/app-release.aab`

Para comprobar que ha salido firmado:

```bash
"C:/Program Files/Android/Android Studio/jbr/bin/keytool.exe" \
  -printcert -jarfile android/app/build/outputs/bundle/release/app-release.aab
```

Debe mostrar tu certificado (no `CN=Android Debug`).

> `npm run apk:release` genera además un APK de release firmado, útil para probar en tu
> móvil la build exacta antes de subirla. Ojo: ese APK tiene la misma firma que la de
> Play, así que también obliga a desinstalar el APK de depuración.

---

## 4. Crear la cuenta de desarrollador

> **Este es tu cuello de botella.** La verificación de identidad puede tardar días, así que
> hazlo lo primero: el resto ya está preparado y esperando.

1. Entra en [Google Play Console](https://play.google.com/console) con tu cuenta de Google
   (usa la misma dirección que pongas como contacto en la política de privacidad).
2. Elige tipo de cuenta **Personal**.
3. Paga la **cuota única de 25 USD**.
4. Completa la **verificación de identidad**: documento de identidad, dirección y teléfono.
   El nombre debe coincidir con el del documento. Google no deja publicar hasta que esté
   verificada.
5. Rellena el **nombre público de desarrollador** (el que verán los usuarios bajo el título
   de la app) y el correo de contacto público.

> **Importante si es una cuenta personal** (no de empresa): Google exige que, antes de
> pasar a producción, hagas una **prueba cerrada con al menos 12 testers apuntados
> durante 14 días seguidos**. Tus betatesters valen perfectamente para eso. No aplica al
> canal de **prueba interna**, que es inmediato — por eso el plan de abajo empieza por ahí.
> Confirma el requisito exacto en tu Play Console, que Google lo va cambiando.

---

## 5. Crear la app y activar Play App Signing

1. Play Console → **Crear aplicación**.
2. Nombre, idioma por defecto (Español – España), tipo *Aplicación*, gratuita.
3. Al subir el primer AAB se activa **Play App Signing**: Google guarda la clave real de
   la app y tu `.jks` pasa a ser la **clave de subida**. Es lo recomendado y lo que hace
   recuperable una pérdida de clave.

---

## 6. Rellenar la ficha y los cuestionarios

> **Ya está todo escrito y generado en [store/](store/).** Abre
> **[store/FICHA-PLAY.md](store/FICHA-PLAY.md)**: tiene los textos listos para copiar y pegar
> (nombre, descripción breve y completa, notas de la versión) y las respuestas exactas a los
> tres cuestionarios. Los gráficos están en [store/icono-512.png](store/icono-512.png),
> [store/cabecera-1024x500.png](store/cabecera-1024x500.png) y [store/capturas/](store/capturas/).

Play no deja publicar hasta tenerlo todo en verde:

| Sección | Qué poner en esta app |
|---|---|
| **Ficha de Play Store** | Nombre, descripción breve y larga, icono 512×512, gráfico de cabecera 1024×500, y mínimo 2 capturas de móvil. |
| **Clasificación de contenido** | Cuestionario. App de fitness sin contenido sensible → clasificación para todos los públicos. |
| **Seguridad de los datos** | **No se recoge ni se comparte ningún dato.** Todo se guarda en el móvil, la app no tiene servidor ni analítica. Marca "los datos no salen del dispositivo". |
| **Público objetivo** | Mayores de 13 (o 18 si prefieres curarte en salud con el contenido de dieta). No marcar "dirigida a niños". |
| **Permisos sensibles** | Solo notificaciones y alarmas exactas, para los recordatorios. No requieren formulario de declaración. |
| **Política de privacidad** | **Obligatoria**, incluso sin recoger datos. Ya está escrita en [public/privacidad.html](public/privacidad.html): solo tienes que alojarla y pegar la URL. Ver abajo. |
| **App de salud** | Mantén visible el descargo de dietista que ya tiene la sección Dieta. Play es estricto con consejos de salud. |

### Dónde alojar la política de privacidad

El texto ya está listo en **[public/privacidad.html](public/privacidad.html)**: es un HTML
autocontenido (sin dependencias, se adapta a móvil y a tema claro/oscuro). Solo necesita
una URL pública, accesible **sin registro ni contraseña**. Opciones gratuitas:

- **GitHub Pages** — crea un repositorio público (p. ej. `rpgym-privacidad`), sube el fichero
  renombrado a `index.html`, y en *Settings → Pages* elige la rama `main`. Te queda
  `https://<usuario>.github.io/rpgym-privacidad/`.
- **Netlify Drop** — entra en [app.netlify.com/drop](https://app.netlify.com/drop) y arrastra
  una carpeta con el `index.html`. Da una URL al momento, sin cuenta de pago.
- **Cualquier hosting estático** que ya tengas.

Cuando tengas la URL, haz **dos** cosas:

1. Pégala en Play Console → *Contenido de la aplicación → Política de privacidad*.
2. Pégala en la constante `PRIVACY_URL` de [src/App.jsx](src/App.jsx). Con eso aparece el
   botón *"Leer la política de privacidad"* en `Ajustes → Privacidad`. Mientras esté vacía,
   Ajustes muestra solo el resumen (sin enlaces rotos), que también es válido.

> Revisa el contacto que aparece en la política antes de publicarla: ahora pone
> una dirección de correo tuya. Quedará visible en una página pública, así que
> conviene usar un alias dedicado y no tu correo principal.

---

## 7. Publicar para tus betatesters (prueba interna)

Es el canal más rápido: hasta 100 testers, disponible en minutos y **sin la espera de
revisión** de los otros canales.

1. Play Console → **Pruebas → Pruebas internas** → *Crear versión*.
2. Sube `app-release.aab`.
3. Escribe las notas de la versión.
4. En la pestaña **Testers**, crea una lista con los correos de Gmail de tus betatesters.
5. Copia el **enlace de participación** y pásaselo. Cada uno lo abre, acepta ser tester y
   ya puede instalar desde Play.

Recuérdales el paso 0: **copia de seguridad → desinstalar el APK viejo → instalar desde
Play → restaurar**.

---

## 8. Publicar actualizaciones (el día a día)

Este es el ciclo que querías, y a partir de aquí nadie pierde nada:

```bash
# 1. Sube versionCode (y versionName si quieres) en android/version.properties
# 2. Genera el bundle
npm run bundle
# 3. Play Console → Pruebas internas → Crear versión → subir el .aab → Lanzar
```

Los testers reciben la actualización desde Play, se instala encima de la anterior y
**el progreso se conserva**. Ya no hace falta desinstalar nunca más.

Cuando quieras pasar a producción: **Producción → Crear versión**, con el mismo AAB o uno
nuevo. La primera revisión de producción suele tardar de unos días a un par de semanas.

---

## 9. Cosas que pueden hacer que Play rechace el AAB

| Problema | Solución |
|---|---|
| `versionCode` repetido | Súbelo en [android/version.properties](android/version.properties). |
| AAB sin firmar | Falta `android/keystore.properties` o tiene datos mal. |
| **Target API level demasiado bajo** | Play obliga a apuntar a una API reciente y sube el listón cada año. Ahora mismo apuntas a **35**. Si te lo rechaza, sube `compileSdkVersion` y `targetSdkVersion` en [android/variables.gradle](android/variables.gradle), instala esa plataforma en el SDK Manager y recompila. |
| Falta política de privacidad | Publica la URL y ponla en la ficha. |
| Falta la URL de privacidad | Ver §6 y §10. |

### Nota sobre el nombre

El nombre de la app es **RPGym**, ya unificado en todo el proyecto (`strings.xml`,
`capacitor.config.json`, `package.json`, la UI y la documentación). Usa exactamente
"RPGym" también en la ficha de Play.

El **`applicationId` sigue siendo `app.melendo.forjahabito`** y no debe cambiarse: es el
identificador permanente del paquete, no lo ve el usuario, y una vez publicado en Play
**no se puede modificar** (sería otra app distinta). El nombre antiguo asomando ahí es
inofensivo.

---

## Resumen de comandos

```bash
npm run build         # solo web (validar que compila)
npm run sync          # build + cap sync android
npm run apk           # APK de depuración (pruebas rápidas)
npm run apk:release   # APK de release firmado (probar la build final en tu móvil)
npm run bundle        # AAB de release firmado → esto es lo que se sube a Play
```
