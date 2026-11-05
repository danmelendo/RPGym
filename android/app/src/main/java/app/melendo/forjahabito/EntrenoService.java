package app.melendo.forjahabito;

import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.os.Build;
import android.os.IBinder;

import androidx.core.app.NotificationCompat;

/**
 * Mantiene vivo el entreno mientras el móvil está en el bolsillo.
 *
 * Sin esto, en cuanto la app pasa a segundo plano Android (y sobre todo las capas de
 * Samsung, Xiaomi y compañía) puede congelarla o matarla, y el descanso depende de
 * que el sistema quiera despertarla a tiempo. Con un servicio en primer plano el
 * proceso conserva prioridad y la cuenta atrás se ve en la notificación, pintada por
 * el propio sistema: no necesita que el WebView esté despierto.
 *
 * El aviso de fin de descanso NO depende de este servicio: es una alarma aparte
 * (setAlarmClock) que suena aunque el proceso haya muerto. Ver FinDescansoReceiver.
 */
public class EntrenoService extends Service {
    static final String CANAL_ENTRENO = "entreno";
    /** Mismo id que usaba la app antes: un canal ya creado conserva lo que tocó el usuario. */
    static final String CANAL_DESCANSO = "descanso";
    static final int ID_ENTRENO = 7001;
    static final int ID_FIN_DESCANSO = 7002;

    static volatile boolean activo = false;
    static volatile String titulo = "Entreno en curso";
    static volatile long desde = 0;
    /** Hora del fin del descanso en curso, o 0 si no hay ninguno. */
    static volatile long descansoHasta = 0;

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        crearCanales(this);
        Notification n = construir(this);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            startForeground(ID_ENTRENO, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_HEALTH);
        } else {
            startForeground(ID_ENTRENO, n);
        }
        activo = true;
        // Sin reinicio automático: tras matarlo no sabría qué entreno era. Lo vuelve a
        // arrancar la app al abrirse, que es quien recupera la sesión.
        return START_NOT_STICKY;
    }

    @Override
    public void onDestroy() {
        activo = false;
        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    static void crearCanales(Context c) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        NotificationManager nm = c.getSystemService(NotificationManager.class);

        NotificationChannel entreno = new NotificationChannel(CANAL_ENTRENO, "Entreno en curso",
                NotificationManager.IMPORTANCE_LOW);
        entreno.setDescription("Muestra el entreno y la cuenta atrás del descanso.");
        entreno.setShowBadge(false);
        nm.createNotificationChannel(entreno);

        NotificationChannel descanso = new NotificationChannel(CANAL_DESCANSO, "Fin del descanso",
                NotificationManager.IMPORTANCE_HIGH);
        descanso.setDescription("Avisa cuando se acaba el descanso entre series.");
        descanso.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
        descanso.enableVibration(true);
        nm.createNotificationChannel(descanso);
    }

    static PendingIntent abrirApp(Context c) {
        Intent abrir = new Intent(c, MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);
        return PendingIntent.getActivity(c, 0, abrir,
                PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
    }

    static Notification construir(Context c) {
        long hasta = descansoHasta;
        boolean descansando = hasta > System.currentTimeMillis();
        NotificationCompat.Builder b = new NotificationCompat.Builder(c, CANAL_ENTRENO)
                .setSmallIcon(R.drawable.ic_notificacion)
                .setContentIntent(abrirApp(c))
                .setOngoing(true)
                .setOnlyAlertOnce(true)
                .setSilent(true)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setCategory(NotificationCompat.CATEGORY_WORKOUT)
                .setContentTitle(descansando ? "Descanso" : "Entreno en curso")
                .setContentText(titulo)
                .setShowWhen(true)
                .setUsesChronometer(true);
        if (descansando) {
            b.setWhen(hasta).setChronometerCountDown(true);
        } else {
            b.setWhen(desde > 0 ? desde : System.currentTimeMillis());
        }
        return b.build();
    }

    /** Repinta la notificación fija. Si el servicio no llegó a arrancar, no hay nada que repintar. */
    static void refrescar(Context c) {
        if (!activo) return;
        c.getSystemService(NotificationManager.class).notify(ID_ENTRENO, construir(c));
    }

    private static PendingIntent alarma(Context c) {
        Intent i = new Intent(c, FinDescansoReceiver.class);
        return PendingIntent.getBroadcast(c, 0, i,
                PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
    }

    /**
     * setAlarmClock y no setExactAndAllowWhileIdle: es lo que usan las apps de reloj y
     * la única alarma que los fabricantes respetan al minuto. La otra funciona a la
     * perfección en un Android de serie (medido: +44 ms en Doze profundo), pero las
     * capas de ahorro de batería la retrasan. A cambio sale el icono del despertador
     * mientras dura el descanso. Programar otra vez con la misma alarma la sustituye.
     */
    static void programarFin(Context c, long hasta) {
        AlarmManager am = c.getSystemService(AlarmManager.class);
        try {
            am.setAlarmClock(new AlarmManager.AlarmClockInfo(hasta, abrirApp(c)), alarma(c));
        } catch (SecurityException sinPermisoExacto) {
            am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, hasta, alarma(c));
        }
    }

    static void cancelarFin(Context c) {
        c.getSystemService(AlarmManager.class).cancel(alarma(c));
        c.getSystemService(NotificationManager.class).cancel(ID_FIN_DESCANSO);
    }
}
