import { exposureFromRecordedDose } from './pharmacology-models.mjs';

const decimal = new Intl.NumberFormat('es-EC', { maximumFractionDigits: 2, minimumFractionDigits: 2 });

export function initializePharmacologyLabs(root = document) {
  root.querySelectorAll('[data-pharma-dose]').forEach((lab) => {
    const control = lab.querySelector('select');
    const concentrations = JSON.parse(lab.dataset.concentrations);
    const refresh = () => {
      const result = exposureFromRecordedDose(Number(control.value), Number(lab.dataset.volume), concentrations);
      const output = lab.querySelector('[data-dose-result]');
      if (!result) { output.textContent = 'Datos no válidos para reconstruir el cálculo.'; return; }
      lab.querySelectorAll('[data-component-mgkg]').forEach((item, i) => { item.textContent = `${decimal.format(result.components[i].mgKg)} mg/kg`; });
      output.textContent = `${decimal.format(result.totalMgKg)} mg/kg de la combinación por administración`;
      lab.querySelector('[data-dose-weight]').textContent = decimal.format(Number(control.value));
    };
    control.addEventListener('change', refresh);
    refresh();
  });
  root.querySelectorAll('[data-pharma-stepper]').forEach((lab) => {
    let current = 0;
    const steps = [...lab.querySelectorAll('[data-pharma-step]')];
    const controls = [...lab.querySelectorAll('[data-pharma-select]')];
    const refresh = () => {
      steps.forEach((item, i) => { item.hidden = i !== current; });
      controls.forEach((button, i) => button.setAttribute('aria-pressed', String(i === current)));
    };
    controls.forEach((button, i) => button.addEventListener('click', () => { current = i; refresh(); }));
    refresh();
  });
}
