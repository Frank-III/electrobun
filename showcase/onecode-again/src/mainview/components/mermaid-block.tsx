import { createSignal, createEffect, onCleanup, Show } from "solid-js";
import { useTheme } from "../lib/hooks/use-theme";
import { Copy, Check, Download, AlertTriangle, RotateCcw, Maximize2, X, ZoomIn, ZoomOut, RotateCcw as ResetZoom } from "lucide-solid";
import { cn } from "../lib/utils";
import { Dialog, DialogContent, DialogPortal, DialogTitle } from "./ui/dialog";
import { Dialog as DialogPrimitive } from "@kobalte/core/dialog";
// Lazy load mermaid to avoid bundle size impact (~500KB)
let mermaidPromise: Promise<typeof import("mermaid")> | null = null;
const getMermaid = () => {
	if (!mermaidPromise) {
		mermaidPromise = import("mermaid");
	}
	return mermaidPromise;
};
// Clean up mermaid error SVGs that get added to the DOM
const cleanupMermaidErrors = () => {
	// Mermaid adds error SVGs with id starting with 'd' or 'mermaid-' to the body
	const errorSvgs = document.querySelectorAll("svg[id^=\"mermaid-\"]");
	errorSvgs.forEach((svg) => {
		// Only remove if it's directly in body (error artifacts)
		if (svg.parentElement === document.body) {
			svg.remove();
		}
	});
	// Also clean up any container divs mermaid creates
	const containers = document.querySelectorAll("div[id^=\"dmermaid-\"], div[id^=\"d\"]");
	containers.forEach((div) => {
		if (div.parentElement === document.body && div.querySelector("svg")) {
			div.remove();
		}
	});
};
interface MermaidBlockProps {
	code: string;
	size?: "sm" | "md" | "lg";
	isStreaming?: boolean;
}
type RenderState = {
	status: "idle";
} | {
	status: "loading";
} | {
	status: "success";
	svg: string;
} | {
	status: "error";
	message: string;
} | {
	status: "parsing";
};
// Mermaid theme configuration based on app theme
const getMermaidConfig = (isDark: boolean): Record<string, unknown> => ({
	startOnLoad: false,
	theme: isDark ? "dark" : "default",
	themeVariables: isDark ? {
		primaryColor: "#3b82f6",
		primaryTextColor: "#f4f4f5",
		primaryBorderColor: "#52525b",
		lineColor: "#71717a",
		secondaryColor: "#27272a",
		tertiaryColor: "#18181b",
		background: "#18181b",
		mainBkg: "#27272a",
		nodeBorder: "#52525b",
		clusterBkg: "#27272a",
		defaultLinkColor: "#71717a",
		titleColor: "#f4f4f5",
		edgeLabelBackground: "#27272a",
		actorTextColor: "#f4f4f5",
		actorBorder: "#52525b",
		actorBkg: "#27272a",
		signalColor: "#f4f4f5",
		signalTextColor: "#18181b",
		labelBoxBkgColor: "#27272a",
		labelBoxBorderColor: "#52525b",
		labelTextColor: "#f4f4f5",
		loopTextColor: "#f4f4f5",
		noteBorderColor: "#52525b",
		noteBkgColor: "#27272a",
		noteTextColor: "#f4f4f5",
		sectionBkgColor: "#27272a",
		altSectionBkgColor: "#18181b",
		sectionBkgColor2: "#27272a",
		taskBorderColor: "#52525b",
		taskBkgColor: "#3b82f6",
		taskTextColor: "#f4f4f5",
		taskTextLightColor: "#f4f4f5",
		taskTextOutsideColor: "#f4f4f5",
		activeTaskBorderColor: "#3b82f6",
		gridColor: "#52525b",
		doneTaskBkgColor: "#27272a",
		doneTaskBorderColor: "#52525b",
		critBkgColor: "#dc2626",
		critBorderColor: "#ef4444",
		todayLineColor: "#3b82f6",
		sequenceNumberColor: "#f4f4f5",
		classText: "#f4f4f5",
		labelColor: "#f4f4f5",
		attributeBackgroundColorOdd: "#27272a",
		attributeBackgroundColorEven: "#18181b"
	} : {
		primaryColor: "#3b82f6",
		primaryTextColor: "#18181b",
		primaryBorderColor: "#d4d4d8",
		lineColor: "#71717a",
		secondaryColor: "#f4f4f5",
		tertiaryColor: "#fafafa",
		background: "#ffffff",
		mainBkg: "#fafafa",
		nodeBorder: "#d4d4d8",
		clusterBkg: "#f4f4f5",
		defaultLinkColor: "#71717a",
		titleColor: "#18181b",
		edgeLabelBackground: "#fafafa"
	},
	securityLevel: "loose" as const,
	fontFamily: "inherit"
});
const MIN_SCALE = 0.1;
const MAX_SCALE = 8;
const ZOOM_STEP = 0.15;

