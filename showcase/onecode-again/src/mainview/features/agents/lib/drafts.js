"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.DRAFTS_CHANGE_EVENT = exports.DRAFT_ID_PREFIX = exports.DRAFTS_STORAGE_KEY = void 0;
exports.emitDraftsChanged = emitDraftsChanged;
exports.loadGlobalDrafts = loadGlobalDrafts;
exports.saveGlobalDrafts = saveGlobalDrafts;
exports.generateDraftId = generateDraftId;
exports.isNewChatDraftKey = isNewChatDraftKey;
exports.isSubChatDraftKey = isSubChatDraftKey;
exports.getNewChatDrafts = getNewChatDrafts;
exports.saveNewChatDraft = saveNewChatDraft;
exports.deleteNewChatDraft = deleteNewChatDraft;
exports.markDraftVisible = markDraftVisible;
exports.getSubChatDraftKey = getSubChatDraftKey;
exports.getSubChatDraft = getSubChatDraft;
exports.saveSubChatDraft = saveSubChatDraft;
exports.clearSubChatDraft = clearSubChatDraft;
exports.buildDraftsCache = buildDraftsCache;
exports.useNewChatDrafts = useNewChatDrafts;
exports.useSubChatDraftsCache = useSubChatDraftsCache;
exports.useSubChatDraft = useSubChatDraft;
exports.estimateDraftSize = estimateDraftSize;
exports.toDraftImage = toDraftImage;
exports.toDraftFile = toDraftFile;
exports.toDraftTextContext = toDraftTextContext;
exports.revokeDraftBlobUrls = revokeDraftBlobUrls;
exports.revokeAllDraftBlobUrls = revokeAllDraftBlobUrls;
exports.fromDraftImage = fromDraftImage;
exports.fromDraftFile = fromDraftFile;
exports.fromDraftTextContext = fromDraftTextContext;
exports.getSubChatDraftFull = getSubChatDraftFull;
exports.saveSubChatDraftWithAttachments = saveSubChatDraftWithAttachments;
var react_1 = require("react");
// Constants
exports.DRAFTS_STORAGE_KEY = "agent-drafts-global";
exports.DRAFT_ID_PREFIX = "draft-";
exports.DRAFTS_CHANGE_EVENT = "drafts-changed";
var MAX_DRAFT_STORAGE_BYTES = 4 * 1024 * 1024; // 4MB safe limit
// Track blob URLs for cleanup (prevents memory leaks)
var draftBlobUrls = new Map();
// Emit custom event when drafts change (for same-tab sync)
function emitDraftsChanged() {
    if (typeof window === "undefined")
        return;
    window.dispatchEvent(new CustomEvent(exports.DRAFTS_CHANGE_EVENT));
}
// Load all drafts from localStorage
function loadGlobalDrafts() {
    if (typeof window === "undefined")
        return {};
    try {
        var stored = localStorage.getItem(exports.DRAFTS_STORAGE_KEY);
        return stored ? JSON.parse(stored) : {};
    }
    catch (_a) {
        return {};
    }
}
// Save all drafts to localStorage
function saveGlobalDrafts(drafts) {
    if (typeof window === "undefined")
        return;
    try {
        localStorage.setItem(exports.DRAFTS_STORAGE_KEY, JSON.stringify(drafts));
        emitDraftsChanged();
    }
    catch (_a) {
        // Ignore localStorage errors
    }
}
// Generate a new draft ID
function generateDraftId() {
    return "".concat(exports.DRAFT_ID_PREFIX).concat(Date.now(), "-").concat(Math.random().toString(36).slice(2, 9));
}
// Check if a key is a new chat draft (starts with draft-)
function isNewChatDraftKey(key) {
    return key.startsWith(exports.DRAFT_ID_PREFIX);
}
// Check if a key is a sub-chat draft (contains :)
function isSubChatDraftKey(key) {
    return key.includes(":");
}
// Get new chat drafts as sorted array (only visible ones)
function getNewChatDrafts() {
    var globalDrafts = loadGlobalDrafts();
    return Object.entries(globalDrafts)
        .filter(function (_a) {
        var key = _a[0];
        return isNewChatDraftKey(key);
    })
        .map(function (_a) {
        var id = _a[0], data = _a[1];
        return ({
            id: id,
            text: data.text || "",
            updatedAt: data.updatedAt || 0,
            project: data.project,
            isVisible: data.isVisible,
        });
    })
        .filter(function (draft) { return draft.isVisible === true; })
        .sort(function (a, b) { return b.updatedAt - a.updatedAt; });
}
// Save a new chat draft
function saveNewChatDraft(draftId, text, project) {
    var globalDrafts = loadGlobalDrafts();
    if (text.trim()) {
        globalDrafts[draftId] = __assign({ text: text, updatedAt: Date.now() }, (project && { project: project }));
    }
    else {
        delete globalDrafts[draftId];
    }
    saveGlobalDrafts(globalDrafts);
}
// Delete a new chat draft
function deleteNewChatDraft(draftId) {
    var globalDrafts = loadGlobalDrafts();
    delete globalDrafts[draftId];
    saveGlobalDrafts(globalDrafts);
}
// Mark a draft as visible (called when user navigates away from the form)
function markDraftVisible(draftId) {
    var globalDrafts = loadGlobalDrafts();
    if (globalDrafts[draftId]) {
        ;
        globalDrafts[draftId].isVisible = true;
        saveGlobalDrafts(globalDrafts);
    }
}
// Get sub-chat draft key
function getSubChatDraftKey(chatId, subChatId) {
    return "".concat(chatId, ":").concat(subChatId);
}
// Get sub-chat draft text
function getSubChatDraft(chatId, subChatId) {
    var globalDrafts = loadGlobalDrafts();
    var key = getSubChatDraftKey(chatId, subChatId);
    var draft = globalDrafts[key];
    return (draft === null || draft === void 0 ? void 0 : draft.text) || null;
}
// Save sub-chat draft
function saveSubChatDraft(chatId, subChatId, text) {
    var globalDrafts = loadGlobalDrafts();
    var key = getSubChatDraftKey(chatId, subChatId);
    if (text.trim()) {
        globalDrafts[key] = { text: text, updatedAt: Date.now() };
    }
    else {
        delete globalDrafts[key];
    }
    saveGlobalDrafts(globalDrafts);
}
// Clear sub-chat draft (also revokes any blob URLs)
function clearSubChatDraft(chatId, subChatId) {
    var globalDrafts = loadGlobalDrafts();
    var key = getSubChatDraftKey(chatId, subChatId);
    var draft = globalDrafts[key];
    // Revoke blob URLs for images and files before deleting
    if (draft === null || draft === void 0 ? void 0 : draft.images) {
        draft.images.forEach(function (img) { return revokeDraftBlobUrls(img.id); });
    }
    if (draft === null || draft === void 0 ? void 0 : draft.files) {
        draft.files.forEach(function (file) { return revokeDraftBlobUrls(file.id); });
    }
    delete globalDrafts[key];
    saveGlobalDrafts(globalDrafts);
}
// Build drafts cache from localStorage (for sidebar display)
function buildDraftsCache() {
    var globalDrafts = loadGlobalDrafts();
    var cache = {};
    for (var _i = 0, _a = Object.entries(globalDrafts); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], value = _b[1];
        if (value === null || value === void 0 ? void 0 : value.text) {
            cache[key] = value.text;
        }
    }
    return cache;
}
/**
 * Hook to get new chat drafts with automatic updates
 * Uses custom events for same-tab sync and storage events for cross-tab sync
 */
