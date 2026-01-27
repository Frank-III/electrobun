"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deriveWorkspaceStatus = deriveWorkspaceStatus;
function deriveWorkspaceStatus(chatId, deps) {
    var workspacesLoading = deps.workspacesLoading, workspacesWithPendingQuestions = deps.workspacesWithPendingQuestions, workspacesWithPendingApprovals = deps.workspacesWithPendingApprovals;
    // 1. Needs Input - has pending question or plan approval (highest priority - user action required)
    if (workspacesWithPendingQuestions.has(chatId) || workspacesWithPendingApprovals.has(chatId)) {
        return "needs-input";
    }
    // 2. In Progress - any sub-chat is loading
    if (workspacesLoading.has(chatId)) {
        return "in-progress";
    }
    // 3. Done - everything else (workspaces are never "draft" - they always have at least one sub-chat)
    return "done";
}
