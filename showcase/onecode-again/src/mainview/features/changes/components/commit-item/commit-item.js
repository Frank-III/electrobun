"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommitItem = CommitItem;
var utils_1 = require("../../utils");
var collapsible_row_1 = require("../collapsible-row");
var file_list_1 = require("../file-list");
function CommitHeader(_a) {
    var shortHash = _a.shortHash, message = _a.message, date = _a.date;
    return <>
			<span class="text-[10px] font-mono text-muted-foreground shrink-0">
				{shortHash}
			</span>
			<span class="text-xs flex-1 truncate">{message}</span>
			<span class="text-[10px] text-muted-foreground shrink-0">
				{(0, utils_1.formatRelativeDate)(date)}
			</span>
		</>;
}
function CommitItem(_a) {
    var commit = _a.commit, isExpanded = _a.isExpanded, onToggle = _a.onToggle, selectedFile = _a.selectedFile, selectedCommitHash = _a.selectedCommitHash, onFileSelect = _a.onFileSelect, onFileDoubleClick = _a.onFileDoubleClick, viewMode = _a.viewMode, worktreePath = _a.worktreePath;
    var hasFiles = commit.files.length > 0;
    var handleFileSelect = function (file) {
        onFileSelect(file, commit.hash);
    };
    var handleFileDoubleClick = function (file) {
        onFileDoubleClick === null || onFileDoubleClick === void 0 ? void 0 : onFileDoubleClick(file, commit.hash);
    };
    var isCommitSelected = selectedCommitHash === commit.hash;
    return <collapsible_row_1.CollapsibleRow isExpanded={isExpanded} onToggle={function () { return onToggle(); }} triggerClassName="mx-0.5" contentClassName="ml-4 pl-1.5 border-l border-border mt-0.5 mb-0.5" header={<CommitHeader shortHash={commit.shortHash} message={commit.message} date={commit.date}/>}>
			{hasFiles && <file_list_1.FileList files={commit.files} viewMode={viewMode} selectedFile={isCommitSelected ? selectedFile : null} selectedCommitHash={selectedCommitHash} onFileSelect={handleFileSelect} onFileDoubleClick={handleFileDoubleClick} worktreePath={worktreePath}/>}
		</collapsible_row_1.CollapsibleRow>;
}
