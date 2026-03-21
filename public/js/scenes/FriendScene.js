// ============================================
// Friend Scene - Spieler vs Spieler (lokal)
// Brett dreht sich nach jedem Zug
// Varianten: Standard, Chess960, Räuberschach
// Handicaps: Ohne Dame/Türme/Läufer/Springer
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
        this.flipped = false;

        // Variante und Handicaps auslesen
        const variantEl = document.getElementById('friend-variant');
        const hWhiteEl = document.getElementById('friend-handicap-white');
        const hBlackEl = document.getElementById('friend-handicap-black');
        this.variant = variantEl ? variantEl.value : 'standard';
        this.handicapWhite = hWhiteEl ? hWhiteEl.value : 'none';
        this.handicapBlack = hBlackEl ? hBlackEl.value : 'none';

        // Startposition aufbauen
        this._setupStartPosition();

        this.drawBoard();
        this.drawPieces();
        this._setupInput();
        this._bindUIOnce();
        this._updateStatus();
    }

    // ---- Startposition je nach Variante / Handicap ----
    _setupStartPosition() {
        if (this.variant === 'chess960') {
            this._setupChess960();
        } else {
            this.chess.reset();
        }

        // Handicaps anwenden
        this._applyHandicap(COLOR.WHITE, this.handicapWhite);
        this._applyHandicap(COLOR.BLACK, this.handicapBlack);
    }

    _applyHandicap(color, handicap) {
        if (handicap === 'none') return;
        const removeType = {
            'queen': [PIECE.QUEEN],
            'rook': [PIECE.ROOK],
            'bishop': [PIECE.BISHOP],
            'knight': [PIECE.KNIGHT],
            'rook-knight': [PIECE.ROOK, PIECE.KNIGHT],
        }[handicap] || [];

        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const p = this.chess.getPiece(r, c);
                if (p && p.color === color && removeType.includes(p.type)) {
                    this.chess.board[r][c] = null;
                }
            }
        }
    }

    // ---- Chess960 (Fischer Random) ----
    _setupChess960() {
        this.chess.reset();
        const backRank = this._generateChess960BackRank();

        // Weiß (Reihe 7)
        for (let c = 0; c < 8; c++) {
            this.chess.board[7][c] = { color: COLOR.WHITE, type: backRank[c] };
        }
        // Schwarz (Reihe 0) - gespiegelt
        for (let c = 0; c < 8; c++) {
            this.chess.board[0][c] = { color: COLOR.BLACK, type: backRank[c] };
        }

        // Rochade-Rechte deaktivieren für Chess960 (vereinfacht)
        this.chess.castlingRights = {
            white: { kingSide: false, queenSide: false },
            black: { kingSide: false, queenSide: false },
        };
    }

    _generateChess960BackRank() {
        // Fischer Random: König zwischen den Türmen, Läufer auf verschiedenen Feldern
        const pieces = new Array(8).fill(null);

        // 1. Läufer auf zufälliges helles Feld (0, 2, 4, 6)
        const lightSquares = [0, 2, 4, 6];
        pieces[lightSquares[Math.floor(Math.random() * 4)]] = PIECE.BISHOP;

        // 2. Läufer auf zufälliges dunkles Feld (1, 3, 5, 7)
        const darkSquares = [1, 3, 5, 7];
        pieces[darkSquares[Math.floor(Math.random() * 4)]] = PIECE.BISHOP;

        // 3. Dame auf ein freies Feld
        const empty1 = pieces.map((p, i) => p === null ? i : -1).filter(i => i >= 0);
        pieces[empty1[Math.floor(Math.random() * empty1.length)]] = PIECE.QUEEN;

        // 4. Springer auf zwei freie Felder
        const empty2 = pieces.map((p, i) => p === null ? i : -1).filter(i => i >= 0);
        const knightIdx1 = Math.floor(Math.random() * empty2.length);
        pieces[empty2[knightIdx1]] = PIECE.KNIGHT;
        empty2.splice(knightIdx1, 1);
        const knightIdx2 = Math.floor(Math.random() * empty2.length);
        pieces[empty2[knightIdx2]] = PIECE.KNIGHT;
        empty2.splice(knightIdx2, 1);

        // 5. Turm-König-Turm auf die verbleibenden 3 Felder (in Reihenfolge)
        const remaining = pieces.map((p, i) => p === null ? i : -1).filter(i => i >= 0);
        // remaining hat genau 3 Einträge, sortiert: Turm, König, Turm
        pieces[remaining[0]] = PIECE.ROOK;
        pieces[remaining[1]] = PIECE.KING;
        pieces[remaining[2]] = PIECE.ROOK;

        return pieces;
    }

    // ---- Räuberschach: Schlagzwang-Filter ----
    _getLegalMovesForVariant(row, col) {
        if (this.variant !== 'antichess') {
            return this.chess.getLegalMoves(row, col);
        }
        // Räuberschach: Alle Züge ohne Schach-Prüfung (König ist nicht besonders)
        return this._getAntichessMoves(row, col);
    }

    _getAntichessMoves(row, col) {
        // Im Räuberschach gibt es kein Schach – alle pseudo-legalen Züge sind legal
        return this.chess.getPseudoLegalMoves(row, col);
    }

    _getMovesWithCaptureForcing(color) {
        // Prüfe ob es irgendwo Schlagzüge gibt
        const allCaptures = [];
        const allMoves = [];

        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const p = this.chess.getPiece(r, c);
                if (p && p.color === color) {
                    const moves = this._getLegalMovesForVariant(r, c);
                    for (const m of moves) {
                        const target = this.chess.getPiece(m.row, m.col);
                        const isEnPassant = m.enPassant;
                        if (target || isEnPassant) {
                            allCaptures.push({ from: { row: r, col: c }, move: m });
                        }
                        allMoves.push({ from: { row: r, col: c }, move: m });
                    }
                }
            }
        }

        return { allCaptures, allMoves, mustCapture: allCaptures.length > 0 };
    }

    _getFilteredMoves(row, col) {
        const moves = this._getLegalMovesForVariant(row, col);
        if (this.variant !== 'antichess') return moves;

        // Schlagzwang: Gibt es Schlagzüge für diese Farbe?
        const piece = this.chess.getPiece(row, col);
        if (!piece) return [];

        const { mustCapture } = this._getMovesWithCaptureForcing(piece.color);
        if (!mustCapture) return moves;

        // Nur Schlagzüge dieser Figur zurückgeben
        return moves.filter(m => {
            const target = this.chess.getPiece(m.row, m.col);
            return target || m.enPassant;
        });
    }

    // ---- Räuberschach: Spielende prüfen ----
    _checkAntichessEnd(moveResult) {
        if (this.variant !== 'antichess') return;

        // Gewonnen wenn man alle Figuren verloren hat
        const movedColor = moveResult.piece.color;
        const opponentColor = movedColor === COLOR.WHITE ? COLOR.BLACK : COLOR.WHITE;

        // Prüfe ob der Spieler der gezogen hat keine Figuren mehr hat
        if (!this._hasAnyPiece(movedColor)) {
            document.getElementById('status').textContent =
                `${movedColor === COLOR.WHITE ? 'Weiß' : 'Schwarz'} hat alle Figuren verloren — Gewonnen!`;
            this.chess.gameOver = true;
            return;
        }
        // Prüfe ob der Gegner keine Figuren mehr hat
        if (!this._hasAnyPiece(opponentColor)) {
            document.getElementById('status').textContent =
                `${opponentColor === COLOR.WHITE ? 'Weiß' : 'Schwarz'} hat alle Figuren verloren — Gewonnen!`;
            this.chess.gameOver = true;
            return;
        }

        // Prüfe ob der nächste Spieler überhaupt ziehen kann
        const { allMoves } = this._getMovesWithCaptureForcing(this.chess.currentTurn);
        if (allMoves.length === 0) {
            // Keine Züge möglich → Spieler der nicht ziehen kann gewinnt im Räuberschach
            const stuckColor = this.chess.currentTurn === COLOR.WHITE ? 'Weiß' : 'Schwarz';
            document.getElementById('status').textContent = `${stuckColor} kann nicht ziehen — ${stuckColor} gewinnt!`;
            this.chess.gameOver = true;
        }
    }

    _hasAnyPiece(color) {
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const p = this.chess.getPiece(r, c);
                if (p && p.color === color) return true;
            }
        }
        return false;
    }

    // ---- Räuberschach: Zug ausführen (ohne Schach-Prüfung) ----
    _makeAntichessMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.chess.getPiece(fromRow, fromCol);
        if (!piece) return null;
        if (piece.color !== this.chess.currentTurn) return null;

        const moves = this._getAntichessMoves(fromRow, fromCol);
        const move = moves.find(m => m.row === toRow && m.col === toCol);
        if (!move) return null;

        const moveResult = {
            from: { row: fromRow, col: fromCol },
            to: { row: toRow, col: toCol },
            piece: { ...piece },
            captured: this.chess.board[toRow][toCol] ? { ...this.chess.board[toRow][toCol] } : null,
            enPassant: move.enPassant || false,
            promotion: false,
            check: false,
            checkmate: false,
            stalemate: false,
        };

        this.chess.board[toRow][toCol] = piece;
        this.chess.board[fromRow][fromCol] = null;

        // En passant
        if (move.enPassant) {
            moveResult.captured = { ...this.chess.board[fromRow][toCol] };
            this.chess.board[fromRow][toCol] = null;
        }

        // Bauernumwandlung → im Räuberschach wird Dame gewählt
        const promotionRow = piece.color === COLOR.WHITE ? 0 : 7;
        if (piece.type === PIECE.PAWN && toRow === promotionRow) {
            this.chess.board[toRow][toCol] = { color: piece.color, type: PIECE.QUEEN };
            moveResult.promotion = true;
        }

        // En passant Ziel
        if (piece.type === PIECE.PAWN && Math.abs(toRow - fromRow) === 2) {
            this.chess.enPassantTarget = { row: (fromRow + toRow) / 2, col: fromCol };
        } else {
            this.chess.enPassantTarget = null;
        }

        // Zug wechseln
        this.chess.currentTurn = this.chess.currentTurn === COLOR.WHITE ? COLOR.BLACK : COLOR.WHITE;
        this.chess.moveHistory.push(moveResult);

        return moveResult;
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

        document.getElementById('btn-start-friend').addEventListener('click', () => {
            startFriendGame();
        });

        document.getElementById('btn-new-friend-game').addEventListener('click', () => {
            friendBackToSetup();
        });

        document.getElementById('btn-restart-friend').addEventListener('click', () => {
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

            // Prüfe ob der Zug zu den gefilterten Zügen gehört
            const filteredMoves = this._getFilteredMoves(from.row, from.col);
            const isAllowed = filteredMoves.some(m => m.row === row && m.col === col);

            if (isAllowed) {
                // Im Räuberschach: Zug direkt auf dem Board ausführen (ohne Schach-Prüfung)
                let moveResult;
                if (this.variant === 'antichess') {
                    moveResult = this._makeAntichessMove(from.row, from.col, row, col);
                } else {
                    moveResult = this.chess.makeMove(from.row, from.col, row, col);
                }

                if (moveResult) {
                    this.lastMove = moveResult;
                    this.selectedTile = null;
                    this.clearMoveIndicators();
                    this.clearHighlights();
                    this.highlightLastMove();
                    this.drawPieces();

                    if (this.variant === 'antichess') {
                        this._checkAntichessEnd(moveResult);
                        this._updateStatus(moveResult);
                    } else {
                        this._updateStatus(moveResult);
                    }

                    if (!this.chess.gameOver) {
                        this.time.delayedCall(600, () => this._flipBoard());
                    }
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

        const moves = this._getFilteredMoves(row, col);

        // Im Räuberschach: Figur ohne Züge nicht auswählbar bei Schlagzwang
        if (moves.length === 0) {
            this.selectedTile = null;
            this.clearHighlights();
            return;
        }

        for (const move of moves) {
            const vr = this._viewRow(move.row);
            const vc = this._viewCol(move.col);
            const x = BOARD_OFFSET_X + vc * TILE_SIZE + TILE_SIZE / 2;
            const y = BOARD_OFFSET_Y + vr * TILE_SIZE + TILE_SIZE / 2;
            const target = this.chess.getPiece(move.row, move.col);
            let indicator;
            if (target || move.enPassant) {
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

        // Wenn gameOver bereits durch Antichess gesetzt
        if (this.chess.gameOver && this.variant === 'antichess') return;

        const turnName = this.chess.currentTurn === COLOR.WHITE ? 'Weiß' : 'Schwarz';
        const variantLabel = this.variant === 'chess960' ? ' (960)' :
                             this.variant === 'antichess' ? ' (Räuber)' : '';

        if (!moveResult) {
            statusEl.textContent = `${turnName} ist am Zug${variantLabel}`;
            return;
        }

        if (this.variant === 'antichess') {
            // Im Räuberschach kein Schachmatt/Patt Standard
            statusEl.textContent = `${turnName} ist am Zug (Räuber)`;
            return;
        }

        if (moveResult.checkmate) {
            const winner = moveResult.piece.color === COLOR.WHITE ? 'Weiß' : 'Schwarz';
            statusEl.textContent = `Schachmatt! ${winner} hat gewonnen!${variantLabel}`;
            const king = this.chess.findKing(this.chess.currentTurn);
            if (king) this._setTileOverlay(king.row, king.col, COLORS.CHECK, 0.5);
        } else if (moveResult.stalemate) {
            statusEl.textContent = `Patt! Unentschieden!${variantLabel}`;
        } else if (moveResult.check) {
            statusEl.textContent = `${turnName} ist im Schach!${variantLabel}`;
            const king = this.chess.findKing(this.chess.currentTurn);
            if (king) this._setTileOverlay(king.row, king.col, COLORS.CHECK, 0.5);
        } else {
            statusEl.textContent = `${turnName} ist am Zug${variantLabel}`;
        }
    }
}
