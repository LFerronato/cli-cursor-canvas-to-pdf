# cli-cursor-canvas-to-pdf

CLI that exports a [Cursor Canvas](https://cursor.com) (`.canvas.tsx`) to PDF.

It mounts the file on the public `cursor/canvas` web runtime, serves it locally, and prints with headless Chrome. Cursor Canvas only — not Canva, Figma, or arbitrary React.

## Requirements

- [Bun](https://bun.sh) 1.1+
- Chrome, Chromium, Edge, or Brave

## Install

```bash
curl -fsSL https://github.com/LFerronato/cli-cursor-canvas-to-pdf/releases/latest/download/install.sh | bash
```

The script downloads the release archive, installs dependencies with Bun, and puts `canvas-pdf` on `~/.local/bin`.

From a clone:

```bash
git clone https://github.com/LFerronato/cli-cursor-canvas-to-pdf.git
cd cli-cursor-canvas-to-pdf
./install.sh
```

If `~/.local/bin` is not on your `PATH`:

```bash
export PATH="$HOME/.local/bin:$PATH"
```

## Usage

```bash
canvas-pdf radar.canvas.tsx
canvas-pdf radar.canvas.tsx -o ~/Downloads/radar.pdf
canvas-pdf radar.canvas.tsx --landscape
canvas-pdf examples/hello.canvas.tsx
```

Cursor canvases live at `~/.cursor/projects/<workspace>/canvases/<name>.canvas.tsx`.

```
-o, --output <file.pdf>   Output path (default: ./<name>.pdf)
--landscape               Landscape page
--format <A4|Letter>      Page size (default: A4)
--chrome <path>           Browser binary
```

## Cursor skill

Copy [`skill/SKILL.md`](skill/SKILL.md) to your personal skills folder:

```bash
mkdir -p ~/.cursor/skills/canvas-to-pdf
cp skill/SKILL.md ~/.cursor/skills/canvas-to-pdf/SKILL.md
```

Then, in Cursor:

> use canvas-to-pdf and save this canvas to Downloads as PDF

## How it works

1. Copy the `.canvas.tsx` into a small Vite renderer that aliases `cursor/canvas` → [`@thisismydesign/cursor-canvas-web`](https://www.npmjs.com/package/@thisismydesign/cursor-canvas-web).
2. Start a local server.
3. Headless Chrome `--print-to-pdf`.
4. Restore the placeholder canvas.

Chrome may log certificate or updater noise. Ignore it if the PDF is written and the command exits 0.

## License

[MIT](LICENSE)
