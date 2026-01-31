declare const __SOLID_COMPILER__: string;

// ============================================================================
// Electrobun RPC (window.rpc)
// ============================================================================
// Typed RPC client: window.rpc.request matches AppRPC bun requests (see shared/rpc-schema.ts)

import type { BunRequestClient } from "../shared/rpc-schema";

declare global {
  interface Window {
    desktopApi?: DesktopApi;
    /** Electrobun RPC: request client for bun procedures (typed via BunRequestClient). */
    rpc?: { request: BunRequestClient };
  }
}

// ============================================================================
// DesktopApi Type Declarations
// ============================================================================
// Types for window.desktopApi provided by Electrobun native layer

interface DesktopApiUser {
  id: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
}

interface DesktopApiUpdateInfo {
  version: string;
  releaseDate?: string;
  releaseNotes?: string;
}

interface DesktopApiUpdateProgress {
  percent: number;
  bytesPerSecond: number;
  transferred: number;
  total: number;
}

interface DesktopApiNotificationOptions {
  title: string;
  body: string;
  silent?: boolean;
  icon?: string;
}

interface DesktopApiFileChangeData {
  filePath: string;
  type: "add" | "change" | "unlink";
}

interface DesktopApiGitStatusData {
  worktreePath: string;
  changes: Array<{
    path: string;
    type: "add" | "change" | "unlink";
  }>;
}

interface DesktopApiStreamFetchResult {
  ok: boolean;
  status: number;
  statusText: string;
  error?: string;
}

interface DesktopApi {
  // Platform properties
  platform: "darwin" | "win32" | "linux";
  arch: string;

  // User & Authentication
  getUser(): Promise<DesktopApiUser | null>;
  updateUser(data: { name: string }): Promise<DesktopApiUser>;
  startAuthFlow(): void;
  onAuthSuccess(callback: (user: DesktopApiUser) => void): void;
  setAnalyticsOptOut(optOut: boolean): Promise<void>;

  // Version & Updates
  getVersion(): Promise<string>;
  isPackaged(): Promise<boolean>;
  checkForUpdates(force?: boolean): Promise<DesktopApiUpdateInfo | null>;
  downloadUpdate(): void;
  installUpdate(): void;
  onUpdateChecking(callback: () => void): (() => void) | undefined;
  onUpdateAvailable(callback: (info: DesktopApiUpdateInfo) => void): (() => void) | undefined;
  onUpdateNotAvailable(callback: () => void): (() => void) | undefined;
  onUpdateProgress(callback: (progress: DesktopApiUpdateProgress) => void): (() => void) | undefined;
  onUpdateDownloaded(callback: (info: DesktopApiUpdateInfo) => void): (() => void) | undefined;
  onUpdateError(callback: (error: string) => void): (() => void) | undefined;
  onUpdateManualCheck(callback: () => void): (() => void) | undefined;

  // Window Control
  windowMinimize(): Promise<void>;
  windowMaximize(): Promise<void>;
  windowClose(): Promise<void>;
  windowIsMaximized(): Promise<boolean>;
  windowIsFullscreen(): Promise<boolean>;
  getWindowFrameState(): Promise<boolean>;
  setTrafficLightVisibility(visible: boolean): void;
  onFullscreenChange(callback: (isFullscreen: boolean) => void): (() => void) | undefined;
  newWindow(options: { chatId: string }): void;

  // External Links & Dev Tools
  openExternal(url: string): void;
  toggleDevTools(): void;
  unlockDevTools(): void;

  // Notifications & Badge
  showNotification(options: DesktopApiNotificationOptions): void;
  setBadge(count: number | null): void;
  setBadgeIcon(image: string | null): void;
  onFocusChange(callback: (focused: boolean) => void): (() => void) | undefined;

  // API & Fetch
  getApiBaseUrl(): Promise<string>;
  signedFetch(url: string, options?: RequestInit): Promise<Response>;

  // File Watchers
  onFileChanged(callback: (data: DesktopApiFileChangeData) => void): (() => void) | undefined;
  subscribeToGitWatcher(path: string): Promise<void>;
  unsubscribeFromGitWatcher(path: string): Promise<void>;
  onGitStatusChanged(callback: (data: DesktopApiGitStatusData) => void): (() => void) | undefined;

  // VS Code Theme Scanning
  scanVSCodeThemes(): Promise<Array<{ name: string; id: string; path: string }>>;
  loadVSCodeTheme(path: string): Promise<unknown>;

  // Streaming Fetch (for remote chat transport)
  streamFetch(
    streamId: string,
    url: string,
    options: RequestInit
  ): Promise<DesktopApiStreamFetchResult>;
  onStreamChunk(streamId: string, callback: (bytes: Uint8Array) => void): () => void;
  onStreamDone(streamId: string, callback: () => void): () => void;
  onStreamError(streamId: string, callback: (error: string) => void): () => void;

  // Window Title
  setWindowTitle(title: string): void;

  // Authentication
  logout(): Promise<void>;

  // Clipboard
  clipboardWrite(text: string): Promise<void>;

  // Menu Shortcuts
  onShortcutNewAgent(callback: () => void): () => void;
}

