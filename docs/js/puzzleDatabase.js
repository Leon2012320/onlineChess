// ============================================
// Puzzle- & Übungs-Datenbank
// Übungen: Feste FEN-Positionen, Gegner spielt zufällig
// Puzzles: Von Lichess API geladen
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
    { id: 'mateIn1', name: 'Matt in 1 Zug', icon: '1\u2658', type: 'puzzle', angle: 'mateIn1' },
    { id: 'mateIn2', name: 'Matt in 2 Zügen', icon: '2\u2658', type: 'puzzle', angle: 'mateIn2' },
    { id: 'fork', name: 'Gabel', icon: '\u2658', type: 'puzzle', angle: 'fork' },
    { id: 'pin', name: 'Fesselung', icon: '\u2657', type: 'puzzle', angle: 'pin' },
    { id: 'skewer', name: 'Spieß', icon: '\u2656', type: 'puzzle', angle: 'skewer' },
    { id: 'endgame', name: 'Endspiele', icon: '\u2659', type: 'puzzle', angle: 'endgame' },
];

const ALL_CATEGORIES = [...EXERCISE_CATEGORIES, ...PUZZLE_CATEGORIES];
