/* =========================================================================
   RPGym · capa de nube (Supabase)

   REGLA DE ORO: esto es OPCIONAL. Si no hay credenciales, si no hay red o si
   Supabase está caído/pausado, la app tiene que seguir funcionando exactamente
   igual que antes. Aquí NADA lanza excepciones hacia arriba: todo devuelve
   { ok, ... } y el que llama decide. Entrenar nunca puede depender del servidor.

   Las credenciales se inyectan en tiempo de build desde .env (ver .env.example).
   La anon key es PÚBLICA por diseño (viaja dentro del APK): la seguridad real
   son las políticas RLS de supabase/migrations/.

   QUÉ SE SINCRONIZA (app de uso privado entre amigos, no comercial):
   se suben entrenos con su detalle, marcas por ejercicio, medidas y rutinas.
   NO se suben, y esto no se toca:
     · los datos del ciclo menstrual,
     · las rutinas marcadas como privadas por su dueño.
   ========================================================================= */
import { createClient } from "@supabase/supabase-js";
import * as cripto from "./cripto.js";

const URL = import.meta.env.VITE_SUPABASE_URL || "";
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

/* ¿Está la nube configurada en este build? */
export const cloudEnabled = !!(URL && KEY);

export const supabase = cloudEnabled
  ? createClient(URL, KEY, {
      auth: {
        persistSession: true,        // la sesión sobrevive a cerrar la app
        autoRefreshToken: true,
        detectSessionInUrl: false,   // no hay navegación por URL en el WebView
      },
    })
  : null;

/* Traduce los errores de Supabase a algo que se pueda leer en español.
   Nunca enseñes el mensaje crudo: viene en inglés y a veces filtra detalles. */
function traducir(error){
  const m = String(error?.message || "").toLowerCase();
  if (m.includes("invalid login credentials")) return "Correo o contraseña incorrectos.";
  if (m.includes("email not confirmed"))       return "Tienes que confirmar el correo antes de entrar.";
  if (m.includes("user already registered") || m.includes("already been registered"))
    return "Ese correo ya tiene cuenta. Entra con tu contraseña.";
  if (m.includes("password should be at least")) return "La contraseña necesita al menos 6 caracteres.";
  if (m.includes("unable to validate email") || m.includes("invalid email"))
    return "Ese correo no parece válido.";
  if (m.includes("duplicate key") && m.includes("handle")) return "Ese nombre de usuario ya está cogido.";
  /* Los límites de envío NO dicen "rate limit" en el texto: llegan como 429 con
     el motivo en `code` y un mensaje tipo "you can only request this after 49
     seconds". Mirando solo el texto caían en el genérico "no se ha podido
     conectar", que hacía pensar en un problema de red que no existía. */
  const code = String(error?.code || error?.error_code || "");
  if (error?.status === 429 || code.includes("rate_limit") || m.includes("rate limit") || m.includes("too many")) {
    const seg = m.match(/after (\d+) second/);
    return seg ? `Acabas de pedir un código. Espera ${seg[1]} segundos y vuelve a intentarlo.`
               : "Demasiados intentos seguidos. Espera un minuto y vuelve a probar.";
  }
  if (m.includes("failed to fetch") || m.includes("network"))
    return "Sin conexión con el servidor. Puedes seguir entrenando: se guardará en el móvil.";
  return "No se ha podido conectar. Inténtalo otra vez en un momento.";
}

const sinNube = { ok:false, msg:"La nube no está configurada en esta versión de la app." };

/* Datos del registro a medias, para completar el alta cuando llegue el código.
   Se guarda EN EL MÓVIL, no en memoria: entre registrarse y confirmar el correo
   la app se cierra casi siempre, y si el nombre de usuario elegido se pierde,
   asegurarPerfil acaba inventando uno aleatorio ("atletap5vn6"). Pasó de verdad. */
const PENDIENTE = "gym:registroPendiente";
function guardarPendiente(datos){
  try { localStorage.setItem(PENDIENTE, JSON.stringify(datos)); } catch {}
}
export function registroPendiente(){
  try { const s = localStorage.getItem(PENDIENTE); return s ? JSON.parse(s) : null; } catch { return null; }
}
function olvidarPendiente(){ try { localStorage.removeItem(PENDIENTE); } catch {} }

/* --- Sesión ------------------------------------------------------------- */

export async function getSession(){
  if (!supabase) return null;
  try { const { data } = await supabase.auth.getSession(); return data?.session || null; }
  catch { return null; }
}

/* Avisa de login/logout (también cuando el token se renueva solo). */
export function onAuthChange(cb){
  if (!supabase) return () => {};
  const { data } = supabase.auth.onAuthStateChange((_evt, session) => cb(session));
  return () => { try { data?.subscription?.unsubscribe(); } catch {} };
}

/* --- Registro y entrada -------------------------------------------------- */

/* ¿Está libre ese nombre de usuario? Se consulta ANTES de registrarse. */
export async function handleLibre(handle){
  if (!supabase) return sinNube;
  try {
    const { data, error } = await supabase.rpc("handle_disponible", { p_handle: handle });
    if (error) return { ok:false, msg:traducir(error) };
    return { ok:true, libre: !!data };
  } catch (e) { return { ok:false, msg:traducir(e) }; }
}

