const fs = require('fs');
const path = require('path');

const solverDir = path.join(__dirname, '..');

// Read English.txt — one uppercase 5-letter word per line
const englishRaw = fs.readFileSync(path.join(solverDir, 'English.txt'), 'utf-8');
const wordSet = new Set();
const allWords = [];

for (const line of englishRaw.split('\n')) {
  const w = line.trim();
  if (w.length === 5 && /^[A-Z]+$/.test(w)) {
    wordSet.add(w);
    allWords.push(w);
  }
}

console.log(`Loaded ${allWords.length} words from English.txt`);

// Read freq.txt — "word count" per line, extract matching 5-letter words
const freqRaw = fs.readFileSync(path.join(solverDir, 'freq.txt'), 'utf-8');
const rawCounts = {};
let total = 0;

for (const line of freqRaw.split('\n')) {
  const spaceIdx = line.indexOf(' ');
  if (spaceIdx === -1) continue;
  const word = line.substring(0, spaceIdx);
  const count = parseInt(line.substring(spaceIdx + 1), 10);
  if (isNaN(count)) continue;
  if (word.length !== 5) continue;
  if (!/^[a-zA-Z]+$/.test(word)) continue;

  const upper = word.toUpperCase();
  if (wordSet.has(upper)) {
    rawCounts[upper] = count;
    total += count;
  }
}

// Normalize to probabilities
const freq = {};
for (const [word, count] of Object.entries(rawCounts)) {
  freq[word] = count / total;
}

console.log(`Extracted ${Object.keys(freq).length} frequency entries (total count: ${total})`);

// Write output
const output = { words: allWords, freq };
const outPath = path.join(__dirname, 'data', 'words.json');
fs.writeFileSync(outPath, JSON.stringify(output));

const sizeKB = (fs.statSync(outPath).size / 1024).toFixed(1);
console.log(`Written ${outPath} (${sizeKB} KB)`);
