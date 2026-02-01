import { createSignal, createMemo, Show, splitProps } from "solid-js";
import { Check, X } from "lucide-solid";
import { IconSpinner, ExpandIcon, CollapseIcon } from "../../../components/ui/icons";
import { TextShimmer } from "../../../components/ui/text-shimmer";
import { getToolStatus } from "./agent-tool-registry";
import { AgentToolInterrupted } from "./agent-tool-interrupted";
import { cn } from "../../../lib/utils";
interface AgentBashToolProps {
	part: any;
	messageId?: string;
	partIndex?: number;
	chatStatus?: string;
}
// Extract command summary - first word of each command in a pipeline
function extractCommandSummary(command: string): string {
	// First, normalize line continuations (backslash + newline) into single line
	const normalizedCommand = command.replace(/\\\s*\n\s*/g, " ");
	const parts = normalizedCommand.split(/\s*(?:&&|\|\||;|\|)\s*/);
	const firstWords = parts.map((p) => p.trim().split(/\s+/)[0]).filter(Boolean);
	// Limit to first 4 commands to keep it concise
	const limited = firstWords.slice(0, 4);
	if (firstWords.length > 4) {
		return limited.join(", ") + "...";
	}
	return limited.join(", ");
}
// Limit output to first N lines
function limitLines(text: string, maxLines: number): {
	text: string;
	truncated: boolean;
} {
	if (!text) return {
		text: "",
		truncated: false
	};
	const lines = text.split("\n");
	if (lines.length <= maxLines) {
		return {
			text,
			truncated: false
		};
	}
	return {
		text: lines.slice(0, maxLines).join("\n"),
		truncated: true
	};
}
export function AgentBashTool(props: AgentBashToolProps) {
	const [local] = splitProps(props, ["part", "messageId", "partIndex", "chatStatus"]);
	const [isOutputExpanded, setIsOutputExpanded] = createSignal(false);
	const { isPending } = getToolStatus(local.part, local.chatStatus);
	const command = local.part.input?.command || "";
	const stdout = local.part.output?.stdout || local.part.output?.output || "";
	const stderr = local.part.output?.stderr || "";
	const exitCode = local.part.output?.exitCode ?? local.part.output?.exit_code;
	// For bash tools, success/error is determined by exitCode, not by state
	// exitCode 0 = success, anything else (or undefined if no output yet) = error
	const isSuccess = exitCode === 0;
	const isError = exitCode !== undefined && exitCode !== 0;
	// Determine if we have any output
	const hasOutput = stdout || stderr;
	// Limit output to 3 lines when collapsed
	const MAX_OUTPUT_LINES = 3;
	const stdoutLimited = createMemo(() => limitLines(stdout, MAX_OUTPUT_LINES));
	const stderrLimited = createMemo(() => limitLines(stderr, MAX_OUTPUT_LINES));
	const hasMoreOutput = stdoutLimited.truncated || stderrLimited.truncated;
	// Memoize command summary to avoid recalculation on every render
	const commandSummary = createMemo(() => extractCommandSummary(command));
	// Check if command input is still being streamed
	// Only consider streaming if chat is actively streaming (prevents hang on stop)
	// Include "submitted" status - this is when request was sent but streaming hasn't started yet
	const isActivelyStreaming = local.chatStatus === "streaming" || local.chatStatus === "submitted";
	const isInputStreaming = local.part.state === "input-streaming" && isActivelyStreaming;
	// If command is still being generated (input-streaming state), show loading state
	if (isInputStreaming) {
		return <div class="flex items-start gap-1.5 rounded-md py-0.5 px-2">
        <div class="flex-1 min-w-0 flex items-center gap-1.5">
          <div class="text-xs text-muted-foreground flex items-center gap-1.5 min-w-0">
            <span class="font-medium whitespace-nowrap flex-shrink-0">
              <TextShimmer as="span" duration={1.2} class="inline-flex items-center text-xs leading-none h-4 m-0">
                Generating command
              </TextShimmer>
            </span>
          </div>
        </div>
      </div>;
	}
	// If no command and not streaming, tool was interrupted
	if (!command) {
		return <AgentToolInterrupted toolName="Command" />;
	}
	return <div data-message-id={local.messageId} data-part-index={local.partIndex} data-part-type="tool-Bash" class="rounded-lg border border-border bg-muted/30 overflow-hidden mx-2">
      {	/* Header - clickable to expand, fixed height to prevent layout shift */}
      <div onClick={() => hasMoreOutput && !isPending && setIsOutputExpanded(!isOutputExpanded)} class={cn("flex items-center justify-between pl-2.5 pr-0.5 h-7", hasMoreOutput && !isPending && "cursor-pointer hover:bg-muted/50 transition-colors duration-150")}>
        <span class="text-xs text-muted-foreground truncate flex-1 min-w-0">
          {isPending ? "Running command: " : "Ran command: "}
          {commandSummary}
        </span>

        { /* Status and expand button */}
        <div class="flex items-center gap-2 flex-shrink-0 ml-2">
          { /* Status - min-width ensures no layout shift */}
          <div class="flex items-center gap-1 text-xs text-muted-foreground min-w-[60px] justify-end">
            <Show when={isPending} fallback={<Show when={isSuccess} fallback={<Show when={isError} fallback={null}>
              <>
                <X class="w-3 h-3" />
                <span>Failed</span>
              </>
            </Show>}>
              <>
                <Check class="w-3 h-3" />
                <span>Success</span>
              </>
            </Show>}>
              <IconSpinner class="w-3 h-3" />
            </Show>
          </div>

          { /* Expand/Collapse button - only show when not pending and has output that can be expanded */}
          { /* Always render container for consistent spacing */}
          <div class="w-6 h-6 flex items-center justify-center">
            <Show when={!isPending && hasOutput && hasMoreOutput}><button onClick={(e) => {
 e.stopPropagation();
 		setIsOutputExpanded(!isOutputExpanded);
 	}} class="p-1 rounded-md hover:bg-accent transition-[background-color,transform] duration-150 ease-out active:scale-95">
                <Show when={isOutputExpanded()} fallback={<ExpandIcon class="w-4 h-4 text-muted-foreground" />}>
                  <CollapseIcon class="w-4 h-4 text-muted-foreground" />
                </Show>
              </button></Show>
          </div>
        </div>
      </div>

      {	/* Content - always visible, clickable to expand (only when collapsed and has more output) */}
      <div onClick={() => hasMoreOutput && !isOutputExpanded && setIsOutputExpanded(true)} class={cn("border-t border-border px-2.5 py-1.5 transition-colors duration-150", hasMoreOutput && !isOutputExpanded && "cursor-pointer hover:bg-muted/50")}>
        { /* Command - always show full command */}
        <div class="font-mono text-xs">
          <span class="text-amber-600 dark:text-amber-400">$ </span>
          <span class="text-foreground whitespace-pre-wrap break-all">
            {command}
          </span>
        </div>

        { /* Stdout - show limited lines when collapsed, full when expanded */}
        <Show when={stdout}><div class="mt-1.5 font-mono text-xs text-muted-foreground whitespace-pre-wrap break-all">
            {isOutputExpanded() ? stdout : stdoutLimited.text}
          </div></Show>

        { /* Stderr - warning/error color based on exit code */}
        <Show when={stderr}><div class={cn(
 "mt-1.5 font-mono text-xs whitespace-pre-wrap break-all",
		// If exitCode is 0, it's a warning (e.g. npm warnings)
		// If exitCode is non-zero, it's an error
		exitCode === 0 || exitCode === undefined ? "text-amber-600 dark:text-amber-400" : "text-rose-500 dark:text-rose-400"
	)}>
            {isOutputExpanded() ? stderr : stderrLimited.text}
          </div></Show>

      </div>
    </div>;
}
