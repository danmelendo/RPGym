# HANDOFF · Forja Hábito — para Claude Code

Continúa el desarrollo de esta app. **Todo el código vive en un único archivo: `src/App.jsx`** (~1900 líneas). Es una app React (Vite) empaquetada con Capacitor para generar un APK. Este documento describe la arquitectura, lo ya hecho y **las tareas pendientes con código listo para pegar**.

> Trabaja siempre sobre `src/App.jsx`. Tras cada bloque de cambios valida con `npm run build` (o un parse de Babel). No rompas el estilo existente (ver "Convenciones").

---

## 0. Cómo ejecutar / validar

```bash
npm install
npm run build          # valida que compila (Vite). Hazlo tras cada tarea.
npm run dev            # previsualización en navegador
# APK: npx cap add android (1ª vez) && npm run sync && cd android && ./gradlew assembleDebug
```

Node 18+, JDK 17, Android Studio/SDK para el APK. Ver `README.md`.

---

## 1. Arquitectura y convenciones (IMPORTANTE, respétalas)

- **Un solo archivo** `src/App.jsx`. Componente raíz `export default function App()`. Vistas: `HomeView`, `RoutinesView`, `WorkoutView`, `ResultsView`, `ProgressView`, `AchievementsView`, `CharacterView`, `DietView`. Componentes aux: `Ring`, `Toast`, `RestTimer`, `Empty`, `ExImage`.
- **Estilos**: un `<StyleTag>` inyecta CSS con variables (`--bg`, `--gold`, `--jade`, `--ember`, `--crimson`, `--arcane`, `--mana`, `--violet`, `--sky`, `--line`, `--card`, etc.). Estética RPG (fuente `Cinzel` para títulos/niveles via clase `.cinzel`, `Space Grotesk` para `.disp`). **No hay Tailwind JIT**: usa estilos inline y las clases definidas (`.fh-card`, `.fh-btn`, `.fh-chip`, `.fh-framed`, `.fh-stat`, `.fh-bar`, `.fh-in`, `.fh-pop`). Ancho máx 480px, mobile-first.
- **Persistencia**: `window.storage` (shim de `localStorage` definido en `src/main.jsx`). Helpers `loadKey/saveKey` (con prefijo de perfil) y `loadGlobal/saveGlobal` (claves globales). Claves por perfil: `gym:state`, `gym:log`, `gym:measures`, `gym:mealplan`, `gym:excludes`. Claves globales: `gym:profiles`, `gym:activeProfile`.
- **Multi-perfil**: `let STORE_PREFIX` + `setStorePrefix(id)`. El perfil `p1` usa claves SIN prefijo (compatibilidad con datos previos); los demás usan `"{id}:"`.
- **Librerías** (ya en package.json): `recharts`, `lucide-react`. Iconos se importan del bloque `import { ... } from "lucide-react"`. Añade ahí los que falten.
- **Notificaciones**: usa el **bridge global** `window.Capacitor?.Plugins?.LocalNotifications` (NO hagas `import` del plugin, rompería el bundle web). Ya está `@capacitor/local-notifications` en package.json; tras instalar, `npx cap sync android`.
- **XP por músculo / protección de volumen**: cada ejercicio tiene `muscle`; `BODY_MAP` lo agrupa en atributos (`Pecho/Espalda/Piernas/Hombros/Brazos/Core/Aguante`). `EX_MUSCLE` se deriva automáticamente de `ROUTINES`, así que cualquier ejercicio nuevo dentro de una rutina hereda su `muscle`.
- **Diccionarios por nombre de ejercicio**: `EX_BASE` (peso base kg), `EX_HOW` (técnica), `EX_IMG` (imagen, dominio público de free-exercise-db). Si añades un ejercicio nuevo, añade sus entradas en los tres.
- **Bienestar / no-números en dieta**: mantén la dieta como ideas de comidas SIN calorías ni macros. No des cifras de déficit. Nada de contenido que fomente conductas alimentarias no saludables.

