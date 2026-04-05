import { WordleSolver } from './solver.js';

const MAX_GUESSES = 6;
const WORD_LENGTH = 5;
const COLOR_CYCLE = ['B', 'O', 'G'];

let solver = null;
let currentRow = 0;
let phase = 'input'; // 'input' | 'coloring' | 'done'
let activeTileIndex = -1; // for keyboard color setting

const board = document.getElementById('game-board');
const guessInput = document.getElementById('guess-input');
const submitBtn = document.getElementById('submit-btn');
const confirmBtn = document.getElementById('confirm-btn');
const colorInstructions = document.getElementById('color-instructions');
const status = document.getElementById('status');
const recList = document.getElementById('rec-list');
const undoBtn = document.getElementById('undo-btn');
const newGameBtn = document.getElementById('new-game-btn');

// ── Build Board ──
function buildBoard() {
  board.innerHTML = '';
  for (let r = 0; r < MAX_GUESSES; r++) {
    const row = document.createElement('div');
    row.className = 'board-row';
    row.dataset.row = r;
    for (let c = 0; c < WORD_LENGTH; c++) {
      const tile = document.createElement('div');
      tile.className = 'tile';
      tile.dataset.row = r;
      tile.dataset.col = c;
      tile.dataset.color = '';
      row.appendChild(tile);
    }
    board.appendChild(row);
  }
}

function getTile(row, col) {
  return board.querySelector(`.tile[data-row="${row}"][data-col="${col}"]`);
}

function getTilesForRow(row) {
  const tiles = [];
  for (let c = 0; c < WORD_LENGTH; c++) {
    tiles.push(getTile(row, c));
  }
  return tiles;
}

// ── Render Recommendations ──
function renderRecommendations(recs, title = 'Recommendations') {
  document.querySelector('#recommendations h2').textContent = title;
  recList.innerHTML = '';
  const total = recs.reduce((sum, r) => sum + r.score, 0);
  for (let i = 0; i < recs.length; i++) {
    const pct = total > 0 ? (recs[i].score / total * 100).toFixed(2) : '0.00';
    const li = document.createElement('li');
    li.innerHTML = `
      <span class="rec-rank">${i + 1}.</span>
      <span class="rec-word">${recs[i].word}</span>
      <span class="rec-score">${pct}%</span>
    `;
    li.style.cursor = 'pointer';
    li.addEventListener('click', () => {
      if (phase === 'input') {
        guessInput.value = recs[i].word;
        guessInput.focus();
      }
    });
    recList.appendChild(li);
  }
}

function setStatus(msg, type = '') {
  status.textContent = msg;
  status.className = type;
}

function updateUndoBtn() {
  undoBtn.disabled = !solver || !solver.canUndo() || phase === 'coloring';
}

// ── Tile Color Cycling ──
function cycleTileColor(tile) {
  const current = tile.dataset.color;
  const idx = COLOR_CYCLE.indexOf(current);
  const next = COLOR_CYCLE[(idx + 1) % COLOR_CYCLE.length];
  tile.dataset.color = next;
  tile.classList.add('pop');
  setTimeout(() => tile.classList.remove('pop'), 100);
}

function setTileColor(tile, color) {
  if (COLOR_CYCLE.includes(color)) {
    tile.dataset.color = color;
    tile.classList.add('pop');
    setTimeout(() => tile.classList.remove('pop'), 100);
  }
}

function highlightActiveTile(index) {
  const tiles = getTilesForRow(currentRow);
  tiles.forEach((t, i) => {
    t.style.outline = i === index ? '2px solid #fff' : '';
  });
  activeTileIndex = index;
}

// ── Submit Guess (Phase: input → coloring) ──
function handleSubmitGuess() {
  const guess = guessInput.value.toUpperCase().trim();
  if (guess.length !== WORD_LENGTH || !/^[A-Z]+$/.test(guess)) {
    setStatus('Enter a 5-letter word', 'error');
    return;
  }

  // Fill current row tiles
  const tiles = getTilesForRow(currentRow);
  for (let i = 0; i < WORD_LENGTH; i++) {
    tiles[i].textContent = guess[i];
    tiles[i].classList.add('filled', 'clickable');
    tiles[i].dataset.color = 'B'; // default to Black
  }

  guessInput.value = '';
  phase = 'coloring';
  submitBtn.disabled = true;
  guessInput.disabled = true;
  confirmBtn.classList.add('visible');
  colorInstructions.classList.add('visible');
  setStatus('Click tiles to set colors, then confirm');
  highlightActiveTile(0);
}

