---
name: canvas-to-pdf
description: >-
  Exports a Cursor canvas (.canvas.tsx) to PDF via the local canvas-pdf CLI.
  Use when the user names canvas-to-pdf, canvas-pdf, or asks to save/export a
  canvas as PDF (especially to Downloads).
---

# canvas-to-pdf

Convert a Cursor canvas to PDF with the installed CLI. Do not reimplement print/PDF in Node or Playwright.

## CLI

```bash
"$HOME/.local/bin/canvas-pdf" <input.canvas.tsx> -o <output.pdf>
```

- Binary: `$HOME/.local/bin/canvas-pdf`
- App: `$HOME/.local/share/canvas-pdf`
- Install if missing:

```bash
curl -fsSL https://github.com/LFerronato/cli-cursor-canvas-to-pdf/releases/latest/download/install.sh | bash
```

Flags: `-o/--output`, `--landscape`, `--format A4|Letter`, `--chrome <path>`

## Resolve the canvas

1. Use the path the user gave.
2. Else use the canvas from this conversation / recently viewed `.canvas.tsx`.
3. Else search `~/.cursor/projects/*/canvases/*.canvas.tsx` by filename or visible title (e.g. `<H1>` text).

Cursor canvases live at `~/.cursor/projects/<workspace>/canvases/<name>.canvas.tsx`.

## Resolve the output

- Default: `$HOME/Downloads/<slug>.pdf`
- `<slug>` = canvas basename without `.canvas.tsx`
- If the user names a file or folder, honor it.

## Run

```bash
"$HOME/.local/bin/canvas-pdf" "/abs/path/file.canvas.tsx" -o "$HOME/Downloads/file.pdf"
```

Chrome headless may print cert/updater noise. Ignore it if the PDF appears and the command exits 0.

## Reply

Return the absolute PDF path and size. Do not dump Chrome logs.
