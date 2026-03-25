// ============================================
// Puzzle- & Übungs-Datenbank
// Übungen: Feste FEN-Positionen, Gegner spielt zufällig
// Puzzles: Lokale FEN-Positionen mit Lösungszügen
// ============================================

// ---- Übungen (feste Positionen) ----
const EXERCISES = [
    {
        category: 'matt-dame',
        title: 'Matt mit Dame',
        description: 'Setze den König mit Dame und König matt. Der Gegner spielt zufällige Züge.',
        fen: '8/8/3k4/8/4K3/4Q3/8/8 w - - 0 1',
        playerColor: 'white',
    },
    {
        category: 'matt-tuerme',
        title: 'Matt mit 2 Türmen',
        description: 'Setze den König mit zwei Türmen matt (Treppenmatt). Der Gegner spielt zufällige Züge.',
        fen: '8/8/3k4/8/4K3/4R3/4R3/8 w - - 0 1',
        playerColor: 'white',
    },
    {
        category: 'matt-turm',
        title: 'Matt mit Turm',
        description: 'Setze den König mit König und Turm matt. Der Gegner spielt zufällige Züge.',
        fen: '8/8/3k4/8/4K3/4R3/8/8 w - - 0 1',
        playerColor: 'white',
    },
];

// ---- Kategorien ----
const EXERCISE_CATEGORIES = [
    { id: 'matt-dame', name: 'Matt mit Dame', icon: '\u2655', type: 'uebung' },
    { id: 'matt-tuerme', name: 'Matt mit 2 Türmen', icon: '\u2656\u2656', type: 'uebung' },
    { id: 'matt-turm', name: 'Matt mit Turm', icon: '\u2656', type: 'uebung' },
];

const PUZZLE_CATEGORIES = [
    { id: 'mateIn1', name: 'Matt in 1 Zug', icon: '1\u2658', type: 'puzzle' },
    { id: 'mateIn2', name: 'Matt in 2 Zügen', icon: '2\u2658', type: 'puzzle' },
    { id: 'fork', name: 'Gabel', icon: '\u2658', type: 'puzzle' },
    { id: 'pin', name: 'Fesselung', icon: '\u2657', type: 'puzzle' },
    { id: 'skewer', name: 'Spieß', icon: '\u2656', type: 'puzzle' },
    { id: 'endgame', name: 'Endspiele', icon: '\u2659', type: 'puzzle' },
];

const ALL_CATEGORIES = [...EXERCISE_CATEGORIES, ...PUZZLE_CATEGORIES];

