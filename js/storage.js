import { uuid, nowLocalDateTimeValue } from "./utils.js";

const STORAGE_KEY = "rentacar_data_v1";

function defaultTemplate() {
  return {
    id: uuid(),
    name: "Alap bérleti szerződés",
    logo: "",
    header: "",
    footer:
      "A Bérbevevő a gépjárművet rendeltetésszerűen köteles használni. A jármű nem rendelkezik CASCO biztosítással, az esetleges károkért a Bérbevevő teljes anyagi felelősséggel tartozik.",
    body:
      "Amely létrejött a Bérbeadó, valamint az alábbi Bérbevevő között:\n\n" +
      "Név: {{renter.name}}\n" +
      "Cím: {{renter.address}}\n" +
      "Telefon: {{renter.phone}}\n" +
      "Anyja neve: {{renter.motherName}}\n" +
      "Születési hely, idő: {{renter.birthPlace}}, {{renter.birthDate}}\n" +
      "Személyi igazolvány szám: {{renter.idNumber}}\n" +
      "Jogosítvány szám: {{renter.licenseNumber}}\n\n" +
      "Bérbeadó a Bérbevevő rendelkezésére bocsátja az alábbi gépjárművet:\n\n" +
      "Típus: {{car.make}} {{car.bodyType}}\n" +
      "Rendszám: {{car.plate}}\n" +
      "Üzemanyag: {{car.fuelType}}\n" +
      "Szállítható személyek száma: {{car.seats}}\n\n" +
      "Sérülések: {{extra.damages}}\n" +
      "Üzemanyagszint átadáskor: {{extra.fuelLevel}}%\n" +
      "Bérlés várható időtartama: {{extra.rentalDurationDays}} nap\n" +
      "Átadás dátuma, ideje: {{extra.handoverDateTime}}\n\n" +
      "Bérleti díj: {{car.dailyRate}} Ft/nap\n" +
      "Letét összege: {{car.deposit}} Ft",
    extraFields: [
      { key: "damages", label: { hu: "Sérülések", en: "Damages" }, type: "text", default: "" },
      { key: "fuelLevel", label: { hu: "Üzemanyagszint", en: "Fuel level" }, type: "range10", default: 100 },
      {
        key: "rentalDurationDays",
        label: { hu: "Bérlés várható időtartama (nap)", en: "Expected rental duration (days)" },
        type: "number",
        default: 1,
      },
      {
        key: "handoverDateTime",
        label: { hu: "Átadás dátuma, ideje", en: "Handover date & time" },
        type: "datetime-local",
        default: nowLocalDateTimeValue(),
      },
    ],
  };
}

export function defaultData() {
  return {
    settings: { lang: "hu", theme: "light" },
    users: [],
    cars: [],
    templates: [defaultTemplate()],
  };
}

export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData();
    const parsed = JSON.parse(raw);
    const base = defaultData();
    return {
      settings: { ...base.settings, ...(parsed.settings || {}) },
      users: Array.isArray(parsed.users) ? parsed.users : base.users,
      cars: Array.isArray(parsed.cars) ? parsed.cars : base.cars,
      templates:
        Array.isArray(parsed.templates) && parsed.templates.length ? parsed.templates : base.templates,
    };
  } catch (e) {
    console.error("Failed to load RentACar data, falling back to defaults.", e);
    return defaultData();
  }
}

export function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function clearData() {
  localStorage.removeItem(STORAGE_KEY);
}
