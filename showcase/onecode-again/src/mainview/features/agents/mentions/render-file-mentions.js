"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useRenderFileMentions = useRenderFileMentions;
exports.RenderFileMentions = RenderFileMentions;
exports.extractFileMentions = extractFileMentions;
exports.hasFileMentions = hasFileMentions;
exports.extractTextMentions = extractTextMentions;
exports.TextMentionBlock = TextMentionBlock;
exports.TextMentionBlocks = TextMentionBlocks;
var solid_js_1 = require("solid-js");
var agents_file_mention_1 = require("./agents-file-mention");
var icons_1 = require("../../../components/ui/icons");
var agents_mentions_editor_1 = require("./agents-mentions-editor");
var hover_card_1 = require("../../../components/ui/hover-card");
// UTF-8 safe base64 decoding (atob doesn't support Unicode)
function base64ToUtf8(base64) {
    var binString = atob(base64);
    var bytes = Uint8Array.from(binString, function (char) { return char.codePointAt(0); });
    return new TextDecoder().decode(bytes);
}
// Text selection icon - "A" with text cursor
function TextSelectIcon(_a) {
    var className = _a.className;
    return <svg viewBox="0 0 24 24" fill="none" class={className}>
      <path fillRule="evenodd" clipRule="evenodd" d="M8.50027 4C8.91147 4 9.28067 4.25166 9.43107 4.63435L14.9311 18.6343C15.133 19.1484 14.88 19.7288 14.366 19.9308C13.8519 20.1327 13.2715 19.8797 13.0695 19.3657L11.3545 15H5.64607L3.93107 19.3657C3.72907 19.8797 3.14867 20.1327 2.63462 19.9308C2.12058 19.7288 1.86757 19.1484 2.06952 18.6343L7.56947 4.63435C7.71987 4.25166 8.08907 4 8.50027 4ZM6.43177 13H10.5688L8.50027 7.73484L6.43177 13Z" fill="currentColor"/>
      <path d="M17 2C16.4477 2 16 2.44772 16 3C16 3.55228 16.4477 4 17 4H18V20H17C16.4477 20 16 20.4477 16 21C16 21.5523 16.4477 22 17 22H21C21.5523 22 22 21.5523 22 21C22 20.4477 21.5523 20 21 20H20V4H21C21.5523 4 22 3.55228 22 3C22 2.44772 21.5523 2 21 2H17Z" fill="currentColor"/>
    </svg>;
}
// Code selection icon - cursor arrow with text cursor
function CodeSelectIcon(_a) {
    var className = _a.className;
    return <svg viewBox="0 0 24 24" fill="none" class={className}>
      <path d="M14 2C13.4477 2 13 2.44772 13 3C13 3.55228 13.4477 4 14 4H15V20H14C13.4477 20 13 20.4477 13 21C13 21.5523 13.4477 22 14 22H18C18.5523 22 19 21.5523 19 21C19 20.4477 18.5523 20 18 20H17V4H18C18.5523 4 19 3.55228 19 3C19 2.44772 18.5523 2 18 2H14Z" fill="currentColor"/>
      <path d="M4.29287 5.29289C4.68338 4.90237 5.31638 4.90237 5.70698 5.29289L11.707 11.2929C12.0974 11.6834 12.0975 12.3165 11.707 12.707L5.70698 18.707C5.31648 19.0975 4.68338 19.0974 4.29287 18.707C3.90237 18.3164 3.90237 17.6834 4.29287 17.2929L9.58587 11.9999L4.29287 6.70696C3.90237 6.31643 3.90237 5.68342 4.29287 5.29289Z" fill="currentColor"/>
    </svg>;
}
// Custom folder icon matching design
function FolderOpenIcon(_a) {
    var className = _a.className;
    return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" class={className}>
      <path d="M4 8V6C4 4.89543 4.89543 4 6 4H14C15.1046 4 16 4.89543 16 6M4 8H8.17548C8.70591 8 9.21462 8.21071 9.58969 8.58579L11.4181 10.4142C11.7932 10.7893 12.3019 11 12.8323 11H16M4 8C3.44987 8 3.00391 8.44597 3.00391 8.99609V18C3.00391 19.1046 3.89934 20 5.00391 20H19.0039C20.1085 20 21.0039 19.1046 21.0039 18V12.0039C21.0039 11.4495 20.5544 11 20 11M16 11V6M16 11H20M16 6H18C19.1046 6 20 6.89543 20 8V11" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
    </svg>;
}
/**
* Parse file/folder/skill/agent/tool/quote/diff/pasted mention ID into its components
* Format: file:owner/repo:path/to/file.tsx or folder:owner/repo:path/to/folder or skill:skill-name or agent:agent-name or tool:mcp__server__toolname
* Quote format: quote:preview_text:full_text (base64 encoded full text)
* Diff format: diff:filepath:lineNumber:preview_text:full_text (base64 encoded full text)
* Pasted format: pasted:filepath:size:preview_text
*/
function parseMention(id) {
    var isFile = id.startsWith(agents_mentions_editor_1.MENTION_PREFIXES.FILE);
    var isFolder = id.startsWith(agents_mentions_editor_1.MENTION_PREFIXES.FOLDER);
    var isSkill = id.startsWith(agents_mentions_editor_1.MENTION_PREFIXES.SKILL);
    var isAgent = id.startsWith(agents_mentions_editor_1.MENTION_PREFIXES.AGENT);
    var isTool = id.startsWith(agents_mentions_editor_1.MENTION_PREFIXES.TOOL);
    var isQuote = id.startsWith(agents_mentions_editor_1.MENTION_PREFIXES.QUOTE);
    var isDiff = id.startsWith(agents_mentions_editor_1.MENTION_PREFIXES.DIFF);
    var isPasted = id.startsWith(agents_mentions_editor_1.MENTION_PREFIXES.PASTED);
    if (!isFile && !isFolder && !isSkill && !isAgent && !isTool && !isQuote && !isDiff && !isPasted)
        return null;
    // Handle quote mentions (format: quote:preview_text:base64_full_text)
    if (isQuote) {
        var content = id.slice(agents_mentions_editor_1.MENTION_PREFIXES.QUOTE.length);
        var separatorIdx = content.indexOf(":");
        if (separatorIdx === -1) {
            // Simple format without full text
            return {
                id: id,
                label: content.slice(0, 50) + (content.length > 50 ? "..." : ""),
                path: "",
                repository: "",
                type: "quote",
                fullText: content
            };
        }
        var preview = content.slice(0, separatorIdx);
        var encodedText = content.slice(separatorIdx + 1);
        var fullText = preview;
        try {
            fullText = base64ToUtf8(encodedText);
        }
        catch (_a) {
            fullText = preview;
        }
        return {
            id: id,
            label: preview,
            path: "",
            repository: "",
            type: "quote",
            fullText: fullText
        };
    }
    // Handle diff mentions (format: diff:filepath:lineNumber:preview_text:base64_full_text)
    if (isDiff) {
        var content = id.slice(agents_mentions_editor_1.MENTION_PREFIXES.DIFF.length);
        var parts_1 = content.split(":");
        if (parts_1.length < 3)
            return null;
        var filePath = parts_1[0] || "";
        var lineNumber = parseInt(parts_1[1] || "0", 10) || undefined;
        var preview = parts_1[2] || "";
        var encodedText = parts_1.slice(3).join(":");
        var fullText = preview;
        try {
            if (encodedText) {
                fullText = base64ToUtf8(encodedText);
            }
        }
        catch (_b) {
            fullText = preview;
        }
        var fileName = filePath.split("/").pop() || filePath;
        var lineInfo = lineNumber ? ":".concat(lineNumber) : "";
        return {
            id: id,
            label: "".concat(fileName).concat(lineInfo),
            path: filePath,
            repository: "",
            type: "diff",
            fullText: fullText,
            lineNumber: lineNumber
        };
    }
    // Handle pasted mentions (format: pasted:size:preview|filepath)
    // Using | as separator between preview and filepath since filepath can contain colons
    if (isPasted) {
        var content = id.slice(agents_mentions_editor_1.MENTION_PREFIXES.PASTED.length);
        var pipeIndex = content.lastIndexOf("|");
        if (pipeIndex === -1)
            return null;
        var beforePipe = content.slice(0, pipeIndex);
        var filePath = content.slice(pipeIndex + 1);
        var colonIndex = beforePipe.indexOf(":");
        if (colonIndex === -1)
            return null;
        var size = parseInt(beforePipe.slice(0, colonIndex) || "0", 10);
        var preview = beforePipe.slice(colonIndex + 1);
        return {
            id: id,
            label: preview,
            path: filePath,
            repository: "",
            type: "pasted",
            size: size
        };
    }
    // Handle skill mentions (simpler format: skill:name)
    if (isSkill) {
        var skillName = id.slice(agents_mentions_editor_1.MENTION_PREFIXES.SKILL.length);
        return {
            id: id,
            label: skillName,
            path: "",
            repository: "",
            type: "skill"
        };
    }
    // Handle agent mentions (simpler format: agent:name)
    if (isAgent) {
        var agentName = id.slice(agents_mentions_editor_1.MENTION_PREFIXES.AGENT.length);
        return {
            id: id,
            label: agentName,
            path: "",
            repository: "",
            type: "agent"
        };
    }
    // Handle tool mentions (format: tool:mcp__servername__toolname)
    if (isTool) {
        var toolPath = id.slice(agents_mentions_editor_1.MENTION_PREFIXES.TOOL.length);
        // Extract readable name from tool path (e.g., mcp__figma__get_design -> Get design)
        var parts_2 = toolPath.split("__");
        var toolName = parts_2.length >= 3 ? parts_2.slice(2).join("__") : toolPath;
        var displayName = toolName.replace(/_/g, " ").replace(/\b\w/g, function (c) { return c.toUpperCase(); }).trim();
        return {
            id: id,
            label: displayName,
            path: toolPath,
            repository: "",
            type: "tool"
        };
    }
    var parts = id.split(":");
    if (parts.length < 3)
        return null;
    var type = parts[0];
    var repository = parts[1];
    var path = parts.slice(2).join(":");
    var name = path.split("/").pop() || path;
    return {
        id: id,
        label: name,
        path: path,
        repository: repository,
        type: type
    };
}
/**
* Component to render a single file/folder/skill/agent/tool/quote/diff mention chip (matching canvas style)
*/
function MentionChip(_a) {
    var _b, _c;
    var mention = _a.mention;
    // Quote and diff mentions render as block cards
    if (mention.type === "quote") {
        // Get a short title from the label
        var title_1 = ((_b = mention.label.split("\n")[0]) === null || _b === void 0 ? void 0 : _b.slice(0, 20)) || mention.label.slice(0, 20);
        var displayTitle = title_1.length < mention.label.length ? "".concat(title_1, "...") : title_1;
        return <span class="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-muted/50 cursor-default min-w-[120px] max-w-[200px] align-middle">
        {/* Icon container */}
        <span class="flex items-center justify-center size-8 rounded-md bg-muted shrink-0">
          <TextSelectIcon class="size-4 text-muted-foreground"/>
        </span>
        {/* Text content */}
        <span class="flex flex-col min-w-0">
          <span class="text-sm font-medium text-foreground truncate">
            {displayTitle}
          </span>
          <span class="text-xs text-muted-foreground">
            Selected Text
          </span>
        </span>
      </span>;
    }
    if (mention.type === "diff") {
        var fileName = mention.path.split("/").pop() || mention.path;
        return <span class="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-muted/50 cursor-default min-w-[120px] max-w-[200px] align-middle">
        {/* Icon container */}
        <span class="flex items-center justify-center size-8 rounded-md bg-muted shrink-0">
          <CodeSelectIcon class="size-4 text-muted-foreground"/>
        </span>
        {/* Text content */}
        <span class="flex flex-col min-w-0">
          <span class="text-sm font-medium text-foreground truncate">
            {fileName}
          </span>
          <span class="text-xs text-muted-foreground">
            {mention.lineNumber ? "Line ".concat(mention.lineNumber) : "Code selection"}
          </span>
        </span>
      </span>;
    }
    var Icon = mention.type === "skill" ? icons_1.SkillIcon : mention.type === "agent" ? icons_1.CustomAgentIcon : mention.type === "tool" ? icons_1.OriginalMCPIcon : mention.type === "folder" ? FolderOpenIcon : (_c = (0, agents_file_mention_1.getFileIconByExtension)(mention.label)) !== null && _c !== void 0 ? _c : icons_1.FilesIcon;
    var title = mention.type === "skill" ? "Skill: ".concat(mention.label) : mention.type === "agent" ? "Agent: ".concat(mention.label) : mention.type === "tool" ? "MCP Tool: ".concat(mention.path) : "".concat(mention.repository, ":").concat(mention.path);
    return <span class="inline-flex items-center gap-1 px-[6px] rounded-[6px] text-sm align-middle bg-black/[0.04] dark:bg-white/[0.08] text-foreground/80 select-none" title={title}>
      <Icon class={mention.type === "tool" ? "h-3.5 w-3.5 text-muted-foreground flex-shrink-0" : "h-3 w-3 text-muted-foreground flex-shrink-0"}/>
      <span>{mention.label}</span>
    </span>;
}
/**
* Render text with ultrathink highlighting
*/
function renderTextWithUltrathink(text) {
    var parts = text.split(/(ultrathink)/gi);
    if (parts.length === 1)
        return text;
    return parts.map(function (part, index) {
        if (part.toLowerCase() === "ultrathink") {
            return <span key={index} class="chroma-text chroma-text-animate">
          {part}
        </span>;
        }
        return part;
    });
}
/**
* Hook to render text with file/folder mentions and ultrathink highlighting
* Returns array of React nodes with mentions rendered as chips
*/
function useRenderFileMentions(text) {
    return (0, solid_js_1.createMemo)(function () {
        var nodes = [];
        var regex = /@\[([^\]]+)\]/g;
        var lastIndex = 0;
        var match;
        var key = 0;
        while ((match = regex.exec(text)) !== null) {
            // Add text before mention (with ultrathink highlighting)
            if (match.index > lastIndex) {
                nodes.push(<span key={"text-".concat(key++)}>
            {renderTextWithUltrathink(text.slice(lastIndex, match.index))}
          </span>);
            }
            var id = match[1];
            var mention = parseMention(id);
            if (mention) {
                nodes.push(<MentionChip key={"mention-".concat(key++)} mention={mention}/>);
            }
            else {
                // Fallback: show as plain text if not a valid mention
                nodes.push(<span key={"unknown-".concat(key++)}>{match[0]}</span>);
            }
            lastIndex = match.index + match[0].length;
        }
        // Add remaining text (with ultrathink highlighting)
        if (lastIndex < text.length) {
            nodes.push(<span key={"text-end-".concat(key)}>
          {renderTextWithUltrathink(text.slice(lastIndex))}
        </span>);
        }
        return nodes;
    });
}
/**
* Component to render text with file mentions
*/
function RenderFileMentions(_a) {
    var text = _a.text, className = _a.className;
    var nodes = useRenderFileMentions(text);
    return <span class={className}>{nodes}</span>;
}
/**
* Extract all file/folder mentions from text
* Returns array of parsed mentions
*/
function extractFileMentions(text) {
    var mentions = [];
    var regex = /@\[([^\]]+)\]/g;
    var match;
    while ((match = regex.exec(text)) !== null) {
        var mention = parseMention(match[1]);
        if (mention) {
            mentions.push(mention);
        }
    }
    return mentions;
}
/**
* Check if text contains any file, folder, skill, agent, tool, quote, diff, or pasted mentions
*/
function hasFileMentions(text) {
    return /@\[(file|folder|skill|agent|tool|quote|diff|pasted):[^\]]+\]/.test(text);
}
/**
* Extract quote/diff/pasted mentions from text and return them separately with cleaned text
* Used for rendering these mentions as blocks above the message bubble
*/
function extractTextMentions(text) {
    var textMentions = [];
    var cleanedText = text;
    var regex = /@\[([^\]]+)\]/g;
    var match;
    var mentionsToRemove = [];
    while ((match = regex.exec(text)) !== null) {
        var id = match[1];
        if (id.startsWith(agents_mentions_editor_1.MENTION_PREFIXES.QUOTE) || id.startsWith(agents_mentions_editor_1.MENTION_PREFIXES.DIFF) || id.startsWith(agents_mentions_editor_1.MENTION_PREFIXES.PASTED)) {
            var parsed = parseMention(id);
            if (parsed) {
                textMentions.push(parsed);
                mentionsToRemove.push(match[0]);
            }
        }
    }
    // Remove the mentions from text
    for (var _i = 0, mentionsToRemove_1 = mentionsToRemove; _i < mentionsToRemove_1.length; _i++) {
        var mentionStr = mentionsToRemove_1[_i];
        cleanedText = cleanedText.replace(mentionStr, "");
    }
    // Clean up extra whitespace but preserve newlines
    // Only collapse multiple spaces (not newlines) into one space
    // and trim leading/trailing whitespace from each line
    cleanedText = cleanedText.split("\n").map(function (line) { return line.trim(); }).join("\n").replace(/\n{3,}/g, "\n\n").trim();
    return {
        textMentions: textMentions,
        cleanedText: cleanedText
    };
}
/**
* Format bytes to human readable size
*/
function formatSize(bytes) {
    if (bytes < 1024)
        return "".concat(bytes, " B");
    var kb = bytes / 1024;
    if (kb < 1024)
        return "".concat(kb.toFixed(1), " KB");
    return "".concat((kb / 1024).toFixed(1), " MB");
}
/**
* Component to render a single text mention block (quote/diff/pasted)
* Used for displaying above message bubbles, not inline
*/
function TextMentionBlock(_a) {
    var _b, _c, _d;
    var mention = _a.mention;
    if (mention.type !== "quote" && mention.type !== "diff" && mention.type !== "pasted")
        return null;
    var displayTitle = mention.type === "quote" ? ((_b = mention.label.split("\n")[0]) === null || _b === void 0 ? void 0 : _b.slice(0, 20)) || mention.label.slice(0, 20) : mention.type === "pasted" ? ((_c = mention.label.split("\n")[0]) === null || _c === void 0 ? void 0 : _c.slice(0, 20)) || mention.label.slice(0, 20) : ((_d = mention.path) === null || _d === void 0 ? void 0 : _d.split("/").pop()) || "Code";
    var title = displayTitle.length < 20 ? displayTitle : "".concat(displayTitle, "...");
    var subtitle = mention.type === "quote" ? "Selected Text" : mention.type === "pasted" ? "Pasted Text \u00B7 ".concat(formatSize(mention.size || 0)) : mention.lineNumber ? "Line ".concat(mention.lineNumber) : "Code selection";
    return <hover_card_1.HoverCard openDelay={300} closeDelay={100}>
      <hover_card_1.HoverCardTrigger asChild>
        <div class="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-muted/50 cursor-default min-w-[120px] max-w-[200px]">
          {/* Icon container */}
          <div class="flex items-center justify-center size-8 rounded-md bg-muted shrink-0">
            {mention.type === "quote" || mention.type === "pasted" ? <TextSelectIcon class="size-4 text-muted-foreground"/> : <CodeSelectIcon class="size-4 text-muted-foreground"/>}
          </div>

          {/* Text content */}
          <div class="flex flex-col min-w-0">
            <span class="text-sm font-medium text-foreground truncate">
              {title}
            </span>
            <span class="text-xs text-muted-foreground">
              {subtitle}
            </span>
          </div>
        </div>
      </hover_card_1.HoverCardTrigger>
      <hover_card_1.HoverCardContent side="top" align="start" class="w-80 max-h-48 overflow-y-auto">
        <div class="flex flex-col gap-1">
          <div class="flex items-center gap-1.5 text-xs text-muted-foreground">
            {mention.type === "quote" || mention.type === "pasted" ? <TextSelectIcon class="size-3"/> : <CodeSelectIcon class="size-3"/>}
            <span>
              {mention.type === "quote" ? "Selected text" : mention.type === "pasted" ? "Pasted text \u00B7 ".concat(formatSize(mention.size || 0)) : "".concat(mention.path).concat(mention.lineNumber ? ":".concat(mention.lineNumber) : "")}
            </span>
          </div>
          <pre class="text-sm whitespace-pre-wrap break-words font-mono">
            {mention.fullText || mention.label}
          </pre>
        </div>
      </hover_card_1.HoverCardContent>
    </hover_card_1.HoverCard>;
}
/**
* Component to render multiple text mention blocks
*/
function TextMentionBlocks(_a) {
    var mentions = _a.mentions;
    var textMentions = mentions.filter(function (m) { return m.type === "quote" || m.type === "diff" || m.type === "pasted"; });
    if (textMentions.length === 0)
        return null;
    return <div class="flex flex-wrap gap-1.5">
      {textMentions.map(function (mention, idx) { return <TextMentionBlock key={idx} mention={mention}/>; })}
    </div>;
}
