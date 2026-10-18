# Genética · Revisión visual y síntesis en 14 escenas

Fecha de trabajo: 18 de octubre de 2026, America/Guayaquil.
Base de integración: `ce71233`.
Rama: `feat/genetica-14-escenas-visuales`.

El usuario solicita integrar las figuras con el tema de la exposición,
reducir la web a entre 12 y 15 diapositivas y añadir interactividad e iconos
con moderación. También autoriza expresamente fusionar esta revisión en
`main`. Este registro describe su alcance y sus criterios de comprobación;
no acredita por sí solo una fusión, un despliegue ni una aprobación visual.

## Alcance

La exposición conserva su ruta:
`/exposiciones/genetica/cromosomas-y-determinacion-sexual/`.
Los modos Página y Diapositivas mantienen `?modo=estudiar` y
`?modo=presentar`, respectivamente.

- Síntesis de 18 a **14 escenas**, con conceptos y límites conservados en
  explicaciones y notas.
- **Siete exploradores**: niveles del desarrollo, Punnett, redes gonadales,
  hormonas, comparación de sistemas, ploidía/`csd` y temperatura.
- Una sola escena reúne las vías testicular y ovárica; se incorporan los
  nuevos exploradores de niveles y de abeja melífera.
- Figuras SVG inline con fondos transparentes y colores adaptados a los
  temas claro y oscuro; iconos como apoyo puntual, con etiquetas textuales.
- Cuatro aliases conservan enlaces a las escenas integradas.
- Cinco preguntas de autoevaluación y 12 referencias Vancouver. Se mantiene
  la primera aparición de las referencias en orden del 1 al 12.
- Word y PowerPoint originales sin cambios; el descargable PowerPoint
  conserva sus **20 diapositivas**, independientemente de la síntesis web.
- Fisiopatología, sus materiales y el despliegue existente quedan fuera del
  alcance funcional de esta revisión.

No se añaden pacientes, experimentos del estudiante, diagnósticos automáticos
ni recomendaciones de incubación. Los modelos siguen siendo educativos.

## Escenas y actividades

| Escena | Contenido o actividad |
| --- | --- |
| `inicio` | Portada con perspectivas Cromosomas, Desarrollo y Diversidad. |
| `niveles-del-desarrollo` | Explorador de constitución cromosómica, gónada y fenotipo; incluye el primordio bipotencial. |
| `cruces-cromosomicos` | Gametos y cuadro de Punnett en modelos XX/XY y ZZ/ZW. |
| `via-testicular` | Explorador de redes testicular y ovárica en una misma escena. |
| `hormonas-y-conductos` | Explorador de origen, diana y efecto de AMH, testosterona y DHT. |
| `comparacion-de-sistemas` | Comparador de cinco sistemas; incluye XX/X0 y el significado del cero. |
| `aves-y-dmrt1` | Dosis funcional de DMRT1 en pollo y distinción entre gónada y soma. |
| `haplodiploidia` | Explorador de ploidía y alelos de `csd` en abeja melífera. |
| `temperatura` | Patrones conceptuales MF, FM y FMF, sin temperaturas de incubación. |
| `diversidad-en-peces` | Determinación inicial, protandria y protoginia. |
| `freemartinismo` | Conexión vascular fetal, quimerismo y límites de interpretación. |
| `desarrollo-sexual-canino` | Ejemplo bibliográfico 78,XX y SRY negativo. |
| `autoevaluacion` | Cinco preguntas con retroalimentación y reinicio. |
| `referencias-y-materiales` | Bibliografía y descargas académicas. |

## Compatibilidad de enlaces

Los identificadores retirados se almacenan en `aliases` de su escena
receptora. No añaden diapositivas ni duplican el índice.

| Fragmento anterior | Escena receptora |
| --- | --- |
| `#gonada-bipotencial` | `#niveles-del-desarrollo` |
| `#cromosomas-y-gametos` | `#cruces-cromosomicos` |
| `#via-ovarica` | `#via-testicular` |
| `#sistema-xx-x0` | `#comparacion-de-sistemas` |

Se debe comprobar la apertura directa, la navegación interna y el cambio
de modo desde estos destinos. Cada alias debe tener un único receptor.

## Criterios de verificación

Resultados locales: **54/54 pruebas JavaScript y 15/15 pruebas Python
aprobadas**. La generación es determinista; las comprobaciones de sintaxis
JavaScript y `git diff --check` terminan sin errores. Estos resultados no
sustituyen la revisión visual en un navegador real.

