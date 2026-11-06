#!/usr/bin/env python3
"""Pinta los fondos de las tres zonas de la mazmorra con la hoja Tiny Dungeon (CC0).

    python scripts/generar-fondos-mazmorra.py

Escribe public/rpg/zona-1.png, zona-2.png y zona-3.png, de 128x80 (8x5 casillas). Salen de
la misma hoja que los enemigos, así que comparten tamaño de píxel y estilo. Cada zona tiene
su plano de casillas y su tinte; la luz de antorcha y la sombra se dibujan aquí.
"""
import os
from PIL import Image, ImageDraw

RAIZ = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
HOJA = os.path.join(RAIZ, "public", "rpg", "tiny-dungeon.png")
C, ANCHO, ALTO = 16, 8, 5

# Pared de arriba abajo, suelo en la última fila. -1 deja ver lo que hay debajo.
ZONAS = {
    1: {  # El sótano: piedra, estanterías viejas y un yunque que hace de pesa
        "pared": [[40, 14, 40, 40, 14, 40, 14, 40],
                  [14, 28, 40, 14, 40, 14, 28, 14],
                  [40, 14, 40, 7, 40, 40, 14, 40],
                  [14, 40, 14, 46, 47, 14, 40, 14]],
        "suelo": [48, 49, 50, 51, 48, 50, 49, 51],
        "cosas": [(1, 3, 75), (6, 3, 74), (7, 3, 82), (0, 3, 82)],
        "antorchas": [(2, 2), (5, 2)],
        "tinte": (1.0, 1.0, 1.0), "suelo_tinte": (.62, .5, .42), "luz": (255, 170, 80),
    },
    2: {  # Las catacumbas: humedad, gárgolas que gotean y una puerta entornada
        "pared": [[14, 40, 8, 14, 40, 8, 40, 14],
                  [40, 20, 40, 40, 14, 40, 20, 40],
                  [14, 40, 14, 40, 40, 14, 40, 14],
                  [40, 14, 40, 34, 35, 40, 14, 40]],
        "suelo": [0, 12, 24, 0, 13, 24, 12, 0],
        "cosas": [(1, 3, 65), (6, 3, 64), (7, 3, 65)],
        "antorchas": [],
        "tinte": (.62, .92, .78), "suelo_tinte": (.34, .62, .42), "luz": (90, 255, 170),
    },
    3: {  # La sala del trono: estandartes, gárgolas y el arco abierto hacia El Abandono
        "pared": [[40, 29, 40, 14, 14, 40, 29, 40],
                  [14, 40, 14, 40, 40, 14, 40, 14],
                  [19, 14, 40, 14, 14, 40, 14, 19],
                  [14, 40, 14, 10, 11, 14, 40, 14]],
        "suelo": [0, 24, 12, 0, 12, 24, 0, 13],
        "cosas": [],
        "antorchas": [(2, 2), (5, 2)],
        "tinte": (.86, .44, .5), "suelo_tinte": (.62, .24, .3), "luz": (255, 80, 60),
    },
}


def casilla(hoja, i):
    return hoja.crop(((i % 12) * C, (i // 12) * C, (i % 12 + 1) * C, (i // 12 + 1) * C))


def tiñe(im, t):
    r, g, b, a = im.split()
    return Image.merge("RGBA", (r.point(lambda v: int(v * t[0])), g.point(lambda v: int(v * t[1])), b.point(lambda v: int(v * t[2])), a))


def luz(im, x, y, radio, color):
    """Halo por anillos: nada de degradados suaves, que aquí todo son píxeles."""
    capa = Image.new("RGBA", im.size)
    d = ImageDraw.Draw(capa)
    for k, a in ((1, 26), (.68, 30), (.38, 38)):
        r = radio * k
        d.ellipse([x - r, y - r, x + r, y + r], fill=(*color, a))
    im.alpha_composite(capa)


def sombra(im):
    """Oscurece arriba y por los lados a escalones, para que mande el centro."""
    px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            lado = abs(x - im.width / 2) / (im.width / 2)
            f = 1 - .5 * max(0, 1 - y / (im.height * .5)) - .38 * lado ** 2
            f = round(f * 8) / 8
            r, g, b, a = px[x, y]
            px[x, y] = (int(r * f), int(g * f), int(b * f), a)


def zona(hoja, z):
    im = Image.new("RGBA", (ANCHO * C, ALTO * C), (16, 13, 26, 255))
    for y, fila in enumerate(z["pared"]):
        for x, i in enumerate(fila):
            im.alpha_composite(tiñe(casilla(hoja, i), z["tinte"]), (x * C, y * C))
    for x, i in enumerate(z["suelo"]):
        im.alpha_composite(tiñe(casilla(hoja, i), z["suelo_tinte"]), (x * C, (ALTO - 1) * C))
    for x, y, i in z["cosas"]:
        im.alpha_composite(tiñe(casilla(hoja, i), z["tinte"]), (x * C, y * C))
    sombra(im)
    d = ImageDraw.Draw(im)
    for x, y in z["antorchas"]:
        cx, cy = x * C + 8, y * C + 7
        luz(im, cx, cy - 2, 22, z["luz"])
        d.rectangle([cx - 1, cy + 1, cx, cy + 7], fill=(92, 62, 44, 255))
        d.rectangle([cx - 2, cy - 2, cx + 1, cy], fill=z["luz"] + (255,))
        d.rectangle([cx - 1, cy - 4, cx, cy - 3], fill=(255, 236, 170, 255))
    if not z["antorchas"]:
        luz(im, im.width // 2, (ALTO - 2) * C + 8, 30, z["luz"])
    return im.convert("RGB").quantize(colors=64, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)


def main():
    hoja = Image.open(HOJA).convert("RGBA")
    for n, z in ZONAS.items():
        ruta = os.path.join(RAIZ, "public", "rpg", f"zona-{n}.png")
        zona(hoja, z).save(ruta, optimize=True)
        print(ruta, os.path.getsize(ruta), "bytes")


if __name__ == "__main__":
    main()
