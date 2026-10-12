# Lesson 2: Multiplication / Malá násobilka

A practice tool for students to master multiplication of small numbers (e.g. `3 · 5`, `2 · 0`, `8 · 2`).

## File structure

- `index.html` – page structure (setup screen, practice screen, congratulations screen)
- `app.js` – lesson application logic (problem generation, criteria handling)
- `../shared/style.css` – shared stylesheet
- `../shared/i18n.js` – shared localization dictionaries (Czech & English)
- `../shared/common.js` – shared engine (cipher, numpad/keyboard binding, localization switcher)

## How it works

### 1. Setup screen

The user configures the multiplication practice session:

| Parameter | Description | Default |
|---|---|---|
| **Number of examples** (`Počet příkladů`) | Total problems to generate | `10` |
| **Max value of 1st factor** (`Max. hodnota 1. činitele`) | Maximum value for the first term (can be 0) | `10` |
| **Max value of 2nd factor** (`Max. hodnota 2. činitele`) | Maximum value for the second term (can be 0) | `10` |
| **Secret word** (`Tajenka`) | Optional secret word to reveal upon completion | *empty* |

- **Task sample preview**: Compact single-line preview of a sample multiplication problem generated from current limits (e.g. `3 · 5 = ?`), dynamically refreshed on factor limit changes, with a refresh icon button to roll another sample.
- **Start**: begins the session immediately.
- **Generate Link**: symmetrically encrypts all criteria (including the selected language and secret word) into a shareable URL with a one-click copy button. When opened, the quiz directly starts using those criteria.

### 2. Practice screen

- A random multiplication expression is shown, e.g. `3 · 5 = ?`
- Values range from 0 up to the configured factor limits.
- The order of factors is randomized, meaning maximum limits of 3 and 10 will generate expressions like `3 · 5` or `8 · 2` (one factor ≤ 3, the other ≤ 10).
- The student enters their answer via:
  - Physical keyboard (type and press Enter)
  - On-screen numeric keypad (click buttons)
- **Next** button submits:
  - **Correct** → shows "Correct! ✅" briefly, then advances automatically
  - **Wrong** → shows "Wrong – try again!", clears input, user stays on the same problem
- **Hint (Nápověda)**:
  - Opens the multiplication tables corresponding to the numbers in the problem (e.g. for `3 · 5`, displays the tables for 3 and 5).
  - All lines initially display question marks `?` instead of results.
  - The target problem line is highlighted in green (e.g. `3 · 5 = ?` in table 3 and `5 · 3 = ?` in table 5).
  - On the first hint click, one randomly chosen result is revealed as a clue.
  - On each subsequent click ("More hint" / "Další nápověda"), an additional clue is revealed.
  - **Sibling protection rule**: The target line itself and its adjacent sibling rows (e.g. `2 · 5`, `4 · 5` in table 5, and `3 · 4`, `3 · 6` in table 3) are never revealed by hints, encouraging the student to calculate the final step themselves.
  - Clicking hint buttons preserves cursor focus directly inside the answer box for seamless typing on desktop.
  - **Mobile phone optimization**: The system onscreen keyboard is suppressed for the answer input (`inputmode="none"`, `virtualkeyboardpolicy="manual"`, and touch-aware focus management) so it does not obstruct the on-screen keypad. Setup configuration inputs (e.g. secret word, factor limits) maintain standard browser keyboard behavior.

### 3. Congratulations screen

- Shown after all problems are answered correctly.
- If a secret word was entered, it is revealed in a special banner.
- An instruction informs the student they can now close the page, or click **Start Again** to return to the setup screen.
