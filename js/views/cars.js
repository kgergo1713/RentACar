import { t } from "../i18n.js";
import { icons } from "../icons.js";
import { escapeHtml } from "../utils.js";
import { openModal, closeModal, confirmDialog } from "../modal.js";
import { getCars, addCar, updateCar, deleteCar } from "../state.js";

function openCarForm(existing, onSaved) {
  const isEdit = !!existing;
  const category = existing?.category || "passenger";

  const bodyHtml = `
    <form id="car-form">
      <div class="type-toggle">
        <button type="button" class="btn" data-cat="passenger">${t("passenger")}</button>
        <button type="button" class="btn" data-cat="cargo">${t("cargo")}</button>
      </div>
      <div class="form-grid">
        <div class="form-field"><label>${t("make")}</label>
          <input type="text" name="make" value="${escapeHtml(existing?.make)}"></div>
        <div class="form-field"><label>${t("bodyType")}</label>
          <input type="text" name="bodyType" value="${escapeHtml(existing?.bodyType)}"></div>
        <div class="form-field"><label>${t("seats")}</label>
          <input type="number" min="0" name="seats" value="${escapeHtml(existing?.seats ?? "")}"></div>
        <div class="form-field"><label>${t("cargoDoors")}</label>
          <input type="text" name="cargoDoors" value="${escapeHtml(existing?.cargoDoors)}"></div>
        <div class="form-field"><label>${t("size")}</label>
          <input type="text" name="size" value="${escapeHtml(existing?.size)}"></div>
        <div class="form-field"><label>${t("plate")}</label>
          <input type="text" name="plate" value="${escapeHtml(existing?.plate)}"></div>
        <div class="form-field"><label>${t("deposit")}</label>
          <input type="number" min="0" name="deposit" value="${escapeHtml(existing?.deposit ?? "")}"></div>
        <div class="form-field"><label>${t("dailyRate")}</label>
          <input type="number" min="0" name="dailyRate" value="${escapeHtml(existing?.dailyRate ?? "")}"></div>
        <div class="form-field"><label>${t("fuelType")}</label>
          <input type="text" name="fuelType" id="car-fuel-type" value="${escapeHtml(existing?.fuelType)}" style="text-transform:uppercase"></div>
        <div class="form-field span-2"><label>${t("notes")}</label>
          <textarea name="notes">${escapeHtml(existing?.notes)}</textarea></div>
      </div>
      <div class="form-actions">
        <button type="button" class="btn" data-action="cancel">${t("cancel")}</button>
        <button type="submit" class="btn btn-primary">${t("save")}</button>
      </div>
    </form>
  `;

  openModal({
    title: isEdit ? t("carEditTitle") : t("carAddTitle"),
    bodyHtml,
    onMount: (root) => {
      let currentCategory = category;
      const catButtons = root.querySelectorAll("[data-cat]");
      function applyCatUI() {
        catButtons.forEach((b) => b.classList.toggle("active", b.dataset.cat === currentCategory));
      }
      applyCatUI();
      catButtons.forEach((b) =>
        b.addEventListener("click", () => {
          currentCategory = b.dataset.cat;
          applyCatUI();
        })
      );

      const fuelInput = root.querySelector("#car-fuel-type");
      fuelInput.addEventListener("input", () => {
        const pos = fuelInput.selectionStart;
        fuelInput.value = fuelInput.value.toUpperCase();
        fuelInput.setSelectionRange(pos, pos);
      });

      root.querySelector('[data-action="cancel"]').addEventListener("click", closeModal);
      root.querySelector("#car-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const record = {
          category: currentCategory,
          make: fd.get("make") || "",
          bodyType: fd.get("bodyType") || "",
          seats: fd.get("seats") ? Number(fd.get("seats")) : "",
          cargoDoors: fd.get("cargoDoors") || "",
          size: fd.get("size") || "",
          plate: fd.get("plate") || "",
          deposit: fd.get("deposit") ? Number(fd.get("deposit")) : "",
          dailyRate: fd.get("dailyRate") ? Number(fd.get("dailyRate")) : "",
          fuelType: (fd.get("fuelType") || "").toUpperCase(),
          notes: fd.get("notes") || "",
        };
        let saved;
        if (isEdit) {
          updateCar(existing.id, record);
          saved = { ...existing, ...record };
        } else {
          saved = addCar(record);
        }
        closeModal();
        if (onSaved) onSaved(saved);
      });
    },
  });
}

export function render(container) {
  container.innerHTML = `
    <h1 class="page-title">${t("nav_cars")}</h1>
    <div class="toolbar">
      <input type="text" class="search-input" id="car-search" placeholder="${t("search")}" style="max-width:260px">
      <button type="button" class="btn btn-primary" id="btn-add-car">${icons.plus}${t("add")}</button>
    </div>
    <div class="data-table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>${t("category")}</th><th>${t("make")}</th><th>${t("bodyType")}</th>
            <th>${t("plate")}</th><th>${t("dailyRate")}</th><th>${t("fuelType")}</th><th>${t("actions")}</th>
          </tr>
        </thead>
        <tbody id="car-rows"></tbody>
      </table>
    </div>
  `;

  const rowsEl = container.querySelector("#car-rows");
  const searchEl = container.querySelector("#car-search");

  function renderRows() {
    const query = searchEl.value.trim().toLowerCase();
    const cars = getCars().filter((c) =>
      `${c.make} ${c.bodyType} ${c.plate}`.toLowerCase().includes(query)
    );
    if (!cars.length) {
      rowsEl.innerHTML = `<tr><td colspan="7" class="empty-hint">${t("noData")}</td></tr>`;
      return;
    }
    rowsEl.innerHTML = cars
      .map(
        (c) => `
      <tr>
        <td>${c.category === "cargo" ? t("cargo") : t("passenger")}</td>
        <td>${escapeHtml(c.make)}</td>
        <td>${escapeHtml(c.bodyType)}</td>
        <td>${escapeHtml(c.plate)}</td>
        <td>${escapeHtml(c.dailyRate)}</td>
        <td>${escapeHtml(c.fuelType)}</td>
        <td class="row-actions">
          <button type="button" class="btn-icon btn-icon-edit" data-action="edit" data-id="${c.id}" title="${t("edit")}" aria-label="${t("edit")}">${icons.edit}</button>
          <button type="button" class="btn-icon btn-icon-delete" data-action="delete" data-id="${c.id}" title="${t("delete")}" aria-label="${t("delete")}">${icons.trash}</button>
        </td>
      </tr>`
      )
      .join("");

    rowsEl.querySelectorAll('[data-action="edit"]').forEach((btn) =>
      btn.addEventListener("click", () => {
        const car = getCars().find((c) => c.id === btn.dataset.id);
        openCarForm(car, renderRows);
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
            deleteCar(btn.dataset.id);
            renderRows();
          },
        });
      })
    );
  }

  container.querySelector("#btn-add-car").addEventListener("click", () => openCarForm(null, renderRows));
  searchEl.addEventListener("input", renderRows);
  renderRows();
}
