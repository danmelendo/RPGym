#!/usr/bin/env python3
"""Genera las capas del avatar a partir del proyecto LPC (Liberated Pixel Cup).

    python scripts/generar-avatar.py <carpeta del clon parcial de LPC> [--cache <carpeta>]

Lee el catálogo de abajo, baja solo los PNG necesarios de una versión FIJA del
repositorio, se queda con las filas de frente y de perfil de la animación de
andar, y escribe:

    public/avatar/*.png          una capa por fichero, 576x128 (9 fotogramas x 2 filas)
    public/avatar/acc/*.png      la misma capa con las acciones de quien está entrenando,
                                 896x256 en fotogramas de 128: brazos arriba y tajo
    public/avatar/ej/*.png       la misma capa con las poses de los ejercicios, 512x512 en
                                 fotogramas de 64 (filas en EJERCICIOS)
    public/avatar/CREDITOS.csv   autores, licencia y enlace de cada capa usada
    src/avatar-data.json         el catálogo que lee la app

Las capas recolorables se guardan INDEXADAS: cada píxel lleva en gris el escalón
(0-5) de su rampa de color y la app lo sustituye por la rampa elegida. Por eso no
hacen falta ficheros por color.

Licencias: se usa la más libre que tenga cada pieza (ver ORDEN_LICENCIAS). Una
pieza que solo sea GPL hace fallar el script: esa licencia no se metería en el
arte sin que nadie lo decida.
"""
import csv, json, os, re, sys, urllib.request
from concurrent.futures import ThreadPoolExecutor
from PIL import Image

COMMIT = "86160e7507d6841259cff624a51a63c1d4847ee3"
RAW = f"https://raw.githubusercontent.com/LiberatedPixelCup/Universal-LPC-Spritesheet-Character-Generator/{COMMIT}/spritesheets/"
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SALIDA = os.path.join(RAIZ, "public", "avatar")
SALIDA_ACC = os.path.join(SALIDA, "acc")
SALIDA_EJ = os.path.join(SALIDA, "ej")
ORDEN_LICENCIAS = ["CC0", "OGA-BY 3.0", "OGA-BY 3.0+", "CC-BY 4.0", "CC-BY 3.0", "CC-BY 3.0+", "CC-BY-SA 4.0", "CC-BY-SA 3.0"]
FILA_FRENTE, FILA_PERFIL = 2, 3          # orden LPC: espalda, izquierda, frente, derecha
CUERPOS = {"m": "male", "f": "female"}

# rampa de referencia con la que se indexa cada material (de oscuro a claro)
GRIS = ["#0E0E0E", "#292929", "#4B4B4B", "#777777", "#AAAAAA", "#D9D9D9"]

