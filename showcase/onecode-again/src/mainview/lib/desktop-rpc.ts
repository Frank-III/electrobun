/**
 * Desktop (Electrobun) RPC client.
 * Wraps getRpc() with a tRPC-like nested API so call sites can use
 * desktopRpc.projects.list.query(), desktopRpc.chats.create.mutate(...), etc.
 * Use with @tanstack/solid-query for caching; no tRPC dependency.
 */
import { getRpc } from "./rpc";
import type { AgentModel, WorktreeConfig } from "../../shared/rpc-schema";

function rpc() {
  return getRpc();
}

/** Query: () => promise. Mutation: { mutate: (input) => promise }. */
function query<T>(fn: () => Promise<T>) {
  return { query: fn, mutate: fn };
}
function mutation<TInput, TOutput>(fn: (input: TInput) => Promise<TOutput>) {
  return {
    mutate: fn,
    mutateAsync: fn,
    query: fn as (input: TInput) => Promise<TOutput>,
  };
}

export const desktopRpc = {
  projects: {
    list: query(() => rpc().projectsList({})),
    get: (input: { id: string }) => rpc().projectsGet(input),
    openFolder: mutation(() => rpc().projectsOpenFolder({})),
    cloneFromGitHub: mutation((input: { repoUrl: string }) =>
      rpc().projectsCloneFromGitHub(input),
    ),
    delete: mutation((input: { id: string }) => rpc().projectsDelete(input)),
    locateAndAddProject: mutation(
      (input: { expectedOwner: string; expectedRepo: string }) =>
        rpc().projectsLocateAndAdd(input),
    ),
    pickCloneDestination: mutation((input: { suggestedName: string }) =>
      rpc().projectsPickCloneDestination(input),
    ),
    create: mutation((input: { path: string; name?: string }) =>
      rpc().projectsCreate(input),
    ),
    rename: mutation((input: { id: string; name: string }) =>
      rpc().projectsRename(input),
    ),
    refreshGitInfo: mutation((input: { id: string }) =>
      rpc().projectsRefreshGitInfo(input),
    ),
    getLaunchDirectory: () => rpc().projectsGetLaunchDirectory({}),
  },
  chats: {
    list: query((input?: { projectId?: string }) =>
      rpc().chatsList(input ?? {}),
    ),
    listArchived: query((input?: { projectId?: string }) =>
      rpc().chatsListArchived(input ?? {}),
    ),
    get: (input: { id: string }) => rpc().chatsGet(input),
    create: mutation(
      (input: Parameters<ReturnType<typeof getRpc>["chatsCreate"]>[0]) =>
        rpc().chatsCreate(input),
    ),
    rename: mutation(
      (input: { id: string; name: string }) => rpc().chatsRename(input),
    ),
    archive: mutation(
      (input: { id: string; deleteWorktree?: boolean }) =>
        rpc().chatsArchive(input),
    ),
    archiveBatch: mutation((input: { chatIds: string[] }) =>
      rpc().chatsArchiveBatch(input),
    ),
    restore: mutation((input: { id: string }) => rpc().chatsRestore(input)),
    getSubChat: (input: { id: string }) => rpc().chatsGetSubChat(input),
    createSubChat: mutation(
      (input: { chatId: string; name?: string; mode?: "plan" | "agent" }) =>
        rpc().chatsCreateSubChat(input),
    ),
    renameSubChat: mutation(
      (input: { id: string; name: string }) => rpc().chatsRenameSubChat(input),
    ),
    updateSubChatMode: mutation(
      (input: { id: string; mode: "plan" | "agent" }) =>
        rpc().chatsUpdateSubChatMode(input),
    ),
    generateSubChatName: mutation(
      (input: { userMessage: string; ollamaModel?: string }) =>
        rpc().chatsGenerateSubChatName(input),
    ),
    updateSubChatMessages: mutation(
      (input: { id: string; messages: string }) =>
        rpc().chatsUpdateSubChatMessages(input),
    ),
    rollbackToMessage: mutation(
      (input: { subChatId: string; sdkMessageUuid: string }) =>
        rpc().chatsRollbackToMessage(input),
    ),
    getPrStatus: (input: { chatId: string }) => rpc().chatsGetPrStatus(input),
    getPrContext: (input: { chatId: string }) => rpc().chatsGetPrContext(input),
    updatePrInfo: mutation(
      (input: { chatId: string; prUrl: string; prNumber: number }) =>
        rpc().chatsUpdatePrInfo(input),
    ),
    mergePr: mutation(
      (input: { chatId: string; method?: "merge" | "squash" | "rebase" }) =>
        rpc().chatsMergePr(input),
    ),
    getFileStats: (input: {
      openSubChatIds?: string[];
      chatIds?: string[];
    }) => rpc().chatsGetFileStats(input),
    getPendingPlanApprovals: (input: { openSubChatIds: string[] }) =>
      rpc().chatsGetPendingPlanApprovals(input),
    getDiff: (input: { chatId: string }) => rpc().chatsGetDiff(input),
    getParsedDiff: (input: { chatId: string }) =>
      rpc().chatsGetParsedDiff(input),
    generateCommitMessage: mutation(
      (input: {
        chatId: string;
        filePaths?: string[];
        ollamaModel?: string | null;
      }) => rpc().chatsGenerateCommitMessage(input),
    ),
    exportChat: (input: {
      chatId: string;
      subChatId?: string;
      format?: "json" | "markdown" | "text";
    }) => rpc().chatsExportChat(input),
    getWorktreeStatus: (input: { chatId: string }) =>
      rpc().chatsGetWorktreeStatus(input),
    delete: mutation((input: { id: string }) => rpc().chatsDelete(input)),
    deleteSubChat: mutation((input: { id: string }) => rpc().chatsDeleteSubChat(input)),
    updateSubChatSession: mutation(
      (input: { id: string; sessionId: string | null }) =>
        rpc().chatsUpdateSubChatSession(input),
    ),
    getChatStats: (input: { chatId: string; subChatId?: string }) =>
      rpc().chatsGetChatStats(input),
  },
  changes: {
    getStatus: (input: {
      worktreePath: string;
      defaultBranch?: string;
    }) => rpc().changesGetStatus(input),
    getBranches: (input: { worktreePath: string }) =>
      rpc().changesGetBranches(input),
    fetchRemote: mutation((input: { worktreePath: string }) =>
      rpc().changesFetchRemote(input),
    ),
    getCommitFiles: (input: {
      worktreePath: string;
      commitHash: string;
    }) => rpc().changesGetCommitFiles(input),
    getCommitFileDiff: (input: {
      worktreePath: string;
      commitHash: string;
      filePath: string;
    }) => rpc().changesGetCommitFileDiff(input),
    commit: mutation(
      (input: { worktreePath: string; message: string }) =>
        rpc().changesCommit(input),
    ),
    atomicCommit: mutation(
      (input: {
        worktreePath: string;
        filePaths: string[];
        message: string;
      }) => rpc().changesAtomicCommit(input),
    ),
    mergeFromDefault: mutation(
      (input: { worktreePath: string; useRebase?: boolean }) =>
        rpc().changesMergeFromDefault(input),
    ),
    deleteUntracked: mutation(
      (input: { worktreePath: string; filePath: string }) =>
        rpc().changesDeleteUntracked(input),
    ),
    discardChanges: mutation(
      (input: { worktreePath: string; filePath: string }) =>
        rpc().changesDiscardChanges(input),
    ),
    getHistory: (input: { worktreePath: string; limit?: number }) =>
      rpc().changesGetHistory(input),
    isWorktreeRegistered: (input: { worktreePath: string }) =>
      rpc().changesIsWorktreeRegistered(input),
    fetch: mutation((input: { worktreePath: string }) =>
      rpc().changesFetch(input),
    ),
    push: mutation(
      (input: { worktreePath: string; setUpstream?: boolean }) =>
        rpc().changesPush(input),
    ),
    pull: mutation(
      (input: { worktreePath: string; autoStash?: boolean }) =>
        rpc().changesPull(input),
    ),
    checkout: mutation(
      (input: { worktreePath: string; branch: string }) =>
        rpc().changesCheckout(input),
    ),
    forcePush: mutation((input: { worktreePath: string }) =>
      rpc().changesForcePush(input),
    ),
    createBranch: mutation(
      (input: {
        projectPath: string;
        branchName: string;
        baseBranch: string;
      }) => rpc().changesCreateBranch(input),
    ),
    discardMultipleChanges: mutation(
      (input: { worktreePath: string; filePaths: string[] }) =>
        rpc().changesDiscardMultipleChanges(input),
    ),
    deleteMultipleUntracked: mutation(
      (input: { worktreePath: string; filePaths: string[] }) =>
        rpc().changesDeleteMultipleUntracked(input),
    ),
    getGitHubStatus: (input: { worktreePath: string }) =>
      rpc().changesGetGitHubStatus(input),
    stageFile: mutation((input: { worktreePath: string; filePath: string }) =>
      rpc().changesStageFile(input),
    ),
    unstageFile: mutation((input: { worktreePath: string; filePath: string }) =>
      rpc().changesUnstageFile(input),
    ),
    stageAll: mutation((input: { worktreePath: string }) =>
      rpc().changesStageAll(input),
    ),
    unstageAll: mutation((input: { worktreePath: string }) =>
      rpc().changesUnstageAll(input),
    ),
    stageFiles: mutation((input: { worktreePath: string; filePaths: string[] }) =>
      rpc().changesStageFiles(input),
    ),
    unstageFiles: mutation((input: { worktreePath: string; filePaths: string[] }) =>
      rpc().changesUnstageFiles(input),
    ),
  },
  files: {
    readFile: (input: { filePath: string }) => rpc().filesRead(input),
    search: (input: {
      projectPath: string;
      query?: string;
      limit?: number;
    }) => rpc().filesSearch(input),
    writePastedText: mutation(
      (input: { subChatId: string; text: string; filename?: string }) =>
        rpc().filesWritePastedText(input),
    ),
  },
  ollama: {
    getStatus: () => rpc().ollamaGetStatus({}),
    isOfflineModeAvailable: () => rpc().ollamaIsOfflineModeAvailable({}),
    getModels: () => rpc().ollamaGetModels({}),
    generateChatName: (input: { userMessage: string; model?: string }) =>
      rpc().ollamaGenerateChatName(input),
    generateCommitMessage: (input: {
      diff: string;
      fileCount: number;
      additions: number;
      deletions: number;
      model?: string;
    }) => rpc().ollamaGenerateCommitMessage(input),
  },
  voice: {
    transcribe: mutation(
      (input: { audioBase64: string; format: string; language?: string }) =>
        rpc().voiceTranscribe(input),
    ),
    isAvailable: () => rpc().voiceIsAvailable({}),
    setOpenAIKey: mutation((input: { key: string }) =>
      rpc().voiceSetOpenAIKey(input),
    ),
    hasOpenAIKey: () => rpc().voiceHasOpenAIKey({}),
  },
  worktreeConfig: {
    get: (input: { projectId: string }) => rpc().worktreeConfigGet(input),
    save: mutation(
      (input: {
        projectId: string;
        config: WorktreeConfig;
        target?: string;
      }) => rpc().worktreeConfigSave(input),
    ),
    getAvailablePaths: (input: { projectId: string }) =>
      rpc().worktreeConfigGetAvailablePaths(input),
  },
  claudeSettings: {
    getIncludeCoAuthoredBy: () => rpc().claudeSettingsGetIncludeCoAuthoredBy({}),
    setIncludeCoAuthoredBy: mutation((input: { enabled: boolean }) =>
      rpc().claudeSettingsSetIncludeCoAuthoredBy(input),
    ),
  },
  external: {
    openInFinder: mutation((input: { path: string }) =>
      rpc().openInFinder(input),
    ),
    openFileInEditor: (input: { path: string; cwd?: string }) =>
      rpc().openFileInEditor(input),
    openExternal: mutation((input: { url: string }) =>
      rpc().openExternal(input),
    ),
  },
  // Open file/folder in external app (Cursor, VS Code, etc.)
  openInApp: mutation((input: { path: string; app: string }) =>
    rpc().openInApp(input),
  ),
  clipboardWrite: mutation((input: { text: string }) =>
    rpc().clipboardWrite(input),
  ),
  clipboardRead: () => rpc().clipboardRead({}),
  claudeCode: {
    hasExistingCliConfig: () => rpc().claudeCodeHasExistingCliConfig({}),
    getSystemToken: () => rpc().claudeCodeGetSystemToken({}),
    getIntegration: () => rpc().claudeCodeGetIntegration({}),
    startAuth: mutation(() => rpc().claudeCodeStartAuth({})),
    submitCode: mutation((input: { sandboxUrl: string; sessionId: string; code: string }) =>
      rpc().claudeCodeSubmitCode(input),
    ),
    openOAuthUrl: mutation((input: { url: string }) =>
      rpc().claudeCodeOpenOAuthUrl(input),
    ),
    pollStatus: (input: { sandboxUrl: string; sessionId: string }) =>
      rpc().claudeCodePollStatus(input),
    importSystemToken: mutation(() => rpc().claudeCodeImportSystemToken({})),
    disconnect: mutation(() => rpc().claudeCodeDisconnect({})),
    getToken: () => rpc().claudeCodeGetToken({}),
  },
  window: {
    minimize: mutation(() => rpc().windowMinimize({})),
    maximize: mutation(() => rpc().windowMaximize({})),
    close: mutation(() => rpc().windowClose({})),
    isMaximized: () => rpc().windowIsMaximized({}),
    toggleFullscreen: mutation(() => rpc().windowToggleFullscreen({})),
    isFullscreen: () => rpc().windowIsFullscreen({}),
    setTitle: mutation((input: { title: string }) => rpc().setWindowTitle(input)),
  },
  notifications: {
    show: mutation((input: { title: string; body: string }) => rpc().showNotification(input)),
    setBadge: mutation((input: { count: number | null }) => rpc().setBadge(input)),
  },
  system: {
    getVersion: () => rpc().getVersion({}),
    checkForUpdates: () => rpc().checkForUpdates({}),
    downloadUpdate: mutation(() => rpc().downloadUpdate({})),
    installUpdate: mutation(() => rpc().installUpdate({})),
    clipboardWrite: mutation((input: { text: string }) => rpc().clipboardWrite(input)),
    clipboardRead: () => rpc().clipboardRead({}),
  },
  terminal: {
    // Legacy tRPC used terminal.kill; Electrobun RPC uses destroy with { id }
    kill: mutation((input: { paneId: string }) =>
      rpc().destroy({ id: input.paneId }),
    ),
  },
  commands: {
    list: (input?: { projectPath?: string }) =>
      rpc().commandsList(input ?? {}),
    getContent: (input: { path: string }) =>
      rpc().commandsGetContent(input),
  },
  skills: {
    list: (input?: { cwd?: string }) => rpc().skillsList(input ?? {}),
    listEnabled: (input?: { cwd?: string }) =>
      rpc().skillsListEnabled(input ?? {}),
  },
  agents: {
    list: (input?: { cwd?: string }) => rpc().agentsList(input ?? {}),
    listEnabled: (input?: { cwd?: string }) =>
      rpc().agentsListEnabled(input ?? {}),
    get: (input: { name: string; cwd?: string }) => rpc().agentsGet(input),
    create: mutation(
      (input: {
        name: string;
        description: string;
        prompt: string;
        tools?: string[];
        disallowedTools?: string[];
        model?: AgentModel;
        source: "user" | "project";
        cwd?: string;
      }) => rpc().agentsCreate(input),
    ),
    update: mutation(
      (input: {
        originalName: string;
        name: string;
        description: string;
        prompt: string;
        tools?: string[];
        disallowedTools?: string[];
        model?: AgentModel;
        source: "user" | "project";
        cwd?: string;
      }) => rpc().agentsUpdate(input),
    ),
    delete: mutation(
      (input: { name: string; source: "user" | "project"; cwd?: string }) =>
        rpc().agentsDelete(input),
    ),
  },
  sandboxImport: {
    importSandboxChat: mutation(
      (input: {
        sandboxId: string;
        remoteChatId: string;
        remoteSubChatId?: string;
        projectId: string;
        chatName?: string;
      }) => rpc().sandboxImportImportSandboxChat(input),
    ),
    cloneFromSandbox: mutation(
      (input: {
        sandboxId: string;
        remoteChatId: string;
        remoteSubChatId?: string;
        chatName?: string;
        targetPath: string;
      }) => rpc().sandboxImportCloneFromSandbox(input),
    ),
  },
  debug: {
    getSystemInfo: () => rpc().debugGetSystemInfo({}),
    getDbStats: () => rpc().debugGetDbStats({}),
    getOfflineSimulation: () => rpc().debugGetOfflineSimulation({}),
    setOfflineSimulation: mutation((input: { enabled: boolean }) =>
      rpc().debugSetOfflineSimulation(input),
    ),
    clearChats: mutation(() => rpc().debugClearChats({})),
    clearAllData: mutation(() => rpc().debugClearAllData({})),
    openUserDataFolder: mutation(() => rpc().debugOpenUserDataFolder({})),
  },
  // Claude chat namespace (for tool approval and MCP config)
  claude: {
    respondToolApproval: mutation(
      (input: { toolUseId: string; approved: boolean; message?: string; updatedInput?: unknown }) =>
        rpc().chatRespondToolApproval(input),
    ),
    getMcpConfig: async (_input: { projectPath: string }) => {
      // TODO: Implement MCP config reading from ~/.claude.json or .mcp.json
      return { mcpServers: [] };
    },
    getAllMcpConfig: async () => {
      // TODO: Implement MCP config reading
      return { mcpServers: [] };
    },
    startMcpOAuth: mutation(async (_input: { serverId: string }) => {
      // TODO: Implement MCP OAuth flow
      throw new Error("MCP OAuth not yet implemented");
    }),
  },
  // Anthropic accounts management (multi-account support)
  anthropicAccounts: {
    list: async () => {
      // Get integration status to check if connected
      const integration = await rpc().claudeCodeGetIntegration({});
      if (!integration.isConnected) {
        return [];
      }
      // Return single account based on current integration
      return [{
        id: integration.accountId || "default",
        displayName: integration.displayName || "Anthropic Account",
        connectedAt: integration.connectedAt,
      }];
    },
    getActive: async () => {
      const integration = await rpc().claudeCodeGetIntegration({});
      if (!integration.isConnected) {
        return null;
      }
      return {
        id: integration.accountId || "default",
        displayName: integration.displayName || "Anthropic Account",
        connectedAt: integration.connectedAt,
      };
    },
    setActive: mutation(async (_input: { accountId: string }) => {
      // With single account, this is a no-op
      return { success: true };
    }),
    rename: mutation(async (_input: { accountId: string; displayName: string }) => {
      // TODO: Implement account renaming in database
      return { success: true };
    }),
    remove: mutation(async (_input: { accountId: string }) => {
      // Disconnect the account
      await rpc().claudeCodeDisconnect({});
      return { success: true };
    }),
    migrateLegacy: mutation(async () => {
      // Check for system token and import if available
      const systemToken = await rpc().claudeCodeGetSystemToken({});
      if (systemToken.token) {
        await rpc().claudeCodeImportSystemToken({});
      }
      return { success: true };
    }),
  },
  // Chat stream operations
  chat: {
    start: mutation(
      (input: Parameters<ReturnType<typeof getRpc>["chatStart"]>[0]) =>
        rpc().chatStart(input),
    ),
    stop: mutation(
      (input: { subChatId: string }) =>
        rpc().chatStop(input),
    ),
    respondToolApproval: mutation(
      (input: { toolUseId: string; approved: boolean; message?: string; updatedInput?: unknown }) =>
        rpc().chatRespondToolApproval(input),
    ),
    respondUserQuestion: mutation(
      (input: { questionId: string; response: string }) =>
        rpc().chatRespondUserQuestion(input),
    ),
  },
} as const;
