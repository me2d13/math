// Shared utilities and engine for Math Practice Lessons
(function (global) {
  "use strict";

  const CIPHER_KEY = "MathSecretKey2026!#";

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

  // ---- localization ----
  let currentLang = "cs";
  try {
    const saved = localStorage.getItem("math_practice_lang");
    if (saved && (saved === "cs" || saved === "en")) {
      currentLang = saved;
    }
  } catch (e) {}

  function t(key, params) {
    let str = key;
    if (typeof I18N !== "undefined") {
      if (I18N[currentLang] && I18N[currentLang][key]) {
        str = I18N[currentLang][key];
      } else if (I18N.en && I18N.en[key]) {
        str = I18N.en[key];
      }
    }
    if (params && typeof params === "object") {
      for (const k in params) {
        str = str.replace(new RegExp("\\{" + k + "\\}", "g"), params[k]);
      }
    }
    return str;
  }

  function setLanguage(lang, onLangChange) {
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

    document.querySelectorAll("[data-i18n-title]").forEach(function (el) {
      const key = el.getAttribute("data-i18n-title");
      if (key) {
        el.title = t(key);
      }
    });

    document.querySelectorAll(".lang-btn").forEach(function (btn) {
      btn.classList.toggle("active", btn.getAttribute("data-lang") === lang);
    });

    if (typeof onLangChange === "function") {
      onLangChange(lang);
    }
  }

  function initLanguage(onLangChange) {
    document.querySelectorAll(".lang-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const lang = btn.getAttribute("data-lang");
        setLanguage(lang, onLangChange);
      });
    });
    setLanguage(currentLang, onLangChange);
  }

  // ---- mobile detection & virtual keyboard management ----
  function isMobileDevice() {
    const ua = navigator.userAgent || "";
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    const isTouchDevice = ("ontouchstart" in window) || (navigator.maxTouchPoints > 0);
    const isCoarse = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
    return isMobileUA || (isTouchDevice && isCoarse);
  }

  function configureAnswerInput(inputEl) {
    if (!inputEl) return;
    if (isMobileDevice()) {
      inputEl.setAttribute("inputmode", "none");
      inputEl.setAttribute("virtualkeyboardpolicy", "manual");
      inputEl.removeAttribute("autofocus");
      if (document.activeElement === inputEl) {
        inputEl.blur();
      }
    } else {
      inputEl.setAttribute("inputmode", "numeric");
      inputEl.removeAttribute("virtualkeyboardpolicy");
    }
  }

  function focusAnswer(inputEl) {
    if (!inputEl) return;
    if (!isMobileDevice()) {
      inputEl.focus();
    }
  }

  // ---- numpad & keyboard input ----
  function setupNumpad(numpadEl, answerInputEl, onNext) {
    if (!numpadEl || !answerInputEl) return;
    const isExpr = numpadEl.classList.contains("numpad-4col");

    numpadEl.addEventListener("click", function (e) {
      const btn = e.target.closest(".np");
      if (!btn) return;

      const action = btn.getAttribute("data-action");
      const value = btn.getAttribute("data-value");

      if (action === "clear") {
        answerInputEl.value = "";
        focusAnswer(answerInputEl);
      } else if (action === "minus") {
        if (isExpr) {
          answerInputEl.value += "-";
        } else {
          const cur = answerInputEl.value;
          if (cur.charAt(0) === "-") {
            answerInputEl.value = cur.slice(1);
          } else {
            answerInputEl.value = "-" + cur;
          }
        }
        focusAnswer(answerInputEl);
      } else if (action === "plus") {
        answerInputEl.value += "+";
        focusAnswer(answerInputEl);
      } else if (action === "var") {
        const varChar = btn.getAttribute("data-var") || "x";
        answerInputEl.value += varChar;
        focusAnswer(answerInputEl);
      } else if (action === "back") {
        const v = answerInputEl.value;
        answerInputEl.value = v.slice(0, -1);
        focusAnswer(answerInputEl);
      } else if (value !== null) {
        answerInputEl.value += value;
        focusAnswer(answerInputEl);
      } else if (btn.id === "next-btn" && typeof onNext === "function") {
        onNext();
      }
    });
  }

  function setupKeyboardInput(answerInputEl, onEnter, allowNegative) {
    if (!answerInputEl) return;

    answerInputEl.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        if (typeof onEnter === "function") onEnter();
      } else if (e.key === "-" && allowNegative) {
        e.preventDefault();
        const cur = answerInputEl.value;
        if (cur.charAt(0) === "-") {
          answerInputEl.value = cur.slice(1);
        } else {
          answerInputEl.value = "-" + cur;
        }
      }
    });

    answerInputEl.addEventListener("input", function () {
      const val = answerInputEl.value;
      const isNeg = allowNegative && val.startsWith("-");
      const digits = val.replace(/[^0-9]/g, "");
      answerInputEl.value = isNeg ? "-" + digits : digits;
    });
  }

  function setupExpressionKeyboardInput(answerInputEl, onEnter) {
    if (!answerInputEl) return;

    answerInputEl.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        if (typeof onEnter === "function") onEnter();
      }
    });

    answerInputEl.addEventListener("input", function () {
      const val = answerInputEl.value;
      answerInputEl.value = val.replace(/[^0-9+\-xX\s]/g, "");
    });
  }

  // ---- copy button helper ----
  function setupCopyButton(copyBtnEl, shareInputEl) {
    if (!copyBtnEl || !shareInputEl) return;

    copyBtnEl.addEventListener("click", function () {
      const text = shareInputEl.value;
      if (!text) return;

      function onCopied() {
        copyBtnEl.textContent = t("copiedBtn");
        copyBtnEl.classList.add("copied");
        setTimeout(function () {
          copyBtnEl.textContent = t("copyBtn");
          copyBtnEl.classList.remove("copied");
        }, 2000);
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(onCopied).catch(function () {
          shareInputEl.focus();
          shareInputEl.select();
          try { document.execCommand("copy"); } catch (e) {}
          onCopied();
        });
      } else {
        shareInputEl.focus();
        shareInputEl.select();
        try { document.execCommand("copy"); } catch (e) {}
        onCopied();
      }
    });
  }

  // ---- helpers ----
  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Export to global scope
  global.MathAppCommon = {
    encryptParams: encryptParams,
    decryptParams: decryptParams,
    generateShareUrl: generateShareUrl,
    t: t,
    setLanguage: setLanguage,
    initLanguage: initLanguage,
    getCurrentLang: function () { return currentLang; },
    isMobileDevice: isMobileDevice,
    configureAnswerInput: configureAnswerInput,
    focusAnswer: focusAnswer,
    setupNumpad: setupNumpad,
    setupKeyboardInput: setupKeyboardInput,
    setupExpressionKeyboardInput: setupExpressionKeyboardInput,
    setupCopyButton: setupCopyButton,
    randInt: randInt
  };

})(window);
