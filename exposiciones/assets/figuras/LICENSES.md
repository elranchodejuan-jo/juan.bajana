# Figuras originales para VETJB Exposiciones

Fecha de elaboración y revisión: 17 de octubre de 2026.
Proyecto y autoría editorial: Juan José Bajaña Chuno, vetjb.com.
Elaboración técnica: diagramas SVG originales realizados con asistencia de IA para este proyecto y revisados contra las fuentes indicadas.

## Fisiopatología: archivos y alcance

| Archivo | Contenido | Base científica |
| --- | --- | --- |
| `bicarbonato.svg` | Equilibrio químico reversible y relación bicarbonato/CO₂ disuelto. | Referencias 1, 2 y 3 del informe. |
| `pulmon.svg` | Transporte de CO₂, eliminación pulmonar y dirección de PCO₂ al variar ventilación alveolar, manteniendo constante la producción de CO₂. | Referencias 1, 3 y 5 del informe. |
| `renal.svg` | Separación entre recuperación del bicarbonato filtrado y excreción neta de ácido, asociada a bicarbonato nuevo. | Referencia 6 del informe. |

Son esquemas funcionales. No reproducen la anatomía de una especie ni representan mediciones de un paciente. La relación química no sustituye una interpretación clínica completa. El esquema pulmonar mantiene explícitamente constante la producción de CO₂. En el renal, «ácido titulable» describe el ácido urinario tamponado, principalmente por fosfato.

## Derechos y licencia

Los trazados, las composiciones y las etiquetas se elaboraron originalmente para el proyecto. No se copiaron ni redistribuyeron figuras, fotografías, iconos o trazados de terceros. Las fuentes científicas respaldan el contenido y no aportan una imagen reutilizada.

Estos recursos se incorporan como obra original del proyecto bajo la licencia general que tenga establecida el repositorio. Este registro no introduce una licencia diferente ni cambia las condiciones del repositorio. No hay licencias de imágenes de terceros que deban acompañar a los SVG.

Las fuentes tipográficas no están incrustadas ni se redistribuyen. La pila CSS utiliza Inter cuando esté disponible y fuentes del sistema como alternativa. No existen scripts, dependencias de red, fuentes remotas ni imágenes enlazadas.

## Fisiopatología: fuentes consultadas

La numeración coincide con el JSON canónico y el informe actualizado de Fisiopatología.

- [1] Cornell University. Overview [Internet]. eClinPath; [citado 17 oct 2026]. https://eclinpath.com/chemistry/acid-base/overview/
- [2] Baquero-Parrado JR. Consideraciones clínicas y regulación del equilibrio ácido-base en ganado bovino. Rev UDCA Actual Divulg Cient. 2008;11(2):85-100. https://doi.org/10.31910/rudca.v11.n2.2008.626
- [6] Cornell University. Physiology [Internet]. eClinPath; [citado 17 oct 2026]. https://eclinpath.com/chemistry/kidney/physiology/
- [3] Cornell University. Response to disturbances [Internet]. eClinPath; [citado 17 oct 2026]. https://eclinpath.com/chemistry/acid-base/compensation/
- [5] Columbia University. Acid–base disturbances [material docente en Internet; sin fecha]. https://www.columbia.edu/itc/hs/medical/pathophys/pulmonary/2008/abnormalColor.pdf

## Fisiopatología: integración y accesibilidad

- Lienzo: `viewBox="0 0 720 480"`. Mantener proporción mediante `width: 100%; height: auto`.
- Cada SVG incluye `role="img"`, `title`, `desc` y etiquetas vectoriales legibles. El tamaño mínimo de texto es 22 px en el lienzo de referencia.
- Se revisaron las versiones clara y oscura a 720 × 480 y la reducción a 390 px de ancho. Ofrecer ampliación en móvil y presentación; la imagen no requiere rasterización.
- Sin atributo `data-theme`, el SVG usa `prefers-color-scheme`. Al insertarlo en línea, `data-theme="light"` o `data-theme="dark"` en la raíz `<svg>` fuerza el tema de la página. Como `<img>`, conserva un fondo propio de contraste suficiente en ambos temas y sigue la preferencia del sistema.
- Si se inserta el mismo SVG en línea más de una vez en un documento, asignar un prefijo de instancia a sus identificadores y referencias `url(#...)`/`aria-labelledby` para evitar IDs duplicados.
- Los PNG y scripts de este directorio son material de comprobación. Solo los tres SVG y este registro necesitan integrarse como recursos públicos.

