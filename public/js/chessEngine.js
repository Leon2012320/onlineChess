// ============================================
// Schach-Engine (Minimax mit Alpha-Beta Pruning)
// ============================================

class ChessEngine {
    constructor(chess) {
        this.chess = chess;
        this.maxDepth = 2;
        this.errorChance = 0.1;
    }

    setDifficulty(level) {
        // 1-8 Schwierigkeitsstufen
        // errorChance = Wahrscheinlichkeit einen zufälligen statt besten Zug zu machen
        switch (level) {
            case 1: this.maxDepth = 1; this.errorChance = 0.5;  break; // Anfänger
            case 2: this.maxDepth = 1; this.errorChance = 0.3;  break; // Leicht
            case 3: this.maxDepth = 2; this.errorChance = 0.25; break; // Mittel-Leicht
            case 4: this.maxDepth = 2; this.errorChance = 0.1;  break; // Mittel
            case 5: this.maxDepth = 3; this.errorChance = 0.08; break; // Mittel-Stark
            case 6: this.maxDepth = 3; this.errorChance = 0.0;  break; // Stark
            case 7: this.maxDepth = 4; this.errorChance = 0.0;  break; // Sehr Stark
            case 8: this.maxDepth = 5; this.errorChance = 0.0;  break; // Meister
            default: this.maxDepth = 2; this.errorChance = 0.1;
        }
    }

    // Figurenwerte
    static PIECE_VALUES = {
        [PIECE.PAWN]: 100,
        [PIECE.KNIGHT]: 320,
        [PIECE.BISHOP]: 330,
        [PIECE.ROOK]: 500,
        [PIECE.QUEEN]: 900,
        [PIECE.KING]: 20000,
    };

    // Positionstabellen (Piece-Square Tables) für bessere Stellungsbewertung
    static PST = {
        [PIECE.PAWN]: [
            [0,  0,  0,  0,  0,  0,  0,  0],
            [50, 50, 50, 50, 50, 50, 50, 50],
            [10, 10, 20, 30, 30, 20, 10, 10],
            [5,  5, 10, 25, 25, 10,  5,  5],
            [0,  0,  0, 20, 20,  0,  0,  0],
            [5, -5,-10,  0,  0,-10, -5,  5],
            [5, 10, 10,-20,-20, 10, 10,  5],
            [0,  0,  0,  0,  0,  0,  0,  0],
        ],
        [PIECE.KNIGHT]: [
            [-50,-40,-30,-30,-30,-30,-40,-50],
            [-40,-20,  0,  0,  0,  0,-20,-40],
            [-30,  0, 10, 15, 15, 10,  0,-30],
            [-30,  5, 15, 20, 20, 15,  5,-30],
            [-30,  0, 15, 20, 20, 15,  0,-30],
            [-30,  5, 10, 15, 15, 10,  5,-30],
            [-40,-20,  0,  5,  5,  0,-20,-40],
            [-50,-40,-30,-30,-30,-30,-40,-50],
        ],
        [PIECE.BISHOP]: [
            [-20,-10,-10,-10,-10,-10,-10,-20],
            [-10,  0,  0,  0,  0,  0,  0,-10],
            [-10,  0, 10, 10, 10, 10,  0,-10],
            [-10,  5,  5, 10, 10,  5,  5,-10],
            [-10,  0,  5, 10, 10,  5,  0,-10],
            [-10,  5,  5,  5,  5,  5,  5,-10],
            [-10,  5,  0,  0,  0,  0,  5,-10],
            [-20,-10,-10,-10,-10,-10,-10,-20],
        ],
        [PIECE.ROOK]: [
            [0,  0,  0,  0,  0,  0,  0,  0],
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
            [-10,  0,  0,  0,  0,  0,  0,-10],
            [-10,  0,  5,  5,  5,  5,  0,-10],
            [-5,  0,  5,  5,  5,  5,  0, -5],
            [0,  0,  5,  5,  5,  5,  0, -5],
            [-10,  5,  5,  5,  5,  5,  0,-10],
            [-10,  0,  5,  0,  0,  0,  0,-10],
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

    // Bewertung der gesamten Stellung
    evaluate() {
        let score = 0;
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.chess.getPiece(row, col);
                if (!piece) continue;

                const value = ChessEngine.PIECE_VALUES[piece.type];
                const pst = ChessEngine.PST[piece.type];

                if (piece.color === COLOR.WHITE) {
                    score += value + pst[row][col];
                } else {
                    // Für Schwarz die Tabelle spiegeln
                    score -= value + pst[7 - row][col];
                }
            }
        }
        return score;
    }

    // Alle legalen Züge für eine Farbe generieren
    getAllMoves(color) {
        const moves = [];
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.chess.getPiece(row, col);
                if (piece && piece.color === color) {
                    const pieceMoves = this.chess.getLegalMoves(row, col);
                    for (const move of pieceMoves) {
                        moves.push({
                            fromRow: row,
                            fromCol: col,
                            toRow: move.row,
                            toCol: move.col,
                        });
                    }
                }
            }
        }
        return moves;
    }

    // Züge ordnen für besseres Pruning (Schläge zuerst)
    orderMoves(moves) {
        return moves.sort((a, b) => {
            const captureA = this.chess.getPiece(a.toRow, a.toCol);
            const captureB = this.chess.getPiece(b.toRow, b.toCol);
            const scoreA = captureA ? ChessEngine.PIECE_VALUES[captureA.type] : 0;
            const scoreB = captureB ? ChessEngine.PIECE_VALUES[captureB.type] : 0;
            return scoreB - scoreA;
        });
    }

    // Minimax mit Alpha-Beta Pruning
    minimax(depth, alpha, beta, isMaximizing) {
        if (depth === 0) {
            return this.evaluate();
        }

        const color = isMaximizing ? COLOR.WHITE : COLOR.BLACK;

        // Schachmatt / Patt prüfen
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

    // Besten Zug finden
    findBestMove(color) {
        const isMaximizing = color === COLOR.WHITE;
        let moves = this.getAllMoves(color);
        moves = this.orderMoves(moves);

        if (moves.length === 0) return null;

        // Zufälligen Zug bei errorChance
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
        }

        return bestMove;
    }

    // Zug finden der Remis anstrebt (Bewertung möglichst nahe 0)
    findDrawMove(color) {
        const isMaximizing = color === COLOR.WHITE;
        let moves = this.getAllMoves(color);
        moves = this.orderMoves(moves);

        if (moves.length === 0) return null;

        let bestMove = null;
        let bestAbsEval = Infinity;

        for (const move of moves) {
            const state = this.chess.getState();
            this.chess.makeMove(move.fromRow, move.fromCol, move.toRow, move.toCol);

            // Patt ist ein Remis — bevorzugen
            const opponentColor = color === COLOR.WHITE ? COLOR.BLACK : COLOR.WHITE;
            if (this.chess.isStalemate(opponentColor)) {
                this.chess.loadState(state);
                this.chess.currentTurn = color;
                return move;
            }

            const evalScore = this.minimax(this.maxDepth - 1, -Infinity, Infinity, !isMaximizing);
            this.chess.loadState(state);
            this.chess.currentTurn = color;

            // Zug wählen dessen Bewertung am nächsten an 0 liegt
            const absEval = Math.abs(evalScore);
            if (absEval < bestAbsEval) {
                bestAbsEval = absEval;
                bestMove = move;
            }
        }

        return bestMove;
    }
}