/* Alta. El handle se reserva DESPUÉS de crear la cuenta, porque hasta que no
   hay sesión las políticas RLS no dejan escribir en profiles. */
export async function registrar({ email, password, handle, displayName }){
  if (!supabase) return sinNube;
  const h = String(handle || "").trim().toLowerCase();
  if (!/^[a-z0-9_.]{3,20}$/.test(h))
    return { ok:false, msg:"El usuario debe tener entre 3 y 20 caracteres: letras, números, punto o guion bajo." };
  try {
    const libre = await handleLibre(h);
    if (libre.ok && !libre.libre) return { ok:false, msg:"Ese nombre de usuario ya está cogido." };

    const { data, error } = await supabase.auth.signUp({ email: String(email).trim(), password });
    if (error) return { ok:false, msg:traducir(error) };

    // Si el proyecto exige confirmar el correo no hay sesión todavía: el perfil
    // se creará en el primer login (ver asegurarPerfil).
    if (!data.session) {
      // Sin sesión aún: se recuerda lo necesario para cuando meta el código.
      guardarPendiente({ email:String(email).trim(), handle:h, displayName });   // sin la contraseña
      return { ok:true, necesitaConfirmar:true, handle:h, displayName };
    }

    await derivarYGuardarClave(password, data.user?.id);
    const p = await asegurarPerfil({ handle:h, displayName });
    if (!p.ok) return p;
    return { ok:true, necesitaConfirmar:false, perfil:p.perfil };
  } catch (e) { return { ok:false, msg:traducir(e) }; }
}

export async function entrar({ email, password }){
  if (!supabase) return sinNube;
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email: String(email).trim(), password });
    if (error) return { ok:false, msg:traducir(error) };
    // Único momento en que tenemos la contraseña: se deriva aquí la clave de
    // la copia cifrada y se guarda en este móvil. Nunca se sube.
    await derivarYGuardarClave(password, data?.user?.id);
    return { ok:true };
  } catch (e) { return { ok:false, msg:traducir(e) }; }
}

async function derivarYGuardarClave(password, userId){
  if (!userId || !cripto.criptoDisponible) return;
  try { await cripto.guardarClave(await cripto.derivarClave(password, userId)); } catch {}
}

/* Verificación por CÓDIGO, no por enlace.
   El enlace de confirmación apunta al "Site URL" del proyecto, que en una app
   de Capacitor no lleva a ninguna parte (por defecto, localhost). Además, si
   abres el correo en el portátil el enlace tampoco serviría. Con un código de
   6 dígitos lo lees donde sea y lo escribes en el móvil. */
export async function verificarCodigo({ email, codigo }){
  if (!supabase) return sinNube;
  const c = String(codigo || "").replace(/\D/g, "");
  if (c.length !== 6) return { ok:false, msg:"El código son 6 dígitos." };
  try {
    const { data, error } = await supabase.auth.verifyOtp({ email:String(email).trim(), token:c, type:"signup" });
    if (error) {
      const m = String(error.message || "").toLowerCase();
      if (m.includes("expired")) return { ok:false, msg:"El código ha caducado. Pide uno nuevo." };
      if (m.includes("invalid")) return { ok:false, msg:"Ese código no es correcto. Repásalo." };
      return { ok:false, msg:traducir(error) };
    }
    return { ok:true, user:data?.user };
  } catch (e) { return { ok:false, msg:traducir(e) }; }
}

export async function reenviarCodigo(email){
  if (!supabase) return sinNube;
  try {
    const { error } = await supabase.auth.resend({ type:"signup", email:String(email).trim() });
    if (error) return { ok:false, msg:traducir(error) };
    return { ok:true };
  } catch (e) { return { ok:false, msg:traducir(e) }; }
}

export async function salir(){
  if (!supabase) return { ok:true };
  try { await supabase.auth.signOut(); } catch {}
  cripto.olvidarClave();          // la clave de la copia no sobrevive al cierre de sesión
  return { ok:true };
}

/* --- Perfil -------------------------------------------------------------- */

export async function miPerfil(){
  if (!supabase) return sinNube;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok:false, msg:"No hay sesión." };
    const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
    if (error) return { ok:false, msg:traducir(error) };
    return { ok:true, perfil:data || null, user };
  } catch (e) { return { ok:false, msg:traducir(e) }; }
}

/* Crea el perfil si aún no existe (primer login tras confirmar el correo).
   Si el handle pedido está pillado, propone uno libre en vez de fallar. */
export async function asegurarPerfil({ handle, displayName }){
  if (!supabase) return sinNube;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok:false, msg:"No hay sesión." };

    const actual = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
    if (actual.data) return { ok:true, perfil:actual.data };

    // Orden: el que pidan > el que eligió al registrarse > uno inventado.
    const pend = registroPendiente();
    let h = String(handle || pend?.handle || "").trim().toLowerCase();
    if (!/^[a-z0-9_.]{3,20}$/.test(h)) h = ("atleta" + Math.random().toString(36).slice(2, 7));

    for (let intento = 0; intento < 5; intento++) {
      const candidato = intento === 0 ? h : `${h}${intento + 1}`.slice(0, 20);
      const { data, error } = await supabase.from("profiles")
        .insert({ id:user.id, handle:candidato, display_name:String(displayName || pend?.displayName || "").slice(0, 40) })
        .select().single();
      if (!error) { olvidarPendiente(); return { ok:true, perfil:data }; }
      if (!String(error.message || "").toLowerCase().includes("duplicate")) return { ok:false, msg:traducir(error) };
      // handle pillado: probamos con sufijo
    }
    return { ok:false, msg:"No hemos podido reservarte un nombre de usuario. Prueba con otro." };
  } catch (e) { return { ok:false, msg:traducir(e) }; }
}

