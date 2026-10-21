#!/usr/bin/env bash
set -euo pipefail

WORKSPACE_DIR="$(pwd)"
TOOL_DIR="$WORKSPACE_DIR/tools/eva-cloud-browser"
DOWNLOAD_DIR="$TOOL_DIR/Descargas/Diseno_Experimental"

sudo apt-get update
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y \
  chromium \
  curl \
  fonts-liberation \
  fonts-noto-color-emoji \
  unzip \
  xdg-utils
sudo rm -rf /var/lib/apt/lists/*

python -m pip install --user --disable-pip-version-check -r "$TOOL_DIR/requirements.txt"

mkdir -p "$DOWNLOAD_DIR" "$HOME/Desktop" "$HOME/.config/eva-cloud-browser"
chmod +x "$TOOL_DIR/start_eva.sh"

cat > "$HOME/Desktop/Abrir EVEA UTMACH.desktop" <<DESKTOP
[Desktop Entry]
Type=Application
Name=Abrir EVEA UTMACH
Comment=Navegador privado para ingresar manualmente al aula virtual
Exec=bash -lc 'cd "$WORKSPACE_DIR" && "$TOOL_DIR/start_eva.sh"'
Icon=chromium
Terminal=false
Categories=Education;Network;
DESKTOP

cat > "$HOME/Desktop/Descargar Diseño Experimental.desktop" <<DESKTOP
[Desktop Entry]
Type=Application
Name=Descargar Diseño Experimental
Comment=Descarga los documentos del curso que está abierto en Chromium
Exec=bash -lc 'cd "$WORKSPACE_DIR" && xterm -hold -title "Descargador EVEA" -e python "$TOOL_DIR/eva_downloader.py"'
Icon=folder-download
Terminal=false
Categories=Education;Utility;
DESKTOP

cat > "$HOME/Desktop/Ver Descargas.desktop" <<DESKTOP
[Desktop Entry]
Type=Application
Name=Ver Descargas
Comment=Abre la carpeta de materiales descargados
Exec=xdg-open "$DOWNLOAD_DIR"
Icon=folder
Terminal=false
Categories=Utility;
DESKTOP

chmod +x "$HOME/Desktop/"*.desktop

cat <<MSG

EVA Cloud Browser quedó preparado.
- Escritorio web: puerto 6080 (privado)
- Clave interna del escritorio: vscode
- EVEA: https://moodle.utmachala.edu.ec/
- Descargas: $DOWNLOAD_DIR

MSG
