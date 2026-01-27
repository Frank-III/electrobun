"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentPlanTool = void 0;
var solid_js_1 = require("solid-js");
var text_shimmer_1 = require("../../../components/ui/text-shimmer");
var icons_1 = require("../../../components/ui/icons");
var agent_tool_registry_1 = require("./agent-tool-registry");
var agent_tool_utils_1 = require("./agent-tool-utils");
var utils_1 = require("../../../lib/utils");
var lucide_solid_1 = require("lucide-solid");
var StepStatusIcon = function (_a) {
    var status = _a.status, isPending = _a.isPending;
    // During loading, show spinner for in_progress items
    if (isPending && status === "in_progress") {
        return <div class="w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0" style={{ border: "0.5px solid hsl(var(--muted-foreground) / 0.3)" }}>
        <icons_1.IconSpinner class="w-2.5 h-2.5"/>
      </div>;
    }
    switch (status) {
        case "completed": return <div class="w-3.5 h-3.5 rounded-full bg-muted flex items-center justify-center flex-shrink-0" style={{ border: "0.5px solid hsl(var(--border))" }}>
          <icons_1.CheckIcon class="w-2 h-2 text-muted-foreground"/>
        </div>;
        case "in_progress": return <div class="w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0" style={{ border: "0.5px solid hsl(var(--muted-foreground) / 0.3)" }}>
          <icons_1.IconSpinner class="w-2.5 h-2.5"/>
        </div>;
        case "skipped": return <div class="w-3.5 h-3.5 rounded-full bg-muted flex items-center justify-center flex-shrink-0" style={{ border: "0.5px solid hsl(var(--border))" }}>
          <lucide_solid_1.SkipForward class="w-2 h-2 text-muted-foreground"/>
        </div>;
        default: return <div class="w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0" style={{ border: "0.5px solid hsl(var(--muted-foreground) / 0.3)" }}/>;
    }
};
var ComplexityBadge = function (_a) {
    var complexity = _a.complexity;
    if (!complexity)
        return null;
    return <span class="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
      {complexity}
    </span>;
};
exports.AgentPlanTool = memo(function AgentPlanTool(_a) {
    var _b, _c;
    var part = _a.part, chatStatus = _a.chatStatus;
    var _d = (0, solid_js_1.createSignal)(false), isExpanded = _d[0], setIsExpanded = _d[1];
    var isPending = (0, agent_tool_registry_1.getToolStatus)(part, chatStatus).isPending;
    var plan = (_b = part.input) === null || _b === void 0 ? void 0 : _b.plan;
    var action = ((_c = part.input) === null || _c === void 0 ? void 0 : _c.action) || "create";
    if (!plan) {
        return null;
    }
    var steps = plan.steps || [];
    var completedCount = steps.filter(function (s) { return s.status === "completed"; }).length;
    var inProgressCount = steps.filter(function (s) { return s.status === "in_progress"; }).length;
    var totalSteps = steps.length;
    // Determine header title based on action and status
    var getHeaderTitle = function () {
        if (isPending) {
            if (action === "create")
                return "Creating plan...";
            if (action === "approve")
                return "Approving plan...";
            if (action === "complete")
                return "Completing plan...";
            return "Updating plan...";
        }
        if (plan.status === "awaiting_approval")
            return "Plan ready for review";
        if (plan.status === "completed")
            return "Plan completed";
        if (plan.status === "approved")
            return "Plan approved";
        return plan.title;
    };
    // Progress text
    var getProgressText = function () {
        if (totalSteps === 0)
            return null;
        if (completedCount === totalSteps) {
            return "".concat(completedCount, " of ").concat(totalSteps, " Completed");
        }
        if (inProgressCount > 0) {
            return "".concat(completedCount, " of ").concat(totalSteps, " Completed, ").concat(inProgressCount, " in progress");
        }
        return "".concat(completedCount, " of ").concat(totalSteps, " Completed");
    };
    return <div class="rounded-lg border border-border bg-muted/30 overflow-hidden mx-2">
      {/* Header - click anywhere to expand/collapse */}
      <div class="flex items-center justify-between px-2.5 py-2 cursor-pointer hover:bg-muted/50 transition-colors duration-150" onClick={function () { return setIsExpanded(!isExpanded); }}>
        <div class="flex items-center gap-2 min-w-0 flex-1">
          <div class="flex flex-col min-w-0 flex-1">
            {isPending ? <text_shimmer_1.TextShimmer as="span" duration={1.2} class="text-xs font-medium">
                {getHeaderTitle()}
              </text_shimmer_1.TextShimmer> : <span class="text-xs font-medium text-foreground truncate">
                {getHeaderTitle()}
              </span>}
            {plan.summary && !isExpanded && <span class="text-[11px] text-muted-foreground/60 truncate">
                {plan.summary}
              </span>}
          </div>
        </div>

        {/* Right side */}
        <div class="flex items-center gap-2 flex-shrink-0 ml-2">
          {isPending && <icons_1.IconSpinner class="w-3 h-3"/>}
          
          {/* Progress indicator */}
          {totalSteps > 0 && !isPending && <span class="text-xs text-muted-foreground">
              {completedCount}/{totalSteps}
            </span>}

          {/* Expand/Collapse icon */}
          <div class="relative w-4 h-4">
            <icons_1.ExpandIcon class={(0, utils_1.cn)("absolute inset-0 w-4 h-4 text-muted-foreground transition-[opacity,transform] duration-200 ease-out", isExpanded ? "opacity-0 scale-75" : "opacity-100 scale-100")}/>
            <icons_1.CollapseIcon class={(0, utils_1.cn)("absolute inset-0 w-4 h-4 text-muted-foreground transition-[opacity,transform] duration-200 ease-out", isExpanded ? "opacity-100 scale-100" : "opacity-0 scale-75")}/>
          </div>
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && <div class="border-t border-border">
          {/* Summary */}
          {plan.summary && <div class="px-2.5 py-2 text-xs text-muted-foreground border-b border-border/50">
              {plan.summary}
            </div>}

          {/* Progress bar */}
          {totalSteps > 0 && <div class="px-2.5 py-2 border-b border-border/50">
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-xs text-muted-foreground">
                  {getProgressText()}
                </span>
              </div>
              <div class="h-1.5 bg-muted rounded-full overflow-hidden">
                <div class="h-full bg-muted-foreground/50 transition-all duration-300 ease-out" style={{ width: "".concat(completedCount / totalSteps * 100, "%") }}/>
              </div>
            </div>}

          {/* Steps list */}
          <div class="max-h-[300px] overflow-y-auto">
            {steps.map(function (step, idx) { return <div key={step.id} class={(0, utils_1.cn)("px-2.5 py-2 hover:bg-muted/30 transition-colors duration-150", idx !== steps.length - 1 && "border-b border-border/30")}>
                <div class="flex items-start gap-2">
                  <StepStatusIcon status={step.status} isPending={isPending}/>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <span class={(0, utils_1.cn)("text-xs font-medium", step.status === "completed" && "line-through text-muted-foreground", step.status === "skipped" && "line-through text-muted-foreground/60")}>
                        {step.title}
                      </span>
                      <ComplexityBadge complexity={step.estimatedComplexity}/>
                    </div>
                    
                    {step.description && <p class="text-[11px] text-muted-foreground/70 mt-0.5 leading-relaxed">
                        {step.description}
                      </p>}
                    
                    {/* Files */}
                    {step.files && step.files.length > 0 && <div class="flex flex-wrap gap-1 mt-1.5">
                        {step.files.map(function (file, fileIdx) { return <span key={fileIdx} class="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                            <lucide_solid_1.FileCode2 class="w-2.5 h-2.5"/>
                            {file.split("/").pop()}
                          </span>; })}
                      </div>}
                  </div>
                </div>
              </div>; })}
          </div>

          {/* Plan status footer */}
          {plan.status === "awaiting_approval" && <div class="px-2.5 py-2 border-t border-border bg-muted/50">
              <span class="text-xs text-muted-foreground">
                Awaiting your approval to proceed
              </span>
            </div>}
          
          {plan.status === "completed" && <div class="px-2.5 py-2 border-t border-border bg-muted/50">
              <span class="text-xs text-muted-foreground">
                Plan completed successfully
              </span>
            </div>}
        </div>}
    </div>;
}, agent_tool_utils_1.areToolPropsEqual);
