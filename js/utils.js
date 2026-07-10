// Small generic helpers used across the app.

export function uuid() {
  if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
  // Fallback for non-secure contexts / older browsers.
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function formatDate(value) {
  if (!value) return "";
  try {
    const d = typeof value === "string" ? new Date(value) : value;
    if (isNaN(d.getTime())) return String(value);
    return d.toLocaleDateString();
  } catch {
    return String(value);
  }
}

// Resolve a dotted path like "renter.name" against a context object.
export function resolvePath(obj, path) {
  return path.split(".").reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : ""), obj);
}

// Format a number with space-separated thousands groups (e.g. 30000 -> "30 000"), Hungarian style.
// Non-numeric/empty values are returned unchanged so free-text fields aren't affected.
export function formatThousands(value) {
  if (value === "" || value === null || value === undefined) return "";
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  const sign = num < 0 ? "-" : "";
  const intStr = Math.trunc(Math.abs(num)).toString();
  return sign + intStr.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

// Replace {{a.b}} tokens in a string using the given context object.
export function fillTemplate(str, context) {
  if (!str) return "";
  return str.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, path) => {
    const val = resolvePath(context, path);
    return val === undefined || val === null ? "" : String(val);
  });
}

export function downloadFile(filename, content, mimeType = "application/json") {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function nowLocalDateTimeValue() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}
