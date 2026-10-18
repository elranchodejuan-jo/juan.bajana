import { MODEL, evaluateAcidBase } from './simulator.mjs';

export const PHASE_AXES = Object.freeze({ left: 74, right: 644, top: 30, bottom: 300 });
export const ISO_PH = Object.freeze([6.8, 7.0, 7.2, 7.4, 7.6, 7.8]);

function finiteNumber(raw) {
  if (!['string', 'number'].includes(typeof raw) || (typeof raw === 'string' && !raw.trim())) return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

/** Relative alveolar ventilation at constant CO₂ production and steady state.
 * Baseline 100% → 40 mmHg is a teaching scenario, not a species reference range.
 */
export function ventilationModel(input) {
  const percentage = finiteNumber(input);
  if (percentage === null || percentage < 50 || percentage > 150) {
    return { valid: false, percentage: null, pco2: null, error: 'Introduce una ventilación relativa entre 50 y 150 %.' };
  }
  const pco2 = 40 / (percentage / 100);
  return { valid: true, percentage, pco2, direction: percentage === 100 ? 'baseline' : percentage < 100 ? 'retention' : 'elimination' };
}

/** Directions apply to H+ + HCO3− ⇌ H2CO3 ⇌ CO2 + H2O. */
export function bufferDirection(load) {
  if (load === 'baseline') return 'reversible';
  if (load === 'acid' || load === 'remove') return 'right';
  if (load === 'co2') return 'left';
  return null;
}

export function phaseCoordinates(hco3, pco2) {
  return {
    x: PHASE_AXES.left + (pco2 - MODEL.pco2.min) / (MODEL.pco2.max - MODEL.pco2.min) * (PHASE_AXES.right - PHASE_AXES.left),
    y: PHASE_AXES.bottom - (hco3 - MODEL.hco3.min) / (MODEL.hco3.max - MODEL.hco3.min) * (PHASE_AXES.bottom - PHASE_AXES.top),
  };
}

/** Reject invalid input; never clamp it to a plausible-looking graph position. */
export function phasePoint(hco3Input, pco2Input) {
  const result = evaluateAcidBase(hco3Input, pco2Input);
  if (!result.valid) return { ...result, x: null, y: null, ratio: null };
  return { ...result, ...phaseCoordinates(result.hco3, result.pco2), ratio: result.hco3 / (MODEL.alpha * result.pco2) };
}

/** Exact iso-pH line segment, clipped in data coordinates to the control domain. */
export function isoPHSegment(input) {
  const pH = finiteNumber(input);
  if (pH === null || pH < 0 || pH > 14) return null;
  const slope = MODEL.alpha * 10 ** (pH - MODEL.pKa);
  const pco2Start = Math.max(MODEL.pco2.min, MODEL.hco3.min / slope);
  const pco2End = Math.min(MODEL.pco2.max, MODEL.hco3.max / slope);
  if (pco2Start > pco2End) return null;
  const start = { pco2: pco2Start, hco3: slope * pco2Start };
  const end = { pco2: pco2End, hco3: slope * pco2End };
  return { pH, start, end, startPixel: phaseCoordinates(start.hco3, start.pco2), endPixel: phaseCoordinates(end.hco3, end.pco2) };
}
