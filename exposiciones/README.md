# VETJB · Exposiciones

Biblioteca estática en español. Cada exposición contiene en un mismo HTML los modos **Página** (lectura vertical) y **Diapositivas**: equilibrio ácido-base tiene 12 escenas y determinación sexual animal, 16 (portada y 15 de contenido). No requiere cuentas, servicios de pago, CDNs ni un cambio de despliegue. `CNAME` y la portada conservan la publicación existente.

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

La revisión del 21 de octubre centra la exposición en el caso publicado de Mafe, una novilla Holstein. Después de la portada, solo dos escenas introducen pH/acidemia/alcalemia y acidosis/alcalosis. Seis escenas recorren anamnesis, pruebas, etiología, patogenia, repercusión sistémica, diagnóstico y evolución. Se distingue el pH ruminal 5,5 de la gasometría sanguínea no aportada. El simulador conserva las herramientas de amortiguación, pulmón y riñón en desplegables opcionales de la vista Página, sin añadir teoría al recorrido breve.

Los dos casos construidos —ternero con diarrea y perro con hipoventilación reciente— son las preguntas 4 y 5 de **Preguntas para el grupo**, que conserva cinco preguntas. En Diapositivas se plantea una pregunta cada vez; Página muestra las cinco. Cada respuesta se comprueba por separado; los casos conservan historia, tipo de muestra, datos completos y razonamiento ampliado después de comprobar. Cambiar de formato mantiene la pregunta y las respuestas. Los enlaces antiguos de ambos casos seleccionan su pregunta. El cierre reúne referencias y tres descargables; `#conclusiones` conserva ese destino.

Las ilustraciones de los casos se generaron para este material y no corresponden a pacientes reales. Los datos son didácticos y no proceden de las imágenes. No se prescriben tratamientos. La autoevaluación es individual y local, sin nombres, correos ni sincronización entre dispositivos.

## Genética: cromosomas y determinación sexual

La investigación bibliográfica de Genética y Mejoramiento Animal, Quinto A, UTMACH, se edita en `content/genetica--cromosomas-y-determinacion-sexual.json`. La revisión del Grupo 4 contiene **16 escenas: una portada y 15 de contenido**, distribuidas en tres bloques: cromosomas sexuales, diferenciación sexual y sistemas de determinación sexual. Permite repartir tres diapositivas de contenido por integrante. La autoría incluye a Juan José Bajaña Chuno, Britney Gissel Cujilema Montero, Joselyn María Pambi Gaona, Guillermo Ramiro Ramírez Medina y Dennisse Carolina Silva Del Rosario.

El recorrido comienza con qué son los cromosomas sexuales, sus características y las diferencias X/Y. Después distingue cuatro niveles del desarrollo —cromosómico, gonadal, hormonal y fenotípico—, explica las vías masculina y femenina y presenta el freemartinismo bovino como ejemplo sencillo. El último bloque compara XX/XY, ZZ/ZW, haplodiploidía y determinación dependiente de la temperatura. Peces, caso canino, XX/X0 y las diapositivas separadas de aplicaciones, conclusión y bibliografía quedan fuera del recorrido acordado. Las explicaciones y notas amplían el tema sin atribuir al grupo experimentos ni pacientes.

Hay **nueve exploradores**: cromosomas X/Y/Z/W, cuatro niveles del desarrollo, cuadro de Punnett con modelos XX/XY y ZZ/ZW, redes gonadales, señales AMH/testosterona/DHT, freemartinismo por pasos, comparación de cuatro sistemas, ploidía y `csd` en abeja melífera, y patrones térmicos MF, FM y FMF. Los controles conservan su selección al cambiar entre Página y Diapositivas; las flechas de un campo o selector mantienen su función nativa.

Cinco preguntas orales se abren en diálogos desde las escenas 4, 7, 10, 13 y 15: SRY, interacción de niveles, freemartinismo, heterogametia y temperatura. Se revela la respuesta después de plantear la pregunta. Una autoevaluación opcional con esos cinco temas, las fuentes completas y los materiales están en un apéndice fuera de las 16 escenas. En Página se pueden estudiar con el contenido ampliado; en Diapositivas se consultan mediante sus controles, sin aumentar el índice ni el progreso.

Los cruces expresan probabilidades teóricas bajo segregación y fecundación equivalentes, no una proporción exacta por camada. La actividad térmica no contiene grados ni porcentajes de una especie y no recomienda temperaturas de incubación. El ejemplo de `csd` no asume que todo diploide sea hembra ni representa a todos los himenópteros. El antecedente de gemelaridad bovina por sí solo no confirma freemartinismo; la web no diagnostica animales.

La portada ofrece tres perspectivas manuales: Cromosomas, Desarrollo y Diversidad. Un fondo genético independiente dibuja hélices, motivos cromosómicos y redes discretas; el puntero fino produce un efecto decorativo. Ambos respetan pausa global, movimiento reducido, pestaña oculta, impresión y receptor de notas. No reemplazan el fondo respiratorio de Fisiopatología. SVG y texto conservan la información si Canvas no está disponible.

