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

        // Gespeicherte Spielfarbe übernehmen
        const playAsEl = document.getElementById('play-as');
        this.playerColor = playAsEl ? playAsEl.value : COLOR.WHITE;
        this.engineColor = this.playerColor === COLOR.WHITE ? COLOR.BLACK : COLOR.WHITE;
        this.flipped = this.playerColor === COLOR.BLACK;

        this.selectedTile = null;
        this.legalMoveIndicators = [];
        this.pieceSprites = [];
        this.tileGraphics = [];
        this.lastMove = null;
        this.engineThinking = false;

        this.drawBoard();
        this.drawPieces();
        this.setupInput();
        this._bindUIOnce();
        this.updateStatus();

        // Wenn Schwarz, Engine macht den ersten Zug
        if (this.playerColor === COLOR.BLACK) {
            this.engineMove();
        }
    }

    // --- Koordinaten-Konvertierung (wenn Brett gedreht) ---
    _viewRow(boardRow) { return this.flipped ? 7 - boardRow : boardRow; }
    _viewCol(boardCol) { return this.flipped ? 7 - boardCol : boardCol; }
    _boardRow(viewRow) { return this.flipped ? 7 - viewRow : viewRow; }
    _boardCol(viewCol) { return this.flipped ? 7 - viewCol : viewCol; }

    // ---- Brett zeichnen ----
    drawBoard() {
        // Holzrahmen
        const cx = BOARD_OFFSET_X + (BOARD_SIZE * TILE_SIZE) / 2;
        const cy = BOARD_OFFSET_Y + (BOARD_SIZE * TILE_SIZE) / 2;
        this.add.rectangle(cx, cy, BOARD_SIZE * TILE_SIZE + 20, BOARD_SIZE * TILE_SIZE + 20, 0x5c3317).setOrigin(0.5);
        this.add.rectangle(cx, cy, BOARD_SIZE * TILE_SIZE + 12, BOARD_SIZE * TILE_SIZE + 12, 0x7a4b2a).setOrigin(0.5);
        this.add.rectangle(cx, cy, BOARD_SIZE * TILE_SIZE + 4, BOARD_SIZE * TILE_SIZE + 4, 0x3e1f0d).setOrigin(0.5);

        // Felder mit Holztextur (gecacht)
        BoardUtils.ensureWoodTextures(this);

        for (let row = 0; row < BOARD_SIZE; row++) {
            this.tileGraphics[row] = [];
            for (let col = 0; col < BOARD_SIZE; col++) {
                const isLight = (row + col) % 2 === 0;
                const x = BOARD_OFFSET_X + col * TILE_SIZE;
                const y = BOARD_OFFSET_Y + row * TILE_SIZE;

                const texKey = isLight ? '_woodLight' : '_woodDark';
                const tile = this.add.image(x + TILE_SIZE / 2, y + TILE_SIZE / 2, texKey);
                const overlay = this.add.rectangle(
                    x + TILE_SIZE / 2, y + TILE_SIZE / 2,
                    TILE_SIZE, TILE_SIZE, 0x000000, 0
                );
                tile._overlay = overlay;
                tile._isLight = isLight;
                this.tileGraphics[row][col] = tile;
            }
        }

        // Beschriftung (a-h, 1-8) passend zur Ausrichtung
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        for (let i = 0; i < 8; i++) {
            const fileIdx = this.flipped ? 7 - i : i;
            const rankNum = this.flipped ? i + 1 : 8 - i;

            this.add.text(
                BOARD_OFFSET_X + i * TILE_SIZE + TILE_SIZE / 2,
                BOARD_OFFSET_Y + BOARD_SIZE * TILE_SIZE + 8,
                files[fileIdx],
                { fontSize: '14px', color: '#c4a265', fontFamily: 'serif' }
            ).setOrigin(0.5, 0);

            this.add.text(
                BOARD_OFFSET_X - 20,
                BOARD_OFFSET_Y + i * TILE_SIZE + TILE_SIZE / 2,
                String(rankNum),
                { fontSize: '14px', color: '#c4a265', fontFamily: 'serif' }
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
                    const vr = this._viewRow(row);
                    const vc = this._viewCol(col);
                    const x = BOARD_OFFSET_X + vc * TILE_SIZE + TILE_SIZE / 2;
                    const y = BOARD_OFFSET_Y + vr * TILE_SIZE + TILE_SIZE / 2;
                    const key = `${piece.color}_${piece.type}`;
                    const sprite = this.add.image(x, y, key);
                    this.pieceSprites.push(sprite);
                }
            }
        }
    }

    // ---- UI Buttons (einmal binden, immer aktuelle Scene nutzen) ----
    _bindUIOnce() {
        if (GameScene._uiBound) return;
        GameScene._uiBound = true;

        const getScene = () => this.scene.manager.getScene('GameScene');

        document.getElementById('btn-new-game').addEventListener('click', () => {
            const s = getScene();
            if (s && s.scene.isActive()) s.scene.restart();
        });

        document.getElementById('difficulty').addEventListener('change', (e) => {
            const s = getScene();
            if (s && s.engine) {
                const level = parseInt(e.target.value, 10);
                s.engine.setDifficulty(level);
            }
        });

        document.getElementById('play-as').addEventListener('change', () => {
            const s = getScene();
            if (s && s.scene.isActive()) s.scene.restart();
        });
    }

    newGame() {
        this.scene.restart();
    }

    // ---- Eingabe ----
    setupInput() {
        this.input.on('pointerdown', (pointer) => {
            const viewCol = Math.floor((pointer.x - BOARD_OFFSET_X) / TILE_SIZE);
            const viewRow = Math.floor((pointer.y - BOARD_OFFSET_Y) / TILE_SIZE);
            if (viewRow < 0 || viewRow > 7 || viewCol < 0 || viewCol > 7) return;
            const boardRow = this._boardRow(viewRow);
            const boardCol = this._boardCol(viewCol);
            this.handleTileClick(boardRow, boardCol);
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

        this.time.delayedCall(100, () => {
            if (!this.scene.isActive()) return;
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
        });
    }

    // ---- Selektion & Highlights ----
    selectTile(row, col) {
        this.clearHighlights();
        this.clearMoveIndicators();
        this.selectedTile = { row, col };

        this._setTileOverlay(row, col, COLORS.SELECTED, 0.45);

        const moves = this.chess.getLegalMoves(row, col);
        for (const move of moves) {
            const vr = this._viewRow(move.row);
            const vc = this._viewCol(move.col);
            const x = BOARD_OFFSET_X + vc * TILE_SIZE + TILE_SIZE / 2;
            const y = BOARD_OFFSET_Y + vr * TILE_SIZE + TILE_SIZE / 2;

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

    _setTileOverlay(boardRow, boardCol, color, alpha) {
        const vr = this._viewRow(boardRow);
        const vc = this._viewCol(boardCol);
        const tile = this.tileGraphics[vr][vc];
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
