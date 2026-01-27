"use strict";
/**
 * Shared styles for overlay components (Popover, Dropdown, Select, ContextMenu, Command)
 *
 * Design specs:
 * - Container: rounded-[10px], border, shadow, max-height viewport-aware
 * - Items: rounded-md (6px), gap-1.5, padding 5px 6px, margin 4px horizontal
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.overlayChevron = exports.overlayShortcut = exports.overlayLabel = exports.overlaySeparator = exports.overlayItemIndicator = exports.overlayCheckableItem = exports.overlaySubTrigger = exports.overlaySubTriggerOpen = exports.overlayItemWithIcon = exports.overlayItem = exports.overlayItemTransition = exports.overlayItemDisabled = exports.overlayItemHighlighted = exports.overlayItemFocus = exports.overlayItemHover = exports.overlayItemBase = exports.overlayContent = exports.overlaySlideIn = exports.overlayAnimation = exports.overlayMaxHeight = exports.overlayContentBase = void 0;
// =============================================================================
// Container Styles (Popover, Dropdown, Select, ContextMenu content)
// =============================================================================
/** Base container styles for all overlay content */
exports.overlayContentBase = "z-50 overflow-auto rounded-[10px] border border-border bg-popover text-sm text-popover-foreground shadow-lg";
/** Max height to stay within viewport */
exports.overlayMaxHeight = "max-h-[calc(100vh-32px)]";
/** Animation classes for overlay open/close */
exports.overlayAnimation = "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95";
/** Slide-in animation based on side */
exports.overlaySlideIn = "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2";
/** Combined container styles */
exports.overlayContent = "".concat(exports.overlayContentBase, " ").concat(exports.overlayMaxHeight, " ").concat(exports.overlayAnimation, " ").concat(exports.overlaySlideIn);
// =============================================================================
// Item Styles (DropdownMenuItem, SelectItem, CommandItem, ContextMenuItem)
// =============================================================================
/** Base item layout - margin creates spacing from container edges */
exports.overlayItemBase = "flex items-center gap-1.5 min-h-[32px] py-[5px] px-1.5 mx-1 rounded-md text-sm cursor-default select-none outline-none";
/** Item hover state */
exports.overlayItemHover = "dark:hover:bg-neutral-800 hover:bg-accent hover:text-foreground";
/** Item focus state (keyboard navigation) */
exports.overlayItemFocus = "focus:bg-accent dark:focus:bg-neutral-800 focus:text-accent-foreground";
/** Radix data-highlighted state (used by DropdownMenu, Select, ContextMenu) */
exports.overlayItemHighlighted = "data-[highlighted]:bg-accent dark:data-[highlighted]:bg-neutral-800 data-[highlighted]:text-accent-foreground";
/** Item disabled state */
exports.overlayItemDisabled = "data-[disabled]:pointer-events-none data-[disabled]:opacity-50";
/** Item transition */
exports.overlayItemTransition = "transition-colors";
/** Combined item styles */
exports.overlayItem = "".concat(exports.overlayItemBase, " ").concat(exports.overlayItemHover, " ").concat(exports.overlayItemFocus, " ").concat(exports.overlayItemHighlighted, " ").concat(exports.overlayItemDisabled, " ").concat(exports.overlayItemTransition);
/** Item with icon styles (includes svg handling) */
exports.overlayItemWithIcon = "".concat(exports.overlayItem, " [&_svg]:pointer-events-none [&_svg]:shrink-0");
// =============================================================================
// Sub-trigger Styles (for nested menus)
// =============================================================================
/** Sub-trigger open state */
exports.overlaySubTriggerOpen = "data-[state=open]:bg-accent dark:data-[state=open]:bg-neutral-800";
/** Combined sub-trigger styles */
exports.overlaySubTrigger = "".concat(exports.overlayItemWithIcon, " ").concat(exports.overlaySubTriggerOpen);
// =============================================================================
// Checkbox/Radio Item Styles
// =============================================================================
/** Checkbox/Radio item base (with left padding for indicator) */
exports.overlayCheckableItem = "relative flex items-center gap-1.5 min-h-[32px] py-[5px] pl-7 pr-1.5 mx-1 rounded-md text-sm cursor-default select-none outline-none transition-colors dark:hover:bg-neutral-800 hover:bg-accent hover:text-foreground focus:bg-accent dark:focus:bg-neutral-800 focus:text-accent-foreground data-[highlighted]:bg-accent dark:data-[highlighted]:bg-neutral-800 data-[highlighted]:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50";
/** Indicator container (positioned left) */
exports.overlayItemIndicator = "absolute left-2 flex h-3.5 w-3.5 items-center justify-center";
// =============================================================================
// Supporting Elements
// =============================================================================
/** Separator styles - full width with vertical margin */
exports.overlaySeparator = "my-1 h-px bg-border mx-1";
/** Label styles */
exports.overlayLabel = "px-2.5 py-1.5 mx-1 text-xs font-medium text-muted-foreground";
/** Shortcut styles */
exports.overlayShortcut = "ml-auto text-xs tracking-widest text-muted-foreground/60";
/** Chevron icon for sub-menus */
exports.overlayChevron = "ml-auto h-3.5 w-3.5 text-muted-foreground";
