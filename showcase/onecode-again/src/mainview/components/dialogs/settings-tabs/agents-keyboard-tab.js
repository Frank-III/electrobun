"use client";
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentsKeyboardTab = AgentsKeyboardTab;
var solid_js_1 = require("solid-js");
var jotai_1 = require("../../../lib/state/jotai");
var lucide_solid_1 = require("lucide-solid");
var utils_1 = require("../../../lib/utils");
var icons_1 = require("../../ui/icons");
var atoms_1 = require("../../../lib/atoms");
var hotkeys_1 = require("../../../lib/hotkeys");
var use_hotkey_recorder_1 = require("../../../lib/hotkeys/use-hotkey-recorder");
/**
* Display a single key in a keyboard shortcut
*/
function ShortcutKey(_a) {
    var keyName = _a.keyName, _b = _a.size, size = _b === void 0 ? "md" : _b, _c = _a.isSelected, isSelected = _c === void 0 ? false : _c;
    var sizeClasses = {
        sm: "h-5 min-w-5 text-[10px] px-1",
        md: "h-6 min-w-6 text-xs px-1.5",
        lg: "h-8 min-w-8 text-sm px-2"
    };
    var iconSizes = {
        sm: "h-2.5 w-2.5",
        md: "h-3 w-3",
        lg: "h-4 w-4"
    };
    var baseClasses = (0, utils_1.cn)("inline-flex items-center justify-center rounded border font-[inherit] font-normal", sizeClasses[size], isSelected ? "bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30" : "bg-secondary text-secondary-foreground border-muted");
    var lower = keyName.toLowerCase();
    // Modifier keys with icons
    if (lower === "cmd" || lower === "meta") {
        return <kbd class={baseClasses}>
        <icons_1.CmdIcon class={iconSizes[size]}/>
      </kbd>;
    }
    if (lower === "opt" || lower === "alt") {
        return <kbd class={baseClasses}>
        <icons_1.OptionIcon class={iconSizes[size]}/>
      </kbd>;
    }
    if (lower === "shift") {
        return <kbd class={baseClasses}>
        <icons_1.ShiftIcon class={iconSizes[size]}/>
      </kbd>;
    }
    if (lower === "ctrl") {
        return <kbd class={baseClasses}>
        <icons_1.ControlIcon class={iconSizes[size]}/>
      </kbd>;
    }
    // Text-based keys
    var displayMap = {
        enter: "↵",
        esc: "Esc",
        escape: "Esc",
        backspace: "⌫",
        delete: "⌦",
        tab: "Tab",
        space: "Space"
    };
    var display = displayMap[lower] || keyName.toUpperCase();
    return <kbd class={baseClasses}>
      {display}
    </kbd>;
}
/**
* Shortcut item in the left list
*/
function ShortcutListItem(_a) {
    var action = _a.action, config = _a.config, isSelected = _a.isSelected, hasConflict = _a.hasConflict, onClick = _a.onClick, ctrlTabTarget = _a.ctrlTabTarget;
    var isCustom = (0, hotkeys_1.isCustomHotkey)(action.id, config);
    var currentHotkey = (0, hotkeys_1.getResolvedHotkey)(action.id, config);
    // Handle dynamic shortcuts for ctrl+tab
    if (action.isDynamic && !isCustom) {
        if (action.id === "quick-switch-workspaces") {
            currentHotkey = ctrlTabTarget === "workspaces" ? "ctrl+tab" : "opt+ctrl+tab";
        }
        else if (action.id === "quick-switch-agents") {
            currentHotkey = ctrlTabTarget === "workspaces" ? "opt+ctrl+tab" : "ctrl+tab";
        }
    }
    var keys = currentHotkey ? (0, hotkeys_1.hotkeyStringToKeys)(currentHotkey) : [];
    return <button type="button" onClick={onClick} class={(0, utils_1.cn)("w-full flex items-center justify-between px-3 py-2 rounded-md text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50", isSelected ? "bg-secondary text-foreground" : "hover:bg-secondary/50", hasConflict && !isSelected && "bg-red-500/10")}>
      <span class="text-sm truncate">
        {action.label}
      </span>
      <div class="flex items-center gap-0.5 ml-2 flex-shrink-0">
        {keys.map(function (key, index) { return <ShortcutKey key={index} keyName={key} size="sm"/>; })}
      </div>
    </button>;
}
/**
* Right panel showing selected shortcut details
*/
function ShortcutDetailPanel(_a) {
    var action = _a.action, config = _a.config, isRecording = _a.isRecording, onStartRecording = _a.onStartRecording, onRecord = _a.onRecord, onCancel = _a.onCancel, onReset = _a.onReset, ctrlTabTarget = _a.ctrlTabTarget, conflictMessage = _a.conflictMessage;
    var isCustom = (0, hotkeys_1.isCustomHotkey)(action.id, config);
    var currentHotkey = (0, hotkeys_1.getResolvedHotkey)(action.id, config);
    var _b = (0, solid_js_1.createSignal)(null), recorderButtonRef = _b[0], setRecorderButtonRef = _b[1];
    // Handle dynamic shortcuts for ctrl+tab
    if (action.isDynamic && !isCustom) {
        if (action.id === "quick-switch-workspaces") {
            currentHotkey = ctrlTabTarget === "workspaces" ? "ctrl+tab" : "opt+ctrl+tab";
        }
        else if (action.id === "quick-switch-agents") {
            currentHotkey = ctrlTabTarget === "workspaces" ? "opt+ctrl+tab" : "ctrl+tab";
        }
    }
    var keys = currentHotkey ? (0, hotkeys_1.hotkeyStringToKeys)(currentHotkey) : [];
    var defaultAction = (0, hotkeys_1.getShortcutAction)(action.id);
    var defaultKeys = (defaultAction === null || defaultAction === void 0 ? void 0 : defaultAction.defaultKeys) || [];
    var currentKeys = (0, use_hotkey_recorder_1.useHotkeyRecorder)({
        onRecord: onRecord,
        onCancel: onCancel,
        isRecording: isRecording
    }).currentKeys;
    // Click outside to cancel recording
    (0, solid_js_1.createEffect)(function () {
        if (!isRecording)
            return;
        var handleClickOutside = function (e) {
            if (recorderButtonRef.current && !recorderButtonRef.current.contains(e.target)) {
                onCancel();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return function () { return document.removeEventListener("mousedown", handleClickOutside); };
    });
    return <div class="flex flex-col items-center justify-center h-full p-8">
      {/* Title */}
      <h3 class="text-base font-medium text-foreground mb-1">{action.label}</h3>
      <p class="text-sm text-muted-foreground mb-8">
        {action.isDynamic ? action.dynamicDescription : "".concat(hotkeys_1.CATEGORY_LABELS[action.category], " shortcut")}
      </p>

      {/* Hotkey display / recorder */}
      <button ref={recorderButtonRef} type="button" onClick={onStartRecording} class={(0, utils_1.cn)("flex items-center justify-center gap-1 px-6 py-3 h-[52px] rounded-lg border-2 transition-shadow", isRecording ? "border-primary bg-secondary ring-[3px] ring-primary/20" : conflictMessage ? "border-red-500 bg-red-500/10" : "border-border bg-background hover:border-muted-foreground/50 hover:bg-secondary/50")}>
        {(function () {
            // During recording, show currentKeys or "Press keys..."
            if (isRecording) {
                if (currentKeys.length > 0) {
                    return <div class="flex items-center gap-1">
                  {currentKeys.map(function (key, index) { return <ShortcutKey key={index} keyName={key} size="lg"/>; })}
                </div>;
                }
                return <span class="text-sm text-muted-foreground animate-pulse">
                Press keys...
              </span>;
            }
            // Not recording - always show saved keys (they update immediately now)
            if (keys.length > 0) {
                return <div class="flex items-center gap-1">
                {keys.map(function (key, index) { return <ShortcutKey key={index} keyName={key} size="lg"/>; })}
              </div>;
            }
            return <span class="text-sm text-muted-foreground">Not set</span>;
        })()}
      </button>

      {/* Conflict warning - shown temporarily when trying to set conflicting hotkey */}
      {conflictMessage && <p class="text-xs text-red-500 mt-3 animate-pulse">
          {conflictMessage}
        </p>}

      {/* Reset to default / Instructions - always reserve space to prevent layout shift */}
      <div class="mt-6 h-8 flex items-center justify-center">
        {isCustom ? <button type="button" onClick={onReset} class="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground bg-secondary/50 hover:bg-secondary border border-border rounded-lg transition-colors">
            <lucide_solid_1.RotateCcw class="h-3 w-3"/>
            <span>Reset to</span>
            <div class="flex items-center gap-0.5">
              {defaultKeys.map(function (key, index) { return <ShortcutKey key={index} keyName={key} size="sm"/>; })}
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
      <lucide_solid_1.Settings2 class="h-10 w-10 text-muted-foreground/20 mb-3"/>
      <p class="text-sm text-muted-foreground">
        Select a shortcut to customize
      </p>
    </div>;
}
/**
* Main keyboard settings tab component
*/
function AgentsKeyboardTab() {
    var _a = (0, jotai_1.useAtom)(atoms_1.customHotkeysAtom), customHotkeys = _a[0], setCustomHotkeys = _a[1];
    var ctrlTabTarget = (0, jotai_1.useAtom)(atoms_1.ctrlTabTargetAtom)[0];
    var betaKanbanEnabled = (0, jotai_1.useAtomValue)(atoms_1.betaKanbanEnabledAtom);
    // Default to first shortcut
    var _b = (0, solid_js_1.createSignal)("show-shortcuts"), selectedActionId = _b[0], setSelectedActionId = _b[1];
    var _c = (0, solid_js_1.createSignal)(false), isRecording = _c[0], setIsRecording = _c[1];
    var _d = (0, solid_js_1.createSignal)(""), searchQuery = _d[0], setSearchQuery = _d[1];
    var _e = (0, solid_js_1.createSignal)(null), conflictMessage = _e[0], setConflictMessage = _e[1];
    // Get shortcuts by category, filtering out disabled features
    var shortcutsByCategory = (0, solid_js_1.createMemo)(function () {
        var all = (0, hotkeys_1.getShortcutsByCategory)();
        // Filter out kanban shortcut if feature is disabled
        if (!betaKanbanEnabled) {
            return __assign(__assign({}, all), { workspaces: all.workspaces.filter(function (action) { return action.id !== "open-kanban"; }) });
        }
        return all;
    });
    // Detect conflicts
    var conflicts = (0, solid_js_1.createMemo)(function () { return (0, hotkeys_1.detectConflicts)(customHotkeys); });
    // Filter shortcuts by search query
    var filteredShortcuts = (0, solid_js_1.createMemo)(function () {
        if (!searchQuery.trim()) {
            return shortcutsByCategory;
        }
        var query = searchQuery.toLowerCase();
        var result = {
            general: [],
            workspaces: [],
            agents: []
        };
        for (var _i = 0, _a = Object.keys(shortcutsByCategory); _i < _a.length; _i++) {
            var category = _a[_i];
            result[category] = shortcutsByCategory[category].filter(function (action) { return action.label.toLowerCase().includes(query); });
        }
        return result;
    });
    // Get selected action
    var selectedAction = (0, solid_js_1.createMemo)(function () { return selectedActionId ? (0, hotkeys_1.getShortcutAction)(selectedActionId) : null; });
    // Has any custom hotkeys
    var hasCustomHotkeys = (0, solid_js_1.createMemo)(function () { return Object.keys(customHotkeys.bindings).length > 0; });
    // Start recording
    var handleStartRecording = function () {
        setIsRecording(true);
    };
    // Cancel recording
    var handleCancel = function () {
        setIsRecording(false);
    };
    // Check if a hotkey would conflict with another action
    var checkConflict = function (hotkey, currentActionId) {
        var normalizedNew = (0, hotkeys_1.normalizeHotkey)(hotkey);
        for (var _i = 0, ALL_SHORTCUT_ACTIONS_1 = hotkeys_1.ALL_SHORTCUT_ACTIONS; _i < ALL_SHORTCUT_ACTIONS_1.length; _i++) {
            var action = ALL_SHORTCUT_ACTIONS_1[_i];
            if (action.id === currentActionId)
                continue;
            var existingHotkey = (0, hotkeys_1.getResolvedHotkey)(action.id, customHotkeys);
            if (existingHotkey && (0, hotkeys_1.normalizeHotkey)(existingHotkey) === normalizedNew) {
                return action;
            }
        }
        return null;
    };
    // Record a hotkey
    var handleRecord = function (hotkey) {
        if (!selectedActionId)
            return;
        // Check for conflicts
        var conflictingAction = checkConflict(hotkey, selectedActionId);
        if (conflictingAction) {
            // Show conflict message and don't save
            setConflictMessage("\"".concat(conflictingAction.label, "\" already uses this shortcut"));
            setIsRecording(false);
            // Clear message after 2 seconds
            setTimeout(function () {
                setConflictMessage(null);
            }, 2e3);
            return;
        }
        // No conflict, save the hotkey then exit recording mode
        setCustomHotkeys(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), { bindings: __assign(__assign({}, prev.bindings), (_a = {}, _a[selectedActionId] = hotkey, _a)) }));
        });
        setConflictMessage(null);
        // Delay to let atom update propagate before exiting recording mode
        setTimeout(function () {
            setIsRecording(false);
        }, 50);
    };
    // Reset selected hotkey to default
    var handleReset = function () {
        if (!selectedActionId)
            return;
        setCustomHotkeys(function (prev) {
            var _a = prev.bindings, _b = selectedActionId, _ = _a[_b], rest = __rest(_a, [typeof _b === "symbol" ? _b : _b + ""]);
            return __assign(__assign({}, prev), { bindings: rest });
        });
    };
    // Reset all hotkeys to defaults
    var handleResetAll = function () {
        setCustomHotkeys({
            version: 1,
            bindings: {}
        });
    };
    // Count total shortcuts
    var totalShortcuts = (0, solid_js_1.createMemo)(function () {
        return Object.values(filteredShortcuts).reduce(function (sum, arr) { return sum + arr.length; }, 0);
    });
    return <div class="flex flex-col h-full">
      {/* Two-column layout */}
      <div class="flex flex-1 min-h-0 gap-3 p-3">
        {/* Left panel - shortcuts list */}
        <div class="w-[280px] flex flex-col flex-shrink-0">
          {/* Search */}
          <div class="pb-2 px-1 flex-shrink-0">
            <div class="relative">
              <lucide_solid_1.Search class="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none z-10"/>
              <input type="text" placeholder="Search shortcuts..." value={searchQuery} onChange={function (e) { return setSearchQuery(e.target.value); }} class="w-full h-8 pl-8 pr-3 text-sm bg-background border border-input rounded-lg placeholder:text-muted-foreground/70 transition-shadow focus-visible:border-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/20"/>
            </div>
          </div>

          {/* Shortcuts list - padding to prevent focus ring clipping */}
          <div class="flex-1 min-h-0 overflow-y-auto p-1">
            {totalShortcuts === 0 ? <div class="text-center py-8 text-sm text-muted-foreground">
                No shortcuts found
              </div> : <div class="space-y-4">
                {[
                "general",
                "workspaces",
                "agents"
            ].map(function (category) {
                var actions = filteredShortcuts[category];
                if (actions.length === 0)
                    return null;
                return <div key={category}>
                      <h4 class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1">
                        {hotkeys_1.CATEGORY_LABELS[category]}
                      </h4>
                      <div class="space-y-0.5">
                        {actions.map(function (action) { return <ShortcutListItem key={action.id} action={action} config={customHotkeys} isSelected={selectedActionId === action.id} hasConflict={!!conflicts.get(action.id)} onClick={function () {
                            setSelectedActionId(action.id);
                            setIsRecording(false);
                        }} ctrlTabTarget={ctrlTabTarget}/>; })}
                      </div>
                    </div>;
            })}
              </div>}
          </div>

          {/* Reset all button at bottom */}
          {hasCustomHotkeys && <div class="pt-2 flex-shrink-0">
              <button type="button" onClick={handleResetAll} class="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <lucide_solid_1.RotateCcw class="h-3 w-3"/>
                Reset all to defaults
              </button>
            </div>}
        </div>

        {/* Right panel - shortcut details */}
        <div class="flex-1 bg-secondary/30 rounded-xl overflow-hidden">
          {selectedAction ? <ShortcutDetailPanel action={selectedAction} config={customHotkeys} isRecording={isRecording} onStartRecording={handleStartRecording} onRecord={handleRecord} onCancel={handleCancel} onReset={handleReset} ctrlTabTarget={ctrlTabTarget} conflictMessage={conflictMessage}/> : <EmptyDetailPanel />}
        </div>
      </div>
    </div>;
}