# id: (definición, nombre, ranura, rama, umbral, grupo de color, variante preferida)
A, N = "armadura", None
PIEZAS = [
  # Guerrero · Hipertrofia
  ("g_cota",     "torso_chainmail",        "Cota de malla",       "torso",   "guerrero",   0,  A),
  ("g_calzas",   "legs_pants",             "Calzas de recluta",   "piernas", "guerrero",   0,  A),
  ("g_botas",    "feet_boots_basic",       "Botas de marcha",     "pies",    "guerrero",   0,  A),
  ("g_espada",   "weapon_sword_arming",    "Espada de recluta",   "arma",    "guerrero",   0,  N),
  ("g_mandoble", "weapon_sword_longsword", "Mandoble",            "arma",    "guerrero",  30,  N),
  ("g_guantes",  "arms_gloves",            "Guantes de hierro",   "brazos",  "guerrero",  60,  A),
  ("g_escarpes", "feet_armour",            "Escarpes de placas",  "pies",    "guerrero", 100,  A),
  ("g_grebas",   "legs_armour",            "Grebas de placas",    "piernas", "guerrero", 160,  A),
  ("g_brazales", "arms_armour",            "Brazales de placas",  "brazos",  "guerrero", 230,  A),
  ("g_peto",     "torso_armour_plate",     "Peto de placas",      "torso",   "guerrero", 320,  A),
  ("g_yelmo",    "hat_helmet_armet",       "Yelmo de campeón",    "cabeza",  "guerrero", 420,  A),
  ("g_capa",     "cape_solid",             "Capa del campeón",    "espalda", "guerrero", 550,  A),
  ("g_runica",   "weapon_sword_glowsword", "Hoja rúnica",         "arma",    "guerrero", 700,  N),
  # Pícaro · Definición
  ("p_jubon",    "torso_clothes_longsleeve", "Jubón ligero",      "torso",   "picaro",     0,  A),
  ("p_calzas",   "legs_leggings",          "Mallas de sigilo",    "piernas", "picaro",     0,  A),
  ("p_zapatos",  "feet_shoes_basic",       "Zapatos blandos",     "pies",    "picaro",     0,  A),
  ("p_daga",     "weapon_sword_dagger",    "Dagas gemelas",       "arma",    "picaro",     0,  N),
  ("p_brazales", "arms_bracers",           "Brazales de cuero",   "brazos",  "picaro",    30,  A),
  ("p_coraza",   "torso_armour_leather",   "Coraza de cuero",     "torso",   "picaro",    60,  A),
  ("p_botas",    "feet_boots_rim",      "Botas de ladrón",     "pies",    "picaro",   100,  A),
  ("p_panuelo",  "hat_bandana",            "Pañuelo de la banda", "cabeza",  "picaro",   160,  A),
  ("p_sable",    "weapon_sword_saber",     "Sable curvo",         "arma",    "picaro",   230,  N),
  ("p_capucha",  "hat_hood_cloth",               "Capucha de sombras",  "cabeza",  "picaro",   320,  A),
  ("p_capa",     "cape_tattered",          "Capa raída",          "espalda", "picaro",   420,  A),
  ("p_estoque",  "weapon_sword_rapier",    "Estoque del duelista","arma",    "picaro",   550,  N),
  # Bárbaro · Fuerza
  ("b_chaleco",  "torso_clothes_sleeveless", "Chaleco de pieles", "torso",   "barbaro",    0,  A),
  ("b_bombachos","legs_pantaloons",        "Bombachos del clan",  "piernas", "barbaro",    0,  A),
  ("b_sandalias","feet_sandals",           "Sandalias de guerra", "pies",    "barbaro",    0,  A),
  ("b_maza",     "weapon_blunt_mace",      "Maza",                "arma",    "barbaro",    0,  N),
  ("b_cinta",    "hat_headband_tied",      "Cinta de sangre",     "cabeza",  "barbaro",   30,  A),
  ("b_hacha",    "weapon_blunt_waraxe",    "Hacha de guerra",     "arma",    "barbaro",   60,  N),
  ("b_casco",    "hat_helmet_barbarian",   "Casco bárbaro",       "cabeza",  "barbaro",  100,  A),
  ("b_coraza",   "torso_armour_legion",    "Coraza de bronce",    "torso",   "barbaro",  160,  A),
  ("b_hombreras","shoulders_legion",       "Hombreras del jefe",  "hombros", "barbaro",  230,  A),
  ("b_escudo",   "shield_round",           "Rodela",              "escudo",  "barbaro",  320,  N),
  ("b_vikingo",  "hat_helmet_barbarian_nasal", "Yelmo del norte","cabeza",  "barbaro",  420,  A),
  ("b_flail",    "weapon_blunt_flail",     "Mangual",             "arma",    "barbaro",  550,  N),
  # Explorador · Cardio
  ("e_tunica",   "torso_clothes_tunic",    "Túnica de viaje",     "torso",   "explorador", 0,  A),
  ("e_pantalon", "legs_pants",             "Pantalón de ruta",    "piernas", "explorador", 0,  A),
  ("e_botas",    "feet_boots_fold",        "Botas plegadas",      "pies",    "explorador", 0,  A),
  ("e_arco",     "weapon_ranged_bow_normal", "Arco corto",        "arma",    "explorador", 0,  N),
  ("e_gorro",    "hat_cap_leather",        "Gorro de cuero",      "cabeza",  "explorador",30,  A),
  ("e_carcaj",   "quiver",                 "Carcaj",              "espalda", "explorador",60,  N),
  ("e_brazales", "arms_bracers",           "Brazales de arquero", "brazos",  "explorador",100, A),
  ("e_recurvo",  "weapon_ranged_bow_recurve", "Arco recurvo",     "arma",    "explorador",160, N),
  ("e_coraza",   "torso_armour_leather",   "Coraza de batidor",   "torso",   "explorador",230, A),
  ("e_capa",     "cape_solid",             "Capa de ruta",        "espalda", "explorador",320, A),
  ("e_capucha",  "hat_hood_cloth",               "Capucha de guardabosques", "cabeza", "explorador",420, A),
  ("e_largo",    "weapon_ranged_bow_great", "Arco largo",         "arma",    "explorador",550, N),
  # Monje · Peso corporal y movilidad
  ("m_camisa",   "torso_clothes_sleeveless", "Camisa de novicio", "torso",   "monje",      0,  A),
  ("m_pantalon", "legs_pantaloons",        "Pantalón de novicio", "piernas", "monje",      0,  A),
  ("m_sandalias","feet_sandals",           "Sandalias de esparto","pies",    "monje",      0,  A),
  ("m_vara",     "weapon_magic_simple",    "Vara de roble",       "arma",    "monje",      0,  N),
  ("m_cinta",    "hat_headband_thick",     "Cinta de meditación", "cabeza",  "monje",     30,  A),
  ("m_tunica",   "torso_clothes_robe",     "Hábito del templo",   "torso",   "monje",     60,  A),
  ("m_vendas",   "arms_bracers",           "Vendas de combate",   "brazos",  "monje",    100,  A),
  ("m_nudosa",   "weapon_magic_gnarled",   "Bastón nudoso",       "arma",    "monje",    160,  N),
  ("m_capucha",  "hat_hood_cloth",               "Capucha del maestro", "cabeza",  "monje",    230,  A),
  ("m_capa",     "cape_solid",             "Manto del templo",    "espalda", "monje",    320,  A),
  ("m_cristal",  "weapon_magic_crystal",   "Báculo de cristal",   "arma",    "monje",    420,  N),
]
PELOS = [("plain","Corto"),("buzzcut","Rapado"),("messy1","Revuelto"),("bedhead","Despeinado"),("curly_short","Rizos"),
         ("afro","Afro"),("long_straight","Lisa"),("dreadlocks_short","Rastas"),("pixie","Pixie"),("bob","Melena corta"),
         ("long","Melena larga"),("ponytail","Coleta"),("braid","Trenza"),("bunches","Coletas")]
