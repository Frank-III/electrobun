"use client";
import { createSignal, createEffect } from "solid-js";
import { useAtom, useSetAtom } from "../../../lib/state/jotai";
import { CheckIcon, CopyIcon, IconSpinner, PauseIcon, VolumeIcon } from "../../../components/ui/icons";
import { cn } from "../../../lib/utils";
import { apiFetch } from "../../../lib/api-fetch";
import { useHaptic } from "../hooks/use-haptic";
import { ttsPlaybackRateAtom, setTtsPlaybackRateAtom, PLAYBACK_SPEEDS, type PlaybackSpeed } from "../stores/message-store";
// ============================================================================
// COPY BUTTON - Memoized component for copying text
// ============================================================================
interface CopyButtonProps {
	text: string;
	isMobile?: boolean;
}
export const CopyButton = memo(function CopyButton({ text, isMobile = false }: CopyButtonProps) {
	const [copied, setCopied] = createSignal(false);
	const { trigger: triggerHaptic } = useHaptic();
	const handleCopy = () => {
		navigator.clipboard.writeText(text);
		triggerHaptic("medium");
		setCopied(true);
		setTimeout(() => setCopied(false), 2e3);
	};
	return <button onClick={handleCopy} tabIndex={-1} class="p-1.5 rounded-md transition-[background-color,transform] duration-150 ease-out hover:bg-accent active:scale-[0.97]">
      <div class="relative w-3.5 h-3.5">
        <CopyIcon class={cn("absolute inset-0 w-3.5 h-3.5 text-muted-foreground transition-[opacity,transform] duration-200 ease-out", copied ? "opacity-0 scale-50" : "opacity-100 scale-100")} />
        <CheckIcon class={cn("absolute inset-0 w-3.5 h-3.5 text-muted-foreground transition-[opacity,transform] duration-200 ease-out", copied ? "opacity-100 scale-100" : "opacity-0 scale-50")} />
      </div>
    </button>;
});
// ============================================================================
// PLAY BUTTON - TTS with streaming support, uses Jotai for playback rate
// ============================================================================
type PlayButtonState = "idle" | "loading" | "playing";
interface PlayButtonProps {
	text: string;
	isMobile?: boolean;
}
export const PlayButton = memo(function PlayButton({ text, isMobile = false }: PlayButtonProps) {
	const [state, setState] = createSignal("idle");
	const [playbackRate] = useAtom(ttsPlaybackRateAtom);
	const setPlaybackRate = useSetAtom(setTtsPlaybackRateAtom);
	const [audioRef, setAudioRef] = createSignal<HTMLAudioElement | null>(null);
	const [mediaSourceRef, setMediaSourceRef] = createSignal<MediaSource | null>(null);
	const [sourceBufferRef, setSourceBufferRef] = createSignal<SourceBuffer | null>(null);
	const [abortControllerRef, setAbortControllerRef] = createSignal<AbortController | null>(null);
	const [chunkCountRef, setChunkCountRef] = createSignal(0);
	// Update playback rate when it changes
	createEffect(() => {
		if (audioRef.current) {
			audioRef.current.playbackRate = playbackRate;
		}
	});
	const cleanup = () => {
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
			abortControllerRef.current = null;
		}
		if (audioRef.current) {
			audioRef.current.pause();
			if (audioRef.current.src) {
				URL.revokeObjectURL(audioRef.current.src);
			}
		}
		if (mediaSourceRef.current && mediaSourceRef.current.readyState === "open") {
			try {
				mediaSourceRef.current.endOfStream();
			} catch {}
		}
		audioRef.current = null;
		mediaSourceRef.current = null;
		sourceBufferRef.current = null;
		chunkCountRef.current = 0;
	};
	const playWithStreaming = async () => {
		const mediaSource = new MediaSource();
		mediaSourceRef.current = mediaSource;
		const audio = new Audio();
		audioRef.current = audio;
		audio.src = URL.createObjectURL(mediaSource);
		audio.onended = () => {
			cleanup();
			setState("idle");
		};
		audio.onerror = () => {
			cleanup();
			setState("idle");
		};
		// Track if we've already started playing
		let hasStartedPlaying = false;
		// Start playback when browser has enough data (canplay event)
		audio.oncanplay = async () => {
			if (hasStartedPlaying) return;
			hasStartedPlaying = true;
			try {
				await audio.play();
				audio.playbackRate = playbackRate;
				setState("playing");
			} catch {
				cleanup();
				setState("idle");
			}
		};
		// Wait for MediaSource to open
		await new Promise<void>((resolve, reject) => {
			mediaSource.addEventListener("sourceopen", () => resolve(), { once: true });
			mediaSource.addEventListener("error", () => reject(new Error("MediaSource error")), { once: true });
		});
		const sourceBuffer = mediaSource.addSourceBuffer("audio/mpeg");
		sourceBufferRef.current = sourceBuffer;
		// Create abort controller for this request
		abortControllerRef.current = new AbortController();
		const response = await apiFetch("/api/tts", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ text }),
			signal: abortControllerRef.current.signal
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
			if (isAppending || pendingChunks.length === 0 || !sourceBufferRef.current || sourceBufferRef.current.updating) {
				return;
			}
			isAppending = true;
			const chunk = pendingChunks.shift()!;
			try {
				// Use ArrayBuffer.isView to ensure TypeScript knows this is a valid BufferSource
				const buffer = new Uint8Array(chunk.buffer.slice(0)) as BufferSource;
				sourceBufferRef.current.appendBuffer(buffer);
			} catch {
				// Buffer might be full or source closed
				isAppending = false;
			}
		};
		sourceBuffer.addEventListener("updateend", () => {
			isAppending = false;
			appendNextChunk();
		});
		// Read stream chunks
		const processStream = async () => {
			while (true) {
				const { done, value } = await reader.read();
				if (done) {
					// Wait for all pending chunks to be appended
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
					chunkCountRef.current++;
					pendingChunks.push(value);
					appendNextChunk();
				}
			}
		};
		// Start processing stream - playback will start via canplay event
		processStream();
	};
	const playWithFallback = async () => {
		abortControllerRef.current = new AbortController();
		const response = await apiFetch("/api/tts", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ text }),
			signal: abortControllerRef.current.signal
		});
		if (!response.ok) {
			throw new Error("TTS request failed");
		}
		const audioBlob = await response.blob();
		const audioUrl = URL.createObjectURL(audioBlob);
		const audio = new Audio(audioUrl);
		audioRef.current = audio;
		audio.onended = () => {
			cleanup();
			setState("idle");
		};
		audio.onerror = () => {
			cleanup();
			setState("idle");
		};
		await audio.play();
		// Set playback rate AFTER play() - browser resets it when setting src
		audio.playbackRate = playbackRate;
		setState("playing");
	};
	const handlePlay = async () => {
		// If playing, stop the audio
		if (state === "playing") {
			cleanup();
			setState("idle");
			return;
		}
		// If loading, cancel and reset
		if (state === "loading") {
			cleanup();
			setState("idle");
			return;
		}
		// Start loading
		setState("loading");
		chunkCountRef.current = 0;
		try {
			// Check if MediaSource is supported for streaming
			const supportsMediaSource = typeof MediaSource !== "undefined" && MediaSource.isTypeSupported("audio/mpeg");
			if (supportsMediaSource) {
				// Use streaming approach with MediaSource API
				await playWithStreaming();
			} else {
				// Fallback: wait for full response (Safari, older browsers)
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
	// Cleanup on unmount
	createEffect(() => {
		return cleanup;
	});
	const handleSpeedChange = () => {
		const currentIndex = PLAYBACK_SPEEDS.indexOf(playbackRate);
		const nextIndex = (currentIndex + 1) % PLAYBACK_SPEEDS.length;
		setPlaybackRate(PLAYBACK_SPEEDS[nextIndex]!);
	};
	return <div class="relative flex items-center">
      <button onClick={handlePlay} tabIndex={-1} class={cn("p-1.5 rounded-md transition-[background-color,transform] duration-150 ease-out hover:bg-accent active:scale-[0.97]", state === "loading" && "cursor-wait")}>
        <div class="relative w-3.5 h-3.5">
          {state === "loading" ? <IconSpinner class="w-3.5 h-3.5 text-muted-foreground animate-spin" /> : state === "playing" ? <PauseIcon class="w-3.5 h-3.5 text-muted-foreground" /> : <VolumeIcon class="w-3.5 h-3.5 text-muted-foreground" />}
        </div>
      </button>

      {	/* Speed selector - cyclic button with animation, only visible when playing */}
      {state === "playing" && <button onClick={handleSpeedChange} tabIndex={-1} class={cn("p-1.5 rounded-md transition-[background-color,opacity,transform] duration-150 ease-out hover:bg-accent active:scale-[0.97]", isMobile ? "opacity-100" : "opacity-0 group-hover/message:opacity-100")}>
          <div class="relative w-4 h-3.5 flex items-center justify-center">
            {PLAYBACK_SPEEDS.map((speed) => <span key={speed} class={cn("absolute inset-0 flex items-center justify-center text-xs font-medium text-muted-foreground transition-[opacity,transform] duration-200 ease-out", speed === playbackRate ? "opacity-100 scale-100" : "opacity-0 scale-50")}>
                {speed}x
              </span>)}
          </div>
        </button>}
    </div>;
 });
// ============================================================================
// HELPER - Get text content from message
// ============================================================================
export function getMessageTextContent(msg: any): string {
	if (!msg?.parts) return "";
	return msg.parts.filter((p: any) => p.type === "text").map((p: any) => p.text || "").join("\n");
}
