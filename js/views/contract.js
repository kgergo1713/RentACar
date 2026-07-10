import { t, getLang } from "../i18n.js";
import { icons } from "../icons.js";
import { escapeHtml, fillTemplate, formatThousands } from "../utils.js";
import { getUsers, getCars, getTemplates } from "../state.js";
import { openUserForm } from "./users.js";

const STEPS = ["step_renter", "step_car", "step_template", "step_review"];

// Wizard-local state (not persisted - contracts are ephemeral/print-only).
let wizard = {
  step: 0,
  renter: null, // the natural person signing (always a 'person' user record)
  company: null, // set when the selected renter acts on behalf of a company
  car: null,
  template: null,
  extraValues: {},
};

function resetWizard() {
  wizard = { step: 0, renter: null, company: null, car: null, template: null, extraValues: {} };
}

function displayName(user) {
  return user.type === "company" ? user.companyName || "" : user.name || "";
}

function buildContext() {
  const renter = wizard.renter || {};
  const company = wizard.company || {};
  const car = wizard.car || {};
  return {
    renter: {
      name: renter.name || "",
      address: renter.address || "",
      phone: renter.phone || "",
      motherName: renter.motherName || "",
      birthPlace: renter.birthPlace || "",
      birthDate: renter.birthDate || "",
      idNumber: renter.idNumber || "",
      licenseNumber: renter.licenseNumber || "",
    },
    company: {
      companyName: company.companyName || "",
      registeredOffice: company.registeredOffice || "",
      companyRegNumber: company.companyRegNumber || "",
      taxNumber: company.taxNumber || "",
    },
    car: {
      make: car.make || "",
      bodyType: car.bodyType || "",
      seats: car.seats ?? "",
      cargoDoors: car.cargoDoors || "",
      size: car.size || "",
      plate: car.plate || "",
      deposit: formatThousands(car.deposit),
      dailyRate: formatThousands(car.dailyRate),
      fuelType: car.fuelType || "",
      notes: car.notes || "",
    },
    extra: {
      ...wizard.extraValues,
      odometerReading: formatThousands(wizard.extraValues.odometerReading),
      vehicleValue: formatThousands(wizard.extraValues.vehicleValue),
    },
  };
}

function renderSteps(container) {
  return `
    <div class="wizard-steps no-print">
      ${STEPS.map(
        (key, idx) => `
        <div class="wizard-step ${idx === wizard.step ? "active" : idx < wizard.step ? "done" : ""}">${t(key)}</div>`
      ).join("")}
    </div>
  `;
}

function renderStepRenter(container) {
  const users = getUsers();

  function pickSigner(user) {
    if (user.type === "person") {
      wizard.renter = user;
      wizard.company = null;
      wizard.step = 1;
      renderContractView(container);
      return;
    }
    // company: need to pick which registered renter (natural person) signs
    const signers = getUsers().filter((u) => u.type === "person" && (user.renters || []).includes(u.id));
    renderCompanySignerPicker(container, user, signers);
  }

  container.querySelector("#wizard-body").innerHTML = `
    <h2>${t("selectRenter")}</h2>
    <p class="empty-hint" style="text-align:left;padding:0 0 12px;">${t("selectRenterHint")}</p>
    <div class="toolbar">
      <input type="text" class="search-input" id="renter-search" placeholder="${t("search")}" style="max-width:260px">
      <button type="button" class="btn btn-primary" id="btn-add-renter">${icons.plus}${t("addNewRenter")}</button>
    </div>
    <div class="picker-list" id="renter-list"></div>
  `;

  const listEl = container.querySelector("#renter-list");
  const searchEl = container.querySelector("#renter-search");

  function renderList() {
    const query = searchEl.value.trim().toLowerCase();
    const filtered = users.filter((u) => displayName(u).toLowerCase().includes(query));
    listEl.innerHTML = filtered.length
      ? filtered
          .map(
            (u) => `<div class="picker-card" data-id="${u.id}"><strong>${escapeHtml(displayName(u))}</strong></div>`
          )
          .join("")
      : `<div class="empty-hint">${t("noData")}</div>`;

    listEl.querySelectorAll(".picker-card").forEach((card) => {
      card.addEventListener("click", () => {
        const user = users.find((u) => u.id === card.dataset.id);
        pickSigner(user);
      });
    });
  }
  renderList();
  searchEl.addEventListener("input", renderList);

  container.querySelector("#btn-add-renter").addEventListener("click", () => {
    openUserForm(null, (savedUser) => pickSigner(savedUser));
  });
}

