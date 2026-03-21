# Schach vs Engine

Ein 2D Schachspiel im Browser gegen eine **KI-Engine** (Minimax + Alpha-Beta Pruning), gebaut mit **Phaser 3**.

## Voraussetzungen

- **Node.js** (Version 18+): [https://nodejs.org](https://nodejs.org)
  - LTS-Version herunterladen und installieren
  - Nach Installation Terminal/PowerShell **neu starten**

## Installation & Start

```bash
# 1. Abhängigkeiten installieren
npm install

# 2. Server starten
npm start
```

Dann **http://localhost:3000** im Browser öffnen.

## Ohne Server (direkt im Browser)

Du kannst auch einfach `public/index.html` direkt im Browser öffnen — kein Server nötig!

## Projektstruktur

```
onlineChess/
├── server.js                 # Einfacher Static-File-Server
├── package.json
├── public/
│   ├── index.html            # Hauptseite mit UI-Controls
│   └── js/
│       ├── main.js           # Phaser Konfiguration
│       ├── constants.js      # Konstanten & Figurensetup
│       ├── chessLogic.js     # Schachregeln & Zugvalidierung
│       ├── chessEngine.js    # KI-Engine (Minimax/Alpha-Beta)
│       └── scenes/
│           ├── BootScene.js  # Figur-Texturen generieren
│           └── GameScene.js  # Hauptspiel-Szene
```

## Features

- Spielen gegen KI-Engine mit 3 Schwierigkeitsstufen
- Vollständige Schachregeln (Rochade, En passant, Bauernumwandlung)
- Legale Züge werden visuell angezeigt
- Schach / Schachmatt / Patt-Erkennung
- Letzter Zug wird hervorgehoben
- Spielen als Weiß oder Schwarz wählbar
