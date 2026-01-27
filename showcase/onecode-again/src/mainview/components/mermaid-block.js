"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MermaidBlock = MermaidBlock;
var solid_js_1 = require("solid-js");
var use_theme_1 = require("../lib/hooks/use-theme");
var lucide_solid_1 = require("lucide-solid");
var react_zoom_pan_pinch_1 = require("react-zoom-pan-pinch");
var utils_1 = require("../lib/utils");
var dialog_1 = require("./ui/dialog");
var dialog_2 = require("@kobalte/core/dialog");
// Lazy load mermaid to avoid bundle size impact (~500KB)
var mermaidPromise = null;
var getMermaid = function () {
    if (!mermaidPromise) {
        mermaidPromise = Promise.resolve().then(function () { return require("mermaid"); });
    }
    return mermaidPromise;
};
// Clean up mermaid error SVGs that get added to the DOM
var cleanupMermaidErrors = function () {
    // Mermaid adds error SVGs with id starting with 'd' or 'mermaid-' to the body
    var errorSvgs = document.querySelectorAll("svg[id^=\"mermaid-\"]");
    errorSvgs.forEach(function (svg) {
        // Only remove if it's directly in body (error artifacts)
        if (svg.parentElement === document.body) {
            svg.remove();
        }
    });
    // Also clean up any container divs mermaid creates
    var containers = document.querySelectorAll("div[id^=\"dmermaid-\"], div[id^=\"d\"]");
    containers.forEach(function (div) {
        if (div.parentElement === document.body && div.querySelector("svg")) {
            div.remove();
        }
    });
};
// Mermaid theme configuration based on app theme
var getMermaidConfig = function (isDark) { return ({
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
    securityLevel: "loose",
    fontFamily: "inherit"
}); };
// Zoom controls component for the fullscreen viewer
function ZoomControls() {
    var _a = (0, react_zoom_pan_pinch_1.useControls)(), zoomIn = _a.zoomIn, zoomOut = _a.zoomOut, resetTransform = _a.resetTransform;
    return <div class="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/50 rounded-full px-4 py-2 z-10">
      <button onClick={function () { return zoomOut(); }} class="p-1.5 rounded-full hover:bg-white/10 transition-colors text-white" type="button" aria-label="Zoom out (-)">
        <lucide_solid_1.ZoomOut class="size-5"/>
      </button>
      <button onClick={function () { return zoomIn(); }} class="p-1.5 rounded-full hover:bg-white/10 transition-colors text-white" type="button" aria-label="Zoom in (+)">
        <lucide_solid_1.ZoomIn class="size-5"/>
      </button>
      <div class="w-px h-5 bg-white/20 mx-1"/>
      <button onClick={function () { return resetTransform(); }} class="p-1.5 rounded-full hover:bg-white/10 transition-colors text-white" type="button" aria-label="Reset zoom (0)">
        <lucide_solid_1.RotateCcw class="size-5"/>
      </button>
    </div>;
}
// Debounce delay before attempting to render
var RENDER_DEBOUNCE_MS = 600;
// Global cache for rendered mermaid diagrams to persist across remounts
var mermaidCache = new Map();
// Track which mermaid blocks have finished streaming (by first N chars of code as ID)
var finishedStreamingBlocks = new Set();
// Streaming placeholder - simple static text, no spinner
var StreamingPlaceholder = memo(function StreamingPlaceholder() {
    return <div class="relative mt-2 mb-4 rounded-[10px] bg-muted/50 overflow-hidden">
      <div class="p-4 min-h-[60px] flex items-center justify-center">
        <span class="text-muted-foreground text-sm">Creating diagram...</span>
      </div>
    </div>;
});
// Main mermaid block - handles actual rendering when not streaming
var MermaidBlockInner = memo(function MermaidBlockInner(_a) {
    var _this = this;
    var code = _a.code;
    var resolvedTheme = (0, use_theme_1.useTheme)().resolvedTheme;
    var isDark = resolvedTheme() === "dark";
    var _b = (0, solid_js_1.createSignal)(function () {
        // Check cache on initial render
        var cacheKey = "".concat(code, "-").concat(isDark ? "dark" : "light");
        var cached = mermaidCache.get(cacheKey);
        if (cached) {
            return {
                status: "success",
                svg: cached
            };
        }
        return { status: "idle" };
    }), renderState = _b[0], setRenderState = _b[1];
    var _c = (0, solid_js_1.createSignal)(false), copied = _c[0], setCopied = _c[1];
    var _d = (0, solid_js_1.createSignal)(false), isFullscreen = _d[0], setIsFullscreen = _d[1];
    var _e = (0, solid_js_1.createSignal)(0), renderIdRef = _e[0], setRenderIdRef = _e[1];
    var _f = (0, solid_js_1.createSignal)(null), debounceTimeoutRef = _f[0], setDebounceTimeoutRef = _f[1];
    // Track the last successfully rendered code to avoid re-rendering same content
    var _g = (0, solid_js_1.createSignal)(""), lastRenderedCodeRef = _g[0], setLastRenderedCodeRef = _g[1];
    var _h = (0, solid_js_1.createSignal)(null), lastRenderedThemeRef = _h[0], setLastRenderedThemeRef = _h[1];
    var doRender = function () { return __awaiter(_this, void 0, void 0, function () {
        var currentRenderId, mermaidModule, mermaid, id, svg, cacheKey, error_1, message, isParseError;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Increment render ID to handle race conditions
                    renderIdRef.current += 1;
                    currentRenderId = renderIdRef.current;
                    setRenderState({ status: "loading" });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, getMermaid()];
                case 2:
                    mermaidModule = _a.sent();
                    mermaid = mermaidModule.default;
                    // Check if this render is still current
                    if (currentRenderId !== renderIdRef.current)
                        return [2 /*return*/];
                    // Initialize/reinitialize mermaid with current theme
                    mermaid.initialize(getMermaidConfig(isDark));
                    id = "mermaid-".concat(Date.now(), "-").concat(Math.random().toString(36).slice(2, 9));
                    return [4 /*yield*/, mermaid.render(id, code)];
                case 3:
                    svg = (_a.sent()).svg;
                    // Check again if this render is still current
                    if (currentRenderId !== renderIdRef.current)
                        return [2 /*return*/];
                    cacheKey = "".concat(code, "-").concat(isDark ? "dark" : "light");
                    mermaidCache.set(cacheKey, svg);
                    setRenderState({
                        status: "success",
                        svg: svg
                    });
                    lastRenderedCodeRef.current = code;
                    lastRenderedThemeRef.current = isDark;
                    // Clean up any error artifacts mermaid left in DOM
                    cleanupMermaidErrors();
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    if (currentRenderId !== renderIdRef.current)
                        return [2 /*return*/];
                    message = error_1 instanceof Error ? error_1.message : "Failed to render diagram";
                    // Clean up error SVGs that mermaid adds to DOM
                    cleanupMermaidErrors();
                    isParseError = message.toLowerCase().includes("parse error") || message.toLowerCase().includes("syntax error") || message.toLowerCase().includes("expecting") || message.toLowerCase().includes("unexpected") || message.toLowerCase().includes("no diagram type detected") || message.toLowerCase().includes("lexical error");
                    if (isParseError && !lastRenderedCodeRef.current) {
                        // Show "Creating diagram..." only if we haven't successfully rendered before
                        setRenderState({ status: "parsing" });
                    }
                    else {
                        setRenderState({
                            status: "error",
                            message: message
                        });
                    }
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var renderDiagram = function () {
        // Skip if code is too short
        if (code.trim().length < 10) {
            setRenderState({ status: "idle" });
            return;
        }
        // Check for obviously incomplete syntax
        var hasUnclosedBrackets = function (str) {
            var opens = (str.match(/\[/g) || []).length;
            var closes = (str.match(/\]/g) || []).length;
            return opens > closes;
        };
        var hasUnclosedBraces = function (str) {
            var opens = (str.match(/\{/g) || []).length;
            var closes = (str.match(/\}/g) || []).length;
            return opens > closes;
        };
        var hasUnclosedParens = function (str) {
            var opens = (str.match(/\(/g) || []).length;
            var closes = (str.match(/\)/g) || []).length;
            return opens > closes;
        };
        var hasUnclosedQuotes = function (str) {
            var quotes = (str.match(/"/g) || []).length;
            return quotes % 2 !== 0;
        };
        var looksIncomplete = hasUnclosedBrackets(code) || hasUnclosedBraces(code) || hasUnclosedParens(code) || hasUnclosedQuotes(code);
        if (looksIncomplete) {
            setRenderState({ status: "parsing" });
            return;
        }
        // Debounce: wait for code to stabilize before rendering
        // This prevents rapid-fire render attempts during streaming
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }
        // Show loading state while waiting
        setRenderState({ status: "parsing" });
        debounceTimeoutRef.current = setTimeout(function () {
            doRender();
        }, RENDER_DEBOUNCE_MS);
    };
    // Render on mount and when code/theme changes
    (0, solid_js_1.createEffect)(function () {
        // Check if we have a cached result
        var cacheKey = "".concat(code, "-").concat(isDark ? "dark" : "light");
        var cached = mermaidCache.get(cacheKey);
        if (cached) {
            setRenderState({
                status: "success",
                svg: cached
            });
            lastRenderedCodeRef.current = code;
            lastRenderedThemeRef.current = isDark;
            return;
        }
        // Only re-render if code or theme actually changed
        if (code === lastRenderedCodeRef.current && isDark === lastRenderedThemeRef.current) {
            return;
        }
        renderDiagram();
    });
    // Cleanup mermaid artifacts and debounce timeout on unmount
    (0, solid_js_1.createEffect)(function () {
        return function () {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
            cleanupMermaidErrors();
        };
    });
    var handleCopy = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, navigator.clipboard.writeText(code)];
                case 1:
                    _a.sent();
                    setCopied(true);
                    setTimeout(function () { return setCopied(false); }, 2e3);
                    return [2 /*return*/];
            }
        });
    }); };
    var handleDownload = function () { return __awaiter(_this, void 0, void 0, function () {
        var blob, url, a;
        return __generator(this, function (_a) {
            if (renderState.status !== "success")
                return [2 /*return*/];
            blob = new Blob([renderState.svg], { type: "image/svg+xml" });
            url = URL.createObjectURL(blob);
            a = document.createElement("a");
            a.href = url;
            a.download = "diagram.svg";
            a.click();
            URL.revokeObjectURL(url);
            return [2 /*return*/];
        });
    }); };
    var openFullscreen = function () {
        setIsFullscreen(true);
    };
    var closeFullscreen = function () {
        setIsFullscreen(false);
    };
    return <>
      <div class="relative mt-2 mb-4 rounded-[10px] bg-muted/50 overflow-hidden">
        {/* Toolbar */}
        <div class="absolute top-[6px] right-[6px] flex gap-1 z-[2]">
          <button onClick={handleCopy} tabIndex={-1} class="p-1" title={copied ? "Copied!" : "Copy code"}>
            <div class="relative w-3.5 h-3.5">
              <lucide_solid_1.Copy class={(0, utils_1.cn)("absolute inset-0 w-3 h-3 text-muted-foreground transition-[opacity,transform] duration-200 ease-out hover:text-foreground", copied ? "opacity-0 scale-50" : "opacity-100 scale-100")}/>
              <lucide_solid_1.Check class={(0, utils_1.cn)("absolute inset-0 w-3 h-3 text-muted-foreground transition-[opacity,transform] duration-200 ease-out", copied ? "opacity-100 scale-100" : "opacity-0 scale-50")}/>
            </div>
          </button>
          {renderState.status === "success" && <>
              <button onClick={handleDownload} tabIndex={-1} class="p-1" title="Download SVG">
                <lucide_solid_1.Download class="w-3 h-3 text-muted-foreground hover:text-foreground transition-colors"/>
              </button>
              <button onClick={openFullscreen} tabIndex={-1} class="p-1" title="View fullscreen">
                <lucide_solid_1.Maximize2 class="w-3 h-3 text-muted-foreground hover:text-foreground transition-colors"/>
              </button>
            </>}
        </div>

        {/* Content */}
        <div class="p-4 min-h-[60px] flex items-center justify-center">
          {renderState.status === "idle" && <div class="text-muted-foreground text-sm">
              Waiting for diagram...
            </div>}

          {(renderState.status === "loading" || renderState.status === "parsing") && <div class="flex items-center gap-2 text-muted-foreground text-sm">
              <div class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"/>
              <span>Creating diagram...</span>
            </div>}

          {renderState.status === "success" && <div class={(0, utils_1.cn)("mermaid-diagram w-full overflow-x-auto cursor-pointer", "[&_svg]:max-w-full [&_svg]:h-auto [&_svg]:mx-auto")} onClick={openFullscreen} dangerouslySetInnerHTML={{ __html: renderState.svg }}/>}

          {renderState.status === "error" && <div class="w-full">
              <div class="flex items-start gap-2 text-destructive text-sm mb-3">
                <lucide_solid_1.AlertTriangle class="h-4 w-4 shrink-0 mt-0.5"/>
                <span class="break-words">{renderState.message}</span>
              </div>
              <div class="flex gap-2">
                <button onClick={renderDiagram} class="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md bg-muted hover:bg-accent transition-colors">
                  <lucide_solid_1.RotateCcw class="h-3 w-3"/>
                  Retry
                </button>
              </div>
              <details class="mt-3">
                <summary class="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                  Show diagram code
                </summary>
                <pre class="mt-2 p-2 rounded bg-muted text-xs overflow-x-auto whitespace-pre-wrap break-words font-mono">
                  {code}
                </pre>
              </details>
            </div>}
        </div>
      </div>

      {/* Fullscreen dialog with zoom/pan using react-zoom-pan-pinch */}
      <dialog_1.Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <dialog_1.DialogPortal>
          <dialog_2.Dialog.Overlay class="fixed inset-0 z-50 bg-black/90 data-[expanded]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[expanded]:fade-in-0"/>
          <dialog_2.Dialog.Content class="fixed inset-0 z-50 flex items-center justify-center outline-none overflow-hidden" onPointerDownOutside={function (e) { return e.preventDefault(); }}>
            <span class="sr-only">
              <dialog_1.DialogTitle>Mermaid Diagram Viewer</dialog_1.DialogTitle>
            </span>

            {/* Close button */}
            <button onClick={closeFullscreen} class="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors text-white z-20" type="button" aria-label="Close fullscreen (Esc)">
              <lucide_solid_1.X class="size-6"/>
            </button>

            {/* Diagram viewer with zoom/pan */}
            {renderState.status === "success" && <div class="w-full h-full overflow-hidden">
                <react_zoom_pan_pinch_1.TransformWrapper initialScale={1} minScale={.1} maxScale={8} centerOnInit limitToBounds={false} wheel={{ smoothStep: .1 }} panning={{ velocityDisabled: true }}>
                  <ZoomControls />
                  <react_zoom_pan_pinch_1.TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full flex items-center justify-center">
                    <div class={(0, utils_1.cn)("mermaid-diagram-fullscreen p-8", "[&_svg]:max-w-none [&_svg]:h-auto", isDark ? "" : "[&_svg]:filter [&_svg]:drop-shadow-lg")} dangerouslySetInnerHTML={{ __html: renderState.svg }}/>
                  </react_zoom_pan_pinch_1.TransformComponent>
                </react_zoom_pan_pinch_1.TransformWrapper>
              </div>}

            {/* Keyboard hints */}
            <div class="absolute bottom-6 right-4 text-white/50 text-xs z-10">
              Scroll to zoom | Drag to pan | Esc to close
            </div>
          </dialog_2.Dialog.Content>
        </dialog_1.DialogPortal>
      </dialog_1.Dialog>
    </>;
});
// Check if mermaid code looks complete (basic heuristics)
function looksComplete(code) {
    if (code.trim().length < 20)
        return false;
    // Check for balanced brackets/braces/parens
    var opens = {
        "[": (code.match(/\[/g) || []).length,
        "{": (code.match(/\{/g) || []).length,
        "(": (code.match(/\(/g) || []).length
    };
    var closes = {
        "]": (code.match(/\]/g) || []).length,
        "}": (code.match(/\}/g) || []).length,
        ")": (code.match(/\)/g) || []).length
    };
    if (opens["["] > closes["]"])
        return false;
    if (opens["{"] > closes["}"])
        return false;
    if (opens["("] > closes[")"])
        return false;
    // Check for incomplete statements at end
    var trimmed = code.trim();
    if (trimmed.endsWith("--") || trimmed.endsWith("->") || trimmed.endsWith("->>"))
        return false;
    if (trimmed.endsWith(":"))
        return false;
    // Looks complete enough to try rendering
    return true;
}
// Generate a stable ID for a mermaid block based on its content
function getBlockId(code) {
    // Use first line (diagram type declaration) as stable ID
    var firstLine = code.split("\n")[0] || "";
    return firstLine.slice(0, 50);
}
// Exported component that handles streaming state
// When streaming, shows placeholder. When done, renders the diagram.
function MermaidBlock(_a) {
    var code = _a.code, _b = _a.isStreaming, isStreaming = _b === void 0 ? false : _b;
    var blockId = getBlockId(code);
    var codeComplete = looksComplete(code);
    // Once streaming ends for this block, mark it as finished globally
    (0, solid_js_1.createEffect)(function () {
        if (!isStreaming && codeComplete) {
            finishedStreamingBlocks.add(blockId);
        }
    });
    // Check if this block has finished streaming before (survives remounts)
    var hasFinishedBefore = finishedStreamingBlocks.has(blockId);
    // Show placeholder if:
    // 1. We're streaming AND
    // 2. Block hasn't finished before AND
    // 3. Code doesn't look complete yet
    if (isStreaming && !hasFinishedBefore && !codeComplete) {
        return <StreamingPlaceholder />;
    }
    // Otherwise try to render the diagram
    return <MermaidBlockInner code={code}/>;
}
MermaidBlock.displayName = "MermaidBlock";
