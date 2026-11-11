import React, { useState, useEffect, useLayoutEffect, useRef, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import * as cloud from "./cloud.js";
import * as cripto from "./cripto.js";
import * as push from "./push.js";
import AVATAR from "./avatar-data.json";
import * as M from "./mazmorra.js";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import {
  Flame, Trophy, Dumbbell, TrendingUp, Utensils, Home, Play, Check, SkipForward, Timer,
  Zap, Award, Crown, Shield, Star, ChevronLeft, Shuffle, Target, Sparkles, Ruler,
  Lock, Lightbulb, ShoppingCart, CalendarDays, Compass, Moon, Sunrise, Gauge, ClipboardList,
  ScrollText, Swords, Footprints, Mountain, Heart, ShieldAlert, Info, Ban,
  Settings, Bell, CreditCard, User, Users, ChevronRight, ChevronDown, Plus, X,
  Sun, Palette, Scale, Download, Upload, Cloud,
  Trash2, Search, ArrowUp, ArrowDown, Pencil, Copy, FileText, Eye, Minus, Share2, Volume2,
  BedDouble, Palmtree, CheckCircle2, GitBranch,
} from "lucide-react";

/* =========================================================================
   PROGRAMA POR FASES
   ========================================================================= */

const PHASES = [
  { id: "aclimatacion", name: "Acondicionamiento", weeks: "Semanas 1-3", color: "#5BA8C9",
    goal: "Enseña al cuerpo los patrones, prepara tendones y articulaciones y crea el hábito. Reps altas y peso cómodo (RPE 6-7): debes acabar cada serie con 3-4 repeticiones aún en el tanque.",
    routines: ["acli_fb"] },
  { id: "recomp", name: "Recomposición", weeks: "Semanas 4-11", color: "#3FB984",
    goal: "Perder grasa y ganar músculo a la vez. Fuerza + hipertrofia + algo de core y cardio. La grasa abdominal y pectoral baja con el déficit global y la constancia, no con ejercicios localizados.",
    routines: ["recomp_fb", "recomp_ul", "recomp_home", "core_cardio"] },
  { id: "hipertrofia", name: "Hipertrofia", weeks: "Semana 12+", color: "#E8B04B",
    goal: "Maximizar el crecimiento muscular con más volumen y progresión de cargas. Empuja cerca del fallo (RPE 8-9).",
    routines: ["hyp_ppl", "hyp_ul", "hyp_ppl6", "fuerza_5x5"] },
];

/* =========================================================================
   RUTINAS
   ========================================================================= */

const ROUTINES = [
  /* -------- ACONDICIONAMIENTO -------- */
  { id:"acli_fb", cat:"Acondicionamiento", name:"Acondicionamiento Full Body", subtitle:"3 días · RPE 6 · empieza aquí",
    daysPerWeek:3, rpe:"6-7",
    blurb:"Un inicio suave: pocas series por ejercicio, reps altas y peso cómodo para aprender la técnica sin agujetas ni machacarte. Sube una serie cada 1-2 semanas conforme cojas soltura.",
    days:[
      { name:"Día A", exercises:[
        { name:"Sentadilla goblet", sets:3, reps:"12-15", rest:75, muscle:"Pierna" },
        { name:"Press banca", sets:2, reps:"12-15", rest:75, muscle:"Pecho" },
        { name:"Remo con mancuerna", sets:2, reps:"12-15", rest:60, muscle:"Espalda" },
        { name:"Press militar mancuernas", sets:2, reps:"12-15", rest:60, muscle:"Hombro" },
        { name:"Plancha", sets:2, reps:"20 s", rest:45, muscle:"Core" },
      ]},
      { name:"Día B", exercises:[
        { name:"Prensa de piernas", sets:3, reps:"12-15", rest:75, muscle:"Pierna" },
        { name:"Jalón al pecho", sets:2, reps:"12-15", rest:60, muscle:"Espalda" },
        { name:"Press inclinado mancuernas", sets:2, reps:"12-15", rest:60, muscle:"Pecho" },
        { name:"Elevaciones laterales", sets:2, reps:"12-15", rest:45, muscle:"Hombro" },
        { name:"Elevación de piernas", sets:2, reps:"12-15", rest:45, muscle:"Core" },
      ]},
      { name:"Día C", exercises:[
        { name:"Peso muerto rumano", sets:2, reps:"12-15", rest:75, muscle:"Femoral" },
        { name:"Remo en máquina", sets:2, reps:"12-15", rest:60, muscle:"Espalda" },
        { name:"Fondos asistidos", sets:2, reps:"10-12", rest:60, muscle:"Pecho" },
        { name:"Face pull", sets:2, reps:"15-20", rest:45, muscle:"Hombro" },
        { name:"Curl de bíceps", sets:2, reps:"12-15", rest:45, muscle:"Bíceps" },
      ]},
    ]},

  /* -------- RECOMPOSICIÓN -------- */
  { id:"recomp_fb", cat:"Recomposición", name:"Recomp Full Body", subtitle:"3 días · fuerza + hipertrofia + core",
    daysPerWeek:3, rpe:"7-8",
    blurb:"Mezcla compuestos pesados con hipertrofia y un remate de core. Ideal para tu objetivo: bajar grasa manteniendo (y ganando) músculo.",
    days:[
      { name:"Día A", exercises:[
        { name:"Sentadilla", sets:4, reps:"8-10", rest:120, muscle:"Pierna" },
        { name:"Press banca", sets:4, reps:"8-10", rest:120, muscle:"Pecho" },
        { name:"Remo con barra", sets:3, reps:"10-12", rest:90, muscle:"Espalda" },
        { name:"Elevaciones laterales", sets:3, reps:"12-15", rest:45, muscle:"Hombro" },
        { name:"Plancha", sets:3, reps:"45 s", rest:45, muscle:"Core" },
      ]},
      { name:"Día B", exercises:[
        { name:"Peso muerto", sets:4, reps:"6-8", rest:150, muscle:"Espalda" },
        { name:"Press militar", sets:3, reps:"8-10", rest:90, muscle:"Hombro" },
        { name:"Jalón al pecho", sets:3, reps:"10-12", rest:75, muscle:"Espalda" },
        { name:"Extensión de tríceps en polea", sets:3, reps:"12-15", rest:45, muscle:"Tríceps" },
        { name:"Rueda abdominal", sets:3, reps:"10-12", rest:45, muscle:"Core" },
      ]},
      { name:"Día C", exercises:[
        { name:"Prensa de piernas", sets:4, reps:"10-12", rest:90, muscle:"Pierna" },
        { name:"Press inclinado mancuernas", sets:3, reps:"10-12", rest:75, muscle:"Pecho" },
        { name:"Remo con mancuerna", sets:3, reps:"10-12", rest:75, muscle:"Espalda" },
        { name:"Curl de bíceps", sets:3, reps:"12-15", rest:45, muscle:"Bíceps" },
        { name:"Elevación de piernas", sets:3, reps:"12-15", rest:45, muscle:"Core" },
      ]},
    ]},

  { id:"recomp_ul", cat:"Recomposición", name:"Recomp Torso / Pierna", subtitle:"4 días · más frecuencia",
    daysPerWeek:4, rpe:"7-8",
    blurb:"Cuatro días partiendo torso y pierna. Cada músculo dos veces por semana, con volumen suficiente para recomponer.",
    days:[
      { name:"Torso A", exercises:[
        { name:"Press banca", sets:4, reps:"6-8", rest:120, muscle:"Pecho" },
        { name:"Remo con barra", sets:4, reps:"8-10", rest:120, muscle:"Espalda" },
        { name:"Press militar", sets:3, reps:"8-10", rest:90, muscle:"Hombro" },
        { name:"Jalón al pecho", sets:3, reps:"10-12", rest:75, muscle:"Espalda" },
        { name:"Curl de bíceps", sets:3, reps:"12-15", rest:45, muscle:"Bíceps" },
      ]},
      { name:"Pierna A", exercises:[
        { name:"Sentadilla", sets:4, reps:"6-8", rest:150, muscle:"Pierna" },
        { name:"Peso muerto rumano", sets:3, reps:"8-10", rest:120, muscle:"Femoral" },
        { name:"Prensa de piernas", sets:3, reps:"12-15", rest:90, muscle:"Pierna" },
        { name:"Elevación de talones de pie", sets:4, reps:"15-20", rest:45, muscle:"Gemelo" },
        { name:"Plancha", sets:3, reps:"45 s", rest:45, muscle:"Core" },
      ]},
      { name:"Torso B", exercises:[
        { name:"Press inclinado mancuernas", sets:4, reps:"8-10", rest:90, muscle:"Pecho" },
        { name:"Remo con mancuerna", sets:4, reps:"10-12", rest:90, muscle:"Espalda" },
        { name:"Elevaciones laterales", sets:4, reps:"12-15", rest:45, muscle:"Hombro" },
        { name:"Extensión de tríceps en polea", sets:3, reps:"12-15", rest:45, muscle:"Tríceps" },
        { name:"Face pull", sets:3, reps:"15-20", rest:45, muscle:"Hombro" },
      ]},
      { name:"Pierna B", exercises:[
        { name:"Peso muerto", sets:4, reps:"5-6", rest:180, muscle:"Espalda" },
        { name:"Zancadas con barra", sets:3, reps:"10-12", rest:90, muscle:"Pierna" },
        { name:"Curl femoral tumbado", sets:3, reps:"12-15", rest:60, muscle:"Femoral" },
        { name:"Elevación de talones de pie", sets:4, reps:"15-20", rest:45, muscle:"Gemelo" },
        { name:"Rueda abdominal", sets:3, reps:"10-12", rest:45, muscle:"Core" },
      ]},
    ]},

  { id:"recomp_home", cat:"Recomposición", name:"Recomp en Casa", subtitle:"3 días · mancuernas / peso corporal",
    daysPerWeek:3, rpe:"7-8",
    blurb:"Para los días que no puedas ir al gym. Solo necesitas un par de mancuernas (o bandas) y suelo.",
    days:[
      { name:"Día A", exercises:[
        { name:"Sentadilla goblet", sets:4, reps:"12-15", rest:75, muscle:"Pierna" },
        { name:"Flexiones", sets:4, reps:"máx", rest:75, muscle:"Pecho" },
        { name:"Remo con mancuerna", sets:4, reps:"10-12", rest:60, muscle:"Espalda" },
        { name:"Press militar mancuernas", sets:3, reps:"10-12", rest:60, muscle:"Hombro" },
        { name:"Plancha", sets:3, reps:"45 s", rest:45, muscle:"Core" },
      ]},
      { name:"Día B", exercises:[
        { name:"Zancadas con barra", sets:4, reps:"12/pierna", rest:75, muscle:"Pierna" },
        { name:"Peso muerto rumano mancuernas", sets:4, reps:"12-15", rest:75, muscle:"Femoral" },
        { name:"Flexiones diamante", sets:3, reps:"máx", rest:60, muscle:"Tríceps" },
        { name:"Elevaciones laterales", sets:3, reps:"15-20", rest:45, muscle:"Hombro" },
        { name:"Elevación de piernas", sets:3, reps:"15", rest:45, muscle:"Core" },
      ]},
      { name:"Día C", exercises:[
        { name:"Sentadilla búlgara", sets:4, reps:"10/pierna", rest:75, muscle:"Pierna" },
        { name:"Remo con mancuerna", sets:4, reps:"10-12", rest:60, muscle:"Espalda" },
        { name:"Flexiones inclinadas", sets:3, reps:"máx", rest:60, muscle:"Pecho" },
        { name:"Curl de bíceps", sets:3, reps:"12-15", rest:45, muscle:"Bíceps" },
        { name:"Plancha lateral", sets:3, reps:"30 s", rest:45, muscle:"Core" },
      ]},
    ]},

  { id:"core_cardio", cat:"Recomposición", name:"Core & Cardio", subtitle:"1 día suelto · quema y abdomen",
    daysPerWeek:1, rpe:"6-8",
    blurb:"Día de remate para intercalar. Fortalece el core y añade gasto calórico. Recuerda: no elimina grasa localizada, pero suma al déficit total.",
    days:[
      { name:"Circuito", exercises:[
        { name:"Calentamiento en cinta o bici", sets:1, reps:"8 min", rest:0, muscle:"Cardio" },
        { name:"Plancha", sets:4, reps:"45 s", rest:40, muscle:"Core" },
        { name:"Mountain climbers", sets:4, reps:"30 s", rest:40, muscle:"Core" },
        { name:"Elevación de piernas en barra", sets:4, reps:"12-15", rest:45, muscle:"Core" },
        { name:"Rueda abdominal", sets:3, reps:"10-12", rest:45, muscle:"Core" },
        { name:"HIIT en bici o cinta", sets:6, reps:"30/30 s", rest:30, muscle:"Cardio" },
      ]},
    ]},

  /* -------- PÉRDIDA DE PESO (objetivo del cuestionario) -------- */
  { id:"wl_m", cat:"Recomposición", sex:"m", name:"Quema · Full Body", subtitle:"3 días · fuerza + cardio para perder grasa",
    daysPerWeek:3, rpe:"7",
    blurb:"Para perder peso: mantén el músculo con trabajo de fuerza de cuerpo completo, reps altas y descansos cortos, y remata con cardio. La grasa baja con el déficit calórico y la constancia; esto acelera el gasto y protege tu masa muscular.",
    days:[
      { name:"Día A", exercises:[
        { name:"Sentadilla goblet", sets:3, reps:"12-15", rest:45, muscle:"Pierna" },
        { name:"Press banca", sets:3, reps:"12-15", rest:60, muscle:"Pecho" },
        { name:"Remo con mancuerna", sets:3, reps:"12-15", rest:60, muscle:"Espalda" },
        { name:"Press militar mancuernas", sets:3, reps:"12-15", rest:45, muscle:"Hombro" },
        { name:"Mountain climbers", sets:4, reps:"30 s", rest:30, muscle:"Core" },
      ]},
      { name:"Día B", exercises:[
        { name:"Prensa de piernas", sets:3, reps:"15-20", rest:60, muscle:"Pierna" },
        { name:"Jalón al pecho", sets:3, reps:"12-15", rest:60, muscle:"Espalda" },
        { name:"Press inclinado mancuernas", sets:3, reps:"12-15", rest:60, muscle:"Pecho" },
        { name:"Elevaciones laterales", sets:3, reps:"15-20", rest:40, muscle:"Hombro" },
        { name:"HIIT en bici o cinta", sets:6, reps:"30/30 s", rest:30, muscle:"Cardio" },
      ]},
      { name:"Día C", exercises:[
        { name:"Peso muerto rumano", sets:3, reps:"12-15", rest:75, muscle:"Femoral" },
        { name:"Remo en máquina", sets:3, reps:"12-15", rest:60, muscle:"Espalda" },
        { name:"Zancadas con barra", sets:3, reps:"12/pierna", rest:60, muscle:"Pierna" },
        { name:"Curl de bíceps", sets:2, reps:"12-15", rest:40, muscle:"Bíceps" },
        { name:"Extensión de tríceps en polea", sets:2, reps:"12-15", rest:40, muscle:"Tríceps" },
        { name:"Plancha", sets:3, reps:"40 s", rest:40, muscle:"Core" },
      ]},
    ]},
  { id:"wl_f", cat:"Recomposición", sex:"f", name:"Quema · Tren Inferior + Cardio", subtitle:"3 días · glúteo/pierna + cardio para perder grasa",
    daysPerWeek:3, rpe:"7",
    blurb:"Para perder peso cuidando el tono: fuerza de cuerpo completo con énfasis en glúteo y pierna, reps altas y descansos cortos, más cardio al final. La grasa baja con el déficit y la constancia; el entreno protege tu músculo y acelera el gasto.",
    days:[
      { name:"Tren inferior", exercises:[
        { name:"Sentadilla goblet", sets:3, reps:"12-15", rest:60, muscle:"Pierna" },
        { name:"Hip thrust", sets:3, reps:"12-15", rest:60, muscle:"Pierna" },
        { name:"Zancada caminando", sets:3, reps:"12/pierna", rest:45, muscle:"Pierna" },
        { name:"Abductores en máquina", sets:3, reps:"15-20", rest:40, muscle:"Pierna" },
        { name:"Mountain climbers", sets:4, reps:"30 s", rest:30, muscle:"Core" },
      ]},
      { name:"Tren superior + core", exercises:[
        { name:"Press inclinado mancuernas", sets:3, reps:"12-15", rest:60, muscle:"Pecho" },
        { name:"Jalón al pecho", sets:3, reps:"12-15", rest:60, muscle:"Espalda" },
        { name:"Press mancuernas sentado", sets:3, reps:"12-15", rest:45, muscle:"Hombro" },
        { name:"Remo con mancuerna", sets:3, reps:"12-15", rest:45, muscle:"Espalda" },
        { name:"Plancha", sets:3, reps:"40 s", rest:40, muscle:"Core" },
      ]},
      { name:"Glúteo + cardio", exercises:[
        { name:"Peso muerto rumano mancuernas", sets:3, reps:"12-15", rest:60, muscle:"Femoral" },
        { name:"Patada de glúteo en polea", sets:3, reps:"15/pierna", rest:40, muscle:"Pierna" },
        { name:"Prensa de piernas", sets:3, reps:"15-20", rest:60, muscle:"Pierna" },
        { name:"Elevación de piernas", sets:3, reps:"15", rest:40, muscle:"Core" },
        { name:"HIIT en bici o cinta", sets:6, reps:"30/30 s", rest:30, muscle:"Cardio" },
      ]},
    ]},

  /* -------- HIPERTROFIA -------- */
  { id:"hyp_ppl", cat:"Hipertrofia", name:"Hipertrofia PPL", subtitle:"3 días · Empuje / Tirón / Pierna",
    daysPerWeek:3, rpe:"8-9",
    blurb:"El clásico anti-aburrimiento. Divide el cuerpo en tres patrones; puedes repetir el ciclo dos veces por semana si quieres 6 días.",
    days:[
      { name:"Empuje", exercises:[
        { name:"Press banca", sets:4, reps:"6-8", rest:120, muscle:"Pecho" },
        { name:"Press militar", sets:3, reps:"8-10", rest:90, muscle:"Hombro" },
        { name:"Press inclinado mancuernas", sets:3, reps:"10-12", rest:75, muscle:"Pecho" },
        { name:"Elevaciones laterales", sets:4, reps:"12-15", rest:45, muscle:"Hombro" },
        { name:"Extensión de tríceps en polea", sets:3, reps:"12-15", rest:45, muscle:"Tríceps" },
      ]},
      { name:"Tirón", exercises:[
        { name:"Peso muerto", sets:3, reps:"5-6", rest:180, muscle:"Espalda" },
        { name:"Dominadas o jalón", sets:4, reps:"8-10", rest:120, muscle:"Espalda" },
        { name:"Remo con barra", sets:3, reps:"10-12", rest:90, muscle:"Espalda" },
        { name:"Face pull", sets:3, reps:"15-20", rest:45, muscle:"Hombro" },
        { name:"Curl de bíceps", sets:3, reps:"12-15", rest:45, muscle:"Bíceps" },
      ]},
      { name:"Pierna", exercises:[
        { name:"Sentadilla", sets:4, reps:"6-8", rest:150, muscle:"Pierna" },
        { name:"Peso muerto rumano", sets:3, reps:"10-12", rest:120, muscle:"Femoral" },
        { name:"Prensa de piernas", sets:3, reps:"12-15", rest:90, muscle:"Pierna" },
        { name:"Elevación de talones de pie", sets:4, reps:"15-20", rest:45, muscle:"Gemelo" },
        { name:"Elevación de piernas", sets:3, reps:"12-15", rest:45, muscle:"Core" },
      ]},
    ]},

  { id:"hyp_ul", cat:"Hipertrofia", name:"Hipertrofia Torso / Pierna", subtitle:"4 días · máximo volumen",
    daysPerWeek:4, rpe:"8-9",
    blurb:"Cuatro días con foco en volumen por grupo muscular. Para cuando ya llevas semanas y quieres crecer.",
    days:[
      { name:"Torso A", exercises:[
        { name:"Press banca", sets:5, reps:"5-8", rest:150, muscle:"Pecho" },
        { name:"Remo con barra", sets:4, reps:"8-10", rest:120, muscle:"Espalda" },
        { name:"Press militar", sets:4, reps:"8-10", rest:90, muscle:"Hombro" },
        { name:"Jalón al pecho", sets:3, reps:"10-12", rest:75, muscle:"Espalda" },
        { name:"Superserie de bíceps y tríceps", sets:3, reps:"12-15", rest:60, muscle:"Brazo" },
      ]},
      { name:"Pierna A", exercises:[
        { name:"Sentadilla", sets:5, reps:"5-8", rest:180, muscle:"Pierna" },
        { name:"Peso muerto rumano", sets:4, reps:"8-10", rest:120, muscle:"Femoral" },
        { name:"Prensa de piernas", sets:4, reps:"12-15", rest:90, muscle:"Pierna" },
        { name:"Elevación de talones de pie", sets:5, reps:"15-20", rest:45, muscle:"Gemelo" },
        { name:"Plancha", sets:3, reps:"60 s", rest:45, muscle:"Core" },
      ]},
      { name:"Torso B", exercises:[
        { name:"Press inclinado con barra", sets:4, reps:"8-10", rest:120, muscle:"Pecho" },
        { name:"Dominadas o jalón", sets:4, reps:"8-10", rest:120, muscle:"Espalda" },
        { name:"Elevaciones laterales", sets:5, reps:"12-15", rest:45, muscle:"Hombro" },
        { name:"Remo con mancuerna", sets:3, reps:"10-12", rest:75, muscle:"Espalda" },
        { name:"Face pull", sets:3, reps:"15-20", rest:45, muscle:"Hombro" },
      ]},
      { name:"Pierna B", exercises:[
        { name:"Peso muerto", sets:4, reps:"4-6", rest:180, muscle:"Espalda" },
        { name:"Zancadas con barra", sets:4, reps:"10-12", rest:90, muscle:"Pierna" },
        { name:"Curl femoral tumbado", sets:4, reps:"12-15", rest:60, muscle:"Femoral" },
        { name:"Extensión de cuádriceps en máquina", sets:3, reps:"12-15", rest:60, muscle:"Pierna" },
        { name:"Rueda abdominal", sets:3, reps:"12", rest:45, muscle:"Core" },
      ]},
    ]},

  { id:"hyp_ppl6", cat:"Hipertrofia", name:"PPL 6 días (avanzado)", subtitle:"6 días · dos ciclos semana",
    daysPerWeek:6, rpe:"8-9",
    blurb:"Para cuando tengas base y tiempo. Dos vueltas al ciclo Empuje/Tirón/Pierna con variantes A y B.",
    days:[
      { name:"Empuje A", exercises:[
        { name:"Press banca", sets:4, reps:"6-8", rest:120, muscle:"Pecho" },
        { name:"Press militar", sets:3, reps:"8-10", rest:90, muscle:"Hombro" },
        { name:"Aperturas con mancuernas", sets:3, reps:"12-15", rest:45, muscle:"Pecho" },
        { name:"Elevaciones laterales", sets:4, reps:"12-15", rest:45, muscle:"Hombro" },
        { name:"Extensión de tríceps en polea", sets:3, reps:"12-15", rest:45, muscle:"Tríceps" },
      ]},
      { name:"Tirón A", exercises:[
        { name:"Dominadas o jalón", sets:4, reps:"6-8", rest:120, muscle:"Espalda" },
        { name:"Remo con barra", sets:4, reps:"8-10", rest:90, muscle:"Espalda" },
        { name:"Face pull", sets:3, reps:"15-20", rest:45, muscle:"Hombro" },
        { name:"Curl de bíceps", sets:4, reps:"10-12", rest:45, muscle:"Bíceps" },
        { name:"Curl martillo", sets:3, reps:"12-15", rest:45, muscle:"Bíceps" },
      ]},
      { name:"Pierna A", exercises:[
        { name:"Sentadilla", sets:4, reps:"6-8", rest:150, muscle:"Pierna" },
        { name:"Prensa de piernas", sets:4, reps:"10-12", rest:90, muscle:"Pierna" },
        { name:"Curl femoral tumbado", sets:3, reps:"12-15", rest:60, muscle:"Femoral" },
        { name:"Elevación de talones de pie", sets:5, reps:"15-20", rest:45, muscle:"Gemelo" },
        { name:"Plancha", sets:3, reps:"60 s", rest:45, muscle:"Core" },
      ]},
      { name:"Empuje B", exercises:[
        { name:"Press inclinado mancuernas", sets:4, reps:"8-10", rest:90, muscle:"Pecho" },
        { name:"Press militar mancuernas", sets:3, reps:"10-12", rest:75, muscle:"Hombro" },
        { name:"Fondos en paralelas", sets:3, reps:"máx", rest:75, muscle:"Pecho" },
        { name:"Elevaciones laterales", sets:4, reps:"15-20", rest:45, muscle:"Hombro" },
        { name:"Press francés", sets:3, reps:"10-12", rest:45, muscle:"Tríceps" },
      ]},
      { name:"Tirón B", exercises:[
        { name:"Peso muerto", sets:3, reps:"5-6", rest:180, muscle:"Espalda" },
        { name:"Remo con mancuerna", sets:4, reps:"10-12", rest:75, muscle:"Espalda" },
        { name:"Jalón agarre cerrado", sets:3, reps:"10-12", rest:60, muscle:"Espalda" },
        { name:"Face pull", sets:3, reps:"15-20", rest:45, muscle:"Hombro" },
        { name:"Curl predicador", sets:3, reps:"12-15", rest:45, muscle:"Bíceps" },
      ]},
      { name:"Pierna B", exercises:[
        { name:"Peso muerto rumano", sets:4, reps:"8-10", rest:120, muscle:"Femoral" },
        { name:"Sentadilla búlgara", sets:3, reps:"10/pierna", rest:90, muscle:"Pierna" },
        { name:"Extensión de cuádriceps en máquina", sets:4, reps:"12-15", rest:60, muscle:"Pierna" },
        { name:"Elevación de talones de pie", sets:5, reps:"15-20", rest:45, muscle:"Gemelo" },
        { name:"Rueda abdominal", sets:3, reps:"12", rest:45, muscle:"Core" },
      ]},
    ]},

  { id:"fuerza_5x5", cat:"Fuerza", name:"Fuerza 5×5", subtitle:"3 días · A/B · básicos pesados",
    daysPerWeek:3, rpe:"8",
    blurb:"Pocos ejercicios, mucho peso. Progresa 2,5 kg cada sesión que completes las 5×5. Alterna A y B.",
    days:[
      { name:"Día A", exercises:[
        { name:"Sentadilla", sets:5, reps:"5", rest:180, muscle:"Pierna" },
        { name:"Press banca", sets:5, reps:"5", rest:180, muscle:"Pecho" },
        { name:"Remo con barra", sets:5, reps:"5", rest:150, muscle:"Espalda" },
        { name:"Plancha", sets:3, reps:"45 s", rest:45, muscle:"Core" },
      ]},
      { name:"Día B", exercises:[
        { name:"Sentadilla", sets:5, reps:"5", rest:180, muscle:"Pierna" },
        { name:"Press militar", sets:5, reps:"5", rest:180, muscle:"Hombro" },
        { name:"Peso muerto", sets:1, reps:"5", rest:0, muscle:"Espalda" },
        { name:"Elevación de piernas", sets:3, reps:"12-15", rest:45, muscle:"Core" },
      ]},
    ]},

  /* -------- AVANZADO (se desbloquean subiendo de nivel) -------- */
  { id:"int_ul", cat:"Avanzado", name:"Torso / Pierna Ondulante", subtitle:"4 días · fuerza + hipertrofia alternadas", minLevel:12,
    daysPerWeek:4, rpe:"7-9",
    blurb:"Periodización ondulante: días pesados (5-6 reps) y días de volumen (10-15). Empieza el bloque con estas series y añade 1-2 por semana; descarga una semana cada 5-6 semanas.",
    days:[
      { name:"Torso Fuerza", exercises:[
        { name:"Press banca", sets:4, reps:"5-6", rest:150, muscle:"Pecho" },
        { name:"Remo con barra", sets:4, reps:"6-8", rest:120, muscle:"Espalda" },
        { name:"Press militar", sets:3, reps:"6-8", rest:120, muscle:"Hombro" },
        { name:"Jalón agarre neutro", sets:3, reps:"8-10", rest:90, muscle:"Espalda" },
        { name:"Curl con barra", sets:3, reps:"8-10", rest:60, muscle:"Bíceps" },
      ]},
      { name:"Pierna Fuerza", exercises:[
        { name:"Sentadilla", sets:4, reps:"5-6", rest:180, muscle:"Pierna" },
        { name:"Peso muerto", sets:3, reps:"4-6", rest:180, muscle:"Espalda" },
        { name:"Prensa de piernas", sets:3, reps:"8-10", rest:120, muscle:"Pierna" },
        { name:"Curl femoral tumbado", sets:3, reps:"10-12", rest:75, muscle:"Femoral" },
        { name:"Elevación de talones de pie", sets:4, reps:"10-12", rest:60, muscle:"Gemelo" },
      ]},
      { name:"Torso Volumen", exercises:[
        { name:"Press inclinado mancuernas", sets:4, reps:"10-12", rest:90, muscle:"Pecho" },
        { name:"Remo en máquina", sets:4, reps:"12-15", rest:75, muscle:"Espalda" },
        { name:"Aperturas en polea", sets:3, reps:"12-15", rest:60, muscle:"Pecho" },
        { name:"Elevaciones laterales", sets:5, reps:"12-20", rest:45, muscle:"Hombro" },
        { name:"Extensión de tríceps en polea", sets:4, reps:"12-15", rest:45, muscle:"Tríceps" },
      ]},
      { name:"Pierna Volumen", exercises:[
        { name:"Sentadilla búlgara", sets:3, reps:"10/pierna", rest:90, muscle:"Pierna" },
        { name:"Peso muerto rumano", sets:4, reps:"10-12", rest:90, muscle:"Femoral" },
        { name:"Extensión de cuádriceps en máquina", sets:4, reps:"12-15", rest:60, muscle:"Pierna" },
        { name:"Curl femoral sentado", sets:3, reps:"12-15", rest:60, muscle:"Femoral" },
        { name:"Rueda abdominal", sets:4, reps:"10-12", rest:45, muscle:"Core" },
      ]},
    ]},

  { id:"fuerza_bloque", cat:"Avanzado", name:"Bloque de Fuerza", subtitle:"4 días · básicos pesados + accesorios", minLevel:18,
    daysPerWeek:4, rpe:"8",
    blurb:"Foco en fuerza: pocas repeticiones y descansos largos en el básico, con accesorios que suman sin vaciarte. Sube el peso del básico cada 1-2 semanas y descarga en la 5ª-6ª.",
    days:[
      { name:"Sentadilla", exercises:[
        { name:"Sentadilla", sets:5, reps:"3-5", rest:210, muscle:"Pierna" },
        { name:"Prensa de piernas", sets:3, reps:"8-10", rest:120, muscle:"Pierna" },
        { name:"Zancadas con mancuernas", sets:3, reps:"10/pierna", rest:90, muscle:"Pierna" },
        { name:"Plancha con lastre", sets:3, reps:"45 s", rest:60, muscle:"Core" },
      ]},
      { name:"Banca", exercises:[
        { name:"Press banca", sets:5, reps:"3-5", rest:210, muscle:"Pecho" },
        { name:"Press inclinado mancuernas", sets:3, reps:"8-10", rest:120, muscle:"Pecho" },
        { name:"Fondos en paralelas lastrados", sets:3, reps:"8-10", rest:90, muscle:"Pecho" },
        { name:"Extensión de tríceps en polea", sets:3, reps:"12-15", rest:60, muscle:"Tríceps" },
      ]},
      { name:"Peso muerto", exercises:[
        { name:"Peso muerto", sets:5, reps:"3-5", rest:240, muscle:"Espalda" },
        { name:"Remo con barra", sets:4, reps:"6-8", rest:120, muscle:"Espalda" },
        { name:"Jalón al pecho", sets:3, reps:"10-12", rest:75, muscle:"Espalda" },
        { name:"Curl con barra", sets:3, reps:"10-12", rest:60, muscle:"Bíceps" },
      ]},
      { name:"Press militar", exercises:[
        { name:"Press militar", sets:5, reps:"3-5", rest:180, muscle:"Hombro" },
        { name:"Press mancuernas sentado", sets:3, reps:"8-10", rest:90, muscle:"Hombro" },
        { name:"Elevaciones laterales", sets:4, reps:"12-20", rest:45, muscle:"Hombro" },
        { name:"Face pull", sets:4, reps:"15-20", rest:45, muscle:"Hombro" },
      ]},
    ]},

  /* -------- ÉLITE -------- */
  { id:"ppl_intens", cat:"Élite", name:"PPL Intensidad", subtitle:"6 días · técnicas avanzadas", minLevel:28,
    daysPerWeek:6, rpe:"9",
    blurb:"Alta frecuencia con técnicas de intensidad (dropset, rest-pause) en la última serie de los aislamientos. Solo si tu recuperación lo aguanta: si el rendimiento cae 2 sesiones seguidas, descarga ya.",
    days:[
      { name:"Empuje A", exercises:[
        { name:"Press banca", sets:4, reps:"6-8", rest:120, muscle:"Pecho" },
        { name:"Press militar", sets:4, reps:"8-10", rest:90, muscle:"Hombro" },
        { name:"Press inclinado mancuernas", sets:3, reps:"10-12", rest:75, muscle:"Pecho" },
        { name:"Aperturas en polea", sets:3, reps:"12-15", rest:60, muscle:"Pecho", note:"última serie: dropset" },
        { name:"Elevaciones laterales", sets:4, reps:"15-20", rest:45, muscle:"Hombro", note:"última serie: rest-pause" },
        { name:"Extensión de tríceps en polea", sets:4, reps:"12-15", rest:45, muscle:"Tríceps" },
      ]},
      { name:"Tirón A", exercises:[
        { name:"Dominadas lastradas", sets:4, reps:"6-8", rest:120, muscle:"Espalda" },
        { name:"Remo con barra", sets:4, reps:"8-10", rest:90, muscle:"Espalda" },
        { name:"Remo en máquina", sets:3, reps:"12-15", rest:60, muscle:"Espalda" },
        { name:"Face pull", sets:4, reps:"15-20", rest:45, muscle:"Hombro" },
        { name:"Curl con barra", sets:4, reps:"8-12", rest:45, muscle:"Bíceps", note:"última serie: dropset" },
        { name:"Curl martillo", sets:3, reps:"12-15", rest:45, muscle:"Bíceps" },
      ]},
      { name:"Pierna A", exercises:[
        { name:"Sentadilla", sets:4, reps:"6-8", rest:180, muscle:"Pierna" },
        { name:"Peso muerto rumano", sets:4, reps:"8-10", rest:120, muscle:"Femoral" },
        { name:"Prensa de piernas", sets:4, reps:"12-15", rest:90, muscle:"Pierna", note:"última serie: rest-pause" },
        { name:"Curl femoral sentado", sets:3, reps:"12-15", rest:60, muscle:"Femoral" },
        { name:"Elevación de talones de pie", sets:5, reps:"12-20", rest:45, muscle:"Gemelo" },
        { name:"Rueda abdominal", sets:3, reps:"12", rest:45, muscle:"Core" },
      ]},
      { name:"Empuje B", exercises:[
        { name:"Press inclinado con barra", sets:4, reps:"8-10", rest:120, muscle:"Pecho" },
        { name:"Press mancuernas sentado", sets:3, reps:"10-12", rest:90, muscle:"Hombro" },
        { name:"Fondos en paralelas lastrados", sets:3, reps:"8-12", rest:90, muscle:"Pecho" },
        { name:"Elevaciones laterales en polea", sets:4, reps:"15-20", rest:45, muscle:"Hombro", note:"última serie: dropset" },
        { name:"Press francés", sets:4, reps:"10-12", rest:45, muscle:"Tríceps" },
      ]},
      { name:"Tirón B", exercises:[
        { name:"Peso muerto", sets:3, reps:"4-6", rest:210, muscle:"Espalda" },
        { name:"Remo con mancuerna", sets:4, reps:"10-12", rest:75, muscle:"Espalda" },
        { name:"Jalón agarre cerrado", sets:3, reps:"10-12", rest:60, muscle:"Espalda" },
        { name:"Face pull", sets:4, reps:"15-20", rest:45, muscle:"Hombro" },
        { name:"Curl predicador", sets:3, reps:"12-15", rest:45, muscle:"Bíceps", note:"última serie: myo-reps" },
      ]},
      { name:"Pierna B", exercises:[
        { name:"Sentadilla frontal", sets:4, reps:"8-10", rest:150, muscle:"Pierna" },
        { name:"Peso muerto rumano", sets:4, reps:"10-12", rest:90, muscle:"Femoral" },
        { name:"Extensión de cuádriceps en máquina", sets:4, reps:"12-15", rest:60, muscle:"Pierna", note:"última serie: dropset" },
        { name:"Sentadilla búlgara", sets:3, reps:"10/pierna", rest:75, muscle:"Pierna" },
        { name:"Elevación de talones de pie", sets:5, reps:"12-20", rest:45, muscle:"Gemelo" },
      ]},
    ]},

  { id:"spec_torso", cat:"Élite", name:"Especialización Torso", subtitle:"5 días · prioriza pecho/espalda/hombro", minLevel:35,
    daysPerWeek:5, rpe:"8-9",
    blurb:"Bloque de especialización: llevas el torso a volumen alto mientras la pierna solo se mantiene. Úsalo 4-6 semanas para forzar un punto débil y luego rota la prioridad.",
    days:[
      { name:"Pecho énfasis", exercises:[
        { name:"Press banca", sets:5, reps:"6-8", rest:150, muscle:"Pecho" },
        { name:"Press inclinado mancuernas", sets:4, reps:"8-12", rest:90, muscle:"Pecho" },
        { name:"Aperturas en polea", sets:4, reps:"12-15", rest:60, muscle:"Pecho" },
        { name:"Fondos en paralelas", sets:3, reps:"máx", rest:75, muscle:"Pecho" },
        { name:"Extensión de tríceps en polea", sets:3, reps:"12-15", rest:45, muscle:"Tríceps" },
      ]},
      { name:"Espalda énfasis", exercises:[
        { name:"Dominadas lastradas", sets:5, reps:"6-10", rest:120, muscle:"Espalda" },
        { name:"Remo con barra", sets:4, reps:"8-10", rest:90, muscle:"Espalda" },
        { name:"Remo en máquina", sets:4, reps:"12-15", rest:60, muscle:"Espalda" },
        { name:"Pullover en polea", sets:3, reps:"12-15", rest:60, muscle:"Espalda" },
        { name:"Curl con barra", sets:3, reps:"10-12", rest:45, muscle:"Bíceps" },
      ]},
      { name:"Hombro énfasis", exercises:[
        { name:"Press militar", sets:5, reps:"6-8", rest:120, muscle:"Hombro" },
        { name:"Press mancuernas sentado", sets:4, reps:"10-12", rest:75, muscle:"Hombro" },
        { name:"Elevaciones laterales", sets:5, reps:"15-20", rest:45, muscle:"Hombro" },
        { name:"Face pull", sets:4, reps:"15-20", rest:45, muscle:"Hombro" },
        { name:"Pájaros en polea", sets:3, reps:"15-20", rest:45, muscle:"Hombro" },
      ]},
      { name:"Pierna (mantenimiento)", exercises:[
        { name:"Sentadilla", sets:3, reps:"6-8", rest:150, muscle:"Pierna" },
        { name:"Peso muerto rumano", sets:3, reps:"10-12", rest:90, muscle:"Femoral" },
        { name:"Elevación de talones de pie", sets:3, reps:"12-20", rest:45, muscle:"Gemelo" },
        { name:"Plancha", sets:3, reps:"60 s", rest:45, muscle:"Core" },
      ]},
      { name:"Torso extra", exercises:[
        { name:"Press inclinado con barra", sets:4, reps:"8-10", rest:90, muscle:"Pecho" },
        { name:"Remo con mancuerna", sets:4, reps:"10-12", rest:75, muscle:"Espalda" },
        { name:"Elevaciones laterales en polea", sets:4, reps:"15-20", rest:45, muscle:"Hombro" },
        { name:"Curl martillo", sets:3, reps:"12-15", rest:45, muscle:"Bíceps" },
        { name:"Extensión de tríceps en polea", sets:3, reps:"12-15", rest:45, muscle:"Tríceps" },
      ]},
    ]},

  /* -------- MUJER (aparecen solo con perfil femenino) -------- */
  { id:"f_fullbody", cat:"Acondicionamiento", sex:"f", name:"Full Body Mujer (inicio)", subtitle:"3 días · RPE 6 · empieza aquí",
    daysPerWeek:3, rpe:"6-7",
    blurb:"Un inicio suave con énfasis en glúteo y pierna: pocas series, reps altas y peso cómodo para coger técnica y crear el hábito. Sube una serie cada 1-2 semanas.",
    days:[
      { name:"Día A", exercises:[
        { name:"Sentadilla goblet", sets:3, reps:"12-15", rest:75, muscle:"Pierna" },
        { name:"Puente de glúteo", sets:2, reps:"12-15", rest:60, muscle:"Pierna" },
        { name:"Press mancuernas sentado", sets:2, reps:"12-15", rest:60, muscle:"Hombro" },
        { name:"Remo con mancuerna", sets:2, reps:"12-15", rest:60, muscle:"Espalda" },
        { name:"Plancha", sets:2, reps:"20 s", rest:45, muscle:"Core" },
      ]},
      { name:"Día B", exercises:[
        { name:"Peso muerto rumano mancuernas", sets:3, reps:"12-15", rest:75, muscle:"Femoral" },
        { name:"Hip thrust", sets:2, reps:"12-15", rest:75, muscle:"Pierna" },
        { name:"Jalón al pecho", sets:2, reps:"12-15", rest:60, muscle:"Espalda" },
        { name:"Elevaciones laterales", sets:2, reps:"12-15", rest:45, muscle:"Hombro" },
        { name:"Elevación de piernas", sets:2, reps:"12-15", rest:45, muscle:"Core" },
      ]},
      { name:"Día C", exercises:[
        { name:"Sentadilla sumo con mancuerna", sets:3, reps:"12-15", rest:75, muscle:"Pierna" },
        { name:"Patada de glúteo en polea", sets:2, reps:"12/pierna", rest:45, muscle:"Pierna" },
        { name:"Aperturas con mancuernas", sets:2, reps:"12-15", rest:45, muscle:"Pecho" },
        { name:"Curl de bíceps", sets:2, reps:"12-15", rest:45, muscle:"Bíceps" },
        { name:"Plancha", sets:2, reps:"20 s", rest:45, muscle:"Core" },
      ]},
    ]},
  { id:"f_glute", cat:"Recomposición", sex:"f", name:"Glúteo y Pierna", subtitle:"4 días · foco tren inferior",
    daysPerWeek:4, rpe:"7-8",
    blurb:"Prioriza glúteo y pierna con volumen suficiente para recomponer, más un día de torso para equilibrar.",
    days:[
      { name:"Glúteo A", exercises:[
        { name:"Hip thrust", sets:4, reps:"8-12", rest:120, muscle:"Pierna" },
        { name:"Peso muerto sumo", sets:3, reps:"8-10", rest:120, muscle:"Pierna" },
        { name:"Prensa de piernas", sets:3, reps:"12-15", rest:90, muscle:"Pierna" },
        { name:"Abductores en máquina", sets:4, reps:"15-20", rest:45, muscle:"Pierna" },
        { name:"Curl femoral tumbado", sets:3, reps:"12-15", rest:60, muscle:"Femoral" },
      ]},
      { name:"Torso", exercises:[
        { name:"Press inclinado mancuernas", sets:3, reps:"10-12", rest:75, muscle:"Pecho" },
        { name:"Remo en máquina", sets:4, reps:"10-12", rest:75, muscle:"Espalda" },
        { name:"Press militar mancuernas", sets:3, reps:"10-12", rest:60, muscle:"Hombro" },
        { name:"Jalón al pecho", sets:3, reps:"10-12", rest:60, muscle:"Espalda" },
        { name:"Curl con barra", sets:3, reps:"12", rest:45, muscle:"Bíceps" },
      ]},
      { name:"Glúteo B", exercises:[
        { name:"Sentadilla", sets:4, reps:"8-10", rest:120, muscle:"Pierna" },
        { name:"Zancada caminando", sets:3, reps:"12/pierna", rest:75, muscle:"Pierna" },
        { name:"Patada de glúteo en polea", sets:3, reps:"15/pierna", rest:45, muscle:"Pierna" },
        { name:"Curl femoral sentado", sets:3, reps:"12-15", rest:60, muscle:"Femoral" },
        { name:"Abductores en máquina", sets:4, reps:"15-20", rest:45, muscle:"Pierna" },
      ]},
      { name:"Full / core", exercises:[
        { name:"Peso muerto rumano", sets:3, reps:"10-12", rest:90, muscle:"Femoral" },
        { name:"Elevación de talones de pie", sets:4, reps:"15-20", rest:45, muscle:"Gemelo" },
        { name:"Rueda abdominal", sets:3, reps:"10-12", rest:45, muscle:"Core" },
        { name:"Elevación de piernas en barra", sets:3, reps:"12", rest:45, muscle:"Core" },
      ]},
    ]},
  { id:"f_ul", cat:"Hipertrofia", sex:"f", name:"Torso / Pierna Mujer", subtitle:"4 días · glúteo + volumen",
    daysPerWeek:4, rpe:"8-9",
    blurb:"Cuatro días con énfasis en tren inferior y trabajo de torso para un físico equilibrado.",
    days:[
      { name:"Pierna A", exercises:[
        { name:"Hip thrust", sets:4, reps:"8-12", rest:120, muscle:"Pierna" },
        { name:"Sentadilla", sets:4, reps:"8-10", rest:150, muscle:"Pierna" },
        { name:"Peso muerto rumano", sets:3, reps:"10-12", rest:90, muscle:"Femoral" },
        { name:"Abductores en máquina", sets:4, reps:"15-20", rest:45, muscle:"Pierna" },
        { name:"Elevación de talones de pie", sets:4, reps:"15-20", rest:45, muscle:"Gemelo" },
      ]},
      { name:"Torso A", exercises:[
        { name:"Press inclinado mancuernas", sets:4, reps:"10-12", rest:90, muscle:"Pecho" },
        { name:"Remo con mancuerna", sets:4, reps:"10-12", rest:75, muscle:"Espalda" },
        { name:"Elevaciones laterales", sets:4, reps:"12-15", rest:45, muscle:"Hombro" },
        { name:"Jalón al pecho", sets:3, reps:"10-12", rest:75, muscle:"Espalda" },
        { name:"Extensión de tríceps en polea", sets:3, reps:"12-15", rest:45, muscle:"Tríceps" },
      ]},
      { name:"Pierna B", exercises:[
        { name:"Peso muerto sumo", sets:4, reps:"6-8", rest:150, muscle:"Pierna" },
        { name:"Prensa de piernas", sets:4, reps:"12-15", rest:90, muscle:"Pierna" },
        { name:"Patada de glúteo en polea", sets:3, reps:"15/pierna", rest:45, muscle:"Pierna" },
        { name:"Curl femoral tumbado", sets:3, reps:"12-15", rest:60, muscle:"Femoral" },
        { name:"Puente de glúteo", sets:3, reps:"15", rest:45, muscle:"Pierna" },
      ]},
      { name:"Torso B", exercises:[
        { name:"Press mancuernas sentado", sets:4, reps:"10-12", rest:90, muscle:"Hombro" },
        { name:"Remo en máquina", sets:4, reps:"12-15", rest:75, muscle:"Espalda" },
        { name:"Aperturas en polea", sets:3, reps:"12-15", rest:60, muscle:"Pecho" },
        { name:"Curl de bíceps", sets:3, reps:"12-15", rest:45, muscle:"Bíceps" },
        { name:"Plancha", sets:3, reps:"45 s", rest:45, muscle:"Core" },
      ]},
    ]},

  /* -------- HIPERTROFIA CON MANCUERNAS -------- */
  { id:"hyp_db", cat:"Hipertrofia", name:"Hipertrofia con Mancuernas", subtitle:"3 días · full body con mancuernas",
    daysPerWeek:3, rpe:"8-9",
    blurb:"Hipertrofia de cuerpo completo basada en mancuernas y máquinas: perfecta si el rack de barra está ocupado o prefieres mancuernas. Rango medio de reps y buena conexión con el músculo.",
    days:[
      { name:"Día A", exercises:[
        { name:"Press banca mancuernas", sets:4, reps:"8-12", rest:90, muscle:"Pecho" },
        { name:"Sentadilla hack", sets:4, reps:"10-12", rest:90, muscle:"Pierna" },
        { name:"Press Arnold", sets:3, reps:"10-12", rest:75, muscle:"Hombro" },
        { name:"Extensión de tríceps sobre cabeza", sets:3, reps:"10-12", rest:60, muscle:"Tríceps" },
        { name:"Elevaciones laterales", sets:3, reps:"12-15", rest:45, muscle:"Hombro" },
      ]},
      { name:"Día B", exercises:[
        { name:"Remo en T", sets:4, reps:"8-12", rest:90, muscle:"Espalda" },
        { name:"Dominada supina", sets:3, reps:"máx", rest:90, muscle:"Espalda" },
        { name:"Peso muerto piernas rígidas", sets:3, reps:"10-12", rest:90, muscle:"Femoral" },
        { name:"Curl inclinado", sets:3, reps:"10-12", rest:60, muscle:"Bíceps" },
        { name:"Curl concentrado", sets:3, reps:"12", rest:45, muscle:"Bíceps" },
      ]},
      { name:"Día C", exercises:[
        { name:"Sentadilla hack", sets:4, reps:"10-12", rest:90, muscle:"Pierna" },
        { name:"Press banca mancuernas", sets:3, reps:"10-12", rest:75, muscle:"Pecho" },
        { name:"Remo al mentón", sets:3, reps:"12-15", rest:60, muscle:"Hombro" },
        { name:"Encogimientos", sets:3, reps:"12-15", rest:45, muscle:"Hombro" },
        { name:"Elevación de talones sentado", sets:4, reps:"15-20", rest:45, muscle:"Gemelo" },
        { name:"Russian twist", sets:3, reps:"20", rest:45, muscle:"Core" },
      ]},
    ]},

  /* -------- FUERZA TORSO/PIERNA -------- */
  { id:"fuerza_ul", cat:"Fuerza", name:"Fuerza Torso / Pierna", subtitle:"4 días · básicos pesados", minLevel:15,
    daysPerWeek:4, rpe:"8",
    blurb:"Fuerza en los grandes básicos repartida en torso y pierna. Reps bajas, descansos largos y progresión de carga. Calienta bien antes de las series pesadas.",
    days:[
      { name:"Torso A", exercises:[
        { name:"Press banca", sets:4, reps:"5", rest:150, muscle:"Pecho" },
        { name:"Remo con barra", sets:4, reps:"5-6", rest:120, muscle:"Espalda" },
        { name:"Press militar", sets:3, reps:"5", rest:120, muscle:"Hombro" },
        { name:"Dominada supina", sets:3, reps:"6-8", rest:90, muscle:"Espalda" },
      ]},
      { name:"Pierna A", exercises:[
        { name:"Sentadilla", sets:4, reps:"5", rest:180, muscle:"Pierna" },
        { name:"Peso muerto piernas rígidas", sets:3, reps:"6-8", rest:120, muscle:"Femoral" },
        { name:"Sentadilla hack", sets:3, reps:"8-10", rest:90, muscle:"Pierna" },
        { name:"Elevación de talones sentado", sets:4, reps:"10-15", rest:45, muscle:"Gemelo" },
      ]},
      { name:"Torso B", exercises:[
        { name:"Peso muerto", sets:3, reps:"5", rest:180, muscle:"Espalda" },
        { name:"Press inclinado con barra", sets:4, reps:"6", rest:120, muscle:"Pecho" },
        { name:"Remo en T", sets:3, reps:"8-10", rest:90, muscle:"Espalda" },
        { name:"Press Arnold", sets:3, reps:"8-10", rest:75, muscle:"Hombro" },
      ]},
      { name:"Pierna B", exercises:[
        { name:"Sentadilla frontal", sets:4, reps:"6", rest:150, muscle:"Pierna" },
        { name:"Prensa de piernas", sets:3, reps:"10-12", rest:90, muscle:"Pierna" },
        { name:"Curl femoral tumbado", sets:3, reps:"10-12", rest:60, muscle:"Femoral" },
        { name:"Elevación de talones de pie", sets:4, reps:"12-20", rest:45, muscle:"Gemelo" },
      ]},
    ]},

  /* -------- CORE Y ABDOMEN -------- */
  { id:"core_abs", cat:"Casa / Express", name:"Core y Abdomen", subtitle:"1 día suelto · abdomen y estabilidad",
    daysPerWeek:1, rpe:"6-7",
    blurb:"Día corto para reforzar el core y el abdomen. Intercálalo cuando quieras: un core fuerte protege la espalda y mejora todos tus levantamientos. Sin material.",
    days:[
      { name:"Circuito core", exercises:[
        { name:"Plancha", sets:3, reps:"45 s", rest:45, muscle:"Core" },
        { name:"Crunch abdominal", sets:3, reps:"15-20", rest:40, muscle:"Core" },
        { name:"Bicicleta abdominal", sets:3, reps:"20", rest:40, muscle:"Core" },
        { name:"Russian twist", sets:3, reps:"20", rest:40, muscle:"Core" },
        { name:"Elevación de piernas", sets:3, reps:"12-15", rest:45, muscle:"Core" },
        { name:"Mountain climbers", sets:3, reps:"30 s", rest:30, muscle:"Core" },
      ]},
    ]},

  /* -------- CASA CON MATERIAL --------
     Lo que hay en casa del grupo: kettlebell de 6 kg, mancuernas de 5 kg, goma con asas,
     goma en 8, tensor de pedal, agarres de flexiones, rueda abdominal y tonificador de
     muslos. Las gomas no llevan kilos (van en BODYWEIGHT_EX): se progresa en repeticiones
     o acortando la goma. */
  { id:"casa_material", cat:"Casa / Express", name:"Casa con material", subtitle:"3 días · kettlebell, gomas y mancuernas",
    daysPerWeek:3, rpe:"7-8",
    blurb:"Para entrenar en casa con poco material: una kettlebell, mancuernas ligeras, gomas con asas o en 8, agarres de flexiones, la rueda abdominal y el tonificador. Si te falta algo, cámbialo con el botón «Cambiar» del entreno.",
    days:[
      { name:"Día A", exercises:[
        { name:"Sentadilla goblet", sets:3, reps:"12-15", rest:60, muscle:"Pierna" },
        { name:"Flexiones con agarres", sets:3, reps:"máx", rest:60, muscle:"Pecho" },
        { name:"Remo sentado con goma", sets:3, reps:"12-15", rest:60, muscle:"Espalda" },
        { name:"Press de hombro con goma", sets:3, reps:"12-15", rest:60, muscle:"Hombro" },
        { name:"Curl de bíceps con goma", sets:3, reps:"12-15", rest:45, muscle:"Bíceps" },
        { name:"Rueda abdominal", sets:3, reps:"8-10", rest:45, muscle:"Core" },
      ]},
      { name:"Día B", exercises:[
        { name:"Swing con kettlebell", sets:4, reps:"15", rest:60, muscle:"Femoral" },
        { name:"Press de suelo con kettlebell", sets:3, reps:"10-12", rest:60, muscle:"Pecho" },
        { name:"Remo con kettlebell", sets:3, reps:"10-12", rest:60, muscle:"Espalda" },
        { name:"Aperturas inversas con goma", sets:3, reps:"15-20", rest:45, muscle:"Hombro" },
        { name:"Extensión de tríceps con goma", sets:3, reps:"12-15", rest:45, muscle:"Tríceps" },
        { name:"Plancha", sets:3, reps:"40 s", rest:40, muscle:"Core" },
      ]},
      { name:"Día C", exercises:[
        { name:"Zancadas con mancuernas", sets:3, reps:"10/pierna", rest:75, muscle:"Pierna" },
        { name:"Peso muerto a una pierna con kettlebell", sets:3, reps:"10/pierna", rest:60, muscle:"Femoral" },
        { name:"Aductores con tonificador", sets:3, reps:"15-20", rest:45, muscle:"Pierna" },
        { name:"Aperturas de pie con goma", sets:3, reps:"12-15", rest:45, muscle:"Pecho" },
        { name:"Elevaciones laterales", sets:3, reps:"10-12", rest:45, muscle:"Hombro" },
        { name:"Crunch abdominal", sets:3, reps:"15", rest:40, muscle:"Core" },
      ]},
    ]},

  /* -------- EXPRESS -------- */
  { id:"express", cat:"Casa / Express", name:"Express 30 min", subtitle:"1 día · para días sin ganas",
    daysPerWeek:1, rpe:"7",
    blurb:"Cuando el cuerpo pide poco: una sesión corta de cuerpo entero. Mejor esto que faltar. La constancia gana siempre.",
    days:[
      { name:"Full body exprés", exercises:[
        { name:"Sentadilla goblet", sets:3, reps:"12", rest:45, muscle:"Pierna" },
        { name:"Press banca", sets:3, reps:"12", rest:45, muscle:"Pecho" },
        { name:"Remo con mancuerna", sets:3, reps:"12", rest:45, muscle:"Espalda" },
        { name:"Press militar mancuernas", sets:3, reps:"12", rest:45, muscle:"Hombro" },
        { name:"Plancha", sets:3, reps:"40 s", rest:30, muscle:"Core" },
      ]},
    ]},
];

const ROUTINE_CATS = ["Acondicionamiento", "Recomposición", "Hipertrofia", "Fuerza", "Avanzado", "Élite", "Casa / Express"];

/* Nivel de experiencia declarado → categorías de rutina accesibles (self-assessment del onboarding). */
const EXPERIENCE_LEVELS = [
  { id:"principiante", label:"Principiante", desc:"Poca o ninguna experiencia. Aprende la técnica sin machacarte.",
    cats:["Acondicionamiento","Casa / Express","Recomposición"] },
  { id:"intermedio", label:"Intermedio", desc:"Entrenas con cierta constancia y dominas los básicos.",
    cats:["Acondicionamiento","Casa / Express","Recomposición","Hipertrofia","Fuerza"] },
  { id:"experto", label:"Experto", desc:"Años de experiencia; buscas volumen y técnicas avanzadas.",
    cats:null /* todas */ },
];
function expAllows(experience, cat){ const e=EXPERIENCE_LEVELS.find(x=>x.id===experience)||EXPERIENCE_LEVELS[0]; return !e.cats || e.cats.includes(cat); }

/* Objetivo del cuestionario → rutina inicial sugerida. */
const GOALS = [
  { id:"iniciarse", label:"Iniciarme en el gimnasio", desc:"Aprender la técnica y crear el hábito.", icon:Sunrise },
  { id:"perdida", label:"Perder peso", desc:"Bajar grasa con entrenamiento y constancia, cuidando el músculo.", icon:Flame },
  { id:"recomposicion", label:"Recomposición corporal", desc:"Perder grasa y ganar músculo a la vez.", icon:Target },
  { id:"hipertrofia", label:"Ganar músculo", desc:"Maximizar el crecimiento muscular.", icon:Dumbbell },
  { id:"gamificar", label:"Gamificar mi entreno", desc:"Convertir el gimnasio en un juego con niveles y logros.", icon:Trophy },
];

/* Rutina activa inicial según objetivo, experiencia y sexo (respetando lo accesible). */
function pickInitialRoutine({ goal, experience, sex }){
  const female = sex==="mujer";
  if(goal==="perdida") return female ? "wl_f" : "wl_m";   // pérdida de peso (accesible a todos los niveles)
  if(female){
    if(experience==="principiante") return "f_fullbody";
    return goal==="hipertrofia" ? "f_ul" : "f_glute";
  }
  if(experience==="principiante") return "acli_fb";
  const byGoal = { iniciarse:"acli_fb", recomposicion:"recomp_fb", hipertrofia:"hyp_ppl", gamificar:"recomp_fb" };
  let r = byGoal[goal] || "recomp_fb";
  const rt = ROUTINES.find(x=>x.id===r);
  if(rt && !expAllows(experience, rt.cat)) r = "recomp_fb";
  return r;
}

/* =========================================================================
   RENOMBRES DE EJERCICIOS
   Algunos nombres eran traducción literal del inglés o dos ejercicios mezclados
   con una barra. Al corregirlos hay que ARRASTRAR los datos ya guardados: las
   marcas, la progresión y el historial se indexan POR NOMBRE, así que sin esto
   un usuario perdería sus récords al actualizar.
   Si vuelves a renombrar un ejercicio, añádelo aquí. No borres entradas viejas.
   ========================================================================= */
const RENOMBRES = {
  /* "Pájaros" es el nombre bueno del ejercicio en castellano y se queda. Lo que
     despistaba era que ninguna máquina se llama así: la máquina es la
     CONTRACTORA, usada del revés. Ahora el nombre lleva a la máquina. */
  "Pájaros en máquina": "Pájaros en contractora",
  "Contractor de pecho": "Contractora de pecho",
  "Elevación de gemelos": "Elevación de talones de pie",
  "Elevación de gemelos sentado": "Elevación de talones sentado",
  "Elevación de gemelos en prensa": "Gemelo en prensa",
  "Elevación de gemelos con mancuerna": "Elevación de talones con mancuerna",
  "Elevación de gemelos en multipower": "Elevación de talones en multipower",
  "Elevación de puntas en multipower": "Elevación de puntas (tibial)",
  "Dominadas / jalón": "Dominadas o jalón",
  "Press banca / flexiones": "Press banca o flexiones",
  "Remo invertido / mancuerna": "Remo invertido o con mancuerna",
  "Rueda / plancha lateral": "Plancha lateral",
  "HIIT bici/cinta": "HIIT en bici o cinta",
  "Cinta / bici (calentar)": "Calentamiento en cinta o bici",
  "Curl + tríceps (superserie)": "Superserie de bíceps y tríceps",
  "Sentadilla en máquina de silla": "Sentadilla en máquina",
  "Elevación de piernas colgado": "Elevación de piernas en barra",
  "Extensión de cuádriceps": "Extensión de cuádriceps en máquina",
  "Extensión de cuádriceps a una pierna": "Extensión de cuádriceps a una pierna en máquina",
  "Curl femoral": "Curl femoral en máquina",
  "Aperturas": "Aperturas con mancuernas",
  "Fondos": "Fondos en paralelas",
  "Fondos lastrados": "Fondos en paralelas lastrados",
  "Zancadas": "Zancadas con barra",
  "Prensa": "Prensa de piernas",
  /* Duplicados: el mismo ejercicio con dos nombres. Aquí el nombre viejo cae en uno
     que ya existía, y migrarNombres junta las marcas de los dos. Los "X o Y" se
     quedan en X: del "si está ocupado" ya se encarga el botón Cambiar del entreno. */
  "Curl de bíceps mancuernas": "Curl de bíceps",
  "Extensión de tríceps": "Extensión de tríceps en polea",
  "Extensión de tríceps con cuerda": "Extensión de tríceps sobre cabeza con cuerda",
  "Extensión de tríceps en polea baja": "Press francés en polea",
  "Curl femoral en máquina": "Curl femoral tumbado",
  "Sentadilla hack en máquina": "Sentadilla hack",
  "Pájaros en polea cruzada": "Pájaros en polea",
  "Crunch en polea con cuerda": "Crunch en polea",
  "Press declinado guiado": "Press declinado en multipower",
  "Curl de muñeca sentado en polea": "Curl de muñeca en polea",
  "Curl sobre la cabeza en polea": "Curl en polea alta",
  "Elevación lateral en polea baja": "Elevaciones laterales en polea",
  "Remo a la cara con cuerda": "Face pull",
  "Peso muerto rumano ligero": "Peso muerto rumano",
  "Jalón con recorrido completo": "Jalón al pecho",
  "Press banca o flexiones": "Press banca",
  "Remo invertido o con mancuerna": "Remo con mancuerna",
};

/* El nombre de hoy de un ejercicio. Sigue la cadena entera: "Curl femoral" pasó a
   "Curl femoral en máquina" y ese a "Curl femoral tumbado", y quien venga de una
   versión muy vieja tiene que llegar al final de un solo salto. */
function nombreActual(n){
  let v = n;
  for(let i=0; i<6 && RENOMBRES[v]; i++) v = RENOMBRES[v];
  return v;
}

/* Aplica los renombres a todo lo que guarda nombres de ejercicio. */
function migrarNombres({ state, log, customRoutines }){
  const nuevo = nombreActual;
  let tocado = false;

  const mapaClaves = (obj, juntar = Math.max) => {
    if(!obj) return obj;
    const out = {}; let cambio = false;
    for(const [k,v] of Object.entries(obj)){
      const k2 = nuevo(k);
      if(k2 !== k) cambio = true;
      // Dos nombres que caen en el mismo ejercicio: se juntan las marcas.
      out[k2] = (k2 in out) ? (typeof v === "number" ? juntar(out[k2], v) : v) : v;
    }
    if(cambio) tocado = true;
    return cambio ? out : obj;
  };

  const s2 = { ...state,
    bests: mapaClaves(state.bests), firstBests: mapaClaves(state.firstBests, Math.min),
    nextWeight: mapaClaves(state.nextWeight), cardioBests: mapaClaves(state.cardioBests),
    muscleXp: state.muscleXp };

  const l2 = (log || []).map(rec => {
    const ex = (rec.exercises || []).map(e => e.name !== nuevo(e.name) ? { ...e, name:nuevo(e.name) } : e);
    if(ex.some((e,i) => e !== rec.exercises[i])) { tocado = true; return { ...rec, exercises:ex }; }
    return rec;
  });

  const r2 = (customRoutines || []).map(r => {
    const days = (r.days || []).map(d => {
      const lista = d.exercises || [];
      // Con los dos duplicados en el mismo día, la fusión los dejaría repetidos. Solo cae
      // el renombrado que choca: repetir un ejercicio a propósito es cosa tuya.
      const vistos = new Set(lista.filter(e => e.name === nuevo(e.name)).map(e => e.name));
      const exercises = lista.flatMap(e => {
        const n = nuevo(e.name);
        if(n === e.name) return [e];
        if(vistos.has(n)) return [];
        vistos.add(n);
        return [{ ...e, name:n }];
      });
      return { ...d, exercises };
    });
    if(JSON.stringify(days) !== JSON.stringify(r.days)) { tocado = true; return { ...r, days }; }
    return r;
  });

  return { state:s2, log:l2, customRoutines:r2, tocado };
}

/* Pesos base sugeridos (kg) para pre-rellenar antes de tener historial */
const EX_BASE = {
  "Sentadilla":40, "Sentadilla goblet":16, "Sentadilla búlgara":12, "Prensa de piernas":80,
  "Press banca":30, "Press inclinado con barra":25, "Press inclinado mancuernas":14,
  "Press militar":25, "Press militar mancuernas":12, "Peso muerto":50, "Peso muerto rumano":40,
  "Peso muerto rumano mancuernas":16, "Remo con barra":30,
  "Remo con mancuerna":16, "Remo en máquina":30, "Jalón al pecho":35, "Jalón agarre cerrado":32,
  "Dominadas o jalón":35, "Zancadas con barra":12, "Extensión de cuádriceps en máquina":25,
  "Elevación de talones de pie":40, "Elevaciones laterales":8, "Face pull":15, "Curl de bíceps":10,
  "Curl martillo":10, "Curl predicador":12, 
  "Press francés":15, "Aperturas con mancuernas":10, "Fondos en paralelas":0, "Fondos asistidos":0, "Dominada asistida":0, "Flexiones":0,
  "Flexiones diamante":0, "Flexiones inclinadas":0, 
  "Superserie de bíceps y tríceps":10,
  "Jalón agarre neutro":32, "Curl con barra":20, "Curl femoral tumbado":25, "Curl femoral sentado":25,
  "Aperturas en polea":12, "Extensión de tríceps en polea":15, "Sentadilla frontal":30,
  "Press mancuernas sentado":14, "Dominadas lastradas":0, "Fondos en paralelas lastrados":0, "Plancha con lastre":0,
  "Zancadas con mancuernas":12, "Elevaciones laterales en polea":8, "Pullover en polea":12, "Pájaros en polea":8,
  "Hip thrust":40, "Puente de glúteo":20, "Patada de glúteo en polea":10, "Patada de glúteo en máquina":20, "Elevación lateral en máquina":15, "Pulldown en máquina de discos":30, "Jalón en máquina":35, "Remo de deltoides posterior en máquina":15, "Abductores en máquina":30,
  "Aductores en máquina":30, "Peso muerto sumo":40, "Sentadilla sumo con mancuerna":16, "Zancada caminando":10,
  "Good morning":20,
  /* Cardio / peso corporal: sin carga sugerida (peso 0 → no prefill). */
  "Mountain climbers":0, "HIIT en bici o cinta":0, "Calentamiento en cinta o bici":0,
  /* --- Ejercicios adicionales --- */
  "Press banca mancuernas":20, "Press Arnold":12, "Encogimientos":22, "Curl concentrado":10,
  "Curl inclinado":9, "Extensión de tríceps sobre cabeza":12, "Patada de tríceps":8, "Remo en T":30,
  "Remo al mentón":20, "Peso muerto piernas rígidas":35, "Elevación de talones sentado":30,
  "Crunch abdominal":0, "Russian twist":0, "Sentadilla hack":40, "Dominada supina":0, "Bicicleta abdominal":0,
  /* --- Catálogo ampliado (free-exercise-db): solo se usan en rutinas propias --- */
  "Press declinado con barra":28, "Contractora de pecho":25, "Press de pecho en máquina":30, "Pullover con mancuerna":14,
  "Jalón agarre supino":32, "Remo con dos mancuernas":14, "Peso muerto parcial":60,
  "Encogimientos con barra":40, "Elevación frontal":7, "Press de hombro en máquina":20, "Press de hombro en polea":15, "Pájaros con mancuernas":7,
  "Zancada inversa":10, "Subida al cajón":10, "Sentadilla en multipower":30, "Sentadilla con mancuernas":14,
  "Gemelo en prensa":60, "Elevación de talones con mancuerna":14,
  "Curl en polea":15, "Curl inverso":15, "Curl araña":10,
  "Press banca agarre cerrado":25,
  "Crunch en polea":20, "Crunch en máquina":25,
  /* --- Máquinas y poleas (free-exercise-db) --- */
  "Press inclinado en máquina":28, "Press declinado en máquina":30, "Press banca en multipower":30,
  "Press inclinado en multipower":25, "Cruce de poleas bajo":12, "Aperturas inclinadas en polea":12,
  "Press de pecho en polea":20, "Press de pecho en polea sentado":20, "Cruce de poleas alto":12,
  "Press declinado en multipower":30, "Aperturas en banco con poleas":12, "Press inclinado en polea":18,
  "Press de pecho en máquina de discos":25, "Cruce de poleas a una mano":10, 
  "Remo alto en máquina":30, "Remo en máquina a un brazo":20, "Remo en polea a una mano":20,
  "Jalón a una mano":20, "Remo en multipower":30, "Pullover en polea inclinado":12,
  "Remo en polea alto":30, "Remo en polea alta de rodillas":25,
  "Remo en polea alta a una mano":15,
  "Pájaros en contractora":12, "Elevación frontal en polea":10, "Encogimientos en máquina":40,
  "Encogimientos en polea":35, "Press militar en multipower":25, "Rotación externa en polea":5,
  "Press de hombro en polea alterno":12, "Pájaros en polea a una mano":6, "Rotación interna en polea":5,
  "Press de hombro en polea de pie":15,
  "Encogimientos en máquina de gemelos":40, "Press de hombro en máquina de discos":20, "Remo al cuello en polea baja":15,
  "Encogimientos tras espalda en multipower":40, "Remo al mentón a una mano en multipower":12, "Remo al mentón en multipower":20,
  "Remo al mentón en polea":18,
  "Prensa con pies juntos":70, "Extensión de cuádriceps a una pierna en máquina":15,
  "Zancada en multipower":20, "Pull through en polea":25, "Peso muerto en polea":30,
  "Aductores en polea":10, "Sentadilla en máquina":40, "Peso muerto en máquina":50,
  "Sentadilla tumbada en máquina":50, "Sentadilla hack con pies juntos":40, "Prensa en multipower":40,
  "Sentadilla a una pierna en multipower":20,
  "Curl femoral de pie":15, "Peso muerto rumano en multipower":35,
  "Elevación de talones en multipower":40, "Gemelos en máquina":55, "Elevación de puntas (tibial)":25,
  "Curl de bíceps en máquina":20, "Curl predicador en máquina":18, "Curl martillo en polea":15,
  "Curl predicador en polea":15, "Curl en polea alta":10, "Curl tumbado en polea":12,
  "Curl tumbado en polea alta":12, "Curl inverso en polea":12,
  "Curl en polea a una mano":10,
  "Extensión de tríceps en máquina":20, "Fondos en máquina":25, "Tríceps en polea con cuerda":15,
  "Extensión de tríceps inclinado en polea":12, "Press francés en polea":15, "Tríceps en polea a una mano":8,
  "Extensión de tríceps de rodillas en polea":12, "Tríceps en polea agarre invertido":12,
  "Press cerrado en multipower":25, "Extensión de tríceps sobre cabeza en polea baja":8, "Extensión de tríceps sobre cabeza con cuerda":15,
  "Curl de muñeca en polea":10, 
  "Press Pallof":12, "Leñador en polea":15, "Crunch inverso en polea":15,
  "Giro ruso en polea":12, "Crunch en polea sentado":18, "Crunch en polea con giro":15,
  "Flexión lateral en polea alta":12, "Press Pallof con giro":12, 
  "Elevación de cadera en multipower":20, "Leñador invertido en polea":15, "Crunch en polea de pie":18,
  /* Casa con material: la kettlebell de casa es de 6 kg (×0,62 en modo femenino da 6). */
  "Swing con kettlebell":10, "Peso muerto a una pierna con kettlebell":10, "Remo con kettlebell":10, "Press de suelo con kettlebell":10,
};

/* Peso base sugerido ajustado por sexo (solo punto de partida; luego se adapta a tus marcas). */
function baseFor(name, sex){ const b = EX_BASE[name] ?? 10; return sex==="mujer" ? Math.round(b*0.62) : b; }

/* Ejercicios SIN carga externa: peso corporal, isométricos o cardio.
   En estos no se pide peso: solo se anotan repeticiones o segundos.
   OJO: las variantes "lastradas" / "con lastre" NO van aquí, porque sí llevan disco. */
const BODYWEIGHT_EX = new Set([
  "Plancha", "Plancha lateral", "Rueda abdominal", "Crunch abdominal", "Bicicleta abdominal",
  "Russian twist", "Elevación de piernas", "Elevación de piernas en barra", "Mountain climbers",
  "Flexiones", "Flexiones diamante", "Flexiones inclinadas",
  "Fondos en paralelas", "Fondos asistidos", "Dominada asistida", "Dominada supina",
  "HIIT en bici o cinta", "Calentamiento en cinta o bici",
  /* Catálogo ampliado: peso corporal, isométricos y cardio */
  "Flexiones declinadas", "Hiperextensiones", "Sentadilla con salto", "Sentadilla sin peso",
  "Puente de glúteo a una pierna", "Curl nórdico", "Fondos en banco", "Elevación de rodillas",
  "Tijeras", "Cinta de correr", "Caminar en cinta", "Bici estática",
  "Elíptica", "Máquina de remo", "Comba", "Escaladora",
  /* Máquinas y poleas sin carga externa */
  "Hiperextensión inversa", "Curl nórdico en máquina", "Bici reclinada",
  /* Casa: gomas (no tienen kilos), agarres de flexiones y tonificador */
  "Flexiones con agarres", "Remo sentado con goma", "Curl de bíceps con goma", "Aperturas inversas con goma",
  "Aperturas de pie con goma", "Press de hombro con goma", "Extensión de tríceps con goma", "Aductores con tonificador",
]);
const isBodyweight = (name) => BODYWEIGHT_EX.has(name);

/* Unidad del objetivo: "45 s" → SEG, "8 min" → MIN, "12-15" o "máx" → REPS. */
function repUnit(reps){
  const t = String(reps || "");
  if (/min/i.test(t)) return "MIN";
  if (/\bs(eg)?\b/i.test(t)) return "SEG";
  return "REPS";
}

/* Mapa nombre→músculo (para contar volumen por grupo corporal) */
const EX_MUSCLE = {};
ROUTINES.forEach(r=>r.days.forEach(d=>d.exercises.forEach(ex=>{ if(!(ex.name in EX_MUSCLE)) EX_MUSCLE[ex.name]=ex.muscle; })));
/* Ejercicios del catálogo (EX_BASE/EX_HOW/EX_IMG) que ninguna rutina de la app usa: sin
   esto no tendrían músculo y el configurador de rutinas no podría ofrecerlos. */
/* Agarres del jalón: cada serie lleva el suyo para poder intercalarlos. El cerrado es otro
   ejercicio, con sus propias marcas y su propio peso, así que al terminar cada serie se
   apunta en el suyo. Con `separarAgarres` todo lo que va después sigue contando por nombre. */
const AGARRES = { abierto:"Jalón al pecho", cerrado:"Jalón agarre cerrado" };
const tieneAgarres = n => n===AGARRES.abierto || n===AGARRES.cerrado;
const agarreDe = (ex, l) => l.agarre || (ex.name===AGARRES.cerrado ? "cerrado" : "abierto");
const nombreSerie = (ex, l) => tieneAgarres(ex.name) ? AGARRES[agarreDe(ex, l)] : ex.name;
function separarAgarres(ejercicios){
  return ejercicios.flatMap(ex=>{
    if(!tieneAgarres(ex.name)) return [ex];
    return [...new Set(ex.logs.map(l=>nombreSerie(ex, l)))].map(name=>({ ...ex, name, logs:ex.logs.filter(l=>nombreSerie(ex, l)===name) }));
  });
}
/* Lo que pone en el rótulo de cada máquina (las del gimnasio del dueño, que llevan el nombre
   escrito en la torre de placas). En la sala nadie sabe que la "Mariposa pectoral" es nuestra
   "Contractora de pecho": con esto se encuentra buscando por cualquiera de los dos nombres y
   el selector y el entreno enseñan el rótulo. Solo se añade aquí lo que de verdad pone en una
   máquina; un sinónimo cualquiera no. */
const EX_MAQUINA = {
  "Extensión de cuádriceps en máquina":"Extensión de pierna",
  "Curl femoral sentado":"Contracción de pierna sentado",
  "Press de hombro en máquina":"Extensora de hombros",
  "Contractora de pecho":"Mariposa pectoral",
  "Curl de bíceps en máquina":"Contracción de bíceps",
  "Fondos en máquina":"Press de tríceps",
  "Remo en máquina":"Remo / deltoides posterior",
  "Remo de deltoides posterior en máquina":"Remo / deltoides posterior",
  "Jalón en máquina":"Estirar hacia abajo",
  "Pulldown en máquina de discos":"Pull down",
  "Patada de glúteo en máquina":"Glute",
  "Dominada asistida":"Descenso / ascenso asistido",
  "Fondos asistidos":"Descenso / ascenso asistido",
};
const EX_MUSCLE_EXTRA = {
  "Aductores en máquina":"Pierna", "Good morning":"Femoral", "Patada de tríceps":"Tríceps",
  "Press declinado con barra":"Pecho", "Contractora de pecho":"Pecho", "Press de pecho en máquina":"Pecho", "Flexiones declinadas":"Pecho", "Pullover con mancuerna":"Pecho",
  "Hiperextensiones":"Espalda", "Jalón agarre supino":"Espalda", "Remo con dos mancuernas":"Espalda", "Peso muerto parcial":"Espalda",
  "Encogimientos con barra":"Hombro", "Elevación frontal":"Hombro", "Press de hombro en máquina":"Hombro", "Press de hombro en polea":"Hombro", "Pájaros con mancuernas":"Hombro",
  "Zancada inversa":"Pierna", "Subida al cajón":"Pierna", "Sentadilla en multipower":"Pierna", "Sentadilla con mancuernas":"Pierna", "Sentadilla con salto":"Pierna", "Sentadilla sin peso":"Pierna", "Puente de glúteo a una pierna":"Pierna",
  "Curl nórdico":"Femoral",
  "Gemelo en prensa":"Gemelo", "Elevación de talones con mancuerna":"Gemelo",
  "Curl en polea":"Bíceps", "Curl inverso":"Bíceps", "Curl araña":"Bíceps",
  "Fondos en banco":"Tríceps", "Press banca agarre cerrado":"Tríceps",
  "Crunch en polea":"Core", "Crunch en máquina":"Core", "Elevación de rodillas":"Core", "Tijeras":"Core",
  "Cinta de correr":"Cardio", "Caminar en cinta":"Cardio", "Bici estática":"Cardio", "Elíptica":"Cardio", "Máquina de remo":"Cardio", "Comba":"Cardio", "Escaladora":"Cardio",
  /* --- Máquinas y poleas --- */
  "Press inclinado en máquina":"Pecho", "Press declinado en máquina":"Pecho",
  "Press banca en multipower":"Pecho", "Press inclinado en multipower":"Pecho",
  "Cruce de poleas bajo":"Pecho", "Aperturas inclinadas en polea":"Pecho",
  "Press de pecho en polea":"Pecho", "Press de pecho en polea sentado":"Pecho",
  "Cruce de poleas alto":"Pecho", "Press declinado en multipower":"Pecho",
  "Aperturas en banco con poleas":"Pecho", "Press inclinado en polea":"Pecho",
  "Press de pecho en máquina de discos":"Pecho", "Cruce de poleas a una mano":"Pecho",
  "Remo alto en máquina":"Espalda", "Remo en máquina a un brazo":"Espalda",
  "Pulldown en máquina de discos":"Espalda", "Dominada asistida":"Espalda",
  "Jalón en máquina":"Espalda", "Remo de deltoides posterior en máquina":"Hombro",
  "Elevación lateral en máquina":"Hombro", "Patada de glúteo en máquina":"Pierna",
  "Remo en polea a una mano":"Espalda", "Jalón a una mano":"Espalda",
  "Remo en multipower":"Espalda", "Hiperextensión inversa":"Espalda",
  "Pullover en polea inclinado":"Espalda", "Remo en polea alto":"Espalda",
  "Remo en polea alta de rodillas":"Espalda",
  "Remo en polea alta a una mano":"Espalda",
  "Pájaros en contractora":"Hombro", "Elevación frontal en polea":"Hombro",
  "Encogimientos en máquina":"Hombro", "Encogimientos en polea":"Hombro",
  "Press militar en multipower":"Hombro", "Rotación externa en polea":"Hombro",
  "Press de hombro en polea alterno":"Hombro", "Pájaros en polea a una mano":"Hombro",
  "Rotación interna en polea":"Hombro", 
  "Press de hombro en polea de pie":"Hombro",
  "Encogimientos en máquina de gemelos":"Hombro", "Press de hombro en máquina de discos":"Hombro",
  "Remo al cuello en polea baja":"Hombro", "Encogimientos tras espalda en multipower":"Hombro",
  "Remo al mentón a una mano en multipower":"Hombro", "Remo al mentón en multipower":"Hombro",
  "Remo al mentón en polea":"Hombro",
  "Prensa con pies juntos":"Pierna",
  "Extensión de cuádriceps a una pierna en máquina":"Pierna", "Zancada en multipower":"Pierna",
  "Pull through en polea":"Pierna", "Peso muerto en polea":"Pierna",
  "Aductores en polea":"Pierna", "Sentadilla en máquina":"Pierna",
  "Peso muerto en máquina":"Pierna", "Sentadilla tumbada en máquina":"Pierna",
  "Sentadilla hack con pies juntos":"Pierna", "Prensa en multipower":"Pierna",
  "Sentadilla a una pierna en multipower":"Pierna",
  "Curl femoral de pie":"Femoral", "Peso muerto rumano en multipower":"Femoral",
  "Curl nórdico en máquina":"Femoral",
  "Elevación de talones en multipower":"Gemelo", "Gemelos en máquina":"Gemelo",
  "Elevación de puntas (tibial)":"Gemelo",
  "Curl de bíceps en máquina":"Bíceps", "Curl predicador en máquina":"Bíceps",
  "Curl martillo en polea":"Bíceps", "Curl predicador en polea":"Bíceps",
  "Curl en polea alta":"Bíceps", "Curl tumbado en polea":"Bíceps",
  "Curl tumbado en polea alta":"Bíceps", 
  "Curl inverso en polea":"Bíceps", "Curl en polea a una mano":"Bíceps",
  "Extensión de tríceps en máquina":"Tríceps", "Fondos en máquina":"Tríceps",
  "Tríceps en polea con cuerda":"Tríceps", "Extensión de tríceps inclinado en polea":"Tríceps",
  "Press francés en polea":"Tríceps", "Tríceps en polea a una mano":"Tríceps",
  "Extensión de tríceps de rodillas en polea":"Tríceps", 
  "Tríceps en polea agarre invertido":"Tríceps", "Press cerrado en multipower":"Tríceps",
  "Extensión de tríceps sobre cabeza en polea baja":"Tríceps", "Extensión de tríceps sobre cabeza con cuerda":"Tríceps",
  "Curl de muñeca en polea":"Brazo", 
  "Press Pallof":"Core", "Leñador en polea":"Core",
  "Crunch inverso en polea":"Core", "Giro ruso en polea":"Core",
  "Crunch en polea sentado":"Core", "Crunch en polea con giro":"Core",
  "Flexión lateral en polea alta":"Core", "Press Pallof con giro":"Core",
  "Elevación de cadera en multipower":"Core",
  "Leñador invertido en polea":"Core", "Crunch en polea de pie":"Core",
  "Bici reclinada":"Cardio",
};
Object.entries(EX_MUSCLE_EXTRA).forEach(([n,m])=>{ if(!(n in EX_MUSCLE)) EX_MUSCLE[n]=m; });

/* Número corto en es-ES: 6.4 -> "6,4" y 30 -> "30". */
const numES = n => Number(n).toLocaleString("es-ES", { maximumFractionDigits:1 });
/* Texto del récord de cardio: solo enseña lo que realmente se apuntó. */
function cardioRecordText(rec){
  if(!rec) return "";
  const p=[];
  if(rec.min>0)  p.push(numES(rec.min)+" min");
  if(rec.km>0)   p.push(numES(rec.km)+" km");
  if(rec.kcal>0) p.push(numES(rec.kcal)+" kcal");
  if(rec.pace>0) p.push(numES(rec.pace)+" km/h");
  if(rec.level>0) p.push("nivel "+numES(rec.level));
  return p.join(" · ");
}
/* Etiqueta de cada métrica de cardio (para contar el récord batido). */
const CARDIO_UNITS = { min:"min", km:"km", kcal:"kcal", pace:"km/h" };

/* =========================================================================
   CARDIO · ESTIMACIÓN DE KILÓMETROS Y CALORÍAS

   La consola de la máquina manda siempre: esto solo rellena el hueco cuando
   no la miras (o cuando la máquina no lo enseña), y se puede corregir a mano.
   Por eso los campos quedan marcados como estimados hasta que los tocas.

   Las fórmulas no son inventadas. Vienen de:

   · Ecuaciones metabólicas del ACSM (American College of Sports Medicine):
       - Marcha:   VO2 = 0,1·S + 1,8·S·G + 3,5     (S en m/min, G pendiente)
       - Carrera:  VO2 = 0,2·S + 0,9·S·G + 3,5
       - Cicloergómetro (piernas): VO2 = 10,8·W/kg + 7
     VO2 en ml/kg/min; 1 MET = 3,5 ml/kg/min.
   · Calorías: kcal/min = MET · 3,5 · peso(kg) / 200.
   · Velocidad en bici desde la potencia, por resistencia aerodinámica:
       P = ½·ρ·CdA·v³  ->  v = (P / (½·ρ·CdA))^(1/3)
     con ρ = 1,225 kg/m³ y CdA ≈ 0,4 m² (postura erguida de gimnasio).
   · Remo: fórmula de Concept2, P = 2,80 / ritmo³ (ritmo en s/m).

   EL NIVEL DE LA MÁQUINA NO ESTÁ NORMALIZADO entre marcas: la conversión a
   vatios es una aproximación razonable para una máquina de gimnasio con
   niveles 1-20, no una medida. De ahí que se enseñe como "aprox.".
   ========================================================================= */

/* Qué se le pide a cada máquina y cómo se convierte en esfuerzo.
   - "velocidad": la cinta, donde el usuario pone km/h y la distancia sale
     exacta (velocidad × tiempo). No hay nada que estimar.
   - "nivel": el resto, donde el nivel se traduce a vatios. */
const CARDIO_MAQUINAS = {
  "Cinta de correr":          { modo:"velocidad", vDef:9 },
  "Caminar en cinta":         { modo:"velocidad", vDef:5.5 },
  "Calentamiento en cinta o bici": { modo:"velocidad", vDef:6 },
  /* Vatios ≈ base + paso·nivel. Valores típicos de una bici de gimnasio a
     unas 70 rpm: nivel 1 ronda los 30 W y nivel 20 pasa de 250 W. */
  "Bici estática":            { modo:"nivel", wBase:20, wPaso:12, distancia:"bici" },
  "Bici reclinada":           { modo:"nivel", wBase:20, wPaso:12, distancia:"bici" },
  "Elíptica":                { modo:"nivel", wBase:25, wPaso:11, distancia:"zancada" },
  "Máquina de remo":          { modo:"nivel", wBase:40, wPaso:14, distancia:"remo" },
  "Escaladora":               { modo:"nivel", wBase:35, wPaso:13, distancia:null },
};

const METS_REPOSO = 3.5;                       // ml/kg/min

/* VO2 de la marcha o la carrera, en ml/kg/min. Sin pendiente: las cintas del
   gimnasio se usan casi siempre en llano y pedir la inclinación por serie era
   una casilla más para algo que casi nadie toca. */
function vo2Cinta(kmh){
  const S = (Number(kmh) || 0) * 1000 / 60;    // m/min
  if(S <= 0) return METS_REPOSO;
  return S < 134                               // ~8 km/h: por debajo se camina
    ? 0.1 * S + METS_REPOSO
    : 0.2 * S + METS_REPOSO;
}

/* VO2 del cicloergómetro del ACSM. Necesita el peso porque los vatios son
   absolutos: los mismos 150 W cuestan mucho más a quien pesa menos. */
function vo2Vatios(watts, pesoKg){
  const kg = Math.max(35, Number(pesoKg) || 75);
  return 10.8 * (Number(watts) || 0) / kg + 7;
}

/* Velocidad en bici estática a partir de la potencia (m/s -> km/h). */
function kmhDeVatios(watts){
  const w = Math.max(0, Number(watts) || 0);
  const v = Math.cbrt(w / (0.5 * 1.225 * 0.4));       // m/s
  return v * 3.6;
}

/* Ritmo de remo (segundos por 500 m) a partir de la potencia, Concept2. */
function kmhRemo(watts){
  const w = Math.max(1, Number(watts) || 0);
  const ritmo = Math.cbrt(2.80 / w);                   // s/m
  return ritmo > 0 ? (1 / ritmo) * 3.6 : 0;            // m/s -> km/h
}

/* Estimación completa de una tirada de cardio.
   Devuelve { km, kcal, aprox } — aprox=false cuando la distancia es exacta
   (cinta), true cuando sale de una conversión de nivel a vatios. */
function estimarCardio({ nombre, minutos, nivel, kmh, pesoKg }){
  const min = Number(minutos) || 0;
  const m = CARDIO_MAQUINAS[nombre];
  if(!m || min <= 0) return null;

  let vo2, velocidad = 0, exacta = false;

  if(m.modo === "velocidad"){
    const v = Number(kmh) || m.vDef;
    vo2 = vo2Cinta(v);
    velocidad = v;
    exacta = true;                                     // km = velocidad × tiempo
  } else {
    const lv = Math.max(1, Math.min(30, Number(nivel) || 0));
    if(!nivel) return null;                            // sin nivel no hay nada que estimar
    const watts = m.wBase + m.wPaso * lv;
    vo2 = vo2Vatios(watts, pesoKg);
    if(m.distancia === "bici")     velocidad = kmhDeVatios(watts);
    if(m.distancia === "zancada")  velocidad = kmhDeVatios(watts) * 0.55;   // la zancada avanza menos que una rueda
    if(m.distancia === "remo")     velocidad = kmhRemo(watts);
  }

  const mets = vo2 / METS_REPOSO;
  const kcal = Math.round(mets * METS_REPOSO * (Math.max(35, Number(pesoKg) || 75)) / 200 * min);
  const km = velocidad > 0 ? Math.round(velocidad * (min / 60) * 100) / 100 : null;
  return { km, kcal, aprox: !exacta, mets: Math.round(mets * 10) / 10 };
}

/* Descanso sugerido por defecto al añadir un ejercicio en el configurador (segundos). */
/* --- CARDIO ---------------------------------------------------------------
   No lleva carga (ya está en BODYWEIGHT_EX) y, en el cardio continuo, tampoco
   descanso: se anota el TIEMPO. En las máquinas de gimnasio (cinta, bici,
   elíptica, remo, escaladora) se apunta además lo que marca la consola:
   distancia, calorías y nivel. El HIIT es la excepción: son intervalos, así que
   conserva su descanso (viene con rest>0 en la rutina). */
const isCardio = name => EX_MUSCLE[name] === "Cardio";
/* Cardio de máquina con consola: pide km, kcal y nivel. La comba o los
   intervalos por segundos no tienen consola que mirar: solo tiempo. */
const MACHINE_CARDIO = new Set([
  "Cinta de correr", "Caminar en cinta", "Bici estática", "Bici reclinada", "Elíptica",
  "Máquina de remo", "Escaladora", "Calentamiento en cinta o bici",
]);
/* Solo pedimos datos de consola si es máquina Y el objetivo va en minutos
   (en intervalos de segundos no tiene sentido apuntar km por serie). */
const hasConsole = ex => isCardio(ex.name) && MACHINE_CARDIO.has(ex.name) && repUnit(ex.reps) === "MIN";
/* La cinta se ajusta por velocidad, no por "nivel": ahí la distancia sale
   exacta (velocidad × tiempo) y no hay nada que estimar. */
const porVelocidad = nombre => CARDIO_MAQUINAS[nombre]?.modo === "velocidad";
/* Un tiempo solo entra en los récords si está medido en minutos. */
const tracksTime = ex => isCardio(ex.name) && repUnit(ex.reps) === "MIN";

/* Descanso sugerido por defecto al añadir un ejercicio en el configurador (segundos).
   El cardio continuo arranca en 0: no hay descanso entre series que valga. */
const REST_BY_MUSCLE = { Pierna:120, Femoral:100, Espalda:100, Pecho:100, Hombro:75, Gemelo:45, Bíceps:45, Tríceps:45, Core:45, Cardio:0 };
function defaultRest(name){ const r = REST_BY_MUSCLE[EX_MUSCLE[name]]; return r == null ? 60 : r; }
/* Rango por TIPO de ejercicio, no uno para todo. Con 10-12 en todos (lo de antes),
   la doble progresión pedía 12 repeticiones también en un press o un jalón pesados,
   y ahí el peso se estanca. Lo que hace crecer es acercarse al fallo en casi
   cualquier rango; el rango solo decide qué es cómodo de cargar:
     - multiarticulares (press, remo, jalón, sentadilla, prensa, peso muerto…): 6-10,
     - aislamiento (curl, extensión, aperturas…): 8-12,
     - músculos pequeños y estabilizadores (laterales, face pull, gemelo…): 12-15.
   Ancho a propósito: sube el peso al llegar arriba y vuelve a empezar desde abajo.
   Lo usan el configurador, añadir y sustituir en el entreno. Las rutinas de la app
   traen su propio rango y las propias ya guardadas no se tocan. */
const REPS_PEQUENO = /lateral|elevaci[oó]n frontal|face pull|p[aá]jaros|deltoides posterior|rotaci[oó]n|encogimiento|gemelo|talones|puntas|abductor|aductor|mu[ñn]eca|pallof|le[ñn]ador|crunch|giro ruso|russian|flexi[oó]n lateral|patada de gl[uú]teo/i;
const REPS_COMPUESTO = /^(press(?! franc[eé]s| pallof)|remo(?! al (ment[oó]n|cuello)| de deltoides)|jal[oó]n|pulldown|dominada|sentadilla|prensa|peso muerto|hip thrust|zancada|good morning|subida al caj[oó]n|pull through|fondos|elevaci[oó]n de cadera)/i;
function defaultReps(name){
  if(isCardio(name)) return "20 min";                        // cardio: se anota tiempo, no repeticiones
  if(/plancha/i.test(name)) return "45 s";                   // isométricos: segundos, también con lastre
  if(name === "Mountain climbers") return "30 s";            // como en las rutinas de la app
  if(isBodyweight(name)) return "12-15";
  if(REPS_PEQUENO.test(name)) return "12-15";
  if(REPS_COMPUESTO.test(name)) return "6-10";
  return "8-12";
}
/* El cardio continuo es una sola tirada, no tres series. */
function defaultSets(name){ return isCardio(name) ? 1 : 3; }

/* Techo semanal saludable de series por grupo (aprox. MAV alto / inicio de MRV) */
const GROUP_CEIL = { Pecho:22, Espalda:26, Piernas:26, Hombros:24, Brazos:20, Core:25, Aguante:40 };

/* Cómo se realiza cada ejercicio */
const EX_HOW = {
  "Sentadilla goblet":"Sujeta una mancuerna o pesa rusa contra el pecho con las dos manos. Baja flexionando cadera y rodillas con la espalda recta y el pecho alto hasta que los muslos queden paralelos al suelo; sube empujando con los talones.",
  "Press banca":"Tumbado en el banco, agarra la barra algo más ancha que los hombros. Bájala controlada hasta rozar el pecho con los codos a ~45°, y empuja arriba sin bloquear de golpe. Omóplatos apretados y pies en el suelo.",
  "Remo con mancuerna":"Con una rodilla y una mano en el banco, deja colgar la mancuerna. Tira del codo hacia atrás llevando la mancuerna a la cadera, aprieta la espalda arriba y baja despacio. No gires el tronco.",
  "Press militar mancuernas":"De pie con la espalda firme, mancuernas a la altura de los hombros. Empuja arriba hasta casi estirar los brazos sin arquear la lumbar y baja controlado. Aprieta glúteos y abdomen.",
  "Plancha":"Sobre antebrazos y puntas de los pies, cuerpo en línea recta de cabeza a talones. Aprieta abdomen y glúteos, no dejes caer la cadera ni subas el culo. Respira con normalidad.",
  "Prensa de piernas":"Sentado en la máquina, pies a la anchura de los hombros. Baja flexionando las rodillas hacia el pecho sin despegar la lumbar del respaldo y empuja sin bloquear del todo las rodillas.",
  "Jalón al pecho":"Sentado, agarra la barra más ancha que los hombros. Tira hacia la parte alta del pecho llevando los codos abajo y atrás, aprieta la espalda y sube controlando sin encoger los hombros.",
  "Press inclinado mancuernas":"Banco inclinado 30-45°, mancuernas a los lados del pecho. Empuja arriba juntándolas un poco y baja controlado hasta notar estiramiento en el pecho. Omóplatos apretados.",
  "Elevaciones laterales":"De pie con una mancuerna en cada mano y codos algo flexionados, sube los brazos a los lados hasta la altura del hombro liderando con el codo, y baja despacio. Sin impulso del cuerpo.",
  "Elevación de piernas":"Tumbado boca arriba, sube las piernas (rectas o con la rodilla algo flexionada) llevando la pelvis hacia el ombligo, y baja controlado sin arquear la lumbar.",
  "Remo en máquina":"Ajusta el asiento para que la mitad del pecho quede a la altura de la parte alta de la almohadilla, y acerca o aleja la almohadilla hasta poder estirar del todo los brazos. Con la cabeza y el pecho erguidos, agarra los mangos verticales y tira hacia atrás despacio hasta que los codos queden a la altura del cuerpo; vuelve estirando sin despegar el pecho.",
  "Patada de glúteo en máquina":"Ajusta la almohadilla para que te quede entre el pecho y el abdomen. De pie, apoya un pie en la plataforma con la rodilla algo doblada, estira cadera y rodilla empujando hacia atrás, aprieta el glúteo y vuelve despacio. Acaba las repeticiones, gira la plataforma y repite con la otra pierna.",
  "Elevación lateral en máquina":"Siéntate de cara a la máquina y ajusta el asiento para que los hombros queden alineados con los ejes de giro: si está bien, las almohadillas no resbalan por los brazos al subir. Apoya los antebrazos en las almohadillas, agarra los mangos sin apretar, sube los codos hasta la altura de los hombros y baja despacio, sin encogerte.",
  "Pulldown en máquina de discos":"Sentado y con los muslos sujetos, agarra los mangos por encima de la cabeza. Tira hacia abajo llevando los codos a los costados, aprieta la espalda y sube controlando, sin dejar caer los discos.",
  "Jalón en máquina":"Ajusta el asiento para que los muslos queden bien sujetos bajo los rodillos. Agarra los mangos por encima de la cabeza y tira hacia abajo hasta la altura de los hombros llevando los codos a los costados; aprieta la espalda y sube controlando, sin dejar caer las placas ni encoger los hombros.",
  "Remo de deltoides posterior en máquina":"En la máquina de remo con apoyo de pecho, pero con los mangos horizontales y los codos abiertos a la altura de los hombros. Tira hacia atrás separando los codos hasta que queden a la altura del cuerpo, aprieta la parte de atrás del hombro y vuelve despacio. Menos peso que en el remo: aquí trabaja el hombro, no la espalda.",
  "Dominada asistida":"Sube por los apoyos, agarra los mangos en la posición que prefieras y apoya las rodillas en la almohadilla. Sube despacio hasta que la barbilla pase las manos, con el pecho erguido, y baja controlando. Al acabar, deja que la almohadilla suba hasta que las placas descansen y bájate con cuidado. Cuanto más peso pongas, más te ayuda la máquina.",
  "Fondos asistidos":"Sube por los apoyos y gira los mangos hacia dentro. Agárralos, apoya las rodillas en la almohadilla y baja con el tronco erguido y los hombros atrás, solo hasta donde vayas cómodo; luego sube despacio. Al acabar, deja subir la almohadilla y bájate con cuidado. Cuanto más peso pongas, más te ayuda la máquina.",
  "Face pull":"Cuerda en polea a la altura de la cara: tira hacia la frente separando las manos con los codos altos y atrás, apretando la parte trasera del hombro. Peso ligero y control.",
  "Curl de bíceps":"De pie con una mancuerna en cada mano y codos pegados, sube flexionando el codo sin balancear y baja controlando.",
  "Sentadilla":"Barra sobre la parte alta de la espalda. Baja flexionando cadera y rodillas con el pecho alto y la espalda recta hasta pasar la paralela, y sube empujando con todo el pie. Rodillas hacia la punta de los pies.",
  "Remo con barra":"Inclina el tronco ~45° con la espalda recta y la barra colgando. Tira llevándola al ombligo apretando la espalda y baja controlado. No tirones con la lumbar.",
  "Peso muerto":"Barra sobre el medio del pie. Con espalda recta y pecho alto, levanta empujando el suelo con las piernas y extendiendo la cadera; la barra sube pegada al cuerpo. Nunca redondees la lumbar.",
  "Press militar":"De pie, barra a la altura de las clavículas. Empuja por encima de la cabeza hasta estirar los brazos sin arquear la lumbar (aprieta glúteos y abdomen) y baja controlado.",
  "Rueda abdominal":"De rodillas, desliza la rueda hacia delante estirando el cuerpo SIN arquear la lumbar (abdomen apretado), hasta donde controles, y vuelve. Empieza con recorrido corto.",
  "Peso muerto rumano":"De pie con barra y piernas casi rectas, lleva la cadera atrás bajando la barra pegada a las piernas hasta notar tensión en los femorales, espalda recta, y sube apretando glúteos.",
  "Zancadas con barra":"Da un paso al frente y baja la rodilla trasera hacia el suelo con el tronco erguido y la rodilla delantera sobre el tobillo. Empuja para volver y alterna piernas.",
  "Elevación de talones de pie":"Con las puntas de los pies en un escalón, sube el talón lo máximo poniéndote de puntillas, aprieta arriba y baja estirando bien el gemelo.",
  "Extensión de cuádriceps en máquina":"Antes de empezar, mueve el respaldo hasta que la rodilla quede a la altura del eje de giro y ajusta el rodillo para que apoye justo encima del tobillo, no en el empeine. Elige con el selector de recorrido desde dónde empiezas. Con los muslos paralelos y los pies relajados, estira las piernas despacio hasta tenerlas rectas y baja controlando, sin que choquen las placas.",
  "Dominadas o jalón":"Dominadas: colgado de la barra, tira del pecho hacia ella llevando los codos abajo y atrás, y baja controlado. Si aún no salen, usa el jalón al pecho en polea con la misma técnica.",
  "Aperturas con mancuernas":"Tumbado con mancuernas sobre el pecho y codos algo flexionados, abre los brazos en arco hasta notar estiramiento y ciérralos apretando el pecho, como si abrazaras.",
  "Curl martillo":"Curl con las mancuernas en agarre neutro (palmas enfrentadas). Sube flexionando el codo sin girar la muñeca y baja controlado. Trabaja bíceps y antebrazo.",
  "Press francés":"Tumbado o sentado, barra o mancuernas sobre la cabeza con los codos apuntando al techo. Baja flexionando solo los codos hacia la frente y estira arriba. Codos quietos.",
  "Fondos en paralelas":"En paralelas, baja flexionando los codos hasta que el hombro llegue a su altura y empuja arriba. Inclínate adelante para pecho, vertical para tríceps. No bajes más de lo que controles.",
  "Curl predicador":"Con el brazo apoyado en el banco predicador, sube la barra o mancuerna flexionando el codo y baja controlando bien la parte final, sin estirar de golpe.",
  "Jalón agarre cerrado":"Jalón con barra recta y las manos juntas, palmas hacia delante. Tira hacia el pecho con los codos pegados abajo y atrás, aprieta la espalda y sube controlado.",
  "Sentadilla búlgara":"Pie trasero apoyado en un banco y una mancuerna en cada mano. Baja flexionando la pierna delantera con el tronco algo inclinado y empuja para subir. Una pierna cada vez.",
  "Flexiones":"Manos algo más anchas que los hombros, cuerpo en línea recta. Baja el pecho al suelo con los codos a ~45° y empuja arriba apretando abdomen y glúteos. Si cuesta, apoya rodillas.",
  "Peso muerto rumano mancuernas":"Como el rumano pero con una mancuerna en cada mano: cadera atrás, mancuernas pegadas a las piernas, espalda recta, hasta notar los femorales, y sube apretando glúteos.",
  "Flexiones diamante":"Flexión con las manos juntas formando un triángulo bajo el pecho y los codos pegados al cuerpo. Enfatiza el tríceps. Cuerpo recto y abdomen apretado.",
  "Flexiones inclinadas":"Flexiones con las manos apoyadas en una superficie elevada (banco). Más fáciles que en el suelo: baja el pecho hacia el borde y empuja. Cuerpo recto.",
  "Plancha lateral":"De lado sobre un antebrazo, con el codo bajo el hombro, cuerpo en línea recta y cadera arriba. Aguanta sin dejarla caer y cambia de lado.",
  "Calentamiento en cinta o bici":"Trote suave en cinta o pedaleo ligero en bici para subir pulsaciones antes de entrenar. Ritmo cómodo en el que puedas hablar.",
  "Mountain climbers":"En posición de flexión, lleva las rodillas al pecho alternando rápido como si corrieras, con el abdomen apretado y la cadera estable.",
  "Elevación de piernas en barra":"Colgado de la barra, sube las piernas (rectas o rodillas flexionadas) llevando la pelvis hacia arriba sin balancearte. Control en la bajada.",
  "HIIT en bici o cinta":"Intervalos: ~30 s fuerte (casi al máximo) y 30 s suave, repitiendo. Sube pulsaciones para el gasto calórico. Ajusta la intensidad a tu forma física.",
  "Dominadas lastradas":"Dominadas con peso añadido (cinturón de lastre o mancuerna entre los pies). Misma técnica: pecho a la barra, codos abajo y atrás, bajada controlada. Solo si dominas las normales.",
  "Superserie de bíceps y tríceps":"Superserie: una serie de curl de bíceps seguida SIN descanso de una de extensión de tríceps; descansa al terminar ambas.",
  "Jalón agarre neutro":"Jalón con triángulo (palmas enfrentadas). Tira hacia el pecho con los codos pegados abajo, aprieta la espalda y sube controlado.",
  "Curl con barra":"De pie con barra recta o Z y codos pegados al cuerpo, sube flexionando el codo sin balancear la espalda y baja controlando.",
  "Curl femoral tumbado":"Tumbado boca abajo en la máquina, engancha los tobillos y lleva los talones al glúteo apretando el femoral; baja controlado sin despegar la cadera.",
  "Aperturas en polea":"Entre dos poleas a la altura del pecho con los brazos algo flexionados, junta las manos delante en arco apretando el pecho y abre controlando el estiramiento.",
  "Extensión de tríceps en polea":"Polea alta con barra, codos pegados al cuerpo. Estira hacia abajo apretando el tríceps y sube controlando sin mover los codos.",
  "Curl femoral sentado":"Mueve el respaldo para que la rodilla quede alineada con el eje de giro y ajusta el rodillo para que quede detrás del tobillo. Elige el recorrido, apoya las piernas en el rodillo, baja la almohadilla de los muslos hasta que te sujete sin apretar y agarra los mangos. Lleva el rodillo hacia abajo doblando las rodillas y vuelve despacio. Al acabar, sube la almohadilla de los muslos para salir.",
  "Zancadas con mancuernas":"Zancadas con una mancuerna en cada mano: paso al frente, baja la rodilla trasera con el tronco erguido y empuja para volver. Alterna piernas.",
  "Plancha con lastre":"Plancha sobre antebrazos con un disco en la espalda alta. Cuerpo en línea recta, abdomen y glúteos apretados, sin hundir la cadera.",
  "Fondos en paralelas lastrados":"Fondos en paralelas con peso añadido (cinturón de lastre). Baja hasta que el hombro llegue al codo y empuja. Solo si dominas los fondos sin peso.",
  "Press mancuernas sentado":"Sentado con respaldo, mancuernas a la altura de los hombros. Empuja arriba sin arquear la lumbar y baja controlado hasta los hombros.",
  "Sentadilla frontal":"Barra apoyada delante, sobre hombros y clavículas, codos altos. Baja manteniendo el tronco muy vertical y sube empujando con las piernas. Exige buena movilidad.",
  "Elevaciones laterales en polea":"De pie de lado a una polea baja, sube el brazo al lateral hasta la altura del hombro liderando con el codo y baja controlando. Un brazo cada vez.",
  "Pullover en polea":"De pie frente a la polea alta con barra o cuerda y brazos algo flexionados, lleva el peso hacia los muslos en arco apretando el dorsal, y vuelve controlando.",
  "Pájaros en polea":"De pie entre dos poleas altas con los cables cruzados, abre los brazos hacia atrás y afuera apretando la parte trasera del hombro. Peso ligero y control.",
  "Hip thrust":"Con la espalda alta apoyada en un banco y una barra (almohadillada) sobre la cadera, empuja con los talones subiendo la cadera hasta alinear tronco y muslos, apretando fuerte el glúteo arriba; baja controlado.",
  "Puente de glúteo":"Tumbada boca arriba con las rodillas flexionadas y los pies apoyados, sube la cadera apretando el glúteo hasta alinear tronco y muslos, y baja despacio. Puedes añadir peso sobre la cadera.",
  "Patada de glúteo en polea":"Con una tobillera en la polea baja y el tronco algo inclinado, lleva la pierna hacia atrás con la rodilla algo flexionada apretando el glúteo, y vuelve controlando. Una pierna cada vez.",
  "Abductores en máquina":"Sentada en la máquina, abre las piernas contra la resistencia apretando la parte externa de la cadera/glúteo, y vuelve despacio sin soltar de golpe.",
  "Aductores en máquina":"Sentada en la máquina, junta las piernas contra la resistencia apretando la cara interna del muslo, y vuelve controlando la apertura.",
  "Peso muerto sumo":"Pies más anchos que los hombros y puntas algo hacia fuera. Con la espalda recta y el pecho alto, agarra la barra por dentro de las piernas y levanta empujando el suelo y abriendo las rodillas; la barra sube pegada al cuerpo.",
  "Sentadilla sumo con mancuerna":"De pie con los pies anchos y las puntas hacia fuera, sujeta una mancuerna entre las piernas. Baja flexionando cadera y rodillas con la espalda recta, y sube apretando glúteos.",
  "Zancada caminando":"Avanza con zancadas alternas: baja la rodilla trasera hacia el suelo con el tronco erguido y empuja para dar el siguiente paso. Puedes llevar mancuernas.",
  "Good morning":"Con la barra sobre la espalda alta y las rodillas algo flexionadas, lleva la cadera hacia atrás inclinando el tronco con la espalda recta hasta notar los femorales, y vuelve apretando glúteos. Peso moderado y control.",
  "Press banca mancuernas":"Tumbado en el banco con una mancuerna en cada mano a la altura del pecho, empuja hacia arriba hasta estirar los brazos sin bloquear del todo, y baja controlando hasta notar estiramiento en el pecho.",
  "Press Arnold":"Sentado, empieza con las mancuernas frente a los hombros y las palmas hacia ti. Al empujar hacia arriba, gira las muñecas hasta acabar con las palmas al frente; baja invirtiendo el giro.",
  "Encogimientos":"De pie con una mancuerna en cada mano y los brazos estirados, eleva los hombros hacia las orejas apretando el trapecio arriba, y baja despacio. No gires los hombros.",
  "Curl concentrado":"Sentado, apoya el codo en la cara interna del muslo y flexiona el brazo subiendo la mancuerna hasta el hombro apretando el bíceps; baja controlando por completo.",
  "Curl inclinado":"Tumbado boca arriba en un banco inclinado con los brazos colgando, flexiona los codos subiendo las mancuernas sin mover los hombros; el estiramiento inicial hace este curl muy efectivo.",
  "Extensión de tríceps sobre cabeza":"De pie o sentado, sujeta una mancuerna con ambas manos por encima de la cabeza. Baja el peso por detrás de la nuca flexionando solo los codos, y estira arriba apretando el tríceps.",
  "Patada de tríceps":"Inclinado con la espalda recta y el codo pegado al cuerpo, estira el brazo hacia atrás hasta dejarlo recto apretando el tríceps, y vuelve controlando sin mover el codo.",
  "Remo en T":"Con el pecho apoyado o inclinado sobre la barra en T, tira del peso hacia el abdomen llevando los codos atrás y juntando las escápulas; baja controlando el estiramiento de la espalda.",
  "Remo al mentón":"De pie con la barra o mancuernas frente a los muslos y agarre estrecho, tira hacia arriba pegado al cuerpo liderando con los codos hasta la altura del pecho; baja controlando. No subas por encima de los hombros si molesta.",
  "Peso muerto piernas rígidas":"Cada repetición sale del suelo y las rodillas casi no se doblan: eso lo separa del rumano. Con las piernas casi rectas (rodillas ligeramente flexionadas), baja la barra pegada a las piernas llevando la cadera atrás hasta notar el estiramiento de los femorales, y sube apretando glúteos. Espalda siempre recta.",
  "Elevación de talones sentado":"Sentado con el peso sobre las rodillas y las puntas de los pies en un escalón, sube los talones lo máximo posible apretando el gemelo, y baja estirando por completo.",
  "Crunch abdominal":"Tumbado boca arriba con las rodillas flexionadas, despega los hombros del suelo acercando las costillas a la cadera apretando el abdomen; baja despacio sin tirar del cuello.",
  "Russian twist":"Sentado con el tronco algo inclinado y los pies elevados o apoyados, gira el tronco de lado a lado tocando el suelo a cada lado, con el abdomen apretado. Puedes sujetar un peso.",
  "Sentadilla hack":"En la máquina hack, con los hombros bajo las almohadillas y los pies adelantados, baja flexionando rodillas y cadera con la espalda apoyada, y sube empujando con los talones sin bloquear.",
  "Dominada supina":"Cuélgate de la barra con las palmas hacia ti y agarre a la anchura de los hombros. Tira subiendo el pecho a la barra apretando dorsal y bíceps, y baja controlando hasta estirar los brazos.",
  "Bicicleta abdominal":"Tumbada boca arriba, lleva el codo hacia la rodilla contraria alternando lados como si pedalearas, con la zona lumbar pegada al suelo y el abdomen apretado.",
  "Press inclinado con barra":"Banco inclinado 30-45°, agarre algo más ancho que los hombros. Baja la barra controlada hasta la parte alta del pecho con los codos a ~45° y empuja arriba sin bloquear de golpe. Omóplatos apretados y pies firmes en el suelo.",
  /* --- Catálogo ampliado (free-exercise-db) --- */
  "Press declinado con barra":"Tumbado en un banco declinado y bien sujeto por los pies, baja la barra controlada hasta la parte baja del pecho con los codos algo recogidos, y empuja arriba sin bloquear de golpe. Pide que te ayuden a sacar y dejar la barra: en declinado cuesta más.",
  "Contractora de pecho":"Ajusta el asiento para que los codos queden un poco por debajo de los hombros y elige con el tope de cada brazo desde dónde empiezas: cuanto más atrás, más estiramiento. Siéntate con el pecho arriba y los hombros atrás, agarra los mangos verticales con los codos algo doblados y júntalos delante con un movimiento suave. Vuelve despacio, sin dejar que las placas descansen.",
  "Press de pecho en máquina":"Ajusta el asiento para que las asas queden a la altura media del pecho. Empuja hacia delante hasta casi estirar los brazos y vuelve controlando, sin adelantar los hombros ni despegar la espalda del respaldo.",
  "Flexiones declinadas":"Flexión con los pies elevados sobre un banco o cajón: cuanto más alto, más peso llevan los hombros y el pecho alto. Cuerpo en línea recta, abdomen apretado y codos a unos 45°, sin dejar caer la cadera.",
  "Pullover con mancuerna":"Tumbado en el banco, sujeta una mancuerna con las dos manos sobre el pecho con los codos algo flexionados. Llévala por detrás de la cabeza hasta notar el estiramiento en el pecho y el dorsal, y vuelve sin arquear la lumbar.",
  "Hiperextensiones":"En el banco de lumbares, con las caderas apoyadas y los pies fijos, baja el tronco flexionando la cadera con la espalda recta y sube hasta quedar alineado, apretando glúteos. No te pases de arriba: no hay que arquear la espalda.",
  "Jalón agarre supino":"Sentado y con las palmas hacia ti a la anchura de los hombros, tira de la barra al pecho llevando los codos abajo y atrás, y sube controlando sin encoger los hombros. Este agarre carga algo más el bíceps que el jalón normal.",
  "Remo con dos mancuernas":"Con el tronco inclinado hacia delante y la espalda recta, deja colgar las mancuernas. Tira de los dos codos hacia atrás llevándolas a la cadera, aprieta la espalda arriba y baja despacio sin encorvarte ni dar tirones.",
  "Peso muerto parcial":"Peso muerto desde media altura (barra en el rack, a la altura de las rodillas). Empuja la cadera hacia delante manteniendo la espalda recta y la barra pegada a las piernas. Permite más carga: cuida la técnica antes que el peso.",
  "Encogimientos con barra":"De pie con la barra delante o detrás de los muslos y los brazos estirados, sube los hombros hacia las orejas todo lo que puedas y baja despacio. No gires los hombros ni ayudes con los brazos: solo suben y bajan.",
  "Elevación frontal":"De pie con una mancuerna en cada mano delante de los muslos, sube un brazo estirado (codo algo flexionado) hasta la altura del hombro y baja controlado. Sin balancear el cuerpo ni arquear la lumbar; aprieta el abdomen.",
  "Press de hombro en máquina":"Sube o baja el asiento hasta que los mangos queden a la altura de la parte alta de los hombros. Siéntate con la espalda bien apoyada en el respaldo, el pecho arriba y los hombros atrás. Empuja los mangos hacia arriba hasta casi estirar, sin bloquear los codos, y baja controlando.",
  "Press de hombro en polea":"Sentado entre dos poleas bajas con las asas a la altura de los hombros, empuja hacia arriba y algo hacia dentro, y baja despacio. La polea mantiene la tensión todo el recorrido: no hace falta ir pesado.",
  "Pájaros con mancuernas":"Tumbado boca abajo en un banco inclinado (o con el tronco inclinado hacia delante), abre los brazos a los lados con los codos algo flexionados hasta la altura de los hombros y baja despacio. Lidera con el codo, no con la mano.",
  "Zancada inversa":"De pie con una mancuerna en cada mano, da un paso largo hacia ATRÁS y baja hasta que las dos rodillas queden a ~90°, con el tronco erguido. Empuja con la pierna de delante para volver. Es más amable con la rodilla que la zancada normal.",
  "Subida al cajón":"Con una mancuerna en cada mano, apoya todo el pie sobre un cajón o banco y sube empujando con esa pierna sin impulsarte con la de abajo. Baja controlando. Elige una altura que te deje la rodilla en torno a 90°.",
  "Sentadilla en multipower":"Sentadilla con la barra guiada: colócate con los pies algo por delante, baja flexionando cadera y rodillas con la espalda recta hasta los muslos paralelos, y sube empujando con los talones. La guía ayuda, pero la técnica sigue mandando.",
  "Sentadilla con mancuernas":"De pie con una mancuerna en cada mano a los lados, baja flexionando cadera y rodillas con el pecho alto y la espalda recta hasta los muslos paralelos, y sube empujando con los talones. Buena opción si la barra te queda incómoda.",
  "Sentadilla con salto":"Baja a media sentadilla y salta de forma explosiva estirando todo el cuerpo. Aterriza suave, primero con la punta y luego el talón, amortiguando con rodillas y cadera. Poca carga articular solo si aterrizas blando: nada de caer rígido.",
  "Sentadilla sin peso":"Sentadilla con tu propio peso: pies a la anchura de los hombros, baja llevando la cadera atrás con la espalda recta y los brazos delante para equilibrar, y sube apretando glúteos. Ideal para calentar y para aprender el patrón.",
  "Puente de glúteo a una pierna":"Tumbado boca arriba con una rodilla flexionada y la otra pierna estirada en el aire, empuja con el talón apoyado para subir la cadera hasta alinear rodilla, cadera y hombro. Aprieta el glúteo arriba y baja sin apoyar del todo.",
  "Curl nórdico":"De rodillas con los tobillos bien sujetos, baja el cuerpo hacia delante lo más despacio que puedas manteniendo el cuerpo recto de rodillas a hombros, y frena con los femorales. Ayúdate con las manos al final. Empieza con poco recorrido: da muchas agujetas.",
  "Gemelo en prensa":"En la prensa, apoya solo la parte delantera de los pies en la plataforma con las rodillas casi estiradas. Empuja con las puntas hasta arriba y baja despacio dejando que el talón caiga por debajo para estirar bien el gemelo.",
  "Elevación de talones con mancuerna":"De pie con una mancuerna en una mano y la otra apoyada para equilibrarte, sube sobre las puntas todo lo que puedas y baja despacio buscando el estiramiento. Mejor sobre un escalón para ganar recorrido.",
  "Curl en polea":"De pie frente a una polea baja con la barra o el agarre en las manos, flexiona los codos llevando el peso a los hombros sin mover los brazos del sitio, y baja controlado. La polea mantiene la tensión también abajo.",
  "Curl inverso":"Curl con las palmas hacia abajo (agarre prono). Sube la barra flexionando los codos pegados al cuerpo y baja despacio. Trabaja el braquial y el antebrazo: necesitarás bastante menos peso que en el curl normal.",
  "Curl araña":"Tumbado boca abajo sobre un banco inclinado con los brazos colgando en vertical, sube el peso flexionando solo los codos y baja del todo. Al no poder ayudarte con el cuerpo, el bíceps trabaja aislado de principio a fin.",
  "Fondos en banco":"Sentado al borde de un banco, apoya las manos a los lados de la cadera y desliza el cuerpo hacia delante. Baja flexionando los codos hacia atrás hasta ~90° y sube empujando. No bajes más de la cuenta: fuerza el hombro.",
  "Press banca agarre cerrado":"Press banca con las manos a la anchura de los hombros. Baja la barra al pecho bajo con los codos pegados al cuerpo y empuja arriba. Carga sobre todo el tríceps: usa menos peso que en el press banca normal.",
  "Crunch en polea":"De rodillas frente a una polea alta con la cuerda a los lados de la cabeza, enrolla la columna llevando los codos hacia los muslos apretando el abdomen, y vuelve despacio. El movimiento es de la espalda, no de la cadera.",
  "Crunch en máquina":"Sentado con el pecho apoyado en el rodillo y los pies fijos, enrolla el tronco hacia delante apretando el abdomen y vuelve controlando sin dejar caer el peso. No tires con los brazos ni con el cuello.",
  "Elevación de rodillas":"Tumbado boca arriba con las manos bajo los glúteos, lleva las rodillas hacia el pecho enrollando la pelvis y baja despacio sin que la lumbar se despegue del suelo. Si notas tirón en la espalda, baja menos.",
  "Tijeras":"Tumbado boca arriba con las manos bajo los glúteos y las piernas estiradas a un palmo del suelo, alterna subir y bajar cada pierna sin tocar el suelo. Mantén la lumbar pegada al suelo; si se despega, sube más las piernas.",
  "Cinta de correr":"Carrera continua en cinta. Empieza andando 3-5 minutos para calentar y sube el ritmo hasta uno que te deje hablar con frases cortas. Zancada natural, hombros sueltos y mirada al frente, sin agarrarte a las barras.",
  "Caminar en cinta":"Caminata a buen ritmo, con inclinación si quieres subir la intensidad sin correr. Es el cardio más amable con las articulaciones y el que mejor se acumula día a día. No te agarres a las barras: falsea el esfuerzo.",
  "Bici estática":"Ajusta el sillín para que la rodilla quede casi estirada abajo. Pedalea a una cadencia cómoda (unas 80-90 pedaladas por minuto) y regula la resistencia. Cardio sin impacto, ideal si te molestan rodillas o tobillos.",
  "Elíptica":"Movimiento continuo de piernas y brazos sin impacto. Cuerpo erguido, pisada completa y empuja también con los brazos para repartir el trabajo. Sube la resistencia antes que la velocidad para no ir a saltos.",
  "Máquina de remo":"El orden es piernas, tronco y brazos al tirar; brazos, tronco y piernas al volver. Empuja fuerte con las piernas y mantén la espalda recta, sin encorvarte. Es cardio de cuerpo entero: cansa más de lo que parece.",
  "Comba":"Saltos pequeños sobre la punta de los pies, con los codos pegados al cuerpo y girando la cuerda con las muñecas. Empieza con series cortas: engancha rápido y castiga bastante los gemelos.",
  "Escaladora":"Subida continua de escalones. Mantén el tronco erguido y apoya todo el pie en cada escalón, sin colgarte de las barras (te quitaría casi todo el esfuerzo). Muy exigente para piernas y glúteo.",
  /* --- Máquinas y poleas (free-exercise-db) --- */
  "Press inclinado en máquina":"Sentado en la máquina inclinada con las asas a la altura alta del pecho, empuja hacia arriba y adelante hasta casi estirar los brazos, y vuelve controlando. Carga más la parte alta del pectoral que el press plano.",
  "Press declinado en máquina":"Sentado en la máquina declinada con las asas a la altura baja del pecho, empuja hacia delante y algo abajo, y vuelve despacio. Insiste en la parte baja del pectoral y es amable con el hombro.",
  "Press banca en multipower":"Press banca con la barra guiada: bájala controlada hasta rozar el pecho y empuja arriba. Al no tener que estabilizar, puedes apurar más cerca del fallo con seguridad; recuerda poner los topes a la altura del pecho.",
  "Press inclinado en multipower":"Banco inclinado 30-45° bajo la barra guiada. Baja hasta la parte alta del pecho y empuja arriba sin bloquear de golpe. Ideal para trabajar el pectoral superior pesado y sin ayudante.",
  "Cruce de poleas bajo":"Con las poleas abajo y un asa en cada mano, sube los brazos juntándolos por delante del pecho en diagonal, y vuelve despacio con los codos algo flexionados. Aprieta arriba: es donde más trabaja la parte alta e interna del pecho.",
  "Aperturas inclinadas en polea":"Tumbado en un banco inclinado entre dos poleas bajas, junta las manos por encima del pecho describiendo un arco con los codos algo flexionados, y baja hasta notar estiramiento. Sin convertirlo en un press: los codos apenas cambian de ángulo.",
  "Press de pecho en polea":"De pie de espaldas a las poleas, con las asas a la altura del pecho y un pie algo adelantado, empuja hacia delante juntando las manos y vuelve despacio. Trabaja el pecho de pie, con el core estabilizando.",
  "Press de pecho en polea sentado":"Sentado de espaldas a las poleas con las asas a la altura del pecho, empuja hacia delante hasta casi juntar las manos y vuelve controlando. Tensión constante en todo el recorrido, a diferencia de la barra.",
  "Cruce de poleas alto":"De pie entre dos poleas altas, junta las manos por delante del pecho describiendo un arco hacia abajo con los codos algo flexionados, y vuelve despacio. Aprieta al final: es donde más se contrae el pecho.",
  "Press declinado en multipower":"Banco declinado bajo la barra guiada. Baja hasta la parte baja del pecho y empuja arriba sin bloquear de golpe. Con guía no necesitas que nadie te saque la barra en declinado.",
  "Aperturas en banco con poleas":"Tumbado en un banco plano entre dos poleas bajas, junta las manos por encima del pecho en arco con los codos algo flexionados, y baja hasta notar estiramiento. Tensión constante también arriba.",
  "Press inclinado en polea":"Tumbado en un banco inclinado entre dos poleas bajas, empuja las asas hacia arriba y adentro hasta casi juntarlas, y baja controlando. Carga la parte alta del pecho con tensión constante.",
  "Press de pecho en máquina de discos":"Sentado en la máquina de palancas con las asas a la altura del pecho, empuja hacia delante hasta casi estirar los brazos y vuelve controlando. Cada brazo va por su lado: no puedes tirar más con el fuerte.",
  "Cruce de poleas a una mano":"Con una sola polea, cruza el brazo por delante del pecho hasta pasar la línea media y vuelve despacio. A una mano llegas más lejos en el cruce y notas mucho más la contracción.",
  "Remo alto en máquina":"Sentado con el pecho apoyado en el respaldo, tira de las asas hacia atrás y algo hacia abajo llevando los codos por detrás del cuerpo, aprieta la espalda y vuelve estirando sin encorvarte. El apoyo en el pecho quita toda la carga de la lumbar.",
  "Remo en máquina a un brazo":"Igual que el remo en máquina pero tirando con un brazo cada vez, lo que te deja llegar un poco más atrás y corregir diferencias entre lados. No gires el tronco para acompañar: el pecho se queda pegado al respaldo.",
  "Remo en polea a una mano":"Sentado en la polea baja, tira del asa con una mano llevando el codo a la cadera y aprieta la espalda; vuelve estirando el brazo del todo para estirar el dorsal. Mantén el tronco quieto, sin rotar.",
  "Jalón a una mano":"Sentado en el jalón con un asa, tira hacia abajo con un brazo llevando el codo al costado, y sube controlando hasta estirar del todo. A una mano notas mejor el dorsal y corriges descompensaciones.",
  "Remo en multipower":"Con la barra guiada a la altura de las espinillas, inclina el tronco hacia delante con la espalda recta y tira de la barra hacia el ombligo. La guía te quita el trabajo de estabilizar: céntrate en apretar la espalda.",
  "Hiperextensión inversa":"Tumbado boca abajo con la cadera al borde del banco y el tronco fijo, sube las piernas juntas hasta alinearlas con el cuerpo apretando los glúteos, y baja despacio. Trabaja glúteo y lumbar sin cargar la columna.",
  "Pullover en polea inclinado":"Sentado en un banco inclinado mirando a una polea alta, baja la barra desde encima de la cabeza hasta la altura del pecho con los brazos casi estirados, y vuelve arriba controlando.",
  "Remo en polea alto":"Sentado con la polea por encima de la altura del pecho, tira de las asas hacia el pecho llevando los codos atrás y aprieta la espalda. El ángulo alto carga más la espalda alta que el remo normal.",
  "Remo en polea alta de rodillas":"De rodillas frente a la polea alta, tira de la cuerda hacia la cara llevando los codos atrás y abriendo el pecho. Trabaja dorsal y espalda alta con el core sujetando la postura.",
  "Remo en polea alta a una mano":"De rodillas frente a la polea alta, tira con un brazo llevando el codo al costado y girando ligeramente el tronco al final. A una mano llegas a un rango que con barra es imposible.",
  "Pájaros en contractora":"Sentado del revés en la contractora (la máquina de aperturas de pecho, usada al contrario), con el pecho apoyado, abre los brazos hacia atrás hasta la altura de los hombros apretando la parte trasera del hombro, y vuelve despacio. Lidera con los codos, no con las manos.",
  "Elevación frontal en polea":"De espaldas a la polea baja con el asa por delante del muslo, sube el brazo estirado hasta la altura del hombro y baja controlado. La polea mantiene la tensión desde el primer grado, a diferencia de la mancuerna.",
  "Encogimientos en máquina":"De pie o sentado en la máquina con las asas a los lados, sube los hombros hacia las orejas todo lo que puedas, aguanta un segundo arriba y baja despacio. Nada de girar los hombros: solo suben y bajan.",
  "Encogimientos en polea":"De pie frente a una polea baja con la barra en las manos y los brazos estirados, encoge los hombros hacia arriba y baja controlando. La polea da tensión constante y te permite cargar sin agarres incómodos.",
  "Press militar en multipower":"Sentado bajo la barra guiada, con las manos algo más anchas que los hombros, empuja arriba hasta casi estirar y baja hasta la barbilla. La guía evita que la barra se te vaya: útil para ir pesado sin ayuda.",
  "Rotación externa en polea":"De pie de lado a la polea, con el codo pegado al costado y doblado 90°, gira el antebrazo hacia fuera y vuelve despacio. Poco peso y muchas repeticiones: es trabajo para el manguito rotador, no para lucirse.",
  "Press de hombro en polea alterno":"Sentado o de pie entre dos poleas bajas, empuja una mano hacia arriba mientras la otra espera abajo, y alterna. Al ir alterno el core trabaja para que no te vayas de lado.",
  "Pájaros en polea a una mano":"Inclinado hacia delante con el asa de la polea baja cruzada bajo el cuerpo, abre el brazo hacia el lado hasta la altura del hombro y baja despacio. Lidera con el codo y no gires el tronco para ayudarte.",
  "Rotación interna en polea":"De lado a la polea, con el codo pegado al costado y doblado 90°, gira el antebrazo hacia dentro cruzando el ombligo y vuelve despacio. Complemento de la rotación externa: poco peso y control.",
  "Press de hombro en polea de pie":"De pie entre dos poleas bajas con las asas a la altura de los hombros, empuja hacia arriba hasta casi estirar y baja controlado. Aprieta abdomen y glúteos para no arquear la lumbar.",
  "Encogimientos en máquina de gemelos":"De pie en la máquina de gemelos con los hombros bajo las almohadillas, sube los hombros hacia las orejas y baja despacio. Aprovecha una máquina que casi nadie usa para esto y permite bastante carga.",
  "Press de hombro en máquina de discos":"Sentado con la espalda apoyada y las asas a la altura de los hombros, empuja arriba hasta casi estirar y baja controlado. Al ser independiente cada brazo, ambos hombros trabajan lo mismo.",
  "Remo al cuello en polea baja":"Sentado en la polea baja con la cuerda, tira hacia la barbilla con los codos altos y abiertos. Trabaja hombro posterior y trapecio; con poco peso y sin encoger los hombros.",
  "Encogimientos tras espalda en multipower":"De pie con la barra guiada por detrás de los glúteos, sube los hombros hacia las orejas y baja despacio. Por detrás el trapecio trabaja con el pecho abierto, mejor para la postura.",
  "Remo al mentón a una mano en multipower":"Con la barra guiada y una sola mano, tira hacia arriba pegado al cuerpo llevando el codo alto hasta la altura del pecho, y baja despacio. Si notas pinzamiento en el hombro, no subas tanto.",
  "Remo al mentón en multipower":"Con la barra guiada por delante de los muslos, tira hacia arriba pegada al cuerpo con los codos altos hasta la altura del pecho, y baja despacio. No subas por encima de los hombros: el hombro se resiente.",
  "Remo al mentón en polea":"De pie frente a la polea baja con la barra, tira hacia arriba pegada al cuerpo con los codos altos hasta la altura del pecho. Sube solo hasta donde no te moleste el hombro.",
  "Prensa con pies juntos":"Prensa con los pies juntos y centrados en la plataforma. Baja controlado sin despegar la lumbar del respaldo y empuja sin bloquear las rodillas. Al juntar los pies, el cuádriceps externo se lleva más trabajo.",
  "Extensión de cuádriceps a una pierna en máquina":"Extensión de cuádriceps trabajando una pierna cada vez. Sube hasta estirar sin bloquear de golpe, aguanta un instante arriba y baja despacio. Perfecto para igualar diferencias entre piernas.",
  "Zancada en multipower":"Con la barra guiada sobre los hombros, un pie delante y otro atrás (apoyado en un banco si quieres más rango), baja hasta que la rodilla de delante llegue a 90° y sube empujando con ese talón. La guía te quita el equilibrio de la ecuación.",
  "Pull through en polea":"De espaldas a la polea baja, con la cuerda entre las piernas, empuja la cadera hacia atrás con la espalda recta y vuelve estirando la cadera y apretando los glúteos. Es el patrón de bisagra de cadera con carga fácil de controlar.",
  "Peso muerto en polea":"De pie frente a la polea baja con la barra en las manos, baja llevando la cadera atrás con la espalda recta y sube estirando cadera y rodillas. Buena forma de aprender el peso muerto con carga ligera y guiada.",
  "Aductores en polea":"De lado a la polea baja con la tobillera en la pierna de dentro, lleva esa pierna hacia la línea media cruzando por delante de la otra, y vuelve despacio. Sujétate para no compensar con el tronco.",
  "Sentadilla en máquina":"Sentado en la máquina con la espalda apoyada y los pies en la plataforma, empuja hasta casi estirar las piernas y vuelve controlando. Es la opción más amable con la espalda para cargar el cuádriceps.",
  "Peso muerto en máquina":"En la máquina de peso muerto, con los pies firmes y la espalda recta, estira cadera y rodillas hasta ponerte de pie y baja controlando. La guía te permite cargar el patrón sin arriesgar la técnica.",
  "Sentadilla tumbada en máquina":"Tumbado en la máquina con los pies en la plataforma y la espalda apoyada, baja flexionando las rodillas y empuja sin bloquearlas del todo. Muy parecida a la prensa pero con otro ángulo de cadera.",
  "Sentadilla hack con pies juntos":"Hack squat con los pies juntos y algo adelantados. Baja hasta los muslos paralelos con la espalda pegada al respaldo y sube empujando. Con los pies juntos, el cuádriceps externo se lleva la fiesta.",
  "Prensa en multipower":"Tumbado bajo la barra guiada con los pies apoyados en ella, empuja hacia arriba estirando las piernas y baja controlando. Alternativa a la prensa cuando está ocupada.",
  "Sentadilla a una pierna en multipower":"Con la barra guiada sobre los hombros y una pierna estirada al frente, baja con la otra todo lo que controles y sube empujando con el talón. La guía hace posible la pistol sin ser un acróbata.",
  "Curl femoral de pie":"En la máquina de femoral de pie, sujétate al soporte y flexiona una rodilla llevando el talón al glúteo; baja despacio sin dejar caer el peso. Al ir pierna a pierna se nota mucho el femoral y se corrigen descompensaciones.",
  "Peso muerto rumano en multipower":"Con la barra guiada por delante de los muslos, empuja la cadera hacia atrás bajando la barra pegada a las piernas con la espalda recta, hasta notar el femoral, y sube apretando glúteos. La guía te deja centrarte en la bisagra de cadera.",
  "Curl nórdico en máquina":"En el banco de glute-ham, con los tobillos fijos, baja el cuerpo hacia delante frenando con los femorales y vuelve a subir tirando de ellos. Muy exigente: empieza con poco recorrido y ayúdate con las manos.",
  "Elevación de talones en multipower":"Con la barra guiada sobre los hombros y la punta de los pies sobre un step, sube todo lo que puedas sobre las puntas y baja despacio dejando caer el talón para estirar. La guía permite cargar bien sin problemas de equilibrio.",
  "Gemelos en máquina":"Sentado en la máquina de gemelos con las piernas casi estiradas y la punta de los pies en la plataforma, empuja hasta arriba y baja despacio buscando el estiramiento completo.",
  "Elevación de puntas (tibial)":"Con la barra guiada sobre los hombros y los talones apoyados, sube las puntas de los pies hacia ti y baja despacio. Trabaja el tibial anterior, la cara delantera de la espinilla que casi nadie entrena.",
  "Curl de bíceps en máquina":"Ajusta el asiento para que los codos queden alineados con el eje de giro, asomando apenas por el borde de la almohadilla. Agarra firme los mangos y, sin despegar la parte alta de los brazos de la almohadilla, sube despacio hasta arriba y vuelve a estirar controlando.",
  "Curl predicador en máquina":"Variante con el brazo apoyado en un banco inclinado dentro de la máquina. Sube hasta contraer del todo y baja controlando hasta casi estirar el codo. Cuidado con soltar de golpe abajo: es donde más se resiente el tendón.",
  "Curl martillo en polea":"De pie frente a la polea baja con una cuerda, sube flexionando los codos con las palmas enfrentadas (como si dieras un martillazo) y baja despacio. Trabaja bíceps y braquial, y engorda el antebrazo.",
  "Curl predicador en polea":"Con el banco predicador delante de una polea baja y los brazos apoyados, flexiona los codos hasta arriba y baja controlando casi hasta estirar. La polea mantiene tensión también abajo, donde la barra la pierde.",
  "Curl en polea alta":"De pie entre dos poleas altas con los brazos abiertos en cruz, flexiona los codos llevando las manos hacia las orejas sin bajar los brazos. Contrae mucho el bíceps en su posición más corta.",
  "Curl tumbado en polea":"Tumbado en el suelo con los pies hacia la polea baja, flexiona los codos llevando la barra a la frente sin mover los brazos. Tumbado no puedes balancearte: todo lo hace el bíceps.",
  "Curl tumbado en polea alta":"Tumbado bajo la polea alta con agarre estrecho, flexiona los codos llevando la barra hacia la frente y vuelve despacio. El ángulo trabaja el bíceps con el brazo por encima de la cabeza.",
  "Curl inverso en polea":"De pie frente a la polea baja con las palmas hacia abajo, flexiona los codos pegados al cuerpo y baja despacio. Trabaja braquial y antebrazo: necesitarás bastante menos peso del que crees.",
  "Curl en polea a una mano":"De pie de lado a la polea baja con un asa, flexiona el codo sin mover el brazo del sitio y baja controlando hasta estirar. A una mano puedes girar la muñeca al subir y apurar más la contracción.",
  "Extensión de tríceps en máquina":"Sentado con la espalda apoyada y los codos fijos en el soporte, estira los brazos empujando las asas hacia abajo y vuelve controlando. Al estar guiado, el codo no se va: ideal para apurar el tríceps sin comprometer el hombro.",
  "Fondos en máquina":"Sentado, ajusta el asiento para llegar a los mangos con comodidad y gíralos hacia dentro o hacia fuera, como te resulte mejor. Con la espalda apoyada y los codos pegados a los costados, empuja los mangos hacia abajo despacio hasta casi estirar, sin bloquear los codos, y sube controlando. Puedes ajustar el peso exacto, algo que en los fondos libres no se puede.",
  "Tríceps en polea con cuerda":"De pie frente a la polea alta con una cuerda, con los codos pegados al cuerpo, estira los brazos hacia abajo separando las manos al final y vuelve sin dejar que el codo se abra. No eches el cuerpo encima para empujar.",
  "Extensión de tríceps inclinado en polea":"Tumbado en un banco inclinado con la polea detrás de la cabeza, estira los brazos hacia arriba manteniendo los codos quietos y apuntando al techo. El ángulo estira bien la porción larga del tríceps.",
  "Press francés en polea":"Tumbado en un banco con la polea baja detrás de la cabeza, estira los brazos manteniendo los codos fijos apuntando arriba, y vuelve doblando solo el codo. La polea evita el punto muerto de la barra.",
  "Tríceps en polea a una mano":"De pie frente a la polea alta con un asa y la palma hacia arriba, estira el brazo hacia abajo con el codo pegado al costado y vuelve despacio. A una mano corriges diferencias entre brazos.",
  "Extensión de tríceps de rodillas en polea":"De rodillas y de espaldas a la polea alta, con la cuerda tras la nuca y los codos apuntando al frente, estira los brazos y vuelve despacio. De rodillas no puedes compensar con el cuerpo.",
  "Tríceps en polea agarre invertido":"En la polea alta con las palmas hacia arriba, estira los brazos hacia abajo con los codos pegados al costado. Este agarre insiste en la cabeza interna del tríceps; usa poco peso, resbala más.",
  "Press cerrado en multipower":"Press banca guiado con las manos a la anchura de los hombros y los codos pegados al cuerpo. La guía te deja apurar el tríceps sin miedo a que la barra se descuadre.",
  "Extensión de tríceps sobre cabeza en polea baja":"De pie de espaldas a la polea baja, con el codo arriba junto a la cabeza, estira el brazo hacia el techo y vuelve despacio. Estira bien la porción larga del tríceps.",
  "Extensión de tríceps sobre cabeza con cuerda":"De espaldas a la polea con la cuerda tras la nuca y los codos apuntando arriba, estira los brazos separando las manos al final. Mantén los codos quietos y cerca de la cabeza.",
  "Curl de muñeca en polea":"Sentado con los antebrazos apoyados en los muslos y las palmas hacia arriba, sujeta la barra de la polea baja y flexiona solo las muñecas, subiendo y bajando despacio. Recorrido corto y muchas repeticiones.",
  "Press Pallof":"De pie de lado a la polea, con las manos juntas a la altura del pecho, estira los brazos al frente y aguanta sin dejar que el cable te gire el tronco; vuelve despacio. No es un empuje: es aguantar la rotación, y por eso fortalece tanto el core.",
  "Leñador en polea":"Desde la polea alta y con el cuerpo de lado, tira en diagonal hacia la cadera contraria girando el tronco y dejando que el pie de atrás pivote; vuelve controlando. Trabaja los oblicuos con el giro completo del cuerpo.",
  "Crunch inverso en polea":"Tumbado con la cabeza hacia la polea baja y los tobillos enganchados, lleva las rodillas hacia el pecho enrollando la pelvis y baja despacio sin arquear la lumbar. Insiste en la parte baja del abdomen.",
  "Giro ruso en polea":"De lado a la polea con los brazos estirados a la altura del pecho, gira el tronco alejándote del cable y vuelve controlando. El giro sale del tronco, no de los brazos.",
  "Crunch en polea sentado":"Sentado de espaldas a la polea alta con la cuerda junto a la cabeza, enrolla el tronco llevando los codos hacia los muslos y vuelve despacio. Sentado te cuesta más compensar con la cadera.",
  "Crunch en polea con giro":"De rodillas frente a la polea alta con la cuerda junto a la cabeza, enrolla el tronco llevando el codo hacia la rodilla contraria, alternando lados. Suma oblicuos al crunch de polea de siempre.",
  "Flexión lateral en polea alta":"De lado a la polea alta con un asa, inclina el tronco hacia el lado contrario venciendo la resistencia y vuelve controlando. Trabaja los oblicuos sin cargar la columna con peso encima.",
  "Press Pallof con giro":"Como el press Pallof, pero al estirar los brazos giras el tronco alejándote de la polea y vuelves al centro. Suma rotación controlada al trabajo antirrotación.",
  "Elevación de cadera en multipower":"Tumbado bajo la barra guiada apoyada en la cadera, sube la pelvis apretando glúteos hasta alinear rodilla, cadera y hombro, y baja sin apoyar del todo. Pon una almohadilla: la barra molesta en la cadera.",
  "Leñador invertido en polea":"Desde la polea baja y de lado, tira en diagonal hacia arriba y hacia el hombro contrario girando el tronco, y vuelve controlando. Es el leñador al revés: de abajo hacia arriba.",
  "Crunch en polea de pie":"De pie frente a la polea alta con la cuerda junto a la cabeza, enrolla el tronco hacia abajo apretando el abdomen y vuelve despacio. Igual que el de rodillas pero sin castigar las rodillas.",
  "Bici reclinada":"Bici con respaldo y pedales por delante. Es la opción más cómoda para la espalda y la más fácil de mantener mucho rato, ideal si empiezas o vuelves de una lesión.",
  /* --- Casa con material --- */
  "Swing con kettlebell":"De pie, con los pies algo más abiertos que la cadera y la kettlebell cogida con las dos manos (o con una). Lleva la cadera atrás dejando que pase entre las piernas y estírala de golpe apretando el glúteo, para que suba hasta la altura del pecho. La fuerza sale de la cadera, no de los brazos; la espalda, recta todo el rato.",
  "Peso muerto a una pierna con kettlebell":"De pie sobre una pierna, con la kettlebell en la mano contraria. Inclina el tronco hacia delante con la espalda recta mientras la otra pierna se estira hacia atrás, hasta notar el femoral, y vuelve apretando el glúteo. Despacio: aquí el reto es el equilibrio.",
  "Remo con kettlebell":"Inclinado, con la espalda recta y la mano libre apoyada en la rodilla, tira de la kettlebell hacia la cadera llevando el codo atrás y pegado al cuerpo. Bájala controlando y cambia de lado.",
  "Press de suelo con kettlebell":"Boca arriba en el suelo, con las rodillas dobladas y la kettlebell en una mano, el codo apoyado. Empuja hacia arriba hasta estirar el brazo y baja hasta que el codo roce el suelo, sin rebotar. Sin banco: el suelo corta el recorrido y cuida el hombro.",
  "Flexiones con agarres":"Una flexión con las manos en los agarres, a la anchura de los hombros: dejan bajar más y no doblan la muñeca. Cuerpo en bloque, baja el pecho entre los agarres y empuja hasta estirar los brazos. Si cuesta, con las rodillas apoyadas.",
  "Remo sentado con goma":"Sentado en el suelo con las piernas estiradas y la goma pasada por los pies (o los pies en el pedal del tensor). Coge las asas y tira hacia el abdomen llevando los codos atrás y juntando las escápulas. Vuelve despacio, sin dejar que la goma te arrastre ni echarte hacia atrás.",
  "Curl de bíceps con goma":"De pie pisando la goma (o el pedal del tensor), con las asas en las manos y los codos pegados al cuerpo. Sube las manos hacia los hombros apretando el bíceps y baja controlando. Para más tensión, pisa más cerca de las asas.",
  "Aperturas inversas con goma":"De pie, con la goma delante a la altura del pecho y los brazos estirados. Ábrelos hacia los lados juntando las escápulas hasta que la goma llegue al pecho, y vuelve despacio. Vale la goma en 8 o la de asas.",
  "Aperturas de pie con goma":"Con la goma pasada por detrás de la espalda (o atada a la altura del pecho), los brazos abiertos y los codos algo doblados. Junta las manos delante del pecho como en un abrazo y vuelve controlando.",
  "Press de hombro con goma":"De pie pisando la goma, con las asas a la altura de los hombros. Empuja hacia arriba hasta estirar los brazos sin arquear la espalda y baja controlando hasta los hombros.",
  "Extensión de tríceps con goma":"Pisa la goma con un pie y sujeta el asa por detrás de la cabeza, con el codo apuntando al techo. Estira el brazo hacia arriba sin mover el codo y baja controlando. También con las dos manos en la misma asa.",
  "Aductores con tonificador":"Con el tonificador entre las rodillas, sentado o tumbado boca arriba con las piernas dobladas. Junta las rodillas apretando la cara interna del muslo, aguanta un segundo y abre despacio sin soltarlo.",
};

/* Imágenes de ejercicios (free-exercise-db, dominio público / Unlicense) */
const EX_IMG = {
  "Aperturas con mancuernas": "exercises/Dumbbell_Flyes/0.jpg",
  "Aperturas en polea": "exercises/Cable_Crossover/0.jpg",
  "Curl con barra": "exercises/Barbell_Curl/0.jpg",
  "Curl de bíceps": "exercises/Dumbbell_Bicep_Curl/0.jpg",
  "Curl femoral sentado": "exercises/Seated_Leg_Curl/0.jpg",
  "Curl femoral tumbado": "exercises/Lying_Leg_Curls/0.jpg",
  "Curl martillo": "exercises/Hammer_Curls/0.jpg",
  "Curl predicador": "exercises/Preacher_Curl/0.jpg",
  "Dominadas o jalón": "exercises/Pullups/0.jpg",
  "Dominadas lastradas": "exercises/Weighted_Pull_Ups/0.jpg",
  "Elevaciones laterales": "exercises/Side_Lateral_Raise/0.jpg",
  "Elevaciones laterales en polea": "exercises/Standing_Low-Pulley_Deltoid_Raise/0.jpg",
  "Elevación de talones de pie": "exercises/Standing_Calf_Raises/0.jpg",
  "Elevación de piernas": "exercises/Flat_Bench_Lying_Leg_Raise/0.jpg",
  "Elevación de piernas en barra": "exercises/Hanging_Leg_Raise/0.jpg",
  "Extensión de cuádriceps en máquina": "exercises/Leg_Extensions/0.jpg",
  "Extensión de tríceps en polea": "exercises/Triceps_Pushdown/0.jpg",
  "Face pull": "exercises/Face_Pull/0.jpg",
  "Flexiones": "exercises/Pushups/0.jpg",
  "Flexiones diamante": "exercises/Push-Ups_-_Close_Triceps_Position/0.jpg",
  "Flexiones inclinadas": "exercises/Incline_Push-Up/0.jpg",
  "Fondos en paralelas": "exercises/Dips_-_Chest_Version/0.jpg",
  "Fondos asistidos": "exercises/Dips_-_Chest_Version/0.jpg",
  "Dominada asistida": "exercises/Band_Assisted_Pull-Up/0.jpg",
  "Elevación lateral en máquina": "exercises/Seated_Side_Lateral_Raise/0.jpg",
  "Patada de glúteo en máquina": "exercises/One-Legged_Cable_Kickback/0.jpg",
  "Pulldown en máquina de discos": "exercises/Leverage_High_Row/0.jpg",
  "Jalón en máquina": "exercises/Leverage_High_Row/0.jpg",
  "Remo de deltoides posterior en máquina": "exercises/Leverage_Iso_Row/0.jpg",
  "Fondos en paralelas lastrados": "exercises/Parallel_Bar_Dip/0.jpg",
  "Jalón agarre cerrado": "exercises/Close-Grip_Front_Lat_Pulldown/0.jpg",
  "Jalón agarre neutro": "exercises/V-Bar_Pulldown/0.jpg",
  "Jalón al pecho": "exercises/Wide-Grip_Lat_Pulldown/0.jpg",
  "Mountain climbers": "exercises/Mountain_Climbers/0.jpg",
  "Peso muerto": "exercises/Barbell_Deadlift/0.jpg",
  "Peso muerto rumano": "exercises/Romanian_Deadlift/0.jpg",
  "Peso muerto rumano mancuernas": "exercises/Stiff-Legged_Dumbbell_Deadlift/0.jpg",
  "Plancha": "exercises/Plank/0.jpg",
  "Plancha con lastre": "exercises/Plank/0.jpg",
  "Prensa de piernas": "exercises/Leg_Press/0.jpg",
  "Press banca": "exercises/Barbell_Bench_Press_-_Medium_Grip/0.jpg",
  "Press francés": "exercises/Lying_Triceps_Press/0.jpg",
  "Press inclinado con barra": "exercises/Barbell_Incline_Bench_Press_-_Medium_Grip/0.jpg",
  "Press inclinado mancuernas": "exercises/Incline_Dumbbell_Press/0.jpg",
  "Press mancuernas sentado": "exercises/Seated_Dumbbell_Press/0.jpg",
  "Press militar": "exercises/Standing_Military_Press/0.jpg",
  "Press militar mancuernas": "exercises/Standing_Dumbbell_Press/0.jpg",
  "Pullover en polea": "exercises/Straight-Arm_Pulldown/0.jpg",
  "Pájaros en polea": "exercises/Cable_Rear_Delt_Fly/0.jpg",
  "Remo con barra": "exercises/Bent_Over_Barbell_Row/0.jpg",
  "Remo con mancuerna": "exercises/One-Arm_Dumbbell_Row/0.jpg",
  "Remo en máquina": "exercises/Leverage_Iso_Row/0.jpg",
  "Plancha lateral": "exercises/Side_Bridge/0.jpg",
  "Rueda abdominal": "exercises/Ab_Roller/0.jpg",
  "Sentadilla": "exercises/Barbell_Squat/0.jpg",
  "Sentadilla búlgara": "exercises/Split_Squat_with_Dumbbells/0.jpg",
  "Sentadilla frontal": "exercises/Front_Barbell_Squat/0.jpg",
  "Sentadilla goblet": "exercises/Goblet_Squat/0.jpg",
  "Zancadas con barra": "exercises/Barbell_Lunge/0.jpg",
  "Zancadas con mancuernas": "exercises/Dumbbell_Lunges/0.jpg",
  "Hip thrust": "exercises/Barbell_Hip_Thrust/0.jpg",
  "Puente de glúteo": "exercises/Butt_Lift_Bridge/0.jpg",
  "Patada de glúteo en polea": "exercises/One-Legged_Cable_Kickback/0.jpg",
  "Abductores en máquina": "exercises/Thigh_Abductor/0.jpg",
  "Aductores en máquina": "exercises/Thigh_Adductor/0.jpg",
  "Peso muerto sumo": "exercises/Sumo_Deadlift/0.jpg",
  "Sentadilla sumo con mancuerna": "exercises/Plie_Dumbbell_Squat/0.jpg",
  "Zancada caminando": "exercises/Bodyweight_Walking_Lunge/0.jpg",
  "Good morning": "exercises/Good_Morning/0.jpg",
  "Press banca mancuernas": "exercises/Dumbbell_Bench_Press/0.jpg",
  "Press Arnold": "exercises/Arnold_Dumbbell_Press/0.jpg",
  "Encogimientos": "exercises/Dumbbell_Shrug/0.jpg",
  "Curl concentrado": "exercises/Concentration_Curls/0.jpg",
  "Curl inclinado": "exercises/Incline_Dumbbell_Curl/0.jpg",
  "Extensión de tríceps sobre cabeza": "exercises/Standing_Dumbbell_Triceps_Extension/0.jpg",
  "Patada de tríceps": "exercises/Tricep_Dumbbell_Kickback/0.jpg",
  "Remo en T": "exercises/Lying_T-Bar_Row/0.jpg",
  "Remo al mentón": "exercises/Upright_Barbell_Row/0.jpg",
  "Peso muerto piernas rígidas": "exercises/Stiff-Legged_Barbell_Deadlift/0.jpg",
  "Elevación de talones sentado": "exercises/Seated_Calf_Raise/0.jpg",
  "Crunch abdominal": "exercises/Crunches/0.jpg",
  "Russian twist": "exercises/Russian_Twist/0.jpg",
  "Sentadilla hack": "exercises/Hack_Squat/0.jpg",
  "Dominada supina": "exercises/Chin-Up/0.jpg",
  "Bicicleta abdominal": "exercises/Air_Bike/0.jpg",
  /* Cardio de las rutinas de la app: ya tenían nombre pero no demostración. */
  "HIIT en bici o cinta": "exercises/Running_Treadmill/0.jpg",
  "Calentamiento en cinta o bici": "exercises/Walking_Treadmill/0.jpg",
  "Superserie de bíceps y tríceps": "exercises/Dumbbell_Bicep_Curl/0.jpg",
  /* --- Catálogo ampliado (free-exercise-db) --- */
  "Press declinado con barra": "exercises/Decline_Barbell_Bench_Press/0.jpg",
  "Contractora de pecho": "exercises/Butterfly/0.jpg",
  "Press de pecho en máquina": "exercises/Machine_Bench_Press/0.jpg",
  "Flexiones declinadas": "exercises/Decline_Push-Up/0.jpg",
  "Pullover con mancuerna": "exercises/Bent-Arm_Dumbbell_Pullover/0.jpg",
  "Hiperextensiones": "exercises/Hyperextensions_Back_Extensions/0.jpg",
  "Jalón agarre supino": "exercises/Underhand_Cable_Pulldowns/0.jpg",
  "Remo con dos mancuernas": "exercises/Bent_Over_Two-Dumbbell_Row/0.jpg",
  "Peso muerto parcial": "exercises/Rack_Pulls/0.jpg",
  "Encogimientos con barra": "exercises/Barbell_Shrug/0.jpg",
  "Elevación frontal": "exercises/Front_Dumbbell_Raise/0.jpg",
  "Press de hombro en máquina": "exercises/Machine_Shoulder_Military_Press/0.jpg",
  "Press de hombro en polea": "exercises/Seated_Cable_Shoulder_Press/0.jpg",
  "Pájaros con mancuernas": "exercises/Bent_Over_Dumbbell_Rear_Delt_Raise_With_Head_On_Bench/0.jpg",
  "Zancada inversa": "exercises/Dumbbell_Rear_Lunge/0.jpg",
  "Subida al cajón": "exercises/Dumbbell_Step_Ups/0.jpg",
  "Sentadilla en multipower": "exercises/Smith_Machine_Squat/0.jpg",
  "Sentadilla con mancuernas": "exercises/Dumbbell_Squat/0.jpg",
  "Sentadilla con salto": "exercises/Freehand_Jump_Squat/0.jpg",
  "Sentadilla sin peso": "exercises/Bodyweight_Squat/0.jpg",
  "Puente de glúteo a una pierna": "exercises/Single_Leg_Glute_Bridge/0.jpg",
  "Curl nórdico": "exercises/Natural_Glute_Ham_Raise/0.jpg",
  "Gemelo en prensa": "exercises/Calf_Press_On_The_Leg_Press_Machine/0.jpg",
  "Elevación de talones con mancuerna": "exercises/Standing_Dumbbell_Calf_Raise/0.jpg",
  "Curl en polea": "exercises/Standing_Biceps_Cable_Curl/0.jpg",
  "Curl inverso": "exercises/Reverse_Barbell_Curl/0.jpg",
  "Curl araña": "exercises/Spider_Curl/0.jpg",
  "Fondos en banco": "exercises/Bench_Dips/0.jpg",
  "Press banca agarre cerrado": "exercises/Close-Grip_Barbell_Bench_Press/0.jpg",
  "Crunch en polea": "exercises/Rope_Crunch/0.jpg",
  "Crunch en máquina": "exercises/Ab_Crunch_Machine/0.jpg",
  "Elevación de rodillas": "exercises/Bent-Knee_Hip_Raise/0.jpg",
  "Tijeras": "exercises/Flutter_Kicks/0.jpg",
  "Cinta de correr": "exercises/Running_Treadmill/0.jpg",
  "Caminar en cinta": "exercises/Walking_Treadmill/0.jpg",
  "Bici estática": "exercises/Bicycling_Stationary/0.jpg",
  "Elíptica": "exercises/Elliptical_Trainer/0.jpg",
  "Máquina de remo": "exercises/Rowing_Stationary/0.jpg",
  "Comba": "exercises/Rope_Jumping/0.jpg",
  "Escaladora": "exercises/Stairmaster/0.jpg",
  /* --- Máquinas y poleas (free-exercise-db) --- */
  "Press inclinado en máquina": "exercises/Leverage_Incline_Chest_Press/0.jpg",
  "Press declinado en máquina": "exercises/Leverage_Decline_Chest_Press/0.jpg",
  "Press banca en multipower": "exercises/Smith_Machine_Bench_Press/0.jpg",
  "Press inclinado en multipower": "exercises/Smith_Machine_Incline_Bench_Press/0.jpg",
  "Cruce de poleas bajo": "exercises/Low_Cable_Crossover/0.jpg",
  "Aperturas inclinadas en polea": "exercises/Incline_Cable_Flye/0.jpg",
  "Press de pecho en polea": "exercises/Standing_Cable_Chest_Press/0.jpg",
  "Press de pecho en polea sentado": "exercises/Cable_Chest_Press/0.jpg",
  "Cruce de poleas alto": "exercises/Cable_Iron_Cross/0.jpg",
  "Press declinado en multipower": "exercises/Decline_Smith_Press/0.jpg",
  "Aperturas en banco con poleas": "exercises/Flat_Bench_Cable_Flyes/0.jpg",
  "Press inclinado en polea": "exercises/Incline_Cable_Chest_Press/0.jpg",
  "Press de pecho en máquina de discos": "exercises/Leverage_Chest_Press/0.jpg",
  "Cruce de poleas a una mano": "exercises/Single-Arm_Cable_Crossover/0.jpg",
  "Remo alto en máquina": "exercises/Leverage_High_Row/0.jpg",
  "Remo en máquina a un brazo": "exercises/Leverage_Iso_Row/0.jpg",
  "Remo en polea a una mano": "exercises/Seated_One-arm_Cable_Pulley_Rows/0.jpg",
  "Jalón a una mano": "exercises/One_Arm_Lat_Pulldown/0.jpg",
  "Remo en multipower": "exercises/Smith_Machine_Bent_Over_Row/0.jpg",
  "Hiperextensión inversa": "exercises/Reverse_Hyperextension/0.jpg",
  "Pullover en polea inclinado": "exercises/Cable_Incline_Pushdown/0.jpg",
  "Remo en polea alto": "exercises/Elevated_Cable_Rows/0.jpg",
  "Remo en polea alta de rodillas": "exercises/Kneeling_High_Pulley_Row/0.jpg",
  "Remo en polea alta a una mano": "exercises/Kneeling_Single-Arm_High_Pulley_Row/0.jpg",
  "Pájaros en contractora": "exercises/Reverse_Machine_Flyes/0.jpg",
  "Elevación frontal en polea": "exercises/Front_Cable_Raise/0.jpg",
  "Encogimientos en máquina": "exercises/Leverage_Shrug/0.jpg",
  "Encogimientos en polea": "exercises/Cable_Shrugs/0.jpg",
  "Press militar en multipower": "exercises/Smith_Machine_Overhead_Shoulder_Press/0.jpg",
  "Rotación externa en polea": "exercises/External_Rotation_with_Cable/0.jpg",
  "Press de hombro en polea alterno": "exercises/Alternating_Cable_Shoulder_Press/0.jpg",
  "Pájaros en polea a una mano": "exercises/Bent_Over_Low-Pulley_Side_Lateral/0.jpg",
  "Rotación interna en polea": "exercises/Cable_Internal_Rotation/0.jpg",
  "Press de hombro en polea de pie": "exercises/Cable_Shoulder_Press/0.jpg",
  "Encogimientos en máquina de gemelos": "exercises/Calf-Machine_Shoulder_Shrug/0.jpg",
  "Press de hombro en máquina de discos": "exercises/Leverage_Shoulder_Press/0.jpg",
  "Remo al cuello en polea baja": "exercises/Low_Pulley_Row_To_Neck/0.jpg",
  "Encogimientos tras espalda en multipower": "exercises/Smith_Machine_Behind_the_Back_Shrug/0.jpg",
  "Remo al mentón a una mano en multipower": "exercises/Smith_Machine_One-Arm_Upright_Row/0.jpg",
  "Remo al mentón en multipower": "exercises/Smith_Machine_Upright_Row/0.jpg",
  "Remo al mentón en polea": "exercises/Upright_Cable_Row/0.jpg",
  "Prensa con pies juntos": "exercises/Narrow_Stance_Leg_Press/0.jpg",
  "Extensión de cuádriceps a una pierna en máquina": "exercises/Single-Leg_Leg_Extension/0.jpg",
  "Zancada en multipower": "exercises/Smith_Single-Leg_Split_Squat/0.jpg",
  "Pull through en polea": "exercises/Pull_Through/0.jpg",
  "Peso muerto en polea": "exercises/Cable_Deadlifts/0.jpg",
  "Aductores en polea": "exercises/Cable_Hip_Adduction/0.jpg",
  "Sentadilla en máquina": "exercises/Chair_Squat/0.jpg",
  "Peso muerto en máquina": "exercises/Leverage_Deadlift/0.jpg",
  "Sentadilla tumbada en máquina": "exercises/Lying_Machine_Squat/0.jpg",
  "Sentadilla hack con pies juntos": "exercises/Narrow_Stance_Hack_Squats/0.jpg",
  "Prensa en multipower": "exercises/Smith_Machine_Leg_Press/0.jpg",
  "Sentadilla a una pierna en multipower": "exercises/Smith_Machine_Pistol_Squat/0.jpg",
  "Curl femoral de pie": "exercises/Standing_Leg_Curl/0.jpg",
  "Peso muerto rumano en multipower": "exercises/Smith_Machine_Stiff-Legged_Deadlift/0.jpg",
  "Curl nórdico en máquina": "exercises/Glute_Ham_Raise/0.jpg",
  "Elevación de talones en multipower": "exercises/Smith_Machine_Calf_Raise/0.jpg",
  "Gemelos en máquina": "exercises/Calf_Press/0.jpg",
  "Elevación de puntas (tibial)": "exercises/Smith_Machine_Reverse_Calf_Raises/0.jpg",
  "Curl de bíceps en máquina": "exercises/Machine_Bicep_Curl/0.jpg",
  "Curl predicador en máquina": "exercises/Machine_Preacher_Curls/0.jpg",
  "Curl martillo en polea": "exercises/Cable_Hammer_Curls_-_Rope_Attachment/0.jpg",
  "Curl predicador en polea": "exercises/Cable_Preacher_Curl/0.jpg",
  "Curl en polea alta": "exercises/Overhead_Cable_Curl/0.jpg",
  "Curl tumbado en polea": "exercises/Lying_Cable_Curl/0.jpg",
  "Curl tumbado en polea alta": "exercises/Lying_Close-Grip_Bar_Curl_On_High_Pulley/0.jpg",
  "Curl inverso en polea": "exercises/Reverse_Cable_Curl/0.jpg",
  "Curl en polea a una mano": "exercises/Standing_One-Arm_Cable_Curl/0.jpg",
  "Extensión de tríceps en máquina": "exercises/Machine_Triceps_Extension/0.jpg",
  "Fondos en máquina": "exercises/Dip_Machine/0.jpg",
  "Tríceps en polea con cuerda": "exercises/Triceps_Pushdown_-_Rope_Attachment/0.jpg",
  "Extensión de tríceps inclinado en polea": "exercises/Cable_Incline_Triceps_Extension/0.jpg",
  "Press francés en polea": "exercises/Cable_Lying_Triceps_Extension/0.jpg",
  "Tríceps en polea a una mano": "exercises/Cable_One_Arm_Tricep_Extension/0.jpg",
  "Extensión de tríceps de rodillas en polea": "exercises/Kneeling_Cable_Triceps_Extension/0.jpg",
  "Tríceps en polea agarre invertido": "exercises/Reverse_Grip_Triceps_Pushdown/0.jpg",
  "Press cerrado en multipower": "exercises/Smith_Machine_Close-Grip_Bench_Press/0.jpg",
  "Extensión de tríceps sobre cabeza en polea baja": "exercises/Standing_Low-Pulley_One-Arm_Triceps_Extension/0.jpg",
  "Extensión de tríceps sobre cabeza con cuerda": "exercises/Cable_Rope_Overhead_Triceps_Extension/0.jpg",
  "Curl de muñeca en polea": "exercises/Cable_Wrist_Curl/0.jpg",
  "Press Pallof": "exercises/Pallof_Press/0.jpg",
  "Leñador en polea": "exercises/Standing_Cable_Wood_Chop/0.jpg",
  "Crunch inverso en polea": "exercises/Cable_Reverse_Crunch/0.jpg",
  "Giro ruso en polea": "exercises/Cable_Russian_Twists/0.jpg",
  "Crunch en polea sentado": "exercises/Cable_Seated_Crunch/0.jpg",
  "Crunch en polea con giro": "exercises/Kneeling_Cable_Crunch_With_Alternating_Oblique_Twists/0.jpg",
  "Flexión lateral en polea alta": "exercises/One-Arm_High-Pulley_Cable_Side_Bends/0.jpg",
  "Press Pallof con giro": "exercises/Pallof_Press_With_Rotation/0.jpg",
  "Elevación de cadera en multipower": "exercises/Smith_Machine_Hip_Raise/0.jpg",
  "Leñador invertido en polea": "exercises/Standing_Cable_Lift/0.jpg",
  "Crunch en polea de pie": "exercises/Standing_Rope_Crunch/0.jpg",
  "Bici reclinada": "exercises/Recumbent_Bike/0.jpg",
  /* Casa con material. El remo y el curl con goma no tienen demostración propia en
     free-exercise-db: usan las de polea baja, que es el mismo gesto. */
  "Swing con kettlebell": "exercises/One-Arm_Kettlebell_Swings/0.jpg",
  "Peso muerto a una pierna con kettlebell": "exercises/Kettlebell_One-Legged_Deadlift/0.jpg",
  "Remo con kettlebell": "exercises/One-Arm_Kettlebell_Row/0.jpg",
  "Press de suelo con kettlebell": "exercises/One-Arm_Kettlebell_Floor_Press/0.jpg",
  "Flexiones con agarres": "exercises/Pushups/0.jpg",
  "Remo sentado con goma": "exercises/Seated_Cable_Rows/0.jpg",
  "Curl de bíceps con goma": "exercises/Standing_Biceps_Cable_Curl/0.jpg",
  "Aperturas inversas con goma": "exercises/Band_Pull_Apart/0.jpg",
  "Aperturas de pie con goma": "exercises/Cross_Over_-_With_Bands/0.jpg",
  "Press de hombro con goma": "exercises/Shoulder_Press_-_With_Bands/0.jpg",
  "Extensión de tríceps con goma": "exercises/Speed_Band_Overhead_Triceps/0.jpg",
  "Aductores con tonificador": "exercises/Thigh_Adductor/0.jpg",
};

/* =========================================================================
   RANGOS, LOGROS, CONSEJOS
   ========================================================================= */

const RANKS = [
  { min:1,  name:"Iniciado",  color:"#8B93A7", icon:Shield },
  { min:5,  name:"Aspirante", color:"#5BA8C9", icon:Shield },
  { min:10, name:"Guerrero",  color:"#3FB984", icon:Dumbbell },
  { min:20, name:"Veterano",  color:"#E8B04B", icon:Star },
  { min:35, name:"Campeón",   color:"#E5623D", icon:Award },
  { min:50, name:"Coloso",    color:"#C77DFF", icon:Crown },
  { min:75, name:"Leyenda",   color:"#FFD700", icon:Crown },
];

/* Ficha de personaje: cada ejercicio suma XP al atributo de su parte del cuerpo */
/* Cuántas SESIONES incluyen cada ejercicio. No cuenta series: lo que interesa
   es "cuál es su ejercicio", y repetir 4 series el mismo día no lo convierte en
   favorito. Se sube junto a las marcas para poder señalarlo en la ficha. */
/* Series completadas de un entreno. Los registros viejos (anteriores a que se
   guardara el contador) no traen `series`, así que se cuentan de sus ejercicios
   en vez de enseñar un cero que no es verdad. */
function seriesDe(rec){
  if(Number.isFinite(rec?.series)) return rec.series;
  // OJO: en el registro guardado los logs YA vienen filtrados a las series
  // hechas (finishWorkout hace .filter(l=>l.done)) y en el filtrado se pierde
  // el propio campo `done`. Buscarlo aquí daba siempre 0.
  return (rec?.exercises || []).reduce((a, ex) => a + (ex.logs?.length || 0), 0);
}

function sesionesPorEjercicio(log){
  const n = {};
  (log||[]).forEach(rec=>(rec.exercises||[]).forEach(ex=>{
    // Mismo motivo que en seriesDe: los logs guardados ya son solo los hechos,
    // y no conservan `done`. Con la comprobación puesta, `veces` subía siempre
    // a 0 y la estrella de "su ejercicio favorito" no se encendía nunca.
    if(!ex?.name || !ex.logs?.length) return;
    n[ex.name] = (n[ex.name] || 0) + 1;
  }));
  return n;
}

const BODY_MAP = {
  "Pecho":"Pecho", "Espalda":"Espalda", "Pierna":"Piernas", "Femoral":"Piernas", "Gemelo":"Piernas",
  "Hombro":"Hombros", "Bíceps":"Brazos", "Tríceps":"Brazos", "Brazo":"Brazos", "Core":"Core", "Cardio":"Aguante",
};
const BODY_STATS = [
  { id:"Pecho",   icon:Shield,     color:"var(--crimson)", sub:"Press, aperturas, fondos" },
  { id:"Espalda", icon:Swords,     color:"var(--mana)",    sub:"Dominadas, remos, jalones" },
  { id:"Piernas", icon:Footprints, color:"var(--jade)",    sub:"Sentadilla, peso muerto, prensa" },
  { id:"Hombros", icon:Mountain,   color:"var(--gold)",    sub:"Press militar, elevaciones" },
  { id:"Brazos",  icon:Dumbbell,   color:"var(--ember)",   sub:"Curls y tríceps" },
  { id:"Core",    icon:Flame,      color:"var(--arcane)",  sub:"Plancha, rueda, abdominales" },
  { id:"Aguante", icon:Heart,      color:"#E56B9F",        sub:"Cardio y resistencia" },
];

/* Ejercicios del programa agrupados por atributo de la ficha (para explorar/recomendar). */
const EXERCISES_BY_GROUP = {};
Object.entries(EX_MUSCLE).forEach(([name, muscle])=>{ const g=BODY_MAP[muscle]; if(!g) return; if(!EXERCISES_BY_GROUP[g]) EXERCISES_BY_GROUP[g]=[]; if(!EXERCISES_BY_GROUP[g].includes(name)) EXERCISES_BY_GROUP[g].push(name); });

/* =========================================================================
   RUTINAS PROPIAS (configurador)
   Misma forma que las rutinas de la app ({ id, name, days:[{ name, exercises }] })
   para que startWorkout, la XP por músculo y el historial funcionen igual.
   Se guardan por perfil en "gym:routines" y entran en la copia de seguridad.
   ========================================================================= */
const CUSTOM_CAT = "Mis rutinas";
/* Catálogo de ejercicios seleccionable, agrupado por atributo de la ficha. */
const EX_POOL_BY_GROUP = BODY_STATS.map(s=>({ group:s.id, color:s.color, icon:s.icon,
  items:[...(EXERCISES_BY_GROUP[s.id]||[])].sort((a,b)=>a.localeCompare(b,"es")) })).filter(g=>g.items.length);

/* Busca una rutina tanto en el catálogo de la app como en las del usuario. */
function findRoutine(id, customRoutines){
  return ROUTINES.find(r=>r.id===id) || (customRoutines||[]).find(r=>r.id===id) || null;
}
function newRoutineId(){ return "mine_" + Date.now().toString(36) + Math.random().toString(36).slice(2,6); }
function blankCustomRoutine(){
  return { id:newRoutineId(), custom:true, cat:CUSTOM_CAT, name:"", subtitle:"", rpe:"7-8", blurb:"",
    daysPerWeek:1, createdAt:todayISO(), days:[{ name:"Día 1", exercises:[] }] };
}
/* Rellena lo que falte y recalcula lo derivado (músculo de cada ejercicio, días/semana).
   Las rutinas viejas o una copia de seguridad manipulada no deben poder romper la app. */
function normalizeCustomRoutine(r){
  const days = (Array.isArray(r?.days) ? r.days : []).map((d,i)=>({
    name: String(d?.name || `Día ${i+1}`).slice(0,40),
    // Una rutina que llega de un amigo con la app sin actualizar trae nombres viejos.
    exercises: (Array.isArray(d?.exercises) ? d.exercises : [])
      .map(ex=>ex && { ...ex, name:nombreActual(ex.name) })
      .filter(ex=>ex && EX_MUSCLE[ex.name])
      .map(ex=>({ name:ex.name, sets:Math.max(1,Math.min(10,Number(ex.sets)||3)),
        reps:String(ex.reps || defaultReps(ex.name)).slice(0,12),
        rest:Math.max(0,Math.min(600,Number(ex.rest) ?? defaultRest(ex.name))),
        muscle:EX_MUSCLE[ex.name] })),
  }));
  const clean = days.length ? days : [{ name:"Día 1", exercises:[] }];
  /* `origen` marca de quién es la rutina original. Sin él la copia no sabría a
     quién seguir y se quedaría congelada en la versión del día que se importó. */
  const origen = r?.origen?.ownerId && r?.origen?.clientId
    ? { ownerId:String(r.origen.ownerId), clientId:String(r.origen.clientId), updatedAt:r.origen.updatedAt || null }
    : undefined;
  return { ...r, custom:true, cat:CUSTOM_CAT, id:r?.id || newRoutineId(), privada:!!r?.privada, origen,
    name:String(r?.name || "Mi rutina").slice(0,40),
    subtitle:String(r?.subtitle || "").slice(0,60),
    rpe:String(r?.rpe || "7-8"), blurb:String(r?.blurb || "").slice(0,300),
    days:clean, daysPerWeek:clean.length };
}
/* =========================================================================
   COMPARTIR RUTINAS ENTRE USUARIOS (sin servidor)
   La app no tiene backend, así que una rutina se comparte como un CÓDIGO DE
   TEXTO que se manda por WhatsApp/Telegram/donde sea y se pega en la otra app.
   Igual que la copia de seguridad: solo texto, sin plugins ni llamadas a nadie.

   Formato:  RPGYM-R1.<base64url del JSON>
   El JSON guarda solo lo imprescindible; el músculo, la técnica, la imagen y el
   peso base NO viajan: los pone el receptor desde su propio catálogo. Así el
   código es corto y, si el otro tiene otra versión de la app, todo sigue
   cuadrando. Los ejercicios van POR NOMBRE (no por índice) a propósito: un
   índice se rompería en cuanto el catálogo creciera.
   Nada de datos personales: no viaja tu nombre, ni tus marcas, ni tu historial.
   ========================================================================= */
const SHARE_PREFIX = "RPGYM-R1.";

function b64urlEncode(str){
  const bytes = new TextEncoder().encode(str);
  let bin = ""; bytes.forEach(b => { bin += String.fromCharCode(b); });
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64urlDecode(s){
  let b64 = String(s).replace(/-/g, "+").replace(/_/g, "/");
  while(b64.length % 4) b64 += "=";                       // atob es quisquilloso con el relleno
  const bin = atob(b64);
  return new TextDecoder().decode(Uint8Array.from(bin, c => c.charCodeAt(0)));
}

/* Rutina -> código compartible. */
function encodeRoutine(r){
  const payload = {
    v: 1,
    n: String(r.name || "Rutina").slice(0, 40),
    s: String(r.subtitle || "").slice(0, 60),
    r: String(r.rpe || "7-8"),
    b: String(r.blurb || "").slice(0, 300),
    d: (r.days || []).map(day => [
      String(day.name || "").slice(0, 40),
      (day.exercises || []).map(e => [e.name, Number(e.sets) || 3, String(e.reps || ""), Number(e.rest) || 0]),
    ]),
  };
  return SHARE_PREFIX + b64urlEncode(JSON.stringify(payload));
}

/* Código -> rutina lista para guardar. Devuelve también los ejercicios que este
   móvil no conoce (si el que la comparte tiene una versión más nueva). */
function decodeRoutine(text, existingNames){
  const raw = String(text || "").trim();
  if(!raw) return { ok:false, msg:"Pega aquí el código que te han pasado." };
  // Admite que peguen el código con texto alrededor ("mira mi rutina: RPGYM-R1.xxxx")
  const m = raw.match(/RPGYM-R1\.([A-Za-z0-9_-]+)/);
  if(!m) return { ok:false, msg:"Eso no parece un código de rutina de RPGym. Debe empezar por RPGYM-R1." };
  let obj;
  try { obj = JSON.parse(b64urlDecode(m[1])); }
  catch { return { ok:false, msg:"El código está incompleto o se ha cortado al copiarlo. Pide que te lo manden otra vez entero." }; }
  if(!obj || typeof obj !== "object" || !Array.isArray(obj.d)) return { ok:false, msg:"El código no se entiende: puede ser de otra versión de la app." };

  const desconocidos = [];
  const days = obj.d.map((day, i) => {
    const [dName, exs] = Array.isArray(day) ? day : ["", []];
    const exercises = (Array.isArray(exs) ? exs : []).map(e => {
      const [nombre, sets, reps, rest] = Array.isArray(e) ? e : [];
      const name = nombre && nombreActual(nombre);
      if(!name || !EX_MUSCLE[name]){ if(name) desconocidos.push(String(name)); return null; }
      return { name, sets, reps, rest, muscle:EX_MUSCLE[name] };
    }).filter(Boolean);
    return { name: dName || `Día ${i+1}`, exercises };
  }).filter(d => d.exercises.length);

  if(!days.length) return { ok:false, msg:"La rutina llega vacía: ninguno de sus ejercicios existe en tu versión de la app." };

  // Nombre libre: si ya tienes una que se llama igual, no la pisamos.
  let name = String(obj.n || "Rutina compartida").slice(0, 40);
  const usados = new Set(existingNames || []);
  if(usados.has(name)){
    let n = 2; while(usados.has(`${name} (${n})`) && n < 50) n++;
    name = `${name} (${n})`.slice(0, 40);
  }
  const routine = normalizeCustomRoutine({
    id: newRoutineId(), name, subtitle: obj.s || "", rpe: obj.r || "7-8", blurb: obj.b || "",
    imported: true, createdAt: todayISO(), days,
  });
  return { ok:true, routine, desconocidos:[...new Set(desconocidos)] };
}

/* Series semanales por grupo que sumaría la rutina (avisa de excesos antes de entrenar). */
function routineWeeklySets(routine){
  const acc={};
  (routine?.days||[]).forEach(d=>(d.exercises||[]).forEach(ex=>{
    const g=BODY_MAP[ex.muscle||EX_MUSCLE[ex.name]]; if(!g) return;
    acc[g]=(acc[g]||0)+(Number(ex.sets)||0);
  }));
  return acc;
}

/* Escala del Poder total (suma de niveles de los 7 atributos; mínimo 7). Da "ámbito" al número. */
const POWER_TIERS = [
  { min:7,   name:"Recluta" },
  { min:14,  name:"Forjado" },
  { min:24,  name:"Curtido" },
  { min:38,  name:"Guerrero" },
  { min:56,  name:"Coloso" },
  { min:84,  name:"Leyenda" },
];
function powerTier(power){
  let i=0; for(let k=0;k<POWER_TIERS.length;k++){ if(power>=POWER_TIERS[k].min) i=k; }
  const cur=POWER_TIERS[i], next=POWER_TIERS[i+1]||null;
  const pct = next ? Math.round(((power-cur.min)/(next.min-cur.min))*100) : 100;
  return { name:cur.name, min:cur.min, next: next?next.name:null, nextAt: next?next.min:null, rem: next?next.min-power:0, pct };
}

const ACHIEVEMENTS = [
  { id:"primer_paso", title:"Primer paso", desc:"Completa tu primer entrenamiento", xp:50, icon:Play },
  { id:"diez_ses", title:"Rodado", desc:"10 entrenamientos completados", xp:150, icon:Dumbbell },
  { id:"treinta_ses", title:"Máquina", desc:"30 entrenamientos completados", xp:400, icon:Zap },
  { id:"cincuenta_ses", title:"Imparable", desc:"50 entrenamientos completados", xp:700, icon:Flame },
  { id:"cien_ses", title:"Centurión", desc:"100 entrenamientos completados", xp:1500, icon:Crown },
  { id:"primer_pr", title:"Récord roto", desc:"Consigue tu primer récord personal", xp:75, icon:TrendingUp },
  { id:"pr_5", title:"Día de gloria", desc:"5 récords personales en una sola sesión", xp:250, icon:Star },
  /* Series, no kilos. Los kilos premian al que ya levanta mucho y no dicen nada
     del esfuerzo del día; las series son las que se pueden decidir en el
     momento: "me queda una, la hago". */
  { id:"series_20", title:"Currante", desc:"20 series en una sesión", xp:100, icon:Target },
  { id:"series_30", title:"Sin freno", desc:"30 series en una sesión", xp:300, icon:Target },
  { id:"series_500", title:"Media vida aquí", desc:"500 series completadas en total", xp:600, icon:Target },
  { id:"semana_ok", title:"Semana perfecta", desc:"Cumple tu objetivo semanal por primera vez", xp:120, icon:Check },
  { id:"racha_4", title:"Constante", desc:"4 semanas seguidas cumpliendo el objetivo", xp:500, icon:Flame },
  { id:"racha_8", title:"Inquebrantable", desc:"8 semanas seguidas cumpliendo el objetivo", xp:1000, icon:Flame },
  { id:"nivel_10", title:"Guerrero", desc:"Alcanza el nivel 10", xp:300, icon:Star },
  { id:"nivel_20", title:"Veterano", desc:"Alcanza el nivel 20", xp:600, icon:Award },
  { id:"nivel_35", title:"Campeón", desc:"Alcanza el nivel 35", xp:1200, icon:Crown },
  { id:"fuerza_x2", title:"El doble de fuerte", desc:"Dobla el peso en cualquier ejercicio", xp:350, icon:Crown },
  { id:"explorador", title:"Explorador", desc:"Prueba 5 rutinas distintas", xp:200, icon:Compass },
  { id:"madrugador", title:"Madrugador", desc:"Entrena antes de las 8:00", xp:80, icon:Sunrise },
  { id:"nocturno", title:"Ave nocturna", desc:"Entrena después de las 22:00", xp:80, icon:Moon },
  { id:"medidor", title:"Bajo control", desc:"Registra tu peso 4 veces", xp:120, icon:Ruler },
];

const TIPS = [
  "Baja el peso en 2-3 segundos: la fase negativa es donde más músculo se construye.",
  "Respira: coge aire al bajar, suelta al empujar. Nunca aguantes en una repetición máxima.",
  "No puedes quemar grasa de una zona concreta. La barriga baja con déficit global y constancia.",
  "Si acabas la serie y podías hacer 4-5 más, sube peso la próxima vez.",
  "El músculo crece descansando, no entrenando. Duerme 7-8 h para ver resultados.",
  "Prioriza proteína en cada comida: es lo que repara y construye tras entrenar.",
  "Aprieta el core en sentadilla y peso muerto como si fueras a recibir un puñetazo.",
  "La constancia gana a la perfección. Un entreno mediocre hecho supera al perfecto que no haces.",
  "Bebe agua durante la sesión: una ligera deshidratación ya baja tu fuerza.",
  "Registra tus pesos. Ver que la barra sube semana a semana es la mejor motivación.",
  "Calienta el ejercicio pesado con 1-2 series ligeras antes de ir a por todas.",
  "Rango completo > peso extra. Baja del todo y estira el músculo en cada rep.",
  "El scale miente en recomposición: pierdes grasa y ganas músculo, así que fíjate en el espejo y la ropa.",
  "Si un día no tienes fuerza, usa el modo de energía baja. Entrenar poco es infinitamente mejor que no entrenar.",
  "No hagas cardio en ayunas pensando que quema más grasa: lo que cuenta es el total del día.",
  "Deja 24-48 h antes de volver a machacar el mismo músculo.",
  "Controla el descanso: 60-90 s para hipertrofia, 2-3 min para fuerza pesada.",
  "Cuida los hombros: en press militar no arquees la espalda, aprieta glúteos.",
  "La grasa pectoral se reduce igual que el resto: fuerza + déficit + tiempo. No hay atajos localizados.",
  "Un buen desayuno con proteína te quita el hambre de media mañana y protege tu músculo.",
  "La técnica primero. El ego con el peso es la vía rápida a una lesión que te para semanas.",
  "Camina 8-10k pasos al día: es el cardio silencioso que más ayuda a la recomposición.",
  "Progresa poco a poco: +2,5 kg o +1 repetición ya es progreso real.",
  "Si te aburres, cambia de rutina, no de objetivo. La variedad mantiene la cabeza dentro.",
  "El estrés y la falta de sueño suben el cortisol y frenan la pérdida de grasa. Descansa de verdad.",
  "Los días de descanso están para gastarlos sin culpa: descansar también es entrenar.",
];

/* Consejos específicos para rutinas de recomposición (se muestran en el descanso). */
const RECOMP_TIPS = [
  "En recomposición la báscula miente: pierdes grasa y ganas músculo a la vez. Fíjate en tu fuerza y tus medidas.",
  "La cintura bajando es mejor señal que el número de la báscula.",
  "Recomposición = déficit ligero + proteína alta + fuerza. Es lento, pero el cambio es permanente.",
  "Camina 8-10k pasos al día: el cardio silencioso que más ayuda a recomponer.",
  "Prioriza proteína en cada comida para perder grasa sin perder músculo.",
  "Compara fotos y medidas cada 3-4 semanas, no cada día. Así se ve el progreso real.",
  "Mantén los pesos (o súbelos) mientras estás en déficit: es la señal de que conservas el músculo.",
];

/* Consejos de dieta para perfil femenino (tarjeta cerrable y cíclica en Dieta). Sin cifras. */
const FEMALE_DIET_TIPS = [
  "Prioriza una fuente de proteína en cada comida: protege tu músculo y te mantiene saciada.",
  "Incluye alimentos ricos en hierro (espinacas, legumbres, carne roja, marisco): las necesidades suelen ser mayores.",
  "El calcio y la vitamina D cuidan tus huesos, sobre todo si entrenas fuerza.",
  "Ajusta las raciones a tu apetito y objetivo. No hay alimentos prohibidos, solo cantidades.",
  "Cerca de la regla puedes notar más hambre o cansancio: escúchate y ajusta sin culpa.",
  "Reparte la proteína a lo largo del día en varias comidas para aprovecharla mejor.",
];

/* =========================================================================
   COMIDAS (con ingredientes para la lista de la compra)
   grupos: Proteína · Verduras y fruta · Hidratos · Lácteos y huevos · Despensa
   ========================================================================= */

const G = { P:"Proteína", V:"Verduras y fruta", H:"Hidratos", L:"Lácteos y huevos", D:"Despensa" };

const MEALS = [
  // Desayunos
  { cat:"Desayuno", name:"Tostada de aguacate y huevo", tag:"Rápido",
    ing:[["Pan integral",G.H],["Aguacate",G.V],["Huevos",G.L]] },
  { cat:"Desayuno", name:"Yogur con avena, fruta y nueces", tag:"Frío",
    ing:[["Yogur griego",G.L],["Avena",G.H],["Fruta de temporada",G.V],["Nueces",G.D]] },
  { cat:"Desayuno", name:"Tortilla de espinacas y queso", tag:"Proteico",
    ing:[["Huevos",G.L],["Espinacas",G.V],["Queso",G.L]] },
  { cat:"Desayuno", name:"Porridge de avena y plátano", tag:"Caliente",
    ing:[["Avena",G.H],["Leche",G.L],["Plátano",G.V],["Canela",G.D]] },
  { cat:"Desayuno", name:"Pan con tomate, jamón y aceite", tag:"Clásico",
    ing:[["Pan integral",G.H],["Tomate",G.V],["Jamón serrano",G.P],["Aceite de oliva",G.D]] },
  { cat:"Desayuno", name:"Batido de avena, cacao y cacahuete", tag:"Post-entreno",
    ing:[["Leche",G.L],["Avena",G.H],["Cacao",G.D],["Crema de cacahuete",G.D],["Plátano",G.V]] },
  { cat:"Desayuno", name:"Revuelto de huevo, pavo y champiñones", tag:"Proteico",
    ing:[["Huevos",G.L],["Pavo",G.P],["Champiñones",G.V]] },
  // Comidas
  { cat:"Comida", name:"Pollo, arroz y verduras salteadas", tag:"Base",
    ing:[["Pechuga de pollo",G.P],["Arroz",G.H],["Verduras variadas",G.V]] },
  { cat:"Comida", name:"Salmón al horno con patata y ensalada", tag:"Omega-3",
    ing:[["Salmón",G.P],["Patata",G.H],["Ensalada",G.V]] },
  { cat:"Comida", name:"Lentejas estofadas con verduras", tag:"Legumbre",
    ing:[["Lentejas",G.P],["Zanahoria",G.V],["Cebolla",G.V],["Pimiento",G.V]] },
  { cat:"Comida", name:"Ternera con quinoa y brócoli", tag:"Rojo",
    ing:[["Ternera magra",G.P],["Quinoa",G.H],["Brócoli",G.V]] },
  { cat:"Comida", name:"Pasta integral con atún y tomate", tag:"Rápido",
    ing:[["Pasta integral",G.H],["Atún",G.P],["Tomate natural",G.V]] },
  { cat:"Comida", name:"Garbanzos con espinacas y huevo", tag:"Legumbre",
    ing:[["Garbanzos",G.P],["Espinacas",G.V],["Huevos",G.L]] },
  { cat:"Comida", name:"Wok de pavo, arroz y verdura", tag:"Wok",
    ing:[["Pavo",G.P],["Arroz",G.H],["Verduras para wok",G.V]] },
  { cat:"Comida", name:"Bacalao con puré y guisantes", tag:"Pescado",
    ing:[["Bacalao",G.P],["Patata",G.H],["Guisantes",G.V]] },
  { cat:"Comida", name:"Pollo al curry con arroz basmati", tag:"Sabroso",
    ing:[["Pechuga de pollo",G.P],["Arroz basmati",G.H],["Leche de coco",G.D],["Curry",G.D]] },
  // Cenas
  { cat:"Cena", name:"Crema de calabacín + tortilla", tag:"Ligero",
    ing:[["Calabacín",G.V],["Cebolla",G.V],["Huevos",G.L]] },
  { cat:"Cena", name:"Ensalada de pollo y aguacate", tag:"Frío",
    ing:[["Pechuga de pollo",G.P],["Aguacate",G.V],["Lechuga",G.V],["Semillas",G.D]] },
  { cat:"Cena", name:"Merluza con verduras al horno", tag:"Pescado",
    ing:[["Merluza",G.P],["Calabacín",G.V],["Pimiento",G.V]] },
  { cat:"Cena", name:"Revuelto de setas y gambas", tag:"Rápido",
    ing:[["Setas",G.V],["Gambas",G.P],["Huevos",G.L]] },
  { cat:"Cena", name:"Tacos de lechuga con pavo", tag:"Low-carb",
    ing:[["Pavo picado",G.P],["Lechuga",G.V],["Tomate",G.V]] },
  { cat:"Cena", name:"Sopa de verduras + hummus", tag:"Ligero",
    ing:[["Verduras para sopa",G.V],["Pan integral",G.H],["Hummus",G.D]] },
  { cat:"Cena", name:"Tortilla de patata y ensalada", tag:"Clásico",
    ing:[["Patata",G.H],["Huevos",G.L],["Cebolla",G.V],["Ensalada",G.V]] },
  { cat:"Cena", name:"Dorada a la plancha con espárragos", tag:"Pescado",
    ing:[["Dorada",G.P],["Espárragos",G.V]] },
  // Snacks
  { cat:"Snack", name:"Yogur griego con arándanos", tag:"Proteico",
    ing:[["Yogur griego",G.L],["Arándanos",G.V]] },
  { cat:"Snack", name:"Frutos secos y fruta", tag:"Energía",
    ing:[["Frutos secos",G.D],["Fruta de temporada",G.V]] },
  { cat:"Snack", name:"Requesón con miel y nueces", tag:"Proteico",
    ing:[["Requesón",G.L],["Miel",G.D],["Nueces",G.D]] },
  { cat:"Snack", name:"Zanahoria con hummus", tag:"Verde",
    ing:[["Zanahoria",G.V],["Hummus",G.D]] },
  { cat:"Snack", name:"Tortitas de arroz con cacahuete", tag:"Rápido",
    ing:[["Tortitas de arroz",G.H],["Crema de cacahuete",G.D]] },
  { cat:"Snack", name:"Batido de proteína con plátano", tag:"Post-entreno",
    ing:[["Proteína en polvo",G.D],["Plátano",G.V],["Leche",G.L]] },
  // --- Menús adicionales (más variedad y platos completos) ---
  { cat:"Desayuno", name:"Tortitas de avena con huevo y fruta", tag:"Proteico",
    ing:[["Avena",G.H],["Huevos",G.L],["Fruta de temporada",G.V],["Miel",G.D]] },
  { cat:"Desayuno", name:"Bol de yogur, granola, semillas y fruta", tag:"Completo",
    ing:[["Yogur griego",G.L],["Granola",G.H],["Semillas",G.D],["Fruta de temporada",G.V]] },
  { cat:"Desayuno", name:"Tostada integral con hummus y huevo duro", tag:"Vegetal",
    ing:[["Pan integral",G.H],["Hummus",G.D],["Huevos",G.L]] },
  { cat:"Comida", name:"Salteado de ternera, arroz integral y verduras", tag:"Hierro",
    ing:[["Ternera magra",G.P],["Arroz integral",G.H],["Verduras variadas",G.V]] },
  { cat:"Comida", name:"Guiso de garbanzos con bacalao y espinacas", tag:"Legumbre",
    ing:[["Garbanzos",G.P],["Bacalao",G.P],["Espinacas",G.V]] },
  { cat:"Comida", name:"Boniato relleno de pavo y verduras", tag:"Saciante",
    ing:[["Boniato",G.H],["Pavo",G.P],["Verduras variadas",G.V]] },
  { cat:"Comida", name:"Ensalada de lentejas, atún y huevo", tag:"Completo",
    ing:[["Lentejas",G.P],["Atún",G.P],["Huevos",G.L],["Ensalada",G.V]] },
  { cat:"Comida", name:"Arroz integral con pollo y verduras al wok", tag:"Base",
    ing:[["Arroz integral",G.H],["Pechuga de pollo",G.P],["Verduras para wok",G.V]] },
  { cat:"Cena", name:"Salmón con boniato y brócoli", tag:"Omega-3",
    ing:[["Salmón",G.P],["Boniato",G.H],["Brócoli",G.V]] },
  { cat:"Cena", name:"Revuelto de espinacas, gambas y patata", tag:"Hierro",
    ing:[["Espinacas",G.V],["Gambas",G.P],["Patata",G.H],["Huevos",G.L]] },
  { cat:"Cena", name:"Pollo a la plancha con quinoa y verduras", tag:"Proteico",
    ing:[["Pechuga de pollo",G.P],["Quinoa",G.H],["Verduras variadas",G.V]] },
  { cat:"Snack", name:"Chocolate negro y almendras", tag:"Antojo",
    ing:[["Chocolate negro",G.D],["Almendras",G.D]] },
  { cat:"Snack", name:"Tostada integral con aguacate y pavo", tag:"Salado",
    ing:[["Pan integral",G.H],["Aguacate",G.V],["Pavo",G.P]] },
  { cat:"Snack", name:"Edamame con sésamo", tag:"Vegetal",
    ing:[["Edamame",G.P],["Sésamo",G.D]] },
];

const MEAL_CATS = ["Desayuno", "Comida", "Cena", "Snack"];

/* =========================================================================
   DIETA PROPIA (la que te ha pautado tu dietista-nutricionista)
   Texto libre por comida y día: la app NO la interpreta ni calcula nada, solo la
   guarda y la muestra. Se guarda por perfil en "gym:customdiet" y entra en la copia.
   ========================================================================= */
/* Comidas de un día en un plan pautado (las vacías no se muestran). */
const CUSTOM_MEAL_SLOTS = ["Desayuno", "Media mañana", "Comida", "Merienda", "Cena", "Recena"];
const DAY_NAMES_ES = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];
const DAY_SHORT_ES = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];
const emptyCustomDay = () => Object.fromEntries(CUSTOM_MEAL_SLOTS.map(c=>[c,""]));
function blankCustomDiet(){
  return { enabled:false, name:"", author:"", note:"", shopping:"", updatedAt:todayISO(),
    days:Array.from({ length:7 }, emptyCustomDay) };
}
/* Rellena lo que falte (versiones antiguas o copia de seguridad incompleta). */
function normalizeCustomDiet(d){
  const base = blankCustomDiet();
  if(!d || typeof d !== "object") return base;
  const days = Array.from({ length:7 }, (_,i)=>{
    const src = Array.isArray(d.days) ? d.days[i] : null;
    const out = emptyCustomDay();
    if(src && typeof src === "object") CUSTOM_MEAL_SLOTS.forEach(c=>{ out[c] = String(src[c] || "").slice(0,600); });
    return out;
  });
  return { ...base, ...d, enabled:!!d.enabled,
    name:String(d.name||"").slice(0,60), author:String(d.author||"").slice(0,60),
    note:String(d.note||"").slice(0,600), shopping:String(d.shopping||"").slice(0,2000), days };
}
const customDietHasContent = d => !!d && d.days?.some(day=>CUSTOM_MEAL_SLOTS.some(c=>(day[c]||"").trim()));
const GROUP_ORDER = [G.P, G.V, G.H, G.L, G.D];
const GROUP_COLOR = { [G.P]:"#E5623D", [G.V]:"#3FB984", [G.H]:"#E8B04B", [G.L]:"#5BA8C9", [G.D]:"#C77DFF" };

/* =========================================================================
   HELPERS
   ========================================================================= */

/* Fechas SIEMPRE en hora local.
   OJO: `new Date("2026-08-24T00:00:00")` se interpreta como medianoche LOCAL, así que
   `toISOString()` la pasa a UTC y en España (UTC+1/+2) devuelve el DÍA ANTERIOR. Encadenar
   dos helpers así desplazaba el calendario dos días y descuadraba los días de entreno en
   Inicio. Usa isoOf()/parseISO() y no vuelvas a meter toISOString() para fechas de día. */
function isoOf(d){ return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; }
function parseISO(iso){ const [y,m,d]=String(iso).slice(0,10).split("-").map(Number); return new Date(y,(m||1)-1,d||1); }
const todayISO = () => isoOf(new Date());
function mondayOf(dateStr){ const d=parseISO(dateStr); const day=(d.getDay()+6)%7; d.setDate(d.getDate()-day); return isoOf(d); }
function weeksBetween(a,b){ return Math.floor((parseISO(b)-parseISO(a))/(7*864e5)); }
const weekdayOfISO = iso => parseISO(iso).getDay(); // 0=Dom..6=Sáb

/* Días de entreno por defecto cuando el perfil aún no ha elegido ninguno (L · X · V).
   Se usa el MISMO fallback en toda la app para que racha, misiones y objetivo semanal
   cuenten siempre lo mismo. */
const DEFAULT_TRAIN_DAYS = [1,3,5];
/* Inicial de cada día indexada por getDay() (0=Dom..6=Sáb) */
const DAY_LETTERS = ["D","L","M","X","J","V","S"];
const plannedDaysOf = state => { const d = state?.reminders?.days; return (d && d.length) ? d : DEFAULT_TRAIN_DAYS; };
/* Sesiones que cuentan para el objetivo semanal: manda lo que el usuario ha marcado en
   Ajustes (sus días de entreno); si no ha marcado nada, los días que propone la rutina. */
function weeklyGoalFor(state, routine){
  const d = state?.reminders?.days;
  if (!(d && d.length)) return routine?.daysPerWeek || DEFAULT_TRAIN_DAYS.length;
  /* Sale de `resumenSemana` a propósito, aunque solo se quiera el número: es la
     única forma de que el objetivo, la racha, las misiones y el informe cuenten
     LO MISMO cuando hay vacaciones o un día de descanso canjeado. */
  return resumenSemana([], d, mondayOf(todayISO()), semanaOpts(state)).previstos;
}

/* --- DESCANSO Y VACACIONES ---------------------------------------------------
   Dos formas de bajar el listón de una semana sin perder la racha:

   · **Día de descanso** (`restTokens`, antes "cheat day"): se gana cumpliendo la
     semana y se canjea para que ESA semana exija una sesión menos. Uno por
     semana como mucho — si se pudieran encadenar, una semana entera se borraría
     de un plumazo y la racha dejaría de significar nada.
   · **Vacaciones**: un rango de días en el que directamente no hay sesiones
     previstas. Se guarda la LISTA de rangos, no solo el último, para que la
     racha siga saliendo bien al recalcularla meses después.

   La regla de fondo es la de siempre: se cuenta el hábito, no el calendario. */
const enVacacion = (vacs, iso) => (vacs||[]).some(v => v && v.from && v.to && iso >= v.from && iso <= v.to);
const vacacionDeHoy = vacs => (vacs||[]).find(v => v && v.from && v.to && todayISO() >= v.from && todayISO() <= v.to) || null;

/* Todo lo que modifica cuántas sesiones exige una semana, en un solo objeto.
   Pásalo SIEMPRE que llames a resumenSemana desde una vista. */
function semanaOpts(state){
  return { descansos: state?.restWeeks || {}, vacaciones: state?.vacations || [] };
}

/* Racha de hábito que RESPETA los días de descanso: cuenta los días planificados
   (reminders.days) cumplidos de forma consecutiva; los días de descanso no rompen la
   racha ni suman. El día de hoy, si aún no has entrenado, no rompe (el día no ha acabado). */
/* --- REDENCIÓN ---------------------------------------------------------------
   Lo que cuenta es CUÁNTAS veces vas a la semana, no qué días. Si te saltas el
   lunes y lo recuperas el sábado, la semana está cumplida y la racha sigue: a
   veces no se puede ir y se recupera otro día, y castigar eso solo hace que la
   gente abandone.

   Antes bastaba con fallar un día planificado para romper la racha, aunque esa
   semana acabaras yendo las veces previstas. */

/* Cómo va una semana concreta. `lunesISO` es el lunes de esa semana.
   `opts` = { descansos, vacaciones } (ver `semanaOpts`): sin ellos cuenta los
   días previstos a pelo, que es lo que hacía antes. */
function resumenSemana(log, plannedDays, lunesISO, opts = {}){
  const planned = (plannedDays && plannedDays.length) ? plannedDays : DEFAULT_TRAIN_DAYS;
  const trained = new Set((log||[]).map(r=>r.date));
  const hoy = todayISO();
  const dias = Array.from({ length:7 }, (_,i)=>addDaysISO(lunesISO, i));
  const vacs = opts.vacaciones || [];
  // Un día previsto que cae en vacaciones simplemente no se prevé.
  const deVacaciones = dias.filter(d=>planned.includes(weekdayOfISO(d)) && enVacacion(vacs, d)).length;
  const brutos = dias.filter(d=>planned.includes(weekdayOfISO(d)) && !enVacacion(vacs, d)).length;
  const perdonados = Math.min(brutos, (opts.descansos || {})[lunesISO] || 0);
  const previstos = Math.max(0, brutos - perdonados);
  const hechos = dias.filter(d=>trained.has(d)).length;
  // Días que aún se pueden usar para recuperar (hoy incluido).
  const porVenir = dias.filter(d=>d >= hoy && !trained.has(d)).length;
  const enCurso = lunesISO <= hoy && addDaysISO(lunesISO,6) >= hoy;
  return {
    previstos, hechos, enCurso, perdonados,
    vacaciones: deVacaciones > 0,
    faltan: Math.max(0, previstos - hechos),
    cumplida: hechos >= previstos,
    // Aún salvable: quedan días suficientes para llegar a lo previsto.
    recuperable: enCurso && porVenir >= Math.max(0, previstos - hechos),
  };
}

/* Racha de hábito. Cuenta días entrenados hacia atrás y se corta en la primera
   semana YA CERRADA que acabó por debajo de lo previsto. La semana en curso no
   rompe nada: todavía estás a tiempo de recuperar. */
function habitStreak(log, plannedDays, opts = {}){
  const trained = new Set((log||[]).map(r=>r.date));
  let streak = 0, lunes = opts.desde || mondayOf(todayISO());   // `desde`: la racha tal como estaba esa semana
  for(let semana=0; semana<120; semana++){
    const r = resumenSemana(log, plannedDays, lunes, opts);
    if(!r.enCurso && !r.cumplida) break;          // semana cerrada y fallida: aquí se corta
    // Semana vacía y cerrada: corta, SALVO que estuvieras de vacaciones. Volver
    // de dos semanas fuera y encontrarte la racha a cero es justo lo que hace
    // que no vuelvas.
    if(!r.hechos && !r.enCurso && !r.vacaciones) break;
    for(let i=0;i<7;i++) if(trained.has(addDaysISO(lunes,i))) streak++;
    lunes = addDaysISO(lunes, -7);
  }
  return streak;
}

/* Para las misiones y el objetivo: cuenta VECES, no días concretos. */
function weekPlannedStatus(log, plannedDays, opts = {}){
  const r = resumenSemana(log, plannedDays, mondayOf(todayISO()), opts);
  return { plannedThisWeek:r.previstos, trainedPlanned:Math.min(r.hechos, r.previstos) };
}
/* Contexto para evaluar las misiones semanales. */
function missionContext(state, log){
  const ws=state.weekStart;
  const groups=Object.keys(weeklySetsByGroup(log, ws)).length;
  const { plannedThisWeek, trainedPlanned }=weekPlannedStatus(log, state.reminders?.days, semanaOpts(state));
  return { weekPRs:state.weekPRs||0, weekGroups:groups, plannedThisWeek, trainedPlanned };
}
/* --- INFORME SEMANAL ---------------------------------------------------------
   Lo que ha pasado en una semana concreta. Se calcula AL VUELO a partir del
   historial: no se guarda ningún informe, así que restaurar una copia o corregir
   el nombre de un ejercicio se refleja solo, sin informes viejos que arrastren
   datos que ya no son ciertos.

   Todo lo de aquí sale del móvil. La actividad de los amigos se pide aparte a la
   nube (`cloud.novedades`), porque sin cuenta o sin red el informe tiene que
   seguir saliendo entero: tus números no dependen de nadie. */

const domingoDe = lunesISO => addDaysISO(lunesISO, 6);

/* "25 – 31 de agosto" · "29 de septiembre – 5 de octubre" cuando cambia el mes. */
function rangoSemanaTexto(lunesISO){
  const a = parseISO(lunesISO), b = parseISO(domingoDe(lunesISO));
  const mesA = MONTHS_ES[a.getMonth()].toLowerCase(), mesB = MONTHS_ES[b.getMonth()].toLowerCase();
  if (mesA === mesB && a.getFullYear() === b.getFullYear()) return `${a.getDate()} – ${b.getDate()} de ${mesB}`;
  return `${a.getDate()} de ${mesA} – ${b.getDate()} de ${mesB}`;
}

/* Series por grupo muscular dentro de un rango cerrado de fechas.
   `weeklySetsByGroup` no sirve aquí: no tiene tope superior y se llevaría por
   delante todo lo entrenado después de la semana que se está mirando. */
function setsPorGrupoEnRango(log, desde, hasta){
  const acc = {};
  (log||[]).forEach(rec=>{
    if(rec.date < desde || rec.date > hasta) return;
    Object.entries(setsToGroups(rec)).forEach(([k,v])=>acc[k]=(acc[k]||0)+v);
  });
  return acc;
}

/* Récords de peso conseguidos en una semana.
   Se recorre el historial en orden y se compara con la mejor marca ANTERIOR,
   igual que hace `finishWorkout`: la primera vez que haces un ejercicio no es
   récord, es la marca de partida. Recalcularlo así (en vez de guardar la lista)
   es lo que permite pedir el informe de cualquier semana pasada. */
function recordsDeSemana(log, desde, hasta){
  const mejor = {}; const out = [];
  [...(log||[])].sort((a,b)=>a.date.localeCompare(b.date)).forEach(rec=>{
    if(rec.date > hasta) return;
    const enSemana = rec.date >= desde;
    (rec.exercises||[]).forEach(ex=>{
      if(isCardio(ex.name)) return;                       // el cardio tiene sus propias marcas
      (ex.logs||[]).forEach(l=>{
        const w = parseFloat(l.weight)||0; if(w<=0) return;
        const prev = mejor[ex.name];
        if(prev == null){ mejor[ex.name] = w; return; }    // marca de partida, no récord
        if(w > prev){
          mejor[ex.name] = w;
          if(enSemana){
            const ya = out.find(r=>r.name===ex.name);
            if(ya) ya.now = w; else out.push({ name:ex.name, prev, now:w, unit:"kg" });
          }
        }
      });
    });
  });
  return out;
}

/* Informe completo de la semana que empieza en `lunesISO`. */
function informeSemanal({ log, state, measures, lunesISO, plannedDays }){
  const desde = lunesISO, hasta = domingoDe(lunesISO);
  const enRango = d => d >= desde && d <= hasta;
  const sesiones = (log||[]).filter(r=>enRango(r.date)).sort((a,b)=>a.date.localeCompare(b.date));
  const resumen = resumenSemana(log, plannedDays, lunesISO, semanaOpts(state));

  const series = sesiones.reduce((a,r)=>a + seriesDe(r), 0);
  const xp = sesiones.reduce((a,r)=>a + (r.xp||0), 0);
  const ejercicios = new Set();
  sesiones.forEach(r=>(r.exercises||[]).forEach(e=>{ if(e.logs?.length) ejercicios.add(e.name); }));

  const sets = setsPorGrupoEnRango(log, desde, hasta);
  const porGrupo = BODY_STATS.map(g=>({ ...g, sets:sets[g.id]||0 })).filter(g=>g.sets>0).sort((a,b)=>b.sets-a.sets);

  const records = recordsDeSemana(log, desde, hasta);
  /* Cardio: se mira la fecha del récord vigente. No se puede reconstruir el
     historial de marcas de cardio como el de kilos (el registro no guarda si el
     objetivo iban en minutos o en segundos), así que aquí sale la marca que
     SIGUE en pie y se consiguió esa semana. Si después la batiste, aparece en el
     informe de la semana en que la batiste, que es donde toca. */
  const cardio = Object.entries(state.cardioBests||{})
    .filter(([,r])=>r && r.date && enRango(r.date))
    .map(([name,r])=>({ name, rec:r }));

  const logros = ACHIEVEMENTS.filter(a=>{ const d=(state.achievements||{})[a.id]; return d && enRango(d); });

  const medidas = (measures||[]).filter(m=>enRango(m.date));
  const anterior = (measures||[]).filter(m=>m.date < desde).slice(-1)[0] || null;
  const ultima = medidas.slice(-1)[0] || null;
  const deltaPeso = (ultima && anterior && ultima.weightKg && anterior.weightKg)
    ? Math.round((ultima.weightKg - anterior.weightKg)*10)/10 : null;

  return { lunes:lunesISO, domingo:hasta, rango:rangoSemanaTexto(lunesISO), enCurso:resumen.enCurso,
    sesiones, resumen, series, xp, ejercicios:[...ejercicios], porGrupo, records, cardio, logros,
    medidas, ultima, deltaPeso };
}

/* Titular del informe: una frase que resume la semana sin regañar a nadie.
   La semana en curso nunca se da por perdida — es la misma regla de la racha. */
function titularSemana(inf){
  const { resumen:r, enCurso, sesiones } = inf;
  // Vacaciones: no había nada previsto, así que no hay nada que reprochar.
  if(r.vacaciones && r.previstos === 0) return { color:"var(--sky)", txt: sesiones.length
    ? `Semana de vacaciones y aun así entrenaste ${sesiones.length} ${sesiones.length===1?"vez":"veces"}. Eso es de nota.`
    : "Semana de vacaciones. Descansar forma parte del plan: la racha sigue intacta." };
  if(!sesiones.length) return enCurso
    ? { color:"var(--muted)", txt:"Semana en blanco de momento. Todavía estás a tiempo." }
    : { color:"var(--muted)", txt:"Esa semana no entrenaste. Pasa: lo que cuenta es la siguiente." };
  if(r.cumplida) return { color:"var(--jade)",
    txt: r.hechos > r.previstos
      ? `Semana cumplida y con ${r.hechos - r.previstos} sesión${r.hechos-r.previstos===1?"":"es"} de propina.`
      : "Semana cumplida: fuiste las veces que te habías propuesto." };
  if(enCurso && r.recuperable) return { color:"var(--gold)",
    txt:`Te ${r.faltan===1?"falta":"faltan"} ${r.faltan} ${r.faltan===1?"sesión":"sesiones"}. Cualquier día vale para recuperarlas.` };
  if(enCurso) return { color:"var(--ember)", txt:`Ya no da tiempo a las ${r.previstos} de esta semana, pero lo que sumes ahora cuenta igual.` };
  return { color:"var(--ember)", txt:`Te quedaste en ${r.hechos} de ${r.previstos}. Sumaste igual: entrenar poco gana a no entrenar.` };
}

/* Actividad del círculo agrupada por persona, con los eventos sueltos aparte.
   La entrada son las filas de la vista `novedades`, que ya solo trae amigos. */
function resumirCirculo(novedades){
  const gente = {}; const quedadas = []; const nuevos = [];
  (novedades||[]).forEach(n=>{
    if(n.tipo === "quedada"){ quedadas.push(n); return; }
    if(n.tipo === "amistad"){ nuevos.push(n); return; }
    const g = gente[n.id] || (gente[n.id] = { id:n.id, handle:n.handle, nombre:n.display_name || "@"+n.handle, entrenos:0, prs:0, xp:0 });
    g.entrenos += 1; g.prs += n.prs||0; g.xp += n.xp||0;
  });
  const lista = Object.values(gente).sort((a,b)=>b.entrenos-a.entrenos || b.xp-a.xp);
  return { lista, quedadas, nuevos };
}

const round25 = n => Math.max(0, Math.round(n/2.5)*2.5);
function parseTargetReps(reps){
  const t=String(reps).trim();
  const range=t.match(/^(\d+)\s*-\s*(\d+)/); if(range) return range[2];   // "12-15" -> 15 (objetivo del rango; coincide con la cabecera y activa la progresión al alcanzarlo)
  if(/(^|\s)(s|seg|min|máx)/i.test(t) || /\ds\b/i.test(t)) return "";       // "45 s", "8 min", "máx"
  const single=t.match(/^(\d+)/); return single? single[1] : "";           // "12", "10/pierna" -> 12/10
}

/* Multiplicador del peso SUGERIDO la primera vez (sin historial), según el RPE de la rutina.
   En acondicionamiento (RPE 6-7) se arranca notablemente más ligero para aprender técnica. */
function startWeightMult(rpe){
  const s=String(rpe||"");
  if(s.includes("6")) return 0.65;   // 6-7 · acondicionamiento (principiante)
  if(s.includes("7")) return 0.82;   // 7-8 · recomposición
  return 1.0;                        // 8-9+ · hipertrofia/fuerza
}
/* Ajuste del peso inicial sugerido según el peso corporal (una persona más ligera arranca más ligera).
   Solo afecta a la PRIMERA sugerencia (sin historial). Acotado a ±25%. */
function bodyweightFactor(weightKg, sex){
  const w = Number(weightKg);
  if(!w || w<=0) return 1;
  const ref = sex==="mujer" ? 62 : 78;   // peso corporal de referencia (kg)
  return Math.max(0.75, Math.min(1.25, w/ref));
}
const ENERGY = { alto:{ mult:1.05, label:"Con ganas", icon:Flame }, normal:{ mult:1.0, label:"Normal", icon:Gauge }, bajo:{ mult:0.9, label:"Cansado", icon:Moon } };

const pick = arr => arr[Math.floor(Math.random()*arr.length)];

/* Saludo según la hora. Motivador pero con guasa: nada de épica medieval.
   Cada frase funciona sola y también seguida de ", {nombre}", así que se evitan
   las que terminan en signo de exclamación o en una palabra que chirríe con la coma. */
const SALUDOS = {
  // 00:00 - 05:59 · o hay mucha disciplina, o algo ha salido raro
  madrugada: [
    "El gimnasio vacío es el mejor gimnasio",
    "A estas horas nadie te quita la máquina",
    "O mucha disciplina, o poco sueño",
    "Madrugar cuesta menos que arrepentirse",
    "Los que dicen que no tienen tiempo siguen durmiendo",
    "Hoy no hay cola en el rack",
  ],
  // 06:00 - 11:59 · quitárselo de encima temprano
  manana: [
    "Hazlo ahora y el resto del día es tuyo",
    "El mejor momento para empezar fue ayer",
    "Café, y a mover hierro",
    "Empieza fuerte y presume luego",
    "Nadie ha vuelto nunca del gimnasio arrepentido",
    "Hoy tu yo de dentro de un mes te lo agradece",
    "Un día menos de excusas",
  ],
  // 12:00 - 19:59 · la franja de las excusas
  tarde: [
    "El sofá seguirá ahí cuando vuelvas",
    "Suelta el móvil, coge la barra",
    "Una hora hoy, cero excusas mañana",
    "Lo difícil es entrar por la puerta; lo demás va solo",
    "El descanso sabe mejor después",
    "Que el día no se te vaya entero en cosas de otros",
    "Ninguna serie se hace sola",
  ],
  // 20:00 - 23:59 · tarde pero has venido
  noche: [
    "Tarde, pero has venido. Eso ya te distingue",
    "Cierra el día haciendo algo por ti",
    "Los resultados no miran el reloj",
    "Mejor a deshora que nunca",
    "El día no cuenta hasta que levantas algo",
    "Última oportunidad de que hoy cuente",
  ],
};

function greetingFor(name){
  const h = new Date().getHours();
  const franja = h < 6 ? "madrugada" : h < 12 ? "manana" : h < 20 ? "tarde" : "noche";
  const g = pick(SALUDOS[franja]);
  const nm = name && name !== "Atleta" ? name.trim() : "";
  // Solo se añade el nombre si la frase no termina ya en punto: "…te distingue, Dani" chirría.
  if (!nm || /[.!?]$/.test(g) || g.includes(". ")) return g;
  return `${g}, ${nm}`;
}

function cumXpForLevel(level){ let t=0; for(let k=1;k<level;k++) t+=100+(k-1)*50; return t; }
function levelFromXp(xp){ let l=1; while(cumXpForLevel(l+1)<=xp) l++; return l; }
function rankFor(level){ let r=RANKS[0]; for(const x of RANKS) if(level>=x.min) r=x; return r; }
function recommendedPhase(startDate){ const w=weeksBetween(startDate,todayISO()); if(w<3) return PHASES[0]; if(w<11) return PHASES[1]; return PHASES[2]; }
function catCumXp(level){ let t=0; for(let k=1;k<level;k++) t+=80+(k-1)*40; return t; }
function catLevel(xp){ let l=1; while(catCumXp(l+1)<=(xp||0)) l++; return l; }
function addDaysISO(iso,n){ const d=parseISO(iso); d.setDate(d.getDate()+n); return isoOf(d); }
function setsToGroups(rec){ const out={}; (rec.exercises||[]).forEach(e=>{ const m=e.muscle||EX_MUSCLE[e.name]; const g=BODY_MAP[m]; if(!g) return; out[g]=(out[g]||0)+(e.logs?e.logs.length:0); }); return out; }
function weeklySetsByGroup(log, weekStart){ const acc={}; (log||[]).forEach(rec=>{ if(rec.date>=weekStart){ const g=setsToGroups(rec); Object.entries(g).forEach(([k,v])=>acc[k]=(acc[k]||0)+v); } }); return acc; }
function groupsTrainedOn(log, dateStr){ const s=new Set(); (log||[]).forEach(rec=>{ if(rec.date===dateStr) Object.keys(setsToGroups(rec)).forEach(g=>s.add(g)); }); return [...s]; }

/* ---- Notificaciones locales y renovación de la cuota ----
   Usa el bridge global de Capacitor (NO importes el plugin: rompería el bundle web).
   Los avisos reales solo funcionan en la app instalada (APK). */
const LN = () => (typeof window !== "undefined" && window.Capacitor?.Plugins?.LocalNotifications) || null;
async function ensureNotifPerm(){
  const ln = LN();
  if (ln) { try { const r = await ln.requestPermissions(); return r.display === "granted"; } catch { return false; } }
  if (typeof Notification !== "undefined") { try { return (await Notification.requestPermission()) === "granted"; } catch { return false; } }
  return false;
}
function nextRenewalDate(day){
  const now = new Date(); let y = now.getFullYear(), m = now.getMonth();
  if (now.getDate() >= day) { m++; if (m > 11) { m = 0; y++; } }
  const dim = new Date(y, m + 1, 0).getDate();
  return isoOf(new Date(y, m, Math.min(day, dim)));
}
function daysUntil(iso){ return Math.round((parseISO(iso) - parseISO(todayISO())) / 864e5); }
/* --- Aviso de fin de descanso ------------------------------------------------
   El cronómetro de pantalla no basta: fuera de la app no se pinta nada y el sistema
   puede congelarla. En el APK lo lleva el plugin nativo `Entreno`
   (android/.../EntrenoPlugin.java): un servicio en primer plano y una alarma que
   suena aunque la app haya muerto. Va por el bridge global, como el resto. */
const EN = () => (typeof window !== "undefined" && window.Capacitor?.Plugins?.Entreno) || null;
let permisoPedido = false;

/* --- Versión web (sin Capacitor) ---------------------------------------------
   Tu amiga con iPhone usa la app desde el navegador, así que el aviso tiene que
   salir por otro camino: el service worker. Solo funciona con la web AÑADIDA A
   LA PANTALLA DE INICIO — en una pestaña normal iOS no deja notificar. Y aun
   así iOS puede suspender el service worker si sales de la app, por eso el
   pop-up de descanso vibra y suena también por su cuenta. */
async function swListo(){
  if (typeof navigator === "undefined" || !navigator.serviceWorker) return null;
  try { return await navigator.serviceWorker.ready; } catch { return null; }
}
async function programarAvisoDescansoWeb(hasta){
  if (typeof Notification === "undefined") return;
  const reg = await swListo(); if (!reg) return;
  if (Notification.permission === "default") {
    if (!permisoPedido) { permisoPedido = true; try { await Notification.requestPermission(); } catch {} }
  }
  if (Notification.permission !== "granted") return;
  reg.active?.postMessage({ tipo:"avisar-en", ms: hasta - Date.now(), tag:"descanso",
    titulo:"Descanso terminado 💪", cuerpo:"A por la siguiente serie." });
}
async function cancelarAvisoDescansoWeb(){
  const reg = await swListo(); if (!reg) return;
  reg.active?.postMessage({ tipo:"cancelar-aviso", tag:"descanso" });
  try { (await reg.getNotifications({ tag:"descanso" })).forEach(n => n.close()); } catch {}
}

/* Programar y cancelar son asíncronos, y entre serie y serie se disparan casi a
   la vez: React desmonta el descanso anterior (cancela) y monta el siguiente
   (programa). Sin ponerlos en fila, el cancelar del viejo llegaba DESPUÉS del
   programar del nuevo y se lo llevaba por delante — y ese descanso ya no
   avisaba. Una cola de uno los ordena. */
let colaAviso = Promise.resolve();
function enFila(fn){ colaAviso = colaAviso.then(fn, fn); return colaAviso; }

/* Recibe la HORA de fin, no los segundos que faltan: se repite sin desplazarse al
   volver a la pantalla o al recuperar el entreno. */
async function programarAvisoDescanso(hasta){
  const en = EN();
  if (!en) return enFila(()=>programarAvisoDescansoWeb(hasta));   // navegador
  return enFila(async ()=>{ try { await en.descanso({ hasta }); } catch {} });
}
async function cancelarAvisoDescanso(){
  const en = EN();
  if (!en) return enFila(cancelarAvisoDescansoWeb);
  return enFila(async ()=>{ try { await en.cancelarDescanso(); } catch {} });
}

const CANAL_RECORDATORIOS = "recordatorios";
let canalRecordatoriosCreado = false;
async function asegurarCanalRecordatorios(){
  const ln = LN(); if (!ln || canalRecordatoriosCreado) return;
  canalRecordatoriosCreado = true;
  try {
    await ln.createChannel({
      id: CANAL_RECORDATORIOS,
      name: "Recordatorios de entreno",
      description: "Tus días de entreno y el aviso de la cuota del gimnasio.",
      importance: 4,          // alta, pero un punto por debajo del descanso
      visibility: 1,
      vibration: true,
    });
  } catch {}
}

async function scheduleAllReminders(reminders, sub, vacations){
  const ln = LN(); if (!ln) return;   // el aviso real solo funciona en la app instalada
  await asegurarCanalRecordatorios();
  try { await ln.cancel({ notifications: Array.from({ length: 40 }, (_, i) => ({ id: i + 1 })) }); } catch {}
  const notifs = [];
  /* allowWhileIdle en TODOS: sin él el plugin programa la alarma como RTC (que
     ni despierta el móvil) y Android la aplaza mientras está en reposo. Un
     recordatorio de las 19:00 que llega a las 19:40 ya no recuerda nada. */
  /* De vacaciones no se avisa de entrenar. Como la alarma semanal se repite,
     no se puede "saltar" un rango: o se programa o no. Al volver, la propia
     app las reprograma en cuanto se abre (loadProfileData la llama). */
  if (reminders?.enabled && !vacacionDeHoy(vacations)) {
    (reminders.days || []).forEach((d, i) => {
      notifs.push({ id: i + 1, title: "Hora de entrenar 💪",
        body: "Tu sesión de hoy te espera. ¡Vamos a por ella!",
        channelId: CANAL_RECORDATORIOS, autoCancel: true,
        schedule: { on: { weekday: (d % 7) + 1, hour: reminders.hour, minute: reminders.minute }, repeats: true, allowWhileIdle: true } });
    });
  }
  if (sub?.enabled && sub.renewalDay) {
    const next = nextRenewalDate(sub.renewalDay); const warn = addDaysISO(next, -3);
    notifs.push({ id: 30, title: "Cuota del gym en 3 días",
      body: `El ${next.slice(8,10)}/${next.slice(5,7)} se renueva tu suscripción. Si no vas a seguir, cancélala a tiempo.`,
      channelId: CANAL_RECORDATORIOS, autoCancel: true,
      schedule: { at: new Date(warn + "T10:00:00"), allowWhileIdle: true } });
  }
  if (notifs.length) { try { await ln.schedule({ notifications: notifs }); } catch (e) { console.error(e); } }
}

const DEFAULT_STATE = {
  profile:{ name:"Atleta", age:null, weightKg:74, heightCm:178, sex:"no_especificado", units:"kg", experience:"principiante", goal:"iniciarse", onboarded:false },
  xp:0, restTokens:0, totalWorkouts:0, weekStreak:0,
  weekStart:mondayOf(todayISO()), weeklyCount:0, weekGoalMet:false,
  activeRoutine:"acli_fb", lastWorkoutDate:null, startDate:todayISO(),
  achievements:{}, bests:{}, firstBests:{}, routinesUsed:[], measureCount:0, muscleXp:{}, avatar:null,
  reminders:{ enabled:false, hour:19, minute:0, days:[1,3,5] }, // días 0=Dom..6=Sáb
  sub:{ enabled:false, renewalDay:1, price:"" },
  cardioBests:{},               // récords de cardio por ejercicio: { min, km, kcal, level, pace, date }
  bestStreak:0,                 // récord de racha de hábito (días)
  weekPRs:0,                    // récords personales conseguidos esta semana
  nextWeight:{},                // progresión: peso sugerido para la próxima sesión por ejercicio
  missions:{ week:null, claimed:[] }, // misiones semanales completadas (por semana)
  cycle:{ enabled:false, lastPeriodStart:null, cycleLength:28, periodLength:5 }, // ciclo menstrual (opt-in)
  restWeeks:{},                 // lunes -> sesiones perdonadas esa semana (máximo 1)
  vacations:[],                 // rangos { from, to } en los que no se prevé entrenar
};

/* =========================================================================
   CICLO MENSTRUAL (opt-in, solo perfil femenino)
   Orientación general de bienestar/rendimiento, NO consejo médico. Cada cuerpo
   es distinto. Fases y su manejo basados en el patrón hormonal típico.
   ========================================================================= */
const CYCLE_PHASES = {
  menstruacion: {
    id:"menstruacion", label:"Menstruación", short:"Regla", color:"var(--crimson)", energy:"bajo",
    training:"Escucha a tu cuerpo: intensidad baja o moderada. El movimiento suave y el cardio ligero suelen aliviar las molestias. Descansar sin culpa también es entrenar.",
    diet:[
      "Prioriza el hierro (carne roja, espinacas, legumbres, marisco) para reponer lo que pierdes.",
      "Acompaña el hierro con vitamina C (cítricos, pimiento, kiwi): se absorbe mucho mejor.",
      "Magnesio y omega-3 (frutos secos, semillas, pescado azul) ayudan con los dolores.",
      "Hidrátate bien y baja un poco la sal para notar menos hinchazón.",
    ],
  },
  folicular: {
    id:"folicular", label:"Fase folicular", short:"Folicular", color:"var(--jade)", energy:"alto",
    training:"Tu mejor momento: sube el estrógeno y tienes más energía, fuerza y recuperación. Ideal para entrenar pesado, buscar récords y meter volumen.",
    diet:[
      "Tu cuerpo tolera bien los carbohidratos: aprovéchalos para rendir en los entrenos fuertes.",
      "Prioriza proteína en cada comida para aprovechar esta fase de construcción.",
      "Verduras frescas y alimentos fermentados sientan especialmente bien ahora.",
    ],
  },
  ovulatoria: {
    id:"ovulatoria", label:"Ovulación", short:"Ovulación", color:"var(--gold)", energy:"normal",
    training:"Sigues con mucha fuerza, pero la laxitud de los ligamentos sube un poco: calienta bien y cuida la técnica en los pesos altos.",
    diet:[
      "Fibra y antioxidantes (verduras crucíferas, frutas del bosque) acompañan bien esta fase.",
      "Mantén una buena hidratación y alimentos antiinflamatorios.",
      "Proteína de calidad para sostener el rendimiento.",
    ],
  },
  lutea: {
    id:"lutea", label:"Fase lútea", short:"Lútea", color:"var(--arcane)", energy:"bajo",
    training:"Puede que notes más fatiga y calor corporal. Baja un punto la intensidad, prioriza técnica y volumen moderado. Buen momento para una semana suave si toca.",
    diet:[
      "Los antojos son normales: tira de carbohidratos complejos (avena, boniato) que sacian más.",
      "Magnesio (chocolate negro, semillas) y vitamina B6 ayudan con el síndrome premenstrual.",
      "Prioriza proteína saciante y reduce sal, cafeína y azúcar para la hinchazón y el ánimo.",
    ],
  },
};
/* Calcula la fase del ciclo para una fecha. Devuelve null si no hay consentimiento/datos. */
function cyclePhaseFor(cycle, dateISO){
  if(!cycle?.enabled || !cycle.lastPeriodStart) return null;
  const len = Math.max(21, Math.min(40, cycle.cycleLength||28));
  const pLen = Math.max(2, Math.min(10, cycle.periodLength||5));
  const days = Math.round((parseISO(dateISO) - parseISO(cycle.lastPeriodStart))/864e5);
  // El módulo proyecta la fase también hacia atrás (el ciclo es periódico); el calendario es una estimación.
  const dayInCycle = ((days % len) + len) % len;
  const day = dayInCycle + 1;                 // día del ciclo, 1-indexado
  const ovul = Math.max(pLen+2, len - 14);    // ovulación ≈ len-14 (fase lútea ~fija)
  let key;
  if(day <= pLen) key = "menstruacion";
  else if(day < ovul-1) key = "folicular";
  else if(day <= ovul+1) key = "ovulatoria";
  else key = "lutea";
  return { ...CYCLE_PHASES[key], key, day, len, ovul, cycleStart: cycle.lastPeriodStart };
}

/* Misiones semanales (dan XP; se reinician cada lunes). No duplican el objetivo semanal (+200 XP). */
const WEEKLY_MISSIONS = [
  { id:"pr", title:"Rompe un récord", desc:"Consigue al menos 1 récord personal esta semana", xp:80, icon:TrendingUp,
    check:c=>c.weekPRs>=1 },
  { id:"variado", title:"Cuerpo variado", desc:"Entrena 4 grupos musculares distintos esta semana", xp:100, icon:Swords,
    check:c=>c.weekGroups>=4 },
  { id:"sinfaltar", title:"Sin faltar", desc:"Entrena tantas veces como te has propuesto esta semana. El día da igual: si fallas uno, recupéralo otro", xp:120, icon:Flame,
    check:c=>c.plannedThisWeek>0 && c.trainedPlanned>=c.plannedThisWeek },
];

/* Prefijo de almacenamiento según el perfil activo (multi-usuario).
   El primer perfil (p1) usa claves sin prefijo para conservar datos previos. */
let STORE_PREFIX = "";
function setStorePrefix(id){ STORE_PREFIX = (!id || id==="p1") ? "" : id+":"; }

async function loadKey(key, fb){ try{ const r=await window.storage.get(STORE_PREFIX+key); return r?JSON.parse(r.value):fb; }catch{ return fb; } }
async function saveKey(key, val){ try{ await window.storage.set(STORE_PREFIX+key, JSON.stringify(val)); }catch(e){ console.error(e); } }
/* URL pública de la política de privacidad (obligatoria en Google Play).
   El texto vive en public/privacidad.html: súbelo a un hosting estático y pega aquí la
   URL. Mientras esté vacío, Ajustes muestra solo el resumen, sin enlace roto. */
const PRIVACY_URL = "";

/* XP extra la primera vez que haces la rutina de un amigo. Fijo y modesto:
   premia probar lo de otro, no repetirlo en bucle. */
const XP_RUTINA_AMIGO = 75;

/* XP extra por entrenar acompañado. FIJO y pequeño a propósito: si fuera
   proporcional al volumen, saldría a cuenta apuntarse a todo para inflar XP. */
const XP_CONJUNTO = 60;

/* Versión de esta build. La inyecta vite.config.js desde android/version.properties:
   es lo que se compara con app_versions para avisar de que hay una nueva. Antes se
   escribía a mano aquí, y en la 1.0.20 se quedó en 20 con la fila en 21: la app
   avisaba de una actualización a quien ya la tenía instalada. */
const APP_VERSION_CODE = __VERSION_CODE__;
const APP_VERSION_NAME = __VERSION_NAME__;

/* VERSIÓN ALT: la misma app sin el juego (ni mazmorra, ni héroe, ni XP a la vista,
   ni estética pixel). Se decide al COMPILAR (`vite build --mode alt`, ver
   vite.config.js) y sale como otro APK con el mismo paquete y la misma firma: se
   instala encima del normal y conserva todos los datos, y al revés igual.
   Por dentro todo sigue contando igual (XP, ramas, llaves...): así quien vuelva a
   la versión RPG lo encuentra todo como si nunca se hubiera ido, y sus amigos le
   siguen viendo en la clasificación. Lo que cambia es solo lo que se ENSEÑA. */
const ALT = __ALT__;
const CANAL_BUILD = ALT ? "alt" : "rpg";
const FH = ALT ? "fh alt" : "fh";

/* Claves que entran en la copia de seguridad (todo el progreso del perfil) */
const BACKUP_KEYS = ["gym:state","gym:log","gym:measures","gym:mealplan","gym:excludes","gym:routines","gym:customdiet","gym:mazmorra"];
/* El entreno en curso. Con el móvil en el bolsillo Android puede matar la app, y
   sin esto se perdían todas las series hasta darle a Terminar. No va en
   BACKUP_KEYS a propósito: es un estado de paso, no progreso. */
const ENTRENO_KEY = "gym:entreno";
/* Un hueco mayor que esto entre el último cambio y la vuelta no cuenta como
   tiempo entrenado: si no, un entreno recuperado horas después duraría horas. */
const PAUSA_SIN_CONTAR_MS = 10 * 60 * 1000;
const BACKUP_APP = "rpgym";
const BACKUP_APP_LEGACY = "forja-habito";   // copias hechas con el nombre antiguo
const BACKUP_FORMAT = 1;

/* ¿Qué va más adelantado, este móvil o la copia? Se mira el último entreno y,
   si coincide, cuántos hay y el XP. La fecha de subida no sirve: una copia subida
   desde aquí siempre es posterior a tu último entreno y no por eso trae nada nuevo. */
const fechaCorta = iso => parseISO(iso).toLocaleDateString("es-ES",{ day:"numeric", month:"long" });
function resumenProgreso(st, lg){
  const fechas = (lg||[]).map(r=>r?.date).filter(Boolean).sort();
  return { entrenos:Math.max(st?.totalWorkouts||0, (lg||[]).length), ultimo:fechas[fechas.length-1] || st?.lastWorkoutDate || null, xp:st?.xp||0 };
}
function compararProgreso(aqui, copia){
  const a=aqui.ultimo||"", c=copia.ultimo||"";
  if(a!==c) return c>a ? "copia" : "movil";
  if(aqui.entrenos!==copia.entrenos) return copia.entrenos>aqui.entrenos ? "copia" : "movil";
  if(aqui.xp!==copia.xp) return copia.xp>aqui.xp ? "copia" : "movil";
  return "igual";
}
/* Abre la copia en el móvil para resumirla. Sin clave (o si la contraseña cambió)
   devuelve null: no se sabe qué lleva, y eso no es motivo para insistir. */
async function resumenCopiaNube(copia){
  try {
    const clave = await cripto.recuperarClave();
    if(!clave) return null;
    const obj = JSON.parse(await cripto.descifrar(copia.cifrado, copia.iv, clave));
    const leer = k => { const v=obj.data?.[k]; return v ? JSON.parse(v) : null; };
    return { ...resumenProgreso(leer("gym:state"), leer("gym:log")), prefijo:obj.prefijo||"" };
  } catch { return null; }
}

/* Claves globales (no dependen del perfil activo) */
async function loadGlobal(key, fb){ try{ const r=await window.storage.get(key); return r?JSON.parse(r.value):fb; }catch{ return fb; } }
async function saveGlobal(key, val){ try{ await window.storage.set(key, JSON.stringify(val)); }catch(e){ console.error(e); } }

/* Avisos que se cierran PARA SIEMPRE. Antes vivían en un useState y volvían a
   salir en cada arranque: cerrar algo y que reaparezca cansa más que el propio
   aviso. Se guarda global (no por perfil): es una preferencia de lectura, no
   progreso, y por eso tampoco va en BACKUP_KEYS.

   Empieza en "cerrado" a propósito: así no parpadea mientras se lee el disco. */
function useAvisoCerrado(clave){
  const [cerrado, setCerrado] = useState(true);
  useEffect(()=>{
    let vivo = true;
    loadGlobal("gym:aviso:" + clave, false).then(v => { if(vivo) setCerrado(!!v); });
    return ()=>{ vivo = false; };
  }, [clave]);
  const cerrar = ()=>{ setCerrado(true); saveGlobal("gym:aviso:" + clave, true); };
  return [cerrado, cerrar];
}

/* =========================================================================
   ESTILOS
   ========================================================================= */

/* Versión ALT: una app de gimnasio sobria. Grises neutros en vez de los morados de la
   mazmorra, sin fondo pintado, esquinas redondeadas (el `border-radius:0` de la versión
   pixel no se emite) e Inter en vez de Jersey 15 también en títulos y botones. Los
   acentos (--gold, --jade...) se quedan: marcan estados y la app entera depende de ellos. */
const ALT_CSS = `
    .fh.alt { --bg:#0E1014; --bg2:#161920; --card:#1A1E26; --card2:#212631; --line:#2A303C; --line2:#3A4252;
      --txt:#ECEEF2; --muted:#A3AAB8; --faint:#7B8393; --gold:#F0B44C; --amber:#F0A040; }
    .fh.alt::before { display:none; }
    .fh.alt::after { background:var(--bg); }
    .fh.alt h1,.fh.alt h2,.fh.alt h3,.fh.alt .disp,.fh.alt .cinzel,.fh.alt .arcade,.fh.alt .fh-btn,
    .fh.alt .fh-nav button,.fh.alt select { font-family:'Inter',system-ui,sans-serif; letter-spacing:0; }
    .fh.alt h1,.fh.alt h2,.fh.alt h3,.fh.alt .disp,.fh.alt .cinzel { font-weight:600; }
    .fh.alt .fh-card { border-width:1px; border-radius:14px; box-shadow:none; }
    .fh.alt .fh-card::before,.fh.alt .fh-card::after { display:none; }
    .fh.alt .fh-framed { background:var(--card); box-shadow:none; }
    .fh.alt .fh-btn { border-radius:10px; box-shadow:none; transition:filter .15s; }
    .fh.alt .fh-btn:active { transform:none; box-shadow:none!important; filter:brightness(.9); }
    .fh.alt .fh-bar { border:none; border-radius:99px; height:8px; }
    .fh.alt .fh-bar > i { border-radius:99px; transition:width .6s ease; }
    .fh.alt .fh-bar > i::after,.fh.alt .fh-seg::after { display:none; }
    .fh.alt .fh-escena { display:none; }
    .fh.alt .fh-nav { border-top:1px solid var(--line); box-shadow:none; }
    .fh.alt .fh-nav button { font-size:11px; font-weight:500; }
    .fh.alt .fh-nav button.on { color:var(--txt); }
    .fh.alt .fh-nav button.on svg { color:var(--gold); }
    .fh.alt[data-theme="light"] { --bg:#F4F5F7; --bg2:#FFFFFF; --card:#FFFFFF; --card2:#F0F2F5; --line:#DDE1E7; --line2:#C5CBD5;
      --txt:#1B1F27; --muted:#5B6372; --faint:#808899; --gold:#B7791F; --amber:#B7791F; }
    .fh.alt[data-theme="light"] .fh-card,.fh.alt[data-theme="light"] .fh-btn,.fh.alt[data-theme="light"] .fh-framed { box-shadow:none; }
`;

const StyleTag = () => (
  <style>{`
    /* Fuentes AUTO-ALOJADAS en public/fonts (subconjunto latin). Antes se cargaban por
       @import desde fonts.googleapis.com, lo que suponía una llamada a Google en cada
       arranque: rompía el "100% offline" y obligaba a declararlo en la política de
       privacidad. NO vuelvas a poner el @import remoto. */
    /* Jersey 15 y no otra pixelada: con otras la C parecía una O y el 2 y el 5 un 8, y aquí se leen
       nombres de ejercicios y kilos de un vistazo. Solo tiene un peso: el rango evita la negrita falsa,
       y size-adjust la iguala a los tamaños en línea, pensados para una letra de ojo más grande. */
    @font-face{font-family:'Jersey 15';font-style:normal;font-weight:100 900;font-display:swap;size-adjust:128%;src:url('fonts/jersey-15-400.woff2') format('woff2');}
    @font-face{font-family:'Press Start 2P';font-style:normal;font-weight:400;font-display:swap;src:url('fonts/press-start-2p-400.woff2') format('woff2');}
    @font-face{font-family:'Inter';font-style:normal;font-weight:400;font-display:swap;src:url('fonts/inter-400.woff2') format('woff2');}
    @font-face{font-family:'Inter';font-style:normal;font-weight:500;font-display:swap;src:url('fonts/inter-500.woff2') format('woff2');}
    @font-face{font-family:'Inter';font-style:normal;font-weight:600;font-display:swap;src:url('fonts/inter-600.woff2') format('woff2');}
    @font-face{font-family:'JetBrains Mono';font-style:normal;font-weight:600;font-display:swap;src:url('fonts/jetbrains-mono-600.woff2') format('woff2');}
    @font-face{font-family:'JetBrains Mono';font-style:normal;font-weight:700;font-display:swap;src:url('fonts/jetbrains-mono-700.woff2') format('woff2');}
    * { box-sizing:border-box; -webkit-tap-highlight-color:transparent; }
    /* Mazmorra de noche: morados para el fondo y colores saturados de 16 bits para lo que importa.
       image-rendering se hereda: el fondo va pixelado pero las fotos de ejercicios no. */
    .fh { --bg:#100D1A; --bg2:#1A1528; --card:#211B33; --card2:#2C2444; --line:#3E3460; --line2:#5A4C86;
      --txt:#F2EAD8; --muted:#A99FC2; --faint:#7F7499;
      --gold:#FFC83D; --amber:#FFA726; --ember:#FF6B35; --crimson:#E8433F; --blood:#A32036;
      --jade:#3DDC84; --emerald:#3DDC84; --violet:#C08BFF; --arcane:#C08BFF; --sky:#4FC3F7; --mana:#4FC3F7;
      --gym:url('rpg/fondo-gym.png'); --velo:linear-gradient(rgba(16,13,26,.28),rgba(16,13,26,.74));
      --st:env(safe-area-inset-top,0px); --sb:env(safe-area-inset-bottom,0px);
      font-family:'Inter',system-ui,sans-serif; color:var(--txt); min-height:100vh;
      background:var(--bg); position:relative; isolation:isolate; }
    /* El gimnasio se queda quieto detrás y las tarjetas pasan por encima. Va en un fixed y
       no con background-attachment, que en el WebView de Android da tirones al desplazar. */
    .fh::before { content:""; position:fixed; inset:0; z-index:-1; background:var(--velo),var(--gym) center bottom/cover no-repeat; image-rendering:pixelated; }
    /* Con viewport-fit=cover la página llega hasta debajo de las barras del sistema. Esta
       franja tapa lo que pase por detrás del reloj al desplazar; es oscura también en tema
       claro porque en iOS las letras de esa barra son siempre blancas. */
    .fh::after { content:""; position:fixed; top:0; left:0; right:0; height:var(--st); z-index:45; background:#100D1A; pointer-events:none; }
    .fh * { image-rendering:auto; }
    .fh .fh-escena { position:relative; overflow:hidden; background:var(--gym) center 62%/cover no-repeat; image-rendering:pixelated; }
    ${ALT ? "" : ".fh *,.fh *::before,.fh *::after { border-radius:0!important; }"}
    .fh h1 { font-family:'Jersey 15',monospace; letter-spacing:.01em; font-weight:700; }
    .fh .cinzel { font-family:'Jersey 15',monospace; letter-spacing:.02em; }
    .fh h2,.fh h3,.fh .disp { font-family:'Jersey 15',monospace; letter-spacing:.01em; }
    .fh .mono { font-family:'JetBrains Mono',monospace; }
    .fh .arcade { font-family:'Press Start 2P',monospace; letter-spacing:0; }
    .fh-shell { max-width:480px; margin:0 auto; padding:var(--st) 16px calc(104px + var(--sb)); }
    .fh-card { background:var(--card); border:2px solid var(--line); box-shadow:0 3px 0 rgba(0,0,0,.35); }
    .fh-btn { font-family:'Jersey 15',monospace; font-weight:600; border:none; cursor:pointer;
      transition:transform .06s steps(2),filter .15s; color:#0F131A; }
    .fh-btn:active { transform:translateY(2px); box-shadow:inset 0 2px 0 rgba(0,0,0,.3)!important; }
    .fh-btn:disabled { cursor:default; }
    .fh-btn:focus-visible,.fh input:focus-visible,.fh select:focus-visible,.fh textarea:focus-visible { outline:2px solid var(--gold); outline-offset:2px; }
    .fh-nav { position:fixed; bottom:0; left:0; right:0; z-index:50; background:var(--bg2);
      border-top:2px solid var(--line2); box-shadow:0 -3px 0 rgba(0,0,0,.35); display:flex; justify-content:center; }
    .fh-nav-inner { max-width:480px; width:100%; display:flex; padding:8px 4px calc(8px + var(--sb)); }
    .fh-nav button { flex:1; background:none; border:none; cursor:pointer; color:var(--faint); display:flex;
      flex-direction:column; align-items:center; gap:3px; font-size:10px; font-weight:600; padding:6px 0;
      font-family:'Jersey 15',monospace; font-size:12px; transition:color .15s; }
    .fh-nav button .fh-sprite { filter:grayscale(1) opacity(.55); }
    .fh-nav button.on { color:var(--gold); }
    .fh-nav button.on .fh-sprite { filter:none; animation:fh-bob 1s steps(2) infinite; }
    @keyframes fh-slide { from{transform:translateY(12px);opacity:0} to{transform:translateY(0);opacity:1} }
    @keyframes fh-glow { 0%,100%{box-shadow:0 0 0 2px var(--gold)} 50%{box-shadow:0 0 0 2px var(--gold),0 0 22px 2px var(--gold)} }
    @keyframes fh-bob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }
    @keyframes fh-pop { 0%{transform:scale(.7);opacity:0} 60%{transform:scale(1.06)} 100%{transform:scale(1);opacity:1} }
    @keyframes fh-sube { 0%{transform:translate(-50%,0);opacity:1} 70%{opacity:1} 100%{transform:translate(-50%,-62px);opacity:0} }
    .fh-in { animation:fh-slide .28s ease both; }
    .fh-pop { animation:fh-pop .4s ease both; }
    .fh input,.fh select,.fh textarea { background:var(--bg2); border:1px solid var(--line); color:var(--txt); border-radius:10px;
      padding:10px 12px; font-family:'JetBrains Mono',monospace; font-size:16px; width:100%; text-align:center; }
    .fh textarea { font-family:'Inter',system-ui,sans-serif; font-size:14px; text-align:left; line-height:1.5;
      resize:vertical; min-height:74px; }
    .fh select { font-family:'Jersey 15',monospace; text-align:left; -webkit-appearance:none; appearance:none;
      background-image:linear-gradient(45deg,transparent 50%,var(--muted) 50%),linear-gradient(135deg,var(--muted) 50%,transparent 50%);
      background-position:calc(100% - 16px) 50%,calc(100% - 11px) 50%; background-size:5px 5px,5px 5px; background-repeat:no-repeat; padding-right:32px; }
    .fh input:focus,.fh select:focus,.fh textarea:focus { outline:none; border-color:var(--gold); }
    .fh-chip { font-size:11px; padding:3px 9px; border-radius:999px; font-weight:600; }
    .fh-card { position:relative; }
    .fh-card::before { content:""; position:absolute; inset:0; pointer-events:none; box-shadow:inset 0 2px 0 rgba(255,255,255,.05); }
    /* Remaches en las esquinas. Son un pseudoelemento y no un border-image para que siga
       funcionando el borderColor en línea, que es como la app marca los estados de cada tarjeta. */
    .fh-card::after { --r:var(--line2); content:""; position:absolute; inset:-2px; pointer-events:none;
      background:linear-gradient(var(--r),var(--r)) 0 0/8px 2px no-repeat,linear-gradient(var(--r),var(--r)) 0 0/2px 8px no-repeat,
        linear-gradient(var(--r),var(--r)) 100% 0/8px 2px no-repeat,linear-gradient(var(--r),var(--r)) 100% 0/2px 8px no-repeat,
        linear-gradient(var(--r),var(--r)) 0 100%/8px 2px no-repeat,linear-gradient(var(--r),var(--r)) 0 100%/2px 8px no-repeat,
        linear-gradient(var(--r),var(--r)) 100% 100%/8px 2px no-repeat,linear-gradient(var(--r),var(--r)) 100% 100%/2px 8px no-repeat; }
    .fh-framed { border-color:var(--gold)!important; box-shadow:0 0 0 2px rgba(0,0,0,.4),0 5px 0 rgba(0,0,0,.4); background:linear-gradient(160deg,var(--card),var(--card2)); }
    .fh-framed::after { --r:#FFF2C2; }
    .fh-btn { box-shadow:inset 0 -3px 0 rgba(0,0,0,.26),inset 0 2px 0 rgba(255,255,255,.2),0 2px 0 rgba(0,0,0,.4); }
    .fh-stat { display:flex; align-items:center; gap:12px; padding:11px 0; border-top:1px solid var(--line); }
    .fh-bar { height:10px; background:var(--bg2); overflow:hidden; border:2px solid var(--line); }
    .fh-bar > i { display:block; height:100%; position:relative; transition:width .6s steps(8); }
    /* Barras por tramos, como las de vida de un juego de 16 bits. */
    .fh-bar > i::after,.fh-seg::after { content:""; position:absolute; inset:0; background:repeating-linear-gradient(90deg,transparent 0 8px,rgba(0,0,0,.32) 8px 10px); }
    .fh-seg { position:relative; }

    .fh-sprite { display:inline-block; flex-shrink:0; background-repeat:no-repeat; }
    .fh .fh-sprite { image-rendering:pixelated; }
    .fh-idle { animation:fh-bob 1.1s steps(2) infinite; }
    .fh-andar { animation:fh-andar .8s steps(8) infinite; }
    .fh-corre { animation-duration:.5s; }
    .fh-levantar { animation:fh-press 2.2s steps(4) infinite; }
    .fh-trans { position:absolute; inset:0; z-index:30; display:flex; flex-direction:column; align-items:center; gap:10px; min-height:210px; padding:0 0 14px; overflow:hidden; background:#100D1A; border:none; cursor:pointer; color:#FFF; font:inherit; animation:fh-trans-entra .24s steps(4); }
    .fh-trans-fondo { position:relative; display:block; width:100%; aspect-ratio:128/80; max-height:72%; overflow:hidden; background:center bottom/cover no-repeat; image-rendering:pixelated; }
    .fh-trans-grupo { position:absolute; bottom:5%; left:-60%; display:flex; animation:fh-trans-cruza var(--dura) linear forwards; }
    .fh-trans-grupo > span { margin-right:-30px; }
    @keyframes fh-trans-cruza { 0%{left:-60%;opacity:1} 82%{left:36%;opacity:1} 100%{left:40%;opacity:0} }
    @keyframes fh-trans-entra { from{opacity:0} to{opacity:1} }
    @keyframes fh-press { from{background-position-x:0} to{background-position-x:calc(var(--s)*-4)} }
    .fh-golpe { animation:fh-tajo 1s steps(6) infinite; }
    @keyframes fh-tajo { from{background-position-x:0} to{background-position-x:calc(var(--s)*-6)} }
    .fh-recibe { animation:fh-recibe 1s linear infinite; }
    @keyframes fh-recibe { 0%,62%,100%{transform:none;filter:none} 68%{transform:translateX(7px);filter:brightness(2.4)} 84%{transform:translateX(3px);filter:none} }
    @keyframes fh-andar { from{background-position-x:calc(var(--s)*-1)} to{background-position-x:calc(var(--s)*-9)} }
    .fh-sube { animation:fh-ea .3s ease-out; }
    @keyframes fh-ea { 35%{transform:translateY(-20px) scale(1.07)} }
    .fh-baja { animation:fh-eb .32s ease-out; }
    @keyframes fh-eb { 35%{transform:translateY(30px) scale(1.14)} }
    .fh-impacto { animation:fh-imp .3s steps(6); }
    @keyframes fh-imp { 0%{filter:brightness(4) saturate(0)} 30%{transform:translate(-6px,2px)} 60%{transform:translate(6px,-2px);filter:brightness(1.7)} 100%{filter:none} }
    .fh-temblor { animation:fh-tem .28s steps(6); }
    @keyframes fh-tem { 20%{transform:translate(-4px,2px)} 40%{transform:translate(4px,-3px)} 60%{transform:translate(-3px,-2px)} 80%{transform:translate(3px,2px)} }
    .fh-num { position:absolute; left:50%; top:18%; z-index:6; font-size:15px; white-space:nowrap; pointer-events:none; text-shadow:2px 2px 0 #000; animation:fh-num .7s ease-out both; }
    @keyframes fh-num { 0%{transform:translate(-50%,8px) scale(.5);opacity:0} 25%{transform:translate(-50%,-8px) scale(1.35);opacity:1} 100%{transform:translate(-50%,-34px) scale(1);opacity:0} }
    .fh-chispa { position:absolute; left:50%; top:46%; z-index:5; width:5px; height:5px; pointer-events:none; animation:fh-chispa .4s ease-out both; }
    @keyframes fh-chispa { from{transform:translate(-50%,-50%);opacity:1} to{transform:translate(calc(-50% + var(--dx)),calc(-50% + var(--dy)));opacity:0} }
    .fh-zarpazo { position:absolute; inset:6px; z-index:5; pointer-events:none; animation:fh-zar .28s steps(4) both;
      background:linear-gradient(120deg,transparent 30%,#fff 30%,#fff 34%,transparent 34%,transparent 48%,#fff 48%,#fff 52%,transparent 52%,transparent 66%,#fff 66%,#fff 70%,transparent 70%); }
    @keyframes fh-zar { from{opacity:1;transform:translate(-8px,-8px)} to{opacity:0;transform:translate(8px,8px)} }
    .fh-muere { animation:fh-muere .5s steps(6) both; }
    @keyframes fh-muere { 0%,30%,60%{opacity:1;filter:brightness(3)} 15%,45%{opacity:.2} 100%{opacity:.12;filter:grayscale(1);transform:translateY(8px)} }
    .fh-entra { animation:fh-entra .42s cubic-bezier(.2,.9,.3,1.25) both; }
    @keyframes fh-entra { from{transform:translateY(-34px) scale(.7);opacity:0} }
    .fh-rotulo { position:absolute; left:0; right:0; top:42%; z-index:7; text-align:center; font-size:14px; color:#FFF; text-shadow:2px 2px 0 #000; pointer-events:none; animation:fh-rot 1.05s ease both; }
    @keyframes fh-rot { 0%{transform:translateX(-110%)} 22%,76%{transform:none} 100%{transform:translateX(110%);opacity:0} }
    .fh-caja3d { display:block; width:100%; height:100%; perspective:240px; will-change:transform; }
    .fh-cubo { display:block; position:relative; width:100%; height:100%; transform-style:preserve-3d; will-change:transform; }
    .fh-cara3d { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; backface-visibility:hidden; -webkit-backface-visibility:hidden;
      box-shadow:inset 0 0 0 2px rgba(255,255,255,.3),inset 0 -3px 0 rgba(0,0,0,.35); }
    .fh-sacude { animation:fh-sacude .22s steps(4); }
    @keyframes fh-sacude { 25%{transform:translateX(-5px)} 75%{transform:translateX(5px)} }
    .fh-flota { position:fixed; z-index:280; pointer-events:none; white-space:nowrap; font-family:'Press Start 2P',monospace;
      font-size:11px; text-shadow:2px 2px 0 #000; animation:fh-sube .95s steps(10) both; }

    /* ---- Pantallas de efecto (LEVEL UP, EXTRA LIFE, GAME OVER) ----
       Son una escena de juego: van siempre sobre oscuro, también en tema claro, y por eso
       usan colores fijos. Lo que importa se ve sin animación; solo se pierde el movimiento. */
    .fx { position:fixed; inset:0; z-index:300; display:flex; flex-direction:column; align-items:center; justify-content:center;
      gap:14px; padding:24px; overflow:hidden; text-align:center; cursor:pointer; color:#fff; background:rgba(8,6,16,.93);
      animation:fx-entra .18s steps(3) both; }
    .fx::after { content:""; position:absolute; inset:0; pointer-events:none; background:repeating-linear-gradient(0deg,rgba(0,0,0,.16) 0 2px,transparent 2px 4px); }
    .fx > * { position:relative; z-index:1; }
    .fx .fx-rayos { position:absolute; z-index:0; left:50%; top:50%; width:220vmax; height:220vmax; margin:-110vmax 0 0 -110vmax;
      background:repeating-conic-gradient(var(--fx) 0 12deg,transparent 12deg 24deg); opacity:.14; animation:fx-gira 14s linear infinite; }
    .fx-titulo { font-family:'Press Start 2P',monospace; font-size:clamp(18px,calc((100vw - 60px)/11),34px); white-space:nowrap; line-height:1.25; color:var(--fx); text-shadow:3px 3px 0 #000,-1px -1px 0 #000; }
    .fx-titulo span { display:inline-block; animation:fx-letra .5s steps(5) both; }
    .fx-sub { font-family:'Jersey 15',monospace; font-size:21px; font-weight:600; }
    .fx-nota { font-size:13.5px; line-height:1.5; color:#C9C2DC; max-width:320px; }
    .fx-pista { font-family:'Press Start 2P',monospace; font-size:9px; color:#8F86A8; margin-top:10px; animation:fx-parpadeo 1s steps(2) infinite; }
    .fx-salto { animation:fx-salto .7s steps(7) both; }
    .fx-latido { animation:fx-latido .8s steps(4) infinite; }
    .fx-part { position:absolute; z-index:0; left:50%; top:46%; animation:fx-part 1.25s cubic-bezier(.15,.7,.3,1) both; }
    .fx-over { background:#0A0408; animation:fx-entra .5s steps(5) both,fx-tiembla .4s steps(6) .1s both; }
    .fx-over .fx-titulo span { animation-name:fx-cae; animation-duration:.6s; }
    .fx-fantasma { animation:fx-fantasma 2.6s steps(13) infinite; }
    .fx-boton { font-family:'Press Start 2P',monospace; font-size:11px; padding:14px 18px; margin-top:12px; background:#FFC83D; color:#1A1020; }
    @keyframes fx-entra { from{opacity:0} to{opacity:1} }
    @keyframes fx-gira { to{transform:rotate(360deg)} }
    @keyframes fx-letra { 0%{transform:translateY(-34px) scale(1.5);opacity:0} 70%{transform:translateY(4px)} 100%{transform:translateY(0);opacity:1} }
    @keyframes fx-cae { 0%{transform:translateY(-70vh)} 75%{transform:translateY(6px)} 100%{transform:translateY(0)} }
    @keyframes fx-salto { 0%{transform:translateY(40px) scale(.6);opacity:0} 55%{transform:translateY(-30px) scale(1.1);opacity:1} 100%{transform:translateY(0) scale(1)} }
    @keyframes fx-latido { 0%,100%{transform:scale(1)} 50%{transform:scale(1.14)} }
    @keyframes fx-part { 0%{transform:translate(0,0);opacity:1} 80%{opacity:1} 100%{transform:translate(var(--dx),var(--dy));opacity:0} }
    @keyframes fx-tiembla { 0%,100%{transform:translate(0,0)} 20%{transform:translate(-7px,3px)} 40%{transform:translate(6px,-4px)} 60%{transform:translate(-4px,2px)} 80%{transform:translate(3px,-2px)} }
    @keyframes fx-fantasma { 0%{transform:translateY(10px);opacity:0} 25%{opacity:.9} 100%{transform:translateY(-34px);opacity:0} }
    @keyframes fx-parpadeo { 50%{opacity:0} }
    @media (prefers-reduced-motion:reduce){ .fh-in,.fh-pop,*{animation:none!important} .fx-part,.fx-fantasma,.fh-flota{display:none} }

    /* ---- Tema claro (pergamino cálido, conserva los acentos RPG) ---- */
    .fh[data-theme="light"] {
      --bg:#F3ECDE; --bg2:#FBF7EC; --card:#FFFBF0; --card2:#F3E9D2; --line:#D9C9A6; --line2:#B9A478;
      --txt:#2B2218; --muted:#655944; --faint:#857960;
      --gold:#B8862B; --amber:#C4881C; --ember:#C7492A; --crimson:#BE3F3F; --blood:#8E2323;
      --jade:#2E8C63; --emerald:#2E8C63; --violet:#7C5BD6; --arcane:#7C5BD6; --sky:#3E86A8; --mana:#3E86A8;
      --gym:url('rpg/fondo-gym-claro.png'); --velo:linear-gradient(rgba(243,236,222,.78) 0,rgba(243,236,222,.6) 40%,rgba(243,236,222,.82));
    }
    .fh[data-theme="light"] .fh-card { box-shadow:0 3px 0 rgba(90,70,30,.2); }
    .fh[data-theme="light"] .fh-card::before { box-shadow:none; }
    .fh[data-theme="light"] .fh-btn { box-shadow:inset 0 -3px 0 rgba(0,0,0,.14),inset 0 2px 0 rgba(255,255,255,.4),0 2px 0 rgba(90,70,30,.25); }
    .fh[data-theme="light"] .fh-framed { box-shadow:0 0 0 2px rgba(90,70,30,.15),0 5px 0 rgba(90,70,30,.2); }
    .fh[data-theme="light"] .fh-framed::after { --r:#7A5A16; }
    ${ALT ? ALT_CSS : ""}
  `}</style>
);

/* =========================================================================
   PEQUEÑOS COMPONENTES
   ========================================================================= */

function Ring({ pct, size=116, stroke=9, color="var(--gold)", track="var(--line)", transicion="stroke-dashoffset .6s ease", children }){
  const r=(size-stroke)/2, c=2*Math.PI*r;
  return (
    <div style={{ position:"relative", width:size, height:size }}>
      <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={track} strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={c} strokeDashoffset={c-c*Math.min(pct,1)} strokeLinecap="round"
          style={{ transition:transicion }}/>
      </svg>
      <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>{children}</div>
    </div>
  );
}

/* --- Pixel art -------------------------------------------------------------
   Hoja "Tiny Dungeon" de Kenney (CC0), 12 × 11 casillas de 16 px, en public/rpg.
   `id` es la casilla leyendo de izquierda a derecha. Tamaños múltiplos de 16, o
   los píxeles dejan de ser cuadrados. */
const SPR = { puerta:45, espada:104, cofre:91, cofreAbierto:92, pocion:115, pocionAzul:116, lapida:65, fantasma:121, escudo:101, amigo:98, amiga:99 };
/* El círculo rojo de "tienes algo pendiente". Su padre tiene que ir con position:relative. */
function Contador({ n }){
  if(!n) return null;
  return <span className="mono" style={{ position:"absolute", top:-5, right:-5, minWidth:17, height:17, padding:"0 4px", background:"var(--crimson)", color:"#fff", fontSize:10, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", border:"2px solid var(--bg)" }}>{n > 9 ? "9+" : n}</span>;
}
/* Fila de pestañas internas que se desliza en horizontal (Ajustes y Amigos). */
function FilaPestanas({ tabs, activa, onCambia }){
  return (
    <div style={{ display:"flex", gap:7, overflowX:"auto", padding:"10px 2px 4px", scrollbarWidth:"none" }}>
      {tabs.map(t=>{
        const on = activa === t.id; const I = t.icon;
        return (
          <button key={t.id} onClick={()=>onCambia(t.id)} className="fh-btn" aria-pressed={on}
            style={{ flexShrink:0, position:"relative", padding:"9px 13px", fontSize:12.5, whiteSpace:"nowrap", display:"flex", alignItems:"center", gap:6,
                     background:on?"var(--gold)":"var(--card)", color:on?"#0F131A":"var(--muted)", border:on?"none":"1px solid var(--line)" }}>
            {I && <I size={14}/>} {t.label}{t.aviso>0 && <b style={{ color:on?"#0F131A":"var(--crimson)" }}> {t.aviso}</b>}
          </button>
        );
      })}
    </div>
  );
}
function Sprite({ id, size=32, className="", style, titulo }){
  if(ALT) return null;   // ALT es constante: no rompe el orden de los hooks
  const esc = size/16;
  return <span className={`fh-sprite ${className}`} role={titulo ? "img" : undefined} aria-label={titulo} aria-hidden={titulo ? undefined : true}
    style={{ width:size, height:size, backgroundImage:"url('rpg/tiny-dungeon.png')", backgroundSize:`${192*esc}px ${176*esc}px`,
      backgroundPosition:`-${(id%12)*size}px -${Math.floor(id/12)*size}px`, ...style }}/>;
}
/* --- Avatar ------------------------------------------------------------------
   Personaje por capas del proyecto LPC, generado con scripts/generar-avatar.py. Cada
   capa trae dos filas (frente y perfil) de 9 fotogramas: el primero es de pie y los
   otros ocho, andando. Las recolorables vienen indexadas: el gris del píxel es el
   escalón de la rampa, así un solo fichero vale para todos los colores. */
const RAMPAS = {
  piel:{ clara:["#271920","#99423c","#cc8665","#E4A47C","#F9D5BA","#FAECE7"], dorada:["#281716","#9E3E37","#D28144","#EA9F54","#FDD082","#FBE7A4"],
    oliva:["#271920","#442725","#7F4C31","#AE6B3F","#D38B59","#E4A47C"], tostada:["#271920","#503734","#785946","#936849","#BA8454","#C7935F"],
    morena:["#1A1213","#442725","#644133","#7F4C31","#AE6B3F","#D38B59"], oscura:["#120E10","#412B29","#5F4539","#76513A","#9C663E","#B8773F"],
    ebano:["#000000","#1A1213","#2E1F1C","#442725","#603429","#7F4C31"], orca:["#140C09","#09320B","#19541D","#228236","#39AA4E","#53BF71"],
    gelida:["#16171B","#46425D","#586B90","#748DA4","#A9C9CA","#C8E8E8"] },
  pelo:{ negro:["#000000","#080A0A","#101414","#1C2222","#31313E","#4A5057"], castano:["#200C0D","#3A130E","#63200B","#81310A","#B6550E","#D28102"],
    marron:["#1A0E04","#301B07","#60350F","#7D4513","#AE682A","#C88D58"], rubio:["#331313","#552B15","#AC5D1F","#E09E2B","#FCCF56","#FFE67D"],
    platino:["#1C0E06","#7D5D5D","#A87D52","#C0AB81","#EDDF95","#F6F6F3"], pelirrojo:["#300500","#6A1A00","#9C3B01","#CC6901","#FAA301","#FFE01E"],
    rojo:["#300000","#870000","#A40712","#CB0000","#E21414","#F1583A"], gris:["#0E0E0E","#292929","#4B4B4B","#777777","#AAAAAA","#D9D9D9"],
    blanco:["#1D1D21","#484E57","#8B9498","#B8BBBC","#D8DCDC","#FFFFFF"], rosa:["#330410","#71043A","#B60A68","#E941AA","#E976C4","#EA95D5"],
    morado:["#13112D","#2B225A","#402E82","#7141B2","#A966DD","#D085ED"], azul:["#000027","#00005E","#000091","#0041B4","#0074CB","#1E85EF"],
    verde:["#000400","#001400","#002D00","#005000","#007C00","#00A700"] },
  armadura:{ acero:["#14161c","#2c3240","#4f5a6e","#7f8ca3","#b4c0d2","#e6edf5"], oro:["#241505","#5a3410","#96601a","#cf9a2b","#efc95a","#fff0a8"],
    bronce:["#1c0e06","#4a2410","#7a4018","#a8642a","#cf8f4a","#efc083"], cuero:["#170d08","#38200f","#5a3519","#7d4f2a","#a3713f","#c99a63"],
    carmesi:["#1c0a10","#4a1020","#7f1d2e","#b72f3c","#e0605a","#f7a68e"], esmeralda:["#06170f","#0e3a25","#17603b","#259054","#4cc078","#a0eab0"],
    zafiro:["#080f26","#142a5c","#1f4590","#2f6ec4","#5a9fe6","#aedcf8"], amatista:["#160a26","#351858","#56288a","#7d45bb","#a978dd","#dcb8f5"],
    obsidiana:["#08080c","#14141c","#22222e","#363644","#55556a","#8a8aa0"], hueso:["#2a2318","#5a4e3a","#8a7c60","#b5a98a","#d9cfb4","#f5efdc"] },
};
const NOMBRES_COLOR = { clara:"Clara", dorada:"Dorada", oliva:"Oliva", tostada:"Tostada", morena:"Morena", oscura:"Oscura", ebano:"Ébano", orca:"Orca", gelida:"Gélida",
  negro:"Negro", castano:"Castaño", marron:"Marrón", rubio:"Rubio", platino:"Platino", pelirrojo:"Pelirrojo", rojo:"Rojo", gris:"Gris", blanco:"Blanco", rosa:"Rosa", morado:"Morado", azul:"Azul", verde:"Verde",
  acero:"Acero", oro:"Oro", bronce:"Bronce", cuero:"Cuero", carmesi:"Carmesí", esmeralda:"Esmeralda", zafiro:"Zafiro", amatista:"Amatista", obsidiana:"Obsidiana", hueso:"Hueso" };
const OJOS = { brown:["Marrones","#6B3A1E"], blue:["Azules","#2F7FD6"], green:["Verdes","#2E9E58"], gray:["Grises","#8A949E"], purple:["Violetas","#8A4FD0"], red:["Rojos","#D0342C"], orange:["Ámbar","#E58A1F"], yellow:["Dorados","#E8C63A"] };

/* Las ramas. Cada serie cuenta para UNA, según cómo se ha entrenado. Se recalculan
   del historial, como el informe semanal: restaurar una copia o renombrar un ejercicio
   se refleja solo, y quien actualiza ya tiene ganado lo que le toca. */
const RAMAS = [
  { id:"guerrero",   nombre:"Guerrero",   estilo:"Hipertrofia", color:"#E8433F", armadura:"acero",     cuenta:"Series de 7 a 12 repeticiones con carga.", resumen:"Armadura pesada y mandoble." },
  { id:"picaro",     nombre:"Pícaro",     estilo:"Definición",  color:"#3DDC84", armadura:"cuero",     cuenta:"Series de más de 12 repeticiones con carga.", resumen:"Cuero ligero y dagas." },
  { id:"barbaro",    nombre:"Bárbaro",    estilo:"Fuerza",      color:"#FFA726", armadura:"bronce",    cuenta:"Series de 6 repeticiones o menos con carga.", resumen:"Bronce, pieles y hacha de guerra." },
  { id:"explorador", nombre:"Explorador", estilo:"Cardio",      color:"#4FC3F7", armadura:"esmeralda", cuenta:"Cardio: 5 minutos valen como una serie.", resumen:"Ropa de viaje, capa y arco." },
  { id:"monje",      nombre:"Monje",      estilo:"Peso corporal", color:"#C08BFF", armadura:"hueso",   cuenta:"Ejercicios sin carga: core, flexiones, isométricos.", resumen:"Hábito del templo y bastón." },
];
const RAMA = Object.fromEntries(RAMAS.map(r=>[r.id,r]));
const RANURAS = [["cabeza","Cabeza",true],["hombros","Hombros",true],["torso","Torso",false],["brazos","Brazos",true],["piernas","Piernas",false],
  ["pies","Pies",false],["espalda","Espalda",true],["arma","Arma",false],["escudo","Escudo",true]];
const PIEZAS_POR_RAMA = RAMAS.reduce((a,r)=>({ ...a, [r.id]:Object.entries(AVATAR.piezas).filter(([,p])=>p.rama===r.id).map(([id,p])=>({ id, ...p })).sort((x,y)=>x.u-y.u) }), {});
/* Lo que tapa la cabeza entera: con estas piezas el pelo asomaría por fuera. */
const TAPA_PELO = new Set(["g_yelmo","p_capucha","e_capucha","m_capucha"]);

function ramaDeSerie(nombre, reps){
  if(isCardio(nombre)) return "explorador";
  if(BODYWEIGHT_EX.has(nombre)) return "monje";
  const n = Number(reps)||0;
  if(n>12) return "picaro";
  return n && n<=6 ? "barbaro" : "guerrero";
}
function puntosDeRama(log){
  const p = Object.fromEntries(RAMAS.map(r=>[r.id,0]));
  (log||[]).forEach(rec=>(rec.exercises||[]).forEach(ex=>(ex.logs||[]).forEach(l=>{
    const enMinutos = isCardio(ex.name) && repUnit(ex.objetivo)==="MIN";
    p[ramaDeSerie(ex.name, l.reps)] += enMinutos ? Math.max(1, Math.round((Number(l.reps)||0)/5)) : 1;
  })));
  return p;
}
const ramaDominante = puntos => RAMAS.reduce((a,r)=> (puntos[r.id]||0) > (a ? puntos[a.id] : 0) ? r : a, null);
const siguientePieza = (rama, puntos) => PIEZAS_POR_RAMA[rama].find(p=>p.u>(puntos[rama]||0)) || null;
function piezasNuevas(antes, despues){
  return Object.values(PIEZAS_POR_RAMA).flat().filter(p=>p.u>0 && (antes[p.rama]||0)<p.u && (despues[p.rama]||0)>=p.u);
}
/* Lo mejor que tengas ganado de esa rama, una pieza por ranura. */
function equipoDeRama(rama, puntos){
  const eq = {};
  PIEZAS_POR_RAMA[rama].forEach(p=>{ if(p.u<=(puntos[rama]||0)) eq[p.ranura] = p.id; });
  return eq;
}
function avatarPorDefecto(perfil, puntos){
  const sexo = perfil?.sex==="mujer" ? "f" : "m", rama = (ramaDominante(puntos) || RAMAS[0]).id;
  return { sexo, rama, piel:"clara", pelo:sexo==="f" ? "ponytail" : "plain", colorPelo:"castano", barba:null, ojos:"brown",
    armadura:RAMA[rama].armadura, equipo:equipoDeRama(rama, puntos) };
}

function capasAvatar(av){
  const piezas = Object.values(av.equipo||{}).filter(id=>AVATAR.piezas[id]);
  const sinPelo = piezas.some(id=>TAPA_PELO.has(id));
  return [ ...AVATAR.cuerpo[av.sexo], AVATAR.ojos[av.ojos] || AVATAR.ojos.brown,
    ...(!sinPelo && AVATAR.pelos[av.pelo]?.capas || []),
    ...(!sinPelo && AVATAR.barbas[av.barba]?.capas || []),
    ...piezas.flatMap(id=>AVATAR.piezas[id].capas[av.sexo]) ].sort((a,b)=>a.z-b.z);
}
const capasCargadas = new Map(), hojasAvatar = new Map();
function cargarCapa(s){
  if(!capasCargadas.has(s)) capasCargadas.set(s, new Promise(ok=>{ const i = new Image(); i.onload = ()=>ok(i); i.onerror = ()=>ok(null); i.src = `avatar/${s}.png`; }));
  return capasCargadas.get(s);
}
const rgb = h => [1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
function pintarCapas(ctx, capas, imgs, av, ancho, alto){
  const rampas = { piel:RAMPAS.piel[av.piel], pelo:RAMPAS.pelo[av.colorPelo], armadura:RAMPAS.armadura[av.armadura] };
  capas.forEach((c,i)=>{
    if(!imgs[i]) return;
    if(!c.g){ ctx.drawImage(imgs[i],0,0); return; }
    const t = document.createElement("canvas"); t.width = ancho; t.height = alto;
    const tc = t.getContext("2d", { willReadFrequently:true }); tc.drawImage(imgs[i],0,0);
    const d = tc.getImageData(0,0,ancho,alto), px = d.data, tabla = (rampas[c.g] || RAMPAS.armadura.acero).map(rgb);
    for(let p=0;p<px.length;p+=4){
      if(!px[p+3]) continue;
      const [r,g,b] = tabla[Math.min(5, Math.round(px[p]/40))];
      px[p] = r; px[p+1] = g; px[p+2] = b;
    }
    tc.putImageData(d,0,0); ctx.drawImage(t,0,0);
  });
}
async function hojaAvatar(av){
  const clave = JSON.stringify(av);
  if(hojasAvatar.has(clave)) return hojasAvatar.get(clave);
  const capas = capasAvatar(av), imgs = await Promise.all(capas.map(c=>cargarCapa(c.s)));
  const lienzo = document.createElement("canvas"); lienzo.width = 576; lienzo.height = 128;
  pintarCapas(lienzo.getContext("2d"), capas, imgs, av, 576, 128);
  const url = lienzo.toDataURL();
  if(hojasAvatar.size>60) hojasAvatar.clear();
  hojasAvatar.set(clave, url);
  return url;
}
/* Acciones de quien está entrenando, en fotogramas de 128 (un tajo no cabe en 64). Fila 0:
   press de barra, con los fotogramas de brazos del conjuro de LPC. Fila 1: tajo. Solo se
   componen si alguien entrena, y las capas sin esa animación (arcos, bastones) no salen:
   nadie hace press con el arco en la mano. */
const PRESS = [{ f:2, y:73 }, { f:4, y:66 }, { f:5, y:57 }, { f:4, y:66 }];  // y: altura de las manos
const hojasAccion = new Map();
function pintarBarra(ctx, x, y){
  ctx.fillStyle = "#C9CCD6"; ctx.fillRect(x+30, y, 68, 2);
  ctx.fillStyle = "#2A2438"; [33,91].forEach(d=>ctx.fillRect(x+d, y-7, 4, 16));
  ctx.fillStyle = "#E8433F"; [29,95].forEach(d=>ctx.fillRect(x+d, y-5, 4, 12));
}
async function hojaAccion(av){
  const clave = JSON.stringify(av);
  if(hojasAccion.has(clave)) return hojasAccion.get(clave);
  const conAccion = new Set(AVATAR.acc), tajos = Object.values(av.equipo||{}).flatMap(id=>AVATAR.piezas[id]?.tajo?.[av.sexo] || []);
  const capas = [ ...capasAvatar(av).filter(c=>conAccion.has(c.s)), ...tajos ].sort((a,b)=>a.z-b.z);
  const imgs = await Promise.all(capas.map(c=>cargarCapa("acc/"+c.s)));
  const base = document.createElement("canvas"); base.width = 896; base.height = 256;
  pintarCapas(base.getContext("2d"), capas, imgs, av, 896, 256);
  const hoja = document.createElement("canvas"); hoja.width = 768; hoja.height = 256;
  const ctx = hoja.getContext("2d");
  PRESS.forEach(({ f, y },i)=>{ pintarBarra(ctx, i*128, y); ctx.drawImage(base, f*128, 0, 128, 128, i*128, 0, 128, 128); });  // la barra por detrás: si no, le cruza la cara
  ctx.drawImage(base, 0, 128, 768, 128, 0, 128, 768, 128);
  const url = hoja.toDataURL();
  if(hojasAccion.size>20) hojasAccion.clear();
  hojasAccion.set(clave, url);
  return url;
}
function useHojaAvatar(av){
  const clave = JSON.stringify(av);
  const [url, setUrl] = useState(()=>hojasAvatar.get(clave) || null);
  useEffect(()=>{ let vivo = true; hojaAvatar(av).then(u=>{ if(vivo) setUrl(u); }); return ()=>{ vivo = false; }; }, [clave]);
  return url;
}
function Avatar({ av, escala=2, dir="frente", andar=false, className="", style, titulo }){
  if(ALT) return null;
  const url = useHojaAvatar(av), s = 64*escala;
  return <span className={`fh-sprite ${andar ? "fh-andar" : ""} ${className}`} role={titulo ? "img" : undefined} aria-label={titulo} aria-hidden={titulo ? undefined : true}
    style={{ width:s, height:s, "--s":`${s}px`, backgroundImage:url ? `url(${url})` : undefined, backgroundSize:`${s*9}px ${s*2}px`,
      backgroundPosition:`0 ${dir==="perfil" ? -s : 0}px`, ...style }}/>;
}
function AvatarAccion({ av, accion, escala=2, style }){
  const clave = JSON.stringify(av), [url, setUrl] = useState(()=>hojasAccion.get(clave) || null), s = 128*escala;
  useEffect(()=>{ let vivo = true; hojaAccion(av).then(u=>{ if(vivo) setUrl(u); }); return ()=>{ vivo = false; }; }, [clave]);
  return <span className={`fh-sprite fh-${accion}`} aria-hidden="true" style={{ width:s, height:s, "--s":`${s}px`, backgroundImage:url ? `url(${url})` : undefined,
    backgroundSize:`${s*6}px ${s*2}px`, backgroundPosition:`0 ${accion==="golpe" ? -s : 0}px`, ...style }}/>;
}
/* El héroe hace el ejercicio que tienes delante. LPC no trae ejercicios, así que son poses
   suyas reaprovechadas: "herido" cortado antes de caer es una sentadilla, el conjuro da
   elevaciones y curl. Lo tumbado no existe en LPC y girar el sprite parece un desmayo: el
   banco y el suelo se quedan en "espera", el héroe de pie, hasta que haya poses dibujadas.
   Las barras se pintan aquí. Las máquinas son fondos fijos de rpg/maq/ (MAQ_EJ): lo que se
   mueve encima son poses del héroe, y solo las piernas se dibujan con los colores de su equipo. */
const EJ_W = 112, EJ_H = 76, EJ_X = 24, EJ_Y = 10, EJ_PISO = 66;
const [P_HERIDO, P_FRENTE, P_ESPALDA, P_TREPA, P_EMPUJA, P_SENTADO, P_CORRE, P_QUIETO] = [0,1,2,3,4,5,6,7];
const REGLAS_EJ = [
  [/Extensión de cuádriceps/, "m_extension"],
  [/Curl femoral sentado/, "m_curlfem"],
  [/Press de pecho en m|Press inclinado en m|Press declinado en m/, "m_pecho"],
  [/Press de hombro en m/, "m_hombro"],
  [/[Cc]ontractora/, "m_mariposa"],
  [/Curl de bíceps en m|Curl predicador/, "m_biceps"],
  [/Extensión de tríceps en m|Fondos en m/, "m_triceps"],
  [/Remo en máquina|Remo alto en m|Remo de deltoides posterior/, "m_remo"],
  [/Pulldown|Jalón en máquina/, "m_pulldown"],
  [/^Jalón/, "m_jalon"],
  [/Elevación lateral en m/, "m_lateral"],
  [/Patada de glúteo en m/, "m_glute"],
  [/Dominada asistida/, "m_asistida"],
  [/Fondos asistidos/, "m_fondos"],
  [/Prensa|Gemelo en prensa|Abductores|Aductores en m|Press de pecho|Crunch en m|Elevación de talones sentado|Curl concentrado|Press mancuernas sentado/, "maquina"],
  [/Plancha|^Flexiones|Crunch abdominal|Bicicleta abdominal|^Encogimientos$|Tijeras|Mountain|Rueda|Russian|Elevación de piernas$|Puente|Hip thrust|Elevación de cadera|Curl nórdico|Hiperextensión inversa|Curl femoral|Curl tumbado|Press banca|Press declinado|Press inclinado|Press francés|Aperturas con|Aperturas en banco|Pullover con|Pullover en polea inclinado|Fondos|Sentadilla tumbada|Press cerrado|Curl araña|Curl inclinado|Press de suelo/, "espera"],
  [/[Cc]inta|Caminar|HIIT|Calentamiento|Elíptica|Escaladora/, "cinta"],
  [/^Bici /, "bici"],
  [/Máquina de remo/, "remo"],
  [/Comba|con salto/, "comba"],
  [/Sentadilla(?! búlgara)/, "sentadilla"],
  [/Peso muerto|Good morning|Pull through|Hiperextensiones|Swing/, "peso"],
  [/Zancada|búlgara|Subida al caj/, "zancada"],
  [/Dominada|Jalón|Elevación de rodillas|en barra$/, "dominada"],
  [/Remo al/, "curl"],
  [/Remo|Face pull|Pájaros|Rotación/, "remo"],
  [/Elevaciones laterales|Elevación (lateral|frontal)/, "lateral"],
  [/Cruce|Aperturas|Pallof|Giro ruso|Leñador|Crunch en polea|Crunch inverso|Flexión lateral|Aductores en polea|Patada de/, "cruces"],
  [/Curl|Superserie/, "curl"],
  [/[Tt]ríceps|Pullover/, "triceps"],
  [/Press/, "press"],
  [/talones|Gemelos|puntas|Encogimientos/, "gemelos"],
];
const familiaEjercicio = n => REGLAS_EJ.find(([r])=>r.test(n))?.[1] || "espera";
const MAQ_EJ = { m_extension:"extension", m_curlfem:"extension", m_pecho:"press", m_triceps:"press", m_remo:"remo", m_hombro:"frente", m_mariposa:"frente", m_lateral:"frente", m_biceps:"frente", m_jalon:"jalon", m_pulldown:"jalon", m_glute:"glute", m_asistida:"asistida", m_fondos:"asistida" };
const maquinas = new Map();
function cargarMaquina(n){
  if(!n) return Promise.resolve(null);
  if(!maquinas.has(n)) maquinas.set(n, new Promise(ok=>{ const i = new Image(); i.onload = ()=>ok(i); i.onerror = ()=>ok(null); i.src = `rpg/maq/${n}.png`; }));
  return maquinas.get(n);
}
const hojasEj = new Map(), tirasEj = new Map();
function hojaEjercicio(av){
  const clave = JSON.stringify(av);
  if(!hojasEj.has(clave)){
    if(hojasEj.size>6) hojasEj.clear();
    hojasEj.set(clave, (async()=>{
      const conPose = new Set(AVATAR.ej), capas = capasAvatar(av).filter(c=>conPose.has(c.s));
      const imgs = await Promise.all(capas.map(c=>cargarCapa("ej/"+c.s)));
      const base = document.createElement("canvas"); base.width = 512; base.height = 512;
      pintarCapas(base.getContext("2d", { willReadFrequently:true }), capas, imgs, av, 512, 512);
      return base;
    })());
  }
  return hojasEj.get(clave);
}
/* Qué fotogramas lleva cada familia. Cada paso recibe el lienzo y pinta un fotograma. */
function pasosEjercicio(base, familia, conCarga, maquina){
  const HIERRO = "#AAB0BE", OSCURO = "#1E1E28", DISCO = "#BE3C32", ACERO = "#606678", CABLE = "#D2D2E1", MADERA = "#785438", NEGRO = "#26262F", TRAZO = "#18141E", PLATA = "#8A90A0";
  const lee = base.getContext("2d", { willReadFrequently:true });
  /* Lo que ocupa una pose, para poner la barra o el cable donde caiga con su equipo. */
  const caja = (fila, f, y0=0, y1=64)=>{
    const d = lee.getImageData(f*64, fila*64+y0, 64, y1-y0).data;
    let x0 = 64, x1 = 0, arriba = 64;
    for(let y=0;y<y1-y0;y++) for(let x=0;x<64;x++) if(d[(y*64+x)*4+3]){ if(x<x0) x0 = x; if(x+1>x1) x1 = x+1; if(y+y0<arriba) arriba = y+y0; }
    return { x0, x1, arriba };
  };
  const pon = (c, fila, f, dx=0, dy=0)=>c.drawImage(base, f*64, fila*64, 64, 64, EJ_X+dx, EJ_Y+dy, 64, 64);
  /* Mitad de arriba de una pose sobre la mitad de abajo de otra: vale con cualquier equipo. */
  const mezcla = (c, sup, inf, y, dy=0, dx=0)=>{
    c.drawImage(base, inf[1]*64, inf[0]*64+y+dy, 64, 64-y-dy, EJ_X+dx, EJ_Y+dy+y, 64, 64-y-dy);
    c.drawImage(base, sup[1]*64, sup[0]*64, 64, y, EJ_X+dx, EJ_Y+dy, 64, y);
  };
  const rect = (c, color, x, y, w, h)=>{ c.fillStyle = color; c.fillRect(x, y, w, h); };
  const linea = (c, color, x0, y0, x1, y1)=>{
    const n = Math.max(Math.abs(x1-x0), Math.abs(y1-y0)) || 1; c.fillStyle = color;
    for(let i=0;i<=n;i++) c.fillRect(Math.round(x0+(x1-x0)*i/n), Math.round(y0+(y1-y0)*i/n), 1, 1);
  };
  const barra = (c, x0, x1, y)=>{
    rect(c, HIERRO, x0, y, x1-x0, 1); rect(c, OSCURO, x0, y+1, x1-x0, 1);
    [x0+2, x1-6].forEach(x=>{ rect(c, DISCO, x, y-6, 4, 14); rect(c, "#78241F", x+3, y-5, 1, 12); });
  };
  const mancuerna = (c, x, y)=>{ rect(c, HIERRO, x-3, y, 7, 2); rect(c, OSCURO, x-5, y-2, 3, 6); rect(c, OSCURO, x+3, y-2, 3, 6); };
  const poste = (c, x, y=8)=>{ rect(c, ACERO, x, y, 3, EJ_PISO-y); rect(c, OSCURO, x+3, y, 1, EJ_PISO-y); };
  const arco = (c, cx, cy, rx, ry, desde, hasta)=>{ c.fillStyle = CABLE; for(let a=desde;a<=hasta;a+=.03) c.fillRect(Math.round(cx+rx*Math.cos(a)), Math.round(cy+ry*Math.sin(a)), 1, 1); };
  const X = EJ_X, Y = EJ_Y;
  const fondo = c=>{ if(maquina) c.drawImage(maquina, 0, 0); };
  /* Colores de lo que lleva puesto, sacados de la pose de perfil: valen con cualquier equipo. */
  const tono = (x0, y0, x1, y1)=>{
    const d = lee.getImageData(64+x0, P_QUIETO*64+y0, x1-x0, y1-y0).data, px = [];
    for(let i=0;i<d.length;i+=4) if(d[i+3]>200 && d[i]*.3+d[i+1]*.59+d[i+2]*.11>40) px.push([d[i],d[i+1],d[i+2]]);
    px.sort((a,b)=>(a[0]+a[1]+a[2])-(b[0]+b[1]+b[2]));
    const pide = q=>{ const p = px[Math.floor(q*px.length)] || [90,90,100]; return `rgb(${p})`; };
    return [pide(.5), pide(.8)];
  };
  /* Una pieza gruesa con su contorno, entre dos puntos. */
  const miembro = (c, [x0,y0], [x1,y1], [medio,luz], ancho=4)=>{
    const n = Math.round(Math.max(Math.abs(x1-x0), Math.abs(y1-y0))) || 1, a = ancho/2;
    const cada = f=>{ for(let i=0;i<=n;i++) f(Math.round(x0+(x1-x0)*i/n), Math.round(y0+(y1-y0)*i/n)); };
    cada((x,y)=>rect(c, TRAZO, x-a-1, y-a-1, ancho+2, ancho+2));
    cada((x,y)=>rect(c, medio, x-a, y-a, ancho, ancho));
    cada((x,y)=>rect(c, luz, x-a, y-a, ancho-1, 1));
  };
  const rodillo = (c, x, y, r=4)=>{ for(let dy=-r;dy<=r;dy++){ const w = Math.round(Math.sqrt(r*r-dy*dy)); rect(c, NEGRO, Math.round(x)-w, Math.round(y)+dy, w*2+1, 1); } };
  /* Sentado de perfil: brazos de `fila` sobre las piernas de la pose de silla. */
  const sentado = (c, fila, f, dx=0, dy=0, corte=44)=>{
    c.drawImage(base, 128, P_SENTADO*64+corte, 64, 64-corte, X+dx, Y+dy+corte, 64, 64-corte);
    c.drawImage(base, f*64, fila*64, 64, corte, X+dx, Y+dy, 64, corte);
  };
  /* Sentado de frente o de espaldas: el tronco baja sobre sus propias piernas. */
  const frontal = (c, fila, f, baja=6)=>mezcla(c, [fila,f], [fila,1], 46, baja);
  /* Dónde cae la mano en una pose de perfil: el píxel más adelantado a media altura. */
  const punta = (fila, f)=>{
    const d = lee.getImageData(f*64, fila*64+28, 64, 24).data;
    let px = 0, py = 40;
    for(let y=0;y<24;y++) for(let x=0;x<64;x++) if(d[(y*64+x)*4+3] && x>px){ px = x; py = y+28; }
    return { x:px, y:py };
  };
  /* Las manos en las poses de frente y espalda: la altura la marca el fotograma. */
  const manos = (fila, f, baja=6)=>{
    const b = caja(fila, f, 20, 56);
    return { x0:X+b.x0, x1:X+b.x1-1, y:Y+baja+({1:44,2:40,3:42,4:33,5:25})[f] };
  };
  const pierna = (c, t, curl)=>{
    const ropa = tono(24,49,40,54), bota = tono(24,56,40,62), rod = [56,52], a = (90-80*t)*Math.PI/180;
    const tob = [rod[0]+15*Math.cos(a), rod[1]+15*Math.sin(a)];
    fondo(c);
    miembro(c, [38,52], rod, ropa, 6);
    c.drawImage(base, 128, P_SENTADO*64, 64, 44, X-18, Y-8, 64, 44);
    c.drawImage(base, 128, P_SENTADO*64+44, 44, 10, X-18, Y+36, 44, 10);
    miembro(c, rod, tob, ropa, 5);
    miembro(c, tob, [tob[0]+4*Math.sin(a), tob[1]-4*Math.cos(a)+1], bota, 4);
    const s = curl ? -1 : 1, ro = [tob[0]-3*Math.cos(a)+s*4*Math.sin(a), tob[1]-3*Math.sin(a)-s*4*Math.cos(a)+(curl ? 0 : 6)];
    linea(c, PLATA, rod[0], rod[1], Math.round(ro[0]), Math.round(ro[1]));
    rodillo(c, ro[0], ro[1]);
    if(curl) rect(c, NEGRO, 42, 44, 15, 4);
  };
  const empuje = (c, i, dx, palanca)=>{
    fondo(c);
    const p = i ? punta(P_EMPUJA, i) : { x:42, y:50 }, hx = X+dx+p.x, hy = Y+p.y;
    palanca(c, hx, hy);
    sentado(c, P_EMPUJA, i, dx, 0, 49);   // el puño extendido cae por debajo del corte de 44
    rect(c, NEGRO, hx-1, hy-5, 3, 10);
  };
  const barraJalon = (c, f, discos)=>{
    const m = manos(P_ESPALDA, f);
    fondo(c);
    linea(c, CABLE, 56, 10, 56, m.y);
    if(discos) barra(c, m.x0-9, m.x1+9, m.y); else { rect(c, HIERRO, m.x0-3, m.y, m.x1-m.x0+7, 2); rect(c, OSCURO, m.x0-3, m.y+2, m.x1-m.x0+7, 1); }
    frontal(c, P_ESPALDA, f);
  };
  const F = {
    espera:{ ms:420, pasos:[0,0,-1,-1].map(dy=>c=>pon(c, P_QUIETO, 0, 0, dy)) },
    sentadilla:{ ms:150, pasos:[0,1,2,3,3,2,1,0].map(i=>c=>{ if(conCarga) barra(c, X+6, X+58, Y+caja(P_HERIDO, i).arriba+17); pon(c, P_HERIDO, i); }) },
    peso:{ ms:150, pasos:[3,3,2,1,0,0,1,2].map(i=>c=>{ pon(c, P_HERIDO, i); barra(c, X+6, X+58, Y+[44,47,50,52][i]); }) },
    press:{ ms:280, pasos:[[2,41],[4,34],[5,25],[4,34]].map(([i,y])=>c=>{ barra(c, X-2, X+66, Y+y); pon(c, P_FRENTE, i); }) },
    curl:{ ms:190, pasos:[[1,45],[1,45],[3,44],[2,37],[2,37],[3,44]].map(([i,y])=>c=>{
      pon(c, P_FRENTE, i); rect(c, HIERRO, X+16, Y+y, 32, 2); rect(c, DISCO, X+13, Y+y-3, 3, 8); rect(c, DISCO, X+48, Y+y-3, 3, 8); }) },
    triceps:{ ms:190, pasos:[[2,37],[2,37],[3,44],[1,45],[1,45],[3,44]].map(([i,y])=>c=>{
      poste(c, 76); rect(c, ACERO, 56, 8, 24, 3); linea(c, CABLE, X+32, 10, X+32, Y+y); pon(c, P_FRENTE, i);
      const an = i===2 ? 7 : 15; rect(c, HIERRO, X+32-an, Y+y, an*2+1, 2); }) },
    lateral:{ ms:190, pasos:[[1,44],[3,42],[4,33],[4,33],[3,42],[1,44]].map(([i,y])=>c=>{
      pon(c, P_FRENTE, i); const b = caja(P_FRENTE, i, 24, 56); mancuerna(c, X+b.x0, Y+y); mancuerna(c, X+b.x1-1, Y+y); }) },
    cruces:{ ms:190, pasos:[[4,33],[3,40],[2,40],[2,40],[3,40],[4,33]].map(([i,y])=>c=>{
      poste(c, 4); poste(c, 104); pon(c, P_FRENTE, i); const b = caja(P_FRENTE, i, 24, 56);
      linea(c, CABLE, 7, 10, X+(i===2 ? 30 : b.x0), Y+y); linea(c, CABLE, 104, 10, X+(i===2 ? 33 : b.x1-1), Y+y); }) },
    dominada:{ ms:150, pasos:[[P_ESPALDA,5,-9],[P_ESPALDA,5,-9],[P_TREPA,2,-14],[P_TREPA,5,-19],[P_TREPA,5,-19],[P_TREPA,2,-14],[P_ESPALDA,5,-9],[P_ESPALDA,5,-9]].map(([fila,i,dy])=>c=>{
      rect(c, HIERRO, 12, 22, 89, 2); poste(c, 10, 20); poste(c, 99, 20); pon(c, fila, i, 0, dy); }) },
    remo:{ ms:150, pasos:[5,4,3,2,2,3,4,5].map(i=>c=>{
      poste(c, 100, 28); mezcla(c, [P_EMPUJA,i], [P_SENTADO,0], 36, 8, 0);
      linea(c, CABLE, X+caja(P_EMPUJA, i, 30, 38).x1-1, Y+41, 100, 46); }) },
    maquina:{ ms:190, pasos:[[2,6],[2,6],[0,0],[1,0],[0,0],[2,6]].map(([i,dy])=>c=>{
      rect(c, MADERA, 28, 50, 23, 4); rect(c, MADERA, 26, 26, 4, 25); rect(c, ACERO, 32, 54, 2, EJ_PISO-54); rect(c, ACERO, 45, 54, 2, EJ_PISO-54); pon(c, P_SENTADO, i, -1, dy); }) },
    cinta:{ ms:90, pasos:[0,1,2,3,4,5,6,7].map(i=>c=>{
      rect(c, OSCURO, 14, EJ_PISO-5, 79, 4); for(let x=14+(i*3)%6;x<92;x+=6) rect(c, ACERO, x, EJ_PISO-4, 1, 1);
      linea(c, ACERO, 92, EJ_PISO-5, 96, 28); rect(c, ACERO, 92, 24, 8, 5); pon(c, P_CORRE, i, -4, -1); }) },
    bici:{ ms:120, pasos:[0,1,2,3,4,5].map(i=>c=>{
      for(let a=0;a<6.3;a+=.03) rect(c, ACERO, Math.round(72+12*Math.cos(a)), Math.round(54+12*Math.sin(a)), 1, 1);
      linea(c, ACERO, 40, 50, 60, 60); linea(c, ACERO, 44, 48, 44, 66); linea(c, ACERO, 40, 65, 76, 65); linea(c, ACERO, 72, 50, 76, 30); rect(c, ACERO, 70, 28, 11, 3);
      const a = i/6*6.28; linea(c, HIERRO, 72, 54, 72+Math.round(6*Math.cos(a)), 54+Math.round(6*Math.sin(a))); pon(c, P_SENTADO, 2, -2, -6+i%2); }) },
    comba:{ ms:110, pasos:[[0,[56,66,28,4,0,Math.PI]],[-1,[56,50,42,22,0,Math.PI]],[-5,[56,32,42,28,Math.PI,6.28]],[-6,[56,28,26,22,Math.PI,6.28]],[-5,[56,32,42,28,Math.PI,6.28]],[-1,[56,50,42,22,0,Math.PI]]].map(([dy,a])=>c=>{ pon(c, P_QUIETO, 0, 0, dy); arco(c, ...a); }) },
    zancada:{ ms:190, pasos:[0,2,6,6,2,0].map(dy=>c=>{ if(!dy) pon(c, P_QUIETO, 1); else mezcla(c, [P_QUIETO,1], [P_CORRE,0], 38, 0, 0); }) },
    gemelos:{ ms:120, pasos:[0,-1,-2,-3,-3,-2,-1,0].map(dy=>c=>pon(c, P_QUIETO, 0, 0, dy)) },
    m_extension:{ ms:170, pasos:[0,0,.35,.7,1,1,.7,.35].map(t=>c=>pierna(c, t, false)) },
    m_curlfem:{ ms:170, pasos:[1,1,.7,.35,0,0,.35,.7].map(t=>c=>pierna(c, t, true)) },
    m_pecho:{ ms:170, pasos:[1,1,2,3,4,5,5,4,3,2].map(i=>c=>empuje(c, i, -12, (c,x,y)=>{ linea(c, PLATA, 16, 22, x+8, 22); linea(c, PLATA, x+8, 22, x+1, y); })) },
    m_triceps:{ ms:190, pasos:[2,2,1,0,0,1].map(i=>c=>empuje(c, i, -12, (c,x,y)=>linea(c, PLATA, x, y, 22, 60))) },
    m_remo:{ ms:170, pasos:[5,4,3,2,2,3,4,5].map(i=>c=>empuje(c, i, -17, (c,x,y)=>linea(c, PLATA, x, y, 74, 22))) },
    m_hombro:{ ms:190, pasos:[3,4,5,5,4,3].map(i=>c=>{ fondo(c); const m = manos(P_FRENTE, i);
      linea(c, PLATA, m.x0, m.y, 46, 16); linea(c, PLATA, m.x1, m.y, 66, 16); frontal(c, P_FRENTE, i); rect(c, NEGRO, m.x0-3, m.y-1, 6, 3); rect(c, NEGRO, m.x1-2, m.y-1, 6, 3); }) },
    m_mariposa:{ ms:190, pasos:[4,4,3,2,2,3].map(i=>c=>{ fondo(c); const m = manos(P_FRENTE, i), a = i===2 ? 51 : m.x0, b = i===2 ? 61 : m.x1;
      linea(c, PLATA, a, m.y, 46, 14); linea(c, PLATA, b, m.y, 66, 14); frontal(c, P_FRENTE, i); rect(c, NEGRO, a-1, m.y-5, 3, 11); rect(c, NEGRO, b-1, m.y-5, 3, 11); }) },
    m_lateral:{ ms:190, pasos:[1,3,4,4,3,1].map(i=>c=>{ fondo(c); const m = manos(P_FRENTE, i);
      linea(c, PLATA, m.x0, m.y, 50, 30); linea(c, PLATA, m.x1, m.y, 62, 30); frontal(c, P_FRENTE, i); rect(c, NEGRO, m.x0-1, m.y-4, 7, 4); rect(c, NEGRO, m.x1-5, m.y-4, 7, 4); }) },
    m_biceps:{ ms:190, pasos:[1,1,3,2,2,3].map(i=>c=>{ fondo(c); rect(c, PLATA, 34, 52, 45, 2); rect(c, NEGRO, 34, 54, 45, 4); frontal(c, P_FRENTE, i);
      rect(c, HIERRO, 44, manos(P_FRENTE, i).y, 25, 2); }) },
    m_jalon:{ ms:170, pasos:[5,5,4,3,3,4].map(f=>c=>barraJalon(c, f, false)) },
    m_pulldown:{ ms:170, pasos:[5,5,4,3,3,4].map(f=>c=>barraJalon(c, f, true)) },
    m_glute:{ ms:170, pasos:[0,0,.35,.7,1,1,.7,.35].map(t=>c=>{
      const ropa = tono(24,49,40,54), bota = tono(24,56,40,62), cad = [46,53], a = (100+95*t)*Math.PI/180, b = (170+25*t)*Math.PI/180;
      const rod = [cad[0]+9*Math.cos(a), cad[1]+9*Math.sin(a)], pie = [rod[0]+9*Math.cos(b), rod[1]+9*Math.sin(b)];
      fondo(c); miembro(c, cad, rod, ropa, 5); miembro(c, rod, pie, ropa, 4); miembro(c, pie, [pie[0]-1, pie[1]+3], bota, 3); pon(c, P_QUIETO, 1, 0, -6); }) },
    m_asistida:{ ms:150, pasos:[[P_ESPALDA,5,-9],[P_ESPALDA,5,-9],[P_TREPA,2,-14],[P_TREPA,5,-19],[P_TREPA,5,-19],[P_TREPA,2,-14],[P_ESPALDA,5,-9],[P_ESPALDA,5,-9]].map(([fila,i,dy])=>c=>{
      fondo(c); pon(c, fila, i, 0, dy); rect(c, NEGRO, 44, Y+dy+58, 24, 4); linea(c, CABLE, 56, Y+dy+62, 56, 68); }) },
    m_fondos:{ ms:170, pasos:[0,0,-2,-4,-4,-2].map(dy=>c=>{ const m = manos(P_ESPALDA, 1, 0);
      fondo(c); pon(c, P_ESPALDA, 1, 0, dy-6); rect(c, NEGRO, m.x0-4, m.y-2, 8, 3); rect(c, NEGRO, m.x1-3, m.y-2, 8, 3); rect(c, NEGRO, 44, Y+dy+52, 24, 4); linea(c, CABLE, 56, Y+dy+56, 56, 68); }) },
  };
  return F[familia] || F.espera;
}
async function tiraEjercicio(av, familia, conCarga){
  const clave = `${JSON.stringify(av)}|${familia}|${conCarga}`;
  if(tirasEj.has(clave)) return tirasEj.get(clave);
  const [base, maquina] = await Promise.all([hojaEjercicio(av), cargarMaquina(MAQ_EJ[familia])]);
  const { ms, pasos } = pasosEjercicio(base, familia, conCarga, maquina);
  const tira = document.createElement("canvas"); tira.width = EJ_W*pasos.length; tira.height = EJ_H;
  const ctx = tira.getContext("2d");
  pasos.forEach((paso,i)=>{
    const c = document.createElement("canvas"); c.width = EJ_W; c.height = EJ_H;
    paso(c.getContext("2d")); ctx.drawImage(c, i*EJ_W, 0);
  });
  const res = { url:tira.toDataURL(), n:pasos.length, ms };
  if(tirasEj.size>30) tirasEj.clear();
  tirasEj.set(clave, res);
  return res;
}
function HeroeEjercicio({ av, nombre }){
  if(ALT) return null;
  const familia = familiaEjercicio(nombre), conCarga = !isBodyweight(nombre), clave = `${JSON.stringify(av)}|${familia}|${conCarga}`;
  const [tira, setTira] = useState(()=>tirasEj.get(clave) || null), [i, setI] = useState(0);
  useEffect(()=>{ let vivo = true; tiraEjercicio(av, familia, conCarga).then(t=>{ if(vivo){ setTira(t); setI(0); } }); return ()=>{ vivo = false; }; }, [clave]);
  useEffect(()=>{
    if(!tira || window.matchMedia?.("(prefers-reduced-motion:reduce)").matches) return;
    const id = setInterval(()=>setI(n=>(n+1)%tira.n), tira.ms);
    return ()=>clearInterval(id);
  }, [tira]);
  return (
    <div className="fh-escena" aria-hidden="true" style={{ display:"flex", justifyContent:"center", height:EJ_H*2-14, marginBottom:11, border:"1px solid var(--line)", overflow:"hidden" }}>
      <span className="fh-sprite" style={{ width:EJ_W*2, height:EJ_H*2, marginTop:-6, backgroundImage:tira ? `url(${tira.url})` : undefined,
        backgroundSize:tira ? `${EJ_W*2*tira.n}px ${EJ_H*2}px` : undefined, backgroundPosition:`${-i*EJ_W*2}px 0` }}/>
    </div>
  );
}
/* Solo la cara, para los sitios pequeños. El recuadro de 26 px es donde cae la cabeza. */
function AvatarCara({ av, size=32, style }){
  if(ALT) return null;
  const url = useHojaAvatar(av), k = size/26;
  return <span className="fh-sprite" aria-hidden="true" style={{ width:size, height:size, backgroundImage:url ? `url(${url})` : undefined,
    backgroundSize:`${576*k}px ${128*k}px`, backgroundPosition:`${-19*k}px ${-7*k}px`, ...style }}/>;
}
const CORAZON = ["..XX.XX..",".XOXXXXX.","XOXXXXXXX","XXXXXXXXX",".XXXXXXX.","..XXXXX..","...XXX...","....X...."];
function CorazonPixel({ size=72, className="", style }){
  return (
    <svg className={className} style={style} width={size} height={size*8/9} viewBox="0 0 9 8" shapeRendering="crispEdges" role="img" aria-label="Vida">
      {CORAZON.flatMap((fila,y)=>[...fila].map((c,x)=> c==="." ? null : <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={c==="O" ? "#FFD2D0" : "#E8433F"}/>))}
    </svg>
  );
}

/* --- Sonido -----------------------------------------------------------------
   Con Web Audio y NO con <audio>: un <audio> pide el foco de audio a Android y
   te baja o te para la música que llevas en los cascos, justo en el gimnasio.
   El navegador no deja sonar nada hasta el primer toque, así que se prepara ahí. */
let sonidoActivo = true, audioCtx = null;
const sfxBuf = {};
function prepararSonido(){
  if(audioCtx) return;
  const AC = window.AudioContext || window.webkitAudioContext;
  if(!AC) return;
  try{ audioCtx = new AC(); }catch{ return; }
  ["serie","record","levelup","vida","gameover"].forEach(async n=>{
    try{
      const r = await fetch(`sfx/${n}.mp3`);
      sfxBuf[n] = await audioCtx.decodeAudioData(await r.arrayBuffer());
    }catch{ /* sin ese sonido se sigue igual */ }
  });
}
function sfx(nombre, volumen=.5){
  if(!sonidoActivo || !audioCtx || !sfxBuf[nombre]) return;
  try{
    audioCtx.resume?.();
    const f = audioCtx.createBufferSource(), g = audioCtx.createGain();
    f.buffer = sfxBuf[nombre]; g.gain.value = volumen;
    f.connect(g); g.connect(audioCtx.destination); f.start();
  }catch{ /* un efecto no merece romper nada */ }
}
function vibrar(p){ try{ navigator.vibrate?.(p); }catch{ /* no todos los navegadores */ } }
/* Golpes de combate: cortos y muchos, así que se sintetizan en vez de bajar ficheros. */
const TONOS = { golpe:["square",240,60,.09,.1], enemigo:["sawtooth",130,38,.14,.12], cura:["sine",480,920,.14,.1], escudo:["triangle",320,300,.08,.1] };
function tono(nombre){
  if(!sonidoActivo || !audioCtx) return;
  try{
    const [forma, de, a, dura, vol] = TONOS[nombre], o = audioCtx.createOscillator(), g = audioCtx.createGain(), t = audioCtx.currentTime;
    audioCtx.resume?.();
    o.type = forma; o.frequency.setValueAtTime(de, t); o.frequency.exponentialRampToValueAtTime(a, t+dura);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.001, t+dura);
    o.connect(g); g.connect(audioCtx.destination); o.start(t); o.stop(t+dura);
  }catch{ /* un efecto no merece romper nada */ }
}

/* --- Pantallas de efecto ---------------------------------------------------- */
function Particulas({ colores, n=34 }){
  const ps = useMemo(()=>Array.from({ length:n }, (_,i)=>{
    const a = Math.random()*Math.PI*2, d = 120 + Math.random()*210;
    return { dx:Math.round(Math.cos(a)*d), dy:Math.round(Math.sin(a)*d), t:4+2*Math.floor(Math.random()*3), c:colores[i%colores.length], r:(Math.random()*.22).toFixed(2) };
  }), [n]);
  return ps.map((p,i)=><i key={i} className="fx-part" style={{ width:p.t, height:p.t, background:p.c, "--dx":`${p.dx}px`, "--dy":`${p.dy}px`, animationDelay:`${p.r}s` }}/>);
}
function TituloArcade({ texto }){
  return <div className="fx-titulo" role="heading" aria-level={1} aria-label={texto}>
    {[...texto].map((c,i)=><span key={i} aria-hidden="true" style={{ animationDelay:`${i*.05}s` }}>{c===" " ? "\u00A0" : c}</span>)}
  </div>;
}
function EfectoPantalla({ efecto, onFin, avatar, onVerEquipo }){
  const hecho = useRef(false);
  const cerrar = ()=>{ if(hecho.current) return; hecho.current = true; onFin(); };
  const espera = efecto.tipo === "gameOver" || efecto.tipo === "botin";     // estos no se van solos: hay que decidir
  useEffect(()=>{
    if(efecto.tipo==="levelUp"){ sfx("levelup",.6); vibrar([50,40,120]); }
    if(efecto.tipo==="vidaExtra"){ sfx("vida",.6); vibrar([40,30,40,30,90]); }
    if(efecto.tipo==="gameOver"){ sfx("gameover",.6); vibrar(220); }
    if(efecto.tipo==="botin"){ sfx("record",.6); vibrar([30,30,30,30,90]); }
    if(espera) return;
    const t = setTimeout(cerrar, 3400);
    return ()=>clearTimeout(t);
  }, []);

  if(efecto.tipo==="gameOver") return (
    <div className="fx fx-over" style={{ "--fx":"#E8433F" }} role="dialog" aria-modal="true" aria-label="Game Over">
      <div style={{ position:"relative", width:96, height:112, display:"flex", alignItems:"flex-end", justifyContent:"center" }}>
        <Sprite id={SPR.fantasma} size={48} className="fx-fantasma" style={{ position:"absolute", top:0 }}/>
        <Sprite id={SPR.lapida} size={80}/>
      </div>
      <TituloArcade texto="GAME OVER"/>
      <div className="fx-sub">{efecto.titulo}</div>
      <div className="fx-nota">{efecto.nota}</div>
      <button className="fh-btn fx-boton" onClick={cerrar} autoFocus>CONTINUAR</button>
    </div>
  );

  if(efecto.tipo==="botin") return (
    <div className="fx" style={{ "--fx":"#3DDC84" }} role="dialog" aria-modal="true" aria-label="New Gear">
      <div className="fx-rayos"/>
      <Particulas colores={["#3DDC84","#FFC83D","#FFFFFF"]}/>
      <span className="fx-salto" style={{ display:"inline-flex" }}><Sprite id={SPR.cofre} size={96}/></span>
      <TituloArcade texto="NEW GEAR!"/>
      <div className="fx-sub">{efecto.piezas[0].n}</div>
      <div className="fx-nota">{efecto.piezas.length>1 ? `Y ${efecto.piezas.length-1} más. ` : ""}Ganado con tus series de {RAMA[efecto.piezas[0].rama].estilo.toLowerCase()}.</div>
      <button className="fh-btn fx-boton" onClick={()=>{ cerrar(); onVerEquipo(); }} autoFocus>VER EQUIPO</button>
      <button className="fh-btn" onClick={cerrar} style={{ background:"none", color:"#C9C2DC", padding:10, fontSize:17 }}>Seguir</button>
    </div>
  );

  const vida = efecto.tipo==="vidaExtra";
  const color = vida ? "#FF5A5F" : "#FFC83D";
  return (
    <div className="fx" style={{ "--fx":color }} onClick={cerrar} role="dialog" aria-modal="true" aria-label={vida ? "Extra Life" : "Level Up"}>
      <div className="fx-rayos"/>
      <Particulas colores={vida ? ["#FF5A5F","#FFD2D0","#FFFFFF"] : ["#FFC83D","#FFFFFF","#3DDC84","#4FC3F7"]}/>
      {vida
        ? <CorazonPixel size={90} className="fx-latido"/>
        : <span className="fx-salto" style={{ display:"inline-flex" }}><Avatar av={avatar} escala={2}/></span>}
      <TituloArcade texto={vida ? "EXTRA LIFE!" : "LEVEL UP!"}/>
      {vida ? <>
        <div className="fx-sub">+1 día de descanso</div>
        <div className="fx-nota">Objetivo semanal cumplido. Te salva una semana floja sin perder la racha.</div>
      </> : <>
        <div className="fx-sub">Nivel {efecto.nivel}</div>
        {efecto.rango && <div className="fx-nota">Nuevo rango: <b style={{ color }}>{efecto.rango}</b></div>}
      </>}
      <div className="fx-pista">TOCA PARA SEGUIR</div>
    </div>
  );
}

/* Sube hasta un número en vez de plantarlo: el XP se gana delante de ti. */
function useCuenta(objetivo, ms=900){
  const [v, setV] = useState(0);
  useEffect(()=>{
    if(window.matchMedia?.("(prefers-reduced-motion:reduce)").matches){ setV(objetivo); return; }
    const t0 = performance.now(); let id;
    const paso = t=>{ const k = Math.min(1,(t-t0)/ms); setV(Math.round(objetivo*k)); if(k<1) id = requestAnimationFrame(paso); };
    id = requestAnimationFrame(paso);
    return ()=>cancelAnimationFrame(id);
  }, [objetivo]);
  return v;
}

function Toast({ toast }){
  if(!toast) return null;
  const C = toast.icon || Sparkles;
  return (
    <div style={{ position:"fixed", top:"calc(16px + var(--st))", left:0, right:0, zIndex:250, display:"flex", justifyContent:"center", padding:"0 16px", pointerEvents:"none" }}>
      <div className="fh-card fh-in" style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 16px", borderColor:"var(--gold)", maxWidth:440, width:"100%", background:"var(--card2)" }}>
        <div style={{ background:"var(--gold)", borderRadius:10, padding:7, display:"flex" }}><C size={18} color="#0F131A"/></div>
        <div>
          <div className="disp" style={{ fontWeight:700, fontSize:14 }}>{toast.title}</div>
          {toast.sub && <div style={{ fontSize:12, color:"var(--muted)" }}>{toast.sub}</div>}
        </div>
      </div>
    </div>
  );
}

/* --- La mazmorra ---------------------------------------------------------------
   Las reglas están en mazmorra.js; esto solo las pinta. Se juega en el descanso y
   también desde Inicio, y es la misma partida: por turnos y guardada tras cada toque,
   así que el descanso puede acabarse a media jugada sin perder nada. Nunca da XP,
   niveles ni equipo: el héroe llega con lo que se ha ganado en el gimnasio. */
const NPC_BASE = { piel:"clara", pelo:"plain", colorPelo:"castano", barba:null, ojos:"brown" };
const NPCS = [
  { id:"npc-bruna",  nombre:"Bruna",  oficio:"La monitora",        avatar:{ ...NPC_BASE, sexo:"f", rama:"monje",      piel:"morena", pelo:"ponytail", colorPelo:"negro", armadura:"hueso" } },
  { id:"npc-tobias", nombre:"Tobías", oficio:"El del mostrador",   avatar:{ ...NPC_BASE, sexo:"m", rama:"explorador", pelo:"messy1", colorPelo:"rubio", armadura:"esmeralda" } },
  { id:"npc-nuria",  nombre:"Nuria",  oficio:"La de las pesas",    avatar:{ ...NPC_BASE, sexo:"f", rama:"barbaro",    piel:"tostada", pelo:"bob", colorPelo:"pelirrojo", armadura:"bronce" } },
  { id:"npc-ramiro", nombre:"Ramiro", oficio:"El de toda la vida", avatar:{ ...NPC_BASE, sexo:"m", rama:"guerrero",   pelo:"buzzcut", colorPelo:"gris", barba:"beards_medium", armadura:"acero" } },
  { id:"npc-sombra", nombre:"Sombra", oficio:"Va a su bola",       avatar:{ ...NPC_BASE, sexo:"f", rama:"picaro",     piel:"oliva", pelo:"pixie", colorPelo:"morado", armadura:"cuero" } },
].map(n=>({ ...n, level:4, tipo:"npc", avatar:{ ...n.avatar, equipo:equipoDeRama(n.avatar.rama, {}) } }));

/* Lo que llega de otro móvil no se da por bueno: puede ser de otra versión. */
function normalizarAvatar(av){
  if(!av || typeof av!=="object" || !RAMA[av.rama]) return null;
  const equipo = {};
  Object.entries(av.equipo||{}).forEach(([ranura,id])=>{ if(AVATAR.piezas[id]?.ranura===ranura) equipo[ranura] = id; });
  return { sexo:av.sexo==="f" ? "f" : "m", rama:av.rama, piel:RAMPAS.piel[av.piel] ? av.piel : "clara",
    pelo:AVATAR.pelos[av.pelo] ? av.pelo : null, colorPelo:RAMPAS.pelo[av.colorPelo] ? av.colorPelo : "castano",
    barba:AVATAR.barbas[av.barba] ? av.barba : null, ojos:AVATAR.ojos[av.ojos] ? av.ojos : "brown",
    armadura:RAMPAS.armadura[av.armadura] ? av.armadura : "acero", equipo, especial:M.ESPECIALES[av.especial] ? av.especial : null };
}
/* Quien aún no ha abierto una versión con avatar sale como recluta. La rama sale de
   su nombre para que no cambie de una partida a otra. */
function aliadoDeAmigo(a){
  const h = [...String(a.handle||a.id)].reduce((n,c)=>n+c.charCodeAt(0),0), rama = RAMAS[h%RAMAS.length].id;
  const avatar = normalizarAvatar(a.avatar) || { ...NPC_BASE, sexo:h%2 ? "f" : "m", rama, armadura:RAMA[rama].armadura, equipo:equipoDeRama(rama, {}) };
  return { id:a.id, nombre:a.display_name || a.handle || "Amigo", oficio:`Nivel ${a.level||1}`, tipo:"amigo", level:a.level||1, avatar };
}

const CARA_INFO = { golpe:["Golpe",104,"#7A2230"], doble:["Doble golpe",103,"#7A3A22"], barrido:["Barrido",118,"#6B2A6E"], escudo:["Escudo",101,"#23507A"], cura:["Cura",115,"#1F6B4A"], vacio:["Vacío",null,"#2A2438"] };
function CaraPlana({ cara, style }){
  const [, sprite, fondo] = CARA_INFO[cara.t];
  return (
    <span className="fh-cara3d" style={{ background:fondo, ...style }}>
      {sprite!=null && <Sprite id={sprite} size={32}/>}
      {cara.t!=="vacio" && <span className="arcade" style={{ position:"absolute", right:2, bottom:2, fontSize:11, color:"#FFF", textShadow:"1px 1px 0 #000" }}>{cara.v}</span>}
    </span>
  );
}
/* Giro que deja cada cara del cubo mirando de frente, en el orden en que se pintan. */
const CARAS_CUBO = [[0,0],[0,180],[0,-90],[0,90],[-90,0],[90,0]];
const POS_CARA = z=>["",`rotateY(180deg)`,`rotateY(90deg)`,`rotateY(-90deg)`,`rotateX(90deg)`,`rotateX(-90deg)`].map(g=>`${g} translateZ(${z}px)`);
/* Dado de verdad: un cubo con las seis caras de ese héroe, que entra lanzado desde abajo,
   da vueltas, rebota y cae en la cara que ha salido. Va con la Web Animations API y no con
   @keyframes porque cada tirada acaba en una orientación distinta. Se usa `fill:backwards`
   para que espere su turno ya fuera de sitio, y al acabar manda el `transform` en línea,
   que es la cara real: si la animación no llega a correr, el dado sigue siendo correcto. */
function Dado3D({ caras, d, tam=50, animar, retraso=0, activo, onClick, etiqueta }){
  const caja = useRef(null), cubo = useRef(null);
  const [rx, ry] = CARAS_CUBO[d.i];
  // Hacia atrás medio lado: si no, la cara de delante se ve más grande que su hueco.
  const fondo = `translateZ(${-tam/2}px)`;
  useLayoutEffect(()=>{
    if(!animar || window.matchMedia?.("(prefers-reduced-motion:reduce)").matches || !cubo.current?.animate) return;
    const vueltas = ()=>360*(2+Math.floor(Math.random()*2))*(Math.random()<.5 ? -1 : 1), dura = 780;
    const opts = { duration:dura, delay:retraso, fill:"backwards" };
    cubo.current.animate([{ transform:`${fondo} rotateX(${rx+vueltas()}deg) rotateY(${ry+vueltas()}deg)` }, { transform:`${fondo} rotateX(${rx}deg) rotateY(${ry}deg)` }],
      { ...opts, easing:"cubic-bezier(.16,.72,.24,1)" });
    const lado = Math.round((Math.random()-.5)*70);
    caja.current.animate([
      { transform:`translate(${lado}px,190px) scale(1.5)`, opacity:0, easing:"cubic-bezier(.2,.8,.4,1)" },
      { transform:`translate(${Math.round(lado/3)}px,-26px) scale(1.15)`, opacity:1, offset:.46, easing:"cubic-bezier(.5,0,.8,.6)" },
      { transform:"translate(0,0) scale(1)", offset:.7, easing:"cubic-bezier(.2,.7,.4,1)" },
      { transform:"translate(0,-8px) scale(1)", offset:.84, easing:"cubic-bezier(.5,0,.8,.6)" },
      { transform:"translate(0,0) scale(1)" },
    ], opts);
    const t = setTimeout(()=>{ sfx("serie",.16); vibrar(6); }, retraso+dura*.7);
    return ()=>clearTimeout(t);
  }, [d.tiro]);
  const pos = POS_CARA(tam/2);
  return (
    <button onClick={onClick} aria-label={etiqueta} aria-pressed={d.fijo || activo || undefined}
      style={{ width:tam, height:tam, padding:0, background:"none", border:"none", cursor:"pointer", flexShrink:0, opacity:d.usado ? .3 : 1,
        outline:activo ? "3px solid #FFF" : d.fijo ? "3px solid var(--gold)" : d.superserie ? "3px solid var(--jade)" : "none", outlineOffset:1 }}>
      <span ref={caja} className="fh-caja3d">
        <span ref={cubo} className="fh-cubo" style={{ transform:`${fondo} rotateX(${rx}deg) rotateY(${ry}deg)` }}>
          {caras.map((c,i)=><CaraPlana key={i} cara={i===d.i ? d.cara : c} style={{ transform:pos[i] }}/>)}
        </span>
      </span>
    </button>
  );
}
function BarraVida({ hp, max, color="#3DDC84", escudo=0 }){
  return (<>
    <div style={{ position:"relative", height:7, background:"rgba(0,0,0,.6)", border:"1px solid #000", overflow:"hidden" }}>
      <i style={{ position:"absolute", left:0, top:0, bottom:0, width:`${Math.max(0,hp/max)*100}%`, background:color, transition:"width .24s steps(5)" }}/>
    </div>
    <div className="mono" style={{ fontSize:10, lineHeight:1.3, color:"#FFF", textShadow:"1px 1px 0 #000", whiteSpace:"nowrap" }}>{hp}/{max}{escudo>0 && <span style={{ color:"#7FC8F8" }}> +{escudo}</span>}</div>
  </>);
}
function IntentoEnemigo({ e, heroes }){
  const { t, v, obj } = e.intento||{};
  if(!t) return null;
  const texto = t==="golpe" ? `-${v} a ${heroes[obj]?.nombre||"?"}` : t==="todos" ? `-${v} a todos` : t==="bloqueo" ? `se protege ${v}` : `cura ${v}`;
  return <div style={{ fontSize:10.5, fontWeight:700, lineHeight:1.2, color:t==="golpe"||t==="todos" ? "#FF9A8C" : "#9FD8FF", textShadow:"1px 1px 0 #000" }}>{texto}</div>;
}

function CaraMini({ cara }){
  const [nombre, sprite, fondo] = CARA_INFO[cara.t];
  return (
    <span title={`${nombre} ${cara.v||""}`} style={{ position:"relative", width:30, height:30, flexShrink:0, background:fondo, display:"inline-flex", alignItems:"center", justifyContent:"center", boxShadow:"inset 0 0 0 1px rgba(255,255,255,.3)" }}>
      {sprite!=null && <Sprite id={sprite} size={16}/>}
      {cara.t!=="vacio" && <span className="arcade" style={{ position:"absolute", right:1, bottom:1, fontSize:7, color:"#FFF", textShadow:"1px 1px 0 #000" }}>{cara.v}</span>}
    </span>
  );
}
/* Las seis caras, la vida y el especial: lo que hace falta para montar un grupo con cabeza. */
function FichaDado({ h }){
  const e = M.especialDe(h);
  return (<>
    <span style={{ display:"flex", gap:3, marginTop:5 }}>{h.caras.map((c,i)=><CaraMini key={i} cara={c}/>)}</span>
    <span style={{ display:"block", fontSize:11.5, color:"var(--muted)", marginTop:4, lineHeight:1.35 }}>
      <b style={{ color:"var(--gold)" }}>{e.nombre}</b> ({e.coste} de Impulso): {e.texto(h.ataque, h.apoyo)}
    </span>
    {M.rasgosDe(h).map(id=><span key={id} style={{ display:"block", fontSize:11.5, color:"var(--muted)", marginTop:2, lineHeight:1.35 }}>
      <b style={{ color:"#9FD8FF" }}>{M.RASGOS[id].nombre}</b> · {M.TIPOS[M.tipoDe(h)]}: {M.RASGOS[id].texto}
    </span>)}
  </>);
}
function ChipsSinergia({ heroes }){
  const activas = M.sinergiasDe(heroes);
  if(!activas.length) return null;
  return <span style={{ display:"flex", flexWrap:"wrap", gap:4 }}>{activas.map(id=><span key={id} title={M.SINERGIAS[id].texto} style={{ fontSize:10.5, fontWeight:700, lineHeight:1.2, padding:"2px 6px", color:"#1A1020", background:"var(--jade)" }}>{M.SINERGIAS[id].nombre}</span>)}</span>;
}
const sumaCaras = (grupo, f) => grupo.reduce((n,h)=>n+h.caras.filter(c=>f(c.t)).length, 0);

function ReclutarGrupo({ yo, aliados, mz, compacto, puntos, onEntrar, onEspecial, onAyuda }){
  const [grupo, setGrupo] = useState([]);
  const [elegir, setElegir] = useState(false);
  const lider = M.liderazgoDe(yo), r0 = RAMA[yo.rama];
  /* Se enseñan como van a entrar de verdad, con tu liderazgo ya sumado. */
  const fichas = useMemo(()=>aliados.map(a=>({ a, h:M.conLiderazgo(M.crearHeroe(a, AVATAR.piezas), lider) })), [aliados, lider]);
  const alterna = a=>setGrupo(g=>g.some(x=>x.id===a.id) ? g.filter(x=>x.id!==a.id) : g.length<3 ? [...g,a] : g);
  const dentro = [yo, ...fichas.filter(f=>grupo.some(x=>x.id===f.a.id)).map(f=>f.h)];
  const disponibles = Object.values(M.ESPECIALES).filter(e=>M.especialDisponible(e, puntos));
  return (
    <div style={{ textAlign:"left" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8 }}>
        <p style={{ fontSize:12.5, color:"var(--muted)", margin:"0 0 10px", lineHeight:1.45 }}>
          Elige hasta 3 compañeros mirando sus dados{lider>0 ? <>. Tu liderazgo les da <b style={{ color:"var(--gold)" }}>+{lider}</b>, y ya está sumado</> : ""}.
        </p>
        <BotonAyuda onClick={onAyuda}/>
      </div>
      <div style={{ fontSize:12, lineHeight:1.45, margin:"0 0 8px", padding:"8px 10px", background:"var(--bg2)", border:`1px solid ${mz.llaves>0 ? "var(--gold)" : "var(--line2)"}`, color:"var(--muted)" }}>
        {mz.llaves>0 ? <><b style={{ color:"var(--gold)" }}>{mz.llaves} {mz.llaves===1 ? "llave" : "llaves"}</b>: esta partida da Gloria y cuenta para la clasificación.</>
          : <><b style={{ color:"var(--txt)" }}>Sin llaves</b>: puedes jugar de práctica, pero no puntúa. Cada día que termines un entreno ganas una.</>}
      </div>
      <div style={{ maxHeight:compacto ? 270 : "none", overflowY:compacto ? "auto" : "visible", marginBottom:8 }}>
        <div style={{ padding:"7px 10px", marginBottom:5, background:"var(--card2)", border:`1px solid ${r0.color}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <AvatarCara av={yo.avatar} size={34}/>
            <span style={{ flex:1, minWidth:0 }}>
              <span style={{ display:"block", fontSize:13.5, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{yo.nombre}</span>
              <span style={{ display:"block", fontSize:11, color:"var(--faint)" }}><span style={{ color:r0.color }}>{r0.nombre}</span> · {yo.hpMax} de vida</span>
            </span>
            <button className="fh-btn" onClick={()=>setElegir(v=>!v)} aria-expanded={elegir} style={{ flexShrink:0, padding:"6px 9px", fontSize:13, background:"var(--card)", color:"var(--txt)", border:"1px solid var(--line2)" }}>Especial</button>
          </div>
          <FichaDado h={yo}/>
          {elegir && <div style={{ marginTop:7 }}>
            {disponibles.map(e=>(
              <button key={e.id} aria-pressed={M.especialDe(yo).id===e.id} onClick={()=>{ onEspecial(e.id); setElegir(false); }}
                style={{ display:"block", width:"100%", textAlign:"left", padding:"6px 8px", marginBottom:4, cursor:"pointer", color:"var(--txt)", background:"var(--bg2)", border:`1px solid ${M.especialDe(yo).id===e.id ? RAMA[e.rama].color : "var(--line)"}` }}>
                <span style={{ display:"block", fontSize:12.5 }}>{e.nombre} <span style={{ color:"var(--faint)" }}>· {e.coste} de Impulso</span></span>
                <span style={{ display:"block", fontSize:11, color:"var(--muted)", lineHeight:1.3 }}>{e.texto(yo.ataque, yo.apoyo)}</span>
              </button>
            ))}
            <div style={{ fontSize:11, color:"var(--faint)", lineHeight:1.35 }}>Se ganan más entrenando. Míralos todos en el botón de ayuda.</div>
          </div>}
        </div>
        {fichas.map(({ a, h })=>{
          const metido = grupo.some(x=>x.id===a.id), r = RAMA[a.avatar.rama];
          return (
            <button key={a.id} onClick={()=>alterna(a)} aria-pressed={metido}
              style={{ display:"block", width:"100%", textAlign:"left", padding:"7px 10px", marginBottom:5, cursor:"pointer", color:"var(--txt)", background:metido ? "var(--card2)" : "var(--bg2)", border:`1px solid ${metido ? r.color : "var(--line)"}` }}>
              <span style={{ display:"flex", alignItems:"center", gap:10 }}>
                <AvatarCara av={a.avatar} size={34}/>
                <span style={{ flex:1, minWidth:0 }}>
                  <span style={{ display:"block", fontSize:13.5, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{a.nombre}{a.tipo==="amigo" && <span style={{ color:"var(--gold)", fontSize:10.5, marginLeft:6 }}>AMIGO</span>}</span>
                  <span style={{ display:"block", fontSize:11, color:"var(--faint)" }}><span style={{ color:r.color }}>{r.nombre}</span> · {a.oficio} · {h.hpMax} de vida</span>
                </span>
                {metido && <Check size={16} color={r.color} style={{ flexShrink:0 }}/>}
              </span>
              <FichaDado h={h}/>
            </button>
          );
        })}
      </div>
      <div style={{ fontSize:11.5, color:"var(--muted)", margin:"0 2px 8px", lineHeight:1.4 }}>
        Tu grupo: <b style={{ color:"#FF9A8C" }}>{sumaCaras(dentro, t=>t==="golpe"||t==="doble"||t==="barrido")} ataque</b> · <b style={{ color:"#7FC8F8" }}>{sumaCaras(dentro, t=>t==="escudo")} escudo</b> · <b style={{ color:"#3DDC84" }}>{sumaCaras(dentro, t=>t==="cura")} cura</b> · {sumaCaras(dentro, t=>t==="vacio")} vacías
        <div style={{ marginTop:5 }}>
          {M.sinergiasDe(dentro).length ? <><ChipsSinergia heroes={dentro}/><span style={{ display:"block", marginTop:3, fontSize:11 }}>{M.sinergiasDe(dentro).map(id=>M.SINERGIAS[id].texto).join(" ")}</span></>
            : <span style={{ fontSize:11, color:"var(--faint)" }}>Sin sinergias. Dos héroes del mismo tipo, o cuatro tipos distintos, activan una.</span>}
        </div>
      </div>
      <button className="fh-btn" onClick={()=>onEntrar(grupo)} style={{ width:"100%", padding:12, fontSize:17, background:"var(--gold)", color:"#1A1020" }}>{mz.llaves>0 ? "Entrar (gasta 1 llave)" : "Entrar a practicar"}</button>
    </div>
  );
}

function BotonAyuda({ onClick }){
  return <button onClick={onClick} aria-label="Ayuda de la mazmorra" title="Ayuda" className="arcade"
    style={{ flexShrink:0, width:28, height:28, padding:0, fontSize:11, cursor:"pointer", background:"var(--card2)", color:"var(--gold)", border:"1px solid var(--line2)" }}>?</button>;
}

const AYUDA_CARAS = [["golpe","Quita vida a un enemigo."],["doble","Golpea dos veces al mismo enemigo."],["barrido","Golpea a todos los enemigos."],
  ["escudo","Protege a un compañero hasta el final del turno."],["cura","Devuelve vida a un compañero."],["vacio","No hace nada. Se quita con equipo de piernas y pies."]];
function AyudaMazmorra({ yo, puntos, compacto, onCerrar }){
  const titulo = { fontSize:12, fontWeight:700, letterSpacing:".08em", color:"var(--gold)", margin:"14px 0 5px" };
  const texto = { fontSize:12.5, color:"var(--muted)", lineHeight:1.45, margin:"0 0 5px" };
  const b = t=><b style={{ color:"var(--txt)" }}>{t}</b>;
  return (
    <div style={{ textAlign:"left" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:8 }}>
        <span className="disp" style={{ fontSize:19 }}>Cómo se juega</span>
        <button className="fh-btn" onClick={onCerrar} style={{ padding:"7px 12px", fontSize:15, background:"var(--gold)", color:"#1A1020" }}>Volver al juego</button>
      </div>
      <div style={{ maxHeight:compacto ? 410 : "none", overflowY:compacto ? "auto" : "visible" }}>
        <div style={titulo}>EL TURNO</div>
        <p style={texto}>1. Los enemigos {b("anuncian")} lo que harán: lo ves encima de cada uno.</p>
        <p style={texto}>2. Todos los dados se lanzan. {b("Toca un dado")} para guardarlo (borde dorado) y {b("Relanzar")} tira los demás, hasta 2 veces.</p>
        <p style={texto}>3. {b("Usar dados")} cierra la tirada. Toca cada dado y luego su objetivo, en el orden que quieras.</p>
        <p style={texto}>4. {b("Fin del turno")}: los enemigos que sigan en pie cumplen lo anunciado. Si matas a uno antes, no hace nada. Los escudos se acaban aquí.</p>

        <div style={titulo}>LOS BOTONES</div>
        <p style={texto}>{b("Relanzar (n)")}: tira los dados sin guardar. El número son las tiradas que te quedan.</p>
        <p style={texto}>{b("Usar dados")}: da la tirada por buena. Ya no se puede relanzar.</p>
        <p style={texto}>{b("Botón dorado bajo cada dado")}: el ataque especial de ese héroe. Si no se puede usar, tócalo y te dirá por qué.</p>
        <p style={texto}>{b("Fin del turno")}: pasa el turno. Los dados sin usar se pierden.</p>
        <p style={texto}>Si un ataque se te hace largo, {b("toca la pantalla")} para saltar la animación.</p>

        <div style={titulo}>LAS CARAS DEL DADO</div>
        {AYUDA_CARAS.map(([t,x])=>(
          <div key={t} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
            <CaraMini cara={{ t, v:2 }}/>
            <span style={{ fontSize:12.5, color:"var(--muted)", lineHeight:1.35 }}>{b(CARA_INFO[t][0])}. {x}</span>
          </div>
        ))}
        <p style={texto}>{b("Superserie")}: si al pulsar Usar dados hay dos o más dados con la misma acción, todos suben +1. Salen con borde verde.</p>

        <div style={titulo}>LOGROS</div>
        <p style={texto}>La mazmorra tiene los suyos en la pestaña {b("Logros")}. Solo cuentan las partidas con llave y no dan XP: el nivel se gana en el gimnasio.</p>

        <div style={titulo}>CLASES Y EVOLUCIONES</div>
        <p style={texto}>Todos empiezan en su {b("forma base")}. Al superar las salas {M.ASCENSOS.join(" y ")}, cada héroe {b("asciende")}: eliges entre dos clases, y la segunda sale de la primera. Cambian el dado, la vida, el tipo y los rasgos. Dura esa partida, y los enemigos también se endurecen.</p>
        {RAMAS.map(r=>(
          <div key={r.id} style={{ marginBottom:6 }}>
            <div style={{ fontSize:12.5, fontWeight:700, color:r.color }}>{r.nombre}</div>
            {Object.values(M.CLASES).filter(x=>x.rama===r.id && x.nivel===2).map(x=>(
              <div key={x.id} style={{ fontSize:12, color:"var(--muted)", lineHeight:1.4 }}>{x.nombre} → {Object.values(M.CLASES).filter(y=>y.de===x.id).map(y=>y.nombre).join(" o ")}</div>
            ))}
          </div>
        ))}

        <div style={titulo}>RASGOS</div>
        <p style={texto}>Cada héroe tiene los suyos, y {b("el orden en que usas los dados importa")}: primero quien marca, después quien aprovecha la marca.</p>
        {Object.values(M.RASGOS).map(x=><p key={x.nombre} style={texto}>{b(x.nombre)}: {x.texto}</p>)}

        <div style={titulo}>SINERGIAS DE GRUPO</div>
        <p style={texto}>Cada clase tiene un tipo. Las sinergias activas salen en verde encima del combate, y cambian si alguien asciende a otro tipo.</p>
        {Object.values(M.SINERGIAS).map(x=><p key={x.nombre} style={texto}>{b(x.nombre)}: {x.texto}</p>)}

        <div style={titulo}>ATAQUES ESPECIALES</div>
        <p style={texto}>Se pueden activar cuando se cumple todo esto:</p>
        <p style={texto}>· Ya has pulsado {b("Usar dados")}.</p>
        <p style={texto}>· Ese héroe sigue en pie y {b("no ha usado su dado")}: el especial lo gasta.</p>
        <p style={texto}>· Tienes el {b("Impulso")} que cuesta.</p>
        <p style={texto}>Llevas uno por partida: se elige antes de entrar, en el botón Especial de tu ficha o en Tu héroe. Los compañeros llevan el suyo.</p>

        <div style={titulo}>TODOS LOS ESPECIALES</div>
        <p style={texto}>Los números son los de tu héroe. Se desbloquean con series reales de cada rama.</p>
        {RAMAS.map(r=>(
          <div key={r.id} style={{ marginBottom:7 }}>
            <div style={{ fontSize:12.5, fontWeight:700, color:r.color, marginBottom:3 }}>{r.nombre} · {r.estilo}</div>
            {Object.values(M.ESPECIALES).filter(e=>e.rama===r.id).map(e=>{
              const libre = M.especialDisponible(e, puntos), falta = e.u-(puntos?.[e.rama]||0);
              return (
                <div key={e.id} style={{ padding:"6px 8px", marginBottom:3, background:"var(--bg2)", border:`1px solid ${M.especialDe(yo).id===e.id ? r.color : "var(--line)"}`, opacity:libre ? 1 : .7 }}>
                  <div style={{ fontSize:12.5, color:"var(--txt)", display:"flex", alignItems:"center", gap:5 }}>
                    {!libre && <Lock size={12} color="var(--faint)" style={{ flexShrink:0 }}/>}
                    <span style={{ flex:1, minWidth:0 }}>{e.nombre}</span>
                    <span className="mono" style={{ fontSize:11, color:"var(--gold)", whiteSpace:"nowrap" }}>{e.coste} Imp.</span>
                  </div>
                  <div style={{ fontSize:11.5, color:"var(--muted)", lineHeight:1.35 }}>{e.texto(yo.ataque, yo.apoyo)}</div>
                  {!libre && <div style={{ fontSize:11, color:"var(--faint)" }}>Faltan {falta} de {r.estilo}.</div>}
                </div>
              );
            })}
          </div>
        ))}

        <div style={titulo}>EL GIMNASIO MANDA</div>
        <p style={texto}>{b("Impulso")}: cada serie real que marcas suma 1, hasta 6. Paga los especiales.</p>
        <p style={texto}>{b("Equipo y nivel")}: tus dados y tu vida. Lo que ganas entrenando te hace más fuerte aquí.</p>
        <p style={texto}>{b("Liderazgo")}: tu equipo también mejora los dados y la vida de tus compañeros.</p>
        <p style={texto}>{b("Llaves")}: cada día que terminas un entreno ganas una, hasta 3. Solo las partidas con llave dan Gloria.</p>
        <p style={texto}>{b("Gloria")}: tu puntuación para la clasificación con tus amigos.</p>
        <p style={texto}>La mazmorra nunca da XP, nivel ni equipo. Lo que eliges entre salas solo dura esa partida.</p>
      </div>
    </div>
  );
}

/* Lo que sale sobre quien recibe: número, chispas y, si pega un enemigo, un zarpazo. */
function MarcaGolpe({ c, deEnemigo }){
  const chispas = useMemo(()=>Array.from({ length:7 }, (_,i)=>{ const a = i/7*Math.PI*2+.4, d = 24+Math.random()*16; return { dx:Math.round(Math.cos(a)*d), dy:Math.round(Math.sin(a)*d) }; }), []);
  const quita = c.hp<0, texto = c.hp ? (c.hp>0 ? `+${c.hp}` : c.hp) : c.escudo>0 ? `+${c.escudo}` : `${c.escudo}`;
  const color = c.hp>0 ? "#5CF0A0" : c.escudo>0 || !c.hp ? "#7FC8F8" : "#FFD24A";
  return (<>
    {quita && deEnemigo && <i className="fh-zarpazo"/>}
    {quita && chispas.map((s,i)=><i key={i} className="fh-chispa" style={{ background:i%2 ? "#FFD24A" : "#FFF", "--dx":`${s.dx}px`, "--dy":`${s.dy}px` }}/>)}
    <span className="arcade fh-num" style={{ color }}>{texto}</span>
  </>);
}
/* Algo que viaja de un héroe a su objetivo. Sale de las posiciones reales de cada casilla. */
function Proyectil({ de, a, sprite }){
  const el = useRef(null);
  useLayoutEffect(()=>{ el.current?.animate?.([{ transform:`translate(${de.x}px,${de.y}px) scale(.7) rotate(0deg)` }, { transform:`translate(${a.x}px,${a.y}px) scale(1.25) rotate(300deg)` }], { duration:190, easing:"ease-in", fill:"both" }); }, []);
  return <span ref={el} style={{ position:"absolute", left:-16, top:-16, zIndex:8, pointerEvents:"none", display:"inline-flex", filter:"drop-shadow(0 0 3px #fff)" }}><Sprite id={sprite} size={32}/></span>;
}
const SPRITE_ARMA = { guerrero:104, picaro:103, barbaro:118, explorador:131, monje:129 };
const IMPACTO_MS = 190, PASO_MS = 560, PAUSA_MUERTE_MS = 480;

/* Entre sala y sala el grupo cruza la zona hasta la puerta. Al cambiar de zona dura más y dice
   cómo se llama. Es solo decorado: la sala ya está resuelta, y un toque la salta. */
function TransicionSala({ sala, zonaNueva, jefe, heroes, onFin }){
  const z = M.zonaDe(sala), dura = zonaNueva ? 2400 : 1500;
  useEffect(()=>{ const t = setTimeout(onFin, dura); return ()=>clearTimeout(t); }, []);
  return (
    <button className="fh-trans" onClick={onFin} aria-label={`${jefe ? "Jefe" : `Sala ${sala}`}. Tocar para saltar`}>
      <span className="fh-trans-fondo" style={{ backgroundImage:`url('rpg/zona-${z.id}.png')`, "--dura":`${dura}ms` }}>
        <span className="fh-trans-grupo">{heroes.filter(h=>h.hp>0).map((h,i)=><Avatar key={i} av={h.avatar} escala={1} dir="perfil" andar/>)}</span>
      </span>
      <span className="arcade" style={{ fontSize:15, color:jefe ? "#FF8A80" : "#FFF", textShadow:"2px 2px 0 #000" }}>{jefe ? "¡JEFE!" : `SALA ${sala}`}</span>
      {zonaNueva && <span className="disp" style={{ fontSize:24, color:"#FFC83D" }}>{z.nombre}</span>}
    </button>
  );
}
const Mazmorra = React.memo(function Mazmorra({ mz, actualizar, yo, amigos, compacto, puntos, onEspecial }){
  const [sel, setSel] = useState(null);       // { tipo:"dado"|"especial", i }
  const [ayuda, setAyuda] = useState(false);
  const [aviso, setAviso] = useState(null);   // por qué no se puede usar un especial
  /* Las reglas ya han resuelto la jugada y está guardada; esto solo la va contando. Mientras
     dura, se pinta `anim.v` en vez de la partida real, y un toque la salta. */
  const [anim, setAnim] = useState(null);
  const relojes = useRef([]), raiz = useRef(null), casillas = useRef({}), tragar = useRef(false);
  const paraRelojes = ()=>{ relojes.current.forEach(clearTimeout); relojes.current = []; };
  useEffect(()=>paraRelojes, []);
  const real = mz.partida, p = anim?.v || real;
  const salaVista = useRef(real?.sala), [transicion, setTransicion] = useState(null);
  useEffect(()=>{
    if(!p || (p.fase!=="lanzar" && p.fase!=="usar") || p.sala===salaVista.current) return;
    const antes = salaVista.current;
    salaVista.current = p.sala;
    setTransicion({ sala:p.sala, zonaNueva:!antes || M.zonaDe(antes).id!==M.zonaDe(p.sala).id });
  }, [p?.sala, p?.fase]);
  const aliados = useMemo(()=>[...(amigos||[]).map(aliadoDeAmigo), ...NPCS], [amigos]);
  const pon = (partida, resto={})=>actualizar(m=>({ ...m, partida, ...resto }));
  // Volver a una partida a medias no relanza nada: solo se anima lo que acaba de tirarse.
  const vistoTiro = useRef(p?.tiro);
  useEffect(()=>{ vistoTiro.current = p?.tiro; }, [p?.tiro]);

  useEffect(()=>{ if(p) actualizar(m=>m.partida ? { ...m, partida:M.refrescarHeroe(m.partida, yo) } : m); }, [p?.sala, yo]);
  useEffect(()=>{ if(p?.fase==="fin") p.victoria ? sfx("levelup",.5) : sfx("gameover",.4); }, [p?.fase]);

  function posDe(lado, i){
    const e = casillas.current[`${lado}${i}`], b = raiz.current;
    if(!e || !b) return null;
    const r = e.getBoundingClientRect(), o = b.getBoundingClientRect();
    return { x:r.left-o.left+r.width/2, y:r.top-o.top+r.height/2 };
  }
  function proyectilesDe(v, ev){
    if(ev.autor.lado!=="h") return [];
    const h = v.heroes[ev.autor.i], de = posDe("h", ev.autor.i);
    const sprite = ev.tipo==="cura" ? 115 : ev.tipo==="escudo" ? 101 : ev.tipo==="barrido" ? 118 : SPRITE_ARMA[h.rama];
    return ev.cambios.map(c=>({ id:`${c.lado}${c.i}`, de, a:posDe(c.lado, c.i), sprite })).filter(x=>x.de && x.a);
  }
  function reproducir(base, evs, despues){
    if(!evs?.length || window.matchMedia?.("(prefers-reduced-motion:reduce)").matches) return;
    paraRelojes();
    let t = 0;
    evs.forEach((ev,n)=>{
      const hacia = ev.autor.lado==="e";
      relojes.current.push(setTimeout(()=>setAnim(a=>a && { ...a, ev, golpe:false, proy:proyectilesDe(a.v, ev), n }), t));
      relojes.current.push(setTimeout(()=>{
        setAnim(a=>a && { ...a, v:M.verEvento(a.v, ev), golpe:true, proy:[] });
        const quita = ev.cambios.some(c=>c.hp<0);
        tono(quita ? (hacia ? "enemigo" : "golpe") : ev.cambios.some(c=>c.hp>0) ? "cura" : "escudo");
        if(quita) vibrar(hacia ? 35 : 15);
      }, t+IMPACTO_MS));
      t += PASO_MS;
    });
    const muere = despues.fase!=="usar" && despues.fase!=="lanzar";
    relojes.current.push(setTimeout(()=>setAnim(null), t + (muere ? PAUSA_MUERTE_MS : 0)));
    setAnim({ v:base, ev:null, golpe:false, proy:[], n:0 });
  }
  /* El toque que salta la animación no debe pulsar lo que haya debajo: `pointerdown`
     quita la animación y el `click` de ese mismo toque llegaría ya a la pantalla normal. */
  const saltarAnim = e=>{ if(!anim) return; e.stopPropagation(); tragar.current = true; setTimeout(()=>{ tragar.current = false; }, 450); paraRelojes(); setAnim(null); };
  const tragarToque = e=>{ if(!tragar.current) return; tragar.current = false; e.stopPropagation(); e.preventDefault(); };

  if(ayuda) return <AyudaMazmorra {...{ yo, puntos, compacto }} onCerrar={()=>setAyuda(false)}/>;

  if(!p) return <ReclutarGrupo {...{ yo, aliados, mz, compacto, puntos, onEspecial }} onAyuda={()=>setAyuda(true)} onEntrar={grupo=>{
    const heroes = [yo, ...grupo.map(a=>M.crearHeroe(a, AVATAR.piezas))];
    actualizar(m=>M.empezar(m, heroes));
  }}/>;

  if(p.fase==="fin") return (
    <div style={{ padding:"14px 4px", textAlign:"center" }}>
      <div className="arcade" style={{ fontSize:14, color:p.victoria ? "var(--gold)" : "var(--crimson)", marginBottom:12 }}>{p.victoria ? "¡VICTORIA!" : "DERROTA"}</div>
      <p style={{ fontSize:13, color:"var(--muted)", lineHeight:1.5, margin:"0 0 14px" }}>
        {p.victoria ? "Habéis derrotado al Abandono. Ese no vuelve a por ti hoy." : `Tu grupo ha caído en la sala ${p.sala} de ${M.SALAS}. Aquí no se sube de nivel: lo que te hace más fuerte es entrenar.`}
      </p>
      <div className="arcade" style={{ fontSize:11, color:"var(--gold)", margin:"0 0 14px" }}>{p.puntua ? `+${p.gloriaPartida||0} GLORIA` : "PRÁCTICA: NO PUNTÚA"}</div>
      <button className="fh-btn" onClick={()=>pon(null)} style={{ width:"100%", padding:12, fontSize:17, background:"var(--gold)", color:"#1A1020" }}>Nueva partida</button>
    </div>
  );

  if(p.fase==="evolucion"){
    const h = p.heroes[p.evoCola[0]], r = RAMA[h.rama], actual = M.CLASES[h.clase]?.nombre || r.nombre;
    return (
      <div key={p.evoCola[0]} className="fh-in" style={{ textAlign:"left" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
          <AvatarCara av={h.avatar} size={44}/>
          <div style={{ minWidth:0 }}>
            <div className="disp" style={{ fontSize:20, color:r.color, lineHeight:1.1 }}>¡{h.nombre} asciende!</div>
            <div style={{ fontSize:12, color:"var(--muted)" }}>{actual} · elige su nueva clase para esta partida</div>
          </div>
        </div>
        <div style={{ fontSize:11, color:"var(--faint)", marginBottom:3 }}>Dado actual · {h.hpMax} de vida</div>
        <div style={{ display:"flex", gap:3, marginBottom:9 }}>{h.caras.map((f,i)=><CaraMini key={i} cara={f}/>)}</div>
        {M.opcionesClase(h).map(cl=>{
          const n = M.conClase(h, cl.id);
          return (
            <button key={cl.id} className="fh-card" onClick={()=>{ sfx("levelup",.4); vibrar([30,30,60]); pon(M.elegirClase(p, cl.id)); }}
              style={{ display:"block", width:"100%", textAlign:"left", padding:"10px 12px", marginBottom:7, cursor:"pointer", color:"var(--txt)" }}>
              <span style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", gap:8 }}>
                <span className="disp" style={{ fontSize:18, color:r.color }}>{cl.nombre}</span>
                <span style={{ fontSize:11, color:"var(--faint)", whiteSpace:"nowrap" }}>{M.TIPOS[cl.tipo]}</span>
              </span>
              <span style={{ display:"block", fontSize:12, color:"var(--muted)", lineHeight:1.35 }}>{cl.texto} <b style={{ color:"#5CF0A0" }}>+{cl.hp} de vida</b></span>
              {cl.rasgo && !M.rasgosDe(h).includes(cl.rasgo) && <span style={{ display:"block", fontSize:11.5, color:"var(--muted)", marginTop:3, lineHeight:1.35 }}><b style={{ color:"#9FD8FF" }}>{M.RASGOS[cl.rasgo].nombre}</b>: {M.RASGOS[cl.rasgo].texto}</span>}
              <span style={{ display:"flex", gap:3, marginTop:6 }}>{n.caras.map((f,i)=><CaraMini key={i} cara={f}/>)}</span>
              {(()=>{ const tras = M.sinergiasDe(p.heroes.map((x,k)=>k===p.evoCola[0] ? n : x)), antes = M.sinergiasDe(p.heroes), gana = tras.filter(s=>!antes.includes(s)), pierde = antes.filter(s=>!tras.includes(s));
                return (gana.length || pierde.length) ? <span style={{ display:"block", fontSize:11.5, marginTop:5, lineHeight:1.35 }}>
                  {gana.map(s=><b key={s} style={{ color:"var(--jade)", marginRight:8 }}>Activa {M.SINERGIAS[s].nombre}</b>)}
                  {pierde.map(s=><b key={s} style={{ color:"#FF9A8C", marginRight:8 }}>Pierde {M.SINERGIAS[s].nombre}</b>)}
                </span> : null; })()}
            </button>
          );
        })}
      </div>
    );
  }

  if(p.fase==="botin") return (
    <div className="fh-in" style={{ textAlign:"left" }}>
      <div className="disp" style={{ fontSize:19, marginBottom:3 }}>Sala {p.sala} superada</div>
      <p style={{ fontSize:12, color:"var(--muted)", margin:"0 0 10px", lineHeight:1.4 }}>Elige uno. Solo dura esta partida.</p>
      {p.botin.map(b=>(
        <button key={b.id} className="fh-card" onClick={()=>{ const r = M.elegirBotin(p, b.id); sfx("serie",.3); actualizar(m=>({ ...m, partida:r.partida, impulso:Math.min(M.IMPULSO_MAX, (m.impulso||0)+r.impulso) })); }}
          style={{ display:"block", width:"100%", textAlign:"left", padding:"10px 12px", marginBottom:7, cursor:"pointer", color:"var(--txt)" }}>
          <span className="disp" style={{ display:"block", fontSize:17, color:"var(--gold)" }}>{b.nombre}</span>
          <span style={{ display:"block", fontSize:12, color:"var(--muted)" }}>{b.texto}</span>
        </button>
      ))}
    </div>
  );

  const usar = p.fase==="usar", impulso = mz.impulso||0;
  const accion = (i, obj)=>{ const q = M.usarDado(p, i, obj); setSel(null); if(q===p) return; reproducir(p, q.ev, q); pon(q); };
  const especial = (h, obj)=>{ const r = M.usarEspecial(p, h, obj, impulso); setSel(null); if(!r.gastado) return; sfx("record",.4); vibrar([20,30,40]); reproducir(p, r.partida.ev, r.partida); actualizar(m=>({ ...m, partida:r.partida, impulso:(m.impulso||0)-r.gastado })); };
  const ev = anim?.ev, autorEs = (lado,i)=>ev && ev.autor.lado===lado && ev.autor.i===i && !anim.golpe && ev.tipo!=="bloqueo" && ev.tipo!=="cura";
  const cambioDe = (lado,i)=>anim?.golpe ? ev?.cambios.find(c=>c.lado===lado && c.i===i) : null;
  const fuerte = anim?.golpe && ev?.cambios.some(c=>c.hp<=-6 || (c.lado==="h" && c.hp<0));
  function tocarDado(i){
    setAviso(null);
    if(!usar){ pon(M.fijar(p, i)); return; }
    const d = p.dados[i];
    if(!d || d.usado || d.cara.t==="vacio") return;
    const tipo = M.objetivoDe(d.cara.t);
    if(!tipo){ accion(i, 0); return; }
    const lista = (tipo==="enemigo" ? p.enemigos : p.heroes).map((x,n)=>x.hp>0 ? n : -1).filter(n=>n>=0);
    if(lista.length===1){ accion(i, lista[0]); return; }
    setSel(sel?.tipo==="dado" && sel.i===i ? null : { tipo:"dado", i });
  }
  /* El botón siempre responde: si no se puede usar, dice por qué. */
  function tocarEspecial(h){
    const e = M.especialDe(p.heroes[h]), motivo = M.motivoEspecial(p, h, impulso);
    if(motivo){ setSel(null); setAviso(`${e.nombre}: ${motivo}`); return; }
    setAviso(null);
    if(e.objetivo==="todos" || e.objetivo==="grupo"){ especial(h, 0); return; }
    const lista = (e.objetivo==="enemigo" ? p.enemigos.map((x,n)=>x.hp>0 ? n : -1) : e.objetivo==="caido" ? p.heroes.map((x,n)=>x.hp<=0 ? n : -1) : p.heroes.map((x,n)=>x.hp>0 ? n : -1)).filter(n=>n>=0);
    if(lista.length===1){ especial(h, lista[0]); return; }
    setSel(sel?.tipo==="especial" && sel.i===h ? null : { tipo:"especial", i:h });
  }
  const espSel = sel?.tipo==="especial" ? M.especialDe(p.heroes[sel.i]) : null;
  const objetivo = !sel ? null : espSel ? espSel.objetivo : M.objetivoDe(p.dados[sel.i].cara.t);
  const tocarObjetivo = n=>{ if(sel.tipo==="especial") especial(sel.i, n); else accion(sel.i, n); };
  const pista = !usar ? "Toca los dados que quieras guardar y relanza el resto."
    : !sel ? "Toca un dado para usarlo." : objetivo==="enemigo" ? "¿A qué enemigo?" : objetivo==="caido" ? "¿A qué compañero caído?" : "¿A quién del grupo?";

  return (
    <div ref={raiz} onPointerDownCapture={saltarAnim} onClickCapture={tragarToque} className={fuerte ? "fh-temblor" : ""} style={{ textAlign:"left", position:"relative" }}>
      {(anim?.proy||[]).map(x=><Proyectil key={x.id} {...x}/>)}
      {transicion && <TransicionSala {...transicion} jefe={!!p.enemigos[0]?.jefe} heroes={p.heroes} onFin={()=>setTransicion(null)}/>}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
        <span className="disp" style={{ fontSize:16 }}>Sala {p.sala} de {M.SALAS}{!p.puntua && <span style={{ fontSize:13, color:"var(--faint)" }}> · práctica</span>}</span>
        <span style={{ display:"flex", alignItems:"center", gap:7 }}>
          <span title="Cada serie real que haces suma 1" style={{ display:"flex", alignItems:"center", gap:5 }}>
            <span style={{ fontSize:10.5, fontWeight:700, color:"var(--gold)", letterSpacing:".06em" }}>IMPULSO</span>
            <span style={{ display:"flex", gap:2 }}>{Array.from({ length:M.IMPULSO_MAX }, (_,i)=><i key={i} style={{ width:9, height:9, background:i<impulso ? "var(--gold)" : "var(--bg2)", border:"1px solid var(--line2)" }}/>)}</span>
          </span>
          <BotonAyuda onClick={()=>setAyuda(true)}/>
        </span>
      </div>

      {M.sinergiasDe(p.heroes).length>0 && <div style={{ marginBottom:5 }}><ChipsSinergia heroes={p.heroes}/></div>}
      <div className="fh-escena" style={{ display:"flex", justifyContent:"center", alignItems:"flex-end", gap:6, padding:"6px 4px 8px", minHeight:112, border:"2px solid var(--line2)", overflow:"visible", backgroundImage:`url('rpg/zona-${M.zonaDe(p.sala).id}.png')`, backgroundPosition:"center bottom" }}>
        {ev?.nombre && !anim?.golpe && <div className="arcade fh-rotulo" style={{ color:"var(--gold)", fontSize:11 }}>{ev.nombre}</div>}
        {p.enemigos.map((e,n)=>{
          const vivo = e.hp>0, puede = objetivo==="enemigo" && vivo, c2 = cambioDe("e", n);
          return (
            <div key={`${p.sala}-${n}`} className="fh-entra" style={{ flex:1, maxWidth:150, minWidth:0, animationDelay:`${n*.09}s` }}>
            <button ref={x=>{ casillas.current[`e${n}`] = x; }} disabled={!puede} onClick={()=>tocarObjetivo(n)} aria-label={`${e.nombre}, ${e.hp} de vida`}
              className={autorEs("e",n) ? "fh-baja" : ""} style={{ position:"relative", width:"100%", padding:"3px 4px", background:puede ? "rgba(255,200,61,.22)" : "rgba(6,8,13,.5)", border:`2px solid ${puede ? "var(--gold)" : "transparent"}`, cursor:puede ? "pointer" : "default", color:"#FFF", textAlign:"center" }}>
              {vivo && (e.aturdido ? <div style={{ fontSize:10.5, fontWeight:700, lineHeight:1.2, color:"#C08BFF", textShadow:"1px 1px 0 #000" }}>¡Aturdido!</div> : <IntentoEnemigo e={e} heroes={p.heroes}/>)}
              {vivo && e.marca>0 && <div style={{ fontSize:9.5, fontWeight:700, lineHeight:1.2, color:"var(--gold)", textShadow:"1px 1px 0 #000" }}>MARCADO</div>}
              <span className={!vivo ? "fh-muere" : c2 ? "fh-impacto" : ""} style={{ display:"inline-flex", margin:"1px 0" }}><Sprite id={e.sprite} size={e.jefe ? 64 : 48}/></span>
              <div style={{ fontSize:11, fontWeight:700, lineHeight:1.2, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", textShadow:"1px 1px 0 #000", opacity:vivo ? 1 : .4 }}>{e.nombre}</div>
              <BarraVida hp={e.hp} max={e.hpMax} color="#E8433F" escudo={e.escudo}/>
              {c2 && <MarcaGolpe c={c2}/>}
            </button>
            </div>
          );
        })}
      </div>

      <div style={{ display:"flex", gap:5, marginTop:7 }}>
        {p.heroes.map((h,i)=>{
          const d = p.dados[i], vivo = h.hp>0, puede = (objetivo==="aliado" && vivo) || (objetivo==="caido" && !vivo), esp = M.especialDe(h);
          const pagable = !M.motivoEspecial(p, i, impulso);
          return (
            <div key={h.id} style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
              <button ref={x=>{ casillas.current[`h${i}`] = x; }} disabled={!puede} onClick={()=>tocarObjetivo(i)} aria-label={`${h.nombre}, ${h.hp} de vida`} className={autorEs("h",i) ? "fh-sube" : cambioDe("h",i) ? "fh-impacto" : ""}
                style={{ position:"relative", width:"100%", padding:"2px 2px 3px", background:puede ? "rgba(61,220,132,.2)" : "var(--bg2)", border:`2px solid ${puede ? "var(--jade)" : "var(--line)"}`, cursor:puede ? "pointer" : "default", opacity:vivo ? 1 : .4, textAlign:"center" }}>
                <AvatarCara av={h.avatar} size={38}/>
                <div style={{ fontSize:10.5, fontWeight:700, color:"var(--txt)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", lineHeight:1.3 }}>{h.nombre}</div>
                <div style={{ fontSize:9.5, fontWeight:700, color:RAMA[h.rama].color, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", lineHeight:1.25 }}>{M.CLASES[h.clase]?.nombre || RAMA[h.rama].nombre}</div>
                <BarraVida hp={h.hp} max={h.hpMax} escudo={h.escudo}/>
                {cambioDe("h",i) && <MarcaGolpe c={cambioDe("h",i)} deEnemigo={ev.autor.lado==="e"}/>}
              </button>
              {d ? <Dado3D caras={h.caras} d={d} animar={p.tiro!==vistoTiro.current && d.tiro===p.tiro} retraso={i*70} etiqueta={`${CARA_INFO[d.cara.t][0]} ${d.cara.v||""}`}
                  activo={sel?.tipo==="dado" && sel.i===i} onClick={()=>tocarDado(i)}/> : <div style={{ width:50, height:50 }}/>}
              <button className="fh-btn" onClick={()=>tocarEspecial(i)} aria-label={`${esp.nombre}. ${esp.texto(h.ataque, h.apoyo)} Cuesta ${esp.coste} de Impulso.`} title={esp.texto(h.ataque, h.apoyo)}
                style={{ width:"100%", padding:"3px 1px", fontSize:12, lineHeight:1.1, background:sel?.tipo==="especial" && sel.i===i ? "#FFF" : pagable ? "var(--gold)" : "var(--bg2)", color:pagable || sel?.tipo==="especial" && sel.i===i ? "#1A1020" : "var(--faint)", border:`1px solid ${pagable ? "var(--gold)" : "var(--line2)"}` }}>{esp.nombre} · {esp.coste}</button>
            </div>
          );
        })}
      </div>

      <div style={{ fontSize:11.5, color:"var(--muted)", minHeight:30, margin:"7px 2px 6px", lineHeight:1.3 }}>{aviso ? <span style={{ color:"var(--gold)" }}>{aviso}</span> : espSel ? <span style={{ color:"var(--txt)" }}>{espSel.texto(p.heroes[sel.i].ataque, p.heroes[sel.i].apoyo)} {pista}</span> : p.log[0] && usar && !sel ? <span style={{ color:"var(--txt)" }}>{p.log.slice(0,2).join(" · ")}</span> : pista}</div>
      {usar
        ? <button className="fh-btn" onClick={()=>{ setSel(null); setAviso(null); const q = M.finTurno(p); reproducir(p, q.ev, q); pon(q); }} style={{ width:"100%", padding:11, fontSize:17, background:"var(--ember)", color:"#FFF" }}>Fin del turno</button>
        : <div style={{ display:"flex", gap:7 }}>
            <button className="fh-btn" disabled={p.tiradas<=0} onClick={()=>{ setAviso(null); pon(M.relanzar(p)); }} style={{ flex:1, padding:11, fontSize:16, background:"var(--card2)", color:"var(--txt)", border:"1px solid var(--line2)", opacity:p.tiradas>0 ? 1 : .4 }}>Relanzar ({p.tiradas})</button>
            <button className="fh-btn" onClick={()=>{ setAviso(null); pon(M.confirmar(p)); }} style={{ flex:1, padding:11, fontSize:16, background:"var(--gold)", color:"#1A1020" }}>Usar dados</button>
          </div>}
    </div>
  );
});

/* Solo el círculo: la gracia es picarse con los tuyos. Sale de los perfiles de tus
   amigos, sin vistas nuevas en el servidor. */
function ClasificacionMazmorra({ mz, yo, amigos }){
  const filas = [{ id:"yo", nombre:yo.nombre, avatar:yo.avatar, gloria:mz.gloria||0, salas:mz.salas||0, mazmorras:mz.mazmorras||0, mejor:mz.mejorSala||0, esYo:true },
    ...(amigos||[]).map(a=>{ const h = aliadoDeAmigo(a); return { id:a.id, nombre:h.nombre, avatar:h.avatar, gloria:a.gloria||0, salas:a.salas_superadas||0, mazmorras:a.mazmorras||0, mejor:a.mejor_sala||0 }; })]
    .sort((a,b)=>b.gloria-a.gloria || b.mazmorras-a.mazmorras || b.salas-a.salas);
  return (<>
    <div style={{ fontSize:12, fontWeight:700, letterSpacing:".08em", color:"var(--faint)", margin:"18px 4px 8px" }}>GLORIA DE LA MAZMORRA</div>
    <div className="fh-card" style={{ padding:"6px 14px" }}>
      {filas.map((f,i)=>(
        <div key={f.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderTop:i ? "1px solid var(--line)" : "none" }}>
          <span className="mono" style={{ width:18, fontSize:13, fontWeight:700, color:i===0 && f.gloria>0 ? "var(--gold)" : "var(--faint)" }}>{i+1}</span>
          <AvatarCara av={f.avatar} size={32}/>
          <span style={{ flex:1, minWidth:0 }}>
            <span style={{ display:"block", fontSize:13.5, fontWeight:f.esYo ? 700 : 400, color:f.esYo ? "var(--gold)" : "var(--txt)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{f.nombre}</span>
            <span style={{ display:"block", fontSize:11, color:"var(--faint)" }}>{f.salas} {f.salas===1 ? "sala" : "salas"} · {f.mazmorras} {f.mazmorras===1 ? "mazmorra" : "mazmorras"} · mejor {f.mejor}/{M.SALAS}</span>
          </span>
          <span className="mono" style={{ fontSize:15, fontWeight:700, color:"var(--gold)" }}>{f.gloria}</span>
        </div>
      ))}
      {filas.length===1 && <div style={{ fontSize:12, color:"var(--faint)", padding:"2px 0 8px", lineHeight:1.45 }}>Añade amigos para compararte con ellos.</div>}
    </div>
    <div style={{ fontSize:11, color:"var(--faint)", margin:"7px 4px 0", lineHeight:1.45 }}>Solo puntúan las partidas con llave. Cada día que terminas un entreno ganas una, hasta {M.LLAVES_MAX}.</div>
  </>);
}

function MazmorraView({ onVolver, ...juego }){
  const { mz, yo, amigos } = juego;
  return (
    <div className="fh-in" style={{ paddingBottom:24 }}>
      <header style={{ padding:"22px 2px 12px", display:"flex", alignItems:"center", gap:10 }}>
        <button onClick={onVolver} aria-label="Volver" style={{ background:"var(--card)", border:"1px solid var(--line)", width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"var(--muted)", flexShrink:0 }}><ChevronLeft size={18}/></button>
        <div>
          <h1 style={{ margin:0, fontSize:24 }}>La mazmorra</h1>
          <p style={{ margin:"3px 0 0", fontSize:13, color:"var(--muted)" }}>Tus malos hábitos te esperan. Cada serie real suma Impulso.</p>
        </div>
      </header>
      <div className="fh-card" style={{ padding:12 }}><Mazmorra {...juego}/></div>
      <ClasificacionMazmorra {...{ mz, yo, amigos }}/>
    </div>
  );
}

/* Temporizador de descanso: pop-up a pantalla completa que bloquea el avance.
   Solo pinta: la hora de fin vive en la sesión (`session.descanso`), así sobrevive a
   que Android mate la app y al volver sigue donde debe. */
function RestTimer({ hasta, total, onDone, onSaltar, onMas15, isRecomp, juego }){
  const pool = isRecomp ? RECOMP_TIPS : TIPS;
  const [jugar, setJugar] = useState(!ALT);
  useEffect(()=>{ if(!ALT) loadGlobal("gym:descansoJuego", true).then(setJugar); }, []);
  const alternarJuego = ()=>{ setJugar(v=>{ saveGlobal("gym:descansoJuego", !v); return !v; }); };
  const [queda, setQueda] = useState(() => Math.max(0, hasta - Date.now()));
  const [tip, setTip] = useState(() => pick(pool));
  const onDoneRef = useRef(onDone); onDoneRef.current = onDone;

  /* Saltar cancela el aviso; acabarse solo, no. Por eso aquí no hay cleanup: cancelar
     al cerrar el pop-up se llevaba la alarma justo cuando iba a sonar. */
  useEffect(()=>{ programarAvisoDescanso(hasta); },[hasta]);

  /* Contra el RELOJ y en cada fotograma, no con un setInterval: el primer fotograma al
     volver de segundo plano ya sale con el tiempo real. Con la app oculta no corre, y
     da igual: ahí avisa la alarma. */
  useEffect(()=>{
    let id;
    const paso = ()=>{
      const q = hasta - Date.now();
      if(q <= 0){
        setQueda(0);
        // Solo si lo estás viendo acabar: en el móvil ya vibra la alarma.
        if(!EN() && q > -1500) { try { navigator.vibrate?.([180, 90, 180]); } catch {} }
        onDoneRef.current();
        return;
      }
      setQueda(prev => Math.abs(prev - q) >= 100 ? q : prev);
      id = requestAnimationFrame(paso);
    };
    id = requestAnimationFrame(paso);
    return ()=>cancelAnimationFrame(id);
  },[hasta]);

  const left = Math.ceil(queda/1000);
  const mm=String(Math.floor(left/60)).padStart(2,"0"), ss=String(left%60).padStart(2,"0");
  const pct = total ? queda/(total*1000) : 0;
  // Portal al root .fh: evita que un ancestro con transform (animación .fh-in) rompa el position:fixed.
  const target = (typeof document!=="undefined" && document.getElementById("rpgym-root")) || (typeof document!=="undefined" ? document.body : null);
  const overlay = (
    <div style={{ position:"fixed", inset:0, zIndex:200, background:"rgba(6,8,13,.9)", backdropFilter:"blur(7px)", display:"flex", alignItems:"center", justifyContent:"center", padding:"calc(16px + var(--st)) 16px calc(16px + var(--sb))", overflowY:"auto" }}>
      <div className="fh-card fh-pop" style={{ padding:jugar ? 16 : 26, borderColor:"var(--ember)", background:"linear-gradient(160deg,var(--card),var(--card2))", maxWidth:420, width:"100%", textAlign:"center", margin:"auto" }}>
        {!jugar && <div style={{ fontSize:11, color:"var(--muted)", fontWeight:700, letterSpacing:".14em", marginBottom:16 }}>DESCANSO</div>}
        <div style={{ display:"flex", justifyContent:"center", alignItems:"center", gap:12, marginBottom:jugar ? 8 : 18 }}>
          {/* Sin transición: con la app oculta no se pinta nada y, al volver, la animación
              arrancaba desde lo último pintado y barría el anillo durante medio segundo. */}
          {jugar ? <>
            <span style={{ fontSize:11, color:"var(--muted)", fontWeight:700, letterSpacing:".14em" }}>DESCANSO</span>
            <span className="mono" style={{ fontSize:24, fontWeight:700, lineHeight:1 }}>{mm}:{ss}</span>
            <div className="fh-bar" style={{ flex:1 }}><i style={{ width:`${Math.min(100,pct*100)}%`, background:"var(--ember)", transition:"none" }}/></div>
          </> : (
            <Ring pct={pct} size={168} stroke={11} color="var(--ember)" transicion="none">
              <div className="mono" style={{ fontSize:40, fontWeight:700, lineHeight:1 }}>{mm}:{ss}</div>
              <div style={{ fontSize:10, color:"var(--muted)", fontWeight:600, marginTop:4 }}>RECUPÉRATE</div>
            </Ring>
          )}
        </div>
        {jugar ? <div style={{ marginBottom:10 }}><Mazmorra compacto {...juego}/></div> : (
          <div className="fh-card" onClick={()=>setTip(pick(pool))} style={{ padding:15, background:"var(--bg2)", textAlign:"left", marginBottom:16, cursor:"pointer" }}>
            <div style={{ display:"flex", alignItems:"center", gap:6, color:"var(--gold)", fontSize:10, fontWeight:700, letterSpacing:".1em", marginBottom:6 }}>
              <Lightbulb size={13}/> CONSEJO
            </div>
            <div style={{ fontSize:13.5, lineHeight:1.5, color:"var(--txt)" }}>{tip}</div>
          </div>
        )}
        <div style={{ display:"flex", gap:8 }}>
          <button className="fh-btn" style={{ flex:1, background:"var(--card2)", color:"var(--txt)", padding:"13px 6px", border:"1px solid var(--line2)", whiteSpace:"nowrap" }} onClick={onMas15}>+15 s</button>
          {!ALT && <button className="fh-btn" style={{ flex:1, background:"var(--card2)", color:"var(--muted)", padding:13, border:"1px solid var(--line2)" }} onClick={alternarJuego}>{jugar ? "Consejo" : "Jugar"}</button>}
          <button className="fh-btn" style={{ flex:1, background:"var(--ember)", color:"#fff", padding:13, display:"flex", alignItems:"center", justifyContent:"center", gap:5 }} onClick={onSaltar}><SkipForward size={16}/> Saltar</button>
        </div>
        {!jugar && <div style={{ fontSize:11, color:"var(--faint)", marginTop:12 }}>Termina o salta el descanso para seguir con el siguiente ejercicio.</div>}
      </div>
    </div>
  );
  return target ? createPortal(overlay, target) : overlay;
}

function Empty({ text }){ return <div style={{ height:100, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, color:"var(--faint)", textAlign:"center" }}>{text}</div>; }

function ExImage({ name }){
  const src=EX_IMG[name];
  const src2=src ? src.replace(/0\.jpg$/,"1.jpg") : null;   // segundo fotograma (fin del movimiento)
  const [err,setErr]=useState(false);
  const [frame2Ok,setFrame2Ok]=useState(true);
  const [phase,setPhase]=useState(0);
  // Los dos fotogramas son contenido (la demostración del ejercicio), no decoración:
  // se alternan siempre. Si el usuario pide "reducir movimiento", el cambio es instantáneo (sin fundido).
  const reduce = typeof window!=="undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const animate = !!src2 && frame2Ok;
  useEffect(()=>{
    if(!animate) return;
    const t=setInterval(()=>setPhase(p=>p^1), 850);
    return ()=>clearInterval(t);
  },[animate]);
  if(!src || err) return null;
  const showEnd = animate && phase===1;
  const trans = reduce ? "none" : "opacity .4s ease";
  return (
    <div style={{ position:"relative", borderRadius:9, overflow:"hidden", marginBottom:10, background:"var(--bg2)", border:"1px solid var(--line)" }}>
      <img src={src} alt={name} loading="lazy" onError={()=>setErr(true)}
        style={{ width:"100%", height:"auto", display:"block", opacity:showEnd?0:1, transition:trans }}/>
      {src2 && (
        <img src={src2} alt="" aria-hidden="true" loading="lazy" onError={()=>setFrame2Ok(false)}
          style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", display:"block", opacity:showEnd?1:0, transition:trans, pointerEvents:"none" }}/>
      )}
      {animate && (
        <div style={{ position:"absolute", bottom:6, right:6, display:"flex", alignItems:"center", gap:4, background:"rgba(0,0,0,.55)", color:"#fff", fontSize:9.5, fontWeight:600, padding:"3px 7px", borderRadius:999, letterSpacing:".04em", pointerEvents:"none" }}>
          <Play size={9} fill="#fff"/> DEMO
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   APP
   ========================================================================= */

export default function App(){
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("home");
  const [state, setState] = useState(DEFAULT_STATE);
  const [log, setLog] = useState([]);
  const [measures, setMeasures] = useState([]);
  const [mealPlan, setMealPlan] = useState(null);
  const [excludes, setExcludesState] = useState([]);
  const [customRoutines, setCustomRoutinesState] = useState([]);
  /* El temporizador de refresco captura la función del primer render, con la
     lista de rutinas de entonces. Un ref le da siempre la lista de ahora: sin
     esto, una rutina importada DESPUÉS de abrir la app no se sincronizaba. */
  const customRoutinesRef = useRef(customRoutines);
  useEffect(()=>{ customRoutinesRef.current = customRoutines; }, [customRoutines]);
  const [customDiet, setCustomDietState] = useState(blankCustomDiet);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [theme, setThemeState] = useState("dark");
  const [session, setSession] = useState(null);
  const [results, setResults] = useState(null);
  const [efectos, setEfectos] = useState([]);    // cola de pantallas: LEVEL UP, EXTRA LIFE, GAME OVER
  const [sonido, setSonidoState] = useState(true);
  const lanzarEfecto = (...nuevos)=>ALT ? undefined : setEfectos(q=>[...q, ...nuevos.map(e=>({ ...e, id:Date.now()+Math.random() }))]);
  const puntos = useMemo(()=>puntosDeRama(log), [log]);
  const avatar = useMemo(()=>state.avatar || avatarPorDefecto(state.profile, puntos), [state.avatar, state.profile?.sex, puntos]);
  function guardarAvatar(av){ const ns = { ...state, avatar:av }; setState(ns); persist(ns); }
  const [mazmorra, setMazmorra] = useState(M.MAZMORRA_VACIA);
  const actualizarMazmorra = useCallback(f=>setMazmorra(m=>{ const n = M.comprobarLogros(M.apuntar(f(m)), todayISO()); saveKey("gym:mazmorra", n); return n; }), []);
  const sumarImpulso = useCallback(()=>actualizarMazmorra(m=>({ ...m, impulso:Math.min(M.IMPULSO_MAX, (m.impulso||0)+1) })), [actualizarMazmorra]);

  const [routineDraft, setRoutineDraft] = useState(null);   // rutina que se está configurando
  /* Informe semanal: qué semana se está mirando y a dónde vuelve el botón de
     salir (sale solo el lunes y también desde la ficha: hay que volver al de antes). */
  const [informeLunes, setInformeLunes] = useState(()=>mondayOf(todayISO()));
  const [informeVuelve, setInformeVuelve] = useState("home");
  const [resumenesVuelve, setResumenesVuelve] = useState("home");
  /* --- Nube (opcional). Si no hay credenciales, todo esto se queda a null y la
     app va 100% local, exactamente como antes. Ver ROADMAP-SOCIAL.md. --- */
  const [cloudSession, setCloudSession] = useState(null);
  /* Hasta que no se sabe si había sesión guardada NO se decide qué pantalla
     mostrar: si no, el login parpadea un instante en cada arranque. */
  const [sesionResuelta, setSesionResuelta] = useState(!cloud.cloudEnabled);
  const [perfil, setPerfil] = useState(null);
  const [updateInfo, setUpdateInfo] = useState(null);
  const [resumen, setResumen] = useState(null);
  const cerrarResumen = ()=>{ if(resumen) saveGlobal("gym:resumenVisto", resumen.id); setResumen(null); };
  /* Canal de actualizaciones: "rpg" o "alt". Global (es del móvil, no del perfil) y por
     defecto el de este build. Elegir el otro hace que el aviso de versión ofrezca su APK. */
  const [canal, setCanalState] = useState(CANAL_BUILD);
  const setCanal = async c => {
    setCanalState(c); saveGlobal("gym:canal", c);
    const v = await cloud.versionMasNueva(APP_VERSION_CODE, c, CANAL_BUILD);
    setUpdateInfo(v.ok && v.hayNueva ? v.version : null);
    return v;
  };
  const setResumenIA = async activo => {
    const r = await cloud.setResumenIA(activo);
    if(r.ok) setPerfil(p=>p ? { ...p, resumen_ia:activo } : p);
    return r;
  };
  const [publicadas, setPublicadas] = useState([]);   // ids de mis rutinas visibles para amigos
  const [quedadas, setQuedadas] = useState([]);
  const [novedades, setNovedades] = useState([]);
  const [entrenando, setEntrenando] = useState([]);   // amigos entrenando ahora mismo
  const [sesionConjunta, setSesionConjunta] = useState(null);
  const [adelantados, setAdelantados] = useState([]);      // a quién he superado con el último récord
  const [sinCuenta, setSinCuenta] = useState(false);       // ha elegido usar la app sin registrarse
  const [amigos, setAmigos] = useState([]);
  const [copiaNube, setCopiaNube] = useState(null);   // copia cifrada que ofrecer tras entrar
  const [amigoAbierto, setAmigoAbierto] = useState(null);   // ficha de amigo que se está viendo
  const [amigosSeccion, setAmigosSeccion] = useState(null); // aquí y no en la vista: al volver de una ficha sigues donde estabas
  const [solicitudes, setSolicitudes] = useState([]);       // amistades que me piden
  const [enviosRutina, setEnviosRutina] = useState([]);     // rutinas que me mandan
  const [superadoPor, setSuperadoPor] = useState([]);      // quién me ha adelantado a mí
  const [cargandoQuedadas, setCargandoQuedadas] = useState(false);
  const [draftIsNew, setDraftIsNew] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const level = levelFromXp(state.xp);
  const yo = useMemo(()=>M.crearHeroe({ id:"yo", nombre:state.profile?.name||"Tú", tipo:"yo", avatar, level }, AVATAR.piezas), [avatar, level, state.profile?.name]);
  const elegirEspecial = useCallback(id=>{ setState(s=>{ const ns = { ...s, avatar:{ ...(s.avatar||avatar), especial:id } }; persist(ns); return ns; }); }, [avatar]);
  const juego = useMemo(()=>({ mz:mazmorra, actualizar:actualizarMazmorra, yo, amigos, puntos, onEspecial:elegirEspecial }), [mazmorra, actualizarMazmorra, yo, amigos, puntos, elegirEspecial]);
  const rank = rankFor(level);

  const showToast = useCallback((t)=>{ setToast(t); clearTimeout(toastTimer.current); toastTimer.current=setTimeout(()=>setToast(null),3400); },[]);
  /* Con retraso: la jugada ya está resuelta, pero el combate se sigue viendo y no
     conviene que el aviso destripe cómo acaba. */
  useEffect(()=>{
    const ids = mazmorra?.logrosNuevos;
    if(!ids?.length) return;
    const t = setTimeout(()=>{
      const logros = ids.map(id=>M.LOGROS.find(l=>l.id===id)).filter(Boolean);
      showToast(logros.length>1 ? { title:`${logros.length} logros de la mazmorra`, sub:logros.map(l=>l.titulo).join(" · "), icon:Trophy }
        : { title:`Logro: ${logros[0]?.titulo}`, sub:logros[0]?.texto, icon:Trophy });
      actualizarMazmorra(m=>({ ...m, logrosNuevos:[] }));
    }, 1600);
    return ()=>clearTimeout(t);
  }, [mazmorra?.logrosNuevos, showToast, actualizarMazmorra]);

  useEffect(()=>{ (async()=>{
    const savedTheme = await loadGlobal("gym:theme", "dark");
    const sonidoGuardado = await loadGlobal("gym:sonido", true);
    sonidoActivo = sonidoGuardado; setSonidoState(sonidoGuardado);
    setThemeState(savedTheme);
    setStorePrefix("");            // usuario único (sin prefijo, conserva datos previos)
    await loadProfileData();
    await recuperarEntreno();
    setLoading(false);
  })(); },[]);

  /* Vuelve al entreno que estaba a medias, en la pantalla de entreno: desde
     Inicio no habría forma de llegar a él. Va antes de `setLoading(false)` para
     que el efecto de abajo no guarde un `null` encima antes de leerlo. */
  async function recuperarEntreno(){
    const guardado = await loadKey(ENTRENO_KEY, null);
    if(!guardado?.session) return;
    const s = guardado.session;
    const parado = Date.now() - (guardado.guardadoEn || Date.now());
    /* Con el cronómetro de cardio en marcha el hueco SÍ es entreno: en la cinta nadie
       toca el móvil y 40 minutos corriendo no pueden restarse de la sesión. */
    const startedAt = s.startedAt + (parado > PAUSA_SIN_CONTAR_MS && !s.crono ? parado : 0);
    setSession({ ...s, startedAt,
      // Un entreno guardado antes de actualizar la app puede traer nombres fusionados.
      exercises: s.exercises.map(e => ({ ...e, name:nombreActual(e.name) })),
      // Si el descanso acabó mientras tanto ya sonó la alarma: no hay nada que abrir.
      descanso: s.descanso?.hasta > Date.now() ? s.descanso : null });
    if(guardado.conjunta) setSesionConjunta(guardado.conjunta);
    setTab("workout");
    showToast({ title:"Entreno recuperado", sub:`${guardado.session.dayName}: sigue donde lo dejaste.`, icon:Dumbbell });
  }

  useEffect(()=>{
    if(loading) return;
    saveKey(ENTRENO_KEY, session ? { session, conjunta:sesionConjunta, guardadoEn:Date.now() } : null);
  }, [session, sesionConjunta, loading]);

  /* El servicio nativo sigue a la sesión: hay entreno, hay servicio. Pasar por aquí
     cubre empezar, recuperar, terminar y salir sin repetirlo en cada sitio. */
  const sesionViva = !!session, sesionNombre = session ? `${session.routineName} · ${session.dayName}` : null, sesionDesde = session?.startedAt;
  useEffect(()=>{
    const en = EN();
    if(loading || !en) return;
    (sesionViva ? en.iniciar({ titulo:sesionNombre, desde:sesionDesde }) : en.parar()).catch(()=>{});
  }, [loading, sesionViva, sesionNombre, sesionDesde]);

  /* Todo lo que se trae de la nube en cuanto hay sesión. Se llama desde los DOS
     sitios donde puede aparecer una: al abrir la app con la sesión guardada y al
     iniciar sesión a mano. El ref evita repetir la carga cuando supabase-js
     reemite el evento (arranque, refresco de token) para el mismo usuario. */
  const socialCargadoPara = useRef(null);
  async function cargarSocial(userId){
    if(!cloud.cloudEnabled) return;
    if(userId && socialCargadoPara.current === userId) return;
    socialCargadoPara.current = userId || null;
    const p = await cloud.miPerfil();
    if(p.ok) setPerfil(p.perfil);
    cloud.ping();                                   // keep-alive, sin esperar
    const pub = await cloud.misRutinasPublicadas();
    if(pub.ok) setPublicadas(pub.ids);
    const q = await cloud.listarQuedadas();
    if(q.ok) setQuedadas(q.quedadas);
    // Novedades desde la última visita. La marca es local: no hace falta
    // guardar en el servidor cuándo abriste la app por última vez.
    const desde = await loadGlobal("gym:ultimaVisita", null);
    const nv = await cloud.novedades(desde);
    if(nv.ok) setNovedades(nv.novedades);
    const ea = await cloud.quienEntrenaAhora();
    if(ea.ok) setEntrenando(ea.sesiones);
    const sup = await cloud.meHanSuperado();
    if(sup.ok) setSuperadoPor(sup.filas);
    const am = await cloud.listarAmigos();
    if(am.ok) setAmigos(am.amigos);
    const sol = await cloud.solicitudesRecibidas();
    if(sol.ok) setSolicitudes(sol.solicitudes);
    const env = await cloud.rutinasRecibidas();
    if(env.ok) setEnviosRutina(env.envios);
    // El resumen quincenal (opt-in). Se enseña hasta que lo cierras; el siguiente sale solo.
    const rs = await cloud.ultimoResumen();
    if(rs.ok && rs.resumen && rs.resumen.id !== await loadGlobal("gym:resumenVisto", null)) setResumen(rs.resumen);
    // Registra el dispositivo en FCM. Sin google-services.json el plugin no
    // existe y esto no hace nada: la app funciona igual.
    if(push.pushDisponible()) push.activarPush();
    saveGlobal("gym:ultimaVisita", new Date().toISOString());
  }

  /* Al abrir con sesión: ping (mantiene vivo el proyecto gratis de Supabase, que
     se pausa tras ~1 semana sin actividad) y comprobación de versión nueva.
     Todo en segundo plano: si falla, la app ni se entera. */
  useEffect(()=>{
    if(!cloud.cloudEnabled) return;
    let vivo = true;
    (async()=>{
      const ses = await cloud.getSession();
      if(!vivo) return;
      setCloudSession(ses);
      setSesionResuelta(true);
      if(ses) await cargarSocial(ses.user?.id);
      const can = await loadGlobal("gym:canal", CANAL_BUILD);
      if(vivo) setCanalState(can);
      const v = await cloud.versionMasNueva(APP_VERSION_CODE, can, CANAL_BUILD);
      if(vivo && v.ok && v.hayNueva) setUpdateInfo(v.version);
    })();
    const off = cloud.onAuthChange(async(ses)=>{
      if(!vivo) return;
      setCloudSession(ses);
      if(!ses){ setPerfil(null); socialCargadoPara.current = null; return; }
      // Entrar a mano pasa por aquí, no por el arranque: sin esto, quien
      // iniciaba sesión se quedaba sin quedadas, sin amigos y sin novedades
      // hasta cerrar y volver a abrir la app.
      cargarSocial(ses.user?.id);
    });
    // Con la app abierta, Android no muestra la notificación: se enseña como aviso.
    const offPush = push.alRecibirEnPrimerPlano(({ texto })=>{
      if(texto) showToast({ title:"RPGym", sub:texto, icon:Users });
    });

    return ()=>{ vivo=false; off(); offPush(); };
  },[]);

  const persist = useCallback((ns,nl,nm)=>{ saveKey("gym:state",ns); if(nl) saveKey("gym:log",nl); if(nm) saveKey("gym:measures",nm); },[]);

  /* El informe de la semana que acaba de cerrarse SALE SOLO la primera vez que
     abres la app con la semana ya terminada (en la práctica, el lunes). Después
     se consulta cuando quieras desde la ficha de personaje.

     `gym:informeVisto` guarda el lunes de la última semana ya enseñada, así que
     no vuelve a salir por mucho que abras y cierres. No se enseña si esa semana
     no tienes nada que contar: un móvil recién estrenado no necesita un informe
     en blanco de bienvenida. */
  const informeAuto = useRef(false);
  useEffect(()=>{
    if(loading || needsOnboarding || informeAuto.current) return;
    // Con la nube configurada, primero hay que pasar la pantalla de entrada:
    // si no, el informe se daría por visto detrás del login.
    if(cloud.cloudEnabled && (!sesionResuelta || (!cloudSession && !sinCuenta))) return;
    informeAuto.current = true;
    // Con un entreno recuperado saldría del entreno sin forma de volver. Sale en
    // la siguiente apertura: `gym:informeVisto` no se ha tocado.
    if(session) return;
    (async()=>{
      const lunes = addDaysISO(mondayOf(todayISO()), -7);
      /* GAME OVER: solo si había racha que perder y la semana cerrada la ha cortado.
         Sale una vez, y dice lo importante: el nivel y las marcas siguen ahí. */
      const dias = plannedDaysOf(state), opts = semanaOpts(state);
      const cerrada = resumenSemana(log, dias, lunes, opts);
      if(cerrada.previstos > 0 && !cerrada.cumplida && !cerrada.vacaciones && await loadKey("gym:gameOverVisto", null) !== lunes){
        saveKey("gym:gameOverVisto", lunes);
        const racha = habitStreak(log, dias, { ...opts, desde:addDaysISO(lunes,-7) });
        if(racha > 0) lanzarEfecto({ tipo:"gameOver", titulo:`Racha de ${racha} día${racha===1?"":"s"} perdida`,
          nota:"Tu nivel, tu XP y tus marcas siguen intactos. Esta semana empiezas otra partida." });
      }
      if(await loadGlobal("gym:informeVisto", null) === lunes) return;
      saveGlobal("gym:informeVisto", lunes);
      const domingo = addDaysISO(lunes, 6);
      if(!log.some(r => r.date >= lunes && r.date <= domingo)) return;   // nada que contar
      setInformeLunes(lunes); setInformeVuelve("home"); setTab("informe");
    })();
  }, [loading, needsOnboarding, sesionResuelta, cloudSession, sinCuenta]);

  function setTheme(t){ setThemeState(t); saveGlobal("gym:theme", t); }
  function setSonido(on){ sonidoActivo = on; setSonidoState(on); saveGlobal("gym:sonido", on); if(on){ prepararSonido(); sfx("serie"); } }

  useEffect(()=>{
    // Sin esto la fuente se pide al salir el primer LEVEL UP y el título aparece un instante con otra letra.
    document.fonts?.load("16px 'Press Start 2P'").catch(()=>{});
    const primerToque = ()=>prepararSonido();
    window.addEventListener("pointerdown", primerToque, { once:true });
    return ()=>window.removeEventListener("pointerdown", primerToque);
  }, []);

  // Sincroniza fondo del body, color-scheme y barra de estado (Android) con el tema.
  useEffect(()=>{
    const dark = theme !== "light";
    const bg = dark ? "#100D1A" : "#F3ECDE";
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
    document.body.style.background = bg;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", bg);
  }, [theme]);

  async function loadProfileData(){
    setStorePrefix("");
    const s = await loadKey("gym:state", DEFAULT_STATE);
    const l = await loadKey("gym:log", []);
    const m = await loadKey("gym:measures", []);
    const mp = await loadKey("gym:mealplan", null);
    const exc = await loadKey("gym:excludes", []);
    const cr = await loadKey("gym:routines", []);
    const cd = await loadKey("gym:customdiet", null);
    const nowMon = mondayOf(todayISO());
    if (s.weekStart !== nowMon) { if (!s.weekGoalMet) s.weekStreak = 0; s.weekStart = nowMon; s.weeklyCount = 0; s.weekGoalMet = false; s.weekPRs = 0; }
    /* El "cheat day" pasó a ser un DÍA DE DESCANSO (1.0.18): mismo contador,
       otro significado. Se arrastra el valor viejo para no regalar ni quitar
       nada a quien venga de una versión anterior o restaure una copia antigua. */
    if (s.restTokens == null && s.cheatTokens != null) s.restTokens = s.cheatTokens;
    const merged = { ...DEFAULT_STATE, ...s,
      profile: { ...DEFAULT_STATE.profile, ...(s.profile || {}) },
      reminders: { ...DEFAULT_STATE.reminders, ...(s.reminders || {}) },
      sub: { ...DEFAULT_STATE.sub, ...(s.sub || {}) },
      missions: { ...DEFAULT_STATE.missions, ...(s.missions || {}) },
      cycle: { ...DEFAULT_STATE.cycle, ...(s.cycle || {}) },
      restWeeks: s.restWeeks || {}, vacations: Array.isArray(s.vacations) ? s.vacations : [] };
    // Arrastra los nombres de ejercicio que se hayan corregido desde la última versión.
    const mig = migrarNombres({ state:merged, log:l, customRoutines:(Array.isArray(cr)?cr:[]) });
    if(mig.tocado){ saveKey("gym:state", mig.state); saveKey("gym:log", mig.log); saveKey("gym:routines", mig.customRoutines); }

    setState(mig.state); setLog(mig.log); setMeasures(m); setMealPlan(mp); setExcludesState(exc);
    setCustomRoutinesState(mig.customRoutines.map(normalizeCustomRoutine));
    setCustomDietState(normalizeCustomDiet(cd));
    setMazmorra(M.comprobarLogros(M.cargarMazmorra(await loadKey("gym:mazmorra", null)), todayISO(), false));
    setNeedsOnboarding(!mig.state.profile?.onboarded);
    scheduleAllReminders(mig.state.reminders, mig.state.sub, mig.state.vacations);
  }
  function updateProfile(fields){
    const np = { ...state.profile, ...fields }; const ns = { ...state, profile: np };
    setState(ns); persist(ns);
  }
  function completeOnboarding(data){
    const { days, cycle, ...profileData } = data;
    const activeRoutine = pickInitialRoutine({ goal:data.goal, experience:data.experience, sex:data.sex });
    const reminders = { ...state.reminders, days: (days && days.length) ? days : [1,3,5] };
    const ns = { ...state,
      profile: { ...state.profile, ...profileData, units:"kg", onboarded:true },
      reminders, cycle: cycle ? { ...state.cycle, ...cycle } : state.cycle,
      activeRoutine, startDate: todayISO(), weekStart: mondayOf(todayISO()) };
    setState(ns); persist(ns); scheduleAllReminders(reminders, ns.sub, ns.vacations);
    setNeedsOnboarding(false); setTab("home");
  }
  async function resetProgress(){
    for (const k of BACKUP_KEYS) { try { await window.storage.delete(k); } catch {} }
    setState(DEFAULT_STATE); setLog([]); setMeasures([]); setMealPlan(null); setExcludesState([]);
    setCustomRoutinesState([]); setCustomDietState(blankCustomDiet());
    setTab("home"); setNeedsOnboarding(true);
  }

  /* --- Copia de seguridad --------------------------------------------------
     Todo el progreso vive en el localStorage del WebView, que se borra al
     desinstalar la app. Esto permite sacarlo y volver a meterlo (por ejemplo
     al pasar del APK de pruebas a la versión de Google Play, que va firmada
     con otra clave y obliga a desinstalar). Solo texto: nada de plugins. */
  async function exportBackup(){
    const data = {};
    for (const k of BACKUP_KEYS) { try { const r = await window.storage.get(STORE_PREFIX+k); data[k] = r ? r.value : null; } catch { data[k] = null; } }
    return JSON.stringify({ app:BACKUP_APP, format:BACKUP_FORMAT, exportedAt:new Date().toISOString(), theme, prefijo:STORE_PREFIX, data });
  }
  async function importBackup(text){
    let obj;
    try { obj = JSON.parse(String(text||"").trim()); } catch { return { ok:false, msg:"Eso no es una copia válida (no se puede leer)." }; }
    if ((obj?.app !== BACKUP_APP && obj?.app !== BACKUP_APP_LEGACY) || !obj.data) return { ok:false, msg:"Esa copia no es de RPGym." };
    for (const k of BACKUP_KEYS) {
      const v = obj.data[k];
      try { if (v == null) await window.storage.delete(STORE_PREFIX+k); else await window.storage.set(STORE_PREFIX+k, v); } catch {}
    }
    if (obj.theme) setTheme(obj.theme);
    await loadProfileData();
    setSession(null); setResults(null); setTab("home");
    return { ok:true, msg:"Progreso restaurado." };
  }
  function setReminders(r){ const ns = { ...state, reminders: r }; setState(ns); persist(ns); scheduleAllReminders(r, ns.sub, ns.vacations); }
  function setSub(s){ const ns = { ...state, sub: s }; setState(ns); persist(ns); scheduleAllReminders(ns.reminders, s, ns.vacations); }
  function setCycle(c){ const ns = { ...state, cycle: { ...state.cycle, ...c } }; setState(ns); persist(ns); }

  function startWorkout(routineId, dayIdx){
    const routine=findRoutine(routineId, customRoutines); const day=routine?.days?.[dayIdx];
    if(!routine || !day || !day.exercises.length){
      showToast({ title:"Ese día está vacío", sub:"Añádele algún ejercicio antes de empezar.", icon:ClipboardList });
      return;
    }
    // Ajuste por fase del ciclo (si la usuaria lo activó): energía por defecto según la fase.
    const cph = (state.profile?.sex==="mujer" && state.cycle?.enabled) ? cyclePhaseFor(state.cycle, todayISO()) : null;
    setSession({
      routineId, dayIdx, routineName:routine.name, dayName:day.name, rpe:routine.rpe, energy: cph?.energy || "normal",
      isRecomp: routine.cat==="Recomposición",
      cyclePhase: cph ? { label:cph.label, training:cph.training, color:cph.color } : null,
      startedAt:Date.now(),
      exercises: day.exercises.map(ex=>{
        // Cardio: ni carga ni (en el continuo) descanso. Tiempo y, si hay consola, km/kcal/nivel.
        if (isCardio(ex.name)) {
          const target = String(ex.reps).match(/^(\d+)/);   // "20 min" -> 20 (prefill del objetivo)
          const prev = state.cardioBests?.[ex.name];
          return { ...ex, base:0, logs:Array.from({length:ex.sets},()=>({
            weight:"", reps: target ? target[1] : "", km:"", kcal:"",
            level: prev?.level ? String(prev.level) : "", done:false })) };
        }
        // Peso corporal / isométrico: sin carga, solo reps o segundos.
        if (isBodyweight(ex.name)) {
          return { ...ex, base:0, logs:Array.from({length:ex.sets},()=>({ weight:"", reps: parseTargetReps(ex.reps), done:false })) };
        }
        const next = state.nextWeight?.[ex.name];
        const known = state.bests[ex.name];
        // Prioridad: progresión sugerida > última marca > peso base ajustado por sexo, fase (RPE) y peso corporal.
        const base = next != null ? next : known != null ? known
          : baseFor(ex.name, state.profile?.sex) * startWeightMult(routine.rpe) * bodyweightFactor(state.profile?.weightKg, state.profile?.sex);
        const sug = round25(base);
        return { ...ex, base, logs:Array.from({length:ex.sets},()=>({ weight: sug||"", reps: parseTargetReps(ex.reps), done:false })) };
      }),
    });
    setResults(null); setTab("workout");
    /* El permiso, ahora que tienes el móvil en la mano. Antes se pedía dentro
       del primer descanso: si el diálogo se quedaba sin contestar porque ya te
       lo habías guardado, el await no resolvía y ese aviso no se programaba. */
    if(!permisoPedido){ permisoPedido = true; ensureNotifPerm().catch(()=>{}); }

    // Si ya te has unido al entreno de alguien, se respeta. Si no, se abre una
    // sesión para que tus amigos puedan unirse mientras entrenas.
    if(cloud.cloudEnabled && perfil && !sesionConjunta){
      cloud.abrirSesionConjunta(routine.name).then(r=>{
        if(r.ok) setSesionConjunta({ id:r.sesion.id, laAbriYo:true, con:null });
      });
      cloud.avisarAmigos("entreno");          // "X está entrenando ahora"
    }
  }

  async function finishWorkout(){
    const ejercicios = separarAgarres(session.exercises);
    let volume=0, xpBase=100, xpSets=0, xpPr=0, prs=0, seriesDone=0;
    const bests={ ...state.bests }, firstBests={ ...state.firstBests };
    let doubled=false; const prList=[];
    ejercicios.forEach(ex=>{
      ex.logs.forEach(l=>{
        if(l.done){
          seriesDone++; xpSets+=5;
          const w=parseFloat(l.weight)||0, reps=parseInt(l.reps)||0;
          volume+=w*reps;
          if(w>0){
            if(firstBests[ex.name]==null) firstBests[ex.name]=w;
            if(bests[ex.name]==null || w>bests[ex.name]){
              if(bests[ex.name]!=null){ prs++; xpPr+=50; prList.push({ name:ex.name, prev:bests[ex.name], now:w, unit:"kg" }); }
              bests[ex.name]=w;
            }
            if(firstBests[ex.name]>0 && w>=firstBests[ex.name]*2) doubled=true;
          }
        }
      });
    });

    /* --- Récords de cardio -------------------------------------------------
       El cardio no mueve kilos, así que sus marcas van aparte: tiempo, distancia,
       calorías y ritmo. Solo se guardan las tiradas medidas en MINUTOS (en los
       intervalos por segundos el campo son segundos y compararlos sería mentir).
       Cuenta como PR una vez por ejercicio, aunque mejores varias métricas. */
    const cardioBests={ ...(state.cardioBests||{}) };
    ejercicios.forEach(ex=>{
      if(!tracksTime(ex)) return;
      const beaten=[];
      ex.logs.forEach(l=>{
        if(!l.done) return;
        const num=v=>{ const n=parseFloat(String(v??"").replace(",",".")); return isFinite(n)&&n>0 ? n : 0; };
        const min=num(l.reps), km=num(l.km), kcal=num(l.kcal), level=num(l.level);
        if(!min && !km && !kcal) return;
        const pace = (km>0 && min>0) ? Math.round((km/(min/60))*10)/10 : 0;
        const prev = cardioBests[ex.name] || {};
        const next = { ...prev };
        [["min",min],["km",km],["kcal",kcal],["pace",pace]].forEach(([k,v])=>{
          if(v>0 && v>(prev[k]||0)){
            next[k]=v;
            if(prev[k]>0) beaten.push({ k, prev:prev[k], now:v });   // la primera vez no es récord, es la marca inicial
          }
        });
        if(level>(next.level||0)) next.level=level;
        next.date=todayISO();
        cardioBests[ex.name]=next;
      });
      if(beaten.length){
        // Una entrada por ejercicio, con la métrica más representativa (km > min > kcal > ritmo).
        const orden=["km","min","kcal","pace"];
        const best=beaten.slice().sort((a,b)=>orden.indexOf(a.k)-orden.indexOf(b.k))[0];
        prs++; xpPr+=50;
        prList.push({ name:ex.name, prev:numES(best.prev), now:numES(best.now), unit:CARDIO_UNITS[best.k] });
      }
    });

    // XP por grupo muscular (ficha de personaje)
    const muscleXp={ ...(state.muscleXp||{}) }; const mGains={}; const muscleLevelUps=[];
    ejercicios.forEach(ex=>{ const catg=BODY_MAP[ex.muscle]; if(!catg) return;
      const cardioTime=tracksTime(ex);
      ex.logs.forEach(l=>{ if(l.done){ const w=parseFloat(l.weight)||0, reps=parseInt(l.reps)||0;
        // Cardio continuo: sin kilos que contar, la XP sale de los minutos aguantados.
        const bonus = cardioTime ? Math.round(reps/3) : Math.round((w*reps)/120);
        mGains[catg]=(mGains[catg]||0)+10+bonus; } }); });
    Object.entries(mGains).forEach(([c,g])=>{ const before=catLevel(muscleXp[c]||0); muscleXp[c]=(muscleXp[c]||0)+g;
      const after=catLevel(muscleXp[c]); if(after>before) muscleLevelUps.push({ cat:c, level:after }); });

    const goal = weeklyGoalFor(state, findRoutine(state.activeRoutine, customRoutines));
    let weeklyCount=state.weeklyCount+1, weekGoalMet=state.weekGoalMet, weekStreak=state.weekStreak, restTokens=state.restTokens;
    let xpGoal=0, goalJustMet=false;
    if(!weekGoalMet && weeklyCount>=goal){ weekGoalMet=true; goalJustMet=true; weekStreak+=1; restTokens+=1; xpGoal=200; }

    const totalWorkouts=state.totalWorkouts+1;
    const routinesUsed = state.routinesUsed.includes(session.routineId) ? state.routinesUsed : [...state.routinesUsed, session.routineId];
    const prevLevel=level;
    const sessionXp = xpBase+xpSets+xpPr+xpGoal;
    const hour=new Date().getHours();

    // Comparación con la última sesión igual
    const prevSame=[...log].reverse().find(s=>s.routineName===session.routineName && s.dayName===session.dayName);
    const seriesDelta = prevSame ? seriesDone - seriesDe(prevSame) : null;

    // Logros
    const ach={ ...state.achievements }; const unlocked=[];
    const tentXp=state.xp+sessionXp; const tentLevel=levelFromXp(tentXp);
    const U=(id,cond)=>{ if(!ach[id]&&cond){ ach[id]=todayISO(); unlocked.push(ACHIEVEMENTS.find(a=>a.id===id)); } };
    U("primer_paso", totalWorkouts>=1); U("diez_ses", totalWorkouts>=10); U("treinta_ses", totalWorkouts>=30);
    U("cincuenta_ses", totalWorkouts>=50); U("cien_ses", totalWorkouts>=100);
    U("primer_pr", prs>0||Object.keys(bests).length>=1); U("pr_5", prs>=5);
    U("series_20", seriesDone>=20); U("series_30", seriesDone>=30);
    U("series_500", log.reduce((a,r)=>a + seriesDe(r), seriesDone) >= 500);
    U("semana_ok", weekGoalMet); U("racha_4", weekStreak>=4); U("racha_8", weekStreak>=8);
    U("nivel_10", tentLevel>=10); U("nivel_20", tentLevel>=20); U("nivel_35", tentLevel>=35);
    U("fuerza_x2", doubled); U("explorador", routinesUsed.length>=5);
    U("madrugador", hour<8); U("nocturno", hour>=22);
    U("medidor", state.measureCount>=4);

    let achXp=0; unlocked.forEach(a=>achXp+=a.xp);

    // Progresión de peso (doble progresión): si completas TODAS las series al tope del rango, sube el peso la próxima vez.
    const nextWeight={ ...(state.nextWeight||{}) }; const progressed=[];
    ejercicios.forEach(ex=>{
      if(isCardio(ex.name)) return;                 // el cardio no progresa por kilos
      const doneSets=ex.logs.filter(l=>l.done); if(!doneSets.length) return;
      const w=Math.max(...doneSets.map(l=>parseFloat(l.weight)||0)); if(w<=0) return; // sin carga: no progresa por peso
      const m=String(ex.reps).match(/(\d+)\s*-\s*(\d+)/);
      const topR = m ? +m[2] : (/^(\d+)/.test(String(ex.reps)) ? +String(ex.reps).match(/^(\d+)/)[1] : null);
      const hitTop = topR!=null && doneSets.every(l=>(parseInt(l.reps)||0) >= topR);
      const inc = w<40?2.5:5;
      nextWeight[ex.name]=round25(hitTop ? w+inc : w);
      if(hitTop) progressed.push({ name:ex.name, from:w, to:round25(w+inc) });
    });

    const durationMin = Math.max(1, Math.round((Date.now()-session.startedAt)/60000));
    const record={ date:todayISO(), routineName:session.routineName, dayName:session.dayName,
      volume:Math.round(volume), xp:sessionXp+achXp, series:seriesDone, energy:session.energy, durationMin,
      exercises:ejercicios.map(e=>({ name:e.name, muscle:e.muscle, objetivo:e.reps, logs:e.logs.filter(l=>l.done).map(l=>{
        const base={ weight:parseFloat(l.weight)||0, reps:parseInt(l.reps)||0 };
        if(!isCardio(e.name)) return base;
        // El cardio guarda también lo que marcó la máquina (solo lo que se rellenó).
        const num=v=>{ const n=parseFloat(String(v??"").replace(",",".")); return isFinite(n)&&n>0 ? n : undefined; };
        return { ...base, km:num(l.km), kcal:num(l.kcal), level:num(l.level) };
      }) })) };
    const nlog=[...log, record];

    // Récords de la semana + misiones semanales (dan XP; se reinician cada lunes).
    const weekPRs=(state.weekPRs||0)+prs;
    const claimedPrev = (state.missions && state.missions.week===state.weekStart) ? state.missions.claimed : [];
    const ctx=missionContext({ ...state, weekPRs, weekStart:state.weekStart }, nlog);
    let missionXp=0; const missionsDone=[]; const claimed=[...claimedPrev];
    WEEKLY_MISSIONS.forEach(mn=>{ if(claimed.includes(mn.id)) return; if(mn.check(ctx)){ claimed.push(mn.id); missionXp+=mn.xp; missionsDone.push(mn); } });
    const missions={ week:state.weekStart, claimed };

    /* Entrenar acompañado: XP extra fijo. Se resuelve más abajo, tras conocer
       si de verdad había alguien más en la sesión. */
    let xpConjunto = 0, companeros = [];

    /* Primera vez que entrenas la rutina de un amigo: XP extra. Solo una vez por
       rutina, y el bonus es FIJO (no proporcional al volumen) para que no salga
       a cuenta inflarlo repitiendo la misma sesión. */
    const rutinaActual = findRoutine(session.routineId, customRoutines);
    let xpAmigo = 0, amigoDe = null;
    if(rutinaActual?.sharedFrom && !rutinaActual.bonusHecho){
      xpAmigo = XP_RUTINA_AMIGO; amigoDe = rutinaActual.sharedFrom;
      const nr = customRoutines.map(r => r.id===rutinaActual.id ? { ...r, bonusHecho:true } : r);
      setCustomRoutinesState(nr); saveKey("gym:routines", nr);
    }

    // Récord de racha de hábito
    const newStreak=habitStreak(nlog, state.reminders?.days, semanaOpts(state));
    const bestStreak=Math.max(state.bestStreak||0, newStreak);

    // ¿Había alguien más? El bonus solo cuenta si de verdad entrenasteis juntos.
    if(cloud.cloudEnabled && sesionConjunta){
      const r = await cloud.cerrarAportacion({ sessionId:sesionConjunta.id, xp:sessionXp+achXp+missionXp, laAbriYo:sesionConjunta.laAbriYo });
      if(r.ok && r.companeros.length){ xpConjunto = XP_CONJUNTO; companeros = r.companeros; }
      setSesionConjunta(null);
    }

    const finalXp=state.xp+sessionXp+achXp+missionXp+xpAmigo+xpConjunto; const finalLevel=levelFromXp(finalXp);

    const ns={ ...state, xp:finalXp, restTokens, totalWorkouts, weeklyCount, weekGoalMet, weekStreak,
      lastWorkoutDate:todayISO(), achievements:ach, bests, firstBests, routinesUsed, muscleXp,
      nextWeight, weekPRs, missions, bestStreak, cardioBests };
    setState(ns); setLog(nlog); persist(ns,nlog);
    // Justo aquí, sin esperas por medio: si la app muere ya apuntado el entreno,
    // recuperarlo y terminarlo otra vez lo contaría dos veces.
    saveKey(ENTRENO_KEY, null);

    setResults({
      routineName:session.routineName, dayName:session.dayName, durationMin, seriesDone,
      volume:Math.round(volume), xpBase, xpSets, xpPr, xpGoal, missionXp, achXp, xpAmigo, amigoDe, xpConjunto, companeros, sessionXp:sessionXp+achXp+missionXp+xpAmigo+xpConjunto,
      prs:prList, seriesDelta, unlocked, restEarned:goalJustMet, levelUp: finalLevel>prevLevel ? finalLevel : null,
      muscleLevelUps, mGains, progressed, missionsDone, newStreak, bestStreak, bestStreakBeat: newStreak>(state.bestStreak||0),
      rankName: rankFor(finalLevel).name,
      cambios: session.editado ? { routineId:session.routineId, dayIdx:session.dayIdx, dayName:session.dayName,
        exercises:session.exercises.map(e=>({ name:e.name, sustituyeA:e.sustituyeA, sets:e.logs.length, reps:e.reps, rest:e.rest, muscle:e.muscle })) } : null,
    });
    setSession(null); setTab("results");
    const fx = [];
    if(finalLevel>prevLevel) fx.push({ tipo:"levelUp", nivel:finalLevel,
      rango: rankFor(finalLevel).name!==rankFor(prevLevel).name ? rankFor(finalLevel).name : null });
    if(goalJustMet) fx.push({ tipo:"vidaExtra" });
    actualizarMazmorra(m=>M.darLlave(m, todayISO()));
    const antesRamas = puntosDeRama(log), ahoraRamas = puntosDeRama(nlog);
    const botin = [...piezasNuevas(antesRamas, ahoraRamas), ...M.especialesNuevos(antesRamas, ahoraRamas).map(e=>({ n:`Especial: ${e.nombre}`, rama:e.rama }))];
    if(botin.length) fx.push({ tipo:"botin", piezas:botin });
    if(fx.length) lanzarEfecto(...fx);

    // Sube el estado de juego (si hay cuenta). Sin bloquear.
    // Desde la 1.0.x se sube también el detalle y las marcas: es lo que permite
    // compararse. El ciclo y las rutinas privadas siguen sin salir del móvil.
    if(cloud.cloudEnabled && perfil){
      cloud.sincronizarPerfil({ level:finalLevel, xp:finalXp, totalWorkouts, bestStreak,
        displayName:state.profile?.name, appVersion:APP_VERSION_NAME, atributos:ns.muscleXp || {}, avatar:ns.avatar });
      cloud.registrarEntreno({ clientId:`${record.date}-${session.startedAt}`,
        day:record.date, xp:record.xp, prs:prList.length,
        rutina:`${record.routineName} · ${record.dayName}`, detalle:record.exercises });
      cloud.subirRecords(bests, sesionesPorEjercicio(nlog), Object.keys(RENOMBRES));
      // ¿He adelantado a alguien con los récords de hoy?
      if(prList.length){
        cloud.avisarAmigos("record");          // "X acaba de batir un récord"
        cloud.heSuperado(prList.map(p=>p.name)).then(r=>{
          if(r.ok && r.filas.length){
            setAdelantados(r.filas);
            // A quien hayas adelantado, se le avisa: es el pique que engancha.
            r.filas.forEach(f => cloud.avisarAmigos("superado", { ejercicio:f.ejercicio, para:f.user_id }));
          }
        });
      }
    }
  }

  function addMeasurement(m){
    const nm=[...measures,m].sort((a,b)=>a.date.localeCompare(b.date));
    const ns={ ...state, profile:{ ...state.profile, weightKg:m.weightKg }, measureCount:(state.measureCount||0)+1 };
    setMeasures(nm); setState(ns); persist(ns,null,nm);
    showToast({ title:"Medición guardada", sub:"El progreso se nota antes en los números que en el espejo", icon:Ruler });
  }
  /* Canjear un día de descanso: esta semana exige una sesión menos.
     Solo UNO por semana — encadenarlos borraría la semana entera y la racha
     dejaría de contar nada. Y no se deja gastar en una semana ya cumplida o sin
     nada que perdonar: sería tirar la ficha a la basura. */
  function useRest(){
    const lunes = mondayOf(todayISO());
    if((state.restTokens||0) <= 0) return;
    if((state.restWeeks||{})[lunes]) { showToast({ title:"Ya has descansado", sub:"Solo se puede canjear un día por semana.", icon:BedDouble }); return; }
    const antes = resumenSemana(log, plannedDaysOf(state), lunes, semanaOpts(state));
    if(antes.previstos <= 0 || state.weekGoalMet){ showToast({ title:"No hace falta", sub:"Esta semana ya la tienes hecha. Guárdatelo para otra.", icon:BedDouble }); return; }
    const restWeeks = { ...(state.restWeeks||{}), [lunes]:1 };
    const ns = { ...state, restTokens:state.restTokens-1, restWeeks };
    /* Si al perdonar el día la semana queda cumplida, se da por cumplida y la
       racha sigue — que es justo para lo que sirve. Sin XP ni ficha nueva: eso
       se gana entrenando, y si no se caería en un bucle de regalarse fichas. */
    const despues = resumenSemana(log, plannedDaysOf(state), lunes, semanaOpts(ns));
    if(!ns.weekGoalMet && ns.weeklyCount >= despues.previstos){ ns.weekGoalMet = true; ns.weekStreak = (ns.weekStreak||0)+1; }
    setState(ns); persist(ns);
    showToast({ title:"Día de descanso canjeado", sub:`Esta semana te bastan ${despues.previstos} sesion${despues.previstos===1?"":"es"}. Descansa sin culpa.`, icon:BedDouble });
  }

  /* Vacaciones: durante el rango no hay sesiones previstas, así que la racha no
     se rompe y los recordatorios se callan. Se guarda el histórico de rangos
     para que la racha siga saliendo bien cuando se recalcule meses después. */
  function setVacaciones(rango){
    const vacs = [...(state.vacations||[])].filter(v => v && v.from && v.to);
    const ns = { ...state, vacations: rango ? [...vacs, rango] : vacs };
    setState(ns); persist(ns); scheduleAllReminders(ns.reminders, ns.sub, ns.vacations);
    if(rango) showToast({ title:"Buenas vacaciones", sub:"La racha te espera intacta. Vuelve con ganas.", icon:Palmtree });
  }
  /* Volver antes de tiempo: se recorta el rango en curso a ayer. */
  function terminarVacaciones(){
    const hoy = todayISO(), ayer = addDaysISO(hoy, -1);
    const vacs = (state.vacations||[])
      .map(v => (v.from <= hoy && v.to >= hoy) ? { ...v, to: ayer } : v)
      .filter(v => v.to >= v.from);
    const ns = { ...state, vacations: vacs };
    setState(ns); persist(ns); scheduleAllReminders(ns.reminders, ns.sub, ns.vacations);
    showToast({ title:"De vuelta", sub:"Se acabó el descanso. A por ello.", icon:Flame });
  }
  function setActiveRoutine(id){ const ns={ ...state, activeRoutine:id }; setState(ns); persist(ns); }
  function saveMealPlan(mp){ setMealPlan(mp); saveKey("gym:mealplan", mp); }
  function setExcludes(next){ setExcludesState(next); saveKey("gym:excludes", next); }

  /* Tras canjear un código no basta con recargar la lista de amigos: con el
     amigo nuevo aparecen sus quedadas, su sitio en la clasificación y lo que
     te haya mandado. Antes había que cerrar la app para verlo. */
  async function refrescarAmigos(){ return refrescarSocial(); }
  function abrirAmigo(a){ setAmigoAbierto(a); setTab("amigo"); }
  function abrirResumenes(desde){ setResumenesVuelve(desde || "home"); setTab("resumenes"); }
  function abrirInforme(lunes, desde){ setInformeLunes(lunes || mondayOf(todayISO())); setInformeVuelve(desde || "home"); setTab("informe"); }
  function cerrarAmigo(){ setAmigoAbierto(null); setTab("amigos"); }

  /* Lo que cambia porque lo mueve OTRO: quién te ha pedido amistad, quién te
     ha mandado una rutina, qué quedadas hay, quién está entrenando. Sin esto la
     app solo se enteraba al arrancar, y había que cerrarla y abrirla para ver
     un amigo recién añadido o una quedada recién propuesta. */
  const refrescandoRef = useRef(false);
  async function refrescarSocial(){
    if(!cloud.cloudEnabled || !cloudSession || refrescandoRef.current) return;
    refrescandoRef.current = true;
    try {
      const [am, sol, env, q, ea, sup] = await Promise.all([
        cloud.listarAmigos(), cloud.solicitudesRecibidas(), cloud.rutinasRecibidas(),
        cloud.listarQuedadas(), cloud.quienEntrenaAhora(), cloud.meHanSuperado(),
      ]);
      if(am.ok)  setAmigos(am.amigos);
      if(sol.ok) setSolicitudes(sol.solicitudes);
      if(env.ok) setEnviosRutina(env.envios);
      if(q.ok)   setQuedadas(q.quedadas);
      if(ea.ok)  setEntrenando(ea.sesiones);
      if(sup.ok) setSuperadoPor(sup.filas);
      await sincronizarRutinasSeguidas();
    } finally { refrescandoRef.current = false; }
  }

  /* Cada minuto con la app delante, y al volver a ella. Con la app en segundo
     plano no se consulta nada: no tiene sentido gastar batería ni cuota. */
  useEffect(()=>{
    if(!cloud.cloudEnabled || !cloudSession) return;
    const t = setInterval(()=>{ if(document.visibilityState === "visible") refrescarSocial(); }, 60000);
    const alVolver = ()=>{ if(document.visibilityState === "visible") refrescarSocial(); };
    document.addEventListener("visibilitychange", alVolver);
    return ()=>{ clearInterval(t); document.removeEventListener("visibilitychange", alVolver); };
    // eslint-disable-next-line
  },[cloudSession?.user?.id]);

  /* Al abrir con sesión guardada también hay que subir el estado: si no, quien
     ya estaba dentro nunca subiría sus atributos ni sus marcas y sus amigos le
     verían la ficha vacía para siempre.

     OJO con el momento: esto NO puede ir en cargarSocial(), que corre en el
     montaje, cuando `state` es todavía el de por defecto. Subiría nivel 1 y XP
     0 y machacaría el perfil bueno. Por eso espera a que el progreso local esté
     leído (`loading` en false) y se hace una sola vez por sesión. */
  const perfilSubidoRef = useRef(false);
  useEffect(()=>{
    if(loading || !cloud.cloudEnabled || !perfil || perfilSubidoRef.current) return;
    perfilSubidoRef.current = true;
    subirPerfil(perfil);
    sincronizarRutinasSeguidas();     // ahora sí: las rutinas locales ya están leídas
    // eslint-disable-next-line
  },[loading, perfil?.handle]);

  /* Ofrece la copia de la nube solo si aporta algo: el móvil está vacío o la copia
     va por delante de lo que hay aquí. Tampoco puede ir en cargarSocial(): allí
     `state` es el de por defecto, parecía que el móvil estaba vacío y la tarjeta
     salía en cada arranque. "Ahora no" vale para esa copia hasta que suba otra. */
  const copiaMiradaRef = useRef(false);
  useEffect(()=>{
    if(loading || !cloud.cloudEnabled || !perfil || copiaMiradaRef.current) return;
    copiaMiradaRef.current = true;
    (async()=>{
      const c = await cloud.bajarCopia();
      if(!c.ok || !c.copia) return;
      if(await loadGlobal("gym:copiaDescartada", null) === c.copia.updated_at) return;
      const aqui = resumenProgreso(state, log), nube = await resumenCopiaNube(c.copia);
      if(nube && nube.prefijo !== STORE_PREFIX) return;      // es de otro perfil
      const vacio = !aqui.entrenos;
      const ofrecer = vacio ? (!nube || nube.entrenos>0) : (nube && compararProgreso(aqui, nube)==="copia");
      if(ofrecer) setCopiaNube({ ...c.copia, vacio, nube, aqui });
    })();
    // eslint-disable-next-line
  },[loading, perfil?.handle]);

  /* La Gloria se sube sola para que tus amigos te vean en la clasificación. Espera a
     `loading` por lo de siempre: antes el total es cero y machacaría el bueno. */
  useEffect(()=>{
    if(loading || !cloud.cloudEnabled || !perfil || !mazmorra.gloria) return;
    cloud.subirMazmorra(mazmorra);
    // eslint-disable-next-line
  },[loading, perfil?.handle, mazmorra.gloria]);

  /* Pone al día las rutinas importadas. El dueño manda: si su versión es más
     nueva que la que guardaste, se sustituyen días y nombre. Lo tuyo que no
     viaja (el id local, si está activa, el bono de estrenarla) se conserva. */
  async function sincronizarRutinasSeguidas(){
    if(!cloud.cloudEnabled || !cloudSession) return;
    const actuales = customRoutinesRef.current || [];
    if(!actuales.some(r => r.origen?.ownerId && r.origen?.clientId)) return;
    const r = await cloud.rutinasSeguidas();
    if(!r.ok || !r.rutinas.length) return;

    const cambiadas = [];
    const next = actuales.map(local => {
      if(!local.origen?.clientId) return local;
      const remota = r.rutinas.find(x => x.owner_id === local.origen.ownerId && x.client_id === local.origen.clientId);
      if(!remota || !remota.updated_at) return local;
      if(local.origen.updatedAt && local.origen.updatedAt >= remota.updated_at) return local;

      const dec = decodeRoutine(SHARE_PREFIX + b64urlEncode(JSON.stringify(remota.payload)), []);
      if(!dec.ok) return local;
      cambiadas.push(remota.name || local.name);
      return normalizeCustomRoutine({ ...local,
        name: remota.name || local.name,
        days: dec.routine.days,
        rpe: dec.routine.rpe, subtitle: dec.routine.subtitle, blurb: dec.routine.blurb,
        origen: { ...local.origen, updatedAt: remota.updated_at } });
    });

    if(!cambiadas.length) return;
    setCustomRoutinesState(next); saveKey("gym:routines", next);
    showToast({ title: cambiadas.length===1 ? "Rutina actualizada" : "Rutinas actualizadas",
      sub: cambiadas.length===1 ? `«${cambiadas[0]}» ha cambiado: su autor la ha editado.`
                                : `${cambiadas.length} rutinas compartidas han cambiado.`,
      icon: Download });
  }

  async function quitarAmigo(id){
    const r = await cloud.borrarAmigo(id);
    if(r.ok) refrescarAmigos();
    else showToast({ title:"No se ha podido", sub:r.msg, icon:ShieldAlert });
  }

  async function refrescarEntrenando(){
    if(!cloud.cloudEnabled || !perfil) return;
    const r = await cloud.quienEntrenaAhora();
    if(r.ok) setEntrenando(r.sesiones);
  }
  /* Unirse al entreno de un amigo que ya está en el gimnasio. */
  async function unirmeAlEntreno(sesion){
    const r = await cloud.unirseSesion(sesion.id);
    if(!r.ok){ showToast({ title:"No se ha podido", sub:r.msg, icon:ShieldAlert }); return; }
    setSesionConjunta({ id:sesion.id, laAbriYo:false, con:sesion.display_name || "@"+sesion.handle });
    showToast({ title:"Entrenáis juntos", sub:ALT ? "Ya salís juntos en la lista de amigos." : `Al terminar os lleváis ${XP_CONJUNTO} XP extra.`, icon:Users });
    refrescarEntrenando();
  }

  async function refrescarQuedadas(){
    if(!cloud.cloudEnabled) return;
    setCargandoQuedadas(true);
    const r = await cloud.listarQuedadas();
    setCargandoQuedadas(false);
    if(r.ok) setQuedadas(r.quedadas);
  }

  /* Publicar / dejar de publicar una rutina para los amigos. Explícito: por
     defecto las rutinas no salen del móvil, y así lo dice la privacidad. */
  async function publicarRutina(routine){
    if(!cloud.cloudEnabled || !perfil) return;
    const estaba = publicadas.includes(routine.id);
    if(estaba){
      const r = await cloud.dejarDePublicar(routine.id);
      if(r.ok){ setPublicadas(p => p.filter(x => x !== routine.id));
        showToast({ title:"Rutina retirada", sub:"Tus amigos ya no la ven.", icon:Lock }); }
      else showToast({ title:"No se ha podido retirar", sub:r.msg, icon:ShieldAlert });
    } else {
      const payload = JSON.parse(b64urlDecode(encodeRoutine(routine).slice(SHARE_PREFIX.length)));
      const r = await cloud.publicarRutina({ clientId:routine.id, name:routine.name,
        dias:routine.days.length, payload, privada:!!routine.privada });
      if(r.ok){ setPublicadas(p => [...p, routine.id]);
        showToast({ title:"Compartida con tus amigos", sub:`${routine.name} ya aparece en su lista.`, icon:Users }); }
      else showToast({ title:"No se ha podido compartir", sub:r.msg, icon:ShieldAlert });
    }
  }

  /* --- Rutinas propias (configurador) --- */
  function saveCustomRoutine(routine){
    const previa = customRoutines.find(x=>x.id===routine?.id);
    // Editar una rutina seguida la convierte en tuya: fuera el vínculo.
    const r = normalizeCustomRoutine(previa?.origen ? { ...routine, origen:undefined } : routine);
    if(previa?.origen) r.origen = undefined;
    const exists = customRoutines.some(x=>x.id===r.id);
    const next = exists ? customRoutines.map(x=>x.id===r.id ? r : x) : [...customRoutines, r];
    setCustomRoutinesState(next); saveKey("gym:routines", next);
    showToast({ title: exists ? "Rutina actualizada" : "Rutina creada", sub:`${r.name} · ${r.days.length} día${r.days.length===1?"":"s"}`, icon:ClipboardList });
    if(cloud.cloudEnabled && perfil){
      if(previa?.origen){
        /* Has tocado una rutina que seguías: a partir de aquí es TUYA y deja de
           recibir los cambios de su autor. Si no, la próxima sincronización te
           borraría lo que acabas de escribir. */
        cloud.dejarDeSeguirRutina({ ownerId:previa.origen.ownerId, clientId:previa.origen.clientId });
        showToast({ title:"Ahora es tuya", sub:"Al editarla deja de seguir los cambios de su autor.", icon:Pencil });
      } else {
        // Si esta rutina la tiene alguien (publicada o mandada), le llega el
        // cambio. Si no tiene fila en el servidor esto no crea nada: por
        // defecto no sale del móvil y editarla no debe cambiar eso.
        cloud.actualizarRutinaCompartida({ clientId:r.id, name:r.name, dias:r.days.length,
          payload: JSON.parse(b64urlDecode(encodeRoutine(r).slice(SHARE_PREFIX.length))) });
      }
    }
    return r;
  }
  /* Lo que has cambiado en pleno entreno pasa a la rutina, si tú quieres. Una rutina
     de la app no se puede tocar: se guarda una copia tuya y pasa a ser la activa.
     Lo sustituido vuelve a su nombre original: la máquina estaba ocupada hoy, nada más. */
  function guardarCambiosRutina(c){
    const r = findRoutine(c.routineId, customRoutines);
    const i = r ? (r.days[c.dayIdx]?.name===c.dayName ? c.dayIdx : r.days.findIndex(d=>d.name===c.dayName)) : -1;
    if(i < 0){ showToast({ title:"No se ha podido guardar", sub:"Esa rutina ya no tiene ese día.", icon:ShieldAlert }); return false; }
    const antes = r.days[i].exercises;
    const exercises = c.exercises.map(e=>{
      const nombre = e.sustituyeA || e.name, o = antes.find(x=>x.name===nombre);
      return o ? { ...o, sets:e.sets } : { name:nombre, sets:e.sets, reps:e.reps, rest:e.rest, muscle:e.muscle };
    });
    const days = r.days.map((d,n)=> n===i ? { ...d, exercises } : d);
    if(r.custom){ saveCustomRoutine({ ...r, days }); return true; }
    const copia = saveCustomRoutine({ ...JSON.parse(JSON.stringify(r)), id:newRoutineId(), name:`${r.name} (mía)`, days });
    setActiveRoutine(copia.id);
    return true;
  }

  /* --- Cuenta (opcional) ------------------------------------------------- */
  async function entrarCuenta(datos){
    const r = await cloud.entrar(datos);
    if(r.ok){
      // El perfil puede no existir aún si se registró y confirmó el correo fuera.
      // Sin handle explícito, asegurarPerfil recupera el del registro pendiente.
      const p = await cloud.asegurarPerfil({ handle:datos.handle, displayName:state.profile?.name });
      if(p.ok) setPerfil(p.perfil);
      subirPerfil(p.ok ? p.perfil : null);
      showToast({ title:"Sesión iniciada", sub:"Ya puedes verte con tus amigos.", icon:User });
    }
    return r;
  }
  async function registrarCuenta(datos){
    const r = await cloud.registrar(datos);
    if(r.ok && !r.necesitaConfirmar){
      if(r.perfil) setPerfil(r.perfil);
      subirPerfil(r.perfil);
      showToast({ title:"Cuenta creada", sub:`Hola, @${r.perfil?.handle || datos.handle}`, icon:User });
    }
    return r;
  }
  /* Verifica el código del correo. Al pasar hay sesión, así que se crea el
     perfil con el usuario que eligió al registrarse. */
  async function verificarCuenta({ email, codigo }){
    const r = await cloud.verificarCodigo({ email, codigo });
    if(!r.ok) return r;
    const pend = cloud.registroPendiente();
    const p = await cloud.asegurarPerfil({ handle:pend?.handle, displayName:pend?.displayName || state.profile?.name });
    if(p.ok) setPerfil(p.perfil);
    subirPerfil(p.ok ? p.perfil : null);
    showToast({ title:"Cuenta confirmada", sub:`Hola, @${p.perfil?.handle || pend?.handle}`, icon:User });
    return { ok:true };
  }

  /* Restaura la copia cifrada de la nube. La clave sale de la contraseña al
     entrar y vive solo en este móvil: si no está, hay que volver a entrar. */
  async function restaurarDeNube(){
    if(!copiaNube) return;
    const clave = await cripto.recuperarClave();
    if(!clave){ showToast({ title:"Vuelve a entrar", sub:"Hace falta tu contraseña para descifrar la copia.", icon:Lock }); return; }
    try {
      const texto = await cripto.descifrar(copiaNube.cifrado, copiaNube.iv, clave);
      const r = await importBackup(texto);
      setCopiaNube(null);
      showToast(r.ok ? { title:"Progreso restaurado", sub:"Todo vuelve a estar donde lo dejaste.", icon:Check }
                     : { title:"No se ha podido", sub:r.msg, icon:ShieldAlert });
    } catch {
      showToast({ title:"No se ha podido descifrar", sub:"¿Cambiaste la contraseña desde que subiste la copia?", icon:ShieldAlert });
    }
  }

  async function cambiarMiHandle(nuevo){
    const r = await cloud.cambiarHandle(nuevo);
    if(r.ok){ setPerfil(r.perfil); showToast({ title:"Nombre cambiado", sub:`Ahora eres @${r.perfil.handle}`, icon:User }); }
    return r;
  }

  async function salirCuenta(){
    await cloud.salir();
    setCloudSession(null); setPerfil(null);
    setAmigos([]); setQuedadas([]); setNovedades([]); setEntrenando([]); setSuperadoPor([]);
    setSolicitudes([]); setEnviosRutina([]); setCopiaNube(null); copiaMiradaRef.current = false;
    socialCargadoPara.current = null; setAmigoAbierto(null);
    setSinCuenta(false); setTab("home");    // al salir se vuelve a la pantalla de entrar
    showToast({ title:"Sesión cerrada", sub:"Tu progreso sigue en este móvil.", icon:Lock });
  }
  /* Sube lo que se ve en la clasificación y en tu ficha para los amigos: nivel,
     XP, entrenos, racha y el XP por atributo. Nada de peso, medidas ni ciclo.
     Se suben también las MARCAS, porque hasta ahora solo salían al terminar un
     entreno: quien ya llevaba meses jugando aparecía vacío ante sus amigos. */
  function subirPerfil(p){
    if(!cloud.cloudEnabled || !(p || perfil)) return;
    cloud.sincronizarPerfil({
      level: levelFromXp(state.xp), xp: state.xp,
      totalWorkouts: state.totalWorkouts, bestStreak: state.bestStreak || 0,
      displayName: state.profile?.name, appVersion: APP_VERSION_NAME,
      atributos: state.muscleXp || {}, avatar: state.avatar,
    });
    if(Object.keys(state.bests || {}).length) cloud.subirRecords(state.bests, sesionesPorEjercicio(log), Object.keys(RENOMBRES));
  }

  /* Mete una rutina que te han compartido (ya viene validada por decodeRoutine). */
  function importRoutine(routine){
    const r = normalizeCustomRoutine(routine);      // conserva sharedFrom y origen si vienen
    const next = [...customRoutines, r];
    setCustomRoutinesState(next); saveKey("gym:routines", next);
    // Queda apuntado como seguidor: cuando el dueño la edite, esta copia se
    // pone al día sola en vez de quedarse en la versión del día que la cogiste.
    if(cloud.cloudEnabled && perfil && r.origen?.ownerId && r.origen?.clientId){
      cloud.seguirRutina({ ownerId:r.origen.ownerId, clientId:r.origen.clientId, localId:r.id });
    }
    showToast({ title:"Rutina importada", sub:`${r.name} · ${r.days.length} día${r.days.length===1?"":"s"}`, icon:Download });
  }
  /* --- Avisos: solicitudes de amistad y rutinas que te mandan ------------- */

  async function responderSolicitud(id, acepto){
    const r = await cloud.responderSolicitud(id, acepto);
    if(!r.ok){ showToast({ title:"No se ha podido", sub:r.msg, icon:ShieldAlert }); return; }
    setSolicitudes(prev => prev.filter(x => x.id !== id));
    if(r.aceptada){
      refrescarSocial();                       // el amigo nuevo debe aparecer YA
      showToast({ title:"Ya sois amigos", sub:"Os veréis en la clasificación.", icon:Users });
    }
  }

  /* Aceptar una rutina la reconstruye con TU catálogo, igual que pegar un
     código: el payload viaja por nombre de ejercicio, sin músculos ni imágenes. */
  async function responderRutina(envio, acepto){
    if(!acepto){
      const r = await cloud.responderRutina(envio.id, false);
      if(r.ok) setEnviosRutina(prev => prev.filter(x => x.id !== envio.id));
      return;
    }
    const yaTengo = customRoutines.map(r => r.name);
    const decodificada = decodeRoutine(SHARE_PREFIX + b64urlEncode(JSON.stringify(envio.payload)), yaTengo);
    if(!decodificada.ok){
      showToast({ title:"No se ha podido añadir", sub:decodificada.msg, icon:ShieldAlert });
      return;
    }
    importRoutine({ ...decodificada.routine,
      sharedFrom: { handle:envio.handle, displayName:envio.display_name },
      origen: envio.client_id ? { ownerId:envio.de, clientId:envio.client_id } : undefined,
      bonusHecho: false });
    await cloud.responderRutina(envio.id, true);
    setEnviosRutina(prev => prev.filter(x => x.id !== envio.id));
    if(decodificada.desconocidos?.length){
      showToast({ title:"Añadida, con recortes",
        sub:`Tu versión no conoce: ${decodificada.desconocidos.slice(0,3).join(", ")}.`, icon:Info });
    }
  }

  function deleteCustomRoutine(id){
    const next = customRoutines.filter(x=>x.id!==id);
    setCustomRoutinesState(next); saveKey("gym:routines", next);
    // Si era la rutina activa, vuelve a una del catálogo para no dejar Inicio sin rutina.
    if(state.activeRoutine===id){
      const fallback = next[0]?.id || pickInitialRoutine({ goal:state.profile?.goal, experience:state.profile?.experience, sex:state.profile?.sex });
      const ns={ ...state, activeRoutine:fallback }; setState(ns); persist(ns);
    }
    showToast({ title:"Rutina eliminada", sub:"Tu historial de entrenos se conserva.", icon:X });
  }

  /* Abre el configurador: con una rutina existente la edita; sin nada, crea una nueva. */
  function editRoutine(routine){
    setRoutineDraft(routine ? normalizeCustomRoutine(JSON.parse(JSON.stringify(routine))) : blankCustomRoutine());
    setDraftIsNew(!routine);
    setTab("editor");
  }
  function closeEditor(){ setRoutineDraft(null); setTab("rutinas"); }
  function saveRoutineFromEditor(routine){
    const saved = saveCustomRoutine(routine);
    setRoutineDraft(null); setTab("rutinas");
    return saved;
  }

  /* --- Dieta propia (pautada por un profesional) --- */
  function saveCustomDiet(next){
    const cd = normalizeCustomDiet({ ...next, updatedAt: todayISO() });
    setCustomDietState(cd); saveKey("gym:customdiet", cd);
    return cd;
  }

  // Al cambiar de pestaña/vista, vuelve arriba (evita quedar scrolleado en la vista nueva).
  useEffect(()=>{ try{ window.scrollTo({ top:0, behavior:"auto" }); }catch{ window.scrollTo(0,0); } document.documentElement.scrollTop=0; document.body.scrollTop=0; }, [tab]);

  if(loading) return (
    <div className={FH} data-theme={theme} style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh" }}>
      <StyleTag/>
      <div style={{ textAlign:"center", color:"var(--muted)" }}><Sprite id={SPR.espada} size={48} className="fh-idle"/><div className="disp" style={{ marginTop:10 }}>Cargando tu progreso…</div></div>
    </div>
  );

  /* Si la nube está configurada y no hay sesión recordada, lo primero es entrar.
     Con sesión guardada se va directo a Inicio, sin pedir nada. "Seguir sin
     cuenta" deja usar la app entera en local, como siempre. */
  if(cloud.cloudEnabled && sesionResuelta && !cloudSession && !sinCuenta && !needsOnboarding) return (
    <div className={FH} id="rpgym-root" data-theme={theme}>
      <StyleTag/>
      <Toast toast={toast}/>
      <div className="fh-shell">
        <AccountView {...{ state, level, setTab, session:cloudSession, perfil,
          onEntrar:entrarCuenta, onRegistrar:registrarCuenta, onVerificar:verificarCuenta,
          onSalir:salirCuenta, onCambiarHandle:cambiarMiHandle, onRestaurarTexto:importBackup,
          arranque:true, onSinCuenta:()=>setSinCuenta(true) }}/>
      </div>
    </div>
  );

  if(needsOnboarding) return (
    <div className={FH} data-theme={theme}>
      <StyleTag/>
      <OnboardingWizard onDone={completeOnboarding} initial={state.profile} importBackup={importBackup}/>
    </div>
  );

  /* Sale al crear el perfil y, a quien ya lo tenía, al abrir la versión que trae el
     avatar. Con un entreno a medias se espera: lo primero es volver a él. */
  if(!ALT && !state.avatar && !session) return (
    <div className={FH} id="rpgym-root" data-theme={theme}>
      <StyleTag/>
      <div className="fh-shell" style={{ paddingBottom:"calc(24px + var(--sb))" }}>
        <HeroeView arranque avatar={avatar} puntos={puntos} onCambiar={guardarAvatar} onAhoraNo={()=>guardarAvatar(avatar)}/>
      </div>
    </div>
  );

  return (
    <div className={FH} id="rpgym-root" data-theme={theme}>
      <StyleTag/>
      <Toast toast={toast}/>
      {efectos[0] && <EfectoPantalla key={efectos[0].id} efecto={efectos[0]} avatar={avatar} onVerEquipo={()=>setTab("heroe")} onFin={()=>setEfectos(q=>q.slice(1))}/>}
      <div className="fh-shell">
        {tab==="home" && <HomeView {...{ state, avatar, mazmorra, level, rank, log, useRest, terminarVacaciones, setTab, setActiveRoutine, customRoutines,
          cloudEnabled:cloud.cloudEnabled, perfil, updateInfo, onCloseUpdate:()=>setUpdateInfo(null), novedades, onCerrarNovedades:()=>setNovedades([]), entrenando, onUnirme:unirmeAlEntreno, superadoPor,
          copiaNube, onRestaurarNube:restaurarDeNube, onDescartarCopia:()=>{ saveGlobal("gym:copiaDescartada", copiaNube?.updated_at); setCopiaNube(null); },
          pendientes:solicitudes.length + enviosRutina.length, resumen, onCerrarResumen:cerrarResumen, onAbrirResumenes:()=>abrirResumenes("home") }}/>}
        {tab==="rutinas" && <RoutinesView {...{ state, level, setActiveRoutine, startWorkout, customRoutines, editRoutine, deleteCustomRoutine, importRoutine, perfil, publicadas, onPublicar:publicarRutina, setTab }}/>}
        {tab==="ficha" && <CharacterView {...{ state, avatar, puntos, level, rank, log, customRoutines, setTab,
          onAbrirInforme:lunes=>abrirInforme(lunes, "ficha"),
          onAbrirResumenes:cloud.cloudEnabled && perfil ? ()=>abrirResumenes("ficha") : null }}/>}
        {tab==="mazmorra" && <MazmorraView {...juego} mz={mazmorra} onVolver={()=>setTab("home")}/>}
        {tab==="heroe" && <HeroeView avatar={avatar} puntos={puntos} onCambiar={guardarAvatar} onVolver={()=>setTab("ficha")}/>}
        {tab==="avisos" && <AvisosView {...{ solicitudes, envios:enviosRutina,
          onResponderSolicitud:responderSolicitud, onResponderRutina:responderRutina,
          onVolver:()=>setTab("home") }}/>}
        {tab==="amigo" && amigoAbierto && <AmigoView {...{ amigo:amigoAbierto, misBests:state.bests,
          customRoutines, onVolver:cerrarAmigo, onToast:showToast }}/>}
        {tab==="workout" && <WorkoutView {...{ session, setSession, finishWorkout, setTab, log, weekStart:state.weekStart, bests:state.cardioBests, sesionConjunta,
          peso:state.profile?.weightKg, sexo:state.profile?.sex, misBests:state.bests, nextWeight:state.nextWeight, juego, onImpulso:sumarImpulso, avatar:state.avatar,
          onSalir:()=>{ if(sesionConjunta){ cloud.dejarSesion({ sessionId:sesionConjunta.id, laAbriYo:sesionConjunta.laAbriYo }); setSesionConjunta(null); } },
          onAbandonar:()=>lanzarEfecto({ tipo:"gameOver", titulo:"Entreno abandonado", nota:"Las series de hoy no cuentan. Tu racha y tu nivel siguen como estaban." }) }}/>}
        {tab==="results" && <ResultsView {...{ results:results && { ...results, adelantados }, setTab, level, rank, customRoutines, onGuardarCambios:guardarCambiosRutina }}/>}
        {tab==="progreso" && <ProgressView {...{ state, log, measures, addMeasurement, customRoutines, setTab, quedadas,
          onAbrirInforme:()=>abrirInforme(mondayOf(todayISO()), "progreso"),
          onAbrirResumenes:cloud.cloudEnabled && perfil ? ()=>abrirResumenes("progreso") : null }}/>}
        {tab==="resumenes" && <ResumenesView onVolver={()=>setTab(resumenesVuelve)}/>}
        {tab==="informe" && <InformeSemanalView {...{ state, log, measures, lunes:informeLunes, setLunes:setInformeLunes,
          cloudEnabled:cloud.cloudEnabled, perfil, onVolver:()=>setTab(informeVuelve) }}/>}
        {tab==="amigos" && <AmigosView {...{ perfil, cloudEnabled:cloud.cloudEnabled, setTab, seccion:amigosSeccion, setSeccion:setAmigosSeccion,
          solicitudes, onResponderSolicitud:responderSolicitud, entrenando, onUnirme:unirmeAlEntreno, amigos, onRefrescarAmigos:refrescarAmigos, onQuitarAmigo:quitarAmigo, onAbrirAmigo:abrirAmigo,
          quedadas, onRefrescarQuedadas:refrescarQuedadas, cargandoQuedadas,
          onCargarTabla:(pe,a)=>cloud.leaderboard(pe, a), mz:mazmorra, yo }}/>}
        {tab==="logros" && <AchievementsView {...{ state, level, mz:mazmorra }}/>}
        {tab==="dieta" && <DietView {...{ state, mealPlan, saveMealPlan, excludes, setExcludes, setTab, customDiet, saveCustomDiet }}/>}
        {tab==="editor" && <RoutineBuilderView {...{ draft:routineDraft, setDraft:setRoutineDraft, onSave:saveRoutineFromEditor, onCancel:closeEditor, isNew:draftIsNew }}/>}
        {tab==="ajustes" && <SettingsView {...{ state, log, updateProfile, setReminders, setSub, setCycle, setTab, theme, setTheme, sonido, setSonido, resetProgress, exportBackup, importBackup,
          setVacaciones, terminarVacaciones,
          cloudEnabled:cloud.cloudEnabled, perfil, session:cloudSession,
          onEntrar:entrarCuenta, onRegistrar:registrarCuenta, onVerificar:verificarCuenta,
          onSalir:salirCuenta, onCambiarHandle:cambiarMiHandle, level, canal, setCanal, setResumenIA }}/>}
      </div>

      {tab!=="workout" && tab!=="results" && tab!=="editor" && tab!=="heroe" && tab!=="mazmorra" && (
        <nav className="fh-nav"><div className="fh-nav-inner">
          {(ALT ? NAV_ALT.map(t=>t.id==="amigos" ? { ...t, aviso:solicitudes.length } : t)
            : [{id:"home",spr:SPR.puerta,label:"Inicio"},{id:"rutinas",spr:SPR.espada,label:"Rutinas"},{id:"progreso",cara:true,label:"RPGym"},{id:"logros",spr:SPR.cofre,label:"Logros"},{id:"amigos",gente:true,label:"Amigos",aviso:solicitudes.length}]).map(t=>{
            // La ficha de un amigo y la dieta cuelgan de una pestaña: que se siga viendo cuál.
            const on = (tab==="amigo" ? "amigos" : tab==="dieta" ? "home" : tab) === t.id;
            return (
              <button key={t.id} className={on?"on":""} onClick={()=>setTab(t.id)} aria-current={on?"page":undefined}
                aria-label={t.aviso ? `${t.label}: ${t.aviso} sin responder` : undefined}>
                <span style={{ position:"relative", display:"flex" }}>
                  {t.icon ? <t.icon size={22}/>
                    : t.cara ? <AvatarCara av={avatar} size={32}/>
                    : t.gente ? <><Sprite id={SPR.amigo} size={32}/><Sprite id={SPR.amiga} size={32} style={{ marginLeft:-14 }}/></>
                    : <Sprite id={t.spr} size={32}/>}
                  <Contador n={t.aviso}/>
                </span>
                <span>{t.label}</span>
              </button>
            );
          })}
        </div></nav>
      )}
    </div>
  );
}

/* =========================================================================
   ONBOARDING (primera vez / al borrar progreso)
   ========================================================================= */

function OnboardingWizard({ onDone, initial, importBackup }){
  const [step, setStep] = useState(0);
  const [restoreOpen, setRestoreOpen] = useState(false);
  const [restoreText, setRestoreText] = useState("");
  const [restoreMsg, setRestoreMsg] = useState(null);
  async function doRestore(){
    const r = await importBackup(restoreText);
    setRestoreMsg(r);   // si sale bien, la app sale sola del onboarding
  }
  const [f, setF] = useState({
    name: initial?.name && initial.name!=="Atleta" ? initial.name : "",
    age: initial?.age || "",
    sex: initial?.sex || "no_especificado",
    heightCm: initial?.heightCm || "",
    weightKg: initial?.weightKg || "",
    days: (initial?.days && initial.days.length) ? initial.days : [1,3,5],
    experience: initial?.experience || "principiante",
    goal: initial?.goal || "iniciarse",
    cycleEnabled: false,
    cycleStart: "",
  });
  const set=(k,v)=>setF(p=>({ ...p, [k]:v }));
  const toggleDay=d=>setF(p=>{ const s=new Set(p.days); s.has(d)?s.delete(d):s.add(d); return { ...p, days:[...s].sort((a,b)=>a-b) }; });
  const isFemale = f.sex==="mujer";
  const TOTAL = isFemale ? 7 : 6;   // paso extra de ciclo solo para perfil femenino
  const valid=[
    f.name.trim().length>=1,
    Number(f.age)>0 && Number(f.age)<100,
    Number(f.heightCm)>0 && Number(f.weightKg)>0,
    f.days.length>=1,
    !!f.experience,
    !!f.goal,
    !f.cycleEnabled || !!f.cycleStart,   // paso 6 (ciclo): si opta, necesita fecha
  ];
  const canNext=valid[step];
  function finish(){
    const cycle = (isFemale && f.cycleEnabled)
      ? { enabled:true, lastPeriodStart: f.cycleStart || todayISO(), cycleLength:28, periodLength:5 }
      : null;
    onDone({ name:f.name.trim()||"Atleta", age:Number(f.age)||null, sex:f.sex,
      heightCm:Number(f.heightCm)||170, weightKg:Number(f.weightKg)||70,
      days:f.days.length?f.days:[1,3,5], experience:f.experience, goal:f.goal, cycle });
  }
  const label={ padding:"0 2px 6px", fontSize:12, color:"var(--muted)", fontWeight:600 };
  const genders=[["Hombre","hombre"],["Mujer","mujer"],["Prefiero no indicarlo","no_especificado"]];
  const DAY_LABELS=[["L",1],["M",2],["X",3],["J",4],["V",5],["S",6],["D",0]];

  const SelectCard=({ active, onClick, icon:I, title, desc, color })=>(
    <button onClick={onClick} className="fh-btn" style={{ width:"100%", textAlign:"left", background: active?"rgba(232,176,75,.12)":"var(--card2)", color:"var(--txt)", border:`1px solid ${active?"var(--gold)":"var(--line2)"}`, padding:"14px", marginBottom:10, display:"flex", alignItems:"center", gap:12 }}>
      {I && <div style={{ width:38, height:38, borderRadius:11, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", background:"var(--bg2)", border:`1px solid ${active?"var(--gold)":(color||"var(--line)")}` }}><I size={18} color={active?"var(--gold)":(color||"var(--muted)")}/></div>}
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:14, fontWeight:700 }}>{title}</div>
        <div style={{ fontSize:11.5, color:"var(--muted)", marginTop:2, lineHeight:1.4 }}>{desc}</div>
      </div>
      {active && <Check size={17} color="var(--gold)" style={{ flexShrink:0 }}/>}
    </button>
  );

  return (
    <div className="fh-in" style={{ maxWidth:480, margin:"0 auto", minHeight:"100vh", display:"flex", flexDirection:"column", padding:"0 18px calc(20px + env(safe-area-inset-bottom))" }}>
      <div style={{ paddingTop:"calc(24px + env(safe-area-inset-top))" }}>
        <div style={{ display:"flex", gap:5, marginBottom:20 }}>
          {Array.from({ length:TOTAL }).map((_,i)=>(
            <div key={i} style={{ flex:1, height:4, borderRadius:99, background:i<=step?"var(--gold)":"var(--line)", transition:"background .2s" }}/>
          ))}
        </div>
      </div>

      <div style={{ flex:1 }}>
        {step===0 && (<div className="fh-in">
          <div style={{ display:"inline-flex", padding:12, borderRadius:16, background:"var(--gold)", marginBottom:14 }}><Dumbbell size={26} color="#0F131A"/></div>
          <h1 style={{ margin:"0 0 6px", fontSize:24 }}>Bienvenido a RPGym</h1>
          <p style={{ margin:"0 0 22px", fontSize:13.5, color:"var(--muted)", lineHeight:1.5 }}>Vamos a personalizar la app para ti. ¿Cómo quieres que te llamemos?</p>
          <div style={label}>Nombre</div>
          <input value={f.name} onChange={e=>set("name",e.target.value)} placeholder="Tu nombre" style={{ textAlign:"left" }} autoFocus/>

          {/* Vuelves de una reinstalación (o de otro móvil) con tu copia guardada */}
          <div style={{ marginTop:26, borderTop:"1px solid var(--line)", paddingTop:16 }}>
            {!restoreOpen ? (
              <button onClick={()=>{ setRestoreOpen(true); setRestoreMsg(null); }} className="fh-btn"
                style={{ width:"100%", background:"var(--card2)", color:"var(--txt)", border:"1px solid var(--line2)", padding:12, display:"flex", alignItems:"center", justifyContent:"center", gap:8, fontSize:13 }}>
                <Upload size={15} color="var(--jade)"/> Ya tengo una copia de seguridad
              </button>
            ) : (
              <div className="fh-in">
                <div style={label}>Pega aquí tu copia</div>
                <textarea value={restoreText} onChange={e=>setRestoreText(e.target.value)} rows={4} placeholder='{"app":"rpgym",…}'
                  style={{ width:"100%", resize:"vertical", background:"var(--bg2)", border:"1px solid var(--line)", color:"var(--txt)", borderRadius:10, padding:"10px 12px", fontSize:11, fontFamily:"ui-monospace,monospace", lineHeight:1.4 }}/>
                <div style={{ display:"flex", gap:8, marginTop:9 }}>
                  <button className="fh-btn" onClick={doRestore} disabled={!restoreText.trim()}
                    style={{ flex:1, background:restoreText.trim()?"var(--jade)":"var(--card2)", color:restoreText.trim()?"#0F131A":"var(--faint)", padding:11, fontSize:13 }}>Recuperar mi progreso</button>
                  <button className="fh-btn" onClick={()=>{ setRestoreOpen(false); setRestoreText(""); setRestoreMsg(null); }}
                    style={{ background:"var(--card2)", color:"var(--muted)", border:"1px solid var(--line2)", padding:"11px 16px", fontSize:13 }}>Cancelar</button>
                </div>
                {restoreMsg && <div style={{ marginTop:10, fontSize:12.5, color:restoreMsg.ok?"var(--jade)":"var(--crimson)", lineHeight:1.45 }}>{restoreMsg.msg}</div>}
              </div>
            )}
          </div>
        </div>)}

        {step===1 && (<div className="fh-in">
          <h1 style={{ margin:"0 0 6px", fontSize:23 }}>Un poco sobre ti</h1>
          <p style={{ margin:"0 0 22px", fontSize:13.5, color:"var(--muted)", lineHeight:1.5 }}>Nos ayuda a ajustar pesos y recomendaciones.</p>
          <div style={label}>Edad</div>
          <input inputMode="numeric" value={f.age} onChange={e=>set("age",e.target.value.replace(/\D/g,""))} placeholder="Ej. 28"/>
          <div style={{ ...label, marginTop:16 }}>Género</div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {genders.map(([lab,val])=>(
              <button key={val} onClick={()=>set("sex",val)} className="fh-btn" style={{ background:f.sex===val?"rgba(232,176,75,.12)":"var(--card2)", color:"var(--txt)", border:`1px solid ${f.sex===val?"var(--gold)":"var(--line2)"}`, padding:"12px 14px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:14 }}>{lab}</span>{f.sex===val && <Check size={16} color="var(--gold)"/>}
              </button>
            ))}
          </div>
        </div>)}

        {step===2 && (<div className="fh-in">
          <h1 style={{ margin:"0 0 6px", fontSize:23 }}>Tus medidas</h1>
          <p style={{ margin:"0 0 22px", fontSize:13.5, color:"var(--muted)", lineHeight:1.5 }}>Podrás actualizarlas cuando quieras en Ajustes y Progreso.</p>
          <div style={{ display:"flex", gap:12 }}>
            <div style={{ flex:1 }}><div style={label}>Altura (cm)</div><input inputMode="numeric" value={f.heightCm} onChange={e=>set("heightCm",e.target.value.replace(/\D/g,""))} placeholder="Ej. 175"/></div>
            <div style={{ flex:1 }}><div style={label}>Peso (kg)</div><input inputMode="decimal" value={f.weightKg} onChange={e=>set("weightKg",e.target.value.replace(/[^\d.]/g,""))} placeholder="Ej. 72"/></div>
          </div>
        </div>)}

        {step===3 && (<div className="fh-in">
          <h1 style={{ margin:"0 0 6px", fontSize:23 }}>¿Qué días entrenarás?</h1>
          <p style={{ margin:"0 0 20px", fontSize:13.5, color:"var(--muted)", lineHeight:1.5 }}>Marca tus días de entreno. Los demás serán descanso y <b style={{ color:"var(--txt)" }}>no romperán tu racha</b>. Podrás cambiarlos en Ajustes.</p>
          <div style={{ display:"flex", gap:8, justifyContent:"space-between" }}>
            {DAY_LABELS.map(([lbl,d])=>{ const on=f.days.includes(d); return (
              <button key={d} onClick={()=>toggleDay(d)} className="fh-btn" style={{ flex:1, aspectRatio:"1", background:on?"var(--gold)":"var(--card2)", color:on?"#0F131A":"var(--muted)", border:`1px solid ${on?"var(--gold)":"var(--line2)"}`, padding:0, fontWeight:700, fontSize:15 }}>{lbl}</button>
            ); })}
          </div>
          <div style={{ fontSize:11.5, color:"var(--faint)", marginTop:12, textAlign:"center" }}>{f.days.length} día{f.days.length===1?"":"s"} por semana</div>
        </div>)}

        {step===4 && (<div className="fh-in">
          <h1 style={{ margin:"0 0 6px", fontSize:23 }}>Tu experiencia</h1>
          <p style={{ margin:"0 0 20px", fontSize:13.5, color:"var(--muted)", lineHeight:1.5 }}>Ajustamos qué rutinas y ejercicios te mostramos. Podrás cambiarlo después.</p>
          {EXPERIENCE_LEVELS.map(e=>(
            <SelectCard key={e.id} active={f.experience===e.id} onClick={()=>set("experience",e.id)} title={e.label} desc={e.desc}/>
          ))}
        </div>)}

        {step===5 && (<div className="fh-in">
          <h1 style={{ margin:"0 0 6px", fontSize:23 }}>¿Qué buscas?</h1>
          <p style={{ margin:"0 0 20px", fontSize:13.5, color:"var(--muted)", lineHeight:1.5 }}>Elegimos tu rutina inicial según tu objetivo.</p>
          {GOALS.map(g=>(
            <SelectCard key={g.id} active={f.goal===g.id} onClick={()=>set("goal",g.id)} icon={g.icon} title={g.label} desc={g.desc} color="var(--gold)"/>
          ))}
        </div>)}

        {step===6 && isFemale && (<div className="fh-in">
          <div style={{ display:"inline-flex", padding:11, borderRadius:14, background:"rgba(229,107,159,.14)", marginBottom:12 }}><Heart size={22} color="#E56B9F"/></div>
          <h1 style={{ margin:"0 0 6px", fontSize:23 }}>Adaptación al ciclo</h1>
          <p style={{ margin:"0 0 18px", fontSize:13.5, color:"var(--muted)", lineHeight:1.5 }}>¿Quieres que adaptemos la intensidad del entreno y los consejos de dieta a tu <b style={{ color:"var(--txt)" }}>fase del ciclo menstrual</b>? Es opcional, y tus datos se guardan <b style={{ color:"var(--txt)" }}>solo en tu dispositivo</b>. No es consejo médico.</p>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            <button onClick={()=>set("cycleEnabled",true)} className="fh-btn" style={{ width:"100%", textAlign:"left", background:f.cycleEnabled?"rgba(229,107,159,.14)":"var(--card2)", color:"var(--txt)", border:`1px solid ${f.cycleEnabled?"#E56B9F":"var(--line2)"}`, padding:"14px", display:"flex", alignItems:"center", gap:12 }}>
              <Check size={18} color={f.cycleEnabled?"#E56B9F":"var(--faint)"} style={{ flexShrink:0 }}/>
              <div style={{ flex:1 }}><div style={{ fontSize:14, fontWeight:700 }}>Sí, adaptar a mi ciclo</div><div style={{ fontSize:11.5, color:"var(--muted)", marginTop:2, lineHeight:1.4 }}>Ajustaremos energía y dieta según tu fase.</div></div>
            </button>
            <button onClick={()=>{ set("cycleEnabled",false); }} className="fh-btn" style={{ width:"100%", textAlign:"left", background:!f.cycleEnabled?"rgba(232,176,75,.10)":"var(--card2)", color:"var(--txt)", border:`1px solid ${!f.cycleEnabled?"var(--gold)":"var(--line2)"}`, padding:"14px", display:"flex", alignItems:"center", gap:12 }}>
              <X size={18} color={!f.cycleEnabled?"var(--gold)":"var(--faint)"} style={{ flexShrink:0 }}/>
              <div style={{ flex:1 }}><div style={{ fontSize:14, fontWeight:700 }}>Ahora no</div><div style={{ fontSize:11.5, color:"var(--muted)", marginTop:2, lineHeight:1.4 }}>Podrás activarlo cuando quieras en Ajustes.</div></div>
            </button>
          </div>
          {f.cycleEnabled && (
            <div style={{ marginTop:16 }}>
              <div style={label}>¿Cuándo te bajó por última vez?</div>
              <input type="date" value={f.cycleStart} max={todayISO()} onChange={e=>set("cycleStart",e.target.value)} style={{ textAlign:"left" }}/>
              <div style={{ fontSize:11, color:"var(--faint)", marginTop:7, lineHeight:1.4 }}>Con esto calculamos tu fase actual. Podrás ajustarla cuando te baje.</div>
            </div>
          )}
        </div>)}
      </div>

      <div style={{ display:"flex", gap:10, paddingTop:14 }}>
        {step>0 && <button className="fh-btn" onClick={()=>setStep(s=>s-1)} style={{ background:"var(--card2)", color:"var(--muted)", border:"1px solid var(--line2)", padding:"13px 18px" }}>Atrás</button>}
        {step<TOTAL-1
          ? <button className="fh-btn" onClick={()=>canNext&&setStep(s=>s+1)} disabled={!canNext} style={{ flex:1, background:canNext?"var(--gold)":"var(--card2)", color:canNext?"#0F131A":"var(--faint)", padding:13, display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>Siguiente <ChevronRight size={16}/></button>
          : <button className="fh-btn" onClick={finish} disabled={!canNext} style={{ flex:1, background:canNext?"var(--gold)":"var(--card2)", color:canNext?"#0F131A":"var(--faint)", padding:13, display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}><Flame size={16}/> Empezar</button>}
      </div>
    </div>
  );
}

/* =========================================================================
   AJUSTES
   ========================================================================= */

/* =========================================================================
   CUENTA Y LEADERBOARD (fase 1 de la parte social)
   Todo esto es OPCIONAL: sin credenciales de Supabase ni siquiera se muestra,
   y sin red la app entera sigue funcionando igual. Ver ROADMAP-SOCIAL.md.
   ========================================================================= */

/* Copia de seguridad en la nube, cifrada en el móvil.
   Resuelve "cambio de móvil sin perder nada" sin que el detalle de los entrenos
   salga del dispositivo: el servidor solo guarda bytes que no puede leer. */
function CopiaNubePanel({ exportBackup, importBackup, progreso }){
  const [copia, setCopia] = useState(null);
  const [comparada, setComparada] = useState(null);   // movil | copia | igual | otroPerfil
  const [estado, setEstado] = useState("mirando");   // mirando | listo | trabajando
  const [msg, setMsg] = useState(null);
  const [confirmar, setConfirmar] = useState(false);

  async function mirar(){
    const r = await cloud.bajarCopia();
    setEstado("listo");
    if (!r.ok) return;
    setCopia(r.copia); setComparada(null);
    const nube = r.copia ? await resumenCopiaNube(r.copia) : null;
    if (nube) setComparada(nube.prefijo !== STORE_PREFIX ? "otroPerfil" : compararProgreso(progreso, nube));
  }
  useEffect(()=>{ mirar(); }, []);

  async function subir(){
    setEstado("trabajando"); setMsg(null);
    const clave = await cripto.recuperarClave();
    if (!clave) { setEstado("listo"); setMsg({ ok:false, t:"Vuelve a entrar con tu contraseña para poder cifrar la copia." }); return; }
    try {
      const texto = await exportBackup();
      const { cifrado, iv } = await cripto.cifrar(texto, clave);
      const r = await cloud.subirCopia({ cifrado, iv, dispositivo: navigator.userAgent.includes("Android") ? "Android" : "Navegador" });
      setEstado("listo");
      if (!r.ok) { setMsg({ ok:false, t:r.msg }); return; }
      setMsg({ ok:true, t:"Copia subida y cifrada. Solo se puede abrir con tu contraseña." });
      mirar();
    } catch (e) {
      setEstado("listo"); setMsg({ ok:false, t:"No se ha podido cifrar la copia en este dispositivo." });
    }
  }

  async function restaurar(){
    setConfirmar(false); setEstado("trabajando"); setMsg(null);
    const clave = await cripto.recuperarClave();
    if (!clave) { setEstado("listo"); setMsg({ ok:false, t:"Vuelve a entrar con tu contraseña para poder descifrar la copia." }); return; }
    try {
      const texto = await cripto.descifrar(copia.cifrado, copia.iv, clave);
      const r = await importBackup(texto);
      setEstado("listo");
      setMsg({ ok:r.ok, t:r.ok ? "Progreso restaurado desde la nube." : r.msg });
    } catch {
      setEstado("listo");
      setMsg({ ok:false, t:"No se ha podido descifrar. ¿Has cambiado la contraseña desde que subiste la copia? Si es así, sube una nueva." });
    }
  }

  const sectionTitle = { fontSize:12, fontWeight:700, letterSpacing:".08em", color:"var(--faint)", margin:"18px 4px 8px" };
  const cuando = copia?.updated_at ? new Date(copia.updated_at) : null;

  return (<>
    <div style={sectionTitle}>COPIA EN LA NUBE</div>
    <div className="fh-card" style={{ padding:16 }}>
      <div style={{ display:"flex", gap:10, alignItems:"flex-start", marginBottom:12 }}>
        <Lock size={16} color="var(--jade)" style={{ flexShrink:0, marginTop:1 }}/>
        <div style={{ fontSize:12, color:"var(--muted)", lineHeight:1.5 }}>
          Se cifra <b style={{ color:"var(--txt)" }}>en tu móvil</b> antes de subirla. El servidor guarda algo que no puede leer:
          ni tus entrenos, ni tu peso, ni tu dieta. Solo se abre con tu contraseña.
        </div>
      </div>

      {estado === "mirando" && <Empty text="Mirando si tienes copia…"/>}

      {estado !== "mirando" && (
        <div style={{ padding:"11px 13px", background:"var(--bg2)", border:"1px solid var(--line)", borderRadius:11, marginBottom:12 }}>
          {copia ? (<>
            <div style={{ fontSize:12.5, color:"var(--txt)" }}>
              Última copia: <b>{cuando.toLocaleDateString("es-ES")}</b> a las {cuando.toLocaleTimeString("es-ES", { hour:"2-digit", minute:"2-digit" })}
            </div>
            <div style={{ fontSize:11, color:"var(--faint)", marginTop:3 }}>
              desde {copia.dispositivo || "otro dispositivo"} · {(copia.bytes/1024).toFixed(0)} KB cifrados
            </div>
            {comparada && (
              <div style={{ fontSize:11.5, marginTop:6, color:comparada==="copia"?"var(--gold)":"var(--muted)" }}>
                {{ movil:"Este móvil va por delante: actualiza la copia para no perderlo.",
                   copia:"La copia va por delante de este móvil.",
                   igual:"Copia y móvil están al día.",
                   otroPerfil:"Esta copia es de otro perfil." }[comparada]}
              </div>
            )}
          </>) : (
            <div style={{ fontSize:12.5, color:"var(--muted)" }}>Todavía no has subido ninguna copia.</div>
          )}
        </div>
      )}

      <div style={{ display:"flex", gap:8 }}>
        <button className="fh-btn" onClick={subir} disabled={estado === "trabajando"}
          style={{ flex:1, background:"var(--jade)", padding:12, fontSize:12.5, opacity:estado==="trabajando"?.6:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
          <Upload size={14}/> {estado === "trabajando" ? "Un momento…" : copia ? "Actualizar copia" : "Subir copia"}
        </button>
        {copia && (
          <button className="fh-btn" onClick={()=>setConfirmar(v=>!v)} disabled={estado === "trabajando"}
            style={{ flex:1, background:"var(--card2)", color:"var(--txt)", border:"1px solid var(--line2)", padding:12, fontSize:12.5, display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
            <Download size={14} color="var(--gold)"/> Restaurar
          </button>
        )}
      </div>

      {confirmar && (
        <div className="fh-card" style={{ background:"var(--bg2)", padding:13, marginTop:11 }}>
          <div style={{ fontSize:12.5, color:"var(--muted)", lineHeight:1.45, marginBottom:10 }}>
            Restaurar <b style={{ color:"var(--txt)" }}>sustituye</b> lo que tengas ahora en este móvil por lo de la copia. Lo que hayas hecho desde entonces se perderá.
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button className="fh-btn" onClick={()=>setConfirmar(false)} style={{ flex:1, background:"var(--card2)", color:"var(--muted)", border:"1px solid var(--line2)", padding:9, fontSize:12 }}>Cancelar</button>
            <button className="fh-btn" onClick={restaurar} style={{ flex:1, background:"var(--gold)", padding:9, fontSize:12 }}>Sí, restaurar</button>
          </div>
        </div>
      )}

      {msg && (
        <div style={{ display:"flex", gap:9, alignItems:"flex-start", marginTop:12, padding:"10px 12px", background:"var(--bg2)", border:`1px solid ${msg.ok?"var(--jade)":"var(--crimson)"}`, borderRadius:11 }}>
          {msg.ok ? <Check size={15} color="var(--jade)" style={{ flexShrink:0, marginTop:1 }}/>
                  : <ShieldAlert size={15} color="var(--crimson)" style={{ flexShrink:0, marginTop:1 }}/>}
          <div style={{ fontSize:12, color:"var(--txt)", lineHeight:1.45 }}>{msg.t}</div>
        </div>
      )}

      <div style={{ fontSize:11, color:"var(--faint)", marginTop:11, lineHeight:1.45 }}>
        Si cambias la contraseña de la cuenta, la copia antigua deja de poder abrirse: sube una nueva después.
      </div>
    </div>
  </>);
}

/* Clasificación: tres periodos y dos alcances (tu círculo o todos).
   Vive en Inicio, que es donde se mira de verdad. */
function ClasificacionCard({ perfil, cargar, señal }){
  const [periodo, setPeriodo] = useState("semanal");
  const [soloAmigos, setSoloAmigos] = useState(true);
  const [tabla, setTabla] = useState(null);
  const [cargandoTabla, setCargandoTabla] = useState(false);
  const yo = perfil?.handle;

  async function ver(p = periodo, a = soloAmigos){
    setCargandoTabla(true);
    const r = await cargar(p, a);
    setCargandoTabla(false);
    setTabla(r.ok ? r.filas : []);
  }
  // `señal` cambia al ganar o perder un amigo: la tabla debe rehacerse.
  useEffect(()=>{ ver(periodo, soloAmigos); /* eslint-disable-next-line */ }, [periodo, soloAmigos, perfil?.handle, señal]);

  const sectionTitle = { fontSize:12, fontWeight:700, letterSpacing:".08em", color:"var(--faint)", margin:"18px 4px 8px" };

  return (<>
      <div style={sectionTitle}>CLASIFICACIÓN</div>
      <div style={{ display:"flex", gap:6, marginBottom:8 }}>
        {[[true,"Mi círculo"],[false,"Todos"]].map(([v,lab])=>(
          <button key={lab} className="fh-btn" onClick={()=>setSoloAmigos(v)}
            style={{ flex:1, padding:"8px", fontSize:12, background:soloAmigos===v?"var(--card2)":"var(--card)", color:soloAmigos===v?"var(--gold)":"var(--faint)", border:`1px solid ${soloAmigos===v?"var(--gold)":"var(--line)"}` }}>{lab}</button>
        ))}
      </div>
      <div style={{ display:"flex", gap:6, marginBottom:10 }}>
        {cloud.PERIODOS.map(p=>(
          <button key={p.id} className="fh-btn" onClick={()=>setPeriodo(p.id)}
            style={{ flex:1, padding:"9px", fontSize:12.5, background:periodo===p.id?"var(--gold)":"var(--card)", color:periodo===p.id?"#0F131A":"var(--muted)", border:periodo===p.id?"none":"1px solid var(--line)" }}>{p.label}</button>
        ))}
      </div>
      <div className="fh-card" style={{ padding:16 }}>
        <div style={{ fontSize:11.5, color:"var(--faint)", marginBottom:10, lineHeight:1.45 }}>
          {periodo==="semanal" ? "XP ganado desde el lunes."
            : periodo==="mensual" ? "XP ganado este mes."
            : "XP total desde que empezaste, incluido lo de antes de tener cuenta."}
        </div>
        {cargandoTabla && <Empty text="Cargando clasificación…"/>}
        {!cargandoTabla && tabla && tabla.length <= 1 && (
          <Empty text={soloAmigos ? "Solo estás tú. Invita a alguien con tu código." : "Todavía no hay nadie más registrado."}/>
        )}
        {!cargandoTabla && tabla && tabla.map((p,i)=>{
          const esYo = p.handle === yo;
          const sinActividad = periodo !== "historica" && !p.xp;
          return (
            <div key={p.id} style={{ display:"flex", alignItems:"center", gap:11, padding:"9px 0", borderTop:i?"1px solid var(--line)":"none", opacity:sinActividad?.55:1 }}>
              <span className="cinzel" style={{ width:22, textAlign:"center", fontSize:14, fontWeight:700, color:i===0&&!sinActividad?"var(--gold)":i===1&&!sinActividad?"var(--muted)":i===2&&!sinActividad?"var(--ember)":"var(--faint)" }}>{i+1}</span>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:13.5, fontWeight:esYo?700:500, color:esYo?"var(--gold)":"var(--txt)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                  {p.display_name || p.handle}{esYo && " · tú"}
                </div>
                <div style={{ fontSize:11, color:"var(--faint)", marginTop:1 }}>
                  Nivel {p.level} · {p.entrenos ?? 0} entreno{(p.entrenos ?? 0)===1?"":"s"}{periodo!=="historica" && sinActividad ? " · sin actividad" : ""}
                </div>
              </div>
              <span className="mono" style={{ fontSize:12.5, color:esYo?"var(--gold)":"var(--muted)", flexShrink:0 }}>{p.xp} XP</span>
            </div>
          );
        })}
        <button className="fh-btn" onClick={()=>ver()} disabled={cargandoTabla}
          style={{ width:"100%", marginTop:12, background:"var(--card2)", color:"var(--muted)", border:"1px solid var(--line2)", padding:10, fontSize:12.5, display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
          <Shuffle size={14}/> Actualizar
        </button>
      </div>
  </>);
}

/* El pique: amigos que te han adelantado en algún ejercicio.
   Es lo que de verdad pica y hace volver al gimnasio. */
function MeHanSuperado({ filas, setTab }){
  if (!filas?.length) return null;
  const top = filas.slice(0, 3);
  return (
    <div className="fh-card" style={{ padding:14, marginTop:12, borderColor:"var(--ember)" }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:9 }}>
        <TrendingUp size={16} color="var(--ember)"/>
        <span className="disp" style={{ fontWeight:600, fontSize:14.5 }}>Te han adelantado</span>
      </div>
      {top.map((f,i)=>(
        <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:8, padding:"6px 0", borderTop:i?"1px solid var(--line)":"none" }}>
          <div style={{ minWidth:0 }}>
            <div style={{ fontSize:12.5, color:"var(--txt)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{f.ejercicio}</div>
            <div style={{ fontSize:11, color:"var(--faint)", marginTop:1 }}>{f.display_name || "@"+f.handle}</div>
          </div>
          <div className="mono" style={{ fontSize:12, color:"var(--ember)", flexShrink:0, textAlign:"right" }}>
            {f.suyo} kg<div style={{ fontSize:10, color:"var(--faint)" }}>tú {f.mio}</div>
          </div>
        </div>
      ))}
      {filas.length > 3 && <div style={{ fontSize:11, color:"var(--faint)", marginTop:8 }}>y {filas.length - 3} más</div>}
      <button className="fh-btn" onClick={()=>setTab("rutinas")}
        style={{ width:"100%", marginTop:11, background:"var(--card2)", color:"var(--ember)", border:"1px solid var(--line2)", padding:10, fontSize:12.5 }}>
        A recuperarlo
      </button>
    </div>
  );
}

/* Amigos que están entrenando ahora mismo: la ocasión de unirse.
   Sin tiempo real: se consulta al abrir la app, que para un grupo pequeño basta. */
function EntrenandoAhora({ sesiones, onUnirme, setTab }){
  const ajenas = (sesiones || []).filter(s => !s.estoy);
  if (!ajenas.length) return null;
  const s = ajenas[0];
  const desde = Math.round((Date.now() - new Date(s.started_at)) / 60000);
  return (
    <div className="fh-card fh-pop" style={{ padding:14, marginTop:12, borderColor:"var(--jade)", display:"flex", gap:11, alignItems:"flex-start" }}>
      <div style={{ width:34, height:34, borderRadius:10, flexShrink:0, background:"rgba(63,185,132,.15)", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <Dumbbell size={17} color="var(--jade)"/>
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:12.5, color:"var(--txt)", lineHeight:1.45 }}>
          <b>{s.display_name || "@"+s.handle}</b> está entrenando ahora
          {s.rutina ? <> · {s.rutina}</> : null}
        </div>
        <div style={{ fontSize:11, color:"var(--faint)", marginTop:2 }}>
          empezó hace {desde < 1 ? "nada" : desde + " min"}{s.cuantos > 1 ? ` · ya son ${s.cuantos}` : ""}
        </div>
        <button className="fh-btn" onClick={()=>{ onUnirme(s); setTab("rutinas"); }}
          style={{ marginTop:9, background:"var(--jade)", padding:"9px 14px", fontSize:12.5, display:"inline-flex", alignItems:"center", gap:6 }}>
          <Users size={14}/> Entrenar con {(s.display_name || s.handle).split(" ")[0]}
        </button>
      </div>
    </div>
  );
}

/* Novedades del círculo desde la última vez que abriste la app.
   Se agrupan por persona: "Ana ha entrenado 3 veces" en vez de tres líneas. */
function textoNovedad(n){
  const quien = n.display_name || "@" + n.handle;
  if (n.tipo === "amistad") return { icono: Users,       color: "var(--gold)",  txt: `${quien} está ahora en tu círculo` };
  if (n.tipo === "quedada") return { icono: CalendarDays, color: "var(--sky)",   txt: `${quien} ha propuesto una quedada` };
  if (n.tipo === "record")  return { icono: Crown,        color: "var(--gold)",  txt: `${quien} ha batido ${n.prs === 1 ? "un récord" : n.prs + " récords"}` };
  return { icono: Dumbbell, color: "var(--jade)", txt: `${quien} ha entrenado` };
}

/* Agrupa los entrenos repetidos de la misma persona para no llenar la tarjeta. */
function agruparNovedades(lista){
  const entrenos = {}; const otras = [];
  for (const n of lista) {
    if (n.tipo === "entreno") {
      const k = n.id;
      entrenos[k] = entrenos[k] || { ...n, veces: 0 };
      entrenos[k].veces++;
      if (n.cuando > entrenos[k].cuando) entrenos[k].cuando = n.cuando;
    } else otras.push(n);
  }
  return [...otras, ...Object.values(entrenos)].sort((a,b)=> (a.cuando < b.cuando ? 1 : -1)).slice(0, 8);
}

function NovedadesCard({ novedades, onCerrar, setTab }){
  if (!novedades?.length) return null;
  const lista = agruparNovedades(novedades);
  return (
    <div className="fh-card" style={{ padding:16, marginTop:12, borderColor:"var(--jade)" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8, marginBottom:11 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <Users size={16} color="var(--jade)"/>
          <span className="disp" style={{ fontWeight:600, fontSize:15 }}>Mientras no estabas</span>
        </div>
        <button onClick={onCerrar} aria-label="Cerrar novedades" style={{ background:"none", border:"none", padding:2, cursor:"pointer", color:"var(--faint)" }}><X size={15}/></button>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
        {lista.map((n,i)=>{
          const { icono:I, color, txt } = textoNovedad(n);
          return (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:28, height:28, borderRadius:9, flexShrink:0, background:"var(--bg2)", border:"1px solid var(--line)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <I size={13} color={color}/>
              </div>
              <div style={{ flex:1, minWidth:0, fontSize:12.5, color:"var(--txt)", lineHeight:1.4 }}>
                {txt}{n.tipo === "entreno" && n.veces > 1 ? ` ${n.veces} veces` : ""}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* Fecha y hora de una quedada, en lenguaje normal: "hoy a las 19:00",
   "mañana a las 8:30", "el viernes a las 19:00". */
function cuandoTexto(iso){
  const d = new Date(iso);
  const hoy = new Date(); hoy.setHours(0,0,0,0);
  const dia = new Date(d); dia.setHours(0,0,0,0);
  const dias = Math.round((dia - hoy) / 864e5);
  const hora = d.toLocaleTimeString("es-ES", { hour:"2-digit", minute:"2-digit" });
  if (dias === 0) return `hoy a las ${hora}`;
  if (dias === 1) return `mañana a las ${hora}`;
  if (dias > 1 && dias < 7) return `el ${DAY_NAMES_ES[(d.getDay()+6)%7].toLowerCase()} a las ${hora}`;
  return `${d.getDate()}/${d.getMonth()+1} a las ${hora}`;
}

/* Quedadas: proponer una y contestar a las de tus amigos. */
/* Ver, contestar y proponer quedadas. Vive en la vista de Amigos, junto al
   resto de lo social; los modos "lista" y "crear" siguen existiendo por si
   alguna vez hace falta partirlo otra vez. */
/* Tres modos: "lista" (solo ver y contestar), "crear" (solo proponer) y
   "todo", que es el que usa la vista de Amigos: allí las quedadas se ven y se
   proponen en el mismo sitio, que es como se piensan. */
function QuedadasPanel({ quedadas, onRefrescar, cargando, modo="todo" }){
  const [creando, setCreando] = useState(false);
  const [f, setF] = useState(()=>{
    const d = new Date(); d.setDate(d.getDate()+1); d.setHours(19,0,0,0);
    return { fecha: isoOf(d), hora:"19:00", lugar:"", nota:"" };
  });
  const [msg, setMsg] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const [detalle, setDetalle] = useState(null);
  const [gente, setGente] = useState([]);

  const label = { padding:"0 2px 6px", fontSize:12, color:"var(--muted)", fontWeight:600 };
  const sectionTitle = { fontSize:12, fontWeight:700, letterSpacing:".08em", color:"var(--faint)", margin:"18px 4px 8px" };

  async function proponer(){
    setOcupado(true); setMsg(null);
    const cuando = new Date(`${f.fecha}T${f.hora}:00`).toISOString();
    const r = await cloud.crearQuedada({ cuando, lugar:f.lugar, nota:f.nota });
    if(r.ok) cloud.avisarAmigos("quedada");    // "X ha propuesto quedar" 
    setOcupado(false);
    if (!r.ok) { setMsg({ ok:false, t:r.msg }); return; }
    setCreando(false); setF(p=>({ ...p, lugar:"", nota:"" }));
    setMsg({ ok:true, t:"Quedada propuesta. Tus amigos ya la ven." });
    onRefrescar();
  }
  async function responder(id, resp){
    setOcupado(true);
    await cloud.responderQuedada(id, resp);
    setOcupado(false);
    onRefrescar();
  }
  async function cancelar(id){
    setOcupado(true);
    await cloud.cancelarQuedada(id);
    setOcupado(false);
    setDetalle(null);
    onRefrescar();
  }
  async function verGente(id){
    if (detalle === id) { setDetalle(null); return; }
    setDetalle(id); setGente([]);
    const r = await cloud.asistentes(id);
    if (r.ok) setGente(r.gente);
  }

  const verLista = modo !== "crear";
  const verCrear  = modo !== "lista";
  const soloCrear = !verLista;

  return (<>
    <div style={sectionTitle}>
      {soloCrear ? "PROPONER UNA QUEDADA"
        : `QUEDADAS ${quedadas.length > 0 ? `· ${quedadas.length}` : ""}`}
      {verLista && quedadas.some(q=>q.mi_respuesta==="invitado") && (
        <span style={{ color:"var(--gold)" }}> · TE ESPERAN</span>
      )}
    </div>
    <div className="fh-card" style={{ padding:16 }}>
      {soloCrear && !creando && (
        <p style={{ fontSize:12.5, color:"var(--muted)", margin:"0 0 12px", lineHeight:1.5 }}>
          Di día, hora y sitio. Tus amigos lo ven y contestan: saber que va alguien más es lo que evita que os rajéis.
        </p>
      )}
      {verLista && !quedadas.length && (
        <p style={{ fontSize:12.5, color:"var(--muted)", margin:0, lineHeight:1.5 }}>
          No hay ninguna a la vista. {verCrear ? "Propón una aquí abajo." : "Propón una desde Amigos."}
        </p>
      )}

      {verLista && cargando && !quedadas.length && <Empty text="Buscando quedadas…"/>}

      {verLista && quedadas.map((q,i)=>{
        const voy = q.mi_respuesta === "voy";
        const no  = q.mi_respuesta === "no";
        // 'invitado' = te han llamado a ti por tu nombre y aún no has contestado.
        const invitado = q.mi_respuesta === "invitado";
        return (
          <div key={q.id} style={{ padding:"11px 0", borderTop:i?"1px solid var(--line)":"none" }}>
            {invitado && (
              <div style={{ display:"inline-flex", alignItems:"center", gap:5, marginBottom:7, padding:"3px 9px", borderRadius:999, background:"rgba(232,176,75,.15)", border:"1px solid var(--gold)", color:"var(--gold)", fontSize:10.5, fontWeight:700, letterSpacing:".04em" }}>
                <User size={11}/> TE HA INVITADO
              </div>
            )}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10 }}>
              <div style={{ flex:1, minWidth:0 }}>
                <div className="disp" style={{ fontSize:14.5, fontWeight:700 }}>{cuandoTexto(q.cuando)}</div>
                <div style={{ fontSize:11.5, color:"var(--muted)", marginTop:2 }}>
                  {q.es_mia ? "la propones tú" : `la propone ${q.display_name || "@"+q.handle}`}
                  {q.lugar ? ` · ${q.lugar}` : ""}
                </div>
                {q.nota && <div style={{ fontSize:12, color:"var(--muted)", marginTop:5, lineHeight:1.45 }}>{q.nota}</div>}
              </div>
              <button onClick={()=>verGente(q.id)} className="fh-chip"
                style={{ background:q.van>1?"rgba(63,185,132,.15)":"var(--bg2)", color:q.van>1?"var(--jade)":"var(--faint)", border:"none", cursor:"pointer", flexShrink:0, display:"flex", alignItems:"center", gap:5 }}>
                <Users size={12}/> {q.van}
              </button>
            </div>

            {detalle === q.id && (
              <div className="fh-in" style={{ marginTop:9, padding:"9px 11px", background:"var(--bg2)", borderRadius:10 }}>
                <div style={{ fontSize:11, color:"var(--faint)", marginBottom:5 }}>Van:</div>
                <div style={{ fontSize:12.5, color:"var(--txt)", lineHeight:1.5 }}>
                  {gente.length ? gente.map(g=>g.display_name || "@"+g.handle).join(" · ") : "cargando…"}
                </div>
                {q.es_mia && (
                  <button className="fh-btn" onClick={()=>cancelar(q.id)} disabled={ocupado}
                    style={{ width:"100%", marginTop:10, background:"var(--card2)", color:"var(--crimson)", border:"1px solid var(--line2)", padding:9, fontSize:12 }}>
                    Cancelar la quedada
                  </button>
                )}
              </div>
            )}

            <div style={{ display:"flex", gap:8, marginTop:10 }}>
              <button className="fh-btn" onClick={()=>responder(q.id, "voy")} disabled={ocupado}
                style={{ flex:1.3, background:voy?"var(--jade)":"var(--card2)", color:voy?"#0F131A":"var(--txt)", border:voy?"none":"1px solid var(--line2)", padding:10, fontSize:12.5, display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                {voy && <Check size={14}/>} Yo voy
              </button>
              <button className="fh-btn" onClick={()=>responder(q.id, "no")} disabled={ocupado}
                style={{ flex:1, background:no?"var(--card2)":"var(--card2)", color:no?"var(--ember)":"var(--faint)", border:`1px solid ${no?"var(--ember)":"var(--line2)"}`, padding:10, fontSize:12.5 }}>
                No puedo
              </button>
            </div>
          </div>
        );
      })}

      {verCrear && (!creando ? (
        <button className="fh-btn" onClick={()=>{ setCreando(true); setMsg(null); }}
          style={{ width:"100%", background:"var(--card2)", color:"var(--txt)", border:"1px solid var(--line2)", padding:11, fontSize:12.5, display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}>
          <CalendarDays size={15} color="var(--gold)"/> Proponer una quedada
        </button>
      ) : (
        <div className="fh-in">
          <div style={{ display:"flex", gap:10 }}>
            <div style={{ flex:1.4 }}>
              <div style={label}>Día</div>
              <input type="date" value={f.fecha} min={todayISO()} onChange={e=>setF(p=>({ ...p, fecha:e.target.value }))} style={{ textAlign:"left" }}/>
            </div>
            <div style={{ flex:1 }}>
              <div style={label}>Hora</div>
              <input type="time" value={f.hora} onChange={e=>setF(p=>({ ...p, hora:e.target.value }))} style={{ textAlign:"left" }}/>
            </div>
          </div>
          <div style={{ ...label, marginTop:12 }}>Dónde <span style={{ color:"var(--faint)", fontWeight:400 }}>(opcional)</span></div>
          <input value={f.lugar} maxLength={60} onChange={e=>setF(p=>({ ...p, lugar:e.target.value }))} placeholder="El gimnasio de siempre" style={{ textAlign:"left" }}/>
          <div style={{ ...label, marginTop:12 }}>Nota <span style={{ color:"var(--faint)", fontWeight:400 }}>(opcional)</span></div>
          <input value={f.nota} maxLength={200} onChange={e=>setF(p=>({ ...p, nota:e.target.value }))} placeholder="Toca pierna, avisados quedáis" style={{ textAlign:"left" }}/>
          <div style={{ display:"flex", gap:8, marginTop:12 }}>
            <button className="fh-btn" onClick={()=>setCreando(false)} style={{ flex:1, background:"var(--card2)", color:"var(--muted)", border:"1px solid var(--line2)", padding:11, fontSize:12.5 }}>Cancelar</button>
            <button className="fh-btn" onClick={proponer} disabled={ocupado} style={{ flex:1.4, background:"var(--gold)", padding:11, fontSize:12.5, opacity:ocupado?.6:1 }}>
              {ocupado ? "Un momento…" : "Proponer"}
            </button>
          </div>
        </div>
      ))}

      {msg && (
        <div style={{ display:"flex", gap:9, alignItems:"flex-start", marginTop:12, padding:"10px 12px", background:"var(--bg2)", border:`1px solid ${msg.ok?"var(--jade)":"var(--crimson)"}`, borderRadius:11 }}>
          {msg.ok ? <Check size={15} color="var(--jade)" style={{ flexShrink:0, marginTop:1 }}/>
                  : <ShieldAlert size={15} color="var(--crimson)" style={{ flexShrink:0, marginTop:1 }}/>}
          <div style={{ fontSize:12, color:"var(--txt)", lineHeight:1.45 }}>{msg.t}</div>
        </div>
      )}
    </div>
  </>);
}

const tituloSeccion = { fontSize:12, fontWeight:700, letterSpacing:".08em", color:"var(--faint)", margin:"18px 4px 8px" };
const cajaCara = { width:36, height:36, flexShrink:0, background:"var(--bg2)", border:"1px solid var(--line2)", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden" };

/* Qué hace quien está entrenando. No sabemos en qué ejercicio va, así que sale de cómo
   entrena: todos levantan, y además pelean contra un mal hábito o corren si lo suyo es
   el cardio. Va cambiando para que se vean las dos cosas. */
const ACCIONES_RAMA = { explorador:["correr","levantar"] };
const ENEMIGOS_ENTRENO = [120,108,123,122,124,121];
function EscenaEntreno({ av, semilla }){
  const acciones = ACCIONES_RAMA[av.rama] || ["levantar","golpe"];
  const [i, setI] = useState(0);
  useEffect(()=>{ const id = setInterval(()=>setI(n=>n+1), 6600); return ()=>clearInterval(id); }, []);
  const accion = acciones[i%acciones.length], armado = Object.values(av.equipo||{}).some(id=>AVATAR.piezas[id]?.tajo);
  const enemigo = ENEMIGOS_ENTRENO[[...String(semilla)].reduce((n,c)=>n+c.charCodeAt(0),0)%ENEMIGOS_ENTRENO.length];
  return (
    <div className="fh-escena" style={{ height:150 }}>
      {accion==="correr" ? <Avatar av={av} escala={2} dir="perfil" andar className="fh-corre" style={{ position:"absolute", left:"calc(50% - 64px)", bottom:6 }}/>
        : <AvatarAccion av={av} accion={accion} style={{ position:"absolute", left:accion==="golpe" ? "calc(34% - 128px)" : "calc(50% - 128px)", bottom:-56 }}/>}
      {accion==="golpe" && <span className="fh-recibe" style={{ position:"absolute", left:`calc(34% + ${armado ? 92 : 54}px)`, bottom:18 }}><Sprite id={enemigo} size={48}/></span>}
    </div>
  );
}
function TarjetaAmigo({ amigo, sesion, onAbrir, onQuitar, onUnirme }){
  const av = aliadoDeAmigo(amigo).avatar, propio = !!normalizarAvatar(amigo.avatar), rango = rankFor(amigo.level||1);
  const piezas = RANURAS.map(([id])=>AVATAR.piezas[av.equipo?.[id]]).filter(Boolean);
  const nombre = amigo.display_name || amigo.handle;
  const desde = sesion ? Math.round((Date.now() - new Date(sesion.started_at)) / 60000) : 0;
  const datos = (
    <span style={{ display:"block", flex:1, minWidth:0, padding:"10px 12px 12px" }}>
      <span className="disp" style={{ display:"block", fontSize:19, lineHeight:1.1, paddingRight:30, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", color:"var(--txt)" }}>{nombre}</span>
      <span className="mono" style={{ display:"block", fontSize:10.5, color:"var(--faint)", marginTop:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>@{amigo.handle} · nivel {amigo.level}</span>
      <span style={{ display:"block", fontSize:12, fontWeight:700, marginTop:3, color:rango.color }}>{rango.name} · {RAMA[av.rama].estilo}</span>
      {propio ? <span style={{ display:sesion ? "grid" : "block", gridTemplateColumns:"1fr 1fr", columnGap:10, marginTop:6 }}>
        {piezas.map(p=><span key={p.n} style={{ display:"block", fontSize:11, lineHeight:1.45, color:"var(--muted)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.n}</span>)}
      </span> : <span style={{ display:"block", fontSize:11, color:"var(--faint)", marginTop:6, lineHeight:1.4 }}>Aún no ha estrenado su héroe: va de recluta hasta que actualice.</span>}
    </span>
  );
  return (
    <div className="fh-card" style={{ position:"relative", overflow:"hidden", marginBottom:10, borderColor:sesion ? "var(--jade)" : "var(--line)" }}>
      <button onClick={()=>onAbrir(amigo)} aria-label={`Ver la ficha de ${amigo.handle}`}
        style={{ display:sesion ? "block" : "flex", width:"100%", background:"none", border:"none", padding:0, cursor:"pointer", textAlign:"left", color:"inherit", font:"inherit" }}>
        {sesion ? <EscenaEntreno av={av} semilla={amigo.handle}/>
          : <span className="fh-escena" style={{ display:"flex", alignItems:"flex-end", justifyContent:"center", width:128, minHeight:150, flexShrink:0 }}><Avatar av={av} escala={2} style={{ marginBottom:-2 }} titulo={`Héroe de ${nombre}`}/></span>}
        {datos}
      </button>
      <button onClick={()=>onQuitar(amigo.id)} aria-label={`Quitar a ${amigo.handle}`}
        style={{ position:"absolute", right:8, top:sesion ? 158 : 8, background:"var(--bg2)", border:"1px solid var(--line)", width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"var(--faint)" }}>
        <X size={13}/>
      </button>
      {sesion && <div style={{ padding:"0 12px 12px" }}>
        <div style={{ fontSize:12, color:"var(--jade)", fontWeight:700, marginBottom:8 }}>Entrenando ahora{sesion.rutina ? ` · ${sesion.rutina}` : ""} · {desde<1 ? "acaba de empezar" : `${desde} min`}</div>
        <button className="fh-btn" onClick={()=>onUnirme(sesion)} style={{ width:"100%", background:"var(--jade)", padding:10, fontSize:13, display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
          <Users size={14}/> Entrenar con {nombre.split(" ")[0]}
        </button>
      </div>}
    </div>
  );
}

/* Tus amigos. Para añadir gente está la sección Buscar. */
function AmigosPanel({ amigos, entrenando, onUnirme, onQuitar, onAbrir, onBuscar }){
  const [confirmar, setConfirmar] = useState(null);
  const sesionDe = a => (entrenando||[]).find(s=>s.created_by===a.id || s.miembros?.includes(a.id));
  const ordenados = [...amigos].sort((a,b)=>!!sesionDe(b) - !!sesionDe(a));   // sort es estable

  return (<>
    <div style={tituloSeccion}>TUS AMIGOS {amigos.length > 0 && `· ${amigos.length}`}</div>
    {amigos.length === 0 && (
      <p className="fh-card" style={{ padding:16, fontSize:12.5, color:"var(--muted)", margin:"0 0 10px", lineHeight:1.5 }}>
        Todavía no tienes a nadie. Mira quién hay en RPGym y mándale una solicitud.
      </p>
    )}

    {ordenados.map(a=><TarjetaAmigo key={a.id} amigo={a} sesion={sesionDe(a)} onAbrir={onAbrir} onUnirme={onUnirme} onQuitar={id=>setConfirmar(confirmar===id?null:id)}/>)}

    {confirmar && (
      <div className="fh-card" style={{ background:"var(--bg2)", padding:12, marginBottom:10, display:"flex", alignItems:"center", gap:9, flexWrap:"wrap" }}>
        <span style={{ fontSize:12.5, color:"var(--muted)", flex:1, minWidth:140 }}>¿Dejar de ser amigo de {amigos.find(a=>a.id===confirmar)?.display_name || amigos.find(a=>a.id===confirmar)?.handle}? Podréis volver a pediros amistad.</span>
        <button className="fh-btn" onClick={()=>setConfirmar(null)} style={{ background:"var(--card2)", color:"var(--muted)", border:"1px solid var(--line2)", padding:"8px 13px", fontSize:12 }}>No</button>
        <button className="fh-btn" onClick={()=>{ const id=confirmar; setConfirmar(null); onQuitar(id); }} style={{ background:"var(--crimson)", color:"#fff", padding:"8px 13px", fontSize:12 }}>Sí</button>
      </div>
    )}

    <button className="fh-btn" onClick={onBuscar}
      style={{ width:"100%", background:"var(--card2)", color:"var(--txt)", border:"1px solid var(--line2)", padding:11, fontSize:12.5, display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
      <Search size={15} color="var(--gold)"/> Buscar gente
    </button>
  </>);
}

/* Toda la gente de RPGym, sin tener que saber cómo se llama: la app la usa un grupo
   pequeño, así que se baja la lista entera y escribir solo la filtra aquí. Quien no
   tenga cuenta todavía entra con un código de invitación. */
function GentePanel({ amigos, onRefrescarAmigos, onAbrir }){
  const [gente, setGente] = useState(null);        // null: todavía cargando
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [pedidos, setPedidos] = useState([]);      // a quién has pedido desde que entraste aquí
  const [modo, setModo] = useState(null);          // invitar | canjear
  const [codigo, setCodigo] = useState("");
  const [entrada, setEntrada] = useState("");
  const [msg, setMsg] = useState(null);
  const [cargando, setCargando] = useState(false);

  useEffect(()=>{
    let vivo = true;
    cloud.directorioGente().then(r=>{
      if(!vivo) return;
      setGente(r.ok ? r.gente : []);
      setError(r.ok ? null : r.msg);
    });
    return ()=>{ vivo = false; };
  }, [amigos.length]);

  const esAmigo = id => amigos.find(a=>a.id===id);
  const texto = normTxt(busqueda.trim().replace(/^@/,""));
  const visibles = (gente||[])
    .filter(g=>!texto || normTxt(g.handle).includes(texto) || normTxt(g.display_name||"").includes(texto))
    .sort((a,b)=>!!esAmigo(a.id) - !!esAmigo(b.id));   // primero a quien aún no conoces; sort es estable

  async function pedir(g){
    setError(null);
    const r = await cloud.pedirAmistad(g.id);
    if(!r.ok){ setError(r.msg); return; }
    setPedidos(p => [...p, g.id]);
    cloud.avisarAmigos("amistad", { para:g.id });
  }

  const puedeCompartir = typeof navigator !== "undefined" && !!navigator.share;
  const invitacion = c => `¡Éntrale a RPGym conmigo! Instala la app y mete este código en Amigos:\n\n${c}\n\nAsí nos vemos en la clasificación.`;

  async function invitar(){
    setModo("invitar"); setMsg(null);
    if (codigo) return;
    setCargando(true);
    const r = await cloud.crearInvitacion();
    setCargando(false);
    if (r.ok) setCodigo(r.code); else setMsg({ ok:false, t:r.msg });
  }
  async function copiar(){
    try { await navigator.clipboard.writeText(invitacion(codigo)); setMsg({ ok:true, t:"Invitación copiada." }); }
    catch { setMsg({ ok:false, t:"No se ha podido copiar. Selecciona el texto y cópialo a mano." }); }
  }
  async function enviar(){
    try { await navigator.share({ title:"RPGym", text:invitacion(codigo) }); } catch {}
  }
  async function canjear(){
    setCargando(true); setMsg(null);
    const r = await cloud.canjearInvitacion(entrada);
    setCargando(false);
    if (!r.ok) { setMsg({ ok:false, t:r.msg }); return; }
    setEntrada("");
    setMsg({ ok:true, t: r.yaEra ? `Ya erais amigos, ${r.amigo?.display_name || "@"+r.amigo?.handle}.`
                                 : `¡Ya sois amigos! ${r.amigo?.display_name || "@"+r.amigo?.handle} entra en tu clasificación.` });
    onRefrescarAmigos();
  }

  return (<>
    <div style={tituloSeccion}>GENTE EN RPGYM {gente?.length > 0 && `· ${gente.length}`}</div>
    <div className="fh-card" style={{ padding:16 }}>
      <input value={busqueda} maxLength={30} autoCapitalize="none" autoCorrect="off"
        onChange={e=>setBusqueda(e.target.value)}
        placeholder="Filtrar por nombre o @usuario" aria-label="Filtrar por nombre o usuario"
        style={{ textAlign:"left" }}/>
      <div style={{ fontSize:11, color:"var(--faint)", margin:"7px 2px 4px", lineHeight:1.45 }}>
        {gente === null ? "Cargando…"
          : !gente.length && !error ? "Todavía no hay nadie más. Invita a alguien con tu código."
          : !visibles.length ? "Nadie con ese nombre."
          : "Pídele amistad a quien quieras: le llegará una solicitud y decidirá si te acepta."}
      </div>
      {error && <div style={{ fontSize:12, color:"var(--crimson)", margin:"6px 2px", lineHeight:1.45 }}>{error}</div>}

      {visibles.map((g,i)=>{
        const amigo = esAmigo(g.id);
        const persona = <>
          <span style={cajaCara}><AvatarCara av={aliadoDeAmigo(g).avatar} size={32}/></span>
          <span style={{ display:"block", flex:1, minWidth:0 }}>
            <span style={{ display:"block", fontSize:13.5, fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", color:"var(--txt)" }}>{g.display_name || g.handle}</span>
            <span className="mono" style={{ display:"block", fontSize:10.5, color:"var(--faint)", marginTop:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>@{g.handle} · nivel {g.level}</span>
          </span>
        </>;
        return (
          <div key={g.id} style={{ display:"flex", alignItems:"center", gap:11, padding:"10px 0", borderTop:i?"1px solid var(--line)":"none" }}>
            {amigo ? (
              <button onClick={()=>onAbrir(amigo)} aria-label={`Ver la ficha de ${g.handle}`}
                style={{ flex:1, minWidth:0, display:"flex", alignItems:"center", gap:11, background:"none", border:"none", padding:0, cursor:"pointer", textAlign:"left" }}>{persona}</button>
            ) : <div style={{ flex:1, minWidth:0, display:"flex", alignItems:"center", gap:11 }}>{persona}</div>}
            {amigo ? <span className="fh-chip" style={{ background:"var(--bg2)", color:"var(--jade)", border:"none", flexShrink:0 }}>amigo</span>
              : g.pendiente==="recibida" ? <span className="fh-chip" style={{ background:"var(--bg2)", color:"var(--gold)", border:"none", flexShrink:0 }}>te la ha pedido</span>
              : g.pendiente || pedidos.includes(g.id) ? <span className="fh-chip" style={{ background:"var(--bg2)", color:"var(--faint)", border:"none", flexShrink:0 }}>pendiente</span>
              : <button className="fh-btn" onClick={()=>pedir(g)} aria-label={`Pedir amistad a ${g.handle}`}
                  style={{ background:"var(--jade)", padding:"8px 12px", fontSize:12, flexShrink:0 }}>Pedir</button>}
          </div>
        );
      })}
    </div>

    <div style={tituloSeccion}>¿AÚN NO ESTÁ EN RPGYM?</div>
    <div className="fh-card" style={{ padding:16 }}>
      <div style={{ display:"flex", gap:8 }}>
        <button className="fh-btn" onClick={invitar}
          style={{ flex:1, background:modo==="invitar"?"var(--gold)":"var(--card2)", color:modo==="invitar"?"#0F131A":"var(--txt)", border:modo==="invitar"?"none":"1px solid var(--line2)", padding:11, fontSize:12.5, display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
          <Share2 size={14} color={modo==="invitar"?"#0F131A":"var(--gold)"}/> Invitar
        </button>
        <button className="fh-btn" onClick={()=>{ setModo(modo==="canjear"?null:"canjear"); setMsg(null); }}
          style={{ flex:1, background:modo==="canjear"?"var(--jade)":"var(--card2)", color:modo==="canjear"?"#0F131A":"var(--txt)", border:modo==="canjear"?"none":"1px solid var(--line2)", padding:11, fontSize:12.5, display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
          <Plus size={15} color={modo==="canjear"?"#0F131A":"var(--jade)"}/> Tengo un código
        </button>
      </div>

      {modo === "invitar" && (
        <div className="fh-in" style={{ marginTop:12 }}>
          {cargando && !codigo && <Empty text="Generando tu código…"/>}
          {codigo && (<>
            <div style={{ textAlign:"center", padding:"14px 10px", background:"var(--bg2)", border:"1px solid var(--gold)", borderRadius:12 }}>
              <div style={{ fontSize:11, color:"var(--faint)", marginBottom:6, letterSpacing:".08em", fontWeight:700 }}>TU CÓDIGO</div>
              <div className="mono" style={{ fontSize:30, fontWeight:700, color:"var(--gold)", letterSpacing:".14em" }}>{codigo}</div>
            </div>
            <div style={{ display:"flex", gap:8, marginTop:10 }}>
              <button className="fh-btn" onClick={copiar} style={{ flex:1, background:"var(--gold)", padding:11, fontSize:12.5, display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                <Copy size={14}/> Copiar invitación
              </button>
              {puedeCompartir && (
                <button className="fh-btn" onClick={enviar} style={{ flex:1, background:"var(--card2)", color:"var(--txt)", border:"1px solid var(--line2)", padding:11, fontSize:12.5, display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                  <Share2 size={14} color="var(--gold)"/> Enviar…
                </button>
              )}
            </div>
            <div style={{ fontSize:11, color:"var(--faint)", marginTop:9, lineHeight:1.45 }}>
              Vale para 10 personas y caduca en 30 días. Quien lo meta en <b style={{ color:"var(--muted)" }}>Tengo un código</b> queda como amigo.
            </div>
          </>)}
        </div>
      )}

      {modo === "canjear" && (
        <div className="fh-in" style={{ marginTop:12 }}>
          <input value={entrada} maxLength={6} inputMode="text" autoCapitalize="characters" autoCorrect="off"
            onChange={e=>{ setEntrada(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,"")); setMsg(null); }}
            placeholder="ABC234" aria-label="Código de invitación"
            style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:22, letterSpacing:".14em", fontWeight:700 }}/>
          <button className="fh-btn" onClick={canjear} disabled={cargando || entrada.length !== 6}
            style={{ width:"100%", marginTop:10, background:"var(--jade)", padding:12, fontSize:13, opacity:(cargando||entrada.length!==6)?.6:1 }}>
            {cargando ? "Un momento…" : "Añadir amigo"}
          </button>
        </div>
      )}

      {msg && (
        <div style={{ display:"flex", gap:9, alignItems:"flex-start", marginTop:12, padding:"10px 12px", background:"var(--bg2)", border:`1px solid ${msg.ok?"var(--jade)":"var(--crimson)"}`, borderRadius:11 }}>
          {msg.ok ? <Check size={15} color="var(--jade)" style={{ flexShrink:0, marginTop:1 }}/>
                  : <ShieldAlert size={15} color="var(--crimson)" style={{ flexShrink:0, marginTop:1 }}/>}
          <div style={{ fontSize:12, color:"var(--txt)", lineHeight:1.45 }}>{msg.t}</div>
        </div>
      )}
    </div>
  </>);
}

/* Ficha de un amigo: su nivel, sus atributos, sus marcas comparadas con las
   tuyas, y lo que puedes hacer con él (quedar y pasarle una rutina).

   Los atributos NO los calcula el servidor: se sacan aquí cruzando sus marcas
   con EX_MUSCLE y BODY_MAP, el mismo catálogo que usa tu propia ficha. Así el
   servidor solo guarda "ejercicio + peso" y no necesita saber de músculos. */
/* La campana: lo que otra persona ha puesto en tus manos y espera respuesta.
   Solo cosas que EXIGEN decisión (amistades y rutinas). Lo que solo se mira
   —quién ha entrenado, quién te ha superado— sigue en Inicio, sin insistir. */
function SolicitudesCard({ solicitudes, onResponder }){
  const [ocupado, setOcupado] = useState(null);
  async function responder(id, acepto){
    setOcupado(id);
    try { await onResponder(id, acepto); } finally { setOcupado(null); }
  }
  if(!solicitudes.length) return null;
  return (<>
    <div style={tituloSeccion}>QUIEREN SER TUS AMIGOS · {solicitudes.length}</div>
    <div className="fh-card" style={{ padding:16 }}>
      {solicitudes.map((s,i)=>(
        <div key={s.id} style={{ padding:"11px 0", borderTop:i?"1px solid var(--line)":"none" }}>
          <div style={{ display:"flex", alignItems:"center", gap:11 }}>
            <div style={{ width:36, height:36, borderRadius:11, flexShrink:0, background:"var(--bg2)", border:"1px solid var(--line2)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <User size={17} color="var(--gold)"/>
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:13.5, fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.display_name || s.handle}</div>
              <div className="mono" style={{ fontSize:11, color:"var(--faint)", marginTop:2 }}>@{s.handle} · nivel {s.level} · {s.total_workouts || 0} entrenos</div>
            </div>
          </div>
          <div style={{ display:"flex", gap:8, marginTop:10 }}>
            <button className="fh-btn" disabled={ocupado===s.id} onClick={()=>responder(s.id, false)}
              style={{ flex:1, background:"var(--card2)", color:"var(--muted)", border:"1px solid var(--line2)", padding:10, fontSize:12.5 }}>
              Rechazar
            </button>
            <button className="fh-btn" disabled={ocupado===s.id} onClick={()=>responder(s.id, true)}
              style={{ flex:1.4, background:"var(--jade)", padding:10, fontSize:12.5, display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
              <Check size={14}/> Aceptar
            </button>
          </div>
        </div>
      ))}
    </div>
  </>);
}

function AvisosView({ solicitudes, envios, onResponderSolicitud, onResponderRutina, onVolver }){
  const [ocupado, setOcupado] = useState(null);
  const sectionTitle = { fontSize:12, fontWeight:700, letterSpacing:".08em", color:"var(--faint)", margin:"18px 4px 8px" };
  const vacio = !solicitudes.length && !envios.length;

  async function conBloqueo(clave, fn){
    setOcupado(clave);
    try { await fn(); } finally { setOcupado(null); }
  }

  return (
    <div className="fh-in">
      <header style={{ padding:"22px 2px 12px", display:"flex", alignItems:"center", gap:10 }}>
        <button onClick={onVolver} aria-label="Volver a Inicio"
          style={{ background:"var(--card)", border:"1px solid var(--line)", borderRadius:10, width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"var(--muted)", flexShrink:0 }}><ChevronLeft size={18}/></button>
        <div>
          <h1 style={{ margin:0, fontSize:22 }}>Avisos</h1>
          <p style={{ margin:"3px 0 0", fontSize:13, color:"var(--muted)" }}>
            {vacio ? "Nada pendiente." : "Cosas que esperan tu respuesta."}
          </p>
        </div>
      </header>

      {vacio && (
        <div className="fh-card" style={{ padding:20, marginTop:8, textAlign:"center" }}>
          <Bell size={26} color="var(--faint)"/>
          <p style={{ fontSize:12.5, color:"var(--muted)", margin:"10px 0 0", lineHeight:1.5 }}>
            Aquí te llegarán las solicitudes de amistad y las rutinas que te manden tus amigos.
          </p>
        </div>
      )}

      <SolicitudesCard solicitudes={solicitudes} onResponder={onResponderSolicitud}/>

      {envios.length > 0 && (<>
        <div style={sectionTitle}>RUTINAS QUE TE MANDAN · {envios.length}</div>
        <div className="fh-card" style={{ padding:16 }}>
          {envios.map((e,i)=>(
            <div key={e.id} style={{ padding:"11px 0", borderTop:i?"1px solid var(--line)":"none" }}>
              <div style={{ display:"flex", alignItems:"flex-start", gap:11 }}>
                <div style={{ width:36, height:36, borderRadius:11, flexShrink:0, background:"var(--bg2)", border:"1px solid var(--line2)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <ClipboardList size={17} color="var(--gold)"/>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13.5, fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{e.name}</div>
                  <div style={{ fontSize:11.5, color:"var(--muted)", marginTop:2 }}>
                    de {e.display_name || "@"+e.handle} · {e.dias} día{e.dias===1?"":"s"}
                  </div>
                </div>
              </div>
              <div style={{ fontSize:11, color:"var(--faint)", marginTop:8, lineHeight:1.45 }}>
                Si la aceptas se añade a tus rutinas. La primera vez que la entrenes te llevas {XP_RUTINA_AMIGO} XP extra.
              </div>
              <div style={{ display:"flex", gap:8, marginTop:10 }}>
                <button className="fh-btn" disabled={ocupado===e.id}
                  onClick={()=>conBloqueo(e.id, ()=>onResponderRutina(e, false))}
                  style={{ flex:1, background:"var(--card2)", color:"var(--muted)", border:"1px solid var(--line2)", padding:10, fontSize:12.5 }}>
                  Rechazar
                </button>
                <button className="fh-btn" disabled={ocupado===e.id}
                  onClick={()=>conBloqueo(e.id, ()=>onResponderRutina(e, true))}
                  style={{ flex:1.4, background:"var(--gold)", padding:10, fontSize:12.5, display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                  <Download size={14}/> Añadirla
                </button>
              </div>
            </div>
          ))}
        </div>
      </>)}
    </div>
  );
}

function AmigoView({ amigo, misBests, customRoutines, onVolver, onToast }){
  const [ficha, setFicha] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [accion, setAccion] = useState(null);          // quedar | rutina
  const [ocupado, setOcupado] = useState(false);
  const [rutinaSel, setRutinaSel] = useState("");
  const [grupoAbierto, setGrupoAbierto] = useState(null);
  const [f, setF] = useState(()=>{
    const d = new Date(); d.setDate(d.getDate()+1); d.setHours(19,0,0,0);
    return { fecha: isoOf(d), hora:"19:00", lugar:"", nota:"" };
  });

  useEffect(()=>{ let vivo=true; (async()=>{
    setCargando(true);
    const r = await cloud.fichaDeAmigo(amigo.id);
    if(!vivo) return;
    setCargando(false);
    if(r.ok) setFicha(r);
  })(); return ()=>{ vivo=false; }; }, [amigo.id]);

  const perfilAmigo = ficha?.perfil || amigo;
  const nombre = perfilAmigo.display_name || perfilAmigo.handle;
  const nivel = perfilAmigo.level || 1;
  const rango = rankFor(nivel);
  const RankIcon = rango.icon;
  const xpInto = (perfilAmigo.xp||0) - cumXpForLevel(nivel);
  const xpNeed = Math.max(1, cumXpForLevel(nivel+1) - cumXpForLevel(nivel));

  /* Sus atributos. El NIVEL sale del XP por grupo que sube con su perfil; los
     ejercicios, de sus marcas. Lo que llega del servidor es XP en crudo, así
     que el nivel se calcula aquí con la escala de ESTA versión de la app. */
  const suXp = perfilAmigo.atributos || {};
  const porGrupo = {};
  BODY_STATS.forEach(g=>{
    const xp = Number(suXp[g.id]) || 0;
    const lv = catLevel(xp);
    porGrupo[g.id] = { hechos:[], total:(EXERCISES_BY_GROUP[g.id]||[]).length,
      xp, lv, into: xp - catCumXp(lv), need: Math.max(1, catCumXp(lv+1) - catCumXp(lv)) };
  });
  (ficha?.records || []).forEach(r=>{
    const grupo = BODY_MAP[EX_MUSCLE[r.ejercicio]];
    if(grupo && porGrupo[grupo]) porGrupo[grupo].hechos.push(r);
  });
  const suPoder = BODY_STATS.reduce((a,g)=>a + porGrupo[g.id].lv, 0);
  const suTier = powerTier(suPoder);
  const tieneAtributos = BODY_STATS.some(g=>porGrupo[g.id].xp > 0);

  /* Mis marcas: manda el historial de este móvil, y las del servidor rellenan
     los huecos (móvil recién instalado, o marcas de antes de restaurar). */
  const mis = { ...(ficha?.mios || {}), ...(misBests || {}) };

  // Marcas comparadas: solo los ejercicios que hacéis los dos.
  const comunes = (ficha?.records || [])
    .filter(r => (mis[r.ejercicio] || 0) > 0)
    .map(r => ({ ...r, mio: mis[r.ejercicio], dif: r.peso - mis[r.ejercicio] }));
  const meGana = comunes.filter(c => c.dif > 0).sort((a,b)=>b.dif-a.dif);
  const leGano = comunes.filter(c => c.dif < 0).sort((a,b)=>a.dif-b.dif);
  const suyasSolas = (ficha?.records || []).filter(r => !(mis[r.ejercicio] > 0));

  const mias = (customRoutines || []).filter(r => !r.privada);

  async function quedar(){
    setOcupado(true);
    const cuando = new Date(`${f.fecha}T${f.hora}:00`).toISOString();
    const r = await cloud.quedarCon({ amigoId:amigo.id, cuando, lugar:f.lugar, nota:f.nota });
    setOcupado(false);
    if(!r.ok){ onToast({ title:"No se ha podido", sub:r.msg, icon:ShieldAlert }); return; }
    cloud.avisarAmigos("invitacion", { para:amigo.id, ejercicio:cuandoTexto(cuando) });
    setAccion(null);
    onToast({ title:"Quedada propuesta", sub:`${nombre} la ve en su Inicio y te contesta.`, icon:CalendarDays });
  }

  /* Va por dentro de la app: le llega a su campana y él decide. El payload es
     el mismo que viaja en el código de texto (ejercicios por nombre), así que
     lo reconstruye con su propio catálogo, sea cual sea su versión. */
  async function pasarRutina(){
    const rutina = mias.find(r => r.id === rutinaSel);
    if(!rutina) return;
    setOcupado(true);
    const payload = JSON.parse(b64urlDecode(encodeRoutine(rutina).slice(SHARE_PREFIX.length)));
    const r = await cloud.mandarRutina({ amigoId:amigo.id, clientId:rutina.id, name:rutina.name, dias:rutina.days.length, payload });
    setOcupado(false);
    if(!r.ok){ onToast({ title:"No se ha podido mandar", sub:r.msg, icon:ShieldAlert }); return; }
    cloud.avisarAmigos("rutina", { nombre:rutina.name, para:amigo.id });
    setAccion(null); setRutinaSel("");
    onToast({ title:"Rutina mandada", sub:`${nombre} la verá en sus avisos y decidirá.`, icon:Share2 });
  }

  const label = { padding:"0 2px 6px", fontSize:12, color:"var(--muted)", fontWeight:600 };
  const sectionTitle = { fontSize:12, fontWeight:700, letterSpacing:".08em", color:"var(--faint)", margin:"18px 4px 8px" };

  return (
    <div className="fh-in">
      <header style={{ padding:"22px 2px 12px", display:"flex", alignItems:"center", gap:10 }}>
        <button onClick={onVolver} aria-label="Volver a amigos"
          style={{ background:"var(--card)", border:"1px solid var(--line)", borderRadius:10, width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"var(--muted)", flexShrink:0 }}><ChevronLeft size={18}/></button>
        <div style={{ minWidth:0 }}>
          <h1 style={{ margin:0, fontSize:22, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{nombre}</h1>
          <p className="mono" style={{ margin:"3px 0 0", fontSize:12.5, color:"var(--muted)" }}>@{perfilAmigo.handle}</p>
        </div>
      </header>

      <div className="fh-card fh-framed" style={{ padding:20, display:"flex", alignItems:"center", gap:18 }}>
        <Ring pct={xpInto/xpNeed} size={104} stroke={9} color={rango.color}>
          <RankIcon size={19} color={rango.color}/>
          <div className="cinzel" style={{ fontSize:25, fontWeight:700, lineHeight:1, marginTop:2 }}>{nivel}</div>
          <div style={{ fontSize:9, color:"var(--muted)", fontWeight:600 }}>NIVEL</div>
        </Ring>
        <div style={{ flex:1, minWidth:0 }}>
          <div className="cinzel" style={{ fontSize:19, fontWeight:700, color:rango.color }}>{rango.name}</div>
          <div style={{ fontSize:12, color:"var(--muted)", marginTop:3 }}>{perfilAmigo.total_workouts || 0} entrenos · {perfilAmigo.xp || 0} XP</div>
          {perfilAmigo.best_streak > 0 && (
            <div style={{ fontSize:11.5, color:"var(--faint)", marginTop:4 }}>Mejor racha: {perfilAmigo.best_streak} días</div>
          )}
        </div>
      </div>

      {/* --- Qué puedes hacer con él --- */}
      <div style={{ display:"flex", gap:8, marginTop:12 }}>
        <button className="fh-btn" onClick={()=>setAccion(accion==="quedar"?null:"quedar")}
          style={{ flex:1, background:accion==="quedar"?"var(--gold)":"var(--card2)", color:accion==="quedar"?"#0F131A":"var(--txt)", border:accion==="quedar"?"none":"1px solid var(--line2)", padding:12, fontSize:12.5, display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}>
          <CalendarDays size={15}/> Quedar
        </button>
        <button className="fh-btn" onClick={()=>setAccion(accion==="rutina"?null:"rutina")}
          style={{ flex:1, background:accion==="rutina"?"var(--gold)":"var(--card2)", color:accion==="rutina"?"#0F131A":"var(--txt)", border:accion==="rutina"?"none":"1px solid var(--line2)", padding:12, fontSize:12.5, display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}>
          <Share2 size={15}/> Pasarle una rutina
        </button>
      </div>

      {accion === "quedar" && (
        <div className="fh-card fh-in" style={{ padding:16, marginTop:10 }}>
          <div style={{ fontSize:12.5, color:"var(--muted)", margin:"0 0 12px", lineHeight:1.5 }}>
            Le llega la invitación a su Inicio y contesta desde ahí. Tus demás amigos también la ven y pueden apuntarse.
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <div style={{ flex:1.4 }}>
              <div style={label}>Día</div>
              <input type="date" value={f.fecha} min={todayISO()} onChange={e=>setF(p=>({ ...p, fecha:e.target.value }))} style={{ textAlign:"left" }}/>
            </div>
            <div style={{ flex:1 }}>
              <div style={label}>Hora</div>
              <input type="time" value={f.hora} onChange={e=>setF(p=>({ ...p, hora:e.target.value }))} style={{ textAlign:"left" }}/>
            </div>
          </div>
          <div style={{ ...label, marginTop:12 }}>Dónde <span style={{ color:"var(--faint)", fontWeight:400 }}>(opcional)</span></div>
          <input value={f.lugar} maxLength={60} onChange={e=>setF(p=>({ ...p, lugar:e.target.value }))} placeholder="El gimnasio de siempre" style={{ textAlign:"left" }}/>
          <div style={{ ...label, marginTop:12 }}>Nota <span style={{ color:"var(--faint)", fontWeight:400 }}>(opcional)</span></div>
          <input value={f.nota} maxLength={200} onChange={e=>setF(p=>({ ...p, nota:e.target.value }))} placeholder="Toca pierna, avisado quedas" style={{ textAlign:"left" }}/>
          <button className="fh-btn" onClick={quedar} disabled={ocupado}
            style={{ width:"100%", marginTop:13, background:"var(--gold)", padding:12, fontSize:13, opacity:ocupado?.6:1 }}>
            {ocupado ? "Un momento…" : `Invitar a ${nombre}`}
          </button>
        </div>
      )}

      {accion === "rutina" && (
        <div className="fh-card fh-in" style={{ padding:16, marginTop:10 }}>
          {!mias.length ? (
            <p style={{ fontSize:12.5, color:"var(--muted)", margin:0, lineHeight:1.5 }}>
              No tienes ninguna rutina propia todavía. Móntala en <b style={{ color:"var(--txt)" }}>Rutinas → Crear rutina</b> y podrás pasársela.
            </p>
          ) : (<>
            <div style={label}>Cuál le mandas</div>
            <select value={rutinaSel} onChange={e=>setRutinaSel(e.target.value)} style={{ textAlign:"left" }}>
              <option value="">Elige una rutina…</option>
              {mias.map(r=><option key={r.id} value={r.id}>{r.name} · {r.days?.length || 0} días</option>)}
            </select>
            <p style={{ fontSize:11.5, color:"var(--faint)", margin:"10px 2px 12px", lineHeight:1.45 }}>
              Le llega a sus avisos y decide si la añade. No hace falta salir de la app ni pasarle nada por otro sitio.
            </p>
            <button className="fh-btn" onClick={pasarRutina} disabled={!rutinaSel || ocupado}
              style={{ width:"100%", background:rutinaSel?"var(--gold)":"var(--card2)", color:rutinaSel?"#0F131A":"var(--faint)", padding:12, fontSize:13, opacity:ocupado?.6:1 }}>
              {ocupado ? "Mandando…" : "Mandársela"}
            </button>
          </>)}
        </div>
      )}

      {cargando && <Empty text="Cargando su ficha…"/>}

      {!cargando && ficha && (<>
        {/* --- Atributos: SOLO lo que hace de verdad ---
            Nada de listar lo que le falta: aquí se viene a ver qué hace, para
            proponerle el mismo ejercicio. El favorito (el que más repite) va
            marcado, que es el que seguro que acepta. */}
        <div style={sectionTitle}>SUS ATRIBUTOS</div>
        {tieneAtributos && (
          <div className="fh-card" style={{ padding:"13px 16px", marginBottom:8, display:"flex", alignItems:"center", justifyContent:"space-between", gap:10 }}>
            <div>
              <div style={{ fontSize:11.5, color:"var(--faint)", fontWeight:700, letterSpacing:".06em" }}>PODER TOTAL</div>
              <div className="cinzel" style={{ fontSize:15, fontWeight:700, color:"var(--gold)", marginTop:2 }}>{suTier.name}</div>
            </div>
            <div className="cinzel" style={{ fontSize:26, fontWeight:700 }}>{suPoder}</div>
          </div>
        )}
        <div className="fh-card" style={{ padding:16 }}>
          {BODY_STATS.map((g,i)=>{
            const d = porGrupo[g.id];
            const Icon = g.icon;
            const abierto = grupoAbierto === g.id;
            // Favorito = el que más sesiones acumula; a igualdad, el más pesado.
            const orden = d.hechos.slice().sort((a,b)=> (b.veces||0)-(a.veces||0) || b.peso-a.peso);
            const favorito = orden[0];
            return (
              <div key={g.id} style={{ borderTop:i?"1px solid var(--line)":"none" }}>
                <button onClick={()=>d.hechos.length && setGrupoAbierto(abierto?null:g.id)}
                  style={{ width:"100%", background:"none", border:"none", padding:"11px 0", cursor:d.hechos.length?"pointer":"default", color:"inherit", textAlign:"left", display:"flex", alignItems:"center", gap:11 }}>
                  <div style={{ width:34, height:34, borderRadius:10, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", background:"var(--bg2)", border:`1px solid ${g.color}` }}>
                    <Icon size={16} color={g.color}/>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", gap:8 }}>
                      <span style={{ fontSize:13, fontWeight:600 }}>{g.id}</span>
                      <span className="fh-chip cinzel" style={{ background:"var(--bg2)", color:g.color, flexShrink:0 }}>Nv {d.lv}</span>
                    </div>
                    <div className="fh-bar" style={{ marginTop:5 }}><i style={{ width:`${Math.min(100,(d.into/d.need)*100)}%`, background:g.color }}/></div>
                    <div style={{ fontSize:10.5, color:"var(--faint)", marginTop:4, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {favorito ? `Su fuerte: ${favorito.ejercicio}`
                        : d.xp ? "Aún no ha marcado ninguno de este grupo"
                        : "Sin entrenar todavía"}
                    </div>
                  </div>
                  {d.hechos.length > 0 && (
                    <ChevronRight size={14} color="var(--faint)" style={{ flexShrink:0, transform:abierto?"rotate(90deg)":"none", transition:"transform .2s" }}/>
                  )}
                </button>

                {abierto && (
                  <div className="fh-in" style={{ paddingBottom:11 }}>
                    {orden.map(r=>{
                      const esFav = r.ejercicio === favorito.ejercicio;
                      const miMarca = mis[r.ejercicio] || 0;
                      return (
                        <div key={r.ejercicio} style={{ display:"flex", alignItems:"center", gap:9, padding:"7px 10px", marginTop:5, borderRadius:9,
                          background: esFav ? "rgba(232,176,75,.13)" : "var(--bg2)",
                          border: `1px solid ${esFav ? "var(--gold)" : "transparent"}` }}>
                          {esFav && <Star size={12} color="var(--gold)" style={{ flexShrink:0 }}/>}
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontSize:12.5, fontWeight:esFav?700:500, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.ejercicio}</div>
                            <div style={{ fontSize:10.5, color:"var(--faint)", marginTop:2 }}>
                              {r.veces ? `${r.veces} ${r.veces===1?"sesión":"sesiones"}` : "sin contar"}
                              {miMarca ? ` · tú ${miMarca} kg` : " · tú no lo haces"}
                            </div>
                          </div>
                          <span className="mono" style={{ fontSize:12, color:esFav?"var(--gold)":"var(--muted)", flexShrink:0 }}>{r.peso} kg</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
          <div style={{ fontSize:11, color:"var(--faint)", marginTop:11, lineHeight:1.45 }}>
            {BODY_STATS.some(g=>porGrupo[g.id].hechos.length)
              ? "Toca un grupo para ver qué ejercicios hace. El marcado con estrella es el que más repite: buen candidato para quedar a hacerlo juntos."
              : tieneAtributos
                ? "Sus niveles ya están aquí. Los ejercicios aparecerán en cuanto entrene con la versión nueva de la app."
                : "Todavía no ha entrenado con la versión que comparte esto. Aparecerá en cuanto lo haga."}
          </div>
        </div>

        {/* --- Marcas --- */}
        <div style={sectionTitle}>SUS MARCAS {ficha.records.length > 0 && `· ${ficha.records.length}`}</div>
        <div className="fh-card" style={{ padding:16 }}>
          {!ficha.records.length && <Empty text="Todavía no ha subido ninguna marca."/>}

          {meGana.length > 0 && (<>
            <div style={{ fontSize:11.5, color:"var(--ember)", fontWeight:700, marginBottom:8 }}>TE GANA EN {meGana.length}</div>
            {meGana.map((c,i)=>(
              <div key={c.ejercicio} style={{ display:"flex", alignItems:"center", gap:9, padding:"7px 0", borderTop:i?"1px solid var(--line)":"none" }}>
                <ArrowUp size={13} color="var(--ember)" style={{ flexShrink:0 }}/>
                <div style={{ flex:1, minWidth:0, fontSize:12.5, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.ejercicio}</div>
                <span className="mono" style={{ fontSize:12, color:"var(--ember)", flexShrink:0 }}>{c.peso} kg</span>
                <span className="mono" style={{ fontSize:11, color:"var(--faint)", flexShrink:0 }}>(tú {c.mio})</span>
              </div>
            ))}
          </>)}

          {leGano.length > 0 && (<>
            <div style={{ fontSize:11.5, color:"var(--jade)", fontWeight:700, margin:`${meGana.length?16:0}px 0 8px` }}>LE GANAS EN {leGano.length}</div>
            {leGano.map((c,i)=>(
              <div key={c.ejercicio} style={{ display:"flex", alignItems:"center", gap:9, padding:"7px 0", borderTop:i?"1px solid var(--line)":"none" }}>
                <ArrowDown size={13} color="var(--jade)" style={{ flexShrink:0 }}/>
                <div style={{ flex:1, minWidth:0, fontSize:12.5, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.ejercicio}</div>
                <span className="mono" style={{ fontSize:12, color:"var(--muted)", flexShrink:0 }}>{c.peso} kg</span>
                <span className="mono" style={{ fontSize:11, color:"var(--jade)", flexShrink:0 }}>(tú {c.mio})</span>
              </div>
            ))}
          </>)}

          {suyasSolas.length > 0 && (<>
            <div style={{ fontSize:11.5, color:"var(--faint)", fontWeight:700, margin:`${comunes.length?16:0}px 0 8px` }}>
              EJERCICIOS QUE TÚ NO HACES · {suyasSolas.length}
            </div>
            {suyasSolas.slice(0,12).map((r,i)=>(
              <div key={r.ejercicio} style={{ display:"flex", alignItems:"center", gap:9, padding:"7px 0", borderTop:i?"1px solid var(--line)":"none" }}>
                <div style={{ flex:1, minWidth:0, fontSize:12.5, color:"var(--muted)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.ejercicio}</div>
                <span className="mono" style={{ fontSize:12, color:"var(--muted)", flexShrink:0 }}>{r.peso} kg</span>
              </div>
            ))}
            {suyasSolas.length > 12 && (
              <div style={{ fontSize:11, color:"var(--faint)", marginTop:8 }}>y {suyasSolas.length - 12} más.</div>
            )}
          </>)}
        </div>
      </>)}

      {!cargando && !ficha && <Empty text="No se ha podido cargar su ficha. ¿Sigues sin conexión?"/>}
    </div>
  );
}

/* `arranque` = pantalla de entrada (antes de la app, sin flecha de volver).
   `embebido` = va dentro de la pestaña Cuenta de Ajustes, que ya tiene su propia
   cabecera: aquí sobran el título y la flecha, y dos flechas de volver seguidas
   confundían sobre a dónde se vuelve. */
function AccountView({ state, level, setTab, session, perfil, onEntrar, onRegistrar, onVerificar, onSalir, onCambiarHandle, arranque, onSinCuenta, onRestaurarTexto, embebido }){
  const [modo, setModo] = useState("entrar");          // entrar | registro
  const [f, setF] = useState({ email:"", password:"", handle:"", displayName:"" });
  const [msg, setMsg] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [pidiendoCodigo, setPidiendoCodigo] = useState(null);   // correo pendiente de verificar
  const [codigo, setCodigo] = useState("");
  const [editandoHandle, setEditandoHandle] = useState(false);
  const [handleNuevo, setHandleNuevo] = useState("");
  const [pegandoCopia, setPegandoCopia] = useState(false);
  const [textoCopia, setTextoCopia] = useState("");

  const label = { padding:"0 2px 6px", fontSize:12, color:"var(--muted)", fontWeight:600 };
  const sectionTitle = { fontSize:12, fontWeight:700, letterSpacing:".08em", color:"var(--faint)", margin:"18px 4px 8px" };
  const set = campos => { setMsg(null); setF(p => ({ ...p, ...campos })); };

  async function enviar(){
    setCargando(true); setMsg(null);
    const r = modo === "entrar"
      ? await onEntrar({ email:f.email, password:f.password })
      : await onRegistrar({ email:f.email, password:f.password, handle:f.handle, displayName:f.displayName || state.profile?.name });
    setCargando(false);
    if (!r.ok) { setMsg({ ok:false, t:r.msg }); return; }
    if (r.necesitaConfirmar) { setPidiendoCodigo(f.email.trim()); setMsg(null); return; }
    setF({ email:"", password:"", handle:"", displayName:"" });
  }

  async function verificar(){
    setCargando(true); setMsg(null);
    const r = await onVerificar({ email:pidiendoCodigo, codigo });
    setCargando(false);
    if (!r.ok) { setMsg({ ok:false, t:r.msg }); return; }
    setPidiendoCodigo(null); setCodigo("");
    setF({ email:"", password:"", handle:"", displayName:"" });
  }
  async function reenviar(){
    setCargando(true);
    const r = await cloud.reenviarCodigo(pidiendoCodigo);
    setCargando(false);
    setMsg(r.ok ? { ok:true, t:"Te hemos mandado otro código." } : { ok:false, t:r.msg });
  }


  /* --- Registro hecho, falta el código del correo --- */
  if (!session && pidiendoCodigo) return (
    <div className={embebido ? "" : "fh-in"}>
      <header style={{ padding:"22px 2px 8px", display:"flex", alignItems:"center", gap:10 }}>
        <button onClick={()=>{ setPidiendoCodigo(null); setMsg(null); }} aria-label="Volver" style={{ background:"var(--card)", border:"1px solid var(--line)", borderRadius:10, width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"var(--muted)", flexShrink:0 }}><ChevronLeft size={18}/></button>
        <div>
          <h1 style={{ margin:0, fontSize:22 }}>Confirma tu correo</h1>
          <p style={{ margin:"3px 0 0", fontSize:13, color:"var(--muted)" }}>Te hemos mandado un código de 6 dígitos.</p>
        </div>
      </header>

      <div className="fh-card" style={{ padding:16, marginTop:8 }}>
        <p style={{ fontSize:12.5, color:"var(--muted)", margin:"0 0 14px", lineHeight:1.5 }}>
          Mira en <b style={{ color:"var(--txt)" }}>{pidiendoCodigo}</b> y escribe aquí el código.
          Si no lo ves, revisa la carpeta de spam.
        </p>
        <input value={codigo} inputMode="numeric" maxLength={6} autoComplete="one-time-code"
          onChange={e=>{ setCodigo(e.target.value.replace(/\D/g,"")); setMsg(null); }}
          placeholder="000000" aria-label="Código de confirmación"
          style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:28, letterSpacing:".3em", fontWeight:700 }}/>

        {msg && (
          <div style={{ display:"flex", gap:9, alignItems:"flex-start", marginTop:13, padding:"10px 12px", background:"var(--bg2)", border:`1px solid ${msg.ok?"var(--jade)":"var(--crimson)"}`, borderRadius:11 }}>
            {msg.ok ? <Check size={15} color="var(--jade)" style={{ flexShrink:0, marginTop:1 }}/>
                    : <ShieldAlert size={15} color="var(--crimson)" style={{ flexShrink:0, marginTop:1 }}/>}
            <div style={{ fontSize:12, color:"var(--txt)", lineHeight:1.45 }}>{msg.t}</div>
          </div>
        )}

        <button className="fh-btn" onClick={verificar} disabled={cargando || codigo.length !== 6}
          style={{ width:"100%", marginTop:14, background:"var(--gold)", padding:13, fontSize:14, opacity:(cargando||codigo.length!==6)?.6:1 }}>
          {cargando ? "Comprobando…" : "Confirmar"}
        </button>
        <button className="fh-btn" onClick={reenviar} disabled={cargando}
          style={{ width:"100%", marginTop:9, background:"var(--card2)", color:"var(--muted)", border:"1px solid var(--line2)", padding:11, fontSize:12.5 }}>
          Mandarme otro código
        </button>
      </div>

      <p style={{ fontSize:11.5, color:"var(--faint)", textAlign:"center", marginTop:14, lineHeight:1.55 }}>
        Puedes cerrar la app: al volver, entra con tu correo y contraseña.
      </p>
    </div>
  );

  /* --- Sin sesión: entrar o registrarse --- */
  if (!session) return (
    <div className={embebido ? "" : "fh-in"}>
      {!embebido && (
      <header style={{ padding:"22px 2px 8px", display:"flex", alignItems:"center", gap:10 }}>
        {!arranque && (
          <button onClick={()=>setTab("home")} aria-label="Volver" style={{ background:"var(--card)", border:"1px solid var(--line)", borderRadius:10, width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"var(--muted)", flexShrink:0 }}><ChevronLeft size={18}/></button>
        )}
        <div>
          <h1 style={{ margin:0, fontSize:22 }}>{arranque ? "RPGym" : "Cuenta"}</h1>
          <p style={{ margin:"3px 0 0", fontSize:13, color:"var(--muted)" }}>
            {arranque ? "Entra para verte con tus amigos." : "Para compartir rutinas y verte con tus amigos."}
          </p>
        </div>
      </header>
      )}

      <div className="fh-card" style={{ padding:13, marginTop:8, display:"flex", gap:10, alignItems:"flex-start" }}>
        <Info size={16} color="var(--gold)" style={{ flexShrink:0, marginTop:1 }}/>
        <div style={{ fontSize:12, color:"var(--muted)", lineHeight:1.5 }}>
          Es <b style={{ color:"var(--txt)" }}>opcional</b>. Sin cuenta la app funciona entera, como hasta ahora. Con cuenta se suben solo tu nombre, tu nivel y tus entrenos: <b style={{ color:"var(--txt)" }}>ni peso, ni medidas, ni ciclo</b>.
        </div>
      </div>

      <div style={{ display:"flex", gap:6, margin:"14px 0" }}>
        {[["entrar","Entrar"],["registro","Crear cuenta"]].map(([id,lab])=>(
          <button key={id} className="fh-btn" onClick={()=>{ setModo(id); setMsg(null); }}
            style={{ flex:1, padding:"9px", fontSize:13, background:modo===id?"var(--gold)":"var(--card)", color:modo===id?"#0F131A":"var(--muted)", border:modo===id?"none":"1px solid var(--line)" }}>{lab}</button>
        ))}
      </div>

      <div className="fh-card" style={{ padding:16 }}>
        {modo === "registro" && (<>
          <div style={label}>Nombre de usuario</div>
          <input value={f.handle} maxLength={20} autoCapitalize="none" autoCorrect="off"
            onChange={e=>set({ handle:e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g,"") })}
            placeholder="tu_apodo" style={{ textAlign:"left", fontFamily:"'JetBrains Mono',monospace" }}/>
          <div style={{ fontSize:11.5, color:"var(--faint)", margin:"7px 2px 0", lineHeight:1.45 }}>
            Único para todo el grupo: es lo que evita que dos personas con el mismo nombre se confundan. 3-20 caracteres, sin espacios.
          </div>
          <div style={{ ...label, marginTop:14 }}>Nombre que verán tus amigos</div>
          <input value={f.displayName} maxLength={40} onChange={e=>set({ displayName:e.target.value })}
            placeholder={state.profile?.name || "Tu nombre"} style={{ textAlign:"left" }}/>
        </>)}

        <div style={{ ...label, marginTop:modo==="registro"?14:0 }}>Correo</div>
        <input value={f.email} type="email" inputMode="email" autoCapitalize="none" autoCorrect="off"
          onChange={e=>set({ email:e.target.value })} placeholder="tu@correo.com" style={{ textAlign:"left" }}/>

        <div style={{ ...label, marginTop:14 }}>Contraseña</div>
        <input value={f.password} type="password" onChange={e=>set({ password:e.target.value })}
          placeholder="mínimo 6 caracteres" style={{ textAlign:"left" }}/>

        {msg && (
          <div style={{ display:"flex", gap:9, alignItems:"flex-start", marginTop:13, padding:"10px 12px", background:"var(--bg2)", border:`1px solid ${msg.ok?"var(--jade)":"var(--crimson)"}`, borderRadius:11 }}>
            {msg.ok ? <Check size={15} color="var(--jade)" style={{ flexShrink:0, marginTop:1 }}/>
                    : <ShieldAlert size={15} color="var(--crimson)" style={{ flexShrink:0, marginTop:1 }}/>}
            <div style={{ fontSize:12, color:"var(--txt)", lineHeight:1.45 }}>{msg.t}</div>
          </div>
        )}

        <button className="fh-btn" onClick={enviar} disabled={cargando || !f.email || !f.password || (modo==="registro" && f.handle.length<3)}
          style={{ width:"100%", marginTop:14, background:"var(--gold)", padding:13, fontSize:14, opacity:cargando?.6:1, display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}>
          {cargando ? "Un momento…" : modo==="entrar" ? <><User size={16}/> Entrar</> : <><Plus size={16}/> Crear mi cuenta</>}
        </button>
      </div>

      {arranque && (
        <button className="fh-btn" onClick={onSinCuenta}
          style={{ width:"100%", marginTop:12, background:"none", color:"var(--muted)", border:"1px solid var(--line)", padding:12, fontSize:13 }}>
          Seguir sin cuenta
        </button>
      )}

      {/* Reinstalación o móvil nuevo: aquí se pega la copia de texto, que no
          necesita ni cuenta ni conexión. La copia CIFRADA de la nube no puede
          ir aquí: su clave se deriva de la contraseña al entrar, así que se
          ofrece justo después del login. */}
      {arranque && (
        <>
          <button className="fh-btn" onClick={()=>{ setPegandoCopia(v=>!v); setMsg(null); }}
            style={{ width:"100%", marginTop:9, background:"none", color:"var(--faint)", border:"1px solid var(--line)", padding:11, fontSize:12.5, display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}>
            <Upload size={14}/> Tengo una copia de seguridad
          </button>
          {pegandoCopia && (
            <div className="fh-card fh-in" style={{ padding:16, marginTop:10 }}>
              <div style={label}>Pega aquí tu copia</div>
              <textarea value={textoCopia} onChange={e=>{ setTextoCopia(e.target.value); setMsg(null); }} rows={4} placeholder='{"app":"rpgym",…}'
                style={{ width:"100%", resize:"vertical", background:"var(--bg2)", border:"1px solid var(--line)", color:"var(--txt)", borderRadius:10, padding:"10px 12px", fontSize:11, fontFamily:"ui-monospace,monospace", lineHeight:1.4 }}/>
              <p style={{ fontSize:11.5, color:"var(--muted)", margin:"9px 0 10px", lineHeight:1.45 }}>
                Es la que sacaste con <b style={{ color:"var(--txt)" }}>Ajustes → Copia de seguridad</b>. Si la tuya está en la nube, entra primero con tu cuenta: se descifra con tu contraseña.
              </p>
              <button className="fh-btn" onClick={async()=>{
                setCargando(true);
                const r = await onRestaurarTexto(textoCopia);
                setCargando(false);
                setMsg({ ok:r.ok, t:r.ok ? "Progreso restaurado en este móvil." : r.msg });
                if(r.ok){ setTextoCopia(""); setPegandoCopia(false); }
              }} disabled={cargando || !textoCopia.trim()}
                style={{ width:"100%", background:textoCopia.trim()?"var(--gold)":"var(--card2)", color:textoCopia.trim()?"#0F131A":"var(--faint)", padding:12, fontSize:13 }}>
                {cargando ? "Restaurando…" : "Restaurar este progreso"}
              </button>
            </div>
          )}
          {msg && msg.ok && (
            <div className="fh-card" style={{ padding:13, marginTop:10, borderColor:"var(--jade)", display:"flex", gap:10, alignItems:"flex-start" }}>
              <Check size={15} color="var(--jade)" style={{ flexShrink:0, marginTop:1 }}/>
              <div style={{ fontSize:12, color:"var(--muted)", lineHeight:1.45 }}>{msg.t}</div>
            </div>
          )}
        </>
      )}

      <p style={{ fontSize:11.5, color:"var(--faint)", textAlign:"center", marginTop:14, lineHeight:1.55 }}>
        {arranque ? "Sin cuenta la app funciona entera: solo te pierdes la parte de amigos."
                  : "Tu progreso actual no se pierde al crear la cuenta: sigue en el móvil."}
      </p>
    </div>
  );

  /* --- Con sesión: perfil + leaderboard --- */
  const yo = perfil?.handle;
  return (
    <div className={embebido ? "" : "fh-in"}>
      {!embebido && (
      <header style={{ padding:"22px 2px 8px", display:"flex", alignItems:"center", gap:10 }}>
        <button onClick={()=>setTab("home")} aria-label="Volver" style={{ background:"var(--card)", border:"1px solid var(--line)", borderRadius:10, width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"var(--muted)", flexShrink:0 }}><ChevronLeft size={18}/></button>
        <div style={{ flex:1, minWidth:0 }}>
          <h1 style={{ margin:0, fontSize:22 }}>Cuenta</h1>
          <p style={{ margin:"3px 0 0", fontSize:13, color:"var(--muted)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            {perfil ? <>@{perfil.handle}</> : "Preparando tu perfil…"}
          </p>
        </div>
      </header>
      )}

      {perfil && (
        <div className="fh-card fh-framed" style={{ padding:16, display:"flex", alignItems:"center", gap:14 }}>
          <div style={{ width:52, height:52, borderRadius:14, background:"var(--bg2)", border:"1px solid var(--line2)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <User size={24} color="var(--gold)"/>
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div className="disp" style={{ fontWeight:700, fontSize:16 }}>{perfil.display_name || perfil.handle}</div>
            <button onClick={()=>{ setEditandoHandle(v=>!v); setHandleNuevo(perfil.handle); setMsg(null); }}
              style={{ background:"none", border:"none", padding:0, marginTop:2, cursor:"pointer", display:"flex", alignItems:"center", gap:5 }}>
              <span className="mono" style={{ fontSize:11.5, color:"var(--muted)" }}>@{perfil.handle}</span>
              <Pencil size={11} color="var(--faint)"/>
            </button>
            <div style={{ fontSize:11.5, color:"var(--faint)", marginTop:5 }}>
              Nivel {perfil.level} · {perfil.xp} XP · {perfil.total_workouts} entrenos
            </div>
          </div>
        </div>
      )}

      {editandoHandle && (
        <div className="fh-card fh-in" style={{ padding:16, marginTop:10 }}>
          <div style={{ fontSize:12, color:"var(--muted)", fontWeight:600, marginBottom:6 }}>Nombre de usuario</div>
          <input value={handleNuevo} maxLength={20} autoCapitalize="none" autoCorrect="off"
            onChange={e=>{ setHandleNuevo(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g,"")); setMsg(null); }}
            aria-label="Nuevo nombre de usuario"
            style={{ textAlign:"left", fontFamily:"'JetBrains Mono',monospace" }}/>
          <div style={{ fontSize:11.5, color:"var(--faint)", margin:"7px 2px 0", lineHeight:1.45 }}>
            Es como te ven tus amigos. Único para todo el grupo, 3-20 caracteres.
          </div>
          <div style={{ display:"flex", gap:8, marginTop:12 }}>
            <button className="fh-btn" onClick={()=>setEditandoHandle(false)}
              style={{ flex:1, background:"var(--card2)", color:"var(--muted)", border:"1px solid var(--line2)", padding:11, fontSize:12.5 }}>Cancelar</button>
            <button className="fh-btn" onClick={async()=>{
              const r = await onCambiarHandle(handleNuevo);
              if(r.ok) setEditandoHandle(false); else setMsg({ ok:false, t:r.msg });
            }} disabled={handleNuevo.length < 3 || handleNuevo === perfil.handle}
              style={{ flex:1.3, background:"var(--gold)", padding:11, fontSize:12.5, opacity:(handleNuevo.length<3||handleNuevo===perfil.handle)?.6:1 }}>Guardar</button>
          </div>
        </div>
      )}


      {msg && !msg.ok && (
        <div className="fh-card" style={{ padding:13, marginTop:12, borderColor:"var(--ember)", display:"flex", gap:10, alignItems:"flex-start" }}>
          <Info size={15} color="var(--ember)" style={{ flexShrink:0, marginTop:1 }}/>
          <div style={{ fontSize:12, color:"var(--muted)", lineHeight:1.45 }}>{msg.t}</div>
        </div>
      )}

      <div style={sectionTitle}>SESIÓN</div>
      <div className="fh-card" style={{ padding:16 }}>
        <div style={{ fontSize:12, color:"var(--muted)", lineHeight:1.5, marginBottom:12 }}>
          Al salir, tu progreso <b style={{ color:"var(--txt)" }}>se queda en este móvil</b>. Puedes volver a entrar cuando quieras.
        </div>
        <button className="fh-btn" onClick={onSalir}
          style={{ width:"100%", background:"var(--card2)", color:"var(--muted)", border:"1px solid var(--line2)", padding:12, fontSize:13 }}>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

/* Aviso de versión nueva: el APK se reparte a mano, así que la app avisa ella. */
/* Barra de la versión alt: iconos normales, sin sprites ni la cara del héroe. */
const NAV_ALT = [
  { id:"home",     icon:Home,       label:"Inicio" },
  { id:"rutinas",  icon:Dumbbell,   label:"Rutinas" },
  { id:"progreso", icon:TrendingUp, label:"Progreso" },
  { id:"amigos",   icon:Users,      label:"Amigos" },
];

/* El resumen quincenal que escribe Claude (scripts/resumen-quincenal.mjs). Llega como
   texto plano: los títulos van en una línea en MAYÚSCULAS y las listas con "- ".
   Plegado de entrada para no empujar Inicio entero hacia abajo. */
function TextoResumen({ texto, abiertoDeEntrada=false }){
  const [abierto, setAbierto] = useState(abiertoDeEntrada);
  const lineas = texto.split(/\r?\n/);
  const visibles = abierto ? lineas : lineas.slice(0, 5);
  const esTitulo = l => l.length > 3 && l.length < 60 && l === l.toUpperCase() && /[A-ZÁÉÍÓÚÑ]/.test(l);
  return (<>
    <div style={{ fontSize:12.5, lineHeight:1.55, color:"var(--txt)" }}>
      {visibles.map((l,i)=> !l.trim() ? <div key={i} style={{ height:6 }}/>
        : esTitulo(l.trim()) ? <div key={i} style={{ fontSize:11, fontWeight:700, letterSpacing:".08em", color:"var(--violet)", marginTop:i?8:0 }}>{l.trim()}</div>
        : <div key={i} style={l.startsWith("- ") ? { paddingLeft:12, textIndent:-10 } : undefined}>{l.startsWith("- ") ? "· "+l.slice(2) : l}</div>)}
    </div>
    {lineas.length > 5 && (
      <button onClick={()=>setAbierto(a=>!a)} style={{ background:"none", border:"none", padding:"8px 0 0", color:"var(--violet)", cursor:"pointer", font:"inherit", fontSize:12.5, display:"flex", alignItems:"center", gap:4 }}>
        {abierto ? "Plegar" : "Leer entero"} <ChevronDown size={14} style={{ transform:abierto ? "rotate(180deg)" : "none" }}/>
      </button>
    )}
  </>);
}
const AVISO_RESUMEN_IA = "Lo escribe una IA (Claude) a partir de tus entrenos. Orientativo: no sustituye a un profesional.";

function ResumenCard({ resumen, onCerrar, onVerTodos }){
  if(!resumen) return null;
  return (
    <div className="fh-card fh-in" style={{ padding:16, margin:"0 0 12px", borderColor:"var(--violet)" }}>
      <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:8 }}>
        <Sparkles size={16} color="var(--violet)" style={{ flexShrink:0 }}/>
        <div style={{ flex:1, minWidth:0 }}>
          <div className="disp" style={{ fontSize:16, lineHeight:1.2 }}>Tus dos semanas</div>
          <div style={{ fontSize:11, color:"var(--faint)" }}>Del {fechaCorta(resumen.desde)} al {fechaCorta(resumen.hasta)}</div>
        </div>
        <button onClick={onCerrar} aria-label="Cerrar el resumen" style={{ background:"none", border:"none", padding:2, cursor:"pointer", color:"var(--faint)", flexShrink:0 }}><X size={15}/></button>
      </div>
      <TextoResumen texto={resumen.texto}/>
      <div style={{ display:"flex", alignItems:"flex-end", gap:10, marginTop:8 }}>
        <div style={{ flex:1, fontSize:10.5, color:"var(--faint)", lineHeight:1.4 }}>{AVISO_RESUMEN_IA}</div>
        {onVerTodos && <button onClick={onVerTodos} style={{ background:"none", border:"none", padding:0, color:"var(--violet)", cursor:"pointer", font:"inherit", fontSize:12, flexShrink:0 }}>Anteriores</button>}
      </div>
    </div>
  );
}

/* Histórico de resúmenes (tab==="resumenes"). Se leen de la nube cada vez que se
   abre: son pocos y así no hay copia local que se quede vieja. Se entra desde
   Progreso y desde la tarjeta de Inicio; se sale con el botón de volver. */
function ResumenesView({ onVolver }){
  const [lista, setLista] = useState(null);      // null mientras carga
  const [fallo, setFallo] = useState(null);
  useEffect(()=>{
    let vivo = true;
    cloud.listarResumenes().then(r=>{ if(!vivo) return; if(r.ok) setLista(r.resumenes); else { setFallo(r.msg || "No se han podido cargar."); setLista([]); } });
    return ()=>{ vivo = false; };
  }, []);
  return (
    <div className="fh-in" style={{ paddingBottom:24 }}>
      <header style={{ padding:"22px 2px 12px", display:"flex", alignItems:"center", gap:10 }}>
        <button onClick={onVolver} aria-label="Volver"
          style={{ background:"var(--card)", border:"1px solid var(--line)", borderRadius:10, width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"var(--muted)", flexShrink:0 }}><ChevronLeft size={18}/></button>
        <div style={{ minWidth:0 }}>
          <h1 style={{ margin:0, fontSize:22 }}>Informe quincenal</h1>
          <p style={{ margin:"4px 0 0", fontSize:13, color:"var(--muted)" }}>Lo escribe Claude cada dos semanas. Aquí están todos.</p>
        </div>
      </header>
      {lista === null && <div style={{ fontSize:13, color:"var(--muted)", padding:"12px 2px" }}>Cargando…</div>}
      {fallo && <div className="fh-card" style={{ padding:14, fontSize:12.5, color:"var(--muted)" }}>{fallo}</div>}
      {lista && !fallo && !lista.length && (
        <div className="fh-card" style={{ padding:16, fontSize:12.5, color:"var(--muted)", lineHeight:1.5 }}>
          Todavía no tienes ninguno. Se activan en <b>Ajustes → Privacidad</b> y llegan cada dos semanas si has entrenado.
        </div>
      )}
      {(lista||[]).map((r,i)=>(
        <div key={r.id} className="fh-card" style={{ padding:16, marginBottom:12, borderColor:i ? undefined : "var(--violet)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
            <Sparkles size={14} color="var(--violet)" style={{ flexShrink:0 }}/>
            <div className="disp" style={{ fontSize:15, flex:1 }}>Del {fechaCorta(r.desde)} al {fechaCorta(r.hasta)}</div>
            {i===0 && <span className="fh-chip" style={{ fontSize:10 }}>ÚLTIMO</span>}
          </div>
          <TextoResumen texto={r.texto} abiertoDeEntrada={i===0}/>
        </div>
      ))}
      {lista && lista.length > 0 && <div style={{ fontSize:10.5, color:"var(--faint)", lineHeight:1.4, padding:"0 2px" }}>{AVISO_RESUMEN_IA}</div>}
    </div>
  );
}

function UpdateBanner({ info, onClose }){
  if (!info) return null;
  if (info.cambio) return (
    <div className="fh-card" style={{ padding:14, margin:"0 0 12px", borderColor:"var(--sky)", display:"flex", gap:11, alignItems:"flex-start" }}>
      <GitBranch size={18} color="var(--sky)" style={{ flexShrink:0, marginTop:1 }}/>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:12.5, color:"var(--txt)", lineHeight:1.45 }}>
          Has elegido la versión <b>{info.canal==="alt" ? "sin juego" : "RPG"}</b> ({info.version_name}). Instálala encima de esta: conservas todo tu progreso.
        </div>
        <a href={info.download_url} target="_blank" rel="noopener noreferrer" className="fh-btn"
          style={{ display:"inline-flex", alignItems:"center", gap:6, marginTop:9, background:"var(--sky)", color:"#0F131A", padding:"9px 14px", fontSize:12.5, textDecoration:"none" }}>
          <Download size={14}/> Descargar
        </a>
      </div>
      <button onClick={onClose} aria-label="Cerrar" style={{ background:"none", border:"none", padding:2, cursor:"pointer", color:"var(--faint)", flexShrink:0 }}><X size={15}/></button>
    </div>
  );
  return (
    <div className="fh-card" style={{ padding:14, margin:"0 0 12px", borderColor:"var(--sky)", display:"flex", gap:11, alignItems:"flex-start" }}>
      <Download size={18} color="var(--sky)" style={{ flexShrink:0, marginTop:1 }}/>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:12.5, color:"var(--txt)", lineHeight:1.45 }}>
          Hay una versión nueva: <b>{info.version_name}</b>{info.notes ? <> · {info.notes}</> : null}
        </div>
        <a href={info.download_url} target="_blank" rel="noopener noreferrer" className="fh-btn"
          style={{ display:"inline-flex", alignItems:"center", gap:6, marginTop:9, background:"var(--sky)", color:"#0F131A", padding:"9px 14px", fontSize:12.5, textDecoration:"none" }}>
          <Download size={14}/> Descargar
        </a>
      </div>
      {!info.mandatory && (
        <button onClick={onClose} aria-label="Cerrar" style={{ background:"none", border:"none", padding:2, cursor:"pointer", color:"var(--faint)", flexShrink:0 }}><X size={15}/></button>
      )}
    </div>
  );
}

/* Ajustes por PESTAÑAS. De un tirón eran diez secciones seguidas y llegar a
   los recordatorios exigía bajar media pantalla. La cuenta es una pestaña más:
   se configura una vez y no se vuelve a tocar, así que no merecía un botón fijo
   en la cabecera de Inicio (ese sitio es ahora de los amigos).
   La fila de pestañas se desliza en horizontal: en 480px no caben seis. */
const SETTINGS_TABS = [
  { id:"perfil",     label:"Perfil",     icon:User },
  { id:"entreno",    label:"Entreno",    icon:Dumbbell },
  { id:"avisos",     label:"Avisos",     icon:Bell },
  { id:"cuenta",     label:"Cuenta",     icon:Users },
  { id:"copias",     label:"Copias",     icon:Cloud },
  { id:"privacidad", label:"Privacidad", icon:Lock },
];

function SettingsView({ state, log, updateProfile, setReminders, setSub, setCycle, setTab, theme, setTheme, sonido, setSonido, resetProgress, exportBackup, importBackup, setVacaciones, terminarVacaciones, cloudEnabled, perfil, session, level, onEntrar, onRegistrar, onVerificar, onSalir, onCambiarHandle, canal, setCanal, setResumenIA }){
  const [sec, setSec] = useState("perfil");
  const [msgCanal, setMsgCanal] = useState(null);
  const [msgIA, setMsgIA] = useState(null);
  const p = state.profile || {};
  const rem = state.reminders || { enabled:false, hour:19, minute:0, days:[1,3,5] };
  const sub = state.sub || { enabled:false, renewalDay:1, price:"" };
  const cyc = state.cycle || { enabled:false, lastPeriodStart:null, cycleLength:28, periodLength:5 };
  const cycPhase = cyclePhaseFor(cyc, todayISO());
  const [confirmReset, setConfirmReset] = useState(false);
  const [backupText, setBackupText] = useState("");
  const [restoreOpen, setRestoreOpen] = useState(false);
  const [restoreText, setRestoreText] = useState("");
  const [backupMsg, setBackupMsg] = useState(null);
  const vacHoy = vacacionDeHoy(state.vacations);
  const [vacF, setVacF] = useState(()=>({ from: todayISO(), to: addDaysISO(todayISO(), 7) }));

  async function makeBackup(){
    setRestoreOpen(false); setBackupMsg(null);
    setBackupText(await exportBackup());
  }
  async function copyBackup(){
    // En el APK la app se sirve por https://localhost, así que el portapapeles está disponible.
    try { await navigator.clipboard.writeText(backupText); setBackupMsg({ ok:true, msg:"Copia copiada al portapapeles." }); }
    catch { setBackupMsg({ ok:false, msg:"No se ha podido copiar. Selecciona el texto y cópialo a mano." }); }
  }
  function downloadBackup(){
    // Funciona en navegador; en el WebView de Android puede no hacer nada (usa "Copiar").
    try {
      const url = URL.createObjectURL(new Blob([backupText], { type:"application/json" }));
      const a = document.createElement("a");
      a.href = url; a.download = `rpgym-${todayISO()}.json`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(()=>URL.revokeObjectURL(url), 2000);
    } catch { setBackupMsg({ ok:false, msg:"Aquí no se puede descargar. Usa \"Copiar al portapapeles\"." }); }
  }
  async function doRestore(){
    const r = await importBackup(restoreText);
    setBackupMsg(r);
    if (r.ok) { setRestoreText(""); setRestoreOpen(false); }
  }
  function toggleCycle(){
    if(!cyc.enabled) setCycle({ enabled:true, lastPeriodStart: cyc.lastPeriodStart || todayISO() });
    else setCycle({ enabled:false });
  }

  const DAY_LABELS = [["L",1],["M",2],["X",3],["J",4],["V",5],["S",6],["D",0]];
  const label = { padding:"0 2px 6px", fontSize:12, color:"var(--muted)", fontWeight:600 };
  const sectionTitle = { fontSize:12, fontWeight:700, letterSpacing:".08em", color:"var(--faint)", margin:"18px 4px 8px" };

  async function toggleReminders(){
    if (!rem.enabled) { const ok = await ensureNotifPerm(); if (!ok) { /* seguimos igualmente; el aviso solo va en APK */ } }
    setReminders({ ...rem, enabled: !rem.enabled });
  }
  function toggleDay(d){
    const set = new Set(rem.days || []);
    set.has(d) ? set.delete(d) : set.add(d);
    setReminders({ ...rem, days: [...set].sort((a,b)=>a-b) });
  }

  const nextR = sub.renewalDay ? nextRenewalDate(sub.renewalDay) : null;

  return (
    <div className="fh-in">
      <header style={{ padding:"22px 2px 8px", display:"flex", alignItems:"center", gap:10 }}>
        <button onClick={()=>setTab("home")} aria-label="Volver" style={{ background:"var(--card)", border:"1px solid var(--line)", borderRadius:10, width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"var(--muted)" }}><ChevronRight size={18} style={{ transform:"rotate(180deg)" }}/></button>
        <div>
          <h1 style={{ margin:0, fontSize:22 }}>Ajustes</h1>
          <p style={{ margin:"3px 0 0", fontSize:13, color:"var(--muted)" }}>{SETTINGS_TABS.find(t=>t.id===sec)?.label}</p>
        </div>
      </header>

      <FilaPestanas tabs={SETTINGS_TABS} activa={sec} onCambia={setSec}/>

      {sec==="perfil" && (<>
      {/* --- Apariencia --- */}
      <div style={sectionTitle}>APARIENCIA</div>
      <div className="fh-card" style={{ padding:16 }}>
        <div style={{ display:"flex", alignItems:"center", gap:9, fontSize:14, marginBottom:12 }}><Palette size={16} color="var(--gold)"/> Tema</div>
        <div style={{ display:"flex", gap:8 }}>
          {[{ id:"dark", label:"Oscuro", icon:Moon }, { id:"light", label:"Claro", icon:Sun }].map(t=>{
            const on = theme === t.id; const I = t.icon;
            return (
              <button key={t.id} onClick={()=>setTheme(t.id)} className="fh-btn"
                style={{ flex:1, background:on?"var(--gold)":"var(--card2)", color:on?"#0F131A":"var(--muted)", border:`1px solid ${on?"var(--gold)":"var(--line2)"}`, padding:"12px", display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}>
                <I size={16}/> {t.label}
              </button>
            );
          })}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:9, fontSize:14, marginTop:14, paddingTop:12, borderTop:"1px solid var(--line)" }}>
          <Volume2 size={16} color="var(--gold)"/>
          <div style={{ flex:1 }}>{ALT ? "Sonidos" : "Sonidos del juego"}<div style={{ fontSize:11.5, color:"var(--muted)", marginTop:2 }}>No cortan la música que lleves puesta.</div></div>
          <ToggleSwitch on={sonido} onClick={()=>setSonido(!sonido)}/>
        </div>
      </div>

      {/* --- Versión de la app (canal de actualizaciones) --- */}
      <div style={sectionTitle}>VERSIÓN DE LA APP</div>
      <div className="fh-card" style={{ padding:16 }}>
        <div style={{ display:"flex", alignItems:"center", gap:9, fontSize:14, marginBottom:6 }}><GitBranch size={16} color="var(--gold)"/> Qué versión quieres recibir</div>
        <p style={{ fontSize:12, color:"var(--muted)", margin:"0 0 12px", lineHeight:1.5 }}>
          Las dos son la misma app con los mismos datos. La <b style={{ color:"var(--txt)" }}>sin juego</b> quita la mazmorra, el héroe,
          la XP y el aspecto pixel: solo entrenos, rutinas y progreso. Puedes cambiar cuando quieras sin perder nada.
        </p>
        <div style={{ display:"flex", gap:8 }}>
          {[{ id:"rpg", label:"RPG" }, { id:"alt", label:"Sin juego" }].map(c=>{
            const on = canal === c.id;
            return (
              <button key={c.id} className="fh-btn" disabled={!cloudEnabled}
                onClick={async()=>{ setMsgCanal(null); const r = await setCanal(c.id);
                  setMsgCanal(c.id === CANAL_BUILD ? null : r.ok && r.hayNueva ? "Listo: en Inicio tienes el botón para descargarla." : r.ok ? "Aún no hay una versión publicada en ese canal. Te avisaremos en cuanto la haya." : "No se ha podido comprobar ahora. Lo intentará al abrir la app."); }}
                style={{ flex:1, background:on?"var(--gold)":"var(--card2)", color:on?"#0F131A":"var(--muted)", border:`1px solid ${on?"var(--gold)":"var(--line2)"}`, padding:12 }}>
                {c.label}{c.id === CANAL_BUILD ? " · instalada" : ""}
              </button>
            );
          })}
        </div>
        {!cloudEnabled && <div style={{ fontSize:11.5, color:"var(--faint)", marginTop:8 }}>Necesita conexión con la nube para saber qué hay publicado.</div>}
        {msgCanal && <div style={{ fontSize:12, color:"var(--sky)", marginTop:9, lineHeight:1.45 }}>{msgCanal}</div>}
      </div>

      {/* --- Perfil --- */}
      <div style={sectionTitle}>MI PERFIL</div>
      <div className="fh-card" style={{ padding:16 }}>
        <div style={label}>Nombre</div>
        <input value={p.name || ""} onChange={e=>updateProfile({ name:e.target.value })} placeholder="Tu nombre" style={{ textAlign:"left" }}/>
        <div style={{ display:"flex", gap:10, marginTop:12 }}>
          <div style={{ flex:1 }}><div style={label}>Edad</div>
            <input inputMode="numeric" value={p.age ?? ""} onChange={e=>updateProfile({ age:Number(e.target.value.replace(/\D/g,""))||null })} placeholder="—"/></div>
          <div style={{ flex:1.4 }}><div style={label}>Género</div>
            <select value={p.sex || "no_especificado"} onChange={e=>updateProfile({ sex:e.target.value })}>
              <option value="hombre">Hombre</option>
              <option value="mujer">Mujer</option>
              <option value="no_especificado">Prefiero no indicarlo</option>
            </select></div>
        </div>
        <div style={{ display:"flex", gap:10, marginTop:12 }}>
          <div style={{ flex:1 }}><div style={label}>Peso (kg)</div>
            <input inputMode="decimal" value={p.weightKg ?? ""} onChange={e=>updateProfile({ weightKg:Number(e.target.value)||0 })} placeholder="—"/></div>
          <div style={{ flex:1 }}><div style={label}>Altura (cm)</div>
            <input inputMode="numeric" value={p.heightCm ?? ""} onChange={e=>updateProfile({ heightCm:Number(e.target.value)||0 })} placeholder="—"/></div>
        </div>
      </div>

      {/* --- Experiencia y objetivo --- */}
      <div style={sectionTitle}>EXPERIENCIA Y OBJETIVO</div>
      <div className="fh-card" style={{ padding:16 }}>
        <div style={label}>Nivel de experiencia</div>
        <select value={p.experience || "principiante"} onChange={e=>updateProfile({ experience:e.target.value })}>
          {EXPERIENCE_LEVELS.map(x=><option key={x.id} value={x.id}>{x.label}</option>)}
        </select>
        <div style={{ fontSize:11.5, color:"var(--faint)", margin:"7px 2px 0", lineHeight:1.4 }}>{(EXPERIENCE_LEVELS.find(x=>x.id===(p.experience||"principiante"))||{}).desc} Determina qué rutinas ves.</div>
        <div style={{ ...label, marginTop:14 }}>Objetivo</div>
        <select value={p.goal || "iniciarse"} onChange={e=>updateProfile({ goal:e.target.value })}>
          {GOALS.map(g=><option key={g.id} value={g.id}>{g.label}</option>)}
        </select>
      </div>

      {/* --- Ciclo menstrual (solo perfil femenino, opt-in) --- */}
      {p.sex === "mujer" && (<>
        <div style={sectionTitle}>CICLO MENSTRUAL</div>
        <div className="fh-card" style={{ padding:16 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10 }}>
            <span style={{ display:"flex", alignItems:"center", gap:9, fontSize:14 }}><Heart size={16} color="#E56B9F"/> Ajustar entreno y dieta a mi ciclo</span>
            <ToggleSwitch on={cyc.enabled} onClick={toggleCycle}/>
          </div>
          <div style={{ marginTop:10, fontSize:11.5, color:"var(--faint)", lineHeight:1.5 }}>
            Adaptamos la intensidad sugerida y los consejos de dieta a tu fase del ciclo. Es orientación general de bienestar, <b style={{ color:"var(--muted)" }}>no consejo médico</b>. Tus datos se guardan <b style={{ color:"var(--muted)" }}>solo en tu dispositivo</b>.
          </div>

          {cyc.enabled && (<>
            <div style={{ marginTop:16, paddingTop:14, borderTop:"1px solid var(--line)" }}>
              {cycPhase && (
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
                  <div style={{ width:10, height:10, borderRadius:99, background:cycPhase.color, flexShrink:0 }}/>
                  <div style={{ fontSize:13 }}>Hoy: <b style={{ color:cycPhase.color }}>{cycPhase.label}</b> · día {cycPhase.day} de {cycPhase.len}</div>
                </div>
              )}
              <div style={label}>¿Cuándo te bajó por última vez?</div>
              <input type="date" value={cyc.lastPeriodStart || ""} max={todayISO()} onChange={e=>setCycle({ lastPeriodStart:e.target.value })} style={{ textAlign:"left" }}/>
              <div style={{ display:"flex", gap:8, marginTop:10 }}>
                <button className="fh-btn" onClick={()=>setCycle({ lastPeriodStart: todayISO() })} style={{ flex:1, background:"rgba(229,107,159,.14)", color:"#E56B9F", border:"1px solid #E56B9F", padding:"11px", fontSize:12.5 }}>Me ha bajado hoy</button>
                <button className="fh-btn" onClick={()=>setCycle({ lastPeriodStart: addDaysISO(cyc.lastPeriodStart||todayISO(), -1) })} aria-label="Un día antes" style={{ width:46, background:"var(--card2)", color:"var(--muted)", border:"1px solid var(--line2)", padding:0, fontWeight:700 }}>−1d</button>
                <button className="fh-btn" onClick={()=>{ const nx=addDaysISO(cyc.lastPeriodStart||todayISO(), 1); if(nx<=todayISO()) setCycle({ lastPeriodStart:nx }); }} aria-label="Un día después" style={{ width:46, background:"var(--card2)", color:"var(--muted)", border:"1px solid var(--line2)", padding:0, fontWeight:700 }}>+1d</button>
              </div>
              <div style={{ fontSize:11, color:"var(--faint)", marginTop:8, lineHeight:1.4 }}>Si te ha bajado antes o después de lo previsto, ajústalo aquí para recalcular tus fases.</div>

              <div style={{ display:"flex", gap:10, marginTop:14 }}>
                <div style={{ flex:1 }}><div style={label}>Duración del ciclo</div>
                  <select value={cyc.cycleLength||28} onChange={e=>setCycle({ cycleLength:Number(e.target.value) })}>
                    {Array.from({ length:20 }, (_,i)=>i+21).map(n=><option key={n} value={n}>{n} días</option>)}
                  </select></div>
                <div style={{ flex:1 }}><div style={label}>Días de regla</div>
                  <select value={cyc.periodLength||5} onChange={e=>setCycle({ periodLength:Number(e.target.value) })}>
                    {Array.from({ length:9 }, (_,i)=>i+2).map(n=><option key={n} value={n}>{n} días</option>)}
                  </select></div>
              </div>
            </div>
          </>)}
        </div>
      </>)}

      </>)}

      {sec==="entreno" && (<>
      {/* --- Días de entrenamiento (siempre editable; definen la racha) --- */}
      <div style={sectionTitle}>DÍAS DE ENTRENAMIENTO</div>
      <div className="fh-card" style={{ padding:16 }}>
        <div style={{ display:"flex", gap:6, justifyContent:"space-between" }}>
          {DAY_LABELS.map(([lbl,d])=>{
            const on = (rem.days || []).includes(d);
            return <button key={d} onClick={()=>toggleDay(d)} className="fh-btn" style={{ flex:1, aspectRatio:"1", background:on?"var(--gold)":"var(--card2)", color:on?"#0F131A":"var(--muted)", border:`1px solid ${on?"var(--gold)":"var(--line2)"}`, padding:0, fontWeight:700 }}>{lbl}</button>;
          })}
        </div>
        <div style={{ fontSize:11.5, color:"var(--faint)", marginTop:11, lineHeight:1.45 }}>
          Marca los días que planeas entrenar ({(rem.days||[]).length}/semana). Los demás son <b style={{ color:"var(--muted)" }}>descanso</b> y no rompen tu racha.
          {(rem.days||[]).length>0
            ? <> Ese número es también tu <b style={{ color:"var(--muted)" }}>objetivo semanal</b> en Inicio.</>
            : <> Sin ningún día marcado la app usa <b style={{ color:"var(--muted)" }}>L · X · V</b> por defecto.</>}
        </div>
      </div>

      {/* --- Vacaciones --- */}
      <div style={sectionTitle}>VACACIONES</div>
      <div className="fh-card" style={{ padding:16, borderColor: vacHoy ? "var(--sky)" : undefined }}>
        <div style={{ display:"flex", alignItems:"center", gap:9, fontSize:14, marginBottom:6 }}>
          <Palmtree size={16} color="var(--sky)"/> {vacHoy ? "Estás de vacaciones" : "Me voy unos días"}
        </div>
        {vacHoy ? (<>
          <p style={{ fontSize:12.5, color:"var(--muted)", margin:"0 0 12px", lineHeight:1.5 }}>
            Hasta el <b style={{ color:"var(--txt)" }}>{parseISO(vacHoy.to).getDate()} de {MONTHS_ES[parseISO(vacHoy.to).getMonth()].toLowerCase()}</b>.
            Esos días no cuentan como sesiones perdidas, la racha no se rompe y no se te avisa de entrenar.
          </p>
          <button className="fh-btn" onClick={terminarVacaciones}
            style={{ width:"100%", background:"var(--card2)", color:"var(--txt)", border:"1px solid var(--line2)", padding:12, fontSize:13, display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}>
            <Flame size={15} color="var(--ember)"/> He vuelto, retomar el plan
          </button>
        </>) : (<>
          <p style={{ fontSize:12.5, color:"var(--muted)", margin:"0 0 12px", lineHeight:1.5 }}>
            Un viaje, una lesión o una semana imposible. Esos días <b style={{ color:"var(--txt)" }}>no se prevé ninguna sesión</b>:
            la racha te espera intacta y los recordatorios se callan. Volver con ganas vale más que arrastrar una racha rota.
          </p>
          <div style={{ display:"flex", gap:10 }}>
            <div style={{ flex:1 }}><div style={label}>Desde</div>
              <input type="date" value={vacF.from} onChange={e=>setVacF(v=>({ ...v, from:e.target.value }))}/></div>
            <div style={{ flex:1 }}><div style={label}>Hasta</div>
              <input type="date" value={vacF.to} min={vacF.from} onChange={e=>setVacF(v=>({ ...v, to:e.target.value }))}/></div>
          </div>
          <button className="fh-btn" onClick={()=>setVacaciones({ from:vacF.from, to:vacF.to })}
            disabled={!vacF.from || !vacF.to || vacF.to < vacF.from}
            style={{ width:"100%", marginTop:12, background:"var(--sky)", padding:12, fontSize:13, opacity:(!vacF.from||!vacF.to||vacF.to<vacF.from)?.6:1, display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}>
            <Palmtree size={15}/> Marcar estos días como vacaciones
          </button>
        </>)}
      </div>

      {/* --- Suscripción del gym --- */}
      <div style={sectionTitle}>SUSCRIPCIÓN DEL GYM</div>
      <div className="fh-card" style={{ padding:16 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10 }}>
          <span style={{ display:"flex", alignItems:"center", gap:9, fontSize:14 }}><CreditCard size={16} color="var(--ember)"/> Avisarme antes de la renovación</span>
          <ToggleSwitch on={sub.enabled} onClick={()=>setSub({ ...sub, enabled: !sub.enabled })}/>
        </div>
        {sub.enabled && (
          <>
            <div style={{ display:"flex", gap:10, marginTop:14 }}>
              <div style={{ flex:1 }}><div style={label}>Día de renovación</div>
                <select value={sub.renewalDay} onChange={e=>setSub({ ...sub, renewalDay:Number(e.target.value) })}>
                  {Array.from({ length:31 }, (_,i)=><option key={i+1} value={i+1}>{i+1}</option>)}
                </select></div>
              <div style={{ flex:1 }}><div style={label}>Precio (opcional)</div>
                <input inputMode="decimal" value={sub.price} onChange={e=>setSub({ ...sub, price:e.target.value })} placeholder="€"/></div>
            </div>
            {nextR && (
              <div style={{ marginTop:14, fontSize:12.5, color:"var(--muted)", lineHeight:1.45 }}>
                Próxima renovación: <b style={{ color:"var(--txt)" }}>{nextR.slice(8,10)}/{nextR.slice(5,7)}/{nextR.slice(0,4)}</b> · faltan <b style={{ color:"var(--ember)" }}>{daysUntil(nextR)} día{daysUntil(nextR)===1?"":"s"}</b>.
              </div>
            )}
          </>
        )}
      </div>

      </>)}

      {sec==="avisos" && (<>
      {/* --- Recordatorios --- */}
      <div style={sectionTitle}>RECORDATORIOS DE ENTRENAMIENTO</div>
      <div className="fh-card" style={{ padding:16 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10 }}>
          <span style={{ display:"flex", alignItems:"center", gap:9, fontSize:14 }}><Bell size={16} color="var(--gold)"/> Avisarme para entrenar</span>
          <ToggleSwitch on={rem.enabled} onClick={toggleReminders}/>
        </div>
        {rem.enabled && (
          <>
            <div style={{ display:"flex", gap:10, marginTop:14 }}>
              <div style={{ flex:1 }}><div style={label}>Hora</div>
                <select value={rem.hour} onChange={e=>setReminders({ ...rem, hour:Number(e.target.value) })}>
                  {Array.from({ length:24 }, (_,h)=><option key={h} value={h}>{String(h).padStart(2,"0")}</option>)}
                </select></div>
              <div style={{ flex:1 }}><div style={label}>Minuto</div>
                <select value={rem.minute} onChange={e=>setReminders({ ...rem, minute:Number(e.target.value) })}>
                  {[0,15,30,45].map(m=><option key={m} value={m}>{String(m).padStart(2,"0")}</option>)}
                </select></div>
            </div>
            <div style={{ fontSize:11.5, color:"var(--faint)", marginTop:12, lineHeight:1.45 }}>Te avisaremos a esta hora los días marcados arriba en <b style={{ color:"var(--muted)" }}>Días de entrenamiento</b>.</div>
          </>
        )}
        <div style={{ marginTop:14, fontSize:11.5, color:"var(--faint)", lineHeight:1.45 }}>Los recordatorios en segundo plano solo funcionan en la app instalada (APK), no en el navegador.</div>
      </div>

      </>)}

      {sec==="cuenta" && (<>
      {/* --- Cuenta --- */}
      {!cloudEnabled ? (
        <div className="fh-card" style={{ padding:16 }}>
          <div style={{ display:"flex", alignItems:"center", gap:9, fontSize:14, marginBottom:6 }}><Users size={16} color="var(--faint)"/> Sin conexión configurada</div>
          <p style={{ fontSize:12.5, color:"var(--muted)", margin:0, lineHeight:1.5 }}>
            Esta copia de RPGym va 100% en local: no hay cuenta que crear ni nada que subir.
          </p>
        </div>
      ) : (
        /* La misma pantalla de siempre, sin su cabecera: aquí ya estás dentro
           de Ajustes y una segunda cabecera con su flecha de volver confundía. */
        <AccountView {...{ state, level, setTab, session, perfil, onEntrar, onRegistrar,
          onVerificar, onSalir, onCambiarHandle, embebido:true }}/>
      )}

      </>)}

      {sec==="copias" && (<>
      {/* --- Copia de seguridad --- */}
      <div style={sectionTitle}>COPIA DE SEGURIDAD</div>
      <div className="fh-card" style={{ padding:16 }}>
        <div style={{ display:"flex", alignItems:"center", gap:9, fontSize:14, marginBottom:6 }}><Download size={16} color="var(--jade)"/> Guardar mi progreso</div>
        <p style={{ fontSize:12, color:"var(--muted)", margin:"0 0 12px", lineHeight:1.45 }}>
          Tu progreso se guarda dentro de la app y <b style={{ color:"var(--txt)" }}>se borra si la desinstalas</b>. Haz una copia antes de cambiar de móvil o de instalar una versión nueva desde Google Play.
        </p>
        <div style={{ display:"flex", gap:8 }}>
          <button className="fh-btn" onClick={makeBackup} style={{ flex:1, background:"var(--jade)", padding:12, display:"flex", alignItems:"center", justifyContent:"center", gap:7, fontSize:13 }}>
            <Download size={15}/> Crear copia
          </button>
          <button className="fh-btn" onClick={()=>{ setRestoreOpen(v=>!v); setBackupMsg(null); }} style={{ flex:1, background:"var(--card2)", color:"var(--txt)", border:"1px solid var(--line2)", padding:12, display:"flex", alignItems:"center", justifyContent:"center", gap:7, fontSize:13 }}>
            <Upload size={15}/> Restaurar
          </button>
        </div>

        {backupText && (
          <div className="fh-in" style={{ marginTop:12 }}>
            <div style={label}>Tu copia (guárdala donde quieras)</div>
            <textarea readOnly value={backupText} onFocus={e=>e.target.select()} rows={4}
              style={{ width:"100%", resize:"vertical", background:"var(--bg2)", border:"1px solid var(--line)", color:"var(--muted)", borderRadius:10, padding:"10px 12px", fontSize:11, fontFamily:"ui-monospace,monospace", lineHeight:1.4 }}/>
            <div style={{ display:"flex", gap:8, marginTop:8 }}>
              <button className="fh-btn" onClick={copyBackup} style={{ flex:1, background:"var(--card2)", color:"var(--txt)", border:"1px solid var(--line2)", padding:10, fontSize:12.5 }}>Copiar al portapapeles</button>
              <button className="fh-btn" onClick={downloadBackup} style={{ flex:1, background:"var(--card2)", color:"var(--txt)", border:"1px solid var(--line2)", padding:10, fontSize:12.5 }}>Descargar archivo</button>
            </div>
            <div style={{ fontSize:11.5, color:"var(--faint)", marginTop:9, lineHeight:1.45 }}>Pégala en una nota, en un correo a ti mismo o en tu nube. Para recuperarla, usa <b style={{ color:"var(--muted)" }}>Restaurar</b>.</div>
          </div>
        )}

        {restoreOpen && (
          <div className="fh-in" style={{ marginTop:12 }}>
            <div style={label}>Pega aquí tu copia</div>
            <textarea value={restoreText} onChange={e=>setRestoreText(e.target.value)} rows={4} placeholder='{"app":"rpgym",…}'
              style={{ width:"100%", resize:"vertical", background:"var(--bg2)", border:"1px solid var(--line)", color:"var(--txt)", borderRadius:10, padding:"10px 12px", fontSize:11, fontFamily:"ui-monospace,monospace", lineHeight:1.4 }}/>
            <p style={{ fontSize:11.5, color:"var(--ember)", margin:"9px 0 9px", lineHeight:1.45 }}>Al restaurar se sustituye todo tu progreso actual por el de la copia.</p>
            <button className="fh-btn" onClick={doRestore} disabled={!restoreText.trim()}
              style={{ width:"100%", background:restoreText.trim()?"var(--gold)":"var(--card2)", color:restoreText.trim()?"#0F131A":"var(--faint)", padding:12, fontSize:13 }}>Restaurar este progreso</button>
          </div>
        )}

        {backupMsg && <div style={{ marginTop:11, fontSize:12.5, color:backupMsg.ok?"var(--jade)":"var(--crimson)", lineHeight:1.45 }}>{backupMsg.msg}</div>}
      </div>

      {cloudEnabled && perfil && <CopiaNubePanel exportBackup={exportBackup} importBackup={importBackup} progreso={resumenProgreso(state, log)}/>}

      {/* --- Zona de datos / borrar progreso --- */}
      <div style={sectionTitle}>DATOS</div>
      <div className="fh-card" style={{ padding:16, borderColor:"var(--crimson)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:9, fontSize:14, marginBottom:6 }}><ShieldAlert size={16} color="var(--crimson)"/> Borrar progreso</div>
        <p style={{ fontSize:12, color:"var(--muted)", margin:"0 0 12px", lineHeight:1.45 }}>Elimina <b style={{ color:"var(--txt)" }}>todo</b>: nivel, XP, historial, récords, mediciones y ajustes. Empezarás desde cero con el cuestionario inicial. Esta acción no se puede deshacer.</p>
        {confirmReset ? (
          <div style={{ display:"flex", gap:8 }}>
            <button className="fh-btn" onClick={()=>{ setConfirmReset(false); resetProgress(); }} style={{ flex:1, background:"var(--crimson)", color:"#fff", padding:12 }}>Sí, borrar todo</button>
            <button className="fh-btn" onClick={()=>setConfirmReset(false)} style={{ flex:1, background:"var(--card2)", color:"var(--muted)", border:"1px solid var(--line2)", padding:12 }}>Cancelar</button>
          </div>
        ) : (
          <button className="fh-btn" onClick={()=>setConfirmReset(true)} style={{ width:"100%", background:"transparent", color:"var(--crimson)", border:"1px solid var(--crimson)", padding:12, display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}><X size={16}/> Borrar progreso y empezar de cero</button>
        )}
      </div>

      </>)}

      {sec==="privacidad" && (<>
      {/* --- Privacidad --- */}
      <div style={sectionTitle}>PRIVACIDAD</div>
      <div className="fh-card" style={{ padding:16 }}>
        <div style={{ display:"flex", alignItems:"center", gap:9, fontSize:14, marginBottom:8 }}><Lock size={16} color="var(--jade)"/> Tus datos son tuyos</div>
        <p style={{ fontSize:12.5, color:"var(--muted)", margin:"0 0 10px", lineHeight:1.5 }}>
          Sin cuenta, RPGym <b style={{ color:"var(--txt)" }}>no envía nada a ningún sitio</b>: todo lo que escribes se
          queda en este móvil y la app funciona entera sin conexión. No hay publicidad ni analítica.
        </p>
        <p style={{ fontSize:12.5, color:"var(--muted)", margin:"0 0 10px", lineHeight:1.5 }}>
          Si creas una cuenta (opcional), tus <b style={{ color:"var(--txt)" }}>amigos</b> ven tu progreso: nivel, XP,
          entrenos con sus ejercicios y pesos, tus marcas por ejercicio, tus rutinas y el aspecto de tu héroe. Es lo que permite compararse
          y picarse.
        </p>
        <p style={{ fontSize:12.5, color:"var(--muted)", margin:"0 0 10px", lineHeight:1.5 }}>
          Dos cosas <b style={{ color:"var(--txt)" }}>no salen nunca</b> de este móvil, pase lo que pase:
          los datos del <b style={{ color:"var(--txt)" }}>ciclo menstrual</b> y las rutinas que marques
          como <b style={{ color:"var(--txt)" }}>privadas</b>.
        </p>
        <p style={{ fontSize:11.5, color:"var(--faint)", margin:0, lineHeight:1.5 }}>
          Puedes borrarlo todo cuando quieras desde <b style={{ color:"var(--muted)" }}>Borrar progreso</b>, o desinstalando la app.
        </p>
        {/* Opt-in: apagado por defecto. Con él encendido, el script quincenal pasa a Claude
            lo que ya está en la nube (entrenos y marcas). Nada del ciclo: no está allí. */}
        {cloudEnabled && perfil && (
          <div style={{ marginTop:14, paddingTop:12, borderTop:"1px solid var(--line)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:9, fontSize:14 }}>
              <Sparkles size={16} color="var(--violet)"/>
              <div style={{ flex:1 }}>Resumen quincenal con IA</div>
              <ToggleSwitch on={!!perfil.resumen_ia} onClick={async()=>{ setMsgIA(null); const r = await setResumenIA(!perfil.resumen_ia); if(!r.ok) setMsgIA(r.msg || "No se ha podido guardar."); }}/>
            </div>
            <p style={{ fontSize:12, color:"var(--muted)", margin:"8px 0 0", lineHeight:1.5 }}>
              Cada dos semanas, tus entrenos de la nube (ejercicios, pesos, repeticiones y marcas) se envían a
              <b style={{ color:"var(--txt)" }}> Claude, de Anthropic</b>, que escribe un resumen con recomendaciones de ejercicios y de peso.
              Te sale en Inicio. Solo si lo activas; el ciclo menstrual no se envía nunca.
            </p>
            {msgIA && <div style={{ fontSize:12, color:"var(--crimson)", marginTop:6 }}>{msgIA}</div>}
          </div>
        )}
        {PRIVACY_URL && (
          <a href={PRIVACY_URL} target="_blank" rel="noopener noreferrer" className="fh-btn"
            style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:7, marginTop:13, textDecoration:"none",
                     background:"var(--card2)", color:"var(--txt)", border:"1px solid var(--line2)", padding:11, fontSize:12.5 }}>
            <Shield size={15} color="var(--jade)"/> Leer la política de privacidad
          </a>
        )}
      </div>

      <div style={{ fontSize:12, fontWeight:700, letterSpacing:".08em", color:"var(--faint)", margin:"18px 4px 8px" }}>CRÉDITOS DEL ARTE</div>
      <div className="fh-card" style={{ padding:16, fontSize:12, color:"var(--muted)", lineHeight:1.5 }}>
        <p style={{ margin:"0 0 8px" }}>Personajes: <b style={{ color:"var(--txt)" }}>Liberated Pixel Cup</b> (LPC), bajo licencias OGA-BY 3.0, CC-BY-SA 3.0 y CC0. Detalle de cada capa en <span className="mono">avatar/CREDITOS.csv</span> y en opengameart.org/content/lpc-collection.</p>
        <p style={{ margin:"0 0 8px" }}>Autores: {AVATAR.autores.join(", ")}.</p>
        <p style={{ margin:0 }}>Iconos y monstruos: Tiny Dungeon de Kenney (CC0). Sonidos: Juhani Junkala (CC0). Fondo: generado con FLUX.1 schnell. Máquinas: generadas con PixelLab.</p>
      </div>

      </>)}

      <div style={{ height:24 }}/>
    </div>
  );
}

function ToggleSwitch({ on, onClick }){
  return (
    <button onClick={onClick} aria-pressed={on} style={{ width:46, height:27, borderRadius:999, border:"1px solid var(--line2)", background:on?"var(--gold)":"var(--card2)", position:"relative", cursor:"pointer", transition:"background .18s", flexShrink:0 }}>
      <span style={{ position:"absolute", top:2, left:on?21:2, width:21, height:21, borderRadius:"50%", background:on?"#0F131A":"var(--muted)", transition:"left .18s" }}/>
    </button>
  );
}

/* =========================================================================
   INICIO
   ========================================================================= */

function StreakCard({ log, plannedDays, bestStreak, setTab, opts = {} }){
  const planned = (plannedDays && plannedDays.length) ? plannedDays : DEFAULT_TRAIN_DAYS;
  const streak = habitStreak(log, planned, opts);
  const record = Math.max(bestStreak||0, streak);
  const trained = new Set((log||[]).map(r=>r.date));
  const today = todayISO();
  const mon = mondayOf(today);
  const labels = ["L","M","X","J","V","S","D"];
  const semana = resumenSemana(log, planned, mon, opts);
  const days = Array.from({ length:7 }, (_,i)=>{
    const iso = addDaysISO(mon, i);
    // Un día de vacaciones no cuenta como previsto: se pinta como descanso.
    const isPlanned = planned.includes(weekdayOfISO(iso)) && !enVacacion(opts.vacaciones, iso);
    const isTrained = trained.has(iso);
    return { iso, label:labels[i], isPlanned, isTrained,
      isToday:iso===today, isFuture:iso>today,
      // Fuiste un día que no tocaba: eso recupera un día perdido.
      esExtra: isTrained && !isPlanned };
  });
  /* Un día previsto que fallaste deja de ser un borrón si la semana acaba
     cumpliendo las veces previstas — o si todavía puede cumplirlas. */
  const perdonaFallos = semana.cumplida || semana.recuperable;
  return (
    <div className="fh-card" style={{ padding:16, marginTop:12 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <Flame size={17} color={streak>0?"var(--ember)":"var(--faint)"}/>
          <span className="disp" style={{ fontWeight:600, fontSize:15 }}>Racha</span>
        </div>
        <div style={{ textAlign:"right" }}>
          <span className="cinzel" style={{ color:"var(--gold)", fontWeight:700, fontSize:16 }}>{streak} día{streak===1?"":"s"}</span>
          {record>0 && <div style={{ fontSize:10, color:"var(--faint)", marginTop:1, display:"flex", alignItems:"center", gap:4, justifyContent:"flex-end" }}><Crown size={10} color="var(--gold)"/> récord: {record}</div>}
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:6 }}>
        {days.map(d=>{
          let bg="transparent", brd="1px solid var(--line)", col="var(--faint)";
          if(d.isTrained){ bg=d.esExtra?"var(--jade)":"var(--gold)"; brd="none"; col="#0F131A"; }
          else if(!d.isPlanned){ bg="var(--bg2)"; brd="1px solid var(--line)"; col="var(--faint)"; } // descanso
          else if(d.isFuture){ brd="1px dashed var(--line2)"; col="var(--muted)"; } // planificado futuro
          else if(d.isToday){ brd="1px solid var(--gold)"; col="var(--gold)"; } // hoy pendiente
          else if(perdonaFallos){ brd="1px dashed var(--jade)"; col="var(--jade)"; } // fallado pero recuperado (o a tiempo)
          else { brd="1px solid var(--crimson)"; col="var(--crimson)"; } // fallado y sin recuperar
          return (
            <div key={d.iso} style={{ textAlign:"center" }}>
              <div style={{ fontSize:9.5, color:"var(--faint)", marginBottom:3, fontWeight:600 }}>{d.label}</div>
              <div style={{ aspectRatio:"1", borderRadius:9, background:bg, border:brd, display:"flex", alignItems:"center", justifyContent:"center", color:col }}>
                {d.isTrained ? (d.esExtra ? <Sparkles size={14}/> : <Check size={15}/>)
                  : !d.isPlanned ? <Moon size={12}/>
                  : d.isToday ? <Flame size={13}/>
                  : perdonaFallos ? <ArrowDown size={12} style={{ transform:"rotate(-90deg)" }}/>
                  : null}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ display:"flex", gap:13, marginTop:10, flexWrap:"wrap", fontSize:10, color:"var(--faint)" }}>
        <span style={{ display:"flex", alignItems:"center", gap:4 }}><span style={{ width:7, height:7, borderRadius:2, background:"var(--gold)" }}/> Día previsto</span>
        <span style={{ display:"flex", alignItems:"center", gap:4 }}><span style={{ width:7, height:7, borderRadius:2, background:"var(--jade)" }}/> Recuperado</span>
        <span style={{ display:"flex", alignItems:"center", gap:4 }}><Moon size={9}/> Descanso</span>
      </div>

      {/* Lo que de verdad cuenta esta semana: las veces, no los días. */}
      <div style={{ fontSize:11.5, color:"var(--muted)", marginTop:10, lineHeight:1.5, paddingTop:10, borderTop:"1px solid var(--line)" }}>
        {semana.cumplida ? (
          <><b style={{ color:"var(--jade)" }}>Semana cumplida</b>: {semana.hechos} de {semana.previstos} sesiones.
          {semana.hechos > semana.previstos && " Y con una de propina."}</>
        ) : semana.faltan > 0 && semana.recuperable ? (
          <>Te {semana.faltan===1?"falta":"faltan"} <b style={{ color:"var(--gold)" }}>{semana.faltan} {semana.faltan===1?"sesión":"sesiones"}</b> esta semana.
          {" "}<b style={{ color:"var(--txt)" }}>Cualquier día vale</b>: si te saltaste uno, recupéralo otro y la racha sigue intacta.</>
        ) : semana.previstos === 0 ? (
          <>Esta semana no hay nada previsto. Descansa: la racha sigue en pie.</>
        ) : (
          <>Ya no da tiempo a las {semana.previstos} de esta semana. No pasa nada: la semana que viene empieza de cero.</>
        )}
      </div>

      <div style={{ fontSize:11, color:"var(--faint)", marginTop:8, lineHeight:1.45 }}>
        Ajusta cuántos días quieres entrenar en <button onClick={()=>setTab("ajustes")} style={{ background:"none", border:"none", padding:0, color:"var(--gold)", cursor:"pointer", font:"inherit" }}>Ajustes</button>.
      </div>
    </div>
  );
}

function MissionsCard({ state, log }){
  const ctx = missionContext(state, log);
  const claimed = (state.missions && state.missions.week===state.weekStart) ? state.missions.claimed : [];
  const done = WEEKLY_MISSIONS.filter(m=>claimed.includes(m.id)).length;
  const totalXp = WEEKLY_MISSIONS.reduce((a,m)=>a+m.xp,0);
  const progressText = { pr:`${Math.min(ctx.weekPRs,1)}/1`, variado:`${Math.min(ctx.weekGroups,4)}/4`, sinfaltar:`${ctx.trainedPlanned}/${ctx.plannedThisWeek||"—"}` };
  return (
    <div className="fh-card" style={{ padding:16, marginTop:12 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}><Target size={16} color="var(--arcane)"/><span className="disp" style={{ fontWeight:600, fontSize:15 }}>Misiones de la semana</span></div>
        <span className="fh-chip" style={{ background:"var(--bg2)", color:"var(--muted)" }}>{done}/{WEEKLY_MISSIONS.length}</span>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
        {WEEKLY_MISSIONS.map(m=>{ const got=claimed.includes(m.id); const I=m.icon; return (
          <div key={m.id} style={{ display:"flex", alignItems:"center", gap:11, opacity:got?1:.92 }}>
            <div style={{ width:34, height:34, borderRadius:10, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", background:got?"var(--jade)":"var(--bg2)", border:got?"none":"1px solid var(--line)" }}>
              {got ? <Check size={16} color="#0F131A"/> : <I size={15} color="var(--arcane)"/>}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:"flex", justifyContent:"space-between", gap:8 }}>
                <span style={{ fontSize:13, fontWeight:600, color:got?"var(--jade)":"var(--txt)" }}>{m.title}</span>
                <span className="mono" style={{ fontSize:11, color:got?"var(--jade)":"var(--faint)", flexShrink:0 }}>{got?"✓":progressText[m.id]} · +{m.xp}</span>
              </div>
              <div style={{ fontSize:11, color:"var(--faint)", marginTop:1 }}>{m.desc}</div>
            </div>
          </div>
        ); })}
      </div>
      <div style={{ fontSize:11, color:"var(--faint)", marginTop:11 }}>Se reinician cada lunes · hasta +{totalXp} XP.</div>
    </div>
  );
}

function CyclePhaseCard({ state, setTab }){
  const ph = cyclePhaseFor(state.cycle, todayISO());
  if(!ph) return null;
  return (
    <div className="fh-card" style={{ padding:16, marginTop:12, borderColor:ph.color }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <Heart size={16} color={ph.color}/>
          <span className="disp" style={{ fontWeight:700, fontSize:15 }}>Tu ciclo: {ph.label}</span>
        </div>
        <span className="fh-chip" style={{ background:"var(--bg2)", color:ph.color, whiteSpace:"nowrap" }}>Día {ph.day}/{ph.len}</span>
      </div>
      <p style={{ fontSize:12.5, color:"var(--muted)", margin:"0 0 10px", lineHeight:1.5 }}>{ph.training}</p>
      <button className="fh-btn" onClick={()=>setTab("progreso")} style={{ width:"100%", background:"var(--card2)", color:"var(--txt)", border:"1px solid var(--line2)", padding:10, fontSize:12.5, display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}><CalendarDays size={14} color={ph.color}/> Ver mi calendario del ciclo</button>
    </div>
  );
}

function HomeView({ state, avatar, mazmorra, level, rank, log, useRest, terminarVacaciones, setTab, setActiveRoutine, customRoutines, cloudEnabled, perfil, updateInfo, onCloseUpdate, novedades, onCerrarNovedades, entrenando, onUnirme, superadoPor, copiaNube, onRestaurarNube, onDescartarCopia, pendientes, resumen, onCerrarResumen, onAbrirResumenes }){
  const xpInto=state.xp-cumXpForLevel(level), xpNeed=cumXpForLevel(level+1)-cumXpForLevel(level);
  const routine=findRoutine(state.activeRoutine, customRoutines); const goal=weeklyGoalFor(state, routine);
  const phase=recommendedPhase(state.startDate);
  const last=log.slice(-6).map((s,i)=>({ i, v:seriesDe(s) }));
  const week=weeksBetween(state.startDate, todayISO())+1;
  const greeting=useMemo(()=>greetingFor(state.profile?.name), [state.profile?.name]);
  const opts=semanaOpts(state);
  const deVacaciones=vacacionDeHoy(state.vacations);
  const racha=habitStreak(log, state.reminders?.days, opts);
  const semana=resumenSemana(log, plannedDaysOf(state), mondayOf(todayISO()), opts);
  const tituloCifra={ fontSize:12, color:"var(--muted)", fontWeight:700, letterSpacing:".08em", display:"flex", alignItems:"center", gap:5 };
  const notaCifra={ fontSize:12, color:"var(--muted)", marginTop:4 };
  const filaAcceso={ display:"flex", alignItems:"center", gap:12, width:"100%", textAlign:"left", padding:"10px 14px", marginTop:12, cursor:"pointer", color:"var(--txt)" };

  return (
    <div className="fh-in">
      <header style={{ padding:"22px 2px 14px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:10 }}>
        <h1 style={{ flex:1, minWidth:0, margin:0, fontSize:21, lineHeight:1.15 }}>{greeting}</h1>
        <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
          {cloudEnabled && perfil && (
            <button onClick={()=>setTab("avisos")} aria-label={pendientes ? `Avisos: ${pendientes} sin responder` : "Avisos"}
              style={{ background:"var(--card)", border:`1px solid ${pendientes?"var(--gold)":"var(--line)"}`, borderRadius:10, width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:pendientes?"var(--gold)":"var(--muted)", flexShrink:0, position:"relative" }}>
              <Bell size={17}/>
              <Contador n={pendientes}/>
            </button>
          )}
          <button onClick={()=>setTab("ajustes")} aria-label="Ajustes" style={{ background:"var(--card)", border:"1px solid var(--line)", borderRadius:10, width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"var(--muted)", flexShrink:0 }}><Settings size={17}/></button>
        </div>
      </header>

      <UpdateBanner info={updateInfo} onClose={onCloseUpdate}/>

      {deVacaciones && (
        <div className="fh-card" style={{ padding:14, margin:"0 0 12px", borderColor:"var(--sky)", display:"flex", alignItems:"center", gap:11 }}>
          <Palmtree size={18} color="var(--sky)" style={{ flexShrink:0 }}/>
          <div style={{ flex:1, minWidth:0, fontSize:12.5, color:"var(--txt)", lineHeight:1.45 }}>
            Estás de vacaciones hasta el <b>{parseISO(deVacaciones.to).getDate()} de {MONTHS_ES[parseISO(deVacaciones.to).getMonth()].toLowerCase()}</b>. La racha te espera.
          </div>
          <button className="fh-btn" onClick={terminarVacaciones}
            style={{ flexShrink:0, background:"var(--card2)", color:"var(--txt)", border:"1px solid var(--line2)", padding:"8px 12px", fontSize:12 }}>Volver ya</button>
        </div>
      )}

      {state.sub?.enabled && (()=>{
        const d = daysUntil(nextRenewalDate(state.sub.renewalDay));
        if (d > 3) return null;
        return (
          <div className="fh-card" style={{ padding:14, margin:"0 0 12px", borderColor:"var(--ember)", display:"flex", alignItems:"center", gap:11 }}>
            <CreditCard size={18} color="var(--ember)"/>
            <div style={{ fontSize:12.5, color:"var(--txt)", lineHeight:1.45 }}>
              Tu cuota del gym se renueva en <b>{d} día{d===1?"":"s"}</b> (día {state.sub.renewalDay}). Cancela antes si no vas a seguir para evitar el pago.
            </div>
          </div>
        );
      })()}

      <ResumenCard resumen={resumen} onCerrar={onCerrarResumen} onVerTodos={onAbrirResumenes}/>

      {/* Rango + XP */}
      {!ALT && <div className="fh-card fh-framed" onClick={()=>setTab("ficha")} style={{ padding:0, cursor:"pointer" }}>
        <div className="fh-escena" style={{ height:138, display:"flex", alignItems:"flex-end", justifyContent:"center" }}>
          <Avatar av={avatar} escala={2} className="fh-idle" style={{ marginBottom:-4 }} titulo={rank.name}/>
          <div className="arcade" style={{ position:"absolute", top:10, left:10, fontSize:11, color:"#FFF", textShadow:"1px 1px 0 #000" }}>LV {level}</div>
          <div className="disp" style={{ position:"absolute", top:7, right:10, fontSize:16, color:RAMA[avatar.rama].color, textShadow:"1px 1px 0 #000" }}>{RAMA[avatar.rama].estilo}</div>
        </div>
        <div style={{ padding:"12px 16px 14px" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div className="cinzel" style={{ fontSize:20, fontWeight:700, color:rank.color }}>{rank.name}</div>
            <ScrollText size={15} color="var(--faint)"/>
          </div>
          <div style={{ fontSize:12, color:"var(--muted)", marginTop:2 }}>{xpInto} / {xpNeed} XP para nivel {level+1}</div>
          <div className="fh-bar" style={{ marginTop:9 }}><i style={{ width:`${Math.min(100,(xpInto/xpNeed)*100)}%`, background:rank.color }}/></div>
          <div style={{ fontSize:11, color:"var(--faint)", marginTop:8 }}>{state.xp} XP · {state.totalWorkouts} entrenos</div>
        </div>
      </div>}

      {/* Semana y racha, grandes y a la vista: lo que se mira cada vez que se abre la app. */}
      <div style={{ display:"flex", gap:12, marginTop:12 }}>
        <div className="fh-card" style={{ flex:1, minWidth:0, padding:"12px 14px" }}>
          <div style={tituloCifra}><CalendarDays size={14} color="var(--sky)"/> SEMANA</div>
          <div className="disp" style={{ fontSize:38, lineHeight:1, marginTop:4 }}>{week}</div>
          <div style={notaCifra}>{semana.previstos ? `${semana.hechos} de ${semana.previstos} sesiones` : "Sin sesiones previstas"}</div>
        </div>
        <div className="fh-card" style={{ flex:1, minWidth:0, padding:"12px 14px" }}>
          <div style={tituloCifra}><Flame size={14} color={racha>0?"var(--ember)":"var(--faint)"}/> RACHA</div>
          <div className="disp" style={{ fontSize:38, lineHeight:1, marginTop:4, color:racha>0?"var(--gold)":"var(--txt)" }}>{racha} <span style={{ fontSize:20 }}>{racha===1?"día":"días"}</span></div>
          <div style={notaCifra}>Récord: {Math.max(state.bestStreak||0, racha)}</div>
        </div>
      </div>

      {!ALT && <button className="fh-card" onClick={()=>setTab("mazmorra")} style={filaAcceso}>
        <Sprite id={110} size={32}/>
        <span style={{ flex:1, minWidth:0 }}>
          <span className="disp" style={{ display:"block", fontSize:18, lineHeight:1.15 }}>La mazmorra</span>
          <span style={{ display:"block", fontSize:12, color:"var(--muted)" }}>{mazmorra?.partida && mazmorra.partida.fase!=="fin" ? `Sala ${mazmorra.partida.sala} de ${M.SALAS}` : mazmorra?.gloria ? `${mazmorra.gloria} de Gloria` : "Lleva tu héroe a combatir"} · {mazmorra?.llaves||0} {mazmorra?.llaves===1 ? "llave" : "llaves"} · Impulso {mazmorra?.impulso||0}</span>
        </span>
        <ChevronRight size={16} color="var(--faint)" style={{ flexShrink:0 }}/>
      </button>}

      <button className="fh-card" onClick={()=>setTab("dieta")} style={filaAcceso}>
        {ALT ? <Utensils size={20} color="var(--jade)"/> : <Sprite id={SPR.pocion} size={32}/>}
        <span style={{ flex:1, minWidth:0 }}>
          <span className="disp" style={{ display:"block", fontSize:18, lineHeight:1.15 }}>Dieta</span>
          <span style={{ display:"block", fontSize:12, color:"var(--muted)" }}>Plan semanal y lista de la compra</span>
        </span>
        <ChevronRight size={16} color="var(--faint)" style={{ flexShrink:0 }}/>
      </button>

      {copiaNube && (
        <div className="fh-card fh-in" style={{ padding:16, marginTop:12, borderColor:"var(--jade)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:9, fontSize:14, marginBottom:6 }}><Cloud size={16} color="var(--jade)"/> Tienes una copia en la nube</div>
          <p style={{ fontSize:12.5, color:"var(--muted)", margin:"0 0 12px", lineHeight:1.5 }}>
            De {copiaNube.dispositivo || "otro dispositivo"}, del {new Date(copiaNube.updated_at).toLocaleDateString("es-ES",{ day:"2-digit", month:"long" })}.{" "}
            {copiaNube.vacio ? "Este móvil está vacío, así que puedes recuperarla ahora mismo."
              : <>Va por delante de este móvil: {copiaNube.nube.entrenos} entrenos{copiaNube.nube.ultimo ? `, el último el ${fechaCorta(copiaNube.nube.ultimo)}` : ""}, y aquí {copiaNube.aqui.entrenos}{copiaNube.aqui.ultimo ? `, el último el ${fechaCorta(copiaNube.aqui.ultimo)}` : ""}. Restaurar <b style={{ color:"var(--txt)" }}>sustituye</b> lo que hay aquí.</>}
          </p>
          <div style={{ display:"flex", gap:8 }}>
            <button className="fh-btn" onClick={onDescartarCopia}
              style={{ flex:1, background:"var(--card2)", color:"var(--muted)", border:"1px solid var(--line2)", padding:11, fontSize:12.5 }}>Ahora no</button>
            <button className="fh-btn" onClick={onRestaurarNube}
              style={{ flex:1.4, background:"var(--jade)", padding:11, fontSize:12.5 }}>Restaurar</button>
          </div>
        </div>
      )}

      {cloudEnabled && perfil && <EntrenandoAhora sesiones={entrenando} onUnirme={onUnirme} setTab={setTab}/>}
      {cloudEnabled && perfil && <MeHanSuperado filas={superadoPor} setTab={setTab}/>}
      {cloudEnabled && perfil && <NovedadesCard novedades={novedades} onCerrar={onCerrarNovedades} setTab={setTab}/>}

      {/* Racha (respeta descansos) */}
      <StreakCard log={log} plannedDays={state.reminders?.days} bestStreak={state.bestStreak} setTab={setTab} opts={opts}/>

      {/* Misiones de la semana (dan XP: en la versión alt no se enseñan) */}
      {!ALT && <MissionsCard state={state} log={log}/>}

      {/* Ciclo menstrual (solo si la usuaria lo activó) */}
      <CyclePhaseCard state={state} setTab={setTab}/>

      {/* Fase del programa */}
      <div className="fh-card" style={{ padding:16, marginTop:12, borderColor:phase.color }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <Compass size={16} color={phase.color}/>
            <span className="disp" style={{ fontWeight:700, fontSize:15 }}>Fase: {phase.name}</span>
          </div>
          <span className="fh-chip" style={{ background:"var(--bg2)", color:phase.color }}>{phase.weeks}</span>
        </div>
        <p style={{ fontSize:12.5, color:"var(--muted)", margin:"0 0 10px", lineHeight:1.5 }}>{phase.goal}</p>
        <button className="fh-btn" onClick={()=>setTab("rutinas")} style={{ width:"100%", background:phase.color, padding:11, display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
          <Play size={15}/> Ir a las rutinas de esta fase
        </button>
      </div>

      {/* Objetivo semanal */}
      <div className="fh-card" style={{ padding:16, marginTop:12 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}><Target size={16} color="var(--jade)"/><span className="disp" style={{ fontWeight:600, fontSize:15 }}>Objetivo semanal</span></div>
          <span style={{ fontSize:12, color:"var(--muted)" }}>{routine?.name}</span>
        </div>
        {goal === 0 ? (
          <div style={{ fontSize:12.5, color:"var(--muted)", lineHeight:1.5 }}>
            Esta semana no tienes ninguna sesión prevista{deVacaciones ? " (estás de vacaciones)" : ""}. Lo que entrenes va de propina.
          </div>
        ) : (
        <div style={{ display:"flex", gap:7 }}>
          {Array.from({length:goal}).map((_,i)=>(
            <div key={i} style={{ flex:1, height:34, borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center",
              background:i<state.weeklyCount?"var(--jade)":"var(--bg2)", border:i<state.weeklyCount?"none":"1px solid var(--line)" }}>
              {i<state.weeklyCount? <Check size={16} color="#0F131A"/> : <span style={{ color:"var(--faint)", fontSize:12 }}>{i+1}</span>}
            </div>
          ))}
        </div>
        )}
        <div style={{ fontSize:12, color:"var(--muted)", marginTop:10 }}>
          {(() => {
            const faltan = Math.max(0, goal - state.weeklyCount);
            if(state.weekGoalMet) return "¡Semana completada! Sigue sumando o descansa sin culpa.";
            if(goal === 0) return "Vuelve cuando quieras: la racha no se rompe.";
            return `Te ${faltan===1?"falta":"faltan"} ${faltan} ${faltan===1?"sesión":"sesiones"} para ${ALT ? "cerrar la semana y ganar" : "+200 XP y"} un día de descanso. El día lo eliges tú.`;
          })()}
        </div>
        {/* Qué días has marcado tú: el objetivo sale de aquí, no de la rutina. */}
        <div style={{ fontSize:11.5, color:"var(--faint)", marginTop:7, lineHeight:1.5 }}>
          Tus días: <b style={{ color:"var(--muted)" }}>{plannedDaysOf(state).slice().sort((a,b)=>((a+6)%7)-((b+6)%7)).map(d=>DAY_LETTERS[d]).join(" · ")}</b>
          {routine?.daysPerWeek && routine.daysPerWeek!==goal && <> · esta rutina está pensada para {routine.daysPerWeek} día{routine.daysPerWeek===1?"":"s"}</>}
          {" · "}
          <button onClick={()=>setTab("ajustes")} style={{ background:"none", border:"none", padding:0, color:"var(--gold)", cursor:"pointer", font:"inherit" }}>cambiar</button>
        </div>
      </div>

      {/* Días de descanso + mini gráfica */}
      {(() => {
        const fichas = state.restTokens || 0;
        const gastado = !!(state.restWeeks||{})[mondayOf(todayISO())];
        return (
      <div style={{ display:"flex", gap:12, marginTop:12 }}>
        <button className="fh-card" onClick={useRest} disabled={fichas<=0 || gastado}
          style={{ flex:1, padding:16, textAlign:"left", cursor:(fichas>0&&!gastado)?"pointer":"default", opacity:(fichas>0&&!gastado)?1:.55 }}>
          <BedDouble size={18} color="var(--sky)"/>
          <div className="disp" style={{ fontSize:26, fontWeight:700, marginTop:6 }}>{fichas}</div>
          <div style={{ fontSize:11, color:"var(--muted)", lineHeight:1.35 }}>
            {gastado ? "días de descanso · ya usaste uno esta semana"
              : fichas>0 ? "días de descanso · resta una sesión a esta semana"
              : "días de descanso · gánalos cumpliendo la semana"}
          </div>
        </button>
        <div className="fh-card" style={{ flex:1, padding:16 }}>
          <TrendingUp size={18} color="var(--gold)"/>
          <div style={{ height:44, marginTop:6 }}>
            {last.length>1 ? <ResponsiveContainer width="100%" height="100%"><LineChart data={last}><Line type="monotone" dataKey="v" stroke="var(--gold)" strokeWidth={2} dot={false}/></LineChart></ResponsiveContainer>
              : <div style={{ fontSize:11, color:"var(--faint)", paddingTop:14 }}>Entrena para ver tu curva</div>}
          </div>
          <div style={{ fontSize:11, color:"var(--muted)" }}>series recientes</div>
        </div>
      </div>
        );
      })()}
    </div>
  );
}

/* =========================================================================
   RUTINAS
   ========================================================================= */

/* Panel para pasarle una rutina a otra persona: genera el código y lo copia o
   lo manda por la app que elija (WhatsApp, Telegram…) si el móvil lo permite. */
/* Compartir una rutina. Ya no hay códigos que copiar: o la dejas visible para
   todo tu círculo, o se la mandas a alguien concreto desde su ficha y él la
   acepta. Los códigos de texto obligaban a salir de la app y a pegar 550
   caracteres sin cortarlos, que es justo donde fallaba. */
function ShareRoutinePanel({ routine, onClose, publicada, onPublicar, setTab }){
  return (
    <div className="fh-card fh-in" style={{ background:"var(--bg2)", padding:14, marginBottom:12 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8, marginBottom:9 }}>
        <span className="disp" style={{ fontWeight:600, fontSize:13.5, display:"flex", alignItems:"center", gap:7 }}>
          <Share2 size={14} color="var(--gold)"/> Compartir «{routine.name}»
        </span>
        <button onClick={onClose} aria-label="Cerrar" style={{ background:"none", border:"none", padding:2, cursor:"pointer", color:"var(--faint)" }}><X size={15}/></button>
      </div>

      {!cloud.cloudEnabled ? (
        <p style={{ fontSize:12, color:"var(--muted)", margin:0, lineHeight:1.5 }}>
          Para compartir rutinas hace falta cuenta. Entra desde <b style={{ color:"var(--txt)" }}>Ajustes → Cuenta</b>.
        </p>
      ) : (<>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10 }}>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:12.5, color:"var(--txt)", display:"flex", alignItems:"center", gap:7 }}>
              <Users size={14} color="var(--jade)"/> Visible para mis amigos
            </div>
            <div style={{ fontSize:11, color:"var(--faint)", marginTop:3, lineHeight:1.4 }}>
              {publicada ? "La ven en su lista y pueden copiarla." : "Por defecto tus rutinas no salen del móvil."}
            </div>
          </div>
          <ToggleSwitch on={publicada} onClick={onPublicar}/>
        </div>

        <div style={{ fontSize:11.5, color:"var(--muted)", marginTop:11, paddingTop:11, borderTop:"1px solid var(--line)", lineHeight:1.5 }}>
          ¿Se la quieres mandar a alguien en concreto? Entra en <b style={{ color:"var(--txt)" }}>Amigos</b>, toca a quien sea y usa <b style={{ color:"var(--txt)" }}>Pasarle una rutina</b>. Le llega a sus avisos y decide.
        </div>
        <button className="fh-btn" onClick={()=>setTab("amigos")}
          style={{ width:"100%", marginTop:10, background:"var(--card2)", color:"var(--txt)", border:"1px solid var(--line2)", padding:10, fontSize:12.5, display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
          <Users size={14} color="var(--gold)"/> Ir a mis amigos
        </button>
      </>)}
    </div>
  );
}

function RutinasDeAmigos({ onImportar, yaTengo }){
  const [rutinas, setRutinas] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [abierta, setAbierta] = useState(null);
  const [msg, setMsg] = useState(null);

  async function cargar(){
    setCargando(true);
    const r = await cloud.rutinasDeAmigos();
    setCargando(false);
    if (r.ok) setRutinas(r.rutinas); else { setRutinas([]); setMsg(r.msg); }
  }
  useEffect(()=>{ cargar(); }, []);

  function copiar(fila){
    const decodificada = decodeRoutine(SHARE_PREFIX + b64urlEncode(JSON.stringify(fila.payload)), yaTengo);
    if (!decodificada.ok) { setMsg(decodificada.msg); return; }
    onImportar({ ...decodificada.routine,
      sharedFrom: { handle: fila.handle, displayName: fila.display_name },
      origen: { ownerId: fila.owner_id, clientId: fila.client_id, updatedAt: fila.updated_at },
      bonusHecho: false });
    setMsg(`«${fila.name}» añadida. La primera vez que la entrenes te llevas ${XP_RUTINA_AMIGO} XP extra.`);
  }

  if (cargando && !rutinas) return <Empty text="Buscando rutinas de tus amigos…"/>;
  if (rutinas && !rutinas.length) return (
    <p style={{ fontSize:11.5, color:"var(--faint)", margin:"9px 4px 0", lineHeight:1.5 }}>
      Ninguno de tus amigos ha compartido rutinas todavía. Comparte tú una desde el botón <b style={{ color:"var(--muted)" }}>Compartir</b> de cualquiera de las tuyas.
    </p>
  );

  return (<>
    {(rutinas || []).map(f=>{
      const abierto = abierta === f.id;
      const total = (f.payload?.d || []).reduce((a,d)=>a + (d[1]?.length || 0), 0);
      return (
        <div key={f.id} className="fh-card" style={{ marginBottom:10, overflow:"hidden", borderColor:abierto?"var(--jade)":"var(--line)" }}>
          <button onClick={()=>setAbierta(abierto?null:f.id)}
            style={{ width:"100%", background:"none", border:"none", cursor:"pointer", padding:14, textAlign:"left", color:"var(--txt)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10 }}>
              <div style={{ minWidth:0 }}>
                <div className="disp" style={{ fontSize:15, fontWeight:700 }}>{f.name}</div>
                <div style={{ fontSize:11.5, color:"var(--muted)", marginTop:2 }}>
                  de <b style={{ color:"var(--jade)" }}>{f.display_name || "@"+f.handle}</b> · {f.dias} día{f.dias===1?"":"s"} · {total} ejercicios
                </div>
              </div>
              <ChevronRight size={16} color="var(--faint)" style={{ flexShrink:0, transform:abierto?"rotate(90deg)":"none", transition:"transform .15s" }}/>
            </div>
          </button>
          {abierto && (
            <div className="fh-in" style={{ padding:"0 14px 14px" }}>
              {(f.payload?.d || []).map((dia,i)=>(
                <div key={i} style={{ padding:"7px 0", borderTop:"1px solid var(--line)" }}>
                  <div className="disp" style={{ fontSize:12.5, fontWeight:600 }}>{dia[0]}</div>
                  <div style={{ fontSize:11, color:"var(--faint)", marginTop:3, lineHeight:1.5 }}>
                    {(dia[1] || []).map(e=>`${e[0]} ${e[1]}×${e[2]}`).join(" · ")}
                  </div>
                </div>
              ))}
              <button className="fh-btn" onClick={()=>copiar(f)}
                style={{ width:"100%", marginTop:11, background:"var(--jade)", padding:12, fontSize:13, display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}>
                <Plus size={15}/> Hacer esta rutina · +{XP_RUTINA_AMIGO} XP la primera vez
              </button>
            </div>
          )}
        </div>
      );
    })}
    {msg && (
      <div className="fh-card" style={{ padding:12, marginTop:4, borderColor:"var(--jade)", fontSize:12, color:"var(--muted)", lineHeight:1.45 }}>{msg}</div>
    )}
  </>);
}

/* Tarjeta de rutina: la usan tanto el catálogo de la app como "Mis rutinas". */
function RoutineCard({ r, state, level, isOpen, onToggle, setActiveRoutine, startWorkout, onEdit, onDelete, publicadas, onPublicar, setTab }){
  const [confirmDel, setConfirmDel] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const isActive = state.activeRoutine===r.id;
  const locked = (r.minLevel||0) > level;
  const mine = !!r.custom;
  return (
    <div className="fh-card" style={{ marginBottom:10, overflow:"hidden", borderColor:isActive?"var(--gold)":"var(--line)", opacity:locked?.72:1 }}>
      <button onClick={onToggle} style={{ width:"100%", background:"none", border:"none", cursor:"pointer", padding:16, textAlign:"left", color:"var(--txt)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10 }}>
          <div><div className="disp" style={{ fontSize:16, fontWeight:700, display:"flex", alignItems:"center", gap:7 }}>{locked && <Lock size={14} color="var(--faint)"/>}{r.name}</div>
            <div style={{ fontSize:12, color:"var(--muted)", marginTop:2 }}>{r.subtitle || `${r.days.length} día${r.days.length===1?"":"s"} · RPE ${r.rpe}`}</div></div>
          {isActive ? <span className="fh-chip" style={{ background:"var(--gold)", color:"#0F131A" }}>ACTIVA</span>
            : locked ? <span className="fh-chip cinzel" style={{ background:"var(--bg2)", color:"var(--faint)", whiteSpace:"nowrap" }}>Nv {r.minLevel}</span>
            : r.imported ? <span className="fh-chip" style={{ background:"var(--bg2)", color:"var(--jade)", whiteSpace:"nowrap" }}>IMPORTADA</span> : null}
        </div>
        {r.blurb && <p style={{ fontSize:12.5, color:"var(--muted)", margin:"10px 0 0", lineHeight:1.5 }}>{r.blurb}</p>}
      </button>
      {isOpen && (
        <div style={{ padding:"0 16px 16px" }} className="fh-in">
          {locked ? (
            <div className="fh-card" style={{ background:"var(--bg2)", padding:14, display:"flex", alignItems:"center", gap:11 }}>
              <Lock size={18} color="var(--gold)"/>
              <div style={{ fontSize:12.5, color:"var(--muted)", lineHeight:1.45 }}>Se desbloquea en el <b style={{ color:"var(--txt)" }}>nivel {r.minLevel}</b>. {cumXpForLevel(r.minLevel)-state.xp>0?<>Te faltan <b style={{ color:"var(--gold)" }}>{cumXpForLevel(r.minLevel)-state.xp} XP</b>.</>:"Ya casi lo tienes."}</div>
            </div>
          ) : (<>
          {!isActive && <button className="fh-btn" onClick={()=>setActiveRoutine(r.id)} style={{ width:"100%", background:"var(--card2)", color:"var(--gold)", padding:11, marginBottom:12, border:"1px solid var(--line2)" }}>Hacer esta mi rutina activa</button>}
          {mine && (
            <div style={{ display:"flex", gap:7, marginBottom:12 }}>
              <button className="fh-btn" onClick={()=>onEdit(r)} style={{ flex:1, background:"var(--card2)", color:"var(--txt)", border:"1px solid var(--line2)", padding:"10px 6px", fontSize:12, display:"flex", alignItems:"center", justifyContent:"center", gap:5 }}><Pencil size={13} color="var(--gold)"/> Editar</button>
              <button className="fh-btn" onClick={()=>{ setShareOpen(v=>!v); setConfirmDel(false); }} style={{ flex:1, background:shareOpen?"var(--gold)":"var(--card2)", color:shareOpen?"#0F131A":"var(--txt)", border:`1px solid ${shareOpen?"var(--gold)":"var(--line2)"}`, padding:"10px 6px", fontSize:12, display:"flex", alignItems:"center", justifyContent:"center", gap:5 }}><Share2 size={13} color={shareOpen?"#0F131A":"var(--gold)"}/> Compartir</button>
              <button className="fh-btn" onClick={()=>{ setConfirmDel(v=>!v); setShareOpen(false); }} style={{ flex:1, background:"var(--card2)", color:"var(--muted)", border:"1px solid var(--line2)", padding:"10px 6px", fontSize:12, display:"flex", alignItems:"center", justifyContent:"center", gap:5 }}><Trash2 size={13} color="var(--crimson)"/> Borrar</button>
            </div>
          )}
          {mine && shareOpen && <ShareRoutinePanel routine={r} onClose={()=>setShareOpen(false)} publicada={!!publicadas?.includes(r.id)} onPublicar={()=>onPublicar(r)} setTab={setTab}/>}
          {mine && confirmDel && (
            <div className="fh-card" style={{ background:"var(--bg2)", padding:13, marginBottom:12 }}>
              <div style={{ fontSize:12.5, color:"var(--muted)", lineHeight:1.45, marginBottom:10 }}>¿Seguro que quieres borrar «{r.name}»? Los entrenos que ya has hecho con ella se conservan en tu historial.</div>
              <div style={{ display:"flex", gap:8 }}>
                <button className="fh-btn" onClick={()=>setConfirmDel(false)} style={{ flex:1, background:"var(--card2)", color:"var(--muted)", border:"1px solid var(--line2)", padding:9, fontSize:12 }}>Cancelar</button>
                <button className="fh-btn" onClick={()=>{ setConfirmDel(false); onDelete(r.id); }} style={{ flex:1, background:"var(--crimson)", color:"#fff", padding:9, fontSize:12 }}>Sí, borrar</button>
              </div>
            </div>
          )}
          {r.days.map((d,di)=>(
            <div key={di} className="fh-card" style={{ background:"var(--bg2)", padding:14, marginBottom:10 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                <span className="disp" style={{ fontWeight:600, fontSize:14 }}>{d.name}</span>
                <button className="fh-btn" onClick={()=>startWorkout(r.id,di)} disabled={!d.exercises.length}
                  style={{ background:d.exercises.length?"var(--gold)":"var(--card2)", color:d.exercises.length?"#0F131A":"var(--faint)", padding:"7px 14px", fontSize:13, display:"flex", alignItems:"center", gap:5 }}><Play size={13}/> Empezar</button>
              </div>
              {!d.exercises.length && <div style={{ fontSize:11.5, color:"var(--faint)" }}>Sin ejercicios. Edita la rutina para añadirlos.</div>}
              {d.exercises.map((ex,ei)=>(
                <div key={ei} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"6px 0", borderTop:ei?"1px solid var(--line)":"none" }}>
                  <div><div style={{ fontSize:13.5 }}>{ex.name}</div><div style={{ fontSize:11, color:"var(--faint)" }}>{ex.muscle} · descanso {ex.rest}s{ex.note?` · ${ex.note}`:""}</div></div>
                  <div className="mono" style={{ fontSize:12, color:"var(--muted)", textAlign:"right" }}>{ex.sets} × {ex.reps}</div>
                </div>
              ))}
            </div>
          ))}
          </>)}
        </div>
      )}
    </div>
  );
}

function RoutinesView({ state, level, setActiveRoutine, startWorkout, customRoutines, editRoutine, deleteCustomRoutine, importRoutine, perfil, publicadas, onPublicar, setTab }){
  const [open, setOpen] = useState(state.activeRoutine);
  const [noticeClosed, cerrarNotice] = useAvisoCerrado("rutinas-nivel");
  const sexTag = state.profile?.sex === "mujer" ? "f" : "m";
  const experience = state.profile?.experience || "principiante";
  const expLabel = (EXPERIENCE_LEVELS.find(e=>e.id===experience)||EXPERIENCE_LEVELS[0]).label;
  const canUnlock = experience!=="experto";
  const mine = customRoutines || [];
  const cardProps = { state, level, setActiveRoutine, startWorkout, onEdit:editRoutine, onDelete:deleteCustomRoutine, publicadas, onPublicar, setTab };
  return (
    <div className="fh-in">
      <header style={{ padding:"22px 2px 8px" }}>
        <h1 style={{ margin:0, fontSize:22 }}>Rutinas</h1>
        <p style={{ margin:"4px 0 0", fontSize:13, color:"var(--muted)" }}>Elige tu plan activo, o monta el tuyo con los ejercicios de la app.</p>
      </header>
      {!noticeClosed && (
        <div className="fh-card" style={{ padding:13, margin:"10px 0 2px", display:"flex", alignItems:"flex-start", gap:10 }}>
          <Compass size={16} color="var(--gold)" style={{ flexShrink:0, marginTop:1 }}/>
          <div style={{ flex:1, fontSize:12, color:"var(--muted)", lineHeight:1.45 }}>Mostramos las rutinas para tu nivel <b style={{ color:"var(--txt)" }}>{expLabel}</b>.{canUnlock && <> Sube tu experiencia en <b style={{ color:"var(--txt)" }}>Ajustes</b> para desbloquear más.</>} En cada bloque sube series poco a poco y descarga cada 4-6 semanas.</div>
          <button onClick={cerrarNotice} aria-label="Cerrar" style={{ background:"none", border:"none", padding:2, cursor:"pointer", color:"var(--faint)", flexShrink:0 }}><X size={15}/></button>
        </div>
      )}

      {/* --- Mis rutinas (configurador) --- */}
      <div style={{ marginTop:14 }}>
        <div className="disp" style={{ fontSize:12, fontWeight:700, letterSpacing:".08em", color:"var(--faint)", margin:"0 4px 8px" }}>MIS RUTINAS</div>
        {mine.map(r=>(
          <RoutineCard key={r.id} r={r} isOpen={open===r.id} onToggle={()=>setOpen(open===r.id?null:r.id)} {...cardProps}/>
        ))}
        <button className="fh-btn" onClick={()=>editRoutine(null)}
          style={{ width:"100%", background:"var(--card)", color:"var(--txt)", border:"1px dashed var(--line2)", padding:"14px 8px", fontSize:12.5, display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}>
          <Plus size={15} color="var(--gold)"/> {mine.length ? "Crear otra" : "Crear rutina"}
        </button>
        {cloud.cloudEnabled && perfil && (
          <div style={{ marginTop:14 }}>
            <div className="disp" style={{ fontSize:12, fontWeight:700, letterSpacing:".08em", color:"var(--faint)", margin:"0 4px 8px" }}>DE MIS AMIGOS</div>
            <RutinasDeAmigos onImportar={importRoutine} yaTengo={mine.map(r=>r.name)}/>
          </div>
        )}

        {!mine.length && (
          <p style={{ fontSize:11.5, color:"var(--faint)", margin:"9px 4px 0", lineHeight:1.5 }}>
            ¿Te han pautado una rutina? Móntala aquí con los ejercicios de la app. Y si un amigo te manda la suya, te llega a la campana de Inicio y la añades de un toque.
          </p>
        )}
      </div>

      {ROUTINE_CATS.map(cat=>{
        if(!expAllows(experience, cat)) return null;
        const list=ROUTINES.filter(r=>r.cat===cat && (!r.sex || r.sex===sexTag)); if(!list.length) return null;
        return (
          <div key={cat} style={{ marginTop:14 }}>
            <div className="disp" style={{ fontSize:12, fontWeight:700, letterSpacing:".08em", color:"var(--faint)", margin:"0 4px 8px" }}>{cat.toUpperCase()}</div>
            {list.map(r=>(
              <RoutineCard key={r.id} r={r} isOpen={open===r.id} onToggle={()=>setOpen(open===r.id?null:r.id)} {...cardProps}/>
            ))}
          </div>
        );
      })}
    </div>
  );
}

/* =========================================================================
   CONFIGURADOR DE RUTINAS
   Monta tus propias rutinas con los ejercicios del catálogo de la app: al salir
   del selector ya traen músculo, técnica (EX_HOW) y demostración (EX_IMG), así
   que se entrenan, dan XP y cuentan volumen igual que las rutinas de la casa.
   ========================================================================= */

const normTxt = t => String(t).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

function ExercisePicker({ dayName, already, onPick, onRemove, onClose }){
  const [q, setQ] = useState("");
  const [group, setGroup] = useState("todos");
  const [preview, setPreview] = useState(null);   // ejercicio abierto para ver su demostración
  const term = normTxt(q.trim());
  const groups = EX_POOL_BY_GROUP
    .filter(g => group==="todos" || g.group===group)
    .map(g => ({ ...g, items:g.items.filter(n => !term || normTxt(n + " " + (EX_MAQUINA[n]||"")).includes(term)) }))
    .filter(g => g.items.length);
  const total = groups.reduce((a,g)=>a+g.items.length, 0);
  const target = (typeof document!=="undefined" && document.getElementById("rpgym-root")) || (typeof document!=="undefined" ? document.body : null);

  const overlay = (
    /* Fondo opaco con la variable del tema: el selector ocupa toda la pantalla y así
       se lee igual de bien en claro que en oscuro (un velo oscuro fijo no valdría). */
    <div style={{ position:"fixed", inset:0, zIndex:210, background:"var(--bg)", display:"flex", justifyContent:"center" }}>
      <div style={{ width:"100%", maxWidth:480, display:"flex", flexDirection:"column", padding:"calc(16px + var(--st)) 16px calc(12px + var(--sb))", minHeight:0 }}>

        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12, flexShrink:0 }}>
          <div style={{ flex:1, minWidth:0 }}>
            <div className="disp" style={{ fontWeight:700, fontSize:16 }}>Añadir ejercicio</div>
            <div style={{ fontSize:11.5, color:"var(--muted)", marginTop:2, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>a {dayName} · toca el nombre para ver cuál es</div>
          </div>
          <button onClick={onClose} className="fh-btn" style={{ background:"var(--gold)", padding:"10px 16px", fontSize:13, display:"flex", alignItems:"center", gap:6 }}><Check size={15}/> Listo</button>
        </div>

        <div style={{ position:"relative", flexShrink:0 }}>
          <Search size={15} color="var(--faint)" style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}/>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar ejercicio…" aria-label="Buscar ejercicio"
            style={{ textAlign:"left", paddingLeft:34, fontFamily:"'Inter',system-ui,sans-serif", fontSize:15 }}/>
        </div>

        <div style={{ display:"flex", gap:6, overflowX:"auto", padding:"10px 0 2px", flexShrink:0 }}>
          {[{ id:"todos", label:"Todos" }, ...EX_POOL_BY_GROUP.map(g=>({ id:g.group, label:g.group }))].map(g=>{
            const on = group===g.id;
            return <button key={g.id} onClick={()=>setGroup(g.id)} className="fh-btn"
              style={{ flexShrink:0, padding:"7px 13px", fontSize:12, background:on?"var(--gold)":"var(--card)", color:on?"#0F131A":"var(--muted)", border:on?"none":"1px solid var(--line)" }}>{g.label}</button>;
          })}
        </div>

        <div style={{ flex:1, overflowY:"auto", marginTop:10, minHeight:0 }}>
          {!total && <Empty text="Ningún ejercicio coincide con tu búsqueda"/>}
          {groups.map(g=>{
            const I = g.icon;
            return (
              <div key={g.group} style={{ marginBottom:14 }}>
                <div style={{ display:"flex", alignItems:"center", gap:7, margin:"0 2px 7px" }}>
                  <I size={13} color={g.color}/>
                  <span className="disp" style={{ fontSize:12, fontWeight:700, letterSpacing:".06em", color:"var(--faint)" }}>{g.group.toUpperCase()}</span>
                </div>
                {g.items.map(name=>{
                  const veces = already.filter(n=>n===name).length;   // cuántas veces está ya en el día
                  const dup = veces > 0;
                  const abierto = preview === name;
                  return (
                    <div key={name} className="fh-card" style={{ marginBottom:7, overflow:"hidden", borderColor:abierto?"var(--gold)":dup?"var(--line2)":"var(--line)" }}>
                      <div style={{ display:"flex", alignItems:"stretch" }}>
                        {/* Tocar el nombre abre la demostración: así ves QUÉ máquina es antes de añadirla */}
                        <button onClick={()=>setPreview(abierto?null:name)}
                          aria-expanded={abierto} aria-label={`Ver ${name}`}
                          style={{ flex:1, minWidth:0, textAlign:"left", padding:"11px 13px", background:"none", border:"none", cursor:"pointer", color:"var(--txt)" }}>
                          <div style={{ fontSize:13.5, fontWeight:600 }}>{name}</div>
                          {EX_MAQUINA[name] && <div style={{ fontSize:11, color:"var(--gold)", marginTop:2 }}>En la máquina: «{EX_MAQUINA[name]}»</div>}
                          <div style={{ fontSize:11, color:"var(--faint)", marginTop:2, display:"flex", alignItems:"center", gap:5 }}>
                            <Eye size={11}/> {EX_MUSCLE[name]}{isCardio(name) ? " · cardio" : isBodyweight(name) ? " · peso corporal" : ""}
                          </div>
                        </button>
                        {/* Sin añadir: solo "+". Ya añadido: contador con − y + para ajustar sin salir del selector. */}
                        {veces === 0 ? (
                          <button onClick={()=>onPick(name)} aria-label={`Añadir ${name}`} title="Añadir"
                            style={{ width:52, flexShrink:0, background:"var(--bg2)", border:"none", borderLeft:"1px solid var(--line)", cursor:"pointer", color:"var(--muted)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                            <Plus size={19}/>
                          </button>
                        ) : (
                          <div style={{ display:"flex", alignItems:"stretch", flexShrink:0, borderLeft:"1px solid var(--line)", background:"var(--bg2)" }}>
                            <button onClick={()=>onRemove(name)} aria-label={`Quitar ${name}`} title="Quitar"
                              style={{ width:38, background:"none", border:"none", cursor:"pointer", color:"var(--crimson)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                              <Minus size={17}/>
                            </button>
                            <span className="mono" style={{ minWidth:20, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700, color:"var(--gold)" }}>{veces}</span>
                            <button onClick={()=>onPick(name)} aria-label={`Añadir otra vez ${name}`} title="Añadir otra vez"
                              style={{ width:38, background:"none", border:"none", cursor:"pointer", color:"var(--gold)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                              <Plus size={17}/>
                            </button>
                          </div>
                        )}
                      </div>
                      {abierto && (
                        <div className="fh-in" style={{ padding:"0 13px 13px" }}>
                          <ExImage name={name}/>
                          <div style={{ fontSize:12, lineHeight:1.5, color:"var(--muted)" }}>{EX_HOW[name]}</div>
                          {veces === 0 ? (
                            <button className="fh-btn" onClick={()=>onPick(name)}
                              style={{ width:"100%", marginTop:11, background:"var(--gold)", padding:11, fontSize:13, display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                              <Plus size={15}/> Añadir a {dayName}
                            </button>
                          ) : (
                            <div style={{ display:"flex", alignItems:"center", gap:9, marginTop:11 }}>
                              <button className="fh-btn" onClick={()=>onRemove(name)} aria-label={`Quitar ${name}`}
                                style={{ width:46, background:"var(--card2)", color:"var(--crimson)", border:"1px solid var(--line2)", padding:11, display:"flex", alignItems:"center", justifyContent:"center" }}>
                                <Minus size={16}/>
                              </button>
                              <div style={{ flex:1, textAlign:"center", fontSize:12.5, color:"var(--muted)" }}>
                                <b className="mono" style={{ color:"var(--gold)", fontSize:15 }}>{veces}</b> en {dayName}
                              </div>
                              <button className="fh-btn" onClick={()=>onPick(name)} aria-label={`Añadir otra vez ${name}`}
                                style={{ width:46, background:"var(--gold)", padding:11, display:"flex", alignItems:"center", justifyContent:"center" }}>
                                <Plus size={16}/>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
  return target ? createPortal(overlay, target) : overlay;
}

const REST_OPTIONS = [0, 30, 45, 60, 75, 90, 120, 150, 180, 240];

function RoutineBuilderView({ draft, setDraft, onSave, onCancel, isNew }){
  const [picker, setPicker] = useState(null);       // índice del día al que se añaden ejercicios
  const [err, setErr] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  if(!draft) return null;

  const setField = fields => setDraft(d => ({ ...d, ...fields }));
  const setDay = (di, fields) => setDraft(d => ({ ...d, days:d.days.map((x,i)=> i===di ? { ...x, ...fields } : x) }));
  const setEx = (di, ei, fields) => setDraft(d => ({ ...d, days:d.days.map((x,i)=> i!==di ? x : ({ ...x, exercises:x.exercises.map((e,j)=> j===ei ? { ...e, ...fields } : e) })) }));
  const addDay = () => setDraft(d => ({ ...d, days:[...d.days, { name:"Día " + (d.days.length+1), exercises:[] }] }));
  const removeDay = di => { setConfirmDel(null); setDraft(d => d.days.length<=1 ? d : ({ ...d, days:d.days.filter((_,i)=>i!==di) })); };
  const copyDay = di => setDraft(d => {
    const c = { name:(d.days[di].name + " (copia)").slice(0,40), exercises:d.days[di].exercises.map(e=>({ ...e })) };
    const days = [...d.days]; days.splice(di+1, 0, c); return { ...d, days };
  });
  const addExercise = (di, name) => setDraft(d => ({ ...d, days:d.days.map((x,i)=> i!==di ? x
    : ({ ...x, exercises:[...x.exercises, { name, sets:defaultSets(name), reps:defaultReps(name), rest:defaultRest(name), muscle:EX_MUSCLE[name] }] })) }));
  const removeExercise = (di, ei) => setDraft(d => ({ ...d, days:d.days.map((x,i)=> i!==di ? x : ({ ...x, exercises:x.exercises.filter((_,j)=>j!==ei) })) }));
  /* Quita la ÚLTIMA aparición de ese ejercicio: es la que acabas de añadir desde el selector. */
  const removeExerciseByName = (di, name) => setDraft(d => ({ ...d, days:d.days.map((x,i)=>{
    if(i!==di) return x;
    const last = x.exercises.map(e=>e.name).lastIndexOf(name);
    return last<0 ? x : { ...x, exercises:x.exercises.filter((_,j)=>j!==last) };
  }) }));
  const moveExercise = (di, ei, dir) => setDraft(d => ({ ...d, days:d.days.map((x,i)=>{
    if(i!==di) return x;
    const j = ei+dir; if(j<0 || j>=x.exercises.length) return x;
    const ex = [...x.exercises]; const tmp = ex[ei]; ex[ei] = ex[j]; ex[j] = tmp; return { ...x, exercises:ex };
  }) }));

  const totalEx = draft.days.reduce((a,d)=>a+d.exercises.length, 0);
  const weekSets = routineWeeklySets(draft);
  const overCeil = Object.entries(weekSets).filter(([g,n]) => n > (GROUP_CEIL[g]||24));
  // Dos veces el mismo ejercicio en un día: casi siempre es un despiste al añadirlo.
  const dupDays = draft.days
    .map((d,i)=>({ i, name:d.name, dups:d.exercises.map(e=>e.name).filter((n,j,arr)=>arr.indexOf(n)!==j) }))
    .filter(d=>d.dups.length);

  function handleSave(){
    const name = String(draft.name||"").trim();
    if(!name) return setErr("Ponle un nombre a tu rutina para poder guardarla.");
    if(!totalEx) return setErr("Tu rutina está vacía: añade al menos un ejercicio.");
    const emptyIdx = draft.days.findIndex(d=>!d.exercises.length);
    if(emptyIdx>=0) return setErr("«" + draft.days[emptyIdx].name + "» no tiene ejercicios. Añádele alguno o borra ese día.");
    setErr(null);
    onSave({ ...draft, name });
  }

  const label = { padding:"0 2px 6px", fontSize:12, color:"var(--muted)", fontWeight:600 };
  const sectionTitle = { fontSize:12, fontWeight:700, letterSpacing:".08em", color:"var(--faint)", margin:"18px 4px 8px" };
  const miniBtn = (color="var(--muted)") => ({ background:"var(--bg2)", border:"1px solid var(--line)", borderRadius:8, width:30, height:30, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color, flexShrink:0, padding:0 });

  return (
    <div className="fh-in">
      <header style={{ padding:"22px 2px 8px", display:"flex", alignItems:"center", gap:10 }}>
        <button onClick={onCancel} aria-label="Descartar y volver" style={{ background:"var(--card)", border:"1px solid var(--line)", borderRadius:10, width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"var(--muted)", flexShrink:0 }}><ChevronLeft size={18}/></button>
        <div style={{ flex:1, minWidth:0 }}>
          <h1 style={{ margin:0, fontSize:21 }}>{isNew ? "Nueva rutina" : "Editar rutina"}</h1>
          <p style={{ margin:"3px 0 0", fontSize:12.5, color:"var(--muted)" }}>{draft.days.length} día{draft.days.length===1?"":"s"} · {totalEx} ejercicio{totalEx===1?"":"s"}</p>
        </div>
        <button className="fh-btn" onClick={handleSave} style={{ background:"var(--gold)", padding:"10px 15px", fontSize:13, display:"flex", alignItems:"center", gap:6, flexShrink:0 }}><Check size={15}/> Guardar</button>
      </header>

      {err && (
        <div className="fh-card" style={{ padding:13, marginTop:8, borderColor:"var(--crimson)", display:"flex", gap:10, alignItems:"flex-start" }}>
          <ShieldAlert size={16} color="var(--crimson)" style={{ flexShrink:0, marginTop:1 }}/>
          <div style={{ fontSize:12.5, color:"var(--txt)", lineHeight:1.45 }}>{err}</div>
        </div>
      )}

      {/* --- Datos de la rutina --- */}
      <div style={sectionTitle}>LA RUTINA</div>
      <div className="fh-card" style={{ padding:16 }}>
        <div style={label}>Nombre</div>
        <input value={draft.name} maxLength={40} onChange={e=>setField({ name:e.target.value })} placeholder="Mi rutina de torso"
          style={{ textAlign:"left", fontFamily:"'Jersey 15',monospace" }}/>
        <div style={{ ...label, marginTop:12 }}>Descripción corta <span style={{ color:"var(--faint)", fontWeight:400 }}>(opcional)</span></div>
        <input value={draft.subtitle} maxLength={60} onChange={e=>setField({ subtitle:e.target.value })} placeholder="4 días · fuerza y volumen"
          style={{ textAlign:"left", fontFamily:"'Jersey 15',monospace" }}/>
        <div style={{ ...label, marginTop:12 }}>Intensidad</div>
        <select value={draft.rpe} onChange={e=>setField({ rpe:e.target.value })}>
          <option value="6-7">Suave (RPE 6-7) · técnica y acondicionamiento</option>
          <option value="7-8">Media (RPE 7-8) · recomposición</option>
          <option value="8-9">Fuerte (RPE 8-9) · hipertrofia y fuerza</option>
        </select>
        <div style={{ fontSize:11.5, color:"var(--faint)", margin:"7px 2px 0", lineHeight:1.45 }}>
          Con esto la app calcula el <b style={{ color:"var(--muted)" }}>peso sugerido</b> la primera vez que hagas cada ejercicio. Después se ajusta solo a tus marcas.
        </div>

        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, marginTop:14, paddingTop:14, borderTop:"1px solid var(--line)" }}>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:12.5, color:"var(--txt)", display:"flex", alignItems:"center", gap:7 }}>
              <Lock size={14} color="var(--muted)"/> Rutina privada
            </div>
            <div style={{ fontSize:11, color:"var(--faint)", marginTop:3, lineHeight:1.4 }}>
              {draft.privada ? "No se comparte con tus amigos, ni aunque la publiques." : "Tus amigos podrán verla."}
            </div>
          </div>
          <ToggleSwitch on={!!draft.privada} onClick={()=>setField({ privada: !draft.privada })}/>
        </div>
      </div>

      {/* --- Días --- */}
      <div style={sectionTitle}>DÍAS DE LA RUTINA</div>
      {draft.days.map((day, di)=>(
        <div key={di} className="fh-card" style={{ padding:16, marginBottom:11 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
            <input value={day.name} maxLength={40} onChange={e=>setDay(di, { name:e.target.value })} aria-label={"Nombre del día " + (di+1)}
              style={{ flex:1, textAlign:"left", fontFamily:"'Jersey 15',monospace", fontWeight:600, fontSize:15, padding:"8px 11px" }}/>
            <button onClick={()=>copyDay(di)} title="Duplicar día" aria-label="Duplicar día" style={miniBtn()}><Copy size={14}/></button>
            <button onClick={()=>draft.days.length>1 && setConfirmDel(confirmDel===di?null:di)} title="Borrar día" aria-label="Borrar día"
              disabled={draft.days.length<=1} style={{ ...miniBtn(draft.days.length<=1?"var(--faint)":"var(--crimson)"), opacity:draft.days.length<=1?.45:1 }}><Trash2 size={14}/></button>
          </div>

          {confirmDel===di && (
            <div className="fh-card" style={{ background:"var(--bg2)", padding:12, marginBottom:11, display:"flex", alignItems:"center", gap:9, flexWrap:"wrap" }}>
              <span style={{ fontSize:12.5, color:"var(--muted)", flex:1, minWidth:130 }}>¿Borrar «{day.name}»?</span>
              <button className="fh-btn" onClick={()=>setConfirmDel(null)} style={{ background:"var(--card2)", color:"var(--muted)", border:"1px solid var(--line2)", padding:"8px 13px", fontSize:12 }}>No</button>
              <button className="fh-btn" onClick={()=>removeDay(di)} style={{ background:"var(--crimson)", color:"#fff", padding:"8px 13px", fontSize:12 }}>Sí, borrar</button>
            </div>
          )}

          {!day.exercises.length && <Empty text="Este día aún no tiene ejercicios"/>}

          {day.exercises.map((ex, ei)=>(
            <div key={ei} style={{ paddingTop:ei?11:0, marginTop:ei?11:0, borderTop:ei?"1px solid var(--line)":"none" }}>
              <div style={{ display:"flex", alignItems:"flex-start", gap:8 }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13.5, fontWeight:600 }}>{ex.name}</div>
                  <div style={{ fontSize:11, color:"var(--faint)", marginTop:2 }}>
                    {ex.muscle}
                    {isCardio(ex.name) ? (MACHINE_CARDIO.has(ex.name) ? " · tiempo, km y calorías" : " · solo tiempo")
                      : isBodyweight(ex.name) ? " · peso corporal" : ""}
                  </div>
                </div>
                <div style={{ display:"flex", gap:5, flexShrink:0 }}>
                  <button onClick={()=>moveExercise(di, ei, -1)} disabled={ei===0} aria-label="Subir ejercicio"
                    style={{ ...miniBtn(), width:28, height:28, opacity:ei===0?.35:1 }}><ArrowUp size={13}/></button>
                  <button onClick={()=>moveExercise(di, ei, 1)} disabled={ei===day.exercises.length-1} aria-label="Bajar ejercicio"
                    style={{ ...miniBtn(), width:28, height:28, opacity:ei===day.exercises.length-1?.35:1 }}><ArrowDown size={13}/></button>
                  <button onClick={()=>removeExercise(di, ei)} aria-label="Quitar ejercicio"
                    style={{ ...miniBtn("var(--crimson)"), width:28, height:28 }}><X size={14}/></button>
                </div>
              </div>

              <div style={{ display:"flex", gap:8, marginTop:9 }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:10, color:"var(--faint)", fontWeight:700, letterSpacing:".06em", marginBottom:4 }}>SERIES</div>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <button onClick={()=>setEx(di, ei, { sets:Math.max(1, ex.sets-1) })} aria-label="Menos series" style={{ ...miniBtn(), width:28, height:30 }}>−</button>
                    <span className="mono" style={{ flex:1, textAlign:"center", fontSize:15, fontWeight:700 }}>{ex.sets}</span>
                    <button onClick={()=>setEx(di, ei, { sets:Math.min(10, ex.sets+1) })} aria-label="Más series" style={{ ...miniBtn(), width:28, height:30 }}>+</button>
                  </div>
                </div>
                <div style={{ flex:1.1 }}>
                  <div style={{ fontSize:10, color:"var(--faint)", fontWeight:700, letterSpacing:".06em", marginBottom:4 }}>{repUnit(ex.reps)}</div>
                  <input value={ex.reps} maxLength={12} onChange={e=>setEx(di, ei, { reps:e.target.value })} aria-label="Repeticiones objetivo"
                    placeholder="10-12" style={{ padding:"6px 8px", fontSize:14 }}/>
                </div>
                <div style={{ flex:1.2 }}>
                  <div style={{ fontSize:10, color:"var(--faint)", fontWeight:700, letterSpacing:".06em", marginBottom:4 }}>DESCANSO</div>
                  <select value={ex.rest} onChange={e=>setEx(di, ei, { rest:Number(e.target.value) })} aria-label="Descanso entre series"
                    style={{ padding:"7px 8px", paddingRight:26, fontSize:13 }}>
                    {(REST_OPTIONS.includes(ex.rest) ? REST_OPTIONS : [...REST_OPTIONS, ex.rest].sort((a,b)=>a-b)).map(r=>(
                      <option key={r} value={r}>{r===0 ? "Sin descanso" : r+" s"}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}

          <button className="fh-btn" onClick={()=>setPicker(di)}
            style={{ width:"100%", marginTop:day.exercises.length?13:4, background:"var(--card2)", color:"var(--gold)", border:"1px solid var(--line2)", padding:11, fontSize:13, display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
            <Plus size={15}/> Añadir ejercicio
          </button>
        </div>
      ))}

      <button className="fh-btn" onClick={addDay}
        style={{ width:"100%", background:"var(--card)", color:"var(--txt)", border:"1px dashed var(--line2)", padding:13, fontSize:13, display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}>
        <CalendarDays size={15} color="var(--gold)"/> Añadir otro día
      </button>

      {/* --- Resumen de volumen (mismos topes que avisa la app al entrenar) --- */}
      {totalEx > 0 && (<>
        <div style={sectionTitle}>VOLUMEN SEMANAL</div>
        <div className="fh-card" style={{ padding:16 }}>
          <p style={{ fontSize:12, color:"var(--muted)", margin:"0 0 12px", lineHeight:1.5 }}>
            Series por grupo si haces la rutina entera en una semana, sobre el máximo que se recupera bien.
          </p>
          {BODY_STATS.map(st=>{
            const n = weekSets[st.id] || 0; if(!n) return null;
            const ceil = GROUP_CEIL[st.id] || 24;
            const over = n > ceil, near = !over && n >= ceil*0.8;
            const col = over ? "var(--crimson)" : near ? "var(--ember)" : st.color;
            return (
              <div key={st.id} style={{ marginBottom:10 }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:5 }}>
                  <span style={{ color:"var(--muted)" }}>{st.id}</span>
                  <span className="mono" style={{ color:col, fontWeight:700 }}>{n} / {ceil}</span>
                </div>
                <div className="fh-bar"><i style={{ width:`${Math.min(100, (n/ceil)*100)}%`, background:col }}/></div>
              </div>
            );
          })}
          {overCeil.length > 0 && (
            <div style={{ display:"flex", gap:9, alignItems:"flex-start", marginTop:12, paddingTop:12, borderTop:"1px solid var(--line)" }}>
              <ShieldAlert size={15} color="var(--crimson)" style={{ flexShrink:0, marginTop:1 }}/>
              <div style={{ fontSize:11.5, color:"var(--muted)", lineHeight:1.5 }}>
                Te pasas de series en <b style={{ color:"var(--txt)" }}>{overCeil.map(([g])=>g).join(", ")}</b>. Más volumen no da más músculo y sube el riesgo de lesión: quita alguna serie o reparte esos ejercicios en otro día.
              </div>
            </div>
          )}
          {dupDays.length > 0 && (
            <div style={{ display:"flex", gap:9, alignItems:"flex-start", marginTop:12, paddingTop:12, borderTop:"1px solid var(--line)" }}>
              <Info size={15} color="var(--ember)" style={{ flexShrink:0, marginTop:1 }}/>
              <div style={{ fontSize:11.5, color:"var(--muted)", lineHeight:1.5 }}>
                Repites <b style={{ color:"var(--txt)" }}>{dupDays[0].dups[0]}</b> dentro de «{dupDays[0].name}». Si no es a propósito, mejor una variante distinta: trabaja lo mismo desde otro ángulo.
              </div>
            </div>
          )}
        </div>
      </>)}

      <div style={{ display:"flex", gap:9, marginTop:14 }}>
        <button className="fh-btn" onClick={onCancel} style={{ flex:1, background:"var(--card2)", color:"var(--muted)", border:"1px solid var(--line2)", padding:13, fontSize:13 }}>Descartar</button>
        <button className="fh-btn" onClick={handleSave} style={{ flex:1.4, background:"var(--gold)", padding:13, fontSize:13.5, display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}><Check size={16}/> Guardar rutina</button>
      </div>
      <p style={{ fontSize:11.5, color:"var(--faint)", textAlign:"center", marginTop:12, lineHeight:1.55 }}>
        Tus rutinas se guardan solo en este móvil y entran en la copia de seguridad de Ajustes.
      </p>

      {picker !== null && (
        <ExercisePicker
          dayName={draft.days[picker]?.name || "este día"}
          already={(draft.days[picker]?.exercises || []).map(e=>e.name)}
          onPick={name=>addExercise(picker, name)}
          onRemove={name=>removeExerciseByName(picker, name)}
          onClose={()=>setPicker(null)}/>
      )}
    </div>
  );
}

/* =========================================================================
   ENTRENAMIENTO EN CURSO
   ========================================================================= */

/* Cambiar un ejercicio a media sesión: la máquina está ocupada, rota, o
   simplemente hoy no te apetece. Sin esto la única salida era marcar como
   hecho algo que no hiciste, y entonces las marcas y el historial mienten.

   Se ofrecen primero los del MISMO grupo muscular, que es lo que hace que el
   cambio no descuadre la rutina: si tocaba espalda, sigues haciendo espalda. */
function SustituirPanel({ ex, onElegir, onCerrar }){
  const [busca, setBusca] = useState("");
  const grupo = BODY_MAP[ex.muscle || EX_MUSCLE[ex.name]];

  const mismoGrupo = useMemo(()=>{
    const t = String(busca||"").trim().toLowerCase();
    return Object.keys(EX_MUSCLE)
      .filter(n => n !== ex.name && BODY_MAP[EX_MUSCLE[n]] === grupo)
      .filter(n => !t || n.toLowerCase().includes(t))
      .sort((a,b)=>a.localeCompare(b,"es"))
      .slice(0, 40);
  }, [busca, grupo, ex.name]);

  const otros = useMemo(()=>{
    const t = String(busca||"").trim().toLowerCase();
    if(t.length < 2) return [];
    return Object.keys(EX_MUSCLE)
      .filter(n => n !== ex.name && BODY_MAP[EX_MUSCLE[n]] !== grupo && n.toLowerCase().includes(t))
      .sort((a,b)=>a.localeCompare(b,"es"))
      .slice(0, 15);
  }, [busca, grupo, ex.name]);

  const Fila = ({ n, fuera }) => (
    <button key={n} onClick={()=>onElegir(n)}
      style={{ width:"100%", textAlign:"left", background:"var(--card)", border:"1px solid var(--line)", borderRadius:10, padding:"10px 12px", marginBottom:6, cursor:"pointer", color:"var(--txt)", display:"flex", alignItems:"center", gap:9 }}>
      <span style={{ flex:1, minWidth:0, fontSize:12.5, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{n}</span>
      {fuera && <span className="fh-chip" style={{ background:"var(--bg2)", color:"var(--faint)", border:"none", flexShrink:0, fontSize:10 }}>{BODY_MAP[EX_MUSCLE[n]]}</span>}
      <Plus size={14} color="var(--gold)" style={{ flexShrink:0 }}/>
    </button>
  );

  return (
    <div className="fh-in" style={{ background:"var(--bg2)", border:"1px solid var(--line)", borderRadius:11, padding:"12px 13px", marginBottom:12 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8, marginBottom:8 }}>
        <span className="disp" style={{ fontWeight:600, fontSize:13 }}>Cambiar «{ex.name}»</span>
        <button onClick={onCerrar} aria-label="Cerrar" style={{ background:"none", border:"none", padding:2, cursor:"pointer", color:"var(--faint)" }}><X size={15}/></button>
      </div>
      <p style={{ fontSize:11.5, color:"var(--muted)", margin:"0 0 10px", lineHeight:1.45 }}>
        ¿Ocupada o fuera de servicio? Elige otro y se apunta lo que has hecho de verdad. Las series de este ejercicio se vacían.
      </p>
      <input value={busca} onChange={e=>setBusca(e.target.value)} maxLength={30}
        placeholder={`Buscar en ${grupo || "el catálogo"}…`} aria-label="Buscar un ejercicio"
        style={{ textAlign:"left", marginBottom:10 }}/>

      <div style={{ maxHeight:240, overflowY:"auto" }}>
        {mismoGrupo.map(n => <Fila key={n} n={n}/>)}
        {!mismoGrupo.length && !otros.length && (
          <div style={{ fontSize:12, color:"var(--faint)", padding:"6px 2px" }}>Nada con ese nombre.</div>
        )}
        {otros.length > 0 && (<>
          <div style={{ fontSize:10.5, color:"var(--faint)", fontWeight:700, letterSpacing:".06em", margin:"10px 2px 6px" }}>DE OTROS GRUPOS</div>
          {otros.map(n => <Fila key={n} n={n} fuera/>)}
        </>)}
      </div>
    </div>
  );
}

function WorkoutView({ session, setSession, finishWorkout, setTab, log, weekStart, bests, sesionConjunta, peso, sexo, misBests, nextWeight, onAbandonar, onSalir, juego, onImpulso, avatar }){
  const [howOpen, setHowOpen] = useState(null);
  const [anadiendo, setAnadiendo] = useState(false);        // selector de ejercicios abierto
  const [flotantes, setFlotantes] = useState([]);           // "+5 XP" que suben desde el botón
  /* Cronómetro del cardio: { exI, setI, desde }. Cuenta HACIA ARRIBA desde que
     le das a Comenzar; el tiempo real es el que decides tú al parar, no un
     objetivo que hay que teclear al acabar. Va dentro de la sesión para que siga
     contando si Android mata la app: con la cinta en marcha nadie toca el móvil. */
  const crono = session?.crono || null;
  const descanso = session?.descanso || null;   // { hasta, total }: también en la sesión, por lo mismo
  const [ahora, setAhora] = useState(Date.now());
  const [sustituyendo, setSustituyendo] = useState(null);   // índice del ejercicio a cambiar
  useEffect(()=>{
    if(!crono) return;
    const t = setInterval(()=>setAhora(Date.now()), 250);
    return ()=>clearInterval(t);
  }, [crono]);
  if(!session){ setTab("rutinas"); return null; }
  const isRecomp = session.isRecomp ?? (ROUTINES.find(r=>r.id===session.routineId)?.cat==="Recomposición");

  // Protección del usuario: volumen semanal por grupo + aviso de recuperación
  const sessionGroups=[...new Set(session.exercises.map(e=>BODY_MAP[e.muscle]).filter(Boolean))];
  const weekSets=weeklySetsByGroup(log, weekStart);
  const yGroups=groupsTrainedOn(log, addDaysISO(todayISO(),-1));
  const warns=[];
  sessionGroups.forEach(g=>{ const done=weekSets[g]||0; const ceil=GROUP_CEIL[g]||24;
    if(done>=ceil) warns.push({ level:"alto", msg:`Ya llevas ${done} series de ${g} esta semana, por encima de lo que se recupera bien. Más volumen no da más músculo y sube el riesgo de lesión: baja series o descansa este grupo.` });
    else if(done>=ceil*0.8) warns.push({ level:"medio", msg:`Llevas ${done} series de ${g} esta semana, cerca del máximo saludable. Cuida la técnica y no te pases de series.` });
    else if(yGroups.includes(g)) warns.push({ level:"recup", msg:`Entrenaste ${g} ayer. Deja ~48 h entre sesiones duras del mismo grupo para recuperar y no perder forma.` });
  });

  const totalSets=session.exercises.reduce((a,e)=>a+e.logs.length,0);
  const doneSets=session.exercises.reduce((a,e)=>a+e.logs.filter(l=>l.done).length,0);

  function setEnergy(val){
    const mult=ENERGY[val].mult;
    const exercises=session.exercises.map(e=>{
      if(isBodyweight(e.name)) return e;            // sin carga: no hay peso que ajustar
      return { ...e, logs:e.logs.map(l=> l.done? l : ({ ...l, weight: round25(((l.base ?? e.base)||10)*mult)||"" })) };
    });
    setSession({ ...session, energy:val, exercises });
  }
  /* El nivel de la máquina es el mismo para toda la tirada: se aplica a las series pendientes. */
  function setExerciseField(exI, field, val){
    const exercises=session.exercises.map((e,i)=> i!==exI? e : ({ ...e, logs:e.logs.map(l=> l.done? l : ({ ...l, [field]:val })) }));
    setSession({ ...session, exercises });
  }
  function setExerciseWeight(exI, w){
    /* Con agarres, el desplegable es el de la serie que toca: el otro agarre lleva su peso. */
    const ex=session.exercises[exI], pend=ex.logs.find(l=>!l.done), otro=l=>tieneAgarres(ex.name) && pend && agarreDe(ex,l)!==agarreDe(ex,pend);
    const exercises=session.exercises.map((e,i)=> i!==exI? e : ({ ...e, logs:e.logs.map(l=> l.done || otro(l) ? l : ({ ...l, weight:w })) }));
    setSession({ ...session, exercises });
  }
  function update(exI,setI,field,val){
    const exercises=session.exercises.map((e,i)=> i!==exI? e : ({ ...e, logs:e.logs.map((l,j)=> j===setI? ({ ...l,[field]:val }) : l) }));
    setSession({ ...session, exercises });
  }
  /* El XP real lo reparte finishWorkout; esto solo enseña que acaba de caer. */
  function flotar(e, texto, color, retraso=0){
    const id = Math.random();
    const x = Math.min(window.innerWidth-70, Math.max(70, e?.clientX || window.innerWidth/2));
    const y = (e?.clientY || window.innerHeight/2) - 16 - retraso/12;
    setTimeout(()=>setFlotantes(f=>[...f, { id, x, y, texto, color }]), retraso);
    setTimeout(()=>setFlotantes(f=>f.filter(v=>v.id!==id)), retraso+1000);
  }
  function completeSet(exI,setI,evento){
    const ex=session.exercises[exI]; const wasDone=ex.logs[setI].done;
    if(!wasDone){
      const kg = parseFloat(ex.logs[setI].weight)||0, marca = misBests?.[nombreSerie(ex, ex.logs[setI])];
      flotar(evento, "+5 XP", "#FFC83D");
      if(kg>0 && marca!=null && kg>marca){ flotar(evento, "NEW RECORD!", "#3DDC84", 220); sfx("record",.55); vibrar([30,40,60]); }
      else { sfx("serie",.35); vibrar(18); }
    }
    const exercises=session.exercises.map((e,i)=> i!==exI? e : ({ ...e, logs:e.logs.map((l,j)=> j===setI? ({ ...l, done:!wasDone }) : l) }));
    // El cardio continuo va con rest 0: no tiene sentido abrir el cronómetro de descanso.
    const empieza = !wasDone && ex.rest>0;
    // Cada serie real carga la mazmorra. Se cuenta el máximo de hechas, no los toques:
    // marcar y desmarcar no da Impulso gratis.
    const hechas = exercises.reduce((n,e)=>n+e.logs.filter(l=>l.done).length, 0);
    if(hechas>(session.impulsoMax||0)) onImpulso?.();
    setSession({ ...session, exercises, impulsoMax:Math.max(session.impulsoMax||0, hechas), descanso: empieza ? { hasta:Date.now()+ex.rest*1000, total:ex.rest } : descanso });
  }
  /* Funcional: el descanso acaba solo, desde un bucle que no ve la sesión de este render. */
  function cerrarDescanso(){ setSession(s=> s ? { ...s, descanso:null } : s); }
  function saltarDescanso(){ cancelarAvisoDescanso(); cerrarDescanso(); }
  function alargarDescanso(){ setSession(s=> s?.descanso ? { ...s, descanso:{ ...s.descanso, hasta:s.descanso.hasta+15000 } } : s); }

  /* --- Cronómetro de cardio ---------------------------------------------- */

  function arrancarCrono(exI, setI){ setAhora(Date.now()); setSession({ ...session, crono:{ exI, setI, desde:Date.now() } }); }

  /* Al parar se apuntan los minutos de verdad y se rellenan km y kcal con la
     estimación. Son un punto de partida: si miras la consola y dice otra cosa,
     la escribes encima. Nunca se pisa un valor ya escrito a mano. */
  function pararCrono(){
    if(!crono) return;
    const { exI, setI, desde } = crono;
    const ex = session.exercises[exI];
    const segundos = Math.max(1, Math.round((Date.now() - desde) / 1000));
    const unidad = repUnit(ex.reps);
    const valor = unidad === "MIN" ? Math.max(1, Math.round(segundos / 60)) : segundos;

    const l = ex.logs[setI];
    const est = hasConsole(ex)
      ? estimarCardio({ nombre:ex.name, minutos:segundos/60, pesoKg:peso,
          nivel: porVelocidad(ex.name) ? null : l.level,
          kmh:   porVelocidad(ex.name) ? l.level : null })
      : null;

    const exercises = session.exercises.map((e,i)=> i!==exI ? e : ({ ...e, logs:e.logs.map((x,j)=>{
      if(j!==setI) return x;
      const n = { ...x, reps:String(valor), segundos };
      if(est){
        if(est.km != null && !x.km)  { n.km = String(est.km); n.kmEstimado = true; }
        if(est.kcal && !x.kcal)      { n.kcal = String(est.kcal); n.kcalEstimado = true; }
      }
      return n;
    }) }));
    setSession({ ...session, exercises, crono:null });
  }

  /* --- Cambiar la sesión sin salir ---------------------------------------
     Toca la sesión de hoy, no la rutina. `editado` hace que al terminar se
     pregunte si guardarlo en la rutina, y ahí se decide. Tope de 10 series: lo
     mismo que acepta una rutina guardada. */
  function pesoInicial(nombre){
    const sinCarga = isBodyweight(nombre) || isCardio(nombre);
    /* Mismo criterio que al empezar la sesión: progresión, marca conocida o peso
       base. Sin esto el desplegable de peso salía vacío y había que teclearlo. */
    const conocida = nextWeight?.[nombre] ?? misBests?.[nombre];
    const base = sinCarga ? 0
      : (conocida != null ? conocida : baseFor(nombre, sexo) * startWeightMult(session.rpe) * bodyweightFactor(peso, sexo));
    return { base, sug: sinCarga ? "" : round25(base) || "" };
  }
  function serieVacia(nombre, reps, sug, nivel=""){
    const objetivo = String(reps).match(/^(\d+)/);
    return isCardio(nombre)
      ? { weight:"", reps: objetivo ? objetivo[1] : "", km:"", kcal:"", level:nivel, done:false }
      : { weight:sug, reps: parseTargetReps(reps), done:false };
  }
  /* Al cambiar de agarre, el peso sale de la última serie con ese agarre o, si es la
     primera, de sus marcas: el cerrado no se levanta con lo mismo que el abierto. */
  function cambiarAgarre(exI, setI, agarre){
    const ex = session.exercises[exI], l = ex.logs[setI];
    if(l.done || agarreDe(ex, l)===agarre) return;
    const igual = ex.logs.filter((x,j)=>j!==setI && agarreDe(ex, x)===agarre && x.weight!=="").pop();
    const { base } = pesoInicial(AGARRES[agarre]);
    const nuevo = { agarre, base:igual?.base ?? base, weight:igual ? igual.weight : round25(base*ENERGY[session.energy].mult)||"" };
    setSession({ ...session, exercises:session.exercises.map((e,i)=> i!==exI ? e : ({ ...e, logs:e.logs.map((x,j)=> j===setI ? { ...x, ...nuevo } : x) })) });
  }
  function cambiarSerie(exI, fn){
    setSession(s=>({ ...s, editado:true, exercises:s.exercises.map((e,i)=> i===exI ? fn(e) : e) }));
  }
  function anadirSerie(exI){
    cambiarSerie(exI, e=>{
      if(e.logs.length>=10) return e;
      const ultima = e.logs[e.logs.length-1];
      const nueva = serieVacia(e.name, e.reps, ultima?.weight ?? "", ultima?.level || "");
      // La nueva parte de lo que acabas de levantar, no del objetivo de la rutina.
      const agarre = ultima?.agarre ? { agarre:ultima.agarre, base:ultima.base } : {};
      return { ...e, logs:[...e.logs, isCardio(e.name) ? nueva : { ...nueva, ...agarre, reps:ultima?.reps ?? nueva.reps }] };
    });
  }
  /* Quita la última serie sin hacer. Las hechas no se tocan: son lo que has entrenado. */
  function quitarSerie(exI){
    const ex = session.exercises[exI];
    const i = ex.logs.map(l=>!l.done).lastIndexOf(true);
    if(i<0 || (crono?.exI===exI && crono?.setI===i)) return;
    if(ex.logs.length===1){
      if(session.exercises.length>1 && confirm(`¿Quitar ${ex.name} del entreno de hoy?`)) quitarEjercicio(exI);
      return;
    }
    setSession(s=>({ ...s, editado:true,
      crono: s.crono?.exI===exI && s.crono.setI>i ? { ...s.crono, setI:s.crono.setI-1 } : s.crono,
      exercises:s.exercises.map((e,n)=> n===exI ? { ...e, logs:e.logs.filter((_,j)=>j!==i) } : e) }));
  }
  function quitarEjercicio(exI){
    setSustituyendo(null); setHowOpen(null);
    setSession(s=>{
      let c = s.crono;
      if(c?.exI===exI) c = null; else if(c && c.exI>exI) c = { ...c, exI:c.exI-1 };
      return { ...s, editado:true, crono:c, exercises:s.exercises.filter((_,i)=>i!==exI) };
    });
  }
  function anadirEjercicio(nombre){
    const { base, sug } = pesoInicial(nombre);
    const reps = defaultReps(nombre);
    const peso0 = sug==="" ? "" : round25(base*ENERGY[session.energy].mult) || sug;
    const nuevo = { name:nombre, muscle:EX_MUSCLE[nombre], base, reps, rest:defaultRest(nombre), anadido:true,
      logs:Array.from({ length:defaultSets(nombre) }, ()=>serieVacia(nombre, reps, peso0)) };
    setSession(s=>({ ...s, editado:true, exercises:[...s.exercises, nuevo] }));
  }
  /* Desde el selector: quita la última copia que aún no se haya empezado. */
  function quitarDelSelector(nombre){
    const i = session.exercises.map(e=>e.name===nombre && !e.logs.some(l=>l.done)).lastIndexOf(true);
    if(i>=0 && session.exercises.length>1) quitarEjercicio(i);
  }

  /* --- Sustituir un ejercicio -------------------------------------------- */

  /* La máquina está ocupada o rota y haces otra cosa. Cambiarlo aquí evita la
     única alternativa que había: apuntar como hecho algo que no hiciste. */
  function sustituirEjercicio(exI, nombreNuevo){
    const viejo = session.exercises[exI];
    if(!nombreNuevo || nombreNuevo === viejo.name) { setSustituyendo(null); return; }
    const reps = defaultReps(nombreNuevo);
    const { base, sug } = pesoInicial(nombreNuevo);
    const nuevo = {
      ...viejo,
      name: nombreNuevo,
      muscle: EX_MUSCLE[nombreNuevo] || viejo.muscle,
      base,
      reps,
      rest: defaultRest(nombreNuevo),
      sustituyeA: viejo.sustituyeA || viejo.name,
      // Las series ya hechas no se arrastran: eran de otro ejercicio.
      logs: viejo.logs.map(()=>serieVacia(nombreNuevo, reps, sug)),
    };
    const exercises = session.exercises.map((e,i)=> i===exI ? nuevo : e);
    setSession({ ...session, exercises, crono: crono?.exI === exI ? null : crono });
    setSustituyendo(null);
  }

  const mult=ENERGY[session.energy].mult;
  const EnergyIcon = ENERGY[session.energy].icon;

  return (
    <div className="fh-in" style={{ paddingBottom:24 }}>
      <header style={{ padding:"20px 2px 10px", display:"flex", alignItems:"center", gap:10 }}>
        <button onClick={()=>{ if(confirm("¿Salir del entrenamiento? Se perderá lo no guardado.")){ if(doneSets>0) onAbandonar?.(); onSalir?.(); setSession(null); setTab("rutinas"); } }}
          style={{ background:"var(--card)", border:"1px solid var(--line)", borderRadius:10, padding:8, cursor:"pointer", color:"var(--txt)", display:"flex" }}><ChevronLeft size={18}/></button>
        <div style={{ flex:1 }}><div style={{ fontSize:11, color:"var(--muted)", fontWeight:600 }}>{session.routineName} · RPE {session.rpe}</div><h1 style={{ margin:0, fontSize:19 }}>{session.dayName}</h1></div>
        <div className="mono" style={{ fontSize:13, color:"var(--gold)" }}>{doneSets}/{totalSets}</div>
      </header>

      <div className="fh-bar" style={{ margin:"0 2px 14px" }}><i style={{ width:`${(doneSets/totalSets)*100}%`, background:"var(--gold)" }}/></div>

      {warns.length>0 && (
        <div style={{ marginBottom:14 }}>
          {warns.map((w,i)=>{ const c=w.level==="alto"?"var(--crimson)":w.level==="medio"?"var(--amber)":"var(--sky)";
            return (<div key={i} className="fh-card" style={{ padding:"11px 13px", borderColor:c, display:"flex", gap:10, alignItems:"flex-start", marginBottom:8, background:"var(--card2)" }}>
              <ShieldAlert size={17} color={c} style={{ flexShrink:0, marginTop:1 }}/>
              <div style={{ fontSize:12, color:"var(--txt)", lineHeight:1.45 }}>{w.msg}</div>
            </div>); })}
        </div>
      )}

      {/* Ajuste por fase del ciclo */}
      {session.cyclePhase && (
        <div className="fh-card" style={{ padding:"11px 13px", marginBottom:12, borderColor:session.cyclePhase.color, display:"flex", gap:10, alignItems:"flex-start" }}>
          <Heart size={16} color={session.cyclePhase.color} style={{ flexShrink:0, marginTop:1 }}/>
          <div style={{ fontSize:12, color:"var(--txt)", lineHeight:1.45 }}><b style={{ color:session.cyclePhase.color }}>{session.cyclePhase.label}:</b> {session.cyclePhase.training} Hemos ajustado tu energía de hoy; cámbiala si lo notas distinto.</div>
        </div>
      )}

      {/* Energía del día */}
      <div className="fh-card" style={{ padding:"12px 14px", marginBottom:14, display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:7, color:"var(--gold)" }}><EnergyIcon size={17}/><span style={{ fontSize:12.5, fontWeight:600, color:"var(--txt)" }}>Energía de hoy</span></div>
        <select value={session.energy} onChange={e=>setEnergy(e.target.value)} style={{ flex:1, padding:"9px 12px", fontSize:14 }}>
          <option value="alto">Con ganas · pesos +5%</option>
          <option value="normal">Normal · pesos base</option>
          <option value="bajo">Cansado · pesos -10%</option>
        </select>
      </div>

      {/* El descanso se muestra como pop-up a pantalla completa (ver más abajo) */}

      {session.exercises.map((ex,exI)=>{
        const enCurso = exI===session.exercises.findIndex(e=>e.logs.some(l=>!l.done));   // el héroe va con el que toca
        // Peso corporal / isométrico / cardio: se oculta todo lo relativo a la carga.
        const bw=isBodyweight(ex.name);
        const cardio=isCardio(ex.name);
        const consola=hasConsole(ex);                      // máquina con pantalla: km, kcal y nivel
        const unit=repUnit(ex.reps);                       // REPS · SEG · MIN
        const cols=consola ? "22px 1fr 1fr 1fr 84px" : bw ? "28px 1fr 90px" : "28px 1fr 1fr 90px";
        const pendiente=ex.logs.find(l=>!l.done);
        const sug=bw ? 0 : round25(((pendiente?.base ?? ex.base)||10)*mult);
        const opts=bw ? [] : [...new Set([round25(sug*0.85),round25(sug*0.9),round25(sug*0.95),sug,round25(sug*1.05),round25(sug*1.1)])].filter(v=>v>0);
        const curW=ex.logs.find(l=>!l.done)?.weight ?? ex.logs[0].weight;
        const rec=cardio ? bests?.[ex.name] : null;        // récord de cardio de este ejercicio
        const curLevel=ex.logs.find(l=>!l.done)?.level ?? ex.logs[0].level ?? "";
        return (
          <div key={exI} className="fh-card" style={{ padding:15, marginBottom:11 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10, gap:8 }}>
              <div><div className="disp" style={{ fontWeight:700, fontSize:15 }}>{ex.name}</div>
                <div style={{ fontSize:11, color:"var(--faint)" }}>objetivo {ex.reps}{ex.rest>0?` · descanso ${ex.rest}s`:""}{ex.note?<span style={{ color:"var(--ember)" }}> · {ex.note}</span>:""}</div>
                {ex.sustituyeA && <div style={{ fontSize:10.5, color:"var(--sky)", marginTop:3 }}>en lugar de {ex.sustituyeA}</div>}</div>
              <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                <button onClick={()=>{ setSustituyendo(sustituyendo===exI?null:exI); setHowOpen(null); }}
                  aria-label={`Sustituir ${ex.name}`} title="La máquina está ocupada o rota"
                  style={{ background:"var(--bg2)", border:`1px solid ${sustituyendo===exI?"var(--gold)":"var(--line2)"}`, borderRadius:9, padding:"6px 10px", cursor:"pointer", color:sustituyendo===exI?"var(--gold)":"var(--muted)", display:"flex", alignItems:"center", gap:4, fontSize:11, fontFamily:"'Jersey 15',monospace", fontWeight:600 }}>
                  <Shuffle size={13}/> Cambiar
                </button>
                <button onClick={()=>{ setHowOpen(howOpen===exI?null:exI); setSustituyendo(null); }} style={{ background:"var(--bg2)", border:`1px solid ${howOpen===exI?"var(--gold)":"var(--line2)"}`, borderRadius:9, padding:"6px 10px", cursor:"pointer", color:howOpen===exI?"var(--gold)":"var(--muted)", display:"flex", alignItems:"center", gap:4, fontSize:11, fontFamily:"'Jersey 15',monospace", fontWeight:600 }}>
                  <Info size={13}/> Cómo
                </button>
              </div>
            </div>
            {enCurso && avatar && <HeroeEjercicio av={avatar} nombre={ex.name}/>}
            {sustituyendo===exI && (
              <SustituirPanel ex={ex} onElegir={n=>sustituirEjercicio(exI, n)} onCerrar={()=>setSustituyendo(null)}/>
            )}

            {howOpen===exI && (
              <div className="fh-in" style={{ background:"var(--bg2)", border:"1px solid var(--line)", borderRadius:11, padding:"11px 13px", marginBottom:12 }}>
                <ExImage name={ex.name}/>
                {EX_MAQUINA[ex.name] && <div style={{ fontSize:12, fontWeight:700, color:"var(--gold)", marginBottom:4 }}>En la máquina: «{EX_MAQUINA[ex.name]}»</div>}
                <div style={{ fontSize:12.5, lineHeight:1.5, color:"var(--muted)" }}>{EX_HOW[ex.name] || "Realiza el movimiento de forma controlada y con buena técnica, sin comprometer la espalda. Si tienes dudas, pide ayuda a un monitor del gimnasio."}</div>
              </div>
            )}

            {/* Cardio: sin carga y (salvo intervalos) sin descanso */}
            {cardio && (
              <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:10, fontSize:11, color:"var(--muted)", flexWrap:"wrap" }}>
                <span className="fh-chip" style={{ background:"var(--bg2)", color:"#E56B9F" }}>CARDIO</span>
                <span>{consola ? "Anota el tiempo y lo que marque la máquina." : ex.rest>0 ? "Intervalos: anota el tiempo de cada uno." : "Sin carga ni descanso: anota el tiempo."}</span>
              </div>
            )}

            {/* Marcador: tu mejor marca en este ejercicio */}
            {cardio && rec && (rec.min>0 || rec.km>0 || rec.kcal>0) && (
              <div style={{ display:"flex", alignItems:"flex-start", gap:8, marginBottom:11, padding:"9px 11px", background:"var(--bg2)", border:"1px solid var(--line)", borderRadius:11 }}>
                <Crown size={14} color="var(--gold)" style={{ flexShrink:0, marginTop:1 }}/>
                <div style={{ fontSize:11.5, color:"var(--muted)", lineHeight:1.5 }}>
                  <b style={{ color:"var(--txt)" }}>Tu récord:</b> {cardioRecordText(rec)}
                  {rec.date && <span style={{ color:"var(--faint)" }}> · {rec.date.slice(8,10)}/{rec.date.slice(5,7)}</span>}
                </div>
              </div>
            )}

            {/* Peso corporal (no cardio): no hay carga que elegir, solo reps o tiempo */}
            {bw && !cardio && (
              <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:12, fontSize:11, color:"var(--muted)" }}>
                <span className="fh-chip" style={{ background:"var(--bg2)", color:"var(--jade)" }}>PESO CORPORAL</span>
                <span>Sin carga: anota solo {unit==="REPS"?"las repeticiones":unit==="SEG"?"los segundos":"los minutos"}.</span>
              </div>
            )}

            {/* Nivel de la máquina: el mismo para toda la tirada */}
            {consola && (
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                <span style={{ fontSize:11, color:"var(--muted)", whiteSpace:"nowrap" }}>
                  {porVelocidad(ex.name) ? "Velocidad (km/h)" : "Nivel de la máquina"}
                </span>
                <input inputMode="decimal" placeholder="—" value={curLevel}
                  onChange={e=>setExerciseField(exI, "level", porVelocidad(ex.name)
                    ? e.target.value.replace(/[^\d.,]/g,"").replace(",",".").slice(0,4)
                    : e.target.value.replace(/[^\d]/g,"").slice(0,2))}
                  aria-label={porVelocidad(ex.name) ? "Velocidad en km por hora" : "Nivel de la máquina"}
                  style={{ flex:1, padding:"8px 12px", fontSize:14 }}/>
              </div>
            )}

            {/* Desplegable de peso del ejercicio */}
            {opts.length>0 && (
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                <span style={{ fontSize:11, color:"var(--muted)", whiteSpace:"nowrap" }}>{tieneAgarres(ex.name) && pendiente ? `Peso · ${agarreDe(ex, pendiente)}` : "Peso a levantar"}</span>
                <select value={String(curW)} onChange={e=>setExerciseWeight(exI, e.target.value)} style={{ flex:1, padding:"8px 12px", fontSize:14 }}>
                  {opts.map(o=>(<option key={o} value={String(o)}>{o} kg{o===sug?"  · sugerido":""}</option>))}
                </select>
              </div>
            )}

            <div style={{ display:"grid", gridTemplateColumns:cols, gap:consola?6:8, fontSize:10, color:"var(--faint)", fontWeight:600, marginBottom:6, padding:"0 2px" }}>
              <span>#</span>
              {!bw && <span style={{ textAlign:"center" }}>KG</span>}
              <span style={{ textAlign:"center" }}>{unit}</span>
              {consola && <><span style={{ textAlign:"center" }}>KM</span><span style={{ textAlign:"center" }}>KCAL</span></>}
              <span></span>
            </div>
            {ex.logs.map((l,setI)=>{
              const contando = crono?.exI===exI && crono?.setI===setI;
              const seg = contando ? Math.max(0, Math.round((ahora - crono.desde)/1000)) : 0;
              return (
              <div key={setI}>
                <div style={{ display:"grid", gridTemplateColumns:cols, gap:consola?6:8, alignItems:"center", marginBottom:7 }}>
                  <span className="mono" style={{ fontSize:13, color:"var(--muted)", textAlign:"center" }}>{setI+1}</span>
                  {!bw && <input inputMode="decimal" placeholder="0" value={l.weight} onChange={e=>update(exI,setI,"weight",e.target.value)} disabled={l.done} style={{ opacity:l.done?.5:1, padding:"10px 4px" }}/>}
                  <input inputMode="numeric" placeholder="0" value={l.reps} onChange={e=>update(exI,setI,"reps",e.target.value)} disabled={l.done} style={{ opacity:l.done?.5:1, padding:consola?"10px 6px":"10px 4px" }}/>
                  {consola && <>
                    <input inputMode="decimal" placeholder="—" value={l.km||""}
                      onChange={e=>{ update(exI,setI,"km",e.target.value); update(exI,setI,"kmEstimado",false); }}
                      disabled={l.done} aria-label="Kilómetros recorridos"
                      style={{ opacity:l.done?.5:1, padding:"10px 6px", color:l.kmEstimado?"var(--sky)":undefined }}/>
                    <input inputMode="numeric" placeholder="—" value={l.kcal||""}
                      onChange={e=>{ update(exI,setI,"kcal",e.target.value); update(exI,setI,"kcalEstimado",false); }}
                      disabled={l.done} aria-label="Calorías quemadas"
                      style={{ opacity:l.done?.5:1, padding:"10px 6px", color:l.kcalEstimado?"var(--sky)":undefined }}/>
                  </>}
                  <button className="fh-btn" onClick={e=>completeSet(exI,setI,e)}
                    style={{ height:40, background:l.done?"var(--jade)":"var(--card2)", color:l.done?"#0F131A":"var(--muted)", fontSize:12, display:"flex", alignItems:"center", justifyContent:"center", gap:4, border:l.done?"none":"1px solid var(--line2)" }}>
                    {l.done ? <><Check size={15}/> Hecho</> : ex.rest>0 ? <><Timer size={13}/> Descanso</> : <><Check size={14}/> Marcar</>}
                  </button>
                </div>

                {tieneAgarres(ex.name) && (
                  <div role="group" aria-label={`Agarre de la serie ${setI+1}`} style={{ display:"flex", gap:6, margin:"-2px 0 9px 36px" }}>
                    {Object.keys(AGARRES).map(a=>{
                      const activo = agarreDe(ex, l)===a;
                      return <button key={a} className="fh-btn" aria-pressed={activo} disabled={l.done} onClick={()=>cambiarAgarre(exI, setI, a)}
                        style={{ flex:1, padding:"5px 6px", fontSize:12.5, opacity:l.done && !activo ? .4 : 1, background:activo ? "var(--gold)" : "var(--bg2)", color:activo ? "#0F131A" : "var(--muted)", border:`1px solid ${activo ? "var(--gold)" : "var(--line2)"}` }}>{a==="abierto" ? "Abierto" : "Cerrado"}</button>;
                    })}
                  </div>
                )}

                {/* Cardio: el tiempo se mide, no se teclea. */}
                {cardio && !l.done && (
                  contando ? (
                    <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:9, padding:"9px 11px", background:"rgba(63,185,132,.10)", border:"1px solid var(--jade)", borderRadius:11 }}>
                      <span className="mono" style={{ fontSize:22, fontWeight:700, color:"var(--jade)", minWidth:78, fontVariantNumeric:"tabular-nums" }}>
                        {String(Math.floor(seg/60)).padStart(2,"0")}:{String(seg%60).padStart(2,"0")}
                      </span>
                      <span style={{ flex:1, fontSize:11, color:"var(--muted)", lineHeight:1.4 }}>En marcha. Para cuando acabes.</span>
                      <button className="fh-btn" onClick={pararCrono}
                        style={{ background:"var(--jade)", padding:"9px 15px", fontSize:12.5, flexShrink:0 }}>Detener</button>
                    </div>
                  ) : (
                    <button className="fh-btn" onClick={()=>arrancarCrono(exI,setI)} disabled={!!crono}
                      style={{ width:"100%", marginBottom:9, background:"var(--card2)", color:crono?"var(--faint)":"var(--txt)", border:"1px solid var(--line2)", padding:10, fontSize:12.5, display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}>
                      <Timer size={14} color={crono?"var(--faint)":"var(--jade)"}/> {l.segundos ? "Repetir la toma" : "Comenzar"}
                    </button>
                  )
                )}
                {cardio && !l.done && (l.kmEstimado || l.kcalEstimado) && (
                  <div style={{ fontSize:10.5, color:"var(--sky)", margin:"-4px 2px 9px", lineHeight:1.4 }}>
                    Km y calorías son un cálculo aproximado{consola && !curLevel ? " (pon el nivel para afinarlo)" : ""}. Si la consola dice otra cosa, escríbela encima.
                  </div>
                )}
              </div>
            );})}

            {/* Más o menos series sin salir a editar la rutina */}
            {(()=>{
              const ultimaPendiente = ex.logs.map(l=>!l.done).lastIndexOf(true);
              const contandoEsa = crono?.exI===exI && crono?.setI===ultimaPendiente;
              const unica = ex.logs.length===1;
              const noSePuede = ultimaPendiente<0 || contandoEsa || (unica && session.exercises.length===1);
              const estilo = off => ({ flex:1, background:"var(--bg2)", color:off?"var(--faint)":"var(--muted)", border:"1px solid var(--line2)", padding:"8px 6px", fontSize:12.5, display:"flex", alignItems:"center", justifyContent:"center", gap:5 });
              return (
                <div style={{ display:"flex", gap:8, marginTop:4 }}>
                  <button className="fh-btn" onClick={()=>quitarSerie(exI)} disabled={noSePuede} aria-label={unica ? `Quitar ${ex.name}` : `Quitar una serie de ${ex.name}`} style={estilo(noSePuede)}>
                    {unica ? <><X size={14}/> Quitar ejercicio</> : <><Minus size={14}/> Serie</>}
                  </button>
                  <button className="fh-btn" onClick={()=>anadirSerie(exI)} disabled={ex.logs.length>=10} aria-label={`Añadir una serie a ${ex.name}`} style={estilo(ex.logs.length>=10)}>
                    <Plus size={14}/> Serie
                  </button>
                </div>
              );
            })()}
          </div>
        );
      })}

      <button className="fh-btn" onClick={()=>setAnadiendo(true)}
        style={{ width:"100%", background:"var(--card2)", color:"var(--txt)", border:"1px dashed var(--line2)", padding:13, fontSize:14, marginBottom:8, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
        <Plus size={16} color="var(--gold)"/> Añadir ejercicio
      </button>

      <button className="fh-btn" onClick={finishWorkout} disabled={doneSets===0}
        style={{ width:"100%", background:doneSets?"var(--gold)":"var(--card)", color:doneSets?"#0F131A":"var(--faint)", padding:15, fontSize:16, marginTop:6, display:"flex", alignItems:"center", justifyContent:"center", gap:8, animation:doneSets===totalSets?"fh-glow 2s infinite":"none" }}>
        <Zap size={18}/> Terminar sesión
      </button>

      {sesionConjunta?.con && (
        <div className="fh-chip" style={{ position:"fixed", bottom:"calc(14px + var(--sb))", left:"50%", transform:"translateX(-50%)", background:"var(--jade)", color:"#0F131A", display:"flex", alignItems:"center", gap:6, zIndex:60, boxShadow:"0 4px 14px rgba(0,0,0,.4)" }}>
          <Users size={12}/> Entrenando con {sesionConjunta.con}
        </div>
      )}

      {anadiendo && <ExercisePicker dayName={session.dayName} already={session.exercises.map(e=>e.name)}
        onPick={anadirEjercicio} onRemove={quitarDelSelector} onClose={()=>setAnadiendo(false)}/>}

      {flotantes.map(f=><div key={f.id} className="fh-flota" style={{ left:f.x, top:f.y, color:f.color }}>{f.texto}</div>)}

      {descanso && <RestTimer hasta={descanso.hasta} total={descanso.total} onDone={cerrarDescanso} onSaltar={saltarDescanso} onMas15={alargarDescanso} isRecomp={isRecomp} juego={juego}/>}
    </div>
  );
}

/* =========================================================================
   FIN DE PARTIDA (resumen de la sesión)
   ========================================================================= */

function ResultsView({ results, setTab, level, rank, customRoutines, onGuardarCambios }){
  const xpVisto = useCuenta(results?.sessionXp || 0);
  const [cambiosHechos, setCambiosHechos] = useState(false);
  if(!results){ setTab("home"); return null; }
  const r=results;
  const rutinaHoy = r.cambios ? findRoutine(r.cambios.routineId, customRoutines) : null;
  const Row=({label,val,color})=>(
    <div style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderTop:"1px solid var(--line)", fontSize:13 }}>
      <span style={{ color:"var(--muted)" }}>{label}</span><span className="mono" style={{ color:color||"var(--txt)", fontWeight:700 }}>{val}</span>
    </div>
  );
  return (
    <div className="fh-in" style={{ paddingTop:24 }}>
      <div className="fh-pop" style={{ textAlign:"center", marginBottom:18 }}>
        {ALT ? <CheckCircle2 size={44} color="var(--jade)" style={{ marginBottom:8 }}/> : <Sprite id={SPR.cofre} size={64} className="fh-idle" style={{ marginBottom:8 }}/>}
        <h1 style={{ margin:0, fontSize:26 }}>{ALT ? "Entreno terminado" : "¡Misión cumplida!"}</h1>
        <p style={{ margin:"4px 0 0", fontSize:13, color:"var(--muted)" }}>{r.routineName} · {r.dayName}</p>
      </div>

      {!ALT && r.levelUp && (
        <div className="fh-card fh-pop" style={{ padding:16, marginBottom:12, textAlign:"center", borderColor:rank.color, background:"linear-gradient(135deg,var(--card),var(--card2))", animation:"fh-glow 2.4s infinite" }}>
          <Crown size={22} color={rank.color}/>
          <div className="disp" style={{ fontSize:19, fontWeight:700, marginTop:4 }}>¡Subes a nivel {r.levelUp}!</div>
          <div style={{ fontSize:12, color:"var(--muted)" }}>Rango: {r.rankName}</div>
        </div>
      )}

      {/* Stats principales */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:12 }}>
        {(ALT ? [[r.seriesDone,"series","var(--jade)"],[r.prs.length,r.prs.length===1?"récord":"récords","var(--gold)"],[r.durationMin+" min","duración","var(--sky)"]]
          : [["+"+xpVisto,"XP","var(--gold)"],[r.seriesDone,"series","var(--jade)"],[r.durationMin+" min","duración","var(--sky)"]]).map((s,i)=>(
          <div key={i} className="fh-card" style={{ padding:14, textAlign:"center" }}>
            <div className="disp" style={{ fontSize:20, fontWeight:700, color:s[2] }}>{s[0]}</div>
            <div style={{ fontSize:10, color:"var(--muted)", marginTop:2 }}>{s[1]}</div>
          </div>
        ))}
      </div>

      {/* Desglose XP */}
      {!ALT && <div className="fh-card" style={{ padding:16, marginBottom:12 }}>
        <div className="disp" style={{ fontWeight:600, fontSize:15, marginBottom:2 }}>Desglose de XP</div>
        <Row label="Base por completar" val={"+"+r.xpBase}/>
        <Row label={`Series completadas (${r.seriesDone})`} val={"+"+r.xpSets}/>
        {r.xpPr>0 && <Row label={`Récords personales (${r.prs.length})`} val={"+"+r.xpPr} color="var(--gold)"/>}
        {r.xpAmigo>0 && <Row label={`Estreno de la rutina de ${r.amigoDe?.displayName || "@"+r.amigoDe?.handle}`} val={"+"+r.xpAmigo} color="var(--jade)"/>}
        {r.xpConjunto>0 && <Row label={`Entreno conjunto con ${r.companeros.map(c=>c.display_name || "@"+c.handle).join(", ")}`} val={"+"+r.xpConjunto} color="var(--jade)"/>}
        {r.xpGoal>0 && <Row label="Objetivo semanal" val={"+"+r.xpGoal} color="var(--jade)"/>}
        {r.missionXp>0 && <Row label="Misiones semanales" val={"+"+r.missionXp} color="var(--arcane)"/>}
        {r.achXp>0 && <Row label="Logros desbloqueados" val={"+"+r.achXp} color="var(--violet)"/>}
        <div style={{ display:"flex", justifyContent:"space-between", padding:"9px 0 0", borderTop:"1px solid var(--line2)", marginTop:4 }}>
          <span className="disp" style={{ fontWeight:700 }}>Total</span><span className="mono disp" style={{ fontWeight:700, color:"var(--gold)" }}>+{r.sessionXp} XP</span>
        </div>
      </div>}

      {/* Comparación */}
      {r.seriesDelta!=null && r.seriesDelta!==0 && (
        <div className="fh-card" style={{ padding:14, marginBottom:12, display:"flex", alignItems:"center", gap:10 }}>
          <TrendingUp size={18} color={r.seriesDelta>0?"var(--jade)":"var(--ember)"}/>
          <div style={{ fontSize:13 }}>
            {r.seriesDelta>0
              ? <><b style={{ color:"var(--jade)" }}>{r.seriesDelta} serie{r.seriesDelta===1?"":"s"} más</b> que la última vez en este día. Eso es trabajo que suma.</>
              : <><b style={{ color:"var(--ember)" }}>{Math.abs(r.seriesDelta)} serie{Math.abs(r.seriesDelta)===1?"":"s"} menos</b> que la última vez. Pasa: descansa y a por la próxima.</>}
          </div>
        </div>
      )}
      {r.seriesDelta===0 && (
        <div className="fh-card" style={{ padding:14, marginBottom:12, display:"flex", alignItems:"center", gap:10 }}>
          <Check size={18} color="var(--jade)"/>
          <div style={{ fontSize:13 }}>Mismas series que la última vez en este día. Constancia es exactamente esto.</div>
        </div>
      )}

      {/* A quién has adelantado con los récords de hoy */}
      {r.adelantados?.length > 0 && (
        <div className="fh-card fh-pop" style={{ padding:16, marginBottom:12, borderColor:"var(--jade)" }}>
          <div className="disp" style={{ fontWeight:600, fontSize:15, marginBottom:8, display:"flex", alignItems:"center", gap:6 }}>
            <TrendingUp size={15} color="var(--jade)"/> Has adelantado a
          </div>
          {r.adelantados.map((a,i)=>(
            <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"6px 0", borderTop:i?"1px solid var(--line)":"none", fontSize:13 }}>
              <span>{a.display_name || "@"+a.handle} · {a.ejercicio}</span>
              <span className="mono" style={{ color:"var(--jade)" }}>{a.suyo} → {a.mio} kg</span>
            </div>
          ))}
        </div>
      )}

      {/* PRs */}
      {r.prs.length>0 && (
        <div className="fh-card" style={{ padding:16, marginBottom:12 }}>
          <div className="disp" style={{ fontWeight:600, fontSize:15, marginBottom:8, display:"flex", alignItems:"center", gap:6 }}><Star size={15} color="var(--gold)"/> Récords de hoy</div>
          {r.prs.map((p,i)=>(
            <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"6px 0", borderTop:i?"1px solid var(--line)":"none", fontSize:13 }}>
              <span>{p.name}</span>
              <span className="mono" style={{ color:"var(--gold)" }}>{p.prev} → {p.now} {p.unit || "kg"}</span>
            </div>
          ))}
        </div>
      )}

      {/* Récord de racha batido */}
      {r.bestStreakBeat && r.newStreak>1 && (
        <div className="fh-card fh-pop" style={{ padding:14, marginBottom:12, display:"flex", alignItems:"center", gap:11, borderColor:"var(--ember)" }}>
          <Flame size={20} color="var(--ember)"/>
          <div style={{ fontSize:13 }}>¡Nuevo <b style={{ color:"var(--ember)" }}>récord de racha</b>: {r.newStreak} días seguidos cumpliendo tu plan! 🔥</div>
        </div>
      )}

      {/* Misiones completadas */}
      {!ALT && r.missionsDone && r.missionsDone.length>0 && (
        <div className="fh-card" style={{ padding:16, marginBottom:12 }}>
          <div className="disp" style={{ fontWeight:600, fontSize:15, marginBottom:8, display:"flex", alignItems:"center", gap:6 }}><Target size={15} color="var(--arcane)"/> Misiones completadas</div>
          {r.missionsDone.map((m,i)=>{ const I=m.icon; return (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"6px 0", borderTop:i?"1px solid var(--line)":"none" }}>
              <div style={{ background:"var(--arcane)", borderRadius:9, padding:6, display:"flex" }}><I size={15} color="#0F131A"/></div>
              <div style={{ flex:1 }}><div style={{ fontSize:13, fontWeight:600 }}>{m.title}</div><div style={{ fontSize:11, color:"var(--muted)" }}>{m.desc}</div></div>
              <span className="fh-chip" style={{ background:"rgba(183,139,255,.16)", color:"var(--arcane)" }}>+{m.xp}</span>
            </div>
          ); })}
        </div>
      )}

      {/* Progresión de peso sugerida */}
      {r.progressed && r.progressed.length>0 && (
        <div className="fh-card" style={{ padding:16, marginBottom:12 }}>
          <div className="disp" style={{ fontWeight:600, fontSize:15, marginBottom:4, display:"flex", alignItems:"center", gap:6 }}><TrendingUp size={15} color="var(--jade)"/> ¡A subir peso!</div>
          <div style={{ fontSize:11.5, color:"var(--muted)", marginBottom:8 }}>Completaste todas las series al tope de reps. La próxima vez te sugerimos:</div>
          {r.progressed.map((p,i)=>(
            <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"6px 0", borderTop:i?"1px solid var(--line)":"none", fontSize:13 }}>
              <span>{p.name}</span>
              <span className="mono" style={{ color:"var(--jade)" }}>{p.from} → {p.to} kg</span>
            </div>
          ))}
        </div>
      )}

      {/* Logros */}
      {!ALT && r.unlocked.length>0 && (
        <div className="fh-card" style={{ padding:16, marginBottom:12 }}>
          <div className="disp" style={{ fontWeight:600, fontSize:15, marginBottom:8 }}>Logros desbloqueados</div>
          {r.unlocked.map((a,i)=>{ const I=a.icon; return (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"6px 0", borderTop:i?"1px solid var(--line)":"none" }}>
              <div style={{ background:"var(--gold)", borderRadius:9, padding:6, display:"flex" }}><I size={15} color="#0F131A"/></div>
              <div style={{ flex:1 }}><div style={{ fontSize:13, fontWeight:600 }}>{a.title}</div><div style={{ fontSize:11, color:"var(--muted)" }}>{a.desc}</div></div>
              <span className="fh-chip" style={{ background:"rgba(232,176,75,.15)", color:"var(--gold)" }}>+{a.xp}</span>
            </div>
          ); })}
        </div>
      )}

      {!ALT && r.muscleLevelUps && r.muscleLevelUps.length>0 && (
        <div className="fh-card" style={{ padding:16, marginBottom:12 }}>
          <div className="disp" style={{ fontWeight:600, fontSize:15, marginBottom:8 }}>Tu cuerpo sube de nivel</div>
          {r.muscleLevelUps.map((m,i)=>{ const st=BODY_STATS.find(s=>s.id===m.cat); const I=st?.icon||Dumbbell;
            return (<div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"6px 0", borderTop:i?"1px solid var(--line)":"none" }}>
              <div style={{ background:st?.color||"var(--gold)", borderRadius:9, padding:6, display:"flex" }}><I size={15} color="#0F131A"/></div>
              <div style={{ flex:1, fontSize:13 }}>{m.cat}</div>
              <span className="fh-chip cinzel" style={{ background:"var(--bg2)", color:st?.color||"var(--gold)" }}>Nivel {m.level}</span>
            </div>); })}
        </div>
      )}

      {r.restEarned && (
        <div className="fh-card" style={{ padding:14, marginBottom:12, display:"flex", alignItems:"center", gap:10, borderColor:"var(--ember)" }}>
          <BedDouble size={20} color="var(--sky)"/><div style={{ fontSize:13 }}>¡Objetivo semanal cumplido! Has ganado <b style={{ color:"var(--sky)" }}>1 día de descanso</b>.</div>
        </div>
      )}

      {r.cambios && rutinaHoy && !cambiosHechos && (
        <div className="fh-card" style={{ padding:14, marginBottom:12, borderColor:"var(--sky)" }}>
          <div className="disp" style={{ fontWeight:600, fontSize:15, marginBottom:4 }}>Hoy has cambiado {r.dayName}</div>
          <div style={{ fontSize:12, color:"var(--muted)", lineHeight:1.45, marginBottom:10 }}>
            {rutinaHoy.custom
              ? (rutinaHoy.origen ? "Si la guardas, pasa a ser tuya y deja de recibir los cambios de su autor." : "¿La próxima vez igual que hoy?")
              : "Es una rutina de la app: se guardará una copia tuya y pasará a ser tu rutina activa."}
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button className="fh-btn" onClick={()=>setCambiosHechos(true)}
              style={{ flex:1, background:"var(--card2)", color:"var(--muted)", border:"1px solid var(--line2)", padding:11, fontSize:13 }}>Solo hoy</button>
            <button className="fh-btn" onClick={()=>{ if(onGuardarCambios(r.cambios)) setCambiosHechos(true); }}
              style={{ flex:1.5, background:"var(--sky)", padding:11, fontSize:13 }}>{rutinaHoy.custom ? "Guardar en la rutina" : "Guardar copia"}</button>
          </div>
        </div>
      )}

      <button className="fh-btn" onClick={()=>setTab("home")} style={{ width:"100%", background:"var(--gold)", padding:15, fontSize:16, marginTop:4 }}>Continuar</button>
    </div>
  );
}

/* =========================================================================
   PROGRESO
   ========================================================================= */

const MONTHS_ES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

/* Una serie tal como se hizo. El objetivo dice si el número son reps, segundos o
   minutos; los registros anteriores a la 1.0.20 no lo guardan y se deduce del catálogo. */
function textoSerie(ej, l){
  const u = repUnit(ej.objetivo || defaultReps(ej.name));
  const n = l.reps || 0;
  const cuanto = u==="MIN" ? `${n} min` : u==="SEG" ? `${n} s` : `${n} reps`;
  if(isCardio(ej.name)){
    const extra = [l.km ? `${numES(l.km)} km` : null, l.kcal ? `${l.kcal} kcal` : null, l.level ? `nivel ${numES(l.level)}` : null].filter(Boolean);
    return [cuanto, ...extra].join(" · ");
  }
  if(!l.weight) return cuanto;
  return u==="REPS" ? `${numES(l.weight)} kg × ${n}` : `${numES(l.weight)} kg · ${cuanto}`;
}
function DesgloseEntreno({ rec }){
  const ejercicios = (rec.exercises||[]).filter(e=>e.logs?.length);
  const datos = [`${seriesDe(rec)} series`, rec.durationMin ? `${rec.durationMin} min` : null, !ALT && rec.xp ? `+${rec.xp} XP` : null].filter(Boolean);
  return (
    <div className="fh-in" style={{ padding:"4px 0 8px" }}>
      <div style={{ fontSize:11, color:"var(--muted)", marginBottom:8 }}>{datos.join(" · ")}</div>
      {!ejercicios.length && <div style={{ fontSize:12, color:"var(--faint)", lineHeight:1.5 }}>Este entreno no guardó el detalle de las series.</div>}
      {ejercicios.map((e,i)=>(
        <div key={i} style={{ background:"var(--bg2)", border:"1px solid var(--line)", padding:"9px 11px", marginBottom:6 }}>
          <div className="disp" style={{ fontWeight:600, fontSize:14, marginBottom:6 }}>{e.name}</div>
          {e.logs.map((l,j)=>(
            <div key={j} style={{ display:"flex", gap:9, alignItems:"baseline", padding:"2px 0", fontSize:12.5 }}>
              <span className="mono" style={{ color:"var(--faint)", fontSize:11, width:14, textAlign:"right", flexShrink:0 }}>{j+1}</span>
              <span className="mono" style={{ color:"var(--txt)" }}>{textoSerie(e, l)}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function WorkoutCalendar({ log, sub, quedadas }){
  const [month, setMonth] = useState(()=>{ const d=new Date(); return { y:d.getFullYear(), m:d.getMonth() }; });
  const [sel, setSel] = useState(null);
  const [abierto, setAbierto] = useState(null);     // qué entreno del día está desplegado

  // date (YYYY-MM-DD) -> array de entrenos
  const byDate = {};
  (log||[]).forEach(rec=>{ if(!rec.date) return; (byDate[rec.date]=byDate[rec.date]||[]).push(rec); });

  const first = new Date(month.y, month.m, 1);
  const daysInMonth = new Date(month.y, month.m+1, 0).getDate();
  const leadBlanks = (first.getDay()+6)%7; // lunes = 0
  const cells = [...Array(leadBlanks).fill(null), ...Array.from({ length:daysInMonth }, (_,i)=>i+1)];
  const iso = d => `${month.y}-${String(month.m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
  const today = todayISO();
  const payISO = sub?.enabled && sub.renewalDay ? nextRenewalDate(sub.renewalDay) : null;
  // Quedadas por día. `cuando` viene en UTC del servidor: se pasa a fecha LOCAL
  // con isoOf, nunca con toISOString (una quedada de las 00:30 caería en la
  // víspera y el punto saldría en el día que no es).
  const quedadasPorDia = {};
  (quedadas||[]).forEach(q=>{
    if(!q?.cuando) return;
    const d = new Date(q.cuando);
    if(isNaN(d)) return;
    (quedadasPorDia[isoOf(d)] = quedadasPorDia[isoOf(d)] || []).push(q);
  });
  const monthCount = Object.keys(byDate).filter(k=>k.startsWith(`${month.y}-${String(month.m+1).padStart(2,"0")}`)).length;

  function shift(n){ let m=month.m+n, y=month.y; if(m<0){ m=11; y--; } if(m>11){ m=0; y++; } setMonth({ y, m }); setSel(null); setAbierto(null); }

  const navBtn = { background:"var(--card2)", border:"1px solid var(--line2)", borderRadius:8, width:30, height:30, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"var(--muted)" };
  const selWorkouts = sel ? (byDate[sel] || []) : [];
  const selQuedadas = sel ? (quedadasPorDia[sel] || []) : [];
  const hayQuedadas = Object.keys(quedadasPorDia).length > 0;

  return (
    <div className="fh-card" style={{ padding:16, marginTop:12 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
        <button onClick={()=>shift(-1)} style={navBtn} aria-label="Mes anterior"><ChevronRight size={16} style={{ transform:"rotate(180deg)" }}/></button>
        <div style={{ textAlign:"center" }}>
          <div className="disp" style={{ fontWeight:600, fontSize:15 }}>{MONTHS_ES[month.m]} {month.y}</div>
          <div style={{ fontSize:11, color:"var(--muted)", marginTop:2 }}>{monthCount} entreno{monthCount===1?"":"s"} este mes</div>
        </div>
        <button onClick={()=>shift(1)} style={navBtn} aria-label="Mes siguiente"><ChevronRight size={16}/></button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4, textAlign:"center" }}>
        {["L","M","X","J","V","S","D"].map(d=><div key={d} style={{ fontSize:10, fontWeight:700, color:"var(--faint)", padding:"2px 0" }}>{d}</div>)}
        {cells.map((d,i)=>{
          if(d===null) return <div key={"b"+i}/>;
          const dISO = iso(d);
          const has = !!byDate[dISO];
          const hasQ = !!quedadasPorDia[dISO];
          const abrible = has || hasQ;
          const isToday = dISO===today;
          const isPay = dISO===payISO;
          const isSel = dISO===sel;
          return (
            <button key={dISO} onClick={()=>{ if(!abrible) return; setSel(isSel?null:dISO); setAbierto(byDate[dISO]?.length===1 ? 0 : null); }}
              aria-label={has ? `${d}: ${byDate[dISO].length} entreno${byDate[dISO].length===1?"":"s"}, ver desglose` : undefined}
              style={{ aspectRatio:"1", borderRadius:9, position:"relative", cursor:abrible?"pointer":"default",
                background: has ? "rgba(232,176,75,.16)" : hasQ ? "rgba(123,180,255,.14)" : "transparent",
                border: `1px solid ${isSel?"var(--gold)":isToday?"var(--sky)":"transparent"}`,
                color: abrible?"var(--txt)":"var(--faint)", fontSize:12.5, fontWeight:abrible?700:500,
                display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'JetBrains Mono',monospace" }}>
              {d}
              {(has || hasQ) && (
                <span style={{ position:"absolute", bottom:4, display:"flex", gap:2 }}>
                  {has  && <span style={{ width:4, height:4, borderRadius:"50%", background:"var(--gold)" }}/>}
                  {hasQ && <span style={{ width:4, height:4, borderRadius:"50%", background:"var(--sky)" }}/>}
                </span>
              )}
              {isPay && <span style={{ position:"absolute", top:2, right:3, fontSize:9, color:"var(--ember)", fontWeight:700 }}>€</span>}
            </button>
          );
        })}
      </div>

      <div style={{ display:"flex", gap:14, marginTop:12, flexWrap:"wrap", fontSize:10.5, color:"var(--faint)" }}>
        <span style={{ display:"flex", alignItems:"center", gap:5 }}><span style={{ width:6, height:6, borderRadius:"50%", background:"var(--gold)" }}/> Entreno</span>
        {hayQuedadas && <span style={{ display:"flex", alignItems:"center", gap:5 }}><span style={{ width:6, height:6, borderRadius:"50%", background:"var(--sky)" }}/> Quedada</span>}
        <span style={{ display:"flex", alignItems:"center", gap:5 }}><span style={{ width:8, height:8, borderRadius:3, border:"1px solid var(--sky)" }}/> Hoy</span>
        {payISO && <span style={{ display:"flex", alignItems:"center", gap:5 }}><span style={{ color:"var(--ember)", fontWeight:700 }}>€</span> Renovación</span>}
      </div>

      {sel && (selWorkouts.length>0 || selQuedadas.length>0) && (
        <div style={{ marginTop:12, paddingTop:12, borderTop:"1px solid var(--line)" }}>
          <div style={{ fontSize:12, color:"var(--muted)", marginBottom:8 }}>{sel.slice(8,10)}/{sel.slice(5,7)}/{sel.slice(0,4)}</div>
          {selQuedadas.map((q,i)=>{
            const h = new Date(q.cuando);
            const hora = isNaN(h) ? "" : `${String(h.getHours()).padStart(2,"0")}:${String(h.getMinutes()).padStart(2,"0")}`;
            return (
              <div key={"q"+i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8, padding:"6px 0", fontSize:13 }}>
                <span style={{ display:"flex", alignItems:"center", gap:8, minWidth:0 }}>
                  <Users size={14} color="var(--sky)" style={{ flexShrink:0 }}/>
                  <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {hora}{q.lugar ? ` · ${q.lugar}` : ""}{q.es_mia ? " · tuya" : q.display_name ? ` · ${q.display_name}` : ""}
                  </span>
                </span>
                <span className="disp" style={{ color:"var(--muted)", fontSize:12, flexShrink:0 }}>{q.van || 0} {(q.van||0)===1?"va":"van"}</span>
              </div>
            );
          })}
          {selWorkouts.map((w,i)=>(
            <div key={i}>
              <button onClick={()=>setAbierto(abierto===i?null:i)} aria-expanded={abierto===i}
                style={{ width:"100%", background:"none", border:"none", cursor:"pointer", color:"var(--txt)", textAlign:"left", display:"flex", alignItems:"center", justifyContent:"space-between", gap:8, padding:"7px 0", fontSize:13 }}>
                <span style={{ display:"flex", alignItems:"center", gap:8, minWidth:0 }}><Dumbbell size={14} color="var(--gold)" style={{ flexShrink:0 }}/> {w.routineName}{w.dayName?` · ${w.dayName}`:""}</span>
                <span style={{ display:"flex", alignItems:"center", gap:5, flexShrink:0 }}>
                  <span className="disp" style={{ color:"var(--muted)", fontSize:12.5 }}>{seriesDe(w)} series</span>
                  <ChevronRight size={15} color="var(--muted)" style={{ transform:abierto===i?"rotate(90deg)":"none" }}/>
                </span>
              </button>
              {abierto===i && <DesgloseEntreno rec={w}/>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const PHASE_TINT = { menstruacion:"rgba(210,75,75,.22)", folicular:"rgba(63,185,132,.20)", ovulatoria:"rgba(232,176,75,.24)", lutea:"rgba(183,139,255,.20)" };
const PHASE_SOLID = { menstruacion:"#D24B4B", folicular:"#3FB984", ovulatoria:"#E8B04B", lutea:"#B78BFF" };

function CycleCalendar({ cycle }){
  const [month, setMonth] = useState(()=>{ const d=new Date(); return { y:d.getFullYear(), m:d.getMonth() }; });
  const first = new Date(month.y, month.m, 1);
  const daysInMonth = new Date(month.y, month.m+1, 0).getDate();
  const leadBlanks = (first.getDay()+6)%7;
  const cells = [...Array(leadBlanks).fill(null), ...Array.from({ length:daysInMonth }, (_,i)=>i+1)];
  const iso = d => `${month.y}-${String(month.m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
  const today = todayISO();
  function shift(n){ let m=month.m+n, y=month.y; if(m<0){ m=11; y--; } if(m>11){ m=0; y++; } setMonth({ y, m }); }
  const navBtn = { background:"var(--card2)", border:"1px solid var(--line2)", borderRadius:8, width:30, height:30, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"var(--muted)" };
  const todayPh = cyclePhaseFor(cycle, today);
  // Próxima regla: primer inicio de ciclo posterior a hoy.
  let nextPeriod=null, daysToPeriod=null;
  if(cycle?.enabled && cycle.lastPeriodStart){
    const len=Math.max(21,Math.min(40,cycle.cycleLength||28));
    const diff=Math.floor((new Date(today+"T00:00:00")-new Date(cycle.lastPeriodStart+"T00:00:00"))/864e5);
    const cyclesPassed=Math.floor(diff/len)+1;
    nextPeriod=addDaysISO(cycle.lastPeriodStart, cyclesPassed*len);
    daysToPeriod=Math.round((new Date(nextPeriod+"T00:00:00")-new Date(today+"T00:00:00"))/864e5);
  }
  return (
    <div className="fh-card" style={{ padding:16, marginTop:12 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
        <button onClick={()=>shift(-1)} style={navBtn} aria-label="Mes anterior"><ChevronRight size={16} style={{ transform:"rotate(180deg)" }}/></button>
        <div style={{ textAlign:"center" }}>
          <div className="disp" style={{ fontWeight:600, fontSize:15, display:"flex", alignItems:"center", gap:6, justifyContent:"center" }}><Heart size={14} color="#E56B9F"/> Ciclo · {MONTHS_ES[month.m]} {month.y}</div>
          {todayPh && <div style={{ fontSize:11, color:"var(--muted)", marginTop:2 }}>Hoy: {todayPh.label} · día {todayPh.day}</div>}
        </div>
        <button onClick={()=>shift(1)} style={navBtn} aria-label="Mes siguiente"><ChevronRight size={16}/></button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4, textAlign:"center" }}>
        {["L","M","X","J","V","S","D"].map(d=><div key={d} style={{ fontSize:10, fontWeight:700, color:"var(--faint)", padding:"2px 0" }}>{d}</div>)}
        {cells.map((d,i)=>{
          if(d===null) return <div key={"b"+i}/>;
          const dISO=iso(d);
          const ph=cyclePhaseFor(cycle, dISO);
          const isToday=dISO===today;
          const isPeriodStart=dISO===nextPeriod;
          return (
            <div key={dISO} style={{ aspectRatio:"1", borderRadius:9, position:"relative",
              background: ph ? PHASE_TINT[ph.key] : "transparent",
              border:`1px solid ${isToday?"var(--sky)":"transparent"}`,
              color: ph ? "var(--txt)" : "var(--faint)", fontSize:12, fontWeight:isToday?700:500,
              display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'JetBrains Mono',monospace" }}>
              {d}
              {ph && <span style={{ position:"absolute", bottom:3, width:5, height:5, borderRadius:"50%", background:PHASE_SOLID[ph.key] }}/>}
              {isPeriodStart && <span style={{ position:"absolute", top:2, right:3, fontSize:9 }}>🩸</span>}
            </div>
          );
        })}
      </div>

      <div style={{ display:"flex", gap:12, marginTop:12, flexWrap:"wrap", fontSize:10.5, color:"var(--faint)" }}>
        {Object.values(CYCLE_PHASES).map(p=>(
          <span key={p.id} style={{ display:"flex", alignItems:"center", gap:5 }}><span style={{ width:8, height:8, borderRadius:"50%", background:PHASE_SOLID[p.id] }}/> {p.short}</span>
        ))}
      </div>
      {daysToPeriod!=null && (
        <div style={{ fontSize:11.5, color:"var(--muted)", marginTop:11, lineHeight:1.45 }}>
          🩸 Próxima regla estimada: <b style={{ color:"var(--txt)" }}>{nextPeriod.slice(8,10)}/{nextPeriod.slice(5,7)}</b> · en {daysToPeriod} día{daysToPeriod===1?"":"s"}. Es una estimación; ajústala en <b style={{ color:"var(--txt)" }}>Ajustes</b> cuando te baje.
        </div>
      )}
    </div>
  );
}

function ProgressView({ state, log, measures, addMeasurement, customRoutines, setTab, quedadas, onAbrirInforme, onAbrirResumenes }){
  const [form, setForm] = useState({ weightKg:"", chest:"", waist:"", arm:"" });
  const volData=log.slice(-12).map((s,i)=>({ name:`S${i+1}`, v:seriesDe(s) }));
  const weightData=measures.map(m=>({ name:m.date.slice(5), v:m.weightKg }));
  const waistData=measures.filter(m=>m.waist).map(m=>({ name:m.date.slice(5), v:m.waist }));
  const bests=Object.entries(state.bests||{}).sort((a,b)=>b[1]-a[1]).slice(0,6);
  const cardioRecs=Object.entries(state.cardioBests||{})
    .filter(([,r])=>r && (r.min>0||r.km>0||r.kcal>0))
    .sort((a,b)=>(b[1].date||"").localeCompare(a[1].date||""));
  const thisMonth=todayISO().slice(0,7);
  const monthWorkouts=log.filter(s=>s.date.startsWith(thisMonth)).length;
  const routine=findRoutine(state.activeRoutine, customRoutines); const monthGoal=weeklyGoalFor(state, routine)*4;
  const consist=Math.min(100,Math.round((monthWorkouts/monthGoal)*100));

  function submit(){ const w=parseFloat(form.weightKg); if(!w) return;
    addMeasurement({ date:todayISO(), weightKg:w, chest:parseFloat(form.chest)||null, waist:parseFloat(form.waist)||null, arm:parseFloat(form.arm)||null });
    setForm({ weightKg:"", chest:"", waist:"", arm:"" });
  }

  return (
    <div className="fh-in">
      <header style={{ padding:"22px 2px 8px", display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:10 }}>
        <div style={{ flex:1, minWidth:0 }}>
          <h1 style={{ margin:0, fontSize:22 }}>{ALT ? "Progreso" : "RPGym"}</h1>
          <p style={{ margin:"4px 0 0", fontSize:13, color:"var(--muted)" }}>Tu progreso, mes a mes.</p>
        </div>
        {/* En la versión RPG el informe se abre desde la ficha de personaje, que en la alt no existe. */}
        <div style={{ display:"flex", flexDirection:"column", gap:6, flexShrink:0 }}>
          {ALT && onAbrirInforme && (
            <button className="fh-btn" onClick={onAbrirInforme}
              style={{ background:"var(--card2)", color:"var(--txt)", border:"1px solid var(--line2)", padding:"8px 12px", fontSize:12, display:"flex", alignItems:"center", gap:6 }}>
              <FileText size={14}/> Informe semanal
            </button>
          )}
          {/* Solo con cuenta: los resúmenes viven en la nube. */}
          {onAbrirResumenes && (
            <button className="fh-btn" onClick={onAbrirResumenes}
              style={{ background:"var(--card2)", color:"var(--txt)", border:"1px solid var(--line2)", padding:"8px 12px", fontSize:12, display:"flex", alignItems:"center", gap:6 }}>
              <Sparkles size={14} color="var(--violet)"/> Informe quincenal
            </button>
          )}
        </div>
      </header>

      <WorkoutCalendar log={log} sub={state.sub} quedadas={quedadas}/>

      {state.cycle?.enabled && <CycleCalendar cycle={state.cycle}/>}

      <div className="fh-card" style={{ padding:16, marginTop:12, display:"flex", alignItems:"center", gap:16 }}>
        <Ring pct={consist/100} size={78} stroke={7} color="var(--jade)"><div className="disp" style={{ fontSize:19, fontWeight:700 }}>{consist}%</div></Ring>
        <div><div className="disp" style={{ fontWeight:600, fontSize:15 }}>Constancia del mes</div>
          <div style={{ fontSize:12, color:"var(--muted)", marginTop:3 }}>{monthWorkouts} de {monthGoal} sesiones previstas</div>
          <div style={{ fontSize:11, color:"var(--faint)", marginTop:3 }}>La constancia es lo que mueve el espejo.</div></div>
      </div>

      <div className="fh-card" style={{ padding:16, marginTop:12 }}>
        <div className="disp" style={{ fontWeight:600, fontSize:15, marginBottom:4 }}>Series por sesión</div>
        <div style={{ fontSize:11, color:"var(--muted)", marginBottom:10 }}>Series completadas. Es el trabajo que sí depende de ti cada día.</div>
        {volData.length>1 ? (
          <ResponsiveContainer width="100%" height={150}><BarChart data={volData}>
            <CartesianGrid vertical={false} stroke="var(--line)"/>
            <XAxis dataKey="name" tick={{ fill:"var(--faint)", fontSize:10 }} axisLine={false} tickLine={false}/>
            <YAxis tick={{ fill:"var(--faint)", fontSize:10 }} axisLine={false} tickLine={false} width={34}/>
            <Tooltip contentStyle={{ background:"var(--card2)", border:"1px solid var(--line2)", borderRadius:10, fontSize:12 }} labelStyle={{ color:"var(--muted)" }} cursor={{ fill:"rgba(232,176,75,.08)" }}/>
            <Bar dataKey="v" name="Series" fill="var(--gold)" radius={[4,4,0,0]}/>
          </BarChart></ResponsiveContainer>
        ) : <Empty text="Completa 2 sesiones para ver tu curva de trabajo"/>}
      </div>

      <div className="fh-card" style={{ padding:16, marginTop:12 }}>
        <div className="disp" style={{ fontWeight:600, fontSize:15, marginBottom:2 }}>Peso y cintura</div>
        <div style={{ fontSize:11, color:"var(--muted)", marginBottom:10 }}>En recomposición, la cintura bajando es mejor señal que la báscula.</div>
        {weightData.length>1 ? (
          <ResponsiveContainer width="100%" height={140}><LineChart data={weightData}>
            <CartesianGrid vertical={false} stroke="var(--line)"/>
            <XAxis dataKey="name" tick={{ fill:"var(--faint)", fontSize:10 }} axisLine={false} tickLine={false}/>
            <YAxis domain={["dataMin-1","dataMax+1"]} tick={{ fill:"var(--faint)", fontSize:10 }} axisLine={false} tickLine={false} width={34}/>
            <Tooltip contentStyle={{ background:"var(--card2)", border:"1px solid var(--line2)", borderRadius:10, fontSize:12 }} labelStyle={{ color:"var(--muted)" }}/>
            <Line type="monotone" dataKey="v" name="Peso" stroke="var(--jade)" strokeWidth={2.5} dot={{ r:3, fill:"var(--jade)" }}/>
          </LineChart></ResponsiveContainer>
        ) : <Empty text="Registra tu peso hoy y una vez por semana"/>}
        {waistData.length>1 && (
          <ResponsiveContainer width="100%" height={110}><LineChart data={waistData}>
            <XAxis dataKey="name" tick={{ fill:"var(--faint)", fontSize:10 }} axisLine={false} tickLine={false}/>
            <YAxis domain={["dataMin-2","dataMax+2"]} tick={{ fill:"var(--faint)", fontSize:10 }} axisLine={false} tickLine={false} width={34}/>
            <Tooltip contentStyle={{ background:"var(--card2)", border:"1px solid var(--line2)", borderRadius:10, fontSize:12 }} labelStyle={{ color:"var(--muted)" }}/>
            <Line type="monotone" dataKey="v" name="Cintura" stroke="var(--ember)" strokeWidth={2.5} dot={{ r:3, fill:"var(--ember)" }}/>
          </LineChart></ResponsiveContainer>
        )}
      </div>

      {bests.length>0 && (
        <div className="fh-card" style={{ padding:16, marginTop:12 }}>
          <div className="disp" style={{ fontWeight:600, fontSize:15, marginBottom:10 }}>Récords personales</div>
          {bests.map(([name,w])=>{ const first=state.firstBests?.[name]; const gain=first?Math.round(((w-first)/first)*100):0;
            return (<div key={name} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"7px 0", borderTop:"1px solid var(--line)" }}>
              <span style={{ fontSize:13.5 }}>{name}</span>
              <div style={{ textAlign:"right" }}><span className="mono" style={{ fontSize:14, color:"var(--gold)" }}>{w} kg</span>
                {gain>0 && <span className="fh-chip" style={{ marginLeft:8, background:"rgba(63,185,132,.15)", color:"var(--jade)" }}>+{gain}%</span>}</div>
            </div>); })}
        </div>
      )}

      {cardioRecs.length>0 && (
        <div className="fh-card" style={{ padding:16, marginTop:12 }}>
          <div className="disp" style={{ fontWeight:600, fontSize:15, marginBottom:4, display:"flex", alignItems:"center", gap:7 }}>
            <Heart size={15} color="#E56B9F"/> Récords de cardio
          </div>
          <div style={{ fontSize:11, color:"var(--faint)", marginBottom:6 }}>Tu mejor marca en cada máquina, no la última.</div>
          {cardioRecs.map(([name,rec])=>(
            <div key={name} style={{ padding:"8px 0", borderTop:"1px solid var(--line)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", gap:8 }}>
                <span style={{ fontSize:13.5 }}>{name}</span>
                {rec.date && <span className="mono" style={{ fontSize:10.5, color:"var(--faint)", flexShrink:0 }}>{rec.date.slice(8,10)}/{rec.date.slice(5,7)}</span>}
              </div>
              <div className="mono" style={{ fontSize:12, color:"var(--gold)", marginTop:3 }}>{cardioRecordText(rec)}</div>
            </div>
          ))}
        </div>
      )}

      <div className="fh-card" style={{ padding:16, marginTop:12, marginBottom:8 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}><Ruler size={16} color="var(--jade)"/><span className="disp" style={{ fontWeight:600, fontSize:15 }}>Nueva medición</span></div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          {[["weightKg","Peso (kg)"],["chest","Pecho (cm)"],["waist","Cintura (cm)"],["arm","Brazo (cm)"]].map(([k,lab])=>(
            <div key={k}><div style={{ fontSize:11, color:"var(--muted)", marginBottom:4, textAlign:"center" }}>{lab}</div>
              <input inputMode="decimal" value={form[k]} onChange={e=>setForm({ ...form,[k]:e.target.value })} placeholder="—"/></div>
          ))}
        </div>
        <button className="fh-btn" onClick={submit} disabled={!form.weightKg} style={{ width:"100%", background:form.weightKg?"var(--jade)":"var(--card2)", color:form.weightKg?"#0F131A":"var(--faint)", padding:12, marginTop:12 }}>Guardar medición</button>
      </div>
    </div>
  );
}

/* =========================================================================
   INFORME SEMANAL
   ========================================================================= */

/* El repaso de una semana entera: lo que entrenaste, lo que rompiste, lo que
   desbloqueaste y qué hizo tu gente mientras tanto. Se puede pasear hacia atrás
   semana a semana, porque todo se recalcula del historial (ver `informeSemanal`).

   No tiene pestaña propia: SALE SOLO la primera vez que abres la app con la
   semana ya cerrada (en la práctica, el lunes) y después se consulta desde la
   ficha de personaje. Se sale con el botón de volver: si se lo quitas, se queda
   sin salida. */
/* Piezas sueltas del informe. Van fuera del componente a propósito: definidas
   dentro, React las ve como un tipo nuevo en cada render y desmonta y vuelve a
   montar el bloque entero. */
const InformeStat = ({ icon:I, color, valor, sub }) => (
  <div className="fh-card" style={{ flex:1, padding:"13px 10px", textAlign:"center", minWidth:0 }}>
    <I size={16} color={color}/>
    <div className="disp" style={{ fontSize:22, fontWeight:700, marginTop:5, lineHeight:1 }}>{valor}</div>
    <div style={{ fontSize:10.5, color:"var(--muted)", marginTop:4, lineHeight:1.3 }}>{sub}</div>
  </div>
);
const InformeTitulo = ({ icon:I, color, children, nota }) => (
  <div style={{ marginBottom:10 }}>
    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
      <I size={16} color={color}/><span className="disp" style={{ fontWeight:600, fontSize:15 }}>{children}</span>
    </div>
    {nota && <div style={{ fontSize:11, color:"var(--faint)", marginTop:4, lineHeight:1.45 }}>{nota}</div>}
  </div>
);

function InformeSemanalView({ state, log, measures, lunes, setLunes, cloudEnabled, perfil, onVolver }){
  const planned = plannedDaysOf(state);
  const inf = useMemo(
    ()=>informeSemanal({ log, state, measures, lunesISO:lunes, plannedDays:planned }),
    [log, state, measures, lunes, planned]);
  const titular = titularSemana(inf);
  const nivel = levelFromXp(state.xp), rango = rankFor(nivel);
  const RankIcon = rango.icon;
  const xpInto = state.xp - cumXpForLevel(nivel), xpNeed = cumXpForLevel(nivel+1) - cumXpForLevel(nivel);

  /* Hasta dónde se puede retroceder: la primera semana con historial. Hacia
     delante, nunca más allá de la semana en curso. */
  const lunesHoy = mondayOf(todayISO());
  const primerDia = (log||[]).reduce((a,r)=>(!a || r.date<a) ? r.date : a, null);
  const lunesMin = mondayOf(primerDia || state.startDate || todayISO());
  const puedeAtras = lunes > lunesMin;
  const puedeAlante = lunes < lunesHoy;

  /* Actividad del círculo. Va aparte de todo lo demás a propósito: sin cuenta,
     sin red o con la nube caída el informe sale igual, solo sin esta sección. */
  const [circulo, setCirculo] = useState(null);      // null mientras carga
  const [falloCirculo, setFalloCirculo] = useState(false);
  useEffect(()=>{
    if(!cloudEnabled || !perfil){ setCirculo({ lista:[], quedadas:[], nuevos:[] }); return; }
    let vivo = true; setCirculo(null); setFalloCirculo(false);
    (async()=>{
      /* Aquí SÍ toca `toISOString()`: la vista `novedades` guarda instantes
         (timestamptz), no días, así que hay que pasarle la medianoche local
         convertida a UTC. Lo que no se puede es sacar un día de vuelta de ahí. */
      const desde = new Date(inf.lunes + "T00:00:00").toISOString();
      const hasta = new Date(addDaysISO(inf.domingo,1) + "T00:00:00").toISOString();
      const r = await cloud.novedades(desde, { hasta, limite:300 });
      if(!vivo) return;
      if(r.ok) setCirculo(resumirCirculo(r.novedades));
      else { setFalloCirculo(true); setCirculo({ lista:[], quedadas:[], nuevos:[] }); }
    })();
    return ()=>{ vivo = false; };
  }, [inf.lunes, inf.domingo, cloudEnabled, perfil]);

  const maxSets = Math.max(1, ...inf.porGrupo.map(g=>g.sets));
  const labels = ["L","M","X","J","V","S","D"];
  const entrenados = new Set(inf.sesiones.map(r=>r.date));
  const hoy = todayISO();

  return (
    <div className="fh-in">
      <header style={{ padding:"22px 2px 12px", display:"flex", alignItems:"center", gap:10 }}>
        <button onClick={onVolver} aria-label="Volver"
          style={{ background:"var(--card)", border:"1px solid var(--line)", borderRadius:10, width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"var(--muted)", flexShrink:0 }}><ChevronLeft size={18}/></button>
        <div style={{ minWidth:0 }}>
          <h1 style={{ margin:0, fontSize:22 }}>Informe semanal</h1>
          <p style={{ margin:"4px 0 0", fontSize:13, color:"var(--muted)" }}>Todo lo que pasó, en una página.</p>
        </div>
      </header>

      {/* Qué semana se está mirando */}
      <div className="fh-card" style={{ padding:"10px 12px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:8 }}>
        <button onClick={()=>puedeAtras && setLunes(addDaysISO(lunes,-7))} disabled={!puedeAtras} aria-label="Semana anterior"
          style={{ background:"none", border:"none", padding:6, cursor:puedeAtras?"pointer":"default", color:puedeAtras?"var(--muted)":"var(--line2)" }}><ChevronLeft size={18}/></button>
        <div style={{ textAlign:"center", minWidth:0 }}>
          <div className="disp" style={{ fontWeight:600, fontSize:14.5 }}>{inf.rango}</div>
          <div style={{ fontSize:10.5, color:"var(--faint)", marginTop:2 }}>{inf.enCurso ? "Semana en curso · aún puede cambiar" : "Semana cerrada"}</div>
        </div>
        <button onClick={()=>puedeAlante && setLunes(addDaysISO(lunes,7))} disabled={!puedeAlante} aria-label="Semana siguiente"
          style={{ background:"none", border:"none", padding:6, cursor:puedeAlante?"pointer":"default", color:puedeAlante?"var(--muted)":"var(--line2)" }}><ChevronRight size={18}/></button>
      </div>

      {/* Titular */}
      <div className="fh-card fh-framed" style={{ padding:16, marginTop:12, borderColor:titular.color }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
          <FileText size={16} color={titular.color}/>
          <span className="disp" style={{ fontWeight:700, fontSize:15 }}>{inf.resumen.hechos} de {inf.resumen.previstos} sesiones</span>
        </div>
        <p style={{ margin:0, fontSize:13, color:"var(--txt)", lineHeight:1.55 }}>{titular.txt}</p>
        {inf.resumen.perdonados > 0 && (
          <div style={{ display:"flex", alignItems:"center", gap:7, marginTop:9, fontSize:11.5, color:"var(--sky)" }}>
            <BedDouble size={13}/> Canjeaste un día de descanso: esa semana pedía una sesión menos.
          </div>
        )}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:5, marginTop:13 }}>
          {Array.from({ length:7 }, (_,i)=>{
            const iso = addDaysISO(inf.lunes, i);
            const fue = entrenados.has(iso);
            const previsto = planned.includes(weekdayOfISO(iso)) && !enVacacion(state.vacations, iso);
            const futuro = iso > hoy;
            let bg="transparent", brd="1px solid var(--line)", col="var(--faint)";
            /* Mismos colores que la tarjeta de racha de Inicio: si aquí
               significaran otra cosa, habria que aprenderse dos leyendas. */
            if(fue){ bg = previsto ? "var(--gold)" : "var(--jade)"; brd="none"; col="#0F131A"; }
            else if(!previsto){ bg="var(--bg2)"; }
            else if(iso === hoy){ brd="1px solid var(--gold)"; col="var(--gold)"; }   // hoy, aún pendiente
            else if(futuro){ brd="1px dashed var(--line2)"; }
            else if(inf.resumen.cumplida || inf.resumen.recuperable){ brd="1px dashed var(--jade)"; col="var(--jade)"; }
            else { brd="1px solid var(--crimson)"; col="var(--crimson)"; }
            return (
              <div key={iso} style={{ textAlign:"center" }}>
                <div style={{ fontSize:9.5, color:"var(--faint)", marginBottom:3, fontWeight:600 }}>{labels[i]}</div>
                <div style={{ aspectRatio:"1", borderRadius:8, background:bg, border:brd, display:"flex", alignItems:"center", justifyContent:"center", color:col }}>
                  {fue ? (previsto ? <Check size={14}/> : <Sparkles size={13}/>)
                    : !previsto ? <Moon size={11}/>
                    : (previsto && iso === hoy) ? <Flame size={12}/>
                    : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Los cuatro números de la semana */}
      <div style={{ display:"flex", gap:8, marginTop:12 }}>
        <InformeStat icon={Dumbbell} color="var(--gold)"  valor={inf.sesiones.length} sub={inf.sesiones.length===1?"sesión":"sesiones"}/>
        <InformeStat icon={Target}   color="var(--jade)"  valor={inf.series}          sub="series"/>
        <InformeStat icon={Crown}    color="var(--ember)" valor={inf.records.length + inf.cardio.length} sub={(inf.records.length+inf.cardio.length)===1?"récord":"récords"}/>
        <InformeStat icon={Zap}      color="var(--arcane)" valor={inf.xp}             sub="XP"/>
      </div>

      {/* Sesión a sesión */}
      <div className="fh-card" style={{ padding:16, marginTop:12 }}>
        <InformeTitulo icon={ClipboardList} color="var(--gold)" nota="Lo que hiciste cada día, en el orden en que lo hiciste.">Tus sesiones</InformeTitulo>
        {inf.sesiones.length ? (
          <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
            {inf.sesiones.map((r,i)=>{
              const d = parseISO(r.date);
              const extra = !planned.includes(weekdayOfISO(r.date));
              return (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:11 }}>
                  <div style={{ width:38, flexShrink:0, textAlign:"center", padding:"5px 0", borderRadius:9, background:"var(--bg2)", border:"1px solid var(--line)" }}>
                    <div style={{ fontSize:9.5, color:"var(--faint)", fontWeight:600 }}>{labels[(d.getDay()+6)%7]}</div>
                    <div className="disp" style={{ fontSize:14, fontWeight:700 }}>{d.getDate()}</div>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:"var(--txt)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.dayName}</div>
                    <div style={{ fontSize:11, color:"var(--faint)", marginTop:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.routineName}</div>
                  </div>
                  {extra && <span className="fh-chip" style={{ background:"rgba(63,185,132,.14)", color:"var(--jade)", flexShrink:0 }}>EXTRA</span>}
                  <span className="mono" style={{ fontSize:11, color:"var(--muted)", flexShrink:0 }}>{seriesDe(r)} series</span>
                </div>
              );
            })}
          </div>
        ) : <Empty text={inf.enCurso ? "Aún no has entrenado esta semana" : "Ninguna sesión esa semana"}/>}
      </div>

      {/* Reparto del trabajo */}
      {inf.porGrupo.length > 0 && (
        <div className="fh-card" style={{ padding:16, marginTop:12 }}>
          <InformeTitulo icon={Swords} color="var(--mana)" nota={`${inf.ejercicios.length} ejercicio${inf.ejercicios.length===1?"":"s"} distinto${inf.ejercicios.length===1?"":"s"}. Series por atributo: así se reparte lo que has trabajado.`}>Qué entrenaste</InformeTitulo>
          <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
            {inf.porGrupo.map(g=>{ const I=g.icon; return (
              <div key={g.id} style={{ display:"flex", alignItems:"center", gap:10 }}>
                <I size={14} color={g.color} style={{ flexShrink:0 }}/>
                <span style={{ fontSize:12.5, color:"var(--txt)", width:66, flexShrink:0 }}>{g.id}</span>
                <div style={{ flex:1, height:8, background:"var(--line)", borderRadius:99, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${(g.sets/maxSets)*100}%`, background:g.color, borderRadius:99 }}/>
                </div>
                <span className="mono" style={{ fontSize:11, color:"var(--muted)", width:26, textAlign:"right", flexShrink:0 }}>{g.sets}</span>
              </div>
            ); })}
          </div>
        </div>
      )}

      {/* Récords */}
      {(inf.records.length > 0 || inf.cardio.length > 0) && (
        <div className="fh-card" style={{ padding:16, marginTop:12, borderColor:"var(--gold)" }}>
          <InformeTitulo icon={Crown} color="var(--gold)" nota="Marcas que superaste esa semana. Aquí los kilos sí significan algo.">Récords de la semana</InformeTitulo>
          <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
            {inf.records.map(r=>(
              <div key={r.name} style={{ display:"flex", alignItems:"center", gap:10 }}>
                <TrendingUp size={14} color="var(--gold)" style={{ flexShrink:0 }}/>
                <span style={{ flex:1, minWidth:0, fontSize:12.5, color:"var(--txt)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.name}</span>
                <span className="mono" style={{ fontSize:11.5, color:"var(--faint)", flexShrink:0 }}>{numES(r.prev)} →</span>
                <span className="mono" style={{ fontSize:12.5, color:"var(--gold)", fontWeight:700, flexShrink:0 }}>{numES(r.now)} {r.unit}</span>
              </div>
            ))}
            {inf.cardio.map(c=>(
              <div key={c.name} style={{ display:"flex", alignItems:"center", gap:10 }}>
                <Heart size={14} color="#E56B9F" style={{ flexShrink:0 }}/>
                <span style={{ flex:1, minWidth:0, fontSize:12.5, color:"var(--txt)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.name}</span>
                <span className="mono" style={{ fontSize:11.5, color:"var(--muted)", flexShrink:0 }}>{cardioRecordText(c.rec)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Logros */}
      {inf.logros.length > 0 && (
        <div className="fh-card" style={{ padding:16, marginTop:12 }}>
          <InformeTitulo icon={Trophy} color="var(--arcane)">Logros desbloqueados</InformeTitulo>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {inf.logros.map(a=>{ const I=a.icon; return (
              <div key={a.id} style={{ display:"flex", alignItems:"center", gap:11 }}>
                <div style={{ width:34, height:34, borderRadius:10, flexShrink:0, background:"var(--bg2)", border:"1px solid var(--gold)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <I size={15} color="var(--gold)"/>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:600 }}>{a.title}</div>
                  <div style={{ fontSize:11, color:"var(--faint)", marginTop:1 }}>{a.desc}</div>
                </div>
                <span className="mono" style={{ fontSize:11, color:"var(--gold)", flexShrink:0 }}>+{a.xp}</span>
              </div>
            ); })}
          </div>
        </div>
      )}

      {/* Nivel */}
      <div className="fh-card" style={{ padding:16, marginTop:12, display:"flex", alignItems:"center", gap:16 }}>
        <Ring pct={xpInto/xpNeed} size={80} stroke={7} color={rango.color}>
          <RankIcon size={15} color={rango.color}/>
          <div className="cinzel" style={{ fontSize:19, fontWeight:700, lineHeight:1, marginTop:1 }}>{nivel}</div>
        </Ring>
        <div style={{ flex:1, minWidth:0 }}>
          <div className="cinzel" style={{ fontSize:17, fontWeight:700, color:rango.color }}>{rango.name}</div>
          <div style={{ fontSize:12, color:"var(--muted)", marginTop:3 }}>
            {inf.xp > 0 ? <>Esa semana sumaste <b style={{ color:"var(--txt)" }}>{inf.xp} XP</b> entrenando.</> : "Esa semana no sumaste XP."}
          </div>
          <div style={{ fontSize:11, color:"var(--faint)", marginTop:4, lineHeight:1.45 }}>
            Ahora vas por {xpInto} / {xpNeed} XP para el nivel {nivel+1}. El nivel y el rango son los de hoy, no los de esa semana.
          </div>
        </div>
      </div>

      {/* Medidas */}
      {inf.medidas.length > 0 && (
        <div className="fh-card" style={{ padding:16, marginTop:12 }}>
          <InformeTitulo icon={Scale} color="var(--sky)">Lo que anotaste</InformeTitulo>
          <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
            <div className="disp" style={{ fontSize:24, fontWeight:700 }}>{numES(inf.ultima.weightKg)} kg</div>
            {inf.deltaPeso != null && inf.deltaPeso !== 0 && (
              <span className="fh-chip" style={{ background:"var(--bg2)", color:inf.deltaPeso<0?"var(--jade)":"var(--muted)", display:"flex", alignItems:"center", gap:4 }}>
                {inf.deltaPeso<0 ? <ArrowDown size={11}/> : <ArrowUp size={11}/>} {numES(Math.abs(inf.deltaPeso))} kg
              </span>
            )}
            <span style={{ fontSize:11.5, color:"var(--faint)" }}>{inf.medidas.length} medición{inf.medidas.length===1?"":"es"} esa semana</span>
          </div>
          {inf.ultima.waist && <div style={{ fontSize:11.5, color:"var(--muted)", marginTop:7 }}>Cintura: {numES(inf.ultima.waist)} cm. En recomposición dice más que la báscula.</div>}
        </div>
      )}

      {/* Tu círculo */}
      {cloudEnabled && perfil && (
        <div className="fh-card" style={{ padding:16, marginTop:12 }}>
          <InformeTitulo icon={Users} color="var(--jade)" nota="Lo que hicieron tus amigos esa semana. Solo lo que hacen, nunca lo que les falta.">Tu círculo</InformeTitulo>
          {circulo == null ? <Empty text="Cargando lo de tu gente…"/> : falloCirculo ? (
            <div style={{ fontSize:12, color:"var(--faint)", lineHeight:1.5 }}>No se ha podido consultar. Tu informe sale igual: esto es lo único que necesita red.</div>
          ) : (!circulo.lista.length && !circulo.quedadas.length && !circulo.nuevos.length) ? (
            <Empty text="Semana tranquila por ahí"/>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {circulo.lista.map(g=>(
                <div key={g.id} style={{ display:"flex", alignItems:"center", gap:11 }}>
                  <div style={{ width:32, height:32, borderRadius:10, flexShrink:0, background:"var(--bg2)", border:"1px solid var(--line)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <Dumbbell size={14} color="var(--jade)"/>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{g.nombre}</div>
                    <div style={{ fontSize:11, color:"var(--faint)", marginTop:1 }}>
                      {g.entrenos} entreno{g.entrenos===1?"":"s"}
                      {g.prs > 0 ? ` · ${g.prs} récord${g.prs===1?"":"s"}` : ""}
                    </div>
                  </div>
                  {g.prs > 0 && <Crown size={14} color="var(--gold)" style={{ flexShrink:0 }}/>}
                  <span className="mono" style={{ fontSize:11, color:"var(--muted)", flexShrink:0 }}>{g.xp} XP</span>
                </div>
              ))}
              {circulo.quedadas.map((n,i)=>(
                <div key={"q"+i} style={{ display:"flex", alignItems:"center", gap:11 }}>
                  <div style={{ width:32, height:32, borderRadius:10, flexShrink:0, background:"var(--bg2)", border:"1px solid var(--line)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <CalendarDays size={14} color="var(--sky)"/>
                  </div>
                  <div style={{ flex:1, minWidth:0, fontSize:12.5, color:"var(--txt)" }}>{n.display_name || "@"+n.handle} propuso una quedada</div>
                </div>
              ))}
              {circulo.nuevos.map((n,i)=>(
                <div key={"a"+i} style={{ display:"flex", alignItems:"center", gap:11 }}>
                  <div style={{ width:32, height:32, borderRadius:10, flexShrink:0, background:"var(--bg2)", border:"1px solid var(--line)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <Users size={14} color="var(--gold)"/>
                  </div>
                  <div style={{ flex:1, minWidth:0, fontSize:12.5, color:"var(--txt)" }}>{n.display_name || "@"+n.handle} entró en tu círculo</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ fontSize:11.5, color:"var(--faint)", margin:"14px 4px 4px", lineHeight:1.55, textAlign:"center" }}>
        El informe se calcula de tu historial cada vez que lo abres: no hay nada guardado que se quede desfasado.
      </div>
    </div>
  );
}

/* =========================================================================
   AMIGOS
   ========================================================================= */

/* Todo lo que tiene que ver con tu gente, en su propia pestaña de la barra: quiénes
   son, quién más hay en RPGym, las quedadas y quién va ganando. */
const AMIGOS_SECCIONES = [
  { id:"circulo", label:"Amigos" }, { id:"gente", label:"Buscar" }, { id:"quedadas", label:"Quedadas" }, { id:"clasificacion", label:"Clasificación" },
];
function AmigosView({ perfil, cloudEnabled, setTab, seccion, setSeccion, solicitudes, onResponderSolicitud, entrenando, onUnirme, amigos, onRefrescarAmigos, onQuitarAmigo, onAbrirAmigo,
                      quedadas, onRefrescarQuedadas, cargandoQuedadas, onCargarTabla, mz, yo }){
  // Sin amigos todavía, lo útil es ver quién hay.
  const sec = seccion || (amigos.length || solicitudes.length ? "circulo" : "gente");
  return (
    <div className="fh-in">
      <header style={{ padding:"22px 2px 8px" }}>
        <h1 style={{ margin:0, fontSize:22 }}>Amigos</h1>
        <p style={{ margin:"4px 0 0", fontSize:13, color:"var(--muted)" }}>Tu círculo, quién más entrena aquí y quién va ganando.</p>
      </header>

      {!cloudEnabled ? (
        <div className="fh-card" style={{ padding:16, marginTop:8 }}>
          <div style={{ display:"flex", alignItems:"center", gap:9, fontSize:14, marginBottom:6 }}><Users size={16} color="var(--faint)"/> Sin conexión configurada</div>
          <p style={{ fontSize:12.5, color:"var(--muted)", margin:0, lineHeight:1.5 }}>
            Esta copia de RPGym va 100% en local. La parte de amigos necesita una cuenta y este móvil no la tiene configurada.
          </p>
        </div>
      ) : !perfil ? (
        <div className="fh-card" style={{ padding:16, marginTop:8 }}>
          <div style={{ display:"flex", alignItems:"center", gap:9, fontSize:14, marginBottom:6 }}><Users size={16} color="var(--gold)"/> Necesitas una cuenta</div>
          <p style={{ fontSize:12.5, color:"var(--muted)", margin:"0 0 12px", lineHeight:1.5 }}>
            Es lo único que la app pide conexión para hacer. Con cuenta puedes añadir amigos, quedar para ir juntos
            y compararos. Sin ella, el resto de RPGym funciona exactamente igual.
          </p>
          <button className="fh-btn" onClick={()=>setTab("ajustes")}
            style={{ width:"100%", background:"var(--gold)", padding:12, fontSize:13, display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}>
            <User size={15}/> Crear cuenta o entrar
          </button>
        </div>
      ) : (
        <>
          <FilaPestanas tabs={AMIGOS_SECCIONES.map(s=>s.id==="circulo" ? { ...s, aviso:solicitudes.length } : s)} activa={sec} onCambia={setSeccion}/>
          {sec==="circulo" && <>
            <SolicitudesCard solicitudes={solicitudes} onResponder={onResponderSolicitud}/>
            <AmigosPanel amigos={amigos} entrenando={entrenando} onUnirme={s=>{ onUnirme(s); setTab("rutinas"); }} onQuitar={onQuitarAmigo} onAbrir={onAbrirAmigo} onBuscar={()=>setSeccion("gente")}/>
          </>}
          {sec==="gente" && <GentePanel amigos={amigos} onRefrescarAmigos={onRefrescarAmigos} onAbrir={onAbrirAmigo}/>}
          {sec==="quedadas" && <QuedadasPanel modo="todo" quedadas={quedadas} onRefrescar={onRefrescarQuedadas} cargando={cargandoQuedadas}/>}
          {sec==="clasificacion" && <>
            <ClasificacionMazmorra mz={mz} yo={yo} amigos={amigos}/>
            <ClasificacionCard perfil={perfil} cargar={onCargarTabla} señal={amigos.length}/>
          </>}
        </>
      )}

      <div style={{ height:24 }}/>
    </div>
  );
}

/* =========================================================================
   FICHA DE PERSONAJE
   ========================================================================= */

/* =========================================================================
   HÉROE (tab "heroe"): personalización y equipo
   Con `arranque` es el creador por pasos que sale al crear el perfil o al actualizar,
   y solo guarda al terminar. Sin él se guarda cada cambio al momento.
   ========================================================================= */
function MuestraColor({ colores, activo, onClick, etiqueta }){
  return <button onClick={onClick} aria-label={etiqueta} aria-pressed={activo} title={etiqueta}
    style={{ width:38, height:38, padding:0, cursor:"pointer", background:`linear-gradient(135deg,${colores[0]} 50%,${colores[1]} 50%)`,
      border:`2px solid ${activo ? "var(--gold)" : "var(--line2)"}`, boxShadow:activo ? "0 0 0 2px var(--gold)" : "none" }}/>;
}
function OpcionHeroe({ activo, onClick, children }){
  return <button className="fh-btn" onClick={onClick} aria-pressed={activo}
    style={{ padding:"9px 12px", fontSize:15, background:activo ? "var(--gold)" : "var(--card2)", color:activo ? "#1A1020" : "var(--txt)", border:`1px solid ${activo ? "var(--gold)" : "var(--line2)"}` }}>{children}</button>;
}
const tituloHeroe = { fontSize:12, fontWeight:700, letterSpacing:".08em", color:"var(--faint)", margin:"16px 2px 8px" };
const filaHeroe = { display:"flex", flexWrap:"wrap", gap:8 };

/* Cuánto llevas en cada rama y qué es lo siguiente que ganas. */
function PanelRamas({ puntos, actual }){
  const dominante = ramaDominante(puntos);
  return (<>
    {dominante && dominante.id!==actual && <div style={{ fontSize:12.5, color:"var(--muted)", lineHeight:1.45, marginBottom:10 }}>
      Tus entrenos te llevan hacia <b style={{ color:dominante.color }}>{dominante.nombre}</b>.
    </div>}
    {RAMAS.map(r=>{
      const n = puntos[r.id]||0, sig = siguientePieza(r.id, puntos);
      const previa = [...PIEZAS_POR_RAMA[r.id]].reverse().find(p=>p.u<=n)?.u || 0;
      const pct = sig ? (n-previa)/(sig.u-previa) : 1;
      return (
        <div key={r.id} style={{ marginBottom:11 }}>
          <div style={{ display:"flex", justifyContent:"space-between", gap:8, fontSize:12.5 }}>
            <span><b style={{ color:r.color }}>{r.nombre}</b> <span style={{ color:"var(--faint)" }}>· {r.estilo}</span></span>
            <span className="mono" style={{ color:"var(--muted)", fontSize:11.5 }}>{n}</span>
          </div>
          <div className="fh-bar" style={{ marginTop:5 }}><i style={{ width:`${Math.min(100,pct*100)}%`, background:r.color }}/></div>
          <div style={{ fontSize:11, color:"var(--faint)", marginTop:4 }}>{sig ? `${sig.u-n} para ${sig.n}` : "Rama completa"}</div>
        </div>
      );
    })}
  </>);
}

function HeroeView({ avatar, puntos, onCambiar, onVolver, arranque, onAhoraNo }){
  const [av, setAv] = useState(avatar);
  const secciones = [["senda","Senda"],["aspecto","Aspecto"],["color","Color"], ...(arranque ? [] : [["equipo","Equipo"],["especial","Especial"]])];
  const [sec, setSec] = useState(arranque ? "senda" : "equipo");
  const [ranura, setRanura] = useState(null);
  const cambiar = p=>{ const n = { ...av, ...p }; setAv(n); if(!arranque) onCambiar(n); };
  const elegirRama = id=>cambiar({ rama:id, equipo:equipoDeRama(id, puntos), especial:null, ...(arranque ? { armadura:RAMA[id].armadura } : {}) });
  const equipar = (id, slot)=>{ const equipo = { ...av.equipo }; if(id) equipo[slot] = id; else delete equipo[slot]; cambiar({ equipo }); };
  const ganadas = Object.values(PIEZAS_POR_RAMA).flat().filter(p=>p.u>0 && p.u<=(puntos[p.rama]||0)).length;
  const paso = secciones.findIndex(s=>s[0]===sec), ultimo = paso===secciones.length-1;
  const heroeVista = M.crearHeroe({ id:"yo", nombre:"", avatar:av, level:1 }, AVATAR.piezas), especialActual = M.especialDe(heroeVista).id;

  return (
    <div className="fh-in" style={{ paddingBottom:arranque ? 8 : 24 }}>
      <header style={{ padding:"22px 2px 12px", display:"flex", alignItems:"center", gap:10 }}>
        {!arranque && <button onClick={onVolver} aria-label="Volver"
          style={{ background:"var(--card)", border:"1px solid var(--line)", width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"var(--muted)", flexShrink:0 }}><ChevronLeft size={18}/></button>}
        <div style={{ flex:1, minWidth:0 }}>
          <h1 style={{ margin:0, fontSize:24 }}>{arranque ? "Crea tu héroe" : "Tu héroe"}</h1>
          <p style={{ margin:"3px 0 0", fontSize:13, color:"var(--muted)" }}>{RAMA[av.rama].nombre} · {RAMA[av.rama].estilo}</p>
        </div>
        {arranque && <button className="fh-btn" onClick={onAhoraNo} style={{ background:"var(--card)", color:"var(--muted)", border:"1px solid var(--line2)", padding:"8px 12px", fontSize:14 }}>Ahora no</button>}
      </header>

      <div className="fh-card fh-framed" style={{ padding:0, marginBottom:12 }}>
        <div className="fh-escena" style={{ height:190, display:"flex", alignItems:"flex-end", justifyContent:"center" }}>
          <Avatar av={av} escala={3} className="fh-idle" style={{ marginBottom:-10 }} titulo={`Tu héroe: ${RAMA[av.rama].nombre}`}/>
        </div>
      </div>

      <div role="tablist" style={{ display:"flex", gap:4, marginBottom:4 }}>
        {secciones.map(([id,et])=><button key={id} role="tab" aria-selected={sec===id} className="fh-btn" onClick={()=>setSec(id)}
          style={{ flex:1, minWidth:0, padding:"9px 0", fontSize:secciones.length>4 ? 12.5 : 14, letterSpacing:0, background:sec===id ? "var(--gold)" : "var(--card)", color:sec===id ? "#1A1020" : "var(--muted)", border:`1px solid ${sec===id ? "var(--gold)" : "var(--line2)"}` }}>{et}</button>)}
      </div>

      {sec==="senda" && <>
        <div style={tituloHeroe}>ELIGE TU ESTILO</div>
        {arranque && ganadas>0 && <p style={{ fontSize:12.5, color:"var(--muted)", margin:"0 2px 10px", lineHeight:1.45 }}>Con lo que ya has entrenado llevas <b style={{ color:"var(--gold)" }}>{ganadas} {ganadas===1 ? "pieza ganada" : "piezas ganadas"}</b>.</p>}
        {RAMAS.map(r=>{
          const hoy = { ...av, rama:r.id, armadura:arranque ? r.armadura : av.armadura, equipo:equipoDeRama(r.id, puntos) };
          const final = { ...hoy, equipo:equipoDeRama(r.id, { [r.id]:Infinity }) };
          return (
            <button key={r.id} onClick={()=>elegirRama(r.id)} aria-pressed={av.rama===r.id} className="fh-card"
              style={{ display:"flex", alignItems:"center", gap:4, width:"100%", textAlign:"left", padding:"6px 10px 6px 2px", marginBottom:8, cursor:"pointer", color:"var(--txt)", borderColor:av.rama===r.id ? r.color : undefined }}>
              <Avatar av={hoy} escala={1}/>
              <ChevronRight size={13} color="var(--faint)" style={{ flexShrink:0, marginLeft:-8 }}/>
              <Avatar av={final} escala={1} style={{ marginLeft:-8 }}/>
              <span style={{ flex:1, minWidth:0, marginLeft:2 }}>
                <span className="disp" style={{ display:"block", fontSize:19, color:r.color, lineHeight:1.1 }}>{r.nombre}</span>
                <span style={{ display:"block", fontSize:12, fontWeight:600 }}>{r.estilo}</span>
                <span style={{ display:"block", fontSize:11.5, color:"var(--muted)", marginTop:2, lineHeight:1.35 }}>{r.resumen} {r.cuenta}</span>
              </span>
            </button>
          );
        })}
      </>}

      {sec==="aspecto" && <>
        <div style={tituloHeroe}>CUERPO</div>
        <div style={filaHeroe}>
          <OpcionHeroe activo={av.sexo==="m"} onClick={()=>cambiar({ sexo:"m" })}>Masculino</OpcionHeroe>
          <OpcionHeroe activo={av.sexo==="f"} onClick={()=>cambiar({ sexo:"f", barba:null })}>Femenino</OpcionHeroe>
        </div>
        <div style={tituloHeroe}>PIEL</div>
        <div style={filaHeroe}>{Object.entries(RAMPAS.piel).map(([id,r])=><MuestraColor key={id} colores={[r[4],r[2]]} activo={av.piel===id} etiqueta={NOMBRES_COLOR[id]} onClick={()=>cambiar({ piel:id })}/>)}</div>
        <div style={tituloHeroe}>PEINADO</div>
        <div style={filaHeroe}>
          <OpcionHeroe activo={!av.pelo} onClick={()=>cambiar({ pelo:null })}>Sin pelo</OpcionHeroe>
          {Object.entries(AVATAR.pelos).map(([id,p])=><OpcionHeroe key={id} activo={av.pelo===id} onClick={()=>cambiar({ pelo:id })}>{p.n}</OpcionHeroe>)}
        </div>
        <div style={tituloHeroe}>COLOR DE PELO</div>
        <div style={filaHeroe}>{Object.entries(RAMPAS.pelo).map(([id,r])=><MuestraColor key={id} colores={[r[4],r[2]]} activo={av.colorPelo===id} etiqueta={NOMBRES_COLOR[id]} onClick={()=>cambiar({ colorPelo:id })}/>)}</div>
        {av.sexo==="m" && <>
          <div style={tituloHeroe}>BARBA</div>
          <div style={filaHeroe}>
            <OpcionHeroe activo={!av.barba} onClick={()=>cambiar({ barba:null })}>Sin barba</OpcionHeroe>
            {Object.entries(AVATAR.barbas).map(([id,b])=><OpcionHeroe key={id} activo={av.barba===id} onClick={()=>cambiar({ barba:id })}>{b.n}</OpcionHeroe>)}
          </div>
        </>}
        <div style={tituloHeroe}>OJOS</div>
        <div style={filaHeroe}>{Object.entries(OJOS).map(([id,[n,c]])=><MuestraColor key={id} colores={[c,c]} activo={av.ojos===id} etiqueta={n} onClick={()=>cambiar({ ojos:id })}/>)}</div>
      </>}

      {sec==="color" && <>
        <div style={tituloHeroe}>COLOR DE LA ARMADURA</div>
        <div style={filaHeroe}>{Object.entries(RAMPAS.armadura).map(([id,r])=>(
          <div key={id} style={{ width:62, textAlign:"center" }}>
            <MuestraColor colores={[r[4],r[2]]} activo={av.armadura===id} etiqueta={NOMBRES_COLOR[id]} onClick={()=>cambiar({ armadura:id })}/>
            <div style={{ fontSize:11, color:"var(--muted)", marginTop:4 }}>{NOMBRES_COLOR[id]}</div>
          </div>))}
        </div>
      </>}

      {sec==="equipo" && <>
        <div style={tituloHeroe}>EQUIPO</div>
        {RANURAS.map(([id,et,opcional])=>{
          const lista = Object.values(PIEZAS_POR_RAMA).flat().filter(p=>p.ranura===id);
          if(!lista.length) return null;
          const puesto = AVATAR.piezas[av.equipo?.[id]], abierta = ranura===id;
          return (
            <div key={id} className="fh-card" style={{ marginBottom:8 }}>
              <button onClick={()=>setRanura(abierta ? null : id)} aria-expanded={abierta}
                style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8, width:"100%", padding:"11px 13px", background:"none", border:"none", cursor:"pointer", color:"var(--txt)", textAlign:"left" }}>
                <span style={{ fontSize:12, color:"var(--faint)", fontWeight:700, width:66, flexShrink:0 }}>{et}</span>
                <span style={{ flex:1, minWidth:0, fontSize:13.5 }}>{puesto?.n || <span style={{ color:"var(--faint)" }}>Nada</span>}</span>
                <ChevronDown size={15} color="var(--faint)" style={{ transform:abierta ? "rotate(180deg)" : "none", flexShrink:0 }}/>
              </button>
              {abierta && <div style={{ padding:"0 13px 12px" }}>
                {opcional && <button className="fh-btn" onClick={()=>equipar(null,id)} style={{ width:"100%", padding:8, marginBottom:6, fontSize:14, background:"var(--card2)", color:"var(--muted)", border:"1px solid var(--line2)" }}>Quitar</button>}
                {lista.map(p=>{
                  const falta = p.u-(puntos[p.rama]||0), libre = falta<=0, r = RAMA[p.rama], lleva = av.equipo?.[id]===p.id;
                  return (
                    <button key={p.id} disabled={!libre} onClick={()=>equipar(p.id,id)} aria-pressed={lleva}
                      style={{ display:"flex", alignItems:"center", gap:9, width:"100%", textAlign:"left", padding:"8px 9px", marginBottom:4, cursor:libre ? "pointer" : "default", color:"var(--txt)",
                        background:lleva ? "var(--card2)" : "var(--bg2)", border:`1px solid ${lleva ? r.color : "var(--line)"}`, opacity:libre ? 1 : .62 }}>
                      {libre ? (lleva ? <Check size={15} color={r.color} style={{ flexShrink:0 }}/> : <i style={{ width:15, height:15, background:r.color, flexShrink:0 }}/>) : <Lock size={15} color="var(--faint)" style={{ flexShrink:0 }}/>}
                      <span style={{ flex:1, minWidth:0 }}>
                        <span style={{ display:"block", fontSize:13 }}>{p.n}</span>
                        <span style={{ display:"block", fontSize:11, color:"var(--faint)" }}>{libre ? r.nombre : `Faltan ${falta} de ${r.estilo}`}</span>
                      </span>
                    </button>
                  );
                })}
              </div>}
            </div>
          );
        })}
        <div style={tituloHeroe}>TUS RAMAS</div>
        <div className="fh-card" style={{ padding:14 }}><PanelRamas puntos={puntos} actual={av.rama}/></div>
      </>}

      {sec==="especial" && <>
        <div style={tituloHeroe}>TU ATAQUE ESPECIAL</div>
        <p style={{ fontSize:12.5, color:"var(--muted)", margin:"0 2px 10px", lineHeight:1.45 }}>Llevas uno a la mazmorra. Se paga con Impulso y se desbloquean más con series reales de cada rama.</p>
        {RAMAS.map(r=>(
          <div key={r.id} style={{ marginBottom:10 }}>
            <div style={{ fontSize:13, fontWeight:700, color:r.color, margin:"0 2px 4px" }}>{r.nombre} · {r.estilo}</div>
            {Object.values(M.ESPECIALES).filter(e=>e.rama===r.id).map(e=>{
              const libre = M.especialDisponible(e, puntos), lleva = especialActual===e.id, falta = e.u-(puntos[e.rama]||0);
              return (
                <button key={e.id} disabled={!libre} onClick={()=>cambiar({ especial:e.id })} aria-pressed={lleva}
                  style={{ display:"flex", alignItems:"center", gap:9, width:"100%", textAlign:"left", padding:"8px 10px", marginBottom:4, cursor:libre ? "pointer" : "default", color:"var(--txt)", background:lleva ? "var(--card2)" : "var(--card)", border:`1px solid ${lleva ? r.color : "var(--line)"}`, opacity:libre ? 1 : .62 }}>
                  {libre ? (lleva ? <Check size={15} color={r.color} style={{ flexShrink:0 }}/> : <i style={{ width:15, height:15, background:r.color, flexShrink:0 }}/>) : <Lock size={15} color="var(--faint)" style={{ flexShrink:0 }}/>}
                  <span style={{ flex:1, minWidth:0 }}>
                    <span style={{ display:"block", fontSize:13.5 }}>{e.nombre} <span style={{ color:"var(--gold)", fontSize:11.5 }}>· {e.coste} de Impulso</span></span>
                    <span style={{ display:"block", fontSize:11.5, color:"var(--muted)", lineHeight:1.35 }}>{e.texto(heroeVista.ataque, heroeVista.apoyo)}</span>
                    {!libre && <span style={{ display:"block", fontSize:11, color:"var(--faint)" }}>Faltan {falta} de {r.estilo}</span>}
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </>}

      {arranque && <button className="fh-btn" onClick={()=>ultimo ? onCambiar(av) : setSec(secciones[paso+1][0])}
        style={{ width:"100%", marginTop:16, padding:14, fontSize:19, background:"var(--gold)", color:"#1A1020" }}>{ultimo ? "¡A la aventura!" : "Siguiente"}</button>}
    </div>
  );
}

function CharacterView({ state, avatar, puntos, level, rank, log, customRoutines, setTab, onAbrirInforme, onAbrirResumenes }){
  const [openStat, setOpenStat] = useState(null);
  const [openEx, setOpenEx] = useState(null);   // ejercicio recomendado desplegado
  const weekSets=weeklySetsByGroup(log, state.weekStart);
  const xpInto=state.xp-cumXpForLevel(level), xpNeed=cumXpForLevel(level+1)-cumXpForLevel(level);

  // Ejercicios realizados: nombre -> { sessions, best }
  const exDone={};
  (log||[]).forEach(rec=>(rec.exercises||[]).forEach(ex=>{
    if(!ex.logs || !ex.logs.length) return;
    const e = exDone[ex.name] || (exDone[ex.name]={ sessions:0, best:0 });
    e.sessions+=1; ex.logs.forEach(l=>{ if((l.weight||0)>e.best) e.best=l.weight; });
  }));
  Object.entries(state.bests||{}).forEach(([n,w])=>{ const e=exDone[n]||(exDone[n]={ sessions:0, best:0 }); if(w>e.best) e.best=w; });

  // Ejercicios de la rutina activa (para priorizar recomendaciones)
  const activeRoutine=findRoutine(state.activeRoutine, customRoutines);
  const inActive=new Set(); activeRoutine?.days.forEach(d=>d.exercises.forEach(ex=>inActive.add(ex.name)));

  const stats=BODY_STATS.map(s=>{ const xp=(state.muscleXp||{})[s.id]||0; const lv=catLevel(xp);
    const into=xp-catCumXp(lv), need=catCumXp(lv+1)-catCumXp(lv);
    const all=EXERCISES_BY_GROUP[s.id]||[];
    const done=all.filter(n=>exDone[n]);
    const todo=all.filter(n=>!exDone[n]).sort((a,b)=>(inActive.has(b)?1:0)-(inActive.has(a)?1:0));
    return { ...s, xp, lv, into, need, rem:Math.max(0,need-into), all, done, todo }; });
  const power=stats.reduce((a,s)=>a+s.lv,0);
  const tier=powerTier(power);
  /* Aguante queda fuera del "punto fuerte / punto débil": es cardio, un
     complementario. Recomendarlo siempre (que es lo que pasaba, porque casi
     nunca es el más alto) tapaba el grupo muscular que de verdad va retrasado. */
  const sorted=[...stats].filter(s=>s.id!=="Aguante").sort((a,b)=>b.lv-a.lv);
  const strongest=sorted[0], weakest=sorted[sorted.length-1];
  const weakPick=weakest.todo.find(n=>inActive.has(n)) || weakest.todo[0] || weakest.done[0];

  return (
    <div className="fh-in">
      <header style={{ padding:"22px 2px 12px", display:"flex", alignItems:"center", gap:10 }}>
        <button onClick={()=>setTab("home")} aria-label="Volver a Inicio"
          style={{ background:"var(--card)", border:"1px solid var(--line)", borderRadius:10, width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"var(--muted)", flexShrink:0 }}><ChevronLeft size={18}/></button>
        <div>
          <h1 style={{ margin:0, fontSize:22 }}>Ficha de personaje</h1>
          <p style={{ margin:"4px 0 0", fontSize:13, color:"var(--muted)" }}>Cada parte del cuerpo sube de nivel con su propio entrenamiento.</p>
        </div>
      </header>

      <div className="fh-card fh-framed" style={{ padding:20, display:"flex", alignItems:"center", gap:18 }}>
        <Ring pct={xpInto/xpNeed} size={112} stroke={9} color={rank.color}>
          <AvatarCara av={avatar} size={34}/>
          <div className="cinzel" style={{ fontSize:27, fontWeight:700, lineHeight:1, marginTop:2 }}>{level}</div>
          <div style={{ fontSize:9, color:"var(--muted)", fontWeight:600 }}>NIVEL</div>
        </Ring>
        <div style={{ flex:1 }}>
          <div className="cinzel" style={{ fontSize:20, fontWeight:700, color:rank.color }}>{rank.name}</div>
          <div style={{ fontSize:12, color:"var(--muted)", marginTop:3 }}>{state.profile?.name||"Atleta"} · {state.totalWorkouts} entrenos</div>
          <div style={{ fontSize:11, color:"var(--faint)", marginTop:7 }}>Faltan {xpNeed-xpInto} XP para nivel {level+1}</div>
        </div>
      </div>

      <div className="fh-card" style={{ padding:14, marginTop:12 }}>
        <PanelRamas puntos={puntos} actual={avatar.rama}/>
        <button className="fh-btn" onClick={()=>setTab("heroe")} style={{ width:"100%", padding:12, marginTop:2, fontSize:17, background:"var(--gold)", color:"#1A1020" }}>Personalizar héroe</button>
      </div>

      {/* El informe semanal sale solo el lunes; a partir de ahí se consulta aquí,
          que es donde uno viene a mirarse las estadísticas. Abre la semana en
          curso: la anterior está a un toque de la flecha de dentro. */}
      <button className="fh-card" onClick={()=>onAbrirInforme(mondayOf(todayISO()))}
        style={{ width:"100%", padding:14, marginTop:12, display:"flex", alignItems:"center", gap:11, cursor:"pointer", textAlign:"left" }}>
        <FileText size={17} color="var(--gold)" style={{ flexShrink:0 }}/>
        <div style={{ flex:1, minWidth:0 }}>
          <div className="disp" style={{ fontWeight:600, fontSize:14.5 }}>Informe semanal</div>
          <div style={{ fontSize:11.5, color:"var(--muted)", marginTop:2 }}>Sesiones, récords, logros y lo que hizo tu gente.</div>
        </div>
        <ChevronRight size={16} color="var(--faint)" style={{ flexShrink:0 }}/>
      </button>

      {/* Su pareja: el que escribe Claude cada dos semanas (ResumenesView). Solo con
          cuenta, porque vive en la nube. */}
      {onAbrirResumenes && (
        <button className="fh-card" onClick={onAbrirResumenes}
          style={{ width:"100%", padding:14, marginTop:12, display:"flex", alignItems:"center", gap:11, cursor:"pointer", textAlign:"left" }}>
          <Sparkles size={17} color="var(--violet)" style={{ flexShrink:0 }}/>
          <div style={{ flex:1, minWidth:0 }}>
            <div className="disp" style={{ fontWeight:600, fontSize:14.5 }}>Informe quincenal</div>
            <div style={{ fontSize:11.5, color:"var(--muted)", marginTop:2 }}>Tu trayectoria y qué subir, escrito por Claude. Todos guardados.</div>
          </div>
          <ChevronRight size={16} color="var(--faint)" style={{ flexShrink:0 }}/>
        </button>
      )}

      {/* Poder total explicado (suma de niveles de los 7 atributos) */}
      <div className="fh-card" style={{ padding:"14px 16px", marginTop:12 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <Sparkles size={16} color="var(--gold)"/>
            <div>
              <div style={{ display:"flex", alignItems:"baseline", gap:7 }}>
                <span style={{ fontSize:13, color:"var(--muted)" }}>Poder total</span>
                <span className="cinzel" style={{ color:"var(--gold)", fontWeight:700, fontSize:18 }}>{power}</span>
              </div>
              <div style={{ fontSize:10.5, color:"var(--faint)", marginTop:2 }}>Suma del nivel de tus 7 atributos</div>
            </div>
          </div>
          <span className="fh-chip cinzel" style={{ background:"rgba(232,176,75,.14)", color:"var(--gold)", fontSize:12 }}>{tier.name}</span>
        </div>
        {tier.next && (
          <>
            <div className="fh-bar" style={{ marginTop:11 }}><i style={{ width:`${tier.pct}%`, background:"var(--gold)" }}/></div>
            <div style={{ fontSize:10.5, color:"var(--faint)", marginTop:5 }}>Sube {tier.rem} nivel{tier.rem===1?"":"es"} de atributo más para alcanzar <b style={{ color:"var(--muted)" }}>{tier.next}</b>.</div>
          </>
        )}
      </div>

      <div className="fh-card" style={{ padding:"4px 16px 14px", marginTop:12 }}>
        <div className="disp" style={{ fontWeight:600, fontSize:12, letterSpacing:".08em", padding:"14px 0 2px", color:"var(--faint)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <span>ATRIBUTOS</span><span style={{ fontWeight:500, textTransform:"none", letterSpacing:0 }}>toca para ver ejercicios</span>
        </div>
        {stats.map(s=>{ const I=s.icon; const isOpen=openStat===s.id; return (
          <div key={s.id} className="fh-stat" style={{ flexDirection:"column", alignItems:"stretch" }}>
            <button onClick={()=>{ setOpenStat(isOpen?null:s.id); setOpenEx(null); }} style={{ background:"none", border:"none", padding:0, cursor:"pointer", color:"var(--txt)", display:"flex", alignItems:"center", gap:12, textAlign:"left", width:"100%" }}>
              <div style={{ width:38, height:38, borderRadius:11, display:"flex", alignItems:"center", justifyContent:"center", background:"var(--bg2)", border:`1px solid ${s.color}`, flexShrink:0 }}>
                <I size={18} color={s.color}/>
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:5, gap:8 }}>
                  <span className="cinzel" style={{ fontSize:14.5, fontWeight:700 }}>{s.id}</span>
                  <span style={{ display:"flex", alignItems:"center", gap:7 }}>
                    <span className="fh-chip cinzel" style={{ background:"var(--bg2)", color:s.color }}>Nv {s.lv}</span>
                    <ChevronRight size={15} color="var(--faint)" style={{ transform:isOpen?"rotate(90deg)":"none", transition:"transform .18s" }}/>
                  </span>
                </div>
                <div className="fh-bar"><i style={{ width:`${Math.min(100,(s.into/s.need)*100)}%`, background:s.color }}/></div>
                <div style={{ display:"flex", justifyContent:"space-between", marginTop:4, gap:8 }}>
                  <span style={{ fontSize:10.5, color:"var(--faint)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.done.length}/{s.all.length} ejercicios probados</span>
                  <span className="mono" style={{ fontSize:10.5, color:"var(--muted)", whiteSpace:"nowrap" }}>{s.into}/{s.need} · faltan {s.rem}</span>
                </div>
              </div>
            </button>

            {isOpen && (
              <div className="fh-in" style={{ marginTop:11, paddingTop:11, borderTop:`1px dashed var(--line2)` }}>
                <div style={{ fontSize:11, fontWeight:700, color:"var(--muted)", marginBottom:7, display:"flex", alignItems:"center", gap:6 }}><Check size={13} color="var(--jade)"/> Realizados</div>
                {s.done.length ? (
                  <div style={{ display:"flex", flexDirection:"column", gap:2, marginBottom:12 }}>
                    {s.done.map(n=>{ const d=exDone[n]; return (
                      <div key={n} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:8, fontSize:12.5, padding:"3px 0" }}>
                        <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{n}</span>
                        <span className="mono" style={{ fontSize:10.5, color:"var(--muted)", whiteSpace:"nowrap", flexShrink:0 }}>{d.best>0?`${d.best} kg · `:""}{d.sessions}×</span>
                      </div>
                    ); })}
                  </div>
                ) : <div style={{ fontSize:12, color:"var(--faint)", marginBottom:12 }}>Aún no has probado ninguno de este grupo. ¡Estrena uno!</div>}

                <div style={{ fontSize:11, fontWeight:700, color:"var(--muted)", marginBottom:7, display:"flex", alignItems:"center", gap:6 }}><Target size={13} color={s.color}/> Recomendados para explorar</div>
                {s.todo.length ? (<>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
                    {s.todo.slice(0,6).map(n=>{ const rec=inActive.has(n); const abierto=openEx===n; return (
                      <button key={n} onClick={()=>setOpenEx(abierto?null:n)}
                        style={{ fontSize:11.5, padding:"5px 10px", borderRadius:999, cursor:"pointer",
                          background:abierto?"var(--card2)":rec?"rgba(232,176,75,.14)":"var(--bg2)",
                          color:rec?"var(--gold)":"var(--muted)",
                          border:`1px solid ${abierto?"var(--gold)":rec?"var(--gold)":"var(--line)"}` }}>
                        {n}{rec?" · en tu rutina":""}
                      </button>
                    ); })}
                    {s.todo.length>6 && <span style={{ fontSize:11.5, color:"var(--faint)", alignSelf:"center" }}>+{s.todo.length-6} más</span>}
                  </div>
                  {/* Con 231 ejercicios el nombre no basta para saber qué máquina
                      es: al tocarlo se ve la demostración y cómo se hace. */}
                  {openEx && s.todo.includes(openEx) && (
                    <div className="fh-in" style={{ marginTop:10, padding:12, background:"var(--bg2)", borderRadius:11, border:"1px solid var(--line)" }}>
                      <div style={{ fontSize:13, fontWeight:700, marginBottom:9 }}>{openEx}</div>
                      <ExImage name={openEx}/>
                      {EX_HOW[openEx] && (
                        <p style={{ fontSize:12, color:"var(--muted)", margin:"10px 0 0", lineHeight:1.5 }}>{EX_HOW[openEx]}</p>
                      )}
                      {EX_BASE[openEx] > 0 && (
                        <div style={{ fontSize:11, color:"var(--faint)", marginTop:8 }}>Peso de partida orientativo: {EX_BASE[openEx]} kg.</div>
                      )}
                    </div>
                  )}
                </>) : <div style={{ fontSize:12, color:"var(--jade)" }}>¡Has probado todos los de este grupo! 💪</div>}
              </div>
            )}
          </div>
        ); })}
      </div>

      <div className="fh-card" style={{ padding:"4px 16px 14px", marginTop:12 }}>
        <div className="disp" style={{ fontWeight:600, fontSize:12, letterSpacing:".08em", padding:"14px 0 4px", color:"var(--faint)", display:"flex", alignItems:"center", gap:6 }}><ShieldAlert size={14} color="var(--gold)"/> PROTECCIÓN · VOLUMEN DE ESTA SEMANA</div>
        {BODY_STATS.filter(s=>s.id!=="Aguante").map(s=>{ const done=weekSets[s.id]||0; const ceil=GROUP_CEIL[s.id]||24;
          const ratio=ceil?done/ceil:0; const c=ratio>=1?"var(--crimson)":ratio>=0.8?"var(--amber)":"var(--jade)";
          return (
            <div key={s.id} className="fh-stat">
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                  <span style={{ fontSize:13 }}>{s.id}</span>
                  <span className="mono" style={{ fontSize:11, color:c }}>{done}/{ceil} series</span>
                </div>
                <div className="fh-bar"><i style={{ width:`${Math.min(100,ratio*100)}%`, background:c }}/></div>
              </div>
            </div>
          ); })}
        {(()=>{ const over=BODY_STATS.filter(s=>s.id!=="Aguante" && (weekSets[s.id]||0)>=(GROUP_CEIL[s.id]||24));
          if(over.length) return <div style={{ fontSize:12, color:"var(--crimson)", marginTop:11, lineHeight:1.45 }}>⚠ Te estás pasando de volumen en {over.map(o=>o.id).join(", ")}. Reduce series o descansa esos grupos: más no es mejor y aumenta el riesgo de lesión y de estancarte.</div>;
          const near=BODY_STATS.filter(s=>s.id!=="Aguante" && (weekSets[s.id]||0)>=(GROUP_CEIL[s.id]||24)*0.8);
          if(near.length) return <div style={{ fontSize:12, color:"var(--amber)", marginTop:11, lineHeight:1.45 }}>Vas alto en {near.map(o=>o.id).join(", ")}: estás en buen rango de estímulo, no hace falta añadir más series.</div>;
          return <div style={{ fontSize:12, color:"var(--muted)", marginTop:11, lineHeight:1.45 }}>Tu reparto de volumen esta semana está en un rango saludable. Cada barra son series por grupo; cuando una llega al rojo, toca bajar o descansar ese grupo.</div>;
        })()}
      </div>

      {power>7 && (
        <div className="fh-card" style={{ padding:16, marginTop:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, marginBottom:7 }}>
            <Star size={15} color={strongest.color}/><span>Tu punto fuerte es <b style={{ color:strongest.color }}>{strongest.id}</b> (Nv {strongest.lv}).</span>
          </div>
          <div style={{ display:"flex", alignItems:"flex-start", gap:8, fontSize:13 }}>
            <Target size={15} color={weakest.color} style={{ flexShrink:0, marginTop:2 }}/>
            <span>Para equilibrarte, dale caña a <b style={{ color:weakest.color }}>{weakest.id}</b> (Nv {weakest.lv}){weakPick?<> — prueba <b>{weakPick}</b>{inActive.has(weakPick)?" (está en tu rutina)":""}</>:""}.</span>
          </div>
        </div>
      )}

    </div>
  );
}

/* =========================================================================
   LOGROS
   ========================================================================= */

function AchievementsView({ state, level, mz }){
  const [sec, setSec] = useState("gym");
  const unlocked=Object.keys(state.achievements||{}).length;
  const ganados=M.LOGROS.filter(l=>mz?.logros?.[l.id]).length;
  return (
    <div className="fh-in">
      <header style={{ padding:"22px 2px 8px" }}>
        <h1 style={{ margin:0, fontSize:22 }}>Logros</h1>
        <p style={{ margin:"4px 0 0", fontSize:13, color:"var(--muted)" }}>{sec==="gym" ? `${unlocked} de ${ACHIEVEMENTS.length} desbloqueados · nivel ${level}` : `${ganados} de ${M.LOGROS.length} desbloqueados`}</p>
      </header>
      <FilaPestanas tabs={[{ id:"gym", label:"Gimnasio" }, { id:"mazmorra", label:"La mazmorra" }]} activa={sec} onCambia={setSec}/>
      {sec==="mazmorra" && <p style={{ fontSize:12, color:"var(--muted)", margin:"8px 4px 0", lineHeight:1.45 }}>Solo cuentan las partidas con llave, y no dan XP: eso se gana en el gimnasio.</p>}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:11, marginTop:12 }}>
        {sec==="gym" ? ACHIEVEMENTS.map(a=>{ const got=state.achievements?.[a.id]; const I=a.icon;
          return (<div key={a.id} className="fh-card" style={{ padding:15, textAlign:"center", borderColor:got?"var(--gold)":"var(--line)", opacity:got?1:.6, background:got?"linear-gradient(160deg,var(--card),var(--card2))":"var(--card)" }}>
            <div style={{ width:46, height:46, borderRadius:13, margin:"0 auto 10px", display:"flex", alignItems:"center", justifyContent:"center", background:got?"var(--gold)":"var(--bg2)" }}>
              {got? <I size={22} color="#0F131A"/> : <Lock size={18} color="var(--faint)"/>}
            </div>
            <div className="disp" style={{ fontWeight:700, fontSize:13.5 }}>{a.title}</div>
            <div style={{ fontSize:11, color:"var(--muted)", marginTop:4, lineHeight:1.4, minHeight:30 }}>{a.desc}</div>
            <div className="fh-chip" style={{ marginTop:8, display:"inline-block", background:got?"rgba(232,176,75,.15)":"var(--bg2)", color:got?"var(--gold)":"var(--faint)" }}>+{a.xp} XP</div>
            {got && <div style={{ fontSize:10, color:"var(--faint)", marginTop:6 }}>{got}</div>}
          </div>); })
        : M.LOGROS.map(l=>{ const got=mz?.logros?.[l.id];
          return (<div key={l.id} className="fh-card" style={{ padding:15, textAlign:"center", borderColor:got?"var(--gold)":"var(--line)", opacity:got?1:.6, background:got?"linear-gradient(160deg,var(--card),var(--card2))":"var(--card)" }}>
            <div style={{ width:46, height:46, margin:"0 auto 10px", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--bg2)", border:got?"2px solid var(--gold)":"none" }}>
              {got ? <Sprite id={l.sprite} size={32}/> : <Lock size={18} color="var(--faint)"/>}
            </div>
            <div className="disp" style={{ fontWeight:700, fontSize:13.5 }}>{l.titulo}</div>
            <div style={{ fontSize:11, color:"var(--muted)", marginTop:4, lineHeight:1.4, minHeight:30 }}>{l.texto}</div>
            {got && <div style={{ fontSize:10, color:"var(--faint)", marginTop:6 }}>{got}</div>}
          </div>); })}
      </div>
    </div>
  );
}

/* =========================================================================
   DIETA: menú del día + planificador semanal + lista de la compra
   ========================================================================= */

function mealsByCat(cat){ return MEALS.filter(m=>m.cat===cat); }
function allowedMeals(cat, excludes){
  const ex=new Set(excludes||[]);
  const list=MEALS.filter(m=>m.cat===cat && !m.ing.some(i=>ex.has(i[0])));
  return list.length ? list : mealsByCat(cat); // si excluyes demasiado, no rompas: usa todas
}

/* Clasificación de alimentos para orientar el plan por nivel de entreno y fase del ciclo. */
const IRON_FOODS = new Set(["Lentejas","Garbanzos","Espinacas","Ternera magra","Jamón serrano","Gambas","Pavo","Pavo picado","Edamame"]);
const CARB_FOODS = new Set(["Arroz","Arroz basmati","Arroz integral","Pasta integral","Patata","Avena","Pan integral","Quinoa","Boniato","Tortitas de arroz","Granola","Plátano"]);
const COMPLEX_CARB_FOODS = new Set(["Avena","Patata","Quinoa","Boniato","Lentejas","Garbanzos","Arroz integral"]);
const PROTEIN_FOODS = new Set(["Pechuga de pollo","Salmón","Atún","Huevos","Pavo","Pavo picado","Ternera magra","Merluza","Bacalao","Dorada","Gambas","Lentejas","Garbanzos","Yogur griego","Requesón","Proteína en polvo","Jamón serrano","Edamame"]);
function mealFocus(meal){
  const items=meal.ing.map(i=>i[0]); const has=s=>items.some(x=>s.has(x)); const f=[];
  if(has(IRON_FOODS)) f.push("hierro");
  if(has(CARB_FOODS)) f.push("carbos");
  if(has(COMPLEX_CARB_FOODS)) f.push("saciante");
  if(has(PROTEIN_FOODS)) f.push("proteico");
  return f;
}
/* Focos preferidos según la fase del ciclo (para dar peso a ciertos platos). */
function phaseFocus(phaseKey){
  switch(phaseKey){
    case "menstruacion": return ["hierro","proteico"];  // reponer hierro
    case "folicular":    return ["carbos","proteico"];  // tolera bien carbos, fase de construcción
    case "ovulatoria":   return ["proteico"];           // ligero y proteico
    case "lutea":        return ["saciante","proteico"]; // carbos complejos que sacian
    default:             return [];
  }
}
function pickMealWeighted(cat, excludes, pref){
  const list=allowedMeals(cat, excludes);
  if(!pref.length) return pick(list);
  const scored=list.map(m=>{ const f=mealFocus(m); let w=1; pref.forEach(pf=>{ if(f.includes(pf)) w+=2; }); return { m, w }; });
  const total=scored.reduce((a,s)=>a+s.w,0); let r=Math.random()*total;
  for(const s of scored){ r-=s.w; if(r<=0) return s.m; }
  return scored[scored.length-1].m;
}
function makeWeekPlan(excludes, opts){
  const exp=opts?.experience||"principiante";
  const phaseKey=opts?.phaseKey||null;
  let pref=phaseFocus(phaseKey);
  if(exp==="intermedio"||exp==="experto") pref=[...pref,"proteico"]; // más énfasis en proteína a más nivel
  return { weekStart:mondayOf(todayISO()), meta:{ experience:exp, phaseKey }, days:Array.from({length:7},()=>({
    Desayuno:pickMealWeighted("Desayuno",excludes,pref).name, Comida:pickMealWeighted("Comida",excludes,pref).name,
    Cena:pickMealWeighted("Cena",excludes,pref).name, Snack:pickMealWeighted("Snack",excludes,pref).name,
  })) };
}
/* Nota orientativa del plan según nivel de entreno y fase (sin cifras). */
function weekPlanNote(experience, phaseKey){
  const byExp={
    principiante:"Come equilibrado: proteína, verdura y un hidrato en cada comida principal.",
    intermedio:"Prioriza proteína en cada comida y añade algo más de hidrato los días de entreno fuerte.",
    experto:"Proteína alta en cada comida y carbohidrato alrededor del entreno para rendir y recuperar.",
  };
  const byPhase={
    menstruacion:"Fase de regla: hemos dado prioridad a platos ricos en hierro.",
    folicular:"Fase folicular: toleras bien los carbohidratos, ideal para rendir.",
    ovulatoria:"Ovulación: platos ligeros y proteicos.",
    lutea:"Fase lútea: carbohidratos complejos que sacian y ayudan con los antojos.",
  };
  return { exp: byExp[experience]||byExp.principiante, phase: phaseKey? byPhase[phaseKey] : null };
}
/* Todos los ingredientes agrupados por sección (para el selector de exclusiones) */
const INGREDIENTS_BY_GROUP = (()=>{ const m={}; MEALS.forEach(meal=>meal.ing.forEach(([item,group])=>{ (m[group]=m[group]||new Set()).add(item); })); const out={}; Object.entries(m).forEach(([g,s])=>out[g]=[...s].sort((a,b)=>a.localeCompare(b))); return out; })();
/* -------------------------------------------------------------------------
   CANTIDADES ORIENTATIVAS PARA LA COMPRA
   Ración de referencia por comida de cada ingrediente + unidad de compra.
   La cantidad final = ración × veces que aparece en el plan × ajuste del perfil.
   Son cantidades para COMPRAR (kilos, docenas, unidades), no un conteo de
   calorías ni de macros.
   ------------------------------------------------------------------------- */
const PORTION = {
  /* Proteína — peso en crudo */
  "Pechuga de pollo":[160,"g"], "Pavo":[150,"g"], "Pavo picado":[150,"g"], "Ternera magra":[150,"g"],
  "Jamón serrano":[40,"g"], "Salmón":[150,"g"], "Merluza":[160,"g"], "Bacalao":[160,"g"],
  "Dorada":[250,"g"], "Atún":[80,"g"], "Gambas":[120,"g"], "Lentejas":[90,"g"],
  "Garbanzos":[90,"g"], "Edamame":[100,"g"],
  /* Verduras y fruta — por unidades cuando se compran por piezas */
  "Aguacate":[0.5,"ud"], "Calabacín":[1,"ud"], "Cebolla":[1,"ud"], "Pimiento":[1,"ud"],
  "Tomate":[1,"ud"], "Zanahoria":[1,"ud"], "Plátano":[1,"ud"], "Lechuga":[0.5,"ud"],
  "Fruta de temporada":[2,"ud"],
  "Arándanos":[80,"g"], "Brócoli":[200,"g"], "Champiñones":[150,"g"], "Ensalada":[80,"g"],
  "Espinacas":[150,"g"], "Espárragos":[150,"g"], "Guisantes":[120,"g"], "Setas":[150,"g"],
  "Tomate natural":[200,"g"], "Verduras para sopa":[250,"g"], "Verduras para wok":[200,"g"],
  "Verduras variadas":[200,"g"],
  /* Hidratos — peso en seco (arroz, pasta, avena, quinoa) */
  "Arroz":[80,"g"], "Arroz basmati":[80,"g"], "Arroz integral":[80,"g"], "Avena":[60,"g"],
  "Pasta integral":[90,"g"], "Quinoa":[70,"g"], "Pan integral":[80,"g"], "Granola":[50,"g"],
  "Patata":[250,"g"], "Boniato":[250,"g"], "Tortitas de arroz":[3,"ud"],
  /* Lácteos y huevos */
  "Huevos":[2,"ud"], "Leche":[250,"ml"], "Queso":[40,"g"], "Requesón":[100,"g"], "Yogur griego":[1,"ud"],
  /* Despensa */
  "Aceite de oliva":[15,"ml"], "Leche de coco":[100,"ml"], "Almendras":[25,"g"], "Nueces":[25,"g"],
  "Frutos secos":[30,"g"], "Semillas":[10,"g"], "Sésamo":[8,"g"], "Cacao":[10,"g"], "Canela":[2,"g"],
  "Curry":[5,"g"], "Chocolate negro":[20,"g"], "Crema de cacahuete":[20,"g"], "Hummus":[50,"g"],
  "Miel":[15,"g"], "Proteína en polvo":[30,"g"],
};

/* Cuánto escala cada grupo con el perfil: proteína e hidratos sí (van con el
   tamaño de la persona), la verdura poco y la despensa (especias, aceite) casi nada. */
const GROUP_SENS = { [G.P]:1, [G.H]:1, [G.L]:0.7, [G.V]:0.35, [G.D]:0.25 };

/* Ajuste de las raciones al perfil: peso corporal, edad y sexo.
   Acotado a ±40% — es una guía de compra, no una pauta nutricional. */
function intakeFactor(profile){
  const sex = profile?.sex;
  const ref = sex==="mujer" ? 62 : 78;                 // peso corporal de referencia (kg)
  const w = Number(profile?.weightKg) || ref;
  const age = Number(profile?.age) || 30;
  let f = w / ref;
  if (sex === "mujer") f *= 0.88;                      // requerimiento energético medio menor
  if (age >= 60) f *= 0.90; else if (age >= 45) f *= 0.95; else if (age <= 22) f *= 1.05;
  return Math.max(0.7, Math.min(1.4, f));
}

const nf = (x, d=0) => x.toLocaleString("es-ES", { minimumFractionDigits:d, maximumFractionDigits:d });

/* Cantidad a comprar de un ingrediente, ya redondeada a algo que se pueda meter en el carro. */
function buyAmount(item, group, n, factor){
  const p = PORTION[item]; if(!p) return null;
  const [per, unit] = p;
  const sens = GROUP_SENS[group] ?? 0.5;
  const qty = per * n * (1 + (factor - 1) * sens);

  if (item === "Huevos"){                              // se venden por media docena
    const ud = Math.max(6, Math.ceil(qty/6)*6);
    const doc = ud/12;
    return { main:`${ud} ud`, sub: ud===6 ? "media docena" : `${nf(doc, Number.isInteger(doc)?0:1)} docena${doc>1?"s":""}` };
  }
  if (unit === "ud")  return { main:`${Math.max(1, Math.round(qty))} ud`, sub:null };
  if (unit === "ml")  return { main: qty>=1000 ? `${nf(qty/1000,1)} L` : `${Math.max(10, Math.round(qty/10)*10)} ml`, sub:null };
  if (qty >= 1000)    return { main:`${nf(qty/1000, qty%1000<50 ? 0 : 1)} kg`, sub:null };
  if (qty < 50)       return { main:`${Math.max(5, Math.round(qty/5)*5)} g`, sub:null };
  return { main:`${Math.round(qty/10)*10} g`, sub:null };
}

function shoppingList(plan){
  const map={}; const byName=Object.fromEntries(MEALS.map(m=>[m.name,m]));
  plan.days.forEach(day=>MEAL_CATS.forEach(c=>{ const meal=byName[day[c]]; if(!meal) return;
    meal.ing.forEach(([item,group])=>{ const k=item+"|"+group; map[k]=(map[k]||0)+1; }); }));
  const groups={}; Object.entries(map).forEach(([k,n])=>{ const [item,group]=k.split("|"); (groups[group]=groups[group]||[]).push({ item, n }); });
  Object.values(groups).forEach(arr=>arr.sort((a,b)=>b.n-a.n));
  return groups;
}

/* =========================================================================
   MI DIETA (la que te ha pautado un profesional)
   Texto libre: la app no calcula nada sobre ella, solo la guarda y la enseña
   ordenada por día y comida. Así puedes seguir tu pauta real sin salir de RPGym.
   ========================================================================= */

function CustomDietEditor({ diet, onSave, onClose }){
  const [d, setD] = useState(()=>normalizeCustomDiet(diet));
  const [dayIdx, setDayIdx] = useState(()=>{ const w = new Date().getDay(); return w===0 ? 6 : w-1; });
  const [msg, setMsg] = useState(null);
  const [tab, setTab] = useState("dias");   // dias | ficha

  const setField = fields => { setMsg(null); setD(x=>({ ...x, ...fields })); };
  const setMeal = (slot, val) => { setMsg(null); setD(x=>({ ...x, days:x.days.map((day,i)=> i===dayIdx ? { ...day, [slot]:val } : day) })); };
  const copyToAll = () => {
    setD(x=>({ ...x, days:x.days.map(()=>({ ...x.days[dayIdx] })) }));
    setMsg(`Copiado: los 7 días son ahora iguales que el ${DAY_NAMES_ES[dayIdx].toLowerCase()}.`);
  };
  const clearDay = () => { setMsg(null); setD(x=>({ ...x, days:x.days.map((day,i)=> i===dayIdx ? emptyCustomDay() : day) })); };
  const filledDays = d.days.filter(day=>CUSTOM_MEAL_SLOTS.some(c=>(day[c]||"").trim())).length;

  const label = { padding:"0 2px 6px", fontSize:12, color:"var(--muted)", fontWeight:600 };
  const sectionTitle = { fontSize:12, fontWeight:700, letterSpacing:".08em", color:"var(--faint)", margin:"18px 4px 8px" };

  return (
    <div className="fh-in">
      <header style={{ padding:"22px 2px 8px", display:"flex", alignItems:"center", gap:10 }}>
        <button onClick={onClose} aria-label="Volver" style={{ background:"var(--card)", border:"1px solid var(--line)", borderRadius:10, width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"var(--muted)", flexShrink:0 }}><ChevronLeft size={18}/></button>
        <div style={{ flex:1, minWidth:0 }}>
          <h1 style={{ margin:0, fontSize:21 }}>Mi dieta</h1>
          <p style={{ margin:"3px 0 0", fontSize:12.5, color:"var(--muted)" }}>{filledDays} de 7 días rellenados</p>
        </div>
        <button className="fh-btn" onClick={()=>{ onSave({ ...d, enabled:true }); onClose(); }}
          style={{ background:"var(--jade)", padding:"10px 15px", fontSize:13, display:"flex", alignItems:"center", gap:6, flexShrink:0 }}><Check size={15}/> Guardar</button>
      </header>

      <div className="fh-card" style={{ padding:13, marginTop:8, display:"flex", gap:10, alignItems:"flex-start" }}>
        <Info size={16} color="var(--jade)" style={{ flexShrink:0, marginTop:1 }}/>
        <div style={{ fontSize:12, color:"var(--muted)", lineHeight:1.5 }}>
          Copia aquí la pauta que te hayan dado. Escribe cada comida como quieras: la app no la interpreta ni le pone cifras, solo te la muestra ordenada por días.
        </div>
      </div>

      <div style={{ display:"flex", gap:6, margin:"14px 0" }}>
        {[["dias","Comidas"],["ficha","Datos de la pauta"]].map(([id,lab])=>(
          <button key={id} className="fh-btn" onClick={()=>setTab(id)}
            style={{ flex:1, padding:"9px", fontSize:13, background:tab===id?"var(--jade)":"var(--card)", color:tab===id?"#0F131A":"var(--muted)", border:tab===id?"none":"1px solid var(--line)" }}>{lab}</button>
        ))}
      </div>

      {tab==="ficha" && (<div className="fh-in">
        <div className="fh-card" style={{ padding:16 }}>
          <div style={label}>Nombre de la dieta <span style={{ color:"var(--faint)", fontWeight:400 }}>(opcional)</span></div>
          <input value={d.name} maxLength={60} onChange={e=>setField({ name:e.target.value })} placeholder="Pauta de definición"
            style={{ textAlign:"left", fontFamily:"'Jersey 15',monospace" }}/>
          <div style={{ ...label, marginTop:12 }}>¿Quién te la ha pautado? <span style={{ color:"var(--faint)", fontWeight:400 }}>(opcional)</span></div>
          <input value={d.author} maxLength={60} onChange={e=>setField({ author:e.target.value })} placeholder="Mi dietista-nutricionista"
            style={{ textAlign:"left", fontFamily:"'Jersey 15',monospace" }}/>
          <div style={{ ...label, marginTop:12 }}>Indicaciones generales <span style={{ color:"var(--faint)", fontWeight:400 }}>(opcional)</span></div>
          <textarea value={d.note} maxLength={600} onChange={e=>setField({ note:e.target.value })}
            placeholder="Beber 2 L de agua al día, cocinar a la plancha, verdura libre en comida y cena…"/>
        </div>

        <div style={sectionTitle}>MI LISTA DE LA COMPRA</div>
        <div className="fh-card" style={{ padding:16 }}>
          <p style={{ fontSize:12, color:"var(--muted)", margin:"0 0 11px", lineHeight:1.5 }}>
            Si tu pauta trae su propia lista, escríbela aquí y aparecerá en la pestaña <b style={{ color:"var(--txt)" }}>Compra</b> en lugar de la que calcula la app.
          </p>
          <textarea value={d.shopping} maxLength={2000} onChange={e=>setField({ shopping:e.target.value })} style={{ minHeight:150 }}
            placeholder={"Pechuga de pollo · 1,5 kg\nHuevos · 1 docena\nAvena · 1 kg\nVerdura congelada · 2 bolsas"}/>
        </div>
      </div>)}

      {tab==="dias" && (<div className="fh-in">
        <div style={{ display:"flex", gap:6, overflowX:"auto", marginBottom:12, paddingBottom:2 }}>
          {DAY_SHORT_ES.map((dn,i)=>{
            const filled = CUSTOM_MEAL_SLOTS.some(c=>(d.days[i][c]||"").trim());
            const on = dayIdx===i;
            return (
              <button key={i} className="fh-btn" onClick={()=>{ setDayIdx(i); setMsg(null); }}
                style={{ minWidth:50, padding:"8px 0", fontSize:12, position:"relative", background:on?"var(--jade)":"var(--card)", color:on?"#0F131A":"var(--muted)", border:on?"none":"1px solid var(--line)" }}>
                {dn}
                {filled && !on && <span style={{ position:"absolute", bottom:4, left:"50%", transform:"translateX(-50%)", width:4, height:4, borderRadius:"50%", background:"var(--jade)" }}/>}
              </button>
            );
          })}
        </div>

        {msg && <div className="fh-card" style={{ padding:12, marginBottom:11, borderColor:"var(--jade)", fontSize:12.5, color:"var(--muted)", lineHeight:1.45 }}>{msg}</div>}

        {CUSTOM_MEAL_SLOTS.map(slot=>(
          <div key={slot} className="fh-card" style={{ padding:14, marginBottom:10 }}>
            <div className="fh-chip" style={{ background:"var(--bg2)", color:"var(--jade)", display:"inline-block", marginBottom:9 }}>{slot.toUpperCase()}</div>
            <textarea value={d.days[dayIdx][slot]} maxLength={600} onChange={e=>setMeal(slot, e.target.value)}
              aria-label={`${slot} del ${DAY_NAMES_ES[dayIdx]}`}
              placeholder={slot==="Desayuno" ? "Ej.: 80 g de avena con leche y un plátano" : "Déjalo vacío si ese día no toca"}/>
          </div>
        ))}

        <div style={{ display:"flex", gap:8, marginTop:12 }}>
          <button className="fh-btn" onClick={copyToAll} style={{ flex:1.5, background:"var(--card2)", color:"var(--txt)", border:"1px solid var(--line2)", padding:12, fontSize:12.5, display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}>
            <Copy size={14} color="var(--jade)"/> Copiar a los 7 días
          </button>
          <button className="fh-btn" onClick={clearDay} style={{ flex:1, background:"var(--card2)", color:"var(--muted)", border:"1px solid var(--line2)", padding:12, fontSize:12.5 }}>Vaciar día</button>
        </div>
        <p style={{ fontSize:11.5, color:"var(--faint)", margin:"11px 4px 0", lineHeight:1.5 }}>
          Si tu pauta es igual todos los días, rellena uno y pulsa «Copiar a los 7 días».
        </p>
      </div>)}

      <div style={{ display:"flex", gap:9, marginTop:16 }}>
        <button className="fh-btn" onClick={onClose} style={{ flex:1, background:"var(--card2)", color:"var(--muted)", border:"1px solid var(--line2)", padding:13, fontSize:13 }}>Descartar</button>
        <button className="fh-btn" onClick={()=>{ onSave({ ...d, enabled:true }); onClose(); }} style={{ flex:1.4, background:"var(--jade)", padding:13, fontSize:13.5, display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}><Check size={16}/> Guardar mi dieta</button>
      </div>
      <p style={{ fontSize:11.5, color:"var(--faint)", textAlign:"center", marginTop:12, lineHeight:1.55 }}>
        Tu dieta se guarda solo en este móvil y entra en la copia de seguridad de Ajustes.
      </p>
    </div>
  );
}

function DietView({ state, mealPlan, saveMealPlan, excludes, setExcludes, setTab, customDiet, saveCustomDiet }){
  const [view, setView] = useState("semana"); // semana | compra
  const [showEx, setShowEx] = useState(false);
  const [dietTip, setDietTip] = useState(()=>Math.floor(Math.random()*FEMALE_DIET_TIPS.length));
  const [dietTipClosed, cerrarDietTip] = useAvisoCerrado("dieta-femenina");
  const [dayIdx, setDayIdx] = useState(new Date().getDay()===0?6:new Date().getDay()-1);
  const [editingDiet, setEditingDiet] = useState(false);
  const mine = customDiet || blankCustomDiet();
  const mineHasContent = customDietHasContent(mine);
  const useMine = !!mine.enabled && mineHasContent;   // "Mi dieta" solo manda si tiene contenido
  // Consejos de dieta: por fase del ciclo si está activo; si no, generales para perfil femenino.
  const cycPh = cyclePhaseFor(state.cycle, todayISO());
  const dietPool = cycPh ? cycPh.diet : FEMALE_DIET_TIPS;
  const planOpts = { experience: state.profile?.experience, phaseKey: cycPh?.key };
  const genPlan = () => saveMealPlan(makeWeekPlan(excludes, planOpts));
  const plan = mealPlan;
  const cats=shoppingList(plan||makeWeekPlan(excludes, planOpts));
  const buyFactor=intakeFactor(state.profile);   // ajusta las cantidades a peso, edad y sexo
  const note=weekPlanNote(state.profile?.experience, cycPh?.key);
  const catColor={ Desayuno:"var(--amber)", Comida:"var(--jade)", Cena:"var(--violet)", Snack:"var(--gold)" };
  const dayNames=["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];
  const byName=Object.fromEntries(MEALS.map(m=>[m.name,m]));
  const exSet=new Set(excludes);
  const toggleEx=(item)=>{ const next=exSet.has(item)?excludes.filter(x=>x!==item):[...excludes,item]; setExcludes(next); };

  if(editingDiet) return <CustomDietEditor diet={mine} onSave={saveCustomDiet} onClose={()=>setEditingDiet(false)}/>;

  return (
    <div className="fh-in">
      <header style={{ padding:"22px 2px 12px", display:"flex", alignItems:"center", gap:10 }}>
        <button onClick={()=>setTab("home")} aria-label="Volver a Inicio"
          style={{ background:"var(--card)", border:"1px solid var(--line)", borderRadius:10, width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"var(--muted)", flexShrink:0 }}><ChevronLeft size={18}/></button>
        <div style={{ minWidth:0 }}>
          <h1 style={{ margin:0, fontSize:22 }}>Dieta</h1>
          <p style={{ margin:"4px 0 0", fontSize:13, color:"var(--muted)" }}>Plan semanal a tu medida y lista para la compra.</p>
        </div>
      </header>

      {state.profile?.sex === "mujer" && !dietTipClosed && (
        <div className="fh-card" style={{ padding:14, marginBottom:12, borderColor:cycPh?cycPh.color:"#E56B9F", display:"flex", gap:11, alignItems:"flex-start" }}>
          <Heart size={17} color={cycPh?cycPh.color:"#E56B9F"} style={{ flexShrink:0, marginTop:1 }}/>
          <div style={{ flex:1, minWidth:0 }}>
            {cycPh && <div style={{ fontSize:10.5, fontWeight:700, letterSpacing:".06em", color:cycPh.color, marginBottom:4 }}>DIETA · {cycPh.label.toUpperCase()}</div>}
            <div style={{ fontSize:12.5, color:"var(--muted)", lineHeight:1.5 }}>{dietPool[dietTip % dietPool.length]}</div>
            <button onClick={()=>setDietTip(i=>(i+1)%dietPool.length)} style={{ background:"none", border:"none", padding:0, marginTop:8, color:cycPh?cycPh.color:"#E56B9F", cursor:"pointer", fontSize:11, fontWeight:600, display:"flex", alignItems:"center", gap:5 }}><Shuffle size={12}/> Otro consejo</button>
          </div>
          <button onClick={cerrarDietTip} aria-label="Cerrar" style={{ background:"none", border:"none", padding:2, cursor:"pointer", color:"var(--faint)", flexShrink:0 }}><X size={16}/></button>
        </div>
      )}

      {/* --- ¿Plan de la app o tu propia pauta? --- */}
      <div className="fh-card" style={{ padding:14, marginBottom:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:11 }}>
          <FileText size={15} color="var(--jade)"/>
          <span className="disp" style={{ fontWeight:600, fontSize:13.5 }}>¿Qué dieta sigues?</span>
        </div>
        <div style={{ display:"flex", gap:7 }}>
          <button className="fh-btn" onClick={()=>saveCustomDiet({ ...mine, enabled:false })}
            style={{ flex:1, padding:"11px 8px", fontSize:12.5, background:!useMine?"var(--jade)":"var(--card2)", color:!useMine?"#0F131A":"var(--muted)", border:!useMine?"none":"1px solid var(--line2)" }}>La de la app</button>
          <button className="fh-btn" onClick={()=>{ if(mineHasContent) saveCustomDiet({ ...mine, enabled:true }); else setEditingDiet(true); }}
            style={{ flex:1, padding:"11px 8px", fontSize:12.5, background:useMine?"var(--jade)":"var(--card2)", color:useMine?"#0F131A":"var(--muted)", border:useMine?"none":"1px solid var(--line2)" }}>La mía</button>
        </div>
        <div style={{ fontSize:11.5, color:"var(--faint)", marginTop:10, lineHeight:1.45 }}>
          {useMine
            ? <>Sigues <b style={{ color:"var(--muted)" }}>{mine.name || "tu pauta"}</b>{mine.author ? <> de {mine.author}</> : null}. La app la muestra tal cual, sin tocarla.</>
            : <>¿Te ha pautado la dieta un dietista-nutricionista? Guárdala en la app y la tendrás siempre a mano.</>}
        </div>
        <button className="fh-btn" onClick={()=>setEditingDiet(true)}
          style={{ width:"100%", marginTop:11, background:"var(--card2)", color:"var(--txt)", border:"1px solid var(--line2)", padding:10, fontSize:12.5, display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}>
          {mineHasContent ? <><Pencil size={14} color="var(--jade)"/> Editar mi dieta</> : <><Plus size={15} color="var(--jade)"/> Añadir mi dieta pautada</>}
        </button>
      </div>

      {!useMine && (<>
      <button className="fh-btn" onClick={()=>setShowEx(v=>!v)} style={{ width:"100%", background:"var(--card)", color:"var(--txt)", border:"1px solid var(--line2)", padding:"11px 14px", marginBottom:12, display:"flex", alignItems:"center", justifyContent:"space-between", fontSize:13 }}>
        <span style={{ display:"flex", alignItems:"center", gap:8 }}><Ban size={15} color="var(--ember)"/> Excluir alimentos {excludes.length>0 && <span className="fh-chip" style={{ background:"var(--ember)", color:"#fff" }}>{excludes.length}</span>}</span>
        <span style={{ color:"var(--faint)", fontSize:12 }}>{showEx?"cerrar":"abrir"}</span>
      </button>
      {showEx && (
        <div className="fh-card fh-in" style={{ padding:16, marginBottom:12 }}>
          <p style={{ fontSize:12, color:"var(--muted)", margin:"0 0 12px", lineHeight:1.45 }}>Marca lo que no te guste o no puedas tomar (intolerancias, alergias…). Los menús y la lista de la compra evitarán esos alimentos.</p>
          {GROUP_ORDER.map(g=>{ const items=INGREDIENTS_BY_GROUP[g]; if(!items) return null;
            return (<div key={g} style={{ marginBottom:12 }}>
              <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:8 }}>
                <span style={{ width:8, height:8, borderRadius:99, background:GROUP_COLOR[g] }}/>
                <span className="disp" style={{ fontSize:12.5, fontWeight:600, color:"var(--muted)" }}>{g}</span>
              </div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
                {items.map(item=>{ const on=exSet.has(item);
                  return (<button key={item} onClick={()=>toggleEx(item)} style={{ fontSize:12, padding:"6px 11px", borderRadius:999, cursor:"pointer", fontFamily:"'Inter',sans-serif",
                    background:on?"var(--ember)":"var(--bg2)", color:on?"#fff":"var(--muted)", border:`1px solid ${on?"var(--ember)":"var(--line)"}`, textDecoration:on?"line-through":"none" }}>{item}</button>);
                })}
              </div>
            </div>); })}
          {excludes.length>0 && <button className="fh-btn" onClick={()=>setExcludes([])} style={{ marginTop:4, background:"var(--card2)", color:"var(--muted)", padding:"9px 14px", fontSize:12, border:"1px solid var(--line2)" }}>Quitar todas las exclusiones</button>}
        </div>
      )}

      </>)}

      {/* Tabs internos */}
      <div style={{ display:"flex", gap:6, marginBottom:14 }}>
        {[["semana", useMine ? "Mi dieta" : "Plan semanal"],["compra","Compra"]].map(([id,lab])=>(
          <button key={id} className="fh-btn" onClick={()=>setView(id)}
            style={{ flex:1, padding:"9px", fontSize:13, background:view===id?"var(--gold)":"var(--card)", color:view===id?"#0F131A":"var(--muted)", border:view===id?"none":"1px solid var(--line)" }}>{lab}</button>
        ))}
      </div>


      {/* SEMANA · plan generado por la app */}
      {view==="semana" && !useMine && (<div className="fh-in">
        {/* Nota orientativa según nivel de entreno y fase del ciclo */}
        <div className="fh-card" style={{ padding:13, marginBottom:12, display:"flex", gap:10, alignItems:"flex-start", borderColor:cycPh?cycPh.color:"var(--line)" }}>
          <Info size={16} color={cycPh?cycPh.color:"var(--gold)"} style={{ flexShrink:0, marginTop:1 }}/>
          <div style={{ fontSize:12, color:"var(--muted)", lineHeight:1.5 }}>
            {note.exp}{note.phase && <> <b style={{ color:cycPh?cycPh.color:"var(--txt)" }}>{note.phase}</b></>}
          </div>
        </div>
        <button className="fh-btn" onClick={genPlan} style={{ width:"100%", background:"var(--jade)", padding:12, marginBottom:12, display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}>
          <CalendarDays size={16}/> {plan?"Regenerar plan semanal":"Generar plan semanal"}
        </button>
        {!plan ? <Empty text="Genera un plan de 7 días adaptado a tu nivel y momento"/> : (<>
          <div style={{ display:"flex", gap:6, overflowX:"auto", marginBottom:12, paddingBottom:2 }}>
            {dayNames.map((d,i)=>(
              <button key={i} className="fh-btn" onClick={()=>setDayIdx(i)} style={{ minWidth:46, padding:"8px 0", fontSize:12, background:dayIdx===i?"var(--gold)":"var(--card)", color:dayIdx===i?"#0F131A":"var(--muted)", border:dayIdx===i?"none":"1px solid var(--line)" }}>{d}</button>
            ))}
          </div>
          {MEAL_CATS.map(cat=>{ const meal=byName[plan.days[dayIdx][cat]];
            return (<div key={cat} className="fh-card" style={{ padding:14, marginBottom:10 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span className="fh-chip" style={{ background:"var(--bg2)", color:catColor[cat] }}>{cat.toUpperCase()}</span>
                {meal?.tag && <span style={{ fontSize:11, color:"var(--faint)" }}>{meal.tag}</span>}
              </div>
              <div className="disp" style={{ fontWeight:600, fontSize:15, marginTop:7 }}>{meal?.name}</div>
              <div style={{ fontSize:11, color:"var(--muted)", marginTop:4 }}>{meal?.ing.map(i=>i[0]).join(" · ")}</div>
            </div>); })}
        </>)}
      </div>)}

      {/* SEMANA · tu dieta pautada (texto libre, tal cual la escribiste) */}
      {view==="semana" && useMine && (<div className="fh-in">
        {(mine.name || mine.author) && (
          <div className="fh-card" style={{ padding:14, marginBottom:11, borderColor:"var(--jade)" }}>
            <div className="disp" style={{ fontWeight:700, fontSize:15 }}>{mine.name || "Mi dieta"}</div>
            {mine.author && <div style={{ fontSize:12, color:"var(--muted)", marginTop:3 }}>Pautada por {mine.author}</div>}
          </div>
        )}
        {mine.note && (
          <div className="fh-card" style={{ padding:13, marginBottom:11, display:"flex", gap:10, alignItems:"flex-start" }}>
            <Info size={16} color="var(--jade)" style={{ flexShrink:0, marginTop:1 }}/>
            <div style={{ fontSize:12.5, color:"var(--muted)", lineHeight:1.55, whiteSpace:"pre-wrap" }}>{mine.note}</div>
          </div>
        )}

        <div style={{ display:"flex", gap:6, overflowX:"auto", marginBottom:12, paddingBottom:2 }}>
          {DAY_SHORT_ES.map((dn,i)=>{
            const on = dayIdx===i;
            const filled = CUSTOM_MEAL_SLOTS.some(c=>(mine.days[i][c]||"").trim());
            return (
              <button key={i} className="fh-btn" onClick={()=>setDayIdx(i)}
                style={{ minWidth:50, padding:"8px 0", fontSize:12, position:"relative", background:on?"var(--jade)":"var(--card)", color:on?"#0F131A":"var(--muted)", border:on?"none":"1px solid var(--line)" }}>
                {dn}
                {filled && !on && <span style={{ position:"absolute", bottom:4, left:"50%", transform:"translateX(-50%)", width:4, height:4, borderRadius:"50%", background:"var(--jade)" }}/>}
              </button>
            );
          })}
        </div>

        {(()=>{
          const day = mine.days[dayIdx] || emptyCustomDay();
          const slots = CUSTOM_MEAL_SLOTS.filter(c=>(day[c]||"").trim());
          if(!slots.length) return (<>
            <Empty text={`No has escrito nada para el ${DAY_NAMES_ES[dayIdx].toLowerCase()}`}/>
            <button className="fh-btn" onClick={()=>setEditingDiet(true)} style={{ width:"100%", background:"var(--card2)", color:"var(--jade)", border:"1px solid var(--line2)", padding:11, fontSize:13, display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}><Plus size={15}/> Rellenar este día</button>
          </>);
          return slots.map(slot=>(
            <div key={slot} className="fh-card" style={{ padding:14, marginBottom:10 }}>
              <span className="fh-chip" style={{ background:"var(--bg2)", color:"var(--jade)" }}>{slot.toUpperCase()}</span>
              <div style={{ fontSize:13.5, color:"var(--txt)", marginTop:9, lineHeight:1.55, whiteSpace:"pre-wrap" }}>{day[slot]}</div>
            </div>
          ));
        })()}

        <button className="fh-btn" onClick={()=>setEditingDiet(true)} style={{ width:"100%", marginTop:4, background:"var(--card)", color:"var(--txt)", border:"1px dashed var(--line2)", padding:12, fontSize:12.5, display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}><Pencil size={14} color="var(--jade)"/> Editar mi dieta</button>
      </div>)}

      {/* COMPRA · la tuya si la has escrito; si no, la que calcula la app */}
      {view==="compra" && useMine && mine.shopping.trim() && (<div className="fh-in">
        <div style={{ display:"flex", alignItems:"center", gap:8, margin:"0 2px 12px" }}><ShoppingCart size={17} color="var(--jade)"/><span className="disp" style={{ fontWeight:700, fontSize:16 }}>Mi lista de la compra</span></div>
        <div className="fh-card" style={{ padding:16 }}>
          <div style={{ fontSize:13.5, color:"var(--txt)", lineHeight:1.7, whiteSpace:"pre-wrap" }}>{mine.shopping}</div>
        </div>
        <button className="fh-btn" onClick={()=>setEditingDiet(true)} style={{ width:"100%", marginTop:11, background:"var(--card)", color:"var(--txt)", border:"1px dashed var(--line2)", padding:12, fontSize:12.5, display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}><Pencil size={14} color="var(--jade)"/> Editar mi lista</button>
      </div>)}

      {view==="compra" && !(useMine && mine.shopping.trim()) && (<div className="fh-in">
        {useMine && (
          <div className="fh-card" style={{ padding:13, marginBottom:12, display:"flex", gap:10, alignItems:"flex-start" }}>
            <Info size={16} color="var(--gold)" style={{ flexShrink:0, marginTop:1 }}/>
            <div style={{ fontSize:12, color:"var(--muted)", lineHeight:1.5 }}>
              Esta lista sale de las comidas de la app, no de tu pauta. Si tu dieta trae su propia lista, escríbela en <button onClick={()=>setEditingDiet(true)} style={{ background:"none", border:"none", padding:0, color:"var(--jade)", cursor:"pointer", font:"inherit" }}>Editar mi dieta</button> y aparecerá aquí.
            </div>
          </div>
        )}
        {!plan && <div className="fh-card" style={{ padding:14, marginBottom:12, fontSize:12.5, color:"var(--muted)" }}>Esta lista se genera desde el plan semanal. Genera uno en la pestaña <b style={{color:"var(--txt)"}}>Semana</b> para ajustarla a tus comidas exactas. Mientras, aquí tienes una lista de ejemplo.</div>}
        <div style={{ display:"flex", alignItems:"center", gap:8, margin:"0 2px 12px" }}><ShoppingCart size={17} color="var(--gold)"/><span className="disp" style={{ fontWeight:700, fontSize:16 }}>Lista de la compra</span></div>
        <div className="fh-card" style={{ padding:13, marginBottom:11, display:"flex", gap:10, alignItems:"flex-start" }}>
          <Scale size={16} color="var(--gold)" style={{ flexShrink:0, marginTop:1 }}/>
          <div style={{ fontSize:12, color:"var(--muted)", lineHeight:1.5 }}>
            Cantidades calculadas para <b style={{ color:"var(--txt)" }}>{state.profile?.weightKg||"—"} kg</b>
            {state.profile?.age ? <> y <b style={{ color:"var(--txt)" }}>{state.profile.age} años</b></> : null}.
            Cámbialo en <button onClick={()=>setTab("ajustes")} style={{ background:"none", border:"none", padding:0, color:"var(--gold)", cursor:"pointer", font:"inherit" }}>Ajustes</button> y la lista se recalcula sola.
          </div>
        </div>
        {GROUP_ORDER.map(g=>{ const items=cats[g]; if(!items||!items.length) return null;
          return (<div key={g} className="fh-card" style={{ padding:16, marginBottom:11 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
              <span style={{ width:9, height:9, borderRadius:99, background:GROUP_COLOR[g] }}/>
              <span className="disp" style={{ fontWeight:600, fontSize:14 }}>{g}</span>
            </div>
            {items.map((it,i)=>{ const q=buyAmount(it.item, g, it.n, buyFactor);
              return (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:10, padding:"7px 0", borderTop:i?"1px solid var(--line)":"none" }}>
                <div style={{ minWidth:0 }}>
                  <div style={{ fontSize:13.5 }}>{it.item}</div>
                  <div style={{ fontSize:10.5, color:"var(--faint)", marginTop:1 }}>
                    en {it.n} comida{it.n>1?"s":""}{q?.sub ? ` · ${q.sub}` : ""}
                  </div>
                </div>
                <span className="fh-chip mono" style={{ background:"var(--bg2)", color:q?"var(--gold)":"var(--muted)", whiteSpace:"nowrap", flexShrink:0 }}>{q ? q.main : `×${it.n}`}</span>
              </div>);
            })}
          </div>); })}
        <p style={{ fontSize:11, color:"var(--faint)", textAlign:"center", marginTop:6, lineHeight:1.5 }}>Cantidades aproximadas <b style={{ color:"var(--muted)" }}>para una persona</b> y los 7 días del plan. Carnes y pescados en crudo; arroz, pasta, avena y legumbres en seco. Ajusta a ojo según lo que ya tengas en casa.</p>
      </div>)}

      <p style={{ fontSize:11.5, color:"var(--faint)", textAlign:"center", marginTop:14, lineHeight:1.55 }}>
        {useMine
          ? "Esta es la pauta que has guardado tú: la app la muestra tal cual, sin cambiarla ni calcular nada sobre ella. Ante cualquier duda, quien te la pautó es quien debe resolverla."
          : "Son ideas generales de comidas variadas con prioridad a la proteína, no un plan nutricional personalizado ni cantidades exactas. Para ajustar déficit y raciones a tu caso, un dietista-nutricionista es la mejor opción."}
      </p>
    </div>
  );
}
