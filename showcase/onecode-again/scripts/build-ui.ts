import path from "node:path";
import tailwindPlugin from "bun-plugin-tailwind";
import { solidTransformPlugin } from "./solid-plugin";

const isMinify = process.argv.includes("--minify");
const isWatch = process.argv.includes("--watch");

const outdir = path.resolve(import.meta.dir, "../dist/mainview");

async function build() {
  console.log(`[build-ui] Building mainview ${isMinify ? "(minified)" : "(dev)"}...`);
  
  const result = await Bun.build({
    entrypoints: [path.resolve(import.meta.dir, "../src/mainview/main.tsx")],
    outdir,
    target: "browser",
    format: "esm",
    splitting: true,
    sourcemap: isMinify ? "none" : "linked",
    minify: isMinify,
    plugins: [solidTransformPlugin(), tailwindPlugin],
    define: {
      "process.env.NODE_ENV": JSON.stringify(isMinify ? "production" : "development"),
    },
  });

  if (!result.success) {
    console.error("[build-ui] Build failed:");
    for (const log of result.logs) {
      console.error(log);
    }
    process.exit(1);
  }

  console.log(`[build-ui] Build complete: ${result.outputs.length} files`);
  return result;
}

if (isWatch) {
  console.log("[build-ui] Watch mode enabled");
  // Initial build
  await build();
  // TODO: Add file watcher if needed
} else {
  await build();
}
