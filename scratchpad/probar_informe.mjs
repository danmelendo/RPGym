/* Prueba del informe semanal con fechas fijas.
   Extrae las funciones REALES de src/App.jsx (no una copia) y las ejecuta con
   un "hoy" congelado, para que el resultado no dependa del día que sea. */
import fs from "node:fs";

const src = fs.readFileSync("src/App.jsx", "utf8");

/* Saca el texto de `function NOMBRE(...){...}` casando llaves. */
function grabFn(name) {
  const i = src.indexOf(`function ${name}(`);
  if (i < 0) throw new Error(`no encuentro function ${name}`);
  // El cuerpo empieza tras el parentesis de los parametros: las llaves del
  // destructuring ({ log, state, ... }) no cuentan.
  let par = 0, j = -1;
  for (let k = src.indexOf("(", i); k < src.length; k++) {
    if (src[k] === "(") par++;
    else if (src[k] === ")") { par--; if (par === 0) { j = src.indexOf("{", k); break; } }
  }
  let d = 0;
  for (let k = j; k < src.length; k++) {
    if (src[k] === "{") d++;
    else if (src[k] === "}") { d--; if (d === 0) return src.slice(i, k + 1); }
  }
  throw new Error(`llaves sin cerrar en ${name}`);
}
/* Saca un `const NOMBRE = ...;` de una sola línea. */
function grabConst(name) {
  const m = src.match(new RegExp(`^const ${name} = .*;$`, "m"));
  if (!m) throw new Error(`no encuentro const ${name}`);
  return m[0];
}

const fns = ["isoOf", "parseISO", "mondayOf", "addDaysISO", "resumenSemana", "habitStreak",
  "seriesDe", "setsToGroups", "setsPorGrupoEnRango", "recordsDeSemana", "informeSemanal",
  "titularSemana", "rangoSemanaTexto", "resumirCirculo", "semanaOpts"].map(grabFn).join("\n\n");
const consts = [grabConst("domingoDe"), grabConst("MONTHS_ES"),
  grabConst("enVacacion"), grabConst("vacacionDeHoy")].join("\n");

const stubs = `
const DEFAULT_TRAIN_DAYS = [1,3,5];
const EX_MUSCLE = { "Press banca":"Pecho", "Remo con barra":"Espalda", "Sentadilla":"Cuádriceps", "Cinta de correr":"Cardio" };
const BODY_MAP = { Pecho:"Pecho", Espalda:"Espalda", "Cuádriceps":"Piernas", Cardio:"Aguante" };
const BODY_STATS = [{id:"Pecho"},{id:"Espalda"},{id:"Piernas"},{id:"Hombros"},{id:"Brazos"},{id:"Core"},{id:"Aguante"}];
const ACHIEVEMENTS = [{id:"primer_paso",title:"Primer paso",xp:50},{id:"pr_5",title:"Día de gloria",xp:250}];
const isCardio = n => EX_MUSCLE[n] === "Cardio";
const weekdayOfISO = iso => parseISO(iso).getDay();
const todayISO = () => HOY;
`;

const make = (HOY) => new Function("HOY", `${stubs}\n${consts}\n${fns}\nreturn { informeSemanal, titularSemana, recordsDeSemana, rangoSemanaTexto, resumirCirculo, resumenSemana, setsPorGrupoEnRango, habitStreak, semanaOpts, enVacacion };`)(HOY);

/* --- Datos de prueba ------------------------------------------------------ */
const ej = (name, ...pesos) => ({ name, muscle: null, logs: pesos.map(w => ({ weight: w, reps: 10 })) });
const ses = (date, xp, exercises) => ({ date, routineName: "Recomp", dayName: "Día A", xp, series: exercises.reduce((a, e) => a + e.logs.length, 0), exercises });

const log = [
  ses("2026-08-17", 100, [ej("Press banca", 60, 60, 60)]),                       // semana anterior
  ses("2026-08-24", 150, [ej("Press banca", 65, 65), ej("Remo con barra", 40, 40, 40)]),
  ses("2026-08-26", 160, [ej("Press banca", 70, 70), ej("Sentadilla", 80, 80)]),
  ses("2026-08-29", 120, [ej("Cinta de correr", 0, 0)]),                          // sábado: recupera
  ses("2026-09-02", 200, [ej("Press banca", 90, 90)]),                            // semana siguiente
];
const state = {
  xp: 4000, startDate: "2026-06-01", cardioBests: { "Cinta de correr": { min: 30, km: 5, date: "2026-08-29" } },
  achievements: { primer_paso: "2026-06-01", pr_5: "2026-08-26" },
};
const measures = [{ date: "2026-08-18", weightKg: 75, waist: 84 }, { date: "2026-08-25", weightKg: 74.2, waist: 83 }];

