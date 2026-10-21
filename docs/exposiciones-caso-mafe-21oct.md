# Remake de Fisiopatología centrado en Mafe · 21 de octubre de 2026

## Alcance y estructura

Se aplica la propuesta de Carolina: dos diapositivas de conceptos esenciales (pH/acidemia/alcalemia y acidosis/alcalosis con los cuatro trastornos), seguidas del análisis del caso clínico aportado. La web conserva 14 escenas y el PowerPoint se reduce de 15 a 14 diapositivas. El diseño, los modos Página/Diapositivas y los efectos de fondo se mantienen.

El recorrido del caso reúne anamnesis, signos, etiología/patogenia, relación rumen–sangre, pruebas, diagnóstico atribuido al reporte, manejo descrito y evolución. Los tres laboratorios existentes se agrupan en una escena con pestañas; sus controles, resultados y enlaces antiguos se conservan. El simulador Henderson–Hasselbalch permanece como modelo hipotético independiente de Mafe.

Las cinco preguntas contienen tres sobre el caso y dos ejercicios sintéticos conservados: ternero con diarrea y perro con hipoventilación. Sus valores, tipos de muestra, razonamiento y límites de interpretación permanecen diferenciados del caso real. El estado de preguntas y laboratorios se conserva entre modos y al compartir el enlace.

## Procedencia y precisión científica

Fuente primaria: Poveda Martínez JD. *Acidosis ruminal aguda en novilla Holstein de 2 años atendida en la Clínica de Grandes Animales U.D.C.A*. Bogotá: U.D.C.A; 2023. Se leyó el PDF aportado y se cotejaron visualmente las tablas de las páginas 10–15. Las fechas del caso son 13, 23 y 26 de septiembre de 2022; 2023 es el año del reporte.

- Mafe: Holstein, 2 años, 560 kg; ingesta accidental aproximada de 2 kg de concentrado de prelactancia. Esa cantidad no se presenta como umbral tóxico universal.
- pH 5,5: exclusivamente ruminal, obtenido por sonda y medido con tira reactiva. No se publicaron pH sanguíneo, PCO₂, HCO₃⁻, lactato ni electrolitos sanguíneos.
- La acidosis ruminal aguda es el diagnóstico comunicado por el autor. La repercusión sistémica se explica como mecanismo posible, sin inventar una gasometría ni afirmar acidemia confirmada.
- Se conserva la hipermotilidad descrita por la fuente. No se agregan frecuencias cardíaca/respiratoria ni porcentaje de deshidratación.
- La evolución clínica favorable no se equipara a normalización de todos los resultados. Protozoos y proteínas totales seguían bajos respecto de los intervalos impresos y la tabla de proteínas contiene una inconsistencia aritmética.
- El manejo se describe como antecedente del caso, sin dosis ni recomendación de un protocolo. La vía intrarruminal se refiere al bicarbonato.

La bibliografía coordinada contiene 14 referencias, numeradas por primera aparición. La fuente institucional del caso, el Manual MSD en español y la revisión crítica de Golder y Lean de 2024 sostienen el análisis ruminal. Se conservan las fuentes de fisiología y de los ejercicios originales.

La fotografía procede de los bytes de la imagen incrustada de la figura 1 del PDF. Las imágenes del ternero y del perro siguen identificadas como sintéticas. Procedencia en `exposiciones/assets/figuras/LICENSES.md`.

## Validación y límites

Las pruebas del código cubren navegación, pestañas y teclado, estado de los controles, pausa de modelos ocultos, impresión, preguntas individuales, enlaces antiguos, compartir, cambio de modo, fuentes, tablas y regresiones de Genética. Las pruebas DOM no verifican geometría real del navegador.

La revisión visual de la web publicada no pudo realizarse: una configuración de permisos guardada bloqueó el acceso del navegador a vetjb.com. No se intentaron rutas alternativas para eludir esa restricción. La publicación utiliza el alojamiento y dominio existentes; no se cambia su configuración.

Los archivos académicos se revisan mediante renders locales. Esa inspección no equivale a abrirlos en Microsoft Word o PowerPoint nativos. Los HTML de otras materias solo reciben las versiones nuevas de recursos compartidos; el contenido y los descargables de Genética permanecen sin cambios.

## Entregables finales

- Informe de 10 páginas Letter, cuerpo Times New Roman 12 justificado, títulos decimales y numeración al pie. Contiene cinco tablas, una fotografía original del caso, una ecuación editable y 14 referencias Vancouver con enlaces completos.
- PDF derivado del Word final; se revisaron visualmente las 10 páginas.
- PowerPoint de 14 diapositivas, nueve tablas nativas y gráfico Henderson–Hasselbalch editable con datos incrustados. Las 14 notas contienen fuentes completas; la última diapositiva presenta referencias abreviadas. Las cinco preguntas y sus opciones coinciden con el JSON canónico. Se inspeccionaron las 14 diapositivas del archivo reimportado.
- Pruebas: 64 JavaScript y 18 Python aprobadas; validación estructural del PPTX y del gráfico sin advertencias.

| Descargable | SHA-256 |
| --- | --- |
| `informe-equilibrio-acido-base.docx` | `e220501dec30e0f11113995a52e5e1e4a8711e249285cde1c0936a85e5fe945d` |
| `equilibrio-acido-base.pdf` | `070fcacfd0ab6b792735d78c0509041d2b43d88aecae65f813592b32910c1009` |
| `presentacion-equilibrio-acido-base.pptx` | `7b496cb0f652dce853751ffb3f5c900341aecda794b06b7e965da25f58cb3d7e` |
