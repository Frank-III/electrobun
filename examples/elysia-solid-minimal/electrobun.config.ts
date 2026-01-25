export default {
  app: {
    name: "elysia-solid-minimal",
    identifier: "elysia-solid-minimal.electrobun.dev",
    version: "0.1.0",
  },
  build: {
    copy: {
      dist: "views/mainview",
    },
    mac: {
      bundleCEF: false,
    },
    linux: {
      bundleCEF: false,
    },
    win: {
      bundleCEF: false,
    },
  },
};
