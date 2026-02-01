import { cn } from "../lib/utils";
import { createSignal, createEffect, createMemo, For, Show, onCleanup, type Component } from "solid-js";
import { Streamdown, parseMarkdownIntoBlocks } from "streamdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { Copy, Check } from "lucide-solid";
import { useCodeTheme } from "../lib/hooks/use-code-theme";
import { highlightCode } from "../lib/themes/shiki-theme-loader";
import { MermaidBlock } from "./mermaid-block";
// Function to strip emojis from text (only common emojis, preserving markdown symbols)
export function stripEmojis(text: string): string {
	return text.replace(/[\u{1F600}-\u{1F64F}]/gu, "").replace(/[\u{1F300}-\u{1F5FF}]/gu, "").replace(/[\u{1F680}-\u{1F6FF}]/gu, "").replace(/[\u{1F1E0}-\u{1F1FF}]/gu, "").replace(/[\u{1F900}-\u{1F9FF}]/gu, "").replace(/[\u{1FA00}-\u{1FAFF}]/gu, "").replace(/[\u{2700}-\u{27BF}]/gu, "");
}
// Escape HTML special characters for safe rendering
function escapeHtml(text: string): string {
	return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
// Code block text sizes matching paragraph text sizes
const codeBlockTextSize = {
	sm: "text-sm",
	md: "text-sm",
	lg: "text-sm"
};
// Code block with copy button using Shiki
interface CodeBlockProps {
	language?: string;
	children: string;
	themeId: string;
	size?: "sm" | "md" | "lg";
}
function CodeBlock(props: CodeBlockProps) {
	const size = () => props.size ?? "md";
	const [copied, setCopied] = createSignal(false);
	const [highlightedHtml, setHighlightedHtml] = createSignal<string | null>(null);
	const handleCopy = () => {
		navigator.clipboard.writeText(props.children);
		setCopied(true);
		setTimeout(() => setCopied(false), 2e3);
	};
	// Only use Shiki for known programming languages, not for plaintext/ASCII art
	const shouldHighlight = props.language && props.language !== "plaintext" && props.language !== "text";
	createEffect(() => {
		if (!shouldHighlight) return;
		let cancelled = false;
		const highlight = async () => {
			try {
				const html = await highlightCode(props.children, props.language!, props.themeId);
				if (!cancelled) {
					setHighlightedHtml(html);
				}
			} catch (error) {
				console.error("Failed to highlight code:", error);
			}
		};
		highlight();
		onCleanup(() => {
			cancelled = true;
		});
	});
	// For plaintext/ASCII art, just escape and render directly (no Shiki)
	// For code with syntax highlighting, use Shiki output when available
	const htmlContent = () => shouldHighlight ? highlightedHtml() ?? escapeHtml(props.children) : escapeHtml(props.children);
	return <div class="relative mt-2 mb-4 rounded-[10px] bg-muted/50 overflow-hidden">
      <button onClick={handleCopy} tabIndex={-1} class="absolute top-[6px] right-[6px] p-1 z-2" title={copied() ? "Copied!" : "Copy code"}>
        <div class="relative w-3.5 h-3.5">
          <Copy class={cn("absolute inset-0 w-3 h-3 text-muted-foreground transition-[opacity,transform] duration-200 ease-out hover:text-foreground", copied() ? "opacity-0 scale-50" : "opacity-100 scale-100")} />
          <Check class={cn("absolute inset-0 w-3 h-3 text-muted-foreground transition-[opacity,transform] duration-200 ease-out", copied() ? "opacity-100 scale-100" : "opacity-0 scale-50")} />
        </div>
      </button>
      <pre class={cn(
		"m-0 bg-transparent",
		"text-foreground",
		codeBlockTextSize[size()],
		"px-4 py-3",
		"overflow-x-auto",
		"whitespace-pre",
		// Force all nested elements to preserve whitespace and have no background
		"[&_*]:whitespace-pre [&_*]:bg-transparent",
		"[&_pre]:m-0 [&_code]:m-0",
		"[&_pre]:p-0 [&_code]:p-0"
	)} style={{
		"font-family": "SFMono-Regular, Menlo, Consolas, 'PT Mono', 'Liberation Mono', Courier, monospace",
		"line-height": "1.5",
		"tab-size": "2"
	}}>
        <code innerHTML={htmlContent()} />
      </pre>
    </div>;
}
type MarkdownSize = "sm" | "md" | "lg";
interface ChatMarkdownRendererProps {
	content: string;
	/** Size variant: sm for compact views, md for normal, lg for fullscreen */
	size?: MarkdownSize;
	/** Additional class for the wrapper */
	class?: string;
	/** Whether to enable syntax highlighting (default: true) */
	syntaxHighlight?: boolean;
	/** Whether content is being streamed */
	isStreaming?: boolean;
}
// Size-based styles inspired by Notion's spacing
const sizeStyles: Record<MarkdownSize, {
	h1: string;
	h2: string;
	h3: string;
	h4: string;
	h5: string;
	h6: string;
	p: string;
	ul: string;
	ol: string;
	li: string;
	inlineCode: string;
	blockquote: string;
	hr: string;
	table: string;
	thead: string;
	tbody: string;
	tr: string;
	th: string;
	td: string;
}> = {
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
function createCodeComponent(codeTheme: string, size: MarkdownSize, styles: typeof sizeStyles.md, isStreaming: boolean = false) {
	return function CodeComponent({ class: cls, children, node, ...props }: any) {
		const match = /language-(\w+)/.exec(cls || "");
		const language = match ? match[1] : undefined;
		const codeContent = String(children);
		// Check if this is a code block (has language) or inline code
		// Streamdown wraps code blocks in <pre><code>, inline code is just <code>
		const isCodeBlock = language || codeContent.includes("\n") && codeContent.length > 100;
		if (isCodeBlock) {
			// Route mermaid blocks to MermaidBlock component
			if (language === "mermaid") {
				// Pass isStreaming to MermaidBlock
				// When streaming, MermaidBlock shows a placeholder instead of trying to render
				return <MermaidBlock code={codeContent.replace(/\n$/, "")} size={size} isStreaming={isStreaming} />;
			}
			return <CodeBlock language={language} themeId={codeTheme} size={size}>
          {codeContent.replace(/\n$/, "")}
        </CodeBlock>;
		}
		// Inline code
		return <span class={styles.inlineCode}>{children}</span>;
	};
}
export function ChatMarkdownRenderer(props: ChatMarkdownRendererProps) {
	const size = () => props.size ?? "md";
	const isStreaming = () => props.isStreaming ?? false;
	const codeTheme = useCodeTheme();
	const styles = () => sizeStyles[size()];
	// Process content - strip emojis
	const processedContent = createMemo(() => stripEmojis(props.content));
	// Memoize components object to prevent re-renders
	// This is critical for Streamdown's block-level memoization to work
	const components = createMemo(() => ({
		h1: ({ children, ...props }: any) => <h1 class={styles().h1} {...props}>
          {children}
        </h1>,
		h2: ({ children, ...props }: any) => <h2 class={styles().h2} {...props}>
          {children}
        </h2>,
		h3: ({ children, ...props }: any) => <h3 class={styles().h3} {...props}>
          {children}
        </h3>,
		h4: ({ children, ...props }: any) => <h4 class={styles().h4} {...props}>
          {children}
        </h4>,
		h5: ({ children, ...props }: any) => <h5 class={styles().h5} {...props}>
          {children}
        </h5>,
		h6: ({ children, ...props }: any) => <h6 class={styles().h6} {...props}>
          {children}
        </h6>,
		p: ({ children, ...props }: any) => <p class={styles().p} {...props}>
          {children}
        </p>,
		ul: ({ children, ...props }: any) => <ul class={styles().ul} {...props}>
          {children}
        </ul>,
		ol: ({ children, ...props }: any) => <ol class={styles().ol} {...props}>
          {children}
        </ol>,
		li: ({ children, ...props }: any) => <li class={styles().li} {...props}>
          {children}
        </li>,
		a: ({ href, children, ...props }: any) => <a href={href} onClick={(e) => {
			e.preventDefault();
			if (href) {
				window.desktopApi.openExternal(href);
			}
		}} class="text-blue-600 dark:text-blue-400 no-underline hover:underline hover:decoration-current underline-offset-2 decoration-1 transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500/30 focus-visible:rounded-sm" {...props}>
          {children}
        </a>,
		strong: ({ children, ...props }: any) => <strong class="font-medium text-foreground" {...props}>
          {children}
        </strong>,
		em: ({ children, ...props }: any) => <em class="italic" {...props}>
          {children}
        </em>,
		blockquote: ({ children, ...props }: any) => <blockquote class={styles().blockquote} {...props}>
          {children}
        </blockquote>,
		hr: ({ ...props }: any) => <hr class={styles().hr} {...props} />,
		table: ({ children, ...props }: any) => <div class="overflow-x-auto my-3 rounded-lg border border-border overflow-hidden">
          <table class={cn(styles().table, "border-collapse")} {...props}>
            {children}
          </table>
        </div>,
		thead: ({ children, ...props }: any) => <thead class={styles().thead} {...props}>
          {children}
        </thead>,
		tbody: ({ children, ...props }: any) => <tbody class={styles().tbody} {...props}>
          {children}
        </tbody>,
		tr: ({ children, ...props }: any) => <tr class={styles().tr} {...props}>
          {children}
        </tr>,
		th: ({ children, ...props }: any) => <th class={styles().th} {...props}>
          {children}
        </th>,
		td: ({ children, ...props }: any) => <td class={styles().td} {...props}>
          {children}
        </td>,
		pre: ({ children }: any) => <>{children}</>,
		code: createCodeComponent(codeTheme, size(), styles(), isStreaming())
	}));
	return <div class={cn(
		"prose prose-sm max-w-none dark:prose-invert prose-code:before:content-none prose-code:after:content-none",
		// Reset prose margins - we use our own compact Notion-like spacing
		"prose-p:my-0 prose-ul:my-0 prose-ol:my-0 prose-li:my-0",
		"prose-ul:pl-0 prose-ol:pl-0 prose-li:pl-0",
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
		"[&_table+p]:mt-4 [&_table+ul]:mt-4 [&_table+ol]:mt-4",
		props.class
	)}>
      <Streamdown mode="streaming" components={components()} remarkPlugins={[remarkGfm, remarkBreaks]} isAnimating={isStreaming()} parseIncompleteMarkdown={isStreaming()} controls={false}>
        {processedContent()}
      </Streamdown>
    </div>;
}
// Convenience exports for specific use cases
export function CompactMarkdownRenderer(props: { content: string; class?: string }) {
	return <ChatMarkdownRenderer content={props.content} size="sm" class={props.class} />;
}

export function FullscreenMarkdownRenderer(props: { content: string; class?: string }) {
	return <ChatMarkdownRenderer content={props.content} size="lg" class={props.class} />;
}
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
function hashString(str: string): string {
	let hash = 5381;
	for (let i = 0; i < str.length; i++) {
		hash = (hash << 5) + hash ^ str.charCodeAt(i);
	}
	// Convert to unsigned 32-bit and then to base36 for shorter keys
	return (hash >>> 0).toString(36);
}
interface ParsedBlock {
	content: string;
	// Stable key based on: content hash + occurrence index
	key: string;
}
function parseIntoBlocks(markdown: string): ParsedBlock[] {
	try {
		// Use Streamdown's built-in parser for consistency
		const blocks = parseMarkdownIntoBlocks(markdown);
		// Track occurrences of each content hash to handle duplicates
		const seen = new Map<string, number>();
		return blocks.map((content) => {
			const baseKey = hashString(content);
			const occurrence = seen.get(baseKey) ?? 0;
			seen.set(baseKey, occurrence + 1);
			const key = occurrence > 0 ? `${baseKey}-${occurrence}` : baseKey;
			return {
				content,
				key
			};
		});
	} catch {
		// Fallback: return entire content as single block
		return [{
			content: markdown,
			key: `fallback-${hashString(markdown)}`
		}];
	}
}
// Individual block - only re-renders when its content changes
function MemoizedMarkdownBlock(blockProps: {
	content: string;
	size: MarkdownSize;
	class?: string;
	codeTheme: string;
}) {
	// Don't render empty blocks
	if (!blockProps.content.trim()) return null;
	const styles = sizeStyles[blockProps.size];
	// Memoize components object - critical for preventing re-renders
	const components = createMemo(() => ({
		h1: ({ children, ...rest }: any) => <h1 class={styles.h1} {...rest}>{children}</h1>,
		h2: ({ children, ...rest }: any) => <h2 class={styles.h2} {...rest}>{children}</h2>,
		h3: ({ children, ...rest }: any) => <h3 class={styles.h3} {...rest}>{children}</h3>,
		h4: ({ children, ...rest }: any) => <h4 class={styles.h4} {...rest}>{children}</h4>,
		h5: ({ children, ...rest }: any) => <h5 class={styles.h5} {...rest}>{children}</h5>,
		h6: ({ children, ...rest }: any) => <h6 class={styles.h6} {...rest}>{children}</h6>,
		p: ({ children, ...rest }: any) => <p class={styles.p} {...rest}>{children}</p>,
		ul: ({ children, ...rest }: any) => <ul class={styles.ul} {...rest}>{children}</ul>,
		ol: ({ children, ...rest }: any) => <ol class={styles.ol} {...rest}>{children}</ol>,
		li: ({ children, ...rest }: any) => <li class={styles.li} {...rest}>{children}</li>,
		a: ({ href, children, ...rest }: any) => (
			<a
				href={href}
				onClick={(e) => {
					e.preventDefault();
					if (href) window.desktopApi?.openExternal(href);
				}}
				class="text-blue-600 dark:text-blue-400 no-underline hover:underline hover:decoration-current underline-offset-2 decoration-1 transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500/30 focus-visible:rounded-sm"
				{...rest}
			>
				{children}
			</a>
		),
		strong: ({ children, ...rest }: any) => <strong class="font-medium text-foreground" {...rest}>{children}</strong>,
		em: ({ children, ...rest }: any) => <em class="italic" {...rest}>{children}</em>,
		blockquote: ({ children, ...rest }: any) => <blockquote class={styles.blockquote} {...rest}>{children}</blockquote>,
		hr: ({ ...rest }: any) => <hr class={styles.hr} {...rest} />,
		table: ({ children, ...rest }: any) => (
			<div class="overflow-x-auto my-3 rounded-lg border border-border overflow-hidden">
				<table class={cn(styles.table, "border-collapse")} {...rest}>{children}</table>
			</div>
		),
		thead: ({ children, ...rest }: any) => <thead class={styles.thead} {...rest}>{children}</thead>,
		tbody: ({ children, ...rest }: any) => <tbody class={styles.tbody} {...rest}>{children}</tbody>,
		tr: ({ children, ...rest }: any) => <tr class={styles.tr} {...rest}>{children}</tr>,
		th: ({ children, ...rest }: any) => <th class={styles.th} {...rest}>{children}</th>,
		td: ({ children, ...rest }: any) => <td class={styles.td} {...rest}>{children}</td>,
		pre: ({ children }: any) => <>{children}</>,
		code: createCodeComponent(blockProps.codeTheme, blockProps.size, styles)
	}));

	return (
		<Streamdown mode="static" components={components()} remarkPlugins={[remarkGfm, remarkBreaks]} controls={false}>
			{blockProps.content}
		</Streamdown>
	);
}

// Main memoized markdown component - splits into blocks and memoizes each
export function MemoizedMarkdown(memoProps: {
	content: string;
	id: string;
	size?: MarkdownSize;
	class?: string;
}) {
	const size = memoProps.size ?? "sm";
	const codeTheme = useCodeTheme();
	// Pre-process content - strip emojis
	const processedContent = createMemo(() => stripEmojis(memoProps.content));
	// Split into blocks - this recalculates when content changes,
	// but each block is individually memoized with content-based keys
	const blocks = createMemo(() => parseIntoBlocks(processedContent()));

	return (
		<div class={cn(
			"prose prose-sm max-w-none dark:prose-invert prose-code:before:content-none prose-code:after:content-none",
			"prose-p:my-0 prose-ul:my-0 prose-ol:my-0 prose-li:my-0",
			"prose-ul:pl-0 prose-ol:pl-0 prose-li:pl-0",
			"prose-hr:my-0",
			"prose-table:my-0",
			"[&_li>p]:inline [&_li>p]:mb-0",
			"overflow-hidden break-words",
			"[&_p:has(+hr)]:mb-6 [&_ul:has(+hr)]:mb-6 [&_ol:has(+hr)]:mb-6 [&_div:has(+hr)]:mb-6 [&_table:has(+hr)]:mb-6 [&_h1:has(+hr)]:mb-6 [&_h2:has(+hr)]:mb-6 [&_h3:has(+hr)]:mb-6 [&_blockquote:has(+hr)]:mb-6",
			"[&_hr+p]:mt-4 [&_hr+ul]:mt-4 [&_hr+ol]:mt-4",
			"[&_div+p]:mt-2 [&_div+ul]:mt-2 [&_div+ol]:mt-2",
			"[&_table+p]:mt-4 [&_table+ul]:mt-4 [&_table+ol]:mt-4",
			memoProps.class
		)}>
			<For each={blocks()}>
				{(block) => (
					<MemoizedMarkdownBlock
						content={block.content}
						size={size}
						class={memoProps.class}
						codeTheme={codeTheme}
					/>
				)}
			</For>
		</div>
	);
}