Los diagramas de Genética se integran con superficies transparentes y colores del tema claro u oscuro. Los iconos ayudan a reconocer conceptos y controles; las etiquetas textuales conservan el significado. Los originales previos permanecen como recursos históricos, pero el antiguo esquema de tres niveles no representa la escena actual de cuatro niveles.

Los identificadores de compatibilidad conducen a secciones vigentes: `gonada-bipotencial` a `via-testicular`, `cromosomas-y-gametos` a `caracteristicas-cromosomas`, `via-ovarica` a `desarrollo-femenino`, `sistema-xx-x0` a `comparacion-de-sistemas`, `diversidad-en-peces` a `sistemas-determinacion` y `desarrollo-sexual-canino` a `niveles-del-desarrollo`. Los últimos tres son destinos generales para enlaces antiguos, no preservan los bloques retirados. Fuentes y autoevaluación tienen sus propios destinos en el apéndice, sin IDs duplicados.

El JSON contiene diez referencias numeradas por primera aparición. La actualización incluye el informe académico Word y un PowerPoint de 16 diapositivas con el mismo guion y cinco integrantes; su generación, revisión visual y sustitución de descargas se documentan en [el registro de actualización del equipo](../docs/exposiciones-verificacion-genetica-equipo.md). Las referencias completas se conservan en el informe y en las notas de la presentación. Los archivos de la entrega anterior y sus hashes se describen en [el registro inicial](../docs/exposiciones-verificacion-determinacion-sexual.md). El estado `published` del JSON incorpora la exposición al catálogo generado de la rama; no acredita por sí solo un despliegue en vetjb.com.

Archivos de implementación:

- `shared/genetics-models.mjs` y `shared/genetics-labs.mjs`: relaciones educativas y controles.
- `scripts/expo_genetics.py`: fragmentos semánticos de los nueve exploradores.
- `scripts/build-exposiciones.py` y `shared/experience.mjs`: composición, apéndice y diálogos de preguntas.
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

Las pruebas jsdom comprueban lógica y DOM; no sustituyen un navegador real ni verifican geometría, ventanas emergentes, fullscreen o comportamiento de proyección. Consulta `docs/exposiciones-verificacion-e1.md` para el trabajo previo de Fisiopatología, `docs/exposiciones-verificacion-determinacion-sexual.md` para la incorporación inicial de Genética, `docs/exposiciones-verificacion-genetica-visual.md` para la revisión anterior de 14 escenas y `docs/exposiciones-verificacion-genetica-equipo.md` para la actualización de 16 escenas. Los resultados y pendientes de una entrega no validan automáticamente la otra.

## Respaldo e impresión

Fisiopatología ofrece el informe académico del caso Mafe de 10 páginas en Word y PDF, y una presentación PowerPoint de 14 diapositivas. La web tiene 12 escenas porque agrupa las cinco preguntas en una escena navegable; el PowerPoint reparte ese bloque en tres diapositivas. Comparten caso, 14 referencias y las mismas cinco preguntas con sus opciones. La revisión del 21 de octubre se documenta en [el registro del remake](../docs/exposiciones-remake-mafe-21oct.md). El PDF se exporta del Word canónico. El exportador estático legado `scripts/export-expo-pdf.py` rechaza este nuevo esquema antes de escribir archivos para evitar restaurar contenido teórico anterior. La actualización de Genética incluye un informe Word y un PowerPoint de 16 diapositivas alineado con las 16 escenas web. Las notas y el recurso de fuentes conservan la bibliografía sin añadir diapositivas al recorrido. El estado de generación, revisión y sustitución de los archivos consta en el registro de la actualización del equipo. Las animaciones y los controles interactivos se exploran en la web. Solo se muestran descargas para archivos existentes y sus enlaces incluyen una versión basada en el contenido para evitar archivos antiguos en caché.

La hoja de impresión está preparada para mostrar las escenas y las soluciones. Para un PDF desde el navegador, utiliza Estudiar, Ctrl+P, destino «Guardar como PDF» y revisa la vista previa. La salida puede variar; la impresión web de Genética sigue pendiente de inspección real. El PDF descargable de respaldo corresponde únicamente a Fisiopatología. No se instala un service worker.

Para comprobar offline en tu equipo: abre un perfil de navegador nuevo, inicia el servidor local, desconecta internet y prueba navegación, figuras, casos y simulador. Las fuentes bibliográficas externas sí necesitan conexión. La comprobación en navegador de las entregas anteriores de Genética estuvo bloqueada por una política de permisos guardados de acceso a vetjb.com; ese bloqueo quedó registrado sin intentar rutas alternativas. La inspección estática y los renders de SVG no validan la maquetación ni el funcionamiento offline real. El bloqueo de vista previa del registro inicial corresponde a aquella entrega, no a esta revisión.
