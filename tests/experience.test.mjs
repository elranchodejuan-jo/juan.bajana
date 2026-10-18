/** DOM emulation only: these tests do not validate layout, reveal.js, a real
 * browser's keyboard defaults, popup permissions, fullscreen or rendering.
 * Install the pinned development dependency jsdom@26.1.0 before running.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';

const root = new URL('../', import.meta.url);
const moduleURL = new URL('../exposiciones/shared/experience.mjs', import.meta.url);
const expoPath = 'exposiciones/fisiopatologia/equilibrio-acido-base/index.html';
let importNumber = 0;
const tick = () => new Promise((resolve) => setTimeout(resolve, 10));

async function environment(path, suffix = '', options = {}) {
  const html = await readFile(new URL(path, root), 'utf8');
  const address = `https://vetjb.example/${path.replace(/index\.html$/, '')}${suffix}`;
  const dom = new JSDOM(html, { url: address, pretendToBeVisual: true });
  const win = dom.window;
  // jsdom has no Canvas renderer: exercise the intentional semantic SVG fallback.
  win.HTMLCanvasElement.prototype.getContext = () => null;
  win.matchMedia = (query) => ({ matches: query.includes('prefers-reduced-motion') && Boolean(options.reducedMotion), addEventListener() {}, removeEventListener() {} });
  const originals = new Map();
  const intervals = new Set();
  const nativeInterval = globalThis.setInterval;
  const globals = {
    window: win, document: win.document, location: win.location,
    history: win.history, navigator: win.navigator, localStorage: win.localStorage,
    addEventListener: win.addEventListener.bind(win),
    requestAnimationFrame: win.requestAnimationFrame.bind(win),
    cancelAnimationFrame: win.cancelAnimationFrame.bind(win),
    getComputedStyle: win.getComputedStyle.bind(win),
    HTMLElement: win.HTMLElement, Element: win.Element, Node: win.Node,
    setInterval: (...args) => { const timer = nativeInterval(...args); intervals.add(timer); return timer; },
  };
  for (const [key, value] of Object.entries(globals)) {
    originals.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { value, writable: true, configurable: true });
  }
  win.HTMLElement.prototype.scrollIntoView = function () {};
  win.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  win.HTMLDialogElement.prototype.close = function () {
    this.open = false;
    this.dispatchEvent(new win.Event('close'));
  };
  const app = await import(`${moduleURL.href}?dom-test=${++importNumber}`);
  await tick();
  return {
    win, document: win.document, app,
    async close() {
      await tick();
      win.close();
      for (const timer of intervals) clearInterval(timer);
      for (const [key, original] of originals) {
        if (original) Object.defineProperty(globalThis, key, original);
        else delete globalThis[key];
      }
    },
  };
}

function change(win, input, value) {
  input.value = value;
  input.dispatchEvent(new win.Event(input.matches('select') ? 'change' : 'input', { bubbles: true }));
}

test('DOM: catalogue matches accents and capitals, combines subject filter and exposes empty state', async () => {
  const env = await environment('exposiciones/index.html');
  try {
    const { win, document: doc } = env;
    const search = doc.querySelector('input[type="search"]');
    const subject = doc.querySelector('select[name="materia"]');
    const cards = [...doc.querySelectorAll('[data-expo-card]')];
    assert.ok(cards.length > 0);
    change(win, search, 'FISIOPATOLOGIA');
    assert.equal(cards.filter((card) => !card.hidden).length, 1);
    assert.equal(new URL(win.location.href).searchParams.get('q'), 'FISIOPATOLOGIA');
    change(win, subject, 'genetica');
    assert.equal(cards.filter((card) => !card.hidden).length, 0);
    assert.equal(doc.querySelector('[data-catalog-empty]').hidden, false);
    change(win, subject, '');
    change(win, search, 'ninguna coincidencia');
    assert.equal(cards.filter((card) => !card.hidden).length, 0);
    doc.querySelector('[data-catalog-search]').reset();
    await tick();
    assert.equal(cards.filter((card) => !card.hidden).length, cards.length);
    assert.equal(doc.querySelector('[data-catalog-empty]').hidden, true);
    assert.equal(new URL(win.location.href).search, '');
  } finally { await env.close(); }
});

test('DOM: study mode preserves scene in mode link; theme and modal close return focus', async () => {
  const source = await readFile(new URL(expoPath, root), 'utf8');
  const ids = [...source.matchAll(/<section[^>]+id="([^"]+)"/g)].map((match) => match[1]);
  assert.ok(ids.length >= 4);
  const env = await environment(expoPath, `?modo=estudiar#${ids[3]}`);
  try {
    const doc = env.document;
    assert.equal(doc.body.dataset.mode, 'estudiar');
    assert.equal(doc.querySelector('[data-view-mode="estudiar"]').getAttribute('aria-current'), 'true');
    assert.equal(doc.querySelector('[data-view-mode="presentar"]').textContent, 'Diapositivas');
    const modeLink = new URL(doc.querySelector('[data-view-mode="presentar"]').href);
    assert.equal(modeLink.searchParams.get('modo'), 'presentar');
    assert.equal(modeLink.hash, `#${ids[3]}`);
    assert.match(doc.querySelector('[data-progress]').textContent, /^4\s*\//);
    const themeButtons = [...doc.querySelectorAll('[data-theme-toggle]')];
    assert.ok(themeButtons.length >= 1);
    themeButtons.at(-1).click();
    assert.equal(doc.body.dataset.theme, 'light');
    assert.equal(env.win.localStorage.getItem('vetjb-expo-theme'), 'light');
    assert.ok(themeButtons.every((button) => button.getAttribute('aria-pressed') === 'true'));
    themeButtons[0].click();
    assert.equal(doc.body.dataset.theme, 'dark');
    const opener = doc.querySelector('[data-index-open]');
    opener.focus(); opener.click();
    const dialog = doc.querySelector('#expo-index');
    assert.equal(dialog.open, true);
    dialog.querySelector('[data-dialog-close]').click();
    assert.equal(dialog.open, false);
    assert.equal(doc.activeElement, opener);
    doc.querySelector('[data-next]').click();
    assert.equal(env.win.location.hash, `#${ids[4]}`);
  } finally { await env.close(); }
});

test('DOM: simulator synchronizes paired controls, clears invalid results and restores baseline', async () => {
  const env = await environment(expoPath);
  try {
    const { win, document: doc } = env;
    const form = doc.querySelector('[data-simulator]');
    const hco3 = form.querySelector('#hco3-number');
    const range = form.querySelector('#hco3-range');
    const pco2 = form.querySelector('#pco2-number');
    assert.equal(form.querySelector('#sim-ph').textContent, '7,40');
    change(win, range, '12');
    assert.equal(hco3.value, '12');
    assert.equal(form.querySelector('#sim-ph').textContent, '7,10');
    change(win, hco3, '');
    assert.equal(form.querySelector('#sim-ph').textContent, '—');
    assert.equal(hco3.getAttribute('aria-invalid'), 'true');
    assert.equal(form.querySelector('#sim-error').hidden, false);
    assert.equal(range.value, '12');
    change(win, hco3, '24.01');
    assert.equal(form.querySelector('#sim-ph').textContent, '—');
    form.reset();
    await tick();
    assert.equal(hco3.value, '24');
    assert.equal(pco2.value, '40');
    assert.equal(range.value, '24');
    assert.equal(form.querySelector('#sim-ph').textContent, '7,40');
    assert.equal(form.querySelector('#sim-error').hidden, true);
    form.querySelector('[data-preset]').click();
    assert.equal(form.querySelector('#sim-ph').textContent, '7,20');
  } finally { await env.close(); }
});

test('DOM: both cases require a choice, explain alternatives, reveal and reset reasoning', async () => {
  const env = await environment(expoPath);
  try {
    const doc = env.document;
    const cases = [...doc.querySelectorAll('form[data-case]')];
    assert.equal(cases.length, 2);
    for (const form of cases) {
      const next = form.querySelector('[data-case-next]');
      assert.equal(next.disabled, true);
      form.querySelector('[data-case-check]').click();
      assert.match(form.querySelector('[data-case-status]').textContent, /Selecciona/);
      const correct = form.querySelector(`input[value="${form.dataset.correctIndex}"]`);
      correct.click();
      form.querySelector('[data-case-check]').click();
      assert.match(form.querySelector('[data-case-status]').textContent, /correcta/);
      assert.equal(next.disabled, false);
      assert.ok([...form.querySelectorAll('[data-option-feedback]')].every((feedback) => !feedback.hidden));
      next.click(); next.click();
      assert.equal([...form.querySelectorAll('[data-step]')].filter((step) => !step.hidden).length, 2);
      const previous = form.querySelector('[data-case-prev]');
      assert.ok(previous);
      previous.click();
      assert.equal([...form.querySelectorAll('[data-step]')].filter((step) => !step.hidden).length, 1);
      form.reset(); await tick();
      assert.equal(form.querySelector('input:checked'), null);
      assert.equal(next.disabled, true);
      assert.ok([...form.querySelectorAll('[data-step], [data-option-feedback]')].every((element) => element.hidden));
    }
  } finally { await env.close(); }
});

test('DOM: quiz computes an individual score from answers and resets all feedback', async () => {
  const env = await environment(expoPath);
  try {
    const doc = env.document;
    const form = doc.querySelector('[data-quiz]');
    const questions = [...form.querySelectorAll('[data-question]')];
    assert.equal(questions.length, 5);
    assert.ok(questions.every((question) => !question.hidden));
    for (const question of questions) question.querySelector(`input[value="${question.dataset.answer}"]`).click();
    form.querySelector('[data-quiz-check]').click();
    assert.match(form.querySelector('[data-quiz-score]').textContent, /5 de 5 respuestas correctas/);
    assert.ok(questions.every((question) => !question.querySelector('[data-feedback]').hidden));
    questions[0].querySelector(`input:not([value="${questions[0].dataset.answer}"])`).click();
    form.querySelector('[data-quiz-check]').click();
    assert.match(form.querySelector('[data-quiz-score]').textContent, /4 de 5 respuestas correctas/);
    form.reset(); await tick();
    assert.equal(form.querySelector('input:checked'), null);
    assert.equal(form.querySelector('[data-quiz-score]').textContent, '');
    assert.ok(questions.every((question) => question.querySelector('[data-feedback]').hidden));
  } finally { await env.close(); }
});

test('DOM: keyboard guard blocks controls, text selection and dialogs without suppressing ordinary scene navigation', async () => {
  const env = await environment(expoPath);
  try {
    const { document: doc, win, app } = env;
    doc.activeElement?.blur();
    assert.equal(app.canNavigateByKeyboard({ target: doc.body }), true);
    for (const selector of ['input', 'button', 'a', 'form']) {
      assert.equal(app.canNavigateByKeyboard({ target: doc.querySelector(selector) }), false, selector);
    }
    for (const tag of ['select', 'textarea', 'div']) {
      const element = doc.createElement(tag);
      if (tag === 'div') element.setAttribute('contenteditable', 'true');
      doc.body.append(element);
      assert.equal(app.canNavigateByKeyboard({ target: element }), false, tag);
      element.remove();
    }
    const input = doc.querySelector('input');
    input.focus();
    assert.equal(app.canNavigateByKeyboard({ target: doc.body }), false);
    input.blur();
    const range = doc.createRange();
    range.selectNodeContents(doc.querySelector('h2'));
    win.getSelection().addRange(range);
    assert.equal(app.canNavigateByKeyboard({ target: doc.body }), false);
    win.getSelection().removeAllRanges();
    const dialog = doc.querySelector('#expo-index');
    dialog.showModal();
    assert.equal(app.canNavigateByKeyboard({ target: doc.body }), false);
    dialog.close();
    assert.equal(app.canNavigateByKeyboard({ target: doc.body }), true);
  } finally { await env.close(); }
});


test('DOM: global motion pause is explicit and does not change the scene or simulator', async () => {
  const env = await environment(expoPath, '?modo=estudiar#simulador');
  try {
    const doc = env.document;
    const control = doc.querySelector('[data-motion-toggle]');
    const before = doc.querySelector('#sim-ph').textContent;
    assert.equal(doc.body.dataset.motion, 'running');
    control.click();
    assert.equal(doc.body.dataset.motion, 'paused');
    assert.equal(control.getAttribute('aria-pressed'), 'true');
    assert.equal(env.win.location.hash, '#simulador');
    assert.equal(doc.querySelector('#sim-ph').textContent, before);
    control.click();
    assert.equal(doc.body.dataset.motion, 'running');
    assert.equal(control.getAttribute('aria-pressed'), 'false');
  } finally { await env.close(); }
});


test('DOM: hero remains explorable without Canvas and honors reduced motion', async () => {
  const env = await environment(expoPath, '', { reducedMotion: true });
  try {
    const doc = env.document;
    assert.equal(doc.body.dataset.motion, 'paused');
    assert.equal(doc.querySelector('[data-motion-toggle]').disabled, true);
    const hero = doc.querySelector('[data-hero]');
    hero.querySelector('[data-hero-step="2"]').click();
    assert.equal(hero.dataset.stage, '2');
    assert.equal(hero.querySelector('[data-hero-step="2"]').getAttribute('aria-pressed'), 'true');
    assert.match(hero.querySelector('[data-hero-caption]').textContent, /HCO₃/);
    assert.equal(hero.querySelector('[data-hero-layer="2"]').getAttribute('aria-hidden'), 'false');
  } finally { await env.close(); }
});

test('DOM: mode round trip uses local reveal engine and preserves entered state', async () => {
  const env = await environment(expoPath, '?modo=estudiar#simulador');
  try {
    const { win, document: doc, app } = env;
    change(win, doc.querySelector('#hco3-number'), '18');
    const correct = doc.querySelector('[data-question] input[value="0"]');
    correct.click();
    const transition = app.switchMode('presentar');
    // Stylesheet loading is outside jsdom: signal successful local CSS retrieval.
    doc.querySelector('[data-reveal-style]').dispatchEvent(new win.Event('load'));
    await transition;
    assert.equal(doc.body.dataset.mode, 'presentar');
    assert.equal(doc.querySelectorAll('#expo-deck .slides section').length, 15);
    assert.equal(doc.querySelectorAll('#expo-deck .stack').length, 0);
    assert.equal(doc.querySelector('[data-view-mode="presentar"]').getAttribute('aria-current'), 'true');
    assert.equal(doc.querySelector('#hco3-number').value, '18');
    assert.equal(env.win.location.hash, '#simulador');
    await app.switchMode('estudiar');
    assert.equal(doc.body.dataset.mode, 'estudiar');
    assert.equal(doc.querySelector('#hco3-number').value, '18');
    assert.equal(correct.checked, true);
    assert.equal(doc.querySelector('[data-reveal-style]'), null);
    assert.ok([...doc.querySelectorAll('.expo-scene')].every(scene => !scene.hidden), 'Every scene must become readable after leaving slides');
    assert.equal(env.win.location.hash, '#simulador');
  } finally { await env.close(); }
});
