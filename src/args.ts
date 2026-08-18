export type Options = {
  input: string;
  output?: string;
  landscape: boolean;
  format: string;
  chrome?: string;
};

export function usage() {
  console.log(`
canvas-pdf

Usage:

  canvas-pdf file.canvas.tsx

Options:

  -o, --output <file.pdf>
  --landscape
  --format <A4|Letter>
  --chrome <path>

Examples:

  canvas-pdf radar.canvas.tsx

  canvas-pdf radar.canvas.tsx \\
    -o ~/Downloads/radar.pdf

  canvas-pdf radar.canvas.tsx --landscape
`);
}

export function parseArgs(): Options {
  const args = Bun.argv.slice(2);

  if (!args.length || args.includes("--help") || args.includes("-h")) {
    usage();
    process.exit(0);
  }

  const input = args[0];

  let output: string | undefined;
  let landscape = false;
  let format = "A4";
  let chrome: string | undefined;

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];

    if (arg === "-o" || arg === "--output") {
      output = args[++i];
      continue;
    }

    if (arg === "--landscape") {
      landscape = true;
      continue;
    }

    if (arg === "--format") {
      format = args[++i] ?? "A4";
      continue;
    }

    if (arg === "--chrome") {
      chrome = args[++i];
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return {
    input,
    output,
    landscape,
    format,
    chrome,
  };
}