function renderCompanySignerPicker(container, company, signers) {
  container.querySelector("#wizard-body").innerHTML = `
    <h2>${escapeHtml(company.companyName)}</h2>
    <p class="empty-hint" style="text-align:left;padding:0 0 12px;">${t("rentersHint")}</p>
    <div class="picker-list" id="signer-list"></div>
    <div class="form-actions">
      <button type="button" class="btn" id="btn-back-to-renters">${t("previous")}</button>
    </div>
  `;
  const listEl = container.querySelector("#signer-list");
  listEl.innerHTML = signers.length
    ? signers
        .map((s) => `<div class="picker-card" data-id="${s.id}"><strong>${escapeHtml(s.name)}</strong></div>`)
        .join("")
    : `<div class="empty-hint">${t("noPersonsYet")}</div>`;

  listEl.querySelectorAll(".picker-card").forEach((card) => {
    card.addEventListener("click", () => {
      const signer = signers.find((s) => s.id === card.dataset.id);
      wizard.renter = signer;
      wizard.company = company;
      wizard.step = 1;
      renderContractView(container);
    });
  });

  container.querySelector("#btn-back-to-renters").addEventListener("click", () => renderStepRenter(container));
}

function renderStepCar(container) {
  const cars = getCars();
  container.querySelector("#wizard-body").innerHTML = `
    <h2>${t("selectCar")}</h2>
    ${
      cars.length
        ? `<div class="picker-list" id="car-list">
            ${cars
              .map(
                (c) => `
              <div class="picker-card" data-id="${c.id}">
                <strong>${escapeHtml(c.make)} ${escapeHtml(c.bodyType)}</strong>
                <small>${escapeHtml(c.plate)} · ${escapeHtml(c.dailyRate)} Ft/${getLang() === "hu" ? "nap" : "day"}</small>
              </div>`
              )
              .join("")}
          </div>`
        : `<div class="empty-hint">${t("noCarsYet")}</div>`
    }
    <div class="form-actions">
      <button type="button" class="btn" id="btn-back">${t("previous")}</button>
    </div>
  `;

  container.querySelectorAll("#car-list .picker-card").forEach((card) => {
    card.addEventListener("click", () => {
      wizard.car = cars.find((c) => c.id === card.dataset.id);
      wizard.step = 2;
      renderContractView(container);
    });
  });
  container.querySelector("#btn-back").addEventListener("click", () => {
    wizard.step = 0;
    renderContractView(container);
  });
}

function renderStepTemplate(container) {
  const templates = getTemplates();
  container.querySelector("#wizard-body").innerHTML = `
    <h2>${t("selectTemplate")}</h2>
    ${
      templates.length
        ? `<div class="picker-list" id="template-list">
            ${templates
              .map(
                (tpl) => `
              <div class="picker-card" data-id="${tpl.id}">
                ${tpl.logo ? `<img src="${tpl.logo}" alt="" style="max-height:36px;margin-bottom:8px;">` : ""}
                <strong>${escapeHtml(tpl.name)}</strong>
              </div>`
              )
              .join("")}
          </div>`
        : `<div class="empty-hint">${t("noTemplatesYet")}</div>`
    }
    <div class="form-actions">
      <button type="button" class="btn" id="btn-back">${t("previous")}</button>
    </div>
  `;

  container.querySelectorAll("#template-list .picker-card").forEach((card) => {
    card.addEventListener("click", () => {
      wizard.template = templates.find((tp) => tp.id === card.dataset.id);
      wizard.extraValues = {};
      (wizard.template.extraFields || []).forEach((f) => (wizard.extraValues[f.key] = f.default));
      wizard.step = 3;
      renderContractView(container);
    });
  });
  container.querySelector("#btn-back").addEventListener("click", () => {
    wizard.step = 1;
    renderContractView(container);
  });
}

