import { createMemo, createSignal, For, Show, type JSX } from "solid-js";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import {
	Command,
	CommandInput,
	CommandList,
	CommandEmpty,
	CommandGroup,
	CommandItem,
} from "./command";

interface SearchComboboxProps<T> {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	trigger: JSX.Element;
	items: T[];
	onSelect: (item: T) => void;
	placeholder?: string;
	emptyMessage?: string;
	getItemValue: (item: T) => string;
	renderItem: (item: T) => JSX.Element;
	width?: string;
	align?: "start" | "center" | "end";
	side?: "top" | "right" | "bottom" | "left";
	sideOffset?: number;
	alignOffset?: number;
	collisionPadding?:
		| number
		| {
				top?: number;
				right?: number;
				bottom?: number;
				left?: number;
		  };
	maxHeight?: string;
}

export function SearchCombobox<T>(props: SearchComboboxProps<T>) {
	const [search, setSearch] = createSignal("");

	const filteredItems = createMemo(() => {
		const searchVal = search().trim();
		if (!searchVal) return props.items;
		const lowerSearch = searchVal.toLowerCase();
		return props.items.filter((item) =>
			props.getItemValue(item).toLowerCase().includes(lowerSearch)
		);
	});

	const handleOpenChange = (open: boolean) => {
		if (!open) setSearch("");
		props.onOpenChange(open);
	};

	return (
		<Popover open={props.isOpen} onOpenChange={handleOpenChange}>
			{props.trigger}
			<PopoverContent class={`${props.width ?? "w-64"} p-0`}>
				<Command shouldFilter={false}>
					<CommandInput
						placeholder={props.placeholder ?? "Search..."}
						value={search()}
						onValueChange={setSearch}
					/>
					<CommandList class={`${props.maxHeight ?? "max-h-[300px]"} overflow-y-auto`}>
						<Show when={filteredItems().length === 0}>
							<CommandEmpty>{props.emptyMessage ?? "No results found."}</CommandEmpty>
						</Show>
						<CommandGroup>
							<For each={filteredItems()}>
								{(item) => (
									<CommandItem
										value={props.getItemValue(item)}
										onSelect={() => props.onSelect(item)}
									>
										{props.renderItem(item)}
									</CommandItem>
								)}
							</For>
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
