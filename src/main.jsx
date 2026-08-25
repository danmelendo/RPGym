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

createRoot(document.getElementById("root")).render(<App />);
