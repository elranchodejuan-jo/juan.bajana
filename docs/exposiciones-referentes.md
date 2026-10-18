# Referentes de la experiencia interactiva

Revisión: **18 de octubre de 2026**. Estas referencias orientan decisiones de interacción y diseño. Su mención no implica colaboración, aval ni afiliación con VETJB.

## AMC VetAtlas

Se inspeccionó el [repositorio público](https://github.com/andreerogel1997-bit/amc-vetatlas) en el commit [`a08818a387d320b6f8b5e2124eaeccc0cac706df`](https://github.com/andreerogel1997-bit/amc-vetatlas/tree/a08818a387d320b6f8b5e2124eaeccc0cac706df), del 17 de octubre de 2026, asociado al [sitio publicado](https://andreerogel1997-bit.github.io/amc-vetatlas/). El pie atribuye sus guías a Andreé y a AMC/Animal Medical Center, Santa Rosa, Ecuador; se registra esa atribución tal como aparece en la fuente.

El proyecto contiene dos módulos: **convulsiones/estado epiléptico** y **celulitis flemonosa**. No contiene un módulo de equilibrio ácido-base; la cetoacidosis del README es un ejemplo de ampliación. Su arquitectura es estática, con módulos HTML autónomos, Three.js, casos, cuestionarios y gráficos controlables.

Patrones que inspiran nuestra implementación:

- Un control cambia simultáneamente el diagrama, un resultado y su explicación.
- Los casos revelan información por etapas y explican cada elección.
- El índice, el progreso, el restablecimiento y el repaso de errores ayudan a orientarse.

Límites observados: algunas magnitudes ilustrativas se generan con coeficientes sin calibración trazable junto al modelo; una presión derivada del deslizador activa además una indicación terapéutica. Esas salidas no se incorporan a VETJB. Nuestra exposición muestra ecuaciones y supuestos explícitos, distingue demostración de medición y no convierte controles en decisiones clínicas. Tampoco se trasladan dosificaciones, música automática ni actividades con tiempo obligatorio.

No se encontró una licencia explícita del repositorio. Se desarrollan **código, diagramas y textos propios**, sin copiar sus activos. Las atribuciones y licencias de fotografías externas del referente son independientes y no autorizan reutilizar el conjunto. La revisión técnica también aconseja controles operables por teclado, foco conservado, contenido independiente de WebGL y animación detenida fuera de pantalla.

## Clínica Veterinaria Vinyo

Se revisaron la [portada](https://clinicaveterinariavinyo.com/), el [control 3D](https://clinicaveterinariavinyo.com/js/portada-3d.js), su [respaldo 2D](https://clinicaveterinariavinyo.com/js/portada.js) y la [coreografía](https://clinicaveterinariavinyo.com/js/coreografia.js). La observación en navegador confirmó el efecto visual señalado: una superficie o figura fotográfica pasa a una representación de puntos y conexiones durante el desplazamiento. El código combina escena persistente, recorte progresivo, puntos/líneas, transiciones de texto y fotografías. No se atribuye este efecto a bibliotecas que no aparecen en los recursos revisados.

La idea transferida es la **continuidad entre estados visuales**, aplicada a una figura conceptual original que dirige la atención hacia equilibrio general, pulmones y riñones. La transición no representa una transformación anatómica ni una simulación fisiológica validada. Se emplean SVG y controles propios, con estado estático para movimiento reducido y alternativa sin efectos.

No se reutilizan fotografías, modelos, emblemas, código ni identidad de la clínica. En ambos referentes se adopta una idea de interacción y se adapta al objetivo docente de VETJB: comprender relaciones fisiopatológicas, mantener contenido legible y permitir que el estudiante controle el ritmo.
