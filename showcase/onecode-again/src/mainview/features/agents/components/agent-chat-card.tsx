import { createMemo, createSignal, Show } from "solid-js";
import { mergeProps } from "solid-js";
import { cn } from "../../../lib/utils";
import { GitHubLogo, IconSpinner, PlanIcon, AgentIcon } from "../../../components/ui/canvas-icons";
import { agentsUnseenChangesAtom, lastChatModesAtom } from "../atoms";
// GitHub avatar with loading placeholder
function GitHubAvatar(props: {
	gitOwner: string;
	class?: string;
}) {
	const cls = props.class ?? "h-4 w-4";
	const [isLoaded, setIsLoaded] = createSignal(false);
	const [hasError, setHasError] = createSignal(false);
	const handleLoad = () => setIsLoaded(true);
	const handleError = () => setHasError(true);
	return <Show when={!hasError()} fallback={<GitHubLogo class={cn(cls, "text-muted-foreground flex-shrink-0")} />}>
		<div class={cn(cls, "relative flex-shrink-0")}>
			<Show when={!isLoaded()}>
				<div class="absolute inset-0 rounded-sm bg-muted" />
			</Show>
			<img src={`https://github.com/${props.gitOwner}.png?size=64`} alt={props.gitOwner} class={cn(cls, "rounded-sm flex-shrink-0", isLoaded() ? "opacity-100" : "opacity-0")} onLoad={handleLoad} onError={handleError} />
		</div>
	</Show>;
 }
interface AgentChatCardProps {
	chat: {
		id: string;
		name: string;
		meta: any;
		sandbox_id: string | null;
		branch?: string | null;
	};
	isSelected: boolean;
	isLoading: boolean;
	onClick?: () => void;
	onMouseEnter?: () => void;
	variant?: "sidebar" | "quick-switch";
	// Git info from project (passed from parent)
	gitOwner?: string | null;
	gitProvider?: string | null;
	repoName?: string | null;
}
// Chat icon with status badge
function ChatIconWithBadge(rawProps: {
	isLoading: boolean;
	hasUnseenChanges: boolean;
	lastMode: "plan" | "agent";
	isSelected?: boolean;
	gitOwner?: string | null;
	gitProvider?: string | null;
}) {
	const props = mergeProps({ isSelected: false }, rawProps);
	return <div class="relative flex-shrink-0 h-4 w-4">
      <Show when={props.gitOwner && props.gitProvider === "github"} fallback={<GitHubLogo class="h-4 w-4 flex-shrink-0 text-muted-foreground" />}>
        <GitHubAvatar gitOwner={props.gitOwner!} />
      </Show>
      {	/* Badge in bottom-right corner */}
      <div class={cn("absolute -bottom-1 -right-1 w-3 h-3 rounded-full flex items-center justify-center", props.isSelected ? "bg-primary" : "bg-background")}>
        <Show when={props.isLoading} fallback={<Show when={props.hasUnseenChanges} fallback={<Show when={props.lastMode === "plan"} fallback={<AgentIcon class={cn("w-2.5 h-2.5", props.isSelected ? "text-primary-foreground" : "text-muted-foreground")} />}>
          <PlanIcon class={cn("w-2.5 h-2.5", props.isSelected ? "text-primary-foreground" : "text-muted-foreground")} />
        </Show>}>
          <div class="w-2 h-2 rounded-full bg-[#307BD0]" />
        </Show>}>
          <IconSpinner class={cn("w-2.5 h-2.5", props.isSelected ? "text-primary-foreground" : "text-muted-foreground")} />
        </Show>
      </div>
    </div>;
 }
export function AgentChatCard(rawProps: AgentChatCardProps) {
	const props = mergeProps({ variant: "sidebar" as const }, rawProps);
	// Get status atoms
	const unseenChanges = agentsUnseenChangesAtom[0];
	const lastChatModes = lastChatModesAtom[0];
	const hasUnseenChanges = createMemo(() => unseenChanges().has(props.chat.id));
	const lastMode = createMemo(() => (lastChatModes().get(props.chat.id) || "agent") as "plan" | "agent");
	const displayRepoName = createMemo(() => props.repoName || "Local project");
	const displayText = createMemo(() => {
		const branch = props.chat.branch;
		return branch ? `${displayRepoName()} • ${branch}` : displayRepoName();
	});
	return <Show when={props.variant === "quick-switch"} fallback={
		<div onClick={props.onClick} class={cn("w-full text-left pl-2 pr-2 py-1.5 rounded-md transition-colors duration-150 cursor-pointer group relative", "outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70", props.isSelected ? "bg-foreground/5 text-foreground" : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground")}>
			<div class="flex items-start gap-2.5">
				<div class="pt-0.5">
					<ChatIconWithBadge isLoading={props.isLoading} hasUnseenChanges={hasUnseenChanges()} lastMode={lastMode()} isSelected={props.isSelected} gitOwner={props.gitOwner} gitProvider={props.gitProvider} />
				</div>
				<div class="flex-1 min-w-0">
					<span class="truncate block text-sm leading-tight">
						{props.chat.name || "Untitled Chat"}
					</span>
				</div>
			</div>
		</div>
	}>
		<div onClick={props.onClick} onMouseEnter={props.onMouseEnter} class={cn("relative rounded-2xl overflow-hidden min-w-[160px] max-w-[180px] p-2 cursor-pointer", props.isSelected ? "bg-primary shadow-lg" : "bg-transparent")}>
			<div class="flex items-start gap-2.5">
				<div class="pt-0.5">
					<ChatIconWithBadge isLoading={props.isLoading} hasUnseenChanges={hasUnseenChanges()} lastMode={lastMode()} isSelected={props.isSelected} gitOwner={props.gitOwner} gitProvider={props.gitProvider} />
				</div>
				<div class="flex-1 min-w-0 flex flex-col gap-0.5">
					<span class={cn("truncate block text-sm leading-tight", props.isSelected ? "text-primary-foreground" : "text-foreground")}>
						{props.chat.name || "Untitled Chat"}
					</span>
					<span class={cn("text-[11px] truncate", props.isSelected ? "text-primary-foreground/60" : "text-muted-foreground/60")}>
						{displayText()}
					</span>
				</div>
			</div>
		</div>
	</Show>;
}
