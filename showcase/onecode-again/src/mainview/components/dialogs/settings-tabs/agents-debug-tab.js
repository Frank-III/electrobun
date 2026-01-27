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
exports.AgentsDebugTab = AgentsDebugTab;
var solid_js_1 = require("solid-js");
var button_1 = require("../../ui/button");
var switch_1 = require("../../ui/switch");
var trpc_1 = require("../../../lib/trpc");
var solid_sonner_1 = require("solid-sonner");
var lucide_solid_1 = require("lucide-solid");
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
// React Scan state management (only available in dev mode)
var REACT_SCAN_SCRIPT_ID = "react-scan-script";
var REACT_SCAN_STORAGE_KEY = "react-scan-enabled";
function loadReactScan() {
    return new Promise(function (resolve, reject) {
        if (document.getElementById(REACT_SCAN_SCRIPT_ID)) {
            resolve();
            return;
        }
        var script = document.createElement("script");
        script.id = REACT_SCAN_SCRIPT_ID;
        script.src = "https://unpkg.com/react-scan/dist/auto.global.js";
        script.async = true;
        script.onload = function () { return resolve(); };
        script.onerror = function () { return reject(new Error("Failed to load React Scan")); };
        document.head.appendChild(script);
    });
}
function unloadReactScan() {
    var script = document.getElementById(REACT_SCAN_SCRIPT_ID);
    if (script) {
        script.remove();
    }
    // React Scan adds a toolbar element, try to remove it
    var toolbar = document.querySelector("[data-react-scan]");
    if (toolbar) {
        toolbar.remove();
    }
}
function AgentsDebugTab() {
    var _this = this;
    var _a, _b, _c, _d;
    var _e = (0, solid_js_1.createSignal)(false), copiedPath = _e[0], setCopiedPath = _e[1];
    var _f = (0, solid_js_1.createSignal)(false), copiedInfo = _f[0], setCopiedInfo = _f[1];
    var _g = (0, solid_js_1.createSignal)(false), reactScanEnabled = _g[0], setReactScanEnabled = _g[1];
    var _h = (0, solid_js_1.createSignal)(false), reactScanLoading = _h[0], setReactScanLoading = _h[1];
    var isNarrowScreen = useIsNarrowScreen();
    // Check if we're in dev mode (only show React Scan in dev)
    var isDev = import.meta.env.DEV;
    // Fetch system info
    var _j = trpc_1.trpc.debug.getSystemInfo.useQuery(), systemInfo = _j.data, isLoadingSystem = _j.isLoading;
    // Offline simulation state
    var _k = trpc_1.trpc.debug.getOfflineSimulation.useQuery(), offlineSimulation = _k.data, refetchOfflineSimulation = _k.refetch;
    var setOfflineSimulationMutation = trpc_1.trpc.debug.setOfflineSimulation.useMutation({
        onSuccess: function (data) {
            refetchOfflineSimulation();
            solid_sonner_1.toast.success(data.enabled ? "Offline simulation enabled" : "Offline simulation disabled", { description: data.enabled ? "App will behave as if offline" : "Network detection restored to normal" });
        },
        onError: function (error) { return solid_sonner_1.toast.error(error.message); }
    });
    // Fetch DB stats
    var _l = trpc_1.trpc.debug.getDbStats.useQuery(), dbStats = _l.data, isLoadingDb = _l.isLoading, refetchDb = _l.refetch;
    // Mutations
    var clearChatsMutation = trpc_1.trpc.debug.clearChats.useMutation({
        onSuccess: function () {
            solid_sonner_1.toast.success("All chats cleared");
            refetchDb();
        },
        onError: function (error) { return solid_sonner_1.toast.error(error.message); }
    });
    var clearAllDataMutation = trpc_1.trpc.debug.clearAllData.useMutation({
        onSuccess: function () {
            solid_sonner_1.toast.success("All data cleared. Reloading...");
            setTimeout(function () { return window.location.reload(); }, 500);
        },
        onError: function (error) { return solid_sonner_1.toast.error(error.message); }
    });
    var logoutMutation = trpc_1.trpc.debug.logout.useMutation({
        onSuccess: function () {
            solid_sonner_1.toast.success("Logged out. Reloading...");
            setTimeout(function () { return window.location.reload(); }, 500);
        },
        onError: function (error) { return solid_sonner_1.toast.error(error.message); }
    });
    var openFolderMutation = trpc_1.trpc.debug.openUserDataFolder.useMutation({ onError: function (error) { return solid_sonner_1.toast.error(error.message); } });
    var handleCopyPath = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(systemInfo === null || systemInfo === void 0 ? void 0 : systemInfo.userDataPath)) return [3 /*break*/, 2];
                    return [4 /*yield*/, navigator.clipboard.writeText(systemInfo.userDataPath)];
                case 1:
                    _a.sent();
                    setCopiedPath(true);
                    setTimeout(function () { return setCopiedPath(false); }, 2e3);
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    }); };
    var handleCopyDebugInfo = function () { return __awaiter(_this, void 0, void 0, function () {
        var info;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    info = __assign(__assign({}, systemInfo), { dbStats: dbStats, timestamp: new Date().toISOString() });
                    return [4 /*yield*/, navigator.clipboard.writeText(JSON.stringify(info, null, 2))];
                case 1:
                    _a.sent();
                    setCopiedInfo(true);
                    solid_sonner_1.toast.success("Debug info copied to clipboard");
                    setTimeout(function () { return setCopiedInfo(false); }, 2e3);
                    return [2 /*return*/];
            }
        });
    }); };
    var handleOpenDevTools = function () {
        var _a;
        (_a = window.desktopApi) === null || _a === void 0 ? void 0 : _a.toggleDevTools();
    };
    var handleReactScanToggle = function (enabled) { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!isDev)
                        return [2 /*return*/];
                    setReactScanLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, 6, 7]);
                    if (!enabled) return [3 /*break*/, 3];
                    return [4 /*yield*/, loadReactScan()];
                case 2:
                    _a.sent();
                    localStorage.setItem(REACT_SCAN_STORAGE_KEY, "true");
                    setReactScanEnabled(true);
                    solid_sonner_1.toast.success("React Scan enabled", { description: "Reload the page to see re-render highlights" });
                    return [3 /*break*/, 4];
                case 3:
                    unloadReactScan();
                    localStorage.removeItem(REACT_SCAN_STORAGE_KEY);
                    setReactScanEnabled(false);
                    solid_sonner_1.toast.success("React Scan disabled", { description: "Reload the page to fully remove it" });
                    _a.label = 4;
                case 4: return [3 /*break*/, 7];
                case 5:
                    error_1 = _a.sent();
                    solid_sonner_1.toast.error("Failed to toggle React Scan");
                    console.error(error_1);
                    return [3 /*break*/, 7];
                case 6:
                    setReactScanLoading(false);
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    // Initialize React Scan state from localStorage (dev only)
    (0, solid_js_1.createEffect)(function () {
        if (isDev && localStorage.getItem(REACT_SCAN_STORAGE_KEY) === "true") {
            loadReactScan().then(function () { return setReactScanEnabled(true); }).catch(console.error);
        }
    });
    var isLoading = isLoadingSystem || isLoadingDb;
    return <div class="p-6 space-y-6">
      {/* Header - hidden on narrow screens since it's in the navigation bar */}
      {!isNarrowScreen && <div>
          <h3 class="text-lg font-semibold mb-1">Debug</h3>
          <p class="text-sm text-muted-foreground">
            System information and developer tools
          </p>
        </div>}

      {/* System Info */}
      <div class="space-y-3">
        <h4 class="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          System Info
        </h4>
        <div class="rounded-lg border bg-muted/30 divide-y">
          <InfoRow label="Version" value={systemInfo === null || systemInfo === void 0 ? void 0 : systemInfo.version} isLoading={isLoading}/>
          <InfoRow label="Platform" value={systemInfo ? "".concat(systemInfo.platform, " (").concat(systemInfo.arch, ")") : undefined} isLoading={isLoading}/>
          <InfoRow label="Dev Mode" value={(systemInfo === null || systemInfo === void 0 ? void 0 : systemInfo.isDev) ? "Yes" : "No"} isLoading={isLoading}/>
          <InfoRow label="Protocol" value={(systemInfo === null || systemInfo === void 0 ? void 0 : systemInfo.protocolRegistered) ? "Registered" : "Not registered"} isLoading={isLoading} status={(systemInfo === null || systemInfo === void 0 ? void 0 : systemInfo.protocolRegistered) ? "success" : "warning"}/>
          <div class="flex items-center justify-between p-3">
            <span class="text-sm text-muted-foreground">userData</span>
            <div class="flex items-center gap-2">
              <span class="text-sm font-mono truncate max-w-[200px]">
                {isLoading ? "..." : systemInfo === null || systemInfo === void 0 ? void 0 : systemInfo.userDataPath}
              </span>
              <button_1.Button variant="ghost" size="icon" class="h-6 w-6" onClick={handleCopyPath} disabled={!(systemInfo === null || systemInfo === void 0 ? void 0 : systemInfo.userDataPath)}>
                {copiedPath ? <lucide_solid_1.Check class="h-3 w-3 text-green-500"/> : <lucide_solid_1.Copy class="h-3 w-3"/>}
              </button_1.Button>
            </div>
          </div>
        </div>
      </div>

      {/* DB Stats */}
      <div class="space-y-3">
        <h4 class="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Database
        </h4>
        <div class="rounded-lg border bg-muted/30 divide-y">
          <InfoRow label="Projects" value={(_a = dbStats === null || dbStats === void 0 ? void 0 : dbStats.projects) === null || _a === void 0 ? void 0 : _a.toString()} isLoading={isLoading}/>
          <InfoRow label="Chats" value={(_b = dbStats === null || dbStats === void 0 ? void 0 : dbStats.chats) === null || _b === void 0 ? void 0 : _b.toString()} isLoading={isLoading}/>
          <InfoRow label="Sub-chats" value={(_c = dbStats === null || dbStats === void 0 ? void 0 : dbStats.subChats) === null || _c === void 0 ? void 0 : _c.toString()} isLoading={isLoading}/>
        </div>
      </div>

      {/* Developer Tools (dev mode only) */}
      {isDev && <div class="space-y-3">
          <h4 class="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Developer Tools
          </h4>
          <div class="rounded-lg border bg-muted/30 divide-y">
            <div class="flex items-center justify-between p-3">
              <div class="flex items-center gap-2">
                <lucide_solid_1.Scan class="h-4 w-4 text-muted-foreground"/>
                <div>
                  <span class="text-sm">React Scan</span>
                  <p class="text-xs text-muted-foreground">
                    Highlight component re-renders
                  </p>
                </div>
              </div>
              <switch_1.Switch checked={reactScanEnabled} onCheckedChange={handleReactScanToggle} disabled={reactScanLoading}/>
            </div>
            <div class="flex items-center justify-between p-3">
              <div class="flex items-center gap-2">
                <lucide_solid_1.WifiOff class="h-4 w-4 text-muted-foreground"/>
                <div>
                  <span class="text-sm">Simulate Offline</span>
                  <p class="text-xs text-muted-foreground">
                    Test offline mode without disconnecting
                  </p>
                </div>
              </div>
              <switch_1.Switch checked={(_d = offlineSimulation === null || offlineSimulation === void 0 ? void 0 : offlineSimulation.enabled) !== null && _d !== void 0 ? _d : false} onCheckedChange={function (enabled) { return setOfflineSimulationMutation.mutate({ enabled: enabled }); }} disabled={setOfflineSimulationMutation.isPending}/>
            </div>
          </div>
        </div>}

      {/* Quick Actions */}
      <div class="space-y-3">
        <h4 class="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Quick Actions
        </h4>
        <div class="grid grid-cols-2 gap-2">
          <button_1.Button variant="outline" size="sm" onClick={function () { return openFolderMutation.mutate(); }} disabled={openFolderMutation.isPending}>
            <lucide_solid_1.FolderOpen class="h-4 w-4 mr-2"/>
            Open userData
          </button_1.Button>
          <button_1.Button variant="outline" size="sm" onClick={handleOpenDevTools}>
            <lucide_solid_1.Terminal class="h-4 w-4 mr-2"/>
            DevTools
          </button_1.Button>
          <button_1.Button variant="outline" size="sm" onClick={function () { return window.location.reload(); }}>
            <lucide_solid_1.RefreshCw class="h-4 w-4 mr-2"/>
            Reload
          </button_1.Button>
          <button_1.Button variant="outline" size="sm" onClick={handleCopyDebugInfo} disabled={isLoading}>
            {copiedInfo ? <lucide_solid_1.Check class="h-4 w-4 mr-2 text-green-500"/> : <lucide_solid_1.Copy class="h-4 w-4 mr-2"/>}
            Copy Info
          </button_1.Button>
        </div>
      </div>

      {/* Toast Testing */}
      <div class="space-y-3">
        <h4 class="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Toast Testing
        </h4>
        <div class="grid grid-cols-2 gap-2">
          <button_1.Button variant="outline" size="sm" onClick={function () { return solid_sonner_1.toast.info("Cancelation sent", {
            description: "Sent to John Smith",
            action: {
                label: "Undo",
                onClick: function () { return (0, solid_sonner_1.toast)("Undone!"); }
            }
        }); }}>
            Info + Undo
          </button_1.Button>
          <button_1.Button variant="outline" size="sm" onClick={function () { return solid_sonner_1.toast.success("Success!", { description: "Operation completed" }); }}>
            Success
          </button_1.Button>
          <button_1.Button variant="outline" size="sm" onClick={function () { return solid_sonner_1.toast.error("Error", { description: "Something went wrong" }); }}>
            Error
          </button_1.Button>
          <button_1.Button variant="outline" size="sm" onClick={function () { return (0, solid_sonner_1.toast)("Default toast", { description: "This is a description" }); }}>
            Default
          </button_1.Button>
          <button_1.Button variant="outline" size="sm" onClick={function () {
            var id = solid_sonner_1.toast.loading("Loading...", { description: "Please wait" });
            setTimeout(function () { return solid_sonner_1.toast.dismiss(id); }, 3e3);
        }}>
            Loading
          </button_1.Button>
          <button_1.Button variant="outline" size="sm" onClick={function () {
            var id = solid_sonner_1.toast.loading("Processing...");
            setTimeout(function () {
                solid_sonner_1.toast.success("Done!", { id: id });
            }, 2e3);
        }}>
            Promise
          </button_1.Button>
        </div>
      </div>

      {/* Data Management */}
      <div class="space-y-3">
        <h4 class="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Data Management
        </h4>
        <div class="grid grid-cols-3 gap-2">
          <button_1.Button variant="outline" size="sm" onClick={function () {
            if (confirm("Clear all chats? Projects will be kept.")) {
                clearChatsMutation.mutate();
            }
        }} disabled={clearChatsMutation.isPending}>
            {clearChatsMutation.isPending ? "..." : "Clear Chats"}
          </button_1.Button>
          <button_1.Button variant="outline" size="sm" onClick={function () {
            if (confirm("Logout? You will need to sign in again.")) {
                logoutMutation.mutate();
            }
        }} disabled={logoutMutation.isPending}>
            {logoutMutation.isPending ? "..." : "Logout"}
          </button_1.Button>
          <button_1.Button variant="destructive" size="sm" onClick={function () {
            if (confirm("Reset everything? This will clear all data and log you out.")) {
                clearAllDataMutation.mutate();
            }
        }} disabled={clearAllDataMutation.isPending}>
            {clearAllDataMutation.isPending ? "..." : "Reset All"}
          </button_1.Button>
        </div>
      </div>
    </div>;
}
// Helper component for info rows
function InfoRow(_a) {
    var label = _a.label, value = _a.value, isLoading = _a.isLoading, status = _a.status;
    return <div class="flex items-center justify-between p-3">
      <span class="text-sm text-muted-foreground">{label}</span>
      <span class={"text-sm font-medium ".concat(status === "success" ? "text-green-500" : status === "warning" ? "text-yellow-500" : status === "error" ? "text-red-500" : "")}>
        {isLoading ? "..." : value !== null && value !== void 0 ? value : "-"}
      </span>
    </div>;
}
