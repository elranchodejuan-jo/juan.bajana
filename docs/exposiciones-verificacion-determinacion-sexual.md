# Genética · Cromosomas y determinación sexual animal

Fecha de trabajo: 17 de octubre de 2026, America/Guayaquil.
Base de integración: `5ee262f`.
Rama: `feat/exposicion-genetica-determinacion-sexual`.

La implementación está preparada para revisión en un PR borrador hacia `main`.
Este registro no acredita fusión ni despliegue en vetjb.com. El estado
`published` del JSON permite revisar la exposición en el catálogo generado
de la rama; no es una afirmación sobre producción.

## Alcance y rutas

Título: **Cromosomas sexuales, diferenciación sexual y sistemas básicos de
determinación sexual en animales**. Investigación bibliográfica de Genética y
Mejoramiento Animal, Medicina Veterinaria, Quinto A, UTMACH, periodo 2026-2.
Autor del material académico: Juan José Bajaña Chuno. No se atribuyen
experimentos, pacientes ni aval de las fuentes citadas al estudiante.

- Categoría: `/exposiciones/genetica/`.
- Exposición: `/exposiciones/genetica/cromosomas-y-determinacion-sexual/`.
- Lectura: `?modo=estudiar`.
- Presentación: `?modo=presentar`.
- Enlaces profundos: el identificador de escena como fragmento, por ejemplo
  `#cruces-cromosomicos`.

La biblioteca conserva Fisiopatología y añade Genética. La exposición incluye
18 escenas con notas, seis exploradores, autoevaluación de cinco preguntas,
siete SVG originales, 12 referencias y dos descargas reales. El informe y el
PowerPoint no se reescriben al generar la web.

## Escenas y actividades

| Escena | Contenido o actividad |
| --- | --- |
| `inicio` | Portada con perspectivas Cromosomas, Desarrollo y Diversidad. |
| `niveles-del-desarrollo` | Constitución cromosómica, identidad gonadal y fenotipo. |
| `cromosomas-y-gametos` | Heterogametia y gametos de modelos XX/XY y ZZ/ZW. |
| `cruces-cromosomicos` | Explorador 1: selección de sistema y combinación de Punnett. |
| `gonada-bipotencial` | Células somáticas y germinales del primordio gonadal. |
| `via-testicular` | Explorador 2: redes gonadales, con vía testicular inicial. |
| `via-ovarica` | Explorador 3: redes gonadales, con vía ovárica inicial. |
| `hormonas-y-conductos` | Explorador 4: AMH, testosterona y DHT. |
| `comparacion-de-sistemas` | Explorador 5: XX/XY, ZZ/ZW, XX/X0, haplodiploidía y temperatura. |
| `aves-y-dmrt1` | Evidencia experimental en pollo y límites de la identidad gonadal. |
| `sistema-xx-x0` | Significado de X0 y diploidía autosómica. |
| `haplodiploidia` | *Apis mellifera*, `csd` y machos diploides. |
| `temperatura` | Explorador 6: patrones conceptuales MF, FM y FMF. |
| `diversidad-en-peces` | Determinación inicial, protandria y protoginia. |
| `freemartinismo` | Antecedentes, conexión fetal y necesidad de evaluación. |
| `desarrollo-sexual-canino` | Ejemplo bibliográfico 78,XX y SRY negativo. |
| `autoevaluacion` | Cinco preguntas, retroalimentación, puntuación local y reinicio. |
| `referencias-y-materiales` | Bibliografía completa en lectura y descargas académicas. |

Los exploradores de las dos vías gonadales comparten implementación, pero
conservan selecciones independientes. El contenido esencial tiene alternativas
estáticas. Los controles no recogen identidad ni envían respuestas a servidores.

## Fuentes, límites y diferencias con los descargables

La síntesis web usa 12 fuentes pertinentes de la bibliografía de partida,
verificadas durante la investigación: libro veterinario de UNAM, revisiones
científicas y estudios experimentales con alcance por especie. Cada referencia
mantiene una clave estable y sus metadatos en el JSON. Su orden Vancouver es
propio de la web; no replica automáticamente los números del Word.

