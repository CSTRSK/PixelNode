#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Erzeugt die PWA-Icons fuer PixelNode: 16x16-Pixel-Art, NEAREST-skaliert."""
from PIL import Image, ImageDraw

GRID = 16
BG = (15, 23, 42)          # slate-900
INDIGO = (99, 102, 241)    # #6366f1
CYAN = (34, 211, 238)      # #22d3ee
VIOLET = (168, 85, 247)    # #a855f7
LIGHT = (226, 232, 240)    # slate-200

# 16x16 Raster: '.' leer, 'a' Indigo-Knoten, 'b' Cyan-Knoten, 'c' Violett-Knoten,
# 'x' Verbindungslinie, 'o' heller Pixel
RASTER = [
    "................",
    "................",
    "................",
    "..aaa......bbb..",
    "..aaa.....xbbb..",
    "..aaa....x.bbb..",
    "....x...x.......",
    "....x..x........",
    "....xx..........",
    "......x.c.......",
    ".......ccc......",
    ".......ccc......",
    ".......ccc......",
    "................",
    "................",
    "................",
]

FARBEN = {"a": INDIGO, "b": CYAN, "c": VIOLET, "x": LIGHT, "o": (255, 255, 255)}


def raster_bild() -> Image.Image:
    img = Image.new("RGBA", (GRID, GRID), BG + (255,))
    px = img.load()
    for y, zeile in enumerate(RASTER):
        for x, ch in enumerate(zeile):
            if ch in FARBEN:
                px[x, y] = FARBEN[ch] + (255,)
    return img


def skaliert(breite: int, rand_anteil: float = 0.0, radius_anteil: float = 0.22) -> Image.Image:
    """Skaliert das Raster auf `breite` px; rand_anteil = Innenabstand (maskable)."""
    inner = int(breite * (1 - 2 * rand_anteil))
    klein = raster_bild().resize((inner, inner), Image.NEAREST)
    bild = Image.new("RGBA", (breite, breite), BG + (255,))
    off = (breite - inner) // 2
    bild.paste(klein, (off, off))
    if rand_anteil == 0.0:
        # abgerundete Ecken nur im Normalzustand (maskable braucht volles Feld)
        maske = Image.new("L", (breite, breite), 0)
        ImageDraw.Draw(maske).rounded_rectangle(
            [0, 0, breite - 1, breite - 1], radius=int(breite * radius_anteil), fill=255
        )
        bild.putalpha(maske)
    return bild


if __name__ == "__main__":
    ziele = [
        ("public/icon-192.png", skaliert(192)),
        ("public/icon-512.png", skaliert(512)),
        ("public/icon-maskable-512.png", skaliert(512, rand_anteil=0.18)),
        ("public/apple-touch-icon.png", skaliert(180)),
        ("public/favicon.png", skaliert(64)),
    ]
    for pfad, bild in ziele:
        bild.save(pfad)
        print(f"✓ {pfad} {bild.size}")
    # Vorschau zur eigenen Sichtprüfung
    skaliert(256).save("/tmp/pixelnode-icon-vorschau.png")
