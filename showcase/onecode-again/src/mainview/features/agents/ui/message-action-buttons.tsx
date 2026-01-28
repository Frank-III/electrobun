"use client";
import { createSignal, createEffect, onCleanup, Show, For } from "solid-js";
import { useAtom, useSetAtom } from "../../../lib/state/jotai";
import { CheckIcon, CopyIcon, IconSpinner, PauseIcon, VolumeIcon } from "../../../components/ui/icons";
import { cn } from "../../../lib/utils";
import { apiFetch } from "../../../lib/api-fetch";
import { useHaptic } from "../hooks/use-haptic";
import { ttsPlaybackRateAtom, setTtsPlaybackRateAtom, PLAYBACK_SPEEDS, type PlaybackSpeed } from "../stores/message-store";

interface CopyButtonProps {
	text: string;
	isMobile?: boolean;
}

export function CopyButton(props: CopyButtonProps) {
	const [copied, setCopied] = createSignal(false);
	const { trigger: triggerHaptic } = useHaptic();
	
	const handleCopy = () => {
		navigator.clipboard.writeText(props.text);
		triggerHaptic("medium");
		setCopied(true);
		setTimeout(() => setCopied(false), 2e3);
	};
	
	return (
		<button onClick={handleCopy} tabIndex={-1} class="p-1.5 rounded-md transition-[background-color,transform] duration-150 ease-out hover:bg-accent active:scale-[0.97]">
			<div class="relative w-3.5 h-3.5">
				<CopyIcon class={cn("absolute inset-0 w-3.5 h-3.5 text-muted-foreground transition-[opacity,transform] duration-200 ease-out", copied() ? "opacity-0 scale-50" : "opacity-100 scale-100")} />
				<CheckIcon class={cn("absolute inset-0 w-3.5 h-3.5 text-muted-foreground transition-[opacity,transform] duration-200 ease-out", copied() ? "opacity-100 scale-100" : "opacity-0 scale-50")} />
			</div>
		</button>
	);
}
type PlayButtonState = "idle" | "loading" | "playing";

interface PlayButtonProps {
	text: string;
	isMobile?: boolean;
}