---

## 2. Estado ACTUAL (lo ya hecho en esta tanda)

En `src/App.jsx` ya está aplicado:
1. Iconos importados: `Settings, Bell, CreditCard, User, Users, ChevronRight, Plus, X` (además de los previos).
2. Almacenamiento con prefijo de perfil: `STORE_PREFIX`, `setStorePrefix()`, `loadKey/saveKey` usan prefijo, y `loadGlobal/saveGlobal` para claves globales.
3. `DEFAULT_STATE` ampliado: `profile.sex` (`"no_especificado"|"hombre"|"mujer"`), `profile.units` (`"kg"`), `reminders:{enabled,hour,minute,days}` (days: 0=Dom..6=Sáb), `sub:{enabled,renewalDay,price}`.
4. Ejercicios femeninos en `EX_BASE` y `EX_HOW`: Hip thrust, Puente de glúteo, Patada de glúteo en polea, Abductores/Aductores en máquina, Peso muerto sumo, Sentadilla sumo con mancuerna, Zancada caminando, Good morning.
5. `baseFor(name, sex)` — escala el peso base ×0.62 si `sex==="mujer"`. `startWorkout` ya lo usa.

**El archivo compila.** Lo que sigue NO está hecho.

---

## 3. Tareas PENDIENTES (con código listo para pegar)

### T1 · Imágenes de los ejercicios femeninos (`EX_IMG`)
Añade estas entradas dentro del objeto `const EX_IMG = { ... }` (justo antes de su `};`). URLs verificadas (HTTP 200, dominio público):

```js
  "Hip thrust": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Hip_Thrust/0.jpg",
  "Puente de glúteo": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Butt_Lift_Bridge/0.jpg",
  "Patada de glúteo en polea": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Legged_Cable_Kickback/0.jpg",
  "Abductores en máquina": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Thigh_Abductor/0.jpg",
  "Aductores en máquina": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Thigh_Adductor/0.jpg",
  "Peso muerto sumo": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sumo_Deadlift/0.jpg",
  "Sentadilla sumo con mancuerna": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plie_Dumbbell_Squat/0.jpg",
  "Zancada caminando": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bodyweight_Walking_Lunge/0.jpg",
  "Good morning": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Good_Morning/0.jpg",
```

### T2 · Rutinas femeninas (`sex:"f"`)
Añade estos 3 objetos al array `ROUTINES` (p. ej. justo antes del comentario `/* -------- EXPRESS -------- */`). Usan `sex:"f"` para filtrarse solo en modo mujer. Reutilizan categorías existentes.

