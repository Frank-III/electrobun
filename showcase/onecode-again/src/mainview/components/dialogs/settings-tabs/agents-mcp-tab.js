"use client";
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentsMcpTab = AgentsMcpTab;
var lucide_solid_1 = require("lucide-solid");
var react_1 = require("motion/react");
var solid_js_1 = require("solid-js");
var solid_sonner_1 = require("solid-sonner");
var trpc_1 = require("../../../lib/trpc");
var utils_1 = require("../../../lib/utils");
var button_1 = require("../../ui/button");
var icons_1 = require("../../ui/icons");
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
// Status indicator dot
function StatusDot(_a) {
    var status = _a.status;
    return <span class={(0, utils_1.cn)("w-2 h-2 rounded-full flex-shrink-0", status === "connected" && "bg-foreground", status !== "connected" && "bg-muted-foreground/50", status === "pending" && "animate-pulse")}/>;
}
// Get status text
function getStatusText(status) {
    switch (status) {
        case "connected": return "Connected";
        case "failed": return "Failed";
        case "needs-auth": return "Needs auth";
        case "pending": return "Connecting...";
        default: return status;
    }
}
function ServerRow(_a) {
    var _b;
    var server = _a.server, isExpanded = _a.isExpanded, onToggle = _a.onToggle, onAuth = _a.onAuth;
    var tools = server.tools, needsAuth = server.needsAuth;
    var hasTools = tools.length > 0;
    var isConnected = server.status === "connected";
    return <div>
      <div role={hasTools ? "button" : undefined} tabIndex={hasTools ? 0 : undefined} onClick={hasTools ? onToggle : undefined} onKeyDown={hasTools ? function (e) {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onToggle();
            }
        } : undefined} class={(0, utils_1.cn)("w-full flex items-center gap-3 p-3 text-left transition-colors", hasTools && "hover:bg-muted/50 cursor-pointer", !hasTools && "cursor-default")}>
        {/* Expand chevron */}
        <lucide_solid_1.ChevronRight class={(0, utils_1.cn)("h-3.5 w-3.5 text-muted-foreground transition-transform flex-shrink-0", isExpanded && "rotate-90", !hasTools && "opacity-0")}/>

        {/* Status dot */}
        <StatusDot status={server.status}/>

        {/* Server info */}
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-foreground truncate">
              {server.name}
            </span>
            {((_b = server.serverInfo) === null || _b === void 0 ? void 0 : _b.version) && <span class="text-xs text-muted-foreground">
                v{server.serverInfo.version}
              </span>}
          </div>
          {server.error && <p class="text-xs text-muted-foreground truncate mt-0.5">
              {server.error}
            </p>}
        </div>

        {/* Status / tool count */}
        <span class="text-xs text-muted-foreground flex-shrink-0">
          {isConnected ? hasTools ? "".concat(tools.length, " tool").concat(tools.length !== 1 ? "s" : "") : "No tools" : getStatusText(server.status)}
        </span>

        {/* Authenticate button */}
        {needsAuth && onAuth && <button_1.Button variant="secondary" size="sm" class="h-6 px-2 text-xs" onClick={function (e) {
                e.stopPropagation();
                onAuth();
            }}>
            {isConnected ? "Reconnect" : "Auth"}
          </button_1.Button>}
      </div>

      {/* Expanded tools list */}
      <react_1.AnimatePresence>
        {isExpanded && hasTools && <react_1.motion.div initial={{
                height: 0,
                opacity: 0
            }} animate={{
                height: "auto",
                opacity: 1
            }} exit={{
                height: 0,
                opacity: 0
            }} transition={{ duration: .15 }} class="overflow-hidden">
            <div class="pl-10 pr-3 pb-3 space-y-1">
              {tools.map(function (tool) { return <div key={tool} class="text-xs text-muted-foreground font-mono py-0.5">
                  {tool}
                </div>; })}
            </div>
          </react_1.motion.div>}
      </react_1.AnimatePresence>
    </div>;
}
function AgentsMcpTab() {
    var _this = this;
    var isNarrowScreen = useIsNarrowScreen();
    var _a = (0, solid_js_1.createSignal)(null), expandedServer = _a[0], setExpandedServer = _a[1];
    // Fetch ALL MCP config (global + all projects) - includes tools for connected servers
    // Uses long staleTime since data is prefetched at app startup and user can manually refresh
    var _b = trpc_1.trpc.claude.getAllMcpConfig.useQuery(undefined, { staleTime: 10 * 60 * 1e3 }), allMcpConfig = _b.data, isLoadingConfig = _b.isLoading, refetch = _b.refetch;
    // Refresh state - true during initial load OR manual refresh
    var _c = (0, solid_js_1.createSignal)(false), isManualRefreshing = _c[0], setIsManualRefreshing = _c[1];
    var isRefreshing = isLoadingConfig || isManualRefreshing;
    // tRPC
    var startOAuthMutation = trpc_1.trpc.claude.startMcpOAuth.useMutation();
    var openInFinderMutation = trpc_1.trpc.external.openInFinder.useMutation();
    // Process groups for display (filter out empty groups)
    var groups = (0, solid_js_1.createMemo)(function () { return ((allMcpConfig === null || allMcpConfig === void 0 ? void 0 : allMcpConfig.groups) || []).filter(function (g) { return g.mcpServers.length > 0; }); });
    var totalServers = (0, solid_js_1.createMemo)(function () { return groups.reduce(function (acc, g) { return acc + g.mcpServers.length; }, 0); });
    var handleToggleServer = function (serverKey) {
        setExpandedServer(expandedServer === serverKey ? null : serverKey);
    };
    var handleRefresh = function () {
        var args_1 = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args_1[_i] = arguments[_i];
        }
        return __awaiter(_this, __spreadArray([], args_1, true), void 0, function (silent) {
            var error_1;
            if (silent === void 0) { silent = false; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        setIsManualRefreshing(true);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        return [4 /*yield*/, refetch()];
                    case 2:
                        _a.sent();
                        if (!silent) {
                            solid_sonner_1.toast.success("Refreshed MCP servers");
                        }
                        return [3 /*break*/, 5];
                    case 3:
                        error_1 = _a.sent();
                        if (!silent) {
                            solid_sonner_1.toast.error("Failed to refresh MCP servers");
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        setIsManualRefreshing(false);
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    var handleAuth = function (serverName, projectPath) { return __awaiter(_this, void 0, void 0, function () {
        var result, error_2, message;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, startOAuthMutation.mutateAsync({
                            serverName: serverName,
                            projectPath: projectPath !== null && projectPath !== void 0 ? projectPath : "__global__"
                        })];
                case 1:
                    result = _a.sent();
                    if (!result.success) return [3 /*break*/, 3];
                    solid_sonner_1.toast.success("".concat(serverName, " authenticated, refreshing..."));
                    // Refresh to update status and fetch tools
                    return [4 /*yield*/, handleRefresh(false)];
                case 2:
                    // Refresh to update status and fetch tools
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    solid_sonner_1.toast.error(result.error || "Authentication failed");
                    _a.label = 4;
                case 4: return [3 /*break*/, 6];
                case 5:
                    error_2 = _a.sent();
                    message = error_2 instanceof Error ? error_2.message : "Authentication failed";
                    console.error("[MCP Auth] Error authenticating ".concat(serverName, ":"), error_2);
                    solid_sonner_1.toast.error(message);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var handleOpenGlobalClaudeJson = function () {
        openInFinderMutation.mutate("~/.claude.json");
    };
    return <div class="p-6 space-y-6 h-full">
      {/* Header */}
      {!isNarrowScreen && <div class="flex flex-col space-y-1.5 text-center sm:text-left">
          <div class="flex items-center gap-1">
            <h3 class="text-sm font-semibold text-foreground">MCP Servers</h3>
            <button onClick={function () { return handleRefresh(); }} disabled={isRefreshing} class="h-6 w-6 inline-flex items-center justify-center text-foreground/50 hover:text-foreground disabled:opacity-50 disabled:pointer-events-none transition-colors">
              {isRefreshing ? <lucide_solid_1.Loader2 class="h-3.5 w-3.5 animate-spin"/> : <lucide_solid_1.RefreshCw class="h-3.5 w-3.5"/>}
            </button>
          </div>
        </div>}

      {/* Instructions Section - below header */}
      <div class="pb-4 border-b border-border space-y-3">
        <div>
          <h4 class="text-xs font-medium text-foreground mb-1.5">
            How to use MCP Tools
          </h4>
          <p class="text-xs text-muted-foreground">
            Mention a tool in chat with{" "}
            <code class="px-1 py-0.5 bg-muted rounded">@tool-name</code> or
            ask Claude to use it directly.
          </p>
        </div>
        <div>
          <h4 class="text-xs font-medium text-foreground mb-1.5">
            Configuring Servers
          </h4>
          <p class="text-xs text-muted-foreground">
            Add MCP server configuration to{" "}
            <button onClick={handleOpenGlobalClaudeJson} class="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80 rounded transition-colors">
              <lucide_solid_1.ExternalLink class="h-3 w-3"/>
              <span>~/.claude.json</span>
            </button>{" "}
            at the root for global servers or under your project path.
          </p>
          <p class="text-xs text-muted-foreground mt-1.5">
            <a href="https://docs.anthropic.com/en/docs/claude-code/mcp" target="_blank" rel="noopener noreferrer" class="text-muted-foreground hover:text-foreground underline transition-colors">
              Documentation from Anthropic
            </a>
          </p>
        </div>
      </div>

      {/* Servers List */}
      <div class="space-y-4">
        {isLoadingConfig ? <div class="bg-background rounded-lg border border-border p-6 text-center">
            <lucide_solid_1.Loader2 class="h-6 w-6 text-muted-foreground/50 mx-auto mb-3 animate-spin"/>
            <p class="text-sm text-muted-foreground">
              Loading MCP servers...
            </p>
          </div> : totalServers === 0 ? <div class="bg-background rounded-lg border border-border p-6 text-center">
            <icons_1.OriginalMCPIcon class="h-8 w-8 text-muted-foreground/50 mx-auto mb-3"/>
            <p class="text-sm text-muted-foreground mb-2">
              No MCP servers configured
            </p>
            <p class="text-xs text-muted-foreground">
              Add servers to{" "}
              <code class="px-1 py-0.5 bg-muted rounded">~/.claude.json</code>
            </p>
          </div> : <div class="space-y-4">
            {groups.map(function (group) { return <div key={group.groupName}>
                {/* Group label */}
                <p class="text-xs font-medium text-muted-foreground mb-2">
                  {group.groupName}
                </p>
                {/* Server rows */}
                <div class="bg-background rounded-lg border border-border overflow-hidden">
                  <div class="divide-y divide-border">
                    {group.mcpServers.map(function (server) { return <ServerRow key={"".concat(group.groupName, "-").concat(server.name)} server={server} isExpanded={expandedServer === "".concat(group.groupName, "-").concat(server.name)} onToggle={function () { return handleToggleServer("".concat(group.groupName, "-").concat(server.name)); }} onAuth={function () { return handleAuth(server.name, group.projectPath); }}/>; })}
                  </div>
                </div>
              </div>; })}
          </div>}
      </div>
      {/* Bottom spacer for scroll padding */}
      <div class="h-[1px] shrink-0"/>
    </div>;
}
