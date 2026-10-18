# VETJB · Exposiciones

Biblioteca estática en español. Cada exposición contiene en un mismo HTML los modos **Página** (lectura vertical) y **Diapositivas**: equilibrio ácido-base tiene 15 escenas y determinación sexual animal, 14. No requiere cuentas, servicios de pago, CDNs ni un cambio de despliegue. `CNAME` y la portada conservan la publicación existente.

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
- `/exposiciones/genetica/cromosomas-y-determinacion-sexual/?modo=presentar`
- `/exposiciones/genetica/cromosomas-y-determinacion-sexual/?modo=estudiar`

La rama no se publica en vetjb.com hasta aprobar y fusionar el pull request. Los enlaces locales requieren el servidor local; un QR de `127.0.0.1` no sirve para otro teléfono.

## Página, diapositivas y notas

Diapositivas usa reveal.js 5.2.1 local: botones anterior/siguiente, flechas del teclado, índice, progreso y pantalla completa opcional. No avanza automáticamente. Las teclas de edición de campos y sliders no deben cambiar de escena. Página ofrece lectura vertical, explicaciones ampliadas, bibliografía y soluciones completas accesibles sin JavaScript; las interacciones requieren JavaScript.

El selector **Página / Diapositivas** cambia de formato sin recargar y conserva el apartado, las entradas del simulador, las respuestas y los pasos revelados. Las URL anteriores `modo=estudiar` y `modo=presentar` siguen siendo compatibles. El botón **Pausar movimiento** detiene las animaciones; el sistema respeta la preferencia de movimiento reducido. Tema claro/oscuro se recuerda localmente si el navegador permite almacenamiento. La búsqueda ignora mayúsculas y tildes; sus filtros quedan en la URL.

Pulsa **Notas** o **S** en Diapositivas. Autoriza ventanas emergentes para este sitio si el navegador bloquea la vista del expositor. Con pantalla extendida, mueve esa ventana al portátil y la presentación al proyector. La vista de reveal incluye escena siguiente y temporizador. Las notas son guion académico público: cualquiera puede leerlas en el HTML. No son un canal confidencial.

La pantalla completa necesita una acción del usuario y permiso del navegador. Si no está disponible, usa F11 o presenta en una ventana maximizada.

## Fisiopatología: laboratorios, simulación y casos

La portada presenta un mapa original de partículas en tres perspectivas: organismo, regulación y relación química. Puedes seleccionarlas con botones; en Página, el desplazamiento también cambia la perspectiva. La figura es conceptual, no anatomía diagnóstica.

El fondo ambiental acompaña ambos formatos con una red de partículas sensible al puntero y ondas lentas inspiradas en la respiración. Destaca en la portada y en regulación pulmonar; reduce su intensidad en el resto. Es decorativo: no representa una señal clínica ni modifica el simulador. Comparte el botón **Pausar movimiento**, respeta movimiento reducido, se detiene al ocultar la pestaña y no se imprime. En pantallas táctiles conserva la composición sin perseguir el dedo; si Canvas no está disponible, permanece un fondo estático.

Los laboratorios de bicarbonato y riñón muestran mecanismos por pasos. El laboratorio pulmonar permite variar la ventilación alveolar relativa: `PCO2 = 40 / (ventilación / 100)`. Es una relación aislada en estado estacionario, con producción de CO₂ constante, CO₂ inspirado despreciable y aproximación alveolar–arterial; no simula tiempo, frecuencia respiratoria, V/Q ni respuesta de un paciente.

El gráfico del simulador une PCO₂ y HCO₃⁻ con líneas de igual pH. El punto se mueve con las entradas; desaparece si son inválidas. Las líneas no son intervalos de normalidad ni regiones de diagnóstico. Los referentes de interacción y el alcance de reutilización se registran en `docs/exposiciones-referentes.md`.


Henderson–Hasselbalch se aproxima como `pH = 6.1 + log10(HCO3 / (0.03 * PCO2))`, a 37 °C, con HCO₃⁻ en mmol/L y PCO₂ en mmHg. El modelo no corrige temperatura ni diferencias entre especies, proteínas u otros iones. El punto 24/40 es matemático; no representa un intervalo veterinario universal. No hay compensación automática ni diagnóstico a partir de dos números.

Los dos casos son construidos, con datos coherentes: ternero con diarrea y perro con hipoventilación reciente. Las respuestas y límites están explicados; no prescriben tratamientos. La autoevaluación es individual y local, sin nombres, correos ni sincronización entre dispositivos.

## Genética: cromosomas y determinación sexual

