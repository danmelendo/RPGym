// Ejecuta las funciones reales de src/App.jsx (no una copia) y comprueba el catálogo.
import fs from "fs";
import assert from "assert";
const R = "F:/Proyectos/forja-habito-app";
const src = fs.readFileSync(R + "/src/App.jsx", "utf8");
const AVATAR = JSON.parse(fs.readFileSync(R + "/src/avatar-data.json", "utf8"));
const trozo = (ini, fin) => { const a = src.indexOf(ini), b = src.indexOf(fin, a); assert(a >= 0 && b > a, ini); return src.slice(a, b); };
const repUnit = new Function(trozo("function repUnit(reps){", "/* ") + "; return repUnit;")();
const isCardio = n => n === "Cinta";
const BODYWEIGHT_EX = new Set(["Plancha", "Flexiones"]);
const ramas = trozo("const RAMAS = [", "function capasAvatar(av){");
const m = new Function("AVATAR", "isCardio", "BODYWEIGHT_EX", "repUnit",
  ramas + "; return { RAMAS, RAMA, PIEZAS_POR_RAMA, ramaDeSerie, puntosDeRama, ramaDominante, siguientePieza, piezasNuevas, equipoDeRama, avatarPorDefecto };")(AVATAR, isCardio, BODYWEIGHT_EX, repUnit);

// Clasificación
assert.equal(m.ramaDeSerie("Press banca", 10), "guerrero");
assert.equal(m.ramaDeSerie("Press banca", 12), "guerrero");
assert.equal(m.ramaDeSerie("Press banca", 7), "guerrero");
assert.equal(m.ramaDeSerie("Press banca", 6), "barbaro");
assert.equal(m.ramaDeSerie("Press banca", 1), "barbaro");
assert.equal(m.ramaDeSerie("Press banca", 13), "picaro");
assert.equal(m.ramaDeSerie("Press banca", 0), "guerrero");
assert.equal(m.ramaDeSerie("Plancha", 45), "monje");
assert.equal(m.ramaDeSerie("Cinta", 30), "explorador");

// Puntos: el cardio en minutos cuenta 1 por cada 5; en segundos, 1 por serie; registros viejos sin detalle no rompen
const log = [
  { exercises: [{ name: "Press banca", objetivo: "8-12", logs: [{ reps: 10 }, { reps: 10 }, { reps: 5 }] }] },
  { exercises: [{ name: "Cinta", objetivo: "20 min", logs: [{ reps: 22 }] }, { name: "Cinta", objetivo: "30 s", logs: [{ reps: 30 }, { reps: 30 }] }] },
  { date: "2026-01-01" },
];
assert.deepStrictEqual(m.puntosDeRama(log), { guerrero: 2, picaro: 0, barbaro: 1, explorador: 6, monje: 0 });
assert.deepStrictEqual(m.puntosDeRama(null), { guerrero: 0, picaro: 0, barbaro: 0, explorador: 0, monje: 0 });

// Desbloqueos
const cero = { guerrero: 0, picaro: 0, barbaro: 0, explorador: 0, monje: 0 };
assert.deepStrictEqual(m.piezasNuevas({ ...cero, guerrero: 29 }, { ...cero, guerrero: 30 }).map(p => p.id), ["g_mandoble"]);
assert.deepStrictEqual(m.piezasNuevas({ ...cero, guerrero: 30 }, { ...cero, guerrero: 31 }), []);
assert.deepStrictEqual(m.piezasNuevas(cero, cero), []);
assert.equal(m.siguientePieza("guerrero", cero).id, "g_mandoble");
assert.equal(m.siguientePieza("guerrero", { guerrero: 99999 }), null);
assert.equal(m.equipoDeRama("guerrero", { guerrero: 30 }).arma, "g_mandoble");
assert.equal(m.equipoDeRama("guerrero", { guerrero: Infinity }).torso, "g_peto");

// Por defecto: la rama con más series, y Guerrero si no hay ninguna
assert.equal(m.avatarPorDefecto({ sex: "mujer" }, cero).sexo, "f");
assert.equal(m.avatarPorDefecto({ sex: "no_especificado" }, cero).rama, "guerrero");
assert.equal(m.avatarPorDefecto({}, { ...cero, explorador: 5 }).rama, "explorador");

// Cada rama arranca vestida y armada, en los dos cuerpos
for (const r of m.RAMAS) {
  const eq = m.equipoDeRama(r.id, cero);
  for (const ranura of ["torso", "piernas", "pies", "arma"]) assert(eq[ranura], `${r.id} sin ${ranura}`);
}

// Todas las capas existen en disco, con el tamaño esperado (cabecera PNG)
const capas = new Set();
const anota = l => l.forEach(c => capas.add(c.s));
Object.values(AVATAR.cuerpo).forEach(anota);
Object.values(AVATAR.ojos).forEach(c => capas.add(c.s));
Object.values(AVATAR.pelos).forEach(p => anota(p.capas));
Object.values(AVATAR.barbas).forEach(p => anota(p.capas));
for (const [id, p] of Object.entries(AVATAR.piezas)) for (const s of ["m", "f"]) {
  assert(p.capas[s].length, `${id} sin capas en ${s}`);
  anota(p.capas[s]);
}
for (const s of capas) {
  const b = fs.readFileSync(`${R}/public/avatar/${s}.png`);
  assert.equal(b.readUInt32BE(16), 576, s); assert.equal(b.readUInt32BE(20), 128, s);
}
console.log(`Ramas y catálogo: todo correcto (${capas.size} capas, ${Object.keys(AVATAR.piezas).length} piezas)`);
