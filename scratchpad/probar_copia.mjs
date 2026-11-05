// Ejecuta las funciones reales de src/App.jsx (no una copia) con casos fijos.
import fs from "fs";
import assert from "assert";
const src = fs.readFileSync("F:/Proyectos/forja-habito-app/src/App.jsx", "utf8");
const trozo = (ini, fin) => { const a = src.indexOf(ini), b = src.indexOf(fin, a); assert(a >= 0 && b > a, ini); return src.slice(a, b); };
const codigo = trozo("function resumenProgreso(st, lg){", "/* Abre la copia en el móvil");
const { resumenProgreso, compararProgreso } = new Function(codigo + "; return { resumenProgreso, compararProgreso };")();

const r = (fecha) => ({ date: fecha });
const movil = resumenProgreso({ totalWorkouts: 12, xp: 900 }, [r("2026-11-01"), r("2026-11-05"), r("2026-11-03")]);
assert.deepStrictEqual(movil, { entrenos: 12, ultimo: "2026-11-05", xp: 900 });

// El caso del dueño: copia subida hace días, móvil con entrenos nuevos.
assert.equal(compararProgreso(movil, resumenProgreso({ totalWorkouts: 10, xp: 700 }, [r("2026-10-30")])), "movil");
// Copia de otro dispositivo con un entreno más reciente.
assert.equal(compararProgreso(movil, resumenProgreso({ totalWorkouts: 13, xp: 950 }, [r("2026-11-06")])), "copia");
// Mismo día, distinto número de entrenos.
assert.equal(compararProgreso(movil, resumenProgreso({ totalWorkouts: 13, xp: 950 }, [r("2026-11-05")])), "copia");
assert.equal(compararProgreso(movil, resumenProgreso({ totalWorkouts: 11, xp: 950 }, [r("2026-11-05")])), "movil");
// Idénticos: no se ofrece nada.
assert.equal(compararProgreso(movil, { ...movil }), "igual");
// Copia vacía contra móvil con progreso.
assert.equal(compararProgreso(movil, resumenProgreso(null, null)), "movil");
// Registros sin fecha o historial recortado: cae a lastWorkoutDate y al contador.
assert.deepStrictEqual(resumenProgreso({ totalWorkouts: 3, lastWorkoutDate: "2026-09-01", xp: 5 }, []), { entrenos: 3, ultimo: "2026-09-01", xp: 5 });
console.log("Comparación de copias: todo correcto");
