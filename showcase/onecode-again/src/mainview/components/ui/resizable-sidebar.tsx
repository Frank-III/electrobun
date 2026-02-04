import { Motion, Presence } from "solid-motionone";
import { Show } from "solid-js";
import { createEffect, createMemo, createSignal, onCleanup, type Accessor, type JSX, type Setter } from "solid-js";
import { Portal } from "solid-js/web";
import { Kbd } from "./kbd";

interface ResizableSidebarProps {
	isOpen: boolean;
	onClose: () => void;
	width: Accessor<number>;
	setWidth: Setter<number>;
	minWidth?: number;
	maxWidth?: number;
	side: "left" | "right";
	closeHotkey?: string;
	animationDuration?: number;
	children: JSX.Element;
	class?: string;
	initialWidth?: number | string;
	exitWidth?: number | string;
	dataAttributes?: Record<string, string | boolean>;
	disableClickToClose?: boolean;
	showResizeTooltip?: boolean;
	style?: JSX.CSSProperties;
}

const DEFAULT_MIN_WIDTH = 200;
const DEFAULT_MAX_WIDTH = 9999;
const DEFAULT_ANIMATION_DURATION = 0;
const EXTENDED_HOVER_AREA_WIDTH = 8;

export function ResizableSidebar(props: ResizableSidebarProps) {
	const minWidth = () => props.minWidth ?? DEFAULT_MIN_WIDTH;
	const maxWidth = () => props.maxWidth ?? DEFAULT_MAX_WIDTH;
	const animationDuration = () => props.animationDuration ?? DEFAULT_ANIMATION_DURATION;
	const initialWidth = () => props.initialWidth ?? 0;
	const exitWidth = () => props.exitWidth ?? 0;
	const disableClickToClose = () => props.disableClickToClose ?? false;
	const showResizeTooltip = () => props.showResizeTooltip ?? false;
	const cls = () => props.class ?? "";
	const sidebarWidth = props.width;
	const setSidebarWidth = props.setWidth;
	const [hasOpenedOnce, setHasOpenedOnce] = createSignal(false);
	const [wasOpen, setWasOpen] = createSignal(false);
	const [shouldAnimate, setShouldAnimate] = createSignal(!props.isOpen);
	const [isResizing, setIsResizing] = createSignal(false);
	const [isHoveringResizeHandle, setIsHoveringResizeHandle] = createSignal(false);
	const [tooltipY, setTooltipY] = createSignal<number | null>(null);
	const [isTooltipDismissed, setIsTooltipDismissed] = createSignal(false);
	const [localWidth, setLocalWidth] = createSignal<number | null>(null);

	let resizeHandleRef: HTMLDivElement | undefined;
	let sidebarRef: HTMLDivElement | undefined;
	let tooltipRef: HTMLDivElement | undefined;
	let tooltipTimeout: ReturnType<typeof setTimeout> | undefined;

	const currentWidth = () => localWidth() ?? sidebarWidth();

	const tooltipPosition = createMemo(() => {
		const y = tooltipY();
		if (y === null || !sidebarRef) return null;
		const rect = sidebarRef.getBoundingClientRect();
		const x = props.side === "left" ? rect.right + 8 : rect.left - 8;
		return { x, y };
	});

	createEffect(() => {
		if (!props.isOpen && wasOpen()) {
			setHasOpenedOnce(false);
			setShouldAnimate(true);
			setLocalWidth(null);
		}
		if (props.isOpen) {
			setIsTooltipDismissed(false);
		}
		setWasOpen(props.isOpen);
		if (props.isOpen && !hasOpenedOnce()) {
			const timer = setTimeout(() => {
				setHasOpenedOnce(true);
				setShouldAnimate(false);
			}, animationDuration() * 1e3 + 50);
			onCleanup(() => clearTimeout(timer));
		} else if (props.isOpen && hasOpenedOnce()) {
			setShouldAnimate(false);
		}
	});

	const handleClose = () => {
		if (isHoveringResizeHandle() && !isTooltipDismissed()) {
			setIsTooltipDismissed(true);
		}
		if (isResizing()) {
			setIsResizing(false);
		}
		if (localWidth() !== null) {
			setLocalWidth(null);
		}
		setShouldAnimate(true);
		props.onClose();
		setIsHoveringResizeHandle(false);
		setTooltipY(null);
	};

	createEffect(() => {
		if (!props.isOpen) {
			if (tooltipTimeout) {
				clearTimeout(tooltipTimeout);
				tooltipTimeout = undefined;
			}
			setIsHoveringResizeHandle(false);
			setTooltipY(null);
		}
		onCleanup(() => {
			if (tooltipTimeout) {
				clearTimeout(tooltipTimeout);
				tooltipTimeout = undefined;
			}
		});
	});

	createEffect(() => {
		if (!props.isOpen || !isHoveringResizeHandle() || isTooltipDismissed()) {
			return;
		}
		const handleDocumentClick = (e: MouseEvent) => {
			const target = e.target as HTMLElement;
			const tooltipElement = target.closest("[data-tooltip=\"true\"]");
			const isClickOnTooltip = tooltipElement || (tooltipRef && tooltipRef.contains(target));
			if (isClickOnTooltip) {
				e.preventDefault();
				e.stopPropagation();
				setIsTooltipDismissed(true);
				handleClose();
			}
		};
		document.addEventListener("click", handleDocumentClick, true);
		document.addEventListener("pointerdown", handleDocumentClick, true);
		onCleanup(() => {
			document.removeEventListener("click", handleDocumentClick, true);
			document.removeEventListener("pointerdown", handleDocumentClick, true);
		});
	});

	const handleResizePointerDown = (event: PointerEvent) => {
		if (event.button !== 0) {
			return;
		}
		event.preventDefault();
		event.stopPropagation();
		const startX = event.clientX;
		const startWidth = sidebarWidth();
		const pointerId = event.pointerId;
		let hasMoved = false;
		let currentLocalWidthValue: number | null = null;
		const handleElement = resizeHandleRef ?? event.currentTarget as HTMLElement;
		const clampWidth = (width: number) => Math.max(minWidth(), Math.min(maxWidth(), width));
		handleElement.setPointerCapture?.(pointerId);
		if (tooltipTimeout) {
			clearTimeout(tooltipTimeout);
			tooltipTimeout = undefined;
		}
		setIsResizing(true);
		setIsHoveringResizeHandle(false);
			const updateWidth = (clientX: number) => {
			const delta = props.side === "left" ? clientX - startX : startX - clientX;
			const newWidth = clampWidth(startWidth + delta);
			currentLocalWidthValue = newWidth;
			setLocalWidth(newWidth);
		};
		const handlePointerMove = (pointerEvent: PointerEvent) => {
			const delta = Math.abs(props.side === "left" ? pointerEvent.clientX - startX : startX - pointerEvent.clientX);
			if (!hasMoved && delta >= 3) {
				hasMoved = true;
			}
			if (hasMoved) {
				updateWidth(pointerEvent.clientX);
			}
		};
		const finishResize = (pointerEvent?: PointerEvent) => {
			if (handleElement.hasPointerCapture?.(pointerId)) {
				handleElement.releasePointerCapture(pointerId);
			}
			document.removeEventListener("pointermove", handlePointerMove);
			document.removeEventListener("pointerup", handlePointerUp);
			document.removeEventListener("pointercancel", handlePointerCancel);
			setIsResizing(false);
			if (!hasMoved && pointerEvent && !disableClickToClose()) {
				handleClose();
			} else if (hasMoved && pointerEvent) {
				const delta = props.side === "left" ? pointerEvent.clientX - startX : startX - pointerEvent.clientX;
				const finalWidth = clampWidth(startWidth + delta);
				setSidebarWidth(finalWidth);
				setLocalWidth(null);
			} else {
				if (currentLocalWidthValue !== null) {
					setSidebarWidth(currentLocalWidthValue);
					setLocalWidth(null);
				}
			}
		};
		const handlePointerUp = (pointerEvent: PointerEvent) => {
			finishResize(pointerEvent);
		};
		const handlePointerCancel = () => {
			finishResize();
		};
		document.addEventListener("pointermove", handlePointerMove);
		document.addEventListener("pointerup", handlePointerUp, { once: true });
		document.addEventListener("pointercancel", handlePointerCancel, { once: true });
	};
	// Determine resize handle position based on side
	const resizeHandleStyle = createMemo(() => {
		if (props.side === "left") {
			return {
				right: "0px",
				width: "4px",
				"margin-right": "-2px",
				"padding-left": "2px",
				"padding-right": "2px"
			};
		} else {
			return {
				left: "0px",
				width: "4px",
				"margin-left": "-2px",
				"padding-left": "2px",
				"padding-right": "2px"
			};
		}
	});
	const extendedHoverAreaStyle = createMemo(() => {
		if (props.side === "left") {
			return {
				width: `${EXTENDED_HOVER_AREA_WIDTH}px`,
				right: "0px"
			};
		} else {
			return {
				width: `${EXTENDED_HOVER_AREA_WIDTH}px`,
				left: "0px"
			};
		}
	});
	return <>
      <Presence>
        <Show when={props.isOpen}>
          <Motion.div ref={(el: HTMLDivElement) => sidebarRef = el} initial={!shouldAnimate() ? {
		width: `${currentWidth()}px`,
		opacity: 1
	} : {
		width: typeof initialWidth() === 'number' ? `${initialWidth()}px` : initialWidth(),
		opacity: 0
	}} animate={{
		width: `${currentWidth()}px`,
		opacity: 1
	}} exit={{
		width: typeof exitWidth() === 'number' ? `${exitWidth()}px` : exitWidth(),
		opacity: 0
	}} transition={{
		duration: isResizing() ? 0 : animationDuration(),
		easing: [
			0.4,
			0,
			0.2,
			1
		]
	}} class={`bg-transparent flex flex-col text-xs h-full relative ${cls()}`} style={{
		"min-width": `${minWidth()}px`,
		overflow: "hidden",
		...props.style
	}} {...props.dataAttributes ? Object.fromEntries(Object.entries(props.dataAttributes).map(([key, value]) => [`data-${key}`, value])) : {}}>
            <div data-extended-hover-area class="absolute top-0 bottom-0 cursor-col-resize" style={{
 ...extendedHoverAreaStyle(),
		"pointer-events": isResizing() ? "none" : "auto",
		"z-index": isResizing() ? 5 : 10
	}} onPointerDown={handleResizePointerDown} onMouseEnter={(e) => {
		if (isResizing()) {
			return;
		}
		if (tooltipTimeout) {
			clearTimeout(tooltipTimeout);
		}
		if (tooltipY() === null) {
			setTooltipY(e.clientY);
		}
		tooltipTimeout = setTimeout(() => {
			setIsHoveringResizeHandle(true);
		}, 300);
	}} onMouseLeave={(e) => {
		if (isResizing()) return;
		if (tooltipTimeout) {
			clearTimeout(tooltipTimeout);
			tooltipTimeout = undefined;
		}
		const relatedTarget = e.relatedTarget;
		if (relatedTarget instanceof Node && (resizeHandleRef?.contains(relatedTarget) || resizeHandleRef === relatedTarget)) {
			return;
		}
		setIsHoveringResizeHandle(false);
		setTooltipY(null);
		setIsTooltipDismissed(false);
	}} />

            <div ref={(el) => resizeHandleRef = el} onPointerDown={handleResizePointerDown} onMouseEnter={(e) => {
		if (tooltipTimeout) {
			clearTimeout(tooltipTimeout);
		}
		if (tooltipY() === null) {
			setTooltipY(e.clientY);
		}
		tooltipTimeout = setTimeout(() => {
			setIsHoveringResizeHandle(true);
		}, 300);
	}} onMouseLeave={(e) => {
		if (tooltipTimeout) {
			clearTimeout(tooltipTimeout);
			tooltipTimeout = undefined;
		}
		const relatedTarget = e.relatedTarget;
		// Check if relatedTarget is an Element (not window or null)
		if (relatedTarget instanceof Element && relatedTarget.closest("[data-extended-hover-area]")) {
			return;
		}
			setIsHoveringResizeHandle(false);
		setTooltipY(null);
		setIsTooltipDismissed(false);
	}} class={`absolute top-0 bottom-0 cursor-col-resize z-10`} style={resizeHandleStyle()} />

            <Show when={showResizeTooltip() && isHoveringResizeHandle() && !isResizing() && !isTooltipDismissed() && tooltipPosition() && typeof window !== "undefined"}>
              <Portal mount={document.body}>
                <Presence>
                  <Show when={tooltipPosition()}>
                    <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{
                      duration: 0.05,
                      easing: "ease-out"
                    }} class="fixed z-10" style={{
                      left: `${tooltipPosition()!.x}px`,
                      top: `${tooltipPosition()!.y}px`,
                      transform: props.side === "left" ? "translateY(-50%)" : "translateX(-100%) translateY(-50%)",
                      "transform-origin": props.side === "left" ? "left center" : "right center",
                      "pointer-events": "none"
                    }}>
                      <div ref={(el) => tooltipRef = el} role="dialog" data-tooltip="true" class="relative rounded-md border border-border bg-popover px-2 py-1 flex flex-col items-start gap-0.5 text-xs text-popover-foreground shadow-lg dark pointer-events-auto" onPointerDown={(e) => {
                        e.stopPropagation();
                        if (e.button === 0) {
                          setIsTooltipDismissed(true);
                          handleClose();
                        }
                      }} onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setIsTooltipDismissed(true);
                        handleClose();
                      }}>
                        <Show when={!disableClickToClose()}>
                          <div class="flex items-center gap-1 text-xs">
                            <span>Close</span>
                            <span class="text-muted-foreground inline-flex items-center gap-1">
                              <span>Click</span>
                              <Show when={props.closeHotkey}>
                                <span>or</span>
                                <Kbd>{props.closeHotkey}</Kbd>
                              </Show>
                            </span>
                          </div>
                        </Show>
                        <div class="flex items-center gap-1 text-xs">
                          <span>Resize</span>
                          <span class="text-muted-foreground">Drag</span>
                        </div>
                      </div>
                    </Motion.div>
                  </Show>
                </Presence>
              </Portal>
            </Show>

            {props.children}
          </Motion.div>
        </Show>
      </Presence>
    </>;
}
