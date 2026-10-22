/** Historical dose arithmetic. This module never selects or recommends a dose. */
export function exposureFromRecordedDose(weightKg, volumeMl, concentrations) {
  if (!Array.isArray(concentrations) || !concentrations.length) return null;
  if (![weightKg, volumeMl, ...concentrations].every((v) => typeof v === 'number' && Number.isFinite(v) && v > 0)) return null;
  const components = concentrations.map((mgMl) => ({ mg: mgMl * volumeMl, mgKg: mgMl * volumeMl / weightKg }));
  return { components, totalMg: components.reduce((sum, item) => sum + item.mg, 0), totalMgKg: components.reduce((sum, item) => sum + item.mgKg, 0) };
}

export function weightDifference(initialKg, finalKg) {
  if (![initialKg, finalKg].every((v) => typeof v === 'number' && Number.isFinite(v) && v > 0)) return null;
  return { kg: finalKg - initialKg, percentage: (finalKg - initialKg) / initialKg * 100 };
}
