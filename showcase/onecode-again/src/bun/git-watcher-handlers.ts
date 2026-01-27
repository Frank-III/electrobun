import { gitWatcherRegistry, type GitWatchEvent } from "./git-watcher";

const activeSubscriptions = new Map<string, { unsubscribe: () => void }>();

export function createGitWatcherHandlers(sendStatusChanged: (event: GitWatchEvent) => void) {
  return {
    gitWatcherSubscribe: async ({ worktreePath }: { worktreePath: string }) => {
      if (!worktreePath) return { success: false as const };
      if (activeSubscriptions.has(worktreePath)) return { success: true as const };

      const unsubscribe = await gitWatcherRegistry.subscribe(worktreePath, (event) => {
        sendStatusChanged(event);
      });

      activeSubscriptions.set(worktreePath, { unsubscribe });
      return { success: true as const };
    },

    gitWatcherUnsubscribe: async ({ worktreePath }: { worktreePath: string }) => {
      const subscription = activeSubscriptions.get(worktreePath);
      if (subscription) {
        subscription.unsubscribe();
        activeSubscriptions.delete(worktreePath);
      }
      return { success: true as const };
    },

    gitWatcherDisposeAll: async () => {
      for (const subscription of activeSubscriptions.values()) {
        subscription.unsubscribe();
      }
      activeSubscriptions.clear();
      await gitWatcherRegistry.disposeAll();
      return { success: true as const };
    },
  };
}
