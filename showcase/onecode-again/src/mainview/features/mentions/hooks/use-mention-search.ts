/**
 * useMentionSearch Hook
 *
 * SolidJS hook for searching mentions with debouncing, cancellation,
 * and stale-while-revalidate pattern to prevent UI flickering.
 *
 * Key features:
 * - Stale data shown while fetching new results (no flicker)
 * - No loading indicators (search feels instant/local)
 * - Proper abort controller handling
 * - No state updates after unmount
 */

import { createSignal, createEffect, createMemo, onCleanup } from "solid-js"
import { mentionSearchEngine } from "../search"
import type { MentionItem, AggregatedSearchResult } from "../types"

/**
 * Debounce delay before starting search
 * Matches agents-file-mention.tsx for consistency
 */
const DEFAULT_DEBOUNCE_MS = 200

export interface UseMentionSearchOptions {
  /**
   * Trigger character to search for
   * @default '@'
   */
  trigger?: string

  /**
   * Project path for file-based providers
   */
  projectPath?: string

  /**
   * Session ID for context
   */
  sessionId?: string

  /**
   * Debounce delay in milliseconds
   * @default 200
   */
  debounceMs?: number

  /**
   * Whether search is enabled
   * @default true
   */
  enabled?: boolean

  /**
   * Filter to specific provider IDs
   */
  providerIds?: string[]

  /**
   * Changed files for context (shown at top of results)
   */
  changedFiles?: Array<{
    path: string
    filePath?: string // Alternative field name for compatibility
    additions: number
    deletions: number
  }>

  /**
   * MCP tools for tools provider (from sessionInfoAtom)
   */
  mcpTools?: string[]

  /**
   * MCP servers for tools provider (from sessionInfoAtom)
   */
  mcpServers?: Array<{
    name: string
    status: "connected" | "connecting" | "disconnected" | "failed"
  }>
}

export interface UseMentionSearchResult {
  /**
   * Search results (items from all providers)
   * Uses stale data while fetching to prevent flicker
   */
  items: () => MentionItem[]

  /**
   * Error message if search failed
   */
  error: () => string | null

  /**
   * Whether more results are available
   */
  hasMore: () => boolean

  /**
   * Warnings from providers
   */
  warnings: () => string[]

  /**
   * Full aggregated result (current)
   */
  result: () => AggregatedSearchResult | null

  /**
   * Clear all results and reset state
   */
  clear: () => void
}

/**
 * Hook for searching mentions with stale-while-revalidate pattern
 *
 * @example
 * ```tsx
 * const { items } = useMentionSearch(() => query, {
 *   projectPath: '/path/to/project',
 *   trigger: '@',
 * })
 *
 * // Items always available (stale data shown during fetch)
 * return (
 *   <div>
 *     <For each={items()}>{item => <Item {...item} />}</For>
 *   </div>
 * )
 * ```
 */
export function useMentionSearch(
  query: () => string,
  options: UseMentionSearchOptions = {}
): UseMentionSearchResult {
  const {
    trigger = "@",
    projectPath,
    sessionId,
    debounceMs = DEFAULT_DEBOUNCE_MS,
    enabled = true,
    providerIds,
    changedFiles,
    mcpTools,
    mcpServers,
  } = options

  // Current result
  const [result, setResult] = createSignal<AggregatedSearchResult | null>(null)

  // Previous result for stale-while-revalidate
  const [previousResult, setPreviousResult] = createSignal<AggregatedSearchResult | null>(null)

  const [error, setError] = createSignal<string | null>(null)

  // Refs for cleanup and tracking
  let debounceTimeout: ReturnType<typeof setTimeout> | undefined
  let abortController: AbortController | undefined
  let mounted = true

  onCleanup(() => {
    mounted = false
    if (debounceTimeout) {
      clearTimeout(debounceTimeout)
    }
    if (abortController) {
      abortController.abort()
    }
  })

  // Clear all results
  const clear = () => {
    setResult(null)
    setPreviousResult(null)
    setError(null)

    // Clear timeouts
    if (debounceTimeout) {
      clearTimeout(debounceTimeout)
      debounceTimeout = undefined
    }
    if (abortController) {
      abortController.abort()
      abortController = undefined
    }
  }

  // Normalize changedFiles to use consistent field name, filter invalid entries
  const normalizedChangedFiles = createMemo(() => {
    if (!changedFiles) return undefined
    return changedFiles
      .filter((f) => f.filePath || f.path) // Filter out entries without path
      .map((f) => ({
        path: f.filePath || f.path,
        additions: f.additions,
        deletions: f.deletions,
      }))
  })

  // Perform search
  createEffect(() => {
    const currentQuery = query()

    // Clear previous debounce
    if (debounceTimeout) {
      clearTimeout(debounceTimeout)
      debounceTimeout = undefined
    }

    // Abort previous search
    if (abortController) {
      abortController.abort()
      abortController = undefined
    }

    // If disabled, clear and skip
    if (!enabled) {
      clear()
      return
    }

    // Save current result as previous
    const currentResult = result()
    if (currentResult) {
      setPreviousResult(currentResult)
    }

    // Debounce the search
    debounceTimeout = setTimeout(async () => {
      // Create abort controller for this search
      const controller = new AbortController()
      abortController = controller

      try {
        const searchResult = await mentionSearchEngine.search(
          trigger,
          currentQuery,
          {
            projectPath,
            sessionId,
            changedFiles: normalizedChangedFiles(),
            // Pass MCP context for tools provider
            ...(mcpTools && { mcpTools }),
            ...(mcpServers && { mcpServers }),
          } as any, // Extended context
          {
            providerIds,
          }
        )

        // Check if aborted or unmounted
        if (controller.signal.aborted || !mounted) return

        // Update state
        setResult(searchResult)
        setError(null)

        // Check for warnings when no results
        if (searchResult.items.length === 0 && searchResult.warnings.length > 0) {
          setError(searchResult.warnings[0] || null)
        }
      } catch (err) {
        // Ignore abort errors (expected when user types fast)
        if (err instanceof Error && err.name === "AbortError") return

        // Don't update state if unmounted
        if (!mounted) return

        console.error("[useMentionSearch] Error:", err)
        setError(err instanceof Error ? err.message : "Search failed")
        // Don't clear result on error - keep stale data visible
      }
    }, debounceMs)
  })

  // Return items: prefer current result, fall back to previous (stale)
  const items = createMemo(() => {
    return result()?.items ?? previousResult()?.items ?? []
  })

  return {
    items,
    error,
    hasMore: () => result()?.hasMore ?? previousResult()?.hasMore ?? false,
    warnings: () => result()?.warnings ?? [],
    result,
    clear,
  }
}

export default useMentionSearch
