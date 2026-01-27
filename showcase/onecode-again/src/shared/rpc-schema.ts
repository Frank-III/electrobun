import type { RPCSchema } from "electrobun/bun";
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
    };
    messages: {};
  }>;
  webview: RPCSchema<{
    requests: {};
    messages: TerminalMessages & {
      log: { level: "info" | "error"; message: string };
    };
  }>;
}
