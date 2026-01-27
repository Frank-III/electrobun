"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentAskUserQuestionTool = void 0;
var solid_js_1 = require("solid-js");
var jotai_1 = require("../../../lib/state/jotai");
var text_shimmer_1 = require("../../../components/ui/text-shimmer");
var icons_1 = require("../../../components/ui/icons");
var atoms_1 = require("../atoms");
var agent_tool_utils_1 = require("./agent-tool-utils");
exports.AgentAskUserQuestionTool = (0, solid_js_1.memo)(function AgentAskUserQuestionTool(_a) {
    var _b, _c, _d, _e, _f;
    var input = _a.input, result = _a.result, errorText = _a.errorText, state = _a.state, isError = _a.isError, isStreaming = _a.isStreaming, toolCallId = _a.toolCallId;
    var questions = (_b = input === null || input === void 0 ? void 0 : input.questions) !== null && _b !== void 0 ? _b : [];
    var questionCount = questions.length;
    // Get real-time results from atom (for immediate updates before DB sync)
    var resultsMap = (0, jotai_1.useAtomValue)(atoms_1.askUserQuestionResultsAtom);
    var realtimeResult = toolCallId ? resultsMap.get(toolCallId) : undefined;
    // Check if the question dialog is currently shown for this tool
    var pendingQuestionsMap = (0, jotai_1.useAtomValue)(atoms_1.pendingUserQuestionsAtom);
    var isDialogShown = toolCallId ? Array.from(pendingQuestionsMap.values()).some(function (q) { return q.toolUseId === toolCallId; }) : false;
    // Use realtime result if available, otherwise fall back to prop
    var effectiveResult = realtimeResult !== null && realtimeResult !== void 0 ? realtimeResult : result;
    // For errors, SDK stores errorText separately - use it to detect skip/timeout
    var effectiveErrorText = errorText || (typeof effectiveResult === "string" ? effectiveResult : undefined);
    // Extract answers for display
    var answers = effectiveResult && typeof effectiveResult === "object" && "answers" in effectiveResult ? effectiveResult.answers : null;
    // Determine status
    var isSkipped = effectiveErrorText === atoms_1.QUESTIONS_SKIPPED_MESSAGE;
    var isTimedOut = effectiveErrorText === atoms_1.QUESTIONS_TIMED_OUT_MESSAGE;
    var isCompleted = state === "result" && answers && !isSkipped && !isTimedOut && !isError;
    // Show loading state if:
    // 1. No questions yet (still streaming input)
    // 2. Streaming but dialog not yet shown (waiting for ask-user-question chunk)
    if (state === "call" && (questionCount === 0 || isStreaming && !isDialogShown)) {
        return <div class="flex items-center gap-2 py-1 px-2 text-xs text-muted-foreground">
        <text_shimmer_1.TextShimmer class="text-xs" duration={1.5}>
          Asking question...
        </text_shimmer_1.TextShimmer>
      </div>;
    }
    // Show skipped/timed out state
    if (state === "result" && (isSkipped || isTimedOut)) {
        var firstQuestion_1 = ((_c = questions[0]) === null || _c === void 0 ? void 0 : _c.header) || ((_d = questions[0]) === null || _d === void 0 ? void 0 : _d.question);
        return <div class="flex items-center gap-2 py-1 px-2 text-xs text-muted-foreground">
        <span>{firstQuestion_1 || "Question"}</span>
        <span class="text-muted-foreground/50">•</span>
        <span>{isTimedOut ? "Timed out" : "Skipped"}</span>
      </div>;
    }
    // Show error state
    if (state === "result" && isError) {
        return <div class="flex items-center gap-2 py-1 px-2 text-xs text-muted-foreground">
        <span>Question</span>
        <span class="text-muted-foreground/50">•</span>
        <span class="text-red-500">{effectiveErrorText || "Error"}</span>
      </div>;
    }
    // Show completed state with card layout
    if (isCompleted && answers) {
        var entries = Object.entries(answers);
        if (entries.length === 0) {
            return <div class="flex items-center gap-2 py-1 px-2 text-xs text-muted-foreground">
          <span>Question answered</span>
        </div>;
        }
        return <div class="rounded-lg border border-border bg-muted/30 overflow-hidden mx-2">
        {/* Header */}
        <div class="flex items-center gap-1.5 pl-2.5 pr-2 h-7 border-b border-border">
          <icons_1.QuestionIcon class="w-3.5 h-3.5 text-muted-foreground"/>
          <span class="text-xs text-muted-foreground">
            {entries.length === 1 ? "Answer" : "Answers"}
          </span>
        </div>
        {/* Content */}
        <div class="flex flex-col gap-2 p-2.5 text-xs">
          {entries.map(function (_a, idx) {
                var question = _a[0], answer = _a[1];
                return <div key={idx} class="flex flex-col gap-0.5">
              <span class="font-medium text-foreground">{question}</span>
              <span class="text-muted-foreground">{answer}</span>
            </div>;
            })}
        </div>
      </div>;
    }
    // Show pending state
    var firstQuestion = ((_e = questions[0]) === null || _e === void 0 ? void 0 : _e.header) || ((_f = questions[0]) === null || _f === void 0 ? void 0 : _f.question);
    // If streaming THIS message, show "Waiting for response..."
    // isStreaming is true only when global streaming is active AND this is the last message
    if (isStreaming) {
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
    if (state === "result" && realtimeResult && !answers && !isError && !isSkipped && !isTimedOut) {
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
}, agent_tool_utils_1.areAskUserQuestionPropsEqual);
