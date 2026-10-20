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

function animationFrameQueue() {
  let nextId = 0;
  const pending = new Map();
  return {
    pending,
    request(callback) { const id = ++nextId; pending.set(id, callback); return id; },
    cancel(id) { pending.delete(id); },
    run(ids = [...pending.keys()]) {
      for (const id of ids) {
        const callback = pending.get(id);
        pending.delete(id);
        callback?.(0);
      }
    },
  };
}

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
  const animationFrames = options.manualAnimationFrames ? animationFrameQueue() : null;
  const globals = {
    window: win, document: win.document, location: win.location,
    history: win.history, navigator: win.navigator, localStorage: win.localStorage,
    addEventListener: win.addEventListener.bind(win),
    requestAnimationFrame: animationFrames ? animationFrames.request.bind(animationFrames) : win.requestAnimationFrame.bind(win),
    cancelAnimationFrame: animationFrames ? animationFrames.cancel.bind(animationFrames) : win.cancelAnimationFrame.bind(win),
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
    win, document: win.document, app, animationFrames,
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

test('DOM: genetics checks only the requested question and invalidates only its edited answer', async () => {
  const env = await environment('exposiciones/genetica/cromosomas-y-determinacion-sexual/index.html');
  try {
    const doc = env.document;
    const form = doc.querySelector('form[data-quiz-individual]');
    assert.ok(form);
    const questions = [...form.querySelectorAll('[data-question]')];
    const feedback = questions.map((question) => question.querySelector('[data-feedback]'));
    const explanations = feedback.map((message) => message.textContent);
    const checks = questions.map((question) => question.querySelector('[data-question-check]'));
    const score = form.querySelector('[data-quiz-score]');
    const answer = (index, correct = true) => questions[index].querySelector(
      correct ? `input[value="${questions[index].dataset.answer}"]` : `input:not([value="${questions[index].dataset.answer}"])`
    );
    assert.equal(questions.length, 5);
    assert.equal(form.querySelector('[data-quiz-check]'), null);
    assert.ok(checks.every((button) => button?.type === 'button'));
    assert.ok(feedback.every((message) => message.hidden));
    checks.forEach((button, index) => {
      assert.equal(doc.getElementById(button.getAttribute('aria-controls')), feedback[index]);
      assert.equal(feedback[index].getAttribute('role'), 'status');
    });

    checks[0].click();
    assert.equal(feedback[0].textContent, 'Selecciona una respuesta antes de comprobar.');
    assert.equal(feedback[0].hidden, false);
    assert.ok(feedback.slice(1).every((message) => message.hidden));
    assert.equal(score.textContent, '');

    answer(0).click();
    checks[0].click();
    assert.equal(feedback[0].textContent, `Correcta. ${explanations[0]}`);
    assert.match(score.textContent, /1 de 1 respuestas correctas\. 1 de 5 preguntas comprobadas\./);
    // A selected answer is not counted or revealed until that question is checked.
    answer(2).click();
    answer(1, false).click();
    checks[1].click();
    assert.equal(feedback[1].textContent, `Incorrecta. ${explanations[1]}`);
    assert.match(score.textContent, /1 de 2 respuestas correctas\. 2 de 5 preguntas comprobadas\./);
    assert.ok(feedback.slice(2).every((message) => message.hidden));
    checks[1].click();
    assert.match(score.textContent, /1 de 2 respuestas correctas\. 2 de 5 preguntas comprobadas\./);

    answer(0, false).click();
    assert.equal(feedback[0].hidden, true);
    assert.equal(feedback[1].hidden, false);
    assert.equal(feedback[1].textContent, `Incorrecta. ${explanations[1]}`);
    assert.match(score.textContent, /0 de 1 respuestas correctas\. 1 de 5 preguntas comprobadas\./);
    checks[0].click();
    assert.equal(feedback[0].textContent, `Incorrecta. ${explanations[0]}`);
    assert.match(score.textContent, /0 de 2 respuestas correctas\. 2 de 5 preguntas comprobadas\./);
    answer(0).click();
    checks[0].click();
    assert.equal(feedback[0].textContent, `Correcta. ${explanations[0]}`);
    assert.match(score.textContent, /1 de 2 respuestas correctas\. 2 de 5 preguntas comprobadas\./);
    checks[3].click();
    assert.equal(feedback[3].textContent, 'Selecciona una respuesta antes de comprobar.');
    assert.match(score.textContent, /1 de 2 respuestas correctas\. 2 de 5 preguntas comprobadas\./);
    assert.equal(answer(2).checked, true);
    assert.equal(feedback[2].hidden, true);
    assert.equal(feedback[4].hidden, true);

    form.reset(); await tick();
    assert.equal(form.querySelector('input:checked'), null);
    assert.equal(score.textContent, '');
    assert.ok(feedback.every((message) => message.hidden));
    // A new round starts independently, without the previous total or feedback.
    answer(4).click();
    checks[4].click();
    assert.match(score.textContent, /1 de 1 respuestas correctas\. 1 de 5 preguntas comprobadas\./);
    assert.ok(feedback.slice(0, 4).every((message) => message.hidden));
    answer(2).click();
    answer(2).focus();
    const submit = new env.win.Event('submit', { bubbles: true, cancelable: true });
    form.dispatchEvent(submit);
    assert.equal(submit.defaultPrevented, true);
    assert.equal(feedback[2].textContent, `Correcta. ${explanations[2]}`);
    assert.match(score.textContent, /2 de 2 respuestas correctas\. 2 de 5 preguntas comprobadas\./);
    assert.ok([0, 1, 3].every((index) => feedback[index].hidden));
  } finally { await env.close(); }
});

test('DOM: genetics preserves individual checks while paging questions, reopening materials and changing mode', async () => {
  const env = await environment('exposiciones/genetica/cromosomas-y-determinacion-sexual/index.html', '?modo=estudiar#freemartinismo');
  try {
    const { win, document: doc, app } = env;
    const transition = app.switchMode('presentar');
    doc.querySelector('[data-reveal-style]').dispatchEvent(new win.Event('load'));
    await transition;
    const form = doc.querySelector('form[data-quiz-individual]');
    const questions = [...form.querySelectorAll('[data-question]')];
    const previous = form.querySelector('[data-quiz-prev]');
    const next = form.querySelector('[data-quiz-next]');
    const position = form.querySelector('[data-quiz-position]');
    const score = form.querySelector('[data-quiz-score]');
    const open = doc.querySelector('[data-materials-open]');
    const dialog = doc.querySelector('#expo-materials');
    const firstAnswer = questions[0].querySelector(`input[value="${questions[0].dataset.answer}"]`);
    const secondAnswer = questions[1].querySelector(`input:not([value="${questions[1].dataset.answer}"])`);
    open.click();
    assert.equal(dialog.open, true);
    assert.equal(form.closest('dialog'), dialog);
    assert.equal(questions[0].hidden, false);
    assert.ok(questions.slice(1).every((question) => question.hidden));
    assert.equal(previous.disabled, true);
    firstAnswer.click();
    questions[0].querySelector('[data-question-check]').click();
    const firstFeedback = questions[0].querySelector('[data-feedback]').textContent;

    next.click();
    assert.equal(position.textContent, 'Pregunta 2 de 5');
    assert.equal(questions[0].hidden, true);
    assert.equal(questions[1].hidden, false);
    assert.equal(questions[1].querySelector('[data-feedback]').hidden, true);
    secondAnswer.click();
    questions[1].querySelector('[data-question-check]').click();
    const secondFeedback = questions[1].querySelector('[data-feedback]').textContent;
    assert.match(secondFeedback, /^Incorrecta\./);
    previous.click();
    assert.equal(questions[0].hidden, false);
    assert.equal(firstAnswer.checked, true);
    assert.equal(questions[0].querySelector('[data-feedback]').textContent, firstFeedback);
    assert.equal(questions[0].querySelector('[data-feedback]').hidden, false);
    next.click();
    dialog.querySelector('[data-dialog-close]').click();
    open.click();
    assert.equal(position.textContent, 'Pregunta 2 de 5');
    assert.equal(secondAnswer.checked, true);
    assert.equal(questions[1].querySelector('[data-feedback]').textContent, secondFeedback);
    assert.equal(questions[1].querySelector('[data-feedback]').hidden, false);
    assert.match(score.textContent, /1 de 2 respuestas correctas\. 2 de 5 preguntas comprobadas\./);
    assert.equal(win.location.hash, '#freemartinismo');

    dialog.querySelector('[data-dialog-close]').click();
    await app.switchMode('estudiar');
    assert.ok(questions.every((question) => !question.hidden));
    assert.equal(firstAnswer.checked, true);
    assert.equal(secondAnswer.checked, true);
    assert.equal(questions[0].querySelector('[data-feedback]').hidden, false);
    assert.equal(questions[1].querySelector('[data-feedback]').hidden, false);
    assert.ok(questions.slice(2).every((question) => question.querySelector('[data-feedback]').hidden));
    assert.match(score.textContent, /1 de 2 respuestas correctas\. 2 de 5 preguntas comprobadas\./);
    const returnToSlides = app.switchMode('presentar');
    doc.querySelector('[data-reveal-style]').dispatchEvent(new win.Event('load'));
    await returnToSlides;
    open.click();
    assert.equal(position.textContent, 'Pregunta 2 de 5');
    form.reset(); await tick();
    assert.equal(position.textContent, 'Pregunta 1 de 5');
    assert.equal(previous.disabled, true);
    assert.equal(questions[0].hidden, false);
    assert.ok(questions.slice(1).every((question) => question.hidden));
    assert.equal(form.querySelector('input:checked'), null);
    assert.ok(questions.every((question) => question.querySelector('[data-feedback]').hidden));
    assert.equal(score.textContent, '');
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

test('DOM: genetics keeps all activity choices when opening references from slides', async () => {
  const env = await environment('exposiciones/genetica/cromosomas-y-determinacion-sexual/index.html', '?modo=estudiar#cruces-cromosomicos');
  try {
    const { win, document: doc, app } = env;
    change(win, doc.querySelector('[data-gen-model]'), 'zzzw');
    doc.querySelector('[data-gen-cross="zzzw"] [data-row="1"][data-column="0"]').click();
    doc.querySelector('#via-testicular [data-gen-route="ovarica"]').click();
    doc.querySelector('[data-gen-hormone="dht"]').click();
    change(win, doc.querySelector('[data-gen-system]'), 'haplodiploidia');
    doc.querySelector('[data-gen-pattern="FMF"]').click();
    change(win, doc.querySelector('[data-gen-temperature]'), '2');
    doc.querySelector('[data-genetics-step="2"]').click();
    doc.querySelector('[data-gen-level="gonada"]').click();
    doc.querySelector('[data-gen-csd="homocigoto"]').click();
    doc.querySelector('[data-gen-chromosome="y"]').click();
    doc.querySelector('[data-gen-freemartin="intercambio"]').click();
    const question = doc.querySelector('[data-question]');
    const answer = question.querySelector(`input[value="${question.dataset.answer}"]`);
    answer.click();
    question.querySelector('[data-question-check]').click();
    for (const selector of ['[data-gen-model]', '[data-gen-temperature]', '[data-gen-hormone="dht"]']) {
      assert.equal(app.canNavigateByKeyboard({ target: doc.querySelector(selector) }), false);
    }

    const transition = app.switchMode('presentar');
    doc.querySelector('[data-reveal-style]').dispatchEvent(new win.Event('load'));
    await transition;
    assert.equal(doc.querySelectorAll('#expo-deck .slides section').length, 16);
    assert.equal(doc.querySelectorAll('#expo-deck .stack').length, 0);
    assert.equal(win.location.hash, '#cruces-cromosomicos');
    const materials = doc.querySelector('[data-materials-content]');
    doc.querySelector('[data-materials-open]').click();
    const materialsDialog = doc.querySelector('#expo-materials');
    assert.equal(materialsDialog.open,true);
    assert.equal(materialsDialog.querySelector('[data-materials-content]'),materials);
    assert.equal(doc.body.dataset.mode,'presentar');
    assert.equal(win.location.hash, '#cruces-cromosomicos');
    assert.equal(app.canNavigateByKeyboard({target:doc.body}),false);
    materialsDialog.querySelector('[data-dialog-close]').click();
    assert.equal(doc.querySelector('.gen-materials-home > [data-materials-content]'),materials);
    await app.switchMode('estudiar');
    assert.equal(doc.querySelector('[data-gen-model]').value, 'zzzw');
    assert.equal(doc.querySelector('[data-gen-complement]').textContent, 'ZW · Hembra');
    assert.equal(doc.querySelector('#via-testicular [data-gen-route-panel="ovarica"]').hidden, false);
    assert.equal(doc.querySelector('[data-gen-hormone-panel="dht"]').hidden, false);
    assert.equal(doc.querySelector('[data-gen-system]').value, 'haplodiploidia');
    assert.equal(doc.querySelector('[data-gen-pattern="FMF"]').getAttribute('aria-pressed'), 'true');
    assert.equal(doc.querySelector('[data-gen-temperature]').value, '2');
    assert.equal(doc.querySelector('[data-gen-thermal-result]').textContent, 'Predominio relativo de machos');
    assert.equal(doc.querySelector('[data-genetics-hero]').dataset.stage, '2');
    assert.equal(doc.querySelector('[data-gen-level-panel="gonada"]').hidden, false);
    assert.equal(doc.querySelector('[data-gen-csd-panel="homocigoto"]').hidden, false);
    assert.equal(doc.querySelector('[data-gen-chromosome-panel="y"]').hidden,false);
    assert.equal(doc.querySelector('[data-gen-freemartin-panel="intercambio"]').hidden,false);
    assert.equal(answer.checked, true);
    assert.equal(question.querySelector('[data-feedback]').hidden, false);
    assert.match(doc.querySelector('[data-quiz-score]').textContent, /1 de 1 respuestas correctas\. 1 de 5 preguntas comprobadas\./);
    assert.equal(doc.querySelectorAll('[data-genetics-ambient]').length, 1);
    assert.equal(doc.querySelector('[data-hero]'), null);
  } finally { await env.close(); }
});

test('DOM: genetics questions and references preserve the slide and print answers outside dialogs', async () => {
  const env = await environment('exposiciones/genetica/cromosomas-y-determinacion-sexual/index.html', '?modo=estudiar#freemartinismo');
  try {
    const {win, document:doc, app} = env;
    const transition=app.switchMode('presentar');
    doc.querySelector('[data-reveal-style]').dispatchEvent(new win.Event('load'));
    await transition;
    const progress=doc.querySelector('[data-progress]').textContent;
    const oralControls=[...doc.querySelectorAll('[data-oral-open]')];
    assert.equal(oralControls.length,5);
    for(const control of oralControls){
      control.focus();control.click();
      const dialog=doc.getElementById('oral-'+control.dataset.oralOpen);
      assert.equal(dialog.open,true);
      assert.equal(dialog.querySelector('details').open,false);
      assert.equal(app.canNavigateByKeyboard({target:dialog.querySelector('summary')}),false);
      dialog.querySelector('[data-dialog-close]').click();
      assert.equal(doc.activeElement,control);
    }
    const content=doc.querySelector('[data-materials-content]');
    assert.equal(content.closest('#expo-deck'),null);
    const ref=doc.querySelector('#freemartinismo a[href^="#ref-"]');
    ref.click();
    const dialog=doc.querySelector('#expo-materials');
    assert.equal(dialog.open,true);
    assert.equal(doc.querySelector('[data-progress]').textContent,progress);
    assert.equal(win.location.hash,'#freemartinismo');
    const firstAnswer=content.querySelector('details');
    const secondAnswer=content.querySelectorAll('details')[1];
    firstAnswer.open=true;
    // Real close events may be queued. Printing must restore nodes synchronously.
    dialog.close=function(){this.open=false;};
    win.dispatchEvent(new win.Event('beforeprint'));
    assert.equal(content.parentElement.className,'gen-materials-home expo-study-only');
    assert.ok([...content.querySelectorAll('details')].every(answer=>answer.open));
    win.dispatchEvent(new win.Event('afterprint'));
    assert.equal(firstAnswer.open,true);
    assert.equal(secondAnswer.open,false);
    dialog.dispatchEvent(new win.Event('close'));
    const control=doc.querySelector('[data-materials-open]');
    const modified=new win.MouseEvent('click',{ctrlKey:true,bubbles:true,cancelable:true});
    control.dispatchEvent(modified);
    assert.equal(modified.defaultPrevented,false);
    assert.equal(dialog.open,false);
    const ids=[...doc.querySelectorAll('[id]')].map(node=>node.id);
    assert.equal(ids.length,new Set(ids).size);
  } finally {await env.close();}
});

test('DOM: merged genetics anchors resolve and SVG/image enlargements keep theme and focus', async () => {
  const env = await environment('exposiciones/genetica/cromosomas-y-determinacion-sexual/index.html', '?modo=estudiar#gonada-bipotencial');
  try {
    const { win, document: doc } = env;
    // Study mode can retain the inbound fragment while its navigation resolves
    // the merged destination; sharing either fragment must keep working.
    assert.equal(win.location.hash, '#gonada-bipotencial');
    assert.equal(doc.querySelector('[data-progress]').textContent, '7 / 16');
    assert.equal(new URL(doc.querySelector('[data-view-mode="presentar"]').href).hash, '#via-testicular');
    const aliases = {'cromosomas-y-gametos':'caracteristicas-cromosomas','via-ovarica':'desarrollo-femenino','sistema-xx-x0':'comparacion-de-sistemas'};
    for (const [alias, target] of Object.entries(aliases)) {
      win.location.hash = alias;
      await tick();
      assert.equal(win.location.hash, '#' + target);
    }
    const button = doc.querySelector('#freemartinismo [data-inline-figure]');
    button.focus(); button.click();
    const dialog = doc.querySelector('#expo-figure');
    assert.equal(dialog.open, true);
    assert.equal(dialog.querySelector('img').hidden, true);
    const svg = dialog.querySelector('[data-expanded-svg]');
    assert.ok(svg);
    assert.match(svg.querySelector('text').getAttribute('fill'), /var\(--expo-/);
    const ids = [...doc.querySelectorAll('[id]')].map((node) => node.id);
    assert.equal(ids.length, new Set(ids).size);
    for (const id of svg.getAttribute('aria-labelledby').split(' ')) assert.ok(svg.querySelector(`[id="${id}"]`));
    for (const element of svg.querySelectorAll('[marker-end]')) {
      const id = element.getAttribute('marker-end').slice(5,-1);
      assert.ok(svg.querySelector(`[id="${id}"]`));
    }
    doc.querySelector('[data-theme-toggle]').click();
    assert.equal(doc.body.dataset.theme,'light');
    assert.equal(dialog.querySelector('[data-expanded-svg]'),svg);
    dialog.querySelector('[data-dialog-close]').click();
    assert.equal(dialog.open,false);
    assert.equal(dialog.querySelector('[data-expanded-svg]'),null);
    assert.equal(doc.activeElement,button);
    // Context images share the same dialog after an SVG has been displayed.
    const illustrations = [...doc.querySelectorAll('.gen-context-image')];
    assert.equal(illustrations.length, 3);
    for (const illustration of illustrations) {
      const imageButton = illustration.querySelector('[data-enlarge]');
      const preview = illustration.querySelector('img');
      assert.match(illustration.querySelector('figcaption').textContent, /Ilustración generada con IA/);
      imageButton.focus(); imageButton.click();
      assert.equal(dialog.open, true);
      assert.equal(dialog.querySelector('img').hidden, false);
      assert.equal(dialog.querySelector('img').src, preview.src);
      assert.equal(dialog.querySelector('img').alt, preview.alt);
      assert.equal(dialog.querySelector('[data-expanded-svg]'), null);
      assert.equal(dialog.getAttribute('aria-label'), 'Imagen de ejemplo ampliada');
      assert.equal(dialog.hasAttribute('data-context-image'), true);
      assert.match(dialog.querySelector('[data-expanded-caption]').textContent, /Ilustración generada con IA/);
      assert.equal(dialog.querySelector('[data-expanded-caption]').textContent, imageButton.dataset.caption);
      dialog.querySelector('[data-dialog-close]').click();
      assert.equal(doc.activeElement, imageButton);
      assert.equal(dialog.hasAttribute('data-context-image'), false);
      assert.equal(dialog.querySelector('[data-expanded-caption]'), null);
      assert.equal(dialog.getAttribute('aria-label'), 'Esquema ampliado');
    }
  } finally { await env.close(); }
});

test('DOM regression: stale study animation frames cannot change the slide during loading or after a mode round trip', async () => {
  const env = await environment(expoPath, '?modo=estudiar#simulador', { manualAnimationFrames: true });
  try {
    const { win, document: doc, app, animationFrames } = env;
    change(win, doc.querySelector('#hco3-number'), '18');
    const scenes = [...doc.querySelectorAll('.expo-scene')];
    const gasometry = scenes.findIndex((scene) => scene.id === 'lectura-gasometria');
    assert.ok(gasometry >= 0);
    // Simulate the intermediate geometry produced when reveal.css loads while
    // the page still has the study-mode layout. It must not become navigation.
    scenes.forEach((scene, index) => {
      scene.getBoundingClientRect = () => ({ top: index <= gasometry ? (index - gasometry) * 300 : 1000 });
    });
    win.dispatchEvent(new win.Event('scroll'));
    const queuedStudyFrames = [...animationFrames.pending.entries()];
    assert.ok(queuedStudyFrames.length >= 2, 'Initial anchor scrolling and scroll tracking must both be pending.');

    const transition = app.switchMode('presentar');
    // A browser may already have taken callbacks out of its queue when cleanup
    // runs. Execute that batch during the asynchronous CSS/module-loading gap.
    for (const [, callback] of queuedStudyFrames) callback(0);
    doc.querySelector('[data-reveal-style]').dispatchEvent(new win.Event('load'));
    await transition;
    assert.equal(doc.body.dataset.mode, 'presentar');
    assert.equal(doc.querySelector('.expo-scene.present')?.id, 'simulador');
    assert.equal(win.location.hash, '#simulador');
    assert.equal(doc.querySelector('#hco3-number').value, '18');
    assert.equal(doc.querySelector('#sim-ph').textContent, '7,28');
    assert.ok(queuedStudyFrames.every(([id]) => !animationFrames.pending.has(id)), 'The obsolete scheduled work must also be cancelled.');

    await app.switchMode('estudiar');
    // Merely checking mode === estudiar is insufficient: an earlier study
    // lifecycle is still obsolete after returning to study mode.
    for (const [, callback] of queuedStudyFrames) callback(0);
    assert.equal(win.location.hash, '#simulador');
    assert.equal(doc.querySelector('#hco3-number').value, '18');

    const beforeScroll = new Set(animationFrames.pending.keys());
    win.dispatchEvent(new win.Event('scroll'));
    animationFrames.run([...animationFrames.pending.keys()].filter((id) => !beforeScroll.has(id)));
    assert.equal(win.location.hash, '#lectura-gasometria', 'The current study lifecycle must still respond to actual scrolling.');
  } finally { await env.close(); }
});