| Comprobación | Criterio y límite |
| --- | --- |
| Generación | Exactamente 14 escenas, siete exploradores y cuatro aliases únicos; HTML y catálogo actualizados. |
| Referencias | Primera aparición Vancouver 1–12; citas internas y fuentes de exploradores resueltas. |
| Interacciones | Niveles, Punnett, redes, hormonas, sistemas, `csd`, temperatura y quiz conservan selecciones al cambiar de modo. |
| Accesibilidad | Controles con nombre, estados comprensibles, etiquetas textuales e iconos decorativos sin lectura redundante. |
| SVG | Siete figuras renderizadas y revisadas en claro y oscuro, sin lienzos blancos opacos, textos superpuestos ni flechas cortadas. Variables CSS resueltas para el render estático; no acredita la composición del HTML. |
| Compatibilidad | Los cuatro fragmentos anteriores conducen a sus escenas receptoras, sin añadir entradas al índice. |
| Movimiento | Se conservan pausa, movimiento reducido, pestaña oculta, impresión y limpieza de instancias. |
| Descargas | Word y PowerPoint idénticos a la base; enlaces existentes y contenedores íntegros. |
| Fisiopatología | Los elementos HTML completos de sus 15 escenas son idénticos a la base; sus pruebas de modelos e interacciones pasan. Solo cambian versiones de recursos compartidos en el HTML generado. |
| Reproducibilidad | La segunda generación no introduce diferencias; sintaxis y `git diff --check` correctos. |
| Navegador | Bloqueado por la política descrita abajo; pendiente la validación visual y de capacidades nativas. |

Comandos ejecutados desde la raíz:

```bash
python3 scripts/build-exposiciones.py build
npm test
python3 -m unittest discover -s tests -p 'test_*.py' -v
node --check exposiciones/shared/experience.mjs
node --check exposiciones/shared/genetics-labs.mjs
git diff --check
```

jsdom verifica lógica y DOM emulado. No mide geometría, proyección, ventanas
emergentes, pantalla completa ni funcionamiento offline real.

Se compararon los cuatro descargables byte a byte con `ce71233`: no cambian.
Hashes SHA-256 de los dos materiales de Genética:

```text
informe-determinacion-sexual-animal.docx
52605524ebd3db1ddf3dc1461ac74b8008e8577b7c9b7d41a3efb79bb628cb9f
presentacion-determinacion-sexual-animal.pptx
670b86c56a6af47891374190328f0e7631f86d6968196642773e4c825b7f3d2b
```

La revisión independiente detectó una precedencia insuficiente de la paleta
de impresión sobre el tema oscuro. Se corrigió con selectores específicos
de Genética y colores oscuros sobre papel blanco antes de las pruebas finales.

## Bloqueo actual del navegador

La apertura de vetjb.com fue bloqueada por una política de permisos
guardados o administrados. Extracto del mensaje recibido:

```text
Cloud browser could not acquire authority to trigger network egress...
saved permission or managed policy denies access
```

No se intentan otros dominios, servidores ni rutas para eludir esta
restricción. La revisión continúa con análisis estático, pruebas de lógica
y renders de SVG dentro del alcance disponible.

El fallo de `bwrap` documentado en
`exposiciones-verificacion-determinacion-sexual.md` pertenece a la
incorporación anterior. No es el bloqueo observado en esta revisión.
La autorización del usuario para fusionar no convierte las pruebas
estáticas en una validación visual real.

## Aceptación visual pendiente

Cuando exista un acceso permitido al navegador, comprobar ambos temas y
modos a **1920×1080, 1366×768, 1024×768 y 390×844**:

1. Las 14 escenas legibles, sin fondos blancos opacos, recortes ni
   desbordamiento horizontal; controles e iconos subordinados al contenido.
2. Gráficos, etiquetas y texto con contraste en claro y oscuro; ampliación
   de figuras y alternativas sin JavaScript.
3. Navegación por índice, enlaces antiguos y teclado; conservación de
   selecciones al alternar Página/Diapositivas y abrir referencias.
4. Las siete actividades y el quiz con teclado, ratón y controles táctiles;
   flechas de campos y sliders sin cambiar de escena accidentalmente.
5. Portada y fondo, pausa, preferencia de movimiento reducido, notas,
   pantalla completa e impresión, con comprobación de consola y red.
6. Apertura de Word y PowerPoint y ensayo offline real con el repositorio
   completo; las fuentes bibliográficas externas requieren conexión.
7. Regresión visual de las 15 escenas y actividades de Fisiopatología.

El registro inicial y sus resultados se conservan como antecedentes. No se
presentan como validación automática de esta revisión.
