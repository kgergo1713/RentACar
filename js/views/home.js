import { t } from "../i18n.js";
import { icons } from "../icons.js";
import { VERSION } from "../version.js";

const tiles = [
  { route: "contract", icon: "contract", labelKey: "nav_contract", descKey: "nav_contract_desc" },
  { route: "templates", icon: "templates", labelKey: "nav_templates", descKey: "nav_templates_desc" },
  { route: "cars", icon: "cars", labelKey: "nav_cars", descKey: "nav_cars_desc" },
  { route: "users", icon: "users", labelKey: "nav_users", descKey: "nav_users_desc" },
  { route: "settings", icon: "settings", labelKey: "nav_settings", descKey: "nav_settings_desc" },
];

export function render(container) {
  container.innerHTML = `
    <div class="home-pentagon">
      ${tiles
        .map(
          (tile, idx) => `
        <button type="button" class="home-tile home-tile--${idx}" data-route="${tile.route}" title="${t(tile.descKey)}">
          ${icons[tile.icon]}
          <span>${t(tile.labelKey)}</span>
        </button>`
        )
        .join("")}
    </div>

    <footer class="brand-footer">
      <a href="https://geri-soft.com" target="_blank" rel="noopener noreferrer" class="brand-footer-link" aria-label="Gerisoft">
        <img src="img/gerisoft-wordmark-light.png" alt="Gerisoft" class="wordmark wordmark-light">
        <img src="img/gerisoft-wordmark-dark.png" alt="Gerisoft" class="wordmark wordmark-dark">
      </a>
      <span class="brand-footer-version">v${VERSION}</span>
    </footer>
  `;

  container.querySelectorAll(".home-tile").forEach((btn) => {
    btn.addEventListener("click", () => {
      location.hash = `#/${btn.dataset.route}`;
    });
  });
}
