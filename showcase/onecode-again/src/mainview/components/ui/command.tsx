import { createContext, useContext, createSignal, createEffect, createMemo, createUniqueId, type JSX, splitProps, onMount, onCleanup } from "solid-js";
import { cn } from "../../lib/utils";
import { SearchIcon } from "./icons";
import { overlayItem, overlaySeparator } from "../../lib/overlay-styles";

interface CommandContextValue {
	selectedValue: () => string | null;
	setSelectedValue: (value: string | null) => void;
	onSelect: (value: string) => void;
	registerItem: (value: string, element: HTMLDivElement | null) => void;
	getItems: () => Map<string, HTMLDivElement>;
}

const CommandContext = createContext<CommandContextValue | null>(null);

interface CommandProps extends JSX.HTMLAttributes<HTMLDivElement> {
	shouldFilter?: boolean;
	value?: string;
	onValueChange?: (value: string) => void;
	ref?: HTMLDivElement | ((el: HTMLDivElement) => void);
}

function Command(props: CommandProps) {
	const [local, others] = splitProps(props, ["class", "shouldFilter", "value", "onValueChange", "children", "ref"]);
	const [selectedValue, setSelectedValue] = createSignal<string | null>(null);
	let items = new Map<string, HTMLDivElement>();
	let orderedKeys: string[] = [];

	const registerItem = (value: string, element: HTMLDivElement | null) => {
		if (element) {
			items.set(value, element);
			if (!orderedKeys.includes(value)) {
				orderedKeys.push(value);
			}
		} else {
			items.delete(value);
			orderedKeys = orderedKeys.filter((k) => k !== value);
		}
	};

	const getItems = () => items;

	const onSelect = (value: string) => {
		const element = items.get(value);
		if (element) {
			element.click();
		}
	};

	createEffect(() => {
		const keys = orderedKeys;
		const sel = selectedValue();
		if (keys.length > 0 && !keys.includes(sel || "")) {
			setSelectedValue(keys[0] || null);
		}
	});

	const handleKeyDown = (e: KeyboardEvent) => {
		const keys = orderedKeys;
		const sel = selectedValue();
		const currentIndex = sel ? keys.indexOf(sel) : -1;

		switch (e.key) {
			case "ArrowDown":
				e.preventDefault();
				if (keys.length > 0) {
					const nextIndex = currentIndex + 1 >= keys.length ? 0 : currentIndex + 1;
					const nextKey = keys[nextIndex];
					setSelectedValue(nextKey!);
					items.get(nextKey!)?.scrollIntoView({ block: "nearest" });
				}
				break;
			case "ArrowUp":
				e.preventDefault();
				if (keys.length > 0) {
					const prevIndex = currentIndex - 1 < 0 ? keys.length - 1 : currentIndex - 1;
					const prevKey = keys[prevIndex];
					setSelectedValue(prevKey!);
					items.get(prevKey!)?.scrollIntoView({ block: "nearest" });
				}
				break;
			case "Enter":
				e.preventDefault();
				if (sel) {
					onSelect(sel);
				}
				break;
			case "Home":
				e.preventDefault();
				if (keys.length > 0) {
					setSelectedValue(keys[0]!);
					items.get(keys[0]!)?.scrollIntoView({ block: "nearest" });
				}
				break;
			case "End":
				e.preventDefault();
				if (keys.length > 0) {
					const lastKey = keys[keys.length - 1];
					setSelectedValue(lastKey!);
					items.get(lastKey!)?.scrollIntoView({ block: "nearest" });
				}
				break;
		}
	};

	const contextValue: CommandContextValue = {
		selectedValue,
		setSelectedValue,
		onSelect,
		registerItem,
		getItems
	};

	return (
		<CommandContext.Provider value={contextValue}>
			<div
				ref={local.ref}
				class={cn("flex h-full w-full flex-col overflow-hidden text-popover-foreground", local.class)}
				onKeyDown={handleKeyDown}
				{...others}
			>
				{local.children}
			</div>
		</CommandContext.Provider>
	);
}

interface CommandInputProps extends JSX.InputHTMLAttributes<HTMLInputElement> {
	onValueChange?: (value: string) => void;
	wrapperClassName?: string;
	ref?: HTMLInputElement | ((el: HTMLInputElement) => void);
}

