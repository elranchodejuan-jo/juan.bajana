import test from 'node:test';
import assert from 'node:assert/strict';
import { exposureFromRecordedDose, weightDifference } from '../exposiciones/shared/pharmacology-models.mjs';

test('historical exposure preserves separate components and units', () => {
  const result = exposureFromRecordedDose(20, 2, [200, 40]);
  assert.deepEqual(result.components, [{ mg: 400, mgKg: 20 }, { mg: 80, mgKg: 4 }]);
  assert.equal(result.totalMg, 480);
  assert.equal(result.totalMgKg, 24);
});

test('same recorded administration at higher weight has lower mg per kg without changing mg', () => {
  const initial = exposureFromRecordedDose(21.6, 3, [200, 40]);
  const final = exposureFromRecordedDose(22, 3, [200, 40]);
  assert.equal(initial.totalMg, final.totalMg);
  assert.ok(final.totalMgKg < initial.totalMgKg);
  const change = weightDifference(21.6, 22);
  assert.ok(Math.abs(change.kg - .4) < 1e-10);
  assert.ok(Math.abs(change.percentage - 1.85185185185185) < 1e-10);
});

test('invalid operands never return clinically plausible numerical output', () => {
  for (const bad of [0, -1, NaN, Infinity, '', '22', null, undefined]) {
    assert.equal(exposureFromRecordedDose(bad, 3, [200, 40]), null);
    assert.equal(exposureFromRecordedDose(22, bad, [200, 40]), null);
    assert.equal(exposureFromRecordedDose(22, 3, [bad, 40]), null);
    assert.equal(weightDifference(bad, 22), null);
  }
});
