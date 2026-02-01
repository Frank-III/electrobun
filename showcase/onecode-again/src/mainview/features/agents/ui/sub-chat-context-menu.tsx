import { desktopRpc } from "../../../lib/desktop-rpc";
import { createMemo, Show, mergeProps, splitProps } from "solid-js";
import { ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuSub, ContextMenuSubTrigger, ContextMenuSubContent } from "../../../components/ui/context-menu";
import { Kbd } from "../../../components/ui/kbd";
import { isMac } from "../../../lib/utils";
import { isDesktopApp } from "../../../lib/utils/platform";
import type { SubChatMeta } from "../stores/sub-chat-store";
import { useResolvedHotkeyDisplay } from "../../../lib/hotkeys";
import { exportChat, copyChat, type ExportFormat } from "../lib/export-chat";
const openInNewWindow = (chatId: string, subChatId: string) => {
	// TODO: Handle via BrowserWindow "newWindowOpen" event
	console.log("Open in new window:", chatId, subChatId)
};
// Platform-aware keyboard shortcut for close tab
// Uses custom hotkey from settings if configured
const useCloseTabShortcut = () => {
	const archiveAgentHotkey = useResolvedHotkeyDisplay("archive-agent");
	return createMemo(() => {
		if (!isMac) return "Alt+Ctrl+W";
		return archiveAgentHotkey || "⌘W";
	});
};
interface SubChatContextMenuProps {
	subChat: SubChatMeta;
	isPinned: boolean;
	onTogglePin: (subChatId: string) => void;
	onRename: (subChat: SubChatMeta) => void;
	onArchive: (subChatId: string) => void;
	onArchiveOthers: (subChatId: string) => void;
	onArchiveAllBelow?: (subChatId: string) => void;
	isOnlyChat: boolean;
	currentIndex?: number;
	totalCount?: number;
	showCloseTabOptions?: boolean;
	onCloseTab?: (subChatId: string) => void;
	onCloseOtherTabs?: (subChatId: string) => void;
	onCloseTabsToRight?: (subChatId: string, visualIndex: number) => void;
	visualIndex?: number;
	hasTabsToRight?: boolean;
	canCloseOtherTabs?: boolean;
	/** Parent chat ID for export functionality */
	chatId?: string | null;
}
export function SubChatContextMenu(props: SubChatContextMenuProps) {
	const merged = mergeProps({ showCloseTabOptions: false, visualIndex: 0, hasTabsToRight: false, canCloseOtherTabs: false }, props);
	const [local] = splitProps(merged, ["subChat", "isPinned", "onTogglePin", "onRename", "onArchive", "onArchiveOthers", "onArchiveAllBelow", "isOnlyChat", "currentIndex", "totalCount", "showCloseTabOptions", "onCloseTab", "onCloseOtherTabs", "onCloseTabsToRight", "visualIndex", "hasTabsToRight", "canCloseOtherTabs", "chatId"]);
	const closeTabShortcut = useCloseTabShortcut();
	const handleExport = (format: ExportFormat) => {
		if (!local.chatId) return;
		exportChat({
			chatId: local.chatId,
			subChatId: local.subChat.id,
			format
		});
	};
	const handleCopy = (format: ExportFormat) => {
		if (!local.chatId) return;
		copyChat({
			chatId: local.chatId,
			subChatId: local.subChat.id,
			format
		});
	};
	return <ContextMenuContent class="w-48">
	      <ContextMenuItem onClick={() => local.onTogglePin(local.subChat.id)}>
	        {local.isPinned ? "Unpin chat" : "Pin chat"}
	      </ContextMenuItem>
	      <ContextMenuItem onClick={() => local.onRename(local.subChat)}>
	        Rename chat
	      </ContextMenuItem>
	      <Show when={local.chatId}>
	          <ContextMenuSub>
	            <ContextMenuSubTrigger>Export chat</ContextMenuSubTrigger>
	            <ContextMenuSubContent sideOffset={6} alignOffset={-4}>
              <ContextMenuItem onClick={() => handleExport("markdown")}>
                Download as Markdown
              </ContextMenuItem>
              <ContextMenuItem onClick={() => handleExport("json")}>
                Download as JSON
              </ContextMenuItem>
              <ContextMenuItem onClick={() => handleExport("text")}>
                Download as Text
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem onClick={() => handleCopy("markdown")}>
                Copy as Markdown
              </ContextMenuItem>
              <ContextMenuItem onClick={() => handleCopy("json")}>
                Copy as JSON
              </ContextMenuItem>
              <ContextMenuItem onClick={() => handleCopy("text")}>
                Copy as Text
              </ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
        </Show>
	      <Show when={isDesktopApp() && local.chatId}>
	          <ContextMenuItem onClick={() => openInNewWindow(local.chatId!, local.subChat.id)}>
	            Open in new window
	          </ContextMenuItem>
	        </Show>
      <ContextMenuSeparator />

 {local.showCloseTabOptions ? <>
	      <ContextMenuItem onClick={() => local.onCloseTab?.(local.subChat.id)} class="justify-between" disabled={local.isOnlyChat}>
	        Close chat
	        <Show when={!local.isOnlyChat}>
	          <Kbd>{closeTabShortcut}</Kbd>
	        </Show>
	      </ContextMenuItem>
	      <ContextMenuItem onClick={() => local.onCloseOtherTabs?.(local.subChat.id)} disabled={!local.canCloseOtherTabs}>
	        Close other chats
	      </ContextMenuItem>
	      <ContextMenuItem onClick={() => local.onCloseTabsToRight?.(local.subChat.id, local.visualIndex)} disabled={!local.hasTabsToRight}>
	        Close chats to the right
	      </ContextMenuItem>
	    </> : <>
	      <ContextMenuItem onClick={() => local.onArchive(local.subChat.id)} class="justify-between" disabled={local.isOnlyChat}>
	        Archive chat
	        <Show when={!local.isOnlyChat}>
	          <Kbd>{closeTabShortcut}</Kbd>
	        </Show>
	      </ContextMenuItem>
	      <ContextMenuItem onClick={() => local.onArchiveAllBelow?.(local.subChat.id)} disabled={local.currentIndex === undefined || local.currentIndex >= (local.totalCount || 0) - 1}>
	        Archive chats below
	      </ContextMenuItem>
	      <ContextMenuItem onClick={() => local.onArchiveOthers(local.subChat.id)} disabled={local.isOnlyChat}>
	        Archive other chats
	      </ContextMenuItem>
        </>}
    </ContextMenuContent>;
}
