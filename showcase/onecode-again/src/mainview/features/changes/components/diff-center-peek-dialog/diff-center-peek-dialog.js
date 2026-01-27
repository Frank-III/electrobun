"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiffCenterPeekDialog = DiffCenterPeekDialog;
var react_1 = require("motion/react");
var solid_js_1 = require("solid-js");
function DiffCenterPeekDialog(_a) {
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
      {isOpen && <>
          {/* Backdrop */}
          <react_1.motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .15 }} class="fixed inset-0 bg-black/50 z-50" onClick={onClose}/>

          {/* Dialog */}
          <react_1.motion.div role="dialog" aria-modal="true" initial={{
                opacity: 0,
                scale: .98
            }} animate={{
                opacity: 1,
                scale: 1
            }} exit={{
                opacity: 0,
                scale: .98
            }} transition={{
                duration: .15,
                ease: [
                    .4,
                    0,
                    .2,
                    1
                ]
            }} class="fixed z-50 flex flex-col bg-background border border-border/50 overflow-hidden" style={{
                top: "72px",
                left: "72px",
                right: "72px",
                height: "calc(100% - 144px)",
                maxWidth: "1200px",
                marginInline: "auto",
                borderRadius: "12px",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)"
            }}>
            {children}
          </react_1.motion.div>
        </>}
    </react_1.AnimatePresence>;
}
