import type { RPCSchema } from "electrobun/bun";
import type { ChangedFile, GitChangesStatus } from "./changes-types";
import type { TerminalMessages, TerminalRequests } from "./terminal-rpc";
import type { ChatMessages, ChatRequests } from "./chat-rpc";

export type FileEntryResult = {
  id: string;
  label: string;
  path: string;
  repository: string;
  type: "file" | "folder";
};

export type FileCommand = {
  name: string;
  description: string;
  argumentHint?: string;
  source: "user" | "project";
  path: string;
};

export type FileSkill = {
  name: string;
  description: string;
  source: "user" | "project";
  path: string;
};

export type OllamaStatus = {
  available: boolean;
  version?: string;
  models: string[];
  recommendedModel?: string;
};

export type NetworkStatus = {
  online: boolean;
  checked: number;
};

export type AgentModel = "sonnet" | "opus" | "haiku" | "inherit";

export type FileAgent = {
  name: string;
  description: string;
  prompt: string;
  tools?: string[];
  disallowedTools?: string[];
  model?: AgentModel;
  source: "user" | "project";
  path: string;
};

export type Project = {
  id: string;
  name: string;
  path: string;
  createdAt: Date | string | number | null;
  updatedAt: Date | string | number | null;
  gitRemoteUrl?: string | null;
  gitProvider?: "github" | "gitlab" | "bitbucket" | string | null;
  gitOwner?: string | null;
  gitRepo?: string | null;
};

export type Chat = {
  id: string;
  name: string | null;
  projectId: string;
  createdAt: Date | string | number | null;
  updatedAt: Date | string | number | null;
  archivedAt?: Date | string | number | null;
  worktreePath?: string | null;
  branch?: string | null;
  baseBranch?: string | null;
  prUrl?: string | null;
  prNumber?: number | null;
};

export type SubChat = {
  id: string;
  name: string | null;
  chatId: string;
  sessionId?: string | null;
  streamId?: string | null;
  mode: "plan" | "agent" | string;
  messages: string;
  createdAt: Date | string | number | null;
  updatedAt: Date | string | number | null;
};

export type ChatWithSubChats = Chat & {
  subChats: SubChat[];
  project: Project | null | undefined;
};

export type SystemInfo = {
  version: string;
  platform: string;
  arch: string;
  isDev: boolean;
  userDataPath: string;
  protocolRegistered: boolean;
};

export type WorktreeConfig = {
  "setup-worktree-unix"?: string[] | string;
  "setup-worktree-windows"?: string[] | string;
  "setup-worktree"?: string[] | string;
};

export type WorktreeConfigSource = "custom" | "cursor" | "1code" | null;

export type WorktreeConfigAvailablePaths = {
  cursor: { exists: boolean; path: string };
  onecode: { exists: boolean; path: string };
};

export type GhosttyTabFrame = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type WorktreeConfigResponse = {
  config: WorktreeConfig | null;
  path: string | null;
  source: WorktreeConfigSource;
  available: WorktreeConfigAvailablePaths;
  projectPath: string;
};

export type GitHubCheckItem = {
  name: string;
  status: "success" | "failure" | "pending" | "skipped" | "cancelled";
  url?: string;
};

export type GitHubStatus = {
  pr: {
    number: number;
    title: string;
    url: string;
    state: "open" | "draft" | "merged" | "closed";
    mergedAt?: number;
    additions: number;
    deletions: number;
    reviewDecision: "approved" | "changes_requested" | "pending";
    checksStatus: "success" | "failure" | "pending" | "none";
    checks: GitHubCheckItem[];
    mergeable?: "MERGEABLE" | "CONFLICTING" | "UNKNOWN";
  } | null;
  repoUrl: string;
  branchExistsOnRemote: boolean;
  lastRefreshed: number;
};

