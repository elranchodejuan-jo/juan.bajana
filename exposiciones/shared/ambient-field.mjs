/** Original decorative field. These slow waves are visual rhythms, not clinical traces. */
const instances = new WeakMap();
const TAU = Math.PI * 2;
const FRAME_INTERVAL = 1000 / 30;
const PIXEL_BUDGET = 3_200_000;
const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));
const seed = (index) => {
  const value = Math.sin(index * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
};

/** One viewport-sized canvas per document; all listeners and drawing stop on destroy. */
export function initializeAmbient(root = document) {
  const doc = root.nodeType === 9 ? root : root.ownerDocument;
  const win = doc?.defaultView;
  const body = doc?.body;
  const deck = root.matches?.('#expo-deck') ? root : root.querySelector('#expo-deck');
  if (!win || !body || !deck) return null;
  if (instances.has(doc)) return instances.get(doc);
  const receiver = () => body.dataset.receiver === 'true' || new URL(doc.location.href).searchParams.has('receiver');
  if (receiver()) return null;

  const element = doc.createElement('div');
  element.className = 'expo-ambient';
  element.dataset.ambient = '';
  element.setAttribute('aria-hidden', 'true');
  element.style.pointerEvents = 'none';
  const canvas = doc.createElement('canvas');
  canvas.className = 'expo-ambient-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.pointerEvents = 'none';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  element.append(canvas);
  body.prepend(element);

  let ctx;
  try { ctx = canvas.getContext('2d'); } catch { /* The CSS composition remains visible. */ }
  const reduced = win.matchMedia?.('(prefers-reduced-motion: reduce)');
  const compact = win.matchMedia?.('(max-width: 760px)');
  const coarse = win.matchMedia?.('(pointer: coarse)');
  const fine = win.matchMedia?.('(pointer: fine)');
  const listeners = [];
  function on(target, name, handler, options) {
    target?.addEventListener?.(name, handler, options);
    listeners.push(() => target?.removeEventListener?.(name, handler, options));
  }

  let destroyed = false;
  let printing = false;
  let globalPaused = body.dataset.motion === 'paused';
  let frame = null;
  let lastPaint = null;
  let elapsed = 0;
  let width = 1;
  let height = 1;
  let ratio = 1;
  let needsMeasure = true;
  let points = [];
  let palette;
  const pointer = { x: .5, y: .5, targetX: .5, targetY: .5, strength: 0, targetStrength: 0 };

  function mobile() { return Boolean(compact?.matches || coarse?.matches); }
  function blocked() {
    return destroyed || !ctx || globalPaused || reduced?.matches || doc.hidden || printing || receiver();
  }
  function pointerAllowed() { return !blocked() && !mobile() && Boolean(fine?.matches); }
  function pointerState() {
    element.dataset.pointer = !pointerAllowed() ? 'disabled' : pointer.targetStrength ? 'active' : 'idle';
  }
  function resetPointer() {
    pointer.targetStrength = 0;
    pointer.strength = 0;
    pointerState();
  }
  function refreshPalette() {
    const style = win.getComputedStyle(element);
    const light = body.dataset.theme === 'light';
    palette = {
      cyan: style.getPropertyValue('--ambient-cyan').trim() || (light ? '#1b758c' : '#62cfe3'),
      teal: style.getPropertyValue('--ambient-teal').trim() || (light ? '#218874' : '#4ebdad'),
      copper: style.getPropertyValue('--ambient-copper').trim() || (light ? '#a9633d' : '#d7a079'),
    };
  }
  function setScene(id) {
    element.dataset.scene = id || '';
    element.dataset.emphasis = id === 'inicio' ? 'hero' : id === 'regulacion-pulmonar' ? 'breathing' : 'quiet';
  }
  function sceneFromPage() {
    const present = deck.querySelector('.expo-scene.present');
    if (present) return present.id;
    let id = '';
    try { id = decodeURIComponent(doc.location.hash.replace(/^#\/?/, '')); } catch { /* Invalid hashes use the first scene. */ }
    return [...deck.querySelectorAll('.expo-scene')].find((scene) => scene.id === id)?.id || deck.querySelector('.expo-scene')?.id || '';
  }
  function measure() {
    needsMeasure = false;
    const nextWidth = Math.max(1, win.innerWidth || doc.documentElement.clientWidth || 1);
    const nextHeight = Math.max(1, win.innerHeight || doc.documentElement.clientHeight || 1);
    const nextRatio = Math.min(win.devicePixelRatio || 1, 1.5, Math.sqrt(PIXEL_BUDGET / (nextWidth * nextHeight)));
    const count = mobile() ? 24 : Math.min(50, Math.max(32, Math.round(nextWidth / 30)));
    if (width === nextWidth && height === nextHeight && ratio === nextRatio && points.length === count) return;
    width = nextWidth; height = nextHeight; ratio = nextRatio;
    canvas.width = Math.max(1, Math.floor(width * ratio));
    canvas.height = Math.max(1, Math.floor(height * ratio));
    // Alternate edge zones. Their slow drift leaves the middle of each scene quieter.
    points = Array.from({ length: count }, (_, i) => {
      const a = seed(i + 1); const b = seed(i + 53);
      const zone = i % 4;
      return {
        x: zone === 0 ? .025 + a * .19 : zone === 1 ? .785 + a * .19 : a,
        y: zone === 2 ? .1 + b * .16 : zone === 3 ? .77 + b * .18 : .09 + b * .82,
        phase: seed(i + 109) * TAU,
        radius: i % 7 === 0 ? 2.1 : 1.15,
        accent: i % 11 === 0,
      };
    });
  }

  function draw(delta = 0) {
    if (!ctx || destroyed || printing || doc.hidden || receiver()) return;
    if (needsMeasure) measure();
    const emphasis = element.dataset.emphasis;
    const energy = emphasis === 'hero' ? 1 : emphasis === 'breathing' ? .94 : .52;
    const time = elapsed / 1000;
    const breath = time * TAU / 8;
    const blend = 1 - Math.exp(-delta / 190);
    pointer.x += (pointer.targetX - pointer.x) * blend;
    pointer.y += (pointer.targetY - pointer.y) * blend;
    pointer.strength += (pointer.targetStrength - pointer.strength) * blend;
    const pointerX = pointer.x * width;
    const pointerY = pointer.y * height;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, width, height);

    // Paired ribbons gently expand and release. No spikes, axes or implied measurements.
    const amplitude = Math.min(height * .06, 54) * energy * (.83 + Math.sin(breath) * .17);
    for (let band = 0; band < 2; band++) {
      const baseline = height * (band === 0 ? .2 : .83);
      for (let strand = 0; strand < 4; strand++) {
        ctx.strokeStyle = strand % 2 ? palette.teal : palette.cyan;
        ctx.globalAlpha = (.09 + strand * .025) * energy;
        ctx.lineWidth = strand === 2 ? 1.5 : .8;
        ctx.beginPath();
        for (let x = -24; x <= width + 24; x += 24) {
          const wave = Math.sin(x / width * TAU * 1.35 + breath * .62 + band * 1.8 + strand * .19);
          const slow = Math.sin(x / width * TAU * .6 - breath * .31 + strand * .4);
          const falloff = Math.exp(-Math.pow((x - pointerX) / 200, 2));
          const pull = clamp(pointerY - baseline, -90, 90) * .11 * falloff * pointer.strength;
          const y = baseline + wave * amplitude + slow * amplitude * .35 + (strand - 1.5) * 6 + pull;
          if (x === -24) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    }

    const drift = 10 + energy * 13;
    const plotted = points.map((point) => {
      let x = point.x * width + Math.sin(time * .19 + point.phase) * drift;
      let y = point.y * height + Math.cos(time * .16 + point.phase * 1.3) * drift;
      const distance = Math.hypot(x - pointerX, y - pointerY);
      const pull = Math.max(0, 1 - distance / 230) * pointer.strength * .13;
      x += (pointerX - x) * pull; y += (pointerY - y) * pull;
      return { ...point, x, y, near: Math.max(0, 1 - distance / 200) * pointer.strength };
    });
    const connection = Math.min(215, Math.max(130, width * .155));
    for (let i = 0; i < plotted.length; i++) {
      const point = plotted[i];
      for (let j = i + 1; j < plotted.length; j++) {
        const next = plotted[j];
        const distance = Math.hypot(next.x - point.x, next.y - point.y);
        if (distance >= connection) continue;
        ctx.strokeStyle = (i + j) % 3 === 0 ? palette.teal : palette.cyan;
        ctx.globalAlpha = (1 - distance / connection) * (.21 * energy + point.near * .17);
        ctx.lineWidth = .75;
        ctx.beginPath(); ctx.moveTo(point.x, point.y); ctx.lineTo(next.x, next.y); ctx.stroke();
      }
      const shimmer = .83 + Math.sin(time * .72 + point.phase) * .17;
      ctx.fillStyle = point.accent ? palette.copper : palette.cyan;
      ctx.globalAlpha = (.36 + energy * .3 + point.near * .2) * shimmer;
      ctx.beginPath(); ctx.arc(point.x, point.y, point.radius + point.near, 0, TAU); ctx.fill();
    }

    if (pointer.strength > .005) {
      const radius = Math.min(180, width * .18);
      const halo = ctx.createRadialGradient(pointerX, pointerY, 0, pointerX, pointerY, radius);
      halo.addColorStop(0, palette.cyan); halo.addColorStop(.32, palette.teal); halo.addColorStop(1, 'transparent');
      ctx.fillStyle = halo;
      ctx.globalAlpha = pointer.strength * (.055 + energy * .035);
      ctx.fillRect(pointerX - radius, pointerY - radius, radius * 2, radius * 2);
    }
    ctx.globalAlpha = 1;
  }

  function tick(timestamp) {
    frame = null;
    if (blocked()) return;
    if (lastPaint === null || timestamp - lastPaint >= (mobile() ? 50 : FRAME_INTERVAL)) {
      const delta = lastPaint === null ? 0 : clamp(timestamp - lastPaint, 0, 100);
      elapsed += delta;
      lastPaint = timestamp;
      draw(delta);
    }
    if (!blocked()) frame = win.requestAnimationFrame(tick);
  }
  function syncMotion() {
    if (destroyed) return;
    if (frame !== null) win.cancelAnimationFrame(frame);
    frame = null;
    lastPaint = null;
    const paused = blocked();
    element.hidden = receiver();
    element.dataset.motion = paused ? 'paused' : 'running';
    if (!pointerAllowed()) resetPointer(); else pointerState();
    draw();
    if (!paused) frame = win.requestAnimationFrame(tick);
  }
  function resize() {
    needsMeasure = true;
    // Active resizing is coalesced into the existing, capped rendering loop.
    if (blocked()) draw();
  }

  on(win, 'pointermove', (event) => {
    if (!pointerAllowed() || event.pointerType === 'touch') return;
    if (!Number.isFinite(event.clientX) || !Number.isFinite(event.clientY)) return;
    pointer.targetX = clamp(event.clientX / width, 0, 1);
    pointer.targetY = clamp(event.clientY / height, 0, 1);
    pointer.targetStrength = 1;
    pointerState();
  }, { passive: true });
  on(win, 'pointerout', (event) => {
    if (event.relatedTarget) return;
    pointer.targetStrength = 0; pointerState();
  }, { passive: true });
  on(win, 'blur', resetPointer);
  on(win, 'resize', resize, { passive: true });
  on(doc, 'visibilitychange', syncMotion);
  on(doc, 'expo:motion', (event) => { globalPaused = event.detail?.paused === true; syncMotion(); });
  on(doc, 'expo:scenechange', (event) => {
    if (typeof event.detail?.id === 'string') setScene(event.detail.id);
    if (blocked()) draw();
  });
  on(doc, 'expo:modechange', (event) => {
    element.dataset.mode = event.detail?.mode || body.dataset.mode || 'estudiar';
    needsMeasure = true;
    syncMotion();
  });
  on(win, 'beforeprint', () => { printing = true; syncMotion(); });
  on(win, 'afterprint', () => { printing = false; needsMeasure = true; syncMotion(); });
  for (const query of [reduced, compact, coarse, fine]) {
    on(query, 'change', () => { needsMeasure = true; syncMotion(); });
  }
  const observer = typeof win.MutationObserver === 'function' ? new win.MutationObserver((changes) => {
    if (destroyed) return;
    if (changes.some((change) => change.attributeName === 'data-theme')) refreshPalette();
    if (changes.some((change) => change.attributeName === 'data-motion')) globalPaused = body.dataset.motion === 'paused';
    syncMotion();
  }) : null;
  observer?.observe(body, { attributes: true, attributeFilter: ['data-theme', 'data-motion', 'data-receiver'] });

  const controller = {
    element,
    canvas,
    destroy() {
      if (destroyed) return;
      destroyed = true;
      if (frame !== null) win.cancelAnimationFrame(frame);
      frame = null;
      listeners.forEach((remove) => remove());
      observer?.disconnect();
      element.remove();
      instances.delete(doc);
    },
  };
  instances.set(doc, controller);
  element.dataset.mode = body.dataset.mode || 'estudiar';
  setScene(sceneFromPage());
  refreshPalette();
  measure();
  syncMotion();
  return controller;
}
