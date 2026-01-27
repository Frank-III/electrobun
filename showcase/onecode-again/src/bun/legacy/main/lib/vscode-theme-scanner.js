"use strict";
/**
 * VS Code Theme Scanner
 *
 * Scans local VS Code extensions directories to discover installed themes.
 * Supports VS Code, VS Code Insiders, Cursor, and Windsurf.
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
exports.scanVSCodeThemes = scanVSCodeThemes;
exports.loadThemeFromPath = loadThemeFromPath;
exports.registerThemeScannerIPC = registerThemeScannerIPC;
var fs = require("fs/promises");
var path = require("path");
var os = require("os");
var electron_1 = require("electron");
// No caching - always scan fresh to avoid issues
/**
 * Extension paths for different VS Code variants
 */
var EXTENSION_PATHS = [
    // VS Code
    { path: path.join(os.homedir(), ".vscode", "extensions"), source: "vscode" },
    // VS Code Insiders
    { path: path.join(os.homedir(), ".vscode-insiders", "extensions"), source: "vscode-insiders" },
    // Cursor
    { path: path.join(os.homedir(), ".cursor", "extensions"), source: "cursor" },
    // Windsurf
    { path: path.join(os.homedir(), ".windsurf", "extensions"), source: "windsurf" },
];
/**
 * Check if a directory exists
 */
