/* =========================================================================
   RPGym · la mazmorra: reglas del juego de dados

   Solo reglas, sin React ni almacenamiento: cada acción recibe una partida y
   devuelve otra. Una partida es JSON puro, así que se guarda tras cada toque y
   sobrevive a que el descanso se acabe a mitad de turno o Android mate la app.

   LA REGLA QUE NO SE TOCA: esto nunca da XP, niveles ni equipo. El personaje es
   el reflejo del que entrena: el nivel y las piezas se ganan en el gimnasio y
   aquí solo se usan. Lo que se consigue dentro de una partida muere con ella.
   Si un día quieres premiar algo de aquí fuera de aquí, es la decisión equivocada.

   Probado con scratchpad/probar_mazmorra.mjs, que además simula miles de partidas
   y comprueba que el equipo real hace el juego más fácil. Si tocas los números,
   pásalo: ahí está el equilibrio.
   ========================================================================= */

/* Súbelo si cambia la forma de una partida guardada. Una partida vieja con reglas nuevas
   dejaba la app en blanco: `cargarMazmorra` la descarta en vez de intentar pintarla. */
export const FORMATO = 1;
export const SALAS = 10, TIRADAS = 3, IMPULSO_MAX = 6, LLAVES_MAX = 3;
/* Dificultad. Sale de scratchpad/barrido_mazmorra.mjs: no se toca a ojo. */
export const AJUSTE = { hp:2.6, dano:1.8, liderazgo:3 };

const c = (t, v=0) => ({ t, v });
/* Dado de partida de cada rama. La cara vacía se quita con piernas y pies. */
const DADOS = {
  guerrero:   [c("golpe",2), c("golpe",2), c("golpe",1), c("escudo",2), c("escudo",1), c("vacio")],
  picaro:     [c("doble",1), c("golpe",2), c("golpe",2), c("golpe",1), c("escudo",1), c("vacio")],
  barbaro:    [c("golpe",4), c("golpe",4), c("golpe",3), c("golpe",2), c("escudo",2), c("vacio")],
  explorador: [c("barrido",1), c("barrido",1), c("golpe",2), c("golpe",1), c("escudo",1), c("vacio")],
  monje:      [c("cura",2), c("cura",1), c("escudo",2), c("escudo",1), c("golpe",1), c("vacio")],
};
const RELLENO = { guerrero:"golpe", picaro:"doble", barbaro:"golpe", explorador:"barrido", monje:"cura" };
const ES_ATAQUE = t => t==="golpe" || t==="barrido" || t==="doble";
const ES_APOYO = t => t==="escudo" || t==="cura";

/* Ataques especiales: se pagan con Impulso, que sale de las series reales. */
export const ESPECIALES = {
  guerrero:   { nombre:"Golpe de barra",   coste:3, objetivo:"enemigo", texto:"Mucho daño a un enemigo y te cubres." },
  picaro:     { nombre:"Doble filo",       coste:2, objetivo:"enemigo", texto:"Dos golpes rápidos a un enemigo." },
  barbaro:    { nombre:"Peso muerto",      coste:3, objetivo:"enemigo", texto:"El golpe más fuerte que hay." },
  explorador: { nombre:"Lluvia de flechas",coste:3, objetivo:"todos",   texto:"Daño a todos los enemigos." },
  monje:      { nombre:"Aliento profundo", coste:3, objetivo:"grupo",   texto:"Cura a todo el grupo." },
};

/* Cuánto vale una pieza: sale de lo que cuesta ganarla en series reales. */
export function rangoPieza(umbral){ return umbral<=0 ? 0 : umbral<=100 ? 1 : umbral<=320 ? 2 : 3; }

/* El héroe es el reflejo de quien entrena: nivel y equipo real, nada más.
   `piezas` es el catálogo de avatar-data.json. */
