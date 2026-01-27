import { createSignal } from "solid-js"

export const agentsSettingsDialogOpenAtom = createSignal(false)
export const agentsSettingsDialogActiveTabAtom = createSignal<string | null>(null)
