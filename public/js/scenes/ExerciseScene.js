// ============================================
// Exercise Scene - Übungen (freies Spiel vs Remis-KI)
// ============================================

class ExerciseScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ExerciseScene' });
    }

    init(data) {
        data = data || {};
        this.exerciseCategory = data.category || EXERCISE_CATEGORIES[0].id;
    }

    create() {
        this.chess = new ChessLogic();
        this.engine = new ChessEngine(this.chess);
        this.engine.setDifficulty(2);
        this.selectedTile = null;
        this.legalMoveIndicators = [];
        this.pieceSprites = [];
        this.tileGraphics = [];
        this.exerciseDone = false;
        this.moveCount = 0;

        BoardUtils.ensureWoodTextures(this);
        this.drawBoard();
        this._setupInput();
        this._loadExercise();
    }

    // ---- Brett ----
    drawBoard() {
        const cx = BOARD_OFFSET_X + (BOARD_SIZE * TILE_SIZE) / 2;
        const cy = BOARD_OFFSET_Y + (BOARD_SIZE * TILE_SIZE) / 2;
        this.add.rectangle(cx, cy, BOARD_SIZE * TILE_SIZE + 20, BOARD_SIZE * TILE_SIZE + 20, 0x5c3317).setOrigin(0.5);
        this.add.rectangle(cx, cy, BOARD_SIZE * TILE_SIZE + 12, BOARD_SIZE * TILE_SIZE + 12, 0x7a4b2a).setOrigin(0.5);
        this.add.rectangle(cx, cy, BOARD_SIZE * TILE_SIZE + 4, BOARD_SIZE * TILE_SIZE + 4, 0x3e1f0d).setOrigin(0.5);

        BoardUtils.ensureWoodTextures(this);

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

    // ---- Übung laden ----
    _loadExercise() {
        this.exercise = EXERCISES.find(e => e.category === this.exerciseCategory);
        if (!this.exercise) return;

        this.exerciseDone = false;
        this.moveCount = 0;
        this.chess.loadFen(this.exercise.fen);
        this.playerColor = this.exercise.playerColor === 'black' ? COLOR.BLACK : COLOR.WHITE;
        this.opponentColor = this.playerColor === COLOR.WHITE ? COLOR.BLACK : COLOR.WHITE;

        this.selectedTile = null;
        this.clearHighlights();
        this.clearMoveIndicators();
        this.drawPieces();
        this._updateUI();
    }

    _updateUI() {
        const cat = EXERCISE_CATEGORIES.find(c => c.id === this.exerciseCategory);
        const catName = cat ? cat.name : this.exerciseCategory;
        const desc = this.exercise ? this.exercise.description : '';

        const titleEl = document.getElementById('puzzle-title');
        const hintEl = document.getElementById('puzzle-hint');
        if (titleEl) titleEl.textContent = desc;
        if (hintEl) hintEl.textContent = '';

        if (this.exerciseDone) {
            document.getElementById('status').textContent = `✓ Matt! Geschafft in ${this.moveCount} Zügen!`;
        } else {
            document.getElementById('status').textContent = `${catName} — Du bist am Zug`;
        }

        const progressEl = document.getElementById('puzzle-progress');
        if (progressEl) progressEl.textContent = `Züge: ${this.moveCount}`;
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
        if (this.exerciseDone) return;
        if (this.chess.currentTurn !== this.playerColor) return;

        if (this.selectedTile) {
            const from = this.selectedTile;
            const moveResult = this.chess.makeMove(from.row, from.col, row, col);
            if (moveResult) {
                this.moveCount++;
                this.clearHighlights();
                this.clearMoveIndicators();
                this._setTileOverlay(from.row, from.col, COLORS.LAST_MOVE, 0.35);
                this._setTileOverlay(row, col, COLORS.LAST_MOVE, 0.35);
                this.drawPieces();
                this.selectedTile = null;

                if (moveResult.checkmate) {
                    this.exerciseDone = true;
                    this._updateUI();
                    return;
                }
                if (moveResult.stalemate) {
                    document.getElementById('status').textContent = 'Patt! Versuche es erneut.';
                    this.time.delayedCall(2000, () => this._loadExercise());
                    return;
                }

                // Gegner spielt mit Remis-KI
                this.time.delayedCall(400, () => this._opponentDrawMove());
            } else {
                // Ungültiger Zug, neue Figur auswählen?
                const piece = this.chess.getPiece(row, col);
                if (piece && piece.color === this.playerColor) {
                    this._selectTile(row, col);
                } else {
                    this.selectedTile = null;
                    this.clearHighlights();
                    this.clearMoveIndicators();
                }
            }
        } else {
            const piece = this.chess.getPiece(row, col);
            if (piece && piece.color === this.playerColor) {
                this._selectTile(row, col);
            }
        }
    }

    // ---- Gegner: Remis-KI ----
    _opponentDrawMove() {
        if (this.exerciseDone || this.chess.gameOver) return;

        const move = this.engine.findDrawMove(this.opponentColor);
        if (!move) return;

        const result = this.chess.makeMove(move.fromRow, move.fromCol, move.toRow, move.toCol);
        if (result) {
            this.clearHighlights();
            this._setTileOverlay(move.fromRow, move.fromCol, COLORS.LAST_MOVE, 0.35);
            this._setTileOverlay(move.toRow, move.toCol, COLORS.LAST_MOVE, 0.35);
            this.drawPieces();
            this._updateUI();
        }
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
}
