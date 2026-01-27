"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAutoImport = useAutoImport;
var react_1 = require("react");
var trpc_1 = require("../../../lib/trpc");
var solid_sonner_1 = require("solid-sonner");
var jotai_1 = require("../../../lib/state/jotai");
var atoms_1 = require("../atoms");
var atoms_2 = require("../../../lib/atoms");
function useAutoImport() {
    var setSelectedChatId = (0, jotai_1.useSetAtom)(atoms_1.selectedAgentChatIdAtom);
    var setChatSourceMode = (0, jotai_1.useSetAtom)(atoms_2.chatSourceModeAtom);
    var utils = trpc_1.trpc.useUtils();
    var importMutation = trpc_1.trpc.sandboxImport.importSandboxChat.useMutation({
        onSuccess: function (result) {
            solid_sonner_1.toast.success("Opened locally");
            setChatSourceMode("local");
            setSelectedChatId(result.chatId);
            utils.chats.list.invalidate();
        },
        onError: function (error) {
            solid_sonner_1.toast.error("Import failed: ".concat(error.message));
        },
    });
    var getMatchingProjects = (0, react_1.useCallback)(function (projects, remoteChat) {
        var _a;
        console.log("[OPEN-LOCALLY-MATCH] ========== MATCHING DEBUG ==========");
        console.log("[OPEN-LOCALLY-MATCH] Remote chat:", {
            id: remoteChat.id,
            name: remoteChat.name,
            meta: remoteChat.meta,
        });
        if (!((_a = remoteChat.meta) === null || _a === void 0 ? void 0 : _a.repository)) {
            console.log("[OPEN-LOCALLY-MATCH] No repository in meta, returning []");
            return [];
        }
        var _b = remoteChat.meta.repository.split("/"), owner = _b[0], repo = _b[1];
        console.log("[OPEN-LOCALLY-MATCH] Looking for: owner=\"".concat(owner, "\", repo=\"").concat(repo, "\""));
        console.log("[OPEN-LOCALLY-MATCH] All projects (".concat(projects.length, "):"));
        projects.forEach(function (p, i) {
            console.log("[OPEN-LOCALLY-MATCH]   ".concat(i + 1, ". \"").concat(p.name, "\" at ").concat(p.path));
            console.log("[OPEN-LOCALLY-MATCH]      gitOwner=\"".concat(p.gitOwner, "\", gitRepo=\"").concat(p.gitRepo, "\""));
            console.log("[OPEN-LOCALLY-MATCH]      matches: ".concat(p.gitOwner === owner && p.gitRepo === repo));
        });
        var matches = projects.filter(function (p) { return p.gitOwner === owner && p.gitRepo === repo; });
        console.log("[OPEN-LOCALLY-MATCH] Found ".concat(matches.length, " matching project(s)"));
        console.log("[OPEN-LOCALLY-MATCH] ========== END MATCHING DEBUG ==========");
        return matches;
    }, []);
    var autoImport = (0, react_1.useCallback)(function (remoteChat, project) {
        if (!remoteChat.sandbox_id) {
            solid_sonner_1.toast.error("This chat has no sandbox to import");
            return;
        }
        importMutation.mutate({
            sandboxId: remoteChat.sandbox_id,
            remoteChatId: remoteChat.id,
            projectId: project.id,
            chatName: remoteChat.name,
        });
    }, [importMutation]);
    return {
        getMatchingProjects: getMatchingProjects,
        autoImport: autoImport,
        isImporting: importMutation.isPending,
    };
}