```js
  /* -------- MUJER (aparecen solo con perfil femenino) -------- */
  { id:"f_fullbody", cat:"Acondicionamiento", sex:"f", name:"Full Body Mujer (inicio)", subtitle:"3 días · RPE 6-7 · empieza aquí",
    daysPerWeek:3, rpe:"6-7",
    blurb:"Cuerpo completo con énfasis en glúteo y pierna, reps altas y peso cómodo para coger técnica y crear el hábito.",
    days:[
      { name:"Día A", exercises:[
        { name:"Sentadilla goblet", sets:3, reps:"12-15", rest:75, muscle:"Pierna" },
        { name:"Puente de glúteo", sets:3, reps:"12-15", rest:60, muscle:"Pierna" },
        { name:"Press mancuernas sentado", sets:3, reps:"12-15", rest:60, muscle:"Hombro" },
        { name:"Remo con mancuerna", sets:3, reps:"12-15", rest:60, muscle:"Espalda" },
        { name:"Plancha", sets:3, reps:"30 s", rest:45, muscle:"Core" },
      ]},
      { name:"Día B", exercises:[
        { name:"Peso muerto rumano mancuernas", sets:3, reps:"12-15", rest:75, muscle:"Femoral" },
        { name:"Hip thrust", sets:3, reps:"12", rest:75, muscle:"Pierna" },
        { name:"Jalón al pecho", sets:3, reps:"12-15", rest:60, muscle:"Espalda" },
        { name:"Elevaciones laterales", sets:3, reps:"12-15", rest:45, muscle:"Hombro" },
        { name:"Elevación de piernas", sets:3, reps:"12-15", rest:45, muscle:"Core" },
      ]},
      { name:"Día C", exercises:[
        { name:"Sentadilla sumo con mancuerna", sets:3, reps:"12-15", rest:75, muscle:"Pierna" },
        { name:"Patada de glúteo en polea", sets:3, reps:"12/pierna", rest:45, muscle:"Pierna" },
        { name:"Aperturas", sets:3, reps:"12-15", rest:45, muscle:"Pecho" },
        { name:"Curl de bíceps mancuernas", sets:2, reps:"12-15", rest:45, muscle:"Bíceps" },
        { name:"Plancha", sets:3, reps:"30 s", rest:45, muscle:"Core" },
      ]},
    ]},
  { id:"f_glute", cat:"Recomposición", sex:"f", name:"Glúteo y Pierna", subtitle:"4 días · foco tren inferior",
    daysPerWeek:4, rpe:"7-8",
    blurb:"Prioriza glúteo y pierna con volumen suficiente para recomponer, más un día de torso para equilibrar.",
    days:[
      { name:"Glúteo A", exercises:[
        { name:"Hip thrust", sets:4, reps:"8-12", rest:120, muscle:"Pierna" },
        { name:"Peso muerto sumo", sets:3, reps:"8-10", rest:120, muscle:"Pierna" },
        { name:"Prensa", sets:3, reps:"12-15", rest:90, muscle:"Pierna" },
        { name:"Abductores en máquina", sets:4, reps:"15-20", rest:45, muscle:"Pierna" },
        { name:"Puente de glúteo", sets:3, reps:"15", rest:45, muscle:"Pierna" },
      ]},
      { name:"Torso", exercises:[
        { name:"Press inclinado mancuernas", sets:3, reps:"10-12", rest:75, muscle:"Pecho" },
        { name:"Remo en máquina", sets:4, reps:"10-12", rest:75, muscle:"Espalda" },
        { name:"Press militar mancuernas", sets:3, reps:"10-12", rest:60, muscle:"Hombro" },
        { name:"Jalón al pecho", sets:3, reps:"10-12", rest:60, muscle:"Espalda" },
        { name:"Curl con barra", sets:3, reps:"12", rest:45, muscle:"Bíceps" },
      ]},
      { name:"Glúteo B", exercises:[
        { name:"Sentadilla", sets:4, reps:"8-10", rest:120, muscle:"Pierna" },
        { name:"Zancada caminando", sets:3, reps:"12/pierna", rest:75, muscle:"Pierna" },
        { name:"Patada de glúteo en polea", sets:3, reps:"15/pierna", rest:45, muscle:"Pierna" },
        { name:"Curl femoral sentado", sets:3, reps:"12-15", rest:60, muscle:"Femoral" },
        { name:"Abductores en máquina", sets:4, reps:"15-20", rest:45, muscle:"Pierna" },
      ]},
      { name:"Full / core", exercises:[
        { name:"Peso muerto rumano", sets:3, reps:"10-12", rest:90, muscle:"Femoral" },
        { name:"Elevación de gemelos", sets:4, reps:"15-20", rest:45, muscle:"Gemelo" },
        { name:"Rueda abdominal", sets:3, reps:"10-12", rest:45, muscle:"Core" },
        { name:"Elevación de piernas colgado", sets:3, reps:"12", rest:45, muscle:"Core" },
      ]},
    ]},
  { id:"f_ul", cat:"Hipertrofia", sex:"f", name:"Torso / Pierna Mujer", subtitle:"4 días · glúteo + volumen",
    daysPerWeek:4, rpe:"8-9",
    blurb:"Cuatro días con énfasis en tren inferior y trabajo de torso para un físico equilibrado.",
    days:[
      { name:"Pierna A", exercises:[
        { name:"Hip thrust", sets:4, reps:"8-12", rest:120, muscle:"Pierna" },
        { name:"Sentadilla", sets:4, reps:"8-10", rest:150, muscle:"Pierna" },
        { name:"Peso muerto rumano", sets:3, reps:"10-12", rest:90, muscle:"Femoral" },
        { name:"Abductores en máquina", sets:4, reps:"15-20", rest:45, muscle:"Pierna" },
        { name:"Elevación de gemelos", sets:4, reps:"15-20", rest:45, muscle:"Gemelo" },
      ]},
      { name:"Torso A", exercises:[
        { name:"Press inclinado mancuernas", sets:4, reps:"10-12", rest:90, muscle:"Pecho" },
        { name:"Remo con mancuerna", sets:4, reps:"10-12", rest:75, muscle:"Espalda" },
        { name:"Elevaciones laterales", sets:4, reps:"12-15", rest:45, muscle:"Hombro" },
        { name:"Jalón al pecho", sets:3, reps:"10-12", rest:75, muscle:"Espalda" },
        { name:"Extensión de tríceps", sets:3, reps:"12-15", rest:45, muscle:"Tríceps" },
      ]},
      { name:"Pierna B", exercises:[
        { name:"Peso muerto sumo", sets:4, reps:"6-8", rest:150, muscle:"Pierna" },
        { name:"Prensa", sets:4, reps:"12-15", rest:90, muscle:"Pierna" },
        { name:"Patada de glúteo en polea", sets:3, reps:"15/pierna", rest:45, muscle:"Pierna" },
        { name:"Curl femoral tumbado", sets:3, reps:"12-15", rest:60, muscle:"Femoral" },
        { name:"Puente de glúteo", sets:3, reps:"15", rest:45, muscle:"Pierna" },
      ]},
      { name:"Torso B", exercises:[
        { name:"Press mancuernas sentado", sets:4, reps:"10-12", rest:90, muscle:"Hombro" },
        { name:"Remo en máquina", sets:4, reps:"12-15", rest:75, muscle:"Espalda" },
        { name:"Aperturas en polea", sets:3, reps:"12-15", rest:60, muscle:"Pecho" },
        { name:"Curl de bíceps", sets:3, reps:"12-15", rest:45, muscle:"Bíceps" },
        { name:"Plancha", sets:3, reps:"45 s", rest:45, muscle:"Core" },
      ]},
    ]},
```