/* Cambiar el nombre de usuario. Hace falta para arreglar a quien le tocó uno
   aleatorio por el fallo de arriba. */
export async function cambiarHandle(nuevo){
  if (!supabase) return sinNube;
  const h = String(nuevo || "").trim().toLowerCase();
  if (!/^[a-z0-9_.]{3,20}$/.test(h))
    return { ok:false, msg:"Entre 3 y 20 caracteres: letras, números, punto o guion bajo." };
  try {
    const libre = await handleLibre(h);
    if (libre.ok && !libre.libre) return { ok:false, msg:"Ese nombre ya está cogido." };
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok:false, msg:"No hay sesión." };
    const { data, error } = await supabase.from("profiles").update({ handle:h }).eq("id", user.id).select().single();
    if (error) return { ok:false, msg:traducir(error) };
    return { ok:true, perfil:data };
  } catch (e) { return { ok:false, msg:traducir(e) }; }
}

/* Sube el estado de juego (lo que se ve en el leaderboard). Nada personal. */
/* `atributos` es el XP EN CRUDO por grupo ({Pecho: 1200, ...}), no el nivel: la
   escala puede cambiar y así cada uno la calcula con su versión de la app. */
export async function sincronizarPerfil({ level, xp, totalWorkouts, bestStreak, displayName, appVersion, atributos }){
  if (!supabase) return sinNube;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok:false, msg:"No hay sesión." };
    const limpio = {};
    Object.entries(atributos || {}).slice(0, 12).forEach(([g, v]) => {
      const n = Math.round(Number(v) || 0);
      if (n > 0) limpio[String(g).slice(0, 16)] = Math.min(9999999, n);
    });
    const { error } = await supabase.from("profiles").update({
      level, xp, total_workouts:totalWorkouts, best_streak:bestStreak,
      display_name:String(displayName || "").slice(0, 40), atributos:limpio,
      app_version:String(appVersion || ""), last_seen:new Date().toISOString(),
    }).eq("id", user.id);
    if (error) return { ok:false, msg:traducir(error) };
    return { ok:true };
  } catch (e) { return { ok:false, msg:traducir(e) }; }
}

/* --- Keep-alive ---------------------------------------------------------- */

/* El plan gratis pausa el proyecto tras ~1 semana sin actividad. Cada apertura
   de la app con sesión cuenta como actividad y evita perder el leaderboard. */
export async function ping(){
  if (!supabase) return sinNube;
  try {
    const { data, error } = await supabase.rpc("ping");
    if (error) return { ok:false, msg:traducir(error) };
    return { ok:true, at:data };
  } catch (e) { return { ok:false, msg:traducir(e) }; }
}

/* --- Clasificaciones ------------------------------------------------------ */

/* Periodos disponibles. La histórica sale de profiles (incluye lo entrenado
   antes de tener cuenta); semanal y mensual salen de workout_points. */
export const PERIODOS = [
  { id:"semanal",   vista:"leaderboard_semanal",   label:"Semana" },
  { id:"mensual",   vista:"leaderboard_mensual",   label:"Mes" },
  { id:"historica", vista:"leaderboard_historica", label:"Siempre" },
];

/* soloAmigos: limita la tabla a tu círculo (tú + tus amigos). */
export async function leaderboard(periodo = "semanal", soloAmigos = false, limite = 50){
  if (!supabase) return sinNube;
  const p = PERIODOS.find(x => x.id === periodo) || PERIODOS[0];
  const vista = soloAmigos ? p.vista.replace("leaderboard_", "amigos_") : p.vista;
  try {
    const { data, error } = await supabase.from(vista).select("*").limit(limite);
    if (error) return { ok:false, msg:traducir(error) };
    return { ok:true, filas:data || [], periodo:p.id };
  } catch (e) { return { ok:false, msg:traducir(e) }; }
}

/* --- Amigos --------------------------------------------------------------
   Círculo cerrado: se invita con un código de 6 caracteres que se manda por
   WhatsApp. Quien lo canjea queda como amigo directamente, sin solicitudes. */

export async function crearInvitacion(){
  if (!supabase) return sinNube;
  try {
    const { data, error } = await supabase.rpc("crear_invitacion");
    if (error) return { ok:false, msg:traducir(error) };
    return { ok:true, code:data };
  } catch (e) { return { ok:false, msg:traducir(e) }; }
}

export async function canjearInvitacion(code){
  if (!supabase) return sinNube;
  const c = String(code || "").trim().toUpperCase();
  if (!/^[A-Z0-9]{6}$/.test(c)) return { ok:false, msg:"El código son 6 letras y números. Repásalo." };
  try {
    const { data, error } = await supabase.rpc("canjear_invitacion", { p_code: c });
    if (error) return { ok:false, msg:traducir(error) };
    // La función devuelve su propio {ok, msg} para los casos de negocio.
    return data?.ok ? { ok:true, amigo:data.amigo, yaEra:!!data.yaEra } : { ok:false, msg:data?.msg || "Ese código no vale." };
  } catch (e) { return { ok:false, msg:traducir(e) }; }
}

