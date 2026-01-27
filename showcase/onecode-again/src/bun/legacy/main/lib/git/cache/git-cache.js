"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gitCache = void 0;
exports.computeContentHash = computeContentHash;
exports.estimateSizeBytes = estimateSizeBytes;
var crypto_1 = require("crypto");
/**
 * LRU Cache with TTL and optional size limits.
 * Supports hash-based invalidation for efficient updates.
 */
var LRUCache = /** @class */ (function () {
    function LRUCache(config) {
        this.cache = new Map();
        this.currentSizeBytes = 0;
        this.config = config;
    }
    /**
     * Get an entry from the cache if it exists and is not expired.
     */
    LRUCache.prototype.get = function (key) {
        var entry = this.cache.get(key);
        if (!entry)
            return null;
        // Check TTL
        if (Date.now() - entry.timestamp > this.config.maxAge) {
            this.delete(key);
            return null;
        }
        // Update access count for LRU
        entry.accessCount++;
        return entry.data;
    };
    /**
     * Get entry only if hash matches (for conditional updates).
     */
    LRUCache.prototype.getIfHashMatches = function (key, hash) {
        var entry = this.cache.get(key);
        if (!entry)
            return null;
        // Check TTL
        if (Date.now() - entry.timestamp > this.config.maxAge) {
            this.delete(key);
            return null;
        }
        // Check hash
        if (entry.hash !== hash) {
            return null;
        }
        entry.accessCount++;
        return entry.data;
    };
    /**
     * Set an entry in the cache.
     */
    LRUCache.prototype.set = function (key, data, hash, sizeBytes) {
        if (sizeBytes === void 0) { sizeBytes = 0; }
        // Evict if necessary
        this.evictIfNeeded(sizeBytes);
        // Delete existing entry first to update size tracking
        if (this.cache.has(key)) {
            this.delete(key);
        }
        var entry = {
            data: data,
            hash: hash,
            timestamp: Date.now(),
            accessCount: 1,
            sizeBytes: sizeBytes,
        };
        this.cache.set(key, entry);
        this.currentSizeBytes += sizeBytes;
    };
    /**
     * Delete an entry from the cache.
     */
    LRUCache.prototype.delete = function (key) {
        var entry = this.cache.get(key);
        if (entry) {
            this.currentSizeBytes -= entry.sizeBytes;
            return this.cache.delete(key);
        }
        return false;
    };
    /**
     * Invalidate all entries for a given worktree path.
     */
    LRUCache.prototype.invalidateByPrefix = function (prefix) {
        var count = 0;
        var keys = Array.from(this.cache.keys());
        for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
            var key = keys_1[_i];
            if (key.startsWith(prefix)) {
                this.delete(key);
                count++;
            }
        }
        return count;
    };
    /**
     * Clear all entries.
     */
    LRUCache.prototype.clear = function () {
        this.cache.clear();
        this.currentSizeBytes = 0;
    };
    /**
     * Get cache statistics.
     */
    LRUCache.prototype.getStats = function () {
        return {
            entries: this.cache.size,
            sizeBytes: this.currentSizeBytes,
            maxEntries: this.config.maxEntries,
            maxSizeBytes: this.config.maxSizeBytes,
        };
    };
    LRUCache.prototype.evictIfNeeded = function (incomingSizeBytes) {
        // Evict by entry count
        while (this.cache.size >= this.config.maxEntries) {
            this.evictLRU();
        }
        // Evict by size if configured
        if (this.config.maxSizeBytes) {
            while (this.currentSizeBytes + incomingSizeBytes >
                this.config.maxSizeBytes &&
                this.cache.size > 0) {
                this.evictLRU();
            }
        }
    };
    LRUCache.prototype.evictLRU = function () {
        var lruKey = null;
        var lruAccessCount = Number.POSITIVE_INFINITY;
        var lruTimestamp = Number.POSITIVE_INFINITY;
        var entries = Array.from(this.cache.entries());
        for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
            var _a = entries_1[_i], key = _a[0], entry = _a[1];
            // Prioritize by access count, then by timestamp
            if (entry.accessCount < lruAccessCount ||
                (entry.accessCount === lruAccessCount &&
                    entry.timestamp < lruTimestamp)) {
                lruKey = key;
                lruAccessCount = entry.accessCount;
                lruTimestamp = entry.timestamp;
            }
        }
        if (lruKey) {
            this.delete(lruKey);
        }
    };
    return LRUCache;
}());
/**
 * Compute content hash for cache invalidation.
 */
function computeContentHash(content) {
    return (0, crypto_1.createHash)("sha256").update(content).digest("hex").slice(0, 16);
}
/**
 * Estimate byte size of a JavaScript value.
 */
