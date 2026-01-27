import type { ElectrobunConfig } from "electrobun/config";

const config: ElectrobunConfig = {
  name: "onecode-again",
  identifier: "dev.onecode.again",
  version: "0.1.0",
  build: {
    views: {
      mainview: {
        src: "./src/mainview/index.html",
      },
    },
    mac: {
      bundleCEF: false,
      codesign: true,
    },
    windows: {
      bundleCEF: false,
    },
    linux: {
      bundleCEF: false,
    },
  },
};

export default config;
