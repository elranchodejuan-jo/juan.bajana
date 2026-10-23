"""Source-bound educational widgets for the documented Ares case."""
import html
import json

def esc(value):
    return html.escape(str(value), quote=True)

def pharmacology_visual(scene):
    spec = scene.get('pharmacologyLab', {})
    kind = spec.get('kind')
    if kind == 'dose':
        concentrations = spec['concentrations']
        volume = spec['volume']
        cards = ''.join(f'<article><h3>{esc(name)}</h3><p>{esc(value)} mg/mL × {esc(volume)} mL</p><strong>{value * volume:g} mg</strong><p data-component-mgkg>{value * volume / 21.6:.2f} mg/kg</p></article>' for name, value in zip(spec['names'], concentrations))
        return f'''<div class="pharma-dose" data-pharma-dose data-volume="{volume}" data-concentrations="{esc(json.dumps(concentrations))}"><div class="pharma-dose-control"><label for="ares-dose-weight">Peso usado para comparar</label><select id="ares-dose-weight"><option value="21.6">21,60 kg · peso inicial del cálculo</option><option value="22">22,00 kg · control 15/10/2026</option></select><p>Volumen histórico: <strong>{volume:g} mL por administración</strong></p></div><div class="pharma-dose-cards">{cards}</div><p class="pharma-dose-equation">({'+'.join(str(v * volume) for v in concentrations)} mg) ÷ <span data-dose-weight>21,60</span> kg</p><output data-dose-result aria-live="polite">{sum(concentrations) * volume / 21.6:.2f} mg/kg de la combinación por administración</output><p class="expo-small">Reconstrucción matemática de la pauta reportada. Cambiar el peso no modifica el volumen histórico ni propone una nueva pauta.</p></div>'''
    if kind == 'mechanism':
        controls = ''.join(f'<button type="button" class="expo-button" data-pharma-select aria-pressed="{str(i == 0).lower()}">{esc(s["label"])}</button>' for i,s in enumerate(spec['steps']))
        steps = ''.join(f'<article data-pharma-step><p class="pharma-mechanism-flow">{esc(s["flow"])}</p><h3>{esc(s["title"])}</h3><p>{esc(s["text"])}</p></article>' for s in spec['steps'])
        return f'<div class="pharma-mechanism" data-pharma-stepper><div class="expo-actions">{controls}</div><div class="pharma-mechanism-stage" aria-live="polite">{steps}</div></div>'
    if kind == 'photos':
        items = ''.join(f'<figure><img src="{esc(p["src"])}" alt="{esc(p["alt"])}" width="{p["width"]}" height="{p["height"]}" loading="lazy"><button type="button" class="expo-button" data-enlarge data-src="{esc(p["src"])}" data-alt="{esc(p["alt"])}" data-caption="{esc(p["caption"])}">Ampliar foto {i+1}</button><figcaption>{esc(p["caption"])}</figcaption></figure>' for i,p in enumerate(spec['photos']))
        return f'<div class="pharma-photos">{items}</div><p class="expo-small">Fotografías reales aportadas por el tutor. El aspecto macroscópico no identifica por sí solo la etiología.</p>'
    if kind == 'weight':
        return '''<div class="pharma-weight"><div><span>Inicial</span><strong>21,60 kg</strong><div class="pharma-weight-bar" style="--bar:86.4%"></div></div><div><span>Control final referido · 15/10/2026</span><strong>22,00 kg</strong><div class="pharma-weight-bar" style="--bar:88%"></div></div><p class="pharma-weight-scale">Barras desde cero · escala común de 0 a 25 kg</p><p class="pharma-weight-delta">+0,40 kg <span>≈ 1,85 % del peso inicial</span></p><p>El tutor describe una recuperación completa. No se dispone de una escala clínica seriada ni de controles analíticos finales para cuantificarla.</p></div>'''
    return ''
