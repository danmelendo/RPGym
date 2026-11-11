#!/usr/bin/env node
/* =============================================================================
   RPGym · Resumen quincenal de entrenamiento con Claude (headless)

   Para cada persona que lo tenga ACTIVADO (`profiles.resumen_ia`), si su último
   resumen tiene 13 días o más y ha entrenado en las dos últimas semanas:
     1. lee de la base TODO su historial, sus marcas y sus resúmenes anteriores,
     2. lo condensa: trayectoria mes a mes y por ejercicio, más el detalle de las
        últimas semanas (todo en crudo sería caro y no aporta más),
     3. se lo pasa a `claude -p` sin herramientas,
     4. guarda el texto en `resumenes`. Nunca se borran: la app los enseña en
        Inicio y en Progreso → Resúmenes, que es el histórico.

   Se lanza cada semana; la regla de los 13 días lo deja en uno cada dos semanas.

   Uso:
     node scripts/resumen-quincenal.mjs                      # el lote normal
     node scripts/resumen-quincenal.mjs --solo dan_theadmin --prueba --salida C:/ruta/resumen.txt
       --prueba  no guarda nada en la base (y con --solo no exige el opt-in:
                 es para que el dueño se lo pruebe a sí mismo)
       --forzar  se salta la regla de los 13 días
       --volcar <fichero>  con --prueba, guarda también el prompt para revisarlo
       --reemplazar  (solo con --solo) el nuevo sustituye al último de esa persona
                     en vez de sumarse: para rehacerlo cuando cambia el prompt

   Credenciales (nunca se imprimen):
     SUPABASE_DB_URL                     o bien
     SUPABASE_PROJECT_REF + SUPABASE_DB_PASSWORD (como en .env)
     Claude: la sesión que ya tengas iniciada en este PC (tu suscripción). A
     propósito NO se usa API key: sería gasto aparte del plan.

   Se ejecuta en el PC del dueño con una tarea programada de Windows
   (scripts/programar-resumenes.ps1 la crea): `node --env-file=.env …`.
   No escribe en la salida nada personal, solo recuentos.
   ============================================================================= */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import pg from "pg";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const flag = n => args.includes(n);
const valor = n => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };

const SOLO = valor("--solo");
const PRUEBA = flag("--prueba");
const FORZAR = flag("--forzar");
const SALIDA = valor("--salida");
const VOLCAR = valor("--volcar");
const REEMPLAZAR = flag("--reemplazar");
if (REEMPLAZAR && !SOLO) { console.error("--reemplazar solo vale con --solo <handle>"); process.exit(1); }
const DIAS = 14;
const DETALLE_SEMANAS = 6;     // detalle serie a serie; lo anterior va condensado por mes
const RESUMENES_PREVIOS = 3;   // para que siga lo que recomendó la otra vez
const MODELO = process.env.RESUMEN_MODELO || "sonnet";

function urlBase(){
  if (process.env.SUPABASE_DB_URL) return process.env.SUPABASE_DB_URL;
  const ref = process.env.SUPABASE_PROJECT_REF, pass = process.env.SUPABASE_DB_PASSWORD;
  if (!ref || !pass) throw new Error("Faltan SUPABASE_DB_URL o SUPABASE_PROJECT_REF + SUPABASE_DB_PASSWORD");
  const host = process.env.SUPABASE_POOLER_HOST || "aws-0-eu-central-1.pooler.supabase.com";
  return `postgresql://postgres.${ref}:${encodeURIComponent(pass)}@${host}:5432/postgres`;
}
const tapar = s => String(s).replace(/postgres(ql)?:\/\/\S+/g, "<oculta>");

/* El catálogo de la app, para que lo que recomiende Claude se pueda elegir en el
   configurador tal cual. Se lee de src/App.jsx (las claves de EX_HOW). */
function catalogo(){
  const src = fs.readFileSync(path.join(RAIZ, "src/App.jsx"), "utf8");
  const ini = src.indexOf("const EX_HOW = {");
  if (ini < 0) return [];
  const fin = src.indexOf("\n};", ini);
  return [...src.slice(ini, fin).matchAll(/^\s*"([^"]+)"\s*:/gm)].map(m => m[1]);
}

/* El rango por tipo de ejercicio, sacado de src/App.jsx (`REPS_PEQUENO` y
   `REPS_COMPUESTO`) para que el resumen y la app pidan lo mismo. Solo hace falta
   cuando el entreno no trae `objetivo` (los anteriores a la 1.0.20). */
