import { createSignal, createEffect, createMemo, onCleanup, type Accessor } from "solid-js";
import { Button } from "../../../components/ui/button";
import { RotateCw } from "lucide-solid";
import { ExternalLinkIcon, IconDoubleChevronRight, IconChatBubble } from "../../../components/ui/icons";
import { PreviewUrlInput } from "./preview-url-input";
import { previewPathAtomFamily, viewportModeAtomFamily, previewScaleAtomFamily, mobileDeviceAtomFamily } from "../atoms";
import { cn } from "../../../lib/utils";
import { ViewportToggle } from "./viewport-toggle";
import { ScaleControl } from "./scale-control";
import { DevicePresetsBar } from "./device-presets-bar";
import { ResizeHandle } from "./resize-handle";
import { MobileCopyLinkButton } from "./mobile-copy-link-button";
import { DEVICE_PRESETS, AGENTS_PREVIEW_CONSTANTS } from "../constants";
// import { getSandboxPreviewUrl } from "@/app/(alpha)/canvas/{components}/settings-tabs/repositories/preview-url"
const getSandboxPreviewUrl = (sandboxId: string, port: number, _type: string) => `https://${sandboxId}-${port}.csb.app`;
interface AgentPreviewProps {
	chatId: string;
	sandboxId: string;
	port: number;
	repository?: string;
	hideHeader?: boolean;
	onClose?: () => void;
	isMobile?: boolean;
}
export function AgentPreview({ chatId, sandboxId, port, repository, hideHeader = false, onClose, isMobile = false }: AgentPreviewProps) {
	const [isLoaded, setIsLoaded] = createSignal(false);
	const [reloadKey, setReloadKey] = createSignal(0);
	const [isRefreshing, setIsRefreshing] = createSignal(false);
	const [iframeRef, setIframeRef] = createSignal<HTMLIFrameElement | null>(null);
	const [frameRef, setFrameRef] = createSignal<HTMLDivElement | null>(null);
	const [resizeCleanupRef, setResizeCleanupRef] = createSignal<(() => void) | null>(null);
	// Persisted state from Jotai atoms (per chatId)
	const [persistedPath, setPersistedPath] = previewPathAtomFamily(chatId);
	const [viewportMode, setViewportMode] = viewportModeAtomFamily(chatId);
	const [scale, setScale] = previewScaleAtomFamily(chatId);
	const [device, setDevice] = mobileDeviceAtomFamily(chatId);
	// Local state for resizing
	const [isResizing, setIsResizing] = createSignal(false);
	const [maxWidth, setMaxWidth] = createSignal(AGENTS_PREVIEW_CONSTANTS.MAX_WIDTH);
	// Dual state architecture:
	// - loadedPath: Controls iframe src (stable, only changes on manual navigation)
	// - currentPath: Display path (updates immediately on internal navigation)
	const [loadedPath, setLoadedPath] = createSignal(persistedPath());
	const [currentPath, setCurrentPath] = createSignal(persistedPath());
	// Listen for reload events from external header
	createEffect(() => {
		const handleReload = (e: CustomEvent) => {
			if (e.detail?.chatId === chatId) {
				setReloadKey((prev) => prev + 1);
				setIsRefreshing(true);
				setTimeout(() => setIsRefreshing(false), 400);
			}
		};
		window.addEventListener("agent-preview-reload", handleReload as EventListener);
		onCleanup(() => window.removeEventListener("agent-preview-reload", handleReload as EventListener));
	});
	// Listen for navigation events from external header
	createEffect(() => {
		const handleNavigate = (e: CustomEvent) => {
			if (e.detail?.chatId === chatId && e.detail?.path) {
				setLoadedPath(e.detail.path);
				setCurrentPath(e.detail.path);
				setPersistedPath(e.detail.path);
				setIsLoaded(false);
			}
		};
		window.addEventListener("agent-preview-navigate", handleNavigate as EventListener);
		onCleanup(() => window.removeEventListener("agent-preview-navigate", handleNavigate as EventListener));
	});
	// Dispatch path updates to header
	createEffect(() => {
		window.dispatchEvent(new CustomEvent("agent-preview-path-update", { detail: {
			chatId,
			path: currentPath()
		} }));
	});
	// Sync loadedPath when persistedPath changes (e.g., on mount with stored value)
	createEffect(() => {
		setLoadedPath(persistedPath());
		setCurrentPath(persistedPath());
	});
	// Compute base host and preview URL
	const previewBaseUrl = createMemo(() => getSandboxPreviewUrl(sandboxId, port, "agents"));
	const baseHost = createMemo(() => {
		return new URL(previewBaseUrl()).host;
	});
	const previewUrl = createMemo(() => {
		return `${previewBaseUrl()}${loadedPath()}`;
	});
	// Handle path selection from URL bar
	const handlePathSelect = (path: string) => {
		setLoadedPath(path);
		setCurrentPath(path);
		setPersistedPath(path);
		setIsLoaded(false);
	};
	// Listen for SET_URL messages from iframe for bi-directional sync
	createEffect(() => {
		const handleMessage = (event: MessageEvent) => {
			// Verify source is our iframe
			if (!iframeRef() || event.source !== iframeRef()?.contentWindow) {
				return;
			}
			// Handle SET_URL messages from preview script
			if (event.data?.type === "SET_URL") {
				const newPath = event.data.url || "/";
				// Skip srcdoc paths (edge case from iframe)
				if (newPath.includes("srcdoc")) {
					return;
				}
				// Update ONLY currentPath for immediate display update
				// Do NOT update loadedPath - that would cause iframe remount
				setCurrentPath(newPath);
				setPersistedPath(newPath);
			}
		};
		window.addEventListener("message", handleMessage);
		onCleanup(() => window.removeEventListener("message", handleMessage));
	});
	// Calculate max width on mount and window resize
	createEffect(() => {
		const updateMaxWidth = () => {
			const availableWidth = window.innerWidth - 64;
			setMaxWidth(Math.max(AGENTS_PREVIEW_CONSTANTS.MIN_WIDTH, availableWidth));
		};
		updateMaxWidth();
		window.addEventListener("resize", updateMaxWidth);
		onCleanup(() => window.removeEventListener("resize", updateMaxWidth));
	});
	// Cleanup resize handlers on unmount
	onCleanup(() => {
		resizeCleanupRef()?.();
	});
	const handleReload = () => {
		if (isRefreshing()) return;
		setIsRefreshing(true);
		setIsLoaded(false);
		setReloadKey((prev) => prev + 1);
		setTimeout(() => setIsRefreshing(false), 400);
	};
	const handlePresetChange = (presetName: string) => {
		const preset = DEVICE_PRESETS.find((p) => p.name === presetName);
		if (preset) {
			setDevice({
				width: preset.width,
				height: preset.height,
				preset: preset.name
			});
		}
	};
	const handleWidthChange = (width: number) => {
		setDevice((prev) => ({
			...prev,
			width,
			preset: "Custom"
		}));
	};
	const handleResizeStart = (e: PointerEvent) => {
		e.preventDefault();
		e.stopPropagation();
		const handle = e.currentTarget as HTMLElement;
		const pointerId = e.pointerId;
		const isLeftHandle = handle.getAttribute("data-side") === "left";
		const startX = e.clientX;
		const startWidth = device().width;
		const frame = frameRef();
		if (!frame) return;
		handle.setPointerCapture(pointerId);
		setIsResizing(true);
		const handlePointerMove = (e: PointerEvent) => {
			let delta = e.clientX - startX;
			if (isLeftHandle) {
				delta = -delta;
			}
			const newWidth = Math.round(Math.max(AGENTS_PREVIEW_CONSTANTS.MIN_WIDTH, Math.min(maxWidth(), startWidth + delta * 2)));
			frame.style.width = `${newWidth}px`;
			setDevice((prev) => ({
				...prev,
				width: newWidth,
				preset: "Custom"
			}));
		};
		const handlePointerUp = () => {
			if (handle.hasPointerCapture(pointerId)) {
				handle.releasePointerCapture(pointerId);
			}
			setIsResizing(false);
			cleanup();
		};
		const handlePointerCancel = () => {
			if (handle.hasPointerCapture(pointerId)) {
				handle.releasePointerCapture(pointerId);
			}
			cleanup();
		};
		const cleanup = () => {
			handle.removeEventListener("pointermove", handlePointerMove as any);
			handle.removeEventListener("pointerup", handlePointerUp as any);
			handle.removeEventListener("pointercancel", handlePointerCancel as any);
			document.body.style.userSelect = "";
			document.body.style.cursor = "";
			setResizeCleanupRef(null);
		};
		document.body.style.userSelect = "none";
		document.body.style.cursor = "ew-resize";
		handle.addEventListener("pointermove", handlePointerMove as any);
		handle.addEventListener("pointerup", handlePointerUp as any);
		handle.addEventListener("pointercancel", handlePointerCancel as any);
		setResizeCleanupRef(() => cleanup);
	};

	const handleViewportChange = (mode: "desktop" | "mobile") => {
		setViewportMode(mode);
	};

	const handleScaleChange = (newScale: number) => {
		setScale(newScale);
	};

	return <div class={cn("flex flex-col bg-tl-background", isMobile ? "h-full w-full" : "h-full")}>
      {	/* Mobile Header */}
      {isMobile && !hideHeader && <div class="flex-shrink-0 bg-background/95 backdrop-blur border-b h-11 min-h-[44px] max-h-[44px]" data-mobile-preview-header style={{ "-webkit-app-region": "drag" }}>
          <div class="flex h-full items-center px-2 gap-2" style={{ "-webkit-app-region": "no-drag" }}>
            { /* Chat button */}
            <Button variant="ghost" size="icon" onClick={onClose} class="h-7 w-7 p-0 hover:bg-foreground/10 transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] flex-shrink-0 rounded-md">
              <IconChatBubble class="h-4 w-4" />
              <span class="sr-only">Back to chat</span>
            </Button>

            { /* Reload button */}
            <Button variant="ghost" size="icon" onClick={handleReload} disabled={isRefreshing()} class="h-7 w-7 p-0 hover:bg-foreground/10 transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] flex-shrink-0 rounded-md">
              <RotateCw class={cn("h-4 w-4", isRefreshing() && "animate-spin")} />
            </Button>

            { /* URL Input - centered, flexible */}
            <div class="flex-1 min-w-0 mx-1">
              <PreviewUrlInput baseHost={baseHost()} currentPath={currentPath()} onPathChange={handlePathSelect} isLoading={!isLoaded()} class="w-full" variant="mobile" />
            </div>

            { /* Scale control */}
            <ScaleControl value={scale()} onChange={handleScaleChange} />

            { /* Copy link button */}
            <MobileCopyLinkButton url={previewUrl()} />
          </div>
        </div>}

      { /* Desktop Header */}
      {!isMobile && !hideHeader && <div class="flex items-center justify-between px-3 h-10 bg-tl-background flex-shrink-0">
          { /* Left: Refresh + Viewport Toggle + Scale */}
          <div class="flex items-center gap-1 flex-1">
            <Button variant="ghost" onClick={handleReload} disabled={isRefreshing()} class="h-7 w-7 p-0 hover:bg-muted transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] rounded-md">
              <RotateCw class={cn("h-3.5 w-3.5 text-muted-foreground", isRefreshing() && "animate-spin")} />
            </Button>

            <ViewportToggle value={viewportMode()} onChange={handleViewportChange} />

            <ScaleControl value={scale()} onChange={handleScaleChange} />
          </div>

          { /* Center: URL bar */}
          <div class="flex-1 mx-2 min-w-0 flex items-center justify-center">
            <PreviewUrlInput baseHost={baseHost()} currentPath={currentPath()} onPathChange={handlePathSelect} isLoading={!isLoaded()} class="max-w-[350px] w-full" />
          </div>

          { /* Right: External link + Mode toggle + Close */}
          <div class="flex items-center justify-end gap-1 flex-1">
            <Button variant="ghost" class="h-7 w-7 p-0 hover:bg-muted transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] rounded-md" onClick={() => window.open(previewUrl(), "_blank")}>
              <ExternalLinkIcon class="h-3.5 w-3.5 text-muted-foreground" />
            </Button>

            {onClose && <Button variant="ghost" class="h-7 w-7 p-0 hover:bg-muted transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] rounded-md" onClick={onClose}>
                <IconDoubleChevronRight class="h-4 w-4 text-muted-foreground" />
              </Button>}
          </div>
        </div>}

      { /* Device presets bar - only visible in mobile viewport mode (not on actual mobile devices) */}
      {!isMobile && !hideHeader && viewportMode() === "mobile" && <DevicePresetsBar selectedPreset={device().preset} width={device().width} height={device().height} onPresetChange={handlePresetChange} onWidthChange={handleWidthChange} maxWidth={maxWidth()} />}

      { /* Content area */}
      <div class={cn("flex-1 relative flex items-center justify-center overflow-hidden", isMobile ? "w-full h-full" : "px-1 pb-1")}>
        {isMobile ? <div class="relative overflow-hidden w-full h-full flex-shrink-0 bg-background">
            <div class="w-full h-full" style={scale() !== 100 ? {
 width: `${100 / scale() * 100}%`,
				height: `${100 / scale() * 100}%`,
				transform: `scale(${scale() / 100})`,
				"transform-origin": "top left"
			} : undefined}>
              <iframe ref={(el) => setIframeRef(el)} src={previewUrl()} width="100%" height="100%" style={{ border: "none" }} title="Preview" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals" allow="clipboard-write" onLoad={() => setIsLoaded(true)} onError={() => setIsLoaded(true)} />
            </div>
            {	/* Loading overlay */}
            {!isLoaded() && <div class="absolute inset-0 flex items-center justify-center bg-background z-10">
                <div class="w-6 h-6 animate-pulse">
                  <svg width="100%" height="100%" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="21st logo">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M358.333 0C381.345 0 400 18.6548 400 41.6667V295.833C400 298.135 398.134 300 395.833 300H270.833C268.532 300 266.667 301.865 266.667 304.167V395.833C266.667 398.134 264.801 400 262.5 400H41.6667C18.6548 400 0 381.345 0 358.333V304.72C0 301.793 1.54269 299.081 4.05273 297.575L153.76 207.747C157.159 205.708 156.02 200.679 152.376 200.065L151.628 200H4.16667C1.86548 200 6.71103e-08 198.135 0 195.833V104.167C1.07376e-06 101.865 1.86548 100 4.16667 100H162.5C164.801 100 166.667 98.1345 166.667 95.8333V4.16667C166.667 1.86548 168.532 1.00666e-07 170.833 0H358.333ZM170.833 100C168.532 100 166.667 101.865 166.667 104.167V295.833C166.667 298.135 168.532 300 170.833 300H262.5C264.801 300 266.667 298.135 266.667 295.833V104.167C266.667 101.865 264.801 100 262.5 100H170.833Z" fill="currentColor" class="text-muted-foreground" />
                  </svg>
                </div>
              </div>}
          </div> : <>
            { /* Left resize handle - only in mobile viewport mode (not on actual mobile devices) */}
            {viewportMode() === "mobile" && <ResizeHandle side="left" onPointerDown={handleResizeStart} isResizing={isResizing()} />}

            { /* Frame with dynamic size */}
            <div ref={(el) => setFrameRef(el)} class={cn("relative overflow-hidden flex-shrink-0 bg-background", !isResizing() && "transition-[width,height,margin] duration-300 ease-in-out", viewportMode() === "desktop" ? "border-[0.5px] rounded-sm" : "shadow-lg border")} style={{
 width: viewportMode() === "desktop" ? "100%" : `${device().width}px`,
				height: "100%",
				"max-height": viewportMode() === "mobile" ? `${device().height}px` : "100%",
				"margin-left": viewportMode() === "mobile" ? "16px" : "0",
				"margin-right": viewportMode() === "mobile" ? "16px" : "0",
				"border-radius": viewportMode() === "desktop" ? "8px" : "24px"
			}}>
              {	/* Scale transform wrapper */}
              <div class="w-full h-full" style={scale() !== 100 ? {
 width: `${100 / scale() * 100}%`,
				height: `${100 / scale() * 100}%`,
				transform: `scale(${scale() / 100})`,
				"transform-origin": "top left"
			} : undefined}>
                <iframe ref={(el) => setIframeRef(el)} src={previewUrl()} width="100%" height="100%" style={{
				border: "none",
				"border-radius": viewportMode() === "desktop" ? "8px" : "24px"
			}} sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals" onLoad={() => setIsLoaded(true)} title="Preview" tabIndex={-1} />

                {	/* Loading overlay */}
                {!isLoaded() && <div class="absolute inset-0 flex items-center justify-center bg-background z-10 rounded-[inherit]">
                    <div class="w-6 h-6 animate-pulse">
                      <svg width="100%" height="100%" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="21st logo">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M358.333 0C381.345 0 400 18.6548 400 41.6667V295.833C400 298.135 398.134 300 395.833 300H270.833C268.532 300 266.667 301.865 266.667 304.167V395.833C266.667 398.134 264.801 400 262.5 400H41.6667C18.6548 400 0 381.345 0 358.333V304.72C0 301.793 1.54269 299.081 4.05273 297.575L153.76 207.747C157.159 205.708 156.02 200.679 152.376 200.065L151.628 200H4.16667C1.86548 200 6.71103e-08 198.135 0 195.833V104.167C1.07376e-06 101.865 1.86548 100 4.16667 100H162.5C164.801 100 166.667 98.1345 166.667 95.8333V4.16667C166.667 1.86548 168.532 1.00666e-07 170.833 0H358.333ZM170.833 100C168.532 100 166.667 101.865 166.667 104.167V295.833C166.667 298.135 168.532 300 170.833 300H262.5C264.801 300 266.667 298.135 266.667 295.833V104.167C266.667 101.865 264.801 100 262.5 100H170.833Z" fill="currentColor" class="text-muted-foreground" />
                      </svg>
                    </div>
                  </div>}
              </div>
            </div>

            { /* Right resize handle - only in mobile viewport mode (not on actual mobile devices) */}
            {viewportMode() === "mobile" && <ResizeHandle side="right" onPointerDown={handleResizeStart} isResizing={isResizing()} />}
          </>}
      </div>
    </div>;
 }
