"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentWebSearchTool = void 0;
var solid_js_1 = require("solid-js");
var icons_1 = require("../../../components/ui/icons");
var text_shimmer_1 = require("../../../components/ui/text-shimmer");
var agent_tool_registry_1 = require("./agent-tool-registry");
var agent_tool_interrupted_1 = require("./agent-tool-interrupted");
var agent_tool_utils_1 = require("./agent-tool-utils");
var utils_1 = require("../../../lib/utils");
exports.AgentWebSearchTool = memo(function AgentWebSearchTool(_a) {
    var _b;
    var part = _a.part, chatStatus = _a.chatStatus;
    var _c = (0, solid_js_1.createSignal)(false), isExpanded = _c[0], setIsExpanded = _c[1];
    var _d = (0, agent_tool_registry_1.getToolStatus)(part, chatStatus), isPending = _d.isPending, isError = _d.isError, isInterrupted = _d.isInterrupted;
    var query = ((_b = part.input) === null || _b === void 0 ? void 0 : _b.query) || "";
    var truncatedQuery = query.length > 40 ? query.slice(0, 37) + "..." : query;
    // Parse results from output
    var results = (0, solid_js_1.createMemo)(function () {
        var _a;
        if (!((_a = part.output) === null || _a === void 0 ? void 0 : _a.results))
            return [];
        // Results can be nested in content array
        var rawResults = part.output.results;
        var allResults = [];
        for (var _i = 0, rawResults_1 = rawResults; _i < rawResults_1.length; _i++) {
            var result = rawResults_1[_i];
            if (result.content && Array.isArray(result.content)) {
                for (var _b = 0, _c = result.content; _b < _c.length; _b++) {
                    var item = _c[_b];
                    if (item.title && item.url) {
                        allResults.push({
                            title: item.title,
                            url: item.url
                        });
                    }
                }
            }
            else if (result.title && result.url) {
                allResults.push({
                    title: result.title,
                    url: result.url
                });
            }
        }
        return allResults;
    });
    var resultCount = results.length;
    var hasResults = resultCount > 0;
    // Show interrupted state if search was interrupted without completing
    if (isInterrupted && !hasResults) {
        return <agent_tool_interrupted_1.AgentToolInterrupted toolName="Search" subtitle={truncatedQuery}/>;
    }
    return <div class="rounded-lg border border-border bg-muted/30 overflow-hidden mx-2">
      {/* Header - clickable to toggle expand */}
      <div onClick={function () { return hasResults && !isPending && setIsExpanded(!isExpanded); }} class={(0, utils_1.cn)("flex items-center justify-between px-2.5 h-7", hasResults && !isPending && "cursor-pointer hover:bg-muted/50 transition-colors duration-150")}>
        <div class="flex items-center gap-1.5 text-xs truncate flex-1 min-w-0">
          <icons_1.SearchIcon class="w-3 h-3 flex-shrink-0 text-muted-foreground"/>
          
          {isPending ? <text_shimmer_1.TextShimmer as="span" duration={1.2} class="text-xs text-muted-foreground">
              Searching
            </text_shimmer_1.TextShimmer> : <span class="text-xs text-muted-foreground">Searched</span>}
          
          <span class="truncate text-foreground">
            {truncatedQuery}
          </span>
        </div>

        {/* Status and expand button */}
        <div class="flex items-center gap-2 flex-shrink-0 ml-2">
          <div class="flex items-center gap-1.5 text-xs">
            {isPending ? <icons_1.IconSpinner class="w-3 h-3"/> : isError ? <span class="text-destructive">Failed</span> : <span class="text-muted-foreground">
                {resultCount} {resultCount === 1 ? "result" : "results"}
              </span>}
          </div>

          {/* Expand/Collapse icon */}
          {hasResults && !isPending && <div class="relative w-4 h-4">
              <icons_1.ExpandIcon class={(0, utils_1.cn)("absolute inset-0 w-4 h-4 text-muted-foreground transition-[opacity,transform] duration-200 ease-out", isExpanded ? "opacity-0 scale-75" : "opacity-100 scale-100")}/>
              <icons_1.CollapseIcon class={(0, utils_1.cn)("absolute inset-0 w-4 h-4 text-muted-foreground transition-[opacity,transform] duration-200 ease-out", isExpanded ? "opacity-100 scale-100" : "opacity-0 scale-75")}/>
            </div>}
        </div>
      </div>

      {/* Results list - expandable */}
      {hasResults && isExpanded && <div class="border-t border-border max-h-[200px] overflow-y-auto">
          {results.map(function (result, idx) { return <a key={idx} href={result.url} target="_blank" rel="noopener noreferrer" class="flex items-start gap-2 px-2.5 py-1.5 hover:bg-muted/50 transition-colors group">
              <icons_1.ExternalLinkIcon class="w-3 h-3 mt-0.5 flex-shrink-0 text-muted-foreground group-hover:text-foreground"/>
              <div class="min-w-0 flex-1">
                <div class="text-xs text-foreground truncate">
                  {result.title}
                </div>
                <div class="text-[10px] text-muted-foreground truncate">
                  {result.url}
                </div>
              </div>
            </a>; })}
        </div>}
    </div>;
}, agent_tool_utils_1.areToolPropsEqual);
