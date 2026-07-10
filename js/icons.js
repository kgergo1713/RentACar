// Inline SVG icon set (monochrome, stroke = currentColor). No external assets/CDN.

const svg = (inner, viewBox = "0 0 24 24") =>
  `<svg viewBox="${viewBox}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;

export const icons = {
  contract: `<span class="icon-mask" style="-webkit-mask-image:url(img/contract.png);mask-image:url(img/contract.png);"></span>`,
  templates: svg(`<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4"/><path d="M9 11h6M9 14h6M9 17h4"/>`),
  cars: svg(
    `<path d="M4 16l1.5-5A2 2 0 0 1 7.4 9.5h9.2A2 2 0 0 1 18.5 11L20 16"/><rect x="2.5" y="16" width="19" height="4" rx="1.2"/><circle cx="7" cy="20" r="1.6"/><circle cx="17" cy="20" r="1.6"/>`
  ),
  users: svg(
    `<circle cx="9" cy="8" r="3.2"/><path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5"/><circle cx="17" cy="9" r="2.6"/><path d="M15.2 14.3c2.4.3 4.3 2.1 4.3 4.7"/>`
  ),
  settings: svg(
    `<circle cx="12" cy="12" r="3"/><path d="M19.4 13a7.6 7.6 0 0 0 .1-2l2-1.5-2-3.5-2.4.6a7.6 7.6 0 0 0-1.7-1L15 3h-6l-.4 2.6a7.6 7.6 0 0 0-1.7 1l-2.4-.6-2 3.5L4.5 11a7.6 7.6 0 0 0 0 2l-2 1.5 2 3.5 2.4-.6c.5.4 1.1.8 1.7 1L9 21h6l.4-2.6c.6-.2 1.2-.6 1.7-1l2.4.6 2-3.5-2.1-1.5z"/>`
  ),
  sun: svg(
    `<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/>`
  ),
  moon: svg(`<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z"/>`),
  back: svg(`<path d="M15 5l-7 7 7 7"/>`),
  plus: svg(`<path d="M12 5v14M5 12h14"/>`),
  edit: svg(`<path d="M4 20l1-4 11-11 3 3-11 11-4 1z"/>`),
  trash: svg(`<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>`),
  print: svg(`<path d="M6 9V3h12v6"/><rect x="4" y="9" width="16" height="7" rx="1"/><path d="M6 16v5h12v-5"/>`),
  upload: svg(`<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>`),
  download: svg(`<path d="M12 4v12M7 11l5 5 5-5"/><path d="M4 20h16"/>`),
  reset: svg(`<path d="M4 4v6h6"/><path d="M20 20v-6h-6"/><path d="M5 13a7 7 0 0 1 12-4.5L20 10M19 11a7 7 0 0 1-12 4.5L4 14"/>`),
};

export const flagHu = `<svg viewBox="0 0 24 16" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="16" fill="#fff"/><rect width="24" height="5.33" fill="#ce2939"/><rect y="10.67" width="24" height="5.33" fill="#477050"/></svg>`;

export const flagEn = `<svg viewBox="0 0 24 16" xmlns="http://www.w3.org/2000/svg">
  <rect width="24" height="16" fill="#00247d"/>
  <path d="M0 0L24 16M24 0L0 16" stroke="#fff" stroke-width="3"/>
  <path d="M0 0L24 16M24 0L0 16" stroke="#cf142b" stroke-width="1.4"/>
  <path d="M12 0V16M0 8H24" stroke="#fff" stroke-width="5"/>
  <path d="M12 0V16M0 8H24" stroke="#cf142b" stroke-width="3"/>
</svg>`;
