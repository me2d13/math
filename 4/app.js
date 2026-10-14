(function () {
  "use strict";

  const {
    t,
    randInt,
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

  // Current solving mode: 'simplify-left' | 'simplify-right' | 'apply-both' | 'enter-result'
  let currentMode = "apply-both";
  let isProblemSolved = false;

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

  const equationHistory = document.getElementById("equation-history");
  const modeInstruction = document.getElementById("mode-instruction");
  const modeButtons = document.querySelectorAll(".mode-btn");
  const answerInput = document.getElementById("answer-input");
  const numpad = document.getElementById("numpad");
  const nextBtn = document.getElementById("next-btn");
  const progressText = document.getElementById("progress-text");
  const feedback = document.getElementById("feedback");

  const secretReveal = document.getElementById("secret-reveal");
  const secretWordDisplay = document.getElementById("secret-word-display");
  const restartBtn = document.getElementById("restart-btn");

  // ---- helpers ----
  function shuffle(array) {
    const arr = array.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  // Format a list of terms into a mathematical expression string
  function formatSide(terms) {
    if (!terms || terms.length === 0) return "0";
    const nonZero = terms.filter(function (t) { return t.val !== 0; });
    const list = nonZero.length > 0 ? nonZero : [{ isVar: false, val: 0 }];

    return list.map(function (t, idx) {
      const val = t.val;
      const isVar = t.isVar;

      if (idx === 0) {
        if (isVar) {
          if (val === 1) return "x";
          if (val === -1) return "-x";
          return val + "x";
        } else {
          return String(val);
        }
      } else {
        if (isVar) {
          if (val > 0) return val === 1 ? "+ x" : "+ " + val + "x";
          const abs = Math.abs(val);
          return abs === 1 ? "- x" : "- " + abs + "x";
        } else {
          if (val > 0) return "+ " + val;
          return "- " + Math.abs(val);
        }
      }
    }).join(" ");
  }

  // Format additive operation note (e.g. "+3 - 4x" or "-2x")
  function formatAdditiveOp(terms) {
    return terms.map(function (t, idx) {
      const val = t.val;
      const isVar = t.isVar;
      if (idx === 0) {
        if (isVar) {
          if (val === 1) return "+x";
          if (val === -1) return "-x";
          return (val > 0 ? "+" + val : String(val)) + "x";
        } else {
          return val > 0 ? "+" + val : String(val);
        }
      } else {
        if (isVar) {
          if (val > 0) return val === 1 ? "+ x" : "+ " + val + "x";
          const abs = Math.abs(val);
          return abs === 1 ? "- x" : "- " + abs + "x";
        } else {
          if (val > 0) return "+ " + val;
          return "- " + Math.abs(val);
        }
      }
    }).join(" ");
  }

  // Generate a random linear equation with guaranteed integer (non-fractional) solution
  function generateProblem(maxVal, minRes, maxRes, minCT, maxCT, minVT, maxVT) {
    for (let attempt = 0; attempt < 200; attempt++) {
      const numVar = randInt(minVT, maxVT);
      const numConst = randInt(minCT, maxCT);

      if (numVar + numConst < 2) continue;

      // Generate variable terms with non-zero coefficients
      const varTerms = [];
      for (let i = 0; i < numVar; i++) {
        let coeff = 0;
        while (coeff === 0) coeff = randInt(-maxVal, maxVal);
        const side = Math.random() < 0.5 ? "L" : "R";
        varTerms.push({ isVar: true, val: coeff, side: side });
      }

      let VL = varTerms.filter(function (t) { return t.side === "L"; }).reduce(function (s, t) { return s + t.val; }, 0);
      let VR = varTerms.filter(function (t) { return t.side === "R"; }).reduce(function (s, t) { return s + t.val; }, 0);

      // Ensure variable does not completely cancel out (A = VL - VR !== 0)
      if (VL === VR) {
        varTerms[0].val = varTerms[0].val === maxVal ? varTerms[0].val - 1 : varTerms[0].val + 1;
        VL = varTerms.filter(function (t) { return t.side === "L"; }).reduce(function (s, t) { return s + t.val; }, 0);
        VR = varTerms.filter(function (t) { return t.side === "R"; }).reduce(function (s, t) { return s + t.val; }, 0);
        if (VL === VR) continue;
      }
      const A = VL - VR;

      // If no constant terms, equation is VL*x = VR*x => A*x = 0 => x = 0 (integer)
      if (numConst === 0) {
        let leftVar = varTerms.filter(function (t) { return t.side === "L"; });
        let rightVar = varTerms.filter(function (t) { return t.side === "R"; });

        if (leftVar.length === 0 && rightVar.length >= 2) {
          rightVar[0].side = "L";
          leftVar.push(rightVar.shift());
        } else if (rightVar.length === 0 && leftVar.length >= 2) {
          leftVar[0].side = "R";
          rightVar.push(leftVar.shift());
        } else if (leftVar.length === 0 || rightVar.length === 0) {
          continue;
        }

        if (0 < minRes || 0 > maxRes) continue;

        const leftStr = formatSide(leftVar);
        const rightStr = formatSide(rightVar);
        return {
          exprStr: leftStr + " = " + rightStr,
          solution: 0,
          leftTerms: leftVar.map(function (t) { return { isVar: true, val: t.val }; }),
          rightTerms: rightVar.map(function (t) { return { isVar: true, val: t.val }; }),
          history: [{ leftStr: leftStr, rightStr: rightStr }]
        };
      }

      // numConst >= 1: generate (numConst - 1) constant terms first
      const constTerms = [];
      for (let i = 0; i < numConst - 1; i++) {
        let val = 0;
        while (val === 0) val = randInt(-maxVal, maxVal);
        const side = Math.random() < 0.5 ? "L" : "R";
        constTerms.push({ isVar: false, val: val, side: side });
      }

      // Determine side for the last constant term (tuning term)
      const existingTerms = varTerms.concat(constTerms);
      const leftCount = existingTerms.filter(function (t) { return t.side === "L"; }).length;
      const rightCount = existingTerms.filter(function (t) { return t.side === "R"; }).length;

      let lastSide;
      if (leftCount === 0) {
        lastSide = "L";
      } else if (rightCount === 0) {
        lastSide = "R";
      } else {
        lastSide = Math.random() < 0.5 ? "L" : "R";
      }

      const CL = constTerms.filter(function (t) { return t.side === "L"; }).reduce(function (s, t) { return s + t.val; }, 0);
      const CR = constTerms.filter(function (t) { return t.side === "R"; }).reduce(function (s, t) { return s + t.val; }, 0);
      const diff = CR - CL;

      // Find candidates for x in [minRes, maxRes] such that cLast is an integer with |cLast| <= maxVal and cLast !== 0
      const candidates = [];
      for (let x = minRes; x <= maxRes; x++) {
        const cLast = lastSide === "R" ? (A * x - diff) : (diff - A * x);
        if (cLast !== 0 && Math.abs(cLast) <= maxVal) {
          candidates.push({ x: x, cLast: cLast });
        }
      }

      if (candidates.length === 0) {
        if (attempt > 100) {
          for (let x = minRes; x <= maxRes; x++) {
            const cLast = lastSide === "R" ? (A * x - diff) : (diff - A * x);
            if (cLast !== 0 && Math.abs(cLast) <= maxVal * 2) {
              candidates.push({ x: x, cLast: cLast });
            }
          }
        }
      }

      if (candidates.length === 0) continue;

      const nonZeroCandidates = candidates.filter(function (c) { return c.x !== 0; });
      const pool = nonZeroCandidates.length > 0 && Math.random() < 0.9 ? nonZeroCandidates : candidates;
      const chosen = pool[randInt(0, pool.length - 1)];

      const lastConstTerm = { isVar: false, val: chosen.cLast, side: lastSide };
      const allTerms = existingTerms.concat([lastConstTerm]);

      let leftSideTerms = allTerms.filter(function (t) { return t.side === "L"; });
      let rightSideTerms = allTerms.filter(function (t) { return t.side === "R"; });

      if (leftSideTerms.length === 0 || rightSideTerms.length === 0) continue;

      leftSideTerms = shuffle(leftSideTerms).map(function (t) { return { isVar: t.isVar, val: t.val }; });
      rightSideTerms = shuffle(rightSideTerms).map(function (t) { return { isVar: t.isVar, val: t.val }; });

      const leftStr = formatSide(leftSideTerms);
      const rightStr = formatSide(rightSideTerms);

      return {
        exprStr: leftStr + " = " + rightStr,
        solution: chosen.x,
        leftTerms: leftSideTerms,
        rightTerms: rightSideTerms,
        history: [{ leftStr: leftStr, rightStr: rightStr }]
      };
    }

    // Absolute fallback
    const fallbackLeft = [{ isVar: true, val: 2 }, { isVar: false, val: 4 }];
    const fallbackRight = [{ isVar: false, val: 10 }];
    return {
      exprStr: "2x + 4 = 10",
      solution: 3,
      leftTerms: fallbackLeft,
      rightTerms: fallbackRight,
      history: [{ leftStr: "2x + 4", rightStr: "10" }]
    };
  }

  // Parse algebraic expression into individual signed terms (e.g. "-8x - 8", "3x + 2")
  function parseAlgebraicExpression(input) {
    if (!input) return null;
    const clean = input.toLowerCase().replace(/\s+/g, "");
    if (!clean) return null;

    const termPattern = /^[+-]?(?:\d*x|\d+)(?:[+-](?:\d*x|\d+))*$/;
    if (!termPattern.test(clean)) return null;

    const regex = /([+-]?)(?:(\d*)x|(\d+))/g;
    let match;
    const terms = [];
    while ((match = regex.exec(clean)) !== null) {
      const sign = match[1] === "-" ? -1 : 1;
      if (match[0].indexOf("x") !== -1) {
        const digits = match[2];
        const coeff = (digits === "" ? 1 : parseInt(digits, 10)) * sign;
        terms.push({ isVar: true, val: coeff });
      } else {
        const val = parseInt(match[3], 10) * sign;
        terms.push({ isVar: false, val: val });
      }
    }
    return terms;
  }

  // Parse operation for "apply to both sides"
  function parseBothSidesOperation(input) {
    if (!input) return null;
    const clean = input.toLowerCase().trim();
    if (!clean) return null;

    // Check multiplication: * 2, · 2, * -3, ·-3
    if (/^[*·]/.test(clean)) {
      const rest = clean.slice(1).trim();
      if (!/^[+-]?\d+$/.test(rest)) {
        return { errorKey: "errMulDivNumberOnly" };
      }
      const factor = parseInt(rest, 10);
      if (factor === 0) return { errorKey: "errDivideZero" };
      return { type: "mul", factor: factor };
    }

    // Check division: / 2, : 2, : -3, /-3
    if (/^[/:]/.test(clean)) {
      const rest = clean.slice(1).trim();
      if (!/^[+-]?\d+$/.test(rest)) {
        return { errorKey: "errMulDivNumberOnly" };
      }
      const divisor = parseInt(rest, 10);
      if (divisor === 0) return { errorKey: "errDivideZero" };
      return { type: "div", divisor: divisor };
    }

    // Otherwise additive terms: +3-4x, -2x, 5, etc.
    const terms = parseAlgebraicExpression(clean);
    if (!terms || terms.length === 0) {
      return { errorKey: "errInvalidStep" };
    }
    return { type: "additive", terms: terms };
  }

  // Apply a single additive term to one side following user rule:
  // "if there are still more terms of the same type, apply it to first one. If some term gets to 0, remove it"
  function applyTermToSide(sideTerms, opTerm) {
    let terms = sideTerms.map(function (t) { return { isVar: t.isVar, val: t.val }; });
    const idx = terms.findIndex(function (t) { return t.isVar === opTerm.isVar; });
    if (idx !== -1) {
      terms[idx].val += opTerm.val;
      if (terms[idx].val === 0) {
        terms.splice(idx, 1);
      }
    } else {
      terms.push({ isVar: opTerm.isVar, val: opTerm.val });
    }

    if (terms.length === 0) {
      terms = [{ isVar: false, val: 0 }];
    } else if (terms.length > 1) {
      terms = terms.filter(function (t) { return t.val !== 0; });
      if (terms.length === 0) {
        terms = [{ isVar: false, val: 0 }];
      }
    }
    return terms;
  }

  // Check if equation has reached final solution (x = number or number = x)
  function isFinalResult(leftTerms, rightTerms) {
    const L = leftTerms.filter(function (t) { return t.val !== 0; });
    const R = rightTerms.filter(function (t) { return t.val !== 0; });
    if (L.length === 1 && R.length === 1) {
      if (L[0].isVar && L[0].val === 1 && !R[0].isVar) return { solved: true, x: R[0].val };
      if (R[0].isVar && R[0].val === 1 && !L[0].isVar) return { solved: true, x: L[0].val };
    }
    return { solved: false };
  }

  // Render the step-by-step equation history
  function renderEquationHistory(solved) {
    if (!equationHistory || !currentProblemData) return;
    equationHistory.innerHTML = "";

    const history = currentProblemData.history;
    history.forEach(function (step, index) {
      const lineEl = document.createElement("div");
      lineEl.className = "eq-line";

      const isFirst = index === 0;
      const isLast = index === history.length - 1;

      if (isFirst) lineEl.classList.add("initial");
      if (isLast && solved) lineEl.classList.add("solved");
      else if (isLast) lineEl.classList.add("current");

      const textEl = document.createElement("span");
      textEl.className = "eq-text";
      textEl.textContent = step.leftStr + " = " + step.rightStr;
      lineEl.appendChild(textEl);

      if (step.opNote) {
        const opEl = document.createElement("span");
        opEl.className = "eq-op";
        opEl.textContent = step.opNote;
        lineEl.appendChild(opEl);
      }

      equationHistory.appendChild(lineEl);
    });

    equationHistory.scrollTop = equationHistory.scrollHeight;
  }

  function showScreen(screen) {
    [setupScreen, practiceScreen, congratsScreen].forEach(function (s) {
      if (s) s.classList.add("hidden");
    });
    if (screen) screen.classList.remove("hidden");
  }

  // Switch solving mode: 'simplify-left', 'simplify-right', 'apply-both', 'enter-result'
  function setMode(mode) {
    currentMode = mode;

    modeButtons.forEach(function (btn) {
      btn.classList.toggle("active", btn.getAttribute("data-mode") === mode);
    });

    let instructionKey = "instructionApplyBoth";
    let placeholderKey = "placeholderApplyBoth";

    if (mode === "simplify-left") {
      instructionKey = "instructionSimplifyLeft";
      placeholderKey = "placeholderSimplifyLeft";
    } else if (mode === "simplify-right") {
      instructionKey = "instructionSimplifyRight";
      placeholderKey = "placeholderSimplifyRight";
    } else if (mode === "enter-result") {
      instructionKey = "instructionEnterResult";
      placeholderKey = "placeholderEnterResult";
    }

    if (modeInstruction) {
      modeInstruction.textContent = t(instructionKey);
    }
    if (answerInput) {
      answerInput.placeholder = t(placeholderKey);
      answerInput.value = "";
    }
    if (feedback) {
      feedback.textContent = "";
      feedback.className = "feedback";
    }

    if (nextBtn) {
      nextBtn.textContent = mode === "enter-result" ? t("nextBtn") : t("stepBtn");
    }

    // Enable/disable numpad buttons based on mode
    const mulBtn = numpad.querySelector('[data-action="mul"]');
    const divBtn = numpad.querySelector('[data-action="div"]');
    const varBtn = numpad.querySelector('[data-action="var"]');

    if (mulBtn) mulBtn.classList.toggle("disabled", mode !== "apply-both");
    if (divBtn) divBtn.classList.toggle("disabled", mode !== "apply-both");
    if (varBtn) varBtn.classList.toggle("disabled", mode === "enter-result");

    focusAnswer(answerInput);
  }

  // Handle successful problem solution
  function handleProblemSolved(finalX) {
    isProblemSolved = true;
    feedback.textContent = t("feedbackCorrect");
    feedback.className = "feedback correct";
    renderEquationHistory(true);

    if (answerInput) {
      answerInput.blur();
    }

    setTimeout(function () {
      showNextProblem();
    }, 850);
  }

  // Execute Step button or Enter press
  function executeStep() {
    if (isProblemSolved || !currentProblemData) return;

    const raw = answerInput.value.trim();
    if (!raw) {
      feedback.textContent = t("errPleaseEnterNumber");
      feedback.className = "feedback error";
      focusAnswer(answerInput);
      return;
    }

    // 1. MODE: ENTER RESULT DIRECTLY
    if (currentMode === "enter-result") {
      let userVal = raw.toLowerCase().replace(/^x\s*=\s*/i, "").trim();
      const parsed = parseInt(userVal, 10);
      if (isNaN(parsed)) {
        feedback.textContent = t("errPleaseEnterNumber");
        feedback.className = "feedback error";
        focusAnswer(answerInput);
        return;
      }

      if (parsed === currentProblemData.solution) {
        // Append final line if not already showing x = solution
        const lastStep = currentProblemData.history[currentProblemData.history.length - 1];
        if (lastStep.leftStr !== "x" || lastStep.rightStr !== String(parsed)) {
          currentProblemData.history.push({
            leftStr: "x",
            rightStr: String(parsed),
            opNote: ""
          });
        }
        handleProblemSolved(parsed);
      } else {
        feedback.textContent = t("feedbackWrong");
        feedback.className = "feedback error";
        answerInput.value = "";
        focusAnswer(answerInput);
      }
      return;
    }

    // 2. MODE: SIMPLIFY LEFT OR RIGHT
    if (currentMode === "simplify-left" || currentMode === "simplify-right") {
      const isLeft = currentMode === "simplify-left";
      const targetTerms = isLeft ? currentProblemData.leftTerms : currentProblemData.rightTerms;

      const userTerms = parseAlgebraicExpression(raw);
      if (!userTerms || userTerms.length === 0) {
        feedback.textContent = t("errInvalidExpression");
        feedback.className = "feedback error";
        focusAnswer(answerInput);
        return;
      }

      const userVarSum = userTerms.filter(function (t) { return t.isVar; }).reduce(function (s, t) { return s + t.val; }, 0);
      const userConstSum = userTerms.filter(function (t) { return !t.isVar; }).reduce(function (s, t) { return s + t.val; }, 0);

      const targetVarSum = targetTerms.filter(function (t) { return t.isVar; }).reduce(function (s, t) { return s + t.val; }, 0);
      const targetConstSum = targetTerms.filter(function (t) { return !t.isVar; }).reduce(function (s, t) { return s + t.val; }, 0);

      // Verify mathematical equality
      if (userVarSum !== targetVarSum || userConstSum !== targetConstSum) {
        feedback.textContent = t("errNotEqual");
        feedback.className = "feedback error";
        focusAnswer(answerInput);
        return;
      }

      // Verify number of terms decreased
      if (userTerms.length >= targetTerms.length) {
        feedback.textContent = t("errNotLowerTerms");
        feedback.className = "feedback error";
        focusAnswer(answerInput);
        return;
      }

      // Add operation note to previous line
      const prevLine = currentProblemData.history[currentProblemData.history.length - 1];
      const opNote = getCurrentLang() === "cs" ? (isLeft ? "| zjednodušení L" : "| zjednodušení P") : (isLeft ? "| simplify L" : "| simplify R");
      prevLine.opNote = opNote;

      // Update terms on target side
      if (isLeft) {
        currentProblemData.leftTerms = userTerms;
      } else {
        currentProblemData.rightTerms = userTerms;
      }

      const newLeftStr = formatSide(currentProblemData.leftTerms);
      const newRightStr = formatSide(currentProblemData.rightTerms);

      currentProblemData.history.push({
        leftStr: newLeftStr,
        rightStr: newRightStr
      });

      renderEquationHistory(false);
      answerInput.value = "";

      const check = isFinalResult(currentProblemData.leftTerms, currentProblemData.rightTerms);
      if (check.solved) {
        handleProblemSolved(check.x);
      } else {
        feedback.textContent = t("stepApplied");
        feedback.className = "feedback correct";
        focusAnswer(answerInput);
      }
      return;
    }

    // 3. MODE: APPLY TO BOTH SIDES
    if (currentMode === "apply-both") {
      const op = parseBothSidesOperation(raw);
      if (!op) {
        feedback.textContent = t("errInvalidStep");
        feedback.className = "feedback error";
        focusAnswer(answerInput);
        return;
      }

      if (op.errorKey) {
        feedback.textContent = t(op.errorKey);
        feedback.className = "feedback error";
        focusAnswer(answerInput);
        return;
      }

      let opNote = "";

      if (op.type === "mul") {
        const factor = op.factor;
        currentProblemData.leftTerms.forEach(function (t) { t.val *= factor; });
        currentProblemData.rightTerms.forEach(function (t) { t.val *= factor; });
        opNote = "| · " + (factor < 0 ? "(" + factor + ")" : factor);
      } else if (op.type === "div") {
        const divisor = op.divisor;
        // Check if all terms on both sides are divisible by divisor
        const allDivisible = currentProblemData.leftTerms.concat(currentProblemData.rightTerms).every(function (t) {
          return t.val % divisor === 0;
        });

        if (!allDivisible) {
          feedback.textContent = t("errFractionCreated");
          feedback.className = "feedback error";
          focusAnswer(answerInput);
          return;
        }

        currentProblemData.leftTerms.forEach(function (t) { t.val = t.val / divisor; });
        currentProblemData.rightTerms.forEach(function (t) { t.val = t.val / divisor; });
        opNote = "| : " + (divisor < 0 ? "(" + divisor + ")" : divisor);
      } else if (op.type === "additive") {
        op.terms.forEach(function (opTerm) {
          currentProblemData.leftTerms = applyTermToSide(currentProblemData.leftTerms, opTerm);
          currentProblemData.rightTerms = applyTermToSide(currentProblemData.rightTerms, opTerm);
        });
        opNote = "| " + formatAdditiveOp(op.terms);
      }

      // Set opNote on previous line
      const prevLine = currentProblemData.history[currentProblemData.history.length - 1];
      prevLine.opNote = opNote;

      const newLeftStr = formatSide(currentProblemData.leftTerms);
      const newRightStr = formatSide(currentProblemData.rightTerms);

      currentProblemData.history.push({
        leftStr: newLeftStr,
        rightStr: newRightStr
      });

      renderEquationHistory(false);
      answerInput.value = "";

      const check = isFinalResult(currentProblemData.leftTerms, currentProblemData.rightTerms);
      if (check.solved) {
        handleProblemSolved(check.x);
      } else {
        feedback.textContent = t("stepApplied");
        feedback.className = "feedback correct";
        focusAnswer(answerInput);
      }
    }
  }

  // Setup screen criteria validation
  function readSetupCriteria() {
    setupError.textContent = "";

    const totalCount = parseInt(totalCountInput.value, 10);
    const maxVal = parseInt(maxValInput.value, 10);
    const minRes = parseInt(minResInput.value, 10);
    const maxRes = parseInt(maxResInput.value, 10);
    const minConstTerms = parseInt(minConstTermsInput.value, 10);
    const maxConstTerms = parseInt(maxConstTermsInput.value, 10);
    const minVarTerms = parseInt(minVarTermsInput.value, 10);
    const maxVarTerms = parseInt(maxVarTermsInput.value, 10);
    const secret = (secretWordInput.value || "").trim();

    if (isNaN(totalCount) || totalCount < 1) {
      setupError.textContent = t("errTotalCount");
      return null;
    }
    if (isNaN(maxVal) || maxVal < 1) {
      setupError.textContent = t("errMaxVal");
      return null;
    }
    if (isNaN(minRes) || isNaN(maxRes) || minRes >= maxRes) {
      setupError.textContent = t("errMinMax");
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
    if (isNaN(minVarTerms) || minVarTerms < 1) {
      setupError.textContent = t("errMinVarTermsEq");
      return null;
    }
    if (isNaN(maxVarTerms) || minVarTerms > maxVarTerms) {
      setupError.textContent = t("errVarTermsOrder");
      return null;
    }
    if ((maxConstTerms + maxVarTerms) < 2) {
      setupError.textContent = t("errTotalTermsEq");
      return null;
    }

    return {
      lesson: 4,
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

    if (
      isNaN(maxVal) || maxVal < 1 ||
      isNaN(minRes) || isNaN(maxRes) || minRes >= maxRes ||
      isNaN(minCT) || minCT < 0 || isNaN(maxCT) || minCT > maxCT ||
      isNaN(minVT) || minVT < 1 || isNaN(maxVT) || minVT > maxVT ||
      (maxConstTerms + maxVarTerms) < 2
    ) {
      sampleTaskExpr.textContent = "—";
      return;
    }

    const prob = generateProblem(maxVal, minRes, maxRes, minCT, maxCT, minVT, maxVT);
    sampleTaskExpr.textContent = prob.exprStr;
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

  function showNextProblem() {
    if (currentProblem >= totalProblems) {
      showCongrats();
      return;
    }

    currentProblem++;
    isProblemSolved = false;
    progressText.textContent = currentProblem + " / " + totalProblems;
    feedback.textContent = "";
    feedback.className = "feedback";
    answerInput.value = "";

    currentProblemData = generateProblem(
      sessionMaxVal,
      sessionMinRes,
      sessionMaxRes,
      sessionMinConstTerms,
      sessionMaxConstTerms,
      sessionMinVarTerms,
      sessionMaxVarTerms
    );

    renderEquationHistory(false);
    setMode("apply-both");
  }

  function showCongrats() {
    showScreen(congratsScreen);
    if (currentSecretWord) {
      secretWordDisplay.textContent = currentSecretWord;
      secretReveal.classList.remove("hidden");
    } else {
      secretReveal.classList.add("hidden");
    }
  }

  // Setup numpad input for Lesson 4
  function setupLesson4Numpad() {
    if (!numpad || !answerInput) return;

    numpad.addEventListener("click", function (e) {
      const btn = e.target.closest(".np");
      if (!btn || btn.classList.contains("disabled")) return;

      const action = btn.getAttribute("data-action");
      const value = btn.getAttribute("data-value");

      if (action === "clear") {
        answerInput.value = "";
        focusAnswer(answerInput);
      } else if (action === "back") {
        let v = answerInput.value;
        if (v.endsWith(" ")) v = v.trimEnd();
        answerInput.value = v.slice(0, -1);
        focusAnswer(answerInput);
      } else if (action === "plus") {
        answerInput.value += "+";
        focusAnswer(answerInput);
      } else if (action === "minus") {
        answerInput.value += "-";
        focusAnswer(answerInput);
      } else if (action === "mul") {
        answerInput.value = "· ";
        focusAnswer(answerInput);
      } else if (action === "div") {
        answerInput.value = ": ";
        focusAnswer(answerInput);
      } else if (action === "var") {
        answerInput.value += "x";
        focusAnswer(answerInput);
      } else if (value !== null) {
        answerInput.value += value;
        focusAnswer(answerInput);
      } else if (btn.id === "next-btn") {
        executeStep();
      }
    });
  }

  // Physical keyboard handling
  function setupLesson4Keyboard() {
    if (!answerInput) return;

    answerInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        executeStep();
      } else if (e.key === "*" && currentMode === "apply-both") {
        e.preventDefault();
        answerInput.value = "· ";
      } else if ((e.key === "/" || e.key === ":") && currentMode === "apply-both") {
        e.preventDefault();
        answerInput.value = ": ";
      }
    });

    answerInput.addEventListener("input", function () {
      const val = answerInput.value;
      answerInput.value = val.replace(/[^0-9+\-xX*·/:\s]/g, "");
    });
  }

  // Mode buttons event listeners
  modeButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      const mode = btn.getAttribute("data-mode");
      if (mode) setMode(mode);
    });
  });

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
  setupLesson4Numpad();
  setupLesson4Keyboard();

  restartBtn.addEventListener("click", function () {
    showScreen(setupScreen);
    if (window.history && window.history.replaceState) {
      const cleanUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  });

  // Setup screen criteria change listeners for live sample update
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
    updateSampleTask();
    if (practiceScreen && !practiceScreen.classList.contains("hidden")) {
      setMode(currentMode);
    }
  });
  updateSampleTask();
  checkUrlParams();
})();
