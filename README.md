# RPGym — app de gimnasio (Capacitor + React)

App personal gamificada de gimnasio empaquetada para generar un **APK instalable** en Android.
El código de la app es React (Vite) y se envuelve en un WebView nativo con **Capacitor**.
Está pensada para que la **actualices localmente**: editas `src/App.jsx`, reconstruyes y regeneras el APK.

---

## Requisitos (una sola vez)

- **Node.js 18+** y npm.
- **JDK 17** (Temurin/Adoptium o el que traiga Android Studio).
- **Android Studio** (recomendado) o, si prefieres solo consola, el **Android SDK** + `ANDROID_HOME` configurado.

> Con Android Studio instalado ya tienes SDK, plataforma y herramientas; es el camino más cómodo.

---

## Puesta en marcha

```bash
# 1. Instala dependencias
npm install

# 2. Compila la web (genera dist/)
npm run build

# 3. Inicializa Capacitor y añade la plataforma Android (solo la 1ª vez)
npx cap init "RPGym" app.melendo.forjahabito --web-dir dist   # opcional: ya hay capacitor.config.json
npx cap add android

# 4. Sincroniza la web con el proyecto nativo
npx cap sync android
```

A partir de aquí ya tienes la carpeta `android/` (proyecto Gradle real).

---

## Generar el APK

### Opción A — Android Studio (fácil)

```bash
npx cap open android
```

En Android Studio: **Build ▸ Build Bundle(s) / APK(s) ▸ Build APK(s)**.
Cuando termine, pulsa **locate** para encontrar el archivo.

### Opción B — Consola

```bash
cd android
./gradlew assembleDebug        # en Windows: gradlew.bat assembleDebug
```

El APK queda en:

```
android/app/build/outputs/apk/debug/app-debug.apk
```

Hay un atajo ya preparado en package.json (tras haber hecho `cap add android` una vez):

```bash
npm run apk
```

---

## Instalar en el móvil

- **Con cable (adb):**
  ```bash
  adb install -r android/app/build/outputs/apk/debug/app-debug.apk
  ```
- **Sin cable:** copia el `app-debug.apk` al teléfono y ábrelo. Tendrás que permitir
  *"Instalar apps de orígenes desconocidos"* para tu explorador de archivos.

> El APK **debug** vale perfectamente para uso personal. Para un APK **release** firmado
> mira la sección de abajo.

---

## Ciclo de actualización (lo que harás a menudo)

1. Edita `src/App.jsx` (toda la lógica y UI está ahí).
2. Reconstruye y sincroniza:
   ```bash
   npm run sync        # = build + cap sync android
   ```
3. Regenera el APK (Opción A o B) e instálalo con `adb install -r ...` (el `-r` reinstala conservando tus datos).

Tus datos (XP, niveles, mediciones, plan de comidas) se guardan en el almacenamiento
local del dispositivo, así que **persisten entre actualizaciones** mientras no desinstales la app.

---

## Icono y nombre

- El nombre visible ("RPGym") sale de `android/app/src/main/res/values/strings.xml` (`app_name`); `capacitor.config.json` lo usa para generarlo.
- Para un icono propio, lo más cómodo es `@capacitor/assets`:
  ```bash
  npm i -D @capacitor/assets
  # coloca un icon.png de 1024x1024 en la carpeta resources/
  npx @capacitor/assets generate --android
  npx cap sync android
  ```
  Tienes un `public/logo.svg` de referencia; expórtalo a PNG 1024×1024 como punto de partida.

---

## APK firmado (release) — opcional

```bash
# 1. Crea un keystore (una vez, guárdalo a buen recaudo)
keytool -genkey -v -keystore forja.keystore -alias forja -keyalg RSA -keysize 2048 -validity 10000

# 2. Configura la firma en android/app/build.gradle (signingConfigs) o en Android Studio:
#    Build ▸ Generate Signed Bundle / APK ▸ APK

# 3. Genera el release
cd android && ./gradlew assembleRelease
```

---

## Dónde tocar para las mejoras futuras

Todo vive en `src/App.jsx`. Puntos de extensión (también anotados como comentario al principio del archivo):

- **Modo femenino / sexo:** `state.profile.sex` ya existe como campo. Puedes:
  - Ramificar `EX_BASE` (pesos base sugeridos) según el sexo.
  - Añadir un campo `sex` a las rutinas del array `ROUTINES` y filtrarlas en `RoutinesView`.
- **Otros pesos / unidades:** `state.profile.units` (`"kg"`/`"lb"`). Los pesos se guardan como número;
  para libras, convierte en un único punto al mostrar/guardar.
- **Otros tipos de entreno:** añade objetos al array `ROUTINES` con su `cat` y `minLevel`.
  El sistema de fases, la XP por músculo (ficha de personaje) y la protección de volumen
  los recogen automáticamente (se basan en el campo `muscle` de cada ejercicio).
- **Técnica de ejercicios:** el diccionario `EX_HOW` mapea nombre → explicación. Añade la
  entrada cuando metas un ejercicio nuevo.
- **Protección de volumen:** umbrales en `GROUP_CEIL` (series/semana por grupo).
- **Almacenamiento:** el shim está en `src/main.jsx`. Cámbialo por `@capacitor/preferences`
  si quieres blindar la persistencia.

---

## Notas

- **Imágenes de ejercicios:** se cargan online desde la base abierta *free-exercise-db*
  (dominio público) vía GitHub. Con conexión se ven; sin conexión, el panel muestra solo el
  texto de técnica. Para tenerlas offline, descarga las imágenes a `public/exercises/` y
  cambia las URLs del diccionario `EX_IMG` por rutas locales.
- Las fuentes (Cinzel, etc.) se cargan online vía `@import`. Con conexión se ven perfectas;
  sin conexión caen a fuentes del sistema. Si quieres 100% offline, descarga las fuentes a
  `public/fonts/` y cambia el `@import` por `@font-face` locales.
- La app está diseñada a 480px de ancho máximo y centrada: se ve como una app de móvil nativa.
