import { defineConfig } from "vitest/config"
import solidPlugin from "vite-plugin-solid-oxc"

export default defineConfig({
  plugins: [solidPlugin()],
  test: {
    globals: true,
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    deps: {
      optimizer: {
        web: {
          include: ["solid-js"],
        },
      },
    },
  },
  resolve: {
    conditions: ["development", "browser"],
  },
})
