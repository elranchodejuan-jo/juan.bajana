/** Manual perspectives; an optional decorative Canvas never carries scientific information. */
const instances = new WeakMap();
const CAPTIONS = [
  'XX/XY y ZZ/ZW son modelos distintos de constitución cromosómica.',
  'Las vías testicular y ovárica requieren regulación activa; las señales actúan sobre tejidos.',
  'No hay un mecanismo universal: los sistemas varían entre grupos animales.',
];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export function initializeGeneticsHero(root = document) {
  const heroes = root.matches?.('[data-genetics-hero]') ? [root] : [...root.querySelectorAll('[data-genetics-hero]')];
  const controllers = heroes.map((hero) => {
    if (instances.has(hero)) return instances.get(hero);
    const doc = hero.ownerDocument, win = doc.defaultView;
    const stage = hero.querySelector('[data-genetics-stage]');
    const canvas = hero.querySelector('[data-genetics-canvas]');
    const layers = [...hero.querySelectorAll('[data-genetics-layer]')];
    const buttons = [...hero.querySelectorAll('[data-genetics-step]')];
    const motion = hero.querySelector('[data-genetics-motion]');
    const caption = hero.querySelector('[data-genetics-caption]');
    const status = hero.querySelector('[data-genetics-status]');
    const reduced = win.matchMedia?.('(prefers-reduced-motion: reduce)');
    const compact = win.matchMedia?.('(max-width: 760px)');
    const receiver = () => doc.body.dataset.receiver === 'true' || new URL(doc.location.href).searchParams.has('receiver');
    let ctx;
    try { ctx = canvas?.getContext('2d'); } catch { /* All figures and captions remain in the SVG. */ }
    hero.dataset.canvas = ctx ? 'available' : 'fallback';
    let selected = 0, frame = null, lastPaint = null, elapsed = 0;
    let width = 900, height = 390, ratio = 1, inView = true;
    let localPaused = false, globalPaused = doc.body.dataset.motion === 'paused', destroyed = false, printing = false;
    let color = '#b09ae9';
    const listeners = [];
    function on(target, name, callback, options) {
      target?.addEventListener?.(name, callback, options);
      listeners.push(() => target?.removeEventListener?.(name, callback, options));
    }
    const paused = () => localPaused || globalPaused || reduced?.matches;
    function visibleScene() {
      const scene = hero.closest('.expo-scene');
      return doc.body.dataset.mode !== 'presentar' || !scene || scene.classList.contains('present');
    }
    const runnable = () => !destroyed && ctx && !paused() && !printing && !doc.hidden && !receiver() && inView && visibleScene();
    function draw() {
      if (!ctx || destroyed || printing || doc.hidden || receiver()) return;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const scale = Math.min(width / 900, height / 390);
      ctx.translate((width - 900 * scale) / 2, (height - 390 * scale) / 2);
      ctx.scale(scale, scale);
      ctx.fillStyle = color;
      // Sixteen slow points stay on the perimeter, away from labels and causal links.
      const count = compact?.matches ? 10 : 16;
      for (let i = 0; i < count; i++) {
        const angle = i / count * Math.PI * 2 + elapsed * .000018;
        const x = 450 + Math.cos(angle) * 350, y = 195 + Math.sin(angle) * 166;
        ctx.globalAlpha = .18 + (i % 3) * .1;
        ctx.beginPath(); ctx.arc(x, y, i % 3 ? 1.5 : 2.2, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    function resize() {
      if (!stage || !canvas || destroyed) return;
      const bounds = stage.getBoundingClientRect();
      width = bounds.width || 900; height = bounds.height || 390;
      ratio = Math.min(win.devicePixelRatio || 1, 1.5, Math.sqrt(700_000 / (width * height)));
      canvas.width = Math.max(1, Math.floor(width * ratio)); canvas.height = Math.max(1, Math.floor(height * ratio));
      draw();
    }
    function tick(timestamp) {
      frame = null;
      if (!runnable()) return;
      if (lastPaint === null || timestamp - lastPaint >= (compact?.matches ? 50 : 1000 / 30)) {
        elapsed += lastPaint === null ? 0 : clamp(timestamp - lastPaint, 0, 100);
        lastPaint = timestamp; draw();
      }
      if (runnable()) frame = win.requestAnimationFrame(tick);
    }
    function syncMotion() {
      if (destroyed) return;
      if (frame !== null) win.cancelAnimationFrame(frame);
      frame = null; lastPaint = null;
      hero.dataset.motion = runnable() ? 'running' : 'paused';
      if (motion) {
        const unavailable = !ctx || Boolean(reduced?.matches) || receiver();
        motion.disabled = unavailable;
        motion.textContent = unavailable ? 'Estático' : paused() ? 'Animar' : 'Pausar';
        motion.setAttribute('aria-pressed', String(paused() || unavailable));
        motion.setAttribute('aria-label', unavailable ? 'Portada estática' : paused() ? 'Activar movimiento decorativo de la portada' : 'Pausar movimiento decorativo de la portada');
      }
      draw();
      if (runnable()) frame = win.requestAnimationFrame(tick);
    }
    function setStage(value, announce = false) {
      const next = Number(value);
      if (!Number.isInteger(next) || next < 0 || next >= CAPTIONS.length) return;
      selected = next; hero.dataset.stage = String(next);
      buttons.forEach((button) => button.setAttribute('aria-pressed', String(Number(button.dataset.geneticsStep) === next)));
      layers.forEach((layer) => layer.setAttribute('aria-hidden', String(Number(layer.dataset.geneticsLayer) !== next)));
      if (caption) caption.textContent = CAPTIONS[next];
      if (announce && status) status.textContent = `Perspectiva ${next + 1} de 3. ${CAPTIONS[next]}`;
    }
    buttons.forEach((button) => on(button, 'click', () => setStage(button.dataset.geneticsStep, true)));
    // Native buttons already support Enter/Space. Arrows additionally move within the three choices.
    buttons.forEach((button, index) => on(button, 'keydown', (event) => {
      const next = event.key === 'ArrowRight' ? (index + 1) % buttons.length
        : event.key === 'ArrowLeft' ? (index + buttons.length - 1) % buttons.length
          : event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : null;
      if (next === null) return;
      event.preventDefault(); event.stopPropagation(); buttons[next].focus(); setStage(buttons[next].dataset.geneticsStep, true);
    }));
    on(motion, 'click', () => {
      const global = doc.querySelector('[data-motion-toggle]');
      if (global) global.click(); else { localPaused = !localPaused; syncMotion(); }
    });
    on(doc, 'expo:motion', (event) => { globalPaused = event.detail?.paused ?? doc.body.dataset.motion === 'paused'; syncMotion(); });
    on(doc, 'expo:scenechange', syncMotion);
    on(doc, 'expo:modechange', () => { resize(); syncMotion(); });
    on(doc, 'visibilitychange', syncMotion);
    on(win, 'beforeprint', () => { printing = true; syncMotion(); });
    on(win, 'afterprint', () => { printing = false; resize(); syncMotion(); });
    on(reduced, 'change', syncMotion); on(compact, 'change', () => { resize(); syncMotion(); });
    const resizeObserver = typeof win.ResizeObserver === 'function' ? new win.ResizeObserver(resize) : null;
    if (resizeObserver && stage) resizeObserver.observe(stage); else on(win, 'resize', resize, { passive: true });
    const intersection = typeof win.IntersectionObserver === 'function' ? new win.IntersectionObserver((entries) => {
      inView = entries.some((entry) => entry.isIntersecting); syncMotion();
    }, { rootMargin: '30px' }) : null;
    intersection?.observe(hero);
    function colors() { color = win.getComputedStyle(hero).getPropertyValue('--genetics-violet').trim() || (doc.body.dataset.theme === 'light' ? '#6a4cb0' : '#b09ae9'); }
    const observer = typeof win.MutationObserver === 'function' ? new win.MutationObserver(() => {
      colors(); globalPaused = doc.body.dataset.motion === 'paused'; syncMotion();
    }) : null;
    observer?.observe(doc.body, { attributes: true, attributeFilter: ['data-theme', 'data-motion', 'data-receiver'] });
    const controller = { element: hero, canvas, setStage, get selected() { return selected; }, destroy() {
      if (destroyed) return;
      destroyed = true;
      if (frame !== null) win.cancelAnimationFrame(frame);
      frame = null; listeners.forEach((remove) => remove()); observer?.disconnect(); resizeObserver?.disconnect(); intersection?.disconnect();
      hero.dataset.motion = 'paused'; instances.delete(hero);
    } };
    instances.set(hero, controller);
    colors(); resize(); setStage(Number(hero.dataset.stage) || 0); syncMotion();
    return controller;
  });
  return { controllers, destroy() { controllers.forEach((controller) => controller.destroy()); } };
}
