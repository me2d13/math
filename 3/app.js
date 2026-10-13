(function () {
  "use strict";

  const {
    t,
    randInt,
    setupNumpad,
    setupExpressionKeyboardInput,
    setupCopyButton,
    generateShareUrl,
    decryptParams,
    initLanguage,
    getCurrentLang,
    configureAnswerInput,
    focusAnswer
  } = window.MathAppCommon;

  // ---- state ----
  let totalProblems = 0;
  let currentProblem = 0;
  let currentProblemData = null;
  let currentSecretWord = "";
  let sessionMaxVal = 10;
  let sessionMinRes = -20;
  let sessionMaxRes = 20;
  let sessionMinConstTerms = 2;
  let sessionMaxConstTerms = 3;
  let sessionMinVarTerms = 2;
  let sessionMaxVarTerms = 2;
  let hintState = 0; // 0: hidden, 1: hint shown (arrows), 2: more hint (ticks)

  const TERM_COLORS = ["#e53e3e", "#2b6cb0", "#2f855a", "#d69e2e", "#805ad5", "#319795"];

  // ---- DOM elements ----
  const setupScreen = document.getElementById("setup-screen");
  const practiceScreen = document.getElementById("practice-screen");
  const congratsScreen = document.getElementById("congrats-screen");

  const totalCountInput = document.getElementById("total-count");
  const maxValInput = document.getElementById("max-val");
  const minResInput = document.getElementById("min-res");
  const maxResInput = document.getElementById("max-res");
  const minConstTermsInput = document.getElementById("min-const-terms");
  const maxConstTermsInput = document.getElementById("max-const-terms");
  const minVarTermsInput = document.getElementById("min-var-terms");
  const maxVarTermsInput = document.getElementById("max-var-terms");
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
  const constLineSection = document.getElementById("const-line-section");
  const constLineSvg = document.getElementById("const-line-svg");
  const varLineSection = document.getElementById("var-line-section");
  const varLineSvg = document.getElementById("var-line-svg");

  const answerInput = document.getElementById("answer-input");
  const numpad = document.getElementById("numpad");
  const nextBtn = document.getElementById("next-btn");
  const progressText = document.getElementById("progress-text");
  const feedback = document.getElementById("feedback");

  const secretReveal = document.getElementById("secret-reveal");
  const secretWordDisplay = document.getElementById("secret-word-display");
  const restartBtn = document.getElementById("restart-btn");

  // ---- helpers ----
  function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // Generate sequence of steps for a single category (constant or variable)
  function generateCategorySteps(numTerms, maxVal, minRes, maxRes, isVar) {
    if (numTerms <= 0) return [];

    const lowerFirst = Math.max(-maxVal, minRes);
    const upperFirst = Math.min(maxVal, maxRes);

    let firstVal;
    if (lowerFirst <= 0 && upperFirst >= 0 && (lowerFirst < 0 || upperFirst > 0)) {
      // Avoid 0 as first term unless forced
      const candidates = [];
      for (let v = lowerFirst; v <= upperFirst; v++) {
        if (v !== 0) candidates.push(v);
      }
      firstVal = candidates.length > 0 ? candidates[randInt(0, candidates.length - 1)] : 0;
    } else {
      firstVal = randInt(lowerFirst, upperFirst);
    }

    let runningVal = firstVal;
    const steps = [
      { delta: firstVal, from: 0, to: firstVal, isVar: isVar }
    ];

    for (let i = 1; i < numTerms; i++) {
      const canAdd = runningVal < maxRes;
      const canSub = runningVal > minRes;

      let op = "+";
      if (canAdd && canSub) {
        op = Math.random() < 0.5 ? "+" : "-";
      } else if (canAdd) {
        op = "+";
      } else {
        op = "-";
      }

      let termVal;
      const prevVal = runningVal;
      if (op === "+") {
        const maxAdd = Math.min(maxVal, maxRes - runningVal);
        termVal = randInt(1, Math.max(1, maxAdd));
        runningVal += termVal;
        steps.push({
          delta: termVal,
          from: prevVal,
          to: runningVal,
          isVar: isVar
        });
      } else {
        const maxSub = Math.min(maxVal, runningVal - minRes);
        termVal = randInt(1, Math.max(1, maxSub));
        runningVal -= termVal;
        steps.push({
          delta: -termVal,
          from: prevVal,
          to: runningVal,
          isVar: isVar
        });
      }
    }

    return steps;
  }

  // Interleave constant and variable steps preserving relative order
  function generateProblem(maxVal, minRes, maxRes, minCT, maxCT, minVT, maxVT) {
    let numConst = randInt(minCT, maxCT);
    let numVar = randInt(minVT, maxVT);

    if (numConst + numVar < 1) {
      if (maxVT >= 1) numVar = 1;
      else numConst = 1;
    }

    const constSteps = generateCategorySteps(numConst, maxVal, minRes, maxRes, false);
    const varSteps = generateCategorySteps(numVar, maxVal, minRes, maxRes, true);

    const constQueue = constSteps.slice();
    const varQueue = varSteps.slice();
    const interleavedSteps = [];

    while (constQueue.length > 0 || varQueue.length > 0) {
      let pickVar = false;
      if (constQueue.length > 0 && varQueue.length > 0) {
        pickVar = Math.random() < (varQueue.length / (constQueue.length + varQueue.length));
      } else if (varQueue.length > 0) {
        pickVar = true;
      } else {
        pickVar = false;
      }

      if (pickVar) {
        interleavedSteps.push(varQueue.shift());
      } else {
        interleavedSteps.push(constQueue.shift());
      }
    }

    // Format text and assign distinct color to each term in order
    interleavedSteps.forEach(function (step, i) {
      step.color = TERM_COLORS[i % TERM_COLORS.length];
      const delta = step.delta;

      if (step.isVar) {
        if (i === 0) {
          if (delta === 1) step.text = "x";
          else if (delta === -1) step.text = "-x";
          else step.text = String(delta) + "x";
        } else {
          if (delta > 0) {
            step.text = delta === 1 ? "+ x" : "+ " + delta + "x";
          } else {
            const abs = Math.abs(delta);
            step.text = abs === 1 ? "- x" : "- " + abs + "x";
          }
        }
      } else {
        if (i === 0) {
          step.text = String(delta);
        } else {
          if (delta >= 0) {
            step.text = "+ " + delta;
          } else {
            step.text = "- " + Math.abs(delta);
          }
        }
      }
    });

    const exprParts = interleavedSteps.map(function (s) { return s.text; });
    const exprStr = exprParts.join(" ");

    const expectedConst = constSteps.length > 0 ? constSteps[constSteps.length - 1].to : 0;
    const expectedVar = varSteps.length > 0 ? varSteps[varSteps.length - 1].to : 0;

    return {
      exprStr: exprStr,
      expectedConst: expectedConst,
      expectedVar: expectedVar,
      allSteps: interleavedSteps,
      constSteps: constSteps,
      varSteps: varSteps
    };
  }

  // Parse user algebraic expression answer
  function parseAnswer(input) {
    if (!input) return { valid: false, errorKey: "errPleaseEnterNumber" };
    const raw = input.trim();
    if (!raw) return { valid: false, errorKey: "errPleaseEnterNumber" };

    const clean = raw.toLowerCase().replace(/\s+/g, "");

    // Must be composed of valid signed terms
    const termPattern = /^[+-]?(?:\d*x|\d+)(?:[+-](?:\d*x|\d+))*$/;
    if (!termPattern.test(clean)) {
      return { valid: false, errorKey: "errInvalidExpression" };
    }

    const termRegex = /([+-]?)(?:(\d*)x|(\d+))/g;
    let match;
    const varTerms = [];
    const constTerms = [];

    while ((match = termRegex.exec(clean)) !== null) {
      const sign = match[1] === "-" ? -1 : 1;
      if (match[0].indexOf("x") !== -1) {
        const digits = match[2];
        const coeff = (digits === "" ? 1 : parseInt(digits, 10)) * sign;
        varTerms.push(coeff);
      } else {
        const val = parseInt(match[3], 10) * sign;
        constTerms.push(val);
      }
    }

    // Require full simplification (at most one variable term and at most one constant term)
    if (varTerms.length > 1 || constTerms.length > 1) {
      return { valid: false, errorKey: "errNotSimplified" };
    }

    const userVar = varTerms.length > 0 ? varTerms[0] : 0;
    const userConst = constTerms.length > 0 ? constTerms[0] : 0;

    return {
      valid: true,
      userVar: userVar,
      userConst: userConst
    };
  }

  // ---- rendering ----
  function renderProblemDisplay(colored) {
    if (!currentProblemData) return;
    if (!colored) {
      problemDisplay.textContent = currentProblemData.exprStr + " = ?";
      return;
    }

    let html = "";
    currentProblemData.allSteps.forEach(function (step, i) {
      if (i > 0) html += " ";
      html += '<span style="color:' + step.color + ';">' + escapeHtml(step.text) + '</span>';
    });
    html += ' <span style="color:#2d3748;">= ?</span>';
    problemDisplay.innerHTML = html;
  }

  function renderSingleNumberLine(containerEl, steps, showAllMarkers) {
    if (!steps || steps.length === 0) {
      containerEl.innerHTML = "";
      return;
    }

    const visited = [0];
    steps.forEach(function (s) {
      visited.push(s.to);
    });

    const minVisited = Math.min.apply(null, visited);
    const maxVisited = Math.max.apply(null, visited);

    let axisMin = Math.min(0, minVisited) - 1;
    let axisMax = Math.max(0, maxVisited) + 1;

    if (axisMax - axisMin < 4) {
      axisMin -= 1;
      axisMax += 1;
    }

    const svgWidth = 440;
    const padX = 35;
    const graphWidth = svgWidth - (padX * 2);

    function scaleX(val) {
      return padX + ((val - axisMin) / (axisMax - axisMin)) * graphWidth;
    }

    const axisY = 32;
    const arrowStartY = 64;
    const arrowGap = 26;
    const svgHeight = arrowStartY + (steps.length * arrowGap) + 10;

    let svg = '<svg viewBox="0 0 ' + svgWidth + ' ' + svgHeight + '" xmlns="http://www.w3.org/2000/svg" style="font-family: inherit; width: 100%; height: auto; max-width: 440px;">';

    // Axis line
    const axisStartX = padX - 12;
    const axisEndX = svgWidth - padX + 12;
    svg += '<line x1="' + axisStartX + '" y1="' + axisY + '" x2="' + axisEndX + '" y2="' + axisY + '" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/>';

    // End arrows
    svg += '<polygon points="' + (axisStartX - 5) + ',' + axisY + ' ' + axisStartX + ',' + (axisY - 3.5) + ' ' + axisStartX + ',' + (axisY + 3.5) + '" fill="#94a3b8"/>';
    svg += '<polygon points="' + (axisEndX + 5) + ',' + axisY + ' ' + axisEndX + ',' + (axisY - 3.5) + ' ' + axisEndX + ',' + (axisY + 3.5) + '" fill="#94a3b8"/>';

    // Ticks
    if (showAllMarkers) {
      for (let v = Math.ceil(axisMin); v <= Math.floor(axisMax); v++) {
        if (v === 0) continue;
        const tx = scaleX(v);
        svg += '<line x1="' + tx + '" y1="' + (axisY - 4) + '" x2="' + tx + '" y2="' + (axisY + 4) + '" stroke="#94a3b8" stroke-width="1.5"/>';
      }
    }

    // 0 marker and label
    const x0 = scaleX(0);
    svg += '<line x1="' + x0 + '" y1="' + (axisY - 8) + '" x2="' + x0 + '" y2="' + (axisY + 8) + '" stroke="#1e293b" stroke-width="2.5"/>';
    svg += '<text x="' + x0 + '" y="' + (axisY - 12) + '" text-anchor="middle" font-size="13" font-weight="700" fill="#1e293b">0</text>';

    // Stacked arrows
    steps.forEach(function (step, i) {
      const color = step.color;
      const y = arrowStartY + (i * arrowGap);
      const xFrom = scaleX(step.from);
      const xTo = scaleX(step.to);

      const guideStartY = (i === 0 ? axisY : (arrowStartY + (i - 1) * arrowGap));
      svg += '<line x1="' + xFrom + '" y1="' + guideStartY + '" x2="' + xFrom + '" y2="' + y + '" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="2,2"/>';

      if (xFrom === xTo) {
        svg += '<circle cx="' + xFrom + '" cy="' + y + '" r="4" fill="' + color + '"/>';
      } else {
        svg += '<line x1="' + xFrom + '" y1="' + y + '" x2="' + xTo + '" y2="' + y + '" stroke="' + color + '" stroke-width="3" stroke-linecap="round"/>';
        svg += '<circle cx="' + xFrom + '" cy="' + y + '" r="3" fill="' + color + '"/>';

        const headLen = 7;
        const headH = 4.5;
        let poly = "";
        if (xTo > xFrom) {
          poly = xTo + ',' + y + ' ' + (xTo - headLen) + ',' + (y - headH) + ' ' + (xTo - headLen) + ',' + (y + headH);
        } else {
          poly = xTo + ',' + y + ' ' + (xTo + headLen) + ',' + (y - headH) + ' ' + (xTo + headLen) + ',' + (y + headH);
        }
        svg += '<polygon points="' + poly + '" fill="' + color + '"/>';
      }
    });

    svg += '</svg>';
    containerEl.innerHTML = svg;
  }

  function renderNumberLines(showAllMarkers) {
    if (!currentProblemData) return;

    if (currentProblemData.constSteps && currentProblemData.constSteps.length > 0) {
      constLineSection.classList.remove("hidden");
      renderSingleNumberLine(constLineSvg, currentProblemData.constSteps, showAllMarkers);
    } else {
      constLineSection.classList.add("hidden");
      constLineSvg.innerHTML = "";
    }

    if (currentProblemData.varSteps && currentProblemData.varSteps.length > 0) {
      varLineSection.classList.remove("hidden");
      renderSingleNumberLine(varLineSvg, currentProblemData.varSteps, showAllMarkers);
    } else {
      varLineSection.classList.add("hidden");
      varLineSvg.innerHTML = "";
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
    currentProblemData = generateProblem(
      sessionMaxVal,
      sessionMinRes,
      sessionMaxRes,
      sessionMinConstTerms,
      sessionMaxConstTerms,
      sessionMinVarTerms,
      sessionMaxVarTerms
    );

    hintState = 0;
    hintBtn.textContent = t("hintBtn");
    hintBtn.disabled = false;
    hintBox.classList.add("hidden");
    constLineSvg.innerHTML = "";
    varLineSvg.innerHTML = "";

    renderProblemDisplay(false);

    answerInput.value = "";
    feedback.textContent = "";
    feedback.className = "feedback";
    progressText.textContent = (currentProblem + 1) + " / " + totalProblems;
    focusAnswer(answerInput);
  }

  function checkAnswer() {
    const parsed = parseAnswer(answerInput.value);
    if (!parsed.valid) {
      feedback.textContent = t(parsed.errorKey);
      feedback.className = "feedback wrong";
      return;
    }

    const isCorrect = (parsed.userVar === currentProblemData.expectedVar) &&
                      (parsed.userConst === currentProblemData.expectedConst);

    if (isCorrect) {
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
    const maxVal = parseInt(maxValInput.value, 10);
    const minRes = parseInt(minResInput.value, 10);
    const maxRes = parseInt(maxResInput.value, 10);
    const minConstTerms = parseInt(minConstTermsInput.value, 10);
    const maxConstTerms = parseInt(maxConstTermsInput.value, 10);
    const minVarTerms = parseInt(minVarTermsInput.value, 10);
    const maxVarTerms = parseInt(maxVarTermsInput.value, 10);
    const secret = secretWordInput.value.trim();

    setupError.textContent = "";

    if (isNaN(totalCount) || totalCount < 1) {
      setupError.textContent = t("errTotalCount");
      return null;
    }
    if (isNaN(maxVal) || maxVal < 1) {
      setupError.textContent = t("errMaxVal");
      return null;
    }
    if (isNaN(minRes) || isNaN(maxRes) || minRes >= maxRes || minRes > 0 || maxRes < 0 || (maxRes - minRes) < maxVal) {
      setupError.textContent = t("errInvalidResultRange");
      return null;
    }
    if (isNaN(minConstTerms) || minConstTerms < 0) {
      setupError.textContent = t("errMinConstTerms");
      return null;
    }
    if (isNaN(maxConstTerms) || minConstTerms > maxConstTerms) {
      setupError.textContent = t("errConstTermsOrder");
      return null;
    }
    if (isNaN(minVarTerms) || minVarTerms < 0) {
      setupError.textContent = t("errMinVarTerms");
      return null;
    }
    if (isNaN(maxVarTerms) || minVarTerms > maxVarTerms) {
      setupError.textContent = t("errVarTermsOrder");
      return null;
    }
    if ((maxConstTerms + maxVarTerms) < 1) {
      setupError.textContent = t("errTotalTermsZero");
      return null;
    }

    return {
      lesson: 3,
      c: totalCount,
      max: maxVal,
      minR: minRes,
      maxR: maxRes,
      minCT: minConstTerms,
      maxCT: maxConstTerms,
      minVT: minVarTerms,
      maxVT: maxVarTerms,
      s: secret,
      l: getCurrentLang()
    };
  }

  function updateSampleTask() {
    if (!sampleTaskExpr) return;
    const maxVal = parseInt(maxValInput.value, 10);
    const minRes = parseInt(minResInput.value, 10);
    const maxRes = parseInt(maxResInput.value, 10);
    const minCT = parseInt(minConstTermsInput.value, 10);
    const maxCT = parseInt(maxConstTermsInput.value, 10);
    const minVT = parseInt(minVarTermsInput.value, 10);
    const maxVT = parseInt(maxVarTermsInput.value, 10);

    if (isNaN(maxVal) || maxVal < 1 ||
        isNaN(minRes) || isNaN(maxRes) || minRes >= maxRes ||
        minRes > 0 || maxRes < 0 || (maxRes - minRes) < maxVal ||
        isNaN(minCT) || minCT < 0 || isNaN(maxCT) || minCT > maxCT ||
        isNaN(minVT) || minVT < 0 || isNaN(maxVT) || minVT > maxVT ||
        (maxCT + maxVT) < 1) {
      sampleTaskExpr.textContent = "—";
      return;
    }

    const prob = generateProblem(maxVal, minRes, maxRes, minCT, maxCT, minVT, maxVT);
    sampleTaskExpr.textContent = prob.exprStr + " = ?";
    if (setupError) setupError.textContent = "";
  }

  function startQuiz(totalCount, maxVal, minRes, maxRes, minCT, maxCT, minVT, maxVT, secret) {
    totalProblems = totalCount;
    currentProblem = 0;
    sessionMaxVal = maxVal;
    sessionMinRes = minRes;
    sessionMaxRes = maxRes;
    sessionMinConstTerms = minCT;
    sessionMaxConstTerms = maxCT;
    sessionMinVarTerms = minVT;
    sessionMaxVarTerms = maxVT;
    currentSecretWord = secret || "";

    showScreen(practiceScreen);
    showNextProblem();
  }

  // ---- event listeners ----
  startBtn.addEventListener("click", function () {
    const criteria = readSetupCriteria();
    if (!criteria) return;
    linkContainer.classList.add("hidden");
    startQuiz(
      criteria.c,
      criteria.max,
      criteria.minR,
      criteria.maxR,
      criteria.minCT,
      criteria.maxCT,
      criteria.minVT,
      criteria.maxVT,
      criteria.s
    );
  });

  genLinkBtn.addEventListener("click", function () {
    const criteria = readSetupCriteria();
    if (!criteria) return;
    const shareUrl = generateShareUrl(criteria);
    shareLinkInput.value = shareUrl;
    linkContainer.classList.remove("hidden");
    shareLinkInput.select();
  });

  setupCopyButton(copyLinkBtn, shareLinkInput);

  hintBtn.addEventListener("mousedown", function (e) {
    e.preventDefault();
  });

  hintBtn.addEventListener("click", function () {
    if (hintState === 0) {
      hintState = 1;
      hintBtn.textContent = t("moreHintBtn");
      hintBox.classList.remove("hidden");
      renderProblemDisplay(true);
      renderNumberLines(false);
    } else if (hintState === 1) {
      hintState = 2;
      hintBtn.disabled = true;
      renderNumberLines(true);
    }
    focusAnswer(answerInput);
  });

  nextBtn.addEventListener("click", function () {
    checkAnswer();
  });

  setupExpressionKeyboardInput(answerInput, checkAnswer);
  setupNumpad(numpad, answerInput, checkAnswer);

  restartBtn.addEventListener("click", function () {
    showScreen(setupScreen);
    if (window.history && window.history.replaceState) {
      const cleanUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  });

  // Sample task preview listeners
  [
    maxValInput,
    minResInput,
    maxResInput,
    minConstTermsInput,
    maxConstTermsInput,
    minVarTermsInput,
    maxVarTermsInput
  ].forEach(function (input) {
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

  // URL parameter handling
  function checkUrlParams() {
    try {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("q");
      if (!token) return;

      const data = decryptParams(token);
      if (!data || typeof data.c !== "number") {
        setupError.textContent = t("errInvalidLink");
        return;
      }

      const maxVal = typeof data.max === "number" ? data.max : 10;
      const minRes = typeof data.minR === "number" ? data.minR : -20;
      const maxRes = typeof data.maxR === "number" ? data.maxR : 20;
      const minCT = typeof data.minCT === "number" ? data.minCT : 2;
      const maxCT = typeof data.maxCT === "number" ? data.maxCT : 3;
      const minVT = typeof data.minVT === "number" ? data.minVT : 2;
      const maxVT = typeof data.maxVT === "number" ? data.maxVT : 2;

      if (data.l && (data.l === "cs" || data.l === "en")) {
        window.MathAppCommon.setLanguage(data.l);
      }

      totalCountInput.value = data.c;
      maxValInput.value = maxVal;
      minResInput.value = minRes;
      maxResInput.value = maxRes;
      minConstTermsInput.value = minCT;
      maxConstTermsInput.value = maxCT;
      minVarTermsInput.value = minVT;
      maxVarTermsInput.value = maxVT;
      if (data.s !== undefined) {
        secretWordInput.value = data.s;
      }
      updateSampleTask();

      startQuiz(data.c, maxVal, minRes, maxRes, minCT, maxCT, minVT, maxVT, data.s || "");
    } catch (e) {
      console.error("Error reading URL parameters:", e);
    }
  }

  // Mobile virtual keyboard handling
  configureAnswerInput(answerInput);

  // Initialize
  initLanguage(function () {
    if (hintBtn) {
      hintBtn.textContent = hintState === 0 ? t("hintBtn") : t("moreHintBtn");
    }
  });
  updateSampleTask();
  checkUrlParams();
})();
