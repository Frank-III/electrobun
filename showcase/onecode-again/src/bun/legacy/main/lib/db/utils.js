"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createId = createId;
/**
 * Generate a unique ID (cuid-like)
 */
function createId() {
    var timestamp = Date.now().toString(36);
    var randomPart = Math.random().toString(36).substring(2, 10);
    return "".concat(timestamp).concat(randomPart);
}
