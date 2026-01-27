"use client";
import { useAtom, type WritableAtom } from "../../lib/state/jotai";
import { AnimatePresence, motion } from "motion/react";
import { createEffect, createMemo, createSignal, onCleanup, type JSX } from "solid-js";
import { Portal } from "solid-js/web";
import { Kbd } from "./kbd";

interface ResizableSidebarProps {
	isOpen: boolean;
	onClose: () => void;
	widthAtom: WritableAtom<number, [number], void>;
	minWidth?: number;
	maxWidth?: number;
	side: "left" | "right";
	closeHotkey?: string;
	animationDuration?: number;
	children: JSX.Element;
	className?: string;
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

export function ResizableSidebar({ isOpen, onClose, widthAtom, minWidth = DEFAULT_MIN_WIDTH, maxWidth = DEFAULT_MAX_WIDTH, side, closeHotkey, animationDuration = DEFAULT_ANIMATION_DURATION, children, className = "", initialWidth = 0, exitWidth = 0, dataAttributes, disableClickToClose = false, showResizeTooltip = false, style }: ResizableSidebarProps) {
	const [sidebarWidth, setSidebarWidth] = useAtom(widthAtom);
	const [hasOpenedOnce, setHasOpenedOnce] = createSignal(false);
	const [wasOpen, setWasOpen] = createSignal(false);
	const [shouldAnimate, setShouldAnimate] = createSignal(!isOpen);
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
		const x = side === "left" ? rect.right + 8 : rect.left - 8;
		return { x, y };
	});

	createEffect(() => {
		if (!isOpen && wasOpen()) {
			setHasOpenedOnce(false);
			setShouldAnimate(true);
			setLocalWidth(null);
		}
		if (isOpen) {
			setIsTooltipDismissed(false);
		}
		setWasOpen(isOpen);
		if (isOpen && !hasOpenedOnce()) {
			const timer = setTimeout(() => {
				setHasOpenedOnce(true);
				setShouldAnimate(false);
			}, animationDuration * 1e3 + 50);
			onCleanup(() => clearTimeout(timer));
		} else if (isOpen && hasOpenedOnce()) {
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
		onClose();
		setIsHoveringResizeHandle(false);
		setTooltipY(null);
	};

	createEffect(() => {
		if (!isOpen) {
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
		if (!isOpen || !isHoveringResizeHandle() || isTooltipDismissed()) {
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
		const clampWidth = (width: number) => Math.max(minWidth, Math.min(maxWidth, width));
		handleElement.setPointerCapture?.(pointerId);
		if (tooltipTimeout) {
			clearTimeout(tooltipTimeout);
			tooltipTimeout = undefined;
		}
		setIsResizing(true);
		setIsHoveringResizeHandle(false);
			const updateWidth = (clientX: number) => {
			const delta = side === "left" ? clientX - startX : startX - clientX;
			const newWidth = clampWidth(startWidth + delta);
			currentLocalWidthValue = newWidth;
			setLocalWidth(newWidth);
		};
		const handlePointerMove = (pointerEvent: PointerEvent) => {
			const delta = Math.abs(side === "left" ? pointerEvent.clientX - startX : startX - pointerEvent.clientX);
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
			if (!hasMoved && pointerEvent && !disableClickToClose) {
				handleClose();
			} else if (hasMoved && pointerEvent) {
				const delta = side === "left" ? pointerEvent.clientX - startX : startX - pointerEvent.clientX;
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
		if (side === "left") {
			return {
				right: "0px",
				width: "4px",
				marginRight: "-2px",
				paddingLeft: "2px",
				paddingRight: "2px"
			};
		} else {
			return {
				left: "0px",
				width: "4px",
				marginLeft: "-2px",
				paddingLeft: "2px",
				paddingRight: "2px"
			};
		}
	});
	const extendedHoverAreaStyle = createMemo(() => {
		if (side === "left") {
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
      <AnimatePresence>
        {isOpen && <motion.div ref={(el: HTMLDivElement) => sidebarRef = el} initial={!shouldAnimate() ? {
		width: currentWidth(),
		opacity: 1
	} : {
		width: initialWidth,
		opacity: 0
	}} animate={{
		width: currentWidth(),
		opacity: 1
	}} exit={{
		width: exitWidth,
		opacity: 0
	}} transition={{
		duration: isResizing() ? 0 : animationDuration,
		ease: [
			.4,
			0,
			.2,
			1
		]
	}} class={`bg-transparent flex flex-col text-xs h-full relative ${className}`} style={{
		"min-width": `${minWidth}px`,
		overflow: "hidden",
		...style
	}} {...dataAttributes ? Object.fromEntries(Object.entries(dataAttributes).map(([key, value]) => [`data-${key}`, value])) : {}}>
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

            {showResizeTooltip && isHoveringResizeHandle() && !isResizing() && !isTooltipDismissed() && tooltipPosition() && typeof window !== "undefined" && (
              <Portal mount={document.body}>
                <AnimatePresence>
                  {tooltipPosition() && <motion.div key="tooltip" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{
                    duration: .05,
                    ease: "easeOut"
                  }} class="fixed z-10" style={{
                    left: `${tooltipPosition()!.x}px`,
                    top: `${tooltipPosition()!.y}px`,
                    transform: side === "left" ? "translateY(-50%)" : "translateX(-100%) translateY(-50%)",
                    "transform-origin": side === "left" ? "left center" : "right center",
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
                      {!disableClickToClose && <div class="flex items-center gap-1 text-xs">
                        <span>Close</span>
                        <span class="text-muted-foreground inline-flex items-center gap-1">
                          <span>Click</span>
                          {closeHotkey && <>
                            <span>or</span>
                            <Kbd>{closeHotkey}</Kbd>
                          </>}
                        </span>
                      </div>}
                      <div class="flex items-center gap-1 text-xs">
                        <span>Resize</span>
                        <span class="text-muted-foreground">Drag</span>
                      </div>
                    </div>
                  </motion.div>}
                </AnimatePresence>
              </Portal>
            )}

            {children}
          </motion.div>}
      </AnimatePresence>
    </>;
}
