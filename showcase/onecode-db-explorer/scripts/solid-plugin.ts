import { join } from "path";
import type { BunPlugin } from "bun";
import { transformJsx } from "solid-jsx-oxc";

const projectRoot = process.cwd();

const solidTransformPlugin: BunPlugin = {
  name: "bun-plugin-solid-oxc (electrobun)",
  setup: (build) => {
    // Electrobun's API packages are shipped as TS source; resolve explicitly so Bun.build can bundle them.
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

    // Bun sometimes resolves Solid's server builds. Force the browser variants instead.
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

    // Transform JSX files with solid-jsx-oxc
    build.onLoad({ filter: /\.[jt]sx$/ }, async (args) => {
      // Skip node_modules EXCEPT @corvu and solid- packages
      const isNodeModule = /[\\/]node_modules[\\/]/.test(args.path);
      const isSolidNodeModule = /[\\/]node_modules[\\/](?:@corvu[\\/]|solid-)/.test(args.path);
      if (isNodeModule && !isSolidNodeModule) {
        return undefined;
      }

      const source = await Bun.file(args.path).text();

      try {
        const result = transformJsx(source, {
          filename: args.path,
          moduleName: "solid-js/web",
          generate: "dom",
          hydratable: false,
          delegateEvents: true,
          wrapConditionals: true,
          contextToCustomElements: true,
          sourceMap: false,
        });

        return {
          contents: result.code,
          loader: "ts",
        };
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        throw new Error(`Failed to transform ${args.path}: ${message}`);
      }
    });
  },
};

export default solidTransformPlugin;
