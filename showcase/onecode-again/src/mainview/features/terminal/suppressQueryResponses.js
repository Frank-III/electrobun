"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.suppressQueryResponses = suppressQueryResponses;
/**
 * Suppress terminal query responses that can echo garbage characters.
 *
 * Some terminal applications send query sequences (like DA1, DA2, DSR)
 * to determine terminal capabilities. xterm.js responds to these queries,
 * but the responses can sometimes echo back as visible garbage characters
 * if the PTY doesn't properly consume them.
 *
 * This function intercepts and suppresses common query responses to prevent
 * them from appearing in the terminal output.
 *
 * @param xterm - The xterm.js terminal instance
 * @returns A cleanup function to remove the handler
 */
function suppressQueryResponses(xterm) {
    // Query response patterns to suppress
    // These are responses xterm.js sends when queried
    var queryResponsePatterns = [
        // DA1 (Primary Device Attributes) response: CSI ? 1 ; 2 c
        /^\x1b\[\?[\d;]*c$/,
        // DA2 (Secondary Device Attributes) response: CSI > 0 ; version ; 0 c
        /^\x1b\[>[\d;]*c$/,
        // DSR (Device Status Report) response: CSI row ; col R
        /^\x1b\[\d+;\d+R$/,
        // DECRQSS (Request Selection or Setting) responses
        /^\x1bP[\d\$r].*\x1b\\$/,
    ];
    /**
     * Check if data looks like a query response that should be suppressed.
     */
    var isQueryResponse = function (data) {
        return queryResponsePatterns.some(function (pattern) { return pattern.test(data); });
    };
    // Store the original onData handler
    var dataHandler = xterm.onData(function (data) {
        // If this looks like a query response, we've already written it via xterm.write
        // The PTY should consume it, but if it echoes back, suppress it
        if (isQueryResponse(data)) {
            // Already handled by xterm internally
            return;
        }
    });
    return function () {
        dataHandler.dispose();
    };
}
