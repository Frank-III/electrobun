"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useChangesStore = void 0;
var zustand_1 = require("zustand");
var middleware_1 = require("zustand/middleware");
var WindowContext_1 = require("../../contexts/WindowContext");
var initialState = {
    selectedFiles: {},
    viewMode: "side-by-side",
    fileListViewMode: "grouped",
    expandedSections: {
        "against-base": true,
        committed: true,
        staged: true,
        unstaged: true,
    },
    baseBranch: null,
    showRenderedMarkdown: {},
};
exports.useChangesStore = (0, zustand_1.create)()((0, middleware_1.devtools)((0, middleware_1.persist)(function (set, get) { return (__assign(__assign({}, initialState), { selectFile: function (worktreePath, file, category, commitHash) {
        var _a;
        var selectedFiles = get().selectedFiles;
        set({
            selectedFiles: __assign(__assign({}, selectedFiles), (_a = {}, _a[worktreePath] = file
                ? {
                    file: file,
                    category: category !== null && category !== void 0 ? category : "against-base",
                    commitHash: commitHash !== null && commitHash !== void 0 ? commitHash : null,
                }
                : null, _a)),
        });
    }, getSelectedFile: function (worktreePath) {
        var _a;
        return (_a = get().selectedFiles[worktreePath]) !== null && _a !== void 0 ? _a : null;
    }, setViewMode: function (mode) {
        set({ viewMode: mode });
    }, setFileListViewMode: function (mode) {
        set({ fileListViewMode: mode });
    }, toggleSection: function (section) {
        var _a;
        var expandedSections = get().expandedSections;
        set({
            expandedSections: __assign(__assign({}, expandedSections), (_a = {}, _a[section] = !expandedSections[section], _a)),
        });
    }, setSectionExpanded: function (section, expanded) {
        var _a;
        var expandedSections = get().expandedSections;
        set({
            expandedSections: __assign(__assign({}, expandedSections), (_a = {}, _a[section] = expanded, _a)),
        });
    }, setBaseBranch: function (branch) {
        set({ baseBranch: branch });
    }, toggleRenderedMarkdown: function (worktreePath) {
        var _a;
        var showRenderedMarkdown = get().showRenderedMarkdown;
        set({
            showRenderedMarkdown: __assign(__assign({}, showRenderedMarkdown), (_a = {}, _a[worktreePath] = !showRenderedMarkdown[worktreePath], _a)),
        });
    }, getShowRenderedMarkdown: function (worktreePath) {
        var _a;
        return (_a = get().showRenderedMarkdown[worktreePath]) !== null && _a !== void 0 ? _a : false;
    }, reset: function (worktreePath) {
        var _a;
        var selectedFiles = get().selectedFiles;
        set({
            selectedFiles: __assign(__assign({}, selectedFiles), (_a = {}, _a[worktreePath] = null, _a)),
        });
    } })); }, {
    name: "".concat((0, WindowContext_1.getWindowId)(), ":changes-store"),
    partialize: function (state) { return ({
        selectedFiles: state.selectedFiles,
        viewMode: state.viewMode,
        fileListViewMode: state.fileListViewMode,
        expandedSections: state.expandedSections,
        baseBranch: state.baseBranch,
        showRenderedMarkdown: state.showRenderedMarkdown,
    }); },
    // Migrate from legacy storage key if window-scoped key doesn't exist
    onRehydrateStorage: function () {
        var windowKey = "".concat((0, WindowContext_1.getWindowId)(), ":changes-store");
        var legacyKey = "changes-store";
        // Skip if already have data for this window
        if (localStorage.getItem(windowKey)) {
            return undefined;
        }
        // Migration 1: Check for old numeric window ID keys (e.g., "1:changes-store")
        // Only migrate for "main" window
        if (windowKey.startsWith("main:")) {
            for (var i = 0; i < localStorage.length; i++) {
                var storageKey = localStorage.key(i);
                if (!storageKey)
                    continue;
                var match = storageKey.match(/^(\d+):changes-store$/);
                if (match) {
                    var numericData = localStorage.getItem(storageKey);
                    if (numericData) {
                        localStorage.setItem(windowKey, numericData);
                        console.log("[ChangesStore] Migrated from numeric ID: ".concat(storageKey, " to ").concat(windowKey));
                        return undefined;
                    }
                }
            }
        }
        // Migration 2: Check legacy key (without window prefix)
        if (localStorage.getItem(legacyKey)) {
            var legacyData = localStorage.getItem(legacyKey);
            if (legacyData) {
                localStorage.setItem(windowKey, legacyData);
                console.log("[ChangesStore] Migrated ".concat(legacyKey, " to ").concat(windowKey));
            }
        }
        return undefined;
    },
}), { name: "ChangesStore" }));
