// ============================================
// Training Scene - Lokale Puzzles
// ============================================

class TrainingScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TrainingScene' });
    }

    init(data) {
        data = data || {};
        this.puzzleCategoryId = data.category || 'mateIn1';
        this.difficulty = data.difficulty || 'all';
        this.gameMode = data.gameMode || 'normal';
        this.puzzleIndex = 0;

        // Storm
        this.stormScore = 0;
        this.stormTimeLeft = 180; // 3 Minuten
        this.stormActive = false;
        this.stormTimer = null;

        // Streak
        this.streakScore = 0;
        this.streakActive = false;
        this.streakFailed = false;

        // Prepared puzzle list for storm/streak
        this.puzzleList = null;
    }

    create() {
        this.chess = new ChessLogic();
        this.selectedTile = null;
        this.legalMoveIndicators = [];
        this.pieceSprites = [];
        this.tileGraphics = [];
        this.coordLabels = [];
        this.puzzleSolved = false;
        this.solutionMoves = [];
        this.solutionIndex = 0;
        this.playerColor = null;
        this.flipped = false;
        this.loading = false;

        this._createWoodTileTextures();
        this.drawBoard();
        this._setupInput();

        // Build puzzle list for storm/streak
        if (this.gameMode === 'storm' || this.gameMode === 'streak') {
            this.puzzleList = this._buildPuzzleList();
        }

        this._fetchPuzzle();

        // Start storm timer
        if (this.gameMode === 'storm') {
            this.stormActive = true;
            this.stormTimer = this.time.addEvent({
                delay: 1000,
                callback: this._stormTick,
                callbackScope: this,
                loop: true
            });
        }
        if (this.gameMode === 'streak') {
            this.streakActive = true;
        }
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

    // ---- Koordinaten-Umrechnung (flipped) ----
    _viewRow(boardRow) { return this.flipped ? 7 - boardRow : boardRow; }
    _viewCol(boardCol) { return this.flipped ? 7 - boardCol : boardCol; }
    _boardRow(viewRow) { return this.flipped ? 7 - viewRow : viewRow; }
    _boardCol(viewCol) { return this.flipped ? 7 - viewCol : viewCol; }

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
    }

    _drawCoordLabels() {
        this.coordLabels.forEach(l => l.destroy());
        this.coordLabels = [];
        const files = ['a','b','c','d','e','f','g','h'];
        for (let i = 0; i < 8; i++) {
            const fileIdx = this.flipped ? 7 - i : i;
            const rankNum = this.flipped ? i + 1 : 8 - i;
            const fl = this.add.text(BOARD_OFFSET_X + i * TILE_SIZE + TILE_SIZE / 2, BOARD_OFFSET_Y + BOARD_SIZE * TILE_SIZE + 8, files[fileIdx], { fontSize: '14px', color: '#c4a265', fontFamily: 'serif' }).setOrigin(0.5, 0);
            const rl = this.add.text(BOARD_OFFSET_X - 20, BOARD_OFFSET_Y + i * TILE_SIZE + TILE_SIZE / 2, String(rankNum), { fontSize: '14px', color: '#c4a265', fontFamily: 'serif' }).setOrigin(0.5);
            this.coordLabels.push(fl, rl);
        }
    }

    // ---- Figuren ----
    drawPieces() {
        this.pieceSprites.forEach(s => s.destroy());
        this.pieceSprites = [];
        for (let boardRow = 0; boardRow < BOARD_SIZE; boardRow++) {
            for (let boardCol = 0; boardCol < BOARD_SIZE; boardCol++) {
                const piece = this.chess.getPiece(boardRow, boardCol);
                if (piece) {
                    const vr = this._viewRow(boardRow);
                    const vc = this._viewCol(boardCol);
                    const x = BOARD_OFFSET_X + vc * TILE_SIZE + TILE_SIZE / 2;
                    const y = BOARD_OFFSET_Y + vr * TILE_SIZE + TILE_SIZE / 2;
                    const key = `${piece.color}_${piece.type}`;
                    const sprite = this.add.image(x, y, key);
                    this.pieceSprites.push(sprite);
                }
            }
        }
    }

    // ---- Puzzle aus lokaler Datenbank laden ----
    _getFilteredPuzzles() {
        const allPuzzles = PUZZLE_DB[this.puzzleCategoryId];
        if (!allPuzzles || allPuzzles.length === 0) return [];

        const ratingRanges = { easy: [0, 1000], medium: [1000, 1500], hard: [1500, 2000], expert: [2000, 9999] };
        let puzzles = allPuzzles;
        if (this.difficulty !== 'all' && ratingRanges[this.difficulty]) {
            const [minR, maxR] = ratingRanges[this.difficulty];
            puzzles = allPuzzles.filter(p => p.rating >= minR && p.rating < maxR);
            if (puzzles.length === 0) puzzles = allPuzzles;
        }
        return puzzles;
    }

    _buildPuzzleList() {
        // Collect puzzles from ALL categories for Storm/Streak
        let all = [];
        for (const cat of Object.keys(PUZZLE_DB)) {
            all = all.concat(PUZZLE_DB[cat]);
        }

        // Apply difficulty filter for Storm
        if (this.gameMode === 'storm' && this.difficulty !== 'all') {
            const ratingRanges = { easy: [0, 1000], medium: [1000, 1500], hard: [1500, 2000], expert: [2000, 9999] };
            if (ratingRanges[this.difficulty]) {
                const [minR, maxR] = ratingRanges[this.difficulty];
                const filtered = all.filter(p => p.rating >= minR && p.rating < maxR);
                if (filtered.length > 0) all = filtered;
            }
        }

        if (this.gameMode === 'streak') {
            // Sort by rating ascending for progressive difficulty
            all.sort((a, b) => a.rating - b.rating);
        } else {
            // Shuffle for Storm
            for (let i = all.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [all[i], all[j]] = [all[j], all[i]];
            }
        }
        return all;
    }

    _fetchPuzzle() {
        this.loading = true;
        this.puzzleSolved = false;

        let puzzle;

        if (this.puzzleList) {
            // Storm/Streak: use prepared list
            if (this.puzzleList.length === 0) {
                document.getElementById('status').textContent = 'Keine Puzzles verfügbar.';
                this.loading = false;
                return;
            }
            puzzle = this.puzzleList[this.puzzleIndex % this.puzzleList.length];
            this.puzzleIndex++;
        } else {
            // Normal mode
            const puzzles = this._getFilteredPuzzles();
            if (puzzles.length === 0) {
                document.getElementById('status').textContent = 'Keine Puzzles für diese Kategorie.';
                this.loading = false;
                return;
            }
            puzzle = puzzles[this.puzzleIndex % puzzles.length];
            this.puzzleIndex++;
        }

        // FEN laden (Stellung VOR dem Gegnerzug)
        this.chess.loadFen(puzzle.fen);

        // Gegnerzug ausführen (moves[0])
        const setupMove = puzzle.moves[0];
        this.chess.makeUciMove(setupMove);

        // Spielerfarbe = wer nach dem Gegnerzug am Zug ist
        this.playerColor = this.chess.currentTurn;
        this.flipped = (this.playerColor === COLOR.BLACK);

        // Lösung = restliche Züge
        this.solutionMoves = puzzle.moves.slice(1);
        this.solutionIndex = 0;
        this.puzzleRating = puzzle.rating;
        this.puzzleId = this.puzzleIndex;

        this.loading = false;
        this.selectedTile = null;

        // Koordinaten und Brett aktualisieren
        this._drawCoordLabels();
        this.clearHighlights();

        // Gegnerzug (Setup) hervorheben
        const fCol = setupMove.charCodeAt(0) - 97;
        const fRow = 8 - parseInt(setupMove[1]);
        const tCol = setupMove.charCodeAt(2) - 97;
        const tRow = 8 - parseInt(setupMove[3]);
        this._setBoardOverlay(fRow, fCol, COLORS.LAST_MOVE, 0.35);
        this._setBoardOverlay(tRow, tCol, COLORS.LAST_MOVE, 0.35);

        this.drawPieces();
        this._updateUI();
    }

    // Letzten SAN-Zug hervorheben (ungefähr - wir kennen nur die Zielfelder)
    _highlightLastSanMove(san) {
        let s = san.replace(/[+#!?]/g, '');
        if (s === 'O-O' || s === 'O-O-O') return;
        s = s.replace(/=[QRBN]/g, '');
        s = s.replace('x', '');
        const target = s.slice(-2);
        if (target.length === 2) {
            const toCol = target.charCodeAt(0) - 97;
            const toRow = 8 - parseInt(target[1]);
            const vc = this._viewCol(toCol);
            const vr = this._viewRow(toRow);
            this._setViewOverlay(vr, vc, COLORS.LAST_MOVE, 0.35);
        }
    }

    // ---- SAN-Zug abspielen ----
    _playSanMove(san) {
        let s = san.replace(/[+#!?]/g, '');

        // Rochade
        if (s === 'O-O' || s === 'O-O-O') {
            const row = this.chess.currentTurn === COLOR.WHITE ? 7 : 0;
            const targetCol = s === 'O-O' ? 6 : 2;
            return !!this.chess.makeMove(row, 4, row, targetCol);
        }

        let promotion = null;
        if (s.includes('=')) {
            const parts = s.split('=');
            s = parts[0];
            const promoMap = { 'Q': PIECE.QUEEN, 'R': PIECE.ROOK, 'B': PIECE.BISHOP, 'N': PIECE.KNIGHT };
            promotion = promoMap[parts[1]] || PIECE.QUEEN;
        }

        s = s.replace('x', '');

        // Zielfeld (letzte 2 Zeichen)
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

        // Disambiguierung
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
        const rating = this.puzzleRating || '?';
        const colorText = this.playerColor === COLOR.BLACK ? 'Schwarz' : 'Weiß';
        const titleEl = document.getElementById('puzzle-title');
        const hintEl = document.getElementById('puzzle-hint');
        const progressEl = document.getElementById('puzzle-progress');

        if (this.gameMode === 'storm') {
            if (this.puzzleSolved && this.stormActive) {
                document.getElementById('status').textContent = '✓ Richtig!';
            } else if (!this.loading && this.stormActive) {
                document.getElementById('status').textContent = `Rating: ${rating} — Dein Zug`;
            }
            if (titleEl) titleEl.textContent = '';
            if (hintEl) hintEl.textContent = '';
            if (progressEl) progressEl.textContent = '';
            this._updateHUD();
            return;
        }

        if (this.gameMode === 'streak') {
            if (this.puzzleSolved && this.streakActive) {
                document.getElementById('status').textContent = '✓ Richtig!';
            } else if (!this.loading && this.streakActive) {
                document.getElementById('status').textContent = `Rating: ${rating} — Dein Zug`;
            }
            if (titleEl) titleEl.textContent = '';
            if (hintEl) hintEl.textContent = '';
            if (progressEl) progressEl.textContent = '';
            this._updateHUD();
            return;
        }

        // Normal mode
        const cat = PUZZLE_CATEGORIES.find(c => c.id === this.puzzleCategoryId);
        const catName = cat ? cat.name : 'Puzzle';

        if (this.puzzleSolved) {
            document.getElementById('status').textContent = '✓ Richtig! Gut gemacht!';
        } else if (!this.loading) {
            document.getElementById('status').textContent = `${catName} (${colorText}) — Rating: ${rating} — Dein Zug`;
        }

        if (titleEl) titleEl.textContent = this.puzzleId ? `Puzzle #${this.puzzleId}` : '';
        if (hintEl) hintEl.textContent = '';
        if (progressEl) {
            const remaining = this.solutionMoves ? Math.ceil((this.solutionMoves.length - this.solutionIndex) / 2) : 0;
            progressEl.textContent = this.puzzleSolved ? '' : `Noch ${remaining} Zug/Züge`;
        }
    }

    // ---- Storm/Streak HUD ----
    _updateHUD() {
        const hudEl = document.getElementById('storm-streak-hud');
        if (!hudEl) return;

        if (this.gameMode === 'storm') {
            const min = Math.floor(this.stormTimeLeft / 60);
            const sec = this.stormTimeLeft % 60;
            const timeStr = `${min}:${sec.toString().padStart(2, '0')}`;
            const timeClass = this.stormTimeLeft <= 30 ? 'hud-timer' : 'hud-score';
            hudEl.innerHTML = `⚡ Storm &nbsp;|&nbsp; <span class="${timeClass}">⏱ ${timeStr}</span> &nbsp;|&nbsp; <span class="hud-score">Gelöst: ${this.stormScore}</span>`;
        } else if (this.gameMode === 'streak') {
            hudEl.innerHTML = `🔥 Streak &nbsp;|&nbsp; <span class="hud-score">Serie: ${this.streakScore}</span> &nbsp;|&nbsp; Rating: ${this.puzzleRating || '?'}`;
        } else {
            hudEl.textContent = '';
        }
    }

    // ---- Storm Timer ----
    _stormTick() {
        if (!this.stormActive) return;
        this.stormTimeLeft--;
        this._updateHUD();
        if (this.stormTimeLeft <= 0) {
            this._endStorm();
        }
    }

    _endStorm() {
        this.stormActive = false;
        this.puzzleSolved = true;
        if (this.stormTimer) this.stormTimer.remove();
        document.getElementById('status').textContent = `⚡ Storm beendet!`;
        const hudEl = document.getElementById('storm-streak-hud');
        if (hudEl) hudEl.innerHTML = `⚡ <span class="hud-score">Ergebnis: ${this.stormScore} Puzzles gelöst!</span>`;
        document.getElementById('puzzle-progress').textContent = '';
    }

    _endStreak() {
        this.streakActive = false;
        this.streakFailed = true;
        this.puzzleSolved = true;
        document.getElementById('status').textContent = `🔥 Streak beendet!`;
        const hudEl = document.getElementById('storm-streak-hud');
        if (hudEl) hudEl.innerHTML = `🔥 <span class="hud-score">Ergebnis: ${this.streakScore} Puzzles in Folge!</span>`;
        document.getElementById('puzzle-progress').textContent = '';
    }

    // ---- Eingabe ----
    _setupInput() {
        this.input.on('pointerdown', (pointer) => {
            // View-Koordinaten
            const viewCol = Math.floor((pointer.x - BOARD_OFFSET_X) / TILE_SIZE);
            const viewRow = Math.floor((pointer.y - BOARD_OFFSET_Y) / TILE_SIZE);
            if (viewRow < 0 || viewRow > 7 || viewCol < 0 || viewCol > 7) return;
            // In Board-Koordinaten umrechnen
            const boardRow = this._boardRow(viewRow);
            const boardCol = this._boardCol(viewCol);
            this._handleClick(boardRow, boardCol);
        });
    }

    _handleClick(row, col) {
        if (this.puzzleSolved || this.loading) return;
        if (this.chess.currentTurn !== this.playerColor) return;

        // Storm/Streak ended
        if (this.gameMode === 'storm' && !this.stormActive) return;
        if (this.gameMode === 'streak' && this.streakFailed) return;

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
                    this._setBoardOverlay(from.row, from.col, 0x66cc66, 0.4);
                    this._setBoardOverlay(row, col, 0x66cc66, 0.4);
                    this.drawPieces();
                    this.selectedTile = null;

                    // Prüfe ob Puzzle gelöst
                    if (this.solutionIndex >= this.solutionMoves.length) {
                        this._onPuzzleSolved();
                        return;
                    }

                    // Gegnerzug abspielen
                    this.time.delayedCall(500, () => this._playOpponentResponse());
                }
            } else {
                // Falscher Zug
                const vr = this._viewRow(row);
                const vc = this._viewCol(col);
                this._setViewOverlay(vr, vc, COLORS.CHECK, 0.5);
                this.time.delayedCall(500, () => this.clearHighlights());
                this.selectedTile = null;
                this.clearMoveIndicators();

                if (this.gameMode === 'storm') {
                    // Zeitstrafe: -10 Sekunden
                    this.stormTimeLeft = Math.max(0, this.stormTimeLeft - 10);
                    document.getElementById('status').textContent = '✗ Falsch! -10 Sekunden';
                    this._updateHUD();
                    if (this.stormTimeLeft <= 0) {
                        this._endStorm();
                    }
                } else if (this.gameMode === 'streak') {
                    // Streak beendet
                    this._endStreak();
                } else {
                    document.getElementById('status').textContent = 'Falscher Zug! Versuche es erneut.';
                }
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

    _playOpponentResponse() {
        if (this.solutionIndex >= this.solutionMoves.length) return;
        const opponentUci = this.solutionMoves[this.solutionIndex];
        this.chess.makeUciMove(opponentUci);
        this.solutionIndex++;
        this.clearHighlights();

        // Gegnerzug hervorheben
        const fCol = opponentUci.charCodeAt(0) - 97;
        const fRow = 8 - parseInt(opponentUci[1]);
        const tCol = opponentUci.charCodeAt(2) - 97;
        const tRow = 8 - parseInt(opponentUci[3]);
        this._setBoardOverlay(fRow, fCol, COLORS.LAST_MOVE, 0.35);
        this._setBoardOverlay(tRow, tCol, COLORS.LAST_MOVE, 0.35);
        this.drawPieces();
        this._updateUI();

        if (this.solutionIndex >= this.solutionMoves.length) {
            this._onPuzzleSolved();
        }
    }

    _toUci(fromRow, fromCol, toRow, toCol) {
        return String.fromCharCode(97 + fromCol) + (8 - fromRow) +
               String.fromCharCode(97 + toCol) + (8 - toRow);
    }

    _onPuzzleSolved() {
        this.puzzleSolved = true;

        if (this.gameMode === 'storm') {
            this.stormScore++;
            this._updateHUD();
            this._updateUI();
            // Schnell weiter (400ms)
            this.time.delayedCall(400, () => {
                if (this.stormActive) this._fetchPuzzle();
            });
            return;
        }

        if (this.gameMode === 'streak') {
            this.streakScore++;
            this._updateHUD();
            this._updateUI();
            // Schnell weiter (400ms)
            this.time.delayedCall(400, () => {
                if (this.streakActive) this._fetchPuzzle();
            });
            return;
        }

        this._updateUI();
        this.time.delayedCall(2000, () => this._fetchPuzzle());
    }

    // ---- Selektion (Board-Koordinaten) ----
    _selectTile(row, col) {
        this.clearHighlights();
        this.clearMoveIndicators();
        this.selectedTile = { row, col };
        this._setBoardOverlay(row, col, COLORS.SELECTED, 0.45);

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
    }

    // ---- Highlights ----
    // Board-Koordinaten -> View-Overlay
    _setBoardOverlay(boardRow, boardCol, color, alpha) {
        const vr = this._viewRow(boardRow);
        const vc = this._viewCol(boardCol);
        this._setViewOverlay(vr, vc, color, alpha);
    }

    // View-Koordinaten -> Overlay
    _setViewOverlay(viewRow, viewCol, color, alpha) {
        const tile = this.tileGraphics[viewRow] && this.tileGraphics[viewRow][viewCol];
        if (tile && tile._overlay) {
            tile._overlay.setFillStyle(color, alpha);
        }
    }

    clearHighlights() {
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                this._setViewOverlay(r, c, 0x000000, 0);
            }
        }
    }

    clearMoveIndicators() {
        this.legalMoveIndicators.forEach(i => i.destroy());
        this.legalMoveIndicators = [];
    }
}
