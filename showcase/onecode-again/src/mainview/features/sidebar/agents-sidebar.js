"use client";
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentsSidebar = AgentsSidebar;
var solid_js_1 = require("solid-js");
var web_1 = require("solid-js/web");
var react_1 = require("motion/react");
var button_1 = require("../../components/ui/button");
var utils_1 = require("../../lib/utils");
var jotai_1 = require("../../lib/state/jotai");
var atoms_1 = require("../../lib/atoms");
var use_remote_chats_1 = require("../../lib/hooks/use-remote-chats");
var archive_popover_1 = require("../agents/ui/archive-popover");
var lucide_solid_1 = require("lucide-solid");
// import { useRouter } from "next/navigation" // Desktop doesn't use next/navigation
// import { useCombinedAuth } from "@/lib/hooks/use-combined-auth"
var useCombinedAuth = function () { return ({ userId: null }); };
// import { AuthDialog } from "@/components/auth/auth-dialog"
var AuthDialog = function () { return null; };
// Desktop: archive is handled inline, not via hook
// import { DiscordIcon } from "@/components/icons"
var icons_1 = require("../../icons");
var agents_rename_subchat_dialog_1 = require("../agents/components/agents-rename-subchat-dialog");
var open_locally_dialog_1 = require("../agents/components/open-locally-dialog");
var use_auto_import_1 = require("../agents/hooks/use-auto-import");
var confirm_archive_dialog_1 = require("../../components/confirm-archive-dialog");
var trpc_1 = require("../../lib/trpc");
var solid_sonner_1 = require("solid-sonner");
var dropdown_menu_1 = require("../../components/ui/dropdown-menu");
var tooltip_1 = require("../../components/ui/tooltip");
var kbd_1 = require("../../components/ui/kbd");
var context_menu_1 = require("../../components/ui/context-menu");
var icons_2 = require("../../components/ui/icons");
var logo_1 = require("../../components/ui/logo");
var input_1 = require("../../components/ui/input");
var button_2 = require("../../components/ui/button");
var atoms_2 = require("../agents/atoms");
var network_status_1 = require("../../components/ui/network-status");
var sub_chat_store_1 = require("../agents/stores/sub-chat-store");
var WindowContext_1 = require("../../contexts/WindowContext");
var agents_help_popover_1 = require("../agents/components/agents-help-popover");
var platform_1 = require("../../lib/utils/platform");
var hotkeys_1 = require("../../lib/hotkeys");
var pluralize_1 = require("../agents/utils/pluralize");
var drafts_1 = require("../agents/lib/drafts");
var traffic_light_spacer_1 = require("../agents/components/traffic-light-spacer");
var react_hotkeys_hook_1 = require("react-hotkeys-hook");
var checkbox_1 = require("../../components/ui/checkbox");
var use_haptic_1 = require("./hooks/use-haptic");
var typewriter_text_1 = require("../../components/ui/typewriter-text");
var export_chat_1 = require("../agents/lib/export-chat");
// Feedback URL: uses env variable for hosted version, falls back to public Discord for open source
var FEEDBACK_URL = import.meta.env.VITE_FEEDBACK_URL || "https://discord.gg/8ektTZGnj4";
// GitHub avatar with loading placeholder
var GitHubAvatar = solid_js_1.default.memo(function GitHubAvatar(_a) {
    var gitOwner = _a.gitOwner, _b = _a.className, className = _b === void 0 ? "h-4 w-4" : _b;
    var _c = (0, solid_js_1.createSignal)(false), isLoaded = _c[0], setIsLoaded = _c[1];
    var _d = (0, solid_js_1.createSignal)(false), hasError = _d[0], setHasError = _d[1];
    var handleLoad = function () { return setIsLoaded(true); };
    var handleError = function () { return setHasError(true); };
    if (hasError) {
        return <icons_2.GitHubLogo class={(0, utils_1.cn)(className, "text-muted-foreground flex-shrink-0")}/>;
    }
    return <div class={(0, utils_1.cn)(className, "relative flex-shrink-0")}>
      {/* Placeholder background while loading */}
      {!isLoaded && <div class="absolute inset-0 rounded-sm bg-muted"/>}
      <img src={"https://github.com/".concat(gitOwner, ".png?size=64")} alt={gitOwner} class={(0, utils_1.cn)(className, "rounded-sm flex-shrink-0", isLoaded ? "opacity-100" : "opacity-0")} onLoad={handleLoad} onError={handleError}/>
    </div>;
});
// Component to render chat icon with loading status
var ChatIcon = solid_js_1.default.memo(function ChatIcon(_a) {
    var isSelected = _a.isSelected, isLoading = _a.isLoading, _b = _a.hasUnseenChanges, hasUnseenChanges = _b === void 0 ? false : _b, _c = _a.hasPendingPlan, hasPendingPlan = _c === void 0 ? false : _c, _d = _a.hasPendingQuestion, hasPendingQuestion = _d === void 0 ? false : _d, _e = _a.isMultiSelectMode, isMultiSelectMode = _e === void 0 ? false : _e, _f = _a.isChecked, isChecked = _f === void 0 ? false : _f, onCheckboxClick = _a.onCheckboxClick, gitOwner = _a.gitOwner, gitProvider = _a.gitProvider, _g = _a.showIcon, showIcon = _g === void 0 ? true : _g;
    // Show GitHub avatar if available, otherwise blank project icon
    var renderMainIcon = function () {
        if (gitOwner && gitProvider === "github") {
            return <GitHubAvatar gitOwner={gitOwner}/>;
        }
        return <icons_2.GitHubLogo class={(0, utils_1.cn)("h-4 w-4 flex-shrink-0 transition-colors", isSelected ? "text-foreground" : "text-muted-foreground")}/>;
    };
    // When icon is hidden and not in multi-select mode, render nothing
    // The loader/status will be rendered inline by the parent component
    if (!showIcon && !isMultiSelectMode) {
        return null;
    }
    return <div class="relative flex-shrink-0 w-4 h-4">
      {/* Checkbox slides in from left, icon slides out */}
      <div class={(0, utils_1.cn)("absolute inset-0 flex items-center justify-center transition-[opacity,transform] duration-150 ease-out", isMultiSelectMode ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none")} onClick={onCheckboxClick}>
        <checkbox_1.Checkbox checked={isChecked} class="cursor-pointer h-4 w-4" tabIndex={isMultiSelectMode ? 0 : -1}/>
      </div>
      {/* Main icon fades out when multi-select is active or when showIcon is false */}
      <div class={(0, utils_1.cn)("transition-[opacity,transform] duration-150 ease-out", isMultiSelectMode || !showIcon ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 scale-100")}>
        {renderMainIcon()}
      </div>
      {/* Badge in bottom-right corner: question > loader > amber dot > blue dot - hidden during multi-select or when icon is hidden */}
      <react_1.AnimatePresence mode="wait">
        {(hasPendingQuestion || isLoading || hasUnseenChanges || hasPendingPlan) && !isMultiSelectMode && showIcon && <react_1.motion.div initial={{
                opacity: 0,
                scale: .5
            }} animate={{
                opacity: 1,
                scale: 1
            }} exit={{
                opacity: 0,
                scale: .5
            }} transition={{ duration: .15 }} class={(0, utils_1.cn)("absolute -bottom-1 -right-1 w-3 h-3 rounded-full flex items-center justify-center", isSelected ? "bg-[#E8E8E8] dark:bg-[#1B1B1B]" : "bg-[#F4F4F4] group-hover:bg-[#E8E8E8] dark:bg-[#101010] dark:group-hover:bg-[#1B1B1B]")}>
            {/* Priority: question > loader > amber dot (pending plan) > blue dot (unseen) */}
            <react_1.AnimatePresence mode="wait">
              {hasPendingQuestion ? <react_1.motion.div key="question" initial={{
                    opacity: 0,
                    scale: .5
                }} animate={{
                    opacity: 1,
                    scale: 1
                }} exit={{
                    opacity: 0,
                    scale: .5
                }} transition={{ duration: .15 }}>
                  <icons_2.QuestionIcon class="w-2.5 h-2.5 text-blue-500"/>
                </react_1.motion.div> : isLoading ? <react_1.motion.div key="loading" initial={{
                    opacity: 0,
                    scale: .5
                }} animate={{
                    opacity: 1,
                    scale: 1
                }} exit={{
                    opacity: 0,
                    scale: .5
                }} transition={{ duration: .15 }}>
                  <icons_2.LoadingDot isLoading={true} class="w-2.5 h-2.5 text-muted-foreground"/>
                </react_1.motion.div> : hasPendingPlan ? <react_1.motion.div key="plan" initial={{
                    opacity: 0,
                    scale: .5
                }} animate={{
                    opacity: 1,
                    scale: 1
                }} exit={{
                    opacity: 0,
                    scale: .5
                }} transition={{ duration: .15 }} class="w-1.5 h-1.5 rounded-full bg-amber-500"/> : <react_1.motion.div key="unseen" initial={{
                    opacity: 0,
                    scale: .5
                }} animate={{
                    opacity: 1,
                    scale: 1
                }} exit={{
                    opacity: 0,
                    scale: .5
                }} transition={{ duration: .15 }}>
                  <icons_2.LoadingDot isLoading={false} class="w-2.5 h-2.5 text-muted-foreground"/>
                </react_1.motion.div>}
            </react_1.AnimatePresence>
          </react_1.motion.div>}
      </react_1.AnimatePresence>
    </div>;
});
// Memoized Draft Item component to prevent re-renders on hover
var DraftItem = solid_js_1.default.memo(function DraftItem(_a) {
    var draftId = _a.draftId, draftText = _a.draftText, draftUpdatedAt = _a.draftUpdatedAt, projectGitOwner = _a.projectGitOwner, projectGitProvider = _a.projectGitProvider, projectGitRepo = _a.projectGitRepo, projectName = _a.projectName, isSelected = _a.isSelected, isMultiSelectMode = _a.isMultiSelectMode, isMobileFullscreen = _a.isMobileFullscreen, showIcon = _a.showIcon, onSelect = _a.onSelect, onDelete = _a.onDelete, formatTime = _a.formatTime;
    return <div onClick={function () { return onSelect(draftId); }} class={(0, utils_1.cn)("w-full text-left py-1.5 cursor-pointer group relative", "transition-colors duration-75", "outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70", isMultiSelectMode ? "px-3" : "pl-2 pr-2", !isMultiSelectMode && "rounded-md", isSelected ? "bg-foreground/5 text-foreground" : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground")}>
      <div class="flex items-start gap-2.5">
        {showIcon && <div class="pt-0.5">
            <div class="relative flex-shrink-0 w-4 h-4">
              {projectGitOwner && projectGitProvider === "github" ? <GitHubAvatar gitOwner={projectGitOwner}/> : <icons_2.GitHubLogo class="h-4 w-4 flex-shrink-0 text-muted-foreground"/>}
            </div>
          </div>}
        <div class="flex-1 min-w-0 flex flex-col gap-0.5">
          <div class="flex items-center gap-1">
            <span class="truncate block text-sm leading-tight flex-1">
              {draftText.slice(0, 50)}
              {draftText.length > 50 ? "..." : ""}
            </span>
            {/* Delete button - shown on hover */}
            {!isMultiSelectMode && !isMobileFullscreen && <button onClick={function (e) {
                e.stopPropagation();
                onDelete(draftId);
            }} tabIndex={-1} class="flex-shrink-0 text-muted-foreground hover:text-foreground active:text-foreground transition-[opacity,transform,color] duration-150 ease-out opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto active:scale-[0.97]" aria-label="Delete draft">
                <icons_2.TrashIcon class="h-3.5 w-3.5"/>
              </button>}
          </div>
          <div class="flex items-center justify-between gap-2">
            <span class="text-[11px] text-muted-foreground/60 truncate">
              <span class="text-blue-500">Draft</span>
              {projectGitRepo ? " \u2022 ".concat(projectGitRepo) : projectName ? " \u2022 ".concat(projectName) : ""}
            </span>
            <span class="text-[11px] text-muted-foreground/60 flex-shrink-0">
              {formatTime(new Date(draftUpdatedAt).toISOString())}
            </span>
          </div>
        </div>
      </div>
    </div>;
});
// Memoized Agent Chat Item component to prevent re-renders on hover
var AgentChatItem = solid_js_1.default.memo(function AgentChatItem(_a) {
    var _b;
    var chatId = _a.chatId, chatName = _a.chatName, chatBranch = _a.chatBranch, chatUpdatedAt = _a.chatUpdatedAt, chatProjectId = _a.chatProjectId, globalIndex = _a.globalIndex, isSelected = _a.isSelected, isLoading = _a.isLoading, hasUnseenChanges = _a.hasUnseenChanges, hasPendingPlan = _a.hasPendingPlan, hasPendingQuestion = _a.hasPendingQuestion, isMultiSelectMode = _a.isMultiSelectMode, isChecked = _a.isChecked, isFocused = _a.isFocused, isMobileFullscreen = _a.isMobileFullscreen, isDesktop = _a.isDesktop, isPinned = _a.isPinned, displayText = _a.displayText, gitOwner = _a.gitOwner, gitProvider = _a.gitProvider, stats = _a.stats, selectedChatIdsSize = _a.selectedChatIdsSize, canShowPinOption = _a.canShowPinOption, areAllSelectedPinned = _a.areAllSelectedPinned, filteredChatsLength = _a.filteredChatsLength, isLastInFilteredChats = _a.isLastInFilteredChats, isRemote = _a.isRemote, showIcon = _a.showIcon, onChatClick = _a.onChatClick, onCheckboxClick = _a.onCheckboxClick, onMouseEnter = _a.onMouseEnter, onMouseLeave = _a.onMouseLeave, onArchive = _a.onArchive, onTogglePin = _a.onTogglePin, onRenameClick = _a.onRenameClick, onCopyBranch = _a.onCopyBranch, onArchiveAllBelow = _a.onArchiveAllBelow, onArchiveOthers = _a.onArchiveOthers, onOpenLocally = _a.onOpenLocally, onBulkPin = _a.onBulkPin, onBulkUnpin = _a.onBulkUnpin, onBulkArchive = _a.onBulkArchive, archivePending = _a.archivePending, archiveBatchPending = _a.archiveBatchPending, nameRefCallback = _a.nameRefCallback, formatTime = _a.formatTime, isJustCreated = _a.isJustCreated;
    // Resolved hotkey for context menu
    var archiveWorkspaceHotkey = (0, hotkeys_1.useResolvedHotkeyDisplay)("archive-workspace");
    return <context_menu_1.ContextMenu>
      <context_menu_1.ContextMenuTrigger asChild>
        <div data-chat-item data-chat-index={globalIndex} onClick={function (e) {
            // On real mobile (touch devices), onTouchEnd handles the click
            // In desktop app with narrow window, we still use mouse clicks
            if (isMobileFullscreen && !isDesktop)
                return;
            onChatClick(chatId, e, globalIndex);
        }} onTouchEnd={function (e) {
            // On real mobile touch devices, use touchEnd directly to bypass ContextMenu's click delay
            if (isMobileFullscreen && !isDesktop) {
                e.preventDefault();
                onChatClick(chatId, undefined, globalIndex);
            }
        }} tabIndex={0} onKeyDown={function (e) {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onChatClick(chatId, undefined, globalIndex);
            }
        }} onMouseEnter={function (e) {
            onMouseEnter(chatId, chatName, e.currentTarget, globalIndex);
        }} onMouseLeave={onMouseLeave} class={(0, utils_1.cn)("w-full text-left py-1.5 cursor-pointer group relative", "transition-colors duration-75", "outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70", 
        // In multi-select: px-3 compensates for removed container px-2, keeping text aligned
        isMultiSelectMode ? "px-3" : "pl-2 pr-2", !isMultiSelectMode && "rounded-md", isSelected ? "bg-foreground/5 text-foreground" : isFocused ? "bg-foreground/5 text-foreground" : isMobileFullscreen ? "text-muted-foreground" : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground", isChecked && (isMobileFullscreen ? "bg-primary/10" : "bg-primary/10 hover:bg-primary/15"))}>
          <div class="flex items-start gap-2.5">
            {/* Icon container - only render if showIcon or in multi-select mode */}
            {(showIcon || isMultiSelectMode) && <div class="pt-0.5">
                <ChatIcon isSelected={isSelected} isLoading={isLoading} hasUnseenChanges={hasUnseenChanges} hasPendingPlan={hasPendingPlan} hasPendingQuestion={hasPendingQuestion} isMultiSelectMode={isMultiSelectMode} isChecked={isChecked} onCheckboxClick={function (e) { return onCheckboxClick(e, chatId); }} gitOwner={gitOwner} gitProvider={gitProvider} showIcon={showIcon}/>
              </div>}
            <div class="flex-1 min-w-0 flex flex-col gap-0.5">
              <div class="flex items-center gap-1">
                <span ref={function (el) { return nameRefCallback(chatId, el); }} class="truncate block text-sm leading-tight flex-1">
                  <typewriter_text_1.TypewriterText text={chatName || ""} placeholder="New workspace" id={chatId} isJustCreated={isJustCreated} showPlaceholder={true}/>
                </span>
                {/* Archive button or inline loader/status when icon is hidden */}
                {!isMultiSelectMode && !isMobileFullscreen && <div class="flex-shrink-0 w-3.5 h-3.5 flex items-center justify-center relative">
                    {/* Inline loader/status when icon is hidden - always visible, hides on hover */}
                    {!showIcon && (hasPendingQuestion || isLoading || hasUnseenChanges || hasPendingPlan) && <div class="absolute inset-0 flex items-center justify-center transition-opacity duration-150 group-hover:opacity-0">
                        <react_1.AnimatePresence mode="wait">
                          {hasPendingQuestion ? <react_1.motion.div key="question" initial={{
                        opacity: 0,
                        scale: .5
                    }} animate={{
                        opacity: 1,
                        scale: 1
                    }} exit={{
                        opacity: 0,
                        scale: .5
                    }} transition={{ duration: .15 }}>
                              <icons_2.QuestionIcon class="w-2.5 h-2.5 text-blue-500"/>
                            </react_1.motion.div> : isLoading ? <react_1.motion.div key="loading" initial={{
                        opacity: 0,
                        scale: .5
                    }} animate={{
                        opacity: 1,
                        scale: 1
                    }} exit={{
                        opacity: 0,
                        scale: .5
                    }} transition={{ duration: .15 }}>
                              <icons_2.LoadingDot isLoading={true} class="w-2.5 h-2.5 text-muted-foreground"/>
                            </react_1.motion.div> : hasPendingPlan ? <react_1.motion.div key="plan" initial={{
                        opacity: 0,
                        scale: .5
                    }} animate={{
                        opacity: 1,
                        scale: 1
                    }} exit={{
                        opacity: 0,
                        scale: .5
                    }} transition={{ duration: .15 }} class="w-1.5 h-1.5 rounded-full bg-amber-500"/> : <react_1.motion.div key="unseen" initial={{
                        opacity: 0,
                        scale: .5
                    }} animate={{
                        opacity: 1,
                        scale: 1
                    }} exit={{
                        opacity: 0,
                        scale: .5
                    }} transition={{ duration: .15 }}>
                              <icons_2.LoadingDot isLoading={false} class="w-2.5 h-2.5 text-muted-foreground"/>
                            </react_1.motion.div>}
                        </react_1.AnimatePresence>
                      </div>}
                    {/* Archive button - appears on hover */}
                    <button onClick={function (e) {
                e.stopPropagation();
                onArchive(chatId);
            }} tabIndex={-1} class="absolute inset-0 flex items-center justify-center text-muted-foreground hover:text-foreground active:text-foreground transition-[opacity,transform,color] duration-150 ease-out opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto active:scale-[0.97]" aria-label="Archive workspace">
                      <icons_2.ArchiveIcon class="h-3.5 w-3.5"/>
                    </button>
                  </div>}
              </div>
              <div class="flex items-center gap-1 text-[11px] text-muted-foreground/60 min-w-0">
                {/* Cloud icon for remote chats */}
                {isRemote && <icons_2.CloudIcon class="h-2.5 w-2.5 flex-shrink-0"/>}
                <span class="truncate flex-1 min-w-0">{displayText}</span>
                <div class="flex items-center gap-1.5 flex-shrink-0">
                  {stats && (stats.additions > 0 || stats.deletions > 0) && <>
                      <span class="text-green-600 dark:text-green-400">
                        +{stats.additions}
                      </span>
                      <span class="text-red-600 dark:text-red-400">
                        -{stats.deletions}
                      </span>
                    </>}
                  <span>
                    {formatTime((_b = chatUpdatedAt === null || chatUpdatedAt === void 0 ? void 0 : chatUpdatedAt.toISOString()) !== null && _b !== void 0 ? _b : new Date().toISOString())}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </context_menu_1.ContextMenuTrigger>
      <context_menu_1.ContextMenuContent class="w-48">
        {/* Multi-select context menu */}
        {isMultiSelectMode && isChecked ? <>
            {canShowPinOption && <>
                <context_menu_1.ContextMenuItem onClick={areAllSelectedPinned ? onBulkUnpin : onBulkPin}>
                  {areAllSelectedPinned ? "Unpin ".concat(selectedChatIdsSize, " ").concat((0, pluralize_1.pluralize)(selectedChatIdsSize, "workspace")) : "Pin ".concat(selectedChatIdsSize, " ").concat((0, pluralize_1.pluralize)(selectedChatIdsSize, "workspace"))}
                </context_menu_1.ContextMenuItem>
                <context_menu_1.ContextMenuSeparator />
              </>}
            <context_menu_1.ContextMenuItem onClick={onBulkArchive} disabled={archiveBatchPending}>
              {archiveBatchPending ? "Archiving..." : "Archive ".concat(selectedChatIdsSize, " ").concat((0, pluralize_1.pluralize)(selectedChatIdsSize, "workspace"))}
            </context_menu_1.ContextMenuItem>
          </> : <>
            {isRemote && <>
                <context_menu_1.ContextMenuItem onClick={function () { return onOpenLocally(chatId); }}>
                  Fork Locally
                </context_menu_1.ContextMenuItem>
                <context_menu_1.ContextMenuSeparator />
              </>}
            <context_menu_1.ContextMenuItem onClick={function () { return onTogglePin(chatId); }}>
              {isPinned ? "Unpin workspace" : "Pin workspace"}
            </context_menu_1.ContextMenuItem>
            <context_menu_1.ContextMenuItem onClick={function () { return onRenameClick({
                id: chatId,
                name: chatName,
                isRemote: isRemote
            }); }}>
              Rename workspace
            </context_menu_1.ContextMenuItem>
            {chatBranch && <context_menu_1.ContextMenuItem onClick={function () { return onCopyBranch(chatBranch); }}>
                Copy branch name
              </context_menu_1.ContextMenuItem>}
            <context_menu_1.ContextMenuSub>
              <context_menu_1.ContextMenuSubTrigger>Export workspace</context_menu_1.ContextMenuSubTrigger>
              <context_menu_1.ContextMenuSubContent sideOffset={6} alignOffset={-4}>
                <context_menu_1.ContextMenuItem onClick={function () { return (0, export_chat_1.exportChat)({
                chatId: isRemote ? chatId.replace(/^remote_/, "") : chatId,
                format: "markdown",
                isRemote: isRemote
            }); }}>
                  Download as Markdown
                </context_menu_1.ContextMenuItem>
                <context_menu_1.ContextMenuItem onClick={function () { return (0, export_chat_1.exportChat)({
                chatId: isRemote ? chatId.replace(/^remote_/, "") : chatId,
                format: "json",
                isRemote: isRemote
            }); }}>
                  Download as JSON
                </context_menu_1.ContextMenuItem>
                <context_menu_1.ContextMenuItem onClick={function () { return (0, export_chat_1.exportChat)({
                chatId: isRemote ? chatId.replace(/^remote_/, "") : chatId,
                format: "text",
                isRemote: isRemote
            }); }}>
                  Download as Text
                </context_menu_1.ContextMenuItem>
                <context_menu_1.ContextMenuSeparator />
                <context_menu_1.ContextMenuItem onClick={function () { return (0, export_chat_1.copyChat)({
                chatId: isRemote ? chatId.replace(/^remote_/, "") : chatId,
                format: "markdown",
                isRemote: isRemote
            }); }}>
                  Copy as Markdown
                </context_menu_1.ContextMenuItem>
                <context_menu_1.ContextMenuItem onClick={function () { return (0, export_chat_1.copyChat)({
                chatId: isRemote ? chatId.replace(/^remote_/, "") : chatId,
                format: "json",
                isRemote: isRemote
            }); }}>
                  Copy as JSON
                </context_menu_1.ContextMenuItem>
                <context_menu_1.ContextMenuItem onClick={function () { return (0, export_chat_1.copyChat)({
                chatId: isRemote ? chatId.replace(/^remote_/, "") : chatId,
                format: "text",
                isRemote: isRemote
            }); }}>
                  Copy as Text
                </context_menu_1.ContextMenuItem>
              </context_menu_1.ContextMenuSubContent>
            </context_menu_1.ContextMenuSub>
            {isDesktop && <context_menu_1.ContextMenuItem onClick={function () { var _a; return (_a = window.desktopApi) === null || _a === void 0 ? void 0 : _a.newWindow({ chatId: chatId }); }}>
                Open in new window
              </context_menu_1.ContextMenuItem>}
            <context_menu_1.ContextMenuSeparator />
            <context_menu_1.ContextMenuItem onClick={function () { return onArchive(chatId); }} class="justify-between">
              Archive workspace
              {archiveWorkspaceHotkey && <kbd_1.Kbd>{archiveWorkspaceHotkey}</kbd_1.Kbd>}
            </context_menu_1.ContextMenuItem>
            <context_menu_1.ContextMenuItem onClick={function () { return onArchiveAllBelow(chatId); }} disabled={isLastInFilteredChats}>
              Archive all below
            </context_menu_1.ContextMenuItem>
            <context_menu_1.ContextMenuItem onClick={function () { return onArchiveOthers(chatId); }} disabled={filteredChatsLength === 1}>
              Archive others
            </context_menu_1.ContextMenuItem>
          </>}
      </context_menu_1.ContextMenuContent>
    </context_menu_1.ContextMenu>;
});
// Custom comparator for ChatListSection to handle Set/Map props correctly
// Sets and Maps from Jotai atoms are stable by reference when unchanged,
// but we add explicit size checks for extra safety
function chatListSectionPropsAreEqual(prevProps, nextProps) {
    // Quick checks for primitive props that change often
    if (prevProps.selectedChatId !== nextProps.selectedChatId)
        return false;
    if (prevProps.selectedChatIsRemote !== nextProps.selectedChatIsRemote)
        return false;
    if (prevProps.focusedChatIndex !== nextProps.focusedChatIndex)
        return false;
    if (prevProps.isMultiSelectMode !== nextProps.isMultiSelectMode)
        return false;
    if (prevProps.canShowPinOption !== nextProps.canShowPinOption)
        return false;
    if (prevProps.areAllSelectedPinned !== nextProps.areAllSelectedPinned)
        return false;
    if (prevProps.archivePending !== nextProps.archivePending)
        return false;
    if (prevProps.archiveBatchPending !== nextProps.archiveBatchPending)
        return false;
    if (prevProps.title !== nextProps.title)
        return false;
    if (prevProps.isMobileFullscreen !== nextProps.isMobileFullscreen)
        return false;
    if (prevProps.isDesktop !== nextProps.isDesktop)
        return false;
    if (prevProps.showIcon !== nextProps.showIcon)
        return false;
    // Check arrays by reference (they're stable from useMemo in parent)
    if (prevProps.chats !== nextProps.chats)
        return false;
    if (prevProps.filteredChats !== nextProps.filteredChats)
        return false;
    // Check Sets by reference - Jotai atoms return same reference if unchanged
    if (prevProps.loadingChatIds !== nextProps.loadingChatIds)
        return false;
    if (prevProps.unseenChanges !== nextProps.unseenChanges)
        return false;
    if (prevProps.workspacePendingPlans !== nextProps.workspacePendingPlans)
        return false;
    if (prevProps.workspacePendingQuestions !== nextProps.workspacePendingQuestions)
        return false;
    if (prevProps.selectedChatIds !== nextProps.selectedChatIds)
        return false;
    if (prevProps.pinnedChatIds !== nextProps.pinnedChatIds)
        return false;
    if (prevProps.justCreatedIds !== nextProps.justCreatedIds)
        return false;
    // Check Maps by reference
    if (prevProps.projectsMap !== nextProps.projectsMap)
        return false;
    if (prevProps.workspaceFileStats !== nextProps.workspaceFileStats)
        return false;
    // Callback functions are stable from useCallback in parent
    // No need to compare them - they only change when their deps change
    return true;
}
// Memoized Chat List Section component
var ChatListSection = solid_js_1.default.memo(function ChatListSection(_a) {
    var title = _a.title, chats = _a.chats, selectedChatId = _a.selectedChatId, selectedChatIsRemote = _a.selectedChatIsRemote, focusedChatIndex = _a.focusedChatIndex, loadingChatIds = _a.loadingChatIds, unseenChanges = _a.unseenChanges, workspacePendingPlans = _a.workspacePendingPlans, workspacePendingQuestions = _a.workspacePendingQuestions, isMultiSelectMode = _a.isMultiSelectMode, selectedChatIds = _a.selectedChatIds, isMobileFullscreen = _a.isMobileFullscreen, isDesktop = _a.isDesktop, pinnedChatIds = _a.pinnedChatIds, projectsMap = _a.projectsMap, workspaceFileStats = _a.workspaceFileStats, filteredChats = _a.filteredChats, canShowPinOption = _a.canShowPinOption, areAllSelectedPinned = _a.areAllSelectedPinned, showIcon = _a.showIcon, onChatClick = _a.onChatClick, onCheckboxClick = _a.onCheckboxClick, onMouseEnter = _a.onMouseEnter, onMouseLeave = _a.onMouseLeave, onArchive = _a.onArchive, onTogglePin = _a.onTogglePin, onRenameClick = _a.onRenameClick, onCopyBranch = _a.onCopyBranch, onArchiveAllBelow = _a.onArchiveAllBelow, onArchiveOthers = _a.onArchiveOthers, onOpenLocally = _a.onOpenLocally, onBulkPin = _a.onBulkPin, onBulkUnpin = _a.onBulkUnpin, onBulkArchive = _a.onBulkArchive, archivePending = _a.archivePending, archiveBatchPending = _a.archiveBatchPending, nameRefCallback = _a.nameRefCallback, formatTime = _a.formatTime, justCreatedIds = _a.justCreatedIds;
    if (chats.length === 0)
        return null;
    // Pre-compute global indices map to avoid O(n²) findIndex in map()
    var globalIndexMap = (0, solid_js_1.createMemo)(function () {
        var map = new Map();
        filteredChats.forEach(function (c, i) { return map.set(c.id, i); });
        return map;
    });
    return <>
      <div class={(0, utils_1.cn)("flex items-center h-4 mb-1", isMultiSelectMode ? "pl-3" : "pl-2")}>
        <h3 class="text-xs font-medium text-muted-foreground whitespace-nowrap">
          {title}
        </h3>
      </div>
      <div class="list-none p-0 m-0 mb-3">
        {chats.map(function (chat) {
            var _a, _b, _c, _d, _e;
            var isLoading = loadingChatIds.has(chat.id);
            // For remote chats, compare without prefix; for local, compare directly
            // Remote chat IDs in list have "remote_" prefix, but selectedChatId is the original ID
            var chatOriginalId = chat.isRemote ? chat.id.replace(/^remote_/, "") : chat.id;
            var isSelected = selectedChatId === chatOriginalId && selectedChatIsRemote === chat.isRemote;
            var isPinned = pinnedChatIds.has(chat.id);
            var globalIndex = (_a = globalIndexMap.get(chat.id)) !== null && _a !== void 0 ? _a : -1;
            var isFocused = focusedChatIndex === globalIndex && focusedChatIndex >= 0;
            // For remote chats, get repo info from meta; for local, from projectsMap
            var project = chat.projectId ? projectsMap.get(chat.projectId) : null;
            var repoName = chat.isRemote ? (_b = chat.meta) === null || _b === void 0 ? void 0 : _b.repository : (project === null || project === void 0 ? void 0 : project.gitRepo) || (project === null || project === void 0 ? void 0 : project.name);
            var displayText = chat.branch ? repoName ? "".concat(repoName, " \u2022 ").concat(chat.branch) : chat.branch : repoName || (chat.isRemote ? "Remote project" : "Local project");
            var isChecked = selectedChatIds.has(chat.id);
            // For remote chats, use remoteStats; for local, use workspaceFileStats
            var stats = chat.isRemote ? chat.remoteStats : workspaceFileStats.get(chat.id);
            var hasPendingPlan = workspacePendingPlans.has(chat.id);
            var hasPendingQuestion = workspacePendingQuestions.has(chat.id);
            var isLastInFilteredChats = globalIndex === filteredChats.length - 1;
            var isJustCreated = justCreatedIds().has(chat.id);
            // For remote chats, extract gitOwner from meta.repository (e.g. "owner/repo" -> "owner")
            var gitOwner = chat.isRemote ? (_d = (_c = chat.meta) === null || _c === void 0 ? void 0 : _c.repository) === null || _d === void 0 ? void 0 : _d.split("/")[0] : project === null || project === void 0 ? void 0 : project.gitOwner;
            var gitProvider = chat.isRemote ? "github" : project === null || project === void 0 ? void 0 : project.gitProvider;
            return <AgentChatItem key={chat.id} chatId={chat.id} chatName={chat.name} chatBranch={chat.branch} chatUpdatedAt={chat.updatedAt} chatProjectId={(_e = chat.projectId) !== null && _e !== void 0 ? _e : ""} globalIndex={globalIndex} isSelected={isSelected} isLoading={isLoading} hasUnseenChanges={unseenChanges().has(chat.id)} hasPendingPlan={hasPendingPlan} hasPendingQuestion={hasPendingQuestion} isMultiSelectMode={isMultiSelectMode} isChecked={isChecked} isFocused={isFocused} isMobileFullscreen={isMobileFullscreen} isDesktop={isDesktop} isPinned={isPinned} displayText={displayText} gitOwner={gitOwner} gitProvider={gitProvider} stats={stats !== null && stats !== void 0 ? stats : undefined} selectedChatIdsSize={selectedChatIds.size} canShowPinOption={canShowPinOption} areAllSelectedPinned={areAllSelectedPinned} filteredChatsLength={filteredChats.length} isLastInFilteredChats={isLastInFilteredChats} showIcon={showIcon} onChatClick={onChatClick} onCheckboxClick={onCheckboxClick} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} onArchive={onArchive} onTogglePin={onTogglePin} onRenameClick={onRenameClick} onCopyBranch={onCopyBranch} onArchiveAllBelow={onArchiveAllBelow} onArchiveOthers={onArchiveOthers} onOpenLocally={onOpenLocally} onBulkPin={onBulkPin} onBulkUnpin={onBulkUnpin} onBulkArchive={onBulkArchive} archivePending={archivePending} archiveBatchPending={archiveBatchPending} isRemote={chat.isRemote} nameRefCallback={nameRefCallback} formatTime={formatTime} isJustCreated={isJustCreated}/>;
        })}
      </div>
    </>;
}, chatListSectionPropsAreEqual);
// Memoized Archive Button to prevent re-creation on every sidebar render
var ArchiveButton = memo(forwardRef(function ArchiveButton(props, ref) {
    return <button ref={ref} type="button" class="flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.97] outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70" {...props}>
        <icons_2.ArchiveIcon class="h-4 w-4"/>
      </button>;
}));
// Isolated Kanban Button - clears selection to show Kanban view
var KanbanButton = memo(function KanbanButton() {
    var kanbanEnabled = (0, jotai_1.useAtomValue)(atoms_1.betaKanbanEnabledAtom);
    var setSelectedChatId = (0, jotai_1.useSetAtom)(atoms_2.selectedAgentChatIdAtom);
    var setSelectedDraftId = (0, jotai_1.useSetAtom)(atoms_2.selectedDraftIdAtom);
    var setShowNewChatForm = (0, jotai_1.useSetAtom)(atoms_2.showNewChatFormAtom);
    // Resolved hotkey for tooltip (respects custom bindings)
    var openKanbanHotkey = (0, hotkeys_1.useResolvedHotkeyDisplay)("open-kanban");
    var handleClick = function () {
        // Clear selected chat, draft, and new form state to show Kanban view
        setSelectedChatId(null);
        setSelectedDraftId(null);
        setShowNewChatForm(false);
    };
    // Hide button if feature is disabled
    if (!kanbanEnabled)
        return null;
    return <tooltip_1.Tooltip delayDuration={500}>
      <tooltip_1.TooltipTrigger asChild>
        <button type="button" onClick={handleClick} class="flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.97] outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70">
          <lucide_solid_1.Columns3 class="h-4 w-4"/>
        </button>
      </tooltip_1.TooltipTrigger>
      <tooltip_1.TooltipContent>
        Kanban View
        {openKanbanHotkey && <kbd_1.Kbd>{openKanbanHotkey}</kbd_1.Kbd>}
      </tooltip_1.TooltipContent>
    </tooltip_1.Tooltip>;
});
var ArchiveSection = memo(function ArchiveSection(_a) {
    var archivedChatsCount = _a.archivedChatsCount;
    var archivePopoverOpen = (0, jotai_1.useAtomValue)(atoms_2.archivePopoverOpenAtom);
    var _b = (0, solid_js_1.createSignal)(false), blockArchiveTooltip = _b[0], setBlockArchiveTooltip = _b[1];
    var _c = (0, solid_js_1.createSignal)(false), prevArchivePopoverOpen = _c[0], setPrevArchivePopoverOpen = _c[1];
    var _d = (0, solid_js_1.createSignal)(null), archiveButtonRef = _d[0], setArchiveButtonRef = _d[1];
    // Handle tooltip blocking when popover closes
    (0, solid_js_1.createEffect)(function () {
        var _a;
        if (prevArchivePopoverOpen.current && !archivePopoverOpen) {
            (_a = archiveButtonRef.current) === null || _a === void 0 ? void 0 : _a.blur();
            setBlockArchiveTooltip(true);
            var timer_1 = setTimeout(function () { return setBlockArchiveTooltip(false); }, 300);
            prevArchivePopoverOpen.current = archivePopoverOpen;
            return function () { return clearTimeout(timer_1); };
        }
        prevArchivePopoverOpen.current = archivePopoverOpen;
    });
    if (archivedChatsCount === 0)
        return null;
    return <tooltip_1.Tooltip delayDuration={500} open={archivePopoverOpen || blockArchiveTooltip ? false : undefined}>
      <tooltip_1.TooltipTrigger asChild>
        <div>
          <archive_popover_1.ArchivePopover trigger={<ArchiveButton ref={archiveButtonRef}/>}/>
        </div>
      </tooltip_1.TooltipTrigger>
      <tooltip_1.TooltipContent>Archive</tooltip_1.TooltipContent>
    </tooltip_1.Tooltip>;
});
var SidebarHeader = memo(function SidebarHeader(_a) {
    var isDesktop = _a.isDesktop, isFullscreen = _a.isFullscreen, isMobileFullscreen = _a.isMobileFullscreen, userId = _a.userId, desktopUser = _a.desktopUser, onSignOut = _a.onSignOut, onToggleSidebar = _a.onToggleSidebar, setSettingsDialogOpen = _a.setSettingsDialogOpen, setSettingsActiveTab = _a.setSettingsActiveTab, setShowAuthDialog = _a.setShowAuthDialog, handleSidebarMouseEnter = _a.handleSidebarMouseEnter, handleSidebarMouseLeave = _a.handleSidebarMouseLeave, closeButtonRef = _a.closeButtonRef;
    var _b = (0, solid_js_1.createSignal)(false), isDropdownOpen = _b[0], setIsDropdownOpen = _b[1];
    var showOfflineFeatures = (0, jotai_1.useAtomValue)(atoms_1.showOfflineModeFeaturesAtom);
    var toggleSidebarHotkey = (0, hotkeys_1.useResolvedHotkeyDisplay)("toggle-sidebar");
    return <div class="relative flex-shrink-0" onMouseEnter={handleSidebarMouseEnter} onMouseLeave={handleSidebarMouseLeave}>
      {/* Draggable area for window movement - background layer (hidden in fullscreen) */}
      {isDesktop && !isFullscreen && <div class="absolute inset-x-0 top-0 h-[32px] z-0" style={{ WebkitAppRegion: "drag" }} data-sidebar-content/>}

      {/* Custom traffic lights - positioned at top left, centered in 32px area */}
      <traffic_light_spacer_1.TrafficLights isHovered={isDropdownOpen} isFullscreen={isFullscreen} isDesktop={isDesktop} class="absolute left-4 top-[14px] z-20"/>

      {/* Close button - positioned at top right */}
      {!isMobileFullscreen && <div ref={closeButtonRef} class={(0, utils_1.cn)("absolute right-2 z-20 transition-opacity duration-150", "top-2")} style={{
                opacity: isDropdownOpen ? 1 : 0,
                WebkitAppRegion: "no-drag"
            }}>
          <tooltip_1.Tooltip delayDuration={500}>
            <tooltip_1.TooltipTrigger asChild>
              <button_1.Button variant="ghost" size="icon" onClick={onToggleSidebar} tabIndex={-1} class="h-6 w-6 p-0 hover:bg-foreground/10 transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] text-foreground flex-shrink-0 rounded-md" aria-label="Close sidebar">
                <icons_2.IconDoubleChevronLeft class="h-4 w-4"/>
              </button_1.Button>
            </tooltip_1.TooltipTrigger>
            <tooltip_1.TooltipContent>
              Close sidebar
              {toggleSidebarHotkey && <kbd_1.Kbd>{toggleSidebarHotkey}</kbd_1.Kbd>}
            </tooltip_1.TooltipContent>
          </tooltip_1.Tooltip>
        </div>}

      {/* Spacer for macOS traffic lights */}
      <traffic_light_spacer_1.TrafficLightSpacer isFullscreen={isFullscreen} isDesktop={isDesktop}/>

      {/* Team dropdown - below traffic lights */}
      <div class="px-2 pt-2 pb-2">
        <div class="flex items-center gap-1">
          <div class="flex-1 min-w-0">
            <dropdown_menu_1.DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
              <dropdown_menu_1.DropdownMenuTrigger asChild>
                <button_1.Button variant="ghost" class="h-6 px-1.5 justify-start hover:bg-foreground/10 rounded-md group/team-button max-w-full" suppressHydrationWarning>
                  <div class="flex items-center gap-1.5 min-w-0 max-w-full">
                    <div class="flex items-center justify-center flex-shrink-0">
                      <logo_1.Logo class="w-3.5 h-3.5"/>
                    </div>
                    <div class="min-w-0 flex-1 overflow-hidden">
                      <div class="text-sm font-medium text-foreground truncate">
                        1Code
                      </div>
                    </div>
                    {showOfflineFeatures && <div class="flex-shrink-0">
                        <network_status_1.NetworkStatus />
                      </div>}
                    <lucide_solid_1.ChevronDown class={(0, utils_1.cn)("h-3 text-muted-foreground flex-shrink-0 overflow-hidden", isDropdownOpen ? "opacity-100 w-3" : "opacity-0 w-0 group-hover/team-button:opacity-100 group-hover/team-button:w-3")}/>
                  </div>
                </button_1.Button>
              </dropdown_menu_1.DropdownMenuTrigger>
              <dropdown_menu_1.DropdownMenuContent align="start" class="w-52 pt-0" sideOffset={8}>
                {userId ? <>
                    {/* Project section at the top */}
                    <div class="relative rounded-t-xl border-b overflow-hidden">
                      <div class="absolute inset-0 bg-popover brightness-110"/>
                      <div class="relative pl-2 pt-1.5 pb-2">
                        <div class="flex items-center gap-2 min-w-0">
                          <div class="w-8 h-8 rounded flex items-center justify-center bg-background flex-shrink-0 overflow-hidden">
                            <logo_1.Logo class="w-4 h-4"/>
                          </div>
                          <div class="flex-1 min-w-0 overflow-hidden">
                            <div class="font-medium text-sm text-foreground truncate">
                              {(desktopUser === null || desktopUser === void 0 ? void 0 : desktopUser.name) || "User"}
                            </div>
                            <div class="text-xs text-muted-foreground truncate">
                              {desktopUser === null || desktopUser === void 0 ? void 0 : desktopUser.email}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Settings */}
                    <dropdown_menu_1.DropdownMenuItem class="gap-2" onSelect={function () {
                setIsDropdownOpen(false);
                setSettingsActiveTab("profile");
                setSettingsDialogOpen(true);
            }}>
                      <icons_2.SettingsIcon class="h-3.5 w-3.5 text-muted-foreground flex-shrink-0"/>
                      Settings
                    </dropdown_menu_1.DropdownMenuItem>

                    {/* Help Submenu */}
                    <dropdown_menu_1.DropdownMenuSub>
                      <dropdown_menu_1.DropdownMenuSubTrigger class="gap-2">
                        <icons_2.QuestionCircleIcon class="h-3.5 w-3.5 text-muted-foreground flex-shrink-0"/>
                        <span class="flex-1">Help</span>
                      </dropdown_menu_1.DropdownMenuSubTrigger>
                      <dropdown_menu_1.DropdownMenuSubContent class="w-36" sideOffset={6} alignOffset={-4}>
                        <dropdown_menu_1.DropdownMenuItem onSelect={function () {
                window.open("https://discord.gg/8ektTZGnj4", "_blank");
                setIsDropdownOpen(false);
            }} class="gap-2">
                          <icons_1.DiscordIcon class="h-3.5 w-3.5 text-muted-foreground shrink-0"/>
                          <span class="flex-1">Discord</span>
                        </dropdown_menu_1.DropdownMenuItem>
                        {!isMobileFullscreen && <dropdown_menu_1.DropdownMenuItem onSelect={function () {
                    setIsDropdownOpen(false);
                    setSettingsActiveTab("keyboard");
                    setSettingsDialogOpen(true);
                }} class="gap-2">
                            <icons_2.KeyboardIcon class="h-3.5 w-3.5 text-muted-foreground shrink-0"/>
                            <span class="flex-1">Shortcuts</span>
                          </dropdown_menu_1.DropdownMenuItem>}
                      </dropdown_menu_1.DropdownMenuSubContent>
                    </dropdown_menu_1.DropdownMenuSub>

                    <dropdown_menu_1.DropdownMenuSeparator />

                    {/* Log out */}
                    <div class="">
                      <dropdown_menu_1.DropdownMenuItem class="gap-2" onSelect={function () { return onSignOut(); }}>
                        <svg class="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <polyline points="16,17 21,12 16,7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Log out
                      </dropdown_menu_1.DropdownMenuItem>
                    </div>
                  </> : <>
                    {/* Login for unauthenticated users */}
                    <div class="">
                      <dropdown_menu_1.DropdownMenuItem class="gap-2" onSelect={function () {
                setIsDropdownOpen(false);
                setShowAuthDialog(true);
            }}>
                        <icons_2.ProfileIcon class="h-3.5 w-3.5 text-muted-foreground flex-shrink-0"/>
                        Login
                      </dropdown_menu_1.DropdownMenuItem>
                    </div>

                    <dropdown_menu_1.DropdownMenuSeparator />

                    {/* Help Submenu */}
                    <dropdown_menu_1.DropdownMenuSub>
                      <dropdown_menu_1.DropdownMenuSubTrigger class="gap-2">
                        <icons_2.QuestionCircleIcon class="h-3.5 w-3.5 text-muted-foreground flex-shrink-0"/>
                        <span class="flex-1">Help</span>
                      </dropdown_menu_1.DropdownMenuSubTrigger>
                      <dropdown_menu_1.DropdownMenuSubContent class="w-36" sideOffset={6} alignOffset={-4}>
                        <dropdown_menu_1.DropdownMenuItem onSelect={function () {
                window.open("https://discord.gg/8ektTZGnj4", "_blank");
                setIsDropdownOpen(false);
            }} class="gap-2">
                          <icons_1.DiscordIcon class="h-3.5 w-3.5 text-muted-foreground shrink-0"/>
                          <span class="flex-1">Discord</span>
                        </dropdown_menu_1.DropdownMenuItem>
                        {!isMobileFullscreen && <dropdown_menu_1.DropdownMenuItem onSelect={function () {
                    setIsDropdownOpen(false);
                    setSettingsActiveTab("keyboard");
                    setSettingsDialogOpen(true);
                }} class="gap-2">
                            <icons_2.KeyboardIcon class="h-3.5 w-3.5 text-muted-foreground shrink-0"/>
                            <span class="flex-1">Shortcuts</span>
                          </dropdown_menu_1.DropdownMenuItem>}
                      </dropdown_menu_1.DropdownMenuSubContent>
                    </dropdown_menu_1.DropdownMenuSub>
                  </>}
              </dropdown_menu_1.DropdownMenuContent>
            </dropdown_menu_1.DropdownMenu>
          </div>
        </div>
      </div>
    </div>;
});
var HelpSection = memo(function HelpSection(_a) {
    var isMobile = _a.isMobile;
    var _b = (0, jotai_1.useAtom)(atoms_1.agentsHelpPopoverOpenAtom), helpPopoverOpen = _b[0], setHelpPopoverOpen = _b[1];
    var _c = (0, solid_js_1.createSignal)(false), blockHelpTooltip = _c[0], setBlockHelpTooltip = _c[1];
    var _d = (0, solid_js_1.createSignal)(false), prevHelpPopoverOpen = _d[0], setPrevHelpPopoverOpen = _d[1];
    var _e = (0, solid_js_1.createSignal)(null), helpButtonRef = _e[0], setHelpButtonRef = _e[1];
    // Handle tooltip blocking when popover closes
    (0, solid_js_1.createEffect)(function () {
        var _a;
        if (prevHelpPopoverOpen.current && !helpPopoverOpen) {
            (_a = helpButtonRef.current) === null || _a === void 0 ? void 0 : _a.blur();
            setBlockHelpTooltip(true);
            var timer_2 = setTimeout(function () { return setBlockHelpTooltip(false); }, 300);
            prevHelpPopoverOpen.current = helpPopoverOpen;
            return function () { return clearTimeout(timer_2); };
        }
        prevHelpPopoverOpen.current = helpPopoverOpen;
    });
    return <tooltip_1.Tooltip delayDuration={500} open={helpPopoverOpen || blockHelpTooltip ? false : undefined}>
      <tooltip_1.TooltipTrigger asChild>
        <div>
          <agents_help_popover_1.AgentsHelpPopover open={helpPopoverOpen} onOpenChange={setHelpPopoverOpen} isMobile={isMobile}>
            <button ref={helpButtonRef} type="button" class="flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.97] outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70" suppressHydrationWarning>
              <icons_2.QuestionCircleIcon class="h-4 w-4"/>
            </button>
          </agents_help_popover_1.AgentsHelpPopover>
        </div>
      </tooltip_1.TooltipTrigger>
      <tooltip_1.TooltipContent>Help</tooltip_1.TooltipContent>
    </tooltip_1.Tooltip>;
});
function AgentsSidebar(_a) {
    var _this = this;
    var _b;
    var _c = _a.userId, userId = _c === void 0 ? "demo-user-id" : _c, _d = _a.clerkUser, clerkUser = _d === void 0 ? null : _d, _e = _a.desktopUser, desktopUser = _e === void 0 ? {
        id: "demo-user-id",
        email: "demo@example.com",
        name: "Demo User"
    } : _e, _f = _a.onSignOut, onSignOut = _f === void 0 ? function () { } : _f, onToggleSidebar = _a.onToggleSidebar, _g = _a.isMobileFullscreen, isMobileFullscreen = _g === void 0 ? false : _g, onChatSelect = _a.onChatSelect;
    var _h = (0, jotai_1.useAtom)(atoms_2.selectedAgentChatIdAtom), selectedChatId = _h[0], setSelectedChatId = _h[1];
    var _j = (0, jotai_1.useAtom)(atoms_2.selectedChatIsRemoteAtom), selectedChatIsRemote = _j[0], setSelectedChatIsRemote = _j[1];
    var previousChatId = (0, jotai_1.useAtomValue)(atoms_2.previousAgentChatIdAtom);
    var autoAdvanceTarget = (0, jotai_1.useAtomValue)(atoms_1.autoAdvanceTargetAtom);
    var _k = (0, jotai_1.useAtom)(atoms_2.selectedDraftIdAtom), selectedDraftId = _k[0], setSelectedDraftId = _k[1];
    var setShowNewChatForm = (0, jotai_1.useSetAtom)(atoms_2.showNewChatFormAtom);
    var loadingSubChats = (0, jotai_1.useAtom)(atoms_2.loadingSubChatsAtom)[0];
    var pendingQuestions = (0, jotai_1.useAtomValue)(atoms_2.pendingUserQuestionsAtom);
    // Use ref instead of state to avoid re-renders on hover
    var _l = (0, solid_js_1.createSignal)(false), isSidebarHoveredRef = _l[0], setIsSidebarHoveredRef = _l[1];
    var _m = (0, solid_js_1.createSignal)(null), closeButtonRef = _m[0], setCloseButtonRef = _m[1];
    var _o = (0, solid_js_1.createSignal)(""), searchQuery = _o[0], setSearchQuery = _o[1];
    var _p = (0, solid_js_1.createSignal)(-1), focusedChatIndex = _p[0], setFocusedChatIndex = _p[1];
    var _q = (0, solid_js_1.createSignal)(-1), hoveredChatIndexRef = _q[0], setHoveredChatIndexRef = _q[1];
    // Global desktop/fullscreen state from atoms (initialized in AgentsLayout)
    var isDesktop = (0, jotai_1.useAtomValue)(atoms_1.isDesktopAtom);
    var isFullscreen = (0, jotai_1.useAtomValue)(atoms_1.isFullscreenAtom);
    // Multi-select state
    var _r = (0, jotai_1.useAtom)(atoms_1.selectedAgentChatIdsAtom), selectedChatIds = _r[0], setSelectedChatIds = _r[1];
    var isMultiSelectMode = (0, jotai_1.useAtomValue)(atoms_1.isAgentMultiSelectModeAtom);
    var selectedChatsCount = (0, jotai_1.useAtomValue)(atoms_1.selectedAgentChatsCountAtom);
    var toggleChatSelection = (0, jotai_1.useSetAtom)(atoms_1.toggleAgentChatSelectionAtom);
    var selectAllChats = (0, jotai_1.useSetAtom)(atoms_1.selectAllAgentChatsAtom);
    var clearChatSelection = (0, jotai_1.useSetAtom)(atoms_1.clearAgentChatSelectionAtom);
    // Scroll gradient refs - use DOM manipulation to avoid re-renders
    var _s = (0, solid_js_1.createSignal)(null), topGradientRef = _s[0], setTopGradientRef = _s[1];
    var _t = (0, solid_js_1.createSignal)(null), bottomGradientRef = _t[0], setBottomGradientRef = _t[1];
    var _u = (0, solid_js_1.createSignal)(null), scrollContainerRef = _u[0], setScrollContainerRef = _u[1];
    // Multiple drafts state - uses event-based sync instead of polling
    var drafts = (0, drafts_1.useNewChatDrafts)();
    // Read unseen changes from global atoms
    var unseenChanges = (0, jotai_1.useAtomValue)(atoms_2.agentsUnseenChangesAtom);
    var justCreatedIds = (0, jotai_1.useAtomValue)(atoms_2.justCreatedIdsAtom);
    // Haptic feedback
    var triggerHaptic = (0, use_haptic_1.useHaptic)().trigger;
    // Resolved hotkey for tooltip
    var newWorkspaceHotkey = (0, hotkeys_1.useResolvedHotkeyDisplay)("new-workspace");
    // Rename dialog state
    var _v = (0, solid_js_1.createSignal)(false), renameDialogOpen = _v[0], setRenameDialogOpen = _v[1];
    var _w = (0, solid_js_1.createSignal)(null), renamingChat = _w[0], setRenamingChat = _w[1];
    var _x = (0, solid_js_1.createSignal)(false), renameLoading = _x[0], setRenameLoading = _x[1];
    // Confirm archive dialog state
    var _y = (0, solid_js_1.createSignal)(false), confirmArchiveDialogOpen = _y[0], setConfirmArchiveDialogOpen = _y[1];
    var _z = (0, solid_js_1.createSignal)(null), archivingChatId = _z[0], setArchivingChatId = _z[1];
    var _0 = (0, solid_js_1.createSignal)(0), activeProcessCount = _0[0], setActiveProcessCount = _0[1];
    var _1 = (0, solid_js_1.createSignal)(false), hasWorktree = _1[0], setHasWorktree = _1[1];
    var _2 = (0, solid_js_1.createSignal)(0), uncommittedCount = _2[0], setUncommittedCount = _2[1];
    // Import sandbox dialog state
    var _3 = (0, solid_js_1.createSignal)(false), importDialogOpen = _3[0], setImportDialogOpen = _3[1];
    var _4 = (0, solid_js_1.createSignal)(null), importingChatId = _4[0], setImportingChatId = _4[1];
    // Track initial mount to skip footer animation on load
    var _5 = (0, solid_js_1.createSignal)(false), hasFooterAnimated = _5[0], setHasFooterAnimated = _5[1];
    // Pinned chats (stored in localStorage per project)
    var _6 = (0, solid_js_1.createSignal)(new Set()), pinnedChatIds = _6[0], setPinnedChatIds = _6[1];
    var _7 = (0, solid_js_1.createSignal)(null), searchInputRef = _7[0], setSearchInputRef = _7[1];
    // Agent name tooltip refs (for truncated names) - using DOM manipulation to avoid re-renders
    var _8 = (0, solid_js_1.createSignal)(null), agentTooltipRef = _8[0], setAgentTooltipRef = _8[1];
    var _9 = (0, solid_js_1.createSignal)(new Map()), nameRefs = _9[0], setNameRefs = _9[1];
    var _10 = (0, solid_js_1.createSignal)(null), agentTooltipTimerRef = _10[0], setAgentTooltipTimerRef = _10[1];
    var setSettingsDialogOpen = (0, jotai_1.useSetAtom)(atoms_1.agentsSettingsDialogOpenAtom);
    var setSettingsActiveTab = (0, jotai_1.useSetAtom)(atoms_1.agentsSettingsDialogActiveTabAtom);
    var isAuthLoaded = useCombinedAuth().isLoaded;
    var _11 = (0, solid_js_1.createSignal)(false), showAuthDialog = _11[0], setShowAuthDialog = _11[1];
    var setCreateTeamDialogOpen = (0, jotai_1.useSetAtom)(atoms_1.createTeamDialogOpenAtom);
    // Debug mode for testing first-time user experience
    var debugMode = (0, jotai_1.useAtomValue)(atoms_2.agentsDebugModeAtom);
    // Sidebar appearance settings
    var showWorkspaceIcon = (0, jotai_1.useAtomValue)(atoms_1.showWorkspaceIconAtom);
    // Desktop: use selectedProject instead of teams
    var selectedProject = (0, jotai_1.useAtom)(atoms_2.selectedProjectAtom)[0];
    // Keep chatSourceModeAtom for backwards compatibility (used in other places)
    var _12 = (0, jotai_1.useAtom)(atoms_1.chatSourceModeAtom), chatSourceMode = _12[0], setChatSourceMode = _12[1];
    var teamId = (0, jotai_1.useAtomValue)(atoms_1.selectedTeamIdAtom);
    // Sync chatSourceMode with selectedChatIsRemote on startup
    // This fixes the race condition where atoms load independently from localStorage
    var _13 = (0, solid_js_1.createSignal)(false), hasRunStartupSync = _13[0], setHasRunStartupSync = _13[1];
    (0, solid_js_1.createEffect)(function () {
        if (hasRunStartupSync.current)
            return;
        hasRunStartupSync.current = true;
        var correctMode = selectedChatIsRemote ? "sandbox" : "local";
        if (chatSourceMode !== correctMode) {
            setChatSourceMode(correctMode);
        }
    });
    // Fetch all local chats (no project filter)
    var localChats = trpc_1.trpc.chats.list.useQuery({}).data;
    // Fetch user's teams (same as web) - always enabled to allow merged list
    var _14 = (0, use_remote_chats_1.useUserTeams)(true), teams = _14.data, isTeamsLoading = _14.isLoading, isTeamsError = _14.isError;
    // Fetch remote sandbox chats (same as web) - requires teamId
    var remoteChats = (0, use_remote_chats_1.useRemoteChats)().data;
    // Prefetch individual chat data on hover
    var prefetchRemoteChat = (0, use_remote_chats_1.usePrefetchRemoteChat)();
    // Merge local and remote chats into unified list
    var agentChats = (0, solid_js_1.createMemo)(function () {
        var _a, _b;
        var unified = [];
        // Add local chats
        if (localChats) {
            for (var _i = 0, localChats_1 = localChats; _i < localChats_1.length; _i++) {
                var chat = localChats_1[_i];
                unified.push({
                    id: chat.id,
                    name: chat.name,
                    createdAt: chat.createdAt,
                    updatedAt: chat.updatedAt,
                    archivedAt: chat.archivedAt,
                    projectId: chat.projectId,
                    worktreePath: chat.worktreePath,
                    branch: chat.branch,
                    baseBranch: chat.baseBranch,
                    prUrl: chat.prUrl,
                    prNumber: chat.prNumber,
                    isRemote: false
                });
            }
        }
        // Add remote chats with prefixed IDs to avoid collisions
        if (remoteChats) {
            for (var _c = 0, remoteChats_1 = remoteChats; _c < remoteChats_1.length; _c++) {
                var chat = remoteChats_1[_c];
                unified.push({
                    id: "remote_".concat(chat.id),
                    name: chat.name,
                    createdAt: new Date(chat.created_at),
                    updatedAt: new Date(chat.updated_at),
                    archivedAt: null,
                    projectId: null,
                    worktreePath: null,
                    branch: (_b = (_a = chat.meta) === null || _a === void 0 ? void 0 : _a.branch) !== null && _b !== void 0 ? _b : null,
                    baseBranch: null,
                    prUrl: null,
                    prNumber: null,
                    sandboxId: chat.sandbox_id,
                    meta: chat.meta,
                    isRemote: true,
                    remoteStats: chat.stats
                });
            }
        }
        // Sort by updatedAt descending (newest first)
        unified.sort(function (a, b) {
            var _a, _b, _c, _d;
            var aTime = (_b = (_a = a.updatedAt) === null || _a === void 0 ? void 0 : _a.getTime()) !== null && _b !== void 0 ? _b : 0;
            var bTime = (_d = (_c = b.updatedAt) === null || _c === void 0 ? void 0 : _c.getTime()) !== null && _d !== void 0 ? _d : 0;
            return bTime - aTime;
        });
        return unified;
    });
    // Track open sub-chat changes for reactivity
    var _15 = (0, solid_js_1.createSignal)(0), openSubChatsVersion = _15[0], setOpenSubChatsVersion = _15[1];
    (0, solid_js_1.createEffect)(function () {
        var handleChange = function () { return setOpenSubChatsVersion(function (v) { return v + 1; }); };
        window.addEventListener(sub_chat_store_1.OPEN_SUB_CHATS_CHANGE_EVENT, handleChange);
        return function () { return window.removeEventListener(sub_chat_store_1.OPEN_SUB_CHATS_CHANGE_EVENT, handleChange); };
    });
    // Store previous value to avoid unnecessary React Query refetches
    var _16 = (0, solid_js_1.createSignal)([]), prevOpenSubChatIdsRef = _16[0], setPrevOpenSubChatIdsRef = _16[1];
    // Collect all open sub-chat IDs from localStorage for all workspaces
    var allOpenSubChatIds = (0, solid_js_1.createMemo)(function () {
        // openSubChatsVersion is used to trigger recalculation when sub-chats change
        void openSubChatsVersion;
        if (!agentChats)
            return prevOpenSubChatIdsRef.current;
        var windowId = (0, WindowContext_1.getWindowId)();
        var allIds = [];
        for (var _i = 0, agentChats_1 = agentChats; _i < agentChats_1.length; _i++) {
            var chat = agentChats_1[_i];
            try {
                // Use window-prefixed key (matches sub-chat-store.ts)
                var stored = localStorage.getItem("".concat(windowId, ":agent-open-sub-chats-").concat(chat.id));
                if (stored) {
                    var ids = JSON.parse(stored);
                    allIds.push.apply(allIds, ids);
                }
            }
            catch (_a) { }
        }
        // Compare with previous - if content is same, return old reference
        // This prevents React Query from refetching when array content hasn't changed
        var prev = prevOpenSubChatIdsRef.current;
        var sorted = __spreadArray([], allIds, true).sort();
        var prevSorted = __spreadArray([], prev, true).sort();
        if (sorted.length === prevSorted.length && sorted.every(function (id, i) { return id === prevSorted[i]; })) {
            return prev;
        }
        prevOpenSubChatIdsRef.current = allIds;
        return allIds;
    });
    // File changes stats from DB - only for open sub-chats
    var fileStatsData = trpc_1.trpc.chats.getFileStats.useQuery({ openSubChatIds: allOpenSubChatIds }, {
        refetchInterval: 5e3,
        enabled: allOpenSubChatIds.length > 0,
        placeholderData: function (prev) { return prev; }
    }).data;
    // Pending plan approvals from DB - only for open sub-chats
    var pendingPlanApprovalsData = trpc_1.trpc.chats.getPendingPlanApprovals.useQuery({ openSubChatIds: allOpenSubChatIds }, {
        refetchInterval: 5e3,
        enabled: allOpenSubChatIds.length > 0,
        placeholderData: function (prev) { return prev; }
    }).data;
    // Fetch all projects for git info
    var projects = trpc_1.trpc.projects.list.useQuery().data;
    // Auto-import hook for "Open Locally" functionality
    var _17 = (0, use_auto_import_1.useAutoImport)(), getMatchingProjects = _17.getMatchingProjects, autoImport = _17.autoImport, isImporting = _17.isImporting;
    // Create map for quick project lookup by id
    var projectsMap = (0, solid_js_1.createMemo)(function () {
        if (!projects)
            return new Map();
        return new Map(projects.map(function (p) { return [p.id, p]; }));
    });
    // Fetch all archived chats (to get count)
    var archivedChats = trpc_1.trpc.chats.listArchived.useQuery({}).data;
    var archivedChatsCount = (_b = archivedChats === null || archivedChats === void 0 ? void 0 : archivedChats.length) !== null && _b !== void 0 ? _b : 0;
    // Get utils outside of callbacks - hooks must be called at top level
    var utils = trpc_1.trpc.useUtils();
    // Unified undo stack for workspaces and sub-chats (Jotai atom)
    var _18 = (0, jotai_1.useAtom)(atoms_2.undoStackAtom), undoStack = _18[0], setUndoStack = _18[1];
    // Restore chat mutation (for undo)
    var restoreChatMutation = trpc_1.trpc.chats.restore.useMutation({ onSuccess: function (_, variables) {
            utils.chats.list.invalidate();
            utils.chats.listArchived.invalidate();
            // Select the restored chat
            setSelectedChatId(variables.id);
        } });
    // Remove workspace item from stack by chatId
    var removeWorkspaceFromStack = function (chatId) {
        setUndoStack(function (prev) {
            var index = prev.findIndex(function (item) { return item.type === "workspace" && item.chatId === chatId; });
            if (index !== -1) {
                clearTimeout(prev[index].timeoutId);
                return __spreadArray(__spreadArray([], prev.slice(0, index), true), prev.slice(index + 1), true);
            }
            return prev;
        });
    };
    // Remote archive mutations (for sandbox mode)
    var archiveRemoteChatMutation = (0, use_remote_chats_1.useArchiveRemoteChat)();
    var archiveRemoteChatsBatchMutation = (0, use_remote_chats_1.useArchiveRemoteChatsBatch)();
    var restoreRemoteChatMutation = (0, use_remote_chats_1.useRestoreRemoteChat)();
    var renameRemoteChatMutation = (0, use_remote_chats_1.useRenameRemoteChat)();
    // Archive chat mutation
    var archiveChatMutation = trpc_1.trpc.chats.archive.useMutation({ onSuccess: function (_, variables) {
            var _a;
            // Hide tooltip if visible (element may be removed from DOM before mouseLeave fires)
            if (agentTooltipTimerRef.current) {
                clearTimeout(agentTooltipTimerRef.current);
                agentTooltipTimerRef.current = null;
            }
            if (agentTooltipRef.current) {
                agentTooltipRef.current.style.display = "none";
            }
            utils.chats.list.invalidate();
            utils.chats.listArchived.invalidate();
            // If archiving the currently selected chat, navigate based on auto-advance setting
            if (selectedChatId === variables.id) {
                var currentIndex_1 = (_a = agentChats === null || agentChats === void 0 ? void 0 : agentChats.findIndex(function (c) { return c.id === variables.id; })) !== null && _a !== void 0 ? _a : -1;
                if (autoAdvanceTarget === "next") {
                    // Find next workspace in list (after current index)
                    var nextChat = agentChats === null || agentChats === void 0 ? void 0 : agentChats.find(function (c, i) { return i > currentIndex_1 && c.id !== variables.id; });
                    if (nextChat) {
                        setSelectedChatId(nextChat.id);
                    }
                    else {
                        // No next workspace, go to new workspace view
                        setSelectedChatId(null);
                    }
                }
                else if (autoAdvanceTarget === "previous") {
                    // Go to previously selected workspace
                    var isPreviousAvailable = previousChatId && (agentChats === null || agentChats === void 0 ? void 0 : agentChats.some(function (c) { return c.id === previousChatId && c.id !== variables.id; }));
                    if (isPreviousAvailable) {
                        setSelectedChatId(previousChatId);
                    }
                    else {
                        setSelectedChatId(null);
                    }
                }
                else {
                    // Close: go to new workspace view
                    setSelectedChatId(null);
                }
            }
            // Clear after 10 seconds (Cmd+Z window)
            var timeoutId = setTimeout(function () {
                removeWorkspaceFromStack(variables.id);
            }, 1e4);
            // Add to unified undo stack for Cmd+Z
            setUndoStack(function (prev) { return __spreadArray(__spreadArray([], prev, true), [{
                    type: "workspace",
                    chatId: variables.id,
                    timeoutId: timeoutId
                }], false); });
        } });
    // Cmd+Z to undo archive (supports multiple undos for workspaces AND sub-chats)
    (0, solid_js_1.createEffect)(function () {
        var handleKeyDown = function (e) {
            if ((e.metaKey || e.ctrlKey) && e.key === "z" && undoStack.length > 0) {
                e.preventDefault();
                // Get the most recent item
                var lastItem = undoStack[undoStack.length - 1];
                if (!lastItem)
                    return;
                // Clear timeout and remove from stack
                clearTimeout(lastItem.timeoutId);
                setUndoStack(function (prev) { return prev.slice(0, -1); });
                if (lastItem.type === "workspace") {
                    // Restore workspace from archive
                    if (lastItem.isRemote) {
                        // Strip remote_ prefix before calling API (stored with prefix for undo stack identification)
                        var originalId_1 = lastItem.chatId.replace(/^remote_/, "");
                        restoreRemoteChatMutation.mutate(originalId_1, {
                            onSuccess: function () {
                                setSelectedChatId(originalId_1);
                                setSelectedChatIsRemote(true);
                                setChatSourceMode("sandbox");
                            },
                            onError: function (error) {
                                console.error("[handleUndo] Failed to restore remote workspace:", error);
                                solid_sonner_1.toast.error("Failed to restore workspace");
                            }
                        });
                    }
                    else {
                        restoreChatMutation.mutate({ id: lastItem.chatId });
                    }
                }
                else if (lastItem.type === "subchat") {
                    // Restore sub-chat tab (re-add to open tabs)
                    var store = sub_chat_store_1.useAgentSubChatStore.getState();
                    store.addToOpenSubChats(lastItem.subChatId);
                    store.setActiveSubChat(lastItem.subChatId);
                }
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return function () { return window.removeEventListener("keydown", handleKeyDown); };
    });
    // Batch archive mutation
    var archiveChatsBatchMutation = trpc_1.trpc.chats.archiveBatch.useMutation({ onSuccess: function (_, variables) {
            // Hide tooltip if visible (element may be removed from DOM before mouseLeave fires)
            if (agentTooltipTimerRef.current) {
                clearTimeout(agentTooltipTimerRef.current);
                agentTooltipTimerRef.current = null;
            }
            if (agentTooltipRef.current) {
                agentTooltipRef.current.style.display = "none";
            }
            utils.chats.list.invalidate();
            utils.chats.listArchived.invalidate();
            // Add each chat to unified undo stack for Cmd+Z
            var newItems = variables.chatIds.map(function (chatId) {
                var timeoutId = setTimeout(function () {
                    removeWorkspaceFromStack(chatId);
                }, 1e4);
                return {
                    type: "workspace",
                    chatId: chatId,
                    timeoutId: timeoutId
                };
            });
            setUndoStack(function (prev) { return __spreadArray(__spreadArray([], prev, true), newItems, true); });
        } });
    // Reset selected chat when project changes (but not on initial load)
    var _19 = (0, solid_js_1.createSignal)(undefined), prevProjectIdRef = _19[0], setPrevProjectIdRef = _19[1];
    (0, solid_js_1.createEffect)(function () {
        var _a, _b;
        // Skip on initial mount (prevProjectIdRef is undefined)
        if (prevProjectIdRef.current === undefined) {
            prevProjectIdRef.current = (_a = selectedProject === null || selectedProject === void 0 ? void 0 : selectedProject.id) !== null && _a !== void 0 ? _a : null;
            return;
        }
        // Only reset if project actually changed from a real value (not from null/initial load)
        if (prevProjectIdRef.current !== null && prevProjectIdRef.current !== (selectedProject === null || selectedProject === void 0 ? void 0 : selectedProject.id) && selectedChatId) {
            setSelectedChatId(null);
        }
        prevProjectIdRef.current = (_b = selectedProject === null || selectedProject === void 0 ? void 0 : selectedProject.id) !== null && _b !== void 0 ? _b : null;
    });
    // Load pinned IDs from localStorage when project changes
    (0, solid_js_1.createEffect)(function () {
        if (!(selectedProject === null || selectedProject === void 0 ? void 0 : selectedProject.id)) {
            setPinnedChatIds(new Set());
            return;
        }
        try {
            var stored = localStorage.getItem("agent-pinned-chats-".concat(selectedProject.id));
            setPinnedChatIds(stored ? new Set(JSON.parse(stored)) : new Set());
        }
        catch (_a) {
            setPinnedChatIds(new Set());
        }
    });
    // Save pinned IDs to localStorage when they change
    var _20 = (0, solid_js_1.createSignal)(new Set()), prevPinnedRef = _20[0], setPrevPinnedRef = _20[1];
    (0, solid_js_1.createEffect)(function () {
        if (!(selectedProject === null || selectedProject === void 0 ? void 0 : selectedProject.id))
            return;
        // Only save if pinnedChatIds actually changed (avoid saving on load)
        if (pinnedChatIds !== prevPinnedRef.current && pinnedChatIds.size > 0 || prevPinnedRef.current.size > 0) {
            localStorage.setItem("agent-pinned-chats-".concat(selectedProject.id), JSON.stringify(__spreadArray([], pinnedChatIds, true)));
        }
        prevPinnedRef.current = pinnedChatIds;
    });
    // Rename mutation
    var renameChatMutation = trpc_1.trpc.chats.rename.useMutation({
        onSuccess: function () {
            utils.chats.list.invalidate();
        },
        onError: function () {
            solid_sonner_1.toast.error("Failed to rename agent");
        }
    });
    var handleTogglePin = function (chatId) {
        setPinnedChatIds(function (prev) {
            var next = new Set(prev);
            if (next.has(chatId)) {
                next.delete(chatId);
            }
            else {
                next.add(chatId);
            }
            return next;
        });
    };
    var handleRenameClick = function (chat) {
        setRenamingChat(chat);
        setRenameDialogOpen(true);
    };
    var handleRenameSave = function (newName) { return __awaiter(_this, void 0, void 0, function () {
        var chatId, oldName, isRemote, _a, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!renamingChat)
                        return [2 /*return*/];
                    chatId = renamingChat.id;
                    oldName = renamingChat.name;
                    isRemote = renamingChat.isRemote;
                    setRenameLoading(true);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 8, 9, 10]);
                    if (!isRemote) return [3 /*break*/, 3];
                    // Remote chat rename
                    return [4 /*yield*/, renameRemoteChatMutation.mutateAsync({
                            chatId: chatId,
                            name: newName
                        })];
                case 2:
                    // Remote chat rename
                    _b.sent();
                    return [3 /*break*/, 7];
                case 3:
                    // Local chat rename - optimistically update the query cache
                    utils.chats.list.setData({}, function (old) {
                        if (!old)
                            return old;
                        return old.map(function (c) { return c.id === chatId ? __assign(__assign({}, c), { name: newName }) : c; });
                    });
                    _b.label = 4;
                case 4:
                    _b.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, renameChatMutation.mutateAsync({
                            id: chatId,
                            name: newName
                        })];
                case 5:
                    _b.sent();
                    return [3 /*break*/, 7];
                case 6:
                    _a = _b.sent();
                    // Rollback on error
                    utils.chats.list.setData({}, function (old) {
                        if (!old)
                            return old;
                        return old.map(function (c) { return c.id === chatId ? __assign(__assign({}, c), { name: oldName }) : c; });
                    });
                    throw new Error("Failed to rename local workspace");
                case 7:
                    setRenameDialogOpen(false);
                    return [3 /*break*/, 10];
                case 8:
                    error_1 = _b.sent();
                    console.error("[handleRenameSave] Rename failed:", error_1);
                    solid_sonner_1.toast.error(isRemote ? "Failed to rename remote workspace" : "Failed to rename workspace");
                    return [3 /*break*/, 10];
                case 9:
                    setRenameLoading(false);
                    setRenamingChat(null);
                    return [7 /*endfinally*/];
                case 10: return [2 /*return*/];
            }
        });
    }); };
    // Check if all selected chats are pinned
    var areAllSelectedPinned = (0, solid_js_1.createMemo)(function () {
        if (selectedChatIds.size === 0)
            return false;
        return Array.from(selectedChatIds).every(function (id) { return pinnedChatIds.has(id); });
    });
    // Check if all selected chats are unpinned
    var areAllSelectedUnpinned = (0, solid_js_1.createMemo)(function () {
        if (selectedChatIds.size === 0)
            return false;
        return Array.from(selectedChatIds).every(function (id) { return !pinnedChatIds.has(id); });
    });
    // Show pin option only if all selected have same pin state
    var canShowPinOption = areAllSelectedPinned || areAllSelectedUnpinned;
    // Handle bulk pin of selected chats
    var handleBulkPin = function () {
        var chatIdsToPin = Array.from(selectedChatIds);
        if (chatIdsToPin.length > 0) {
            setPinnedChatIds(function (prev) {
                var next = new Set(prev);
                chatIdsToPin.forEach(function (id) { return next.add(id); });
                return next;
            });
            clearChatSelection();
        }
    };
    // Handle bulk unpin of selected chats
    var handleBulkUnpin = function () {
        var chatIdsToUnpin = Array.from(selectedChatIds);
        if (chatIdsToUnpin.length > 0) {
            setPinnedChatIds(function (prev) {
                var next = new Set(prev);
                chatIdsToUnpin.forEach(function (id) { return next.delete(id); });
                return next;
            });
            clearChatSelection();
        }
    };
    // Get clerk username
    var clerkUsername = clerkUser === null || clerkUser === void 0 ? void 0 : clerkUser.username;
    // Filter and separate pinned/unpinned agents
    var _21 = (0, solid_js_1.createMemo)(function () {
        if (!agentChats)
            return {
                pinnedAgents: [],
                unpinnedAgents: [],
                filteredChats: []
            };
        var filtered = searchQuery.trim() ? agentChats.filter(function (chat) { var _a; return ((_a = chat.name) !== null && _a !== void 0 ? _a : "").toLowerCase().includes(searchQuery.toLowerCase()); }) : agentChats;
        var pinned = filtered.filter(function (chat) { return pinnedChatIds.has(chat.id); });
        var unpinned = filtered.filter(function (chat) { return !pinnedChatIds.has(chat.id); });
        return {
            pinnedAgents: pinned,
            unpinnedAgents: unpinned,
            filteredChats: __spreadArray(__spreadArray([], pinned, true), unpinned, true)
        };
    }), pinnedAgents = _21.pinnedAgents, unpinnedAgents = _21.unpinnedAgents, filteredChats = _21.filteredChats;
    // Handle bulk archive of selected chats
    var handleBulkArchive = function () {
        var chatIdsToArchive = Array.from(selectedChatIds);
        if (chatIdsToArchive.length === 0)
            return;
        // Separate remote and local chats
        var remoteIds = [];
        var localIds = [];
        var _loop_1 = function (chatId) {
            var chat = agentChats === null || agentChats === void 0 ? void 0 : agentChats.find(function (c) { return c.id === chatId; });
            if (chat === null || chat === void 0 ? void 0 : chat.isRemote) {
                // Extract original ID from prefixed remote ID
                remoteIds.push(chatId.replace(/^remote_/, ""));
            }
            else {
                localIds.push(chatId);
            }
        };
        for (var _i = 0, chatIdsToArchive_1 = chatIdsToArchive; _i < chatIdsToArchive_1.length; _i++) {
            var chatId = chatIdsToArchive_1[_i];
            _loop_1(chatId);
        }
        // If active chat is being archived, navigate to previous or new workspace
        var isArchivingActiveChat = selectedChatId && chatIdsToArchive.includes(selectedChatId);
        var onSuccessCallback = function () {
            if (isArchivingActiveChat) {
                // Check if previous chat is available (exists and not being archived)
                var remainingChats = filteredChats.filter(function (c) { return !chatIdsToArchive.includes(c.id); });
                var isPreviousAvailable = previousChatId && remainingChats.some(function (c) { return c.id === previousChatId; });
                if (isPreviousAvailable) {
                    setSelectedChatId(previousChatId);
                }
                else {
                    setSelectedChatId(null);
                }
            }
            clearChatSelection();
        };
        // Track completions for combined callback
        var completedCount = 0;
        var expectedCount = (remoteIds.length > 0 ? 1 : 0) + (localIds.length > 0 ? 1 : 0);
        var handlePartialSuccess = function (archivedIds, isRemote) {
            // Add remote chats to undo stack
            if (isRemote) {
                var newItems_1 = archivedIds.map(function (id) {
                    var timeoutId = setTimeout(function () { return removeWorkspaceFromStack("remote_".concat(id)); }, 1e4);
                    return {
                        type: "workspace",
                        chatId: "remote_".concat(id),
                        timeoutId: timeoutId,
                        isRemote: true
                    };
                });
                setUndoStack(function (prev) { return __spreadArray(__spreadArray([], prev, true), newItems_1, true); });
            }
            completedCount++;
            if (completedCount === expectedCount) {
                onSuccessCallback();
            }
        };
        // Archive remote chats
        if (remoteIds.length > 0) {
            archiveRemoteChatsBatchMutation.mutate(remoteIds, { onSuccess: function () { return handlePartialSuccess(remoteIds, true); } });
        }
        // Archive local chats
        if (localIds.length > 0) {
            archiveChatsBatchMutation.mutate({ chatIds: localIds }, { onSuccess: function () { return handlePartialSuccess(localIds, false); } });
        }
    };
    var handleArchiveAllBelow = function (chatId) {
        var currentIndex = filteredChats.findIndex(function (c) { return c.id === chatId; });
        if (currentIndex === -1 || currentIndex === filteredChats.length - 1)
            return;
        var chatsBelow = filteredChats.slice(currentIndex + 1);
        // Separate remote and local chats
        var remoteIds = [];
        var localIds = [];
        for (var _i = 0, chatsBelow_1 = chatsBelow; _i < chatsBelow_1.length; _i++) {
            var chat = chatsBelow_1[_i];
            if (chat.isRemote) {
                remoteIds.push(chat.id.replace(/^remote_/, ""));
            }
            else {
                localIds.push(chat.id);
            }
        }
        // Archive remote chats
        if (remoteIds.length > 0) {
            archiveRemoteChatsBatchMutation.mutate(remoteIds, { onSuccess: function () {
                    var newItems = remoteIds.map(function (id) {
                        var timeoutId = setTimeout(function () { return removeWorkspaceFromStack("remote_".concat(id)); }, 1e4);
                        return {
                            type: "workspace",
                            chatId: "remote_".concat(id),
                            timeoutId: timeoutId,
                            isRemote: true
                        };
                    });
                    setUndoStack(function (prev) { return __spreadArray(__spreadArray([], prev, true), newItems, true); });
                } });
        }
        // Archive local chats
        if (localIds.length > 0) {
            archiveChatsBatchMutation.mutate({ chatIds: localIds });
        }
    };
    var handleArchiveOthers = function (chatId) {
        var otherChats = filteredChats.filter(function (c) { return c.id !== chatId; });
        // Separate remote and local chats
        var remoteIds = [];
        var localIds = [];
        for (var _i = 0, otherChats_1 = otherChats; _i < otherChats_1.length; _i++) {
            var chat = otherChats_1[_i];
            if (chat.isRemote) {
                remoteIds.push(chat.id.replace(/^remote_/, ""));
            }
            else {
                localIds.push(chat.id);
            }
        }
        // Archive remote chats
        if (remoteIds.length > 0) {
            archiveRemoteChatsBatchMutation.mutate(remoteIds, { onSuccess: function () {
                    var newItems = remoteIds.map(function (id) {
                        var timeoutId = setTimeout(function () { return removeWorkspaceFromStack("remote_".concat(id)); }, 1e4);
                        return {
                            type: "workspace",
                            chatId: "remote_".concat(id),
                            timeoutId: timeoutId,
                            isRemote: true
                        };
                    });
                    setUndoStack(function (prev) { return __spreadArray(__spreadArray([], prev, true), newItems, true); });
                } });
        }
        // Archive local chats
        if (localIds.length > 0) {
            archiveChatsBatchMutation.mutate({ chatIds: localIds });
        }
    };
    // Delete a draft from localStorage
    var handleDeleteDraft = function (draftId) {
        (0, drafts_1.deleteNewChatDraft)(draftId);
        // If the deleted draft was selected, clear selection
        if (selectedDraftId === draftId) {
            setSelectedDraftId(null);
        }
    };
    // Select a draft for editing
    var handleDraftSelect = function (draftId) {
        // Navigate to NewChatForm with this draft selected
        setSelectedChatId(null);
        setSelectedDraftId(draftId);
        setShowNewChatForm(false);
        if (isMobileFullscreen && onChatSelect) {
            onChatSelect();
        }
    };
    // Reset focused index when search query changes
    (0, solid_js_1.createEffect)(function () {
        setFocusedChatIndex(-1);
    });
    // Scroll focused item into view
    (0, solid_js_1.createEffect)(function () {
        var _a;
        if (focusedChatIndex >= 0 && filteredChats.length > 0) {
            var focusedElement = (_a = scrollContainerRef.current) === null || _a === void 0 ? void 0 : _a.querySelector("[data-chat-index=\"".concat(focusedChatIndex, "\"]"));
            if (focusedElement) {
                focusedElement.scrollIntoView({
                    block: "nearest",
                    behavior: "smooth"
                });
            }
        }
    });
    // Derive which chats have loading sub-chats
    var loadingChatIds = (0, solid_js_1.createMemo)(function () { return new Set(__spreadArray([], loadingSubChats.values(), true)); });
    // Convert file stats to a Map for easy lookup (only for local chats)
    // Remote chat stats are provided directly via chat.remoteStats
    var workspaceFileStats = (0, solid_js_1.createMemo)(function () {
        var statsMap = new Map();
        // For local mode, use stats from DB query
        if (fileStatsData) {
            for (var _i = 0, fileStatsData_1 = fileStatsData; _i < fileStatsData_1.length; _i++) {
                var stat = fileStatsData_1[_i];
                statsMap.set(stat.chatId, {
                    fileCount: stat.fileCount,
                    additions: stat.additions,
                    deletions: stat.deletions
                });
            }
        }
        return statsMap;
    });
    // Aggregate pending plan approvals by workspace (chatId) from DB
    var workspacePendingPlans = (0, solid_js_1.createMemo)(function () {
        var chatIdsWithPendingPlans = new Set();
        if (pendingPlanApprovalsData) {
            for (var _i = 0, pendingPlanApprovalsData_1 = pendingPlanApprovalsData; _i < pendingPlanApprovalsData_1.length; _i++) {
                var chatId = pendingPlanApprovalsData_1[_i].chatId;
                chatIdsWithPendingPlans.add(chatId);
            }
        }
        return chatIdsWithPendingPlans;
    });
    // Get workspace IDs that have pending user questions
    var workspacePendingQuestions = (0, solid_js_1.createMemo)(function () {
        var chatIds = new Set();
        for (var _i = 0, _a = pendingQuestions.values(); _i < _a.length; _i++) {
            var question = _a[_i];
            chatIds.add(question.parentChatId);
        }
        return chatIds;
    });
    var handleNewAgent = function () {
        triggerHaptic("light");
        setSelectedChatId(null);
        setSelectedDraftId(null);
        setShowNewChatForm(true);
        // On mobile, switch to chat mode to show NewChatForm
        if (isMobileFullscreen && onChatSelect) {
            onChatSelect();
        }
    };
    var handleChatClick = function (chatId, e, globalIndex) {
        // Shift+click for range selection (works in both normal and multi-select mode)
        if (e === null || e === void 0 ? void 0 : e.shiftKey) {
            e.preventDefault();
            var clickedIndex = globalIndex !== null && globalIndex !== void 0 ? globalIndex : filteredChats.findIndex(function (c) { return c.id === chatId; });
            if (clickedIndex === -1)
                return;
            // Find the anchor: use active chat or last selected item
            var anchorIndex = -1;
            // First try: use currently active/selected chat as anchor
            if (selectedChatId) {
                anchorIndex = filteredChats.findIndex(function (c) { return c.id === selectedChatId; });
            }
            // If no active chat, try to use the last item in selection
            if (anchorIndex === -1 && selectedChatIds.size > 0) {
                // Find the first selected item in the list as anchor
                for (var i = 0; i < filteredChats.length; i++) {
                    if (selectedChatIds.has(filteredChats[i].id)) {
                        anchorIndex = i;
                        break;
                    }
                }
            }
            // If still no anchor, just select the clicked item
            if (anchorIndex === -1) {
                if (!selectedChatIds.has(chatId)) {
                    toggleChatSelection(chatId);
                }
                return;
            }
            // Select range from anchor to clicked item
            var startIndex = Math.min(anchorIndex, clickedIndex);
            var endIndex = Math.max(anchorIndex, clickedIndex);
            // Build new selection set with the range
            var newSelection = new Set(selectedChatIds);
            for (var i = startIndex; i <= endIndex; i++) {
                var chat = filteredChats[i];
                if (chat) {
                    newSelection.add(chat.id);
                }
            }
            setSelectedChatIds(newSelection);
            return;
        }
        // In multi-select mode, clicking on the item still navigates to the chat
        // Only clicking on the checkbox toggles selection
        // Check if this is a remote chat (has remote_ prefix)
        var isRemote = chatId.startsWith("remote_");
        // Extract original ID for remote chats
        var originalId = isRemote ? chatId.replace(/^remote_/, "") : chatId;
        setSelectedChatId(originalId);
        setSelectedChatIsRemote(isRemote);
        // Sync chatSourceMode for ChatView to load data from correct source
        setChatSourceMode(isRemote ? "sandbox" : "local");
        setShowNewChatForm(false);
        // On mobile, notify parent to switch to chat mode
        if (isMobileFullscreen && onChatSelect) {
            onChatSelect();
        }
    };
    var handleCheckboxClick = function (e, chatId) {
        e.stopPropagation();
        toggleChatSelection(chatId);
    };
    var formatTime = function (dateStr) {
        var date = new Date(dateStr);
        var now = new Date();
        var diffMs = now.getTime() - date.getTime();
        var diffMins = Math.floor(diffMs / 6e4);
        var diffHours = Math.floor(diffMs / 36e5);
        var diffDays = Math.floor(diffMs / 864e5);
        if (diffMins < 1)
            return "now";
        if (diffMins < 60)
            return "".concat(diffMins, "m");
        if (diffHours < 24)
            return "".concat(diffHours, "h");
        if (diffDays < 7)
            return "".concat(diffDays, "d");
        if (diffDays < 30)
            return "".concat(Math.floor(diffDays / 7), "w");
        if (diffDays < 365)
            return "".concat(Math.floor(diffDays / 30), "mo");
        return "".concat(Math.floor(diffDays / 365), "y");
    };
    // Archive single chat - wrapped for memoized component
    // Checks for active terminal processes and worktree, shows confirmation dialog if needed
    var handleArchiveSingle = function (chatId) { return __awaiter(_this, void 0, void 0, function () {
        var chat, chatIsRemote, originalId, _a, sessionCount, worktreeStatus, needsConfirmation;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    chat = agentChats === null || agentChats === void 0 ? void 0 : agentChats.find(function (c) { return c.id === chatId; });
                    chatIsRemote = (_b = chat === null || chat === void 0 ? void 0 : chat.isRemote) !== null && _b !== void 0 ? _b : false;
                    // For remote chats, archive directly (no local processes/worktree to check)
                    if (chatIsRemote) {
                        originalId = chatId.replace(/^remote_/, "");
                        archiveRemoteChatMutation.mutate(originalId, {
                            onSuccess: function () {
                                var _a, _b;
                                // Handle navigation after archive (same logic as local)
                                if (selectedChatId === chatId) {
                                    var currentIndex_2 = (_a = agentChats === null || agentChats === void 0 ? void 0 : agentChats.findIndex(function (c) { return c.id === chatId; })) !== null && _a !== void 0 ? _a : -1;
                                    if (autoAdvanceTarget === "next") {
                                        var nextChat = agentChats === null || agentChats === void 0 ? void 0 : agentChats.find(function (c, i) { return i > currentIndex_2 && c.id !== chatId; });
                                        setSelectedChatId((_b = nextChat === null || nextChat === void 0 ? void 0 : nextChat.id) !== null && _b !== void 0 ? _b : null);
                                    }
                                    else if (autoAdvanceTarget === "previous") {
                                        var isPreviousAvailable = previousChatId && (agentChats === null || agentChats === void 0 ? void 0 : agentChats.some(function (c) { return c.id === previousChatId && c.id !== chatId; }));
                                        setSelectedChatId(isPreviousAvailable ? previousChatId : null);
                                    }
                                    else {
                                        setSelectedChatId(null);
                                    }
                                }
                                // Add to undo stack for Cmd+Z
                                var timeoutId = setTimeout(function () {
                                    removeWorkspaceFromStack(chatId);
                                }, 1e4);
                                setUndoStack(function (prev) { return __spreadArray(__spreadArray([], prev, true), [{
                                        type: "workspace",
                                        chatId: chatId,
                                        timeoutId: timeoutId,
                                        isRemote: true
                                    }], false); });
                            },
                            onError: function (error) {
                                console.error("[handleArchiveSingle] Failed to archive remote workspace:", error);
                                solid_sonner_1.toast.error("Failed to archive workspace");
                            }
                        });
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, Promise.all([utils.terminal.getActiveSessionCount.fetch({ workspaceId: chatId }), utils.chats.getWorktreeStatus.fetch({ chatId: chatId })])];
                case 1:
                    _a = _c.sent(), sessionCount = _a[0], worktreeStatus = _a[1];
                    needsConfirmation = sessionCount > 0 || worktreeStatus.hasWorktree;
                    if (needsConfirmation) {
                        // Show confirmation dialog
                        setArchivingChatId(chatId);
                        setActiveProcessCount(sessionCount);
                        setHasWorktree(worktreeStatus.hasWorktree);
                        setUncommittedCount(worktreeStatus.uncommittedCount);
                        setConfirmArchiveDialogOpen(true);
                    }
                    else {
                        // No active processes and no worktree, archive directly
                        archiveChatMutation.mutate({ id: chatId });
                    }
                    return [2 /*return*/];
            }
        });
    }); };
    // Confirm archive after user accepts dialog (optimistic - closes immediately)
    var handleConfirmArchive = function (deleteWorktree) {
        if (archivingChatId) {
            archiveChatMutation.mutate({
                id: archivingChatId,
                deleteWorktree: deleteWorktree
            });
            setArchivingChatId(null);
        }
    };
    // Close archive confirmation dialog
    var handleCloseArchiveDialog = function () {
        setConfirmArchiveDialogOpen(false);
        setArchivingChatId(null);
    };
    // Handle open locally for sandbox chats
    var handleOpenLocally = function (chatId) {
        var remoteChat = remoteChats === null || remoteChats === void 0 ? void 0 : remoteChats.find(function (c) { return c.id === chatId; });
        if (!remoteChat)
            return;
        var matchingProjects = getMatchingProjects(projects !== null && projects !== void 0 ? projects : [], remoteChat);
        if (matchingProjects.length === 1) {
            // Auto-import: single match found
            autoImport(remoteChat, matchingProjects[0]);
        }
        else {
            // Show dialog: 0 or 2+ matches
            setImportingChatId(chatId);
            setImportDialogOpen(true);
        }
    };
    // Close import sandbox dialog
    var handleCloseImportDialog = function () {
        setImportDialogOpen(false);
        setImportingChatId(null);
    };
    // Get the remote chat for import dialog
    var importingRemoteChat = (0, solid_js_1.createMemo)(function () {
        var _a;
        if (!importingChatId || !remoteChats)
            return null;
        return (_a = remoteChats.find(function (chat) { return chat.id === importingChatId; })) !== null && _a !== void 0 ? _a : null;
    });
    // Get matching projects for import dialog (only computed when dialog is open)
    var importMatchingProjects = (0, solid_js_1.createMemo)(function () {
        if (!importingRemoteChat)
            return [];
        return getMatchingProjects(projects !== null && projects !== void 0 ? projects : [], importingRemoteChat);
    });
    // Copy branch name to clipboard
    var handleCopyBranch = function (branch) {
        navigator.clipboard.writeText(branch);
        solid_sonner_1.toast.success("Branch name copied", { description: branch });
    };
    // Ref callback for name elements
    var nameRefCallback = function (chatId, el) {
        if (el) {
            nameRefs.current.set(chatId, el);
        }
    };
    // Handle agent card hover for truncated name tooltip (1s delay)
    // Uses DOM manipulation instead of state to avoid re-renders
    var handleAgentMouseEnter = function (chatId, name, cardElement, globalIndex) {
        // Update hovered index ref
        hoveredChatIndexRef.current = globalIndex;
        // Prefetch chat data on hover (for remote chats, for instant load on click)
        var chat = agentChats === null || agentChats === void 0 ? void 0 : agentChats.find(function (c) { return c.id === chatId; });
        if (chat === null || chat === void 0 ? void 0 : chat.isRemote) {
            var originalId = chatId.replace(/^remote_/, "");
            prefetchRemoteChat(originalId);
        }
        // Clear any existing timer
        if (agentTooltipTimerRef.current) {
            clearTimeout(agentTooltipTimerRef.current);
        }
        var nameEl = nameRefs.current.get(chatId);
        if (!nameEl)
            return;
        // Check if name is truncated
        var isTruncated = nameEl.scrollWidth > nameEl.clientWidth;
        if (!isTruncated)
            return;
        // Show tooltip after 1 second delay via DOM manipulation (no state update)
        agentTooltipTimerRef.current = setTimeout(function () {
            var tooltip = agentTooltipRef.current;
            if (!tooltip)
                return;
            var rect = cardElement.getBoundingClientRect();
            tooltip.style.display = "block";
            tooltip.style.top = "".concat(rect.top + rect.height / 2, "px");
            tooltip.style.left = "".concat(rect.right + 8, "px");
            tooltip.textContent = name || "";
        }, 1e3);
    };
    var handleAgentMouseLeave = function () {
        // Reset hovered index
        hoveredChatIndexRef.current = -1;
        // Clear timer if hovering ends before delay
        if (agentTooltipTimerRef.current) {
            clearTimeout(agentTooltipTimerRef.current);
            agentTooltipTimerRef.current = null;
        }
        // Hide tooltip via DOM manipulation (no state update)
        var tooltip = agentTooltipRef.current;
        if (tooltip) {
            tooltip.style.display = "none";
        }
    };
    // Update sidebar hover UI via DOM manipulation (no state update to avoid re-renders)
    var updateSidebarHoverUI = function (hovered) {
        var _a;
        isSidebarHoveredRef.current = hovered;
        // Update close button opacity
        if (closeButtonRef.current) {
            closeButtonRef.current.style.opacity = hovered ? "1" : "0";
        }
        // Update native traffic light visibility
        if (typeof window !== "undefined" && ((_a = window.desktopApi) === null || _a === void 0 ? void 0 : _a.setTrafficLightVisibility)) {
            window.desktopApi.setTrafficLightVisibility(hovered);
        }
    };
    var handleSidebarMouseEnter = function () {
        updateSidebarHoverUI(true);
    };
    var handleSidebarMouseLeave = function (e) {
        // Electron's drag region (WebkitAppRegion: "drag") returns a non-HTMLElement
        // object as relatedTarget. We preserve hover state in this case so the
        // traffic lights remain visible when hovering over the drag area.
        var relatedTarget = e.relatedTarget;
        if (!relatedTarget || !(relatedTarget instanceof HTMLElement))
            return;
        var isStillInSidebar = relatedTarget.closest("[data-sidebar-content]");
        if (!isStillInSidebar) {
            updateSidebarHoverUI(false);
        }
    };
    // Check if scroll is needed and show/hide gradients via DOM manipulation
    solid_js_1.default.useEffect(function () {
        var container = scrollContainerRef.current;
        if (!container)
            return;
        var checkScroll = function () {
            var needsScroll = container.scrollHeight > container.clientHeight;
            if (needsScroll) {
                if (bottomGradientRef.current)
                    bottomGradientRef.current.style.opacity = "1";
                if (topGradientRef.current)
                    topGradientRef.current.style.opacity = "0";
            }
            else {
                if (bottomGradientRef.current)
                    bottomGradientRef.current.style.opacity = "0";
                if (topGradientRef.current)
                    topGradientRef.current.style.opacity = "0";
            }
        };
        checkScroll();
        // Re-check when content might change
        var resizeObserver = new ResizeObserver(checkScroll);
        resizeObserver.observe(container);
        return function () { return resizeObserver.disconnect(); };
    }, [filteredChats]);
    // Direct listener for Cmd+K to focus search input
    (0, solid_js_1.createEffect)(function () {
        var handleSearchHotkey = function (e) {
            var _a, _b;
            // Check for Cmd+K or Ctrl+K (only for search functionality)
            if ((e.metaKey || e.ctrlKey) && e.code === "KeyK" && !e.shiftKey && !e.altKey) {
                e.preventDefault();
                e.stopPropagation();
                // Focus search input
                (_a = searchInputRef.current) === null || _a === void 0 ? void 0 : _a.focus();
                (_b = searchInputRef.current) === null || _b === void 0 ? void 0 : _b.select();
            }
        };
        window.addEventListener("keydown", handleSearchHotkey, true);
        return function () {
            window.removeEventListener("keydown", handleSearchHotkey, true);
        };
    });
    // Multi-select hotkeys
    // X to toggle selection of hovered or focused chat
    (0, react_hotkeys_hook_1.useHotkeys)("x", function () {
        if (!filteredChats || filteredChats.length === 0)
            return;
        // Prefer hovered, then focused - do NOT fallback to 0 (would conflict with sub-chat sidebar)
        var targetIndex = hoveredChatIndexRef.current >= 0 ? hoveredChatIndexRef.current : focusedChatIndex >= 0 ? focusedChatIndex : -1;
        if (targetIndex >= 0 && targetIndex < filteredChats.length) {
            var chatId = filteredChats[targetIndex].id;
            // Toggle selection (both select and deselect)
            toggleChatSelection(chatId);
        }
    }, [
        filteredChats,
        focusedChatIndex,
        toggleChatSelection
    ]);
    // Cmd+A / Ctrl+A to select all chats (only when at least one is already selected)
    (0, react_hotkeys_hook_1.useHotkeys)("mod+a", function (e) {
        if (isMultiSelectMode && filteredChats && filteredChats.length > 0) {
            e.preventDefault();
            selectAllChats(filteredChats.map(function (c) { return c.id; }));
        }
    }, [
        filteredChats,
        selectAllChats,
        isMultiSelectMode
    ]);
    // Escape to clear selection
    (0, react_hotkeys_hook_1.useHotkeys)("escape", function () {
        if (isMultiSelectMode) {
            clearChatSelection();
            setFocusedChatIndex(-1);
        }
    }, [isMultiSelectMode, clearChatSelection]);
    // Cmd+E to archive current workspace (desktop) or Opt+Cmd+E (web)
    (0, solid_js_1.createEffect)(function () {
        var handleArchiveHotkey = function (e) {
            var isDesktop = (0, platform_1.isDesktopApp)();
            // Desktop: Cmd+E (without Alt)
            var isDesktopShortcut = isDesktop && e.metaKey && e.code === "KeyE" && !e.altKey && !e.shiftKey && !e.ctrlKey;
            // Web: Opt+Cmd+E (with Alt)
            var isWebShortcut = e.altKey && e.metaKey && e.code === "KeyE";
            if (isDesktopShortcut || isWebShortcut) {
                e.preventDefault();
                // If multi-select mode, bulk archive selected chats
                if (isMultiSelectMode && selectedChatIds.size > 0) {
                    var isPending_1 = archiveRemoteChatsBatchMutation.isPending || archiveChatsBatchMutation.isPending;
                    if (!isPending_1) {
                        handleBulkArchive();
                    }
                    return;
                }
                // Otherwise archive current chat (with confirmation if has active processes)
                var isPending = archiveRemoteChatMutation.isPending || archiveChatMutation.isPending;
                if (selectedChatId && !isPending) {
                    handleArchiveSingle(selectedChatId);
                }
            }
        };
        window.addEventListener("keydown", handleArchiveHotkey);
        return function () { return window.removeEventListener("keydown", handleArchiveHotkey); };
    });
    // Clear selection when project changes
    (0, solid_js_1.createEffect)(function () {
        clearChatSelection();
    });
    // Handle scroll for gradients - use DOM manipulation to avoid re-renders
    var handleAgentsScroll = solid_js_1.default.useCallback(function (e) {
        var _a = e.currentTarget, scrollTop = _a.scrollTop, scrollHeight = _a.scrollHeight, clientHeight = _a.clientHeight;
        var needsScroll = scrollHeight > clientHeight;
        if (!needsScroll) {
            if (topGradientRef.current)
                topGradientRef.current.style.opacity = "0";
            if (bottomGradientRef.current)
                bottomGradientRef.current.style.opacity = "0";
            return;
        }
        var isAtBottom = scrollTop + clientHeight >= scrollHeight - 5;
        var isAtTop = scrollTop <= 5;
        // Update gradient visibility via DOM (no setState = no re-render)
        if (topGradientRef.current) {
            topGradientRef.current.style.opacity = isAtTop ? "0" : "1";
        }
        if (bottomGradientRef.current) {
            bottomGradientRef.current.style.opacity = isAtBottom ? "0" : "1";
        }
    }, []);
    // Mobile fullscreen mode - render without ResizableSidebar wrapper
    var sidebarContent = <div class={(0, utils_1.cn)("group/sidebar flex flex-col gap-0 overflow-hidden select-none", isMobileFullscreen ? "h-full w-full bg-background" : "h-full bg-tl-background")} onMouseEnter={handleSidebarMouseEnter} onMouseLeave={handleSidebarMouseLeave} data-mobile-fullscreen={isMobileFullscreen || undefined} data-sidebar-content>
      {/* Header area - isolated component to prevent re-renders when dropdown opens */}
      <SidebarHeader isDesktop={isDesktop} isFullscreen={isFullscreen} isMobileFullscreen={isMobileFullscreen} userId={userId} desktopUser={desktopUser} onSignOut={onSignOut} onToggleSidebar={onToggleSidebar} setSettingsDialogOpen={setSettingsDialogOpen} setSettingsActiveTab={setSettingsActiveTab} setShowAuthDialog={setShowAuthDialog} handleSidebarMouseEnter={handleSidebarMouseEnter} handleSidebarMouseLeave={handleSidebarMouseLeave} closeButtonRef={closeButtonRef}/>

      {/* Search and New Workspace */}
      <div class="px-2 pb-3 flex-shrink-0">
        <div class="space-y-2">
          {/* Search Input */}
          <div class="relative">
            <input_1.Input ref={searchInputRef} placeholder="Search workspaces..." value={searchQuery} onChange={function (e) { return setSearchQuery(e.target.value); }} onKeyDown={function (e) {
            var _a, _b;
            if (e.key === "Escape") {
                e.preventDefault();
                (_a = searchInputRef.current) === null || _a === void 0 ? void 0 : _a.blur();
                setFocusedChatIndex(-1);
                return;
            }
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setFocusedChatIndex(function (prev) {
                    // If no focus yet, start from first item
                    if (prev === -1)
                        return 0;
                    // Otherwise move down
                    return prev < filteredChats.length - 1 ? prev + 1 : prev;
                });
                return;
            }
            if (e.key === "ArrowUp") {
                e.preventDefault();
                setFocusedChatIndex(function (prev) {
                    // If no focus yet, start from last item
                    if (prev === -1)
                        return filteredChats.length - 1;
                    // Otherwise move up
                    return prev > 0 ? prev - 1 : prev;
                });
                return;
            }
            if (e.key === "Enter") {
                e.preventDefault();
                // Only open if something is focused (not -1)
                if (focusedChatIndex >= 0) {
                    var focusedChat = filteredChats[focusedChatIndex];
                    if (focusedChat) {
                        handleChatClick(focusedChat.id);
                        (_b = searchInputRef.current) === null || _b === void 0 ? void 0 : _b.blur();
                        setFocusedChatIndex(-1);
                    }
                }
                return;
            }
        }} class={(0, utils_1.cn)("w-full rounded-lg text-sm bg-muted border border-input placeholder:text-muted-foreground/40", isMobileFullscreen ? "h-10" : "h-7")}/>
          </div>
          {/* New Workspace Button */}
          <tooltip_1.Tooltip delayDuration={500}>
            <tooltip_1.TooltipTrigger asChild>
              <button_1.Button onClick={handleNewAgent} variant="outline" size="sm" class={(0, utils_1.cn)("px-2 w-full hover:bg-foreground/10 transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] text-foreground rounded-lg gap-1.5", isMobileFullscreen ? "h-10" : "h-7")}>
                <span class="text-sm font-medium">New Workspace</span>
              </button_1.Button>
            </tooltip_1.TooltipTrigger>
            <tooltip_1.TooltipContent side="right">
              Start a new workspace
              {newWorkspaceHotkey && <kbd_1.Kbd>{newWorkspaceHotkey}</kbd_1.Kbd>}
            </tooltip_1.TooltipContent>
          </tooltip_1.Tooltip>
        </div>
      </div>

      {/* Scrollable Agents List */}
      <div class="flex-1 min-h-0 relative">
        <div ref={scrollContainerRef} onScroll={handleAgentsScroll} class={(0, utils_1.cn)("h-full overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent", isMultiSelectMode ? "px-0" : "px-2")}>
          {/* Drafts Section - always show regardless of chat source mode */}
          {drafts.length > 0 && !searchQuery && <div class={(0, utils_1.cn)("mb-4", isMultiSelectMode ? "px-0" : "-mx-1")}>
              <div class={(0, utils_1.cn)("flex items-center h-4 mb-1", isMultiSelectMode ? "pl-3" : "pl-2")}>
                <h3 class="text-xs font-medium text-muted-foreground whitespace-nowrap">
                  Drafts
                </h3>
              </div>
              <div class="list-none p-0 m-0">
                {drafts.map(function (draft) { var _a, _b, _c, _d; return <DraftItem key={draft.id} draftId={draft.id} draftText={draft.text} draftUpdatedAt={draft.updatedAt} projectGitOwner={(_a = draft.project) === null || _a === void 0 ? void 0 : _a.gitOwner} projectGitProvider={(_b = draft.project) === null || _b === void 0 ? void 0 : _b.gitProvider} projectGitRepo={(_c = draft.project) === null || _c === void 0 ? void 0 : _c.gitRepo} projectName={(_d = draft.project) === null || _d === void 0 ? void 0 : _d.name} isSelected={selectedDraftId === draft.id && !selectedChatId} isMultiSelectMode={isMultiSelectMode} isMobileFullscreen={isMobileFullscreen} showIcon={showWorkspaceIcon} onSelect={handleDraftSelect} onDelete={handleDeleteDraft} formatTime={formatTime}/>; })}
              </div>
            </div>}

          {/* Chats Section */}
          {filteredChats.length > 0 ? <div class={(0, utils_1.cn)("mb-4", isMultiSelectMode ? "px-0" : "-mx-1")}>
              {/* Pinned section */}
              <ChatListSection title="Pinned workspaces" chats={pinnedAgents} selectedChatId={selectedChatId} selectedChatIsRemote={selectedChatIsRemote} focusedChatIndex={focusedChatIndex} loadingChatIds={loadingChatIds} unseenChanges={unseenChanges} workspacePendingPlans={workspacePendingPlans} workspacePendingQuestions={workspacePendingQuestions} isMultiSelectMode={isMultiSelectMode} selectedChatIds={selectedChatIds} isMobileFullscreen={isMobileFullscreen} isDesktop={isDesktop} pinnedChatIds={pinnedChatIds} projectsMap={projectsMap} workspaceFileStats={workspaceFileStats} filteredChats={filteredChats} canShowPinOption={canShowPinOption} areAllSelectedPinned={areAllSelectedPinned} showIcon={showWorkspaceIcon} onChatClick={handleChatClick} onCheckboxClick={handleCheckboxClick} onMouseEnter={handleAgentMouseEnter} onMouseLeave={handleAgentMouseLeave} onArchive={handleArchiveSingle} onTogglePin={handleTogglePin} onRenameClick={handleRenameClick} onCopyBranch={handleCopyBranch} onArchiveAllBelow={handleArchiveAllBelow} onArchiveOthers={handleArchiveOthers} onOpenLocally={handleOpenLocally} onBulkPin={handleBulkPin} onBulkUnpin={handleBulkUnpin} onBulkArchive={handleBulkArchive} archivePending={archiveChatMutation.isPending || archiveRemoteChatMutation.isPending} archiveBatchPending={archiveChatsBatchMutation.isPending || archiveRemoteChatsBatchMutation.isPending} nameRefCallback={nameRefCallback} formatTime={formatTime} justCreatedIds={justCreatedIds}/>

              {/* Unpinned section */}
              <ChatListSection title={pinnedAgents.length > 0 ? "Recent workspaces" : "Workspaces"} chats={unpinnedAgents} selectedChatId={selectedChatId} selectedChatIsRemote={selectedChatIsRemote} focusedChatIndex={focusedChatIndex} loadingChatIds={loadingChatIds} unseenChanges={unseenChanges} workspacePendingPlans={workspacePendingPlans} workspacePendingQuestions={workspacePendingQuestions} isMultiSelectMode={isMultiSelectMode} selectedChatIds={selectedChatIds} isMobileFullscreen={isMobileFullscreen} isDesktop={isDesktop} pinnedChatIds={pinnedChatIds} projectsMap={projectsMap} workspaceFileStats={workspaceFileStats} filteredChats={filteredChats} canShowPinOption={canShowPinOption} areAllSelectedPinned={areAllSelectedPinned} showIcon={showWorkspaceIcon} onChatClick={handleChatClick} onCheckboxClick={handleCheckboxClick} onMouseEnter={handleAgentMouseEnter} onMouseLeave={handleAgentMouseLeave} onArchive={handleArchiveSingle} onTogglePin={handleTogglePin} onRenameClick={handleRenameClick} onCopyBranch={handleCopyBranch} onArchiveAllBelow={handleArchiveAllBelow} onArchiveOthers={handleArchiveOthers} onOpenLocally={handleOpenLocally} onBulkPin={handleBulkPin} onBulkUnpin={handleBulkUnpin} onBulkArchive={handleBulkArchive} archivePending={archiveChatMutation.isPending || archiveRemoteChatMutation.isPending} archiveBatchPending={archiveChatsBatchMutation.isPending || archiveRemoteChatsBatchMutation.isPending} nameRefCallback={nameRefCallback} formatTime={formatTime} justCreatedIds={justCreatedIds}/>
            </div> : null}
        </div>

        {/* Top gradient fade (appears when scrolled down) */}
        {/* Top gradient fade (appears when scrolled down) */}
        <div ref={topGradientRef} class="absolute top-0 left-0 right-0 h-10 pointer-events-none bg-gradient-to-b from-tl-background via-tl-background/50 to-transparent transition-opacity duration-200 opacity-0"/>

        {/* Bottom gradient fade */}
        <div ref={bottomGradientRef} class="absolute bottom-0 left-0 right-0 h-12 pointer-events-none bg-gradient-to-t from-tl-background via-tl-background/50 to-transparent transition-opacity duration-200 opacity-0"/>
      </div>

      {/* Footer - Multi-select toolbar or normal footer */}
      <react_1.AnimatePresence mode="wait">
        {isMultiSelectMode ? <react_1.motion.div key="multi-select-footer" initial={hasFooterAnimated.current ? {
                opacity: 0,
                y: 8
            } : false} animate={{
                opacity: 1,
                y: 0
            }} exit={{
                opacity: 0,
                y: 8
            }} transition={{ duration: 0 }} onAnimationComplete={function () {
                hasFooterAnimated.current = true;
            }} class="p-2 flex flex-col gap-2">
            {/* Selection info */}
            <div class="flex items-center justify-between px-1">
              <span class="text-xs text-muted-foreground">
                {selectedChatsCount} selected
              </span>
              <button onClick={clearChatSelection} class="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Cancel
              </button>
            </div>

            {/* Action buttons */}
            <div class="flex items-center gap-1.5">
              <button_2.Button variant="outline" size="sm" onClick={handleBulkArchive} disabled={archiveChatsBatchMutation.isPending} class="flex-1 h-8 gap-1.5 text-xs rounded-lg">
                <icons_2.ArchiveIcon class="h-3.5 w-3.5"/>
                {archiveChatsBatchMutation.isPending ? "Archiving..." : "Archive"}
              </button_2.Button>
            </div>
          </react_1.motion.div> : <react_1.motion.div key="normal-footer" initial={hasFooterAnimated.current ? {
                opacity: 0,
                y: 8
            } : false} animate={{
                opacity: 1,
                y: 0
            }} exit={{
                opacity: 0,
                y: 8
            }} transition={{ duration: 0 }} onAnimationComplete={function () {
                hasFooterAnimated.current = true;
            }} class="p-2 pt-2 flex flex-col gap-2">
            <div class="flex items-center">
              <div class="flex items-center gap-1">
                {/* Settings Button */}
                <tooltip_1.Tooltip delayDuration={500}>
                  <tooltip_1.TooltipTrigger asChild>
                    <button type="button" onClick={function () {
                setSettingsActiveTab("profile");
                setSettingsDialogOpen(true);
            }} class="flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.97] outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70">
                      <icons_2.SettingsIcon class="h-4 w-4"/>
                    </button>
                  </tooltip_1.TooltipTrigger>
                  <tooltip_1.TooltipContent>Settings</tooltip_1.TooltipContent>
                </tooltip_1.Tooltip>

                {/* Help Button - isolated component to prevent sidebar re-renders */}
                <HelpSection isMobile={isMobileFullscreen}/>

                {/* Kanban View Button - isolated component */}
                <KanbanButton />

                {/* Archive Button - isolated component to prevent sidebar re-renders */}
                <ArchiveSection archivedChatsCount={archivedChatsCount}/>
              </div>

              <div class="flex-1"/>
            </div>

            {/* Feedback Button */}
            <button_1.Button onClick={function () { return window.open(FEEDBACK_URL, "_blank"); }} variant="outline" size="sm" class={(0, utils_1.cn)("px-2 w-full hover:bg-foreground/10 transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] text-foreground rounded-lg gap-1.5", isMobileFullscreen ? "h-10" : "h-7")}>
              <span class="text-sm font-medium">Feedback</span>
            </button_1.Button>
          </react_1.motion.div>}
      </react_1.AnimatePresence>
    </div>;
    return <>
      {sidebarContent}

      {/* Agent name tooltip portal - always rendered, visibility controlled via ref/DOM */}
      {typeof document !== "undefined" && (0, web_1.createPortal)(<div ref={agentTooltipRef} class="fixed z-[100000] max-w-xs px-2 py-1 text-xs bg-popover border border-border rounded-md shadow-lg dark pointer-events-none text-foreground/90 whitespace-nowrap" style={{
                display: "none",
                transform: "translateY(-50%)"
            }}/>, document.body)}

      {/* Auth Dialog */}
      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog}/>

      {/* Rename Dialog */}
      <agents_rename_subchat_dialog_1.AgentsRenameSubChatDialog isOpen={renameDialogOpen} onClose={function () {
            setRenameDialogOpen(false);
            setRenamingChat(null);
        }} onSave={handleRenameSave} currentName={(renamingChat === null || renamingChat === void 0 ? void 0 : renamingChat.name) || ""} isLoading={renameLoading}/>

      {/* Confirm Archive Dialog */}
      <confirm_archive_dialog_1.ConfirmArchiveDialog isOpen={confirmArchiveDialogOpen} onClose={handleCloseArchiveDialog} onConfirm={handleConfirmArchive} activeProcessCount={activeProcessCount} hasWorktree={hasWorktree} uncommittedCount={uncommittedCount}/>

      {/* Open Locally Dialog */}
      <open_locally_dialog_1.OpenLocallyDialog isOpen={importDialogOpen} onClose={handleCloseImportDialog} remoteChat={importingRemoteChat} matchingProjects={importMatchingProjects} allProjects={projects !== null && projects !== void 0 ? projects : []} remoteSubChatId={null}/>
    </>;
}
