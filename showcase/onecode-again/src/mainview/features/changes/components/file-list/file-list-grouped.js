"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileListGrouped = FileListGrouped;
var solid_js_1 = require("solid-js");
var file_item_1 = require("../file-item");
var folder_row_1 = require("../folder-row");
function groupFilesByFolder(files) {
    var _a;
    var folderMap = new Map();
    for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
        var file = files_1[_i];
        var pathParts = file.path.split("/");
        var folderPath = pathParts.length > 1 ? pathParts.slice(0, -1).join("/") : "";
        if (!folderMap.has(folderPath)) {
            folderMap.set(folderPath, []);
        }
        (_a = folderMap.get(folderPath)) === null || _a === void 0 ? void 0 : _a.push(file);
    }
    return Array.from(folderMap.entries()).map(function (_a) {
        var folderPath = _a[0], files = _a[1];
        var pathParts = folderPath.split("/");
        var folderName = folderPath === "" ? "" : pathParts[pathParts.length - 1];
        return {
            folderPath: folderPath,
            folderName: folderName,
            files: files.sort(function (a, b) {
                var aName = a.path.split("/").pop() || "";
                var bName = b.path.split("/").pop() || "";
                return aName.localeCompare(bName);
            })
        };
    }).sort(function (a, b) { return a.folderPath.localeCompare(b.folderPath); });
}
function FolderGroupItem(_a) {
    var group = _a.group, selectedFile = _a.selectedFile, onFileSelect = _a.onFileSelect, onFileDoubleClick = _a.onFileDoubleClick, showStats = _a.showStats, showCheckbox = _a.showCheckbox, isStaged = _a.isStaged, onStage = _a.onStage, onUnstage = _a.onUnstage, isActioning = _a.isActioning, worktreePath = _a.worktreePath, onDiscard = _a.onDiscard;
    var _b = (0, solid_js_1.createSignal)(true), isExpanded = _b[0], setIsExpanded = _b[1];
    var isRoot = group.folderPath === "";
    var displayName = isRoot ? "Root Path" : group.folderPath;
    return <folder_row_1.FolderRow name={displayName} isExpanded={isExpanded} onToggle={setIsExpanded} fileCount={group.files.length} variant="grouped">
			{group.files.map(function (file) { return <file_item_1.FileItem key={file.path} file={file} isSelected={(selectedFile === null || selectedFile === void 0 ? void 0 : selectedFile.path) === file.path} onClick={function () { return onFileSelect(file); }} onDoubleClick={onFileDoubleClick ? function () { return onFileDoubleClick(file); } : undefined} showStats={showStats} showCheckbox={showCheckbox} isStaged={isStaged} onStage={onStage ? function () { return onStage(file); } : undefined} onUnstage={onUnstage ? function () { return onUnstage(file); } : undefined} isActioning={isActioning} worktreePath={worktreePath} onDiscard={onDiscard ? function () { return onDiscard(file); } : undefined}/>; })}
		</folder_row_1.FolderRow>;
}
function FileListGrouped(_a) {
    var files = _a.files, selectedFile = _a.selectedFile, onFileSelect = _a.onFileSelect, onFileDoubleClick = _a.onFileDoubleClick, _b = _a.showStats, showStats = _b === void 0 ? true : _b, _c = _a.showCheckbox, showCheckbox = _c === void 0 ? false : _c, _d = _a.isStaged, isStaged = _d === void 0 ? false : _d, onStage = _a.onStage, onUnstage = _a.onUnstage, isActioning = _a.isActioning, worktreePath = _a.worktreePath, onDiscard = _a.onDiscard;
    var groups = groupFilesByFolder(files);
    return <div class="flex flex-col overflow-hidden">
			{groups.map(function (group) { return <FolderGroupItem key={group.folderPath || "__root__"} group={group} selectedFile={selectedFile} onFileSelect={onFileSelect} onFileDoubleClick={onFileDoubleClick} showStats={showStats} showCheckbox={showCheckbox} isStaged={isStaged} onStage={onStage} onUnstage={onUnstage} isActioning={isActioning} worktreePath={worktreePath} onDiscard={onDiscard}/>; })}
		</div>;
}
