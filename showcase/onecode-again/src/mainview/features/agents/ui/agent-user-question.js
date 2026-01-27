"use client";
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentUserQuestion = void 0;
var solid_js_1 = require("solid-js");
var lucide_solid_1 = require("lucide-solid");
var button_1 = require("../../../components/ui/button");
var utils_1 = require("../../../lib/utils");
exports.AgentUserQuestion = memo(forwardRef(function AgentUserQuestion(_a, ref) {
    var pendingQuestions = _a.pendingQuestions, onAnswer = _a.onAnswer, onSkip = _a.onSkip, _b = _a.hasCustomText, hasCustomText = _b === void 0 ? false : _b;
    var questions = pendingQuestions.questions, toolUseId = pendingQuestions.toolUseId;
    var _c = (0, solid_js_1.createSignal)(0), currentQuestionIndex = _c[0], setCurrentQuestionIndex = _c[1];
    var _d = (0, solid_js_1.createSignal)({}), answers = _d[0], setAnswers = _d[1];
    var _e = (0, solid_js_1.createSignal)(0), focusedOptionIndex = _e[0], setFocusedOptionIndex = _e[1];
    var _f = (0, solid_js_1.createSignal)(true), isVisible = _f[0], setIsVisible = _f[1];
    var _g = (0, solid_js_1.createSignal)(false), isSubmitting = _g[0], setIsSubmitting = _g[1];
    var _h = (0, solid_js_1.createSignal)(currentQuestionIndex), prevIndexRef = _h[0], setPrevIndexRef = _h[1];
    var _j = (0, solid_js_1.createSignal)(toolUseId), prevToolUseIdRef = _j[0], setPrevToolUseIdRef = _j[1];
    // Expose getAnswers method to parent via ref
    useImperativeHandle(ref, function () { return ({ getAnswers: function () {
            var formattedAnswers = {};
            for (var _i = 0, questions_1 = questions; _i < questions_1.length; _i++) {
                var question = questions_1[_i];
                var selected = answers[question.question] || [];
                if (selected.length > 0) {
                    formattedAnswers[question.question] = selected.join(", ");
                }
            }
            return formattedAnswers;
        } }); }, [answers, questions]);
    // Reset when toolUseId changes (new question set)
    (0, solid_js_1.createEffect)(function () {
        if (prevToolUseIdRef.current !== toolUseId) {
            setIsSubmitting(false);
            setCurrentQuestionIndex(0);
            setAnswers({});
            setFocusedOptionIndex(0);
            prevToolUseIdRef.current = toolUseId;
        }
    });
    // Animate on question change
    (0, solid_js_1.createEffect)(function () {
        if (prevIndexRef.current !== currentQuestionIndex) {
            setIsVisible(false);
            var timer_1 = setTimeout(function () {
                setIsVisible(true);
            }, 50);
            prevIndexRef.current = currentQuestionIndex;
            return function () { return clearTimeout(timer_1); };
        }
    });
    if (questions.length === 0) {
        return null;
    }
    var currentQuestion = questions[currentQuestionIndex];
    var currentOptions = (currentQuestion === null || currentQuestion === void 0 ? void 0 : currentQuestion.options) || [];
    var isOptionSelected = function (questionText, optionLabel) {
        var _a;
        return ((_a = answers[questionText]) === null || _a === void 0 ? void 0 : _a.includes(optionLabel)) || false;
    };
    // Handle option click - auto-advance for single-select questions
    var handleOptionClick = function (questionText, optionLabel, questionIndex) {
        var question = questions[questionIndex];
        var allowMultiple = (question === null || question === void 0 ? void 0 : question.multiSelect) || false;
        var isLastQuestion = questionIndex === questions.length - 1;
        setAnswers(function (prev) {
            var _a, _b, _c;
            var currentAnswers = prev[questionText] || [];
            if (allowMultiple) {
                if (currentAnswers.includes(optionLabel)) {
                    return __assign(__assign({}, prev), (_a = {}, _a[questionText] = currentAnswers.filter(function (l) { return l !== optionLabel; }), _a));
                }
                else {
                    return __assign(__assign({}, prev), (_b = {}, _b[questionText] = __spreadArray(__spreadArray([], currentAnswers, true), [optionLabel], false), _b));
                }
            }
            else {
                return __assign(__assign({}, prev), (_c = {}, _c[questionText] = [optionLabel], _c));
            }
        });
        // For single-select questions, auto-advance to next question
        if (!allowMultiple && !isLastQuestion) {
            setTimeout(function () {
                setCurrentQuestionIndex(questionIndex + 1);
                setFocusedOptionIndex(0);
            }, 150);
        }
    };
    var handlePrevious = function () {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
            setFocusedOptionIndex(0);
        }
    };
    var handleNext = function () {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setFocusedOptionIndex(0);
        }
    };
    var handleContinue = function () {
        if (isSubmitting)
            return;
        var currentAnswer = answers[currentQuestion === null || currentQuestion === void 0 ? void 0 : currentQuestion.question] || [];
        if (currentAnswer.length === 0)
            return;
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setFocusedOptionIndex(0);
        }
        else {
            // On the last question, validate ALL questions are answered before submit
            var allAnswered = questions.every(function (q) { return (answers[q.question] || []).length > 0; });
            if (allAnswered) {
                setIsSubmitting(true);
                // Convert answers to SDK format: { questionText: label } or { questionText: "label1, label2" } for multiSelect
                var formattedAnswers = {};
                for (var _i = 0, questions_2 = questions; _i < questions_2.length; _i++) {
                    var question = questions_2[_i];
                    var selected = answers[question.question] || [];
                    formattedAnswers[question.question] = selected.join(", ");
                }
                onAnswer(formattedAnswers);
            }
        }
    };
    var handleSkipWithGuard = function () {
        if (isSubmitting)
            return;
        setIsSubmitting(true);
        onSkip();
    };
    var getOptionNumber = function (index) {
        return String(index + 1);
    };
    var currentQuestionHasAnswer = (answers[currentQuestion === null || currentQuestion === void 0 ? void 0 : currentQuestion.question] || []).length > 0;
    var allQuestionsAnswered = questions.every(function (q) { return (answers[q.question] || []).length > 0; });
    var isLastQuestion = currentQuestionIndex === questions.length - 1;
    // Keyboard navigation
    (0, solid_js_1.createEffect)(function () {
        var handleKeyDown = function (e) {
            var _a;
            if (isSubmitting)
                return;
            var activeEl = document.activeElement;
            if (activeEl instanceof HTMLInputElement || activeEl instanceof HTMLTextAreaElement || (activeEl === null || activeEl === void 0 ? void 0 : activeEl.getAttribute("contenteditable")) === "true") {
                return;
            }
            if (e.key === "ArrowDown") {
                e.preventDefault();
                if (focusedOptionIndex < currentOptions.length - 1) {
                    setFocusedOptionIndex(focusedOptionIndex + 1);
                }
                else if (currentQuestionIndex < questions.length - 1) {
                    setCurrentQuestionIndex(currentQuestionIndex + 1);
                    setFocusedOptionIndex(0);
                }
            }
            else if (e.key === "ArrowUp") {
                e.preventDefault();
                if (focusedOptionIndex > 0) {
                    setFocusedOptionIndex(focusedOptionIndex - 1);
                }
                else if (currentQuestionIndex > 0) {
                    var prevQuestionOptions = ((_a = questions[currentQuestionIndex - 1]) === null || _a === void 0 ? void 0 : _a.options) || [];
                    setCurrentQuestionIndex(currentQuestionIndex - 1);
                    setFocusedOptionIndex(prevQuestionOptions.length - 1);
                }
            }
            else if (e.key === "Enter") {
                e.preventDefault();
                if (currentQuestionHasAnswer) {
                    handleContinue();
                }
                else if (currentOptions[focusedOptionIndex]) {
                    handleOptionClick(currentQuestion.question, currentOptions[focusedOptionIndex].label, currentQuestionIndex);
                }
            }
            else if (e.key >= "1" && e.key <= "9") {
                var numberIndex = parseInt(e.key, 10) - 1;
                if (numberIndex >= 0 && numberIndex < currentOptions.length) {
                    e.preventDefault();
                    handleOptionClick(currentQuestion.question, currentOptions[numberIndex].label, currentQuestionIndex);
                    setFocusedOptionIndex(numberIndex);
                }
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return function () { return document.removeEventListener("keydown", handleKeyDown); };
    });
    return <div class="border rounded-t-xl border-b-0 border-border bg-muted/30 overflow-hidden">
      {/* Header */}
      <div class="flex items-center justify-between px-3 py-1.5">
        <div class="flex items-center gap-1.5">
          <span class="text-[12px] text-muted-foreground">
            {(currentQuestion === null || currentQuestion === void 0 ? void 0 : currentQuestion.header) || "Question"}
          </span>
          <span class="text-muted-foreground/50">•</span>
          <span class="text-[12px] text-muted-foreground">
            {(currentQuestion === null || currentQuestion === void 0 ? void 0 : currentQuestion.multiSelect) ? "Multi-select" : "Single-select"}
          </span>
        </div>

        {/* Navigation */}
        {questions.length > 1 && <div class="flex items-center gap-1">
            <button onClick={handlePrevious} disabled={currentQuestionIndex === 0} class="p-0.5 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed outline-none">
              <lucide_solid_1.ChevronUp class="w-4 h-4 text-muted-foreground"/>
            </button>
            <span class="text-xs text-muted-foreground px-1">
              {currentQuestionIndex + 1} / {questions.length}
            </span>
            <button onClick={handleNext} disabled={currentQuestionIndex === questions.length - 1} class="p-0.5 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed outline-none">
              <lucide_solid_1.ChevronDown class="w-4 h-4 text-muted-foreground"/>
            </button>
          </div>}
      </div>

      {/* Current Question */}
      <div class={(0, utils_1.cn)("px-1 pb-2 transition-opacity duration-150 ease-out", isVisible ? "opacity-100" : "opacity-0")}>
        <div class="text-[14px] font-[450] text-foreground mb-3 pt-1 px-2">
          <span class="text-muted-foreground">{currentQuestionIndex + 1}.</span> {currentQuestion === null || currentQuestion === void 0 ? void 0 : currentQuestion.question}
        </div>

        {/* Options */}
        <div class="space-y-1">
          {currentOptions.map(function (option, optIndex) {
            var isSelected = isOptionSelected(currentQuestion.question, option.label);
            var isFocused = focusedOptionIndex === optIndex;
            var number = getOptionNumber(optIndex);
            return <button key={option.label} onClick={function () {
                    if (isSubmitting)
                        return;
                    handleOptionClick(currentQuestion.question, option.label, currentQuestionIndex);
                    setFocusedOptionIndex(optIndex);
                }} disabled={isSubmitting} class={(0, utils_1.cn)("w-full flex items-start gap-3 p-2 text-[13px] text-foreground rounded-md text-left transition-colors outline-none", isFocused ? "bg-muted/70" : "hover:bg-muted/50", isSubmitting && "opacity-50 cursor-not-allowed")}>
                <div class={(0, utils_1.cn)("flex-shrink-0 w-5 h-5 rounded flex items-center justify-center text-[10px] font-medium transition-colors mt-0.5", isSelected ? "bg-foreground text-background" : "bg-muted text-muted-foreground")}>
                  {number}
                </div>
                <div class="flex flex-col gap-0.5">
                  <span class={(0, utils_1.cn)("text-[13px] transition-colors font-medium", isSelected ? "text-foreground" : "text-foreground")}>
                    {option.label}
                  </span>
                  {option.description && <span class="text-[12px] text-muted-foreground">
                      {option.description}
                    </span>}
                </div>
              </button>;
        })}
        </div>
      </div>

      {/* Footer */}
      <div class="flex items-center justify-end gap-2 px-2 py-2">
        <button_1.Button variant="ghost" size="sm" onClick={handleSkipWithGuard} disabled={isSubmitting} class="h-6 px-2 text-xs text-muted-foreground hover:text-foreground">
          Skip All
        </button_1.Button>
        <button_1.Button size="sm" onClick={handleContinue} disabled={isSubmitting || hasCustomText || (isLastQuestion ? !allQuestionsAnswered : !currentQuestionHasAnswer)} class="h-6 text-xs px-3 rounded-md">
          {isSubmitting ? "Sending..." : <>
              {isLastQuestion ? "Submit" : "Continue"}
              <lucide_solid_1.CornerDownLeft class="w-3 h-3 ml-1 opacity-60"/>
            </>}
        </button_1.Button>
      </div>
    </div>;
}));