export async function listarAmigos(){
  if (!supabase) return sinNube;
  try {
    const { data: amistades, error } = await supabase.from("mis_amigos").select("amigo_id, created_at");
    if (error) return { ok:false, msg:traducir(error) };
    const ids = (amistades || []).map(a => a.amigo_id);
    if (!ids.length) return { ok:true, amigos:[] };
    const { data, error: e2 } = await supabase.from("profiles")
      .select("id, handle, display_name, level, xp, total_workouts").in("id", ids);
    if (e2) return { ok:false, msg:traducir(e2) };
    return { ok:true, amigos:data || [] };
  } catch (e) { return { ok:false, msg:traducir(e) }; }
}

/* --- Rutinas compartidas con los amigos ----------------------------------
   NADA se sube solo: publicar una rutina es una acción explícita del usuario.
   El payload es el mismo formato de encodeRoutine(), ya probado. */

export async function publicarRutina({ clientId, name, dias, payload, privada = false }){
  if (!supabase) return sinNube;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok:false, msg:"Necesitas cuenta para compartir con tus amigos." };
    const { error } = await supabase.from("shared_routines")
      .upsert({ owner_id:user.id, client_id:String(clientId), name:String(name).slice(0,40),
                dias:Number(dias) || 1, payload, privada:!!privada, updated_at:new Date().toISOString() },
              { onConflict:"owner_id,client_id" });
    if (error) return { ok:false, msg:traducir(error) };
    return { ok:true };
  } catch (e) { return { ok:false, msg:traducir(e) }; }
}

export async function dejarDePublicar(clientId){
  if (!supabase) return sinNube;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok:false, msg:"No hay sesión." };
    const { error } = await supabase.from("shared_routines").delete()
      .eq("owner_id", user.id).eq("client_id", String(clientId));
    if (error) return { ok:false, msg:traducir(error) };
    return { ok:true };
  } catch (e) { return { ok:false, msg:traducir(e) }; }
}

/* Qué rutinas mías están publicadas ahora mismo (para pintar el interruptor). */
export async function misRutinasPublicadas(){
  if (!supabase) return sinNube;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok:true, ids:[] };
    const { data, error } = await supabase.from("shared_routines").select("client_id").eq("owner_id", user.id);
    if (error) return { ok:false, msg:traducir(error) };
    return { ok:true, ids:(data || []).map(r => r.client_id) };
  } catch (e) { return { ok:false, msg:traducir(e) }; }
}

export async function rutinasDeAmigos(){
  if (!supabase) return sinNube;
  try {
    const { data, error } = await supabase.from("rutinas_de_amigos").select("*").limit(60);
    if (error) return { ok:false, msg:traducir(error) };
    return { ok:true, rutinas:data || [] };
  } catch (e) { return { ok:false, msg:traducir(e) }; }
}

/* --- Notificaciones push (los tokens; el envío lo hace la Edge Function) --- */

export async function guardarTokenPush(token){
  if (!supabase) return sinNube;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok:false, msg:"No hay sesión." };
    const { error } = await supabase.from("push_tokens")
      .upsert({ token, user_id:user.id, plataforma:"android", updated_at:new Date().toISOString() },
              { onConflict:"token" });
    if (error) return { ok:false, msg:traducir(error) };
    return { ok:true };
  } catch (e) { return { ok:false, msg:traducir(e) }; }
}

export async function borrarTokenPush(){
  if (!supabase) return sinNube;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok:true };
    await supabase.from("push_tokens").delete().eq("user_id", user.id);
    return { ok:true };
  } catch (e) { return { ok:false, msg:traducir(e) }; }
}

/* Avisa a tus amigos de algo. La clave de Firebase NO está aquí: vive en la
   Edge Function, porque dentro del APK cualquiera podría sacarla y mandar
   notificaciones en nombre de otro. */
/* `extra.para` convierte el aviso en dirigido: le llega SOLO a esa persona.
   Es lo que distingue "X está entrenando" (a todos) de "X te ha superado en
   press banca" (a quien de verdad ha superado). El servidor comprueba que
   podéis avisaros; aquí solo se dice a quién. */
export async function avisarAmigos(tipo, extra = {}){
  if (!supabase) return sinNube;
  try {
    const { error } = await supabase.functions.invoke("avisar", { body: { tipo, ...extra } });
    if (error) return { ok:false, msg:traducir(error) };
    return { ok:true };
  } catch (e) { return { ok:false, msg:traducir(e) }; }
}

/* --- Récords por ejercicio -----------------------------------------------
   Permiten compararse con los amigos y avisar de quién te ha adelantado. */

/* `veces` es un mapa ejercicio -> nº de sesiones en las que aparece. Sirve para
   señalar el ejercicio favorito de cada grupo en la ficha de un amigo. */
