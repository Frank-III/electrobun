"use strict";
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
exports.getHighlighter = getHighlighter;
exports.loadFullTheme = loadFullTheme;
exports.ensureThemeLoaded = ensureThemeLoaded;
exports.highlightCode = highlightCode;
exports.getLoadedThemes = getLoadedThemes;
var shiki = require("shiki");
var vscode_themes_1 = require("../vscode-themes");
var builtin_themes_1 = require("./builtin-themes");
/**
 * Shared Shiki highlighter instance
 * Initialized with default themes, can load additional themes dynamically
 */
var highlighterPromise = null;
// ============================================================================
// LRU CACHE FOR HIGHLIGHT RESULTS
// ============================================================================
// Prevents re-highlighting the same code when switching tabs.
// Key: `${themeId}:${language}:${code}` -> Value: highlighted HTML
// Max 500 entries (~5MB assuming 10KB average per entry)
var HIGHLIGHT_CACHE_MAX_SIZE = 500;
var LRUCache = /** @class */ (function () {
    function LRUCache(maxSize) {
        this.cache = new Map();
        this.maxSize = maxSize;
    }
    LRUCache.prototype.get = function (key) {
        var value = this.cache.get(key);
        if (value !== undefined) {
            // Move to end (most recently used)
            this.cache.delete(key);
            this.cache.set(key, value);
        }
        return value;
    };
    LRUCache.prototype.set = function (key, value) {
        // Delete first to ensure it's at the end
        this.cache.delete(key);
        this.cache.set(key, value);
        // Evict oldest entries if over capacity
        if (this.cache.size > this.maxSize) {
            var firstKey = this.cache.keys().next().value;
            if (firstKey !== undefined) {
                this.cache.delete(firstKey);
            }
        }
    };
    LRUCache.prototype.has = function (key) {
        return this.cache.has(key);
    };
    return LRUCache;
}());
var highlightCache = new LRUCache(HIGHLIGHT_CACHE_MAX_SIZE);
/**
 * Languages supported by the highlighter
 */
var SUPPORTED_LANGUAGES = [
    "typescript",
    "javascript",
    "tsx",
    "jsx",
    "html",
    "css",
    "json",
    "python",
    "go",
    "rust",
    "bash",
    "markdown",
];
/**
 * Default themes to load initially - include all shiki bundled themes we might need
 */
var DEFAULT_THEMES = [
    "github-dark",
    "github-light",
    "vitesse-dark",
    "vitesse-light",
    "min-dark",
    "min-light",
    "vesper",
];
/**
 * Map our custom theme IDs to Shiki bundled themes for syntax highlighting
 * Only themes WITHOUT tokenColors need mapping - themes with tokenColors use their own
 */
var THEME_TO_SHIKI_MAP = {
    // 21st themes use GitHub themes (no tokenColors)
    "21st-dark": "github-dark",
    "21st-light": "github-light",
    // Claude themes use GitHub themes (no tokenColors)
    "claude-dark": "github-dark",
    "claude-light": "github-light",
    // Vesper maps to shiki's vesper theme
    "vesper-dark": "vesper",
    // Vitesse themes map directly
    "vitesse-dark": "vitesse-dark",
    "vitesse-light": "vitesse-light",
    // Min themes map directly
    "min-dark": "min-dark",
    "min-light": "min-light",
    // Cursor themes have their own tokenColors - use them directly via loadFullTheme
    // (not in this map, so they'll use their own tokenColors)
};
/**
 * Get or create the Shiki highlighter instance
 */
function getHighlighter() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (!highlighterPromise) {
                highlighterPromise = shiki.createHighlighter({
                    themes: DEFAULT_THEMES,
                    langs: SUPPORTED_LANGUAGES,
                });
            }
            return [2 /*return*/, highlighterPromise];
        });
    });
}
// Cache for full themes (from the new full theme system)
var fullThemesCache = new Map();
/**
 * Load a full VS Code theme into Shiki
 * This handles themes from the new full theme system (BUILTIN_THEMES, imported, discovered)
 */
