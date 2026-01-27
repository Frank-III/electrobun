"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useToggleFocusOnCmdEsc = useToggleFocusOnCmdEsc;
var react_1 = require("react");
/**
 * Hook to toggle focus when Cmd+Esc (or Ctrl+Esc) is pressed.
 * - If focused → blur
 * - If not focused → focus
 * Does not interfere with stop generation (Esc without modifiers).
 *
 * @param editorRef - Ref to the editor/input element
 */
function useToggleFocusOnCmdEsc(editorRef) {
    (0, react_1.useEffect)(function () {
        var handleKeyDown = function (e) {
            // Only handle Cmd+Esc (or Ctrl+Esc on Windows/Linux)
            if (e.key !== "Escape" ||
                !(e.metaKey || e.ctrlKey) ||
                e.shiftKey ||
                e.altKey) {
                return;
            }
            e.preventDefault();
            e.stopPropagation();
            var editor = editorRef.current;
            if (!editor)
                return;
            // Check if any input/contenteditable is currently focused
            var activeElement = document.activeElement;
            var isInputFocused = activeElement instanceof HTMLInputElement ||
                activeElement instanceof HTMLTextAreaElement ||
                (activeElement === null || activeElement === void 0 ? void 0 : activeElement.getAttribute("contenteditable")) === "true" ||
                ((activeElement === null || activeElement === void 0 ? void 0 : activeElement.hasAttribute("contenteditable")) &&
                    activeElement.getAttribute("contenteditable") !== "false");
            if (isInputFocused) {
                // Blur if any input is focused
                editor.blur();
            }
            else {
                // Focus if no input is focused
                editor.focus();
            }
        };
        window.addEventListener("keydown", handleKeyDown, { capture: true });
        return function () { return window.removeEventListener("keydown", handleKeyDown, { capture: true }); };
    }, [editorRef]);
}
