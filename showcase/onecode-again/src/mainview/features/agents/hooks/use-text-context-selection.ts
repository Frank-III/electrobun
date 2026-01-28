import { createSignal, type Accessor } from "solid-js"
import {
  type SelectedTextContext,
  type DiffTextContext,
  createTextPreview,
} from "../lib/queue-utils"

export interface UseTextContextSelectionReturn {
  textContexts: Accessor<SelectedTextContext[]>
  diffTextContexts: Accessor<DiffTextContext[]>
  addTextContext: (text: string, sourceMessageId: string) => void
  addDiffTextContext: (text: string, filePath: string, lineNumber?: number, lineType?: "old" | "new") => void
  removeTextContext: (id: string) => void
  removeDiffTextContext: (id: string) => void
  clearTextContexts: () => void
  clearDiffTextContexts: () => void
  // Ref for accessing current value in callbacks without re-renders
  textContextsRef: { current: SelectedTextContext[] }
  diffTextContextsRef: { current: DiffTextContext[] }
  // Direct state setter for restoring from draft
  setTextContextsFromDraft: (contexts: SelectedTextContext[]) => void
  setDiffTextContextsFromDraft: (contexts: DiffTextContext[]) => void
}

export function useTextContextSelection(): UseTextContextSelectionReturn {
  const [textContexts, setTextContexts] = createSignal<SelectedTextContext[]>([])
  const [diffTextContexts, setDiffTextContexts] = createSignal<DiffTextContext[]>([])
  const textContextsRef = { current: [] as SelectedTextContext[] }
  const diffTextContextsRef = { current: [] as DiffTextContext[] }

  // Keep refs in sync with state
  textContextsRef.current = textContexts()
  diffTextContextsRef.current = diffTextContexts()

  const addTextContext = (text: string, sourceMessageId: string) => {
    const trimmedText = text.trim()
    if (!trimmedText) return

    // Prevent duplicates - check if same text from same message already exists
    const isDuplicate = textContextsRef.current.some(
      (ctx) =>
        ctx.text === trimmedText && ctx.sourceMessageId === sourceMessageId
    )
    if (isDuplicate) return

    const newContext: SelectedTextContext = {
      id: `tc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      text: trimmedText,
      sourceMessageId,
      preview: createTextPreview(trimmedText),
      createdAt: new Date(),
    }

    setTextContexts((prev) => [...prev, newContext])
  }

  const addDiffTextContext = (text: string, filePath: string, lineNumber?: number, lineType?: "old" | "new") => {
    const trimmedText = text.trim()
    if (!trimmedText) return

    // Prevent duplicates
    const isDuplicate = diffTextContextsRef.current.some(
      (ctx) =>
        ctx.text === trimmedText && ctx.filePath === filePath
    )
    if (isDuplicate) return

    const newContext: DiffTextContext = {
      id: `dtc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      text: trimmedText,
      filePath,
      lineNumber,
      lineType,
      preview: createTextPreview(trimmedText),
      createdAt: new Date(),
    }

    setDiffTextContexts((prev) => [...prev, newContext])
  }

  const removeTextContext = (id: string) => {
    setTextContexts((prev) => prev.filter((ctx) => ctx.id !== id))
  }

  const removeDiffTextContext = (id: string) => {
    setDiffTextContexts((prev) => prev.filter((ctx) => ctx.id !== id))
  }

  const clearTextContexts = () => {
    setTextContexts([])
  }

  const clearDiffTextContexts = () => {
    setDiffTextContexts([])
  }

  // Direct state setter for restoring from draft
  const setTextContextsFromDraft = (contexts: SelectedTextContext[]) => {
    setTextContexts(contexts)
    textContextsRef.current = contexts
  }

  const setDiffTextContextsFromDraft = (contexts: DiffTextContext[]) => {
    setDiffTextContexts(contexts)
    diffTextContextsRef.current = contexts
  }

  return {
    textContexts,
    diffTextContexts,
    addTextContext,
    addDiffTextContext,
    removeTextContext,
    removeDiffTextContext,
    clearTextContexts,
    clearDiffTextContexts,
    textContextsRef,
    diffTextContextsRef,
    setTextContextsFromDraft,
    setDiffTextContextsFromDraft,
  }
}
