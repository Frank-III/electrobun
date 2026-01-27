"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentToolRegistry = void 0;
exports.getToolStatus = getToolStatus;
var lucide_solid_1 = require("lucide-solid");
var icons_1 = require("../../../components/ui/icons");
function getToolStatus(part, chatStatus) {
    var _a;
    var basePending = part.state !== "output-available" && part.state !== "output-error" && part.state !== "result";
    var isError = part.state === "output-error" || part.state === "output-available" && ((_a = part.output) === null || _a === void 0 ? void 0 : _a.success) === false;
    var isSuccess = part.state === "output-available" && !isError;
    // Critical: if chat stopped streaming, pending tools should show as complete
    // Include "submitted" status - this is when request was sent but streaming hasn't started yet
    var isActivelyStreaming = chatStatus === "streaming" || chatStatus === "submitted";
    var isPending = basePending && isActivelyStreaming;
    // Tool was in progress but chat stopped streaming (user interrupted)
    var isInterrupted = basePending && !isActivelyStreaming && chatStatus !== undefined;
    return {
        isPending: isPending,
        isError: isError,
        isSuccess: isSuccess,
        isInterrupted: isInterrupted
    };
}
// Utility to get clean display path (remove sandbox prefix)
function getDisplayPath(filePath) {
    if (!filePath)
        return "";
    var prefixes = [
        "/project/sandbox/repo/",
        "/project/sandbox/",
        "/project/"
    ];
    for (var _i = 0, prefixes_1 = prefixes; _i < prefixes_1.length; _i++) {
        var prefix = prefixes_1[_i];
        if (filePath.startsWith(prefix)) {
            return filePath.slice(prefix.length);
        }
    }
    if (filePath.startsWith("/")) {
        var parts = filePath.split("/");
        var rootIndicators_1 = [
            "apps",
            "packages",
            "src",
            "lib",
            "components"
        ];
        var rootIndex = parts.findIndex(function (p) { return rootIndicators_1.includes(p); });
        if (rootIndex > 0) {
            return parts.slice(rootIndex).join("/");
        }
    }
    return filePath;
}
// Utility to calculate diff stats
function calculateDiffStats(oldString, newString) {
    var oldLines = oldString.split("\n");
    var newLines = newString.split("\n");
    var maxLines = Math.max(oldLines.length, newLines.length);
    var addedLines = 0;
    var removedLines = 0;
    for (var i = 0; i < maxLines; i++) {
        var oldLine = oldLines[i];
        var newLine = newLines[i];
        if (oldLine !== undefined && newLine !== undefined) {
            if (oldLine !== newLine) {
                removedLines++;
                addedLines++;
            }
        }
        else if (oldLine !== undefined) {
            removedLines++;
        }
        else if (newLine !== undefined) {
            addedLines++;
        }
    }
    return {
        addedLines: addedLines,
        removedLines: removedLines
    };
}
exports.AgentToolRegistry = {
    "tool-Task": {
        icon: icons_1.SparklesIcon,
        title: function (part) {
            var isPending = part.state !== "output-available" && part.state !== "output-error";
            var isInputStreaming = part.state === "input-streaming";
            if (isInputStreaming)
                return "Preparing task";
            return isPending ? "Running Task" : "Completed Task";
        },
        subtitle: function (part) {
            var _a;
            // Don't show subtitle while input is still streaming
            if (part.state === "input-streaming")
                return "";
            var description = ((_a = part.input) === null || _a === void 0 ? void 0 : _a.description) || "";
            return description.length > 50 ? description.slice(0, 47) + "..." : description;
        },
        variant: "simple"
    },
    "tool-Grep": {
        icon: icons_1.SearchIcon,
        title: function (part) {
            var _a, _b, _c;
            var isPending = part.state !== "output-available" && part.state !== "output-error";
            var isInputStreaming = part.state === "input-streaming";
            if (isInputStreaming)
                return "Preparing search";
            if (isPending)
                return "Grepping";
            // Handle different output modes:
            // - "files_with_matches" mode: numFiles > 0, filenames is populated
            // - "content" mode: numFiles = 0, but numLines > 0 and content has matches
            var mode = (_a = part.output) === null || _a === void 0 ? void 0 : _a.mode;
            var numFiles = ((_b = part.output) === null || _b === void 0 ? void 0 : _b.numFiles) || 0;
            var numLines = ((_c = part.output) === null || _c === void 0 ? void 0 : _c.numLines) || 0;
            if (mode === "content") {
                // In content mode, numFiles is always 0, use numLines instead
                return numLines > 0 ? "Found ".concat(numLines, " matches") : "No matches";
            }
            return numFiles > 0 ? "Grepped ".concat(numFiles, " files") : "No matches";
        },
        subtitle: function (part) {
            var _a, _b;
            // Don't show subtitle while input is still streaming
            if (part.state === "input-streaming")
                return "";
            var pattern = ((_a = part.input) === null || _a === void 0 ? void 0 : _a.pattern) || "";
            var path = ((_b = part.input) === null || _b === void 0 ? void 0 : _b.path) || "";
            if (path) {
                // Show "pattern in path"
                var combined = "".concat(pattern, " in ").concat(path);
                return combined.length > 40 ? combined.slice(0, 37) + "..." : combined;
            }
            return pattern.length > 40 ? pattern.slice(0, 37) + "..." : pattern;
        },
        variant: "simple"
    },
    "tool-Glob": {
        icon: lucide_solid_1.FolderSearch,
        title: function (part) {
            var _a, _b;
            var isPending = part.state !== "output-available" && part.state !== "output-error";
            var isInputStreaming = part.state === "input-streaming";
            if (isInputStreaming)
                return "Preparing search";
            if (isPending)
                return "Exploring files";
            // DEBUG: Log the part.output to understand its structure
            console.log("[Glob DEBUG] part.output:", {
                state: part.state,
                output: part.output,
                outputType: typeof part.output,
                outputKeys: part.output && typeof part.output === "object" ? Object.keys(part.output) : null,
                numFiles: (_a = part.output) === null || _a === void 0 ? void 0 : _a.numFiles
            });
            var numFiles = ((_b = part.output) === null || _b === void 0 ? void 0 : _b.numFiles) || 0;
            return numFiles > 0 ? "Found ".concat(numFiles, " files") : "No files found";
        },
        subtitle: function (part) {
            var _a, _b;
            // Don't show subtitle while input is still streaming
            if (part.state === "input-streaming")
                return "";
            var pattern = ((_a = part.input) === null || _a === void 0 ? void 0 : _a.pattern) || "";
            var targetDir = ((_b = part.input) === null || _b === void 0 ? void 0 : _b.target_directory) || "";
            if (targetDir) {
                // Show "pattern in targetDir"
                var combined = "".concat(pattern, " in ").concat(targetDir);
                return combined.length > 40 ? combined.slice(0, 37) + "..." : combined;
            }
            return pattern.length > 40 ? pattern.slice(0, 37) + "..." : pattern;
        },
        variant: "simple"
    },
    "tool-Read": {
        icon: icons_1.EyeIcon,
        title: function (part) {
            var isPending = part.state !== "output-available" && part.state !== "output-error";
            var isInputStreaming = part.state === "input-streaming";
            if (isInputStreaming)
                return "Preparing to read";
            return isPending ? "Reading" : "Read";
        },
        subtitle: function (part) {
            var _a;
            // Don't show subtitle while input is still streaming
            if (part.state === "input-streaming")
                return "";
            var filePath = ((_a = part.input) === null || _a === void 0 ? void 0 : _a.file_path) || "";
            if (!filePath)
                return "";
            return filePath.split("/").pop() || "";
        },
        tooltipContent: function (part) {
            var _a;
            if (part.state === "input-streaming")
                return "";
            var filePath = ((_a = part.input) === null || _a === void 0 ? void 0 : _a.file_path) || "";
            return getDisplayPath(filePath);
        },
        variant: "simple"
    },
    "tool-Edit": {
        icon: icons_1.IconEditFile,
        title: function (part) {
            var _a;
            var isInputStreaming = part.state === "input-streaming";
            if (isInputStreaming)
                return "Preparing edit";
            var filePath = ((_a = part.input) === null || _a === void 0 ? void 0 : _a.file_path) || "";
            if (!filePath)
                return "Edit";
            return filePath.split("/").pop() || "Edit";
        },
        subtitle: function (part) {
            var _a, _b;
            // Don't show subtitle while input is still streaming
            if (part.state === "input-streaming")
                return "";
            var isPending = part.state !== "output-available" && part.state !== "output-error";
            if (isPending)
                return "";
            var oldString = ((_a = part.input) === null || _a === void 0 ? void 0 : _a.old_string) || "";
            var newString = ((_b = part.input) === null || _b === void 0 ? void 0 : _b.new_string) || "";
            if (!oldString && !newString) {
                return "";
            }
            // Always show actual line counts if there are any changes (copied from canvas)
            if (oldString !== newString) {
                var _c = calculateDiffStats(oldString, newString), addedLines = _c.addedLines, removedLines = _c.removedLines;
                return "<span style=\"font-size: 11px; color: light-dark(#587C0B, #A3BE8C)\">+".concat(addedLines, "</span> <span style=\"font-size: 11px; color: light-dark(#AD0807, #AE5A62)\">-").concat(removedLines, "</span>");
            }
            return "";
        },
        variant: "simple"
    },
    "tool-cloning": {
        icon: lucide_solid_1.GitBranch,
        title: function () { return "Cloning repo"; },
        variant: "simple"
    },
    "tool-planning": {
        icon: icons_1.PlanningIcon,
        title: function () {
            var messages = [
                "Crafting...",
                "Whirring...",
                "Imagining...",
                "Cooking...",
                "Sussing...",
                "Unravelling...",
                "Creating...",
                "Spinning...",
                "Computing...",
                "Synthesizing...",
                "Manifesting..."
            ];
            return messages[Math.floor(Math.random() * messages.length)];
        },
        variant: "simple"
    },
    "tool-Write": {
        icon: icons_1.WriteFileIcon,
        title: function (part) {
            var isInputStreaming = part.state === "input-streaming";
            if (isInputStreaming)
                return "Preparing to create";
            return "Create";
        },
        subtitle: function (part) {
            var _a;
            // Don't show subtitle while input is still streaming
            if (part.state === "input-streaming")
                return "";
            var filePath = ((_a = part.input) === null || _a === void 0 ? void 0 : _a.file_path) || "";
            if (!filePath)
                return "";
            return filePath.split("/").pop() || "";
        },
        variant: "simple"
    },
    "tool-Bash": {
        icon: icons_1.CustomTerminalIcon,
        title: function (part) {
            var isPending = part.state !== "output-available" && part.state !== "output-error";
            var isInputStreaming = part.state === "input-streaming";
            if (isInputStreaming)
                return "Generating command";
            return isPending ? "Running command" : "Ran command";
        },
        subtitle: function (part) {
            var _a;
            // Don't show subtitle while input is still streaming
            if (part.state === "input-streaming")
                return "";
            var command = ((_a = part.input) === null || _a === void 0 ? void 0 : _a.command) || "";
            if (!command)
                return "";
            // Normalize line continuations and show truncated command
            var normalized = command.replace(/\\\s*\n\s*/g, " ").trim();
            return normalized.length > 50 ? normalized.slice(0, 47) + "..." : normalized;
        },
        variant: "simple"
    },
    "tool-WebFetch": {
        icon: icons_1.GlobeIcon,
        title: function (part) {
            var isPending = part.state !== "output-available" && part.state !== "output-error";
            var isInputStreaming = part.state === "input-streaming";
            if (isInputStreaming)
                return "Preparing fetch";
            return isPending ? "Fetching" : "Fetched";
        },
        subtitle: function (part) {
            var _a;
            // Don't show subtitle while input is still streaming
            if (part.state === "input-streaming")
                return "";
            var url = ((_a = part.input) === null || _a === void 0 ? void 0 : _a.url) || "";
            try {
                return new URL(url).hostname.replace("www.", "");
            }
            catch (_b) {
                return url.slice(0, 30);
            }
        },
        variant: "simple"
    },
    "tool-WebSearch": {
        icon: icons_1.SearchIcon,
        title: function (part) {
            var isPending = part.state !== "output-available" && part.state !== "output-error";
            var isInputStreaming = part.state === "input-streaming";
            if (isInputStreaming)
                return "Preparing search";
            return isPending ? "Searching web" : "Searched web";
        },
        subtitle: function (part) {
            var _a;
            // Don't show subtitle while input is still streaming
            if (part.state === "input-streaming")
                return "";
            var query = ((_a = part.input) === null || _a === void 0 ? void 0 : _a.query) || "";
            return query.length > 40 ? query.slice(0, 37) + "..." : query;
        },
        variant: "collapsible"
    },
    "tool-TodoWrite": {
        icon: lucide_solid_1.ListTodo,
        title: function (part) {
            var _a;
            var isPending = part.state !== "output-available" && part.state !== "output-error";
            var action = ((_a = part.input) === null || _a === void 0 ? void 0 : _a.action) || "update";
            if (isPending) {
                return action === "add" ? "Adding todo" : "Updating todos";
            }
            return action === "add" ? "Added todo" : "Updated todos";
        },
        subtitle: function (part) {
            var _a;
            var todos = ((_a = part.input) === null || _a === void 0 ? void 0 : _a.todos) || [];
            if (todos.length === 0)
                return "";
            return "".concat(todos.length, " ").concat(todos.length === 1 ? "item" : "items");
        },
        variant: "simple"
    },
    "tool-PlanWrite": {
        icon: icons_1.PlanningIcon,
        title: function (part) {
            var _a, _b, _c;
            var isPending = part.state !== "output-available" && part.state !== "output-error";
            var action = ((_a = part.input) === null || _a === void 0 ? void 0 : _a.action) || "create";
            var status = (_c = (_b = part.input) === null || _b === void 0 ? void 0 : _b.plan) === null || _c === void 0 ? void 0 : _c.status;
            if (isPending) {
                if (action === "create")
                    return "Creating plan";
                if (action === "approve")
                    return "Approving plan";
                if (action === "complete")
                    return "Completing plan";
                return "Updating plan";
            }
            if (status === "awaiting_approval")
                return "Plan ready for review";
            if (status === "approved")
                return "Plan approved";
            if (status === "completed")
                return "Plan completed";
            return action === "create" ? "Created plan" : "Updated plan";
        },
        subtitle: function (part) {
            var _a;
            var plan = (_a = part.input) === null || _a === void 0 ? void 0 : _a.plan;
            if (!plan)
                return "";
            var steps = plan.steps || [];
            var completed = steps.filter(function (s) { return s.status === "completed"; }).length;
            if (plan.title) {
                return steps.length > 0 ? "".concat(plan.title, " (").concat(completed, "/").concat(steps.length, ")") : plan.title;
            }
            return steps.length > 0 ? "".concat(completed, "/").concat(steps.length, " steps") : "";
        },
        variant: "simple"
    },
    "tool-ExitPlanMode": {
        icon: lucide_solid_1.LogOut,
        title: function (part) {
            var isPending = getToolStatus(part).isPending;
            return isPending ? "Finishing plan" : "Plan complete";
        },
        subtitle: function () { return ""; },
        variant: "simple"
    },
    "tool-NotebookEdit": {
        icon: lucide_solid_1.FileCode2,
        title: function (part) {
            var isPending = part.state !== "output-available" && part.state !== "output-error";
            return isPending ? "Editing notebook" : "Edited notebook";
        },
        subtitle: function (part) {
            var _a;
            var filePath = ((_a = part.input) === null || _a === void 0 ? void 0 : _a.file_path) || "";
            if (!filePath)
                return "";
            return filePath.split("/").pop() || "";
        },
        variant: "simple"
    },
    "tool-BashOutput": {
        icon: lucide_solid_1.Terminal,
        title: function (part) {
            var isPending = part.state !== "output-available" && part.state !== "output-error";
            return isPending ? "Getting output" : "Got output";
        },
        subtitle: function (part) {
            var _a;
            var pid = (_a = part.input) === null || _a === void 0 ? void 0 : _a.pid;
            return pid ? "PID: ".concat(pid) : "";
        },
        variant: "simple"
    },
    "tool-KillShell": {
        icon: lucide_solid_1.XCircle,
        title: function (part) {
            var isPending = part.state !== "output-available" && part.state !== "output-error";
            return isPending ? "Stopping shell" : "Stopped shell";
        },
        subtitle: function (part) {
            var _a;
            var pid = (_a = part.input) === null || _a === void 0 ? void 0 : _a.pid;
            return pid ? "PID: ".concat(pid) : "";
        },
        variant: "simple"
    },
    "tool-ListMcpResources": {
        icon: lucide_solid_1.Server,
        title: function (part) {
            var isPending = part.state !== "output-available" && part.state !== "output-error";
            return isPending ? "Listing resources" : "Listed resources";
        },
        subtitle: function (part) {
            var _a;
            var server = ((_a = part.input) === null || _a === void 0 ? void 0 : _a.server) || "";
            return server;
        },
        variant: "simple"
    },
    "tool-ReadMcpResource": {
        icon: lucide_solid_1.Database,
        title: function (part) {
            var isPending = part.state !== "output-available" && part.state !== "output-error";
            return isPending ? "Reading resource" : "Read resource";
        },
        subtitle: function (part) {
            var _a;
            var uri = ((_a = part.input) === null || _a === void 0 ? void 0 : _a.uri) || "";
            return uri.length > 30 ? "..." + uri.slice(-27) : uri;
        },
        variant: "simple"
    },
    "system-Compact": {
        icon: lucide_solid_1.Minimize2,
        title: function (part) {
            var isPending = part.state !== "output-available" && part.state !== "output-error";
            return isPending ? "Compacting..." : "Compacted";
        },
        variant: "simple"
    },
    "tool-Thinking": {
        icon: icons_1.SparklesIcon,
        title: function (part) {
            var isPending = part.state !== "output-available" && part.state !== "output-error";
            return isPending ? "Thinking..." : "Thought";
        },
        subtitle: function (part) {
            var _a;
            var text = ((_a = part.input) === null || _a === void 0 ? void 0 : _a.text) || "";
            // Show first 50 chars as preview
            return text.length > 50 ? text.slice(0, 47) + "..." : text;
        },
        variant: "collapsible"
    }
};
