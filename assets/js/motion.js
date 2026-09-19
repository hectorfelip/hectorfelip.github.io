(() => {
  'use strict';
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const root = document.documentElement;
  const pt = root.lang.startsWith('pt');
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const isHome = !!document.querySelector('.hero');

  // 1. Cabeçalhos em palavras com máscara
  const split = (el) => {
    let n = 0;
    const walk = (node) => {
      [...node.childNodes].forEach((c) => {
        if (c.nodeType === 3) {
          const frag = document.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach((t) => {
            if (!t) return;
            if (/^\s+$/.test(t)) return frag.append(' ');
            const w = document.createElement('span'), i = document.createElement('span');
            w.className = 'w'; i.className = 'wi'; i.style.setProperty('--i', n++); i.textContent = t;
            w.append(i); frag.append(w);
          });
          c.replaceWith(frag);
        } else if (c.nodeType === 1 && c.tagName !== 'BR') walk(c);
      });
    };
    el.setAttribute('aria-label', el.innerHTML.replace(/<br\s*\/?>/g, ' ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim());
    walk(el);
  };

  // 2. Marquee (home)
  const buildMarquee = () => {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    const words = pt ? ['Desenvolvimento', 'Web design'] : ['Development', 'Web design'];
    const group = () => {
      const g = document.createElement('div'); g.className = 'marquee-group';
      for (let k = 0; k < 2; k++) words.forEach((w) => {
        const t = document.createElement('span'); t.className = 'marquee-item'; t.textContent = w;
        const d = document.createElement('span'); d.className = 'marquee-dot';
        g.append(t, d);
      });
      return g;
    };
    const m = document.createElement('div');
    m.className = 'marquee'; m.setAttribute('aria-hidden', 'true');
    const track = document.createElement('div'); track.className = 'marquee-track';
    track.append(group(), group());
    m.append(track);
    hero.after(m);
    let x = 0, last = scrollY, vel = 0, visible = false, w = 0;
    new IntersectionObserver((e) => { visible = e[0].isIntersecting; }).observe(m);
    const tick = () => {
      const dy = scrollY - last; last = scrollY;
      vel += (Math.min(Math.abs(dy), 60) - vel) * .1;
      if (visible) {
        w = w || track.firstChild.offsetWidth;
        x = (x + .6 + vel * .35) % w;
        track.style.transform = `translate3d(${-x}px,0,0)`;
      }
      requestAnimationFrame(tick);
    };
    tick();
  };

  // 3. Decodificação de rótulos mono
  const decode = (el) => {
    const final = el.textContent, chars = '01[]/#*+—';
    const t0 = performance.now(), dur = 700;
    const step = (now) => {
      const p = Math.min((now - t0) / dur, 1);
      el.textContent = [...final].map((ch, i) =>
        /[\s.,\[\]\/—-]/.test(ch) || i < p * final.length ? ch : chars[Math.random() * chars.length | 0]).join('');
      if (p < 1) requestAnimationFrame(step); else el.textContent = final;
    };
    requestAnimationFrame(step);
  };

  // 4. Revelação por scroll
  const setupReveal = () => {
    const heads = $$('h1, .section h2, .contact-banner h2, .page-intro h1');
    heads.forEach(split);
    const items = $$(['.hero-eyebrow', '.hero-desc', '.hero-actions', '.hero-foot', '.section-kicker',
      '.about-copy p', '.about-copy .text-link', '.about-photo', '.service-card', '.project-feature',
      '.skills-layout p', '.skill-row', '.contact-banner .eyebrow', '.contact-actions', '.contact-banner .avatar',
      '.section-top .text-link', '.page-intro .eyebrow', '.page-intro p', '.filter-bar', '.contact-option',
      '.contact-note', '.contact-intro .avatar', '.empty-state'].join(','));
    items.forEach((el) => {
      el.classList.add('rv');
      const sibs = [...el.parentElement.children].filter((c) => c.classList.contains('rv'));
      el.style.setProperty('--d', Math.min(sibs.indexOf(el), 5) * 90 + 'ms');
    });
    const decodes = $$('.service-number, .photo-number, .project-overline, .section-kicker .index');
    const portrait = document.querySelector('.hero-portrait');
    const targets = [...heads, ...items];
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        if (portrait && e.target.matches('.hero h1')) portrait.classList.add('is-in'); // clip-path total impede o observer
        io.unobserve(e.target);
        e.target.querySelectorAll?.('.service-number,.project-overline,.index,.photo-number')
          .forEach(decode);
        if (decodes.includes(e.target)) decode(e.target);
      });
    }, { threshold: .15, rootMargin: '0px 0px -6% 0px' });
    targets.forEach((t) => io.observe(t));
  };

  // 5. Cursor + magnetismo (só mouse)
  const setupCursor = () => {
    if (!matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    const c = document.createElement('div');
    c.className = 'cursor'; c.setAttribute('aria-hidden', 'true');
    document.body.append(c);
    let tx = 0, ty = 0, x = 0, y = 0;
    addEventListener('mousemove', (e) => { tx = e.clientX; ty = e.clientY; c.classList.add('on'); });
    document.addEventListener('mouseleave', () => c.classList.remove('on'));
    (function loop() {
      x += (tx - x) * .2; y += (ty - y) * .2;
      c.style.transform = `translate3d(${x}px,${y}px,0)`;
      requestAnimationFrame(loop);
    })();
    const hot = 'a,button,.filter';
    document.addEventListener('mouseover', (e) => {
      const proj = e.target.closest('.project-visual');
      const isHot = !!e.target.closest(hot);
      c.classList.toggle('label', !!proj);
      c.classList.toggle('hot', isHot && !proj);
      c.textContent = proj ? (pt ? 'Abrir' : 'Open') : '';
    });
    $$('.button, .header-contact, .project-open').forEach((el) => {
      el.classList.add('magnet');
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .22}px,${(e.clientY - r.top - r.height / 2) * .3}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  };

  // 6. Intro (uma vez por sessão, só na home)
  const start = () => { setupReveal(); buildMarquee(); setupCursor(); };
  root.classList.add('motion');
  let seen = false;
  try { seen = sessionStorage.getItem('intro') === '1'; sessionStorage.setItem('intro', '1'); } catch (e) {}
  const arrive = root.classList.contains('pt-arrive');
  if (!isHome || seen || arrive) return arrive ? void setTimeout(start, 450) : start();

  const intro = document.createElement('div');
  intro.className = 'intro'; intro.setAttribute('aria-hidden', 'true');
  const mark = document.createElement('div'); mark.className = 'intro-mark';
  [...'FELPOLIIN'].forEach((ch, i) => {
    const s = document.createElement('span'); s.style.setProperty('--i', i); s.textContent = ch; mark.append(s);
  });
  const bar = document.createElement('div'); bar.className = 'intro-bar';
  intro.append(mark, bar);
  document.body.append(intro);
  let done = false;
  const finish = () => {
    if (done) return; done = true;
    intro.classList.add('out');
    setTimeout(start, 350);
    setTimeout(() => intro.remove(), 900);
  };
  setTimeout(finish, 1400);
  intro.addEventListener('click', finish);
  addEventListener('keydown', finish, { once: true });
})();
