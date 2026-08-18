import { existsSync } from "node:fs";
import { join } from "node:path";
import { rm } from "node:fs/promises";

async function commandExists(command: string) {
  const result = Bun.spawnSync(
    process.platform === "win32"
      ? ["where", command]
      : ["which", command],
    {
      stdout: "pipe",
      stderr: "pipe",
    },
  );

  return result.exitCode === 0;
}

export async function findChrome(explicit?: string) {
  if (explicit) {
    if (!existsSync(explicit)) {
      throw new Error(`Chrome not found at: ${explicit}`);
    }

    return explicit;
  }

  if (process.platform === "darwin") {
    const candidates = [
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      "/Applications/Chromium.app/Contents/MacOS/Chromium",
      "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
      "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    ];

    for (const candidate of candidates) {
      if (existsSync(candidate)) {
        return candidate;
      }
    }
  }

  if (process.platform === "win32") {
    const programFiles = [
      process.env.PROGRAMFILES,
      process.env["PROGRAMFILES(X86)"],
      process.env.LOCALAPPDATA,
    ].filter(Boolean) as string[];

    const relativeCandidates = [
      "Google/Chrome/Application/chrome.exe",
      "Chromium/Application/chrome.exe",
      "Microsoft/Edge/Application/msedge.exe",
      "BraveSoftware/Brave-Browser/Application/brave.exe",
    ];

    for (const base of programFiles) {
      for (const rel of relativeCandidates) {
        const candidate = join(base, rel);

        if (existsSync(candidate)) {
          return candidate;
        }
      }
    }
  }

  const commands = [
    "google-chrome",
    "google-chrome-stable",
    "chromium",
    "chromium-browser",
    "chrome",
    "msedge",
    "brave",
  ];

  for (const command of commands) {
    if (await commandExists(command)) {
      return command;
    }
  }

  throw new Error(`
No compatible Chrome/Chromium found.

Install Google Chrome, Chromium, Edge, or Brave,
or pass a binary:

  canvas-pdf file.canvas.tsx --chrome /path/to/chrome
`);
}

async function waitForStablePdf(path: string, timeoutMs = 30_000) {
  const started = Date.now();
  let lastSize = -1;
  let stableHits = 0;

  while (Date.now() - started < timeoutMs) {
    if (existsSync(path)) {
      const size = Bun.file(path).size;

      if (size > 0 && size === lastSize) {
        stableHits += 1;

        if (stableHits >= 3) {
          return size;
        }
      } else {
        lastSize = size;
        stableHits = 0;
      }
    }

    await Bun.sleep(150);
  }

  throw new Error("Chrome did not produce a PDF in time.");
}

export async function printToPdf(input: {
  chrome: string;
  url: string;
  output: string;
  profileDir: string;
  landscape: boolean;
}) {
  if (existsSync(input.output)) {
    await rm(input.output, { force: true });
  }

  const chromeArgs = [
    "--headless=new",
    "--disable-gpu",
    "--no-pdf-header-footer",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-extensions",
    "--disable-default-apps",
    "--disable-sync",
    "--disable-background-networking",
    "--disable-component-update",
    "--disable-breakpad",
    "--disable-crash-reporter",
    "--disable-features=Translate,MediaRouter,OptimizationHints",
    "--metrics-recording-only",
    "--mute-audio",
    "--hide-scrollbars",
    `--user-data-dir=${input.profileDir}`,
    `--crash-dumps-dir=${input.profileDir}`,
    `--print-to-pdf=${input.output}`,
  ];

  if (input.landscape) {
    chromeArgs.push(
      '--print-to-pdf-page-config={"landscape":true}',
    );
  }

  chromeArgs.push(input.url);

  const chromeProcess = Bun.spawn(
    [input.chrome, ...chromeArgs],
    {
      stdout: "pipe",
      stderr: "pipe",
    },
  );

  try {
    return await Promise.race([
      waitForStablePdf(input.output),
      chromeProcess.exited.then((exitCode) => {
        if (!existsSync(input.output) || Bun.file(input.output).size === 0) {
          throw new Error(
            exitCode === 0
              ? "Chrome exited without creating a PDF."
              : `Chrome exited with code ${exitCode}.`,
          );
        }

        return Bun.file(input.output).size;
      }),
    ]);
  } finally {
    chromeProcess.kill();
    await chromeProcess.exited.catch(() => undefined);
  }
}
