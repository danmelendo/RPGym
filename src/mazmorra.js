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
export const AJUSTE = { hp:2.6, dano:1.8, liderazgo:3, tramos:[1, 1.4, 1.56] };
/* Los enemigos suben justo cuando sube el grupo, tras cada ascenso. Con un multiplicador
   único las evoluciones se comían la dificultad, y compensarlo endurecía el arranque. */
const tramo = sala => AJUSTE.tramos[sala<=3 ? 0 : sala<=7 ? 1 : 2];

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

/* Ataques especiales. Se pagan con Impulso, que sale de las series reales, gastan el
   dado de quien los usa y se desbloquean como las piezas: con series de esa rama (`u`).
   El primero de cada rama es el de serie. `a` y `s` son el ataque y el apoyo del héroe,
   para que la ayuda enseñe los números de verdad y no una fórmula. */
const X = (id, rama, u, nombre, coste, objetivo, texto, hacer) => ({ id, rama, u, nombre, coste, objetivo, texto, hacer });
const LISTA_ESPECIALES = [
  X("golpe_barra","guerrero",0,"Golpe de barra",3,"enemigo",(a,s)=>`Quita ${6+a} a un enemigo y te da ${3+s} de escudo.`,
    (q,{h,obj,a,s})=>conHeroe(conEnemigo(q,obj,x=>dana(x,6+a)),h,x=>({ ...x, escudo:x.escudo+3+s }))),
  X("muro","guerrero",100,"Muro de discos",3,"grupo",(a,s)=>`Da ${2+s} de escudo a todo el grupo.`,
    (q,{s})=>({ ...q, heroes:q.heroes.map(x=>x.hp>0 ? { ...x, escudo:x.escudo+2+s } : x) })),
  X("al_fallo","guerrero",320,"Al fallo",4,"enemigo",a=>`Quita ${12+a} a un enemigo.`,
    (q,{obj,a})=>conEnemigo(q,obj,x=>dana(x,12+a))),

  X("doble_filo","picaro",0,"Doble filo",2,"enemigo",a=>`Dos golpes de ${3+a} a un enemigo.`,
    (q,{obj,a})=>conEnemigo(conEnemigo(q,obj,x=>dana(x,3+a)),obj,x=>dana(x,3+a))),
  X("sombra","picaro",100,"Paso de sombra",2,"todos",a=>`Quita ${2+a} a todos los enemigos.`,
    (q,{a})=>todos(q,2+a)),
  X("punalada","picaro",320,"Puñalada",3,"enemigo",a=>`Quita ${8+a} a un enemigo, atravesando su escudo.`,
    (q,{obj,a})=>conEnemigo(q,obj,x=>({ ...x, hp:Math.max(0,x.hp-(8+a)) }))),

  X("peso_muerto","barbaro",0,"Peso muerto",3,"enemigo",a=>`Quita ${10+a} a un enemigo.`,
    (q,{obj,a})=>conEnemigo(q,obj,x=>dana(x,10+a))),
  X("sismica","barbaro",100,"Sentadilla sísmica",4,"todos",a=>`Quita ${4+a} a todos los enemigos.`,
    (q,{a})=>todos(q,4+a)),
  X("sin_frenos","barbaro",320,"Sin frenos",4,"enemigo",a=>`Quita ${16+a} a un enemigo, pero tú pierdes 3 de vida.`,
    (q,{h,obj,a})=>conHeroe(conEnemigo(q,obj,x=>dana(x,16+a)),h,x=>({ ...x, hp:Math.max(1,x.hp-3) }))),

  X("lluvia","explorador",0,"Lluvia de flechas",3,"todos",a=>`Quita ${3+a} a todos los enemigos.`,
    (q,{a})=>todos(q,3+a)),
  X("certero","explorador",100,"Tiro certero",2,"enemigo",a=>`Quita ${5+a} a un enemigo.`,
    (q,{obj,a})=>conEnemigo(q,obj,x=>dana(x,5+a))),
  X("segundo_aire","explorador",320,"Segundo aire",3,"grupo",(a,s)=>`Cura ${2+s} al grupo y quita ${2+a} a todos los enemigos.`,
    (q,{a,s})=>todos({ ...q, heroes:q.heroes.map(x=>cura(x,2+s)) },2+a)),

  X("aliento","monje",0,"Aliento profundo",3,"grupo",(a,s)=>`Cura ${3+s} a todo el grupo.`,
    (q,{s})=>({ ...q, heroes:q.heroes.map(x=>cura(x,3+s)) })),
  X("postura","monje",100,"Postura firme",2,"aliado",(a,s)=>`Da ${5+s} de escudo a un compañero.`,
    (q,{obj,s})=>conHeroe(q,obj,x=>({ ...x, escudo:x.escudo+5+s }))),
  X("resurgir","monje",320,"Resurgir",4,"caido",()=>"Devuelve a la lucha a un compañero caído, con media vida. Actúa desde el turno siguiente.",
    (q,{obj})=>conHeroe(q,obj,x=>({ ...x, hp:Math.ceil(x.hpMax/2) }))),
];
export const ESPECIALES = Object.fromEntries(LISTA_ESPECIALES.map(e=>[e.id,e]));
const DE_SERIE = { guerrero:"golpe_barra", picaro:"doble_filo", barbaro:"peso_muerto", explorador:"lluvia", monje:"aliento" };
/* Una partida empezada antes de que se pudiera elegir no trae `especial`: va por su rama. */
export const especialDe = h => ESPECIALES[h?.especial] || ESPECIALES[DE_SERIE[h?.rama]] || ESPECIALES.golpe_barra;
export const especialDisponible = (e, puntos) => e.u<=(puntos?.[e.rama]||0);
export function especialesNuevos(antes, despues){
  return LISTA_ESPECIALES.filter(e=>e.u>0 && !especialDisponible(e, antes) && especialDisponible(e, despues));
}

