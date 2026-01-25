import { join } from "path";
// @ts-expect-error - Types not important for this plugin
import { transformAsync } from "@babel/core";
// @ts-expect-error - Types not important for this plugin
import ts from "@babel/preset-typescript";
// @ts-expect-error - Types not important for this plugin
import solid from "babel-preset-solid";
import type { BunPlugin } from "bun";

const projectRoot = process.cwd();

const solidTransformPlugin: BunPlugin = {
  name: "bun-plugin-solid",
  setup: (build) => {
    // Resolve electrobun packages
    build.onResolve({ filter: /^electrobun\/view$/ }, () => {
      return {
        path: join(projectRoot, "node_modules/electrobun/dist/api/browser/index.ts"),
      };
    });

    build.onResolve({ filter: /^electrobun\/bun$/ }, () => {
      return {
        path: join(projectRoot, "node_modules/electrobun/dist/api/bun/index.ts"),
      };
    });

    // Force browser variants of solid-js
    build.onLoad({ filter: /\/node_modules\/solid-js\/dist\/server\.js$/ }, async (args) => {
      const path = args.path.replace("server.js", "solid.js");
      const code = await Bun.file(path).text();
      return { contents: code, loader: "js" };
    });

    build.onLoad({ filter: /\/node_modules\/solid-js\/store\/dist\/server\.js$/ }, async (args) => {
      const path = args.path.replace("server.js", "store.js");
      const code = await Bun.file(path).text();
      return { contents: code, loader: "js" };
    });

    // Transform JSX/TSX files with Babel + Solid preset
    build.onLoad({ filter: /\.[jt]sx$/ }, async (args) => {
      const isNodeModule = /[\\/]+node_modules[\\/]+/.test(args.path);
      if (isNodeModule) return;

      const code = await Bun.file(args.path).text();
      const transforms = await transformAsync(code, {
        filename: args.path,
        sourceType: "module",
        presets: [
          [
            solid,
            {
              moduleName: "solid-js/web",
              generate: "dom",
              hydratable: false,
              delegateEvents: true,
              wrapConditionals: true,
              contextToCustomElements: true,
            },
          ],
          [ts, { isTSX: true, allExtensions: true }],
        ],
      });

      return {
        contents: transforms?.code ?? "",
        loader: "js",
      };
    });
  },
};

export default solidTransformPlugin;
