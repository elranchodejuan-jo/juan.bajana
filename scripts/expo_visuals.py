"""Original, server-rendered educational diagrams for VETJB.

All drawings are schematic and reusable. They contain no copied anatomy,
clinical reference intervals, treatment algorithms or patient data.
The HH chart is calculated, not hand-positioned. Runtime uses the same constants.
"""
from html import escape


def _button(label, attributes):
    return f'<button type="button" class="expo-button expo-lab-button" {attributes}>{escape(label)}</button>'


def _radio(name, value, label, checked=False):
    return f'<label><input type="radio" name="{name}" value="{value}"{" checked" if checked else ""}><span>{escape(label)}</span></label>'


def _buffer():
    choices = ''.join(_radio('buffer-load', value, label, value == 'baseline') for value, label in [
        ('baseline', 'Equilibrio'), ('acid', 'Añadir H⁺'), ('co2', 'Añadir CO₂'), ('remove', 'Retirar CO₂')])
    scripts = {
        'baseline': [
            ('Un sistema reversible', 'H⁺ + HCO₃⁻ ⇌ H₂CO₃ ⇌ CO₂ + H₂O. Las flechas representan interconversión, no cantidades.'),
            ('Amortiguar', 'El bicarbonato puede aceptar H⁺; la reacción limita el cambio de pH, sin eliminar la causa.'),
            ('Conectar órganos', 'La ventilación elimina CO₂ y el riñón conserva o repone bicarbonato. Aquí no se simulan sus velocidades.')],
        'acid': [
            ('Carga de H⁺', 'Al añadir H⁺ se favorece su unión al HCO₃⁻: el sentido mostrado es hacia CO₂ y agua.'),
            ('Usar el amortiguador', 'La amortiguación consume bicarbonato. No equivale a neutralizar una cantidad ilimitada de ácido.'),
            ('Eliminar la carga', 'El CO₂ formado puede eliminarse por ventilación. El riñón puede reponer bicarbonato mediante excreción neta de ácido.')],
        'co2': [
            ('Carga de CO₂', 'Al aumentar CO₂ se favorece la formación de ácido carbónico y su disociación: el sentido mostrado es hacia H⁺ y HCO₃⁻.'),
            ('Tendencia acidificante', 'La liberación de H⁺ tiende a reducir el pH. El bicarbonato no permanece exactamente fijo en un organismo real.'),
            ('Reconocer el límite', 'Este esquema cualitativo no calcula compensación, concentraciones ni un diagnóstico.')],
        'remove': [
            ('Retirar CO₂', 'La eliminación de CO₂ favorece la reacción hacia CO₂ y agua; se consumen H⁺ en ese sentido.'),
            ('Tendencia alcalinizante', 'Una menor disponibilidad de H⁺ tiende a elevar el pH, si se considera este sistema aislado.'),
            ('Reconocer el límite', 'La respuesta real depende de otros amortiguadores y del estado renal. Las flechas no predicen su magnitud.')],
    }
    panels = ''.join(f'<div class="expo-lab-copy" data-buffer-panel="{key}" data-buffer-step="{index}"{" hidden" if key != "baseline" or index else ""}><h3 class="expo-lab-title">{escape(title)}</h3><p>{escape(text)}</p></div>' for key, steps in scripts.items() for index, (title, text) in enumerate(steps))
    return f'''<div class="expo-lab expo-visual-lab" data-visual-lab="buffer" data-direction="reversible" aria-label="Laboratorio cualitativo bicarbonato y CO₂">
<fieldset class="expo-lab-controls expo-lab-tabs"><legend>Explora una carga cualitativa</legend>{choices}</fieldset>
<div class="expo-lab-stage"><svg class="expo-lab-svg" viewBox="0 0 720 220" role="img" aria-labelledby="buffer-visual-title buffer-visual-desc">
<title id="buffer-visual-title">Sistema amortiguador bicarbonato–CO₂</title><desc id="buffer-visual-desc">Hidrogeniones y bicarbonato se interconvierten con ácido carbónico, que se interconvierte con CO₂ y agua. Reacciones reversibles.</desc>
<rect class="lab-surface" x="16" y="44" width="210" height="108" rx="20"/><rect class="lab-surface" x="276" y="44" width="166" height="108" rx="20"/><rect class="lab-surface" x="492" y="44" width="212" height="108" rx="20"/>
<text class="lab-label" x="121" y="106" text-anchor="middle">H⁺ + HCO₃⁻</text><text class="lab-label" x="359" y="106" text-anchor="middle">H₂CO₃</text><text class="lab-label" x="598" y="106" text-anchor="middle">CO₂ + H₂O</text>
<g class="lab-line lab-buffer-forward" fill="none" stroke="currentColor" stroke-width="3"><path d="M235 82H265m-8-7 8 7-8 7M451 82H481m-8-7 8 7-8 7"/></g>
<g class="lab-line lab-buffer-reverse" fill="none" stroke="currentColor" stroke-width="3"><path d="M265 118H235m8-7-8 7 8 7M481 118H451m8-7-8 7 8 7"/></g>
<text class="lab-muted" x="360" y="190" text-anchor="middle" data-buffer-direction>Reacción reversible · sin magnitudes asignadas</text></svg></div>
<div aria-live="polite" aria-atomic="true">{panels}</div><div class="expo-lab-controls expo-actions">{_button('Paso anterior', 'data-buffer-prev disabled')}<span class="expo-lab-legend" data-buffer-position>Paso 1 de 3</span>{_button('Siguiente paso', 'data-buffer-next')}{_button('Reiniciar', 'data-buffer-reset')}</div>
<noscript><p class="expo-lab-note">Añadir H⁺ favorece el sentido hacia CO₂; añadir CO₂ favorece el sentido hacia H⁺. El esquema es cualitativo; las interacciones requieren JavaScript.</p></noscript></div>'''