function CommandInput(props: CommandInputProps) {
	const [local, others] = splitProps(props, ["class", "onValueChange", "wrapperClassName", "onInput", "ref"]);
	let inputRef: HTMLInputElement | undefined;

	onMount(() => {
		const timer = setTimeout(() => {
			inputRef?.focus();
		}, 0);
		onCleanup(() => clearTimeout(timer));
	});

	return (
		<div class={cn("flex items-center gap-1.5 h-7 px-1.5 mx-1 my-1 rounded-md bg-muted/50", local.wrapperClassName)} cmdk-input-wrapper="">
			<SearchIcon class="h-4 w-4 shrink-0 text-muted-foreground" />
			<input
				ref={(el) => {
					inputRef = el;
					if (typeof local.ref === "function") local.ref(el);
					else if (local.ref !== undefined) (local as any).ref = el;
				}}
				class={cn("flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50", local.class)}
				onInput={(e) => {
					(local.onInput as any)?.(e);
					local.onValueChange?.(e.currentTarget.value);
				}}
				{...others}
			/>
		</div>
	);
}

interface CommandListProps extends JSX.HTMLAttributes<HTMLDivElement> {
	ref?: HTMLDivElement | ((el: HTMLDivElement) => void);
}

function CommandList(props: CommandListProps) {
	const [local, others] = splitProps(props, ["class", "ref"]);
	return <div ref={local.ref} class={cn("max-h-[300px] overflow-y-auto overflow-x-hidden py-1", local.class)} {...others} />;
}

interface CommandEmptyProps extends JSX.HTMLAttributes<HTMLDivElement> {
	ref?: HTMLDivElement | ((el: HTMLDivElement) => void);
}

function CommandEmpty(props: CommandEmptyProps) {
	const [local, others] = splitProps(props, ["class", "ref"]);
	return <div ref={local.ref} class={cn("py-6 text-center text-sm text-muted-foreground", local.class)} {...others} />;
}

interface CommandGroupProps extends JSX.HTMLAttributes<HTMLDivElement> {
	heading?: string;
	ref?: HTMLDivElement | ((el: HTMLDivElement) => void);
}

function CommandGroup(props: CommandGroupProps) {
	const [local, others] = splitProps(props, ["class", "heading", "children", "ref"]);
	return (
		<div ref={local.ref} class={cn("overflow-hidden text-foreground", local.class)} {...others}>
			{local.heading && (
				<div class="py-1.5 px-1.5 mx-1 text-xs font-medium text-muted-foreground">
					{local.heading}
				</div>
			)}
			{local.children}
		</div>
	);
}

interface CommandItemProps extends JSX.HTMLAttributes<HTMLDivElement> {
	value?: string;
	onSelect?: () => void;
	ref?: HTMLDivElement | ((el: HTMLDivElement) => void);
}

function CommandItem(props: CommandItemProps) {
	const [local, others] = splitProps(props, ["class", "onSelect", "value", "onMouseEnter", "ref"]);
	const context = useContext(CommandContext);
	let itemRef: HTMLDivElement | undefined;

	const itemValue = local.value || createUniqueId();

	createEffect(() => {
		context?.registerItem(itemValue, itemRef || null);
		onCleanup(() => {
			context?.registerItem(itemValue, null);
		});
	});

	const isSelected = () => context?.selectedValue() === itemValue;

	const handleMouseEnter = (e: MouseEvent) => {
		context?.setSelectedValue(itemValue);
		(local.onMouseEnter as any)?.(e);
	};

	return (
		<div
			ref={(el) => {
				itemRef = el;
				if (typeof local.ref === "function") local.ref(el);
			}}
			data-value={itemValue}
			data-selected={isSelected() || undefined}
			class={cn(overlayItem, isSelected() && "bg-accent dark:bg-neutral-800 text-accent-foreground", local.class)}
			onClick={local.onSelect}
			onMouseEnter={handleMouseEnter}
			{...others}
		/>
	);
}

interface CommandSeparatorProps extends JSX.HTMLAttributes<HTMLDivElement> {
	ref?: HTMLDivElement | ((el: HTMLDivElement) => void);
}

function CommandSeparator(props: CommandSeparatorProps) {
	const [local, others] = splitProps(props, ["class", "ref"]);
	return <div ref={local.ref} class={cn(overlaySeparator, local.class)} {...others} />;
}

export { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandSeparator };
