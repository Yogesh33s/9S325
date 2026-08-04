import { initSite } from '../core/site.js';
import { WEAPON_INDEX } from '../data/weapons.js';
import { WeaponViewer } from '../core/weapon-viewer.js';
import { categoryLabel } from '../core/catalog-ui.js';

initSite('weapon');
const params = new URLSearchParams(window.location.search);
const weapon = WEAPON_INDEX[params.get('id')] || WEAPON_INDEX.ak47;

document.title = `WeaponVerse — ${weapon.name}`;
document.getElementById('weaponHeroCopy').innerHTML = `
  <p class="eyebrow">${categoryLabel(weapon.category)}</p>
  <h1>${weapon.name}</h1>
  <p class="lead">${weapon.description}</p>
  <div class="meta-row">
    <span class="meta-chip">${weapon.country}</span>
    <span class="meta-chip">${weapon.manufacturer}</span>
    <span class="meta-chip">${weapon.year}</span>
  </div>
`;

document.getElementById('weaponSpecRail').innerHTML = [
  ['Manufacturer', weapon.manufacturer],
  ['Country', weapon.country],
  ['Caliber', weapon.caliber],
  ['Weight', weapon.weight],
  ['Magazine Capacity', weapon.magazineCapacity],
  ['Operation', weapon.operation],
  ['Fire Modes', weapon.fireModes]
].map(([label, value]) => `<div class="spec-item"><strong>${label}</strong><span>${value}</span></div>`).join('');

document.getElementById('weaponHistory').innerHTML = `<p class="eyebrow">History</p><h3>Platform background</h3><p>${weapon.history}</p>`;
document.getElementById('weaponVariants').innerHTML = `<p class="eyebrow">Variants</p><h3>Notable versions</h3><ul class="variant-list">${weapon.variants.map((variant) => `<li>${variant}</li>`).join('')}</ul>`;
document.getElementById('weaponGallery').innerHTML = `<p class="eyebrow">Gallery</p><h3>Museum notes</h3><ul class="gallery-list"><li>Drop a freely licensed GLB into <code>${weapon.modelPath}</code> for a hero-grade bespoke mesh.</li><li>Optional HDR file path: <code>${weapon.environmentPath}</code>.</li><li>The fallback procedural model preserves every required interaction so the page remains fully functional.</li></ul>`;
document.getElementById('weaponTimeline').innerHTML = `<p class="eyebrow">Timeline</p><h3>Era context</h3><p>${weapon.name} entered the museum timeline in <strong>${weapon.year}</strong>, representing the <strong>${categoryLabel(weapon.category)}</strong> wing during a period defined by ${weapon.operation.toLowerCase()} systems and evolving combat doctrine.</p>`;

const panel = document.getElementById('componentPanel');
const assetStatus = document.getElementById('assetStatus');
const viewer = new WeaponViewer(document.getElementById('weaponViewer'), weapon, {
  mode: 'detail',
  interactive: true,
  showHotspots: true,
  onAssetStatus: (status) => { assetStatus.textContent = status; },
  onHotspot: (hotspot) => {
    panel.innerHTML = `
      <p class="eyebrow">Component Focus</p>
      <h3>${hotspot.label}</h3>
      <dl>
        <div><dt>Purpose</dt><dd>${hotspot.purpose}</dd></div>
        <div><dt>Description</dt><dd>${hotspot.description}</dd></div>
        <div><dt>Material</dt><dd>${hotspot.material}</dd></div>
        <div><dt>History</dt><dd>${hotspot.history}</dd></div>
        <div><dt>Compatible Accessories</dt><dd>${hotspot.accessories}</dd></div>
      </dl>
    `;
  }
});

document.getElementById('resetCameraBtn').addEventListener('click', () => viewer.resetCamera());
