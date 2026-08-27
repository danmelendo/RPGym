# CLAUDE.md — RPGym

> Repositorio: <https://github.com/danmelendo/RPGym> (público, rama `main`).
> **Siguiente paso pendiente: [TODO.md](TODO.md)** — aplicar la migración de Supabase.
> Los APK **no se versionan**: se publican como *GitHub Release* (`*.apk` está en `.gitignore`).

Guía para agentes que trabajen en este repositorio. Resume el **estado real actual**, la arquitectura y lo pendiente, unificando los dos handoffs existentes (Copilot y Claude).

---

## Qué es

App personal de gimnasio **gamificada** (estética RPG). React + Vite en la capa web, empaquetada con **Capacitor** para generar un APK de Android. UI en **español de España**. Mobile-first, ancho máx. 480px.

- `appId`: `app.melendo.forjahabito` (identificador permanente del paquete, **no se cambia**) · `appName`: `RPGym`
- **Todo el código de la app vive en un único archivo: [src/App.jsx](src/App.jsx)** (~4.700 líneas).

---

## Estado real del repositorio (a día de hoy)

| Elemento | Estado |
|---|---|
| **Web** | Compila y funciona (`npm run build` OK, ~4.700 líneas). |
| **APK Android** | Regenerado con configurador de rutinas, dieta propia y catálogo de 231 ejercicios: [android/app/build/outputs/apk/debug/app-debug.apk](android/app/build/outputs/apk/debug/app-debug.apk) (`BUILD SUCCESSFUL`, **32,8 MB**; 220 carpetas de demostración / 440 fotogramas empaquetados). Las imágenes van **sin recomprimir**, tal cual vienen de origen: decisión consciente, el tamaño se considera asumible. |
| **`src/App.jsx`** | Versión avanzada + **tareas T1–T11 aplicadas** (ver abajo). |
| **Tareas T1–T11** | ✅ **Completadas.** Modo femenino (imágenes, 3 rutinas, filtrado por sexo, escalado de pesos), notificaciones locales, multi-perfil con migración `p1`/`p2`, `SettingsView`, banner de cuota, `WorkoutCalendar`, nota de dieta femenina y repaso es-ES. |
| **`@capacitor/local-notifications`** | ✅ **Instalado** (`^6.1.3`) y sincronizado (`npx cap sync android`). Permisos `POST_NOTIFICATIONS`, `SCHEDULE_EXACT_ALARM`, `USE_EXACT_ALARM`, `RECEIVE_BOOT_COMPLETED` añadidos al `AndroidManifest.xml`. Se usa vía **bridge global**, nunca `import`. |

### Detalle de lo implementado (T1–T11)
- **T1–T3 · Modo femenino**: imágenes de 9 ejercicios en `EX_IMG`; 3 rutinas `sex:"f"` (`f_fullbody`, `f_glute`, `f_ul`); `RoutinesView` filtra por `state.profile.sex` (unisex + coincidencia). El escalado ×0.62 vía `baseFor()` ya estaba.
- **T4 · Notificaciones**: helpers `LN()`, `ensureNotifPerm()`, `nextRenewalDate()`, `daysUntil()`, `scheduleAllReminders()` (bridge global; fallback suave en navegador).
- **T5 · Multi-perfil**: estado `profiles`/`activeId`; carga inicial con migración que crea `p1` (datos previos, sin prefijo) y `p2 "Pareja"` (modo femenino); handlers `loadProfileData`, `switchProfile`, `addProfile`, `updateProfile`, `setReminders`, `setSub`.
- **T6 · `SettingsView`**: perfil activo, cambio/alta de perfil, recordatorios (toggle + hora/minuto + chips de días), suscripción del gym (día/precio + próxima renovación). Componente `ToggleSwitch`. Se abre desde el engranaje de Inicio (`tab==="ajustes"`).
- **T7 · Inicio**: engranaje → ajustes y banner `--ember` de renovación cuando faltan ≤3 días.
- **T8 · `WorkoutCalendar`**: rejilla mensual (lunes primero) al inicio de `ProgressView`, con navegación de mes, puntos de entreno, borde de "hoy", marcador `€` de renovación y detalle al tocar un día.
- **T9 · Dieta**: nota informativa en modo femenino (proteína + hierro, sin cifras, con descargo de dietista).
- **T10 · es-ES**: los textos visibles ya eran correctos; "Acondicionamiento" es consistente (solo el `id` interno `aclimatacion` y un comentario quedaban; comentario actualizado).

> **Nota histórica:** `src/App.jsx` se promovió desde el snapshot avanzado `files/forjahabit.jsx` y luego se aplicaron T1–T11. Ese duplicado desfasado, el backup de la versión base y los `.zip` de entrega ya se eliminaron.

### Seguridad de dependencias
`npm audit` → **0 vulnerabilidades**. Las 2 *high* de `tar` (transitivas de `@capacitor/cli`) se cerraron **migrando Capacitor 6 → 7**, cuyo CLI usa `tar@7.5.20` (parcheado). No había arreglo en la línea `tar@6.x` de Capacitor 6.

---

## Los dos handoffs (contexto)

- **[AGENT_HANDOFF.md](AGENT_HANDOFF.md)** — handoff del agente de Copilot. Foco **entorno y build**: Android Studio/SDK, Gradle, variables de entorno, generación del APK.
- **[files/HANDOFF.md](files/HANDOFF.md)** — handoff para Claude Code. Foco **desarrollo de features**: arquitectura, convenciones y tareas T1–T11 con código listo para pegar (modo femenino, multi-perfil, notificaciones, ajustes, calendario).

---

## Cómo ejecutar / validar

```bash
npm install
npm run build       # valida que compila (Vite). Ejecútalo tras CADA bloque de cambios.
npm run dev         # previsualización en navegador
npm run sync        # build + npx cap sync android
npm run apk         # build + sync + assembleDebug   → APK de depuración
npm run apk:release # build + sync + assembleRelease → APK firmado (necesita keystore)
npm run bundle      # build + sync + bundleRelease   → AAB para Google Play
```

