import type { JSX } from "solid-js";
import { createContext, useContext } from "solid-js";
import { createTerminalStore, type TerminalState, type SetTerminalStore } from "./terminal-store";

type TerminalStoreContextValue = [TerminalState, SetTerminalStore];

const TerminalStoreContext = createContext<TerminalStoreContextValue | undefined>(undefined);

let storeInstance: TerminalStoreContextValue | null = null;

export function TerminalStoreProvider(props: { children: JSX.Element }) {
  if (!storeInstance) {
    storeInstance = createTerminalStore();
  }
  return (
    <TerminalStoreContext.Provider value={storeInstance}>
      {props.children}
    </TerminalStoreContext.Provider>
  );
}

export function useTerminalStore(): TerminalStoreContextValue {
  const ctx = useContext(TerminalStoreContext);
  if (ctx === undefined) {
    throw new Error("useTerminalStore must be used within TerminalStoreProvider");
  }
  return ctx;
}
