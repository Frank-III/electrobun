import path from "node:path";
import solidOxc from "bun-plugin-solid-oxc";
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

/** Resolve hooks for electrobun and solid-js browser builds */
function resolvePlugin(): BunPlugin {
  return {
    name: "resolve-hooks",
    setup(build) {
      build.onResolve({ filter: /^(electrobun\/view|electrobun\/bun)$/ }, (args) => {
        return { path: resolveElectrobun(args.path) };
      });

      build.onResolve({ filter: /solid-js(\/.*)?$/ }, (args) => {
        const resolved = Bun.resolveSync(args.path, args.resolveDir);
        return { path: resolveSolidBrowser(resolved) };
      });
    },
  };
}

/** Returns plugins for SolidJS transform + custom resolvers */
export function solidTransformPlugins(): BunPlugin[] {
  return [
    resolvePlugin(),
    solidOxc({
      generate: "dom",
      hydratable: true,
      // include @corvu from node_modules
      exclude: /node_modules\/(?!@corvu)/,
    }),
  ];
}

// --- Babel fallback (commented out - CJS/ESM interop issues with lru-cache in Bun) ---
// import { transformAsync } from "@babel/core";
//
// export function solidTransformPlugin(): BunPlugin {
//   return {
//     name: "solid-babel",
//     setup(build) {
//       build.onResolve({ filter: /^(electrobun\/view|electrobun\/bun)$/ }, (args) => {
//         return { path: resolveElectrobun(args.path) };
//       });
//       build.onResolve({ filter: /solid-js(\/.*)?$/ }, (args) => {
//         const resolved = Bun.resolveSync(args.path, args.resolveDir);
//         return { path: resolveSolidBrowser(resolved) };
//       });
//       build.onLoad({ filter: /\.(jsx|tsx)$/ }, async (args) => {
//         if (args.path.includes("node_modules") && !args.path.includes("@corvu")) return undefined;
//         const source = await Bun.file(args.path).text();
//         const result = await transformAsync(source, {
//           filename: args.path,
//           presets: [
//             ["babel-preset-solid", { generate: "dom", hydratable: true }],
//             ["@babel/preset-typescript", { onlyRemoveTypeImports: true }],
//           ],
//         });
//         if (!result?.code) throw new Error(`Babel transform failed for ${args.path}`);
//         return { contents: result.code, loader: "js" };
//       });
//     },
//   } satisfies BunPlugin;
// }
