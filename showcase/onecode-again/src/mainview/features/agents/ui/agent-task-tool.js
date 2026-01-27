"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentTaskTool = void 0;
var solid_js_1 = require("solid-js");
var lucide_solid_1 = require("lucide-solid");
var agent_tool_registry_1 = require("./agent-tool-registry");
var agent_tool_call_1 = require("./agent-tool-call");
var agent_tool_interrupted_1 = require("./agent-tool-interrupted");
var agent_tool_utils_1 = require("./agent-tool-utils");
var text_shimmer_1 = require("../../../components/ui/text-shimmer");
var utils_1 = require("../../../lib/utils");
// Constants for rendering
var MAX_VISIBLE_TOOLS = 5;
var TOOL_HEIGHT_PX = 24;
// Format elapsed time in a human-readable format
function formatElapsedTime(ms) {
    if (ms < 1e3)
        return "";
    var seconds = Math.floor(ms / 1e3);
    if (seconds < 60)
        return "".concat(seconds, "s");
    var minutes = Math.floor(seconds / 60);
    var remainingSeconds = seconds % 60;
    if (remainingSeconds === 0)
        return "".concat(minutes, "m");
    return "".concat(minutes, "m ").concat(remainingSeconds, "s");
}
exports.AgentTaskTool = memo(function AgentTaskTool(_a) {
    var _b, _c, _d;
    var part = _a.part, nestedTools = _a.nestedTools, chatStatus = _a.chatStatus;
    var _e = (0, agent_tool_registry_1.getToolStatus)(part, chatStatus), isPending = _e.isPending, isInterrupted = _e.isInterrupted;
    // Default: collapsed
    var _f = (0, solid_js_1.createSignal)(false), isExpanded = _f[0], setIsExpanded = _f[1];
    var _g = (0, solid_js_1.createSignal)(null), scrollRef = _g[0], setScrollRef = _g[1];
    // Track elapsed time for running tasks
    var _h = (0, solid_js_1.createSignal)(0), elapsedMs = _h[0], setElapsedMs = _h[1];
    var description = ((_b = part.input) === null || _b === void 0 ? void 0 : _b.description) || "";
    // Use startedAt from backend for persistent timing across re-renders
    var startedAt = part.startedAt;
    // Track elapsed time while task is running using backend timestamp
    (0, solid_js_1.createEffect)(function () {
        if (isPending && startedAt) {
            // Set initial elapsed time immediately
            setElapsedMs(Date.now() - startedAt);
            var interval_1 = setInterval(function () {
                setElapsedMs(Date.now() - startedAt);
            }, 1e3);
            return function () { return clearInterval(interval_1); };
        }
    });
    // Use output duration from Claude Code if available, otherwise use our tracked time
    var outputDuration = ((_c = part.output) === null || _c === void 0 ? void 0 : _c.duration) || ((_d = part.output) === null || _d === void 0 ? void 0 : _d.duration_ms);
    var displayMs = !isPending && outputDuration ? outputDuration : elapsedMs;
    var elapsedTimeDisplay = formatElapsedTime(displayMs);
    // Auto-scroll to bottom when streaming and new nested tools added
    (0, solid_js_1.createEffect)(function () {
        if (isPending && isExpanded && scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    });
    var hasNestedTools = nestedTools.length > 0;
    // Build subtitle - always show description
    var getSubtitle = function () {
        if (description) {
            var truncated = description.length > 60 ? description.slice(0, 57) + "..." : description;
            return truncated;
        }
        return "";
    };
    var subtitle = getSubtitle();
    // Get title text based on status
    var getTitle = function () {
        return isPending ? "Running Task" : "Completed Task";
    };
    // Show interrupted state if task was interrupted without completing
    if (isInterrupted && !part.output) {
        return <agent_tool_interrupted_1.AgentToolInterrupted toolName="Task" subtitle={subtitle}/>;
    }
    return <div>
      {/* Header - clickable to toggle, same style as AgentExploringGroup */}
      <div onClick={function () { return setIsExpanded(!isExpanded); }} class="group flex items-start gap-1.5 py-0.5 px-2 cursor-pointer">
        <div class="flex-1 min-w-0 flex items-center gap-1">
          <div class="text-xs flex items-center gap-1.5 min-w-0">
            {/* Title with shimmer effect when running */}
            {isPending ? <text_shimmer_1.TextShimmer as="span" duration={1.2} class="font-medium whitespace-nowrap flex-shrink-0">
                {getTitle()}
              </text_shimmer_1.TextShimmer> : <span class="font-medium whitespace-nowrap flex-shrink-0 text-muted-foreground">
                {getTitle()}
              </span>}
            {subtitle && <span class="text-muted-foreground/60 truncate">
                {subtitle}
              </span>}
            {/* Show elapsed time while running or final time when done */}
            {elapsedTimeDisplay && <span class="text-muted-foreground/50 tabular-nums flex-shrink-0">
                {elapsedTimeDisplay}
              </span>}
            {/* Chevron right after text - rotates when expanded */}
            <lucide_solid_1.ChevronRight class={(0, utils_1.cn)("w-3.5 h-3.5 text-muted-foreground/60 transition-transform duration-200 ease-out flex-shrink-0", isExpanded && "rotate-90", !isExpanded && "opacity-0 group-hover:opacity-100")}/>
          </div>
        </div>
      </div>

      {/* Nested tools - only show when expanded */}
      {hasNestedTools && isExpanded && <div class="relative mt-1">
          {/* Top gradient fade when streaming and has many items */}
          <div class={(0, utils_1.cn)("absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none transition-opacity duration-200", isPending && nestedTools.length > MAX_VISIBLE_TOOLS ? "opacity-100" : "opacity-0")}/>

          {/* Scrollable container - auto-scrolls to bottom when streaming */}
          <div ref={scrollRef} class={(0, utils_1.cn)("space-y-1.5", isPending && nestedTools.length > MAX_VISIBLE_TOOLS && "overflow-y-auto scrollbar-hide")} style={isPending && nestedTools.length > MAX_VISIBLE_TOOLS ? { maxHeight: "".concat(MAX_VISIBLE_TOOLS * TOOL_HEIGHT_PX, "px") } : undefined}>
            {nestedTools.map(function (nestedPart, idx) {
                var _a, _b;
                var nestedMeta = agent_tool_registry_1.AgentToolRegistry[nestedPart.type];
                if (!nestedMeta) {
                    return <div key={idx} class="text-xs text-muted-foreground py-0.5 px-2">
                    {(_a = nestedPart.type) === null || _a === void 0 ? void 0 : _a.replace("tool-", "")}
                  </div>;
                }
                var _c = (0, agent_tool_registry_1.getToolStatus)(nestedPart, chatStatus), nestedIsPending = _c.isPending, nestedIsError = _c.isError;
                return <agent_tool_call_1.AgentToolCall key={idx} icon={nestedMeta.icon} title={nestedMeta.title(nestedPart)} subtitle={(_b = nestedMeta.subtitle) === null || _b === void 0 ? void 0 : _b.call(nestedMeta, nestedPart)} isPending={nestedIsPending} isError={nestedIsError}/>;
            })}
          </div>
        </div>}
    </div>;
}, agent_tool_utils_1.areTaskToolPropsEqual);
