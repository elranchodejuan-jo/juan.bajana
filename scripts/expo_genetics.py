"""Original accessible genetics explorers, rendered before JavaScript runs.

These diagrams summarize cited relationships. They do not simulate a clinical
phenotype, temperature threshold, developmental time or individual probability.
"""
from html import escape


def _button(label, attributes=''):
    return f'<button type="button" class="gen-button" {attributes}>{escape(label)}</button>'


def _reset():
    return _button('Reiniciar', 'data-gen-reset')


def _source(label, doi_or_url):
    url = doi_or_url if doi_or_url.startswith('https://') else f'https://doi.org/{doi_or_url}'
    return f'<a class="gen-source" href="{escape(url)}">{escape(label)}</a>'



def _icon(kind):
    """Small decorative outlines; visible control labels carry their meaning."""
    paths = {
        'chromosomes': '<path d="m6 4 6 16M12 4 6 20M16 5l4 14M20 5l-4 14"/>',
        'gonad': '<ellipse cx="12" cy="12" rx="9" ry="7"/><circle cx="9" cy="11" r="2"/><circle cx="15" cy="13" r="2"/>',
        'phenotype': '<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6M7 10h6M10 7v6"/>',
        'egg': '<path d="M19 14c0 5-3 7-7 7s-7-2-7-7S9 3 12 3s7 6 7 11Z"/>',
        'alleles': '<path d="M5 4v16M10 4v16M15 4v16M20 4v16M5 8h5M15 8h5M5 16h5M15 16h5"/>',
        'bee': '<ellipse cx="12" cy="14" rx="5" ry="7"/><path d="M8 11h8M7 15h10M9 19h6M9 7 7 3M15 7l2-4"/><path d="M7 10C1 4 1 14 7 15M17 10c6-6 6 4 0 5"/>',
    }
    return f'<svg class="gen-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">{paths[kind]}</svg>'


def _icon_button(label, icon, attributes):
    return f'<button type="button" class="gen-button gen-icon-button" {attributes}>{_icon(icon)}<span>{escape(label)}</span></button>'


def _summary_table(caption, headings, rows):
    header = ''.join(f'<th scope="col">{escape(item)}</th>' for item in headings)
    body = ''
    for row in rows:
        cells = f'<th scope="row">{escape(row[0])}</th>'
        cells += ''.join(f'<td>{escape(value)}</td>' for value in row[1:])
        body += f'<tr>{cells}</tr>'
    return f'<div class="gen-static-summary"><table class="gen-table"><caption>{escape(caption)}</caption><thead><tr>{header}</tr></thead><tbody>{body}</tbody></table></div>'


LEVELS = [
    ('cromosomas', 'Cromosomas', 'chromosomes', 'Constitución cromosómica', 'XX y XY describen el complemento sexual típico de los mamíferos domésticos. La constitución cromosómica es uno de los niveles del desarrollo.'),
    ('gonada', 'Gónada', 'gonad', 'Organización gonadal', 'La gónada bipotencial reúne células somáticas y germinales. Las somáticas dirigen su organización testicular u ovárica; las germinales originan gametos.'),
    ('fenotipo', 'Fenotipo', 'phenotype', 'Características del animal', 'Conductos, genitales y otros rasgos resultan de la diferenciación de los tejidos. Influyen señales hormonales, receptores y regulación local.'),
]


def _development():
    choices = ''.join(_icon_button(name, icon, f'data-gen-level="{key}" aria-pressed="{str(key == "cromosomas").lower()}"') for key, name, icon, *_ in LEVELS)
    panels = ''.join(f'<div data-gen-level-panel="{key}"{" hidden" if key != "cromosomas" else ""}><h3 class="gen-heading">{title}</h3><p>{detail}</p></div>' for key, _, _, title, detail in LEVELS)
    summary = _summary_table('Tres niveles del desarrollo sexual mamífero', ['Nivel', 'Qué describe'], [(name, detail) for _, name, _, _, detail in LEVELS])
    return f'''<div class="genetics-lab" data-genetics-lab="development" aria-label="Tres niveles del desarrollo sexual mamífero">
<div class="gen-interactive"><div class="gen-toolbar"><p class="gen-kicker">Selecciona un nivel</p>{_reset()}</div><div class="gen-level-choices" role="group" aria-label="Nivel del desarrollo">{choices}</div><div class="gen-result gen-level-detail" aria-live="polite" aria-atomic="true">{panels}</div></div>
{summary}<p class="gen-note">Son niveles relacionados, no equivalentes. Este esquema no permite diagnosticar el desarrollo sexual de un individuo.</p><p class="gen-small">Modelo mamífero. {_source('Díaz-Hernández et al., UNAM, 2021', 'https://reproduccionanimalesdomesticos.fmvz.unam.mx/libro/capitulo1/autores.html')}.</p></div>'''


