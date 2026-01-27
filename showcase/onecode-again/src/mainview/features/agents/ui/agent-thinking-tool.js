"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentThinkingTool = void 0;
var solid_js_1 = require("solid-js");
var lucide_solid_1 = require("lucide-solid");
var utils_1 = require("../../../lib/utils");
var chat_markdown_renderer_1 = require("../../../components/chat-markdown-renderer");
var agent_tool_interrupted_1 = require("./agent-tool-interrupted");
var agent_tool_utils_1 = require("./agent-tool-utils");
// Constants for thinking preview and scrolling
var PREVIEW_LENGTH = 60;
var SCROLL_THRESHOLD = 500;
exports.AgentThinkingTool = memo(function AgentThinkingTool(_a) {
    var _b;
    var part = _a.part, chatStatus = _a.chatStatus;
    var isPending = part.state !== "output-available" && part.state !== "output-error";
    // Include "submitted" status - this is when request was sent but streaming hasn't started yet
    var isActivelyStreaming = chatStatus === "streaming" || chatStatus === "submitted";
    var isStreaming = isPending && isActivelyStreaming;
    var isInterrupted = isPending && !isActivelyStreaming && chatStatus !== undefined;
    // Default: expanded while streaming, collapsed when done
    var _c = (0, solid_js_1.createSignal)(isStreaming), isExpanded = _c[0], setIsExpanded = _c[1];
    var _d = (0, solid_js_1.createSignal)(isStreaming), wasStreamingRef = _d[0], setWasStreamingRef = _d[1];
    var _e = (0, solid_js_1.createSignal)(null), scrollRef = _e[0], setScrollRef = _e[1];
    // Auto-collapse when streaming ends (transition from true -> false)
    (0, solid_js_1.createEffect)(function () {
        if (wasStreamingRef.current && !isStreaming) {
            setIsExpanded(false);
        }
        wasStreamingRef.current = isStreaming;
    });
    // Auto-scroll to bottom when streaming
    (0, solid_js_1.createEffect)(function () {
        if (isStreaming && isExpanded && scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    });
    // Get thinking text
    var thinkingText = ((_b = part.input) === null || _b === void 0 ? void 0 : _b.text) || "";
    // Build preview for collapsed state
    var previewText = thinkingText.slice(0, PREVIEW_LENGTH).replace(/\n/g, " ");
    // Show interrupted state if thinking was interrupted without completing
    if (isInterrupted && !thinkingText) {
        return <agent_tool_interrupted_1.AgentToolInterrupted toolName="Thinking"/>;
    }
    return <div>
      {/* Header - clickable to toggle, same as Exploring */}
      <div onClick={function () { return setIsExpanded(!isExpanded); }} class="group flex items-start gap-1.5 py-0.5 px-2 cursor-pointer">
        <div class="flex-1 min-w-0 flex items-center gap-1">
          <div class="text-xs flex items-center gap-1.5 min-w-0">
            <span class="font-medium whitespace-nowrap flex-shrink-0 text-muted-foreground">
              {isStreaming ? "Thinking" : "Thought"}
            </span>
            {/* Preview text when collapsed */}
            {!isExpanded && previewText && <span class="text-muted-foreground/60 truncate">
                {previewText}...
              </span>}
            {/* Chevron - rotates when expanded, visible on hover when collapsed */}
            <lucide_solid_1.ChevronRight class={(0, utils_1.cn)("w-3.5 h-3.5 text-muted-foreground/60 transition-transform duration-200 ease-out flex-shrink-0", isExpanded && "rotate-90", !isExpanded && "opacity-0 group-hover:opacity-100")}/>
          </div>
        </div>
      </div>

      {/* Thinking content - only show when expanded */}
      {isExpanded && thinkingText && <div class="relative">
          {/* Top gradient fade when streaming and has lots of content */}
          {isStreaming && thinkingText.length > SCROLL_THRESHOLD && <div class="absolute inset-x-0 top-0 h-5 bg-gradient-to-b from-background/70 to-transparent z-10 pointer-events-none"/>}

          {/* Scrollable container */}
          <div ref={scrollRef} class={(0, utils_1.cn)("px-2", isStreaming && thinkingText.length > SCROLL_THRESHOLD && "overflow-y-auto scrollbar-none max-h-24")}>
            {/* Markdown content */}
            <chat_markdown_renderer_1.ChatMarkdownRenderer content={thinkingText} size="sm" class="text-muted-foreground"/>
            {/* Blinking cursor when streaming */}
            {isStreaming && <span class="inline-block w-1 h-3 bg-muted-foreground/50 ml-0.5 animate-pulse"/>}
          </div>
        </div>}
    </div>;
}, agent_tool_utils_1.areToolPropsEqual);
