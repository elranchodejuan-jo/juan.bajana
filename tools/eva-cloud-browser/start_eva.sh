#!/usr/bin/env bash
set -euo pipefail

export DISPLAY="${DISPLAY:-:1}"
PROFILE_DIR="$HOME/.config/eva-cloud-browser/chromium-profile"
LOG_FILE="/tmp/eva-cloud-browser-chromium.log"
EVEA_URL="${EVEA_URL:-https://moodle.utmachala.edu.ec/}"

mkdir -p "$PROFILE_DIR"

if curl -fsS --max-time 2 http://127.0.0.1:9222/json/version >/dev/null 2>&1; then
  echo "Chromium EVA ya está abierto."
  exit 0
fi

nohup chromium \
  --no-sandbox \
  --disable-dev-shm-usage \
  --disable-gpu-sandbox \
  --no-first-run \
  --no-default-browser-check \
  --remote-debugging-address=127.0.0.1 \
  --remote-debugging-port=9222 \
  --remote-allow-origins='*' \
  --user-data-dir="$PROFILE_DIR" \
  --start-maximized \
  "$EVEA_URL" >"$LOG_FILE" 2>&1 &

for _ in $(seq 1 30); do
  if curl -fsS --max-time 2 http://127.0.0.1:9222/json/version >/dev/null 2>&1; then
    exit 0
  fi
  sleep 1
done

echo "Chromium no respondió en el puerto 9222. Revisa $LOG_FILE" >&2
exit 1
