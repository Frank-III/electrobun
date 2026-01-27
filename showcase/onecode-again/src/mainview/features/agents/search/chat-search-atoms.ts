import { createMemo, createSignal, type Accessor } from "solid-js"

// ============================================================================
// TYPES
// ============================================================================

export interface SearchMatch {
  id: string // unique match id: `${messageId}:${partIndex}:${offset}`
  messageId: string
  partIndex: number
  partType: string // "text" | "tool-Bash:stdout" | "tool-Read:content" | etc.
  offset: number // character offset within the text
  length: number // length of matched text
}

export interface HighlightRange {
  offset: number
  length: number
  isCurrent: boolean
  indexInPart: number // 0-based index of this match within the part (for DOM highlighting)
}

// ============================================================================
// SEARCH STATE ATOMS
// ============================================================================

// Search panel open state
export const chatSearchOpenAtom = createSignal<boolean>(false)

// Raw input value (updates immediately for responsive UI)
export const chatSearchInputAtom = createSignal<string>("")

// Debounced search query (for actual searching)
export const chatSearchQueryAtom = createSignal<string>("")

// All matches found
export const chatSearchMatchesAtom = createSignal<SearchMatch[]>([])

// Current match index (0-based)
export const chatSearchCurrentIndexAtom = createSignal<number>(0)

// ============================================================================
// DERIVED ATOMS
// ============================================================================

// Current match for scroll-to
export const chatSearchCurrentMatchAtom = createMemo(() => {
  const matches = chatSearchMatchesAtom[0]()
  const index = chatSearchCurrentIndexAtom[0]()
  return matches[index] ?? null
})

// Match count info for display
export const chatSearchCountInfoAtom = createMemo(() => {
  const matches = chatSearchMatchesAtom[0]()
  const index = chatSearchCurrentIndexAtom[0]()
  return {
    current: matches.length > 0 ? index + 1 : 0,
    total: matches.length,
  }
})

// ============================================================================
// HIGHLIGHT RANGES PER MESSAGE/PART
// ============================================================================

// Cache for highlight ranges by message and part
// Key format: `${messageId}:${partIndex}:${partType}`
const highlightRangesCache = new Map<string, HighlightRange[]>()

// Accessor factory for highlight ranges per message/part
const highlightRangesAccessors = new Map<string, Accessor<HighlightRange[]>>()

export const highlightRangesAtomFamily = (key: string) => {
  if (!highlightRangesAccessors.has(key)) {
    highlightRangesAccessors.set(
      key,
      createMemo(() => {
        const matches = chatSearchMatchesAtom[0]()
        const currentMatch = chatSearchCurrentMatchAtom()

        // Parse key
        const [messageId, partIndexStr, partType] = key.split(":")
        const partIndex = parseInt(partIndexStr, 10)

        // Filter matches for this message/part
        const relevantMatches = matches.filter(
          (m) =>
            m.messageId === messageId &&
            m.partIndex === partIndex &&
            m.partType === partType
        )

        if (relevantMatches.length === 0) {
          return []
        }

        // Convert to highlight ranges
        const ranges: HighlightRange[] = relevantMatches.map((m, idx) => ({
          offset: m.offset,
          length: m.length,
          isCurrent: currentMatch?.id === m.id,
          indexInPart: idx,
        }))

        // Check cache for stable reference
        const cached = highlightRangesCache.get(key)
        if (
          cached &&
          cached.length === ranges.length &&
          cached.every(
            (r, i) =>
              r.offset === ranges[i].offset &&
              r.length === ranges[i].length &&
              r.isCurrent === ranges[i].isCurrent
          )
        ) {
          return cached
        }

        highlightRangesCache.set(key, ranges)
        return ranges
      })
    )
  }

  return highlightRangesAccessors.get(key)!
}

// ============================================================================
// ACTIONS
// ============================================================================

// Navigate to next match
export function goToNextMatchAtom() {
  const matches = chatSearchMatchesAtom[0]()
  const currentIndex = chatSearchCurrentIndexAtom[0]()
  if (matches.length === 0) return
  const newIndex = (currentIndex + 1) % matches.length
  chatSearchCurrentIndexAtom[1](newIndex)
}

// Navigate to previous match
export function goToPrevMatchAtom() {
  const matches = chatSearchMatchesAtom[0]()
  const currentIndex = chatSearchCurrentIndexAtom[0]()
  if (matches.length === 0) return
  const newIndex = currentIndex === 0 ? matches.length - 1 : currentIndex - 1
  chatSearchCurrentIndexAtom[1](newIndex)
}

// Close search and clear state
export function closeSearchAtom() {
  chatSearchOpenAtom[1](false)
  chatSearchInputAtom[1]("")
  chatSearchQueryAtom[1]("")
  chatSearchMatchesAtom[1]([])
  chatSearchCurrentIndexAtom[1](0)
  highlightRangesCache.clear()
}

// Open search
export function openSearchAtom() {
  chatSearchOpenAtom[1](true)
}

/**
 * Toggle search - if already open, select all text instead of closing
 * This allows users to press Cmd+F again to quickly start a new search
 */
export function toggleSearchAtom() {
  const isOpen = chatSearchOpenAtom[0]()
  if (isOpen) {
    // Dispatch custom event to select all text in search input
    window.dispatchEvent(new CustomEvent("chat-search-select-all"))
  } else {
    openSearchAtom()
  }
}
