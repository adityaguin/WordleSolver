# WordleSolver

A Wordle solver that suggests optimal guesses based on letter frequency and word probability.

**Try it live:** [adityaguin.github.io/WordleSolver](https://adityaguin.github.io/WordleSolver/)

## Web App

A browser-based frontend — no installation needed. Just open the link above and:

1. Enter your 5-letter guess
2. Click the tiles to set colors (Black / Orange / Green) to match Wordle's feedback
3. Confirm and get the top recommended words for your next guess
4. Repeat until solved

**Features:**
- Top starting word suggestions
- Click recommendations to auto-fill your next guess
- Undo button to revert mistakes
- Keyboard shortcuts: press B / O / G to set tile colors, arrow keys to navigate tiles

## CLI Version (C++)

The original command-line solver.

### Setup

```bash
./comp.sh
```

### Usage

1. Open a Wordle game
2. Run the solver and enter your guess (all caps)
3. Enter the color feedback as a 5-character string: `B` = Black, `O` = Orange/Yellow, `G` = Green
4. Follow the recommendations and repeat

## How It Works

The solver scores candidate words by combining two signals:
- **Letter frequency** among remaining valid words (unique letters only)
- **Word probability** based on real-world English usage frequency

After each guess, words are eliminated based on Wordle's color feedback rules, including correct handling of duplicate letters.

## Data Credits

- Word list: [dwyl/english-words](https://github.com/dwyl/english-words)
- Word frequencies: [hermitdave/FrequencyWords](https://github.com/hermitdave/FrequencyWords)
