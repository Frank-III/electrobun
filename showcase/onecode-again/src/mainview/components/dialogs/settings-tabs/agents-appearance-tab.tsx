import { useTheme } from "../../../lib/hooks/use-theme";
import { createSignal, createEffect, createMemo, Show, For, onCleanup } from "solid-js";
import { IconSpinner } from "../../../icons";
import { cn } from "../../../lib/utils";
import { selectedFullThemeIdAtom, fullThemeDataAtom, systemLightThemeIdAtom, systemDarkThemeIdAtom, showWorkspaceIconAtom, alwaysExpandTodoListAtom, importedThemesAtom, type VSCodeFullTheme } from "../../../lib/atoms";
import { BUILTIN_THEMES, getBuiltinThemeById, BUILTIN_THEME_NAMES } from "../../../lib/themes/builtin-themes";
import { generateCSSVariables, applyCSSVariables, removeCSSVariables, getThemeTypeFromColors } from "../../../lib/themes/vscode-to-css-mapping";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectSeparator, SelectLabel, SelectSection } from "../../../components/ui/select";
import { Switch } from "../../../components/ui/switch";
// Hook to detect narrow screen
function useIsNarrowScreen() {
	const [isNarrow, setIsNarrow] = createSignal(false);
	createEffect(() => {
		const checkWidth = () => {
			setIsNarrow(window.innerWidth <= 768);
		};
		checkWidth();
		window.addEventListener("resize", checkWidth);
		onCleanup(() => window.removeEventListener("resize", checkWidth));
	});
	return isNarrow;
}
// Check if a hex color is visible (not too transparent)
function isVisibleColor(hex: string | undefined): boolean {
	if (!hex) return false;
	// Remove # if present
	const cleanHex = hex.replace(/^#/, "");
	// If 8 characters, check alpha
	if (cleanHex.length === 8) {
		const alpha = parseInt(cleanHex.slice(6, 8), 16);
		// Consider colors with less than 50% opacity as "not visible" for accent purposes
		return alpha >= 128;
	}
	return true;
}
// Theme preview box with dot and "Aa" text
function ThemePreviewBox(props: {
	theme: VSCodeFullTheme | null;
	size?: "sm" | "md";
	class?: string;
}) {
	const { theme, size = "md", class: cls } = props;
	const bgColor = theme?.colors?.["editor.background"] || "#1a1a1a";
	// Get accent color, preferring button.background and skipping transparent colors
	const getAccentColor = () => {
		const candidates = [
			theme?.colors?.["button.background"],
			theme?.colors?.["textLink.foreground"],
			theme?.colors?.["focusBorder"],
			theme?.colors?.["activityBarBadge.background"]
		];
		for (const color of candidates) {
			if (isVisibleColor(color)) {
				return color;
			}
		}
		return "#0034FF";
	};
	const accentColor = getAccentColor();
	const isDark = theme ? theme.type === "dark" : true;
	const sizeClasses = size === "sm" ? "w-7 h-5 text-[9px] gap-0.5 rounded-sm" : "w-8 h-6 text-[10px] gap-1 rounded-sm";
	const dotSize = size === "sm" ? "w-1 h-1" : "w-1.5 h-1.5";
	return <div class={cn("flex-shrink-0 flex items-center justify-center font-semibold", sizeClasses,cls)} style={{
		"background-color": bgColor,
		"box-shadow": "inset 0 0 0 0.5px rgba(128, 128, 128, 0.3)"
	}}>
      {	/* Accent dot to the left of text */}
      <div class={cn("rounded-full flex-shrink-0", dotSize)} style={{ "background-color": accentColor }} />
      <span style={{
 color: isDark ? "#fff" : "#000",
		opacity: .9
	}}>Aa</span>
    </div>;
}
export function AgentsAppearanceTab() {
	const { resolvedTheme, setTheme: setNextTheme } = useTheme();
	const [mounted, setMounted] = createSignal(false);
	const isNarrowScreen = useIsNarrowScreen();
	// Theme atoms
	const [selectedThemeId, setSelectedThemeId] = selectedFullThemeIdAtom;
	const [systemLightThemeId, setSystemLightThemeId] = systemLightThemeIdAtom;
	const [systemDarkThemeId, setSystemDarkThemeId] = systemDarkThemeIdAtom;
	const setFullThemeData = fullThemeDataAtom[1];
	const [importedThemes, setImportedThemes] = importedThemesAtom;
	// Sidebar settings
	const [showWorkspaceIcon, setShowWorkspaceIcon] = showWorkspaceIconAtom;
	// To-do list preference
	const [alwaysExpandTodoList, setAlwaysExpandTodoList] = alwaysExpandTodoListAtom;
	// VS Code themes state
	const [isScanning, setIsScanning] = createSignal(false);
	createEffect(() => {
		setMounted(true);
	});
	// Scan and load VS Code themes on mount
	createEffect(() => {
		if (!mounted()) return;
		const api = window.desktopApi;
		if (typeof api?.scanVSCodeThemes !== "function") return;
		if (typeof api?.loadVSCodeTheme !== "function") return;
		const loadAllThemes = async () => {
			setIsScanning(true);
			try {
				const discovered = await api.scanVSCodeThemes();
				// Filter out themes that are already builtin
				const newThemes = discovered.filter((t: { name: string; id: string; path: string }) => !BUILTIN_THEME_NAMES.has(t.name.toLowerCase()));
				// Load all themes in parallel
				const loadedThemes = await Promise.all(newThemes.map(async (theme: { name: string; id: string; path: string }) => {
					try {
						const fullTheme = await api.loadVSCodeTheme(theme.path);
						return {
							...fullTheme,
							id: theme.id,
							source: "imported" as const
						} as VSCodeFullTheme;
					} catch (err) {
						console.error("[appearance-tab] Failed to load theme:", theme.name, err);
						return null;
					}
				}));
				// Filter out failed loads and update imported themes
				const validThemes = loadedThemes.filter((t): t is VSCodeFullTheme => t !== null);
				setImportedThemes(validThemes);
			} catch (error) {
				console.error("Failed to load VS Code themes:", error);
			} finally {
				setIsScanning(false);
			}
		};
		loadAllThemes();
	});
	// Group themes by type
	const darkThemes = createMemo(() => BUILTIN_THEMES.filter((t: VSCodeFullTheme) => t.type === "dark"));
	const lightThemes = createMemo(() => BUILTIN_THEMES.filter((t: VSCodeFullTheme) => t.type === "light"));
	// Is system mode selected
	const isSystemMode = createMemo(() => selectedThemeId() === null);
	// Get the current theme for display
	const currentTheme = createMemo(() => {
		if (selectedThemeId() === null) {
			return null;
		}
		// Check in both builtin and imported themes
		return BUILTIN_THEMES.find((t: VSCodeFullTheme) => t.id === selectedThemeId()) || importedThemes().find((t: VSCodeFullTheme) => t.id === selectedThemeId()) || null;
	});
	// Get theme objects for system mode selectors
	const systemLightTheme = createMemo(() => getBuiltinThemeById(systemLightThemeId()));
	const systemDarkTheme = createMemo(() => getBuiltinThemeById(systemDarkThemeId()));
	// Apply theme based on current settings
	const applyTheme = (themeId: string | null) => {
		if (themeId === null) {
			// System mode - apply theme based on system preference
			removeCSSVariables();
			setFullThemeData(null);
			setNextTheme("system");
			// Apply the appropriate system theme
			const isDark = resolvedTheme() === "dark";
			const systemTheme = isDark ? getBuiltinThemeById(systemDarkThemeId()) : getBuiltinThemeById(systemLightThemeId());
			if (systemTheme) {
				const cssVars = generateCSSVariables(systemTheme.colors);
				applyCSSVariables(cssVars);
			}
			return;
		}
		// Check in both builtin and imported themes
		const theme = BUILTIN_THEMES.find((t: VSCodeFullTheme) => t.id === themeId) || importedThemes().find((t: VSCodeFullTheme) => t.id === themeId);
		if (theme) {
			setFullThemeData(theme);
			// Apply CSS variables
			const cssVars = generateCSSVariables(theme.colors);
			applyCSSVariables(cssVars);
			// Sync color mode with theme type
			const themeType = getThemeTypeFromColors(theme.colors);
			setNextTheme(themeType);
		}
	};
	// Handle main theme selection
	const handleThemeChange = (value: string) => {
		if (value === "system") {
			setSelectedThemeId(null);
			applyTheme(null);
		} else {
			setSelectedThemeId(value);
			applyTheme(value);
		}
	};
	// Handle system light theme change
	const handleSystemLightThemeChange = (themeId: string) => {
		setSystemLightThemeId(themeId);
		// If currently in light mode, apply the new theme
		if (resolvedTheme() === "light" && selectedThemeId() === null) {
			const theme = getBuiltinThemeById(themeId);
			if (theme) {
				const cssVars = generateCSSVariables(theme.colors);
				applyCSSVariables(cssVars);
			}
		}
	};
	// Handle system dark theme change
	const handleSystemDarkThemeChange = (themeId: string) => {
		setSystemDarkThemeId(themeId);
		// If currently in dark mode, apply the new theme
		if (resolvedTheme() === "dark" && selectedThemeId() === null) {
			const theme = getBuiltinThemeById(themeId);
			if (theme) {
				const cssVars = generateCSSVariables(theme.colors);
				applyCSSVariables(cssVars);
			}
		}
	};
	// Group imported themes by type
	const importedDarkThemes = createMemo(() => importedThemes().filter((t: VSCodeFullTheme) => t.type === "dark"));
	const importedLightThemes = createMemo(() => importedThemes().filter((t: VSCodeFullTheme) => t.type === "light"));
	// Re-apply theme when system preference changes
	createEffect(() => {
		if (selectedThemeId() === null && mounted()) {
			const isDark = resolvedTheme() === "dark";
			const systemTheme = isDark ? getBuiltinThemeById(systemDarkThemeId()) : getBuiltinThemeById(systemLightThemeId());
			if (systemTheme) {
				const cssVars = generateCSSVariables(systemTheme.colors);
				applyCSSVariables(cssVars);
			}
		}
	});
	if (!mounted()) {
		return <div class="p-6 space-y-6">
        <div class="h-48 flex items-center justify-center">
          <IconSpinner class="h-8 w-8 text-foreground" />
        </div>
      </div>;
	}
	return <div class="p-6 space-y-6 flex-1 overflow-y-auto">
      {	/* Header - hidden on narrow screens since it's in the navigation bar */}
      <Show when={!isNarrowScreen()}>
        <div class="flex flex-col space-y-1.5 text-center sm:text-left">
          <h3 class="text-sm font-semibold text-foreground">Appearance</h3>
          <p class="text-xs text-muted-foreground">
            Customize the look and feel of the interface
          </p>
        </div>
      </Show>

      { /* Interface Theme Section */}
      <div class="bg-background rounded-lg border border-border overflow-hidden">
        { /* Main theme selector */}
        <div class="flex items-center justify-between p-4">
          <div class="flex flex-col space-y-1">
            <span class="text-sm font-medium text-foreground">
              Interface theme
            </span>
            <span class="text-xs text-muted-foreground">
              Select or customize your interface color scheme
            </span>
          </div>

          <Select value={selectedThemeId() ?? "system"} onChange={handleThemeChange}>
            <SelectTrigger class="w-auto px-2">
              <div class="flex items-center gap-2 min-w-0 -ml-[3px]">
                <Show when={isSystemMode()} fallback={<>
                    <ThemePreviewBox theme={currentTheme()} />
                    <span class="text-xs truncate">
                      {currentTheme()?.name || "Select"}
                    </span>
                  </>}>
                  <ThemePreviewBox theme={resolvedTheme() === "dark" ? systemDarkTheme() ?? null : systemLightTheme() ?? null} />
                  <span class="text-xs truncate">System preference</span>
                </Show>
              </div>
            </SelectTrigger>
            <SelectContent class="max-h-[300px]">
              { /* System preference option */}
              <SelectItem value="system">
                <div class="flex items-center gap-2">
                  <ThemePreviewBox theme={resolvedTheme() === "dark" ? systemDarkTheme() ?? null : systemLightTheme() ?? null} size="sm" />
                  <span class="truncate">System preference</span>
                </div>
              </SelectItem>

              { /* Light themes */}
              <For each={lightThemes()}>{(theme) => <SelectItem value={theme.id}>
                  <div class="flex items-center gap-2">
                    <ThemePreviewBox theme={theme} size="sm" />
                    <span class="truncate">{theme.name}</span>
                  </div>
                </SelectItem>}</For>

              { /* Dark themes */}
              <For each={darkThemes()}>{(theme) => <SelectItem value={theme.id}>
                  <div class="flex items-center gap-2">
                    <ThemePreviewBox theme={theme} size="sm" />
                    <span class="truncate">{theme.name}</span>
                  </div>
                </SelectItem>}</For>

              { /* Imported themes from VS Code / Cursor / Windsurf */}
              <Show when={importedThemes().length > 0}>
                  <SelectSeparator />
                  <SelectSection>
                    <SelectLabel class="text-xs text-muted-foreground px-2">
                      From editors
                    </SelectLabel>
                    <For each={importedThemes()}>{(theme) => <SelectItem value={theme.id}>
                        <div class="flex items-center gap-2">
                          <ThemePreviewBox theme={theme} size="sm" />
                          <span class="truncate">{theme.name}</span>
                        </div>
                      </SelectItem>}</For>
                  </SelectSection>
              </Show>

              { /* Loading indicator */}
              <Show when={isScanning()}>
                  <SelectSeparator />
                  <div class="flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground">
                    <IconSpinner class="h-3 w-3" />
                    <span>Loading themes from editors...</span>
                  </div>
              </Show>
            </SelectContent>
          </Select>
        </div>

        { /* Light/Dark theme selectors for system mode */}
        <Show when={isSystemMode()}>
          <div class="overflow-hidden">
              {	/* Light theme selector */}
              <div class="flex items-center justify-between p-4 border-t border-border">
                <div class="flex flex-col space-y-1">
                  <span class="text-sm font-medium text-foreground">
                    Light
                  </span>
                  <span class="text-xs text-muted-foreground">
                    Theme to use for light system appearance
                  </span>
                </div>

                <Select value={systemLightThemeId()} onChange={handleSystemLightThemeChange}>
                  <SelectTrigger class="w-auto px-2">
                    <div class="flex items-center gap-2 min-w-0 -ml-[3px]">
                      <ThemePreviewBox theme={systemLightTheme() || null} />
                      <span class="text-xs truncate">
                        {systemLightTheme()?.name || "Select"}
                      </span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <For each={lightThemes()}>{(theme) => <SelectItem value={theme.id}>
                        <div class="flex items-center gap-2">
                          <ThemePreviewBox theme={theme} size="sm" />
                          <span class="truncate">{theme.name}</span>
                        </div>
                      </SelectItem>}</For>
                  </SelectContent>
                </Select>
              </div>

              { /* Dark theme selector */}
              <div class="flex items-center justify-between p-4 border-t border-border">
                <div class="flex flex-col space-y-1">
                  <span class="text-sm font-medium text-foreground">
                    Dark
                  </span>
                  <span class="text-xs text-muted-foreground">
                    Theme to use for dark system appearance
                  </span>
                </div>

                <Select value={systemDarkThemeId()} onChange={handleSystemDarkThemeChange}>
                  <SelectTrigger class="w-auto px-2">
                    <div class="flex items-center gap-2 min-w-0 -ml-[3px]">
                      <ThemePreviewBox theme={systemDarkTheme() || null} />
                      <span class="text-xs truncate">
                        {systemDarkTheme()?.name || "Select"}
                      </span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <For each={darkThemes()}>{(theme) => <SelectItem value={theme.id}>
                        <div class="flex items-center gap-2">
                          <ThemePreviewBox theme={theme} size="sm" />
                          <span class="truncate">{theme.name}</span>
                        </div>
                      </SelectItem>}</For>
                  </SelectContent>
                </Select>
              </div>
            </div>
        </Show>
      </div>


      { /* Display Options Section */}
      <div class="bg-background rounded-lg border border-border overflow-hidden">
        <div class="flex items-center justify-between p-4">
          <div class="flex flex-col space-y-1">
            <span class="text-sm font-medium text-foreground">
              Workspace icon
            </span>
            <span class="text-xs text-muted-foreground">
              Show project icon in the sidebar workspace list
            </span>
          </div>
          <Switch checked={showWorkspaceIcon()} onCheckedChange={setShowWorkspaceIcon} />
        </div>
        <div class="flex items-center justify-between p-4 border-t border-border">
          <div class="flex flex-col space-y-1">
            <span class="text-sm font-medium text-foreground">
              Always expand to-do list
            </span>
            <span class="text-xs text-muted-foreground">
              Show the full to-do list instead of compact view
            </span>
          </div>
          <Switch checked={alwaysExpandTodoList()} onCheckedChange={setAlwaysExpandTodoList} />
        </div>
      </div>
    </div>;
 }