function loadFullTheme(theme) {
    return __awaiter(this, void 0, void 0, function () {
        var highlighter, shikiTheme, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Skip if already loaded
                    if (fullThemesCache.has(theme.id)) {
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, getHighlighter()];
                case 1:
                    highlighter = _a.sent();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    shikiTheme = {
                        name: theme.id,
                        type: theme.type,
                        colors: theme.colors,
                        tokenColors: theme.tokenColors || [],
                    };
                    return [4 /*yield*/, highlighter.loadTheme(shikiTheme)];
                case 3:
                    _a.sent();
                    fullThemesCache.set(theme.id, shikiTheme);
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    console.error("Failed to load full theme ".concat(theme.id, ":"), error_1);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
/**
 * Check if a theme is a Shiki bundled theme (not our custom builtin themes)
 */
function isShikiBundledTheme(themeId) {
    // These are the Shiki bundled themes that we load
    return DEFAULT_THEMES.includes(themeId);
}
/**
 * Get the theme to use for syntax highlighting
 * Returns the theme ID (either bundled or custom loaded)
 */
function getShikiThemeForHighlighting(themeId) {
    // If there's a direct mapping to a bundled theme, use it
    if (themeId in THEME_TO_SHIKI_MAP) {
        return THEME_TO_SHIKI_MAP[themeId];
    }
    // If it's already a shiki bundled theme, use it directly
    if (isShikiBundledTheme(themeId)) {
        return themeId;
    }
    // If the theme is loaded in our cache (has tokenColors), use it directly
    if (fullThemesCache.has(themeId)) {
        return themeId;
    }
    // Check the theme type and use appropriate default
    var builtinTheme = (0, builtin_themes_1.getBuiltinThemeById)(themeId);
    if (builtinTheme) {
        // If the theme has tokenColors, load it and use it
        if (builtinTheme.tokenColors && builtinTheme.tokenColors.length > 0) {
            return themeId; // Will be loaded by ensureThemeLoaded
        }
        return builtinTheme.type === "light" ? "github-light" : "github-dark";
    }
    // Default to github-dark
    return "github-dark";
}
/**
 * Ensure a theme is loaded (built-in or bundled)
 * This should be called before using a theme for highlighting
 */
function ensureThemeLoaded(themeId) {
    return __awaiter(this, void 0, void 0, function () {
        var builtinFullTheme;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Check if it's a Shiki bundled theme (always available)
                    if (isShikiBundledTheme(themeId)) {
                        return [2 /*return*/];
                    }
                    // Check if already loaded in our cache
                    if (fullThemesCache.has(themeId)) {
                        return [2 /*return*/];
                    }
                    builtinFullTheme = (0, builtin_themes_1.getBuiltinThemeById)(themeId);
                    if (!builtinFullTheme) return [3 /*break*/, 2];
                    return [4 /*yield*/, loadFullTheme(builtinFullTheme)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
                case 2:
                    // Check if it's a legacy builtin theme (from vscode-themes.ts)
                    if ((0, vscode_themes_1.isBuiltinTheme)(themeId)) {
                        // These should also be Shiki bundled, but just in case
                        return [2 /*return*/];
                    }
                    // Theme not found - this is an error case
                    console.warn("Theme ".concat(themeId, " not found, falling back to github-dark"));
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Check if a theme is available (loaded or can be loaded)
 */
function isThemeAvailable(themeId) {
    return (isShikiBundledTheme(themeId) ||
        fullThemesCache.has(themeId) ||
        !!(0, builtin_themes_1.getBuiltinThemeById)(themeId) ||
        (0, vscode_themes_1.isBuiltinTheme)(themeId));
}
/**
 * Highlight code with a specific theme
 * Uses custom themes with tokenColors when available, otherwise maps to bundled themes
 * Results are cached to prevent re-highlighting when switching tabs
 */
function highlightCode(code, language, themeId) {
    return __awaiter(this, void 0, void 0, function () {
        var cacheKey, cached, highlighter, shikiTheme, loadedLangs, lang, html, match, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    cacheKey = "".concat(themeId, ":").concat(language, ":").concat(code);
                    cached = highlightCache.get(cacheKey);
                    if (cached !== undefined) {
                        return [2 /*return*/, cached];
                    }
                    return [4 /*yield*/, getHighlighter()
                        // Ensure the theme is loaded (if it's a custom theme with tokenColors)
                    ];
                case 1:
                    highlighter = _a.sent();
                    // Ensure the theme is loaded (if it's a custom theme with tokenColors)
                    return [4 /*yield*/, ensureThemeLoaded(themeId)
                        // Get the theme to use for highlighting
                    ];
                case 2:
                    // Ensure the theme is loaded (if it's a custom theme with tokenColors)
                    _a.sent();
                    shikiTheme = getShikiThemeForHighlighting(themeId);
                    loadedLangs = highlighter.getLoadedLanguages();
                    lang = loadedLangs.includes(language)
                        ? language
                        : "plaintext";
                    html = highlighter.codeToHtml(code, {
                        lang: lang,
                        theme: shikiTheme,
                    });
                    match = html.match(/<code[^>]*>([\s\S]*?)<\/code>/);
                    result = match ? match[1] : code;
                    // Cache the result
                    highlightCache.set(cacheKey, result);
                    return [2 /*return*/, result];
            }
        });
    });
}
/**
 * Get all loaded theme IDs
 */
function getLoadedThemes() {
    return __awaiter(this, void 0, void 0, function () {
        var highlighter;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getHighlighter()];
                case 1:
                    highlighter = _a.sent();
                    return [2 /*return*/, highlighter.getLoadedThemes()];
            }
        });
    });
}
