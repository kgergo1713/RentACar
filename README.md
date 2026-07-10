# RentACar

Client-side car rental management web app. Static site, deployable on GitHub Pages, **no backend** — all data is stored in the user's browser (`localStorage`), portable via JSON export/import.

> Source spec: [Claude.md](Claude.md) (Hungarian, original requirements — treat as source of truth if this README and the spec ever disagree). Sample seed data: [SampleCarList.md](SampleCarList.md). Sample contract layout reference: [SampleDocument.jpg](SampleDocument.jpg).

## Purpose

Manage car rental contracts: maintain renters (people/companies) and a car fleet, define printable contract templates, then run a wizard (pick renter → pick car → pick template → review/edit → print) to produce a filled contract.

## Tech stack / constraints

- Plain **HTML + CSS + vanilla JS (ES modules)**. No build step, no bundler, no npm dependencies, no framework. Must run by opening `index.html` directly via GitHub Pages (static hosting only).
- No external network calls at runtime (privacy: renter data must never leave the device). No CDN dependency for core functionality.
- All persistent state lives in `localStorage` under a single key; see [js/storage.js](js/storage.js). Settings screen provides full export (download JSON) / import (upload JSON) so a user can move their data between machines/browsers.
- UI must support **light/dark theme** and **HU (default) / EN** language, both toggleable from two small icon buttons top-right on every screen.
- App version is a single constant in [js/version.js](js/version.js), shown in the Settings screen's About section — bumped manually alongside a git tag on release, no build-time injection needed.

## Setup / run locally

No install, no build. Any static file server works; a helper script is provided:

```powershell
./scripts/start-local.ps1
```

This serves the repo root on `http://localhost:8000` (via `python -m http.server`) and opens it in the default browser. Equivalent manual command: `python -m http.server 8000`.

## Screens / navigation

Home screen: 5 large icon buttons with one-line tooltip descriptions, centered:

| Icon | Screen | Notes |
|---|---|---|
| A | Contract (Szerződés) | wizard: select renter → select car → select template → review/edit merged contract → print, green icon |
| B | Templates (Sablonok) | CRUD, orange icon |
| C | Cars (Autók) | CRUD, blue icon |
| D | Renters/Users (Bérlők) | CRUD, red icon |
| E | Settings (Beállítások) | export/import/reset full config, language, theme, gray icon |

Top-right (every screen): theme toggle (light/dark), language toggle (HU/EN, flag icons). Bottom of the
home screen: a small Gerisoft branding footer (theme-aware wordmark logo + current app version).

**Privacy rule:** in the Contract wizard's renter-selection step, the picker must show **name only** (no other personal fields), because the renter may be looking at the screen while the operator selects/edits.

## Data model

### User (renter) — `users[]`
Discriminated by `type: 'person' | 'company'`.

- `person`: `name, address, phone, motherName, birthPlace, birthDate, idNumber, licenseNumber`
- `company`: `companyName, registeredOffice, companyRegNumber, taxNumber, renters: [personId, ...]` — the actual signer(s) must be natural persons, referenced from existing `person`-type entries in the same `users[]` list (a company can have multiple).

### Car — `cars[]`
`category: 'passenger' | 'cargo'`, `make` (brand, e.g. FORD), `bodyType` (e.g. sedan/kombi/platós/dobozos), `seats`, `cargoDoors`, `size`, `deposit`, `dailyRate`, `plate`, `fuelType` (**always stored/displayed uppercase**), `notes`. Seeded by default with 62 vehicles transcribed from [SampleCarList.md](SampleCarList.md) (42 passenger, 10 vans, 8 trucks, 2 trailers) — see `defaultCars()` in [js/storage.js](js/storage.js).

### Template — `templates[]`
`name`, `logo` (base64 data URL, uploaded image), `header` (free text/HTML — intended for the lessor/own-company letterhead), `footer` (free text/HTML — intended for the Kelt/signature block), `body` (free text with `{{path.to.field}}` placeholder tokens resolved against the merge context below, modeled after [SampleDocument.jpg](SampleDocument.jpg)), `extraFields[]` — editable list of ad-hoc fields filled in per-contract, seeded with:
- `damages` (text)
- `fuelLevel` (0–100, step 10)
- `odometerReading` (number)
- `vehicleValue` (number — liability amount if the renter is at fault, no CASCO)
- `rentalDurationDays` (number)
- `handoverDateTime` (datetime-local)
- `returnDateTime` (datetime-local)

