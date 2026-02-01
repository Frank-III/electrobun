import { createSignal, Show, Switch, Match } from "solid-js";
import { GitBranchFilledIcon, FolderFilledIcon, GitPullRequestFilledIcon } from "@/components/ui/icons";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useQuery, useMutation } from "@tanstack/solid-query";
import { desktopRpc } from "@/lib/desktop-rpc";
interface InfoSectionProps {
	chatId: string;
	worktreePath: string | null;
	isExpanded?: boolean;
	/** Remote chat data for sandbox workspaces */
	remoteInfo?: {
		repository?: string;
		branch?: string | null;
		sandboxId?: string;
	} | null;
}
/** Property row component - Notion-style with icon, label, and value */
function PropertyRow(props: {
	icon: Component<{
		class?: string;
	}>;
	label: string;
	value: string;
	title?: string;
	onClick?: () => void;
	copyable?: boolean;
	/** Tooltip to show on hover (for clickable items) */
	tooltip?: string;
}) {
	const [showCopied, setShowCopied] = createSignal(false);
	const handleClick = () => {
		if (props.copyable) {
			navigator.clipboard.writeText(props.value);
			setShowCopied(true);
			setTimeout(() => setShowCopied(false), 1500);
		} else if (props.onClick) {
			props.onClick();
		}
	};
	const isClickable = props.onClick || props.copyable;
	const valueSpan = <span class={`text-xs text-foreground ${isClickable ? "cursor-pointer hover:underline" : ""}`} title={!props.tooltip ? props.title : undefined} onClick={handleClick}>
      {props.value}
    </span>;
	return <div class="flex items-center min-h-[28px]">
      {	/* Label column - fixed width */}
      <div class="flex items-center gap-1.5 w-[100px] flex-shrink-0">
        <props.icon class="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
        <span class="text-xs text-muted-foreground truncate">{props.label}</span>
      </div>
      { /* Value column - flexible */}
      <div class="flex-1 min-w-0 pl-2 truncate">
        <Show when={props.copyable}>
            <Tooltip open={showCopied() ? true : undefined}>
              <TooltipTrigger asChild>
                {valueSpan}
              </TooltipTrigger>
              <TooltipContent side="top" class="text-xs">
                {showCopied() ? "Copied" : "Click to copy"}
              </TooltipContent>
            </Tooltip>
          </Show>
        <Show when={!props.copyable && props.tooltip}>
            <Tooltip>
              <TooltipTrigger asChild>
                {valueSpan}
              </TooltipTrigger>
              <TooltipContent side="top" class="text-xs">
                {props.tooltip}
              </TooltipContent>
            </Tooltip>
          </Show>
        <Show when={!props.copyable && !props.tooltip}>
            {valueSpan}
          </Show>
      </div>
    </div>;
 }