## Genética: determinación sexual animal

Incorporación: 17 de octubre de 2026. Carpeta: `genetica/determinacion-sexual/`.
Los siete SVG son composiciones originales realizadas para esta exposición;
no son cariotipos, fotografías clínicas, mediciones ni reproducciones de figuras
de artículos. Se conserva la autoría editorial y el alcance de licencia del
proyecto indicados arriba, sin introducir una licencia adicional.

| Archivo | Contenido y simplificación | Base bibliográfica estable |
| --- | --- | --- |
| `portada.svg` | Síntesis de cromosomas, redes del desarrollo y diversidad animal; imagen de catálogo. | `unam-desarrollo-2021`, `ioannidis-dmrt1-2021` y fuentes comparativas de la exposición. |
| `niveles-desarrollo-sexual.svg` | Constitución cromosómica, identidad gonadal y fenotipo como niveles relacionados, no equivalentes. | `unam-desarrollo-2021`. |
| `gametos-xx-xy-zz-zw.svg` | Gametos y heterogametia de modelos habituales XX/XY y ZZ/ZW; símbolos sin morfología cromosómica real. | `unam-desarrollo-2021`, `ioannidis-dmrt1-2021`. |
| `gonada-bipotencial.svg` | Organización somática y germinal del primordio gonadal; no es anatomía a escala ni cronología universal. | `unam-desarrollo-2021`, `ridnik-regulacion-2021`. |
| `haplodiploidia-csd.svg` | Ploidía y estado alélico de `csd` en *Apis mellifera*, incluida la posibilidad de machos diploides. | `seiler-csd-2024`. |
| `cambio-sexual-peces.svg` | Distinción entre determinación inicial, protandria y protoginia; no representa una única especie. | `kitano-teleosteos-2024`, `casas-cambio-2021`. |
| `freemartinismo-bovino.svg` | Conexión vascular fetal, intercambio y posible quimerismo; el antecedente no confirma por sí solo el síndrome. | `corredor-freemartin-2009`. |

Las claves corresponden a las entradas completas, con DOI o URL y alcance,
del JSON en la incorporación inicial. Las referencias de peces se retiraron
del guion actual; su procedencia se conserva en el historial y en este inventario.
La numeración Vancouver de la web se genera según su propio orden, que puede
diferir del informe descargable.

Los SVG usan `viewBox="0 0 960 560"`, `title`, `desc`, texto vectorial y
equivalentes textuales en la página. Mantener su proporción y la acción de
ampliar. No incluyen scripts, fotos, fuentes incrustadas ni dependencias de red.
La revisión de sus renders estáticos no acredita la maquetación HTML ni la
legibilidad efectiva al proyectar; esa revisión está pendiente en navegador.

La portada interactiva definida en `scripts/expo_genetics_hero.py` y los
diagramas semánticos de `scripts/expo_genetics.py` también son originales. Sus
estados de Canvas son exclusivamente decorativos; SVG, HTML y texto expresan
la información científica.

Este registro cubre los recursos originales de la web. En la incorporación
inicial, el Word y PowerPoint eran copias sin cambios de los materiales
académicos entregados, con sus propias figuras, atribuciones y bibliografía.
No se extrajeron de ellos las ilustraciones de UNAM para publicarlas como SVG
de la web. La procedencia y los hashes de aquella entrega figuran en
`docs/exposiciones-verificacion-determinacion-sexual.md`. La actualización
del equipo renueva ambos descargables según el apartado siguiente.

### Revisión de integración del 18 de octubre de 2026

