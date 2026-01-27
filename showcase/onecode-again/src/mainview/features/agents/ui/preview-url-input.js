"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PreviewUrlInput = PreviewUrlInput;
var utils_1 = require("../../../lib/utils");
var react_1 = require("motion/react");
var solid_js_1 = require("solid-js");
function PreviewUrlInput(_a) {
    var baseHost = _a.baseHost, currentPath = _a.currentPath, onPathChange = _a.onPathChange, _b = _a.isLoading, isLoading = _b === void 0 ? false : _b, className = _a.className, _c = _a.variant, variant = _c === void 0 ? "default" : _c;
    var _d = (0, solid_js_1.createSignal)(false), isEditing = _d[0], setIsEditing = _d[1];
    var _e = (0, solid_js_1.createSignal)(""), inputValue = _e[0], setInputValue = _e[1];
    var _f = (0, solid_js_1.createSignal)(null), inputRef = _f[0], setInputRef = _f[1];
    // Progress bar animation
    var progress = (0, react_1.useMotionValue)(0);
    var width = (0, react_1.useTransform)(progress, [0, 100], ["0%", "100%"]);
    var glowOpacity = (0, react_1.useTransform)(progress, [
        0,
        95,
        100
    ], [
        1,
        1,
        0
    ]);
    var _g = (0, solid_js_1.createSignal)(null), animationRef = _g[0], setAnimationRef = _g[1];
    // Handle loading state changes for progress animation
    (0, solid_js_1.createEffect)(function () {
        var _a;
        if (isLoading) {
            // Reset and start loading animation
            progress.jump(0);
            // Animate to ~90% with decreasing speed (simulating uncertain progress)
            animationRef.current = (0, react_1.animate)(progress, 90, {
                duration: 12,
                ease: [
                    .1,
                    .4,
                    .2,
                    1
                ]
            });
            // Safety timeout: if still loading after 15s, force completion
            var timeoutId_1 = setTimeout(function () {
                var _a;
                (_a = animationRef.current) === null || _a === void 0 ? void 0 : _a.stop();
                animationRef.current = (0, react_1.animate)(progress, 100, {
                    duration: .15,
                    ease: "easeOut"
                });
            }, 15e3);
            return function () {
                var _a;
                clearTimeout(timeoutId_1);
                (_a = animationRef.current) === null || _a === void 0 ? void 0 : _a.stop();
            };
        }
        else {
            // Stop the slow animation
            (_a = animationRef.current) === null || _a === void 0 ? void 0 : _a.stop();
            // Quickly complete to 100%
            animationRef.current = (0, react_1.animate)(progress, 100, {
                duration: .15,
                ease: "easeOut"
            });
            return function () {
                var _a;
                (_a = animationRef.current) === null || _a === void 0 ? void 0 : _a.stop();
            };
        }
    });
    // Focus and select when entering edit mode
    (0, solid_js_1.createEffect)(function () {
        if (isEditing && inputRef.current) {
            var input = inputRef.current;
            input.focus();
            var value = input.value;
            // Display format is "~{currentPath}", e.g. "~/community/components"
            // Select only the path after "~/" so user can type new path directly
            var pathStartAfterSlash = 2;
            // If path is just "/" (main page), place cursor at end
            // Otherwise select the path portion AFTER "~/"
            if (currentPath === "/") {
                input.setSelectionRange(value.length, value.length);
            }
            else {
                input.setSelectionRange(pathStartAfterSlash, value.length);
            }
        }
    });
    var handleSubmit = function () {
        var input = inputValue.trim();
        // Handle ~ prefix format (our display format)
        if (input.startsWith("~")) {
            input = input.slice(1);
        }
        // Extract path from full URL or just use as path
        var newPath = "/";
        try {
            // Check if it's a full URL
            if (input.startsWith("http://") || input.startsWith("https://")) {
                var url = new URL(input);
                newPath = url.pathname + url.search + url.hash;
            }
            else if (input.includes(".") && input.includes("/")) {
                // It's host + path like "sandbox-3000.21st.sh/some/path"
                var slashIndex = input.indexOf("/");
                newPath = input.slice(slashIndex);
            }
            else if (input.startsWith("/")) {
                // Just a path starting with /
                newPath = input;
            }
            else {
                // Just a path without leading /
                newPath = "/" + input;
            }
        }
        catch (_a) {
            // If parsing fails, treat as path
            newPath = input.startsWith("/") ? input : "/" + input;
        }
        if (!newPath)
            newPath = "/";
        // Only navigate if path actually changed
        if (newPath !== currentPath) {
            onPathChange(newPath);
        }
        setIsEditing(false);
    };
    var handleKeyDown = function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSubmit();
        }
        else if (e.key === "Escape") {
            e.preventDefault();
            setInputValue("~".concat(currentPath));
            setIsEditing(false);
        }
    };
    var startEditing = function () {
        setInputValue("~".concat(currentPath));
        setIsEditing(true);
    };
    if (!baseHost) {
        return null;
    }
    // Shared styling for consistent height/positioning between button and input
    var sharedStyles = "font-mono text-xs rounded-md px-3 h-7 leading-7 w-full max-w-[350px] text-center";
    return <div class={(0, utils_1.cn)("min-w-0 flex-1 text-center flex items-center justify-center relative", className)}>
      {/* URL input/button container */}
      <div class="relative max-w-[350px] w-full">
        {isEditing ? <input ref={inputRef} type="text" value={inputValue} onChange={function (e) { return setInputValue(e.target.value); }} onKeyDown={handleKeyDown} onBlur={handleSubmit} spellCheck={false} autoComplete="off" autoCorrect="off" autoCapitalize="off" class={(0, utils_1.cn)(sharedStyles, variant === "mobile" ? "bg-muted shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 text-foreground" : "bg-background shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 text-foreground")} placeholder="~/"/> : <button type="button" onClick={startEditing} class={(0, utils_1.cn)(sharedStyles, variant === "mobile" ? "truncate text-muted-foreground hover:text-foreground transition-all cursor-pointer bg-muted hover:bg-muted/80 shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70" : "truncate text-muted-foreground hover:text-foreground transition-all cursor-pointer hover:bg-background hover:shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] dark:hover:shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70")}>
            ~{currentPath}
          </button>}

        {/* Progress bar at bottom with upward glow */}
        <react_1.AnimatePresence>
          {isLoading && <react_1.motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .15 }} class="absolute bottom-0 left-0 right-0 pointer-events-none z-0 rounded-md overflow-hidden">
              {/* Glow effect - uniform along progress, fades at edges via blur */}
              <react_1.motion.div class="absolute -bottom-2 left-0 h-4" style={{
                width: width,
                opacity: glowOpacity,
                background: "hsl(var(--primary) / 0.15)",
                filter: "blur(4px)"
            }}/>
              {/* Progress bar line */}
              <react_1.motion.div class="absolute bottom-0 left-0 h-[0.5px] bg-primary/60" style={{ width: width }}/>
            </react_1.motion.div>}
        </react_1.AnimatePresence>
      </div>
    </div>;
}
