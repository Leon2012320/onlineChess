// ============================================
// Gemeinsame Brett-Utilities für alle Szenen
// ============================================

const BoardUtils = {

    // Holztexturen einmalig erzeugen (gecacht)
    ensureWoodTextures(scene) {
        if (scene.textures.exists('_woodLight') && scene.textures.exists('_woodDark')) return;

        const canvasL = document.createElement('canvas');
        canvasL.width = TILE_SIZE; canvasL.height = TILE_SIZE;
        BoardUtils._drawWoodTile(canvasL.getContext('2d'), TILE_SIZE, '#e8d5a8', '#d4c091', '#c9b57a');
        scene.textures.addCanvas('_woodLight', canvasL);

        const canvasD = document.createElement('canvas');
        canvasD.width = TILE_SIZE; canvasD.height = TILE_SIZE;
        BoardUtils._drawWoodTile(canvasD.getContext('2d'), TILE_SIZE, '#a0734a', '#8b613c', '#7a5230');
        scene.textures.addCanvas('_woodDark', canvasD);
    },

    _drawWoodTile(ctx, size, baseColor, grainColor1, grainColor2) {
        ctx.fillStyle = baseColor;
        ctx.fillRect(0, 0, size, size);
        ctx.globalAlpha = 0.18;
        for (let i = 0; i < 12; i++) {
            ctx.strokeStyle = i % 2 === 0 ? grainColor1 : grainColor2;
            ctx.lineWidth = 1 + Math.random() * 1.5;
            ctx.beginPath();
            const y = (size / 12) * i + Math.random() * 4;
            ctx.moveTo(0, y);
            ctx.quadraticCurveTo(size * 0.3, y + (Math.random() - 0.5) * 6, size * 0.5, y + (Math.random() - 0.5) * 4);
            ctx.quadraticCurveTo(size * 0.7, y + (Math.random() - 0.5) * 6, size, y + (Math.random() - 0.5) * 3);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
    },
};
