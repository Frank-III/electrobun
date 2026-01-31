import { createSignal, createEffect, Show, For, onCleanup } from "solid-js";
import { ChevronRight } from "lucide-solid";
import { useQuery, useMutation } from "@tanstack/solid-query";
import { desktopRpc } from "../../../lib/desktop-rpc";
import { cn } from "../../../lib/utils";
import { SkillIcon } from "../../ui/icons";
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
interface Skill {
	name: string;
	description: string;
	source: "user" | "project";
	path: string;
}
export function AgentsSkillsTab() {
	const isNarrowScreen = useIsNarrowScreen();
	const [expandedSkillName, setExpandedSkillName] = createSignal<string | null>(null);
	const skillsQuery = useQuery(() => ({
		queryKey: ["skills", "list"],
		queryFn: () => desktopRpc.skills.list({}),
	}));
	const skills = () => skillsQuery.data ?? [];
	const isLoading = () => skillsQuery.isLoading;
	const openInFinderMutation = useMutation(() => ({
		mutationFn: (input: { path: string }) =>
			desktopRpc.external.openInFinder.mutate(input),
	}));
	const userSkills = () => (skills() ?? []).filter((s: Skill) => s.source === "user");
	const projectSkills = () => (skills() ?? []).filter((s: Skill) => s.source === "project");
	const handleExpandSkill = (skillName: string) => {
		setExpandedSkillName(expandedSkillName() === skillName ? null : skillName);
	};
	const handleOpenInFinder = (path: string) => {
		openInFinderMutation.mutate({ path });
	};
	return <div class="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
      {/* Header - hidden on narrow screens */}
      <Show when={!isNarrowScreen()}>
        <div class="flex flex-col space-y-1.5 text-center sm:text-left">
          <div class="flex items-center gap-2">
            <h3 class="text-sm font-semibold text-foreground">Skills</h3>
            <span class="px-1.5 py-0.5 text-[10px] font-medium rounded bg-muted text-muted-foreground">
              Beta
            </span>
          </div>
          <a href="https://code.claude.com/docs/en/skills" target="_blank" rel="noopener noreferrer" class="text-xs text-muted-foreground hover:text-foreground underline transition-colors">
            Documentation
          </a>
        </div>
      </Show>

      {/* Skills List */}
      <div class="space-y-4">
        <Show when={!isLoading()} fallback={
          <div class="bg-background rounded-lg border border-border p-4 text-sm text-muted-foreground text-center">
            Loading skills...
          </div>
        }>
          <Show when={skills().length > 0} fallback={
            <div class="bg-background rounded-lg border border-border p-6 text-center">
              <SkillIcon class="h-8 w-8 text-muted-foreground/50 mx-auto mb-3" />
              <p class="text-sm text-muted-foreground mb-2">
                No skills found
              </p>
              <p class="text-xs text-muted-foreground">
                Add skills to <code class="px-1 py-0.5 bg-muted rounded">~/.claude/skills/</code> or <code class="px-1 py-0.5 bg-muted rounded">.claude/skills/</code>
              </p>
            </div>
          }>
            {/* User Skills */}
            <Show when={userSkills().length > 0}>
              <div class="space-y-2">
                <div class="text-xs text-muted-foreground">
                  ~/.claude/skills/
                </div>
                <div class="bg-background rounded-lg border border-border overflow-hidden">
                  <div class="divide-y divide-border">
                    <For each={userSkills()}>
                      {(skill) => <SkillRow skill={skill} isExpanded={expandedSkillName() === skill.name} onToggle={() => handleExpandSkill(skill.name)} onOpenInFinder={() => handleOpenInFinder(skill.path)} />}
                    </For>
                  </div>
                </div>
              </div>
            </Show>

            {/* Project Skills */}
            <Show when={projectSkills().length > 0}>
              <div class="space-y-2">
                <div class="text-xs text-muted-foreground">
                  .claude/skills/
                </div>
                <div class="bg-background rounded-lg border border-border overflow-hidden">
                  <div class="divide-y divide-border">
                    <For each={projectSkills()}>
                      {(skill) => <SkillRow skill={skill} isExpanded={expandedSkillName() === skill.name} onToggle={() => handleExpandSkill(skill.name)} onOpenInFinder={() => handleOpenInFinder(skill.path)} />}
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
            How to use Skills
          </h4>
          <p class="text-xs text-muted-foreground">
            Mention a skill in chat with <code class="px-1 py-0.5 bg-muted rounded">@skill-name</code> or ask Claude to use it directly.
          </p>
        </div>
        <div>
          <h4 class="text-xs font-medium text-foreground mb-1.5">
            Creating Skills
          </h4>
          <p class="text-xs text-muted-foreground">
            Create a folder with a <code class="px-1 py-0.5 bg-muted rounded">SKILL.md</code> file in <code class="px-1 py-0.5 bg-muted rounded">~/.claude/skills/your-skill/</code>
          </p>
        </div>
      </div>
    </div>;
}
function SkillRow(props: {
	skill: {
		name: string;
		description: string;
		source: "user" | "project";
		path: string;
	};
	isExpanded: boolean;
	onToggle: () => void;
	onOpenInFinder: () => void;
}) {
	return <div>
      <button onClick={props.onToggle} class="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/30 transition-colors">
        <ChevronRight class={cn("h-4 w-4 text-muted-foreground transition-transform flex-shrink-0", props.isExpanded && "rotate-90")} />
        <div class="flex flex-col space-y-0.5 min-w-0 flex-1">
          <span class="text-sm font-medium text-foreground truncate">
            {props.skill.name}
          </span>
          <Show when={props.skill.description}>
            <span class="text-xs text-muted-foreground truncate">
              {props.skill.description}
            </span>
          </Show>
        </div>
      </button>

      <Show when={props.isExpanded}>
        <div class="overflow-hidden skill-expand-animation">
          <div class="px-4 pb-4 pt-0 border-t border-border bg-muted/20">
            <div class="pt-3 space-y-2">
              <div>
                <span class="text-xs font-medium text-foreground">Path</span>
                <button onClick={(e: MouseEvent) => {
                  e.stopPropagation();
                  props.onOpenInFinder();
                }} class="block text-xs text-muted-foreground font-mono mt-0.5 break-all text-left hover:text-foreground hover:underline transition-colors cursor-pointer">
                  {props.skill.path}
                </button>
              </div>
              <div>
                <span class="text-xs font-medium text-foreground">Usage</span>
                <p class="text-xs text-muted-foreground mt-0.5">
                  Type <code class="px-1 py-0.5 bg-muted rounded">@{props.skill.name}</code> in chat or ask Claude to use the {props.skill.name} skill.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Show>
    </div>;
}
