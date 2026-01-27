"use strict";
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
exports.MemoizedMarkdown = exports.FullscreenMarkdownRenderer = exports.CompactMarkdownRenderer = exports.ChatMarkdownRenderer = void 0;
exports.stripEmojis = stripEmojis;
var utils_1 = require("../lib/utils");
var solid_js_1 = require("solid-js");
var streamdown_1 = require("streamdown");
var remark_breaks_1 = require("remark-breaks");
var remark_gfm_1 = require("remark-gfm");
var lucide_solid_1 = require("lucide-solid");
var use_code_theme_1 = require("../lib/hooks/use-code-theme");
var shiki_theme_loader_1 = require("../lib/themes/shiki-theme-loader");
var mermaid_block_1 = require("./mermaid-block");
// Function to strip emojis from text (only common emojis, preserving markdown symbols)
function stripEmojis(text) {
    return text.replace(/[\u{1F600}-\u{1F64F}]/gu, "").replace(/[\u{1F300}-\u{1F5FF}]/gu, "").replace(/[\u{1F680}-\u{1F6FF}]/gu, "").replace(/[\u{1F1E0}-\u{1F1FF}]/gu, "").replace(/[\u{1F900}-\u{1F9FF}]/gu, "").replace(/[\u{1FA00}-\u{1FAFF}]/gu, "").replace(/[\u{2700}-\u{27BF}]/gu, "");
}
// Escape HTML special characters for safe rendering
function escapeHtml(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
// Code block text sizes matching paragraph text sizes
var codeBlockTextSize = {
    sm: "text-sm",
    md: "text-sm",
    lg: "text-sm"
};
// Code block with copy button using Shiki
function CodeBlock(_a) {
    var _this = this;
    var language = _a.language, children = _a.children, themeId = _a.themeId, _b = _a.size, size = _b === void 0 ? "md" : _b;
    var _c = (0, solid_js_1.createSignal)(false), copied = _c[0], setCopied = _c[1];
    var _d = (0, solid_js_1.createSignal)(null), highlightedHtml = _d[0], setHighlightedHtml = _d[1];
    var handleCopy = function () {
        navigator.clipboard.writeText(children);
        setCopied(true);
        setTimeout(function () { return setCopied(false); }, 2e3);
    };
    // Only use Shiki for known programming languages, not for plaintext/ASCII art
    var shouldHighlight = language && language !== "plaintext" && language !== "text";
    (0, solid_js_1.createEffect)(function () {
        if (!shouldHighlight)
            return;
        var cancelled = false;
        var highlight = function () { return __awaiter(_this, void 0, void 0, function () {
            var html, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, (0, shiki_theme_loader_1.highlightCode)(children, language, themeId)];
                    case 1:
                        html = _a.sent();
                        if (!cancelled) {
                            setHighlightedHtml(html);
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        console.error("Failed to highlight code:", error_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        highlight();
        return function () {
            cancelled = true;
        };
    });
    // For plaintext/ASCII art, just escape and render directly (no Shiki)
    // For code with syntax highlighting, use Shiki output when available
    var htmlContent = shouldHighlight ? highlightedHtml !== null && highlightedHtml !== void 0 ? highlightedHtml : escapeHtml(children) : escapeHtml(children);
    return <div class="relative mt-2 mb-4 rounded-[10px] bg-muted/50 overflow-hidden">
      <button onClick={handleCopy} tabIndex={-1} class="absolute top-[6px] right-[6px] p-1 z-2" title={copied ? "Copied!" : "Copy code"}>
        <div class="relative w-3.5 h-3.5">
          <lucide_solid_1.Copy class={(0, utils_1.cn)("absolute inset-0 w-3 h-3 text-muted-foreground transition-[opacity,transform] duration-200 ease-out hover:text-foreground", copied ? "opacity-0 scale-50" : "opacity-100 scale-100")}/>
          <lucide_solid_1.Check class={(0, utils_1.cn)("absolute inset-0 w-3 h-3 text-muted-foreground transition-[opacity,transform] duration-200 ease-out", copied ? "opacity-100 scale-100" : "opacity-0 scale-50")}/>
        </div>
      </button>
      <pre class={(0, utils_1.cn)("m-0 bg-transparent", "text-foreground", codeBlockTextSize[size], "px-4 py-3", "overflow-x-auto", "whitespace-pre", 
        // Force all nested elements to preserve whitespace and have no background
        "[&_*]:whitespace-pre [&_*]:bg-transparent", "[&_pre]:m-0 [&_code]:m-0", "[&_pre]:p-0 [&_code]:p-0")} style={{
            fontFamily: "SFMono-Regular, Menlo, Consolas, 'PT Mono', 'Liberation Mono', Courier, monospace",
            lineHeight: 1.5,
            tabSize: 2
        }}>
        <code dangerouslySetInnerHTML={{ __html: htmlContent }}/>
      </pre>
    </div>;
}
// Size-based styles inspired by Notion's spacing
var sizeStyles = {
    sm: {
        h1: "text-base font-semibold text-foreground mt-[1.4em] mb-px first:mt-0 leading-[1.3]",
        h2: "text-base font-semibold text-foreground mt-[1.4em] mb-px first:mt-0 leading-[1.3]",
        h3: "text-sm font-semibold text-foreground mt-[1em] mb-px first:mt-0 leading-[1.3]",
        h4: "text-sm font-medium text-foreground mt-[1em] mb-px first:mt-0 leading-[1.3]",
        h5: "text-sm font-medium text-foreground mt-[1em] mb-px first:mt-0 leading-[1.3]",
        h6: "text-sm font-medium text-foreground mt-[1em] mb-px first:mt-0 leading-[1.3]",
        p: "text-sm text-foreground/80 my-px leading-normal py-[3px]",
        ul: "list-disc list-inside text-sm text-foreground/80 mb-px marker:text-foreground/60",
        ol: "list-decimal list-inside text-sm text-foreground/80 mb-px marker:text-foreground/60",
        li: "text-sm text-foreground/80 py-[3px]",
        inlineCode: "bg-foreground/[0.06] dark:bg-foreground/[0.1] font-mono text-[85%] rounded px-[0.4em] py-[0.2em] break-all",
        blockquote: "border-l-2 border-foreground/20 pl-3 text-foreground/70 mb-px text-sm",
        hr: "mt-8 mb-4 border-t border-border",
        table: "w-full text-sm",
        thead: "border-b border-border",
        tbody: "",
        tr: "[&:not(:last-child)]:border-b [&:not(:last-child)]:border-border",
        th: "text-left text-sm font-medium text-foreground px-3 py-2 bg-muted/50 border-r border-border last:border-r-0",
        td: "text-sm text-foreground/80 px-3 py-2 border-r border-border last:border-r-0"
    },
    md: {
        h1: "text-[1.5em] font-semibold text-foreground mt-[1.4em] mb-px first:mt-0 leading-[1.3]",
        h2: "text-[1.5em] font-semibold text-foreground mt-[1.4em] mb-px first:mt-0 leading-[1.3]",
        h3: "text-[1.25em] font-semibold text-foreground mt-[1em] mb-px first:mt-0 leading-[1.3]",
        h4: "text-base font-semibold text-foreground mt-[1em] mb-px first:mt-0 leading-[1.3]",
        h5: "text-sm font-medium text-foreground mt-[1em] mb-px first:mt-0 leading-[1.3]",
        h6: "text-sm font-medium text-foreground mt-[1em] mb-px first:mt-0 leading-[1.3]",
        p: "text-sm text-foreground/80 my-px leading-normal py-[3px]",
        ul: "list-disc list-inside text-sm text-foreground/80 mb-px marker:text-foreground/60",
        ol: "list-decimal list-inside text-sm text-foreground/80 mb-px marker:text-foreground/60",
        li: "text-sm text-foreground/80 py-[3px]",
        inlineCode: "bg-foreground/[0.06] dark:bg-foreground/[0.1] font-mono text-[85%] rounded px-[0.4em] py-[0.2em] break-all",
        blockquote: "border-l-2 border-foreground/20 pl-4 text-foreground/70 mb-px",
        hr: "mt-8 mb-4 border-t border-border",
        table: "w-full text-sm",
        thead: "border-b border-border",
        tbody: "",
        tr: "[&:not(:last-child)]:border-b [&:not(:last-child)]:border-border",
        th: "text-left text-sm font-medium text-foreground px-3 py-2 bg-muted/50 border-r border-border last:border-r-0",
        td: "text-sm text-foreground/80 px-3 py-2 border-r border-border last:border-r-0"
    },
    lg: {
        h1: "text-[1.875em] font-semibold text-foreground mt-[1.4em] mb-px first:mt-0 leading-[1.3]",
        h2: "text-[1.5em] font-semibold text-foreground mt-[1.4em] mb-px first:mt-0 leading-[1.3]",
        h3: "text-[1.25em] font-semibold text-foreground mt-[1em] mb-px first:mt-0 leading-[1.3]",
        h4: "text-base font-semibold text-foreground mt-[1em] mb-px first:mt-0 leading-[1.3]",
        h5: "text-sm font-medium text-foreground mt-[1em] mb-px first:mt-0 leading-[1.3]",
        h6: "text-sm font-medium text-foreground mt-[1em] mb-px first:mt-0 leading-[1.3]",
        p: "text-sm text-foreground/80 my-px leading-normal py-[3px]",
        ul: "list-disc list-inside text-sm text-foreground/80 mb-px marker:text-foreground/60",
        ol: "list-decimal list-inside text-sm text-foreground/80 mb-px marker:text-foreground/60",
        li: "text-sm text-foreground/80 py-[3px]",
        inlineCode: "bg-foreground/[0.06] dark:bg-foreground/[0.1] font-mono text-[85%] rounded px-[0.4em] py-[0.2em] break-all",
        blockquote: "border-l-2 border-foreground/20 pl-4 text-foreground/70 mb-px",
        hr: "mt-8 mb-4 border-t border-border",
        table: "w-full text-sm",
        thead: "border-b border-border",
        tbody: "",
        tr: "[&:not(:last-child)]:border-b [&:not(:last-child)]:border-border",
        th: "text-left text-sm font-medium text-foreground px-3 py-2 bg-muted/50 border-r border-border last:border-r-0",
        td: "text-sm text-foreground/80 px-3 py-2 border-r border-border last:border-r-0"
    }
};
// Custom code component that uses our theme system
function createCodeComponent(codeTheme, size, styles, isStreaming) {
    if (isStreaming === void 0) { isStreaming = false; }
    return function CodeComponent(_a) {
        var className = _a.className, children = _a.children, node = _a.node, props = __rest(_a, ["className", "children", "node"]);
        var match = /language-(\w+)/.exec(className || "");
        var language = match ? match[1] : undefined;
        var codeContent = String(children);
        // Check if this is a code block (has language) or inline code
        // Streamdown wraps code blocks in <pre><code>, inline code is just <code>
        var isCodeBlock = language || codeContent.includes("\n") && codeContent.length > 100;
        if (isCodeBlock) {
            // Route mermaid blocks to MermaidBlock component
            if (language === "mermaid") {
                // Pass isStreaming to MermaidBlock
                // When streaming, MermaidBlock shows a placeholder instead of trying to render
                return <mermaid_block_1.MermaidBlock code={codeContent.replace(/\n$/, "")} size={size} isStreaming={isStreaming}/>;
            }
            return <CodeBlock language={language} themeId={codeTheme} size={size}>
          {codeContent.replace(/\n$/, "")}
        </CodeBlock>;
        }
        // Inline code
        return <span class={styles.inlineCode}>{children}</span>;
    };
}
exports.ChatMarkdownRenderer = memo(function ChatMarkdownRenderer(_a) {
    var content = _a.content, _b = _a.size, size = _b === void 0 ? "md" : _b, className = _a.className, _c = _a.isStreaming, isStreaming = _c === void 0 ? false : _c;
    var codeTheme = (0, use_code_theme_1.useCodeTheme)();
    var styles = sizeStyles[size];
    // Process content - strip emojis
    var processedContent = (0, solid_js_1.createMemo)(function () { return stripEmojis(content); });
    // Memoize components object to prevent re-renders
    // This is critical for Streamdown's block-level memoization to work
    var components = (0, solid_js_1.createMemo)(function () { return ({
        h1: function (_a) {
            var children = _a.children, props = __rest(_a, ["children"]);
            return <h1 class={styles.h1} {...props}>
          {children}
        </h1>;
        },
        h2: function (_a) {
            var children = _a.children, props = __rest(_a, ["children"]);
            return <h2 class={styles.h2} {...props}>
          {children}
        </h2>;
        },
        h3: function (_a) {
            var children = _a.children, props = __rest(_a, ["children"]);
            return <h3 class={styles.h3} {...props}>
          {children}
        </h3>;
        },
        h4: function (_a) {
            var children = _a.children, props = __rest(_a, ["children"]);
            return <h4 class={styles.h4} {...props}>
          {children}
        </h4>;
        },
        h5: function (_a) {
            var children = _a.children, props = __rest(_a, ["children"]);
            return <h5 class={styles.h5} {...props}>
          {children}
        </h5>;
        },
        h6: function (_a) {
            var children = _a.children, props = __rest(_a, ["children"]);
            return <h6 class={styles.h6} {...props}>
          {children}
        </h6>;
        },
        p: function (_a) {
            var children = _a.children, props = __rest(_a, ["children"]);
            return <p class={styles.p} {...props}>
          {children}
        </p>;
        },
        ul: function (_a) {
            var children = _a.children, props = __rest(_a, ["children"]);
            return <ul class={styles.ul} {...props}>
          {children}
        </ul>;
        },
        ol: function (_a) {
            var children = _a.children, props = __rest(_a, ["children"]);
            return <ol class={styles.ol} {...props}>
          {children}
        </ol>;
        },
        li: function (_a) {
            var children = _a.children, props = __rest(_a, ["children"]);
            return <li class={styles.li} {...props}>
          {children}
        </li>;
        },
        a: function (_a) {
            var href = _a.href, children = _a.children, props = __rest(_a, ["href", "children"]);
            return <a href={href} onClick={function (e) {
                    e.preventDefault();
                    if (href) {
                        window.desktopApi.openExternal(href);
                    }
                }} class="text-blue-600 dark:text-blue-400 no-underline hover:underline hover:decoration-current underline-offset-2 decoration-1 transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500/30 focus-visible:rounded-sm" {...props}>
          {children}
        </a>;
        },
        strong: function (_a) {
            var children = _a.children, props = __rest(_a, ["children"]);
            return <strong class="font-medium text-foreground" {...props}>
          {children}
        </strong>;
        },
        em: function (_a) {
            var children = _a.children, props = __rest(_a, ["children"]);
            return <em class="italic" {...props}>
          {children}
        </em>;
        },
        blockquote: function (_a) {
            var children = _a.children, props = __rest(_a, ["children"]);
            return <blockquote class={styles.blockquote} {...props}>
          {children}
        </blockquote>;
        },
        hr: function (_a) {
            var props = __rest(_a, []);
            return <hr class={styles.hr} {...props}/>;
        },
        table: function (_a) {
            var children = _a.children, props = __rest(_a, ["children"]);
            return <div class="overflow-x-auto my-3 rounded-lg border border-border overflow-hidden">
          <table class={(0, utils_1.cn)(styles.table, "border-collapse")} {...props}>
            {children}
          </table>
        </div>;
        },
        thead: function (_a) {
            var children = _a.children, props = __rest(_a, ["children"]);
            return <thead class={styles.thead} {...props}>
          {children}
        </thead>;
        },
        tbody: function (_a) {
            var children = _a.children, props = __rest(_a, ["children"]);
            return <tbody class={styles.tbody} {...props}>
          {children}
        </tbody>;
        },
        tr: function (_a) {
            var children = _a.children, props = __rest(_a, ["children"]);
            return <tr class={styles.tr} {...props}>
          {children}
        </tr>;
        },
        th: function (_a) {
            var children = _a.children, props = __rest(_a, ["children"]);
            return <th class={styles.th} {...props}>
          {children}
        </th>;
        },
        td: function (_a) {
            var children = _a.children, props = __rest(_a, ["children"]);
            return <td class={styles.td} {...props}>
          {children}
        </td>;
        },
        pre: function (_a) {
            var children = _a.children;
            return <>{children}</>;
        },
        code: createCodeComponent(codeTheme, size, styles, isStreaming)
    }); });
    return <div class={(0, utils_1.cn)("prose prose-sm max-w-none dark:prose-invert prose-code:before:content-none prose-code:after:content-none", 
        // Reset prose margins - we use our own compact Notion-like spacing
        "prose-p:my-0 prose-ul:my-0 prose-ol:my-0 prose-li:my-0", "prose-ul:pl-0 prose-ol:pl-0 prose-li:pl-0", 
        // Reset prose hr margins - we use our own
        "prose-hr:my-0", 
        // Reset prose table margins - we use our own wrapper with margins
        "prose-table:my-0", 
        // Fix for p inside li - make it inline so numbered list items don't break
        "[&_li>p]:inline [&_li>p]:mb-0", 
        // Prevent horizontal overflow on mobile
        "overflow-hidden break-words", 
        // Global spacing: elements before hr get extra bottom margin (for spacing above divider)
        "[&_p:has(+hr)]:mb-6 [&_ul:has(+hr)]:mb-6 [&_ol:has(+hr)]:mb-6 [&_div:has(+hr)]:mb-6 [&_table:has(+hr)]:mb-6 [&_h1:has(+hr)]:mb-6 [&_h2:has(+hr)]:mb-6 [&_h3:has(+hr)]:mb-6 [&_blockquote:has(+hr)]:mb-6", 
        // Global spacing: elements after hr get extra top margin
        "[&_hr+p]:mt-4 [&_hr+ul]:mt-4 [&_hr+ol]:mt-4", 
        // Global spacing: elements after code blocks get extra top margin
        "[&_div+p]:mt-2 [&_div+ul]:mt-2 [&_div+ol]:mt-2", 
        // Global spacing: elements after tables get extra top margin
        "[&_table+p]:mt-4 [&_table+ul]:mt-4 [&_table+ol]:mt-4", className)}>
      <streamdown_1.Streamdown mode="streaming" components={components} remarkPlugins={[remark_gfm_1.default, remark_breaks_1.default]} isAnimating={isStreaming} parseIncompleteMarkdown={isStreaming} controls={false}>
        {processedContent}
      </streamdown_1.Streamdown>
    </div>;
});
// Convenience exports for specific use cases
exports.CompactMarkdownRenderer = memo(function CompactMarkdownRenderer(_a) {
    var content = _a.content, className = _a.className;
    return <exports.ChatMarkdownRenderer content={content} size="sm" class={className}/>;
});
exports.FullscreenMarkdownRenderer = memo(function FullscreenMarkdownRenderer(_a) {
    var content = _a.content, className = _a.className;
    return <exports.ChatMarkdownRenderer content={content} size="lg" class={className}/>;
});
// ============================================================================
// MEMOIZED MARKDOWN - Block-level memoization for streaming performance
// ============================================================================
// This is the KEY optimization for streaming performance!
// Instead of re-rendering the entire markdown on each chunk, we:
// 1. Parse markdown into discrete blocks (paragraphs, headers, code blocks, etc.)
// 2. Memoize each block individually with content-based keys
// 3. Only the last (incomplete) block re-renders during streaming
//
// Streamdown's internal memoization only works within a single render pass.
// When the parent component re-renders (due to atom update), Streamdown
// re-renders all blocks. This external block-level memoization prevents that.
// Simple hash function for content-based keys
// Using djb2 algorithm - fast and good distribution
function hashString(str) {
    var hash = 5381;
    for (var i = 0; i < str.length; i++) {
        hash = (hash << 5) + hash ^ str.charCodeAt(i);
    }
    // Convert to unsigned 32-bit and then to base36 for shorter keys
    return (hash >>> 0).toString(36);
}
function parseIntoBlocks(markdown) {
    try {
        // Use Streamdown's built-in parser for consistency
        var blocks = (0, streamdown_1.parseMarkdownIntoBlocks)(markdown);
        // Track occurrences of each content hash to handle duplicates
        var seen_1 = new Map();
        return blocks.map(function (content) {
            var _a;
            var baseKey = hashString(content);
            var occurrence = (_a = seen_1.get(baseKey)) !== null && _a !== void 0 ? _a : 0;
            seen_1.set(baseKey, occurrence + 1);
            var key = occurrence > 0 ? "".concat(baseKey, "-").concat(occurrence) : baseKey;
            return {
                content: content,
                key: key
            };
        });
    }
    catch (_a) {
        // Fallback: return entire content as single block
        return [{
                content: markdown,
                key: "fallback-".concat(hashString(markdown))
            }];
    }
}
// Individual block - only re-renders when its content changes
var MemoizedMarkdownBlock = memo(function MemoizedMarkdownBlock(_a) {
    var content = _a.content, size = _a.size, className = _a.className, codeTheme = _a.codeTheme;
    // Don't render empty blocks
    if (!content.trim())
        return null;
    var styles = sizeStyles[size];
    // Memoize components object - critical for preventing re-renders
    var components = (0, solid_js_1.createMemo)(function () { return ({
        h1: function (_a) {
            var children = _a.children, props = __rest(_a, ["children"]);
            return <h1 class={styles.h1} {...props}>
            {children}
          </h1>;
        },
        h2: function (_a) {
            var children = _a.children, props = __rest(_a, ["children"]);
            return <h2 class={styles.h2} {...props}>
            {children}
          </h2>;
        },
        h3: function (_a) {
            var children = _a.children, props = __rest(_a, ["children"]);
            return <h3 class={styles.h3} {...props}>
            {children}
          </h3>;
        },
        h4: function (_a) {
            var children = _a.children, props = __rest(_a, ["children"]);
            return <h4 class={styles.h4} {...props}>
            {children}
          </h4>;
        },
        h5: function (_a) {
            var children = _a.children, props = __rest(_a, ["children"]);
            return <h5 class={styles.h5} {...props}>
            {children}
          </h5>;
        },
        h6: function (_a) {
            var children = _a.children, props = __rest(_a, ["children"]);
            return <h6 class={styles.h6} {...props}>
            {children}
          </h6>;
        },
        p: function (_a) {
            var children = _a.children, props = __rest(_a, ["children"]);
            return <p class={styles.p} {...props}>
            {children}
          </p>;
        },
        ul: function (_a) {
            var children = _a.children, props = __rest(_a, ["children"]);
            return <ul class={styles.ul} {...props}>
            {children}
          </ul>;
        },
        ol: function (_a) {
            var children = _a.children, props = __rest(_a, ["children"]);
            return <ol class={styles.ol} {...props}>
            {children}
          </ol>;
        },
        li: function (_a) {
            var children = _a.children, props = __rest(_a, ["children"]);
            return <li class={styles.li} {...props}>
            {children}
          </li>;
        },
        a: function (_a) {
            var href = _a.href, children = _a.children, props = __rest(_a, ["href", "children"]);
            return <a href={href} onClick={function (e) {
                    e.preventDefault();
                    if (href) {
                        window.desktopApi.openExternal(href);
                    }
                }} class="text-blue-600 dark:text-blue-400 no-underline hover:underline hover:decoration-current underline-offset-2 decoration-1 transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500/30 focus-visible:rounded-sm" {...props}>
            {children}
          </a>;
        },
        strong: function (_a) {
            var children = _a.children, props = __rest(_a, ["children"]);
            return <strong class="font-medium text-foreground" {...props}>
            {children}
          </strong>;
        },
        em: function (_a) {
            var children = _a.children, props = __rest(_a, ["children"]);
            return <em class="italic" {...props}>
            {children}
          </em>;
        },
        blockquote: function (_a) {
            var children = _a.children, props = __rest(_a, ["children"]);
            return <blockquote class={styles.blockquote} {...props}>
            {children}
          </blockquote>;
        },
        hr: function (_a) {
            var props = __rest(_a, []);
            return <hr class={styles.hr} {...props}/>;
        },
        table: function (_a) {
            var children = _a.children, props = __rest(_a, ["children"]);
            return <div class="overflow-x-auto my-3 rounded-lg border border-border overflow-hidden">
            <table class={(0, utils_1.cn)(styles.table, "border-collapse")} {...props}>
              {children}
            </table>
          </div>;
        },
        thead: function (_a) {
            var children = _a.children, props = __rest(_a, ["children"]);
            return <thead class={styles.thead} {...props}>
            {children}
          </thead>;
        },
        tbody: function (_a) {
            var children = _a.children, props = __rest(_a, ["children"]);
            return <tbody class={styles.tbody} {...props}>
            {children}
          </tbody>;
        },
        tr: function (_a) {
            var children = _a.children, props = __rest(_a, ["children"]);
            return <tr class={styles.tr} {...props}>
            {children}
          </tr>;
        },
        th: function (_a) {
            var children = _a.children, props = __rest(_a, ["children"]);
            return <th class={styles.th} {...props}>
            {children}
          </th>;
        },
        td: function (_a) {
            var children = _a.children, props = __rest(_a, ["children"]);
            return <td class={styles.td} {...props}>
            {children}
          </td>;
        },
        pre: function (_a) {
            var children = _a.children;
            return <>{children}</>;
        },
        code: createCodeComponent(codeTheme, size, styles)
    }); });
    return <streamdown_1.Streamdown mode="static" components={components} remarkPlugins={[remark_gfm_1.default, remark_breaks_1.default]} controls={false}>
        {content}
      </streamdown_1.Streamdown>;
}, function (prevProps, nextProps) {
    // Only re-render if content or styling actually changed
    return prevProps.content === nextProps.content && prevProps.size === nextProps.size && prevProps.className === nextProps.className && prevProps.codeTheme === nextProps.codeTheme;
});
MemoizedMarkdownBlock.displayName = "MemoizedMarkdownBlock";
// Main memoized markdown component - splits into blocks and memoizes each
exports.MemoizedMarkdown = memo(function MemoizedMarkdown(_a) {
    var content = _a.content, id = _a.id, _b = _a.size, size = _b === void 0 ? "sm" : _b, className = _a.className;
    var codeTheme = (0, use_code_theme_1.useCodeTheme)();
    // Pre-process content - strip emojis
    var processedContent = (0, solid_js_1.createMemo)(function () { return stripEmojis(content); });
    // Split into blocks - this recalculates when content changes,
    // but each block is individually memoized with content-based keys
    var blocks = (0, solid_js_1.createMemo)(function () { return parseIntoBlocks(processedContent); });
    return <div class={(0, utils_1.cn)("prose prose-sm max-w-none dark:prose-invert prose-code:before:content-none prose-code:after:content-none", "prose-p:my-0 prose-ul:my-0 prose-ol:my-0 prose-li:my-0", "prose-ul:pl-0 prose-ol:pl-0 prose-li:pl-0", "prose-hr:my-0", "prose-table:my-0", "[&_li>p]:inline [&_li>p]:mb-0", "overflow-hidden break-words", "[&_p:has(+hr)]:mb-6 [&_ul:has(+hr)]:mb-6 [&_ol:has(+hr)]:mb-6 [&_div:has(+hr)]:mb-6 [&_table:has(+hr)]:mb-6 [&_h1:has(+hr)]:mb-6 [&_h2:has(+hr)]:mb-6 [&_h3:has(+hr)]:mb-6 [&_blockquote:has(+hr)]:mb-6", "[&_hr+p]:mt-4 [&_hr+ul]:mt-4 [&_hr+ol]:mt-4", "[&_div+p]:mt-2 [&_div+ul]:mt-2 [&_div+ol]:mt-2", "[&_table+p]:mt-4 [&_table+ul]:mt-4 [&_table+ol]:mt-4", className)}>
        {blocks.map(function (block) { return <MemoizedMarkdownBlock key={"".concat(id, "-").concat(block.key)} content={block.content} size={size} class={className} codeTheme={codeTheme}/>; })}
      </div>;
});
exports.MemoizedMarkdown.displayName = "MemoizedMarkdown";
