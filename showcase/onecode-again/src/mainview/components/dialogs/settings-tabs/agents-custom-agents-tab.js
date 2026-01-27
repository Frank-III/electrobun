"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentsCustomAgentsTab = AgentsCustomAgentsTab;
var solid_js_1 = require("solid-js");
var lucide_solid_1 = require("lucide-solid");
var react_1 = require("motion/react");
var trpc_1 = require("../../../lib/trpc");
var utils_1 = require("../../../lib/utils");
var icons_1 = require("../../ui/icons");
// Hook to detect narrow screen
function useIsNarrowScreen() {
    var _a = (0, solid_js_1.createSignal)(false), isNarrow = _a[0], setIsNarrow = _a[1];
    (0, solid_js_1.createEffect)(function () {
        var checkWidth = function () {
            setIsNarrow(window.innerWidth <= 768);
        };
        checkWidth();
        window.addEventListener("resize", checkWidth);
        return function () { return window.removeEventListener("resize", checkWidth); };
    });
    return isNarrow;
}
function AgentsCustomAgentsTab() {
    var isNarrowScreen = useIsNarrowScreen();
    var _a = (0, solid_js_1.createSignal)(null), expandedAgentName = _a[0], setExpandedAgentName = _a[1];
    var _b = trpc_1.trpc.agents.list.useQuery(undefined), _c = _b.data, agents = _c === void 0 ? [] : _c, isLoading = _b.isLoading;
    var openInFinderMutation = trpc_1.trpc.external.openInFinder.useMutation();
    var userAgents = agents.filter(function (a) { return a.source === "user"; });
    var projectAgents = agents.filter(function (a) { return a.source === "project"; });
    var handleExpandAgent = function (agentName) {
        setExpandedAgentName(expandedAgentName === agentName ? null : agentName);
    };
    var handleOpenInFinder = function (path) {
        openInFinderMutation.mutate(path);
    };
    return <div class="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
      {/* Header - hidden on narrow screens */}
      {!isNarrowScreen && <div class="flex flex-col space-y-1.5 text-center sm:text-left">
          <div class="flex items-center gap-2">
            <h3 class="text-sm font-semibold text-foreground">Custom Agents</h3>
            <span class="px-1.5 py-0.5 text-[10px] font-medium rounded bg-muted text-muted-foreground">
              Beta
            </span>
          </div>
          <a href="https://code.claude.com/docs/en/sub-agents" target="_blank" rel="noopener noreferrer" class="text-xs text-muted-foreground hover:text-foreground underline transition-colors">
            Documentation
          </a>
        </div>}

      {/* Agents List */}
      <div class="space-y-4">
        {isLoading ? <div class="bg-background rounded-lg border border-border p-4 text-sm text-muted-foreground text-center">
            Loading agents...
          </div> : agents.length === 0 ? <div class="bg-background rounded-lg border border-border p-6 text-center">
            <icons_1.AgentIcon class="h-8 w-8 text-muted-foreground/50 mx-auto mb-3"/>
            <p class="text-sm text-muted-foreground mb-2">
              No custom agents found
            </p>
            <p class="text-xs text-muted-foreground">
              Add .md files to <code class="px-1 py-0.5 bg-muted rounded">~/.claude/agents/</code>
            </p>
          </div> : <>
            {/* User Agents */}
            {userAgents.length > 0 && <div class="space-y-2">
                <div class="text-xs text-muted-foreground">
                  ~/.claude/agents/
                </div>
                <div class="bg-background rounded-lg border border-border overflow-hidden">
                  <div class="divide-y divide-border">
                    {userAgents.map(function (agent) { return <AgentRow key={agent.name} agent={agent} isExpanded={expandedAgentName === agent.name} onToggle={function () { return handleExpandAgent(agent.name); }} onOpenInFinder={function () { return handleOpenInFinder(agent.path); }}/>; })}
                  </div>
                </div>
              </div>}

            {/* Project Agents */}
            {projectAgents.length > 0 && <div class="space-y-2">
                <div class="text-xs text-muted-foreground">
                  .claude/agents/
                </div>
                <div class="bg-background rounded-lg border border-border overflow-hidden">
                  <div class="divide-y divide-border">
                    {projectAgents.map(function (agent) { return <AgentRow key={agent.name} agent={agent} isExpanded={expandedAgentName === agent.name} onToggle={function () { return handleExpandAgent(agent.name); }} onOpenInFinder={function () { return handleOpenInFinder(agent.path); }}/>; })}
                  </div>
                </div>
              </div>}
          </>}
      </div>

      {/* Info Section */}
      <div class="pt-4 border-t border-border space-y-3">
        <div>
          <h4 class="text-xs font-medium text-foreground mb-1.5">
            How Custom Agents Work
          </h4>
          <p class="text-xs text-muted-foreground">
            Agents are specialized sub-agents that Claude can invoke via the Task tool. They have their own system prompt, tools, and model settings.
          </p>
        </div>
        <div>
          <h4 class="text-xs font-medium text-foreground mb-1.5">
            Using Agents
          </h4>
          <p class="text-xs text-muted-foreground">
            Ask Claude to use an agent directly (e.g., "use the code-reviewer agent") or Claude will automatically invoke them when appropriate.
          </p>
        </div>
        <div>
          <h4 class="text-xs font-medium text-foreground mb-1.5">
            File Format
          </h4>
          <p class="text-xs text-muted-foreground">
            Agents are Markdown files with YAML frontmatter containing <code class="px-1 py-0.5 bg-muted rounded">name</code>, <code class="px-1 py-0.5 bg-muted rounded">description</code>, <code class="px-1 py-0.5 bg-muted rounded">tools</code>, and <code class="px-1 py-0.5 bg-muted rounded">model</code>. The body is the system prompt.
          </p>
        </div>
      </div>

    </div>;
}
function AgentRow(_a) {
    var agent = _a.agent, isExpanded = _a.isExpanded, onToggle = _a.onToggle, onOpenInFinder = _a.onOpenInFinder;
    return <div>
      <button onClick={onToggle} class="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/30 transition-colors">
        <lucide_solid_1.ChevronRight class={(0, utils_1.cn)("h-4 w-4 text-muted-foreground transition-transform flex-shrink-0", isExpanded && "rotate-90")}/>
        <div class="flex flex-col space-y-0.5 min-w-0 flex-1">
          <span class="text-sm font-medium text-foreground truncate">
            {agent.name}
          </span>
          {agent.description && <span class="text-xs text-muted-foreground truncate">
              {agent.description}
            </span>}
        </div>
        {agent.model && agent.model !== "inherit" && <span class="px-1.5 py-0.5 text-[10px] font-medium rounded bg-muted text-muted-foreground flex-shrink-0">
            {agent.model}
          </span>}
      </button>

      <react_1.AnimatePresence initial={false}>
        {isExpanded && <react_1.motion.div initial={{
                height: 0,
                opacity: 0
            }} animate={{
                height: "auto",
                opacity: 1
            }} exit={{
                height: 0,
                opacity: 0
            }} transition={{
                height: {
                    type: "spring",
                    stiffness: 300,
                    damping: 30
                },
                opacity: { duration: .2 }
            }} class="overflow-hidden">
            <div class="px-4 pb-4 pt-0 border-t border-border bg-muted/20">
              <div class="pt-3 space-y-3">
                {/* Path - clickable to open in Finder */}
                <div>
                  <span class="text-xs font-medium text-foreground">Path</span>
                  <button onClick={function (e) {
                e.stopPropagation();
                onOpenInFinder();
            }} class="block text-xs text-muted-foreground font-mono mt-0.5 break-all text-left hover:text-foreground hover:underline transition-colors cursor-pointer">
                    {agent.path}
                  </button>
                </div>

                {/* Tools */}
                {agent.tools && agent.tools.length > 0 && <div>
                    <span class="text-xs font-medium text-foreground">Allowed Tools</span>
                    <div class="flex flex-wrap gap-1 mt-1">
                      {agent.tools.map(function (tool) { return <span key={tool} class="px-1.5 py-0.5 text-[10px] font-medium rounded bg-muted text-muted-foreground">
                          {tool}
                        </span>; })}
                    </div>
                  </div>}

                {/* Disallowed Tools */}
                {agent.disallowedTools && agent.disallowedTools.length > 0 && <div>
                    <span class="text-xs font-medium text-foreground">Disallowed Tools</span>
                    <div class="flex flex-wrap gap-1 mt-1">
                      {agent.disallowedTools.map(function (tool) { return <span key={tool} class="px-1.5 py-0.5 text-[10px] font-medium rounded bg-muted text-muted-foreground">
                          {tool}
                        </span>; })}
                    </div>
                  </div>}
              </div>
            </div>
          </react_1.motion.div>}
      </react_1.AnimatePresence>
    </div>;
}
