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
exports.KanbanColumn = void 0;
var solid_js_1 = require("solid-js");
var utils_1 = require("../../../lib/utils");
var kanban_card_1 = require("./kanban-card");
var STATUS_COLORS = {
    draft: "bg-muted-foreground/20",
    "in-progress": "bg-blue-500",
    "needs-input": "bg-amber-500",
    done: "bg-emerald-500"
};
exports.KanbanColumn = memo(function KanbanColumn(_a) {
    var title = _a.title, status = _a.status, cards = _a.cards, isMultiSelectMode = _a.isMultiSelectMode, onCardClick = _a.onCardClick, onCheckboxClick = _a.onCheckboxClick, onTogglePin = _a.onTogglePin, onRename = _a.onRename, onArchive = _a.onArchive, onCopyBranch = _a.onCopyBranch, onExportChat = _a.onExportChat, onCopyChat = _a.onCopyChat;
    // Sort cards: pinned first, then by updatedAt desc
    var sortedCards = (0, solid_js_1.createMemo)(function () {
        var pinned = cards.filter(function (c) { return c.isPinned; });
        var unpinned = cards.filter(function (c) { return !c.isPinned; });
        // Sort each group by updatedAt desc
        var sortByDate = function (a, b) {
            var _a, _b;
            var aTime = ((_a = a.updatedAt) === null || _a === void 0 ? void 0 : _a.getTime()) || a.createdAt.getTime();
            var bTime = ((_b = b.updatedAt) === null || _b === void 0 ? void 0 : _b.getTime()) || b.createdAt.getTime();
            return bTime - aTime;
        };
        pinned.sort(sortByDate);
        unpinned.sort(sortByDate);
        return __spreadArray(__spreadArray([], pinned, true), unpinned, true);
    });
    return <div class="flex flex-col min-w-[140px] max-w-[240px] flex-1 h-full">
      {/* Column header */}
      <div class="flex items-center gap-2 px-2 py-2 mb-2">
        <span class={(0, utils_1.cn)("w-2 h-2 rounded-full flex-shrink-0", STATUS_COLORS[status])}/>
        <h3 class="text-sm font-medium text-foreground">{title}</h3>
        <span class="text-xs text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded-full">
          {cards.length}
        </span>
      </div>

      {/* Cards container with scroll */}
      <div class="flex-1 overflow-y-auto px-1 pb-4 space-y-2">
        {sortedCards.length === 0 ? <div class="px-3 py-8 text-center text-sm text-muted-foreground/60">
            No workspaces
          </div> : sortedCards.map(function (card) { return <kanban_card_1.KanbanCard key={card.id} card={card} isMultiSelectMode={isMultiSelectMode} onClick={function (e) { return onCardClick(card, e); }} onCheckboxClick={onCheckboxClick} onTogglePin={onTogglePin} onRename={onRename} onArchive={onArchive} onCopyBranch={onCopyBranch} onExportChat={onExportChat} onCopyChat={onCopyChat}/>; })}
      </div>
    </div>;
});
