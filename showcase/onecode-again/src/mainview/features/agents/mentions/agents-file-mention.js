"use client";
"use strict";
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
exports.AgentsFileMention = void 0;
exports.getFileIconByExtension = getFileIconByExtension;
exports.createFileIconElement = createFileIconElement;
exports.getOptionIcon = getOptionIcon;
var utils_1 = require("../../../lib/utils");
var mock_api_1 = require("../../../lib/mock-api");
var trpc_1 = require("../../../lib/trpc");
var react_query_1 = require("@tanstack/react-query");
var solid_js_1 = require("solid-js");
var web_1 = require("solid-js/web");
var web_2 = require("solid-js/web");
var jotai_1 = require("../../../lib/state/jotai");
var agents_mentions_editor_1 = require("./agents-mentions-editor");
var atoms_1 = require("../../../lib/atoms");
var icons_1 = require("../../../components/ui/icons");
var lucide_solid_1 = require("lucide-solid");
var tooltip_1 = require("../../../components/ui/tooltip");
// Custom folder icon matching design
function FolderOpenIcon(_a) {
    var className = _a.className;
    return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" class={className}>
      <path d="M4 8V6C4 4.89543 4.89543 4 6 4H14C15.1046 4 16 4.89543 16 6M4 8H8.17548C8.70591 8 9.21462 8.21071 9.58969 8.58579L11.4181 10.4142C11.7932 10.7893 12.3019 11 12.8323 11H16M4 8C3.44987 8 3.00391 8.44597 3.00391 8.99609V18C3.00391 19.1046 3.89934 20 5.00391 20H19.0039C20.1085 20 21.0039 19.1046 21.0039 18V12.0039C21.0039 11.4495 20.5544 11 20 11M16 11V6M16 11H20M16 6H18C19.1046 6 20 6.89543 20 8V11" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
    </svg>;
}
var framework_icons_1 = require("../../../icons/framework-icons");
// Category navigation options (shown on root view)
var CATEGORY_OPTIONS = [
    {
        id: "files",
        label: "Files & Folders",
        type: "category",
        path: "",
        repository: ""
    },
    {
        id: "skills",
        label: "Skills",
        type: "category",
        path: "",
        repository: ""
    },
    {
        id: "agents",
        label: "Agents",
        type: "category",
        path: "",
        repository: ""
    },
    {
        id: "tools",
        label: "MCP Tools",
        type: "category",
        path: "",
        repository: ""
    }
];
// Known file extensions with icons
var KNOWN_FILE_ICON_EXTENSIONS = new Set([
    "tsx",
    "ts",
    "js",
    "mjs",
    "cjs",
    "jsx",
    "py",
    "pyw",
    "pyi",
    "go",
    "rs",
    "md",
    "mdx",
    "css",
    "html",
    "htm",
    "scss",
    "sass",
    "json",
    "jsonc",
    "yaml",
    "yml",
    "sh",
    "bash",
    "zsh",
    "sql",
    "graphql",
    "gql",
    "prisma",
    "dockerfile",
    "toml",
    "env",
    "java",
    "c",
    "h",
    "cpp",
    "cc",
    "cxx",
    "hpp",
    "cs",
    "php",
    "rb",
    "kt",
    "vue",
    "svelte",
    "astro",
    "swift",
    "pdf",
    "svg"
]);
// Get file icon component based on file extension
// If returnNullForUnknown is true, returns null for unknown file types instead of default icon
function getFileIconByExtension(filename, returnNullForUnknown) {
    var _a;
    if (returnNullForUnknown === void 0) { returnNullForUnknown = false; }
    var filenameLower = filename.toLowerCase();
    // Special handling for files without extensions (like Dockerfile)
    if (filenameLower === "dockerfile" || filenameLower.endsWith("/dockerfile")) {
        return framework_icons_1.DockerIcon;
    }
    // Special handling for .env files
    // Get the base filename (without path)
    var baseFilename = filenameLower.split("/").pop() || filenameLower;
    // .env (without suffix) -> TOML icon
    // .env.local, .env.example, .env.development, etc. -> Shell icon
    if (baseFilename === ".env") {
        return framework_icons_1.TOMLIcon;
    }
    if (baseFilename.startsWith(".env.")) {
        // .env.local, .env.example, .env.development, etc.
        return framework_icons_1.ShellIcon;
    }
    // Special handling for markdown files
    // README files -> MarkdownInfoIcon (with exclamation mark)
    // Other .md/.mdx files -> MarkdownIcon (standard markdown icon)
    if (filenameLower.endsWith(".md") || filenameLower.endsWith(".mdx")) {
        var nameWithoutExt = filenameLower.replace(/\.(md|mdx)$/, "");
        if (nameWithoutExt === "readme") {
            return framework_icons_1.MarkdownInfoIcon;
        }
        return framework_icons_1.MarkdownIcon;
    }
    // Special handling for JavaScript files
    // Ensure .js/.mjs/.cjs files use JavaScriptIcon, not JSONIcon
    if (filenameLower.endsWith(".js") || filenameLower.endsWith(".mjs") || filenameLower.endsWith(".cjs")) {
        return framework_icons_1.JavaScriptIcon;
    }
    var ext = ((_a = filename.split(".").pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || "";
    switch (ext) {
        case "tsx": return framework_icons_1.ReactIcon;
        case "ts": return framework_icons_1.TypeScriptIcon;
        case "js":
        case "mjs":
        case "cjs": return framework_icons_1.JavaScriptIcon;
        case "jsx": return framework_icons_1.ReactIcon;
        case "py":
        case "pyw":
        case "pyi": return framework_icons_1.PythonIcon;
        case "go": return framework_icons_1.GoIcon;
        case "rs": return framework_icons_1.RustIcon;
        case "md":
        case "mdx":
            // This case is handled above in special handling, but kept as fallback
            // Check if it's README
            var nameWithoutExt = filenameLower.replace(/\.(md|mdx)$/, "");
            if (nameWithoutExt === "readme") {
                return framework_icons_1.MarkdownInfoIcon;
            }
            return framework_icons_1.MarkdownIcon;
        case "css": return framework_icons_1.CSSIcon;
        case "html":
        case "htm": return framework_icons_1.HTMLIcon;
        case "scss":
        case "sass": return framework_icons_1.SCSSIcon;
        case "json":
        case "jsonc": return framework_icons_1.JSONIcon;
        case "yaml":
        case "yml": return framework_icons_1.YAMLIcon;
        case "sh":
        case "bash":
        case "zsh": return framework_icons_1.ShellIcon;
        case "sql": return framework_icons_1.SQLIcon;
        case "graphql":
        case "gql": return framework_icons_1.GraphQLIcon;
        case "prisma": return framework_icons_1.PrismaIcon;
        case "dockerfile": return framework_icons_1.DockerIcon;
        case "toml": return framework_icons_1.TOMLIcon;
        case "env":
            // This handles .env files, but we already handled them above
            // This is a fallback for edge cases
            return framework_icons_1.TOMLIcon;
        case "java": return framework_icons_1.JavaIcon;
        case "c":
        case "h": return framework_icons_1.CIcon;
        case "cpp":
        case "cc":
        case "cxx":
        case "hpp": return framework_icons_1.CppIcon;
        case "cs": return framework_icons_1.CSharpIcon;
        case "php": return framework_icons_1.PHPIcon;
        case "rb": return framework_icons_1.RubyIcon;
        case "kt": return framework_icons_1.KotlinIcon;
        case "vue": return framework_icons_1.VueIcon;
        case "svelte": return framework_icons_1.SvelteIcon;
        case "astro": return framework_icons_1.AstroIcon;
        case "swift": return framework_icons_1.SwiftIcon;
        case "pdf": return framework_icons_1.PDFIcon;
        case "svg": return framework_icons_1.SVGIcon;
        default: return returnNullForUnknown ? null : icons_1.FilesIcon;
    }
}
// Tool icon component (MCP icon) - slightly larger for visibility
function ToolIcon(_a) {
    var className = _a.className;
    // Override size to h-3.5 w-3.5 for better visibility
    var sizeClass = (className === null || className === void 0 ? void 0 : className.replace(/h-3\b/, "h-3.5").replace(/w-3\b/, "w-3.5")) || className;
    return <icons_1.OriginalMCPIcon class={sizeClass}/>;
}
/**
* Format MCP tool name for display
* Converts snake_case/underscore names to readable format
* e.g., "get_design_context" -> "Get design context"
*/
function formatToolName(toolName) {
    return toolName.replace(/_/g, " ").replace(/\b\w/g, function (c) { return c.toUpperCase(); }).replace(/\s+/g, " ").trim();
}
// Create SVG icon element in DOM based on file extension or type
function createFileIconElement(filename, type) {
    var _a;
    var IconComponent = type === "skill" ? icons_1.SkillIcon : type === "agent" ? icons_1.CustomAgentIcon : type === "tool" ? ToolIcon : type === "folder" ? FolderOpenIcon : (_a = getFileIconByExtension(filename)) !== null && _a !== void 0 ? _a : icons_1.FilesIcon;
    // Note: "category" type will use the default file icon based on filename, which is fine since
    // categories won't be inserted as mentions in the editor (they navigate to subpages)
    // Create a temporary container
    var container = document.createElement("div");
    container.style.display = "none";
    container.style.position = "absolute";
    container.style.visibility = "hidden";
    document.body.appendChild(container);
    // Create React element
    var iconElement = createElement(IconComponent, { className: "h-3 w-3 text-muted-foreground flex-shrink-0" });
    var root = (0, web_2.createRoot)(container);
    // Render synchronously using flushSync
    (0, web_1.flushSync)(function () {
        root.render(iconElement);
    });
    // Extract the SVG element
    var svgElement = container.querySelector("svg");
    // Clean up
    root.unmount();
    if (container.parentNode) {
        document.body.removeChild(container);
    }
    if (!svgElement || !(svgElement instanceof SVGSVGElement)) {
        // Fallback: create a simple file icon
        var fallbackSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        fallbackSvg.setAttribute("width", "12");
        fallbackSvg.setAttribute("height", "12");
        fallbackSvg.setAttribute("viewBox", "0 0 24 24");
        fallbackSvg.setAttribute("fill", "none");
        fallbackSvg.setAttribute("stroke", "currentColor");
        fallbackSvg.setAttribute("stroke-width", "2");
        fallbackSvg.setAttribute("stroke-linecap", "round");
        fallbackSvg.setAttribute("stroke-linejoin", "round");
        fallbackSvg.className.baseVal = "h-3 w-3 text-muted-foreground flex-shrink-0";
        var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z");
        fallbackSvg.appendChild(path);
        var polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
        polyline.setAttribute("points", "14 2 14 8 20 8");
        fallbackSvg.appendChild(polyline);
        return fallbackSvg;
    }
    // Clone the SVG to avoid issues
    var clonedSvg = svgElement.cloneNode(true);
    clonedSvg.setAttribute("class", "h-3 w-3 text-muted-foreground flex-shrink-0");
    return clonedSvg;
}
// Folder icon component for consistency with file icons
function FolderIcon(_a) {
    var className = _a.className;
    return <FolderOpenIcon class={className}/>;
}
// Skill icon component (local wrapper for getOptionIcon)
function SkillIconWrapper(_a) {
    var className = _a.className;
    return <icons_1.SkillIcon class={className}/>;
}
function CustomAgentIconWrapper(_a) {
    var className = _a.className;
    return <icons_1.CustomAgentIcon class={className}/>;
}
// ToolIconWrapper removed - use ToolIcon instead (they were identical)
// Category icon component
function CategoryIcon(_a) {
    var className = _a.className, categoryId = _a.categoryId;
    if (categoryId === "files") {
        return <icons_1.FilesIcon class={className}/>;
    }
    if (categoryId === "skills") {
        return <icons_1.SkillIcon class={className}/>;
    }
    if (categoryId === "agents") {
        return <icons_1.CustomAgentIcon class={className}/>;
    }
    if (categoryId === "tools") {
        // Override size to h-3.5 w-3.5 for better visibility
        var sizeClass = (className === null || className === void 0 ? void 0 : className.replace(/h-3\b/, "h-3.5").replace(/w-3\b/, "w-3.5")) || className;
        return <icons_1.OriginalMCPIcon class={sizeClass}/>;
    }
    return <icons_1.FilesIcon class={className}/>;
}
/**
* Get icon component for a file, folder, skill, agent, tool, or category option
*/
function getOptionIcon(option) {
    var _a;
    if (option.type === "category") {
        // Return a wrapper component for categories
        return function CategoryIconWrapper(_a) {
            var className = _a.className;
            return <CategoryIcon class={className} categoryId={option.id || ""}/>;
        };
    }
    if (option.type === "skill") {
        return SkillIconWrapper;
    }
    if (option.type === "agent") {
        return CustomAgentIconWrapper;
    }
    if (option.type === "tool") {
        return ToolIcon;
    }
    if (option.type === "folder") {
        return FolderIcon;
    }
    return (_a = getFileIconByExtension(option.label)) !== null && _a !== void 0 ? _a : icons_1.FilesIcon;
}
/**
* Render folder path as a tree structure for tooltip
* e.g., "apps/web/app" becomes:
*   📁 apps
*     📁 web
*       📁 app
*/
function renderFolderTree(path) {
    var parts = path.split("/").filter(Boolean);
    var lastIndex = parts.length - 1;
    return <div class="flex flex-col gap-1 min-w-[220px]">
      {parts.map(function (part, index) {
            var isLast = index === lastIndex;
            return <div key={index} class={(0, utils_1.cn)("flex items-center gap-1.5 text-xs", isLast ? "text-foreground" : "text-muted-foreground")} style={{ paddingLeft: "".concat(index * 20, "px") }}>
            <FolderOpenIcon class={(0, utils_1.cn)("h-3.5 w-3.5 flex-shrink-0", isLast ? "text-foreground/70" : "text-muted-foreground")}/>
            <span class={isLast ? "font-medium" : ""}>{part}</span>
          </div>;
        })}
    </div>;
}
/**
* Check if a string matches all search words (multi-word search)
* Splits search by whitespace, all words must be present in target
*/
function matchesMultiWordSearch(target, searchLower) {
    if (!searchLower)
        return true;
    var searchWords = searchLower.split(/\s+/).filter(Boolean);
    if (searchWords.length === 0)
        return true;
    var targetLower = target.toLowerCase();
    return searchWords.every(function (word) { return targetLower.includes(word); });
}
/**
* Sort files by relevance to search query
* Priority: exact match > starts with > shorter match > contains in filename > alphabetical
* Supports multi-word search - splits by whitespace, all words must match
* When search ends with space, prioritize files with hyphen/underscore (e.g. "agents " -> "agents-sidebar")
*/
function sortFilesByRelevance(files, searchText) {
    if (!searchText)
        return files;
    var searchLower = searchText.toLowerCase();
    var searchWords = searchLower.split(/\s+/).filter(Boolean);
    var isSingleWord = searchWords.length <= 1;
    // Check if search ends with space - user wants to continue with hyphenated names
    var endsWithSpace = searchText.endsWith(" ");
    return __spreadArray([], files, true).sort(function (a, b) {
        var aLabelLower = a.label.toLowerCase();
        var bLabelLower = b.label.toLowerCase();
        // Get filename without extension for matching
        var aNameNoExt = aLabelLower.replace(/\.[^.]+$/, "");
        var bNameNoExt = bLabelLower.replace(/\.[^.]+$/, "");
        // For multi-word search, prioritize files where all words match in filename
        if (!isSingleWord) {
            var aAllInFilename = searchWords.every(function (w) { return aLabelLower.includes(w); });
            var bAllInFilename = searchWords.every(function (w) { return bLabelLower.includes(w); });
            if (aAllInFilename && !bAllInFilename)
                return -1;
            if (!aAllInFilename && bAllInFilename)
                return 1;
        }
        // When search ends with space, prioritize files with hyphen/underscore after first word
        // e.g. "agents " should show "agents-sidebar" before "agents" folder
        if (endsWithSpace && searchWords.length >= 1) {
            var lastWord = searchWords[searchWords.length - 1];
            // Check if filename has hyphen/underscore continuation after matching word
            var aHasContinuation = aNameNoExt.includes("".concat(lastWord, "-")) || aNameNoExt.includes("".concat(lastWord, "_"));
            var bHasContinuation = bNameNoExt.includes("".concat(lastWord, "-")) || bNameNoExt.includes("".concat(lastWord, "_"));
            if (aHasContinuation && !bHasContinuation)
                return -1;
            if (!aHasContinuation && bHasContinuation)
                return 1;
        }
        // Priority 1: EXACT match (chat.tsx when searching "chat") - single word only, not when ending with space
        if (isSingleWord && !endsWithSpace) {
            var aExact = aNameNoExt === searchLower;
            var bExact = bNameNoExt === searchLower;
            if (aExact && !bExact)
                return -1;
            if (!aExact && bExact)
                return 1;
        }
        // Priority 2: filename STARTS with first search word
        var firstWord = searchWords[0] || searchLower;
        var aStartsWith = aNameNoExt.startsWith(firstWord);
        var bStartsWith = bNameNoExt.startsWith(firstWord);
        if (aStartsWith && !bStartsWith)
            return -1;
        if (!aStartsWith && bStartsWith)
            return 1;
        // Priority 3: If both start with query, shorter name = higher match %
        // But when ending with space, prefer longer (hyphenated) names
        if (aStartsWith && bStartsWith) {
            if (aNameNoExt.length !== bNameNoExt.length) {
                if (endsWithSpace) {
                    return bNameNoExt.length - aNameNoExt.length;
                }
                return aNameNoExt.length - bNameNoExt.length;
            }
        }
        // Priority 4: filename CONTAINS first word (but doesn't start with it)
        var aFilenameMatch = aLabelLower.includes(firstWord);
        var bFilenameMatch = bLabelLower.includes(firstWord);
        if (aFilenameMatch && !bFilenameMatch)
            return -1;
        if (!aFilenameMatch && bFilenameMatch)
            return 1;
        // Finally: alphabetically by label
        return a.label.localeCompare(b.label);
    });
}
/**
* Render tooltip content for a mention option
* Skills/agents show description, tools, model info
* Tools show MCP server name
* Files/folders show path
*/
function renderTooltipContent(option) {
    if (option.type === "folder") {
        return renderFolderTree(option.path);
    }
    if (option.type === "skill" || option.type === "agent") {
        return <div class="flex flex-col gap-1.5 w-full overflow-hidden">
        {option.description && <p class="text-xs text-muted-foreground break-words">
            {option.description}
          </p>}
        {option.model && <div class="text-xs text-muted-foreground">
            Model: {option.model}
          </div>}
        {option.tools && option.tools.length > 0 && <div class="text-xs text-muted-foreground break-words">
            Tools: {option.tools.join(", ")}
          </div>}
        <div class="text-[10px] text-muted-foreground/70 font-mono truncate w-full">
          {option.path}
        </div>
      </div>;
    }
    if (option.type === "tool") {
        // Show full tool name (e.g., mcp__figma-local-mcp__get_figjam)
        return <div class="text-xs text-muted-foreground font-mono">
        {option.path}
      </div>;
    }
    // Files - just path
    return <div class="text-xs text-muted-foreground font-mono truncate w-full">
      {option.path}
    </div>;
}
// Memoized to prevent re-renders when parent re-renders
exports.AgentsFileMention = memo(function AgentsFileMention(_a) {
    var isOpen = _a.isOpen, onClose = _a.onClose, onSelect = _a.onSelect, searchText = _a.searchText, position = _a.position, teamId = _a.teamId, repository = _a.repository, sandboxId = _a.sandboxId, branch = _a.branch, projectPath = _a.projectPath, _b = _a.changedFiles, changedFiles = _b === void 0 ? [] : _b, _c = _a.showingFilesList, showingFilesList = _c === void 0 ? false : _c, _d = _a.showingSkillsList, showingSkillsList = _d === void 0 ? false : _d, _e = _a.showingAgentsList, showingAgentsList = _e === void 0 ? false : _e, _f = _a.showingToolsList, showingToolsList = _f === void 0 ? false : _f;
    var _g = (0, solid_js_1.createSignal)(null), dropdownRef = _g[0], setDropdownRef = _g[1];
    var _h = (0, solid_js_1.createSignal)(0), selectedIndex = _h[0], setSelectedIndex = _h[1];
    var _j = (0, solid_js_1.createSignal)(null), placementRef = _j[0], setPlacementRef = _j[1];
    var _k = (0, solid_js_1.createSignal)(searchText), debouncedSearchText = _k[0], setDebouncedSearchText = _k[1];
    var _l = (0, solid_js_1.createSignal)(null), hoverIndex = _l[0], setHoverIndex = _l[1];
    // Get session info (MCP servers, tools) from atom
    var sessionInfo = (0, jotai_1.useAtomValue)(atoms_1.sessionInfoAtom);
    // Fetch skills from filesystem (cached for 5 minutes)
    var _m = trpc_1.trpc.skills.listEnabled.useQuery(undefined, {
        enabled: isOpen,
        staleTime: 5 * 60 * 1e3
    }), _o = _m.data, skills = _o === void 0 ? [] : _o, isFetchingSkills = _m.isFetching;
    // Fetch custom agents from filesystem (cached for 5 minutes)
    var _p = trpc_1.trpc.agents.listEnabled.useQuery(undefined, {
        enabled: isOpen,
        staleTime: 5 * 60 * 1e3
    }), _q = _p.data, customAgents = _q === void 0 ? [] : _q, isFetchingAgents = _p.isFetching;
    // Debounce search text (300ms to match canvas implementation)
    (0, solid_js_1.createEffect)(function () {
        var timer = setTimeout(function () {
            setDebouncedSearchText(searchText);
        }, 300);
        return function () { return clearTimeout(timer); };
    });
    // For multi-word search, send only first word to API (server filters by that),
    // then filter results on client by all words
    var apiSearchQuery = (0, solid_js_1.createMemo)(function () {
        if (!debouncedSearchText)
            return "";
        var words = debouncedSearchText.split(/\s+/).filter(Boolean);
        return words[0] || "";
    });
    // Fetch files from API
    // Priority: sandboxId (includes uncommitted) > branch (GitHub API) > cached file_tree
    var _r = mock_api_1.api.github.searchFiles.useQuery({
        teamId: teamId,
        repository: repository,
        query: apiSearchQuery,
        limit: 50,
        sandboxId: sandboxId,
        branch: branch,
        projectPath: projectPath
    }, {
        enabled: isOpen && (!!projectPath || !!teamId && (!!repository || !!sandboxId || !!branch)),
        staleTime: 5e3,
        refetchOnWindowFocus: false,
        placeholderData: react_query_1.keepPreviousData
    }), _s = _r.data, fileResults = _s === void 0 ? [] : _s, isLoading = _r.isLoading, isFetching = _r.isFetching, error = _r.error;
    // Convert changed files to options (shown at top in separate group)
    var changedFileOptions = (0, solid_js_1.createMemo)(function () {
        if (!changedFiles.length)
            return [];
        var searchLower = debouncedSearchText.toLowerCase();
        var mapped = changedFiles.filter(function (file) { return matchesMultiWordSearch(file.filePath, searchLower); }).map(function (file) {
            // Use displayPath (relative path) for UI display, filePath only for internal ID
            var displayPath = file.displayPath || file.filePath;
            var pathParts = displayPath.split("/");
            var fileName = pathParts.pop() || displayPath;
            var dirPath = pathParts.join("/") || "/";
            return {
                id: "changed:".concat(file.filePath),
                label: fileName,
                path: displayPath,
                repository: repository || "",
                truncatedPath: dirPath,
                additions: file.additions,
                deletions: file.deletions
            };
        });
        // Sort by relevance using shared function
        return sortFilesByRelevance(mapped, debouncedSearchText);
    });
    // Convert API results to options with truncated path
    // Exclude files that are already in changedFileOptions
    var changedFilePaths = (0, solid_js_1.createMemo)(function () { return new Set(changedFiles.map(function (f) { return f.filePath; })); });
    var repoFileOptions = (0, solid_js_1.createMemo)(function () {
        var searchLower = debouncedSearchText.toLowerCase();
        var mapped = fileResults.filter(function (file) { return !changedFilePaths.has(file.path); }).filter(function (file) { return matchesMultiWordSearch(file.path, searchLower); }).map(function (file) {
            // Get directory path (without filename/foldername) for inline display
            var pathParts = file.path.split("/");
            var dirPath = pathParts.slice(0, -1).join("/") || "/";
            return {
                id: file.id,
                label: file.label,
                path: file.path,
                repository: file.repository,
                truncatedPath: dirPath,
                type: file.type
            };
        });
        // Sort by relevance using shared function
        return sortFilesByRelevance(mapped, debouncedSearchText);
    });
    // Convert skills to mention options
    var skillOptions = (0, solid_js_1.createMemo)(function () {
        var searchLower = debouncedSearchText.toLowerCase();
        return skills.filter(function (skill) { return matchesMultiWordSearch(skill.name, searchLower) || matchesMultiWordSearch(skill.description, searchLower); }).map(function (skill) { return ({
            id: "".concat(agents_mentions_editor_1.MENTION_PREFIXES.SKILL).concat(skill.name),
            label: skill.name,
            path: skill.path,
            repository: "",
            truncatedPath: skill.description,
            type: "skill",
            description: skill.description,
            source: skill.source
        }); });
    });
    // Convert custom agents to mention options
    var agentOptions = (0, solid_js_1.createMemo)(function () {
        var searchLower = debouncedSearchText.toLowerCase();
        return customAgents.filter(function (agent) { return matchesMultiWordSearch(agent.name, searchLower) || matchesMultiWordSearch(agent.description, searchLower); }).map(function (agent) { return ({
            id: "".concat(agents_mentions_editor_1.MENTION_PREFIXES.AGENT).concat(agent.name),
            label: agent.name,
            path: agent.path,
            repository: "",
            truncatedPath: agent.description,
            type: "agent",
            description: agent.description,
            tools: agent.tools,
            model: agent.model,
            source: agent.source
        }); });
    });
    // Convert MCP tools to mention options (stable, doesn't depend on search)
    // MCP tools have format like "mcp__servername__toolname"
    var allToolOptions = (0, solid_js_1.createMemo)(function () {
        if (!(sessionInfo === null || sessionInfo === void 0 ? void 0 : sessionInfo.tools) || !(sessionInfo === null || sessionInfo === void 0 ? void 0 : sessionInfo.mcpServers))
            return [];
        // Get connected MCP server names
        var connectedServers = new Set(sessionInfo.mcpServers.filter(function (s) { return s.status === "connected"; }).map(function (s) { return s.name; }));
        // Filter tools that belong to MCP servers (format: mcp__servername__toolname)
        var mcpTools = sessionInfo.tools.filter(function (tool) {
            if (!tool.startsWith("mcp__"))
                return false;
            var parts = tool.split("__");
            if (parts.length < 3)
                return false;
            var serverName = parts[1];
            return connectedServers.has(serverName);
        });
        return mcpTools.map(function (tool) {
            var parts = tool.split("__");
            var serverName = parts[1];
            var toolName = parts.slice(2).join("__");
            var displayName = formatToolName(toolName);
            return {
                id: "".concat(agents_mentions_editor_1.MENTION_PREFIXES.TOOL).concat(tool),
                label: displayName,
                path: tool,
                repository: "",
                truncatedPath: serverName,
                type: "tool",
                mcpServer: serverName
            };
        });
    });
    // Filtered tool options based on search
    var toolOptions = (0, solid_js_1.createMemo)(function () {
        if (!debouncedSearchText)
            return allToolOptions;
        var searchLower = debouncedSearchText.toLowerCase();
        return allToolOptions.filter(function (tool) {
            // Search by: display name, raw tool name, full path, server name
            return matchesMultiWordSearch(tool.label, searchLower) || matchesMultiWordSearch(tool.path, searchLower) || matchesMultiWordSearch(tool.mcpServer || "", searchLower);
        });
    });
    // Check if we have skills, agents, or tools
    // Use base data (not search-filtered) for stable category display
    var hasSkills = skills.length > 0;
    var hasAgents = customAgents.length > 0;
    var hasTools = allToolOptions.length > 0;
    var hasOnlyFiles = !hasSkills && !hasAgents && !hasTools;
    // Determine if we're in a subpage view (or showing files directly when no skills/agents/tools)
    var isInSubpage = showingFilesList || showingSkillsList || showingAgentsList || showingToolsList || hasOnlyFiles;
    // Filter category options based on available data
    var availableCategoryOptions = (0, solid_js_1.createMemo)(function () {
        return CATEGORY_OPTIONS.filter(function (category) {
            if (category.id === "files")
                return true;
            if (category.id === "skills")
                return hasSkills;
            if (category.id === "agents")
                return hasAgents;
            if (category.id === "tools")
                return hasTools;
            return true;
        });
    });
    // Combined options for keyboard navigation
    // Subpage views show only that category's items
    // Root view shows changed files + category navigation options
    // Search filters globally in root view, within category in subpage
    // If no skills, agents, or tools, skip root view and show files directly
    var options = (0, solid_js_1.createMemo)(function () {
        // SUBPAGE: Files (or if no skills/agents/tools, show files directly)
        if (showingFilesList || hasOnlyFiles) {
            var allFiles = __spreadArray(__spreadArray([], changedFileOptions, true), repoFileOptions, true);
            if (debouncedSearchText) {
                return sortFilesByRelevance(allFiles, debouncedSearchText);
            }
            return allFiles;
        }
        // SUBPAGE: Skills
        if (showingSkillsList) {
            return skillOptions;
        }
        // SUBPAGE: Agents
        if (showingAgentsList) {
            return agentOptions;
        }
        // SUBPAGE: MCP Tools
        if (showingToolsList) {
            return toolOptions;
        }
        // ROOT VIEW
        if (debouncedSearchText) {
            // Global search: search across changed files + categories + skills + agents + tools + repo files
            var searchLower_1 = debouncedSearchText.toLowerCase();
            var filteredCategories = availableCategoryOptions.filter(function (c) { return c.label.toLowerCase().includes(searchLower_1); });
            var allItems = __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], changedFileOptions, true), filteredCategories, true), skillOptions, true), agentOptions, true), toolOptions, true), repoFileOptions, true);
            return sortFilesByRelevance(allItems, debouncedSearchText);
        }
        // No search: Changed files FIRST (quick access), then category navigation
        return __spreadArray(__spreadArray([], changedFileOptions, true), availableCategoryOptions, true);
    });
    // Track previous values for smarter selection reset
    var _t = (0, solid_js_1.createSignal)(isOpen), prevIsOpenRef = _t[0], setPrevIsOpenRef = _t[1];
    var _u = (0, solid_js_1.createSignal)(debouncedSearchText), prevSearchRef = _u[0], setPrevSearchRef = _u[1];
    var _v = (0, solid_js_1.createSignal)(showingFilesList), prevShowingFilesListRef = _v[0], setPrevShowingFilesListRef = _v[1];
    var _w = (0, solid_js_1.createSignal)(showingSkillsList), prevShowingSkillsListRef = _w[0], setPrevShowingSkillsListRef = _w[1];
    var _x = (0, solid_js_1.createSignal)(showingAgentsList), prevShowingAgentsListRef = _x[0], setPrevShowingAgentsListRef = _x[1];
    var _y = (0, solid_js_1.createSignal)(showingToolsList), prevShowingToolsListRef = _y[0], setPrevShowingToolsListRef = _y[1];
    // CONSOLIDATED: Single useLayoutEffect for selection management (was 3 separate)
    (0, solid_js_1.createEffect)(function () {
        var didJustOpen = isOpen && !prevIsOpenRef.current;
        var didSearchChange = debouncedSearchText !== prevSearchRef.current;
        var didSubpageChange = showingFilesList !== prevShowingFilesListRef.current || showingSkillsList !== prevShowingSkillsListRef.current || showingAgentsList !== prevShowingAgentsListRef.current || showingToolsList !== prevShowingToolsListRef.current;
        // Reset to 0 when opening, search changes, or subpage changes
        if (didJustOpen || didSearchChange || didSubpageChange) {
            setSelectedIndex(0);
        }
        else if (options.length > 0 && selectedIndex >= options.length) {
            setSelectedIndex(Math.max(0, options.length - 1));
        }
        // Update refs
        prevIsOpenRef.current = isOpen;
        prevSearchRef.current = debouncedSearchText;
        prevShowingFilesListRef.current = showingFilesList;
        prevShowingSkillsListRef.current = showingSkillsList;
        prevShowingAgentsListRef.current = showingAgentsList;
        prevShowingToolsListRef.current = showingToolsList;
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
                    setSelectedIndex(function (prev) { return (prev + 1) % options.length; });
                    break;
                case "ArrowUp":
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    setSelectedIndex(function (prev) { return (prev - 1 + options.length) % options.length; });
                    break;
                case "Enter":
                    if (e.shiftKey)
                        return;
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    if (options[selectedIndex]) {
                        onSelect(options[selectedIndex]);
                    }
                    break;
                case "Escape":
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    onClose();
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
        // Account for header element
        var headerOffset = 1;
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
    // Calculate dropdown dimensions (matching canvas style)
    // Narrower dropdown when showing only categories (no changed files)
    var hasChangedFiles = changedFileOptions.length > 0;
    var isRootView = !showingFilesList && !showingSkillsList && !showingAgentsList && !showingToolsList && !hasOnlyFiles;
    // Narrow dropdown for root view (categories only) and skills/agents/tools subpages
    // Wide dropdown for files (showingFilesList or hasOnlyFiles)
    var useNarrowWidth = isRootView && !hasChangedFiles && !debouncedSearchText || showingSkillsList || showingAgentsList || showingToolsList;
    var dropdownWidth = useNarrowWidth ? 200 : 320;
    var itemHeight = 28;
    var headerHeight = 28;
    // Only add header height when header is actually shown (in subpages or when searching)
    var showsHeader = !isRootView || !!debouncedSearchText;
    var paddingHeight = 8;
    var requestedHeight = Math.min(options.length * itemHeight + (showsHeader ? headerHeight : 0) + paddingHeight, 200);
    var gap = 8;
    // Decide placement like Radix Popover (auto-flip top/bottom)
    var safeMargin = 10;
    var lineHeight = 20;
    var availableBelow = window.innerHeight - (position.top + lineHeight) - safeMargin;
    var availableAbove = position.top - safeMargin;
    // Compute desired placement, but lock it for the duration of the open state
    // Prefer above if there's more space above, or if below doesn't fit
    if (placementRef.current === null) {
        var condition1 = availableAbove >= requestedHeight && availableBelow < requestedHeight;
        var condition2 = availableAbove > availableBelow && availableAbove >= requestedHeight;
        var shouldPlaceAbove = condition1 || condition2;
        placementRef.current = shouldPlaceAbove ? "above" : "below";
    }
    var placeAbove = placementRef.current === "above";
    // Compute final top based on placement
    // Use line height for better positioning relative to cursor
    var finalTop = placeAbove ? position.top - gap : position.top + lineHeight + gap;
    // Position is already aligned to editor left edge, no offset needed
    var finalLeft = position.left;
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
    return (0, web_1.createPortal)(<tooltip_1.TooltipProvider delayDuration={300}>
      <div ref={dropdownRef} class="fixed z-[99999] overflow-y-auto rounded-[10px] border border-border bg-popover py-1 text-xs text-popover-foreground shadow-lg dark [&::-webkit-scrollbar]:hidden" style={{
            top: finalTop,
            left: finalLeft,
            width: "".concat(dropdownWidth, "px"),
            maxHeight: "".concat(computedMaxHeight, "px"),
            transform: transformY,
            scrollbarWidth: "none",
            msOverflowStyle: "none"
        }}>
        {/* Initial loading state (no previous data) */}
        {isLoading && options.length === 0 && <div class="flex items-center gap-1.5 h-7 px-1.5 mx-1 text-xs text-muted-foreground">
            <icons_1.IconSpinner class="h-3.5 w-3.5"/>
            <span>Loading files...</span>
          </div>}

        {/* Error state */}
        {error && <div class="h-7 px-1.5 mx-1 flex items-center text-xs text-muted-foreground">
            Error loading files
          </div>}

        {/* Empty state (only show when not fetching) */}
        {!isLoading && !isFetching && !error && options.length === 0 && <div class="h-7 px-1.5 mx-1 flex items-center text-xs text-muted-foreground">
            {debouncedSearchText ? "No files matching \"".concat(debouncedSearchText, "\"") : "No files found"}
          </div>}

        {/* File list */}
        {!isLoading && !error && options.length > 0 && <>
            {/* Flat list sorted by relevance */}
            <>
              {/* Header - only show in subpages or when searching, not in root view */}
                {(isInSubpage || debouncedSearchText) && <div class="px-2.5 py-1.5 mx-1 text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <span>
                      {showingFilesList || hasOnlyFiles ? "Files & Folders" : showingSkillsList ? "Skills" : showingAgentsList ? "Agents" : showingToolsList ? "MCP Tools" : "Results"}
                    </span>
                    {isFetching && !isLoading && <icons_1.IconSpinner class="h-2.5 w-2.5"/>}
                  </div>}
                {options.map(function (option, index) {
                var isSelected = selectedIndex === index;
                var OptionIcon = getOptionIcon(option);
                var isCategory = option.type === "category";
                var showTooltip = !isCategory && option.path;
                var itemContent = <div data-option-index={index} onClick={function () { return onSelect(option); }} onMouseEnter={function () {
                        setHoverIndex(index);
                        setSelectedIndex(index);
                    }} onMouseLeave={function () {
                        setHoverIndex(function (prev) { return prev === index ? null : prev; });
                    }} class={(0, utils_1.cn)("group inline-flex w-[calc(100%-8px)] mx-1 items-center whitespace-nowrap outline-none", "h-7 px-1.5 justify-start text-xs rounded-md", "transition-colors cursor-pointer select-none gap-1.5", isSelected ? "dark:bg-neutral-800 bg-accent text-foreground" : "text-muted-foreground dark:hover:bg-neutral-800 hover:bg-accent hover:text-foreground")}>
                      <OptionIcon class="h-3 w-3 text-muted-foreground flex-shrink-0"/>
                      <span class="flex items-center gap-1 w-full min-w-0">
                        <span class={(0, utils_1.cn)("shrink-0 whitespace-nowrap", isCategory && "font-medium")}>
                          {option.label}
                        </span>
                        {/* Diff stats for changed files */}
                        {(option.additions || option.deletions) && <span class="shrink-0 flex items-center gap-1 text-[10px] font-mono">
                            {option.additions ? <span class="text-green-500">
                                +{option.additions}
                              </span> : null}
                            {option.deletions ? <span class="text-red-500">
                                -{option.deletions}
                              </span> : null}
                          </span>}
                        {/* Show truncated path for files only, not for skills/agents (they show in tooltip) */}
                        {option.truncatedPath && !isCategory && option.type !== "skill" && option.type !== "agent" && <span class="text-muted-foreground flex-1 min-w-0 ml-2 font-mono overflow-hidden text-[10px]" style={{
                            direction: "rtl",
                            textAlign: "left",
                            whiteSpace: "nowrap"
                        }}>
                            <span style={{ direction: "ltr" }}>
                              {option.truncatedPath}
                            </span>
                          </span>}
                      </span>
                      {/* ChevronRight for category items (navigate to subpage) */}
                      {isCategory && <lucide_solid_1.ChevronRight class="ml-auto h-3.5 w-3.5 text-muted-foreground flex-shrink-0"/>}
                    </div>;
                if (showTooltip) {
                    return <tooltip_1.Tooltip key={option.id} open={isSelected}>
                        <tooltip_1.TooltipTrigger asChild>
                          {itemContent}
                        </tooltip_1.TooltipTrigger>
                        <tooltip_1.TooltipContent side="left" align="start" sideOffset={8} collisionPadding={16} avoidCollisions class="overflow-hidden">
                          {renderTooltipContent(option)}
                        </tooltip_1.TooltipContent>
                      </tooltip_1.Tooltip>;
                }
                return <div key={option.id}>{itemContent}</div>;
            })}
              </>
          </>}
      </div>
    </tooltip_1.TooltipProvider>, document.body);
});
