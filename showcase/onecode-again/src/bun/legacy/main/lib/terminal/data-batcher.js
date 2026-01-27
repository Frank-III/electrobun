"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataBatcher = void 0;
var node_string_decoder_1 = require("node:string_decoder");
/**
 * Batches terminal data to reduce IPC overhead between main and renderer processes.
 * Based on Hyper terminal's DataBatcher implementation.
 *
 * This minimizes the number of IPC messages by:
 * 1. Time-based batching: Flushes every BATCH_DURATION_MS (16ms = ~60fps)
 * 2. Size-based batching: Flushes when batch exceeds BATCH_MAX_SIZE (200KB)
 * 3. Proper UTF-8 handling: Uses StringDecoder to handle multi-byte characters
 *    that may be split across data chunks
 */
var BATCH_DURATION_MS = 16;
var BATCH_MAX_SIZE = 200 * 1024;
var DataBatcher = /** @class */ (function () {
    function DataBatcher(onFlush) {
        this.buffer = "";
        this.timeout = null;
        this.decoder = new node_string_decoder_1.StringDecoder("utf8");
        this.onFlush = onFlush;
    }
    /**
     * Add data to the batch. Data will be flushed either when:
     * - BATCH_DURATION_MS has elapsed since the first write
     * - Buffer size exceeds BATCH_MAX_SIZE
     */
    DataBatcher.prototype.write = function (data) {
        var _this = this;
        var decoded = typeof data === "string" ? data : this.decoder.write(data);
        this.buffer += decoded;
        if (this.buffer.length >= BATCH_MAX_SIZE) {
            this.flush();
            return;
        }
        if (this.timeout === null) {
            this.timeout = setTimeout(function () { return _this.flush(); }, BATCH_DURATION_MS);
        }
    };
    /**
     * Flush any buffered data immediately.
     */
    DataBatcher.prototype.flush = function () {
        if (this.timeout !== null) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
        if (this.buffer.length > 0) {
            this.onFlush(this.buffer);
            this.buffer = "";
        }
    };
    /**
     * Dispose of the batcher, flushing any remaining data.
     * Calls decoder.end() to handle any trailing incomplete sequences.
     */
    DataBatcher.prototype.dispose = function () {
        this.flush();
        // Flush any incomplete multi-byte sequences
        var remaining = this.decoder.end();
        if (remaining) {
            this.onFlush(remaining);
        }
    };
    return DataBatcher;
}());
exports.DataBatcher = DataBatcher;
