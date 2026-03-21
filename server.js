// ============================================
// Einfacher statischer Server
// ============================================

const express = require('express');
const path = require('path');

const app = express();

// Statische Dateien aus /public bereitstellen
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`\n  Schach vs Engine laeuft!`);
    console.log(`  Oeffne http://localhost:${PORT} im Browser\n`);
});
