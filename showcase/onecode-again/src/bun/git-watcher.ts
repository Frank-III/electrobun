import { EventEmitter } from "events";
import { join, sep } from "path";
import watcher from "@parcel/watcher";

export type FileChangeType = "add" | "change" | "unlink";

export interface FileChange {
  path: string;
  type: FileChangeType;
}

export interface GitWatchEvent {
  type: "batch";
  changes: FileChange[];
  timestamp: number;
  worktreePath: string;
}

interface GitWatcherConfig {
  worktreePath: string;
  debounceMs?: number;
}

function debounce<T extends (...args: any[]) => void>(fn: T, wait: number): T {
  let timeoutId: NodeJS.Timeout | null = null;
  return ((...args: any[]) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), wait);
  }) as T;
}

function normalizeType(type: string): FileChangeType {
  if (type === "create") return "add";
  if (type === "delete") return "unlink";
  return "change";
}

function isGitMeta(path: string, worktreePath: string): boolean {
  const gitIndex = join(worktreePath, ".git", "index");
  const gitHead = join(worktreePath, ".git", "HEAD");
  return path === gitIndex || path === gitHead || path.endsWith(`${sep}.git${sep}index`) || path.endsWith(`${sep}.git${sep}HEAD`);
}

export class GitWatcher extends EventEmitter {
  private worktreePath: string;
  private pendingChanges: Map<string, FileChangeType> = new Map();
  private isDisposed = false;
  private debounceMs: number;
  private subscription: { unsubscribe: () => Promise<void> } | null = null;
  private initPromise: Promise<void>;

  constructor(config: GitWatcherConfig) {
    super();
    this.worktreePath = config.worktreePath;
    this.debounceMs = config.debounceMs ?? 100;
    this.initPromise = this.initWatcher();
  }

  private async initWatcher(): Promise<void> {
    const flushChanges = debounce(() => {
      if (this.isDisposed || this.pendingChanges.size === 0) return;

      const changes: FileChange[] = Array.from(this.pendingChanges.entries()).map(([path, type]) => ({
        path,
        type,
      }));

      this.pendingChanges.clear();

      const event: GitWatchEvent = {
        type: "batch",
        changes,
        timestamp: Date.now(),
        worktreePath: this.worktreePath,
      };

      this.emit("change", event);
    }, this.debounceMs);

    this.subscription = await watcher.subscribe(
      this.worktreePath,
      (err, events) => {
        if (this.isDisposed) return;
        if (err) {
          console.error("[GitWatcher] Error:", err);
          this.emit("error", err);
          return;
        }

        for (const event of events) {
          if (!isGitMeta(event.path, this.worktreePath)) continue;
          this.pendingChanges.set(event.path, normalizeType(event.type));
        }

        if (this.pendingChanges.size > 0) {
          flushChanges();
        }
      },
      {
        ignore: (path) => !isGitMeta(path, this.worktreePath),
      },
    );

    console.log(`[GitWatcher] Watching: ${this.worktreePath}`);
  }

  async waitForReady(): Promise<void> {
    await this.initPromise;
  }

  getWorktreePath(): string {
    return this.worktreePath;
  }

  async dispose(): Promise<void> {
    if (this.isDisposed) return;
    this.isDisposed = true;

    await this.initPromise.catch(() => {});

    if (this.subscription) {
      await this.subscription.unsubscribe();
    }

    this.pendingChanges.clear();
    this.removeAllListeners();
    console.log(`[GitWatcher] Disposed: ${this.worktreePath}`);
  }
}

class GitWatcherRegistry {
  private watchers: Map<string, GitWatcher> = new Map();
  private listeners: Map<string, Set<(event: GitWatchEvent) => void>> = new Map();

  async getOrCreate(worktreePath: string): Promise<GitWatcher> {
    let watcherInstance = this.watchers.get(worktreePath);
    if (!watcherInstance) {
      watcherInstance = new GitWatcher({ worktreePath, debounceMs: 100 });
      this.watchers.set(worktreePath, watcherInstance);

      watcherInstance.on("change", (event: GitWatchEvent) => {
        const listeners = this.listeners.get(worktreePath);
        if (!listeners) return;
        for (const callback of Array.from(listeners)) {
          try {
            callback(event);
          } catch (error) {
            console.error("[GitWatcherRegistry] Listener error:", error);
          }
        }
      });

      await watcherInstance.waitForReady();
    }
    return watcherInstance;
  }

  async subscribe(worktreePath: string, callback: (event: GitWatchEvent) => void): Promise<() => void> {
    await this.getOrCreate(worktreePath);

    let listeners = this.listeners.get(worktreePath);
    if (!listeners) {
      listeners = new Set();
      this.listeners.set(worktreePath, listeners);
    }
    listeners.add(callback);

    return () => {
      listeners?.delete(callback);
    };
  }

  has(worktreePath: string): boolean {
    return this.watchers.has(worktreePath);
  }

  async dispose(worktreePath: string): Promise<void> {
    const watcherInstance = this.watchers.get(worktreePath);
    if (watcherInstance) {
      await watcherInstance.dispose();
      this.watchers.delete(worktreePath);
      this.listeners.delete(worktreePath);
    }
  }

  async disposeAll(): Promise<void> {
    const disposals = Array.from(this.watchers.values()).map((watcherInstance) => watcherInstance.dispose());
    await Promise.all(disposals);
    this.watchers.clear();
    this.listeners.clear();
  }
}

export const gitWatcherRegistry = new GitWatcherRegistry();
