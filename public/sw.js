/* =========================================================================
   RPGym · service worker

   Para qué está: que la versión web funcione sin cobertura, igual que la app
   de Android. En el gimnasio del sótano no hay señal y la app tiene que abrir
   y enseñar las demostraciones de los ejercicios de todas formas.

   NO se precachea nada por adelantado. Las imágenes de ejercicios son ~28 MB
   y descargarlas todas en la primera visita sería una barbaridad con datos
   móviles: se van guardando conforme las miras.
   ========================================================================= */

const VERSION = "rpgym-v1";
const APP = VERSION + "-app";        // el bundle: html, js, css, fuentes
const MEDIA = VERSION + "-media";    // las fotos de los ejercicios

/* Cuántas imágenes de ejercicio se guardan como mucho. Cada una ronda los
   60 KB, así que 400 son unos 24 MB: suficiente para las rutinas que usas de
   verdad sin llenarle el móvil a nadie. */
const TOPE_MEDIA = 400;

self.addEventListener("install", (e) => {
  // Entra en servicio sin esperar a que se cierren las pestañas viejas.
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    // Fuera las cachés de versiones anteriores.
    const nombres = await caches.keys();
    await Promise.all(nombres.filter(n => !n.startsWith(VERSION)).map(n => caches.delete(n)));
    await self.clients.claim();
  })());
});

/* Recorta la caché de imágenes por orden de llegada cuando se pasa del tope. */
async function podar(cache, tope) {
  const claves = await cache.keys();
  if (claves.length <= tope) return;
  for (const k of claves.slice(0, claves.length - tope)) await cache.delete(k);
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  // Solo lo nuestro: a Supabase NUNCA se le cachea nada, o verías datos viejos.
  if (url.origin !== self.location.origin) return;

  // Navegación: primero la red (para coger versiones nuevas), y si no hay, la
  // copia guardada. Así una actualización se ve en cuanto hay cobertura.
  if (req.mode === "navigate") {
    e.respondWith((async () => {
      try {
        const red = await fetch(req);
        const cache = await caches.open(APP);
        cache.put(req, red.clone());
        return red;
      } catch {
        const cache = await caches.open(APP);
        return (await cache.match(req)) || (await cache.match("index.html")) || Response.error();
      }
    })());
    return;
  }

  const esImagenEjercicio = url.pathname.includes("/exercises/");
  const esEstatico = /\.(js|css|woff2?|png|svg|ico|webmanifest)$/i.test(url.pathname);

  if (esImagenEjercicio) {
    // Primero la caché: una foto de un ejercicio no cambia nunca.
    e.respondWith((async () => {
      const cache = await caches.open(MEDIA);
      const guardada = await cache.match(req);
      if (guardada) return guardada;
      try {
        const red = await fetch(req);
        if (red.ok) { cache.put(req, red.clone()); podar(cache, TOPE_MEDIA); }
        return red;
      } catch {
        return Response.error();
      }
    })());
    return;
  }

  if (esEstatico) {
    e.respondWith((async () => {
      const cache = await caches.open(APP);
      const guardada = await cache.match(req);
      // Devuelve lo guardado ya, y de fondo se trae la versión nueva.
      const traer = fetch(req).then(red => { if (red.ok) cache.put(req, red.clone()); return red; }).catch(() => null);
      return guardada || (await traer) || Response.error();
    })());
  }
});

/* --- Notificaciones ------------------------------------------------------

   Dos vías, y conviene no confundirlas:

   · "push": las manda el servidor (un amigo entrena, te llega una rutina). En
     iOS solo funcionan si la web está AÑADIDA A LA PANTALLA DE INICIO; en una
     pestaña normal de Safari, no.
   · postMessage desde la página: las programa la propia app, como el fin del
     descanso. Solo llegan si el navegador sigue vivo — iOS suspende la web al
     salir de ella y ahí no hay nada que hacer desde el lado del cliente.
------------------------------------------------------------------------- */

self.addEventListener("push", (e) => {
  let datos = { title: "RPGym", body: "" };
  try { if (e.data) datos = { ...datos, ...e.data.json() }; } catch { if (e.data) datos.body = e.data.text(); }
  e.waitUntil(self.registration.showNotification(datos.title || "RPGym", {
    body: datos.body || "",
    icon: "pwa/icono-192.png",
    badge: "pwa/icono-192.png",
    vibrate: [180, 90, 180],
    tag: datos.tag || "rpgym",
    data: datos.data || {},
  }));
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil((async () => {
    const abiertas = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const c of abiertas) if (c.url.includes(self.location.origin)) return c.focus();
    return self.clients.openWindow(self.registration.scope);
  })());
});

/* Aviso local con retraso (fin del descanso). Funciona mientras el navegador
   no mate al service worker: en Android aguanta de sobra, en iOS es a suerte.
   Por eso la app avisa TAMBIÉN con vibración y sonido en la propia página. */
self.addEventListener("message", (e) => {
  const m = e.data || {};
  if (m.tipo !== "avisar-en") return;
  const espera = Math.max(0, Math.min(60 * 60 * 1000, Number(m.ms) || 0));
  e.waitUntil(new Promise((resolve) => {
    setTimeout(async () => {
      await self.registration.showNotification(m.titulo || "RPGym", {
        body: m.cuerpo || "",
        icon: "pwa/icono-192.png",
        badge: "pwa/icono-192.png",
        vibrate: [180, 90, 180],
        tag: m.tag || "descanso",
        renotify: true,
      });
      resolve();
    }, espera);
  }));
});
