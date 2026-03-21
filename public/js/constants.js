// ============================================
// Konstanten für das Schachspiel
// ============================================

const BOARD_SIZE = 8;
const TILE_SIZE = 80;
const BOARD_OFFSET_X = 40;
const BOARD_OFFSET_Y = 40;

const COLORS = {
    LIGHT_TILE: 0xf0d9b5,
    DARK_TILE: 0xb58863,
    HIGHLIGHT: 0x7fc97f,
    SELECTED: 0x5bc85b,
    LAST_MOVE: 0xcdd26a,
    CHECK: 0xe74c3c,
};

// Figuren-Typen
const PIECE = {
    KING: 'king',
    QUEEN: 'queen',
    ROOK: 'rook',
    BISHOP: 'bishop',
    KNIGHT: 'knight',
    PAWN: 'pawn',
};

// Farben
const COLOR = {
    WHITE: 'white',
    BLACK: 'black',
};

// Unicode Schachfiguren
const PIECE_UNICODE = {
    white: {
        king: '\u2654',
        queen: '\u2655',
        rook: '\u2656',
        bishop: '\u2657',
        knight: '\u2658',
        pawn: '\u2659',
    },
    black: {
        king: '\u265A',
        queen: '\u265B',
        rook: '\u265C',
        bishop: '\u265D',
        knight: '\u265E',
        pawn: '\u265F',
    },
};

// Startaufstellung
const INITIAL_BOARD = [
    ['bR', 'bN', 'bB', 'bQ', 'bK', 'bB', 'bN', 'bR'],
    ['bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP'],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    ['wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP'],
    ['wR', 'wN', 'wB', 'wQ', 'wK', 'wB', 'wN', 'wR'],
];

// Kurzform zu vollem Namen
function pieceFromCode(code) {
    if (!code) return null;
    const colorChar = code[0];
    const pieceChar = code[1];
    const color = colorChar === 'w' ? COLOR.WHITE : COLOR.BLACK;
    const pieceMap = {
        K: PIECE.KING,
        Q: PIECE.QUEEN,
        R: PIECE.ROOK,
        B: PIECE.BISHOP,
        N: PIECE.KNIGHT,
        P: PIECE.PAWN,
    };
    return { color, type: pieceMap[pieceChar] };
}
