import { createEffect, Show, For } from "solid-js";
import { cn } from "../../../lib/utils";

interface VoiceWaveIndicatorProps {
	isRecording: boolean;
	audioLevel: number;
	class?: string;
}

export function VoiceWaveIndicator(props: VoiceWaveIndicatorProps) {
	const barsRef: HTMLDivElement[] = [];
	
	createEffect(() => {
		if (!props.isRecording) {
			barsRef.forEach((bar) => {
				if (bar) bar.style.height = "15%";
			});
			return;
		}
		barsRef.forEach((bar, index) => {
			if (!bar) return;
			const centerFactor = 1 - Math.abs(index - 2) * .12;
			const randomVariation = .9 + Math.random() * .2;
			const baseHeight = 10;
			const maxHeight = 100;
			const levelHeight = props.audioLevel * (maxHeight - baseHeight) * centerFactor * randomVariation;
			const finalHeight = baseHeight + levelHeight;
			bar.style.height = `${finalHeight}%`;
		});
	});
	
	return (
		<Show when={props.isRecording}>
			<div class={cn("flex items-center justify-center gap-[3px] h-5 px-2", props.class)}>
				<For each={[0, 1, 2, 3, 4]}>
					{(i) => (
						<div
							ref={(el) => { barsRef[i] = el; }}
							class="w-[3px] bg-foreground rounded-full transition-[height] duration-75 ease-out"
							style={{ height: "15%" }}
						/>
					)}
				</For>
			</div>
		</Show>
	);
}
