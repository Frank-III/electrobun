import { splitProps, For } from "solid-js";
import { TextShimmer } from "../../../components/ui/text-shimmer";
import { QuestionIcon } from "../../../components/ui/icons";
import { QUESTIONS_SKIPPED_MESSAGE, QUESTIONS_TIMED_OUT_MESSAGE, askUserQuestionResultsAtom, pendingUserQuestionsAtom } from "../atoms";
interface AgentAskUserQuestionToolProps {
	input: {
		questions?: Array<{
			question: string;
			header: string;
			options: Array<{
				label: string;
				description: string;
			}>;
			multiSelect: boolean;
		}>;
	};
	result?: {
		questions?: unknown;
		answers?: Record<string, string>;
	} | string;
	errorText?: string;
	state: "call" | "result";
	isError?: boolean;
	isStreaming?: boolean;
	toolCallId?: string;
}
export function AgentAskUserQuestionTool(props: AgentAskUserQuestionToolProps) {
	const [local] = splitProps(props, ["input", "result", "errorText", "state", "isError", "isStreaming", "toolCallId"]);
	const questions = local.input?.questions ?? [];
	const questionCount = questions.length;
	// Get real-time results from atom (for immediate updates before DB sync)
	const resultsMap = askUserQuestionResultsAtom[0];
	const realtimeResult = local.toolCallId ? resultsMap.get(local.toolCallId) : undefined;
	// Check if the question dialog is currently shown for this tool
	const pendingQuestionsMap = pendingUserQuestionsAtom[0];
	const isDialogShown = local.toolCallId ? Array.from(pendingQuestionsMap.values()).some((q) => q.toolUseId === local.toolCallId) : false;
	// Use realtime result if available, otherwise fall back to prop
	const effectiveResult = realtimeResult ?? local.result;
	// For errors, SDK stores errorText separately - use it to detect skip/timeout
	const effectiveErrorText = local.errorText || (typeof effectiveResult === "string" ? effectiveResult : undefined);
	// Extract answers for display
	const answers = effectiveResult && typeof effectiveResult === "object" && "answers" in effectiveResult ? (effectiveResult as {
		answers?: Record<string, string>;
	}).answers : null;
	// Determine status
	const isSkipped = effectiveErrorText === QUESTIONS_SKIPPED_MESSAGE;
	const isTimedOut = effectiveErrorText === QUESTIONS_TIMED_OUT_MESSAGE;
	const isCompleted = local.state === "result" && answers && !isSkipped && !isTimedOut && !local.isError;
	// Show loading state if:
	// 1. No questions yet (still streaming input)
	// 2. Streaming but dialog not yet shown (waiting for ask-user-question chunk)
	if (local.state === "call" && (questionCount === 0 || local.isStreaming && !isDialogShown)) {
		return <div class="flex items-center gap-2 py-1 px-2 text-xs text-muted-foreground">
        <TextShimmer class="text-xs" duration={1.5}>
          Asking question...
        </TextShimmer>
      </div>;
	}
	// Show skipped/timed out state
	if (local.state === "result" && (isSkipped || isTimedOut)) {
		const firstQuestion = questions[0]?.header || questions[0]?.question;
		return <div class="flex items-center gap-2 py-1 px-2 text-xs text-muted-foreground">
        <span>{firstQuestion || "Question"}</span>
        <span class="text-muted-foreground/50">•</span>
        <span>{isTimedOut ? "Timed out" : "Skipped"}</span>
      </div>;
	}
	// Show error state
	if (local.state === "result" && local.isError) {
		return <div class="flex items-center gap-2 py-1 px-2 text-xs text-muted-foreground">
        <span>Question</span>
        <span class="text-muted-foreground/50">•</span>
        <span class="text-red-500">{effectiveErrorText || "Error"}</span>
      </div>;
	}
	// Show completed state with card layout
	if (isCompleted && answers) {
		const entries = Object.entries(answers);
		if (entries.length === 0) {
			return <div class="flex items-center gap-2 py-1 px-2 text-xs text-muted-foreground">
          <span>Question answered</span>
        </div>;
		}
		return <div class="rounded-lg border border-border bg-muted/30 overflow-hidden mx-2">
        {		/* Header */}
        <div class="flex items-center gap-1.5 pl-2.5 pr-2 h-7 border-b border-border">
          <QuestionIcon class="w-3.5 h-3.5 text-muted-foreground" />
          <span class="text-xs text-muted-foreground">
            {entries.length === 1 ? "Answer" : "Answers"}
          </span>
        </div>
        { /* Content */}
        <div class="flex flex-col gap-2 p-2.5 text-xs">
          <For each={entries}>
            {([question, answer]) => (
              <div class="flex flex-col gap-0.5">
                <span class="font-medium text-foreground">{question}</span>
                <span class="text-muted-foreground">{answer}</span>
              </div>
            )}
          </For>
        </div>
      </div>;
 }
	// Show pending state
	const firstQuestion = questions[0]?.header || questions[0]?.question;
	// If streaming THIS message, show "Waiting for response..."
	// isStreaming is true only when global streaming is active AND this is the last message
	if (local.isStreaming) {
		return <div class="flex items-center gap-2 py-1 px-2 text-xs text-muted-foreground">
        <span>{firstQuestion || "Question"}</span>
        <span class="text-muted-foreground/50">•</span>
        <span>Waiting for response...</span>
      </div>;
	}
	// If we have a realtime result but it hasn't synced to the message yet,
	// show "Submitting..." (user just answered, waiting for sync)
	// Note: realtimeResult is set immediately when user answers via ask-user-question-result chunk
	// If there's no realtimeResult and no answers, the stream was interrupted without an answer
	if (local.state === "result" && realtimeResult && !answers && !local.isError && !isSkipped && !isTimedOut) {
		return <div class="flex items-center gap-2 py-1 px-2 text-xs text-muted-foreground">
        <span>{firstQuestion || "Question"}</span>
        <span class="text-muted-foreground/50">•</span>
        <span>Submitting...</span>
      </div>;
	}
	// Not streaming and state is "call" - it was truly interrupted
	return <div class="flex items-center gap-2 py-1 px-2 text-xs text-muted-foreground">
      <span>{firstQuestion || "Question"}</span>
      <span class="text-muted-foreground/50">•</span>
      <span>Interrupted</span>
    </div>;
}
