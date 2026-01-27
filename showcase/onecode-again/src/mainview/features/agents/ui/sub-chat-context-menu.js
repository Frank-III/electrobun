"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubChatContextMenu = SubChatContextMenu;
var solid_js_1 = require("solid-js");
var context_menu_1 = require("../../../components/ui/context-menu");
var kbd_1 = require("../../../components/ui/kbd");
var utils_1 = require("../../../lib/utils");
var platform_1 = require("../../../lib/utils/platform");
var hotkeys_1 = require("../../../lib/hotkeys");
var export_chat_1 = require("../lib/export-chat");
var openInNewWindow = function (chatId, subChatId) {
    var _a;
    (_a = window.desktopApi) === null || _a === void 0 ? void 0 : _a.newWindow({
        chatId: chatId,
        subChatId: subChatId
    });
};
// Platform-aware keyboard shortcut for close tab
// Uses custom hotkey from settings if configured
var useCloseTabShortcut = function () {
    var archiveAgentHotkey = (0, hotkeys_1.useResolvedHotkeyDisplay)("archive-agent");
    return (0, solid_js_1.createMemo)(function () {
        if (!utils_1.isMac)
            return "Alt+Ctrl+W";
        return archiveAgentHotkey || "⌘W";
    });
};
function SubChatContextMenu(_a) {
    var subChat = _a.subChat, isPinned = _a.isPinned, onTogglePin = _a.onTogglePin, onRename = _a.onRename, onArchive = _a.onArchive, onArchiveOthers = _a.onArchiveOthers, onArchiveAllBelow = _a.onArchiveAllBelow, isOnlyChat = _a.isOnlyChat, currentIndex = _a.currentIndex, totalCount = _a.totalCount, _b = _a.showCloseTabOptions, showCloseTabOptions = _b === void 0 ? false : _b, onCloseTab = _a.onCloseTab, onCloseOtherTabs = _a.onCloseOtherTabs, onCloseTabsToRight = _a.onCloseTabsToRight, _c = _a.visualIndex, visualIndex = _c === void 0 ? 0 : _c, _d = _a.hasTabsToRight, hasTabsToRight = _d === void 0 ? false : _d, _e = _a.canCloseOtherTabs, canCloseOtherTabs = _e === void 0 ? false : _e, chatId = _a.chatId;
    var closeTabShortcut = useCloseTabShortcut();
    var handleExport = function (format) {
        if (!chatId)
            return;
        (0, export_chat_1.exportChat)({
            chatId: chatId,
            subChatId: subChat.id,
            format: format
        });
    };
    var handleCopy = function (format) {
        if (!chatId)
            return;
        (0, export_chat_1.copyChat)({
            chatId: chatId,
            subChatId: subChat.id,
            format: format
        });
    };
    return <context_menu_1.ContextMenuContent class="w-48">
      <context_menu_1.ContextMenuItem onClick={function () { return onTogglePin(subChat.id); }}>
        {isPinned ? "Unpin chat" : "Pin chat"}
      </context_menu_1.ContextMenuItem>
      <context_menu_1.ContextMenuItem onClick={function () { return onRename(subChat); }}>
        Rename chat
      </context_menu_1.ContextMenuItem>
      {chatId && <context_menu_1.ContextMenuSub>
          <context_menu_1.ContextMenuSubTrigger>Export chat</context_menu_1.ContextMenuSubTrigger>
          <context_menu_1.ContextMenuSubContent sideOffset={6} alignOffset={-4}>
            <context_menu_1.ContextMenuItem onClick={function () { return handleExport("markdown"); }}>
              Download as Markdown
            </context_menu_1.ContextMenuItem>
            <context_menu_1.ContextMenuItem onClick={function () { return handleExport("json"); }}>
              Download as JSON
            </context_menu_1.ContextMenuItem>
            <context_menu_1.ContextMenuItem onClick={function () { return handleExport("text"); }}>
              Download as Text
            </context_menu_1.ContextMenuItem>
            <context_menu_1.ContextMenuSeparator />
            <context_menu_1.ContextMenuItem onClick={function () { return handleCopy("markdown"); }}>
              Copy as Markdown
            </context_menu_1.ContextMenuItem>
            <context_menu_1.ContextMenuItem onClick={function () { return handleCopy("json"); }}>
              Copy as JSON
            </context_menu_1.ContextMenuItem>
            <context_menu_1.ContextMenuItem onClick={function () { return handleCopy("text"); }}>
              Copy as Text
            </context_menu_1.ContextMenuItem>
          </context_menu_1.ContextMenuSubContent>
        </context_menu_1.ContextMenuSub>}
      {(0, platform_1.isDesktopApp)() && chatId && <context_menu_1.ContextMenuItem onClick={function () { return openInNewWindow(chatId, subChat.id); }}>
          Open in new window
        </context_menu_1.ContextMenuItem>}
      <context_menu_1.ContextMenuSeparator />

      {showCloseTabOptions ? <>
          <context_menu_1.ContextMenuItem onClick={function () { return onCloseTab === null || onCloseTab === void 0 ? void 0 : onCloseTab(subChat.id); }} class="justify-between" disabled={isOnlyChat}>
            Close chat
            {!isOnlyChat && <kbd_1.Kbd>{closeTabShortcut}</kbd_1.Kbd>}
          </context_menu_1.ContextMenuItem>
          <context_menu_1.ContextMenuItem onClick={function () { return onCloseOtherTabs === null || onCloseOtherTabs === void 0 ? void 0 : onCloseOtherTabs(subChat.id); }} disabled={!canCloseOtherTabs}>
            Close other chats
          </context_menu_1.ContextMenuItem>
          <context_menu_1.ContextMenuItem onClick={function () { return onCloseTabsToRight === null || onCloseTabsToRight === void 0 ? void 0 : onCloseTabsToRight(subChat.id, visualIndex); }} disabled={!hasTabsToRight}>
            Close chats to the right
          </context_menu_1.ContextMenuItem>
        </> : <>
          <context_menu_1.ContextMenuItem onClick={function () { return onArchive(subChat.id); }} class="justify-between" disabled={isOnlyChat}>
            Archive chat
            {!isOnlyChat && <kbd_1.Kbd>{closeTabShortcut}</kbd_1.Kbd>}
          </context_menu_1.ContextMenuItem>
          <context_menu_1.ContextMenuItem onClick={function () { return onArchiveAllBelow === null || onArchiveAllBelow === void 0 ? void 0 : onArchiveAllBelow(subChat.id); }} disabled={currentIndex === undefined || currentIndex >= (totalCount || 0) - 1}>
            Archive chats below
          </context_menu_1.ContextMenuItem>
          <context_menu_1.ContextMenuItem onClick={function () { return onArchiveOthers(subChat.id); }} disabled={isOnlyChat}>
            Archive other chats
          </context_menu_1.ContextMenuItem>
        </>}
    </context_menu_1.ContextMenuContent>;
}
