import { useAtom } from "../../lib/state/jotai";
import { ChevronLeft, ChevronRight, FolderOpen, X } from "lucide-solid";
import { createEffect, createMemo, createSignal, Show, For, type Component, type JSX } from "solid-js";
import { Portal } from "solid-js/web";
import { EyeOpenFilledIcon, ProfileIconFilled, SlidersFilledIcon } from "../../icons";
import { agentsSettingsDialogActiveTabAtom, devToolsUnlockedAtom, type SettingsTab } from "../../lib/atoms";
import { trpc } from "../../lib/trpc";
import { cn } from "../../lib/utils";
import { BrainFilledIcon, BugFilledIcon, CustomAgentIconFilled, FlaskFilledIcon, KeyboardFilledIcon, OriginalMCPIcon, SkillIconFilled } from "../ui/icons";
import { AgentsAppearanceTab } from "./settings-tabs/agents-appearance-tab";
import { AgentsBetaTab } from "./settings-tabs/agents-beta-tab";
import { AgentsCustomAgentsTab } from "./settings-tabs/agents-custom-agents-tab";
import { AgentsDebugTab } from "./settings-tabs/agents-debug-tab";
import { AgentsKeyboardTab } from "./settings-tabs/agents-keyboard-tab";
import { AgentsMcpTab } from "./settings-tabs/agents-mcp-tab";
import { AgentsModelsTab } from "./settings-tabs/agents-models-tab";
import { AgentsPreferencesTab } from "./settings-tabs/agents-preferences-tab";
import { AgentsProfileTab } from "./settings-tabs/agents-profile-tab";
import { AgentsProjectWorktreeTab } from "./settings-tabs/agents-project-worktree-tab";
import { AgentsSkillsTab } from "./settings-tabs/agents-skills-tab";

// GitHub avatar icon with loading placeholder
function GitHubAvatarIcon(props: { gitOwner: string; class?: string }) {
	const [isLoaded, setIsLoaded] = createSignal(false);
	const [hasError, setHasError] = createSignal(false);

	return (
		<Show when={!hasError()} fallback={<FolderOpen class={cn("text-muted-foreground flex-shrink-0", props.class)} />}>
			<div class={cn("relative flex-shrink-0", props.class)}>
				{/* Placeholder background while loading */}
				<Show when={!isLoaded()}>
					<div class="absolute inset-0 rounded-sm bg-muted" />
				</Show>
				<img
					src={`https://github.com/${props.gitOwner}.png?size=64`}
					alt={props.gitOwner}
					class={cn("rounded-sm flex-shrink-0", props.class, isLoaded() ? "opacity-100" : "opacity-0")}
					onLoad={() => setIsLoaded(true)}
					onError={() => setHasError(true)}
				/>
			</div>
		</Show>
	);
}

// Hook to detect narrow screen
function useIsNarrowScreen() {
	const [isNarrow, setIsNarrow] = createSignal(false);

	createEffect(() => {
		const checkWidth = () => {
			setIsNarrow(window.innerWidth <= 768);
		};
		checkWidth();
		window.addEventListener("resize", checkWidth);
		return () => window.removeEventListener("resize", checkWidth);
	});

	return isNarrow;
}

// Check if we're in development mode
const isDevelopment = import.meta.env.DEV;

// Clicks required to unlock devtools in production
const DEVTOOLS_UNLOCK_CLICKS = 5;

interface AgentsSettingsDialogProps {
	isOpen: boolean;
	onClose: () => void;
}

// Main settings tabs
const MAIN_TABS = [
	{ id: "profile" as SettingsTab, label: "Account", icon: ProfileIconFilled, description: "Manage your account settings" },
	{ id: "appearance" as SettingsTab, label: "Appearance", icon: EyeOpenFilledIcon, description: "Theme settings" },
	{ id: "keyboard" as SettingsTab, label: "Keyboard", icon: KeyboardFilledIcon, description: "Customize keyboard shortcuts" },
	{ id: "preferences" as SettingsTab, label: "Preferences", icon: SlidersFilledIcon, description: "Claude behavior settings" },
	{ id: "models" as SettingsTab, label: "Models", icon: BrainFilledIcon, description: "Model overrides and Claude Code auth" },
];

