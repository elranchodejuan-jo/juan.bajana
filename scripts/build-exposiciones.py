#!/usr/bin/env python3
"""Generate static study/presentation pages from reviewed JSON; no dependencies."""
import argparse
import hashlib
import html
import json
import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from expo_visuals import visual_for, simulator_visual
from expo_hero import hero_visual
from expo_genetics import genetics_visual
from expo_genetics_hero import genetics_hero_visual

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / 'exposiciones'
CONTENT = BASE / 'content'
SUBJECTS = json.loads((BASE/'subjects.json').read_text(encoding='utf8'))
SLUG = re.compile(r'^[a-z0-9]+(?:-[a-z0-9]+)*$')
LAYOUTS = {'cover', 'figure', 'compare', 'steps', 'simulator', 'case', 'quiz', 'closing', 'references', 'default'}

def esc(value):
    return html.escape(str(value), quote=True)

def local_path(value):
    if not isinstance(value, str) or not value.startswith('/exposiciones/') or '?' in value or '#' in value:
        raise ValueError('Los recursos deben usar rutas locales /exposiciones/.')
    target = (ROOT / value.lstrip('/')).resolve()
    if not target.is_relative_to(BASE.resolve()) or '..' in Path(value).parts:
        raise ValueError('Ruta de recurso insegura.')
    return target

def validate(data, *, published=False):
    for key in ('id', 'subject', 'slug', 'title', 'summary', 'authors', 'status', 'cover', 'scenes', 'references'):
        if key not in data:
            raise ValueError(f'Falta {key}.')
    for key in ('id', 'slug'):
        if not SLUG.fullmatch(data[key]):
            raise ValueError(f'{key} no válido.')
    if data['subject'] not in SUBJECTS or data['status'] not in ('draft', 'published'):
        raise ValueError('Materia o estado no válido.')
    if published and (not data['title'].strip() or not data['summary'].strip() or not data['authors'] or not data['scenes'] or not data['references']):
        raise ValueError('Un contenido publicado necesita título, resumen, autoría, escenas y referencias.')
    if data['cover']:
        path = local_path(data['cover'])
        if published and not path.is_file():
            raise ValueError(f'Portada inexistente: {path}')
    elif published:
        raise ValueError('Portada requerida.')
    ids = set()
    refs = {int(r['id']) for r in data['references']}
    if len(refs) != len(data['references']):
        raise ValueError('Referencias duplicadas.')
    for ref in data['references']:
        if not str(ref['url']).startswith('https://'):
            raise ValueError('Referencia sin URL HTTPS.')
    for scene in data['scenes']:
        if not SLUG.fullmatch(scene['id']) or scene['id'] in ids:
            raise ValueError('Identificador de escena inválido o duplicado.')
        ids.add(scene['id'])
        for alias in scene.get('aliases', []):
            if not SLUG.fullmatch(alias) or alias in ids:
                raise ValueError('Alias de escena inválido o duplicado.')
            ids.add(alias)
        if scene.get('layout', 'default') not in LAYOUTS:
            raise ValueError('Componente desconocido.')
        if not set(scene.get('references', [])) <= refs:
            raise ValueError('Cita sin referencia.')
        if scene.get('figure') and not local_path(scene['figure']).is_file():
            raise ValueError('Figura inexistente.')
    for resource in data.get('resources', []):
        if not local_path(resource['path']).is_file():
            raise ValueError('Material descargable inexistente.')
    return data

def route(data):
    return f"/exposiciones/{data['subject']}/{data['slug']}/"

def icon(name):
    return f'<svg class="expo-icon" aria-hidden="true"><use href="/assets/icons.svg#{esc(name)}"></use></svg>'

def button(label, attrs='', primary=False):
    return f'<button type="button" class="expo-button{" expo-button-primary" if primary else ""}" {attrs}><span data-control-label>{label}</span></button>'

def asset_url(path, *, root=ROOT):
    """Invalidate a browser's cached resource whenever its bytes change."""
    if not path.startswith('/exposiciones/') or '?' in path or '#' in path or '..' in Path(path).parts:
        raise ValueError('Ruta de recurso versionado inválida.')
    digest = hashlib.sha256((root / path.lstrip('/')).read_bytes()).hexdigest()[:16]
    return f'{path}?v={digest}'

