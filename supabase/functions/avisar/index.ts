/* =========================================================================
   RPGym · Edge Function "avisar"
   Manda una notificación push, vía FCM.

   Por qué existe: Supabase no envía push. Y la clave de servicio de Firebase
   NO puede viajar dentro del APK (cualquiera podría mandar notificaciones en
   nombre de otro), así que el envío se hace aquí, en el servidor.

   Hay dos formas de avisar:
     · A TODO tu círculo   -> "X está entrenando ahora".
     · A UNA persona       -> "X te ha superado en press banca". Si esto se
       manda a todos, a los que no has adelantado el mensaje les miente.

   En los dos casos la comprobación la hace el servidor: quien llama solo dice
   a quién quiere avisar, y las funciones de la base deciden si puede.

   Despliegue (ver supabase/FIREBASE.md):
     supabase secrets set --env-file supabase/.env.firebase
     supabase functions deploy avisar
   ========================================================================= */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/* La versión web (danmelendo.github.io) llama a esto desde el navegador, así
   que hace falta CORS. Sin esto el push funcionaría en Android y en la web no,
   y encima el fallo aparece como un error de red genérico. */
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (cuerpo: unknown, status = 200) =>
  new Response(JSON.stringify(cuerpo), { status, headers: { ...CORS, "Content-Type": "application/json" } });

/* Cada tipo dice qué texto lleva y si va a una persona o a todo el círculo. */
const TIPOS: Record<string, { dirigido: boolean; texto: (n: string, x?: string) => string }> = {
  // A todo el círculo
  entreno:  { dirigido: false, texto: (n) => `${n} está entrenando ahora` },
  record:   { dirigido: false, texto: (n) => `${n} acaba de batir un récord` },
  quedada:  { dirigido: false, texto: (n) => `${n} ha propuesto quedar para entrenar` },
  // A una persona
  superado:   { dirigido: true, texto: (n, e) => `${n} te ha superado en ${e || "un ejercicio"}` },
  invitacion: { dirigido: true, texto: (n, e) => `${n} te ha invitado a entrenar${e ? " " + e : ""}` },
  amistad:    { dirigido: true, texto: (n) => `${n} quiere ser tu amigo` },
  rutina:     { dirigido: true, texto: (n, e) => `${n} te ha mandado una rutina${e ? `: ${e}` : ""}` },
};

/* Token de acceso de Google a partir de la cuenta de servicio (JWT firmado). */
async function tokenGoogle(): Promise<string> {
  const email = Deno.env.get("FIREBASE_CLIENT_EMAIL")!;
  const clave = Deno.env.get("FIREBASE_PRIVATE_KEY")!.replace(/\\n/g, "\n");
  const ahora = Math.floor(Date.now() / 1000);
  const cabecera = { alg: "RS256", typ: "JWT" };
  const cuerpo = {
    iss: email, scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token", iat: ahora, exp: ahora + 3600,
  };
  const b64 = (o: unknown) => btoa(JSON.stringify(o)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const sinFirma = `${b64(cabecera)}.${b64(cuerpo)}`;

  const pem = clave.replace(/-----[^-]+-----/g, "").replace(/\s/g, "");
  const der = Uint8Array.from(atob(pem), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey("pkcs8", der,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const firma = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(sinFirma));
  const jwt = `${sinFirma}.${btoa(String.fromCharCode(...new Uint8Array(firma))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")}`;

  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: jwt }),
  });
  const j = await r.json();
  if (!j.access_token) throw new Error("Google no ha devuelto token: " + JSON.stringify(j));
  return j.access_token;
}

Deno.serve(async (req) => {
  try {
    if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
    if (req.method !== "POST") return json({ ok: false, msg: "Method not allowed" }, 405);

    // Quién llama: se valida su sesión. Nadie puede avisar en nombre de otro.
    const auth = req.headers.get("Authorization") ?? "";
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: auth } } });
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return json({ ok: false, msg: "Sin sesión" }, 401);

    const { tipo, ejercicio, nombre: extra, para } = await req.json();
    const def = TIPOS[tipo];
    if (!def) return json({ ok: false, msg: "Tipo desconocido" }, 400);
    if (def.dirigido && !para) return json({ ok: false, msg: "Ese aviso necesita destinatario" }, 400);

    // Nombre para el texto del aviso
    const { data: perfil } = await sb.from("profiles").select("display_name, handle").eq("id", user.id).maybeSingle();
    const nombre = perfil?.display_name || "@" + perfil?.handle;

    /* Los tokens se piden con la clave de servicio: las funciones comprueban
       la amistad por dentro, no se fían de quien llama. */
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: tokens } = def.dirigido
      ? await admin.rpc("tokens_de_una_persona", { p_de: user.id, p_para: para })
      : await admin.rpc("tokens_de_mis_amigos", { p_user: user.id });
    if (!tokens?.length) return json({ ok: true, enviados: 0 });

    const body = def.texto(nombre, ejercicio || extra);
    const acceso = await tokenGoogle();
    const proyecto = Deno.env.get("FIREBASE_PROJECT_ID")!;

    let enviados = 0;
    for (const { token } of tokens) {
      const r = await fetch(`https://fcm.googleapis.com/v1/projects/${proyecto}/messages:send`, {
        method: "POST",
        headers: { Authorization: `Bearer ${acceso}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          message: {
            token,
            notification: { title: "RPGym", body },
            data: { tipo, de: perfil?.handle ?? "" },
            android: { priority: "high", notification: { channel_id: "rpgym", notification_priority: "PRIORITY_HIGH", default_vibrate_timings: true } },
            // Sin esto iOS no despierta la app ni enseña nada con la pantalla bloqueada.
            apns: { headers: { "apns-priority": "10" }, payload: { aps: { sound: "default" } } },
          },
        }),
      });
      if (r.ok) enviados++;
      // Token caducado o revocado: se limpia para no reintentarlo siempre.
      else if (r.status === 404 || r.status === 400) await admin.from("push_tokens").delete().eq("token", token);
    }
    return json({ ok: true, enviados });
  } catch (e) {
    return json({ ok: false, msg: String(e) }, 500);
  }
});
