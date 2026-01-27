import type { RPCSchema } from "electrobun/bun";

export type TerminalRequests = {
  create: {
    params: {
      id: string;
      cols: number;
      rows: number;
      cwd?: string;
      shell?: string;
      env?: Record<string, string>;
    };
    response: { pid: number; shell: string };
  };
  write: { params: { id: string; data: string }; response: void };
  resize: { params: { id: string; cols: number; rows: number }; response: void };
  destroy: { params: { id: string }; response: void };
  getDefaultShell: { params: {}; response: { shell: string; args: string[] } };
  clipboardWrite: { params: { text: string }; response: void };
  clipboardRead: { params: {}; response: { text: string } };
  getScreenContent: {
    params: { id: string; startRow?: number; endRow?: number };
    response: { lines: string[]; cursorX: number; cursorY: number };
  };
  searchScrollback: {
    params: { id: string; query: string };
    response: { matches: Array<{ row: number; col: number; text: string }> };
  };
  getCurrentCommand: {
    params: { id: string };
    response: { command: string; cwd: string } | null;
  };
};

export type TerminalMessages = {
  data: { id: string; data: string };
  exit: { id: string; exitCode: number; signal?: number };
  titleChanged: { id: string; title: string };
  bell: { id: string };
};

export interface TerminalRPC {
  bun: RPCSchema<{
    requests: TerminalRequests;
    messages: {};
  }>;
  webview: RPCSchema<{
    requests: {};
    messages: TerminalMessages;
  }>;
}
