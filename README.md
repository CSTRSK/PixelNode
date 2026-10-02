# PixelNode Studio — Sprite- und Pixel-Art-Animator

**English:** A node-based pixel-art animation editor for the browser. Instead of a frame list you
wire a graph — drawing, palette, transform, blending, sequencer, subgraph — and export the result
as a sprite sheet (PNG), an animated GIF, or a JSON project file. Runs entirely client-side: no
account, no server, no upload; installable as a PWA with offline start. Interface in 14 languages,
five UI designs, AGPL-3.0.

**Live:** https://cstrsk.de/PixelNode/

---

## Was das ist

Ein Pixel-Art-Editor, in dem die Animation aus einem **Knotengraphen** entsteht statt aus einer
Frame-Liste. Jeder Knoten liefert Daten an den nächsten: Zeichnung, Palette, Transformation,
Blending, Sequencer, Untergraph, Ausgabe. Ein Palettenknoten färbt damit zwanzig Frames um, ein
Blender erzeugt die Zwischenbilder — und eine Änderung wirkt durch den ganzen Graphen.

Die Anwendung läuft vollständig im Browser. Es gibt keine Anmeldung, keine Cloud und keine
Hochlade-Funktion; Projekte liegen im lokalen Browserspeicher und verlassen das Gerät nicht.

## Funktionen

| Bereich | Umfang |
|---|---|
| Knoten | Zeichnung, Palette, Transformation, Blending, Sequencer, Untergraph, Ausgabe |
| Werkzeuge | Pinsel (`B`), Radierer (`E`), Füllen (`F`), Pipette (`I`), frei belegbare Kürzel |
| Export | Sprite-Sheet als PNG (bis 2× mit scharfen Kanten, horizontale Reihe oder Raster), animiertes GIF, Projektdatei als JSON |
| Vorlagen | 16 vollständige Beispielgraphen (z. B. „Bouncing Slime" mit 8 FPS, „Walking Character" mit 10 FPS) |
| Oberflächen | Modern Studio (Standard), Cyberpunk Neon, Game Boy Classic, PICO-8 Fantasy, Blueprint; hell/dunkel, Kontrastmodus |
| Sprachen | 14 (Deutsch, Englisch, Französisch, Spanisch, Italienisch, Portugiesisch, Japanisch, Koreanisch, Chinesisch, Hindi, Arabisch, Russisch, Türkisch, Indonesisch) |
| Bedienung | Rückgängig/Wiederholen, Sprunglink zur Zeichenfläche, Beschriftungen für Vorleseprogramme, Autospeicherung alle 30 Sekunden |
| PWA | Service Worker, Manifest, Icons, Offline-Start nach dem ersten Besuch |

## Entwicklung

Voraussetzung: Node.js (getestet mit Node 22) und npm.

```bash
npm install        # Abhängigkeiten
npm run dev        # Entwicklungsserver auf http://localhost:3000
npm run build      # Produktionsbündel nach dist/
npm run lint       # Typprüfung (tsc --noEmit)
```

Das Bündel ist für den statischen Betrieb ausgelegt (`base: './'` in `vite.config.ts`), damit es
auch in einem Unterordner läuft. **Es gibt keinen Server-Teil.** Die Dateien aus `dist/` werden
unverändert ausgeliefert:

```
dist/index.html
dist/assets/*.js, *.css
dist/manifest.webmanifest
dist/sw.js
dist/icon-192.png, icon-512.png, icon-maskable-512.png, apple-touch-icon.png, favicon.png
dist/.htaccess          # CSP + Sicherheits-Header (siehe scripts/)
```

Hinweis für das Deployment: `npm run build` leert `dist/`. Die CSP wird deshalb nach jedem Build
neu geschrieben (`scripts/apply_csp_htaccess.py`), sonst liefert der Server irgendwann eine
veraltete Policy aus. Zum Ausrollen auf einen FTP-Webspace liegt `scripts/deploy_dist_ftps.py`
bei; es lädt nur geänderte Dateien und entfernt veraltete Asset-Dateien anhand der **kompletten**
lokalen Dateiliste.

## Datenschutz

- Kein Konto, keine Sitzungen, keine Kennungen, kein Server.
- Projekte und Einstellungen im lokalen Browserspeicher (`localStorage`) des Geräts.
- Keine Werbung, kein Analytics-Skript, keine Übertragung an Dritte.
- Die Anzeige lädt zwei Schriftfamilien von Google Fonts; alles andere ist lokal.

## Grenzen

- **Keine Ebenen.** Mehrere Zeichnungen werden über Blending-Knoten gemischt, nicht gestapelt.
- **Arbeitsstand liegt im Browser.** Sicherung ist der JSON-Export; wer den Browserspeicher
  löscht, verliert den Stand.
- **Offline erst ab dem zweiten Start.** Der erste Besuch muss die Dateien laden.
- **GIF-Kodierung im Hauptthread.** Bei sehr vielen Frames kann die Oberfläche kurz stocken.

## Herkunft

Der Editor entstand als KI-gestütztes Projekt und wurde für den eigenständigen Browser-Betrieb
aufbereitet: Service Worker, Manifest und Icons ergänzt, relative Pfade, keine Server-Abhängigkeit,
Content-Security-Policy, mitgelieferte Deploy-Skripte. Der ursprüngliche Export steht in keinem
Zusammenhang mit diesem Repository.

## Lizenz

AGPL-3.0 — siehe [LICENSE](LICENSE). Wer die Anwendung verändert und als Netzwerkdienst
bereitstellt, muss den Quellcode ebenfalls unter dieser Lizenz verfügbar machen.

## Technische Kennzahlen des Bündels

| Kennzahl | Wert |
|---|---|
| Module | 1.691 |
| JavaScript | 504 KB (137 KB komprimiert) |
| CSS | 98 KB (14 KB komprimiert) |
| Bauzeit | 646 ms |
| Laufzeit-Abhängigkeiten | React 19, Lucide-Icons, gifenc |

---

CSTRSK.DE · COPYRIGHT 2008–2026