export async function subirRecords(bests, veces = {}, nombresViejos = []){
  if (!supabase) return sinNube;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok:false, msg:"No hay sesión." };
    const filas = Object.entries(bests || {})
      .filter(([ej, peso]) => ej && Number(peso) > 0)
      .slice(0, 400)
      .map(([ejercicio, peso]) => ({ user_id:user.id, ejercicio:String(ejercicio).slice(0,60),
        peso:Math.min(999, Number(peso) || 0),
        veces:Math.min(100000, Math.max(0, Number(veces[ejercicio]) || 0)),
        updated_at:new Date().toISOString() }));
    if (!filas.length) return { ok:true };
    const { error } = await supabase.from("exercise_records").upsert(filas, { onConflict:"user_id,ejercicio" });
    if (error) return { ok:false, msg:traducir(error) };
    /* Al renombrar un ejercicio, migrarNombres arrastra la marca al nombre nuevo
       EN EL MÓVIL, pero el upsert nunca borra: la vieja se quedaba en el
       servidor y el ejercicio salía DOS VECES en la ficha, con la misma marca.
       Se limpian los nombres que ya no existen. */
    if (nombresViejos.length) {
      await supabase.from("exercise_records").delete()
        .eq("user_id", user.id).in("ejercicio", nombresViejos.slice(0, 200));
    }
    return { ok:true, subidos:filas.length };
  } catch (e) { return { ok:false, msg:traducir(e) }; }
}

/* Amigos que ahora mismo tienen mejor marca que tú en algún ejercicio. */
export async function meHanSuperado(){
  if (!supabase) return sinNube;
  try {
    const { data, error } = await supabase.from("me_han_superado").select("*").limit(20);
    if (error) return { ok:false, msg:traducir(error) };
    return { ok:true, filas:data || [] };
  } catch (e) { return { ok:false, msg:traducir(e) }; }
}

/* A quién has adelantado tú: se consulta al terminar un entreno con récord. */
export async function heSuperado(ejercicios){
  if (!supabase) return sinNube;
  try {
    let q = supabase.from("he_superado").select("*");
    if (ejercicios?.length) q = q.in("ejercicio", ejercicios.slice(0, 20));
    const { data, error } = await q.limit(20);
    if (error) return { ok:false, msg:traducir(error) };
    return { ok:true, filas:data || [] };
  } catch (e) { return { ok:false, msg:traducir(e) }; }
}

/* --- Entrenar juntos ------------------------------------------------------
   Sin tiempo real: se consulta quién está entrenando al abrir la app. Del
   entreno solo viaja el nombre de la rutina y el XP; el detalle no sale. */

export async function abrirSesionConjunta(rutina){
  if (!supabase) return sinNube;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok:false, msg:"No hay sesión." };
    const { data, error } = await supabase.from("joint_sessions")
      .insert({ created_by:user.id, rutina:String(rutina || "").slice(0,60) }).select().single();
    if (error) return { ok:false, msg:traducir(error) };
    await supabase.from("joint_members").insert({ session_id:data.id, user_id:user.id });
    return { ok:true, sesion:data };
  } catch (e) { return { ok:false, msg:traducir(e) }; }
}

export async function unirseSesion(sessionId){
  if (!supabase) return sinNube;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok:false, msg:"No hay sesión." };
    const { error } = await supabase.from("joint_members")
      .upsert({ session_id:sessionId, user_id:user.id }, { onConflict:"session_id,user_id" });
    if (error) return { ok:false, msg:traducir(error) };
    return { ok:true };
  } catch (e) { return { ok:false, msg:traducir(e) }; }
}

export async function quienEntrenaAhora(){
  if (!supabase) return sinNube;
  try {
    const { data, error } = await supabase.from("entrenando_ahora").select("*").limit(10);
    if (error) return { ok:false, msg:traducir(error) };
    return { ok:true, sesiones:data || [] };
  } catch (e) { return { ok:false, msg:traducir(e) }; }
}

/* Al terminar: registra tu aportación y, si la abriste tú, cierra la sesión. */
export async function cerrarAportacion({ sessionId, xp, laAbriYo }){
  if (!supabase) return sinNube;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok:false, msg:"No hay sesión." };
    await supabase.from("joint_members")
      .update({ xp:Math.max(0, Math.min(5000, Math.round(xp) || 0)) })
      .eq("session_id", sessionId).eq("user_id", user.id);
    if (laAbriYo) {
      await supabase.from("joint_sessions").update({ ended_at:new Date().toISOString() }).eq("id", sessionId);
    }
    const { data } = await supabase.from("compañeros_sesion").select("*").eq("session_id", sessionId);
    return { ok:true, companeros:(data || []).filter(c => c.id !== user.id) };
  } catch (e) { return { ok:false, msg:traducir(e) }; }
}

/* --- Copia de seguridad en la nube (cifrada en el móvil) ------------------
   El servidor solo ve bytes opacos: el cifrado y el descifrado ocurren en el
   dispositivo (ver cripto.js). Aquí solo se sube y se baja el bulto. */

export async function subirCopia({ cifrado, iv, dispositivo }){
  if (!supabase) return sinNube;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok:false, msg:"No hay sesión." };
    const { error } = await supabase.from("backups").upsert({
      user_id:user.id, cifrado, iv, dispositivo:String(dispositivo || "").slice(0,40),
      bytes:cifrado.length, updated_at:new Date().toISOString(),
    }, { onConflict:"user_id" });
    if (error) return { ok:false, msg:traducir(error) };
    return { ok:true };
  } catch (e) { return { ok:false, msg:traducir(e) }; }
}

