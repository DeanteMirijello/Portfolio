const SUPPORTED = ["en", "fr"];
const DEFAULT_LANG = "en";

function getSavedLang() {
  try {
    const saved = localStorage.getItem("lang");
    return SUPPORTED.includes(saved) ? saved : DEFAULT_LANG;
  } catch {
    return DEFAULT_LANG;
  }
}

async function loadDict(lang) {
  if (lang === "fr") return (await import("./fr.json")).default;
  return (await import("./en.json")).default;
}

function applyTranslations(dict) {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (dict[key]) el.textContent = dict[key];
  });

  document.documentElement.lang = window.__lang;
}

function updateToggleButton(dict) {
  const btn = document.querySelector("[data-lang-toggle]");
  if (!btn) return;
  btn.textContent = dict["nav.lang"] || "FR";
}

async function setLanguage(lang) {
  if (!SUPPORTED.includes(lang)) lang = DEFAULT_LANG;

  localStorage.setItem("lang", lang);
  window.__lang = lang;

  const dict = await loadDict(lang);
  window.__dict = dict;

  applyTranslations(dict);
  updateToggleButton(dict);
}

function setupToggle() {
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-lang-toggle]");
    if (!btn) return;

    const current = window.__lang || DEFAULT_LANG;
    const next = current === "en" ? "fr" : "en";
    setLanguage(next);
  });
}

async function init() {
  const lang = getSavedLang();
  await setLanguage(lang);
  setupToggle();
}

init();