function rangos(){
  const src = fs.readFileSync(path.join(RAIZ, "src/App.jsx"), "utf8");
  const re = n => { const m = src.match(new RegExp(`const ${n} = /(.+)/i;`)); return m ? new RegExp(m[1], "i") : null; };
  const peq = re("REPS_PEQUENO"), comp = re("REPS_COMPUESTO");
  return nombre => peq?.test(nombre) ? "12-15" : comp?.test(nombre) ? "6-10" : "8-12";
}
const rangoPorTipo = rangos();

const fmtSerie = l => {
  if (Number(l.weight) > 0) return `${l.weight}×${l.reps}`;
  const extra = [l.km ? `${l.km} km` : "", l.level ? `nivel ${l.level}` : ""].filter(Boolean).join(" ");
  return `${l.reps ?? "?"}${extra ? ` (${extra})` : ""}`;
};
function fmtEntreno(w){
  const lineas = [`${w.dia} · ${w.rutina || "sin rutina"}`];
  for (const ex of w.detalle || []) {
    const series = (ex.logs || []).filter(l => l.reps !== "" && l.reps != null);
    if (!series.length) continue;   // ejercicio de la rutina que no llegó a hacerse
    const conPeso = series.some(l => Number(l.weight) > 0);
    const obj = ex.objetivo ? `objetivo ${ex.objetivo}` : conPeso ? `rango por tipo ${rangoPorTipo(ex.name)}` : "";
    lineas.push(`  - ${ex.name} [${[ex.muscle || "?", obj].filter(Boolean).join(", ")}]: ${series.map(fmtSerie).join(", ")}`);
  }
  return lineas.join("\n");
}

/* La serie más pesada de un ejercicio en una sesión (y sus repeticiones). */
const mejor = (a, b) => Number(b.weight) > Number(a.weight) || (Number(b.weight) === Number(a.weight) && Number(b.reps) > Number(a.reps));
function serieTop(ex){
  const s = (ex.logs || []).filter(l => Number(l.weight) > 0 && Number(l.reps) > 0);
  return s.length ? s.reduce((a, l) => mejor(a, l) ? l : a) : null;
}

/* Toda la historia en poco texto: sesiones y series por grupo cada mes, y por
   ejercicio con carga, su mejor serie de cada mes de principio a fin. Es lo que
   deja ver la tendencia (sube, se estanca, se abandona) sin mandar cada serie. */
function trayectoria(entrenos){
  const meses = new Map(), ejercicios = new Map();
  for (const w of entrenos) {
    const mes = w.dia.slice(0, 7);
    const m = meses.get(mes) || { sesiones: 0, grupos: {} };
    m.sesiones++;
    for (const ex of w.detalle || []) {
      const hechas = (ex.logs || []).filter(l => l.reps !== "" && l.reps != null).length;
      if (!hechas) continue;
      const g = ex.muscle || "?";
      m.grupos[g] = (m.grupos[g] || 0) + hechas;
      const top = serieTop(ex);
      if (!top) continue;
      const e = ejercicios.get(ex.name) || { sesiones: 0, meses: new Map(), ultimo: null };
      e.sesiones++;
      const prev = e.meses.get(mes);
      if (!prev || mejor(prev, top)) e.meses.set(mes, top);
      e.ultimo = w.dia;
      ejercicios.set(ex.name, e);
    }
    meses.set(mes, m);
  }
  const porMes = [...meses].map(([mes, m]) =>
    `${mes}: ${m.sesiones} sesiones · series por grupo: ${Object.entries(m.grupos).sort((a, b) => b[1] - a[1]).map(([g, n]) => `${g} ${n}`).join(", ")}`);
  const porEjercicio = [...ejercicios].sort((a, b) => b[1].sesiones - a[1].sesiones).map(([nombre, e]) =>
    `${nombre} (${e.sesiones} ses., última ${e.ultimo}): ${[...e.meses].map(([mes, t]) => `${mes} ${t.weight}×${t.reps}`).join(" → ")}`);
  return { porMes, porEjercicio };
}

