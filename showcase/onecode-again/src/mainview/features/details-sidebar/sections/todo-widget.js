"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TodoWidget = void 0;
var solid_js_1 = require("solid-js");
var jotai_1 = require("../../../lib/state/jotai");
var utils_1 = require("@/lib/utils");
var icons_1 = require("@/components/ui/icons");
var atoms_1 = require("@/features/agents/atoms");
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
    var status = _a.status;
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
var TodoListItem = function (_a) {
    var todo = _a.todo, isLast = _a.isLast;
    return <div class={(0, utils_1.cn)("flex items-center gap-2 px-2 py-1.5", !isLast && "border-b border-border/30")}>
      <TodoStatusIcon status={todo.status}/>
      <span class={(0, utils_1.cn)("text-xs truncate", todo.status === "completed" ? "line-through text-muted-foreground" : todo.status === "pending" ? "text-muted-foreground" : "text-foreground")}>
        {todo.status === "in_progress" && todo.activeForm ? todo.activeForm : todo.content}
      </span>
    </div>;
};
/**
* To-do list Widget for Overview Sidebar
* Shows active todos from selected sub-chat
* Matches the visual style of AgentTodoTool exactly
* Memoized to prevent re-renders when parent updates
*/
exports.TodoWidget = memo(function TodoWidget(_a) {
    var _b, _c;
    var subChatId = _a.subChatId;
    // Get todos from the active sub-chat
    var todosAtom = (0, solid_js_1.createMemo)(function () { return (0, atoms_1.currentTodosAtomFamily)(subChatId || "default"); });
    var todoState = (0, jotai_1.useAtomValue)(todosAtom);
    var todos = todoState.todos;
    // Expanded/collapsed state
    var _d = (0, solid_js_1.createSignal)(true), isExpanded = _d[0], setIsExpanded = _d[1];
    var handleToggleExpand = function () {
        setIsExpanded(function (prev) { return !prev; });
    };
    var handleKeyDown = function (e) {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsExpanded(function (prev) { return !prev; });
        }
    };
    // Calculate stats
    var completedCount = todos.filter(function (t) { return t.status === "completed"; }).length;
    var inProgressCount = todos.filter(function (t) { return t.status === "in_progress"; }).length;
    var totalTodos = todos.length;
    // For visual progress, count completed + in_progress tasks
    var visualProgress = completedCount + inProgressCount;
    // Find current task (first in_progress, or first pending if none in progress)
    var currentTask = todos.find(function (t) { return t.status === "in_progress"; }) || todos.find(function (t) { return t.status === "pending"; });
    // Find current task index for progress display
    var currentTaskIndex = currentTask ? todos.findIndex(function (t) { return t === currentTask; }) + 1 : completedCount;
    // Don't render if no todos
    if (todos.length === 0) {
        return null;
    }
    return <div class="mx-2 mb-2">
      {/* TOP BLOCK - Header with expand/collapse button - fixed height h-8 for consistency */}
      <div class="rounded-t-lg border border-b-0 border-border/50 bg-muted/30 px-2 h-8 cursor-pointer hover:bg-muted/50 transition-colors duration-150 flex items-center" onClick={handleToggleExpand} role="button" aria-expanded={isExpanded} aria-label={"To-do list with ".concat(totalTodos, " items. Click to ").concat(isExpanded ? "collapse" : "expand")} tabIndex={0} onKeyDown={handleKeyDown}>
        <div class="flex items-center gap-2 flex-1 min-w-0">
          <icons_1.PlanIcon class="h-3.5 w-3.5 text-muted-foreground flex-shrink-0"/>
          <span class="text-xs font-medium text-foreground">To-dos</span>
          <span class="text-xs text-muted-foreground truncate flex-1">
            {((_b = todos[0]) === null || _b === void 0 ? void 0 : _b.content) || "To-do list"}
          </span>
          {/* Expand/Collapse icon */}
          <div class="relative w-3.5 h-3.5 flex-shrink-0">
            <icons_1.ExpandIcon class={(0, utils_1.cn)("absolute inset-0 w-3.5 h-3.5 text-muted-foreground transition-[opacity,transform] duration-200 ease-out", isExpanded ? "opacity-0 scale-75" : "opacity-100 scale-100")}/>
            <icons_1.CollapseIcon class={(0, utils_1.cn)("absolute inset-0 w-3.5 h-3.5 text-muted-foreground transition-[opacity,transform] duration-200 ease-out", isExpanded ? "opacity-100 scale-100" : "opacity-0 scale-75")}/>
          </div>
        </div>
      </div>

      {/* BOTTOM BLOCK - Current task + progress (expandable) */}
      <div class="rounded-b-lg border border-border/50 border-t-0">
        {/* Collapsed view - progress circle + current task + count */}
        {!isExpanded && <div class="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-muted/30 transition-colors duration-150" onClick={function () { return setIsExpanded(true); }}>
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
                  {(_c = todos[totalTodos - 1]) === null || _c === void 0 ? void 0 : _c.content}
                </span>}
            </div>

            {/* Right side - task count */}
            <span class="text-xs text-muted-foreground tabular-nums flex-shrink-0">
              {currentTaskIndex}/{totalTodos}
            </span>
          </div>}

        {/* Expanded content - full todo list */}
        {isExpanded && <div class="max-h-[300px] overflow-y-auto cursor-pointer" onClick={function () { return setIsExpanded(false); }}>
            {todos.map(function (todo, idx) { return <TodoListItem key={idx} todo={todo} isLast={idx === todos.length - 1}/>; })}
          </div>}
      </div>
    </div>;
});