La investigación bibliográfica de Genética y Mejoramiento Animal, Quinto A, UTMACH, se edita en `content/genetica--cromosomas-y-determinacion-sexual.json`. Sus 14 escenas distinguen constitución cromosómica, identidad gonadal y fenotipo; presentan las redes testicular y ovárica, las señales hormonales, cinco sistemas de determinación, diversidad en peces y ejemplos veterinarios bovinos y caninos. El primordio gonadal se integra en los niveles del desarrollo, los gametos en los cruces, ambas vías en una misma escena y XX/X0 en el comparador. Las explicaciones y notas conservan los conceptos y sus límites. No atribuye experimentos ni pacientes al estudiante.

Hay siete exploradores: niveles del desarrollo, cuadro de Punnett con modelos XX/XY y ZZ/ZW, una comparación de redes gonadales con ambas vías, señales AMH/testosterona/DHT, comparación de sistemas, ploidía y `csd` en abeja melífera, y patrones térmicos MF, FM y FMF. La autoevaluación añade cinco preguntas con retroalimentación, puntuación local y reinicio. Los controles conservan su selección al cambiar entre Página y Diapositivas; las flechas del teclado de un campo o selector mantienen su función nativa.

Los cruces expresan probabilidades teóricas bajo segregación y fecundación equivalentes, no una proporción exacta por camada. La actividad térmica no contiene grados ni porcentajes de una especie y no recomienda temperaturas de incubación. El comparador distingue XX/X0, haplodiploidía y el sistema `csd` de la abeja melífera; no asume que todo diploide sea hembra. Los ejemplos de freemartinismo y desarrollo sexual canino necesitan contexto y pruebas: la web no confirma diagnósticos.

La portada ofrece tres perspectivas manuales: Cromosomas, Desarrollo y Diversidad. Un fondo genético independiente dibuja hélices, motivos cromosómicos y redes discretas; el puntero fino produce un efecto decorativo. Ambos respetan pausa global, movimiento reducido, pestaña oculta, impresión y receptor de notas. No reemplazan el fondo respiratorio de Fisiopatología. SVG y texto conservan la información si Canvas no está disponible.

Los diagramas de Genética se integran como SVG inline con superficies transparentes y colores adaptados al tema claro u oscuro. Los iconos se usan como apoyo puntual para reconocer conceptos y controles; las etiquetas textuales conservan el significado. No se colocan paneles blancos opacos sobre el tema oscuro. El archivo original de cada figura sigue disponible para ampliación.

Cuatro aliases mantienen los enlaces anteriores: `gonada-bipotencial` dirige a `niveles-del-desarrollo`, `cromosomas-y-gametos` a `cruces-cromosomicos`, `via-ovarica` a `via-testicular` y `sistema-xx-x0` a `comparacion-de-sistemas`. Son destinos de compatibilidad, no escenas adicionales.

Se conservan los siete SVG originales, 12 referencias verificadas y los archivos Word y PowerPoint preparados para este tema. Los descargables no se modifican en esta revisión: el PowerPoint mantiene sus 20 diapositivas. Los detalles de procedencia y hashes están en [el registro inicial de Genética](../docs/exposiciones-verificacion-determinacion-sexual.md); el alcance y los pendientes actuales están en [la revisión visual de 14 escenas](../docs/exposiciones-verificacion-genetica-visual.md). El estado `published` del JSON solo incorpora la exposición al catálogo generado de la rama; no acredita un despliegue en vetjb.com.

Archivos de implementación:

- `shared/genetics-models.mjs` y `shared/genetics-labs.mjs`: relaciones educativas y controles.
- `scripts/expo_genetics.py`: fragmentos semánticos de los siete exploradores.
- `shared/genetics-hero.mjs`, `scripts/expo_genetics_hero.py` y `shared/ambient-genetics.mjs`: portada y fondo.
- `shared/genetics.css`, `shared/genetics-ambient.css` y `shared/genetics-layout.css`: estilos aislados.
- `assets/figuras/genetica/determinacion-sexual/`: figuras originales; atribución y alcance en `assets/figuras/LICENSES.md`.

## Añadir otra exposición

Desde la raíz, usando el tema real:

```powershell
py -3 scripts/build-exposiciones.py new --subject genetica --slug nombre-real-del-tema
```

Esto crea un JSON en `exposiciones/content/` con estado `draft`; rechaza rutas inseguras y duplicados y no sobrescribe contenidos. Completa `title`, `summary`, `authors`, `cover`, `scenes`, `references` y, si existen, `resources`. Las rutas de figuras y descargas deben estar dentro de `/exposiciones/` y existir. Las referencias usan `id`, `citation`, `url` HTTPS y `scope`. Conserva identificadores de escenas estables. Cuando integres un apartado en otro, registra su antiguo identificador en `aliases` de la escena receptora y comprueba que el enlace profundo conserve un destino único.

