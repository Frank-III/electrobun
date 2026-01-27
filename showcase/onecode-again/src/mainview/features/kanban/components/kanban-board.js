"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KanbanBoard = void 0;
var solid_js_1 = require("solid-js");
var kanban_column_1 = require("./kanban-column");
// 4 columns: drafts + workspace statuses
var COLUMNS = [
    {
        status: "draft",
        title: "Drafts"
    },
    {
        status: "in-progress",
        title: "In Progress"
    },
    {
        status: "needs-input",
        title: "Need Input"
    },
    {
        status: "done",
        title: "Done"
    }
];
exports.KanbanBoard = memo(function KanbanBoard(_a) {
    var cards = _a.cards, isMultiSelectMode = _a.isMultiSelectMode, onCardClick = _a.onCardClick, onCheckboxClick = _a.onCheckboxClick, onTogglePin = _a.onTogglePin, onRename = _a.onRename, onArchive = _a.onArchive, onCopyBranch = _a.onCopyBranch, onExportChat = _a.onExportChat, onCopyChat = _a.onCopyChat;
    // Group cards by status
    var cardsByStatus = (0, solid_js_1.createMemo)(function () {
        var grouped = {
            draft: [],
            "in-progress": [],
            "needs-input": [],
            done: []
        };
        for (var _i = 0, cards_1 = cards; _i < cards_1.length; _i++) {
            var card = cards_1[_i];
            grouped[card.status].push(card);
        }
        return grouped;
    });
    return <div class="h-full overflow-x-auto">
      {/* Centered container with max-width */}
      <div class="flex gap-3 h-full px-4 py-2 mx-auto max-w-5xl min-w-min">
        {COLUMNS.map(function (column) { return <kanban_column_1.KanbanColumn key={column.status} title={column.title} status={column.status} cards={cardsByStatus[column.status]} isMultiSelectMode={isMultiSelectMode} onCardClick={onCardClick} onCheckboxClick={onCheckboxClick} onTogglePin={onTogglePin} onRename={onRename} onArchive={onArchive} onCopyBranch={onCopyBranch} onExportChat={onExportChat} onCopyChat={onCopyChat}/>; })}
      </div>
    </div>;
});