> Los scripts de Android invocan `android\gradlew.bat -p android …`. npm ejecuta los
> scripts con `cmd.exe`, donde `./gradlew` **no** funciona (por eso fallaba `npm run apk`).

Requisitos: Node 18+, **JDK 21**, Android Studio/SDK (platform + build-tools **35**) para el APK.

> **Capacitor 7** (core/cli/android/local-notifications). Config nativa: AGP **8.7.2**, Gradle **8.11.1**, compileSdk/targetSdk **35**, minSdk **24** (lo exige cordova-android 12). Gradle usa el JBR de Android Studio vía `org.gradle.java.home` en [android/gradle.properties](android/gradle.properties) (el `java` del PATH es la 20; AGP 8.7 necesita 21).

### Build Android (verificado)
```bash
cd android
./gradlew.bat assembleDebug
```
APK resultante → `android/app/build/outputs/apk/debug/app-debug.apk`

### Entorno Windows (de este equipo)
- Android Studio: `C:\Program Files\Android\Android Studio\bin\studio64.exe`
- SDK: `C:\Users\danie\AppData\Local\Android\Sdk`
- JDK (incluido con Android Studio): `C:\Program Files\Android\Android Studio\jbr`
- Variables recomendadas: `ANDROID_HOME`, `ANDROID_SDK_ROOT` → SDK; `JAVA_HOME` → jbr.
- Si falla el build Android, revisa en orden: (1) [android/local.properties](android/local.properties) con ruta válida al SDK, (2) variables de entorno, (3) plataforma Android 34/35 + build-tools instaladas.

---

## Arquitectura y convenciones (RESPÉTALAS)

- **Un solo archivo** `src/App.jsx`. Raíz `export default function App()`. Vistas: `HomeView`, `RoutinesView`, `RoutineBuilderView`, `WorkoutView`, `ResultsView`, `ProgressView`, `AchievementsView`, `CharacterView`, `DietView`, `CustomDietEditor`, `SettingsView`, `AccountView`. Aux: `Ring`, `Toast`, `RestTimer`, `Empty`, `ExImage`, `RoutineCard`, `ExercisePicker`.
- **Dónde va cada cosa** (reorganizado en la 1.0.5, no lo muevas sin motivo):
  - **Inicio** = lo que caduca o se mira de pasada. `EntrenandoAhora`, `MeHanSuperado`, `NovedadesCard`, `QuedadasPanel` en **modo lista** (ver, "Yo voy") y `ClasificacionCard`.
  - **Pestaña “RPGym”** (es `tab==="progreso"`, `ProgressView`; el `id` interno sigue siendo `progreso` a propósito) = `AmigosPanel`, `QuedadasPanel` en **modo crear** y tu progreso (calendario, gráficas, mediciones).
  - **Ajustes** = las **dos** copias de seguridad: la de texto y `CopiaNubePanel` (cifrada). Juntas a propósito: son la misma tarea.
  - **`AccountView`** (`tab==="cuenta"`) = solo entrar/registrarse, el nombre de usuario y cerrar sesión.
  - **`CharacterView`** (`tab==="ficha"`) **no tiene pestaña**: se entra tocando la tarjeta de nivel en Inicio y se sale con su botón de volver. Si le quitas ese botón, la ficha queda sin salida.
- **`AmigoView`** (`tab==="amigo"`, se abre tocando un amigo en `AmigosPanel`): su nivel y rango, qué entrena, sus marcas comparadas con las tuyas, y los dos botones de acción (quedar con él, pasarle una rutina). Sale con su botón de volver, que devuelve a la pestaña RPGym.
  - **Los NIVELES de atributo salen de `profiles.atributos`**, un jsonb con el XP en crudo por grupo (`state.muscleXp`) que sube `sincronizarPerfil`. Se sube el XP, no el nivel: la escala (`catLevel`) puede cambiar y así cada uno lo calcula con su versión. Los **ejercicios** de cada grupo se derivan en el móvil cruzando sus `exercise_records` con `EX_MUSCLE` y `BODY_MAP`: el servidor no sabe de músculos. Un ejercicio suyo que no esté en tu `EX_MUSCLE` no cae en ningún grupo pero sigue saliendo en "sus marcas" — degradación buscada, no fallo.
  - **Solo se enseña lo que hace**, nunca lo que le falta: aquí se viene a buscar un ejercicio en común. El favorito (más `veces`, desempate por peso) va con estrella.
  - **`veces`** es el número de SESIONES con ese ejercicio, no series. Sale de `sesionesPorEjercicio(log)` y se sube con `cloud.subirRecords(bests, veces)`. Si añades otra vía de subida de marcas, pásale también las veces o el favorito se queda en el más pesado.
  - **Comparación de marcas**: `{ ...ficha.mios, ...state.bests }` — lo local manda y el servidor rellena. Sin ese respaldo, un móvil recién instalado no compara nada.
- **Cardio: el tiempo se MIDE, no se teclea.** El cronómetro de `WorkoutView` cuenta hacia arriba (Comenzar → Detener) y al parar rellena minutos, km y kcal. Las estimaciones salen de `estimarCardio()`, con las ecuaciones metabólicas del ACSM y, para la distancia, física de ciclismo o la fórmula de Concept2 — están todas citadas en el comentario de la función. **La consola de la máquina manda siempre**: lo estimado se pinta en azul y se puede escribir encima, y al tocarlo deja de estar marcado como estimado. La cinta pide **km/h** en vez de "nivel" porque ahí la distancia es exacta.
- **`Sustituir ejercicio`** (botón "Cambiar" en cada tarjeta del entreno): la máquina está ocupada o rota. Ofrece primero los del mismo grupo muscular, **vacía las series** (eran de otro ejercicio) y deja `sustituyeA` para que se vea qué reemplazó a qué. Sin esto la única salida era marcar como hecho algo que no se hizo, y entonces las marcas mienten.
- **La app CONSULTA sola, no solo al arrancar**: `refrescarSocial()` recarga amigos, solicitudes, rutinas recibidas, quedadas, quién entrena y quién te ha superado. Se llama cada **60 s con la app delante** (`document.visibilityState === "visible"`), al **volver a la app** (`visibilitychange`) y **después de canjear un código**. Sin esto, un amigo recién añadido o una quedada recién propuesta no aparecían hasta cerrar y abrir la app — pasó de verdad. Un `ref` evita solaparse consigo misma. **Si añades datos que mueve otra persona, mételos ahí**, no solo en `cargarSocial()`.
- **La campana (`tab==="avisos"`, `AvisosView`)** solo lleva lo que EXIGE respuesta: solicitudes de amistad y rutinas que te mandan. Lo que solo se mira (quién entrena, quién te ha superado, novedades) se queda en Inicio sin insistir. El contador rojo es `solicitudes.length + enviosRutina.length`.
- **Amistad en dos vías**: el código de invitación de siempre (amistad directa, `canjear_invitacion`) **y** buscar por nombre (`buscar_gente`) + solicitud que el otro acepta o rechaza (`responder_solicitud`). `friendships` **sigue sin política de INSERT**: las dos vías pasan por funciones `security definer`. No añadas esa política.
- **Mandar una rutina a un amigo** va por `routine_sends`, dentro de la app: le llega a la campana y decide. El `payload` es **el mismo** que viaja en el código de texto (ejercicios por nombre), así que el receptor la reconstruye con `decodeRoutine` y su propio catálogo. El compartir por código de texto sigue existiendo para quien no tenga cuenta.
- **`subirPerfil()` se llama también al abrir con sesión guardada**, no solo al iniciar sesión: quien ya estaba dentro nunca habría subido sus atributos ni sus marcas y sus amigos le verían la ficha vacía. **Va en un `useEffect` que espera a `loading === false`**, NO dentro de `cargarSocial()`: allí `state` es todavía `DEFAULT_STATE` y subiría nivel 1 y 0 XP, machacando el perfil bueno. Un `ref` lo deja en una sola vez por sesión.
- **Las rutinas importadas SIGUEN a su dueño**: al importarla queda una fila en `routine_followers` y la copia se actualiza sola cuando el dueño la edita (`sincronizarRutinasSeguidas()`, dentro de `refrescarSocial`). La copia local guarda `origen: { ownerId, clientId, updatedAt }` — **`normalizeCustomRoutine` tiene que conservarlo** o la copia se queda congelada.
  - **Editar una rutina seguida la desvincula**: pasa a ser tuya y deja de recibir cambios. Si no, la siguiente sincronización te borraría lo que acabas de escribir.
  - **Mandar una rutina crea su fila en `shared_routines` como `privada`**: mandársela a una persona no es publicarla para todo el círculo. La política de SELECT deja leerla a quien la sigue aunque esté privada.
  - **`actualizarRutinaCompartida` solo hace UPDATE, nunca INSERT**: si la rutina no tenía fila, editarla no debe subirla. Por defecto las rutinas no salen del móvil.
