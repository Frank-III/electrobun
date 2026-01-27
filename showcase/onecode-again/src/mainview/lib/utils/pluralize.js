"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pluralize = pluralize;
/**
 * Simple pluralization helper
 * @param count - The count to check
 * @param singular - The singular form of the word
 * @param plural - Optional plural form (defaults to singular + 's')
 */
function pluralize(count, singular, plural) {
    if (count === 1)
        return singular;
    return plural !== null && plural !== void 0 ? plural : "".concat(singular, "s");
}
