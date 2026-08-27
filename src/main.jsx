import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

/*
 * Shim de almacenamiento.
 * La app usa window.storage (heredado del entorno de artifacts). Aquí lo
 * implementamos con localStorage del WebView, que persiste entre sesiones
 * en el móvil. Si en el futuro quieres persistencia más robusta, sustituye
 * este bloque por @capacitor/preferences manteniendo la misma interfaz async.
 */
if (!window.storage) {
  window.storage = {
    async get(key) {
      const v = localStorage.getItem(key);
      return v === null ? null : { key, value: v };
    },
    async set(key, value) {
      localStorage.setItem(key, value);
      return { key, value };
    },
    async delete(key) {
      localStorage.removeItem(key);
      return { key, deleted: true };
    },
    async list(prefix = "") {
      const keys = Object.keys(localStorage).filter((k) => k.startsWith(prefix));
      return { keys, prefix };
    },
  };
}

/* Service worker: solo en la versión WEB. Dentro de Capacitor los ficheros ya
   son locales (file://) y registrarlo no aporta nada — solo puede estorbar. */
if ("serviceWorker" in navigator && !window.Capacitor?.isNativePlatform?.() && location.protocol.startsWith("http")) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(new URL("sw.js", document.baseURI))
      .catch(e => console.warn("[sw] no se ha podido registrar:", e?.message));
  });
}

createRoot(document.getElementById("root")).render(<App />);