function estimateSizeBytes(value) {
    if (typeof value === "string") {
        return value.length * 2; // UTF-16
    }
    if (typeof value === "number") {
        return 8;
    }
    if (typeof value === "boolean") {
        return 4;
    }
    if (value === null || value === undefined) {
        return 0;
    }
    if (Array.isArray(value)) {
        return value.reduce(function (sum, item) { return sum + estimateSizeBytes(item); }, 64);
    }
    if (typeof value === "object") {
        return Object.entries(value).reduce(function (sum, _a) {
            var key = _a[0], val = _a[1];
            return sum + key.length * 2 + estimateSizeBytes(val);
        }, 64);
    }
    return 0;
}
// Cache configuration
var CACHE_CONFIGS = {
    // Git status - short lived, frequently invalidated
    status: {
        maxAge: 5000, // 5 seconds
        maxEntries: 20,
    },
    // Parsed diff - longer lived, hash-based invalidation
    parsedDiff: {
        maxAge: 60000, // 1 minute
        maxEntries: 100,
        maxSizeBytes: 50 * 1024 * 1024, // 50MB
    },
    // File contents - content-addressed, longer TTL
    fileContents: {
        maxAge: 300000, // 5 minutes
        maxEntries: 500,
        maxSizeBytes: 100 * 1024 * 1024, // 100MB
    },
};
/**
 * GitCache provides caching for git operations.
 * Uses different caching strategies for different data types.
 */
var GitCache = /** @class */ (function () {
    function GitCache() {
        this.statusCache = new LRUCache(CACHE_CONFIGS.status);
        this.parsedDiffCache = new LRUCache(CACHE_CONFIGS.parsedDiff);
        this.fileContentsCache = new LRUCache(CACHE_CONFIGS.fileContents);
    }
    // Status cache methods
    GitCache.prototype.getStatus = function (worktreePath) {
        return this.statusCache.get(worktreePath);
    };
    GitCache.prototype.setStatus = function (worktreePath, status) {
        var hash = computeContentHash(JSON.stringify(status));
        this.statusCache.set(worktreePath, status, hash);
    };
    GitCache.prototype.invalidateStatus = function (worktreePath) {
        this.statusCache.delete(worktreePath);
    };
    // Parsed diff cache methods
    GitCache.prototype.getParsedDiff = function (worktreePath, diffHash) {
        var key = "".concat(worktreePath, ":").concat(diffHash);
        return this.parsedDiffCache.getIfHashMatches(key, diffHash);
    };
    GitCache.prototype.setParsedDiff = function (worktreePath, diffHash, parsed) {
        var key = "".concat(worktreePath, ":").concat(diffHash);
        var sizeBytes = estimateSizeBytes(parsed);
        this.parsedDiffCache.set(key, parsed, diffHash, sizeBytes);
    };
    GitCache.prototype.invalidateParsedDiff = function (worktreePath) {
        return this.parsedDiffCache.invalidateByPrefix(worktreePath);
    };
    // File contents cache methods
    GitCache.prototype.getFileContent = function (worktreePath, filePath) {
        var key = "".concat(worktreePath, ":").concat(filePath);
        return this.fileContentsCache.get(key);
    };
    GitCache.prototype.getFileContentIfHashMatches = function (worktreePath, filePath, contentHash) {
        var key = "".concat(worktreePath, ":").concat(filePath);
        return this.fileContentsCache.getIfHashMatches(key, contentHash);
    };
    GitCache.prototype.setFileContent = function (worktreePath, filePath, content) {
        var key = "".concat(worktreePath, ":").concat(filePath);
        var hash = computeContentHash(content);
        this.fileContentsCache.set(key, content, hash, content.length * 2);
    };
    GitCache.prototype.invalidateFileContent = function (worktreePath, filePath) {
        var key = "".concat(worktreePath, ":").concat(filePath);
        this.fileContentsCache.delete(key);
    };
    GitCache.prototype.invalidateAllFileContents = function (worktreePath) {
        return this.fileContentsCache.invalidateByPrefix(worktreePath);
    };
    // Invalidate all caches for a worktree
    GitCache.prototype.invalidateWorktree = function (worktreePath) {
        this.statusCache.delete(worktreePath);
        this.parsedDiffCache.invalidateByPrefix(worktreePath);
        this.fileContentsCache.invalidateByPrefix(worktreePath);
    };
    // Get statistics for monitoring
    GitCache.prototype.getStats = function () {
        return {
            status: this.statusCache.getStats(),
            parsedDiff: this.parsedDiffCache.getStats(),
            fileContents: this.fileContentsCache.getStats(),
        };
    };
    // Clear all caches
    GitCache.prototype.clearAll = function () {
        this.statusCache.clear();
        this.parsedDiffCache.clear();
        this.fileContentsCache.clear();
    };
    return GitCache;
}());
// Singleton instance
exports.gitCache = new GitCache();