// Advanced/experimental tabs (base - without Debug)
const ADVANCED_TABS_BASE = [
	{ id: "skills" as SettingsTab, label: "Skills", icon: SkillIconFilled, description: "Custom Claude skills" },
	{ id: "agents" as SettingsTab, label: "Custom Agents", icon: CustomAgentIconFilled, description: "Manage custom Claude agents" },
	{ id: "mcp" as SettingsTab, label: "MCP Servers", icon: OriginalMCPIcon, description: "Model Context Protocol servers" },
	{ id: "beta" as SettingsTab, label: "Beta", icon: FlaskFilledIcon, description: "Experimental features" },
];

// Debug tab definition
const DEBUG_TAB = {
	id: "debug" as SettingsTab,
	label: "Debug",
	icon: BugFilledIcon,
	description: "Test first-time user experience",
};

interface TabButtonProps {
	tab: {
		id: SettingsTab;
		label: string;
		icon: Component<{ class?: string }>;
		description?: string;
		beta?: boolean;
		projectId?: string;
	};
	isActive: boolean;
	onClick: () => void;
	isNarrow?: boolean;
}

function TabButton(props: TabButtonProps) {
	const Icon = props.tab.icon;
	const isBeta = "beta" in props.tab && props.tab.beta;
	const isProjectTab = "projectId" in props.tab;

	return (
		<button
			onClick={props.onClick}
			class={cn(
				"inline-flex items-center whitespace-nowrap ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 cursor-pointer shadow-none w-full justify-start gap-2 text-left px-3 py-1.5 text-sm",
				props.isNarrow ? "h-12 rounded-lg bg-foreground/5 hover:bg-foreground/10" : "h-7 rounded-md",
				!props.isNarrow && props.isActive
					? "bg-foreground/10 text-foreground font-medium hover:bg-foreground/15 hover:text-foreground"
					: !props.isNarrow
						? "text-muted-foreground hover:bg-foreground/5 hover:text-foreground font-medium"
						: "text-foreground font-medium"
			)}
		>
			<Icon class={cn("h-4 w-4", isProjectTab ? "opacity-100" : props.isNarrow ? "opacity-70" : props.isActive ? "opacity-100" : "opacity-50")} />
			<span class="flex-1">{props.tab.label}</span>
			<Show when={isBeta}>
				<span class="px-1.5 py-0.5 text-[10px] font-medium rounded bg-muted text-muted-foreground">Beta</span>
			</Show>
			<Show when={props.isNarrow}>
				<ChevronRight class="h-4 w-4 text-muted-foreground" />
			</Show>
		</button>
	);
}