HAPLOID_CASES = [
    ('haploide', 'No fecundado', 'egg', 'No fecundado', 'n', 'A', 'Hemicigoto en csd', 'Macho haploide'),
    ('heterocigoto', 'Fecundado · A ≠ B', 'alleles', 'Fecundado', '2n', 'A / B', 'Heterocigoto en csd', 'Hembra diploide'),
    ('homocigoto', 'Fecundado · A = A', 'alleles', 'Fecundado', '2n', 'A / A', 'Homocigoto en csd', 'Macho diploide'),
]


def _haplodiploidy():
    choices = ''.join(_icon_button(label, icon, f'data-gen-csd="{key}" aria-pressed="{str(key == "haploide").lower()}"') for key, label, icon, *_ in HAPLOID_CASES)
    panels = []
    for key, _, _, fertilization, ploidy, alleles, state, result in HAPLOID_CASES:
        panels.append(f'''<div data-gen-csd-panel="{key}"{" hidden" if key != "haploide" else ""}><div class="gen-path gen-csd-path"><div class="gen-node">{_icon('egg')}<strong>{fertilization}</strong><span>Origen del huevo</span></div><span class="gen-relation">complemento →</span><div class="gen-node"><strong class="gen-ploidy">{ploidy} · {alleles}</strong><span>{state}</span></div><span class="gen-relation">desarrollo →</span><div class="gen-node">{_icon('bee')}<strong>{result}</strong></div></div></div>''')
    summary = _summary_table('Relación entre ploidía y csd en Apis mellifera', ['Huevo', 'Ploidía / csd', 'Resultado'], [(fertilization, f'{ploidy}; {alleles}; {state.lower()}', result) for _, _, _, fertilization, ploidy, alleles, state, result in HAPLOID_CASES])
    return f'''<div class="genetics-lab" data-genetics-lab="haplodiploidy" aria-label="Ploidía y determinación complementaria en la abeja melífera">
<div class="gen-interactive"><div class="gen-toolbar"><div class="gen-choices" role="group" aria-label="Fecundación y combinación de csd">{choices}</div>{_reset()}</div><div aria-live="polite" aria-atomic="true">{''.join(panels)}</div></div>
{summary}<p class="gen-note"><em>Apis mellifera</em>: la diploidía no garantiza una hembra; también importa <em>csd</em>. No generalizar este mecanismo a todos los himenópteros.</p><p class="gen-small">A y B son símbolos didácticos, no datos de alelos muestreados. {_source('Seiler et al., 2024', '10.1016/j.tig.2024.08.001')}.</p></div>'''


def _punnett():
    panels = []
    for key, title, maternal, paternal, heterogametic in [
        ('xxxy', 'Mamíferos domésticos · XX/XY', ['X', 'X'], ['X', 'Y'], 'Macho XY'),
        ('zzzw', 'Aves · ZZ/ZW', ['Z', 'W'], ['Z', 'Z'], 'Hembra ZW'),
    ]:
        rows = []
        for r, mother in enumerate(maternal):
            cells = []
            for c, father in enumerate(paternal):
                complement = mother + father if key == 'xxxy' else father + mother
                sex = 'Hembra' if complement in ('XX', 'ZW') else 'Macho'
                attrs = f'data-gen-cell data-row="{r}" data-column="{c}" aria-pressed="{str(r == 0 and c == 0).lower()}" aria-label="Óvulo {mother}; espermatozoide {father}: {complement}, {sex.lower()} en el modelo"'
                cells.append(f'<td>{_button(complement + " · " + sex, attrs)}<span class="gen-print-cell">{complement} · {sex}</span></td>')
            rows.append(f'<tr><th scope="row">Óvulo {mother}</th>{"".join(cells)}</tr>')
        header = ''.join(f'<th scope="col">Espermatozoide {s}</th>' for s in paternal)
        panels.append(f'''<div data-gen-cross="{key}"{" hidden" if key != "xxxy" else ""}>
<table class="gen-table gen-punnett"><caption>{title}</caption><thead><tr><th scope="col">Origen del gameto</th>{header}</tr></thead><tbody>{''.join(rows)}</tbody></table>
<p class="gen-small">Heterogametia: <strong>{heterogametic}</strong>. Los gametos idénticos se repiten para formar la cuadrícula; no son tipos adicionales.</p></div>''')
    return f'''<div class="genetics-lab" data-genetics-lab="punnett" aria-label="Cruces cromosómicos teóricos">
<div class="gen-toolbar"><label>Modelo <select data-gen-model><option value="xxxy">Mamíferos · XX/XY</option><option value="zzzw">Aves · ZZ/ZW</option></select></label>{_reset()}</div>
<div class="gen-columns"><div>{''.join(panels)}</div><div class="gen-result" aria-live="polite" aria-atomic="true"><p class="gen-kicker">Combinación elegida</p><p class="gen-complement" data-gen-complement>XX · Hembra</p><p data-gen-origin>Materno: X (óvulo) + paterno: X (espermatozoide).</p><p data-gen-fraction>XX = 1/2; XY = 1/2 en el modelo ideal.</p></div></div>
<p class="gen-note">Probabilidades teóricas bajo segregación y fecundación equivalentes. No garantizan una proporción exacta en una camada ni permiten predecir el sexo de un individuo.</p>
<noscript><p class="gen-note">En aves: óvulos Z o W de la hembra ZW y espermatozoides Z del macho ZZ → ZZ = 1/2 y ZW = 1/2. Los botones requieren JavaScript.</p></noscript></div>'''


