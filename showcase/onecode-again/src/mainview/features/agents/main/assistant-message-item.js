"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssistantMessageItem = void 0;
var jotai_1 = require("../../../lib/state/jotai");
var lucide_solid_1 = require("lucide-solid");
var solid_js_1 = require("solid-js");
var icons_1 = require("../../../components/ui/icons");
var text_shimmer_1 = require("../../../components/ui/text-shimmer");
var utils_1 = require("../../../lib/utils");
var message_store_1 = require("../stores/message-store");
var agent_ask_user_question_tool_1 = require("../ui/agent-ask-user-question-tool");
var agent_bash_tool_1 = require("../ui/agent-bash-tool");
var agent_edit_tool_1 = require("../ui/agent-edit-tool");
var agent_exploring_group_1 = require("../ui/agent-exploring-group");
var agent_plan_file_tool_1 = require("../ui/agent-plan-file-tool");
var agent_tool_utils_1 = require("../ui/agent-tool-utils");
var agent_message_usage_1 = require("../ui/agent-message-usage");
var agent_plan_tool_1 = require("../ui/agent-plan-tool");
var agent_task_tool_1 = require("../ui/agent-task-tool");
var agent_thinking_tool_1 = require("../ui/agent-thinking-tool");
var agent_todo_tool_1 = require("../ui/agent-todo-tool");
var agent_tool_call_1 = require("../ui/agent-tool-call");
var agent_tool_registry_1 = require("../ui/agent-tool-registry");
var agent_web_fetch_tool_1 = require("../ui/agent-web-fetch-tool");
var agent_web_search_collapsible_1 = require("../ui/agent-web-search-collapsible");
var message_action_buttons_1 = require("../ui/message-action-buttons");
var memoized_text_part_1 = require("./memoized-text-part");
// Exploring tools - these get grouped when 3+ consecutive
var EXPLORING_TOOLS = new Set([
    "tool-Read",
    "tool-Grep",
    "tool-Glob",
    "tool-WebSearch",
    "tool-WebFetch"
]);
// Group consecutive exploring tools into exploring-group
function groupExploringTools(parts, nestedToolIds) {
    var result = [];
    var currentGroup = [];
    for (var _i = 0, parts_1 = parts; _i < parts_1.length; _i++) {
        var part = parts_1[_i];
        var isNested = part.toolCallId && nestedToolIds.has(part.toolCallId);
        if (EXPLORING_TOOLS.has(part.type) && !isNested) {
            currentGroup.push(part);
        }
        else {
            if (currentGroup.length >= 3) {
                result.push({
                    type: "exploring-group",
                    parts: currentGroup
                });
            }
            else {
                result.push.apply(result, currentGroup);
            }
            currentGroup = [];
            result.push(part);
        }
    }
    if (currentGroup.length >= 3) {
        result.push({
            type: "exploring-group",
            parts: currentGroup
        });
    }
    else {
        result.push.apply(result, currentGroup);
    }
    return result;
}
function CollapsibleSteps(_a) {
    var stepsCount = _a.stepsCount, children = _a.children, _b = _a.defaultExpanded, defaultExpanded = _b === void 0 ? false : _b;
    var _c = (0, solid_js_1.createSignal)(defaultExpanded), isExpanded = _c[0], setIsExpanded = _c[1];
    if (stepsCount === 0)
        return null;
    return <div class="mb-2" data-collapsible-steps="true">
      <div class="flex items-center justify-between rounded-md py-0.5 px-2 cursor-pointer hover:bg-muted/50 transition-colors" onClick={function () { return setIsExpanded(!isExpanded); }}>
        <div class="flex items-center gap-1.5 text-xs text-muted-foreground">
          <lucide_solid_1.ListTree class="w-3.5 h-3.5 flex-shrink-0"/>
          <span class="font-medium whitespace-nowrap">
            {stepsCount} {stepsCount === 1 ? "step" : "steps"}
          </span>
        </div>
        <button class="p-1 rounded-md hover:bg-accent transition-[background-color,transform] duration-150 ease-out active:scale-95" onClick={function (e) {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
        }}>
          <div class="relative w-4 h-4">
            <icons_1.ExpandIcon class={(0, utils_1.cn)("absolute inset-0 w-4 h-4 text-muted-foreground transition-[opacity,transform] duration-200 ease-out", isExpanded ? "opacity-0 scale-75" : "opacity-100 scale-100")}/>
            <icons_1.CollapseIcon class={(0, utils_1.cn)("absolute inset-0 w-4 h-4 text-muted-foreground transition-[opacity,transform] duration-200 ease-out", isExpanded ? "opacity-100 scale-100" : "opacity-0 scale-75")}/>
          </div>
        </button>
      </div>
      {isExpanded && <div class="mt-1 space-y-1.5">{children}</div>}
    </div>;
}
var messageStateCache = new Map();
// Custom comparison - check if message content actually changed
// CRITICAL: AI SDK mutates objects in-place! So prev.message.parts[i].text === next.message.parts[i].text
// even when text HAS changed (they're the same mutated object).
// Solution: Cache state externally and compare those.
function areMessagePropsEqual(prev, next) {
    var _a, _b, _c, _d;
    var msgId = (_a = next.message) === null || _a === void 0 ? void 0 : _a.id;
    // Different message ID = different message
    if (((_b = prev.message) === null || _b === void 0 ? void 0 : _b.id) !== ((_c = next.message) === null || _c === void 0 ? void 0 : _c.id)) {
        return false;
    }
    // Check other props first (cheap comparisons)
    if (prev.status !== next.status)
        return false;
    if (prev.isStreaming !== next.isStreaming)
        return false;
    if (prev.isLastMessage !== next.isLastMessage)
        return false;
    if (prev.isMobile !== next.isMobile)
        return false;
    if (prev.subChatId !== next.subChatId)
        return false;
    if (prev.chatId !== next.chatId)
        return false;
    if (prev.sandboxSetupStatus !== next.sandboxSetupStatus)
        return false;
    // Get current message state from parts
    var nextParts = ((_d = next.message) === null || _d === void 0 ? void 0 : _d.parts) || [];
    var lastPart = nextParts[nextParts.length - 1];
    var currentState = {
        textLengths: nextParts.map(function (p) { var _a; return p.type === "text" ? ((_a = p.text) === null || _a === void 0 ? void 0 : _a.length) || 0 : -1; }),
        partStates: nextParts.map(function (p) { return p.state; }),
        lastPartInputJson: (lastPart === null || lastPart === void 0 ? void 0 : lastPart.input) ? JSON.stringify(lastPart.input) : undefined
    };
    // Get cached state from previous render
    var cachedState = msgId ? messageStateCache.get(msgId) : undefined;
    // If no cache, this is first comparison - cache and allow render
    if (!cachedState) {
        if (msgId)
            messageStateCache.set(msgId, currentState);
        return false;
    }
    // Compare parts count
    if (cachedState.textLengths.length !== currentState.textLengths.length) {
        messageStateCache.set(msgId, currentState);
        return false;
    }
    // Compare text lengths (detects streaming text changes!)
    for (var i = 0; i < currentState.textLengths.length; i++) {
        if (cachedState.textLengths[i] !== currentState.textLengths[i]) {
            messageStateCache.set(msgId, currentState);
            return false;
        }
    }
    // Compare last part's input (detects tool input streaming!)
    if (cachedState.lastPartInputJson !== currentState.lastPartInputJson) {
        messageStateCache.set(msgId, currentState);
        return false;
    }
    // Compare ALL part states (detects Edit plan file streaming!)
    for (var i = 0; i < currentState.partStates.length; i++) {
        if (cachedState.partStates[i] !== currentState.partStates[i]) {
            messageStateCache.set(msgId, currentState);
            return false;
        }
    }
    // Nothing changed - skip re-render
    return true;
}
exports.AssistantMessageItem = memo(function AssistantMessageItem(_a) {
    var _b;
    var message = _a.message, isLastMessage = _a.isLastMessage, isStreaming = _a.isStreaming, status = _a.status, isMobile = _a.isMobile, subChatId = _a.subChatId, chatId = _a.chatId, _c = _a.sandboxSetupStatus, sandboxSetupStatus = _c === void 0 ? "ready" : _c;
    var onRollback = (0, jotai_1.useAtomValue)(message_store_1.rollbackHandlerAtom);
    var isRollingBack = (0, jotai_1.useAtomValue)(message_store_1.isRollingBackAtom);
    var messageParts = (message === null || message === void 0 ? void 0 : message.parts) || [];
    var contentParts = (0, solid_js_1.createMemo)(function () { return messageParts.filter(function (p) { return p.type !== "step-start"; }); });
    var shouldShowPlanning = sandboxSetupStatus === "ready" && isStreaming && isLastMessage && contentParts.length === 0;
    var _d = (0, solid_js_1.createMemo)(function () {
        var _a;
        var nestedToolsMap = new Map();
        var nestedToolIds = new Set();
        var taskPartIds = new Set(messageParts.filter(function (p) { return p.type === "tool-Task" && p.toolCallId; }).map(function (p) { return p.toolCallId; }));
        var orphanTaskGroups = new Map();
        var orphanToolCallIds = new Set();
        var orphanFirstToolCallIds = new Set();
        for (var _i = 0, messageParts_1 = messageParts; _i < messageParts_1.length; _i++) {
            var part = messageParts_1[_i];
            if ((_a = part.toolCallId) === null || _a === void 0 ? void 0 : _a.includes(":")) {
                var parentId = part.toolCallId.split(":")[0];
                if (taskPartIds.has(parentId)) {
                    if (!nestedToolsMap.has(parentId)) {
                        nestedToolsMap.set(parentId, []);
                    }
                    nestedToolsMap.get(parentId).push(part);
                    nestedToolIds.add(part.toolCallId);
                }
                else {
                    var group = orphanTaskGroups.get(parentId);
                    if (!group) {
                        group = {
                            parts: [],
                            firstToolCallId: part.toolCallId
                        };
                        orphanTaskGroups.set(parentId, group);
                        orphanFirstToolCallIds.add(part.toolCallId);
                    }
                    group.parts.push(part);
                    orphanToolCallIds.add(part.toolCallId);
                }
            }
        }
        return {
            nestedToolsMap: nestedToolsMap,
            nestedToolIds: nestedToolIds,
            orphanTaskGroups: orphanTaskGroups,
            orphanToolCallIds: orphanToolCallIds,
            orphanFirstToolCallIds: orphanFirstToolCallIds
        };
    }), nestedToolsMap = _d.nestedToolsMap, nestedToolIds = _d.nestedToolIds, orphanTaskGroups = _d.orphanTaskGroups, orphanToolCallIds = _d.orphanToolCallIds, orphanFirstToolCallIds = _d.orphanFirstToolCallIds;
    // Collect all plan operations (Write/Edit) for unified handling
    var planOpsSummary = (0, solid_js_1.createMemo)(function () {
        var _a;
        var operations = [];
        for (var i = 0; i < messageParts.length; i++) {
            var part = messageParts[i];
            var filePath = ((_a = part.input) === null || _a === void 0 ? void 0 : _a.file_path) || "";
            if ((part.type === "tool-Write" || part.type === "tool-Edit") && (0, agent_tool_utils_1.isPlanFile)(filePath)) {
                operations.push({
                    type: part.type === "tool-Write" ? "write" : "edit",
                    part: part,
                    index: i
                });
            }
        }
        if (operations.length === 0) {
            return {
                operations: [],
                hasAnyPlanOperation: false,
                isStreaming: false,
                lastOperationType: null
            };
        }
        var isStreaming = operations.some(function (op) { return op.part.state === "input-streaming" || op.part.state === "pending"; });
        var lastOp = operations[operations.length - 1];
        return {
            operations: operations,
            hasAnyPlanOperation: true,
            isStreaming: isStreaming,
            lastOperationType: lastOp.type
        };
    });
    // Collapsing logic: collapse only if final text exists after tools
    var _e = (0, solid_js_1.createMemo)(function () {
        var _a, _b;
        var lastToolIndex = -1;
        var lastTextIndex = -1;
        for (var i = 0; i < messageParts.length; i++) {
            var part = messageParts[i];
            // Ignore ExitPlanMode - it's not a real tool for the user
            if (((_a = part.type) === null || _a === void 0 ? void 0 : _a.startsWith("tool-")) && part.type !== "tool-ExitPlanMode") {
                lastToolIndex = i;
            }
            if (part.type === "text" && ((_b = part.text) === null || _b === void 0 ? void 0 : _b.trim())) {
                lastTextIndex = i;
            }
        }
        var hasToolsAndFinalText = lastToolIndex !== -1 && lastTextIndex > lastToolIndex;
        var finalTextIndex = hasToolsAndFinalText ? lastTextIndex : -1;
        var hasFinalText = finalTextIndex !== -1 && (!isStreaming || !isLastMessage);
        // Collapse only when there's final text after tools
        var shouldCollapse = hasFinalText;
        var collapseBeforeIndex = hasFinalText ? finalTextIndex : -1;
        // Calculate visible steps count for collapsible header
        var stepParts = shouldCollapse && collapseBeforeIndex !== -1 ? messageParts.slice(0, collapseBeforeIndex) : [];
        var visibleStepsCount = stepParts.filter(function (p) {
            var _a;
            if (p.type === "step-start")
                return false;
            if (p.type === "tool-TaskOutput")
                return false;
            if (p.type === "tool-ExitPlanMode")
                return false;
            if (p.toolCallId && nestedToolIds.has(p.toolCallId))
                return false;
            if (p.toolCallId && orphanToolCallIds.has(p.toolCallId) && !orphanFirstToolCallIds.has(p.toolCallId))
                return false;
            if (p.type === "text" && !((_a = p.text) === null || _a === void 0 ? void 0 : _a.trim()))
                return false;
            return true;
        }).length;
        return {
            shouldCollapse: shouldCollapse,
            visibleStepsCount: visibleStepsCount,
            collapseBeforeIndex: collapseBeforeIndex
        };
    }), shouldCollapse = _e.shouldCollapse, visibleStepsCount = _e.visibleStepsCount, collapseBeforeIndex = _e.collapseBeforeIndex;
    // Check if any plan operation is in collapsed steps (before collapseBeforeIndex)
    var hasPlanInCollapsedSteps = (0, solid_js_1.createMemo)(function () {
        if (!shouldCollapse || collapseBeforeIndex === -1)
            return false;
        return planOpsSummary.operations.some(function (op) { return op.index < collapseBeforeIndex; });
    });
    // Get the last plan operation from collapsed steps for showing card
    var lastCollapsedPlanOp = (0, solid_js_1.createMemo)(function () {
        if (!hasPlanInCollapsedSteps)
            return null;
        var collapsedOps = planOpsSummary.operations.filter(function (op) { return op.index < collapseBeforeIndex; });
        return collapsedOps[collapsedOps.length - 1] || null;
    });
    var stepParts = (0, solid_js_1.createMemo)(function () {
        if (!shouldCollapse || collapseBeforeIndex === -1)
            return [];
        return messageParts.slice(0, collapseBeforeIndex);
    });
    var finalParts = (0, solid_js_1.createMemo)(function () {
        if (!shouldCollapse || collapseBeforeIndex === -1)
            return messageParts;
        return messageParts.slice(collapseBeforeIndex);
    });
    var hasTextContent = (0, solid_js_1.createMemo)(function () { return messageParts.some(function (p) { var _a; return p.type === "text" && ((_a = p.text) === null || _a === void 0 ? void 0 : _a.trim()); }); });
    var msgMetadata = message === null || message === void 0 ? void 0 : message.metadata;
    var renderPart = function (part, idx, isFinal) {
        var _a, _b, _c, _d, _e, _f;
        if (isFinal === void 0) { isFinal = false; }
        if (part.type === "step-start")
            return null;
        if (part.type === "tool-TaskOutput")
            return null;
        if (part.toolCallId && orphanToolCallIds.has(part.toolCallId)) {
            if (!orphanFirstToolCallIds.has(part.toolCallId))
                return null;
            var parentId = part.toolCallId.split(":")[0];
            var group = orphanTaskGroups.get(parentId);
            if (group) {
                return <agent_task_tool_1.AgentTaskTool key={idx} part={{
                        type: "tool-Task",
                        toolCallId: parentId,
                        input: {
                            subagent_type: "unknown-agent",
                            description: "Incomplete task"
                        }
                    }} nestedTools={group.parts} chatStatus={status}/>;
            }
        }
        if (part.toolCallId && nestedToolIds.has(part.toolCallId))
            return null;
        if (part.type === "exploring-group")
            return null;
        if (part.type === "text") {
            if (!((_a = part.text) === null || _a === void 0 ? void 0 : _a.trim()))
                return null;
            var isFinalText = isFinal && idx === collapseBeforeIndex;
            var isTextStreaming = isLastMessage && isStreaming;
            return <memoized_text_part_1.MemoizedTextPart key={idx} text={part.text} messageId={message.id} partIndex={idx} isFinalText={isFinalText} visibleStepsCount={visibleStepsCount} isStreaming={isTextStreaming}/>;
        }
        if (part.type === "tool-Task") {
            var nestedTools = nestedToolsMap.get(part.toolCallId) || [];
            return <agent_task_tool_1.AgentTaskTool key={idx} part={part} nestedTools={nestedTools} chatStatus={status}/>;
        }
        if (part.type === "tool-Bash")
            return <agent_bash_tool_1.AgentBashTool key={idx} part={part} messageId={message.id} partIndex={idx} chatStatus={status}/>;
        if (part.type === "tool-Thinking")
            return <agent_thinking_tool_1.AgentThinkingTool key={idx} part={part} chatStatus={status}/>;
        // Plan files: unified handling
        // - In collapsed steps: all show mini indicator, last collapsed op's card shown separately after finalParts
        // - In final parts: all but last show mini indicator, last shows full card
        if (part.type === "tool-Write" || part.type === "tool-Edit") {
            var filePath = ((_b = part.input) === null || _b === void 0 ? void 0 : _b.file_path) || "";
            if ((0, agent_tool_utils_1.isPlanFile)(filePath)) {
                // Use part.toolCallId to find operation since idx may be adjusted for collapsed parts
                var opIndex = planOpsSummary.operations.findIndex(function (op) { return op.part.toolCallId === part.toolCallId; });
                if (opIndex === -1)
                    return null;
                var originalIndex = (_d = (_c = planOpsSummary.operations[opIndex]) === null || _c === void 0 ? void 0 : _c.index) !== null && _d !== void 0 ? _d : -1;
                var isInCollapsedSteps = shouldCollapse && collapseBeforeIndex !== -1 && originalIndex < collapseBeforeIndex;
                var isLastCollapsedOp = (lastCollapsedPlanOp === null || lastCollapsedPlanOp === void 0 ? void 0 : lastCollapsedPlanOp.part.toolCallId) === part.toolCallId;
                var isLastOperation = opIndex === planOpsSummary.operations.length - 1;
                // If this is the last collapsed plan op, hide it here (card shown after CollapsibleSteps)
                if (isInCollapsedSteps && isLastCollapsedOp) {
                    return null;
                }
                // Show mini indicator for:
                // - All operations in collapsed steps (except last collapsed, handled above)
                // - All operations except last in final parts
                var showMiniIndicator = isInCollapsedSteps || !isLastOperation;
                if (showMiniIndicator) {
                    var isWrite = part.type === "tool-Write";
                    var isPending = (0, agent_tool_registry_1.getToolStatus)(part, status).isPending;
                    var isOpStreaming = isPending || part.state === "input-streaming" && isStreaming && isLastMessage;
                    return <div key={idx} class="flex items-center gap-1.5 px-2 py-0.5">
              <span class="text-xs text-muted-foreground">
                {isOpStreaming ? <text_shimmer_1.TextShimmer as="span" duration={1.2}>
                    {isWrite ? "Creating plan..." : "Updating plan..."}
                  </text_shimmer_1.TextShimmer> : isWrite ? "Created plan" : "Updated plan"}
              </span>
            </div>;
                }
                // Last operation in final parts: show full card
                return <agent_plan_file_tool_1.AgentPlanFileTool key={idx} part={part} chatStatus={status} subChatId={subChatId} isEdit={part.type === "tool-Edit"}/>;
            }
        }
        if (part.type === "tool-Edit")
            return <agent_edit_tool_1.AgentEditTool key={idx} part={part} messageId={message.id} partIndex={idx} chatStatus={status}/>;
        if (part.type === "tool-Write")
            return <agent_edit_tool_1.AgentEditTool key={idx} part={part} messageId={message.id} partIndex={idx} chatStatus={status}/>;
        if (part.type === "tool-WebSearch")
            return <agent_web_search_collapsible_1.AgentWebSearchCollapsible key={idx} part={part} chatStatus={status}/>;
        if (part.type === "tool-WebFetch")
            return <agent_web_fetch_tool_1.AgentWebFetchTool key={idx} part={part} chatStatus={status}/>;
        if (part.type === "tool-PlanWrite")
            return <agent_plan_tool_1.AgentPlanTool key={idx} part={part} chatStatus={status}/>;
        // ExitPlanMode tool is hidden - plan is shown in sidebar instead
        if (part.type === "tool-ExitPlanMode") {
            return null;
        }
        if (part.type === "tool-TodoWrite") {
            return <agent_todo_tool_1.AgentTodoTool key={idx} part={part} chatStatus={status} subChatId={subChatId}/>;
        }
        if (part.type === "tool-AskUserQuestion") {
            var _g = (0, agent_tool_registry_1.getToolStatus)(part, status), isPending = _g.isPending, isError = _g.isError;
            return <agent_ask_user_question_tool_1.AgentAskUserQuestionTool key={idx} input={part.input} result={part.result} errorText={part.errorText || part.error} state={isPending ? "call" : "result"} isError={isError} isStreaming={isStreaming && isLastMessage} toolCallId={part.toolCallId}/>;
        }
        if (part.type in agent_tool_registry_1.AgentToolRegistry) {
            var meta = agent_tool_registry_1.AgentToolRegistry[part.type];
            var _h = (0, agent_tool_registry_1.getToolStatus)(part, status), isPending = _h.isPending, isError = _h.isError;
            return <agent_tool_call_1.AgentToolCall key={idx} icon={meta.icon} title={meta.title(part)} subtitle={(_e = meta.subtitle) === null || _e === void 0 ? void 0 : _e.call(meta, part)} isPending={isPending} isError={isError}/>;
        }
        if ((_f = part.type) === null || _f === void 0 ? void 0 : _f.startsWith("tool-")) {
            return <div key={idx} class="text-xs text-muted-foreground py-0.5 px-2">
          {part.type.replace("tool-", "")}
        </div>;
        }
        return null;
    };
    if (!message)
        return null;
    return <div data-assistant-message-id={message.id} class="group/message w-full mb-4">
      <div class="flex flex-col gap-1.5">
        {shouldCollapse && visibleStepsCount > 0 && <CollapsibleSteps stepsCount={visibleStepsCount}>
            {(function () {
                var grouped = groupExploringTools(stepParts, nestedToolIds);
                return grouped.map(function (part, idx) {
                    if (part.type === "exploring-group") {
                        var isLast = idx === grouped.length - 1;
                        var isGroupStreaming = isStreaming && isLastMessage && isLast;
                        return <agent_exploring_group_1.AgentExploringGroup key={idx} parts={part.parts} chatStatus={status} isStreaming={isGroupStreaming}/>;
                    }
                    return renderPart(part, idx, false);
                });
            })()}
          </CollapsibleSteps>}

        {(function () {
            var grouped = groupExploringTools(finalParts, nestedToolIds);
            return grouped.map(function (part, idx) {
                if (part.type === "exploring-group") {
                    var isLast = idx === grouped.length - 1;
                    var isGroupStreaming = isStreaming && isLastMessage && isLast;
                    return <agent_exploring_group_1.AgentExploringGroup key={idx} parts={part.parts} chatStatus={status} isStreaming={isGroupStreaming}/>;
                }
                return renderPart(part, shouldCollapse ? collapseBeforeIndex + idx : idx, shouldCollapse);
            });
        })()}

        {/* Show plan card after finalParts if any plan operation was in collapsed steps */}
        {shouldCollapse && lastCollapsedPlanOp && <agent_plan_file_tool_1.AgentPlanFileTool part={lastCollapsedPlanOp.part} chatStatus={status} subChatId={subChatId} isEdit={lastCollapsedPlanOp.type === "edit"}/>}

        {shouldShowPlanning && <agent_tool_call_1.AgentToolCall icon={agent_tool_registry_1.AgentToolRegistry["tool-planning"].icon} title={agent_tool_registry_1.AgentToolRegistry["tool-planning"].title({})} isPending={true} isError={false}/>}

      </div>

      {hasTextContent && (!isStreaming || !isLastMessage) && <div class="flex justify-between items-center h-6 px-2 mt-1">
          <div class="flex items-center gap-0.5">
            <message_action_buttons_1.CopyButton text={(0, message_action_buttons_1.getMessageTextContent)(message)} isMobile={isMobile}/>
            <message_action_buttons_1.PlayButton text={(0, message_action_buttons_1.getMessageTextContent)(message)} isMobile={isMobile}/>
            {onRollback && ((_b = message.metadata) === null || _b === void 0 ? void 0 : _b.sdkMessageUuid) && <button onClick={function () { return onRollback(message); }} disabled={isStreaming || isRollingBack} tabIndex={-1} class={(0, utils_1.cn)("p-1.5 rounded-md transition-[background-color,transform] duration-150 ease-out hover:bg-accent active:scale-[0.97]", (isStreaming || isRollingBack) && "opacity-50 cursor-not-allowed")}>
                <icons_1.IconTextUndo class="w-3.5 h-3.5 text-muted-foreground"/>
              </button>}
          </div>
          <agent_message_usage_1.AgentMessageUsage metadata={msgMetadata} isStreaming={isStreaming} isMobile={isMobile}/>
        </div>}
    </div>;
}, areMessagePropsEqual);
