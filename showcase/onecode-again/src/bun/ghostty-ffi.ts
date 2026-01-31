import { dlopen, FFIType, suffix, CString, ptr } from "bun:ffi";
import { join } from "path";

const libPath = join(
  import.meta.dir,
  "..",
  "native",
  "zig-out",
  "lib",
  `libelectrobun_vt.${suffix}`,
);

const lib = dlopen(libPath, {
  vt_create: {
    args: [FFIType.u16, FFIType.u16, FFIType.u32],
    returns: FFIType.ptr,
  },
  vt_destroy: {
    args: [FFIType.ptr],
    returns: FFIType.void,
  },
  vt_feed: {
    args: [FFIType.ptr, FFIType.ptr, FFIType.u32],
    returns: FFIType.void,
  },
  vt_resize: {
    args: [FFIType.ptr, FFIType.u16, FFIType.u16],
    returns: FFIType.void,
  },
  vt_cursor_x: {
    args: [FFIType.ptr],
    returns: FFIType.u16,
  },
  vt_cursor_y: {
    args: [FFIType.ptr],
    returns: FFIType.u16,
  },
  vt_get_screen_text: {
    args: [FFIType.ptr],
    returns: FFIType.ptr,
  },
  vt_free_string: {
    args: [FFIType.ptr],
    returns: FFIType.void,
  },
  vt_get_row_text: {
    args: [FFIType.ptr, FFIType.u16, FFIType.ptr, FFIType.u32],
    returns: FFIType.u32,
  },
  vt_get_cell_codepoint: {
    args: [FFIType.ptr, FFIType.u16, FFIType.u16],
    returns: FFIType.u32,
  },
  vt_scroll: {
    args: [FFIType.ptr, FFIType.i32],
    returns: FFIType.void,
  },
  vt_scroll_to_bottom: {
    args: [FFIType.ptr],
    returns: FFIType.void,
  },
  vt_is_at_bottom: {
    args: [FFIType.ptr],
    returns: FFIType.bool,
  },
});

const { symbols } = lib;
const textDecoder = new TextDecoder();
const MAX_ROW_BYTES = 256 * 1024;

export class GhosttyTerminal {
  private handle: ReturnType<typeof symbols.vt_create>;

  constructor(cols: number, rows: number, maxScrollback = 10_000) {
    this.handle = symbols.vt_create(cols, rows, maxScrollback);
    if (!this.handle) throw new Error("Failed to create ghostty-vt terminal");
  }

  feed(data: string | Uint8Array) {
    const buf = typeof data === "string" ? Buffer.from(data) : data;
    symbols.vt_feed(this.handle, ptr(buf), buf.length);
  }

  resize(cols: number, rows: number) {
    symbols.vt_resize(this.handle, cols, rows);
  }

  get cursorX(): number {
    return symbols.vt_cursor_x(this.handle);
  }

  get cursorY(): number {
    return symbols.vt_cursor_y(this.handle);
  }

  getScreenText(): string {
    const cstr = symbols.vt_get_screen_text(this.handle);
    if (!cstr) return "";
    const result = new CString(cstr).toString();
    symbols.vt_free_string(cstr);
    return result;
  }

  getRowText(row: number): string {
    let buf = new Uint8Array(4096);
    let len = symbols.vt_get_row_text(this.handle, row, ptr(buf), buf.length);
    while (len >= buf.length && buf.length < MAX_ROW_BYTES) {
      const nextSize = Math.min(buf.length * 2, MAX_ROW_BYTES);
      buf = new Uint8Array(nextSize);
      len = symbols.vt_get_row_text(this.handle, row, ptr(buf), buf.length);
    }
    return textDecoder.decode(buf.subarray(0, len));
  }

  getCellCodepoint(row: number, col: number): number {
    return symbols.vt_get_cell_codepoint(this.handle, row, col);
  }

  scroll(delta: number) {
    symbols.vt_scroll(this.handle, delta);
  }

  scrollToBottom() {
    symbols.vt_scroll_to_bottom(this.handle);
  }

  get isAtBottom(): boolean {
    return symbols.vt_is_at_bottom(this.handle);
  }

  destroy() {
    symbols.vt_destroy(this.handle);
  }
}