export async function bajarCopia(){
  if (!supabase) return sinNube;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok:false, msg:"No hay sesión." };
    const { data, error } = await supabase.from("backups").select("*").eq("user_id", user.id).maybeSingle();
    if (error) return { ok:false, msg:traducir(error) };
    return { ok:true, copia:data || null };
  } catch (e) { return { ok:false, msg:traducir(e) }; }
}

export async function borrarCopia(){
  if (!supabase) return sinNube;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok:false, msg:"No hay sesión." };
    const { error } = await supabase.from("backups").delete().eq("user_id", user.id);
    if (error) return { ok:false, msg:traducir(error) };
    return { ok:true };
  } catch (e) { return { ok:false, msg:traducir(e) }; }
}

/* --- Novedades del círculo ------------------------------------------------
   Lo que ha pasado desde la última vez que abriste la app. Se derivan de los
   datos que ya existen: no hay tabla de actividad que mantener ni proteger. */
/* `hasta` y `limite` los usa el informe semanal, que pide una semana cerrada y
   necesita todas sus filas, no las 40 últimas. Sin ellos se comporta igual que
   siempre: lo ocurrido desde la última visita. */
export async function novedades(desde, { hasta = null, limite = 40 } = {}){
  if (!supabase) return sinNube;
  try {
    let q = supabase.from("novedades").select("*").order("cuando", { ascending:false }).limit(limite);
    if (desde) q = q.gt("cuando", desde);
    if (hasta) q = q.lt("cuando", hasta);
    const { data, error } = await q;
    if (error) return { ok:false, msg:traducir(error) };
    return { ok:true, novedades:data || [] };
  } catch (e) { return { ok:false, msg:traducir(e) }; }
}

/* --- Quedadas para ir juntos al gimnasio --------------------------------- */

export async function listarQuedadas(){
  if (!supabase) return sinNube;
  try {
    const { data, error } = await supabase.from("quedadas").select("*").limit(30);
    if (error) return { ok:false, msg:traducir(error) };
    return { ok:true, quedadas:data || [] };
  } catch (e) { return { ok:false, msg:traducir(e) }; }
}

export async function crearQuedada({ cuando, lugar, nota }){
  if (!supabase) return sinNube;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok:false, msg:"Necesitas cuenta para quedar con tus amigos." };
    const { data, error } = await supabase.from("meetups")
      .insert({ created_by:user.id, cuando, lugar:String(lugar || "").slice(0,60), nota:String(nota || "").slice(0,200) })
      .select().single();
    if (error) return { ok:false, msg:traducir(error) };
    // Quien la propone va, evidentemente.
    await supabase.from("meetup_guests").insert({ meetup_id:data.id, user_id:user.id, respuesta:"voy" });
    return { ok:true, quedada:data };
  } catch (e) { return { ok:false, msg:traducir(e) }; }
}

export async function responderQuedada(meetupId, respuesta){
  if (!supabase) return sinNube;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok:false, msg:"No hay sesión." };
    const { error } = await supabase.from("meetup_guests")
      .upsert({ meetup_id:meetupId, user_id:user.id, respuesta, updated_at:new Date().toISOString() },
              { onConflict:"meetup_id,user_id" });
    if (error) return { ok:false, msg:traducir(error) };
    return { ok:true };
  } catch (e) { return { ok:false, msg:traducir(e) }; }
}

export async function cancelarQuedada(meetupId){
  if (!supabase) return sinNube;
  try {
    const { error } = await supabase.from("meetups").delete().eq("id", meetupId);
    if (error) return { ok:false, msg:traducir(error) };
    return { ok:true };
  } catch (e) { return { ok:false, msg:traducir(e) }; }
}

export async function asistentes(meetupId){
  if (!supabase) return sinNube;
  try {
    const { data, error } = await supabase.from("quedada_asistentes")
      .select("*").eq("meetup_id", meetupId).eq("respuesta", "voy");
    if (error) return { ok:false, msg:traducir(error) };
    return { ok:true, gente:data || [] };
  } catch (e) { return { ok:false, msg:traducir(e) }; }
}

/* --- Ficha de un amigo --------------------------------------------------- */

/* Todo lo de un amigo de una vez: su perfil y sus marcas. Con eso el móvil ya
   puede pintarle la ficha (los atributos salen de cruzar los ejercicios con el
   catálogo local, no hace falta que el servidor sepa de músculos). */
export async function fichaDeAmigo(amigoId){
  if (!supabase) return sinNube;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const [perfil, records, mios] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", amigoId).maybeSingle(),
      supabase.from("exercise_records").select("*").eq("user_id", amigoId).order("peso", { ascending:false }),
      user ? supabase.from("exercise_records").select("ejercicio,peso").eq("user_id", user.id)
           : Promise.resolve({ data:[] }),
    ]);
    if (perfil.error) return { ok:false, msg:traducir(perfil.error) };
    if (!perfil.data)  return { ok:false, msg:"Ese perfil ya no existe." };
    // Mis marcas del servidor sirven de red: en un móvil recién instalado el
    // historial local está vacío y la comparación se quedaría en blanco.
    const mapaMios = {};
    (mios.data || []).forEach(r => { mapaMios[r.ejercicio] = Number(r.peso) || 0; });
    // Sin amistad, RLS devuelve cero marcas en vez de fallar: no es un error.
    return { ok:true, perfil:perfil.data, records:records.data || [], mios:mapaMios };
  } catch (e) { return { ok:false, msg:traducir(e) }; }
}