def module_imports(*, root=ROOT):
    """Map normalized module URLs, including relative and dynamic imports."""
    shared = root / 'exposiciones/shared'
    vendor = root / 'exposiciones/vendor'
    modules = {*shared.rglob('*.mjs'), *vendor.rglob('*.mjs'), *vendor.rglob('*.esm.js')}
    return {f'/{path.relative_to(root).as_posix()}': asset_url(f'/{path.relative_to(root).as_posix()}', root=root)
            for path in sorted(modules)}

def head(title, description, subject='fisiopatologia', *, extra_styles=(), exposition=''):
    imports = json.dumps({'imports': module_imports()}, separators=(',', ':')).replace('<', '\\u003c')
    styles = ''.join(f'<link rel="stylesheet" href="{esc(asset_url(path))}">' for path in extra_styles)
    return f'''<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>{esc(title)} · VETJB</title><meta name="description" content="{esc(description)}"><meta name="color-scheme" content="dark light"><link rel="icon" href="/assets/favicon.png"><link rel="stylesheet" href="{esc(asset_url('/exposiciones/shared/expo.css'))}">{styles}<script type="importmap">{imports}</script></head><body class="expo-app" data-subject="{esc(subject)}" data-exposition="{esc(exposition)}" data-mode="estudiar" data-theme="dark"><a class="expo-skip" href="#contenido">Saltar al contenido</a><noscript><p class="expo-wrap expo-small">Modo lectura: el contenido y los razonamientos están disponibles. Activa JavaScript para presentar y usar los ejercicios interactivos.</p></noscript>'''

def site_header(subject=None):
    back = f'<a href="/exposiciones/{subject}/">{esc(SUBJECTS[subject]["title"])}</a>' if subject else ''
    return f'<header class="expo-site-header"><a class="expo-brand" href="/" aria-label="Juan Bajaña, inicio">JB<span>_</span></a><nav aria-label="Ruta de navegación"><a href="/exposiciones/">EXPOSICIONES</a>{back}</nav>{button("Tema claro", "data-theme-toggle")}</header>'

def scripts():
    return f'<script type="module" src="{esc(asset_url("/exposiciones/shared/experience.mjs"))}"></script></body></html>'

def citations(scene):
    refs = scene.get('references', [])
    return '<p class="expo-sources">Fuentes: ' + ', '.join(f'<a href="#ref-{r}">[{r}]</a>' for r in refs) + '.</p>' if refs else ''

def numbered_visual_sources(markup, data, scene):
    """Resolve widget source URLs against the lesson's canonical references."""
    by_url = {ref['url']: ref for ref in data['references']}
    def replace(match):
        url = html.unescape(match.group(1))
        ref = by_url.get(url)
        if ref is None or ref['id'] not in scene.get('references', []):
            raise ValueError(f'Fuente visual no incluida en las citas de {scene["id"]}: {url}')
        return f'<a class="gen-source" href="#ref-{ref["id"]}" aria-label="Referencia {ref["id"]}">[{ref["id"]}]</a>'
    return re.sub(r'<a class="gen-source" href="([^"]+)">[^<]*</a>', replace, markup)

def paragraphs(value):
    if isinstance(value, str):
        value = [value]
    return ''.join(f'<p>{esc(p)}</p>' for p in value or [])

def inline_genetics_svg(path, prefix):
    """Embed our reviewed local SVGs so their colors inherit the active theme."""
    if not path.startswith('/exposiciones/assets/figuras/genetica/determinacion-sexual/'):
        raise ValueError('Solo se integran figuras originales de esta exposición.')
    ET.register_namespace('', 'http://www.w3.org/2000/svg')
    svg = ET.fromstring(local_path(path).read_text(encoding='utf8'))
    ids = {el.attrib['id']: f'{prefix}-{el.attrib["id"]}' for el in svg.iter() if 'id' in el.attrib}
    for el in svg.iter():
        if el.tag.split('}')[-1] in ('script', 'foreignObject', 'style'):
            raise ValueError('Elemento activo no permitido en una figura.')
        for name, value in list(el.attrib.items()):
            if name.lower().startswith('on') or (name.split('}')[-1] == 'href' and not value.startswith('#')):
                raise ValueError('Recurso externo o evento no permitido en una figura.')
            if name == 'id':
                value = ids[value]
            elif name in ('aria-labelledby', 'aria-describedby'):
                value = ' '.join(ids.get(item, item) for item in value.split())
            else:
                for old, new in ids.items():
                    value = value.replace(f'url(#{old})', f'url(#{new})')
                if value.startswith('#') and value[1:] in ids:
                    value = '#' + ids[value[1:]]
            el.set(name, value)
    svg.set('id', prefix)
    svg.set('class', 'gen-figure-svg')
    return ET.tostring(svg, encoding='unicode')