/**
* Info Section for Details Sidebar
* Shows workspace info: branch, PR, path
* Memoized to prevent re-renders when parent updates
*/
export function InfoSection(props: InfoSectionProps) {
	// Extract folder name from path
	const folderName = () => props.worktreePath?.split("/").pop() || "Unknown";
	// Mutation to open folder in Finder
	const openInFinderMutation = useMutation(() => ({
		mutationFn: (path: string) => desktopRpc.external.openInFinder.mutate({ path }),
	}));
	// Check if this is a remote sandbox chat (no local worktree)
	const isRemoteChat = () => !props.worktreePath && !!props.remoteInfo;
	// Fetch branch data directly (only for local chats)
	const branchQuery = useQuery(() => ({
		queryKey: ["changes", "getBranches", props.worktreePath] as const,
		queryFn: () => desktopRpc.changes.getBranches({ worktreePath: props.worktreePath || "" }),
		enabled: !!props.worktreePath,
	}));
	const branchData = () => branchQuery.data;
	const isBranchLoading = () => branchQuery.isLoading;
	// Get PR status for current branch (only for local chats)
	const prStatusQuery = useQuery(() => ({
		queryKey: ["chats", "getPrStatus", props.chatId] as const,
		queryFn: () => desktopRpc.chats.getPrStatus({ chatId: props.chatId }),
		refetchInterval: 3e4,
		enabled: !!props.chatId && !!props.worktreePath,
	}));
	const prStatus = () => prStatusQuery.data;
	// For local chats: use fetched branch data
	// For remote chats: use remoteInfo from props
	const branchName = () => (isRemoteChat() ? props.remoteInfo?.branch : branchData()?.current);
	const pr = () => prStatus()?.pr;
	// Extract repo name from repository URL (e.g., "owner/repo" from "github.com/owner/repo")
	const repositoryName = () => props.remoteInfo?.repository ? props.remoteInfo.repository.replace(/^https?:\/\/github\.com\//, "").replace(/\.git$/, "") : null;
	const handleOpenFolder = () => {
		if (props.worktreePath) {
			openInFinderMutation.mutate(props.worktreePath);
		}
	};
	const handleOpenPr = () => {
		const prData = pr();
		if (prData?.url) {
			window.desktopApi.openExternal(prData.url);
		}
	};
	const handleOpenRepository = () => {
		if (props.remoteInfo?.repository) {
			const repoUrl = props.remoteInfo.repository.startsWith("http") ? props.remoteInfo.repository : `https://github.com/${props.remoteInfo.repository}`;
			window.desktopApi.openExternal(repoUrl);
		}
	};
	const handleOpenSandbox = () => {
		if (props.remoteInfo?.sandboxId) {
			const sandboxUrl = `https://3003-${props.remoteInfo.sandboxId}.e2b.app`;
			window.desktopApi.openExternal(sandboxUrl);
		}
	};
	// Show loading state while branch data is loading (only for local chats)
	if (!isRemoteChat() && isBranchLoading()) {
		return <div class="px-2 py-1.5 flex flex-col gap-0.5">
        <div class="flex items-center min-h-[28px]">
          <div class="flex items-center gap-1.5 w-[100px] flex-shrink-0">
            <div class="h-3.5 w-3.5 rounded bg-muted animate-pulse" />
            <div class="h-3 w-12 rounded bg-muted animate-pulse" />
          </div>
          <div class="flex-1 min-w-0 pl-2">
            <div class="h-3 w-32 rounded bg-muted animate-pulse" />
          </div>
        </div>
        <div class="flex items-center min-h-[28px]">
          <div class="flex items-center gap-1.5 w-[100px] flex-shrink-0">
            <div class="h-3.5 w-3.5 rounded bg-muted animate-pulse" />
            <div class="h-3 w-8 rounded bg-muted animate-pulse" />
          </div>
          <div class="flex-1 min-w-0 pl-2">
            <div class="h-3 w-24 rounded bg-muted animate-pulse" />
          </div>
        </div>
      </div>;
	}
	const hasContent = () => branchName() || props.worktreePath || repositoryName() || props.remoteInfo?.sandboxId;
	if (!hasContent()) {
		return <div class="px-2 py-2">
        <div class="text-xs text-muted-foreground">
          No workspace info available
        </div>
      </div>;
	}
	return <div class="px-2 py-1.5 flex flex-col gap-0.5">
      {	/* Repository - only for remote chats */}
      <Show when={repositoryName()}>
        <PropertyRow icon={FolderFilledIcon} label="Repository" value={repositoryName()!} title={props.remoteInfo?.repository} onClick={handleOpenRepository} tooltip="Open in GitHub" />
      </Show>
      <Show when={branchName()}>
        <PropertyRow icon={GitBranchFilledIcon} label="Branch" value={branchName()!} copyable />
      </Show>
      <Show when={pr()}>
        <PropertyRow icon={GitPullRequestFilledIcon} label="Pull Request" value={`#${pr()!.number}`} title={pr()!.title} onClick={handleOpenPr} tooltip="Open in GitHub" />
      </Show>
      <Show when={props.worktreePath}>
        <PropertyRow icon={FolderFilledIcon} label="Path" value={folderName()} title={props.worktreePath ?? undefined} onClick={handleOpenFolder} tooltip="Open in Finder" />
      </Show>
    </div>;
}
