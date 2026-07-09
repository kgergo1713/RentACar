// Light/dark theme application. Persisted value lives in state.js settings.

export function applyTheme(theme) {
  const value = theme === "dark" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", value);
}
