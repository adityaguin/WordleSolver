export class WordleSolver {
  constructor(data) {
    this.allWords = data.words;
    this.freq = data.freq;
    this.eliminated = new Set();
    this.guessHistory = [];
    this.answerFound = false;
    this.answer = null;
  }

  getActiveWords() {
    const active = [];
    for (let i = 0; i < this.allWords.length; i++) {
      if (!this.eliminated.has(i)) {
        active.push(this.allWords[i]);
      }
    }
    return active;
  }

  getRemainingCount() {
    return this.allWords.length - this.eliminated.size;
  }

  scoreAndRank(limit = 10) {
    const active = this.getActiveWords();

    // Letter frequency among remaining words
    const letterFreq = {};
    for (const word of active) {
      for (const ch of word) {
        letterFreq[ch] = (letterFreq[ch] || 0) + 1;
      }
    }

    // Score each word: sum of unique letter frequencies * word probability
    const scored = [];
    for (const word of active) {
      const seen = new Set();
      let amount = 0;
      for (const ch of word) {
        if (!seen.has(ch)) {
          amount += letterFreq[ch] || 0;
          seen.add(ch);
        }
      }
      const prob = this.freq[word] !== undefined ? this.freq[word] : 1e-10;
      scored.push({ word, score: amount * prob });
    }

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit);
  }

  applyGuess(guess, colors) {
    guess = guess.toUpperCase();
    colors = colors.toUpperCase();

    this.guessHistory.push({ word: guess, colors });

    // Check for all green — solved
    if (colors === 'GGGGG') {
      this.answerFound = true;
      this.answer = guess;
      return {
        remaining: 1,
        recommendations: [{ word: guess, score: 0 }],
        solved: true
      };
    }

    // Work with mutable arrays for the % sentinel logic
    const guessArr = [...guess];
    const colorsArr = [...colors];

    // Duplicate letter handling: G > O > B
    // When same letter has different colors, neutralize the weaker one with '%'
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        if (guessArr[i] === guessArr[j] && colorsArr[i] !== colorsArr[j]) {
          if (colorsArr[i] === 'B' && colorsArr[j] === 'G') {
            guessArr[i] = '%';
          } else if (colorsArr[i] === 'G' && colorsArr[j] === 'B') {
            guessArr[j] = '%';
          } else if (colorsArr[i] === 'B' && colorsArr[j] === 'O') {
            guessArr[i] = '%';
          } else if (colorsArr[i] === 'O' && colorsArr[j] === 'B') {
            guessArr[j] = '%';
          } else if (colorsArr[i] === 'O' && colorsArr[j] === 'G') {
            guessArr[i] = '%';
          } else if (colorsArr[i] === 'G' && colorsArr[j] === 'O') {
            guessArr[j] = '%';
          }
        }
      }
    }

    // Apply filtering
    for (let i = 0; i < 5; i++) {
      const color = colorsArr[i];
      const ch = guessArr[i];

      if (ch === '%') continue; // neutralized duplicate

      if (color === 'B') {
        // Eliminate all words containing this character
        for (let j = 0; j < this.allWords.length; j++) {
          if (this.eliminated.has(j)) continue;
          if (this.allWords[j].includes(ch)) {
            this.eliminated.add(j);
          }
        }
      } else if (color === 'O') {
        // Eliminate words that don't have ch elsewhere, or have ch at position i
        for (let j = 0; j < this.allWords.length; j++) {
          if (this.eliminated.has(j)) continue;
          const word = this.allWords[j];
          let containsElsewhere = false;
          for (let k = 0; k < 5; k++) {
            if (word[k] === ch && k !== i) {
              containsElsewhere = true;
              break;
            }
          }
          if (!containsElsewhere || word[i] === ch) {
            this.eliminated.add(j);
          }
        }
      } else if (color === 'G') {
        // Eliminate words where position i doesn't have this character
        for (let j = 0; j < this.allWords.length; j++) {
          if (this.eliminated.has(j)) continue;
          if (this.allWords[j][i] !== ch) {
            this.eliminated.add(j);
          }
        }
      }
    }

    const remaining = this.getRemainingCount();

    if (remaining === 1) {
      const active = this.getActiveWords();
      this.answerFound = true;
      this.answer = active[0];
      return {
        remaining: 1,
        recommendations: [{ word: active[0], score: 0 }],
        solved: true
      };
    }

    if (remaining === 0) {
      return { remaining: 0, recommendations: [], solved: false };
    }

    return {
      remaining,
      recommendations: this.scoreAndRank(10),
      solved: false
    };
  }

  reset() {
    this.eliminated = new Set();
    this.guessHistory = [];
    this.answerFound = false;
    this.answer = null;
  }
}
