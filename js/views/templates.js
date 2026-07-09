import { t, getLang } from "../i18n.js";
import { icons } from "../icons.js";
import { escapeHtml, readFileAsDataUrl, nowLocalDateTimeValue } from "../utils.js";
import { openModal, closeModal, confirmDialog } from "../modal.js";
import { getTemplates, addTemplate, updateTemplate, deleteTemplate } from "../state.js";

const PLACEHOLDER_TOKENS = [
  "{{renter.name}}",
  "{{renter.address}}",
  "{{renter.phone}}",
  "{{renter.motherName}}",
  "{{renter.birthPlace}}",
  "{{renter.birthDate}}",
  "{{renter.idNumber}}",
  "{{renter.licenseNumber}}",
  "{{car.make}}",
  "{{car.bodyType}}",
  "{{car.plate}}",
  "{{car.fuelType}}",
  "{{car.seats}}",
  "{{car.dailyRate}}",
  "{{car.deposit}}",
];

function extraFieldRowHtml(field, idx) {
  const label = field.label?.[getLang()] ?? field.label?.hu ?? field.key;
  return `
    <div class="form-grid" data-extra-row="${idx}" style="grid-template-columns:1fr 1fr 1fr 1fr auto; align-items:end; margin-bottom:6px;">
      <div class="form-field"><label>${t("extraFieldKey")}</label><input type="text" data-f="key" value="${escapeHtml(field.key)}"></div>
      <div class="form-field"><label>${t("extraFieldLabel")}</label><input type="text" data-f="label" value="${escapeHtml(label)}"></div>
      <div class="form-field"><label>${t("extraFieldType")}</label>
        <select data-f="type">
          <option value="text" ${field.type === "text" ? "selected" : ""}>text</option>
          <option value="number" ${field.type === "number" ? "selected" : ""}>number</option>
          <option value="range10" ${field.type === "range10" ? "selected" : ""}>range10 (0-100)</option>
          <option value="datetime-local" ${field.type === "datetime-local" ? "selected" : ""}>datetime-local</option>
        </select>
      </div>
      <div class="form-field"><label>${t("extraFieldDefault")}</label><input type="text" data-f="default" value="${escapeHtml(field.default)}"></div>
      <button type="button" class="btn btn-danger" data-remove-extra="${idx}">${icons.trash}</button>
    </div>
  `;
}

