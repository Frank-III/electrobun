"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentPlanSidebar = AgentPlanSidebar;
var solid_js_1 = require("solid-js");
var button_1 = require("../../../components/ui/button");
var icons_1 = require("../../../components/ui/icons");
var kbd_1 = require("../../../components/ui/kbd");
var chat_markdown_renderer_1 = require("../../../components/chat-markdown-renderer");
var trpc_1 = require("../../../lib/trpc");
function AgentPlanSidebar(_a) {
    var chatId = _a.chatId, planPath = _a.planPath, onClose = _a.onClose, onBuildPlan = _a.onBuildPlan, refetchTrigger = _a.refetchTrigger, _b = _a.mode, mode = _b === void 0 ? "agent" : _b;
    // Fetch plan file content using tRPC
    var _c = trpc_1.trpc.files.readFile.useQuery({ filePath: planPath }, { enabled: !!planPath }), planContent = _c.data, isLoading = _c.isLoading, error = _c.error, refetch = _c.refetch;
    // Refetch when trigger changes
    (0, solid_js_1.createEffect)(function () {
        if (refetchTrigger && planPath) {
            refetch();
        }
    });
    // Extract plan title from markdown (first H1)
    var planTitle = (0, solid_js_1.createMemo)(function () {
        if (!planContent)
            return "Plan";
        var match = planContent.match(/^#\s+(.+)$/m);
        return match ? match[1] : "Plan";
    });
    return <div class="flex flex-col h-full bg-tl-background">
      {/* Header */}
      <div class="flex items-center justify-between px-2 h-10 bg-tl-background flex-shrink-0 border-b border-border/50">
        <div class="flex items-center gap-2 min-w-0 flex-1">
          <button_1.Button variant="ghost" size="icon" onClick={onClose} class="h-6 w-6 p-0 hover:bg-foreground/10 transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] text-foreground flex-shrink-0 rounded-md" aria-label="Close plan">
            <icons_1.IconDoubleChevronRight class="h-4 w-4"/>
          </button_1.Button>
          <span class="text-sm font-medium truncate">{planTitle}</span>
        </div>
        <div class="flex items-center gap-1 flex-shrink-0">
          {/* Approve Plan button - only show in plan mode */}
          {mode === "plan" && onBuildPlan && <button_1.Button size="sm" class="h-6 px-3 text-xs font-medium rounded-md transition-transform duration-150 active:scale-[0.97]" onClick={onBuildPlan}>
              Approve
              <kbd_1.Kbd class="ml-1.5 text-primary-foreground/70">⌘↵</kbd_1.Kbd>
            </button_1.Button>}
        </div>
      </div>

      {/* Content */}
      <div class="flex-1 overflow-y-auto">
        {isLoading ? <div class="flex flex-col items-center justify-center h-full p-6 text-center">
            <icons_1.IconSpinner class="h-8 w-8 text-muted-foreground mb-3"/>
            <p class="text-sm text-muted-foreground">Loading plan...</p>
          </div> : error ? <div class="flex flex-col items-center justify-center h-full p-6 text-center">
            <div class="text-muted-foreground mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" class="opacity-50">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <p class="text-sm text-muted-foreground mb-2">
              Failed to load plan
            </p>
            <p class="text-xs text-muted-foreground/70 max-w-[300px]">
              {error.message || "The plan file could not be read"}
            </p>
          </div> : !planPath ? <div class="flex flex-col items-center justify-center h-full p-6 text-center">
            <div class="text-muted-foreground mb-4">
              <icons_1.PlanIcon class="h-12 w-12 opacity-50"/>
            </div>
            <p class="text-sm text-muted-foreground mb-2">
              No plan selected
            </p>
            <p class="text-xs text-muted-foreground/70 max-w-[250px]">
              Click "View plan" on a plan file to preview it here
            </p>
          </div> : <div class="px-4 py-3 allow-text-selection" data-plan-path={planPath}>
            <chat_markdown_renderer_1.ChatMarkdownRenderer content={planContent || ""} size="sm"/>
          </div>}
      </div>
    </div>;
}
