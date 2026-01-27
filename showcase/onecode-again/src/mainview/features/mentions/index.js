"use strict";
/**
 * Scalable Mention System
 *
 * A plugin-based mention system inspired by VS Code's extension model.
 * Supports unlimited mention types through a provider system.
 *
 * ## Quick Start
 *
 * ```typescript
 * import { registerBuiltInProviders, useMentionProviders } from './mentions'
 *
 * // Register built-in providers at app startup
 * registerBuiltInProviders()
 *
 * // Use providers in React components
 * function MyComponent() {
 *   const providers = useMentionProviders()
 *   // ...
 * }
 * ```
 *
 * ## Creating Custom Providers
 *
 * ```typescript
 * import { createMentionProvider, registerProvider } from './mentions'
 *
 * const myProvider = createMentionProvider({
 *   id: 'my-provider',
 *   name: 'My Provider',
 *   category: { label: 'My Category', priority: 50 },
 *   search: async (context) => {
 *     // Return matching items
 *     return { items: [...], hasMore: false }
 *   },
 *   serialize: (item) => `@[my:${item.id}]`,
 *   deserialize: (token) => {
 *     if (!token.startsWith('my:')) return null
 *     // Parse and return item
 *   },
 * })
 *
 * registerProvider(myProvider)
 * ```
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMentionSearch = exports.mentionSearchEngine = exports.MentionSearchEngine = exports.gitAwareCache = exports.mentionCache = exports.GitAwareCache = exports.MentionCache = exports.registerProvider = exports.registerBuiltInProviders = exports.builtInProviders = exports.toolsProvider = exports.agentsProvider = exports.skillsProvider = exports.filesProvider = exports.useMentionProvider = exports.useMentionCategories = exports.useAvailableMentionProviders = exports.useMentionProvidersByTrigger = exports.useMentionProviders = exports.syncedMentionProvidersAtom = exports.mentionProvidersAtom = exports.mentionRegistry = exports.sortByRelevance = exports.calculateRelevance = exports.createMentionProvider = exports.isMentionType = exports.getMentionPrefix = exports.MENTION_PREFIXES = exports.createProviderId = void 0;
var types_1 = require("./types");
Object.defineProperty(exports, "createProviderId", { enumerable: true, get: function () { return types_1.createProviderId; } });
Object.defineProperty(exports, "MENTION_PREFIXES", { enumerable: true, get: function () { return types_1.MENTION_PREFIXES; } });
Object.defineProperty(exports, "getMentionPrefix", { enumerable: true, get: function () { return types_1.getMentionPrefix; } });
Object.defineProperty(exports, "isMentionType", { enumerable: true, get: function () { return types_1.isMentionType; } });
Object.defineProperty(exports, "createMentionProvider", { enumerable: true, get: function () { return types_1.createMentionProvider; } });
Object.defineProperty(exports, "calculateRelevance", { enumerable: true, get: function () { return types_1.calculateRelevance; } });
Object.defineProperty(exports, "sortByRelevance", { enumerable: true, get: function () { return types_1.sortByRelevance; } });
// Registry
var registry_1 = require("./registry");
Object.defineProperty(exports, "mentionRegistry", { enumerable: true, get: function () { return registry_1.mentionRegistry; } });
Object.defineProperty(exports, "mentionProvidersAtom", { enumerable: true, get: function () { return registry_1.mentionProvidersAtom; } });
Object.defineProperty(exports, "syncedMentionProvidersAtom", { enumerable: true, get: function () { return registry_1.syncedMentionProvidersAtom; } });
Object.defineProperty(exports, "useMentionProviders", { enumerable: true, get: function () { return registry_1.useMentionProviders; } });
Object.defineProperty(exports, "useMentionProvidersByTrigger", { enumerable: true, get: function () { return registry_1.useMentionProvidersByTrigger; } });
Object.defineProperty(exports, "useAvailableMentionProviders", { enumerable: true, get: function () { return registry_1.useAvailableMentionProviders; } });
Object.defineProperty(exports, "useMentionCategories", { enumerable: true, get: function () { return registry_1.useMentionCategories; } });
Object.defineProperty(exports, "useMentionProvider", { enumerable: true, get: function () { return registry_1.useMentionProvider; } });
// Providers
var providers_1 = require("./providers");
Object.defineProperty(exports, "filesProvider", { enumerable: true, get: function () { return providers_1.filesProvider; } });
Object.defineProperty(exports, "skillsProvider", { enumerable: true, get: function () { return providers_1.skillsProvider; } });
Object.defineProperty(exports, "agentsProvider", { enumerable: true, get: function () { return providers_1.agentsProvider; } });
Object.defineProperty(exports, "toolsProvider", { enumerable: true, get: function () { return providers_1.toolsProvider; } });
Object.defineProperty(exports, "builtInProviders", { enumerable: true, get: function () { return providers_1.builtInProviders; } });
Object.defineProperty(exports, "registerBuiltInProviders", { enumerable: true, get: function () { return providers_1.registerBuiltInProviders; } });
Object.defineProperty(exports, "registerProvider", { enumerable: true, get: function () { return providers_1.registerProvider; } });
// Search
var search_1 = require("./search");
Object.defineProperty(exports, "MentionCache", { enumerable: true, get: function () { return search_1.MentionCache; } });
Object.defineProperty(exports, "GitAwareCache", { enumerable: true, get: function () { return search_1.GitAwareCache; } });
Object.defineProperty(exports, "mentionCache", { enumerable: true, get: function () { return search_1.mentionCache; } });
Object.defineProperty(exports, "gitAwareCache", { enumerable: true, get: function () { return search_1.gitAwareCache; } });
Object.defineProperty(exports, "MentionSearchEngine", { enumerable: true, get: function () { return search_1.MentionSearchEngine; } });
Object.defineProperty(exports, "mentionSearchEngine", { enumerable: true, get: function () { return search_1.mentionSearchEngine; } });
// Hooks
var hooks_1 = require("./hooks");
Object.defineProperty(exports, "useMentionSearch", { enumerable: true, get: function () { return hooks_1.useMentionSearch; } });
