"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentSendButton = AgentSendButton;
var button_1 = require("../../../components/ui/button");
var lucide_solid_1 = require("lucide-solid");
var icons_1 = require("../../../components/ui/icons");
var kbd_1 = require("../../../components/ui/kbd");
var tooltip_1 = require("../../../components/ui/tooltip");
var hotkeys_1 = require("../../../lib/hotkeys");
function AgentSendButton(_a) {
    var _b = _a.isStreaming, isStreaming = _b === void 0 ? false : _b, _c = _a.isSubmitting, isSubmitting = _c === void 0 ? false : _c, _d = _a.disabled, disabled = _d === void 0 ? false : _d, onClick = _a.onClick, onStop = _a.onStop, _e = _a.className, className = _e === void 0 ? "" : _e, _f = _a.size, size = _f === void 0 ? "sm" : _f, ariaLabel = _a.ariaLabel, _g = _a.mode, mode = _g === void 0 ? "agent" : _g, _h = _a.hasContent, hasContent = _h === void 0 ? false : _h, _j = _a.showVoiceInput, showVoiceInput = _j === void 0 ? false : _j, _k = _a.isRecording, isRecording = _k === void 0 ? false : _k, _l = _a.isTranscribing, isTranscribing = _l === void 0 ? false : _l, onVoiceMouseDown = _a.onVoiceMouseDown, onVoiceMouseUp = _a.onVoiceMouseUp, onVoiceMouseLeave = _a.onVoiceMouseLeave;
    // Resolved hotkeys for stop-generation tooltip
    var stopHotkey = (0, hotkeys_1.useResolvedHotkeyDisplayWithAlt)("stop-generation");
    // Resolved hotkey for voice input
    var voiceHotkey = (0, hotkeys_1.useResolvedHotkeyDisplay)("voice-input");
    // Note: Enter shortcut is now handled by input components directly
    // When streaming AND user has typed content, show arrow to add to queue
    // Otherwise during streaming, show stop button
    var shouldShowQueueArrow = isStreaming && hasContent;
    // Determine the actual click handler based on state
    var handleClick = function () {
        if (isStreaming && !hasContent && onStop) {
            // Stop only when streaming and no content to queue
            onStop();
        }
        else {
            // Send (or add to queue if streaming)
            onClick();
        }
    };
    // Check if currently in voice mode (showing mic/stop when no content)
    var isVoiceMode = showVoiceInput && !isStreaming && !hasContent;
    // Determine if button should be disabled
    // During streaming with content, enable the button for queue
    // In voice mode, button should always be enabled (unless transcribing)
    var isDisabled = isVoiceMode ? false : isStreaming ? false : disabled;
    // Determine icon to show
    var getIcon = function () {
        // Voice input mode: show mic/stop when no content and not streaming
        if (isVoiceMode) {
            if (isTranscribing) {
                return <lucide_solid_1.Loader2 class="size-4 animate-spin"/>;
            }
            if (isRecording) {
                // Show stop icon during recording
                return <div class="w-2.5 h-2.5 bg-current rounded-[2px] flex-shrink-0 mx-auto"/>;
            }
            return <icons_1.MicrophoneIcon class="size-4"/>;
        }
        if (isStreaming && !hasContent) {
            return <div class="w-2.5 h-2.5 bg-current rounded-[2px] flex-shrink-0 mx-auto"/>;
        }
        if (isSubmitting) {
            return <icons_1.IconSpinner class="size-4"/>;
        }
        return <lucide_solid_1.ArrowUp class="size-4"/>;
    };
    // Determine tooltip content
    var getTooltipContent = function () {
        // Voice input mode
        if (isVoiceMode) {
            if (isTranscribing)
                return "Transcribing...";
            if (isRecording)
                return "Click to stop";
            return <div class="flex flex-col items-start gap-0.5">
          <span>Voice input</span>
          {voiceHotkey && <span class="text-muted-foreground">{voiceHotkey}</span>}
        </div>;
        }
        if (isStreaming && !hasContent)
            return <span class="flex items-center gap-1">
          Stop
          {stopHotkey.primary && <kbd_1.Kbd class="ms-0.5">{stopHotkey.primary}</kbd_1.Kbd>}
          {stopHotkey.alt && <>
              <span class="text-muted-foreground/60">or</span>
              <kbd_1.Kbd class="-me-1">{stopHotkey.alt}</kbd_1.Kbd>
            </>}
        </span>;
        if (isStreaming && hasContent)
            return <span class="flex items-center gap-1">
          Add to queue
          <kbd_1.Kbd class="ms-0.5">
            <icons_1.EnterIcon class="size-2.5 inline"/>
          </kbd_1.Kbd>
          <span class="text-muted-foreground/60">or</span>
          Send now
          <kbd_1.Kbd class="ms-0.5">Alt</kbd_1.Kbd>
          <kbd_1.Kbd class="-me-1">
            <icons_1.EnterIcon class="size-2.5 inline"/>
          </kbd_1.Kbd>
        </span>;
        if (isSubmitting)
            return "Generating...";
        return <div class="flex flex-col items-start gap-0.5">
        <div class="flex items-center gap-1">
          <span>Send</span>
          <span class="text-muted-foreground inline-flex items-center gap-1">
            <kbd_1.Kbd>
              <icons_1.EnterIcon class="size-2.5 inline"/>
            </kbd_1.Kbd>
          </span>
        </div>
        <div class="flex items-center gap-1">
          <span>Send now</span>
          <span class="text-muted-foreground inline-flex items-center gap-1">
            <kbd_1.Kbd>Alt</kbd_1.Kbd>
            <kbd_1.Kbd>
              <icons_1.EnterIcon class="size-2.5 inline"/>
            </kbd_1.Kbd>
          </span>
        </div>
      </div>;
    };
    // Determine aria-label
    var getAriaLabel = function () {
        if (ariaLabel)
            return ariaLabel;
        if (isVoiceMode) {
            if (isTranscribing)
                return "Transcribing...";
            if (isRecording)
                return "Stop recording";
            return "Voice input";
        }
        if (isStreaming && !hasContent)
            return "Stop generation";
        if (isStreaming && hasContent)
            return "Add to queue";
        if (isSubmitting)
            return "Generating...";
        return "Send message";
    };
    // Apply glow effect when button is active and ready to send/queue
    // Also apply for voice mode when not recording/transcribing
    var shouldShowGlow = (!isStreaming && !isSubmitting && !disabled || shouldShowQueueArrow) && !isRecording;
    var glowClass = shouldShowGlow ? "shadow-[0_0_0_2px_white,0_0_0_4px_rgba(0,0,0,0.06)] dark:shadow-[0_0_0_2px_#1a1a1a,0_0_0_4px_rgba(255,255,255,0.08)]" : undefined;
    // Mode-specific styling (agent=foreground, plan=orange)
    // Recording state uses same styling as normal mode (wave indicator shows recording state)
    var modeClass = mode === "plan" ? "!bg-plan-mode hover:!bg-plan-mode/90 !text-background !shadow-none" : "!bg-foreground hover:!bg-foreground/90 !text-background !shadow-none";
    // Handle button interactions for voice mode
    // Supports both hold-to-talk AND click-to-toggle
    var handleMouseDown = function () {
        if (isVoiceMode && !isRecording && onVoiceMouseDown) {
            onVoiceMouseDown();
        }
    };
    var handleMouseUp = function () {
        // Only handle mouseUp for hold-to-talk if we started recording on mouseDown
        // Click-to-toggle is handled in handleButtonClick
    };
    var handleMouseLeave = function () {
        if (isVoiceMode && isRecording && onVoiceMouseLeave) {
            onVoiceMouseLeave();
        }
    };
    var handleButtonClick = function () {
        // In voice mode: if recording, stop it; if not recording, start it
        if (isVoiceMode) {
            if (isRecording && onVoiceMouseUp) {
                onVoiceMouseUp();
            }
            // Starting is handled by mouseDown
            return;
        }
        handleClick();
    };
    // Hide tooltip during recording so wave indicator is visible
    var tooltipOpen = isRecording ? false : undefined;
    return <tooltip_1.Tooltip delayDuration={1e3} open={tooltipOpen}>
      <tooltip_1.TooltipTrigger asChild>
        <button_1.Button size={size} class={"h-7 w-7 rounded-full transition-[background-color,transform,opacity] duration-150 ease-out active:scale-[0.97] flex items-center justify-center ".concat(glowClass || "", " ").concat(modeClass, " ").concat(className)} disabled={isDisabled || isTranscribing} type="button" onClick={handleButtonClick} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} onMouseLeave={handleMouseLeave} aria-label={getAriaLabel()}>
          {getIcon()}
        </button_1.Button>
      </tooltip_1.TooltipTrigger>
      <tooltip_1.TooltipContent side="left">{getTooltipContent()}</tooltip_1.TooltipContent>
    </tooltip_1.Tooltip>;
}
