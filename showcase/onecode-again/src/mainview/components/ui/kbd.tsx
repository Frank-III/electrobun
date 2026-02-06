import { splitProps, type ParentComponent, type JSX, For, Show } from "solid-js";
import { cn } from "../../lib/utils";
import { CmdIcon, EnterIcon, OptionIcon, ShiftIcon } from "./icons";
export interface KbdProps extends JSX.HTMLAttributes<HTMLElement> {
	ref?: HTMLElement | ((el: HTMLElement) => void);
}
/** Parse shortcut string and replace modifier symbols with icons */
function renderShortcut(children: JSX.Element): JSX.Element {
	if (typeof children !== "string") return children as JSX.Element;
	// Map of symbols to icons (3 = 12px to match text-xs visually)
	const symbolMap: Record<string, () => JSX.Element> = {
		"⌘": () => <CmdIcon class="h-3 w-3" />,
		"⌥": () => <OptionIcon class="h-3 w-3" />,
		"⇧": () => <ShiftIcon class="h-3 w-3" />,
		"⌃": () => <span>⌃</span>,
		"↵": () => <EnterIcon class="h-3 w-3" />
	};
	// Split by symbols and replace with icons
	const regex = /([⌘⌥⇧⌃↵])/g;
	const tokens = children.split(regex).filter(Boolean);
	return <For each={tokens}>
      {(token) => <Show when={symbolMap[token]} fallback={<span>{token}</span>}>
          {symbolMap[token]?.()}
        </Show>}
    </For>;
}
const Kbd: ParentComponent<KbdProps> = (props) => {
	const [local, others] = splitProps(props, [
		"class",
		"children",
		"ref"
	]);
	return <kbd ref={local.ref} class={cn("pointer-events-none inline-flex items-center gap-0.5 text-xs font-medium uppercase tracking-wide text-muted-foreground/60", local.class)} {...others}>
      {renderShortcut(local.children)}
    </kbd>;
};
export { Kbd };
