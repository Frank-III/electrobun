import type { RPCSchema } from "electrobun/bun";
import type { TerminalMessages, TerminalRequests } from "./terminal-rpc";

export type FileEntryResult = {
  id: string;
  label: string;
  path: string;
  repository: string;
  type: "file" | "folder";
};

export interface AppRPC {
  bun: RPCSchema<{
    requests: TerminalRequests & {
      ping: { params: { label: string }; response: { ok: true; reply: string } };
      openExternal: { params: { url: string }; response: void };
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