let fallos = 0;
const ok = (nombre, cond, extra = "") => { if (!cond) { fallos++; console.log("  ✗ " + nombre + (extra ? " → " + extra : "")); } else console.log("  ✓ " + nombre); };

/* --- Semana 24-30 de agosto, mirada el lunes 31 --------------------------- */
console.log("\nSemana cerrada 2026-08-24 · 3 previstos (L·X·V), fuiste L, X y sábado");
{
  const M = make("2026-08-31");
  const inf = M.informeSemanal({ log, state, measures, lunesISO: "2026-08-24", plannedDays: [1, 3, 5] });
  ok("rango en castellano", inf.rango === "24 – 30 de agosto", inf.rango);
  ok("no está en curso", inf.enCurso === false);
  ok("3 sesiones", inf.sesiones.length === 3, inf.sesiones.length);
  ok("semana cumplida (el sábado recupera el viernes)", inf.resumen.cumplida === true);
  ok("series de la semana = 11 (las 2 del cardio cuentan)", inf.series === 11, inf.series);
  ok("XP de la semana = 430", inf.xp === 430, inf.xp);
  ok("4 ejercicios distintos", inf.ejercicios.length === 4, inf.ejercicios.join(", "));

  const g = Object.fromEntries(inf.porGrupo.map(x => [x.id, x.sets]));
  ok("series por grupo sin colarse la semana siguiente", g.Pecho === 4, JSON.stringify(g));
  ok("espalda 3 · piernas 2 · aguante 2", g.Espalda === 3 && g.Piernas === 2 && g.Aguante === 2, JSON.stringify(g));

  ok("un récord de peso: press banca 60 → 70", inf.records.length === 1 && inf.records[0].prev === 60 && inf.records[0].now === 70, JSON.stringify(inf.records));
  ok("el remo estrenado esa semana NO es récord", !inf.records.some(r => r.name === "Remo con barra"));
  ok("marca de cardio de esa semana", inf.cardio.length === 1 && inf.cardio[0].name === "Cinta de correr");
  ok("solo el logro de esa semana", inf.logros.length === 1 && inf.logros[0].id === "pr_5", JSON.stringify(inf.logros.map(l => l.id)));
  ok("peso: 74,2 kg y −0,8 desde la medición anterior", inf.ultima.weightKg === 74.2 && inf.deltaPeso === -0.8, inf.deltaPeso);
  ok("titular en verde", titularEs(M, inf, "jade"), JSON.stringify(M.titularSemana(inf)));
}

/* --- Semana en curso, a medias -------------------------------------------- */
console.log("\nSemana en curso 2026-08-31, mirada el miércoles 2 (1 de 3 hechas)");
{
  const M = make("2026-09-02");
  const inf = M.informeSemanal({ log, state, measures, lunesISO: "2026-08-31", plannedDays: [1, 3, 5] });
  ok("marcada como en curso", inf.enCurso === true);
  ok("1 sesión", inf.sesiones.length === 1, inf.sesiones.length);
  ok("aún recuperable", inf.resumen.recuperable === true);
  ok("récord de la semana: 70 → 90", inf.records.length === 1 && inf.records[0].now === 90, JSON.stringify(inf.records));
  ok("titular no regaña", /falta/i.test(M.titularSemana(inf).txt), M.titularSemana(inf).txt);
}

