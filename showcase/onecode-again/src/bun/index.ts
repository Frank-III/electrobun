import { BrowserView, BrowserWindow, Utils } from "electrobun/bun";
import type { AppRPC } from "../shared/rpc-schema";
import { createAgentsHandlers } from "./agents";
import { createClaudeSettingsHandlers } from "./claude-settings";
import { parseLaunchDirectory } from "./cli";
import { createCommandsHandlers } from "./commands";
import { initDatabase } from "./db";
import { createDebugHandlers } from "./debug";
import { createExternalHandlers } from "./external";
import { createFileHandlers } from "./files";
import { createOllamaHandlers } from "./ollama";
import { createProjectsHandlers } from "./projects";
import { createSkillsHandlers } from "./skills";
import { createTerminalHandlers, destroyAll } from "./terminal-manager";
import { createWorktreeConfigHandlers } from "./worktree-config-handlers";

let mainWindow: BrowserWindow | null = null;
let sendToWebview: BrowserView["rpc"] | null = null;

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
const debugHandlers = createDebugHandlers();
const worktreeConfigHandlers = createWorktreeConfigHandlers();

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
  sendToWebview = mainWindow?.webview?.rpc ?? null;
});

mainWindow.on("close", () => {
  destroyAll();
});
