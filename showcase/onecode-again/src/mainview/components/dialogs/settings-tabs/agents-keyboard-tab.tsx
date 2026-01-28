"use client";
import { createMemo, createSignal, createEffect, onCleanup } from "solid-js";
import { useAtom, useAtomValue } from "../../../lib/state/jotai";
import { X, RotateCcw, Search, Settings2 } from "lucide-solid";
import { cn } from "../../../lib/utils";
import { CmdIcon, OptionIcon, ShiftIcon, ControlIcon } from "../../ui/icons";
import { customHotkeysAtom, ctrlTabTargetAtom, betaKanbanEnabledAtom } from "../../../lib/atoms";
import { ALL_SHORTCUT_ACTIONS, getShortcutsByCategory, hotkeyStringToKeys, getResolvedHotkey, isCustomHotkey, detectConflicts, normalizeHotkey, CATEGORY_LABELS, getShortcutAction, type ShortcutAction, type ShortcutActionId, type ShortcutCategory, type CustomHotkeysConfig } from "../../../lib/hotkeys";
import { useHotkeyRecorder } from "../../../lib/hotkeys/use-hotkey-recorder";
/**
* Display a single key in a keyboard shortcut
*/
function ShortcutKey({ keyName, size = "md", isSelected = false }: {
	keyName: string;
	size?: "sm" | "md" | "lg";
	isSelected?: boolean;
}) {
	const sizeClasses = {
		sm: "h-5 min-w-5 text-[10px] px-1",
		md: "h-6 min-w-6 text-xs px-1.5",
		lg: "h-8 min-w-8 text-sm px-2"
	};
	const iconSizes = {
		sm: "h-2.5 w-2.5",
		md: "h-3 w-3",
		lg: "h-4 w-4"
	};
	const baseClasses = cn("inline-flex items-center justify-center rounded border font-[inherit] font-normal", sizeClasses[size], isSelected ? "bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30" : "bg-secondary text-secondary-foreground border-muted");
	const lower = keyName.toLowerCase();
	// Modifier keys with icons
	if (lower === "cmd" || lower === "meta") {
		return <kbd class={baseClasses}>
        <CmdIcon class={iconSizes[size]} />
      </kbd>;
	}
	if (lower === "opt" || lower === "alt") {
		return <kbd class={baseClasses}>
        <OptionIcon class={iconSizes[size]} />
      </kbd>;
	}
	if (lower === "shift") {
		return <kbd class={baseClasses}>
        <ShiftIcon class={iconSizes[size]} />
      </kbd>;
	}
	if (lower === "ctrl") {
		return <kbd class={baseClasses}>
        <ControlIcon class={iconSizes[size]} />
      </kbd>;
	}
	// Text-based keys
	const displayMap: Record<string, string> = {
		enter: "↵",
		esc: "Esc",
		escape: "Esc",
		backspace: "⌫",
		delete: "⌦",
		tab: "Tab",
		space: "Space"
	};
	const display = displayMap[lower] || keyName.toUpperCase();
	return <kbd class={baseClasses}>
      {display}
    </kbd>;
}
/**
* Shortcut item in the left list
*/
function ShortcutListItem({ action, config, isSelected, hasConflict, onClick, ctrlTabTarget }: {
	action: ShortcutAction;
	config: CustomHotkeysConfig;
	isSelected: boolean;
	hasConflict: boolean;
	onClick: () => void;
	ctrlTabTarget: "workspaces" | "agents";
}) {
	const isCustom = isCustomHotkey(action.id, config);
	let currentHotkey = getResolvedHotkey(action.id, config);
	// Handle dynamic shortcuts for ctrl+tab
	if (action.isDynamic && !isCustom) {
		if (action.id === "quick-switch-workspaces") {
			currentHotkey = ctrlTabTarget === "workspaces" ? "ctrl+tab" : "opt+ctrl+tab";
		} else if (action.id === "quick-switch-agents") {
			currentHotkey = ctrlTabTarget === "workspaces" ? "opt+ctrl+tab" : "ctrl+tab";
		}
	}
	const keys = currentHotkey ? hotkeyStringToKeys(currentHotkey) : [];
	return <button type="button" onClick={onClick} class={cn("w-full flex items-center justify-between px-3 py-2 rounded-md text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50", isSelected ? "bg-secondary text-foreground" : "hover:bg-secondary/50", hasConflict && !isSelected && "bg-red-500/10")}>
      <span class="text-sm truncate">
        {action.label}
      </span>
      <div class="flex items-center gap-0.5 ml-2 flex-shrink-0">
        {keys.map((key, index) => <ShortcutKey key={index} keyName={key} size="sm" />)}
      </div>
    </button>;
}
/**
* Right panel showing selected shortcut details
*/
function ShortcutDetailPanel({ action, config, isRecording, onStartRecording, onRecord, onCancel, onReset, ctrlTabTarget, conflictMessage }: {
	action: ShortcutAction;
	config: CustomHotkeysConfig;
	isRecording: boolean;
	onStartRecording: () => void;
	onRecord: (hotkey: string) => void;
	onCancel: () => void;
	onReset: () => void;
	ctrlTabTarget: "workspaces" | "agents";
	conflictMessage: string | null;
}) {
	const isCustom = isCustomHotkey(action.id, config);
	let currentHotkey = getResolvedHotkey(action.id, config);
	let recorderButtonRef: HTMLButtonElement | undefined;
	// Handle dynamic shortcuts for ctrl+tab
	if (action.isDynamic && !isCustom) {
		if (action.id === "quick-switch-workspaces") {
			currentHotkey = ctrlTabTarget === "workspaces" ? "ctrl+tab" : "opt+ctrl+tab";
		} else if (action.id === "quick-switch-agents") {
			currentHotkey = ctrlTabTarget === "workspaces" ? "opt+ctrl+tab" : "ctrl+tab";
		}
	}
	const keys = currentHotkey ? hotkeyStringToKeys(currentHotkey) : [];
	const defaultAction = getShortcutAction(action.id);
	const defaultKeys = defaultAction?.defaultKeys || [];
	const { currentKeys } = useHotkeyRecorder({
		onRecord,
		onCancel,
		isRecording
	});
	// Click outside to cancel recording
	createEffect(() => {
		if (!isRecording) return;
		const handleClickOutside = (e: MouseEvent) => {
			if (recorderButtonRef && !recorderButtonRef.contains(e.target as Node)) {
				onCancel();
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		onCleanup(() => document.removeEventListener("mousedown", handleClickOutside));
	});
	return <div class="flex flex-col items-center justify-center h-full p-8">
      {	/* Title */}
      <h3 class="text-base font-medium text-foreground mb-1">{action.label}</h3>
      <p class="text-sm text-muted-foreground mb-8">
        {action.isDynamic ? action.dynamicDescription : `${CATEGORY_LABELS[action.category]} shortcut`}
      </p>

      { /* Hotkey display / recorder */}
      <button ref={el => recorderButtonRef = el} type="button" onClick={onStartRecording} class={cn("flex items-center justify-center gap-1 px-6 py-3 h-[52px] rounded-lg border-2 transition-shadow", isRecording ? "border-primary bg-secondary ring-[3px] ring-primary/20" : conflictMessage ? "border-red-500 bg-red-500/10" : "border-border bg-background hover:border-muted-foreground/50 hover:bg-secondary/50")}>
        {(() => {
 // During recording, show currentKeys or "Press keys..."
		if (isRecording) {
			if (currentKeys.length > 0) {
				return <div class="flex items-center gap-1">
                  {currentKeys.map((key, index) => <ShortcutKey key={index} keyName={key} size="lg" />)}
                </div>;
			}
			return <span class="text-sm text-muted-foreground animate-pulse">
                Press keys...
              </span>;
		}
		// Not recording - always show saved keys (they update immediately now)
		if (keys.length > 0) {
			return <div class="flex items-center gap-1">
                {keys.map((key, index) => <ShortcutKey key={index} keyName={key} size="lg" />)}
              </div>;
		}
		return <span class="text-sm text-muted-foreground">Not set</span>;
	})()}
      </button>

      {	/* Conflict warning - shown temporarily when trying to set conflicting hotkey */}
      {conflictMessage && <p class="text-xs text-red-500 mt-3 animate-pulse">
          {conflictMessage}
        </p>}

      { /* Reset to default / Instructions - always reserve space to prevent layout shift */}
      <div class="mt-6 h-8 flex items-center justify-center">
        {isCustom ? <button type="button" onClick={onReset} class="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground bg-secondary/50 hover:bg-secondary border border-border rounded-lg transition-colors">
            <RotateCcw class="h-3 w-3" />
            <span>Reset to</span>
            <div class="flex items-center gap-0.5">
              {defaultKeys.map((key, index) => <ShortcutKey key={index} keyName={key} size="sm" />)}
            </div>
          </button> : <p class="text-xs text-muted-foreground text-center">
            Click to record a new shortcut
          </p>}
      </div>
    </div>;
 }
/**
* Empty state when no shortcut is selected
*/
function EmptyDetailPanel() {
	return <div class="flex flex-col items-center justify-center h-full p-8 text-center">
      <Settings2 class="h-10 w-10 text-muted-foreground/20 mb-3" />
      <p class="text-sm text-muted-foreground">
        Select a shortcut to customize
      </p>
    </div>;
}
/**
* Main keyboard settings tab component
*/
export function AgentsKeyboardTab() {
	const [customHotkeys, setCustomHotkeys] = useAtom(customHotkeysAtom);
	const [ctrlTabTarget] = useAtom(ctrlTabTargetAtom);
	const betaKanbanEnabled = useAtomValue(betaKanbanEnabledAtom);
	// Default to first shortcut
	const [selectedActionId, setSelectedActionId] = createSignal("show-shortcuts");
	const [isRecording, setIsRecording] = createSignal(false);
	const [searchQuery, setSearchQuery] = createSignal("");
	const [conflictMessage, setConflictMessage] = createSignal(null);
	// Get shortcuts by category, filtering out disabled features
	const shortcutsByCategory = createMemo(() => {
		const all = getShortcutsByCategory();
		// Filter out kanban shortcut if feature is disabled
		if (!betaKanbanEnabled) {
			return {
				...all,
				workspaces: all.workspaces.filter((action) => action.id !== "open-kanban")
			};
		}
		return all;
	});
	// Detect conflicts
	const conflicts = createMemo(() => detectConflicts(customHotkeys));
	// Filter shortcuts by search query
	const filteredShortcuts = createMemo(() => {
		if (!searchQuery.trim()) {
			return shortcutsByCategory;
		}
		const query = searchQuery.toLowerCase();
		const result: Record<ShortcutCategory, ShortcutAction[]> = {
			general: [],
			workspaces: [],
			agents: []
		};
		for (const category of Object.keys(shortcutsByCategory) as ShortcutCategory[]) {
			result[category] = shortcutsByCategory[category].filter((action) => action.label.toLowerCase().includes(query));
		}
		return result;
	});
	// Get selected action
	const selectedAction = createMemo(() => selectedActionId ? getShortcutAction(selectedActionId) : null);
	// Has any custom hotkeys
	const hasCustomHotkeys = createMemo(() => Object.keys(customHotkeys.bindings).length > 0);
	// Start recording
	const handleStartRecording = () => {
		setIsRecording(true);
	};
	// Cancel recording
	const handleCancel = () => {
		setIsRecording(false);
	};
	// Check if a hotkey would conflict with another action
	const checkConflict = (hotkey: string, currentActionId: ShortcutActionId): ShortcutAction | null => {
		const normalizedNew = normalizeHotkey(hotkey);
		for (const action of ALL_SHORTCUT_ACTIONS) {
			if (action.id === currentActionId) continue;
			const existingHotkey = getResolvedHotkey(action.id, customHotkeys);
			if (existingHotkey && normalizeHotkey(existingHotkey) === normalizedNew) {
				return action;
			}
		}
		return null;
	};
	// Record a hotkey
	const handleRecord = (hotkey: string) => {
		if (!selectedActionId) return;
		// Check for conflicts
		const conflictingAction = checkConflict(hotkey, selectedActionId);
		if (conflictingAction) {
			// Show conflict message and don't save
			setConflictMessage(`"${conflictingAction.label}" already uses this shortcut`);
			setIsRecording(false);
			// Clear message after 2 seconds
			setTimeout(() => {
				setConflictMessage(null);
			}, 2e3);
			return;
		}
		// No conflict, save the hotkey then exit recording mode
		setCustomHotkeys((prev) => ({
			...prev,
			bindings: {
				...prev.bindings,
				[selectedActionId]: hotkey
			}
		}));
		setConflictMessage(null);
		// Delay to let atom update propagate before exiting recording mode
		setTimeout(() => {
			setIsRecording(false);
		}, 50);
	};
	// Reset selected hotkey to default
	const handleReset = () => {
		if (!selectedActionId) return;
		setCustomHotkeys((prev) => {
			const { [selectedActionId]: _, ...rest } = prev.bindings;
			return {
				...prev,
				bindings: rest
			};
		});
	};
	// Reset all hotkeys to defaults
	const handleResetAll = () => {
		setCustomHotkeys({
			version: 1,
			bindings: {}
		});
	};
	// Count total shortcuts
	const totalShortcuts = createMemo(() => {
		return Object.values(filteredShortcuts).reduce((sum, arr) => sum + arr.length, 0);
	});
	return <div class="flex flex-col h-full">
      {	/* Two-column layout */}
      <div class="flex flex-1 min-h-0 gap-3 p-3">
        { /* Left panel - shortcuts list */}
        <div class="w-[280px] flex flex-col flex-shrink-0">
          { /* Search */}
          <div class="pb-2 px-1 flex-shrink-0">
            <div class="relative">
              <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none z-10" />
              <input type="text" placeholder="Search shortcuts..." value={searchQuery} onInput={(e) => setSearchQuery(e.currentTarget.value)} class="w-full h-8 pl-8 pr-3 text-sm bg-background border border-input rounded-lg placeholder:text-muted-foreground/70 transition-shadow focus-visible:border-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/20" />
            </div>
          </div>

          { /* Shortcuts list - padding to prevent focus ring clipping */}
          <div class="flex-1 min-h-0 overflow-y-auto p-1">
            {totalShortcuts === 0 ? <div class="text-center py-8 text-sm text-muted-foreground">
                No shortcuts found
              </div> : <div class="space-y-4">
                {([
 "general",
		"workspaces",
		"agents"
	] as ShortcutCategory[]).map((category) => {
		const actions = filteredShortcuts[category];
		if (actions.length === 0) return null;
		return <div key={category}>
                      <h4 class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1">
                        {CATEGORY_LABELS[category]}
                      </h4>
                      <div class="space-y-0.5">
                        {actions.map((action) => <ShortcutListItem key={action.id} action={action} config={customHotkeys} isSelected={selectedActionId === action.id} hasConflict={!!conflicts.get(action.id)} onClick={() => {
			setSelectedActionId(action.id);
			setIsRecording(false);
		}} ctrlTabTarget={ctrlTabTarget} />)}
                      </div>
                    </div>;
	})}
              </div>}
          </div>

          {	/* Reset all button at bottom */}
          {hasCustomHotkeys && <div class="pt-2 flex-shrink-0">
              <button type="button" onClick={handleResetAll} class="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <RotateCcw class="h-3 w-3" />
                Reset all to defaults
              </button>
            </div>}
        </div>

        { /* Right panel - shortcut details */}
        <div class="flex-1 bg-secondary/30 rounded-xl overflow-hidden">
          {selectedAction ? <ShortcutDetailPanel action={selectedAction} config={customHotkeys} isRecording={isRecording} onStartRecording={handleStartRecording} onRecord={handleRecord} onCancel={handleCancel} onReset={handleReset} ctrlTabTarget={ctrlTabTarget} conflictMessage={conflictMessage} /> : <EmptyDetailPanel />}
        </div>
      </div>
    </div>;
 }
