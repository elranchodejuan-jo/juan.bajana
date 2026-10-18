/** Decorative genetics field. Geometry is conceptual, never a sequence or measurement. */
const instances = new WeakMap();
const TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const noise = (i) => { const n = Math.sin(i * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n); };

/** One genetics canvas per document. Safe to call again when changing modes. */
export function initializeGeneticsAmbient(root = document) {
  const doc = root.nodeType === 9 ? root : root.ownerDocument;
  const win = doc?.defaultView;
  const body = doc?.body;
  const deck = root.matches?.('#expo-deck') ? root : root.querySelector('#expo-deck');
  if (!win || !body || !deck) return null;
  if (instances.has(doc)) return instances.get(doc);
  const receiver = () => body.dataset.receiver === 'true' || new URL(doc.location.href).searchParams.has('receiver');
  if (receiver()) return null;
  const element = doc.createElement('div');
  element.className = 'genetics-ambient';
  element.dataset.geneticsAmbient = '';
  element.setAttribute('aria-hidden', 'true');
  element.style.pointerEvents = 'none';
  const canvas = doc.createElement('canvas');
  canvas.className = 'genetics-ambient-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.pointerEvents = 'none';
  element.append(canvas);
  body.prepend(element);
  let ctx;
  try { ctx = canvas.getContext('2d'); } catch { /* CSS keeps a static composition. */ }
  element.dataset.canvas = ctx ? 'available' : 'fallback';
  const reduced = win.matchMedia?.('(prefers-reduced-motion: reduce)');
  const compact = win.matchMedia?.('(max-width: 760px)');
  const fine = win.matchMedia?.('(pointer: fine)');
  const coarse = win.matchMedia?.('(pointer: coarse)');
  const listeners = [];
  function on(target, name, callback, options) {
    target?.addEventListener?.(name, callback, options);
    listeners.push(() => target?.removeEventListener?.(name, callback, options));
  }
  let destroyed = false, printing = false, globalPaused = body.dataset.motion === 'paused';
  let frame = null, lastPaint = null, elapsed = 0, width = 1, height = 1, ratio = 1, dirty = true;
  let palette, points = [];
  const pointer = { x: .5, y: .5, tx: .5, ty: .5, force: 0, target: 0 };
  const mobile = () => Boolean(compact?.matches || coarse?.matches);
  const blocked = () => destroyed || !ctx || printing || receiver() || globalPaused || reduced?.matches || doc.hidden;
  const pointerAllowed = () => !blocked() && !mobile() && Boolean(fine?.matches);
  function pointerState() { element.dataset.pointer = !pointerAllowed() ? 'disabled' : pointer.target ? 'active' : 'idle'; }
  function resetPointer() { pointer.force = 0; pointer.target = 0; pointerState(); }
  function colors() {
    const light = body.dataset.theme === 'light';
    const style = win.getComputedStyle(element);
    palette = {
      violet: style.getPropertyValue('--genetics-violet').trim() || (light ? '#6a4cb0' : '#b09ae9'),
      teal: style.getPropertyValue('--genetics-teal').trim() || (light ? '#177b83' : '#79c4c9'),
    };
  }
  function setScene(id) {
    element.dataset.scene = id || '';
    element.dataset.emphasis = id === 'inicio' ? 'helix'
      : ['via-testicular', 'via-ovarica', 'gonada-bipotencial'].includes(id) ? 'network'
        : id === 'cromosomas-y-gametos' ? 'chromosomes' : 'quiet';
    element.dataset.density = ['temperatura', 'referencias-y-materiales', 'cruces-cromosomicos'].includes(id) ? 'minimal' : 'normal';
  }
  function measure() {
    dirty = false;
    width = Math.max(1, win.innerWidth || doc.documentElement.clientWidth || 1);
    height = Math.max(1, win.innerHeight || doc.documentElement.clientHeight || 1);
    const budget = mobile() ? 1_200_000 : 2_400_000;
    ratio = Math.min(win.devicePixelRatio || 1, 1.5, Math.sqrt(budget / (width * height)));
    canvas.width = Math.max(1, Math.floor(width * ratio));
    canvas.height = Math.max(1, Math.floor(height * ratio));
    points = Array.from({ length: mobile() ? 16 : 28 }, (_, i) => ({
      x: i % 2 ? .8 + noise(i + 1) * .17 : .03 + noise(i + 1) * .17,
      y: .07 + noise(i + 49) * .86, phase: noise(i + 89) * TAU,
    }));
  }
  function paint(delta = 0) {
    if (!ctx || destroyed || printing || doc.hidden || receiver()) return;
    if (dirty) measure();
    const time = elapsed / 1000;
    const emphasis = element.dataset.emphasis;
    const energy = element.dataset.density === 'minimal' ? .25 : emphasis === 'helix' ? .85 : .5;
    const blend = 1 - Math.exp(-delta / 200);
    pointer.x += (pointer.tx - pointer.x) * blend;
    pointer.y += (pointer.ty - pointer.y) * blend;
    pointer.force += (pointer.target - pointer.force) * blend;
    const px = pointer.x * width, py = pointer.y * height;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, width, height);
    // A pair of edge helices keeps the text column quiet. Rungs imply no actual bases.
    for (let edge = 0; edge < 2; edge++) {
      const center = width * (edge ? .91 : .09);
      const amplitude = Math.min(48, width * .06);
      const phase = time * .17 + edge * 1.3;
      const helixX = (y, strand) => {
        const nearby = Math.exp(-(((y - py) / 180) ** 2));
        return center + Math.sin(y / height * TAU * 1.65 + phase + strand * Math.PI) * amplitude
          + clamp(px - center, -70, 70) * nearby * pointer.force * .13;
      };
      for (let strand = 0; strand < 2; strand++) {
        ctx.strokeStyle = strand ? palette.teal : palette.violet;
        ctx.globalAlpha = energy * .22;
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        for (let y = -10; y <= height + 15; y += 14) {
          const x = helixX(y, strand);
          if (y === -10) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      for (let y = 28; y < height; y += mobile() ? 48 : 34) {
        ctx.globalAlpha = energy * .12;
        ctx.strokeStyle = palette.violet;
        ctx.lineWidth = .8;
        ctx.beginPath(); ctx.moveTo(helixX(y, 0), y); ctx.lineTo(helixX(y, 1), y); ctx.stroke();
      }
    }
    const plotted = points.map((p) => ({
      x: p.x * width + Math.sin(time * .13 + p.phase) * 12,
      y: p.y * height + Math.cos(time * .11 + p.phase) * 10,
    }));
    plotted.forEach((p, i) => {
      if (emphasis === 'network') {
        plotted.slice(i + 1).forEach((q) => {
          const d = Math.hypot(q.x - p.x, q.y - p.y);
          if (d > 160) return;
          ctx.globalAlpha = (1 - d / 160) * .16;
          ctx.strokeStyle = palette.teal;
          ctx.lineWidth = .8;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
        });
      }
      ctx.globalAlpha = energy * .45;
      ctx.fillStyle = i % 3 ? palette.violet : palette.teal;
      ctx.beginPath(); ctx.arc(p.x, p.y, i % 4 ? 1.4 : 2, 0, TAU); ctx.fill();
      if (emphasis === 'chromosomes' && i % 4 === 0) {
        // Two short bars with a centromere gap: no claim of a metaphase karyotype.
        ctx.strokeStyle = palette.violet; ctx.lineWidth = 2; ctx.globalAlpha = .13;
        ctx.beginPath(); ctx.moveTo(p.x + 8, p.y - 9); ctx.lineTo(p.x + 8, p.y - 2);
        ctx.moveTo(p.x + 8, p.y + 2); ctx.lineTo(p.x + 8, p.y + 13); ctx.stroke();
      }
    });
    if (pointer.force > .005) {
      const radius = Math.min(180, width * .18);
      const halo = ctx.createRadialGradient(px, py, 0, px, py, radius);
      halo.addColorStop(0, palette.violet); halo.addColorStop(.4, palette.teal); halo.addColorStop(1, 'transparent');
      ctx.fillStyle = halo; ctx.globalAlpha = pointer.force * .06;
      ctx.fillRect(px - radius, py - radius, radius * 2, radius * 2);
    }
    ctx.globalAlpha = 1;
  }
  function tick(timestamp) {
    frame = null;
    if (blocked()) return;
    if (lastPaint === null || timestamp - lastPaint >= (mobile() ? 50 : 1000 / 30)) {
      const delta = lastPaint === null ? 0 : clamp(timestamp - lastPaint, 0, 100);
      elapsed += delta; lastPaint = timestamp; paint(delta);
    }
    if (!blocked()) frame = win.requestAnimationFrame(tick);
  }
  function syncMotion() {
    if (destroyed) return;
    if (frame !== null) win.cancelAnimationFrame(frame);
    frame = null; lastPaint = null;
    element.hidden = receiver() || printing;
    element.dataset.motion = blocked() ? 'paused' : 'running';
    if (!pointerAllowed()) resetPointer(); else pointerState();
    paint();
    if (!blocked()) frame = win.requestAnimationFrame(tick);
  }
  on(win, 'pointermove', (event) => {
    if (!pointerAllowed() || event.pointerType === 'touch' || !Number.isFinite(event.clientX) || !Number.isFinite(event.clientY)) return;
    pointer.tx = clamp(event.clientX / width, 0, 1); pointer.ty = clamp(event.clientY / height, 0, 1); pointer.target = 1; pointerState();
  }, { passive: true });
  on(win, 'pointerout', (event) => { if (!event.relatedTarget) { pointer.target = 0; pointerState(); } }, { passive: true });
  on(win, 'blur', resetPointer);
  on(win, 'resize', () => { dirty = true; if (blocked()) paint(); }, { passive: true });
  on(doc, 'visibilitychange', syncMotion);
  on(doc, 'expo:motion', (event) => { globalPaused = event.detail?.paused ?? body.dataset.motion === 'paused'; syncMotion(); });
  on(doc, 'expo:scenechange', (event) => { if (typeof event.detail?.id === 'string') setScene(event.detail.id); if (blocked()) paint(); });
  on(doc, 'expo:modechange', () => { dirty = true; syncMotion(); });
  on(win, 'beforeprint', () => { printing = true; syncMotion(); });
  on(win, 'afterprint', () => { printing = false; dirty = true; syncMotion(); });
  for (const query of [reduced, compact, fine, coarse]) on(query, 'change', () => { dirty = true; syncMotion(); });
  const observer = typeof win.MutationObserver === 'function' ? new win.MutationObserver((changes) => {
    if (changes.some((change) => change.attributeName === 'data-theme')) colors();
    if (changes.some((change) => change.attributeName === 'data-motion')) globalPaused = body.dataset.motion === 'paused';
    syncMotion();
  }) : null;
  observer?.observe(body, { attributes: true, attributeFilter: ['data-theme', 'data-motion', 'data-receiver'] });
  const controller = { element, canvas, destroy() {
    if (destroyed) return;
    destroyed = true;
    if (frame !== null) win.cancelAnimationFrame(frame);
    frame = null; listeners.forEach((remove) => remove()); observer?.disconnect(); element.remove(); instances.delete(doc);
  } };
  instances.set(doc, controller);
  let hash = '';
  try { hash = decodeURIComponent(doc.location.hash.replace(/^#\/?/, '')); } catch { /* Fall back to visible or first scene. */ }
  const active = deck.querySelector('.expo-scene.present') || [...deck.querySelectorAll('.expo-scene')].find((scene) => scene.id === hash) || deck.querySelector('.expo-scene');
  setScene(active?.id); colors(); measure(); syncMotion();
  return controller;
}
