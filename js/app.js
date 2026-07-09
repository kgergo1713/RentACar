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

  window.addEventListener("hashchange", render);
  render();
}

init();