def figure(scene):
    src = esc(scene['figure'])
    alt = esc(scene.get('figure_alt', scene['title']))
    if scene['figure'].startswith('/exposiciones/assets/figuras/genetica/determinacion-sexual/'):
        identifier = 'gen-figure-' + scene['id']
        drawing = inline_genetics_svg(scene['figure'], identifier)
        return f'<figure class="expo-figure gen-svg-figure">{drawing}{button("Ampliar esquema", f"data-enlarge data-inline-figure=\"{identifier}\"")}<figcaption>{esc(scene.get("caption", "Esquema conceptual original."))}</figcaption></figure>'
    return f'<figure class="expo-figure"><img src="{src}" alt="{alt}" width="720" height="480">{button("Ampliar esquema", f"data-enlarge data-src=\"{src}\" data-alt=\"{alt}\"")}<figcaption>{esc(scene.get("caption", "Esquema funcional original; no representa anatomía específica."))}</figcaption></figure>'

def simulator():
    return '''<form class="expo-simulator" data-simulator novalidate><div class="expo-sim-controls">
<label for="hco3-number">HCO₃⁻ <small>mmol/L</small></label><input id="hco3-number" type="number" min="4" max="48" step="0.1" value="24" inputmode="decimal" aria-describedby="sim-error"><input id="hco3-range" type="range" min="4" max="48" step="0.1" value="24" aria-label="Ajustar bicarbonato">
<label for="pco2-number">PCO₂ <small>mmHg</small></label><input id="pco2-number" type="number" min="10" max="100" step="0.1" value="40" inputmode="decimal" aria-describedby="sim-error"><input id="pco2-range" type="range" min="10" max="100" step="0.1" value="40" aria-label="Ajustar presión de CO₂">
<p id="sim-error" role="status" aria-live="polite"></p><div class="expo-actions"><button type="reset" class="expo-button">Reiniciar</button><button type="button" class="expo-button" data-preset data-hco3="12" data-pco2="32">HCO₃⁻ reducido</button><button type="button" class="expo-button" data-preset data-hco3="27" data-pco2="60">CO₂ retenido</button></div></div>
<div class="expo-sim-result"><span>pH calculado</span><output id="sim-ph" aria-live="polite">7,401</output><p id="sim-trend">Punto didáctico de comparación.</p><p class="expo-equation">pH ≈ 6,1 + log₁₀[HCO₃⁻ / (0,03 × PCO₂)]</p><p class="expo-small">A 37 °C; 0,03 en mmol·L⁻¹·mmHg⁻¹. Límites de exploración, no intervalos clínicos.</p></div></form><p class="expo-caution">Simulación educativa simplificada. No sustituye la interpretación clínica veterinaria.</p><noscript><p>Ejemplos calculados: 24/40 → pH 7,40; 12/32 → 7,20; 27/60 → 7,28. El simulador requiere JavaScript.</p></noscript>'''

