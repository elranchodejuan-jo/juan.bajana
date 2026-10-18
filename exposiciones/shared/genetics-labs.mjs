import { punnettCombination, thermalRegion, validSystem } from './genetics-models.mjs';

const initialized = new WeakSet();

function selectPanel(lab, buttonAttribute, panelAttribute, selected) {
  lab.querySelectorAll(`[${buttonAttribute}]`).forEach((button) => {
    button.setAttribute('aria-pressed', String(button.getAttribute(buttonAttribute) === selected));
  });
  lab.querySelectorAll(`[${panelAttribute}]`).forEach((panel) => {
    panel.hidden = panel.getAttribute(panelAttribute) !== selected;
  });
}

function initializePunnett(lab, on) {
  const model = lab.querySelector('[data-gen-model]');
  const cells = [...lab.querySelectorAll('[data-gen-cell]')];
  function render() {
    if (!['xxxy', 'zzzw'].includes(model.value)) model.value = 'xxxy';
    lab.querySelectorAll('[data-gen-cross]').forEach((panel) => { panel.hidden = panel.dataset.genCross !== model.value; });
    const panel = lab.querySelector(`[data-gen-cross="${model.value}"]`);
    const selected = panel.querySelector('[data-gen-cell][aria-pressed="true"]') || panel.querySelector('[data-gen-cell]');
    const result = punnettCombination(model.value, Number(selected.dataset.row), Number(selected.dataset.column));
    if (!result) return;
    lab.querySelector('[data-gen-complement]').textContent = `${result.complement} · ${result.sex}`;
    lab.querySelector('[data-gen-origin]').textContent = `Materno: ${result.maternal} (óvulo) + paterno: ${result.paternal} (espermatozoide).`;
    lab.querySelector('[data-gen-fraction]').textContent = model.value === 'xxxy' ? 'XX = 1/2; XY = 1/2 en el modelo ideal.' : 'ZZ = 1/2; ZW = 1/2 en el modelo ideal.';
  }
  on(model, 'change', render);
  cells.forEach((button) => on(button, 'click', () => {
    const panel = button.closest('[data-gen-cross]');
    panel.querySelectorAll('[data-gen-cell]').forEach((cell) => cell.setAttribute('aria-pressed', String(cell === button)));
    render();
  }));
  on(lab.querySelector('[data-gen-reset]'), 'click', () => {
    model.value = 'xxxy';
    cells.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.row === '0' && button.dataset.column === '0')));
    render();
  });
  render();
}

function initializeSelection(lab, on, kind, options, fallback, keyboard = false) {
  const attribute = `data-gen-${kind}`;
  const panels = `${attribute}-panel`;
  const buttons = [...lab.querySelectorAll(`[${attribute}]`)];
  const render = (choice) => { if (options.includes(choice)) selectPanel(lab, attribute, panels, choice); };
  buttons.forEach((button, index) => {
    on(button, 'click', () => render(button.getAttribute(attribute)));
    if (keyboard) on(button, 'keydown', (event) => {
      const directions = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1 };
      let target;
      if (Object.hasOwn(directions, event.key)) target = (index + directions[event.key] + buttons.length) % buttons.length;
      else if (event.key === 'Home') target = 0;
      else if (event.key === 'End') target = buttons.length - 1;
      else return;
      event.preventDefault();
      event.stopPropagation();
      buttons[target].focus();
      render(buttons[target].getAttribute(attribute));
    });
  });
  on(lab.querySelector('[data-gen-reset]'), 'click', () => render(fallback));
  render(buttons.find((button) => button.getAttribute('aria-pressed') === 'true')?.getAttribute(attribute) || fallback);
}

