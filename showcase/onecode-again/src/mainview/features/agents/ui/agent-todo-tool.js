"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentTodoTool = void 0;
var solid_js_1 = require("solid-js");
var jotai_1 = require("../../../lib/state/jotai");
var text_shimmer_1 = require("../../../components/ui/text-shimmer");
var icons_1 = require("../../../components/ui/icons");
var agent_tool_registry_1 = require("./agent-tool-registry");
var agent_tool_utils_1 = require("./agent-tool-utils");
var utils_1 = require("../../../lib/utils");
var lucide_solid_1 = require("lucide-solid");
var agent_tool_call_1 = require("./agent-tool-call");
var atoms_1 = require("../atoms");
var atoms_2 = require("../../../lib/atoms");
// Detect what changed between old and new todos
function detectChanges(oldTodos, newTodos) {
    // If no old todos, this is a creation - show full list ONCE
    if (!oldTodos || oldTodos.length === 0) {
        return {
            type: "creation",
            items: newTodos.map(function (todo, index) { return ({
                todo: todo,
                newStatus: todo.status,
                index: index
            }); })
        };
    }
    // Find what changed
    var changes = [];
    newTodos.forEach(function (newTodo, index) {
        var oldTodo = oldTodos[index];
        if (!oldTodo || oldTodo.status !== newTodo.status) {
            changes.push({
                todo: newTodo,
                oldStatus: oldTodo === null || oldTodo === void 0 ? void 0 : oldTodo.status,
                newStatus: newTodo.status,
                index: index
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
function getStatusVerb(status, content) {
    switch (status) {
        case "in_progress": return "Started: ".concat(content);
        case "completed": return "Finished: ".concat(content);
        case "pending": return "Created: ".concat(content);
        default: return content;
    }
}
// Get icon component for status
function getStatusIconComponent(status) {
    switch (status) {
        case "completed": return icons_1.CheckIcon;
        case "in_progress": return icons_1.IconSpinner;
        default: return lucide_solid_1.Circle;
    }
}
// Pie-style progress circle - fills sectors like pizza slices
var ProgressCircle = function (_a) {
    var completed = _a.completed, total = _a.total, _b = _a.size, size = _b === void 0 ? 16 : _b, className = _a.className;
    var cx = size / 2;
    var cy = size / 2;
    var outerRadius = (size - 1) / 2;
    var innerRadius = outerRadius - 1.5;
    // Create pie segments (no borders on segments, just fill)
    var segments = [];
    for (var i = 0; i < total; i++) {
        var startAngle = i / total * 360 - 90;
        var endAngle = (i + 1) / total * 360 - 90;
        var gap = total > 1 ? 4 : 0;
        var adjustedStartAngle = startAngle + gap / 2;
        var adjustedEndAngle = endAngle - gap / 2;
        // Convert to radians
        var startRad = adjustedStartAngle * Math.PI / 180;
        var endRad = adjustedEndAngle * Math.PI / 180;
        // Calculate arc points
        var x1 = cx + innerRadius * Math.cos(startRad);
        var y1 = cy + innerRadius * Math.sin(startRad);
        var x2 = cx + innerRadius * Math.cos(endRad);
        var y2 = cy + innerRadius * Math.sin(endRad);
        var largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
        var pathData = "M ".concat(cx, " ").concat(cy, " L ").concat(x1, " ").concat(y1, " A ").concat(innerRadius, " ").concat(innerRadius, " 0 ").concat(largeArcFlag, " 1 ").concat(x2, " ").concat(y2, " Z");
        segments.push(<path key={i} d={pathData} fill={i < completed ? "currentColor" : "transparent"} opacity={i < completed ? .7 : .15}/>);
    }
    return <svg width={size} height={size} viewBox={"0 0 ".concat(size, " ").concat(size)} class={(0, utils_1.cn)("text-muted-foreground", className)}>
      {/* Outer border circle */}
      <circle cx={cx} cy={cy} r={outerRadius} fill="none" stroke="currentColor" strokeWidth={.5} opacity={.3}/>
      {segments}
    </svg>;
};
var TodoStatusIcon = function (_a) {
    var status = _a.status, isPending = _a.isPending;
    // During loading, show arrow for in_progress items with foreground background
    if (isPending && status === "in_progress") {
        return <div class="w-3.5 h-3.5 rounded-full bg-foreground flex items-center justify-center flex-shrink-0">
        <icons_1.IconArrowRight class="w-2 h-2 text-background"/>
      </div>;
    }
    switch (status) {
        case "completed": return <div class="w-3.5 h-3.5 rounded-full bg-muted flex items-center justify-center flex-shrink-0" style={{ border: "0.5px solid hsl(var(--border))" }}>
          <icons_1.CheckIcon class="w-2 h-2 text-muted-foreground"/>
        </div>;
        case "in_progress": return <div class="w-3.5 h-3.5 rounded-full bg-foreground flex items-center justify-center flex-shrink-0">
          <icons_1.IconArrowRight class="w-2 h-2 text-background"/>
        </div>;
        default: return <div class="w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0" style={{ border: "0.5px solid hsl(var(--muted-foreground) / 0.3)" }}/>;
    }
};
// Memoized status icon map to avoid recreating on each render
// For compact change items (multiple updates view)
var STATUS_ICONS = {
    completed: icons_1.CheckIcon,
    in_progress: icons_1.IconDoubleChevronRight,
    pending: lucide_solid_1.Circle
};
// For AgentToolCall icon (single update view) - use IconSpinner for in_progress
var TOOL_CALL_ICONS = {
    completed: icons_1.CheckIcon,
    in_progress: icons_1.IconSpinner,
    pending: lucide_solid_1.Circle
};
// Memoized component for rendering individual todo change items
var TodoChangeItem = memo(function TodoChangeItem(_a) {
    var change = _a.change, showSeparator = _a.showSeparator;
    var StatusIcon = STATUS_ICONS[change.newStatus] || STATUS_ICONS.pending;
    return <div class="flex items-center gap-1 flex-shrink-0">
      <StatusIcon class="w-3 h-3"/>
      <span class="truncate">{change.todo.content}</span>
      {showSeparator && <span class="mx-0.5">,</span>}
    </div>;
});
// Memoized component for rendering individual todo list items in expanded view
var TodoListItem = memo(function TodoListItem(_a) {
    var todo = _a.todo, isPending = _a.isPending, isLast = _a.isLast;
    return <div class={(0, utils_1.cn)("flex items-center gap-2 px-2.5 py-1.5", !isLast && "border-b border-border/30")}>
      <TodoStatusIcon status={todo.status} isPending={isPending}/>
      <span class={(0, utils_1.cn)("text-xs truncate", isPending ? "text-muted-foreground" : todo.status === "completed" ? "line-through text-muted-foreground" : todo.status === "pending" ? "text-muted-foreground" : "text-foreground")}>
        {todo.content}
      </span>
    </div>;
});
exports.AgentTodoTool = memo(function AgentTodoTool(_a) {
    var _b, _c, _d, _e, _f, _g;
    var part = _a.part, chatStatus = _a.chatStatus, subChatId = _a.subChatId;
    // User preference for always expanded to-do list
    var alwaysExpandTodoList = (0, jotai_1.useAtomValue)(atoms_2.alwaysExpandTodoListAtom);
    // Synced todos state - scoped per subChatId to prevent cross-chat conflicts
    // Uses a stable key to ensure proper isolation between different sub-chats
    var todosAtom = (0, solid_js_1.createMemo)(function () { return (0, atoms_1.currentTodosAtomFamily)(subChatId || "default"); });
    var _h = (0, jotai_1.useAtom)(todosAtom), todoState = _h[0], setTodoState = _h[1];
    var syncedTodos = todoState.todos;
    var creationToolCallId = todoState.creationToolCallId;
    // Use refs to track values without triggering effect re-runs
    // This prevents infinite loops when the effect updates the atom
    var _j = (0, solid_js_1.createSignal)(syncedTodos), syncedTodosRef = _j[0], setSyncedTodosRef = _j[1];
    syncedTodosRef.current = syncedTodos;
    var _k = (0, solid_js_1.createSignal)(creationToolCallId), creationToolCallIdRef = _k[0], setCreationToolCallIdRef = _k[1];
    creationToolCallIdRef.current = creationToolCallId;
    // Get todos from input or output.newTodos
    var rawOldTodos = ((_b = part.output) === null || _b === void 0 ? void 0 : _b.oldTodos) || [];
    var newTodos = ((_c = part.input) === null || _c === void 0 ? void 0 : _c.todos) || ((_d = part.output) === null || _d === void 0 ? void 0 : _d.newTodos) || [];
    // Check if we're still streaming input (data not yet complete)
    var isStreaming = part.state === "input-streaming";
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
    var hasOutputWithEmptyOldTodos = part.output !== undefined && "oldTodos" in part.output && Array.isArray(part.output.oldTodos) && part.output.oldTodos.length === 0;
    var isNewGeneration = hasOutputWithEmptyOldTodos && newTodos.length > 0 && syncedTodos.length > 0 && creationToolCallId !== null && creationToolCallId !== part.toolCallId;
    var isCreationToolCall = creationToolCallId === null || creationToolCallId === part.toolCallId || isNewGeneration;
    // Use syncedTodos as fallback for oldTodos when output hasn't arrived yet
    // This prevents flickering: without this, when a new tool call arrives with
    // input.todos but no output.oldTodos yet, detectChanges would see empty oldTodos
    // and incorrectly treat it as "creation", showing the full list momentarily
    // before output arrives and it switches to compact "single"/"multiple" mode
    var oldTodos = (0, solid_js_1.createMemo)(function () {
        // If we have oldTodos from output, use them
        if (rawOldTodos.length > 0) {
            return rawOldTodos;
        }
        // Only use syncedTodos if this is NOT the creation tool call
        // This prevents the bug where the creation tool call would see its own todos as "old"
        if (syncedTodos.length > 0 && !isCreationToolCall) {
            return syncedTodos;
        }
        // Otherwise this is truly a creation (first tool call, or same tool call that set syncedTodos)
        return [];
    });
    // Detect what changed - memoize to avoid recalculation
    var changes = (0, solid_js_1.createMemo)(function () { return detectChanges(oldTodos, newTodos); });
    // State for expanded/collapsed - initialize based on user preference
    var _l = (0, solid_js_1.createSignal)(alwaysExpandTodoList), isExpanded = _l[0], setIsExpanded = _l[1];
    var isPending = (0, agent_tool_registry_1.getToolStatus)(part, chatStatus).isPending;
    // Sync isExpanded with alwaysExpandTodoList preference when it changes
    // Only auto-expand, don't auto-collapse (respect user's manual collapse)
    (0, solid_js_1.createEffect)(function () {
        if (alwaysExpandTodoList && !isExpanded) {
            setIsExpanded(true);
        }
    });
    // Memoized click handlers to prevent inline function re-creation
    var handleToggleExpand = function () {
        setIsExpanded(function (prev) { return !prev; });
    };
    var handleExpand = function () {
        setIsExpanded(true);
    };
    var handleCollapse = function () {
        setIsExpanded(false);
    };
    var handleKeyDown = function (e) {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsExpanded(function (prev) { return !prev; });
        }
    };
    // Update synced todos whenever newTodos change
    // This keeps the creation tool in sync with all updates
    (0, solid_js_1.createEffect)(function () {
        if (newTodos.length > 0) {
            // Use refs to get current values without adding them to dependencies
            // This prevents infinite loops: effect updates atom -> state changes -> effect runs again
            var currentSyncedTodos = syncedTodosRef.current;
            var currentCreationToolCallId = creationToolCallIdRef.current;
            // Compute these inside the effect to avoid dependency issues
            // These values depend on syncedTodos/creationToolCallId which change when we call setTodoState
            var hasOutputWithEmptyOldTodos_1 = part.output !== undefined && "oldTodos" in part.output && Array.isArray(part.output.oldTodos) && part.output.oldTodos.length === 0;
            var isNewGenerationLocal = hasOutputWithEmptyOldTodos_1 && newTodos.length > 0 && currentSyncedTodos.length > 0 && currentCreationToolCallId !== null && currentCreationToolCallId !== part.toolCallId;
            var isCreationToolCallLocal = currentCreationToolCallId === null || currentCreationToolCallId === part.toolCallId || isNewGenerationLocal;
            // Only update if:
            // 1. This is the creation tool call (always update), OR
            // 2. newTodos has at least as many items as syncedTodos (prevents partial streaming overwrites)
            // During streaming, JSON parsing may return partial arrays, causing temporary drops in length
            var shouldUpdate = isCreationToolCallLocal || newTodos.length >= currentSyncedTodos.length;
            // If this is a new generation, reset the creationToolCallId to this tool call
            var newCreationId = isNewGenerationLocal ? part.toolCallId : currentCreationToolCallId === null ? part.toolCallId : currentCreationToolCallId;
            if (shouldUpdate) {
                // Prevent infinite loop: check if todos actually changed before updating
                // Compare by serializing to JSON - if content is the same, skip update
                var newTodosJson = JSON.stringify(newTodos);
                var syncedTodosJson = JSON.stringify(currentSyncedTodos);
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
              <text_shimmer_1.TextShimmer as="span" duration={1.2} class="inline-flex items-center text-xs leading-none h-4 m-0">
                Updating to-dos...
              </text_shimmer_1.TextShimmer>
            </span>
          </div>
        </div>
      </div>;
    }
    // Early streaming state - show placeholder for CREATION only
    if (newTodos.length === 0 || isStreaming && !((_e = part.input) === null || _e === void 0 ? void 0 : _e.todos)) {
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
            <icons_1.PlanIcon class="w-3.5 h-3.5 text-muted-foreground flex-shrink-0"/>
            <span class="text-xs font-medium whitespace-nowrap flex-shrink-0">
              {isPending ? <text_shimmer_1.TextShimmer as="span" duration={1.2} class="inline-flex items-center text-xs leading-none h-4 m-0">
                  Creating to-do list...
                </text_shimmer_1.TextShimmer> : "Creating to-do list..."}
            </span>
          </div>
        </div>
      </div>;
    }
    // COMPACT MODE: Single update - render as simple tool call
    // Skip compact mode if user prefers always expanded and this is the creation tool call
    if (changes.type === "single" && !(alwaysExpandTodoList && isCreationToolCall)) {
        var change = changes.items[0];
        // Use stable icon reference from TOOL_CALL_ICONS map
        var IconComponent = TOOL_CALL_ICONS[change.newStatus] || TOOL_CALL_ICONS.pending;
        // For in_progress status with activeForm, use activeForm as the title text
        // to avoid duplication (content + activeForm both shown)
        var titleText = change.newStatus === "in_progress" && change.todo.activeForm ? change.todo.activeForm : change.todo.content;
        return <agent_tool_call_1.AgentToolCall icon={IconComponent} title={getStatusVerb(change.newStatus, titleText)} isPending={isPending} isError={false}/>;
    }
    // COMPACT MODE: Multiple updates - render as custom component with icons
    // Skip compact mode if user prefers always expanded and this is the creation tool call
    if (changes.type === "multiple" && !(alwaysExpandTodoList && isCreationToolCall)) {
        var completedChanges = changes.items.filter(function (c) { return c.newStatus === "completed"; }).length;
        var startedChanges = changes.items.filter(function (c) { return c.newStatus === "in_progress"; }).length;
        // Build summary title
        var summaryTitle = "Updated to-dos";
        if (completedChanges > 0 && startedChanges === 0) {
            summaryTitle = "Finished ".concat(completedChanges, " ").concat(completedChanges === 1 ? "task" : "tasks");
        }
        else if (startedChanges > 0 && completedChanges === 0) {
            summaryTitle = "Started ".concat(startedChanges, " ").concat(startedChanges === 1 ? "task" : "tasks");
        }
        else if (completedChanges > 0 && startedChanges > 0) {
            summaryTitle = "Updated ".concat(changes.items.length, " ").concat(changes.items.length === 1 ? "task" : "tasks");
        }
        // Limit displayed items to avoid overflow
        var MAX_VISIBLE_ITEMS = 3;
        var visibleItems_1 = changes.items.slice(0, MAX_VISIBLE_ITEMS);
        var remainingCount = changes.items.length - MAX_VISIBLE_ITEMS;
        return <div class="flex items-start gap-1.5 py-0.5 rounded-md px-2">
        <div class="flex-1 min-w-0 flex items-center gap-1.5">
          <div class="text-xs text-muted-foreground flex items-center gap-1.5 min-w-0">
            <span class="font-medium whitespace-nowrap flex-shrink-0">
              {isPending ? <text_shimmer_1.TextShimmer as="span" duration={1.2} class="inline-flex items-center text-xs leading-none h-4 m-0">
                  {summaryTitle}
                </text_shimmer_1.TextShimmer> : summaryTitle}
            </span>
            <div class="flex items-center gap-1 text-muted-foreground/60 font-normal truncate min-w-0">
              {visibleItems_1.map(function (c, idx) { return <TodoChangeItem key={idx} change={c} showSeparator={idx < visibleItems_1.length - 1}/>; })}
              {remainingCount > 0 && <span class="text-muted-foreground/60 whitespace-nowrap flex-shrink-0">
                  +{remainingCount} more
                </span>}
            </div>
          </div>
        </div>
      </div>;
    }
    // FULL MODE: Creation - render as expandable list
    // Use syncedTodos to show the current state (synced with all updates)
    var displayTodos = syncedTodos.length > 0 ? syncedTodos : newTodos;
    var completedCount = displayTodos.filter(function (t) { return t.status === "completed"; }).length;
    var inProgressCount = displayTodos.filter(function (t) { return t.status === "in_progress"; }).length;
    var totalTodos = displayTodos.length;
    // For visual progress, count completed + in_progress tasks
    // This way when a task starts, the segment fills immediately
    var visualProgress = completedCount + inProgressCount;
    // Find current task (first in_progress, or first pending if none in progress)
    var currentTask = displayTodos.find(function (t) { return t.status === "in_progress"; }) || displayTodos.find(function (t) { return t.status === "pending"; });
    // Find current task index for progress display
    var currentTaskIndex = currentTask ? displayTodos.findIndex(function (t) { return t === currentTask; }) + 1 : completedCount;
    return <div class={(0, utils_1.cn)("mx-2", 
        // Make entire creation todo sticky
        // z-[5] ensures todo stays below user message (z-10) when both are sticky
        isCreationToolCall && "sticky z-[5] bg-background")} style={isCreationToolCall ? { top: "calc(var(--user-message-height, 28px) - 29px)" } : undefined}>
      {/* TOP BLOCK - Plan title with expand/collapse button */}
      <div class="rounded-t-lg border border-b-0 border-border bg-muted/30 px-2.5 py-1.5 cursor-pointer hover:bg-muted/40 transition-colors duration-150" onClick={handleToggleExpand} role="button" aria-expanded={isExpanded} aria-label={"To-do list with ".concat(totalTodos, " items. Click to ").concat(isExpanded ? "collapse" : "expand")} tabIndex={0} onKeyDown={handleKeyDown}>
        <div class="flex items-center gap-1.5">
          <icons_1.PlanIcon class="w-3.5 h-3.5 text-muted-foreground flex-shrink-0"/>
          <span class="text-xs font-medium text-foreground">
            To-dos
          </span>
          <span class="text-xs text-muted-foreground truncate flex-1">
            {((_f = displayTodos[0]) === null || _f === void 0 ? void 0 : _f.content) || "To-do list"}
          </span>
          {/* Expand/Collapse icon */}
          <div class="relative w-4 h-4 flex-shrink-0">
            <icons_1.ExpandIcon class={(0, utils_1.cn)("absolute inset-0 w-4 h-4 text-muted-foreground transition-[opacity,transform] duration-200 ease-out", isExpanded ? "opacity-0 scale-75" : "opacity-100 scale-100")}/>
            <icons_1.CollapseIcon class={(0, utils_1.cn)("absolute inset-0 w-4 h-4 text-muted-foreground transition-[opacity,transform] duration-200 ease-out", isExpanded ? "opacity-100 scale-100" : "opacity-0 scale-75")}/>
          </div>
        </div>
      </div>

      {/* BOTTOM BLOCK - Current task + progress (expandable) */}
      <div class="rounded-b-lg border border-border bg-muted/20 shadow-xl shadow-background">
        {/* Collapsed view - progress circle + current task + count */}
        {!isExpanded && <div class="flex items-center gap-2.5 px-2.5 py-1.5 cursor-pointer hover:bg-muted/30 transition-colors duration-150" onClick={handleExpand}>
            {/* Progress circle or checkmark when all completed */}
            {completedCount === totalTodos && totalTodos > 0 ? <div class="w-4 h-4 rounded-full bg-muted flex items-center justify-center flex-shrink-0" style={{ border: "0.5px solid hsl(var(--border))" }}>
                <icons_1.CheckIcon class="w-2.5 h-2.5 text-muted-foreground"/>
              </div> : <ProgressCircle completed={visualProgress} total={totalTodos} size={16} class="flex-shrink-0"/>}

            {/* Current task name */}
            <div class="flex items-center gap-1.5 min-w-0 flex-1">
              {currentTask && <span class="text-xs text-muted-foreground truncate">
                  {currentTask.status === "in_progress" ? currentTask.activeForm || currentTask.content : currentTask.content}
                </span>}
              {!currentTask && completedCount === totalTodos && totalTodos > 0 && <span class="text-xs text-muted-foreground truncate">
                  {(_g = displayTodos[totalTodos - 1]) === null || _g === void 0 ? void 0 : _g.content}
                </span>}
            </div>

            {/* Right side - task count */}
            <span class="text-xs text-muted-foreground tabular-nums flex-shrink-0">
              {currentTaskIndex}/{totalTodos}
            </span>
          </div>}

        {/* Expanded content - full todo list */}
        {isExpanded && <div class="max-h-[300px] overflow-y-auto cursor-pointer" onClick={handleCollapse}>
            {displayTodos.map(function (todo, idx) { return <TodoListItem key={idx} todo={todo} isPending={isPending} isLast={idx === displayTodos.length - 1}/>; })}
          </div>}
      </div>
    </div>;
}, agent_tool_utils_1.areToolPropsEqual);
