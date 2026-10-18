"""Original SVG/Canvas visual for the acid-base introduction; no external assets."""


def hero_visual():
    """Return an accessible, progressively enhanced conceptual illustration."""
    return '''<div class="expo-hero-visual" role="group" data-hero data-stage="0" aria-labelledby="hero-visual-title">
<div class="expo-hero-visual-top"><span id="hero-visual-title">Un equilibrio, tres perspectivas</span><span class="expo-hero-live" aria-hidden="true">MAPA VIVO</span></div>
<div class="expo-hero-stage" data-hero-stage>
<span class="expo-hero-type" aria-hidden="true">pH</span>
<canvas class="expo-hero-field" data-hero-canvas aria-hidden="true"></canvas>
<svg class="expo-hero-svg" viewBox="0 0 900 430" role="img" aria-labelledby="hero-svg-title hero-svg-description">
<title id="hero-svg-title">Integración del equilibrio ácido-base</title>
<desc id="hero-svg-description">Mapa conceptual: el metabolismo aporta ácidos; pulmones y riñones participan en la regulación. La relación entre bicarbonato y dióxido de carbono se refleja en el pH. Las figuras son simbólicas.</desc>
<defs><linearGradient id="hero-organism-fill" x1="0" x2="1"><stop stop-color="var(--hero-cyan)" stop-opacity=".08"/><stop offset="1" stop-color="var(--hero-cyan)" stop-opacity=".24"/></linearGradient><linearGradient id="hero-kidney-fill" x1="0" x2="1"><stop stop-color="var(--hero-copper)" stop-opacity=".06"/><stop offset="1" stop-color="var(--hero-copper)" stop-opacity=".24"/></linearGradient></defs>
<g class="expo-hero-orbits" aria-hidden="true"><ellipse cx="450" cy="218" rx="294" ry="112"/><ellipse cx="450" cy="218" rx="325" ry="146"/><path d="M100 218H800M450 45V390"/></g>
<g class="expo-hero-layer" data-hero-layer="0">
<path class="hero-organism" data-morph-path="" d="M202 251 Q176 244 162 216 L172 190 Q185 221 216 220 L257 184 Q284 163 330 163 L514 165 L549 137 L577 117 L593 76 L615 111 L654 123 L691 143 L676 165 L642 170 L616 192 L594 255 L578 318 L558 318 L562 262 L501 250 L447 273 L429 319 L404 319 L417 263 L324 258 L282 293 L272 319 L247 319 L247 285 L262 251 L220 254Z"/>
<path class="hero-connection" data-morph-path="" d="M285 222C320 178 382 182 420 212S505 251 553 217"/>
<circle class="hero-node" cx="429" cy="216" r="42"/>
<text class="hero-symbol" x="429" y="225" text-anchor="middle">pH</text>
<path class="hero-guide" d="M280 84L327 158M707 222L598 222M469 350L469 270"/>
<text class="hero-label" x="205" y="66">Metabolismo</text><text class="hero-label" x="680" y="218">Ventilación</text><text class="hero-label" x="469" y="382" text-anchor="middle">Función renal</text>
<circle class="hero-marker" cx="328" cy="160" r="5"/><circle class="hero-marker" cx="598" cy="222" r="5"/><circle class="hero-marker hero-marker-copper" cx="469" cy="270" r="5"/>
</g>
<g class="expo-hero-layer" data-hero-layer="1" aria-hidden="true">
<path class="hero-organism" data-morph-path="" d="M258 110C232 104 189 130 176 190C165 239 182 282 220 284C245 285 259 260 259 234Z M278 110C303 104 348 130 361 190C373 239 354 282 316 284C291 285 277 260 277 234Z"/>
<path class="hero-lung-branch" data-morph-path="" d="M268 70V181M268 151L228 190L210 230M268 151L307 191L326 230M229 190L231 234M307 191L305 235"/>
<path class="hero-kidney" data-morph-path="" d="M584 121C541 104 526 146 532 195C537 237 567 270 595 248C617 230 582 216 580 194C577 173 616 137 584 121Z M676 121C719 104 734 146 728 195C723 237 693 270 665 248C643 230 678 216 680 194C683 173 644 137 676 121Z"/>
<path class="hero-kidney-line" data-morph-path="" d="M589 189L612 215V284M672 190L650 215V284"/>
<path class="hero-guide" d="M375 205H419M480 205H521"/>
<circle class="hero-node" cx="450" cy="205" r="31"/><text class="hero-symbol hero-symbol-small" x="450" y="214" text-anchor="middle">pH</text>
<text class="hero-label" x="268" y="335" text-anchor="middle">Pulmones · CO₂</text><text class="hero-label" x="632" y="335" text-anchor="middle">Riñones · HCO₃⁻ / H⁺</text>
<text class="hero-detail" x="268" y="365" text-anchor="middle">Ventilación alveolar</text><text class="hero-detail" x="632" y="365" text-anchor="middle">Conservación de base y excreción de ácido</text>
</g>
<g class="expo-hero-layer" data-hero-layer="2" aria-hidden="true">
<circle class="hero-reservoir" data-morph-path="" cx="226" cy="193" r="92"/><circle class="hero-reservoir hero-reservoir-copper" data-morph-path="" cx="674" cy="193" r="92"/>
<path class="hero-connection" data-morph-path="" d="M320 193H405M495 193H580"/>
<circle class="hero-node" cx="450" cy="193" r="48"/><text class="hero-symbol" x="450" y="205" text-anchor="middle">pH</text>
<text class="hero-formula" x="226" y="195" text-anchor="middle">HCO₃⁻</text><text class="hero-detail" x="226" y="228" text-anchor="middle">Componente de base</text>
<text class="hero-formula hero-formula-copper" x="674" y="195" text-anchor="middle">PCO₂</text><text class="hero-detail" x="674" y="228" text-anchor="middle">Componente respiratorio</text>
<text class="hero-label" x="450" y="334" text-anchor="middle">El pH depende de la relación entre ambos.</text>
<text class="hero-detail" x="450" y="367" text-anchor="middle">Una cifra aislada no explica el mecanismo.</text>
</g>
</svg></div>
<div class="expo-hero-controls"><div class="expo-hero-tabs" role="group" aria-label="Perspectiva del equilibrio ácido-base"><button type="button" data-hero-step="0" aria-pressed="true"><span>01</span> Organismo</button><button type="button" data-hero-step="1" aria-pressed="false"><span>02</span> Regulación</button><button type="button" data-hero-step="2" aria-pressed="false"><span>03</span> Relación</button></div><button type="button" class="expo-hero-motion" data-hero-motion aria-pressed="false" aria-label="Pausar movimiento del diagrama">Pausar</button></div>
<p class="expo-hero-caption" data-hero-caption>El resultado integra metabolismo, ventilación y función renal.</p>
<p class="expo-hero-disclaimer">Mapa conceptual original. Figuras simbólicas; no es anatomía diagnóstica.</p>
<p class="expo-visually-hidden" data-hero-status role="status" aria-live="polite"></p>
</div>'''
