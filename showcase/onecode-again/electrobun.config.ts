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
        entrypoint: "dist/mainview/main.js",
        external: [],
      },
    },
    copy: {
      "src/mainview/index.html": "views/mainview/index.html",
      "dist/mainview/main.css": "views/mainview/main.css",
      "src/native/zig-out/lib/libelectrobun_vt.dylib": "native/zig-out/lib/libelectrobun_vt.dylib",
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
