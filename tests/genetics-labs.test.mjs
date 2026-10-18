/** Scientific invariants and DOM behavior. These are not visual browser QA. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import { punnettCombination, thermalRegion, validSystem } from '../exposiciones/shared/genetics-models.mjs';
import { initGeneticsLabs } from '../exposiciones/shared/genetics-labs.mjs';

const directory = fileURLToPath(new URL('../', import.meta.url));
const fragments = JSON.parse(execFileSync(process.env.PYTHON || 'python3', ['-c',
  "import json,sys;sys.path.insert(0,'scripts');from expo_genetics import genetics_visual;ids=['niveles-del-desarrollo','haplodiploidia','cruces-cromosomicos','via-testicular','via-ovarica','hormonas-y-conductos','comparacion-de-sistemas','temperatura','unknown'];print(json.dumps({key:genetics_visual(key) for key in ids}))",
], { cwd: directory, encoding: 'utf8' }));

function environment(html) {
  const dom = new JSDOM(`<body class="expo-app" data-mode="estudiar">${html}</body>`, { url: 'https://vetjb.example/exposiciones/genetica/' });
  const doc = dom.window.document;
  const event = (target, type) => target.dispatchEvent(new dom.window.Event(type, { bubbles: true }));
  const change = (selector, value) => { const control = doc.querySelector(selector); control.value = value; event(control, 'change'); return control; };
  return { dom, doc, event, change };
}

test('Punnett segregation gives complementary outcomes, parental origins and one-half outcome weights', () => {
  for (const [system, outcomes, heterogametic] of [['xxxy', ['XX', 'XY'], 'Macho XY'], ['zzzw', ['ZZ', 'ZW'], 'Hembra ZW']]) {
    const combinations = [0, 1].flatMap((row) => [0, 1].map((col) => punnettCombination(system, row, col)));
    assert.equal(combinations.filter((result) => result.sex === 'Hembra').length, 2);
    assert.equal(combinations.filter((result) => result.sex === 'Macho').length, 2);
    for (const outcome of outcomes) assert.equal(combinations.filter((result) => result.complement === outcome).length, 2);
    for (const result of combinations) { assert.equal(result.heterogametic, heterogametic); assert.equal(result.theoreticalFraction, '1/2'); }
    const maternal = new Set(combinations.map((result) => result.maternal));
    const paternal = new Set(combinations.map((result) => result.paternal));
    assert.equal(maternal.size, system === 'xxxy' ? 1 : 2);
    assert.equal(paternal.size, system === 'xxxy' ? 2 : 1);
  }
  assert.equal(punnettCombination('zzzw', 1, 0).maternal, 'W');
  assert.equal(punnettCombination('zzzw', 1, 0).paternal, 'Z');
  for (const [system, row, column] of [['constructor', 0, 0], ['xxxy', -1, 0], ['xxxy', 0, 2], ['xxxy', '0', 0], ['zzzw', NaN, 0], ['zzzw', 0, Infinity]]) assert.equal(punnettCombination(system, row, column), null);
});

test('thermal patterns reverse, preserve FMF female extremes and label transitions without measured units', () => {
  assert.equal(thermalRegion('MF', 0).kind, 'M');
  assert.equal(thermalRegion('MF', 4).kind, 'F');
  assert.equal(thermalRegion('FM', 0).kind, 'F');
  assert.equal(thermalRegion('FM', 4).kind, 'M');
  assert.equal(thermalRegion('MF', 2).kind, 'T');
  assert.equal(thermalRegion('FMF', 0).kind, 'F');
  assert.equal(thermalRegion('FMF', 2).kind, 'M');
  assert.equal(thermalRegion('FMF', 4).kind, 'F');
  assert.equal(thermalRegion('FMF', 1).kind, 'T');
  assert.equal(thermalRegion('FMF', 3).kind, 'T');
  for (const [pattern, value] of [['MF', -1], ['MF', 5], ['FMF', 1.2], ['FM', '2'], ['MF', NaN], ['constructor', 0], ['MF', null]]) assert.equal(thermalRegion(pattern, value), null);
  assert.equal(validSystem('constructor'), false);
  assert.equal(validSystem('xxx0'), true);
  assert.equal(validSystem('haplodiploidia'), true);
});

test('SSR offers semantic tables, all scientific caveats and independent slide-free fragments', () => {
  const { dom, doc } = environment(Object.entries(fragments).filter(([key]) => key !== 'via-ovarica').map(([, html]) => html).join(''));
  try {
    assert.equal(fragments.unknown, '');
    assert.equal(doc.querySelectorAll('[data-genetics-lab]').length, 7);
    assert.equal(doc.querySelectorAll('section').length, 0);
    for (const table of doc.querySelectorAll('table')) {
      assert.ok(table.querySelector('caption')?.textContent);
      assert.ok(table.querySelector('th[scope="row"]'));
      assert.ok(table.querySelector('th[scope="col"]'));
    }
    assert.match(fragments['cruces-cromosomicos'], /No garantizan una proporción exacta/);
    assert.match(fragments['via-ovarica'], /eliminación experimental de Foxl2 en ratones adultos/);
    assert.match(fragments['comparacion-de-sistemas'], /machos diploides/);
    assert.match(fragments.temperatura, /No representa datos de una especie/);
    assert.doesNotMatch(fragments.temperatura, /°C|\b\d+\s*%/);
    const ids = [...doc.querySelectorAll('[id]')].map((el) => el.id);
    assert.equal(ids.length, new Set(ids).size, 'Lab fragments cannot duplicate IDs when present on the same page.');
    assert.equal(doc.querySelectorAll('.gen-print-cell').length, 8, 'Every Punnett combination has a printable text alternative when controls are hidden.');
    for (const cell of doc.querySelectorAll('.gen-punnett td')) assert.equal(cell.querySelector('button').textContent, cell.querySelector('.gen-print-cell').textContent);
  } finally { dom.window.close(); }
});

test('Punnett selections identify both parents, survive mode events and reset the full exploration', () => {
  const { dom, doc, change } = environment(fragments['cruces-cromosomicos']);
  try {
    initGeneticsLabs(doc); initGeneticsLabs(doc);
    change('[data-gen-model]', 'zzzw');
    doc.querySelector('[data-gen-cross="zzzw"] [data-row="1"][data-column="1"]').click();
    assert.equal(doc.querySelector('[data-gen-complement]').textContent, 'ZW · Hembra');
    assert.match(doc.querySelector('[data-gen-origin]').textContent, /Materno: W.*paterno: Z/);
    doc.body.dataset.mode = 'presentar';
    doc.dispatchEvent(new dom.window.CustomEvent('expo:modechange', { detail: { mode: 'presentar' } }));
    assert.equal(doc.querySelector('[data-gen-model]').value, 'zzzw');
    assert.equal(doc.querySelector('[data-gen-complement]').textContent, 'ZW · Hembra');
    change('[data-gen-model]', 'xxxy'); change('[data-gen-model]', 'zzzw');
    assert.equal(doc.querySelector('[data-gen-complement]').textContent, 'ZW · Hembra');
    doc.querySelector('[data-gen-reset]').click();
    assert.equal(doc.querySelector('[data-gen-model]').value, 'xxxy');
    assert.equal(doc.querySelector('[data-gen-complement]').textContent, 'XX · Hembra');
  } finally { dom.window.close(); }
});

test('the combined gonadal network compares both pathways and detaches listeners on destroy', () => {
  const { dom, doc } = environment(fragments['via-testicular']);
  try {
    const destroy = initGeneticsLabs(doc);
    const testis = doc.querySelector('[data-genetics-lab]');
    assert.equal(testis.querySelector('[data-gen-route-panel="testicular"]').hidden, false);
    testis.querySelector('[data-gen-route="ovarica"]').click();
    assert.equal(testis.querySelector('[data-gen-route-panel="ovarica"]').hidden, false);
    destroy();
    testis.querySelector('[data-gen-reset]').click();
    assert.equal(testis.querySelector('[data-gen-route-panel="ovarica"]').hidden, false);
    initGeneticsLabs(doc);
    assert.equal(testis.querySelector('[data-gen-route-panel="ovarica"]').hidden, false);
    testis.querySelector('[data-gen-reset]').click();
    assert.equal(testis.querySelector('[data-gen-route-panel="testicular"]').hidden, false);
  } finally { dom.window.close(); }
});

test('hormonal selections distinguish precursor conversion from cell secretion and tissue effect', () => {
  const { dom, doc } = environment(fragments['hormonas-y-conductos']);
  try {
    initGeneticsLabs(doc);
    doc.querySelector('[data-gen-hormone="dht"]').click();
    const panel = doc.querySelector('[data-gen-hormone-panel]:not([hidden])');
    assert.equal(panel.dataset.genHormonePanel, 'dht');
    assert.match(panel.textContent, /5α-reductasa/);
    assert.match(panel.textContent, /conversión local/);
    assert.match(panel.textContent, /genitales externos y próstata/i);
    doc.querySelector('[data-gen-reset]').click();
    assert.equal(doc.querySelector('[data-gen-hormone-panel]:not([hidden])').dataset.genHormonePanel, 'amh');
    assert.match(doc.querySelector('[data-gen-hormone-panel]:not([hidden])').textContent, /Regresión de los conductos de Müller/);
  } finally { dom.window.close(); }
});

test('comparison does not force XY heterogametia onto ploidy or environmental systems', () => {
  const { dom, doc, change } = environment(fragments['comparacion-de-sistemas']);
  try {
    initGeneticsLabs(doc);
    for (const system of ['haplodiploidia', 'temperatura']) {
      change('[data-gen-system]', system);
      assert.equal(doc.querySelector('[data-gen-system-panel]:not([hidden])').dataset.genSystemPanel, system);
      assert.match(doc.querySelector('.gen-selected').textContent, /No corresponde X\/Y o Z\/W/);
    }
    change('[data-gen-system]', 'xxx0');
    assert.match(doc.querySelector('[data-gen-system-panel]:not([hidden])').textContent, /autosomas siguen siendo diploides/);
    doc.querySelector('[data-gen-reset]').click();
    assert.equal(doc.querySelector('[data-gen-system]').value, 'xxxy');
  } finally { dom.window.close(); }
});

test('temperature explorer narrates relative locations, retains state and resets without temperature predictions', () => {
  const { dom, doc, change } = environment(fragments.temperatura);
  try {
    const destroy = initGeneticsLabs(doc);
    doc.querySelector('[data-gen-pattern="FMF"]').click();
    change('[data-gen-temperature]', '2');
    assert.equal(doc.querySelector('[data-gen-thermal-result]').textContent, 'Predominio relativo de machos');
    assert.equal(doc.querySelectorAll('[aria-current="true"]').length, 1);
    change('[data-gen-temperature]', '3');
    assert.equal(doc.querySelector('[data-gen-thermal-result]').textContent, 'Región de transición conceptual');
    assert.match(doc.querySelector('[data-gen-temperature]').getAttribute('aria-valuetext'), /intermedia–alta/);
    destroy(); initGeneticsLabs(doc);
    assert.equal(doc.querySelector('[data-gen-temperature]').value, '3');
    assert.equal(doc.querySelector('[data-gen-pattern="FMF"]').getAttribute('aria-pressed'), 'true');
    doc.querySelector('[data-gen-reset]').click();
    assert.equal(doc.querySelector('[data-gen-temperature]').value, '0');
    assert.equal(doc.querySelector('[data-gen-pattern="MF"]').getAttribute('aria-pressed'), 'true');
    assert.equal(doc.querySelector('[data-gen-thermal-result]').textContent, 'Predominio relativo de machos');
  } finally { dom.window.close(); }
});


test('development levels distinguish somatic and germinal roles, provide a complete static summary and keyboard selection', () => {
  const { dom, doc } = environment(fragments['niveles-del-desarrollo']);
  try {
    const lab = doc.querySelector('[data-genetics-lab]');
    const summary = lab.querySelector('.gen-static-summary');
    assert.equal(summary.querySelectorAll('tbody tr').length, 3);
    assert.match(summary.textContent, /células somáticas y germinales/);
    assert.match(summary.textContent, /Las somáticas dirigen.*las germinales originan gametos/);
    assert.match(lab.textContent, /no permite diagnosticar/);
    assert.equal(lab.querySelectorAll('button[data-gen-level] svg[aria-hidden="true"]').length, 3);
    assert.equal(lab.querySelector('.gen-source').href, 'https://reproduccionanimalesdomesticos.fmvz.unam.mx/libro/capitulo1/autores.html');
    const destroy = initGeneticsLabs(doc);
    const duplicateDestroy = initGeneticsLabs(doc);
    duplicateDestroy();
    assert.equal(lab.dataset.genReady, 'true');
    const first = lab.querySelector('[data-gen-level="cromosomas"]');
    first.focus();
    const arrow = new dom.window.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true });
    first.dispatchEvent(arrow);
    assert.equal(arrow.defaultPrevented, true);
    assert.equal(doc.activeElement.dataset.genLevel, 'gonada');
    assert.equal(lab.querySelector('[data-gen-level-panel]:not([hidden])').dataset.genLevelPanel, 'gonada');
    const end = new dom.window.KeyboardEvent('keydown', { key: 'End', bubbles: true, cancelable: true });
    doc.activeElement.dispatchEvent(end);
    assert.equal(doc.activeElement.dataset.genLevel, 'fenotipo');
    assert.equal(lab.querySelectorAll('[data-gen-level][aria-pressed="true"]').length, 1);
    doc.body.dataset.mode = 'presentar';
    doc.dispatchEvent(new dom.window.CustomEvent('expo:modechange', { detail: { mode: 'presentar' } }));
    destroy();
    lab.querySelector('[data-gen-reset]').click();
    assert.equal(lab.querySelector('[data-gen-level-panel]:not([hidden])').dataset.genLevelPanel, 'fenotipo');
    initGeneticsLabs(doc);
    assert.equal(lab.querySelector('[data-gen-level-panel]:not([hidden])').dataset.genLevelPanel, 'fenotipo');
    lab.querySelector('[data-gen-reset]').click();
    assert.equal(lab.querySelector('[data-gen-level-panel]:not([hidden])').dataset.genLevelPanel, 'cromosomas');
  } finally { dom.window.close(); }
});

test('Apis csd explorer distinguishes hemizygous, heterozygous and diploid-male cases without false probabilities', () => {
  const { dom, doc } = environment(fragments.haplodiploidia);
  try {
    const lab = doc.querySelector('[data-genetics-lab]');
    const rows = [...lab.querySelectorAll('.gen-static-summary tbody tr')].map((row) => row.textContent);
    assert.equal(rows.length, 3);
    assert.match(rows[0], /No fecundadon; A; hemicigoto en csdMacho haploide/);
    assert.match(rows[1], /Fecundado2n; A \/ B; heterocigoto en csdHembra diploide/);
    assert.match(rows[2], /Fecundado2n; A \/ A; homocigoto en csdMacho diploide/);
    assert.match(lab.textContent, /A y B son símbolos didácticos, no datos/);
    assert.match(lab.textContent, /No generalizar.*todos los himenópteros/);
    assert.doesNotMatch(lab.textContent, /\d+\s*%/);
    assert.equal(lab.querySelector('.gen-source').href, 'https://doi.org/10.1016/j.tig.2024.08.001');
    const destroy = initGeneticsLabs(doc);
    lab.querySelector('[data-gen-csd="homocigoto"]').click();
    assert.equal(lab.querySelector('[data-gen-csd-panel]:not([hidden])').dataset.genCsdPanel, 'homocigoto');
    assert.match(lab.querySelector('[data-gen-csd-panel]:not([hidden])').textContent, /2n.*A \/ A.*Macho diploide/);
    destroy(); initGeneticsLabs(doc);
    assert.equal(lab.querySelector('[data-gen-csd-panel]:not([hidden])').dataset.genCsdPanel, 'homocigoto');
    lab.querySelector('[data-gen-csd="heterocigoto"]').click();
    assert.match(lab.querySelector('[data-gen-csd-panel]:not([hidden])').textContent, /2n.*A \/ B.*Hembra diploide/);
    const current = lab.querySelector('[data-gen-csd="heterocigoto"]');
    current.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Home', bubbles: true, cancelable: true }));
    assert.equal(doc.activeElement.dataset.genCsd, 'haploide');
    lab.querySelector('[data-gen-csd="homocigoto"]').click();
    lab.querySelector('[data-gen-reset]').click();
    assert.equal(lab.querySelector('[data-gen-csd-panel]:not([hidden])').dataset.genCsdPanel, 'haploide');
    assert.equal(lab.querySelectorAll('[data-gen-csd][aria-pressed="true"]').length, 1);
  } finally { dom.window.close(); }
});
