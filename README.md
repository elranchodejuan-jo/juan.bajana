# PAGINA-PERSONAL-JB

Mi pagina personal profesional como estudiante de Medicina Veterinaria y creador de proyectos digitales aplicados a educacion veterinaria, clinicas y granjas.

## Proyecto

Sitio personal de Juan José Bajaña Chuno para presentar su perfil como estudiante,
misión, visión, historia y cinco iniciativas de desarrollo digital.

Proyectos personales:

- Suite Vet
- Cartilla Digital
- Ecosistema CATTLE

Colaboraciones institucionales y profesionales:

- SIPA UTMACH
- CEDIVETS (vista previa del sitio web y catálogo)

Estas colaboraciones son aportes de desarrollo digital a iniciativas de sus
organizaciones; no se presentan como productos propios ni atribuyen cargos.

## Estructura

- `index.html`: contenido principal y secciones de la landing.
- `css/styles.css`: estilos, variables CSS, responsive design y animaciones.
- `js/main.js`: menu movil, estado del header, scroll activo y revelado de secciones.
- `assets/juan-bajana-perro.jpeg`: foto principal usada en el hero.

## Como abrir

Abre la carpeta con un servidor estático HTTP (por ejemplo, Live Server en VS
Code). El sprite SVG local necesita HTTP para cargar en todos los navegadores.
También puedes publicarlo en GitHub Pages, Vercel o Netlify porque no requiere
backend ni compilación.

## Patrones visuales de la primera fase

La interfaz usa paneles oscuros, acentos azules/cian y comandos decorativos junto
a títulos en español. El perfil conserva la condición de estudiante de Medicina
Veterinaria. No requiere instalación de dependencias ni compilación.

- Los tokens reutilizables están en `:root` de `css/styles.css`.
- `.terminal-command`, `.terminal-window`, `.project-card` y `.btn` son patrones
  HTML/CSS para futuras secciones y proyectos.
- Inter (400, 600, 700) y JetBrains Mono (400, 500) se sirven como dos archivos
  WOFF2 variables con caracteres latinos, incluidos los acentos del español.
  Proceden de Google Fonts; sus licencias OFL están en `assets/fonts/`.
- `assets/icons.svg` contiene solo los 18 iconos utilizados de Lucide Static
  1.51.0, con sus trazados originales. La licencia se incluye en
  `assets/LUCIDE-LICENSE.txt`. No se carga una biblioteca de iconos en JavaScript.
- El contenido es visible desde el inicio. El revelado progresivo solo aplica
  un énfasis breve; `prefers-reduced-motion` elimina animaciones y reproducción
  automática. El carrusel permite flechas, indicadores, teclado, gesto táctil
  y pausa explícita. Una selección manual permanece hasta reanudar.
- Sin JavaScript siguen disponibles la navegación, el contenido y la primera
  fotografía del carrusel.

Comprobación rápida de sintaxis: `node --check js/main.js`.

## Segunda fase: portafolio y presentación

- Cinco tarjetas con una frase completa para problema, descripción y diferencia,
  de 41 a 43 palabras descriptivas por iniciativa, agrupadas según la relación.
- Retrato de 160 × 180 px en escritorio y 112 × 126 px en móvil, con encuadre CSS
  sobre la imagen original para reconocer mejor el rostro. Fotografías del
  carrusel más amplias en escritorio; se conservan los cinco archivos originales.
- Retícula y resplandores estáticos, sin elementos que intercepten clics.
- Footer con identidad, navegación, grupos del portafolio, correo, GitHub,
  ORCID confirmado y acceso al inicio. Se retiran enlaces sociales ficticios.
- Se conservan las fuentes locales, el sprite Lucide, `CNAME`, el alojamiento
  en GitHub Pages y la configuración de DNS/HTTPS.

## Destinos comprobados (3 de octubre de 2026)

