import { uuid, nowLocalDateTimeValue } from "./utils.js";

const STORAGE_KEY = "rentacar_data_v1";

function defaultTemplate() {
  return {
    id: uuid(),
    name: "Alap bérleti szerződés",
    logo: "",
    header:
      "KIADÓAUTÓ Kft., székhely: 2536, Nyergesújfalu, Sánc Dűlő 77., adószám: 24780153-2-11, cégjegyzékszám: 11-09-022298, tel.: +36-20-9360-568, mint Bérbeadó",
    footer:
      "Kelt: ________________________, ______________________\n\n" +
      "_____________________________\t_____________________________\n" +
      "Bérbeadó\tBérbevevő",
    body:
      "BÉRLETI SZERZŐDÉS\n" +
      "A fenti Bérbeadó és az alábbi Bérbevevő között a mai napon az alábbi feltételekkel jött létre:\n\n" +
      "Név: {{renter.name}}\tTelefon: {{renter.phone}}\n" +
      "Cím: {{renter.address}}\n" +
      "Anyja neve: {{renter.motherName}}\n" +
      "Születési hely, idő: {{renter.birthPlace}}, {{renter.birthDate}}\n" +
      "Személyi igazolvány szám: {{renter.idNumber}}\tJogosítvány szám: {{renter.licenseNumber}}\n" +
      "Cégnév: {{company.companyName}}\tSzékhely: {{company.registeredOffice}}\n" +
      "Cégjegyzékszám: {{company.companyRegNumber}}\tAdószám: {{company.taxNumber}}\n\n" +
      "Bérbeadó a Bérbevevő rendelkezésére bocsátja meghatározott időtartamra az alábbi gépkocsit:\n\n" +
      "Típus: {{car.make}} {{car.bodyType}}\tRendszám: {{car.plate}}\n" +
      "Kilométeróra állás: {{extra.odometerReading}} km\tÜzemanyag: {{car.fuelType}}\n" +
      "Szállítható személyek száma: {{car.seats}}\tSérülések: {{extra.damages}}\n" +
      "Üzemanyagszint átadáskor: {{extra.fuelLevel}}%\n\n" +
      "Felek a gépkocsi átadásakor a gépkocsit közösen szemrevételezték, a Bérbeadó tájékoztatta a Bérbevevőt annak jelenlegi sérüléseiről, hibáiról, amit a Bérbevevő tudomásul vett. A Bérbevevő kötelezi magát arra, hogy a gépkocsit rendeltetésszerűen használja, megóvja annak állapotát, és az esetlegesen előforduló műszaki hiba vagy baleset esetén azonnal értesíti a Bérbeadót. Tudomásul veszi, hogy amennyiben a gépkocsin a bérleti időtartam alatt bárminemű rongálást vagy kárt okoz, köteles azt megtéríteni; ez az összeg a letéti díjból levonásra kerül. A Bérbevevő tudomásul veszi, hogy a gépkocsin nincs CASCO biztosítás, így saját hibás baleset esetén teljes anyagi felelősséggel tartozik az autóért, melynek mértéke: {{extra.vehicleValue}} Ft.\n" +
      "A gépkocsit az átadáskor feljegyzett üzemanyagszinttel kérjük vissza! A gépjármű csak {{car.fuelType}} üzemanyaggal tankolható!\n" +
      "A Bérbevevő felelősséggel tartozik a bérleti időtartam alatt előforduló közlekedési szabálysértésekért (gyorshajtás, piros lámpa, parkolási büntetés stb.). Tudomásul veszi, hogy ha a Bérbeadót később ilyen ügyekkel kapcsolatban a hatóságok megkeresik, a Bérbeadó kiadhatja a Bérbevevő személyes adatait, és a Bérbevevő köteles a büntetéseket kifizetni. Továbbá köteles betartani a magyarországi fizetős utakra vonatkozó szabályokat; ha a fizetős úthasználattal kapcsolatban probléma merül fel (pótdíj fizetési kötelezettség), az ezzel kapcsolatos költségek a Bérbevevőt terhelik, illetve amennyiben autópálya-matricát vásárolt, ennek bizonylatát köteles átadni a Bérbeadónak.\n" +
      "A gépkocsival a külföldre történő utazás NEM ENGEDÉLYEZETT!\n\n" +
      "Bérlés várható időtartama: {{extra.rentalDurationDays}} nap.\tÁtadva: {{extra.handoverDateTime}}\tVisszahozva: {{extra.returnDateTime}}\n" +
      "Bérleti díj: {{car.dailyRate}} Ft/nap\tLetét összege: {{car.deposit}} Ft",
    extraFields: [
      { key: "damages", label: { hu: "Sérülések", en: "Damages" }, type: "text", default: "" },
      { key: "fuelLevel", label: { hu: "Üzemanyagszint", en: "Fuel level" }, type: "range10", default: 100 },
      {
        key: "odometerReading",
        label: { hu: "Kilométeróra állás", en: "Odometer reading" },
        type: "number",
        default: "",
      },
      {
        key: "vehicleValue",
        label: { hu: "Gépkocsi értéke (felelősség mértéke, Ft)", en: "Vehicle value (liability amount)" },
        type: "number",
        default: "",
      },
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
      {
        key: "returnDateTime",
        label: { hu: "Visszahozás dátuma, ideje", en: "Return date & time" },
        type: "datetime-local",
        default: "",
      },
    ],
  };
}

