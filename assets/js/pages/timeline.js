import { initSite } from '../core/site.js';
import { WEAPONS } from '../data/weapons.js';

initSite('timeline');
const timeline = document.getElementById('timelineList');
const sorted = [...WEAPONS].sort((a, b) => a.year - b.year);
timeline.innerHTML = sorted.map((weapon) => `
  <article class="timeline-card">
    <div class="timeline-year">${weapon.year}</div>
    <div>
      <h3><a href="weapon.html?id=${weapon.id}">${weapon.name}</a></h3>
      <div class="timeline-meta">
        <span class="meta-chip">${weapon.country}</span>
        <span class="meta-chip">${weapon.category.replace(/-/g, ' ')}</span>
      </div>
      <p>${weapon.history}</p>
    </div>
  </article>
`).join('');
