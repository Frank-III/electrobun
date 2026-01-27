"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useUserTeams = useUserTeams;
exports.useRemoteChats = useRemoteChats;
exports.useRemoteChat = useRemoteChat;
exports.usePrefetchRemoteChat = usePrefetchRemoteChat;
exports.useRemoteArchivedChats = useRemoteArchivedChats;
exports.useArchiveRemoteChat = useArchiveRemoteChat;
exports.useArchiveRemoteChatsBatch = useArchiveRemoteChatsBatch;
exports.useRestoreRemoteChat = useRestoreRemoteChat;
exports.useRenameRemoteSubChat = useRenameRemoteSubChat;
exports.useRenameRemoteChat = useRenameRemoteChat;
var react_query_1 = require("@tanstack/react-query");
var jotai_1 = require("../state/jotai");
var react_1 = require("react");
var atoms_1 = require("../atoms");
var remote_api_1 = require("../remote-api");
/**
 * Fetch user's teams and auto-select first team if none selected
 * Uses stale-while-revalidate: show cached immediately, validate in background
 */
function useUserTeams(enabled) {
    if (enabled === void 0) { enabled = true; }
    var _a = (0, jotai_1.useAtom)(atoms_1.selectedTeamIdAtom), teamId = _a[0], setTeamId = _a[1];
    var query = (0, react_query_1.useQuery)({
        queryKey: ["user-teams"],
        queryFn: function () { return remote_api_1.remoteApi.getTeams(); },
        staleTime: 5 * 60 * 1000, // 5 min - teams rarely change
        gcTime: Infinity, // Never garbage collect
        refetchOnMount: true, // Revalidate if stale
        refetchOnWindowFocus: false,
        enabled: enabled,
        retry: 1,
    });
    // Auto-select first team OR fix stale teamId
    (0, react_1.useEffect)(function () {
        // Wait for successful fetch
        if (query.status !== "success" || !query.data)
            return;
        // If user has teams
        if (query.data.length > 0) {
            // If no teamId cached, select first team
            if (!teamId) {
                setTeamId(query.data[0].id);
                return;
            }
            // Validate cached teamId exists in current user's teams
            var teamExists = query.data.some(function (t) { return t.id === teamId; });
            if (!teamExists) {
                console.log("[useUserTeams] Cached teamId not found, resetting to first team");
                setTeamId(query.data[0].id);
            }
        }
        else {
            // User has no teams - clear stale teamId
            if (teamId) {
                console.log("[useUserTeams] User has no teams, clearing teamId");
                setTeamId(null);
            }
        }
    }, [query.status, query.data, teamId, setTeamId]);
    return query;
}
/**
 * Fetch all remote sandbox chats for the selected team
 * Uses stale-while-revalidate: show cached immediately, refresh in background
 */
function useRemoteChats() {
    var teamId = (0, jotai_1.useAtomValue)(atoms_1.selectedTeamIdAtom);
    return (0, react_query_1.useQuery)({
        queryKey: ["remote-chats", teamId],
        queryFn: function () { return remote_api_1.remoteApi.getAgentChats(teamId); },
        enabled: !!teamId,
        staleTime: 30 * 1000, // Consider stale after 30s
        gcTime: 30 * 60 * 1000, // Keep in cache 30 min
        refetchOnMount: true, // Revalidate on mount
        refetchOnWindowFocus: true, // Revalidate when window focused
        placeholderData: function (prev) { return prev; },
    });
}
/**
 * Fetch a single remote chat with all its sub-chats
 */
function useRemoteChat(chatId) {
    return (0, react_query_1.useQuery)({
        queryKey: ["remote-chat", chatId],
        queryFn: function () { return remote_api_1.remoteApi.getAgentChat(chatId); },
        enabled: !!chatId,
        staleTime: 60 * 1000, // 1 minute
        gcTime: 30 * 60 * 1000, // 30 minutes
    });
}
/**
 * Prefetch a remote chat on hover (for instant loading when clicked)
 */
function usePrefetchRemoteChat() {
    var queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_1.useCallback)(function (chatId) {
        queryClient.prefetchQuery({
            queryKey: ["remote-chat", chatId],
            queryFn: function () { return remote_api_1.remoteApi.getAgentChat(chatId); },
            staleTime: 60 * 1000,
        });
    }, [queryClient]);
}
/**
 * Fetch archived remote chats for the selected team
 */
function useRemoteArchivedChats() {
    var teamId = (0, jotai_1.useAtomValue)(atoms_1.selectedTeamIdAtom);
    return (0, react_query_1.useQuery)({
        queryKey: ["remote-archived-chats", teamId],
        queryFn: function () { return remote_api_1.remoteApi.getArchivedChats(teamId); },
        enabled: !!teamId,
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
    });
}
/**
 * Archive a remote chat
 */
function useArchiveRemoteChat() {
    var queryClient = (0, react_query_1.useQueryClient)();
    var teamId = (0, jotai_1.useAtomValue)(atoms_1.selectedTeamIdAtom);
    return (0, react_query_1.useMutation)({
        mutationFn: function (chatId) { return remote_api_1.remoteApi.archiveChat(chatId); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["remote-chats", teamId] });
            queryClient.invalidateQueries({ queryKey: ["remote-archived-chats", teamId] });
        },
    });
}
/**
 * Archive multiple remote chats at once
 */
function useArchiveRemoteChatsBatch() {
    var queryClient = (0, react_query_1.useQueryClient)();
    var teamId = (0, jotai_1.useAtomValue)(atoms_1.selectedTeamIdAtom);
    return (0, react_query_1.useMutation)({
        mutationFn: function (chatIds) { return remote_api_1.remoteApi.archiveChatsBatch(chatIds); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["remote-chats", teamId] });
            queryClient.invalidateQueries({ queryKey: ["remote-archived-chats", teamId] });
        },
    });
}
/**
 * Restore a remote chat from archive
 */
function useRestoreRemoteChat() {
    var queryClient = (0, react_query_1.useQueryClient)();
    var teamId = (0, jotai_1.useAtomValue)(atoms_1.selectedTeamIdAtom);
    return (0, react_query_1.useMutation)({
        mutationFn: function (chatId) { return remote_api_1.remoteApi.restoreChat(chatId); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["remote-chats", teamId] });
            queryClient.invalidateQueries({ queryKey: ["remote-archived-chats", teamId] });
        },
    });
}
/**
 * Rename a remote sub-chat
 */
function useRenameRemoteSubChat() {
    var queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: function (_a) {
            var subChatId = _a.subChatId, name = _a.name;
            return remote_api_1.remoteApi.renameSubChat(subChatId, name);
        },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["remote-chat"] });
        },
    });
}
/**
 * Rename a remote chat (workspace)
 */
function useRenameRemoteChat() {
    var queryClient = (0, react_query_1.useQueryClient)();
    var teamId = (0, jotai_1.useAtomValue)(atoms_1.selectedTeamIdAtom);
    return (0, react_query_1.useMutation)({
        mutationFn: function (_a) {
            var chatId = _a.chatId, name = _a.name;
            return remote_api_1.remoteApi.renameChat(chatId, name);
        },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["remote-chats", teamId] });
            queryClient.invalidateQueries({ queryKey: ["remote-chat"] });
        },
    });
}
