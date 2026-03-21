// ============================================
// Phaser Spielkonfiguration
// ============================================

const config = {
    type: Phaser.AUTO,
    width: BOARD_SIZE * TILE_SIZE + BOARD_OFFSET_X * 2,
    height: BOARD_SIZE * TILE_SIZE + BOARD_OFFSET_Y * 2 + 20,
    parent: 'phaser-game',
    backgroundColor: '#16213e',
    scene: [BootScene, GameScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
};

const game = new Phaser.Game(config);