La web organiza el material en 18 escenas; el PowerPoint conserva 20
diapositivas y el informe sus 15 referencias. Esta síntesis no altera los
documentos originales. Los siete SVG de la web son originales y están
descritos en `exposiciones/assets/figuras/LICENSES.md`; no se reutilizaron como
recursos web las ilustraciones de UNAM incluidas en los descargables.

Supuestos explícitos:

- XX/XY y ZZ/ZW muestran posibilidades bajo segregación y fecundación
  equivalentes; no predicen el sexo de un individuo ni aseguran 1:1 por camada.
- La vía ovárica es activa. La evidencia de ablación de `Foxl2` corresponde a
  ratones adultos experimentales, no a un cambio espontáneo normal de hembras
  domésticas.
- AMH, testosterona y DHT tienen orígenes y efectos distintos; la conversión
  local a DHT no se describe como secreción de Sertoli.
- X0 significa ausencia del segundo cromosoma sexual, no haploidía del animal.
- El sistema `csd` se delimita a la abeja melífera; admite machos diploides y no
  se extrapola a todos los himenópteros.
- MF, FM y FMF son posiciones cualitativas, sin grados, porcentajes medidos ni
  recomendaciones de incubación. No todos los reptiles comparten ese mecanismo.
- La determinación inicial y el cambio sexual de algunos peces son procesos
  distintos. Freemartinismo y diferencias del desarrollo canino se presentan
  como ejemplos bibliográficos, no diagnósticos automáticos.

## Implementación y regeneración

Fuente editable: `exposiciones/content/genetica--cromosomas-y-determinacion-sexual.json`.
El generador compartido añade portada, exploradores, citas y recursos sin
copiar los simuladores ácido-base. Los módulos y estilos de Genética están
aislados; `experience.mjs` selecciona la estrategia ambiental según la materia.

Desde la raíz del repositorio:

```bash
python3 scripts/build-exposiciones.py build
npm test
python3 -m unittest discover -s tests -p 'test_*.py' -v
node --check js/main.js
git diff --check
```

En Windows puede usarse `py -3` en lugar de `python3`. Instalar previamente las
dependencias de desarrollo con `npm ci --ignore-scripts` para ejecutar jsdom.
Revisar todos los HTML regenerados y confirmar las rutas antes de incluirlos
en el PR. La regeneración no exige Node ni Python en GitHub Pages.

El fondo ambiental usa una sola instancia por documento, hasta 28 puntos en
escritorio y 16 en móvil; limita el repintado a aproximadamente 30 y 20 fps,
respectivamente. Los presupuestos de Canvas son 2.400.000 y 1.200.000 píxeles.
La portada tiene un presupuesto separado de hasta 700.000 píxeles y 16 o 10
puntos decorativos. Pausa, movimiento reducido, pestaña oculta, impresión y
receptor detienen los bucles. Estas cifras son límites de implementación,
no mediciones de rendimiento de un navegador real.

## Procedencia de las descargas

Se copiaron los archivos académicos previamente entregados, sin recomprimir,
editar su contenido ni sustituir sus imágenes. Sus revisiones visuales previas
corresponden a los documentos, no a la página web. La igualdad de bytes se
comprobó mediante SHA-256.

| Original entregado | Ruta relativa en el repositorio | Bytes |
| --- | --- | ---: |
| `Informe_Determinacion_Sexual_Animal.docx` | `exposiciones/assets/descargas/informe-determinacion-sexual-animal.docx` | 499460 |
| `Presentacion_Determinacion_Sexual_Animal.pptx` | `exposiciones/assets/descargas/presentacion-determinacion-sexual-animal.pptx` | 289974 |

SHA-256 del Word:

```text
52605524ebd3db1ddf3dc1461ac74b8008e8577b7c9b7d41a3efb79bb628cb9f
```

SHA-256 del PowerPoint:

```text
670b86c56a6af47891374190328f0e7631f86d6968196642773e4c825b7f3d2b
```

No se generó ni enlazó un PDF nuevo de Genética. El PDF previo de
Fisiopatología permanece separado.

## Verificación ejecutada y alcance