def case_component(case):
    cid = esc(case['id'])
    rows = ''.join(f'<tr><th scope="row">{esc(k)}</th><td>{esc(v)}</td></tr>' for k, v in case['values'].items())
    choices = ''.join(f'<label><input type="radio" name="case-{cid}" value="{i}"> <span>{esc(c["label"])}</span></label><p class="expo-feedback" data-option-feedback="{i}" hidden>{esc(c["feedback"])}</p>' for i, c in enumerate(case['options']))
    steps = ''.join(f'<article data-step hidden><h3>{i + 1}. {esc(s["title"])}</h3><p>{esc(s["text"])}</p></article>' for i, s in enumerate(case['steps']))
    static = ''.join(f'<p><strong>{esc(s["title"])}</strong> {esc(s["text"])}</p>' for s in case['steps'])
    return f'''<form data-case class="expo-case" data-correct-index="{case['correct']}"><div class="expo-scene-grid"><div><p class="expo-study-only">{esc(case['history'])}</p><p class="expo-present-only">{esc(case.get('short_history',case['history']))}</p><p class="expo-small">{esc(case['sample'])} · Escenario didáctico construido.</p><table class="expo-case-data"><caption>Datos para interpretar</caption><tbody>{rows}</tbody></table></div><div><fieldset><legend>{esc(case['question'])}</legend><div class="expo-choices">{choices}</div></fieldset><div class="expo-actions">{button('Comprobar', 'data-case-check', True)}{button('Paso anterior', 'data-case-prev')}{button('Revelar siguiente paso', 'data-case-next')}<button type="reset" class="expo-button">Reiniciar caso</button></div><div class="expo-case-steps" data-case-steps aria-live="polite">{steps}</div></div></div></form><details class="expo-study-only"><summary>Lectura del razonamiento completo</summary>{static}</details>'''

def quiz_component(questions):
    items = []
    for i, q in enumerate(questions):
        choices = ''.join(f'<label><input type="radio" name="quiz-{i}" value="{j}"><span>{esc(c)}</span></label>' for j, c in enumerate(q['options']))
        items.append(f'<fieldset data-question data-answer="{q["correct"]}" id="pregunta-{i+1}"><legend>{i+1}. {esc(q["question"])}</legend><div class="expo-choices">{choices}</div><p class="expo-feedback" data-feedback hidden>{esc(q["feedback"])}</p></fieldset>')
    return f'<form data-quiz class="expo-quiz">{"".join(items)}<div class="expo-actions expo-present-only">{button("Pregunta anterior", "data-quiz-prev")}<span data-quiz-position></span>{button("Pregunta siguiente", "data-quiz-next")}</div><div class="expo-actions">{button("Evaluar respuestas", "data-quiz-check", True)}<button type="reset" class="expo-button">Reiniciar preguntas</button><output data-quiz-score aria-live="polite"></output></div></form><p class="expo-small">Resultado individual en este navegador. No se solicitan ni envían datos.</p><noscript><details><summary>Respuestas razonadas</summary>{"".join(paragraphs(q["feedback"]) for q in questions)}</details></noscript>'

