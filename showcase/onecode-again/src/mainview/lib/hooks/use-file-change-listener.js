"use strict";
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
exports.useFileChangeListener = useFileChangeListener;
exports.useGitWatcher = useGitWatcher;
var react_1 = require("react");
var react_query_1 = require("@tanstack/react-query");
/**
 * Hook that listens for file changes from Claude Write/Edit tools
 * and invalidates the git status query to trigger a refetch
 */
function useFileChangeListener(worktreePath) {
    var queryClient = (0, react_query_1.useQueryClient)();
    (0, react_1.useEffect)(function () {
        var _a;
        if (!worktreePath)
            return;
        var cleanup = (_a = window.desktopApi) === null || _a === void 0 ? void 0 : _a.onFileChanged(function (data) {
            // Check if the changed file is within our worktree
            if (data.filePath.startsWith(worktreePath)) {
                // Invalidate git status queries to trigger refetch
                queryClient.invalidateQueries({
                    queryKey: [["changes", "getStatus"]],
                });
            }
        });
        return function () {
            cleanup === null || cleanup === void 0 ? void 0 : cleanup();
        };
    }, [worktreePath, queryClient]);
}
/**
 * Hook that subscribes to the GitWatcher for real-time file system monitoring.
 * Uses chokidar on the main process for efficient file watching.
 * Automatically invalidates git status queries when files change.
 */
function useGitWatcher(worktreePath) {
    var _this = this;
    var queryClient = (0, react_query_1.useQueryClient)();
    var isSubscribedRef = (0, react_1.useRef)(false);
    (0, react_1.useEffect)(function () {
        var _a;
        if (!worktreePath)
            return;
        // Subscribe to git watcher on main process
        var subscribe = function () { return __awaiter(_this, void 0, void 0, function () {
            var error_1;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, ((_a = window.desktopApi) === null || _a === void 0 ? void 0 : _a.subscribeToGitWatcher(worktreePath))];
                    case 1:
                        _b.sent();
                        isSubscribedRef.current = true;
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _b.sent();
                        console.error("[useGitWatcher] Failed to subscribe:", error_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        subscribe();
        // Listen for git status changes from the watcher
        var cleanup = (_a = window.desktopApi) === null || _a === void 0 ? void 0 : _a.onGitStatusChanged(function (data) {
            if (data.worktreePath === worktreePath) {
                // Invalidate git status queries to trigger refetch
                queryClient.invalidateQueries({
                    queryKey: [["changes", "getStatus"]],
                });
                // Also invalidate parsed diff if files were modified
                var hasModifiedFiles = data.changes.some(function (change) { return change.type === "change" || change.type === "add"; });
                if (hasModifiedFiles) {
                    queryClient.invalidateQueries({
                        queryKey: [["changes", "getParsedDiff"]],
                    });
                }
            }
        });
        return function () {
            var _a;
            cleanup === null || cleanup === void 0 ? void 0 : cleanup();
            // Unsubscribe from git watcher
            if (isSubscribedRef.current) {
                (_a = window.desktopApi) === null || _a === void 0 ? void 0 : _a.unsubscribeFromGitWatcher(worktreePath).catch(function (error) {
                    console.error("[useGitWatcher] Failed to unsubscribe:", error);
                });
                isSubscribedRef.current = false;
            }
        };
    }, [worktreePath, queryClient]);
}