/* Quedada con nombre y apellidos: se crea y se invita a alguien concreto.
   El invitado la ve como "te ha invitado X" y contesta desde su Inicio. */
export async function quedarCon({ amigoId, cuando, lugar, nota }){
  if (!supabase) return sinNube;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok:false, msg:"Necesitas cuenta para quedar con tus amigos." };
    const { data, error } = await supabase.from("meetups")
      .insert({ created_by:user.id, cuando, lugar:String(lugar || "").slice(0,60), nota:String(nota || "").slice(0,200) })
      .select().single();
    if (error) return { ok:false, msg:traducir(error) };
    // Quien propone va; el invitado queda pendiente de contestar.
    await supabase.from("meetup_guests").insert({ meetup_id:data.id, user_id:user.id, respuesta:"voy" });
    const inv = await supabase.from("meetup_guests").insert({ meetup_id:data.id, user_id:amigoId, respuesta:"invitado" });
    if (inv.error) return { ok:true, quedada:data, avisoFallido:true };
    return { ok:true, quedada:data };
  } catch (e) { return { ok:false, msg:traducir(e) }; }
}

/* --- Buscar gente y solicitudes de amistad ------------------------------- */

export async function buscarGente(texto){
  if (!supabase) return sinNube;
  const t = String(texto || "").trim();
  if (t.length < 2) return { ok:true, gente:[] };
  try {
    const { data, error } = await supabase.rpc("buscar_gente", { p_texto: t });
    if (error) return { ok:false, msg:traducir(error) };
    return { ok:true, gente:data || [] };
  } catch (e) { return { ok:false, msg:traducir(e) }; }
}

export async function pedirAmistad(userId){
  if (!supabase) return sinNube;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok:false, msg:"No hay sesión." };
    const { error } = await supabase.from("friend_requests").insert({ de:user.id, para:userId });
    if (error) {
      // Índice único: ya hay una solicitud viva en ese sentido.
      if (String(error.message||"").includes("friend_requests_viva")) return { ok:false, msg:"Ya le has mandado una solicitud. Espera a que conteste." };
      return { ok:false, msg:traducir(error) };
    }
    return { ok:true };
  } catch (e) { return { ok:false, msg:traducir(e) }; }
}

export async function solicitudesRecibidas(){
  if (!supabase) return sinNube;
  try {
    const { data, error } = await supabase.from("solicitudes_recibidas").select("*").limit(30);
    if (error) return { ok:false, msg:traducir(error) };
    return { ok:true, solicitudes:data || [] };
  } catch (e) { return { ok:false, msg:traducir(e) }; }
}

/* Aceptar crea además la amistad, así que va por función: friendships no tiene
   política de insert a propósito. */
export async function responderSolicitud(id, acepto){
  if (!supabase) return sinNube;
  try {
    const { data, error } = await supabase.rpc("responder_solicitud", { p_id:id, p_acepto:!!acepto });
    if (error) return { ok:false, msg:traducir(error) };
    if (!data?.ok) return { ok:false, msg:data?.msg || "No se ha podido." };
    return { ok:true, aceptada:!!data.aceptada };
  } catch (e) { return { ok:false, msg:traducir(e) }; }
}

/* --- Mandar una rutina a un amigo ---------------------------------------- */

/* El payload es el MISMO que viaja en el código de texto: ejercicios por
   nombre. Así el receptor lo reconstruye con su catálogo, igual que al pegar
   un código, y una versión distinta de la app no rompe nada. */
export async function mandarRutina({ amigoId, clientId, name, dias, payload }){
  if (!supabase) return sinNube;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok:false, msg:"No hay sesión." };
    const { error } = await supabase.from("routine_sends")
      .insert({ de:user.id, para:amigoId, client_id:String(clientId||""), name:String(name||"").slice(0,60), dias:Number(dias)||0, payload });
    if (error) return { ok:false, msg:traducir(error) };
    // Para que la copia del otro pueda seguir tus cambios luego.
    await asegurarFilaCompartida({ userId:user.id, clientId, name, dias, payload });
    return { ok:true };
  } catch (e) { return { ok:false, msg:traducir(e) }; }
}

export async function rutinasRecibidas(){
  if (!supabase) return sinNube;
  try {
    const { data, error } = await supabase.from("rutinas_recibidas").select("*").limit(20);
    if (error) return { ok:false, msg:traducir(error) };
    return { ok:true, envios:data || [] };
  } catch (e) { return { ok:false, msg:traducir(e) }; }
}

export async function responderRutina(id, acepto){
  if (!supabase) return sinNube;
  try {
    const { error } = await supabase.from("routine_sends")
      .update({ estado: acepto ? "aceptada" : "rechazada", updated_at:new Date().toISOString() })
      .eq("id", id);
    if (error) return { ok:false, msg:traducir(error) };
    return { ok:true };
  } catch (e) { return { ok:false, msg:traducir(e) }; }
}

/* --- Rutinas que siguen a su dueño --------------------------------------- */

