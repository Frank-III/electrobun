"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.AgentsAppearanceTab = AgentsAppearanceTab;
var use_theme_1 = require("../../../lib/hooks/use-theme");
var solid_js_1 = require("solid-js");
var icons_1 = require("../../../icons");
var jotai_1 = require("../../../lib/state/jotai");
var react_1 = require("motion/react");
var utils_1 = require("../../../lib/utils");
var atoms_1 = require("../../../lib/atoms");
var builtin_themes_1 = require("../../../lib/themes/builtin-themes");
var vscode_to_css_mapping_1 = require("../../../lib/themes/vscode-to-css-mapping");
var select_1 = require("../../../components/ui/select");
var switch_1 = require("../../../components/ui/switch");
// Hook to detect narrow screen
function useIsNarrowScreen() {
    var _a = (0, solid_js_1.createSignal)(false), isNarrow = _a[0], setIsNarrow = _a[1];
    (0, solid_js_1.createEffect)(function () {
        var checkWidth = function () {
            setIsNarrow(window.innerWidth <= 768);
        };
        checkWidth();
        window.addEventListener("resize", checkWidth);
        return function () { return window.removeEventListener("resize", checkWidth); };
    });
    return isNarrow;
}
// Check if a hex color is visible (not too transparent)
function isVisibleColor(hex) {
    if (!hex)
        return false;
    // Remove # if present
    var cleanHex = hex.replace(/^#/, "");
    // If 8 characters, check alpha
    if (cleanHex.length === 8) {
        var alpha = parseInt(cleanHex.slice(6, 8), 16);
        // Consider colors with less than 50% opacity as "not visible" for accent purposes
        return alpha >= 128;
    }
    return true;
}
// Theme preview box with dot and "Aa" text
function ThemePreviewBox(_a) {
    var _b;
    var theme = _a.theme, _c = _a.size, size = _c === void 0 ? "md" : _c, className = _a.className;
    var bgColor = ((_b = theme === null || theme === void 0 ? void 0 : theme.colors) === null || _b === void 0 ? void 0 : _b["editor.background"]) || "#1a1a1a";
    // Get accent color, preferring button.background and skipping transparent colors
    var getAccentColor = function () {
        var _a, _b, _c, _d;
        var candidates = [
            (_a = theme === null || theme === void 0 ? void 0 : theme.colors) === null || _a === void 0 ? void 0 : _a["button.background"],
            (_b = theme === null || theme === void 0 ? void 0 : theme.colors) === null || _b === void 0 ? void 0 : _b["textLink.foreground"],
            (_c = theme === null || theme === void 0 ? void 0 : theme.colors) === null || _c === void 0 ? void 0 : _c["focusBorder"],
            (_d = theme === null || theme === void 0 ? void 0 : theme.colors) === null || _d === void 0 ? void 0 : _d["activityBarBadge.background"]
        ];
        for (var _i = 0, candidates_1 = candidates; _i < candidates_1.length; _i++) {
            var color = candidates_1[_i];
            if (isVisibleColor(color)) {
                return color;
            }
        }
        return "#0034FF";
    };
    var accentColor = getAccentColor();
    var isDark = theme ? theme.type === "dark" : true;
    var sizeClasses = size === "sm" ? "w-7 h-5 text-[9px] gap-0.5 rounded-sm" : "w-8 h-6 text-[10px] gap-1 rounded-sm";
    var dotSize = size === "sm" ? "w-1 h-1" : "w-1.5 h-1.5";
    return <div class={(0, utils_1.cn)("flex-shrink-0 flex items-center justify-center font-semibold", sizeClasses, className)} style={{
            backgroundColor: bgColor,
            boxShadow: "inset 0 0 0 0.5px rgba(128, 128, 128, 0.3)"
        }}>
      {/* Accent dot to the left of text */}
      <div class={(0, utils_1.cn)("rounded-full flex-shrink-0", dotSize)} style={{ backgroundColor: accentColor }}/>
      <span style={{
            color: isDark ? "#fff" : "#000",
            opacity: .9
        }}>Aa</span>
    </div>;
}
function AgentsAppearanceTab() {
    var _this = this;
    var _a = (0, use_theme_1.useTheme)(), resolvedTheme = _a.resolvedTheme, setNextTheme = _a.setTheme;
    var _b = (0, solid_js_1.createSignal)(false), mounted = _b[0], setMounted = _b[1];
    var isNarrowScreen = useIsNarrowScreen();
    // Theme atoms
    var _c = (0, jotai_1.useAtom)(atoms_1.selectedFullThemeIdAtom), selectedThemeId = _c[0], setSelectedThemeId = _c[1];
    var _d = (0, jotai_1.useAtom)(atoms_1.systemLightThemeIdAtom), systemLightThemeId = _d[0], setSystemLightThemeId = _d[1];
    var _e = (0, jotai_1.useAtom)(atoms_1.systemDarkThemeIdAtom), systemDarkThemeId = _e[0], setSystemDarkThemeId = _e[1];
    var setFullThemeData = (0, jotai_1.useSetAtom)(atoms_1.fullThemeDataAtom);
    var _f = (0, jotai_1.useAtom)(atoms_1.importedThemesAtom), importedThemes = _f[0], setImportedThemes = _f[1];
    // Sidebar settings
    var _g = (0, jotai_1.useAtom)(atoms_1.showWorkspaceIconAtom), showWorkspaceIcon = _g[0], setShowWorkspaceIcon = _g[1];
    // To-do list preference
    var _h = (0, jotai_1.useAtom)(atoms_1.alwaysExpandTodoListAtom), alwaysExpandTodoList = _h[0], setAlwaysExpandTodoList = _h[1];
    // VS Code themes state
    var _j = (0, solid_js_1.createSignal)(false), isScanning = _j[0], setIsScanning = _j[1];
    (0, solid_js_1.createEffect)(function () {
        setMounted(true);
    });
    // Scan and load VS Code themes on mount
    (0, solid_js_1.createEffect)(function () {
        if (!mounted)
            return;
        var api = window.desktopApi;
        if (typeof (api === null || api === void 0 ? void 0 : api.scanVSCodeThemes) !== "function")
            return;
        if (typeof (api === null || api === void 0 ? void 0 : api.loadVSCodeTheme) !== "function")
            return;
        var loadAllThemes = function () { return __awaiter(_this, void 0, void 0, function () {
            var discovered, newThemes, loadedThemes, validThemes, error_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        setIsScanning(true);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, 5, 6]);
                        return [4 /*yield*/, api.scanVSCodeThemes()];
                    case 2:
                        discovered = _a.sent();
                        newThemes = discovered.filter(function (t) { return !builtin_themes_1.BUILTIN_THEME_NAMES.has(t.name.toLowerCase()); });
                        return [4 /*yield*/, Promise.all(newThemes.map(function (theme) { return __awaiter(_this, void 0, void 0, function () {
                                var fullTheme, err_1;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            _a.trys.push([0, 2, , 3]);
                                            return [4 /*yield*/, api.loadVSCodeTheme(theme.path)];
                                        case 1:
                                            fullTheme = _a.sent();
                                            return [2 /*return*/, __assign(__assign({}, fullTheme), { id: theme.id, source: "imported" })];
                                        case 2:
                                            err_1 = _a.sent();
                                            console.error("[appearance-tab] Failed to load theme:", theme.name, err_1);
                                            return [2 /*return*/, null];
                                        case 3: return [2 /*return*/];
                                    }
                                });
                            }); }))];
                    case 3:
                        loadedThemes = _a.sent();
                        validThemes = loadedThemes.filter(function (t) { return t !== null; });
                        setImportedThemes(validThemes);
                        return [3 /*break*/, 6];
                    case 4:
                        error_1 = _a.sent();
                        console.error("Failed to load VS Code themes:", error_1);
                        return [3 /*break*/, 6];
                    case 5:
                        setIsScanning(false);
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        }); };
        loadAllThemes();
    });
    // Group themes by type
    var darkThemes = (0, solid_js_1.createMemo)(function () { return builtin_themes_1.BUILTIN_THEMES.filter(function (t) { return t.type === "dark"; }); });
    var lightThemes = (0, solid_js_1.createMemo)(function () { return builtin_themes_1.BUILTIN_THEMES.filter(function (t) { return t.type === "light"; }); });
    // Is system mode selected
    var isSystemMode = selectedThemeId === null;
    // Get the current theme for display
    var currentTheme = (0, solid_js_1.createMemo)(function () {
        if (selectedThemeId === null) {
            return null;
        }
        // Check in both builtin and imported themes
        return builtin_themes_1.BUILTIN_THEMES.find(function (t) { return t.id === selectedThemeId; }) || importedThemes.find(function (t) { return t.id === selectedThemeId; }) || null;
    });
    // Get theme objects for system mode selectors
    var systemLightTheme = (0, solid_js_1.createMemo)(function () { return (0, builtin_themes_1.getBuiltinThemeById)(systemLightThemeId); });
    var systemDarkTheme = (0, solid_js_1.createMemo)(function () { return (0, builtin_themes_1.getBuiltinThemeById)(systemDarkThemeId); });
    // Apply theme based on current settings
    var applyTheme = function (themeId) {
        if (themeId === null) {
            // System mode - apply theme based on system preference
            (0, vscode_to_css_mapping_1.removeCSSVariables)();
            setFullThemeData(null);
            setNextTheme("system");
            // Apply the appropriate system theme
            var isDark = resolvedTheme() === "dark";
            var systemTheme = isDark ? (0, builtin_themes_1.getBuiltinThemeById)(systemDarkThemeId) : (0, builtin_themes_1.getBuiltinThemeById)(systemLightThemeId);
            if (systemTheme) {
                var cssVars = (0, vscode_to_css_mapping_1.generateCSSVariables)(systemTheme.colors);
                (0, vscode_to_css_mapping_1.applyCSSVariables)(cssVars);
            }
            return;
        }
        // Check in both builtin and imported themes
        var theme = builtin_themes_1.BUILTIN_THEMES.find(function (t) { return t.id === themeId; }) || importedThemes.find(function (t) { return t.id === themeId; });
        if (theme) {
            setFullThemeData(theme);
            // Apply CSS variables
            var cssVars = (0, vscode_to_css_mapping_1.generateCSSVariables)(theme.colors);
            (0, vscode_to_css_mapping_1.applyCSSVariables)(cssVars);
            // Sync color mode with theme type
            var themeType = (0, vscode_to_css_mapping_1.getThemeTypeFromColors)(theme.colors);
            setNextTheme(themeType);
        }
    };
    // Handle main theme selection
    var handleThemeChange = function (value) {
        if (value === "system") {
            setSelectedThemeId(null);
            applyTheme(null);
        }
        else {
            setSelectedThemeId(value);
            applyTheme(value);
        }
    };
    // Handle system light theme change
    var handleSystemLightThemeChange = function (themeId) {
        setSystemLightThemeId(themeId);
        // If currently in light mode, apply the new theme
        if (resolvedTheme() === "light" && selectedThemeId === null) {
            var theme = (0, builtin_themes_1.getBuiltinThemeById)(themeId);
            if (theme) {
                var cssVars = (0, vscode_to_css_mapping_1.generateCSSVariables)(theme.colors);
                (0, vscode_to_css_mapping_1.applyCSSVariables)(cssVars);
            }
        }
    };
    // Handle system dark theme change
    var handleSystemDarkThemeChange = function (themeId) {
        setSystemDarkThemeId(themeId);
        // If currently in dark mode, apply the new theme
        if (resolvedTheme() === "dark" && selectedThemeId === null) {
            var theme = (0, builtin_themes_1.getBuiltinThemeById)(themeId);
            if (theme) {
                var cssVars = (0, vscode_to_css_mapping_1.generateCSSVariables)(theme.colors);
                (0, vscode_to_css_mapping_1.applyCSSVariables)(cssVars);
            }
        }
    };
    // Group imported themes by type
    var importedDarkThemes = (0, solid_js_1.createMemo)(function () { return importedThemes.filter(function (t) { return t.type === "dark"; }); });
    var importedLightThemes = (0, solid_js_1.createMemo)(function () { return importedThemes.filter(function (t) { return t.type === "light"; }); });
    // Re-apply theme when system preference changes
    (0, solid_js_1.createEffect)(function () {
        if (selectedThemeId === null && mounted) {
            var isDark = resolvedTheme() === "dark";
            var systemTheme = isDark ? (0, builtin_themes_1.getBuiltinThemeById)(systemDarkThemeId) : (0, builtin_themes_1.getBuiltinThemeById)(systemLightThemeId);
            if (systemTheme) {
                var cssVars = (0, vscode_to_css_mapping_1.generateCSSVariables)(systemTheme.colors);
                (0, vscode_to_css_mapping_1.applyCSSVariables)(cssVars);
            }
        }
    });
    if (!mounted) {
        return <div class="p-6 space-y-6">
        <div class="h-48 flex items-center justify-center">
          <icons_1.IconSpinner class="h-8 w-8 text-foreground"/>
        </div>
      </div>;
    }
    return <div class="p-6 space-y-6 flex-1 overflow-y-auto">
      {/* Header - hidden on narrow screens since it's in the navigation bar */}
      {!isNarrowScreen && <div class="flex flex-col space-y-1.5 text-center sm:text-left">
          <h3 class="text-sm font-semibold text-foreground">Appearance</h3>
          <p class="text-xs text-muted-foreground">
            Customize the look and feel of the interface
          </p>
        </div>}

      {/* Interface Theme Section */}
      <div class="bg-background rounded-lg border border-border overflow-hidden">
        {/* Main theme selector */}
        <div class="flex items-center justify-between p-4">
          <div class="flex flex-col space-y-1">
            <span class="text-sm font-medium text-foreground">
              Interface theme
            </span>
            <span class="text-xs text-muted-foreground">
              Select or customize your interface color scheme
            </span>
          </div>

          <select_1.Select value={selectedThemeId !== null && selectedThemeId !== void 0 ? selectedThemeId : "system"} onValueChange={handleThemeChange}>
            <select_1.SelectTrigger class="w-auto px-2">
              <div class="flex items-center gap-2 min-w-0 -ml-[3px]">
                {isSystemMode ? <>
                    <ThemePreviewBox theme={resolvedTheme() === "dark" ? systemDarkTheme !== null && systemDarkTheme !== void 0 ? systemDarkTheme : null : systemLightTheme !== null && systemLightTheme !== void 0 ? systemLightTheme : null}/>
                    <span class="text-xs truncate">System preference</span>
                  </> : <>
                    <ThemePreviewBox theme={currentTheme}/>
                    <span class="text-xs truncate">
                      {(currentTheme === null || currentTheme === void 0 ? void 0 : currentTheme.name) || "Select"}
                    </span>
                  </>}
              </div>
            </select_1.SelectTrigger>
            <select_1.SelectContent class="max-h-[300px]">
              {/* System preference option */}
              <select_1.SelectItem value="system">
                <div class="flex items-center gap-2">
                  <ThemePreviewBox theme={resolvedTheme() === "dark" ? systemDarkTheme !== null && systemDarkTheme !== void 0 ? systemDarkTheme : null : systemLightTheme !== null && systemLightTheme !== void 0 ? systemLightTheme : null} size="sm"/>
                  <span class="truncate">System preference</span>
                </div>
              </select_1.SelectItem>

              {/* Light themes */}
              {lightThemes.map(function (theme) { return <select_1.SelectItem key={theme.id} value={theme.id}>
                  <div class="flex items-center gap-2">
                    <ThemePreviewBox theme={theme} size="sm"/>
                    <span class="truncate">{theme.name}</span>
                  </div>
                </select_1.SelectItem>; })}

              {/* Dark themes */}
              {darkThemes.map(function (theme) { return <select_1.SelectItem key={theme.id} value={theme.id}>
                  <div class="flex items-center gap-2">
                    <ThemePreviewBox theme={theme} size="sm"/>
                    <span class="truncate">{theme.name}</span>
                  </div>
                </select_1.SelectItem>; })}

              {/* Imported themes from VS Code / Cursor / Windsurf */}
              {importedThemes.length > 0 && <>
                  <select_1.SelectSeparator />
                  <select_1.SelectGroup>
                    <select_1.SelectLabel class="text-xs text-muted-foreground px-2">
                      From editors
                    </select_1.SelectLabel>
                    {importedThemes.map(function (theme) { return <select_1.SelectItem key={theme.id} value={theme.id}>
                        <div class="flex items-center gap-2">
                          <ThemePreviewBox theme={theme} size="sm"/>
                          <span class="truncate">{theme.name}</span>
                        </div>
                      </select_1.SelectItem>; })}
                  </select_1.SelectGroup>
                </>}

              {/* Loading indicator */}
              {isScanning && <>
                  <select_1.SelectSeparator />
                  <div class="flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground">
                    <icons_1.IconSpinner class="h-3 w-3"/>
                    <span>Loading themes from editors...</span>
                  </div>
                </>}
            </select_1.SelectContent>
          </select_1.Select>
        </div>

        {/* Animated Light/Dark theme selectors for system mode */}
        <react_1.AnimatePresence initial={false}>
          {isSystemMode && <react_1.motion.div initial={{
                height: 0,
                opacity: 0
            }} animate={{
                height: "auto",
                opacity: 1
            }} exit={{
                height: 0,
                opacity: 0
            }} transition={{
                height: {
                    type: "spring",
                    stiffness: 300,
                    damping: 30
                },
                opacity: { duration: .2 }
            }} class="overflow-hidden">
              {/* Light theme selector */}
              <div class="flex items-center justify-between p-4 border-t border-border">
                <div class="flex flex-col space-y-1">
                  <span class="text-sm font-medium text-foreground">
                    Light
                  </span>
                  <span class="text-xs text-muted-foreground">
                    Theme to use for light system appearance
                  </span>
                </div>

                <select_1.Select value={systemLightThemeId} onValueChange={handleSystemLightThemeChange}>
                  <select_1.SelectTrigger class="w-auto px-2">
                    <div class="flex items-center gap-2 min-w-0 -ml-[3px]">
                      <ThemePreviewBox theme={systemLightTheme || null}/>
                      <span class="text-xs truncate">
                        {(systemLightTheme === null || systemLightTheme === void 0 ? void 0 : systemLightTheme.name) || "Select"}
                      </span>
                    </div>
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    {lightThemes.map(function (theme) { return <select_1.SelectItem key={theme.id} value={theme.id}>
                        <div class="flex items-center gap-2">
                          <ThemePreviewBox theme={theme} size="sm"/>
                          <span class="truncate">{theme.name}</span>
                        </div>
                      </select_1.SelectItem>; })}
                  </select_1.SelectContent>
                </select_1.Select>
              </div>

              {/* Dark theme selector */}
              <div class="flex items-center justify-between p-4 border-t border-border">
                <div class="flex flex-col space-y-1">
                  <span class="text-sm font-medium text-foreground">
                    Dark
                  </span>
                  <span class="text-xs text-muted-foreground">
                    Theme to use for dark system appearance
                  </span>
                </div>

                <select_1.Select value={systemDarkThemeId} onValueChange={handleSystemDarkThemeChange}>
                  <select_1.SelectTrigger class="w-auto px-2">
                    <div class="flex items-center gap-2 min-w-0 -ml-[3px]">
                      <ThemePreviewBox theme={systemDarkTheme || null}/>
                      <span class="text-xs truncate">
                        {(systemDarkTheme === null || systemDarkTheme === void 0 ? void 0 : systemDarkTheme.name) || "Select"}
                      </span>
                    </div>
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    {darkThemes.map(function (theme) { return <select_1.SelectItem key={theme.id} value={theme.id}>
                        <div class="flex items-center gap-2">
                          <ThemePreviewBox theme={theme} size="sm"/>
                          <span class="truncate">{theme.name}</span>
                        </div>
                      </select_1.SelectItem>; })}
                  </select_1.SelectContent>
                </select_1.Select>
              </div>
            </react_1.motion.div>}
        </react_1.AnimatePresence>
      </div>


      {/* Display Options Section */}
      <div class="bg-background rounded-lg border border-border overflow-hidden">
        <div class="flex items-center justify-between p-4">
          <div class="flex flex-col space-y-1">
            <span class="text-sm font-medium text-foreground">
              Workspace icon
            </span>
            <span class="text-xs text-muted-foreground">
              Show project icon in the sidebar workspace list
            </span>
          </div>
          <switch_1.Switch checked={showWorkspaceIcon} onCheckedChange={setShowWorkspaceIcon}/>
        </div>
        <div class="flex items-center justify-between p-4 border-t border-border">
          <div class="flex flex-col space-y-1">
            <span class="text-sm font-medium text-foreground">
              Always expand to-do list
            </span>
            <span class="text-xs text-muted-foreground">
              Show the full to-do list instead of compact view
            </span>
          </div>
          <switch_1.Switch checked={alwaysExpandTodoList} onCheckedChange={setAlwaysExpandTodoList}/>
        </div>
      </div>
    </div>;
}
