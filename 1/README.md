# Math Practice App

A browser-based math practice tool for students to drill addition and subtraction with small numbers around zero.

## File structure

- `index.html` – page structure (setup screen, practice screen, congratulations screen)
- `style.css` – styling for all screens, on-screen numpad, and language switcher
- `i18n.js` – localization resource strings (Czech default, English optional)
- `app.js` – application logic (problem generation, validation, navigation, numpad input, hints, link encryption)

## How it works

### 1. Setup screen

Displays the lesson topic (*"Lesson: adding and subtracting numbers (e.g. 3+4, -5+1-10)"*) and allows configuring the practice session:

| Parameter | Description |
|---|---|
| **Number of examples** | Total problems to generate (e.g. 10) |
| **Minimum term value** | Lowest value a term can take (e.g. -10) |
| **Maximum term value** | Highest value a term can take (e.g. 10) |
| **Min number of terms** | Smallest count of terms in an expression (must be ≥ 2, default 2) |
| **Max number of terms** | Largest count of terms (default 3) |
| **Secret word** | Optional secret word to reveal upon completion (e.g. "Dinosaur") |

- **Start**: begins the session immediately.
- **Generate Link**: symmetrically encrypts all criteria (including the selected language and secret word) into a shareable URL with a one-click copy button. When opened, the quiz directly starts using those criteria and in that specific language.

### 2. Practice screen

- A random expression is shown, e.g. `-8 - 1 = ?`
- The student enters their answer via:
  - Physical keyboard (type and press Enter/Next)
  - On-screen numeric keypad (click buttons)
- **Next** button or pressing Enter submits:
  - **Correct** → shows "Correct! ✅" briefly (600 ms), then advances automatically
  - **Wrong** → shows "Wrong – try again!", clears input, user stays on the same problem
- Progress is shown as `X / N` (e.g. `3 / 10`)
- **Hint** button under the problem:
  - 1st click: Color-codes each term in the problem, displays a number line box with stacked colored arrows representing each term (without number markers except 0), and changes button label to "More hint".
  - 2nd click ("More hint"): Reveals small tick marks for each number along the number line (with only 0 numbered).

### 3. Congratulations screen

After answering all N problems, a congratulatory message is shown.
- If a secret word was configured, a highlighted box reveals: *"You just revealed the secret: [Secret Word]"*.
- An instruction informs the student they can now close the page, or click **Start Again** to return to the setup screen.

## Problem generation

- The number of terms is randomly chosen between min-terms and max-terms (inclusive).
- Each term is a random integer between the configured min and max value.
- The first term is a bare value (can be negative).
- Every subsequent term is joined by a randomly chosen `+` or `-` operator.
- The operator is flipped when the term is negative so the expression reads naturally (e.g. `-1 + -10` becomes `-1 - 10`).

**Examples:**

| Config | Possible expressions |
|---|---|
| min=-10, max=10, terms=2 | `3 + 4`, `-2 + 9`, `3 + 0`, `-9 - 9`, `4 - 7` |
| min=-10, max=10, terms=2-3 | `3 - 6`, `5 - 2 + 6`, `-1 - 10`, `7 + 2 - 4` |

## On-screen numpad

A 3-column keypad below the answer input:

```
1   2   3
4   5   6
7   8   9
−   0   ←
C   Next (spans 2 cols)
```

| Button | Action |
|---|---|
| C | Clears the answer input |
| − | Toggles a leading minus sign on the current value |
| 0-9 | Appends the digit to the input |
| ← | Removes the last character (backspace) |
| Next | Submits the answer and advances to the next problem |

On mobile phone browsers, the native system software keyboard is suppressed for the answer edit box (`inputmode="none"` and `virtualkeyboardpolicy="manual"`), preventing it from covering the web page's keypad. Setup inputs (including the secret word) retain default browser keyboard behavior.

## Requirements / Feature list

1. Configurable session parameters (count, value range, term count range)
2. Interactive question-by-question practice
3. Correct/incorrect feedback (correct advances automatically, wrong stays on same problem)
4. Progress indicator (`X / N`)
5. On-screen numeric keypad with C, −, digits 0-9, backspace, and Next
6. Physical keyboard support preserved (Enter / type-and-enter)
7. Congratulations screen after completing all problems
8. Ability to restart and configure new criteria from the setup screen
9. Visual Hint system with interactive number line and term-by-term vector arrows
10. Optional Secret Word with encrypted shareable URL links for parents/teachers and secret reveal upon completion
11. Czech (default) and English localization with dedicated resource file (`i18n.js`) and top-bar language switcher (🇨🇿 / 🇬🇧)
12. Mobile keyboard management: suppresses native virtual keyboard exclusively on the answer input on mobile devices so it does not cover the custom keypad, while preserving standard keyboard input for quiz configuration fields.