- **Cuidado con los cierres viejos (`stale closures`)**: el `setInterval` del refresco captura la función del primer render. Todo lo que lea **estado que cambia** (como `customRoutines`) tiene que hacerlo por un `ref`, no del closure. Y lo que dependa del progreso local (`subirPerfil`, `sincronizarRutinasSeguidas`) va en un efecto que espera a `loading === false`, **nunca dentro de `cargarSocial()`**, donde `state` es todavía `DEFAULT_STATE`.
- **Compartir rutinas: ya no hay códigos de texto que copiar.** Se hace por dentro — el interruptor "visible para mis amigos" (`shared_routines`) o mandársela a alguien concreto desde su ficha (`routine_sends`). `encodeRoutine`/`decodeRoutine` **siguen existiendo y son necesarias**: son las que serializan el `payload` que viaja en ambos casos. Lo que se quitó es la interfaz de copiar y pegar códigos (`ImportRoutinePanel` y el textarea de `ShareRoutinePanel`).
- **Avisos que se cierran para siempre**: `useAvisoCerrado("clave")` guarda el cierre en `gym:aviso:<clave>` (global, no por perfil). Úsalo en cualquier aviso con una X. Con `useState(false)` volvían a salir en cada arranque. Empieza en "cerrado" para no parpadear mientras se lee el disco.
- **Invitar a una quedada**: `meetup_guests.respuesta` admite `'invitado'` además de `'voy'` / `'no'`. Lo pone quien propone (política `"invito a mis amigos"`, solo a amigos y solo a sus quedadas) y el invitado lo convierte al contestar. En Inicio se pinta como chip "TE HA INVITADO".
- **`QuedadasPanel` tiene dos modos** (`modo="lista"` / `"crear"`). El mismo componente: en Inicio solo lista y responde; en RPGym solo el formulario. No lo dupliques.
- **Restaurar una copia al arrancar**: la pantalla de login (`arranque`) ofrece pegar la copia de **texto** — funciona sin cuenta y sin red. La copia **cifrada** de la nube NO puede ofrecerse ahí: su clave se deriva de la contraseña al entrar. Se ofrece después, en una tarjeta de Inicio, y **solo si el móvil está vacío** (`!state.totalWorkouts && !log.length`); con progreso local ya guardado no se pregunta, para no invitar a pisarlo sin querer.
- **Puerta de entrada**: si la nube está configurada y no hay sesión guardada, `App` devuelve `AccountView` con `arranque:true` **antes** de la interfaz normal. El flag `sesionResuelta` existe para que el login no parpadee mientras `cloud.getSession()` lee el disco — no lo quites. `sinCuenta` deja pasar a quien no quiera registrarse; se reinicia al cerrar sesión.
- **Estilos**: un `<StyleTag>` inyecta CSS con variables (`--bg`, `--gold`, `--jade`, `--ember`, `--crimson`, `--arcane`, `--mana`, `--violet`, `--sky`, `--line`, `--card`…). Fuentes: `Cinzel` (clase `.cinzel`) para títulos/niveles, `Space Grotesk` (`.disp`). Están **auto-alojadas** en [public/fonts/](public/fonts/) (14 `.woff2`, subconjunto latin, 416 KB) y declaradas con `@font-face` dentro del `StyleTag`. **No vuelvas a poner el `@import` de fonts.googleapis.com**: llamaba a Google en cada arranque, rompía el "100% offline" y obligaba a declararlo en la política de privacidad. **No hay Tailwind JIT**: usa estilos inline + clases definidas (`.fh-card`, `.fh-btn`, `.fh-chip`, `.fh-framed`, `.fh-stat`, `.fh-bar`, `.fh-in`, `.fh-pop`).
- **Tema claro/oscuro**: el div raíz lleva `data-theme={theme}` y el tema claro se define con overrides `.fh[data-theme="light"] { … }` en el `StyleTag`. Preferencia **global** (`gym:theme`, compartida entre perfiles), estado `theme`/`setTheme` en `App`, selector en `SettingsView` (sección "Apariencia"). Un `useEffect` sincroniza el fondo del `body`, `color-scheme` y el `<meta theme-color>` (barra de estado Android). **Usa siempre variables CSS** (nunca colores oscuros hardcodeados) para que ambos temas funcionen.
- **Persistencia**: `window.storage` (shim sobre `localStorage`, definido en [src/main.jsx](src/main.jsx)). Helpers `loadKey/saveKey` (con prefijo de perfil) y `loadGlobal/saveGlobal` (globales). Claves por perfil: `gym:state`, `gym:log`, `gym:measures`, `gym:mealplan`, `gym:excludes`, `gym:routines` (rutinas propias), `gym:customdiet` (dieta pautada). **Toda clave nueva de progreso va también en `BACKUP_KEYS`** o se pierde al restaurar. Globales: `gym:profiles`, `gym:activeProfile`.
- **Multi-perfil** (en la versión avanzada): `STORE_PREFIX` + `setStorePrefix(id)`. El perfil `p1` usa claves **SIN prefijo** (compatibilidad con datos previos); el resto usa `"{id}:"`. **No cambies esta regla o se pierden datos.**
- **Librerías** (en package.json): `recharts`, `lucide-react`. Los iconos se importan del bloque `import { … } from "lucide-react"` — añade ahí los que falten.
- **Notificaciones**: usa **siempre el bridge global** `window.Capacitor?.Plugins?.LocalNotifications`. **NO uses `import` del plugin** (rompe el bundle web). El aviso real solo funciona en el APK instalado.
- **El aviso de descanso NO se cancela cuando el descanso acaba solo**, solo si lo saltas (`acabadoRef` en `RestTimer`). El WebView **sigue contando en segundo plano** un buen rato: llegaba a cero, cerraba el pop-up y el `cleanup` del efecto cancelaba la alarma justo en el instante en que iba a sonar. En segundo plano no avisaba nunca. Verificado en un emulador Android 14: la alarma se programaba bien (`RTC_WAKEUP`, `window=0`) y se cancelaba sola al vencer.
- **Cómo verificar esto de verdad** (sin adivinar): emulador con `avdmanager create avd -k "system-images;android-34;google_apis;x86_64"`, `adb install`, y luego `adb forward tcp:9222 localabstract:webview_devtools_remote_<pid>` para manejar el WebView con el protocolo de Chrome (hay un `cdp.js` de ejemplo en el scratchpad). Se comprueba con `adb shell dumpsys alarm | grep forjahabito` (¿se programa?) y `adb shell dumpsys notification | grep forjahabito` (¿se publica?).
- **Programar y cancelar van en una cola** (`enFila`): son asíncronos y entre serie y serie se solapaban, con el cancelar del descanso viejo llegando después del programar del nuevo.
- **Toda notificación programada lleva `allowWhileIdle: true`.** Sin eso el plugin usa `alarmManager.setExact(AlarmManager.RTC, …)`, que **ni despierta el móvil** y además Android aplaza mientras está en reposo (Doze): el aviso de fin de descanso llegaba minutos tarde, cuando ya habías vuelto. Con la bandera usa `setExactAndAllowWhileIdle(RTC_WAKEUP, …)`. Se puede comprobar en `node_modules/@capacitor/local-notifications/android/src/main/java/…/LocalNotificationManager.java`.
- **Cada aviso va por su canal, creado a mano** (`descanso` importancia 5, `recordatorios` 4, `rpgym` para el push). Sin canal propio Android usa el de por defecto: sin vibración y sin salir encima de lo que estés mirando. El canal del push tiene que llamarse **`rpgym`**, que es el `channel_id` que manda la Edge Function.
- **`VIBRATE` en el manifiesto**: sin ese permiso no vibra ni el canal ni `navigator.vibrate`. Es fácil de olvidar porque no da ningún error, simplemente no pasa nada.
- **Push (FCM) — el plugin ya está instalado** (desde la 1.0.11), porque `android/app/google-services.json` existe. Falta solo desplegar la Edge Function `avisar`: ver [supabase/FIREBASE.md](supabase/FIREBASE.md). **Nunca instales el plugin sin ese fichero**: en nativo llama a `FirebaseMessaging.getInstance()` y **revienta la app al arrancar** — fue el crash de la 1.0.1. Que el bridge exista NO basta como comprobación; [vite.config.js](vite.config.js) inyecta `__PUSH_CONFIGURADO__`, cierto solo si el fichero está, y [src/push.js](src/push.js) lo exige. Los dos JSON de Firebase (el de la app y el de la cuenta de servicio) están en `.gitignore`: el repo es público.
- **XP por músculo**: cada ejercicio tiene `muscle`; `BODY_MAP` lo agrupa en atributos. `EX_MUSCLE` se deriva de `ROUTINES`, así que un ejercicio nuevo debe usarse dentro de una rutina para heredar `muscle`.
- **Si RENOMBRAS un ejercicio, añádelo a `RENOMBRES`**. Las marcas, la progresión, el historial, los récords de cardio y las rutinas propias se indexan **por nombre**: sin esa entrada, el usuario pierde sus récords al actualizar. `migrarNombres()` lo arrastra todo al cargar el perfil. No borres entradas viejas del mapa.
- **Diccionarios por nombre de ejercicio**: `EX_BASE` (peso base kg), `EX_HOW` (técnica), `EX_IMG` (imagen). Al añadir un ejercicio, completa los **tres** (o `BODYWEIGHT_EX` en vez de `EX_BASE` si no lleva carga) y, si no lo usa ninguna rutina de la app, añade su músculo a `EX_MUSCLE_EXTRA` o no aparecerá en el configurador. Cuidado con las **claves duplicadas**: JS se queda con la última sin avisar (Vite sí avisa en `npm run dev`, no en `npm run build`).
- **Ejercicios sin carga**: `BODYWEIGHT_EX` (Set de nombres) marca peso corporal / isométricos / cardio (plancha, flexiones, abdominales, mountain climbers…). En `WorkoutView` se les **oculta la columna KG y el selector de peso**: solo se anotan reps o tiempo, con la cabecera `REPS`/`SEG`/`MIN` según `repUnit(reps)`. `startWorkout` les fuerza `base:0` y peso vacío. Las variantes **"lastradas" / "con lastre" NO van en el Set** (sí llevan disco). Al añadir un ejercicio de peso corporal, mételo en `BODYWEIGHT_EX`.
- **Demostración animada (offline)**: `EX_IMG[name]` apunta a una ruta **local** `/exercises/<Slug>/0.jpg`. Cada ejercicio tiene **2 fotogramas** en [public/exercises/](public/exercises/) (`0.jpg` inicio, `1.jpg` fin), descargados de free-exercise-db (dominio público, Unlicense). El componente `ExImage` alterna inicio↔fin cada ~0,85 s (badge "▶ DEMO"). Como es **contenido** (no decoración), anima siempre; con `prefers-reduced-motion` el cambio es instantáneo (sin fundido) pero sigue mostrando el movimiento. Cae a imagen estática si falta el 2º fotograma. **Al añadir un ejercicio nuevo**: descarga sus dos frames a `public/exercises/<Slug>/` y apunta `EX_IMG` a `/exercises/<Slug>/0.jpg` (el segundo se deriva solo). El catálogo va por **231 ejercicios** en 220 carpetas (algunos comparten demostración) y [public/exercises/](public/exercises/) ocupa ~28 MB, así que el APK ronda los **~33 MB**. Cubre prácticamente todas las **máquinas y poleas** de un gimnasio tipo (Matrix), que es lo que más se usa. Si algún día hiciera falta adelgazarlo, `ffmpeg -i x.jpg -q:v 7` recorta ~20% sin pérdida visible (probado), pero **hoy se deja sin comprimir a propósito**. **Ojo con los nombres de carpeta**: usa solo letras, números, guiones y guiones bajos — los paréntesis del nombre original de free-exercise-db se pierden por el camino en Windows (`Hyperextensions_(Back_Extensions)` acabó como `Hyperextensions_Back_Extensions`). Tras añadir ejercicios, comprueba que **todas** las rutas de `EX_IMG` existen en disco con sus dos fotogramas.
- **Dieta / bienestar**: la dieta son **ideas de comidas SIN calorías ni macros**. No des cifras de déficit ni conteos. Mantén el descargo de dietista. Nada que fomente conductas alimentarias no saludables.
- **Lista de la compra con cantidades**: `PORTION[ingrediente] = [ración, unidad]` (`g` · `ml` · `ud`), y la cantidad final = ración × veces que aparece en el plan × `intakeFactor(profile)` (peso, edad y sexo, acotado a ±40%), ponderado por `GROUP_SENS` (proteína e hidratos escalan 1; verdura 0,35; despensa 0,25). `buyAmount()` redondea a algo comprable y da los huevos en **docenas**. Son cantidades **para comprar**, no un conteo de calorías: no rompe la regla anterior. Al añadir un ingrediente nuevo a `MEALS`, añádelo también a `PORTION` (si falta, la fila cae al viejo `×n`).
- **Gamificación**:
  - **Pesos/reps sugeridos**: `parseTargetReps` autocompleta el **extremo bajo** del rango (empieza conservador). El peso inicial (sin historial) se escala por RPE de la rutina vía `startWeightMult` (acondicionamiento ×0.65, recomp ×0.82, hipertrofia ×1.0); con historial parte de `state.bests`.
  - **Lo que se le enseña al usuario son SERIES, no kilos movidos.** El volumen (`record.volume`) se sigue calculando y guardando —lo usan los avisos de exceso por grupo—, pero ni los logros, ni la gráfica de progreso, ni el resumen del entreno hablan ya de kilos: premiar el volumen premia a quien ya levanta mucho, mientras que hacer una serie más es una decisión que se puede tomar en el momento. Usa **`seriesDe(rec)`**, que cae a contar las series del detalle cuando el registro es viejo y no trae el contador. Los kilos siguen a la vista donde sí significan algo: las **marcas por ejercicio**.
  - **El "punto débil" de la ficha ignora Aguante**: es cardio, un complementario, y como casi nunca es el atributo más alto se llevaba siempre la recomendación, tapando el grupo muscular que de verdad iba retrasado.
  - **Redención · lo que cuenta son las VECES, no los días.** Si te saltas el lunes y lo recuperas el sábado, la semana está cumplida y la racha sigue. Es la regla que pidió el dueño: *"a veces no se puede ir y se recupera un sábado"*. Castigar el calendario en vez del hábito es lo que hace que la gente abandone.
    - `resumenSemana(log, dias, lunesISO)` es la pieza central: `previstos`, `hechos`, `faltan`, `cumplida` y **`recuperable`** (quedan días suficientes para llegar). La semana en curso **nunca** rompe la racha: todavía estás a tiempo.
    - `habitStreak` cuenta días entrenados hacia atrás y **se corta en la primera semana YA CERRADA que acabó corta**. Antes bastaba con fallar un día suelto aunque la semana acabara cumplida.
    - `weekPlannedStatus` (misiones y objetivo) cuenta veces, no días concretos.
    - `StreakCard` pinta tres estados nuevos: **dorado** el día previsto hecho, **jade con destello** el día extra que recupera, **jade punteado con flecha** el día fallado ya perdonado. El rojo se reserva para la semana cerrada sin recuperar.
    - Probado con casos de fecha fija en `scratchpad/probar_redencion.mjs`: si tocas esta lógica, pásalo.
  - **Ficha de personaje**: atributos expandibles (ejercicios realizados vs. recomendados por grupo, vía `EXERCISES_BY_GROUP`); "Poder total" = suma de niveles de los 7 atributos, con escala de rangos (`POWER_TIERS`/`powerTier`).
  - **Cardio**: `isCardio(name)` (músculo `Cardio`). No lleva carga (va en `BODYWEIGHT_EX`) y el continuo tampoco descanso: `defaultRest` devuelve **0** y `WorkoutView` solo abre el cronómetro si `ex.rest>0` — así el **HIIT conserva su descanso entre intervalos**, que sí forma parte del protocolo. `defaultSets` da **1 serie** (una tirada, no tres).
    - **Datos de consola**: `hasConsole(ex)` (está en `MACHINE_CARDIO` **y** el objetivo va en minutos) añade columnas **KM** y **KCAL** por serie y un **nivel de máquina** común a toda la tirada. En intervalos por segundos no se piden: apuntar km por intervalo no tiene sentido.
    - **Récords**: van en `state.cardioBests[nombre] = { min, km, kcal, pace, level, date }`, aparte de `bests` (que es solo kilos). Solo se guardan tiradas medidas en **minutos** (`tracksTime`): en los intervalos el campo son segundos y compararlo como minutos sería mentir. Batir marca cuenta como **un PR por ejercicio** (+50 XP) aunque mejores varias métricas; la entrada de `prList` lleva `unit` para que Resultados no lo pinte como "kg". Se ven en el propio entreno, en Resultados y en `Progreso → Récords de cardio`.
    - **XP**: sin kilos que contar, el cardio puntúa por minutos (`10 + min/3` al atributo Aguante).
  - **Rutinas**: evita meter dos ejercicios de la **misma técnica** en un mismo día (p. ej. hip thrust + puente de glúteo). Variaciones distintas (dos remos con implemento diferente, bilateral+unilateral) sí son válidas.