function useNewChatDrafts() {
    var _a = (0, react_1.useState)(function () { return getNewChatDrafts(); }), drafts = _a[0], setDrafts = _a[1];
    (0, react_1.useEffect)(function () {
        var handleChange = function (e) {
            var _a;
            // For storage events, only react to draft-related keys
            // This prevents re-renders when other localStorage keys change (e.g., sub-chat active state)
            if (e instanceof StorageEvent) {
                if (!((_a = e.key) === null || _a === void 0 ? void 0 : _a.startsWith("new-chat-draft-"))) {
                    return;
                }
            }
            var newDrafts = getNewChatDrafts();
            // Only update state if drafts actually changed (compare by content)
            setDrafts(function (prev) {
                if (prev.length !== newDrafts.length)
                    return newDrafts;
                var prevIds = prev.map(function (d) { return d.id; }).sort().join(",");
                var newIds = newDrafts.map(function (d) { return d.id; }).sort().join(",");
                if (prevIds !== newIds)
                    return newDrafts;
                // Also compare text content
                var prevTexts = prev.map(function (d) { return "".concat(d.id, ":").concat(d.text); }).sort().join("|");
                var newTexts = newDrafts.map(function (d) { return "".concat(d.id, ":").concat(d.text); }).sort().join("|");
                if (prevTexts !== newTexts)
                    return newDrafts;
                return prev; // No change, return previous reference
            });
        };
        // Listen for custom event (same-tab changes)
        window.addEventListener(exports.DRAFTS_CHANGE_EVENT, handleChange);
        // Listen for storage event (cross-tab changes)
        window.addEventListener("storage", handleChange);
        return function () {
            window.removeEventListener(exports.DRAFTS_CHANGE_EVENT, handleChange);
            window.removeEventListener("storage", handleChange);
        };
    }, []);
    return drafts;
}
/**
 * Hook to get sub-chat drafts cache with automatic updates
 * Returns a Record<key, text> for quick lookups
 */
