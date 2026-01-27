"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentTextContextItem = AgentTextContextItem;
var solid_js_1 = require("solid-js");
var lucide_solid_1 = require("lucide-solid");
// Text selection icon - "A" with text cursor
function TextSelectIcon(_a) {
    var className = _a.className;
    return <svg viewBox="0 0 24 24" fill="none" class={className}>
      <path fillRule="evenodd" clipRule="evenodd" d="M8.50027 4C8.91147 4 9.28067 4.25166 9.43107 4.63435L14.9311 18.6343C15.133 19.1484 14.88 19.7288 14.366 19.9308C13.8519 20.1327 13.2715 19.8797 13.0695 19.3657L11.3545 15H5.64607L3.93107 19.3657C3.72907 19.8797 3.14867 20.1327 2.63462 19.9308C2.12058 19.7288 1.86757 19.1484 2.06952 18.6343L7.56947 4.63435C7.71987 4.25166 8.08907 4 8.50027 4ZM6.43177 13H10.5688L8.50027 7.73484L6.43177 13Z" fill="currentColor"/>
      <path d="M17 2C16.4477 2 16 2.44772 16 3C16 3.55228 16.4477 4 17 4H18V20H17C16.4477 20 16 20.4477 16 21C16 21.5523 16.4477 22 17 22H21C21.5523 22 22 21.5523 22 21C22 20.4477 21.5523 20 21 20H20V4H21C21.5523 4 22 3.55228 22 3C22 2.44772 21.5523 2 21 2H17Z" fill="currentColor"/>
    </svg>;
}
function AgentTextContextItem(_a) {
    var _b;
    var text = _a.text, preview = _a.preview, onRemove = _a.onRemove;
    var _c = (0, solid_js_1.createSignal)(false), isHovered = _c[0], setIsHovered = _c[1];
    // Get a short title from the preview (first line or first ~15 chars)
    var title = ((_b = preview.split("\n")[0]) === null || _b === void 0 ? void 0 : _b.slice(0, 20)) || preview.slice(0, 20);
    var displayTitle = title.length < preview.length ? "".concat(title, "...") : title;
    return <div class="relative flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-muted/50 cursor-default min-w-[120px] max-w-[200px]" onMouseEnter={function () { return setIsHovered(true); }} onMouseLeave={function () { return setIsHovered(false); }}>
      {/* Icon container */}
      <div class="flex items-center justify-center size-8 rounded-md bg-muted shrink-0">
        <TextSelectIcon class="size-4 text-muted-foreground"/>
      </div>

      {/* Text content */}
      <div class="flex flex-col min-w-0">
        <span class="text-sm font-medium text-foreground truncate">
          {displayTitle}
        </span>
        <span class="text-xs text-muted-foreground">
          Selected Text
        </span>
      </div>

      {/* Remove button */}
      {onRemove && <button onClick={function (e) {
                e.stopPropagation();
                onRemove();
            }} class={"absolute -top-1.5 -right-1.5 size-4 rounded-full bg-background border border-border\n                     flex items-center justify-center transition-[opacity,transform] duration-150 ease-out active:scale-[0.97] z-10\n                     text-muted-foreground hover:text-foreground\n                     ".concat(isHovered ? "opacity-100" : "opacity-0")} type="button">
          <lucide_solid_1.X class="size-3"/>
        </button>}
    </div>;
}
