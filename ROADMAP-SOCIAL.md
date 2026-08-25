# ROADMAP — RPGym social (backend Supabase)

> **Estado: FASE 1 IMPLEMENTADA (a falta de credenciales).** Cuentas, perfiles con usuario
> único, keep-alive, clasificación y aviso de versión ya están en el código
> ([src/cloud.js](src/cloud.js), `AccountView` en [src/App.jsx](src/App.jsx),
> [supabase/schema.sql](supabase/schema.sql)). Falta crear el proyecto en Supabase y pegar
> las credenciales: ver **[supabase/README.md](supabase/README.md)**.
> Sin `.env`, la app sigue siendo 100% local y Supabase ni se compila.
>
> Fases 2-6 (sincronización, amigos, rutinas de amigos, avisos, entreno conjunto): pendientes.
>
> **Contexto: uso privado.** Esto es para el círculo cercano, repartiendo el APK a mano.
> **No entra en Google Play**, así que todo lo que sea política de tienda, cuestionario de
> Seguridad de los Datos, moderación o borrado de cuenta obligatorio **no aplica**. Si algún
> día se quisiera publicar, hay que releer esto entero: varias decisiones cambiarían.

Lo que se quiere:

- Lista de **amigos**.
- Mandar rutinas a un amigo y **ver las suyas**.
- Entrar en el perfil de un amigo, **hacer su rutina** y ganar puntos por ello.
- Tablas de entrenos propias y de los amigos.
- **Push** cuando un amigo empieza a entrenar o rompe un récord.
- **Concertar hora** para entrenar juntos e **iniciar una rutina conjunta** que cuente como tal.

---

## 0. Lo que hay que tener claro antes de empezar

Sin Play de por medio quedan tres cosas que siguen importando. Ninguna es burocracia.

### 0.1 Repartir el APK a mano cambia las reglas del juego

Es **el mayor riesgo técnico** de todo el plan, y sustituye a lo que antes era el riesgo de
tienda. Con la app instalada a mano:

- **Cada amigo actualiza cuando le da la gana**, o nunca. Van a convivir versiones distintas
  hablando con la misma base de datos.
  → El backend debe ser **tolerante con clientes viejos**: solo añadir columnas (nunca
  renombrar ni borrar), campos nuevos siempre opcionales, y que un cliente antiguo que
  recibe un campo que no entiende lo ignore sin romperse.
  → Guardar en el perfil la **versión de app** de cada uno, para poder decir "actualiza"
  cuando algo lo requiera.
- **Hay que firmar SIEMPRE con la misma clave.** Si un APK va con otra firma, Android no
  deja instalarlo encima: obliga a desinstalar, y **desinstalar borra todo el progreso**
  (ver [PLAYSTORE.md](PLAYSTORE.md)). Con la parte social esto duele menos —el servidor
  tendría copia—, pero solo a partir del momento en que la sincronización funcione.