- **Rutinas propias (configurador)**: el usuario monta sus rutinas en `RoutineBuilderView` (pestaña interna `tab==="editor"`, sin barra de navegación) eligiendo del catálogo con `ExercisePicker`. Tienen la **misma forma** que las de `ROUTINES` (`{ id, name, days:[{ name, exercises }] }`) más `custom:true` y `cat:"Mis rutinas"`, así que entrenan, dan XP y cuentan volumen igual. Se guardan por perfil en `gym:routines`.
  - **Búscalas SIEMPRE con `findRoutine(id, customRoutines)`**, nunca con `ROUTINES.find(...)`: si no, una rutina propia activa deja Inicio, Progreso y la Ficha sin rutina.
  - `normalizeCustomRoutine()` sanea lo que entra (de una copia de seguridad, por ejemplo) y **descarta ejercicios que no estén en `EX_MUSCLE`**. Por eso el catálogo seleccionable (`EX_POOL_BY_GROUP`) sale de `EX_MUSCLE`: un ejercicio que no aparezca en ninguna rutina de la app necesita su entrada en `EX_MUSCLE_EXTRA` o no se podrá elegir.
  - `ExercisePicker` es un overlay a pantalla completa: usa `background:"var(--bg)"` (opaco, según tema). Un velo oscuro fijo dejaba el texto ilegible en tema claro.
  - **Compartir rutinas (sin servidor)**: `encodeRoutine` / `decodeRoutine` convierten una rutina propia en un código de texto `RPGYM-R1.<base64url>` que se manda por WhatsApp y se pega en la otra app (`Rutinas → Importar rutina`). Solo texto, como la copia de seguridad: **ni backend, ni QR, ni llamadas a nadie**.
    - Los ejercicios viajan **por nombre, no por índice**: un índice se rompería en cuanto creciera el catálogo. El músculo, la técnica, la imagen y el peso base NO viajan — los pone el receptor desde su propio catálogo, así el código es corto (~550 caracteres una rutina de 2 días) y aguanta versiones distintas.
    - Lo que el receptor no conozca se descarta y **se avisa por nombre** antes de guardar. Al importar siempre se genera **id nuevo** y, si el nombre ya existe, se añade " (2)": nunca se pisa una rutina existente. Quedan marcadas con `imported:true` (chip IMPORTADA).
    - **No viaja ningún dato personal**: ni nombre de perfil, ni marcas, ni historial. Si algún día se añade algo al código, revisa que siga siendo así ([public/privacidad.html](public/privacidad.html) lo da por hecho).
  - **Vista previa**: tocar el NOMBRE despliega la demostración animada (`ExImage`) + la técnica; el botón **+** de la derecha añade directo sin abrir nada. Con 231 ejercicios el nombre no basta para saber qué máquina es (p. ej. el curl de bíceps en máquina se ve con los brazos en alto y no parece un curl hasta que ves los dos fotogramas).
