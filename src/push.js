/* =========================================================================
   RPGym · notificaciones push (Firebase Cloud Messaging)

   Supabase NO envía push: hace falta FCM. El envío lo hace una Edge Function
   (supabase/functions/avisar), que es quien tiene la clave de servicio; desde
   el móvil solo se registra el dispositivo y se escuchan los avisos.

   Igual que el resto de la nube: si no está configurado, si no hay permiso o
   si el plugin no existe (navegador), NADA falla. La app sigue igual.

   El plugin se carga por BRIDGE GLOBAL, no con import: importarlo rompería el
   bundle web, que es el mismo que se usa para desarrollar. Misma regla que ya
   seguía @capacitor/local-notifications.
   ========================================================================= */
import * as cloud from "./cloud.js";

const PN = () => (typeof window !== "undefined" && window.Capacitor?.Plugins?.PushNotifications) || null;

/* CUIDADO: que el plugin exista NO basta. En Android llama a
   FirebaseMessaging.getInstance(), que revienta con una excepción nativa si no
   hay google-services.json. Comprobar solo el puente hizo que la app CRASHEARA
   en la v1.0.0: el plugin estaba, Firebase no.
   Por eso hace falta además la bandera de build, que solo es cierta cuando el
   fichero de Firebase existe (ver vite.config.js). */
export const pushDisponible = () => PUSH_CONFIGURADO && !!PN();

/* La define la inyecta Vite al compilar. Si no existe (dev), se asume que no. */
const PUSH_CONFIGURADO = typeof __PUSH_CONFIGURADO__ !== "undefined" ? __PUSH_CONFIGURADO__ : false;

let yaRegistrado = false;
let canalCreado = false;

/* La Edge Function manda los avisos al canal "rpgym" (ver supabase/functions/
   avisar). Si el canal no existe en el móvil, Android lo crea por su cuenta con
   importancia normal: sin vibración y sin aparecer encima. Hay que declararlo
   aquí, y ANTES de registrar el dispositivo. */
async function asegurarCanal(){
  const pn = PN(); if (!pn || canalCreado) return;
  canalCreado = true;
  try {
    await pn.createChannel({
      id: "rpgym",
      name: "Avisos de tus amigos",
      description: "Quién entrena, quién bate un récord y quién propone quedar.",
      importance: 5,        // MAX: suena, vibra y salta encima
      visibility: 1,
      vibration: true,
    });
  } catch {}
}

/* Pide permiso, registra el dispositivo en FCM y guarda el token en Supabase
   para que la Edge Function sepa a quién avisar. */
export async function activarPush(){
  if (!PUSH_CONFIGURADO) return { ok:false, msg:"Las notificaciones push todavía no están configuradas en esta versión." };
  const pn = PN();
  if (!pn) return { ok:false, msg:"Las notificaciones push solo funcionan en la app instalada." };
  if (yaRegistrado) return { ok:true, yaEstaba:true };

  try {
    let permiso = await pn.checkPermissions();
    if (permiso.receive !== "granted") permiso = await pn.requestPermissions();
    if (permiso.receive !== "granted") return { ok:false, msg:"No has dado permiso para las notificaciones." };
    await asegurarCanal();

    // El token llega por evento, no como valor de retorno.
    const token = await new Promise((resolve) => {
      const t = setTimeout(() => resolve(null), 12000);
      pn.addListener("registration", (info) => { clearTimeout(t); resolve(info?.value || null); });
      pn.addListener("registrationError", () => { clearTimeout(t); resolve(null); });
      pn.register();
    });
    if (!token) return { ok:false, msg:"No se ha podido registrar el dispositivo. Inténtalo otra vez." };

    const r = await cloud.guardarTokenPush(token);
    if (!r.ok) return r;
    yaRegistrado = true;
    return { ok:true };
  } catch (e) {
    return { ok:false, msg:"No se han podido activar las notificaciones en este dispositivo." };
  }
}

export async function desactivarPush(){
  const pn = PN();
  try { await pn?.unregister?.(); } catch {}
  yaRegistrado = false;
  return cloud.borrarTokenPush();
}

/* Avisos que llegan con la app ABIERTA: Android no los muestra solo, así que
   se pasan a quien quiera pintarlos (un toast, por ejemplo). */
export function alRecibirEnPrimerPlano(cb){
  const pn = PN();
  if (!pn) return () => {};
  const h = pn.addListener("pushNotificationReceived", (n) => cb({ titulo:n?.title, texto:n?.body, datos:n?.data }));
  return () => { try { h?.remove?.(); } catch {} };
}

/* El usuario ha tocado la notificación: se abre donde toque. */
export function alTocarNotificacion(cb){
  const pn = PN();
  if (!pn) return () => {};
  const h = pn.addListener("pushNotificationActionPerformed", (a) => cb(a?.notification?.data || {}));
  return () => { try { h?.remove?.(); } catch {} };
}
