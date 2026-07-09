import { loadData, saveData, clearData, defaultData } from "./storage.js";
import { uuid } from "./utils.js";
import { setLang } from "./i18n.js";

let data = loadData();
setLang(data.settings.lang);

const listeners = new Set();

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function persistAndNotify() {
  saveData(data);
  listeners.forEach((fn) => fn(data));
}

export function getData() {
  return data;
}

// ---- Settings ----
export function getSettings() {
  return data.settings;
}

export function setLanguage(lang) {
  data.settings.lang = lang;
  setLang(lang);
  persistAndNotify();
}

export function setTheme(theme) {
  data.settings.theme = theme;
  persistAndNotify();
}

// ---- Users ----
export function getUsers() {
  return data.users;
}

export function getUserById(id) {
  return data.users.find((u) => u.id === id);
}

export function addUser(user) {
  const record = { id: uuid(), ...user };
  data.users.push(record);
  persistAndNotify();
  return record;
}

export function updateUser(id, patch) {
  const idx = data.users.findIndex((u) => u.id === id);
  if (idx === -1) return;
  data.users[idx] = { ...data.users[idx], ...patch, id };
  persistAndNotify();
}

export function deleteUser(id) {
  data.users = data.users.filter((u) => u.id !== id);
  // Detach the deleted person from any company's renters list.
  data.users.forEach((u) => {
    if (u.type === "company" && Array.isArray(u.renters)) {
      u.renters = u.renters.filter((rid) => rid !== id);
    }
  });
  persistAndNotify();
}

// ---- Cars ----
export function getCars() {
  return data.cars;
}

export function getCarById(id) {
  return data.cars.find((c) => c.id === id);
}

export function addCar(car) {
  const record = { id: uuid(), ...car };
  data.cars.push(record);
  persistAndNotify();
  return record;
}

export function updateCar(id, patch) {
  const idx = data.cars.findIndex((c) => c.id === id);
  if (idx === -1) return;
  data.cars[idx] = { ...data.cars[idx], ...patch, id };
  persistAndNotify();
}

export function deleteCar(id) {
  data.cars = data.cars.filter((c) => c.id !== id);
  persistAndNotify();
}

// ---- Templates ----
export function getTemplates() {
  return data.templates;
}

export function getTemplateById(id) {
  return data.templates.find((t) => t.id === id);
}

export function addTemplate(tpl) {
  const record = { id: uuid(), ...tpl };
  data.templates.push(record);
  persistAndNotify();
  return record;
}

export function updateTemplate(id, patch) {
  const idx = data.templates.findIndex((t) => t.id === id);
  if (idx === -1) return;
  data.templates[idx] = { ...data.templates[idx], ...patch, id };
  persistAndNotify();
}

export function deleteTemplate(id) {
  data.templates = data.templates.filter((t) => t.id !== id);
  persistAndNotify();
}

// ---- Bulk (Settings: import/export/reset) ----
export function replaceAllData(newData) {
  const base = defaultData();
  data = {
    settings: { ...base.settings, ...(newData.settings || {}) },
    users: Array.isArray(newData.users) ? newData.users : [],
    cars: Array.isArray(newData.cars) ? newData.cars : [],
    templates:
      Array.isArray(newData.templates) && newData.templates.length ? newData.templates : base.templates,
  };
  setLang(data.settings.lang);
  persistAndNotify();
}

export function resetAllData() {
  clearData();
  data = defaultData();
  setLang(data.settings.lang);
  persistAndNotify();
}