def scene_html(scene, data, i):
    layout = scene.get('layout', 'default')
    acid_base_visuals = data['subject'] == 'fisiopatologia' and data['slug'] == 'equilibrio-acido-base'
    genetics = data['subject'] == 'genetica' and data['slug'] == 'cromosomas-y-determinacion-sexual'
    title_tag = 'h1' if genetics and layout == 'cover' else 'h2'
    heading_icon = ''
    if genetics:
        name = 'clipboard-list' if scene['id'] == 'autoevaluacion' else 'book-open' if layout in ('cover', 'references') else 'paw-print' if scene['id'] in ('aves-y-dmrt1', 'diversidad-en-peces', 'freemartinismo', 'desarrollo-sexual-canino') else 'chart-no-axes-combined'
        heading_icon = icon(name) + ' '
    heading = f'<header class="expo-scene-heading"><p class="expo-eyebrow">{heading_icon}{esc(SUBJECTS[data["subject"]]["title"])} · {i+1:02d}</p><{title_tag}>{esc(scene["title"])}</{title_tag}><p class="expo-lead">{esc(scene.get("summary", ""))}</p></header>'
    bullets = '<ul class="expo-points">' + ''.join(f'<li>{esc(p)}</li>' for p in scene.get('bullets', [])) + '</ul>' if scene.get('bullets') else ''
    equation = f'<p class="expo-equation">{esc(scene["equation"])}</p>' if scene.get('equation') else ''
    copy = f'<div class="expo-scene-copy">{bullets}{equation}</div>'
    lab = visual_for(scene['id']) if acid_base_visuals else genetics_visual(scene['id']) if genetics else ''
    if genetics and lab:
        lab = numbered_visual_sources(lab, data, scene)
    if layout == 'cover':
        body = copy
    elif layout == 'simulator':
        body = '<div class="expo-simulator-stage">' + simulator() + simulator_visual() + '</div>'
    elif layout == 'case':
        body = case_component(scene['case'])
    elif layout == 'quiz':
        body = quiz_component(data['quiz'])
    elif layout == 'references':
        mode_control = ' data-view-mode="estudiar"' if genetics else ''
        body = f'<div class="expo-present-only"><p class="expo-lead">Fuentes universitarias, artículos veterinarios y bibliografía trazable.</p><p>Las citas numeradas acompañan cada apartado.</p><a class="expo-button expo-button-primary" href="?modo=estudiar#{esc(scene["id"])}"{mode_control}>Abrir las {len(data["references"])} referencias completas</a></div><ol class="expo-references expo-study-only">' + ''.join(f'<li id="ref-{r["id"]}" value="{r["id"]}"><p>{esc(r["citation"])}</p><a href="{esc(r["url"])}" target="_blank" rel="noopener noreferrer">{esc(r["url"])}</a><p class="expo-small">{esc(r.get("scope", ""))}</p></li>' for r in data['references']) + '</ol>'
    elif lab:
        body = lab + f'<div class="expo-study-only expo-lab-context">{copy}{figure(scene) if scene.get("figure") else ""}</div>'
    elif layout == 'compare':
        body = '<div class="expo-comparison">' + ''.join(f'<article><h3>{esc(c["title"])}</h3>{paragraphs(c["text"])}</article>' for c in scene.get('comparison', [])) + '</div>' + equation
    elif layout == 'steps':
        body = '<ol class="expo-process">' + ''.join(f'<li>{esc(p)}</li>' for p in scene.get('bullets', [])) + '</ol>' + equation
    elif scene.get('figure'):
        body = f'<div class="expo-scene-grid">{copy}{figure(scene)}</div>'
    else:
        body = copy
    if layout == 'cover':
        body = '<div class="expo-cover-layout"><div class="expo-cover-copy">' + body
        body += f'<p class="expo-author">{esc(", ".join(data["authors"]))}<br><span>Estudiante de Medicina Veterinaria · UTMACH</span></p><a class="expo-button expo-button-primary" href="#{esc(data["scenes"][1]["id"])}">Comenzar a explorar {icon("chevron-right")}</a>'
        cover_art = hero_visual() if acid_base_visuals else genetics_hero_visual() if genetics else figure(scene) if scene.get('figure') else ''
        body += '</div>' + cover_art + '</div>'
    if layout == 'references' and data.get('slug') == 'equilibrio-acido-base':
        body += '<p class="expo-credits expo-small">Referentes de interacción: <a href="https://andreerogel1997-bit.github.io/amc-vetatlas/" target="_blank" rel="noopener noreferrer">AMC VetAtlas · Andreé</a> y <a href="https://clinicaveterinariavinyo.com/" target="_blank" rel="noopener noreferrer">Clínica Veterinaria Vinyo</a>. Gráficos y código de esta experiencia creados para VETJB. Las referencias no implican colaboración ni aval.</p>'
    if layout == 'closing' or (layout == 'references' and data.get('downloadsAt') == scene['id']):
        body += '<div class="expo-actions">' + ''.join(f'<a class="expo-button" href="{esc(asset_url(r["path"]))}" download>{esc(r["label"])}</a>' for r in data.get('resources', [])) + '</div>'
    if layout == 'references' and data.get('credits'):
        body += '<div class="expo-study-only expo-credits"><h3>Figuras y procedencia</h3>' + paragraphs(data['credits']) + '</div>'
    expanded = f'<div class="expo-study-only expo-explanation"><h3>Para profundizar</h3>{paragraphs(scene.get("explanation"))}</div>' if scene.get('explanation') else ''
    aliases = ''.join(f'<span id="{esc(alias)}" class="expo-scene-alias" aria-hidden="true"></span>' for alias in scene.get('aliases', []))
    return f'<section class="expo-scene" id="{esc(scene["id"])}" data-layout="{layout}" aria-label="{esc(scene["title"])}">{aliases}{heading}{body}{expanded}{citations(scene)}<aside class="notes">{paragraphs(scene.get("notes", ""))}</aside></section>'

