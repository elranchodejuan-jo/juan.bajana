# EVA Cloud Browser — Diseño Experimental

Entorno privado de GitHub Codespaces con escritorio remoto, Chromium y un descargador de materiales para Moodle/EVEA UTMACH.

## Seguridad

- La contraseña del EVEA se escribe **solo dentro de Chromium**.
- El descargador reutiliza las cookies de la sesión abierta; no solicita ni guarda credenciales.
- El puerto 6080 debe permanecer en visibilidad **Private** dentro de Codespaces.
- La clave `vscode` corresponde únicamente al escritorio VNC interno; no es la clave universitaria.

## Uso

1. Crea un Codespace usando la configuración **EVA Cloud Browser**.
2. Abre el puerto `6080` llamado **Navegador EVA (privado)**. La clave del escritorio es `vscode`.
3. En el escritorio, abre **Abrir EVEA UTMACH**.
4. Inicia sesión manualmente con tu cuenta institucional y entra al curso **Diseño Experimental**.
5. Ejecuta el acceso directo **Descargar Diseño Experimental**.
6. Los documentos quedan en:

   `tools/eva-cloud-browser/Descargas/Diseno_Experimental/`

   También se genera:

   `tools/eva-cloud-browser/Descargas/Diseno_Experimental.zip`

7. En el explorador de archivos de Codespaces, haz clic derecho sobre el ZIP y selecciona **Download**.

## Ejecución manual

```bash
python tools/eva-cloud-browser/eva_downloader.py
```

También se puede indicar la URL exacta del curso:

```bash
python tools/eva-cloud-browser/eva_downloader.py \
  "https://moodle.utmachala.edu.ec/course/view.php?id=123"
```

## Alcance del descargador

Busca documentos comunes (`PDF`, `PPT/PPTX`, `DOC/DOCX`, hojas de cálculo, ZIP y otros) en recursos, carpetas, páginas y libros Moodle. Omite imágenes y archivos de interfaz. Genera un reporte JSON con descargados, duplicados y errores.