/* Evoluciones, con las clases clásicas de fantasía. Todos empiezan en la forma base de su
   rama y, al superar las salas de ASCENSOS, cada héroe elige entre dos clases. La segunda
   sale de la primera (`de`). Dura lo que dura la partida: en la siguiente se empieza de
   nuevo, y lo que hace más fuerte al héroe de verdad es entrenar.
   `cambia` sustituye caras del dado; `ata` y `apo` suben las que ya tenía; `rasgo` se suma
   a los que ya tiene; `tipo` cuenta para las sinergias de grupo. */
export const ASCENSOS = [3, 7];
/* Tres zonas, partidas por los ascensos. Solo cambian el decorado: la dificultad ya sube en
   esos mismos saltos (AJUSTE.tramos). */
export const ZONAS = [{ id:1, nombre:"El sótano", desde:1 }, { id:2, nombre:"Las catacumbas", desde:ASCENSOS[0]+1 }, { id:3, nombre:"La sala del trono", desde:ASCENSOS[1]+1 }];
export const zonaDe = sala => [...ZONAS].reverse().find(z=>sala>=z.desde) || ZONAS[0];

/* Los rasgos se combinan según el ORDEN en que usas los dados: primero quien marca, luego
   quien aprovecha la marca. Es lo que hace que importe quién va en el grupo. */
export const RASGOS = {
  guardian:{ nombre:"Protector",     texto:"Con escudo puesto, recibe los golpes dirigidos a sus compañeros." },
  furia:   { nombre:"Furia",         texto:"Con menos de media vida, sus golpes quitan 2 más." },
  furtivo: { nombre:"Ataque furtivo",texto:"Quita 2 más a los enemigos marcados." },
  marca:   { nombre:"Marca",         texto:"Sus ataques marcan al enemigo: recibe 1 más de cada golpe hasta fin de turno." },
  inspira: { nombre:"Inspiración",   texto:"Sus escudos y curas suben +1 el dado sin usar de quien los recibe." },
  aturde:  { nombre:"Aturdir",       texto:"Golpear a un enemigo marcado lo aturde: ese turno no actúa. Los jefes son inmunes." },
};
const RASGO_BASE = { guerrero:"guardian", picaro:"furtivo", barbaro:"furia", explorador:"marca", monje:"inspira" };
const TIPO_BASE = { guerrero:"marcial", picaro:"sigilo", barbaro:"marcial", explorador:"naturaleza", monje:"espiritu" };
export const TIPOS = { marcial:"Marcial", sigilo:"Sigilo", espiritu:"Espíritu", arcano:"Arcano", naturaleza:"Naturaleza" };

