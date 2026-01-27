"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiffSection = DiffSection;
var button_1 = require("@/components/ui/button");
var lucide_solid_1 = require("lucide-solid");
var icons_1 = require("@/components/ui/icons");
var utils_1 = require("@/lib/utils");
var agents_file_mention_1 = require("@/features/agents/mentions/agents-file-mention");
/**
* Get file name from path
*/
function getFileName(path) {
    var parts = path.split("/");
    return parts[parts.length - 1] || path;
}
/**
* Get file directory from path
*/
function getFileDir(path) {
    var parts = path.split("/");
    if (parts.length <= 1)
        return "";
    return parts.slice(0, -1).join("/");
}
function DiffSection(_a) {
    var chatId = _a.chatId, isDiffSidebarOpen = _a.isDiffSidebarOpen, setIsDiffSidebarOpen = _a.setIsDiffSidebarOpen, diffStats = _a.diffStats, parsedFileDiffs = _a.parsedFileDiffs, onCommit = _a.onCommit, _b = _a.isCommitting, isCommitting = _b === void 0 ? false : _b, _c = _a.isExpanded, isExpanded = _c === void 0 ? false : _c;
    var hasChanges = diffStats && diffStats.fileCount > 0;
    var files = parsedFileDiffs || [];
    // Limit files shown in widget (show first 5)
    var maxFilesToShow = 5;
    var visibleFiles = files.slice(0, maxFilesToShow);
    var remainingCount = files.length - maxFilesToShow;
    return <div class="px-3 py-2">
      {hasChanges ? <div class="space-y-2">
          {/* Stats summary - same style as agent-diff-view */}
          <div class="flex items-center gap-2 text-xs font-mono">
            <span class="text-muted-foreground">
              {diffStats.fileCount} file{diffStats.fileCount !== 1 ? "s" : ""}
            </span>
            <span class="tabular-nums whitespace-nowrap">
              {diffStats.additions > 0 && <span class="mr-1.5 text-emerald-600 dark:text-emerald-400">
                  +{diffStats.additions}
                </span>}
              {diffStats.deletions > 0 && <span class="text-red-600 dark:text-red-400">
                  -{diffStats.deletions}
                </span>}
            </span>
          </div>

          {/* File list - matching agent-diff-view header style */}
          {visibleFiles.length > 0 && <div class="space-y-0.5">
              {visibleFiles.map(function (file) {
                    var displayPath = file.newPath || file.oldPath;
                    var fileName = getFileName(displayPath);
                    var dirPath = getFileDir(displayPath);
                    var isNewFile = file.isNewFile;
                    var isDeletedFile = file.isDeletedFile;
                    var FileIcon = (0, agents_file_mention_1.getFileIconByExtension)(fileName);
                    return <div key={file.key} class={(0, utils_1.cn)("group flex items-center gap-2 font-mono text-xs", "py-1 px-1.5 rounded cursor-pointer", "hover:bg-accent/50 transition-colors")} onClick={function () { return setIsDiffSidebarOpen(true); }}>
                    {/* File icon */}
                    <div class="relative w-3.5 h-3.5 shrink-0">
                      {FileIcon && <FileIcon class="w-3.5 h-3.5 text-muted-foreground"/>}
                    </div>

                    {/* File name + path + status - same layout as agent-diff-view */}
                    <div class="flex items-center gap-2 min-w-0 flex-1">
                      <span class="font-medium text-foreground shrink-0">
                        {fileName}
                      </span>
                      {dirPath && <span class="text-muted-foreground truncate text-[11px] min-w-0">
                          {dirPath}
                        </span>}
                      {isNewFile && <span class="shrink-0 text-[11px] text-emerald-600 dark:text-emerald-400">
                          (new)
                        </span>}
                      {isDeletedFile && <span class="shrink-0 text-[11px] text-red-600 dark:text-red-400">
                          (deleted)
                        </span>}
                    </div>

                    {/* Stats - same style as agent-diff-view */}
                    <span class="shrink-0 font-mono text-[11px] tabular-nums whitespace-nowrap">
                      {file.additions > 0 && <span class="mr-1.5 text-emerald-600 dark:text-emerald-400">
                          +{file.additions}
                        </span>}
                      {file.deletions > 0 && <span class="text-red-600 dark:text-red-400">
                          -{file.deletions}
                        </span>}
                    </span>
                  </div>;
                })}

              {/* Show more indicator */}
              {remainingCount > 0 && <button class="text-xs text-muted-foreground hover:text-foreground py-1 px-1.5 w-full text-left font-mono" onClick={function () { return setIsDiffSidebarOpen(true); }}>
                  +{remainingCount} more file{remainingCount !== 1 ? "s" : ""}...
                </button>}
            </div>}

          {/* Action buttons */}
          <div class="flex gap-2 pt-1">
            {/* Commit button */}
            {onCommit && <button_1.Button variant="default" size="sm" class="flex-1 h-7 text-xs" onClick={onCommit} disabled={isCommitting}>
                {isCommitting ? <icons_1.IconSpinner class="h-3 w-3 mr-1.5"/> : <lucide_solid_1.GitCommit class="h-3 w-3 mr-1.5"/>}
                Commit
              </button_1.Button>}

            {/* View all button */}
            <button_1.Button variant="outline" size="sm" class={(0, utils_1.cn)("h-7 text-xs", onCommit ? "flex-1" : "w-full")} onClick={function () { return setIsDiffSidebarOpen(true); }}>
              <icons_1.DiffIcon class="h-3 w-3 mr-1.5"/>
              View All
            </button_1.Button>
          </div>
        </div> : <div class="flex items-center gap-2 text-xs text-muted-foreground py-2">
          <icons_1.DiffIcon class="h-3.5 w-3.5"/>
          <span>No changes</span>
        </div>}
    </div>;
}
