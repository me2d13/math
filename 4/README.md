# Lesson 4: Linear Equations / Lineární rovnice

A math practice tool for students to drill solving linear equations with variable `x` and numerical constants on both sides of the equation (e.g. `2x + 3 = x + 7`).

## File structure

- `index.html` – page structure (setup screen, practice screen, congratulations screen)
- `app.js` – lesson application logic (linear equation generation, non-fractional solution tuning, setup validation, share links)
- `../shared/style.css` – shared stylesheet (responsive layouts, setup screens, numpads)
- `../shared/i18n.js` – shared localization dictionaries (Czech & English)
- `../shared/common.js` – shared engine (cipher, numpad/keyboard binding, localization switcher)

## How it works

### 1. Setup screen

The user configures the linear equations practice session:

| Parameter | Description | Default |
|---|---|---|
| **Number of examples** (`Počet příkladů`) | Total problems to generate | `10` |
| **Maximum term value** (`Max. hodnota členu`) | Maximum absolute value for both constants and variable coefficients | `10` |
| **Result range (from - to)** (`Min./Max. výsledek`) | Range of integer solutions $x$ allowed | `-20 .. 20` |
| **Min/Max constant terms** (`Počet číselných členů`) | Number of constant terms (can be 0) | `2 .. 3` |
| **Min/Max variable terms** (`Počet členů s proměnnou`) | Number of variable terms with `x` (must be $\ge 1$) | `2 .. 2` |
| **Secret word** (`Tajenka`) | Optional secret word to reveal upon completion | *empty* |

- **Sample problem preview**: Compact live preview of a sample linear equation generated from current criteria (e.g. `2x + 3 = x + 7`), dynamically refreshed on criteria changes, with a refresh icon button to roll another sample.
- **Start**: begins the session immediately.
- **Generate Link**: symmetrically encrypts all criteria (including language and secret word) into a shareable URL with a one-click copy button. When opened, the quiz directly starts using those criteria.

### 2. Equation generation & guaranteed integer solutions

- Terms (variables and constants) are distributed randomly across the left-hand side (LHS) and right-hand side (RHS) of the equation.
- Both sides are guaranteed to have at least one term.
- Net coefficient of $x$ across both sides ($A = V_L - V_R$) is guaranteed non-zero ($A \neq 0$).
- When constant terms are present, the **last non-variable term is tuned** so that the solution $x$ is strictly an integer within `[minRes, maxRes]`, avoiding fractional solutions.
- The order of terms on each side is shuffled for natural presentation.

### 3. Practice screen

The student solves each linear equation step-by-step or enters the final result directly. Above the numpad is a mode switcher with four operations:

1. **Simplify left (`[ ← ] Vlevo / Left side`)**:
   - The student simplifies the left side by combining like terms (identical to Lesson 3 practice).
   - The entered expression must be mathematically equal to the current left-hand side, and the number of terms must decrease.
   - Clicking **Step (`Krok`)** adds a new line under the equation showing the simplified left side, while the right side remains unchanged.

2. **Simplify right (`[ → ] Vpravo / Right side`)**:
   - Works the same way as simplifying the left side, but for the right-hand side.

3. **Apply to both sides (`[ | +? ] Obě strany / Both sides`)**:
   - The student enters an equivalent operation to apply to both sides simultaneously:
     - **Additive operations**: signed terms like `-4`, `+3x`, `x`, `-x`, or multiple terms at once like `+3-4x` or `-2x+5`.
       - For each term, it is applied to the first term of the same type on that side.
       - If a term reaches $0$, it is cleanly removed (e.g. adding `-3x` to `4 + 3x` leaves `4`).
       - If all terms cancel out on a side, it displays `0`.
     - **Multiplication**: e.g. `· 2`, `* -1` (numbers only; multiplying by zero or variable terms is disallowed).
     - **Division**: e.g. `: 2`, `/ 3` (numbers only; dividing by zero or variable terms is disallowed).
       - If division would produce a fractional number on any term, the step is rejected with a helpful message: *"Dělení by vytvořilo zlomek. Zvolte jiné číslo."*
   - Clicking **Step (`Krok`)** computes the result for both sides and appends a new line with an operation note badge (e.g. `| -3x`, `| : 2`).

4. **Enter result (`[ x = ? ] Výsledek / Result`)**:
   - The student can enter the final value of $x$ directly at any time (e.g. `4` or `x = 4`).
   - The action button displays **Next (`Další`)**.
   - If correct, the final line `x = ...` is confirmed, feedback *"Správně! ✅"* is shown, and the exercise advances.

**Automatic solution detection**:
Whenever a step in any mode simplifies the equation to the final form ($x = \text{number}$ or $\text{number} = x$), the problem is automatically recognized as solved and advances to the next problem!

## On-screen numpad

A 4-column layout customized for linear equations:

```text
1   2   3   +
4   5   6   −
7   8   9   ·
:   0   x   ←
C   [ Step / Next ]
```

| Button | Action |
|---|---|
| C | Clears the answer input |
| 0–9 | Appends digit |
| + / − | Appends operator |
| · | Multiplies both sides |
| : | Divides both sides |
| x | Appends variable `x` |
| ← | Backspace (removes last character) |
| Step / Next | Performs the current step or submits final answer |

*Buttons that are not applicable in a given mode (such as `·` and `:` during simplification or `x` in final result mode) are automatically disabled.*
