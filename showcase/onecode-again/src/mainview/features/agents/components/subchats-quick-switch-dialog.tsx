import { createMemo, Show } from "solid-js";
import { Presence } from "solid-motionone";
import { Portal } from "solid-js/web";
import { cn } from "../../../lib/utils";
import { loadingSubChatsAtom, agentsSubChatUnseenChangesAtom, subChatFilesAtom, type SubChatFileChange } from "../atoms";
import { IconSpinner, PlanIcon, AgentIcon } from "../../../components/ui/icons";
import type { SubChatMeta } from "../stores/sub-chat-store";
import { formatTimeAgo } from "../utils/format-time-ago";
interface SubChatsQuickSwitchDialogProps {
	isOpen: boolean;
	subChats: SubChatMeta[];
	selectedIndex: number;
	onHover?: (index: number) => void;
}
// Sub-chat card for quick switch
function SubChatCard({ subChat, isSelected, isLoading, hasUnseenChanges, fileChanges, onMouseEnter }: {
	subChat: SubChatMeta;
	isSelected: boolean;
	isLoading: boolean;
	hasUnseenChanges: boolean;
	fileChanges: SubChatFileChange[];
	onMouseEnter?: () => void;
}) {
	const mode = subChat.mode || "agent";
	const timeAgo = formatTimeAgo(subChat.updated_at || subChat.created_at);
	// Calculate totals from file changes
	const stats = createMemo(() => {
		if (!fileChanges || fileChanges.length === 0) return null;
		let additions = 0;
		let deletions = 0;
		for (const file of fileChanges) {
			additions += file.additions;
			deletions += file.deletions;
		}
		return {
			fileCount: fileChanges.length,
			additions,
			deletions
		};
	});
	return <div onMouseEnter={onMouseEnter} class={cn("relative rounded-2xl overflow-hidden min-w-[160px] max-w-[180px] p-2 cursor-pointer", isSelected ? "bg-primary shadow-lg" : "bg-transparent")}>
      <div class="flex items-start gap-2.5">
        {	/* Mode icon with badge */}
        <div class="pt-0.5 relative flex-shrink-0 h-4 w-4">
          {mode === "plan" ? <PlanIcon class={cn("w-4 h-4", isSelected ? "text-primary-foreground" : "text-muted-foreground")} /> : <AgentIcon class={cn("w-4 h-4", isSelected ? "text-primary-foreground" : "text-muted-foreground")} />}
          { /* Badge in bottom-right corner */}
          {(isLoading || hasUnseenChanges) && <div class={cn("absolute -bottom-1 -right-1 w-3 h-3 rounded-full flex items-center justify-center", isSelected ? "bg-primary" : "bg-background")}>
              {isLoading ? <IconSpinner class={cn("w-2.5 h-2.5", isSelected ? "text-primary-foreground" : "text-muted-foreground")} /> : <div class="w-2 h-2 rounded-full bg-[#307BD0]" />}
            </div>}
        </div>
        <div class="flex-1 min-w-0 flex flex-col gap-0.5">
          { /* Sub-chat name */}
          <span class={cn("truncate block text-sm leading-tight", isSelected ? "text-primary-foreground" : "text-foreground")}>
            {subChat.name || "New Chat"}
          </span>
          { /* Time and stats */}
          <div class="flex items-center gap-1.5 text-[11px]">
            <span class={cn(isSelected ? "text-primary-foreground/60" : "text-muted-foreground/60")}>
              {timeAgo}
            </span>
            {stats && <>
                <span class={cn(isSelected ? "text-primary-foreground/40" : "text-muted-foreground/40")}>
                  ·
                </span>
                <span class={cn(isSelected ? "text-primary-foreground/60" : "text-muted-foreground/60")}>
                  {stats.fileCount} {stats.fileCount === 1 ? "file" : "files"}
                </span>
                {(stats.additions > 0 || stats.deletions > 0) && <>
                    <span class={cn(isSelected ? "text-primary-foreground/80" : "text-green-600 dark:text-green-400")}>
                      +{stats.additions}
                    </span>
                    <span class={cn(isSelected ? "text-primary-foreground/80" : "text-red-600 dark:text-red-400")}>
                      -{stats.deletions}
                    </span>
                  </>}
              </>}
          </div>
        </div>
      </div>
    </div>;
 }
export function SubChatsQuickSwitchDialog({ isOpen, subChats, selectedIndex, onHover }: SubChatsQuickSwitchDialogProps) {
	if (typeof window === "undefined") return null;
	// Derive loading sub-chat IDs
	const loadingSubChats = loadingSubChatsAtom[0];
	const loadingSubChatIds = createMemo(() => new Set([...loadingSubChats.keys()]));
	// Unseen changes
	const unseenChanges = agentsSubChatUnseenChangesAtom[0];
	// File changes per sub-chat
	const subChatFiles = subChatFilesAtom[0];
	return (
		<Portal>
			<Presence>
				<Show when={isOpen}>
					{/* Backdrop */}
					<div class="fixed inset-0 z-[10000]" />

					{/* Dialog */}
					<div class="fixed inset-0 flex items-center justify-center z-[10001] p-4 pointer-events-none">
						<div class="pointer-events-auto">
							<div class="max-w-5xl mx-auto">
								{/* Sub-chat List or Empty State */}
								{subChats.length === 0 ? (
									<div class="px-4 py-12 text-center bg-background rounded-xl border-[0.5px]">
										<p class="text-sm text-muted-foreground">
											No chats in this agent
										</p>
									</div>
								) : (
									<div class="flex gap-3 overflow-x-auto p-3 bg-background rounded-3xl border-[0.5px]" style={{ "box-shadow": "0 8px 32px 0 rgba(0,0,0,0.07), 0 0px 16px 0 rgba(0,0,0,0.04), 0 -8px 24px 0 rgba(0,0,0,0.03)" }}>
										{subChats.map((subChat, index) => {
											const isSelected = index === selectedIndex;
											const isLoading = loadingSubChatIds().has(subChat.id);
											const hasUnseenChanges = unseenChanges().has(subChat.id);
											const fileChanges = subChatFiles.get(subChat.id) || [];
											return <SubChatCard subChat={subChat} isSelected={isSelected} isLoading={isLoading} hasUnseenChanges={hasUnseenChanges} fileChanges={fileChanges} onMouseEnter={() => onHover?.(index)} />;
										})}
									</div>
								)}
							</div>
						</div>
					</div>
				</Show>
			</Presence>
		</Portal>
	);
}
