"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentFileItem = AgentFileItem;
var solid_js_1 = require("solid-js");
var lucide_solid_1 = require("lucide-solid");
var icons_1 = require("../../../components/ui/icons");
function formatFileSize(bytes) {
    if (bytes < 1024)
        return "".concat(bytes, " B");
    if (bytes < 1024 * 1024)
        return "".concat((bytes / 1024).toFixed(1), " KB");
    return "".concat((bytes / (1024 * 1024)).toFixed(1), " MB");
}
function getFileIcon(filename) {
    var _a;
    var ext = (_a = filename.split(".").pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase();
    // Code files
    if ([
        "js",
        "ts",
        "jsx",
        "tsx",
        "py",
        "rb",
        "go",
        "rs",
        "java",
        "kt",
        "swift",
        "c",
        "cpp",
        "h",
        "hpp",
        "cs",
        "php"
    ].includes(ext || "")) {
        return lucide_solid_1.FileCode;
    }
    // JSON/YAML/XML
    if ([
        "json",
        "yaml",
        "yml",
        "xml"
    ].includes(ext || "")) {
        return lucide_solid_1.FileJson;
    }
    return lucide_solid_1.FileText;
}
function AgentFileItem(_a) {
    var id = _a.id, filename = _a.filename, url = _a.url, size = _a.size, _b = _a.isLoading, isLoading = _b === void 0 ? false : _b, onRemove = _a.onRemove;
    var _c = (0, solid_js_1.createSignal)(false), isHovered = _c[0], setIsHovered = _c[1];
    var Icon = getFileIcon(filename);
    return <div class="relative flex items-center gap-1.5 px-2 py-1 bg-muted/50 rounded border border-border/50 max-w-[200px]" onMouseEnter={function () { return setIsHovered(true); }} onMouseLeave={function () { return setIsHovered(false); }}>
      {isLoading ? <icons_1.IconSpinner class="size-3.5 text-muted-foreground flex-shrink-0"/> : <Icon class="size-3.5 text-muted-foreground flex-shrink-0"/>}

      <div class="flex flex-col min-w-0">
        <span class="text-xs text-foreground truncate" title={filename}>
          {filename}
        </span>
        {size !== undefined && <span class="text-[10px] text-muted-foreground">
            {formatFileSize(size)}
          </span>}
      </div>

      {onRemove && <button onClick={function (e) {
                e.stopPropagation();
                onRemove();
            }} class={"absolute -top-1.5 -right-1.5 size-4 rounded-full bg-background border border-border\n                     flex items-center justify-center transition-[opacity,transform] duration-150 ease-out active:scale-[0.97] z-10\n                     text-muted-foreground hover:text-foreground\n                     ".concat(isHovered ? "opacity-100" : "opacity-0")} type="button">
          <lucide_solid_1.X class="size-3"/>
        </button>}
    </div>;
}