| Iniciativa / perfil | Destino confirmado | Resultado |
| --- | --- | --- |
| Cartilla Digital | https://cartilladigital.vetjb.com | HTTP 200, pantalla de acceso de Cartilla Digital |
| CATTLE | https://cattle.vetjb.com | HTTP 200, presentación de CATTLE Porcinos |
| SIPA UTMACH | https://sipautmach.com | HTTP 200, portal del semillero |
| CEDIVETS | https://elranchodejuan-jo.github.io/cedivets-web/ | HTTP 200, vista previa; catálogo de 43 estudios |
| GitHub | https://github.com/elranchodejuan-jo | HTTP 200, perfil de Juan Bajaña |
| ORCID | https://orcid.org/0009-0009-2980-7194 | HTTP 200, nombre completo y enlace a vetjb.com verificados |

Los destinos se comprobaron sin iniciar sesión en las aplicaciones ni modificar
sus datos. CEDIVETS conserva expresamente el enlace «Ver vista previa».

## Pendientes de contenido

- **Suite Vet:** el antiguo enlace de GitHub Pages devuelve HTTP 404; su API de
  Pages también devuelve 404 y `suitevet.vetjb.com` no tiene resolución DNS.
  El README del proyecto no identifica otra URL pública. La tarjeta conserva
  el resumen completo y omite el enlace hasta confirmar un destino funcional.
- El antiguo enlace de Cartilla Digital en GitHub Pages devuelve HTTP 404 y
  se sustituye por el dominio confirmado de la tabla anterior.
- La galería mantiene los espacios existentes para futuras fotos y capturas.
- No se añaden LinkedIn ni otras redes sin una URL confirmada.

## Verificación de la segunda fase

- `node --check js/main.js` y `git diff --check`.
- Chrome en Windows: 1440, 1280, 1024, 768, 390 y 320 px de ancho, sin
  desbordamiento horizontal. Nombre y condición de estudiante visibles en
  la primera pantalla de cada tamaño.
- Menú mediante Enter y Tab, cierre con Escape y retorno del foco; navegación
  a secciones, acciones principales y enlaces del footer.
- Carrusel: cinco fotografías decodificadas, indicadores, botones anterior y
  siguiente, flechas del teclado, gesto táctil simulado, reproducción, pausa y
  reanudación. Preferencia de movimiento reducido inicial y cambio en vivo.
- Ambas fuentes locales cargadas y trazados del sprite Lucide visibles.
  Contenido, enlaces y primera fotografía disponibles sin JavaScript.
- Capturas locales de inicio, perfil, proyectos y footer en escritorio y móvil;
  las capturas de secciones excluyen el encabezado fijo para evitar que tape
  contenido al capturar una sección mayor que el viewport.

Comparación de carga inicial de laboratorio: Chrome 154.0.8037.93 en Windows,
HTTP local, sin limitación de red ni CPU, contexto nuevo por carga, servidor con
`Cache-Control: no-store`, movimiento reducido y sin interacción. Tres cargas
por versión y tamaño; se observó hasta 1,5 s después de cargar recursos y fuentes.
La base corresponde al diseño de la primera fase fusionado en `main`.

| Viewport | LCP base, ms (3 cargas) | LCP fase 2, ms (3 cargas) | Mediana base → fase 2 |
| --- | --- | --- | --- |
| 1440 × 1000 | 388, 436, 368 | 364, 408, 340 | 388 → 364 ms |
| 390 × 844 | 292, 300, 268 | 344, 336, 312 | 292 → 336 ms |

CLS de carga: fase 2, 0 en las seis cargas; base, 0 en cinco y 0,00007 en una.
Recursos transferidos durante esa carga inicial, excluido el documento HTML:
base, 1.248.058 bytes; fase 2, 1.251.643 bytes en cinco cargas y 1.255.370 en una.
No se agregan fuentes, imágenes ni bibliotecas.
Las tarjetas personales pasan de 837 a 412 px de alto en escritorio; la primera
fotografía pasa de 515 a 594 px de ancho con el mismo archivo.

La diferencia de LCP móvil fue de 44 ms en este entorno. Esta muestra pequeña
no demuestra una mejora o regresión de rendimiento en producción. No mide
INP de usuarios, datos de campo ni percentiles de Core Web Vitals.
