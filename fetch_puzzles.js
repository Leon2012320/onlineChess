const https = require('https');

const categories = [
  { id: 'mateIn1', angle: 'mateIn1' },
  { id: 'mateIn2', angle: 'mateIn2' },
  { id: 'fork', angle: 'fork' },
  { id: 'pin', angle: 'pin' },
  { id: 'skewer', angle: 'skewer' },
  { id: 'endgame', angle: 'endgame' },
];

function fetchPuzzle(angle) {
  return new Promise((resolve, reject) => {
    const url = 'https://lichess.org/api/puzzle/next?angle=' + angle;
    https.get(url, { headers: { 'Accept': 'application/json' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch(e) { reject(e); }
      });
    }).on('error', reject);
  });
}

async function main() {
  const result = {};
  for (const cat of categories) {
    result[cat.id] = [];
    console.error('Fetching ' + cat.id + '...');
    for (let i = 0; i < 20; i++) {
      try {
        const data = await fetchPuzzle(cat.angle);
        // Check if we already have this puzzle
        const isDup = result[cat.id].some(p => p.id === data.puzzle.id);
        if (isDup) { i--; continue; }
        result[cat.id].push({
          id: data.puzzle.id,
          pgn: data.game.pgn,
          initialPly: data.puzzle.initialPly,
          solution: data.puzzle.solution,
          rating: data.puzzle.rating,
        });
        console.error('  ' + cat.id + ' #' + (i+1) + ' id=' + data.puzzle.id);
        // Small delay to not hit rate limit
        await new Promise(r => setTimeout(r, 300));
      } catch(e) {
        console.error('  Error: ' + e.message);
        await new Promise(r => setTimeout(r, 1000));
        i--;
      }
    }
  }
  console.log(JSON.stringify(result, null, 2));
}

main().catch(e => console.error(e));
