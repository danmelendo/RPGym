/* =========================================================================
   RPGym · Edge Function "avisar"
   Manda una notificación push a los amigos de quien la llama, vía FCM.

   Por qué existe: Supabase no envía push. Y la clave de servicio de Firebase
   NO puede viajar dentro del APK (cualquiera podría mandar notificaciones en
   nombre de otro), así que el envío se hace aquí, en el servidor.

   Despliegue:
     supabase functions deploy avisar
     supabase secrets set FIREBASE_PROJECT_ID=...
     supabase secrets set FIREBASE_CLIENT_EMAIL=...
     supabase secrets set FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
   ========================================================================= */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const TIPOS = {
  entreno:  (n: string) => ({ title: "RPGym", body: `${n} está entrenando ahora` }),
  record:   (n: string) => ({ title: "RPGym", body: `${n} acaba de batir un récord` }),
  quedada:  (n: string) => ({ title: "RPGym", body: `${n} ha propuesto quedar para entrenar` }),
  superado: (n: string, e?: string) => ({ title: "RPGym", body: `${n} te ha superado en ${e || "un ejercicio"}` }),
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
    if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

    // Quién llama: se valida su sesión. Nadie puede avisar en nombre de otro.
    const auth = req.headers.get("Authorization") ?? "";
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: auth } } });
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return new Response(JSON.stringify({ ok: false, msg: "Sin sesión" }), { status: 401 });

    const { tipo, ejercicio } = await req.json();
    if (!(tipo in TIPOS)) return new Response(JSON.stringify({ ok: false, msg: "Tipo desconocido" }), { status: 400 });

    // Nombre para el texto del aviso
    const { data: perfil } = await sb.from("profiles").select("display_name, handle").eq("id", user.id).maybeSingle();
    const nombre = perfil?.display_name || "@" + perfil?.handle;

    // Los tokens se piden con la clave de servicio: la función comprueba la
    // amistad por dentro, no se fía de quien llama.
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: tokens } = await admin.rpc("tokens_de_mis_amigos", { p_user: user.id });
    if (!tokens?.length) return new Response(JSON.stringify({ ok: true, enviados: 0 }));

    const { title, body } = (TIPOS as any)[tipo](nombre, ejercicio);
    const acceso = await tokenGoogle();
    const proyecto = Deno.env.get("FIREBASE_PROJECT_ID")!;

    let enviados = 0;
    for (const { token } of tokens) {
      const r = await fetch(`https://fcm.googleapis.com/v1/projects/${proyecto}/messages:send`, {
        method: "POST",
        headers: { Authorization: `Bearer ${acceso}`, "Content-Type": "application/json" },
        body: JSON.stringify({ message: { token, notification: { title, body },
          data: { tipo, de: perfil?.handle ?? "" },
          android: { priority: "high", notification: { channel_id: "rpgym" } } } }),
      });
      if (r.ok) enviados++;
      // Token caducado o revocado: se limpia para no reintentarlo siempre.
      else if (r.status === 404 || r.status === 400) await admin.from("push_tokens").delete().eq("token", token);
    }
    return new Response(JSON.stringify({ ok: true, enviados }), { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, msg: String(e) }), { status: 500 });
  }
});
