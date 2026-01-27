"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResizeHandle = ResizeHandle;
var utils_1 = require("../../../lib/utils");
var react_1 = require("motion/react");
function ResizeHandle(_a) {
    var side = _a.side, onPointerDown = _a.onPointerDown, _b = _a.isResizing, isResizing = _b === void 0 ? false : _b, className = _a.className;
    return <react_1.motion.div data-side={side} onPointerDown={onPointerDown} initial={{
            width: 0,
            opacity: 0
        }} animate={{
            width: 12,
            opacity: 1
        }} exit={{
            width: 0,
            opacity: 0
        }} transition={{
            duration: .3,
            ease: "easeInOut"
        }} class={(0, utils_1.cn)("h-16 bg-muted-foreground/20 rounded-full cursor-ew-resize hover:bg-muted-foreground/40 transition-colors flex-shrink-0 pointer-events-auto select-none touch-none", isResizing && "bg-muted-foreground/60", className)} style={{ touchAction: "none" }}/>;
}