| Comprobación | Resultado observado y límite |
| --- | --- |
| Suite JavaScript final | **51/51 pruebas aprobadas**. Incluye lógica, DOM emulado, modos, controles y cambio desde Presentar a referencias sin reiniciar Punnett, redes, hormonas, comparador, temperatura, portada ni quiz. No valida render ni comportamiento nativo del navegador. |
| Suite Python final | **13/13 pruebas aprobadas**. Cubre generación, rutas, citas, recursos y regresiones; las referencias internas de los exploradores deben existir en la bibliografía. |
| Revisión independiente de módulos nuevos | 15/15 pruebas de `genetics-labs.test.mjs` y `genetics-ambient.test.mjs`: cruces, límites térmicos, reinicio, selección, limpieza, pausa, Canvas ausente, receptor e impresión simulada. No acredita geometría ni interacción nativa. |
| Regresión Fisiopatología | Comprobación final: las 15 escenas conservan exactamente su `outerHTML` frente a `5ee262f`. No se alteran sus simuladores, figuras ni descargas. |
| Determinismo | Una regeneración adicional conserva sin diferencias las cinco páginas generadas y el catálogo. |
| Sintaxis y diferencias | `node --check js/main.js`, `node --check exposiciones/shared/experience.mjs` y `git diff --check` aprobados. |
| Figuras | Siete SVG originales revisados mediante renders estáticos. No valida el tamaño efectivo, los cortes ni la composición del HTML en proyección. |
| Descargas | Dos archivos presentes; tamaños y SHA-256 coinciden con los originales entregados. Los contenedores Office ZIP pasan la comprobación de integridad (`testzip()` devuelve `None`). |
| Navegador de la nueva web | No ejecutado: bloqueo de la vista previa descrito abajo. No se afirma aprobación visual, impresión ni funcionamiento offline real. |

## Bloqueo de la vista previa y PR borrador

El inicio de `sites-preview`, preparado fuera del repositorio, falló con:

```text
bwrap: Can't mount proc on /newroot/proc: Operation not permitted
```

No se reintentó el inicio ni se modificaron permisos o mecanismos de
aislamiento para eludirlo. La inspección estática y jsdom continuaron dentro
del alcance disponible. El PR debe conservarse como borrador hasta completar
la revisión real en navegador. No hay capturas que acrediten la maquetación
de la nueva exposición, ni se ha verificado una publicación de esta rama.

## Aceptación manual pendiente

Servir el repositorio completo por HTTP local, como indica
`exposiciones/README.md`, y comprobar en ambos temas y modos:

1. Las 18 escenas a **1920×1080, 1366×768, 1024×768 y 390×844**: título,
   diagramas, tablas y bibliografía legibles; sin recortes ni desbordamiento
   horizontal; idea principal completa sin scroll interno de diapositiva.
2. Cambios Página/Diapositivas desde toolbar y acceso a referencias:
   conservar escena, cruces, vías, hormonas, patrón/posición térmica y quiz.
   Probar también índice, fragmentos, recarga y vuelta a biblioteca.
3. Teclado, selects, slider y botones nativos; foco visible y retorno desde
   diálogos; ampliación de figuras; lectura sin JavaScript.
4. Portada y fondo: perspectiva manual, puntero fino, dispositivo táctil,
   pausa, preferencia reducida, pestaña oculta, notas y salida de impresión.
5. Notas/ventanas emergentes, pantalla completa y navegación real de reveal;
   verificar consola y red sin errores. jsdom no acredita esas capacidades.
6. Abrir ambos descargables desde sus enlaces, comprobar tamaños y revisar
   impresión web; no ofrecer un PDF nuevo hasta exportarlo e inspeccionarlo.
7. Perfil limpio, servidor HTTP activo e internet desconectado: recursos
   esenciales locales, navegación y actividades. Los artículos externos
   necesitan conexión; no se promete funcionamiento mediante `file://`.
8. Volver a revisar Fisiopatología: sus 15 escenas, fondo respiratorio,
   laboratorios, casos, simulador y descargas deben conservar su comportamiento.

La finalización de las pruebas automáticas no sustituye esta aceptación
manual ni autoriza declarar la rama publicada.