- **Dieta propia**: `CustomDietEditor` guarda en `gym:customdiet` una pauta **de texto libre** (7 días × `CUSTOM_MEAL_SLOTS`) más nombre, autor, notas y su propia lista de la compra. La app **no la interpreta ni calcula nada sobre ella**: solo la muestra. Manda sobre el plan generado solo si `enabled` **y** tiene contenido (`customDietHasContent`); con ella activa se ocultan exclusiones y regla del plato, y el descargo cambia para remitir a quien la pautó.
- **Objetivo semanal**: sale de los días marcados por el usuario (`weeklyGoalFor(state, routine)` → `reminders.days.length`), no de `routine.daysPerWeek`. Usa `plannedDaysOf(state)` y `DEFAULT_TRAIN_DAYS` para el fallback: racha, misiones y objetivo deben contar **lo mismo**.

---

## Tareas T1–T11 (✅ completadas)

Todas aplicadas y validadas (`npm run build` + APK). El detalle de cada una está en la tabla de estado arriba y el código de referencia en [files/HANDOFF.md](files/HANDOFF.md) §3.

### Verificación pendiente / próximos pasos sugeridos
- **Probar en `npm run dev`**: cambiar a perfil "Pareja" debe mostrar rutinas femeninas y pesos base más bajos; activar recordatorios/suscripción no debe romper en navegador (los avisos reales solo en APK instalado).
- **Probar el APK en un dispositivo Android 13+**: conceder permiso de notificaciones y confirmar que llegan los recordatorios y el aviso de renovación.
- **Limpieza**: hecha (backup, duplicado `forjahabit.jsx` y `.zip` de entrega eliminados).
- **Opcional (offline)**: descargar imágenes de ejercicios a `public/exercises/` y reescribir `EX_IMG` a rutas locales.

