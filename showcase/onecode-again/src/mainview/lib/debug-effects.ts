/**
 * Debug utility to catch infinite loops in SolidJS (WebKit compatible)
 */

// Simple circular buffer that logs to console frequently
const recentCalls: string[] = [];
const recentStacks: (string | undefined)[] = [];
let callCount = 0;
let lastLogTime = 0;
let debugEnabled = false;

function readBooleanFlag(value: unknown): boolean {
  return value === true || value === "true" || value === 1 || value === "1";
}

function isDebugEnabled(): boolean {
  if (debugEnabled) return true;
  if (typeof window === "undefined") return false;
  const w = window as any;
  if (readBooleanFlag(w.__DBG_ENABLED__)) return true;
  try {
    return readBooleanFlag(localStorage.getItem("__DBG_ENABLED__"));
  } catch {
    return false;
  }
}

function shouldTrace(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as any;
  if (readBooleanFlag(w.__DBG_TRACE__)) return true;
  try {
    const flag = localStorage.getItem("__DBG_TRACE__");
    return readBooleanFlag(flag);
  } catch {
    return false;
  }
}

function getStack(location: string): string | undefined {
  const msg = `dbg:${location}`;

  // Prefer V8 stack capture when available (CEF / Chromium).
  // It reliably populates `.stack` and can exclude `dbg()` frames.
  const capture = (Error as any).captureStackTrace as
    | ((targetObject: object, constructorOpt?: Function) => void)
    | undefined;
  if (typeof capture === "function") {
    try {
      const err = new Error(msg);
      capture(err, dbg);
      const stack = (err as { stack?: unknown }).stack;
      if (typeof stack === "string" && stack.trim()) {
        return stack.split("\n").slice(0, 12).join("\n");
      }
    } catch {
      // Fall back to throw/catch below.
    }
  }

  // WebKit can return `undefined` for `new Error().stack` until the error is thrown.
  // Throw/catch keeps this usable across engines.
  try {
    throw new Error(msg);
  } catch (e) {
    const stack = (e as { stack?: unknown } | undefined)?.stack;
    if (typeof stack !== "string") return undefined;
    return stack
      .split("\n")
      // drop the error line + dbg() frame
      .slice(2, 12)
      .join("\n");
  }
}

export function dbg(location: string) {
  // Do not activate tracing/logging unless debug mode is explicitly enabled.
  // This prevents stale __DBG_TRACE__ flags from slowing down normal UI usage.
  if (!isDebugEnabled()) return;

  callCount++;
  recentCalls.push(location);
  if (recentCalls.length > 50) recentCalls.shift();

  if (shouldTrace()) {
    recentStacks.push(getStack(location));
  } else {
    recentStacks.push(undefined);
  }
  if (recentStacks.length > 50) recentStacks.shift();

  // Log every 100 calls or every 100ms
  const now = Date.now();
  if (callCount % 100 === 0 || now - lastLogTime > 100) {
    lastLogTime = now;
    console.log(
      `[DBG] ${callCount} calls. Recent:`,
      recentCalls.slice(-5).join(" → "),
      shouldTrace() ? "(trace:on)" : ""
    );
  }

  // Detect rapid fire (more than 200 calls means likely loop)
  if (callCount > 200) {
    console.error("🔴 LOOP! Recent calls:", recentCalls.slice(-20));
    // Count occurrences
    const counts: Record<string, number> = {};
    for (const c of recentCalls) {
      counts[c] = (counts[c] || 0) + 1;
    }
    console.error("Frequencies:", counts);
    if (shouldTrace()) {
      console.error("Recent stacks:");
      for (const s of recentStacks.slice(-20)) {
        if (s) console.error(s);
      }
    } else {
      console.error("Tip: set window.__DBG_TRACE__ = true to capture stacks");
    }
    callCount = 0; // Reset to allow seeing more
  }
}

// Reset every second
setInterval(() => {
  if (callCount > 0 && callCount < 50) {
    // Normal activity, reset
    callCount = 0;
  }
}, 1000);

export function initLoopCatcher() {
  debugEnabled = true;
  console.log("🔧 Debug mode ON. Add dbg(\"name\") calls to track execution.");
  console.log("To capture call stacks: set window.__DBG_TRACE__ = true (or localStorage.__DBG_TRACE__ = '1')");

  // Catch errors
  window.addEventListener('error', (e) => {
    console.error("🔴 ERROR:", e.message);
    if ((e as ErrorEvent).error?.stack) {
      console.error((e as ErrorEvent).error.stack);
    }
    console.error("Recent calls:", recentCalls);
    if (shouldTrace()) {
      console.error("Recent stacks:", recentStacks);
    }
  });

  window.addEventListener("unhandledrejection", (e) => {
    console.error("🔴 UNHANDLED REJECTION:", e.reason);
    if (e.reason && typeof e.reason === "object" && "stack" in e.reason) {
      console.error((e.reason as { stack?: unknown }).stack);
    }
    console.error("Recent calls:", recentCalls);
    if (shouldTrace()) {
      console.error("Recent stacks:", recentStacks);
    }
  });
}

// Expose globally
if (typeof window !== 'undefined') {
  (window as any).dbg = dbg;
  (window as any).__recentCalls = recentCalls;
  (window as any).__recentStacks = recentStacks;
}
