"use strict";
/**
 * Terminal escape sequence filter for handling special sequences like clear scrollback.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.containsClearScrollbackSequence = containsClearScrollbackSequence;
exports.extractContentAfterClear = extractContentAfterClear;
// ESC [ 3 J - Clear scrollback buffer (used by Cmd+K / clear command)
var CLEAR_SCROLLBACK_SEQUENCES = [
    "\x1b[3J", // Standard clear scrollback
    "\x1b[2J\x1b[3J", // Clear screen + clear scrollback
    "\x1b[H\x1b[2J\x1b[3J", // Move cursor home + clear screen + clear scrollback
];
/**
 * Check if the data contains a clear scrollback sequence.
 * This is typically sent when user presses Cmd+K or runs 'clear' command.
 */
function containsClearScrollbackSequence(data) {
    return CLEAR_SCROLLBACK_SEQUENCES.some(function (seq) { return data.includes(seq); });
}
/**
 * Extract content after the clear scrollback sequence.
 * Returns the remaining content that should be kept after the clear.
 */
function extractContentAfterClear(data) {
    // Find the last occurrence of any clear sequence
    var lastIndex = -1;
    var seqLength = 0;
    for (var _i = 0, CLEAR_SCROLLBACK_SEQUENCES_1 = CLEAR_SCROLLBACK_SEQUENCES; _i < CLEAR_SCROLLBACK_SEQUENCES_1.length; _i++) {
        var seq = CLEAR_SCROLLBACK_SEQUENCES_1[_i];
        var idx = data.lastIndexOf(seq);
        if (idx > lastIndex) {
            lastIndex = idx;
            seqLength = seq.length;
        }
    }
    if (lastIndex === -1) {
        return data;
    }
    // Return everything after the clear sequence
    return data.slice(lastIndex + seqLength);
}