function directoryExists(dirPath) {
    return __awaiter(this, void 0, void 0, function () {
        var stat, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fs.stat(dirPath)];
                case 1:
                    stat = _b.sent();
                    return [2 /*return*/, stat.isDirectory()];
                case 2:
                    _a = _b.sent();
                    return [2 /*return*/, false];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Detect theme type from colors
 */
function detectThemeType(colors) {
    if (!colors)
        return "dark";
    var bgColor = colors["editor.background"] || colors["editorPane.background"] || "#000000";
    var hex = bgColor.replace(/^#/, "");
    // Handle shorthand hex
    var r, g, b;
    if (hex.length === 3) {
        r = parseInt(hex[0] + hex[0], 16);
        g = parseInt(hex[1] + hex[1], 16);
        b = parseInt(hex[2] + hex[2], 16);
    }
    else if (hex.length >= 6) {
        r = parseInt(hex.slice(0, 2), 16);
        g = parseInt(hex.slice(2, 4), 16);
        b = parseInt(hex.slice(4, 6), 16);
    }
    else {
        return "dark";
    }
    // Calculate perceived brightness using ITU-R BT.709 coefficients
    var brightness = r * 0.2126 + g * 0.7152 + b * 0.0722;
    return brightness > 128 ? "light" : "dark";
}
/**
 * Map VS Code uiTheme to our theme type
 */
function mapUiTheme(uiTheme) {
    if (!uiTheme)
        return "dark";
    // VS Code uses: "vs" (light), "vs-dark" (dark), "hc-black" (high contrast dark), "hc-light" (high contrast light)
    return uiTheme === "vs" || uiTheme === "hc-light" ? "light" : "dark";
}
/**
 * Scan a single extensions directory
 */
function scanExtensionsDir(extensionsDir, source) {
    return __awaiter(this, void 0, void 0, function () {
        var themes, execSync, lsOutput, lsEntries, entries_final, _i, entries_final_1, entry, extDir, packageJsonPath, packageJsonContent, manifest, themeContributions, _a, themeContributions_1, theme, themePath, actualThemeName, themeContent, jsonContent, themeData, _b, themeName, fileBasename, themeId, _c, error_1;
        var _this = this;
        var _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    themes = [];
                    return [4 /*yield*/, directoryExists(extensionsDir)];
                case 1:
                    if (!(_e.sent())) {
                        return [2 /*return*/, themes];
                    }
                    _e.label = 2;
                case 2:
                    _e.trys.push([2, 17, , 18]);
                    execSync = require("child_process").execSync;
                    lsOutput = execSync("ls -1 \"".concat(extensionsDir, "\""), { encoding: "utf-8" });
                    lsEntries = lsOutput.trim().split("\n").filter(Boolean);
                    return [4 /*yield*/, Promise.all(lsEntries.map(function (name) { return __awaiter(_this, void 0, void 0, function () {
                            var fullPath, stat_1, _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        fullPath = path.join(extensionsDir, name);
                                        _b.label = 1;
                                    case 1:
                                        _b.trys.push([1, 3, , 4]);
                                        return [4 /*yield*/, fs.stat(fullPath)];
                                    case 2:
                                        stat_1 = _b.sent();
                                        return [2 /*return*/, {
                                                name: name,
                                                isDirectory: function () { return stat_1.isDirectory(); },
                                            }];
                                    case 3:
                                        _a = _b.sent();
                                        return [2 /*return*/, { name: name, isDirectory: function () { return false; } }];
                                    case 4: return [2 /*return*/];
                                }
                            });
                        }); }))];
                case 3:
                    entries_final = _e.sent();
                    _i = 0, entries_final_1 = entries_final;
                    _e.label = 4;
                case 4:
                    if (!(_i < entries_final_1.length)) return [3 /*break*/, 16];
                    entry = entries_final_1[_i];
                    if (!entry.isDirectory())
                        return [3 /*break*/, 15];
                    extDir = entry.name;
                    packageJsonPath = path.join(extensionsDir, extDir, "package.json");
                    _e.label = 5;
                case 5:
                    _e.trys.push([5, 14, , 15]);
                    return [4 /*yield*/, fs.readFile(packageJsonPath, "utf-8")];
                case 6:
                    packageJsonContent = _e.sent();
                    manifest = JSON.parse(packageJsonContent);
                    themeContributions = ((_d = manifest.contributes) === null || _d === void 0 ? void 0 : _d.themes) || [];
                    _a = 0, themeContributions_1 = themeContributions;
                    _e.label = 7;
                case 7:
                    if (!(_a < themeContributions_1.length)) return [3 /*break*/, 13];
                    theme = themeContributions_1[_a];
                    if (!theme.path)
                        return [3 /*break*/, 12];
                    themePath = path.join(extensionsDir, extDir, theme.path);
                    actualThemeName = void 0;
                    _e.label = 8;
                case 8:
                    _e.trys.push([8, 10, , 11]);
                    return [4 /*yield*/, fs.readFile(themePath, "utf-8")
                        // Handle JSONC (JSON with comments and trailing commas)
                    ];
                case 9:
                    themeContent = _e.sent();
                    jsonContent = themeContent
                        .replace(/\/\/.*$/gm, "") // Remove single-line comments
                        .replace(/\/\*[\s\S]*?\*\//g, "") // Remove multi-line comments
                        .replace(/,(\s*[}\]])/g, "$1") // Remove trailing commas
                    ;
                    themeData = JSON.parse(jsonContent);
                    actualThemeName = themeData.name;
                    return [3 /*break*/, 11];
                case 10:
                    _b = _e.sent();
                    return [3 /*break*/, 12];
                case 11:
                    themeName = actualThemeName || theme.label || theme.id || path.basename(theme.path, ".json");
                    fileBasename = path.basename(theme.path, ".json");
                    themeId = "vscode-".concat(extDir, "-").concat(fileBasename).replace(/[^a-zA-Z0-9-_]/g, "-");
                    themes.push({
                        id: themeId,
                        name: themeName,
                        type: mapUiTheme(theme.uiTheme),
                        extensionId: extDir,
                        extensionName: manifest.displayName || manifest.name || extDir,
                        path: themePath,
                        source: source,
                    });
                    _e.label = 12;
                case 12:
                    _a++;
                    return [3 /*break*/, 7];
                case 13: return [3 /*break*/, 15];
                case 14:
                    _c = _e.sent();
                    // Skip extensions with invalid package.json
                    return [3 /*break*/, 15];
                case 15:
                    _i++;
                    return [3 /*break*/, 4];
                case 16: return [3 /*break*/, 18];
                case 17:
                    error_1 = _e.sent();
                    console.error("Error scanning extensions directory ".concat(extensionsDir, ":"), error_1);
                    return [3 /*break*/, 18];
                case 18: return [2 /*return*/, themes];
            }
        });
    });
}
/**
 * Scan all VS Code extension directories for themes
 */
