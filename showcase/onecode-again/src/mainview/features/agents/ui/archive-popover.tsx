import type { JSX } from "solid-js";
import { createEffect, createMemo, createSignal, Show, For, Switch, Match } from "solid-js";
import { useQuery, useMutation, useQueryClient } from "@tanstack/solid-query";
import { desktopRpc } from "../../../lib/desktop-rpc";
import { archivePopoverOpenAtom, archiveSearchQueryAtom, selectedAgentChatIdAtom, selectedChatIsRemoteAtom } from "../atoms";
import { showWorkspaceIconAtom, chatSourceModeAtom } from "../../../lib/atoms";
import { useRemoteArchivedChats, useRestoreRemoteChat } from "../../../lib/hooks/use-remote-chats";
import { Input } from "../../../components/ui/input";
import { SearchIcon, ArchiveIcon, IconTextUndo, GitHubLogo, CloudIcon } from "../../../components/ui/icons";
import { Popover, PopoverContent, PopoverTrigger } from "../../../components/ui/popover";
import { cn } from "../../../lib/utils";
// GitHub avatar with loading placeholder
function GitHubAvatar(props: {
	gitOwner: string;
	class?: string;
}) {
	const cls = () => props.class ?? "h-4 w-4";
	const [isLoaded, setIsLoaded] = createSignal(false);
	const [hasError, setHasError] = createSignal(false);
	const handleLoad = () => setIsLoaded(true);
	const handleError = () => setHasError(true);
	if (hasError()) {
		return <GitHubLogo class={cn(cls(), "text-muted-foreground flex-shrink-0")} />;
	}
return <div class={cn(cls(), "relative flex-shrink-0")}>
      { /* Placeholder background while loading */}
      <Show when={!isLoaded()}>
        <div class="absolute inset-0 rounded-sm bg-muted" />
      </Show>
      <img src={`https://github.com/${props.gitOwner}.png?size=64`} alt={props.gitOwner} class={cn(cls(), "rounded-sm flex-shrink-0", isLoaded() ? "opacity-100" : "opacity-0")} onLoad={handleLoad} onError={handleError} />
    </div>;
 }