// Seed car fleet, transcribed from SampleCarList.md (source: kiadoauto.hu, retrieved 2026-07-08).
// Field mapping: category passenger/cargo, make = Gyártmány, bodyType = Típus/Típus-ajtók,
// cargoDoors = Raktér ajtók (vans only), size = Méret, deposit = Kaució (blank where source
// marks it "n.a."), plate blank where source marks it "N/A", notes = color/climate/extra remarks.
export function defaultCars() {
  const passenger = (make, bodyType, dailyRate, seats, fuel, color, ac, extra, plate) => ({
    category: "passenger",
    make,
    bodyType,
    seats,
    cargoDoors: "",
    size: "",
    deposit: 30000,
    dailyRate,
    plate: plate === "N/A" ? "" : plate,
    fuelType: fuel.toUpperCase(),
    notes: [`Szín: ${color}`, `Klíma: ${ac ? "van" : "nincs"}`, extra && extra !== "–" ? `Extra: ${extra}` : ""]
      .filter(Boolean)
      .join("; "),
  });

  const van = (make, model, dailyRate, deposit, seats, fuel, doors, size, plate, extraNote) => ({
    category: "cargo",
    make,
    bodyType: model,
    seats,
    cargoDoors: doors,
    size,
    deposit: deposit || "",
    dailyRate,
    plate: plate === "N/A" ? "" : plate,
    fuelType: fuel.toUpperCase(),
    notes: extraNote || "",
  });

  const truck = (make, model, dailyRate, deposit, seats, fuel, bodyDesc, size, plate, extraNote) => ({
    category: "cargo",
    make,
    bodyType: bodyDesc,
    seats,
    cargoDoors: "",
    size,
    deposit: deposit || "",
    dailyRate,
    plate: plate === "N/A" ? "" : plate,
    fuelType: fuel.toUpperCase(),
    notes: [model, extraNote].filter(Boolean).join(" — "),
  });

  const trailer = (dailyRate, capacity, axle, size) => ({
    category: "cargo",
    make: "Utánfutó",
    bodyType: "Utánfutó",
    seats: 0,
    cargoDoors: "",
    size,
    deposit: "",
    dailyRate,
    plate: "",
    fuelType: "",
    notes: `Teherbírás: ${capacity}; Futómű: ${axle}`,
  });

  const passengerCars = [
    passenger("Ford", "Focus 1,6Tdci", 12000, 5, "Gázolaj", "Fekete", true, "Tempomat, Isofix", "PEL012"),
    passenger("Ford", "Focus 1,6Tdci", 12000, 5, "Gázolaj", "Szürke", true, "Tempomat, Isofix, vonóhorog", "MBX223"),
    passenger("Ford", "Focus 1,6Tdci", 12000, 5, "Gázolaj", "Szürke", true, "Tempomat, Isofix, vonóhorog", "MVX061"),
    passenger("Ford", "Focus 1,6Tdci", 12000, 5, "Gázolaj", "Fehér", true, "Tempomat, Isofix", "MDR840"),
    passenger("Ford", "Focus 1,6Tdci", 12000, 5, "Gázolaj", "Szürke", true, "–", "MBX230"),
    passenger("Ford", "Focus kombi 1,6Tdci", 10000, 5, "Gázolaj", "Szürke", true, "–", "LGT404"),
    passenger("Ford", "Focus kombi 1,6Tdci", 10000, 5, "Gázolaj", "Fehér", true, "–", "LBP281"),
    passenger("Ford", "Focus kombi 1,6i", 10000, 5, "Benzin", "Kék", true, "–", "LBK560"),
    passenger("Ford", "Focus kombi 1,6Tdci", 10000, 5, "Gázolaj", "Fehér", true, "vonóhorog", "LJY244"),
    passenger("Ford", "Focus 1,6Tdci", 10000, 5, "Gázolaj", "Szürke", true, "–", "LBP457"),
    passenger("Ford", "Focus kombi 1,6Tdci", 10000, 5, "Gázolaj", "Szürke", true, "–", "LOH678"),
    passenger("Ford", "Focus kombi 1,6Tdci", 10000, 5, "Gázolaj", "Szürke", true, "–", "LVV297"),
    passenger("Ford", "Focus kombi 1,8Tdci", 10000, 5, "Gázolaj", "Fekete", true, "–", "LAP219"),
    passenger("Ford", "Focus kombi 1,6Tdci", 10000, 5, "Dízel", "Kék", true, "–", "LGS912"),
    passenger("Ford", "Focus kombi 1,6Tdci", 10000, 5, "Dízel", "Szürke", true, "–", "LFX276"),
    passenger("Ford", "Focus kombi 1,6Tdci", 10000, 5, "Gázolaj", "Szürke", true, "–", "LXV855"),
    passenger("Ford", "Focus 1,6Tdci", 10000, 5, "Gázolaj", "Fekete", true, "–", "LZG910"),
    passenger("Ford", "Focus 1,6Tdci", 10000, 5, "Gázolaj", "Kék", true, "–", "LSG362"),
    passenger("Ford", "Focus 1,6Tdci", 10000, 5, "Gázolaj", "Szürke", true, "–", "AAAL502"),
    passenger("Ford", "Focus 1,6i", 10000, 5, "Benzin", "Fehér", true, "–", "JZE722"),
    passenger("Ford", "Focus 1,8i", 10000, 5, "Benzin", "Szürke", true, "–", "KYS296"),
    passenger("Ford", "Focus 1,6i", 10000, 5, "Benzin", "Szürke", true, "–", "181"),
    passenger("Ford", "Focus 1,6Tdci", 10000, 5, "Gázolaj", "Fehér", true, "–", "JYU875"),
    passenger("Ford", "Focus kombi 1,8Tdci", 10000, 5, "Gázolaj", "Fehér", true, "vonóhorog", "086"),
    passenger("Ford", "Focus 1,6Tdci", 10000, 5, "Gázolaj", "Fehér", true, "–", "JYG374"),
    passenger("Ford", "Focus kombi 1,6i", 10000, 5, "Benzin", "Szürke", true, "–", "PHW775"),
    passenger("Ford", "Focus 1,6Tdci", 10000, 5, "Gázolaj", "Fehér", true, "–", "KID735"),
    passenger("Ford", "Focus 1,6Tdci", 10000, 5, "Gázolaj", "Fekete", true, "–", "AECC225"),
    passenger("Ford", "Focus kombi 1,6Tdci", 10000, 5, "Dízel", "Fehér", true, "–", "KWZ230"),
    passenger("Ford", "C-max 1,8Tdci", 10000, 5, "Dízel", "Fekete", true, "–", "MGG098"),
    passenger("Ford", "Focus c-max 1,6Tdci", 10000, 5, "Gázolaj", "Fehér", true, "–", "KIY040"),
    passenger("Ford", "Focus c-max 1,6Tdci", 10000, 5, "Gázolaj", "Szürke", true, "–", "JHB552"),
    passenger("Ford", "Focus c-max 1,6i", 10000, 5, "Benzin", "Kék", true, "–", "N/A"),
    passenger("Ford", "Fiesta 1,4Tdci", 10000, 5, "Dízel", "Kék", true, "–", "LPE042"),
    passenger("Ford", "Connect 5 fős 1,8Tdci", 10000, 5, "Gázolaj", "Fehér", true, "–", "AABI730"),
    passenger("VW", "New Beetle 1,4i", 10000, 4, "Benzin", "Kék", false, "–", "MVF385"),
    passenger("VW", "Bora 1,6i", 10000, 4, "Benzin", "Fehér", false, "–", "IER363"),
    passenger("Toyota", "Yaris 1,4 D-4D", 10000, 5, "Gázolaj", "Kék", false, "elektromos ablak", "TCX403"),
    passenger("Opel", "Astra G 1,4i", 8000, 5, "Benzin", "Fehér", true, "–", "N/A"),
    passenger("Opel", "Astra 1,4i", 8000, 5, "Benzin", "Fehér", false, "–", "HGG149"),
    passenger("Opel", "Astra 1,4i", 8000, 5, "Benzin", "Fehér", true, "Klímás! (kiemelt hirdetés)", "JKJ940"),
    passenger("Opel", "Astra 1,2i", 8000, 5, "Benzin", "Fehér", false, "vonóhorog", "LOH320"),
  ];

  const vans = [
    van("Ford", "Transit Maxi 2,4 Tdci", 20000, 30000, 3, "Gázolaj", "jobb oldali tolóajtó + hátul dupla ajtó", "155×180×355 cm", "N/A", ""),
    van("Ford", "Transit 2,2 dízel", 20000, 30000, 3, "Gázolaj", "jobb oldali tolóajtó + hátul dupla ajtó", "175×195×330 cm", "N/A", "Vonóhorgos; költöztetésre/bútorszállításra, szálanyag 6m-ig, táblás anyag 4,5m-ig, nyílászáró szállításra alkalmas"),
    van("Mercedes", "Sprinter 2,2 cdi", 15000, 30000, 3, "Gázolaj", "jobb oldali tolóajtó + hátul dupla ajtó", "174×174×330 cm", "AIFU594", ""),
    van("Ford", "Transit 2,4 dízel", 15000, 30000, 3, "Gázolaj", "jobb oldali tolóajtó + hátul dupla ajtó", "175×185×315 cm", "N/A", ""),
    van("Ford", "Transit 2,4Tdi", 15000, "", 5, "Gázolaj", "jobb oldali tolóajtó + hátul ajtó", "175×185×315 cm", "N/A", ""),
    van("Ford", "Transit 2,0Tdi", 15000, "", 5, "Gázolaj", "jobb oldali tolóajtó + hátul ajtó", "170×145×245 cm", "N/A", "Vonóhorgos"),
    van("Ford", "Connect", 10000, "", 2, "Gázolaj", "jobb oldali tolóajtó + hátul dupla ajtó", "140×134×160 cm", "N/A", ""),
    van("Ford", "Connect", 10000, "", 2, "Gázolaj", "jobb oldali tolóajtó + hátul ajtó", "140×120×140 cm", "KIR116", ""),
    van("Ford", "Connect", 10000, "", 2, "Gázolaj", "jobb oldali tolóajtó + hátul ajtó", "140×120×140 cm", "MMS532", ""),
    van("Fiat", "Grande Punto 1,3td", 10000, "", 2, "Gázolaj", "jobb oldali tolóajtó + hátul ajtó", "140×110×100 cm", "N/A", ""),
  ];

  // Teherautó (platós/billencs) list, excluding the 4 rows the source document identifies as
  // duplicates of a van already listed above (same physical vehicle, same photo).
  const trucks = [
    truck("Mercedes", "Sprinter 2,3 D", 15000, 30000, 3, "Gázolaj", "platós", "192×40×272 cm", "PHC687", ""),
    truck("Opel", "Movano 2,5Dci", 20000, 30000, 3, "Gázolaj", "platós, billencs 3 oldalra", "200 cm széles, 370 cm hosszú", "RYS390", ""),
    truck("Volkswagen", "2,5Tdi", 15000, 30000, 7, "Gázolaj", "3 ajtós, platós", "190×40×320 cm", "N/A", "Vonóhorgos"),
    truck("Mercedes", "Sprinter 2,3 dízel", 20000, 30000, 6, "Gázolaj", "platós, billencs 3 oldalra", "200×270 cm", "N/A", ""),
    truck("Mercedes", "Sprinter 2,2cdi", 15000, 30000, 3, "Gázolaj", "platós", "200×330 cm", "N/A", ""),
    truck("Mercedes", "Sprinter 2,2 cdi", 15000, 30000, 3, "Gázolaj", "platós", "200×270 cm", "N/A", ""),
    truck("Mercedes", "Sprinter 2,3 D", 15000, 30000, 2, "Gázolaj", "platós", "194×270 cm", "N/A", ""),
    truck("Ford", "Connect 1,8Tdi", 10000, 30000, 2, "Gázolaj", "zárt, hátsó ajtó", "144×120×140 cm", "N/A", ""),
  ];

  const trailers = [
    trailer(5000, "600 kg", "lengéscsillapító nélküli merev tengely", "145×245 cm"),
    trailer(5000, "500 kg", "laprugós tengely", "140×250 cm"),
  ];

  return [...passengerCars, ...vans, ...trucks, ...trailers].map((car) => ({ id: uuid(), ...car }));
}

