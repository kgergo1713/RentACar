import { t } from "../i18n.js";
import { icons } from "../icons.js";
import { escapeHtml } from "../utils.js";
import { openModal, closeModal, confirmDialog } from "../modal.js";
import { getUsers, addUser, updateUser, deleteUser } from "../state.js";

function displayName(user) {
  return user.type === "company" ? user.companyName || "" : user.name || "";
}

/**
 * Opens the shared Add/Edit renter form. Reused by the Contract wizard.
 * @param {Object|null} existing existing user record to edit, or null to create a new one
 * @param {(user: Object) => void} [onSaved] called with the saved record
 */
export function openUserForm(existing, onSaved) {
  const isEdit = !!existing;
  const type = existing?.type || "person";
  const persons = getUsers().filter((u) => u.type === "person" && u.id !== existing?.id);

  const bodyHtml = `
    <form id="user-form">
      <div class="type-toggle">
        <button type="button" class="btn" data-type="person">${t("person")}</button>
        <button type="button" class="btn" data-type="company">${t("company")}</button>
      </div>

      <div id="person-fields" class="form-grid">
        <div class="form-field span-2"><label>${t("name")}</label>
          <input type="text" name="name" value="${escapeHtml(existing?.name)}"></div>
        <div class="form-field span-2"><label>${t("address")}</label>
          <input type="text" name="address" value="${escapeHtml(existing?.address)}"></div>
        <div class="form-field"><label>${t("phone")}</label>
          <input type="tel" name="phone" value="${escapeHtml(existing?.phone)}"></div>
        <div class="form-field"><label>${t("motherName")}</label>
          <input type="text" name="motherName" value="${escapeHtml(existing?.motherName)}"></div>
        <div class="form-field"><label>${t("birthPlace")}</label>
          <input type="text" name="birthPlace" value="${escapeHtml(existing?.birthPlace)}"></div>
        <div class="form-field"><label>${t("birthDate")}</label>
          <input type="date" name="birthDate" value="${escapeHtml(existing?.birthDate)}"></div>
        <div class="form-field"><label>${t("idNumber")}</label>
          <input type="text" name="idNumber" value="${escapeHtml(existing?.idNumber)}"></div>
        <div class="form-field"><label>${t("licenseNumber")}</label>
          <input type="text" name="licenseNumber" value="${escapeHtml(existing?.licenseNumber)}"></div>
      </div>

      <div id="company-fields" class="form-grid">
        <div class="form-field span-2"><label>${t("companyName")}</label>
          <input type="text" name="companyName" value="${escapeHtml(existing?.companyName)}"></div>
        <div class="form-field span-2"><label>${t("registeredOffice")}</label>
          <input type="text" name="registeredOffice" value="${escapeHtml(existing?.registeredOffice)}"></div>
        <div class="form-field"><label>${t("companyRegNumber")}</label>
          <input type="text" name="companyRegNumber" value="${escapeHtml(existing?.companyRegNumber)}"></div>
        <div class="form-field"><label>${t("taxNumber")}</label>
          <input type="text" name="taxNumber" value="${escapeHtml(existing?.taxNumber)}"></div>
        <div class="form-field span-2">
          <label>${t("renters")}</label>
          <div class="chip-list" id="renters-chip-list">
            ${
              persons.length
                ? persons
                    .map(
                      (p) =>
                        `<span class="chip" data-id="${p.id}">${escapeHtml(p.name)}</span>`
                    )
                    .join("")
                : `<span class="empty-hint">${t("noPersonsYet")}</span>`
            }
          </div>
          <small>${t("rentersHint")}</small>
        </div>
      </div>

      <div class="form-actions">
        <button type="button" class="btn" data-action="cancel">${t("cancel")}</button>
        <button type="submit" class="btn btn-primary">${t("save")}</button>
      </div>
    </form>
  `;

  const selectedRenters = new Set(existing?.renters || []);

  const root = openModal({
    title: isEdit ? t("userEditTitle") : t("userAddTitle"),
    bodyHtml,
    onMount: (modalRoot) => {
      let currentType = type;
      const personFields = modalRoot.querySelector("#person-fields");
      const companyFields = modalRoot.querySelector("#company-fields");
      const typeButtons = modalRoot.querySelectorAll("[data-type]");

      function applyTypeUI() {
        typeButtons.forEach((b) => b.classList.toggle("active", b.dataset.type === currentType));
        personFields.classList.toggle("hidden", currentType !== "person");
        companyFields.classList.toggle("hidden", currentType !== "company");
      }
      applyTypeUI();

      typeButtons.forEach((b) =>
        b.addEventListener("click", () => {
          currentType = b.dataset.type;
          applyTypeUI();
        })
      );

      modalRoot.querySelectorAll("#renters-chip-list .chip").forEach((chip) => {
        chip.classList.toggle("selected", selectedRenters.has(chip.dataset.id));
        chip.addEventListener("click", () => {
          const id = chip.dataset.id;
          if (selectedRenters.has(id)) selectedRenters.delete(id);
          else selectedRenters.add(id);
          chip.classList.toggle("selected", selectedRenters.has(id));
        });
      });

      modalRoot.querySelector('[data-action="cancel"]').addEventListener("click", closeModal);

      modalRoot.querySelector("#user-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        let record;
        if (currentType === "person") {
          record = {
            type: "person",
            name: fd.get("name") || "",
            address: fd.get("address") || "",
            phone: fd.get("phone") || "",
            motherName: fd.get("motherName") || "",
            birthPlace: fd.get("birthPlace") || "",
            birthDate: fd.get("birthDate") || "",
            idNumber: fd.get("idNumber") || "",
            licenseNumber: fd.get("licenseNumber") || "",
          };
        } else {
          record = {
            type: "company",
            companyName: fd.get("companyName") || "",
            registeredOffice: fd.get("registeredOffice") || "",
            companyRegNumber: fd.get("companyRegNumber") || "",
            taxNumber: fd.get("taxNumber") || "",
            renters: Array.from(selectedRenters),
          };
        }

        let saved;
        if (isEdit) {
          updateUser(existing.id, record);
          saved = { ...existing, ...record };
        } else {
          saved = addUser(record);
        }
        closeModal();
        if (onSaved) onSaved(saved);
      });
    },
  });

  return root;
}

