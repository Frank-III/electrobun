"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var bun_1 = require("electrobun/bun");
var agents_1 = require("./agents");
var anthropic_accounts_1 = require("./anthropic-accounts");
var claude_1 = require("./claude");
var claude_code_1 = require("./claude-code");
var claude_settings_1 = require("./claude-settings");
var chats_1 = require("./chats");
var changes_1 = require("./changes");
var cli_1 = require("./cli");
var commands_1 = require("./commands");
var db_1 = require("./db");
var debug_1 = require("./debug");
var external_1 = require("./external");
var files_1 = require("./files");
var git_watcher_handlers_1 = require("./git-watcher-handlers");
var ollama_1 = require("./ollama");
var projects_1 = require("./projects");
var sandbox_import_1 = require("./sandbox-import");
var skills_1 = require("./skills");
var terminal_manager_1 = require("./terminal-manager");
var voice_1 = require("./voice");
var worktree_config_handlers_1 = require("./worktree-config-handlers");
var mainWindow = null;
var sendToWebview = null;
await (0, db_1.initDatabase)();
(0, cli_1.parseLaunchDirectory)();
var terminalHandlers = (0, terminal_manager_1.createTerminalHandlers)(function (id, data) { var _a; return (_a = sendToWebview === null || sendToWebview === void 0 ? void 0 : sendToWebview.send) === null || _a === void 0 ? void 0 : _a.data({ id: id, data: data }); }, function (id, exitCode, signal) { var _a; return (_a = sendToWebview === null || sendToWebview === void 0 ? void 0 : sendToWebview.send) === null || _a === void 0 ? void 0 : _a.exit({ id: id, exitCode: exitCode, signal: signal }); }, function (id, title) { var _a; return (_a = sendToWebview === null || sendToWebview === void 0 ? void 0 : sendToWebview.send) === null || _a === void 0 ? void 0 : _a.titleChanged({ id: id, title: title }); }, function (id) { var _a; return (_a = sendToWebview === null || sendToWebview === void 0 ? void 0 : sendToWebview.send) === null || _a === void 0 ? void 0 : _a.bell({ id: id }); });
var fileHandlers = (0, files_1.createFileHandlers)();
var externalHandlers = (0, external_1.createExternalHandlers)();
var commandsHandlers = (0, commands_1.createCommandsHandlers)();
var ollamaHandlers = (0, ollama_1.createOllamaHandlers)();
var skillsHandlers = (0, skills_1.createSkillsHandlers)();
var agentsHandlers = (0, agents_1.createAgentsHandlers)();
var anthropicAccountsHandlers = (0, anthropic_accounts_1.createAnthropicAccountsHandlers)();
var claudeHandlers = (0, claude_1.createClaudeHandlers)();
var claudeCodeHandlers = (0, claude_code_1.createClaudeCodeHandlers)();
var claudeSettingsHandlers = (0, claude_settings_1.createClaudeSettingsHandlers)();
var projectsHandlers = (0, projects_1.createProjectsHandlers)();
var sandboxImportHandlers = (0, sandbox_import_1.createSandboxImportHandlers)();
var debugHandlers = (0, debug_1.createDebugHandlers)();
var worktreeConfigHandlers = (0, worktree_config_handlers_1.createWorktreeConfigHandlers)();
var chatsHandlers = (0, chats_1.createChatsHandlers)();
var changesHandlers = (0, changes_1.createChangesHandlers)();
var gitWatcherHandlers = (0, git_watcher_handlers_1.createGitWatcherHandlers)(function (event) {
    var _a;
    (_a = sendToWebview === null || sendToWebview === void 0 ? void 0 : sendToWebview.send) === null || _a === void 0 ? void 0 : _a.gitStatusChanged({
        worktreePath: event.worktreePath,
        changes: event.changes,
    });
});
var voiceHandlers = (0, voice_1.createVoiceHandlers)();
var rpc = bun_1.BrowserView.defineRPC({
    handlers: {
        requests: {
            ping: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
                var label = _b.label;
                return __generator(this, function (_c) {
                    return [2 /*return*/, ({ ok: true, reply: "pong:".concat(label) })];
                });
            }); },
            openExternal: function (_a) {
                var url = _a.url;
                bun_1.Utils.openExternal(url);
            },
            openInFinder: externalHandlers.openInFinder,
            openFileInEditor: externalHandlers.openFileInEditor,
            openFileDialog: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
                var paths;
                var directory = _b.directory, multiple = _b.multiple;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4 /*yield*/, bun_1.Utils.openFileDialog({
                                directory: directory !== null && directory !== void 0 ? directory : false,
                                multiple: multiple !== null && multiple !== void 0 ? multiple : false,
                            })];
                        case 1:
                            paths = _c.sent();
                            return [2 /*return*/, { paths: paths }];
                    }
                });
            }); },
            windowMinimize: function () {
                mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.minimize();
            },
            windowMaximize: function () {
                if (!mainWindow)
                    return;
                if (mainWindow.isMaximized()) {
                    mainWindow.unmaximize();
                    return;
                }
                mainWindow.maximize();
            },
            windowClose: function () {
                mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.close();
            },
            windowIsMaximized: function () { var _a; return ({ isMaximized: (_a = mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.isMaximized()) !== null && _a !== void 0 ? _a : false }); },
            windowToggleFullscreen: function () {
                if (!mainWindow)
                    return;
                mainWindow.setFullScreen(!mainWindow.isFullScreen());
            },
            windowIsFullscreen: function () { var _a; return ({ isFullscreen: (_a = mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.isFullScreen()) !== null && _a !== void 0 ? _a : false }); },
            create: terminalHandlers.create,
            write: terminalHandlers.write,
            resize: terminalHandlers.resize,
            destroy: terminalHandlers.destroy,
            getDefaultShell: terminalHandlers.getDefaultShell,
            clipboardWrite: terminalHandlers.clipboardWrite,
            clipboardRead: terminalHandlers.clipboardRead,
            getScreenContent: terminalHandlers.getScreenContent,
            searchScrollback: terminalHandlers.searchScrollback,
            getCurrentCommand: terminalHandlers.getCurrentCommand,
            filesSearch: fileHandlers.filesSearch,
            filesClearCache: fileHandlers.filesClearCache,
            filesRead: fileHandlers.filesRead,
            filesWritePastedText: fileHandlers.filesWritePastedText,
            commandsList: commandsHandlers.commandsList,
            commandsGetContent: commandsHandlers.commandsGetContent,
            skillsList: skillsHandlers.skillsList,
            skillsListEnabled: skillsHandlers.skillsListEnabled,
            ollamaGetStatus: ollamaHandlers.ollamaGetStatus,
            ollamaIsOfflineModeAvailable: ollamaHandlers.ollamaIsOfflineModeAvailable,
            ollamaGetModels: ollamaHandlers.ollamaGetModels,
            ollamaGenerateChatName: ollamaHandlers.ollamaGenerateChatName,
            ollamaGenerateCommitMessage: ollamaHandlers.ollamaGenerateCommitMessage,
            agentsList: agentsHandlers.agentsList,
            agentsListEnabled: agentsHandlers.agentsListEnabled,
            agentsGet: agentsHandlers.agentsGet,
            agentsCreate: agentsHandlers.agentsCreate,
            agentsUpdate: agentsHandlers.agentsUpdate,
            agentsDelete: agentsHandlers.agentsDelete,
            claudeSettingsGetIncludeCoAuthoredBy: claudeSettingsHandlers.claudeSettingsGetIncludeCoAuthoredBy,
            claudeSettingsSetIncludeCoAuthoredBy: claudeSettingsHandlers.claudeSettingsSetIncludeCoAuthoredBy,
            claudeCodeHasExistingCliConfig: claudeCodeHandlers.claudeCodeHasExistingCliConfig,
            claudeCodeGetIntegration: claudeCodeHandlers.claudeCodeGetIntegration,
            claudeCodeStartAuth: claudeCodeHandlers.claudeCodeStartAuth,
            claudeCodePollStatus: claudeCodeHandlers.claudeCodePollStatus,
            claudeCodeSubmitCode: claudeCodeHandlers.claudeCodeSubmitCode,
            claudeCodeGetSystemToken: claudeCodeHandlers.claudeCodeGetSystemToken,
            claudeCodeImportSystemToken: claudeCodeHandlers.claudeCodeImportSystemToken,
            claudeCodeGetToken: claudeCodeHandlers.claudeCodeGetToken,
            claudeCodeDisconnect: claudeCodeHandlers.claudeCodeDisconnect,
            claudeCodeOpenOAuthUrl: claudeCodeHandlers.claudeCodeOpenOAuthUrl,
            claudeGetMcpConfig: claudeHandlers.claudeGetMcpConfig,
            claudeGetAllMcpConfig: claudeHandlers.claudeGetAllMcpConfig,
            claudeStartMcpOAuth: claudeHandlers.claudeStartMcpOAuth,
            claudeFetchMcpOAuthMetadata: claudeHandlers.claudeFetchMcpOAuthMetadata,
            projectsGetLaunchDirectory: projectsHandlers.projectsGetLaunchDirectory,
            projectsList: projectsHandlers.projectsList,
            projectsGet: projectsHandlers.projectsGet,
            projectsOpenFolder: projectsHandlers.projectsOpenFolder,
            projectsCreate: projectsHandlers.projectsCreate,
            projectsRename: projectsHandlers.projectsRename,
            projectsDelete: projectsHandlers.projectsDelete,
            projectsRefreshGitInfo: projectsHandlers.projectsRefreshGitInfo,
            projectsCloneFromGitHub: projectsHandlers.projectsCloneFromGitHub,
            projectsLocateAndAdd: projectsHandlers.projectsLocateAndAdd,
            projectsPickCloneDestination: projectsHandlers.projectsPickCloneDestination,
            sandboxImportImportSandboxChat: sandboxImportHandlers.sandboxImportImportSandboxChat,
            sandboxImportCloneFromSandbox: sandboxImportHandlers.sandboxImportCloneFromSandbox,
            debugGetSystemInfo: debugHandlers.debugGetSystemInfo,
            debugGetDbStats: debugHandlers.debugGetDbStats,
            debugClearChats: debugHandlers.debugClearChats,
            debugClearAllData: debugHandlers.debugClearAllData,
            debugLogout: debugHandlers.debugLogout,
            debugOpenUserDataFolder: debugHandlers.debugOpenUserDataFolder,
            debugGetOfflineSimulation: debugHandlers.debugGetOfflineSimulation,
            debugSetOfflineSimulation: debugHandlers.debugSetOfflineSimulation,
            worktreeConfigGet: worktreeConfigHandlers.worktreeConfigGet,
            worktreeConfigSave: worktreeConfigHandlers.worktreeConfigSave,
            worktreeConfigGetAvailablePaths: worktreeConfigHandlers.worktreeConfigGetAvailablePaths,
            chatsList: chatsHandlers.chatsList,
            chatsListArchived: chatsHandlers.chatsListArchived,
            chatsGet: chatsHandlers.chatsGet,
            chatsCreate: chatsHandlers.chatsCreate,
            chatsRename: chatsHandlers.chatsRename,
            chatsArchive: chatsHandlers.chatsArchive,
            chatsArchiveBatch: chatsHandlers.chatsArchiveBatch,
            chatsRestore: chatsHandlers.chatsRestore,
            chatsDelete: chatsHandlers.chatsDelete,
            chatsGetSubChat: chatsHandlers.chatsGetSubChat,
            chatsCreateSubChat: chatsHandlers.chatsCreateSubChat,
            chatsUpdateSubChatMessages: chatsHandlers.chatsUpdateSubChatMessages,
            chatsRollbackToMessage: chatsHandlers.chatsRollbackToMessage,
            chatsUpdateSubChatSession: chatsHandlers.chatsUpdateSubChatSession,
            chatsUpdateSubChatMode: chatsHandlers.chatsUpdateSubChatMode,
            chatsRenameSubChat: chatsHandlers.chatsRenameSubChat,
            chatsDeleteSubChat: chatsHandlers.chatsDeleteSubChat,
            chatsGenerateSubChatName: chatsHandlers.chatsGenerateSubChatName,
            chatsGenerateCommitMessage: chatsHandlers.chatsGenerateCommitMessage,
            chatsGetDiff: chatsHandlers.chatsGetDiff,
            chatsGetParsedDiff: chatsHandlers.chatsGetParsedDiff,
            chatsGetPrContext: chatsHandlers.chatsGetPrContext,
            chatsUpdatePrInfo: chatsHandlers.chatsUpdatePrInfo,
            chatsGetPrStatus: chatsHandlers.chatsGetPrStatus,
            chatsMergePr: chatsHandlers.chatsMergePr,
            chatsGetFileStats: chatsHandlers.chatsGetFileStats,
            chatsGetPendingPlanApprovals: chatsHandlers.chatsGetPendingPlanApprovals,
            chatsGetWorktreeStatus: chatsHandlers.chatsGetWorktreeStatus,
            chatsExportChat: chatsHandlers.chatsExportChat,
            chatsGetChatStats: chatsHandlers.chatsGetChatStats,
            changesGetStatus: changesHandlers.changesGetStatus,
            changesGetBranches: changesHandlers.changesGetBranches,
            changesFetch: changesHandlers.changesFetch,
            changesFetchRemote: changesHandlers.changesFetchRemote,
            changesCheckout: changesHandlers.changesCheckout,
            changesGetHistory: changesHandlers.changesGetHistory,
            changesCommit: changesHandlers.changesCommit,
            changesAtomicCommit: changesHandlers.changesAtomicCommit,
            changesPush: changesHandlers.changesPush,
            changesForcePush: changesHandlers.changesForcePush,
            changesPull: changesHandlers.changesPull,
            changesMergeFromDefault: changesHandlers.changesMergeFromDefault,
            changesCreateBranch: changesHandlers.changesCreateBranch,
            changesGetCommitFiles: changesHandlers.changesGetCommitFiles,
            changesGetCommitFileDiff: changesHandlers.changesGetCommitFileDiff,
            changesIsWorktreeRegistered: changesHandlers.changesIsWorktreeRegistered,
            changesGetGitHubStatus: changesHandlers.changesGetGitHubStatus,
            changesStageFile: changesHandlers.changesStageFile,
            changesUnstageFile: changesHandlers.changesUnstageFile,
            changesDiscardChanges: changesHandlers.changesDiscardChanges,
            changesStageAll: changesHandlers.changesStageAll,
            changesUnstageAll: changesHandlers.changesUnstageAll,
            changesStageFiles: changesHandlers.changesStageFiles,
            changesUnstageFiles: changesHandlers.changesUnstageFiles,
            changesDeleteUntracked: changesHandlers.changesDeleteUntracked,
            changesDiscardMultipleChanges: changesHandlers.changesDiscardMultipleChanges,
            changesDeleteMultipleUntracked: changesHandlers.changesDeleteMultipleUntracked,
            gitWatcherSubscribe: gitWatcherHandlers.gitWatcherSubscribe,
            gitWatcherUnsubscribe: gitWatcherHandlers.gitWatcherUnsubscribe,
            anthropicAccountsList: anthropicAccountsHandlers.anthropicAccountsList,
            anthropicAccountsGetActive: anthropicAccountsHandlers.anthropicAccountsGetActive,
            anthropicAccountsGetActiveToken: anthropicAccountsHandlers.anthropicAccountsGetActiveToken,
            anthropicAccountsSetActive: anthropicAccountsHandlers.anthropicAccountsSetActive,
            anthropicAccountsAdd: anthropicAccountsHandlers.anthropicAccountsAdd,
            anthropicAccountsRename: anthropicAccountsHandlers.anthropicAccountsRename,
            anthropicAccountsRemove: anthropicAccountsHandlers.anthropicAccountsRemove,
            anthropicAccountsHasAccounts: anthropicAccountsHandlers.anthropicAccountsHasAccounts,
            anthropicAccountsMigrateLegacy: anthropicAccountsHandlers.anthropicAccountsMigrateLegacy,
            voiceTranscribe: voiceHandlers.voiceTranscribe,
            voiceIsAvailable: voiceHandlers.voiceIsAvailable,
            voiceSetOpenAIKey: voiceHandlers.voiceSetOpenAIKey,
            voiceHasOpenAIKey: voiceHandlers.voiceHasOpenAIKey,
        },
        messages: {
            "*": function (name, payload) {
                console.log("[webview] ".concat(name), payload);
            },
        },
    },
});
mainWindow = new bun_1.BrowserWindow({
    title: "1Code Learn TS",
    url: "views://mainview/index.html",
    frame: { width: 1280, height: 820, x: 120, y: 80 },
    titleBarStyle: "hiddenInset",
    rpc: rpc,
});
(_a = mainWindow.webview) === null || _a === void 0 ? void 0 : _a.on("dom-ready", function () {
    var _a, _b;
    sendToWebview = (_b = (_a = mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.webview) === null || _a === void 0 ? void 0 : _a.rpc) !== null && _b !== void 0 ? _b : null;
});
mainWindow.on("close", function () {
    (0, terminal_manager_1.destroyAll)();
});
