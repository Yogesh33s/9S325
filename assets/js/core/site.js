import { gsap } from 'gsap';
import { setupAudioDock } from './audio.js';

function setActiveNav(pageKey) {
  document.querySelectorAll('[data-nav]').forEach((node) => {
    node.classList.toggle('is-active', node.dataset.nav === pageKey);
  });
}

function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.main-nav');
  toggle?.addEventListener('click', () => nav?.classList.toggle('is-open'));
}

function initSpotlight() {
  window.addEventListener('pointermove', (event) => {
    document.documentElement.style.setProperty('--mx', `${(event.clientX / window.innerWidth) * 100}%`);
    document.documentElement.style.setProperty('--my', `${(event.clientY / window.innerHeight) * 100}%`);
  });
}

function initAtmosphere() {
  const canvas = document.querySelector('.atmosphere-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const particles = Array.from({ length: 64 }, () => ({
    x: Math.random(),
    y: Math.random(),
    size: Math.random() * 2.2 + 0.6,
    speed: Math.random() * 0.0018 + 0.0006,
    drift: (Math.random() - 0.5) * 0.001
  }));

  const resize = () => {
    canvas.width = window.innerWidth * Math.min(window.devicePixelRatio, 1.5);
    canvas.height = window.innerHeight * Math.min(window.devicePixelRatio, 1.5);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
  };
  resize();
  window.addEventListener('resize', resize);

  const render = () => {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    particles.forEach((particle) => {
      particle.y -= particle.speed;
      particle.x += particle.drift;
      if (particle.y < -0.05) {
        particle.y = 1.05;
        particle.x = Math.random();
      }
      const x = particle.x * window.innerWidth;
      const y = particle.y * window.innerHeight;
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, particle.size * 8);
      gradient.addColorStop(0, 'rgba(255, 177, 99, 0.9)');
      gradient.addColorStop(1, 'rgba(255, 123, 47, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, particle.size * 4, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(render);
  };
  render();
}

function initPageTransitions() {
  const overlay = document.querySelector('.page-transition');
  if (!overlay) return;
  document.querySelectorAll('a[href$=".html"], a[href*="weapon.html"], a[href*="categories.html"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || link.target === '_blank') return;
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#')) return;
      event.preventDefault();
      gsap.to(overlay, { opacity: 1, duration: 0.25, onComplete: () => { window.location.href = href; } });
    });
  });
  window.addEventListener('pageshow', () => gsap.to(overlay, { opacity: 0, duration: 0.3 }));
}

export function initSite(pageKey) {
  setActiveNav(pageKey);
  initMobileNav();
  initSpotlight();
  initAtmosphere();
  initPageTransitions();
  const audio = setupAudioDock();
  return { audio };
}