def dialogs(data):
    index = ''.join(f'<li><a href="#{esc(s["id"])}">{i+1:02d} · {esc(s["title"])}</a></li>' for i,s in enumerate(data['scenes']))
    return f'''<dialog class="expo-dialog" id="expo-index" aria-labelledby="index-title"><h2 id="index-title">Índice de la exposición</h2>{button('Cerrar índice', 'data-dialog-close')}<ol>{index}</ol></dialog>
<dialog class="expo-dialog" id="expo-share" aria-labelledby="share-title"><h2 id="share-title">Compartir este apartado</h2>{button('Cerrar compartir', 'data-dialog-close')}<label for="expo-share-url">Enlace</label><input type="url" id="expo-share-url" readonly>{button('Copiar enlace', 'data-copy-link')}<div id="expo-qr"></div><p data-copy-status role="status"></p><p class="expo-small">El QR se genera en tu dispositivo. Un enlace local solo funciona donde se ejecuta el servidor.</p></dialog>
<dialog class="expo-dialog expo-dialog-figure" id="expo-figure" aria-label="Esquema ampliado">{button('Cerrar figura', 'data-dialog-close')}<img alt=""></dialog>'''

def build_expo(data):
    url = route(data)
    extra_styles = ['/exposiciones/shared/genetics.css', '/exposiciones/shared/genetics-ambient.css', '/exposiciones/shared/genetics-layout.css'] if data['subject'] == 'genetica' and data['slug'] == 'cromosomas-y-determinacion-sexual' else []
    toolbar = f'''<div id="expo-toolbar" class="expo-toolbar" aria-label="Herramientas de la exposición"><a href="/exposiciones/" class="expo-back">{icon('chevron-left')} Biblioteca</a><div class="expo-actions"><nav class="expo-mode-switch" aria-label="Formato de la exposición"><a class="expo-button" href="?modo=estudiar" data-view-mode="estudiar" aria-current="true">Página</a><a class="expo-button" href="?modo=presentar" data-view-mode="presentar">Diapositivas</a></nav>{button('Tema claro', 'data-theme-toggle')}{button('Pausar movimiento', 'data-motion-toggle')}{button('Índice', 'data-index-open')}{button('Compartir', 'data-share-open')}<span class="expo-present-only">{button('Notas', 'data-speaker')}{button('Pantalla completa', 'data-fullscreen')}</span></div></div>'''
    nav = f'<nav class="expo-navigation expo-present-only" aria-label="Controles de presentación">{button("Anterior", "data-prev")}<span data-progress aria-live="polite"></span>{button("Siguiente", "data-next")}</nav>'
    toc = '<details class="expo-study-only expo-study-index"><summary>Índice de lectura</summary><ol>' + ''.join(f'<li><a href="#{esc(s["id"])}">{esc(s["title"])}</a></li>' for s in data['scenes']) + '</ol></details>'
    body = head(data['title'], data['summary'], data['subject'], extra_styles=extra_styles, exposition=data['slug']) + site_header(data['subject']) + toolbar + '<main id="contenido">' + toc + '<div id="expo-deck" class="reveal"><div class="slides">' + ''.join(scene_html(s, data, i) for i,s in enumerate(data['scenes'])) + '</div></div></main>' + nav + dialogs(data) + scripts()
    path = ROOT / url.lstrip('/') / 'index.html'
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(body, encoding='utf8')

def card(data):
    url=route(data)
    cover_alt = data.get('cover_alt') or data.get('scenes', [{}])[0].get('figure_alt') or data['title']
    cover = inline_genetics_svg(data['cover'], 'gen-card-' + data['slug']) if data['cover'].startswith('/exposiciones/assets/figuras/genetica/determinacion-sexual/') else f'<img src="{esc(data["cover"])}" alt="{esc(cover_alt)}" width="720" height="480">'
    return f'''<article class="expo-card" data-expo-card data-title="{esc(data['title'])}" data-subject="{esc(data['subject'])}"><figure>{cover}</figure><div class="expo-card-copy"><p class="expo-eyebrow">{esc(SUBJECTS[data['subject']]['title'])}</p><h2>{esc(data['title'])}</h2><p>{esc(data['summary'])}</p><p class="expo-small">{esc(', '.join(data['authors']))}</p><div class="expo-actions"><a class="expo-button expo-button-primary" href="{url}?modo=presentar">{icon('play')} Presentar</a><a class="expo-button" href="{url}?modo=estudiar">Estudiar {icon('chevron-right')}</a>{button('Compartir', f'data-share-open data-share-url="{url}?modo=estudiar"')}</div></div></article>'''

