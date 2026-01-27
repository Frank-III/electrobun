import { BrowserView, BrowserWindow, Utils } from "electrobun/bun";
import type { AppRPC } from "../shared/rpc-schema";
import { createCommandsHandlers } from "./commands";
import { createExternalHandlers } from "./external";
import { createFileHandlers } from "./files";
import { createOllamaHandlers } from "./ollama";
import { createSkillsHandlers } from "./skills";
import { createTerminalHandlers, destroyAll } from "./terminal-manager";

let mainWindow: BrowserWindow | null = null;
let sendToWebview: BrowserView["rpc"] | null = null;

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
