"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentWebSearchCollapsible = void 0;
var solid_js_1 = require("solid-js");
var lucide_solid_1 = require("lucide-solid");
var icons_1 = require("../../../components/ui/icons");
var agent_tool_utils_1 = require("./agent-tool-utils");
var utils_1 = require("../../../lib/utils");
exports.AgentWebSearchCollapsible = memo(function AgentWebSearchCollapsible(_a) {
    var _b;
    var part = _a.part, chatStatus = _a.chatStatus;
    var _c = (0, solid_js_1.createSignal)(false), isExpanded = _c[0], setIsExpanded = _c[1];
    var isPending = part.state !== "output-available" && part.state !== "output-error";
    // Include "submitted" status - this is when request was sent but streaming hasn't started yet
    var isActivelyStreaming = chatStatus === "streaming" || chatStatus === "submitted";
    var isStreaming = isPending && isActivelyStreaming;
    var query = ((_b = part.input) === null || _b === void 0 ? void 0 : _b.query) || "";
    // Parse results from output
    var results = (0, solid_js_1.createMemo)(function () {
        var _a;
        if (!((_a = part.output) === null || _a === void 0 ? void 0 : _a.results))
            return [];
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
    return <div>
        {/* Header - clickable to toggle */}
        <div onClick={function () { return hasResults && !isPending && setIsExpanded(!isExpanded); }} class={(0, utils_1.cn)("group flex items-start gap-1.5 py-0.5 px-2", hasResults && !isPending && "cursor-pointer")}>
          <div class="flex-1 min-w-0 flex items-center gap-1">
            <div class="text-xs flex items-center gap-1.5 min-w-0">
              <span class="font-medium whitespace-nowrap flex-shrink-0 text-muted-foreground">
                {isStreaming ? "Searching web" : "Searched web"}
              </span>
              {/* Query preview when collapsed */}
              <span class="text-muted-foreground/60 truncate">
                {query.length > 40 ? query.slice(0, 37) + "..." : query}
              </span>
              {/* Result count */}
              {!isStreaming && hasResults && <span class="text-muted-foreground/60 whitespace-nowrap flex-shrink-0">
                  · {resultCount} {resultCount === 1 ? "result" : "results"}
                </span>}
              {/* Chevron - rotates when expanded, visible on hover when collapsed */}
              {hasResults && !isPending && <lucide_solid_1.ChevronRight class={(0, utils_1.cn)("w-3.5 h-3.5 text-muted-foreground/60 transition-transform duration-200 ease-out flex-shrink-0", isExpanded && "rotate-90", !isExpanded && "opacity-0 group-hover:opacity-100")}/>}
            </div>
          </div>
        </div>

        {/* Results list - only show when expanded */}
        {isExpanded && hasResults && <div class="px-2 pb-1">
            <div class="space-y-1">
              {results.map(function (result, idx) { return <a key={idx} href={result.url} target="_blank" rel="noopener noreferrer" class="flex items-start gap-1.5 px-2 py-1 rounded hover:bg-muted/50 transition-colors group/link">
                  <icons_1.ExternalLinkIcon class="w-3 h-3 mt-0.5 flex-shrink-0 text-muted-foreground group-hover/link:text-foreground transition-colors"/>
                  <div class="min-w-0 flex-1">
                    <div class="text-xs text-foreground truncate">
                      {result.title}
                    </div>
                    <div class="text-[10px] text-muted-foreground truncate">
                      {result.url}
                    </div>
                  </div>
                </a>; })}
            </div>
          </div>}
      </div>;
}, agent_tool_utils_1.areToolPropsEqual);
