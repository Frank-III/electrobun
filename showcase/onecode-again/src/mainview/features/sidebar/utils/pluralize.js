"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pluralize = pluralize;
/**
 * Pluralize a word based on count
 * @param count - The number of items
 * @param singular - The singular form of the word
 * @param plural - Optional plural form (defaults to singular + 's')
 */
function pluralize(count, singular, plural) {
    if (count === 1) {
        return singular;
    }
    return plural || "".concat(singular, "s");
}
