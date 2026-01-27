"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GhosttyTerminal = void 0;
var bun_ffi_1 = require("bun:ffi");
var path_1 = require("path");
var libPath = (0, path_1.join)(import.meta.dir, "..", "native", "zig-out", "lib", "libelectrobun_vt.".concat(bun_ffi_1.suffix));
var lib = (0, bun_ffi_1.dlopen)(libPath, {
    vt_create: {
        args: [bun_ffi_1.FFIType.u16, bun_ffi_1.FFIType.u16, bun_ffi_1.FFIType.u32],
        returns: bun_ffi_1.FFIType.ptr,
    },
    vt_destroy: {
        args: [bun_ffi_1.FFIType.ptr],
        returns: bun_ffi_1.FFIType.void,
    },
    vt_feed: {
        args: [bun_ffi_1.FFIType.ptr, bun_ffi_1.FFIType.ptr, bun_ffi_1.FFIType.u32],
        returns: bun_ffi_1.FFIType.void,
    },
    vt_resize: {
        args: [bun_ffi_1.FFIType.ptr, bun_ffi_1.FFIType.u16, bun_ffi_1.FFIType.u16],
        returns: bun_ffi_1.FFIType.void,
    },
    vt_cursor_x: {
        args: [bun_ffi_1.FFIType.ptr],
        returns: bun_ffi_1.FFIType.u16,
    },
    vt_cursor_y: {
        args: [bun_ffi_1.FFIType.ptr],
        returns: bun_ffi_1.FFIType.u16,
    },
    vt_get_screen_text: {
        args: [bun_ffi_1.FFIType.ptr],
        returns: bun_ffi_1.FFIType.ptr,
    },
    vt_free_string: {
        args: [bun_ffi_1.FFIType.ptr],
        returns: bun_ffi_1.FFIType.void,
    },
    vt_get_row_text: {
        args: [bun_ffi_1.FFIType.ptr, bun_ffi_1.FFIType.u16, bun_ffi_1.FFIType.ptr, bun_ffi_1.FFIType.u32],
        returns: bun_ffi_1.FFIType.u32,
    },
    vt_get_cell_codepoint: {
        args: [bun_ffi_1.FFIType.ptr, bun_ffi_1.FFIType.u16, bun_ffi_1.FFIType.u16],
        returns: bun_ffi_1.FFIType.u32,
    },
    vt_scroll: {
        args: [bun_ffi_1.FFIType.ptr, bun_ffi_1.FFIType.i32],
        returns: bun_ffi_1.FFIType.void,
    },
    vt_scroll_to_bottom: {
        args: [bun_ffi_1.FFIType.ptr],
        returns: bun_ffi_1.FFIType.void,
    },
    vt_is_at_bottom: {
        args: [bun_ffi_1.FFIType.ptr],
        returns: bun_ffi_1.FFIType.bool,
    },
});
var symbols = lib.symbols;
var GhosttyTerminal = /** @class */ (function () {
    function GhosttyTerminal(cols, rows, maxScrollback) {
        if (maxScrollback === void 0) { maxScrollback = 10000; }
        this.handle = symbols.vt_create(cols, rows, maxScrollback);
        if (!this.handle)
            throw new Error("Failed to create ghostty-vt terminal");
    }
    GhosttyTerminal.prototype.feed = function (data) {
        var buf = typeof data === "string" ? Buffer.from(data) : data;
        symbols.vt_feed(this.handle, (0, bun_ffi_1.ptr)(buf), buf.length);
    };
    GhosttyTerminal.prototype.resize = function (cols, rows) {
        symbols.vt_resize(this.handle, cols, rows);
    };
    Object.defineProperty(GhosttyTerminal.prototype, "cursorX", {
        get: function () {
            return symbols.vt_cursor_x(this.handle);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GhosttyTerminal.prototype, "cursorY", {
        get: function () {
            return symbols.vt_cursor_y(this.handle);
        },
        enumerable: false,
        configurable: true
    });
    GhosttyTerminal.prototype.getScreenText = function () {
        var cstr = symbols.vt_get_screen_text(this.handle);
        if (!cstr)
            return "";
        var result = new bun_ffi_1.CString(cstr).toString();
        symbols.vt_free_string(cstr);
        return result;
    };
    GhosttyTerminal.prototype.getRowText = function (row) {
        var buf = new Uint8Array(4096);
        var len = symbols.vt_get_row_text(this.handle, row, (0, bun_ffi_1.ptr)(buf), buf.length);
        return new TextDecoder().decode(buf.subarray(0, len));
    };
    GhosttyTerminal.prototype.getCellCodepoint = function (row, col) {
        return symbols.vt_get_cell_codepoint(this.handle, row, col);
    };
    GhosttyTerminal.prototype.scroll = function (delta) {
        symbols.vt_scroll(this.handle, delta);
    };
    GhosttyTerminal.prototype.scrollToBottom = function () {
        symbols.vt_scroll_to_bottom(this.handle);
    };
    Object.defineProperty(GhosttyTerminal.prototype, "isAtBottom", {
        get: function () {
            return symbols.vt_is_at_bottom(this.handle);
        },
        enumerable: false,
        configurable: true
    });
    GhosttyTerminal.prototype.destroy = function () {
        symbols.vt_destroy(this.handle);
    };
    return GhosttyTerminal;
}());
exports.GhosttyTerminal = GhosttyTerminal;
