"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseGitStatus = parseGitStatus;
exports.parseGitLog = parseGitLog;
exports.parseDiffNumstat = parseDiffNumstat;
exports.parseNameStatus = parseNameStatus;
function mapGitStatus(gitIndex, gitWorking) {
    if (gitIndex === "A" || gitWorking === "A")
        return "added";
    if (gitIndex === "D" || gitWorking === "D")
        return "deleted";
    if (gitIndex === "R")
        return "renamed";
    if (gitIndex === "C")
        return "copied";
    if (gitIndex === "?" || gitWorking === "?")
        return "untracked";
    return "modified";
}
function toChangedFile(path, gitIndex, gitWorking) {
    return {
        path: path,
        status: mapGitStatus(gitIndex, gitWorking),
        additions: 0,
        deletions: 0,
    };
}
function parseGitStatus(status) {
    var staged = [];
    var unstaged = [];
    var untracked = [];
    for (var _i = 0, _a = status.files; _i < _a.length; _i++) {
        var file = _a[_i];
        var path = file.path;
        var index = file.index;
        var working = file.working_dir;
        if (index === "?" && working === "?") {
            untracked.push(toChangedFile(path, index, working));
            continue;
        }
        if (index && index !== " " && index !== "?") {
            staged.push({
                path: path,
                oldPath: file.path !== file.from ? file.from : undefined,
                status: mapGitStatus(index, " "),
                additions: 0,
                deletions: 0,
            });
        }
        if (working && working !== " " && working !== "?") {
            unstaged.push({
                path: path,
                status: mapGitStatus(" ", working),
                additions: 0,
                deletions: 0,
            });
        }
    }
    return {
        branch: status.current || "HEAD",
        staged: staged,
        unstaged: unstaged,
        untracked: untracked,
    };
}
function parseGitLog(logOutput) {
    var _a, _b, _c, _d, _e;
    if (!logOutput.trim())
        return [];
    var commits = [];
    var lines = logOutput.trim().split("\n");
    for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
        var line = lines_1[_i];
        if (!line.trim())
            continue;
        // Format: hash|shortHash|message|description|author|date
        // Use slice to preserve '|' characters in commit messages/descriptions
        var parts = line.split("|");
        if (parts.length < 6)
            continue;
        var hash = (_a = parts[0]) === null || _a === void 0 ? void 0 : _a.trim();
        var shortHash = (_b = parts[1]) === null || _b === void 0 ? void 0 : _b.trim();
        var message = (_c = parts[2]) === null || _c === void 0 ? void 0 : _c.trim();
        // Description is between message and last 2 parts (author, date)
        var description = parts.slice(3, -2).join("|").trim();
        var author = (_d = parts[parts.length - 2]) === null || _d === void 0 ? void 0 : _d.trim();
        var dateStr = (_e = parts[parts.length - 1]) === null || _e === void 0 ? void 0 : _e.trim();
        if (!hash || !shortHash)
            continue;
        var date = void 0;
        if (dateStr) {
            var parsed = new Date(dateStr);
            date = Number.isNaN(parsed.getTime()) ? new Date() : parsed;
        }
        else {
            date = new Date();
        }
        commits.push({
            hash: hash,
            shortHash: shortHash,
            message: message || "",
            description: description || undefined,
            author: author || "",
            date: date,
            files: [],
        });
    }
    return commits;
}
function parseDiffNumstat(numstatOutput) {
    var stats = new Map();
    for (var _i = 0, _a = numstatOutput.trim().split("\n"); _i < _a.length; _i++) {
        var line = _a[_i];
        if (!line.trim())
            continue;
        // Format: additions\tdeletions\tfilepath
        // For renames: additions\tdeletions\toldpath => newpath
        var _b = line.split("\t"), addStr = _b[0], delStr = _b[1], pathParts = _b.slice(2);
        var rawPath = pathParts.join("\t");
        if (!rawPath)
            continue;
        var additions = addStr === "-" ? 0 : Number.parseInt(addStr, 10) || 0;
        var deletions = delStr === "-" ? 0 : Number.parseInt(delStr, 10) || 0;
        var statEntry = { additions: additions, deletions: deletions };
        var renameMatch = rawPath.match(/^(.+) => (.+)$/);
        if (renameMatch) {
            var oldPath = renameMatch[1];
            var newPath = renameMatch[2];
            stats.set(newPath, statEntry);
            stats.set(oldPath, statEntry);
        }
        else {
            stats.set(rawPath, statEntry);
        }
    }
    return stats;
}
function parseNameStatus(nameStatusOutput) {
    var files = [];
    for (var _i = 0, _a = nameStatusOutput.trim().split("\n"); _i < _a.length; _i++) {
        var line = _a[_i];
        if (!line.trim())
            continue;
        // Format: status\tfilepath (or status\toldpath\tnewpath for renames)
        var parts = line.split("\t");
        var statusCode = parts[0];
        if (!statusCode)
            continue;
        var isRenameOrCopy = statusCode.startsWith("R") || statusCode.startsWith("C");
        var path = isRenameOrCopy ? parts[2] : parts[1];
        var oldPath = isRenameOrCopy ? parts[1] : undefined;
        if (!path)
            continue;
        var status_1 = void 0;
        switch (statusCode[0]) {
            case "A":
                status_1 = "added";
                break;
            case "D":
                status_1 = "deleted";
                break;
            case "R":
                status_1 = "renamed";
                break;
            case "C":
                status_1 = "copied";
                break;
            default:
                status_1 = "modified";
        }
        files.push({
            path: path,
            oldPath: oldPath,
            status: status_1,
            additions: 0,
            deletions: 0,
        });
    }
    return files;
}
