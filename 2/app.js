(function () {
  "use strict";

  const { t, randInt, setupNumpad, setupKeyboardInput, setupCopyButton, generateShareUrl, decryptParams, initLanguage, getCurrentLang, configureAnswerInput, focusAnswer } = window.MathAppCommon;

  // ---- state ----
  let totalProblems = 0;
  let currentProblem = 0;
  let currentExpression = "";
  let currentAnswer = 0;
  let currentSecretWord = "";
  let sessionMaxVal1 = 10;
  let sessionMaxVal2 = 10;

  // ---- elements ----
  const setupScreen = document.getElementById("setup-screen");
  const practiceScreen = document.getElementById("practice-screen");
  const congratsScreen = document.getElementById("congrats-screen");

  const totalCountInput = document.getElementById("total-count");
  const maxVal1Input = document.getElementById("max-val-1");
  const maxVal2Input = document.getElementById("max-val-2");
  const secretWordInput = document.getElementById("secret-word");
  const startBtn = document.getElementById("start-btn");
  const genLinkBtn = document.getElementById("gen-link-btn");
  const linkContainer = document.getElementById("link-container");
  const shareLinkInput = document.getElementById("share-link-input");
  const copyLinkBtn = document.getElementById("copy-link-btn");
  const setupError = document.getElementById("setup-error");
  const sampleTaskExpr = document.getElementById("sample-task-expr");
  const sampleRefreshBtn = document.getElementById("sample-refresh-btn");

  const problemDisplay = document.getElementById("problem-display");
  const hintBtn = document.getElementById("hint-btn");
  const hintBox = document.getElementById("hint-box");
  const multTablesContainer = document.getElementById("mult-tables-container");
  const answerInput = document.getElementById("answer-input");
  const numpad = document.getElementById("numpad");
  const progressText = document.getElementById("progress-text");
  const feedback = document.getElementById("feedback");

  const secretReveal = document.getElementById("secret-reveal");
  const secretWordDisplay = document.getElementById("secret-word-display");
  const restartBtn = document.getElementById("restart-btn");

  // ---- hint state ----
  let hintState = 0; // 0: hidden, >=1: visible
  let eligibleClues = [];
  let revealedKeys = new Set();

  function initHintForProblem(term1, term2) {
    hintState = 0;
    revealedKeys.clear();
    eligibleClues = [];

    hintBox.classList.add("hidden");
    hintBtn.textContent = t("hintBtn");
    hintBtn.disabled = false;

    // Determine tables to render
    // If factors are identical (e.g. 4 · 4), show only 1 table; otherwise show both
    const bases = (term1 === term2) ? [term1] : [term1, term2];
    const minK = (term1 === 0 || term2 === 0) ? 0 : 1;
    const maxK = Math.max(10, sessionMaxVal1, sessionMaxVal2, term1, term2);

    multTablesContainer.innerHTML = "";

    bases.forEach(function (base) {
      const targetMultiplier = (base === term1) ? term2 : term1;

      const card = document.createElement("div");
      card.className = "mult-table-card";

      const header = document.createElement("div");
      header.className = "mult-table-header";
      header.setAttribute("data-base", base);
      header.textContent = t("tableTitle", { n: base });
      card.appendChild(header);

      const body = document.createElement("div");
      body.className = "mult-table-body";

      for (let k = minK; k <= maxK; k++) {
        const isImpacted = (k === targetMultiplier);
        const isSibling = (k === targetMultiplier - 1 || k === targetMultiplier + 1);
        const isEligible = !isImpacted && !isSibling;
        const cellId = "mult-cell-" + base + "-" + k;

        if (isEligible) {
          eligibleClues.push({
            id: cellId,
            base: base,
            k: k,
            value: base * k
          });
        }

        const row = document.createElement("div");
        row.className = "mult-row" + (isImpacted ? " impacted" : "");

        const exprSpan = document.createElement("span");
        exprSpan.className = "mult-row-expr";
        exprSpan.textContent = base + " · " + k + " =";

        const ansSpan = document.createElement("span");
        ansSpan.id = cellId;
        ansSpan.className = "mult-row-ans";
        ansSpan.textContent = "?";

        row.appendChild(exprSpan);
        row.appendChild(ansSpan);
        body.appendChild(row);
      }

      card.appendChild(body);
      multTablesContainer.appendChild(card);
    });
  }

  function revealNextHint() {
    if (hintState === 0) {
      hintState = 1;
      hintBox.classList.remove("hidden");
      hintBtn.textContent = t("moreHintBtn");
    }

    const unrevealed = eligibleClues.filter(function (clue) {
      return !revealedKeys.has(clue.id);
    });

    if (unrevealed.length > 0) {
      const pickIdx = randInt(0, unrevealed.length - 1);
      const picked = unrevealed[pickIdx];
      revealedKeys.add(picked.id);

      const cell = document.getElementById(picked.id);
      if (cell) {
        cell.textContent = picked.value;
        cell.classList.add("revealed");
      }
    }

    if (revealedKeys.size >= eligibleClues.length) {
      hintBtn.disabled = true;
    }
  }

  // ---- problem generation ----
  function generateProblem(max1, max2) {
    const f1 = randInt(0, max1);
    const f2 = randInt(0, max2);
    let term1 = f1;
    let term2 = f2;
    // Randomize factor order so limits can appear on either side
    if (Math.random() < 0.5) {
      term1 = f2;
      term2 = f1;
    }
    const value = term1 * term2;
    const exprStr = term1 + " · " + term2;
    return { exprStr, value, term1, term2 };
  }

  // ---- sample task preview ----
  function updateSampleTask() {
    if (!sampleTaskExpr) return;
    const max1 = parseInt(maxVal1Input.value, 10);
    const max2 = parseInt(maxVal2Input.value, 10);

    if (isNaN(max1) || max1 < 0 || isNaN(max2) || max2 < 0) {
      sampleTaskExpr.textContent = "—";
      return;
    }

    const prob = generateProblem(max1, max2);
    sampleTaskExpr.textContent = prob.exprStr + " = ?";
    if (setupError) {
      setupError.textContent = "";
    }
  }

  // ---- screen navigation ----
  function showScreen(screen) {
    setupScreen.classList.add("hidden");
    practiceScreen.classList.add("hidden");
    congratsScreen.classList.add("hidden");
    screen.classList.remove("hidden");
  }

  function showNextProblem() {
    const prob = generateProblem(sessionMaxVal1, sessionMaxVal2);
    currentExpression = prob.exprStr;
    currentAnswer = prob.value;

    problemDisplay.textContent = currentExpression + " = ?";
    answerInput.value = "";
    feedback.textContent = "";
    feedback.className = "feedback";
    progressText.textContent = (currentProblem + 1) + " / " + totalProblems;

    initHintForProblem(prob.term1, prob.term2);

    focusAnswer(answerInput);
  }

  function checkAnswer() {
    const userAnswer = parseInt(answerInput.value, 10);
    if (isNaN(userAnswer)) {
      feedback.textContent = t("errPleaseEnterNumber");
      feedback.className = "feedback wrong";
      return;
    }

    if (userAnswer === currentAnswer) {
      feedback.textContent = t("feedbackCorrect");
      feedback.className = "feedback correct";
      setTimeout(function () {
        goNextProblem();
      }, 600);
    } else {
      feedback.textContent = t("feedbackWrong");
      feedback.className = "feedback wrong";
      answerInput.value = "";
      focusAnswer(answerInput);
    }
  }

  function goNextProblem() {
    currentProblem++;
    if (currentProblem >= totalProblems) {
      if (currentSecretWord && currentSecretWord.trim() !== "") {
        secretReveal.classList.remove("hidden");
        secretWordDisplay.textContent = currentSecretWord.trim();
      } else {
        secretReveal.classList.add("hidden");
        secretWordDisplay.textContent = "";
      }
      showScreen(congratsScreen);
    } else {
      showNextProblem();
    }
  }

  function readSetupCriteria() {
    const totalCount = parseInt(totalCountInput.value, 10);
    const maxVal1 = parseInt(maxVal1Input.value, 10);
    const maxVal2 = parseInt(maxVal2Input.value, 10);
    const secret = secretWordInput.value.trim();

    setupError.textContent = "";

    if (isNaN(totalCount) || totalCount < 1) {
      setupError.textContent = t("errTotalCount");
      return null;
    }
    if (isNaN(maxVal1) || maxVal1 < 0) {
      setupError.textContent = t("errMaxVal1");
      return null;
    }
    if (isNaN(maxVal2) || maxVal2 < 0) {
      setupError.textContent = t("errMaxVal2");
      return null;
    }

    return {
      lesson: 2,
      c: totalCount,
      m1: maxVal1,
      m2: maxVal2,
      s: secret,
      l: getCurrentLang()
    };
  }

  function startQuiz(totalCount, max1, max2, secret) {
    totalProblems = totalCount;
    currentProblem = 0;
    sessionMaxVal1 = max1;
    sessionMaxVal2 = max2;
    currentSecretWord = secret || "";

    showScreen(practiceScreen);
    showNextProblem();
  }

  // ---- event handlers ----
  startBtn.addEventListener("click", function () {
    const criteria = readSetupCriteria();
    if (!criteria) return;
    linkContainer.classList.add("hidden");
    startQuiz(criteria.c, criteria.m1, criteria.m2, criteria.s);
  });

  genLinkBtn.addEventListener("click", function () {
    const criteria = readSetupCriteria();
    if (!criteria) return;
    const shareUrl = generateShareUrl(criteria);
    shareLinkInput.value = shareUrl;
    linkContainer.classList.remove("hidden");
    shareLinkInput.select();
  });

  restartBtn.addEventListener("click", function () {
    showScreen(setupScreen);
    if (window.history && window.history.replaceState) {
      const cleanUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  });

  // ---- setup shared components ----
  setupCopyButton(copyLinkBtn, shareLinkInput);
  setupNumpad(numpad, answerInput, checkAnswer);
  setupKeyboardInput(answerInput, checkAnswer, false);
  configureAnswerInput(answerInput);

  // Sample task input listeners (only inputs impacting the task)
  [maxVal1Input, maxVal2Input].forEach(function (input) {
    input.addEventListener("input", updateSampleTask);
  });
  totalCountInput.addEventListener("input", function () {
    const val = parseInt(totalCountInput.value, 10);
    if (!isNaN(val) && val >= 1 && setupError && setupError.textContent === t("errTotalCount")) {
      setupError.textContent = "";
    }
  });
  if (sampleRefreshBtn) {
    sampleRefreshBtn.addEventListener("click", updateSampleTask);
  }

  // ---- URL parameter handling on start ----
  function checkUrlParams() {
    try {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("q");
      if (!token) return;

      const data = decryptParams(token);
      if (!data || typeof data.c !== "number" || typeof data.m1 !== "number" || typeof data.m2 !== "number") {
        setupError.textContent = t("errInvalidLink");
        return;
      }

      if (data.l && (data.l === "cs" || data.l === "en")) {
        window.MathAppCommon.setLanguage(data.l);
      }

      totalCountInput.value = data.c;
      maxVal1Input.value = data.m1;
      maxVal2Input.value = data.m2;
      if (data.s !== undefined) {
        secretWordInput.value = data.s;
      }
      updateSampleTask();

      startQuiz(data.c, data.m1, data.m2, data.s || "");
    } catch (e) {
      console.error("Error reading URL parameters:", e);
    }
  }

  // Hint button events (mousedown preventDefault keeps input focus)
  hintBtn.addEventListener("mousedown", function (e) {
    e.preventDefault();
  });

  hintBtn.addEventListener("click", function () {
    revealNextHint();
    focusAnswer(answerInput);
  });

  // Initialize language and URL handling
  initLanguage(function () {
    if (hintBtn) {
      hintBtn.textContent = hintState === 0 ? t("hintBtn") : t("moreHintBtn");
    }
    document.querySelectorAll(".mult-table-header[data-base]").forEach(function (el) {
      const base = el.getAttribute("data-base");
      el.textContent = t("tableTitle", { n: base });
    });
  });
  updateSampleTask();
  checkUrlParams();

})();
