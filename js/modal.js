// Generic overlay modal used by all CRUD forms.
import { icons } from "./icons.js";

let activeOverlay = null;

export function closeModal() {
  if (activeOverlay) {
    activeOverlay.remove();
    activeOverlay = null;
    document.removeEventListener("keydown", onKeyDown);
  }
}

function onKeyDown(e) {
  if (e.key === "Escape") closeModal();
}

/**
 * @param {Object} opts
 * @param {string} opts.title
 * @param {string} opts.bodyHtml
 * @param {(root: HTMLElement) => void} [opts.onMount] called with the modal-box root after insertion
 */
export function openModal({ title, bodyHtml, onMount }) {
  closeModal();

  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.innerHTML = `
    <div class="modal-box" role="dialog" aria-modal="true">
      <div class="modal-title">
        <span>${title}</span>
        <button type="button" class="modal-close" aria-label="Close">${icons.back}</button>
      </div>
      <div class="modal-body">${bodyHtml}</div>
    </div>
  `;

  overlay.addEventListener("mousedown", (e) => {
    if (e.target === overlay) closeModal();
  });
  overlay.querySelector(".modal-close").addEventListener("click", closeModal);

  document.body.appendChild(overlay);
  activeOverlay = overlay;
  document.addEventListener("keydown", onKeyDown);

  const box = overlay.querySelector(".modal-box");
  if (onMount) onMount(box);
  return box;
}

export function confirmDialog({ title, message, confirmLabel, cancelLabel, onConfirm }) {
  openModal({
    title,
    bodyHtml: `
      <p>${message}</p>
      <div class="form-actions">
        <button type="button" class="btn" data-action="cancel">${cancelLabel}</button>
        <button type="button" class="btn btn-danger" data-action="confirm">${confirmLabel}</button>
      </div>
    `,
    onMount: (root) => {
      root.querySelector('[data-action="cancel"]').addEventListener("click", closeModal);
      root.querySelector('[data-action="confirm"]').addEventListener("click", () => {
        closeModal();
        onConfirm();
      });
    },
  });
}
