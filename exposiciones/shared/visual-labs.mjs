import { bufferDirection, phasePoint, ventilationModel } from './visual-models.mjs';

const initialized = new WeakSet();
const initializedSuites = new WeakSet();
const decimal = new Intl.NumberFormat('es', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const phDecimal = new Intl.NumberFormat('es', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function laboratoryTabs(suite, on, doc, win, initialFragment) {
  const tabs = [...suite.querySelectorAll('[data-lab-tab]')];
  const panels = [...suite.querySelectorAll('[data-lab-panel]')];
  const tablist = suite.querySelector('[role="tablist"]');
  let initialId;
  try { initialId = decodeURIComponent((initialFragment || doc.location.hash).replace(/^#\/?/, '')); } catch { /* Invalid fragments open the first model. */ }
  let selected = Math.max(0, panels.findIndex((panel) => panel.id === initialId));
  let printing = false;
  function render(announce = true) {
    tabs.forEach((tab, index) => {
      tab.setAttribute('aria-selected', String(index === selected));
      tab.tabIndex = index === selected ? 0 : -1;
    });
    panels.forEach((panel, index) => { panel.hidden = !printing && index !== selected; });
    suite.dataset.activeLab = panels[selected].id;
    if (announce) doc.dispatchEvent(new win.CustomEvent('expo:labchange', { detail: { id: panels[selected].id, sceneId: suite.closest('.expo-scene')?.id } }));
  }
  function select(index, focus = false) {
    if (index < 0 || index >= tabs.length) return;
    selected = index;
    render();
    if (focus) tabs[selected].focus({ preventScroll: true });
  }
  tabs.forEach((tab, index) => on(tab, 'click', () => select(index)));
  on(tablist, 'keydown', (event) => {
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
    const index = tabs.indexOf(event.target.closest('[data-lab-tab]'));
    if (index < 0) return;
    const target = { ArrowRight: (index + 1) % tabs.length, ArrowLeft: (index + tabs.length - 1) % tabs.length, Home: 0, End: tabs.length - 1 }[event.key];
    if (target === undefined) return;
    event.preventDefault();
    select(target, true);
  });
  on(suite, 'expo:labtarget', (event) => {
    const index = panels.findIndex((panel) => panel.id === event.detail?.id);
    if (index >= 0) select(index);
  });
  on(win, 'beforeprint', () => { printing = true; render(false); });
  on(win, 'afterprint', () => { printing = false; render(false); });
  suite.dataset.ready = 'true';
  tablist.hidden = false;
  render();
  return () => {
    panels.forEach((panel) => { panel.hidden = false; });
    tablist.hidden = true;
    delete suite.dataset.ready;
    delete suite.dataset.activeLab;
  };
}

function bufferLab(lab, on) {
  const choices = [...lab.querySelectorAll('input[name="buffer-load"]')];
  const panels = [...lab.querySelectorAll('[data-buffer-panel]')];
  const previous = lab.querySelector('[data-buffer-prev]');
  const next = lab.querySelector('[data-buffer-next]');
  let load = choices.find((input) => input.checked)?.value || 'baseline';
  let step = 0;
  function update() {
    const direction = bufferDirection(load);
    lab.dataset.direction = direction;
    panels.forEach((panel) => { panel.hidden = panel.dataset.bufferPanel !== load || Number(panel.dataset.bufferStep) !== step; });
    lab.querySelector('[data-buffer-position]').textContent = `Paso ${step + 1} de 3`;
    lab.querySelector('[data-buffer-direction]').textContent = {
      reversible: 'Reacción reversible',
      right: 'Sentido favorecido: hacia CO₂ y agua →',
      left: '← Sentido favorecido: hacia H⁺ y HCO₃⁻',
    }[direction];
    previous.disabled = step === 0;
    next.disabled = step === 2;
  }
  choices.forEach((input) => on(input, 'change', () => {
    if (!input.checked || !bufferDirection(input.value)) return;
    load = input.value;
    step = 0;
    update();
  }));
  on(previous, 'click', () => { step = Math.max(0, step - 1); update(); });
  on(next, 'click', () => { step = Math.min(2, step + 1); update(); });
  on(lab.querySelector('[data-buffer-reset]'), 'click', () => {
    load = 'baseline'; step = 0;
    choices.forEach((input) => { input.checked = input.value === load; });
    update();
  });
  update();
}

function renalLab(lab, on) {
  const inputs = [...lab.querySelectorAll('input[name="renal-function"]')];
  function update(index) {
    lab.dataset.renalState = String(index);
    lab.querySelectorAll('[data-renal-panel]').forEach((panel) => { panel.hidden = Number(panel.dataset.renalPanel) !== index; });
    lab.querySelectorAll('[data-renal-flow]').forEach((path) => { path.classList.toggle('lab-active', Number(path.dataset.renalFlow) === index); });
  }
  inputs.forEach((input) => on(input, 'change', () => {
    if (input.checked && ['0', '1', '2'].includes(input.value)) update(Number(input.value));
  }));
  on(lab.querySelector('[data-renal-reset]'), 'click', () => {
    inputs.forEach((input) => { input.checked = input.value === '0'; });
    update(0);
  });
  update(Number(inputs.find((input) => input.checked)?.value || 0));
}

function pulmonaryLab(lab, on, doc, win) {
  const input = lab.querySelector('[data-ventilation]');
  const toggle = lab.querySelector('[data-lab-motion]');
  const reducedMotion = win.matchMedia?.('(prefers-reduced-motion: reduce)');
  let localPaused = false;
  let globalPaused = doc.body?.dataset.motion === 'paused';
  let printing = false;
  let valid = true;
  let mode = doc.body?.dataset.mode || 'estudiar';
  let activeScene = doc.querySelector('.expo-scene.present')?.id || doc.location.hash.slice(1);

  function updateMotion() {
    const scene = lab.closest('.expo-scene');
    const inactive = (mode === 'presentar' && scene && scene.id !== activeScene) || lab.closest('[data-lab-panel]')?.hidden;
    const blocked = globalPaused || Boolean(reducedMotion?.matches);
    const paused = blocked || localPaused || printing || doc.hidden || !valid || inactive;
    lab.dataset.motion = paused ? 'paused' : 'running';
    toggle.disabled = blocked;
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.textContent = blocked ? 'Movimiento pausado' : localPaused ? 'Activar movimiento' : 'Pausar movimiento';
  }

  function render() {
    const result = ventilationModel(input.value);
    valid = result.valid;
    input.setAttribute('aria-invalid', String(!valid));
    const error = lab.querySelector('[data-vent-error]');
    error.hidden = valid;
    error.textContent = result.error || '';
    if (!valid) {
      lab.querySelector('[data-vent-value]').textContent = '—';
      lab.querySelector('[data-vent-pco2]').textContent = '—';
      lab.querySelector('[data-vent-trend]').textContent = 'Corrige la ventilación para mostrar un resultado.';
    } else {
      lab.querySelector('[data-vent-value]').textContent = `${result.percentage} %`;
      lab.querySelector('[data-vent-pco2]').textContent = `${decimal.format(result.pco2)} mmHg`;
      lab.querySelector('[data-vent-trend]').textContent = {
        baseline: '100 % es el punto de comparación didáctico.',
        retention: 'Menor ventilación → mayor PaCO₂ en este modelo.',
        elimination: 'Mayor ventilación → menor PaCO₂ en este modelo.',
      }[result.direction];
      // This period animates an illustration; it is not a clinical respiratory rate.
      lab.style.setProperty('--breath-duration', `${(4 / (result.percentage / 100)).toFixed(2)}s`);
    }
    updateMotion();
  }
  on(input, 'input', render);
  on(lab.querySelector('[data-vent-reset]'), 'click', () => { input.value = '100'; render(); });
  on(toggle, 'click', () => { localPaused = !localPaused; updateMotion(); });
  on(doc, 'expo:motion', (event) => { globalPaused = event.detail?.paused === true; updateMotion(); });
  on(doc, 'expo:modechange', (event) => { mode = event.detail?.mode || mode; updateMotion(); });
  on(doc, 'expo:scenechange', (event) => { activeScene = event.detail?.id || ''; updateMotion(); });
  on(doc, 'expo:labchange', updateMotion);
  on(doc, 'visibilitychange', updateMotion);
  on(win, 'beforeprint', () => { printing = true; updateMotion(); });
  on(win, 'afterprint', () => { printing = false; updateMotion(); });
  if (reducedMotion?.addEventListener) on(reducedMotion, 'change', updateMotion);
  render();
}

function phaseLab(lab, on, doc) {
  const marker = lab.querySelector('[data-phase-marker]');
  const halo = lab.querySelector('[data-phase-halo]');
  const point = lab.querySelector('[data-phase-point]');
  const readout = lab.querySelector('[data-phase-readout]');
  const form = lab.closest('[data-simulator]') || lab.closest('.expo-scene')?.querySelector('[data-simulator]') || doc.querySelector('[data-simulator]');
  function render(result) {
    const value = result?.valid ? phasePoint(result.hco3, result.pco2) : null;
    if (!value?.valid) {
      point.setAttribute('visibility', 'hidden');
      readout.textContent = 'Punto oculto: corrige los valores del simulador.';
      return;
    }
    for (const element of [marker, halo]) {
      element.setAttribute('cx', String(value.x));
      element.setAttribute('cy', String(value.y));
    }
    point.setAttribute('visibility', 'visible');
    lab.querySelector('[data-phase-guides]').setAttribute('d', `M74 ${value.y}H${value.x}V300`);
    readout.textContent = `Base / CO₂ disuelto = ${decimal.format(value.ratio)} : 1 · pH ${phDecimal.format(value.pH)}`;
  }
  on(doc, 'expo:simulator', (event) => {
    if (form && event.target !== form) return;
    render(event.detail);
  });
  if (form) render(phasePoint(form.querySelector('#hco3-number')?.value, form.querySelector('#pco2-number')?.value));
}

/** Idempotent, DOM-scoped initialization. No network access or animation timer.
 * Returns a cleanup function for mounting the same fragment again if needed.
 */
export function initializeVisualLabs(root = document, { initialFragment } = {}) {
  const doc = root.nodeType === 9 ? root : root.ownerDocument;
  const win = doc?.defaultView;
  if (!win) return () => {};
  const labs = [...root.querySelectorAll('[data-visual-lab]')];
  if (root.matches?.('[data-visual-lab]')) labs.unshift(root);
  const cleanups = [];
  const suites = [...root.querySelectorAll('[data-lab-suite]')];
  if (root.matches?.('[data-lab-suite]')) suites.unshift(root);
  for (const suite of suites) {
    if (initializedSuites.has(suite)) continue;
    const listeners = [];
    const on = (target, name, handler) => {
      target?.addEventListener(name, handler);
      listeners.push(() => target?.removeEventListener(name, handler));
    };
    const restore = laboratoryTabs(suite, on, doc, win, initialFragment);
    initializedSuites.add(suite);
    cleanups.push(() => { listeners.forEach((cleanup) => cleanup()); restore(); initializedSuites.delete(suite); });
  }
  for (const lab of labs) {
    if (initialized.has(lab)) continue;
    const listeners = [];
    const on = (target, name, handler) => {
      if (!target) return;
      target.addEventListener(name, handler);
      listeners.push(() => target.removeEventListener(name, handler));
    };
    const type = lab.dataset.visualLab;
    if (type === 'buffer') bufferLab(lab, on);
    else if (type === 'renal') renalLab(lab, on);
    else if (type === 'pulmonary') pulmonaryLab(lab, on, doc, win);
    else if (type === 'phase') phaseLab(lab, on, doc);
    else continue;
    initialized.add(lab);
    cleanups.push(() => { listeners.forEach((cleanup) => cleanup()); initialized.delete(lab); });
  }
  return () => cleanups.forEach((cleanup) => cleanup());
}
