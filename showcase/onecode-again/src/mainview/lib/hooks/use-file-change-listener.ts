import { createEffect, onCleanup } from "solid-js"
import { useQueryClient } from "@tanstack/solid-query"

/**
 * Hook that listens for file changes from Claude Write/Edit tools
 * and invalidates the git status query to trigger a refetch
 */
export function useFileChangeListener(worktreePath: () => string | null | undefined) {
  const queryClient = useQueryClient()

  createEffect(() => {
    const path = worktreePath()
    if (!path) return

    const cleanup = window.desktopApi?.onFileChanged((data) => {
      // Check if the changed file is within our worktree
      if (data.filePath.startsWith(path)) {
        // Invalidate git status queries to trigger refetch
        queryClient.invalidateQueries({
          queryKey: [["changes", "getStatus"]],
        })
      }
    })

    onCleanup(() => {
      cleanup?.()
    })
  })
}

/**
 * Hook that subscribes to the GitWatcher for real-time file system monitoring.
 * Uses @parcel/watcher on the main process for efficient file watching.
 * Automatically invalidates git status queries when files change.
 */
export function useGitWatcher(worktreePath: () => string | null | undefined) {
  const queryClient = useQueryClient()
  let isSubscribedRef = false

  createEffect(() => {
    const path = worktreePath()
    if (!path) return

    // Subscribe to git watcher on main process
    const subscribe = async () => {
      try {
        await window.desktopApi?.subscribeToGitWatcher(path)
        isSubscribedRef = true
      } catch (error) {
        console.error("[useGitWatcher] Failed to subscribe:", error)
      }
    }

    subscribe()

    // Listen for git status changes from the watcher
    const cleanup = window.desktopApi?.onGitStatusChanged((data) => {
      if (data.worktreePath === path) {
        // Invalidate git status queries to trigger refetch
        queryClient.invalidateQueries({
          queryKey: [["changes", "getStatus"]],
        })

        // Also invalidate parsed diff if files were modified
        const hasModifiedFiles = data.changes.some(
          (change) => change.type === "change" || change.type === "add"
        )
        if (hasModifiedFiles) {
          queryClient.invalidateQueries({
            queryKey: [["changes", "getParsedDiff"]],
          })
        }
      }
    })

    onCleanup(() => {
      cleanup?.()

      // Unsubscribe from git watcher
      if (isSubscribedRef) {
        window.desktopApi?.unsubscribeFromGitWatcher(path).catch((error) => {
          console.error("[useGitWatcher] Failed to unsubscribe:", error)
        })
        isSubscribedRef = false
      }
    })
  })
}
