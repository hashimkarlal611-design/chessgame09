# AI Chess Coach
Play chess against Stockfish (WASM, in-browser) with a live evaluation bar and move history.

## Run
    npm install
    npm run dev

Stack: React + Vite, chess.js (rules), Stockfish 19 lite (single-threaded WASM Web Worker).
Difficulty levels are approximate (Skill Level + depth + random-move chance), not calibrated ratings.

## License note
Stockfish is GPL-3.0. If you distribute it with your project, license the project under GPL-3.0 (decide in the GitHub phase).