function prompt({ nombre, entrenos, desde, hasta, desdeDetalle, marcas, previos, cat }){
  const quincena = entrenos.filter(w => w.dia >= desde);
  const detalleAntes = entrenos.filter(w => w.dia >= desdeDetalle && w.dia < desde);
  const { porMes, porEjercicio } = trayectoria(entrenos);
  return `Eres el entrenador personal de ${nombre} dentro de RPGym, una app de gimnasio para un grupo pequeño de amigos. Escribe su RESUMEN QUINCENAL (${desde} → ${hasta}).

Cómo escribir:
- Español de España, tuteando, cercano y directo. Nada de relleno ni de felicitaciones vacías.
- Texto plano, sin markdown (ni #, ni **). Cuatro apartados con su título en una línea propia en MAYÚSCULAS: "TU TRAYECTORIA", "ESTA QUINCENA", "PROGRESIÓN" y "PARA LAS PRÓXIMAS DOS SEMANAS". Las listas con "- " al principio de línea.
- Entre 220 y 380 palabras en total.
- Cifras concretas sacadas de los datos (kilos, repeticiones, sesiones, meses). No te inventes nada que no esté en los datos.

Qué mirar:
- La trayectoria general, lo primero y lo más importante: desde que empezó, ¿cómo ha ido? Constancia mes a mes, qué ejercicios suben de verdad, cuáles llevan tiempo estancados, qué grupos ha ido dejando y qué patrones se repiten. La quincena es el último capítulo de esa historia, no el todo.
- Esta quincena: constancia y reparto entre grupos musculares. Señala con claridad un grupo descuidado si lo hay.
- Si hay resúmenes anteriores, di en una línea si siguió lo que se le recomendó (si subió el peso propuesto, si metió lo que faltaba). Sin reñir, y sin repetir el mismo consejo con las mismas palabras.
- Progresión de peso con doble progresión, respetando el RANGO DE CADA EJERCICIO, que va entre corchetes: "objetivo" es el de su rutina; si no lo hay, "rango por tipo". NO hay un tope de 12 repeticiones para todo: en multiarticulares pesados (press, remo, jalón, sentadilla, prensa, peso muerto) lo normal es 6-10; en aislamiento 8-12; en músculos pequeños (laterales, face pull, gemelo) 12-15. Si completó todas las series en el extremo ALTO de su rango con el mismo peso, propón subir (2,5 kg en máquina o polea, 1-2 kg en mancuerna) y volver al extremo bajo. Si no llega al extremo bajo, el peso es demasiado alto. Da el peso concreto a probar en 2 a 5 ejercicios.
- Si un multiarticular pesado tiene en su rutina un objetivo alto (10-12 o más) y se ve estancado ahí, sugiere bajarle el rango en la rutina (por ejemplo a 6-10) para poder cargar más.
- Recomienda 1 a 3 ejercicios nuevos SOLO de este catálogo (escribe el nombre exacto), pensados para lo que le falte. No juntes en un mismo día dos ejercicios de la misma técnica.
- Las series con número sin "×" son de peso corporal, tiempo o cardio. "Dominadas o jalón" con kilos es el jalón en polea. En "Fondos asistidos" y "Dominada asistida", más kilos es MÁS ayuda.

Límites: nada de dieta, calorías ni suplementos; nada de diagnósticos. Si algo apunta a molestia o lesión, sugiere consultarlo con un profesional.

CATÁLOGO DE EJERCICIOS DE LA APP:
${cat.join(" · ")}

TRAYECTORIA POR MES (desde el primer entreno):
${porMes.join("\n")}

EVOLUCIÓN POR EJERCICIO (mejor serie de cada mes, peso×repeticiones):
${porEjercicio.join("\n") || "(ninguno con carga)"}

ENTRENOS DE ESTA QUINCENA (detalle):
${quincena.map(fmtEntreno).join("\n\n")}

ENTRENOS DE LAS SEMANAS ANTERIORES (detalle, desde ${desdeDetalle}):
${detalleAntes.length ? detalleAntes.map(fmtEntreno).join("\n\n") : "(ninguno)"}

MEJORES MARCAS (ejercicio: peso máximo · sesiones en que lo ha hecho):
${marcas.map(r => `${r.ejercicio}: ${Number(r.peso)} kg · ${r.veces ?? "?"} ses.`).join("\n") || "(ninguna)"}

RESÚMENES QUE YA LE MANDASTE (del más reciente al más viejo):
${previos.length ? previos.map(r => `--- ${r.desde} → ${r.hasta}\n${r.texto.slice(0, 2500)}`).join("\n\n") : "(es el primero)"}

Responde SOLO con el resumen.`;
}

function preguntarAClaude(texto){
  // Sin herramientas, sin MCP, sin sesión guardada y desde una carpeta neutra para
  // que no cargue el CLAUDE.md del proyecto: solo tiene que escribir.
  const win = process.platform === "win32";
  const r = spawnSync("claude", ["-p", "--model", MODELO, "--tools", win ? '""' : "",
    "--strict-mcp-config", "--no-session-persistence", "--output-format", "text"], {
    input: texto, cwd: os.tmpdir(), encoding: "utf8", shell: win, timeout: 300_000,
    maxBuffer: 4 * 1024 * 1024,
  });
  if (r.status !== 0) throw new Error(`claude terminó con código ${r.status}: ${(r.stderr || "").slice(0, 300)}`);
  const out = (r.stdout || "").trim();
  if (out.length < 80) throw new Error("Respuesta vacía o demasiado corta");
  return out.slice(0, 6000);
}