export function PlayButton(props: PlayButtonProps) {
	const [state, setState] = createSignal<PlayButtonState>("idle");
	const [playbackRate] = useAtom(ttsPlaybackRateAtom);
	const setPlaybackRate = useSetAtom(setTtsPlaybackRateAtom);
	
	let audioRef: HTMLAudioElement | null = null;
	let mediaSourceRef: MediaSource | null = null;
	let sourceBufferRef: SourceBuffer | null = null;
	let abortControllerRef: AbortController | null = null;
	let chunkCountRef = 0;
	
	createEffect(() => {
		const rate = playbackRate();
		if (audioRef) {
			audioRef.playbackRate = rate;
		}
	});
	
	const cleanup = () => {
		if (abortControllerRef) {
			abortControllerRef.abort();
			abortControllerRef = null;
		}
		if (audioRef) {
			audioRef.pause();
			if (audioRef.src) {
				URL.revokeObjectURL(audioRef.src);
			}
		}
		if (mediaSourceRef && mediaSourceRef.readyState === "open") {
			try {
				mediaSourceRef.endOfStream();
			} catch {}
		}
		audioRef = null;
		mediaSourceRef = null;
		sourceBufferRef = null;
		chunkCountRef = 0;
	};
	
	onCleanup(cleanup);
	
	const playWithStreaming = async () => {
		const mediaSource = new MediaSource();
		mediaSourceRef = mediaSource;
		const audio = new Audio();
		audioRef = audio;
		audio.src = URL.createObjectURL(mediaSource);
		audio.onended = () => {
			cleanup();
			setState("idle");
		};
		audio.onerror = () => {
			cleanup();
			setState("idle");
		};
		let hasStartedPlaying = false;
		audio.oncanplay = async () => {
			if (hasStartedPlaying) return;
			hasStartedPlaying = true;
			try {
				await audio.play();
				audio.playbackRate = playbackRate();
				setState("playing");
			} catch {
				cleanup();
				setState("idle");
			}
		};
		await new Promise<void>((resolve, reject) => {
			mediaSource.addEventListener("sourceopen", () => resolve(), { once: true });
			mediaSource.addEventListener("error", () => reject(new Error("MediaSource error")), { once: true });
		});
		const sourceBuffer = mediaSource.addSourceBuffer("audio/mpeg");
		sourceBufferRef = sourceBuffer;
		abortControllerRef = new AbortController();
		const response = await apiFetch("/api/tts", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ text: props.text }),
			signal: abortControllerRef.signal
		});
		if (!response.ok) {
			throw new Error("TTS request failed");
		}
		if (!response.body) {
			throw new Error("No response body");
		}
		const reader = response.body.getReader();
		const pendingChunks: Uint8Array[] = [];
		let isAppending = false;
		const appendNextChunk = () => {
			if (isAppending || pendingChunks.length === 0 || !sourceBufferRef || sourceBufferRef.updating) {
				return;
			}
			isAppending = true;
			const chunk = pendingChunks.shift()!;
			try {
				const buffer = new Uint8Array(chunk.buffer.slice(0)) as BufferSource;
				sourceBufferRef.appendBuffer(buffer);
			} catch {
				isAppending = false;
			}
		};
		sourceBuffer.addEventListener("updateend", () => {
			isAppending = false;
			appendNextChunk();
		});
		const processStream = async () => {
			while (true) {
				const { done, value } = await reader.read();
				if (done) {
					while (pendingChunks.length > 0 || sourceBuffer.updating) {
						await new Promise((r) => setTimeout(r, 50));
					}
					if (mediaSource.readyState === "open") {
						try {
							mediaSource.endOfStream();
						} catch {}
					}
					break;
				}
				if (value) {
					chunkCountRef++;
					pendingChunks.push(value);
					appendNextChunk();
				}
			}
		};
		processStream();
	};
	
	const playWithFallback = async () => {
		abortControllerRef = new AbortController();
		const response = await apiFetch("/api/tts", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ text: props.text }),
			signal: abortControllerRef.signal
		});
		if (!response.ok) {
			throw new Error("TTS request failed");
		}
		const audioBlob = await response.blob();
		const audioUrl = URL.createObjectURL(audioBlob);
		const audio = new Audio(audioUrl);
		audioRef = audio;
		audio.onended = () => {
			cleanup();
			setState("idle");
		};
		audio.onerror = () => {
			cleanup();
			setState("idle");
		};
		await audio.play();
		audio.playbackRate = playbackRate();
		setState("playing");
	};
	
	const handlePlay = async () => {
		if (state() === "playing") {
			cleanup();
			setState("idle");
			return;
		}
		if (state() === "loading") {
			cleanup();
			setState("idle");
			return;
		}
		setState("loading");
		chunkCountRef = 0;
		try {
			const supportsMediaSource = typeof MediaSource !== "undefined" && MediaSource.isTypeSupported("audio/mpeg");
			if (supportsMediaSource) {
				await playWithStreaming();
			} else {
				await playWithFallback();
			}
		} catch (error) {
			if ((error as Error).name !== "AbortError") {
				console.error("[PlayButton] TTS error:", error);
			}
			cleanup();
			setState("idle");
		}
	};
	
	const handleSpeedChange = () => {
		const rate = playbackRate();
		const currentIndex = PLAYBACK_SPEEDS.indexOf(rate);
		const nextIndex = (currentIndex + 1) % PLAYBACK_SPEEDS.length;
		setPlaybackRate(PLAYBACK_SPEEDS[nextIndex]!);
	};
	
	return (
		<div class="relative flex items-center">
			<button onClick={handlePlay} tabIndex={-1} class={cn("p-1.5 rounded-md transition-[background-color,transform] duration-150 ease-out hover:bg-accent active:scale-[0.97]", state() === "loading" && "cursor-wait")}>
				<div class="relative w-3.5 h-3.5">
					<Show when={state() === "loading"}>
						<IconSpinner class="w-3.5 h-3.5 text-muted-foreground animate-spin" />
					</Show>
					<Show when={state() === "playing"}>
						<PauseIcon class="w-3.5 h-3.5 text-muted-foreground" />
					</Show>
					<Show when={state() === "idle"}>
						<VolumeIcon class="w-3.5 h-3.5 text-muted-foreground" />
					</Show>
				</div>
			</button>
			<Show when={state() === "playing"}>
				<button onClick={handleSpeedChange} tabIndex={-1} class={cn("p-1.5 rounded-md transition-[background-color,opacity,transform] duration-150 ease-out hover:bg-accent active:scale-[0.97]", props.isMobile ? "opacity-100" : "opacity-0 group-hover/message:opacity-100")}>
					<div class="relative w-4 h-3.5 flex items-center justify-center">
						<For each={PLAYBACK_SPEEDS}>
							{(speed) => (
								<span class={cn("absolute inset-0 flex items-center justify-center text-xs font-medium text-muted-foreground transition-[opacity,transform] duration-200 ease-out", speed === playbackRate() ? "opacity-100 scale-100" : "opacity-0 scale-50")}>
									{speed}x
								</span>
							)}
						</For>
					</div>
				</button>
			</Show>
		</div>
	);
}
// ============================================================================
// HELPER - Get text content from message
// ============================================================================
export function getMessageTextContent(msg: any): string {
	if (!msg?.parts) return "";
	return msg.parts.filter((p: any) => p.type === "text").map((p: any) => p.text || "").join("\n");
}
