// Localization dictionary for Math Practice App
// Default language is Czech ('cs'), with English ('en') support.
const I18N = {
  cs: {
    pageTitle: "Procvičování matematiky",
    appTitle: "Procvičování matematiky",
    lessonInfo: "Lekce: sčítání a odčítání celých čísel (např. 3+4, -5+1-10)",
    setupPrompt: "Nastavte si parametry cvičení:",
    totalCountLabel: "Počet příkladů:",
    minValLabel: "Minimální hodnota členu:",
    maxValLabel: "Maximální hodnota členu:",
    minTermsLabel: "Minimální počet členů:",
    maxTermsLabel: "Maximální počet členů:",
    secretWordLabel: "Tajenka (volitelné):",
    secretWordPlaceholder: "např. Dinosaurus, Poklad...",
    startBtn: "Spustit",
    genLinkBtn: "Vygenerovat odkaz",
    linkLabel: "Sdílejte tento odkaz se studentem:",
    copyBtn: "Kopírovat",
    copiedBtn: "Zkopírováno! ✓",

    errTotalCount: "Počet příkladů musí být alespoň 1.",
    errMinMax: "Minimální hodnota musí být menší než maximální hodnota.",
    errMinTerms: "Minimální počet členů musí být alespoň 2.",
    errTermsOrder: "Minimální počet členů musí být ≤ maximální počet členů.",
    errInvalidLink: "Nepodařilo se načíst kvíz z odkazu. Neplatné parametry.",

    answerPlaceholder: "Tvůj výsledek",
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
    restartBtn: "Začít znovu"
  },
  en: {
    pageTitle: "Math Practice",
    appTitle: "Math Practice",
    lessonInfo: "Lesson: adding and subtracting numbers (e.g. 3+4, -5+1-10)",
    setupPrompt: "Configure your practice session:",
    totalCountLabel: "Number of examples:",
    minValLabel: "Minimum term value:",
    maxValLabel: "Maximum term value:",
    minTermsLabel: "Min number of terms:",
    maxTermsLabel: "Max number of terms:",
    secretWordLabel: "Secret word (optional):",
    secretWordPlaceholder: "e.g. Dinosaur, Treasure...",
    startBtn: "Start",
    genLinkBtn: "Generate Link",
    linkLabel: "Share this link with the student:",
    copyBtn: "Copy",
    copiedBtn: "Copied! ✓",

    errTotalCount: "Number of examples must be at least 1.",
    errMinMax: "Minimum value must be less than maximum value.",
    errMinTerms: "Minimum number of terms must be at least 2.",
    errTermsOrder: "Min terms must be ≤ max terms.",
    errInvalidLink: "Could not load quiz from link. Invalid parameters.",

    answerPlaceholder: "Your answer",
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
    restartBtn: "Start Again"
  }
};
