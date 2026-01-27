"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentToolCall = void 0;
var solid_js_1 = require("solid-js");
var text_shimmer_1 = require("../../../components/ui/text-shimmer");
var tooltip_1 = require("../../../components/ui/tooltip");
exports.AgentToolCall = (0, solid_js_1.memo)(function AgentToolCall(_a) {
    var _Icon = _a.icon, title = _a.title, subtitle = _a.subtitle, tooltipContent = _a.tooltipContent, isPending = _a.isPending, _isError = _a.isError, isNested = _a.isNested;
    // Ensure title and subtitle are strings (copied from canvas)
    var titleStr = String(title);
    var subtitleStr = subtitle ? String(subtitle) : undefined;
    // Render subtitle with optional tooltip
    var subtitleElement = subtitleStr ? tooltipContent ? <tooltip_1.Tooltip>
          <tooltip_1.TooltipTrigger asChild>
            <span class="text-muted-foreground/60 font-normal truncate min-w-0" dangerouslySetInnerHTML={{ __html: subtitleStr }}/>
          </tooltip_1.TooltipTrigger>
          <tooltip_1.TooltipContent side="top" class="px-2 py-1.5 max-w-none flex items-center justify-center">
            <span class="font-mono text-[10px] text-muted-foreground whitespace-nowrap leading-none">
              {tooltipContent}
            </span>
          </tooltip_1.TooltipContent>
        </tooltip_1.Tooltip> : <span class="text-muted-foreground/60 font-normal truncate min-w-0" dangerouslySetInnerHTML={{ __html: subtitleStr }}/> : null;
    return <div class={"flex items-start gap-1.5 py-0.5 ".concat(isNested ? "px-2.5" : "rounded-md px-2")}>
        {/* Icon container - commented out like canvas, uncomment to show icons */}
        {/* <div class="flex-shrink-0 flex text-muted-foreground items-start pt-[1px]">
    <_Icon class="w-3.5 h-3.5" />
    </div> */}

        {/* Content container - matches canvas exactly */}
        <div class="flex-1 min-w-0 flex items-center gap-1.5">
          <div class="text-xs text-muted-foreground flex items-center gap-1.5 min-w-0">
            <span class="font-medium whitespace-nowrap flex-shrink-0">
              {isPending ? <text_shimmer_1.TextShimmer as="span" duration={1.2} class="inline-flex items-center text-xs leading-none h-4 m-0">
                  {titleStr}
                </text_shimmer_1.TextShimmer> : titleStr}
            </span>
            {subtitleElement}
          </div>
        </div>
      </div>;
}, function (prevProps, nextProps) {
    // Custom comparison for memoization (copied from canvas)
    return prevProps.title === nextProps.title && prevProps.subtitle === nextProps.subtitle && prevProps.tooltipContent === nextProps.tooltipContent && prevProps.isPending === nextProps.isPending && prevProps.isError === nextProps.isError && prevProps.isNested === nextProps.isNested;
});
