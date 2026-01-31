import type { JSX } from "solid-js";
import { ListTree } from "lucide-solid";
import { createMemo, createSignal, Show } from "solid-js";
import { CollapseIcon, ExpandIcon, IconTextUndo, PlanIcon } from "../../../components/ui/icons";
import { TextShimmer } from "../../../components/ui/text-shimmer";
import { cn } from "../../../lib/utils";
import { isRollingBackAtom, rollbackHandlerAtom } from "../stores/message-store";
import { AgentAskUserQuestionTool } from "../ui/agent-ask-user-question-tool";
import { AgentBashTool } from "../ui/agent-bash-tool";
import { AgentEditTool } from "../ui/agent-edit-tool";
import { AgentExploringGroup } from "../ui/agent-exploring-group";
import { AgentPlanFileTool } from "../ui/agent-plan-file-tool";
import { isPlanFile } from "../ui/agent-tool-utils";
import { AgentMessageUsage, type AgentMessageMetadata } from "../ui/agent-message-usage";
import { AgentPlanTool } from "../ui/agent-plan-tool";
import { AgentTaskTool } from "../ui/agent-task-tool";
import { AgentThinkingTool } from "../ui/agent-thinking-tool";
import { AgentTodoTool } from "../ui/agent-todo-tool";
import { AgentToolCall } from "../ui/agent-tool-call";
import { AgentToolRegistry, getToolStatus } from "../ui/agent-tool-registry";
import { AgentWebFetchTool } from "../ui/agent-web-fetch-tool";
import { AgentWebSearchCollapsible } from "../ui/agent-web-search-collapsible";
import { CopyButton, PlayButton, getMessageTextContent } from "../ui/message-action-buttons";
import { MemoizedTextPart } from "./memoized-text-part";
// Exploring tools - these get grouped when 3+ consecutive
const EXPLORING_TOOLS = new Set([
	"tool-Read",
	"tool-Grep",
	"tool-Glob",
	"tool-WebSearch",
	"tool-WebFetch"
]);
// Group consecutive exploring tools into exploring-group
function groupExploringTools(parts: any[], nestedToolIds: Set<string>): any[] {
	const result: any[] = [];
	let currentGroup: any[] = [];
	for (const part of parts) {
		const isNested = part.toolCallId && nestedToolIds.has(part.toolCallId);
		if (EXPLORING_TOOLS.has(part.type) && !isNested) {
			currentGroup.push(part);
		} else {
			if (currentGroup.length >= 3) {
				result.push({
					type: "exploring-group",
					parts: currentGroup
				});
			} else {
				result.push(...currentGroup);
			}
			currentGroup = [];
			result.push(part);
		}
	}
	if (currentGroup.length >= 3) {
		result.push({
			type: "exploring-group",
			parts: currentGroup
		});
	} else {
		result.push(...currentGroup);
	}
	return result;
}
// Collapsible steps component
interface CollapsibleStepsProps {
	stepsCount: number;
	children: JSX.Element;
	defaultExpanded?: boolean;
}
function CollapsibleSteps(props: CollapsibleStepsProps) {
	const stepsCount = () => props.stepsCount;
	const [isExpanded, setIsExpanded] = createSignal(props.defaultExpanded ?? false);
	return (
		<Show when={(stepsCount()) > 0} fallback={null}>
			<div class="mb-2" data-collapsible-steps="true">
      <div class="flex items-center justify-between rounded-md py-0.5 px-2 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setIsExpanded(!isExpanded)}>
        <div class="flex items-center gap-1.5 text-xs text-muted-foreground">
          <ListTree class="w-3.5 h-3.5 flex-shrink-0" />
          <span class="font-medium whitespace-nowrap">
            {stepsCount()} {stepsCount() === 1 ? "step" : "steps"}
          </span>
        </div>
        <button class="p-1 rounded-md hover:bg-accent transition-[background-color,transform] duration-150 ease-out active:scale-95" onClick={(e) => {
		e.stopPropagation();
		setIsExpanded(!isExpanded);
	}}>
          <div class="relative w-4 h-4">
            <ExpandIcon class={cn("absolute inset-0 w-4 h-4 text-muted-foreground transition-[opacity,transform] duration-200 ease-out", isExpanded() ? "opacity-0 scale-75" : "opacity-100 scale-100")} />
            <CollapseIcon class={cn("absolute inset-0 w-4 h-4 text-muted-foreground transition-[opacity,transform] duration-200 ease-out", isExpanded() ? "opacity-100 scale-100" : "opacity-0 scale-75")} />
          </div>
        </button>
      </div>
      <Show when={isExpanded()}>
          <div class="mt-1 space-y-1.5">{props.children}</div>
        </Show>
    </div>
		</Show>
	);
}
// ============================================================================
// ASSISTANT MESSAGE ITEM - MEMOIZED BY MESSAGE ID + PARTS LENGTH
// ============================================================================
export interface AssistantMessageItemProps {
	message: any;
	isLastMessage: boolean;
	isStreaming: boolean;
	status: string;
	isMobile: boolean;
	subChatId: string;
	chatId: string;
	sandboxSetupStatus?: "cloning" | "ready" | "error";
}
// Cache for tracking previous message state per message (to detect AI SDK in-place mutations)
// Stores both text lengths and tool states for complete change detection
interface MessageStateSnapshot {
	textLengths: number[];
	partStates: (string | undefined)[];
	lastPartInputJson: string | undefined;
}
const messageStateCache = new Map<string, MessageStateSnapshot>();
// Custom comparison - check if message content actually changed
// CRITICAL: AI SDK mutates objects in-place! So prev.message.parts[i].text === next.message.parts[i].text
// even when text HAS changed (they're the same mutated object).
// Solution: Cache state externally and compare those.
function areMessagePropsEqual(prev: AssistantMessageItemProps, next: AssistantMessageItemProps): boolean {
	const msgId = next.message?.id;
	// Different message ID = different message
	if (prev.message?.id !== next.message?.id) {
		return false;
	}
	// Check other props first (cheap comparisons)
	if (prev.status !== next.status) return false;
	if (prev.isStreaming !== next.isStreaming) return false;
	if (prev.isLastMessage !== next.isLastMessage) return false;
	if (prev.isMobile !== next.isMobile) return false;
	if (prev.subChatId !== next.subChatId) return false;
	if (prev.chatId !== next.chatId) return false;
	if (prev.sandboxSetupStatus !== next.sandboxSetupStatus) return false;
	// Get current message state from parts
	const nextParts = next.message?.parts || [];
	const lastPart = nextParts[nextParts.length - 1];
	const currentState: MessageStateSnapshot = {
		textLengths: nextParts.map((p: any) => p.type === "text" ? p.text?.length || 0 : -1),
		partStates: nextParts.map((p: any) => p.state),
		lastPartInputJson: lastPart?.input ? JSON.stringify(lastPart.input) : undefined
	};
	// Get cached state from previous render
	const cachedState = msgId ? messageStateCache.get(msgId) : undefined;
	// If no cache, this is first comparison - cache and allow render
	if (!cachedState) {
		if (msgId) messageStateCache.set(msgId, currentState);
		return false;
	}
	// Compare parts count
	if (cachedState.textLengths.length !== currentState.textLengths.length) {
		messageStateCache.set(msgId!, currentState);
		return false;
	}
	// Compare text lengths (detects streaming text changes!)
	for (let i = 0; i < currentState.textLengths.length; i++) {
		if (cachedState.textLengths[i] !== currentState.textLengths[i]) {
			messageStateCache.set(msgId!, currentState);
			return false;
		}
	}
	// Compare last part's input (detects tool input streaming!)
	if (cachedState.lastPartInputJson !== currentState.lastPartInputJson) {
		messageStateCache.set(msgId!, currentState);
		return false;
	}
	// Compare ALL part states (detects Edit plan file streaming!)
	for (let i = 0; i < currentState.partStates.length; i++) {
		if (cachedState.partStates[i] !== currentState.partStates[i]) {
			messageStateCache.set(msgId!, currentState);
			return false;
		}
	}
	// Nothing changed - skip re-render
	return true;
}
export function AssistantMessageItem(props: AssistantMessageItemProps) {
	const onRollback = rollbackHandlerAtom[0];
	const isRollingBack = isRollingBackAtom[0];
	const messageParts = () => props.message?.parts || [];
	const contentParts = createMemo(() => messageParts().filter((p: any) => p.type !== "step-start"));
	const shouldShowPlanning = createMemo(() => (props.sandboxSetupStatus ?? "ready") === "ready" && props.isStreaming && props.isLastMessage && contentParts().length === 0);
	const toolDataMemo = createMemo(() => {
		const parts = messageParts();
		const nestedToolsMap = new Map<string, any[]>();
		const nestedToolIds = new Set<string>();
		const taskPartIds = new Set(parts.filter((p: any) => p.type === "tool-Task" && p.toolCallId).map((p: any) => p.toolCallId));
		const orphanTaskGroups = new Map<string, {
			parts: any[];
			firstToolCallId: string;
		}>();
		const orphanToolCallIds = new Set<string>();
		const orphanFirstToolCallIds = new Set<string>();
		for (const part of parts) {
			if (part.toolCallId?.includes(":")) {
				const parentId = part.toolCallId.split(":")[0];
				if (taskPartIds.has(parentId)) {
					if (!nestedToolsMap.has(parentId)) {
						nestedToolsMap.set(parentId, []);
					}
					nestedToolsMap.get(parentId)!.push(part);
					nestedToolIds.add(part.toolCallId);
				} else {
					let group = orphanTaskGroups.get(parentId);
					if (!group) {
						group = {
							parts: [],
							firstToolCallId: part.toolCallId
						};
						orphanTaskGroups.set(parentId, group);
						orphanFirstToolCallIds.add(part.toolCallId);
					}
					group.parts.push(part);
					orphanToolCallIds.add(part.toolCallId);
				}
			}
		}
		return {
			nestedToolsMap,
			nestedToolIds,
			orphanTaskGroups,
			orphanToolCallIds,
			orphanFirstToolCallIds
		};
	});
	// Derived accessors for tool data
	const nestedToolsMap = createMemo(() => toolDataMemo().nestedToolsMap);
	const nestedToolIds = createMemo(() => toolDataMemo().nestedToolIds);
	const orphanTaskGroups = createMemo(() => toolDataMemo().orphanTaskGroups);
	const orphanToolCallIds = createMemo(() => toolDataMemo().orphanToolCallIds);
	const orphanFirstToolCallIds = createMemo(() => toolDataMemo().orphanFirstToolCallIds);
	// Collect all plan operations (Write/Edit) for unified handling
	const planOpsSummary = createMemo(() => {
		const operations: Array<{
			type: "write" | "edit";
			part: any;
			index: number;
		}> = [];
		const parts = messageParts();
		for (let i = 0; i < parts.length; i++) {
			const part = parts[i];
			const filePath = part.input?.file_path || "";
			if ((part.type === "tool-Write" || part.type === "tool-Edit") && isPlanFile(filePath)) {
				operations.push({
					type: part.type === "tool-Write" ? "write" : "edit",
					part,
					index: i
				});
			}
		}
		if (operations.length === 0) {
			return {
				operations: [],
				hasAnyPlanOperation: false,
				isStreaming: false,
				lastOperationType: null as "write" | "edit" | null
			};
		}
		const isStreaming = operations.some((op) => op.part.state === "input-streaming" || op.part.state === "pending");
		const lastOp = operations[operations.length - 1];
		return {
			operations,
			hasAnyPlanOperation: true,
			isStreaming,
			lastOperationType: lastOp.type
		};
	});
	// Collapsing logic: collapse only if final text exists after tools
	const collapseDataMemo = createMemo(() => {
		const parts = messageParts();
		let lastToolIndex = -1;
		let lastTextIndex = -1;
		for (let i = 0; i < parts.length; i++) {
			const part = parts[i];
			// Ignore ExitPlanMode - it's not a real tool for the user
			if (part.type?.startsWith("tool-") && part.type !== "tool-ExitPlanMode") {
				lastToolIndex = i;
			}
			if (part.type === "text" && part.text?.trim()) {
				lastTextIndex = i;
			}
		}
		const hasToolsAndFinalText = lastToolIndex !== -1 && lastTextIndex > lastToolIndex;
		const finalTextIndex = hasToolsAndFinalText ? lastTextIndex : -1;
		const hasFinalText = finalTextIndex !== -1 && (!isStreaming || !props.isLastMessage);
		// Collapse only when there's final text after tools
		const shouldCollapse = hasFinalText;
		const collapseBeforeIndex = hasFinalText ? finalTextIndex : -1;
		// Calculate visible steps count for collapsible header
		const stepPartsLocal = shouldCollapse && collapseBeforeIndex !== -1 ? messageParts.slice(0, collapseBeforeIndex) : [];
		const nestedIds = nestedToolIds();
		const orphanIds = orphanToolCallIds();
		const orphanFirstIds = orphanFirstToolCallIds();
		const visibleStepsCount = stepPartsLocal.filter((p: any) => {
			if (p.type === "step-start") return false;
			if (p.type === "tool-TaskOutput") return false;
			if (p.type === "tool-ExitPlanMode") return false;
			if (p.toolCallId && nestedIds.has(p.toolCallId)) return false;
			if (p.toolCallId && orphanIds.has(p.toolCallId) && !orphanFirstIds.has(p.toolCallId)) return false;
			if (p.type === "text" && !p.text?.trim()) return false;
			return true;
		}).length;
		return {
			shouldCollapse,
			visibleStepsCount,
			collapseBeforeIndex
		};
	});
	// Derived accessors for collapse data
	const shouldCollapse = createMemo(() => collapseDataMemo().shouldCollapse);
	const visibleStepsCount = createMemo(() => collapseDataMemo().visibleStepsCount);
	const collapseBeforeIndex = createMemo(() => collapseDataMemo().collapseBeforeIndex);
	// Check if any plan operation is in collapsed steps (before collapseBeforeIndex)
	const hasPlanInCollapsedSteps = createMemo(() => {
		if (!shouldCollapse() || collapseBeforeIndex() === -1) return false;
		return planOpsSummary().operations.some((op: { index: number }) => op.index < collapseBeforeIndex());
	});
	// Get the last plan operation from collapsed steps for showing card
	const lastCollapsedPlanOp = createMemo(() => {
		if (!hasPlanInCollapsedSteps()) return null;
		const collapsedOps = planOpsSummary().operations.filter((op: { index: number }) => op.index < collapseBeforeIndex());
		return collapsedOps[collapsedOps.length - 1] || null;
	});
	const stepParts = createMemo(() => {
		if (!shouldCollapse() || collapseBeforeIndex() === -1) return [];
		return messageParts.slice(0, collapseBeforeIndex());
	});
	const finalParts = createMemo(() => {
		if (!shouldCollapse() || collapseBeforeIndex() === -1) return messageParts;
		return messageParts.slice(collapseBeforeIndex());
	});
	const hasTextContent = createMemo(() => messageParts.some((p: any) => p.type === "text" && p.text?.trim()));
	const msgMetadata = props.message?.metadata as AgentMessageMetadata;
	const renderPart = (part: any, idx: number, isFinal = false) => {
		if (part.type === "step-start") return null;
		if (part.type === "tool-TaskOutput") return null;
		if (part.toolCallId && orphanToolCallIds().has(part.toolCallId)) {
			if (!orphanFirstToolCallIds().has(part.toolCallId)) return null;
			const parentId = part.toolCallId.split(":")[0];
			const group = orphanTaskGroups().get(parentId);
			if (group) {
				return <AgentTaskTool part={{
					type: "tool-Task",
					toolCallId: parentId,
					input: {
						subagent_type: "unknown-agent",
						description: "Incomplete task"
					}
				}} nestedTools={group.parts} chatStatus={props.status} />;
			}
		}
		if (part.toolCallId && nestedToolIds().has(part.toolCallId)) return null;
		if (part.type === "exploring-group") return null;
		if (part.type === "text") {
			if (!part.text?.trim()) return null;
			const isFinalText = isFinal && idx === collapseBeforeIndex();
			const isTextStreaming = props.isLastMessage && props.isStreaming;
			return <MemoizedTextPart text={part.text} messageId={props.message.id} partIndex={idx} isFinalText={isFinalText} visibleStepsCount={visibleStepsCount()} isStreaming={isTextStreaming} />;
		}
		if (part.type === "tool-Task") {
			const nestedTools = nestedToolsMap().get(part.toolCallId) || [];
			return <AgentTaskTool part={part} nestedTools={nestedTools} chatStatus={props.status} />;
		}
		if (part.type === "tool-Bash") return <AgentBashTool part={part} messageId={props.message.id} partIndex={idx} chatStatus={props.status} />;
		if (part.type === "tool-Thinking") return <AgentThinkingTool part={part} chatStatus={props.status} />;
		// Plan files: unified handling
		// - In collapsed steps: all show mini indicator, last collapsed op's card shown separately after finalParts
		// - In final parts: all but last show mini indicator, last shows full card
		if (part.type === "tool-Write" || part.type === "tool-Edit") {
			const filePath = part.input?.file_path || "";
			if (isPlanFile(filePath)) {
				// Use part.toolCallId to find operation since idx may be adjusted for collapsed parts
				const ops = planOpsSummary().operations;
				const opIndex = ops.findIndex((op: { part: { toolCallId: string } }) => op.part.toolCallId === part.toolCallId);
				if (opIndex === -1) return null;
				const originalIndex = ops[opIndex]?.index ?? -1;
				const isInCollapsedSteps = shouldCollapse() && collapseBeforeIndex() !== -1 && originalIndex < collapseBeforeIndex();
				const lastCollapsed = lastCollapsedPlanOp();
				const isLastCollapsedOp = lastCollapsed?.part.toolCallId === part.toolCallId;
				const isLastOperation = opIndex === ops.length - 1;
				// If this is the last collapsed plan op, hide it here (card shown after CollapsibleSteps)
				if (isInCollapsedSteps && isLastCollapsedOp) {
					return null;
				}
				// Show mini indicator for:
				// - All operations in collapsed steps (except last collapsed, handled above)
				// - All operations except last in final parts
				const showMiniIndicator = isInCollapsedSteps || !isLastOperation;
				if (showMiniIndicator) {
					const isWrite = part.type === "tool-Write";
					const { isPending } = getToolStatus(part, props.status);
					const isOpStreaming = isPending || part.state === "input-streaming" && props.isStreaming && props.isLastMessage;
					return <div class="flex items-center gap-1.5 px-2 py-0.5">
              <span class="text-xs text-muted-foreground">
                {isOpStreaming ? <TextShimmer as="span" duration={1.2}>
                    {isWrite ? "Creating plan..." : "Updating plan..."}
                  </TextShimmer> : isWrite ? "Created plan" : "Updated plan"}
              </span>
            </div>;
				}
				// Last operation in final parts: show full card
				return <AgentPlanFileTool part={part} chatStatus={props.status} subChatId={props.subChatId} isEdit={part.type === "tool-Edit"} />;
			}
		}
		if (part.type === "tool-Edit") return <AgentEditTool part={part} messageId={props.message.id} partIndex={idx} chatStatus={props.status} />;
		if (part.type === "tool-Write") return <AgentEditTool part={part} messageId={props.message.id} partIndex={idx} chatStatus={props.status} />;
		if (part.type === "tool-WebSearch") return <AgentWebSearchCollapsible part={part} chatStatus={props.status} />;
		if (part.type === "tool-WebFetch") return <AgentWebFetchTool part={part} chatStatus={props.status} />;
		if (part.type === "tool-PlanWrite") return <AgentPlanTool part={part} chatStatus={props.status} />;
		// ExitPlanMode tool is hidden - plan is shown in sidebar instead
		if (part.type === "tool-ExitPlanMode") {
			return null;
		}
		if (part.type === "tool-TodoWrite") {
			return <AgentTodoTool part={part} chatStatus={props.status} subChatId={props.subChatId} />;
		}
		if (part.type === "tool-AskUserQuestion") {
			const { isPending, isError } = getToolStatus(part, props.status);
			return <AgentAskUserQuestionTool input={part.input} result={part.result} errorText={(part as any).errorText || (part as any).error} state={isPending ? "call" : "result"} isError={isError} isStreaming={props.isStreaming && props.isLastMessage} toolCallId={part.toolCallId} />;
		}
		if (part.type in AgentToolRegistry) {
			const meta = AgentToolRegistry[part.type];
			const { isPending, isError } = getToolStatus(part, props.status);
			return <AgentToolCall icon={meta.icon} title={meta.title(part)} subtitle={meta.subtitle?.(part)} isPending={isPending} isError={isError} />;
		}
		if (part.type?.startsWith("tool-")) {
			return <div class="text-xs text-muted-foreground py-0.5 px-2">
          {part.type.replace("tool-", "")}
        </div>;
		}
		return null;
	};
	return (
		<Show when={props.message} fallback={null}>
			<div data-assistant-message-id={props.message!.id} class="group/message w-full mb-4">
      <div class="flex flex-col gap-1.5">
        <Show when={shouldCollapse() && visibleStepsCount() > 0}>
          <CollapsibleSteps stepsCount={visibleStepsCount()}>
            {(() => {
		const grouped = groupExploringTools(stepParts(), nestedToolIds());
		return grouped.map((part: any, idx: number) => {
			if (part.type === "exploring-group") {
				const isLast = idx === grouped.length - 1;
				const isGroupStreaming = props.isStreaming && props.isLastMessage && isLast;
				return <AgentExploringGroup parts={part.parts} chatStatus={props.status} isStreaming={isGroupStreaming} />;
			}
			return renderPart(part, idx, false);
		});
	})()}
          </CollapsibleSteps>
        </Show>

        {(() => {
		const grouped = groupExploringTools(finalParts(), nestedToolIds());
		return grouped.map((part: any, idx: number) => {
			if (part.type === "exploring-group") {
				const isLast = idx === grouped.length - 1;
				const isGroupStreaming = props.isStreaming && props.isLastMessage && isLast;
				return <AgentExploringGroup parts={part.parts} chatStatus={props.status} isStreaming={isGroupStreaming} />;
			}
			return renderPart(part, shouldCollapse() ? collapseBeforeIndex() + idx : idx, shouldCollapse());
		});
	})()}

        {	/* Show plan card after finalParts if any plan operation was in collapsed steps */}
        <Show when={shouldCollapse() && lastCollapsedPlanOp()}>
          <AgentPlanFileTool part={lastCollapsedPlanOp()!.part} chatStatus={props.status} subChatId={props.subChatId} isEdit={lastCollapsedPlanOp()!.type === "edit"} />
        </Show>

        <Show when={shouldShowPlanning()}>
          <AgentToolCall icon={AgentToolRegistry["tool-planning"].icon} title={AgentToolRegistry["tool-planning"].title({})} isPending={true} isError={false} />
        </Show>

      </div>

      <Show when={hasTextContent() && (!props.isStreaming || !props.isLastMessage)}>
          <div class="flex justify-between items-center h-6 px-2 mt-1">
            <div class="flex items-center gap-0.5">
              <CopyButton text={getMessageTextContent(props.message)} isMobile={props.isMobile} />
              <PlayButton text={getMessageTextContent(props.message)} isMobile={props.isMobile} />
              <Show when={onRollback() && (props.message.metadata as any)?.sdkMessageUuid}>
                <button onClick={() => onRollback()!(props.message)} disabled={props.isStreaming || isRollingBack()} tabIndex={-1} class={cn("p-1.5 rounded-md transition-[background-color,transform] duration-150 ease-out hover:bg-accent active:scale-[0.97]", (props.isStreaming || isRollingBack()) && "opacity-50 cursor-not-allowed")}>
                  <IconTextUndo class="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </Show>
            </div>
            <AgentMessageUsage metadata={msgMetadata} isStreaming={props.isStreaming} isMobile={props.isMobile} />
          </div>
        </Show>
    </div>
		</Show>
	);
}