### T3 · Filtrar rutinas por sexo en `RoutinesView`
En `RoutinesView`, calcula el sexo del perfil y filtra: muestra una rutina si **no tiene `sex`** (unisex) **o** su `sex` coincide con el perfil.

```js
// dentro de RoutinesView, arriba:
const sexTag = state.profile?.sex === "mujer" ? "f" : "m";
// donde haces list = ROUTINES.filter(r => r.cat === cat) ...
const list = ROUTINES.filter(r => r.cat === cat && (!r.sex || r.sex === sexTag));
```

### T4 · Helpers de notificaciones y renovación (nivel módulo)
Pega estas funciones junto al resto de helpers (después de `addDaysISO`). Usan el bridge global; en navegador hacen fallback suave.

```js
const LN = () => (typeof window !== "undefined" && window.Capacitor?.Plugins?.LocalNotifications) || null;
async function ensureNotifPerm(){
  const ln = LN();
  if (ln) { try { const r = await ln.requestPermissions(); return r.display === "granted"; } catch { return false; } }
  if (typeof Notification !== "undefined") { try { return (await Notification.requestPermission()) === "granted"; } catch { return false; } }
  return false;
}
function nextRenewalDate(day){
  const now = new Date(); let y = now.getFullYear(), m = now.getMonth();
  if (now.getDate() >= day) { m++; if (m > 11) { m = 0; y++; } }
  const dim = new Date(y, m + 1, 0).getDate();
  return new Date(y, m, Math.min(day, dim)).toISOString().slice(0, 10);
}
function daysUntil(iso){ return Math.ceil((new Date(iso + "T00:00:00") - new Date(todayISO() + "T00:00:00")) / 864e5); }
async function scheduleAllReminders(reminders, sub){
  const ln = LN(); if (!ln) return;   // el aviso real solo funciona en la app instalada
  try { await ln.cancel({ notifications: Array.from({ length: 40 }, (_, i) => ({ id: i + 1 })) }); } catch {}
  const notifs = [];
  if (reminders?.enabled) {
    (reminders.days || []).forEach((d, i) => {
      notifs.push({ id: i + 1, title: "Hora de entrenar 💪",
        body: "Tu forja te espera. Vamos con la sesión de hoy.",
        schedule: { on: { weekday: (d % 7) + 1, hour: reminders.hour, minute: reminders.minute }, repeats: true } });
    });
  }
  if (sub?.enabled && sub.renewalDay) {
    const next = nextRenewalDate(sub.renewalDay); const warn = addDaysISO(next, -3);
    notifs.push({ id: 30, title: "Cuota del gym en 3 días",
      body: `El ${next.slice(8,10)}/${next.slice(5,7)} se renueva tu suscripción. Si no vas a seguir, cancélala a tiempo.`,
      schedule: { at: new Date(warn + "T10:00:00") } });
  }
  if (notifs.length) { try { await ln.schedule({ notifications: notifs }); } catch (e) { console.error(e); } }
}
```
> Capacitor `weekday`: 1=Domingo..7=Sábado. Como `days` usa 0=Dom..6=Sáb, `(d % 7) + 1` mapea correctamente.

