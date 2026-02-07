import { createEffect, createSignal, Show, type JSX } from "solid-js";
import { cn } from "../../../lib/utils";
import { desktopRpc } from "../../../lib/desktop-rpc";
/**
* Hybrid traffic lights component for macOS desktop app
* - Shows native macOS traffic lights when hovered
* - Shows custom muted circles when NOT hovered (for visual indication)
* Note: isDesktop prop should be passed from parent after mount to avoid hydration mismatch
*/
export function TrafficLights(props: {
	isHovered?: boolean;
	isFullscreen?: boolean | null;
	isDesktop?: boolean;
	class?: string;
	onHoverChange?: (hovered: boolean) => void;
}) {
	const isHovered = () => props.isHovered ?? true;
	const isFullscreen = () => props.isFullscreen ?? null;
	const isDesktop = () => props.isDesktop ?? false;
	const cls = () => props.class ?? "";
	let hostRef: HTMLDivElement | undefined;
	const updateNativePosition = () => {
		if (!hostRef) return;
		const rect = hostRef.getBoundingClientRect();
		// Align native controls to the DOM position (points ~= CSS pixels).
		desktopRpc.window.setTrafficLightPosition.mutate({ x: rect.left, y: rect.top });
	};
	createEffect(() => {
		if (!isDesktop() || isFullscreen() === true) return;
		requestAnimationFrame(() => updateNativePosition());
	});
	// NOTE: Removed mount effect that hides native lights
	// Native lights are shown by default (main process), and AgentsLayout controls visibility
	// Only show in desktop app, hide in fullscreen (Show for reactivity)
	const placeholder = () => (
		<div ref={el => hostRef = el} class={cn("relative", cls())} style={{ "-webkit-app-region": "no-drag" } as JSX.CSSProperties} data-sidebar-content>
			<div class="flex items-center gap-2" data-sidebar-content>
				<div class="w-3 h-3" />
				<div class="w-3 h-3" />
				<div class="w-3 h-3" />
			</div>
		</div>
	);
	const mutedCircles = () => (
		<div ref={el => hostRef = el} class={cn("relative", cls())} style={{ "-webkit-app-region": "no-drag" } as JSX.CSSProperties} data-sidebar-content>
			<div class="flex items-center gap-2" data-sidebar-content>
				<div class="w-3 h-3 rounded-full border border-foreground/20 bg-transparent" aria-hidden="true" />
				<div class="w-3 h-3 rounded-full border border-foreground/20 bg-transparent" aria-hidden="true" />
				<div class="w-3 h-3 rounded-full border border-foreground/20 bg-transparent" aria-hidden="true" />
			</div>
		</div>
	);
	return (
		<Show when={isDesktop() && isFullscreen() !== true} fallback={null}>
			<Show when={isHovered()} fallback={mutedCircles()}>
				{placeholder()}
			</Show>
		</Show>
	);
 }
/**
* Spacer component for macOS traffic light buttons (close/minimize/maximize)
* Only renders in Electron desktop app to provide space for the buttons
* Animates height smoothly when appearing/disappearing (e.g. fullscreen transitions)
* 
* isFullscreen can be:
* - null: not initialized yet (no animation, assume not fullscreen)
* - boolean: initialized (animate only on real changes)
*/
export function TrafficLightSpacer(props: {
	isFullscreen?: boolean | null;
	isDesktop?: boolean;
	class?: string;
}) {
	const isFullscreen = () => props.isFullscreen ?? null;
	const isDesktop = () => props.isDesktop ?? false;
	const cls = () => props.class ?? "";
	const [prevFullscreenRef, setPrevFullscreenRef] = createSignal(isFullscreen());
	const [shouldAnimate, setShouldAnimate] = createSignal(false);
	createEffect(() => {
		// Enable animation only after first real fullscreen change (not initial load)
		// Both previous and current must be non-null (initialized) and different
		if (isFullscreen() !== null && prevFullscreenRef() !== null && prevFullscreenRef() !== isFullscreen()) {
			setShouldAnimate(true);
		}
		setPrevFullscreenRef(isFullscreen());
	});
	// Show spacer when desktop and not fullscreen
	// If isFullscreen is null (not initialized), assume not fullscreen
	const shouldShow = () => isDesktop() && isFullscreen() !== true;
	return <div class={cn("w-full shrink-0 overflow-hidden", shouldAnimate() && "transition-[height] duration-200 ease-out", cls())} style={{ height: shouldShow() ? "32px" : "0px" }} />;
}
/**
* Wrapper to make child elements non-draggable within a draggable region
*/
export function NoDrag(props: {
	children: JSX.Element;
}) {
	return <div style={{ "-webkit-app-region": "no-drag" } as JSX.CSSProperties}>
      {props.children}
    </div>;
}
