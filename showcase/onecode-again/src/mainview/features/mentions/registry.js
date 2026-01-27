"use strict";
/**
 * Mention Provider Registry
 *
 * Central registry for all mention providers.
 * Similar to VS Code's extension registration pattern.
 *
 * Features:
 * - Register/unregister providers dynamically
 * - Query providers by trigger character
 * - Reactive updates via Jotai atoms
 * - Automatic lifecycle management (activate/deactivate)
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
exports.syncedMentionProvidersAtom = exports.mentionProvidersAtom = exports.mentionRegistry = void 0;
exports.syncMentionProviders = syncMentionProviders;
exports.useMentionProviders = useMentionProviders;
exports.useMentionProvidersByTrigger = useMentionProvidersByTrigger;
exports.useAvailableMentionProviders = useAvailableMentionProviders;
exports.useMentionCategories = useMentionCategories;
exports.useMentionProvider = useMentionProvider;
var solid_js_1 = require("solid-js");
/**
 * Provider Registry class - manages all registered providers
 */
var MentionProviderRegistry = /** @class */ (function () {
    function MentionProviderRegistry() {
        this.providers = new Map();
        this.listeners = new Set();
        this.activationPromises = new Map();
        // Memoization for preventing re-renders
        this.cachedProviders = null;
        this.cachedByTrigger = new Map();
        this.cachedCategories = null;
        this.cacheVersion = 0;
    }
    /**
     * Register a provider
     *
     * @param provider - Provider to register
     * @returns Unregister function
     */
    MentionProviderRegistry.prototype.register = function (provider) {
        var _this = this;
        var _a;
        if (this.providers.has(provider.id)) {
            console.warn("[MentionRegistry] Provider \"".concat(provider.id, "\" already registered, replacing"));
            // Deactivate existing provider
            var existing = this.providers.get(provider.id);
            (_a = existing === null || existing === void 0 ? void 0 : existing.deactivate) === null || _a === void 0 ? void 0 : _a.call(existing);
        }
        this.providers.set(provider.id, provider);
        // Activate provider asynchronously
        if (provider.activate) {
            var activationPromise = provider.activate().catch(function (error) {
                console.error("[MentionRegistry] Failed to activate provider \"".concat(provider.id, "\":"), error);
            });
            this.activationPromises.set(provider.id, activationPromise);
        }
        this.notifyListeners();
        // Return unregister function
        return function () { return _this.unregister(provider.id); };
    };
    /**
     * Register multiple providers at once
     */
    MentionProviderRegistry.prototype.registerAll = function (providers) {
        var _this = this;
        var unregisterFns = providers.map(function (p) { return _this.register(p); });
        return function () { return unregisterFns.forEach(function (fn) { return fn(); }); };
    };
    /**
     * Unregister a provider by ID
     */
    MentionProviderRegistry.prototype.unregister = function (id) {
        var _a;
        var provider = this.providers.get(id);
        if (provider) {
            (_a = provider.deactivate) === null || _a === void 0 ? void 0 : _a.call(provider);
            this.providers.delete(id);
            this.activationPromises.delete(id);
            this.notifyListeners();
        }
    };
    /**
     * Get all registered providers sorted by priority
     * Returns cached array to prevent re-renders
     */
    MentionProviderRegistry.prototype.getAll = function () {
        if (this.cachedProviders !== null) {
            return this.cachedProviders;
        }
        this.cachedProviders = Array.from(this.providers.values()).sort(function (a, b) { return b.priority - a.priority; });
        return this.cachedProviders;
    };
    /**
     * Get providers by trigger character
     * Returns cached array to prevent re-renders
     */
    MentionProviderRegistry.prototype.getByTrigger = function (char) {
        var cached = this.cachedByTrigger.get(char);
        if (cached !== undefined) {
            return cached;
        }
        var result = this.getAll().filter(function (p) { return p.trigger.char === char; });
        this.cachedByTrigger.set(char, result);
        return result;
    };
    /**
     * Get provider by ID
     */
    MentionProviderRegistry.prototype.get = function (id) {
        return this.providers.get(id);
    };
    /**
     * Check if a provider is registered
     */
    MentionProviderRegistry.prototype.has = function (id) {
        return this.providers.has(id);
    };
    /**
     * Get available providers for a context
     */
    MentionProviderRegistry.prototype.getAvailable = function (context) {
        return this.getAll().filter(function (p) { var _a, _b; return (_b = (_a = p.isAvailable) === null || _a === void 0 ? void 0 : _a.call(p, context)) !== null && _b !== void 0 ? _b : true; });
    };
    /**
     * Get unique trigger characters from all providers
     */
    MentionProviderRegistry.prototype.getTriggers = function () {
        var triggers = new Set();
        Array.from(this.providers.values()).forEach(function (provider) {
            triggers.add(provider.trigger.char);
        });
        return Array.from(triggers);
    };
    /**
     * Get categories from all providers (deduplicated)
     * Returns cached array to prevent re-renders
     */
    MentionProviderRegistry.prototype.getCategories = function () {
        if (this.cachedCategories !== null) {
            return this.cachedCategories;
        }
        var categories = new Map();
        Array.from(this.providers.values()).forEach(function (provider) {
            if (!categories.has(provider.category.id)) {
                categories.set(provider.category.id, {
                    id: provider.category.id,
                    label: provider.category.label,
                    priority: provider.category.priority,
                });
            }
        });
        this.cachedCategories = Array.from(categories.values()).sort(function (a, b) { return b.priority - a.priority; });
        return this.cachedCategories;
    };
    /**
     * Wait for all providers to be activated
     */
    MentionProviderRegistry.prototype.waitForActivation = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.all(Array.from(this.activationPromises.values()))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Subscribe to registry changes
     */
    MentionProviderRegistry.prototype.subscribe = function (listener) {
        var _this = this;
        this.listeners.add(listener);
        return function () { return _this.listeners.delete(listener); };
    };
    /**
     * Clear all providers (for testing)
     */
    MentionProviderRegistry.prototype.clear = function () {
        Array.from(this.providers.values()).forEach(function (provider) {
            var _a;
            (_a = provider.deactivate) === null || _a === void 0 ? void 0 : _a.call(provider);
        });
        this.providers.clear();
        this.activationPromises.clear();
        this.notifyListeners();
    };
    /**
     * Invalidate all caches (called when providers change)
     */
    MentionProviderRegistry.prototype.invalidateCache = function () {
        this.cachedProviders = null;
        this.cachedByTrigger.clear();
        this.cachedCategories = null;
        this.cacheVersion++;
    };
    MentionProviderRegistry.prototype.notifyListeners = function () {
        // Invalidate cache before notifying listeners
        this.invalidateCache();
        Array.from(this.listeners).forEach(function (listener) {
            try {
                listener();
            }
            catch (error) {
                console.error("[MentionRegistry] Listener error:", error);
            }
        });
    };
    return MentionProviderRegistry;
}());
/**
 * Singleton registry instance
 */
