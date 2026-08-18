# cli-cursor-canvas-to-pdf

Export a [Cursor Canvas](https://cursor.com) (`.canvas.tsx`) to PDF.

Cursor only. Not Canva, not Figma, not a random React page.

It compiles the canvas, opens it in headless Chrome, prints. You need [Bun](https://bun.sh) and Chrome (Chromium / Edge / Brave also work).

## Install

```bash
curl -fsSL https://github.com/LFerronato/cli-cursor-canvas-to-pdf/releases/latest/download/install.sh | bash
```

Drops `canvas-pdf` on `~/.local/bin`. If that folder is not on your PATH:

```bash
export PATH="$HOME/.local/bin:$PATH"
```

Or clone and run `./install.sh`.

## Usage

```bash
canvas-pdf radar.canvas.tsx
canvas-pdf radar.canvas.tsx -o ~/Downloads/radar.pdf
canvas-pdf radar.canvas.tsx --landscape
```

Canvases usually live at `~/.cursor/projects/<workspace>/canvases/<name>.canvas.tsx`.

```
-o, --output <file.pdf>   default: ./<name>.pdf
--landscape
--format <A4|Letter>      default: A4
--chrome <path>
```

There's a tiny fixture in `examples/hello.canvas.tsx` if you just want to see it work.

## Cursor skill

```bash
npx skills add LFerronato/cli-cursor-canvas-to-pdf -g -a cursor -y
```

`-a cursor` is on purpose. This format does not exist outside Cursor.

Then:

> use canvas-to-pdf and save this canvas to Downloads as PDF

## How it works

`.canvas.tsx` is React. Chrome can't print that file directly.

The CLI copies it into `src/renderer/`, Vite compiles JSX and maps `cursor/canvas` → [cursor-canvas-web](https://www.npmjs.com/package/@thisismydesign/cursor-canvas-web), Chrome does `--print-to-pdf`.

Chrome will dump cert/updater noise. Fine, as long as the PDF shows up.

## License

[MIT](LICENSE)