function useSubChatDraftsCache() {
    var _a = (0, react_1.useState)(function () {
        if (typeof window === "undefined")
            return {};
        return buildDraftsCache();
    }), draftsCache = _a[0], setDraftsCache = _a[1];
    (0, react_1.useEffect)(function () {
        var handleChange = function () {
            var newCache = buildDraftsCache();
            setDraftsCache(newCache);
        };
        // Listen for custom event (same-tab changes)
        window.addEventListener(exports.DRAFTS_CHANGE_EVENT, handleChange);
        // Listen for storage event (cross-tab changes)
        window.addEventListener("storage", handleChange);
        return function () {
            window.removeEventListener(exports.DRAFTS_CHANGE_EVENT, handleChange);
            window.removeEventListener("storage", handleChange);
        };
    }, []);
    return draftsCache;
}
/**
 * Hook to get a specific sub-chat draft
 */
function useSubChatDraft(parentChatId, subChatId) {
    var draftsCache = useSubChatDraftsCache();
    if (!parentChatId)
        return null;
    var key = getSubChatDraftKey(parentChatId, subChatId);
    return draftsCache[key] || null;
}
// ============================================
// Attachment persistence utilities
// ============================================
/**
 * Estimate size of draft in bytes (for storage limit checks)
 */
function estimateDraftSize(draft) {
    return JSON.stringify(draft).length * 2; // UTF-16 chars = 2 bytes each
}
/**
 * Check if adding a draft would exceed storage limits
 */
function wouldExceedStorageLimit(existingDrafts, newDraft) {
    var existingSize = JSON.stringify(existingDrafts).length * 2;
    var newSize = estimateDraftSize(newDraft);
    return existingSize + newSize > MAX_DRAFT_STORAGE_BYTES;
}
/**
 * Convert blob URL to base64 data
 */
function blobUrlToBase64(blobUrl) {
    return __awaiter(this, void 0, void 0, function () {
        var response, blob;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch(blobUrl)];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.blob()];
                case 2:
                    blob = _a.sent();
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            var reader = new FileReader();
                            reader.onloadend = function () {
                                var result = reader.result;
                                // Remove the data:xxx;base64, prefix
                                var base64 = result.split(",")[1];
                                resolve(base64 || "");
                            };
                            reader.onerror = reject;
                            reader.readAsDataURL(blob);
                        })];
            }
        });
    });
}
/**
 * Convert UploadedImage to DraftImage (filter out images without base64)
 */
function toDraftImage(img) {
    if (!img.base64Data)
        return null;
    return {
        id: img.id,
        filename: img.filename,
        base64Data: img.base64Data,
        mediaType: img.mediaType || "image/png",
    };
}
/**
 * Convert UploadedFile to DraftFile (requires async conversion)
 */
