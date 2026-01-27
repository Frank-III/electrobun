"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usePRStatus = usePRStatus;
var trpc_1 = require("../../lib/trpc");
/**
 * Hook to fetch and manage GitHub PR status for a worktree.
 * Returns PR info, loading state, and refetch function.
 */
function usePRStatus(_a) {
    var _b, _c, _d;
    var worktreePath = _a.worktreePath, _e = _a.enabled, enabled = _e === void 0 ? true : _e, _f = _a.refetchInterval, refetchInterval = _f === void 0 ? 10000 : _f;
    var _g = trpc_1.trpc.changes.getGitHubStatus.useQuery({ worktreePath: worktreePath }, {
        enabled: enabled && !!worktreePath,
        refetchInterval: refetchInterval,
    }), githubStatus = _g.data, isLoading = _g.isLoading, refetch = _g.refetch;
    return {
        pr: (_b = githubStatus === null || githubStatus === void 0 ? void 0 : githubStatus.pr) !== null && _b !== void 0 ? _b : null,
        repoUrl: (_c = githubStatus === null || githubStatus === void 0 ? void 0 : githubStatus.repoUrl) !== null && _c !== void 0 ? _c : null,
        branchExistsOnRemote: (_d = githubStatus === null || githubStatus === void 0 ? void 0 : githubStatus.branchExistsOnRemote) !== null && _d !== void 0 ? _d : false,
        isLoading: isLoading,
        refetch: refetch,
    };
}
