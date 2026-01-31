import { createSignal, Show } from "solid-js";
import { X, FileText, FileCode, FileJson } from "lucide-solid";
import { IconSpinner } from "../../../components/ui/icons";
interface AgentFileItemProps {
	id: string;
	filename: string;
	url: string;
	size?: number;
	isLoading?: boolean;
	onRemove?: () => void;
}
function formatFileSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
function getFileIcon(filename: string) {
	const ext = filename.split(".").pop()?.toLowerCase();
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
		return FileCode;
	}
	// JSON/YAML/XML
	if ([
		"json",
		"yaml",
		"yml",
		"xml"
	].includes(ext || "")) {
		return FileJson;
	}
	return FileText;
}
export function AgentFileItem({ id, filename, url, size, isLoading = false, onRemove }: AgentFileItemProps) {
	const [isHovered, setIsHovered] = createSignal(false);
	const Icon = getFileIcon(filename);
	return <div class="relative flex items-center gap-1.5 px-2 py-1 bg-muted/50 rounded border border-border/50 max-w-[200px]" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      {isLoading ? <IconSpinner class="size-3.5 text-muted-foreground flex-shrink-0" /> : <Icon class="size-3.5 text-muted-foreground flex-shrink-0" />}

      <div class="flex flex-col min-w-0">
        <span class="text-xs text-foreground truncate" title={filename}>
          {filename}
        </span>
        <Show when={size !== undefined}><span class="text-[10px] text-muted-foreground">
            {formatFileSize(size)}
          </span></Show>
      </div>

      <Show when={onRemove}><button onClick={(e) => {
		e.stopPropagation();
		onRemove();
	}} class={`absolute -top-1.5 -right-1.5 size-4 rounded-full bg-background border border-border
                     flex items-center justify-center transition-[opacity,transform] duration-150 ease-out active:scale-[0.97] z-10
                     text-muted-foreground hover:text-foreground
                     ${isHovered() ? "opacity-100" : "opacity-0"}`} type="button">
          <X class="size-3" />
        </button></Show>
    </div>;
}