export function AgentsSettingsDialog(props: AgentsSettingsDialogProps) {
	const [activeTab, setActiveTab] = useAtom(agentsSettingsDialogActiveTabAtom);
	const [devToolsUnlocked, setDevToolsUnlocked] = useAtom(devToolsUnlockedAtom);
	const [mounted, setMounted] = createSignal(false);
	const isNarrowScreen = useIsNarrowScreen();

	// Beta tab click counter for unlocking devtools
	let betaClickCount = 0;
	let betaClickTimeout: ReturnType<typeof setTimeout> | null = null;

	// Get projects list for dynamic tabs
	const { data: projects } = trpc.projects.list.useQuery();

	// Generate dynamic project tabs
	const projectTabs = createMemo(() => {
		if (!projects || projects.length === 0) return [];
		return projects.map((project: any) => ({
			id: `project-${project.id}` as SettingsTab,
			label: project.name,
			icon: project.gitOwner && project.gitProvider === "github"
				? (iconProps: { class?: string }) => <GitHubAvatarIcon gitOwner={project.gitOwner!} class={iconProps.class} />
				: FolderOpen,
			description: `Worktree setup for ${project.name}`,
			projectId: project.id,
		}));
	});

	// Show debug tab if in development OR if devtools are unlocked
	const showDebugTab = () => isDevelopment || devToolsUnlocked();

	// Build advanced tabs with optional debug tab
	const ADVANCED_TABS = createMemo(() => {
		if (showDebugTab()) return [...ADVANCED_TABS_BASE, DEBUG_TAB];
		return ADVANCED_TABS_BASE;
	});

	// All tabs combined for lookups
	const ALL_TABS = createMemo(() => [...MAIN_TABS, ...ADVANCED_TABS(), ...projectTabs()]);

	// Helper to get tab label from tab id
	const getTabLabel = (tabId: SettingsTab): string => {
		return ALL_TABS().find((t) => t.id === tabId)?.label ?? "Settings";
	};

	// Narrow screen: track whether we're showing tab list or content
	const [showContent, setShowContent] = createSignal(false);

	// Reset content view when dialog closes
	createEffect(() => {
		if (!props.isOpen) setShowContent(false);
	});

	// Handle keyboard navigation
	createEffect(() => {
		if (!props.isOpen) return;

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				event.preventDefault();
				if (isNarrowScreen() && showContent()) {
					setShowContent(false);
				} else {
					props.onClose();
				}
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	});

	// Ensure portal target only accessed on client
	createEffect(() => {
		setMounted(true);
	});

	const handleTabClick = (tabId: SettingsTab) => {
		// Handle Beta tab clicks for devtools unlock
		if (tabId === "beta" && !devToolsUnlocked()) {
			betaClickCount++;
			console.log(`[Settings] Beta click ${betaClickCount}/${DEVTOOLS_UNLOCK_CLICKS}`);

			if (betaClickTimeout) clearTimeout(betaClickTimeout);
			betaClickTimeout = setTimeout(() => {
				betaClickCount = 0;
			}, 2000);

			if (betaClickCount >= DEVTOOLS_UNLOCK_CLICKS) {
				setDevToolsUnlocked(true);
				betaClickCount = 0;
				(window as any).desktopApi?.unlockDevTools();
				console.log("[Settings] DevTools unlocked!");
			}
		}

		setActiveTab(tabId);
		if (isNarrowScreen()) setShowContent(true);
	};

	const renderTabContent = () => {
		const tab = activeTab();

		// Handle dynamic project tabs
		if (tab.startsWith("project-")) {
			const projectId = tab.replace("project-", "");
			return <AgentsProjectWorktreeTab projectId={projectId} />;
		}

		// Handle static tabs
		switch (tab) {
			case "profile": return <AgentsProfileTab />;
			case "appearance": return <AgentsAppearanceTab />;
			case "keyboard": return <AgentsKeyboardTab />;
			case "preferences": return <AgentsPreferencesTab />;
			case "models": return <AgentsModelsTab />;
			case "skills": return <AgentsSkillsTab />;
			case "agents": return <AgentsCustomAgentsTab />;
			case "mcp": return <AgentsMcpTab />;
			case "beta": return <AgentsBetaTab />;
			case "debug": return showDebugTab() ? <AgentsDebugTab /> : null;
			default: return null;
		}
	};

	const renderTabList = () => (
		<div class="space-y-4 px-1">
			{/* Main tabs */}
			<div class="space-y-1">
				<For each={MAIN_TABS}>
					{(tab) => <TabButton tab={tab} isActive={activeTab() === tab.id} onClick={() => handleTabClick(tab.id)} isNarrow={isNarrowScreen()} />}
				</For>
			</div>

			{/* Separator */}
			<div class="border-t border-border/50 mx-2" />

			{/* Advanced tabs */}
			<div class="space-y-1">
				<For each={ADVANCED_TABS()}>
					{(tab) => <TabButton tab={tab} isActive={activeTab() === tab.id} onClick={() => handleTabClick(tab.id)} isNarrow={isNarrowScreen()} />}
				</For>
			</div>

			{/* Project tabs */}
			<Show when={projectTabs().length > 0}>
				<div class="border-t border-border/50 mx-2" />
				<div class="space-y-1">
					<For each={projectTabs()}>
						{(tab) => <TabButton tab={tab} isActive={activeTab() === tab.id} onClick={() => handleTabClick(tab.id)} isNarrow={isNarrowScreen()} />}
					</For>
				</div>
			</Show>
		</div>
	);

	return (
		<Show when={mounted() && props.isOpen}>
			<Portal>
				<Show
					when={!isNarrowScreen()}
					fallback={
						/* Narrow screen: Full-screen overlay */
						<div
							class="fixed inset-0 z-[45] flex flex-col bg-background overflow-hidden select-none"
							role="dialog"
							aria-modal="true"
							aria-labelledby="agents-settings-dialog-title-narrow"
							data-modal="agents-settings"
							data-canvas-dialog
							data-agents-page
						>
							{/* Header */}
							<div class="flex items-center gap-2 px-4 py-3 border-b border-border">
								<Show when={showContent()}>
									<button onClick={() => setShowContent(false)} class="flex items-center justify-center h-8 w-8 rounded-full hover:bg-foreground/5 transition-colors">
										<ChevronLeft class="h-5 w-5" />
									</button>
								</Show>
								<h2 id="agents-settings-dialog-title-narrow" class="text-lg font-semibold flex-1">
									{showContent() ? getTabLabel(activeTab()) : "Settings"}
								</h2>
								<button type="button" onClick={props.onClose} class="flex items-center justify-center h-8 w-8 rounded-full hover:bg-foreground/5 transition-colors">
									<X class="h-4 w-4" />
									<span class="sr-only">Close</span>
								</button>
							</div>

							{/* Content */}
							<div class="flex-1 overflow-y-auto">
								<Show when={showContent()} fallback={<div class="p-4">{renderTabList()}</div>}>
									<div class="bg-tl-background min-h-full">{renderTabContent()}</div>
								</Show>
							</div>
						</div>
					}
				>
					{/* Wide screen: Centered modal with sidebar */}
					<>
						{/* Overlay */}
						<div
							class="fixed inset-0 z-40 bg-black/25 animate-in fade-in duration-200"
							onClick={props.onClose}
							data-modal="agents-settings"
						/>

						{/* Settings Dialog */}
						<div class="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] z-[45]">
							<div
								class="w-[90vw] h-[80vh] max-w-[900px] p-0 flex flex-col rounded-[20px] bg-background border-none bg-clip-padding shadow-2xl overflow-hidden select-none animate-in zoom-in-95 fade-in duration-200"
								role="dialog"
								aria-modal="true"
								aria-labelledby="agents-settings-dialog-title"
								data-modal="agents-settings"
								data-canvas-dialog
								data-agents-page
							>
								<h2 id="agents-settings-dialog-title" class="sr-only">Settings</h2>

								<div class="flex h-full p-2">
									{/* Left Sidebar - Tabs */}
									<div class="w-52 px-1 py-5 space-y-4">
										<h2 class="text-lg font-semibold px-2 pb-3 text-foreground">Settings</h2>

										{/* Main Tabs */}
										<div class="space-y-1">
											<For each={MAIN_TABS}>
												{(tab) => <TabButton tab={tab} isActive={activeTab() === tab.id} onClick={() => setActiveTab(tab.id)} />}
											</For>
										</div>

										{/* Separator */}
										<div class="border-t border-border/50 mx-2" />

										{/* Advanced Tabs */}
										<div class="space-y-1">
											<For each={ADVANCED_TABS()}>
												{(tab) => <TabButton tab={tab} isActive={activeTab() === tab.id} onClick={() => setActiveTab(tab.id)} />}
											</For>
										</div>

										{/* Project Tabs */}
										<Show when={projectTabs().length > 0}>
											<div class="border-t border-border/50 mx-2" />
											<div class="space-y-1">
												<For each={projectTabs()}>
													{(tab) => <TabButton tab={tab} isActive={activeTab() === tab.id} onClick={() => setActiveTab(tab.id)} />}
												</For>
											</div>
										</Show>
									</div>

									{/* Right Content Area */}
									<div class="flex-1 h-full overflow-hidden">
										<div class="flex flex-col relative h-full bg-tl-background rounded-xl w-full transition-all duration-300 overflow-y-auto">
											{renderTabContent()}
										</div>
									</div>
								</div>

								{/* Close Button */}
								<button
									type="button"
									onClick={props.onClose}
									class="absolute appearance-none outline-none select-none top-5 right-5 rounded-full cursor-pointer flex items-center justify-center ring-offset-background focus:ring-ring bg-secondary h-7 w-7 text-foreground/70 hover:text-foreground focus:outline-hidden disabled:pointer-events-none active:scale-95 transition-all duration-200 ease-in-out z-[60] focus:outline-none focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-2"
								>
									<X class="h-4 w-4" />
									<span class="sr-only">Close</span>
								</button>
							</div>
						</div>
					</>
				</Show>
			</Portal>
		</Show>
	);
}
