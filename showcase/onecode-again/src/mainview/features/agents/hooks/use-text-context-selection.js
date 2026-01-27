"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTextContextSelection = useTextContextSelection;
var react_1 = require("react");
var queue_utils_1 = require("../lib/queue-utils");
function useTextContextSelection() {
    var _a = (0, react_1.useState)([]), textContexts = _a[0], setTextContexts = _a[1];
    var _b = (0, react_1.useState)([]), diffTextContexts = _b[0], setDiffTextContexts = _b[1];
    var textContextsRef = (0, react_1.useRef)([]);
    var diffTextContextsRef = (0, react_1.useRef)([]);
    // Keep refs in sync with state
    textContextsRef.current = textContexts;
    diffTextContextsRef.current = diffTextContexts;
    var addTextContext = (0, react_1.useCallback)(function (text, sourceMessageId) {
        var trimmedText = text.trim();
        if (!trimmedText)
            return;
        // Prevent duplicates - check if same text from same message already exists
        var isDuplicate = textContextsRef.current.some(function (ctx) {
            return ctx.text === trimmedText && ctx.sourceMessageId === sourceMessageId;
        });
        if (isDuplicate)
            return;
        var newContext = {
            id: "tc_".concat(Date.now(), "_").concat(Math.random().toString(36).substring(2, 9)),
            text: trimmedText,
            sourceMessageId: sourceMessageId,
            preview: (0, queue_utils_1.createTextPreview)(trimmedText),
            createdAt: new Date(),
        };
        setTextContexts(function (prev) { return __spreadArray(__spreadArray([], prev, true), [newContext], false); });
    }, []);
    var addDiffTextContext = (0, react_1.useCallback)(function (text, filePath, lineNumber, lineType) {
        var trimmedText = text.trim();
        if (!trimmedText)
            return;
        // Prevent duplicates
        var isDuplicate = diffTextContextsRef.current.some(function (ctx) {
            return ctx.text === trimmedText && ctx.filePath === filePath;
        });
        if (isDuplicate)
            return;
        var newContext = {
            id: "dtc_".concat(Date.now(), "_").concat(Math.random().toString(36).substring(2, 9)),
            text: trimmedText,
            filePath: filePath,
            lineNumber: lineNumber,
            lineType: lineType,
            preview: (0, queue_utils_1.createTextPreview)(trimmedText),
            createdAt: new Date(),
        };
        setDiffTextContexts(function (prev) { return __spreadArray(__spreadArray([], prev, true), [newContext], false); });
    }, []);
    var removeTextContext = (0, react_1.useCallback)(function (id) {
        setTextContexts(function (prev) { return prev.filter(function (ctx) { return ctx.id !== id; }); });
    }, []);
    var removeDiffTextContext = (0, react_1.useCallback)(function (id) {
        setDiffTextContexts(function (prev) { return prev.filter(function (ctx) { return ctx.id !== id; }); });
    }, []);
    var clearTextContexts = (0, react_1.useCallback)(function () {
        setTextContexts([]);
    }, []);
    var clearDiffTextContexts = (0, react_1.useCallback)(function () {
        setDiffTextContexts([]);
    }, []);
    // Direct state setter for restoring from draft
    var setTextContextsFromDraft = (0, react_1.useCallback)(function (contexts) {
        setTextContexts(contexts);
        textContextsRef.current = contexts;
    }, []);
    var setDiffTextContextsFromDraft = (0, react_1.useCallback)(function (contexts) {
        setDiffTextContexts(contexts);
        diffTextContextsRef.current = contexts;
    }, []);
    return {
        textContexts: textContexts,
        diffTextContexts: diffTextContexts,
        addTextContext: addTextContext,
        addDiffTextContext: addDiffTextContext,
        removeTextContext: removeTextContext,
        removeDiffTextContext: removeDiffTextContext,
        clearTextContexts: clearTextContexts,
        clearDiffTextContexts: clearDiffTextContexts,
        textContextsRef: textContextsRef,
        diffTextContextsRef: diffTextContextsRef,
        setTextContextsFromDraft: setTextContextsFromDraft,
        setDiffTextContextsFromDraft: setDiffTextContextsFromDraft,
    };
}
