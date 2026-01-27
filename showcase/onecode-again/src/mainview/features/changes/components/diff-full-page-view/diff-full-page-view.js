"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiffFullPageView = DiffFullPageView;
var react_1 = require("motion/react");
var solid_js_1 = require("solid-js");
function DiffFullPageView(_a) {
    var isOpen = _a.isOpen, onClose = _a.onClose, children = _a.children;
    // Close on Escape key
    var handleKeyDown = function (e) {
        if (e.key === "Escape") {
            e.stopPropagation();
            onClose();
        }
    };
    (0, solid_js_1.createEffect)(function () {
        if (isOpen) {
            document.addEventListener("keydown", handleKeyDown);
            return function () { return document.removeEventListener("keydown", handleKeyDown); };
        }
    });
    return <react_1.AnimatePresence>
      {isOpen && <react_1.motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{
                duration: .15,
                ease: [
                    .4,
                    0,
                    .2,
                    1
                ]
            }} class="fixed inset-0 z-50 bg-background flex flex-col">
          {children}
        </react_1.motion.div>}
    </react_1.AnimatePresence>;
}
