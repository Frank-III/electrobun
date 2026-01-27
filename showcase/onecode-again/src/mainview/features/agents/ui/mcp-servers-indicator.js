"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.McpServersIndicator = void 0;
var jotai_1 = require("../../../lib/state/jotai");
var lucide_solid_1 = require("lucide-solid");
var solid_js_1 = require("solid-js");
var button_1 = require("../../../components/ui/button");
var popover_1 = require("../../../components/ui/popover");
var tooltip_1 = require("../../../components/ui/tooltip");
var icons_1 = require("../../../components/ui/icons");
var atoms_1 = require("../../../lib/atoms");
var utils_1 = require("../../../lib/utils");
var trpc_1 = require("../../../lib/trpc");
/**
* MCP Servers Indicator
*
* Shows a badge with the count of connected MCP servers.
* Clicking it opens a popover with:
* - List of MCP servers with status (connected/failed/pending)
* - Expandable servers showing their tools
* - Link to configure in ~/.claude.json
*/
exports.McpServersIndicator = memo(function McpServersIndicator(_a) {
    var _b;
    var projectPath = _a.projectPath;
    var _c = (0, jotai_1.useAtom)(atoms_1.sessionInfoAtom), sessionInfo = _c[0], setSessionInfo = _c[1];
    // Fetch MCP config on mount if we have projectPath and no session info yet
    var mcpConfig = trpc_1.trpc.claude.getMcpConfig.useQuery({ projectPath: projectPath }, {
        enabled: !!projectPath && !((_b = sessionInfo === null || sessionInfo === void 0 ? void 0 : sessionInfo.mcpServers) === null || _b === void 0 ? void 0 : _b.length),
        staleTime: 5 * 60 * 1e3
    }).data;
    // Update sessionInfo with MCP config if we don't have it yet
    (0, solid_js_1.createEffect)(function () {
        var _a, _b;
        if (((_a = mcpConfig === null || mcpConfig === void 0 ? void 0 : mcpConfig.mcpServers) === null || _a === void 0 ? void 0 : _a.length) && !((_b = sessionInfo === null || sessionInfo === void 0 ? void 0 : sessionInfo.mcpServers) === null || _b === void 0 ? void 0 : _b.length)) {
            setSessionInfo(function (prev) { return ({
                tools: (prev === null || prev === void 0 ? void 0 : prev.tools) || [],
                mcpServers: mcpConfig.mcpServers.map(function (s) { return ({
                    name: s.name,
                    status: s.status
                }); }),
                plugins: (prev === null || prev === void 0 ? void 0 : prev.plugins) || [],
                skills: (prev === null || prev === void 0 ? void 0 : prev.skills) || []
            }); });
        }
    });
    var _d = (0, solid_js_1.createSignal)(false), isOpen = _d[0], setIsOpen = _d[1];
    var _e = (0, solid_js_1.createSignal)(new Set()), expandedServers = _e[0], setExpandedServers = _e[1];
    var _f = (0, solid_js_1.createSignal)(-1), focusedIndex = _f[0], setFocusedIndex = _f[1];
    var _g = (0, solid_js_1.createSignal)([]), serverButtonsRef = _g[0], setServerButtonsRef = _g[1];
    // Count connected servers
    var connectedCount = (0, solid_js_1.createMemo)(function () {
        if (!(sessionInfo === null || sessionInfo === void 0 ? void 0 : sessionInfo.mcpServers))
            return 0;
        return sessionInfo.mcpServers.filter(function (s) { return s.status === "connected"; }).length;
    });
    // Get tools grouped by MCP server
    var toolsByServer = (0, solid_js_1.createMemo)(function () {
        if (!(sessionInfo === null || sessionInfo === void 0 ? void 0 : sessionInfo.tools) || !(sessionInfo === null || sessionInfo === void 0 ? void 0 : sessionInfo.mcpServers))
            return new Map();
        var map = new Map();
        // Initialize map with all servers
        for (var _i = 0, _a = sessionInfo.mcpServers; _i < _a.length; _i++) {
            var server = _a[_i];
            map.set(server.name, []);
        }
        // Group tools by server (format: mcp__servername__toolname)
        for (var _b = 0, _c = sessionInfo.tools; _b < _c.length; _b++) {
            var tool = _c[_b];
            if (!tool.startsWith("mcp__"))
                continue;
            var parts = tool.split("__");
            if (parts.length < 3)
                continue;
            var serverName = parts[1];
            var toolName = parts.slice(2).join("__");
            var serverTools = map.get(serverName) || [];
            serverTools.push(toolName);
            map.set(serverName, serverTools);
        }
        return map;
    });
    // Don't show if no session info or no MCP servers
    if (!(sessionInfo === null || sessionInfo === void 0 ? void 0 : sessionInfo.mcpServers) || sessionInfo.mcpServers.length === 0) {
        return null;
    }
    var toggleServer = function (serverName) {
        setExpandedServers(function (prev) {
            var next = new Set(prev);
            if (next.has(serverName)) {
                next.delete(serverName);
            }
            else {
                next.add(serverName);
            }
            return next;
        });
    };
    var getStatusIcon = function (status) {
        switch (status) {
            case "connected": return <span class="w-2 h-2 rounded-full bg-green-500" aria-label="Connected"/>;
            case "failed": return <span class="w-2 h-2 rounded-full bg-red-500" aria-label="Connection failed"/>;
            case "needs-auth": return <span class="w-2 h-2 rounded-full bg-yellow-500" aria-label="Needs authentication"/>;
            case "pending": return <lucide_solid_1.Loader2 class="w-3 h-3 text-muted-foreground animate-spin" aria-label="Connecting"/>;
            default: return <span class="w-2 h-2 rounded-full bg-muted-foreground/50" aria-label="Unknown status"/>;
        }
    };
    var getStatusText = function (status) {
        switch (status) {
            case "connected": return "Connected";
            case "failed": return "Connection failed";
            case "needs-auth": return "Needs authentication";
            case "pending": return "Connecting...";
            default: return status;
        }
    };
    // Keyboard navigation handler
    var handleKeyDown = function (e) {
        var serverCount = sessionInfo.mcpServers.length;
        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setFocusedIndex(function (prev) {
                    var _a;
                    var next = prev < serverCount - 1 ? prev + 1 : 0;
                    (_a = serverButtonsRef.current[next]) === null || _a === void 0 ? void 0 : _a.focus();
                    return next;
                });
                break;
            case "ArrowUp":
                e.preventDefault();
                setFocusedIndex(function (prev) {
                    var _a;
                    var next = prev > 0 ? prev - 1 : serverCount - 1;
                    (_a = serverButtonsRef.current[next]) === null || _a === void 0 ? void 0 : _a.focus();
                    return next;
                });
                break;
            case "Enter":
            case " ":
                if (focusedIndex >= 0 && focusedIndex < serverCount) {
                    var server = sessionInfo.mcpServers[focusedIndex];
                    var hasTools = (toolsByServer.get(server.name) || []).length > 0;
                    if (hasTools) {
                        e.preventDefault();
                        toggleServer(server.name);
                    }
                }
                break;
            case "Escape":
                setIsOpen(false);
                break;
        }
    };
    return <popover_1.Popover open={isOpen} onOpenChange={setIsOpen}>
      <tooltip_1.Tooltip delayDuration={500}>
        <tooltip_1.TooltipTrigger asChild>
          <popover_1.PopoverTrigger asChild>
            <button_1.Button variant="ghost" size="sm" class="h-6 px-2 gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors rounded-md" aria-label="MCP Servers" aria-haspopup="dialog" aria-expanded={isOpen}>
              <icons_1.OriginalMCPIcon class="h-3.5 w-3.5" aria-hidden="true"/>
              <span>{connectedCount} MCP</span>
            </button_1.Button>
          </popover_1.PopoverTrigger>
        </tooltip_1.TooltipTrigger>
        <tooltip_1.TooltipContent>
          {connectedCount} MCP server{connectedCount !== 1 ? "s" : ""} connected
        </tooltip_1.TooltipContent>
      </tooltip_1.Tooltip>

      <popover_1.PopoverContent align="start" class="w-72 p-0" onOpenAutoFocus={function (e) { return e.preventDefault(); }} onKeyDown={handleKeyDown} role="dialog" aria-label="MCP Servers">
        <div class="px-3 py-2 border-b">
          <h4 class="font-medium text-sm" id="mcp-servers-title">
            MCP Servers
          </h4>
          <p class="text-xs text-muted-foreground mt-0.5">
            Model Context Protocol servers
          </p>
        </div>

        <div class="max-h-64 overflow-y-auto py-1" role="list" aria-labelledby="mcp-servers-title">
          {sessionInfo.mcpServers.map(function (server, index) {
            var _a;
            var tools = toolsByServer.get(server.name) || [];
            var isExpanded = expandedServers.has(server.name);
            var hasTools = tools.length > 0;
            return <div key={server.name} role="listitem">
                {/* Server row */}
                <button ref={function (el) {
                    serverButtonsRef.current[index] = el;
                }} onClick={function () { return hasTools && toggleServer(server.name); }} onFocus={function () { return setFocusedIndex(index); }} class={(0, utils_1.cn)("w-full flex items-center gap-2 px-3 py-1.5 text-left text-sm transition-colors", hasTools ? "hover:bg-muted/50 cursor-pointer" : "cursor-default", focusedIndex === index && "bg-muted/50")} aria-expanded={hasTools ? isExpanded : undefined} aria-controls={hasTools ? "tools-".concat(server.name) : undefined} tabIndex={0} title={server.error || getStatusText(server.status)}>
                  {/* Expand/collapse chevron */}
                  <lucide_solid_1.ChevronRight class={(0, utils_1.cn)("h-3 w-3 text-muted-foreground transition-transform shrink-0", isExpanded && "rotate-90", !hasTools && "opacity-0")} aria-hidden="true"/>

                  {/* Status indicator */}
                  {getStatusIcon(server.status)}

                  {/* Server name and version */}
                  <div class="flex-1 min-w-0">
                    <span class="truncate block">{server.name}</span>
                    {((_a = server.serverInfo) === null || _a === void 0 ? void 0 : _a.version) && <span class="text-[10px] text-muted-foreground/70 truncate block">
                        v{server.serverInfo.version}
                      </span>}
                  </div>

                  {/* Tool count badge */}
                  {hasTools && <span class="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
                      {tools.length} tool{tools.length !== 1 ? "s" : ""}
                    </span>}
                </button>

                {/* Error message */}
                {server.error && <div class="pl-10 pr-3 pb-1 text-[10px] text-red-500/80 truncate" title={server.error}>
                    {server.error}
                  </div>}

                {/* Tools list (expanded) */}
                {isExpanded && hasTools && <div id={"tools-".concat(server.name)} class="pl-8 pr-3 py-1 space-y-0.5" role="list" aria-label={"Tools for ".concat(server.name)}>
                    {tools.map(function (tool) { return <div key={tool} class="text-xs text-muted-foreground py-0.5 truncate" title={tool} role="listitem">
                        {tool}
                      </div>; })}
                  </div>}
              </div>;
        })}
        </div>

        {/* Plugins section */}
        {sessionInfo.plugins && sessionInfo.plugins.length > 0 && <>
            <div class="border-t px-3 py-2">
              <h4 class="font-medium text-sm" id="plugins-title">
                Plugins
              </h4>
            </div>
            <div class="pb-1" role="list" aria-labelledby="plugins-title">
              {sessionInfo.plugins.map(function (plugin) { return <div key={plugin.path} class="px-3 py-1.5 text-sm flex items-center gap-2" role="listitem">
                  <span class="w-2 h-2 rounded-full bg-green-500" aria-label="Active"/>
                  <span class="truncate">{plugin.name}</span>
                </div>; })}
            </div>
          </>}

        {/* Footer with config hint */}
        <div class="border-t px-3 py-2 text-xs text-muted-foreground">
          Configure in{" "}
          <code class="bg-muted px-1 py-0.5 rounded">~/.claude.json</code>{" "}
          or <code class="bg-muted px-1 py-0.5 rounded">.mcp.json</code>
        </div>
      </popover_1.PopoverContent>
    </popover_1.Popover>;
});