/* --- Semana sin entrenar y semana a caballo de dos meses ------------------ */
console.log("\nCasos sueltos");
{
  const M = make("2026-09-20");
  const vacia = M.informeSemanal({ log, state, measures, lunesISO: "2026-09-07", plannedDays: [1, 3, 5] });
  ok("semana en blanco: 0 sesiones y sin récords", vacia.sesiones.length === 0 && vacia.records.length === 0);
  ok("titular de semana en blanco no culpabiliza", /pasa|siguiente/i.test(M.titularSemana(vacia).txt), M.titularSemana(vacia).txt);
  ok("rango a caballo de dos meses", M.rangoSemanaTexto("2026-08-31") === "31 de agosto – 6 de septiembre", M.rangoSemanaTexto("2026-08-31"));
  ok("rango dentro del mismo mes", M.rangoSemanaTexto("2026-09-07") === "7 – 13 de septiembre", M.rangoSemanaTexto("2026-09-07"));

  const c = M.resumirCirculo([
    { tipo: "entreno", id: "u1", handle: "ana", display_name: "Ana", xp: 100, prs: 0 },
    { tipo: "record", id: "u1", handle: "ana", display_name: "Ana", xp: 150, prs: 2 },
    { tipo: "entreno", id: "u2", handle: "bea", display_name: null, xp: 90, prs: 0 },
    { tipo: "quedada", id: "u2", handle: "bea", display_name: null },
    { tipo: "amistad", id: "u3", handle: "caro", display_name: "Caro" },
  ]);
  ok("círculo: Ana 2 entrenos, 2 récords, 250 XP", c.lista[0].nombre === "Ana" && c.lista[0].entrenos === 2 && c.lista[0].prs === 2 && c.lista[0].xp === 250, JSON.stringify(c.lista));
  ok("sin nombre se cae al @handle", c.lista[1].nombre === "@bea", c.lista[1].nombre);
  ok("quedadas y amistades van aparte", c.quedadas.length === 1 && c.nuevos.length === 1);
}

function titularEs(M, inf, palabra) { return M.titularSemana(inf).color.includes(palabra); }

/* --- Días de descanso y vacaciones ---------------------------------------- */
console.log("\nDía de descanso canjeado y vacaciones");
{
  const M = make("2026-08-31");
  const planned = [1, 3, 5];
  const dosDeTres = [ses("2026-08-24", 100, [ej("Press banca", 60)]), ses("2026-08-26", 100, [ej("Press banca", 60)])];

  const sin = M.resumenSemana(dosDeTres, planned, "2026-08-24", {});
  ok("sin descanso: 2 de 3, semana fallida", sin.previstos === 3 && !sin.cumplida, JSON.stringify(sin));

  const con = M.resumenSemana(dosDeTres, planned, "2026-08-24", { descansos: { "2026-08-24": 1 } });
  ok("con descanso: pide 2 y la semana queda cumplida", con.previstos === 2 && con.cumplida && con.perdonados === 1, JSON.stringify(con));

  const tope = M.resumenSemana([], [1], "2026-08-24", { descansos: { "2026-08-24": 5 } });
  ok("el descanso nunca baja de 0 sesiones", tope.previstos === 0, tope.previstos);

  const otra = M.resumenSemana(dosDeTres, planned, "2026-08-24", { descansos: { "2026-08-17": 1 } });
  ok("el descanso de otra semana no toca esta", otra.previstos === 3, otra.previstos);

  const vacs = [{ from: "2026-08-24", to: "2026-08-30" }];
  const vac = M.resumenSemana([], planned, "2026-08-24", { vacaciones: vacs });
  ok("semana entera de vacaciones: 0 previstos y cumplida", vac.previstos === 0 && vac.cumplida && vac.vacaciones === true, JSON.stringify(vac));

  const media = M.resumenSemana([], planned, "2026-08-24", { vacaciones: [{ from: "2026-08-24", to: "2026-08-26" }] });
  ok("vacaciones a medias: quedan los días de fuera", media.previstos === 1, media.previstos);

  const historial = [
    ses("2026-08-17", 100, [ej("Press banca", 60)]), ses("2026-08-19", 100, [ej("Press banca", 60)]),
    ses("2026-08-21", 100, [ej("Press banca", 60)]),
  ];
  ok("sin vacaciones la racha se corta en la semana vacía", M.habitStreak(historial, planned, {}) === 0, M.habitStreak(historial, planned, {}));
  ok("con vacaciones la racha sobrevive (3 días)", M.habitStreak(historial, planned, { vacaciones: vacs }) === 3, M.habitStreak(historial, planned, { vacaciones: vacs }));

  const infVac = M.informeSemanal({ log: [], state: { ...state, vacations: vacs }, measures: [], lunesISO: "2026-08-24", plannedDays: planned });
  const tv = M.titularSemana(infVac);
  ok("titular de vacaciones, sin reproche", /vacaciones/i.test(tv.txt) && !/quedaste/i.test(tv.txt), tv.txt);

  ok("semanaOpts recoge descansos y vacaciones del estado",
    JSON.stringify(M.semanaOpts({ restWeeks: { a: 1 }, vacations: vacs })) === JSON.stringify({ descansos: { a: 1 }, vacaciones: vacs }));
}

console.log(fallos ? `\n${fallos} FALLO(S)\n` : "\nTodo correcto\n");
process.exit(fallos ? 1 : 0);
