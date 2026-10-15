/* Visual layer only: preloader, tab wipe, custom cursor, hero distortion */
(() => {
  const $ = s => document.querySelector(s), body = document.body;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  body.classList.add('is-hero');

  // Preloader: counter + ring, then slide away
  const pre = $('#preloader');
  if (reduce) { pre.remove(); } else {
    body.classList.add('loading');
    const num = $('#pl-num'), ring = $('#pl-ring'), C = 2 * Math.PI * 45, t0 = performance.now(), D = 1800;
    ring.style.strokeDasharray = C;
    (function tick(t) {
      const p = Math.min((t - t0) / D, 1);
      num.textContent = Math.round(p * 100) + '%';
      ring.style.strokeDashoffset = C * (1 - p);
      if (p < 1) return requestAnimationFrame(tick);
      pre.classList.add('done'); body.classList.remove('loading');
      setTimeout(() => pre.remove(), 1100);
    })(t0);
  }

  // Tab switching wrapper: wipe transition around the existing showTab()
  const orig = window.showTab; let busy = false;
  window.showTab = function (id) {
    if (busy) return; busy = true;
    const w = $('#wipe'); w.className = 'in';
    setTimeout(() => { orig(id); body.classList.toggle('is-hero', !id); window.scrollTo(0, 0); w.className = 'out'; }, 520);
    setTimeout(() => { w.className = ''; busy = false; }, 1080);
  };

  // Custom cursor (hover-capable devices only)
  const dot = $('#cur-dot'), ringEl = $('#cur-ring');
  if (matchMedia('(hover: hover)').matches) {
    let x = 0, y = 0, rx = 0, ry = 0;
    addEventListener('mousemove', e => { x = e.clientX; y = e.clientY; dot.style.transform = `translate(${x}px,${y}px)`; body.classList.add('cur-on'); });
    (function loop() { rx += (x - rx) * .15; ry += (y - ry) * .15; ringEl.style.transform = `translate(${rx}px,${ry}px)`; requestAnimationFrame(loop); })();
    document.addEventListener('mouseover', e => ringEl.classList.toggle('big', !!e.target.closest('a,button,.cf-card,.project-card,.cert-inline-item')));
  } else { dot.remove(); ringEl.remove(); }

  // Hero headline: liquid distortion that follows the cursor and settles back
  if (!reduce) {
    const disp = $('#disp'), title = $('.hero-title'), hero = $('#hero');
    let s = 0, target = 0, raf = 0;
    const step = () => {
      s += (target - s) * .12; target *= .92;
      disp.setAttribute('scale', s.toFixed(1));
      if (s < .5 && target < .5) { title.style.filter = ''; s = 0; raf = 0; return; }
      raf = requestAnimationFrame(step);
    };
    hero.addEventListener('mousemove', e => {
      const r = title.getBoundingClientRect();
      if (e.clientY < r.top - 60 || e.clientY > r.bottom + 60) return;
      target = 60; title.style.filter = 'url(#liquid)';
      if (!raf) raf = requestAnimationFrame(step);
    });
  }
})();
