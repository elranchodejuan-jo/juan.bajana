# Genética · Actualización del equipo

Fecha de trabajo: 19 de octubre de 2026, America/Guayaquil.
Base de integración: `509d5b3fe946b1e39902ddfdaae9f2e6a656f54d`.
Rama: `feat/genetica-actualizacion-equipo`.

El usuario solicita aplicar los ajustes académicos del equipo, renovar el
informe y el PowerPoint disponibles en la exposición y fusionar la revisión
en `main`. La autorización de fusión es explícita. Este documento registra
el alcance y las verificaciones finales anteriores a la fusión. El estado de
integración y despliegue se comprueba en el pull request y GitHub Actions.

## Matriz de ajustes y decisiones

Se revisaron ocho capturas aportadas por el usuario y dos PDF de contenido.
La tabla resume decisiones académicas, sin reproducir conversaciones,
capturas, datos de contacto ni intervenciones personales. En los puntos que
cambiaron durante la conversación, prevalece el acuerdo posterior.

| Evidencia | Ajuste identificado | Decisión de implementación |
| --- | --- | --- |
| Captura 1 | Reducir la extensión y acercar el guion a los temas del equipo | Retirar diapositivas separadas de aplicaciones, bibliografía y conclusión; conservar las fuentes en notas y recursos. |
| Captura 2 | Quince diapositivas de contenido, más portada, y tres por integrante | Exactamente 16 escenas. El equipo tiene cinco integrantes y el contenido permite cinco bloques de tres. |
| Captura 3 | Hacer visibles los apartados del tema y retirar contenido periférico | Tres secciones explícitas; la diversidad de sistemas en peces sale del recorrido. |
| Captura 4 | Confirmación de retirar peces y discusión inicial sobre freemartinismo | Peces se retira. La propuesta inicial sobre freemartinismo se resuelve con los acuerdos posteriores. |
| Captura 5 | El ejemplo de freemartinismo resulta comprensible con una explicación sencilla | Conservarlo como ejemplo bibliográfico bovino y explicarlo por conexión vascular, intercambio y posible alteración. |
| Captura 6 | Comenzar después de la portada con definición de cromosomas sexuales | La escena 2 explica qué son, cuáles se comparan y qué información contienen. |
| Captura 7 | Tres preguntas orales y responsables confirmados | Incorporar heterogametia, temperatura y freemartinismo, con las responsables indicadas en la metadata académica. |
| Captura 8 | Dos preguntas orales adicionales | Añadir función de SRY y participación de otros mecanismos además de los cromosomas. |
| PDF de presentación del Grupo 4 | Secuencia introductoria y nombres completos | Incorporar cinco autores y organizar cromosomas, diferenciación y sistemas. |
| PDF de información del equipo | Cuatro niveles y desarrollo masculino/femenino | Hacer explícito el nivel hormonal y separar ambas rutas sin perder sus relaciones. |
| PowerPoint adjunto | Copia de la presentación previa de 20 diapositivas | Reemplazarla por una versión actualizada de 16; el archivo adjunto no constituye una nueva revisión. |

No se crean historias clínicas, experimentos ni datos de pacientes. Las
preguntas orales y los gráficos son recursos docentes, no sistemas de
diagnóstico ni recomendaciones de incubación.

## Estructura de 16 escenas

| N.º | Identificador | Título |
| --- | --- | --- |
| 1 | `inicio` | Cromosomas sexuales, diferenciación sexual y sistemas de determinación sexual en animales |
| 2 | `cromosomas-sexuales` | ¿Qué son los cromosomas sexuales? |
| 3 | `caracteristicas-cromosomas` | Características de los cromosomas sexuales |
| 4 | `diferencias-x-y` | Diferencias entre los cromosomas X y Y |
| 5 | `diferenciacion-sexual` | ¿Qué es la diferenciación sexual? |
| 6 | `niveles-del-desarrollo` | Cuatro niveles del desarrollo sexual |
| 7 | `via-testicular` | La gónada bipotencial |
| 8 | `hormonas-y-conductos` | Desarrollo del aparato reproductor masculino |
| 9 | `desarrollo-femenino` | Desarrollo del aparato reproductor femenino |
| 10 | `freemartinismo` | Freemartinismo en bovinos |
| 11 | `sistemas-determinacion` | ¿Qué son los sistemas de determinación sexual? |
| 12 | `cruces-cromosomicos` | Sistema XX/XY |
| 13 | `aves-y-dmrt1` | Sistema ZZ/ZW |
| 14 | `haplodiploidia` | Determinación por haplodiploidía |
| 15 | `temperatura` | Determinación dependiente de la temperatura |
| 16 | `comparacion-de-sistemas` | Comparación de los sistemas |

Los tres bloques temáticos son cromosomas sexuales, diferenciación sexual y
sistemas de determinación sexual. La portada queda fuera del reparto de
quince escenas de contenido. No se asignan nombres a bloques o preguntas
cuando el material recibido no confirma esa responsabilidad.

## Interacciones y materiales

- Nueve exploradores: cromosomas X/Y/Z/W, cuatro niveles, redes gonadales,
  hormonas y conductos, freemartinismo, Punnett, ploidía/`csd`, temperatura y
  comparación de cuatro sistemas.
- Cinco preguntas orales, con respuesta revelable, en las escenas 4, 7, 10,
  13 y 15. Los diálogos no cuentan como diapositivas.
