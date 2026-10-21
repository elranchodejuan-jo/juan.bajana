/** Pure numerical checks and DOM emulation; not browser/layout verification. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import { bufferDirection, ISO_PH, isoPHSegment, phasePoint, ventilationModel } from '../exposiciones/shared/visual-models.mjs';
import { initializeVisualLabs } from '../exposiciones/shared/visual-labs.mjs';
import { initializeSimulator } from '../exposiciones/shared/simulator.mjs';

const close = (actual, expected, tolerance = 1e-9) => assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} ≠ ${expected} ± ${tolerance}`);
const root = fileURLToPath(new URL('../', import.meta.url));
const snippets = JSON.parse(execFileSync(process.env.PYTHON || 'python3', ['-c',
  "import json,sys;sys.path.insert(0,'scripts');from expo_visuals import visual_for,simulator_visual,laboratory_visual;print(json.dumps({'buffer':visual_for('bicarbonato-co2'),'pulmonary':visual_for('regulacion-pulmonar'),'renal':visual_for('regulacion-renal'),'phase':simulator_visual(),'unknown':visual_for('sin-laboratorio'),'suite':laboratory_visual()}))",
], { cwd: root, encoding: 'utf8' }));

function environment(fragment, reduced = false) {
  const dom = new JSDOM(`<body data-mode="estudiar" data-motion="running">${fragment}</body>`, { url: 'https://vetjb.example/exposiciones/', pretendToBeVisual: true });
  const media = new dom.window.EventTarget();
  media.matches = reduced;
  dom.window.matchMedia = () => media;
  return { dom, win: dom.window, doc: dom.window.document, media };
}

function emit(win, target, name, detail) {
  target.dispatchEvent(new win.CustomEvent(name, { bubbles: true, detail }));
}

test('ventilation model preserves inverse relation and independent numerical checkpoints', () => {
  close(ventilationModel(50).pco2, 80);
  close(ventilationModel(75).pco2, 53.333333333333336);
  close(ventilationModel(100).pco2, 40);
  close(ventilationModel(125).pco2, 32);
  close(ventilationModel(150).pco2, 26.666666666666668);
  for (let percentage = 50; percentage < 150; percentage += 5) {
    assert.ok(ventilationModel(percentage).pco2 > ventilationModel(percentage + 5).pco2);
  }
  assert.equal(ventilationModel(50).direction, 'retention');
  assert.equal(ventilationModel(150).direction, 'elimination');
  assert.equal('pH' in ventilationModel(100), false, 'The pulmonary illustration must not imply a complete acid–base simulation.');
});

test('invalid ventilation values produce no apparently valid result', () => {
  for (const value of ['', ' ', 'abc', null, undefined, true, [], NaN, Infinity, 0, -1, 49.99, 150.01]) {
    const result = ventilationModel(value);
    assert.equal(result.valid, false, String(value));
    assert.equal(result.pco2, null);
  }
});

test('qualitative buffer directions follow the reaction as drawn without invented concentrations', () => {
  assert.equal(bufferDirection('baseline'), 'reversible');
  assert.equal(bufferDirection('acid'), 'right');
  assert.equal(bufferDirection('co2'), 'left');
  assert.equal(bufferDirection('remove'), 'right');
  assert.equal(bufferDirection('invented'), null);
  assert.equal(bufferDirection('constructor'), null);
});

test('phase map places baseline and handles direction, same ratios and invalid controls', () => {
  const baseline = phasePoint(24, 40);
  close(baseline.x, 264);
  close(baseline.y, 177.27272727272728);
  close(baseline.pH, 7.401029995663981);
  close(baseline.ratio, 20);
  close(phasePoint(12, 20).pH, baseline.pH);
  assert.ok(phasePoint(36, 40).y < baseline.y);
  assert.ok(phasePoint(24, 60).x > baseline.x);
  assert.ok(phasePoint(24, 60).pH < baseline.pH);
  for (const [hco3, pco2] of [['', 40], [24, ''], [0, 40], [24, 0], [24.01, 40], [49, 40], [24, 101], [NaN, 40], [24, Infinity]]) {
    const result = phasePoint(hco3, pco2);
    assert.equal(result.valid, false);
    assert.equal(result.x, null);
    assert.equal(result.y, null);
    assert.equal(result.ratio, null);
  }
});

test('every iso-pH segment fits axes and satisfies HH using an independent inverse calculation', () => {
  for (const pH of ISO_PH) {
    const line = isoPHSegment(pH);
    assert.ok(line);
    for (const point of [line.start, line.end]) {
      const independentPH = 6.1 + Math.log(point.hco3 / (0.03 * point.pco2)) / Math.LN10;
      close(independentPH, pH);
      assert.ok(point.hco3 >= 4 - 1e-9 && point.hco3 <= 48 + 1e-9);
      assert.ok(point.pco2 >= 10 - 1e-9 && point.pco2 <= 100 + 1e-9);
    }
    assert.ok(line.startPixel.x < line.endPixel.x);
    assert.ok(line.startPixel.y > line.endPixel.y);
  }
  for (const bad of ['', 'bad', null, NaN, Infinity, -1, 15]) assert.equal(isoPHSegment(bad), null);
});

test('SSR SVG lines agree with numerical model; all diagrams have accessible descriptions without JS', () => {
  const { dom, doc } = environment(['buffer', 'pulmonary', 'renal', 'phase', 'unknown'].map((key) => snippets[key]).join(''));
  try {
    assert.equal(snippets.unknown, '');
    assert.equal(doc.querySelectorAll('svg').length, 4);
    assert.equal(doc.querySelectorAll('section').length, 0, 'reveal.js treats nested sections as additional slides.');
    for (const svg of doc.querySelectorAll('svg')) {
      assert.ok(svg.querySelector('title')?.textContent.length);
      assert.ok(svg.querySelector('desc')?.textContent.length);
      assert.equal(svg.getAttribute('role'), 'img');
    }
    for (const group of doc.querySelectorAll('[data-isoph]')) {
      const line = isoPHSegment(group.dataset.isoph);
      const coords = group.querySelector('path').getAttribute('d').match(/-?\d+(?:\.\d+)?/g).map(Number);
      [line.startPixel.x, line.startPixel.y, line.endPixel.x, line.endPixel.y].forEach((expected, index) => close(coords[index], expected, .00051));
    }
    assert.match(doc.querySelector('[data-phase-readout]').textContent, /20,0 : 1/);
    assert.match(doc.querySelector('[data-visual-lab="renal"]').textContent, /no añade bicarbonato nuevo/);
  } finally { dom.window.close(); }
});

test('SSR laboratory includes all three readable models and valid tab relationships in one scene', () => {
  const { dom, doc } = environment(snippets.suite);
  try {
    const panels = [...doc.querySelectorAll('[data-lab-panel]')];
    const tabs = [...doc.querySelectorAll('[role="tab"]')];
    assert.equal(panels.length, 3);
    assert.equal(doc.querySelectorAll('[data-visual-lab]').length, 3);
    assert.equal(doc.querySelectorAll('section').length, 0, 'Models must not become extra Reveal slides.');
    assert.ok(panels.every((panel) => !panel.hidden));
    assert.equal(doc.querySelector('[role="tablist"]').hidden, true, 'Inactive controls are not exposed without JavaScript.');
    for (const [index, tab] of tabs.entries()) {
      assert.equal(doc.getElementById(tab.getAttribute('aria-controls')), panels[index]);
      assert.equal(panels[index].getAttribute('aria-labelledby'), tab.id);
      assert.ok(panels[index].querySelector('h3').textContent);
    }
    const ids = [...doc.querySelectorAll('[id]')].map((node) => node.id);
    assert.equal(ids.length, new Set(ids).size);
  } finally { dom.window.close(); }
});

test('DOM laboratory tabs preserve experiments, support keyboard selection, pause hidden models and print all panels', () => {
  const { dom, doc, win } = environment(`<section class="expo-scene" id="laboratorio">${snippets.suite}</section>`);
  let dispose;
  try {
    dispose = initializeVisualLabs(doc, { initialFragment: '#regulacion-pulmonar' });
    initializeVisualLabs(doc);
    const suite = doc.querySelector('[data-lab-suite]');
    const tabs = [...doc.querySelectorAll('[data-lab-tab]')];
    const pulmonary = doc.querySelector('[data-visual-lab="pulmonary"]');
    const active = () => [...doc.querySelectorAll('[data-lab-panel]:not([hidden])')].map((panel) => panel.id);
    const key = (tab, value) => {
      const event = new win.KeyboardEvent('keydown', { key: value, bubbles: true, cancelable: true });
      tab.dispatchEvent(event);
      assert.equal(event.defaultPrevented, true);
    };
    assert.deepEqual(active(), ['regulacion-pulmonar']);
    assert.equal(suite.dataset.activeLab, 'regulacion-pulmonar');
    assert.equal(pulmonary.dataset.motion, 'running');
    const ventilation = doc.querySelector('[data-ventilation]');
    ventilation.value = '150'; emit(win, ventilation, 'input');
    assert.equal(doc.querySelector('[data-vent-pco2]').textContent, '26,7 mmHg');
    const sliderKey = new win.KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, cancelable: true });
    ventilation.dispatchEvent(sliderKey);
    assert.equal(sliderKey.defaultPrevented, false, 'Tabs must not intercept a model input.');

    key(tabs[1], 'Home');
    assert.deepEqual(active(), ['bicarbonato-co2']);
    assert.equal(doc.activeElement, tabs[0]);
    assert.equal(pulmonary.dataset.motion, 'paused');
    doc.querySelector('input[name="buffer-load"][value="co2"]').click();
    doc.querySelector('[data-buffer-next]').click();
    doc.querySelector('[data-buffer-next]').click();
    key(tabs[0], 'ArrowLeft');
    assert.deepEqual(active(), ['regulacion-renal']);
    doc.querySelector('input[name="renal-function"][value="2"]').click();
    key(tabs[2], 'ArrowRight');
    assert.equal(doc.querySelector('[data-buffer-position]').textContent, 'Paso 3 de 3');
    assert.equal(doc.querySelector('input[name="buffer-load"][value="co2"]').checked, true);
    key(tabs[0], 'End');
    assert.equal(doc.querySelector('[data-visual-lab="renal"]').dataset.renalState, '2');
    tabs[1].click();
    assert.equal(ventilation.value, '150');
    assert.equal(pulmonary.dataset.motion, 'running');
    assert.equal(tabs.filter((tab) => tab.getAttribute('aria-selected') === 'true').length, 1);
    assert.equal(tabs[1].tabIndex, 0);

    emit(win, doc, 'expo:motion', { paused: true });
    tabs[0].click(); tabs[1].click();
    assert.equal(pulmonary.dataset.motion, 'paused');
    emit(win, doc, 'expo:motion', { paused: false });
    win.dispatchEvent(new win.Event('beforeprint'));
    assert.equal(active().length, 3);
    assert.equal(pulmonary.dataset.motion, 'paused');
    win.dispatchEvent(new win.Event('afterprint'));
    assert.deepEqual(active(), ['regulacion-pulmonar']);
    assert.equal(pulmonary.dataset.motion, 'running');

    dispose(); dispose = undefined;
    assert.equal(active().length, 3);
    assert.equal(doc.querySelector('[role="tablist"]').hidden, true);
    tabs[0].click();
    assert.equal(active().length, 3, 'Cleanup removes the tab handlers.');
    dispose = initializeVisualLabs(doc, { initialFragment: '#regulacion-renal' });
    assert.deepEqual(active(), ['regulacion-renal']);
  } finally { dispose?.(); dom.window.close(); }
});

test('DOM buffer steps, load changes and reset remain functional after idempotent initialization', () => {
  const { dom, doc } = environment(snippets.buffer);
  try {
    initializeVisualLabs(doc);
    initializeVisualLabs(doc);
    const lab = doc.querySelector('[data-visual-lab]');
    doc.querySelector('[data-buffer-next]').click();
    assert.equal(doc.querySelector('[data-buffer-position]').textContent, 'Paso 2 de 3');
    assert.equal(doc.querySelectorAll('[data-buffer-panel]:not([hidden])').length, 1);
    doc.querySelector('input[value="co2"]').click();
    assert.equal(lab.dataset.direction, 'left');
    assert.equal(doc.querySelector('[data-buffer-position]').textContent, 'Paso 1 de 3');
    assert.match(doc.querySelector('[data-buffer-panel]:not([hidden])').textContent, /Carga de CO₂/);
    doc.querySelector('[data-buffer-next]').click();
    doc.querySelector('[data-buffer-next]').click();
    assert.equal(doc.querySelector('[data-buffer-next]').disabled, true);
    doc.querySelector('[data-buffer-reset]').click();
    assert.equal(lab.dataset.direction, 'reversible');
    assert.equal(doc.querySelector('input[value="baseline"]').checked, true);
    assert.equal(doc.querySelector('[data-buffer-prev]').disabled, true);
  } finally { dom.window.close(); }
});

test('buffer teaching steps follow physiology while the model limitation remains outside every sequence', () => {
  const { dom, doc } = environment(snippets.buffer);
  try {
    initializeVisualLabs(doc);
    const note = doc.querySelector('[data-buffer-model-note]');
    assert.equal(note.textContent, 'El esquema muestra la dirección de la reacción; no calcula su magnitud.');
    assert.equal(note.closest('[data-buffer-panel]'), null);
    for (const [load, direction, finalPhrase] of [['co2', 'left', 'El pH tiende a descender'], ['remove', 'right', 'El pH tiende a subir']]) {
      doc.querySelector(`input[value="${load}"]`).click();
      for (let step = 0; step < 3; step++) {
        const panel = doc.querySelector('[data-buffer-panel]:not([hidden])');
        assert.equal(panel.dataset.bufferStep, String(step));
        assert.equal(doc.querySelector('[data-visual-lab]').dataset.direction, direction);
        assert.doesNotMatch(panel.textContent, /Reconocer el límite|no calcula|no predicen|no se simulan/);
        assert.equal(note.hidden, false);
        if (step < 2) doc.querySelector('[data-buffer-next]').click();
        else assert.equal(panel.querySelector('h3').textContent, finalPhrase);
      }
    }
    assert.match(doc.querySelector('details.expo-study-only').textContent, /No calcula concentraciones, velocidades ni compensación/);
  } finally { dom.window.close(); }
});

test('DOM renal controls select one function and reset without implying generation during recycling', () => {
  const { dom, doc } = environment(snippets.renal);
  try {
    initializeVisualLabs(doc);
    for (const index of [1, 2, 0]) {
      doc.querySelector(`input[value="${index}"]`).click();
      assert.equal(doc.querySelector('[data-visual-lab]').dataset.renalState, String(index));
      assert.equal(doc.querySelectorAll('[data-renal-panel]:not([hidden])').length, 1);
      assert.equal(doc.querySelector('[data-renal-panel]:not([hidden])').dataset.renalPanel, String(index));
      assert.equal(doc.querySelector('.lab-renal-path.lab-active').dataset.renalFlow, String(index));
    }
    doc.querySelector('input[value="2"]').click();
    assert.match(doc.querySelector('[data-renal-panel]:not([hidden])').textContent, /excreción neta/);
    doc.querySelector('[data-renal-reset]').click();
    assert.equal(doc.querySelector('input[value="0"]').checked, true);
  } finally { dom.window.close(); }
});

test('DOM pulmonary controls calculate, reset, pause for scene/global motion and freeze for printing', () => {
  const { dom, doc, win } = environment(`<section class="expo-scene" id="regulacion-pulmonar">${snippets.pulmonary}</section>`);
  try {
    initializeVisualLabs(doc);
    const lab = doc.querySelector('[data-visual-lab]');
    const input = doc.querySelector('[data-ventilation]');
    input.value = '50'; emit(win, input, 'input');
    assert.equal(doc.querySelector('[data-vent-pco2]').textContent, '80,0 mmHg');
    assert.equal(lab.dataset.motion, 'running');
    doc.querySelector('[data-lab-motion]').click();
    assert.equal(lab.dataset.motion, 'paused');
    doc.querySelector('[data-lab-motion]').click();
    emit(win, doc, 'expo:motion', { paused: true });
    assert.equal(lab.dataset.motion, 'paused');
    assert.equal(doc.querySelector('[data-lab-motion]').disabled, true);
    emit(win, doc, 'expo:motion', { paused: false });
    emit(win, doc, 'expo:modechange', { mode: 'presentar' });
    emit(win, doc, 'expo:scenechange', { id: 'otra-escena' });
    assert.equal(lab.dataset.motion, 'paused');
    emit(win, doc, 'expo:scenechange', { id: 'regulacion-pulmonar' });
    assert.equal(lab.dataset.motion, 'running');
    win.dispatchEvent(new win.Event('beforeprint'));
    assert.equal(lab.dataset.motion, 'paused');
    win.dispatchEvent(new win.Event('afterprint'));
    assert.equal(lab.dataset.motion, 'running');
    doc.querySelector('[data-vent-reset]').click();
    assert.equal(input.value, '100');
    assert.equal(doc.querySelector('[data-vent-pco2]').textContent, '40,0 mmHg');
  } finally { dom.window.close(); }
});

test('DOM reduced motion remains paused even when global motion resumes', () => {
  const { dom, doc, win } = environment(snippets.pulmonary, true);
  try {
    initializeVisualLabs(doc);
    emit(win, doc, 'expo:motion', { paused: false });
    assert.equal(doc.querySelector('[data-visual-lab]').dataset.motion, 'paused');
    assert.equal(doc.querySelector('[data-lab-motion]').disabled, true);
  } finally { dom.window.close(); }
});

test('DOM phase map follows real simulator events and hides stale markers for invalid values', async () => {
  const controls = `<form data-simulator><input id="hco3-number" type="number" min="4" max="48" step="0.1" value="24"><input id="hco3-range" type="range" min="4" max="48" step="0.1" value="24"><input id="pco2-number" type="number" min="10" max="100" step="0.1" value="40"><input id="pco2-range" type="range" min="10" max="100" step="0.1" value="40"><output id="sim-ph"></output><output id="sim-trend"></output><p id="sim-error"></p><button type="reset">Reiniciar</button></form>`;
  const { dom, doc, win } = environment(`<section class="expo-scene" id="simulador">${controls}${snippets.phase}</section>`);
  try {
    const events = [];
    doc.addEventListener('expo:simulator', (event) => events.push(event.detail));
    initializeVisualLabs(doc);
    const form = doc.querySelector('[data-simulator]');
    initializeSimulator(form);
    assert.equal(events.at(-1).valid, true);
    const marker = doc.querySelector('[data-phase-marker]');
    close(Number(marker.getAttribute('cx')), 264);
    assert.match(doc.querySelector('[data-phase-readout]').textContent, /20,0 : 1 · pH 7,40/);
    const hco3 = doc.querySelector('#hco3-number');
    hco3.value = '12'; emit(win, hco3, 'input');
    close(Number(marker.getAttribute('cy')), 250.9090909090909);
    assert.match(doc.querySelector('[data-phase-readout]').textContent, /10,0 : 1 · pH 7,10/);
    hco3.value = ''; emit(win, hco3, 'input');
    assert.equal(events.at(-1).valid, false);
    assert.equal(doc.querySelector('[data-phase-point]').getAttribute('visibility'), 'hidden');
    assert.match(doc.querySelector('[data-phase-readout]').textContent, /Punto oculto/);
    form.reset(); await new Promise((resolve) => queueMicrotask(resolve));
    assert.equal(events.at(-1).valid, true);
    assert.equal(doc.querySelector('[data-phase-point]').getAttribute('visibility'), 'visible');
    close(Number(marker.getAttribute('cy')), 177.27272727272728);
  } finally { dom.window.close(); }
});