export function crearHeroe({ id, nombre, tipo="npc", avatar, level=1 }, piezas){
  const r = ranura => rangoPieza(piezas[avatar?.equipo?.[ranura]]?.u ?? 0);
  const tiene = ranura => !!piezas[avatar?.equipo?.[ranura]];
  const rama = DADOS[avatar?.rama] ? avatar.rama : "guerrero";
  const ataque = r("arma") + (r("brazos")>=2 ? 1 : 0);
  const apoyo = r("torso") + (tiene("escudo") ? 1 : 0);
  const paso = r("piernas") + r("pies");
  const caras = DADOS[rama].map(f=>{
    if(f.t==="vacio"){
      if(!paso) return f;
      return c(RELLENO[rama], paso>=4 ? 2 : 1);
    }
    return c(f.t, f.v + (ES_ATAQUE(f.t) ? ataque : apoyo));
  });
  const hpMax = 8 + Math.floor(level/4) + 2*r("torso") + 2*r("cabeza") + r("piernas") + r("hombros") + r("espalda") + (tiene("escudo") ? 2 : 0);
  const rangos = Object.keys(avatar?.equipo||{}).reduce((a,k)=>a+r(k),0);
  return { id, nombre, tipo, rama, avatar, caras, hpMax, hp:hpMax, escudo:0, ataque, apoyo, rangos };
}

/* Liderazgo: tu equipo real también tira del grupo. Sin esto solo mejoraba uno de cada
   cuatro héroes y entrenar apenas se notaba (medido en scratchpad/barrido_mazmorra.mjs). */
export const liderazgoDe = heroe => Math.floor((heroe?.rangos||0)/AJUSTE.liderazgo);
function conLiderazgo(h, l){
  if(!l) return h;
  return { ...h, ataque:h.ataque+l, apoyo:h.apoyo+l, hpMax:h.hpMax+2*l, hp:h.hp+2*l,
    caras:h.caras.map(f=>f.t==="vacio" ? f : { ...f, v:f.v+l }) };
}

/* Los malos hábitos, de menos a más. */
const ENEMIGOS = {
  bostezo:  { nombre:"Bostezo",           sprite:120, hp:3,  mov:[c("golpe",1), c("golpe",2)] },
  excusa:   { nombre:"Excusa",            sprite:108, hp:5,  mov:[c("golpe",2), c("golpe",1), c("bloqueo",2)] },
  rata:     { nombre:"Rata de sofá",      sprite:123, hp:6,  mov:[c("golpe",3), c("golpe",2)] },
  agujeta:  { nombre:"Agujeta",           sprite:122, hp:7,  mov:[c("golpe",2), c("todos",1)] },
  lunes:    { nombre:"Lunes",             sprite:124, hp:9,  mov:[c("golpe",4), c("todos",2), c("golpe",3)] },
  ayer:     { nombre:"Fantasma del Ayer", sprite:121, hp:8,  mov:[c("todos",2), c("cura",3), c("golpe",3)] },
  pereza:   { nombre:"Cíclope Pereza",    sprite:109, hp:15, mov:[c("golpe",5), c("bloqueo",4), c("todos",2)] },
  sofa:     { nombre:"Sofá Maldito",      sprite:110, hp:24, jefe:true, mov:[c("golpe",4), c("todos",2), c("bloqueo",4), c("golpe",5)] },
  abandono: { nombre:"El Abandono",       sprite:111, hp:44, jefe:true, mov:[c("golpe",7), c("todos",3), c("bloqueo",6), c("cura",6), c("todos",4)] },
};
const OLEADAS = [
  ["bostezo","excusa"], ["excusa","excusa"], ["agujeta","bostezo"], ["rata","agujeta"], ["sofa"],
  ["lunes","rata"], ["ayer","lunes"], ["pereza","bostezo"], ["pereza","ayer"], ["abandono"],
];
/* Un jefe se lleva a todos por delante: menos héroes, menos vida que quitarle. */
const escala = n => [0,.55,.7,.85,1][n] ?? 1;

const vivos = l => l.map((e,i)=>e.hp>0 ? i : -1).filter(i=>i>=0);
const elegir = (l, rng) => l[Math.floor(rng()*l.length)];
const anota = (p, ...t) => ({ ...p, log:[...t, ...p.log].slice(0,4) });

