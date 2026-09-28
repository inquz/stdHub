export type Theme = "light" | "dark";

const storageKey = "XlsParse-theme";
const changeEvent = "XlsParse-theme-change";
const defaultTheme: Theme = "dark";
let preference: Theme | null | undefined;

// Runs while the document is parsed, before the first visible frame.
export const themeInitScript = `(function(){var p=null;try{var s=localStorage.getItem("${storageKey}");if(s==="light"||s==="dark")p=s}catch(e){}document.documentElement.dataset.theme=p||"${defaultTheme}"})()`;

function readPreference(): Theme | null {
  try {
    const value = window.localStorage.getItem(storageKey);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
}

export function initializeTheme() {
  if (preference === undefined) preference = readPreference();
  applyTheme(preference ?? defaultTheme);
}

export function getThemeSnapshot(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

export function getServerThemeSnapshot(): Theme {
  return defaultTheme;
}

export function toggleTheme() {
  preference = getThemeSnapshot() === "dark" ? "light" : "dark";
  applyTheme(preference);
  try {
    window.localStorage.setItem(storageKey, preference);
  } catch {
    // Keep the explicit choice for this session when browser storage is blocked.
  }
  window.dispatchEvent(new Event(changeEvent));
}

export function subscribeToTheme(onChange: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key !== storageKey && event.key !== null) return;
    const value = event.key === null ? null : event.newValue;
    preference = value === "dark" || value === "light" ? value : null;
    applyTheme(preference ?? defaultTheme);
    onChange();
  };

  initializeTheme();
  window.addEventListener("storage", handleStorage);
  window.addEventListener(changeEvent, onChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(changeEvent, onChange);
  };
}
