const std = @import("std");

pub fn build(b: *std.Build) void {
    const target = b.standardTargetOptions(.{});
    const optimize = b.standardOptimizeOption(.{});

    const ghostty_dep = b.dependency("ghostty", .{
        .target = target,
        .optimize = optimize,
    });

    const lib = b.addSharedLibrary(.{
        .name = "electrobun_vt",
        .root_source_file = b.path("terminal_vt.zig"),
        .target = target,
        .optimize = optimize,
    });

    lib.root_module.addImport("ghostty-vt", ghostty_dep.module("ghostty-vt"));
    b.installArtifact(lib);
}
