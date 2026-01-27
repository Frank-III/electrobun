# React to SolidJS Migration Guide

> A systematic guide for migrating React codebases to SolidJS, covering component patterns, state management, UI libraries, and animations.

---

## Table of Contents

1. [Core Philosophy Differences](#core-philosophy-differences)
2. [JSX Syntax Changes](#jsx-syntax-changes)
3. [Component Patterns](#component-patterns)
4. [State Management Migration](#state-management-migration)
5. [Radix UI → Kobalte](#radix-ui--kobalte)
6. [Framer Motion → Web Animations API](#framer-motion--web-animations-api)
7. [Hooks → Primitives](#hooks--primitives)
8. [solid-primitives](#solid-primitives)
9. [Routing (TanStack Router)](#routing)
10. [Common Pitfalls](#common-pitfalls)
11. [Migration Checklist](#migration-checklist)

---

## Core Philosophy Differences

### React: Virtual DOM + Reconciliation
React re-renders entire component trees and diffs the virtual DOM.

### SolidJS: Fine-Grained Reactivity
Solid compiles JSX to real DOM operations. Components run **once**. Only the reactive expressions update.

```
React:    Component() called on every state change
SolidJS:  Component() called ONCE, signals update DOM directly
```

**Critical Mindset Shift**: In Solid, think of components as setup functions, not render functions.

---

## JSX Syntax Changes

### className → class

```tsx
// ❌ React
<div className="container mx-auto" />

// ✅ SolidJS
<div class="container mx-auto" />
```

### classList for Conditional Classes

```tsx
// ❌ React (with clsx/cn)
<div className={clsx("base", { "active": isActive, "disabled": isDisabled })} />

// ✅ SolidJS
<div
  class="base"
  classList={{
    "active": isActive(),
    "disabled": isDisabled(),
  }}
/>
```

### Event Handlers: camelCase → on:event or onclick

```tsx
// ❌ React
<button onClick={handleClick} onMouseEnter={handleHover} />

// ✅ SolidJS (lowercase)
<button onclick={handleClick} onMouseEnter={handleHover} />

// ✅ SolidJS (delegated events - preferred for common events)
<button onClick={handleClick} />
```

Note: Solid supports both. Capital `onClick` uses event delegation (more performant for click, input, etc.).

### htmlFor → for

```tsx
// ❌ React
<label htmlFor="input-id">Label</label>

// ✅ SolidJS
<label for="input-id">Label</label>
```

### Fragments

```tsx
// React
<React.Fragment> or <></>

// SolidJS
<> </> // Same syntax works
```

### Spread Props

```tsx
// ❌ React
<Component {...props} />

// ✅ SolidJS - use splitProps for extraction
const [local, others] = splitProps(props, ["class", "children"]);
<Component {...others} />
```

---

## Component Patterns

### Basic Component

```tsx
// ❌ React
import { FC } from "react";

interface Props {
  title: string;
  count: number;
}

const MyComponent: FC<Props> = ({ title, count }) => {
  return (
    <div className="container">
      <h1>{title}</h1>
      <span>{count}</span>
    </div>
  );
};

// ✅ SolidJS
import { Component } from "solid-js";

interface Props {
  title: string;
  count: number;
}

const MyComponent: Component<Props> = (props) => {
  // ⚠️ DO NOT destructure props - breaks reactivity
  return (
    <div class="container">
      <h1>{props.title}</h1>
      <span>{props.count}</span>
    </div>
  );
};
```

### Children

```tsx
// ❌ React
const Container: FC<{ children: ReactNode }> = ({ children }) => {
  return <div className="wrapper">{children}</div>;
};

// ✅ SolidJS
import { ParentComponent, children as resolveChildren } from "solid-js";

const Container: ParentComponent = (props) => {
  return <div class="wrapper">{props.children}</div>;
};

// If you need to manipulate children:
const Container: ParentComponent = (props) => {
  const resolved = resolveChildren(() => props.children);
  // resolved() gives you the actual DOM nodes
  return <div class="wrapper">{resolved()}</div>;
};
```

### Conditional Rendering

```tsx
// ❌ React
{condition && <Component />}
{condition ? <A /> : <B />}

// ✅ SolidJS - use Show for better performance
import { Show } from "solid-js";

<Show when={condition()}>
  <Component />
</Show>

<Show when={condition()} fallback={<B />}>
  <A />
</Show>

// With keyed (extracting value from when)
<Show when={user()} keyed>
  {(user) => <Profile user={user} />}
</Show>
```

### List Rendering

```tsx
// ❌ React
{items.map((item) => <Item key={item.id} data={item} />)}

// ✅ SolidJS - use For for referential stability
import { For } from "solid-js";

<For each={items()}>
  {(item, index) => <Item data={item} index={index()} />}
</For>

// For non-keyed/primitive lists
import { Index } from "solid-js";

<Index each={items()}>
  {(item, index) => <Item data={item()} index={index} />}
</Index>
```

### Switch/Match for Multiple Conditions

```tsx
// ❌ React
{status === "loading" && <Spinner />}
{status === "error" && <Error />}
{status === "success" && <Content />}

// ✅ SolidJS
import { Switch, Match } from "solid-js";

<Switch fallback={<Default />}>
  <Match when={status() === "loading"}>
    <Spinner />
  </Match>
  <Match when={status() === "error"}>
    <Error />
  </Match>
  <Match when={status() === "success"}>
    <Content />
  </Match>
</Switch>
```

### Error Boundaries

```tsx
// ❌ React (class component)
class ErrorBoundary extends React.Component { ... }

// ✅ SolidJS
import { ErrorBoundary } from "solid-js";

<ErrorBoundary fallback={(err, reset) => <ErrorDisplay error={err} onRetry={reset} />}>
  <App />
</ErrorBoundary>
```

### Portals

```tsx
// ❌ React
import { createPortal } from "react-dom";
{createPortal(<Modal />, document.body)}

// ✅ SolidJS
import { Portal } from "solid-js/web";

<Portal mount={document.body}>
  <Modal />
</Portal>
```

---

## State Management Migration

### useState → createSignal

```tsx
// ❌ React
const [count, setCount] = useState(0);
const [user, setUser] = useState<User | null>(null);

// Update
setCount(count + 1);
setCount(prev => prev + 1);
setUser({ ...user, name: "New" });

// ✅ SolidJS
import { createSignal } from "solid-js";

const [count, setCount] = createSignal(0);
const [user, setUser] = createSignal<User | null>(null);

// Update - NOTE: count is a FUNCTION
setCount(count() + 1);
setCount(prev => prev + 1);
setUser(prev => ({ ...prev!, name: "New" }));

// ⚠️ Access value with ()
<span>{count()}</span>
```

### useReducer → createSignal + functions

```tsx
// ❌ React
const [state, dispatch] = useReducer(reducer, initialState);
dispatch({ type: "INCREMENT" });

// ✅ SolidJS - just use signals with update functions
const [state, setState] = createSignal(initialState);

const increment = () => setState(s => ({ ...s, count: s.count + 1 }));
const decrement = () => setState(s => ({ ...s, count: s.count - 1 }));
```

### Jotai → createSignal (global) or createStore

#### Simple Atoms → Global Signals

```tsx
// ❌ Jotai
import { atom, useAtom } from "jotai";

const countAtom = atom(0);
const doubleAtom = atom((get) => get(countAtom) * 2);

function Counter() {
  const [count, setCount] = useAtom(countAtom);
  const [double] = useAtom(doubleAtom);
  return <div>{count} / {double}</div>;
}

// ✅ SolidJS - Global signals
import { createSignal, createMemo } from "solid-js";

// Define outside component (module scope)
const [count, setCount] = createSignal(0);
const double = createMemo(() => count() * 2);

function Counter() {
  return <div>{count()} / {double()}</div>;
}
```

#### Complex State → createStore

```tsx
// ❌ Jotai with nested state
const userAtom = atom({ profile: { name: "", settings: { theme: "dark" } } });

// ✅ SolidJS createStore
import { createStore, produce } from "solid-js/store";

const [user, setUser] = createStore({
  profile: { name: "", settings: { theme: "dark" } }
});

// Path-based updates (no spread needed!)
setUser("profile", "name", "John");
setUser("profile", "settings", "theme", "light");

// Or use produce for Immer-like mutations
setUser(produce(u => {
  u.profile.name = "John";
  u.profile.settings.theme = "light";
}));

// Access in JSX - fine-grained (only this span updates)
<span>{user.profile.name}</span>
```

### Zustand → createStore or createContext

```tsx
// ❌ Zustand
import { create } from "zustand";

const useStore = create((set) => ({
  bears: 0,
  increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
}));

function Component() {
  const bears = useStore((state) => state.bears);
  const increase = useStore((state) => state.increasePopulation);
}

// ✅ SolidJS - Context + Store pattern
import { createContext, useContext, ParentComponent } from "solid-js";
import { createStore } from "solid-js/store";

interface BearStore {
  bears: number;
}

interface BearActions {
  increasePopulation: () => void;
}

const BearContext = createContext<[BearStore, BearActions]>();

export const BearProvider: ParentComponent = (props) => {
  const [state, setState] = createStore<BearStore>({ bears: 0 });
  
  const actions: BearActions = {
    increasePopulation: () => setState("bears", b => b + 1),
  };
  
  return (
    <BearContext.Provider value={[state, actions]}>
      {props.children}
    </BearContext.Provider>
  );
};

export const useBearStore = () => {
  const ctx = useContext(BearContext);
  if (!ctx) throw new Error("useBearStore must be used within BearProvider");
  return ctx;
};

// Usage
function Component() {
  const [state, { increasePopulation }] = useBearStore();
  return <button onclick={increasePopulation}>{state.bears}</button>;
}
```

### Redux → createStore + Context

For complex Redux patterns, follow the Zustand pattern above but with more structured actions. Consider using `solid-zustand` or building a similar abstraction.

---

## Radix UI → Kobalte

### Installation

```bash
# Remove Radix
npm uninstall @radix-ui/react-*

# Install Kobalte
npm install @kobalte/core
```

### Component Mapping

| Radix UI | Kobalte |
|----------|--------|
| `@radix-ui/react-dialog` | `@kobalte/core/dialog` |
| `@radix-ui/react-dropdown-menu` | `@kobalte/core/dropdown-menu` |
| `@radix-ui/react-popover` | `@kobalte/core/popover` |
| `@radix-ui/react-select` | `@kobalte/core/select` |
| `@radix-ui/react-tabs` | `@kobalte/core/tabs` |
| `@radix-ui/react-tooltip` | `@kobalte/core/tooltip` |
| `@radix-ui/react-checkbox` | `@kobalte/core/checkbox` |
| `@radix-ui/react-switch` | `@kobalte/core/switch` |
| `@radix-ui/react-accordion` | `@kobalte/core/accordion` |
| `@radix-ui/react-slider` | `@kobalte/core/slider` |
| `@radix-ui/react-progress` | `@kobalte/core/progress` |
| `@radix-ui/react-alert-dialog` | `@kobalte/core/alert-dialog` |

### Dialog Example

```tsx
// ❌ Radix
import * as Dialog from "@radix-ui/react-dialog";

<Dialog.Root open={open} onOpenChange={setOpen}>
  <Dialog.Trigger className="btn">Open</Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Overlay className="overlay" />
    <Dialog.Content className="content">
      <Dialog.Title>Title</Dialog.Title>
      <Dialog.Description>Description</Dialog.Description>
      <Dialog.Close className="close">×</Dialog.Close>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>

// ✅ Kobalte
import { Dialog } from "@kobalte/core/dialog";

<Dialog open={open()} onOpenChange={setOpen}>
  <Dialog.Trigger class="btn">Open</Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Overlay class="overlay" />
    <Dialog.Content class="content">
      <Dialog.Title>Title</Dialog.Title>
      <Dialog.Description>Description</Dialog.Description>
      <Dialog.CloseButton class="close">×</Dialog.CloseButton>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog>
```

### Select Example

```tsx
// ❌ Radix
import * as Select from "@radix-ui/react-select";

<Select.Root value={value} onValueChange={setValue}>
  <Select.Trigger>
    <Select.Value placeholder="Select..." />
  </Select.Trigger>
  <Select.Portal>
    <Select.Content>
      <Select.Viewport>
        {items.map(item => (
          <Select.Item key={item.value} value={item.value}>
            <Select.ItemText>{item.label}</Select.ItemText>
          </Select.Item>
        ))}
      </Select.Viewport>
    </Select.Content>
  </Select.Portal>
</Select.Root>

// ✅ Kobalte
import { Select } from "@kobalte/core/select";

<Select
  value={value()}
  onChange={setValue}
  options={items}
  optionValue="value"
  optionTextValue="label"
  placeholder="Select..."
  itemComponent={props => (
    <Select.Item item={props.item} class="select-item">
      <Select.ItemLabel>{props.item.rawValue.label}</Select.ItemLabel>
    </Select.Item>
  )}
>
  <Select.Trigger class="select-trigger">
    <Select.Value<Item>>{state => state.selectedOption().label}</Select.Value>
  </Select.Trigger>
  <Select.Portal>
    <Select.Content class="select-content">
      <Select.Listbox class="select-listbox" />
    </Select.Content>
  </Select.Portal>
</Select>
```

### Key Differences

1. **Import Style**: Kobalte uses named imports from subpaths
2. **className → class**: All Kobalte components use `class`
3. **Controlled State**: Pass signal getters to `open`, `value`, etc.
4. **Close Button**: `Dialog.Close` → `Dialog.CloseButton`
5. **Select is Different**: Kobalte Select uses `options` array pattern

---

## Framer Motion → Web Animations API

### No External Library Needed

SolidJS works perfectly with the native Web Animations API. Just use refs and `element.animate()`.

### Basic Animation

```tsx
// ❌ Framer Motion
import { motion } from "framer-motion";

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.3 }}
  className="box"
/>

// ✅ SolidJS + Web Animations API
import { onMount } from "solid-js";

function AnimatedBox() {
  let ref: HTMLDivElement;
  
  onMount(() => {
    ref.animate(
      [
        { opacity: 0, transform: "translateY(20px)" },
        { opacity: 1, transform: "translateY(0)" }
      ],
      { duration: 300, fill: "forwards", easing: "ease-out" }
    );
  });
  
  return <div ref={ref!} class="box" />;
}
```

### Reactive Animations (Animate on State Change)

```tsx
// ❌ Framer Motion
<motion.div animate={{ scale: isActive ? 1.1 : 1 }} />

// ✅ SolidJS
import { createSignal, createEffect } from "solid-js";

function ScaleBox() {
  const [isActive, setIsActive] = createSignal(false);
  let ref: HTMLDivElement;
  
  createEffect(() => {
    ref.animate(
      { transform: isActive() ? "scale(1.1)" : "scale(1)" },
      { duration: 200, fill: "forwards", easing: "ease-out" }
    );
  });
  
  return (
    <div
      ref={ref!}
      class="box"
      onclick={() => setIsActive(!isActive())}
    />
  );
}
```

### Enter/Exit Animations with solid-transition-group

```bash
npm install solid-transition-group
```

```tsx
// ❌ Framer Motion AnimatePresence
import { AnimatePresence, motion } from "framer-motion";

<AnimatePresence>
  {show && (
    <motion.div
      key="modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    />
  )}
</AnimatePresence>

// ✅ SolidJS with solid-transition-group
import { Transition } from "solid-transition-group";
import { Show } from "solid-js";

<Transition
  onEnter={(el, done) => {
    el.animate(
      [{ opacity: 0 }, { opacity: 1 }],
      { duration: 300, easing: "ease-out" }
    ).finished.then(done);
  }}
  onExit={(el, done) => {
    el.animate(
      [{ opacity: 1 }, { opacity: 0 }],
      { duration: 300, easing: "ease-in" }
    ).finished.then(done);
  }}
>
  <Show when={show()}>
    <div class="modal" />
  </Show>
</Transition>
```

### Slide + Fade Animation

```tsx
import { Transition } from "solid-transition-group";

function SlidePanel(props: { open: boolean; children: JSX.Element }) {
  return (
    <Transition
      onEnter={(el, done) => {
        el.animate(
          [
            { opacity: 0, transform: "translateX(100%)" },
            { opacity: 1, transform: "translateX(0)" }
          ],
          { duration: 300, easing: "cubic-bezier(0.16, 1, 0.3, 1)" }
        ).finished.then(done);
      }}
      onExit={(el, done) => {
        el.animate(
          [
            { opacity: 1, transform: "translateX(0)" },
            { opacity: 0, transform: "translateX(100%)" }
          ],
          { duration: 250, easing: "ease-in" }
        ).finished.then(done);
      }}
    >
      <Show when={props.open}>
        {props.children}
      </Show>
    </Transition>
  );
}
```

### Creating a Reusable Animate Directive

```tsx
// directives/animate.ts
import { Accessor, onMount } from "solid-js";

declare module "solid-js" {
  namespace JSX {
    interface Directives {
      animate: AnimateOptions;
    }
  }
}

interface AnimateOptions {
  keyframes: Keyframe[];
  options?: KeyframeAnimationOptions;
}

export function animate(el: HTMLElement, accessor: Accessor<AnimateOptions>) {
  onMount(() => {
    const { keyframes, options } = accessor();
    el.animate(keyframes, {
      duration: 300,
      fill: "forwards",
      easing: "ease-out",
      ...options,
    });
  });
}

// Usage
import { animate } from "./directives/animate";
// Prevent tree-shaking
false && animate;

<div
  use:animate={{
    keyframes: [
      { opacity: 0, transform: "translateY(20px)" },
      { opacity: 1, transform: "translateY(0)" }
    ],
    options: { duration: 400 }
  }}
  class="card"
>
  Content
</div>
```

### Staggered List Animation

```tsx
import { For, onMount } from "solid-js";

function StaggeredList<T>(props: { items: T[]; children: (item: T) => JSX.Element }) {
  let containerRef: HTMLDivElement;
  
  onMount(() => {
    const children = containerRef.children;
    Array.from(children).forEach((child, i) => {
      (child as HTMLElement).animate(
        [
          { opacity: 0, transform: "translateY(20px)" },
          { opacity: 1, transform: "translateY(0)" }
        ],
        {
          duration: 300,
          delay: i * 50, // Stagger by 50ms
          fill: "forwards",
          easing: "ease-out"
        }
      );
    });
  });
  
  return (
    <div ref={containerRef!} class="list">
      <For each={props.items}>
        {(item) => <div style={{ opacity: 0 }}>{props.children(item)}</div>}
      </For>
    </div>
  );
}

// Usage
<StaggeredList items={items()}>
  {(item) => <Card data={item} />}
</StaggeredList>
```

### CSS-Based Animations (Simplest Approach)

For simple cases, CSS transitions with `solid-transition-group` name-based classes:

```css
/* styles.css */
.fade-enter {
  opacity: 0;
  transform: translateY(10px);
}

.fade-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.3s ease-out, transform 0.3s ease-out;
}

.fade-exit {
  opacity: 1;
}

.fade-exit-active {
  opacity: 0;
  transition: opacity 0.2s ease-in;
}
```

```tsx
import { Transition } from "solid-transition-group";

<Transition name="fade">
  <Show when={visible()}>
    <div class="modal">Content</div>
  </Show>
</Transition>
```

### Animation Utility Functions

```tsx
// utils/animations.ts

export const fadeIn = (el: HTMLElement, duration = 300) =>
  el.animate(
    [{ opacity: 0 }, { opacity: 1 }],
    { duration, fill: "forwards", easing: "ease-out" }
  );

export const fadeOut = (el: HTMLElement, duration = 200) =>
  el.animate(
    [{ opacity: 1 }, { opacity: 0 }],
    { duration, fill: "forwards", easing: "ease-in" }
  );

export const slideInRight = (el: HTMLElement, duration = 300) =>
  el.animate(
    [
      { opacity: 0, transform: "translateX(20px)" },
      { opacity: 1, transform: "translateX(0)" }
    ],
    { duration, fill: "forwards", easing: "cubic-bezier(0.16, 1, 0.3, 1)" }
  );

export const scaleIn = (el: HTMLElement, duration = 200) =>
  el.animate(
    [
      { opacity: 0, transform: "scale(0.95)" },
      { opacity: 1, transform: "scale(1)" }
    ],
    { duration, fill: "forwards", easing: "ease-out" }
  );

// Usage in Transition
import { fadeIn, fadeOut } from "./utils/animations";

<Transition
  onEnter={(el, done) => fadeIn(el).finished.then(done)}
  onExit={(el, done) => fadeOut(el).finished.then(done)}
>
  <Show when={open()}>
    <Dialog />
  </Show>
</Transition>
```

---

## Hooks → Primitives

### useEffect → createEffect

```tsx
// ❌ React
useEffect(() => {
  console.log("Count changed:", count);
}, [count]);

useEffect(() => {
  // Mount
  return () => {
    // Cleanup
  };
}, []);

// ✅ SolidJS
import { createEffect, onMount, onCleanup } from "solid-js";

// Reactive effect (runs when dependencies change)
createEffect(() => {
  console.log("Count changed:", count()); // Dependencies auto-tracked!
});

// Mount only
onMount(() => {
  console.log("Mounted");
});

// Cleanup
onCleanup(() => {
  console.log("Cleanup");
});

// Effect with cleanup
createEffect(() => {
  const handler = () => console.log(count());
  window.addEventListener("resize", handler);
  onCleanup(() => window.removeEventListener("resize", handler));
});
```

### useMemo → createMemo

```tsx
// ❌ React
const doubled = useMemo(() => count * 2, [count]);
const filtered = useMemo(() => items.filter(i => i.active), [items]);

// ✅ SolidJS
import { createMemo } from "solid-js";

const doubled = createMemo(() => count() * 2); // Auto-tracks count
const filtered = createMemo(() => items().filter(i => i.active));

// Usage (call as function)
<span>{doubled()}</span>
```

### useCallback → Just use functions

```tsx
// ❌ React
const handleClick = useCallback(() => {
  setCount(c => c + 1);
}, []);

// ✅ SolidJS - No memoization needed, components don't re-render
const handleClick = () => {
  setCount(c => c + 1);
};
```

### useRef → let variable or createSignal

```tsx
// ❌ React
const inputRef = useRef<HTMLInputElement>(null);
const countRef = useRef(0); // Mutable value

// ✅ SolidJS

// DOM ref - just use let
let inputRef: HTMLInputElement;
<input ref={inputRef!} />

// Mutable value that shouldn't trigger updates - just use let
let countRef = 0;

// If you need reactivity, use signal
const [countRef, setCountRef] = createSignal(0);
```

### useContext → useContext (same API!)

```tsx
// ❌ React
const ThemeContext = createContext<Theme>("light");
const theme = useContext(ThemeContext);

// ✅ SolidJS - Almost identical
import { createContext, useContext } from "solid-js";

const ThemeContext = createContext<Theme>("light");
const theme = useContext(ThemeContext); // Returns value directly, not signal
```

### Custom Hooks → Primitives

```tsx
// ❌ React Custom Hook
function useWindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });
  
  useEffect(() => {
    const handler = () => setSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
    handler();
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  
  return size;
}

// ✅ SolidJS Primitive
import { createSignal, onMount, onCleanup } from "solid-js";

function createWindowSize() {
  const [size, setSize] = createSignal({ width: 0, height: 0 });
  
  onMount(() => {
    const handler = () => setSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
    handler();
    window.addEventListener("resize", handler);
    onCleanup(() => window.removeEventListener("resize", handler));
  });
  
  return size; // Return signal getter
}

// Usage
const size = createWindowSize();
<span>{size().width} x {size().height}</span>
```

### useQuery (React Query) → @tanstack/solid-query

```tsx
// ❌ React Query
import { useQuery } from "@tanstack/react-query";

const { data, isLoading, error } = useQuery({
  queryKey: ["todos"],
  queryFn: fetchTodos,
});

// ✅ Solid Query
import { createQuery } from "@tanstack/solid-query";

const query = createQuery(() => ({
  queryKey: ["todos"],
  queryFn: fetchTodos,
}));

// Access as signals
<Show when={!query.isLoading} fallback={<Spinner />}>
  <For each={query.data}>
    {todo => <Todo data={todo} />}
  </For>
</Show>
```

---

## solid-primitives

A collection of high-quality, well-tested primitives for SolidJS. Think of it as the equivalent of React's ecosystem hooks (use-hooks, react-use, etc.) but built for Solid's reactivity model.

```bash
# Install individual packages as needed
npm install @solid-primitives/storage
npm install @solid-primitives/media
npm install @solid-primitives/resize-observer
# ... etc
```

### Common Primitives Mapping

| React Pattern / Hook | solid-primitives |
|---------------------|------------------|
| `useLocalStorage` | `@solid-primitives/storage` |
| `useMediaQuery` | `@solid-primitives/media` |
| `useClickOutside` | `@solid-primitives/click-outside` |
| `useDebounce` | `@solid-primitives/scheduled` |
| `useThrottle` | `@solid-primitives/scheduled` |
| `useIntersectionObserver` | `@solid-primitives/intersection-observer` |
| `useResizeObserver` | `@solid-primitives/resize-observer` |
| `useMutationObserver` | `@solid-primitives/mutation-observer` |
| `useEventListener` | `@solid-primitives/event-listener` |
| `useKeyboard` | `@solid-primitives/keyboard` |
| `useMouse` | `@solid-primitives/mouse` |
| `useGeolocation` | `@solid-primitives/geolocation` |
| `useClipboard` | `@solid-primitives/clipboard` |
| `useIdle` | `@solid-primitives/idle` |
| `useNetwork` | `@solid-primitives/connectivity` |
| `usePrevious` | `@solid-primitives/memo` |
| `useToggle` | `@solid-primitives/toggle` |

### Storage (localStorage / sessionStorage)

```tsx
// ❌ React
import { useLocalStorage } from "usehooks-ts";

const [value, setValue] = useLocalStorage("key", "default");

// ✅ solid-primitives
import { createStorage, createLocalStorage } from "@solid-primitives/storage";

// Simple persistent signal
const [value, setValue] = createLocalStorage("key", "default");

// Or with more control
const [store, setStore, { remove, clear }] = createStorage({
  api: localStorage,
  prefix: "my-app",
});

// Usage
setStore("theme", "dark");
const theme = store.theme; // Reactive!
```

### Media Queries

```tsx
// ❌ React
import { useMediaQuery } from "usehooks-ts";

const isMobile = useMediaQuery("(max-width: 768px)");

// ✅ solid-primitives
import { createMediaQuery } from "@solid-primitives/media";

const isMobile = createMediaQuery("(max-width: 768px)");
// isMobile() returns boolean

// Breakpoints helper
import { createBreakpoints } from "@solid-primitives/media";

const matches = createBreakpoints({
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
});

// Usage
<Show when={matches.md}>
  <DesktopNav />
</Show>
```

### Click Outside

```tsx
// ❌ React
import { useClickOutside } from "usehooks-ts";

const ref = useRef(null);
useClickOutside(ref, () => setOpen(false));

// ✅ solid-primitives
import { clickOutside } from "@solid-primitives/click-outside";

// As directive
false && clickOutside; // Prevent tree-shaking

<div use:clickOutside={() => setOpen(false)}>
  Dropdown content
</div>

// Or as function
import { makeClickOutside } from "@solid-primitives/click-outside";

let ref: HTMLDivElement;
makeClickOutside(
  () => ref,
  () => setOpen(false),
);

<div ref={ref!}>Content</div>
```

### Debounce / Throttle

```tsx
// ❌ React
import { useDebounce } from "usehooks-ts";

const debouncedValue = useDebounce(value, 500);

// ✅ solid-primitives
import { createScheduled, debounce, throttle } from "@solid-primitives/scheduled";

// Debounced signal
const [value, setValue] = createSignal("");
const debouncedValue = createScheduled(fn => debounce(fn, 500));

// Usage in effect
createEffect(() => {
  const scheduled = debouncedValue();
  if (scheduled) {
    // This runs 500ms after last value() change
    search(value());
  }
});

// Or debounce a function directly
const debouncedSearch = debounce((query: string) => {
  fetchResults(query);
}, 500);

<input oninput={(e) => debouncedSearch(e.target.value)} />

// Throttle works the same way
const throttledScroll = throttle((pos: number) => {
  updatePosition(pos);
}, 100);
```

### Intersection Observer

```tsx
// ❌ React
import { useInView } from "react-intersection-observer";

const { ref, inView } = useInView({ threshold: 0.5 });

// ✅ solid-primitives
import { createIntersectionObserver } from "@solid-primitives/intersection-observer";

let ref: HTMLDivElement;
const [isVisible, setIsVisible] = createSignal(false);

createIntersectionObserver(
  () => [ref],
  (entries) => {
    setIsVisible(entries[0].isIntersecting);
  },
  { threshold: 0.5 }
);

<div ref={ref!}>
  <Show when={isVisible()}>
    Now visible!
  </Show>
</div>

// Or use the directive
import { intersectionObserver } from "@solid-primitives/intersection-observer";

false && intersectionObserver;

<div use:intersectionObserver={(e) => setIsVisible(e.isIntersecting)}>
  Content
</div>
```

### Resize Observer

```tsx
// ❌ React
import { useResizeObserver } from "usehooks-ts";

const ref = useRef(null);
const { width, height } = useResizeObserver({ ref });

// ✅ solid-primitives
import { createResizeObserver } from "@solid-primitives/resize-observer";

let ref: HTMLDivElement;
const [size, setSize] = createSignal({ width: 0, height: 0 });

createResizeObserver(
  () => ref,
  ({ width, height }) => setSize({ width, height })
);

<div ref={ref!}>
  Size: {size().width} x {size().height}
</div>
```

### Event Listener

```tsx
// ❌ React
useEffect(() => {
  const handler = (e: KeyboardEvent) => { ... };
  window.addEventListener("keydown", handler);
  return () => window.removeEventListener("keydown", handler);
}, []);

// ✅ solid-primitives
import { createEventListener } from "@solid-primitives/event-listener";

// Auto-cleanup, reactive target
createEventListener(window, "keydown", (e) => {
  if (e.key === "Escape") setOpen(false);
});

// On element ref
let ref: HTMLInputElement;
createEventListener(
  () => ref,
  "focus",
  () => console.log("focused")
);

// Multiple events
createEventListener(document, ["mousedown", "touchstart"], handleInteraction);
```

### Keyboard

```tsx
// ❌ React
useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    if (e.key === "k" && e.metaKey) openSearch();
  };
  window.addEventListener("keydown", handler);
  return () => window.removeEventListener("keydown", handler);
}, []);

// ✅ solid-primitives
import { createShortcut } from "@solid-primitives/keyboard";

// Simple shortcut
createShortcut(["Meta", "k"], () => openSearch());
createShortcut(["Escape"], () => closeModal());

// With options
createShortcut(
  ["Control", "Shift", "P"],
  () => openCommandPalette(),
  { preventDefault: true }
);
```

### Mouse Position

```tsx
// ❌ React
const [position, setPosition] = useState({ x: 0, y: 0 });
useEffect(() => {
  const handler = (e: MouseEvent) => setPosition({ x: e.clientX, y: e.clientY });
  window.addEventListener("mousemove", handler);
  return () => window.removeEventListener("mousemove", handler);
}, []);

// ✅ solid-primitives
import { createMousePosition } from "@solid-primitives/mouse";

const pos = createMousePosition();

<div>
  Mouse: {pos.x} x {pos.y}
</div>

// Relative to element
import { createPositionToElement } from "@solid-primitives/mouse";

let ref: HTMLDivElement;
const pos = createPositionToElement(() => ref);

<div ref={ref!}>
  Relative: {pos.x} x {pos.y}
</div>
```

### Previous Value

```tsx
// ❌ React
import { usePrevious } from "usehooks-ts";

const prevCount = usePrevious(count);

// ✅ solid-primitives
import { createPrevious } from "@solid-primitives/memo";

const [count, setCount] = createSignal(0);
const prevCount = createPrevious(count);

// prevCount() is the previous value of count()
```

### Toggle

```tsx
// ❌ React
const [isOpen, setIsOpen] = useState(false);
const toggle = () => setIsOpen(prev => !prev);

// ✅ solid-primitives
import { createToggle } from "@solid-primitives/toggle";

const [isOpen, toggle] = createToggle(false);

// toggle() flips the value
// toggle(true) sets to true
// toggle(false) sets to false
```

### Clipboard

```tsx
// ❌ React
const copyToClipboard = async (text: string) => {
  await navigator.clipboard.writeText(text);
};

// ✅ solid-primitives
import { createClipboard, copyToClipboard } from "@solid-primitives/clipboard";

// One-off copy
await copyToClipboard("text to copy");

// Reactive clipboard (read + write)
const [clipboard, setClipboard] = createClipboard();

// Read
const content = clipboard();

// Write
setClipboard("new content");
```

### Idle Detection

```tsx
// ❌ React
// Usually requires a custom hook or library

// ✅ solid-primitives
import { createIdleTimer } from "@solid-primitives/idle";

const { isIdle, isPrompted, reset } = createIdleTimer({
  timeout: 5 * 60 * 1000, // 5 minutes
  promptTimeout: 30 * 1000, // 30 second warning
  onIdle: () => logout(),
  onPrompt: () => showWarning(),
});

<Show when={isPrompted()}>
  <IdleWarningModal onStayActive={reset} />
</Show>
```

### Network / Connectivity

```tsx
// ❌ React
const [isOnline, setIsOnline] = useState(navigator.onLine);
useEffect(() => {
  const handleOnline = () => setIsOnline(true);
  const handleOffline = () => setIsOnline(false);
  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);
  return () => { ... };
}, []);

// ✅ solid-primitives
import { createConnectivitySignal } from "@solid-primitives/connectivity";

const isOnline = createConnectivitySignal();

<Show when={!isOnline()}>
  <OfflineBanner />
</Show>
```

### Combining Primitives

```tsx
// Example: Auto-saving form with debounce + storage
import { createLocalStorage } from "@solid-primitives/storage";
import { debounce } from "@solid-primitives/scheduled";
import { createEffect } from "solid-js";

function AutoSaveForm() {
  const [draft, setDraft] = createLocalStorage("form-draft", "");
  
  const debouncedSave = debounce((value: string) => {
    setDraft(value);
  }, 1000);
  
  return (
    <textarea
      value={draft()}
      oninput={(e) => debouncedSave(e.target.value)}
      placeholder="Auto-saves to localStorage..."
    />
  );
}
```

### Installation Strategy

Install only what you need — each primitive is a separate package:

```bash
# Core utilities (commonly used)
npm install @solid-primitives/storage
npm install @solid-primitives/media
npm install @solid-primitives/scheduled
npm install @solid-primitives/event-listener

# UI interactions
npm install @solid-primitives/click-outside
npm install @solid-primitives/keyboard
npm install @solid-primitives/mouse

# Observers
npm install @solid-primitives/intersection-observer
npm install @solid-primitives/resize-observer
npm install @solid-primitives/mutation-observer

# Browser APIs
npm install @solid-primitives/clipboard
npm install @solid-primitives/geolocation
npm install @solid-primitives/connectivity
npm install @solid-primitives/idle
```

Full list: [solid-primitives GitHub](https://github.com/solidjs-community/solid-primitives)

---

## Routing

### TanStack Router for Solid

```bash
npm uninstall react-router-dom
npm install @tanstack/solid-router
```

### Basic Setup

```tsx
// ❌ React Router
import { BrowserRouter, Routes, Route, Link, useParams } from "react-router-dom";

<BrowserRouter>
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/users/:id" element={<User />} />
  </Routes>
</BrowserRouter>

// ✅ TanStack Solid Router

// routes.ts - Define routes
import { createRouter, createRoute, createRootRoute } from "@tanstack/solid-router";

const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Home,
});

const usersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/users",
  component: UsersLayout,
});

const userRoute = createRoute({
  getParentRoute: () => usersRoute,
  path: "$id", // TanStack uses $ for params
  component: User,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  usersRoute.addChildren([userRoute]),
]);

export const router = createRouter({ routeTree });

// Declare module for type safety
declare module "@tanstack/solid-router" {
  interface Register {
    router: typeof router;
  }
}
```

### Root Layout

```tsx
// RootLayout.tsx
import { Outlet } from "@tanstack/solid-router";

function RootLayout() {
  return (
    <div class="app">
      <Nav />
      <main>
        <Outlet /> {/* Child routes render here */}
      </main>
    </div>
  );
}
```

### App Entry

```tsx
// App.tsx
import { RouterProvider } from "@tanstack/solid-router";
import { router } from "./routes";

function App() {
  return <RouterProvider router={router} />;
}
```

### Links

```tsx
// ❌ React Router
<Link to="/users/123">User</Link>
<Link to={{ pathname: "/users", search: "?sort=name" }}>Users</Link>

// ✅ TanStack Router
import { Link } from "@tanstack/solid-router";

<Link to="/users/$id" params={{ id: "123" }}>User</Link>
<Link to="/users" search={{ sort: "name" }}>Users</Link>

// With active styles
<Link
  to="/about"
  activeProps={{ class: "active" }}
  inactiveProps={{ class: "inactive" }}
>
  About
</Link>
```

### Route Parameters

```tsx
// ❌ React Router
import { useParams } from "react-router-dom";
const { id } = useParams();

// ✅ TanStack Router - Fully typed!
import { createRoute } from "@tanstack/solid-router";

const userRoute = createRoute({
  getParentRoute: () => usersRoute,
  path: "$id",
  component: User,
});

function User() {
  const params = userRoute.useParams();
  // params.id is typed as string
  return <div>User ID: {params().id}</div>;
}
```

### Search Parameters (Query Strings)

```tsx
// ❌ React Router
import { useSearchParams } from "react-router-dom";
const [searchParams, setSearchParams] = useSearchParams();

// ✅ TanStack Router - Type-safe search params
import { createRoute } from "@tanstack/solid-router";
import { z } from "zod";

const usersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/users",
  validateSearch: z.object({
    sort: z.enum(["name", "date"]).optional(),
    page: z.number().optional().default(1),
  }),
  component: Users,
});

function Users() {
  const search = usersRoute.useSearch();
  // search().sort and search().page are fully typed!
  
  const navigate = useNavigate();
  
  const updateSort = (sort: "name" | "date") => {
    navigate({ search: { ...search(), sort } });
  };
  
  return (
    <div>
      <span>Sort: {search().sort}</span>
      <span>Page: {search().page}</span>
    </div>
  );
}
```

### Data Loading

```tsx
// ❌ React Router loader
export async function loader({ params }) {
  return fetchUser(params.id);
}

// ✅ TanStack Router - Built-in loader with type safety
const userRoute = createRoute({
  getParentRoute: () => usersRoute,
  path: "$id",
  loader: async ({ params }) => {
    // params.id is typed
    return fetchUser(params.id);
  },
  component: User,
});

function User() {
  const data = userRoute.useLoaderData();
  // data() is typed based on loader return type
  
  return (
    <Show when={data()} keyed>
      {(user) => <UserProfile user={user} />}
    </Show>
  );
}
```

### Pending UI / Loading States

```tsx
const userRoute = createRoute({
  getParentRoute: () => usersRoute,
  path: "$id",
  loader: async ({ params }) => fetchUser(params.id),
  pendingComponent: () => <Spinner />,
  errorComponent: ({ error }) => <ErrorDisplay error={error} />,
  component: User,
});
```

### Navigation

```tsx
// ❌ React Router
import { useNavigate } from "react-router-dom";
const navigate = useNavigate();
navigate("/users");
navigate(-1);

// ✅ TanStack Router
import { useNavigate } from "@tanstack/solid-router";

const navigate = useNavigate();

// Navigate to path
navigate({ to: "/users" });

// With params
navigate({ to: "/users/$id", params: { id: "123" } });

// With search params
navigate({ to: "/users", search: { sort: "name" } });

// Go back
navigate({ to: "..", from: userRoute.id });

// Or use router history
import { router } from "./routes";
router.history.back();
```

### Protected Routes

```tsx
const protectedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "protected",
  beforeLoad: async ({ context }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({ to: "/login" });
    }
  },
});

// Or redirect from component
import { Navigate } from "@tanstack/solid-router";

function ProtectedPage() {
  const auth = useAuth();
  
  return (
    <Show when={auth.isAuthenticated} fallback={<Navigate to="/login" />}>
      <Dashboard />
    </Show>
  );
}
```

### Route Context

```tsx
// Provide context at router level
const router = createRouter({
  routeTree,
  context: {
    auth: undefined!, // Will be provided in RouterProvider
  },
});

// In App
function App() {
  const auth = useAuth();
  return <RouterProvider router={router} context={{ auth }} />;
}

// Access in routes
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  beforeLoad: ({ context }) => {
    // context.auth is available and typed
    if (!context.auth.user) {
      throw redirect({ to: "/login" });
    }
  },
  component: Dashboard,
});
```

### File-Based Routing (Optional)

TanStack Router supports file-based routing with the Vite plugin:

```bash
npm install @tanstack/router-vite-plugin
```

```ts
// vite.config.ts
import { TanStackRouterVite } from "@tanstack/router-vite-plugin";

export default defineConfig({
  plugins: [
    solidPlugin(),
    TanStackRouterVite(),
  ],
});
```

```
src/
  routes/
    __root.tsx      → Root layout
    index.tsx       → /
    about.tsx       → /about
    users/
      index.tsx     → /users
      $id.tsx       → /users/:id
```

---

## Common Pitfalls

### ❌ Destructuring Props

```tsx
// ❌ WRONG - Breaks reactivity
const MyComponent = ({ count, name }) => {
  return <div>{count} - {name}</div>;
};

// ✅ CORRECT
const MyComponent = (props) => {
  return <div>{props.count} - {props.name}</div>;
};

// ✅ If you MUST destructure, use splitProps
const MyComponent = (props) => {
  const [local, others] = splitProps(props, ["count", "name"]);
  // local.count and local.name are still reactive
};
```

### ❌ Accessing Signals Without Calling

```tsx
// ❌ WRONG - Passing signal reference, not value
const [count, setCount] = createSignal(0);
console.log(count);        // Logs function, not value
<span>{count}</span>       // Shows [Function]

// ✅ CORRECT
console.log(count());      // Logs value
<span>{count()}</span>     // Shows value
```

### ❌ Early Signal Access

```tsx
// ❌ WRONG - Reads once at component creation
const MyComponent = (props) => {
  const value = props.count; // Fixed value!
  return <div>{value}</div>;
};

// ✅ CORRECT - Keeps reactivity
const MyComponent = (props) => {
  return <div>{props.count}</div>;
};

// ✅ Or use a memo if you need to derive
const MyComponent = (props) => {
  const doubled = createMemo(() => props.count * 2);
  return <div>{doubled()}</div>;
};
```

### ❌ Async in createEffect

```tsx
// ❌ WRONG - async breaks tracking
createEffect(async () => {
  const data = await fetchData(id()); // id() tracked
  setResult(data); // But this might have issues
});

// ✅ CORRECT - Use createResource for async
const [data] = createResource(id, fetchData);

// Or if you must use effect
createEffect(() => {
  const currentId = id(); // Track synchronously
  fetchData(currentId).then(setResult);
});
```

### ❌ Expecting Re-renders

```tsx
// ❌ WRONG - This log only runs ONCE
const Counter = () => {
  const [count, setCount] = createSignal(0);
  console.log("Render:", count()); // Only logs once!
  return <button onclick={() => setCount(c => c + 1)}>{count()}</button>;
};

// ✅ If you need to react to changes, use createEffect
const Counter = () => {
  const [count, setCount] = createSignal(0);
  createEffect(() => {
    console.log("Count changed:", count());
  });
  return <button onclick={() => setCount(c => c + 1)}>{count()}</button>;
};
```

---

## Migration Tracking (fp)

This project tracks migration work in `fp` issues (no markdown checklists). Use `fp issue list` for status and `fp tree` for hierarchy.

### Phase 1: Setup
- fp issue: **React→SolidJS Migration (Parent)** `FP-lkfqwyna`
- fp issue: **React→SolidJS: Remove tRPC, Prepare...** `FP-yrjjfzqh`

### Phase 2: Global Changes
- fp issue: **React→SolidJS: Props & Component Ty...** `FP-gnjtxcwh`

### Phase 3: Component Migration
- fp issue: **React→SolidJS: React Hooks→SolidJS ...** `FP-otzyijpj`
- fp issue: **React→SolidJS: Zustand→createStore ...** `FP-rizcnwiv`

### Phase 4: JSX Patterns
- fp issue: **React→SolidJS: JSX Control Flow Mig...** `FP-ztebjyqs`

### Phase 5: Libraries
- fp issue: **React→SolidJS: Radix UI→Kobalte Mig...** `FP-xndawbvr`
- fp issue: **React→SolidJS: Framer Motion→Web An...** `FP-jhednkbb`
- fp issue: **React→SolidJS: Third-Party Library ...** `FP-duflwxyl`

### Phase 6: Testing & Cleanup
- fp issue: **React→SolidJS: Testing & Validation** `FP-npkxqmyf`

---

## Quick Reference Card

| React | SolidJS |
|-------|--------|
| `className` | `class` |
| `htmlFor` | `for` |
| `useState` | `createSignal` |
| `useEffect` | `createEffect` |
| `useMemo` | `createMemo` |
| `useCallback` | (not needed) |
| `useRef` | `let ref` |
| `useContext` | `useContext` |
| `{condition && <X />}` | `<Show when={condition()}><X /></Show>` |
| `.map()` | `<For each={items()}>` |
| `<Fragment>` | `<>` |
| `createPortal` | `<Portal>` |
| `React.memo` | (not needed) |
| `forwardRef` | `props.ref` |
| Component re-renders | Component runs once |
| `value` | `value()` (signals are functions) |
| Destructure props | Never destructure props |

---

## Resources

- [SolidJS Documentation](https://docs.solidjs.com)
- [SolidJS Tutorial](https://www.solidjs.com/tutorial)
- [solid-primitives](https://github.com/solidjs-community/solid-primitives)
- [Kobalte Documentation](https://kobalte.dev)
- [TanStack Router Documentation](https://tanstack.com/router)
- [Web Animations API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API)
- [solid-transition-group](https://github.com/solidjs-community/solid-transition-group)
- [SolidJS Discord](https://discord.com/invite/solidjs)
