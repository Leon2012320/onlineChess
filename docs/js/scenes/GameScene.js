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
        // Holzrahmen
        this.add
            .rectangle(
                BOARD_OFFSET_X + (BOARD_SIZE * TILE_SIZE) / 2,
                BOARD_OFFSET_Y + (BOARD_SIZE * TILE_SIZE) / 2,
                BOARD_SIZE * TILE_SIZE + 20,
                BOARD_SIZE * TILE_SIZE + 20,
                0x5c3317
            )
            .setOrigin(0.5);
        this.add
            .rectangle(
                BOARD_OFFSET_X + (BOARD_SIZE * TILE_SIZE) / 2,
                BOARD_OFFSET_Y + (BOARD_SIZE * TILE_SIZE) / 2,
                BOARD_SIZE * TILE_SIZE + 12,
                BOARD_SIZE * TILE_SIZE + 12,
                0x7a4b2a
            )
            .setOrigin(0.5);
        this.add
            .rectangle(
                BOARD_OFFSET_X + (BOARD_SIZE * TILE_SIZE) / 2,
                BOARD_OFFSET_Y + (BOARD_SIZE * TILE_SIZE) / 2,
                BOARD_SIZE * TILE_SIZE + 4,
                BOARD_SIZE * TILE_SIZE + 4,
                0x3e1f0d
            )
            .setOrigin(0.5);

        // Felder mit Holztextur
        this._createWoodTileTextures();

        for (let row = 0; row < BOARD_SIZE; row++) {
            this.tileGraphics[row] = [];
            for (let col = 0; col < BOARD_SIZE; col++) {
                const isLight = (row + col) % 2 === 0;
                const x = BOARD_OFFSET_X + col * TILE_SIZE;
                const y = BOARD_OFFSET_Y + row * TILE_SIZE;

                const texKey = isLight ? '_woodLight' : '_woodDark';
                const tile = this.add.image(x + TILE_SIZE / 2, y + TILE_SIZE / 2, texKey);
                // Farbton-Overlay für Highlights speichern
                const overlay = this.add.rectangle(
                    x + TILE_SIZE / 2, y + TILE_SIZE / 2,
                    TILE_SIZE, TILE_SIZE, 0x000000, 0
                );
                tile._overlay = overlay;
                tile._isLight = isLight;
                this.tileGraphics[row][col] = tile;
            }
        }

        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        for (let i = 0; i < 8; i++) {
            this.add.text(
                BOARD_OFFSET_X + i * TILE_SIZE + TILE_SIZE / 2,
                BOARD_OFFSET_Y + BOARD_SIZE * TILE_SIZE + 8,
                files[i],
                { fontSize: '14px', color: '#c4a265', fontFamily: 'serif' }
            ).setOrigin(0.5, 0);

            this.add.text(
                BOARD_OFFSET_X - 20,
                BOARD_OFFSET_Y + i * TILE_SIZE + TILE_SIZE / 2,
                String(8 - i),
                { fontSize: '14px', color: '#c4a265', fontFamily: 'serif' }
            ).setOrigin(0.5);
        }
    }

    _createWoodTileTextures() {
        // Helles Holzfeld
        const canvasL = document.createElement('canvas');
        canvasL.width = TILE_SIZE;
        canvasL.height = TILE_SIZE;
        const ctxL = canvasL.getContext('2d');
        this._drawWoodTile(ctxL, TILE_SIZE, '#e8d5a8', '#d4c091', '#c9b57a');
        this.textures.addCanvas('_woodLight', canvasL);

        // Dunkles Holzfeld
        const canvasD = document.createElement('canvas');
        canvasD.width = TILE_SIZE;
        canvasD.height = TILE_SIZE;
        const ctxD = canvasD.getContext('2d');
        this._drawWoodTile(ctxD, TILE_SIZE, '#a0734a', '#8b613c', '#7a5230');
        this.textures.addCanvas('_woodDark', canvasD);
    }

    _drawWoodTile(ctx, size, baseColor, grainColor1, grainColor2) {
        ctx.fillStyle = baseColor;
        ctx.fillRect(0, 0, size, size);
        // Holzmaserung
        ctx.globalAlpha = 0.18;
        for (let i = 0; i < 12; i++) {
            ctx.strokeStyle = i % 2 === 0 ? grainColor1 : grainColor2;
            ctx.lineWidth = 1 + Math.random() * 1.5;
            ctx.beginPath();
            const y = (size / 12) * i + Math.random() * 4;
            ctx.moveTo(0, y);
            ctx.quadraticCurveTo(
                size * 0.3, y + (Math.random() - 0.5) * 6,
                size * 0.5, y + (Math.random() - 0.5) * 4
            );
            ctx.quadraticCurveTo(
                size * 0.7, y + (Math.random() - 0.5) * 6,
                size, y + (Math.random() - 0.5) * 3
            );
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
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

        if (this.lastMove) this.highlightLastMove();
    }

    clearHighlights() {
        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
                this._setTileOverlay(row, col, 0x000000, 0);
            }
        }
    }

    _setTileOverlay(row, col, color, alpha) {
        const tile = this.tileGraphics[row][col];
        if (tile._overlay) {
            tile._overlay.setFillStyle(color, alpha);
        }
    }

    clearMoveIndicators() {
        this.legalMoveIndicators.forEach((i) => i.destroy());
        this.legalMoveIndicators = [];
    }

    highlightLastMove() {
        if (!this.lastMove) return;
        const { from, to } = this.lastMove;
        this._setTileOverlay(from.row, from.col, COLORS.LAST_MOVE, 0.35);
        this._setTileOverlay(to.row, to.col, COLORS.LAST_MOVE, 0.35);
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
                this._setTileOverlay(king.row, king.col, COLORS.CHECK, 0.5);
            }
        } else if (moveResult.stalemate) {
            statusEl.textContent = 'Patt! Unentschieden!';
        } else if (moveResult.check) {
            const inCheck = this.chess.currentTurn === this.playerColor ? 'Du bist' : 'Engine ist';
            statusEl.textContent = `${inCheck} im Schach!`;
            const king = this.chess.findKing(this.chess.currentTurn);
            if (king) {
                this._setTileOverlay(king.row, king.col, COLORS.CHECK, 0.5);
            }
        } else {
            const turn = this.chess.currentTurn === this.playerColor ? 'Du bist' : 'Engine ist';
            statusEl.textContent = `${turn} am Zug`;
        }
    }
}
