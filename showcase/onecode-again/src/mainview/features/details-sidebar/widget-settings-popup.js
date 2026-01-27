"use client";
"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WidgetSettingsPopup = WidgetSettingsPopup;
var solid_js_1 = require("solid-js");
var jotai_1 = require("../../lib/state/jotai");
var lucide_solid_1 = require("lucide-solid");
var button_1 = require("@/components/ui/button");
var popover_1 = require("@/components/ui/popover");
var checkbox_1 = require("@/components/ui/checkbox");
var icons_1 = require("@/components/ui/icons");
var utils_1 = require("@/lib/utils");
var atoms_1 = require("./atoms");
// Get the correct icon for each widget (matching details-sidebar.tsx)
function getWidgetIcon(widgetId) {
    switch (widgetId) {
        case "info": return lucide_solid_1.Box;
        case "todo": return lucide_solid_1.ListTodo;
        case "plan": return icons_1.PlanIcon;
        case "terminal": return lucide_solid_1.TerminalSquare;
        case "diff": return icons_1.DiffIcon;
        default: return lucide_solid_1.Box;
    }
}
function WidgetSettingsPopup(_a) {
    var workspaceId = _a.workspaceId, _b = _a.isRemoteChat, isRemoteChat = _b === void 0 ? false : _b;
    var visibilityAtom = (0, solid_js_1.createMemo)(function () { return (0, atoms_1.widgetVisibilityAtomFamily)(workspaceId); });
    var orderAtom = (0, solid_js_1.createMemo)(function () { return (0, atoms_1.widgetOrderAtomFamily)(workspaceId); });
    var _c = (0, jotai_1.useAtom)(visibilityAtom), visibleWidgets = _c[0], setVisibleWidgets = _c[1];
    var _d = (0, jotai_1.useAtom)(orderAtom), widgetOrder = _d[0], setWidgetOrder = _d[1];
    // Drag state
    var _e = (0, solid_js_1.createSignal)(null), draggedWidget = _e[0], setDraggedWidget = _e[1];
    var _f = (0, solid_js_1.createSignal)(null), dragOverWidget = _f[0], setDragOverWidget = _f[1];
    var toggleWidget = function (widgetId) {
        if (visibleWidgets.includes(widgetId)) {
            setVisibleWidgets(visibleWidgets.filter(function (id) { return id !== widgetId; }));
        }
        else {
            // Add widget - preserve current order
            var newVisibleWidgets = __spreadArray(__spreadArray([], visibleWidgets, true), [widgetId], false);
            // Sort by widgetOrder
            newVisibleWidgets.sort(function (a, b) { return widgetOrder.indexOf(a) - widgetOrder.indexOf(b); });
            setVisibleWidgets(newVisibleWidgets);
        }
    };
    // Drag handlers
    var handleDragStart = function (e, widgetId) {
        setDraggedWidget(widgetId);
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", widgetId);
    };
    var handleDragOver = function (e, widgetId) {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        if (draggedWidget && draggedWidget !== widgetId) {
            setDragOverWidget(widgetId);
        }
    };
    var handleDragLeave = function () {
        setDragOverWidget(null);
    };
    var handleDrop = function (e, targetWidgetId) {
        e.preventDefault();
        if (!draggedWidget || draggedWidget === targetWidgetId) {
            setDraggedWidget(null);
            setDragOverWidget(null);
            return;
        }
        // Reorder widgets
        var newOrder = __spreadArray([], widgetOrder, true);
        var draggedIndex = newOrder.indexOf(draggedWidget);
        var targetIndex = newOrder.indexOf(targetWidgetId);
        if (draggedIndex !== -1 && targetIndex !== -1) {
            // Remove dragged widget from its position
            newOrder.splice(draggedIndex, 1);
            // Insert at target position
            newOrder.splice(targetIndex, 0, draggedWidget);
            setWidgetOrder(newOrder);
            // Also update visible widgets order
            var newVisibleWidgets = visibleWidgets.slice().sort(function (a, b) { return newOrder.indexOf(a) - newOrder.indexOf(b); });
            setVisibleWidgets(newVisibleWidgets);
        }
        setDraggedWidget(null);
        setDragOverWidget(null);
    };
    var handleDragEnd = function () {
        setDraggedWidget(null);
        setDragOverWidget(null);
    };
    // Get widgets in current order, filtering out terminal for remote chats
    var orderedWidgets = (0, solid_js_1.createMemo)(function () {
        var widgets = isRemoteChat ? atoms_1.WIDGET_REGISTRY.filter(function (w) { return w.id !== "terminal"; }) : atoms_1.WIDGET_REGISTRY;
        return __spreadArray([], widgets, true).sort(function (a, b) { return widgetOrder.indexOf(a.id) - widgetOrder.indexOf(b.id); });
    });
    return <popover_1.Popover>
      <popover_1.PopoverTrigger asChild>
        <button_1.Button variant="ghost" size="sm" class="h-6 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-foreground/10 transition-colors rounded-md">
          Edit widgets
        </button_1.Button>
      </popover_1.PopoverTrigger>
      <popover_1.PopoverContent align="end" class="w-56 p-2" sideOffset={8}>
        <div class="space-y-1">
          <div class="px-2 py-1.5 text-xs font-medium text-muted-foreground">
            Widgets
          </div>
          {orderedWidgets.map(function (widget) {
            var isVisible = visibleWidgets.includes(widget.id);
            var Icon = getWidgetIcon(widget.id);
            var isDragging = draggedWidget === widget.id;
            var isDragOver = dragOverWidget === widget.id;
            return <div key={widget.id} draggable onDragStart={function (e) { return handleDragStart(e, widget.id); }} onDragOver={function (e) { return handleDragOver(e, widget.id); }} onDragLeave={handleDragLeave} onDrop={function (e) { return handleDrop(e, widget.id); }} onDragEnd={handleDragEnd} class={(0, utils_1.cn)("flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted cursor-grab active:cursor-grabbing transition-colors", isDragging && "opacity-50", isDragOver && "bg-muted/80 ring-1 ring-primary/50")}>
                <lucide_solid_1.GripVertical class="h-3.5 w-3.5 text-muted-foreground/50 flex-shrink-0"/>
                <checkbox_1.Checkbox checked={isVisible} onCheckedChange={function () { return toggleWidget(widget.id); }} onClick={function (e) { return e.stopPropagation(); }} class="h-4 w-4"/>
                <Icon class="h-4 w-4 text-muted-foreground flex-shrink-0"/>
                <span class="text-sm flex-1">{widget.label}</span>
              </div>;
        })}
        </div>
      </popover_1.PopoverContent>
    </popover_1.Popover>;
}
