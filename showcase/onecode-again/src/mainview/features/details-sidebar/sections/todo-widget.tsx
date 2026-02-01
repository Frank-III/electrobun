import { createMemo, createSignal, For, Show } from "solid-js";
import { cn } from "@/lib/utils";
import { PlanIcon, CheckIcon, IconArrowRight, ExpandIcon, CollapseIcon } from "@/components/ui/icons";
import { currentTodosAtomFamily } from "@/features/agents/atoms";
interface TodoItem {
	content: string;
	status: "pending" | "in_progress" | "completed";
	activeForm?: string;
}
interface TodoWidgetProps {
	/** Active sub-chat ID to get todos from */
	subChatId: string | null;
}
// Pie-style progress circle - fills sectors like pizza slices
const ProgressCircle = ({ completed, total, size = 16, class: cls }: {
	completed: number;
	total: number;
	size?: number;
	class?: string;
}) => {
	const cx = size / 2;
	const cy = size / 2;
	const outerRadius = (size - 1) / 2;
	const innerRadius = outerRadius - 1.5;
	// Create pie segments (no borders on segments, just fill)
	const segments = [];
	for (let i = 0; i < total; i++) {
		const startAngle = i / total * 360 - 90;
		const endAngle = (i + 1) / total * 360 - 90;
		const gap = total > 1 ? 4 : 0;
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
		segments.push(<path key={i} d={pathData} fill={i < completed ? "currentColor" : "transparent"} opacity={i < completed ? .7 : .15} />);
	}
	return <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} class={cn("text-muted-foreground",cls)}>
      {	/* Outer border circle */}
      <circle cx={cx} cy={cy} r={outerRadius} fill="none" stroke="currentColor" stroke-width={.5} opacity={.3} />
      {segments}
    </svg>;
 };