BARBAS = [("beards_trimmed","Recortada"),("beards_medium","Poblada"),("beards_winter","De invierno")]
OJOS = ["brown","blue","green","gray","purple","red","orange","yellow"]


def carga_args():
    if len(sys.argv) < 2: sys.exit(__doc__)
    cache = sys.argv[sys.argv.index("--cache") + 1] if "--cache" in sys.argv else os.path.join(sys.argv[1], "cache")
    return sys.argv[1], cache


def indice_definiciones(lpc):
    idx = {}
    for d, _, fs in os.walk(os.path.join(lpc, "sheet_definitions")):
        for f in fs:
            if f.endswith(".json") and not f.startswith("meta_"):
                idx[f[:-5]] = os.path.join(d, f)
    return idx


def busca(idx, nombre):
    if nombre in idx: return idx[nombre]
    c = [k for k in idx if k.endswith("_" + nombre) or nombre in k]
    if len(c) == 1: return idx[c[0]]
    exacta = [k for k in c if k.split("_")[-len(nombre.split("_")):] == nombre.split("_")]
    if len(exacta) == 1: return idx[exacta[0]]
    sys.exit(f"Definición ambigua o inexistente: {nombre} -> {c[:12]}")


def fichero_walk(todos, base, variante=None):
    """Devuelve la ruta de la animación de andar, directa o en subcarpeta de variantes."""
    if variante and base + f"walk/{variante}.png" in todos: return base + f"walk/{variante}.png"
    if base + "walk.png" in todos: return base + "walk.png"
    cand = sorted(p for p in todos if p.startswith(base + "walk/") and p.endswith(".png") and p.count("/") == base.count("/") + 1)
    if not cand: return None
    for pref in ("steel", "iron", "gray", "grey", "white", "base", "silver", "light"):
        for c in cand:
            if os.path.basename(c)[:-4].lstrip("_") == pref: return c
    return cand[0]


# Piezas sin versión masculina: se sustituyen por la que más se le parece.
ALTERNATIVA_M = {"torso_clothes_tunic": "torso_clothes_longsleeve_laced", "torso_clothes_robe": "torso_jacket_tabard"}