/** Native zoom/pan wrapper for fullscreen diagram. Solid-friendly, no React deps. */
function DiagramZoomPan(props: { content: string; contentClass: string }) {
	const [scale, setScale] = createSignal(1);
	const [x, setX] = createSignal(0);
	const [y, setY] = createSignal(0);
	const [isPanning, setIsPanning] = createSignal(false);
	const [lastPointer, setLastPointer] = createSignal<{ x: number; y: number } | null>(null);

	const zoomIn = () => setScale((s) => Math.min(MAX_SCALE, s + ZOOM_STEP));
	const zoomOut = () => setScale((s) => Math.max(MIN_SCALE, s - ZOOM_STEP));
	const resetTransform = () => {
		setScale(1);
		setX(0);
		setY(0);
	};

	const onWheel = (e: WheelEvent) => {
		e.preventDefault();
		const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
		setScale((s) => Math.max(MIN_SCALE, Math.min(MAX_SCALE, s + delta)));
	};
	const onPointerDown = (e: PointerEvent) => {
		if (e.button !== 0) return;
		setIsPanning(true);
		setLastPointer({ x: e.clientX, y: e.clientY });
	};
	const onPointerMove = (e: PointerEvent) => {
		if (!isPanning()) return;
		const last = lastPointer();
		if (last) {
			setX((px) => px + e.clientX - last.x);
			setY((py) => py + e.clientY - last.y);
			setLastPointer({ x: e.clientX, y: e.clientY });
		}
	};
	const onPointerUp = () => {
		setIsPanning(false);
		setLastPointer(null);
	};

	createEffect(() => {
		if (!isPanning()) return;
		window.addEventListener("pointermove", onPointerMove);
		window.addEventListener("pointerup", onPointerUp);
		onCleanup(() => {
			window.removeEventListener("pointermove", onPointerMove);
			window.removeEventListener("pointerup", onPointerUp);
		});
	});

	let containerRef: HTMLDivElement | undefined;
	createEffect(() => {
		const el = containerRef;
		if (!el) return;
		el.addEventListener("wheel", onWheel, { passive: false });
		onCleanup(() => el.removeEventListener("wheel", onWheel));
	});

	return (
		<div
			ref={(el) => (containerRef = el)}
			class="w-full h-full overflow-hidden touch-none"
			style={{ cursor: isPanning() ? "grabbing" : "grab" }}
			role="img"
			aria-label="Diagram"
			onPointerDown={onPointerDown}
		>
			<div class="absolute inset-0 flex items-center justify-center">
				<div
					class={cn("mermaid-diagram-fullscreen p-8 [&_svg]:max-w-none [&_svg]:h-auto", props.contentClass)}
					innerHTML={props.content}
					style={{
						transform: `translate(${x()}px, ${y()}px) scale(${scale()})`,
						"transform-origin": "center center"
					}}
				/>
			</div>
			<ZoomControls zoomIn={zoomIn} zoomOut={zoomOut} resetTransform={resetTransform} />
		</div>
	);
}