export function render(container) {
  container.innerHTML = `
    <h1 class="page-title">${t("nav_users")}</h1>
    <div class="toolbar">
      <input type="text" class="search-input" id="user-search" placeholder="${t("search")}" style="max-width:260px">
      <button type="button" class="btn btn-primary" id="btn-add-user">${icons.plus}${t("add")}</button>
    </div>
    <div class="data-table-wrap">
      <table class="data-table">
        <thead>
          <tr><th>${t("name")}</th><th>${t("type")}</th><th>${t("actions")}</th></tr>
        </thead>
        <tbody id="user-rows"></tbody>
      </table>
    </div>
  `;

  const rowsEl = container.querySelector("#user-rows");
  const searchEl = container.querySelector("#user-search");

  function renderRows() {
    const query = searchEl.value.trim().toLowerCase();
    const users = getUsers().filter((u) => displayName(u).toLowerCase().includes(query));
    if (!users.length) {
      rowsEl.innerHTML = `<tr><td colspan="3" class="empty-hint">${t("noData")}</td></tr>`;
      return;
    }
    rowsEl.innerHTML = users
      .map(
        (u) => `
      <tr>
        <td>${escapeHtml(displayName(u))}</td>
        <td>${u.type === "company" ? t("company") : t("person")}</td>
        <td class="row-actions">
          <button type="button" class="btn" data-action="edit" data-id="${u.id}">${icons.edit}</button>
          <button type="button" class="btn btn-danger" data-action="delete" data-id="${u.id}">${icons.trash}</button>
        </td>
      </tr>`
      )
      .join("");

    rowsEl.querySelectorAll('[data-action="edit"]').forEach((btn) =>
      btn.addEventListener("click", () => {
        const user = getUsers().find((u) => u.id === btn.dataset.id);
        openUserForm(user, renderRows);
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
            deleteUser(btn.dataset.id);
            renderRows();
          },
        });
      })
    );
  }

  container.querySelector("#btn-add-user").addEventListener("click", () => openUserForm(null, renderRows));
  searchEl.addEventListener("input", renderRows);
  renderRows();
}
