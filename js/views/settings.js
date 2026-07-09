import { t, getLang } from "../i18n.js";
import { icons } from "../icons.js";
import { downloadFile, readFileAsText } from "../utils.js";
import {
  getData,
  getSettings,
  setLanguage,
  setTheme,
  replaceAllData,
  resetAllData,
} from "../state.js";
import { applyTheme } from "../theme.js";
import { confirmDialog } from "../modal.js";

export function render(container) {
  container.innerHTML = `
    <h1 class="page-title">${t("nav_settings")}</h1>

    <div class="settings-section">
      <h3>${t("language")}</h3>
      <div class="settings-row">
        <select id="lang-select">
          <option value="hu" ${getLang() === "hu" ? "selected" : ""}>Magyar</option>
          <option value="en" ${getLang() === "en" ? "selected" : ""}>English</option>
        </select>
      </div>
    </div>

    <div class="settings-section">
      <h3>${t("theme")}</h3>
      <div class="settings-row">
        <select id="theme-select">
          <option value="light" ${getSettings().theme === "light" ? "selected" : ""}>${t("light")}</option>
          <option value="dark" ${getSettings().theme === "dark" ? "selected" : ""}>${t("dark")}</option>
        </select>
      </div>
    </div>

    <div class="settings-section">
      <h3>${t("exportConfig")} / ${t("importConfig")}</h3>
      <p class="empty-hint" style="text-align:left;padding:0 0 12px;">${t("exportImportInfo")}</p>
      <div class="settings-row">
        <button type="button" class="btn" id="btn-export">${icons.download}${t("exportConfig")}</button>
        <button type="button" class="btn" id="btn-import">${icons.upload}${t("importConfig")}</button>
        <input type="file" id="import-file-input" accept="application/json" class="hidden">
      </div>
      <p id="import-msg" class="empty-hint" style="display:none;padding:8px 0 0;text-align:left;"></p>
    </div>

    <div class="settings-section">
      <h3>${t("resetConfig")}</h3>
      <div class="settings-row">
        <button type="button" class="btn btn-danger" id="btn-reset">${icons.reset}${t("resetConfig")}</button>
      </div>
    </div>
  `;

  container.querySelector("#lang-select").addEventListener("change", (e) => {
    setLanguage(e.target.value);
    render(container);
  });

  container.querySelector("#theme-select").addEventListener("change", (e) => {
    setTheme(e.target.value);
    applyTheme(e.target.value);
  });

  container.querySelector("#btn-export").addEventListener("click", () => {
    const json = JSON.stringify(getData(), null, 2);
    const date = new Date().toISOString().slice(0, 10);
    downloadFile(`rentacar-config-${date}.json`, json);
  });

  const fileInput = container.querySelector("#import-file-input");
  const msgEl = container.querySelector("#import-msg");
  container.querySelector("#btn-import").addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", async () => {
    const file = fileInput.files[0];
    if (!file) return;
    try {
      const text = await readFileAsText(file);
      const parsed = JSON.parse(text);
      replaceAllData(parsed);
      msgEl.textContent = t("importSuccess");
      msgEl.style.display = "";
      render(container);
    } catch (e) {
      console.error("Import failed", e);
      msgEl.textContent = t("importError");
      msgEl.style.display = "";
    }
    fileInput.value = "";
  });

  container.querySelector("#btn-reset").addEventListener("click", () => {
    confirmDialog({
      title: t("resetConfig"),
      message: t("resetConfirmMsg"),
      confirmLabel: t("yes"),
      cancelLabel: t("cancel"),
      onConfirm: () => {
        resetAllData();
        applyTheme(getSettings().theme);
        render(container);
      },
    });
  });
}
