"use strict";
/**
 * Parse current working directory from terminal output.
 * Shells can report the cwd via OSC 7 escape sequences.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCwd = parseCwd;
/**
 * Parse OSC 7 sequences to extract current working directory.
 * Format: \x1b]7;file://hostname/path\x07 or \x1b]7;file://hostname/path\x1b\\
 *
 * @param data - Terminal output data
 * @returns The parsed cwd path or null if not found
 */
function parseCwd(data) {
    // OSC 7 with BEL terminator: \x1b]7;file://hostname/path\x07
    // OSC 7 with ST terminator: \x1b]7;file://hostname/path\x1b\\
    var osc7Pattern = /\x1b\]7;file:\/\/[^\/]*([^\x07\x1b]+)(?:\x07|\x1b\\)/g;
    var match;
    var lastCwd = null;
    // Find all matches and return the last one (most recent)
    while ((match = osc7Pattern.exec(data)) !== null) {
        if (match[1]) {
            try {
                lastCwd = decodeURIComponent(match[1]);
            }
            catch (_a) {
                // Invalid URL encoding, use as-is
                lastCwd = match[1];
            }
        }
    }
    return lastCwd;
}