- **Cómo les llega el APK**: ✅ resuelto. El repositorio es público
  (<https://github.com/danmelendo/RPGym>), así que el APK se publica como **GitHub Release**:
  enlace directo, sin autenticación y sin gastar transferencia de Supabase. La tabla
  `app_versions` solo guarda la URL. Ojo: `public/RPGym.apk` está excluido del build a
  propósito ([vite.config.js](vite.config.js)) para que la app no se lleve dentro una copia
  de sí misma, y `*.apk` está en `.gitignore` (los binarios van a Releases, no al repo).

### 0.2 El texto de privacidad de la app se queda mentiroso

No es tema de Play: es que la app **dice una cosa concreta al usuario**. En
`Ajustes → Privacidad` ([src/App.jsx](src/App.jsx)) se lee hoy:

> RPGym **no recoge, no envía y no comparte** ningún dato. Todo lo que escribes se queda en
> este móvil: no hay servidores, ni cuentas, ni publicidad, ni analítica.

En cuanto haya backend eso es falso. Aunque sea entre amigos, los datos pasan a estar en un
servidor de un tercero (Supabase). Hay que **reescribir ese texto y
[public/privacidad.html](public/privacidad.html)** diciendo la verdad: qué se sube, a dónde
y quién lo ve. Es media hora de trabajo y evita que alguien de tu círculo se entere por
sorpresa de que sus entrenos están en la nube.

Decisión asociada, y ésta sí es importante: **hay datos que no deben subir nunca**.
Peso, medidas, edad y sobre todo el **ciclo menstrual** no los necesita la parte social
para nada. Que se queden en el móvil.

### 0.3 El push no lo da Supabase

**Supabase no envía notificaciones push.** Hace falta **FCM** (Firebase Cloud Messaging) +
`@capacitor/push-notifications` + `google-services.json`, y una **Edge Function** que lo
dispare desde el servidor con la clave privada.

Sin Play de por medio FCM sigue funcionando (solo necesita Play Services en el móvil, que
cualquier Android normal tiene). El coste es: unos MB más de APK y meter una dependencia de
Google en una app que hoy no llama a nadie.

**Alternativa para empezar**: al abrir la app, consultar novedades desde la última visita y
lanzarlas con el plugin de **notificaciones locales que ya está integrado**. No suena con la
app cerrada, pero para "fulanito ha batido su récord" en un grupo de amigos cumple de sobra.
Empezar por ahí y meter FCM solo si se echa de menos de verdad.

---

## 1. Lo que NO se puede romper

- **Offline primero.** La app tiene que seguir funcionando en un sótano sin cobertura, que es
  donde están los gimnasios. La base local sigue siendo la fuente de verdad para *entrenar*;
  el servidor es un espejo que sincroniza cuando hay red. Nada de pantallas de carga que
  bloqueen el entreno.
- **Sin cuenta se sigue usando todo.** La parte social es opt-in. Quien no quiera registrarse
  usa la app igual que hoy.
- **La regla de `p1` sin prefijo** en el almacenamiento (ver [CLAUDE.md](CLAUDE.md)) al migrar
  el progreso local a una cuenta.
- **La copia de seguridad** de Ajustes debe seguir funcionando sin cuenta.

---

## 2. Fases sugeridas

| Fase | Qué entra | Por qué en este orden |
|---|---|---|
| **1. Cuenta** ✅ | Alta/login con **email + contraseña**, `handle` único (dos Danieles no chocan), perfil público mínimo, keep-alive y clasificación. **Falta reescribir el texto de privacidad antes de repartirlo.** | Hecho. Se eligió contraseña en vez de magic link: en el gimnasio no apetece salir a buscar el correo para entrar. |
| **2. Sincronización** | Subir/bajar rutinas y entrenos propios. Resolución de conflictos. | Es la fontanería de todo lo demás y, de regalo, resuelve el cambio de móvil sin copia manual. |
| **3. Amigos** | Invitar por **código corto**, aceptar, lista de amigos, perfil del amigo con sus rutinas y su tabla de entrenos. | Ya se pueden mandar rutinas por código (`RPGYM-R1.`); esto lo hace cómodo, no lo inventa. |
| **4. Hacer la rutina de un amigo** | Copiar su rutina y entrenarla, con atribución ("rutina de Dani") y XP extra la primera vez. | Reaprovecha `importRoutine` casi tal cual. |
| **5. Avisos** | Primero **locales al abrir** (novedades desde la última visita). Push real con FCM solo si se echa en falta. | Da el valor sin arrastrar Google Play Services de entrada. |
| **6. Entrenar juntos** | Quedada con fecha/hora + sesión conjunta en tiempo real (Supabase Realtime). | Lo más caro y lo más frágil: al final. |

Al ser círculo cerrado, **la fase 3 puede ser muy simple**: un código de invitación de 6
caracteres que se pasa por WhatsApp y da amistad directa, sin buscador de usuarios ni
solicitudes pendientes. Nada de bloquear/denunciar: no hace falta entre amigos.

---

## 3. Modelo de datos (borrador)

Todo con **RLS activado**. La `anon key` viaja dentro del APK —es pública por diseño—, así
que **la seguridad entera son las políticas RLS**. Que sea para amigos no lo exime: el APK
va a estar en varios móviles y una tabla sin RLS queda abierta a cualquiera que lo abra.

```sql
profiles        id(uuid, =auth.uid) · handle(unique) · display_name · avatar_url
                · level · total_workouts · app_version · created_at
                -- NUNCA: peso, altura, edad, ciclo menstrual. Eso no sale del móvil.

friendships     requester_id · addressee_id · status(pending|accepted)
                · created_at   -- PK (requester_id, addressee_id)

invites         code(text, PK) · owner_id · expires_at · used_by

routines        id · owner_id · name · payload(jsonb) · visibility(private|friends)
                · updated_at   -- payload = el mismo JSON que ya genera encodeRoutine()

workouts        id · user_id · date · routine_name · day_name · volume · series · xp
                · joint_session_id(nullable) · client_id(text) · created_at
                -- client_id = id local, para no duplicar al reintentar la subida

meetups         id · created_by · at(timestamptz) · routine_id · note · status
meetup_guests   meetup_id · user_id · status(invited|yes|no)

joint_sessions  id · meetup_id(nullable) · started_by · started_at · ended_at
joint_members   session_id · user_id · joined_at
```

Notas:

- **`routines.payload` como jsonb** reutilizando el formato de `encodeRoutine()`: el códec de
  compartir ya está escrito y probado, no hay que inventar otro esquema. Y es justo lo que
  hace tolerable la convivencia de versiones distintas.
- El **perfil público es mínimo a propósito**: nombre, avatar, nivel y nº de entrenos.

---

## 4. Puntos finos que van a doler

- **Supabase gratis pausa el proyecto tras ~1 semana sin actividad** y hay que reactivarlo a
  mano desde el panel. Con un grupo pequeño que entrena a rachas **esto va a pasar seguro**,
  y mientras está pausado la parte social no responde. Comprobar la política vigente antes de
  montarlo, y que la app aguante el fallo sin dar la lata (offline primero, otra vez).
- **Conflictos de sincronización**: mismo entreno en dos móviles, rutina editada offline en
  dos sitios. Propuesta: rutinas por *last-write-wins* según `updated_at`; entrenos
  *append-only* deduplicando por `client_id`.
- **XP en sesión conjunta**: que no salga gratis inflar XP (dos móviles, mismo entreno, doble
  XP). El bonus por entrenar acompañado debería ser **fijo y pequeño**, nunca proporcional al
  volumen.
- **Los récords dejan de ser privados**: si se avisa de que un amigo ha batido marca, sus
  marcas se hacen visibles. Decirlo claramente al activar la parte social.
- **Región del proyecto**: elegir UE al crear el proyecto en Supabase. Cuesta lo mismo y
  evita mover datos de salud fuera.

---

## 5. Lo que ya está hecho y sirve de base

- **`encodeRoutine` / `decodeRoutine`** ([src/App.jsx](src/App.jsx)): el formato de intercambio
  de rutinas ya existe, está probado y aguanta versiones distintas. Es el `payload` de la
  tabla `routines` sin tocar nada.
- **`importRoutine`**: mete una rutina ajena sin pisar las propias (id nuevo, nombre " (2)").
- **`BACKUP_KEYS` + export/import**: la base para migrar el progreso local a una cuenta.
- **Notificaciones locales** (`scheduleAllReminders`): sirven para la fase 5 sin FCM.
- **`cardioBests` / `bests` / `log`**: ya existe todo lo que alimentaría las tablas de entrenos
  y los récords que se anunciarían.

---

## 6. Recomendación

Empezar por **fases 1-4 con avisos locales** (fase 5a). Eso ya da lo que más se va a usar
—ver la rutina de un amigo, copiarla y comparar entrenos— sin meter Google Play Services ni
tiempo real.

Dos cosas antes de la fase 1: reescribir el texto de privacidad (condiciona el resto) y
decidir cómo se reparten las actualizaciones del APK, porque de eso depende que el backend
tenga que aguantar clientes viejos desde el primer día.