function initializeComparison(lab, on) {
  const select = lab.querySelector('[data-gen-system]');
  function render() {
    if (!validSystem(select.value)) select.value = 'xxxy';
    lab.querySelectorAll('[data-gen-system-panel]').forEach((panel) => { panel.hidden = panel.dataset.genSystemPanel !== select.value; });
    lab.querySelectorAll('[data-gen-system-row]').forEach((row) => { row.classList.toggle('gen-selected', row.dataset.genSystemRow === select.value); });
  }
  on(select, 'change', render);
  on(lab.querySelector('[data-gen-reset]'), 'click', () => { select.value = 'xxxy'; render(); });
  render();
}

function initializeTemperature(lab, on) {
  const input = lab.querySelector('[data-gen-temperature]');
  const choices = [...lab.querySelectorAll('[data-gen-pattern]')];
  function render() {
    const pattern = choices.find((button) => button.getAttribute('aria-pressed') === 'true')?.dataset.genPattern || 'MF';
    const result = thermalRegion(pattern, Number(input.value));
    if (!result) return;
    lab.querySelector('[data-gen-thermal-position]').textContent = result.position;
    lab.querySelector('[data-gen-thermal-result]').textContent = result.description;
    input.setAttribute('aria-valuetext', `${result.position}: ${result.description.toLowerCase()}`);
    lab.querySelectorAll('[data-gen-pattern-row]').forEach((row) => {
      const selected = row.dataset.genPatternRow === pattern;
      row.classList.toggle('gen-selected', selected);
      row.querySelectorAll('[data-gen-thermal-cell]').forEach((cell) => {
        const current = selected && Number(cell.dataset.genThermalCell) === Number(input.value);
        cell.classList.toggle('gen-current', current);
        if (current) cell.setAttribute('aria-current', 'true');
        else cell.removeAttribute('aria-current');
      });
    });
  }
  choices.forEach((button) => on(button, 'click', () => {
    choices.forEach((choice) => choice.setAttribute('aria-pressed', String(choice === button)));
    render();
  }));
  on(input, 'input', render);
  on(input, 'change', render);
  on(lab.querySelector('[data-gen-reset]'), 'click', () => {
    input.value = '0';
    choices.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.genPattern === 'MF')));
    render();
  });
  render();
}

/** DOM-scoped, idempotent mount; selection lives in the controls, not a mode.
 * No timers, motion, network, storage or patient inference. Returns a destroy
 * function that removes only this mount's listeners, preserving current state.
 */
export function initGeneticsLabs(root = document) {
  const labs = [...root.querySelectorAll('[data-genetics-lab]')];
  if (root.matches?.('[data-genetics-lab]')) labs.unshift(root);
  const cleanups = [];
  for (const lab of labs) {
    if (initialized.has(lab)) continue;
    const listeners = [];
    const on = (target, type, listener) => {
      if (!target) return;
      target.addEventListener(type, listener);
      listeners.push(() => target.removeEventListener(type, listener));
    };
    const kind = lab.dataset.geneticsLab;
    if (kind === 'development') initializeSelection(lab, on, 'level', ['cromosomas', 'gonada', 'fenotipo'], 'cromosomas', true);
    else if (kind === 'haplodiploidy') initializeSelection(lab, on, 'csd', ['haploide', 'heterocigoto', 'homocigoto'], 'haploide', true);
    else if (kind === 'punnett') initializePunnett(lab, on);
    else if (kind === 'network') initializeSelection(lab, on, 'route', ['testicular', 'ovarica'], lab.dataset.genDefault || 'testicular');
    else if (kind === 'hormones') initializeSelection(lab, on, 'hormone', ['amh', 'testosterona', 'dht'], 'amh');
    else if (kind === 'comparison') initializeComparison(lab, on);
    else if (kind === 'temperature') initializeTemperature(lab, on);
    else continue;
    lab.dataset.genReady = 'true';
    initialized.add(lab);
    cleanups.push(() => { listeners.forEach((remove) => remove()); initialized.delete(lab); });
  }
  return () => cleanups.forEach((cleanup) => cleanup());
}
