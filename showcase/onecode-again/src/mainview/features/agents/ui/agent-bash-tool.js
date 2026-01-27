"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentBashTool = void 0;
var solid_js_1 = require("solid-js");
var lucide_solid_1 = require("lucide-solid");
var icons_1 = require("../../../components/ui/icons");
var text_shimmer_1 = require("../../../components/ui/text-shimmer");
var agent_tool_registry_1 = require("./agent-tool-registry");
var agent_tool_interrupted_1 = require("./agent-tool-interrupted");
var agent_tool_utils_1 = require("./agent-tool-utils");
var utils_1 = require("../../../lib/utils");
// Extract command summary - first word of each command in a pipeline
function extractCommandSummary(command) {
    // First, normalize line continuations (backslash + newline) into single line
    var normalizedCommand = command.replace(/\\\s*\n\s*/g, " ");
    var parts = normalizedCommand.split(/\s*(?:&&|\|\||;|\|)\s*/);
    var firstWords = parts.map(function (p) { return p.trim().split(/\s+/)[0]; }).filter(Boolean);
    // Limit to first 4 commands to keep it concise
    var limited = firstWords.slice(0, 4);
    if (firstWords.length > 4) {
        return limited.join(", ") + "...";
    }
    return limited.join(", ");
}
// Limit output to first N lines
function limitLines(text, maxLines) {
    if (!text)
        return {
            text: "",
            truncated: false
        };
    var lines = text.split("\n");
    if (lines.length <= maxLines) {
        return {
            text: text,
            truncated: false
        };
    }
    return {
        text: lines.slice(0, maxLines).join("\n"),
        truncated: true
    };
}
exports.AgentBashTool = memo(function AgentBashTool(_a) {
    var _b, _c, _d, _e, _f, _g, _h;
    var part = _a.part, messageId = _a.messageId, partIndex = _a.partIndex, chatStatus = _a.chatStatus;
    var _j = (0, solid_js_1.createSignal)(false), isOutputExpanded = _j[0], setIsOutputExpanded = _j[1];
    var isPending = (0, agent_tool_registry_1.getToolStatus)(part, chatStatus).isPending;
    var command = ((_b = part.input) === null || _b === void 0 ? void 0 : _b.command) || "";
    var stdout = ((_c = part.output) === null || _c === void 0 ? void 0 : _c.stdout) || ((_d = part.output) === null || _d === void 0 ? void 0 : _d.output) || "";
    var stderr = ((_e = part.output) === null || _e === void 0 ? void 0 : _e.stderr) || "";
    var exitCode = (_g = (_f = part.output) === null || _f === void 0 ? void 0 : _f.exitCode) !== null && _g !== void 0 ? _g : (_h = part.output) === null || _h === void 0 ? void 0 : _h.exit_code;
    // For bash tools, success/error is determined by exitCode, not by state
    // exitCode 0 = success, anything else (or undefined if no output yet) = error
    var isSuccess = exitCode === 0;
    var isError = exitCode !== undefined && exitCode !== 0;
    // Determine if we have any output
    var hasOutput = stdout || stderr;
    // Limit output to 3 lines when collapsed
    var MAX_OUTPUT_LINES = 3;
    var stdoutLimited = (0, solid_js_1.createMemo)(function () { return limitLines(stdout, MAX_OUTPUT_LINES); });
    var stderrLimited = (0, solid_js_1.createMemo)(function () { return limitLines(stderr, MAX_OUTPUT_LINES); });
    var hasMoreOutput = stdoutLimited.truncated || stderrLimited.truncated;
    // Memoize command summary to avoid recalculation on every render
    var commandSummary = (0, solid_js_1.createMemo)(function () { return extractCommandSummary(command); });
    // Check if command input is still being streamed
    // Only consider streaming if chat is actively streaming (prevents hang on stop)
    // Include "submitted" status - this is when request was sent but streaming hasn't started yet
    var isActivelyStreaming = chatStatus === "streaming" || chatStatus === "submitted";
    var isInputStreaming = part.state === "input-streaming" && isActivelyStreaming;
    // If command is still being generated (input-streaming state), show loading state
    if (isInputStreaming) {
        return <div class="flex items-start gap-1.5 rounded-md py-0.5 px-2">
        <div class="flex-1 min-w-0 flex items-center gap-1.5">
          <div class="text-xs text-muted-foreground flex items-center gap-1.5 min-w-0">
            <span class="font-medium whitespace-nowrap flex-shrink-0">
              <text_shimmer_1.TextShimmer as="span" duration={1.2} class="inline-flex items-center text-xs leading-none h-4 m-0">
                Generating command
              </text_shimmer_1.TextShimmer>
            </span>
          </div>
        </div>
      </div>;
    }
    // If no command and not streaming, tool was interrupted
    if (!command) {
        return <agent_tool_interrupted_1.AgentToolInterrupted toolName="Command"/>;
    }
    return <div data-message-id={messageId} data-part-index={partIndex} data-part-type="tool-Bash" class="rounded-lg border border-border bg-muted/30 overflow-hidden mx-2">
      {/* Header - clickable to expand, fixed height to prevent layout shift */}
      <div onClick={function () { return hasMoreOutput && !isPending && setIsOutputExpanded(!isOutputExpanded); }} class={(0, utils_1.cn)("flex items-center justify-between pl-2.5 pr-0.5 h-7", hasMoreOutput && !isPending && "cursor-pointer hover:bg-muted/50 transition-colors duration-150")}>
        <span class="text-xs text-muted-foreground truncate flex-1 min-w-0">
          {isPending ? "Running command: " : "Ran command: "}
          {commandSummary}
        </span>

        {/* Status and expand button */}
        <div class="flex items-center gap-2 flex-shrink-0 ml-2">
          {/* Status - min-width ensures no layout shift */}
          <div class="flex items-center gap-1 text-xs text-muted-foreground min-w-[60px] justify-end">
            {isPending ? <icons_1.IconSpinner class="w-3 h-3"/> : isSuccess ? <>
                <lucide_solid_1.Check class="w-3 h-3"/>
                <span>Success</span>
              </> : isError ? <>
                <lucide_solid_1.X class="w-3 h-3"/>
                <span>Failed</span>
              </> : null}
          </div>

          {/* Expand/Collapse button - only show when not pending and has output that can be expanded */}
          {/* Always render container for consistent spacing */}
          <div class="w-6 h-6 flex items-center justify-center">
            {!isPending && hasOutput && hasMoreOutput && <button onClick={function (e) {
                e.stopPropagation();
                setIsOutputExpanded(!isOutputExpanded);
            }} class="p-1 rounded-md hover:bg-accent transition-[background-color,transform] duration-150 ease-out active:scale-95">
                {isOutputExpanded ? <icons_1.CollapseIcon class="w-4 h-4 text-muted-foreground"/> : <icons_1.ExpandIcon class="w-4 h-4 text-muted-foreground"/>}
              </button>}
          </div>
        </div>
      </div>

      {/* Content - always visible, clickable to expand (only when collapsed and has more output) */}
      <div onClick={function () { return hasMoreOutput && !isOutputExpanded && setIsOutputExpanded(true); }} class={(0, utils_1.cn)("border-t border-border px-2.5 py-1.5 transition-colors duration-150", hasMoreOutput && !isOutputExpanded && "cursor-pointer hover:bg-muted/50")}>
        {/* Command - always show full command */}
        <div class="font-mono text-xs">
          <span class="text-amber-600 dark:text-amber-400">$ </span>
          <span class="text-foreground whitespace-pre-wrap break-all">
            {command}
          </span>
        </div>

        {/* Stdout - show limited lines when collapsed, full when expanded */}
        {stdout && <div class="mt-1.5 font-mono text-xs text-muted-foreground whitespace-pre-wrap break-all">
            {isOutputExpanded ? stdout : stdoutLimited.text}
          </div>}

        {/* Stderr - warning/error color based on exit code */}
        {stderr && <div class={(0, utils_1.cn)("mt-1.5 font-mono text-xs whitespace-pre-wrap break-all", 
            // If exitCode is 0, it's a warning (e.g. npm warnings)
            // If exitCode is non-zero, it's an error
            exitCode === 0 || exitCode === undefined ? "text-amber-600 dark:text-amber-400" : "text-rose-500 dark:text-rose-400")}>
            {isOutputExpanded ? stderr : stderrLimited.text}
          </div>}

      </div>
    </div>;
}, agent_tool_utils_1.areToolPropsEqual);
