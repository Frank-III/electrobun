"use client";
import { createSignal, createEffect, onCleanup, Show } from "solid-js";
import { Mic, Loader2 } from "lucide-solid";
import { cn } from "../../../lib/utils";
import { trpc } from "../../../lib/trpc";
import { useVoiceRecording, blobToBase64, getAudioFormat } from "../../../lib/hooks/use-voice-recording";

interface VoiceInputButtonProps {
	onTranscript: (text: string) => void;
	disabled?: boolean;
	className?: string;
}

export function VoiceInputButton(props: VoiceInputButtonProps) {
	const { isRecording, startRecording, stopRecording, cancelRecording, error } = useVoiceRecording();
	const [isTranscribing, setIsTranscribing] = createSignal(false);
	const [transcribeError, setTranscribeError] = createSignal<string | null>(null);
	
	let isTouchRef = false;
	let isMountedRef = true;
	
	onCleanup(() => {
		isMountedRef = false;
	});
	
	const transcribeMutation = trpc.voice.transcribe.useMutation({ onError: (err: Error) => {
		console.error("[VoiceInput] Transcription error:", err);
		if (isMountedRef) {
			setTranscribeError(err.message);
		}
	} });
	
	const handleStart = async () => {
		if (props.disabled || isTranscribing() || isRecording) return;
		setTranscribeError(null);
		try {
			await startRecording();
		} catch (err) {
			console.error("[VoiceInput] Failed to start recording:", err);
		}
	};
	
	const handleEnd = async () => {
		if (!isRecording) return;
		try {
			const blob = await stopRecording();
			if (blob.size < 1e3) {
				console.log("[VoiceInput] Recording too short, ignoring");
				return;
			}
			if (!isMountedRef) return;
			setIsTranscribing(true);
			const base64 = await blobToBase64(blob);
			const format = getAudioFormat(blob.type);
			const result = await transcribeMutation.mutateAsync({
				audio: base64,
				format
			});
			if (!isMountedRef) return;
			if (result.text && result.text.trim()) {
				props.onTranscript(result.text.trim());
			}
		} catch (err) {
			console.error("[VoiceInput] Transcription failed:", err);
		} finally {
			if (isMountedRef) {
				setIsTranscribing(false);
			}
		}
	};
	
	const handleMouseDown = () => {
		if (isTouchRef) {
			isTouchRef = false;
			return;
		}
		handleStart();
	};
	
	const handleMouseUp = () => {
		if (isTouchRef) return;
		handleEnd();
	};
	
	const handleMouseLeave = () => {
		if (isTouchRef) return;
		if (isRecording) {
			cancelRecording();
		}
	};
	
	const handleTouchStart = () => {
		isTouchRef = true;
		handleStart();
	};
	
	const handleTouchEnd = () => {
		handleEnd();
	};
	
	const isLoading = () => isTranscribing() || transcribeMutation.isPending;
	const hasError = () => !!error || !!transcribeError();
	
	return (
		<button
			type="button"
			onMouseDown={handleMouseDown}
			onMouseUp={handleMouseUp}
			onMouseLeave={handleMouseLeave}
			onTouchStart={handleTouchStart}
			onTouchEnd={handleTouchEnd}
			disabled={props.disabled || isLoading()}
			title={hasError() ? transcribeError() || error?.message || "Voice input error" : isRecording ? "Release to transcribe" : "Hold to record"}
			class={cn(
				"relative p-1.5 rounded-md transition-all duration-150 ease-out",
				"hover:bg-accent active:scale-[0.97]",
				"disabled:opacity-50 disabled:cursor-not-allowed",
				isRecording && "bg-red-500/20 ring-2 ring-red-500",
				isLoading() && "bg-yellow-500/20",
				hasError() && "bg-red-500/10",
				props.className
			)}
		>
			<div class="relative w-4 h-4">
				<Show when={isLoading()} fallback={
					<Mic class={cn("w-4 h-4 transition-colors", isRecording ? "text-red-500 animate-pulse" : hasError() ? "text-red-500/70" : "text-muted-foreground")} />
				}>
					<Loader2 class="w-4 h-4 text-muted-foreground animate-spin" />
				</Show>
			</div>
			<Show when={isRecording}>
				<span class="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
			</Show>
		</button>
	);
}
