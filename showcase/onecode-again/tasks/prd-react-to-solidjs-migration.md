# PRD: React to SolidJS Migration

## Introduction

Complete the migration of the onecode-again showcase app from React to SolidJS. The codebase has undergone an initial automated migration using `solid-jsx-oxc` (196 TSX files processed), but ~5500 type errors remain due to React-specific patterns that require manual conversion. This migration aligns the UI framework with Electrobun's architecture and enables fine-grained reactivity for a high-performance developer workspace.

## Goals

- Eliminate all React dependencies and patterns from the mainview codebase
- Achieve zero TypeScript errors in `src/mainview/`
- Maintain full application functionality after migration
- Follow idiomatic SolidJS patterns per REACT_TO_SOLIDJS_MIGRATION.md guide
- Enable the app to build and run via `bun dev`

## User Stories

### US-001: Fix Signal Accessor Patterns
**Description:** As a developer, I need all signal reads to use accessor syntax so reactivity works correctly.

**Acceptance Criteria:**
- [ ] All `signal.property` patterns converted to `signal().property`
- [ ] All `signal === value` comparisons converted to `signal() === value`
- [ ] All `signal.method()` calls converted to `signal().method()`
- [ ] Derived values that depend on signals are wrapped in functions or `createMemo`
- [ ] Typecheck passes for signal-related errors

### US-002: Convert React Refs to SolidJS Refs
**Description:** As a developer, I need refs to use SolidJS patterns so DOM element access works.

**Acceptance Criteria:**
- [ ] All `ref.current` patterns converted to direct `ref` access
- [ ] All `useRef(null)` patterns converted to `let ref: HTMLElement | undefined`
- [ ] Ref assignments use `ref={el => ref = el}` or direct `ref={ref}` patterns
- [ ] Timeout/interval refs use `let timeoutRef: ReturnType<typeof setTimeout> | undefined`
- [ ] Typecheck passes for ref-related errors

### US-003: Remove React.memo and forwardRef Wrappers
**Description:** As a developer, I need React memoization removed since SolidJS doesn't re-render components.

**Acceptance Criteria:**
- [ ] All `memo()` wrapper calls removed
- [ ] All `forwardRef()` patterns converted to props-based ref passing
- [ ] All `React.FC`, `React.ComponentType` types replaced with `Component`, `ParentComponent`
- [ ] Typecheck passes for memo/forwardRef errors

### US-004: Convert Conditional Rendering to Show/Switch
**Description:** As a developer, I need React conditional patterns converted to SolidJS control flow.

**Acceptance Criteria:**
- [ ] All `{condition && <Component />}` patterns converted to `<Show when={condition()}>`
- [ ] All ternary `{cond ? <A /> : <B />}` patterns converted to `<Show when={} fallback={}>`
- [ ] Multi-branch conditionals use `<Switch>/<Match>` components
- [ ] Typecheck passes for conditional rendering errors

### US-005: Convert List Rendering to For/Index
**Description:** As a developer, I need array mapping converted to SolidJS list components.

**Acceptance Criteria:**
- [ ] All `.map()` calls in JSX converted to `<For each={array()}>` 
- [ ] All `key` props removed (SolidJS uses index-based reconciliation)
- [ ] Primitive arrays use `<Index>` instead of `<For>` where appropriate
- [ ] Typecheck passes for list rendering errors

### US-006: Fix Event Handler Types
**Description:** As a developer, I need React event types replaced with native DOM types.

**Acceptance Criteria:**
- [ ] `React.ChangeEvent<HTMLInputElement>` → `Event & { currentTarget: HTMLInputElement }`
- [ ] `React.KeyboardEvent` → `KeyboardEvent`
- [ ] `React.MouseEvent` → `MouseEvent`
- [ ] `React.FormEvent` → `Event & { currentTarget: HTMLFormElement }`
- [ ] `onChange` → `onInput` for text inputs (SolidJS pattern)
- [ ] Typecheck passes for event-related errors

### US-007: Remove motion/react Animations
**Description:** As a developer, I need Framer Motion replaced with CSS animations or solid-motionone.

**Acceptance Criteria:**
- [ ] All `import { motion, AnimatePresence } from 'motion/react'` removed
- [ ] `AnimatePresence` replaced with `<Show>` + CSS animation classes
- [ ] `motion.div` replaced with regular `<div>` + CSS classes (`animate-in`, `fade-in`, etc.)
- [ ] Complex animations use Web Animations API or solid-motionone if needed
- [ ] Typecheck passes for animation-related errors

### US-008: Fix Portal and createPortal Usage
**Description:** As a developer, I need React portals converted to SolidJS Portal component.

