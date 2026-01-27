"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileList = FileList;
var file_list_grouped_1 = require("./file-list-grouped");
var file_list_tree_1 = require("./file-list-tree");
function FileList(_a) {
    var files = _a.files, viewMode = _a.viewMode, selectedFile = _a.selectedFile, selectedCommitHash = _a.selectedCommitHash, onFileSelect = _a.onFileSelect, onFileDoubleClick = _a.onFileDoubleClick, _b = _a.showStats, showStats = _b === void 0 ? true : _b, _c = _a.showCheckbox, showCheckbox = _c === void 0 ? false : _c, _d = _a.isStaged, isStaged = _d === void 0 ? false : _d, onStage = _a.onStage, onUnstage = _a.onUnstage, isActioning = _a.isActioning, worktreePath = _a.worktreePath, onDiscard = _a.onDiscard;
    if (files.length === 0) {
        return null;
    }
    if (viewMode === "tree") {
        return <file_list_tree_1.FileListTree files={files} selectedFile={selectedFile} selectedCommitHash={selectedCommitHash} onFileSelect={onFileSelect} onFileDoubleClick={onFileDoubleClick} showStats={showStats} showCheckbox={showCheckbox} isStaged={isStaged} onStage={onStage} onUnstage={onUnstage} isActioning={isActioning} worktreePath={worktreePath} onDiscard={onDiscard}/>;
    }
    // Grouped mode - group files by folder
    return <file_list_grouped_1.FileListGrouped files={files} selectedFile={selectedFile} selectedCommitHash={selectedCommitHash} onFileSelect={onFileSelect} onFileDoubleClick={onFileDoubleClick} showStats={showStats} showCheckbox={showCheckbox} isStaged={isStaged} onStage={onStage} onUnstage={onUnstage} isActioning={isActioning} worktreePath={worktreePath} onDiscard={onDiscard}/>;
}
