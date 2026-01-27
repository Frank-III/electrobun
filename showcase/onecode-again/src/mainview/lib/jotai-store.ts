import { createStore } from "./state/jotai"

// Shared Jotai store - used by Provider and for reading atoms outside React
export const appStore = createStore()
