import { BrowserView, BrowserWindow, Utils, Updater } from "electrobun/bun";
import type { AppRPC, WebviewMessageSender } from "../shared/rpc-schema";
import { createAgentsHandlers } from "./agents";
import { createChatStreamHandlers } from "./chat-stream";
import { createClaudeSettingsHandlers } from "./claude-settings";
import { createChatsHandlers } from "./chats";
import { createChangesHandlers } from "./changes";
import { parseLaunchDirectory } from "./cli";
import { createCommandsHandlers } from "./commands";
import { initDatabase } from "./db";
import { createDebugHandlers } from "./debug";
import { createExternalHandlers } from "./external";
import { createFileHandlers } from "./files";
import { createGitWatcherHandlers } from "./git-watcher-handlers";
import { createOllamaHandlers } from "./ollama";
import { createProjectsHandlers } from "./projects";
import { createSandboxImportHandlers } from "./sandbox-import";
import { createSkillsHandlers } from "./skills";
import { createTerminalHandlers, destroyAll } from "./terminal-manager";
import { createVoiceHandlers } from "./voice";
import { createWorktreeConfigHandlers } from "./worktree-config-handlers";
import { createClaudeCodeHandlers } from "./claude-code";

let mainWindow: BrowserWindow | null = null;
let sendToWebview: { send: WebviewMessageSender } | null = null;

await initDatabase();
parseLaunchDirectory();

const terminalHandlers = createTerminalHandlers(
  (id, data) => sendToWebview?.send?.data({ id, data }),
  (id, exitCode, signal) => sendToWebview?.send?.exit({ id, exitCode, signal }),
  (id, title) => sendToWebview?.send?.titleChanged({ id, title }),
  (id) => sendToWebview?.send?.bell({ id }),
);

const fileHandlers = createFileHandlers();
const externalHandlers = createExternalHandlers();
const commandsHandlers = createCommandsHandlers();
const ollamaHandlers = createOllamaHandlers();
const skillsHandlers = createSkillsHandlers();
const agentsHandlers = createAgentsHandlers();
const claudeSettingsHandlers = createClaudeSettingsHandlers();
const projectsHandlers = createProjectsHandlers();
const sandboxImportHandlers = createSandboxImportHandlers();
const debugHandlers = createDebugHandlers();
const worktreeConfigHandlers = createWorktreeConfigHandlers();
const chatsHandlers = createChatsHandlers();
const changesHandlers = createChangesHandlers();
const gitWatcherHandlers = createGitWatcherHandlers((event) => {
  sendToWebview?.send?.gitStatusChanged({
    worktreePath: event.worktreePath,
    changes: event.changes,
  });
});
const voiceHandlers = createVoiceHandlers();
const claudeCodeHandlers = createClaudeCodeHandlers();
const chatStreamHandlers = createChatStreamHandlers((subChatId, chunk) => {
  sendToWebview?.send?.chatChunk({ subChatId, chunk });
});

const rpc = BrowserView.defineRPC<AppRPC>({
  handlers: {
    requests: {
      ping: async ({ label }) => ({ ok: true, reply: `pong:${label}` }),
      openExternal: ({ url }) => {
        Utils.openExternal(url);
      },
      openInFinder: externalHandlers.openInFinder,
      openFileInEditor: externalHandlers.openFileInEditor,
      openFileDialog: async ({ directory, multiple }) => {
        const paths = await Utils.openFileDialog({
          directory: directory ?? false,
          multiple: multiple ?? false,
        });
        return { paths };
      },
      windowMinimize: () => {
        mainWindow?.minimize();
      },
      windowMaximize: () => {
        if (!mainWindow) return;
        if (mainWindow.isMaximized()) {
          mainWindow.unmaximize();
          return;
        }
        mainWindow.maximize();
      },
      windowClose: () => {
        mainWindow?.close();
      },
      windowIsMaximized: () => ({ isMaximized: mainWindow?.isMaximized() ?? false }),
      windowToggleFullscreen: () => {
        if (!mainWindow) return;
        mainWindow.setFullScreen(!mainWindow.isFullScreen());
      },
      windowIsFullscreen: () => ({ isFullscreen: mainWindow?.isFullScreen() ?? false }),
      setWindowTitle: ({ title }) => {
        // NOTE: BrowserWindow.setTitle may not exist in current Electrobun version
        // @ts-expect-error - setTitle may be added in future version
        mainWindow?.setTitle?.(title);
      },
      showNotification: ({ title, body }) => {
        // TODO: Implement native notifications via Electrobun
        console.log(`[notification] ${title}: ${body}`);
      },
      setBadge: ({ count }) => {
        // TODO: Implement dock badge via Electrobun
        console.log(`[badge] count: ${count}`);
      },
      getVersion: async () => {
        const info = await Updater.localInfo.version();
        return { version: info };
      },
      checkForUpdates: async () => {
        try {
          await Updater.checkForUpdates();
          // Electrobun checkForUpdates doesn't return a value, we need to get info separately
          const currentVersion = await Updater.localInfo.version();
          return {
            updateAvailable: false, // Would need to compare versions
            currentVersion,
            latestVersion: undefined,
          };
        } catch {
          const currentVersion = await Updater.localInfo.version();
          return { updateAvailable: false, currentVersion };
        }
      },
      downloadUpdate: async () => {
        // TODO: Implement when Electrobun Updater API is available
        return { success: false };
      },
      installUpdate: async () => {
        // TODO: Implement when Electrobun Updater API is available
        return { success: false };
      },
      openInApp: externalHandlers.openInApp,
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
      voiceTranscribe: voiceHandlers.voiceTranscribe,
      voiceIsAvailable: voiceHandlers.voiceIsAvailable,
      voiceSetOpenAIKey: voiceHandlers.voiceSetOpenAIKey,
      voiceHasOpenAIKey: voiceHandlers.voiceHasOpenAIKey,
      chatStart: chatStreamHandlers.chatStart,
      chatStop: chatStreamHandlers.chatStop,
      chatRespondToolApproval: chatStreamHandlers.chatRespondToolApproval,
      chatRespondUserQuestion: chatStreamHandlers.chatRespondUserQuestion,
      // Claude Code authentication handlers
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
    },
    messages: {
      "*": (name, payload) => {
        console.log(`[webview] ${name}`, payload);
      },
    },
  },
});

mainWindow = new BrowserWindow({
  title: "1Code Learn TS",
  url: "views://mainview/index.html",
  frame: { width: 1280, height: 820, x: 120, y: 80 },
  titleBarStyle: "hiddenInset",
  rpc,
});

mainWindow.webview?.on("dom-ready", () => {
  sendToWebview = mainWindow?.webview?.rpc as { send: WebviewMessageSender } | null ?? null;
});

mainWindow.on("close", () => {
  destroyAll();
});
