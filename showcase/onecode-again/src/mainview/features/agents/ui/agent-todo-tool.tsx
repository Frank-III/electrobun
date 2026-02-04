import { createSignal, createMemo, createEffect, untrack, Show } from "solid-js";
import { TextShimmer } from "../../../components/ui/text-shimmer";
import { IconSpinner, ExpandIcon, CollapseIcon, CheckIcon, PlanIcon, IconDoubleChevronRight, IconArrowRight } from "../../../components/ui/icons";
import { getToolStatus } from "./agent-tool-registry";
import { cn } from "../../../lib/utils";
import { Circle } from "lucide-solid";
import { AgentToolCall } from "./agent-tool-call";
import { currentTodosAtomFamily } from "../atoms";
import { alwaysExpandTodoListAtom } from "../../../lib/atoms";
export interface TodoItem {
	content: string;
	status: "pending" | "in_progress" | "completed";
	activeForm?: string;
}
interface AgentTodoToolProps {
	part: {
		type: string;
		toolCallId: string;
		state?: string;
		input?: {
			todos?: TodoItem[];
		};
		output?: {
			oldTodos?: TodoItem[];
			newTodos?: TodoItem[];
		};
	};
	chatStatus?: string;
	subChatId?: string;
}
interface TodoChange {
	todo: TodoItem;
	oldStatus?: TodoItem["status"];
	newStatus: TodoItem["status"];
	index: number;
}
type ChangeType = "creation" | "single" | "multiple";
interface DetectedChanges {
	type: ChangeType;
	items: TodoChange[];
}
// Detect what changed between old and new todos
function detectChanges(oldTodos: TodoItem[], newTodos: TodoItem[]): DetectedChanges {
	// If no old todos, this is a creation - show full list ONCE
	if (!oldTodos || oldTodos.length === 0) {
		return {
			type: "creation",
			items: newTodos.map((todo, index) => ({
				todo,
				newStatus: todo.status,
				index
			}))
		};
	}
	// Find what changed
	const changes: TodoChange[] = [];
	newTodos.forEach((newTodo, index) => {
		const oldTodo = oldTodos[index];
		if (!oldTodo || oldTodo.status !== newTodo.status) {
			changes.push({
				todo: newTodo,
				oldStatus: oldTodo?.status,
				newStatus: newTodo.status,
				index
			});
		}
	});
	// Single change - show compact mode
	if (changes.length === 1) {
		return {
			type: "single",
			items: changes
		};
	}
	// Multiple changes - also show compact mode (not full list)
	// User can always expand the creation tool to see full plan
	return {
		type: "multiple",
		items: changes
	};
}
// Get status verb for compact display
function getStatusVerb(status: TodoItem["status"], content: string): string {
	switch (status) {
		case "in_progress": return `Started: ${content}`;
		case "completed": return `Finished: ${content}`;
		case "pending": return `Created: ${content}`;
		default: return content;
	}
}
// Get icon component for status
function getStatusIconComponent(status: TodoItem["status"]) {
	switch (status) {
		case "completed": return CheckIcon;
		case "in_progress": return IconSpinner;
		default: return Circle;
	}
}
// Pie-style progress circle - fills sectors like pizza slices
const ProgressCircle = (props: {
	completed: number;
	total: number;
	size?: number;
	class?: string;
}) => {
	const size = props.size ?? 16;
	const cx = size / 2;
	const cy = size / 2;
	const outerRadius = (size - 1) / 2;
	const innerRadius = outerRadius - 1.5;
	// Create pie segments (no borders on segments, just fill)
	const segments = [];
	for (let i = 0; i < props.total; i++) {
		const startAngle = i / props.total * 360 - 90;
		const endAngle = (i + 1) / props.total * 360 - 90;
		const gap = props.total > 1 ? 4 : 0;
		const adjustedStartAngle = startAngle + gap / 2;
		const adjustedEndAngle = endAngle - gap / 2;
		// Convert to radians
		const startRad = adjustedStartAngle * Math.PI / 180;
		const endRad = adjustedEndAngle * Math.PI / 180;
		// Calculate arc points
		const x1 = cx + innerRadius * Math.cos(startRad);
		const y1 = cy + innerRadius * Math.sin(startRad);
		const x2 = cx + innerRadius * Math.cos(endRad);
		const y2 = cy + innerRadius * Math.sin(endRad);
		const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
		const pathData = `M ${cx} ${cy} L ${x1} ${y1} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
		segments.push(<path d={pathData} fill={i < props.completed ? "currentColor" : "transparent"} opacity={i < props.completed ? .7 : .15} />);
	}
	return <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} class={cn("text-muted-foreground", props.class)}>
      {	/* Outer border circle */}
      <circle cx={cx} cy={cy} r={outerRadius} fill="none" stroke="currentColor" stroke-width={.5} opacity={.3} />
      {segments}
    </svg>;
 };
const TodoStatusIcon = (props: {
	status: TodoItem["status"];
	isPending?: boolean;
}) => {
	// During loading, show arrow for in_progress items with foreground background
	if (props.isPending && props.status === "in_progress") {
		return <div class="w-3.5 h-3.5 rounded-full bg-foreground flex items-center justify-center flex-shrink-0">
        <IconArrowRight class="w-2 h-2 text-background" />
      </div>;
	}
	switch (props.status) {
		case "completed": return <div class="w-3.5 h-3.5 rounded-full bg-muted flex items-center justify-center flex-shrink-0" style={{ border: "0.5px solid hsl(var(--border))" }}>
          <CheckIcon class="w-2 h-2 text-muted-foreground" />
        </div>;
		case "in_progress": return <div class="w-3.5 h-3.5 rounded-full bg-foreground flex items-center justify-center flex-shrink-0">
          <IconArrowRight class="w-2 h-2 text-background" />
        </div>;
		default: return <div class="w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0" style={{ border: "0.5px solid hsl(var(--muted-foreground) / 0.3)" }} />;
	}
};
// Memoized status icon map to avoid recreating on each render
// For compact change items (multiple updates view)
const STATUS_ICONS = {
	completed: CheckIcon,
	in_progress: IconDoubleChevronRight,
	pending: Circle
} as const;
// For AgentToolCall icon (single update view) - use IconSpinner for in_progress
const TOOL_CALL_ICONS = {
	completed: CheckIcon,
	in_progress: IconSpinner,
	pending: Circle
} as const;
function TodoChangeItem(props: {
	change: TodoChange;
	showSeparator: boolean;
}) {
	const StatusIcon = STATUS_ICONS[props.change.newStatus] || STATUS_ICONS.pending;
	return <div class="flex items-center gap-1 flex-shrink-0">
      <StatusIcon class="w-3 h-3" />
		<span class="truncate">{props.change.todo.content}</span>
		<Show when={props.showSeparator}><span class="mx-0.5">,</span></Show>
    </div>;
}
function TodoListItem(props: {
	todo: TodoItem;
	isPending: boolean;
	isLast: boolean;
}) {
	return <div class={cn("flex items-center gap-2 px-2.5 py-1.5", !props.isLast && "border-b border-border/30")}>
		<TodoStatusIcon status={props.todo.status} isPending={props.isPending} />
		<span class={cn("text-xs truncate", props.isPending ? "text-muted-foreground" : props.todo.status === "completed" ? "line-through text-muted-foreground" : props.todo.status === "pending" ? "text-muted-foreground" : "text-foreground")}>
			{props.todo.content}
      </span>
    </div>;
}
export function AgentTodoTool(props: AgentTodoToolProps) {
	// User preference for always expanded to-do list
	const alwaysExpandTodoList = alwaysExpandTodoListAtom[0];
	// Synced todos state - scoped per subChatId to prevent cross-chat conflicts
	// Uses a stable key to ensure proper isolation between different sub-chats
	const todosAtom = createMemo(() => currentTodosAtomFamily(props.subChatId || "default"));
	type TodoState = ReturnType<typeof currentTodosAtomFamily> extends readonly [() => infer T, (value: any) => void] ? T : never;
	const todoState = createMemo(() => todosAtom()[0]());
	const setTodoState = (value: TodoState | ((prev: TodoState) => TodoState)) => {
		todosAtom()[1](value);
	};
	const syncedTodos = createMemo(() => todoState().todos);
	const creationToolCallId = createMemo(() => todoState().creationToolCallId);
	// Note: Using untrack() in the effect below to avoid circular dependency
	// Get todos from input or output.newTodos
	const rawOldTodos = props.part.output?.oldTodos || [];
	const newTodos = props.part.input?.todos || props.part.output?.newTodos || [];
	// Check if we're still streaming input (data not yet complete)
	const isStreaming = props.part.state === "input-streaming";
	// Determine if this is the creation tool call
	// A tool call is the "creation" if:
	// 1. It's the first tool call (creationToolCallId is null) OR
	// 2. It matches the stored creationToolCallId
	// 3. NEW: This is a new generation - detected when:
	//    - output.oldTodos explicitly exists and is empty (server confirmed this is a new list)
	//    - we have newTodos (creation always has new todos)
	//    - there are existing syncedTodos from previous generation
	//    - this is a different tool call than the stored creation one
	// IMPORTANT: Check if output.oldTodos is explicitly an empty array, not just missing
	// If output doesn't exist yet or oldTodos is undefined, we can't determine if it's new generation
	const hasOutputWithEmptyOldTodos = props.part.output !== undefined && "oldTodos" in props.part.output && Array.isArray(props.part.output.oldTodos) && props.part.output.oldTodos.length === 0;
	const isNewGeneration = hasOutputWithEmptyOldTodos && newTodos.length > 0 && syncedTodos().length > 0 && creationToolCallId() !== null && creationToolCallId() !== props.part.toolCallId;
	const isCreationToolCall = creationToolCallId() === null || creationToolCallId() === props.part.toolCallId || isNewGeneration;
	// Use syncedTodos as fallback for oldTodos when output hasn't arrived yet
	// This prevents flickering: without this, when a new tool call arrives with
	// input.todos but no output.oldTodos yet, detectChanges would see empty oldTodos
	// and incorrectly treat it as "creation", showing the full list momentarily
	// before output arrives and it switches to compact "single"/"multiple" mode
	const oldTodos = createMemo(() => {
		// If we have oldTodos from output, use them
		if (rawOldTodos.length > 0) {
			return rawOldTodos;
		}
		// Only use syncedTodos if this is NOT the creation tool call
		// This prevents the bug where the creation tool call would see its own todos as "old"
		if (syncedTodos().length > 0 && !isCreationToolCall) {
			return syncedTodos();
		}
		// Otherwise this is truly a creation (first tool call, or same tool call that set syncedTodos)
		return [];
	});
	// Detect what changed - memoize to avoid recalculation
	const changes = createMemo(() => detectChanges(oldTodos(), newTodos));
	// State for expanded/collapsed - initialize based on user preference
	const [isExpanded, setIsExpanded] = createSignal(alwaysExpandTodoList());
	const { isPending } = getToolStatus(props.part, props.chatStatus);
	// Sync isExpanded with alwaysExpandTodoList preference when it changes
	// Only auto-expand, don't auto-collapse (respect user's manual collapse)
	createEffect(() => {
		if (alwaysExpandTodoList() && !isExpanded()) {
			setIsExpanded(true);
		}
	});
	// Memoized click handlers to prevent inline function re-creation
	const handleToggleExpand = () => {
		setIsExpanded((prev) => !prev);
	};
	const handleExpand = () => {
		setIsExpanded(true);
	};
	const handleCollapse = () => {
		setIsExpanded(false);
	};
	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			setIsExpanded((prev) => !prev);
		}
	};
	// Update synced todos whenever newTodos change
	// This keeps the creation tool in sync with all updates
	createEffect(() => {
		if (newTodos.length > 0) {
			// Use untrack to get current values without adding them to dependencies
			// This prevents infinite loops: effect updates atom -> state changes -> effect runs again
			const currentSyncedTodos = untrack(() => syncedTodos());
			const currentCreationToolCallId = untrack(() => creationToolCallId());
			// Compute these inside the effect to avoid dependency issues
			// These values depend on syncedTodos/creationToolCallId which change when we call setTodoState
			const hasOutputWithEmptyOldTodos = props.part.output !== undefined && "oldTodos" in props.part.output && Array.isArray(props.part.output.oldTodos) && props.part.output.oldTodos.length === 0;
			const isNewGenerationLocal = hasOutputWithEmptyOldTodos && newTodos.length > 0 && currentSyncedTodos.length > 0 && currentCreationToolCallId !== null && currentCreationToolCallId !== props.part.toolCallId;
			const isCreationToolCallLocal = currentCreationToolCallId === null || currentCreationToolCallId === props.part.toolCallId || isNewGenerationLocal;
			// Only update if:
			// 1. This is the creation tool call (always update), OR
			// 2. newTodos has at least as many items as syncedTodos (prevents partial streaming overwrites)
			// During streaming, JSON parsing may return partial arrays, causing temporary drops in length
			const shouldUpdate = isCreationToolCallLocal || newTodos.length >= currentSyncedTodos.length;
			// If this is a new generation, reset the creationToolCallId to this tool call
			const newCreationId = isNewGenerationLocal ? props.part.toolCallId : currentCreationToolCallId === null ? props.part.toolCallId : currentCreationToolCallId;
			if (shouldUpdate) {
				// Prevent infinite loop: check if todos actually changed before updating
				// Compare by serializing to JSON - if content is the same, skip update
				const newTodosJson = JSON.stringify(newTodos);
				const syncedTodosJson = JSON.stringify(currentSyncedTodos);
				if (newTodosJson !== syncedTodosJson || currentCreationToolCallId !== newCreationId) {
					setTodoState({
						todos: newTodos,
						creationToolCallId: newCreationId
					});
				}
			}
		}
	});
	// For UPDATE tool calls while streaming, show "Updating..." placeholder
	// This check MUST come BEFORE the newTodos.length === 0 check
	// Otherwise we return null when newTodos is empty during streaming updates
	if (!isCreationToolCall && isStreaming) {
		return <div class="flex items-start gap-1.5 py-0.5 rounded-md px-2">
        <div class="flex-1 min-w-0 flex items-center gap-1.5">
          <div class="text-xs text-muted-foreground flex items-center gap-1.5 min-w-0">
            <span class="font-medium whitespace-nowrap flex-shrink-0">
              <TextShimmer as="span" duration={1.2} class="inline-flex items-center text-xs leading-none h-4 m-0">
                Updating to-dos...
              </TextShimmer>
            </span>
          </div>
        </div>
      </div>;
	}
	// Early streaming state - show placeholder for CREATION only
	if (newTodos.length === 0 || isStreaming && !props.part.input?.todos) {
		// For update tool calls (not creation), return null to avoid showing placeholder
		// Note: This branch is only reached when !isStreaming (update streaming handled above)
		if (!isCreationToolCall) {
			return null;
		}
		// For creation tool calls, show the placeholder - also sticky with top offset
		// z-[5] ensures todo stays below user message (z-10) when both are sticky
		return <div class="mx-2 sticky z-[5] bg-background" style={{ top: "calc(var(--user-message-height, 28px) - 29px)" }}>
        <div class="rounded-lg border border-border bg-muted/30 px-2.5 py-1.5">
          <div class="flex items-center gap-1.5">
            <PlanIcon class="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            <span class="text-xs font-medium whitespace-nowrap flex-shrink-0">
		  <Show when={isPending} fallback="Creating to-do list...">
                <TextShimmer as="span" duration={1.2} class="inline-flex items-center text-xs leading-none h-4 m-0">
                  Creating to-do list...
                </TextShimmer>
              </Show>
            </span>
          </div>
        </div>
      </div>;
	}
	// COMPACT MODE: Single update - render as simple tool call
	// Skip compact mode if user prefers always expanded and this is the creation tool call
	if (changes().type === "single" && !(alwaysExpandTodoList() && isCreationToolCall)) {
		const change = changes().items[0];
		// Use stable icon reference from TOOL_CALL_ICONS map
		const IconComponent = TOOL_CALL_ICONS[change.newStatus] || TOOL_CALL_ICONS.pending;
		// For in_progress status with activeForm, use activeForm as the title text
		// to avoid duplication (content + activeForm both shown)
		const titleText = change.newStatus === "in_progress" && change.todo.activeForm ? change.todo.activeForm : change.todo.content;
		return <AgentToolCall icon={IconComponent} title={getStatusVerb(change.newStatus, titleText)} isPending={isPending} isError={false} />;
	}
	// COMPACT MODE: Multiple updates - render as custom component with icons
	// Skip compact mode if user prefers always expanded and this is the creation tool call
	if (changes().type === "multiple" && !(alwaysExpandTodoList() && isCreationToolCall)) {
		const completedChanges = changes().items.filter((c) => c.newStatus === "completed").length;
		const startedChanges = changes().items.filter((c) => c.newStatus === "in_progress").length;
		// Build summary title
		let summaryTitle = "Updated to-dos";
		if (completedChanges > 0 && startedChanges === 0) {
			summaryTitle = `Finished ${completedChanges} ${completedChanges === 1 ? "task" : "tasks"}`;
		} else if (startedChanges > 0 && completedChanges === 0) {
			summaryTitle = `Started ${startedChanges} ${startedChanges === 1 ? "task" : "tasks"}`;
		} else if (completedChanges > 0 && startedChanges > 0) {
			summaryTitle = `Updated ${changes().items.length} ${changes().items.length === 1 ? "task" : "tasks"}`;
		}
		// Limit displayed items to avoid overflow
		const MAX_VISIBLE_ITEMS = 3;
		const visibleItems = changes().items.slice(0, MAX_VISIBLE_ITEMS);
		const remainingCount = changes().items.length - MAX_VISIBLE_ITEMS;
		return <div class="flex items-start gap-1.5 py-0.5 rounded-md px-2">
        <div class="flex-1 min-w-0 flex items-center gap-1.5">
          <div class="text-xs text-muted-foreground flex items-center gap-1.5 min-w-0">
            <span class="font-medium whitespace-nowrap flex-shrink-0">
			  <Show when={isPending} fallback={summaryTitle}>
                <TextShimmer as="span" duration={1.2} class="inline-flex items-center text-xs leading-none h-4 m-0">
                  {summaryTitle}
                </TextShimmer>
              </Show>
            </span>
            <div class="flex items-center gap-1 text-muted-foreground/60 font-normal truncate min-w-0">
				  {visibleItems.map((c, idx) => <TodoChangeItem change={c} showSeparator={idx < visibleItems.length - 1} />)}
              <Show when={remainingCount > 0}><span class="text-muted-foreground/60 whitespace-nowrap flex-shrink-0">
                  +{remainingCount} more
                </span></Show>
            </div>
          </div>
        </div>
      </div>;
	}
	// FULL MODE: Creation - render as expandable list
	// Use syncedTodos to show the current state (synced with all updates)
	const displayTodos = syncedTodos().length > 0 ? syncedTodos() : newTodos;
	const completedCount = displayTodos.filter((t) => t.status === "completed").length;
	const inProgressCount = displayTodos.filter((t) => t.status === "in_progress").length;
	const totalTodos = displayTodos.length;
	// For visual progress, count completed + in_progress tasks
	// This way when a task starts, the segment fills immediately
	const visualProgress = completedCount + inProgressCount;
	// Find current task (first in_progress, or first pending if none in progress)
	const currentTask = displayTodos.find((t) => t.status === "in_progress") || displayTodos.find((t) => t.status === "pending");
	// Find current task index for progress display
	const currentTaskIndex = currentTask ? displayTodos.findIndex((t) => t === currentTask) + 1 : completedCount;
	return <div class={cn(
		"mx-2",
		// Make entire creation todo sticky
		// z-[5] ensures todo stays below user message (z-10) when both are sticky
		isCreationToolCall && "sticky z-[5] bg-background"
	)} style={isCreationToolCall ? { top: "calc(var(--user-message-height, 28px) - 29px)" } : undefined}>
      {	/* TOP BLOCK - Plan title with expand/collapse button */}
      <div class="rounded-t-lg border border-b-0 border-border bg-muted/30 px-2.5 py-1.5 cursor-pointer hover:bg-muted/40 transition-colors duration-150" onClick={handleToggleExpand} role="button" aria-expanded={isExpanded()} aria-label={`To-do list with ${totalTodos} items. Click to ${isExpanded() ? "collapse" : "expand"}`} tabIndex={0} onKeyDown={handleKeyDown}>
        <div class="flex items-center gap-1.5">
          <PlanIcon class="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          <span class="text-xs font-medium text-foreground">
            To-dos
          </span>
          <span class="text-xs text-muted-foreground truncate flex-1">
            {displayTodos[0]?.content || "To-do list"}
          </span>
          { /* Expand/Collapse icon */}
          <div class="relative w-4 h-4 flex-shrink-0">
            <ExpandIcon class={cn("absolute inset-0 w-4 h-4 text-muted-foreground transition-[opacity,transform] duration-200 ease-out", isExpanded() ? "opacity-0 scale-75" : "opacity-100 scale-100")} />
            <CollapseIcon class={cn("absolute inset-0 w-4 h-4 text-muted-foreground transition-[opacity,transform] duration-200 ease-out", isExpanded() ? "opacity-100 scale-100" : "opacity-0 scale-75")} />
          </div>
        </div>
      </div>

      { /* BOTTOM BLOCK - Current task + progress (expandable) */}
      <div class="rounded-b-lg border border-border bg-muted/20 shadow-xl shadow-background">
        { /* Collapsed view - progress circle + current task + count */}
		<Show when={!isExpanded()}><div class="flex items-center gap-2.5 px-2.5 py-1.5 cursor-pointer hover:bg-muted/30 transition-colors duration-150" onClick={handleExpand}>
            {/* Progress circle or checkmark when all completed */}
            <Show when={completedCount === totalTodos && totalTodos > 0} fallback={
              <ProgressCircle completed={visualProgress} total={totalTodos} size={16} class="flex-shrink-0" />
            }>
              <div class="w-4 h-4 rounded-full bg-muted flex items-center justify-center flex-shrink-0" style={{ border: "0.5px solid hsl(var(--border))" }}>
                <CheckIcon class="w-2.5 h-2.5 text-muted-foreground" />
              </div>
            </Show>

            { /* Current task name */}
            <div class="flex items-center gap-1.5 min-w-0 flex-1">
              <Show when={currentTask}>{(task) => <span class="text-xs text-muted-foreground truncate">
                  {task().status === "in_progress" ? task().activeForm || task().content : task().content}
                </span>}</Show>
              <Show when={!currentTask && completedCount === totalTodos && totalTodos > 0}><span class="text-xs text-muted-foreground truncate">
                  {displayTodos[totalTodos - 1]?.content}
                </span></Show>
            </div>

            { /* Right side - task count */}
            <span class="text-xs text-muted-foreground tabular-nums flex-shrink-0">
              {currentTaskIndex}/{totalTodos}
            </span>
          </div></Show>

        { /* Expanded content - full todo list */}
		<Show when={isExpanded()}><div class="max-h-[300px] overflow-y-auto cursor-pointer" onClick={handleCollapse}>
			{displayTodos.map((todo, idx) => <TodoListItem todo={todo} isPending={isPending} isLast={idx === displayTodos.length - 1} />)}
		</div></Show>
      </div>
    </div>;
}