### T5 · Multi-perfil en `App` (estado, carga/migración, handlers)
En `App`:
1. Añade estado: `const [profiles, setProfiles] = useState([]);` y `const [activeId, setActiveId] = useState("p1");`
2. Sustituye el `useEffect` de carga inicial por carga vía perfiles + **migración** que crea `p1` (datos existentes, sin prefijo) y `p2 "Pareja"` (modo femenino con sus datos):

```js
useEffect(() => { (async () => {
  let roster = await loadGlobal("gym:profiles", null);
  let active = await loadGlobal("gym:activeProfile", "p1");
  if (!roster) {
    setStorePrefix("p1");
    const existing = await loadKey("gym:state", null);
    roster = [{ id: "p1", name: existing?.profile?.name || "Perfil 1", sex: existing?.profile?.sex || "no_especificado" }];
    setStorePrefix("p2");
    await saveKey("gym:state", { ...DEFAULT_STATE,
      profile: { name: "Pareja", weightKg: 75, heightCm: 162, sex: "mujer", units: "kg" },
      activeRoutine: "f_fullbody", startDate: todayISO(), weekStart: mondayOf(todayISO()) });
    roster.push({ id: "p2", name: "Pareja", sex: "mujer" });
    active = "p1";
    await saveGlobal("gym:profiles", roster);
    await saveGlobal("gym:activeProfile", active);
  }
  setProfiles(roster); setActiveId(active);
  await loadProfileData(active);
  setLoading(false);
})(); }, []);
```
3. Añade `loadProfileData` y los handlers:

