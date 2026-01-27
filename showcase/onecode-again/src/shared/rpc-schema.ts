import type { RPCSchema } from "electrobun/bun";
import type { ChangedFile, GitChangesStatus } from "./changes-types";
import type { TerminalMessages, TerminalRequests } from "./terminal-rpc";

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
  createdAt: Date | string | number;
  updatedAt: Date | string | number;
  gitRemoteUrl?: string | null;
  gitProvider?: "github" | "gitlab" | "bitbucket" | null;
  gitOwner?: string | null;
  gitRepo?: string | null;
};

export type Chat = {
  id: string;
  name: string | null;
  projectId: string;
  createdAt: Date | string | number;
  updatedAt: Date | string | number;
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
  mode: "plan" | "agent";
  messages: string;
  createdAt: Date | string | number;
  updatedAt: Date | string | number;
};

export type ChatWithSubChats = Chat & {
  subChats: SubChat[];
  project: Project | null;
};

export type AnthropicAccount = {
  id: string;
  email: string | null;
  displayName: string;
  connectedAt: string | null;
  lastUsedAt?: string | null;
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
      openInFinder: { params: { path: string }; response: { success: true } };
      openFileInEditor: {
        params: { path: string; cwd?: string };
        response: { success: true; editor: string };
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
      filesSearch: {
        params: { projectPath: string; query?: string; limit?: number };
        response: FileEntryResult[];
      };
      filesClearCache: { params: { projectPath: string }; response: { success: true } };
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
        response: { deleted: true };
      };
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
        response: { sandboxId: string; sandboxUrl: string; sessionId: string };
      };
      claudeCodePollStatus: {
        params: { sandboxUrl: string; sessionId: string };
        response: { state: string; oauthUrl: string | null; error: string | null };
      };
      claudeCodeSubmitCode: {
        params: { sandboxUrl: string; sessionId: string; code: string };
        response: { success: true };
      };
      claudeCodeGetSystemToken: { params: {}; response: { token: string | null } };
      claudeCodeImportSystemToken: { params: {}; response: { success: true } };
      claudeCodeGetToken: { params: {}; response: { token: string | null; error: string | null } };
      claudeCodeDisconnect: { params: {}; response: { success: true } };
      claudeCodeOpenOAuthUrl: { params: { url: string }; response: { success: true } };
      claudeGetMcpConfig: {
        params: { projectPath: string };
        response: {
          mcpServers: Array<{ name: string; status: string; config: Record<string, unknown> }>;
          projectPath: string;
          error?: string;
        };
      };
      claudeGetAllMcpConfig: {
        params: {};
        response: {
          groups: Array<{
            groupName: string;
            projectPath: string | null;
            mcpServers: Array<{
              name: string;
              status: string;
              tools: string[];
              needsAuth: boolean;
              config: Record<string, unknown>;
            }>;
          }>;
          error?: string;
        };
      };
      claudeStartMcpOAuth: {
        params: { serverName: string; projectPath: string };
        response: { success: boolean; error?: string };
      };
      claudeFetchMcpOAuthMetadata: {
        params: { serverName: string; projectPath: string };
        response: {
          metadata:
            | { authorization_endpoint: string; token_endpoint: string; registration_endpoint?: string }
            | null;
        };
      };
      claudeSettingsGetIncludeCoAuthoredBy: { params: {}; response: boolean };
      claudeSettingsSetIncludeCoAuthoredBy: { params: { enabled: boolean }; response: { success: true } };
      projectsGetLaunchDirectory: { params: {}; response: string | null };
      projectsList: { params: {}; response: Project[] };
      projectsGet: { params: { id: string }; response: Project | null };
      projectsOpenFolder: { params: {}; response: Project | null };
      projectsCreate: { params: { path: string; name?: string }; response: Project };
      projectsRename: { params: { id: string; name: string }; response: Project };
      projectsDelete: { params: { id: string }; response: Project };
      projectsRefreshGitInfo: { params: { id: string }; response: Project | null };
      projectsCloneFromGitHub: { params: { repoUrl: string }; response: Project };
      projectsLocateAndAdd: {
        params: { expectedOwner: string; expectedRepo: string };
        response:
          | { success: true; project: Project }
          | { success: false; reason: "canceled" }
          | { success: false; reason: "wrong-repo"; found: string };
      };
      projectsPickCloneDestination: {
        params: { suggestedName: string };
        response:
          | { success: true; targetPath: string }
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
          success: true;
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
          success: true;
          projectId: string;
          chatId: string;
          gitImportSuccess: boolean;
          gitImportError?: string;
        };
      };
      debugGetSystemInfo: { params: {}; response: SystemInfo };
      debugGetDbStats: { params: {}; response: { projects: number; chats: number; subChats: number } };
      debugClearChats: { params: {}; response: { success: true } };
      debugClearAllData: { params: {}; response: { success: true } };
      debugLogout: { params: {}; response: { success: true } };
      debugOpenUserDataFolder: { params: {}; response: { success: true } };
      debugGetOfflineSimulation: { params: {}; response: { enabled: boolean } };
      debugSetOfflineSimulation: { params: { enabled: boolean }; response: { success: true; enabled: boolean } };
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
      chatsRename: { params: { id: string; name: string }; response: Chat };
      chatsArchive: { params: { id: string; deleteWorktree?: boolean }; response: Chat };
      chatsArchiveBatch: { params: { chatIds: string[] }; response: Chat[] };
      chatsRestore: { params: { id: string }; response: Chat };
      chatsDelete: { params: { id: string }; response: Chat };
      chatsGetSubChat: {
        params: { id: string };
        response: (SubChat & { chat: (Chat & { project: Project | null }) | null }) | null;
      };
      chatsCreateSubChat: { params: { chatId: string; name?: string; mode?: "plan" | "agent" }; response: SubChat };
      chatsUpdateSubChatMessages: { params: { id: string; messages: string }; response: SubChat };
      chatsRollbackToMessage: {
        params: { subChatId: string; sdkMessageUuid: string };
        response: { success: boolean; error?: string; messages?: any[] };
      };
      chatsUpdateSubChatSession: { params: { id: string; sessionId: string | null }; response: SubChat };
      chatsUpdateSubChatMode: { params: { id: string; mode: "plan" | "agent" }; response: SubChat };
      chatsRenameSubChat: { params: { id: string; name: string }; response: SubChat };
      chatsDeleteSubChat: { params: { id: string }; response: SubChat };
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
      changesFetch: { params: { worktreePath: string }; response: { success: true } };
      changesFetchRemote: { params: { worktreePath: string }; response: { success: true } };
      changesCheckout: { params: { worktreePath: string; branch: string }; response: { success: true } };
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
      changesCommit: { params: { worktreePath: string; message: string }; response: { success: true; hash: string } };
      changesAtomicCommit: {
        params: { worktreePath: string; filePaths: string[]; message: string };
        response: { success: true; hash: string };
      };
      changesPush: { params: { worktreePath: string; setUpstream?: boolean }; response: { success: true } };
      changesForcePush: { params: { worktreePath: string }; response: { success: true } };
      changesPull: { params: { worktreePath: string; autoStash?: boolean }; response: { success: true } };
      changesMergeFromDefault: { params: { worktreePath: string; useRebase?: boolean }; response: { success: true } };
      changesCreateBranch: {
        params: { projectPath: string; branchName: string; baseBranch: string };
        response: { success: true; branchName: string };
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
      changesStageFile: { params: { worktreePath: string; filePath: string }; response: { success: true } };
      changesUnstageFile: { params: { worktreePath: string; filePath: string }; response: { success: true } };
      changesDiscardChanges: { params: { worktreePath: string; filePath: string }; response: { success: true } };
      changesStageAll: { params: { worktreePath: string }; response: { success: true } };
      changesUnstageAll: { params: { worktreePath: string }; response: { success: true } };
      changesStageFiles: { params: { worktreePath: string; filePaths: string[] }; response: { success: true } };
      changesUnstageFiles: { params: { worktreePath: string; filePaths: string[] }; response: { success: true } };
      changesDeleteUntracked: { params: { worktreePath: string; filePath: string }; response: { success: true } };
      changesDiscardMultipleChanges: { params: { worktreePath: string; filePaths: string[] }; response: { success: true } };
      changesDeleteMultipleUntracked: { params: { worktreePath: string; filePaths: string[] }; response: { success: true } };
      gitWatcherSubscribe: { params: { worktreePath: string }; response: { success: true } };
      gitWatcherUnsubscribe: { params: { worktreePath: string }; response: { success: true } };
      anthropicAccountsList: { params: {}; response: AnthropicAccount[] };
      anthropicAccountsGetActive: { params: {}; response: AnthropicAccount | null };
      anthropicAccountsGetActiveToken: { params: {}; response: { token: string | null; error: string | null } };
      anthropicAccountsSetActive: { params: { accountId: string }; response: { success: true } };
      anthropicAccountsAdd: {
        params: { oauthToken: string; email?: string; displayName?: string };
        response: { id: string; success: true };
      };
      anthropicAccountsRename: { params: { accountId: string; displayName: string }; response: { success: true } };
      anthropicAccountsRemove: { params: { accountId: string }; response: { success: true } };
      anthropicAccountsHasAccounts: { params: {}; response: { hasAccounts: boolean } };
      anthropicAccountsMigrateLegacy: {
        params: {};
        response:
          | { migrated: true; accountId: string }
          | { migrated: false; reason: "accounts_exist" | "no_legacy" };
      };
      voiceTranscribe: {
        params: { audioBase64: string; format: string; language?: string };
        response: { text: string };
      };
      voiceIsAvailable: {
        params: {};
        response: { available: boolean; method: "local" | "backend" | null; reason?: string };
      };
      voiceSetOpenAIKey: { params: { key: string }; response: { success: true } };
      voiceHasOpenAIKey: { params: {}; response: { hasKey: boolean } };
    };
    messages: {};
  }>;
  webview: RPCSchema<{
    requests: {};
    messages: TerminalMessages & {
      log: { level: "info" | "error"; message: string };
      gitStatusChanged: { worktreePath: string; changes: Array<{ path: string; type: "add" | "change" | "unlink" }> };
    };
  }>;
}
