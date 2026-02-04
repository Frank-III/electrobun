import { createSignal, onMount, onCleanup } from "solid-js";
// Breakpoint for narrow/mobile layout in desktop app
const NARROW_BREAKPOINT = 600;
export function useIsMobile() {
	const [isMobile, setIsMobile] = createSignal<boolean>(
		typeof window !== "undefined" && window.innerWidth < NARROW_BREAKPOINT
	);
	onMount(() => {
		const mql = window.matchMedia(`(max-width: ${NARROW_BREAKPOINT - 1}px)`);
		const onChange = () => {
			setIsMobile(window.innerWidth < NARROW_BREAKPOINT);
		};
		mql.addEventListener("change", onChange);
		setIsMobile(window.innerWidth < NARROW_BREAKPOINT);
		onCleanup(() => mql.removeEventListener("change", onChange));
	});
	return isMobile;
}
