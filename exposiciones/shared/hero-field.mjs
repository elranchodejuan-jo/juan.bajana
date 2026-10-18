/** Original acid-base diagram: a lightweight particle transition over semantic SVG. */
const CAPTIONS = [
  'El resultado integra metabolismo, ventilación y función renal.',
  'Los pulmones regulan CO₂; los riñones conservan base y excretan ácido.',
  'La relación HCO₃⁻/CO₂ se refleja en el pH; interpretar exige contexto.',
];

export function initializeHero(root = document) {
  root.querySelectorAll('[data-hero]').forEach((hero) => {
    if (hero.dataset.heroReady) return;
    hero.dataset.heroReady = 'true';
    const win = hero.ownerDocument.defaultView;
    const doc = hero.ownerDocument;
    const stage = hero.querySelector('[data-hero-stage]');
    const canvas = hero.querySelector('[data-hero-canvas]');
    const layers = [...hero.querySelectorAll('[data-hero-layer]')];
    const buttons = [...hero.querySelectorAll('[data-hero-step]')];
    const motion = hero.querySelector('[data-hero-motion]');
    const caption = hero.querySelector('[data-hero-caption]');
    const status = hero.querySelector('[data-hero-status]');
    const reduced = win.matchMedia?.('(prefers-reduced-motion: reduce)');
    let ctx;
    try { ctx = canvas?.getContext('2d'); } catch { /* SVG stays fully usable. */ }
    let selected = 0;
    let localPaused = false;
    let inView = true;
    let frame = 0;
    let lastTime = 0;
    let lastPaint = 0;
    let width = 900;
    let height = 430;
    let pointer = { x: 0, y: 0 };
    let manualScroll = null;
    let scrollFrame = 0;
    const count = win.matchMedia?.('(max-width: 600px)').matches ? 80 : 144;
    const points = Array.from({ length: count }, (_, i) => ({ x: 450, y: 215, phase: i * 2.399963 }));
    let palette = { cyan: '#79e0ee', copper: '#e9ad82' };

    function refreshPalette() {
      const style = win.getComputedStyle(hero);
      palette = {
        cyan: style.getPropertyValue('--hero-cyan').trim() || '#79e0ee',
        copper: style.getPropertyValue('--hero-copper').trim() || '#e9ad82',
      };
    }

    function paused() {
      return reduced?.matches || localPaused || doc.body.dataset.motion === 'paused';
    }
    function visibleScene() {
      const scene = hero.closest('.expo-scene');
      return doc.body.dataset.mode !== 'presentar' || !scene || scene.classList.contains('present');
    }
    function canAnimate() {
      return ctx && !paused() && inView && !doc.hidden && visibleScene();
    }
    function sampleLayer(layer) {
      const paths = [...layer.querySelectorAll('[data-morph-path]')];
      try {
        const lengths = paths.map((p) => p.getTotalLength());
        const total = lengths.reduce((a, b) => a + b, 0);
        if (!total) throw new Error('No path geometry');
        return points.map((_, index) => {
          let distance = (index + .5) / count * total;
          let pathIndex = 0;
          while (pathIndex < paths.length - 1 && distance > lengths[pathIndex]) distance -= lengths[pathIndex++];
          const p = paths[pathIndex].getPointAtLength(distance);
          return { x: p.x, y: p.y };
        });
      } catch {
        return points.map((_, i) => ({ x: 450 + Math.cos(i / count * Math.PI * 2) * 180, y: 215 + Math.sin(i / count * Math.PI * 2) * 110 }));
      }
    }
    const targets = layers.map(sampleLayer);
    points.forEach((p, i) => Object.assign(p, targets[0][i]));

    function draw(time = 0, immediate = false) {
      if (!ctx) return;
      const ratio = Math.min(win.devicePixelRatio || 1, 2);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const scale = Math.min(width / 900, height / 430);
      ctx.translate((width - 900 * scale) / 2, (height - 430 * scale) / 2);
      ctx.scale(scale, scale);
      const { cyan, copper } = palette;
      const delta = lastTime ? Math.min(64, time - lastTime) : 16;
      lastTime = time;
      const blend = immediate ? 1 : 1 - Math.exp(-delta / 150);
      points.forEach((point, i) => {
        const target = targets[selected][i];
        point.x += (target.x - point.x) * blend;
        point.y += (target.y - point.y) * blend;
        const drift = immediate ? 0 : Math.sin(time * .0007 + point.phase) * 1.7;
        const x = point.x + drift + pointer.x * (i % 3 + 1);
        const y = point.y + drift * .6 + pointer.y * (i % 3 + 1);
        ctx.fillStyle = i % 9 === 0 ? copper : cyan;
        ctx.globalAlpha = i % 9 === 0 ? .85 : .64;
        ctx.beginPath(); ctx.arc(x, y, i % 9 === 0 ? 2.4 : 1.5, 0, Math.PI * 2); ctx.fill();
        const next = points[(i + 1) % points.length];
        const distance = Math.hypot(next.x - point.x, next.y - point.y);
        if (distance < 47) {
          ctx.strokeStyle = cyan; ctx.globalAlpha = .13 * (1 - distance / 60); ctx.lineWidth = .8;
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(next.x, next.y); ctx.stroke();
        }
      });
      ctx.globalAlpha = 1;
    }
    function tick(time) {
      frame = 0;
      if (!canAnimate()) return;
      if (time - lastPaint >= 32) { draw(time); lastPaint = time; }
      frame = win.requestAnimationFrame(tick);
    }
    function syncMotion() {
      if (frame) win.cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
      lastPaint = 0;
      const stopped = paused();
      hero.dataset.motion = stopped ? 'paused' : 'running';
      if (motion) {
        motion.textContent = reduced?.matches ? 'Sin movimiento' : stopped ? 'Animar' : 'Pausar';
        motion.disabled = Boolean(reduced?.matches);
        motion.setAttribute('aria-pressed', String(stopped));
        motion.setAttribute('aria-label', stopped ? 'Activar movimiento del diagrama' : 'Pausar movimiento del diagrama');
      }
      if (stopped) { pointer = { x: 0, y: 0 }; hero.style.setProperty('--hero-tilt-x', '0deg'); hero.style.setProperty('--hero-tilt-y', '0deg'); }
      draw(0, true);
      if (canAnimate()) frame = win.requestAnimationFrame(tick);
    }
    function setStage(value, announce = false) {
      const next = Math.max(0, Math.min(2, Number(value)));
      if (!Number.isInteger(next)) return;
      selected = next;
      hero.dataset.stage = String(next);
      buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === next)));
      layers.forEach((layer, i) => layer.setAttribute('aria-hidden', String(i !== next)));
      if (caption) caption.textContent = CAPTIONS[next];
      if (announce && status) status.textContent = `Perspectiva ${next + 1} de 3. ${CAPTIONS[next]}`;
      if (!canAnimate()) draw(0, true);
      else if (!frame) frame = win.requestAnimationFrame(tick);
    }
    function resize() {
      if (!stage || !canvas) return;
      const bounds = stage.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      width = bounds.width; height = bounds.height;
      const ratio = Math.min(win.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
      draw(0, true);
    }
    buttons.forEach((button) => button.addEventListener('click', () => {
      manualScroll = win.scrollY;
      setStage(button.dataset.heroStep, true);
    }));
    motion?.addEventListener('click', () => {
      const global = doc.querySelector('[data-motion-toggle]');
      if (global) global.click();
      else { localPaused = !localPaused; syncMotion(); }
    });
    stage?.addEventListener('pointermove', (event) => {
      if (paused() || event.pointerType === 'touch' || !win.matchMedia?.('(pointer: fine)').matches) return;
      const rect = stage.getBoundingClientRect();
      pointer = { x: ((event.clientX - rect.left) / rect.width - .5) * 1.1, y: ((event.clientY - rect.top) / rect.height - .5) * .8 };
      hero.style.setProperty('--hero-tilt-x', `${-pointer.y * 1.4}deg`);
      hero.style.setProperty('--hero-tilt-y', `${pointer.x * 1.4}deg`);
    });
    stage?.addEventListener('pointerleave', () => {
      pointer = { x: 0, y: 0 }; hero.style.setProperty('--hero-tilt-x', '0deg'); hero.style.setProperty('--hero-tilt-y', '0deg');
    });
    win.addEventListener('scroll', () => {
      if (scrollFrame || doc.body.dataset.mode !== 'estudiar' || paused() || !inView) return;
      if (manualScroll !== null && Math.abs(win.scrollY - manualScroll) < 96) return;
      scrollFrame = win.requestAnimationFrame(() => {
        scrollFrame = 0;
        if (doc.body.dataset.mode !== 'estudiar') return;
        const box = hero.getBoundingClientRect();
        const progress = (win.innerHeight * .45 - box.top) / Math.max(box.height * .8 + win.innerHeight * .25, 1);
        setStage(Math.min(2, Math.max(0, Math.floor(progress * 3))));
      });
    }, { passive: true });
    if (typeof win.ResizeObserver === 'function') new win.ResizeObserver(resize).observe(stage);
    else win.addEventListener('resize', resize, { passive: true });
    if (typeof win.IntersectionObserver === 'function') new win.IntersectionObserver((entries) => {
      inView = entries.some((entry) => entry.isIntersecting);
      syncMotion();
    }, { rootMargin: '20px' }).observe(hero);
    reduced?.addEventListener?.('change', syncMotion);
    doc.addEventListener('visibilitychange', syncMotion);
    doc.addEventListener('expo:motion', syncMotion);
    doc.addEventListener('expo:scenechange', syncMotion);
    doc.addEventListener('expo:modechange', () => { manualScroll = win.scrollY; resize(); syncMotion(); });
    new win.MutationObserver(() => { refreshPalette(); if (!canAnimate()) draw(0, true); }).observe(doc.body, { attributes: true, attributeFilter: ['data-theme'] });
    win.addEventListener('beforeprint', () => { if (frame) win.cancelAnimationFrame(frame); frame = 0; });
    win.addEventListener('afterprint', syncMotion);
    refreshPalette(); resize(); setStage(0); syncMotion();
  });
}