Las materias y sus metadatos se configuran en `exposiciones/subjects.json`; sus acentos están aislados en `shared/expo.css`.

Componentes disponibles por `layout`: `cover`, `figure`, `compare`, `steps`, `default`, `case`, `quiz`, `closing`, `references`. Solo ácido-base usa `simulator`; una exposición de Genética no debe copiar ni editar ese módulo. Los exploradores genéticos se activan por identificadores de escena en la exposición de determinación sexual; no se añaden automáticamente a otro tema.

Revisa fuentes, citas, datos, licencias, textos alternativos y legibilidad. Un borrador no aparece en el catálogo. Para generar HTML revisable, cambia su estado a `published` **en una rama**, no en `main`, y ejecuta:

```powershell
py -3 scripts/build-exposiciones.py build
py -3 -m unittest discover -s tests -p "test_*.py" -v
```

`published` significa incluido en los archivos generados de esa rama, no desplegado en internet. Revisa las páginas localmente y abre un pull request. La publicación efectiva depende de su aprobación y del alojamiento existente. El generador escribe HTML versionado; GitHub Pages no necesita ejecutar Python ni npm.

Vuelve a ejecutar el generador cuando cambies contenido, estilos o módulos JavaScript y revisa todos los HTML regenerados: biblioteca, categorías y exposiciones publicadas en la rama. Cada recurso versionado lleva `?v=` con un hash de su contenido; un `importmap` anterior al script de entrada versiona también las dependencias estáticas y dinámicas. Así, el HTML nuevo solicita el CSS y los módulos nuevos aunque el navegador conserve la versión anterior. Requiere un navegador actual con soporte de import maps. El CSS de Reveal y el script clásico de QR son archivos vendor sin cambios y no forman parte de este mapa.

No coloques información privada en borradores: aunque no aparezcan en el catálogo, el repositorio es público.

## Pruebas

Python no necesita dependencias para generación y validación. Para las pruebas de DOM emulado instala Node.js 22 o posterior y, con conexión, ejecuta una vez `npm ci --ignore-scripts` en la raíz. Después:

```powershell
npm test
py -3 -m unittest discover -s tests -p "test_*.py" -v
node --check js/main.js
```

Las pruebas jsdom comprueban lógica y DOM; no sustituyen un navegador real ni verifican geometría, ventanas emergentes, fullscreen o comportamiento de proyección. Consulta `docs/exposiciones-verificacion-e1.md` para el trabajo previo de Fisiopatología, `docs/exposiciones-verificacion-determinacion-sexual.md` para la incorporación inicial de Genética y `docs/exposiciones-verificacion-genetica-visual.md` para la revisión de 14 escenas. Los resultados y pendientes de una entrega no validan automáticamente la otra.

## Respaldo e impresión

Fisiopatología ofrece el informe académico actualizado en Word, su versión PDF y una presentación PowerPoint de 15 diapositivas. Los tres archivos comparten las referencias y los dos casos didácticos de esa exposición. Genética ofrece su informe Word y su PowerPoint de 20 diapositivas, con notas, imágenes y bibliografía; la síntesis web tiene 14 escenas. Ambos archivos de Genética se conservan sin cambios en esta revisión. No se ha creado un PDF nuevo de Genética. Las animaciones y los controles interactivos se exploran en la web. Solo se muestran descargas para archivos existentes y sus enlaces incluyen una versión basada en el contenido para evitar archivos antiguos en caché.

La hoja de impresión está preparada para mostrar las escenas y las soluciones. Para un PDF desde el navegador, utiliza Estudiar, Ctrl+P, destino «Guardar como PDF» y revisa la vista previa. La salida puede variar; la impresión web de Genética sigue pendiente de inspección real. El PDF descargable de respaldo corresponde únicamente a Fisiopatología. No se instala un service worker.

Para comprobar offline en tu equipo: abre un perfil de navegador nuevo, inicia el servidor local, desconecta internet y prueba navegación, figuras, casos y simulador. Las fuentes bibliográficas externas sí necesitan conexión. La comprobación actual en navegador está bloqueada por una política de permisos guardados de acceso a vetjb.com; no se intentan rutas alternativas para eludirla. La inspección estática y los renders de SVG no validan la maquetación ni el funcionamiento offline real. El bloqueo de vista previa del registro inicial corresponde a aquella entrega, no a esta revisión.