def _pulmonary():
    return f'''<div class="expo-lab expo-visual-lab" data-visual-lab="pulmonary" data-motion="paused" aria-label="Modelo de ventilación alveolar relativa">
<div class="expo-lab-controls"><label for="lab-ventilation">Ventilación alveolar relativa <output for="lab-ventilation" data-vent-value>100 %</output></label><input id="lab-ventilation" data-ventilation type="range" min="50" max="150" step="5" value="100" aria-describedby="ventilation-assumptions"></div>
<div class="expo-lab-stage"><svg class="expo-lab-svg" viewBox="0 0 720 290" role="img" aria-labelledby="pulmonary-visual-title pulmonary-visual-desc">
<title id="pulmonary-visual-title">Ventilación y eliminación de CO₂</title><desc id="pulmonary-visual-desc">Esquema pulmonar conceptual, sin anatomía específica de especie. La ventilación comunica el espacio alveolar con el exterior y permite eliminar CO₂.</desc>
<path class="lab-line" d="M342 24V80L294 122M378 24V80L426 122" fill="none" stroke="currentColor" stroke-width="9" stroke-linecap="round"/>
<g class="lab-lung" data-lung><path class="lab-surface" d="M322 83C288 67 222 114 211 188C204 238 241 257 306 237C324 226 325 170 322 83Z"/><path class="lab-surface" d="M398 83C432 67 498 114 509 188C516 238 479 257 414 237C396 226 395 170 398 83Z"/>
<path class="lab-line" d="M302 123L267 160M283 144L288 184M418 123L453 160M437 144L432 184" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>
<circle class="lab-accent" cx="264" cy="170" r="16"/><circle class="lab-accent" cx="290" cy="192" r="16"/><circle class="lab-accent" cx="456" cy="170" r="16"/><circle class="lab-accent" cx="430" cy="192" r="16"/></g>
<path class="lab-flow" d="M360 171V48m-10 10 10-10 10 10" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
<text class="lab-label" x="500" y="48">CO₂ al exterior</text><text class="lab-muted" x="360" y="280" text-anchor="middle">Esquema funcional · movimiento ilustrativo</text></svg></div>
<div class="expo-lab-readout"><span>PaCO₂ del modelo</span><output class="expo-lab-output" data-vent-pco2 aria-live="polite">40,0 mmHg</output><p class="expo-lab-copy" data-vent-trend>100 % es el punto de comparación didáctico.</p></div>
<p class="expo-lab-note" id="ventilation-assumptions">PaCO₂ = 40 ÷ (ventilación / 100). Producción de CO₂ constante y estado estacionario. No representa frecuencia respiratoria ni compensación.</p>
<p class="expo-lab-note" data-vent-error role="status" hidden></p><div class="expo-lab-controls expo-actions">{_button('Reiniciar', 'data-vent-reset')}{_button('Pausar movimiento', 'data-lab-motion aria-pressed="false"')}</div>
<noscript><p class="expo-lab-note">50 % → 80,0 mmHg; 100 % → 40,0 mmHg; 150 % → 26,7 mmHg. Son escenarios calculados, no intervalos clínicos.</p></noscript></div>'''


