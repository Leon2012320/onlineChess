// ============================================
// Friend Scene - Spieler vs Spieler (lokal)
// Brett dreht sich nach jedem Zug
// ============================================

class FriendScene extends Phaser.Scene {
    constructor() {
        super({ key: 'FriendScene' });
    }

    create() {
        this.chess = new ChessLogic();
        this.selectedTile = null;
        this.legalMoveIndicators = [];
        this.pieceSprites = [];
        this.tileGraphics = [];
        this.lastMove = null;
        this.flipped = false; // Weiß startet unten

        this.drawBoard();
        this.drawPieces();
        this._setupInput();
        this._bindUIOnce();
        this._updateStatus();
    }

    // --- Koordinaten-Konvertierung ---
    _viewRow(boardRow) { return this.flipped ? 7 - boardRow : boardRow; }
    _viewCol(boardCol) { return this.flipped ? 7 - boardCol : boardCol; }
    _boardRow(viewRow) { return this.flipped ? 7 - viewRow : viewRow; }
    _boardCol(viewCol) { return this.flipped ? 7 - viewCol : viewCol; }

    // ---- Brett zeichnen ----
    drawBoard() {
        const cx = BOARD_OFFSET_X + (BOARD_SIZE * TILE_SIZE) / 2;
        const cy = BOARD_OFFSET_Y + (BOARD_SIZE * TILE_SIZE) / 2;
        this.add.rectangle(cx, cy, BOARD_SIZE * TILE_SIZE + 20, BOARD_SIZE * TILE_SIZE + 20, 0x5c3317).setOrigin(0.5);
        this.add.rectangle(cx, cy, BOARD_SIZE * TILE_SIZE + 12, BOARD_SIZE * TILE_SIZE + 12, 0x7a4b2a).setOrigin(0.5);
        this.add.rectangle(cx, cy, BOARD_SIZE * TILE_SIZE + 4, BOARD_SIZE * TILE_SIZE + 4, 0x3e1f0d).setOrigin(0.5);

        this._createWoodTileTextures();

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

        this._drawLabels();
    }

    _drawLabels() {
        if (this._labelSprites) this._labelSprites.forEach(l => l.destroy());
        this._labelSprites = [];
        const files = ['a','b','c','d','e','f','g','h'];
        for (let i = 0; i < 8; i++) {
            const fileIdx = this.flipped ? 7 - i : i;
            const rankNum = this.flipped ? i + 1 : 8 - i;
            const fl = this.add.text(
                BOARD_OFFSET_X + i * TILE_SIZE + TILE_SIZE / 2,
                BOARD_OFFSET_Y + BOARD_SIZE * TILE_SIZE + 8,
                files[fileIdx],
                { fontSize: '14px', color: '#c4a265', fontFamily: 'serif' }
            ).setOrigin(0.5, 0);
            const rl = this.add.text(
                BOARD_OFFSET_X - 20,
                BOARD_OFFSET_Y + i * TILE_SIZE + TILE_SIZE / 2,
                String(rankNum),
                { fontSize: '14px', color: '#c4a265', fontFamily: 'serif' }
            ).setOrigin(0.5);
            this._labelSprites.push(fl, rl);
        }
    }

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

