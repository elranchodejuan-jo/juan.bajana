/** Behavioral checks for the new genetics visual strategy; Canvas is a lifecycle stub. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { initializeGeneticsAmbient } from '../exposiciones/shared/ambient-genetics.mjs';
import { initializeGeneticsHero } from '../exposiciones/shared/genetics-hero.mjs';

const heroMarkup = `<div data-genetics-hero data-stage="0"><div data-genetics-stage>
<svg role="img"><g data-genetics-layer="0"></g><g data-genetics-layer="1"></g><g data-genetics-layer="2"></g></svg>
<canvas data-genetics-canvas aria-hidden="true"></canvas></div><div role="group">
<button data-genetics-step="0">Cromosomas</button><button data-genetics-step="1">Desarrollo</button><button data-genetics-step="2">Diversidad</button></div>
<button data-genetics-motion>Pausar</button><p data-genetics-caption></p><p data-genetics-status role="status"></p></div>`;
function environment({ context = true, reduced = false, mobile = false, fine = true, receiver = false, query = '', surface = true, hero = false } = {}) {
  const dom = new JSDOM(`<body data-mode="estudiar" data-subject="genetica" data-motion="running"${receiver ? ' data-receiver="true"' : ''}>
${surface ? `<main id="expo-deck"><section id="inicio" class="expo-scene present">${hero ? heroMarkup : ''}</section><section id="via-ovarica" class="expo-scene"></section></main>` : '<main>Catálogo</main>'}</body>`,
  { url: `https://vetjb.example/exposiciones/genetica/cromosomas-y-determinacion-sexual/${query}#inicio`, pretendToBeVisual: true });
  const win = dom.window, doc = win.document, frames = new Map(), media = new Map();
  let next = 0, hidden = false, paints = 0, halos = 0;
  const noop = () => {};
  const ctx = new Proxy({ clearRect() { paints++; }, createRadialGradient() { halos++; return { addColorStop: noop }; } }, { get: (target, key) => key in target ? target[key] : noop });
  win.HTMLCanvasElement.prototype.getContext = () => context ? ctx : null;
  win.requestAnimationFrame = (callback) => { const id = ++next; frames.set(id, callback); return id; };
  win.cancelAnimationFrame = (id) => frames.delete(id);
  Object.defineProperty(doc, 'hidden', { configurable: true, get: () => hidden });
  win.matchMedia = (q) => {
    if (!media.has(q)) {
      const item = new win.EventTarget();
      item.matches = q.includes('prefers-reduced-motion') ? reduced : q.includes('pointer: coarse') ? !fine : q.includes('pointer: fine') ? fine : q.includes('max-width') ? mobile : false;
      media.set(q, item);
    }
    return media.get(q);
  };
  function emit(name, detail) { doc.dispatchEvent(new win.CustomEvent(name, { detail })); }
  return { doc, win, frames, emit, paints: () => paints, halos: () => halos,
    frame(timestamp) { for (const [id, callback] of [...frames]) if (frames.delete(id)) callback(timestamp); },
    hidden(value) { hidden = value; emit('visibilitychange'); },
    media(q, value) { const item = [...media].find(([key]) => key.includes(q))?.[1]; assert.ok(item); item.matches = value; item.dispatchEvent(new win.Event('change')); },
    motion(paused) { doc.body.dataset.motion = paused ? 'paused' : 'running'; emit('expo:motion', { paused }); },
    pointer(type = 'mouse') { const event = new win.MouseEvent('pointermove', { clientX: 150, clientY: 160, cancelable: true }); Object.defineProperty(event, 'pointerType', { value: type }); win.dispatchEvent(event); assert.equal(event.defaultPrevented, false); },
    close(...controllers) { controllers.forEach((c) => c?.destroy()); win.close(); },
  };
}

test('genetics ambient skips catalogue and receiver; one instance survives modes and scene strategies', () => {
  for (const options of [{ surface: false }, { receiver: true }, { query: '?receiver=1' }]) {
    const env = environment(options);
    try { assert.equal(initializeGeneticsAmbient(env.doc), null); assert.equal(env.frames.size, 0); } finally { env.close(); }
  }
  const env = environment(); const c = initializeGeneticsAmbient(env.doc);
  try {
    assert.equal(initializeGeneticsAmbient(env.doc), c);
    assert.equal(c.element.getAttribute('aria-hidden'), 'true');
    for (const [id, emphasis] of [['via-ovarica', 'network'], ['cromosomas-y-gametos', 'chromosomes'], ['temperatura', 'quiet'], ['inicio', 'helix']]) {
      env.emit('expo:scenechange', { id }); env.emit('expo:modechange', { mode: 'presentar' });
      assert.equal(c.element.dataset.emphasis, emphasis); assert.equal(c.element.dataset.scene, id);
      assert.equal(env.doc.querySelectorAll('[data-genetics-ambient] canvas').length, 1); assert.equal(env.frames.size, 1);
    }
  } finally { env.close(c); }
});

test('ambient global pause, hidden document, print, receiver and reduced motion stop loops without overriding pause', async () => {
  const env = environment(); const c = initializeGeneticsAmbient(env.doc);
  try {
    env.motion(true); await Promise.resolve(); assert.equal(env.frames.size, 0);
    env.win.dispatchEvent(new env.win.Event('beforeprint')); env.win.dispatchEvent(new env.win.Event('afterprint'));
    assert.equal(env.frames.size, 0);
    env.motion(false); await Promise.resolve(); assert.equal(env.frames.size, 1);
    env.hidden(true); assert.equal(env.frames.size, 0); const hiddenPaints = env.paints(); env.frame(100); assert.equal(env.paints(), hiddenPaints);
    env.hidden(false); assert.equal(env.frames.size, 1);
    env.media('prefers-reduced-motion', true); assert.equal(env.frames.size, 0);
    env.motion(false); await Promise.resolve(); assert.equal(env.frames.size, 0);
    env.media('prefers-reduced-motion', false); assert.equal(env.frames.size, 1);
    env.doc.body.dataset.receiver = 'true'; await Promise.resolve(); assert.equal(env.frames.size, 0); assert.equal(c.element.hidden, true);
  } finally { env.close(c); }
});

test('ambient pointer is fine-only, clears coarse residue and remains within frame/pixel budgets', () => {
  for (const mobile of [false, true]) {
    const env = environment({ mobile, fine: !mobile }); const c = initializeGeneticsAmbient(env.doc);
    try {
      env.pointer('touch'); assert.notEqual(c.element.dataset.pointer, 'active');
      env.pointer(); assert.equal(c.element.dataset.pointer === 'active', !mobile);
      const before = env.paints(); for (let time = 0; time <= 1000; time += 10) env.frame(time);
      assert.ok(env.paints() - before <= (mobile ? 21 : 31)); assert.equal(env.frames.size, 1);
      assert.ok(c.canvas.width * c.canvas.height <= (mobile ? 1_200_000 : 2_400_000));
      if (!mobile) {
        assert.ok(env.halos() > 0); const halos = env.halos();
        env.media('pointer: coarse', true); env.frame(1100); env.frame(1200);
        assert.equal(c.element.dataset.pointer, 'disabled'); assert.equal(env.halos(), halos);
      }
    } finally { env.close(c); }
  }
});

test('ambient no-Canvas fallback and destruction do not leave listeners or orphan animation loops', async () => {
  const env = environment({ context: false }); let c = initializeGeneticsAmbient(env.doc);
  try {
    assert.equal(c.element.dataset.canvas, 'fallback'); assert.equal(env.frames.size, 0);
    const old = c; c.destroy(); c = initializeGeneticsAmbient(env.doc); assert.notEqual(c, old);
    c.destroy(); env.motion(false); env.win.dispatchEvent(new env.win.Event('afterprint')); await Promise.resolve();
    assert.equal(env.frames.size, 0); assert.equal(env.doc.querySelectorAll('[data-genetics-ambient]').length, 0);
  } finally { env.close(c); }
});

test('hero manual controls, keyboard, ARIA and selection persist through mode changes without duplicate instances', () => {
  const env = environment({ hero: true }); const group = initializeGeneticsHero(env.doc), c = group.controllers[0];
  try {
    assert.equal(initializeGeneticsHero(env.doc).controllers[0], c); assert.equal(env.frames.size, 1);
    const buttons = [...env.doc.querySelectorAll('[data-genetics-step]')];
    buttons[1].click(); assert.equal(c.selected, 1); assert.equal(buttons[1].getAttribute('aria-pressed'), 'true');
    assert.match(env.doc.querySelector('[data-genetics-caption]').textContent, /regulación activa/);
    const event = new env.win.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true });
    buttons[1].dispatchEvent(event); assert.equal(c.selected, 2); assert.equal(env.doc.activeElement, buttons[2]); assert.equal(event.defaultPrevented, true);
    assert.equal(env.doc.querySelector('[data-genetics-layer="2"]').getAttribute('aria-hidden'), 'false');
    env.doc.body.dataset.mode = 'presentar'; env.emit('expo:modechange'); assert.equal(c.selected, 2); assert.equal(env.frames.size, 1);
    env.doc.querySelector('#inicio').classList.remove('present'); env.emit('expo:scenechange'); assert.equal(env.frames.size, 0);
    env.doc.body.dataset.mode = 'estudiar'; env.emit('expo:modechange'); assert.equal(c.selected, 2); assert.equal(env.frames.size, 1);
    c.setStage(NaN); c.setStage(999); assert.equal(c.selected, 2);
  } finally { env.close(group); }
});

test('hero fallbacks remain interactive for no Canvas, reduced motion and receiver; no loops are started', () => {
  for (const options of [{ context: false }, { reduced: true }, { receiver: true }, { query: '?receiver=1' }]) {
    const env = environment({ hero: true, ...options }); const group = initializeGeneticsHero(env.doc);
    try {
      assert.equal(env.frames.size, 0); assert.ok(env.doc.querySelector('svg[role="img"]'));
      env.doc.querySelector('[data-genetics-step="2"]').click(); assert.equal(group.controllers[0].selected, 2);
      assert.equal(env.doc.querySelector('[data-genetics-motion]').disabled, true);
      env.emit('expo:motion', { paused: false }); assert.equal(env.frames.size, 0);
    } finally { env.close(group); }
  }
});

test('hero cancellation respects hidden, print and global pause; destroy and reinitialize preserve static perspective', async () => {
  const env = environment({ hero: true }); let group = initializeGeneticsHero(env.doc);
  try {
    group.controllers[0].setStage(1); env.motion(true); await Promise.resolve(); assert.equal(env.frames.size, 0);
    env.win.dispatchEvent(new env.win.Event('beforeprint')); env.win.dispatchEvent(new env.win.Event('afterprint')); assert.equal(env.frames.size, 0);
    env.motion(false); await Promise.resolve(); assert.equal(env.frames.size, 1);
    env.hidden(true); assert.equal(env.frames.size, 0); env.hidden(false); assert.equal(env.frames.size, 1);
    group.destroy(); assert.equal(env.frames.size, 0);
    env.motion(false); env.win.dispatchEvent(new env.win.Event('afterprint')); await Promise.resolve(); assert.equal(env.frames.size, 0);
    group = initializeGeneticsHero(env.doc); assert.equal(group.controllers[0].selected, 1); assert.equal(env.frames.size, 1);
    env.doc.querySelector('[data-genetics-motion]').click(); assert.equal(env.frames.size, 0);
    env.doc.querySelector('[data-genetics-motion]').click(); assert.equal(env.frames.size, 1);
  } finally { env.close(group); }
});
