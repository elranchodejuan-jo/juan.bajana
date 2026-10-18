/** Educational Henderson–Hasselbalch model (approximately 37 °C).
 * The limits describe this interface, not veterinary reference intervals.
 */
export const MODEL = Object.freeze({
  pKa: 6.1,
  alpha: 0.03,
  hco3: Object.freeze({ min: 4, max: 48, step: 0.1, initial: 24, unit: 'mmol/L' }),
  pco2: Object.freeze({ min: 10, max: 100, step: 0.1, initial: 40, unit: 'mmHg' }),
});

function readValue(raw, limits, label) {
  if ((typeof raw !== 'number' && typeof raw !== 'string') ||
      (typeof raw === 'string' && raw.trim() === '')) {
    return { error: `Introduce un valor de ${label}.` };
  }
  const value = Number(raw);
  if (!Number.isFinite(value)) return { error: `${label} debe ser un número finito.` };
  if (value < limits.min || value > limits.max) {
    return { error: `${label} debe estar entre ${limits.min} y ${limits.max} ${limits.unit} en este simulador.` };
  }
  if (Math.abs(value / limits.step - Math.round(value / limits.step)) > 1e-8) {
    return { error: `Usa como máximo un decimal para ${label} (incrementos de 0,1 ${limits.unit}).` };
  }
  return { value };
}

export function evaluateAcidBase(hco3Input, pco2Input) {
  const bicarbonate = readValue(hco3Input, MODEL.hco3, 'HCO₃⁻');
  const carbonDioxide = readValue(pco2Input, MODEL.pco2, 'PCO₂');
  const errors = { hco3: bicarbonate.error ?? '', pco2: carbonDioxide.error ?? '' };
  if (errors.hco3 || errors.pco2) return { valid: false, errors, pH: null };

  const hco3 = bicarbonate.value;
  const pco2 = carbonDioxide.value;
  const ratio = hco3 / (MODEL.alpha * pco2);
  const pH = MODEL.pKa + Math.log10(ratio);
  const baselineRatio = MODEL.hco3.initial / (MODEL.alpha * MODEL.pco2.initial);
  const trend = Math.abs(ratio - baselineRatio) < 1e-9 ? 'igual' : ratio < baselineRatio ? 'menor' : 'mayor';
  return { valid: true, errors, pH, hco3, pco2, trend };
}

export function initializeSimulator(form) {
  const hco3Number = form.querySelector('#hco3-number');
  const hco3Range = form.querySelector('#hco3-range');
  const pco2Number = form.querySelector('#pco2-number');
  const pco2Range = form.querySelector('#pco2-range');
  const phOutput = form.querySelector('#sim-ph');
  const trendOutput = form.querySelector('#sim-trend');
  const errorOutput = form.querySelector('#sim-error');
  const marker = form.querySelector('#sim-marker');
  if (![hco3Number, hco3Range, pco2Number, pco2Range, phOutput, trendOutput, errorOutput].every(Boolean)) return;

  const pairs = [
    { number: hco3Number, range: hco3Range, key: 'hco3' },
    { number: pco2Number, range: pco2Range, key: 'pco2' },
  ];
  const decimal = new Intl.NumberFormat('es', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const publish = (result) => {
    const Event = form.ownerDocument.defaultView?.CustomEvent;
    if (Event) form.dispatchEvent(new Event('expo:simulator', { bubbles: true, detail: result }));
  };

  function render() {
    const result = evaluateAcidBase(hco3Number.value, pco2Number.value);
    for (const pair of pairs) {
      pair.number.setAttribute('aria-invalid', String(Boolean(result.errors[pair.key])));
    }
    errorOutput.textContent = [result.errors.hco3, result.errors.pco2].filter(Boolean).join(' ');
    errorOutput.hidden = result.valid;
    if (!result.valid) {
      phOutput.textContent = '—';
      trendOutput.textContent = 'Corrige los valores para calcular el pH.';
      if (marker) marker.setAttribute('visibility', 'hidden');
      publish(result);
      return;
    }
    phOutput.textContent = decimal.format(result.pH);
    const wording = {
      igual: 'Mismo cociente; mismo pH. No descarta un trastorno.',
      menor: 'El cociente disminuye: tendencia acidificante.',
      mayor: 'El cociente aumenta: tendencia alcalinizante.',
    };
    trendOutput.textContent = wording[result.trend];
    if (marker) {
      const minPH = Number(marker.dataset.phMin ?? 6.2);
      const maxPH = Number(marker.dataset.phMax ?? 8.4);
      const minX = Number(marker.dataset.xMin ?? 20);
      const maxX = Number(marker.dataset.xMax ?? 580);
      const position = Math.max(0, Math.min(1, (result.pH - minPH) / (maxPH - minPH)));
      marker.setAttribute('cx', String(minX + position * (maxX - minX)));
      marker.setAttribute('visibility', 'visible');
      marker.setAttribute('aria-label', `pH calculado: ${decimal.format(result.pH)}`);
    }
    publish(result);
  }

  for (const pair of pairs) {
    pair.range.addEventListener('input', () => {
      pair.number.value = pair.range.value;
      render();
    });
    pair.number.addEventListener('input', () => {
      const limits = MODEL[pair.key];
      const value = Number(pair.number.value);
      // Do not silently replace an invalid number with a browser-clamped slider value.
      if (pair.number.value.trim() && Number.isFinite(value) && value >= limits.min && value <= limits.max && !pair.number.validity.stepMismatch) {
        pair.range.value = pair.number.value;
      }
      render();
    });
  }
  form.querySelectorAll('[data-preset]').forEach((button) => {
    button.addEventListener('click', () => {
      hco3Number.value = button.dataset.hco3 ?? '';
      pco2Number.value = button.dataset.pco2 ?? '';
      const result = evaluateAcidBase(hco3Number.value, pco2Number.value);
      if (result.valid) {
        hco3Range.value = hco3Number.value;
        pco2Range.value = pco2Number.value;
      }
      render();
    });
  });
  form.addEventListener('submit', (event) => event.preventDefault());
  form.addEventListener('reset', () => {
    // Let the browser perform its native reset before applying the documented baseline.
    queueMicrotask(() => {
      for (const pair of pairs) pair.number.value = pair.range.value = String(MODEL[pair.key].initial);
      render();
    });
  });
  render();
}
