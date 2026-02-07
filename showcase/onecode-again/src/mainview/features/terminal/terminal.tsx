import { onCleanup, onMount, createEffect, createSignal } from "solid-js";
import { desktopRpc } from "@/lib/desktop-rpc";
import { useTerminalStore } from "./terminal-store-context";
import type { TerminalProps } from "./types";

type Frame = { x: number; y: number; width: number; height: number };

export function Terminal(props: TerminalProps) {
  let containerRef: HTMLDivElement | undefined;
  const [store, setStore] = useTerminalStore();
  const [terminalCwd, setTerminalCwd] = createSignal(props.initialCwd || props.cwd);
  const active = () => props.isActive ?? true;
  let isCreated = false;

  const toFrame = (rect: DOMRect): Frame => ({
    x: rect.left,
    y: rect.top,
    width: rect.width,
    height: rect.height,
  });

  const sendResize = (frame: Frame) => {
    desktopRpc.ghosttyTabs.resize.mutate({
      tabId: props.paneId,
      frame,
    });
  };

  const measureFrame = () => {
    if (!containerRef) return null;
    const rect = containerRef.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;
    return toFrame(rect);
  };

  onMount(() => {
    if (!containerRef) return;
    const resizeObserver = new ResizeObserver(() => {
      const nextFrame = measureFrame();
      if (!nextFrame) return;
      if (!isCreated) {
        desktopRpc.ghosttyTabs.create.mutate({
          tabId: props.paneId,
          frame: nextFrame,
          cwd: terminalCwd() || props.cwd,
        });
        isCreated = true;
        return;
      }
      sendResize(nextFrame);
    });
    resizeObserver.observe(containerRef);

    const initialFrame = measureFrame();
    if (initialFrame && !isCreated) {
      desktopRpc.ghosttyTabs.create.mutate({
        tabId: props.paneId,
        frame: initialFrame,
        cwd: terminalCwd() || props.cwd,
      });
      isCreated = true;
    }

    onCleanup(() => {
      resizeObserver.disconnect();
    });
  });

  createEffect(() => {
    if (active()) {
      desktopRpc.ghosttyTabs.focus.mutate({ tabId: props.paneId });
    }
  });

  createEffect(() => {
    setStore("cwdByPaneId", props.paneId, terminalCwd());
  });

  onCleanup(() => {
    if (isCreated) {
      desktopRpc.ghosttyTabs.close.mutate({ tabId: props.paneId });
    }
  });

  return (
    <div
      ref={el => (containerRef = el)}
      class="h-full w-full"
    />
  );
}
