// ============================================
// Training Scene - Lichess Puzzles
// ============================================

class TrainingScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TrainingScene' });
    }

    init(data) {
        data = data || {};
        this.puzzleAngle = data.angle || 'mateIn1';
        this.puzzleCategoryId = data.category || 'mateIn1';
    }

    create() {
        this.chess = new ChessLogic();
        this.selectedTile = null;
        this.legalMoveIndicators = [];
        this.pieceSprites = [];
        this.tileGraphics = [];
        this.puzzleSolved = false;
        this.solutionMoves = [];
        this.solutionIndex = 0;
        this.playerColor = null;
        this.loading = false;

        this._createWoodTileTextures();
        this.drawBoard();
        this._setupInput();
        this._fetchPuzzle();
    }

    // ---- Holz-Texturen ----
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

    // ---- Puzzle von Lichess laden ----
    async _fetchPuzzle() {
        this.loading = true;
        document.getElementById('status').textContent = 'Puzzle wird geladen...';

        try {
            const url = 'https://lichess.org/api/puzzle/next?angle=' + encodeURIComponent(this.puzzleAngle);
            const resp = await fetch(url, { headers: { 'Accept': 'application/json' } });
            if (!resp.ok) throw new Error('API Fehler: ' + resp.status);
            const data = await resp.json();

            // PGN abspielen bis zum initialPly um die Puzzle-Position zu bekommen
            this.chess.reset();
            const pgn = data.game.pgn;
            const pgnMoves = pgn.split(/\s+/).filter(m => m && !m.match(/^\d+\./) && m !== '*');
            const initialPly = data.puzzle.initialPly;

            // Alle PGN-Züge bis zum initialPly abspielen
            for (let i = 0; i < initialPly && i < pgnMoves.length; i++) {
                const success = this._playSanMove(pgnMoves[i]);
                if (!success) {
                    throw new Error('Konnte PGN-Zug nicht abspielen: ' + pgnMoves[i] + ' bei Ply ' + i);
                }
            }

            // solution enthält UCI-Züge, der erste ist der Gegnerzug
            this.solutionMoves = data.puzzle.solution;
            this.solutionIndex = 0;
            this.puzzleRating = data.puzzle.rating;
            this.puzzleId = data.puzzle.id;
            this.puzzleSolved = false;

            // Erster Zug der Solution = Gegnerzug (die Stellung vor dem Puzzle)
            const opponentUci = this.solutionMoves[0];
            this.chess.makeUciMove(opponentUci);
            this.solutionIndex = 1;

            // Spielerfarbe bestimmen (Spieler ist am Zug nach dem Gegnerzug)
            this.playerColor = this.chess.currentTurn;

            this.loading = false;
            this.clearHighlights();
            this.drawPieces();

            // Gegnerzug hervorheben
            const fromCol = opponentUci.charCodeAt(0) - 97;
            const fromRow = 8 - parseInt(opponentUci[1]);
            const toCol = opponentUci.charCodeAt(2) - 97;
            const toRow = 8 - parseInt(opponentUci[3]);
            this._setTileOverlay(fromRow, fromCol, COLORS.LAST_MOVE, 0.35);
            this._setTileOverlay(toRow, toCol, COLORS.LAST_MOVE, 0.35);

            this._updateUI();
        } catch (err) {
            this.loading = false;
            document.getElementById('status').textContent = 'Fehler beim Laden: ' + err.message;
        }
    }

    // ---- SAN-Zug abspielen (mit eigenem ChessLogic) ----
    _playSanMove(san) {
        // SAN parsen: z.B. "Nf3", "e4", "Bxe5", "O-O", "Qd1+", "exd5", "e8=Q"
        let s = san.replace(/[+#!?]/g, ''); // Schach/Matt-Symbole entfernen

        // Rochade
        if (s === 'O-O' || s === 'O-O-O') {
            const row = this.chess.currentTurn === COLOR.WHITE ? 7 : 0;
            const kingCol = 4;
            const targetCol = s === 'O-O' ? 6 : 2;
            return !!this.chess.makeMove(row, kingCol, row, targetCol);
        }

        let promotion = null;
        if (s.includes('=')) {
            const parts = s.split('=');
            s = parts[0];
            const promoMap = { 'Q': PIECE.QUEEN, 'R': PIECE.ROOK, 'B': PIECE.BISHOP, 'N': PIECE.KNIGHT };
            promotion = promoMap[parts[1]] || PIECE.QUEEN;
        }

        const isCapture = s.includes('x');
        s = s.replace('x', '');

        // Zielfeld (immer letzte 2 Zeichen)
        const targetSquare = s.slice(-2);
        const toCol = targetSquare.charCodeAt(0) - 97;
        const toRow = 8 - parseInt(targetSquare[1]);

        s = s.slice(0, -2);

        // Figurkürzel
        let pieceType = PIECE.PAWN;
        const pieceMap = { 'K': PIECE.KING, 'Q': PIECE.QUEEN, 'R': PIECE.ROOK, 'B': PIECE.BISHOP, 'N': PIECE.KNIGHT };
        if (s.length > 0 && pieceMap[s[0]]) {
            pieceType = pieceMap[s[0]];
            s = s.slice(1);
        }

        // Disambiguierung (Spalte, Reihe, oder beides)
        let disambigCol = -1, disambigRow = -1;
        for (const ch of s) {
            if (ch >= 'a' && ch <= 'h') disambigCol = ch.charCodeAt(0) - 97;
            else if (ch >= '1' && ch <= '8') disambigRow = 8 - parseInt(ch);
        }

        // Passende Figur finden
        const turn = this.chess.currentTurn;
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const p = this.chess.getPiece(r, c);
                if (!p || p.color !== turn || p.type !== pieceType) continue;
                if (disambigCol >= 0 && c !== disambigCol) continue;
                if (disambigRow >= 0 && r !== disambigRow) continue;

                const moves = this.chess.getLegalMoves(r, c);
                const match = moves.find(m => m.row === toRow && m.col === toCol);
                if (match) {
                    const result = this.chess.makeMove(r, c, toRow, toCol);
                    if (result && promotion) {
                        this.chess.board[toRow][toCol] = { color: turn, type: promotion };
                    }
                    return !!result;
                }
            }
        }
        return false;
    }

    // ---- UI ----
    _updateUI() {
        const cat = PUZZLE_CATEGORIES.find(c => c.id === this.puzzleCategoryId);
        const catName = cat ? cat.name : 'Puzzle';
        const rating = this.puzzleRating || '?';

        if (this.puzzleSolved) {
            document.getElementById('status').textContent = '✓ Richtig! Gut gemacht!';
        } else if (!this.loading) {
            document.getElementById('status').textContent = `${catName} — Rating: ${rating} — Dein Zug`;
        }

        const titleEl = document.getElementById('puzzle-title');
        if (titleEl) titleEl.textContent = this.puzzleId ? `Puzzle #${this.puzzleId}` : '';

        const hintEl = document.getElementById('puzzle-hint');
        if (hintEl) hintEl.textContent = '';

        const progressEl = document.getElementById('puzzle-progress');
        if (progressEl) {
            const remaining = this.solutionMoves ? Math.ceil((this.solutionMoves.length - this.solutionIndex) / 2) : 0;
            progressEl.textContent = this.puzzleSolved ? '' : `Noch ${remaining} Zug/Züge`;
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
        if (this.puzzleSolved || this.loading) return;
        if (this.chess.currentTurn !== this.playerColor) return;

        if (this.selectedTile) {
            const from = this.selectedTile;
            // Prüfe ob der Spielerzug dem nächsten Solution-Zug entspricht
            const expectedUci = this.solutionMoves[this.solutionIndex];
            const playerUci = this._toUci(from.row, from.col, row, col);

            // Auch Bauernumwandlung prüfen (UCI mit 5 Zeichen)
            if (playerUci === expectedUci || playerUci === expectedUci.substring(0, 4)) {
                const result = this.chess.makeUciMove(expectedUci);
                if (result) {
                    this.solutionIndex++;
                    this.clearHighlights();
                    this.clearMoveIndicators();
                    this._setTileOverlay(from.row, from.col, 0x66cc66, 0.4);
                    this._setTileOverlay(row, col, 0x66cc66, 0.4);
                    this.drawPieces();
                    this.selectedTile = null;

                    // Prüfe ob Puzzle gelöst
                    if (this.solutionIndex >= this.solutionMoves.length) {
                        this._onPuzzleSolved();
                        return;
                    }

                    // Gegnerzug abspielen
                    this.time.delayedCall(500, () => {
                        const opponentUci = this.solutionMoves[this.solutionIndex];
                        this.chess.makeUciMove(opponentUci);
                        this.solutionIndex++;
                        this.clearHighlights();
                        const fCol = opponentUci.charCodeAt(0) - 97;
                        const fRow = 8 - parseInt(opponentUci[1]);
                        const tCol = opponentUci.charCodeAt(2) - 97;
                        const tRow = 8 - parseInt(opponentUci[3]);
                        this._setTileOverlay(fRow, fCol, COLORS.LAST_MOVE, 0.35);
                        this._setTileOverlay(tRow, tCol, COLORS.LAST_MOVE, 0.35);
                        this.drawPieces();
                        this._updateUI();

                        if (this.solutionIndex >= this.solutionMoves.length) {
                            this._onPuzzleSolved();
                        }
                    });
                }
            } else {
                // Falscher Zug
                this._setTileOverlay(row, col, COLORS.CHECK, 0.5);
                this.time.delayedCall(500, () => this.clearHighlights());
                this.selectedTile = null;
                this.clearMoveIndicators();
                document.getElementById('status').textContent = 'Falscher Zug! Versuche es erneut.';
            }
            this.selectedTile = null;
            this.clearMoveIndicators();
        } else {
            const piece = this.chess.getPiece(row, col);
            if (piece && piece.color === this.playerColor) {
                this._selectTile(row, col);
            }
        }
    }

    _toUci(fromRow, fromCol, toRow, toCol) {
        return String.fromCharCode(97 + fromCol) + (8 - fromRow) +
               String.fromCharCode(97 + toCol) + (8 - toRow);
    }

    _onPuzzleSolved() {
        this.puzzleSolved = true;
        this._updateUI();

        // Nächstes Puzzle nach 2s laden
        this.time.delayedCall(2000, () => {
            this._fetchPuzzle();
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
}