// ── Confirm Colors (Phase: coloring → input or done) ──
function handleConfirmColors() {
  const tiles = getTilesForRow(currentRow);
  const guess = tiles.map(t => t.textContent).join('');
  const colors = tiles.map(t => t.dataset.color).join('');

  // Remove clickable state
  tiles.forEach(t => {
    t.classList.remove('clickable');
    t.style.outline = '';
  });

  const result = solver.applyGuess(guess, colors);

  confirmBtn.classList.remove('visible');
  colorInstructions.classList.remove('visible');
  activeTileIndex = -1;
  updateUndoBtn();

  if (result.solved) {
    setStatus(`${result.recommendations[0].word} is the answer!`, 'solved');
    renderRecommendations(result.recommendations, 'Answer');
    phase = 'done';
    submitBtn.disabled = true;
    guessInput.disabled = true;
    return;
  }

  if (result.remaining === 0) {
    setStatus('No valid words remaining!', 'error');
    phase = 'done';
    submitBtn.disabled = true;
    guessInput.disabled = true;
    return;
  }

  setStatus(`${result.remaining} words remaining`);
  renderRecommendations(result.recommendations);

  currentRow++;
  if (currentRow >= MAX_GUESSES) {
    setStatus('Out of guesses!', 'error');
    phase = 'done';
    submitBtn.disabled = true;
    guessInput.disabled = true;
    return;
  }

  phase = 'input';
  submitBtn.disabled = false;
  guessInput.disabled = false;
  guessInput.focus();
}

// ── Event Listeners ──
submitBtn.addEventListener('click', handleSubmitGuess);

guessInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && phase === 'input') {
    handleSubmitGuess();
  }
});

confirmBtn.addEventListener('click', handleConfirmColors);

board.addEventListener('click', (e) => {
  const tile = e.target.closest('.tile');
  if (!tile || phase !== 'coloring') return;
  if (parseInt(tile.dataset.row) !== currentRow) return;
  cycleTileColor(tile);
  highlightActiveTile(parseInt(tile.dataset.col));
});

document.addEventListener('keydown', (e) => {
  if (phase !== 'coloring') return;

  const key = e.key.toUpperCase();
  const tiles = getTilesForRow(currentRow);

  if (key === 'B' || key === 'O' || key === 'G') {
    if (activeTileIndex >= 0 && activeTileIndex < WORD_LENGTH) {
      setTileColor(tiles[activeTileIndex], key);
      // Auto-advance to next tile
      if (activeTileIndex < WORD_LENGTH - 1) {
        highlightActiveTile(activeTileIndex + 1);
      }
    }
    e.preventDefault();
  } else if (key === 'ARROWRIGHT') {
    highlightActiveTile(Math.min(activeTileIndex + 1, WORD_LENGTH - 1));
    e.preventDefault();
  } else if (key === 'ARROWLEFT') {
    highlightActiveTile(Math.max(activeTileIndex - 1, 0));
    e.preventDefault();
  } else if (key === 'ENTER') {
    handleConfirmColors();
    e.preventDefault();
  }
});

undoBtn.addEventListener('click', () => {
  if (!solver || !solver.canUndo()) return;
  const result = solver.undo();
  currentRow--;

  // Clear the undone row
  const tiles = getTilesForRow(currentRow);
  tiles.forEach(t => {
    t.textContent = '';
    t.className = 'tile';
    t.dataset.color = '';
    t.style.outline = '';
  });

  phase = 'input';
  submitBtn.disabled = false;
  guessInput.disabled = false;
  confirmBtn.classList.remove('visible');
  colorInstructions.classList.remove('visible');
  activeTileIndex = -1;

  setStatus(`${result.remaining} words remaining`);
  renderRecommendations(result.recommendations);
  updateUndoBtn();
  guessInput.focus();
});

newGameBtn.addEventListener('click', () => {
  solver.reset();
  currentRow = 0;
  phase = 'input';
  buildBoard();
  submitBtn.disabled = false;
  guessInput.disabled = false;
  confirmBtn.classList.remove('visible');
  colorInstructions.classList.remove('visible');
  activeTileIndex = -1;
  const recs = solver.scoreAndRank(10);
  renderRecommendations(recs, 'Top Starting Words');
  setStatus(`${solver.getRemainingCount()} words available`);
  updateUndoBtn();
  guessInput.focus();
});

// ── Init ──
async function init() {
  setStatus('Loading word data...');
  try {
    const resp = await fetch('data/words.json');
    const data = await resp.json();
    solver = new WordleSolver(data);
    buildBoard();
    const recs = solver.scoreAndRank(10);
    renderRecommendations(recs, 'Top Starting Words');
    setStatus(`${solver.getRemainingCount()} words available`);
    updateUndoBtn();
    guessInput.focus();
  } catch (err) {
    setStatus('Failed to load word data. Run preprocess.js first.', 'error');
    console.error(err);
  }
}

init();
