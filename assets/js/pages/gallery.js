import { initSite } from '../core/site.js';
import { WEAPONS } from '../data/weapons.js';
import { mountPreviewViewers, weaponCardTemplate } from '../core/catalog-ui.js';

initSite('gallery');
const gallery = document.getElementById('galleryGrid');
const selection = [...WEAPONS].sort((a, b) => b.year - a.year).slice(0, 12);
gallery.innerHTML = selection.map((weapon) => weaponCardTemplate(weapon, 'gallery')).join('');
mountPreviewViewers(gallery, selection);