const TodoStatusIcon = ({ status }: {
	status: TodoItem["status"];
}) => {
	switch (status) {
		case "completed": return <div class="w-3.5 h-3.5 rounded-full bg-muted flex items-center justify-center flex-shrink-0" style={{ border: "0.5px solid hsl(var(--border))" }}>
          <CheckIcon class="w-2 h-2 text-muted-foreground" />
        </div>;
		case "in_progress": return <div class="w-3.5 h-3.5 rounded-full bg-foreground flex items-center justify-center flex-shrink-0">
          <IconArrowRight class="w-2 h-2 text-background" />
        </div>;
		default: return <div class="w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0" style={{ border: "0.5px solid hsl(var(--muted-foreground) / 0.3)" }} />;
	}
};
const TodoListItem = ({ todo, isLast }: {
	todo: TodoItem;
	isLast: boolean;
}) => {
	return <div class={cn("flex items-center gap-2 px-2 py-1.5", !isLast && "border-b border-border/30")}>
      <TodoStatusIcon status={todo.status} />
      <span class={cn("text-xs truncate", todo.status === "completed" ? "line-through text-muted-foreground" : todo.status === "pending" ? "text-muted-foreground" : "text-foreground")}>
        <Show when={todo.status === "in_progress" && todo.activeForm} fallback={todo.content}>
          {todo.activeForm}
        </Show>
      </span>
    </div>;
};
/**
* To-do list Widget for Overview Sidebar
* Shows active todos from selected sub-chat
* Matches the visual style of AgentTodoTool exactly
* Memoized to prevent re-renders when parent updates
*/
export function TodoWidget(props: TodoWidgetProps) {
	// Get todos from the active sub-chat
	const todosAtom = createMemo(() => currentTodosAtomFamily(props.subChatId || "default"));
	const todoState = createMemo(() => {
		const [state] = todosAtom();
		return state();
	});
	const todos = () => todoState().todos;
	// Expanded/collapsed state
	const [isExpanded, setIsExpanded] = createSignal(true);
	const handleToggleExpand = () => {
		setIsExpanded((prev) => !prev);
	};
	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			setIsExpanded((prev) => !prev);
		}
	};
	// Calculate stats
	const completedCount = () => todos().filter((t) => t.status === "completed").length;
	const inProgressCount = () => todos().filter((t) => t.status === "in_progress").length;
	const totalTodos = () => todos().length;
	// For visual progress, count completed + in_progress tasks
	const visualProgress = () => completedCount() + inProgressCount();
	// Find current task (first in_progress, or first pending if none in progress)
	const currentTask = () => todos().find((t) => t.status === "in_progress") || todos().find((t) => t.status === "pending");
	// Find current task index for progress display
	const currentTaskIndex = () => currentTask() ? todos().findIndex((t) => t === currentTask()) + 1 : completedCount();
	// Don't render if no todos
	if (todos().length === 0) {
		return null;
	}
	return <div class="mx-2 mb-2">
      {	/* TOP BLOCK - Header with expand/collapse button - fixed height h-8 for consistency */}
      <div class="rounded-t-lg border border-b-0 border-border/50 bg-muted/30 px-2 h-8 cursor-pointer hover:bg-muted/50 transition-colors duration-150 flex items-center" onClick={handleToggleExpand} role="button" aria-expanded={isExpanded()} aria-label={`To-do list with ${totalTodos()} items. Click to ${isExpanded() ? "collapse" : "expand"}`} tabIndex={0} onKeyDown={handleKeyDown}>
        <div class="flex items-center gap-2 flex-1 min-w-0">
          <PlanIcon class="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
          <span class="text-xs font-medium text-foreground">To-dos</span>
          <span class="text-xs text-muted-foreground truncate flex-1">
            {todos()[0]?.content || "To-do list"}
          </span>
          { /* Expand/Collapse icon */}
          <div class="relative w-3.5 h-3.5 flex-shrink-0">
            <ExpandIcon class={cn("absolute inset-0 w-3.5 h-3.5 text-muted-foreground transition-[opacity,transform] duration-200 ease-out", isExpanded() ? "opacity-0 scale-75" : "opacity-100 scale-100")} />
            <CollapseIcon class={cn("absolute inset-0 w-3.5 h-3.5 text-muted-foreground transition-[opacity,transform] duration-200 ease-out", isExpanded() ? "opacity-100 scale-100" : "opacity-0 scale-75")} />
          </div>
        </div>
      </div>

      { /* BOTTOM BLOCK - Current task + progress (expandable) */}
      <div class="rounded-b-lg border border-border/50 border-t-0">
        { /* Collapsed view - progress circle + current task + count */}
        <Show when={!isExpanded()}>
          <div class="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-muted/30 transition-colors duration-150" onClick={() => setIsExpanded(true)}>
            <Show when={completedCount() === totalTodos() && totalTodos() > 0} fallback={
                <ProgressCircle completed={visualProgress()} total={totalTodos()} size={16} class="flex-shrink-0" />
              }>
              <div class="w-4 h-4 rounded-full bg-muted flex items-center justify-center flex-shrink-0" style={{ border: "0.5px solid hsl(var(--border))" }}>
                <CheckIcon class="w-2.5 h-2.5 text-muted-foreground" />
              </div>
            </Show>

            <div class="flex items-center gap-1.5 min-w-0 flex-1">
              <Show when={currentTask()}>
                  <span class="text-xs text-muted-foreground truncate">
                    {currentTask()!.status === "in_progress" ? currentTask()!.activeForm || currentTask()!.content : currentTask()!.content}
                  </span>
                </Show>
              <Show when={!currentTask() && completedCount() === totalTodos() && totalTodos() > 0}>
                  <span class="text-xs text-muted-foreground truncate">
                    {todos()[totalTodos() - 1]?.content}
                  </span>
                </Show>
            </div>

            <span class="text-xs text-muted-foreground tabular-nums flex-shrink-0">
              {currentTaskIndex()}/{totalTodos()}
            </span>
          </div>
        </Show>

        { /* Expanded content - full todo list */}
        <Show when={isExpanded}>
          <div class="max-h-[300px] overflow-y-auto cursor-pointer" onClick={() => setIsExpanded(false)}>
            <For each={todos()}>
              {(todo, idx) => <TodoListItem todo={todo} isLast={idx() === todos().length - 1} />}
            </For>
          </div>
        </Show>
      </div>
    </div>;
}
