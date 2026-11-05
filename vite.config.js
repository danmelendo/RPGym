import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";

// Sirve el APK con el Content-Type correcto para que el móvil lo descargue como .apk (no .apk.zip).
function serveApk() {
  return {
    name: "serve-apk",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.split("?")[0] === "/RPGym.apk") {
          const file = path.resolve(process.cwd(), "public/RPGym.apk");
          if (fs.existsSync(file)) {
            const stat = fs.statSync(file);
            res.setHeader("Content-Type", "application/vnd.android.package-archive");
            res.setHeader("Content-Disposition", 'attachment; filename="RPGym.apk"');
            res.setHeader("Content-Length", stat.size);
            fs.createReadStream(file).pipe(res);
            return;
          }
        }
        next();
      });
    },
  };
}

// El APK de descarga vive en public/ para poder pasárselo a los testers desde el
// servidor de desarrollo, pero Vite copia TODO public/ a dist/ — y dist/ es lo que
// Capacitor empaqueta dentro de la app. Sin esto, la app se llevaría dentro una copia
// de sí misma (+14 MB en cada APK y en cada subida a Google Play).
function stripApkFromBuild() {
  return {
    name: "strip-apk-from-build",
    apply: "build",
    closeBundle() {
      const f = path.resolve(process.cwd(), "dist/RPGym.apk");
      if (fs.existsSync(f)) {
        fs.rmSync(f);
        console.log("[strip-apk] RPGym.apk excluido del build (no se empaqueta en la app)");
      }
    },
  };
}

// Base relativa para que los assets carguen dentro del WebView de Capacitor.
/* Las notificaciones push solo se activan si Firebase está configurado. Sin
   google-services.json, el plugin de Android llama a FirebaseMessaging y la app
   CRASHEA: pasó en la v1.0.0. Esta bandera lo impide desde el build. */
const pushConfigurado = fs.existsSync("android/app/google-services.json");
if (!pushConfigurado) console.log("[push] sin google-services.json: notificaciones push desactivadas en este build");

/* La versión sale de android/version.properties, igual que la del APK. Es lo que la
   app compara con app_versions: dos números escritos a mano acabaron desfasados en
   la 1.0.20 y el aviso de actualización no se iba nunca. */
const versionProps = fs.readFileSync("android/version.properties", "utf8");
const leerVersion = k => {
  const v = versionProps.match(new RegExp(`^${k}=(.+)$`, "m"))?.[1].trim();
  if (!v) throw new Error(`Falta ${k} en android/version.properties`);
  return v;
};

export default defineConfig({
  define: {
    __PUSH_CONFIGURADO__: JSON.stringify(pushConfigurado),
    __VERSION_CODE__: JSON.stringify(Number(leerVersion("versionCode"))),
    __VERSION_NAME__: JSON.stringify(leerVersion("versionName")),
  },
  plugins: [react(), serveApk(), stripApkFromBuild()],
  base: "./",
  build: { outDir: "dist", chunkSizeWarningLimit: 1500 },
  // Dev accesible desde LAN y túneles (para verificar en el móvil antes de empaquetar).
  server: {
    host: true,          // escucha en 0.0.0.0 (accesible por IP de red / túnel)
    allowedHosts: true,  // acepta cualquier Host (necesario para túneles tipo trycloudflare/loca.lt)
  },
});
