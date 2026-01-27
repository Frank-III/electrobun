"use strict";
/**
 * Mention Provider Interface
 *
 * The core extension point for the mention system.
 * Similar to VS Code's CompletionItemProvider.
 *
 * Providers are responsible for:
 * - Searching for mention items based on user input
 * - Serializing/deserializing mentions for storage
 * - Optionally providing custom rendering
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMentionProvider = createMentionProvider;
/**
 * Factory function to create a provider with sensible defaults
 */
function createMentionProvider(options) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    return {
        id: options.id,
        name: options.name,
        category: {
            id: (_a = options.category.id) !== null && _a !== void 0 ? _a : options.id,
            label: options.category.label,
            icon: options.category.icon,
            priority: options.category.priority,
        },
        trigger: {
            char: (_c = (_b = options.trigger) === null || _b === void 0 ? void 0 : _b.char) !== null && _c !== void 0 ? _c : "@",
            pattern: (_d = options.trigger) === null || _d === void 0 ? void 0 : _d.pattern,
            position: (_f = (_e = options.trigger) === null || _e === void 0 ? void 0 : _e.position) !== null && _f !== void 0 ? _f : "standalone",
            allowSpaces: (_h = (_g = options.trigger) === null || _g === void 0 ? void 0 : _g.allowSpaces) !== null && _h !== void 0 ? _h : true,
            maxLength: (_j = options.trigger) === null || _j === void 0 ? void 0 : _j.maxLength,
        },
        priority: (_k = options.priority) !== null && _k !== void 0 ? _k : 50,
        search: options.search,
        serialize: options.serialize,
        deserialize: options.deserialize,
        resolve: options.resolve,
        getChildren: options.getChildren,
        renderItem: options.renderItem,
        renderChip: options.renderChip,
        renderTooltip: options.renderTooltip,
        activate: options.activate,
        deactivate: options.deactivate,
        isAvailable: options.isAvailable,
    };
}
