#!/bin/sh
# Usage: scripts/build-pdf.sh   (needs Chrome or Edge). Renders print/*.html to PDF in print/out/.
set -e
cd "$(dirname "$0")/.."
for c in "/c/Program Files/Google/Chrome/Application/chrome.exe" "/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"; do [ -f "$c" ] && CH="$c" && break; done
[ -n "$CH" ] || { echo "Chrome/Edge not found"; exit 1; }
mkdir -p print/out
for n in leave-behind; do
  "$CH" --headless=new --disable-gpu --no-pdf-header-footer --virtual-time-budget=6000 \
    --print-to-pdf="$(pwd -W)/print/out/$n.pdf"  "file:///$(pwd -W)/print/$n.html"
done
