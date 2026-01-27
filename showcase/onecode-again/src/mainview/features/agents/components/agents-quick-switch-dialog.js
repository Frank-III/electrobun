"use client";
"use strict";
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
exports.AgentsQuickSwitchDialog = AgentsQuickSwitchDialog;
var solid_js_1 = require("solid-js");
var react_1 = require("motion/react");
var web_1 = require("solid-js/web");
var jotai_1 = require("../../../lib/state/jotai");
var atoms_1 = require("../atoms");
var agent_chat_card_1 = require("./agent-chat-card");
function AgentsQuickSwitchDialog(_a) {
    var isOpen = _a.isOpen, chats = _a.chats, selectedIndex = _a.selectedIndex, projectsMap = _a.projectsMap, onHover = _a.onHover;
    if (typeof window === "undefined")
        return null;
    // Derive loading parent chat IDs from loadingSubChats Map
    var loadingSubChats = (0, jotai_1.useAtomValue)(atoms_1.loadingSubChatsAtom);
    var loadingChatIds = (0, solid_js_1.createMemo)(function () { return new Set(__spreadArray([], loadingSubChats.values(), true)); });
    return (0, web_1.createPortal)(<react_1.AnimatePresence>
      {isOpen && <>
          {/* Backdrop */}
          <div class="fixed inset-0 z-[10000]"/>

          {/* Dialog */}
          <div class="fixed inset-0 flex items-center justify-center z-[10001] p-4 pointer-events-none">
            <div class="pointer-events-auto">
              <div class="max-w-5xl mx-auto">
                {/* Chat List or Empty State */}
                {chats.length === 0 ? <div class="px-4 py-12 text-center bg-background rounded-xl border-[0.5px]">
                    <p class="text-sm text-muted-foreground">
                      No recent agents
                    </p>
                  </div> : <div class="flex gap-3 overflow-x-auto p-3 bg-background rounded-3xl border-[0.5px]" style={{ boxShadow: "0 8px 32px 0 rgba(0,0,0,0.07), 0 0px 16px 0 rgba(0,0,0,0.04), 0 -8px 24px 0 rgba(0,0,0,0.03)" }}>
                    {chats.map(function (chat, index) {
                    var isSelected = index === selectedIndex;
                    var isLoading = loadingChatIds.has(chat.id);
                    var project = projectsMap.get(chat.projectId);
                    return <agent_chat_card_1.AgentChatCard key={chat.id} chat={chat} isSelected={isSelected} isLoading={isLoading} variant="quick-switch" gitOwner={project === null || project === void 0 ? void 0 : project.gitOwner} gitProvider={project === null || project === void 0 ? void 0 : project.gitProvider} repoName={(project === null || project === void 0 ? void 0 : project.gitRepo) || (project === null || project === void 0 ? void 0 : project.name)} onMouseEnter={function () { return onHover === null || onHover === void 0 ? void 0 : onHover(index); }}/>;
                })}
                  </div>}
              </div>
            </div>
          </div>
        </>}
    </react_1.AnimatePresence>, document.body);
}