// ============================================
// Lokale Puzzle-Datenbank (FEN + Lösung)
// Format: { fen, solution: [UCI-Züge], rating, playerColor }
// solution[0] = Spielerzug, solution[1] = Gegnerzug,
// solution[2] = Spielerzug, usw.
// ============================================
const PUZZLE_DB = {
    mateIn1: [
        // --- Back-Rank Mates ---
        { fen: '6k1/5ppp/8/8/8/8/8/R3K3 w - - 0 1', solution: ['a1a8'], rating: 600, playerColor: 'white' },
        { fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4', solution: ['h5f7'], rating: 700, playerColor: 'white' },
        { fen: '5rk1/5ppp/8/8/8/4Q3/8/6K1 w - - 0 1', solution: ['e3e8'], rating: 650, playerColor: 'white' },
        { fen: '3qk3/3ppp2/8/8/8/5B2/8/3QK3 w - - 0 1', solution: ['d1d3'], rating: 800, playerColor: 'white' },
        { fen: 'rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR b KQkq - 0 3', solution: ['h4e1'], rating: 600, playerColor: 'black' },
        // --- Queen Mates ---
        { fen: '1k6/pp6/8/8/8/8/1Q6/K7 w - - 0 1', solution: ['b2b7'], rating: 650, playerColor: 'white' },
        { fen: 'k7/8/1K6/8/8/8/8/1Q6 w - - 0 1', solution: ['b1a2'], rating: 700, playerColor: 'white' },
        { fen: '5r1k/6pp/7N/8/8/8/8/4K2R w - - 0 1', solution: ['h1h3'], rating: 750, playerColor: 'white' },
        { fen: 'r1bqk2r/ppppnppp/2n5/2b1p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 4 4', solution: ['f3f7'], rating: 800, playerColor: 'white' },
        { fen: '6k1/pp3ppp/8/8/8/8/PP2QPPP/6K1 w - - 0 1', solution: ['e2e8'], rating: 600, playerColor: 'white' },
        // --- Rook Mates ---
        { fen: '4k3/8/4K3/8/8/8/8/4R3 w - - 0 1', solution: ['e1e2'], rating: 900, playerColor: 'white' },
        { fen: '6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1', solution: ['e1e8'], rating: 650, playerColor: 'white' },
        { fen: 'R7/4kp2/5N2/4P3/8/8/8/6K1 w - - 0 1', solution: ['a8e8'], rating: 850, playerColor: 'white' },
        { fen: '5rk1/pp3ppp/8/3r4/8/1P6/P4PPP/3R2K1 b - - 0 1', solution: ['d5d1'], rating: 700, playerColor: 'black' },
        { fen: '2kr4/ppp2ppp/8/8/8/8/PPPQ1PPP/2KR4 w - - 0 1', solution: ['d2d8'], rating: 650, playerColor: 'white' },
        // --- Knight & Bishop Mates ---
        { fen: '5rk1/5p1p/8/8/8/5N2/5PPP/6K1 w - - 0 1', solution: ['f3e5'], rating: 950, playerColor: 'white' },
        { fen: 'r4rk1/ppp2ppp/8/8/3n4/5N2/PPP2PPP/R4RK1 b - - 0 1', solution: ['d4e2'], rating: 850, playerColor: 'black' },
        { fen: '6k1/5ppp/8/3B4/8/8/5PPP/6K1 w - - 0 1', solution: ['d5f7'], rating: 750, playerColor: 'white' },
        { fen: 'r1bqkbnr/pppppppp/2n5/8/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq - 0 3', solution: ['c6d4'], rating: 900, playerColor: 'black' },
        { fen: '2r3k1/5ppp/8/8/2B5/8/5PPP/6K1 w - - 0 1', solution: ['c4f7'], rating: 800, playerColor: 'white' },
    ],
    mateIn2: [
        // --- Queen Sacrifices ---
        { fen: 'r2qkb1r/pp2nppp/3p4/2pNN1B1/2BnP3/3P4/PPP2PPP/R2bK2R w KQkq - 0 1', solution: ['d5f6', 'g7f6', 'g5f6'], rating: 1200, playerColor: 'white' },
        { fen: '1rbq1rk1/p1b1nppp/1p2p3/8/1B1pN3/P2B4/1P3PPP/2RQ1R1K w - - 0 1', solution: ['e4f6', 'g7f6', 'd3h7'], rating: 1300, playerColor: 'white' },
        { fen: 'r1b1k2r/ppppnppp/2n2q2/2b5/3NP3/2P1B3/PP3PPP/RN1QKB1R w KQkq - 0 1', solution: ['d4f5', 'f6b2', 'f5d6'], rating: 1100, playerColor: 'white' },
        { fen: '2bqkbn1/2pppp2/np2N3/8/3P4/8/PPP2PPP/RNBQK2R w KQ - 0 1', solution: ['e6g7', 'e8f8', 'd1h5'], rating: 1250, playerColor: 'white' },
        { fen: 'r3k2r/ppp2ppp/2n1bn2/2b1p1B1/4P3/2NP1N2/PPP1QPPP/R3KB1R w KQkq - 0 1', solution: ['f3e5', 'c6e5', 'e2b5'], rating: 1150, playerColor: 'white' },
        // --- Discovery Attacks ---
        { fen: 'rnbqkbnr/ppp2ppp/8/3pp3/4P1Q1/3P4/PPP2PPP/RNB1KBNR w KQkq - 0 2', solution: ['g4g7', 'e5e4', 'g7h8'], rating: 1000, playerColor: 'white' },
        { fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 w kq - 0 1', solution: ['f3g5', 'h7h6', 'g5f7'], rating: 1100, playerColor: 'white' },
        { fen: '4r1k1/ppp2pp1/7p/4N3/8/1P6/P1P2PPP/4R1K1 w - - 0 1', solution: ['e5f7', 'g8h7', 'e1e8'], rating: 1050, playerColor: 'white' },
        { fen: 'r3kb1r/ppqn1ppp/2p1pn2/3pN1B1/3P4/2N5/PPP1QPPP/R3KB1R w KQkq - 0 1', solution: ['e5f7', 'd7f8', 'e2e6'], rating: 1200, playerColor: 'white' },
        { fen: '2rqkb1r/1p1n1ppp/p2ppn2/8/3NP1b1/2N1B3/PPP1BPPP/R2QK2R w KQk - 0 1', solution: ['d4f5', 'e6f5', 'e4f5'], rating: 1050, playerColor: 'white' },
        // --- Smothered Mate ---
        { fen: 'r1b1kb1r/pppp1ppp/5n2/8/3qN3/8/PPPPQPPP/R1B1KB1R w KQkq - 0 1', solution: ['e4f6', 'g7f6', 'e2e8'], rating: 1200, playerColor: 'white' },
        { fen: '6rk/5Npp/8/8/8/8/8/4K2R w - - 0 1', solution: ['h1h6', 'g7h6', 'f7h6'], rating: 950, playerColor: 'white' },
        { fen: 'r4rk1/1bq1bppp/pp2pn2/2pp2B1/3P1B2/2PB1N2/PP1Q1PPP/R4RK1 w - - 0 1', solution: ['f3e5', 'd5d4', 'd3h7'], rating: 1300, playerColor: 'white' },
        { fen: 'r1bq1rk1/pppnn1pp/4p3/3pNp2/3P4/2NBP3/PPP2PPP/R2QK2R w KQ - 0 1', solution: ['e5f7', 'f8f7', 'd3g6'], rating: 1200, playerColor: 'white' },
        { fen: 'r1b1qrk1/pp2n1pp/2p1pn2/3p2B1/1b1P4/2NB1N2/PPP1QPPP/R4RK1 w - - 0 1', solution: ['g5f6', 'e7f5', 'e2e6'], rating: 1250, playerColor: 'white' },
        // --- More patterns ---
        { fen: 'k7/8/2K5/1Q6/8/8/8/8 w - - 0 1', solution: ['b5b7', 'a8a7', 'b7a7'], rating: 800, playerColor: 'white' },
        { fen: '3rkb1r/1p3ppp/p1n1pn2/q1Pp2B1/3P4/2N2N2/PP2QPPP/R3K2R w KQk - 0 1', solution: ['g5f6', 'g7f6', 'e2e6'], rating: 1100, playerColor: 'white' },
        { fen: 'r2qr1k1/pppb1ppp/2np4/2bNpP2/4P3/3B4/PPPP2PP/R1BQ1RK1 w - - 0 1', solution: ['d5f6', 'g7f6', 'd3h7'], rating: 1350, playerColor: 'white' },
        { fen: 'r1bq1rk1/ppppbppp/2n2n2/4p3/2B1P3/3P1N2/PPP2PPP/RNBQ1RK1 w - - 0 1', solution: ['c4f7', 'f8f7', 'f3g5'], rating: 1100, playerColor: 'white' },
        { fen: '2r1r1k1/5ppp/p7/1p1qQ3/8/1P6/P4PPP/2RR2K1 w - - 0 1', solution: ['e5e8', 'c8e8', 'c1c8'], rating: 1050, playerColor: 'white' },
    ],
    fork: [
        // --- Knight Forks ---
        { fen: 'r1bqkb1r/pppppppp/2n2n2/8/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3', solution: ['d4d5', 'c6e5', 'e4e5'], rating: 800, playerColor: 'white' },
        { fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3', solution: ['f3e5', 'c6e5', 'd2d4'], rating: 750, playerColor: 'white' },
        { fen: 'r1b1k2r/ppppqppp/2n2n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 0 5', solution: ['f3d4', 'c5d4', 'c3d5'], rating: 900, playerColor: 'white' },
        { fen: 'r2qkb1r/ppp1pppp/2n2n2/3p1b2/3P1B2/2N2N2/PPP1PPPP/R2QKB1R w KQkq - 0 4', solution: ['f3e5', 'c6e5', 'd4e5'], rating: 850, playerColor: 'white' },
        { fen: '2kr4/ppp2ppp/2n1b3/4p3/2B1N3/8/PPP2PPP/2KR4 w - - 0 1', solution: ['e4f6', 'g7f6', 'c4e6'], rating: 950, playerColor: 'white' },
        // --- Queen Forks ---
        { fen: 'r1b1k2r/pppp1ppp/2n1pn2/8/1bPP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 4', solution: ['d4d5', 'e6d5', 'c4d5'], rating: 800, playerColor: 'white' },
        { fen: 'rnbqk2r/pppp1ppp/5n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4', solution: ['f3e5', 'd7d5', 'e5f7'], rating: 1000, playerColor: 'white' },
        { fen: 'r3kb1r/ppp1pppp/2nq1n2/3p4/3P1Bb1/2N2N2/PPP1PPPP/R2QKB1R w KQkq - 0 5', solution: ['f3e5', 'c6e5', 'd4e5'], rating: 900, playerColor: 'white' },
        { fen: 'r1bqk2r/pppp1ppp/2n2n2/4p3/1b2P3/2NP4/PPP2PPP/R1BQKBNR w KQkq - 0 4', solution: ['d1a4', 'b4c3', 'a4c6'], rating: 850, playerColor: 'white' },
        { fen: 'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3', solution: ['g8e7', 'f3e5', 'c6e5'], rating: 800, playerColor: 'black' },
        // --- Pawn Forks ---
        { fen: 'rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 2', solution: ['e4d5', 'd8d5', 'b1c3'], rating: 700, playerColor: 'white' },
        { fen: 'r1bqkb1r/pppppppp/2n2n2/8/2BPP3/8/PPP2PPP/RNBQK1NR b KQkq - 0 3', solution: ['f6e4', 'd4d5', 'c6a5'], rating: 850, playerColor: 'black' },
        { fen: 'rnb1kbnr/ppp1pppp/8/3q4/3P4/8/PPP2PPP/RNBQKBNR w KQkq - 0 3', solution: ['b1c3', 'd5a5', 'd4d5'], rating: 750, playerColor: 'white' },
        { fen: 'r1bqkbnr/pppppppp/2n5/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 1 2', solution: ['d2d4', 'd7d5', 'e4d5'], rating: 700, playerColor: 'white' },
        { fen: 'rnbqkb1r/ppp1pppp/5n2/3pP3/8/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 3', solution: ['e5f6', 'e7f6', 'd2d4'], rating: 800, playerColor: 'white' },
        // --- Bishop/Rook Forks ---
        { fen: 'r2qkbnr/ppp2ppp/2n1p3/3pP3/3P2b1/5N2/PPP2PPP/RNBQKB1R w KQkq - 0 4', solution: ['f1b5', 'g4d7', 'b5c6'], rating: 900, playerColor: 'white' },
        { fen: 'r1bqkb1r/ppp2ppp/2n1pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 4', solution: ['c4d5', 'e6d5', 'c1g5'], rating: 850, playerColor: 'white' },
        { fen: 'rnb1kb1r/ppq1pppp/5n2/2pp4/3P4/2N2N2/PPP1PPPP/R1BQKB1R w KQkq - 0 4', solution: ['d4c5', 'c7c5', 'c1f4'], rating: 850, playerColor: 'white' },
        { fen: 'r1bqk2r/ppppbppp/2n2n2/4p3/4P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 0 5', solution: ['d2d4', 'e5d4', 'f3d4'], rating: 750, playerColor: 'white' },
        { fen: 'rn1qkbnr/ppp1pppp/8/3p1b2/3P4/5N2/PPP1PPPP/RNBQKB1R w KQkq - 0 3', solution: ['f3e5', 'f5e6', 'e5c6'], rating: 950, playerColor: 'white' },
    ],
    pin: [
        // --- Absolute Pins (to King) ---
        { fen: 'rnbqk2r/pppp1ppp/5n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4', solution: ['d2d3', 'O-O', 'c1g5'], rating: 800, playerColor: 'white' },
        { fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3', solution: ['f1b5', 'd7d6', 'b5c6'], rating: 850, playerColor: 'white' },
        { fen: 'rnbqk2r/ppp2ppp/3bpn2/3p4/3P1B2/2N2N2/PPP1PPPP/R2QKB1R w KQkq - 0 4', solution: ['f1g2', 'O-O', 'c1g5'], rating: 900, playerColor: 'white' },
        { fen: 'r1bqkbnr/pppppppp/2n5/1B6/4P3/8/PPPP1PPP/RNBQK1NR b KQkq - 0 2', solution: ['a7a6', 'b5a4', 'g8f6'], rating: 750, playerColor: 'black' },
        { fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4', solution: ['d2d4', 'e5d4', 'f1g5'], rating: 900, playerColor: 'white' },
        // --- Relative Pins ---
        { fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3', solution: ['f1c4', 'g8f6', 'f3g5'], rating: 850, playerColor: 'white' },
        { fen: 'rnbqk2r/pppp1ppp/4pn2/8/1bPP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 0 3', solution: ['d1c2', 'O-O', 'c1g5'], rating: 800, playerColor: 'white' },
        { fen: 'r1bqk2r/ppppbppp/2n2n2/4p3/2BPP3/2N2N2/PPP2PPP/R1BQK2R b KQkq - 0 5', solution: ['e5d4', 'f3d4', 'c8g4'], rating: 900, playerColor: 'black' },
        { fen: 'rnbqkb1r/pppp1ppp/5n2/4p3/4P3/2N5/PPPP1PPP/R1BQKBNR w KQkq - 2 3', solution: ['f1c4', 'f6e4', 'd1h5'], rating: 950, playerColor: 'white' },
        { fen: 'rnbqk2r/ppppbppp/5n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4', solution: ['d2d4', 'e5d4', 'e4e5'], rating: 850, playerColor: 'white' },
        // --- Breaking Pins ---
        { fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 0 5', solution: ['d2d3', 'a7a6', 'c1e3'], rating: 800, playerColor: 'white' },
        { fen: 'rnbqk2r/pppp1ppp/4pn2/8/1bPP4/2N2N2/PP2PPPP/R1BQKB1R b KQkq - 0 4', solution: ['b4c3', 'b2c3', 'd7d5'], rating: 850, playerColor: 'black' },
        { fen: 'r1bqkbnr/ppp2ppp/2np4/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4', solution: ['c4f7', 'e8f7', 'f3g5'], rating: 1000, playerColor: 'white' },
        { fen: 'rnbqk2r/ppp1bppp/4pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 4', solution: ['c1g5', 'O-O', 'e2e3'], rating: 800, playerColor: 'white' },
        { fen: 'r1bqkb1r/pppp1ppp/2n2n2/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3', solution: ['a7a6', 'b5a4', 'g8f6'], rating: 750, playerColor: 'black' },
        // --- Pin Exploitation ---
        { fen: 'rnbqkbnr/ppp1pppp/8/3p4/3PP3/8/PPP2PPP/RNBQKBNR b KQkq - 0 2', solution: ['d5e4', 'f1c4', 'g8f6'], rating: 750, playerColor: 'black' },
        { fen: 'r1bqk2r/ppppbppp/2n2n2/4p3/4P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 0 5', solution: ['d2d4', 'd7d6', 'c1g5'], rating: 850, playerColor: 'white' },
        { fen: 'rnbqk2r/ppppbppp/4pn2/8/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 0 4', solution: ['c1g5', 'h7h6', 'g5h4'], rating: 900, playerColor: 'white' },
        { fen: 'r1bqkb1r/pppppppp/2n2n2/8/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3', solution: ['f1d3', 'd7d5', 'e4e5'], rating: 800, playerColor: 'white' },
        { fen: 'rnbqk2r/pppp1ppp/4pn2/8/1bPP4/5N2/PP2PPPP/RNBQKB1R w KQkq - 0 3', solution: ['c1d2', 'b4d2', 'd1d2'], rating: 750, playerColor: 'white' },
    ],
    skewer: [
        // --- Rook Skewers ---
        { fen: '8/8/8/8/k7/8/1K2R3/8 w - - 0 1', solution: ['e2a2'], rating: 700, playerColor: 'white' },
        { fen: '4r3/8/8/8/8/8/K7/3R4 b - - 0 1', solution: ['e8e2'], rating: 750, playerColor: 'black' },
        { fen: '8/8/8/r7/8/8/K7/4R3 b - - 0 1', solution: ['a5a2'], rating: 700, playerColor: 'black' },
        { fen: '4R3/8/8/8/4k3/8/4r3/4K3 w - - 0 1', solution: ['e8e4'], rating: 800, playerColor: 'white' },
        { fen: 'r3k3/8/8/8/8/8/R7/4K3 w - - 0 1', solution: ['a2a8'], rating: 750, playerColor: 'white' },
        // --- Bishop Skewers ---
        { fen: '8/8/k7/8/2B5/8/8/4K3 w - - 0 1', solution: ['c4d5'], rating: 800, playerColor: 'white' },
        { fen: '4k3/8/8/3B4/8/8/8/r3K3 w - - 0 1', solution: ['d5a2'], rating: 850, playerColor: 'white' },
        { fen: '8/5k2/8/8/8/2b5/8/R3K3 b - - 0 1', solution: ['c3e1'], rating: 800, playerColor: 'black' },
        { fen: '8/8/8/8/3b4/8/4K3/7R b - - 0 1', solution: ['d4f2'], rating: 850, playerColor: 'black' },
        { fen: '4k3/8/5B2/8/8/8/8/r3K3 w - - 0 1', solution: ['f6c3'], rating: 900, playerColor: 'white' },
        // --- Queen Skewers ---
        { fen: 'r3k3/8/8/4Q3/8/8/8/4K3 w - - 0 1', solution: ['e5a5'], rating: 750, playerColor: 'white' },
        { fen: '4k3/8/8/8/8/8/8/R3K2q b - - 0 1', solution: ['h1a1'], rating: 700, playerColor: 'black' },
        { fen: '1k6/8/8/8/8/8/2Q5/4K3 w - - 0 1', solution: ['c2c8'], rating: 650, playerColor: 'white' },
        { fen: 'r7/8/8/8/3k4/8/8/3QK3 w - - 0 1', solution: ['d1a4'], rating: 800, playerColor: 'white' },
        { fen: '8/8/8/3k4/8/8/6Q1/R3K3 w - - 0 1', solution: ['g2d5'], rating: 850, playerColor: 'white' },
        // --- Complex Skewers ---
        { fen: 'r3k2r/ppp2ppp/2n1bn2/3qp3/8/2N2NP1/PPPPPPBP/R1BQK2R w KQkq - 0 1', solution: ['f3e5', 'c6e5', 'g2d5'], rating: 1000, playerColor: 'white' },
        { fen: '2r1k3/8/8/8/8/8/3R4/4K3 w - - 0 1', solution: ['d2d8', 'e8d8', 'e1d2'], rating: 750, playerColor: 'white' },
        { fen: '4k3/8/8/8/4r3/8/4R3/4K3 b - - 0 1', solution: ['e4e2', 'e1d1', 'e2e8'], rating: 800, playerColor: 'black' },
        { fen: 'r3k3/8/8/3B4/8/8/8/4K3 w - - 0 1', solution: ['d5a2'], rating: 900, playerColor: 'white' },
        { fen: '8/5k2/8/3r4/8/8/8/R3K3 b - - 0 1', solution: ['d5d1'], rating: 850, playerColor: 'black' },
    ],
    endgame: [
        // --- King + Pawn Endgames ---
        { fen: '8/8/8/4k3/8/4K3/4P3/8 w - - 0 1', solution: ['e3d4', 'e5d6', 'e2e4'], rating: 900, playerColor: 'white' },
        { fen: '8/4k3/8/4P3/4K3/8/8/8 w - - 0 1', solution: ['e4d5', 'e7e8', 'e5e6'], rating: 850, playerColor: 'white' },
        { fen: '8/8/4k3/8/4KP2/8/8/8 w - - 0 1', solution: ['f4f5', 'e6f6', 'e4d5'], rating: 900, playerColor: 'white' },
        { fen: '8/8/8/5k2/8/5K2/5P2/8 w - - 0 1', solution: ['f3e4', 'f5e6', 'f2f4'], rating: 850, playerColor: 'white' },
        { fen: '8/5k2/5P2/5K2/8/8/8/8 w - - 0 1', solution: ['f5e5', 'f7f8', 'f6f7'], rating: 800, playerColor: 'white' },
        // --- Rook Endgames ---
        { fen: '8/R7/8/8/8/pk6/8/1K6 w - - 0 1', solution: ['a7a1', 'b3c2', 'a1a3'], rating: 1000, playerColor: 'white' },
        { fen: '8/8/8/8/k1K5/8/R7/8 w - - 0 1', solution: ['a2a1', 'a4b5', 'c4d5'], rating: 950, playerColor: 'white' },
        { fen: '8/8/5k2/R7/8/6K1/5P2/8 w - - 0 1', solution: ['a5a6', 'f6g7', 'g3g4'], rating: 900, playerColor: 'white' },
        { fen: '8/1k6/8/8/8/1K6/1R6/8 w - - 0 1', solution: ['b2b1', 'b7c6', 'b3c4'], rating: 850, playerColor: 'white' },
        { fen: '8/8/8/2k5/8/2K5/2R5/8 w - - 0 1', solution: ['c2c1', 'c5b6', 'c3d4'], rating: 900, playerColor: 'white' },
        // --- Queen vs Pawn ---
        { fen: '8/8/8/8/8/k7/p7/1Q1K4 w - - 0 1', solution: ['b1b3', 'a3a4', 'b3b2'], rating: 1100, playerColor: 'white' },
        { fen: '1Q6/8/8/8/8/k7/p7/4K3 w - - 0 1', solution: ['b8a8', 'a3b3', 'a8b8'], rating: 1000, playerColor: 'white' },
        { fen: '8/8/8/8/4Q3/8/pk6/4K3 w - - 0 1', solution: ['e4b4', 'a2a1', 'b4b1'], rating: 1050, playerColor: 'white' },
        { fen: '8/8/8/Q7/8/1k6/1p6/1K6 w - - 0 1', solution: ['a5d2', 'b3a4', 'd2a2'], rating: 1100, playerColor: 'white' },
        { fen: '8/8/8/8/8/2Q5/kp6/4K3 w - - 0 1', solution: ['c3c2', 'a2a1', 'c2b2'], rating: 1000, playerColor: 'white' },
        // --- Bishop vs Knight ---
        { fen: '8/8/4k3/8/2B1n3/4K3/8/8 w - - 0 1', solution: ['c4d5', 'e6d7', 'e3e4'], rating: 950, playerColor: 'white' },
        { fen: '8/8/4k3/4n3/8/3BK3/8/8 w - - 0 1', solution: ['d3e4', 'e6d6', 'e3d4'], rating: 900, playerColor: 'white' },
        { fen: '8/8/8/2k5/8/2KB4/8/8 w - - 0 1', solution: ['d3c4', 'c5b6', 'c4d5'], rating: 800, playerColor: 'white' },
        { fen: '8/8/3k4/8/4K3/3N4/8/8 w - - 0 1', solution: ['d3e5', 'd6e6', 'e4d4'], rating: 850, playerColor: 'white' },
        { fen: '8/4k3/8/4K3/4B3/8/8/8 w - - 0 1', solution: ['e4d5', 'e7d7', 'e5d5'], rating: 800, playerColor: 'white' },
    ],
};
