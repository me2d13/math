// Shared localization dictionary for Math Practice App
// Supports Czech ('cs', default) and English ('en')
const I18N = {
  cs: {
    pageTitle: "Procvičování matematiky",
    appTitle: "Procvičování matematiky",
    setupPrompt: "Nastavte si parametry cvičení:",
    totalCountLabel: "Počet příkladů:",
    sampleTaskLabel: "Ukázka příkladu:",
    refreshSampleTitle: "Vygenerovat jinou ukázku",
    secretWordLabel: "Tajenka (volitelné):",
    secretWordPlaceholder: "např. Dinosaurus, Poklad...",
    startBtn: "Spustit",
    genLinkBtn: "Vygenerovat odkaz",
    linkLabel: "Sdílejte tento odkaz se studentem:",
    copyBtn: "Kopírovat",
    copiedBtn: "Zkopírováno! ✓",

    errTotalCount: "Počet příkladů musí být alespoň 1.",
    errInvalidLink: "Nepodařilo se načíst kvíz z odkazu. Neplatné parametry.",

    answerPlaceholder: "Tvůj výsledek",
    allLessons: "← Všechny lekce",
    hintBtn: "Nápověda",
    moreHintBtn: "Další nápověda",
    nextBtn: "Další",

    errPleaseEnterNumber: "Zadejte prosím číslo.",
    feedbackCorrect: "Správně! ✅",
    feedbackWrong: "Špatně – zkus to znovu!",

    congratsTitle: "🎉 Gratulujeme! 🎉",
    congratsMsg: "Úspěšně jsi dokončil všechny příklady!",
    secretRevealHeading: "Právě jsi odhalil tajenku:",
    congratsInstruction: "Nyní můžeš stránku zavřít, nebo kliknout na tlačítko níže a začít znovu.",
    restartBtn: "Začít znovu",

    // Lesson 1 strings
    lessonInfo: "Lekce: sčítání a odčítání celých čísel (např. 3+4, -5+1-10)",
    lesson1Info: "Lekce: sčítání a odčítání celých čísel (např. 3+4, -5+1-10)",
    minValLabel: "Minimální hodnota členu:",
    maxValLabel: "Maximální hodnota členu:",
    minTermsLabel: "Minimální počet členů:",
    maxTermsLabel: "Maximální počet členů:",
    errMinMax: "Minimální hodnota musí být menší než maximální hodnota.",
    errMinTerms: "Minimální počet členů musí být alespoň 2.",
    errTermsOrder: "Minimální počet členů musí být ≤ maximální počet členů.",

    // Lesson 2 strings
    lesson2Info: "Lekce: malá násobilka (např. 3 · 5, 2 · 0, 8 · 2)",
    maxVal1Label: "Maximální hodnota 1. činitele:",
    maxVal2Label: "Maximální hodnota 2. činitele:",
    errMaxVal1: "Maximální hodnota 1. činitele musí být alespoň 0.",
    errMaxVal2: "Maximální hodnota 2. činitele musí být alespoň 0.",
    tableTitle: "Násobilka čísla {n}"
  },
  en: {
    pageTitle: "Math Practice",
    appTitle: "Math Practice",
    setupPrompt: "Configure your practice session:",
    totalCountLabel: "Number of examples:",
    sampleTaskLabel: "Sample problem:",
    refreshSampleTitle: "Generate another sample",
    secretWordLabel: "Secret word (optional):",
    secretWordPlaceholder: "e.g. Dinosaur, Treasure...",
    startBtn: "Start",
    genLinkBtn: "Generate Link",
    linkLabel: "Share this link with the student:",
    copyBtn: "Copy",
    copiedBtn: "Copied! ✓",

    errTotalCount: "Number of examples must be at least 1.",
    errInvalidLink: "Could not load quiz from link. Invalid parameters.",

    answerPlaceholder: "Your answer",
    allLessons: "← All lessons",
    hintBtn: "Hint",
    moreHintBtn: "More hint",
    nextBtn: "Next",

    errPleaseEnterNumber: "Please enter a number.",
    feedbackCorrect: "Correct! ✅",
    feedbackWrong: "Wrong – try again!",

    congratsTitle: "🎉 Congratulations! 🎉",
    congratsMsg: "You completed all the practice problems!",
    secretRevealHeading: "You just revealed the secret:",
    congratsInstruction: "You can now close this page, or click below to start again.",
    restartBtn: "Start Again",

    // Lesson 1 strings
    lessonInfo: "Lesson: adding and subtracting numbers (e.g. 3+4, -5+1-10)",
    lesson1Info: "Lesson: adding and subtracting numbers (e.g. 3+4, -5+1-10)",
    minValLabel: "Minimum term value:",
    maxValLabel: "Maximum term value:",
    minTermsLabel: "Min number of terms:",
    maxTermsLabel: "Max number of terms:",
    errMinMax: "Minimum value must be less than maximum value.",
    errMinTerms: "Minimum number of terms must be at least 2.",
    errTermsOrder: "Min terms must be ≤ max terms.",

    // Lesson 2 strings
    lesson2Info: "Lesson: multiplication of small numbers (e.g. 3 · 5, 2 · 0, 8 · 2)",
    maxVal1Label: "Maximum value of 1st factor:",
    maxVal2Label: "Maximum value of 2nd factor:",
    errMaxVal1: "Maximum value of 1st factor must be at least 0.",
    errMaxVal2: "Maximum value of 2nd factor must be at least 0.",
    tableTitle: "Multiplication table for {n}"
  }
};
