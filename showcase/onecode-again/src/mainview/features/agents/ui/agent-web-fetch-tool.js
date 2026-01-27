"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentWebFetchTool = void 0;
var solid_js_1 = require("solid-js");
var icons_1 = require("../../../components/ui/icons");
var text_shimmer_1 = require("../../../components/ui/text-shimmer");
var agent_tool_registry_1 = require("./agent-tool-registry");
var agent_tool_interrupted_1 = require("./agent-tool-interrupted");
var agent_tool_utils_1 = require("./agent-tool-utils");
var utils_1 = require("../../../lib/utils");
exports.AgentWebFetchTool = memo(function AgentWebFetchTool(_a) {
    var _b, _c, _d, _e;
    var part = _a.part, chatStatus = _a.chatStatus;
    var _f = (0, solid_js_1.createSignal)(false), isExpanded = _f[0], setIsExpanded = _f[1];
    var _g = (0, agent_tool_registry_1.getToolStatus)(part, chatStatus), isPending = _g.isPending, isError = _g.isError, isInterrupted = _g.isInterrupted;
    var url = ((_b = part.input) === null || _b === void 0 ? void 0 : _b.url) || "";
    var result = ((_c = part.output) === null || _c === void 0 ? void 0 : _c.result) || "";
    var bytes = ((_d = part.output) === null || _d === void 0 ? void 0 : _d.bytes) || 0;
    var statusCode = (_e = part.output) === null || _e === void 0 ? void 0 : _e.code;
    var isSuccess = statusCode === 200;
    // Extract hostname for display
    var hostname = "";
    try {
        hostname = new URL(url).hostname.replace("www.", "");
    }
    catch (_h) {
        hostname = url.slice(0, 30);
    }
    // Format bytes
    var formatBytes = function (bytes) {
        if (bytes < 1024)
            return "".concat(bytes, " B");
        if (bytes < 1024 * 1024)
            return "".concat((bytes / 1024).toFixed(1), " KB");
        return "".concat((bytes / (1024 * 1024)).toFixed(1), " MB");
    };
    var hasContent = result.length > 0;
    // Show interrupted state if fetch was interrupted without completing
    if (isInterrupted && !result) {
        return <agent_tool_interrupted_1.AgentToolInterrupted toolName="Fetch" subtitle={hostname}/>;
    }
    return <div class="rounded-lg border border-border bg-muted/30 overflow-hidden mx-2">
      {/* Header - clickable to toggle expand */}
      <div onClick={function () { return hasContent && !isPending && setIsExpanded(!isExpanded); }} class={(0, utils_1.cn)("flex items-center justify-between px-2.5 h-7", hasContent && !isPending && "cursor-pointer hover:bg-muted/50 transition-colors duration-150")}>
        <div class="flex items-center gap-1.5 text-xs truncate flex-1 min-w-0">
          <icons_1.GlobeIcon class="w-3 h-3 flex-shrink-0 text-muted-foreground"/>
          
          {isPending ? <text_shimmer_1.TextShimmer as="span" duration={1.2} class="text-xs text-muted-foreground">
              Fetching
            </text_shimmer_1.TextShimmer> : <span class="text-xs text-muted-foreground">Fetched</span>}
          
          <span class="truncate text-foreground">{hostname}</span>
        </div>

        {/* Status and expand button */}
        <div class="flex items-center gap-2 flex-shrink-0 ml-2">
          <div class="flex items-center gap-1.5 text-xs">
            {isPending ? <icons_1.IconSpinner class="w-3 h-3"/> : isError || !isSuccess ? <span class="text-destructive">
                {statusCode ? "Error ".concat(statusCode) : "Failed"}
              </span> : <span class="text-muted-foreground">
                {formatBytes(bytes)}
              </span>}
          </div>

          {/* Expand/Collapse icon */}
          {hasContent && !isPending && <div class="relative w-4 h-4">
              <icons_1.ExpandIcon class={(0, utils_1.cn)("absolute inset-0 w-4 h-4 text-muted-foreground transition-[opacity,transform] duration-200 ease-out", isExpanded ? "opacity-0 scale-75" : "opacity-100 scale-100")}/>
              <icons_1.CollapseIcon class={(0, utils_1.cn)("absolute inset-0 w-4 h-4 text-muted-foreground transition-[opacity,transform] duration-200 ease-out", isExpanded ? "opacity-100 scale-100" : "opacity-0 scale-75")}/>
            </div>}
        </div>
      </div>

      {/* Content - expandable */}
      {hasContent && isExpanded && <div class="border-t border-border max-h-[300px] overflow-y-auto">
          <pre class="px-2.5 py-2 text-xs text-foreground whitespace-pre-wrap break-words font-mono">
            {result}
          </pre>
        </div>}
    </div>;
}, agent_tool_utils_1.areToolPropsEqual);
