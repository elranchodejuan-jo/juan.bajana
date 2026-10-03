# PAGINA-PERSONAL-JB

Mi pagina personal profesional como estudiante de Medicina Veterinaria y creador de proyectos digitales aplicados a educacion veterinaria, clinicas y granjas.

## Proyecto

Landing page personal de Juan Bajana para presentar su perfil, mision, vision, historia y principales proyectos digitales:

- Suite Vet
- Cartilla Digital
- Ecosistema CATTLE

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

## Pendientes de contenido (conservados)

- Reemplazar placeholders por fotos reales o capturas de proyectos.
- Cambiar los `href="#"` por enlaces reales de CATTLE, GitHub, LinkedIn y redes.
- Agregar un favicon real cuando este disponible.
