import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import * as cloud from "./cloud.js";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import {
  Flame, Trophy, Dumbbell, TrendingUp, Utensils, Home, Play, Check, SkipForward, Timer,
  Zap, Award, Crown, Shield, Star, ChevronLeft, Cookie, Shuffle, Target, Sparkles, Ruler,
  Lock, Lightbulb, ShoppingCart, CalendarDays, Compass, Moon, Sunrise, Gauge, ClipboardList,
  ScrollText, Swords, Footprints, Mountain, Heart, ShieldAlert, Info, Ban,
  Settings, Bell, CreditCard, User, Users, ChevronRight, Plus, X,
  Sun, Palette, Scale, Download, Upload,
  Trash2, Search, ArrowUp, ArrowDown, Pencil, Copy, FileText, Eye, Minus, Share2,
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
        { name:"Peso muerto rumano ligero", sets:2, reps:"12-15", rest:75, muscle:"Femoral" },
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
        { name:"Extensión de tríceps", sets:3, reps:"12-15", rest:45, muscle:"Tríceps" },
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
        { name:"Extensión de tríceps", sets:3, reps:"12-15", rest:45, muscle:"Tríceps" },
        { name:"Face pull", sets:3, reps:"15-20", rest:45, muscle:"Hombro" },
      ]},
      { name:"Pierna B", exercises:[
        { name:"Peso muerto", sets:4, reps:"5-6", rest:180, muscle:"Espalda" },
        { name:"Zancadas con barra", sets:3, reps:"10-12", rest:90, muscle:"Pierna" },
        { name:"Curl femoral en máquina", sets:3, reps:"12-15", rest:60, muscle:"Femoral" },
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
        { name:"Remo invertido o con mancuerna", sets:4, reps:"10-12", rest:60, muscle:"Espalda" },
        { name:"Flexiones inclinadas", sets:3, reps:"máx", rest:60, muscle:"Pecho" },
        { name:"Curl de bíceps mancuernas", sets:3, reps:"12-15", rest:45, muscle:"Bíceps" },
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
        { name:"Extensión de tríceps", sets:2, reps:"12-15", rest:40, muscle:"Tríceps" },
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
        { name:"Extensión de tríceps", sets:3, reps:"12-15", rest:45, muscle:"Tríceps" },
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
        { name:"Curl femoral en máquina", sets:4, reps:"12-15", rest:60, muscle:"Femoral" },
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
        { name:"Extensión de tríceps", sets:3, reps:"12-15", rest:45, muscle:"Tríceps" },
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
        { name:"Curl femoral en máquina", sets:3, reps:"12-15", rest:60, muscle:"Femoral" },
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
        { name:"Curl de bíceps mancuernas", sets:2, reps:"12-15", rest:45, muscle:"Bíceps" },
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
        { name:"Extensión de tríceps", sets:3, reps:"12-15", rest:45, muscle:"Tríceps" },
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

  /* -------- EXPRESS -------- */
  { id:"express", cat:"Casa / Express", name:"Express 30 min", subtitle:"1 día · para días sin ganas",
    daysPerWeek:1, rpe:"7",
    blurb:"Cuando el cuerpo pide poco: una sesión corta de cuerpo entero. Mejor esto que faltar. La constancia gana siempre.",
    days:[
      { name:"Full body exprés", exercises:[
        { name:"Sentadilla goblet", sets:3, reps:"12", rest:45, muscle:"Pierna" },
        { name:"Press banca o flexiones", sets:3, reps:"12", rest:45, muscle:"Pecho" },
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
};

/* Aplica los renombres a todo lo que guarda nombres de ejercicio. */
function migrarNombres({ state, log, customRoutines }){
  const nuevo = n => RENOMBRES[n] || n;
  let tocado = false;

  const mapaClaves = obj => {
    if(!obj) return obj;
    const out = {}; let cambio = false;
    for(const [k,v] of Object.entries(obj)){
      const k2 = nuevo(k);
      if(k2 !== k) cambio = true;
      // Si ya existe la clave nueva (raro), se queda la mejor marca.
      out[k2] = (k2 in out) ? (typeof v === "number" ? Math.max(out[k2], v) : v) : v;
    }
    if(cambio) tocado = true;
    return cambio ? out : obj;
  };

  const s2 = { ...state,
    bests: mapaClaves(state.bests), firstBests: mapaClaves(state.firstBests),
    nextWeight: mapaClaves(state.nextWeight), cardioBests: mapaClaves(state.cardioBests),
    muscleXp: state.muscleXp };

  const l2 = (log || []).map(rec => {
    const ex = (rec.exercises || []).map(e => e.name !== nuevo(e.name) ? { ...e, name:nuevo(e.name) } : e);
    if(ex.some((e,i) => e !== rec.exercises[i])) { tocado = true; return { ...rec, exercises:ex }; }
    return rec;
  });

  const r2 = (customRoutines || []).map(r => {
    const days = (r.days || []).map(d => ({ ...d,
      exercises: (d.exercises || []).map(e => e.name !== nuevo(e.name) ? { ...e, name:nuevo(e.name) } : e) }));
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
  "Peso muerto rumano ligero":30, "Peso muerto rumano mancuernas":16, "Remo con barra":30,
  "Remo con mancuerna":16, "Remo en máquina":30, "Jalón al pecho":35, "Jalón agarre cerrado":32,
  "Dominadas o jalón":35, "Zancadas con barra":12, "Curl femoral en máquina":25, "Extensión de cuádriceps en máquina":25,
  "Elevación de talones de pie":40, "Elevaciones laterales":8, "Face pull":15, "Curl de bíceps":10,
  "Curl de bíceps mancuernas":10, "Curl martillo":10, "Curl predicador":12, "Extensión de tríceps":12,
  "Press francés":15, "Aperturas con mancuernas":10, "Fondos en paralelas":0, "Fondos asistidos":0, "Flexiones":0,
  "Flexiones diamante":0, "Flexiones inclinadas":0, "Remo invertido o con mancuerna":14,
  "Press banca o flexiones":25, "Superserie de bíceps y tríceps":10,
  "Jalón agarre neutro":32, "Curl con barra":20, "Curl femoral tumbado":25, "Curl femoral sentado":25,
  "Aperturas en polea":12, "Extensión de tríceps en polea":15, "Sentadilla frontal":30,
  "Press mancuernas sentado":14, "Dominadas lastradas":0, "Fondos en paralelas lastrados":0, "Plancha con lastre":0,
  "Zancadas con mancuernas":12, "Elevaciones laterales en polea":8, "Pullover en polea":20, "Pájaros en polea":8,
  "Hip thrust":40, "Puente de glúteo":20, "Patada de glúteo en polea":10, "Abductores en máquina":30,
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
  "Press declinado con barra":28, "Contractor de pecho":25, "Press de pecho en máquina":30, "Pullover con mancuerna":14,
  "Jalón agarre supino":32, "Remo con dos mancuernas":14, "Peso muerto parcial":60,
  "Encogimientos con barra":40, "Elevación frontal":7, "Press de hombro en máquina":20, "Press de hombro en polea":15, "Pájaros con mancuernas":7,
  "Zancada inversa":10, "Subida al cajón":10, "Sentadilla en multipower":30, "Sentadilla con mancuernas":14,
  "Gemelo en prensa":60, "Elevación de talones con mancuerna":14,
  "Curl en polea":15, "Curl inverso":15, "Curl araña":10,
  "Extensión de tríceps con cuerda":15, "Press banca agarre cerrado":25,
  "Crunch en polea":20, "Crunch en máquina":25,
  /* --- Máquinas y poleas (free-exercise-db) --- */
  "Press inclinado en máquina":28, "Press declinado en máquina":30, "Press banca en multipower":30,
  "Press inclinado en multipower":25, "Cruce de poleas bajo":12, "Aperturas inclinadas en polea":12,
  "Press de pecho en polea":20, "Press de pecho en polea sentado":20, "Cruce de poleas alto":12,
  "Press declinado en multipower":30, "Aperturas en banco con poleas":12, "Press inclinado en polea":18,
  "Press de pecho en máquina de discos":25, "Cruce de poleas a una mano":10, "Press declinado guiado":30,
  "Remo alto en máquina":30, "Remo en máquina a un brazo":20, "Remo en polea a una mano":20,
  "Jalón a una mano":20, "Remo en multipower":30, "Pullover en polea inclinado":18,
  "Remo en polea alto":30, "Jalón con recorrido completo":30, "Remo en polea alta de rodillas":25,
  "Remo en polea alta a una mano":15,
  "Pájaros en máquina":20, "Elevación frontal en polea":10, "Encogimientos en máquina":40,
  "Encogimientos en polea":35, "Press militar en multipower":25, "Rotación externa en polea":5,
  "Press de hombro en polea alterno":12, "Pájaros en polea a una mano":6, "Rotación interna en polea":5,
  "Pájaros en polea cruzada":8, "Remo a la cara con cuerda":15, "Press de hombro en polea de pie":15,
  "Encogimientos en máquina de gemelos":40, "Press de hombro en máquina de discos":20, "Remo al cuello en polea baja":15,
  "Encogimientos tras espalda en multipower":40, "Remo al mentón a una mano en multipower":12, "Remo al mentón en multipower":20,
  "Elevación lateral en polea baja":6, "Remo al mentón en polea":18,
  "Sentadilla hack en máquina":45, "Prensa con pies juntos":70, "Extensión de cuádriceps a una pierna en máquina":15,
  "Zancada en multipower":20, "Pull through en polea":25, "Peso muerto en polea":30,
  "Aductores en polea":10, "Sentadilla en máquina":40, "Peso muerto en máquina":50,
  "Sentadilla tumbada en máquina":50, "Sentadilla hack con pies juntos":40, "Prensa en multipower":40,
  "Sentadilla a una pierna en multipower":20,
  "Curl femoral de pie":15, "Peso muerto rumano en multipower":35,
  "Elevación de talones en multipower":40, "Gemelos en máquina":55, "Elevación de puntas (tibial)":25,
  "Curl de bíceps en máquina":20, "Curl predicador en máquina":18, "Curl martillo en polea":15,
  "Curl predicador en polea":15, "Curl en polea alta":10, "Curl tumbado en polea":12,
  "Curl tumbado en polea alta":12, "Curl sobre la cabeza en polea":10, "Curl inverso en polea":12,
  "Curl en polea a una mano":10,
  "Extensión de tríceps en máquina":20, "Fondos en máquina":25, "Tríceps en polea con cuerda":15,
  "Extensión de tríceps inclinado en polea":12, "Press francés en polea":15, "Tríceps en polea a una mano":8,
  "Extensión de tríceps de rodillas en polea":12, "Extensión de tríceps en polea baja":12, "Tríceps en polea agarre invertido":12,
  "Press cerrado en multipower":25, "Extensión de tríceps sobre cabeza en polea baja":8, "Extensión de tríceps sobre cabeza con cuerda":15,
  "Curl de muñeca en polea":10, "Curl de muñeca sentado en polea":10,
  "Press Pallof":12, "Leñador en polea":15, "Crunch inverso en polea":15,
  "Giro ruso en polea":12, "Crunch en polea sentado":18, "Crunch en polea con giro":15,
  "Flexión lateral en polea alta":12, "Press Pallof con giro":12, "Crunch en polea con cuerda":18,
  "Elevación de cadera en multipower":20, "Leñador invertido en polea":15, "Crunch en polea de pie":18,
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
  "Fondos en paralelas", "Fondos asistidos", "Dominada supina",
  "HIIT en bici o cinta", "Calentamiento en cinta o bici",
  /* Catálogo ampliado: peso corporal, isométricos y cardio */
  "Flexiones declinadas", "Hiperextensiones", "Sentadilla con salto", "Sentadilla sin peso",
  "Puente de glúteo a una pierna", "Curl nórdico", "Fondos en banco", "Elevación de rodillas",
  "Tijeras", "Cinta de correr", "Caminar en cinta", "Bici estática",
  "Elíptica", "Máquina de remo", "Comba", "Escaladora",
  /* Máquinas y poleas sin carga externa */
  "Hiperextensión inversa", "Curl nórdico en máquina", "Bici reclinada",
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
const EX_MUSCLE_EXTRA = {
  "Aductores en máquina":"Pierna", "Good morning":"Femoral", "Patada de tríceps":"Tríceps",
  "Press declinado con barra":"Pecho", "Contractor de pecho":"Pecho", "Press de pecho en máquina":"Pecho", "Flexiones declinadas":"Pecho", "Pullover con mancuerna":"Pecho",
  "Hiperextensiones":"Espalda", "Jalón agarre supino":"Espalda", "Remo con dos mancuernas":"Espalda", "Peso muerto parcial":"Espalda",
  "Encogimientos con barra":"Hombro", "Elevación frontal":"Hombro", "Press de hombro en máquina":"Hombro", "Press de hombro en polea":"Hombro", "Pájaros con mancuernas":"Hombro",
  "Zancada inversa":"Pierna", "Subida al cajón":"Pierna", "Sentadilla en multipower":"Pierna", "Sentadilla con mancuernas":"Pierna", "Sentadilla con salto":"Pierna", "Sentadilla sin peso":"Pierna", "Puente de glúteo a una pierna":"Pierna",
  "Curl nórdico":"Femoral",
  "Gemelo en prensa":"Gemelo", "Elevación de talones con mancuerna":"Gemelo",
  "Curl en polea":"Bíceps", "Curl inverso":"Bíceps", "Curl araña":"Bíceps",
  "Fondos en banco":"Tríceps", "Extensión de tríceps con cuerda":"Tríceps", "Press banca agarre cerrado":"Tríceps",
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
  "Press declinado guiado":"Pecho",
  "Remo alto en máquina":"Espalda", "Remo en máquina a un brazo":"Espalda",
  "Remo en polea a una mano":"Espalda", "Jalón a una mano":"Espalda",
  "Remo en multipower":"Espalda", "Hiperextensión inversa":"Espalda",
  "Pullover en polea inclinado":"Espalda", "Remo en polea alto":"Espalda",
  "Jalón con recorrido completo":"Espalda", "Remo en polea alta de rodillas":"Espalda",
  "Remo en polea alta a una mano":"Espalda",
  "Pájaros en máquina":"Hombro", "Elevación frontal en polea":"Hombro",
  "Encogimientos en máquina":"Hombro", "Encogimientos en polea":"Hombro",
  "Press militar en multipower":"Hombro", "Rotación externa en polea":"Hombro",
  "Press de hombro en polea alterno":"Hombro", "Pájaros en polea a una mano":"Hombro",
  "Rotación interna en polea":"Hombro", "Pájaros en polea cruzada":"Hombro",
  "Remo a la cara con cuerda":"Hombro", "Press de hombro en polea de pie":"Hombro",
  "Encogimientos en máquina de gemelos":"Hombro", "Press de hombro en máquina de discos":"Hombro",
  "Remo al cuello en polea baja":"Hombro", "Encogimientos tras espalda en multipower":"Hombro",
  "Remo al mentón a una mano en multipower":"Hombro", "Remo al mentón en multipower":"Hombro",
  "Elevación lateral en polea baja":"Hombro", "Remo al mentón en polea":"Hombro",
  "Sentadilla hack en máquina":"Pierna", "Prensa con pies juntos":"Pierna",
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
  "Curl tumbado en polea alta":"Bíceps", "Curl sobre la cabeza en polea":"Bíceps",
  "Curl inverso en polea":"Bíceps", "Curl en polea a una mano":"Bíceps",
  "Extensión de tríceps en máquina":"Tríceps", "Fondos en máquina":"Tríceps",
  "Tríceps en polea con cuerda":"Tríceps", "Extensión de tríceps inclinado en polea":"Tríceps",
  "Press francés en polea":"Tríceps", "Tríceps en polea a una mano":"Tríceps",
  "Extensión de tríceps de rodillas en polea":"Tríceps", "Extensión de tríceps en polea baja":"Tríceps",
  "Tríceps en polea agarre invertido":"Tríceps", "Press cerrado en multipower":"Tríceps",
  "Extensión de tríceps sobre cabeza en polea baja":"Tríceps", "Extensión de tríceps sobre cabeza con cuerda":"Tríceps",
  "Curl de muñeca en polea":"Brazo", "Curl de muñeca sentado en polea":"Brazo",
  "Press Pallof":"Core", "Leñador en polea":"Core",
  "Crunch inverso en polea":"Core", "Giro ruso en polea":"Core",
  "Crunch en polea sentado":"Core", "Crunch en polea con giro":"Core",
  "Flexión lateral en polea alta":"Core", "Press Pallof con giro":"Core",
  "Crunch en polea con cuerda":"Core", "Elevación de cadera en multipower":"Core",
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
  "Cinta de correr", "Caminar en cinta", "Bici estática", "Elíptica",
  "Máquina de remo", "Escaladora", "Calentamiento en cinta o bici",
]);
/* Solo pedimos datos de consola si es máquina Y el objetivo va en minutos
   (en intervalos de segundos no tiene sentido apuntar km por serie). */
const hasConsole = ex => isCardio(ex.name) && MACHINE_CARDIO.has(ex.name) && repUnit(ex.reps) === "MIN";
/* Un tiempo solo entra en los récords si está medido en minutos. */
const tracksTime = ex => isCardio(ex.name) && repUnit(ex.reps) === "MIN";

/* Descanso sugerido por defecto al añadir un ejercicio en el configurador (segundos).
   El cardio continuo arranca en 0: no hay descanso entre series que valga. */
const REST_BY_MUSCLE = { Pierna:120, Femoral:100, Espalda:100, Pecho:100, Hombro:75, Gemelo:45, Bíceps:45, Tríceps:45, Core:45, Cardio:0 };
function defaultRest(name){ const r = REST_BY_MUSCLE[EX_MUSCLE[name]]; return r == null ? 60 : r; }
function defaultReps(name){
  if(isCardio(name)) return "20 min";                        // cardio: se anota tiempo, no repeticiones
  if(!isBodyweight(name)) return "10-12";
  return /plancha/i.test(name) ? "45 s" : "12-15";           // isométricos: segundos
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
  "Press militar mancuernas":"De pie o sentado con la espalda firme, mancuernas a la altura de los hombros. Empuja arriba hasta casi estirar los brazos sin arquear la lumbar y baja controlado. Aprieta glúteos y abdomen.",
  "Plancha":"Sobre antebrazos y puntas de los pies, cuerpo en línea recta de cabeza a talones. Aprieta abdomen y glúteos, no dejes caer la cadera ni subas el culo. Respira con normalidad.",
  "Prensa de piernas":"Sentado en la máquina, pies a la anchura de los hombros. Baja flexionando las rodillas hacia el pecho sin despegar la lumbar del respaldo y empuja sin bloquear del todo las rodillas.",
  "Jalón al pecho":"Sentado, agarra la barra más ancha que los hombros. Tira hacia la parte alta del pecho llevando los codos abajo y atrás, aprieta la espalda y sube controlando sin encoger los hombros.",
  "Press inclinado mancuernas":"Banco inclinado 30-45°, mancuernas a los lados del pecho. Empuja arriba juntándolas un poco y baja controlado hasta notar estiramiento en el pecho. Omóplatos apretados.",
  "Elevaciones laterales":"De pie con una mancuerna en cada mano y codos algo flexionados, sube los brazos a los lados hasta la altura del hombro liderando con el codo, y baja despacio. Sin impulso del cuerpo.",
  "Elevación de piernas":"Tumbado boca arriba, sube las piernas (rectas o con la rodilla algo flexionada) llevando la pelvis hacia el ombligo, y baja controlado sin arquear la lumbar.",
  "Peso muerto rumano ligero":"Versión ligera para aprender el patrón: de pie, empuja la cadera hacia atrás bajando el peso pegado a las piernas hasta notar los femorales, espalda recta, y vuelve apretando glúteos.",
  "Remo en máquina":"Sentado con el pecho apoyado, agarra las asas y tira de los codos hacia atrás apretando la espalda; vuelve estirando sin redondear. Hombros abajo.",
  "Fondos asistidos":"En la máquina de fondos con apoyo de rodillas, baja flexionando los codos hasta que el hombro llegue a su altura y empuja arriba. Inclínate algo adelante para más pecho.",
  "Face pull":"Cuerda en polea a la altura de la cara: tira hacia la frente separando las manos con los codos altos y atrás, apretando la parte trasera del hombro. Peso ligero y control.",
  "Curl de bíceps":"De pie con mancuernas o barra, codos pegados al cuerpo. Sube flexionando solo el codo sin balancear, aprieta arriba y baja controlando la bajada.",
  "Sentadilla":"Barra sobre la parte alta de la espalda. Baja flexionando cadera y rodillas con el pecho alto y la espalda recta hasta pasar la paralela, y sube empujando con todo el pie. Rodillas hacia la punta de los pies.",
  "Remo con barra":"Inclina el tronco ~45° con la espalda recta y la barra colgando. Tira llevándola al ombligo apretando la espalda y baja controlado. No tirones con la lumbar.",
  "Peso muerto":"Barra sobre el medio del pie. Con espalda recta y pecho alto, levanta empujando el suelo con las piernas y extendiendo la cadera; la barra sube pegada al cuerpo. Nunca redondees la lumbar.",
  "Press militar":"De pie, barra a la altura de las clavículas. Empuja por encima de la cabeza hasta estirar los brazos sin arquear la lumbar (aprieta glúteos y abdomen) y baja controlado.",
  "Extensión de tríceps":"En polea alta con cuerda o barra, codos pegados al cuerpo. Estira los codos hacia abajo apretando el tríceps y vuelve controlando sin abrir los codos.",
  "Rueda abdominal":"De rodillas, desliza la rueda hacia delante estirando el cuerpo SIN arquear la lumbar (abdomen apretado), hasta donde controles, y vuelve. Empieza con recorrido corto.",
  "Peso muerto rumano":"De pie con barra y piernas casi rectas, lleva la cadera atrás bajando la barra pegada a las piernas hasta notar tensión en los femorales, espalda recta, y sube apretando glúteos.",
  "Zancadas con barra":"Da un paso al frente y baja la rodilla trasera hacia el suelo con el tronco erguido y la rodilla delantera sobre el tobillo. Empuja para volver y alterna piernas.",
  "Curl femoral en máquina":"En la máquina, engancha los tobillos y flexiona las rodillas llevando el talón hacia el glúteo apretando el femoral; vuelve controlado.",
  "Elevación de talones de pie":"Con las puntas de los pies en un escalón, sube el talón lo máximo poniéndote de puntillas, aprieta arriba y baja estirando bien el gemelo.",
  "Extensión de cuádriceps en máquina":"Sentado en la máquina, engancha los tobillos y estira las rodillas apretando el cuádriceps arriba; baja controlado sin dejar caer el peso.",
  "Dominadas o jalón":"Dominadas: colgado de la barra, tira del pecho hacia ella llevando los codos abajo y atrás, y baja controlado. Si aún no salen, usa el jalón al pecho en polea con la misma técnica.",
  "Aperturas con mancuernas":"Tumbado con mancuernas sobre el pecho y codos algo flexionados, abre los brazos en arco hasta notar estiramiento y ciérralos apretando el pecho, como si abrazaras.",
  "Curl martillo":"Curl con las mancuernas en agarre neutro (palmas enfrentadas). Sube flexionando el codo sin girar la muñeca y baja controlado. Trabaja bíceps y antebrazo.",
  "Press francés":"Tumbado o sentado, barra o mancuernas sobre la cabeza con los codos apuntando al techo. Baja flexionando solo los codos hacia la frente y estira arriba. Codos quietos.",
  "Fondos en paralelas":"En paralelas, baja flexionando los codos hasta que el hombro llegue a su altura y empuja arriba. Inclínate adelante para pecho, vertical para tríceps. No bajes más de lo que controles.",
  "Curl predicador":"Con el brazo apoyado en el banco predicador, sube la barra o mancuerna flexionando el codo y baja controlando bien la parte final, sin estirar de golpe.",
  "Jalón agarre cerrado":"Jalón en polea con agarre estrecho (triángulo). Tira hacia el pecho con los codos pegados abajo y atrás, aprieta la espalda y sube controlado.",
  "Sentadilla búlgara":"Pie trasero apoyado en un banco y una mancuerna en cada mano. Baja flexionando la pierna delantera con el tronco algo inclinado y empuja para subir. Una pierna cada vez.",
  "Flexiones":"Manos algo más anchas que los hombros, cuerpo en línea recta. Baja el pecho al suelo con los codos a ~45° y empuja arriba apretando abdomen y glúteos. Si cuesta, apoya rodillas.",
  "Peso muerto rumano mancuernas":"Como el rumano pero con una mancuerna en cada mano: cadera atrás, mancuernas pegadas a las piernas, espalda recta, hasta notar los femorales, y sube apretando glúteos.",
  "Flexiones diamante":"Flexión con las manos juntas formando un triángulo bajo el pecho y los codos pegados al cuerpo. Enfatiza el tríceps. Cuerpo recto y abdomen apretado.",
  "Remo invertido o con mancuerna":"Remo invertido: bajo una barra fija, cuerpo recto colgando, tira del pecho hacia la barra. Alternativa: remo con mancuerna apoyando rodilla y mano en un banco.",
  "Flexiones inclinadas":"Flexiones con las manos apoyadas en una superficie elevada (banco). Más fáciles que en el suelo: baja el pecho hacia el borde y empuja. Cuerpo recto.",
  "Curl de bíceps mancuernas":"De pie con una mancuerna en cada mano y codos pegados, sube flexionando el codo sin balancear y baja despacio. Puedes alternar brazos.",
  "Plancha lateral":"Rueda abdominal (deslizar sin arquear la lumbar) o, como alternativa, plancha lateral: de lado sobre un antebrazo, cuerpo en línea recta y cadera arriba, aguanta.",
  "Calentamiento en cinta o bici":"Trote suave en cinta o pedaleo ligero en bici para subir pulsaciones antes de entrenar. Ritmo cómodo en el que puedas hablar.",
  "Mountain climbers":"En posición de flexión, lleva las rodillas al pecho alternando rápido como si corrieras, con el abdomen apretado y la cadera estable.",
  "Elevación de piernas en barra":"Colgado de la barra, sube las piernas (rectas o rodillas flexionadas) llevando la pelvis hacia arriba sin balancearte. Control en la bajada.",
  "HIIT en bici o cinta":"Intervalos: ~30 s fuerte (casi al máximo) y 30 s suave, repitiendo. Sube pulsaciones para el gasto calórico. Ajusta la intensidad a tu forma física.",
  "Dominadas lastradas":"Dominadas con peso añadido (cinturón de lastre o mancuerna entre los pies). Misma técnica: pecho a la barra, codos abajo y atrás, bajada controlada. Solo si dominas las normales.",
  "Press banca o flexiones":"Press de banca con barra (bajar al pecho y empujar) o, si no hay banco libre, flexiones con la misma idea de empuje.",
  "Superserie de bíceps y tríceps":"Superserie: una serie de curl de bíceps seguida SIN descanso de una de extensión de tríceps; descansa al terminar ambas.",
  "Jalón agarre neutro":"Jalón en polea con agarre neutro (palmas enfrentadas). Tira hacia el pecho con los codos pegados abajo, aprieta la espalda y sube controlado.",
  "Curl con barra":"De pie con barra recta o Z y codos pegados al cuerpo, sube flexionando el codo sin balancear la espalda y baja controlando.",
  "Curl femoral tumbado":"Tumbado boca abajo en la máquina, engancha los tobillos y lleva los talones al glúteo apretando el femoral; baja controlado sin despegar la cadera.",
  "Aperturas en polea":"Entre dos poleas a la altura del pecho con los brazos algo flexionados, junta las manos delante en arco apretando el pecho y abre controlando el estiramiento.",
  "Extensión de tríceps en polea":"Polea alta con cuerda o barra, codos pegados al cuerpo. Estira hacia abajo apretando el tríceps y sube controlando sin mover los codos.",
  "Curl femoral sentado":"Sentado en la máquina, engancha los tobillos y flexiona las rodillas llevando los talones bajo el asiento apretando el femoral; vuelve controlado.",
  "Zancadas con mancuernas":"Zancadas con una mancuerna en cada mano: paso al frente, baja la rodilla trasera con el tronco erguido y empuja para volver. Alterna piernas.",
  "Plancha con lastre":"Plancha sobre antebrazos con un disco en la espalda alta. Cuerpo en línea recta, abdomen y glúteos apretados, sin hundir la cadera.",
  "Fondos en paralelas lastrados":"Fondos en paralelas con peso añadido (cinturón de lastre). Baja hasta que el hombro llegue al codo y empuja. Solo si dominas los fondos sin peso.",
  "Press mancuernas sentado":"Sentado con respaldo, mancuernas a la altura de los hombros. Empuja arriba sin arquear la lumbar y baja controlado hasta los hombros.",
  "Sentadilla frontal":"Barra apoyada delante, sobre hombros y clavículas, codos altos. Baja manteniendo el tronco muy vertical y sube empujando con las piernas. Exige buena movilidad.",
  "Elevaciones laterales en polea":"De pie de lado a una polea baja, sube el brazo al lateral hasta la altura del hombro liderando con el codo y baja controlando. Un brazo cada vez.",
  "Pullover en polea":"De pie frente a la polea alta con barra o cuerda y brazos algo flexionados, lleva el peso hacia los muslos en arco apretando el dorsal, y vuelve controlando.",
  "Pájaros en polea":"Inclinado o con poleas cruzadas, abre los brazos hacia atrás apretando la parte trasera del hombro (deltoides posterior). Peso ligero y control.",
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
  "Peso muerto piernas rígidas":"Con las piernas casi rectas (rodillas ligeramente flexionadas), baja la barra pegada a las piernas llevando la cadera atrás hasta notar el estiramiento de los femorales, y sube apretando glúteos. Espalda siempre recta.",
  "Elevación de talones sentado":"Sentado con el peso sobre las rodillas y las puntas de los pies en un escalón, sube los talones lo máximo posible apretando el gemelo, y baja estirando por completo.",
  "Crunch abdominal":"Tumbado boca arriba con las rodillas flexionadas, despega los hombros del suelo acercando las costillas a la cadera apretando el abdomen; baja despacio sin tirar del cuello.",
  "Russian twist":"Sentado con el tronco algo inclinado y los pies elevados o apoyados, gira el tronco de lado a lado tocando el suelo a cada lado, con el abdomen apretado. Puedes sujetar un peso.",
  "Sentadilla hack":"En la máquina hack, con los hombros bajo las almohadillas y los pies adelantados, baja flexionando rodillas y cadera con la espalda apoyada, y sube empujando con los talones sin bloquear.",
  "Dominada supina":"Cuélgate de la barra con las palmas hacia ti y agarre a la anchura de los hombros. Tira subiendo el pecho a la barra apretando dorsal y bíceps, y baja controlando hasta estirar los brazos.",
  "Bicicleta abdominal":"Tumbada boca arriba, lleva el codo hacia la rodilla contraria alternando lados como si pedalearas, con la zona lumbar pegada al suelo y el abdomen apretado.",
  "Press inclinado con barra":"Banco inclinado 30-45°, agarre algo más ancho que los hombros. Baja la barra controlada hasta la parte alta del pecho con los codos a ~45° y empuja arriba sin bloquear de golpe. Omóplatos apretados y pies firmes en el suelo.",
  /* --- Catálogo ampliado (free-exercise-db) --- */
  "Press declinado con barra":"Tumbado en un banco declinado y bien sujeto por los pies, baja la barra controlada hasta la parte baja del pecho con los codos algo recogidos, y empuja arriba sin bloquear de golpe. Pide que te ayuden a sacar y dejar la barra: en declinado cuesta más.",
  "Contractor de pecho":"Sentado con la espalda pegada al respaldo y los codos a la altura del pecho, junta los brazos delante apretando el pectoral y vuelve despacio hasta notar estiramiento sin forzar el hombro. No dejes que las placas descansen entre repeticiones.",
  "Press de pecho en máquina":"Ajusta el asiento para que las asas queden a la altura media del pecho. Empuja hacia delante hasta casi estirar los brazos y vuelve controlando, sin adelantar los hombros ni despegar la espalda del respaldo.",
  "Flexiones declinadas":"Flexión con los pies elevados sobre un banco o cajón: cuanto más alto, más peso llevan los hombros y el pecho alto. Cuerpo en línea recta, abdomen apretado y codos a unos 45°, sin dejar caer la cadera.",
  "Pullover con mancuerna":"Tumbado en el banco, sujeta una mancuerna con las dos manos sobre el pecho con los codos algo flexionados. Llévala por detrás de la cabeza hasta notar el estiramiento en el pecho y el dorsal, y vuelve sin arquear la lumbar.",
  "Hiperextensiones":"En el banco de lumbares, con las caderas apoyadas y los pies fijos, baja el tronco flexionando la cadera con la espalda recta y sube hasta quedar alineado, apretando glúteos. No te pases de arriba: no hay que arquear la espalda.",
  "Jalón agarre supino":"Sentado y con las palmas hacia ti a la anchura de los hombros, tira de la barra al pecho llevando los codos abajo y atrás, y sube controlando sin encoger los hombros. Este agarre carga algo más el bíceps que el jalón normal.",
  "Remo con dos mancuernas":"Con el tronco inclinado hacia delante y la espalda recta, deja colgar las mancuernas. Tira de los dos codos hacia atrás llevándolas a la cadera, aprieta la espalda arriba y baja despacio sin encorvarte ni dar tirones.",
  "Peso muerto parcial":"Peso muerto desde media altura (barra en el rack, a la altura de las rodillas). Empuja la cadera hacia delante manteniendo la espalda recta y la barra pegada a las piernas. Permite más carga: cuida la técnica antes que el peso.",
  "Encogimientos con barra":"De pie con la barra delante o detrás de los muslos y los brazos estirados, sube los hombros hacia las orejas todo lo que puedas y baja despacio. No gires los hombros ni ayudes con los brazos: solo suben y bajan.",
  "Elevación frontal":"De pie con una mancuerna en cada mano delante de los muslos, sube un brazo estirado (codo algo flexionado) hasta la altura del hombro y baja controlado. Sin balancear el cuerpo ni arquear la lumbar; aprieta el abdomen.",
  "Press de hombro en máquina":"Sentado con la espalda apoyada y las asas a la altura de los hombros, empuja arriba hasta casi estirar los brazos y baja controlado. Ajusta el asiento para no tener que sacar los hombros de sitio al empezar.",
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
  "Extensión de tríceps con cuerda":"De pie de espaldas a la polea alta con la cuerda por detrás de la cabeza y los codos apuntando arriba, estira los brazos separando las manos al final y vuelve despacio. Mantén los codos quietos y cerca de la cabeza.",
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
  "Press declinado guiado":"Banco declinado bajo la barra guiada, bajando a la parte baja del pecho. Insiste en el pectoral inferior; ata bien los pies antes de empezar.",
  "Remo alto en máquina":"Sentado con el pecho apoyado en el respaldo, tira de las asas hacia atrás y algo hacia abajo llevando los codos por detrás del cuerpo, aprieta la espalda y vuelve estirando sin encorvarte. El apoyo en el pecho quita toda la carga de la lumbar.",
  "Remo en máquina a un brazo":"Igual que el remo en máquina pero tirando con un brazo cada vez, lo que te deja llegar un poco más atrás y corregir diferencias entre lados. No gires el tronco para acompañar: el pecho se queda pegado al respaldo.",
  "Remo en polea a una mano":"Sentado en la polea baja, tira del asa con una mano llevando el codo a la cadera y aprieta la espalda; vuelve estirando el brazo del todo para estirar el dorsal. Mantén el tronco quieto, sin rotar.",
  "Jalón a una mano":"Sentado en el jalón con un asa, tira hacia abajo con un brazo llevando el codo al costado, y sube controlando hasta estirar del todo. A una mano notas mejor el dorsal y corriges descompensaciones.",
  "Remo en multipower":"Con la barra guiada a la altura de las espinillas, inclina el tronco hacia delante con la espalda recta y tira de la barra hacia el ombligo. La guía te quita el trabajo de estabilizar: céntrate en apretar la espalda.",
  "Hiperextensión inversa":"Tumbado boca abajo con la cadera al borde del banco y el tronco fijo, sube las piernas juntas hasta alinearlas con el cuerpo apretando los glúteos, y baja despacio. Trabaja glúteo y lumbar sin cargar la columna.",
  "Pullover en polea inclinado":"De pie frente a la polea alta con los brazos casi estirados, baja la barra en arco hasta los muslos sin flexionar los codos, y vuelve arriba controlando. Aísla el dorsal sin que trabajen los bíceps.",
  "Remo en polea alto":"Sentado con la polea por encima de la altura del pecho, tira de las asas hacia el pecho llevando los codos atrás y aprieta la espalda. El ángulo alto carga más la espalda alta que el remo normal.",
  "Jalón con recorrido completo":"Jalón en el que dejas que los hombros suban del todo arriba (estirando el dorsal) antes de tirar abajo. Ese estiramiento extra de arriba es justo lo que se pierde al hacerlo con demasiado peso.",
  "Remo en polea alta de rodillas":"De rodillas frente a la polea alta, tira de la cuerda hacia la cara llevando los codos atrás y abriendo el pecho. Trabaja dorsal y espalda alta con el core sujetando la postura.",
  "Remo en polea alta a una mano":"De rodillas frente a la polea alta, tira con un brazo llevando el codo al costado y girando ligeramente el tronco al final. A una mano llegas a un rango que con barra es imposible.",
  "Pájaros en máquina":"Sentado del revés en la máquina de contractor, con el pecho apoyado, abre los brazos hacia atrás hasta la altura de los hombros apretando la parte trasera del hombro, y vuelve despacio. Lidera con los codos, no con las manos.",
  "Elevación frontal en polea":"De espaldas a la polea baja con el asa por delante del muslo, sube el brazo estirado hasta la altura del hombro y baja controlado. La polea mantiene la tensión desde el primer grado, a diferencia de la mancuerna.",
  "Encogimientos en máquina":"De pie o sentado en la máquina con las asas a los lados, sube los hombros hacia las orejas todo lo que puedas, aguanta un segundo arriba y baja despacio. Nada de girar los hombros: solo suben y bajan.",
  "Encogimientos en polea":"De pie frente a una polea baja con la barra en las manos y los brazos estirados, encoge los hombros hacia arriba y baja controlando. La polea da tensión constante y te permite cargar sin agarres incómodos.",
  "Press militar en multipower":"Sentado bajo la barra guiada, con las manos algo más anchas que los hombros, empuja arriba hasta casi estirar y baja hasta la barbilla. La guía evita que la barra se te vaya: útil para ir pesado sin ayuda.",
  "Rotación externa en polea":"De pie de lado a la polea, con el codo pegado al costado y doblado 90°, gira el antebrazo hacia fuera y vuelve despacio. Poco peso y muchas repeticiones: es trabajo para el manguito rotador, no para lucirse.",
  "Press de hombro en polea alterno":"Sentado o de pie entre dos poleas bajas, empuja una mano hacia arriba mientras la otra espera abajo, y alterna. Al ir alterno el core trabaja para que no te vayas de lado.",
  "Pájaros en polea a una mano":"Inclinado hacia delante con el asa de la polea baja cruzada bajo el cuerpo, abre el brazo hacia el lado hasta la altura del hombro y baja despacio. Lidera con el codo y no gires el tronco para ayudarte.",
  "Rotación interna en polea":"De lado a la polea, con el codo pegado al costado y doblado 90°, gira el antebrazo hacia dentro cruzando el ombligo y vuelve despacio. Complemento de la rotación externa: poco peso y control.",
  "Pájaros en polea cruzada":"De pie entre dos poleas altas con los cables cruzados, abre los brazos hacia atrás y afuera hasta la altura de los hombros, y vuelve despacio. Perfecto para la parte trasera del hombro, que casi siempre va retrasada.",
  "Remo a la cara con cuerda":"Con la cuerda en una polea a la altura de la cara, tira hacia ti abriendo las manos y llevando los codos altos y atrás. Postura y hombro sano: mételo al final de los días de empuje.",
  "Press de hombro en polea de pie":"De pie entre dos poleas bajas con las asas a la altura de los hombros, empuja hacia arriba hasta casi estirar y baja controlado. Aprieta abdomen y glúteos para no arquear la lumbar.",
  "Encogimientos en máquina de gemelos":"De pie en la máquina de gemelos con los hombros bajo las almohadillas, sube los hombros hacia las orejas y baja despacio. Aprovecha una máquina que casi nadie usa para esto y permite bastante carga.",
  "Press de hombro en máquina de discos":"Sentado con la espalda apoyada y las asas a la altura de los hombros, empuja arriba hasta casi estirar y baja controlado. Al ser independiente cada brazo, ambos hombros trabajan lo mismo.",
  "Remo al cuello en polea baja":"Sentado en la polea baja con la cuerda, tira hacia la barbilla con los codos altos y abiertos. Trabaja hombro posterior y trapecio; con poco peso y sin encoger los hombros.",
  "Encogimientos tras espalda en multipower":"De pie con la barra guiada por detrás de los glúteos, sube los hombros hacia las orejas y baja despacio. Por detrás el trapecio trabaja con el pecho abierto, mejor para la postura.",
  "Remo al mentón a una mano en multipower":"Con la barra guiada y una sola mano, tira hacia arriba pegado al cuerpo llevando el codo alto hasta la altura del pecho, y baja despacio. Si notas pinzamiento en el hombro, no subas tanto.",
  "Remo al mentón en multipower":"Con la barra guiada por delante de los muslos, tira hacia arriba pegada al cuerpo con los codos altos hasta la altura del pecho, y baja despacio. No subas por encima de los hombros: el hombro se resiente.",
  "Elevación lateral en polea baja":"De pie con el asa de la polea baja cruzada por delante del cuerpo, sube el brazo hacia el lado hasta la altura del hombro y baja despacio. La polea da tensión desde abajo, donde la mancuerna no da nada.",
  "Remo al mentón en polea":"De pie frente a la polea baja con la barra, tira hacia arriba pegada al cuerpo con los codos altos hasta la altura del pecho. Sube solo hasta donde no te moleste el hombro.",
  "Sentadilla hack en máquina":"En la máquina hack, con la espalda apoyada en el respaldo y los pies a media plataforma, baja flexionando las rodillas hasta los muslos paralelos y sube empujando con todo el pie. La máquina sujeta la espalda: aísla el cuádriceps mejor que la sentadilla libre.",
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
  "Gemelos en máquina":"En la máquina de gemelos, con los hombros o las rodillas bajo el soporte y la punta de los pies en la plataforma, empuja hasta arriba y baja despacio buscando el estiramiento completo. El gemelo necesita recorrido y repeticiones: no lo hagas a medias.",
  "Elevación de puntas (tibial)":"Con la barra guiada sobre los hombros y los talones apoyados, sube las puntas de los pies hacia ti y baja despacio. Trabaja el tibial anterior, la cara delantera de la espinilla que casi nadie entrena.",
  "Curl de bíceps en máquina":"Sentado con la parte alta de los brazos apoyada en el soporte y las axilas pegadas al borde, flexiona los codos hasta arriba y baja despacio sin despegar los brazos. La máquina te fija la postura: por eso permite apretar el bíceps sin ayudarte con la espalda.",
  "Curl predicador en máquina":"Variante con el brazo apoyado en un banco inclinado dentro de la máquina. Sube hasta contraer del todo y baja controlando hasta casi estirar el codo. Cuidado con soltar de golpe abajo: es donde más se resiente el tendón.",
  "Curl martillo en polea":"De pie frente a la polea baja con una cuerda, sube flexionando los codos con las palmas enfrentadas (como si dieras un martillazo) y baja despacio. Trabaja bíceps y braquial, y engorda el antebrazo.",
  "Curl predicador en polea":"Con el banco predicador delante de una polea baja y los brazos apoyados, flexiona los codos hasta arriba y baja controlando casi hasta estirar. La polea mantiene tensión también abajo, donde la barra la pierde.",
  "Curl en polea alta":"De pie entre dos poleas altas con los brazos abiertos en cruz, flexiona los codos llevando las manos hacia las orejas sin bajar los brazos. Contrae mucho el bíceps en su posición más corta.",
  "Curl tumbado en polea":"Tumbado en el suelo con los pies hacia la polea baja, flexiona los codos llevando la barra a la frente sin mover los brazos. Tumbado no puedes balancearte: todo lo hace el bíceps.",
  "Curl tumbado en polea alta":"Tumbado bajo la polea alta con agarre estrecho, flexiona los codos llevando la barra hacia la frente y vuelve despacio. El ángulo trabaja el bíceps con el brazo por encima de la cabeza.",
  "Curl sobre la cabeza en polea":"De pie entre dos poleas altas con los brazos en cruz, flexiona los codos llevando las manos hacia la cabeza sin bajar los brazos. Es el curl con el bíceps más acortado: se nota muchísimo el pico.",
  "Curl inverso en polea":"De pie frente a la polea baja con las palmas hacia abajo, flexiona los codos pegados al cuerpo y baja despacio. Trabaja braquial y antebrazo: necesitarás bastante menos peso del que crees.",
  "Curl en polea a una mano":"De pie de lado a la polea baja con un asa, flexiona el codo sin mover el brazo del sitio y baja controlando hasta estirar. A una mano puedes girar la muñeca al subir y apurar más la contracción.",
  "Extensión de tríceps en máquina":"Sentado con la espalda apoyada y los codos fijos en el soporte, estira los brazos empujando las asas hacia abajo y vuelve controlando. Al estar guiado, el codo no se va: ideal para apurar el tríceps sin comprometer el hombro.",
  "Fondos en máquina":"Sentado en la máquina de fondos asistidos o de empuje, estira los brazos empujando hacia abajo con los codos pegados al cuerpo y vuelve despacio. Permite ajustar la carga exacta, algo que en los fondos libres no puedes.",
  "Tríceps en polea con cuerda":"De pie frente a la polea alta con una cuerda, con los codos pegados al cuerpo, estira los brazos hacia abajo separando las manos al final y vuelve sin dejar que el codo se abra. No eches el cuerpo encima para empujar.",
  "Extensión de tríceps inclinado en polea":"Tumbado en un banco inclinado con la polea detrás de la cabeza, estira los brazos hacia arriba manteniendo los codos quietos y apuntando al techo. El ángulo estira bien la porción larga del tríceps.",
  "Press francés en polea":"Tumbado en un banco con la polea baja detrás de la cabeza, estira los brazos manteniendo los codos fijos apuntando arriba, y vuelve doblando solo el codo. La polea evita el punto muerto de la barra.",
  "Tríceps en polea a una mano":"De pie frente a la polea alta con un asa y la palma hacia arriba, estira el brazo hacia abajo con el codo pegado al costado y vuelve despacio. A una mano corriges diferencias entre brazos.",
  "Extensión de tríceps de rodillas en polea":"De rodillas y de espaldas a la polea alta, con la cuerda tras la nuca y los codos apuntando al frente, estira los brazos y vuelve despacio. De rodillas no puedes compensar con el cuerpo.",
  "Extensión de tríceps en polea baja":"Tumbado en el suelo o en un banco con la polea baja detrás, estira los brazos hacia arriba manteniendo los codos quietos. La resistencia por abajo cambia dónde más cuesta el ejercicio.",
  "Tríceps en polea agarre invertido":"En la polea alta con las palmas hacia arriba, estira los brazos hacia abajo con los codos pegados al costado. Este agarre insiste en la cabeza interna del tríceps; usa poco peso, resbala más.",
  "Press cerrado en multipower":"Press banca guiado con las manos a la anchura de los hombros y los codos pegados al cuerpo. La guía te deja apurar el tríceps sin miedo a que la barra se descuadre.",
  "Extensión de tríceps sobre cabeza en polea baja":"De pie de espaldas a la polea baja, con el codo arriba junto a la cabeza, estira el brazo hacia el techo y vuelve despacio. Estira bien la porción larga del tríceps.",
  "Extensión de tríceps sobre cabeza con cuerda":"De espaldas a la polea con la cuerda tras la nuca y los codos apuntando arriba, estira los brazos separando las manos al final. Mantén los codos quietos y cerca de la cabeza.",
  "Curl de muñeca en polea":"Sentado con los antebrazos apoyados en los muslos y las palmas hacia arriba, sujeta la barra de la polea baja y flexiona solo las muñecas, subiendo y bajando despacio. Recorrido corto y muchas repeticiones.",
  "Curl de muñeca sentado en polea":"Sentado con los antebrazos en los muslos y las palmas hacia arriba, flexiona las muñecas subiendo la barra de la polea baja y baja despacio dejando que ruede hasta los dedos. Antebrazo puro.",
  "Press Pallof":"De pie de lado a la polea, con las manos juntas a la altura del pecho, estira los brazos al frente y aguanta sin dejar que el cable te gire el tronco; vuelve despacio. No es un empuje: es aguantar la rotación, y por eso fortalece tanto el core.",
  "Leñador en polea":"Desde la polea alta y con el cuerpo de lado, tira en diagonal hacia la cadera contraria girando el tronco y dejando que el pie de atrás pivote; vuelve controlando. Trabaja los oblicuos con el giro completo del cuerpo.",
  "Crunch inverso en polea":"Tumbado con la cabeza hacia la polea baja y los tobillos enganchados, lleva las rodillas hacia el pecho enrollando la pelvis y baja despacio sin arquear la lumbar. Insiste en la parte baja del abdomen.",
  "Giro ruso en polea":"De lado a la polea con los brazos estirados a la altura del pecho, gira el tronco alejándote del cable y vuelve controlando. El giro sale del tronco, no de los brazos.",
  "Crunch en polea sentado":"Sentado de espaldas a la polea alta con la cuerda junto a la cabeza, enrolla el tronco llevando los codos hacia los muslos y vuelve despacio. Sentado te cuesta más compensar con la cadera.",
  "Crunch en polea con giro":"De rodillas frente a la polea alta con la cuerda junto a la cabeza, enrolla el tronco llevando el codo hacia la rodilla contraria, alternando lados. Suma oblicuos al crunch de polea de siempre.",
  "Flexión lateral en polea alta":"De lado a la polea alta con un asa, inclina el tronco hacia el lado contrario venciendo la resistencia y vuelve controlando. Trabaja los oblicuos sin cargar la columna con peso encima.",
  "Press Pallof con giro":"Como el press Pallof, pero al estirar los brazos giras el tronco alejándote de la polea y vuelves al centro. Suma rotación controlada al trabajo antirrotación.",
  "Crunch en polea con cuerda":"De rodillas frente a la polea alta con la cuerda a los lados de la cabeza, enrolla la columna llevando los codos hacia los muslos y vuelve despacio. El movimiento es de la espalda, no de la cadera.",
  "Elevación de cadera en multipower":"Tumbado bajo la barra guiada apoyada en la cadera, sube la pelvis apretando glúteos hasta alinear rodilla, cadera y hombro, y baja sin apoyar del todo. Pon una almohadilla: la barra molesta en la cadera.",
  "Leñador invertido en polea":"Desde la polea baja y de lado, tira en diagonal hacia arriba y hacia el hombro contrario girando el tronco, y vuelve controlando. Es el leñador al revés: de abajo hacia arriba.",
  "Crunch en polea de pie":"De pie frente a la polea alta con la cuerda junto a la cabeza, enrolla el tronco hacia abajo apretando el abdomen y vuelve despacio. Igual que el de rodillas pero sin castigar las rodillas.",
  "Bici reclinada":"Bici con respaldo y pedales por delante. Es la opción más cómoda para la espalda y la más fácil de mantener mucho rato, ideal si empiezas o vuelves de una lesión.",
};

/* Imágenes de ejercicios (free-exercise-db, dominio público / Unlicense) */
const EX_IMG = {
  "Aperturas con mancuernas": "/exercises/Dumbbell_Flyes/0.jpg",
  "Aperturas en polea": "/exercises/Cable_Crossover/0.jpg",
  "Curl con barra": "/exercises/Barbell_Curl/0.jpg",
  "Curl de bíceps": "/exercises/Dumbbell_Bicep_Curl/0.jpg",
  "Curl de bíceps mancuernas": "/exercises/Dumbbell_Bicep_Curl/0.jpg",
  "Curl femoral en máquina": "/exercises/Lying_Leg_Curls/0.jpg",
  "Curl femoral sentado": "/exercises/Seated_Leg_Curl/0.jpg",
  "Curl femoral tumbado": "/exercises/Lying_Leg_Curls/0.jpg",
  "Curl martillo": "/exercises/Hammer_Curls/0.jpg",
  "Curl predicador": "/exercises/Preacher_Curl/0.jpg",
  "Dominadas o jalón": "/exercises/Pullups/0.jpg",
  "Dominadas lastradas": "/exercises/Weighted_Pull_Ups/0.jpg",
  "Elevaciones laterales": "/exercises/Side_Lateral_Raise/0.jpg",
  "Elevaciones laterales en polea": "/exercises/Cable_Seated_Lateral_Raise/0.jpg",
  "Elevación de talones de pie": "/exercises/Standing_Calf_Raises/0.jpg",
  "Elevación de piernas": "/exercises/Flat_Bench_Lying_Leg_Raise/0.jpg",
  "Elevación de piernas en barra": "/exercises/Hanging_Leg_Raise/0.jpg",
  "Extensión de cuádriceps en máquina": "/exercises/Leg_Extensions/0.jpg",
  "Extensión de tríceps": "/exercises/Triceps_Pushdown/0.jpg",
  "Extensión de tríceps en polea": "/exercises/Triceps_Pushdown/0.jpg",
  "Face pull": "/exercises/Face_Pull/0.jpg",
  "Flexiones": "/exercises/Pushups/0.jpg",
  "Flexiones diamante": "/exercises/Push-Ups_-_Close_Triceps_Position/0.jpg",
  "Flexiones inclinadas": "/exercises/Incline_Push-Up/0.jpg",
  "Fondos en paralelas": "/exercises/Dips_-_Chest_Version/0.jpg",
  "Fondos asistidos": "/exercises/Dips_-_Chest_Version/0.jpg",
  "Fondos en paralelas lastrados": "/exercises/Ring_Dips/0.jpg",
  "Jalón agarre cerrado": "/exercises/Close-Grip_Front_Lat_Pulldown/0.jpg",
  "Jalón agarre neutro": "/exercises/V-Bar_Pulldown/0.jpg",
  "Jalón al pecho": "/exercises/Wide-Grip_Lat_Pulldown/0.jpg",
  "Mountain climbers": "/exercises/Mountain_Climbers/0.jpg",
  "Peso muerto": "/exercises/Barbell_Deadlift/0.jpg",
  "Peso muerto rumano": "/exercises/Romanian_Deadlift/0.jpg",
  "Peso muerto rumano ligero": "/exercises/Romanian_Deadlift/0.jpg",
  "Peso muerto rumano mancuernas": "/exercises/Stiff-Legged_Dumbbell_Deadlift/0.jpg",
  "Plancha": "/exercises/Plank/0.jpg",
  "Plancha con lastre": "/exercises/Plank/0.jpg",
  "Prensa de piernas": "/exercises/Leg_Press/0.jpg",
  "Press banca": "/exercises/Barbell_Bench_Press_-_Medium_Grip/0.jpg",
  "Press banca o flexiones": "/exercises/Barbell_Bench_Press_-_Medium_Grip/0.jpg",
  "Press francés": "/exercises/Lying_Triceps_Press/0.jpg",
  "Press inclinado con barra": "/exercises/Barbell_Incline_Bench_Press_-_Medium_Grip/0.jpg",
  "Press inclinado mancuernas": "/exercises/Incline_Dumbbell_Press/0.jpg",
  "Press mancuernas sentado": "/exercises/Seated_Dumbbell_Press/0.jpg",
  "Press militar": "/exercises/Standing_Military_Press/0.jpg",
  "Press militar mancuernas": "/exercises/Standing_Dumbbell_Press/0.jpg",
  "Pullover en polea": "/exercises/Straight-Arm_Pulldown/0.jpg",
  "Pájaros en polea": "/exercises/Reverse_Flyes/0.jpg",
  "Remo con barra": "/exercises/Bent_Over_Barbell_Row/0.jpg",
  "Remo con mancuerna": "/exercises/One-Arm_Dumbbell_Row/0.jpg",
  "Remo en máquina": "/exercises/Seated_Cable_Rows/0.jpg",
  "Remo invertido o con mancuerna": "/exercises/Inverted_Row/0.jpg",
  "Plancha lateral": "/exercises/Side_Bridge/0.jpg",
  "Rueda abdominal": "/exercises/Ab_Roller/0.jpg",
  "Sentadilla": "/exercises/Barbell_Squat/0.jpg",
  "Sentadilla búlgara": "/exercises/Split_Squats/0.jpg",
  "Sentadilla frontal": "/exercises/Front_Barbell_Squat/0.jpg",
  "Sentadilla goblet": "/exercises/Goblet_Squat/0.jpg",
  "Zancadas con barra": "/exercises/Dumbbell_Lunges/0.jpg",
  "Zancadas con mancuernas": "/exercises/Dumbbell_Lunges/0.jpg",
  "Hip thrust": "/exercises/Barbell_Hip_Thrust/0.jpg",
  "Puente de glúteo": "/exercises/Butt_Lift_Bridge/0.jpg",
  "Patada de glúteo en polea": "/exercises/One-Legged_Cable_Kickback/0.jpg",
  "Abductores en máquina": "/exercises/Thigh_Abductor/0.jpg",
  "Aductores en máquina": "/exercises/Thigh_Adductor/0.jpg",
  "Peso muerto sumo": "/exercises/Sumo_Deadlift/0.jpg",
  "Sentadilla sumo con mancuerna": "/exercises/Plie_Dumbbell_Squat/0.jpg",
  "Zancada caminando": "/exercises/Bodyweight_Walking_Lunge/0.jpg",
  "Good morning": "/exercises/Good_Morning/0.jpg",
  "Press banca mancuernas": "/exercises/Dumbbell_Bench_Press/0.jpg",
  "Press Arnold": "/exercises/Arnold_Dumbbell_Press/0.jpg",
  "Encogimientos": "/exercises/Dumbbell_Shrug/0.jpg",
  "Curl concentrado": "/exercises/Concentration_Curls/0.jpg",
  "Curl inclinado": "/exercises/Incline_Dumbbell_Curl/0.jpg",
  "Extensión de tríceps sobre cabeza": "/exercises/Standing_Dumbbell_Triceps_Extension/0.jpg",
  "Patada de tríceps": "/exercises/Tricep_Dumbbell_Kickback/0.jpg",
  "Remo en T": "/exercises/Lying_T-Bar_Row/0.jpg",
  "Remo al mentón": "/exercises/Upright_Barbell_Row/0.jpg",
  "Peso muerto piernas rígidas": "/exercises/Stiff-Legged_Barbell_Deadlift/0.jpg",
  "Elevación de talones sentado": "/exercises/Seated_Calf_Raise/0.jpg",
  "Crunch abdominal": "/exercises/Crunches/0.jpg",
  "Russian twist": "/exercises/Russian_Twist/0.jpg",
  "Sentadilla hack": "/exercises/Barbell_Hack_Squat/0.jpg",
  "Dominada supina": "/exercises/Chin-Up/0.jpg",
  "Bicicleta abdominal": "/exercises/Air_Bike/0.jpg",
  /* Cardio de las rutinas de la app: ya tenían nombre pero no demostración. */
  "HIIT en bici o cinta": "/exercises/Running_Treadmill/0.jpg",
  "Calentamiento en cinta o bici": "/exercises/Walking_Treadmill/0.jpg",
  "Superserie de bíceps y tríceps": "/exercises/Dumbbell_Bicep_Curl/0.jpg",
  /* --- Catálogo ampliado (free-exercise-db) --- */
  "Press declinado con barra": "/exercises/Decline_Barbell_Bench_Press/0.jpg",
  "Contractor de pecho": "/exercises/Butterfly/0.jpg",
  "Press de pecho en máquina": "/exercises/Machine_Bench_Press/0.jpg",
  "Flexiones declinadas": "/exercises/Decline_Push-Up/0.jpg",
  "Pullover con mancuerna": "/exercises/Bent-Arm_Dumbbell_Pullover/0.jpg",
  "Hiperextensiones": "/exercises/Hyperextensions_Back_Extensions/0.jpg",
  "Jalón agarre supino": "/exercises/Underhand_Cable_Pulldowns/0.jpg",
  "Remo con dos mancuernas": "/exercises/Bent_Over_Two-Dumbbell_Row/0.jpg",
  "Peso muerto parcial": "/exercises/Rack_Pulls/0.jpg",
  "Encogimientos con barra": "/exercises/Barbell_Shrug/0.jpg",
  "Elevación frontal": "/exercises/Front_Dumbbell_Raise/0.jpg",
  "Press de hombro en máquina": "/exercises/Machine_Shoulder_Military_Press/0.jpg",
  "Press de hombro en polea": "/exercises/Seated_Cable_Shoulder_Press/0.jpg",
  "Pájaros con mancuernas": "/exercises/Bent_Over_Dumbbell_Rear_Delt_Raise_With_Head_On_Bench/0.jpg",
  "Zancada inversa": "/exercises/Dumbbell_Rear_Lunge/0.jpg",
  "Subida al cajón": "/exercises/Dumbbell_Step_Ups/0.jpg",
  "Sentadilla en multipower": "/exercises/Smith_Machine_Squat/0.jpg",
  "Sentadilla con mancuernas": "/exercises/Dumbbell_Squat/0.jpg",
  "Sentadilla con salto": "/exercises/Freehand_Jump_Squat/0.jpg",
  "Sentadilla sin peso": "/exercises/Bodyweight_Squat/0.jpg",
  "Puente de glúteo a una pierna": "/exercises/Single_Leg_Glute_Bridge/0.jpg",
  "Curl nórdico": "/exercises/Natural_Glute_Ham_Raise/0.jpg",
  "Gemelo en prensa": "/exercises/Calf_Press_On_The_Leg_Press_Machine/0.jpg",
  "Elevación de talones con mancuerna": "/exercises/Standing_Dumbbell_Calf_Raise/0.jpg",
  "Curl en polea": "/exercises/Standing_Biceps_Cable_Curl/0.jpg",
  "Curl inverso": "/exercises/Reverse_Barbell_Curl/0.jpg",
  "Curl araña": "/exercises/Spider_Curl/0.jpg",
  "Fondos en banco": "/exercises/Bench_Dips/0.jpg",
  "Extensión de tríceps con cuerda": "/exercises/Cable_Rope_Overhead_Triceps_Extension/0.jpg",
  "Press banca agarre cerrado": "/exercises/Close-Grip_Barbell_Bench_Press/0.jpg",
  "Crunch en polea": "/exercises/Cable_Crunch/0.jpg",
  "Crunch en máquina": "/exercises/Ab_Crunch_Machine/0.jpg",
  "Elevación de rodillas": "/exercises/Bent-Knee_Hip_Raise/0.jpg",
  "Tijeras": "/exercises/Flutter_Kicks/0.jpg",
  "Cinta de correr": "/exercises/Running_Treadmill/0.jpg",
  "Caminar en cinta": "/exercises/Walking_Treadmill/0.jpg",
  "Bici estática": "/exercises/Bicycling_Stationary/0.jpg",
  "Elíptica": "/exercises/Elliptical_Trainer/0.jpg",
  "Máquina de remo": "/exercises/Rowing_Stationary/0.jpg",
  "Comba": "/exercises/Rope_Jumping/0.jpg",
  "Escaladora": "/exercises/Stairmaster/0.jpg",
  /* --- Máquinas y poleas (free-exercise-db) --- */
  "Press inclinado en máquina": "/exercises/Leverage_Incline_Chest_Press/0.jpg",
  "Press declinado en máquina": "/exercises/Leverage_Decline_Chest_Press/0.jpg",
  "Press banca en multipower": "/exercises/Smith_Machine_Bench_Press/0.jpg",
  "Press inclinado en multipower": "/exercises/Smith_Machine_Incline_Bench_Press/0.jpg",
  "Cruce de poleas bajo": "/exercises/Low_Cable_Crossover/0.jpg",
  "Aperturas inclinadas en polea": "/exercises/Incline_Cable_Flye/0.jpg",
  "Press de pecho en polea": "/exercises/Standing_Cable_Chest_Press/0.jpg",
  "Press de pecho en polea sentado": "/exercises/Cable_Chest_Press/0.jpg",
  "Cruce de poleas alto": "/exercises/Cable_Iron_Cross/0.jpg",
  "Press declinado en multipower": "/exercises/Decline_Smith_Press/0.jpg",
  "Aperturas en banco con poleas": "/exercises/Flat_Bench_Cable_Flyes/0.jpg",
  "Press inclinado en polea": "/exercises/Incline_Cable_Chest_Press/0.jpg",
  "Press de pecho en máquina de discos": "/exercises/Leverage_Chest_Press/0.jpg",
  "Cruce de poleas a una mano": "/exercises/Single-Arm_Cable_Crossover/0.jpg",
  "Press declinado guiado": "/exercises/Smith_Machine_Decline_Press/0.jpg",
  "Remo alto en máquina": "/exercises/Leverage_High_Row/0.jpg",
  "Remo en máquina a un brazo": "/exercises/Leverage_Iso_Row/0.jpg",
  "Remo en polea a una mano": "/exercises/Seated_One-arm_Cable_Pulley_Rows/0.jpg",
  "Jalón a una mano": "/exercises/One_Arm_Lat_Pulldown/0.jpg",
  "Remo en multipower": "/exercises/Smith_Machine_Bent_Over_Row/0.jpg",
  "Hiperextensión inversa": "/exercises/Reverse_Hyperextension/0.jpg",
  "Pullover en polea inclinado": "/exercises/Cable_Incline_Pushdown/0.jpg",
  "Remo en polea alto": "/exercises/Elevated_Cable_Rows/0.jpg",
  "Jalón con recorrido completo": "/exercises/Full_Range-Of-Motion_Lat_Pulldown/0.jpg",
  "Remo en polea alta de rodillas": "/exercises/Kneeling_High_Pulley_Row/0.jpg",
  "Remo en polea alta a una mano": "/exercises/Kneeling_Single-Arm_High_Pulley_Row/0.jpg",
  "Pájaros en máquina": "/exercises/Reverse_Machine_Flyes/0.jpg",
  "Elevación frontal en polea": "/exercises/Front_Cable_Raise/0.jpg",
  "Encogimientos en máquina": "/exercises/Leverage_Shrug/0.jpg",
  "Encogimientos en polea": "/exercises/Cable_Shrugs/0.jpg",
  "Press militar en multipower": "/exercises/Smith_Machine_Overhead_Shoulder_Press/0.jpg",
  "Rotación externa en polea": "/exercises/External_Rotation_with_Cable/0.jpg",
  "Press de hombro en polea alterno": "/exercises/Alternating_Cable_Shoulder_Press/0.jpg",
  "Pájaros en polea a una mano": "/exercises/Bent_Over_Low-Pulley_Side_Lateral/0.jpg",
  "Rotación interna en polea": "/exercises/Cable_Internal_Rotation/0.jpg",
  "Pájaros en polea cruzada": "/exercises/Cable_Rear_Delt_Fly/0.jpg",
  "Remo a la cara con cuerda": "/exercises/Cable_Rope_Rear-Delt_Rows/0.jpg",
  "Press de hombro en polea de pie": "/exercises/Cable_Shoulder_Press/0.jpg",
  "Encogimientos en máquina de gemelos": "/exercises/Calf-Machine_Shoulder_Shrug/0.jpg",
  "Press de hombro en máquina de discos": "/exercises/Leverage_Shoulder_Press/0.jpg",
  "Remo al cuello en polea baja": "/exercises/Low_Pulley_Row_To_Neck/0.jpg",
  "Encogimientos tras espalda en multipower": "/exercises/Smith_Machine_Behind_the_Back_Shrug/0.jpg",
  "Remo al mentón a una mano en multipower": "/exercises/Smith_Machine_One-Arm_Upright_Row/0.jpg",
  "Remo al mentón en multipower": "/exercises/Smith_Machine_Upright_Row/0.jpg",
  "Elevación lateral en polea baja": "/exercises/Standing_Low-Pulley_Deltoid_Raise/0.jpg",
  "Remo al mentón en polea": "/exercises/Upright_Cable_Row/0.jpg",
  "Sentadilla hack en máquina": "/exercises/Hack_Squat/0.jpg",
  "Prensa con pies juntos": "/exercises/Narrow_Stance_Leg_Press/0.jpg",
  "Extensión de cuádriceps a una pierna en máquina": "/exercises/Single-Leg_Leg_Extension/0.jpg",
  "Zancada en multipower": "/exercises/Smith_Single-Leg_Split_Squat/0.jpg",
  "Pull through en polea": "/exercises/Pull_Through/0.jpg",
  "Peso muerto en polea": "/exercises/Cable_Deadlifts/0.jpg",
  "Aductores en polea": "/exercises/Cable_Hip_Adduction/0.jpg",
  "Sentadilla en máquina": "/exercises/Chair_Squat/0.jpg",
  "Peso muerto en máquina": "/exercises/Leverage_Deadlift/0.jpg",
  "Sentadilla tumbada en máquina": "/exercises/Lying_Machine_Squat/0.jpg",
  "Sentadilla hack con pies juntos": "/exercises/Narrow_Stance_Hack_Squats/0.jpg",
  "Prensa en multipower": "/exercises/Smith_Machine_Leg_Press/0.jpg",
  "Sentadilla a una pierna en multipower": "/exercises/Smith_Machine_Pistol_Squat/0.jpg",
  "Curl femoral de pie": "/exercises/Standing_Leg_Curl/0.jpg",
  "Peso muerto rumano en multipower": "/exercises/Smith_Machine_Stiff-Legged_Deadlift/0.jpg",
  "Curl nórdico en máquina": "/exercises/Glute_Ham_Raise/0.jpg",
  "Elevación de talones en multipower": "/exercises/Smith_Machine_Calf_Raise/0.jpg",
  "Gemelos en máquina": "/exercises/Calf_Press/0.jpg",
  "Elevación de puntas (tibial)": "/exercises/Smith_Machine_Reverse_Calf_Raises/0.jpg",
  "Curl de bíceps en máquina": "/exercises/Machine_Bicep_Curl/0.jpg",
  "Curl predicador en máquina": "/exercises/Machine_Preacher_Curls/0.jpg",
  "Curl martillo en polea": "/exercises/Cable_Hammer_Curls_-_Rope_Attachment/0.jpg",
  "Curl predicador en polea": "/exercises/Cable_Preacher_Curl/0.jpg",
  "Curl en polea alta": "/exercises/High_Cable_Curls/0.jpg",
  "Curl tumbado en polea": "/exercises/Lying_Cable_Curl/0.jpg",
  "Curl tumbado en polea alta": "/exercises/Lying_Close-Grip_Bar_Curl_On_High_Pulley/0.jpg",
  "Curl sobre la cabeza en polea": "/exercises/Overhead_Cable_Curl/0.jpg",
  "Curl inverso en polea": "/exercises/Reverse_Cable_Curl/0.jpg",
  "Curl en polea a una mano": "/exercises/Standing_One-Arm_Cable_Curl/0.jpg",
  "Extensión de tríceps en máquina": "/exercises/Machine_Triceps_Extension/0.jpg",
  "Fondos en máquina": "/exercises/Dip_Machine/0.jpg",
  "Tríceps en polea con cuerda": "/exercises/Triceps_Pushdown_-_Rope_Attachment/0.jpg",
  "Extensión de tríceps inclinado en polea": "/exercises/Cable_Incline_Triceps_Extension/0.jpg",
  "Press francés en polea": "/exercises/Cable_Lying_Triceps_Extension/0.jpg",
  "Tríceps en polea a una mano": "/exercises/Cable_One_Arm_Tricep_Extension/0.jpg",
  "Extensión de tríceps de rodillas en polea": "/exercises/Kneeling_Cable_Triceps_Extension/0.jpg",
  "Extensión de tríceps en polea baja": "/exercises/Low_Cable_Triceps_Extension/0.jpg",
  "Tríceps en polea agarre invertido": "/exercises/Reverse_Grip_Triceps_Pushdown/0.jpg",
  "Press cerrado en multipower": "/exercises/Smith_Machine_Close-Grip_Bench_Press/0.jpg",
  "Extensión de tríceps sobre cabeza en polea baja": "/exercises/Standing_Low-Pulley_One-Arm_Triceps_Extension/0.jpg",
  "Extensión de tríceps sobre cabeza con cuerda": "/exercises/Triceps_Overhead_Extension_with_Rope/0.jpg",
  "Curl de muñeca en polea": "/exercises/Cable_Wrist_Curl/0.jpg",
  "Curl de muñeca sentado en polea": "/exercises/Seated_Two-Arm_Palms-Up_Low-Pulley_Wrist_Curl/0.jpg",
  "Press Pallof": "/exercises/Pallof_Press/0.jpg",
  "Leñador en polea": "/exercises/Standing_Cable_Wood_Chop/0.jpg",
  "Crunch inverso en polea": "/exercises/Cable_Reverse_Crunch/0.jpg",
  "Giro ruso en polea": "/exercises/Cable_Russian_Twists/0.jpg",
  "Crunch en polea sentado": "/exercises/Cable_Seated_Crunch/0.jpg",
  "Crunch en polea con giro": "/exercises/Kneeling_Cable_Crunch_With_Alternating_Oblique_Twists/0.jpg",
  "Flexión lateral en polea alta": "/exercises/One-Arm_High-Pulley_Cable_Side_Bends/0.jpg",
  "Press Pallof con giro": "/exercises/Pallof_Press_With_Rotation/0.jpg",
  "Crunch en polea con cuerda": "/exercises/Rope_Crunch/0.jpg",
  "Elevación de cadera en multipower": "/exercises/Smith_Machine_Hip_Raise/0.jpg",
  "Leñador invertido en polea": "/exercises/Standing_Cable_Lift/0.jpg",
  "Crunch en polea de pie": "/exercises/Standing_Rope_Crunch/0.jpg",
  "Bici reclinada": "/exercises/Recumbent_Bike/0.jpg",
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
    exercises: (Array.isArray(d?.exercises) ? d.exercises : [])
      .filter(ex=>ex && EX_MUSCLE[ex.name])
      .map(ex=>({ name:ex.name, sets:Math.max(1,Math.min(10,Number(ex.sets)||3)),
        reps:String(ex.reps || defaultReps(ex.name)).slice(0,12),
        rest:Math.max(0,Math.min(600,Number(ex.rest) ?? defaultRest(ex.name))),
        muscle:EX_MUSCLE[ex.name] })),
  }));
  const clean = days.length ? days : [{ name:"Día 1", exercises:[] }];
  return { ...r, custom:true, cat:CUSTOM_CAT, id:r?.id || newRoutineId(),
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
      const [name, sets, reps, rest] = Array.isArray(e) ? e : [];
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
  { id:"volumen_5k", title:"Toneladas", desc:"Mueve 5.000 kg en una sesión", xp:100, icon:Target },
  { id:"volumen_10k", title:"Grúa humana", desc:"Mueve 10.000 kg en una sesión", xp:300, icon:Target },
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
  "Tus cheat days están para disfrutarlos sin culpa. Te los has ganado entrenando.",
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
  if (d && d.length) return d.length;
  return routine?.daysPerWeek || DEFAULT_TRAIN_DAYS.length;
}

/* Racha de hábito que RESPETA los días de descanso: cuenta los días planificados
   (reminders.days) cumplidos de forma consecutiva; los días de descanso no rompen la
   racha ni suman. El día de hoy, si aún no has entrenado, no rompe (el día no ha acabado). */
function habitStreak(log, plannedDays){
  const planned = (plannedDays && plannedDays.length) ? plannedDays : DEFAULT_TRAIN_DAYS;
  const trained = new Set((log||[]).map(r=>r.date));
  let streak=0, d=todayISO(), first=true;
  for(let i=0;i<400;i++){
    if(planned.includes(weekdayOfISO(d))){
      if(trained.has(d)) streak++;
      else if(!first) break;   // día planificado incumplido (que no sea hoy) rompe la racha
    }
    first=false; d=addDaysISO(d,-1);
  }
  return streak;
}
/* Días planificados de ESTA semana ya transcurridos (hasta hoy) y cuántos se cumplieron. */
function weekPlannedStatus(log, plannedDays){
  const planned=(plannedDays&&plannedDays.length)?plannedDays:DEFAULT_TRAIN_DAYS;
  const trained=new Set((log||[]).map(r=>r.date));
  const today=todayISO(), mon=mondayOf(today);
  let plannedCount=0, trainedCount=0;
  for(let i=0;i<7;i++){ const iso=addDaysISO(mon,i); if(iso>today) break; if(planned.includes(weekdayOfISO(iso))){ plannedCount++; if(trained.has(iso)) trainedCount++; } }
  return { plannedThisWeek:plannedCount, trainedPlanned:trainedCount };
}
/* Contexto para evaluar las misiones semanales. */
function missionContext(state, log){
  const ws=state.weekStart;
  const groups=Object.keys(weeklySetsByGroup(log, ws)).length;
  const { plannedThisWeek, trainedPlanned }=weekPlannedStatus(log, state.reminders?.days);
  return { weekPRs:state.weekPRs||0, weekGroups:groups, plannedThisWeek, trainedPlanned };
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
   El cronómetro de pantalla no basta: cuando sales de la app, el WebView congela
   los temporizadores de JavaScript, así que ni avisa ni cuenta bien al volver.
   Hay que programar una notificación REAL (solo funciona en el APK instalado).
   El id va fuera del rango de los recordatorios (1-40) y de la cuota (30). */
const REST_NOTIF_ID = 55;
let permisoPedido = false;
async function programarAvisoDescanso(segundos){
  const ln = LN(); if (!ln || !(segundos > 0)) return;
  if (!permisoPedido) { permisoPedido = true; try { await ensureNotifPerm(); } catch {} }
  try {
    await ln.cancel({ notifications: [{ id: REST_NOTIF_ID }] });
    await ln.schedule({ notifications: [{
      id: REST_NOTIF_ID,
      title: "Descanso terminado 💪",
      body: "A por la siguiente serie.",
      schedule: { at: new Date(Date.now() + segundos * 1000) },
    }] });
  } catch {}
}
async function cancelarAvisoDescanso(){
  const ln = LN(); if (!ln) return;
  try { await ln.cancel({ notifications: [{ id: REST_NOTIF_ID }] }); } catch {}
}

async function scheduleAllReminders(reminders, sub){
  const ln = LN(); if (!ln) return;   // el aviso real solo funciona en la app instalada
  try { await ln.cancel({ notifications: Array.from({ length: 40 }, (_, i) => ({ id: i + 1 })) }); } catch {}
  const notifs = [];
  if (reminders?.enabled) {
    (reminders.days || []).forEach((d, i) => {
      notifs.push({ id: i + 1, title: "Hora de entrenar 💪",
        body: "Tu sesión de hoy te espera. ¡Vamos a por ella!",
        schedule: { on: { weekday: (d % 7) + 1, hour: reminders.hour, minute: reminders.minute }, repeats: true } });
    });
  }
  if (sub?.enabled && sub.renewalDay) {
    const next = nextRenewalDate(sub.renewalDay); const warn = addDaysISO(next, -3);
    notifs.push({ id: 30, title: "Cuota del gym en 3 días",
      body: `El ${next.slice(8,10)}/${next.slice(5,7)} se renueva tu suscripción. Si no vas a seguir, cancélala a tiempo.`,
      schedule: { at: new Date(warn + "T10:00:00") } });
  }
  if (notifs.length) { try { await ln.schedule({ notifications: notifs }); } catch (e) { console.error(e); } }
}

const DEFAULT_STATE = {
  profile:{ name:"Atleta", age:null, weightKg:74, heightCm:178, sex:"no_especificado", units:"kg", experience:"principiante", goal:"iniciarse", onboarded:false },
  xp:0, cheatTokens:0, totalWorkouts:0, weekStreak:0,
  weekStart:mondayOf(todayISO()), weeklyCount:0, weekGoalMet:false,
  activeRoutine:"acli_fb", lastWorkoutDate:null, startDate:todayISO(),
  achievements:{}, bests:{}, firstBests:{}, routinesUsed:[], measureCount:0, muscleXp:{},
  reminders:{ enabled:false, hour:19, minute:0, days:[1,3,5] }, // días 0=Dom..6=Sáb
  sub:{ enabled:false, renewalDay:1, price:"" },
  cardioBests:{},               // récords de cardio por ejercicio: { min, km, kcal, level, pace, date }
  bestStreak:0,                 // récord de racha de hábito (días)
  weekPRs:0,                    // récords personales conseguidos esta semana
  nextWeight:{},                // progresión: peso sugerido para la próxima sesión por ejercicio
  missions:{ week:null, claimed:[] }, // misiones semanales completadas (por semana)
  cycle:{ enabled:false, lastPeriodStart:null, cycleLength:28, periodLength:5 }, // ciclo menstrual (opt-in)
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
  { id:"sinfaltar", title:"Sin faltar", desc:"Cumple todos tus días de entreno planificados de la semana", xp:120, icon:Flame,
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

/* Versión de esta build. Debe ir a la par de android/version.properties: es lo
   que compara la app contra app_versions para avisar de que hay una nueva. */
/* XP extra la primera vez que haces la rutina de un amigo. Fijo y modesto:
   premia probar lo de otro, no repetirlo en bucle. */
const XP_RUTINA_AMIGO = 75;

const APP_VERSION_CODE = 1;
const APP_VERSION_NAME = "1.0.0";

/* Claves que entran en la copia de seguridad (todo el progreso del perfil) */
const BACKUP_KEYS = ["gym:state","gym:log","gym:measures","gym:mealplan","gym:excludes","gym:routines","gym:customdiet"];
const BACKUP_APP = "rpgym";
const BACKUP_APP_LEGACY = "forja-habito";   // copias hechas con el nombre antiguo
const BACKUP_FORMAT = 1;

/* Claves globales (no dependen del perfil activo) */
async function loadGlobal(key, fb){ try{ const r=await window.storage.get(key); return r?JSON.parse(r.value):fb; }catch{ return fb; } }
async function saveGlobal(key, val){ try{ await window.storage.set(key, JSON.stringify(val)); }catch(e){ console.error(e); } }

/* =========================================================================
   ESTILOS
   ========================================================================= */

const StyleTag = () => (
  <style>{`
    /* Fuentes AUTO-ALOJADAS en public/fonts (subconjunto latin). Antes se cargaban por
       @import desde fonts.googleapis.com, lo que suponía una llamada a Google en cada
       arranque: rompía el "100% offline" y obligaba a declararlo en la política de
       privacidad. NO vuelvas a poner el @import remoto. */
    @font-face{font-family:'Cinzel';font-style:normal;font-weight:500;font-display:swap;src:url('/fonts/cinzel-500.woff2') format('woff2');}
    @font-face{font-family:'Cinzel';font-style:normal;font-weight:600;font-display:swap;src:url('/fonts/cinzel-600.woff2') format('woff2');}
    @font-face{font-family:'Cinzel';font-style:normal;font-weight:700;font-display:swap;src:url('/fonts/cinzel-700.woff2') format('woff2');}
    @font-face{font-family:'Cinzel';font-style:normal;font-weight:800;font-display:swap;src:url('/fonts/cinzel-800.woff2') format('woff2');}
    @font-face{font-family:'Cinzel';font-style:normal;font-weight:900;font-display:swap;src:url('/fonts/cinzel-900.woff2') format('woff2');}
    @font-face{font-family:'Space Grotesk';font-style:normal;font-weight:400;font-display:swap;src:url('/fonts/space-grotesk-400.woff2') format('woff2');}
    @font-face{font-family:'Space Grotesk';font-style:normal;font-weight:500;font-display:swap;src:url('/fonts/space-grotesk-500.woff2') format('woff2');}
    @font-face{font-family:'Space Grotesk';font-style:normal;font-weight:600;font-display:swap;src:url('/fonts/space-grotesk-600.woff2') format('woff2');}
    @font-face{font-family:'Space Grotesk';font-style:normal;font-weight:700;font-display:swap;src:url('/fonts/space-grotesk-700.woff2') format('woff2');}
    @font-face{font-family:'Inter';font-style:normal;font-weight:400;font-display:swap;src:url('/fonts/inter-400.woff2') format('woff2');}
    @font-face{font-family:'Inter';font-style:normal;font-weight:500;font-display:swap;src:url('/fonts/inter-500.woff2') format('woff2');}
    @font-face{font-family:'Inter';font-style:normal;font-weight:600;font-display:swap;src:url('/fonts/inter-600.woff2') format('woff2');}
    @font-face{font-family:'JetBrains Mono';font-style:normal;font-weight:600;font-display:swap;src:url('/fonts/jetbrains-mono-600.woff2') format('woff2');}
    @font-face{font-family:'JetBrains Mono';font-style:normal;font-weight:700;font-display:swap;src:url('/fonts/jetbrains-mono-700.woff2') format('woff2');}
    * { box-sizing:border-box; -webkit-tap-highlight-color:transparent; }
    .fh { --bg:#0C0E14; --bg2:#12151E; --card:#181D29; --card2:#212838; --line:#2B3346; --line2:#3B455E;
      --txt:#ECE6D8; --muted:#9A94A8; --faint:#63607A;
      --gold:#E8B04B; --amber:#F0A830; --ember:#E5623D; --crimson:#D24B4B; --blood:#9E2B2B;
      --jade:#3FB984; --emerald:#3FB984; --violet:#B78BFF; --arcane:#B78BFF; --sky:#5BA8C9; --mana:#5BA8C9;
      font-family:'Inter',system-ui,sans-serif; color:var(--txt); min-height:100vh; background-attachment:fixed;
      background:radial-gradient(1100px 520px at 50% -8%,rgba(183,139,255,.10),transparent 62%),radial-gradient(900px 520px at 50% 112%,rgba(232,176,75,.06),transparent 60%),#0C0E14; }
    .fh h1 { font-family:'Cinzel',serif; letter-spacing:.01em; font-weight:700; }
    .fh .cinzel { font-family:'Cinzel',serif; letter-spacing:.02em; }
    .fh h2,.fh h3,.fh .disp { font-family:'Space Grotesk',sans-serif; letter-spacing:-.02em; }
    .fh .mono { font-family:'JetBrains Mono',monospace; }
    .fh-shell { max-width:480px; margin:0 auto; padding:0 16px 96px; }
    .fh-card { background:var(--card); border:1px solid var(--line); border-radius:18px; }
    .fh-btn { font-family:'Space Grotesk',sans-serif; font-weight:600; border:none; cursor:pointer; border-radius:12px;
      transition:transform .08s,filter .15s; color:#0F131A; }
    .fh-btn:active { transform:scale(.97); }
    .fh-btn:disabled { cursor:default; }
    .fh-btn:focus-visible,.fh input:focus-visible,.fh select:focus-visible,.fh textarea:focus-visible { outline:2px solid var(--gold); outline-offset:2px; }
    .fh-nav { position:fixed; bottom:0; left:0; right:0; z-index:50; background:rgba(15,19,26,.92);
      backdrop-filter:blur(12px); border-top:1px solid var(--line); display:flex; justify-content:center; }
    .fh-nav-inner { max-width:480px; width:100%; display:flex; padding:8px 4px calc(8px + env(safe-area-inset-bottom)); }
    .fh-nav button { flex:1; background:none; border:none; cursor:pointer; color:var(--faint); display:flex;
      flex-direction:column; align-items:center; gap:3px; font-size:10px; font-weight:600; padding:6px 0;
      font-family:'Space Grotesk',sans-serif; transition:color .15s; }
    .fh-nav button.on { color:var(--gold); }
    @keyframes fh-slide { from{transform:translateY(12px);opacity:0} to{transform:translateY(0);opacity:1} }
    @keyframes fh-glow { 0%,100%{box-shadow:0 0 24px -6px var(--gold)} 50%{box-shadow:0 0 40px 0 var(--gold)} }
    @keyframes fh-pop { 0%{transform:scale(.7);opacity:0} 60%{transform:scale(1.06)} 100%{transform:scale(1);opacity:1} }
    .fh-in { animation:fh-slide .28s ease both; }
    .fh-pop { animation:fh-pop .4s ease both; }
    .fh input,.fh select,.fh textarea { background:var(--bg2); border:1px solid var(--line); color:var(--txt); border-radius:10px;
      padding:10px 12px; font-family:'JetBrains Mono',monospace; font-size:16px; width:100%; text-align:center; }
    .fh textarea { font-family:'Inter',system-ui,sans-serif; font-size:14px; text-align:left; line-height:1.5;
      resize:vertical; min-height:74px; }
    .fh select { font-family:'Space Grotesk',sans-serif; text-align:left; -webkit-appearance:none; appearance:none;
      background-image:linear-gradient(45deg,transparent 50%,var(--muted) 50%),linear-gradient(135deg,var(--muted) 50%,transparent 50%);
      background-position:calc(100% - 16px) 50%,calc(100% - 11px) 50%; background-size:5px 5px,5px 5px; background-repeat:no-repeat; padding-right:32px; }
    .fh input:focus,.fh select:focus,.fh textarea:focus { outline:none; border-color:var(--gold); }
    .fh-chip { font-size:11px; padding:3px 9px; border-radius:999px; font-weight:600; }
    .fh-card { position:relative; }
    .fh-card::before { content:""; position:absolute; inset:0; border-radius:inherit; pointer-events:none; box-shadow:inset 0 1px 0 rgba(255,255,255,.04); }
    .fh-framed { border-color:var(--gold)!important; box-shadow:0 0 0 1px rgba(232,176,75,.15),0 12px 34px -14px rgba(0,0,0,.75); background:linear-gradient(160deg,var(--card),var(--card2)); }
    .fh-btn { box-shadow:0 1px 0 rgba(0,0,0,.35); }
    .fh-stat { display:flex; align-items:center; gap:12px; padding:11px 0; border-top:1px solid var(--line); }
    .fh-bar { height:8px; background:var(--bg2); border-radius:99px; overflow:hidden; border:1px solid var(--line); }
    .fh-bar > i { display:block; height:100%; border-radius:99px; transition:width .6s ease; }
    @media (prefers-reduced-motion:reduce){ .fh-in,.fh-pop,*{animation:none!important} }

    /* ---- Tema claro (pergamino cálido, conserva los acentos RPG) ---- */
    .fh[data-theme="light"] {
      --bg:#F3EEE3; --bg2:#FBF9F3; --card:#FFFFFF; --card2:#F5EFE2; --line:#E4DCCB; --line2:#D3C9B3;
      --txt:#2B2620; --muted:#6E6656; --faint:#A69E8C;
      --gold:#B8862B; --amber:#C4881C; --ember:#C7492A; --crimson:#BE3F3F; --blood:#8E2323;
      --jade:#2E8C63; --emerald:#2E8C63; --violet:#7C5BD6; --arcane:#7C5BD6; --sky:#3E86A8; --mana:#3E86A8;
      background:radial-gradient(1100px 520px at 50% -8%,rgba(124,91,214,.10),transparent 62%),radial-gradient(900px 520px at 50% 112%,rgba(184,134,43,.09),transparent 60%),#F3EEE3;
    }
    .fh[data-theme="light"] .fh-nav { background:rgba(251,249,243,.92); }
    .fh[data-theme="light"] .fh-card::before { box-shadow:inset 0 1px 0 rgba(0,0,0,.02); }
    .fh[data-theme="light"] .fh-btn { box-shadow:0 1px 0 rgba(0,0,0,.07); }
    .fh[data-theme="light"] .fh-framed { box-shadow:0 0 0 1px rgba(184,134,43,.2),0 12px 30px -16px rgba(0,0,0,.28); }
  `}</style>
);

/* =========================================================================
   PEQUEÑOS COMPONENTES
   ========================================================================= */

function Ring({ pct, size=116, stroke=9, color="var(--gold)", track="var(--line)", children }){
  const r=(size-stroke)/2, c=2*Math.PI*r;
  return (
    <div style={{ position:"relative", width:size, height:size }}>
      <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={track} strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={c} strokeDashoffset={c-c*Math.min(pct,1)} strokeLinecap="round"
          style={{ transition:"stroke-dashoffset .6s ease" }}/>
      </svg>
      <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>{children}</div>
    </div>
  );
}

function Toast({ toast }){
  if(!toast) return null;
  const C = toast.icon || Sparkles;
  return (
    <div style={{ position:"fixed", top:16, left:0, right:0, zIndex:100, display:"flex", justifyContent:"center", padding:"0 16px", pointerEvents:"none" }}>
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

/* Temporizador de descanso: pop-up a pantalla completa que bloquea el avance */
function RestTimer({ seconds, onDone, isRecomp }){
  const pool = isRecomp ? RECOMP_TIPS : TIPS;
  const [endsAt, setEndsAt] = useState(() => Date.now() + seconds * 1000);
  const [left, setLeft] = useState(seconds);
  const [tip, setTip] = useState(() => pick(pool));

  // Al abrir el descanso: fija la hora de fin y programa el aviso del sistema.
  // Al cerrarlo (terminado o saltado) se cancela, para no avisar de más.
  useEffect(()=>{
    setEndsAt(Date.now() + seconds * 1000); setLeft(seconds); setTip(pick(pool));
    programarAvisoDescanso(seconds);
    return ()=>{ cancelarAvisoDescanso(); };
  },[seconds]);

  // El tiempo se calcula contra el RELOJ, no restando de uno en uno. Así, al volver
  // de segundo plano —donde el WebView congela los temporizadores— el número es real
  // en vez de haberse quedado parado donde lo dejaste.
  useEffect(()=>{
    const t=setInterval(()=>{
      const q=Math.max(0, Math.round((endsAt - Date.now())/1000));
      setLeft(q);
      if(q<=0){ clearInterval(t); onDone && onDone(); }
    }, 250);
    return ()=>clearInterval(t);
  },[endsAt]);

  /* +15 s: mueve la hora de fin y reprograma el aviso. */
  function mas15(){
    const nuevo = endsAt + 15000;
    setEndsAt(nuevo);
    programarAvisoDescanso(Math.round((nuevo - Date.now())/1000));
  }
  const mm=String(Math.floor(left/60)).padStart(2,"0"), ss=String(left%60).padStart(2,"0");
  const pct = seconds? left/seconds : 0;
  // Portal al root .fh: evita que un ancestro con transform (animación .fh-in) rompa el position:fixed.
  const target = (typeof document!=="undefined" && document.getElementById("rpgym-root")) || (typeof document!=="undefined" ? document.body : null);
  const overlay = (
    <div style={{ position:"fixed", inset:0, zIndex:200, background:"rgba(6,8,13,.9)", backdropFilter:"blur(7px)", display:"flex", alignItems:"center", justifyContent:"center", padding:22 }}>
      <div className="fh-card fh-pop" style={{ padding:26, borderColor:"var(--ember)", background:"linear-gradient(160deg,var(--card),var(--card2))", maxWidth:420, width:"100%", textAlign:"center" }}>
        <div style={{ fontSize:11, color:"var(--muted)", fontWeight:700, letterSpacing:".14em", marginBottom:16 }}>DESCANSO</div>
        <div style={{ display:"flex", justifyContent:"center", marginBottom:18 }}>
          <Ring pct={pct} size={168} stroke={11} color="var(--ember)">
            <div className="mono" style={{ fontSize:40, fontWeight:700, lineHeight:1 }}>{mm}:{ss}</div>
            <div style={{ fontSize:10, color:"var(--muted)", fontWeight:600, marginTop:4 }}>RECUPÉRATE</div>
          </Ring>
        </div>
        <div className="fh-card" style={{ padding:15, background:"var(--bg2)", textAlign:"left", marginBottom:16 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, color:"var(--gold)", fontSize:10, fontWeight:700, letterSpacing:".1em", marginBottom:6 }}>
            <Lightbulb size={13}/> CONSEJO
          </div>
          <div style={{ fontSize:13.5, lineHeight:1.5, color:"var(--txt)" }}>{tip}</div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button className="fh-btn" style={{ flex:1, background:"var(--card2)", color:"var(--txt)", padding:13, border:"1px solid var(--line2)" }} onClick={mas15}>+15 s</button>
          <button className="fh-btn" style={{ flex:1, background:"var(--card2)", color:"var(--muted)", padding:13, border:"1px solid var(--line2)" }} onClick={()=>setTip(pick(pool))}>Otro consejo</button>
          <button className="fh-btn" style={{ flex:1, background:"var(--ember)", color:"#fff", padding:13, display:"flex", alignItems:"center", justifyContent:"center", gap:5 }} onClick={onDone}><SkipForward size={16}/> Saltar</button>
        </div>
        <div style={{ fontSize:11, color:"var(--faint)", marginTop:12 }}>Termina o salta el descanso para seguir con el siguiente ejercicio.</div>
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
  const [customDiet, setCustomDietState] = useState(blankCustomDiet);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [theme, setThemeState] = useState("dark");
  const [session, setSession] = useState(null);
  const [results, setResults] = useState(null);
  const [routineDraft, setRoutineDraft] = useState(null);   // rutina que se está configurando
  /* --- Nube (opcional). Si no hay credenciales, todo esto se queda a null y la
     app va 100% local, exactamente como antes. Ver ROADMAP-SOCIAL.md. --- */
  const [cloudSession, setCloudSession] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [updateInfo, setUpdateInfo] = useState(null);
  const [publicadas, setPublicadas] = useState([]);   // ids de mis rutinas visibles para amigos
  const [quedadas, setQuedadas] = useState([]);
  const [novedades, setNovedades] = useState([]);
  const [cargandoQuedadas, setCargandoQuedadas] = useState(false);
  const [draftIsNew, setDraftIsNew] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const level = levelFromXp(state.xp);
  const rank = rankFor(level);

  const showToast = useCallback((t)=>{ setToast(t); clearTimeout(toastTimer.current); toastTimer.current=setTimeout(()=>setToast(null),3400); },[]);

  useEffect(()=>{ (async()=>{
    const savedTheme = await loadGlobal("gym:theme", "dark");
    setThemeState(savedTheme);
    setStorePrefix("");            // usuario único (sin prefijo, conserva datos previos)
    await loadProfileData();
    setLoading(false);
  })(); },[]);

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
      if(ses){
        const p = await cloud.miPerfil();
        if(vivo && p.ok) setPerfil(p.perfil);
        cloud.ping();                                   // keep-alive, sin esperar
        const pub = await cloud.misRutinasPublicadas();
        if(vivo && pub.ok) setPublicadas(pub.ids);
        const q = await cloud.listarQuedadas();
        if(vivo && q.ok) setQuedadas(q.quedadas);
        // Novedades desde la última visita. La marca es local: no hace falta
        // guardar en el servidor cuándo abriste la app por última vez.
        const desde = await loadGlobal("gym:ultimaVisita", null);
        const nv = await cloud.novedades(desde);
        if(vivo && nv.ok) setNovedades(nv.novedades);
        saveGlobal("gym:ultimaVisita", new Date().toISOString());
      }
      const v = await cloud.versionMasNueva(APP_VERSION_CODE);
      if(vivo && v.ok && v.hayNueva) setUpdateInfo(v.version);
    })();
    const off = cloud.onAuthChange(async(ses)=>{
      if(!vivo) return;
      setCloudSession(ses);
      if(!ses){ setPerfil(null); return; }
      const p = await cloud.miPerfil();
      if(vivo && p.ok) setPerfil(p.perfil);
      cloud.ping();
    });
    return ()=>{ vivo=false; off(); };
  },[]);

  const persist = useCallback((ns,nl,nm)=>{ saveKey("gym:state",ns); if(nl) saveKey("gym:log",nl); if(nm) saveKey("gym:measures",nm); },[]);

  function setTheme(t){ setThemeState(t); saveGlobal("gym:theme", t); }

  // Sincroniza fondo del body, color-scheme y barra de estado (Android) con el tema.
  useEffect(()=>{
    const dark = theme !== "light";
    const bg = dark ? "#0C0E14" : "#F3EEE3";
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
    const merged = { ...DEFAULT_STATE, ...s,
      profile: { ...DEFAULT_STATE.profile, ...(s.profile || {}) },
      reminders: { ...DEFAULT_STATE.reminders, ...(s.reminders || {}) },
      sub: { ...DEFAULT_STATE.sub, ...(s.sub || {}) },
      missions: { ...DEFAULT_STATE.missions, ...(s.missions || {}) },
      cycle: { ...DEFAULT_STATE.cycle, ...(s.cycle || {}) } };
    // Arrastra los nombres de ejercicio que se hayan corregido desde la última versión.
    const mig = migrarNombres({ state:merged, log:l, customRoutines:(Array.isArray(cr)?cr:[]) });
    if(mig.tocado){ saveKey("gym:state", mig.state); saveKey("gym:log", mig.log); saveKey("gym:routines", mig.customRoutines); }

    setState(mig.state); setLog(mig.log); setMeasures(m); setMealPlan(mp); setExcludesState(exc);
    setCustomRoutinesState(mig.customRoutines.map(normalizeCustomRoutine));
    setCustomDietState(normalizeCustomDiet(cd));
    setNeedsOnboarding(!mig.state.profile?.onboarded);
    scheduleAllReminders(mig.state.reminders, mig.state.sub);
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
    setState(ns); persist(ns); scheduleAllReminders(reminders, ns.sub);
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
    for (const k of BACKUP_KEYS) { try { const r = await window.storage.get(k); data[k] = r ? r.value : null; } catch { data[k] = null; } }
    return JSON.stringify({ app:BACKUP_APP, format:BACKUP_FORMAT, exportedAt:new Date().toISOString(), theme, data });
  }
  async function importBackup(text){
    let obj;
    try { obj = JSON.parse(String(text||"").trim()); } catch { return { ok:false, msg:"Eso no es una copia válida (no se puede leer)." }; }
    if ((obj?.app !== BACKUP_APP && obj?.app !== BACKUP_APP_LEGACY) || !obj.data) return { ok:false, msg:"Esa copia no es de RPGym." };
    for (const k of BACKUP_KEYS) {
      const v = obj.data[k];
      try { if (v == null) await window.storage.delete(k); else await window.storage.set(k, v); } catch {}
    }
    if (obj.theme) setTheme(obj.theme);
    await loadProfileData();
    setSession(null); setResults(null); setTab("home");
    return { ok:true, msg:"Progreso restaurado." };
  }
  function setReminders(r){ const ns = { ...state, reminders: r }; setState(ns); persist(ns); scheduleAllReminders(r, ns.sub); }
  function setSub(s){ const ns = { ...state, sub: s }; setState(ns); persist(ns); scheduleAllReminders(ns.reminders, s); }
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
      routineId, routineName:routine.name, dayName:day.name, rpe:routine.rpe, energy: cph?.energy || "normal",
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
  }

  function finishWorkout(){
    let volume=0, xpBase=100, xpSets=0, xpPr=0, prs=0, seriesDone=0;
    const bests={ ...state.bests }, firstBests={ ...state.firstBests };
    let doubled=false; const prList=[];
    session.exercises.forEach(ex=>{
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
    session.exercises.forEach(ex=>{
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
    session.exercises.forEach(ex=>{ const catg=BODY_MAP[ex.muscle]; if(!catg) return;
      const cardioTime=tracksTime(ex);
      ex.logs.forEach(l=>{ if(l.done){ const w=parseFloat(l.weight)||0, reps=parseInt(l.reps)||0;
        // Cardio continuo: sin kilos que contar, la XP sale de los minutos aguantados.
        const bonus = cardioTime ? Math.round(reps/3) : Math.round((w*reps)/120);
        mGains[catg]=(mGains[catg]||0)+10+bonus; } }); });
    Object.entries(mGains).forEach(([c,g])=>{ const before=catLevel(muscleXp[c]||0); muscleXp[c]=(muscleXp[c]||0)+g;
      const after=catLevel(muscleXp[c]); if(after>before) muscleLevelUps.push({ cat:c, level:after }); });

    const goal = weeklyGoalFor(state, findRoutine(state.activeRoutine, customRoutines));
    let weeklyCount=state.weeklyCount+1, weekGoalMet=state.weekGoalMet, weekStreak=state.weekStreak, cheatTokens=state.cheatTokens;
    let xpGoal=0, goalJustMet=false;
    if(!weekGoalMet && weeklyCount>=goal){ weekGoalMet=true; goalJustMet=true; weekStreak+=1; cheatTokens+=1; xpGoal=200; }

    const totalWorkouts=state.totalWorkouts+1;
    const routinesUsed = state.routinesUsed.includes(session.routineId) ? state.routinesUsed : [...state.routinesUsed, session.routineId];
    const prevLevel=level;
    const sessionXp = xpBase+xpSets+xpPr+xpGoal;
    const hour=new Date().getHours();

    // Comparación con la última sesión igual
    const prevSame=[...log].reverse().find(s=>s.routineName===session.routineName && s.dayName===session.dayName);
    const volDelta = prevSame ? Math.round(((volume-prevSame.volume)/(prevSame.volume||1))*100) : null;

    // Logros
    const ach={ ...state.achievements }; const unlocked=[];
    const tentXp=state.xp+sessionXp; const tentLevel=levelFromXp(tentXp);
    const U=(id,cond)=>{ if(!ach[id]&&cond){ ach[id]=todayISO(); unlocked.push(ACHIEVEMENTS.find(a=>a.id===id)); } };
    U("primer_paso", totalWorkouts>=1); U("diez_ses", totalWorkouts>=10); U("treinta_ses", totalWorkouts>=30);
    U("cincuenta_ses", totalWorkouts>=50); U("cien_ses", totalWorkouts>=100);
    U("primer_pr", prs>0||Object.keys(bests).length>=1); U("pr_5", prs>=5);
    U("volumen_5k", volume>=5000); U("volumen_10k", volume>=10000);
    U("semana_ok", weekGoalMet); U("racha_4", weekStreak>=4); U("racha_8", weekStreak>=8);
    U("nivel_10", tentLevel>=10); U("nivel_20", tentLevel>=20); U("nivel_35", tentLevel>=35);
    U("fuerza_x2", doubled); U("explorador", routinesUsed.length>=5);
    U("madrugador", hour<8); U("nocturno", hour>=22);
    U("medidor", state.measureCount>=4);

    let achXp=0; unlocked.forEach(a=>achXp+=a.xp);

    // Progresión de peso (doble progresión): si completas TODAS las series al tope del rango, sube el peso la próxima vez.
    const nextWeight={ ...(state.nextWeight||{}) }; const progressed=[];
    session.exercises.forEach(ex=>{
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
      volume:Math.round(volume), xp:sessionXp+achXp, series:seriesDone, energy:session.energy,
      exercises:session.exercises.map(e=>({ name:e.name, muscle:e.muscle, logs:e.logs.filter(l=>l.done).map(l=>{
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
    const newStreak=habitStreak(nlog, state.reminders?.days);
    const bestStreak=Math.max(state.bestStreak||0, newStreak);

    const finalXp=state.xp+sessionXp+achXp+missionXp+xpAmigo; const finalLevel=levelFromXp(finalXp);

    const ns={ ...state, xp:finalXp, cheatTokens, totalWorkouts, weeklyCount, weekGoalMet, weekStreak,
      lastWorkoutDate:todayISO(), achievements:ach, bests, firstBests, routinesUsed, muscleXp,
      nextWeight, weekPRs, missions, bestStreak, cardioBests };
    setState(ns); setLog(nlog); persist(ns,nlog);

    setResults({
      routineName:session.routineName, dayName:session.dayName, durationMin, seriesDone,
      volume:Math.round(volume), xpBase, xpSets, xpPr, xpGoal, missionXp, achXp, xpAmigo, amigoDe, sessionXp:sessionXp+achXp+missionXp+xpAmigo,
      prs:prList, volDelta, unlocked, cheatEarned:goalJustMet, levelUp: finalLevel>prevLevel ? finalLevel : null,
      muscleLevelUps, mGains, progressed, missionsDone, newStreak, bestStreak, bestStreakBeat: newStreak>(state.bestStreak||0),
      rankName: rankFor(finalLevel).name,
    });
    setSession(null); setTab("results");

    // Sube el estado de juego para la clasificación (si hay cuenta). Sin bloquear.
    // El detalle del entreno NO sale del móvil: solo fecha y XP para los periodos.
    if(cloud.cloudEnabled && perfil){
      cloud.sincronizarPerfil({ level:finalLevel, xp:finalXp, totalWorkouts, bestStreak,
        displayName:state.profile?.name, appVersion:APP_VERSION_NAME });
      cloud.registrarEntreno({ clientId:`${record.date}-${session.startedAt}`,
        day:record.date, xp:record.xp, prs:prList.length });
    }
  }

  function addMeasurement(m){
    const nm=[...measures,m].sort((a,b)=>a.date.localeCompare(b.date));
    const ns={ ...state, profile:{ ...state.profile, weightKg:m.weightKg }, measureCount:(state.measureCount||0)+1 };
    setMeasures(nm); setState(ns); persist(ns,null,nm);
    showToast({ title:"Medición guardada", sub:"El progreso se nota antes en los números que en el espejo", icon:Ruler });
  }
  function useCheat(){ if(state.cheatTokens<=0) return; const ns={ ...state, cheatTokens:state.cheatTokens-1 }; setState(ns); persist(ns); showToast({ title:"¡Que aproveche!", sub:"Cheat day canjeado. Te lo has ganado.", icon:Cookie }); }
  function setActiveRoutine(id){ const ns={ ...state, activeRoutine:id }; setState(ns); persist(ns); }
  function saveMealPlan(mp){ setMealPlan(mp); saveKey("gym:mealplan", mp); }
  function setExcludes(next){ setExcludesState(next); saveKey("gym:excludes", next); }

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
      const r = await cloud.publicarRutina({ clientId:routine.id, name:routine.name, dias:routine.days.length, payload });
      if(r.ok){ setPublicadas(p => [...p, routine.id]);
        showToast({ title:"Compartida con tus amigos", sub:`${routine.name} ya aparece en su lista.`, icon:Users }); }
      else showToast({ title:"No se ha podido compartir", sub:r.msg, icon:ShieldAlert });
    }
  }

  /* --- Rutinas propias (configurador) --- */
  function saveCustomRoutine(routine){
    const r = normalizeCustomRoutine(routine);
    const exists = customRoutines.some(x=>x.id===r.id);
    const next = exists ? customRoutines.map(x=>x.id===r.id ? r : x) : [...customRoutines, r];
    setCustomRoutinesState(next); saveKey("gym:routines", next);
    showToast({ title: exists ? "Rutina actualizada" : "Rutina creada", sub:`${r.name} · ${r.days.length} día${r.days.length===1?"":"s"}`, icon:ClipboardList });
    return r;
  }
  /* --- Cuenta (opcional) ------------------------------------------------- */
  async function entrarCuenta(datos){
    const r = await cloud.entrar(datos);
    if(r.ok){
      // El perfil puede no existir aún si se registró y confirmó el correo fuera.
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
  async function salirCuenta(){
    await cloud.salir();
    setCloudSession(null); setPerfil(null);
    showToast({ title:"Sesión cerrada", sub:"Tu progreso sigue en este móvil.", icon:Lock });
  }
  /* Sube SOLO lo que se ve en la clasificación. Nada de peso, medidas ni ciclo. */
  function subirPerfil(p){
    if(!cloud.cloudEnabled || !(p || perfil)) return;
    cloud.sincronizarPerfil({
      level: levelFromXp(state.xp), xp: state.xp,
      totalWorkouts: state.totalWorkouts, bestStreak: state.bestStreak || 0,
      displayName: state.profile?.name, appVersion: APP_VERSION_NAME,
    });
  }

  /* Mete una rutina que te han compartido (ya viene validada por decodeRoutine). */
  function importRoutine(routine){
    const next = [...customRoutines, normalizeCustomRoutine(routine)];   // conserva sharedFrom si viene
    setCustomRoutinesState(next); saveKey("gym:routines", next);
    showToast({ title:"Rutina importada", sub:`${routine.name} · ${routine.days.length} día${routine.days.length===1?"":"s"}`, icon:Download });
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
    <div className="fh" data-theme={theme} style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh" }}>
      <StyleTag/>
      <div style={{ textAlign:"center", color:"var(--muted)" }}><Dumbbell size={30} color="var(--gold)"/><div className="disp" style={{ marginTop:10 }}>Cargando tu progreso…</div></div>
    </div>
  );

  if(needsOnboarding) return (
    <div className="fh" data-theme={theme}>
      <StyleTag/>
      <OnboardingWizard onDone={completeOnboarding} initial={state.profile} importBackup={importBackup}/>
    </div>
  );

  return (
    <div className="fh" id="rpgym-root" data-theme={theme}>
      <StyleTag/>
      <Toast toast={toast}/>
      <div className="fh-shell">
        {tab==="home" && <HomeView {...{ state, level, rank, log, useCheat, setTab, setActiveRoutine, customRoutines,
          cloudEnabled:cloud.cloudEnabled, perfil, updateInfo, onCloseUpdate:()=>setUpdateInfo(null), quedadas, novedades, onCerrarNovedades:()=>setNovedades([]) }}/>}
        {tab==="rutinas" && <RoutinesView {...{ state, level, setActiveRoutine, startWorkout, customRoutines, editRoutine, deleteCustomRoutine, importRoutine, perfil, publicadas, onPublicar:publicarRutina }}/>}
        {tab==="ficha" && <CharacterView {...{ state, level, rank, log, customRoutines }}/>}
        {tab==="workout" && <WorkoutView {...{ session, setSession, finishWorkout, setTab, log, weekStart:state.weekStart, bests:state.cardioBests }}/>}
        {tab==="results" && <ResultsView {...{ results, setTab, level, rank }}/>}
        {tab==="progreso" && <ProgressView {...{ state, log, measures, addMeasurement, customRoutines }}/>}
        {tab==="logros" && <AchievementsView {...{ state, level }}/>}
        {tab==="dieta" && <DietView {...{ state, useCheat, mealPlan, saveMealPlan, excludes, setExcludes, setTab, customDiet, saveCustomDiet }}/>}
        {tab==="editor" && <RoutineBuilderView {...{ draft:routineDraft, setDraft:setRoutineDraft, onSave:saveRoutineFromEditor, onCancel:closeEditor, isNew:draftIsNew }}/>}
        {tab==="ajustes" && <SettingsView {...{ state, updateProfile, setReminders, setSub, setCycle, setTab, theme, setTheme, resetProgress, exportBackup, importBackup }}/>}
        {tab==="cuenta" && <AccountView {...{ state, level, setTab, session:cloudSession, perfil,
          onEntrar:entrarCuenta, onRegistrar:registrarCuenta, onSalir:salirCuenta, onRefrescar:(p,soloAmigos)=>cloud.leaderboard(p, soloAmigos),
          quedadas, onRefrescarQuedadas:refrescarQuedadas, cargandoQuedadas }}/>}
      </div>

      {tab!=="workout" && tab!=="results" && tab!=="editor" && (
        <nav className="fh-nav"><div className="fh-nav-inner">
          {[{id:"home",icon:Home,label:"Inicio"},{id:"rutinas",icon:Dumbbell,label:"Rutinas"},{id:"ficha",icon:ScrollText,label:"Ficha"},{id:"progreso",icon:TrendingUp,label:"Progreso"},{id:"logros",icon:Trophy,label:"Logros"},{id:"dieta",icon:Utensils,label:"Dieta"}].map(t=>{
            const I=t.icon; return <button key={t.id} className={tab===t.id?"on":""} onClick={()=>setTab(t.id)}><I size={20}/><span>{t.label}</span></button>;
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
      <button className="fh-btn" onClick={()=>setTab("cuenta")}
        style={{ width:"100%", marginTop:12, background:"var(--card2)", color:"var(--muted)", border:"1px solid var(--line2)", padding:10, fontSize:12.5 }}>
        Ver la clasificación
      </button>
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
function QuedadasPanel({ quedadas, onRefrescar, cargando }){
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

  return (<>
    <div style={sectionTitle}>QUEDADAS {quedadas.length > 0 && `· ${quedadas.length}`}</div>
    <div className="fh-card" style={{ padding:16 }}>
      {!quedadas.length && !creando && (
        <p style={{ fontSize:12.5, color:"var(--muted)", margin:"0 0 12px", lineHeight:1.5 }}>
          No hay ninguna a la vista. Propón una: saber que va alguien más es lo que evita que os rajéis.
        </p>
      )}

      {cargando && !quedadas.length && <Empty text="Buscando quedadas…"/>}

      {quedadas.map((q,i)=>{
        const voy = q.mi_respuesta === "voy";
        const no  = q.mi_respuesta === "no";
        return (
          <div key={q.id} style={{ padding:"11px 0", borderTop:i?"1px solid var(--line)":"none" }}>
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

      {!creando ? (
        <button className="fh-btn" onClick={()=>{ setCreando(true); setMsg(null); }}
          style={{ width:"100%", marginTop:quedadas.length?13:0, background:"var(--card2)", color:"var(--txt)", border:"1px solid var(--line2)", padding:11, fontSize:12.5, display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}>
          <CalendarDays size={15} color="var(--gold)"/> Proponer una quedada
        </button>
      ) : (
        <div className="fh-in" style={{ marginTop:quedadas.length?13:0 }}>
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

/* Tarjeta compacta para Inicio: la próxima quedada a la que has dicho que vas. */
function ProximaQuedada({ quedadas, setTab }){
  const prox = (quedadas || []).find(q => q.mi_respuesta === "voy") || (quedadas || [])[0];
  if (!prox) return null;
  const voy = prox.mi_respuesta === "voy";
  return (
    <div className="fh-card" style={{ padding:14, marginTop:12, borderColor:voy?"var(--jade)":"var(--line)", display:"flex", gap:11, alignItems:"flex-start" }}>
      <CalendarDays size={18} color={voy?"var(--jade)":"var(--gold)"} style={{ flexShrink:0, marginTop:1 }}/>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:12.5, color:"var(--txt)", lineHeight:1.45 }}>
          {voy ? <>Has quedado <b>{cuandoTexto(prox.cuando)}</b></> : <>{prox.display_name || "@"+prox.handle} propone entrenar <b>{cuandoTexto(prox.cuando)}</b></>}
          {prox.lugar ? ` · ${prox.lugar}` : ""}
        </div>
        <div style={{ fontSize:11.5, color:"var(--faint)", marginTop:3 }}>
          {prox.van === 1 ? "va 1 persona" : `van ${prox.van} personas`}
          {" · "}
          <button onClick={()=>setTab("cuenta")} style={{ background:"none", border:"none", padding:0, color:"var(--gold)", cursor:"pointer", font:"inherit" }}>
            {voy ? "ver" : "contestar"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* Sección de amigos: invitar por código y canjear el que te pasen.
   Círculo cerrado, sin buscador de usuarios ni solicitudes pendientes. */
function AmigosPanel({ amigos, onRefrescarAmigos, onQuitar }){
  const [modo, setModo] = useState(null);          // invitar | canjear
  const [codigo, setCodigo] = useState("");
  const [entrada, setEntrada] = useState("");
  const [msg, setMsg] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [confirmar, setConfirmar] = useState(null);

  const puedeCompartir = typeof navigator !== "undefined" && !!navigator.share;
  const invitacion = c => `¡Éntrale a RPGym conmigo! Instala la app y mete este código en Cuenta → Amigos:\n\n${c}\n\nAsí nos vemos en la clasificación.`;

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

  const sectionTitle = { fontSize:12, fontWeight:700, letterSpacing:".08em", color:"var(--faint)", margin:"18px 4px 8px" };

  return (<>
    <div style={sectionTitle}>AMIGOS {amigos.length > 0 && `· ${amigos.length}`}</div>
    <div className="fh-card" style={{ padding:16 }}>
      {amigos.length === 0 && !modo && (
        <p style={{ fontSize:12.5, color:"var(--muted)", margin:"0 0 12px", lineHeight:1.5 }}>
          Todavía no tienes a nadie. Pásale tu código a quien quieras y apareceréis los dos en la clasificación.
        </p>
      )}

      {amigos.map((a,i)=>(
        <div key={a.id} style={{ display:"flex", alignItems:"center", gap:11, padding:"9px 0", borderTop:i?"1px solid var(--line)":"none" }}>
          <div style={{ width:34, height:34, borderRadius:10, flexShrink:0, background:"var(--bg2)", border:"1px solid var(--line2)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <User size={16} color="var(--gold)"/>
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:13.5, fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{a.display_name || a.handle}</div>
            <div className="mono" style={{ fontSize:11, color:"var(--faint)", marginTop:1 }}>@{a.handle} · nivel {a.level}</div>
          </div>
          <button onClick={()=>setConfirmar(confirmar===a.id?null:a.id)} aria-label={`Quitar a ${a.handle}`}
            style={{ background:"var(--bg2)", border:"1px solid var(--line)", borderRadius:8, width:30, height:30, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"var(--faint)", flexShrink:0 }}>
            <X size={14}/>
          </button>
        </div>
      ))}

      {confirmar && (
        <div className="fh-card" style={{ background:"var(--bg2)", padding:12, marginTop:10, display:"flex", alignItems:"center", gap:9, flexWrap:"wrap" }}>
          <span style={{ fontSize:12.5, color:"var(--muted)", flex:1, minWidth:140 }}>¿Dejar de ser amigos? Podéis volver con otro código.</span>
          <button className="fh-btn" onClick={()=>setConfirmar(null)} style={{ background:"var(--card2)", color:"var(--muted)", border:"1px solid var(--line2)", padding:"8px 13px", fontSize:12 }}>No</button>
          <button className="fh-btn" onClick={()=>{ const id=confirmar; setConfirmar(null); onQuitar(id); }} style={{ background:"var(--crimson)", color:"#fff", padding:"8px 13px", fontSize:12 }}>Sí</button>
        </div>
      )}

      <div style={{ display:"flex", gap:8, marginTop:amigos.length?13:0 }}>
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

function AccountView({ state, level, setTab, session, perfil, onEntrar, onRegistrar, onSalir, onRefrescar, quedadas, onRefrescarQuedadas, cargandoQuedadas }){
  const [modo, setModo] = useState("entrar");          // entrar | registro
  const [f, setF] = useState({ email:"", password:"", handle:"", displayName:"" });
  const [msg, setMsg] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [tabla, setTabla] = useState(null);
  const [cargandoTabla, setCargandoTabla] = useState(false);
  const [periodo, setPeriodo] = useState("semanal");
  const [soloAmigos, setSoloAmigos] = useState(true);   // por defecto, tu círculo
  const [amigos, setAmigos] = useState([]);

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
    if (r.necesitaConfirmar) { setMsg({ ok:true, t:"Cuenta creada. Confirma el correo que te hemos mandado y vuelve a entrar aquí." }); return; }
    setF({ email:"", password:"", handle:"", displayName:"" });
  }

  async function verTabla(p = periodo, amigosSolo = soloAmigos){
    setCargandoTabla(true);
    const r = await onRefrescar(p, amigosSolo);
    setCargandoTabla(false);
    setTabla(r.ok ? r.filas : []);
    if (!r.ok) setMsg({ ok:false, t:r.msg });
  }
  async function refrescarAmigos(){
    const r = await cloud.listarAmigos();
    if (r.ok) setAmigos(r.amigos);
    verTabla();
  }
  async function quitarAmigo(id){
    const r = await cloud.borrarAmigo(id);
    if (r.ok) refrescarAmigos(); else setMsg({ ok:false, t:r.msg });
  }
  useEffect(()=>{ if (session && perfil) { verTabla(periodo, soloAmigos); } /* eslint-disable-next-line */ }, [session?.user?.id, perfil?.handle, periodo, soloAmigos]);
  useEffect(()=>{ if (session && perfil) refrescarAmigos(); /* eslint-disable-next-line */ }, [session?.user?.id, perfil?.handle]);

  /* --- Sin sesión: entrar o registrarse --- */
  if (!session) return (
    <div className="fh-in">
      <header style={{ padding:"22px 2px 8px", display:"flex", alignItems:"center", gap:10 }}>
        <button onClick={()=>setTab("home")} aria-label="Volver" style={{ background:"var(--card)", border:"1px solid var(--line)", borderRadius:10, width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"var(--muted)", flexShrink:0 }}><ChevronLeft size={18}/></button>
        <div>
          <h1 style={{ margin:0, fontSize:22 }}>Cuenta</h1>
          <p style={{ margin:"3px 0 0", fontSize:13, color:"var(--muted)" }}>Para compartir rutinas y verte con tus amigos.</p>
        </div>
      </header>

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
            placeholder="dani_melendo" style={{ textAlign:"left", fontFamily:"'JetBrains Mono',monospace" }}/>
          <div style={{ fontSize:11.5, color:"var(--faint)", margin:"7px 2px 0", lineHeight:1.45 }}>
            Único para todo el grupo: es lo que evita que dos Danieles se confundan. 3-20 caracteres, sin espacios.
          </div>
          <div style={{ ...label, marginTop:14 }}>Nombre que verán tus amigos</div>
          <input value={f.displayName} maxLength={40} onChange={e=>set({ displayName:e.target.value })}
            placeholder={state.profile?.name || "Dani"} style={{ textAlign:"left" }}/>
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

      <p style={{ fontSize:11.5, color:"var(--faint)", textAlign:"center", marginTop:14, lineHeight:1.55 }}>
        Tu progreso actual no se pierde al crear la cuenta: sigue en el móvil.
      </p>
    </div>
  );

  /* --- Con sesión: perfil + leaderboard --- */
  const yo = perfil?.handle;
  return (
    <div className="fh-in">
      <header style={{ padding:"22px 2px 8px", display:"flex", alignItems:"center", gap:10 }}>
        <button onClick={()=>setTab("home")} aria-label="Volver" style={{ background:"var(--card)", border:"1px solid var(--line)", borderRadius:10, width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"var(--muted)", flexShrink:0 }}><ChevronLeft size={18}/></button>
        <div style={{ flex:1, minWidth:0 }}>
          <h1 style={{ margin:0, fontSize:22 }}>Cuenta</h1>
          <p style={{ margin:"3px 0 0", fontSize:13, color:"var(--muted)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            {perfil ? <>@{perfil.handle}</> : "Preparando tu perfil…"}
          </p>
        </div>
      </header>

      {perfil && (
        <div className="fh-card fh-framed" style={{ padding:16, display:"flex", alignItems:"center", gap:14 }}>
          <div style={{ width:52, height:52, borderRadius:14, background:"var(--bg2)", border:"1px solid var(--line2)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <User size={24} color="var(--gold)"/>
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div className="disp" style={{ fontWeight:700, fontSize:16 }}>{perfil.display_name || perfil.handle}</div>
            <div className="mono" style={{ fontSize:11.5, color:"var(--muted)", marginTop:2 }}>@{perfil.handle}</div>
            <div style={{ fontSize:11.5, color:"var(--faint)", marginTop:5 }}>
              Nivel {perfil.level} · {perfil.xp} XP · {perfil.total_workouts} entrenos
            </div>
          </div>
        </div>
      )}

      <AmigosPanel amigos={amigos} onRefrescarAmigos={refrescarAmigos} onQuitar={quitarAmigo}/>

      <QuedadasPanel quedadas={quedadas} onRefrescar={onRefrescarQuedadas} cargando={cargandoQuedadas}/>

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
        <button className="fh-btn" onClick={()=>verTabla()} disabled={cargandoTabla}
          style={{ width:"100%", marginTop:12, background:"var(--card2)", color:"var(--muted)", border:"1px solid var(--line2)", padding:10, fontSize:12.5, display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
          <Shuffle size={14}/> Actualizar
        </button>
      </div>

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
function UpdateBanner({ info, onClose }){
  if (!info) return null;
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

function SettingsView({ state, updateProfile, setReminders, setSub, setCycle, setTab, theme, setTheme, resetProgress, exportBackup, importBackup }){
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
          <p style={{ margin:"3px 0 0", fontSize:13, color:"var(--muted)" }}>Perfil, experiencia, recordatorios y datos.</p>
        </div>
      </header>

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

      {/* --- Privacidad --- */}
      <div style={sectionTitle}>PRIVACIDAD</div>
      <div className="fh-card" style={{ padding:16 }}>
        <div style={{ display:"flex", alignItems:"center", gap:9, fontSize:14, marginBottom:8 }}><Lock size={16} color="var(--jade)"/> Tus datos son tuyos</div>
        <p style={{ fontSize:12.5, color:"var(--muted)", margin:"0 0 10px", lineHeight:1.5 }}>
          Sin cuenta, RPGym <b style={{ color:"var(--txt)" }}>no envía nada a ningún sitio</b>: todo lo que escribes se
          queda en este móvil y la app funciona entera sin conexión. No hay publicidad ni analítica.
        </p>
        <p style={{ fontSize:12.5, color:"var(--muted)", margin:"0 0 10px", lineHeight:1.5 }}>
          Si creas una cuenta (opcional), se suben <b style={{ color:"var(--txt)" }}>solo</b> tu nombre, tu usuario,
          tu nivel, tu XP, tu racha y la <b style={{ color:"var(--txt)" }}>fecha y el XP</b> de cada entreno, para las
          clasificaciones, más las rutinas que compartas <b style={{ color:"var(--txt)" }}>a propósito</b>, una a una.
          <b style={{ color:"var(--txt)" }}> Nunca</b> salen de aquí qué ejercicios haces ni con cuánto peso, ni tu peso
          corporal, medidas, edad, dieta o los datos del ciclo.
        </p>
        <p style={{ fontSize:11.5, color:"var(--faint)", margin:0, lineHeight:1.5 }}>
          Puedes borrarlo todo cuando quieras desde <b style={{ color:"var(--muted)" }}>Borrar progreso</b>, o desinstalando la app.
        </p>
        {PRIVACY_URL && (
          <a href={PRIVACY_URL} target="_blank" rel="noopener noreferrer" className="fh-btn"
            style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:7, marginTop:13, textDecoration:"none",
                     background:"var(--card2)", color:"var(--txt)", border:"1px solid var(--line2)", padding:11, fontSize:12.5 }}>
            <Shield size={15} color="var(--jade)"/> Leer la política de privacidad
          </a>
        )}
      </div>

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

function StreakCard({ log, plannedDays, bestStreak, setTab }){
  const planned = (plannedDays && plannedDays.length) ? plannedDays : DEFAULT_TRAIN_DAYS;
  const streak = habitStreak(log, planned);
  const record = Math.max(bestStreak||0, streak);
  const trained = new Set((log||[]).map(r=>r.date));
  const today = todayISO();
  const mon = mondayOf(today);
  const labels = ["L","M","X","J","V","S","D"];
  const days = Array.from({ length:7 }, (_,i)=>{
    const iso = addDaysISO(mon, i);
    return { iso, label:labels[i], isPlanned:planned.includes(weekdayOfISO(iso)),
      isTrained:trained.has(iso), isToday:iso===today, isFuture:iso>today };
  });
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
          let bg="transparent", brd="1px solid var(--line)", col="var(--faint)", content=d.label;
          if(d.isTrained){ bg="var(--gold)"; brd="none"; col="#0F131A"; }
          else if(!d.isPlanned){ bg="var(--bg2)"; brd="1px solid var(--line)"; col="var(--faint)"; } // descanso
          else if(d.isFuture){ brd="1px dashed var(--line2)"; col="var(--muted)"; } // planificado futuro
          else if(d.isToday){ brd="1px solid var(--gold)"; col="var(--gold)"; } // hoy pendiente
          else { brd="1px solid var(--crimson)"; col="var(--crimson)"; } // planificado incumplido
          return (
            <div key={d.iso} style={{ textAlign:"center" }}>
              <div style={{ fontSize:9.5, color:"var(--faint)", marginBottom:3, fontWeight:600 }}>{d.label}</div>
              <div style={{ aspectRatio:"1", borderRadius:9, background:bg, border:brd, display:"flex", alignItems:"center", justifyContent:"center", color:col }}>
                {d.isTrained ? <Check size={15}/> : !d.isPlanned ? <Moon size={12}/> : d.isToday ? <Flame size={13}/> : null}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ fontSize:11, color:"var(--faint)", marginTop:10, lineHeight:1.45 }}>
        Los días de <b style={{ color:"var(--muted)" }}>descanso</b> (luna) no rompen tu racha. Ajusta tus días de entreno en <button onClick={()=>setTab("ajustes")} style={{ background:"none", border:"none", padding:0, color:"var(--gold)", cursor:"pointer", font:"inherit" }}>Ajustes</button>.
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

function HomeView({ state, level, rank, log, useCheat, setTab, setActiveRoutine, customRoutines, cloudEnabled, perfil, updateInfo, onCloseUpdate, quedadas, novedades, onCerrarNovedades }){
  const xpInto=state.xp-cumXpForLevel(level), xpNeed=cumXpForLevel(level+1)-cumXpForLevel(level);
  const routine=findRoutine(state.activeRoutine, customRoutines); const goal=weeklyGoalFor(state, routine);
  const RankIcon=rank.icon;
  const phase=recommendedPhase(state.startDate);
  const last=log.slice(-6).map((s,i)=>({ i, v:s.volume }));
  const week=weeksBetween(state.startDate, todayISO())+1;
  const greeting=useMemo(()=>greetingFor(state.profile?.name), [state.profile?.name]);

  return (
    <div className="fh-in">
      <header style={{ padding:"22px 2px 16px", display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:10 }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:12, color:"var(--muted)", fontWeight:600, letterSpacing:".08em" }}>RPGYM · SEMANA {week}</div>
          <h1 style={{ margin:"3px 0 0", fontSize:21, lineHeight:1.2 }}>{greeting}</h1>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
          <div className="fh-chip" style={{ background:"rgba(232,176,75,.14)", color:"var(--gold)", display:"flex", alignItems:"center", gap:5, whiteSpace:"nowrap", flexShrink:0 }} title="Racha de días entrenados (los descansos no la rompen)"><Flame size={13}/> {habitStreak(log, state.reminders?.days)} d</div>
          {cloudEnabled && (
            <button onClick={()=>setTab("cuenta")} aria-label="Cuenta y clasificación" style={{ background:"var(--card)", border:`1px solid ${perfil?"var(--gold)":"var(--line)"}`, borderRadius:10, width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:perfil?"var(--gold)":"var(--muted)", flexShrink:0 }}><User size={17}/></button>
          )}
          <button onClick={()=>setTab("ajustes")} aria-label="Ajustes" style={{ background:"var(--card)", border:"1px solid var(--line)", borderRadius:10, width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"var(--muted)", flexShrink:0 }}><Settings size={17}/></button>
        </div>
      </header>

      <UpdateBanner info={updateInfo} onClose={onCloseUpdate}/>

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

      {/* Rango + XP */}
      <div className="fh-card fh-framed" onClick={()=>setTab("ficha")} style={{ padding:20, display:"flex", alignItems:"center", gap:18, cursor:"pointer" }}>
        <Ring pct={xpInto/xpNeed} size={116} stroke={9} color={rank.color}>
          <RankIcon size={22} color={rank.color}/>
          <div className="cinzel" style={{ fontSize:27, fontWeight:700, lineHeight:1, marginTop:2 }}>{level}</div>
          <div style={{ fontSize:9, color:"var(--muted)", fontWeight:600 }}>NIVEL</div>
        </Ring>
        <div style={{ flex:1 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div className="cinzel" style={{ fontSize:20, fontWeight:700, color:rank.color }}>{rank.name}</div>
            <ScrollText size={15} color="var(--faint)"/>
          </div>
          <div style={{ fontSize:12, color:"var(--muted)", marginTop:2 }}>{xpInto} / {xpNeed} XP para nivel {level+1}</div>
          <div style={{ height:7, background:"var(--line)", borderRadius:99, marginTop:9, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${Math.min(100,(xpInto/xpNeed)*100)}%`, background:rank.color, borderRadius:99, transition:"width .6s" }}/>
          </div>
          <div style={{ fontSize:11, color:"var(--faint)", marginTop:8 }}>{state.xp} XP · {state.totalWorkouts} entrenos</div>
        </div>
      </div>

      {cloudEnabled && perfil && <NovedadesCard novedades={novedades} onCerrar={onCerrarNovedades} setTab={setTab}/>}
      {cloudEnabled && perfil && <ProximaQuedada quedadas={quedadas} setTab={setTab}/>}

      {/* Racha (respeta descansos) */}
      <StreakCard log={log} plannedDays={state.reminders?.days} bestStreak={state.bestStreak} setTab={setTab}/>

      {/* Misiones de la semana */}
      <MissionsCard state={state} log={log}/>

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
        <div style={{ display:"flex", gap:7 }}>
          {Array.from({length:goal}).map((_,i)=>(
            <div key={i} style={{ flex:1, height:34, borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center",
              background:i<state.weeklyCount?"var(--jade)":"var(--bg2)", border:i<state.weeklyCount?"none":"1px solid var(--line)" }}>
              {i<state.weeklyCount? <Check size={16} color="#0F131A"/> : <span style={{ color:"var(--faint)", fontSize:12 }}>{i+1}</span>}
            </div>
          ))}
        </div>
        <div style={{ fontSize:12, color:"var(--muted)", marginTop:10 }}>
          {state.weekGoalMet ? "¡Semana completada! Sigue sumando o descansa sin culpa." : `Te faltan ${Math.max(0,goal-state.weeklyCount)} sesión(es) para +200 XP y un cheat day.`}
        </div>
        {/* Qué días has marcado tú: el objetivo sale de aquí, no de la rutina. */}
        <div style={{ fontSize:11.5, color:"var(--faint)", marginTop:7, lineHeight:1.5 }}>
          Tus días: <b style={{ color:"var(--muted)" }}>{plannedDaysOf(state).slice().sort((a,b)=>((a+6)%7)-((b+6)%7)).map(d=>DAY_LETTERS[d]).join(" · ")}</b>
          {routine?.daysPerWeek && routine.daysPerWeek!==goal && <> · esta rutina está pensada para {routine.daysPerWeek} día{routine.daysPerWeek===1?"":"s"}</>}
          {" · "}
          <button onClick={()=>setTab("ajustes")} style={{ background:"none", border:"none", padding:0, color:"var(--gold)", cursor:"pointer", font:"inherit" }}>cambiar</button>
        </div>
      </div>

      {/* Cheat + mini gráfica */}
      <div style={{ display:"flex", gap:12, marginTop:12 }}>
        <button className="fh-card" onClick={useCheat} disabled={state.cheatTokens<=0}
          style={{ flex:1, padding:16, textAlign:"left", cursor:state.cheatTokens>0?"pointer":"default", opacity:state.cheatTokens>0?1:.55 }}>
          <Cookie size={18} color="var(--ember)"/>
          <div className="disp" style={{ fontSize:26, fontWeight:700, marginTop:6 }}>{state.cheatTokens}</div>
          <div style={{ fontSize:11, color:"var(--muted)" }}>cheat days {state.cheatTokens>0?"· toca para canjear":"· gánalos"}</div>
        </button>
        <div className="fh-card" style={{ flex:1, padding:16 }}>
          <TrendingUp size={18} color="var(--gold)"/>
          <div style={{ height:44, marginTop:6 }}>
            {last.length>1 ? <ResponsiveContainer width="100%" height="100%"><LineChart data={last}><Line type="monotone" dataKey="v" stroke="var(--gold)" strokeWidth={2} dot={false}/></LineChart></ResponsiveContainer>
              : <div style={{ fontSize:11, color:"var(--faint)", paddingTop:14 }}>Entrena para ver tu curva</div>}
          </div>
          <div style={{ fontSize:11, color:"var(--muted)" }}>volumen reciente</div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   RUTINAS
   ========================================================================= */

/* Panel para pasarle una rutina a otra persona: genera el código y lo copia o
   lo manda por la app que elija (WhatsApp, Telegram…) si el móvil lo permite. */
function ShareRoutinePanel({ routine, onClose, publicada, onPublicar }){
  const [msg, setMsg] = useState(null);
  const code = useMemo(()=>encodeRoutine(routine), [routine]);
  const puedeCompartir = typeof navigator !== "undefined" && !!navigator.share;

  async function copiar(){
    try { await navigator.clipboard.writeText(code); setMsg({ ok:true, t:"Código copiado. Pégalo donde quieras." }); }
    catch { setMsg({ ok:false, t:"No se ha podido copiar. Selecciona el texto y cópialo a mano." }); }
  }
  async function enviar(){
    try { await navigator.share({ title:`Rutina RPGym: ${routine.name}`,
      text:`Te paso mi rutina "${routine.name}" de RPGym. Ábrela en Rutinas → Importar rutina y pega este código:\n\n${code}` }); }
    catch { /* si cancela el usuario no hay nada que avisar */ }
  }

  return (
    <div className="fh-card fh-in" style={{ background:"var(--bg2)", padding:14, marginBottom:12 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8, marginBottom:9 }}>
        <span className="disp" style={{ fontWeight:600, fontSize:13.5, display:"flex", alignItems:"center", gap:7 }}>
          <Share2 size={14} color="var(--gold)"/> Compartir «{routine.name}»
        </span>
        <button onClick={onClose} aria-label="Cerrar" style={{ background:"none", border:"none", padding:2, cursor:"pointer", color:"var(--faint)" }}><X size={15}/></button>
      </div>
      <p style={{ fontSize:11.5, color:"var(--muted)", margin:"0 0 10px", lineHeight:1.5 }}>
        Este código lleva la rutina entera. Quien lo reciba entra en <b style={{ color:"var(--txt)" }}>Rutinas → Importar rutina</b> y lo pega. No viaja ningún dato tuyo: ni tu nombre, ni tus marcas, ni tu progreso.
      </p>
      <textarea readOnly value={code} rows={3} onFocus={e=>e.target.select()}
        aria-label="Código de la rutina"
        style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, wordBreak:"break-all" }}/>
      {cloud.cloudEnabled && (
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, marginTop:11, paddingTop:11, borderTop:"1px solid var(--line)" }}>
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
      )}

      <div style={{ display:"flex", gap:8, marginTop:10 }}>
        <button className="fh-btn" onClick={copiar} style={{ flex:1, background:"var(--gold)", padding:11, fontSize:12.5, display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
          <Copy size={14}/> Copiar código
        </button>
        {puedeCompartir && (
          <button className="fh-btn" onClick={enviar} style={{ flex:1, background:"var(--card2)", color:"var(--txt)", border:"1px solid var(--line2)", padding:11, fontSize:12.5, display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
            <Share2 size={14} color="var(--gold)"/> Enviar…
          </button>
        )}
      </div>
      {msg && <div style={{ fontSize:11.5, marginTop:9, color:msg.ok?"var(--jade)":"var(--ember)", lineHeight:1.45 }}>{msg.t}</div>}
      <div style={{ fontSize:11, color:"var(--faint)", marginTop:9, lineHeight:1.45 }}>
        {code.length} caracteres · cópialo <b style={{ color:"var(--muted)" }}>entero</b> o no se podrá abrir.
      </div>
    </div>
  );
}

/* Panel para meter la rutina que te han pasado. Enseña QUÉ trae antes de guardar. */
function ImportRoutinePanel({ existingNames, onImport, onClose }){
  const [text, setText] = useState("");
  const [res, setRes] = useState(null);

  function revisar(value){
    setText(value);
    setRes(value.trim() ? decodeRoutine(value, existingNames) : null);
  }
  async function pegar(){
    try { const t = await navigator.clipboard.readText(); revisar(t); }
    catch { setRes({ ok:false, msg:"Tu móvil no deja leer el portapapeles desde aquí. Pega el código a mano en el recuadro." }); }
  }

  const r = res?.ok ? res.routine : null;
  const totalEx = r ? r.days.reduce((a,d)=>a+d.exercises.length, 0) : 0;

  return (
    <div className="fh-card fh-in" style={{ padding:14, marginTop:10 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8, marginBottom:9 }}>
        <span className="disp" style={{ fontWeight:600, fontSize:13.5, display:"flex", alignItems:"center", gap:7 }}>
          <Download size={14} color="var(--jade)"/> Importar rutina compartida
        </span>
        <button onClick={onClose} aria-label="Cerrar" style={{ background:"none", border:"none", padding:2, cursor:"pointer", color:"var(--faint)" }}><X size={15}/></button>
      </div>
      <p style={{ fontSize:11.5, color:"var(--muted)", margin:"0 0 10px", lineHeight:1.5 }}>
        Pega el código que te hayan pasado (empieza por <span className="mono" style={{ color:"var(--txt)" }}>RPGYM-R1.</span>). Se añadirá a tus rutinas sin tocar las que ya tienes.
      </p>
      <textarea value={text} onChange={e=>revisar(e.target.value)} rows={3} placeholder="RPGYM-R1.…"
        aria-label="Código de la rutina a importar"
        style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, wordBreak:"break-all" }}/>
      <button className="fh-btn" onClick={pegar}
        style={{ width:"100%", marginTop:9, background:"var(--card2)", color:"var(--txt)", border:"1px solid var(--line2)", padding:10, fontSize:12.5, display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}>
        <Upload size={14} color="var(--jade)"/> Pegar del portapapeles
      </button>

      {res && !res.ok && (
        <div style={{ display:"flex", gap:9, alignItems:"flex-start", marginTop:11, padding:"10px 12px", background:"var(--bg2)", border:"1px solid var(--crimson)", borderRadius:11 }}>
          <ShieldAlert size={15} color="var(--crimson)" style={{ flexShrink:0, marginTop:1 }}/>
          <div style={{ fontSize:12, color:"var(--txt)", lineHeight:1.45 }}>{res.msg}</div>
        </div>
      )}

      {r && (
        <div className="fh-in" style={{ marginTop:12 }}>
          <div className="fh-card" style={{ background:"var(--bg2)", padding:13, borderColor:"var(--jade)" }}>
            <div className="disp" style={{ fontWeight:700, fontSize:15 }}>{r.name}</div>
            <div style={{ fontSize:12, color:"var(--muted)", marginTop:2 }}>
              {r.days.length} día{r.days.length===1?"":"s"} · {totalEx} ejercicio{totalEx===1?"":"s"} · RPE {r.rpe}
            </div>
            {r.blurb && <p style={{ fontSize:12, color:"var(--muted)", margin:"8px 0 0", lineHeight:1.5 }}>{r.blurb}</p>}
            <div style={{ marginTop:10 }}>
              {r.days.map((d,i)=>(
                <div key={i} style={{ padding:"7px 0", borderTop:"1px solid var(--line)" }}>
                  <div className="disp" style={{ fontSize:12.5, fontWeight:600 }}>{d.name}</div>
                  <div style={{ fontSize:11, color:"var(--faint)", marginTop:3, lineHeight:1.5 }}>
                    {d.exercises.map(e=>`${e.name} ${e.sets}×${e.reps}`).join(" · ")}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {res.desconocidos.length > 0 && (
            <div style={{ display:"flex", gap:9, alignItems:"flex-start", marginTop:10, padding:"10px 12px", background:"var(--bg2)", border:"1px solid var(--ember)", borderRadius:11 }}>
              <Info size={15} color="var(--ember)" style={{ flexShrink:0, marginTop:1 }}/>
              <div style={{ fontSize:11.5, color:"var(--muted)", lineHeight:1.5 }}>
                Tu versión de la app no conoce {res.desconocidos.length === 1 ? "este ejercicio" : "estos ejercicios"} y {res.desconocidos.length === 1 ? "se queda" : "se quedan"} fuera: <b style={{ color:"var(--txt)" }}>{res.desconocidos.join(", ")}</b>. Actualiza la app o añádelo tú a mano después.
              </div>
            </div>
          )}

          <button className="fh-btn" onClick={()=>{ onImport(r); onClose(); }}
            style={{ width:"100%", marginTop:11, background:"var(--jade)", padding:13, fontSize:13.5, display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}>
            <Check size={16}/> Añadir a mis rutinas
          </button>
        </div>
      )}
    </div>
  );
}

/* Rutinas que comparten tus amigos. Copiarlas guarda de quién son y da XP extra
   la primera vez que las entrenas. */
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
function RoutineCard({ r, state, level, isOpen, onToggle, setActiveRoutine, startWorkout, onEdit, onDelete, publicadas, onPublicar }){
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
          {mine && shareOpen && <ShareRoutinePanel routine={r} onClose={()=>setShareOpen(false)} publicada={!!publicadas?.includes(r.id)} onPublicar={()=>onPublicar(r)}/>}
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

function RoutinesView({ state, level, setActiveRoutine, startWorkout, customRoutines, editRoutine, deleteCustomRoutine, importRoutine, perfil, publicadas, onPublicar }){
  const [open, setOpen] = useState(state.activeRoutine);
  const [noticeClosed, setNoticeClosed] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const sexTag = state.profile?.sex === "mujer" ? "f" : "m";
  const experience = state.profile?.experience || "principiante";
  const expLabel = (EXPERIENCE_LEVELS.find(e=>e.id===experience)||EXPERIENCE_LEVELS[0]).label;
  const canUnlock = experience!=="experto";
  const mine = customRoutines || [];
  const cardProps = { state, level, setActiveRoutine, startWorkout, onEdit:editRoutine, onDelete:deleteCustomRoutine, publicadas, onPublicar };
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
          <button onClick={()=>setNoticeClosed(true)} aria-label="Cerrar" style={{ background:"none", border:"none", padding:2, cursor:"pointer", color:"var(--faint)", flexShrink:0 }}><X size={15}/></button>
        </div>
      )}

      {/* --- Mis rutinas (configurador) --- */}
      <div style={{ marginTop:14 }}>
        <div className="disp" style={{ fontSize:12, fontWeight:700, letterSpacing:".08em", color:"var(--faint)", margin:"0 4px 8px" }}>MIS RUTINAS</div>
        {mine.map(r=>(
          <RoutineCard key={r.id} r={r} isOpen={open===r.id} onToggle={()=>setOpen(open===r.id?null:r.id)} {...cardProps}/>
        ))}
        <div style={{ display:"flex", gap:8 }}>
          <button className="fh-btn" onClick={()=>editRoutine(null)}
            style={{ flex:1, background:"var(--card)", color:"var(--txt)", border:"1px dashed var(--line2)", padding:"14px 8px", fontSize:12.5, display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}>
            <Plus size={15} color="var(--gold)"/> {mine.length ? "Crear otra" : "Crear rutina"}
          </button>
          <button className="fh-btn" onClick={()=>setImportOpen(v=>!v)}
            style={{ flex:1, background:importOpen?"var(--jade)":"var(--card)", color:importOpen?"#0F131A":"var(--txt)", border:importOpen?"none":"1px dashed var(--line2)", padding:"14px 8px", fontSize:12.5, display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}>
            <Download size={15} color={importOpen?"#0F131A":"var(--jade)"}/> Importar rutina
          </button>
        </div>
        {importOpen && (
          <ImportRoutinePanel
            existingNames={mine.map(r=>r.name)}
            onImport={importRoutine}
            onClose={()=>setImportOpen(false)}/>
        )}
        {cloud.cloudEnabled && perfil && (
          <div style={{ marginTop:14 }}>
            <div className="disp" style={{ fontSize:12, fontWeight:700, letterSpacing:".08em", color:"var(--faint)", margin:"0 4px 8px" }}>DE MIS AMIGOS</div>
            <RutinasDeAmigos onImportar={importRoutine} yaTengo={mine.map(r=>r.name)}/>
          </div>
        )}

        {!mine.length && !importOpen && (
          <p style={{ fontSize:11.5, color:"var(--faint)", margin:"9px 4px 0", lineHeight:1.5 }}>
            ¿Te han pautado una rutina? Móntala aquí con los ejercicios de la app. Y si alguien te pasa la suya, <b style={{ color:"var(--muted)" }}>Importar rutina</b> la mete tal cual con solo pegar su código.
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
    .map(g => ({ ...g, items:g.items.filter(n => !term || normTxt(n).includes(term)) }))
    .filter(g => g.items.length);
  const total = groups.reduce((a,g)=>a+g.items.length, 0);
  const target = (typeof document!=="undefined" && document.getElementById("rpgym-root")) || (typeof document!=="undefined" ? document.body : null);

  const overlay = (
    /* Fondo opaco con la variable del tema: el selector ocupa toda la pantalla y así
       se lee igual de bien en claro que en oscuro (un velo oscuro fijo no valdría). */
    <div style={{ position:"fixed", inset:0, zIndex:210, background:"var(--bg)", display:"flex", justifyContent:"center" }}>
      <div style={{ width:"100%", maxWidth:480, display:"flex", flexDirection:"column", padding:"16px 16px calc(12px + env(safe-area-inset-bottom))", minHeight:0 }}>

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
          style={{ textAlign:"left", fontFamily:"'Space Grotesk',sans-serif" }}/>
        <div style={{ ...label, marginTop:12 }}>Descripción corta <span style={{ color:"var(--faint)", fontWeight:400 }}>(opcional)</span></div>
        <input value={draft.subtitle} maxLength={60} onChange={e=>setField({ subtitle:e.target.value })} placeholder="4 días · fuerza y volumen"
          style={{ textAlign:"left", fontFamily:"'Space Grotesk',sans-serif" }}/>
        <div style={{ ...label, marginTop:12 }}>Intensidad</div>
        <select value={draft.rpe} onChange={e=>setField({ rpe:e.target.value })}>
          <option value="6-7">Suave (RPE 6-7) · técnica y acondicionamiento</option>
          <option value="7-8">Media (RPE 7-8) · recomposición</option>
          <option value="8-9">Fuerte (RPE 8-9) · hipertrofia y fuerza</option>
        </select>
        <div style={{ fontSize:11.5, color:"var(--faint)", margin:"7px 2px 0", lineHeight:1.45 }}>
          Con esto la app calcula el <b style={{ color:"var(--muted)" }}>peso sugerido</b> la primera vez que hagas cada ejercicio. Después se ajusta solo a tus marcas.
        </div>
      </div>

      {/* --- Días --- */}
      <div style={sectionTitle}>DÍAS DE LA RUTINA</div>
      {draft.days.map((day, di)=>(
        <div key={di} className="fh-card" style={{ padding:16, marginBottom:11 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
            <input value={day.name} maxLength={40} onChange={e=>setDay(di, { name:e.target.value })} aria-label={"Nombre del día " + (di+1)}
              style={{ flex:1, textAlign:"left", fontFamily:"'Space Grotesk',sans-serif", fontWeight:600, fontSize:15, padding:"8px 11px" }}/>
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

function WorkoutView({ session, setSession, finishWorkout, setTab, log, weekStart, bests }){
  const [rest, setRest] = useState(null);
  const [howOpen, setHowOpen] = useState(null);
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
      const sug=round25((e.base||10)*mult);
      return { ...e, logs:e.logs.map(l=> l.done? l : ({ ...l, weight: sug||"" })) };
    });
    setSession({ ...session, energy:val, exercises });
  }
  /* El nivel de la máquina es el mismo para toda la tirada: se aplica a las series pendientes. */
  function setExerciseField(exI, field, val){
    const exercises=session.exercises.map((e,i)=> i!==exI? e : ({ ...e, logs:e.logs.map(l=> l.done? l : ({ ...l, [field]:val })) }));
    setSession({ ...session, exercises });
  }
  function setExerciseWeight(exI, w){
    const exercises=session.exercises.map((e,i)=> i!==exI? e : ({ ...e, logs:e.logs.map(l=> l.done? l : ({ ...l, weight:w })) }));
    setSession({ ...session, exercises });
  }
  function update(exI,setI,field,val){
    const exercises=session.exercises.map((e,i)=> i!==exI? e : ({ ...e, logs:e.logs.map((l,j)=> j===setI? ({ ...l,[field]:val }) : l) }));
    setSession({ ...session, exercises });
  }
  function completeSet(exI,setI){
    const ex=session.exercises[exI]; const wasDone=ex.logs[setI].done;
    update(exI,setI,"done",!wasDone);
    // El cardio continuo va con rest 0: no tiene sentido abrir el cronómetro de descanso.
    if(!wasDone && ex.rest>0) setRest(ex.rest);
  }

  const mult=ENERGY[session.energy].mult;
  const EnergyIcon = ENERGY[session.energy].icon;

  return (
    <div className="fh-in" style={{ paddingBottom:24 }}>
      <header style={{ padding:"20px 2px 10px", display:"flex", alignItems:"center", gap:10 }}>
        <button onClick={()=>{ if(confirm("¿Salir del entrenamiento? Se perderá lo no guardado.")){ setSession(null); setTab("rutinas"); } }}
          style={{ background:"var(--card)", border:"1px solid var(--line)", borderRadius:10, padding:8, cursor:"pointer", color:"var(--txt)", display:"flex" }}><ChevronLeft size={18}/></button>
        <div style={{ flex:1 }}><div style={{ fontSize:11, color:"var(--muted)", fontWeight:600 }}>{session.routineName} · RPE {session.rpe}</div><h1 style={{ margin:0, fontSize:19 }}>{session.dayName}</h1></div>
        <div className="mono" style={{ fontSize:13, color:"var(--gold)" }}>{doneSets}/{totalSets}</div>
      </header>

      <div style={{ height:6, background:"var(--line)", borderRadius:99, margin:"0 2px 14px", overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${(doneSets/totalSets)*100}%`, background:"var(--gold)", transition:"width .3s" }}/>
      </div>

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
        // Peso corporal / isométrico / cardio: se oculta todo lo relativo a la carga.
        const bw=isBodyweight(ex.name);
        const cardio=isCardio(ex.name);
        const consola=hasConsole(ex);                      // máquina con pantalla: km, kcal y nivel
        const unit=repUnit(ex.reps);                       // REPS · SEG · MIN
        const cols=consola ? "22px 1fr 1fr 1fr 84px" : bw ? "28px 1fr 90px" : "28px 1fr 1fr 90px";
        const sug=bw ? 0 : round25((ex.base||10)*mult);
        const opts=bw ? [] : [...new Set([round25(sug*0.85),round25(sug*0.9),round25(sug*0.95),sug,round25(sug*1.05),round25(sug*1.1)])].filter(v=>v>0);
        const curW=ex.logs.find(l=>!l.done)?.weight ?? ex.logs[0].weight;
        const rec=cardio ? bests?.[ex.name] : null;        // récord de cardio de este ejercicio
        const curLevel=ex.logs.find(l=>!l.done)?.level ?? ex.logs[0].level ?? "";
        return (
          <div key={exI} className="fh-card" style={{ padding:15, marginBottom:11 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10, gap:8 }}>
              <div><div className="disp" style={{ fontWeight:700, fontSize:15 }}>{ex.name}</div>
                <div style={{ fontSize:11, color:"var(--faint)" }}>objetivo {ex.reps}{ex.rest>0?` · descanso ${ex.rest}s`:""}{ex.note?<span style={{ color:"var(--ember)" }}> · {ex.note}</span>:""}</div></div>
              <button onClick={()=>setHowOpen(howOpen===exI?null:exI)} style={{ flexShrink:0, background:"var(--bg2)", border:`1px solid ${howOpen===exI?"var(--gold)":"var(--line2)"}`, borderRadius:9, padding:"6px 10px", cursor:"pointer", color:howOpen===exI?"var(--gold)":"var(--muted)", display:"flex", alignItems:"center", gap:4, fontSize:11, fontFamily:"'Space Grotesk',sans-serif", fontWeight:600 }}>
                <Info size={13}/> Cómo
              </button>
            </div>
            {howOpen===exI && (
              <div className="fh-in" style={{ background:"var(--bg2)", border:"1px solid var(--line)", borderRadius:11, padding:"11px 13px", marginBottom:12 }}>
                <ExImage name={ex.name}/>
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
                <span style={{ fontSize:11, color:"var(--muted)", whiteSpace:"nowrap" }}>Nivel de la máquina</span>
                <input inputMode="numeric" placeholder="—" value={curLevel}
                  onChange={e=>setExerciseField(exI, "level", e.target.value.replace(/[^\d]/g,"").slice(0,2))}
                  aria-label="Nivel de la máquina" style={{ flex:1, padding:"8px 12px", fontSize:14 }}/>
              </div>
            )}

            {/* Desplegable de peso del ejercicio */}
            {opts.length>0 && (
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                <span style={{ fontSize:11, color:"var(--muted)", whiteSpace:"nowrap" }}>Peso a levantar</span>
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
            {ex.logs.map((l,setI)=>(
              <div key={setI} style={{ display:"grid", gridTemplateColumns:cols, gap:consola?6:8, alignItems:"center", marginBottom:7 }}>
                <span className="mono" style={{ fontSize:13, color:"var(--muted)", textAlign:"center" }}>{setI+1}</span>
                {!bw && <input inputMode="decimal" placeholder="0" value={l.weight} onChange={e=>update(exI,setI,"weight",e.target.value)} disabled={l.done} style={{ opacity:l.done?.5:1 }}/>}
                <input inputMode="numeric" placeholder="0" value={l.reps} onChange={e=>update(exI,setI,"reps",e.target.value)} disabled={l.done} style={{ opacity:l.done?.5:1, padding:consola?"10px 6px":undefined }}/>
                {consola && <>
                  <input inputMode="decimal" placeholder="—" value={l.km||""} onChange={e=>update(exI,setI,"km",e.target.value)} disabled={l.done} aria-label="Kilómetros recorridos" style={{ opacity:l.done?.5:1, padding:"10px 6px" }}/>
                  <input inputMode="numeric" placeholder="—" value={l.kcal||""} onChange={e=>update(exI,setI,"kcal",e.target.value)} disabled={l.done} aria-label="Calorías quemadas" style={{ opacity:l.done?.5:1, padding:"10px 6px" }}/>
                </>}
                <button className="fh-btn" onClick={()=>completeSet(exI,setI)}
                  style={{ height:40, background:l.done?"var(--jade)":"var(--card2)", color:l.done?"#0F131A":"var(--muted)", fontSize:12, display:"flex", alignItems:"center", justifyContent:"center", gap:4, border:l.done?"none":"1px solid var(--line2)" }}>
                  {l.done ? <><Check size={15}/> Hecho</> : ex.rest>0 ? <><Timer size={13}/> Descanso</> : <><Check size={14}/> Marcar</>}
                </button>
              </div>
            ))}
          </div>
        );
      })}

      <button className="fh-btn" onClick={finishWorkout} disabled={doneSets===0}
        style={{ width:"100%", background:doneSets?"var(--gold)":"var(--card)", color:doneSets?"#0F131A":"var(--faint)", padding:15, fontSize:16, marginTop:6, display:"flex", alignItems:"center", justifyContent:"center", gap:8, animation:doneSets===totalSets?"fh-glow 2s infinite":"none" }}>
        <Zap size={18}/> Terminar sesión
      </button>

      {rest!=null && <RestTimer seconds={rest} onDone={()=>setRest(null)} isRecomp={isRecomp}/>}
    </div>
  );
}

/* =========================================================================
   FIN DE PARTIDA (resumen de la sesión)
   ========================================================================= */

function ResultsView({ results, setTab, level, rank }){
  if(!results){ setTab("home"); return null; }
  const r=results;
  const Row=({label,val,color})=>(
    <div style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderTop:"1px solid var(--line)", fontSize:13 }}>
      <span style={{ color:"var(--muted)" }}>{label}</span><span className="mono" style={{ color:color||"var(--txt)", fontWeight:700 }}>{val}</span>
    </div>
  );
  return (
    <div className="fh-in" style={{ paddingTop:24 }}>
      <div className="fh-pop" style={{ textAlign:"center", marginBottom:18 }}>
        <div style={{ display:"inline-flex", padding:14, borderRadius:20, background:"var(--gold)", marginBottom:12 }}><Trophy size={30} color="#0F131A"/></div>
        <h1 style={{ margin:0, fontSize:24 }}>Sesión completada</h1>
        <p style={{ margin:"4px 0 0", fontSize:13, color:"var(--muted)" }}>{r.routineName} · {r.dayName}</p>
      </div>

      {r.levelUp && (
        <div className="fh-card fh-pop" style={{ padding:16, marginBottom:12, textAlign:"center", borderColor:rank.color, background:"linear-gradient(135deg,var(--card),var(--card2))", animation:"fh-glow 2.4s infinite" }}>
          <Crown size={22} color={rank.color}/>
          <div className="disp" style={{ fontSize:19, fontWeight:700, marginTop:4 }}>¡Subes a nivel {r.levelUp}!</div>
          <div style={{ fontSize:12, color:"var(--muted)" }}>Rango: {r.rankName}</div>
        </div>
      )}

      {/* Stats principales */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:12 }}>
        {[["+"+r.sessionXp,"XP","var(--gold)"],[r.volume+" kg","movidos","var(--jade)"],[r.durationMin+" min","duración","var(--sky)"]].map((s,i)=>(
          <div key={i} className="fh-card" style={{ padding:14, textAlign:"center" }}>
            <div className="disp" style={{ fontSize:20, fontWeight:700, color:s[2] }}>{s[0]}</div>
            <div style={{ fontSize:10, color:"var(--muted)", marginTop:2 }}>{s[1]}</div>
          </div>
        ))}
      </div>

      {/* Desglose XP */}
      <div className="fh-card" style={{ padding:16, marginBottom:12 }}>
        <div className="disp" style={{ fontWeight:600, fontSize:15, marginBottom:2 }}>Desglose de XP</div>
        <Row label="Base por completar" val={"+"+r.xpBase}/>
        <Row label={`Series completadas (${r.seriesDone})`} val={"+"+r.xpSets}/>
        {r.xpPr>0 && <Row label={`Récords personales (${r.prs.length})`} val={"+"+r.xpPr} color="var(--gold)"/>}
        {r.xpAmigo>0 && <Row label={`Estreno de la rutina de ${r.amigoDe?.displayName || "@"+r.amigoDe?.handle}`} val={"+"+r.xpAmigo} color="var(--jade)"/>}
        {r.xpGoal>0 && <Row label="Objetivo semanal" val={"+"+r.xpGoal} color="var(--jade)"/>}
        {r.missionXp>0 && <Row label="Misiones semanales" val={"+"+r.missionXp} color="var(--arcane)"/>}
        {r.achXp>0 && <Row label="Logros desbloqueados" val={"+"+r.achXp} color="var(--violet)"/>}
        <div style={{ display:"flex", justifyContent:"space-between", padding:"9px 0 0", borderTop:"1px solid var(--line2)", marginTop:4 }}>
          <span className="disp" style={{ fontWeight:700 }}>Total</span><span className="mono disp" style={{ fontWeight:700, color:"var(--gold)" }}>+{r.sessionXp} XP</span>
        </div>
      </div>

      {/* Comparación */}
      {r.volDelta!=null && (
        <div className="fh-card" style={{ padding:14, marginBottom:12, display:"flex", alignItems:"center", gap:10 }}>
          <TrendingUp size={18} color={r.volDelta>=0?"var(--jade)":"var(--ember)"}/>
          <div style={{ fontSize:13 }}>
            {r.volDelta>=0
              ? <>Has movido un <b style={{ color:"var(--jade)" }}>{r.volDelta}% más</b> que la última vez en este día. Eso es progreso real.</>
              : <>Hoy un <b style={{ color:"var(--ember)" }}>{Math.abs(r.volDelta)}% menos</b> que la última vez. Pasa: descansa y a por la próxima.</>}
          </div>
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
      {r.missionsDone && r.missionsDone.length>0 && (
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
      {r.unlocked.length>0 && (
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

      {r.muscleLevelUps && r.muscleLevelUps.length>0 && (
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

      {r.cheatEarned && (
        <div className="fh-card" style={{ padding:14, marginBottom:12, display:"flex", alignItems:"center", gap:10, borderColor:"var(--ember)" }}>
          <Cookie size={20} color="var(--ember)"/><div style={{ fontSize:13 }}>¡Objetivo semanal cumplido! Has ganado <b style={{ color:"var(--ember)" }}>1 cheat day</b>.</div>
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

function WorkoutCalendar({ log, sub }){
  const [month, setMonth] = useState(()=>{ const d=new Date(); return { y:d.getFullYear(), m:d.getMonth() }; });
  const [sel, setSel] = useState(null);

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
  const monthCount = Object.keys(byDate).filter(k=>k.startsWith(`${month.y}-${String(month.m+1).padStart(2,"0")}`)).length;

  function shift(n){ let m=month.m+n, y=month.y; if(m<0){ m=11; y--; } if(m>11){ m=0; y++; } setMonth({ y, m }); setSel(null); }

  const navBtn = { background:"var(--card2)", border:"1px solid var(--line2)", borderRadius:8, width:30, height:30, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"var(--muted)" };
  const selWorkouts = sel ? (byDate[sel] || []) : [];

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
          const isToday = dISO===today;
          const isPay = dISO===payISO;
          const isSel = dISO===sel;
          return (
            <button key={dISO} onClick={()=>has ? setSel(isSel?null:dISO) : null}
              style={{ aspectRatio:"1", borderRadius:9, position:"relative", cursor:has?"pointer":"default",
                background: has ? "rgba(232,176,75,.16)" : "transparent",
                border: `1px solid ${isSel?"var(--gold)":isToday?"var(--sky)":"transparent"}`,
                color: has?"var(--txt)":"var(--faint)", fontSize:12.5, fontWeight:has?700:500,
                display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'JetBrains Mono',monospace" }}>
              {d}
              {has && <span style={{ position:"absolute", bottom:4, width:4, height:4, borderRadius:"50%", background:"var(--gold)" }}/>}
              {isPay && <span style={{ position:"absolute", top:2, right:3, fontSize:9, color:"var(--ember)", fontWeight:700 }}>€</span>}
            </button>
          );
        })}
      </div>

      <div style={{ display:"flex", gap:14, marginTop:12, flexWrap:"wrap", fontSize:10.5, color:"var(--faint)" }}>
        <span style={{ display:"flex", alignItems:"center", gap:5 }}><span style={{ width:6, height:6, borderRadius:"50%", background:"var(--gold)" }}/> Entreno</span>
        <span style={{ display:"flex", alignItems:"center", gap:5 }}><span style={{ width:8, height:8, borderRadius:3, border:"1px solid var(--sky)" }}/> Hoy</span>
        {payISO && <span style={{ display:"flex", alignItems:"center", gap:5 }}><span style={{ color:"var(--ember)", fontWeight:700 }}>€</span> Renovación</span>}
      </div>

      {sel && selWorkouts.length>0 && (
        <div style={{ marginTop:12, paddingTop:12, borderTop:"1px solid var(--line)" }}>
          <div style={{ fontSize:12, color:"var(--muted)", marginBottom:8 }}>{sel.slice(8,10)}/{sel.slice(5,7)}/{sel.slice(0,4)}</div>
          {selWorkouts.map((w,i)=>(
            <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8, padding:"6px 0", fontSize:13 }}>
              <span style={{ display:"flex", alignItems:"center", gap:8 }}><Dumbbell size={14} color="var(--gold)"/> {w.routineName}{w.dayName?` · ${w.dayName}`:""}</span>
              <span className="disp" style={{ color:"var(--muted)", fontSize:12 }}>{(w.volume||0).toLocaleString("es-ES")} kg</span>
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

function ProgressView({ state, log, measures, addMeasurement, customRoutines }){
  const [form, setForm] = useState({ weightKg:"", chest:"", waist:"", arm:"" });
  const volData=log.slice(-12).map((s,i)=>({ name:`S${i+1}`, v:s.volume }));
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
      <header style={{ padding:"22px 2px 8px" }}>
        <h1 style={{ margin:0, fontSize:22 }}>Progreso</h1>
        <p style={{ margin:"4px 0 0", fontSize:13, color:"var(--muted)" }}>Aquí ves el cambio antes que en el espejo.</p>
      </header>

      <WorkoutCalendar log={log} sub={state.sub}/>

      {state.cycle?.enabled && <CycleCalendar cycle={state.cycle}/>}

      <div className="fh-card" style={{ padding:16, marginTop:12, display:"flex", alignItems:"center", gap:16 }}>
        <Ring pct={consist/100} size={78} stroke={7} color="var(--jade)"><div className="disp" style={{ fontSize:19, fontWeight:700 }}>{consist}%</div></Ring>
        <div><div className="disp" style={{ fontWeight:600, fontSize:15 }}>Constancia del mes</div>
          <div style={{ fontSize:12, color:"var(--muted)", marginTop:3 }}>{monthWorkouts} de {monthGoal} sesiones previstas</div>
          <div style={{ fontSize:11, color:"var(--faint)", marginTop:3 }}>La constancia es lo que mueve el espejo.</div></div>
      </div>

      <div className="fh-card" style={{ padding:16, marginTop:12 }}>
        <div className="disp" style={{ fontWeight:600, fontSize:15, marginBottom:4 }}>Fuerza total por sesión</div>
        <div style={{ fontSize:11, color:"var(--muted)", marginBottom:10 }}>Kg totales movidos. Si sube, estás progresando.</div>
        {volData.length>1 ? (
          <ResponsiveContainer width="100%" height={150}><BarChart data={volData}>
            <CartesianGrid vertical={false} stroke="var(--line)"/>
            <XAxis dataKey="name" tick={{ fill:"var(--faint)", fontSize:10 }} axisLine={false} tickLine={false}/>
            <YAxis tick={{ fill:"var(--faint)", fontSize:10 }} axisLine={false} tickLine={false} width={34}/>
            <Tooltip contentStyle={{ background:"var(--card2)", border:"1px solid var(--line2)", borderRadius:10, fontSize:12 }} labelStyle={{ color:"var(--muted)" }} cursor={{ fill:"rgba(232,176,75,.08)" }}/>
            <Bar dataKey="v" fill="var(--gold)" radius={[4,4,0,0]}/>
          </BarChart></ResponsiveContainer>
        ) : <Empty text="Completa 2 sesiones para ver tu curva de fuerza"/>}
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
   FICHA DE PERSONAJE
   ========================================================================= */

function CharacterView({ state, level, rank, log, customRoutines }){
  const RankIcon=rank.icon;
  const [openStat, setOpenStat] = useState(null);
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
  const sorted=[...stats].sort((a,b)=>b.lv-a.lv);
  const strongest=sorted[0], weakest=sorted[sorted.length-1];
  const weakPick=weakest.todo.find(n=>inActive.has(n)) || weakest.todo[0] || weakest.done[0];

  return (
    <div className="fh-in">
      <header style={{ padding:"22px 2px 12px" }}>
        <h1 style={{ margin:0, fontSize:22 }}>Ficha de personaje</h1>
        <p style={{ margin:"4px 0 0", fontSize:13, color:"var(--muted)" }}>Cada parte del cuerpo sube de nivel con su propio entrenamiento.</p>
      </header>

      <div className="fh-card fh-framed" style={{ padding:20, display:"flex", alignItems:"center", gap:18 }}>
        <Ring pct={xpInto/xpNeed} size={112} stroke={9} color={rank.color}>
          <RankIcon size={20} color={rank.color}/>
          <div className="cinzel" style={{ fontSize:27, fontWeight:700, lineHeight:1, marginTop:2 }}>{level}</div>
          <div style={{ fontSize:9, color:"var(--muted)", fontWeight:600 }}>NIVEL</div>
        </Ring>
        <div style={{ flex:1 }}>
          <div className="cinzel" style={{ fontSize:20, fontWeight:700, color:rank.color }}>{rank.name}</div>
          <div style={{ fontSize:12, color:"var(--muted)", marginTop:3 }}>{state.profile?.name||"Atleta"} · {state.totalWorkouts} entrenos</div>
          <div style={{ fontSize:11, color:"var(--faint)", marginTop:7 }}>Faltan {xpNeed-xpInto} XP para nivel {level+1}</div>
        </div>
      </div>

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
            <button onClick={()=>setOpenStat(isOpen?null:s.id)} style={{ background:"none", border:"none", padding:0, cursor:"pointer", color:"var(--txt)", display:"flex", alignItems:"center", gap:12, textAlign:"left", width:"100%" }}>
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
                {s.todo.length ? (
                  <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
                    {s.todo.slice(0,6).map(n=>{ const rec=inActive.has(n); return (
                      <span key={n} style={{ fontSize:11.5, padding:"5px 10px", borderRadius:999, background:rec?"rgba(232,176,75,.14)":"var(--bg2)", color:rec?"var(--gold)":"var(--muted)", border:`1px solid ${rec?"var(--gold)":"var(--line)"}` }}>
                        {n}{rec?" · en tu rutina":""}
                      </span>
                    ); })}
                    {s.todo.length>6 && <span style={{ fontSize:11.5, color:"var(--faint)", alignSelf:"center" }}>+{s.todo.length-6} más</span>}
                  </div>
                ) : <div style={{ fontSize:12, color:"var(--jade)" }}>¡Has probado todos los de este grupo! 💪</div>}
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

      <div className="fh-card" style={{ padding:16, marginTop:12, marginBottom:8 }}>
        <div className="disp" style={{ fontWeight:600, fontSize:14, marginBottom:8 }}>Progresar sin lesionarte</div>
        <p style={{ fontSize:12.5, color:"var(--muted)", margin:0, lineHeight:1.55 }}>
          Empieza cada bloque con pocas series por músculo y sube 1-2 por semana. Cuando lleves 4-6 semanas o notes que baja el rendimiento, el sueño empeora o arrastras agujetas, haz una semana suave (deload) con la mitad de series. Sube peso o repeticiones poco a poco: no hace falta llegar al fallo en todo ni buscar agujetas para crecer.
        </p>
      </div>
    </div>
  );
}

/* =========================================================================
   LOGROS
   ========================================================================= */

function AchievementsView({ state, level }){
  const unlocked=Object.keys(state.achievements||{}).length;
  return (
    <div className="fh-in">
      <header style={{ padding:"22px 2px 8px" }}>
        <h1 style={{ margin:0, fontSize:22 }}>Logros</h1>
        <p style={{ margin:"4px 0 0", fontSize:13, color:"var(--muted)" }}>{unlocked} de {ACHIEVEMENTS.length} desbloqueados · nivel {level}</p>
      </header>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:11, marginTop:12 }}>
        {ACHIEVEMENTS.map(a=>{ const got=state.achievements?.[a.id]; const I=a.icon;
          return (<div key={a.id} className="fh-card" style={{ padding:15, textAlign:"center", borderColor:got?"var(--gold)":"var(--line)", opacity:got?1:.6, background:got?"linear-gradient(160deg,var(--card),var(--card2))":"var(--card)" }}>
            <div style={{ width:46, height:46, borderRadius:13, margin:"0 auto 10px", display:"flex", alignItems:"center", justifyContent:"center", background:got?"var(--gold)":"var(--bg2)" }}>
              {got? <I size={22} color="#0F131A"/> : <Lock size={18} color="var(--faint)"/>}
            </div>
            <div className="disp" style={{ fontWeight:700, fontSize:13.5 }}>{a.title}</div>
            <div style={{ fontSize:11, color:"var(--muted)", marginTop:4, lineHeight:1.4, minHeight:30 }}>{a.desc}</div>
            <div className="fh-chip" style={{ marginTop:8, display:"inline-block", background:got?"rgba(232,176,75,.15)":"var(--bg2)", color:got?"var(--gold)":"var(--faint)" }}>+{a.xp} XP</div>
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
            style={{ textAlign:"left", fontFamily:"'Space Grotesk',sans-serif" }}/>
          <div style={{ ...label, marginTop:12 }}>¿Quién te la ha pautado? <span style={{ color:"var(--faint)", fontWeight:400 }}>(opcional)</span></div>
          <input value={d.author} maxLength={60} onChange={e=>setField({ author:e.target.value })} placeholder="Mi dietista-nutricionista"
            style={{ textAlign:"left", fontFamily:"'Space Grotesk',sans-serif" }}/>
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

function DietView({ state, useCheat, mealPlan, saveMealPlan, excludes, setExcludes, setTab, customDiet, saveCustomDiet }){
  const [view, setView] = useState("semana"); // semana | compra
  const [showEx, setShowEx] = useState(false);
  const [dietTip, setDietTip] = useState(()=>Math.floor(Math.random()*FEMALE_DIET_TIPS.length));
  const [dietTipClosed, setDietTipClosed] = useState(false);
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
      <header style={{ padding:"22px 2px 12px" }}>
        <h1 style={{ margin:0, fontSize:22 }}>Dieta</h1>
        <p style={{ margin:"4px 0 0", fontSize:13, color:"var(--muted)" }}>Plan semanal a tu medida y lista para la compra.</p>
      </header>

      {state.profile?.sex === "mujer" && !dietTipClosed && (
        <div className="fh-card" style={{ padding:14, marginBottom:12, borderColor:cycPh?cycPh.color:"#E56B9F", display:"flex", gap:11, alignItems:"flex-start" }}>
          <Heart size={17} color={cycPh?cycPh.color:"#E56B9F"} style={{ flexShrink:0, marginTop:1 }}/>
          <div style={{ flex:1, minWidth:0 }}>
            {cycPh && <div style={{ fontSize:10.5, fontWeight:700, letterSpacing:".06em", color:cycPh.color, marginBottom:4 }}>DIETA · {cycPh.label.toUpperCase()}</div>}
            <div style={{ fontSize:12.5, color:"var(--muted)", lineHeight:1.5 }}>{dietPool[dietTip % dietPool.length]}</div>
            <button onClick={()=>setDietTip(i=>(i+1)%dietPool.length)} style={{ background:"none", border:"none", padding:0, marginTop:8, color:cycPh?cycPh.color:"#E56B9F", cursor:"pointer", fontSize:11, fontWeight:600, display:"flex", alignItems:"center", gap:5 }}><Shuffle size={12}/> Otro consejo</button>
          </div>
          <button onClick={()=>setDietTipClosed(true)} aria-label="Cerrar" style={{ background:"none", border:"none", padding:2, cursor:"pointer", color:"var(--faint)", flexShrink:0 }}><X size={16}/></button>
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

      {state.cheatTokens>0 && (
        <button className="fh-card" onClick={useCheat} style={{ width:"100%", padding:16, marginBottom:14, textAlign:"left", cursor:"pointer", borderColor:"var(--ember)", background:"linear-gradient(135deg,var(--card),var(--card2))" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ background:"var(--ember)", borderRadius:12, padding:10, display:"flex" }}><Cookie size={22} color="#fff"/></div>
            <div><div className="disp" style={{ fontWeight:700, fontSize:15 }}>Tienes {state.cheatTokens} cheat day{state.cheatTokens>1?"s":""}</div>
              <div style={{ fontSize:12, color:"var(--muted)" }}>Te lo has ganado entrenando. Toca para canjear.</div></div>
          </div>
        </button>
      )}

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

      {/* Regla del plato: solo con el plan de la app; con una pauta profesional manda la suya. */}
      {!useMine && (
      <div className="fh-card" style={{ padding:16, marginTop:6 }}>
        <div className="disp" style={{ fontWeight:600, fontSize:15, marginBottom:10 }}>Regla del plato (para recomposición)</div>
        <div style={{ display:"flex", height:16, borderRadius:8, overflow:"hidden", marginBottom:10 }}>
          <div style={{ flex:2, background:"var(--jade)" }}/><div style={{ flex:2, background:"var(--ember)" }}/><div style={{ flex:1, background:"var(--gold)" }}/>
        </div>
        <div style={{ display:"flex", gap:14, fontSize:11.5, color:"var(--muted)", flexWrap:"wrap" }}>
          <span><b style={{ color:"var(--jade)" }}>●</b> ½ verdura/fruta</span>
          <span><b style={{ color:"var(--ember)" }}>●</b> algo más de ⅓ proteína</span>
          <span><b style={{ color:"var(--gold)" }}>●</b> resto hidratos</span>
        </div>
      </div>
      )}

      <p style={{ fontSize:11.5, color:"var(--faint)", textAlign:"center", marginTop:14, lineHeight:1.55 }}>
        {useMine
          ? "Esta es la pauta que has guardado tú: la app la muestra tal cual, sin cambiarla ni calcular nada sobre ella. Ante cualquier duda, quien te la pautó es quien debe resolverla."
          : "Son ideas generales de comidas variadas con prioridad a la proteína, no un plan nutricional personalizado ni cantidades exactas. Para ajustar déficit y raciones a tu caso, un dietista-nutricionista es la mejor opción."}
      </p>
    </div>
  );
}
