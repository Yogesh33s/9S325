import { initSite } from '../core/site.js';
import { CATEGORIES, weaponsByCategory } from '../data/weapons.js';
import { mountPreviewViewers, weaponCardTemplate } from '../core/catalog-ui.js';

initSite('categories');
const filterRoot = document.getElementById('categoryFilter');
const grid = document.getElementById('weaponGrid');
const params = new URLSearchParams(window.location.search);
let activeCategory = params.get('category') || 'assault-rifles';

function render() {
  filterRoot.innerHTML = CATEGORIES.filter((item) => item.id !== 'all').map((category) => `
    <button class="filter-btn ${category.id === activeCategory ? 'is-active' : ''}" data-category="${category.id}" type="button">${category.label}</button>
  `).join('');

  const weapons = weaponsByCategory(activeCategory);
  grid.innerHTML = weapons.map((weapon) => weaponCardTemplate(weapon, 'grid')).join('');
  mountPreviewViewers(grid, weapons);

  filterRoot.querySelectorAll('[data-category]').forEach((button) => {
    button.addEventListener('click', () => {
      activeCategory = button.dataset.category;
      render();
      history.replaceState({}, '', `categories.html?category=${activeCategory}`);
    });
  });
}

render();
