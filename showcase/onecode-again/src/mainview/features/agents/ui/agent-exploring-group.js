"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentExploringGroup = void 0;
var solid_js_1 = require("solid-js");
var lucide_solid_1 = require("lucide-solid");
var agent_tool_registry_1 = require("./agent-tool-registry");
var agent_tool_call_1 = require("./agent-tool-call");
var agent_tool_utils_1 = require("./agent-tool-utils");
var utils_1 = require("../../../lib/utils");
// Constants for rendering
var MAX_VISIBLE_TOOLS = 5;
var TOOL_HEIGHT_PX = 24;
exports.AgentExploringGroup = memo(function AgentExploringGroup(_a) {
    var parts = _a.parts, chatStatus = _a.chatStatus, isStreaming = _a.isStreaming;
    // Default: expanded while streaming, collapsed when done
    var _b = (0, solid_js_1.createSignal)(isStreaming), isExpanded = _b[0], setIsExpanded = _b[1];
    var _c = (0, solid_js_1.createSignal)(null), scrollRef = _c[0], setScrollRef = _c[1];
    var _d = (0, solid_js_1.createSignal)(isStreaming), wasStreamingRef = _d[0], setWasStreamingRef = _d[1];
    // Auto-collapse when streaming ends (transition from true -> false)
    (0, solid_js_1.createEffect)(function () {
        if (wasStreamingRef.current && !isStreaming) {
            setIsExpanded(false);
        }
        wasStreamingRef.current = isStreaming;
    });
    // Auto-scroll to bottom when streaming and new parts added
    (0, solid_js_1.createEffect)(function () {
        if (isStreaming && isExpanded && scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    });
    // Count files (Read, Grep, Glob) and searches (WebSearch, WebFetch)
    var fileCount = parts.filter(function (p) { return [
        "tool-Read",
        "tool-Grep",
        "tool-Glob"
    ].includes(p.type); }).length;
    var searchCount = parts.filter(function (p) { return ["tool-WebSearch", "tool-WebFetch"].includes(p.type); }).length;
    // Build subtitle parts
    var subtitleParts = [];
    if (fileCount > 0) {
        subtitleParts.push("".concat(fileCount, " ").concat(fileCount === 1 ? "file" : "files"));
    }
    if (searchCount > 0) {
        subtitleParts.push("".concat(searchCount, " ").concat(searchCount === 1 ? "search" : "searches"));
    }
    var subtitle = subtitleParts.join(" ");
    return <div>
      {/* Header - clickable to toggle */}
      <div onClick={function () { return setIsExpanded(!isExpanded); }} class="group flex items-start gap-1.5 py-0.5 px-2 cursor-pointer">
        <div class="flex-1 min-w-0 flex items-center gap-1">
          <div class="text-xs flex items-center gap-1.5 min-w-0">
            <span class="font-medium whitespace-nowrap flex-shrink-0 text-muted-foreground">
              {isStreaming ? "Exploring" : "Explored"}
            </span>
            <span class="text-muted-foreground/60 whitespace-nowrap flex-shrink-0">
              {subtitle}
            </span>
            {/* Chevron right after text - rotates when expanded */}
            <lucide_solid_1.ChevronRight class={(0, utils_1.cn)("w-3.5 h-3.5 text-muted-foreground/60 transition-transform duration-200 ease-out", isExpanded && "rotate-90", !isExpanded && "opacity-0 group-hover:opacity-100")}/>
          </div>
        </div>
      </div>

      {/* Tools list - only show when expanded */}
      {isExpanded && <div class="relative mt-1">
          {/* Top gradient fade when streaming and has many items */}
          <div class={(0, utils_1.cn)("absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none transition-opacity duration-200", isStreaming && parts.length > MAX_VISIBLE_TOOLS ? "opacity-100" : "opacity-0")}/>

          {/* Scrollable container - auto-scrolls to bottom when streaming */}
          <div ref={scrollRef} class={(0, utils_1.cn)("space-y-1.5", parts.length > MAX_VISIBLE_TOOLS && "overflow-y-auto scrollbar-hide")} style={parts.length > MAX_VISIBLE_TOOLS ? { maxHeight: "".concat(MAX_VISIBLE_TOOLS * TOOL_HEIGHT_PX, "px") } : undefined}>
            {parts.map(function (part, idx) {
                var _a, _b, _c;
                var meta = agent_tool_registry_1.AgentToolRegistry[part.type];
                if (!meta) {
                    return <div key={idx} class="text-xs text-muted-foreground py-0.5 px-2">
                    {(_a = part.type) === null || _a === void 0 ? void 0 : _a.replace("tool-", "")}
                  </div>;
                }
                var _d = (0, agent_tool_registry_1.getToolStatus)(part, chatStatus), isPending = _d.isPending, isError = _d.isError;
                return <agent_tool_call_1.AgentToolCall key={idx} icon={meta.icon} title={meta.title(part)} subtitle={(_b = meta.subtitle) === null || _b === void 0 ? void 0 : _b.call(meta, part)} tooltipContent={(_c = meta.tooltipContent) === null || _c === void 0 ? void 0 : _c.call(meta, part)} isPending={isPending} isError={isError}/>;
            })}
          </div>
        </div>}
    </div>;
}, agent_tool_utils_1.areExploringGroupPropsEqual);
