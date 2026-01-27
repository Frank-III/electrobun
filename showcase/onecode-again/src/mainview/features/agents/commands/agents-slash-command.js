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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentsSlashCommand = void 0;
var utils_1 = require("../../../lib/utils");
var trpc_1 = require("../../../lib/trpc");
var solid_js_1 = require("solid-js");
var web_1 = require("solid-js/web");
var icons_1 = require("../../../components/ui/icons");
var builtin_commands_1 = require("./builtin-commands");
// Memoized to prevent re-renders when parent re-renders
exports.AgentsSlashCommand = memo(function AgentsSlashCommand(_a) {
    var _this = this;
    var isOpen = _a.isOpen, onClose = _a.onClose, onSelect = _a.onSelect, searchText = _a.searchText, position = _a.position, projectPath = _a.projectPath, mode = _a.mode, disabledCommands = _a.disabledCommands;
    var _b = (0, solid_js_1.createSignal)(null), dropdownRef = _b[0], setDropdownRef = _b[1];
    var _c = (0, solid_js_1.createSignal)(0), selectedIndex = _c[0], setSelectedIndex = _c[1];
    var _d = (0, solid_js_1.createSignal)(null), placementRef = _d[0], setPlacementRef = _d[1];
    var _e = (0, solid_js_1.createSignal)(searchText), debouncedSearchText = _e[0], setDebouncedSearchText = _e[1];
    // Debounce search text (300ms to match file mention)
    (0, solid_js_1.createEffect)(function () {
        var timer = setTimeout(function () {
            setDebouncedSearchText(searchText);
        }, 300);
        return function () { return clearTimeout(timer); };
    });
    // Fetch custom commands from filesystem
    var _f = trpc_1.trpc.commands.list.useQuery({ projectPath: projectPath }, {
        enabled: isOpen,
        staleTime: 3e4,
        refetchOnWindowFocus: false
    }), _g = _f.data, fileCommands = _g === void 0 ? [] : _g, isLoading = _f.isLoading;
    // Transform FileCommand to SlashCommandOption
    var customCommands = (0, solid_js_1.createMemo)(function () {
        return fileCommands.map(function (cmd) { return ({
            id: "custom:".concat(cmd.source, ":").concat(cmd.name),
            name: cmd.name,
            command: "/".concat(cmd.name),
            description: cmd.description || "Custom command from ".concat(cmd.source),
            category: "repository",
            path: cmd.path,
            argumentHint: cmd.argumentHint
        }); });
    });
    // State for loading command content
    var _h = (0, solid_js_1.createSignal)(false), isLoadingContent = _h[0], setIsLoadingContent = _h[1];
    // tRPC utils for fetching command content
    var trpcUtils = trpc_1.trpc.useUtils();
    // Handle command selection - fetch content for custom commands
    var handleSelect = function (option) { return __awaiter(_this, void 0, void 0, function () {
        var result, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // For builtin commands, call onSelect directly
                    if (option.category === "builtin") {
                        onSelect(option);
                        return [2 /*return*/];
                    }
                    if (!option.path) return [3 /*break*/, 6];
                    setIsLoadingContent(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, trpcUtils.commands.getContent.fetch({ path: option.path })];
                case 2:
                    result = _a.sent();
                    // Call onSelect with the fetched prompt
                    onSelect(__assign(__assign({}, option), { prompt: result.content }));
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    console.error("Failed to fetch slash command content:", error_1);
                    // Still close the dropdown even on error
                    onClose();
                    return [3 /*break*/, 5];
                case 4:
                    setIsLoadingContent(false);
                    return [7 /*endfinally*/];
                case 5: return [3 /*break*/, 7];
                case 6:
                    // Fallback - just call onSelect without prompt
                    onSelect(option);
                    _a.label = 7;
                case 7: return [2 /*return*/];
            }
        });
    }); };
    // Combine builtin and repository commands, filtered by search
    var options = (0, solid_js_1.createMemo)(function () {
        var builtinFiltered = (0, builtin_commands_1.filterBuiltinCommands)(debouncedSearchText);
        // Hide /plan when already in Plan mode, hide /agent when already in Agent mode
        if (mode !== undefined) {
            builtinFiltered = builtinFiltered.filter(function (cmd) {
                if (mode === "plan" && cmd.name === "plan")
                    return false;
                if (mode === "agent" && cmd.name === "agent")
                    return false;
                return true;
            });
        }
        // Filter out disabled commands
        if (disabledCommands === null || disabledCommands === void 0 ? void 0 : disabledCommands.length) {
            builtinFiltered = builtinFiltered.filter(function (cmd) { return !disabledCommands.includes(cmd.name); });
        }
        // Filter custom commands by search
        var customFiltered = customCommands;
        if (debouncedSearchText) {
            var query_1 = debouncedSearchText.toLowerCase();
            customFiltered = customCommands.filter(function (cmd) { return cmd.name.toLowerCase().includes(query_1) || cmd.command.toLowerCase().includes(query_1); });
        }
        // Sort all commands by name length (shorter = closer match), then alphabetically for stability
        return __spreadArray(__spreadArray([], customFiltered, true), builtinFiltered, true).sort(function (a, b) { return a.name.length - b.name.length || a.name.localeCompare(b.name); });
    });
    // Track previous values for smarter selection reset
    var _j = (0, solid_js_1.createSignal)(isOpen), prevIsOpenRef = _j[0], setPrevIsOpenRef = _j[1];
    var _k = (0, solid_js_1.createSignal)(debouncedSearchText), prevSearchRef = _k[0], setPrevSearchRef = _k[1];
    // CONSOLIDATED: Single useLayoutEffect for selection management
    (0, solid_js_1.createEffect)(function () {
        var didJustOpen = isOpen && !prevIsOpenRef.current;
        var didSearchChange = debouncedSearchText !== prevSearchRef.current;
        // Reset to 0 when opening or search changes
        if (didJustOpen || didSearchChange) {
            setSelectedIndex(0);
        }
        else if (options.length > 0 && selectedIndex >= options.length) {
            setSelectedIndex(Math.max(0, options.length - 1));
        }
        // Update refs
        prevIsOpenRef.current = isOpen;
        prevSearchRef.current = debouncedSearchText;
    });
    // Reset placement when closed
    (0, solid_js_1.createEffect)(function () {
        if (!isOpen) {
            placementRef.current = null;
        }
    });
    // Keyboard navigation
    (0, solid_js_1.createEffect)(function () {
        if (!isOpen)
            return;
        var handleKeyDown = function (e) {
            switch (e.key) {
                case "ArrowDown":
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    // Guard against modulo by zero when no options
                    if (options.length > 0) {
                        setSelectedIndex(function (prev) { return (prev + 1) % options.length; });
                    }
                    break;
                case "ArrowUp":
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    // Guard against modulo by zero when no options
                    if (options.length > 0) {
                        setSelectedIndex(function (prev) { return (prev - 1 + options.length) % options.length; });
                    }
                    break;
                case "Enter":
                    if (e.shiftKey)
                        return;
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    if (options[selectedIndex]) {
                        handleSelect(options[selectedIndex]);
                    }
                    break;
                case "Escape":
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    onClose();
                    break;
                case "Tab":
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    if (options[selectedIndex]) {
                        handleSelect(options[selectedIndex]);
                    }
                    break;
            }
        };
        window.addEventListener("keydown", handleKeyDown, { capture: true });
        return function () { return window.removeEventListener("keydown", handleKeyDown, { capture: true }); };
    });
    // Auto-scroll selected item into view
    (0, solid_js_1.createEffect)(function () {
        if (!isOpen || !dropdownRef.current)
            return;
        if (selectedIndex === 0) {
            dropdownRef.current.scrollTo({
                top: 0,
                behavior: "auto"
            });
            return;
        }
        var elements = dropdownRef.current.querySelectorAll("[data-option-index]");
        var selectedElement = elements[selectedIndex];
        if (selectedElement) {
            selectedElement.scrollIntoView({ block: "nearest" });
        }
    });
    // Click outside
    (0, solid_js_1.createEffect)(function () {
        if (!isOpen)
            return;
        var handleClickOutside = function (e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return function () { return document.removeEventListener("mousedown", handleClickOutside); };
    });
    if (!isOpen)
        return null;
    // Calculate dropdown dimensions (matching file mention style)
    var dropdownWidth = 320;
    var itemHeight = 28;
    var headerHeight = 24;
    // Single "Commands" header for all options
    var headersCount = options.length > 0 ? 1 : 0;
    var requestedHeight = Math.min(options.length * itemHeight + headersCount * headerHeight + 8, 200);
    var gap = 8;
    // Decide placement like Radix Popover (auto-flip top/bottom)
    var safeMargin = 10;
    var caretOffsetBelow = 20;
    var availableBelow = window.innerHeight - (position.top + caretOffsetBelow) - safeMargin;
    var availableAbove = position.top - safeMargin;
    // Compute desired placement, but lock it for the duration of the open state
    if (placementRef.current === null) {
        var condition1 = availableAbove >= requestedHeight && availableBelow < requestedHeight;
        var condition2 = availableAbove > availableBelow && availableAbove >= requestedHeight;
        var shouldPlaceAbove = condition1 || condition2;
        placementRef.current = shouldPlaceAbove ? "above" : "below";
    }
    var placeAbove = placementRef.current === "above";
    // Compute final top based on placement
    var finalTop = placeAbove ? position.top - gap : position.top + gap + caretOffsetBelow;
    // Slight left bias to better align with '/'
    var leftOffset = -4;
    var finalLeft = position.left + leftOffset;
    // Adjust horizontal overflow
    if (finalLeft + dropdownWidth > window.innerWidth - safeMargin) {
        finalLeft = window.innerWidth - dropdownWidth - safeMargin;
    }
    if (finalLeft < safeMargin) {
        finalLeft = safeMargin;
    }
    // Compute actual maxHeight based on available space on the chosen side
    var computedMaxHeight = Math.max(80, Math.min(requestedHeight, placeAbove ? availableAbove - gap : availableBelow - gap));
    var transformY = placeAbove ? "translateY(-100%)" : "translateY(0)";
    return (0, web_1.createPortal)(<div ref={dropdownRef} class="fixed z-[99999] overflow-y-auto rounded-[10px] border border-border bg-popover py-1 text-xs text-popover-foreground shadow-lg dark [&::-webkit-scrollbar]:hidden" style={{
            top: finalTop,
            left: finalLeft,
            width: "".concat(dropdownWidth, "px"),
            maxHeight: "".concat(computedMaxHeight, "px"),
            transform: transformY,
            scrollbarWidth: "none",
            msOverflowStyle: "none"
        }}>
      {/* All commands in one section - custom first, then builtin */}
      {options.length > 0 && <>
          <div class="px-2.5 py-1.5 mx-1 text-xs font-medium text-muted-foreground">
            Commands
          </div>
          {options.map(function (option, index) {
                var isSelected = selectedIndex === index;
                return <div key={option.id} data-option-index={index} onMouseDown={function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSelect(option);
                    }} onMouseEnter={function () { return setSelectedIndex(index); }} class={(0, utils_1.cn)("group inline-flex w-[calc(100%-8px)] mx-1 items-center whitespace-nowrap outline-none", "h-7 px-1.5 justify-start text-xs rounded-md", "transition-colors cursor-pointer select-none", isSelected ? "dark:bg-neutral-800 bg-accent text-foreground" : "text-muted-foreground dark:hover:bg-neutral-800 hover:bg-accent hover:text-foreground")}>
                <span class="flex items-center gap-1 w-full min-w-0">
                  <span class="shrink-0 whitespace-nowrap font-medium">
                    {option.command}
                  </span>
                  <span class="text-muted-foreground flex-1 min-w-0 ml-2 overflow-hidden text-[10px] truncate">
                    {option.description}
                  </span>
                </span>
              </div>;
            })}
        </>}

      {/* Loading state for repository commands */}
      {isLoading && <div class="flex items-center gap-1.5 h-7 px-1.5 mx-1 text-xs text-muted-foreground">
          <icons_1.IconSpinner class="h-3.5 w-3.5"/>
          <span>Loading commands...</span>
        </div>}

      {/* Empty state */}
      {!isLoading && options.length === 0 && <div class="h-7 px-1.5 mx-1 flex items-center text-xs text-muted-foreground">
          {debouncedSearchText ? "No commands matching \"".concat(debouncedSearchText, "\"") : "No commands available"}
        </div>}
    </div>, document.body);
});
