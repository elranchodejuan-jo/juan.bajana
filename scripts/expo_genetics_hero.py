"""Original conceptual genetics cover; progressively enhanced, no external assets."""


def genetics_hero_visual():
    """Three manually selectable perspectives over a semantic SVG and text fallback."""
    return '''<div class="genetics-hero" data-genetics-hero data-stage="0" role="group" aria-labelledby="genetics-hero-title">
<div class="genetics-hero-top"><span id="genetics-hero-title">Una pregunta, tres perspectivas</span><span class="genetics-hero-tag" aria-hidden="true">GENÉTICA</span></div>
<div class="genetics-hero-stage" data-genetics-stage>
<svg class="genetics-hero-svg" viewBox="0 0 900 390" role="img" aria-labelledby="genetics-svg-title genetics-svg-desc">
<title id="genetics-svg-title">Cromosomas, desarrollo y diversidad sexual animal</title>
<desc id="genetics-svg-desc">Modelos conceptuales: XX/XY en mamíferos domésticos y ZZ/ZW en aves; gónada bipotencial con vías testicular y ovárica activas; diversidad de sistemas cromosómicos, haplodiploidía y señales ambientales. Los símbolos no representan un cariotipo real.</desc>
<g class="genetics-hero-orbits" aria-hidden="true"><ellipse cx="450" cy="195" rx="340" ry="140"/><ellipse cx="450" cy="195" rx="290" ry="105"/><path d="M75 195H825M450 28V360"/></g>
<g data-genetics-layer="0" class="genetics-hero-layer">
<rect class="genetics-hero-panel" x="80" y="65" width="330" height="255" rx="20"/>
<rect class="genetics-hero-panel" x="490" y="65" width="330" height="255" rx="20"/>
<text class="genetics-svg-heading" x="245" y="105" text-anchor="middle">Mamíferos domésticos</text>
<text class="genetics-svg-heading" x="655" y="105" text-anchor="middle">Aves</text>
<g class="genetics-chromosome" aria-hidden="true"><path d="M148 135V168M148 180V216M184 135V168M184 180V216M296 135V168M296 180V216M332 153V176M332 188V216"/><path class="genetics-chromosome-alt" d="M558 135V168M558 180V216M594 135V168M594 180V216M706 135V168M706 180V216M742 153V176M742 188V216"/></g>
<text class="genetics-svg-symbol" x="166" y="255" text-anchor="middle">XX</text><text class="genetics-svg-symbol" x="314" y="255" text-anchor="middle">XY</text>
<text class="genetics-svg-label" x="166" y="285" text-anchor="middle">Hembra</text><text class="genetics-svg-label" x="314" y="285" text-anchor="middle">Macho</text>
<text class="genetics-svg-symbol" x="576" y="255" text-anchor="middle">ZZ</text><text class="genetics-svg-symbol" x="724" y="255" text-anchor="middle">ZW</text>
<text class="genetics-svg-label" x="576" y="285" text-anchor="middle">Macho</text><text class="genetics-svg-label" x="724" y="285" text-anchor="middle">Hembra</text>
<text class="genetics-svg-detail" x="450" y="358" text-anchor="middle">Patrones habituales; la correspondencia no es absoluta.</text>
</g>
<g data-genetics-layer="1" class="genetics-hero-layer" aria-hidden="true">
<path class="genetics-hero-link" d="M450 125V155M450 155H245V185M450 155H655V185M245 248V277M655 248V277"/>
<rect class="genetics-hero-panel" x="285" y="50" width="330" height="75" rx="18"/><text class="genetics-svg-heading" x="450" y="95" text-anchor="middle">Gónada bipotencial</text>
<rect class="genetics-hero-panel" x="95" y="185" width="300" height="65" rx="15"/><text class="genetics-svg-heading" x="245" y="224" text-anchor="middle">Vía testicular</text>
<rect class="genetics-hero-panel genetics-hero-panel-alt" x="505" y="185" width="300" height="65" rx="15"/><text class="genetics-svg-heading" x="655" y="224" text-anchor="middle">Vía ovárica</text>
<text class="genetics-svg-label" x="245" y="308" text-anchor="middle">SRY · SOX9</text><text class="genetics-svg-label" x="655" y="308" text-anchor="middle">RSPO1 · WNT4 · FOXL2</text>
<text class="genetics-svg-detail" x="450" y="358" text-anchor="middle">Redes activas y señales hacia tejidos: modelo mamífero resumido.</text>
</g>
<g data-genetics-layer="2" class="genetics-hero-layer" aria-hidden="true">
<path class="genetics-hero-link" d="M450 190L220 95M450 190L680 95M450 190L182 258M450 190L450 310M450 190L718 258"/>
<circle class="genetics-hero-panel" cx="450" cy="190" r="75"/><text class="genetics-svg-heading" x="450" y="185" text-anchor="middle">Diversidad</text><text class="genetics-svg-label" x="450" y="215" text-anchor="middle">animal</text>
<rect class="genetics-hero-panel" x="125" y="55" width="190" height="74" rx="15"/><text class="genetics-svg-symbol" x="220" y="91" text-anchor="middle">XX / XY</text><text class="genetics-svg-detail" x="220" y="115" text-anchor="middle">Mamíferos</text>
<rect class="genetics-hero-panel" x="585" y="55" width="190" height="74" rx="15"/><text class="genetics-svg-symbol" x="680" y="91" text-anchor="middle">ZZ / ZW</text><text class="genetics-svg-detail" x="680" y="115" text-anchor="middle">Aves</text>
<rect class="genetics-hero-panel" x="65" y="227" width="235" height="74" rx="15"/><text class="genetics-svg-symbol" x="182" y="262" text-anchor="middle">XX / X0</text><text class="genetics-svg-detail" x="182" y="286" text-anchor="middle">Algunos insectos</text>
<rect class="genetics-hero-panel genetics-hero-panel-alt" x="335" y="295" width="230" height="74" rx="15"/><text class="genetics-svg-heading" x="450" y="328" text-anchor="middle">Haplodiploidía</text><text class="genetics-svg-detail" x="450" y="352" text-anchor="middle">Abeja melífera · csd</text>
<rect class="genetics-hero-panel genetics-hero-panel-alt" x="600" y="227" width="235" height="74" rx="15"/><text class="genetics-svg-heading" x="718" y="262" text-anchor="middle">Temperatura</text><text class="genetics-svg-detail" x="718" y="286" text-anchor="middle">Determinados reptiles</text>
</g></svg>
<canvas class="genetics-hero-canvas" data-genetics-canvas aria-hidden="true"></canvas>
</div>
<div class="genetics-hero-controls"><div class="genetics-hero-choices" role="group" aria-label="Perspectiva de genética animal"><button type="button" data-genetics-step="0" aria-pressed="true">Cromosomas</button><button type="button" data-genetics-step="1" aria-pressed="false">Desarrollo</button><button type="button" data-genetics-step="2" aria-pressed="false">Diversidad</button></div><button type="button" class="genetics-hero-motion" data-genetics-motion aria-pressed="false" aria-label="Pausar movimiento decorativo de la portada">Pausar</button></div>
<p class="genetics-hero-caption" data-genetics-caption>XX/XY y ZZ/ZW son modelos distintos de constitución cromosómica.</p>
<p class="genetics-hero-disclaimer">Elaboración propia · símbolos conceptuales, sin escala ni forma cromosómica real.</p>
<noscript><p class="genetics-hero-caption">Desarrollo: la gónada bipotencial presenta vías testicular y ovárica activas. Diversidad: los sistemas cromosómicos, la haplodiploidía y las señales ambientales difieren entre grupos animales.</p></noscript>
<p class="expo-visually-hidden" data-genetics-status role="status" aria-live="polite"></p>
</div>'''