exports.mentionRegistry = new MentionProviderRegistry();
/**
 * Jotai atom for reactive provider list
 * Updates automatically when registry changes
 */
exports.mentionProvidersAtom = (0, solid_js_1.createSignal)([]);
/**
 * Internal atom to track registry version
 */
var registryVersionAtom = (0, solid_js_1.createSignal)(0);
/**
 * Writable atom that syncs with registry
 */
exports.syncedMentionProvidersAtom = (0, solid_js_1.createMemo)(function () {
    registryVersionAtom[0]();
    return exports.mentionRegistry.getAll();
});
function syncMentionProviders() {
    registryVersionAtom[1](function (v) { return v + 1; });
}
/**
 * Hook to get all providers (reactive)
 */
function useMentionProviders() {
    var _a = (0, solid_js_1.createSignal)(exports.mentionRegistry.getAll()), providers = _a[0], setProviders = _a[1];
    (0, solid_js_1.createEffect)(function () {
        var unsubscribe = exports.mentionRegistry.subscribe(function () {
            setProviders(exports.mentionRegistry.getAll());
        });
        (0, solid_js_1.onCleanup)(unsubscribe);
    });
    return providers;
}
/**
 * Hook to get providers by trigger (reactive)
 */
function useMentionProvidersByTrigger(trigger) {
    var _a = (0, solid_js_1.createSignal)(exports.mentionRegistry.getByTrigger(trigger)), providers = _a[0], setProviders = _a[1];
    (0, solid_js_1.createEffect)(function () {
        var unsubscribe = exports.mentionRegistry.subscribe(function () {
            setProviders(exports.mentionRegistry.getByTrigger(trigger));
        });
        (0, solid_js_1.onCleanup)(unsubscribe);
    });
    return providers;
}
/**
 * Hook to get available providers for context (reactive)
 */
function useAvailableMentionProviders(context) {
    var providers = useMentionProviders();
    return (0, solid_js_1.createMemo)(function () { return providers().filter(function (p) { var _a, _b; return (_b = (_a = p.isAvailable) === null || _a === void 0 ? void 0 : _a.call(p, context)) !== null && _b !== void 0 ? _b : true; }); });
}
/**
 * Hook to get categories (reactive)
 */
function useMentionCategories() {
    var _a = (0, solid_js_1.createSignal)(exports.mentionRegistry.getCategories()), categories = _a[0], setCategories = _a[1];
    (0, solid_js_1.createEffect)(function () {
        var unsubscribe = exports.mentionRegistry.subscribe(function () {
            setCategories(exports.mentionRegistry.getCategories());
        });
        (0, solid_js_1.onCleanup)(unsubscribe);
    });
    return categories;
}
/**
 * Hook to get a specific provider by ID
 * Uses memoized atom to prevent re-subscriptions on every render
 */
function useMentionProvider(id) {
    return (0, solid_js_1.createMemo)(function () {
        registryVersionAtom[0]();
        return exports.mentionRegistry.get(id);
    });
}