---

## Publicación en Google Play

Guía completa y paso a paso en **[PLAYSTORE.md](PLAYSTORE.md)**. Resumen de lo que ya está montado:

- **Firma de release**: ✅ **ya creada.** Almacén en `C:/claves/rpgym.jks` (alias `rpgym`, fuera del
  repositorio), credenciales en `android/keystore.properties` (no versionado; plantilla en
  [android/keystore.properties.example](android/keystore.properties.example)). `npm run bundle` genera
  un AAB firmado. Si el fichero de credenciales falta, el build sale **sin firmar**.
- **Material de la ficha de Play**: ✅ generado en [store/](store/) — icono 512×512, cabecera
  1024×500, 6 capturas 480×854 y [store/FICHA-PLAY.md](store/FICHA-PLAY.md) con los textos y las
  respuestas a los cuestionarios.
- **Versionado**: `versionCode`/`versionName` se editan en [android/version.properties](android/version.properties).
  Play exige subir `versionCode` en **cada** subida.
- **Copia de seguridad en la app** (`Ajustes → Copia de seguridad` y también en el **paso 1
  del onboarding**, para quien vuelve tras reinstalar). Exporta/importa un JSON con
  `BACKUP_KEYS` por texto (portapapeles), sin plugins nativos.
- **Aviso crítico**: pasar del APK de depuración a la versión de Play **cambia la firma**,
  obliga a desinstalar y **borra el progreso**. Los testers deben hacer la copia antes.
  A partir de estar en Play, las actualizaciones ya no pierden nada.
- **`public/RPGym.apk` no se empaqueta**: Vite copia todo `public/` a `dist/`, y `dist/` va
  dentro de la app. El plugin `stripApkFromBuild` de [vite.config.js](vite.config.js) lo borra
  del build (si no, la app se lleva dentro una copia de sí misma: 27,7 MB en vez de 14 MB).
- **Política de privacidad**: obligatoria en Play. Texto listo en
  [public/privacidad.html](public/privacidad.html) (HTML autocontenido, claro/oscuro). Hay que
  alojarlo en una URL pública y pegarla en la constante `PRIVACY_URL` de [src/App.jsx](src/App.jsx)
  → aparece el enlace en `Ajustes → Privacidad`. Si cambias qué datos maneja la app,
  **actualiza también esa página**.
- **Nombre**: la app se llama **RPGym** en todas partes. El `applicationId`
  `app.melendo.forjahabito` conserva el nombre antiguo a propósito: es permanente y, una vez
  publicado en Play, no se puede cambiar.

## Firma del APK que se reparte (IMPORTANTE)

Los APK de las *releases* van firmados con la **clave de depuración**, no con el
almacén de release. Se construyen con `npm run apk` (`assembleDebug`).

**No cambies a `assembleRelease` para repartir por GitHub.** Android se niega a
actualizar una app si la firma cambia: sale *"hay una diferencia de paquetes"* y la
única salida es desinstalar, lo que **borra el progreso local**. Pasó en la 1.0.2, que
hubo que retirar y reemplazar por la 1.0.3 firmada como las anteriores.

Para comprobar con qué clave está firmado un APK:

```bash
JAVA_HOME="C:/Program Files/Android/Android Studio/jbr"   "$ANDROID_HOME/build-tools/35.0.0/apksigner.bat" verify --print-certs ruta/al.apk
```

- Depuración → `CN=Android Debug`, SHA-256 `4f7c3189…` ← **la que usan todos**
- Release → `CN=RPGym, O=RPGym, C=ES`, SHA-256 `85fb9fcd…`

El almacén de release (`npm run apk:release` / `npm run bundle`) sigue existiendo para
el día que se suba a Play. Migrar a esa firma exige avisar antes, que todo el mundo
exporte su copia (`Ajustes → Copia de seguridad`), desinstalar e instalar de cero. No
se hace por accidente.

## Gotchas

- **Fechas de día: NUNCA uses `toISOString()`.** `new Date("2026-08-24T00:00:00")` es medianoche **local**, así que `toISOString()` la pasa a UTC y en España devuelve el día anterior. Encadenar `mondayOf()` + `addDaysISO()` desplazaba el calendario **dos días** y por eso los días de entreno salían mal en Inicio. Usa siempre `isoOf(date)` y `parseISO(iso)`.
- No importes el plugin de notificaciones con `import`: usa el bridge global.
- `EX_MUSCLE` se deriva de `ROUTINES`: todo ejercicio nuevo debe usarse en una rutina (o añade su clave a mano).
- Al añadir ejercicios: completa `EX_BASE`, `EX_HOW` y `EX_IMG`.
- El perfil `p1` NO lleva prefijo de almacenamiento (compatibilidad).
- Dieta sin calorías ni macros (las cantidades de la **compra** sí, ver arriba).
- Las imágenes de ejercicios ya son **locales** (`public/exercises/`, 100% offline) — no dependas de GitHub raw al añadir nuevas.
- Los ejercicios de peso corporal van en `BODYWEIGHT_EX`, no por `EX_BASE === 0` (hay lastrados con base 0 que sí llevan peso).
- No metas binarios grandes en `public/`: acaban dentro del APK. Si hace falta servirlos solo en dev, excluye del build como con `RPGym.apk`.
- **Qué se sincroniza**: la app es de uso privado entre amigos, así que se suben entrenos con su detalle, marcas por ejercicio, medidas y rutinas. **Dos excepciones que NO se tocan**: los datos del **ciclo menstrual** y las rutinas marcadas como **privadas** por su dueño. Si añades sincronización nueva, respétalas.
- **La parte social está en FASE 1** (cuentas, clasificación, keep-alive) y el resto planificado en [ROADMAP-SOCIAL.md](ROADMAP-SOCIAL.md) para **uso privado, repartiendo el APK a mano y sin pasar por Play**. Lo primero que rompe es el texto de `Ajustes → Privacidad`, que hoy promete al usuario que **no se recoge ni se envía nada**. No añadas red sin leer ese documento.
- **Nunca cambies la firma del APK que se reparte** (ver la sección de arriba): rompe la actualización y obliga a desinstalar.
- **Nada de recursos remotos** (fuentes, CDN, analítica, iconos por URL). La app debe seguir siendo 100% offline y sin llamadas a terceros, o la política de privacidad deja de ser cierta. Descarga y sirve desde `public/`.

