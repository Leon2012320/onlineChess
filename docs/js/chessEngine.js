// ============================================
// Schach-Engine (Minimax + Alpha-Beta + Quiescence)
// ============================================

class ChessEngine {
    constructor(chess) {
        this.chess = chess;
        this.maxDepth = 2;
        this.errorChance = 0.1;
        this.useQuiescence = true;
        this.nodesSearched = 0;
        this.maxNodes = 600000;
    }

    setDifficulty(level) {
        switch (level) {
            case 1: this.maxDepth = 1; this.errorChance = 0.5;  this.useQuiescence = false; break;
            case 2: this.maxDepth = 1; this.errorChance = 0.3;  this.useQuiescence = false; break;
            case 3: this.maxDepth = 2; this.errorChance = 0.2;  this.useQuiescence = false; break;
            case 4: this.maxDepth = 2; this.errorChance = 0.08; this.useQuiescence = true;  break;
            case 5: this.maxDepth = 3; this.errorChance = 0.04; this.useQuiescence = true;  break;
            case 6: this.maxDepth = 3; this.errorChance = 0.0;  this.useQuiescence = true;  break;
            case 7: this.maxDepth = 4; this.errorChance = 0.0;  this.useQuiescence = true;  break;
            case 8: this.maxDepth = 5; this.errorChance = 0.0;  this.useQuiescence = true;  break;
            default: this.maxDepth = 2; this.errorChance = 0.1; this.useQuiescence = true;
        }
    }

    // --- Figurenwerte ---
    static PIECE_VALUES = {
        [PIECE.PAWN]: 100,
        [PIECE.KNIGHT]: 320,
        [PIECE.BISHOP]: 330,
        [PIECE.ROOK]: 500,
        [PIECE.QUEEN]: 900,
        [PIECE.KING]: 20000,
    };

    // --- Piece-Square Tables (Mittelpiel) ---
    static PST = {
        [PIECE.PAWN]: [
            [0,  0,  0,  0,  0,  0,  0,  0],
            [50, 50, 50, 50, 50, 50, 50, 50],
            [10, 10, 20, 30, 30, 20, 10, 10],
            [5,  5, 10, 27, 27, 10,  5,  5],
            [0,  0,  0, 25, 25,  0,  0,  0],
            [5, -5,-10,  0,  0,-10, -5,  5],
            [5, 10, 10,-25,-25, 10, 10,  5],
            [0,  0,  0,  0,  0,  0,  0,  0],
        ],
        [PIECE.KNIGHT]: [
            [-50,-40,-30,-30,-30,-30,-40,-50],
            [-40,-20,  0,  5,  5,  0,-20,-40],
            [-30,  0, 10, 15, 15, 10,  0,-30],
            [-30,  5, 15, 20, 20, 15,  5,-30],
            [-30,  0, 15, 20, 20, 15,  0,-30],
            [-30,  5, 10, 15, 15, 10,  5,-30],
            [-40,-20,  0,  5,  5,  0,-20,-40],
            [-50,-40,-30,-30,-30,-30,-40,-50],
        ],
        [PIECE.BISHOP]: [
            [-20,-10,-10,-10,-10,-10,-10,-20],
            [-10,  5,  0,  0,  0,  0,  5,-10],
            [-10, 10, 10, 10, 10, 10, 10,-10],
            [-10,  0, 10, 10, 10, 10,  0,-10],
            [-10,  5,  5, 10, 10,  5,  5,-10],
            [-10,  0,  5, 10, 10,  5,  0,-10],
            [-10,  0,  0,  0,  0,  0,  0,-10],
            [-20,-10,-10,-10,-10,-10,-10,-20],
        ],
        [PIECE.ROOK]: [
            [0,  0,  0,  5,  5,  0,  0,  0],
            [5, 10, 10, 10, 10, 10, 10,  5],
            [-5,  0,  0,  0,  0,  0,  0, -5],
            [-5,  0,  0,  0,  0,  0,  0, -5],
            [-5,  0,  0,  0,  0,  0,  0, -5],
            [-5,  0,  0,  0,  0,  0,  0, -5],
            [-5,  0,  0,  0,  0,  0,  0, -5],
            [0,  0,  0,  5,  5,  0,  0,  0],
        ],
        [PIECE.QUEEN]: [
            [-20,-10,-10, -5, -5,-10,-10,-20],
            [-10,  0,  5,  0,  0,  0,  0,-10],
            [-10,  5,  5,  5,  5,  5,  0,-10],
            [0,  0,  5,  5,  5,  5,  0, -5],
            [-5,  0,  5,  5,  5,  5,  0, -5],
            [-10,  0,  5,  5,  5,  5,  0,-10],
            [-10,  0,  0,  0,  0,  0,  0,-10],
            [-20,-10,-10, -5, -5,-10,-10,-20],
        ],
        [PIECE.KING]: [
            [-30,-40,-40,-50,-50,-40,-40,-30],
            [-30,-40,-40,-50,-50,-40,-40,-30],
            [-30,-40,-40,-50,-50,-40,-40,-30],
            [-30,-40,-40,-50,-50,-40,-40,-30],
            [-20,-30,-30,-40,-40,-30,-30,-20],
            [-10,-20,-20,-20,-20,-20,-20,-10],
            [20, 20,  0,  0,  0,  0, 20, 20],
            [20, 30, 10,  0,  0, 10, 30, 20],
        ],
    };