function intenciones(p, rng){
  const hv = vivos(p.heroes);
  const enemigos = p.enemigos.map(e=>{
    if(e.hp<=0) return e;
    const m = ENEMIGOS[e.id].mov[(e.turno + (e.desfase||0)) % ENEMIGOS[e.id].mov.length];
    const v = m.t==="bloqueo" || m.t==="cura" ? Math.round(m.v*AJUSTE.hp) : Math.round(m.v*AJUSTE.dano);
    return { ...e, intento:{ ...m, v, obj:m.t==="golpe" ? elegir(hv, rng) : null } };
  });
  return { ...p, enemigos };
}
/* `i` es la cara del dado y `tiro` la tirada en que salió: lo usa la animación, que
   solo debe lanzar lo que de verdad se ha tirado, y caer en la cara correcta. */
function tiraDado(h, tiro, rng){
  const i = Math.floor(rng()*h.caras.length);
  return { i, tiro, cara:{ ...h.caras[i] }, fijo:false, usado:false };
}
function tirada(p, rng){
  const tiro = (p.tiro||0)+1;
  return { ...p, tiro, tiradas:TIRADAS-1, fase:"lanzar", dados:p.heroes.map(h=>h.hp>0 ? tiraDado(h, tiro, rng) : null) };
}
function empiezaSala(p, rng){
  const vivosN = p.heroes.length;
  const enemigos = OLEADAS[p.sala-1].map((id,i)=>{
    const hp = Math.max(1, Math.round(ENEMIGOS[id].hp * escala(vivosN) * AJUSTE.hp));
    return { id, nombre:ENEMIGOS[id].nombre, sprite:ENEMIGOS[id].sprite, jefe:!!ENEMIGOS[id].jefe, hp, hpMax:hp, escudo:0, turno:0, desfase:i, intento:null };
  });
  return tirada(intenciones({ ...p, enemigos, ronda:1 }, rng), rng);
}

export function nuevaPartida(heroes, rng=Math.random){
  const l = liderazgoDe(heroes[0]);
  return empiezaSala({ formato:FORMATO, sala:1, liderazgo:l, heroes:heroes.map((h,i)=>i ? conLiderazgo(h, l) : { ...h, base:{ hpMax:h.hpMax, caras:h.caras } }), enemigos:[], dados:[], tiradas:0, fase:"lanzar", ronda:1, log:[], botin:null, n:0 }, rng);
}

/* Si entre sala y sala ha caído equipo nuevo, se nota en la siguiente. Lo ganado en
   esta partida (`extraA`, `extraS`) se vuelve a sumar encima. */
export function refrescarHeroe(p, heroe){
  const heroes = p.heroes.map(h=>{
    if(h.id!==heroe.id || !h.base) return h;
    if(JSON.stringify(heroe.caras)===JSON.stringify(h.base.caras) && heroe.hpMax===h.base.hpMax) return h;
    const extra = Math.max(0, heroe.hpMax-h.base.hpMax), a = h.extraA||0, s = h.extraS||0;
    const caras = heroe.caras.map(f=>({ ...f, v:f.v + (ES_ATAQUE(f.t) ? a : ES_APOYO(f.t) ? s : 0) }));
    return { ...h, caras, avatar:heroe.avatar, ataque:heroe.ataque+a, apoyo:heroe.apoyo+s, hpMax:h.hpMax+extra, hp:h.hp+extra, base:{ hpMax:heroe.hpMax, caras:heroe.caras } };
  });
  return { ...p, heroes };
}

export function fijar(p, i){
  if(p.fase!=="lanzar" || !p.dados[i]) return p;
  return { ...p, dados:p.dados.map((d,n)=>n===i ? { ...d, fijo:!d.fijo } : d) };
}
export function relanzar(p, rng=Math.random){
  if(p.fase!=="lanzar" || p.tiradas<=0) return p;
  const tiro = (p.tiro||0)+1;
  return { ...p, tiro, tiradas:p.tiradas-1, n:p.n+1, dados:p.dados.map((d,i)=>
    !d || d.fijo ? d : { ...tiraDado(p.heroes[i], tiro, rng), fijo:false }) };
}
/* Superserie: dos o más dados con la misma acción se potencian entre sí. Es lo que
   da sentido a relanzar un dado que ya era bueno. */
