import { t } from "../i18n.js";
import { icons } from "../icons.js";

const tiles = [
  { route: "contract", icon: "contract", labelKey: "nav_contract", descKey: "nav_contract_desc" },
  { route: "templates", icon: "templates", labelKey: "nav_templates", descKey: "nav_templates_desc" },
  { route: "cars", icon: "cars", labelKey: "nav_cars", descKey: "nav_cars_desc" },
  { route: "users", icon: "users", labelKey: "nav_users", descKey: "nav_users_desc" },
  { route: "settings", icon: "settings", labelKey: "nav_settings", descKey: "nav_settings_desc" },
];

export function render(container) {
  container.innerHTML = `
    <div class="home-grid">
      ${tiles
        .map(
          (tile) => `
        <button type="button" class="home-tile" data-route="${tile.route}" title="${t(tile.descKey)}">
          ${icons[tile.icon]}
          <span>${t(tile.labelKey)}</span>
        </button>`
        )
        .join("")}
    </div>
  `;

  container.querySelectorAll(".home-tile").forEach((btn) => {
    btn.addEventListener("click", () => {
      location.hash = `#/${btn.dataset.route}`;
    });
  });
}