function extraFieldInputHtml(field) {
  const label = field.label?.[getLang()] ?? field.label?.hu ?? field.key;
  const value = wizard.extraValues[field.key] ?? field.default ?? "";
  if (field.type === "range10") {
    return `
      <div class="form-field">
        <label>${escapeHtml(label)}: <span data-range-out="${field.key}">${value}</span>%</label>
        <input type="range" min="0" max="100" step="10" data-extra="${field.key}" value="${value}">
      </div>`;
  }
  if (field.type === "number") {
    return `<div class="form-field"><label>${escapeHtml(label)}</label><input type="number" data-extra="${field.key}" value="${escapeHtml(value)}"></div>`;
  }
  if (field.type === "datetime-local") {
    return `<div class="form-field"><label>${escapeHtml(label)}</label><input type="datetime-local" data-extra="${field.key}" value="${escapeHtml(value)}"></div>`;
  }
  return `<div class="form-field"><label>${escapeHtml(label)}</label><input type="text" data-extra="${field.key}" value="${escapeHtml(value)}"></div>`;
}

function renderStepReview(container) {
  const tpl = wizard.template;

  // Renders filled template text as line-blocks instead of raw pre-wrapped text: lines containing
  // tab characters become a tight flex row of columns (e.g. "Név: X\tTelefon: Y"), so paired fields
  // sit neatly side by side instead of relying on monospace tab-stop spacing.
  function renderDocText(text) {
    return text
      .split("\n")
      .map((line) => {
        if (line === "") return `<div class="doc-line doc-line-blank">&nbsp;</div>`;
        if (line.includes("\t")) {
          const cols = line.split("\t").map((part) => `<span>${escapeHtml(part)}</span>`);
          return `<div class="doc-line doc-row">${cols.join("")}</div>`;
        }
        return `<div class="doc-line">${escapeHtml(line)}</div>`;
      })
      .join("");
  }

  function renderDoc() {
    const ctx = buildContext();
    return `
      <div class="contract-doc" id="contract-doc">
        ${tpl.logo ? `<img class="logo" src="${tpl.logo}" alt="">` : ""}
        ${tpl.header ? `<div class="doc-header" contenteditable="true">${renderDocText(fillTemplate(tpl.header, ctx))}</div>` : ""}
        <div class="doc-body" contenteditable="true">${renderDocText(fillTemplate(tpl.body, ctx))}</div>
        ${tpl.footer ? `<div class="doc-footer" contenteditable="true">${renderDocText(fillTemplate(tpl.footer, ctx))}</div>` : ""}
      </div>
    `;
  }

  container.querySelector("#wizard-body").innerHTML = `
    <h2 class="no-print">${t("step_review")}</h2>
    <p class="empty-hint no-print" style="text-align:left;padding:0 0 12px;">${t("reviewAndEdit")}</p>
    <div class="extra-fields-grid no-print" id="extra-fields-grid">
      ${(tpl.extraFields || []).map(extraFieldInputHtml).join("")}
    </div>
    <div class="form-actions no-print">
      <button type="button" class="btn" id="btn-back">${t("previous")}</button>
      <button type="button" class="btn" id="btn-apply">${t("applyChanges")}</button>
      <button type="button" class="btn btn-primary" id="btn-print">${icons.print}${t("printContract")}</button>
      <button type="button" class="btn" id="btn-start-over">${t("startOver")}</button>
    </div>
    <div id="doc-container">${renderDoc()}</div>
  `;

  container.querySelectorAll("[data-extra]").forEach((input) => {
    input.addEventListener("input", () => {
      const key = input.dataset.extra;
      wizard.extraValues[key] = input.type === "range" || input.type === "number" ? Number(input.value) : input.value;
      const rangeOut = container.querySelector(`[data-range-out="${key}"]`);
      if (rangeOut) rangeOut.textContent = input.value;
    });
  });

  container.querySelector("#btn-apply").addEventListener("click", () => {
    container.querySelector("#doc-container").innerHTML = renderDoc();
  });
  container.querySelector("#btn-print").addEventListener("click", () => window.print());
  container.querySelector("#btn-back").addEventListener("click", () => {
    wizard.step = 2;
    renderContractView(container);
  });
  container.querySelector("#btn-start-over").addEventListener("click", () => {
    resetWizard();
    renderContractView(container);
  });
}

function renderContractView(container) {
  container.innerHTML = `
    <h1 class="page-title no-print">${t("nav_contract")}</h1>
    ${renderSteps(container)}
    <div id="wizard-body"></div>
  `;

  if (wizard.step === 0) renderStepRenter(container);
  else if (wizard.step === 1) renderStepCar(container);
  else if (wizard.step === 2) renderStepTemplate(container);
  else renderStepReview(container);
}

export function render(container) {
  resetWizard();
  renderContractView(container);
}