function cuentaCaras(dados){
  const cuenta = {};
  dados.forEach(d=>{ if(d && d.cara.t!=="vacio") cuenta[d.cara.t] = (cuenta[d.cara.t]||0)+1; });
  return cuenta;
}
export function confirmar(p){
  if(p.fase!=="lanzar") return p;
  const cuenta = cuentaCaras(p.dados);
  const dados = p.dados.map(d=>{
    if(!d) return d;
    const sup = (cuenta[d.cara.t]||0)>=2;
    return { ...d, superserie:sup, cara:{ ...d.cara, v:d.cara.v+(sup ? 1 : 0) } };
  });
  const hubo = dados.some(d=>d?.superserie);
  return { ...(hubo ? anota(p, "¡Superserie! +1 a los dados iguales") : p), fase:"usar", dados };
}

function dana(e, n){
  const absorbe = Math.min(e.escudo, n), hp = Math.max(0, e.hp-(n-absorbe));
  return { ...e, escudo:e.escudo-absorbe, hp };
}
const conEnemigo = (p, i, f) => ({ ...p, enemigos:p.enemigos.map((e,n)=>n===i ? f(e) : e) });
const conHeroe = (p, i, f) => ({ ...p, heroes:p.heroes.map((h,n)=>n===i ? f(h) : h) });
const cura = (h, n) => h.hp>0 ? { ...h, hp:Math.min(h.hpMax, h.hp+n) } : h;

/* ¿Necesita objetivo? "enemigo", "aliado" o null si ya se sabe a quién va. */
export function objetivoDe(t){ return t==="golpe"||t==="doble" ? "enemigo" : ES_APOYO(t) ? "aliado" : null; }

function aplicar(p, cara, obj){
  const v = cara.v;
  if(cara.t==="golpe") return conEnemigo(p, obj, e=>dana(e, v));
  if(cara.t==="doble") return conEnemigo(conEnemigo(p, obj, e=>dana(e, v)), obj, e=>dana(e, v));
  if(cara.t==="barrido") return { ...p, enemigos:p.enemigos.map(e=>e.hp>0 ? dana(e, v) : e) };
  if(cara.t==="escudo") return conHeroe(p, obj, h=>({ ...h, escudo:h.escudo+v }));
  if(cara.t==="cura") return conHeroe(p, obj, h=>cura(h, v));
  return p;
}
function objetivoValido(p, t, obj){
  const tipo = objetivoDe(t);
  if(tipo==="enemigo") return p.enemigos[obj]?.hp>0;
  if(tipo==="aliado") return p.heroes[obj]?.hp>0;
  return true;
}
export function usarDado(p, i, obj, rng=Math.random){
  const d = p.dados[i];
  if(p.fase!=="usar" || !d || d.usado || !objetivoValido(p, d.cara.t, obj)) return p;
  const q = aplicar(p, d.cara, obj);
  return tras({ ...q, n:q.n+1, dados:q.dados.map((x,n)=>n===i ? { ...x, usado:true } : x) }, rng);
}
export function usarEspecial(p, h, obj, impulso, rng=Math.random){
  const heroe = p.heroes[h], e = ESPECIALES[heroe?.rama];
  if(p.fase!=="usar" || !e || heroe.hp<=0 || impulso<e.coste || p.dados[h]?.usado) return { partida:p, gastado:0 };
  if(e.objetivo==="enemigo" && !(p.enemigos[obj]?.hp>0)) return { partida:p, gastado:0 };
  const a = heroe.ataque, s = heroe.apoyo;
  let q = p;
  if(heroe.rama==="guerrero") q = conHeroe(conEnemigo(q, obj, x=>dana(x, 6+a)), h, x=>({ ...x, escudo:x.escudo+3+s }));
  if(heroe.rama==="picaro") q = conEnemigo(conEnemigo(q, obj, x=>dana(x, 3+a)), obj, x=>dana(x, 3+a));
  if(heroe.rama==="barbaro") q = conEnemigo(q, obj, x=>dana(x, 10+a));
  if(heroe.rama==="explorador") q = { ...q, enemigos:q.enemigos.map(x=>x.hp>0 ? dana(x, 3+a) : x) };
  if(heroe.rama==="monje") q = { ...q, heroes:q.heroes.map(x=>cura(x, 3+s)) };
  q = { ...q, n:q.n+1, dados:q.dados.map((x,n)=>n===h && x ? { ...x, usado:true } : x) };
  return { partida:tras(anota(q, `${heroe.nombre}: ${e.nombre}`), rng), gastado:e.coste };
}

