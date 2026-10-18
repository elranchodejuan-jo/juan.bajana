# Exposiciones E1 · Laboratorios visuales

Fecha de trabajo: 17–18 de octubre de 2026. Base: `b10dc790114f4b861482cb66878d6dca451e82fd` (E0 ya fusionada).

## Cambios

- Se conservan exactamente 15 escenas y las cuatro rutas existentes.
- Selector visible Página / Diapositivas, sin recarga, con conservación de apartado, entradas y respuestas.
- Portada original: silueta animal simbólica, órganos reguladores y relación química; transición de partículas, profundidad discreta, control por botones y scroll.
- Laboratorios de reacción bicarbonato–CO₂, ventilación relativa y funciones renales; gráfico de líneas de igual pH conectado al simulador.
- Pausa global y preferencia de movimiento reducido; alternativas SVG y texto estático; mismo contenido y controles en ambos formatos.
- Texto proyectado más breve, 12 referencias en orden Vancouver y supuestos de los modelos explícitos.
- Créditos de inspiración y registro del alcance de reutilización en `exposiciones-referentes.md`. Código e ilustraciones nuevos originales; no se importaron fotos, modelos 3D, scripts ni algoritmos clínicos de las referencias.

## Verificación ejecutada

| Comprobación | Evidencia y límites |
| --- | --- |
| Node | 25 pruebas: cinco de HH, nueve de experiencia y once de laboratorios. Incluyen pares numéricos independientes, monotonía, invalidez, reinicios, controles, teclado protegido, pausa global y alternativa sin Canvas. |
| Cambio de formato | Ida/vuelta con el motor reveal.js local en jsdom; mantiene la escena, HCO₃⁻ y selección del cuestionario. CSS se declara cargado en la prueba: no acredita render, tamaño, foco nativo ni red real. |
| Python | Siete pruebas: citas, 15 escenas, cuatro rutas, IDs y recursos locales, cálculos de casos, generación segura, Genética vacía y ausencia de gráficos ácido-base en otra materia. |
| SVG estáticos | 14 renders inspeccionados: portada en tres estados × dos temas y cuatro laboratorios × dos temas. No acreditan tamaño efectivo en proyección, maquetación HTML ni animación Canvas. |
| Ciencia | Revisión de ecuación de ventilación, recorte de isolíneas HH, dirección reversible y diferencia entre conservar bicarbonato y reponer base por excreción neta de ácido. |
| Sintaxis y diff | Módulos JavaScript/Python y revisión de diferencias; sin cambios de hosting, DNS, credenciales o dependencias de producción. |
| Referentes visuales | AMC VetAtlas y Vinyo inspeccionados en navegador y código público. Se observó la transformación de Vinyo a una red de puntos. |
| Versión anterior pública | Se comprobó únicamente la portada de E0 en modo Presentar. Esto no valida el código E1 de esta rama. |

## Límite de la vista previa

El supervisor administrado no pudo iniciar E1 y confirmó estado detenido:

```
bwrap: Can't mount proc on /newroot/proc: Operation not permitted
```

No se alteraron permisos, servidor, publicación ni protección de red para eludirlo. No hay capturas de navegador de E1 ni prueba offline real. Los renders estáticos de SVG, si se adjuntan en la revisión, acreditan únicamente esos gráficos, no la maquetación web o la animación Canvas. El PR se entrega en borrador por esta limitación.

## Aceptación manual pendiente

Abrir con el servidor local descrito en `exposiciones/README.md` y comprobar:

1. Las 15 escenas a 1920×1080, 1366×768, 1024×768 y 390×844, en Página/Diapositivas y claro/oscuro, sin recortes ni texto ilegible.
2. Cambio entre formatos desde una escena intermedia: conservar controles, respuestas, paso de caso y posición; probar también entradas por URL, índice y recarga.
3. Portada: tres perspectivas por teclado/tacto y scroll; pausa global/local; preferencia de movimiento reducido; pestaña oculta y escena fuera de vista.
4. Pulmón: 50 % → 80,0 mmHg; 100 % → 40,0; 150 % → 26,7. Buffer y riñón: dirección, paso, selección y reinicio.
5. Simulador: el punto sigue ambas barras; ante un número inválido se ocultan resultado y punto, sin conservar una gráfica engañosa.
6. Casos, quiz, foco de diálogos, Notes/popups, pantalla completa, consola/red y lectura sin JavaScript.
7. Perfil limpio sin internet con servidor HTTP activo; recursos esenciales locales. Revisar impresión y estados estáticos de los laboratorios.

## Alcance científico y materiales

El modelo pulmonar es estacionario: producción de CO₂ constante, CO₂ inspirado despreciable y aproximación alveolar–arterial. Sus porcentajes no son frecuencia respiratoria ni predicen un paciente. El movimiento es ilustrativo. HH omite otros amortiguadores y no emite un diagnóstico; las isolíneas no son intervalos clínicos por especie. Los casos siguen siendo escenarios construidos.

Word y PDF existentes corresponden al contenido académico base E0 y se conservan; no representan los nuevos controles o animaciones. La impresión web E1 debe revisarse en navegador antes de utilizarla como entrega final.

## Publicación

La actualización se entrega en su propia rama y PR; no se fusiona automáticamente ni se considera publicada por existir en GitHub. E0 permanece separada de esta revisión.
