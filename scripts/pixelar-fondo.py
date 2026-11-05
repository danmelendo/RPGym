#!/usr/bin/env python3
"""Convierte una imagen generada en pixel art de verdad: rejilla real y paleta corta.

    python scripts/pixelar-fondo.py <entrada> <salida.png> [--ancho 144] [--colores 40] [--claro]

Una IA dibuja "estilo pixel" con píxeles de tamaños distintos y miles de colores.
Reducir a una rejilla fija y cuantizar la paleta es lo que lo deja coherente con los
sprites. --claro sube la luz y calienta los tonos para el tema claro.
"""
import sys
from PIL import Image, ImageEnhance


def arg(nombre, defecto):
    return type(defecto)(sys.argv[sys.argv.index(nombre) + 1]) if nombre in sys.argv else defecto


def main():
    entrada, salida = sys.argv[1], sys.argv[2]
    ancho, colores = arg("--ancho", 144), arg("--colores", 40)
    im = Image.open(entrada).convert("RGB")
    alto = round(im.height * ancho / im.width)
    if "--claro" in sys.argv:
        im = im.point(lambda v: int(255 * (v / 255) ** .55))
        im = ImageEnhance.Color(im).enhance(.45)
        r, g, b = im.split()
        im = Image.merge("RGB", (r.point(lambda v: min(255, int(v * 1.06 + 14))), g.point(lambda v: min(255, int(v * 1.0 + 10))), b.point(lambda v: int(v * .86 + 6))))
    im = im.resize((ancho, alto), Image.BOX)
    im = im.quantize(colors=colores, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    im.save(salida, optimize=True)
    print(salida, im.size)


if __name__ == "__main__":
    main()
