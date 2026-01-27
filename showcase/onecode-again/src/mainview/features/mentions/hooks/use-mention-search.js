"use strict";
/**
 * useMentionSearch Hook
 *
 * React hook for searching mentions with debouncing, cancellation,
 * and stale-while-revalidate pattern to prevent UI flickering.
 *
 * Key features:
 * - Stale data shown while fetching new results (no flicker)
 * - No loading indicators (search feels instant/local)
 * - Proper abort controller handling
 * - No state updates after unmount
 */
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
exports.useMentionSearch = useMentionSearch;
var react_1 = require("react");
var search_1 = require("../search");
/**
 * Debounce delay before starting search
 * Matches agents-file-mention.tsx for consistency
 */
var DEFAULT_DEBOUNCE_MS = 200;
/**
 * Hook for searching mentions with stale-while-revalidate pattern
 *
 * @example
 * ```tsx
 * const { items } = useMentionSearch(query, {
 *   projectPath: '/path/to/project',
 *   trigger: '@',
 * })
 *
 * // Items always available (stale data shown during fetch)
 * return (
 *   <div>
 *     {items.map(item => <Item key={item.id} {...item} />)}
 *   </div>
 * )
 * ```
 */
function useMentionSearch(query, options) {
    var _this = this;
    var _a, _b, _c;
    if (options === void 0) { options = {}; }
    var _d = options.trigger, trigger = _d === void 0 ? "@" : _d, projectPath = options.projectPath, sessionId = options.sessionId, _e = options.debounceMs, debounceMs = _e === void 0 ? DEFAULT_DEBOUNCE_MS : _e, _f = options.enabled, enabled = _f === void 0 ? true : _f, providerIds = options.providerIds, changedFiles = options.changedFiles, mcpTools = options.mcpTools, mcpServers = options.mcpServers;
    // Current result
    var _g = (0, react_1.useState)(null), result = _g[0], setResult = _g[1];
    // Previous result for stale-while-revalidate
    var _h = (0, react_1.useState)(null), previousResult = _h[0], setPreviousResult = _h[1];
    var _j = (0, react_1.useState)(null), error = _j[0], setError = _j[1];
    // Refs for cleanup and tracking
    var debounceRef = (0, react_1.useRef)(null);
    var abortRef = (0, react_1.useRef)(null);
    var mountedRef = (0, react_1.useRef)(true);
    var resultRef = (0, react_1.useRef)(null);
    // Keep resultRef in sync with result state
    resultRef.current = result;
    // Track mounted state
    (0, react_1.useEffect)(function () {
        mountedRef.current = true;
        return function () {
            mountedRef.current = false;
        };
    }, []);
    // Clear all results
    var clear = (0, react_1.useCallback)(function () {
        setResult(null);
        setPreviousResult(null);
        setError(null);
        // Clear timeouts
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
            debounceRef.current = null;
        }
        if (abortRef.current) {
            abortRef.current.abort();
            abortRef.current = null;
        }
    }, []);
    // Normalize changedFiles to use consistent field name, filter invalid entries
    var normalizedChangedFiles = (0, react_1.useMemo)(function () {
        if (!changedFiles)
            return undefined;
        return changedFiles
            .filter(function (f) { return f.filePath || f.path; }) // Filter out entries without path
            .map(function (f) { return ({
            path: f.filePath || f.path,
            additions: f.additions,
            deletions: f.deletions,
        }); });
    }, [changedFiles]);
    // Perform search
    (0, react_1.useEffect)(function () {
        // Clear previous debounce
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
            debounceRef.current = null;
        }
        // Abort previous search
        if (abortRef.current) {
            abortRef.current.abort();
            abortRef.current = null;
        }
        // If disabled, clear and skip
        if (!enabled) {
            clear();
            return;
        }
        // Save current result as previous via ref (avoids infinite loop)
        if (resultRef.current) {
            setPreviousResult(resultRef.current);
        }
        // Debounce the search
        debounceRef.current = setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
            var controller, searchResult, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        controller = new AbortController();
                        abortRef.current = controller;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, search_1.mentionSearchEngine.search(trigger, query, __assign(__assign({ projectPath: projectPath, sessionId: sessionId, changedFiles: normalizedChangedFiles }, (mcpTools && { mcpTools: mcpTools })), (mcpServers && { mcpServers: mcpServers })), // Extended context
                            {
                                providerIds: providerIds,
                            })
                            // Check if aborted or unmounted
                        ];
                    case 2:
                        searchResult = _a.sent();
                        // Check if aborted or unmounted
                        if (controller.signal.aborted || !mountedRef.current)
                            return [2 /*return*/];
                        // Update state
                        setResult(searchResult);
                        setError(null);
                        // Check for warnings when no results
                        if (searchResult.items.length === 0 && searchResult.warnings.length > 0) {
                            setError(searchResult.warnings[0] || null);
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        err_1 = _a.sent();
                        // Ignore abort errors (expected when user types fast)
                        if (err_1 instanceof Error && err_1.name === "AbortError")
                            return [2 /*return*/];
                        // Don't update state if unmounted
                        if (!mountedRef.current)
                            return [2 /*return*/];
                        console.error("[useMentionSearch] Error:", err_1);
                        setError(err_1 instanceof Error ? err_1.message : "Search failed");
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); }, debounceMs);
        // Cleanup on unmount or deps change
        return function () {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
                debounceRef.current = null;
            }
            if (abortRef.current) {
                abortRef.current.abort();
                abortRef.current = null;
            }
        };
    }, [
        query,
        trigger,
        projectPath,
        sessionId,
        debounceMs,
        enabled,
        providerIds,
        normalizedChangedFiles,
        mcpTools,
        mcpServers,
        clear,
        // NOTE: result intentionally NOT in deps to avoid infinite loop
        // We use resultRef.current instead
    ]);
    // Return items: prefer current result, fall back to previous (stale)
    var items = (0, react_1.useMemo)(function () {
        var _a, _b;
        return (_b = (_a = result === null || result === void 0 ? void 0 : result.items) !== null && _a !== void 0 ? _a : previousResult === null || previousResult === void 0 ? void 0 : previousResult.items) !== null && _b !== void 0 ? _b : [];
    }, [result, previousResult]);
    return {
        items: items,
        error: error,
        hasMore: (_b = (_a = result === null || result === void 0 ? void 0 : result.hasMore) !== null && _a !== void 0 ? _a : previousResult === null || previousResult === void 0 ? void 0 : previousResult.hasMore) !== null && _b !== void 0 ? _b : false,
        warnings: (_c = result === null || result === void 0 ? void 0 : result.warnings) !== null && _c !== void 0 ? _c : [],
        result: result,
        clear: clear,
    };
}
exports.default = useMentionSearch;
