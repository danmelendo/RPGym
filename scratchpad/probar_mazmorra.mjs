// Reglas de la mazmorra y equilibrio. `node scratchpad/probar_mazmorra.mjs`
// Juega miles de partidas con una IA sencilla: si el equipo real no hace el juego más
// fácil, o si alguien se pasa la mazmorra sin pisar el gimnasio, esto falla.
import fs from "fs";
import assert from "assert";
import * as M from "../src/mazmorra.js";
const AV = JSON.parse(fs.readFileSync(new URL("../src/avatar-data.json", import.meta.url), "utf8"));
const piezas = AV.piezas;

function semilla(a){ return ()=>{ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
const equipo = (rama, hasta) => { const e={}; Object.entries(piezas).filter(([,p])=>p.rama===rama).sort((a,b)=>a[1].u-b[1].u).forEach(([id,p])=>{ if(p.u<=hasta) e[p.ranura]=id; }); return e; };
const heroe = (id, rama, hasta, level) => M.crearHeroe({ id, nombre:id, avatar:{ rama, equipo:equipo(rama,hasta) }, level }, piezas);

// --- Reglas básicas
{
  const r = semilla(1);
  const novato = heroe("a","guerrero",0,1), veterano = heroe("b","guerrero",99999,40);
  assert(novato.caras.some(c=>c.t==="vacio"), "el novato tiene una cara vacía");
  assert(!veterano.caras.some(c=>c.t==="vacio"), "el equipo completo quita la cara vacía");
  assert(veterano.hpMax>novato.hpMax+5, "el equipo da vida");
  assert(Math.max(...veterano.caras.map(c=>c.v))>Math.max(...novato.caras.map(c=>c.v))+1, "el equipo da daño");
  assert.equal(M.rangoPieza(0),0); assert.equal(M.rangoPieza(60),1); assert.equal(M.rangoPieza(230),2); assert.equal(M.rangoPieza(700),3);

  let p = M.nuevaPartida([novato], r);
  assert.equal(p.fase,"lanzar"); assert.equal(p.tiradas,M.TIRADAS-1); assert.equal(p.enemigos.length,2);
  assert(p.enemigos.every(e=>e.intento), "los enemigos anuncian lo que van a hacer");
  // Un dado fijado no cambia al relanzar, y las tiradas se acaban
  p = M.fijar(p,0); const antes=p.dados[0].cara, tiroFijo=p.dados[0].tiro;
  p = M.relanzar(p,r); p = M.relanzar(p,r); assert.deepEqual(p.dados[0].cara,antes); assert.equal(p.tiradas,0);
  assert.equal(p.dados[0].tiro,tiroFijo,"un dado fijado no se vuelve a lanzar");
  assert.deepEqual(p.heroes[0].caras[p.dados[0].i],p.dados[0].cara,"el índice apunta a la cara que salió");
  { const d2=M.nuevaPartida([novato,novato],r), l=M.relanzar(M.fijar(d2,0),r);
    assert.equal(l.dados[0].tiro,d2.tiro); assert.equal(l.dados[1].tiro,d2.tiro+1,"el dado suelto sí se relanza"); }
  const sinTiradas = M.relanzar(p,r); assert.equal(sinTiradas,p);
  // La partida es JSON puro: se guarda y se retoma igual
  assert.deepEqual(JSON.parse(JSON.stringify(p)),p);

  // Superserie
  const dos = M.nuevaPartida([novato, heroe("c","guerrero",0,1)], r);
  const forzada = { ...dos, dados:[{ cara:{t:"golpe",v:2},fijo:false,usado:false },{ cara:{t:"golpe",v:1},fijo:false,usado:false }] };
  const conf = M.confirmar(forzada);
  assert.equal(conf.dados[0].cara.v,3); assert.equal(conf.dados[1].cara.v,2); assert(conf.dados[0].superserie);

  // Matar a un enemigo cancela lo que anunciaba
  const un = { ...conf, enemigos:conf.enemigos.map((e,i)=>({ ...e, hp:i?0:1, intento:{t:"golpe",v:99,obj:0} })) };
  const yaMuerto = M.usarDado(un,0,0,r);
  assert.equal(yaMuerto.fase,"botin","sin enemigos vivos se gana la sala");
  assert.equal(yaMuerto.heroes[0].hp,novato.hpMax,"no recibe el golpe anunciado");

  // Objetivo muerto: el dado no se gasta
  const muerto = { ...conf, enemigos:conf.enemigos.map((e,i)=>i? e : { ...e, hp:0 }) };
  assert.equal(M.usarDado(muerto,0,0,r),muerto);

  // El escudo absorbe y se va al acabar el turno
  const esc = { ...conf, heroes:conf.heroes.map((h,i)=>({ ...h, escudo:i?0:3 })), enemigos:conf.enemigos.map(e=>({ ...e, intento:{t:"golpe",v:5,obj:0} })).slice(0,1) };
  const trasT = M.finTurno(esc,r);
  assert.equal(trasT.heroes[0].hp,novato.hpMax-2); assert.equal(trasT.heroes[0].escudo,0);

  // El especial cuesta Impulso y sin él no hace nada
  const sinI = M.usarEspecial(conf,0,0,0,r); assert.equal(sinI.gastado,0); assert.equal(sinI.partida,conf);
  const conI = M.usarEspecial(conf,0,0,6,r); assert.equal(conI.gastado,3); assert(conI.partida.dados[0].usado);

  // Derrota
  const casi = { ...conf, heroes:conf.heroes.map(h=>({ ...h, hp:1 })), enemigos:conf.enemigos.map(e=>({ ...e, intento:{t:"todos",v:9} })) };
  const fin = M.finTurno(casi,r); assert.equal(fin.fase,"fin"); assert.equal(fin.victoria,false);

  // Equipo nuevo a mitad de partida
  const mejor = heroe("a","guerrero",700,1);
  const ref = M.refrescarHeroe(M.nuevaPartida([novato],r), mejor);
  assert(ref.heroes[0].hpMax>novato.hpMax); assert(ref.heroes[0].hp>novato.hp);
  const dosVeces = M.refrescarHeroe(ref, mejor); assert.equal(dosVeces.heroes[0].hpMax,ref.heroes[0].hpMax,"no se acumula");
}

// --- Gloria y llaves
{
  const r = semilla(9), yo = heroe("yo","guerrero",0,1);
  let mz = { ...M.MAZMORRA_VACIA };
  assert.equal(M.gloriaDeSala(1),10); assert.equal(M.gloriaDeSala(5),100); assert.equal(M.gloriaDeSala(10),150);
  // Con llave puntúa y la gasta; sin llave no
  mz = M.empezar(mz,[yo],r); assert.equal(mz.llaves,0); assert(mz.partida.puntua);
  const gana = m => M.apuntar({ ...m, partida:{ ...m.partida, ganadas:(m.partida.ganadas||0)+1 } });
  mz = gana(mz); assert.equal(mz.gloria,10); assert.equal(mz.salas,1); assert.equal(mz.mejorSala,1);
  assert.equal(M.apuntar(mz),mz,"una sala no cuenta dos veces");
  mz = gana(mz); assert.equal(mz.gloria,30); assert.equal(mz.partida.gloriaPartida,30);
  // Victoria: solo una vez, por mucho que se repinte
  const fin = { ...mz, partida:{ ...mz.partida, fase:"fin", victoria:true, ganadas:3 } };
  const hecho = M.apuntar(fin); assert.equal(hecho.gloria,30+30+M.GLORIA_VICTORIA); assert.equal(hecho.mazmorras,1);
  assert.equal(M.apuntar(hecho).gloria,hecho.gloria); assert.equal(M.apuntar(hecho).mazmorras,1);
  // Derrota: lo ganado se queda, sin bono
  const der = M.apuntar({ ...mz, partida:{ ...mz.partida, fase:"fin", victoria:false } }); assert.equal(der.gloria,30); assert.equal(der.mazmorras,0);
  // Práctica: se juega, pero no suma nada
  let pr = M.empezar({ ...M.MAZMORRA_VACIA, llaves:0 },[yo],r); assert.equal(pr.partida.puntua,false); assert.equal(pr.llaves,0);
  pr = gana(pr); assert.equal(pr.gloria,0); assert.equal(pr.salas,0); assert.equal(pr.mejorSala,0);
  // Llaves: una al día y con tope
  let k = { ...M.MAZMORRA_VACIA, llaves:0 };
  k = M.darLlave(k,"2026-11-05"); assert.equal(k.llaves,1);
  assert.equal(M.darLlave(k,"2026-11-05"),k,"dos entrenos el mismo día no dan dos llaves");
  k = M.darLlave(M.darLlave(M.darLlave(k,"2026-11-06"),"2026-11-07"),"2026-11-08"); assert.equal(k.llaves,M.LLAVES_MAX);
  // Una partida de otro formato se descarta sin perder los totales
  const vieja = M.cargarMazmorra({ gloria:50, llaves:2, partida:{ sala:4, dados:[{ cara:{ t:"golpe", v:1 } }] } });
  assert.equal(vieja.partida,null); assert.equal(vieja.gloria,50); assert.equal(vieja.llaves,2);
  const buena = M.empezar({ ...M.MAZMORRA_VACIA },[yo],r);
  assert.deepEqual(M.cargarMazmorra(JSON.parse(JSON.stringify(buena))).partida,buena.partida);
  assert.equal(M.cargarMazmorra(null).llaves,1); assert.equal(M.cargarMazmorra(undefined).partida,null);
  // Lo que importa: nada de esto toca XP, nivel ni equipo
  const claves = Object.keys(hecho).sort().join();
  assert(!/xp|level|nivel|equipo|avatar/i.test(claves), "la mazmorra no guarda progreso del héroe");
}

// --- IA: mata lo que pueda antes de que golpee, se cubre si va a morir
const peligro = (p,h)=>p.enemigos.reduce((a,e)=>a+(e.hp>0&&e.intento&&((e.intento.t==="golpe"&&e.intento.obj===h)?e.intento.v:e.intento.t==="todos"?e.intento.v:0)),0);
// `recarga` es el Impulso que entra por sala: en un entreno llega poco a poco, serie a serie.
function juega(heroes, recarga, r){
  let p=M.nuevaPartida(heroes,r), imp=recarga, seguro=0;
  while(p.fase!=="fin" && seguro++<2000){
    if(p.fase==="botin"){ const b=p.botin.find(x=>x.id==="creatina")||p.botin[0]; const q=M.elegirBotin(p,b.id,r); p=q.partida; imp=Math.min(M.IMPULSO_MAX,imp+q.impulso+recarga); continue; }
    if(p.fase==="lanzar"){
      p.dados.forEach((d,i)=>{ if(d&&d.cara.t!=="vacio"&&d.cara.v>=2&&!d.fijo) p=M.fijar(p,i); });
      if(p.tiradas>0 && p.dados.some(d=>d&&!d.fijo)){ p=M.relanzar(p,r); continue; }
      p=M.confirmar(p); continue;
    }
    for(let i=0;i<p.heroes.length;i++){
      if(p.fase!=="usar") break;
      const e=M.ESPECIALES[p.heroes[i].rama], ev=p.enemigos.map((x,n)=>x.hp>0?n:-1).filter(n=>n>=0);
      if(p.heroes[i].hp>0 && imp>=e.coste && p.dados[i] && !p.dados[i].usado && ev.length){ const q=M.usarEspecial(p,i,ev[0],imp,r); p=q.partida; imp-=q.gastado; }
    }
    if(p.fase!=="usar") continue;
    let hecho=true;
    while(hecho && p.fase==="usar"){
      hecho=false;
      for(let i=0;i<p.dados.length && p.fase==="usar";i++){
        const d=p.dados[i]; if(!d||d.usado||d.cara.t==="vacio") continue;
        const tipo=M.objetivoDe(d.cara.t); let obj=0;
        if(tipo==="enemigo"){ const ev=p.enemigos.map((x,n)=>({x,n})).filter(o=>o.x.hp>0).sort((a,b)=>a.x.hp-b.x.hp); if(!ev.length) continue; obj=ev[0].n; }
        if(tipo==="aliado"){ const hv=p.heroes.map((x,n)=>({n,g:peligro(p,n)+x.hpMax-x.hp})).filter(o=>p.heroes[o.n].hp>0).sort((a,b)=>b.g-a.g); obj=hv[0].n; }
        p=M.usarDado(p,i,obj,r); hecho=true;
      }
    }
    if(p.fase==="usar") p=M.finTurno(p,r);
  }
  return p;
}
function tasa(nombre, grupo, impulso=0, n=4000){
  let gana=0, sala=0;
  for(let i=0;i<n;i++){ const p=juega(grupo(),impulso,semilla(i*7+3)); if(p.victoria) gana++; sala+=p.sala; }
  const t=gana/n;
  console.log(`${nombre.padEnd(46)} ${(t*100).toFixed(1).padStart(5)} %   sala media ${(sala/n).toFixed(1)}`);
  return t;
}
const npc = (rama,i)=>heroe("npc"+i,rama,0,4);
const mezcla = (u,l)=>[heroe("yo","guerrero",u,l),npc("monje",1),npc("explorador",2),npc("picaro",3)];
const novato = tasa("Recién llegado + 3 NPC", ()=>mezcla(0,1));
const unMes = tasa("Un mes (100 series, nivel 8) + 3 NPC", ()=>mezcla(100,8));
const medio = tasa("Medio año (320 series, nivel 20) + 3 NPC", ()=>mezcla(320,20));
const veterano = tasa("Equipo completo (nivel 40) + 3 NPC", ()=>mezcla(99999,40));
const conImpulso = tasa("Un mes, jugando durante el entreno (+2 por sala)", ()=>mezcla(100,8), 2);
const amigos = tasa("Un mes + 3 amigos que entrenan mucho", ()=>[heroe("yo","guerrero",100,8),heroe("a","monje",320,20),heroe("b","explorador",320,20),heroe("c","barbaro",320,20)]);
for(const r of ["guerrero","picaro","barbaro","explorador","monje"])
  tasa(`  Un mes como ${r}`, ()=>[heroe("yo",r,100,8),npc("monje",1),npc("explorador",2),npc("picaro",3)], 0, 1500);

assert(novato<.1, `un novato no debería pasársela sin entrenar: ${novato}`);
assert(unMes>novato && medio>unMes && veterano>medio, "cada escalón de equipo debe ayudar");
assert(veterano>.9, `con todo el equipo debe ser ganable: ${veterano}`);
assert(amigos>unMes, "tener amigos que entrenan debe notarse");
assert(conImpulso>unMes, "entrar con series hechas debe notarse");
console.log("Mazmorra: todo correcto");
