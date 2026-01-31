import path from "node:path";
import { transformSync } from "@babel/core";
import type { BunPlugin } from "bun";

const resolveSolidBrowser = (input: string) => {
  if (input.endsWith("/web/dist/server.js")) return input.replace("/web/dist/server.js", "/web/dist/web.js");
  if (input.endsWith("/store/dist/server.js")) return input.replace("/store/dist/server.js", "/store/dist/store.js");
  if (input.endsWith("/dist/server.js")) return input.replace("/dist/server.js", "/dist/solid.js");
  return input;
};

const projectRoot = path.resolve(import.meta.dir, "..");

const resolveElectrobun = (specifier: string) => {
  const target = specifier.includes("view")
    ? "electrobun/dist/api/browser/index.ts"
    : "electrobun/dist/api/bun/index.ts";
  return path.resolve(projectRoot, "node_modules", target);
};

export function solidTransformPlugin(): BunPlugin {
  return {
    name: "solid-babel",
    setup(build) {
      build.onResolve({ filter: /^(electrobun\/view|electrobun\/bun)$/ }, (args) => {
        return { path: resolveElectrobun(args.path) };
      });

      build.onResolve({ filter: /solid-js(\/.*)?$/ }, (args) => {
        const resolved = Bun.resolveSync(args.path, args.resolveDir);
        return { path: resolveSolidBrowser(resolved) };
      });

      build.onLoad({ filter: /\.(jsx|tsx)$/ }, async (args) => {
        if (args.path.includes("node_modules") && !args.path.includes("@corvu")) return undefined;
        const source = await Bun.file(args.path).text();
        
        const result = transformSync(source, {
          filename: args.path,
          presets: [
            ["@babel/preset-typescript", { isTSX: true, allExtensions: true }],
            ["babel-preset-solid", { generate: "dom", hydratable: true }],
          ],
        });
        
        return { contents: result?.code || "", loader: "js" };
      });
    },
  } satisfies BunPlugin;
}
