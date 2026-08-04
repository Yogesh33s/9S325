import { WeaponViewer } from './weapon-viewer.js';

export const categoryLabel = (categoryId) => categoryId.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

export function weaponCardTemplate(weapon, mode = 'grid') {
  return `
    <article class="${mode === 'gallery' ? 'gallery-card' : 'weapon-card'}">
      <div class="${mode === 'gallery' ? 'gallery-card__viewer' : 'weapon-card__viewer'} viewer-frame" data-preview-weapon="${weapon.id}"></div>
      <div class="${mode === 'gallery' ? 'gallery-card__top' : 'weapon-card__top'}">
        <div>
          <small>${categoryLabel(weapon.category)}</small>
          <h3><a href="weapon.html?id=${weapon.id}">${weapon.name}</a></h3>
        </div>
        <span class="meta-chip">${weapon.year}</span>
      </div>
      <p>${weapon.description}</p>
      <div class="meta-row">
        <span class="meta-chip">${weapon.country}</span>
        <span class="meta-chip">${weapon.manufacturer}</span>
      </div>
    </article>
  `;
}

export function mountPreviewViewers(root, weapons) {
  root.querySelectorAll('[data-preview-weapon]').forEach((node) => {
    const weapon = weapons.find((item) => item.id === node.dataset.previewWeapon);
    if (!weapon || node.dataset.viewerReady) return;
    node.dataset.viewerReady = 'true';
    new WeaponViewer(node, weapon, { mode: 'preview', interactive: false });
  });
}
