"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LARGE_PASTE_THRESHOLD = void 0;
exports.insertTextAtCursor = insertTextAtCursor;
exports.handlePasteEvent = handlePasteEvent;
var solid_sonner_1 = require("solid-sonner");
// Threshold for auto-converting large pasted text to a file (5KB)
// Text larger than this will be saved as a file attachment instead of pasted inline
exports.LARGE_PASTE_THRESHOLD = 5000;
// Maximum characters allowed for paste (10KB of text)
// ContentEditable elements become extremely slow with large text content,
// causing browser/system freeze. 50KB still causes noticeable lag on some systems.
// For larger content, users should attach it as a file instead.
var MAX_PASTE_LENGTH = 10000;
// Threshold for showing "very large" warning (1MB+)
var VERY_LARGE_THRESHOLD = 1000000;
/**
 * Insert text at the current cursor position in a contentEditable element.
 * Truncates large text to prevent browser freeze.
 * Also accounts for existing content to prevent total size from exceeding limit.
 * Uses execCommand to preserve browser's undo history.
 *
 * @param text - The text to insert
 * @param editableElement - The contentEditable element (used for size calculation)
 */
function insertTextAtCursor(text, editableElement) {
    var _a;
    // Check existing content size to prevent exceeding total limit
    var existingLength = ((_a = editableElement === null || editableElement === void 0 ? void 0 : editableElement.textContent) === null || _a === void 0 ? void 0 : _a.length) || 0;
    var availableSpace = Math.max(0, MAX_PASTE_LENGTH - existingLength);
    // Truncate based on available space (not just paste size)
    var textToInsert = text;
    var effectiveLimit = Math.min(text.length, availableSpace);
    if (text.length > effectiveLimit) {
        textToInsert = text.slice(0, effectiveLimit);
        // Show toast warning to user
        var originalKB = Math.round(text.length / 1024);
        if (availableSpace === 0) {
            // No space left at all
            solid_sonner_1.toast.warning("Cannot paste: input is full", {
                description: "Please clear some text or attach content as a file instead.",
            });
            return;
        }
        else if (text.length > VERY_LARGE_THRESHOLD) {
            var originalMB = (text.length / 1000000).toFixed(1);
            solid_sonner_1.toast.warning("Text truncated", {
                description: "Original text was ".concat(originalMB, "MB. Please attach as a file instead."),
            });
        }
        else {
            var truncatedKB = Math.round(effectiveLimit / 1024);
            solid_sonner_1.toast.warning("Text truncated to ".concat(truncatedKB, "KB"), {
                description: "Original text was ".concat(originalKB, "KB. Consider attaching as a file instead."),
            });
        }
    }
    // Insert using execCommand to preserve undo history
    // execCommand is deprecated but it's the only way to properly integrate with
    // the browser's undo stack in contenteditable elements
    // eslint-disable-next-line deprecation/deprecation
    document.execCommand("insertText", false, textToInsert);
}
/**
 * Handle paste event for contentEditable elements.
 * Extracts images and passes them to handleAddAttachments.
 * For large text (>LARGE_PASTE_THRESHOLD), saves as a file attachment.
 * For smaller text, pastes as plain text only (prevents HTML).
 *
 * @param e - The clipboard event
 * @param handleAddAttachments - Callback to handle image attachments
 * @param addPastedText - Optional callback to save large text as a file
 */
function handlePasteEvent(e, handleAddAttachments, addPastedText) {
    var files = Array.from(e.clipboardData.items)
        .filter(function (item) { return item.type.startsWith("image/"); })
        .map(function (item) { return item.getAsFile(); })
        .filter(Boolean);
    if (files.length > 0) {
        e.preventDefault();
        handleAddAttachments(files);
    }
    else {
        // Paste as plain text only (prevents HTML from being pasted)
        var text = e.clipboardData.getData("text/plain");
        if (text) {
            e.preventDefault();
            // Large text: save as file attachment instead of pasting inline
            if (text.length > exports.LARGE_PASTE_THRESHOLD && addPastedText) {
                addPastedText(text);
                return;
            }
            // Get the contentEditable element
            var target = e.currentTarget;
            var editableElement = target.closest('[contenteditable="true"]') || target;
            insertTextAtCursor(text, editableElement);
        }
    }
}
