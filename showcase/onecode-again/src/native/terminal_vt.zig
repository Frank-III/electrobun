const std = @import("std");
const ghostty = @import("ghostty-vt");

const Allocator = std.mem.Allocator;

const TerminalState = struct {
    terminal: ghostty.Terminal,
    alloc: Allocator,
};

export fn vt_create(cols: u16, rows: u16, max_scrollback: u32) callconv(.c) ?*anyopaque {
    const alloc = std.heap.c_allocator;
    const state = alloc.create(TerminalState) catch return null;

    state.terminal = ghostty.Terminal.init(alloc, .{
        .cols = cols,
        .rows = rows,
        .max_scrollback = max_scrollback,
    }) catch {
        alloc.destroy(state);
        return null;
    };

    state.alloc = alloc;
    return @ptrCast(state);
}

export fn vt_destroy(handle: ?*anyopaque) callconv(.c) void {
    const state = unwrap(handle) orelse return;
    state.terminal.deinit(state.alloc);
    state.alloc.destroy(state);
}

export fn vt_feed(handle: ?*anyopaque, data: [*]const u8, len: u32) callconv(.c) void {
    const state = unwrap(handle) orelse return;
    var stream = state.terminal.vtStream();
    stream.nextSlice(data[0..len]) catch {};
}

export fn vt_resize(handle: ?*anyopaque, cols: u16, rows: u16) callconv(.c) void {
    const state = unwrap(handle) orelse return;
    state.terminal.resize(state.alloc, cols, rows) catch {};
}

export fn vt_cursor_x(handle: ?*anyopaque) callconv(.c) u16 {
    const state = unwrap(handle) orelse return 0;
    return state.terminal.screens.active.cursor.x;
}

export fn vt_cursor_y(handle: ?*anyopaque) callconv(.c) u16 {
    const state = unwrap(handle) orelse return 0;
    return state.terminal.screens.active.cursor.y;
}

export fn vt_get_row_text(
    handle: ?*anyopaque,
    row: u16,
    buf: [*]u8,
    buf_len: u32,
) callconv(.c) u32 {
    const state = unwrap(handle) orelse return 0;
    const t = &state.terminal;

    const full = t.plainString(state.alloc) catch return 0;
    defer state.alloc.free(full);

    var line_start: usize = 0;
    var current_row: u16 = 0;
    for (full, 0..) |c, i| {
        if (c == '\n') {
            if (current_row == row) {
                const line = full[line_start..i];
                const copy_len = @min(line.len, buf_len);
                @memcpy(buf[0..copy_len], line[0..copy_len]);
                return @intCast(copy_len);
            }
            current_row += 1;
            line_start = i + 1;
        }
    }

    if (current_row == row) {
        const line = full[line_start..];
        const copy_len = @min(line.len, buf_len);
        @memcpy(buf[0..copy_len], line[0..copy_len]);
        return @intCast(copy_len);
    }

    return 0;
}

export fn vt_get_screen_text(handle: ?*anyopaque) callconv(.c) ?[*:0]u8 {
    const state = unwrap(handle) orelse return null;
    const text = state.terminal.plainString(state.alloc) catch return null;
    defer state.alloc.free(text);

    const c_str = std.heap.c_allocator.allocSentinel(u8, text.len, 0) catch return null;
    @memcpy(c_str[0..text.len], text);
    return c_str;
}

export fn vt_free_string(ptr: ?[*:0]u8) callconv(.c) void {
    if (ptr) |p| {
        var len: usize = 0;
        while (p[len] != 0) : (len += 1) {}
        std.heap.c_allocator.free(p[0 .. len + 1]);
    }
}

export fn vt_get_cell_codepoint(handle: ?*anyopaque, row: u16, col: u16) callconv(.c) u32 {
    const state = unwrap(handle) orelse return 0;
    const result = state.terminal.screens.active.pages.getCell(.{
        .active = .{ .x = col, .y = row },
    }) orelse return 0;
    return @intCast(result.cell.codepoint());
}

export fn vt_scroll(handle: ?*anyopaque, delta: i32) callconv(.c) void {
    const state = unwrap(handle) orelse return;
    state.terminal.screens.active.scroll(.{ .delta_row = delta });
}

export fn vt_scroll_to_bottom(handle: ?*anyopaque) callconv(.c) void {
    const state = unwrap(handle) orelse return;
    state.terminal.screens.active.scroll(.active);
}

export fn vt_is_at_bottom(handle: ?*anyopaque) callconv(.c) bool {
    const state = unwrap(handle) orelse return true;
    return state.terminal.screens.active.viewportIsBottom();
}

fn unwrap(handle: ?*anyopaque) ?*TerminalState {
    const ptr = handle orelse return null;
    return @ptrCast(@alignCast(ptr));
}
