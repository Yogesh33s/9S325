import { gsap } from 'gsap';

export function runIntro(audio) {
  const overlay = document.getElementById('introOverlay');
  const skipIntro = new URLSearchParams(window.location.search).get('skipIntro') === '1';
  if (!overlay || skipIntro || sessionStorage.getItem('weaponverse-intro-seen')) {
    overlay?.remove();
    return;
  }
  sessionStorage.setItem('weaponverse-intro-seen', '1');
  const canvas = document.getElementById('introCanvas');
  const cracks = overlay.querySelector('.intro-cracks');
  const flash = overlay.querySelector('.intro-flash');
  const logo = overlay.querySelector('.intro-logo-wrap');
  const ctx = canvas.getContext('2d');
  const sparks = Array.from({ length: 54 }, () => ({ x: Math.random(), y: Math.random(), vx: (Math.random() - 0.5) * 0.002, vy: Math.random() * 0.002 + 0.0004, r: Math.random() * 2 + 0.8 }));
  const shots = Array.from({ length: 5 }, (_, index) => ({ progress: 0, active: false, index }));

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  resize();
  window.addEventListener('resize', resize);

  const render = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const smoke = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 50, canvas.width / 2, canvas.height / 2, canvas.width * 0.55);
    smoke.addColorStop(0, 'rgba(255,255,255,0.04)');
    smoke.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = smoke;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    sparks.forEach((spark) => {
      spark.x += spark.vx;
      spark.y -= spark.vy;
      if (spark.y < -0.1) { spark.y = 1.1; spark.x = Math.random(); }
      const x = spark.x * canvas.width;
      const y = spark.y * canvas.height;
      const g = ctx.createRadialGradient(x, y, 0, x, y, spark.r * 6);
      g.addColorStop(0, 'rgba(255,180,120,.95)');
      g.addColorStop(1, 'rgba(255,120,40,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, spark.r * 3, 0, Math.PI * 2);
      ctx.fill();
    });

    shots.forEach((shot) => {
      if (!shot.active) return;
      const p = shot.progress;
      const x = canvas.width * (0.15 + shot.index * 0.17);
      const y = canvas.height * (0.75 - shot.index * 0.1);
      const streak = 80 + p * 520;
      ctx.save();
      ctx.translate(x + p * canvas.width * 0.15, y - p * canvas.height * 0.1);
      ctx.scale(1 + p * 2.6, 1 + p * 2.6);
      ctx.fillStyle = 'rgba(255,140,60,.9)';
      ctx.shadowColor = 'rgba(255,160,80,.9)';
      ctx.shadowBlur = 28;
      ctx.beginPath();
      ctx.moveTo(-streak, 0);
      ctx.lineTo(10, -5);
      ctx.lineTo(20, 0);
      ctx.lineTo(10, 5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });

    if (overlay.isConnected) requestAnimationFrame(render);
  };
  render();

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.to({}, { duration: 0.8 })
    .to(logo, { opacity: 0.14, duration: 0.4 })
    .add(() => {
      shots.forEach((shot, index) => {
        gsap.to(shot, {
          progress: 1,
          duration: 0.58,
          delay: index * 0.28,
          ease: 'power4.in',
          onStart: () => { shot.active = true; },
          onComplete: () => {
            shot.active = false;
            gsap.fromTo(flash, { opacity: 0.9 }, { opacity: 0, duration: 0.28 });
            gsap.fromTo(cracks, { opacity: 0.5 }, { opacity: 0.08, duration: 0.45 });
            document.body.animate([{ transform: 'translateX(-8px)' }, { transform: 'translateX(8px)' }, { transform: 'translateX(0)' }], { duration: 180 });
            audio?.impact(1 + index * 0.12);
          }
        });
      });
    })
    .to({}, { duration: 2 })
    .to(logo, { opacity: 1, duration: 0.8 })
    .to(overlay, { opacity: 0, duration: 1.05, delay: 0.55, onComplete: () => overlay.remove() });
}
