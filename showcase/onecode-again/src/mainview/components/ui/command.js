"use strict";
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
exports.CommandSeparator = exports.CommandItem = exports.CommandGroup = exports.CommandEmpty = exports.CommandList = exports.CommandInput = exports.Command = void 0;
var React = require("solid-js");
var utils_1 = require("../../lib/utils");
var icons_1 = require("./icons");
var overlay_styles_1 = require("../../lib/overlay-styles");
var CommandContext = React.createContext(null);
var Command = React.forwardRef(function (_a, ref) {
    var className = _a.className, shouldFilter = _a.shouldFilter, value = _a.value, onValueChange = _a.onValueChange, children = _a.children, props = __rest(_a, ["className", "shouldFilter", "value", "onValueChange", "children"]);
    var _b = React.useState(null), selectedValue = _b[0], setSelectedValue = _b[1];
    var itemsRef = React.useRef(new Map());
    var orderedKeysRef = React.useRef([]);
    var registerItem = React.useCallback(function (value, element) {
        if (element) {
            itemsRef.current.set(value, element);
            // Keep track of order based on registration
            if (!orderedKeysRef.current.includes(value)) {
                orderedKeysRef.current.push(value);
            }
        }
        else {
            itemsRef.current.delete(value);
            orderedKeysRef.current = orderedKeysRef.current.filter(function (k) { return k !== value; });
        }
    }, []);
    var getItems = React.useCallback(function () { return itemsRef.current; }, []);
    var onSelect = React.useCallback(function (value) {
        var element = itemsRef.current.get(value);
        if (element) {
            element.click();
        }
    }, []);
    // Reset selection when items change
    React.useEffect(function () {
        var keys = orderedKeysRef.current;
        if (keys.length > 0 && !keys.includes(selectedValue || "")) {
            setSelectedValue(keys[0] || null);
        }
    });
    var handleKeyDown = React.useCallback(function (e) {
        var _a, _b, _c, _d;
        var keys = orderedKeysRef.current;
        var currentIndex = selectedValue ? keys.indexOf(selectedValue) : -1;
        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                if (keys.length > 0) {
                    var nextIndex = currentIndex + 1 >= keys.length ? 0 : currentIndex + 1;
                    var nextKey = keys[nextIndex];
                    setSelectedValue(nextKey);
                    (_a = itemsRef.current.get(nextKey)) === null || _a === void 0 ? void 0 : _a.scrollIntoView({ block: "nearest" });
                }
                break;
            case "ArrowUp":
                e.preventDefault();
                if (keys.length > 0) {
                    var prevIndex = currentIndex - 1 < 0 ? keys.length - 1 : currentIndex - 1;
                    var prevKey = keys[prevIndex];
                    setSelectedValue(prevKey);
                    (_b = itemsRef.current.get(prevKey)) === null || _b === void 0 ? void 0 : _b.scrollIntoView({ block: "nearest" });
                }
                break;
            case "Enter":
                e.preventDefault();
                if (selectedValue) {
                    onSelect(selectedValue);
                }
                break;
            case "Home":
                e.preventDefault();
                if (keys.length > 0) {
                    setSelectedValue(keys[0]);
                    (_c = itemsRef.current.get(keys[0])) === null || _c === void 0 ? void 0 : _c.scrollIntoView({ block: "nearest" });
                }
                break;
            case "End":
                e.preventDefault();
                if (keys.length > 0) {
                    var lastKey = keys[keys.length - 1];
                    setSelectedValue(lastKey);
                    (_d = itemsRef.current.get(lastKey)) === null || _d === void 0 ? void 0 : _d.scrollIntoView({ block: "nearest" });
                }
                break;
        }
    }, [selectedValue, onSelect]);
    var contextValue = React.useMemo(function () { return ({
        selectedValue: selectedValue,
        setSelectedValue: setSelectedValue,
        onSelect: onSelect,
        registerItem: registerItem,
        getItems: getItems
    }); }, [
        selectedValue,
        onSelect,
        registerItem,
        getItems
    ]);
    return <CommandContext.Provider value={contextValue}>
        <div ref={ref} class={(0, utils_1.cn)("flex h-full w-full flex-col overflow-hidden text-popover-foreground", className)} onKeyDown={handleKeyDown} {...props}>
          {children}
        </div>
      </CommandContext.Provider>;
});
exports.Command = Command;
Command.displayName = "Command";
var CommandInput = React.forwardRef(function (_a, ref) {
    var className = _a.className, onValueChange = _a.onValueChange, wrapperClassName = _a.wrapperClassName, onChange = _a.onChange, props = __rest(_a, ["className", "onValueChange", "wrapperClassName", "onChange"]);
    var localRef = React.useRef(null);
    var inputRef = ref || localRef;
    // Auto-focus input when mounted
    React.useEffect(function () {
        // Small delay to ensure popover is rendered
        var timer = setTimeout(function () {
            var _a;
            (_a = inputRef.current) === null || _a === void 0 ? void 0 : _a.focus();
        }, 0);
        return function () { return clearTimeout(timer); };
    }, []);
    return <div class={(0, utils_1.cn)("flex items-center gap-1.5 h-7 px-1.5 mx-1 my-1 rounded-md bg-muted/50", wrapperClassName)} cmdk-input-wrapper="">
        <icons_1.SearchIcon class="h-4 w-4 shrink-0 text-muted-foreground"/>
        <input ref={inputRef} class={(0, utils_1.cn)("flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50", className)} onChange={function (e) {
            onChange === null || onChange === void 0 ? void 0 : onChange(e);
            onValueChange === null || onValueChange === void 0 ? void 0 : onValueChange(e.target.value);
        }} {...props}/>
      </div>;
});
exports.CommandInput = CommandInput;
CommandInput.displayName = "CommandInput";
var CommandList = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return <div ref={ref} class={(0, utils_1.cn)("max-h-[300px] overflow-y-auto overflow-x-hidden py-1", className)} {...props}/>;
});
exports.CommandList = CommandList;
CommandList.displayName = "CommandList";
var CommandEmpty = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return <div ref={ref} class={(0, utils_1.cn)("py-6 text-center text-sm text-muted-foreground", className)} {...props}/>;
});
exports.CommandEmpty = CommandEmpty;
CommandEmpty.displayName = "CommandEmpty";
var CommandGroup = React.forwardRef(function (_a, ref) {
    var className = _a.className, heading = _a.heading, children = _a.children, props = __rest(_a, ["className", "heading", "children"]);
    return <div ref={ref} class={(0, utils_1.cn)("overflow-hidden text-foreground", className)} {...props}>
      {heading && <div class="py-1.5 px-1.5 mx-1 text-xs font-medium text-muted-foreground">
          {heading}
        </div>}
      {children}
    </div>;
});
exports.CommandGroup = CommandGroup;
CommandGroup.displayName = "CommandGroup";
var CommandItem = React.forwardRef(function (_a, ref) {
    var className = _a.className, onSelect = _a.onSelect, value = _a.value, onMouseEnter = _a.onMouseEnter, props = __rest(_a, ["className", "onSelect", "value", "onMouseEnter"]);
    var context = React.useContext(CommandContext);
    var itemRef = React.useRef(null);
    // Generate a stable value if not provided
    var itemValue = value || React.useId();
    // Register this item with the Command
    React.useEffect(function () {
        var element = itemRef.current;
        context === null || context === void 0 ? void 0 : context.registerItem(itemValue, element);
        return function () {
            context === null || context === void 0 ? void 0 : context.registerItem(itemValue, null);
        };
    }, [context, itemValue]);
    var isSelected = (context === null || context === void 0 ? void 0 : context.selectedValue) === itemValue;
    var handleMouseEnter = function (e) {
        context === null || context === void 0 ? void 0 : context.setSelectedValue(itemValue);
        onMouseEnter === null || onMouseEnter === void 0 ? void 0 : onMouseEnter(e);
    };
    return <div ref={itemRef} data-value={itemValue} data-selected={isSelected || undefined} class={(0, utils_1.cn)(overlay_styles_1.overlayItem, isSelected && "bg-accent dark:bg-neutral-800 text-accent-foreground", className)} onClick={onSelect} onMouseEnter={handleMouseEnter} {...props}/>;
});
exports.CommandItem = CommandItem;
CommandItem.displayName = "CommandItem";
var CommandSeparator = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return <div ref={ref} class={(0, utils_1.cn)(overlay_styles_1.overlaySeparator, className)} {...props}/>;
});
exports.CommandSeparator = CommandSeparator;
CommandSeparator.displayName = "CommandSeparator";