- Fuentes completas, autoevaluación opcional y materiales en un apéndice
  externo al conjunto de escenas. En modo Página forman parte de la lectura;
  en Diapositivas se accede mediante controles.
- Diez referencias numeradas por primera aparición en el JSON. Se retiran
  fuentes exclusivas de peces, del caso canino y de XX/X0 al salir esos temas
  del contenido.
- Se mantienen nombres de archivos y rutas públicas de las descargas. La
  versión de contenido permite invalidar copias antiguas en caché.
- Word académico de 11 páginas y PowerPoint de 16 diapositivas renderizados,
  revisados y sustituidos en las rutas de descarga existentes. El informe
  incluye tres figuras originales, tres tablas y nueve referencias. Las notas
  del PowerPoint contienen fuentes y respuestas para las cinco preguntas.

El Word conserva introducción, objetivos, metodología documental,
desarrollo, conclusiones y bibliografía. Retirar diapositivas de conclusión
y fuentes no elimina esas secciones del informe. El PowerPoint conserva las
fuentes en notas y no añade diapositivas bibliográficas al límite de 16.

## Compatibilidad y límites científicos

Los enlaces antiguos se resuelven mediante aliases únicos o mediante los
destinos del apéndice. Las antiguas rutas internas de peces y caso canino
conducen a conceptos generales, sin conservar escenas ni presentar sus
contenidos como parte del nuevo guion. Las anclas `autoevaluacion` y
`referencias-y-materiales` pertenecen al apéndice, sin duplicarse como aliases.

La simplificación mantiene distinciones necesarias: la gónada fetal no
produce espermatozoides maduros; las células germinales y somáticas son
linajes distintos; AMH, testosterona y DHT tienen funciones diferentes;
la vía ovárica requiere regulación activa; no todo huevo diploide de abeja
melífera origina una hembra; no existe una temperatura universal para todos
los reptiles; el antecedente de gemelos de distinto sexo no confirma por sí
solo freemartinismo. Los símbolos cromosómicos y alelos son esquemáticos.

## Comprobaciones registradas durante el trabajo

| Área | Resultado o estado disponible |
| --- | --- |
| Contenido canónico | `validate(published=True)` pasa con 16 escenas, cinco autores y las rutas de recursos existentes. |
| Fragmentos de escena | Los 16 fragmentos se generan sin errores con el constructor de la rama. |
| Vancouver | Primera aparición exacta 1–10; ninguna referencia de peces, caso canino o XX/X0 permanece. |
| Preguntas orales | Cinco objetos `oralQuestion` en las posiciones 4, 7, 10, 13 y 15; tres responsables nominales confirmadas. |
| Word y PowerPoint | Las 11 páginas del Word y las 16 diapositivas se renderizaron e inspeccionaron. Integridad OOXML, fuentes, tablas y geometría del PowerPoint verificadas. No se afirma una apertura en Microsoft PowerPoint. |
| Pruebas JavaScript y Python completas | 57/57 JavaScript y 15/15 Python aprobadas sobre los archivos finales. Incluyen estados de nueve exploradores, diálogos, impresión, foco y enlaces. |
| Regresión de Fisiopatología | Sus 15 elementos de escena completos y sus tres descargables son idénticos a la base. Cambian únicamente las versiones de recursos compartidos en el HTML generado. |
| Reproducibilidad y sintaxis | Segunda generación sin diferencias; sintaxis de los módulos modificados y git diff --check correctos. |
| Descargas | Dos archivos reemplazados, ZIP íntegros y enlaces versionados por hash. El test comprueba 16 diapositivas y los cinco autores del informe. |
| Navegador | No se reintenta la navegación bloqueada ni se busca otra ruta para eludir el permiso heredado. |
| Fusión y GitHub Pages | La autorización es explícita. El resultado de la fusión y del despliegue corresponde al PR de esta rama y a su ejecución en GitHub Actions. |

La batería completa se ejecutó sobre el resultado definitivo. jsdom comprueba lógica y
DOM emulado; no verifica geometría real, proyección, ventanas emergentes,
pantalla completa ni uso offline en un navegador.

## Limitación de revisión en navegador

La revisión anterior registró un permiso guardado o administrado que
bloquea el acceso del navegador a vetjb.com. Ese bloqueo sigue siendo una
limitación heredada de esta tarea. No se vuelve a intentar mediante otro
navegador, dominio, servidor, dirección o vía de red. El análisis estático y
los renders de documentos/figuras se realizan en su propio ámbito y no se
presentan como revisión del HTML publicado.

Los registros anteriores de incorporación y de 14 escenas permanecen como
historial. Sus resultados no acreditan automáticamente esta actualización.
El fallo de vista previa `bwrap` de la primera entrega tampoco describe la
limitación de permisos heredada actual.

## Cierre de integración

Los archivos de la rama contienen estos descargables revisados:

| Archivo público | Bytes | SHA-256 |
| --- | ---: | --- |
| `informe-determinacion-sexual-animal.docx` | 318473 | `132afdd68b5977adec0072569c09d2903e022e9f35387687fa284ee49146ad27` |
| `presentacion-determinacion-sexual-animal.pptx` | 93099 | `aceedc95ee2afa7d5d982b9d0a0ecec67ef3575cc29c270195d546e5f1fba8ae` |

El cierre exige que el árbol remoto coincida con el árbol probado y que
GitHub Pages termine correctamente para el commit fusionado. Este registro
no equipara el éxito de despliegue con una inspección visual del sitio.
