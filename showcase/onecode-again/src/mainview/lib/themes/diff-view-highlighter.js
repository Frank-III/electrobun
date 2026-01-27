"use strict";
/**
 * Custom Diff View Highlighter Integration
 *
 * Creates a custom DiffHighlighter that uses our shiki theme mapping
 * instead of the hardcoded github-dark/github-light themes
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
exports.setDiffViewTheme = setDiffViewTheme;
exports.createCustomDiffHighlighter = createCustomDiffHighlighter;
exports.getDiffHighlighter = getDiffHighlighter;
exports.preloadDiffHighlighter = preloadDiffHighlighter;
var shiki_theme_loader_1 = require("./shiki-theme-loader");
// Shiki themes we load
var SHIKI_THEMES = [
    "github-dark",
    "github-light",
    "vitesse-dark",
    "vitesse-light",
    "min-dark",
    "min-light",
    "vesper",
];
/**
 * Map our custom theme IDs to Shiki bundled themes
 */
var THEME_TO_SHIKI_MAP = {
    "21st-dark": "github-dark",
    "21st-light": "github-light",
    "claude-dark": "github-dark",
    "claude-light": "github-light",
    "vesper-dark": "vesper",
    "vitesse-dark": "vitesse-dark",
    "vitesse-light": "vitesse-light",
    "min-dark": "min-dark",
    "min-light": "min-light",
};
/**
 * Get the Shiki bundled theme for a given theme ID
 */
function getShikiTheme(themeId, isDark) {
    if (themeId in THEME_TO_SHIKI_MAP) {
        return THEME_TO_SHIKI_MAP[themeId];
    }
    return isDark ? "github-dark" : "github-light";
}
// Current theme state - updated by the component
var currentThemeId = "21st-dark";
/**
 * Set the current theme ID for highlighting
 */
function setDiffViewTheme(themeId) {
    currentThemeId = themeId;
}
/**
 * Process AST into syntax lines for diff view
 */
function processAST(ast) {
    var lineNumber = 1;
    var syntaxObj = {};
    var loopAST = function (nodes, wrapper) {
        nodes.forEach(function (node) {
            if (node.type === "text") {
                if (node.value.indexOf("\n") === -1) {
                    var valueLength = node.value.length;
                    if (!syntaxObj[lineNumber]) {
                        node.startIndex = 0;
                        node.endIndex = valueLength - 1;
                        syntaxObj[lineNumber] = {
                            value: node.value,
                            lineNumber: lineNumber,
                            valueLength: valueLength,
                            nodeList: [{ node: node, wrapper: wrapper }],
                        };
                    }
                    else {
                        node.startIndex = syntaxObj[lineNumber].valueLength;
                        node.endIndex = node.startIndex + valueLength - 1;
                        syntaxObj[lineNumber].value += node.value;
                        syntaxObj[lineNumber].valueLength += valueLength;
                        syntaxObj[lineNumber].nodeList.push({ node: node, wrapper: wrapper });
                    }
                    node.lineNumber = lineNumber;
                    return;
                }
                var lines = node.value.split("\n");
                node.children = node.children || [];
                for (var i = 0; i < lines.length; i++) {
                    var _value = i === lines.length - 1 ? lines[i] : lines[i] + "\n";
                    var _lineNumber = i === 0 ? lineNumber : ++lineNumber;
                    var _valueLength = _value.length;
                    var _node = {
                        type: "text",
                        value: _value,
                        startIndex: Infinity,
                        endIndex: Infinity,
                        lineNumber: _lineNumber,
                    };
                    if (!syntaxObj[_lineNumber]) {
                        _node.startIndex = 0;
                        _node.endIndex = _valueLength - 1;
                        syntaxObj[_lineNumber] = {
                            value: _value,
                            lineNumber: _lineNumber,
                            valueLength: _valueLength,
                            nodeList: [{ node: _node, wrapper: wrapper }],
                        };
                    }
                    else {
                        _node.startIndex = syntaxObj[_lineNumber].valueLength;
                        _node.endIndex = _node.startIndex + _valueLength - 1;
                        syntaxObj[_lineNumber].value += _value;
                        syntaxObj[_lineNumber].valueLength += _valueLength;
                        syntaxObj[_lineNumber].nodeList.push({ node: _node, wrapper: wrapper });
                    }
                    node.children.push(_node);
                }
                node.lineNumber = lineNumber;
                return;
            }
            if (node.children) {
                loopAST(node.children, node);
                node.lineNumber = lineNumber;
            }
        });
    };
    loopAST(ast.children);
    return { syntaxFileObject: syntaxObj, syntaxFileLineNumber: lineNumber };
}
// Cached highlighter instance
var cachedHighlighter = null;
// Configuration
// Set very high limit (100k lines) to effectively enable syntax highlighting for all files
// Only extremely large files will skip highlighting for performance
var maxLineToIgnoreSyntax = 100000;
var ignoreSyntaxHighlightList = [];
/**
 * Create a custom DiffHighlighter that uses our theme mapping
 */
