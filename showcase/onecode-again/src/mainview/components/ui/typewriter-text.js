"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypewriterText = void 0;
var solid_js_1 = require("solid-js");
var utils_1 = require("../../lib/utils");
exports.TypewriterText = memo(function TypewriterText(_a) {
    var text = _a.text, _b = _a.placeholder, placeholder = _b === void 0 ? "New workspace" : _b, id = _a.id, className = _a.className, _c = _a.isJustCreated, isJustCreated = _c === void 0 ? false : _c, _d = _a.showPlaceholder, showPlaceholder = _d === void 0 ? false : _d;
    var _e = (0, solid_js_1.createSignal)(false), isTyping = _e[0], setIsTyping = _e[1];
    var _f = (0, solid_js_1.createSignal)(0), typedLength = _f[0], setTypedLength = _f[1];
    var _g = (0, solid_js_1.createSignal)(false), hasAnimated = _g[0], setHasAnimated = _g[1];
    var _h = (0, solid_js_1.createSignal)(id), prevIdRef = _h[0], setPrevIdRef = _h[1];
    // Store the initial text when first mounted - this is usually the first message
    var _j = (0, solid_js_1.createSignal)(text), initialTextRef = _j[0], setInitialTextRef = _j[1];
    // Reset state when id changes
    (0, solid_js_1.createEffect)(function () {
        if (id !== prevIdRef.current) {
            setIsTyping(false);
            setTypedLength(0);
            setHasAnimated(false);
            initialTextRef.current = text;
            prevIdRef.current = id;
        }
    });
    // Detect when text CHANGES from initial value - trigger typewriter
    (0, solid_js_1.createEffect)(function () {
        if (hasAnimated)
            return;
        var textChanged = text !== initialTextRef.current;
        if (isJustCreated && textChanged) {
            setIsTyping(true);
            setTypedLength(1);
            setHasAnimated(true);
        }
    });
    // Typewriter animation
    (0, solid_js_1.createEffect)(function () {
        if (!isTyping || !text)
            return;
        if (typedLength < text.length) {
            var timeout_1 = setTimeout(function () {
                setTypedLength(function (prev) { return prev + 1; });
            }, 30);
            return function () { return clearTimeout(timeout_1); };
        }
        else {
            setIsTyping(false);
        }
    });
    // If isJustCreated and showPlaceholder and we haven't animated yet AND text is empty - show placeholder
    // Important: if text already has a value, show it immediately (don't wait for animation)
    var hasRealName = text && text !== placeholder && text !== initialTextRef.current;
    var isWaitingForName = isJustCreated && showPlaceholder && !hasAnimated && !hasRealName;
    if (isWaitingForName && !text) {
        return <span class={(0, utils_1.cn)("text-muted-foreground/50", className)}>{placeholder}</span>;
    }
    // Show placeholder for empty text
    if (!text || text === placeholder) {
        if (showPlaceholder) {
            return <span class={(0, utils_1.cn)("text-muted-foreground/50", className)}>{placeholder}</span>;
        }
        return <span class={className}></span>;
    }
    // Not animating - show final text
    if (!isTyping) {
        return <span class={className}>{text}</span>;
    }
    // Typewriter animation in progress
    var visibleText = text.slice(0, typedLength);
    return <span class={className}>
      {visibleText}
    </span>;
});
