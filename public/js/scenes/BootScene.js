// ============================================
// Boot Scene - Erzeugt Figur-Texturen aus Unicode
// ============================================

class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Nichts zu laden - wir erzeugen Texturen dynamisch
    }

    create() {
        this.createPieceTextures();
        this.scene.start('GameScene');
    }

    createPieceTextures() {
        const size = TILE_SIZE;

        for (const color of [COLOR.WHITE, COLOR.BLACK]) {
            for (const type of Object.values(PIECE)) {
                const key = `${color}_${type}`;
                const unicode = PIECE_UNICODE[color][type];

                // Canvas erstellen und Figur darauf zeichnen
                const canvas = document.createElement('canvas');
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext('2d');

                ctx.font = `${size * 0.75}px serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                // Schatten für bessere Lesbarkeit
                ctx.shadowColor = color === COLOR.WHITE ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.3)';
                ctx.shadowBlur = 3;
                ctx.shadowOffsetX = 1;
                ctx.shadowOffsetY = 1;

                ctx.fillStyle = color === COLOR.WHITE ? '#ffffff' : '#1a1a1a';
                ctx.fillText(unicode, size / 2, size / 2);

                this.textures.addCanvas(key, canvas);
            }
        }
    }
}
