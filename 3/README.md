# Lesson 3: Expressions with Variable / Výrazy s proměnnou

A math practice tool for students to drill addition and subtraction of algebraic expressions with variable `x` and numerical constants (e.g. `3 + 4x - 2 - 6x`).

## File structure

- `index.html` – page structure (setup screen, practice screen, congratulations screen)
- `app.js` – lesson application logic (expression generation, parsing, validation, dual number line rendering)
- `../shared/style.css` – shared stylesheet (responsive layouts, 4-column numpad, dual number lines)
- `../shared/i18n.js` – shared localization dictionaries (Czech & English)
- `../shared/common.js` – shared engine (cipher, numpad/keyboard binding, localization switcher)

## How it works

### 1. Setup screen

The user configures the algebraic expression practice session:

| Parameter | Description | Default |
|---|---|---|
| **Number of examples** (`Počet příkladů`) | Total problems to generate | `10` |
| **Maximum term value** (`Max. hodnota členu`) | Maximum absolute value for both constants and variable coefficients | `10` |
| **Result range (from - to)** (`Min./Max. výsledek`) | Allowed range for both constant running total and variable running total | `-20 .. 20` |
| **Min/Max constant terms** (`Počet číselných členů`) | Number of constant terms (can be 0) | `2 .. 3` |
| **Min/Max variable terms** (`Počet členů s proměnnou`) | Number of variable terms with `x` (can be 0) | `2 .. 2` |
| **Secret word** (`Tajenka`) | Optional secret word to reveal upon completion | *empty* |

- **Task sample preview**: Compact single-line preview of a sample expression generated from the current criteria (e.g. `3 + 4x - 2 = ?`), dynamically refreshed on criteria changes, with a refresh icon button to roll another sample.
- **Start**: begins the session immediately.
- **Generate Link**: symmetrically encrypts all criteria (including language and secret word) into a shareable URL with a one-click copy button. When opened, the quiz directly starts using those criteria.
- **Lesson 1 equivalence**: Setting variable terms to `0 .. 0` turns the practice session into standard integer addition/subtraction identical to Lesson 1.

### 2. Practice screen

- A random expression is shown, e.g. `3 + 4x - 2 - 6x = ?`
- Constant terms and variable terms are interleaved naturally.
- The student enters their answer via:
  - Physical keyboard (type and press Enter)
  - On-screen 4-column keypad (click buttons)
- **Flexible & robust answer parsing**:
  - Whitespace is ignored.
  - Commutative order is fully accepted: `5x + 7` and `7 + 5x` are equivalent; `x - 4` and `-4 + x` are equivalent.
  - Implicit coefficient `1` and `-1`: `x` is recognized as `1x`, `-x` as `-1x`.
  - Optional zeros: `4x`, `4x + 0`, and `0 + 4x` are all accepted. If the variable cancels to 0, `5`, `5 + 0x`, and `0x + 5` are accepted.
  - Case-insensitive: uppercase `X` and lowercase `x` are both supported.
  - Full simplification required: entering uncombined terms (such as `2x + 2x + 3`) prompts the user to simplify like terms.
- **Next** button submits:
  - **Correct** → shows "Correct! ✅" briefly (600 ms), then advances automatically
  - **Wrong** → shows specific feedback (e.g. wrong answer, invalid syntax, or uncombined terms), clears input, user stays on the same problem
- **Hint (Nápověda)**:
  - **1st click**: Color-codes each term in the problem expression and reveals two stacked number lines:
    1. **Numbers (Čísla)**: vector arrows showing the sequential additions/subtractions of constant numbers.
    2. **Variable terms (Členy s proměnnou x)**: vector arrows showing the sequential additions/subtractions of $x$-coefficients.
    *(If constant terms or variable terms are 0, the unused number line is automatically hidden).*
  - **2nd click ("More hint" / "Další nápověda")**: Reveals tick marks along the axes for easy reading.
- **Mobile optimization**: Native virtual keyboard is suppressed for the answer input (`inputmode="none"`, `virtualkeyboardpolicy="manual"`) so it does not obstruct the on-screen keypad. Setup configuration inputs maintain standard browser keyboard behavior.

### 3. Congratulations screen

- Shown after all problems are answered correctly.
- If a secret word was entered, it is revealed in a special banner.
- An instruction informs the student they can now close the page, or click **Start Again** to return to the setup screen.

## On-screen numpad

A 4-column layout below the answer input:

```text
1   2   3   +
4   5   6   −
7   8   9   x
C   0   ←   Next
```

| Button | Action |
|---|---|
| C | Clears the answer input |
| 0–9 | Appends digit |
| + / − | Appends operator |
| x | Appends variable `x` |
| ← | Backspace (removes last character) |
| Next | Submits answer |
