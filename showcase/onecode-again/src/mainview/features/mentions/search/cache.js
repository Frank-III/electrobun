"use strict";
/**
 * Mention Search Cache
 *
 * Multi-layer caching system for mention search results.
 * Supports LRU eviction, TTL expiration, and git-aware invalidation.
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.gitAwareCache = exports.GitAwareCache = exports.mentionCache = exports.MentionCache = void 0;
/**
 * LRU Cache with TTL support
 */
var MentionCache = /** @class */ (function () {
    function MentionCache(options) {
        if (options === void 0) { options = {}; }
        var _a, _b;
        this.cache = new Map();
        this.hits = 0;
        this.misses = 0;
        this.maxSize = (_a = options.maxSize) !== null && _a !== void 0 ? _a : 500;
        this.defaultTtl = (_b = options.defaultTtl) !== null && _b !== void 0 ? _b : 30000; // 30 seconds
    }
    /**
     * Get a value from the cache
     */
    MentionCache.prototype.get = function (key) {
        var entry = this.cache.get(key);
        if (!entry) {
            this.misses++;
            return null;
        }
        // Check expiration
        if (Date.now() > entry.expires) {
            this.cache.delete(key);
            this.misses++;
            return null;
        }
        // Update hit count and move to end (LRU)
        entry.hitCount++;
        this.cache.delete(key);
        this.cache.set(key, entry);
        this.hits++;
        return entry.value;
    };
    /**
     * Set a value in the cache
     */
    MentionCache.prototype.set = function (key, value, ttl) {
        // LRU eviction if at capacity
        if (this.cache.size >= this.maxSize) {
            var firstKey = this.cache.keys().next().value;
            if (firstKey) {
                this.cache.delete(firstKey);
            }
        }
        this.cache.set(key, {
            value: value,
            expires: Date.now() + (ttl !== null && ttl !== void 0 ? ttl : this.defaultTtl),
            hitCount: 0,
        });
    };
    /**
     * Invalidate entries matching a pattern
     * Pattern supports * as wildcard
     */
    MentionCache.prototype.invalidate = function (pattern) {
        var _this = this;
        // Escape regex special characters first, then convert * to .*
        var escapedPattern = pattern
            .replace(/[.+?^${}()|[\]\\]/g, "\\$&") // Escape special regex chars (except *)
            .replace(/\*/g, ".*"); // Convert * to .*
        var regex = new RegExp("^" + escapedPattern + "$");
        var count = 0;
        Array.from(this.cache.keys()).forEach(function (key) {
            if (regex.test(key)) {
                _this.cache.delete(key);
                count++;
            }
        });
        return count;
    };
    /**
     * Invalidate entries for a specific provider
     */
    MentionCache.prototype.invalidateProvider = function (providerId) {
        return this.invalidate("".concat(providerId, ":*"));
    };
    /**
     * Clear all cache entries
     */
    MentionCache.prototype.clear = function () {
        this.cache.clear();
        this.hits = 0;
        this.misses = 0;
    };
    /**
     * Get cache statistics
     */
    MentionCache.prototype.getStats = function () {
        var total = this.hits + this.misses;
        return {
            size: this.cache.size,
            maxSize: this.maxSize,
            hits: this.hits,
            misses: this.misses,
            hitRate: total > 0 ? this.hits / total : 0,
        };
    };
    /**
     * Generate a cache key for a search query
     * Uses URI encoding to prevent collision when parts contain separators
     */
    MentionCache.createKey = function (providerId, query, context) {
        var parts = [providerId, query];
        if (context === null || context === void 0 ? void 0 : context.projectPath) {
            parts.push(context.projectPath);
        }
        // Encode each part to prevent collision from separator characters
        return parts.map(function (p) { return encodeURIComponent(p); }).join(":");
    };
    return MentionCache;
}());
exports.MentionCache = MentionCache;
/**
 * Global cache instance
 */
exports.mentionCache = new MentionCache();
/**
 * Git-aware cache that invalidates on branch changes
 */
var GitAwareCache = /** @class */ (function (_super) {
    __extends(GitAwareCache, _super);
    function GitAwareCache() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.currentHead = null;
        _this.headChangeListeners = new Set();
        return _this;
    }
    /**
     * Update the current git HEAD
     * If HEAD changes, invalidate file-related caches
     */
    GitAwareCache.prototype.updateHead = function (newHead) {
        if (this.currentHead && this.currentHead !== newHead) {
            // Branch changed - invalidate file-related caches
            this.invalidate("files:*");
            this.notifyHeadChange();
        }
        this.currentHead = newHead;
    };
    /**
     * Subscribe to head change events
     */
    GitAwareCache.prototype.onHeadChange = function (listener) {
        var _this = this;
        this.headChangeListeners.add(listener);
        return function () { return _this.headChangeListeners.delete(listener); };
    };
    GitAwareCache.prototype.notifyHeadChange = function () {
        Array.from(this.headChangeListeners).forEach(function (listener) {
            try {
                listener();
            }
            catch (error) {
                console.error("[GitAwareCache] Listener error:", error);
            }
        });
    };
    return GitAwareCache;
}(MentionCache));
exports.GitAwareCache = GitAwareCache;
/**
 * Global git-aware cache instance
 */
exports.gitAwareCache = new GitAwareCache();
