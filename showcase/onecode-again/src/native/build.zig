const std = @import("std");

pub fn build(b: *std.Build) void {
    const target = b.standardTargetOptions(.{});
    const optimize = b.standardOptimizeOption(.{});

    const ghostty_dep = b.dependency("ghostty", .{
        .target = target,
        .optimize = optimize,
    });

    const lib = b.addLibrary(.{
        .name = "electrobun_vt",
        .linkage = .dynamic,
        .root_module = b.createModule(.{
            .root_source_file = b.path("terminal_vt.zig"),
            .target = target,
            .optimize = optimize,
            .imports = &.{
                .{ .name = "ghostty-vt", .module = ghostty_dep.module("ghostty-vt") },
            },
        }),
    });

    b.installArtifact(lib);
}
