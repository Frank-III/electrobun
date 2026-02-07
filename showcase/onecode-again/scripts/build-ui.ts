import path from "node:path";
import { rmSync } from "node:fs";
import { $ } from "bun";
import { solidTransformPlugins } from "./solid-plugin";

const isMinify = process.argv.includes("--minify");
const isWatch = process.argv.includes("--watch");

const projectRoot = path.resolve(import.meta.dir, "..");
const outdir = path.resolve(projectRoot, "dist/mainview");
const cssInput = path.resolve(projectRoot, "src/mainview/styles/globals.css");
const cssOutput = path.resolve(outdir, "main.css");

async function buildCSS() {
  console.log("[build-ui] Building CSS with Tailwind v3...");
  
  // Use tailwindcss CLI (v3) to build CSS
  const args = [
    "-i", cssInput,
    "-o", cssOutput,
    "--config", path.resolve(projectRoot, "tailwind.config.cjs"),
  ];
  
  if (isMinify) {
    args.push("--minify");
  }
  
  const result = await $`bunx tailwindcss ${args}`.cwd(projectRoot).quiet();
  
  if (result.exitCode !== 0) {
    console.error("[build-ui] CSS build failed:", result.stderr.toString());
    process.exit(1);
  }
  
  console.log("[build-ui] CSS build complete");
}

async function buildJS() {
  console.log(`[build-ui] Building JS ${isMinify ? "(minified)" : "(dev)"}...`);

  // Ensure stale chunks/maps cannot survive across incremental desktop builds.
  rmSync(outdir, { recursive: true, force: true });
  
  const result = await Bun.build({
    entrypoints: [path.resolve(projectRoot, "src/mainview/main.tsx")],
    outdir,
    target: "browser",
    format: "esm",
    splitting: true,
    sourcemap: isMinify ? "none" : "linked",
    minify: isMinify,
    plugins: solidTransformPlugins(),
    define: {
      "process.env.NODE_ENV": JSON.stringify(isMinify ? "production" : "development"),
      "process.env.DEBUG": JSON.stringify(""),
      "import.meta.env.DEV": JSON.stringify(!isMinify),
      "import.meta.env.PROD": JSON.stringify(isMinify),
      "import.meta.env.MODE": JSON.stringify(isMinify ? "production" : "development"),
      "import.meta.env.VITE_FEEDBACK_URL": JSON.stringify("https://discord.gg/8ektTZGnj4"),
    },
  });

  if (!result.success) {
    console.error("[build-ui] JS build failed:");
    for (const log of result.logs) {
      console.error(log);
    }
    process.exit(1);
  }

  console.log(`[build-ui] JS build complete: ${result.outputs.length} files`);
  return result;
}

async function build() {
  await buildJS();
  await buildCSS();
}

if (isWatch) {
  console.log("[build-ui] Watch mode enabled");
  await build();
  // TODO: Add file watcher if needed
} else {
  await build();
}