function openTemplateForm(existing, onSaved) {
  const isEdit = !!existing;
  let logoDataUrl = existing?.logo || "";
  let extraFields = existing?.extraFields ? existing.extraFields.map((f) => ({ ...f })) : [];

  const bodyHtml = `
    <form id="template-form">
      <div class="form-grid single-col">
        <div class="form-field"><label>${t("templateName")}</label>
          <input type="text" name="name" value="${escapeHtml(existing?.name)}"></div>

        <div class="form-field">
          <label>${t("logo")}</label>
          <div class="settings-row">
            <img id="logo-preview" src="${logoDataUrl}" alt="" style="max-height:56px; ${logoDataUrl ? "" : "display:none;"} border-radius:6px;">
            <button type="button" class="btn" id="btn-upload-logo">${icons.upload}${t("uploadLogo")}</button>
            <input type="file" id="logo-file-input" accept="image/*" class="hidden">
          </div>
        </div>

        <div class="form-field"><label>${t("header")}</label>
          <textarea name="header">${escapeHtml(existing?.header)}</textarea></div>
        <div class="form-field"><label>${t("footer")}</label>
          <textarea name="footer">${escapeHtml(existing?.footer)}</textarea></div>

        <div class="form-field">
          <label>${t("body")}</label>
          <div class="chip-list" id="placeholder-chips" style="margin-bottom:8px;">
            ${PLACEHOLDER_TOKENS.map((tok) => `<span class="chip" data-token="${tok}">${tok}</span>`).join("")}
          </div>
          <textarea name="body" id="template-body" rows="10">${escapeHtml(existing?.body)}</textarea>
          <small>${t("bodyHint")}</small>
        </div>

        <div class="form-field">
          <label>${t("extraFields")}</label>
          <div id="extra-fields-list"></div>
          <button type="button" class="btn" id="btn-add-extra">${icons.plus}${t("addExtraField")}</button>
        </div>
      </div>

      <div class="form-actions">
        <button type="button" class="btn" data-action="cancel">${t("cancel")}</button>
        <button type="submit" class="btn btn-primary">${t("save")}</button>
      </div>
    </form>
  `;

  openModal({
    title: isEdit ? t("templateEditTitle") : t("templateAddTitle"),
    bodyHtml,
    onMount: (root) => {
      const extraListEl = root.querySelector("#extra-fields-list");

      function renderExtraFields() {
        extraListEl.innerHTML = extraFields.map(extraFieldRowHtml).join("");
        extraListEl.querySelectorAll("[data-remove-extra]").forEach((btn) => {
          btn.addEventListener("click", () => {
            extraFields.splice(Number(btn.dataset.removeExtra), 1);
            renderExtraFields();
          });
        });
      }
      renderExtraFields();

      root.querySelector("#btn-add-extra").addEventListener("click", () => {
        extraFields.push({ key: "", label: { hu: "", en: "" }, type: "text", default: "" });
        renderExtraFields();
      });

      const fileInput = root.querySelector("#logo-file-input");
      root.querySelector("#btn-upload-logo").addEventListener("click", () => fileInput.click());
      fileInput.addEventListener("change", async () => {
        const file = fileInput.files[0];
        if (!file) return;
        logoDataUrl = await readFileAsDataUrl(file);
        const preview = root.querySelector("#logo-preview");
        preview.src = logoDataUrl;
        preview.style.display = "";
      });

      const bodyTextarea = root.querySelector("#template-body");
      root.querySelectorAll("#placeholder-chips .chip").forEach((chip) => {
        chip.addEventListener("click", () => {
          const start = bodyTextarea.selectionStart ?? bodyTextarea.value.length;
          const end = bodyTextarea.selectionEnd ?? bodyTextarea.value.length;
          const token = chip.dataset.token;
          bodyTextarea.value = bodyTextarea.value.slice(0, start) + token + bodyTextarea.value.slice(end);
          bodyTextarea.focus();
          bodyTextarea.selectionStart = bodyTextarea.selectionEnd = start + token.length;
        });
      });

      root.querySelector('[data-action="cancel"]').addEventListener("click", closeModal);

      root.querySelector("#template-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);

        // Read current extra field values from the DOM rows (in case user edited them).
        const collectedExtraFields = Array.from(extraListEl.querySelectorAll("[data-extra-row]")).map((row) => {
          const key = row.querySelector('[data-f="key"]').value.trim();
          const label = row.querySelector('[data-f="label"]').value.trim();
          const type = row.querySelector('[data-f="type"]').value;
          const def = row.querySelector('[data-f="default"]').value;
          return {
            key,
            label: { hu: label, en: label },
            type,
            default: type === "number" || type === "range10" ? Number(def) || 0 : def,
          };
        });

        const record = {
          name: fd.get("name") || "",
          logo: logoDataUrl,
          header: fd.get("header") || "",
          footer: fd.get("footer") || "",
          body: fd.get("body") || "",
          extraFields: collectedExtraFields,
        };

        let saved;
        if (isEdit) {
          updateTemplate(existing.id, record);
          saved = { ...existing, ...record };
        } else {
          saved = addTemplate(record);
        }
        closeModal();
        if (onSaved) onSaved(saved);
      });
    },
  });
}

export function render(container) {
  container.innerHTML = `
    <h1 class="page-title">${t("nav_templates")}</h1>
    <div class="toolbar">
      <span></span>
      <button type="button" class="btn btn-primary" id="btn-add-template">${icons.plus}${t("add")}</button>
    </div>
    <div class="data-table-wrap">
      <table class="data-table">
        <thead><tr><th>${t("logo")}</th><th>${t("templateName")}</th><th>${t("actions")}</th></tr></thead>
        <tbody id="template-rows"></tbody>
      </table>
    </div>
  `;

  const rowsEl = container.querySelector("#template-rows");

  function renderRows() {
    const templates = getTemplates();
    if (!templates.length) {
      rowsEl.innerHTML = `<tr><td colspan="3" class="empty-hint">${t("noData")}</td></tr>`;
      return;
    }
    rowsEl.innerHTML = templates
      .map(
        (tpl) => `
      <tr>
        <td>${tpl.logo ? `<img src="${tpl.logo}" alt="" style="max-height:32px">` : ""}</td>
        <td>${escapeHtml(tpl.name)}</td>
        <td class="row-actions">
          <button type="button" class="btn" data-action="edit" data-id="${tpl.id}">${icons.edit}</button>
          <button type="button" class="btn btn-danger" data-action="delete" data-id="${tpl.id}">${icons.trash}</button>
        </td>
      </tr>`
      )
      .join("");

    rowsEl.querySelectorAll('[data-action="edit"]').forEach((btn) =>
      btn.addEventListener("click", () => {
        const tpl = getTemplates().find((x) => x.id === btn.dataset.id);
        openTemplateForm(tpl, renderRows);
      })
    );
    rowsEl.querySelectorAll('[data-action="delete"]').forEach((btn) =>
      btn.addEventListener("click", () => {
        confirmDialog({
          title: t("confirmDeleteTitle"),
          message: t("confirmDeleteMsg"),
          confirmLabel: t("delete"),
          cancelLabel: t("cancel"),
          onConfirm: () => {
            deleteTemplate(btn.dataset.id);
            renderRows();
          },
        });
      })
    );
  }

  container.querySelector("#btn-add-template").addEventListener("click", () => openTemplateForm(null, renderRows));
  renderRows();
}
