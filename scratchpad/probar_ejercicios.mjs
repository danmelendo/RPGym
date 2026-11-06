// Comprueba que cada ejercicio del catálogo cae en una familia que existe, con las reglas
// reales de src/App.jsx (no una copia), y que todas las capas de poses están en disco.
import fs from "node:fs";
const app = fs.readFileSync("src/App.jsx", "utf8");
const trozo = (a, b)=>{ const i = app.indexOf(a), j = app.indexOf(b, i); if(i<0 || j<0) throw new Error(`no encuentro ${a}`); return app.slice(i, j); };
const familiaEjercicio = new Function(`${trozo("const REGLAS_EJ =", "const hojasEj =")}; return familiaEjercicio;`)();
const nombres = [...new Set([...trozo("const EX_IMG", "};").matchAll(/"([^"]+)"\s*:/g)].map(m=>m[1]))];
const familias = new Set([...trozo("function pasosEjercicio", "async function tiraEjercicio").matchAll(/^    (\w+):\{ ms:/gm)].map(m=>m[1]));
const reparto = {}, mal = [];
for(const n of nombres){ const f = familiaEjercicio(n); (reparto[f] ||= []).push(n); if(!familias.has(f)) mal.push(`${n} -> ${f}`); }
for(const [f,l] of Object.entries(reparto).sort((a,b)=>b[1].length-a[1].length)) console.log(String(l.length).padStart(3), f);
const datos = JSON.parse(fs.readFileSync("src/avatar-data.json", "utf8"));
const faltan = datos.ej.filter(s=>!fs.existsSync(`public/avatar/ej/${s}.png`));
const noUsadas = [...familias].filter(f=>!reparto[f]);
const maqs = [...trozo("const MAQ_EJ", "};").matchAll(/(\w+):"(\w+)"/g)];
const sinMaquina = maqs.filter(m=>!fs.existsSync(`public/rpg/maq/${m[2]}.png`)).map(m=>`falta la máquina ${m[2]}`);
const maqSinFamilia = maqs.filter(m=>!familias.has(m[1])).map(m=>`máquina de una familia que no existe: ${m[1]}`);
const fallos = [...mal, ...faltan, ...sinMaquina, ...maqSinFamilia, ...noUsadas.map(f=>`familia sin ejercicios: ${f}`)];
if(nombres.length<200) fallos.push(`solo ${nombres.length} ejercicios`);
for(const n of ["Sentadilla","Press banca","Plancha","Press militar","Cinta de correr","Bici estática","Bicicleta abdominal","Jalón al pecho","Remo al mentón","Press Pallof"]) console.log(n.padEnd(22), familiaEjercicio(n));
if(fallos.length){ console.error("FALLOS:", fallos); process.exit(1); }
console.log(`Ejercicios: todo correcto (${nombres.length} ejercicios, ${familias.size} familias, ${datos.ej.length} capas)`);
