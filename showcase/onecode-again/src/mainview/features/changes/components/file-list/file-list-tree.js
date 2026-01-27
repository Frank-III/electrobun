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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileListTree = FileListTree;
var solid_js_1 = require("solid-js");
var file_item_1 = require("../file-item");
var folder_row_1 = require("../folder-row");
function buildFileTree(files) {
    var root = {};
    for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
        var file = files_1[_i];
        var parts = file.path.split("/");
        var current = root;
        for (var i = 0; i < parts.length; i++) {
            var part = parts[i];
            var isLast = i === parts.length - 1;
            var pathSoFar = parts.slice(0, i + 1).join("/");
            if (!current[part]) {
                current[part] = {
                    id: pathSoFar,
                    name: part,
                    type: isLast ? "file" : "folder",
                    path: pathSoFar,
                    file: isLast ? file : undefined,
                    children: isLast ? undefined : {}
                };
            }
            if (!isLast && current[part].children) {
                current = current[part].children;
            }
        }
    }
    function convertToArray(nodes) {
        return Object.values(nodes).map(function (node) { return (__assign(__assign({}, node), { children: node.children ? convertToArray(node.children) : undefined })); }).sort(function (a, b) {
            if (a.type !== b.type) {
                return a.type === "folder" ? -1 : 1;
            }
            return a.name.localeCompare(b.name);
        });
    }
    return convertToArray(root);
}
function TreeNodeComponent(_a) {
    var _b;
    var node = _a.node, _c = _a.level, level = _c === void 0 ? 0 : _c, selectedPath = _a.selectedPath, selectedCommitHash = _a.selectedCommitHash, onFileSelect = _a.onFileSelect, onFileDoubleClick = _a.onFileDoubleClick, showStats = _a.showStats, showCheckbox = _a.showCheckbox, isStaged = _a.isStaged, onStage = _a.onStage, onUnstage = _a.onUnstage, isActioning = _a.isActioning, worktreePath = _a.worktreePath, onDiscard = _a.onDiscard;
    var _d = (0, solid_js_1.createSignal)(true), isExpanded = _d[0], setIsExpanded = _d[1];
    var hasChildren = node.children && node.children.length > 0;
    var isFile = node.type === "file";
    var isSelected = selectedPath === node.path && !selectedCommitHash;
    if (hasChildren) {
        return <folder_row_1.FolderRow name={node.name} isExpanded={isExpanded} onToggle={setIsExpanded} level={level} variant="tree">
				{(_b = node.children) === null || _b === void 0 ? void 0 : _b.map(function (child) { return <TreeNodeComponent key={child.id} node={child} level={level + 1} selectedPath={selectedPath} selectedCommitHash={selectedCommitHash} onFileSelect={onFileSelect} onFileDoubleClick={onFileDoubleClick} showStats={showStats} showCheckbox={showCheckbox} isStaged={isStaged} onStage={onStage} onUnstage={onUnstage} isActioning={isActioning} worktreePath={worktreePath} onDiscard={onDiscard}/>; })}
			</folder_row_1.FolderRow>;
    }
    if (isFile && node.file) {
        var file_1 = node.file;
        return <file_item_1.FileItem file={file_1} isSelected={isSelected} onClick={function () { return onFileSelect(file_1); }} onDoubleClick={onFileDoubleClick ? function () { return onFileDoubleClick(file_1); } : undefined} showStats={showStats} showCheckbox={showCheckbox} isStaged={isStaged} level={level} onStage={onStage ? function () { return onStage(file_1); } : undefined} onUnstage={onUnstage ? function () { return onUnstage(file_1); } : undefined} isActioning={isActioning} worktreePath={worktreePath} onDiscard={onDiscard ? function () { return onDiscard(file_1); } : undefined}/>;
    }
    return null;
}
function FileListTree(_a) {
    var files = _a.files, selectedFile = _a.selectedFile, selectedCommitHash = _a.selectedCommitHash, onFileSelect = _a.onFileSelect, onFileDoubleClick = _a.onFileDoubleClick, _b = _a.showStats, showStats = _b === void 0 ? true : _b, _c = _a.showCheckbox, showCheckbox = _c === void 0 ? false : _c, _d = _a.isStaged, isStaged = _d === void 0 ? false : _d, onStage = _a.onStage, onUnstage = _a.onUnstage, isActioning = _a.isActioning, worktreePath = _a.worktreePath, onDiscard = _a.onDiscard;
    var tree = buildFileTree(files);
    return <div class="flex flex-col overflow-hidden">
			{tree.map(function (node) { var _a; return <TreeNodeComponent key={node.id} node={node} selectedPath={(_a = selectedFile === null || selectedFile === void 0 ? void 0 : selectedFile.path) !== null && _a !== void 0 ? _a : null} selectedCommitHash={selectedCommitHash} onFileSelect={onFileSelect} onFileDoubleClick={onFileDoubleClick} showStats={showStats} showCheckbox={showCheckbox} isStaged={isStaged} onStage={onStage} onUnstage={onUnstage} isActioning={isActioning} worktreePath={worktreePath} onDiscard={onDiscard}/>; })}
		</div>;
}
