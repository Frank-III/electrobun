## Showcase App Principles (1code Again)

This folder is a **real showcase app**, not a toy template. Changes should push it toward a polished, usable 1code-style workspace.

### Version Control
- Use **`jj` (Jujutsu)** for VCS operations (not `git`).

### Issue Tracking (fp)
- Before starting work, claim the issue: `fp issue update --status in-progress <id>`
- Commit frequently with descriptive messages
- After committing, assign commits to the issue: `fp issue assign <id> --rev <commit>`
- Log progress at milestones: `fp comment <id> "progress..."`
- When done, mark complete: `fp issue update --status done <id>`

### Build Tooling
- **No Vite.** UI bundling uses `Bun.build` (see `scripts/build-ui.ts`).
- Solid JSX compilation is **currently handled by a temporary Babel plugin** (see `scripts/solid-plugin.ts`).
- `solid-jsx-oxc` is included as a dev dependency but **is not wired into the build yet**.

### UI Libraries
- Prefer **Corvu** for unstyled, accessible primitives (dialogs, popovers, tooltips).
- Use **Kobalte** when Corvu isn’t a fit (or upstream patterns rely on it).
- Use **Solid Primitives** for utilities (storage, event listeners, resize observers, etc).

### SolidJS Guidelines
- Prefer idiomatic Solid patterns (`createSignal`, `createMemo`, `createEffect`, `<Show>`, `<For>`, `<Switch>`).
- Avoid unnecessary reactivity churn (memoize derived data, minimize effects).
- Keep the UI fast for large datasets (virtualize where needed; avoid expensive rerenders).

### Product Direction
- Target a high-performance, “1code-style” dev workspace:
  - Multi-tab editor with file tree and quick switcher.
  - Integrated terminal with fast scrollback and search.
  - Command palette and keyboard-first flows.
  - Theme system with sensible defaults and user overrides.
  - Clean, low-latency UI under heavy workloads.