/* Mandar una rutina crea también su fila en shared_routines para que el
   seguidor pueda leerla luego. Se crea PRIVADA: mandársela a una persona no es
   publicarla para todo el círculo. En una fila que ya existía no se toca ese
   flag, solo el contenido. */
async function asegurarFilaCompartida({ userId, clientId, name, dias, payload }){
  await supabase.from("shared_routines").upsert(
    { owner_id:userId, client_id:clientId, name:String(name||"").slice(0,60), dias:Number(dias)||0, payload, privada:true },
    { onConflict:"owner_id,client_id", ignoreDuplicates:true });
  await supabase.from("shared_routines")
    .update({ name:String(name||"").slice(0,60), dias:Number(dias)||0, payload, updated_at:new Date().toISOString() })
    .eq("owner_id", userId).eq("client_id", clientId);
}

/* El dueño ha editado una rutina: si tiene fila (porque la publicó o se la
   mandó a alguien), se actualiza. Si no la tiene, esto NO crea nada — por
   defecto las rutinas no salen del móvil y eso no cambia. */
export async function actualizarRutinaCompartida({ clientId, name, dias, payload }){
  if (!supabase) return sinNube;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok:false, msg:"No hay sesión." };
    const { error } = await supabase.from("shared_routines")
      .update({ name:String(name||"").slice(0,60), dias:Number(dias)||0, payload, updated_at:new Date().toISOString() })
      .eq("owner_id", user.id).eq("client_id", clientId);
    if (error) return { ok:false, msg:traducir(error) };
    return { ok:true };
  } catch (e) { return { ok:false, msg:traducir(e) }; }
}

/* Quedar apuntado como seguidor de la rutina de un amigo, para recibir sus
   cambios. `localId` es el id que tiene la copia en MI móvil. */
export async function seguirRutina({ ownerId, clientId, localId }){
  if (!supabase || !ownerId || !clientId) return { ok:false };
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok:false, msg:"No hay sesión." };
    const { error } = await supabase.from("routine_followers").upsert(
      { owner_id:ownerId, client_id:clientId, follower_id:user.id, local_id:String(localId||"") },
      { onConflict:"owner_id,client_id,follower_id" });
    if (error) return { ok:false, msg:traducir(error) };
    return { ok:true };
  } catch (e) { return { ok:false, msg:traducir(e) }; }
}

export async function dejarDeSeguirRutina({ ownerId, clientId }){
  if (!supabase) return { ok:true };
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok:true };
    await supabase.from("routine_followers").delete()
      .eq("owner_id", ownerId).eq("client_id", clientId).eq("follower_id", user.id);
    return { ok:true };
  } catch { return { ok:true }; }
}

export async function rutinasSeguidas(){
  if (!supabase) return sinNube;
  try {
    const { data, error } = await supabase.from("rutinas_seguidas").select("*").limit(40);
    if (error) return { ok:false, msg:traducir(error) };
    return { ok:true, rutinas:data || [] };
  } catch (e) { return { ok:false, msg:traducir(e) }; }
}

export async function borrarAmigo(amigoId){
  if (!supabase) return sinNube;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok:false, msg:"No hay sesión." };
    // La fila está guardada con los uuid ordenados: hay que buscarla en ese orden.
    const [a, b] = [user.id, amigoId].sort();
    const { error } = await supabase.from("friendships").delete().eq("a", a).eq("b", b);
    if (error) return { ok:false, msg:traducir(error) };
    return { ok:true };
  } catch (e) { return { ok:false, msg:traducir(e) }; }
}

/* Registra el XP de un entreno para las clasificaciones por periodo.
   Sube SOLO fecha y XP: el detalle del entreno no sale del móvil.
   client_id es el identificador local, para que reintentar no duplique. */
export async function registrarEntreno({ clientId, day, xp, prs = 0, rutina = "", detalle = null }){
  if (!supabase) return sinNube;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok:false, msg:"No hay sesión." };
    const { error } = await supabase.from("workout_points")
      .insert({ user_id:user.id, client_id:String(clientId), day,
                xp:Math.max(0, Math.min(5000, Math.round(xp) || 0)),
                prs:Math.max(0, Math.min(50, Math.round(prs) || 0)),
                rutina:String(rutina || "").slice(0,80), detalle:detalle || null });
    // 23505 = clave duplicada: ese entreno ya estaba registrado. No es un error.
    if (error && error.code !== "23505") return { ok:false, msg:traducir(error) };
    return { ok:true, yaEstaba: error?.code === "23505" };
  } catch (e) { return { ok:false, msg:traducir(e) }; }
}

/* --- Aviso de versión nueva ---------------------------------------------- */

/* El APK vive en Supabase Storage (no en la base: 500 MB de límite y los
   backups se inflarían). Aquí solo se consulta si hay una versión más nueva. */
export async function versionMasNueva(versionCodeActual){
  if (!supabase) return sinNube;
  try {
    const { data, error } = await supabase.from("app_versions")
      .select("*").order("version_code", { ascending:false }).limit(1).maybeSingle();
    if (error) return { ok:false, msg:traducir(error) };
    if (!data || Number(data.version_code) <= Number(versionCodeActual)) return { ok:true, hayNueva:false };
    return { ok:true, hayNueva:true, version:data };
  } catch (e) { return { ok:false, msg:traducir(e) }; }
}