// Seed renters with fictitious example data, so the app isn't empty on first run and the
// Contract wizard / company-renters relationship can be tried out immediately.
export function defaultUsers() {
  const person1 = {
    id: uuid(),
    type: "person",
    name: "Kovács János",
    address: "1011 Budapest, Fő utca 12.",
    phone: "+36 20 123 4567",
    motherName: "Kovács Jánosné (Tóth Mária)",
    birthPlace: "Budapest",
    birthDate: "1985-04-12",
    idNumber: "123456AB",
    licenseNumber: "AB123456",
  };
  const person2 = {
    id: uuid(),
    type: "person",
    name: "Nagy Éva",
    address: "6720 Szeged, Kossuth Lajos sugárút 5.",
    phone: "+36 30 234 5678",
    motherName: "Nagy Éváné (Kiss Anna)",
    birthPlace: "Szeged",
    birthDate: "1990-09-23",
    idNumber: "234567BC",
    licenseNumber: "BC234567",
  };
  const person3 = {
    id: uuid(),
    type: "person",
    name: "Szabó Péter",
    address: "4024 Debrecen, Piac utca 22.",
    phone: "+36 70 345 6789",
    motherName: "Szabó Péterné (Varga Ilona)",
    birthPlace: "Debrecen",
    birthDate: "1978-01-30",
    idNumber: "345678CD",
    licenseNumber: "CD345678",
  };
  const company1 = {
    id: uuid(),
    type: "company",
    companyName: "Minta Kereskedelmi Kft.",
    registeredOffice: "1052 Budapest, Váci utca 1.",
    companyRegNumber: "01-09-999999",
    taxNumber: "12345678-2-42",
    renters: [person1.id],
  };
  return [person1, person2, person3, company1];
}

export function defaultData() {
  return {
    settings: { lang: "hu", theme: "light" },
    users: defaultUsers(),
    cars: defaultCars(),
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
