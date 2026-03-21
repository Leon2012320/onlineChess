// ============================================
// Boot Scene - Erzeugt Holz-Figur-Texturen
// ============================================

class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {}

    create() {
        this.createPieceTextures();
        this.scene.start('GameScene');
    }

    // Holzfarben
    getWoodColors(isWhite) {
        if (isWhite) {
            return {
                base: '#deb887',      // burlywood
                light: '#f5deb3',     // wheat
                dark: '#c4a265',
                shadow: '#a0824a',
                grain1: '#d4a96a',
                grain2: '#c89b5e',
                outline: '#8b6914',
            };
        } else {
            return {
                base: '#5c3317',      // dunkles Holz
                light: '#7a4b2a',
                dark: '#3e1f0d',
                shadow: '#2a1508',
                grain1: '#4d2a13',
                grain2: '#6b3a1f',
                outline: '#1a0e06',
            };
        }
    }

    addWoodGrain(ctx, cx, cy, w, h, colors) {
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

    drawBase(ctx, cx, baseY, colors) {
        // Standfläche
        ctx.fillStyle = colors.dark;
        ctx.beginPath();
        ctx.ellipse(cx, baseY, 22, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = colors.base;
        ctx.beginPath();
        ctx.ellipse(cx, baseY - 2, 22, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        // Basis-Körper
        ctx.fillStyle = colors.base;
        ctx.beginPath();
        ctx.moveTo(cx - 18, baseY - 2);
        ctx.lineTo(cx - 14, baseY - 12);
        ctx.lineTo(cx + 14, baseY - 12);
        ctx.lineTo(cx + 18, baseY - 2);
        ctx.closePath();
        ctx.fill();
        // Highlight
        ctx.fillStyle = colors.light;
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

    drawOutline(ctx, path, color) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.stroke(path);
    }

    createPieceTextures() {
        const S = TILE_SIZE;
        const cx = S / 2;

        for (const color of [COLOR.WHITE, COLOR.BLACK]) {
            const isW = color === COLOR.WHITE;
            const c = this.getWoodColors(isW);

            for (const type of Object.values(PIECE)) {
                const key = `${color}_${type}`;
                const canvas = document.createElement('canvas');
                canvas.width = S;
                canvas.height = S;
                const ctx = canvas.getContext('2d');

                // Schatten unter der Figur
                ctx.shadowColor = 'rgba(0,0,0,0.35)';
                ctx.shadowBlur = 4;
                ctx.shadowOffsetX = 2;
                ctx.shadowOffsetY = 2;

                const baseY = S - 10;

                switch (type) {
                    case PIECE.PAWN:
                        this._drawPawn(ctx, cx, baseY, c);
                        break;
                    case PIECE.ROOK:
                        this._drawRook(ctx, cx, baseY, c);
                        break;
                    case PIECE.KNIGHT:
                        this._drawKnight(ctx, cx, baseY, c);
                        break;
                    case PIECE.BISHOP:
                        this._drawBishop(ctx, cx, baseY, c);
                        break;
                    case PIECE.QUEEN:
                        this._drawQueen(ctx, cx, baseY, c);
                        break;
                    case PIECE.KING:
                        this._drawKing(ctx, cx, baseY, c);
                        break;
                }

                this.textures.addCanvas(key, canvas);
            }
        }
    }

    _drawPawn(ctx, cx, baseY, c) {
        this.drawBase(ctx, cx, baseY, c);
        // Körper
        ctx.fillStyle = c.base;
        ctx.beginPath();
        ctx.moveTo(cx - 12, baseY - 12);
        ctx.quadraticCurveTo(cx - 10, baseY - 30, cx - 6, baseY - 34);
        ctx.quadraticCurveTo(cx, baseY - 36, cx + 6, baseY - 34);
        ctx.quadraticCurveTo(cx + 10, baseY - 30, cx + 12, baseY - 12);
        ctx.closePath();
        ctx.fill();
        // Kopf (Kugel)
        ctx.beginPath();
        ctx.arc(cx, baseY - 42, 10, 0, Math.PI * 2);
        ctx.fill();
        // Holzmaserung
        this.addWoodGrain(ctx, cx, baseY - 30, 20, 30, c);
        // Highlight
        ctx.fillStyle = c.light;
        ctx.globalAlpha = 0.35;
        ctx.beginPath();
        ctx.arc(cx - 3, baseY - 44, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        // Outline
        ctx.strokeStyle = c.outline;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(cx, baseY - 42, 10, 0, Math.PI * 2);
        ctx.stroke();
    }

    _drawRook(ctx, cx, baseY, c) {
        this.drawBase(ctx, cx, baseY, c);
        // Turmkörper
        ctx.fillStyle = c.base;
        ctx.beginPath();
        ctx.moveTo(cx - 14, baseY - 12);
        ctx.lineTo(cx - 12, baseY - 45);
        ctx.lineTo(cx + 12, baseY - 45);
        ctx.lineTo(cx + 14, baseY - 12);
        ctx.closePath();
        ctx.fill();
        // Zinnen
        const zinnenY = baseY - 45;
        ctx.fillStyle = c.base;
        ctx.fillRect(cx - 14, zinnenY - 10, 7, 10);
        ctx.fillRect(cx - 3, zinnenY - 10, 7, 10);
        ctx.fillRect(cx + 8, zinnenY - 10, 7, 10);
        // Dunkle Slots zwischen Zinnen
        ctx.fillStyle = c.dark;
        ctx.fillRect(cx - 7, zinnenY - 7, 4, 7);
        ctx.fillRect(cx + 4, zinnenY - 7, 4, 7);
        // Maserung
        this.addWoodGrain(ctx, cx, baseY - 30, 24, 35, c);
        // Highlight
        ctx.fillStyle = c.light;
        ctx.globalAlpha = 0.25;
        ctx.fillRect(cx - 10, baseY - 44, 5, 34);
        ctx.globalAlpha = 1;
        // Outline
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
        this.drawBase(ctx, cx, baseY, c);
        // Pferdekopf
        ctx.fillStyle = c.base;
        ctx.beginPath();
        ctx.moveTo(cx - 10, baseY - 12);
        ctx.lineTo(cx - 12, baseY - 30);
        ctx.quadraticCurveTo(cx - 14, baseY - 48, cx - 6, baseY - 52);
        ctx.quadraticCurveTo(cx - 2, baseY - 56, cx + 4, baseY - 54);
        // Mähne/Oberkopf
        ctx.quadraticCurveTo(cx + 10, baseY - 52, cx + 12, baseY - 44);
        // Nase
        ctx.quadraticCurveTo(cx + 16, baseY - 38, cx + 14, baseY - 32);
        ctx.lineTo(cx + 8, baseY - 28);
        // Maul
        ctx.quadraticCurveTo(cx + 14, baseY - 24, cx + 12, baseY - 18);
        ctx.lineTo(cx + 10, baseY - 12);
        ctx.closePath();
        ctx.fill();
        // Auge
        ctx.fillStyle = c.outline;
        ctx.beginPath();
        ctx.arc(cx + 2, baseY - 42, 2.5, 0, Math.PI * 2);
        ctx.fill();
        // Maserung
        this.addWoodGrain(ctx, cx, baseY - 35, 22, 30, c);
        // Highlight
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
        // Outline
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
        this.drawBase(ctx, cx, baseY, c);
        // Körper
        ctx.fillStyle = c.base;
        ctx.beginPath();
        ctx.moveTo(cx - 12, baseY - 12);
        ctx.quadraticCurveTo(cx - 14, baseY - 32, cx - 8, baseY - 44);
        ctx.quadraticCurveTo(cx, baseY - 56, cx + 8, baseY - 44);
        ctx.quadraticCurveTo(cx + 14, baseY - 32, cx + 12, baseY - 12);
        ctx.closePath();
        ctx.fill();
        // Spitze
        ctx.beginPath();
        ctx.arc(cx, baseY - 54, 4, 0, Math.PI * 2);
        ctx.fill();
        // Schlitz
        ctx.strokeStyle = c.dark;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - 2, baseY - 48);
        ctx.lineTo(cx + 5, baseY - 30);
        ctx.stroke();
        // Maserung
        this.addWoodGrain(ctx, cx, baseY - 30, 22, 35, c);
        // Highlight
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
        // Outline
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
        this.drawBase(ctx, cx, baseY, c);
        // Körper
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
        // Krone - 5 Zacken
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
        // Kugeln auf Zacken
        for (const z of zacken) {
            ctx.beginPath();
            ctx.arc(z.x, z.tipY - 2, 3, 0, Math.PI * 2);
            ctx.fill();
        }
        // Maserung
        this.addWoodGrain(ctx, cx, baseY - 30, 26, 35, c);
        // Highlight
        ctx.fillStyle = c.light;
        ctx.globalAlpha = 0.25;
        ctx.fillRect(cx - 10, baseY - 44, 5, 34);
        ctx.globalAlpha = 1;
        // Outline
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
        this.drawBase(ctx, cx, baseY, c);
        // Körper
        ctx.fillStyle = c.base;
        ctx.beginPath();
        ctx.moveTo(cx - 14, baseY - 12);
        ctx.quadraticCurveTo(cx - 16, baseY - 30, cx - 10, baseY - 42);
        ctx.lineTo(cx + 10, baseY - 42);
        ctx.quadraticCurveTo(cx + 16, baseY - 30, cx + 14, baseY - 12);
        ctx.closePath();
        ctx.fill();
        // Bogen oben
        ctx.beginPath();
        ctx.moveTo(cx - 10, baseY - 42);
        ctx.quadraticCurveTo(cx - 12, baseY - 52, cx, baseY - 50);
        ctx.quadraticCurveTo(cx + 12, baseY - 52, cx + 10, baseY - 42);
        ctx.closePath();
        ctx.fill();
        // Kreuz
        const crossCx = cx;
        const crossCy = baseY - 58;
        ctx.fillStyle = c.base;
        ctx.fillRect(crossCx - 2, crossCy - 8, 5, 16);
        ctx.fillRect(crossCx - 6, crossCy - 4, 13, 5);
        // Maserung
        this.addWoodGrain(ctx, cx, baseY - 30, 26, 35, c);
        // Highlight
        ctx.fillStyle = c.light;
        ctx.globalAlpha = 0.25;
        ctx.fillRect(cx - 10, baseY - 44, 5, 34);
        ctx.globalAlpha = 1;
        // Outline Kreuz
        ctx.strokeStyle = c.outline;
        ctx.lineWidth = 1.2;
        ctx.strokeRect(crossCx - 2, crossCy - 8, 5, 16);
        ctx.strokeRect(crossCx - 6, crossCy - 4, 13, 5);
        // Outline Körper
        ctx.beginPath();
        ctx.moveTo(cx - 14, baseY - 12);
        ctx.quadraticCurveTo(cx - 16, baseY - 30, cx - 10, baseY - 42);
        ctx.quadraticCurveTo(cx - 12, baseY - 52, cx, baseY - 50);
        ctx.quadraticCurveTo(cx + 12, baseY - 52, cx + 10, baseY - 42);
        ctx.quadraticCurveTo(cx + 16, baseY - 30, cx + 14, baseY - 12);
        ctx.stroke();
    }
}