    // --- King Endgame Table (König zum Zentrum) ---
    static KING_ENDGAME = [
        [-50,-30,-30,-30,-30,-30,-30,-50],
        [-30,-10,  0,  0,  0,  0,-10,-30],
        [-30,  0, 10, 15, 15, 10,  0,-30],
        [-30,  0, 15, 20, 20, 15,  0,-30],
        [-30,  0, 15, 20, 20, 15,  0,-30],
        [-30,  0, 10, 15, 15, 10,  0,-30],
        [-30,-10,  0,  0,  0,  0,-10,-30],
        [-50,-30,-30,-30,-30,-30,-30,-50],
    ];

    // --- Endspiel-Erkennung ---
    _isEndgame() {
        let whiteQueen = 0, blackQueen = 0, whiteMinor = 0, blackMinor = 0;
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const p = this.chess.getPiece(r, c);
                if (!p) continue;
                if (p.type === PIECE.QUEEN) {
                    if (p.color === COLOR.WHITE) whiteQueen++; else blackQueen++;
                } else if (p.type === PIECE.KNIGHT || p.type === PIECE.BISHOP || p.type === PIECE.ROOK) {
                    if (p.color === COLOR.WHITE) whiteMinor++; else blackMinor++;
                }
            }
        }
        // Endspiel wenn keine Damen oder Dame + max 1 Leichtfigur
        return (whiteQueen === 0 && blackQueen === 0) ||
               (whiteQueen + blackQueen <= 1 && whiteMinor + blackMinor <= 2);
    }

    // --- Bewertung ---
    evaluate() {
        let score = 0;
        const endgame = this._isEndgame();
        let whiteBishops = 0, blackBishops = 0;
        const whitePawnCols = new Array(8).fill(0);
        const blackPawnCols = new Array(8).fill(0);
        let whiteMaterial = 0, blackMaterial = 0;

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.chess.getPiece(row, col);
                if (!piece) continue;

                const value = ChessEngine.PIECE_VALUES[piece.type];

                if (piece.color === COLOR.WHITE) {
                    whiteMaterial += value;
                    score += value;

                    // King PST: Endgame vs Mittelspiel
                    if (piece.type === PIECE.KING && endgame) {
                        score += ChessEngine.KING_ENDGAME[row][col];
                    } else {
                        score += ChessEngine.PST[piece.type][row][col];
                    }

                    if (piece.type === PIECE.BISHOP) whiteBishops++;
                    if (piece.type === PIECE.PAWN) whitePawnCols[col]++;
                } else {
                    blackMaterial += value;
                    score -= value;

                    if (piece.type === PIECE.KING && endgame) {
                        score -= ChessEngine.KING_ENDGAME[7 - row][col];
                    } else {
                        score -= ChessEngine.PST[piece.type][7 - row][col];
                    }

                    if (piece.type === PIECE.BISHOP) blackBishops++;
                    if (piece.type === PIECE.PAWN) blackPawnCols[col]++;
                }
            }
        }

        // Läuferpaar-Bonus
        if (whiteBishops >= 2) score += 35;
        if (blackBishops >= 2) score -= 35;

        // Bauernstruktur
        for (let c = 0; c < 8; c++) {
            // Doppelbauern
            if (whitePawnCols[c] > 1) score -= 15 * (whitePawnCols[c] - 1);
            if (blackPawnCols[c] > 1) score += 15 * (blackPawnCols[c] - 1);

            // Isolierte Bauern
            const wLeft = c > 0 ? whitePawnCols[c - 1] : 0;
            const wRight = c < 7 ? whitePawnCols[c + 1] : 0;
            if (whitePawnCols[c] > 0 && wLeft === 0 && wRight === 0) score -= 12;

            const bLeft = c > 0 ? blackPawnCols[c - 1] : 0;
            const bRight = c < 7 ? blackPawnCols[c + 1] : 0;
            if (blackPawnCols[c] > 0 && bLeft === 0 && bRight === 0) score += 12;
        }

        // Freibauern (keine gegnerischen Bauern auf gleicher oder Nachbarspalte davor)
        for (let row = 1; row < 7; row++) {
            for (let col = 0; col < 8; col++) {
                const p = this.chess.getPiece(row, col);
                if (!p || p.type !== PIECE.PAWN) continue;

                if (p.color === COLOR.WHITE) {
                    let passed = true;
                    for (let r = row - 1; r >= 0 && passed; r--) {
                        for (let dc = -1; dc <= 1 && passed; dc++) {
                            const nc = col + dc;
                            if (nc < 0 || nc > 7) continue;
                            const bp = this.chess.getPiece(r, nc);
                            if (bp && bp.type === PIECE.PAWN && bp.color === COLOR.BLACK) passed = false;
                        }
                    }
                    if (passed) score += 20 + (7 - row) * 10; // Weiter vorn = mehr Wert
                } else {
                    let passed = true;
                    for (let r = row + 1; r < 8 && passed; r++) {
                        for (let dc = -1; dc <= 1 && passed; dc++) {
                            const nc = col + dc;
                            if (nc < 0 || nc > 7) continue;
                            const wp = this.chess.getPiece(r, nc);
                            if (wp && wp.type === PIECE.PAWN && wp.color === COLOR.WHITE) passed = false;
                        }
                    }
                    if (passed) score -= 20 + row * 10;
                }
            }
        }

        // Turm auf offener/halboffener Linie
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const p = this.chess.getPiece(row, col);
                if (!p || p.type !== PIECE.ROOK) continue;
                const wPawns = whitePawnCols[col];
                const bPawns = blackPawnCols[col];
                if (p.color === COLOR.WHITE) {
                    if (wPawns === 0 && bPawns === 0) score += 20; // Offene Linie
                    else if (wPawns === 0) score += 10; // Halboffene Linie
                } else {
                    if (wPawns === 0 && bPawns === 0) score -= 20;
                    else if (bPawns === 0) score -= 10;
                }
            }
        }

        // Königssicherheit (Bauernschild im Mittelspiel)
        if (!endgame) {
            score += this._kingSafety(COLOR.WHITE);
            score -= this._kingSafety(COLOR.BLACK);
        }

        return score;
    }

    _kingSafety(color) {
        const king = this.chess.findKing(color);
        if (!king) return 0;
        let safety = 0;
        const dir = color === COLOR.WHITE ? -1 : 1;
        // Bauern vor dem König
        for (let dc = -1; dc <= 1; dc++) {
            const r = king.row + dir;
            const c = king.col + dc;
            if (r < 0 || r > 7 || c < 0 || c > 7) continue;
            const p = this.chess.getPiece(r, c);
            if (p && p.type === PIECE.PAWN && p.color === color) {
                safety += 12;
            }
        }
        return safety;
    }

    // --- Alle legalen Züge ---
    getAllMoves(color) {
        const moves = [];
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.chess.getPiece(row, col);
                if (piece && piece.color === color) {
                    const pieceMoves = this.chess.getLegalMoves(row, col);
                    for (const move of pieceMoves) {
                        moves.push({
                            fromRow: row, fromCol: col,
                            toRow: move.row, toCol: move.col,
                        });
                    }
                }
            }
        }
        return moves;
    }

    // --- Nur Schlagzüge (für Quiescence) ---
    getAllCaptures(color) {
        const captures = [];
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.chess.getPiece(row, col);
                if (piece && piece.color === color) {
                    const pieceMoves = this.chess.getLegalMoves(row, col);
                    for (const move of pieceMoves) {
                        const target = this.chess.getPiece(move.row, move.col);
                        // Schlag oder En-Passant
                        if (target || move.enPassant) {
                            captures.push({
                                fromRow: row, fromCol: col,
                                toRow: move.row, toCol: move.col,
                            });
                        }
                    }
                }
            }
        }
        return captures;
    }

    // --- Züge ordnen (MVV-LVA + Promotions + Zentrum) ---
    orderMoves(moves) {
        return moves.sort((a, b) => {
            // Promotions zuerst (Bauer auf letzte Reihe)
            const promoA = this._isPromotion(a) ? 900 : 0;
            const promoB = this._isPromotion(b) ? 900 : 0;

            // MVV-LVA: Wertvolles Opfer schlagen mit wenig wertvollem Angreifer
            const capturedA = this.chess.getPiece(a.toRow, a.toCol);
            const capturedB = this.chess.getPiece(b.toRow, b.toCol);
            const captValA = capturedA ? ChessEngine.PIECE_VALUES[capturedA.type] : 0;
            const captValB = capturedB ? ChessEngine.PIECE_VALUES[capturedB.type] : 0;
            const attackerA = this.chess.getPiece(a.fromRow, a.fromCol);
            const attackerB = this.chess.getPiece(b.fromRow, b.fromCol);
            const attValA = attackerA ? ChessEngine.PIECE_VALUES[attackerA.type] : 0;
            const attValB = attackerB ? ChessEngine.PIECE_VALUES[attackerB.type] : 0;
            const mvvlvaA = captValA > 0 ? captValA * 10 - attValA : 0;
            const mvvlvaB = captValB > 0 ? captValB * 10 - attValB : 0;

            // Zentrumskontrolle
            const centerA = (a.toRow >= 3 && a.toRow <= 4 && a.toCol >= 3 && a.toCol <= 4) ? 5 : 0;
            const centerB = (b.toRow >= 3 && b.toRow <= 4 && b.toCol >= 3 && b.toCol <= 4) ? 5 : 0;

            return (promoB + mvvlvaB + centerB) - (promoA + mvvlvaA + centerA);
        });
    }

    _isPromotion(move) {
        const piece = this.chess.getPiece(move.fromRow, move.fromCol);
        if (!piece || piece.type !== PIECE.PAWN) return false;
        return (piece.color === COLOR.WHITE && move.toRow === 0) ||
               (piece.color === COLOR.BLACK && move.toRow === 7);
    }

    // --- Quiescence Search (Ruhesuche) ---
    quiescence(alpha, beta, isMaximizing, qDepth) {
        this.nodesSearched++;
        if (this.nodesSearched >= this.maxNodes) {
            return this.evaluate();
        }

        const standPat = this.evaluate();

        if (qDepth <= 0) return standPat;

        if (isMaximizing) {
            if (standPat >= beta) return beta;
            if (standPat > alpha) alpha = standPat;
        } else {
            if (standPat <= alpha) return alpha;
            if (standPat < beta) beta = standPat;
        }

        const color = isMaximizing ? COLOR.WHITE : COLOR.BLACK;
        let captures = this.getAllCaptures(color);
        captures = this.orderMoves(captures);

        for (const move of captures) {
            // Delta Pruning: Überspringe Schläge die nicht genug Material gewinnen
            const captured = this.chess.getPiece(move.toRow, move.toCol);
            const capturedVal = captured ? ChessEngine.PIECE_VALUES[captured.type] : 100;
            if (isMaximizing && standPat + capturedVal + 200 < alpha) continue;
            if (!isMaximizing && standPat - capturedVal - 200 > beta) continue;

            const state = this.chess.getState();
            this.chess.makeMove(move.fromRow, move.fromCol, move.toRow, move.toCol);
            const evalScore = this.quiescence(alpha, beta, !isMaximizing, qDepth - 1);
            this.chess.loadState(state);
            this.chess.currentTurn = color;

            if (isMaximizing) {
                if (evalScore > alpha) alpha = evalScore;
                if (alpha >= beta) return beta;
            } else {
                if (evalScore < beta) beta = evalScore;
                if (alpha >= beta) return alpha;
            }
        }

        return isMaximizing ? alpha : beta;
    }

    // --- Minimax mit Alpha-Beta Pruning ---
    minimax(depth, alpha, beta, isMaximizing) {
        this.nodesSearched++;
        if (this.nodesSearched >= this.maxNodes) {
            return this.evaluate();
        }

        if (depth === 0) {
            if (this.useQuiescence) {
                return this.quiescence(alpha, beta, isMaximizing, 4);
            }
            return this.evaluate();
        }

        const color = isMaximizing ? COLOR.WHITE : COLOR.BLACK;

        if (this.chess.isCheckmate(color)) {
            return isMaximizing ? -99999 + (this.maxDepth - depth) : 99999 - (this.maxDepth - depth);
        }
        if (this.chess.isStalemate(color)) {
            return 0;
        }

        let moves = this.getAllMoves(color);
        moves = this.orderMoves(moves);

        if (isMaximizing) {
            let maxEval = -Infinity;
            for (const move of moves) {
                const state = this.chess.getState();
                this.chess.makeMove(move.fromRow, move.fromCol, move.toRow, move.toCol);
                const evalScore = this.minimax(depth - 1, alpha, beta, false);
                this.chess.loadState(state);
                this.chess.currentTurn = color;
                maxEval = Math.max(maxEval, evalScore);
                alpha = Math.max(alpha, evalScore);
                if (beta <= alpha) break;
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (const move of moves) {
                const state = this.chess.getState();
                this.chess.makeMove(move.fromRow, move.fromCol, move.toRow, move.toCol);
                const evalScore = this.minimax(depth - 1, alpha, beta, true);
                this.chess.loadState(state);
                this.chess.currentTurn = color;
                minEval = Math.min(minEval, evalScore);
                beta = Math.min(beta, evalScore);
                if (beta <= alpha) break;
            }
            return minEval;
        }
    }

    // --- Besten Zug finden ---
    findBestMove(color) {
        this.nodesSearched = 0;
        const isMaximizing = color === COLOR.WHITE;
        let moves = this.getAllMoves(color);
        moves = this.orderMoves(moves);

        if (moves.length === 0) return null;

        if (this.errorChance > 0 && Math.random() < this.errorChance) {
            return moves[Math.floor(Math.random() * moves.length)];
        }

        let bestMove = null;
        let bestEval = isMaximizing ? -Infinity : Infinity;

        for (const move of moves) {
            const state = this.chess.getState();
            this.chess.makeMove(move.fromRow, move.fromCol, move.toRow, move.toCol);
            const evalScore = this.minimax(this.maxDepth - 1, -Infinity, Infinity, !isMaximizing);
            this.chess.loadState(state);
            this.chess.currentTurn = color;

            if (isMaximizing) {
                if (evalScore > bestEval) {
                    bestEval = evalScore;
                    bestMove = move;
                }
            } else {
                if (evalScore < bestEval) {
                    bestEval = evalScore;
                    bestMove = move;
                }
            }

            if (this.nodesSearched >= this.maxNodes) break;
        }

        return bestMove;
    }

    // --- Remis-Zug (für Übungen) ---
    findDrawMove(color) {
        this.nodesSearched = 0;
        const isMaximizing = color === COLOR.WHITE;
        let moves = this.getAllMoves(color);
        moves = this.orderMoves(moves);

        if (moves.length === 0) return null;

        let bestMove = null;
        let bestAbsEval = Infinity;

        for (const move of moves) {
            const state = this.chess.getState();
            this.chess.makeMove(move.fromRow, move.fromCol, move.toRow, move.toCol);

            const opponentColor = color === COLOR.WHITE ? COLOR.BLACK : COLOR.WHITE;
            if (this.chess.isStalemate(opponentColor)) {
                this.chess.loadState(state);
                this.chess.currentTurn = color;
                return move;
            }

            const evalScore = this.minimax(this.maxDepth - 1, -Infinity, Infinity, !isMaximizing);
            this.chess.loadState(state);
            this.chess.currentTurn = color;

            const absEval = Math.abs(evalScore);
            if (absEval < bestAbsEval) {
                bestAbsEval = absEval;
                bestMove = move;
            }
        }

        return bestMove;
    }
}
