// ============================================
// Schach-Logik (Zugvalidierung)
// ============================================

class ChessLogic {
    constructor() {
        this.reset();
    }

    reset() {
        // Brett als 8x8 Array: board[row][col]
        this.board = [];
        for (let row = 0; row < 8; row++) {
            this.board[row] = [];
            for (let col = 0; col < 8; col++) {
                this.board[row][col] = INITIAL_BOARD[row][col]
                    ? { ...pieceFromCode(INITIAL_BOARD[row][col]) }
                    : null;
            }
        }
        this.currentTurn = COLOR.WHITE;
        this.moveHistory = [];
        this.gameOver = false;
        this.castlingRights = {
            white: { kingSide: true, queenSide: true },
            black: { kingSide: true, queenSide: true },
        };
        this.enPassantTarget = null; // {row, col}
    }

    getPiece(row, col) {
        if (row < 0 || row > 7 || col < 0 || col > 7) return undefined;
        return this.board[row][col];
    }

    isInBounds(row, col) {
        return row >= 0 && row <= 7 && col >= 0 && col <= 7;
    }

    // Gibt alle pseudo-legalen Züge für eine Figur zurück (ohne Schach-Prüfung)
    getPseudoLegalMoves(row, col) {
        const piece = this.getPiece(row, col);
        if (!piece) return [];

        const moves = [];
        const color = piece.color;
        const enemy = color === COLOR.WHITE ? COLOR.BLACK : COLOR.WHITE;

        switch (piece.type) {
            case PIECE.PAWN: {
                const dir = color === COLOR.WHITE ? -1 : 1;
                const startRow = color === COLOR.WHITE ? 6 : 1;

                // Ein Feld vorwärts
                if (this.isInBounds(row + dir, col) && !this.getPiece(row + dir, col)) {
                    moves.push({ row: row + dir, col });
                    // Zwei Felder vorwärts vom Start
                    if (row === startRow && !this.getPiece(row + 2 * dir, col)) {
                        moves.push({ row: row + 2 * dir, col });
                    }
                }
                // Schlagen diagonal
                for (const dc of [-1, 1]) {
                    const nr = row + dir;
                    const nc = col + dc;
                    if (this.isInBounds(nr, nc)) {
                        const target = this.getPiece(nr, nc);
                        if (target && target.color === enemy) {
                            moves.push({ row: nr, col: nc });
                        }
                        // En passant
                        if (
                            this.enPassantTarget &&
                            this.enPassantTarget.row === nr &&
                            this.enPassantTarget.col === nc
                        ) {
                            moves.push({ row: nr, col: nc, enPassant: true });
                        }
                    }
                }
                break;
            }
            case PIECE.KNIGHT: {
                const knightMoves = [
                    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
                    [1, -2], [1, 2], [2, -1], [2, 1],
                ];
                for (const [dr, dc] of knightMoves) {
                    const nr = row + dr;
                    const nc = col + dc;
                    if (this.isInBounds(nr, nc)) {
                        const target = this.getPiece(nr, nc);
                        if (!target || target.color === enemy) {
                            moves.push({ row: nr, col: nc });
                        }
                    }
                }
                break;
            }
            case PIECE.BISHOP: {
                this._addSlidingMoves(moves, row, col, color, [[-1, -1], [-1, 1], [1, -1], [1, 1]]);
                break;
            }
            case PIECE.ROOK: {
                this._addSlidingMoves(moves, row, col, color, [[-1, 0], [1, 0], [0, -1], [0, 1]]);
                break;
            }
            case PIECE.QUEEN: {
                this._addSlidingMoves(moves, row, col, color, [
                    [-1, -1], [-1, 1], [1, -1], [1, 1],
                    [-1, 0], [1, 0], [0, -1], [0, 1],
                ]);
                break;
            }
            case PIECE.KING: {
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        if (dr === 0 && dc === 0) continue;
                        const nr = row + dr;
                        const nc = col + dc;
                        if (this.isInBounds(nr, nc)) {
                            const target = this.getPiece(nr, nc);
                            if (!target || target.color === enemy) {
                                moves.push({ row: nr, col: nc });
                            }
                        }
                    }
                }
                // Rochade
                const rights = this.castlingRights[color];
                const kingRow = color === COLOR.WHITE ? 7 : 0;
                if (row === kingRow && col === 4 && !this.isKingInCheck(color)) {
                    // Königsseite
                    if (
                        rights.kingSide &&
                        !this.getPiece(kingRow, 5) &&
                        !this.getPiece(kingRow, 6) &&
                        !this.isSquareAttacked(kingRow, 5, enemy) &&
                        !this.isSquareAttacked(kingRow, 6, enemy)
                    ) {
                        moves.push({ row: kingRow, col: 6, castling: 'kingSide' });
                    }
                    // Damenseite
                    if (
                        rights.queenSide &&
                        !this.getPiece(kingRow, 3) &&
                        !this.getPiece(kingRow, 2) &&
                        !this.getPiece(kingRow, 1) &&
                        !this.isSquareAttacked(kingRow, 3, enemy) &&
                        !this.isSquareAttacked(kingRow, 2, enemy)
                    ) {
                        moves.push({ row: kingRow, col: 2, castling: 'queenSide' });
                    }
                }
                break;
            }
        }
        return moves;
    }

    _addSlidingMoves(moves, row, col, color, directions) {
        const enemy = color === COLOR.WHITE ? COLOR.BLACK : COLOR.WHITE;
        for (const [dr, dc] of directions) {
            let nr = row + dr;
            let nc = col + dc;
            while (this.isInBounds(nr, nc)) {
                const target = this.getPiece(nr, nc);
                if (!target) {
                    moves.push({ row: nr, col: nc });
                } else {
                    if (target.color === enemy) {
                        moves.push({ row: nr, col: nc });
                    }
                    break;
                }
                nr += dr;
                nc += dc;
            }
        }
    }

    // Prüft ob ein Feld von einer Farbe angegriffen wird
    isSquareAttacked(row, col, byColor) {
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = this.getPiece(r, c);
                if (piece && piece.color === byColor) {
                    // Für den König nur direkte Nachbarn prüfen (keine Rochade)
                    if (piece.type === PIECE.KING) {
                        if (Math.abs(r - row) <= 1 && Math.abs(c - col) <= 1) {
                            return true;
                        }
                        continue;
                    }
                    const moves = this.getPseudoLegalMoves(r, c);
                    if (moves.some((m) => m.row === row && m.col === col)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    // Findet die Position des Königs
    findKing(color) {
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const p = this.getPiece(r, c);
                if (p && p.type === PIECE.KING && p.color === color) {
                    return { row: r, col: c };
                }
            }
        }
        return null;
    }

    isKingInCheck(color) {
        const king = this.findKing(color);
        if (!king) return false;
        const enemy = color === COLOR.WHITE ? COLOR.BLACK : COLOR.WHITE;
        return this.isSquareAttacked(king.row, king.col, enemy);
    }

    // Gibt alle legalen Züge zurück (mit Schach-Prüfung)
    getLegalMoves(row, col) {
        const piece = this.getPiece(row, col);
        if (!piece) return [];

        const pseudoMoves = this.getPseudoLegalMoves(row, col);
        const legalMoves = [];

        for (const move of pseudoMoves) {
            // Zug simulieren
            const backup = this._makeTemporaryMove(row, col, move);
            if (!this.isKingInCheck(piece.color)) {
                legalMoves.push(move);
            }
            this._undoTemporaryMove(backup);
        }
        return legalMoves;
    }

    _makeTemporaryMove(fromRow, fromCol, move) {
        const backup = {
            from: { row: fromRow, col: fromCol, piece: this.board[fromRow][fromCol] },
            to: { row: move.row, col: move.col, piece: this.board[move.row][move.col] },
            extra: null,
        };

        this.board[move.row][move.col] = this.board[fromRow][fromCol];
        this.board[fromRow][fromCol] = null;

        // En passant
        if (move.enPassant) {
            const capturedRow = fromRow;
            backup.extra = {
                row: capturedRow,
                col: move.col,
                piece: this.board[capturedRow][move.col],
            };
            this.board[capturedRow][move.col] = null;
        }

        // Rochade - Turm bewegen
        if (move.castling) {
            const row = move.row;
            if (move.castling === 'kingSide') {
                backup.extra = { row, col: 7, piece: this.board[row][7], destCol: 5 };
                this.board[row][5] = this.board[row][7];
                this.board[row][7] = null;
            } else {
                backup.extra = { row, col: 0, piece: this.board[row][0], destCol: 3 };
                this.board[row][3] = this.board[row][0];
                this.board[row][0] = null;
            }
        }

        return backup;
    }

    _undoTemporaryMove(backup) {
        this.board[backup.from.row][backup.from.col] = backup.from.piece;
        this.board[backup.to.row][backup.to.col] = backup.to.piece;

        if (backup.extra) {
            if (backup.extra.destCol !== undefined) {
                // Rochade rückgängig
                this.board[backup.extra.row][backup.extra.col] = backup.extra.piece;
                this.board[backup.extra.row][backup.extra.destCol] = null;
            } else {
                // En passant rückgängig
                this.board[backup.extra.row][backup.extra.col] = backup.extra.piece;
            }
        }
    }

    // Führt einen Zug aus
    makeMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.getPiece(fromRow, fromCol);
        if (!piece) return null;
        if (piece.color !== this.currentTurn) return null;

        const legalMoves = this.getLegalMoves(fromRow, fromCol);
        const move = legalMoves.find((m) => m.row === toRow && m.col === toCol);
        if (!move) return null;

        const moveResult = {
            from: { row: fromRow, col: fromCol },
            to: { row: toRow, col: toCol },
            piece: { ...piece },
            captured: this.board[toRow][toCol] ? { ...this.board[toRow][toCol] } : null,
            castling: move.castling || null,
            enPassant: move.enPassant || false,
            promotion: false,
        };

        // Zug ausführen
        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;

        // En passant Schlag
        if (move.enPassant) {
            moveResult.captured = { ...this.board[fromRow][toCol] };
            this.board[fromRow][toCol] = null;
        }

        // Rochade
        if (move.castling === 'kingSide') {
            const row = toRow;
            this.board[row][5] = this.board[row][7];
            this.board[row][7] = null;
        } else if (move.castling === 'queenSide') {
            const row = toRow;
            this.board[row][3] = this.board[row][0];
            this.board[row][0] = null;
        }

        // Bauernumwandlung
        const promotionRow = piece.color === COLOR.WHITE ? 0 : 7;
        if (piece.type === PIECE.PAWN && toRow === promotionRow) {
            this.board[toRow][toCol] = { color: piece.color, type: PIECE.QUEEN };
            moveResult.promotion = true;
        }

        // En passant Ziel aktualisieren
        if (piece.type === PIECE.PAWN && Math.abs(toRow - fromRow) === 2) {
            this.enPassantTarget = { row: (fromRow + toRow) / 2, col: fromCol };
        } else {
            this.enPassantTarget = null;
        }

        // Rochade-Rechte aktualisieren
        this._updateCastlingRights(fromRow, fromCol, toRow, toCol);

        // Zug wechseln
        this.currentTurn = this.currentTurn === COLOR.WHITE ? COLOR.BLACK : COLOR.WHITE;
        this.moveHistory.push(moveResult);

        // Spielende prüfen
        moveResult.check = this.isKingInCheck(this.currentTurn);
        moveResult.checkmate = this.isCheckmate(this.currentTurn);
        moveResult.stalemate = this.isStalemate(this.currentTurn);

        if (moveResult.checkmate || moveResult.stalemate) {
            this.gameOver = true;
        }

        return moveResult;
    }

    _updateCastlingRights(fromRow, fromCol, toRow, toCol) {
        // König bewegt
        if (fromRow === 7 && fromCol === 4) {
            this.castlingRights.white.kingSide = false;
            this.castlingRights.white.queenSide = false;
        }
        if (fromRow === 0 && fromCol === 4) {
            this.castlingRights.black.kingSide = false;
            this.castlingRights.black.queenSide = false;
        }
        // Turm bewegt oder geschlagen
        if (fromRow === 7 && fromCol === 7 || toRow === 7 && toCol === 7) {
            this.castlingRights.white.kingSide = false;
        }
        if (fromRow === 7 && fromCol === 0 || toRow === 7 && toCol === 0) {
            this.castlingRights.white.queenSide = false;
        }
        if (fromRow === 0 && fromCol === 7 || toRow === 0 && toCol === 7) {
            this.castlingRights.black.kingSide = false;
        }
        if (fromRow === 0 && fromCol === 0 || toRow === 0 && toCol === 0) {
            this.castlingRights.black.queenSide = false;
        }
    }

    isCheckmate(color) {
        if (!this.isKingInCheck(color)) return false;
        return !this._hasAnyLegalMove(color);
    }

    isStalemate(color) {
        if (this.isKingInCheck(color)) return false;
        return !this._hasAnyLegalMove(color);
    }

    _hasAnyLegalMove(color) {
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const p = this.getPiece(r, c);
                if (p && p.color === color) {
                    if (this.getLegalMoves(r, c).length > 0) return true;
                }
            }
        }
        return false;
    }

    // Board-Zustand als serialisierbares Objekt
    getState() {
        return {
            board: this.board.map((row) => row.map((p) => (p ? { ...p } : null))),
            currentTurn: this.currentTurn,
            gameOver: this.gameOver,
            castlingRights: JSON.parse(JSON.stringify(this.castlingRights)),
            enPassantTarget: this.enPassantTarget ? { ...this.enPassantTarget } : null,
        };
    }

    loadState(state) {
        this.board = state.board.map((row) => row.map((p) => (p ? { ...p } : null)));
        this.currentTurn = state.currentTurn;
        this.gameOver = state.gameOver;
        this.castlingRights = JSON.parse(JSON.stringify(state.castlingRights));
        this.enPassantTarget = state.enPassantTarget ? { ...state.enPassantTarget } : null;
    }
}
