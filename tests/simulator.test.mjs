import test from 'node:test';
import assert from 'node:assert/strict';
import { MODEL, evaluateAcidBase } from '../exposiciones/shared/simulator.mjs';

const close = (actual, expected, tolerance = 1e-10) => assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} ≠ ${expected} ± ${tolerance}`);

test('documented constants and independently tabulated numerical checkpoints', () => {
  assert.equal(MODEL.pKa, 6.1);
  assert.equal(MODEL.alpha, 0.03);
  close(evaluateAcidBase(24, 40).pH, 7.401029995663981);
  close(evaluateAcidBase(12, 32).pH, 7.196910013008056);
  close(evaluateAcidBase(12, 50).pH, 7.003089986991943);
  close(evaluateAcidBase(36, 48).pH, 7.497940008672037);
});

test('doubling bicarbonate increases pH by log10(2); doubling PCO2 decreases it', () => {
  const baseline = evaluateAcidBase(24, 40).pH;
  close(evaluateAcidBase(48, 40).pH - baseline, 0.3010299956639812);
  close(evaluateAcidBase(24, 80).pH - baseline, -0.3010299956639812);
  assert.equal(evaluateAcidBase(12, 40).trend, 'menor');
  assert.equal(evaluateAcidBase(24, 20).trend, 'mayor');
});

test('equal ratios preserve pH without inferring normality or a diagnosis', () => {
  const baseline = evaluateAcidBase(24, 40);
  const parallelChanges = evaluateAcidBase(12, 20);
  close(parallelChanges.pH, baseline.pH);
  assert.equal(parallelChanges.trend, 'igual');
  assert.equal('diagnosis' in parallelChanges, false);
});

test('empty, nonnumeric, nonfinite, zero, negative and out-of-bound values have no pH', () => {
  for (const bad of ['', '  ', 'abc', NaN, Infinity, -Infinity, 'Infinity', null, undefined, false, [], 0, -1, 3.99, 48.01, 24.01]) {
    const result = evaluateAcidBase(bad, 40);
    assert.equal(result.valid, false, `HCO3 accepted ${String(bad)}`);
    assert.equal(result.pH, null);
    assert.ok(result.errors.hco3);
  }
  for (const bad of ['', 'bad', 0, -2, 9.99, 100.01, 40.05, NaN, Infinity]) {
    const result = evaluateAcidBase(24, bad);
    assert.equal(result.valid, false, `PCO2 accepted ${String(bad)}`);
    assert.equal(result.pH, null);
    assert.ok(result.errors.pco2);
  }
});

test('both inclusive interface limits and decimals remain finite', () => {
  for (const hco3 of [4, '4.0', 24.1, 48]) {
    for (const pco2 of [10, 40.1, '100']) {
      const result = evaluateAcidBase(hco3, pco2);
      assert.equal(result.valid, true);
      assert.ok(Number.isFinite(result.pH));
    }
  }
});