Los siete SVG conservan su contenido y autoría originales, con fondos
transparentes y colores mediante variables de la exposición. La inserción
inline asigna identificadores únicos a cada instancia, incluidas sus
ampliaciones. Los pequeños símbolos incorporados dentro de las figuras y
los exploradores de niveles del desarrollo y ploidía/`csd` son trazados
originales del proyecto. Los iconos de encabezado reutilizan el recurso
Lucide local, cuya atribución existente se conserva en el repositorio.
Se revisaron renders estáticos de las siete figuras en claro y oscuro;
la verificación visual de su composición dentro del navegador sigue
pendiente por el bloqueo de permisos registrado en
`docs/exposiciones-verificacion-genetica-visual.md`.

### Actualización del equipo del 19 de octubre de 2026

El guion actual corresponde al Grupo 4 de Quinto A: Juan José Bajaña Chuno,
Britney Gissel Cujilema Montero, Joselyn María Pambi Gaona, Guillermo Ramiro
Ramírez Medina y Dennisse Carolina Silva Del Rosario. Su estructura contiene
16 escenas, con portada y 15 de contenido, tres bloques temáticos, nueve
exploradores y cinco preguntas orales. Las fuentes, la autoevaluación y los
materiales se consultan fuera del recorrido de diapositivas.

El selector X/Y/Z/W, el esquema actualizado de cuatro niveles y el recorrido
de freemartinismo por pasos son composiciones originales del proyecto. Las
etiquetas y los símbolos representan relaciones didácticas; no son cariotipos,
anatomía a escala ni mediciones del equipo. Los recursos originales de
versiones previas se conservan sin atribuirles usos que ya no tienen: el
esquema antiguo de tres niveles y la figura de peces no forman parte del
recorrido actual.

Las imágenes de los materiales de consulta del equipo no se incorporan a la
web como ilustraciones de autoría propia. Las fuentes científicas respaldan
el contenido y no implican permiso para redistribuir sus figuras. La
atribución de los iconos Lucide locales se conserva en el repositorio.

La actualización incluye nuevos archivos Word y PowerPoint. Su procedencia,
fuentes de imágenes, revisión visual y hashes constan en
`docs/exposiciones-verificacion-genetica-equipo.md`. Las tres figuras del
informe son originales; los diagramas y tablas del PowerPoint son editables.
Se inspeccionaron las 11 páginas y las 16 diapositivas renderizadas.
La revisión del HTML en navegador sigue pendiente por el bloqueo
de permisos previamente documentado; no se han intentado rutas alternativas.


## Fisiopatología: ilustraciones de contexto del 20 de octubre de 2026

`ternero-contexto-acido-base.webp` y `perro-contexto-acido-base.webp` se generaron con OpenAI ImageGen para esta revisión. Son ilustraciones sintéticas de escenarios ficticios, no fotografías documentales de pacientes ni pruebas de los mecanismos explicados. Se integran con una leyenda explícita en web, informe y presentación. Los datos clínicos del ejercicio se conservan por separado; las imágenes no documentan un protocolo de anestesia, diagnóstico ni tratamiento.

Indicaciones de generación: escena horizontal de un ternero joven blanco y negro sobre paja limpia, observado por un veterinario; escena horizontal de un perro adulto de pelaje marrón recostado en una mesa acolchada y observado por una veterinaria. Sin texto, logotipos, procedimientos invasivos ni señales clínicas rotuladas. Los originales PNG se reutilizaron en los documentos y se convirtieron a WebP para la página. No se copiaron fotografías de los repositorios de referencia.

## Fotografía del caso de Mafe

- Archivo: `mafe-caso-poveda.jpeg` (153 × 272 px, resolución original).
- Procedencia: Poveda Martínez JD. *Acidosis ruminal aguda en novilla Holstein de 2 años atendida en la Clínica de Grandes Animales U.D.C.A*. 2023. Figura 1, página 9 del PDF aportado para el análisis académico. La fuente la identifica como archivo personal.
- Registro: https://repository.udca.edu.co/handle/11158/5398
- Extraída sin modificación del archivo fuente para acompañar el análisis educativo del caso. No se afirma una licencia abierta ni autoría del equipo de VETJB. No es una imagen generada ni una paciente atendida por el equipo expositor.
