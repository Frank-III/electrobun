"use strict";
/**
 * Mention Search Engine
 *
 * Orchestrates search across all registered providers.
 * Features:
 * - Multi-tier search (cache → providers)
 * - Parallel provider queries
 * - Debouncing and cancellation
 * - Result aggregation and sorting
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
exports.mentionSearchEngine = exports.MentionSearchEngine = void 0;
var registry_1 = require("../registry");
var cache_1 = require("./cache");
var types_1 = require("../types");
/**
 * Default search options
 * Debounce unified with use-mention-search.ts (200ms)
 */
var DEFAULT_OPTIONS = {
    debounceMs: 200,
    timeoutMs: 500,
    useCache: true,
    parallel: true,
    providerIds: [],
};
/**
 * Search engine for mentions
 */
var MentionSearchEngine = /** @class */ (function () {
    function MentionSearchEngine(cache) {
        this.pendingSearches = new Map();
        this.cache = cache !== null && cache !== void 0 ? cache : new cache_1.MentionCache();
    }
    /**
     * Search across all registered providers
     */
    MentionSearchEngine.prototype.search = function (trigger_1, query_1, baseContext_1) {
        return __awaiter(this, arguments, void 0, function (trigger, query, baseContext, options) {
            var startTime, opts, searchKey, existingController, controller, providers, providerIdSet_1, context, results, _a;
            var _b;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        startTime = performance.now();
                        opts = __assign(__assign({}, DEFAULT_OPTIONS), options);
                        searchKey = "".concat(trigger, ":").concat((_b = baseContext.projectPath) !== null && _b !== void 0 ? _b : "global");
                        existingController = this.pendingSearches.get(searchKey);
                        if (existingController) {
                            existingController.abort();
                        }
                        controller = new AbortController();
                        this.pendingSearches.set(searchKey, controller);
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, , 6, 7]);
                        providers = registry_1.mentionRegistry.getByTrigger(trigger);
                        // Filter by provider IDs if specified
                        if (opts.providerIds && opts.providerIds.length > 0) {
                            providerIdSet_1 = new Set(opts.providerIds);
                            providers = providers.filter(function (p) { return providerIdSet_1.has(p.id); });
                        }
                        // Filter by availability
                        providers = providers.filter(function (p) { var _a, _b; return (_b = (_a = p.isAvailable) === null || _a === void 0 ? void 0 : _a.call(p, { projectPath: baseContext.projectPath })) !== null && _b !== void 0 ? _b : true; });
                        if (providers.length === 0) {
                            return [2 /*return*/, this.createEmptyResult(startTime)];
                        }
                        context = __assign(__assign({}, baseContext), { query: query, signal: controller.signal, limit: 50 });
                        if (!opts.parallel) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.searchParallel(providers, context, opts)];
                    case 2:
                        _a = _c.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, this.searchSequential(providers, context, opts)
                        // Aggregate results
                    ];
                    case 4:
                        _a = _c.sent();
                        _c.label = 5;
                    case 5:
                        results = _a;
                        // Aggregate results
                        return [2 /*return*/, this.aggregateResults(results, query, startTime)];
                    case 6:
                        // Cleanup
                        this.pendingSearches.delete(searchKey);
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Search a single provider
     */
    MentionSearchEngine.prototype.searchProvider = function (provider_1, context_1) {
        return __awaiter(this, arguments, void 0, function (provider, context, options) {
            var opts, cacheKey, cached, timeoutId, result, cacheKey, error_1;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        opts = __assign(__assign({}, DEFAULT_OPTIONS), options);
                        // Check cache first
                        if (opts.useCache) {
                            cacheKey = cache_1.MentionCache.createKey(provider.id, context.query, {
                                projectPath: context.projectPath,
                            });
                            cached = this.cache.get(cacheKey);
                            if (cached) {
                                return [2 /*return*/, cached];
                            }
                        }
                        timeoutId = null;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, Promise.race([
                                provider.search(context),
                                this.createCancellableTimeout(opts.timeoutMs, function (id) {
                                    timeoutId = id;
                                }),
                            ])
                            // Clear timeout if search completed first
                        ];
                    case 2:
                        result = _a.sent();
                        // Clear timeout if search completed first
                        if (timeoutId !== null) {
                            clearTimeout(timeoutId);
                        }
                        // Cache the result
                        if (opts.useCache && result.items.length > 0) {
                            cacheKey = cache_1.MentionCache.createKey(provider.id, context.query, {
                                projectPath: context.projectPath,
                            });
                            this.cache.set(cacheKey, result);
                        }
                        return [2 /*return*/, result];
                    case 3:
                        error_1 = _a.sent();
                        // Always clear timeout on error
                        if (timeoutId !== null) {
                            clearTimeout(timeoutId);
                        }
                        if (error_1 instanceof Error && error_1.name === "AbortError") {
                            return [2 /*return*/, { items: [], hasMore: false }];
                        }
                        console.error("[SearchEngine] Provider \"".concat(provider.id, "\" error:"), error_1);
                        return [2 /*return*/, {
                                items: [],
                                hasMore: false,
                                warning: "".concat(provider.name, " search failed"),
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Search providers in parallel
     */
    MentionSearchEngine.prototype.searchParallel = function (providers, context, options) {
        return __awaiter(this, void 0, void 0, function () {
            var results, searchPromises;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        results = new Map();
                        searchPromises = providers.map(function (provider) { return __awaiter(_this, void 0, void 0, function () {
                            var result;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, this.searchProvider(provider, context, options)];
                                    case 1:
                                        result = _a.sent();
                                        results.set(provider.id, result);
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                        return [4 /*yield*/, Promise.allSettled(searchPromises)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, results];
                }
            });
        });
    };
    /**
     * Search providers sequentially
     */
    MentionSearchEngine.prototype.searchSequential = function (providers, context, options) {
        return __awaiter(this, void 0, void 0, function () {
            var results, _i, providers_1, provider, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        results = new Map();
                        _i = 0, providers_1 = providers;
                        _a.label = 1;
                    case 1:
                        if (!(_i < providers_1.length)) return [3 /*break*/, 4];
                        provider = providers_1[_i];
                        if (context.signal.aborted)
                            return [3 /*break*/, 4];
                        return [4 /*yield*/, this.searchProvider(provider, context, options)];
                    case 2:
                        result = _a.sent();
                        results.set(provider.id, result);
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, results];
                }
            });
        });
    };
    /**
     * Aggregate results from multiple providers
     */
    MentionSearchEngine.prototype.aggregateResults = function (resultsByProvider, query, startTime) {
        var allItems = [];
        var warnings = [];
        var hasMore = false;
        Array.from(resultsByProvider.values()).forEach(function (result) {
            allItems.push.apply(allItems, result.items);
            if (result.hasMore)
                hasMore = true;
            if (result.warning)
                warnings.push(result.warning);
        });
        // Sort by relevance
        var sortedItems = (0, types_1.sortByRelevance)(allItems, query);
        return {
            byProvider: resultsByProvider,
            items: sortedItems,
            hasMore: hasMore,
            warnings: warnings,
            timing: performance.now() - startTime,
        };
    };
    /**
     * Create empty result
     */
    MentionSearchEngine.prototype.createEmptyResult = function (startTime) {
        return {
            byProvider: new Map(),
            items: [],
            hasMore: false,
            warnings: [],
            timing: performance.now() - startTime,
        };
    };
    /**
     * Create cancellable timeout promise
     * The onTimeoutId callback receives the timeout ID for cleanup
     */
    MentionSearchEngine.prototype.createCancellableTimeout = function (ms, onTimeoutId) {
        return new Promise(function (_, reject) {
            var timeoutId = setTimeout(function () {
                var error = new Error("Search timeout");
                error.name = "TimeoutError";
                reject(error);
            }, ms);
            onTimeoutId(timeoutId);
        });
    };
    /**
     * Cancel all pending searches
     */
    MentionSearchEngine.prototype.cancelAll = function () {
        Array.from(this.pendingSearches.values()).forEach(function (controller) {
            controller.abort();
        });
        this.pendingSearches.clear();
    };
    /**
     * Clear the cache
     */
    MentionSearchEngine.prototype.clearCache = function () {
        this.cache.clear();
    };
    /**
     * Invalidate cache for a provider
     */
    MentionSearchEngine.prototype.invalidateProvider = function (providerId) {
        this.cache.invalidateProvider(providerId);
    };
    /**
     * Get cache statistics
     */
    MentionSearchEngine.prototype.getCacheStats = function () {
        return this.cache.getStats();
    };
    return MentionSearchEngine;
}());
exports.MentionSearchEngine = MentionSearchEngine;
/**
 * Global search engine instance
 */
exports.mentionSearchEngine = new MentionSearchEngine();