def _renal():
    choices = ''.join(_radio('renal-function', str(i), label, i == 0) for i, label in enumerate(['1 · Conservar HCO₃⁻', '2 · Excretar ácido', '3 · Reponer base']))
    panels = [
        ('Conservar la base filtrada', 'Reabsorber el bicarbonato filtrado evita su pérdida. Por sí solo, este reciclaje no añade bicarbonato nuevo al organismo.'),
        ('Eliminar ácido en la orina', 'El ácido se excreta principalmente como NH₄⁺ y ácido titulable, por ejemplo fosfato protonado; no solo como H⁺ libre.'),
        ('Reponer bicarbonato', 'La generación de bicarbonato nuevo se acopla a la excreción neta de ácido. La pérdida urinaria de bicarbonato reduce ese balance.'),
    ]
    text = ''.join(f'<div class="expo-lab-copy" data-renal-panel="{i}"{" hidden" if i else ""}><h3 class="expo-lab-title">{escape(title)}</h3><p>{escape(description)}</p></div>' for i, (title, description) in enumerate(panels))
    return f'''<div class="expo-lab expo-visual-lab" data-visual-lab="renal" data-renal-state="0" aria-label="Tres funciones renales en el equilibrio ácido-base">
<fieldset class="expo-lab-controls expo-lab-tabs"><legend>Selecciona una función renal</legend>{choices}</fieldset>
<div class="expo-lab-stage"><svg class="expo-lab-svg" viewBox="0 0 720 300" role="img" aria-labelledby="renal-visual-title renal-visual-desc">
<title id="renal-visual-title">Conservar base y excretar ácido</title><desc id="renal-visual-desc">Diagrama funcional sin anatomía de nefrona. Un trayecto devuelve el bicarbonato filtrado a la sangre; otro excreta ácido en orina y se asocia con generación de bicarbonato nuevo.</desc>
<rect class="lab-surface" x="18" y="32" width="184" height="76" rx="16"/><rect class="lab-surface" x="268" y="32" width="184" height="202" rx="18"/><rect class="lab-surface" x="520" y="32" width="182" height="76" rx="16"/><rect class="lab-surface" x="520" y="184" width="182" height="76" rx="16"/>
<text class="lab-label" x="110" y="65" text-anchor="middle">Filtrado</text><text class="lab-muted" x="110" y="91" text-anchor="middle">HCO₃⁻</text><text class="lab-label" x="360" y="74" text-anchor="middle">Procesos</text><text class="lab-label" x="360" y="104" text-anchor="middle">tubulares</text><text class="lab-label" x="611" y="65" text-anchor="middle">Sangre</text><text class="lab-muted" x="611" y="91" text-anchor="middle">HCO₃⁻</text><text class="lab-label" x="611" y="205" text-anchor="middle">Orina</text><text class="lab-muted" x="611" y="230" text-anchor="middle">NH₄⁺ +</text><text class="lab-muted" x="611" y="253" text-anchor="middle">ácido titulable</text>
<g class="lab-line lab-renal-path lab-active" data-renal-flow="0" fill="none" stroke="currentColor" stroke-width="4"><path d="M206 70H258m-9-8 9 8-9 8M456 70H510m-9-8 9 8-9 8"/></g>
<g class="lab-line lab-renal-path" data-renal-flow="1" fill="none" stroke="currentColor" stroke-width="4"><path d="M456 219H510m-9-8 9 8-9 8"/></g>
<g class="lab-line lab-renal-path" data-renal-flow="2" fill="none" stroke="currentColor" stroke-width="4"><path d="M360 142H482V90H510m-9-8 9 8-9 8"/><path d="M360 167V219H510m-9-8 9 8-9 8" stroke-dasharray="5 5"/></g>
<text class="lab-muted" x="360" y="284" text-anchor="middle">Funciones conectadas · sin escala anatómica ni flujo cuantificado</text></svg></div>
<div aria-live="polite" aria-atomic="true">{text}</div><div class="expo-lab-controls expo-actions">{_button('Reiniciar', 'data-renal-reset')}</div>
<noscript><p class="expo-lab-note">Excretar NH₄⁺ y ácido titulable permite eliminar ácido; la generación de bicarbonato nuevo está ligada a la excreción neta de ácido.</p></noscript></div>'''


