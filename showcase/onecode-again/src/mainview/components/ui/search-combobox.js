"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchCombobox = SearchCombobox;
var solid_js_1 = require("solid-js");
var popover_1 = require("./popover");
var command_1 = require("./command");
function SearchCombobox(_a) {
    var isOpen = _a.isOpen, onOpenChange = _a.onOpenChange, trigger = _a.trigger, items = _a.items, onSelect = _a.onSelect, _b = _a.placeholder, placeholder = _b === void 0 ? "Search..." : _b, _c = _a.emptyMessage, emptyMessage = _c === void 0 ? "No results found." : _c, getItemValue = _a.getItemValue, renderItem = _a.renderItem, _d = _a.width, width = _d === void 0 ? "w-64" : _d, _e = _a.align, align = _e === void 0 ? "end" : _e, _f = _a.side, side = _f === void 0 ? "bottom" : _f, _g = _a.sideOffset, sideOffset = _g === void 0 ? 4 : _g, alignOffset = _a.alignOffset, _h = _a.collisionPadding, collisionPadding = _h === void 0 ? 8 : _h, _j = _a.maxHeight, maxHeight = _j === void 0 ? "max-h-[300px]" : _j;
    var _k = (0, solid_js_1.createSignal)(""), search = _k[0], setSearch = _k[1];
    // Filter items ourselves instead of relying on cmdk's built-in filter
    var filteredItems = (0, solid_js_1.createMemo)(function () {
        if (!search.trim())
            return items;
        var lowerSearch = search.toLowerCase();
        return items.filter(function (item) { return getItemValue(item).toLowerCase().includes(lowerSearch); });
    });
    // Reset search when popover closes
    var handleOpenChange = function (open) {
        if (!open)
            setSearch("");
        onOpenChange(open);
    };
    return <popover_1.Popover open={isOpen} onOpenChange={handleOpenChange}>
      {trigger}
      <popover_1.PopoverContent class={"".concat(width, " p-0")} align={align} side={side} sideOffset={sideOffset} alignOffset={alignOffset} collisionPadding={collisionPadding}>
        <command_1.Command shouldFilter={false}>
          <command_1.CommandInput placeholder={placeholder} value={search} onValueChange={setSearch}/>
          <command_1.CommandList class={"".concat(maxHeight, " overflow-y-auto")}>
            {filteredItems.length === 0 && <command_1.CommandEmpty>{emptyMessage}</command_1.CommandEmpty>}
            <command_1.CommandGroup>
              {filteredItems.map(function (item, index) { return <command_1.CommandItem key={index} value={getItemValue(item)} onSelect={function () { return onSelect(item); }}>
                  {renderItem(item)}
                </command_1.CommandItem>; })}
            </command_1.CommandGroup>
          </command_1.CommandList>
        </command_1.Command>
      </popover_1.PopoverContent>
    </popover_1.Popover>;
}
