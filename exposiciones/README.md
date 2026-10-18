# VETJB · Exposiciones

Biblioteca estática en español. El mismo HTML generado contiene el modo Estudiar y las escenas de Presentar. No requiere cuentas, servicios de pago, CDNs ni un cambio de despliegue. `CNAME` y la portada conservan la publicación existente.

## Abrir en Windows

Antes de depender del modo sin internet, instala Python 3.11 o posterior desde https://www.python.org/downloads/ y un navegador actual. Descarga el ZIP de la rama del pull request y descomprímelo completo. En PowerShell, dentro de la carpeta que contiene `index.html`:

```powershell
py -3 -m http.server 8000 --bind 127.0.0.1
```

Abre http://127.0.0.1:8000/exposiciones/ . Mantén PowerShell abierto; termina con Ctrl+C. No basta hacer doble clic en un archivo HTML. Para presentar offline, conserva **todo el repositorio**: fuentes, iconos, vendor, figuras, HTML y módulos.

Rutas:

- `/exposiciones/`
- `/exposiciones/fisiopatologia/`
- `/exposiciones/fisiopatologia/equilibrio-acido-base/?modo=presentar`
- `/exposiciones/fisiopatologia/equilibrio-acido-base/?modo=estudiar`
- `/exposiciones/genetica/`

La rama no se publica en vetjb.com hasta aprobar y fusionar el pull request. Los enlaces locales requieren el servidor local; un QR de `127.0.0.1` no sirve para otro teléfono.

## Presentar, estudiar y notas

Presentar usa reveal.js 5.2.1 local: botones anterior/siguiente, flechas del teclado, índice, progreso y pantalla completa opcional. No avanza automáticamente. Las teclas de edición de campos y sliders no deben cambiar de escena. Estudiar ofrece lectura vertical, explicaciones ampliadas, bibliografía y soluciones completas accesibles sin JavaScript; las interacciones requieren JavaScript.

El cambio de modo conserva el identificador del apartado. Tema claro/oscuro se recuerda localmente si el navegador permite almacenamiento. La búsqueda ignora mayúsculas y tildes; sus filtros quedan en la URL.

Pulsa **Notas** o **S** en Presentar. Autoriza ventanas emergentes para este sitio si el navegador bloquea la vista del expositor. Con pantalla extendida, mueve esa ventana al portátil y la presentación al proyector. La vista de reveal incluye escena siguiente y temporizador. Las notas son guion académico público: cualquiera puede leerlas en el HTML. No son un canal confidencial.

La pantalla completa necesita una acción del usuario y permiso del navegador. Si no está disponible, usa F11 o presenta en una ventana maximizada.

## Simulación y casos

Henderson–Hasselbalch se aproxima como `pH = 6.1 + log10(HCO3 / (0.03 * PCO2))`, a 37 °C, con HCO₃⁻ en mmol/L y PCO₂ en mmHg. El modelo no corrige temperatura ni diferencias entre especies, proteínas u otros iones. El punto 24/40 es matemático; no representa un intervalo veterinario universal. No hay compensación automática ni diagnóstico a partir de dos números.

Los dos casos son construidos, con datos coherentes: ternero con diarrea y perro con hipoventilación reciente. Las respuestas y límites están explicados; no prescriben tratamientos. La autoevaluación es individual y local, sin nombres, correos ni sincronización entre dispositivos.

## Añadir la próxima exposición de Genética

No hay tema de Genética definido ni exposición ficticia publicada. Desde la raíz, cuando se conozca el tema:

```powershell
py -3 scripts/build-exposiciones.py new --subject genetica --slug nombre-real-del-tema
```

Esto crea un JSON en `exposiciones/content/` con estado `draft`; rechaza rutas inseguras y duplicados y no sobrescribe contenidos. Completa `title`, `summary`, `authors`, `cover`, `scenes`, `references` y, si existen, `resources`. Las rutas de figuras y descargas deben estar dentro de `/exposiciones/` y existir. Las referencias usan `id`, `citation`, `url` HTTPS y `scope`. Conserva identificadores de escenas estables.

Las materias y sus metadatos se configuran en `exposiciones/subjects.json`; sus acentos están aislados en `shared/expo.css`.

Componentes disponibles por `layout`: `cover`, `figure`, `compare`, `steps`, `default`, `case`, `quiz`, `closing`, `references`. Solo ácido-base usa `simulator`; una exposición de Genética no debe copiar ni editar ese módulo. Los futuros cuadros de Punnett se añadirán cuando el tema los necesite.

Revisa fuentes, citas, datos, licencias, textos alternativos y legibilidad. Un borrador no aparece en el catálogo. Para generar HTML revisable, cambia su estado a `published` **en una rama**, no en `main`, y ejecuta:

```powershell
py -3 scripts/build-exposiciones.py build
py -3 -m unittest discover -s tests -p "test_*.py" -v
```

`published` significa incluido en los archivos generados de esa rama, no desplegado en internet. Revisa las páginas localmente y abre un pull request. La publicación efectiva depende de su aprobación y del alojamiento existente. El generador escribe HTML versionado; GitHub Pages no necesita ejecutar Python ni npm.

No coloques información privada en borradores: aunque no aparezcan en el catálogo, el repositorio es público.

## Pruebas

Python no necesita dependencias para generación y validación. Para las pruebas de DOM emulado instala Node.js 22 o posterior y, con conexión, ejecuta una vez `npm ci --ignore-scripts` en la raíz. Después:

```powershell
npm test
py -3 -m unittest discover -s tests -p "test_*.py" -v
node --check js/main.js
```

Las pruebas jsdom comprueban lógica y DOM; no sustituyen un navegador real ni verifican geometría, ventanas emergentes, fullscreen o comportamiento de proyección. Consulta `docs/exposiciones-verificacion.md` para los resultados reales de esta entrega y lo pendiente.

## Respaldo e impresión

El informe Word es el material académico real asociado. El respaldo PDF es estático; contiene escenarios calculados, razonamiento de casos y respuestas, y no conserva controles interactivos. Solo se muestran descargas para archivos existentes.

La hoja de impresión muestra las escenas y las soluciones. Para un PDF desde el navegador, utiliza Estudiar, Ctrl+P, destino «Guardar como PDF» y revisa la vista previa. La salida del navegador puede variar: el PDF de respaldo adjunto es la alternativa revisada. No se instala un service worker.

Para comprobar offline en tu equipo: abre un perfil de navegador nuevo, inicia el servidor local, desconecta internet y prueba navegación, figuras, casos y simulador. Las fuentes bibliográficas externas sí necesitan conexión. En esta entrega esa prueba real quedó pendiente por la limitación de vista previa descrita en la verificación.
