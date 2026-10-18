/** Lifecycle checks with a Canvas stub, not visual/browser rendering tests. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { initializeAmbient } from '../exposiciones/shared/ambient-field.mjs';

function environment({ surface = true, receiver = false, query = '', reduced = false, fine = true, mobile = false, context = true } = {}) {
  const dom = new JSDOM(`<body data-mode="estudiar" data-motion="running"${receiver ? ' data-receiver="true"' : ''}>
    ${surface ? '<main id="expo-deck"><section id="inicio" class="expo-scene present"></section><section id="regulacion-pulmonar" class="expo-scene"></section><input id="retained-value" value="73"></main>' : '<main>Catálogo</main>'}
  </body>`, { url: `https://vetjb.example/exposiciones/fisiopatologia/equilibrio-acido-base/${query}#inicio`, pretendToBeVisual: true });
  const win = dom.window;
  const doc = win.document;
  const frames = new Map();
  let nextFrame = 0;
  let hidden = false;
  let paints = 0;
  let pointerHalos = 0;
  let contextAvailable = context;
  const noop = () => {};
  const ctx = new Proxy({
    clearRect() { paints++; },
    createLinearGradient: () => ({ addColorStop: noop }),
    createRadialGradient() { pointerHalos++; return { addColorStop: noop }; },
  }, { get(target, key) { return key in target ? target[key] : noop; } });
  win.HTMLCanvasElement.prototype.getContext = () => contextAvailable ? ctx : null;
  win.requestAnimationFrame = (callback) => { const id = ++nextFrame; frames.set(id, callback); return id; };
  win.cancelAnimationFrame = (id) => { frames.delete(id); };
  Object.defineProperty(doc, 'hidden', { configurable: true, get: () => hidden });
  Object.defineProperty(doc, 'visibilityState', { configurable: true, get: () => hidden ? 'hidden' : 'visible' });
  const media = new Map();
  win.matchMedia = (queryText) => {
    if (!media.has(queryText)) {
      const item = new win.EventTarget();
      item.media = queryText;
      item.matches = queryText.includes('prefers-reduced-motion') ? reduced
        : /pointer\s*:\s*fine/.test(queryText) ? fine
          : /pointer\s*:\s*coarse/.test(queryText) ? !fine
            : /max-width\s*:\s*760px/.test(queryText) ? mobile : false;
      media.set(queryText, item);
    }
    return media.get(queryText);
  };
  const emit = (name, detail) => doc.dispatchEvent(new win.CustomEvent(name, { detail }));
  function motion(paused) {
    doc.body.dataset.motion = paused ? 'paused' : 'running';
    emit('expo:motion', { paused });
  }
  function pointer(type = 'mouse') {
    const event = new win.MouseEvent('pointermove', { bubbles: true, cancelable: true, clientX: 310, clientY: 180 });
    Object.defineProperty(event, 'pointerType', { value: type });
    win.dispatchEvent(event);
    assert.equal(event.defaultPrevented, false, 'The decorative layer must not consume navigation input.');
  }
  function setMedia(fragment, matches) {
    const item = [...media.values()].find((candidate) => candidate.media.includes(fragment));
    assert.ok(item, `A media query must exist for ${fragment}.`);
    item.matches = matches;
    item.dispatchEvent(new win.Event('change'));
  }
  function frame(time) {
    const batch = [...frames.entries()];
    for (const [id, callback] of batch) {
      if (!frames.delete(id)) continue;
      callback(time);
    }
    assert.ok(frames.size <= 1, 'Only one ambient animation loop may be pending.');
  }
  return {
    win, doc, emit, motion, pointer, setMedia, frame, frames,
    paints: () => paints,
    pointerHalos: () => pointerHalos,
    setContext(value) { contextAvailable = value; },
    setHidden(value) { hidden = value; doc.dispatchEvent(new win.Event('visibilitychange')); },
    close(controller) { controller?.destroy(); win.close(); },
  };
}

test('ambient does not initialize on catalogue pages or receiver surfaces', () => {
  for (const options of [{ surface: false }, { receiver: true }, { query: '?receiver=1' }, { query: '?receiver=0' }]) {
    const env = environment(options);
    try {
      assert.equal(initializeAmbient(env.doc), null);
      assert.equal(env.doc.querySelectorAll('[data-ambient]').length, 0);
      assert.equal(env.frames.size, 0);
    } finally { env.close(); }
  }
});

test('ambient is idempotent and survives mode/scene navigation without duplicating canvas or losing controls', () => {
  const env = environment();
  let controller;
  try {
    controller = initializeAmbient(env.doc);
    assert.ok(controller?.canvas);
    assert.equal(initializeAmbient(env.doc), controller);
    assert.equal(controller.element.getAttribute('aria-hidden'), 'true');
    assert.equal(env.frames.size, 1);
    const retained = env.doc.querySelector('#retained-value');
    retained.value = '91';
    for (const [mode, id] of [['presentar', 'regulacion-pulmonar'], ['presentar', 'otra-escena'], ['estudiar', 'inicio']]) {
      env.doc.body.dataset.mode = mode;
      env.emit('expo:modechange', { mode });
      env.emit('expo:scenechange', { id });
      assert.equal(initializeAmbient(env.doc), controller);
      assert.equal(env.doc.querySelectorAll('[data-ambient] canvas').length, 1);
      assert.equal(controller.element.dataset.scene, id);
      assert.equal(env.frames.size, 1);
      env.frame(80);
      assert.equal(retained.value, '91');
    }
  } finally { env.close(controller); }
});

test('global pause cancels animation and pointer response; resume schedules exactly one loop', async () => {
  const env = environment();
  let controller;
  try {
    controller = initializeAmbient(env.doc);
    env.pointer();
    assert.equal(controller.element.dataset.pointer, 'active');
    env.motion(true);
    await Promise.resolve();
    assert.equal(controller.element.dataset.motion, 'paused');
    assert.equal(env.frames.size, 0);
    const paintsWhenPaused = env.paints();
    env.pointer();
    env.frame(100);
    assert.notEqual(controller.element.dataset.pointer, 'active');
    assert.equal(env.paints(), paintsWhenPaused);
    env.motion(false);
    await Promise.resolve();
    assert.equal(controller.element.dataset.motion, 'running');
    assert.equal(env.frames.size, 1);
    env.pointer();
    assert.equal(controller.element.dataset.pointer, 'active');
  } finally { env.close(controller); }
});

test('reduced motion overrides resume and changing the preference safely restarts or stops animation', async () => {
  const env = environment({ reduced: true });
  let controller;
  try {
    controller = initializeAmbient(env.doc);
    env.motion(false);
    await Promise.resolve();
    env.pointer();
    assert.equal(controller.element.dataset.motion, 'paused');
    assert.notEqual(controller.element.dataset.pointer, 'active');
    assert.equal(env.frames.size, 0);
    env.setMedia('prefers-reduced-motion', false);
    assert.equal(env.frames.size, 1);
    env.setMedia('prefers-reduced-motion', true);
    assert.equal(env.frames.size, 0);
    assert.equal(controller.element.dataset.motion, 'paused');
  } finally { env.close(controller); }
});

test('visibility and printing re-evaluate blockers and never override an explicit pause', async () => {
  const env = environment();
  let controller;
  try {
    controller = initializeAmbient(env.doc);
    env.setHidden(true);
    assert.equal(env.frames.size, 0);
    env.setHidden(false);
    assert.equal(env.frames.size, 1);
    env.win.dispatchEvent(new env.win.Event('beforeprint'));
    assert.equal(env.frames.size, 0);
    env.setHidden(true);
    env.win.dispatchEvent(new env.win.Event('afterprint'));
    assert.equal(env.frames.size, 0, 'Finishing print must not resume a hidden document.');
    env.setHidden(false);
    assert.equal(env.frames.size, 1);
    env.win.dispatchEvent(new env.win.Event('beforeprint'));
    env.motion(true);
    await Promise.resolve();
    env.win.dispatchEvent(new env.win.Event('afterprint'));
    assert.equal(env.frames.size, 0, 'Finishing print must not override the user pause.');
    env.motion(false);
    await Promise.resolve();
    assert.equal(env.frames.size, 1);
  } finally { env.close(controller); }
});

test('touch and coarse pointers remain passive while mobile decoration retains one loop', () => {
  for (const options of [{ fine: true }, { fine: false }, { fine: false, mobile: true }]) {
    const env = environment(options);
    let controller;
    try {
      controller = initializeAmbient(env.doc);
      env.pointer('touch');
      assert.notEqual(controller.element.dataset.pointer, 'active');
      env.pointer('mouse');
      const active = options.fine && !options.mobile;
      assert.equal(controller.element.dataset.pointer === 'active', active);
      assert.equal(env.frames.size, 1);
      env.win.dispatchEvent(new env.win.Event('blur'));
      assert.notEqual(controller.element.dataset.pointer, 'active');
    } finally { env.close(controller); }
  }
});

test('switching an active desktop pointer to coarse clears its residual halo while retaining the 20fps loop', () => {
  const env = environment();
  let controller;
  try {
    controller = initializeAmbient(env.doc);
    env.pointer('mouse');
    env.frame(100);
    env.frame(150);
    assert.equal(controller.element.dataset.pointer, 'active');
    const activeHalos = env.pointerHalos();
    assert.ok(activeHalos > 0, 'The test must activate an actual pointer halo before changing capability.');
    env.setMedia('pointer: coarse', true);
    assert.equal(controller.element.dataset.pointer, 'disabled');
    assert.equal(controller.element.dataset.motion, 'running');
    assert.equal(env.frames.size, 1);
    const before = env.paints();
    for (let time = 200; time <= 1200; time += 10) env.frame(time);
    assert.equal(env.pointerHalos(), activeHalos, 'Coarse mode must clear pointer force, not just change its dataset.');
    const painted = env.paints() - before;
    assert.ok(painted > 0 && painted <= 21, 'The remaining ambient loop must keep its mobile 20fps budget.');
    assert.equal(env.frames.size, 1);
  } finally { env.close(controller); }
});

test('missing Canvas support keeps a static fallback and destroy permits a clean new initialization', () => {
  const env = environment({ context: false });
  let controller;
  try {
    controller = initializeAmbient(env.doc);
    assert.ok(controller.element.isConnected);
    assert.equal(env.frames.size, 0);
    assert.doesNotThrow(() => { env.emit('expo:scenechange', { id: 'regulacion-pulmonar' }); env.motion(false); });
    assert.equal(env.frames.size, 0);
    const first = controller;
    first.destroy();
    assert.equal(first.element.isConnected, false);
    env.setContext(true);
    controller = initializeAmbient(env.doc);
    assert.notEqual(controller, first);
    assert.equal(env.doc.querySelectorAll('[data-ambient]').length, 1);
    assert.equal(env.frames.size, 1);
    controller.destroy();
    assert.equal(env.frames.size, 0);
    env.emit('expo:scenechange', { id: 'inicio' });
    env.win.dispatchEvent(new env.win.Event('afterprint'));
    env.pointer();
    assert.equal(env.frames.size, 0, 'Destroyed listeners must not restart the loop.');
    assert.equal(env.doc.querySelectorAll('[data-ambient]').length, 0);
  } finally { env.close(controller); }
});

test('painting respects the desktop 30fps and mobile 20fps budgets', () => {
  for (const mobile of [false, true]) {
    const env = environment({ mobile, fine: !mobile });
    let controller;
    try {
      controller = initializeAmbient(env.doc);
      const before = env.paints();
      for (let time = 0; time <= 1000; time += 10) env.frame(time);
      const painted = env.paints() - before;
      const maximum = mobile ? 21 : 31;
      assert.ok(painted > 0, 'The supported active scene must paint.');
      assert.ok(painted <= maximum, `${painted} paints exceed the ${mobile ? 20 : 30}fps budget with boundary allowance.`);
      assert.equal(env.frames.size, 1);
    } finally { env.close(controller); }
  }
});