const isoDia = d => d.toISOString().slice(0, 10);   // para el servidor, en UTC: suficiente

async function main(){
  const db = new pg.Client({ connectionString: urlBase(), ssl: { rejectUnauthorized: false } });
  await db.connect();
  const cat = catalogo();
  const hoy = new Date();
  const desde = isoDia(new Date(hoy.getTime() - (DIAS - 1) * 864e5));
  const hasta = isoDia(hoy);
  const desdeDetalle = isoDia(new Date(hoy.getTime() - DETALLE_SEMANAS * 7 * 864e5));

  // En prueba se puede lanzar antes de aplicar la migración: sin la tabla, no hay "último".
  const { rows: [{ hay }] } = await db.query(`select to_regclass('public.resumenes') is not null as hay`);
  if (!hay && !PRUEBA) throw new Error("Falta aplicar la migración 20261111000000_resumenes_y_canal_alt.sql");
  const filtroOptIn = SOLO && PRUEBA ? "true" : "p.resumen_ia";
  const ultimo = hay ? "(select max(created_at) from public.resumenes r where r.user_id = p.id)" : "null";
  const { rows: gente } = await db.query(
    `select p.id, p.handle, p.display_name, ${ultimo} as ultimo
       from public.profiles p
      where ${filtroOptIn} ${SOLO ? "and p.handle = $1" : ""}`, SOLO ? [SOLO] : []);

  const cuenta = { hechos: 0, recientes: 0, sinEntrenos: 0, fallos: 0 };
  const salida = [];
  for (const p of gente) {
    if (!FORZAR && !REEMPLAZAR && p.ultimo && hoy - new Date(p.ultimo) < 13 * 864e5) { cuenta.recientes++; continue; }
    const { rows: entrenos } = await db.query(
      `select to_char(day,'YYYY-MM-DD') as dia, rutina, detalle from public.workout_points
        where user_id = $1 order by day, created_at`, [p.id]);
    const quincena = entrenos.filter(w => w.dia >= desde);
    if (!quincena.length) { cuenta.sinEntrenos++; continue; }
    const { rows: marcas } = await db.query(
      `select ejercicio, peso, veces from public.exercise_records where user_id = $1 order by ejercicio`, [p.id]);
    const { rows: previos } = hay ? await db.query(
      `select to_char(desde,'YYYY-MM-DD') as desde, to_char(hasta,'YYYY-MM-DD') as hasta, texto
         from public.resumenes where user_id = $1 order by created_at desc limit ${RESUMENES_PREVIOS} offset ${REEMPLAZAR ? 1 : 0}`, [p.id]) : { rows: [] };
    try {
      const pr = prompt({ nombre: p.display_name || p.handle, entrenos, desde, hasta, desdeDetalle, marcas, previos, cat });
      if (PRUEBA && VOLCAR) fs.writeFileSync(VOLCAR, pr, "utf8");
      const texto = preguntarAClaude(pr);
      if (PRUEBA) salida.push(texto);
      else {
        await db.query("begin");
        // El que se reemplaza es el más reciente, y se borra en la misma transacción.
        if (REEMPLAZAR) await db.query(
          `delete from public.resumenes where id = (select id from public.resumenes where user_id = $1 order by created_at desc limit 1)`, [p.id]);
        await db.query(
          `insert into public.resumenes (user_id, desde, hasta, texto, modelo) values ($1,$2,$3,$4,$5)`,
          [p.id, desde, hasta, texto, MODELO]);
        await db.query("commit");
      }
      cuenta.hechos++;
    } catch (e) {
      cuenta.fallos++;
      console.error("Fallo en un resumen:", tapar(e.message));
    }
  }
  await db.end();
  if (PRUEBA && SALIDA) fs.writeFileSync(SALIDA, salida.join("\n\n-----\n\n"), "utf8");
  // Solo recuentos: el registro de Actions es público.
  console.log(`Resúmenes: ${cuenta.hechos} hechos, ${cuenta.recientes} con uno reciente, ` +
    `${cuenta.sinEntrenos} sin entrenos en la quincena, ${cuenta.fallos} fallos${PRUEBA ? " (prueba: nada guardado)" : ""}.`);
  if (cuenta.fallos) process.exitCode = 1;
}

main().catch(e => { console.error(tapar(e.message)); process.exit(1); });
