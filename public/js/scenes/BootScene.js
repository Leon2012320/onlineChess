// ============================================
// Boot Scene - Figuren-Texturen erzeugen
// Unterstützt: Holz (Canvas) & Lichess SVG Sets
// ============================================

// Globaler Figurenstil
let currentPieceStyle = 'cburnett';

// Lichess SVG Piece Sets
const LICHESS_PIECE_SETS = ['cburnett','merida','alpha','staunty','california','maestro','kosal','letter'];

// Map: unsere internen Namen -> Lichess Dateinamen
const PIECE_FILE_MAP = {
    'king': 'K', 'queen': 'Q', 'rook': 'R', 'bishop': 'B', 'knight': 'N', 'pawn': 'P',
};
const COLOR_FILE_MAP = { 'white': 'w', 'black': 'b' };

class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Gespeicherten Stil laden
        const saved = localStorage.getItem('chess_piece_style');
        if (saved) currentPieceStyle = saved;

        const style = currentPieceStyle;
        if (style !== 'wood') {
            for (const color of [COLOR.WHITE, COLOR.BLACK]) {
                for (const type of Object.values(PIECE)) {
                    const key = `${color}_${type}`;
                    const prefix = COLOR_FILE_MAP[color];
                    const suffix = PIECE_FILE_MAP[type];
                    const url = `https://lichess1.org/assets/piece/${style}/${prefix}${suffix}.svg`;
                    this.load.svg(key, url, { width: TILE_SIZE - 8, height: TILE_SIZE - 8 });
                }
            }
        }
    }

    create() {
        if (currentPieceStyle === 'wood') {
            this._createWoodTextures();
        } else {
            // Fallback für fehlgeschlagene SVG-Loads
            BootScene._ensureFallbacks(this);
        }
        this.scene.start('GameScene');
    }

    // ---- Figuren-Texturen wechseln (von außen aufrufbar) ----
    static async changePieceStyle(game, newStyle) {
        if (newStyle === currentPieceStyle) return;
        currentPieceStyle = newStyle;

        if (newStyle === 'wood') {
            // Holz-Texturen mit Canvas erzeugen
            const boot = game.scene.getScene('BootScene');
            // Alte Texturen entfernen
            for (const color of [COLOR.WHITE, COLOR.BLACK]) {
                for (const type of Object.values(PIECE)) {
                    const key = `${color}_${type}`;
                    if (boot.textures.exists(key)) boot.textures.remove(key);
                }
            }
            boot._createWoodTextures();
        } else {
            // Lichess SVG laden
            await BootScene._loadLichessPieces(game, newStyle);
        }

        // Aktive Szene neu zeichnen
        const scenes = ['GameScene', 'ExerciseScene', 'TrainingScene'];
        for (const name of scenes) {
            const sc = game.scene.getScene(name);
            if (sc && sc.scene.isActive() && typeof sc.drawPieces === 'function') {
                sc.drawPieces();
            }
        }
    }

    static _loadLichessPieces(game, style) {
        return new Promise((resolve) => {
            const boot = game.scene.getScene('BootScene');

            // Alte Texturen entfernen
            for (const color of [COLOR.WHITE, COLOR.BLACK]) {
                for (const type of Object.values(PIECE)) {
                    const key = `${color}_${type}`;
                    if (boot.textures.exists(key)) boot.textures.remove(key);
                }
            }

            // Neue SVGs laden
            let loaded = 0;
            const total = 12; // 2 colors * 6 pieces
            for (const color of [COLOR.WHITE, COLOR.BLACK]) {
                for (const type of Object.values(PIECE)) {
                    const key = `${color}_${type}`;
                    const prefix = COLOR_FILE_MAP[color];
                    const suffix = PIECE_FILE_MAP[type];
                    const url = `https://lichess1.org/assets/piece/${style}/${prefix}${suffix}.svg`;

                    const img = new Image();
                    img.crossOrigin = 'anonymous';
                    img.onload = () => {
                        // SVG in Canvas rendern mit gewünschter Größe
                        const canvas = document.createElement('canvas');
                        const size = TILE_SIZE - 8;
                        canvas.width = size;
                        canvas.height = size;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, size, size);
                        boot.textures.addCanvas(key, canvas);
                        loaded++;
                        if (loaded >= total) resolve();
                    };
                    img.onerror = () => {
                        // Fallback-Textur erzeugen
                        BootScene._createFallbackTexture(boot, key, color, type);
                        loaded++;
                        if (loaded >= total) resolve();
                    };
                    img.src = url;
                }
            }
        });
    }

    // ============================
    // Holz-Figuren (Canvas)
    // ============================
    _createWoodTextures() {
        const S = TILE_SIZE;
        const cx = S / 2;

        for (const color of [COLOR.WHITE, COLOR.BLACK]) {
            const isW = color === COLOR.WHITE;
            const c = this._getWoodColors(isW);

            for (const type of Object.values(PIECE)) {
                const key = `${color}_${type}`;
                const canvas = document.createElement('canvas');
                canvas.width = S;
                canvas.height = S;
                const ctx = canvas.getContext('2d');

                ctx.shadowColor = 'rgba(0,0,0,0.35)';
                ctx.shadowBlur = 4;
                ctx.shadowOffsetX = 2;
                ctx.shadowOffsetY = 2;

                const baseY = S - 10;

                switch (type) {
                    case PIECE.PAWN: this._drawPawn(ctx, cx, baseY, c); break;
                    case PIECE.ROOK: this._drawRook(ctx, cx, baseY, c); break;
                    case PIECE.KNIGHT: this._drawKnight(ctx, cx, baseY, c); break;
                    case PIECE.BISHOP: this._drawBishop(ctx, cx, baseY, c); break;
                    case PIECE.QUEEN: this._drawQueen(ctx, cx, baseY, c); break;
                    case PIECE.KING: this._drawKing(ctx, cx, baseY, c); break;
                }

                this.textures.addCanvas(key, canvas);
            }
        }
    }

    // Fallback: prüft ob alle 12 Texturen existieren, erzeugt fehlende
    static _ensureFallbacks(scene) {
        for (const color of [COLOR.WHITE, COLOR.BLACK]) {
            for (const type of Object.values(PIECE)) {
                const key = `${color}_${type}`;
                if (!scene.textures.exists(key)) {
                    BootScene._createFallbackTexture(scene, key, color, type);
                }
            }
        }
    }

    // Erzeugt eine einfache Text-Fallback-Textur
    static _createFallbackTexture(scene, key, color, type) {
        const SYMBOLS = {
            'white_king': '\u2654', 'white_queen': '\u2655', 'white_rook': '\u2656',
            'white_bishop': '\u2657', 'white_knight': '\u2658', 'white_pawn': '\u2659',
            'black_king': '\u265A', 'black_queen': '\u265B', 'black_rook': '\u265C',
            'black_bishop': '\u265D', 'black_knight': '\u265E', 'black_pawn': '\u265F',
        };
        const size = TILE_SIZE - 8;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        ctx.font = `${size * 0.8}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = color === 'white' ? '#fff' : '#222';
        ctx.strokeStyle = color === 'white' ? '#333' : '#ccc';
        ctx.lineWidth = 1.5;
        const sym = SYMBOLS[key] || '?';
        ctx.fillText(sym, size / 2, size / 2);
        ctx.strokeText(sym, size / 2, size / 2);
        scene.textures.addCanvas(key, canvas);
    }

    _getWoodColors(isWhite) {
        if (isWhite) {
            return {
                base: '#deb887', light: '#f5deb3', dark: '#c4a265',
                shadow: '#a0824a', grain1: '#d4a96a', grain2: '#c89b5e', outline: '#8b6914',
            };
        } else {
            return {
                base: '#5c3317', light: '#7a4b2a', dark: '#3e1f0d',
                shadow: '#2a1508', grain1: '#4d2a13', grain2: '#6b3a1f', outline: '#1a0e06',
            };
        }
    }

    _addWoodGrain(ctx, cx, cy, w, h, colors) {
        ctx.save();
        ctx.globalAlpha = 0.15;
        for (let i = 0; i < 6; i++) {
            const y = cy - h / 2 + (h / 6) * i + 3;
            ctx.strokeStyle = i % 2 === 0 ? colors.grain1 : colors.grain2;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(cx - w / 3, y);
            ctx.quadraticCurveTo(cx, y + (i % 2 === 0 ? 2 : -2), cx + w / 3, y);
            ctx.stroke();
        }
        ctx.restore();
    }

    _drawBase(ctx, cx, baseY, c) {
        ctx.fillStyle = c.dark;
        ctx.beginPath();
        ctx.ellipse(cx, baseY, 22, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = c.base;
        ctx.beginPath();
        ctx.ellipse(cx, baseY - 2, 22, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = c.base;
        ctx.beginPath();
        ctx.moveTo(cx - 18, baseY - 2);
        ctx.lineTo(cx - 14, baseY - 12);
        ctx.lineTo(cx + 14, baseY - 12);
        ctx.lineTo(cx + 18, baseY - 2);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = c.light;
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.moveTo(cx - 14, baseY - 2);
        ctx.lineTo(cx - 11, baseY - 12);
        ctx.lineTo(cx - 4, baseY - 12);
        ctx.lineTo(cx - 6, baseY - 2);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    _drawPawn(ctx, cx, baseY, c) {
        this._drawBase(ctx, cx, baseY, c);
        ctx.fillStyle = c.base;
        ctx.beginPath();
        ctx.moveTo(cx - 12, baseY - 12);
        ctx.quadraticCurveTo(cx - 10, baseY - 30, cx - 6, baseY - 34);
        ctx.quadraticCurveTo(cx, baseY - 36, cx + 6, baseY - 34);
        ctx.quadraticCurveTo(cx + 10, baseY - 30, cx + 12, baseY - 12);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx, baseY - 42, 10, 0, Math.PI * 2);
        ctx.fill();
        this._addWoodGrain(ctx, cx, baseY - 30, 20, 30, c);
        ctx.fillStyle = c.light;
        ctx.globalAlpha = 0.35;
        ctx.beginPath();
        ctx.arc(cx - 3, baseY - 44, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = c.outline;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(cx, baseY - 42, 10, 0, Math.PI * 2);
        ctx.stroke();
    }

    _drawRook(ctx, cx, baseY, c) {
        this._drawBase(ctx, cx, baseY, c);
        ctx.fillStyle = c.base;
        ctx.beginPath();
        ctx.moveTo(cx - 14, baseY - 12);
        ctx.lineTo(cx - 12, baseY - 45);
        ctx.lineTo(cx + 12, baseY - 45);
        ctx.lineTo(cx + 14, baseY - 12);
        ctx.closePath();
        ctx.fill();
        const zinnenY = baseY - 45;
        ctx.fillStyle = c.base;
        ctx.fillRect(cx - 14, zinnenY - 10, 7, 10);
        ctx.fillRect(cx - 3, zinnenY - 10, 7, 10);
        ctx.fillRect(cx + 8, zinnenY - 10, 7, 10);
        ctx.fillStyle = c.dark;
        ctx.fillRect(cx - 7, zinnenY - 7, 4, 7);
        ctx.fillRect(cx + 4, zinnenY - 7, 4, 7);
        this._addWoodGrain(ctx, cx, baseY - 30, 24, 35, c);
        ctx.fillStyle = c.light;
        ctx.globalAlpha = 0.25;
        ctx.fillRect(cx - 10, baseY - 44, 5, 34);
        ctx.globalAlpha = 1;
        ctx.strokeStyle = c.outline;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(cx - 14, baseY - 12);
        ctx.lineTo(cx - 12, baseY - 45);
        ctx.lineTo(cx - 14, baseY - 45);
        ctx.lineTo(cx - 14, baseY - 55);
        ctx.lineTo(cx - 7, baseY - 55);
        ctx.lineTo(cx - 7, baseY - 45);
        ctx.lineTo(cx - 3, baseY - 45);
        ctx.lineTo(cx - 3, baseY - 55);
        ctx.lineTo(cx + 4, baseY - 55);
        ctx.lineTo(cx + 4, baseY - 45);
        ctx.lineTo(cx + 8, baseY - 45);
        ctx.lineTo(cx + 8, baseY - 55);
        ctx.lineTo(cx + 15, baseY - 55);
        ctx.lineTo(cx + 15, baseY - 45);
        ctx.lineTo(cx + 12, baseY - 45);
        ctx.lineTo(cx + 14, baseY - 12);
        ctx.stroke();
    }

    _drawKnight(ctx, cx, baseY, c) {
        this._drawBase(ctx, cx, baseY, c);
        ctx.fillStyle = c.base;
        ctx.beginPath();
        ctx.moveTo(cx - 10, baseY - 12);
        ctx.lineTo(cx - 12, baseY - 30);
        ctx.quadraticCurveTo(cx - 14, baseY - 48, cx - 6, baseY - 52);
        ctx.quadraticCurveTo(cx - 2, baseY - 56, cx + 4, baseY - 54);
        ctx.quadraticCurveTo(cx + 10, baseY - 52, cx + 12, baseY - 44);
        ctx.quadraticCurveTo(cx + 16, baseY - 38, cx + 14, baseY - 32);
        ctx.lineTo(cx + 8, baseY - 28);
        ctx.quadraticCurveTo(cx + 14, baseY - 24, cx + 12, baseY - 18);
        ctx.lineTo(cx + 10, baseY - 12);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = c.outline;
        ctx.beginPath();
        ctx.arc(cx + 2, baseY - 42, 2.5, 0, Math.PI * 2);
        ctx.fill();
        this._addWoodGrain(ctx, cx, baseY - 35, 22, 30, c);
        ctx.fillStyle = c.light;
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.moveTo(cx - 8, baseY - 30);
        ctx.quadraticCurveTo(cx - 10, baseY - 45, cx - 4, baseY - 50);
        ctx.lineTo(cx - 2, baseY - 45);
        ctx.quadraticCurveTo(cx - 6, baseY - 38, cx - 5, baseY - 28);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = c.outline;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(cx - 10, baseY - 12);
        ctx.lineTo(cx - 12, baseY - 30);
        ctx.quadraticCurveTo(cx - 14, baseY - 48, cx - 6, baseY - 52);
        ctx.quadraticCurveTo(cx - 2, baseY - 56, cx + 4, baseY - 54);
        ctx.quadraticCurveTo(cx + 10, baseY - 52, cx + 12, baseY - 44);
        ctx.quadraticCurveTo(cx + 16, baseY - 38, cx + 14, baseY - 32);
        ctx.lineTo(cx + 8, baseY - 28);
        ctx.quadraticCurveTo(cx + 14, baseY - 24, cx + 12, baseY - 18);
        ctx.lineTo(cx + 10, baseY - 12);
        ctx.stroke();
    }

    _drawBishop(ctx, cx, baseY, c) {
        this._drawBase(ctx, cx, baseY, c);
        ctx.fillStyle = c.base;
        ctx.beginPath();
        ctx.moveTo(cx - 12, baseY - 12);
        ctx.quadraticCurveTo(cx - 14, baseY - 32, cx - 8, baseY - 44);
        ctx.quadraticCurveTo(cx, baseY - 56, cx + 8, baseY - 44);
        ctx.quadraticCurveTo(cx + 14, baseY - 32, cx + 12, baseY - 12);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx, baseY - 54, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = c.dark;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - 2, baseY - 48);
        ctx.lineTo(cx + 5, baseY - 30);
        ctx.stroke();
        this._addWoodGrain(ctx, cx, baseY - 30, 22, 35, c);
        ctx.fillStyle = c.light;
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.moveTo(cx - 8, baseY - 18);
        ctx.quadraticCurveTo(cx - 10, baseY - 35, cx - 5, baseY - 46);
        ctx.lineTo(cx - 1, baseY - 42);
        ctx.quadraticCurveTo(cx - 5, baseY - 30, cx - 4, baseY - 18);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = c.outline;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(cx - 12, baseY - 12);
        ctx.quadraticCurveTo(cx - 14, baseY - 32, cx - 8, baseY - 44);
        ctx.quadraticCurveTo(cx, baseY - 56, cx + 8, baseY - 44);
        ctx.quadraticCurveTo(cx + 14, baseY - 32, cx + 12, baseY - 12);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, baseY - 54, 4, 0, Math.PI * 2);
        ctx.stroke();
    }

    _drawQueen(ctx, cx, baseY, c) {
        this._drawBase(ctx, cx, baseY, c);
        ctx.fillStyle = c.base;
        ctx.beginPath();
        ctx.moveTo(cx - 14, baseY - 12);
        ctx.quadraticCurveTo(cx - 16, baseY - 30, cx - 10, baseY - 42);
        ctx.lineTo(cx - 8, baseY - 42);
        ctx.quadraticCurveTo(cx, baseY - 52, cx + 8, baseY - 42);
        ctx.lineTo(cx + 10, baseY - 42);
        ctx.quadraticCurveTo(cx + 16, baseY - 30, cx + 14, baseY - 12);
        ctx.closePath();
        ctx.fill();
        const crownY = baseY - 42;
        ctx.fillStyle = c.base;
        const zacken = [
            { x: cx - 12, tipY: crownY - 16 },
            { x: cx - 6, tipY: crownY - 12 },
            { x: cx, tipY: crownY - 18 },
            { x: cx + 6, tipY: crownY - 12 },
            { x: cx + 12, tipY: crownY - 16 },
        ];
        ctx.beginPath();
        ctx.moveTo(cx - 14, crownY);
        for (const z of zacken) {
            ctx.lineTo(z.x, z.tipY);
            ctx.lineTo(z.x + 3, crownY - 4);
        }
        ctx.lineTo(cx + 14, crownY);
        ctx.closePath();
        ctx.fill();
        for (const z of zacken) {
            ctx.beginPath();
            ctx.arc(z.x, z.tipY - 2, 3, 0, Math.PI * 2);
            ctx.fill();
        }
        this._addWoodGrain(ctx, cx, baseY - 30, 26, 35, c);
        ctx.fillStyle = c.light;
        ctx.globalAlpha = 0.25;
        ctx.fillRect(cx - 10, baseY - 44, 5, 34);
        ctx.globalAlpha = 1;
        ctx.strokeStyle = c.outline;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(cx - 14, baseY - 12);
        ctx.quadraticCurveTo(cx - 16, baseY - 30, cx - 10, baseY - 42);
        ctx.lineTo(cx + 10, baseY - 42);
        ctx.quadraticCurveTo(cx + 16, baseY - 30, cx + 14, baseY - 12);
        ctx.stroke();
    }

    _drawKing(ctx, cx, baseY, c) {
        this._drawBase(ctx, cx, baseY, c);
        ctx.fillStyle = c.base;
        ctx.beginPath();
        ctx.moveTo(cx - 14, baseY - 12);
        ctx.quadraticCurveTo(cx - 16, baseY - 30, cx - 10, baseY - 42);
        ctx.lineTo(cx + 10, baseY - 42);
        ctx.quadraticCurveTo(cx + 16, baseY - 30, cx + 14, baseY - 12);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx - 10, baseY - 42);
        ctx.quadraticCurveTo(cx - 12, baseY - 52, cx, baseY - 50);
        ctx.quadraticCurveTo(cx + 12, baseY - 52, cx + 10, baseY - 42);
        ctx.closePath();
        ctx.fill();
        const crossCx = cx;
        const crossCy = baseY - 58;
        ctx.fillStyle = c.base;
        ctx.fillRect(crossCx - 2, crossCy - 8, 5, 16);
        ctx.fillRect(crossCx - 6, crossCy - 4, 13, 5);
        this._addWoodGrain(ctx, cx, baseY - 30, 26, 35, c);
        ctx.fillStyle = c.light;
        ctx.globalAlpha = 0.25;
        ctx.fillRect(cx - 10, baseY - 44, 5, 34);
        ctx.globalAlpha = 1;
        ctx.strokeStyle = c.outline;
        ctx.lineWidth = 1.2;
        ctx.strokeRect(crossCx - 2, crossCy - 8, 5, 16);
        ctx.strokeRect(crossCx - 6, crossCy - 4, 13, 5);
        ctx.beginPath();
        ctx.moveTo(cx - 14, baseY - 12);
        ctx.quadraticCurveTo(cx - 16, baseY - 30, cx - 10, baseY - 42);
        ctx.quadraticCurveTo(cx - 12, baseY - 52, cx, baseY - 50);
        ctx.quadraticCurveTo(cx + 12, baseY - 52, cx + 10, baseY - 42);
        ctx.quadraticCurveTo(cx + 16, baseY - 30, cx + 14, baseY - 12);
        ctx.stroke();
    }
}
