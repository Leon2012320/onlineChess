// ============================================
// Game Scene - Spieler vs Engine
// ============================================

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    create() {
        this.chess = new ChessLogic();
        this.engine = new ChessEngine(this.chess);
        this.playerColor = COLOR.WHITE;
        this.engineColor = COLOR.BLACK;
        this.selectedTile = null;
        this.legalMoveIndicators = [];
        this.pieceSprites = [];
        this.tileGraphics = [];
        this.lastMove = null;
        this.engineThinking = false;

        this.drawBoard();
        this.drawPieces();
        this.setupInput();
        this.setupUI();
        this.updateStatus();
    }

    // ---- Brett zeichnen ----
    drawBoard() {
        this.add
            .rectangle(
                BOARD_OFFSET_X + (BOARD_SIZE * TILE_SIZE) / 2,
                BOARD_OFFSET_Y + (BOARD_SIZE * TILE_SIZE) / 2,
                BOARD_SIZE * TILE_SIZE + 8,
                BOARD_SIZE * TILE_SIZE + 8,
                0x333333
            )
            .setOrigin(0.5);

        for (let row = 0; row < BOARD_SIZE; row++) {
            this.tileGraphics[row] = [];
            for (let col = 0; col < BOARD_SIZE; col++) {
                const isLight = (row + col) % 2 === 0;
                const color = isLight ? COLORS.LIGHT_TILE : COLORS.DARK_TILE;
                const x = BOARD_OFFSET_X + col * TILE_SIZE;
                const y = BOARD_OFFSET_Y + row * TILE_SIZE;

                const tile = this.add.rectangle(
                    x + TILE_SIZE / 2,
                    y + TILE_SIZE / 2,
                    TILE_SIZE,
                    TILE_SIZE,
                    color
                );
                this.tileGraphics[row][col] = tile;
            }
        }

        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        for (let i = 0; i < 8; i++) {
            this.add.text(
                BOARD_OFFSET_X + i * TILE_SIZE + TILE_SIZE / 2,
                BOARD_OFFSET_Y + BOARD_SIZE * TILE_SIZE + 5,
                files[i],
                { fontSize: '14px', color: '#aaaaaa' }
            ).setOrigin(0.5, 0);

            this.add.text(
                BOARD_OFFSET_X - 20,
                BOARD_OFFSET_Y + i * TILE_SIZE + TILE_SIZE / 2,
                String(8 - i),
                { fontSize: '14px', color: '#aaaaaa' }
            ).setOrigin(0.5);
        }
    }

    // ---- Figuren zeichnen ----
    drawPieces() {
        this.pieceSprites.forEach((s) => s.destroy());
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

    // ---- UI Buttons ----
    setupUI() {
        document.getElementById('btn-new-game').addEventListener('click', () => {
            this.newGame();
        });

        document.getElementById('difficulty').addEventListener('change', (e) => {
            const level = parseInt(e.target.value, 10);
            this.engine.setDifficulty(level);
        });

        document.getElementById('play-as').addEventListener('change', (e) => {
            this.playerColor = e.target.value;
            this.engineColor = this.playerColor === COLOR.WHITE ? COLOR.BLACK : COLOR.WHITE;
            this.newGame();
        });
    }

    newGame() {
        this.chess.reset();
        this.selectedTile = null;
        this.lastMove = null;
        this.engineThinking = false;
        this.clearHighlights();
        this.clearMoveIndicators();
        this.drawPieces();
        this.updateStatus();

        if (this.playerColor === COLOR.BLACK) {
            this.engineMove();
        }
    }

    // ---- Eingabe ----
    setupInput() {
        this.input.on('pointerdown', (pointer) => {
            const col = Math.floor((pointer.x - BOARD_OFFSET_X) / TILE_SIZE);
            const row = Math.floor((pointer.y - BOARD_OFFSET_Y) / TILE_SIZE);

            if (row < 0 || row > 7 || col < 0 || col > 7) return;
            this.handleTileClick(row, col);
        });
    }

    handleTileClick(row, col) {
        if (this.chess.gameOver) return;
        if (this.engineThinking) return;
        if (this.chess.currentTurn !== this.playerColor) return;

        if (this.selectedTile) {
            const from = this.selectedTile;
            const moveResult = this.chess.makeMove(from.row, from.col, row, col);

            if (moveResult) {
                this.lastMove = moveResult;
                this.drawPieces();
                this.clearHighlights();
                this.highlightLastMove();
                this.updateStatus(moveResult);

                if (!this.chess.gameOver) {
                    this.engineMove();
                }
            } else {
                const piece = this.chess.getPiece(row, col);
                if (piece && piece.color === this.playerColor) {
                    this.selectTile(row, col);
                    return;
                }
            }
            this.selectedTile = null;
            this.clearMoveIndicators();
        } else {
            const piece = this.chess.getPiece(row, col);
            if (piece && piece.color === this.playerColor) {
                this.selectTile(row, col);
            }
        }
    }

    // ---- Engine Zug ----
    engineMove() {
        this.engineThinking = true;
        document.getElementById('status').textContent = 'Engine denkt nach...';

        setTimeout(() => {
            const bestMove = this.engine.findBestMove(this.engineColor);
            if (bestMove) {
                const moveResult = this.chess.makeMove(
                    bestMove.fromRow,
                    bestMove.fromCol,
                    bestMove.toRow,
                    bestMove.toCol
                );
                if (moveResult) {
                    this.lastMove = moveResult;
                    this.drawPieces();
                    this.clearHighlights();
                    this.highlightLastMove();
                    this.updateStatus(moveResult);
                }
            }
            this.engineThinking = false;
        }, 100);
    }

    // ---- Selektion & Highlights ----
    selectTile(row, col) {
        this.clearHighlights();
        this.clearMoveIndicators();
        this.selectedTile = { row, col };

        this.tileGraphics[row][col].setFillStyle(COLORS.SELECTED);

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

        if (this.lastMove) this.highlightLastMove();
    }

    clearHighlights() {
        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
                const isLight = (row + col) % 2 === 0;
                this.tileGraphics[row][col].setFillStyle(
                    isLight ? COLORS.LIGHT_TILE : COLORS.DARK_TILE
                );
            }
        }
    }

    clearMoveIndicators() {
        this.legalMoveIndicators.forEach((i) => i.destroy());
        this.legalMoveIndicators = [];
    }

    highlightLastMove() {
        if (!this.lastMove) return;
        const { from, to } = this.lastMove;
        this.tileGraphics[from.row][from.col].setFillStyle(COLORS.LAST_MOVE);
        this.tileGraphics[to.row][to.col].setFillStyle(COLORS.LAST_MOVE);
    }

    // ---- Status ----
    updateStatus(moveResult) {
        const statusEl = document.getElementById('status');

        if (!moveResult) {
            const turn = this.chess.currentTurn === this.playerColor ? 'Du bist' : 'Engine ist';
            statusEl.textContent = `${turn} am Zug`;
            return;
        }

        if (moveResult.checkmate) {
            const isPlayerWin = moveResult.piece.color === this.playerColor;
            statusEl.textContent = isPlayerWin
                ? 'Schachmatt! Du hast gewonnen!'
                : 'Schachmatt! Die Engine hat gewonnen.';
            const king = this.chess.findKing(this.chess.currentTurn);
            if (king) {
                this.tileGraphics[king.row][king.col].setFillStyle(COLORS.CHECK);
            }
        } else if (moveResult.stalemate) {
            statusEl.textContent = 'Patt! Unentschieden!';
        } else if (moveResult.check) {
            const inCheck = this.chess.currentTurn === this.playerColor ? 'Du bist' : 'Engine ist';
            statusEl.textContent = `${inCheck} im Schach!`;
            const king = this.chess.findKing(this.chess.currentTurn);
            if (king) {
                this.tileGraphics[king.row][king.col].setFillStyle(COLORS.CHECK);
            }
        } else {
            const turn = this.chess.currentTurn === this.playerColor ? 'Du bist' : 'Engine ist';
            statusEl.textContent = `${turn} am Zug`;
        }
    }
}