function scanVSCodeThemes() {
    return __awaiter(this, void 0, void 0, function () {
        var allThemes, seenPaths, _i, EXTENSION_PATHS_1, _a, extensionsDir, source, themes, _b, themes_1, theme, uniqueKey;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    allThemes = [];
                    seenPaths = new Set();
                    _i = 0, EXTENSION_PATHS_1 = EXTENSION_PATHS;
                    _c.label = 1;
                case 1:
                    if (!(_i < EXTENSION_PATHS_1.length)) return [3 /*break*/, 4];
                    _a = EXTENSION_PATHS_1[_i], extensionsDir = _a.path, source = _a.source;
                    return [4 /*yield*/, scanExtensionsDir(extensionsDir, source)];
                case 2:
                    themes = _c.sent();
                    for (_b = 0, themes_1 = themes; _b < themes_1.length; _b++) {
                        theme = themes_1[_b];
                        uniqueKey = "".concat(theme.extensionId, "-").concat(path.basename(theme.path));
                        if (!seenPaths.has(uniqueKey)) {
                            seenPaths.add(uniqueKey);
                            allThemes.push(theme);
                        }
                    }
                    _c.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4:
                    // Sort by extension name, then theme name
                    allThemes.sort(function (a, b) {
                        var extCompare = a.extensionName.localeCompare(b.extensionName);
                        if (extCompare !== 0)
                            return extCompare;
                        return a.name.localeCompare(b.name);
                    });
                    return [2 /*return*/, allThemes];
            }
        });
    });
}
/**
 * Load full theme data from a theme file path
 */
function loadThemeFromPath(themePath) {
    return __awaiter(this, void 0, void 0, function () {
        var content, jsonContent, theme, id;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fs.readFile(themePath, "utf-8")
                    // Handle JSONC (JSON with comments and trailing commas) - VS Code theme files use this format
                ];
                case 1:
                    content = _a.sent();
                    jsonContent = content
                        .replace(/\/\/.*$/gm, "") // Remove single-line comments
                        .replace(/\/\*[\s\S]*?\*\//g, "") // Remove multi-line comments
                        .replace(/,(\s*[}\]])/g, "$1") // Remove trailing commas
                    ;
                    theme = JSON.parse(jsonContent);
                    id = "imported-".concat(Date.now(), "-").concat(Math.random().toString(36).slice(2, 8));
                    return [2 /*return*/, {
                            id: id,
                            name: theme.name || path.basename(themePath, ".json"),
                            type: detectThemeType(theme.colors),
                            colors: theme.colors || {},
                            tokenColors: theme.tokenColors,
                            semanticHighlighting: theme.semanticHighlighting,
                            semanticTokenColors: theme.semanticTokenColors,
                            source: "imported",
                            path: themePath,
                        }];
            }
        });
    });
}
/**
 * Register IPC handlers for theme scanning
 */
var ipcRegistered = false;
function registerThemeScannerIPC() {
    var _this = this;
    if (ipcRegistered) {
        return;
    }
    ipcRegistered = true;
    electron_1.ipcMain.handle("vscode:scan-themes", function () { return __awaiter(_this, void 0, void 0, function () {
        var themes, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, scanVSCodeThemes()];
                case 1:
                    themes = _a.sent();
                    return [2 /*return*/, themes];
                case 2:
                    error_2 = _a.sent();
                    console.error("Error scanning VS Code themes:", error_2);
                    throw error_2;
                case 3: return [2 /*return*/];
            }
        });
    }); });
    electron_1.ipcMain.handle("vscode:load-theme", function (_, themePath) { return __awaiter(_this, void 0, void 0, function () {
        var normalizedPath_1, isAllowedPath, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    normalizedPath_1 = path.normalize(themePath);
                    isAllowedPath = EXTENSION_PATHS.some(function (_a) {
                        var allowedDir = _a.path;
                        var normalizedAllowed = path.normalize(allowedDir);
                        // Ensure we check with path separator to avoid partial matches
                        return normalizedPath_1.startsWith(normalizedAllowed + path.sep) ||
                            normalizedPath_1.startsWith(normalizedAllowed);
                    });
                    if (!isAllowedPath) {
                        throw new Error("Theme path is not within allowed directories");
                    }
                    return [4 /*yield*/, loadThemeFromPath(normalizedPath_1)];
                case 1: return [2 /*return*/, _a.sent()];
                case 2:
                    error_3 = _a.sent();
                    console.error("Error loading VS Code theme:", error_3);
                    throw error_3;
                case 3: return [2 /*return*/];
            }
        });
    }); });
}
