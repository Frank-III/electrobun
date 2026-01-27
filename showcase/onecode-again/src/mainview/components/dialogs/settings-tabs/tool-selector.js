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
exports.AVAILABLE_TOOLS = void 0;
exports.ToolSelector = ToolSelector;
var utils_1 = require("../../../lib/utils");
exports.AVAILABLE_TOOLS = [
    (
    // File Operations
    {
        id: "Read",
        name: "Read File",
        category: "file",
        description: "Read file contents"
    }),
    {
        id: "Write",
        name: "Write File",
        category: "file",
        description: "Create or overwrite files"
    },
    {
        id: "Edit",
        name: "Edit File",
        category: "file",
        description: "Make precise edits"
    },
    {
        id: "Glob",
        name: "Glob Pattern",
        category: "file",
        description: "Find files by pattern"
    },
    {
        id: "Grep",
        name: "Search Content",
        category: "file",
        description: "Search in file contents"
    },
    {
        id: "NotebookEdit",
        name: "Notebook Edit",
        category: "file",
        description: "Edit Jupyter notebooks"
    },
    (
    // System
    {
        id: "Bash",
        name: "Bash Commands",
        category: "system",
        description: "Execute shell commands"
    }),
    {
        id: "Task",
        name: "Launch Subagent",
        category: "system",
        description: "Launch specialized agents"
    },
    (
    // Web
    {
        id: "WebSearch",
        name: "Web Search",
        category: "web",
        description: "Search the internet"
    }),
    {
        id: "WebFetch",
        name: "Fetch URL",
        category: "web",
        description: "Fetch webpage content"
    },
    (
    // Planning & Interaction
    {
        id: "TodoWrite",
        name: "Todo List",
        category: "planning",
        description: "Manage task list"
    }),
    {
        id: "AskUserQuestion",
        name: "Ask User",
        category: "planning",
        description: "Ask clarifying questions"
    }
];
var CATEGORIES = [
    {
        id: "file",
        name: "File Operations"
    },
    {
        id: "system",
        name: "System"
    },
    {
        id: "web",
        name: "Web"
    },
    {
        id: "planning",
        name: "Planning"
    }
];
function ToolSelector(_a) {
    var selectedTools = _a.selectedTools, onChange = _a.onChange, mode = _a.mode;
    var handleToggle = function (toolId) {
        if (selectedTools.includes(toolId)) {
            onChange(selectedTools.filter(function (t) { return t !== toolId; }));
        }
        else {
            onChange(__spreadArray(__spreadArray([], selectedTools, true), [toolId], false));
        }
    };
    var handleSelectAll = function () {
        onChange(exports.AVAILABLE_TOOLS.map(function (t) { return t.id; }));
    };
    var handleSelectNone = function () {
        onChange([]);
    };
    return <div class="space-y-3">
      {/* Quick actions */}
      <div class="flex items-center gap-2">
        <button type="button" onClick={handleSelectAll} class="text-xs text-muted-foreground hover:text-foreground transition-colors">
          Select all
        </button>
        <span class="text-muted-foreground">·</span>
        <button type="button" onClick={handleSelectNone} class="text-xs text-muted-foreground hover:text-foreground transition-colors">
          Clear
        </button>
        <span class="flex-1"/>
        <span class="text-xs text-muted-foreground">
          {selectedTools.length} selected
        </span>
      </div>

      {/* Tools by category */}
      <div class="space-y-4 p-3 rounded-lg border border-border bg-muted/20">
        {CATEGORIES.map(function (category) {
            var categoryTools = exports.AVAILABLE_TOOLS.filter(function (t) { return t.category === category.id; });
            if (categoryTools.length === 0)
                return null;
            return <div key={category.id} class="space-y-2">
              <div class="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {category.name}
              </div>
              <div class="grid grid-cols-2 gap-2">
                {categoryTools.map(function (tool) {
                    var isSelected = selectedTools.includes(tool.id);
                    return <button key={tool.id} type="button" onClick={function () { return handleToggle(tool.id); }} class={(0, utils_1.cn)("flex items-start gap-2 p-2 rounded-md border text-left transition-colors", isSelected ? mode === "allowlist" ? "border-green-500/30 bg-green-500/10" : "border-red-500/30 bg-red-500/10" : "border-transparent bg-background hover:bg-foreground/5")}>
                      <div class={(0, utils_1.cn)("mt-0.5 h-3.5 w-3.5 rounded border flex items-center justify-center flex-shrink-0", isSelected ? mode === "allowlist" ? "border-green-500 bg-green-500" : "border-red-500 bg-red-500" : "border-muted-foreground/30")}>
                        {isSelected && <svg class="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                          </svg>}
                      </div>
                      <div class="min-w-0">
                        <div class="text-xs font-medium text-foreground truncate">
                          {tool.name}
                        </div>
                        <div class="text-[10px] text-muted-foreground truncate">
                          {tool.description}
                        </div>
                      </div>
                    </button>;
                })}
              </div>
            </div>;
        })}
      </div>

      {/* Hint */}
      <p class="text-xs text-muted-foreground">
        {mode === "allowlist" ? "Agent will ONLY have access to selected tools" : "Agent will have access to ALL tools EXCEPT selected ones"}
      </p>
    </div>;
}