    // ---- Figuren zeichnen ----
    drawPieces() {
        this.pieceSprites.forEach(s => s.destroy());
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

    // ---- UI Buttons ----
    _bindUIOnce() {
        if (FriendScene._uiBound) return;
        FriendScene._uiBound = true;

        const getScene = () => this.scene.manager.getScene('FriendScene');

        document.getElementById('btn-new-friend-game').addEventListener('click', () => {
            const s = getScene();
            if (s && s.scene.isActive()) s.scene.restart();
        });
    }

    // ---- Eingabe ----
    _setupInput() {
        this.input.on('pointerdown', (pointer) => {
            const viewCol = Math.floor((pointer.x - BOARD_OFFSET_X) / TILE_SIZE);
            const viewRow = Math.floor((pointer.y - BOARD_OFFSET_Y) / TILE_SIZE);
            if (viewRow < 0 || viewRow > 7 || viewCol < 0 || viewCol > 7) return;
            const boardRow = this._boardRow(viewRow);
            const boardCol = this._boardCol(viewCol);
            this._handleClick(boardRow, boardCol);
        });
    }

    _handleClick(row, col) {
        if (this.chess.gameOver) return;

        const currentColor = this.chess.currentTurn;

        if (this.selectedTile) {
            const from = this.selectedTile;
            const moveResult = this.chess.makeMove(from.row, from.col, row, col);

            if (moveResult) {
                this.lastMove = moveResult;
                this.selectedTile = null;
                this.clearMoveIndicators();
                this.clearHighlights();
                this.highlightLastMove();
                this.drawPieces();
                this._updateStatus(moveResult);

                // Brett drehen nach dem Zug (wenn Spiel nicht vorbei)
                if (!this.chess.gameOver) {
                    this.time.delayedCall(600, () => this._flipBoard());
                }
            } else {
                const piece = this.chess.getPiece(row, col);
                if (piece && piece.color === currentColor) {
                    this._selectTile(row, col);
                    return;
                }
                this.selectedTile = null;
                this.clearHighlights();
                this.clearMoveIndicators();
            }
        } else {
            const piece = this.chess.getPiece(row, col);
            if (piece && piece.color === currentColor) {
                this._selectTile(row, col);
            }
        }
    }

    // ---- Brett drehen ----
    _flipBoard() {
        this.flipped = !this.flipped;
        this.clearHighlights();
        this.clearMoveIndicators();
        this._drawLabels();
        this.drawPieces();
        if (this.lastMove) this.highlightLastMove();
        this._updateStatus();
    }

    // ---- Selektion & Highlights ----
    _selectTile(row, col) {
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
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                this._setTileOverlay(r, c, 0x000000, 0);
            }
        }
    }

    _setTileOverlay(boardRow, boardCol, color, alpha) {
        const vr = this._viewRow(boardRow);
        const vc = this._viewCol(boardCol);
        const tile = this.tileGraphics[vr] && this.tileGraphics[vr][vc];
        if (tile && tile._overlay) {
            tile._overlay.setFillStyle(color, alpha);
        }
    }

    clearMoveIndicators() {
        this.legalMoveIndicators.forEach(i => i.destroy());
        this.legalMoveIndicators = [];
    }

    highlightLastMove() {
        if (!this.lastMove) return;
        const { from, to } = this.lastMove;
        this._setTileOverlay(from.row, from.col, COLORS.LAST_MOVE, 0.35);
        this._setTileOverlay(to.row, to.col, COLORS.LAST_MOVE, 0.35);
    }

    // ---- Status ----
    _updateStatus(moveResult) {
        const statusEl = document.getElementById('status');
        const turnName = this.chess.currentTurn === COLOR.WHITE ? 'Weiß' : 'Schwarz';

        if (!moveResult) {
            statusEl.textContent = `${turnName} ist am Zug`;
            return;
        }
        if (moveResult.checkmate) {
            const winner = moveResult.piece.color === COLOR.WHITE ? 'Weiß' : 'Schwarz';
            statusEl.textContent = `Schachmatt! ${winner} hat gewonnen!`;
            const king = this.chess.findKing(this.chess.currentTurn);
            if (king) this._setTileOverlay(king.row, king.col, COLORS.CHECK, 0.5);
        } else if (moveResult.stalemate) {
            statusEl.textContent = 'Patt! Unentschieden!';
        } else if (moveResult.check) {
            statusEl.textContent = `${turnName} ist im Schach!`;
            const king = this.chess.findKing(this.chess.currentTurn);
            if (king) this._setTileOverlay(king.row, king.col, COLORS.CHECK, 0.5);
        } else {
            statusEl.textContent = `${turnName} ist am Zug`;
        }
    }
}
