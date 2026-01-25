import { cpSync, mkdirSync, rmSync } from "fs";
import { join } from "path";
import solidTransformPlugin from "./solid-plugin";

const projectRoot = process.cwd();
const distDir = join(projectRoot, "dist");

// Clean and create dist directory
rmSync(distDir, { recursive: true, force: true });
mkdirSync(distDir, { recursive: true });

// Copy HTML
cpSync(join(projectRoot, "src/mainview/index.html"), join(distDir, "index.html"));

// Build the app
const buildResult = await Bun.build({
  entrypoints: [join(projectRoot, "src/mainview/main.tsx")],
  outdir: distDir,
  target: "browser",
  splitting: false,
  minify: process.argv.includes("--minify"),
  sourcemap: "external",
  tsconfig: "./tsconfig.ui.json",
  plugins: [solidTransformPlugin],
});

if (!buildResult.success) {
  console.error("UI build failed:");
  for (const log of buildResult.logs) console.error(log);
  process.exit(1);
}

console.log(`UI build complete: ${distDir}`);