/* Tras cada acción: si ya no quedan enemigos, la sala está ganada. */
function tras(p, rng){
  if(vivos(p.enemigos).length) return p;
  p = { ...p, ganadas:(p.ganadas||0)+1 };
  if(p.sala>=SALAS) return { ...p, fase:"fin", victoria:true };
  const heroes = p.heroes.map(h=>{
    const base = h.hp>0 ? { ...h, hp:Math.min(h.hpMax, h.hp+3) } : { ...h, hp:Math.ceil(h.hpMax/3) };
    return { ...base, escudo:0 };
  });
  return { ...p, heroes, fase:"botin", botin:sacaBotin(rng) };
}

/* El botín solo vale para esta partida. Lo que dura se gana en el gimnasio. */
const BOTINES = [
  { id:"batido",   nombre:"Batido de proteínas", texto:"Cura 5 a todo el grupo." },
  { id:"creatina", nombre:"Creatina",            texto:"+1 a los ataques de todo el grupo." },
  { id:"cinturon", nombre:"Cinturón lumbar",     texto:"+1 a escudos y curas de todo el grupo." },
  { id:"magnesio", nombre:"Magnesio",            texto:"+3 de vida máxima a todo el grupo." },
  { id:"pre",      nombre:"Pre-entreno",         texto:"+2 de Impulso ahora mismo." },
];
function sacaBotin(rng){
  const l = [...BOTINES];
  for(let i=l.length-1;i>0;i--){ const j = Math.floor(rng()*(i+1)); [l[i],l[j]] = [l[j],l[i]]; }
  return l.slice(0,3);
}
export function elegirBotin(p, id, rng=Math.random){
  if(p.fase!=="botin") return { partida:p, impulso:0 };
  let heroes = p.heroes, impulso = 0;
  const caras = (h, f) => ({ ...h, caras:h.caras.map(x=>f(x.t) ? { ...x, v:x.v+1 } : x) });
  if(id==="batido") heroes = heroes.map(h=>cura(h, 5));
  if(id==="creatina") heroes = heroes.map(h=>({ ...caras(h, ES_ATAQUE), ataque:h.ataque+1, extraA:(h.extraA||0)+1 }));
  if(id==="cinturon") heroes = heroes.map(h=>({ ...caras(h, ES_APOYO), apoyo:h.apoyo+1, extraS:(h.extraS||0)+1 }));
  if(id==="magnesio") heroes = heroes.map(h=>({ ...h, hpMax:h.hpMax+3, hp:h.hp+3 }));
  if(id==="pre") impulso = 2;
  return { partida:empiezaSala({ ...p, heroes, sala:p.sala+1, botin:null, log:[] }, rng), impulso };
}