/* Sinergias de grupo: dos héroes del mismo tipo, y una por tener cuatro tipos distintos. */
export const SINERGIAS = {
  marcial:   { nombre:"Formación",  texto:"Dos Marciales: los golpes quitan 1 más." },
  sigilo:    { nombre:"Emboscada",  texto:"Dos de Sigilo: los dobles golpes marcan al enemigo." },
  espiritu:  { nombre:"Comunión",   texto:"Dos de Espíritu: las curas dan 1 más." },
  arcano:    { nombre:"Resonancia", texto:"Dos Arcanos: los barridos quitan 1 más." },
  naturaleza:{ nombre:"Manada",     texto:"Dos de Naturaleza: todo el grupo cura 1 al acabar el turno." },
  equilibrio:{ nombre:"Equilibrio", texto:"Cuatro tipos distintos: todos entran en cada sala con 2 de escudo." },
};
export const tipoDe = h => CLASES[h?.clase]?.tipo || TIPO_BASE[h?.rama] || "marcial";
export const rasgosDe = h => h?.rasgos || (RASGO_BASE[h?.rama] ? [RASGO_BASE[h.rama]] : []);
export function sinergiasDe(heroes){
  const cuenta = {};
  heroes.forEach(h=>{ const t = tipoDe(h); cuenta[t] = (cuenta[t]||0)+1; });
  const activas = Object.keys(cuenta).filter(t=>cuenta[t]>=2);
  return Object.keys(cuenta).length>=4 ? [...activas, "equilibrio"] : activas;
}