def _point(hco3, pco2):
    return 74 + (pco2 - 10) / 90 * 570, 300 - (hco3 - 4) / 44 * 270


def simulator_visual():
    """Exact iso-pH chart, with the initial marker at HCO3 24 / PCO2 40."""
    lines = []
    for index, ph in enumerate([6.8, 7.0, 7.2, 7.4, 7.6, 7.8]):
        slope = .03 * 10 ** (ph - 6.1)
        start = max(10, 4 / slope)
        end = min(100, 48 / slope)
        x1, y1 = _point(start * slope, start)
        x2, y2 = _point(end * slope, end)
        label_x, label_y = (x2 + 12, y2 + 7) if abs(end - 100) < 1e-8 else (x2, y2 - 10)
        anchor = 'start' if abs(end - 100) < 1e-8 else 'middle'
        lines.append(f'<g class="lab-isoph lab-isoph-{index}" data-isoph="{ph:.1f}"><path d="M{x1:.3f} {y1:.3f}L{x2:.3f} {y2:.3f}" fill="none" stroke="currentColor" stroke-width="2"/><text class="lab-isoph-label" x="{label_x:.3f}" y="{label_y:.3f}" text-anchor="{anchor}">{str(f"{ph:.1f}").replace(".", ",")}</text></g>')
    ticks = []
    for value in [10, 25, 40, 55, 70, 85, 100]:
        x, _ = _point(4, value)
        ticks.append(f'<path class="lab-grid" d="M{x:.3f} 30V300" stroke="currentColor"/><text class="lab-axis-label" x="{x:.3f}" y="324" text-anchor="middle">{value}</text>')
    for value in [4, 12, 24, 36, 48]:
        _, y = _point(value, 10)
        ticks.append(f'<path class="lab-grid" d="M74 {y:.3f}H644" stroke="currentColor"/><text class="lab-axis-label" x="60" y="{y+7:.3f}" text-anchor="end">{value}</text>')
    x, y = _point(24, 40)
    return f'''<div class="expo-lab expo-visual-lab expo-phase-lab" data-visual-lab="phase" aria-label="Mapa de bicarbonato, PCO₂ y pH calculado">
<div class="expo-lab-stage"><svg class="expo-lab-svg" viewBox="0 0 720 370" role="img" aria-labelledby="phase-visual-title phase-visual-desc">
<title id="phase-visual-title">Mapa de Henderson–Hasselbalch</title><desc id="phase-visual-desc">Eje horizontal PCO₂ de 10 a 100 mmHg. Eje vertical bicarbonato de 4 a 48 mmol por litro. Cada línea une combinaciones con el mismo pH calculado: 6,8; 7,0; 7,2; 7,4; 7,6 y 7,8. El punto inicial representa 24 mmol por litro y 40 mmHg, pH aproximado 7,40.</desc>
<rect class="lab-surface" x="74" y="30" width="570" height="270"/>{''.join(ticks)}{''.join(lines)}
<path class="lab-axis" d="M74 30V300H644" fill="none" stroke="currentColor" stroke-width="2"/>
<text class="lab-axis-title" x="360" y="358" text-anchor="middle">PCO₂ (mmHg)</text><text class="lab-axis-title" x="20" y="170" text-anchor="middle" transform="rotate(-90 20 170)">HCO₃⁻ (mmol/L)</text>
<g data-phase-point><path class="lab-phase-guide" data-phase-guides d="M74 {y:.3f}H{x:.3f}V300" fill="none" stroke="currentColor" stroke-dasharray="4 5"/><circle class="lab-phase-halo" cx="{x:.3f}" cy="{y:.3f}" r="13" data-phase-halo/><circle class="lab-phase-marker" cx="{x:.3f}" cy="{y:.3f}" r="6" data-phase-marker/></g></svg></div>
<p class="expo-lab-readout" data-phase-readout aria-live="polite">Base / CO₂ disuelto = 20,0 : 1 · pH 7,40</p><p class="expo-lab-legend">Líneas = igual pH calculado. Cociente HCO₃⁻ / (0,03 × PCO₂). No son intervalos clínicos.</p></div>'''


def visual_for(scene_id):
    """Return an original visual or an empty string for scenes without a lab."""
    return {'bicarbonato-co2': _buffer, 'regulacion-pulmonar': _pulmonary, 'regulacion-renal': _renal}.get(scene_id, lambda: '')()
