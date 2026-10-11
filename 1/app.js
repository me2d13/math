(function () {
  "use strict";

  // ---- state ----
  let totalProblems = 0;
  let currentProblem = 0;
  let currentExpression = "";
  let currentAnswer = 0;
  let currentSteps = [];
  let currentSecretWord = "";
  let sessionMinVal = -10;
  let sessionMaxVal = 10;
  let sessionMinTerms = 2;
  let sessionMaxTerms = 3;
  let hintState = 0; // 0: hidden, 1: hint shown, 2: more hint shown

  const TERM_COLORS = ["#e53e3e", "#2b6cb0", "#2f855a", "#d69e2e", "#805ad5", "#319795"];
  const CIPHER_KEY = "MathSecretKey2026!#";

  // ---- elements ----
  const setupScreen = document.getElementById("setup-screen");
  const practiceScreen = document.getElementById("practice-screen");
  const congratsScreen = document.getElementById("congrats-screen");

  const totalCountInput = document.getElementById("total-count");
  const minValInput = document.getElementById("min-val");
  const maxValInput = document.getElementById("max-val");
  const minTermsInput = document.getElementById("min-terms");
  const maxTermsInput = document.getElementById("max-terms");
  const secretWordInput = document.getElementById("secret-word");
  const startBtn = document.getElementById("start-btn");
  const genLinkBtn = document.getElementById("gen-link-btn");
  const linkContainer = document.getElementById("link-container");
  const shareLinkInput = document.getElementById("share-link-input");
  const copyLinkBtn = document.getElementById("copy-link-btn");
  const setupError = document.getElementById("setup-error");

  const problemDisplay = document.getElementById("problem-display");
  const hintBtn = document.getElementById("hint-btn");
  const hintBox = document.getElementById("hint-box");
  const numberLineContainer = document.getElementById("number-line-container");

  const answerInput = document.getElementById("answer-input");
  const nextBtn = document.getElementById("next-btn");
  const progressText = document.getElementById("progress-text");
  const feedback = document.getElementById("feedback");

  const congratsText = congratsScreen.querySelector("p");
  const secretReveal = document.getElementById("secret-reveal");
  const secretWordDisplay = document.getElementById("secret-word-display");
  const restartBtn = document.getElementById("restart-btn");

  // ---- localization ----
  let currentLang = "cs";
  try {
    const savedLang = localStorage.getItem("math_practice_lang");
    if (savedLang && (savedLang === "cs" || savedLang === "en")) {
      currentLang = savedLang;
    }
  } catch (e) {}

  function t(key) {
    if (typeof I18N !== "undefined") {
      if (I18N[currentLang] && I18N[currentLang][key]) {
        return I18N[currentLang][key];
      }
      if (I18N.en && I18N.en[key]) {
        return I18N.en[key];
      }
    }
    return key;
  }

  function setLanguage(lang) {
    currentLang = lang;
    try {
      localStorage.setItem("math_practice_lang", lang);
    } catch (e) {}

    document.documentElement.lang = lang;
    document.title = t("pageTitle");

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      const key = el.getAttribute("data-i18n");
      if (key) {
        el.textContent = t(key);
      }
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
      const key = el.getAttribute("data-i18n-placeholder");
      if (key) {
        el.placeholder = t(key);
      }
    });

    document.querySelectorAll(".lang-btn").forEach(function (btn) {
      btn.classList.toggle("active", btn.getAttribute("data-lang") === lang);
    });

    if (hintBtn) {
      hintBtn.textContent = hintState === 0 ? t("hintBtn") : t("moreHintBtn");
    }
  }

  document.querySelectorAll(".lang-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const lang = btn.getAttribute("data-lang");
      setLanguage(lang);
    });
  });

  // ---- helpers ----
  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function generateProblem(minVal, maxVal, minTerms, maxTerms) {
    const numTerms = randInt(minTerms, maxTerms);

    const terms = [];
    for (let i = 0; i < numTerms; i++) {
      terms.push(randInt(minVal, maxVal));
    }

    // Build expression string, evaluate value, and track terms with transitions
    let exprStr = String(terms[0]);
    let value = terms[0];
    const steps = [
      { text: String(terms[0]), delta: terms[0], from: 0, to: terms[0] }
    ];

    for (let i = 1; i < terms.length; i++) {
      const t = terms[i];
      let op, signVal;
      if (t >= 0) {
        op = Math.random() < 0.5 ? "+" : "-";
        signVal = t;
      } else {
        op = Math.random() < 0.5 ? "-" : "+";
        signVal = -t;
      }
      exprStr += " " + op + " " + signVal;
      const prevVal = value;
      const delta = (op === "+" ? signVal : -signVal);
      value += delta;
      steps.push({
        text: op + " " + signVal,
        delta: delta,
        from: prevVal,
        to: value
      });
    }

    return { exprStr, value, steps };
  }

  // ---- hint & number line rendering ----
  function renderProblemDisplay(colored) {
    if (!colored || !currentSteps || currentSteps.length === 0) {
      problemDisplay.textContent = currentExpression + " = ?";
      return;
    }

    let html = "";
    currentSteps.forEach(function (step, i) {
      const color = TERM_COLORS[i % TERM_COLORS.length];
      if (i > 0) html += " ";
      html += '<span style="color:' + color + ';">' + escapeHtml(step.text) + '</span>';
    });
    html += ' <span style="color:#2d3748;">= ?</span>';
    problemDisplay.innerHTML = html;
  }

  function renderNumberLine(showAllMarkers) {
    if (!currentSteps || currentSteps.length === 0) return;

    const visited = [0];
    currentSteps.forEach(function (s) {
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
    const svgHeight = arrowStartY + (currentSteps.length * arrowGap) + 10;

    let svg = '<svg viewBox="0 0 ' + svgWidth + ' ' + svgHeight + '" xmlns="http://www.w3.org/2000/svg" style="font-family: inherit;">';

    // Number line axis
    const axisStartX = padX - 12;
    const axisEndX = svgWidth - padX + 12;
    svg += '<line x1="' + axisStartX + '" y1="' + axisY + '" x2="' + axisEndX + '" y2="' + axisY + '" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/>';

    // Axis arrows at ends
    svg += '<polygon points="' + (axisStartX - 5) + ',' + axisY + ' ' + axisStartX + ',' + (axisY - 3.5) + ' ' + (axisStartX) + ',' + (axisY + 3.5) + '" fill="#94a3b8"/>';
    svg += '<polygon points="' + (axisEndX + 5) + ',' + axisY + ' ' + axisEndX + ',' + (axisY - 3.5) + ' ' + (axisEndX) + ',' + (axisY + 3.5) + '" fill="#94a3b8"/>';

    // If showAllMarkers is true, draw tick marks for each number (no legend numbers except 0)
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

    // Stacked arrows for each term
    currentSteps.forEach(function (step, i) {
      const color = TERM_COLORS[i % TERM_COLORS.length];
      const y = arrowStartY + (i * arrowGap);
      const xFrom = scaleX(step.from);
      const xTo = scaleX(step.to);

      // Faint vertical guide line connecting previous end to this start
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
    numberLineContainer.innerHTML = svg;
  }

  // ---- screen switching ----
  function showScreen(screen) {
    setupScreen.classList.add("hidden");
    practiceScreen.classList.add("hidden");
    congratsScreen.classList.add("hidden");
    screen.classList.remove("hidden");
  }

  // ---- cipher & sharing ----
  function xorCipher(text, key) {
    let result = "";
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
  }

  function encryptParams(dataObj) {
    const json = JSON.stringify(dataObj);
    const utf8Bytes = encodeURIComponent(json);
    const ciphered = xorCipher(utf8Bytes, CIPHER_KEY);
    return btoa(ciphered).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  function decryptParams(token) {
    try {
      let base64 = token.replace(/-/g, "+").replace(/_/g, "/");
      while (base64.length % 4) base64 += "=";
      const ciphered = atob(base64);
      const utf8Bytes = xorCipher(ciphered, CIPHER_KEY);
      const json = decodeURIComponent(utf8Bytes);
      return JSON.parse(json);
    } catch (e) {
      return null;
    }
  }

  function generateShareUrl(dataObj) {
    const token = encryptParams(dataObj);
    const url = new URL(window.location.href);
    url.searchParams.set("q", token);
    return url.toString();
  }

  // ---- problem generation & display ----
  function showNextProblem() {
    const prob = generateProblem(sessionMinVal, sessionMaxVal, sessionMinTerms, sessionMaxTerms);
    currentExpression = prob.exprStr;
    currentAnswer = prob.value;
    currentSteps = prob.steps;

    hintState = 0;
    hintBtn.textContent = t("hintBtn");
    hintBtn.disabled = false;
    hintBox.classList.add("hidden");
    numberLineContainer.innerHTML = "";

    renderProblemDisplay(false);

    answerInput.value = "";
    feedback.textContent = "";
    feedback.className = "feedback";
    progressText.textContent = (currentProblem + 1) + " / " + totalProblems;
    answerInput.focus();
  }

  // ---- validation / navigation ----
  function validate() {
    return !isNaN(parseInt(answerInput.value, 10)) || answerInput.value.trim() !== "";
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
      answerInput.focus();
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
    const minVal = parseInt(minValInput.value, 10);
    const maxVal = parseInt(maxValInput.value, 10);
    const minTerms = parseInt(minTermsInput.value, 10);
    const maxTerms = parseInt(maxTermsInput.value, 10);
    const secret = secretWordInput.value.trim();

    setupError.textContent = "";

    if (isNaN(totalCount) || totalCount < 1) {
      setupError.textContent = t("errTotalCount");
      return null;
    }
    if (minVal >= maxVal) {
      setupError.textContent = t("errMinMax");
      return null;
    }
    if (minTerms < 2) {
      setupError.textContent = t("errMinTerms");
      return null;
    }
    if (minTerms > maxTerms) {
      setupError.textContent = t("errTermsOrder");
      return null;
    }

    return {
      c: totalCount,
      min: minVal,
      max: maxVal,
      minT: minTerms,
      maxT: maxTerms,
      s: secret,
      l: currentLang
    };
  }

  function startQuiz(totalCount, minVal, maxVal, minTerms, maxTerms, secret) {
    totalProblems = totalCount;
    currentProblem = 0;
    sessionMinVal = minVal;
    sessionMaxVal = maxVal;
    sessionMinTerms = minTerms;
    sessionMaxTerms = maxTerms;
    currentSecretWord = secret || "";

    showScreen(practiceScreen);
    showNextProblem();
  }

  // ---- event handlers ----
  startBtn.addEventListener("click", function () {
    const criteria = readSetupCriteria();
    if (!criteria) return;
    linkContainer.classList.add("hidden");
    startQuiz(criteria.c, criteria.min, criteria.max, criteria.minT, criteria.maxT, criteria.s);
  });

  genLinkBtn.addEventListener("click", function () {
    const criteria = readSetupCriteria();
    if (!criteria) return;
    const shareUrl = generateShareUrl(criteria);
    shareLinkInput.value = shareUrl;
    linkContainer.classList.remove("hidden");
    shareLinkInput.select();
  });

  copyLinkBtn.addEventListener("click", function () {
    const text = shareLinkInput.value;
    if (!text) return;

    function onCopied() {
      copyLinkBtn.textContent = t("copiedBtn");
      copyLinkBtn.classList.add("copied");
      setTimeout(function () {
        copyLinkBtn.textContent = t("copyBtn");
        copyLinkBtn.classList.remove("copied");
      }, 2000);
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(onCopied).catch(function () {
        shareLinkInput.focus();
        shareLinkInput.select();
        try { document.execCommand("copy"); } catch (e) {}
        onCopied();
      });
    } else {
      shareLinkInput.focus();
      shareLinkInput.select();
      try { document.execCommand("copy"); } catch (e) {}
      onCopied();
    }
  });

  hintBtn.addEventListener("mousedown", function (e) {
    e.preventDefault();
  });

  hintBtn.addEventListener("click", function () {
    if (hintState === 0) {
      hintState = 1;
      hintBtn.textContent = t("moreHintBtn");
      hintBox.classList.remove("hidden");
      renderProblemDisplay(true);
      renderNumberLine(false);
    } else if (hintState === 1) {
      hintState = 2;
      hintBtn.disabled = true;
      renderNumberLine(true);
    }
    answerInput.focus();
  });

  nextBtn.addEventListener("click", function () {
    checkAnswer();
  });

  answerInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      checkAnswer();
    } else if (e.key === "-") {
      e.preventDefault();
      var cur = answerInput.value;
      if (cur.charAt(0) === "-") {
        answerInput.value = cur.slice(1);
      } else {
        answerInput.value = "-" + cur;
      }
    }
  });

  answerInput.addEventListener("input", function () {
    var val = answerInput.value;
    var isNeg = val.startsWith("-");
    var digits = val.replace(/[^0-9]/g, "");
    answerInput.value = isNeg ? "-" + digits : digits;
  });

  restartBtn.addEventListener("click", function () {
    showScreen(setupScreen);
    if (window.history && window.history.replaceState) {
      const cleanUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  });

  // ---- numpad ----------
  var numpad = document.getElementById("numpad");
  numpad.addEventListener("click", function (e) {
    var btn = e.target.closest(".np");
    if (!btn) return;

    var action = btn.getAttribute("data-action");
    var value = btn.getAttribute("data-value");

    if (action === "clear") {
      answerInput.value = "";
      answerInput.focus();
    } else if (action === "minus") {
      var cur = answerInput.value;
      if (cur.charAt(0) === "-") {
        answerInput.value = cur.slice(1);
      } else {
        answerInput.value = "-" + cur;
      }
      answerInput.focus();
    } else if (action === "back") {
      var v = answerInput.value;
      answerInput.value = v.slice(0, -1);
      answerInput.focus();
    } else if (value !== null) {
      answerInput.value += value;
      answerInput.focus();
    }
  });

  // ---- URL parameter handling on start ----
  function checkUrlParams() {
    try {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("q");
      if (!token) return;

      const data = decryptParams(token);
      if (!data || typeof data.c !== "number" || typeof data.min !== "number" || typeof data.max !== "number" || typeof data.minT !== "number" || typeof data.maxT !== "number") {
        setupError.textContent = t("errInvalidLink");
        return;
      }

      if (data.l && (data.l === "cs" || data.l === "en")) {
        setLanguage(data.l);
      }

      totalCountInput.value = data.c;
      minValInput.value = data.min;
      maxValInput.value = data.max;
      minTermsInput.value = data.minT;
      maxTermsInput.value = data.maxT;
      if (data.s !== undefined) {
        secretWordInput.value = data.s;
      }

      startQuiz(data.c, data.min, data.max, data.minT, data.maxT, data.s || "");
    } catch (e) {
      console.error("Error reading URL parameters:", e);
    }
  }

  setLanguage(currentLang);
  checkUrlParams();
})();
