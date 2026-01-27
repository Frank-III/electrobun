"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentContextIndicator = void 0;
var solid_js_1 = require("solid-js");
var tooltip_1 = require("../../../components/ui/tooltip");
var utils_1 = require("../../../lib/utils");
// Claude model context windows
var CONTEXT_WINDOWS = {
    opus: 2e5,
    sonnet: 2e5,
    haiku: 2e5
};
function formatTokens(tokens) {
    if (tokens >= 1e6) {
        return "".concat((tokens / 1e6).toFixed(1), "M");
    }
    if (tokens >= 1e3) {
        return "".concat((tokens / 1e3).toFixed(1), "K");
    }
    return tokens.toString();
}
// Circular progress component
function CircularProgress(_a) {
    var percent = _a.percent, _b = _a.size, size = _b === void 0 ? 18 : _b, _c = _a.strokeWidth, strokeWidth = _c === void 0 ? 2 : _c, className = _a.className;
    var radius = (size - strokeWidth) / 2;
    var circumference = 2 * Math.PI * radius;
    var offset = circumference - percent / 100 * circumference;
    return <svg width={size} height={size} class={(0, utils_1.cn)("transform -rotate-90", className)}>
      {/* Background circle */}
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} class="text-muted-foreground/20"/>
      {/* Progress circle */}
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" class="transition-all duration-300 text-muted-foreground/60"/>
    </svg>;
}
exports.AgentContextIndicator = (0, solid_js_1.memo)(function AgentContextIndicator(_a) {
    var tokenData = _a.tokenData, _b = _a.modelId, modelId = _b === void 0 ? "sonnet" : _b, className = _a.className, onCompact = _a.onCompact, isCompacting = _a.isCompacting, disabled = _a.disabled;
    var totalTokens = tokenData.totalInputTokens + tokenData.totalOutputTokens;
    var contextWindow = CONTEXT_WINDOWS[modelId];
    var percentUsed = Math.min(100, totalTokens / contextWindow * 100);
    var isEmpty = totalTokens === 0;
    var isClickable = onCompact && !disabled && !isCompacting;
    return <tooltip_1.Tooltip delayDuration={300}>
      <tooltip_1.TooltipTrigger asChild>
        <div onClick={isClickable ? onCompact : undefined} class={(0, utils_1.cn)("h-4 w-4 flex items-center justify-center", isClickable ? "cursor-pointer hover:opacity-70 transition-opacity" : "cursor-default", disabled && "opacity-50", className)}>
          <CircularProgress percent={percentUsed} size={14} strokeWidth={2.5} class={isCompacting ? "animate-pulse" : undefined}/>
        </div>
      </tooltip_1.TooltipTrigger>
      <tooltip_1.TooltipContent side="top" sideOffset={8}>
        <p class="text-xs">
          {isEmpty ? <span class="text-muted-foreground">
              Context: 0 / {formatTokens(contextWindow)}
            </span> : <>
              <span class="font-mono font-medium text-foreground">
                {percentUsed.toFixed(1)}%
              </span>
              <span class="text-muted-foreground mx-1">·</span>
              <span class="text-muted-foreground">
                {formatTokens(totalTokens)} /{" "}
                {formatTokens(contextWindow)} context
              </span>
            </>}
        </p>
      </tooltip_1.TooltipContent>
    </tooltip_1.Tooltip>;
});
