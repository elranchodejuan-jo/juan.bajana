# Revisión de Fisiopatología · 20 de octubre de 2026

## Cambios acordados

La web contiene 14 escenas. Se separan pH/acidemia/alcalemia de acidosis/alcalosis y se presenta una visión de los tres sistemas reguladores antes del bicarbonato. La aclaración del alcance del esquema queda bajo el gráfico, fuera de los pasos fisiológicos.

Los casos de ternero y perro pasan a las preguntas 4 y 5, sustituyendo dos de las anteriores. Se conservan cinco preguntas, todos los datos clínicos construidos, el tipo de muestra, las opciones y los límites de interpretación. Las soluciones se revelan al comprobar cada pregunta. La pregunta activa y sus respuestas se conservan al cambiar de formato; los enlaces antiguos de los casos siguen funcionando. Referencias y materiales reemplaza el cierre separado; el identificador anterior `conclusiones` redirige allí.

## Entregables coordinados

- Informe: 15 páginas en tamaño carta, Times New Roman 12, texto justificado, títulos decimales y 12 referencias Vancouver. Incluye seis figuras, tres tablas y cuatro ecuaciones editables. Las conclusiones se conservan como apartado académico del informe.
- PDF: exportado del Word final.
- PowerPoint: 15 diapositivas, nueve tablas nativas y gráfico Henderson–Hasselbalch editable. Las preguntas 1–3 comparten una diapositiva; cada caso tiene una diapositiva de pregunta. Las soluciones están en notas del expositor. Los cuatro trastornos se reúnen en una tabla para mantener el límite de diapositivas.
- Las cinco preguntas y sus 15 opciones coinciden literalmente entre el JSON de la página y los documentos. El orden de primera aparición de las referencias es 1–12.
- Las dos ilustraciones son sintéticas y se identifican como tales; no representan pacientes reales ni protocolos de actuación. Procedencia en `exposiciones/assets/figuras/LICENSES.md`.

## Verificación de fuentes, archivos y código

Se cotejaron las definiciones y sistemas reguladores con eClinPath y las referencias existentes. Se mantienen las distinciones entre recuperación y generación de bicarbonato, amortiguación inicial y adaptación renal, y la necesidad de criterios por especie y tipo de muestra. El anion gap del caso bovino es 27,8 mmol/L con K⁺; no se clasifica sin intervalo aplicable ni se atribuye la causa a D-lactato sin determinación.

Se inspeccionaron las 15 páginas renderizadas del Word/PDF y las 15 diapositivas del PPTX reimportado: sin cortes ni solapamientos. El paquete de PowerPoint y los datos de su gráfico pasan la validación estructural. La fuente declarada es Times New Roman; el render de revisión usa Nimbus Roman como sustituto disponible, sin atribuir esa revisión a Microsoft PowerPoint nativo.

Pruebas de código: 61/61 JavaScript, 15/15 Python y `git diff --check` limpio. Incluyen estado individual de preguntas, respuesta incorrecta, enlaces antiguos, compartir, cambio Página/Diapositivas, impresión, hashes de descargas y regresiones de Genética. Las pruebas DOM no verifican geometría del navegador, pantalla completa ni funcionamiento offline real.

## QA web

La PR 19 está integrada en `main` y desplegada en el dominio existente. Se revisaron en navegador de escritorio, con ventana de 1646 × 897 px, las preguntas de ambos casos, sus ilustraciones, los datos y el feedback tras una respuesta incorrecta: todos resultaron legibles. Las tres descargas respondieron HTTP 200 y sus hashes coincidieron con los archivos finales registrados abajo.

La línea de fuentes al pie perdía aproximadamente sus últimos 5 px junto a la barra inferior. Se reduce el relleno vertical de la escena de evaluación de 26 a 18 px, recuperando 16 px de espacio sin cambiar el tamaño de letra. Las tres tarjetas de `ph-y-procesos` y `sistemas-reguladores` pasan a una sola fila de tres columnas exclusivamente en Diapositivas. Estos ajustes quedan pendientes de regeneración, publicación y comprobación visual posterior.

En el recorrido caso 5 incorrecto → Página → corregir y comprobar → Diapositivas se conservaron la respuesta y el resultado, pero la URL pasó a `autoevaluacion` durante la carga del formato. Se corrige esa escritura para mantener el identificador de la pregunta también durante la transición. Una regresión DOM reproduce el fallo antes de la corrección y verifica después el hash, la pregunta visible y la respuesta correcta; falta comprobar este ajuste en el despliegue.

## Hashes de los descargables

| Archivo | SHA-256 |
| --- | --- |
| `informe-equilibrio-acido-base.docx` | 0183d9c5d169d0d28ad32ec9748b2838f1effeb3762445f8c9470f1e73828cb3 |
| `equilibrio-acido-base.pdf` | 44981705571ad4d8015a72ac479019fb6a69e22091190f22cb7bc2b4c4520c25 |
| `presentacion-equilibrio-acido-base.pptx` | ed1a552df24c452ea2e5c5fe0bdbc59dd101e6e41d06d412785abdd26f78a2f9 |

La publicación conserva el alojamiento y dominio existentes. Los HTML regenerados de Genética sólo cambian versiones de recursos compartidos; su contenido y sus archivos académicos no se modifican.