def catalog(items, subject=None):
    title=SUBJECTS[subject]['title'] if subject else 'EXPOSICIONES'
    desc=SUBJECTS[subject]['summary'] if subject else 'De la explicación al razonamiento clínico. Exposiciones interactivas para presentar y volver a estudiar.'
    choices='<option value="">Todas las materias</option>'+''.join(f'<option value="{k}">{v["title"]}</option>' for k,v in SUBJECTS.items())
    search=f'<form class="expo-catalog-tools" data-catalog-search role="search"><label for="expo-search">Buscar una exposición<input id="expo-search" type="search" placeholder="Busca por título…" autocomplete="off"></label><label for="expo-subject">Materia<select id="expo-subject" name="materia">{choices}</select></label></form>' if not subject else ''
    filtered=[d for d in items if not subject or d['subject']==subject]
    categories='<nav class="expo-subject-links" aria-label="Materias">'+''.join(f'<a href="/exposiciones/{k}/">{v["title"]} {icon("chevron-right")}</a>' for k,v in SUBJECTS.items())+'</nav>'
    content=''.join(card(d) for d in filtered) if filtered else '<div class="expo-empty"><h2>Todavía no hay exposiciones publicadas</h2><p>El tema de la próxima exposición de Genética aún no está definido.</p><a href="/exposiciones/">Volver a exposiciones disponibles</a></div>'
    body=head(title,desc,subject or 'fisiopatologia')+site_header()+f'<main class="expo-wrap" id="contenido"><header class="expo-hero"><p class="expo-eyebrow">VETJB / Biblioteca académica</p><h1>{title}</h1><p>{desc}</p></header>{categories}{search}<p class="expo-small" data-catalog-count>{len(filtered)} exposición disponible</p><div class="expo-catalog">{content}</div><p class="expo-empty" data-catalog-empty hidden>No hay coincidencias. Prueba otro título o materia.</p><footer class="expo-footer">Juan José Bajaña Chuno · Estudiante de Medicina Veterinaria, UTMACH.<br>Material educativo con referencias consultables.</footer></main>'+dialogs({'scenes':[]})+scripts()
    path=BASE/(subject or '')/'index.html';path.parent.mkdir(parents=True,exist_ok=True);path.write_text(body,encoding='utf8')

def create_draft(subject, slug, directory=None):
    if subject not in SUBJECTS or not SLUG.fullmatch(slug):
        raise ValueError('Materia o slug no válido: usa minúsculas, números y guiones simples.')
    directory=Path(directory) if directory else CONTENT
    directory.mkdir(parents=True,exist_ok=True)
    target=directory/f'{subject}--{slug}.json'
    if target.exists() or (BASE/subject/slug).exists():
        raise ValueError('El contenido o la ruta ya existe; no se sobrescribe.')
    data={'id':f'{subject}-{slug}','subject':subject,'slug':slug,'title':'','summary':'','authors':['Juan José Bajaña Chuno'],'status':'draft','cover':'','scenes':[],'references':[],'resources':[]}
    with target.open('x',encoding='utf8') as f:json.dump(data,f,ensure_ascii=False,indent=2)
    return target

def build():
    items=[];ids=set();routes=set()
    for p in sorted(CONTENT.glob('*.json')):
        d=json.loads(p.read_text(encoding='utf8'));validate(d,published=d.get('status')=='published')
        if d['id'] in ids or route(d) in routes:raise ValueError('Identificador o ruta duplicada.')
        ids.add(d['id']);routes.add(route(d))
        if d['status']=='published':items.append(d)
    for d in items:build_expo(d)
    catalog(items)
    for subject in SUBJECTS:catalog(items,subject)
    (BASE/'catalog.json').write_text(json.dumps([{k:d[k] for k in ('id','subject','slug','title','summary','authors','status','cover')} for d in items],ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    print(f'{len(items)} exposición(es) publicadas generadas; borradores excluidos.')

if __name__=='__main__':
    ap=argparse.ArgumentParser(description=__doc__);sub=ap.add_subparsers(dest='command');sub.add_parser('build');new=sub.add_parser('new');new.add_argument('--subject',required=True);new.add_argument('--slug',required=True);args=ap.parse_args()
    try:
        if args.command=='new':print(create_draft(args.subject,args.slug))
        else:build()
    except (ValueError,KeyError,TypeError) as e:ap.exit(1,f'Error de contenido: {e}\n')