export interface AppRPC {
  bun: RPCSchema<{
    requests: TerminalRequests & {
      ping: { params: { label: string }; response: { ok: true; reply: string } };
      openExternal: { params: { url: string }; response: void };
      openInFinder: { params: { path: string }; response: { success: boolean } };
      openFileInEditor: {
        params: { path: string; cwd?: string };
        response: { success: boolean; editor: string };
      };
      openInApp: {
        params: { path: string; app: string };
        response: { success: boolean; app: string };
      };
      openFileDialog: {
        params: {
          directory?: boolean;
          multiple?: boolean;
        };
        response: { paths: string[] };
      };
      windowMinimize: { params: {}; response: void };
      windowMaximize: { params: {}; response: void };
      windowClose: { params: {}; response: void };
      windowIsMaximized: { params: {}; response: { isMaximized: boolean } };
      windowToggleFullscreen: { params: {}; response: void };
      windowIsFullscreen: { params: {}; response: { isFullscreen: boolean } };
      setWindowTitle: { params: { title: string }; response: void };
      showNotification: { params: { title: string; body: string }; response: void };
      setBadge: { params: { count: number | null }; response: void };
      getVersion: { params: {}; response: { version: string } };
      checkForUpdates: { params: {}; response: { updateAvailable: boolean; currentVersion: string; latestVersion?: string } };
      downloadUpdate: { params: {}; response: { success: boolean } };
      installUpdate: { params: {}; response: { success: boolean } };
      clipboardWrite: { params: { text: string }; response: void };
      clipboardRead: { params: {}; response: { text: string } };
      filesSearch: {
        params: { projectPath: string; query?: string; limit?: number };
        response: FileEntryResult[];
      };
      filesClearCache: { params: { projectPath: string }; response: { success: boolean } };
      filesRead: { params: { filePath: string }; response: string };
      filesWritePastedText: {
        params: { subChatId: string; text: string; filename?: string };
        response: { filePath: string; filename: string; size: number };
      };
      commandsList: { params?: { projectPath?: string }; response: FileCommand[] };
      commandsGetContent: { params: { path: string }; response: { content: string } };
      skillsList: { params?: { cwd?: string }; response: FileSkill[] };
      skillsListEnabled: { params?: { cwd?: string }; response: FileSkill[] };
      ollamaGetStatus: {
        params: {};
        response: { ollama: OllamaStatus; internet: NetworkStatus };
      };
      ollamaIsOfflineModeAvailable: {
        params: {};
        response: { available: boolean; model?: string };
      };
      ollamaGetModels: {
        params: {};
        response: { available: boolean; models: string[]; recommendedModel?: string };
      };
      ollamaGenerateChatName: {
        params: { userMessage: string; model?: string };
        response: { name: string | null };
      };
      ollamaGenerateCommitMessage: {
        params: { diff: string; fileCount: number; additions: number; deletions: number; model?: string };
        response: { message: string | null };
      };
      agentsList: { params?: { cwd?: string }; response: FileAgent[] };
      agentsListEnabled: { params?: { cwd?: string }; response: FileAgent[] };
      agentsGet: { params: { name: string; cwd?: string }; response: FileAgent | null };
      agentsCreate: {
        params: {
          name: string;
          description: string;
          prompt: string;
          tools?: string[];
          disallowedTools?: string[];
          model?: AgentModel;
          source: "user" | "project";
          cwd?: string;
        };
        response: { name: string; path: string; source: "user" | "project" };
      };
      agentsUpdate: {
        params: {
          originalName: string;
          name: string;
          description: string;
          prompt: string;
          tools?: string[];
          disallowedTools?: string[];
          model?: AgentModel;
          source: "user" | "project";
          cwd?: string;
        };
        response: { name: string; path: string; source: "user" | "project" };
      };
      agentsDelete: {
        params: { name: string; source: "user" | "project"; cwd?: string };
        response: { deleted: boolean };
      };
      claudeSettingsGetIncludeCoAuthoredBy: { params: {}; response: boolean };
      claudeSettingsSetIncludeCoAuthoredBy: { params: { enabled: boolean }; response: { success: boolean } };
      projectsGetLaunchDirectory: { params: {}; response: string | null };
      projectsList: { params: {}; response: Project[] };
      projectsGet: { params: { id: string }; response: Project | null | undefined };
      projectsOpenFolder: { params: {}; response: Project | null };
      projectsCreate: { params: { path: string; name?: string }; response: Project };
      projectsRename: { params: { id: string; name: string }; response: Project | undefined };
      projectsDelete: { params: { id: string }; response: Project | undefined };
      projectsRefreshGitInfo: { params: { id: string }; response: Project | null | undefined };
      projectsCloneFromGitHub: { params: { repoUrl: string }; response: Project };
      projectsLocateAndAdd: {
        params: { expectedOwner: string; expectedRepo: string };
        response:
          | { success: boolean; project: Project }
          | { success: false; reason: "canceled" }
          | { success: false; reason: "wrong-repo"; found: string };
      };
      projectsPickCloneDestination: {
        params: { suggestedName: string };
        response:
          | { success: boolean; targetPath: string }
          | { success: false; reason: "canceled" };
      };
      sandboxImportImportSandboxChat: {
        params: {
          sandboxId: string;
          remoteChatId: string;
          remoteSubChatId?: string;
          projectId: string;
          chatName?: string;
        };
        response: {
          success: boolean;
          chatId: string;
          worktreePath: string;
          gitImportSuccess: boolean;
          gitImportError?: string;
        };
      };
      sandboxImportCloneFromSandbox: {
        params: {
          sandboxId: string;
          remoteChatId: string;
          remoteSubChatId?: string;
          chatName?: string;
          targetPath: string;
        };
        response: {
          success: boolean;
          projectId: string;
          chatId: string;
          gitImportSuccess: boolean;
          gitImportError?: string;
        };
      };
      debugGetSystemInfo: { params: {}; response: SystemInfo };
      debugGetDbStats: { params: {}; response: { projects: number; chats: number; subChats: number } };
      debugClearChats: { params: {}; response: { success: boolean } };
      debugClearAllData: { params: {}; response: { success: boolean } };

      debugOpenUserDataFolder: { params: {}; response: { success: boolean } };
      debugGetOfflineSimulation: { params: {}; response: { enabled: boolean } };
      debugSetOfflineSimulation: { params: { enabled: boolean }; response: { success: boolean; enabled: boolean } };
      worktreeConfigGet: { params: { projectId: string }; response: WorktreeConfigResponse };
      worktreeConfigSave: {
        params: { projectId: string; config: WorktreeConfig; target?: string };
        response: { success: boolean; path: string; error?: string };
      };
      worktreeConfigGetAvailablePaths: { params: { projectId: string }; response: WorktreeConfigAvailablePaths };
      chatsList: { params: { projectId?: string }; response: Chat[] };
      chatsListArchived: { params: { projectId?: string }; response: Chat[] };
      chatsGet: { params: { id: string }; response: ChatWithSubChats | null };
      chatsCreate: {
        params: {
          projectId: string;
          name?: string;
          initialMessage?: string;
          initialMessageParts?: Array<
            | { type: "text"; text: string }
            | {
                type: "data-image";
                data: { url: string; mediaType?: string; filename?: string; base64Data?: string };
              }
            | { type: "file-content"; filePath: string; content: string }
          >;
          mode?: "plan" | "agent";
          useWorktree?: boolean;
          baseBranch?: string;
          branchType?: "local" | "remote";
        };
        response: Chat & { subChats: SubChat[] };
      };
      chatsRename: { params: { id: string; name: string }; response: Chat | undefined };
      chatsArchive: { params: { id: string; deleteWorktree?: boolean }; response: Chat | undefined };
      chatsArchiveBatch: { params: { chatIds: string[] }; response: Chat[] };
      chatsRestore: { params: { id: string }; response: Chat | undefined };
      chatsDelete: { params: { id: string }; response: Chat | undefined };
      chatsGetSubChat: {
        params: { id: string };
        response: (SubChat & { chat: (Chat & { project: Project | null | undefined }) | null | undefined }) | null | undefined;
      };
      chatsCreateSubChat: { params: { chatId: string; name?: string; mode?: "plan" | "agent" }; response: SubChat };
      chatsUpdateSubChatMessages: { params: { id: string; messages: string }; response: SubChat | undefined };
      chatsRollbackToMessage: {
        params: { subChatId: string; sdkMessageUuid: string };
        response: { success: boolean; error?: string; messages?: any[] };
      };
      chatsUpdateSubChatSession: { params: { id: string; sessionId: string | null }; response: SubChat | undefined };
      chatsUpdateSubChatMode: { params: { id: string; mode: "plan" | "agent" }; response: SubChat | undefined };
      chatsRenameSubChat: { params: { id: string; name: string }; response: SubChat | undefined };
      chatsDeleteSubChat: { params: { id: string }; response: SubChat | undefined };
      chatsGenerateSubChatName: { params: { userMessage: string; ollamaModel?: string }; response: { name: string } };
      chatsGenerateCommitMessage: {
        params: { chatId: string; filePaths?: string[]; ollamaModel?: string | null };
        response: { message: string | null };
      };
      chatsGetDiff: { params: { chatId: string }; response: { diff: string | null; error?: string } };
      chatsGetParsedDiff: {
        params: { chatId: string };
        response: {
          files: unknown[];
          totalAdditions: number;
          totalDeletions: number;
          fileContents: Record<string, string>;
          error?: string;
        };
      };
      chatsGetPrContext: { params: { chatId: string }; response: { branch: string; baseBranch: string; uncommittedCount: number; hasUpstream: boolean } | null };
      chatsUpdatePrInfo: { params: { chatId: string; prUrl: string; prNumber: number }; response: Chat };
      chatsGetPrStatus: { params: { chatId: string }; response: unknown };
      chatsMergePr: { params: { chatId: string; method?: "merge" | "squash" | "rebase" }; response: { success: boolean; error?: string } };
      chatsGetFileStats: {
        params: { openSubChatIds?: string[]; chatIds?: string[] };
        response: Array<{ chatId: string; additions: number; deletions: number; fileCount: number }>;
      };
      chatsGetPendingPlanApprovals: { params: { openSubChatIds: string[] }; response: Array<{ subChatId: string; chatId: string }> };
      chatsGetWorktreeStatus: { params: { chatId: string }; response: { hasWorktree: boolean; uncommittedCount: number } };
      chatsExportChat: {
        params: { chatId: string; subChatId?: string; format?: "json" | "markdown" | "text" };
        response: { format: "json" | "markdown" | "text"; content: string; filename: string };
      };
      chatsGetChatStats: {
        params: { chatId: string; subChatId?: string };
        response: {
          messageCount: number;
          userMessageCount: number;
          assistantMessageCount: number;
          toolCalls: number;
          toolUsage: Record<string, number>;
          totalInputTokens: number;
          totalOutputTokens: number;
          subChatCount: number;
        };
      };
      changesGetStatus: { params: { worktreePath: string; defaultBranch?: string }; response: GitChangesStatus };
      changesGetBranches: {
        params: { worktreePath: string };
        response: {
          current: string;
          local: Array<{ branch: string; lastCommitDate: number }>;
          remote: string[];
          defaultBranch: string;
          checkedOutBranches: Record<string, string>;
        };
      };
      changesFetch: { params: { worktreePath: string }; response: { success: boolean } };
      changesFetchRemote: { params: { worktreePath: string }; response: { success: boolean } };
      changesCheckout: { params: { worktreePath: string; branch: string }; response: { success: boolean } };
      changesGetHistory: {
        params: { worktreePath: string; limit?: number };
        response: Array<{
          hash: string;
          shortHash: string;
          message: string;
          author: string;
          email: string;
          date: Date | string | number;
        }>;
      };
      changesCommit: { params: { worktreePath: string; message: string }; response: { success: boolean; hash: string } };
      changesAtomicCommit: {
        params: { worktreePath: string; filePaths: string[]; message: string };
        response: { success: boolean; hash: string };
      };
      changesPush: { params: { worktreePath: string; setUpstream?: boolean }; response: { success: boolean } };
      changesForcePush: { params: { worktreePath: string }; response: { success: boolean } };
      changesPull: { params: { worktreePath: string; autoStash?: boolean }; response: { success: boolean } };
      changesMergeFromDefault: { params: { worktreePath: string; useRebase?: boolean }; response: { success: boolean } };
      changesCreateBranch: {
        params: { projectPath: string; branchName: string; baseBranch: string };
        response: { success: boolean; branchName: string };
      };
      changesGetCommitFiles: {
        params: { worktreePath: string; commitHash: string };
        response: ChangedFile[];
      };
      changesGetCommitFileDiff: {
        params: { worktreePath: string; commitHash: string; filePath: string };
        response: string;
      };
      changesIsWorktreeRegistered: { params: { worktreePath: string }; response: boolean };
      changesGetGitHubStatus: { params: { worktreePath: string }; response: GitHubStatus | null };
      changesStageFile: { params: { worktreePath: string; filePath: string }; response: { success: boolean } };
      changesUnstageFile: { params: { worktreePath: string; filePath: string }; response: { success: boolean } };
      changesDiscardChanges: { params: { worktreePath: string; filePath: string }; response: { success: boolean } };
      changesStageAll: { params: { worktreePath: string }; response: { success: boolean } };
      changesUnstageAll: { params: { worktreePath: string }; response: { success: boolean } };
      changesStageFiles: { params: { worktreePath: string; filePaths: string[] }; response: { success: boolean } };
      changesUnstageFiles: { params: { worktreePath: string; filePaths: string[] }; response: { success: boolean } };
      changesDeleteUntracked: { params: { worktreePath: string; filePath: string }; response: { success: boolean } };
      changesDiscardMultipleChanges: { params: { worktreePath: string; filePaths: string[] }; response: { success: boolean } };
      changesDeleteMultipleUntracked: { params: { worktreePath: string; filePaths: string[] }; response: { success: boolean } };
      gitWatcherSubscribe: { params: { worktreePath: string }; response: { success: boolean } };
      gitWatcherUnsubscribe: { params: { worktreePath: string }; response: { success: boolean } };
      voiceTranscribe: {
        params: { audioBase64: string; format: string; language?: string };
        response: { text: string };
      };
      voiceIsAvailable: {
        params: {};
        response: { available: boolean; method: "local" | "backend" | null; reason?: string };
      };
      voiceSetOpenAIKey: { params: { key: string }; response: { success: boolean } };
      voiceHasOpenAIKey: { params: {}; response: { hasKey: boolean } };
      // Claude Code authentication handlers
      claudeCodeHasExistingCliConfig: {
        params: {};
        response: { hasConfig: boolean; hasApiKey: boolean; baseUrl: string | null };
      };
      claudeCodeGetIntegration: {
        params: {};
        response: {
          isConnected: boolean;
          connectedAt: string | null;
          accountId: string | null;
          displayName: string | null;
        };
      };
      claudeCodeStartAuth: {
        params: {};
        response: {
          sandboxId: string;
          sandboxUrl: string;
          sessionId: string;
          hasExistingToken?: boolean;
        };
      };
      claudeCodePollStatus: {
        params: { sandboxUrl: string; sessionId: string };
        response: {
          state: "has_token" | "waiting" | "error";
          oauthUrl: string | null;
          error: string | null;
        };
      };
      claudeCodeSubmitCode: {
        params: { sandboxUrl: string; sessionId: string; code: string };
        response: { success: boolean };
      };
      claudeCodeGetSystemToken: {
        params: {};
        response: { token: string | null };
      };
      claudeCodeImportSystemToken: {
        params: {};
        response: { success: boolean };
      };
      claudeCodeGetToken: {
        params: {};
        response: { token: string | null; error: string | null };
      };
      claudeCodeDisconnect: {
        params: {};
        response: { success: boolean };
      };
      claudeCodeOpenOAuthUrl: {
        params: { url: string };
        response: { success: boolean };
      };
    } & ChatRequests;
    messages: {};
  }>;
  webview: RPCSchema<{
    requests: {};
    messages: TerminalMessages & ChatMessages & {
      log: { level: "info" | "error"; message: string };
      gitStatusChanged: { worktreePath: string; changes: Array<{ path: string; type: "add" | "change" | "unlink" }> };
    };
  }>;
}

/** Schema of bun requests (params/response per key). */
export type BunRequestsSchema = AppRPC["bun"]["requests"];

/** Typed client: each request key is (params) => Promise<response>. */
export type BunRequestClient = {
  [K in keyof BunRequestsSchema]: BunRequestsSchema[K] extends {
    params: infer P;
    response: infer R;
  }
    ? (params: P) => Promise<R>
    : never;
};

/** Type for sending messages to webview */
export type WebviewMessageSender = {
  [K in keyof AppRPC["webview"]["messages"]]: (payload: AppRPC["webview"]["messages"][K]) => void;
};