// Format relative time - moved outside component to avoid recreation
const formatTime = (dateInput: Date | string | number) => {
	const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffMins = Math.floor(diffMs / 6e4);
	const diffHours = Math.floor(diffMs / 36e5);
	const diffDays = Math.floor(diffMs / 864e5);
	if (diffMins < 1) return "now";
	if (diffMins < 60) return `${diffMins}m`;
	if (diffHours < 24) return `${diffHours}h`;
	if (diffDays < 7) return `${diffDays}d`;
	if (diffDays < 30) return `${Math.floor(diffDays / 7)}w`;
	if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo`;
	return `${Math.floor(diffDays / 365)}y`;
};
// Normalized chat type for archive popover (works with both local and remote chats)
interface NormalizedArchivedChat {
	id: string;
	name: string | null;
	branch: string | null;
	projectId: string | null;
	repository: string | null;
	gitOwner: string | null;
	gitProvider: string | null;
	updatedAt: Date | string | number | null;
	archivedAt: Date | string | number | null;
	isRemote: boolean;
}
// Memoized chat item component to prevent unnecessary re-renders
interface ArchiveChatItemProps {
	chat: NormalizedArchivedChat;
	index: number;
	isSelected: boolean;
	isCurrentChat: boolean;
	showIcon: boolean;
	projectsMap: Map<string, {
		gitOwner: string | null;
		gitRepo: string | null;
		gitProvider: string | null;
		name: string;
	}>;
	stats?: {
		additions: number;
		deletions: number;
	};
	onSelect: (id: string) => void;
	onRestore: (id: string) => void;
	setRef: (index: number, el: HTMLDivElement | null) => void;
}
function ArchiveChatItem({ chat, index, isSelected, isCurrentChat, showIcon, projectsMap, stats, onSelect, onRestore, setRef }: ArchiveChatItemProps) {
	const branch = chat.branch;
	// For local chats, use projectsMap; for remote chats, use chat properties directly
	const project = chat.projectId ? projectsMap.get(chat.projectId) : null;
	const gitOwner = chat.gitOwner || project?.gitOwner;
	const gitRepo = chat.repository || project?.gitRepo;
	const gitProvider = chat.gitProvider || project?.gitProvider;
	const isGitHubRepo = gitProvider === "github" && !!gitOwner;
	const repoName = gitRepo || project?.name;
	const displayText = branch ? repoName ? `${repoName} • ${branch}` : branch : repoName || "Local project";
	const handleClick = () => {
		onSelect(chat.id);
	};
	const handleRestore = (e: MouseEvent) => {
		e.stopPropagation();
		onRestore(chat.id);
	};
	const handleRef = (el: HTMLDivElement | null) => {
		setRef(index, el);
	};
	return <div ref={handleRef} onClick={handleClick} class={cn("w-[calc(100%-8px)] mx-1 text-left min-h-[32px] py-[5px] px-1.5 rounded-md transition-colors duration-75 cursor-pointer group relative", "outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70", isSelected || isCurrentChat ? "dark:bg-neutral-800 bg-accent text-foreground" : "text-muted-foreground dark:hover:bg-neutral-800 hover:bg-accent hover:text-foreground")}>
      <div class="flex items-start gap-2.5">
        <Show when={showIcon}>
            <div class="pt-0.5">
              <Show when={isGitHubRepo && gitOwner} fallback={<GitHubLogo class={cn("h-4 w-4 flex-shrink-0 transition-colors duration-75", isSelected ? "text-foreground" : "text-muted-foreground")} />}>
                <GitHubAvatar gitOwner={gitOwner!} />
              </Show>
            </div>
          </Show>
        <div class="flex-1 min-w-0 flex flex-col gap-0.5">
          <div class="flex items-center gap-1">
            <span class="truncate block text-sm leading-tight flex-1">
              {chat.name || <span class="text-muted-foreground/50">
                  New workspace
                </span>}
            </span>
            <button onClick={handleRestore} class="flex-shrink-0 text-muted-foreground hover:text-foreground active:text-foreground transition-[color,transform] duration-150 ease-out active:scale-[0.97]" aria-label="Restore chat">
              <IconTextUndo class="h-3 w-3" />
            </button>
          </div>
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-1 text-[11px] text-muted-foreground/60 truncate min-w-0">
              { /* Cloud icon for remote chats */}
              <Show when={chat.isRemote}>
                <CloudIcon class="h-2.5 w-2.5 flex-shrink-0" />
              </Show>
              <span class="truncate">{displayText}</span>
            </div>
            <div class="flex items-center gap-1.5 flex-shrink-0 text-[11px]">
              <Show when={stats && (stats.additions > 0 || stats.deletions > 0)}>
                  <span class="text-green-600 dark:text-green-400">+{stats!.additions}</span>
                  <span class="text-red-600 dark:text-red-400">-{stats!.deletions}</span>
                </Show>
              <span class="text-muted-foreground/60">
                {formatTime(chat.updatedAt ?? new Date())}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>;
}
// Desktop: uses project info for git owner/provider
interface ArchivePopoverProps {
	trigger: JSX.Element;
}
export function ArchivePopover({ trigger }: ArchivePopoverProps) {
	const [open, setOpen] = archivePopoverOpenAtom;
	const [searchQuery, setSearchQuery] = archiveSearchQueryAtom;
	const [selectedIndex, setSelectedIndex] = createSignal(0);
	const [searchInputRef, setSearchInputRef] = createSignal<HTMLInputElement | null>(null);
	const [popoverContentRef, setPopoverContentRef] = createSignal<HTMLDivElement | null>(null);
	const [chatItemRefs, setChatItemRefs] = createSignal<(HTMLDivElement | null)[]>([]);
	const [selectedChatId, setSelectedChatId] = selectedAgentChatIdAtom;
	const [selectedChatIsRemote, setSelectedChatIsRemote] = selectedChatIsRemoteAtom;
	const setChatSourceMode = chatSourceModeAtom[1];
	const showWorkspaceIcon = showWorkspaceIconAtom[0];
	const queryClient = useQueryClient();
	// Local archived chats (always fetch)
	const localArchivedQuery = useQuery(() => ({
		queryKey: ["chats", "listArchived"] as const,
		queryFn: () => desktopRpc.chats.listArchived.query(),
		enabled: open(),
	}));
	// Remote archived chats (always fetch)
	const remoteArchivedQuery = useRemoteArchivedChats();
	// Loading if either is loading
	const isLoading = () => localArchivedQuery.isLoading || remoteArchivedQuery.isLoading;
	// Fetch all projects for git info (for local chats)
	const projectsQuery = useQuery(() => ({
		queryKey: ["projects", "list"] as const,
		queryFn: () => desktopRpc.projects.list.query(),
	}));
	// Collect chat IDs for file stats query (only local chats)
	const archivedChatIds = createMemo(() => {
		const list = localArchivedQuery.data;
		if (!list) return [];
		return list.map((chat) => chat.id);
	});
	// Fetch file stats for archived local chats
	const fileStatsQuery = useQuery(() => ({
		queryKey: ["chats", "getFileStats", archivedChatIds()] as const,
		queryFn: () => desktopRpc.chats.getFileStats({ chatIds: archivedChatIds() }),
		enabled: open() && archivedChatIds().length > 0,
	}));
	// Create map for quick project lookup by id
	const projectsMap = createMemo(() => {
		const proj = projectsQuery.data;
		if (!proj) return new Map();
		return new Map(proj.map((p) => [p.id, p]));
	});
	// Create map for quick file stats lookup by chat id
	const fileStatsMap = createMemo(() => {
		const data = fileStatsQuery.data;
		if (!data) return new Map<string, { additions: number; deletions: number }>();
		return new Map(data.map((s) => [s.chatId, { additions: s.additions, deletions: s.deletions }]));
	});
	// Local restore mutation
	const localRestoreMutation = useMutation(() => ({
		mutationFn: (input: { id: string }) => desktopRpc.chats.restore.mutate(input),
		onSuccess: (restoredChat) => {
			if (restoredChat && queryClient) {
				queryClient.setQueryData(["chats", "list"], (oldData: Array<{ id: string }> | undefined) => {
					if (!oldData) return [restoredChat];
					if (oldData.some((c) => c.id === restoredChat.id)) return oldData;
					return [restoredChat, ...oldData];
				});
			}
			void queryClient?.invalidateQueries({ queryKey: ["chats", "list"] });
			void queryClient?.invalidateQueries({ queryKey: ["chats", "listArchived"] });
		},
	}));
	// Remote restore mutation
	const remoteRestoreMutation = useRestoreRemoteChat();
	// Normalize and merge archived chats from both sources
	const normalizedChats = createMemo((): NormalizedArchivedChat[] => {
		const merged: NormalizedArchivedChat[] = [];
		const local = localArchivedQuery.data;
		// Add local chats
		if (local) {
			for (const chat of local) {
				merged.push({
					id: chat.id,
					name: chat.name ?? null,
					branch: chat.branch ?? null,
					projectId: chat.projectId ?? null,
					repository: null,
					gitOwner: null,
					gitProvider: null,
					updatedAt: chat.updatedAt ?? null,
					archivedAt: chat.archivedAt ?? null,
					isRemote: false
				});
			}
		}
		// Add remote chats with prefixed IDs
		const remoteChats = remoteArchivedQuery.data;
		if (remoteChats) {
			for (const chat of remoteChats) {
				const meta = chat.meta;
				const repository = meta?.repository;
				const gitOwner = repository?.split("/")[0] ?? null;
				merged.push({
					id: `remote_${chat.id}`,
					name: chat.name,
					branch: meta?.branch ?? null,
					projectId: null,
					repository: repository ?? null,
					gitOwner,
					gitProvider: repository ? "github" : null,
					updatedAt: chat.updated_at,
					archivedAt: ((chat as unknown) as {
						archived_at?: string;
					}).archived_at ?? null,
					isRemote: true
				});
			}
		}
		return merged;
	});
	// Filter and sort archived chats (always newest first)
	const filteredChats = createMemo(() => {
		const query = searchQuery();
		return normalizedChats().filter((chat) => {
			// Search filter by name only
			if (query.trim() && !(chat.name ?? "").toLowerCase().includes(query.toLowerCase())) {
				return false;
			}
			return true;
		}).sort((a, b) => {
			const aTime = a.archivedAt ? new Date(a.archivedAt).getTime() : 0;
			const bTime = b.archivedAt ? new Date(b.archivedAt).getTime() : 0;
			return bTime - aTime;
		});
	});
	// Clear search query and sync selected index when popover opens
	createEffect(() => {
		if (open()) {
			setSearchQuery("");
			setTimeout(() => {
				searchInputRef()?.focus();
			}, 0);
		}
	});
	// Sync selected index with filtered chats
	createEffect(() => {
		if (open() && filteredChats().length > 0) {
			// Find index of currently selected chat, default to 0 if not found
			const currentIndex = filteredChats().findIndex((chat) => chat.id === selectedChatId());
			setSelectedIndex(currentIndex >= 0 ? currentIndex : 0);
		}
	});
	// Keyboard navigation - memoized to prevent recreation
	const handleKeyDown = (e: KeyboardEvent) => {
		const chats = filteredChats();
		if (chats.length === 0) return;
		if (e.key === "ArrowDown") {
			e.preventDefault();
			setSelectedIndex((prev) => (prev + 1) % chats.length);
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setSelectedIndex((prev) => (prev - 1 + chats.length) % chats.length);
		} else if (e.key === "Enter") {
			e.preventDefault();
			const chat = chats[selectedIndex()];
			if (chat) {
				if (chat.isRemote) {
					// Extract original ID from prefixed remote ID
					const originalId = chat.id.replace(/^remote_/, "");
					remoteRestoreMutation.mutate(originalId, { onSuccess: () => {
						setSelectedChatId(originalId);
						setSelectedChatIsRemote(true);
						setChatSourceMode("sandbox");
					} });
				} else {
					localRestoreMutation.mutate({ id: chat.id });
					setSelectedChatId(chat.id);
					setSelectedChatIsRemote(false);
					setChatSourceMode("local");
				}
				setOpen(false);
			}
		}
	};
	// Reset selected index and clear refs when search changes
	createEffect(() => {
		setSelectedIndex(0);
		setChatItemRefs([]);
	});
	// Scroll selected item into view
	createEffect(() => {
		const selectedElement = chatItemRefs()[selectedIndex()];
		if (selectedElement) {
			selectedElement.scrollIntoView({
				block: "nearest",
				behavior: "smooth"
			});
		}
	});
	// Auto-close popover when archive becomes empty
	createEffect(() => {
		if (open() && normalizedChats() && normalizedChats()!.length === 0) {
			setOpen(false);
		}
	});
	// Memoized callbacks for chat items
	const handleSelectChat = (id: string) => {
		const isRemote = id.startsWith("remote_");
		const originalId = isRemote ? id.replace(/^remote_/, "") : id;
		setSelectedChatId(originalId);
		setSelectedChatIsRemote(isRemote);
		// Sync chatSourceMode for ChatView to load data from correct source
		setChatSourceMode(isRemote ? "sandbox" : "local");
	};
	const handleRestoreChat = (id: string) => {
		// Check if this is a remote chat by its prefixed ID
		const isRemote = id.startsWith("remote_");
		if (isRemote) {
			// Extract original ID from prefixed remote ID
			const originalId = id.replace(/^remote_/, "");
			remoteRestoreMutation.mutate(originalId, { onSuccess: () => {
				setSelectedChatId(originalId);
				setSelectedChatIsRemote(true);
				setChatSourceMode("sandbox");
			} });
		} else {
			localRestoreMutation.mutate({ id });
			setSelectedChatId(id);
			setSelectedChatIsRemote(false);
			setChatSourceMode("local");
		}
	};
	const handleSetRef = (index: number, el: HTMLDivElement | null) => {
		setChatItemRefs((prev) => {
			const next = [...prev];
			next[index] = el;
			return next;
		});
	};
	// Memoized search input handler
	const handleSearchChange = (e: InputEvent & { currentTarget: HTMLInputElement }) => {
		setSearchQuery(e.currentTarget.value);
	};
	return <Popover open={open()} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent ref={setPopoverContentRef} side="right" align="end" sideOffset={8} forceDark={false} class="w-[250px] h-[400px] p-0 flex flex-col overflow-hidden" onKeyDown={handleKeyDown} tabIndex={-1}>
        {	/* Search */}
        <div class="p-1 border-b">
          <div class="relative flex items-center gap-1.5 h-7 px-1.5 rounded-md bg-muted/50">
            <SearchIcon class="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <Input ref={setSearchInputRef} placeholder="Search..." value={searchQuery()} onInput={handleSearchChange} class="h-auto p-0 border-0 bg-transparent text-sm placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0" />
          </div>
        </div>

        { /* Archived Chats List */}
        <div class="flex-1 overflow-y-auto py-1">
          <Switch>
            <Match when={isLoading()}>
              <div class="flex items-center justify-center p-8 text-muted-foreground text-sm">
                Loading...
              </div>
            </Match>
            <Match when={filteredChats().length === 0}>
              <div class="flex flex-col items-center justify-center h-full text-center">
                <ArchiveIcon class="h-6 w-6 mb-2 text-muted-foreground opacity-40" />
                <p class="text-xs text-muted-foreground opacity-40 pb-10">
                  No archived agents
                </p>
              </div>
            </Match>
            <Match when={filteredChats().length > 0}>
              <For each={filteredChats()}>{(chat, index) => {
                const chatOriginalId = chat.isRemote ? chat.id.replace(/^remote_/, "") : chat.id;
                const isCurrentChat = () => selectedChatId() === chatOriginalId && selectedChatIsRemote() === chat.isRemote;
                return <ArchiveChatItem chat={chat} index={index()} isSelected={index() === selectedIndex()} isCurrentChat={isCurrentChat()} showIcon={showWorkspaceIcon()} projectsMap={projectsMap()} stats={fileStatsMap().get(chat.id)} onSelect={handleSelectChat} onRestore={handleRestoreChat} setRef={handleSetRef} />;
              }}</For>
            </Match>
          </Switch>
        </div>
      </PopoverContent>
    </Popover>;
}
