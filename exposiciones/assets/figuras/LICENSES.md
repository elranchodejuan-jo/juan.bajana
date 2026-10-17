# Figuras originales para VETJB Exposiciones

Fecha de elaboración y revisión: 17 de octubre de 2026.
Proyecto y autoría editorial: Juan José Bajaña Chuno, vetjb.com.
Elaboración técnica: diagramas SVG originales realizados con asistencia de IA para este proyecto y revisados contra las fuentes indicadas.

## Archivos y alcance

| Archivo | Contenido | Base científica |
| --- | --- | --- |
| `bicarbonato.svg` | Equilibrio químico reversible y relación bicarbonato/CO₂ disuelto. | Referencias 1 y 3 del informe. |
| `pulmon.svg` | Transporte de CO₂, eliminación pulmonar y dirección de PCO₂ al variar ventilación alveolar, manteniendo constante la producción de CO₂. | Referencias 1 y 5 del informe. |
| `renal.svg` | Separación entre recuperación del bicarbonato filtrado y excreción neta de ácido, asociada a bicarbonato nuevo. | Referencia 4 del informe. |

Son esquemas funcionales. No reproducen la anatomía de una especie ni representan mediciones de un paciente. La relación química no sustituye una interpretación clínica completa. El esquema pulmonar mantiene explícitamente constante la producción de CO₂. En el renal, «ácido titulable» describe el ácido urinario tamponado, principalmente por fosfato.

## Derechos y licencia

Los trazados, las composiciones y las etiquetas se elaboraron originalmente para el proyecto. No se copiaron ni redistribuyeron figuras, fotografías, iconos o trazados de terceros. Las fuentes científicas respaldan el contenido y no aportan una imagen reutilizada.

Estos recursos se incorporan como obra original del proyecto bajo la licencia general que tenga establecida el repositorio. Este registro no introduce una licencia diferente ni cambia las condiciones del repositorio. No hay licencias de imágenes de terceros que deban acompañar a los SVG.

Las fuentes tipográficas no están incrustadas ni se redistribuyen. La pila CSS utiliza Inter cuando esté disponible y fuentes del sistema como alternativa. No existen scripts, dependencias de red, fuentes remotas ni imágenes enlazadas.

## Fuentes consultadas

La numeración coincide con `report_content.json` y el informe de Fisiopatología de esta sesión.

1. Cornell University. Overview [Internet]. eClinPath; [citado 17 oct 2026]. https://eclinpath.com/chemistry/acid-base/overview/
3. Baquero-Parrado JR. Consideraciones clínicas y regulación del equilibrio ácido-base en ganado bovino. Rev UDCA Actual Divulg Cient. 2008;11(2):85-100. https://doi.org/10.31910/rudca.v11.n2.2008.626
4. Cornell University. Physiology [Internet]. eClinPath; [citado 17 oct 2026]. https://eclinpath.com/chemistry/kidney/physiology/
5. Cornell University. Response to disturbances [Internet]. eClinPath; [citado 17 oct 2026]. https://eclinpath.com/chemistry/acid-base/compensation/

## Integración y accesibilidad

- Lienzo: `viewBox="0 0 720 480"`. Mantener proporción mediante `width: 100%; height: auto`.
- Cada SVG incluye `role="img"`, `title`, `desc` y etiquetas vectoriales legibles. El tamaño mínimo de texto es 22 px en el lienzo de referencia.
- Se revisaron las versiones clara y oscura a 720 × 480 y la reducción a 390 px de ancho. Ofrecer ampliación en móvil y presentación; la imagen no requiere rasterización.
- Sin atributo `data-theme`, el SVG usa `prefers-color-scheme`. Al insertarlo en línea, `data-theme="light"` o `data-theme="dark"` en la raíz `<svg>` fuerza el tema de la página. Como `<img>`, conserva un fondo propio de contraste suficiente en ambos temas y sigue la preferencia del sistema.
- Si se inserta el mismo SVG en línea más de una vez en un documento, asignar un prefijo de instancia a sus identificadores y referencias `url(#...)`/`aria-labelledby` para evitar IDs duplicados.
- Los PNG y scripts de este directorio son material de comprobación. Solo los tres SVG y este registro necesitan integrarse como recursos públicos.
