// SolidJS Entry Point
import { initLoopCatcher } from "./lib/debug-effects";
const isDevelopment = import.meta.env?.MODE !== "production";
const UI_BUILD_MARKER = "2026-02-07-chat-hang-fix-r3";

console.info("[UI BUILD]", UI_BUILD_MARKER);

if (isDevelopment) {
	// Opt-in diagnostics only (avoid noisy loop logs by default).
	try {
		const shouldBootDebug = localStorage.getItem("__DBG_BOOT__") === "1";
		if (shouldBootDebug) {
			initLoopCatcher();
		} else {
			localStorage.removeItem("__DBG_ENABLED__");
			localStorage.removeItem("__DBG_TRACE__");
		}
	} catch {
		// ignore
	}
}

import { render } from "solid-js/web";
import { App } from "./App";
// CSS is loaded via <link> in index.html (built separately by Tailwind CLI)
import { preloadDiffHighlighter } from "./lib/themes/diff-view-highlighter";
// Preload shiki highlighter for diff view (prevents delay when opening diff sidebar)
preloadDiffHighlighter();
// Disable legacy devtools hooks (React/Solid) that can inject element pickers.
try {
	const hookKeys = [
		"__REACT_DEVTOOLS_GLOBAL_HOOK__",
		"__SOLID_DEVTOOLS_GLOBAL_HOOK__",
		"__SOLID_DEVTOOLS__",
		"__REACT_SCAN__",
	];
	for (const key of hookKeys) {
		if (key in window) {
			try {
				// Best-effort removal if already injected.
				// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
				delete (window as any)[key];
			} catch {
				// ignore
			}
		}
		try {
			Object.defineProperty(window, key, {
				value: undefined,
				writable: false,
				configurable: false,
			});
		} catch {
			// ignore
		}
	}
} catch {
	// ignore
}
// Remove any legacy React Scan artifacts from older builds.
try {
	const reactScanScript = document.getElementById("react-scan-script");
	if (reactScanScript) reactScanScript.remove();
	document.querySelectorAll("[data-react-scan]").forEach((el) => el.remove());
	localStorage.removeItem("react-scan-enabled");
} catch {
	// Best-effort cleanup; ignore errors.
}
// Suppress ResizeObserver loop error - this is a non-fatal browser warning
// that can occur when layout changes trigger observation callbacks
// Common with virtualization libraries and diff viewers
const resizeObserverErr = /ResizeObserver loop/;
// Handle both error event and unhandledrejection
window.addEventListener("error", (e) => {
	if (e.message && resizeObserverErr.test(e.message)) {
		e.stopImmediatePropagation();
		e.preventDefault();
		return false;
	}
});
window.addEventListener("unhandledrejection", (e) => {
	const reason = e.reason as unknown;
	if (reason instanceof RangeError && /Maximum call stack size exceeded/.test(reason.message)) {
		console.error("[App] Unhandled rejection (stack overflow):", reason);
		if (reason.stack) {
			console.error("[App] Stack trace:", reason.stack);
		}
		e.preventDefault();
		return false;
	}
});
// Also override window.onerror for broader coverage
const originalOnError = window.onerror;
window.onerror = (message, source, lineno, colno, error) => {
	if (typeof message === "string" && resizeObserverErr.test(message)) {
		return true;
	}
	if (originalOnError) {
		return originalOnError(message, source, lineno, colno, error);
	}
	return false;
};
const rootElement = document.getElementById("root");
if (rootElement) {
	render(() => <App />, rootElement);
}
