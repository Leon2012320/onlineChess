// ============================================
// Phaser Spielkonfiguration
// ============================================

const config = {
    type: Phaser.AUTO,
    width: BOARD_SIZE * TILE_SIZE + BOARD_OFFSET_X * 2,
    height: BOARD_SIZE * TILE_SIZE + BOARD_OFFSET_Y * 2 + 20,
    parent: 'phaser-game',
    backgroundColor: '#16213e',
    scene: [BootScene, GameScene, TrainingScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
};

const game = new Phaser.Game(config);

// ---- Modus-Umschaltung ----
let currentMode = 'play';

function switchMode(mode) {
    currentMode = mode;
    document.getElementById('btn-mode-play').classList.toggle('active', mode === 'play');
    document.getElementById('btn-mode-train').classList.toggle('active', mode === 'train');
    document.getElementById('controls').style.display = mode === 'play' ? 'flex' : 'none';
    document.getElementById('training-controls').style.display = mode === 'train' ? 'flex' : 'none';

    if (mode === 'play') {
        game.scene.stop('TrainingScene');
        game.scene.start('GameScene');
    } else {
        const catSelect = document.getElementById('puzzle-category');
        game.scene.stop('GameScene');
        game.scene.start('TrainingScene', {
            category: catSelect.value,
            puzzleIndex: 0,
        });
    }
}

// ---- Kategorien-Dropdown füllen ----
document.addEventListener('DOMContentLoaded', () => {
    const catSelect = document.getElementById('puzzle-category');
    if (catSelect && typeof PUZZLE_CATEGORIES !== 'undefined') {
        PUZZLE_CATEGORIES.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat.id;
            opt.textContent = cat.icon + ' ' + cat.name;
            catSelect.appendChild(opt);
        });

        catSelect.addEventListener('change', () => {
            if (currentMode === 'train') {
                game.scene.stop('TrainingScene');
                game.scene.start('TrainingScene', {
                    category: catSelect.value,
                    puzzleIndex: 0,
                });
            }
        });
    }

    // Puzzle-Navigation
    document.getElementById('btn-prev-puzzle').addEventListener('click', () => {
        if (currentMode !== 'train') return;
        const ts = game.scene.getScene('TrainingScene');
        if (ts) {
            ts.currentPuzzleIndex--;
            ts._loadPuzzle();
        }
    });

    document.getElementById('btn-next-puzzle').addEventListener('click', () => {
        if (currentMode !== 'train') return;
        const ts = game.scene.getScene('TrainingScene');
        if (ts) {
            ts.currentPuzzleIndex++;
            ts._loadPuzzle();
        }
    });

    document.getElementById('btn-hint').addEventListener('click', () => {
        const hintEl = document.getElementById('puzzle-hint');
        if (hintEl && hintEl.dataset.hint) {
            hintEl.textContent = hintEl.dataset.hint;
        }
    });

    document.getElementById('btn-reset-puzzle').addEventListener('click', () => {
        if (currentMode !== 'train') return;
        const ts = game.scene.getScene('TrainingScene');
        if (ts) {
            ts._loadPuzzle();
        }
    });
});
