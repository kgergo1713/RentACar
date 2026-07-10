import { applyTheme } from "./theme.js";
import { getSettings, setTheme, setLanguage } from "./state.js";
import { t, getLang } from "./i18n.js";
import { icons, flagHu, flagEn } from "./icons.js";
import * as homeView from "./views/home.js";
import * as usersView from "./views/users.js";
import * as carsView from "./views/cars.js";
import * as templatesView from "./views/templates.js";
import * as contractView from "./views/contract.js";
import * as settingsView from "./views/settings.js";

const routes = {
  "": homeView,
  home: homeView,
  contract: contractView,
  templates: templatesView,
  cars: carsView,
  users: usersView,
  settings: settingsView,
};

function currentRoute() {
  return location.hash.replace(/^#\/?/, "") || "";
}

function render() {
  const route = currentRoute();
  const view = routes[route] || homeView;
  const container = document.getElementById("view");
  container.innerHTML = "";
  view.render(container);
  updateTopbar(route);
}

function updateTopbar(route) {
  const backBtn = document.getElementById("btn-back");
  backBtn.classList.toggle("hidden", route === "");
  backBtn.innerHTML = icons.back;
  backBtn.title = t("back");

  const themeBtn = document.getElementById("btn-theme");
  themeBtn.innerHTML = getSettings().theme === "dark" ? icons.sun : icons.moon;
  themeBtn.title = getSettings().theme === "dark" ? t("light") : t("dark");

  const langBtn = document.getElementById("btn-lang");
  langBtn.innerHTML = getLang() === "hu" ? flagEn : flagHu;
  langBtn.title = getLang() === "hu" ? "English" : "Magyar";

  const installBtn = document.getElementById("btn-install");
  installBtn.title = t("installApp");
  installBtn.setAttribute("aria-label", t("installApp"));
}

function init() {
  applyTheme(getSettings().theme);

  document.getElementById("btn-home").addEventListener("click", () => {
    location.hash = "#/";
  });
  document.getElementById("btn-back").addEventListener("click", () => {
    location.hash = "#/";
  });
  document.getElementById("btn-theme").addEventListener("click", () => {
    const next = getSettings().theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
    updateTopbar(currentRoute());
  });
  document.getElementById("btn-lang").addEventListener("click", () => {
    const next = getLang() === "hu" ? "en" : "hu";
    setLanguage(next);
    render();
  });

  const installBtn = document.getElementById("btn-install");
  installBtn.innerHTML = icons.install;
  installBtn.addEventListener("click", async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    installBtn.classList.add("hidden");
  });

  window.addEventListener("hashchange", render);
  render();
}

// Manual "install app" icon button: browsers only show their own install UI opportunistically
// (and hide it entirely once launched standalone), so we surface an explicit in-app control -
// this is what lets a user reliably add the app to their home screen instead of getting stuck.
let deferredInstallPrompt = null;
const isStandalone =
  window.matchMedia("(display-mode: standalone)").matches || window.matchMedia("(display-mode: minimal-ui)").matches;

if (!isStandalone) {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    document.getElementById("btn-install")?.classList.remove("hidden");
  });
}

window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = null;
  document.getElementById("btn-install")?.classList.add("hidden");
});

// Network-first service worker: ensures the app always fetches the latest deployed version
// when online (see sw.js), instead of relying on the browser's own HTTP cache heuristics.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch((err) => console.error("SW registration failed", err));
  });
}

init();