```js
async function loadProfileData(id){
  setStorePrefix(id);
  const s = await loadKey("gym:state", DEFAULT_STATE);
  const l = await loadKey("gym:log", []);
  const m = await loadKey("gym:measures", []);
  const mp = await loadKey("gym:mealplan", null);
  const exc = await loadKey("gym:excludes", []);
  const nowMon = mondayOf(todayISO());
  if (s.weekStart !== nowMon) { if (!s.weekGoalMet) s.weekStreak = 0; s.weekStart = nowMon; s.weeklyCount = 0; s.weekGoalMet = false; }
  const merged = { ...DEFAULT_STATE, ...s,
    profile: { ...DEFAULT_STATE.profile, ...(s.profile || {}) },
    reminders: { ...DEFAULT_STATE.reminders, ...(s.reminders || {}) },
    sub: { ...DEFAULT_STATE.sub, ...(s.sub || {}) } };
  setState(merged); setLog(l); setMeasures(m); setMealPlan(mp); setExcludesState(exc);
  scheduleAllReminders(merged.reminders, merged.sub);
}
async function switchProfile(id){ setLoading(true); setActiveId(id); await saveGlobal("gym:activeProfile", id); await loadProfileData(id); setTab("home"); setLoading(false); }
async function addProfile({ name, sex }){
  const id = "p" + Date.now().toString(36);
  setStorePrefix(id);
  await saveKey("gym:state", { ...DEFAULT_STATE,
    profile: { name, weightKg: 70, heightCm: 170, sex, units: "kg" },
    activeRoutine: sex === "mujer" ? "f_fullbody" : "acli_fb", startDate: todayISO(), weekStart: mondayOf(todayISO()) });
  const next = [...profiles, { id, name, sex }];
  setProfiles(next); await saveGlobal("gym:profiles", next);
  await switchProfile(id);
}
function updateProfile(fields){
  const np = { ...state.profile, ...fields }; const ns = { ...state, profile: np };
  setState(ns); persist(ns);
  const roster = profiles.map(p => p.id === activeId ? { ...p, name: np.name, sex: np.sex } : p);
  setProfiles(roster); saveGlobal("gym:profiles", roster);
}
function setReminders(r){ const ns = { ...state, reminders: r }; setState(ns); persist(ns); scheduleAllReminders(r, ns.sub); }
function setSub(s){ const ns = { ...state, sub: s }; setState(ns); persist(ns); scheduleAllReminders(ns.reminders, s); }
```
> `persist(ns)` ya existe y escribe con `STORE_PREFIX`, que apunta al perfil activo. Correcto.

### T6 · Pantalla de Ajustes (`SettingsView`)
Nueva vista (no ocupa hueco en la barra: se abre con un engranaje en el header de Inicio). Renderízala con `{tab === "ajustes" && <SettingsView {...{ state, updateProfile, profiles, activeId, switchProfile, addProfile, setReminders, setSub, setTab }} />}`. Debe incluir:
- **Perfil activo**: nombre (input), sexo (selector Hombre/Mujer/—), peso y altura (inputs). Al cambiar sexo a "mujer" se activan rutinas femeninas y el escalado de pesos. Nota: las **mediciones siguen abiertas** en la pestaña Progreso (no las bloquees).
- **Cambiar de perfil**: lista `profiles` con botón para activar cada uno + botón "Añadir perfil" (pide nombre y sexo → `addProfile`).
- **Recordatorios de entrenamiento**: toggle `reminders.enabled` (al activar, llama `await ensureNotifPerm()`), selector de hora (hour/minute) y chips de días (L-D → índices 0-6). Guarda con `setReminders`.
- **Suscripción del gym**: toggle `sub.enabled`, día de renovación (1-31), precio opcional. Guarda con `setSub`. Muestra "próxima renovación: {nextRenewalDate(sub.renewalDay)} · faltan {daysUntil(...)} días".
- Aviso honesto en la UI: "Los recordatorios en segundo plano solo funcionan en la app instalada (APK)."

Usa `.fh-card`, `.fh-btn`, inputs/selects existentes. Sigue el patrón visual de las otras vistas.

