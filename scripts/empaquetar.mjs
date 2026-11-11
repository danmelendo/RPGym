#!/usr/bin/env node
/* =============================================================================
   RPGym · Saca los DOS APK de cada versión: el normal y el alt (sin juego).

     npm run apk:ambas
       → releases/RPGym-<versión>.apk
       → releases/RPGym-Alt-<versión>.apk

   Los dos llevan el mismo paquete, el mismo versionCode y la MISMA firma (la de
   depuración, como todos los que se reparten: ver "Firma del APK" en CLAUDE.md).
   Por eso uno se instala encima del otro sin perder datos, que es en lo que se
   basa elegir canal en Ajustes → Perfil → Versión de la app.

   El alt se construye primero y el normal el último: así android/ se queda con el
   build normal, que es el que espera cualquier `npx cap run` posterior.
   ============================================================================= */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
process.chdir(RAIZ);

const props = fs.readFileSync("android/version.properties", "utf8");
const version = props.match(/^versionName=(.+)$/m)?.[1].trim();
if (!version) throw new Error("Falta versionName en android/version.properties");

const gradle = process.platform === "win32" ? "android\\gradlew.bat" : "./android/gradlew";
const apkDebug = "android/app/build/outputs/apk/debug/app-debug.apk";
fs.mkdirSync("releases", { recursive: true });

const sh = cmd => execSync(cmd, { stdio: "inherit" });

for (const { modo, nombre } of [
  { modo: "alt", nombre: `RPGym-Alt-${version}.apk` },
  { modo: null,  nombre: `RPGym-${version}.apk` },
]) {
  console.log(`\n=== ${nombre} ===`);
  sh(`npx vite build${modo ? ` --mode ${modo}` : ""}`);
  sh("npx cap sync android");
  sh(`${gradle} -p android assembleDebug`);
  fs.copyFileSync(apkDebug, path.join("releases", nombre));
  console.log(`→ releases/${nombre} (${(fs.statSync(path.join("releases", nombre)).size / 1e6).toFixed(1)} MB)`);
}

console.log(`
Siguiente paso: subir los dos a la release v${version} de GitHub y publicar la
versión en los DOS canales con una migración (app_versions y app_versions_alt).
Plantilla en CLAUDE.md → "Versión alt (sin juego)".`);
