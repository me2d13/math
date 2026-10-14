# 🧮 Math Practice / Procvičování matematiky

🌐 **Live App / Spustit online:** **https://me2d13.github.io/math/**

[English](#english) | [Čeština](#čeština)

---

<a name="english"></a>
## 🇬🇧 English

A lightweight, distraction-free web application designed to help children and students practice fundamental math skills through interactive drills.

### 🎯 Target Audience
- **Students / Children:** Simple, visual, and friendly interface to practice math at their own pace without stress or clutter.
- **Parents:** Quickly set up a drill with specific difficulty, optionally set a secret reward word, and send a direct link to the child.
- **Teachers & Tutors:** Generate tailored problem sets for classroom exercises or homework.

### 📚 Available Lessons
1. **[Lesson 1: Addition & Subtraction](./1/)** (`./1/`)
   - Drill addition and subtraction of integers around zero (e.g. `3 + 4`, `-5 + 1 - 10`).
   - Configurable max term value, customizable result range (e.g. 0..20 for non-negative practice, or -10..10), term counts, and example counts with live task sample preview.
   - Interactive on-screen number line with stacked vector arrows for visual hints.
   - On-screen telephone-style numpad and full physical keyboard support (native mobile keyboard is automatically suppressed for the answer box to avoid covering the on-screen keypad).
   - **Secret word challenge:** parents/teachers can set an encrypted link with an optional secret word that is revealed only when all problems are completed correctly.
   - Czech and English interface.

2. **[Lesson 2: Multiplication](./2/)** (`./2/`)
   - Practice multiplication of small numbers (e.g. `3 · 5`, `2 · 0`, `8 · 2`).
   - Configurable maximum values for each factor with order randomization.
   - Secret word challenge and encrypted shareable link.
   - On-screen telephone numpad & physical keyboard support (mobile onscreen keyboard suppressed on answer field).

3. **[Lesson 3: Expressions with Variable](./3/)** (`./3/`)
   - Practice simplifying algebraic expressions with variable `x` and numerical constants (e.g. `3 + 4x - 2 - 6x`).
   - Flexible answer parsing (commutative term order, optional explicit zeros, implicit coefficient `1`/`-1`, like-term simplification check).
   - Configurable term count ranges separated for constant numbers and variable terms.
   - Dual number line hint system (stacked vector arrows for constants and variable coefficients).
   - Custom 4-column on-screen keypad including `+` and `x`.
   - Secret word challenge and encrypted shareable link.
   - Czech and English interface.

4. **[Lesson 4: Linear Equations](./4/)** (`./4/`)
   - Practice solving linear equations with variable `x` and numerical constants on both sides (e.g. `2x + 3 = x + 7`).
   - Terms generated randomly across left and right sides of the equation.
   - Guaranteed non-fractional integer solutions (tuned via the last non-variable term).
   - Live sample equation preview and configurable term count ranges.
   - Secret word challenge and encrypted shareable link.
   - Czech and English interface.

*More lessons (division, fractions) are planned for future updates!*

### 🌐 Live Demo
The application is hosted via GitHub Pages: **https://me2d13.github.io/math/**

---

<a name="čeština"></a>
## 🇨🇿 Čeština

Jednoduchá a přehledná webová aplikace pro procvičování základních matematických operací formou interaktivních příkladů.

### 🎯 Cílová skupina
- **Žáci a studenti:** Čisté a přívětivé prostředí pro procvičování matematiky vlastním tempem bez rušivých prvků.
- **Rodiče:** Možnost snadno nastavit parametry příkladů, zadat tajenku (odměnu) a poslat studentovi přímý odkaz na kvíz.
- **Učitelé a lektoři:** Rychlé vytvoření procvičovacích sad pro výuku nebo domácí přípravu.

### 📚 Dostupné lekce
1. **[Lekce 1: Sčítání a odčítání](./1/)** (`./1/`)
   - Procvičování sčítání a odčítání celých čísel kolem nuly (např. `3 + 4`, `-5 + 1 - 10`).
   - Nastavitelná maximální hodnota členu, rozsah výsledku (např. 0..20 pro procvičování bez záporných čísel či -10..10), počet členů i celkový počet příkladů s živou ukázkou příkladu.
   - Vizuální nápověda pomocí interaktivní číselné osy s barevnými šipkami.
   - Virtuální klávesnice v telefonním rozložení i plná podpora běžné klávesnice (systémová klávesnice na mobilech se pro pole výsledku automaticky potlačuje, aby nezakrývala tlačítka na obrazovce).
   - **Kvíz s tajenkou:** rodič či učitel může zadat tajenku a vygenerovat šifrovaný odkaz, který studentovi odhalí tajenku až po úspěšném dokončení všech příkladů.
   - Možnost přepínání mezi češtinou (výchozí) a angličtinou.

2. **[Lekce 2: Malá násobilka](./2/)** (`./2/`)
   - Procvičování násobení malých čísel (např. `3 · 5`, `2 · 0`, `8 · 2`).
   - Nastavitelné maximální hodnoty pro jednotlivé činitele s náhodným prohazováním pořadí.
   - Kvíz s tajenkou a generování šifrovaného odkazu.
   - Telefonní klávesnice i běžná klávesnice (systémová klávesnice na mobilu nepotlačuje rozhraní lekce).

3. **[Lekce 3: Výrazy s proměnnou](./3/)** (`./3/`)
   - Procvičování sčítání a odčítání výrazů s proměnnou `x` a číselnými členy (např. `3 + 4x - 2 - 6x`).
   - Flexibilní parsování výsledku (libovolné pořadí členů, volitelná nula, koeficient `1` i `-1`, kontrola sloučení stejných členů).
   - Odděleně nastavitelný počet členů pro čísla a pro proměnnou x.
   - Dvojitá číselná osa pro nápovědu (šipky zvlášť pro čísla a zvlášť pro členy s x).
   - Virtuální klávesnice ve 4 sloupcích s tlačítky `+` a `x` i plná podpora běžné klávesnice.
   - Kvíz s tajenkou a šifrovaný odkaz.
   - Čeština i angličtina.

4. **[Lekce 4: Lineární rovnice](./4/)** (`./4/`)
   - Procvičování řešení lineárních rovnic s proměnnou `x` a číselnými členy na obou stranách (např. `2x + 3 = x + 7`).
   - Členy jsou náhodně rozdělovány na levou a pravou stranu rovnice.
   - Zaručená celočíselná řešení bez zlomků (dolaďováním posledního číselného členu).
   - Živá ukázka rovnice s možností přegenerování a nastavitelnými rozsahy.
   - Kvíz s tajenkou a šifrovaný odkaz.
   - Čeština i angličtina.

*Další lekce (dělení, zlomky) budou následovat v dalších verzích!*

### 🌐 Spuštění online
Aplikace je dostupná přes GitHub Pages: **https://me2d13.github.io/math/**
