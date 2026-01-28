"use client";
import { Motion, Presence } from "solid-motionone";
import { createSignal, createEffect, Show, For } from "solid-js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Input } from "../../../components/ui/input";
import { DEVICE_PRESETS, AGENTS_PREVIEW_CONSTANTS } from "../constants";

interface DevicePresetsBarProps {
	selectedPreset: string;
	width: number;
	height: number;
	onPresetChange: (preset: string) => void;
	onWidthChange: (width: number) => void;
	maxWidth: number;
	className?: string;
}

export function DevicePresetsBar(props: DevicePresetsBarProps) {
	const [widthInputValue, setWidthInputValue] = createSignal(String(props.width));

	// Sync input value when width prop changes
	createEffect(() => {
		setWidthInputValue(String(props.width));
	});

	const handleWidthInputChange = (e: InputEvent & { currentTarget: HTMLInputElement }) => {
		setWidthInputValue(e.currentTarget.value);
	};

	const handleWidthBlur = () => {
		const value = parseInt(widthInputValue());
		// Apply any valid positive number, clamp to reasonable bounds
		if (!isNaN(value) && value > 0) {
			const clampedValue = Math.max(AGENTS_PREVIEW_CONSTANTS.MIN_WIDTH, Math.min(props.maxWidth, value));
			setWidthInputValue(String(clampedValue));
			props.onWidthChange(clampedValue);
		} else {
			// Invalid input - reset to current width
			setWidthInputValue(String(props.width));
		}
	};

	return (
		<Motion.div
			initial={{ opacity: 0, height: 0 }}
			animate={{ opacity: 1, height: "auto" }}
			exit={{ opacity: 0, height: 0 }}
			transition={{ duration: 0.2, easing: "ease-in-out" }}
			class={props.className}
		>
			<div class="flex items-center justify-center gap-2 px-4 py-2">
				<Select value={props.selectedPreset} onValueChange={props.onPresetChange}>
					<SelectTrigger class="h-7 text-xs px-2 w-auto">
						<SelectValue />
					</SelectTrigger>
					<SelectContent class="!w-36">
						<For each={DEVICE_PRESETS}>
							{(preset) => (
								<SelectItem value={preset.name} class="whitespace-nowrap">
									{preset.name}
								</SelectItem>
							)}
						</For>
					</SelectContent>
				</Select>

				<div class="flex items-center gap-1">
					<span class="text-xs text-muted-foreground font-medium">W</span>
					<Input
						type="number"
						value={widthInputValue()}
						onInput={handleWidthInputChange}
						onBlur={handleWidthBlur}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								e.currentTarget.blur();
							}
						}}
						class="h-7 w-auto min-w-9 text-xs px-1.5 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
						style={{ width: `${Math.max(widthInputValue().length || 1, 3) + 2}ch` }}
						min={AGENTS_PREVIEW_CONSTANTS.MIN_WIDTH}
						max={props.maxWidth}
					/>
				</div>

				<div class="flex items-center gap-1">
					<span class="text-xs text-muted-foreground font-medium">H</span>
					<Input
						type="number"
						value={props.height}
						disabled
						class="h-7 w-auto min-w-[3ch] text-xs px-1.5 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
						style={{ width: `${String(props.height).length + 2}ch` }}
						min={AGENTS_PREVIEW_CONSTANTS.MIN_HEIGHT}
						max={AGENTS_PREVIEW_CONSTANTS.MAX_HEIGHT}
					/>
				</div>
			</div>
		</Motion.div>
	);
}