### T7 · Inicio: engranaje + banner de suscripción
En `HomeView` (recibe `setTab` y `state`):
- Añade un botón engranaje (`Settings`) en el header (arriba a la derecha, junto al chip de racha) → `onClick={() => setTab("ajustes")}`.
- Si `state.sub?.enabled`: calcula `const d = daysUntil(nextRenewalDate(state.sub.renewalDay));` y si `d <= 3` muestra un banner (`.fh-card` borde `--ember`): "Tu cuota del gym se renueva en {d} día(s) (día {renewalDay}). Cancela antes si no vas a seguir para evitar el pago." Icono `CreditCard`.

### T8 · Calendario de entrenamientos
Nuevo componente `WorkoutCalendar({ log, sub })` y renderízalo **al principio de `ProgressView`** (recibe `log`; pásale también `sub` desde `state`). Especificación:
- Rejilla mensual (semana empieza en lunes). Estado local `month` para navegar (‹ ›).
- Mapa `date -> workouts` desde `log` (cada registro tiene `date`, `routineName`, `dayName`, `volume`).
- Marca: días con entreno → punto/relleno `--gold`; hoy → borde; día de pago (`nextRenewalDate` si `sub.enabled`) → marcador `€` `--ember`.
- Al tocar un día con entrenos, muestra debajo su detalle (rutina/día · volumen).
- Encabezado con nombre de mes y contador de entrenos del mes.

### T9 · Nota de dieta en modo femenino
En `DietView`, si `state.profile?.sex === "mujer"`, muestra una nota informativa breve (sin cifras): prioriza proteína en cada comida y alimentos ricos en hierro (espinacas, legumbres, carne roja, marisco) por las mayores necesidades de hierro; las raciones se ajustan al apetito y objetivo. Mantén el descargo de dietista.

### T10 · Repaso de sintaxis/gramática (español de España)
Lee todas las cadenas visibles y corrige erratas, tildes y concordancias. Puntos a vigilar: consistencia "Acondicionamiento" (no "aclimatación"), tildes en mayúsculas, unidades ("kg", "min", "s"), y textos de avisos. No cambies identificadores internos (p. ej. el `id:"aclimatacion"` de la fase puede quedarse; solo lo visible importa).

### T11 · Empaquetado / Capacitor
- `@capacitor/local-notifications` ya está en `package.json`. Tras `npm install`, ejecuta `npx cap sync android`.
- Android 13+ requiere permiso `POST_NOTIFICATIONS`; el plugin lo solicita vía `ensureNotifPerm()`. Verifica que `android/app/src/main/AndroidManifest.xml` incluye el permiso (Capacitor 6 lo añade con el plugin; si no, añádelo).
- Las imágenes de ejercicios se cargan online (GitHub raw). Opcional: descargarlas a `public/exercises/` y reescribir `EX_IMG` a rutas locales para 100% offline.

---

## 4. Orden sugerido y validación

1. T1 → T2 → T3 (datos y filtrado; `npm run build`).
2. T4 → T5 (notificaciones + multi-perfil; `npm run build`, prueba en `npm run dev` que arranca y crea "Pareja").
3. T6 → T7 (ajustes + inicio).
4. T8 (calendario).
5. T9 (dieta).
6. T10 (gramática).
7. T11 (Capacitor sync + APK).

Tras cada paso: `npm run build` debe terminar sin errores. Prueba en `npm run dev`: cambiar a perfil "Pareja" debe mostrar rutinas femeninas y pesos base más bajos; activar recordatorios/suscripción no debe romper en navegador (los avisos reales solo en APK).

## 5. Gotchas
- No importes el plugin de notificaciones con `import`: usa el bridge global (rompe el build web si no está instalado).
- `EX_MUSCLE` se deriva de `ROUTINES`: cualquier ejercicio nuevo debe usarse dentro de una rutina para tener `muscle`; si no, añade también su clave a mano.
- Al añadir ejercicios nuevos, completa `EX_BASE`, `EX_HOW` y `EX_IMG`.
- El primer perfil `p1` NO lleva prefijo (compatibilidad). No cambies esa regla o perderás los datos existentes.
- Mantén la dieta sin números (bienestar). No añadas conteos de calorías/macros.
