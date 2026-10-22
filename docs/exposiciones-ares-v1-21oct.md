# Caso Ares primera versión

Se incorpora Farmacología II a la biblioteca existente mediante `/exposiciones/farmacologia-ii/caso-ares/`. El recorrido tiene 16 escenas, 17 referencias Vancouver con enlaces y tres preguntas que se comprueban por separado. El mismo JSON alimenta Página y Diapositivas.

## Alcance documental

La exposición integra los seis aportes y conserva el reparto: Robinson Macas, sulfametoxazol; Kristhel Procel, trimetoprim; Carolina Cajamarca, metronidazol; Samira Yunga, pamoato de pirantel; Tiffany Machuca, praziquantel; Jhon Balcázar, sulfato ferroso. Apetomax sustituye la mención de Apetovit. Juan José Bajaña Chuno figura como coordinador en los créditos.

Se separan los cálculos de etiqueta y la pauta comunicada. Bactrivet contiene 80 mg/mL de sulfametoxazol y 16 mg/mL de trimetoprim; los 3 mL reportados equivalen a 240 y 48 mg. La tableta de metronidazol de 500 mg se expresa como concentración declarada en una ficha, pendiente de confirmación del envase. Apetomax se comunicó a 7 mL; 7,20 mL es el ejercicio académico. Relámpago se administró el 2 de octubre, pero su volumen real no está confirmado.

La historia describe unas tres semanas de alteraciones digestivas. El predominio de bandas sobre segmentados concuerda con la desviación izquierda degenerativa informada. Se incluye la excepción relevante de ENOVAT para ese patrón, manteniendo la diferencia entre una guía de diarrea aguda y este caso. Los hallazgos no se convierten en agente bacteriano, ferropenia ni infección urinaria confirmados.

Solo se representan los pesos basal de 21,60 kg y final de 22 kg, con escala común desde cero: +0,40 kg y aproximadamente +1,85 %. La recuperación completa es una apreciación del tutor. Las tablas mixtas de observaciones y ejemplos se excluyen de los resultados seriados; no se inventan fechas de pesaje, adherencia, normalización analítica ni alta.

## Fotografías

Cinco fotos reales aportadas por el tutor: Ares actual, examen físico y tres aspectos fecales. Las tres muestras fecales son previas al tratamiento y su orden es desconocido. Se aplicó únicamente reducción de tamaño y compresión para web, sin modificar el contenido. No se publica la historia manuscrita ni el informe íntegro con datos de contacto del tutor.

## Interacción y material autónomo

Los widgets se limitan a la exposición de Ares: recorrido del bloqueo secuencial del folato, reconstrucción de la dosis histórica a dos pesos y gráfica de peso. El cambio a 22 kg no recomienda un volumen nuevo. Las preguntas y cálculos conservan estado al alternar formato. No se añaden servicios, cuentas, CDNs ni telemetría.

`scripts/export-ares-standalone.py RUTA/Exposicion_Ares_Farmacologia_II_v1.html` crea una versión independiente con fotos, fuentes, estilos y controles incrustados. Abre directamente sin servidor. La bibliografía enlazada requiere internet. Para abrir Word y PowerPoint sin conexión, sus archivos deben estar en la misma carpeta que ese HTML. Esta exportación utiliza navegación propia sencilla; la web integrada conserva Reveal y los controles del sitio.

## Verificación

- Revisión clínica independiente del contenido: sin discrepancias bloqueantes tras corregir las flechas de inhibición para atribuirlas a los fármacos.
- 16 pruebas Python del sitio y 64 pruebas JavaScript aprobadas, incluidas tres pruebas de aritmética farmacológica.
- Validación DOM de la versión autónoma: 16 escenas, imágenes y estilos incrustados, ausencia de scripts remotos, resultados de 13,33 y 13,09 mg/kg al comparar pesos, mecanismo, comprobación de una pregunta sin revelar las demás y conservación del estado al cambiar formato.
- No se completó inspección visual en navegador: el navegador conectado carecía de contexto originario y el navegador remoto no alcanzó el servidor local (conexión rechazada). Las pruebas DOM no acreditan geometría visual, proyección, fullscreen ni funcionamiento del navegador del usuario.

## Publicación

El contenido se entrega mediante rama y pull request, conforme a `AGENTS.md`; no se fusiona automáticamente. `status: published` incluye la exposición en el catálogo generado de la rama y no certifica su publicación en vetjb.com. Las descargas se incluyen cuando los archivos finales están validados.
