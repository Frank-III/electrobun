"use strict";
/**
 * Files & Folders Mention Provider
 *
 * Wraps the existing tRPC files.search endpoint as a mention provider.
 * Provides file and folder search with icons and relevance sorting.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.filesProvider = void 0;
var trpc_1 = require("../../../lib/trpc");
var types_1 = require("../types");
/**
 * Extract directory path from full path for display
 */
function getTruncatedPath(path) {
    var parts = path.split("/");
    if (parts.length <= 1)
        return "";
    return parts.slice(0, -1).join("/");
}
/**
 * Get filename from path
 */
function getFilename(path) {
    return path.split("/").pop() || path;
}
/**
 * Files & Folders provider
 */
exports.filesProvider = (0, types_1.createMentionProvider)({
    id: "files",
    name: "Files & Folders",
    category: {
        label: "Files & Folders",
        priority: 100,
    },
    trigger: {
        char: "@",
        position: "standalone",
        allowSpaces: true,
    },
    priority: 100,
    search: function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, results, items, changedItems, existingPaths_1, uniqueChangedItems, timing, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = performance.now();
                        if (!context.projectPath) {
                            return [2 /*return*/, { items: [], hasMore: false, timing: 0 }];
                        }
                        // Check for abort
                        if (context.signal.aborted) {
                            return [2 /*return*/, { items: [], hasMore: false, timing: 0 }];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, trpc_1.trpcClient.files.search.query({
                                projectPath: context.projectPath,
                                query: context.query,
                                limit: context.limit,
                            })
                            // Map to MentionItem format
                        ];
                    case 2:
                        results = _a.sent();
                        items = results.map(function (result) { return ({
                            id: result.id,
                            label: result.label,
                            description: result.path,
                            icon: result.type === "folder" ? "folder" : undefined,
                            data: {
                                path: result.path,
                                type: result.type,
                                repository: result.repository,
                            },
                            metadata: {
                                type: result.type,
                                truncatedPath: getTruncatedPath(result.path),
                                repository: result.repository,
                            },
                        }); });
                        // Add changed files at the top if available
                        if (context.changedFiles && context.changedFiles.length > 0 && !context.query) {
                            changedItems = context.changedFiles.map(function (file) { return ({
                                id: "file:local:".concat(file.path),
                                label: getFilename(file.path),
                                description: file.path,
                                data: {
                                    path: file.path,
                                    type: "file",
                                    repository: "local",
                                    additions: file.additions,
                                    deletions: file.deletions,
                                },
                                priority: 200, // Higher priority for changed files
                                metadata: {
                                    type: "file",
                                    truncatedPath: getTruncatedPath(file.path),
                                    repository: "local",
                                    diffStats: {
                                        additions: file.additions,
                                        deletions: file.deletions,
                                    },
                                },
                            }); });
                            existingPaths_1 = new Set(items.map(function (i) { return i.data.path; }));
                            uniqueChangedItems = changedItems.filter(function (i) { return !existingPaths_1.has(i.data.path); });
                            items.unshift.apply(items, uniqueChangedItems);
                        }
                        timing = performance.now() - startTime;
                        return [2 /*return*/, {
                                items: items,
                                hasMore: results.length === context.limit,
                                totalCount: results.length,
                                timing: timing,
                            }];
                    case 3:
                        error_1 = _a.sent();
                        console.error("[FilesProvider] Search error:", error_1);
                        return [2 /*return*/, {
                                items: [],
                                hasMore: false,
                                warning: "Failed to search files",
                                timing: performance.now() - startTime,
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    },
    serialize: function (item) {
        return "@[".concat(item.id, "]");
    },
    deserialize: function (token) {
        try {
            // Check if this token belongs to us
            if (!token.startsWith(types_1.MENTION_PREFIXES.FILE) && !token.startsWith(types_1.MENTION_PREFIXES.FOLDER)) {
                return null;
            }
            // Parse: file:repo:path or folder:repo:path
            var isFolder = token.startsWith(types_1.MENTION_PREFIXES.FOLDER);
            var prefix = isFolder ? types_1.MENTION_PREFIXES.FOLDER : types_1.MENTION_PREFIXES.FILE;
            var rest = token.slice(prefix.length);
            var colonIndex = rest.indexOf(":");
            if (colonIndex === -1) {
                // No repo separator, assume local
                var path_1 = rest;
                return {
                    id: token,
                    label: getFilename(path_1),
                    description: path_1,
                    data: {
                        path: path_1,
                        type: isFolder ? "folder" : "file",
                        repository: "local",
                    },
                    metadata: {
                        type: isFolder ? "folder" : "file",
                        truncatedPath: getTruncatedPath(path_1),
                        repository: "local",
                    },
                };
            }
            var repository = rest.slice(0, colonIndex);
            var path = rest.slice(colonIndex + 1);
            return {
                id: token,
                label: getFilename(path),
                description: path,
                data: {
                    path: path,
                    type: isFolder ? "folder" : "file",
                    repository: repository,
                },
                metadata: {
                    type: isFolder ? "folder" : "file",
                    truncatedPath: getTruncatedPath(path),
                    repository: repository,
                },
            };
        }
        catch (error) {
            console.warn("[FilesProvider] Failed to deserialize token: ".concat(token), error);
            return null;
        }
    },
    isAvailable: function (context) {
        // Files provider is available when we have a project path
        return !!context.projectPath;
    },
});
exports.default = exports.filesProvider;
