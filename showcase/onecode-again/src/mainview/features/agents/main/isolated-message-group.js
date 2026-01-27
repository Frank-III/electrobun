"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsolatedMessageGroup = void 0;
var solid_js_1 = require("solid-js");
var jotai_1 = require("../../../lib/state/jotai");
var message_store_1 = require("../stores/message-store");
var messages_list_1 = require("./messages-list");
var render_file_mentions_1 = require("../mentions/render-file-mentions");
function areGroupPropsEqual(prev, next) {
    return prev.userMsgId === next.userMsgId && prev.subChatId === next.subChatId && prev.chatId === next.chatId && prev.isMobile === next.isMobile && prev.sandboxSetupStatus === next.sandboxSetupStatus && prev.stickyTopClass === next.stickyTopClass && prev.sandboxSetupError === next.sandboxSetupError && prev.onRetrySetup === next.onRetrySetup && prev.UserBubbleComponent === next.UserBubbleComponent && prev.ToolCallComponent === next.ToolCallComponent && prev.MessageGroupWrapper === next.MessageGroupWrapper && prev.toolRegistry === next.toolRegistry;
}
exports.IsolatedMessageGroup = memo(function IsolatedMessageGroup(_a) {
    var _b, _c, _d, _e, _f, _g;
    var userMsgId = _a.userMsgId, subChatId = _a.subChatId, chatId = _a.chatId, isMobile = _a.isMobile, sandboxSetupStatus = _a.sandboxSetupStatus, stickyTopClass = _a.stickyTopClass, sandboxSetupError = _a.sandboxSetupError, onRetrySetup = _a.onRetrySetup, UserBubbleComponent = _a.UserBubbleComponent, ToolCallComponent = _a.ToolCallComponent, MessageGroupWrapper = _a.MessageGroupWrapper, toolRegistry = _a.toolRegistry;
    // Subscribe to specific atoms - NOT the whole messages array
    var userMsg = (0, jotai_1.useAtomValue)((0, message_store_1.messageAtomFamily)(userMsgId));
    var assistantIds = (0, jotai_1.useAtomValue)((0, message_store_1.assistantIdsForUserMsgAtomFamily)(userMsgId));
    var isLastGroup = (0, jotai_1.useAtomValue)((0, message_store_1.isLastUserMessageAtomFamily)(userMsgId));
    var isStreaming = (0, jotai_1.useAtomValue)(message_store_1.isStreamingAtom);
    // Extract user message content
    // Note: file-content parts are hidden from UI but sent to agent
    var rawTextContent = ((_b = userMsg === null || userMsg === void 0 ? void 0 : userMsg.parts) === null || _b === void 0 ? void 0 : _b.filter(function (p) { return p.type === "text"; }).map(function (p) { return p.text; }).join("\n")) || "";
    var imageParts = ((_c = userMsg === null || userMsg === void 0 ? void 0 : userMsg.parts) === null || _c === void 0 ? void 0 : _c.filter(function (p) { return p.type === "data-image"; })) || [];
    // Extract text mentions (quote/diff) to render separately above sticky block
    // NOTE: useMemo must be called before any early returns to follow Rules of Hooks
    var _h = (0, solid_js_1.createMemo)(function () { return (0, render_file_mentions_1.extractTextMentions)(rawTextContent); }), textMentions = _h.textMentions, textContent = _h.cleanedText;
    if (!userMsg)
        return null;
    // Show cloning when sandbox is being set up
    var shouldShowCloning = sandboxSetupStatus === "cloning" && isLastGroup && assistantIds.length === 0;
    // Show setup error if sandbox setup failed
    var shouldShowSetupError = sandboxSetupStatus === "error" && isLastGroup && assistantIds.length === 0;
    // Check if this is an image-only message (no text content and no text mentions)
    var isImageOnlyMessage = imageParts.length > 0 && !textContent.trim() && textMentions.length === 0;
    // Check if this is an attachment-only message (no text but has images or text mentions)
    var isAttachmentOnlyMessage = !textContent.trim() && (imageParts.length > 0 || textMentions.length > 0);
    return <MessageGroupWrapper isLastGroup={isLastGroup}>
      {/* Attachments - NOT sticky (only when there's also text) */}
      {imageParts.length > 0 && !isImageOnlyMessage && <div class="mb-2 pointer-events-auto">
          <UserBubbleComponent messageId={userMsgId} textContent="" imageParts={imageParts} skipTextMentionBlocks/>
        </div>}

      {/* Text mentions (quote/diff/pasted) - NOT sticky */}
      {textMentions.length > 0 && <div class="mb-2 pointer-events-auto">
          <render_file_mentions_1.TextMentionBlocks mentions={textMentions}/>
        </div>}

      {/* User message text - sticky (or attachment-only summary bubble) */}
      <div data-user-message-id={userMsgId} class={"[&>div]:!mb-4 pointer-events-auto sticky z-10 ".concat(stickyTopClass)}>
        {/* Show "Using X" summary when no text but have attachments */}
        {isAttachmentOnlyMessage && !isImageOnlyMessage ? <div class="flex justify-start drop-shadow-[0_10px_20px_hsl(var(--background))]" data-user-bubble>
            <div class="space-y-2 w-full">
              <div class="bg-input-background border px-3 py-2 rounded-xl text-sm text-muted-foreground italic">
              {(function () {
                var parts = [];
                if (imageParts.length > 0) {
                    parts.push(imageParts.length === 1 ? "image" : "".concat(imageParts.length, " images"));
                }
                var quoteCount = textMentions.filter(function (m) { return m.type === "quote" || m.type === "pasted"; }).length;
                var codeCount = textMentions.filter(function (m) { return m.type === "diff"; }).length;
                if (quoteCount > 0) {
                    parts.push(quoteCount === 1 ? "selected text" : "".concat(quoteCount, " text selections"));
                }
                if (codeCount > 0) {
                    parts.push(codeCount === 1 ? "code selection" : "".concat(codeCount, " code selections"));
                }
                return "Using ".concat(parts.join(", "));
            })()}
              </div>
            </div>
          </div> : <UserBubbleComponent messageId={userMsgId} textContent={textContent} imageParts={isImageOnlyMessage ? imageParts : []} skipTextMentionBlocks={!isImageOnlyMessage}/>}

        {/* Cloning indicator */}
        {shouldShowCloning && <div class="mt-4">
            <ToolCallComponent icon={(_d = toolRegistry["tool-cloning"]) === null || _d === void 0 ? void 0 : _d.icon} title={((_e = toolRegistry["tool-cloning"]) === null || _e === void 0 ? void 0 : _e.title({})) || "Cloning..."} isPending={true} isError={false}/>
          </div>}

        {/* Setup error with retry */}
        {shouldShowSetupError && <div class="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div class="flex items-center gap-2 text-destructive text-sm">
              <span>
                Failed to set up sandbox
                {sandboxSetupError ? ": ".concat(sandboxSetupError) : ""}
              </span>
              {onRetrySetup && <button class="px-2 py-1 text-sm hover:bg-destructive/20 rounded" onClick={onRetrySetup}>
                  Retry
                </button>}
            </div>
          </div>}
      </div>

      {/* Assistant messages - memoized, only re-renders when IDs change */}
      {assistantIds.length > 0 && <messages_list_1.MemoizedAssistantMessages assistantMsgIds={assistantIds} subChatId={subChatId} chatId={chatId} isMobile={isMobile} sandboxSetupStatus={sandboxSetupStatus}/>}

      {/* Planning indicator */}
      {isStreaming && isLastGroup && assistantIds.length === 0 && sandboxSetupStatus === "ready" && <div class="mt-4">
            <ToolCallComponent icon={(_f = toolRegistry["tool-planning"]) === null || _f === void 0 ? void 0 : _f.icon} title={((_g = toolRegistry["tool-planning"]) === null || _g === void 0 ? void 0 : _g.title({})) || "Planning..."} isPending={true} isError={false}/>
          </div>}
    </MessageGroupWrapper>;
}, areGroupPropsEqual);
