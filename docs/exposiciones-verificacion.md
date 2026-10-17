# Exposiciones E0 · Verificación

Fecha: 17 de octubre de 2026. Base: `a1da5d89f1d2aecd96db3142764e1121c9eaab38`.

## Alcance implementado

- Acceso EXPOSICIONES en el menú compartido de escritorio/móvil y en portada.
- Cuatro rutas con `index.html`; biblioteca con búsqueda y filtro por materia.
- Piloto de ácido-base: 15 escenas, dos modos desde una fuente JSON, tres SVG originales, simulador, dos casos, cinco preguntas, once referencias y notas públicas.
- Tema claro/oscuro, índice, QR local, vista del expositor y pantalla completa opcional.
- Genética vacía, metadatos separados y creador seguro de borradores.
- Informe Word real asociado y respaldo PDF estático con soluciones completas.

## Comprobado

| Comprobación | Resultado y alcance |
| --- | --- |
| `node --test tests/*.test.mjs` | 11 pruebas aprobadas: cinco matemáticas y seis de DOM emulado con jsdom. |
| `python3 -m unittest discover -s tests -p 'test_*.py' -v` | Seis pruebas aprobadas: contenido/citas, rutas y recursos, casos, HTML estático, Genética y creación de borradores. |
| `node --check` | Sintaxis válida en `js/main.js`, `experience.mjs` y `simulator.mjs`. |
| `git diff --check` | Sin errores de espacios o marcadores de conflicto. |
| Recursos y dependencias | Todos los destinos locales referidos por las páginas generadas existen. Reveal, QR, fuentes, iconos e ilustraciones se sirven localmente. Hashes de vendor registrados. |
| Simulador | Valores independientes con tolerancias explícitas, cambios monotónicos, proporción constante, vacío/NaN/no finitos/cero/negativos/límites y reinicio. No diagnóstico automático. |
| DOM emulado | Búsqueda sin tildes/mayúsculas, combinación de filtro, estado vacío, vínculo de modo con escena, temas, cierre/foco de diálogo, controles, ambos casos, quiz y guardia de teclado. |
| Contenido | Referencias 1–11 en primera aparición, sin citas huérfanas. Cálculos: ternero pH 7,15 y AG 27,8; perro pH 7,28. Todos son datos construidos. |
| Borrador de Genética | Creado en directorio temporal, validado, excluido del catálogo y eliminado al cerrar la prueba. Rechazo de slug inseguro y duplicados. No modifica el simulador. |
| Figuras y PDF | Tres diagramas revisados fisiológicamente y renderizados en claro/oscuro y a 390 px; PDF estático de 20 páginas revisado visualmente. Esto no acredita la maquetación HTML. |
| Protección del sitio | `CNAME`, fotografías originales, fuentes, sprite, datos de contacto y configuración de publicación conservados. Sin `.env`, DNS, secretos, pagos ni servicios nuevos. |

## Pendiente de aceptación en navegador real

El supervisor de vista previa del entorno falló antes de servir la página:

```text
bwrap: Can't mount proc on /newroot/proc: Operation not permitted
```

Se corrigió previamente una ruta local de preview, pero el error de permisos persistió. `sites-preview status` confirmó el servidor detenido. No se modificaron permisos del entorno ni la publicación para eludirlo.

Por tanto, **no se afirma revisión visual de la web, prueba offline real ni navegación real aprobada**. Las pruebas jsdom no cubren geometría, render de reveal, ventanas del expositor, permisos de fullscreen ni acciones nativas del navegador. No hay capturas web que acrediten esos resultados. El pull request se entrega en borrador.

Antes de aprobar, usando el servidor HTTP local descrito en `exposiciones/README.md`:

1. Revisar portada/galería/menú e iconos sin regresiones; abrir y recargar las cuatro rutas.
2. Revisar todas las escenas a 1920×1080, 1366×768, 1024×768 y móvil 390×844, en ambos temas. Confirmar texto legible sin recortes ni desbordamientos.
3. Probar flechas, Tab, índices, retorno de foco, cierre con Escape, sliders, entradas, cambio de modo y conservación de apartado.
4. Abrir Notes con pantalla extendida, verificar temporizador y escena siguiente; comprobar mensaje de popup bloqueado. Activar/salir de pantalla completa.
5. Resolver/reiniciar casos y quiz en ambos modos; revisar errores del simulador y QR/copiar enlace.
6. Revisar consola/red, recursos sin 404, lectura con JS desactivado y movimiento reducido.
7. En un perfil limpio sin caché y sin internet, mantener servidor local activo y comprobar toda la interacción esencial. Los enlaces bibliográficos externos requieren conexión.
8. Comprobar impresión del navegador y sus estados finales. El PDF estático revisado se incluye como respaldo independiente.

## Limitaciones científicas

El modelo utiliza constantes aproximadas a 37 °C y omite otros amortiguadores, iones y correcciones. El caso bovino no adopta una regla canina de compensación ni clasifica la brecha sin un intervalo apropiado. La secuencia canina apoya una alteración respiratoria aguda; no demuestra por sí sola su causa ni oxigenación. Las notas, casos, fuentes y código son públicos.

## Publicación

La rama y el pull request son revisables; no equivalen a despliegue. No se fusiona automáticamente. La publicación en vetjb.com queda pendiente de revisión y aprobación.

## Reproducir el respaldo PDF (opcional)

El archivo ya está incluido. Para regenerarlo desde el JSON canónico se usaron ReportLab 4.4.9, Sharp 0.35.5 y los archivos `DejaVuSans.ttf`/`DejaVuSans-Bold.ttf`. El exportador es `scripts/export-expo-pdf.py` y acepta `--source`, `--assets`, `--output` y `--font-dir`. No necesita los PNG intermedios.

En un entorno preparado, desde la raíz:

```powershell
py -3 -m pip install reportlab==4.4.9
npm install --no-save --package-lock=false sharp@0.35.5
py -3 scripts/export-expo-pdf.py --font-dir "C:\ruta\DejaVuSans"
```

La ruta de fuentes debe contener ambos archivos TTF; instalar estas dependencias requiere conexión. No son necesarias para abrir la web ni el PDF existente. Tras exportar, revisar todas las páginas antes de sustituir el respaldo publicado.