function createCustomDiffHighlighter() {
    return __awaiter(this, void 0, void 0, function () {
        var highlighter, loadedThemes, _i, SHIKI_THEMES_1, theme, _a, diffHighlighter;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, (0, shiki_theme_loader_1.getHighlighter)()
                    // Load additional themes if not already loaded
                ];
                case 1:
                    highlighter = _b.sent();
                    loadedThemes = highlighter.getLoadedThemes();
                    _i = 0, SHIKI_THEMES_1 = SHIKI_THEMES;
                    _b.label = 2;
                case 2:
                    if (!(_i < SHIKI_THEMES_1.length)) return [3 /*break*/, 7];
                    theme = SHIKI_THEMES_1[_i];
                    if (!!loadedThemes.includes(theme)) return [3 /*break*/, 6];
                    _b.label = 3;
                case 3:
                    _b.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, highlighter.loadTheme(theme)];
                case 4:
                    _b.sent();
                    return [3 /*break*/, 6];
                case 5:
                    _a = _b.sent();
                    return [3 /*break*/, 6];
                case 6:
                    _i++;
                    return [3 /*break*/, 2];
                case 7:
                    cachedHighlighter = highlighter;
                    diffHighlighter = {
                        name: "shiki-custom",
                        type: "class",
                        get maxLineToIgnoreSyntax() {
                            return maxLineToIgnoreSyntax;
                        },
                        setMaxLineToIgnoreSyntax: function (v) {
                            maxLineToIgnoreSyntax = v;
                        },
                        get ignoreSyntaxHighlightList() {
                            return ignoreSyntaxHighlightList;
                        },
                        setIgnoreSyntaxHighlightList: function (v) {
                            ignoreSyntaxHighlightList.length = 0;
                            ignoreSyntaxHighlightList.push.apply(ignoreSyntaxHighlightList, v);
                        },
                        getAST: function (raw, fileName, lang, theme) {
                            // Check if file should be ignored
                            if (fileName && ignoreSyntaxHighlightList.some(function (item) {
                                return item instanceof RegExp ? item.test(fileName) : fileName === item;
                            })) {
                                return undefined;
                            }
                            try {
                                var isDark = theme === "dark";
                                var shikiTheme = getShikiTheme(currentThemeId, isDark);
                                return highlighter.codeToHast(raw, {
                                    lang: lang || "plaintext",
                                    themes: {
                                        dark: shikiTheme,
                                        light: shikiTheme,
                                    },
                                    cssVariablePrefix: "--diff-view-",
                                    defaultColor: false,
                                    mergeWhitespaces: false,
                                });
                            }
                            catch (e) {
                                console.error("Diff highlighter error:", e);
                                return undefined;
                            }
                        },
                        processAST: processAST,
                        hasRegisteredCurrentLang: function (lang) {
                            return highlighter.getLoadedLanguages().includes(lang);
                        },
                        getHighlighterEngine: function () {
                            return cachedHighlighter;
                        },
                    };
                    return [2 /*return*/, diffHighlighter];
            }
        });
    });
}
// Cached promise
var highlighterPromise = null;
/**
 * Get or create the custom diff highlighter
 */
function getDiffHighlighter() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (!highlighterPromise) {
                highlighterPromise = createCustomDiffHighlighter();
            }
            return [2 /*return*/, highlighterPromise];
        });
    });
}
/**
 * Preload the diff highlighter on app start
 * This prevents the delay when opening the diff view for the first time
 */
function preloadDiffHighlighter() {
    // Start loading in background, don't block
    getDiffHighlighter().catch(function (err) {
        console.warn("[preloadDiffHighlighter] Failed to preload:", err);
    });
}
