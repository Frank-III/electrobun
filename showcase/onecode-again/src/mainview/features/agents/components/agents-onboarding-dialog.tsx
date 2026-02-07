import { createEffect, createSignal, onCleanup, Show } from "solid-js";
import { Motion, Presence } from "solid-motionone";
import { Portal } from "solid-js/web";
// Desktop: stub for next/image
const Image = ({ src, alt, width, height, class: cls }: any) => <img src={src} alt={alt} width={width} height={height} class={cls} />;
import { useTheme } from "../../../lib/hooks/use-theme";
import { X } from "lucide-solid";
import { Button } from "../../../components/ui/button";
import { agentsDebugModeAtom } from "../atoms";
const EASING_CURVE = [
	.55,
	.055,
	.675,
	.19
] as const;
const ONBOARDING_STORAGE_KEY = "agents-onboarding-seen";
// Self-contained onboarding dialog that checks localStorage
// Shows only the welcome screen - full onboarding is at /agents/onboarding
export function AgentsOnboardingDialog() {
	const [mounted, setMounted] = createSignal(false);
	const [isOpen, setIsOpen] = createSignal(false);
	let openAtRef = 0;
	const { resolvedTheme } = useTheme();
	const [debugMode, setDebugMode] = agentsDebugModeAtom;
	createEffect(() => {
		setMounted(true);
		// Check if debug mode wants to reset onboarding
		if (debugMode().enabled && debugMode().resetOnboarding) {
			localStorage.removeItem(ONBOARDING_STORAGE_KEY);
			// Reset the flag to prevent infinite loops
			setDebugMode((prev) => ({
				...prev,
				resetOnboarding: false
			}));
		}
		// Check localStorage on mount
		const hasSeenOnboarding = localStorage.getItem(ONBOARDING_STORAGE_KEY);
		if (!hasSeenOnboarding) {
			setIsOpen(true);
		}
	});
	createEffect(() => {
		if (isOpen()) {
			openAtRef = performance.now();
		}
	});
	const handleClose = () => {
		const canInteract = performance.now() - openAtRef > 250;
		if (!canInteract) return;
		// Mark onboarding as seen
		localStorage.setItem(ONBOARDING_STORAGE_KEY, "true");
		setIsOpen(false);
	};
	// Handle ESC key to close dialog
	createEffect(() => {
		if (!isOpen()) return;
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				e.preventDefault();
				handleClose();
			} else if (e.key === "Enter") {
				e.preventDefault();
				handleClose();
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		onCleanup(() => window.removeEventListener("keydown", handleKeyDown));
	});
	// typeof document check is static (SSR guard) - safe as non-reactive
	if (typeof document === "undefined") return null;
	return (
		<Show when={mounted()}>
		<Portal mount={document.body}>
			<Presence exitBeforeEnter>
				<Show when={isOpen()}>
					{/* Overlay */}
					<Motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.18, easing: EASING_CURVE }}
						class="fixed inset-0 z-[45] bg-black/40"
						onClick={handleClose}
						style={{ "pointer-events": "auto" }}
						data-modal="agents-onboarding"
					/>

					{/* Main Dialog */}
					<div class="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] z-[46] pointer-events-none">
						<Motion.div
							initial={{ scale: 0.95, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0.95, opacity: 0 }}
							transition={{ duration: 0.2, easing: EASING_CURVE }}
							class="w-[90vw] max-w-[384px] pointer-events-auto relative"
							onClick={(e) => e.stopPropagation()}
						>
							<div class="bg-background rounded-2xl border shadow-2xl overflow-hidden" data-canvas-dialog>
								{/* Close Button */}
								<button type="button" onClick={handleClose} class="absolute appearance-none outline-none select-none top-4 right-4 rounded-full cursor-pointer flex items-center justify-center ring-offset-background focus:ring-ring bg-secondary h-8 w-8 text-foreground/70 hover:text-foreground focus:outline-hidden disabled:pointer-events-none active:scale-95 transition-all duration-200 ease-in-out z-[60] focus:outline-none focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-2">
									<X class="h-4 w-4" />
									<span class="sr-only">Close</span>
								</button>

								<div class="flex flex-col">
									{/* Images Section */}
									<div class="bg-primary px-5 pt-10 flex items-start justify-center">
										<div class="relative w-full flex items-start justify-center pt-4">
											{/* Container showing only top 70% of image */}
											<div class="relative w-full overflow-hidden rounded-t-lg border" style={{ "aspect-ratio": "16/7", "max-height": "126px" }}>
												<div class="absolute inset-0" style={{ height: "142.86%", top: 0 }}>
													<Image src={resolvedTheme() === "dark" ? "/agents-onboarding-dark.webp" : "/agents-onboarding-light.webp"} alt="Agents interface" fill class="object-cover" style={{ "object-position": "top" }} />
												</div>
											</div>
										</div>
									</div>

									{/* Content */}
									<div class="p-5 space-y-2">
										<h2 class="text-base font-semibold">Welcome to Agents</h2>
										<p class="text-[13px] text-muted-foreground leading-relaxed">
											This tool makes you significantly more productive in your daily routine.
										</p>
										{/* Button - bottom right */}
										<div class="flex justify-end pt-1">
											<Button size="sm" onClick={handleClose} class="h-7 text-xs rounded-md">
												Let's go
											</Button>
										</div>
									</div>
								</div>
							</div>
						</Motion.div>
					</div>
				</Show>
			</Presence>
		</Portal>
		</Show>
	);
}
