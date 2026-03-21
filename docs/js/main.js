// ============================================
// Phaser Spielkonfiguration
// ============================================

const config = {
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent: 'phaser-game',
    backgroundColor: '#16213e',
    scene: [BootScene, GameScene, ExerciseScene, TrainingScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
};

const game = new Phaser.Game(config);

// ---- Modus-Umschaltung ----
let currentMode = 'play';
let activeScene = 'GameScene';

function stopActiveScene() {
    if (game.scene.isActive(activeScene)) {
        game.scene.stop(activeScene);
    }
}

function switchMode(mode) {
    if (currentMode === mode) return;
    currentMode = mode;

    document.getElementById('btn-mode-play').classList.toggle('active', mode === 'play');
    document.getElementById('btn-mode-train').classList.toggle('active', mode === 'train');
    document.getElementById('controls').style.display = mode === 'play' ? 'flex' : 'none';
    document.getElementById('training-controls').style.display = mode === 'train' ? 'flex' : 'none';

    if (mode === 'play') {
        stopActiveScene();
        setTimeout(() => {
            activeScene = 'GameScene';
            game.scene.start('GameScene');
        }, 50);
    } else {
        stopActiveScene();
        setTimeout(() => startTrainingFromDropdown(), 50);
    }
}

function startTrainingFromDropdown() {
    const catSelect = document.getElementById('puzzle-category');
    const catValue = catSelect ? catSelect.value : '';

    // Übung oder Puzzle?
    const exerciseCat = EXERCISE_CATEGORIES.find(c => c.id === catValue);
    const puzzleCat = PUZZLE_CATEGORIES.find(c => c.id === catValue);

    if (exerciseCat) {
        activeScene = 'ExerciseScene';
        game.scene.start('ExerciseScene', { category: catValue });
    } else if (puzzleCat) {
        activeScene = 'TrainingScene';
        game.scene.start('TrainingScene', { category: catValue, angle: puzzleCat.angle });
    } else {
        // Fallback
        activeScene = 'ExerciseScene';
        game.scene.start('ExerciseScene', { category: EXERCISE_CATEGORIES[0].id });
    }
}

// ---- Kategorien-Dropdown & Event-Listener ----
document.addEventListener('DOMContentLoaded', () => {
    // Mode-Switch Buttons
    document.getElementById('btn-mode-play').addEventListener('click', () => switchMode('play'));
    document.getElementById('btn-mode-train').addEventListener('click', () => switchMode('train'));

    const catSelect = document.getElementById('puzzle-category');
    if (catSelect) {
        // Übungen
        const uebungenGroup = document.createElement('optgroup');
        uebungenGroup.label = '\uD83D\uDCD6 Übungen';
        EXERCISE_CATEGORIES.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat.id;
            opt.textContent = cat.icon + ' ' + cat.name;
            uebungenGroup.appendChild(opt);
        });
        catSelect.appendChild(uebungenGroup);

        // Puzzles
        const puzzleGroup = document.createElement('optgroup');
        puzzleGroup.label = '\uD83E\uDDE9 Puzzles';
        PUZZLE_CATEGORIES.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat.id;
            opt.textContent = cat.icon + ' ' + cat.name;
            puzzleGroup.appendChild(opt);
        });
        catSelect.appendChild(puzzleGroup);

        catSelect.addEventListener('change', () => {
            if (currentMode === 'train') {
                stopActiveScene();
                setTimeout(() => startTrainingFromDropdown(), 50);
            }
        });
    }

    // Navigation (nur für Übungen - Puzzles laden automatisch)
    document.getElementById('btn-next-puzzle').addEventListener('click', () => {
        if (currentMode !== 'train') return;
        if (activeScene === 'TrainingScene') {
            const ts = game.scene.getScene('TrainingScene');
            if (ts && ts.scene.isActive()) {
                ts._fetchPuzzle();
            }
        } else if (activeScene === 'ExerciseScene') {
            const es = game.scene.getScene('ExerciseScene');
            if (es && es.scene.isActive()) {
                es._loadExercise();
            }
        }
    });

    document.getElementById('btn-prev-puzzle').addEventListener('click', () => {
        // Für Puzzles: neues Puzzle laden (kein "zurück" bei API)
        if (currentMode !== 'train') return;
        if (activeScene === 'TrainingScene') {
            const ts = game.scene.getScene('TrainingScene');
            if (ts && ts.scene.isActive()) {
                ts._fetchPuzzle();
            }
        } else if (activeScene === 'ExerciseScene') {
            const es = game.scene.getScene('ExerciseScene');
            if (es && es.scene.isActive()) {
                es._loadExercise();
            }
        }
    });

    document.getElementById('btn-hint').addEventListener('click', () => {
        if (currentMode !== 'train') return;
        if (activeScene === 'TrainingScene') {
            const ts = game.scene.getScene('TrainingScene');
            if (ts && ts.scene.isActive() && ts.solutionMoves && ts.solutionIndex < ts.solutionMoves.length) {
                // Zeige den nächsten erwarteten Zug als Hinweis
                const uci = ts.solutionMoves[ts.solutionIndex];
                const from = uci.substring(0, 2);
                const to = uci.substring(2, 4);
                const hintEl = document.getElementById('puzzle-hint');
                if (hintEl) hintEl.textContent = `Hinweis: ${from} → ${to}`;
            }
        }
    });

    document.getElementById('btn-reset-puzzle').addEventListener('click', () => {
        if (currentMode !== 'train') return;
        if (activeScene === 'ExerciseScene') {
            const es = game.scene.getScene('ExerciseScene');
            if (es && es.scene.isActive()) es._loadExercise();
        } else if (activeScene === 'TrainingScene') {
            const ts = game.scene.getScene('TrainingScene');
            if (ts && ts.scene.isActive()) ts._fetchPuzzle();
        }
    });

    // Figurenstil wechseln
    const pieceStyleSelect = document.getElementById('piece-style');
    if (pieceStyleSelect) {
        // Gespeicherten Stil laden
        const saved = localStorage.getItem('chess_piece_style');
        if (saved) {
            pieceStyleSelect.value = saved;
            currentPieceStyle = saved;
        }

        pieceStyleSelect.addEventListener('change', () => {
            const newStyle = pieceStyleSelect.value;
            localStorage.setItem('chess_piece_style', newStyle);
            BootScene.changePieceStyle(game, newStyle);
        });
    }
});
