"use strict";
/**
 * Queue utilities for managing message queue in agents chat
 * Adapted from canvas chat queue implementation
 */
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateQueueId = generateQueueId;
exports.createQueueItem = createQueueItem;
exports.getNextQueueItem = getNextQueueItem;
exports.removeQueueItem = removeQueueItem;
exports.updateQueueItemStatus = updateQueueItemStatus;
exports.toQueuedImage = toQueuedImage;
exports.toQueuedFile = toQueuedFile;
exports.toQueuedTextContext = toQueuedTextContext;
exports.toQueuedDiffTextContext = toQueuedDiffTextContext;
exports.createTextPreview = createTextPreview;
function generateQueueId() {
    return "queue_".concat(Date.now(), "_").concat(Math.random().toString(36).substring(2, 11));
}
function createQueueItem(id, message, images, files, textContexts, diffTextContexts) {
    return {
        id: id,
        message: message,
        images: images && images.length > 0 ? images : undefined,
        files: files && files.length > 0 ? files : undefined,
        textContexts: textContexts && textContexts.length > 0 ? textContexts : undefined,
        diffTextContexts: diffTextContexts && diffTextContexts.length > 0 ? diffTextContexts : undefined,
        timestamp: new Date(),
        status: "pending",
    };
}
function getNextQueueItem(queue) {
    return queue.find(function (item) { return item.status === "pending"; }) || null;
}
function removeQueueItem(queue, itemId) {
    return queue.filter(function (item) { return item.id !== itemId; });
}
function updateQueueItemStatus(queue, itemId, status) {
    return queue.map(function (item) {
        return item.id === itemId ? __assign(__assign({}, item), { status: status }) : item;
    });
}
// Helper to convert UploadedImage to QueuedImage
function toQueuedImage(img) {
    return {
        id: img.id,
        url: img.url,
        mediaType: img.mediaType || "image/png",
        filename: img.filename,
        base64Data: img.base64Data,
    };
}
// Helper to convert UploadedFile to QueuedFile
function toQueuedFile(file) {
    return {
        id: file.id,
        url: file.url,
        filename: file.filename,
        mediaType: file.type,
        size: file.size,
    };
}
// Helper to convert SelectedTextContext to QueuedTextContext
function toQueuedTextContext(ctx) {
    return {
        id: ctx.id,
        text: ctx.text,
        sourceMessageId: ctx.sourceMessageId,
    };
}
// Helper to convert DiffTextContext to QueuedDiffTextContext
function toQueuedDiffTextContext(ctx) {
    return {
        id: ctx.id,
        text: ctx.text,
        filePath: ctx.filePath,
        lineNumber: ctx.lineNumber,
        lineType: ctx.lineType,
    };
}
// Helper to create a truncated preview from text
function createTextPreview(text, maxLength) {
    if (maxLength === void 0) { maxLength = 50; }
    var trimmed = text.trim().replace(/\s+/g, " ");
    if (trimmed.length <= maxLength)
        return trimmed;
    return trimmed.slice(0, maxLength) + "...";
}
