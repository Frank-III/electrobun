"use client";
import { createSignal } from "solid-js";
import { GitBranchFilledIcon, FolderFilledIcon, GitPullRequestFilledIcon } from "@/components/ui/icons";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { trpc } from "@/lib/trpc";
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
function PropertyRow({ icon: Icon, label, value, title, onClick, copyable, tooltip }: {
	icon: Component<{
		className?: string;
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
		if (copyable) {
			navigator.clipboard.writeText(value);
			setShowCopied(true);
			setTimeout(() => setShowCopied(false), 1500);
		} else if (onClick) {
			onClick();
		}
	};
	const isClickable = onClick || copyable;
	const valueSpan = <span class={`text-xs text-foreground ${isClickable ? "cursor-pointer hover:underline" : ""}`} title={!tooltip ? title : undefined} onClick={handleClick}>
      {value}
    </span>;
	return <div class="flex items-center min-h-[28px]">
      {	/* Label column - fixed width */}
      <div class="flex items-center gap-1.5 w-[100px] flex-shrink-0">
        <Icon class="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
        <span class="text-xs text-muted-foreground truncate">{label}</span>
      </div>
      { /* Value column - flexible */}
      <div class="flex-1 min-w-0 pl-2 truncate">
        {copyable ? <Tooltip open={showCopied ? true : undefined}>
            <TooltipTrigger asChild>
              {valueSpan}
            </TooltipTrigger>
            <TooltipContent side="top" class="text-xs">
              {showCopied ? "Copied" : "Click to copy"}
            </TooltipContent>
          </Tooltip> : tooltip ? <Tooltip>
            <TooltipTrigger asChild>
              {valueSpan}
            </TooltipTrigger>
            <TooltipContent side="top" class="text-xs">
              {tooltip}
            </TooltipContent>
          </Tooltip> : valueSpan}
      </div>
    </div>;
 }
/**
* Info Section for Details Sidebar
* Shows workspace info: branch, PR, path
* Memoized to prevent re-renders when parent updates
*/
export const InfoSection = memo(function InfoSection({ chatId, worktreePath, isExpanded = false, remoteInfo }: InfoSectionProps) {
	// Extract folder name from path
	const folderName = worktreePath?.split("/").pop() || "Unknown";
	// Mutation to open folder in Finder
	const openInFinderMutation = trpc.external.openInFinder.useMutation();
	// Check if this is a remote sandbox chat (no local worktree)
	const isRemoteChat = !worktreePath && !!remoteInfo;
	// Fetch branch data directly (only for local chats)
	const { data: branchData, isLoading: isBranchLoading } = trpc.changes.getBranches.useQuery({ worktreePath: worktreePath || "" }, { enabled: !!worktreePath });
	// Get PR status for current branch (only for local chats)
	const { data: prStatus } = trpc.chats.getPrStatus.useQuery({ chatId }, {
		refetchInterval: 3e4,
		enabled: !!chatId && !!worktreePath
	});
	// For local chats: use fetched branch data
	// For remote chats: use remoteInfo from props
	const branchName = isRemoteChat ? remoteInfo?.branch : branchData?.current;
	const pr = prStatus?.pr;
	// Extract repo name from repository URL (e.g., "owner/repo" from "github.com/owner/repo")
	const repositoryName = remoteInfo?.repository ? remoteInfo.repository.replace(/^https?:\/\/github\.com\//, "").replace(/\.git$/, "") : null;
	const handleOpenFolder = () => {
		if (worktreePath) {
			openInFinderMutation.mutate(worktreePath);
		}
	};
	const handleOpenPr = () => {
		if (pr?.url) {
			window.desktopApi.openExternal(pr.url);
		}
	};
	const handleOpenRepository = () => {
		if (remoteInfo?.repository) {
			const repoUrl = remoteInfo.repository.startsWith("http") ? remoteInfo.repository : `https://github.com/${remoteInfo.repository}`;
			window.desktopApi.openExternal(repoUrl);
		}
	};
	const handleOpenSandbox = () => {
		if (remoteInfo?.sandboxId) {
			const sandboxUrl = `https://3003-${remoteInfo.sandboxId}.e2b.app`;
			window.desktopApi.openExternal(sandboxUrl);
		}
	};
	// Show loading state while branch data is loading (only for local chats)
	if (!isRemoteChat && isBranchLoading) {
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
	const hasContent = branchName || worktreePath || repositoryName || remoteInfo?.sandboxId;
	if (!hasContent) {
		return <div class="px-2 py-2">
        <div class="text-xs text-muted-foreground">
          No workspace info available
        </div>
      </div>;
	}
	return <div class="px-2 py-1.5 flex flex-col gap-0.5">
      {	/* Repository - only for remote chats */}
      {repositoryName && <PropertyRow icon={FolderFilledIcon} label="Repository" value={repositoryName} title={remoteInfo?.repository} onClick={handleOpenRepository} tooltip="Open in GitHub" />}
      { /* Branch - for both local and remote */}
      {branchName && <PropertyRow icon={GitBranchFilledIcon} label="Branch" value={branchName} copyable />}
      { /* PR - only for local chats */}
      {pr && <PropertyRow icon={GitPullRequestFilledIcon} label="Pull Request" value={`#${pr.number}`} title={pr.title} onClick={handleOpenPr} tooltip="Open in GitHub" />}
      { /* Path - only for local chats */}
      {worktreePath && <PropertyRow icon={FolderFilledIcon} label="Path" value={folderName} title={worktreePath} onClick={handleOpenFolder} tooltip="Open in Finder" />}
    </div>;
 });
