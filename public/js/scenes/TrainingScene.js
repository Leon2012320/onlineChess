// ============================================
// Training Scene - Puzzle / Aufgaben Modus
// ============================================

class TrainingScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TrainingScene' });
    }

    init(data) {
        this.currentCategory = data.category || PUZZLE_CATEGORIES[0].id;
        this.currentPuzzleIndex = data.puzzleIndex || 0;
    }

    create() {
        this.chess = new ChessLogic();
        this.selectedTile = null;
        this.legalMoveIndicators = [];
        this.pieceSprites = [];
        this.tileGraphics = [];
        this.solvedSet = this._loadProgress();

        this._createWoodTileTextures();
        this.drawBoard();
        this._setupInput();
        this._loadPuzzle();
    }

    // ---- Holz-Texturen (gleich wie GameScene) ----
    _createWoodTileTextures() {
        if (this.textures.exists('_woodLight') && this.textures.exists('_woodDark')) return;
        const canvasL = document.createElement('canvas');
        canvasL.width = TILE_SIZE; canvasL.height = TILE_SIZE;
        const ctxL = canvasL.getContext('2d');
        this._drawWoodTile(ctxL, TILE_SIZE, '#e8d5a8', '#d4c091', '#c9b57a');
        this.textures.addCanvas('_woodLight', canvasL);

        const canvasD = document.createElement('canvas');
        canvasD.width = TILE_SIZE; canvasD.height = TILE_SIZE;
        const ctxD = canvasD.getContext('2d');
        this._drawWoodTile(ctxD, TILE_SIZE, '#a0734a', '#8b613c', '#7a5230');
        this.textures.addCanvas('_woodDark', canvasD);
    }

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
    }

    // ---- Brett ----
    drawBoard() {
        // Rahmen
        const cx = BOARD_OFFSET_X + (BOARD_SIZE * TILE_SIZE) / 2;
        const cy = BOARD_OFFSET_Y + (BOARD_SIZE * TILE_SIZE) / 2;
        this.add.rectangle(cx, cy, BOARD_SIZE * TILE_SIZE + 20, BOARD_SIZE * TILE_SIZE + 20, 0x5c3317).setOrigin(0.5);
        this.add.rectangle(cx, cy, BOARD_SIZE * TILE_SIZE + 12, BOARD_SIZE * TILE_SIZE + 12, 0x7a4b2a).setOrigin(0.5);
        this.add.rectangle(cx, cy, BOARD_SIZE * TILE_SIZE + 4, BOARD_SIZE * TILE_SIZE + 4, 0x3e1f0d).setOrigin(0.5);

        for (let row = 0; row < BOARD_SIZE; row++) {
            this.tileGraphics[row] = [];
            for (let col = 0; col < BOARD_SIZE; col++) {
                const isLight = (row + col) % 2 === 0;
                const x = BOARD_OFFSET_X + col * TILE_SIZE;
                const y = BOARD_OFFSET_Y + row * TILE_SIZE;
                const texKey = isLight ? '_woodLight' : '_woodDark';
                const tile = this.add.image(x + TILE_SIZE / 2, y + TILE_SIZE / 2, texKey);
                const overlay = this.add.rectangle(x + TILE_SIZE / 2, y + TILE_SIZE / 2, TILE_SIZE, TILE_SIZE, 0x000000, 0);
                tile._overlay = overlay;
                this.tileGraphics[row][col] = tile;
            }
        }

        // Koordinaten
        const files = ['a','b','c','d','e','f','g','h'];
        for (let i = 0; i < 8; i++) {
            this.add.text(BOARD_OFFSET_X + i * TILE_SIZE + TILE_SIZE / 2, BOARD_OFFSET_Y + BOARD_SIZE * TILE_SIZE + 8, files[i], { fontSize: '14px', color: '#c4a265', fontFamily: 'serif' }).setOrigin(0.5, 0);
            this.add.text(BOARD_OFFSET_X - 20, BOARD_OFFSET_Y + i * TILE_SIZE + TILE_SIZE / 2, String(8 - i), { fontSize: '14px', color: '#c4a265', fontFamily: 'serif' }).setOrigin(0.5);
        }
    }

    // ---- Figuren ----
    drawPieces() {
        this.pieceSprites.forEach(s => s.destroy());
        this.pieceSprites = [];
        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
                const piece = this.chess.getPiece(row, col);
                if (piece) {
                    const x = BOARD_OFFSET_X + col * TILE_SIZE + TILE_SIZE / 2;
                    const y = BOARD_OFFSET_Y + row * TILE_SIZE + TILE_SIZE / 2;
                    const key = `${piece.color}_${piece.type}`;
                    const sprite = this.add.image(x, y, key);
                    this.pieceSprites.push(sprite);
                }
            }
        }
    }

    // ---- Puzzle laden ----
    _loadPuzzle() {
        const puzzles = PUZZLES.filter(p => p.category === this.currentCategory);
        if (puzzles.length === 0) return;
        if (this.currentPuzzleIndex >= puzzles.length) this.currentPuzzleIndex = 0;
        if (this.currentPuzzleIndex < 0) this.currentPuzzleIndex = puzzles.length - 1;

        this.puzzle = puzzles[this.currentPuzzleIndex];
        this.puzzleSolved = false;
        this.moveIndex = 0;

        // Board aus Puzzle setzen
        this.chess.reset();
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const code = this.puzzle.board[r][c];
                this.chess.board[r][c] = code ? pieceFromCode(code) : null;
            }
        }
        this.chess.currentTurn = this.puzzle.playerColor || COLOR.WHITE;
        this.chess.gameOver = false;

        this.selectedTile = null;
        this.clearHighlights();
        this.clearMoveIndicators();
        this.drawPieces();
        this._updateTrainingUI();
    }

    // ---- UI ----
    _updateTrainingUI() {
        const puzzles = PUZZLES.filter(p => p.category === this.currentCategory);
        const total = puzzles.length;
        const num = this.currentPuzzleIndex + 1;
        const cat = PUZZLE_CATEGORIES.find(c => c.id === this.currentCategory);
        const catName = cat ? cat.name : this.currentCategory;

        const puzzleId = this.currentCategory + '_' + this.currentPuzzleIndex;
        const isSolved = this.solvedSet.has(puzzleId);

        document.getElementById('status').textContent =
            `${catName} — Aufgabe ${num}/${total}${isSolved ? ' ✓' : ''}`;

        const titleEl = document.getElementById('puzzle-title');
        const hintEl = document.getElementById('puzzle-hint');
        if (titleEl) titleEl.textContent = this.puzzle.title || '';
        if (hintEl) {
            hintEl.textContent = '';
            hintEl.dataset.hint = this.puzzle.hint || '';
        }

        // Fortschritt
        const progressEl = document.getElementById('puzzle-progress');
        if (progressEl) {
            const solved = puzzles.filter((_, i) => this.solvedSet.has(this.currentCategory + '_' + i)).length;
            progressEl.textContent = `Gelöst: ${solved}/${total}`;
        }
    }

    // ---- Eingabe ----
    _setupInput() {
        this.input.on('pointerdown', (pointer) => {
            const col = Math.floor((pointer.x - BOARD_OFFSET_X) / TILE_SIZE);
            const row = Math.floor((pointer.y - BOARD_OFFSET_Y) / TILE_SIZE);
            if (row < 0 || row > 7 || col < 0 || col > 7) return;
            this._handleClick(row, col);
        });
    }

    _handleClick(row, col) {
        if (this.puzzleSolved) return;

        const playerColor = this.puzzle.playerColor || COLOR.WHITE;
        if (this.chess.currentTurn !== playerColor) return;

        if (this.selectedTile) {
            const from = this.selectedTile;
            // Prüfe ob der Zug eine der Lösungen ist
            const isCorrect = this._checkSolution(from.row, from.col, row, col);

            if (isCorrect) {
                const moveResult = this.chess.makeMove(from.row, from.col, row, col);
                if (moveResult) {
                    this.clearHighlights();
                    this.clearMoveIndicators();
                    this._setTileOverlay(from.row, from.col, 0x66cc66, 0.4);
                    this._setTileOverlay(row, col, 0x66cc66, 0.4);
                    this.drawPieces();
                    this._onPuzzleSolved();
                }
            } else {
                // Falscher Zug
                this._setTileOverlay(row, col, COLORS.CHECK, 0.5);
                this.time.delayedCall(500, () => {
                    this.clearHighlights();
                });
                this.selectedTile = null;
                this.clearMoveIndicators();
                document.getElementById('status').textContent = 'Falscher Zug! Versuche es erneut.';
            }
            this.selectedTile = null;
            this.clearMoveIndicators();
        } else {
            const piece = this.chess.getPiece(row, col);
            if (piece && piece.color === playerColor) {
                this._selectTile(row, col);
            }
        }
    }

    _checkSolution(fromRow, fromCol, toRow, toCol) {
        if (!this.puzzle.solution) return false;
        return this.puzzle.solution.some(sol =>
            sol.from.row === fromRow && sol.from.col === fromCol &&
            sol.to.row === toRow && sol.to.col === toCol
        );
    }

    _onPuzzleSolved() {
        this.puzzleSolved = true;
        const puzzleId = this.currentCategory + '_' + this.currentPuzzleIndex;
        this.solvedSet.add(puzzleId);
        this._saveProgress();

        document.getElementById('status').textContent = '✓ Richtig! Gut gemacht!';
        this._updateTrainingUI();

        // Automatisch nächstes Puzzle nach 1.5s
        this.time.delayedCall(1500, () => {
            this.currentPuzzleIndex++;
            this._loadPuzzle();
        });
    }

    // ---- Selektion ----
    _selectTile(row, col) {
        this.clearHighlights();
        this.clearMoveIndicators();
        this.selectedTile = { row, col };
        this._setTileOverlay(row, col, COLORS.SELECTED, 0.45);

        const moves = this.chess.getLegalMoves(row, col);
        for (const move of moves) {
            const x = BOARD_OFFSET_X + move.col * TILE_SIZE + TILE_SIZE / 2;
            const y = BOARD_OFFSET_Y + move.row * TILE_SIZE + TILE_SIZE / 2;
            const target = this.chess.getPiece(move.row, move.col);
            let indicator;
            if (target) {
                indicator = this.add.circle(x, y, TILE_SIZE / 2 - 4);
                indicator.setStrokeStyle(3, COLORS.HIGHLIGHT, 0.8);
            } else {
                indicator = this.add.circle(x, y, 12, COLORS.HIGHLIGHT, 0.5);
            }
            this.legalMoveIndicators.push(indicator);
        }
    }

    // ---- Highlights ----
    clearHighlights() {
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                this._setTileOverlay(r, c, 0x000000, 0);
            }
        }
    }

    _setTileOverlay(row, col, color, alpha) {
        const tile = this.tileGraphics[row] && this.tileGraphics[row][col];
        if (tile && tile._overlay) {
            tile._overlay.setFillStyle(color, alpha);
        }
    }

    clearMoveIndicators() {
        this.legalMoveIndicators.forEach(i => i.destroy());
        this.legalMoveIndicators = [];
    }

    // ---- Fortschritt speichern (localStorage) ----
    _loadProgress() {
        try {
            const data = localStorage.getItem('chess_training_progress');
            if (data) return new Set(JSON.parse(data));
        } catch (e) { /* ignore */ }
        return new Set();
    }

    _saveProgress() {
        try {
            localStorage.setItem('chess_training_progress', JSON.stringify([...this.solvedSet]));
        } catch (e) { /* ignore */ }
    }
}