function ZoomControls(props: { zoomIn: () => void; zoomOut: () => void; resetTransform: () => void }) {
	return (
		<div class="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/50 rounded-full px-4 py-2 z-10 pointer-events-auto">
			<button onClick={() => props.zoomOut()} class="p-1.5 rounded-full hover:bg-white/10 transition-colors text-white" type="button" aria-label="Zoom out (-)">
				<ZoomOut class="size-5" />
			</button>
			<button onClick={() => props.zoomIn()} class="p-1.5 rounded-full hover:bg-white/10 transition-colors text-white" type="button" aria-label="Zoom in (+)">
				<ZoomIn class="size-5" />
			</button>
			<div class="w-px h-5 bg-white/20 mx-1" />
			<button onClick={() => props.resetTransform()} class="p-1.5 rounded-full hover:bg-white/10 transition-colors text-white" type="button" aria-label="Reset zoom (0)">
				<ResetZoom class="size-5" />
			</button>
		</div>
	);
}
// Debounce delay before attempting to render
const RENDER_DEBOUNCE_MS = 600;
// Global cache for rendered mermaid diagrams to persist across remounts
const mermaidCache = new Map<string, string>();
// Track which mermaid blocks have finished streaming (by first N chars of code as ID)
const finishedStreamingBlocks = new Set<string>();
// Streaming placeholder - simple static text, no spinner
function StreamingPlaceholder() {
	return <div class="relative mt-2 mb-4 rounded-[10px] bg-muted/50 overflow-hidden">
      <div class="p-4 min-h-[60px] flex items-center justify-center">
        <span class="text-muted-foreground text-sm">Creating diagram...</span>
      </div>
    </div>;
}
// Main mermaid block - handles actual rendering when not streaming
function MermaidBlockInner(props: { code: string }) {
	const { resolvedTheme } = useTheme();
	const isDark = resolvedTheme() === "dark";
	// Check cache on initial render
	const cacheKey = `${props.code}-${isDark ? "dark" : "light"}`;
	const cachedSvg = mermaidCache.get(cacheKey);
	const initialState: RenderState = cachedSvg ? { status: "success", svg: cachedSvg } : { status: "idle" };
	const [renderState, setRenderState] = createSignal<RenderState>(initialState);
	const [copied, setCopied] = createSignal(false);
	const [isFullscreen, setIsFullscreen] = createSignal(false);
	const [renderIdRef, setRenderIdRef] = createSignal(0);
	const [debounceTimeoutRef, setDebounceTimeoutRef] = createSignal<NodeJS.Timeout | null>(null);
	// Track the last successfully rendered code to avoid re-rendering same content
	const [lastRenderedCodeRef, setLastRenderedCodeRef] = createSignal<string>("");
	const [lastRenderedThemeRef, setLastRenderedThemeRef] = createSignal<boolean | null>(null);
	const doRender = async () => {
		// Increment render ID to handle race conditions
		const currentRenderId = renderIdRef() + 1;
		setRenderIdRef(currentRenderId);
		setRenderState({ status: "loading" });
		try {
			const mermaidModule = await getMermaid();
			const mermaid = mermaidModule.default;
			// Check if this render is still current
			if (currentRenderId !== renderIdRef()) return;
			// Initialize/reinitialize mermaid with current theme
			mermaid.initialize(getMermaidConfig(isDark));
			// Generate unique ID for this render
			const id = `mermaid-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
			const { svg } = await mermaid.render(id, props.code);
			// Check again if this render is still current
			if (currentRenderId !== renderIdRef()) return;
			// Cache the result for future remounts
			const cacheKey = `${props.code}-${isDark ? "dark" : "light"}`;
			mermaidCache.set(cacheKey, svg);
			setRenderState({
				status: "success",
				svg
			});
			setLastRenderedCodeRef(props.code);
			setLastRenderedThemeRef(isDark);
			// Clean up any error artifacts mermaid left in DOM
			cleanupMermaidErrors();
		} catch (error) {
			if (currentRenderId !== renderIdRef()) return;
			const message = error instanceof Error ? error.message : "Failed to render diagram";
			// Clean up error SVGs that mermaid adds to DOM
			cleanupMermaidErrors();
			// Check if this is a parse/syntax error (incomplete diagram)
			const isParseError = message.toLowerCase().includes("parse error") || message.toLowerCase().includes("syntax error") || message.toLowerCase().includes("expecting") || message.toLowerCase().includes("unexpected") || message.toLowerCase().includes("no diagram type detected") || message.toLowerCase().includes("lexical error");
			if (isParseError && !lastRenderedCodeRef()) {
				// Show "Creating diagram..." only if we haven't successfully rendered before
				setRenderState({ status: "parsing" });
			} else {
				setRenderState({
					status: "error",
					message
				});
			}
		}
	};
	const renderDiagram = () => {
		// Skip if code is too short
		if (props.code.trim().length < 10) {
			setRenderState({ status: "idle" });
			return;
		}
		// Check for obviously incomplete syntax
		const hasUnclosedBrackets = (str: string) => {
			const opens = (str.match(/\[/g) || []).length;
			const closes = (str.match(/\]/g) || []).length;
			return opens > closes;
		};
		const hasUnclosedBraces = (str: string) => {
			const opens = (str.match(/\{/g) || []).length;
			const closes = (str.match(/\}/g) || []).length;
			return opens > closes;
		};
		const hasUnclosedParens = (str: string) => {
			const opens = (str.match(/\(/g) || []).length;
			const closes = (str.match(/\)/g) || []).length;
			return opens > closes;
		};
		const hasUnclosedQuotes = (str: string) => {
			const quotes = (str.match(/"/g) || []).length;
			return quotes % 2 !== 0;
		};
		const looksIncomplete = hasUnclosedBrackets(props.code) || hasUnclosedBraces(props.code) || hasUnclosedParens(props.code) || hasUnclosedQuotes(props.code);
		if (looksIncomplete) {
			setRenderState({ status: "parsing" });
			return;
		}
		// Debounce: wait for code to stabilize before rendering
		// This prevents rapid-fire render attempts during streaming
		const currentTimeout = debounceTimeoutRef();
		if (currentTimeout) {
			clearTimeout(currentTimeout);
		}
		// Show loading state while waiting
		setRenderState({ status: "parsing" });
		setDebounceTimeoutRef(setTimeout(() => {
			doRender();
		}, RENDER_DEBOUNCE_MS));
	};
	// Render on mount and when code/theme changes
	createEffect(() => {
		// Check if we have a cached result
		const cacheKey = `${props.code}-${isDark ? "dark" : "light"}`;
		const cached = mermaidCache.get(cacheKey);
		if (cached) {
			setRenderState({
				status: "success",
				svg: cached
			});
			setLastRenderedCodeRef(props.code);
			setLastRenderedThemeRef(isDark);
			return;
		}
		// Only re-render if code or theme actually changed
		if (props.code === lastRenderedCodeRef() && isDark === lastRenderedThemeRef()) {
			return;
		}
		renderDiagram();
	});
	// Cleanup mermaid artifacts and debounce timeout on unmount
	onCleanup(() => {
		const currentTimeout = debounceTimeoutRef();
		if (currentTimeout) {
			clearTimeout(currentTimeout);
		}
		cleanupMermaidErrors();
	});
	const handleCopy = async () => {
		await navigator.clipboard.writeText(props.code);
		setCopied(true);
		setTimeout(() => setCopied(false), 2e3);
	};
	const handleDownload = async () => {
		const state = renderState();
		if (state.status !== "success") return;
		const blob = new Blob([state.svg], { type: "image/svg+xml" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "diagram.svg";
		a.click();
		URL.revokeObjectURL(url);
	};
	const openFullscreen = () => {
		setIsFullscreen(true);
	};
	const closeFullscreen = () => {
		setIsFullscreen(false);
	};
	return <>
      <div class="relative mt-2 mb-4 rounded-[10px] bg-muted/50 overflow-hidden">
        {	/* Toolbar */}
        <div class="absolute top-[6px] right-[6px] flex gap-1 z-[2]">
          <button onClick={handleCopy} tabIndex={-1} class="p-1" title={copied() ? "Copied!" : "Copy code"}>
            <div class="relative w-3.5 h-3.5">
              <Copy class={cn("absolute inset-0 w-3 h-3 text-muted-foreground transition-[opacity,transform] duration-200 ease-out hover:text-foreground", copied() ? "opacity-0 scale-50" : "opacity-100 scale-100")} />
              <Check class={cn("absolute inset-0 w-3 h-3 text-muted-foreground transition-[opacity,transform] duration-200 ease-out", copied() ? "opacity-100 scale-100" : "opacity-0 scale-50")} />
            </div>
          </button>
          <Show when={renderState().status === "success"}>
              <button onClick={handleDownload} tabIndex={-1} class="p-1" title="Download SVG">
                <Download class="w-3 h-3 text-muted-foreground hover:text-foreground transition-colors" />
              </button>
              <button onClick={openFullscreen} tabIndex={-1} class="p-1" title="View fullscreen">
                <Maximize2 class="w-3 h-3 text-muted-foreground hover:text-foreground transition-colors" />
              </button>
          </Show>
        </div>

        { /* Content */}
        <div class="p-4 min-h-[60px] flex items-center justify-center">
          <Show when={renderState().status === "idle"}>
            <div class="text-muted-foreground text-sm">
              Waiting for diagram...
            </div>
          </Show>

          <Show when={renderState().status === "loading" || renderState().status === "parsing"}>
            <div class="flex items-center gap-2 text-muted-foreground text-sm">
              <div class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              <span>Creating diagram...</span>
            </div>
          </Show>

          <Show when={renderState().status === "success" ? renderState() as RenderState & { status: "success" } : undefined}>
            {(state) => <div class={cn("mermaid-diagram w-full overflow-x-auto cursor-pointer", "[&_svg]:max-w-full [&_svg]:h-auto [&_svg]:mx-auto")} onClick={openFullscreen} innerHTML={state().svg} />}
          </Show>

          <Show when={renderState().status === "error" ? renderState() as RenderState & { status: "error" } : undefined}>
            {(state) => <div class="w-full">
              <div class="flex items-start gap-2 text-destructive text-sm mb-3">
                <AlertTriangle class="h-4 w-4 shrink-0 mt-0.5" />
                <span class="break-words">{state().message}</span>
              </div>
              <div class="flex gap-2">
                <button onClick={renderDiagram} class="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md bg-muted hover:bg-accent transition-colors">
                  <RotateCcw class="h-3 w-3" />
                  Retry
                </button>
              </div>
              <details class="mt-3">
                <summary class="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                  Show diagram code
                </summary>
                <pre class="mt-2 p-2 rounded bg-muted text-xs overflow-x-auto whitespace-pre-wrap break-words font-mono">
                  {props.code}
                </pre>
              </details>
            </div>}
          </Show>
        </div>
      </div>

      { /* Fullscreen dialog with native zoom/pan (Solid-friendly) */}
      <Dialog open={isFullscreen()} onOpenChange={setIsFullscreen}>
        <DialogPortal>
          <DialogPrimitive.Overlay class="fixed inset-0 z-50 bg-black/90 data-[expanded]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[expanded]:fade-in-0" />
          <DialogPrimitive.Content class="fixed inset-0 z-50 flex items-center justify-center outline-none overflow-hidden" onPointerDownOutside={(e) => e.preventDefault()}>
            <span class="sr-only">
              <DialogTitle>Mermaid Diagram Viewer</DialogTitle>
            </span>

            { /* Close button */}
            <button onClick={closeFullscreen} class="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors text-white z-20" type="button" aria-label="Close fullscreen (Esc)">
              <X class="size-6" />
            </button>

            { /* Diagram viewer with native zoom/pan */}
            <Show when={renderState().status === "success" ? renderState() as RenderState & { status: "success" } : undefined}>
              {(state) => (
                <DiagramZoomPan
                  content={state().svg}
                  contentClass={cn("[&_svg]:max-w-none [&_svg]:h-auto", isDark ? "" : "[&_svg]:filter [&_svg]:drop-shadow-lg")}
                />
              )}
            </Show>

            { /* Keyboard hints */}
            <div class="absolute bottom-6 right-4 text-white/50 text-xs z-10">
              Scroll to zoom | Drag to pan | Esc to close
            </div>
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>
    </>;
}
// Check if mermaid code looks complete (basic heuristics)
function looksComplete(code: string): boolean {
	if (code.trim().length < 20) return false;
	// Check for balanced brackets/braces/parens
	const opens = {
		"[": (code.match(/\[/g) || []).length,
		"{": (code.match(/\{/g) || []).length,
		"(": (code.match(/\(/g) || []).length
	};
	const closes = {
		"]": (code.match(/\]/g) || []).length,
		"}": (code.match(/\}/g) || []).length,
		")": (code.match(/\)/g) || []).length
	};
	if (opens["["] > closes["]"]) return false;
	if (opens["{"] > closes["}"]) return false;
	if (opens["("] > closes[")"]) return false;
	// Check for incomplete statements at end
	const trimmed = code.trim();
	if (trimmed.endsWith("--") || trimmed.endsWith("->") || trimmed.endsWith("->>")) return false;
	if (trimmed.endsWith(":")) return false;
	// Looks complete enough to try rendering
	return true;
}
// Generate a stable ID for a mermaid block based on its content
function getBlockId(code: string): string {
	// Use first line (diagram type declaration) as stable ID
	const firstLine = code.split("\n")[0] || "";
	return firstLine.slice(0, 50);
}
// Exported component that handles streaming state
// When streaming, shows placeholder. When done, renders the diagram.
export function MermaidBlock(props: MermaidBlockProps) {
	const isStreaming = props.isStreaming ?? false;
	const blockId = getBlockId(props.code);
	const codeComplete = looksComplete(props.code);
	// Once streaming ends for this block, mark it as finished globally
	createEffect(() => {
		if (!(props.isStreaming ?? false) && looksComplete(props.code)) {
			finishedStreamingBlocks.add(getBlockId(props.code));
		}
	});
	// Check if this block has finished streaming before (survives remounts)
	const hasFinishedBefore = finishedStreamingBlocks.has(blockId);
	// Show placeholder if:
	// 1. We're streaming AND
	// 2. Block hasn't finished before AND
	// 3. Code doesn't look complete yet
	if (isStreaming && !hasFinishedBefore && !codeComplete) {
		return <StreamingPlaceholder />;
	}
	// Otherwise try to render the diagram
	return <MermaidBlockInner code={props.code} />;
}
MermaidBlock.displayName = "MermaidBlock";
