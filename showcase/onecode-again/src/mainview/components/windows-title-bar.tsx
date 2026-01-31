import { createSignal, onCleanup, onMount } from "solid-js";
import { desktopRpc } from "../lib/desktop-rpc";

export function WindowsTitleBar() {
  const [isMaximized, setIsMaximized] = createSignal(false);
  const [hasFrame, setHasFrame] = createSignal(true);

  const isWindows = typeof window !== "undefined" && desktopRpc;

  onMount(async () => {
    if (!isWindows) return;

    try {
      const { isMaximized: maximized } = await desktopRpc.window.isMaximized();
      setIsMaximized(maximized);
    } catch {
      // Ignore errors
    }
  });

  const handleMinimize = async () => {
    await desktopRpc.window.minimize.mutate();
  };

  const handleMaximize = async () => {
    await desktopRpc.window.maximize.mutate();
    const { isMaximized: maximized } = await desktopRpc.window.isMaximized();
    setIsMaximized(maximized);
  };

  const handleClose = async () => {
    await desktopRpc.window.close.mutate();
  };

  return (
    <div class="windows-titlebar h-10 bg-[#1e1e1e] flex items-center justify-between select-none">
      <div class="flex-1 drag-region h-full flex items-center px-4">
        <span class="text-sm text-gray-400">1Code Learn TS</span>
      </div>
      <div class="flex">
        <button
          onClick={handleMinimize}
          class="w-[46px] h-10 flex items-center justify-center hover:bg-white/10 text-white/90 transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 12 12">
            <rect x="0" y="5" width="12" height="2" fill="currentColor" />
          </svg>
        </button>
        <button
          onClick={handleMaximize}
          class="w-[46px] h-10 flex items-center justify-center hover:bg-white/10 text-white/90 transition-colors"
        >
          {isMaximized() ? (
            <svg width="12" height="12" viewBox="0 0 12 12">
              <path
                d="M1.5 3.5v7h7v-7h-7zM3 2h7v7"
                stroke="currentColor"
                stroke-width="1.5"
                fill="none"
              />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 12 12">
              <rect
                x="1"
                y="1"
                width="10"
                height="10"
                stroke="currentColor"
                stroke-width="1.5"
                fill="none"
              />
            </svg>
          )}
        </button>
        <button
          onClick={handleClose}
          class="w-[46px] h-10 flex items-center justify-center hover:bg-red-500 text-white/90 transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 12 12">
            <path
              d="M1 1l10 10M11 1L1 11"
              stroke="currentColor"
              stroke-width="1.5"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
