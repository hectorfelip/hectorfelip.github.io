(() => {
  'use strict';
  const g = window.gsap;
  if (!g || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const $ = (s) => document.querySelector(s);
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const wide = matchMedia('(min-width: 801px)').matches;
  if (window.ScrollTrigger) g.registerPlugin(ScrollTrigger);

  // Hero com profundidade: mouse (camadas em velocidades diferentes) + scroll
  const portrait = $('.hero-portrait');
  if (portrait) {
    const pic = portrait.querySelector('picture');
    if (fine) {
      g.set(pic, { scale: 1.08 });
      const layers = [
        [pic, 14], [portrait.querySelector('.corner'), -6],
        [portrait.querySelector('.photo-number'), -9], [$('.hero h1'), -8],
      ].filter(([el]) => el).map(([el, d]) => [g.quickTo(el, 'x', { duration: .9, ease: 'power3' }), g.quickTo(el, 'y', { duration: .9, ease: 'power3' }), d]);
      const hero = $('.hero');
      hero.addEventListener('mousemove', (e) => {
        const r = hero.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - .5, ny = (e.clientY - r.top) / r.height - .5;
        layers.forEach(([qx, qy, d]) => { qx(-nx * d * 2); qy(-ny * d * 2); });
      });
      hero.addEventListener('mouseleave', () => layers.forEach(([qx, qy]) => { qx(0); qy(0); }));
    }
    if (window.ScrollTrigger && wide) {
      const opt = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .6 };
      g.to('.hero-copy', { y: -70, ease: 'none', scrollTrigger: opt });
      g.to(portrait, { y: 50, ease: 'none', scrollTrigger: opt });
    }
  }

  // Card do projeto: inclinação 3D e captura com deslocamento interno
  if (fine) document.querySelectorAll('.project-visual').forEach((v) => {
    const pic = v.querySelector('picture');
    if (!pic) return;
    pic.style.display = 'block';
    const rx = g.quickTo(pic, 'rotationX', { duration: .6, ease: 'power3' });
    const ry = g.quickTo(pic, 'rotationY', { duration: .6, ease: 'power3' });
    const tz = g.quickTo(pic, 'z', { duration: .6, ease: 'power3' });
    g.set(pic, { transformPerspective: 1000 });
    v.addEventListener('mousemove', (e) => {
      const r = v.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - .5, ny = (e.clientY - r.top) / r.height - .5;
      ry(nx * 8); rx(-ny * 8); tz(24);
    });
    v.addEventListener('mouseleave', () => { rx(0); ry(0); tz(0); });
  });

  // Transição entre páginas: cortina sobe, a próxima página a devolve
  const curtain = document.createElement('div');
  curtain.setAttribute('aria-hidden', 'true');
  curtain.style.cssText = 'position:fixed;inset:0;z-index:300;background:var(--purple);pointer-events:none;transform:translateY(100%)';
  document.body.append(curtain);
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target || a.hasAttribute('download')) return;
    const u = new URL(a.href, location.href);
    if (u.origin !== location.origin || !/(\.html|\/)$/.test(u.pathname)) return;
    if (u.pathname === location.pathname && u.search === location.search) return; // âncora na mesma página
    e.preventDefault();
    try { sessionStorage.setItem('pt', '1'); } catch (err) {}
    curtain.style.pointerEvents = 'all';
    g.to(curtain, { y: 0, yPercent: 0, duration: .6, ease: 'power3.inOut', onComplete: () => { location.href = a.href; } });
  });
  addEventListener('pageshow', (e) => {
    if (e.persisted) { g.set(curtain, { yPercent: 100, y: 0 }); curtain.style.pointerEvents = 'none'; }
  });
})();
