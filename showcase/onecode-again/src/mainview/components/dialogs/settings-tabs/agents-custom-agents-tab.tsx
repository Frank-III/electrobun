import { createSignal, createEffect, Show, For, onCleanup } from "solid-js";
import { ChevronRight } from "lucide-solid";
import { trpc } from "../../../lib/trpc";
import { cn } from "../../../lib/utils";
import { AgentIcon } from "../../ui/icons";
// Hook to detect narrow screen
function useIsNarrowScreen() {
	const [isNarrow, setIsNarrow] = createSignal(false);
	createEffect(() => {
		const checkWidth = () => {
			setIsNarrow(window.innerWidth <= 768);
		};
		checkWidth();
		window.addEventListener("resize", checkWidth);
		onCleanup(() => window.removeEventListener("resize", checkWidth));
	});
	return isNarrow;
}
interface FileAgent {
	name: string;
	description: string;
	prompt: string;
	tools?: string[];
	disallowedTools?: string[];
	model?: "sonnet" | "opus" | "haiku" | "inherit";
	source: "user" | "project";
	path: string;
}
export function AgentsCustomAgentsTab() {
	const isNarrowScreen = useIsNarrowScreen();
	const [expandedAgentName, setExpandedAgentName] = createSignal<string | null>(null);
	const { data: agents = [], isLoading } = trpc.agents.list.useQuery(undefined);
	const openInFinderMutation = trpc.external.openInFinder.useMutation();
	const userAgents = () => agents.filter((a: FileAgent) => a.source === "user");
	const projectAgents = () => agents.filter((a: FileAgent) => a.source === "project");
	const handleExpandAgent = (agentName: string) => {
		setExpandedAgentName(expandedAgentName() === agentName ? null : agentName);
	};
	const handleOpenInFinder = (path: string) => {
		openInFinderMutation.mutate(path);
	};
	return <div class="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
      {/* Header - hidden on narrow screens */}
      <Show when={!isNarrowScreen()}>
        <div class="flex flex-col space-y-1.5 text-center sm:text-left">
          <div class="flex items-center gap-2">
            <h3 class="text-sm font-semibold text-foreground">Custom Agents</h3>
            <span class="px-1.5 py-0.5 text-[10px] font-medium rounded bg-muted text-muted-foreground">
              Beta
            </span>
          </div>
          <a href="https://code.claude.com/docs/en/sub-agents" target="_blank" rel="noopener noreferrer" class="text-xs text-muted-foreground hover:text-foreground underline transition-colors">
            Documentation
          </a>
        </div>
      </Show>

      {/* Agents List */}
      <div class="space-y-4">
        <Show when={!isLoading} fallback={
          <div class="bg-background rounded-lg border border-border p-4 text-sm text-muted-foreground text-center">
            Loading agents...
          </div>
        }>
          <Show when={agents.length > 0} fallback={
            <div class="bg-background rounded-lg border border-border p-6 text-center">
              <AgentIcon class="h-8 w-8 text-muted-foreground/50 mx-auto mb-3" />
              <p class="text-sm text-muted-foreground mb-2">
                No custom agents found
              </p>
              <p class="text-xs text-muted-foreground">
                Add .md files to <code class="px-1 py-0.5 bg-muted rounded">~/.claude/agents/</code>
              </p>
            </div>
          }>
            {/* User Agents */}
            <Show when={userAgents().length > 0}>
              <div class="space-y-2">
                <div class="text-xs text-muted-foreground">
                  ~/.claude/agents/
                </div>
                <div class="bg-background rounded-lg border border-border overflow-hidden">
                  <div class="divide-y divide-border">
                    <For each={userAgents()}>
                      {(agent) => <AgentRow agent={agent} isExpanded={expandedAgentName() === agent.name} onToggle={() => handleExpandAgent(agent.name)} onOpenInFinder={() => handleOpenInFinder(agent.path)} />}
                    </For>
                  </div>
                </div>
              </div>
            </Show>

            {/* Project Agents */}
            <Show when={projectAgents().length > 0}>
              <div class="space-y-2">
                <div class="text-xs text-muted-foreground">
                  .claude/agents/
                </div>
                <div class="bg-background rounded-lg border border-border overflow-hidden">
                  <div class="divide-y divide-border">
                    <For each={projectAgents()}>
                      {(agent) => <AgentRow agent={agent} isExpanded={expandedAgentName() === agent.name} onToggle={() => handleExpandAgent(agent.name)} onOpenInFinder={() => handleOpenInFinder(agent.path)} />}
                    </For>
                  </div>
                </div>
              </div>
            </Show>
          </Show>
        </Show>
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
function AgentRow(props: {
	agent: FileAgent;
	isExpanded: boolean;
	onToggle: () => void;
	onOpenInFinder: () => void;
}) {
	return <div>
      <button onClick={props.onToggle} class="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/30 transition-colors">
        <ChevronRight class={cn("h-4 w-4 text-muted-foreground transition-transform flex-shrink-0", props.isExpanded && "rotate-90")} />
        <div class="flex flex-col space-y-0.5 min-w-0 flex-1">
          <span class="text-sm font-medium text-foreground truncate">
            {props.agent.name}
          </span>
          <Show when={props.agent.description}>
            <span class="text-xs text-muted-foreground truncate">
              {props.agent.description}
            </span>
          </Show>
        </div>
        <Show when={props.agent.model && props.agent.model !== "inherit"}>
          <span class="px-1.5 py-0.5 text-[10px] font-medium rounded bg-muted text-muted-foreground flex-shrink-0">
            {props.agent.model}
          </span>
        </Show>
      </button>

      <Show when={props.isExpanded}>
        <div class="overflow-hidden animate-expand">
          <div class="px-4 pb-4 pt-0 border-t border-border bg-muted/20">
            <div class="pt-3 space-y-3">
              {/* Path - clickable to open in Finder */}
              <div>
                <span class="text-xs font-medium text-foreground">Path</span>
                <button onClick={(e: MouseEvent) => {
                  e.stopPropagation();
                  props.onOpenInFinder();
                }} class="block text-xs text-muted-foreground font-mono mt-0.5 break-all text-left hover:text-foreground hover:underline transition-colors cursor-pointer">
                  {props.agent.path}
                </button>
              </div>

              {/* Tools */}
              <Show when={props.agent.tools && props.agent.tools.length > 0}>
                <div>
                  <span class="text-xs font-medium text-foreground">Allowed Tools</span>
                  <div class="flex flex-wrap gap-1 mt-1">
                    <For each={props.agent.tools}>
                      {(tool) => <span class="px-1.5 py-0.5 text-[10px] font-medium rounded bg-muted text-muted-foreground">
                        {tool}
                      </span>}
                    </For>
                  </div>
                </div>
              </Show>

              {/* Disallowed Tools */}
              <Show when={props.agent.disallowedTools && props.agent.disallowedTools.length > 0}>
                <div>
                  <span class="text-xs font-medium text-foreground">Disallowed Tools</span>
                  <div class="flex flex-wrap gap-1 mt-1">
                    <For each={props.agent.disallowedTools}>
                      {(tool) => <span class="px-1.5 py-0.5 text-[10px] font-medium rounded bg-muted text-muted-foreground">
                        {tool}
                      </span>}
                    </For>
                  </div>
                </div>
              </Show>
            </div>
          </div>
        </div>
      </Show>
    </div>;
 }
