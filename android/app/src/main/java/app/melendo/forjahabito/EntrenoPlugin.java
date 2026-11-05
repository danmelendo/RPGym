package app.melendo.forjahabito;

import android.content.Context;
import android.content.Intent;

import androidx.core.content.ContextCompat;

import com.getcapacitor.Logger;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/** Puente con la web: window.Capacitor.Plugins.Entreno */
@CapacitorPlugin(name = "Entreno")
public class EntrenoPlugin extends Plugin {

    @PluginMethod
    public void iniciar(PluginCall call) {
        Context c = getContext();
        String titulo = call.getString("titulo");
        if (titulo != null && !titulo.isEmpty()) EntrenoService.titulo = titulo;
        EntrenoService.desde = call.getData().optLong("desde", 0);
        if (EntrenoService.activo) {
            EntrenoService.refrescar(c);
            call.resolve();
            return;
        }
        try {
            ContextCompat.startForegroundService(c, new Intent(c, EntrenoService.class));
        } catch (RuntimeException e) {
            // Android solo deja arrancarlo con la app delante. Sin él sigue habiendo aviso
            // de fin de descanso, que va por su propia alarma.
            Logger.warn("Entreno", "No se pudo arrancar el servicio: " + e.getMessage());
        }
        call.resolve();
    }

    @PluginMethod
    public void descanso(PluginCall call) {
        long hasta = call.getData().optLong("hasta", 0);
        if (hasta <= System.currentTimeMillis()) {
            call.resolve();
            return;
        }
        Context c = getContext();
        EntrenoService.cancelarFin(c);
        EntrenoService.descansoHasta = hasta;
        EntrenoService.programarFin(c, hasta);
        EntrenoService.refrescar(c);
        call.resolve();
    }

    @PluginMethod
    public void cancelarDescanso(PluginCall call) {
        Context c = getContext();
        EntrenoService.descansoHasta = 0;
        EntrenoService.cancelarFin(c);
        EntrenoService.refrescar(c);
        call.resolve();
    }

    @PluginMethod
    public void parar(PluginCall call) {
        Context c = getContext();
        EntrenoService.descansoHasta = 0;
        EntrenoService.cancelarFin(c);
        c.stopService(new Intent(c, EntrenoService.class));
        call.resolve();
    }
}
