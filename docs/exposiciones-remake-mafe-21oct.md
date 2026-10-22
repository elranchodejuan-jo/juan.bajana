# Fisiopatología centrada en el caso de Mafe

Revisión del 21 de octubre de 2026. El cambio responde al enfoque solicitado: dos apartados breves de fundamentos y explicación de la fisiopatología a partir del caso clínico publicado por Poveda Martínez en 2023.

## Contenido y sincronización

La web contiene 12 escenas: portada, pH, procesos ácido-base, reseña y anamnesis, hallazgos, patogenia ruminal, repercusión sistémica posible, diagnóstico, manejo y evolución, simulador, autoevaluación y referencias. Las cinco preguntas siguen comprobándose individualmente. Las dos últimas conservan los ejercicios sintéticos del ternero y del perro.

El PowerPoint contiene 14 diapositivas porque reparte la autoevaluación en tres: preguntas 1–3, ternero y perro. El informe Word y su PDF tienen 10 páginas. Las cinco preguntas y todas sus opciones coinciden literalmente entre el PowerPoint y el JSON de la web, comprobadas mediante extracción del XML. Los descargables sustituyen los materiales teóricos anteriores y sus URLs incorporan los nuevos hashes.

El simulador y los ejemplos se conservan. Los exploradores previos de amortiguación, ventilación y función renal quedan en desplegables opcionales de la vista Página. El recorrido de Diapositivas mantiene una introducción breve. Los enlaces antiguos de conceptos redirigen a sus escenas receptoras mediante alias y los dos casos conservan sus identificadores.

## Precisión clínica

- El diagnóstico de acidosis ruminal aguda se atribuye al autor del reporte.
- El pH 5,5 pertenece al líquido ruminal obtenido por sonda y medido con tira. No se presentan pH sanguíneo, PCO₂, HCO₃⁻ o lactato como datos de Mafe.
- Se conserva la hipermotilidad ruminal e intestinal descrita, sin sustituirla por el patrón típico de cuadros graves.
- La taquipnea no se convierte en prueba de compensación. La tinción de Gram no identifica especies bacterianas.
- Los protozoos siguen inferiores al intervalo impreso en el control. Se conserva la discrepancia entre proteínas totales y la suma de albúmina y globulinas, sin afirmar normalización completa.
- El manejo se relata como antecedente publicado y no incorpora una pauta de dosificación.

La fotografía de Mafe procede de la figura 1, página 9 del PDF aportado, a su resolución original de 153 × 272 píxeles. Su procedencia se documenta en `assets/figuras/LICENSES.md`. Las imágenes del ternero y del perro siguen identificadas como ilustraciones sintéticas independientes.

## Implementación

El JSON canónico incorpora tablas breves de pruebas y seguimiento. El generador produce tablas semánticas con encabezados y celdas escapadas. Se conservan las rutas, los modos de vista, el fondo ambiental, el simulador y el componente de comprobación individual. Los cambios de CSS se limitan a esta exposición; el resto de las páginas se regeneran para actualizar hashes de recursos compartidos.

El PDF académico vigente se obtiene por exportación del Word revisado. El antiguo `scripts/export-expo-pdf.py` no representa el guion de Mafe: ahora rechaza ese esquema antes de escribir archivos y explica el procedimiento vigente. No debe usarse para sobrescribir el informe PDF.

## Verificación

- `python3 scripts/build-exposiciones.py`: 2 exposiciones generadas.
- `python3 -m unittest discover -s tests -p 'test_*.py'`: 16 pruebas aprobadas. Incluyen integridad de enlaces/IDs/descargas, secuencia Vancouver y nueva regresión clínica de Mafe.
- `npm test`: 61 pruebas aprobadas. Se conserva la prueba real del HTML generado para cinco preguntas, comprobación individual, casos, puntuación, persistencia y cambios entre Página y Diapositivas.
- Comparación del texto del PowerPoint con el JSON: las cinco preguntas y todas sus opciones coinciden.
- `git diff --check`: sin errores de espacios.

La inspección web en el navegador conectado no pudo acceder al servidor local del entorno (`ERR_CONNECTION_REFUSED`). Los tests de DOM no acreditan geometría visual ni proyección en navegador real. Los archivos Word, PowerPoint y PDF se revisaron por separado antes de sustituir las descargas. Esta rama requiere revisión y PR según `AGENTS.md`; el estado `published` del JSON no demuestra despliegue en producción.
