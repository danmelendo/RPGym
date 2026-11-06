// Busca el ajuste de dificultad. `node scratchpad/barrido_mazmorra.mjs`
import fs from "fs";
import * as M from "../src/mazmorra.js";
const piezas = JSON.parse(fs.readFileSync(new URL("../src/avatar-data.json", import.meta.url), "utf8")).piezas;
function semilla(a){ return ()=>{ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
const equipo = (rama, hasta) => { const e={}; Object.entries(piezas).filter(([,p])=>p.rama===rama).sort((a,b)=>a[1].u-b[1].u).forEach(([id,p])=>{ if(p.u<=hasta) e[p.ranura]=id; }); return e; };
const heroe = (id, rama, hasta, level) => M.crearHeroe({ id, nombre:id, avatar:{ rama, equipo:equipo(rama,hasta) }, level }, piezas);
const peligro = (p,h)=>p.enemigos.reduce((a,e)=>a+(e.hp>0&&e.intento&&((e.intento.t==="golpe"&&e.intento.obj===h)?e.intento.v:e.intento.t==="todos"?e.intento.v:0)),0);
export function juega(heroes, imp, r){
  let p=M.nuevaPartida(heroes,r), s=0;
  while(p.fase!=="fin" && s++<3000){
    if(p.fase==="evolucion"){ const op=M.opcionesClase(p.heroes[p.evoCola[0]]); p=M.elegirClase(p,op[r()<.5?0:1].id); continue; }
    if(p.fase==="botin"){ const b=p.botin.find(x=>x.id==="creatina")||p.botin[0]; const q=M.elegirBotin(p,b.id,r); p=q.partida; imp=Math.min(M.IMPULSO_MAX,imp+q.impulso); continue; }
    if(p.fase==="lanzar"){ p.dados.forEach((d,i)=>{ if(d&&d.cara.t!=="vacio"&&d.cara.v>=2&&!d.fijo) p=M.fijar(p,i); }); if(p.tiradas>0&&p.dados.some(d=>d&&!d.fijo)){ p=M.relanzar(p,r); continue; } p=M.confirmar(p); continue; }
    for(let i=0;i<p.heroes.length&&p.fase==="usar";i++){ const e=M.especialDe(p.heroes[i]), ev=p.enemigos.map((x,n)=>x.hp>0?n:-1).filter(n=>n>=0); if(p.heroes[i].hp>0&&imp>=e.coste&&p.dados[i]&&!p.dados[i].usado&&ev.length){ const q=M.usarEspecial(p,i,ev[0],imp,r); p=q.partida; imp-=q.gastado; } }
    if(p.fase!=="usar") continue;
    for(let i=0;i<p.dados.length&&p.fase==="usar";i++){ const d=p.dados[i]; if(!d||d.usado||d.cara.t==="vacio") continue; const t=M.objetivoDe(d.cara.t); let o=0;
      if(t==="enemigo"){ const ev=p.enemigos.map((x,n)=>({x,n})).filter(z=>z.x.hp>0).sort((a,b)=>a.x.hp-b.x.hp); if(!ev.length) continue; o=ev[0].n; }
      if(t==="aliado"){ const hv=p.heroes.map((x,n)=>({n,g:peligro(p,n)+x.hpMax-x.hp})).filter(z=>p.heroes[z.n].hp>0).sort((a,b)=>b.g-a.g); o=hv[0].n; }
      p=M.usarDado(p,i,o,r); }
    if(p.fase==="usar") p=M.finTurno(p,r);
  }
  return p;
}
const npc=(rama,i)=>heroe("npc"+i,rama,0,4);
const mezcla=(u,l)=>[heroe("yo","guerrero",u,l),npc("monje",1),npc("explorador",2),npc("picaro",3)];
const t=(g,imp=0,n=500)=>{ let w=0,s=0; for(let i=0;i<n;i++){ const p=juega(g(),imp,semilla(i*7+3)); if(p.victoria) w++; s+=p.sala; } return [Math.round(w/n*100), +(s/n).toFixed(1)]; };
for(const k1 of [1.2,1.3,1.4]) for(const k2 of [1.3,1.38,1.46,1.54]){
  M.AJUSTE.tramos=[1,k1,k2];
  console.log(`tramos ${k1} ${k2}:  novato ${t(()=>mezcla(0,1))}  mes ${t(()=>mezcla(100,8))}  medio ${t(()=>mezcla(320,20))}  todo ${t(()=>mezcla(99999,40))}`);
}
