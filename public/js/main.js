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
let trainingStarted = false;

function switchMode(mode) {
    if (currentMode === mode) return;
    currentMode = mode;

    document.getElementById('btn-mode-play').classList.toggle('active', mode === 'play');
    document.getElementById('btn-mode-train').classList.toggle('active', mode === 'train');
    document.getElementById('controls').style.display = mode === 'play' ? 'flex' : 'none';
    document.getElementById('training-controls').style.display = mode === 'train' ? 'flex' : 'none';

    if (mode === 'play') {
        if (trainingStarted) {
            game.scene.stop('TrainingScene');
        }
        // Kurze Verzögerung damit Phaser die alte Szene verarbeiten kann
        setTimeout(() => { game.scene.start('GameScene'); }, 50);
    } else {
        const catSelect = document.getElementById('puzzle-category');
        const catValue = catSelect ? catSelect.value : PUZZLE_CATEGORIES[0].id;
        game.scene.stop('GameScene');
        trainingStarted = true;
        setTimeout(() => {
            game.scene.start('TrainingScene', {
                category: catValue,
                puzzleIndex: 0,
            });
        }, 50);
    }
}

// ---- Kategorien-Dropdown füllen & Event-Listener ----
document.addEventListener('DOMContentLoaded', () => {
    // Mode-Switch Buttons
    document.getElementById('btn-mode-play').addEventListener('click', () => switchMode('play'));
    document.getElementById('btn-mode-train').addEventListener('click', () => switchMode('train'));

    const catSelect = document.getElementById('puzzle-category');
    if (catSelect && typeof PUZZLE_CATEGORIES !== 'undefined') {
        // Übungen (Lern-Übungen)
        const uebungenGroup = document.createElement('optgroup');
        uebungenGroup.label = '\uD83D\uDCD6 Übungen';
        const puzzleGroup = document.createElement('optgroup');
        puzzleGroup.label = '\uD83E\uDDE9 Puzzles';

        PUZZLE_CATEGORIES.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat.id;
            opt.textContent = cat.icon + ' ' + cat.name;
            if (cat.type === 'uebung') {
                uebungenGroup.appendChild(opt);
            } else {
                puzzleGroup.appendChild(opt);
            }
        });

        catSelect.appendChild(uebungenGroup);
        catSelect.appendChild(puzzleGroup);

        catSelect.addEventListener('change', () => {
            if (currentMode === 'train') {
                game.scene.stop('TrainingScene');
                setTimeout(() => {
                    game.scene.start('TrainingScene', {
                        category: catSelect.value,
                        puzzleIndex: 0,
                    });
                }, 50);
            }
        });
    }

    // Puzzle-Navigation
    document.getElementById('btn-prev-puzzle').addEventListener('click', () => {
        if (currentMode !== 'train') return;
        const ts = game.scene.getScene('TrainingScene');
        if (ts && ts.scene.isActive()) {
            ts.currentPuzzleIndex--;
            ts._loadPuzzle();
        }
    });

    document.getElementById('btn-next-puzzle').addEventListener('click', () => {
        if (currentMode !== 'train') return;
        const ts = game.scene.getScene('TrainingScene');
        if (ts && ts.scene.isActive()) {
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
        if (ts && ts.scene.isActive()) {
            ts._loadPuzzle();
        }
    });
});