def _network(scene_id):
    default = 'testicular' if scene_id == 'via-testicular' else 'ovarica'
    testicular = f'''<div data-gen-route-panel="testicular"{" hidden" if default != "testicular" else ""}>
<div class="gen-path"><div class="gen-node"><strong>SRY</strong><span>Señal del modelo XY</span></div><span class="gen-relation">favorece regulación →</span><div class="gen-node"><strong>SOX9</strong><span>Programa testicular</span></div><span class="gen-relation">favorece diferenciación →</span><div class="gen-node"><strong>Sertoli</strong><span>Células de soporte</span></div></div>
<p class="gen-description gen-study-detail">SRY favorece la activación de SOX9 y la diferenciación de la línea de Sertoli dentro de una red reguladora más amplia.</p>
<p class="gen-small">Regulación y diferenciación: {_source('Ridnik et al., 2021', '10.1159/000519244')}.</p></div>'''
    ovarian = f'''<div data-gen-route-panel="ovarica"{" hidden" if default != "ovarica" else ""}>
<div class="gen-ovarian-path"><div class="gen-path"><div class="gen-node"><strong>RSPO1 / WNT4</strong></div><span class="gen-relation">favorecen señalización →</span><div class="gen-node"><strong>β-catenina</strong></div><span class="gen-relation">contribuye a →</span><div class="gen-node"><strong>Programa ovárico</strong></div></div><p class="gen-branch"><strong>FOXL2</strong> · regulación activa y mantenimiento de la identidad ovárica</p></div>
<p class="gen-description gen-study-detail">La vía ovárica requiere regulación activa. Estos componentes cooperan; no constituyen una secuencia universal ni exhaustiva.</p>
<p class="gen-small">Desarrollo: {_source('Nicol et al., 2022', '10.3389/fcell.2022.944776')}. Evidencia de mantenimiento: eliminación experimental de Foxl2 en ratones adultos, {_source('Uhlenhaut et al., 2009', '10.1016/j.cell.2009.11.021')}; no cambio sexual espontáneo normal en hembras domésticas.</p></div>'''
    return f'''<div class="genetics-lab" data-genetics-lab="network" data-gen-default="{default}" aria-label="Explorador de redes gonadales de mamíferos">
<div class="gen-toolbar"><div class="gen-choices" role="group" aria-label="Vía gonadal">{_button('Vía testicular', f'data-gen-route="testicular" aria-pressed="{str(default == "testicular").lower()}"')}{_button('Vía ovárica', f'data-gen-route="ovarica" aria-pressed="{str(default == "ovarica").lower()}"')}</div>{_reset()}</div>
<div aria-live="polite" aria-atomic="true">{testicular}{ovarian}</div>
<p class="gen-note">Esquema funcional simplificado de mamíferos, sin cronología universal. Las conexiones rotuladas indican regulación, no un diagnóstico ni una predicción de fenotipo.</p>
<noscript><p class="gen-note">Vía testicular: SRY–SOX9–Sertoli. Vía ovárica activa: RSPO1/WNT4/β-catenina y FOXL2. La comparación interactiva requiere JavaScript.</p></noscript></div>'''


