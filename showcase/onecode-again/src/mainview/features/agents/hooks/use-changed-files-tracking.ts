import { useSetAtom } from "../../../lib/state/jotai"
import { createSignal, createEffect, createMemo } from "solid-js"
import { subChatFilesAtom, subChatToChatMapAtom, type SubChatFileChange } from "../atoms"
// import { REPO_ROOT_PATH } from "@/lib/codesandbox-constants"
const REPO_ROOT_PATH = "/workspace" // Desktop mock

interface MessagePart {
  type: string
  input?: {
    file_path?: string
    old_string?: string
    new_string?: string
    content?: string
  }
}

interface Message {
  role: string
  parts?: MessagePart[]
}

/**
 * Custom hook to track changed files from Edit/Write tool calls in a sub-chat
 * Extracts file paths and calculates diff stats from message history
 * Only recalculates after streaming ends (not during streaming)
 */
export function useChangedFilesTracking(
  messages: Message[],
  subChatId: string,
  isStreaming: boolean = false,
  chatId?: string,
) {
  const setSubChatFiles = useSetAtom(subChatFilesAtom)
  const setSubChatToChatMap = useSetAtom(subChatToChatMapAtom)

  // Helper to get display path (removes sandbox prefixes and worktree paths)
  const getDisplayPath = (filePath: string): string => {
    if (!filePath) return ""

    // Use constant from codesandbox-constants
    const prefixes = [`${REPO_ROOT_PATH}/`, "/project/sandbox/", "/project/"]

    for (const prefix of prefixes) {
      if (filePath.startsWith(prefix)) {
        return filePath.slice(prefix.length)
      }
    }

    // Handle worktree paths: /Users/.../.21st/worktrees/{chatId}/{subChatId}/relativePath
    // Extract everything after the subChatId directory
    const worktreeMatch = filePath.match(/\.21st\/worktrees\/[^/]+\/[^/]+\/(.+)$/)
    if (worktreeMatch) {
      return worktreeMatch[1]
    }

    // Heuristic: find common root directories
    if (filePath.startsWith("/")) {
      const parts = filePath.split("/")
      const rootIndicators = ["apps", "packages", "src", "lib", "components"]
      const rootIndex = parts.findIndex((p) => rootIndicators.includes(p))
      if (rootIndex > 0) {
        return parts.slice(rootIndex).join("/")
      }
    }

    return filePath
  }

  // Calculate diff stats from old_string and new_string
  // For Edit: old_string lines are deletions, new_string lines are additions
  // For Write: counts lines in new content as additions
  const calculateDiffStats = (
    oldStr: string,
    newStr: string,
  ): { additions: number; deletions: number } => {
    if (oldStr === newStr) return { additions: 0, deletions: 0 }

    const oldLines = oldStr ? oldStr.split("\n").length : 0
    const newLines = newStr ? newStr.split("\n").length : 0

    // Simple heuristic: if old is empty, it's a new file (Write)
    if (!oldStr) {
      return { additions: newLines, deletions: 0 }
    }

    // For edits: old lines are removed, new lines are added
    return {
      additions: newLines,
      deletions: oldLines,
    }
  }

  // State to hold the calculated changed files (only updated when streaming ends)
  const [changedFiles, setChangedFiles] = createSignal<SubChatFileChange[]>([])
  let wasStreaming = false
  let isInitialized = false

  // Check if a file path is a session/plan file that should be excluded
  const isSessionFile = (filePath: string): boolean => {
    // Exclude files in claude-sessions (plan files stored in app's local storage)
    if (filePath.includes("claude-sessions")) return true
    // Exclude files in Application Support directory
    if (filePath.includes("Application Support")) return true
    return false
  }

  // Calculate changed files from messages
  const calculateChangedFiles = (inputMessages: Message[] = messages) => {
    // Track file states: originalContent (first old_string) and currentContent (latest new_string)
    const fileStates = new Map<
      string,
      {
        originalContent: string | null // null means file didn't exist before
        currentContent: string
        displayPath: string
      }
    >()

    for (const msg of inputMessages) {
      if (msg.role !== "assistant") continue
      for (const part of msg.parts || []) {
        if (part.type === "tool-Edit" || part.type === "tool-Write") {
          const filePath = part.input?.file_path
          if (!filePath) continue

          // Skip session/plan files stored in local app storage
          if (isSessionFile(filePath)) continue

          const oldString = part.input?.old_string || ""
          const newString = part.input?.new_string || part.input?.content || ""

          const existing = fileStates.get(filePath)
          if (existing) {
            // Update current content only (preserve original)
            existing.currentContent = newString
          } else {
            // First time seeing this file - record original state
            fileStates.set(filePath, {
              // For Write (new file), original is null; for Edit, it's the old_string
              originalContent: part.type === "tool-Write" ? null : oldString,
              currentContent: newString,
              displayPath: getDisplayPath(filePath),
            })
          }
        }
      }
    }

    // Calculate NET diff from original to current state
    const result: SubChatFileChange[] = []
    fileStates.forEach((state, filePath) => {
      const originalContent = state.originalContent || ""

      // Skip if file returned to original state (net change = 0)
      if (originalContent === state.currentContent) {
        return
      }

      const stats = calculateDiffStats(originalContent, state.currentContent)
      result.push({
        filePath,
        displayPath: state.displayPath,
        additions: stats.additions,
        deletions: stats.deletions,
      })
    })

    return result
  }

  const recomputeChangedFiles = (overrideMessages?: Message[]) => {
    const newChangedFiles = calculateChangedFiles(
      overrideMessages ?? messages,
    )
    setChangedFiles(newChangedFiles)
    isInitialized = true
  }

  // Only recalculate when streaming ends (transition from true to false)
  // Also calculate on initial mount if not streaming
  createEffect(() => {
    // Detect streaming end: was streaming, now not streaming
    if (wasStreaming && !isStreaming) {
      const newChangedFiles = calculateChangedFiles()
      setChangedFiles(newChangedFiles)
      isInitialized = true
    }
    // Initialize on mount if we have messages and not streaming
    else if (!isInitialized && !isStreaming && messages.length > 0) {
      const newChangedFiles = calculateChangedFiles()
      setChangedFiles(newChangedFiles)
      isInitialized = true
    }

    wasStreaming = isStreaming
  })

  // Update atom when changed files change
  createEffect(() => {
    const files = changedFiles()
    setSubChatFiles((prev) => {
      const next = new Map(prev)
      next.set(subChatId, files)
      return next
    })
  })

  // Update subChatId -> chatId mapping for aggregation in workspace sidebar
  createEffect(() => {
    if (chatId) {
      setSubChatToChatMap((prev) => {
        const next = new Map(prev)
        next.set(subChatId, chatId)
        return next
      })
    }
  })

  return { changedFiles, recomputeChangedFiles }
}