def capas_de(ruta_def, todos, cuerpo):
    d = json.load(open(ruta_def, encoding="utf-8"))
    out = []
    for k, v in d.items():
        if not k.startswith("layer_"): continue
        anim = v.get("custom_animation")
        if anim and anim != "walk_128": continue
        base = v.get(cuerpo)
        if not base: continue
        # Los arcos andan en fotogramas de 128: su fichero es la carpeta + .png
        w = base.rstrip("/") + ".png" if anim else fichero_walk(todos, base)
        if anim and w not in todos: w = fichero_walk(todos, base + "x")
        if w: out.append({"src": w, "z": v["zPos"]})
    return out, d.get("credits", [])


def licencia_de(ruta, creditos_csv, credits_def):
    fila = creditos_csv.get(ruta)
    if fila: return fila["authors"], fila["licenses"], fila["urls"]
    mejores = [c for c in credits_def if ruta.startswith(c["file"].rstrip("/"))]
    if mejores:
        c = max(mejores, key=lambda c: len(c["file"]))
        return ",".join(c["authors"]), ",".join(c["licenses"]), " ".join(c["urls"])
    pref = os.path.dirname(ruta)
    while pref:
        for k, f in creditos_csv.items():
            if k.startswith(pref + "/"): return f["authors"], f["licenses"], f["urls"]
        pref = os.path.dirname(pref)
    sys.exit(f"Sin créditos: {ruta}")


def mejor_licencia(texto):
    tiene = [l.strip() for l in re.split(r"[,;]", texto)]
    for l in ORDEN_LICENCIAS:
        if l in tiene: return l
    sys.exit(f"Licencia no admitida: {texto}")


def baja(ruta, cache):
    dest = os.path.join(cache, ruta.replace("/", "__"))
    if not os.path.exists(dest):
        r = urllib.request.Request(RAW + urllib.request.quote(ruta), headers={"User-Agent": "rpgym-avatar"})
        data = urllib.request.urlopen(r, timeout=60).read()
        with open(dest, "wb") as f: f.write(data)
    return dest


def recorta(ruta_local):
    im = Image.open(ruta_local).convert("RGBA")
    if im.size[0] < 576 or im.size[1] < 256: raise ValueError(f"{ruta_local}: {im.size}")
    out = Image.new("RGBA", (576, 128))
    if im.size[0] >= 1152:                  # fotogramas de 128: el personaje va en el centro
        for fila, y in ((FILA_FRENTE, 0), (FILA_PERFIL, 64)):
            for i in range(9):
                out.paste(im.crop((i * 128 + 32, fila * 128 + 32, i * 128 + 96, fila * 128 + 96)), (i * 64, y))
        return out
    out.paste(im.crop((0, FILA_FRENTE * 64, 576, FILA_FRENTE * 64 + 64)), (0, 0))
    out.paste(im.crop((0, FILA_PERFIL * 64, 576, FILA_PERFIL * 64 + 64)), (0, 64))
    return out


# Acciones: (carpeta LPC, fila de la hoja LPC, fotogramas). Una fila cada una en acc/.
# Van en fotogramas de 128 porque un mandoble en pleno tajo no cabe en los 64 de andar.
ACCIONES = [("spellcast", FILA_FRENTE, 7), ("slash", FILA_PERFIL, 6)]
ACC = 128

# Poses de los ejercicios: (animación LPC, fila LPC, fila en ej/, fotogramas). LPC no trae
# ejercicios: "herido" cortado antes de caer es una sentadilla, y el conjuro da las
# elevaciones y los curl. La fila 7 son dos poses quietas de andar, de frente y de perfil.
# Sin armas ni escudos: nadie hace sentadillas con la espada en la mano.
EJERCICIOS = [("hurt", 0, 0, 4), ("spellcast", FILA_FRENTE, 1, 7), ("spellcast", 0, 2, 7), ("climb", 0, 3, 6),
              ("thrust", FILA_PERFIL, 4, 6), ("sit", FILA_PERFIL, 5, 3), ("run", FILA_PERFIL, 6, 8)]
EJ = 64


def pega_ej(lienzo, ruta_local, fila_lpc, fila, n, x0=0):
    im = Image.open(ruta_local).convert("RGBA")
    if im.size[1] == EJ: fila_lpc = 0      # "herido" y "trepar" traen una sola fila
    for i in range(n):
        if (i + 1) * EJ > im.size[0]: break
        lienzo.paste(im.crop((i * EJ, fila_lpc * EJ, (i + 1) * EJ, (fila_lpc + 1) * EJ)), ((x0 + i) * EJ, fila * EJ))