HORMONES = [
    ('amh', 'AMH', 'Sertoli fetales', 'Conductos de Müller', 'Regresión de los conductos de Müller', 'La AMH no mantiene los conductos de Wolff ni sustituye a los andrógenos.', 'secreción →', 'efecto tisular →'),
    ('testosterona', 'Testosterona', 'Leydig fetales', 'Conductos de Wolff', 'Desarrollo de derivados de Wolff', 'Los derivados incluyen epidídimo, conducto deferente y glándulas vesiculares en las especies que las poseen.', 'secreción →', 'efecto tisular →'),
    ('dht', 'DHT', 'Testosterona', 'Genitales externos y próstata', 'Diferenciación masculina de genitales externos y próstata', 'La 5α-reductasa convierte localmente testosterona en DHT; no es una secreción de las células de Sertoli.', 'conversión local →', 'efecto tisular →'),
]


def _hormones():
    panels = []
    for key, name, origin, target, effect, detail, first, second in HORMONES:
        sublabel = '5α-reductasa · DHT' if key == 'dht' else name
        panels.append(f'''<div data-gen-hormone-panel="{key}"{" hidden" if key != "amh" else ""}>
<div class="gen-path"><div class="gen-node"><strong>{origin}</strong><span>Origen / precursor</span></div><span class="gen-relation{ ' gen-conversion' if key == 'dht' else ''}">{first}<small>{sublabel}</small></span><div class="gen-node"><strong>{target}</strong><span>Tejido diana</span></div><span class="gen-relation">{second}</span><div class="gen-node"><strong>{effect}</strong></div></div>
<p class="gen-description">{detail}</p></div>''')
    choices = ''.join(_button(name, f'data-gen-hormone="{key}" aria-pressed="{str(key == "amh").lower()}"') for key, name, *_ in HORMONES)
    return f'''<div class="genetics-lab" data-genetics-lab="hormones" aria-label="Señales, tejidos y efectos del desarrollo mamífero">
<div class="gen-toolbar"><div class="gen-choices" role="group" aria-label="Señal hormonal">{choices}</div>{_reset()}</div><div aria-live="polite" aria-atomic="true">{''.join(panels)}</div>
<p class="gen-note">Conexiones rotuladas: secreción, conversión hormonal y efecto tisular. La respuesta requiere tejidos y receptores funcionales; AMH y andrógenos no son intercambiables.</p>
<p class="gen-small">Esquema funcional mamífero; sin escala anatómica. {_source('Díaz-Hernández et al., UNAM, 2021', 'https://reproduccionanimalesdomesticos.fmvz.unam.mx/libro/capitulo1/autores.html')}.</p>
<noscript><p class="gen-note">AMH (Sertoli) → regresión de Müller. Testosterona (Leydig) → derivados de Wolff. DHT (conversión local por 5α-reductasa) → genitales externos masculinos y próstata.</p></noscript></div>'''


SYSTEMS = [
    ('xxxy', 'XX/XY', 'Mamíferos domésticos', 'Masculina: XY', 'Constitución cromosómica y red reguladora; SRY favorece la vía testicular en el modelo típico.', 'Hembra XX, macho XY es el patrón habitual; pueden existir diferencias del desarrollo sexual.'),
    ('zzzw', 'ZZ/ZW', 'Aves', 'Femenina: ZW', 'Constitución cromosómica; la dosis de DMRT1 contribuye a la determinación gonadal del pollo.', 'No es SRY invertido. El cromosoma W no es un interruptor ovárico universal.'),
    ('xxx0', 'XX/X0', 'Algunos insectos', 'Masculina: X0', 'Complemento de cromosomas sexuales: hembra XX y macho X0 en el patrón descrito.', '0 indica ausencia de un segundo cromosoma sexual; los autosomas siguen siendo diploides.'),
    ('haplodiploidia', 'Haplodiploidía', 'Abeja melífera', 'No corresponde X/Y o Z/W', 'Machos habitualmente haploides y hembras diploides; en Apis mellifera también interviene el locus csd.', 'La homocigosis en csd puede originar machos diploides. No extrapolar csd a todos los himenópteros.'),
    ('temperatura', 'Temperatura', 'Determinados reptiles', 'No corresponde X/Y o Z/W', 'Condiciones térmicas durante un periodo sensible del desarrollo embrionario.', 'Los patrones dependen de especie y condiciones. No ocurre en todos los reptiles.'),
]


