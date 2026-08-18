#!/usr/bin/env bun

import { copyFile, mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { createServer } from "vite";

import { parseArgs } from "./args";
import { findChrome, printToPdf } from "./chrome";

const ROOT = join(import.meta.dir, "..");

function cleanName(input: string) {
  return basename(input)
    .replace(/\.canvas\.tsx$/i, "")
    .replace(/\.tsx$/i, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-");
}

async function waitUntilReady(url: string) {
  let lastError: unknown;

  for (let i = 0; i < 50; i++) {
    try {
      const response = await fetch(url);

      if (response.ok) {
        return;
      }
    } catch (error) {
      lastError = error;
    }

    await Bun.sleep(100);
  }

  throw lastError ?? new Error("Renderer did not start.");
}

async function main() {
  const options = parseArgs();
  const input = resolve(options.input);

  if (!existsSync(input)) {
    throw new Error(`File not found: ${input}`);
  }

  const output = resolve(options.output ?? `${cleanName(input)}.pdf`);

  await mkdir(dirname(output), { recursive: true });

  const rendererCanvas = join(
    ROOT,
    "src",
    "renderer",
    "canvas.canvas.tsx",
  );

  const backup = await Bun.file(rendererCanvas).text();

  console.log();
  console.log("Canvas PDF");
  console.log("──────────");
  console.log(`→ Canvas: ${input}`);
  console.log(`→ PDF:    ${output}`);

  const chrome = await findChrome(options.chrome);
  console.log(`→ Browser: ${chrome}`);

  await copyFile(input, rendererCanvas);

  let server: Awaited<ReturnType<typeof createServer>> | undefined;
  const profileDir = join(ROOT, ".chrome-profile");

  try {
    await rm(profileDir, { recursive: true, force: true });

    server = await createServer({
      root: ROOT,
      configFile: join(ROOT, "vite.config.ts"),
      server: {
        host: "127.0.0.1",
        port: 0,
      },
      logLevel: "error",
    });

    await server.listen();

    const address = server.httpServer?.address();

    if (!address || typeof address === "string") {
      throw new Error("Could not determine the renderer port.");
    }

    const url = `http://127.0.0.1:${address.port}/`;
    await waitUntilReady(url);

    console.log("→ Rendering...");

    await printToPdf({
      chrome,
      url,
      output,
      profileDir,
      landscape: options.landscape,
    });

    const size = Bun.file(output).size;

    console.log();
    console.log(`✓ PDF created (${Math.round(size / 1024)} KB)`);
    console.log(`✓ ${output}`);
    console.log();
  } finally {
    await server?.close();
    await Bun.write(rendererCanvas, backup);
    await rm(profileDir, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error();
  console.error(
    "✗",
    error instanceof Error ? error.message : error,
  );
  console.error();
  process.exit(1);
});
