/* =========================================================================
   RPGym · capa de nube (Supabase)

   REGLA DE ORO: esto es OPCIONAL. Si no hay credenciales, si no hay red o si
   Supabase está caído/pausado, la app tiene que seguir funcionando exactamente
   igual que antes. Aquí NADA lanza excepciones hacia arriba: todo devuelve
   { ok, ... } y el que llama decide. Entrenar nunca puede depender del servidor.

   Las credenciales se inyectan en tiempo de build desde .env (ver .env.example).
   La anon key es PÚBLICA por diseño (viaja dentro del APK): la seguridad real
   son las políticas RLS de supabase/schema.sql.
   ========================================================================= */
import { createClient } from "@supabase/supabase-js";

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
  if (m.includes("rate limit") || m.includes("too many"))
    return "Demasiados intentos seguidos. Espera un minuto y vuelve a probar.";
  if (m.includes("failed to fetch") || m.includes("network"))
    return "Sin conexión con el servidor. Puedes seguir entrenando: se guardará en el móvil.";
  return "No se ha podido conectar. Inténtalo otra vez en un momento.";
}

const sinNube = { ok:false, msg:"La nube no está configurada en esta versión de la app." };

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
    if (!data.session) return { ok:true, necesitaConfirmar:true, handle:h, displayName };

    const p = await asegurarPerfil({ handle:h, displayName });
    if (!p.ok) return p;
    return { ok:true, necesitaConfirmar:false, perfil:p.perfil };
  } catch (e) { return { ok:false, msg:traducir(e) }; }
}

export async function entrar({ email, password }){
  if (!supabase) return sinNube;
  try {
    const { error } = await supabase.auth.signInWithPassword({ email: String(email).trim(), password });
    if (error) return { ok:false, msg:traducir(error) };
    return { ok:true };
  } catch (e) { return { ok:false, msg:traducir(e) }; }
}

export async function salir(){
  if (!supabase) return { ok:true };
  try { await supabase.auth.signOut(); } catch {}
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

    let h = String(handle || "").trim().toLowerCase();
    if (!/^[a-z0-9_.]{3,20}$/.test(h)) h = ("atleta" + Math.random().toString(36).slice(2, 7));

    for (let intento = 0; intento < 5; intento++) {
      const candidato = intento === 0 ? h : `${h}${intento + 1}`.slice(0, 20);
      const { data, error } = await supabase.from("profiles")
        .insert({ id:user.id, handle:candidato, display_name:String(displayName || "").slice(0, 40) })
        .select().single();
      if (!error) return { ok:true, perfil:data };
      if (!String(error.message || "").toLowerCase().includes("duplicate")) return { ok:false, msg:traducir(error) };
      // handle pillado: probamos con sufijo
    }
    return { ok:false, msg:"No hemos podido reservarte un nombre de usuario. Prueba con otro." };
  } catch (e) { return { ok:false, msg:traducir(e) }; }
}

/* Sube el estado de juego (lo que se ve en el leaderboard). Nada personal. */
export async function sincronizarPerfil({ level, xp, totalWorkouts, bestStreak, displayName, appVersion }){
  if (!supabase) return sinNube;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok:false, msg:"No hay sesión." };
    const { error } = await supabase.from("profiles").update({
      level, xp, total_workouts:totalWorkouts, best_streak:bestStreak,
      display_name:String(displayName || "").slice(0, 40),
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
export async function registrarEntreno({ clientId, day, xp }){
  if (!supabase) return sinNube;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok:false, msg:"No hay sesión." };
    const { error } = await supabase.from("workout_points")
      .insert({ user_id:user.id, client_id:String(clientId), day, xp:Math.max(0, Math.min(5000, Math.round(xp) || 0)) });
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
