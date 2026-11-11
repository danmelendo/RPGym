#!/usr/bin/env node
/* =============================================================================
   RPGym · Resumen quincenal de entrenamiento con Claude (headless)

   Para cada persona que lo tenga ACTIVADO (`profiles.resumen_ia`), si su último
   resumen tiene 13 días o más y ha entrenado en las dos últimas semanas:
     1. lee de la base sus entrenos (con detalle) y sus marcas,
     2. se los pasa a `claude -p` sin herramientas,
     3. guarda el texto en `resumenes`, que la app enseña en Inicio.

   Se lanza cada semana (GitHub Actions, .github/workflows/resumenes.yml); la
   regla de los 13 días es la que lo deja en uno cada dos semanas por persona.

   Uso:
     node scripts/resumen-quincenal.mjs                      # el lote normal
     node scripts/resumen-quincenal.mjs --solo dan_theadmin --prueba --salida C:/ruta/resumen.txt
       --prueba  no guarda nada en la base (y con --solo no exige el opt-in:
                 es para que el dueño se lo pruebe a sí mismo)
       --forzar  se salta la regla de los 13 días

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
const DIAS = 14;
const HISTORIA_SEMANAS = 12;   // contexto para ver la progresión, no solo la quincena
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
    lineas.push(`  - ${ex.name} [${ex.muscle || "?"}]: ${series.map(fmtSerie).join(", ")}`);
  }
  return lineas.join("\n");
}

function prompt({ nombre, entrenosQuincena, entrenosAntes, marcas, desde, hasta, cat }){
  return `Eres el entrenador personal de ${nombre} dentro de RPGym, una app de gimnasio para un grupo pequeño de amigos. Escribe su RESUMEN QUINCENAL (${desde} → ${hasta}).

Cómo escribir:
- Español de España, tuteando, cercano y directo. Nada de relleno ni de felicitaciones vacías.
- Texto plano, sin markdown (ni #, ni **). Tres apartados con su título en una línea propia en MAYÚSCULAS: "LO QUE HAS HECHO", "PROGRESIÓN" y "PARA LAS PRÓXIMAS DOS SEMANAS". Las listas con "- " al principio de línea.
- Entre 150 y 280 palabras en total.
- Cifras concretas sacadas de los datos (kilos, repeticiones, sesiones). No te inventes nada que no esté en los datos.

Qué mirar:
- Constancia: cuántas sesiones en la quincena y si el reparto entre grupos musculares está equilibrado. Señala con claridad un grupo descuidado (por ejemplo pierna) si lo hay.
- Progresión de peso con doble progresión: si en un ejercicio completó todas las series en el extremo alto de repeticiones (≈12) con el mismo peso, propón subir (2,5 kg en máquina/polea, 1-2 kg en mancuerna). Si las repeticiones caen mucho entre series o ha bajado de peso, propón mantener. Da el peso concreto a probar en 2 a 4 ejercicios.
- Recomienda 1 a 3 ejercicios nuevos SOLO de este catálogo (escribe el nombre exacto), pensados para lo que le falte. No juntes en un mismo día dos ejercicios de la misma técnica.
- Las series con número sin "×" son de peso corporal, tiempo o cardio. "Dominadas o jalón" con kilos es el jalón en polea. En "Fondos asistidos" y "Dominada asistida", más kilos es MÁS ayuda.

Límites: nada de dieta, calorías ni suplementos; nada de diagnósticos. Si algo apunta a molestia o lesión, sugiere consultarlo con un profesional.

CATÁLOGO DE EJERCICIOS DE LA APP:
${cat.join(" · ")}

ENTRENOS DE ESTA QUINCENA:
${entrenosQuincena.map(fmtEntreno).join("\n\n")}

ENTRENOS ANTERIORES (contexto para la progresión, últimas ${HISTORIA_SEMANAS} semanas):
${entrenosAntes.length ? entrenosAntes.map(fmtEntreno).join("\n\n") : "(ninguno)"}

MEJORES MARCAS (ejercicio: peso máximo · sesiones en que lo ha hecho):
${marcas.map(r => `${r.ejercicio}: ${Number(r.peso)} kg · ${r.veces ?? "?"} ses.`).join("\n") || "(ninguna)"}

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
  const desdeHist = isoDia(new Date(hoy.getTime() - HISTORIA_SEMANAS * 7 * 864e5));

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
    if (!FORZAR && p.ultimo && hoy - new Date(p.ultimo) < 13 * 864e5) { cuenta.recientes++; continue; }
    const { rows: entrenos } = await db.query(
      `select to_char(day,'YYYY-MM-DD') as dia, rutina, detalle from public.workout_points
        where user_id = $1 and day >= $2 order by day, created_at`, [p.id, desdeHist]);
    const quincena = entrenos.filter(w => w.dia >= desde);
    if (!quincena.length) { cuenta.sinEntrenos++; continue; }
    const { rows: marcas } = await db.query(
      `select ejercicio, peso, veces from public.exercise_records where user_id = $1 order by ejercicio`, [p.id]);
    try {
      const texto = preguntarAClaude(prompt({
        nombre: p.display_name || p.handle, entrenosQuincena: quincena,
        entrenosAntes: entrenos.filter(w => w.dia < desde), marcas, desde, hasta, cat }));
      if (PRUEBA) salida.push(texto);
      else await db.query(
        `insert into public.resumenes (user_id, desde, hasta, texto, modelo) values ($1,$2,$3,$4,$5)`,
        [p.id, desde, hasta, texto, MODELO]);
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