const CL = (id, rama, nivel, de, nombre, tipo, texto, { ata=0, apo=0, hp=0, cambia=[], rasgo=null }) => ({ id, rama, nivel, de, nombre, tipo, texto, ata, apo, hp, cambia, rasgo });
const LISTA_CLASES = [
  CL("cruzado","guerrero",2,null,"Cruzado","espiritu","Más defensa: cambia un golpe por escudo y aprende a curar.",{ apo:2, hp:4, cambia:[[2,"escudo"],[5,"cura"]] }),
  CL("campeon","guerrero",2,null,"Campeón","marcial","Todo al ataque: cambia el escudo pequeño por otro golpe.",{ ata:2, hp:2, cambia:[[4,"golpe"],[5,"golpe"]], rasgo:"furia" }),
  CL("paladin","guerrero",3,"cruzado","Paladín","espiritu","Protege, cura e inspira a los suyos.",{ ata:1, apo:1, hp:4, cambia:[[2,"cura"]], rasgo:"inspira" }),
  CL("vengador","guerrero",3,"cruzado","Vengador","espiritu","Señala a su presa y va a por ella.",{ ata:2, hp:2, cambia:[[3,"golpe"]], rasgo:"marca" }),
  CL("maestro_batalla","guerrero",3,"campeon","Maestro de batalla","marcial","Dirige la pelea: su mejor golpe alcanza a todos y los marca.",{ ata:2, hp:2, cambia:[[0,"barrido"]], rasgo:"marca" }),
  CL("caballero_arcano","guerrero",3,"campeon","Caballero arcano","arcano","Espada y magia: aturde a quien esté marcado.",{ ata:1, apo:1, hp:3, cambia:[[3,"barrido"]], rasgo:"aturde" }),

  CL("asesino","picaro",2,null,"Asesino","sigilo","Más golpes dobles, poca vida.",{ ata:2, hp:1, cambia:[[3,"doble"],[5,"doble"]] }),
  CL("bardo","picaro",2,null,"Bardo","arcano","Cambia el puñal por el laúd: cura e inspira.",{ ata:1, apo:1, hp:2, cambia:[[2,"cura"],[5,"escudo"]], rasgo:"inspira" }),
  CL("sombra_letal","picaro",3,"asesino","Sombra letal","sigilo","Golpea doble casi siempre.",{ ata:2, hp:2, cambia:[[1,"doble"]] }),
  CL("embaucador","picaro",3,"asesino","Embaucador arcano","arcano","Trucos de magia: aturde a los marcados.",{ ata:1, apo:1, hp:3, cambia:[[3,"barrido"]], rasgo:"aturde" }),
  CL("bardo_valor","picaro",3,"bardo","Bardo del valor","marcial","Canta en primera línea y marca al enemigo.",{ ata:2, apo:1, hp:3, cambia:[[3,"golpe"]], rasgo:"marca" }),
  CL("bardo_saber","picaro",3,"bardo","Bardo del saber","arcano","Conoce todos los trucos: cura y aturde.",{ apo:2, hp:3, cambia:[[4,"cura"]], rasgo:"aturde" }),

  CL("berserker","barbaro",2,null,"Berserker","marcial","Más daño en cada cara de ataque.",{ ata:2, hp:2, cambia:[[5,"golpe"]] }),
  CL("guerrero_totem","barbaro",2,null,"Guerrero tótem","naturaleza","Mucha más vida, y protege a la manada.",{ apo:1, hp:6, cambia:[[3,"barrido"],[5,"escudo"]], rasgo:"guardian" }),
  CL("destructor","barbaro",3,"berserker","Destructor","marcial","Ya solo sabe atacar. Muy bien.",{ ata:3, hp:2, cambia:[[4,"golpe"]] }),
  CL("senor_guerra","barbaro",3,"berserker","Señor de la guerra","marcial","Barre y señala al siguiente.",{ ata:2, apo:1, hp:4, cambia:[[2,"barrido"]], rasgo:"marca" }),
  CL("espiritu_oso","barbaro",3,"guerrero_totem","Espíritu del oso","naturaleza","Una muralla con garras.",{ ata:1, apo:1, hp:6, cambia:[[2,"escudo"]] }),
  CL("espiritu_lobo","barbaro",3,"guerrero_totem","Espíritu del lobo","naturaleza","Caza en grupo: marca y barre.",{ ata:2, hp:3, cambia:[[4,"barrido"]], rasgo:"marca" }),

  CL("cazador","explorador",2,null,"Cazador","naturaleza","Mejor puntería y más barridos.",{ ata:2, hp:1, cambia:[[3,"barrido"],[5,"golpe"]] }),
  CL("druida","explorador",2,null,"Druida","naturaleza","Cuida del grupo: escudos mejores, una cara de cura e inspiración.",{ apo:2, hp:3, cambia:[[5,"cura"]], rasgo:"inspira" }),
  CL("matamonstruos","explorador",3,"cazador","Matamonstruos","naturaleza","Remata lo que él mismo marca.",{ ata:2, hp:2, cambia:[[4,"golpe"]], rasgo:"furtivo" }),
  CL("arquero_arcano","explorador",3,"cazador","Arquero arcano","arcano","Sus flechas aturden a los marcados.",{ ata:1, apo:1, hp:3, cambia:[[2,"barrido"]], rasgo:"aturde" }),
  CL("circulo_luna","explorador",3,"druida","Círculo de la luna","naturaleza","Se transforma: ataca más y se enfurece.",{ ata:2, apo:1, hp:4, cambia:[[3,"golpe"]], rasgo:"furia" }),
  CL("circulo_tierra","explorador",3,"druida","Círculo de la tierra","espiritu","Cura y ataca a la vez.",{ ata:1, apo:2, hp:3, cambia:[[3,"cura"]] }),

  CL("clerigo","monje",2,null,"Clérigo","espiritu","Mejores curas y escudos.",{ apo:2, hp:3, cambia:[[5,"cura"]] }),
  CL("mago","monje",2,null,"Mago","arcano","Cambia los puños por conjuros: barridos, y aturde a los marcados.",{ ata:2, apo:1, hp:2, cambia:[[3,"barrido"],[5,"barrido"]], rasgo:"aturde" }),
  CL("clerigo_vida","monje",3,"clerigo","Clérigo de la vida","espiritu","El mejor sanador que vas a ver.",{ apo:2, hp:4, cambia:[[4,"cura"]] }),
  CL("clerigo_guerra","monje",3,"clerigo","Clérigo de la guerra","marcial","Reza y pega: marca al enemigo.",{ ata:2, apo:1, hp:3, cambia:[[2,"golpe"]], rasgo:"marca" }),
  CL("evocador","monje",3,"mago","Evocador","arcano","Cada conjuro quema a todos.",{ ata:2, hp:3, cambia:[[2,"barrido"]] }),
  CL("brujo","monje",3,"mago","Brujo","arcano","Pacto oscuro: rematar a los marcados.",{ ata:1, apo:2, hp:3, cambia:[[4,"doble"]], rasgo:"furtivo" }),
];
export const CLASES = Object.fromEntries(LISTA_CLASES.map(x=>[x.id,x]));
export const opcionesClase = h => LISTA_CLASES.filter(x=>x.rama===h.rama && x.nivel===(h.nivelClase||1)+1 && x.de===(h.clase||null));
/* Solo dado y atributos: la vida se suma aparte, para poder rehacer el dado si cae equipo. */
function aplicaClase(h, cl){
  const ataque = h.ataque+cl.ata, apoyo = h.apoyo+cl.apo;
  const caras = h.caras.map((f,i)=>{
    const n = cl.cambia.find(x=>x[0]===i);
    if(n) return c(n[1], (n[1]==="doble" ? 1 : 2) + (ES_ATAQUE(n[1]) ? ataque : apoyo));
    if(f.t==="vacio") return f;
    return { ...f, v:f.v + (ES_ATAQUE(f.t) ? cl.ata : cl.apo) };
  });
  return { ...h, caras, ataque, apoyo };
}
/* El héroe tal como quedaría: lo usa la pantalla de elegir para enseñar el dado nuevo. */
export function conClase(h, id){
  const cl = CLASES[id];
  const rasgos = cl.rasgo && !rasgosDe(h).includes(cl.rasgo) ? [...rasgosDe(h), cl.rasgo] : rasgosDe(h);
  return { ...aplicaClase(h, cl), hpMax:h.hpMax+cl.hp, hp:h.hp+cl.hp, clase:id, nivelClase:cl.nivel, rasgos, evoluciones:[...(h.evoluciones||[]), id] };
}
export function elegirClase(p, id){
  const i = p.evoCola?.[0], cl = CLASES[id];
  if(p.fase!=="evolucion" || i==null || !cl || !opcionesClase(p.heroes[i]).includes(cl)) return p;
  const evoCola = p.evoCola.slice(1);
  return { ...conHeroe(p, i, h=>conClase(h, id)), evoCola, fase:evoCola.length ? "evolucion" : "botin" };
}

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
  const especial = ESPECIALES[avatar?.especial] ? avatar.especial : DE_SERIE[rama];
  return { id, nombre, tipo, rama, avatar, caras, hpMax, hp:hpMax, escudo:0, ataque, apoyo, rangos, especial, rasgos:[RASGO_BASE[rama]] };
}