def _comparison():
    options = ''.join(f'<option value="{key}">{name}</option>' for key, name, *_ in SYSTEMS)
    rows = ''.join(f'<tr data-gen-system-row="{key}" class="{"gen-selected" if key == "xxxy" else ""}"><th scope="row">{name}</th><td>{example}</td><td>{hetero}</td></tr>' for key, name, example, hetero, *_ in SYSTEMS)
    panels = ''.join(f'<div data-gen-system-panel="{key}"{" hidden" if key != "xxxy" else ""}><h3 class="gen-heading">{name}</h3><p><strong>Señal inicial:</strong> {signal}</p><p><strong>Límite:</strong> {limit}</p></div>' for key, name, _, _, signal, limit in SYSTEMS)
    fallback = ''.join(f'<li><strong>{name}:</strong> {signal} {limit}</li>' for _, name, _, _, signal, limit in SYSTEMS[1:])
    return f'''<div class="genetics-lab" data-genetics-lab="comparison" aria-label="Comparador de sistemas de determinación sexual">
<div class="gen-toolbar"><label>Sistema <select data-gen-system>{options}</select></label>{_reset()}</div>
<div class="gen-columns gen-comparison"><table class="gen-table"><caption>Sistemas: ejemplo y heterogametia</caption><thead><tr><th scope="col">Sistema</th><th scope="col">Ejemplo</th><th scope="col">Heterogametia</th></tr></thead><tbody>{rows}</tbody></table><div class="gen-result" aria-live="polite" aria-atomic="true">{panels}</div></div>
<noscript><ul class="gen-fallback">{fallback}</ul></noscript></div>'''


def _temperature():
    patterns = {'MF': ['M', 'M', '↔', 'F', 'F'], 'FM': ['F', 'F', '↔', 'M', 'M'], 'FMF': ['F', '↔', 'M', '↔', 'F']}
    rows = []
    for key, regions in patterns.items():
        cells = ''.join(f'<td data-gen-thermal-cell="{i}" class="gen-thermal-{value if value in ("M", "F") else "transition"}"><span aria-label="{ "Transición conceptual" if value == "↔" else "Predominio relativo de " + ("machos" if value == "M" else "hembras") }">{value}</span></td>' for i, value in enumerate(regions))
        rows.append(f'<tr data-gen-pattern-row="{key}" class="{"gen-selected" if key == "MF" else ""}"><th scope="row">{key}</th>{cells}</tr>')
    choices = ''.join(_button(key, f'data-gen-pattern="{key}" aria-pressed="{str(key == "MF").lower()}"') for key in patterns)
    return f'''<div class="genetics-lab" data-genetics-lab="temperature" aria-label="Patrones térmicos conceptuales">
<div class="gen-toolbar"><div class="gen-choices" role="group" aria-label="Patrón al aumentar la temperatura">{choices}</div>{_reset()}</div>
<div class="gen-columns"><div><table class="gen-table gen-thermal-table"><caption>Menor temperatura relativa → mayor</caption><thead><tr><th scope="col">Patrón</th><th scope="col">Baja</th><th scope="col">↗</th><th scope="col">Media</th><th scope="col">↗</th><th scope="col">Alta</th></tr></thead><tbody>{''.join(rows)}</tbody></table><p class="gen-small">M = macho · F = hembra · ↔ = transición. Predominio relativo, sin porcentajes.</p></div>
<div class="gen-result"><label for="gen-temperature-position">Temperatura relativa</label><input id="gen-temperature-position" data-gen-temperature type="range" min="0" max="4" step="1" value="0" aria-valuetext="Extremo relativamente bajo: predominio relativo de machos" aria-describedby="gen-temperature-note"><div class="gen-range-labels"><span>Menor</span><span>Mayor</span></div><div aria-live="polite" aria-atomic="true"><p class="gen-heading" data-gen-thermal-position>Extremo relativamente bajo</p><p data-gen-thermal-result>Predominio relativo de machos</p></div></div></div>
<p class="gen-note" id="gen-temperature-note">Esquema conceptual de patrones térmicos. No representa datos de una especie ni establece temperaturas de incubación.</p>
<p class="gen-small">Importan el periodo sensible y las condiciones de exposición. No todos los reptiles presentan este mecanismo.</p></div>'''


def genetics_visual(scene_id):
    """Return a fragment for one genetics scene, or an empty string."""
    if scene_id in ('via-testicular', 'via-ovarica'):
        return _network(scene_id)
    return {
        'niveles-del-desarrollo': _development,
        'haplodiploidia': _haplodiploidy,
        'cruces-cromosomicos': _punnett,
        'hormonas-y-conductos': _hormones,
        'comparacion-de-sistemas': _comparison,
        'temperatura': _temperature,
    }.get(scene_id, lambda: '')()
