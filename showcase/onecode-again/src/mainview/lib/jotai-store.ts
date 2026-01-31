import { createStore } from "./state/store"

// Shared Jotai store - used by Provider and for reading atoms outside React
export const appStore = createStore()
