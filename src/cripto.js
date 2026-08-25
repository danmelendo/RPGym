/* =========================================================================
   RPGym · cifrado de la copia de seguridad

   La copia se cifra EN EL MÓVIL antes de subirla. Supabase guarda bytes
   opacos: ni el desarrollador, ni Supabase, ni nadie con acceso a la base
   puede leer qué entrenas. Es lo que permite cumplir la promesa de que el
   detalle de los entrenos no sale del dispositivo.

   La clave se deriva de la contraseña de la cuenta con PBKDF2 y se guarda
   SOLO en este móvil. Nunca viaja. Al entrar desde otro móvil con la misma
   contraseña se obtiene la misma clave y la copia se puede descifrar.

   OJO: si cambias la contraseña de la cuenta, la clave cambia y la copia
   antigua deja de poder descifrarse. Hay que volver a subirla.
   ========================================================================= */

const ITERACIONES = 150000;          // coste razonable en un móvil de gama media
const CLAVE_LOCAL = "gym:claveCopia";

const b64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf)));
const deB64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));

/* ¿Hay Web Crypto? En el WebView de Android sí; en http:// sin TLS, no. */
export const criptoDisponible = typeof crypto !== "undefined" && !!crypto.subtle;

/* Deriva la clave a partir de la contraseña. La sal es el id de usuario: no es
   secreta, solo tiene que ser distinta para cada persona. */
export async function derivarClave(password, userId){
  if (!criptoDisponible) return null;
  const enc = new TextEncoder();
  const base = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name:"PBKDF2", salt:enc.encode("rpgym:" + userId), iterations:ITERACIONES, hash:"SHA-256" },
    base, { name:"AES-GCM", length:256 }, true, ["encrypt", "decrypt"]);
}

/* La clave derivada se guarda en este móvil para no pedir la contraseña cada
   vez. Es material sensible, pero vive donde ya viven los datos en claro:
   guardarla aquí no empeora nada, y no subirla es lo que importa. */
export async function guardarClave(clave){
  if (!clave) return;
  try {
    const bruta = await crypto.subtle.exportKey("raw", clave);
    localStorage.setItem(CLAVE_LOCAL, b64(bruta));
  } catch {}
}
export async function recuperarClave(){
  if (!criptoDisponible) return null;
  try {
    const s = localStorage.getItem(CLAVE_LOCAL);
    if (!s) return null;
    return await crypto.subtle.importKey("raw", deB64(s), "AES-GCM", true, ["encrypt", "decrypt"]);
  } catch { return null; }
}
export function olvidarClave(){ try { localStorage.removeItem(CLAVE_LOCAL); } catch {} }

export async function cifrar(texto, clave){
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const datos = new TextEncoder().encode(texto);
  const out = await crypto.subtle.encrypt({ name:"AES-GCM", iv }, clave, datos);
  return { cifrado: b64(out), iv: b64(iv) };
}

export async function descifrar(cifrado, iv, clave){
  const out = await crypto.subtle.decrypt(
    { name:"AES-GCM", iv: deB64(iv) }, clave, deB64(cifrado));
  return new TextDecoder().decode(out);
}