def hermana(ruta, anim, todos):
    """La misma capa en otra animación, si existe."""
    for r in (ruta.replace("/walk/", f"/{anim}/"), ruta.replace("/walk.png", f"/{anim}.png")):
        if r != ruta and r in todos: return r
    return None


def capas_tajo(ruta_def, todos, cuerpo):
    """Las armas largas traen el tajo aparte, en fotogramas de 128 o 192."""
    d = json.load(open(ruta_def, encoding="utf-8"))
    out = []
    for k, v in d.items():
        if not k.startswith("layer_") or v.get("custom_animation") not in ("slash_128", "slash_oversize"): continue
        base = v.get(cuerpo)
        if not base: continue
        cand = sorted(p for p in todos if p.startswith(base) and p.endswith(".png") and p.count("/") == base.count("/"))
        if not cand: continue
        elegido = next((c for pref in ("steel", "iron", "gray", "grey", "white", "base", "silver", "light", "blue") for c in cand
                        if os.path.basename(c)[:-4].lstrip("_") == pref), cand[0])
        out.append({"src": elegido, "z": v["zPos"]})
    return out, d.get("credits", [])


def pega_accion(lienzo, ruta_local, fila_lpc, fila, n):
    """Copia una fila al lienzo. Sea cual sea el tamaño de origen, el personaje queda
    centrado en un fotograma de 128: por eso las tres vías encajan entre sí."""
    im = Image.open(ruta_local).convert("RGBA")
    tam = im.size[1] // 4                   # las hojas LPC tienen siempre 4 direcciones
    for i in range(n):
        if (i + 1) * tam > im.size[0]: break
        trozo = im.crop((i * tam, fila_lpc * tam, (i + 1) * tam, (fila_lpc + 1) * tam))
        if tam > ACC:
            m = (tam - ACC) // 2
            trozo = trozo.crop((m, m, m + ACC, m + ACC))
        m = (ACC - min(tam, ACC)) // 2
        lienzo.paste(trozo, (i * ACC + m, fila * ACC + m))


def luma(c): return 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]


def indexa(im):
    """Cambia cada color por su escalón (0-5), repartiendo por luminosidad.
    Se guarda como gris 0,40,..200: la app lee el canal rojo / 40."""
    px = im.load()
    usados = sorted({px[x, y][:3] for x in range(im.width) for y in range(im.height) if px[x, y][3] > 0}, key=luma)
    if not usados: return im
    lo, hi = luma(usados[0]), luma(usados[-1])
    tabla = {}
    for c in usados:
        t = (luma(c) - lo) / (hi - lo) if hi > lo else .6
        tabla[c] = min(5, round(t * 5)) if len(usados) > 2 else (1 if c == usados[0] else 3)
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            if a:
                v = tabla[(r, g, b)] * 40
                px[x, y] = (v, v, v, 255 if a > 127 else 0)
    return im


