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
// Echte Lichess-Puzzles (von database.lichess.org)
// Format: { fen, moves: [UCI-Züge], rating }
// fen = Stellung VOR dem Gegnerzug
// moves[0] = Gegnerzug (wird automatisch gespielt)
// moves[1+] = Spielerlösung
// ============================================
const PUZZLE_DB = {
mateIn1: [
        { fen: '5k2/p4p1p/1p4p1/8/4P3/2r5/P4PPP/1R4K1 w - - 0 23', moves: ['b1b2', 'c3c1'], rating: 399 },
        { fen: '4r3/2p5/2Rb2k1/p4p2/P7/4B2P/5PP1/6K1 w - - 0 42', moves: ['e3c5', 'e8e1'], rating: 399 },
        { fen: '6k1/p3qppp/1p2p3/1N6/P1r1n3/3QP1P1/5PKP/R7 b - - 1 24', moves: ['e7b7', 'd3d8'], rating: 399 },
        { fen: '4rk2/ppp1rp1p/6p1/5Q2/3p4/P2P2R1/KPP5/6R1 b - - 0 25', moves: ['g6f5', 'g3g8'], rating: 399 },
        { fen: '2r2rk1/6pp/p1q5/1pn2p2/1B1pPP2/3Pn1QB/1PP2R1P/6RK b - - 3 24', moves: ['f8f6', 'g3g7'], rating: 400 },
        { fen: '6k1/5p2/1p2pn2/3pN3/1P1P1Pp1/P3r1Pp/2q1RP1P/6K1 w - - 0 32', moves: ['e2c2', 'e3e1'], rating: 400 },
        { fen: '3b4/pp2kprp/8/1Bp5/4R3/1P6/P4PPP/1K6 b - - 0 22', moves: ['e7f8', 'e4e8'], rating: 400 },
        { fen: '8/8/R7/5k2/3r3p/6pP/6P1/6K1 w - - 4 70', moves: ['a6a7', 'd4d1'], rating: 400 },
        { fen: 'r7/3r1kp1/8/4B2R/7R/p6P/5PP1/2n2K2 w - - 8 33', moves: ['h4c4', 'd7d1'], rating: 400 },
        { fen: 'r2q1rk1/1b2bpp1/2p1p2p/1pPp4/1P4Q1/P3P2P/1B1N1PP1/R3R1K1 b - - 0 18', moves: ['b7c8', 'g4g7'], rating: 400 },
        { fen: '7Q/1p2R3/5np1/3p1rk1/P3n3/8/1PP1N1b1/2K5 w - - 6 37', moves: ['e2d4', 'f5f1'], rating: 400 },
        { fen: '8/8/8/8/8/3r1k2/6R1/7K w - - 67 97', moves: ['g2h2', 'd3d1'], rating: 400 },
        { fen: 'rn4k1/pp4pp/3p4/2pP1b2/2r4q/5P2/PP2QN1P/K2R1B1R b - - 3 18', moves: ['c4c2', 'e2e8'], rating: 400 },
        { fen: '3r4/pB3R2/1p2p3/8/kP4b1/2P1B3/P4P2/4K3 w - - 1 29', moves: ['b7e4', 'd8d1'], rating: 400 },
        { fen: '6k1/1b3ppp/p1q5/2p3b1/1PQp4/P2P3P/5PP1/1R2rNK1 w - - 0 28', moves: ['b1e1', 'c6g2'], rating: 400 },
        { fen: '1rQ1kb1r/p2npppp/8/6n1/3P4/8/PPR3PP/4KBNR b Kk - 1 13', moves: ['b8c8', 'c2c8'], rating: 400 },
        { fen: '1r4k1/5p1p/1R3Pp1/1p6/8/7P/6P1/3R2K1 b - - 0 31', moves: ['b8b6', 'd1d8'], rating: 400 },
        { fen: 'rnb1k2r/p2pppbp/6p1/qB2P3/3P4/2Q2N2/PP3PPP/R1B1K2R b KQkq - 0 10', moves: ['a5b5', 'c3c8'], rating: 401 },
        { fen: 'r5k1/5ppp/4p3/2P5/3P4/8/5PPP/q1R3K1 w - - 0 36', moves: ['c1a1', 'a8a1'], rating: 405 },
        { fen: 'b2R2k1/4bppp/p4q2/1p6/2p5/P4N1P/BPP2PP1/4R1K1 b - - 0 23', moves: ['e7d8', 'e1e8'], rating: 406 }
    ],
    mateIn2: [
        { fen: '4r1k1/1p2r3/p1p5/3p1p2/PP1P1q1p/2Q1P1pP/5PP1/4R1K1 w - - 0 39', moves: ['e3f4', 'e7e1', 'c3e1', 'e8e1'], rating: 400 },
        { fen: '6k1/5ppp/8/4rP2/1r4P1/2RK3P/8/7B b - - 0 47', moves: ['b4b5', 'c3c8', 'e5e8', 'c8e8'], rating: 400 },
        { fen: '5rk1/p5pp/2ppp3/4p2R/4N1q1/5Q2/PPP3P1/1K6 w - - 3 22', moves: ['f3g4', 'f8f1', 'g4d1', 'f1d1'], rating: 400 },
        { fen: '8/R7/3P4/4p1p1/3rPp1k/5P2/5K2/8 b - - 0 46', moves: ['d4d6', 'a7h7', 'd6h6', 'h7h6'], rating: 400 },
        { fen: '2r3k1/1p4pp/6P1/2R2P1P/b7/P2R2K1/2n5/8 b - - 6 44', moves: ['c8c5', 'd3d8', 'a4e8', 'd8e8'], rating: 400 },
        { fen: '1n5k/6p1/4R2p/1p6/4B3/P3PK2/1P1q2PP/8 b - - 3 30', moves: ['b8d7', 'e6e8', 'd7f8', 'e8f8'], rating: 400 },
        { fen: '6k1/6p1/R5K1/8/p1r1p3/8/5P1P/8 b - - 11 40', moves: ['c4d4', 'a6a8', 'd4d8', 'a8d8'], rating: 400 },
        { fen: '2r2bk1/2N2pp1/p6p/4p3/4N1n1/P3B3/1P1R1PPP/6K1 w - - 1 26', moves: ['c7a6', 'c8c1', 'd2d1', 'c1d1'], rating: 400 },
        { fen: '2r3k1/R5p1/4p1pp/8/7r/1P6/P4PP1/3R2K1 w - - 0 32', moves: ['d1d7', 'c8c1', 'd7d1', 'c1d1'], rating: 403 },
        { fen: '6k1/1N3ppp/p1p2n2/4p3/1r6/4P1P1/5P1P/3R2K1 b - - 0 29', moves: ['b4b7', 'd1d8', 'f6e8', 'd8e8'], rating: 405 },
        { fen: '4r1k1/4P1pb/r6p/p1p1p3/P2p2PP/1P3R2/2P2R2/6K1 b - - 0 40', moves: ['a6e6', 'f3f8', 'e8f8', 'e7f8q'], rating: 412 },
        { fen: '3r4/6kp/6p1/3q4/5Q2/5p1B/1P3P1P/R6K w - - 5 41', moves: ['h3g4', 'd5d1', 'a1d1', 'd8d1'], rating: 422 },
        { fen: '3r2k1/5ppp/8/3P2P1/1R3p1P/5P2/1P3K2/8 b - - 0 33', moves: ['d8d5', 'b4b8', 'd5d8', 'b8d8'], rating: 424 },
        { fen: '3r2k1/4nppp/pq1p1b2/1p2P3/2r2P2/2P1NR2/PP1Q2BP/3R2K1 b - - 0 24', moves: ['d6e5', 'd2d8', 'b6d8', 'd1d8'], rating: 427 },
        { fen: '1k2Qr2/ppp4p/2n5/8/3P1q2/P1P4P/5PP1/1R2R1K1 b - - 4 24', moves: ['f8e8', 'e1e8', 'c6d8', 'e8d8'], rating: 431 },
        { fen: '2r3k1/p1pR1ppp/1p4b1/4r3/2P1P3/5B1P/P4KP1/3R4 b - - 3 26', moves: ['e5c5', 'd7d8', 'c8d8', 'd1d8'], rating: 431 },
        { fen: '3r4/2k3b1/2p4p/5Qp1/8/PP6/2P3PP/1K1rR3 w - - 3 31', moves: ['e1d1', 'd8d1', 'b1a2', 'd1a1'], rating: 434 },
        { fen: '6k1/4pp1p/6pB/8/b2R4/2P5/Pr4PP/6K1 b - - 1 24', moves: ['b2a2', 'd4d8', 'a4e8', 'd8e8'], rating: 436 },
        { fen: '3r1bnr/ppk2ppp/8/4P3/2N5/P2R1N2/1Pn2PPP/1RB3K1 w - - 3 15', moves: ['d3c3', 'd8d1', 'f3e1', 'd1e1'], rating: 436 },
        { fen: 'r5k1/5p1p/1p1P1B2/2n2N2/p1r1b3/P7/4R1PP/4R1K1 b - - 1 28', moves: ['e4f5', 'e2e8', 'a8e8', 'e1e8'], rating: 436 }
    ],
    fork: [
        { fen: '8/1k5p/p4p2/4BN2/2b5/4P3/6P1/3K4 b - - 0 41', moves: ['f6e5', 'f5d6', 'b7c6', 'd6c4'], rating: 443 },
        { fen: '4r1k1/4ppb1/p1Np2p1/8/7P/1P2B3/6P1/5K2 b - - 0 37', moves: ['e8c8', 'c6e7', 'g8f8', 'e7c8'], rating: 542 },
        { fen: '5rk1/3R1pbp/4p1p1/4P3/2p2B2/P1N4P/1P3PP1/1bn3K1 w - - 0 26', moves: ['c3b1', 'c1e2', 'g1f1', 'e2f4'], rating: 558 },
        { fen: '8/3b1Npk/p7/3p3p/8/6P1/1P4KP/8 b - - 1 38', moves: ['d7e6', 'f7g5', 'h7h6', 'g5e6'], rating: 566 },
        { fen: '3rkbnr/1pp3pp/p4p2/4N3/4b3/8/PPP2PPP/RNB1R1K1 w k - 0 11', moves: ['e1e4', 'd8d1', 'e4e1', 'd1e1'], rating: 587 },
        { fen: '2Q3k1/5ppp/3p1b2/3P4/8/4R3/5PPP/2q1R1K1 b - - 0 33', moves: ['c1c8', 'e3e8', 'c8e8', 'e1e8'], rating: 591 },
        { fen: '8/2N2kp1/3p3p/8/1r4P1/5K1P/8/8 b - - 0 40', moves: ['f7e7', 'c7d5', 'e7e6', 'd5b4'], rating: 596 },
        { fen: '3qrQ1k/pb5p/2n3pP/3pP3/2pP4/2N5/PPP2R2/2K2R2 b - - 9 29', moves: ['e8f8', 'f2f8', 'd8f8', 'f1f8'], rating: 600 },
        { fen: '3r3r/4bk2/1RQ1p3/3pP2p/P2n4/5p1P/6P1/R5K1 w - - 0 31', moves: ['c6c3', 'd4e2', 'g1h2', 'e2c3'], rating: 602 },
        { fen: '8/8/1q1k1pp1/3p3p/2pR1K1P/p1P2P2/P5P1/3R4 b - - 7 42', moves: ['b6b5', 'd4d5', 'b5d5', 'd1d5'], rating: 602 },
        { fen: '1B6/5kpp/8/pp1K4/8/3N4/6rP/8 b - - 0 37', moves: ['g2g4', 'd3e5', 'f7f6', 'e5g4'], rating: 607 },
        { fen: '8/ppk5/2p4P/6N1/5K2/P2r4/6P1/8 b - - 0 41', moves: ['d3d8', 'g5e6', 'c7d7', 'e6d8'], rating: 609 },
        { fen: '8/2p1k3/3pP1p1/2bP4/p5K1/6P1/8/2R5 w - - 1 43', moves: ['g4g5', 'c5e3', 'g5g6', 'e3c1'], rating: 610 },
        { fen: '8/ppQ3qk/3p2pp/4n3/8/1P6/P7/4R1K1 w - - 1 37', moves: ['c7d6', 'e5f3', 'g1f2', 'f3e1'], rating: 616 },
        { fen: '1r1R3k/ppp3pp/2n2p2/2q5/Q1P5/8/PP3PPP/3R2K1 b - - 7 23', moves: ['b8d8', 'd1d8', 'c6d8', 'a4e8', 'c5f8', 'e8f8'], rating: 626 },
        { fen: '5k2/6p1/1Rr2p1p/p1b1pP2/P5PP/4B3/1P6/1K6 b - - 0 34', moves: ['c6b6', 'e3c5', 'f8f7', 'c5b6'], rating: 631 },
        { fen: '8/8/5k2/5p1p/1N1b1Pp1/6P1/6KP/8 b - - 3 52', moves: ['d4b6', 'b4d5', 'f6f7', 'd5b6'], rating: 632 },
        { fen: '8/1k5p/2p3p1/1p6/1P6/3N1PPP/1r6/5K2 b - - 3 52', moves: ['b2b3', 'd3c5', 'b7c8', 'c5b3'], rating: 634 },
        { fen: 'r5k1/5pp1/2p5/P1N4p/2Pp1n2/1P3P2/5P1P/3R2K1 w - - 1 26', moves: ['d1d4', 'f4e2', 'g1f1', 'e2d4'], rating: 637 },
        { fen: '6k1/5pp1/p1N1b3/1n5p/1B4P1/P4P1P/2K5/8 b - - 2 42', moves: ['e6d5', 'c6e7', 'g8h7', 'e7d5'], rating: 641 }
    ],
    pin: [
        { fen: 'r5k1/1p3p1p/3Pp1p1/3p4/3b4/6P1/R4PKP/R7 b - - 0 32', moves: ['a8d8', 'a2a8', 'd4a1', 'a8d8'], rating: 683 },
        { fen: '8/p1k2ppp/1p1n4/2PP1P2/BK3B1P/P7/4rP2/8 b - - 0 44', moves: ['b6c5', 'b4c5', 'e2e4', 'f4d6'], rating: 774 },
        { fen: '8/p3B2p/k7/8/1R2n3/PNP5/KP5r/8 w - - 2 39', moves: ['e7d8', 'e4c3', 'a2a1', 'h2h1', 'b3c1', 'h1c1'], rating: 826 },
        { fen: 'r3r1k1/2q2pp1/p2b3p/3Bn3/1p6/3P1Q2/1PPB1P2/1NKR3R w - - 1 21', moves: ['f3g2', 'e5d3'], rating: 830 },
        { fen: '5rk1/5Qpp/1r3p2/6q1/1PB4n/P6P/5PP1/3R1R1K b - - 0 22', moves: ['f8f7', 'd1d8'], rating: 832 },
        { fen: 'r2qk2r/pp1n1pNp/2p5/2Pp4/3Pn3/1P2P3/PQ4PP/R4RK1 b kq - 0 17', moves: ['e8f8', 'g7e6', 'f8e7', 'e6d8'], rating: 848 },
        { fen: '2r1kb1r/1p3ppp/p7/3ppP2/8/1P1PBP2/P4RPP/R5K1 w k - 1 21', moves: ['a1c1', 'c8c1', 'e3c1', 'f8c5'], rating: 857 },
        { fen: 'r5k1/5ppp/2bpp3/1pp5/4P1P1/1PqP1N2/2P1RPP1/rRQ3K1 w - - 5 23', moves: ['b1a1', 'a8a1', 'c1a1', 'c3a1'], rating: 859 },
        { fen: '2r3rk/Qp1q3p/5n2/3pnp2/4pN2/PNP4P/1P3PP1/3R1RK1 w - - 5 24', moves: ['a7d4', 'e5f3', 'g1h1', 'f3d4'], rating: 866 },
        { fen: '6k1/R4pp1/3pq2p/6r1/1P6/P3PQ1r/3R1PP1/6K1 w - - 0 32', moves: ['f3h3', 'e6h3', 'a7a8', 'g8h7'], rating: 867 },
        { fen: '4rr2/pp4pk/7p/8/P7/1q1P1NP1/3QP1K1/7R b - - 1 33', moves: ['b3e6', 'f3g5', 'h7h8', 'g5e6'], rating: 875 },
        { fen: '5kr1/p6p/4r3/2Pp1p2/3q4/2P1R1P1/P4K1P/RNB5 b - - 0 29', moves: ['d4c5', 'c1a3', 'c5a3', 'b1a3'], rating: 876 },
        { fen: '4r2k/ppp4p/3q4/2nPNr2/3Q1P2/8/PPP4P/2K3R1 b - - 3 21', moves: ['f5f6', 'e5f7'], rating: 882 },
        { fen: 'r4q1k/p1p1Nppp/bp1p1n1n/3P4/2P4Q/8/P3RPPP/4R1K1 b - - 11 22', moves: ['a8e8', 'e7g6', 'h7g6', 'e2e8', 'f8e8', 'e1e8'], rating: 903 },
        { fen: '2kr1b1r/pbp5/1pn1q1pp/3p1p2/3P4/P1P1BQ1B/1P3P1P/R3K1R1 b Q - 1 18', moves: ['g6g5', 'h3f5', 'e6f5', 'f3f5'], rating: 909 },
        { fen: 'r3k2r/pq1n1ppb/4p2p/4P3/Q1N3P1/1Pp1P2P/P4P2/R4RK1 b kq - 1 19', moves: ['a8b8', 'c4d6', 'e8e7', 'd6b7'], rating: 919 },
        { fen: 'r2q1r1k/ppp3pp/5n2/b7/2Bp1NbQ/2P5/PP4PP/R1B2R1K b - - 0 18', moves: ['d4c3', 'f4g6'], rating: 933 },
        { fen: 'q4rk1/1p3ppp/2N1pn2/8/4p3/rPN1P2P/2PQB1P1/2KR3R w - - 1 19', moves: ['c6b4', 'a3a1', 'c3b1', 'a8a3'], rating: 946 },
        { fen: '8/2Rq1p1k/p3p1pp/1p2P3/1P3P1P/3r2PK/2Q5/8 b - - 3 40', moves: ['d3d2', 'c7d7', 'd2c2', 'd7f7'], rating: 955 },
        { fen: '8/p2b3p/5k2/2P1R1p1/8/8/P5K1/8 w - - 3 33', moves: ['e5d5', 'd7c6', 'g2f2', 'c6d5'], rating: 956 }
    ],
    skewer: [
        { fen: '2r3k1/p2r1pp1/1p6/4PpP1/3p3R/7R/PP5P/6K1 b - - 1 34', moves: ['g8f8', 'h4h8', 'f8e7', 'h8c8'], rating: 603 },
        { fen: 'r5k1/2p3p1/3p2pp/1p2p3/2P5/4B2P/5PP1/2K2R2 w - - 0 29', moves: ['c4b5', 'a8a1', 'c1d2', 'a1f1'], rating: 625 },
        { fen: '8/3k1p1p/r2P2p1/pp6/2p5/2P1KP2/P1P3PP/3R4 w - - 3 26', moves: ['e3d4', 'a6d6', 'd4c5', 'd6d1'], rating: 650 },
        { fen: '4b3/8/pp1p1p2/2pPpP2/P1P1P2k/1P6/5K2/3N4 w - - 0 35', moves: ['f2f3', 'e8h5', 'f3e3', 'h5d1'], rating: 659 },
        { fen: 'r5k1/2R3pp/p7/4Pp2/1P3P2/4P3/1P3P1r/R4K2 w - - 1 28', moves: ['c7c6', 'h2h1', 'f1g2', 'h1a1'], rating: 662 },
        { fen: 'rk6/pr3ppp/3R4/1p1p4/2pP4/2P1P3/5PPP/R4K2 b - - 5 23', moves: ['a7a5', 'd6d8', 'b8c7', 'd8a8'], rating: 677 },
        { fen: '8/8/8/2k5/r7/2K3R1/8/8 w - - 30 65', moves: ['c3d3', 'a4a3', 'd3e4', 'a3g3'], rating: 694 },
        { fen: 'r7/5ppp/8/1pk5/2b5/5P2/P2R2PP/K1R5 w - - 2 32', moves: ['a1b2', 'a8a2', 'b2b1', 'a2d2'], rating: 715 },
        { fen: '6k1/pp3p1p/2b3p1/8/2P2r2/1P5P/PQ1nK3/8 w - - 0 54', moves: ['e2d2', 'f4f2', 'd2c3', 'f2b2'], rating: 721 },
        { fen: '8/1p6/pPr1k3/4p1pR/6P1/6K1/8/8 b - - 5 45', moves: ['c6b6', 'h5h6', 'e6d7', 'h6b6'], rating: 721 },
        { fen: 'r4k2/p6R/1p3pp1/1Pp5/P5np/1K6/2P5/2B5 b - - 1 41', moves: ['g6g5', 'h7h8', 'f8e7', 'h8a8'], rating: 727 },
        { fen: '8/pp5R/3k4/3Nn3/4P3/1KP5/8/4r3 w - - 12 46', moves: ['h7b7', 'e1b1', 'b3c2', 'b1b7'], rating: 759 },
        { fen: '8/3R2p1/2p2pkp/1bB5/pP1K2P1/P4P2/4r2P/8 w - - 7 39', moves: ['h2h4', 'e2d2', 'd4c3', 'd2d7'], rating: 788 },
        { fen: '5R2/8/6p1/r3n2p/P3k3/6K1/5P1P/8 b - - 12 50', moves: ['a5a4', 'f8f4', 'e4d5', 'f4a4'], rating: 803 },
        { fen: '3r4/6pp/2p1k3/ppP5/6P1/7P/1P6/4R1K1 b - - 1 32', moves: ['e6d5', 'e1d1', 'd5c5', 'd1d8'], rating: 805 },
        { fen: '6R1/1p4p1/p1k4p/3p4/PP2p1P1/2b1P3/6K1/8 b - - 2 37', moves: ['b7b5', 'g8c8', 'c6b7', 'c8c3'], rating: 806 },
        { fen: '8/p7/5k2/P5R1/6KP/8/8/5r2 w - - 5 53', moves: ['g5g8', 'f1g1', 'g4f4', 'g1g8'], rating: 809 },
        { fen: '6R1/8/Kpk1p3/1p1pP3/6P1/PPP1r3/8/8 b - - 3 40', moves: ['e3c3', 'g8c8', 'c6d7', 'c8c3'], rating: 819 },
        { fen: '8/1pr4p/p7/P5K1/8/2Pk4/8/1R6 b - - 15 38', moves: ['c7d7', 'b1d1', 'd3c4', 'd1d7'], rating: 821 },
        { fen: '2kr1r2/2p3p1/1p6/1P4Pp/3pp2P/8/5P2/RR4K1 b - - 1 28', moves: ['d8d5', 'a1a8', 'c8d7', 'a8f8'], rating: 829 }
    ],
    endgame: [
        { fen: '5k2/p4p1p/1p4p1/8/4P3/2r5/P4PPP/1R4K1 w - - 0 23', moves: ['b1b2', 'c3c1'], rating: 399 },
        { fen: '4r3/2p5/2Rb2k1/p4p2/P7/4B2P/5PP1/6K1 w - - 0 42', moves: ['e3c5', 'e8e1'], rating: 399 },
        { fen: '6k1/p3qppp/1p2p3/1N6/P1r1n3/3QP1P1/5PKP/R7 b - - 1 24', moves: ['e7b7', 'd3d8'], rating: 399 },
        { fen: '4rk2/ppp1rp1p/6p1/5Q2/3p4/P2P2R1/KPP5/6R1 b - - 0 25', moves: ['g6f5', 'g3g8'], rating: 399 },
        { fen: '4r1k1/1p2r3/p1p5/3p1p2/PP1P1q1p/2Q1P1pP/5PP1/4R1K1 w - - 0 39', moves: ['e3f4', 'e7e1', 'c3e1', 'e8e1'], rating: 400 },
        { fen: '6k1/5ppp/8/4rP2/1r4P1/2RK3P/8/7B b - - 0 47', moves: ['b4b5', 'c3c8', 'e5e8', 'c8e8'], rating: 400 },
        { fen: '6k1/5p2/1p2pn2/3pN3/1P1P1Pp1/P3r1Pp/2q1RP1P/6K1 w - - 0 32', moves: ['e2c2', 'e3e1'], rating: 400 },
        { fen: '3b4/pp2kprp/8/1Bp5/4R3/1P6/P4PPP/1K6 b - - 0 22', moves: ['e7f8', 'e4e8'], rating: 400 },
        { fen: '8/8/R7/5k2/3r3p/6pP/6P1/6K1 w - - 4 70', moves: ['a6a7', 'd4d1'], rating: 400 },
        { fen: '5rk1/p5pp/2ppp3/4p2R/4N1q1/5Q2/PPP3P1/1K6 w - - 3 22', moves: ['f3g4', 'f8f1', 'g4d1', 'f1d1'], rating: 400 },
        { fen: 'r7/3r1kp1/8/4B2R/7R/p6P/5PP1/2n2K2 w - - 8 33', moves: ['h4c4', 'd7d1'], rating: 400 },
        { fen: '8/R7/3P4/4p1p1/3rPp1k/5P2/5K2/8 b - - 0 46', moves: ['d4d6', 'a7h7', 'd6h6', 'h7h6'], rating: 400 },
        { fen: '2r3k1/1p4pp/6P1/2R2P1P/b7/P2R2K1/2n5/8 b - - 6 44', moves: ['c8c5', 'd3d8', 'a4e8', 'd8e8'], rating: 400 },
        { fen: '1n5k/6p1/4R2p/1p6/4B3/P3PK2/1P1q2PP/8 b - - 3 30', moves: ['b8d7', 'e6e8', 'd7f8', 'e8f8'], rating: 400 },
        { fen: '8/8/8/8/8/3r1k2/6R1/7K w - - 67 97', moves: ['g2h2', 'd3d1'], rating: 400 },
        { fen: '3r4/pB3R2/1p2p3/8/kP4b1/2P1B3/P4P2/4K3 w - - 1 29', moves: ['b7e4', 'd8d1'], rating: 400 },
        { fen: '6k1/1b3ppp/p1q5/2p3b1/1PQp4/P2P3P/5PP1/1R2rNK1 w - - 0 28', moves: ['b1e1', 'c6g2'], rating: 400 },
        { fen: '6k1/6p1/R5K1/8/p1r1p3/8/5P1P/8 b - - 11 40', moves: ['c4d4', 'a6a8', 'd4d8', 'a8d8'], rating: 400 },
        { fen: '1r4k1/5p1p/1R3Pp1/1p6/8/7P/6P1/3R2K1 b - - 0 31', moves: ['b8b6', 'd1d8'], rating: 400 },
        { fen: '2r3k1/R5p1/4p1pp/8/7r/1P6/P4PP1/3R2K1 w - - 0 32', moves: ['d1d7', 'c8c1', 'd7d1', 'c1d1'], rating: 403 }
    ],
};