/* Liderazgo: tu equipo real también tira del grupo. Sin esto solo mejoraba uno de cada
   cuatro héroes y entrenar apenas se notaba (medido en scratchpad/barrido_mazmorra.mjs). */
export const liderazgoDe = heroe => Math.floor((heroe?.rangos||0)/AJUSTE.liderazgo);
export function conLiderazgo(h, l){
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
    const v = Math.round(m.v * (m.t==="bloqueo" || m.t==="cura" ? AJUSTE.hp : AJUSTE.dano) * tramo(p.sala));
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
  const tiro = (p.tiro||0)+1, base = p.ronda===1 && sinergiasDe(p.heroes).includes("equilibrio") ? 2 : 0;
  return { ...p, tiro, tiradas:TIRADAS-1, fase:"lanzar", heroes:p.heroes.map(h=>h.hp>0 ? { ...h, escudo:h.escudo+base } : h),
    dados:p.heroes.map(h=>h.hp>0 ? tiraDado(h, tiro, rng) : null) };
}
function empiezaSala(p, rng){
  const vivosN = p.heroes.length;
  const enemigos = OLEADAS[p.sala-1].map((id,i)=>{
    const hp = Math.max(1, Math.round(ENEMIGOS[id].hp * escala(vivosN) * AJUSTE.hp * tramo(p.sala)));
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
    const rehecho = (h.evoluciones||[]).reduce((x,id)=>aplicaClase(x, CLASES[id]), { ...heroe, caras, ataque:heroe.ataque+a, apoyo:heroe.apoyo+s });
    return { ...h, caras:rehecho.caras, avatar:heroe.avatar, ataque:rehecho.ataque, apoyo:rehecho.apoyo, hpMax:h.hpMax+extra, hp:h.hp+extra, base:{ hpMax:heroe.hpMax, caras:heroe.caras } };
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
const todos = (p, n) => ({ ...p, enemigos:p.enemigos.map(e=>e.hp>0 ? dana(e, n) : e) });

/* ¿Necesita objetivo? "enemigo", "aliado" o null si ya se sabe a quién va. */
export function objetivoDe(t){ return t==="golpe"||t==="doble" ? "enemigo" : ES_APOYO(t) ? "aliado" : null; }

/* Un golpe de un héroe a un enemigo: aquí se juntan marcas, rasgos y sinergias. */
function golpea(p, hi, ei, v, tipo, sin){
  const h = p.heroes[hi], e = p.enemigos[ei];
  if(!e || e.hp<=0) return p;
  const r = rasgosDe(h), marcado = (e.marca||0)>0;
  const n = v + (e.marca||0) + (marcado && r.includes("furtivo") ? 2 : 0) + (r.includes("furia") && h.hp*2<h.hpMax ? 2 : 0)
    + (tipo==="golpe" && sin.includes("marcial") ? 1 : 0) + (tipo==="barrido" && sin.includes("arcano") ? 1 : 0);
  const marca = r.includes("marca") || (tipo==="doble" && sin.includes("sigilo")) ? 1 : e.marca||0;
  return conEnemigo(p, ei, x=>({ ...dana(x, n), marca, aturdido:x.aturdido || (marcado && !x.jefe && r.includes("aturde")) }));
}
function inspirar(p, autor, obj){
  if(autor===obj || !rasgosDe(p.heroes[autor]).includes("inspira")) return p;
  return { ...p, dados:p.dados.map((d,i)=>i===obj && d && !d.usado && d.cara.t!=="vacio" ? { ...d, cara:{ ...d.cara, v:d.cara.v+1 } } : d) };
}
function aplicar(p, cara, obj, autor){
  const v = cara.v, sin = sinergiasDe(p.heroes);
  if(cara.t==="golpe") return golpea(p, autor, obj, v, "golpe", sin);
  if(cara.t==="doble") return golpea(golpea(p, autor, obj, v, "doble", sin), autor, obj, v, "doble", sin);
  if(cara.t==="barrido") return p.enemigos.reduce((q,e,i)=>e.hp>0 ? golpea(q, autor, i, v, "barrido", sin) : q, p);
  if(cara.t==="escudo") return inspirar(conHeroe(p, obj, h=>({ ...h, escudo:h.escudo+v })), autor, obj);
  if(cara.t==="cura") return inspirar(conHeroe(p, obj, h=>cura(h, v + (sin.includes("espiritu") ? 1 : 0))), autor, obj);
  return p;
}
function objetivoValido(p, t, obj){
  const tipo = objetivoDe(t);
  if(tipo==="enemigo") return p.enemigos[obj]?.hp>0;
  if(tipo==="aliado") return p.heroes[obj]?.hp>0;
  return true;
}
/* Lo que acaba de pasar, para que la interfaz lo cuente paso a paso. Las reglas ya han
   resuelto todo: la partida guardada es la final y esto solo sirve para enseñarlo, así que
   si la app muere a media animación no se pierde ni se repite nada. */
function evento(antes, despues, autor, tipo, extra={}){
  const dif = (lado, a, b) => a.map((x,i)=>({ lado, i, hp:b[i].hp-x.hp, escudo:b[i].escudo-x.escudo })).filter(x=>x.hp || x.escudo);
  return { autor, tipo, ...extra, cambios:[...dif("e", antes.enemigos, despues.enemigos), ...dif("h", antes.heroes, despues.heroes)] };
}
/* Aplica un evento a lo que se está enseñando. */
export function verEvento(v, ev){
  const toca = (lado, l) => l.map((x,i)=>{
    const c = ev.cambios.find(k=>k.lado===lado && k.i===i);
    return c ? { ...x, hp:x.hp+c.hp, escudo:x.escudo+c.escudo } : x;
  });
  return { ...v, enemigos:toca("e", v.enemigos), heroes:toca("h", v.heroes),
    dados:ev.dado==null ? v.dados : v.dados.map((d,n)=>n===ev.dado && d ? { ...d, usado:true } : d) };
}
export function usarDado(p, i, obj, rng=Math.random){
  const d = p.dados[i];
  if(p.fase!=="usar" || !d || d.usado || !objetivoValido(p, d.cara.t, obj)) return p;
  const q = aplicar(p, d.cara, obj, i);
  const ev = [evento(p, q, { lado:"h", i }, d.cara.t, { dado:i, obj })];
  return tras({ ...q, n:q.n+1, ev, dados:q.dados.map((x,n)=>n===i ? { ...x, usado:true } : x) }, rng);
}
/* Por qué no se puede usar ahora, o null si se puede. La interfaz lo enseña tal cual:
   un botón apagado sin explicación no le dice a nadie cuándo se activa. */
export function motivoEspecial(p, h, impulso){
  const heroe = p.heroes[h], e = especialDe(heroe), d = p.dados[h];
  if(heroe.hp<=0) return `${heroe.nombre} está fuera de combate.`;
  if(p.fase!=="usar") return "Primero pulsa Usar dados.";
  if(!d || d.usado) return "Gasta el dado de este héroe, y ya lo ha usado.";
  if(impulso<e.coste) return `Cuesta ${e.coste} de Impulso y tienes ${impulso}. Cada serie real suma 1.`;
  if(e.objetivo==="caido" && !p.heroes.some(x=>x.hp<=0)) return "No hay ningún compañero caído.";
  return null;
}
export function usarEspecial(p, h, obj, impulso, rng=Math.random){
  const nada = { partida:p, gastado:0 };
  if(motivoEspecial(p, h, impulso)) return nada;
  const heroe = p.heroes[h], e = especialDe(heroe);
  if(e.objetivo==="enemigo" && !(p.enemigos[obj]?.hp>0)) return nada;
  if(e.objetivo==="aliado" && !(p.heroes[obj]?.hp>0)) return nada;
  if(e.objetivo==="caido" && !(p.heroes[obj] && p.heroes[obj].hp<=0)) return nada;
  let q = e.hacer(p, { h, obj, a:heroe.ataque, s:heroe.apoyo });
  const ev = [evento(p, q, { lado:"h", i:h }, "especial", { dado:h, obj, nombre:e.nombre })];
  q = { ...q, n:q.n+1, ev, especiales:(q.especiales||0)+1, dados:q.dados.map((x,n)=>n===h && x ? { ...x, usado:true } : x) };
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
  if(ASCENSOS.includes(p.sala)) return { ...p, heroes, fase:"evolucion", evoCola:heroes.map((_,i)=>i), botin:sacaBotin(rng) };
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
  let q = { ...p, log:[] }; const textos = [], ev = [];
  q.enemigos.forEach((e,i)=>{
    if(e.hp<=0 || !e.intento) return;
    const { t, v, obj } = e.intento, antes = q;
    if(vivos(q.heroes).length===0) return;
    if(e.aturdido){ textos.push(`${e.nombre} está aturdido`); return; }
    if(t==="golpe"){
      const previsto = q.heroes[obj]?.hp>0 ? obj : vivos(q.heroes)[0];
      if(previsto==null) return;
      const escolta = q.heroes.findIndex(h=>h.hp>0 && h.escudo>0 && rasgosDe(h).includes("guardian"));
      const destino = escolta>=0 ? escolta : previsto;
      q = conHeroe(q, destino, h=>dana(h, v));
      textos.push(`${e.nombre}: -${v} a ${q.heroes[destino].nombre}`);
    }
    if(t==="todos"){ q = { ...q, heroes:q.heroes.map(h=>h.hp>0 ? dana(h, v) : h) }; textos.push(`${e.nombre}: -${v} a todos`); }
    if(t==="bloqueo"){ q = conEnemigo(q, i, x=>({ ...x, escudo:x.escudo+v })); textos.push(`${e.nombre} se protege`); }
    if(t==="cura"){ q = conEnemigo(q, i, x=>({ ...x, hp:Math.min(x.hpMax, x.hp+v) })); textos.push(`${e.nombre} se recupera`); }
    ev.push(evento(antes, q, { lado:"e", i }, t));
  });
  const manada = sinergiasDe(q.heroes).includes("naturaleza") ? 1 : 0;
  q = { ...q, ev, n:q.n+1, heroes:q.heroes.map(h=>({ ...cura(h, manada), escudo:0 })),
    enemigos:q.enemigos.map(e=>e.hp>0 ? { ...e, turno:e.turno+1, marca:0, aturdido:false, escudo:e.intento?.t==="bloqueo" ? e.escudo : 0 } : e) };
  q = anota(q, ...textos.slice(0,3));
  if(!vivos(q.heroes).length) return { ...q, fase:"fin", victoria:false };
  return tirada(intenciones({ ...q, ronda:q.ronda+1 }, rng), rng);
}

/* --- Gloria y llaves -----------------------------------------------------------
   Gloria es la puntuación de la mazmorra y solo sirve para compararse: no da XP ni
   nada que cambie al héroe. Para que escalar en la clasificación exija ir al gimnasio,
   solo puntúan las partidas con llave, y las llaves salen de entrenos terminados, una
   al día. Sin llave se juega igual, de práctica. */
export const MAZMORRA_VACIA = { partida:null, impulso:0, llaves:1, ultimaLlave:null, gloria:0, salas:0, mazmorras:0, mejorSala:0, ramasGanadas:[], logros:{}, logrosNuevos:[] };
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
    mejorSala:Math.max(mz.mejorSala||0, ganadas), mazmorras:(mz.mazmorras||0)+(cierra && p.victoria ? 1 : 0),
    ramasGanadas:cierra && p.victoria ? [...new Set([...(mz.ramasGanadas||[]), p.heroes[0].rama])] : mz.ramasGanadas };
}

/* Logros de la mazmorra. Van aparte de los del gimnasio porque aquellos dan XP y esta
   mazmorra nunca da nada: solo se guardan aquí, en `mz`, y no tocan `state`. Y como la
   Gloria, solo cuentan las partidas con llave: si no, saldrían jugando sin pisar el gym.
   `si(mz, p, ganada)`: `p` es la partida en curso si puntúa, y null si no. */
const amigosEn = p => p ? p.heroes.filter(h=>h.tipo==="amigo").length : 0;
const asciende = (p, n) => !!p?.heroes.some(h=>(h.evoluciones||[]).length>=n);
export const LOGROS = [
  { id:"m_sala",     titulo:"Primera sangre",        texto:"Supera tu primera sala",                     sprite:120, si:mz=>mz.salas>=1 },
  { id:"m_sofa",     titulo:"Arriba de una vez",     texto:"Derrota al Sofá Maldito",                    sprite:110, si:mz=>mz.mejorSala>=5 },
  { id:"m_abandono", titulo:"Aquí no se rinde nadie", texto:"Derrota a El Abandono",                     sprite:111, si:mz=>mz.mazmorras>=1 },
  { id:"m_cinco",    titulo:"Costumbre",             texto:"Supera 5 mazmorras",                         sprite:92,  si:mz=>mz.mazmorras>=5 },
  { id:"m_veinte",   titulo:"Hábito de hierro",      texto:"Supera 20 mazmorras",                        sprite:93,  si:mz=>mz.mazmorras>=20 },
  { id:"m_cien",     titulo:"Cien puertas",          texto:"Supera 100 salas",                           sprite:45,  si:mz=>mz.salas>=100 },
  { id:"m_gloria",   titulo:"Con gloria",            texto:"Consigue 1.000 de Gloria",                   sprite:117, si:mz=>mz.gloria>=1000 },
  { id:"m_leyenda",  titulo:"Leyenda del gimnasio",  texto:"Consigue 5.000 de Gloria",                   sprite:105, si:mz=>mz.gloria>=5000 },
  { id:"m_ascenso",  titulo:"Un paso más",           texto:"Haz ascender a un héroe",                    sprite:98,  si:(mz,p)=>asciende(p,1) },
  { id:"m_final",    titulo:"Forma final",           texto:"Lleva a un héroe a su última clase",         sprite:96,  si:(mz,p)=>asciende(p,2) },
  { id:"m_bajas",    titulo:"Nadie se queda atrás",  texto:"Supera una mazmorra sin perder a nadie",     sprite:115, si:(mz,p,g)=>g && p.heroes.every(h=>h.hp>0) },
  { id:"m_amigo",    titulo:"Con ayuda de un amigo", texto:"Supera una mazmorra con un amigo en el grupo", sprite:99, si:(mz,p,g)=>g && amigosEn(p)>=1 },
  { id:"m_amigos",   titulo:"Todos a una",           texto:"Supera una mazmorra con tres amigos",        sprite:100, si:(mz,p,g)=>g && amigosEn(p)>=3 },
  { id:"m_sinergia", titulo:"Buen equipo",           texto:"Supera una mazmorra con dos sinergias",      sprite:116, si:(mz,p,g)=>g && sinergiasDe(p.heroes).length>=2 },
  { id:"m_ramas",    titulo:"Maestro de las cinco",  texto:"Supera una mazmorra con cada rama",          sprite:84,  si:mz=>(mz.ramasGanadas||[]).length>=5 },
  { id:"m_especial", titulo:"Golpe especial",        texto:"Usa un ataque especial",                     sprite:129, si:(mz,p)=>(p?.especiales||0)>=1 },
  { id:"m_impulso",  titulo:"A tope",                texto:`Llega a ${IMPULSO_MAX} de Impulso entrenando`, sprite:114, si:mz=>mz.impulso>=IMPULSO_MAX },
  { id:"m_llaves",   titulo:"Llavero lleno",         texto:`Junta ${LLAVES_MAX} llaves`,                 sprite:91,  si:mz=>mz.llaves>=LLAVES_MAX },
];
/* Se puede llamar tras cada toque. Con `avisar` deja los nuevos en `logrosNuevos` para
   que la interfaz los enseñe; sin él (al abrir la app) los apunta sin decir nada. */
export function comprobarLogros(mz, hoy, avisar=true){
  const p = mz.partida?.puntua ? mz.partida : null, ganada = !!(p?.victoria && p.fase==="fin");
  const nuevos = LOGROS.filter(l=>!mz.logros?.[l.id] && l.si(mz, p, ganada));
  if(!nuevos.length) return mz;
  const logros = { ...mz.logros };
  nuevos.forEach(l=>{ logros[l.id] = hoy; });
  return { ...mz, logros, logrosNuevos:avisar ? [...(mz.logrosNuevos||[]), ...nuevos.map(l=>l.id)] : mz.logrosNuevos };
}
