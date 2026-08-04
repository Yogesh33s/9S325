import { initSite } from '../core/site.js';

initSite('about');
const aboutGrid = document.getElementById('aboutGrid');
aboutGrid.innerHTML = [
  {
    title: 'Educational mission',
    copy: 'WeaponVerse frames every artifact as a study in industrial design, field history, and mechanical evolution rather than as a gameplay mechanic.',
    points: ['Historical summaries for each platform', 'Component-by-component hotspot callouts', 'Country, manufacturer, and operating-system context']
  },
  {
    title: 'Offline-ready architecture',
    copy: 'The project runs locally as a static site using HTML, CSS, JavaScript, Three.js, GSAP, and drop-in GLB/HDR assets.',
    points: ['No framework dependency', 'No backend required', 'Graceful procedural fallbacks when custom assets are absent']
  },
  {
    title: 'Premium interaction language',
    copy: 'Glassmorphism, bloom, particles, embers, cinematic transitions, and procedural audio combine to create a museum-grade interface.',
    points: ['Mouse spotlight and parallax atmosphere', 'Orbit inspection with double-click reset', 'Smooth GSAP camera fly-ins']
  }
].map((item) => `
  <article class="about-card glass-panel">
    <p class="eyebrow">Museum Pillar</p>
    <h3>${item.title}</h3>
    <p>${item.copy}</p>
    <ul>${item.points.map((point) => `<li>${point}</li>`).join('')}</ul>
  </article>
`).join('');