def main():
    lpc, cache = carga_args()
    os.makedirs(cache, exist_ok=True); os.makedirs(SALIDA, exist_ok=True)
    todos = {l.strip()[len("spritesheets/"):] for l in open(os.path.join(lpc, "all.txt"), encoding="utf-8") if l.strip()}
    idx = indice_definiciones(os.path.join(lpc, "lpc"))
    creditos = {r["filename"]: r for r in csv.DictReader(open(os.path.join(lpc, "lpc", "CREDITS.csv"), encoding="utf-8"))}

    usadas = {}                    # ruta LPC -> (slug, grupo, credits_def)

    def registra(capa, grupo, credits_def):
        ruta = capa["src"]
        slug = re.sub(r"[^a-z0-9]+", "-", ruta.lower().replace(".png", "").replace("/walk", "")).strip("-")
        clave = (ruta, grupo)
        usadas.setdefault(clave, (slug + ("-i" if grupo else ""), grupo, credits_def))
        return {"s": usadas[clave][0], "z": capa["z"], **({"g": grupo} if grupo else {})}

    def capas_item(nombre_def, grupo):
        res = {}
        for k, cuerpo in CUERPOS.items():
            nombre = ALTERNATIVA_M.get(nombre_def, nombre_def) if k == "m" else nombre_def
            cs, cr = capas_de(busca(idx, nombre), todos, cuerpo)
            if not cs: print(f"  ! {nombre_def} sin capas para {cuerpo}")
            res[k] = [registra(c, grupo, cr) for c in cs]
        return res

    datos = {"cuerpo": {}, "ojos": {}, "pelos": {}, "barbas": {}, "piezas": {}}
    for k, cuerpo in CUERPOS.items():
        cs, cr = capas_de(busca(idx, "body"), todos, cuerpo)
        cabeza, cr2 = capas_de(busca(idx, "heads_human_" + cuerpo), todos, cuerpo)
        datos["cuerpo"][k] = [registra(c, "piel", cr) for c in cs] + [registra(c, "piel", cr2) for c in cabeza]

    base_ojos = "eyes/human/adult/default/"
    for color in OJOS:
        ruta = base_ojos + f"walk/{color}.png"
        assert ruta in todos, ruta
        datos["ojos"][color] = registra({"src": ruta, "z": 106}, None, [])

    for pid, nombre in PELOS:
        datos["pelos"][pid] = {"n": nombre, "capas": capas_item("hair_" + pid, "pelo")["m"]}
    for pid, nombre in BARBAS:
        datos["barbas"][pid] = {"n": nombre, "capas": capas_item(pid, "pelo")["m"]}

    for pid, d, nombre, ranura, rama, umbral, grupo in PIEZAS:
        datos["piezas"][pid] = {"n": nombre, "ranura": ranura, "rama": rama, "u": umbral, "capas": capas_item(d, grupo)}

    print(f"{len(usadas)} capas")
    rutas = sorted({c[0] for c in usadas})
    with ThreadPoolExecutor(8) as ex:
        locales = dict(zip(rutas, ex.map(lambda r: baja(r, cache), rutas)))

    filas = []
    for (ruta, grupo), (slug, _, cr) in sorted(usadas.items()):
        im = recorta(locales[ruta])
        if grupo: im = indexa(im)
        im.save(os.path.join(SALIDA, slug + ".png"), optimize=True)
        autores, lics, urls = licencia_de(ruta, creditos, cr)
        filas.append({"capa": slug, "original": ruta, "autores": autores, "licencia": mejor_licencia(lics), "licencias_posibles": lics, "enlaces": urls})

    # Acciones: cada capa de andar con sus hermanas, y las armas con su tajo aparte.
    os.makedirs(SALIDA_ACC, exist_ok=True)
    trabajos = {}          # slug -> (grupo, [(ruta, fila lpc, fila, fotogramas)], credits_def)
    for (ruta, grupo), (slug, _, cr) in usadas.items():
        partes = [(hermana(ruta, a, todos), f, i, n) for i, (a, f, n) in enumerate(ACCIONES)]
        partes = [x for x in partes if x[0]]
        if partes: trabajos[slug] = (grupo, partes, cr)
    for pid, d, nombre, ranura, rama, umbral, grupo in PIEZAS:
        if ranura != "arma": continue
        tajos = {}
        for k, cuerpo in CUERPOS.items():
            cs, cr = capas_tajo(busca(idx, d), todos, cuerpo)
            tajos[k] = []
            for c in cs:
                slug = "tajo-" + re.sub(r"[^a-z0-9]+", "-", c["src"].lower().replace(".png", "")).strip("-")
                trabajos[slug] = (None, [(c["src"], FILA_PERFIL, 1, 6)], cr)
                tajos[k].append({"s": slug, "z": c["z"]})
        if any(tajos.values()): datos["piezas"][pid]["tajo"] = tajos
    rutas_acc = sorted({x[0] for _, partes, _ in trabajos.values() for x in partes})
    print(f"{len(trabajos)} capas de acción, {len(rutas_acc)} ficheros")
    with ThreadPoolExecutor(8) as ex:
        locales_acc = dict(zip(rutas_acc, ex.map(lambda r: baja(r, cache), rutas_acc)))
    vistas = set()
    for slug, (grupo, partes, cr) in sorted(trabajos.items()):
        lienzo = Image.new("RGBA", (7 * ACC, 2 * ACC))
        for ruta, fila_lpc, fila, n in partes:
            pega_accion(lienzo, locales_acc[ruta], fila_lpc, fila, n)
            if ruta not in vistas:
                vistas.add(ruta)
                autores, lics, urls = licencia_de(ruta, creditos, cr)
                filas.append({"capa": "acc/" + slug, "original": ruta, "autores": autores, "licencia": mejor_licencia(lics), "licencias_posibles": lics, "enlaces": urls})
        if grupo: lienzo = indexa(lienzo)
        lienzo.save(os.path.join(SALIDA_ACC, slug + ".png"), optimize=True)
    datos["acc"] = sorted(s for s in trabajos if not s.startswith("tajo-"))

    # Poses de los ejercicios.
    os.makedirs(SALIDA_EJ, exist_ok=True)
    poses = {}             # slug -> (grupo, ruta de andar, [(ruta, fila lpc, fila, fotogramas)], credits_def)
    for (ruta, grupo), (slug, _, cr) in usadas.items():
        if ruta.startswith(("weapon", "shield")): continue
        partes = [(hermana(ruta, a, todos), f, i, n) for a, f, i, n in EJERCICIOS]
        poses[slug] = (grupo, ruta, [x for x in partes if x[0]], cr)
    rutas_ej = sorted({x[0] for _, _, partes, _ in poses.values() for x in partes} | {v[1] for v in poses.values()})
    print(f"{len(poses)} capas de ejercicios, {len(rutas_ej)} ficheros")
    with ThreadPoolExecutor(8) as ex:
        locales_ej = dict(zip(rutas_ej, ex.map(lambda r: baja(r, cache), rutas_ej)))
    vistas_ej = set()
    for slug, (grupo, andar, partes, cr) in sorted(poses.items()):
        lienzo = Image.new("RGBA", (8 * EJ, 8 * EJ))
        for ruta, fila_lpc, fila, n in partes:
            pega_ej(lienzo, locales_ej[ruta], fila_lpc, fila, n)
            if ruta not in vistas_ej:
                vistas_ej.add(ruta)
                autores, lics, urls = licencia_de(ruta, creditos, cr)
                filas.append({"capa": "ej/" + slug, "original": ruta, "autores": autores, "licencia": mejor_licencia(lics), "licencias_posibles": lics, "enlaces": urls})
        pega_ej(lienzo, locales_ej[andar], FILA_FRENTE, 7, 1)
        pega_ej(lienzo, locales_ej[andar], FILA_PERFIL, 7, 1, 1)
        if grupo: lienzo = indexa(lienzo)
        lienzo.save(os.path.join(SALIDA_EJ, slug + ".png"), optimize=True)
    datos["ej"] = sorted(poses)

    # El pícaro lleva dos dagas. LPC solo dibuja la de la mano derecha, así que la otra
    # es la misma reflejada, medio paso desfasada para que las manos no vayan a la par.
    for capa in [c for c in datos["piezas"]["p_daga"]["capas"]["m"] if c["z"] > 100]:
        base = Image.open(os.path.join(SALIDA, capa["s"] + ".png")).convert("RGBA")
        gemela = Image.new("RGBA", base.size)
        for i in range(9):
            j = i if i == 0 else 1 + (i - 1 + 4) % 8
            gemela.paste(base.crop((j * 64, 0, j * 64 + 64, 64)).transpose(Image.FLIP_LEFT_RIGHT), (i * 64, 0))
        gemela.save(os.path.join(SALIDA, capa["s"] + "-gemela.png"), optimize=True)
        for sexo in "mf":
            datos["piezas"]["p_daga"]["capas"][sexo].append({"s": capa["s"] + "-gemela", "z": capa["z"]})

    with open(os.path.join(SALIDA, "CREDITOS.csv"), "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(filas[0].keys())); w.writeheader(); w.writerows(filas)

    autores = sorted({a.strip() for f in filas for a in f["autores"].split(",") if a.strip()}, key=str.lower)
    datos["autores"] = autores
    with open(os.path.join(RAIZ, "src", "avatar-data.json"), "w", encoding="utf-8") as f:
        json.dump(datos, f, ensure_ascii=False, separators=(",", ":"))

    from collections import Counter
    print(Counter(f["licencia"] for f in filas))
    print(len(autores), "autores")
    print(sum(os.path.getsize(os.path.join(SALIDA, x)) for x in os.listdir(SALIDA)) // 1024, "KB en public/avatar")


if __name__ == "__main__":
    main()