**Acceptance Criteria:**
- [ ] `import { createPortal } from 'react-dom'` → `import { Portal } from 'solid-js/web'`
- [ ] `createPortal(children, container)` → `<Portal mount={container}>{children}</Portal>`
- [ ] Typecheck passes for portal-related errors

### US-009: Fix SVG and JSX Attribute Types
**Description:** As a developer, I need SVG props to use SolidJS JSX types.

**Acceptance Criteria:**
- [ ] `React.SVGProps<SVGSVGElement>` → `JSX.SvgSVGAttributes<SVGSVGElement>`
- [ ] `React.HTMLAttributes<HTMLDivElement>` → `JSX.HTMLAttributes<HTMLDivElement>`
- [ ] SVG attributes use kebab-case where needed (`stroke-width` vs `strokeWidth`)
- [ ] Typecheck passes for SVG/attribute errors

### US-010: Fix CSS Property Names
**Description:** As a developer, I need inline styles to use SolidJS CSS property format.

**Acceptance Criteria:**
- [ ] camelCase CSS properties converted to kebab-case in style objects
- [ ] `backgroundColor` → `"background-color"`
- [ ] Non-standard properties like `WebkitAppRegion` handled appropriately
- [ ] Typecheck passes for CSS-related errors

### US-011: Fix window.desktopApi Type Safety
**Description:** As a developer, I need desktopApi calls to be type-safe.

**Acceptance Criteria:**
- [ ] All `window.desktopApi` casts to `(window as any).desktopApi` or proper typing
- [ ] Consider adding global type declaration for desktopApi
- [ ] Typecheck passes for desktopApi errors

### US-012: Fix Jotai/tRPC Integration
**Description:** As a developer, I need state management hooks working with SolidJS.

**Acceptance Criteria:**
- [ ] `useAtom`, `useAtomValue`, `useSetAtom` work with SolidJS (via jotai-solid or adapter)
- [ ] tRPC hooks (`useQuery`, `useMutation`) return reactive signals
- [ ] No dependency array syntax in effects (SolidJS auto-tracks)
- [ ] Typecheck passes for state management errors

### US-013: Build and Runtime Verification
**Description:** As a developer, I need the app to build and run successfully.

**Acceptance Criteria:**
- [ ] `bun run typecheck` passes with 0 errors in `src/mainview/`
- [ ] `bun run ui:build` completes successfully
- [ ] `bun run dev` launches the app
- [ ] Core features work: navigation, settings dialogs, terminal, chat

## Functional Requirements

- FR-1: All 196 TSX files in `src/mainview/` must compile without TypeScript errors
- FR-2: Signal accessors must be called as functions (`signal()`) when reading values
- FR-3: Refs must use SolidJS direct-value pattern, not `.current` property
- FR-4: Control flow must use `<Show>`, `<For>`, `<Switch>`, `<Match>` components
- FR-5: Event handlers must use native DOM event types
- FR-6: Props must not be destructured at function signature (breaks reactivity)
- FR-7: Effects must not have dependency arrays (SolidJS auto-tracks)
- FR-8: `splitProps()` must be used when forwarding props to child elements

## Non-Goals

- No changes to backend (`src/bun/`) beyond what's needed for RPC compatibility
- No new features during migration
- No performance optimization beyond fixing reactivity patterns
- No migration of test files (if any exist)
- No changes to build tooling beyond what's needed to compile

## Technical Considerations

### Dependencies to Keep
- `solid-js` - Core framework
- `@kobalte/core` - UI primitives (replaces Radix)
- `lucide-solid` - Icons (replaces lucide-react)
- `@solid-primitives/*` - Utilities
- `class-variance-authority` - Variant styling

### Dependencies to Remove/Replace
- `motion/react` → CSS animations or `solid-motionone`
- `react-zoom-pan-pinch` → Native implementation or solid alternative

### Key Files by Error Volume (Prioritize)
1. Settings dialog tabs (`agents-*.tsx`) - Many signal/ref patterns
2. Terminal components - Complex refs and effects
3. Agent UI components - Heavy state management
4. Sidebar components - List rendering and conditionals

### Pattern Reference
See `REACT_TO_SOLIDJS_MIGRATION.md` for complete conversion patterns.

## Success Metrics

- 0 TypeScript errors in `src/mainview/` (currently ~5500)
- App builds successfully with `bun run ui:build`
- App runs with `bun run dev`
- All dialogs open and close correctly
- Terminal renders and accepts input
- Settings persist correctly

## Decisions

- **Animations**: Use `solid-motionone` for complex animations, CSS for simple transitions
- **State Management**: Use native SolidJS signals (`createSignal`, `createStore`) - no jotai adapter
- **Desktop API Types**: Reference Electrobun source for `window.desktopApi` type declarations
- **Testing**: Manual verification only (typecheck not required as acceptance criteria)