/* Acaba el turno: los enemigos que sigan en pie cumplen lo que anunciaban. */
export function finTurno(p, rng=Math.random){
  if(p.fase!=="usar") return p;
  let q = { ...p, log:[] }; const textos = [];
  q.enemigos.forEach((e,i)=>{
    if(e.hp<=0 || !e.intento) return;
    const { t, v, obj } = e.intento;
    if(t==="golpe"){
      const destino = q.heroes[obj]?.hp>0 ? obj : vivos(q.heroes)[0];
      if(destino==null) return;
      q = conHeroe(q, destino, h=>dana(h, v));
      textos.push(`${e.nombre}: -${v} a ${q.heroes[destino].nombre}`);
    }
    if(t==="todos"){ q = { ...q, heroes:q.heroes.map(h=>h.hp>0 ? dana(h, v) : h) }; textos.push(`${e.nombre}: -${v} a todos`); }
    if(t==="bloqueo"){ q = conEnemigo(q, i, x=>({ ...x, escudo:x.escudo+v })); textos.push(`${e.nombre} se protege`); }
    if(t==="cura"){ q = conEnemigo(q, i, x=>({ ...x, hp:Math.min(x.hpMax, x.hp+v) })); textos.push(`${e.nombre} se recupera`); }
  });
  q = { ...q, n:q.n+1, heroes:q.heroes.map(h=>({ ...h, escudo:0 })),
    enemigos:q.enemigos.map(e=>e.hp>0 ? { ...e, turno:e.turno+1, escudo:e.intento?.t==="bloqueo" ? e.escudo : 0 } : e) };
  q = anota(q, ...textos.slice(0,3));
  if(!vivos(q.heroes).length) return { ...q, fase:"fin", victoria:false };
  return tirada(intenciones({ ...q, ronda:q.ronda+1 }, rng), rng);
}

/* --- Gloria y llaves -----------------------------------------------------------
   Gloria es la puntuación de la mazmorra y solo sirve para compararse: no da XP ni
   nada que cambie al héroe. Para que escalar en la clasificación exija ir al gimnasio,
   solo puntúan las partidas con llave, y las llaves salen de entrenos terminados, una
   al día. Sin llave se juega igual, de práctica. */
export const MAZMORRA_VACIA = { partida:null, impulso:0, llaves:1, ultimaLlave:null, gloria:0, salas:0, mazmorras:0, mejorSala:0 };
const JEFES = new Set(OLEADAS.map((o,i)=>ENEMIGOS[o[0]].jefe ? i+1 : 0));
export const gloriaDeSala = n => 10*n + (JEFES.has(n) ? 50 : 0);
export const GLORIA_VICTORIA = 200;

export function cargarMazmorra(guardada){
  const mz = { ...MAZMORRA_VACIA, ...(guardada||{}) };
  return mz.partida?.formato===FORMATO ? mz : { ...mz, partida:null };
}

export function darLlave(mz, hoy){
  if(mz.ultimaLlave===hoy) return mz;
  return { ...mz, ultimaLlave:hoy, llaves:Math.min(LLAVES_MAX, (mz.llaves||0)+1) };
}
export function empezar(mz, heroes, rng=Math.random){
  const puntua = (mz.llaves||0)>0;
  return { ...mz, llaves:(mz.llaves||0)-(puntua ? 1 : 0), partida:{ ...nuevaPartida(heroes, rng), puntua } };
}
/* Pasa a los totales lo ganado desde la última vez. Se puede llamar tras cada toque:
   solo cuenta una vez cada sala. */
export function apuntar(mz){
  const p = mz.partida;
  if(!p) return mz;
  const ganadas = p.ganadas||0, antes = p.contadas||0, cierra = p.fase==="fin" && !p.cerrada;
  if(ganadas<=antes && !cierra) return mz;
  let suma = 0;
  for(let n=antes+1;n<=ganadas;n++) suma += gloriaDeSala(n);
  if(cierra && p.victoria) suma += GLORIA_VICTORIA;
  const partida = { ...p, contadas:ganadas, cerrada:p.fase==="fin", gloriaPartida:(p.gloriaPartida||0)+(p.puntua ? suma : 0) };
  if(!p.puntua) return { ...mz, partida };
  return { ...mz, partida, gloria:(mz.gloria||0)+suma, salas:(mz.salas||0)+ganadas-antes,
    mejorSala:Math.max(mz.mejorSala||0, ganadas), mazmorras:(mz.mazmorras||0)+(cierra && p.victoria ? 1 : 0) };
}
