# 1Code Learn TS (Electrobun)

A minimal 1Code-style workspace showcase built with SolidJS and Electrobun.

## Goals

- Provide a clean, editor-first shell for learning TypeScript projects.
- Keep build tooling Bun-native (no Vite).
- Showcase a fast, keyboard-first UI foundation (tabs, file tree, terminal pane).

## Getting Started

```bash
# From the Electrobun repo root
cd showcase/onecode-again

# Install dependencies
bun install

# Build + run (dev)
bun run dev

# Build (dev)
bun run build

# Build (stable / production)
bun run build:prod
```

## Project Notes

- UI build: `scripts/build-ui.ts`
- Bun main process: `src/bun/index.ts`
- Solid UI entry: `src/mainview/App.tsx`
- Migration guide: `MIGRATION_ELECTRON_TO_ELECTROBUN.md`
