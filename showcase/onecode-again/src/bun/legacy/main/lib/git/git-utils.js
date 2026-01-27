"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUpstreamMissingError = isUpstreamMissingError;
/**
 * Check if the error message indicates the upstream branch is missing/deleted
 */
function isUpstreamMissingError(message) {
    return (message.includes("no such ref was fetched") ||
        message.includes("no tracking information") ||
        message.includes("couldn't find remote ref"));
}
