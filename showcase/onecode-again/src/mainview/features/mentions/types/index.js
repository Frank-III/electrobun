"use strict";
/**
 * Mention System Types
 *
 * This module exports all types for the scalable mention system.
 * Import from here for a clean API.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.sortByRelevance = exports.calculateRelevance = exports.createMentionProvider = exports.isMentionType = exports.getMentionPrefix = exports.MENTION_PREFIXES = exports.createProviderId = void 0;
var core_1 = require("./core");
Object.defineProperty(exports, "createProviderId", { enumerable: true, get: function () { return core_1.createProviderId; } });
Object.defineProperty(exports, "MENTION_PREFIXES", { enumerable: true, get: function () { return core_1.MENTION_PREFIXES; } });
Object.defineProperty(exports, "getMentionPrefix", { enumerable: true, get: function () { return core_1.getMentionPrefix; } });
Object.defineProperty(exports, "isMentionType", { enumerable: true, get: function () { return core_1.isMentionType; } });
var provider_1 = require("./provider");
Object.defineProperty(exports, "createMentionProvider", { enumerable: true, get: function () { return provider_1.createMentionProvider; } });
var search_1 = require("./search");
Object.defineProperty(exports, "calculateRelevance", { enumerable: true, get: function () { return search_1.calculateRelevance; } });
Object.defineProperty(exports, "sortByRelevance", { enumerable: true, get: function () { return search_1.sortByRelevance; } });
