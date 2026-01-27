"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangesPanel = ChangesPanel;
var changes_view_1 = require("./changes-view");
function ChangesPanel(_a) {
    var worktreePath = _a.worktreePath, selectedFilePath = _a.selectedFilePath, onFileSelect = _a.onFileSelect, onFileOpenPinned = _a.onFileOpenPinned, onCreatePr = _a.onCreatePr, onCommitSuccess = _a.onCommitSuccess, subChats = _a.subChats, initialSubChatFilter = _a.initialSubChatFilter, chatId = _a.chatId, selectedCommitHash = _a.selectedCommitHash, onCommitSelect = _a.onCommitSelect, onCommitFileSelect = _a.onCommitFileSelect, onActiveTabChange = _a.onActiveTabChange, pushCount = _a.pushCount;
    if (!worktreePath) {
        return <div class="flex-1 flex items-center justify-center text-muted-foreground text-sm p-4">
				No worktree path available
			</div>;
    }
    return <div class="flex flex-col h-full overflow-hidden">
			<changes_view_1.ChangesView worktreePath={worktreePath} selectedFilePath={selectedFilePath} onFileSelect={onFileSelect} onFileOpenPinned={onFileOpenPinned} onCreatePr={onCreatePr} onCommitSuccess={onCommitSuccess} subChats={subChats} initialSubChatFilter={initialSubChatFilter} chatId={chatId} selectedCommitHash={selectedCommitHash} onCommitSelect={onCommitSelect} onCommitFileSelect={onCommitFileSelect} onActiveTabChange={onActiveTabChange} pushCount={pushCount}/>
		</div>;
}
