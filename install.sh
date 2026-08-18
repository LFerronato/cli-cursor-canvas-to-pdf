#!/usr/bin/env bash
set -euo pipefail

REPO="LFerronato/cli-cursor-canvas-to-pdf"
APP_DIR="${CANVAS_PDF_HOME:-$HOME/.local/share/canvas-pdf}"
BIN_DIR="${CANVAS_PDF_BIN:-$HOME/.local/bin}"
VERSION="${CANVAS_PDF_VERSION:-latest}"

if ! command -v bun >/dev/null 2>&1; then
  echo "Bun is required: https://bun.sh"
  exit 1
fi

if ! command -v curl >/dev/null 2>&1; then
  echo "curl is required."
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

copy_tree() {
  local src="$1"
  local dest="$2"

  mkdir -p "$dest"

  tar -C "$src" \
    --exclude='.git' \
    --exclude='node_modules' \
    --exclude='.chrome-profile' \
    --exclude='.DS_Store' \
    -cf - . | tar -C "$dest" -xf -
}

link_bin() {
  mkdir -p "$BIN_DIR"

  cat > "$BIN_DIR/canvas-pdf" <<EOF
#!/bin/sh
exec bun "$APP_DIR/src/cli.ts" "\$@"
EOF

  chmod +x "$BIN_DIR/canvas-pdf"
}

install_from_dir() {
  local src="$1"

  echo "→ Installing canvas-pdf to $APP_DIR"
  rm -rf "$APP_DIR"
  mkdir -p "$APP_DIR"
  copy_tree "$src" "$APP_DIR"

  echo "→ Installing dependencies"
  (cd "$APP_DIR" && bun install --production)

  link_bin

  echo
  echo "✓ canvas-pdf installed"
  echo "  $BIN_DIR/canvas-pdf"
  echo

  case ":$PATH:" in
    *":$BIN_DIR:"*) ;;
    *)
      echo "Add to PATH:"
      echo '  export PATH="$HOME/.local/bin:$PATH"'
      echo
      ;;
  esac

  echo "Usage:"
  echo "  canvas-pdf file.canvas.tsx"
}

if [ -f "$SCRIPT_DIR/src/cli.ts" ]; then
  install_from_dir "$SCRIPT_DIR"
  exit 0
fi

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

if [ "$VERSION" = "latest" ]; then
  ARCHIVE_URL="https://github.com/${REPO}/releases/latest/download/canvas-pdf.tar.gz"
else
  ARCHIVE_URL="https://github.com/${REPO}/releases/download/${VERSION}/canvas-pdf.tar.gz"
fi

echo "→ Downloading $ARCHIVE_URL"
curl -fsSL "$ARCHIVE_URL" -o "$TMP/canvas-pdf.tar.gz"

mkdir -p "$TMP/src"
tar -xzf "$TMP/canvas-pdf.tar.gz" -C "$TMP/src"

if [ ! -f "$TMP/src/src/cli.ts" ]; then
  echo "Release archive is missing src/cli.ts"
  exit 1
fi

install_from_dir "$TMP/src"
