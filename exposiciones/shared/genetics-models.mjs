/** Educational relationships, not predictions for an individual animal. */
const CROSSES = Object.freeze({
  xxxy: Object.freeze({ maternal: ['X', 'X'], paternal: ['X', 'Y'], heterogametic: 'Macho XY', outcomes: ['XX', 'XY'] }),
  zzzw: Object.freeze({ maternal: ['Z', 'W'], paternal: ['Z', 'Z'], heterogametic: 'Hembra ZW', outcomes: ['ZZ', 'ZW'] }),
});

/** Each duplicated row/column represents one of four equally weighted cells. */
export function punnettCombination(system, row, column) {
  if (!Object.hasOwn(CROSSES, system) || !Number.isInteger(row) || !Number.isInteger(column) || row < 0 || row > 1 || column < 0 || column > 1) return null;
  const model = CROSSES[system];
  const maternal = model.maternal[row];
  const paternal = model.paternal[column];
  const complement = system === 'xxxy' ? `${maternal}${paternal}` : `${paternal}${maternal}`;
  return Object.freeze({ maternal, paternal, complement, sex: ['XX', 'ZW'].includes(complement) ? 'Hembra' : 'Macho', heterogametic: model.heterogametic, theoreticalFraction: '1/2' });
}

const THERMAL_PATTERNS = Object.freeze({
  MF: ['M', 'M', 'T', 'F', 'F'],
  FM: ['F', 'F', 'T', 'M', 'M'],
  FMF: ['F', 'T', 'M', 'T', 'F'],
});
const POSITIONS = ['Extremo relativamente bajo', 'Región baja–intermedia', 'Región intermedia', 'Región intermedia–alta', 'Extremo relativamente alto'];

/** Steps are diagram positions only: they have no temperature or proportion. */
export function thermalRegion(pattern, position) {
  if (!Object.hasOwn(THERMAL_PATTERNS, pattern) || !Number.isInteger(position) || position < 0 || position > 4) return null;
  const kind = THERMAL_PATTERNS[pattern][position];
  return Object.freeze({ pattern, position: POSITIONS[position], kind, description: kind === 'T' ? 'Región de transición conceptual' : `Predominio relativo de ${kind === 'M' ? 'machos' : 'hembras'}` });
}

export const SYSTEM_IDS = Object.freeze(['xxxy', 'zzzw', 'xxx0', 'haplodiploidia', 'temperatura']);

export function validSystem(value) {
  return SYSTEM_IDS.includes(value);
}