function toDraftFile(file) {
    return __awaiter(this, void 0, void 0, function () {
        var base64Data, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!file.url)
                        return [2 /*return*/, null];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, blobUrlToBase64(file.url)];
                case 2:
                    base64Data = _a.sent();
                    return [2 /*return*/, {
                            id: file.id,
                            filename: file.filename,
                            base64Data: base64Data,
                            size: file.size,
                            type: file.type,
                        }];
                case 3:
                    err_1 = _a.sent();
                    console.error("[drafts] Failed to convert file to base64:", err_1);
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Convert SelectedTextContext to DraftTextContext
 */
function toDraftTextContext(ctx) {
    return {
        id: ctx.id,
        text: ctx.text,
        sourceMessageId: ctx.sourceMessageId,
        preview: ctx.preview,
        createdAt: ctx.createdAt instanceof Date
            ? ctx.createdAt.toISOString()
            : String(ctx.createdAt),
    };
}
/**
 * Revoke blob URLs associated with a draft item
 */
function revokeDraftBlobUrls(draftId) {
    var urls = draftBlobUrls.get(draftId);
    if (urls) {
        urls.forEach(function (url) { return URL.revokeObjectURL(url); });
        draftBlobUrls.delete(draftId);
    }
}
/**
 * Revoke all tracked blob URLs (call on unmount or cleanup)
 */
function revokeAllDraftBlobUrls() {
    draftBlobUrls.forEach(function (urls) {
        urls.forEach(function (url) { return URL.revokeObjectURL(url); });
    });
    draftBlobUrls.clear();
}
/**
 * Restore UploadedImage from DraftImage (creates blob URL)
 * Tracks blob URL for cleanup to prevent memory leaks
 */
function fromDraftImage(draft) {
    if (!draft.base64Data)
        return null;
    try {
        var byteCharacters = atob(draft.base64Data);
        var byteNumbers = new Array(byteCharacters.length);
        for (var i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        var byteArray = new Uint8Array(byteNumbers);
        var blob = new Blob([byteArray], { type: draft.mediaType });
        var url = URL.createObjectURL(blob);
        // Track blob URL for cleanup
        var existing = draftBlobUrls.get(draft.id) || [];
        draftBlobUrls.set(draft.id, __spreadArray(__spreadArray([], existing, true), [url], false));
        return {
            id: draft.id,
            filename: draft.filename,
            url: url,
            base64Data: draft.base64Data,
            mediaType: draft.mediaType,
            isLoading: false,
        };
    }
    catch (err) {
        console.error("[drafts] Failed to restore image:", err);
        return null;
    }
}
/**
 * Restore UploadedFile from DraftFile (creates blob URL)
 * Tracks blob URL for cleanup to prevent memory leaks
 */
function fromDraftFile(draft) {
    if (!draft.base64Data)
        return null;
    try {
        var byteCharacters = atob(draft.base64Data);
        var byteNumbers = new Array(byteCharacters.length);
        for (var i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        var byteArray = new Uint8Array(byteNumbers);
        var blob = new Blob([byteArray], {
            type: draft.type || "application/octet-stream",
        });
        var url = URL.createObjectURL(blob);
        // Track blob URL for cleanup
        var existing = draftBlobUrls.get(draft.id) || [];
        draftBlobUrls.set(draft.id, __spreadArray(__spreadArray([], existing, true), [url], false));
        return {
            id: draft.id,
            filename: draft.filename,
            url: url,
            size: draft.size,
            type: draft.type,
            isLoading: false,
        };
    }
    catch (err) {
        console.error("[drafts] Failed to restore file:", err);
        return null;
    }
}
/**
 * Restore SelectedTextContext from DraftTextContext
 */
function fromDraftTextContext(draft) {
    return {
        id: draft.id,
        text: draft.text,
        sourceMessageId: draft.sourceMessageId,
        preview: draft.preview,
        createdAt: new Date(draft.createdAt),
    };
}
/**
 * Get full sub-chat draft including attachments and text contexts
 */
function getSubChatDraftFull(chatId, subChatId) {
    var _a, _b, _c, _d, _e, _f;
    var globalDrafts = loadGlobalDrafts();
    var key = getSubChatDraftKey(chatId, subChatId);
    var draft = globalDrafts[key];
    if (!draft)
        return null;
    return {
        text: draft.text || null,
        images: (_b = (_a = draft.images) === null || _a === void 0 ? void 0 : _a.map(fromDraftImage).filter(function (img) { return img !== null; })) !== null && _b !== void 0 ? _b : [],
        files: (_d = (_c = draft.files) === null || _c === void 0 ? void 0 : _c.map(fromDraftFile).filter(function (f) { return f !== null; })) !== null && _d !== void 0 ? _d : [],
        textContexts: (_f = (_e = draft.textContexts) === null || _e === void 0 ? void 0 : _e.map(fromDraftTextContext)) !== null && _f !== void 0 ? _f : [],
    };
}
/**
 * Save sub-chat draft with attachments (async version)
 */
function saveSubChatDraftWithAttachments(chatId, subChatId, text, options) {
    return __awaiter(this, void 0, void 0, function () {
        var globalDrafts, key, hasContent, draftImages, draftFiles, _a, draftTextContexts, draft;
        var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        return __generator(this, function (_m) {
            switch (_m.label) {
                case 0:
                    globalDrafts = loadGlobalDrafts();
                    key = getSubChatDraftKey(chatId, subChatId);
                    hasContent = text.trim() ||
                        ((_c = (_b = options === null || options === void 0 ? void 0 : options.images) === null || _b === void 0 ? void 0 : _b.length) !== null && _c !== void 0 ? _c : 0) > 0 ||
                        ((_e = (_d = options === null || options === void 0 ? void 0 : options.files) === null || _d === void 0 ? void 0 : _d.length) !== null && _e !== void 0 ? _e : 0) > 0 ||
                        ((_g = (_f = options === null || options === void 0 ? void 0 : options.textContexts) === null || _f === void 0 ? void 0 : _f.length) !== null && _g !== void 0 ? _g : 0) > 0;
                    if (!hasContent) {
                        delete globalDrafts[key];
                        saveGlobalDrafts(globalDrafts);
                        return [2 /*return*/, { success: true }];
                    }
                    draftImages = (_j = (_h = options === null || options === void 0 ? void 0 : options.images) === null || _h === void 0 ? void 0 : _h.map(toDraftImage).filter(function (img) { return img !== null; })) !== null && _j !== void 0 ? _j : [];
                    if (!(options === null || options === void 0 ? void 0 : options.files)) return [3 /*break*/, 2];
                    return [4 /*yield*/, Promise.all(options.files.map(toDraftFile)).then(function (results) {
                            return results.filter(function (f) { return f !== null; });
                        })];
                case 1:
                    _a = _m.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _a = [];
                    _m.label = 3;
                case 3:
                    draftFiles = _a;
                    draftTextContexts = (_l = (_k = options === null || options === void 0 ? void 0 : options.textContexts) === null || _k === void 0 ? void 0 : _k.map(toDraftTextContext)) !== null && _l !== void 0 ? _l : [];
                    draft = __assign(__assign(__assign({ text: text, updatedAt: Date.now() }, (draftImages.length > 0 && { images: draftImages })), (draftFiles.length > 0 && { files: draftFiles })), (draftTextContexts.length > 0 && { textContexts: draftTextContexts }));
                    // Check storage limits before saving
                    if (wouldExceedStorageLimit(globalDrafts, draft)) {
                        console.warn("[drafts] Storage limit would be exceeded, skipping attachment persistence");
                        // Save without attachments as fallback
                        globalDrafts[key] = { text: text, updatedAt: Date.now() };
                        try {
                            saveGlobalDrafts(globalDrafts);
                            return [2 /*return*/, { success: true, error: "attachments_skipped" }];
                        }
                        catch (_o) {
                            return [2 /*return*/, { success: false, error: "storage_full" }];
                        }
                    }
                    globalDrafts[key] = draft;
                    try {
                        saveGlobalDrafts(globalDrafts);
                        return [2 /*return*/, { success: true }];
                    }
                    catch (err) {
                        console.error("[drafts] Failed to save draft:", err);
                        return [2 /*return*/, { success: false, error: "save_failed" }];
                    }
                    return [2 /*return*/];
            }
        });
    });
}
