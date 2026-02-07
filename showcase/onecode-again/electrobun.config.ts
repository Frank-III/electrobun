export default {
  app: {
    name: "onecode-again",
    identifier: "dev.onecode.again",
    version: "0.1.0",
  },
  build: {
    bun: {
      entrypoint: "src/bun/index.ts",
      external: [],
    },
    views: {
      mainview: {
        // Keep Electrobun's injected view entrypoint minimal. The actual UI is
        // built into `dist/mainview/` and loaded by `views/mainview/index.html`
        // so DevTools can use the linked sourcemaps.
        // Use a tiny injected entrypoint (compiled to `views/mainview/main.js`).
        // The real UI bundle is built into `dist/mainview/` and loaded from
        // `views/mainview/index.html` so DevTools can use linked sourcemaps.
        entrypoint: "src/mainview/main.ts",
        external: [],
      },
    },
    copy: {
      "src/mainview/index.html": "views/mainview/index.html",
      // Copy the full UI build output (including sourcemaps) so WebKit DevTools
      // can resolve stack traces back to TS/TSX during debugging.
      // NOTE: Electrobun's build step also bundles the view entrypoint into
      // `views/mainview/*.js`. Bun's `fs.cpSync()` default does not overwrite
      // existing files, so we copy into a subfolder (`ui/`) to avoid collisions
      // and then point `index.html` at `./ui/main.js`.
      "dist/mainview": "views/mainview/ui",
      "src/mainview/public/sound.mp3": "views/mainview/sound.mp3",
      "src/native/zig-out/lib/libelectrobun_vt.dylib": "native/zig-out/lib/libelectrobun_vt.dylib",
      "src/native/zig-out/lib/libghostty.dylib": "native/zig-out/lib/libghostty.dylib",
      "src/bun/drizzle": "bun/drizzle",
    },
    mac: {
      bundleCEF: true,
      codesign: false,
    },
    linux: {
      bundleCEF: true,
    },
    win: {
      bundleCEF: true,
    },
  },
};