---

## Versión web (PWA) para quien no tiene Android

Quien usa iPhone no puede instalar el APK, así que abre la web y la añade a la
pantalla de inicio. Se publica sola en GitHub Pages con
[.github/workflows/web.yml](.github/workflows/web.yml) en cada push a `main`.

- **Las rutas de imágenes y fuentes son RELATIVAS** (`exercises/…`, no `/exercises/…`).
  Pages sirve el proyecto en `/RPGym/`, y una ruta absoluta se sale de la carpeta.
  Dentro de Capacitor funcionan igual, así que no hay dos versiones que mantener.
- **[public/sw.js](public/sw.js)**: no precachea nada. Las fotos de ejercicios son
  ~28 MB y bajarlas todas en la primera visita sería una salvajada con datos
  móviles; se guardan según las miras, con un tope de 400.
- **Se registra solo en web** (`main.jsx` comprueba `Capacitor.isNativePlatform`):
  dentro de la app los ficheros ya son locales y el service worker solo estorba.
- **El aviso de fin de descanso en web** va por el service worker
  (`postMessage` con `tipo:"avisar-en"`). En iOS solo funciona con la web añadida
  a la pantalla de inicio, y aun así iOS puede suspenderlo: por eso el pop-up
  vibra también por su cuenta. **Es la limitación real de la versión web** y está
  avisada en el propio documento de la web.

## Secretos: qué puede ir al repositorio y qué no

El repositorio es **público**. Todo lo sensible está en `.gitignore` y se ha
comprobado sobre **todo el historial** que nunca ha entrado: contraseña de la
base, claves de Brevo, clave privada de Firebase, correo de la cuenta de
servicio.

| Fichero | Qué lleva | Estado |
|---|---|---|
| `.env` | anon key (pública) + contraseña de la base | ignorado |
| `android/app/google-services.json` | identifica la app ante Firebase | ignorado |
| `android/app/*firebase-adminsdk*.json` | **llave para enviar push a cualquiera** | ignorado |
| `supabase/.env.firebase` | los tres valores del anterior | ignorado |
| `android/keystore.properties` | firma de release | ignorado |

**Ni siquiera la anon key va escrita en el código.** Es pública por diseño —viaja
dentro del APK y del bundle web—, pero es un JWT y los escáneres de secretos la
marcan como filtración, con razón: no pueden distinguirla de la service role.
Vive en las **variables del repositorio** (*Settings → Secrets and variables →
Actions → Variables*) y el workflow la lee con `${{ vars.… }}`. Si algún día
salta una alerta de GitGuardian, será una de verdad.

## Rutas clave

| Ruta | Qué es |
|---|---|
| [src/App.jsx](src/App.jsx) | Toda la app (versión avanzada + T1–T11 aplicadas). |
| [src/main.jsx](src/main.jsx) | Entrada React + shim `window.storage`. |
| [files/HANDOFF.md](files/HANDOFF.md) | Handoff de features (T1–T11), código de referencia. |
| [AGENT_HANDOFF.md](AGENT_HANDOFF.md) | Handoff de entorno/build (Copilot). |
| [capacitor.config.json](capacitor.config.json) | Config Capacitor (`webDir: dist`). |
| [android/](android) | Proyecto Android. |
| [android/local.properties](android/local.properties) | Ruta local del SDK. |
| [PLAYSTORE.md](PLAYSTORE.md) | Guía de publicación en Google Play (firma, versionado, AAB, migración de testers). |
| [supabase/FIREBASE.md](supabase/FIREBASE.md) | Puesta en marcha del push: crear el proyecto de Firebase y desplegar la Edge Function. |
| [supabase/README.md](supabase/README.md) | **Empieza por aquí para la nube**: crear el proyecto, ejecutar el esquema y pegar las credenciales en `.env`. |
| [supabase/migrations/](supabase/migrations/) | Tablas, funciones y políticas RLS. **Las migraciones van aquí**: es la única carpeta que mira la integración de GitHub de Supabase. |
| [src/cloud.js](src/cloud.js) | Capa de Supabase. Todo devuelve `{ok,...}`, nunca lanza: sin red la app sigue igual. |
| [ROADMAP-SOCIAL.md](ROADMAP-SOCIAL.md) | **Fase 1 hecha, 2-6 pendientes**: plan para la parte social con Supabase (amigos, rutinas compartidas, entrenos conjuntos, push), pensado para **uso privado sin Play**. Léelo antes de tocar nada de red. |
| [android/version.properties](android/version.properties) | `versionCode` / `versionName` de la app. |
| [android/keystore.properties.example](android/keystore.properties.example) | Plantilla de la firma de release. |
| [public/privacidad.html](public/privacidad.html) | Política de privacidad (hay que alojarla y poner la URL en `PRIVACY_URL`). |
| [public/fonts/](public/fonts/) | Fuentes auto-alojadas (nada de Google Fonts remoto). |
