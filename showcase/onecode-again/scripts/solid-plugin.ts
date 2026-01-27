import path from "node:path";
import oxc from "solid-jsx-oxc";
import type { BunPlugin } from "bun";

const transformJsx = oxc.transformJsx as (input: string, options: Record<string, unknown>) => {
  code: string;
};

const baseConfig = {
  jsxImportSource: "solid-js",
  development: process.env.NODE_ENV !== "production",
  hydratable: true,
  generation: "dom",
};

const resolveSolidBrowser = (input: string) => {
  if (input.endsWith("/web/dist/server.js")) return input.replace("/web/dist/server.js", "/web/dist/web.js");
  if (input.endsWith("/store/dist/server.js")) return input.replace("/store/dist/server.js", "/store/dist/store.js");
  if (input.endsWith("/dist/server.js")) return input.replace("/dist/server.js", "/dist/solid.js");
  return input;
};

const resolveElectrobun = (input: string) => {
  const normalized = input.replaceAll("\\", "/");
  const target = normalized.includes("electrobun/view")
    ? "electrobun/dist/api/browser/index.ts"
    : "electrobun/dist/api/bun/index.ts";
  const root = normalized.split("node_modules/")[0] || process.cwd();
  return path.join(root, "node_modules", target);
};

export function solidTransformPlugin(): BunPlugin {
  return {
    name: "solid-oxc",
    setup(build) {
      build.onResolve({ filter: /^(electrobun\/view|electrobun\/bun)$/ }, (args) => {
        return { path: resolveElectrobun(args.path) };
      });

      build.onResolve({ filter: /solid-js(\/.*)?$/ }, (args) => {
        const resolved = Bun.resolveSync(args.path, args.resolveDir);
        return { path: resolveSolidBrowser(resolved) };
      });

      build.onLoad({ filter: /\.(jsx|tsx)$/ }, async (args) => {
        if (args.path.includes("node_modules") && !args.path.includes("@corvu")) return null;
        const source = await Bun.file(args.path).text();
        const { code } = transformJsx(source, baseConfig);
        return { contents: code, loader: "tsx" };
      });
    },
  } satisfies BunPlugin;
}
