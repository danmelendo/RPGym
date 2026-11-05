package app.melendo.forjahabito;

import android.app.NotificationManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.media.AudioAttributes;
import android.os.Build;
import android.os.VibrationEffect;
import android.os.Vibrator;

import androidx.core.app.NotificationCompat;

/**
 * Suena al acabar el descanso. Es un receptor del manifiesto para que funcione también
 * si el proceso ha muerto: entonces Android lo arranca solo para esto.
 */
public class FinDescansoReceiver extends BroadcastReceiver {
    private static final long[] PATRON = { 0, 180, 90, 180, 90, 400 };

    @Override
    public void onReceive(Context c, Intent intent) {
        EntrenoService.crearCanales(c);
        EntrenoService.descansoHasta = 0;

        NotificationCompat.Builder b = new NotificationCompat.Builder(c, EntrenoService.CANAL_DESCANSO)
                .setSmallIcon(R.drawable.ic_notificacion)
                .setContentTitle("Descanso terminado 💪")
                .setContentText("A por la siguiente serie.")
                .setContentIntent(EntrenoService.abrirApp(c))
                .setPriority(NotificationCompat.PRIORITY_MAX)
                .setCategory(NotificationCompat.CATEGORY_ALARM)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setAutoCancel(true)
                .setTimeoutAfter(120_000);
        try {
            c.getSystemService(NotificationManager.class).notify(EntrenoService.ID_FIN_DESCANSO, b.build());
        } catch (SecurityException sinPermiso) {
            // Sin permiso de notificaciones al menos queda la vibración.
        }
        vibrar(c);
        EntrenoService.refrescar(c);
    }

    /* Aparte del canal, y con uso de alarma: en modo silencio el canal no vibra, y en el
       gimnasio medio mundo lleva el móvil en silencio. Un aviso que no se nota en el
       bolsillo no sirve. */
    private void vibrar(Context c) {
        Vibrator v = c.getSystemService(Vibrator.class);
        if (v == null || !v.hasVibrator()) return;
        AudioAttributes uso = new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_ALARM).build();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            v.vibrate(VibrationEffect.createWaveform(PATRON, -1), uso);
        } else {
            v.vibrate(PATRON, -1, uso);
        }
    }
}
