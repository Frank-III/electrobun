"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFocusInputOnEnter = useFocusInputOnEnter;
var react_1 = require("react");
/**
 * Hook to focus an input element when Enter key is pressed (without modifiers)
 * and no other input is currently focused.
 *
 * @param editorRef - Ref to the editor/input element that should be focused
 */
function useFocusInputOnEnter(editorRef) {
    (0, react_1.useEffect)(function () {
        var handleKeyDown = function (e) {
            var _a;
            // Only handle Enter without modifiers
            if (e.key !== "Enter" ||
                e.shiftKey ||
                e.metaKey ||
                e.ctrlKey ||
                e.altKey) {
                return;
            }
            // Don't handle if inside a dialog/modal/overlay
            var target = e.target;
            var isInsideOverlay = target.closest('[role="dialog"], [role="alertdialog"], [role="menu"], [role="listbox"], [data-radix-popper-content-wrapper], [data-state="open"]');
            if (isInsideOverlay) {
                return;
            }
            // Check if user is already in an input/textarea/contenteditable
            var activeElement = document.activeElement;
            var isInputFocused = activeElement instanceof HTMLInputElement ||
                activeElement instanceof HTMLTextAreaElement ||
                (activeElement === null || activeElement === void 0 ? void 0 : activeElement.getAttribute("contenteditable")) === "true" ||
                (activeElement === null || activeElement === void 0 ? void 0 : activeElement.closest('[contenteditable="true"]'));
            if (isInputFocused) {
                return;
            }
            // Focus the editor
            e.preventDefault();
            (_a = editorRef.current) === null || _a === void 0 ? void 0 : _a.focus();
        };
        window.addEventListener("keydown", handleKeyDown);
        return function () { return window.removeEventListener("keydown", handleKeyDown); };
    }, [editorRef]);
}
