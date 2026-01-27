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
exports.AgentsBetaTab = AgentsBetaTab;
var jotai_1 = require("../../../lib/state/jotai");
var solid_js_1 = require("solid-js");
var atoms_1 = require("../../../lib/atoms");
var trpc_1 = require("../../../lib/trpc");
var switch_1 = require("../../ui/switch");
var select_1 = require("../../ui/select");
var icons_1 = require("../../ui/icons");
var lucide_solid_1 = require("lucide-solid");
var button_1 = require("../../ui/button");
var utils_1 = require("../../../lib/utils");
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
var MINIMUM_OLLAMA_VERSION = "0.14.2";
var RECOMMENDED_MODEL = "qwen3-coder:30b";
function AgentsBetaTab() {
    var _this = this;
    var isNarrowScreen = useIsNarrowScreen();
    var _a = (0, jotai_1.useAtom)(atoms_1.historyEnabledAtom), historyEnabled = _a[0], setHistoryEnabled = _a[1];
    var _b = (0, jotai_1.useAtom)(atoms_1.showOfflineModeFeaturesAtom), showOfflineFeatures = _b[0], setShowOfflineFeatures = _b[1];
    var _c = (0, jotai_1.useAtom)(atoms_1.autoOfflineModeAtom), autoOffline = _c[0], setAutoOffline = _c[1];
    var _d = (0, jotai_1.useAtom)(atoms_1.selectedOllamaModelAtom), selectedOllamaModel = _d[0], setSelectedOllamaModel = _d[1];
    var _e = (0, jotai_1.useAtom)(atoms_1.betaKanbanEnabledAtom), kanbanEnabled = _e[0], setKanbanEnabled = _e[1];
    var _f = (0, solid_js_1.createSignal)(false), copied = _f[0], setCopied = _f[1];
    var _g = (0, solid_js_1.createSignal)("idle"), updateStatus = _g[0], setUpdateStatus = _g[1];
    var _h = (0, solid_js_1.createSignal)(null), updateVersion = _h[0], setUpdateVersion = _h[1];
    var _j = (0, solid_js_1.createSignal)(null), currentVersion = _j[0], setCurrentVersion = _j[1];
    // Get current version on mount
    (0, solid_js_1.createEffect)(function () {
        var _a;
        (_a = window.desktopApi) === null || _a === void 0 ? void 0 : _a.getVersion().then(setCurrentVersion);
    });
    // Check for updates with force flag to bypass cache
    var handleCheckForUpdates = function () { return __awaiter(_this, void 0, void 0, function () {
        var isPackaged, result, error_1;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, ((_b = (_a = window.desktopApi) === null || _a === void 0 ? void 0 : _a.isPackaged) === null || _b === void 0 ? void 0 : _b.call(_a))];
                case 1:
                    isPackaged = _d.sent();
                    if (!isPackaged) {
                        setUpdateStatus("error");
                        console.log("Update check skipped in dev mode");
                        return [2 /*return*/];
                    }
                    setUpdateStatus("checking");
                    setUpdateVersion(null);
                    _d.label = 2;
                case 2:
                    _d.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, ((_c = window.desktopApi) === null || _c === void 0 ? void 0 : _c.checkForUpdates(true))];
                case 3:
                    result = _d.sent();
                    if (result) {
                        setUpdateStatus("available");
                        setUpdateVersion(result.version);
                    }
                    else {
                        setUpdateStatus("not-available");
                    }
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _d.sent();
                    console.error("Failed to check for updates:", error_1);
                    setUpdateStatus("error");
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    // Get Ollama status
    var ollamaStatus = trpc_1.trpc.ollama.getStatus.useQuery(undefined, {
        refetchInterval: showOfflineFeatures ? 3e4 : false,
        enabled: showOfflineFeatures
    }).data;
    var handleCopy = function () {
        navigator.clipboard.writeText("ollama pull ".concat(RECOMMENDED_MODEL));
        setCopied(true);
        setTimeout(function () { return setCopied(false); }, 2e3);
    };
    return <div class="p-6 space-y-6">
      {/* Header - hidden on narrow screens since it's in the navigation bar */}
      {!isNarrowScreen && <div class="flex flex-col space-y-1.5 text-center sm:text-left">
          <h3 class="text-sm font-semibold text-foreground">Beta Features</h3>
          <p class="text-xs text-muted-foreground">
            Enable experimental features. These may be unstable or change without notice.
          </p>
        </div>}

      {/* Beta Features Section */}
      <div class="bg-background rounded-lg border border-border overflow-hidden">
        <div class="p-4 space-y-6">
          {/* Rollback Toggle */}
          <div class="flex items-start justify-between">
            <div class="flex flex-col space-y-1">
              <span class="text-sm font-medium text-foreground">
                Rollback
              </span>
              <span class="text-xs text-muted-foreground">
                Allow rolling back to previous messages and restoring files.
              </span>
            </div>
            <switch_1.Switch checked={historyEnabled} onCheckedChange={setHistoryEnabled}/>
          </div>

          {/* Offline Mode Toggle */}
          <div class="flex items-start justify-between">
            <div class="flex flex-col space-y-1">
              <span class="text-sm font-medium text-foreground">
                Offline Mode
              </span>
              <span class="text-xs text-muted-foreground">
                Enable offline mode UI and Ollama integration.
              </span>
            </div>
            <switch_1.Switch checked={showOfflineFeatures} onCheckedChange={setShowOfflineFeatures}/>
          </div>

          {/* Kanban Board Toggle */}
          <div class="flex items-start justify-between">
            <div class="flex flex-col space-y-1">
              <span class="text-sm font-medium text-foreground">
                Kanban Board
              </span>
              <span class="text-xs text-muted-foreground">
                View workspaces as a Kanban board organized by status.
              </span>
            </div>
            <switch_1.Switch checked={kanbanEnabled} onCheckedChange={setKanbanEnabled}/>
          </div>
        </div>
      </div>

      {/* Offline Mode Settings - only show when feature is enabled */}
      {showOfflineFeatures && <div class="space-y-2">
          <div class="pb-2">
            <h4 class="text-sm font-medium text-foreground">Offline Mode Settings</h4>
          </div>

          <div class="bg-background rounded-lg border border-border overflow-hidden">
            <div class="p-4 space-y-4">
              {/* Status */}
              <div class="flex items-center justify-between gap-4">
                <div class="flex-1">
                  <span class="text-sm font-medium text-foreground">
                    Ollama Status
                  </span>
                  <p class="text-xs text-muted-foreground">
                    {(ollamaStatus === null || ollamaStatus === void 0 ? void 0 : ollamaStatus.ollama.available) ? "Running - ".concat(ollamaStatus.ollama.models.length, " model").concat(ollamaStatus.ollama.models.length !== 1 ? "s" : "", " installed") : "Not running or not installed"}
                  </p>
                </div>
                <div class="flex items-center gap-1.5">
                  {(ollamaStatus === null || ollamaStatus === void 0 ? void 0 : ollamaStatus.ollama.available) ? <>
                      <span class="h-2 w-2 rounded-full bg-emerald-500"/>
                      <span class="text-sm text-emerald-500">Available</span>
                    </> : <>
                      <span class="h-2 w-2 rounded-full bg-muted-foreground/50"/>
                      <span class="text-sm text-muted-foreground">Unavailable</span>
                    </>}
                </div>
              </div>

              {/* Model selector */}
              {(ollamaStatus === null || ollamaStatus === void 0 ? void 0 : ollamaStatus.ollama.available) && ollamaStatus.ollama.models.length > 0 && <div class="flex items-center justify-between gap-4">
                  <div class="flex-1 min-w-0">
                    <span class="text-sm font-medium text-foreground">
                      Model
                    </span>
                    <p class="text-xs text-muted-foreground">
                      Select which model to use for offline mode
                    </p>
                  </div>
                  <select_1.Select value={selectedOllamaModel || ollamaStatus.ollama.recommendedModel || ollamaStatus.ollama.models[0]} onValueChange={function (value) { return setSelectedOllamaModel(value); }}>
                    <select_1.SelectTrigger class="w-auto shrink-0">
                      <select_1.SelectValue placeholder="Select model"/>
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      {ollamaStatus.ollama.models.map(function (model) {
                    var isRecommended = model === ollamaStatus.ollama.recommendedModel;
                    return <select_1.SelectItem key={model} value={model}>
                            <span class="truncate">
                              {model}
                              {isRecommended && <span class="text-muted-foreground ml-1 text-xs">(recommended)</span>}
                            </span>
                          </select_1.SelectItem>;
                })}
                    </select_1.SelectContent>
                  </select_1.Select>
                </div>}

              {/* Auto-fallback toggle */}
              <div class="flex items-center justify-between gap-4">
                <div class="flex-1">
                  <span class="text-sm font-medium text-foreground">
                    Auto Offline Mode
                  </span>
                  <p class="text-xs text-muted-foreground">
                    Automatically use Ollama when internet is unavailable
                  </p>
                </div>
                <switch_1.Switch checked={autoOffline} onCheckedChange={setAutoOffline}/>
              </div>

              {/* Installation instructions - always show */}
              <div class="text-xs text-muted-foreground bg-muted p-3 rounded space-y-2">
                <p class="font-medium">Setup Instructions:</p>
                <ol class="list-decimal list-inside space-y-1 ml-2">
                  <li>
                    Install Ollama {MINIMUM_OLLAMA_VERSION}+ from{" "}
                    <a href="https://ollama.com" target="_blank" rel="noopener noreferrer" class="underline inline-flex items-center gap-0.5">
                      ollama.com
                      <icons_1.ExternalLinkIcon class="h-3 w-3"/>
                    </a>
                  </li>
                  <li>
                    Pull the recommended model:{" "}
                    <code class="relative inline-flex items-center gap-1 bg-background pl-1.5 pr-0.5 py-0.5 rounded-md">
                      <span>ollama pull {RECOMMENDED_MODEL}</span>
                      <button type="button" onClick={handleCopy} class="p-1 hover:bg-muted rounded transition-colors" title={copied ? "Copied!" : "Copy command"}>
                        <div class="relative w-3 h-3">
                          <lucide_solid_1.Copy class={(0, utils_1.cn)("absolute inset-0 w-3 h-3 text-muted-foreground transition-[opacity,transform] duration-200 ease-out hover:text-foreground", copied ? "opacity-0 scale-50" : "opacity-100 scale-100")}/>
                          <lucide_solid_1.Check class={(0, utils_1.cn)("absolute inset-0 w-3 h-3 text-muted-foreground transition-[opacity,transform] duration-200 ease-out", copied ? "opacity-100 scale-100" : "opacity-0 scale-50")}/>
                        </div>
                      </button>
                    </code>
                  </li>
                  <li>Ollama will run automatically in the background</li>
                </ol>
              </div>
            </div>
          </div>
        </div>}

      {/* Updates Section */}
      <div class="space-y-2">
        <div class="pb-2">
          <h4 class="text-sm font-medium text-foreground">Updates</h4>
          <p class="text-xs text-muted-foreground mt-1">
            Check for new versions manually (bypasses CDN cache)
          </p>
        </div>

        <div class="bg-background rounded-lg border border-border overflow-hidden">
          <div class="p-4">
            <div class="flex items-center justify-between">
              <div class="flex flex-col space-y-1">
                <span class="text-sm font-medium text-foreground">
                  {currentVersion ? "Current: v".concat(currentVersion) : "Version"}
                </span>
                <span class="text-xs text-muted-foreground">
                  {updateStatus === "checking" && "Checking for updates..."}
                  {updateStatus === "available" && "Update available: v".concat(updateVersion)}
                  {updateStatus === "not-available" && "You're on the latest version"}
                  {updateStatus === "error" && "Failed to check (dev mode?)"}
                  {updateStatus === "idle" && "Click to check for updates"}
                </span>
              </div>
              <button_1.Button variant="outline" size="sm" onClick={handleCheckForUpdates} disabled={updateStatus === "checking"}>
                <lucide_solid_1.RefreshCw class={(0, utils_1.cn)("h-4 w-4 mr-2", updateStatus === "checking" && "animate-spin")}/>
                {updateStatus === "checking" ? "Checking..." : "Check Now"}
              </button_1.Button>
            </div>
          </div>
        </div>
      </div>
    </div>;
}
