import { cn } from "../../../lib/utils";
import { Motion, Presence } from "solid-motionone";
import { Show, createEffect, createSignal, onCleanup, mergeProps, splitProps } from "solid-js";

interface PreviewUrlInputProps {
	/** The base host (e.g., "sandbox-3000.21st.sh") */
	baseHost: string | null;
	/** Current path (e.g., "/dashboard") */
	currentPath: string;
	/** Called when path changes */
	onPathChange: (path: string) => void;
	/** Is the iframe currently loading? */
	isLoading?: boolean;
	/** Optional class name for the container */
	class?: string;
	/** Variant for different contexts */
	variant?: "default" | "mobile";
}

export function PreviewUrlInput(props: PreviewUrlInputProps) {
	const merged = mergeProps({ isLoading: false, variant: "default" }, props);
	const [local] = splitProps(merged, ["baseHost", "currentPath", "onPathChange", "isLoading", "class", "variant"]);
	const [isEditing, setIsEditing] = createSignal(false);
	const [inputValue, setInputValue] = createSignal("");
	let inputRef: HTMLInputElement | undefined;
	
	// Progress bar state using CSS transitions
	const [progress, setProgress] = createSignal(0);
	const [transitionDuration, setTransitionDuration] = createSignal("0s");
	
	// Handle loading state changes for progress animation
	createEffect(() => {
		if (local.isLoading) {
			// Reset progress
			setTransitionDuration("0s");
			setProgress(0);
			// After a tick, start the slow animation to 90%
			const startTimer = setTimeout(() => {
				setTransitionDuration("12s");
				setProgress(90);
			}, 10);
			
			// Safety timeout: if still loading after 15s, force completion
			const safetyTimer = setTimeout(() => {
				setTransitionDuration("0.15s");
				setProgress(100);
			}, 15000);
			
			onCleanup(() => {
				clearTimeout(startTimer);
				clearTimeout(safetyTimer);
			});
		} else {
			// Quickly complete to 100%
			setTransitionDuration("0.15s");
			setProgress(100);
		}
	});
	
	// Focus and select when entering edit mode
	createEffect(() => {
		if (isEditing() && inputRef) {
			const input = inputRef;
			input.focus();
			const value = input.value;
			// Display format is "~{currentPath}", e.g. "~/community/components"
			// Select only the path after "~/" so user can type new path directly
			const pathStartAfterSlash = 2;
			// If path is just "/" (main page), place cursor at end
			// Otherwise select the path portion AFTER "~/"
			if (local.currentPath === "/") {
				input.setSelectionRange(value.length, value.length);
			} else {
				input.setSelectionRange(pathStartAfterSlash, value.length);
			}
		}
	});
	
	const handleSubmit = () => {
		let input = inputValue().trim();
		// Handle ~ prefix format (our display format)
		if (input.startsWith("~")) {
			input = input.slice(1);
		}
		// Extract path from full URL or just use as path
		let newPath = "/";
		try {
			// Check if it's a full URL
			if (input.startsWith("http://") || input.startsWith("https://")) {
				const url = new URL(input);
				newPath = url.pathname + url.search + url.hash;
			} else if (input.includes(".") && input.includes("/")) {
				// It's host + path like "sandbox-3000.21st.sh/some/path"
				const slashIndex = input.indexOf("/");
				newPath = input.slice(slashIndex);
			} else if (input.startsWith("/")) {
				// Just a path starting with /
				newPath = input;
			} else {
				// Just a path without leading /
				newPath = "/" + input;
			}
		} catch {
			// If parsing fails, treat as path
			newPath = input.startsWith("/") ? input : "/" + input;
		}
		if (!newPath) newPath = "/";
		// Only navigate if path actually changed
		if (newPath !== local.currentPath) {
			local.onPathChange(newPath);
		}
		setIsEditing(false);
	};
	
	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === "Enter") {
			e.preventDefault();
			handleSubmit();
		} else if (e.key === "Escape") {
			e.preventDefault();
			setInputValue(`~${local.currentPath}`);
			setIsEditing(false);
		}
	};
	
	const startEditing = () => {
		setInputValue(`~${local.currentPath}`);
		setIsEditing(true);
	};
	
	if (!local.baseHost) {
		return null;
	}
	
	// Shared styling for consistent height/positioning between button and input
	const sharedStyles = "font-mono text-xs rounded-md px-3 h-7 leading-7 w-full max-w-[350px] text-center";
	
	// Compute glow opacity based on progress (fades from 1 to 0 between 95-100%)
	const glowOpacity = () => {
		const p = progress();
		if (p < 95) return 1;
		return 1 - (p - 95) / 5;
	};
	
	return <div class={cn("min-w-0 flex-1 text-center flex items-center justify-center relative",local.class)}>
      {/* URL input/button container */}
      <div class="relative max-w-[350px] w-full">
	        <Show when={isEditing()} fallback={
	          <button type="button" onClick={startEditing} class={cn(sharedStyles, local.variant === "mobile" ? "truncate text-muted-foreground hover:text-foreground transition-all cursor-pointer bg-muted hover:bg-muted/80 shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70" : "truncate text-muted-foreground hover:text-foreground transition-all cursor-pointer hover:bg-background hover:shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] dark:hover:shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70")}>
	            ~{local.currentPath}
	          </button>
	        }>
	          <input ref={inputRef} type="text" value={inputValue()} onInput={(e) => setInputValue(e.currentTarget.value)} onKeyDown={handleKeyDown} onBlur={handleSubmit} spellcheck={false} autocomplete="off" autocorrect="off" autocapitalize="off" class={cn(sharedStyles, local.variant === "mobile" ? "bg-muted shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 text-foreground" : "bg-background shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 text-foreground")} placeholder="~/" />
	        </Show>

        {/* Progress bar at bottom with upward glow */}
        <Presence>
	          <Show when={local.isLoading}>
            <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} class="absolute bottom-0 left-0 right-0 pointer-events-none z-0 rounded-md overflow-hidden">
              {/* Glow effect - uniform along progress, fades at edges via blur */}
              <div 
                class="absolute -bottom-2 left-0 h-4" 
                style={{
                  width: `${progress()}%`,
                  opacity: glowOpacity(),
                  background: "hsl(var(--primary) / 0.15)",
                  filter: "blur(4px)",
                  transition: `width ${transitionDuration()} cubic-bezier(0.1, 0.4, 0.2, 1)`
                }} 
              />
              {/* Progress bar line */}
              <div 
                class="absolute bottom-0 left-0 h-[0.5px] bg-primary/60" 
                style={{ 
                  width: `${progress()}%`,
                  transition: `width ${transitionDuration()} cubic-bezier(0.1, 0.4, 0.2, 1)`
                }} 
              />
            </Motion.div>
          </Show>
        </Presence>
      </div>
    </div>;
}
