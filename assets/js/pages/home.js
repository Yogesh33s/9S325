import { initSite } from '../core/site.js';
import { runIntro } from '../core/intro.js';
import { CATEGORIES, WEAPONS } from '../data/weapons.js';
import { WeaponViewer } from '../core/weapon-viewer.js';

const { audio } = initSite('home');
runIntro(audio);

const heroViewer = document.querySelector('[data-weapon-viewer]');
if (heroViewer) {
  const featured = WEAPONS.find((weapon) => weapon.id === heroViewer.dataset.weapon);
  new WeaponViewer(heroViewer, featured, { mode: 'detail', interactive: true, onAssetStatus: () => {} });
}

const homeCategoryGrid = document.getElementById('homeCategoryGrid');
homeCategoryGrid.innerHTML = CATEGORIES.filter((category) => category.id !== 'all').map((category) => {
  const count = WEAPONS.filter((weapon) => weapon.category === category.id).length;
  return `
    <article class="category-card">
      <p class="eyebrow">${count} exhibits</p>
      <h3>${category.label}</h3>
      <p>${category.summary}</p>
      <a class="category-link" href="categories.html?category=${category.id}">Open gallery →</a>
    </article>
  `;
}).join('');

document.getElementById('museumHighlights').innerHTML = [
  ['3D inspection', 'Orbit, zoom, double-click reset, bloom and tone mapping.'],
  ['Interactive hotspots', 'Camera fly-ins and glass component panel callouts.'],
  ['Local-first architecture', 'Runs from static files with optional drop-in GLB and HDR assets.'],
  ['Museum pacing', 'Smoke, embers, parallax, and cinematic transitions throughout.']
].map(([title, copy]) => `<div class="highlight-row"><strong>${title}</strong><span>${copy}</span></div>`).join('');