### Contract merge context (not persisted as its own CRUD table)
Built at wizard step 4 from the selected renter + car + template + extra field values:
```
{ renter: {...person fields...}, company: {...company fields, if any...}, car: {...car fields...}, extra: {...extraFields values...} }
```
`{{renter.name}}`, `{{car.plate}}`, `{{extra.fuelLevel}}`, etc. are replaced in `body` (and optionally header/footer) before printing. The merged result stays editable (contenteditable) before the user prints via `window.print()`.

## Planned file structure

```
index.html              shell: topbar (home/back, theme, lang) + #view mount point
css/styles.css          theme variables (light/dark), layout, table/modal/print styles
js/app.js               hash router, wires topbar buttons, mounts views into #view
js/i18n.js              HU/EN dictionaries + t(key) helper, current lang in state
js/theme.js             apply/toggle light-dark, persisted in settings
js/storage.js           localStorage load/save + export-to-file / import-from-file
js/state.js             in-memory store + CRUD helpers for users/cars/templates, pub-sub for re-render
js/utils.js             uuid, date formatting, escapeHtml, file download helper
js/modal.js             generic overlay modal component used by all CRUD forms
js/icons.js             inline SVG icons (nav icons, sun/moon, HU/EN flags)
js/views/home.js        5-icon launcher
js/views/users.js       Users CRUD (person/company form incl. company renters multi-select by name)
js/views/cars.js        Cars CRUD
js/views/templates.js   Templates CRUD (logo upload, header/footer/body editor, extraFields editor)
js/views/contract.js    4-step wizard + print
js/views/settings.js    language/theme, export/import/reset config, About section
js/version.js           single source of truth for the app version (semver)
img/app-icon.svg        app favicon (custom car icon on a colored rounded square)
img/contract.png        Contract nav tile icon (raster, replaces the inline SVG)
img/gerisoft-wordmark-light.png / -dark.png  theme-aware branding logo (home screen footer)
scripts/start-local.ps1 local static file server + opens the browser
LICENSE                 MIT
```

## Status

- [x] Repo initialized, spec docs collected (`Claude.md`, `SampleCarList.md`, `SampleDocument.jpg`)
- [x] `index.html` shell (topbar + `#view` mount point)
- [x] `css/styles.css` (theme + layout + print rules)
- [x] Core JS: `i18n.js`, `storage.js`, `state.js`, `utils.js`, `modal.js`, `theme.js`, `icons.js`
- [x] `app.js` router
- [x] Views: `home`, `users`, `cars`, `templates`, `contract`, `settings`
- [x] Local smoke test (served via `python -m http.server`, exercised in browser: car/user/company CRUD, contract wizard merge, theme toggle, language toggle, settings screen) — all passed, no console errors
- [x] Pushed to `https://github.com/kgergo1713/RentACar` (main branch), deployed via GitHub Pages on a custom domain (see `CNAME`)
- [x] Version constant (`js/version.js`) + About section (version, feedback email, Revolut support link) in Settings
- [x] `LICENSE` (MIT)
- [x] Home screen nav icons colored per section; branding footer (Gerisoft wordmark + version); custom app favicon (`img/app-icon.svg`)
- [x] Default car fleet seeded from `SampleCarList.md` (62 vehicles); default contract template rewritten to mirror `SampleDocument.jpg`
- [x] Settings "Restore defaults" clearly reloads the shipped default car fleet + contract template (clears renters/custom edits in this browser)

### Not yet implemented / known gaps
- Templates view: rich formatting in the body (currently plain text with `{{...}}` tokens only, no bold/tables).
- No dedicated "own company / lessor" settings section — the template's `header` field is meant to hold that free text (letterhead).
- No automated tests (manual smoke test only, see above).

## Conventions for future work on this repo

- Keep everything dependency-free and buildless; if a feature seems to need a library, prefer a small hand-rolled implementation first.
- Every user-facing string must go through `i18n.js` (`t('key')`) — no hardcoded HU/EN text in view files.
- Fuel type values are normalized to uppercase at input time, not just on display.
- Don't add a persisted "contracts" table unless explicitly requested — the spec only defines 3 CRUD entities (Users, Cars, Templates); generated contracts are ephemeral/print-only.
- Local validation before pushing to GitHub is required (see Status checklist).
- Version bumps: update `js/version.js`, commit, then create an annotated git tag `vX.Y.Z` — no build/CI step involved.

## License

[MIT](LICENSE)

## Feedback & support

- Feedback / bug reports: [kgergo1713@gmail.com](mailto:kgergo1713@gmail.com)
- Support the project: [Revolut](https://revolut.me/kgergo1713)
