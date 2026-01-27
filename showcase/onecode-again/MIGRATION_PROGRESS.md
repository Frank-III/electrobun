# React to SolidJS Migration Progress

> **Project**: onecode-again (learn_ts/1code)
> **Goal**: Migrate codebase from React to SolidJS

---

## Current Status: In Progress - UI Components

### Reference Documents
- `REACT_TO_SOLIDJS_MIGRATION.md` - Full migration guide (in this folder)
- `AGENTS.md` - SolidJS guidelines and UI library preferences

### Tech Stack Decisions

| Category | From (React) | To (SolidJS) |
|----------|-------------|---------------|
| Framework | React | SolidJS |
| UI Primitives | Radix UI | **Corvu** (primary), Kobalte (fallback) |
| Utilities | Custom hooks | solid-primitives |
| Animations | Framer Motion | Web Animations API + solid-transition-group |
| State | Jotai atoms | createSignal, createStore |
| Routing | TBD | @tanstack/solid-router |

### Build Notes
- **No Vite** - Uses `Bun.build` (see `scripts/build-ui.ts`)
- Solid JSX compiled via **solid-jsx-oxc** (`scripts/solid-plugin.ts`)
- Build script now written and functional

---

## Migration Phases

### Phase 1: Setup
- [x] Install SolidJS dependencies (solid-js already in package.json)
- [ ] Configure tsconfig.json for Solid JSX
- [ ] Install Corvu/Kobalte for UI primitives
- [ ] Install solid-primitives packages as needed
- [x] Write build script (`scripts/build-ui.ts`)

### Phase 2: Global Changes
- [ ] `className` → `class` (project-wide find/replace)
- [ ] `htmlFor` → `for`
- [ ] Remove `key` props from list items
- [ ] Update import paths

### Phase 3: Component Migration
- [x] Started converting UI components to Solid patterns
- [ ] Stop destructuring props (use splitProps)
- [ ] useState → createSignal
- [ ] useEffect → createEffect/onMount/onCleanup
- [ ] useMemo → createMemo
- [ ] useRef → let variables

### Phase 4: JSX Patterns
- [ ] `{condition && <X />}` → `<Show when={...}>`
- [ ] `.map()` → `<For each={...}>`
- [ ] Ternaries → `<Show when={} fallback={}>`
- [ ] Multiple conditions → `<Switch><Match>...</Match></Switch>`

### Phase 5: UI Libraries
- [ ] Migrate Radix → Corvu/Kobalte
- [ ] Migrate animations to Web Animations API
- [ ] Migrate custom hooks to solid-primitives

### Phase 6: Testing & Cleanup
- [ ] Test all components
- [ ] Verify reactivity works correctly
- [ ] Remove React dependencies
- [ ] Performance testing

---

## Files Migrated

### UI Components (`src/mainview/components/ui/`)

| File | Status | Notes |
|------|--------|-------|
| `input.tsx` | ✅ Done | splitProps, Component, JSX types |
| `textarea.tsx` | ✅ Done | splitProps, Component, JSX types |
| `skeleton.tsx` | ✅ Done | splitProps, Component |
| `button.tsx` | ✅ Done | Removed Radix Slot, ParentComponent |
| `badge.tsx` | ✅ Done | ParentComponent, splitProps |
| `label.tsx` | ✅ Done | Removed @radix-ui/react-label |
| `kbd.tsx` | ✅ Done | For, Show for icon rendering |
| `select.tsx` | ❌ Pending | Needs Kobalte migration |
| `dropdown-menu.tsx` | ❌ Pending | Needs Kobalte migration |
| `context-menu.tsx` | ❌ Pending | Needs Kobalte migration |
| `collapsible.tsx` | ❌ Pending | Needs Corvu migration |
| `checkbox.tsx` | ❌ Pending | Needs Kobalte migration |
| `switch.tsx` | ❌ Pending | Needs Kobalte migration |
| `progress.tsx` | ❌ Pending | Needs Kobalte migration |
| `dialog.tsx` | ❌ Pending | Needs Corvu migration |
| `tooltip.tsx` | ❌ Pending | Needs Corvu migration |
| `popover.tsx` | ❌ Pending | Needs Corvu migration |
| `tabs.tsx` | ❌ Pending | Needs Kobalte migration |
| `accordion.tsx` | ❌ Pending | Needs Kobalte migration |

### Build/Config

| File | Status | Notes |
|------|--------|-------|
| `scripts/build-ui.ts` | ✅ Done | Bun.build with solid-plugin + tailwind |
| `scripts/solid-plugin.ts` | ✅ Existing | Uses solid-jsx-oxc |

### App-Level Files

| File | Status | Notes |
|------|--------|-------|
| `main.tsx` | ✅ Existing | Already uses solid-js/web render |
| `App.tsx` | ❌ Pending | Still uses React hooks, Jotai, next-themes |

---

## Notes & Issues

### Dependencies to Install
```bash
bun add @kobalte/core corvu
bun add @solid-primitives/storage @solid-primitives/keyboard @solid-primitives/scheduled
```

### Key Patterns Used
- `splitProps(props, ["class", "ref", "children"])` for prop separation
- `ParentComponent<Props>` for components with children
- `Component<Props>` for components without children
- `JSX.HTMLAttributes<HTMLElement>` for native element props
- `For` and `Show` for conditional/list rendering

---

## Commands

```bash
# Build UI (from showcase/onecode-again)
bun run build:ui

# Development
bun dev
```
