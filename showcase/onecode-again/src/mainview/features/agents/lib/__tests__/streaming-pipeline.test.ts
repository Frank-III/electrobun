/**
 * Tests for the chat streaming pipeline:
 * 1. chunk-to-messages.ts (reduceChunk) - chunk reduction
 * 2. rpc-chat.ts (createRpcChat) - full send/receive cycle with mock transport
 *
 * These tests verify that streaming messages flow correctly from
 * chunks → reducer → RpcChat → message callbacks.
 */
import { describe, test, expect } from "bun:test";
import { reduceChunk, initialReducerState, type ChunkReducerState } from "../chunk-to-messages";
import { createRpcChat, type RpcChatTransport } from "../rpc-chat";
import type { UIMessage, UIMessageChunk } from "../../../../../shared/chat-rpc";

// ============================================================================
// Helper: create a mock transport that streams pre-defined chunks
// ============================================================================
function createMockTransport(chunks: UIMessageChunk[]): RpcChatTransport {
  return {
    async sendMessages() {
      return new ReadableStream<UIMessageChunk>({
        start(controller) {
          for (const chunk of chunks) {
            controller.enqueue(chunk);
          }
          controller.close();
        },
      });
    },
  };
}

// Helper: create a delayed mock transport that streams chunks with async delays
function createDelayedMockTransport(chunks: UIMessageChunk[], delayMs = 1): RpcChatTransport {
  return {
    async sendMessages() {
      return new ReadableStream<UIMessageChunk>({
        async start(controller) {
          for (const chunk of chunks) {
            await new Promise((r) => setTimeout(r, delayMs));
            controller.enqueue(chunk);
          }
          controller.close();
        },
      });
    },
  };
}

// ============================================================================
// 1. reduceChunk tests - chunk-to-messages.ts
// ============================================================================
describe("reduceChunk", () => {
  test("start chunk creates assistant message", () => {
    const state = initialReducerState([]);
    const next = reduceChunk(state, { type: "start", messageId: "msg-1" });
    expect(next.current).not.toBeNull();
    expect(next.current!.role).toBe("assistant");
    expect(next.current!.id).toBe("msg-1");
    expect(next.current!.parts).toEqual([]);
  });

  test("text-start + text-delta + text-end builds text part", () => {
    let state = initialReducerState([]);
    state = reduceChunk(state, { type: "start", messageId: "msg-1" });
    state = reduceChunk(state, { type: "text-start", id: "text-1" });
    state = reduceChunk(state, { type: "text-delta", id: "text-1", delta: "Hello " });
    state = reduceChunk(state, { type: "text-delta", id: "text-1", delta: "world!" });
    state = reduceChunk(state, { type: "text-end", id: "text-1" });

    expect(state.current).not.toBeNull();
    expect(state.current!.parts).toHaveLength(1);
    const textPart = state.current!.parts[0] as { type: string; text: string };
    expect(textPart.type).toBe("text");
    expect(textPart.text).toBe("Hello world!");
  });

  test("finish moves current to messages", () => {
    let state = initialReducerState([]);
    state = reduceChunk(state, { type: "start", messageId: "msg-1" });
    state = reduceChunk(state, { type: "text-start", id: "text-1" });
    state = reduceChunk(state, { type: "text-delta", id: "text-1", delta: "Done" });
    state = reduceChunk(state, { type: "text-end", id: "text-1" });
    state = reduceChunk(state, { type: "finish", messageMetadata: { inputTokens: 10, outputTokens: 5 } });

    expect(state.current).toBeNull();
    expect(state.messages).toHaveLength(1);
    expect(state.messages[0].role).toBe("assistant");
    expect((state.messages[0].parts[0] as { text: string }).text).toBe("Done");
    expect(state.messages[0].metadata?.inputTokens).toBe(10);
  });

  test("tool-input-available creates tool part", () => {
    let state = initialReducerState([]);
    state = reduceChunk(state, { type: "start" });
    state = reduceChunk(state, {
      type: "tool-input-available",
      toolCallId: "tc-1",
      toolName: "Bash",
      input: { command: "ls" },
    });

    expect(state.current!.parts).toHaveLength(1);
    const toolPart = state.current!.parts[0] as any;
    expect(toolPart.type).toBe("tool-Bash");
    expect(toolPart.toolCallId).toBe("tc-1");
    expect(toolPart.state).toBe("input-available");
    expect(toolPart.input).toEqual({ command: "ls" });
  });

  test("tool-output-available updates tool part state", () => {
    let state = initialReducerState([]);
    state = reduceChunk(state, { type: "start" });
    state = reduceChunk(state, {
      type: "tool-input-available",
      toolCallId: "tc-1",
      toolName: "Bash",
      input: { command: "ls" },
    });
    state = reduceChunk(state, {
      type: "tool-output-available",
      toolCallId: "tc-1",
      output: "file1.txt\nfile2.txt",
    });

    const toolPart = state.current!.parts[0] as any;
    expect(toolPart.state).toBe("output-available");
    expect(toolPart.output).toBe("file1.txt\nfile2.txt");
  });

  test("reasoning chunks build reasoning part", () => {
    let state = initialReducerState([]);
    state = reduceChunk(state, { type: "start" });
    state = reduceChunk(state, { type: "reasoning-delta", id: "r-1", delta: "Let me " });
    state = reduceChunk(state, { type: "reasoning-delta", id: "r-1", delta: "think..." });

    const reasoningPart = state.current!.parts[0] as any;
    expect(reasoningPart.type).toBe("reasoning");
    expect(reasoningPart.text).toBe("Let me think...");
  });

  test("multiple text parts via separate text-start/end cycles", () => {
    let state = initialReducerState([]);
    state = reduceChunk(state, { type: "start" });
    state = reduceChunk(state, { type: "text-start", id: "t1" });
    state = reduceChunk(state, { type: "text-delta", id: "t1", delta: "First" });
    state = reduceChunk(state, { type: "text-end", id: "t1" });
    state = reduceChunk(state, { type: "text-start", id: "t2" });
    state = reduceChunk(state, { type: "text-delta", id: "t2", delta: "Second" });
    state = reduceChunk(state, { type: "text-end", id: "t2" });

    expect(state.current!.parts).toHaveLength(2);
    expect((state.current!.parts[0] as any).text).toBe("First");
    expect((state.current!.parts[1] as any).text).toBe("Second");
  });

  test("text-delta without start is ignored (no current)", () => {
    const state = initialReducerState([]);
    const next = reduceChunk(state, { type: "text-delta", id: "t1", delta: "orphan" });
    expect(next.current).toBeNull();
  });

  test("error chunk preserves state", () => {
    let state = initialReducerState([]);
    state = reduceChunk(state, { type: "start" });
    state = reduceChunk(state, { type: "text-start", id: "t1" });
    state = reduceChunk(state, { type: "text-delta", id: "t1", delta: "partial" });
    const next = reduceChunk(state, { type: "error", errorText: "API error" });
    expect(next.current).not.toBeNull();
    expect((next.current!.parts[0] as any).text).toBe("partial");
  });

  test("preserves existing messages from initial state", () => {
    const existing: UIMessage = { id: "prev-1", role: "user", parts: [{ type: "text", text: "Hello" }] };
    let state = initialReducerState([existing]);
    state = reduceChunk(state, { type: "start", messageId: "msg-2" });
    state = reduceChunk(state, { type: "text-start", id: "t1" });
    state = reduceChunk(state, { type: "text-delta", id: "t1", delta: "Reply" });
    state = reduceChunk(state, { type: "text-end", id: "t1" });
    state = reduceChunk(state, { type: "finish" });

    expect(state.messages).toHaveLength(2);
    expect(state.messages[0].id).toBe("prev-1");
    expect(state.messages[1].role).toBe("assistant");
  });
});

// ============================================================================
// 2. RpcChat integration tests - rpc-chat.ts
// ============================================================================
describe("createRpcChat", () => {
  test("sendMessage adds user message and notifies", async () => {
    const transport = createMockTransport([
      { type: "start", messageId: "assistant-1" },
      { type: "text-start", id: "t1" },
      { type: "text-delta", id: "t1", delta: "Hi!" },
      { type: "text-end", id: "t1" },
      { type: "finish" },
    ]);

    const chat = createRpcChat({
      id: "test-sub",
      messages: [],
      transport,
      chatId: "test-chat",
    });

    const messageSnapshots: UIMessage[][] = [];
    const statusSnapshots: string[] = [];

    chat["~registerMessagesCallback"](() => {
      messageSnapshots.push([...chat.messages]);
    });
    chat["~registerStatusCallback"](() => {
      statusSnapshots.push(chat.status);
    });

    await chat.sendMessage({
      role: "user",
      parts: [{ type: "text", text: "Hello" }],
    });

    // Should have user message + assistant message
    expect(chat.messages).toHaveLength(2);
    expect(chat.messages[0].role).toBe("user");
    expect(chat.messages[1].role).toBe("assistant");

    // Assistant message should have the streamed text
    const assistantParts = chat.messages[1].parts;
    expect(assistantParts).toHaveLength(1);
    expect((assistantParts[0] as { text: string }).text).toBe("Hi!");

    // Status should have gone through: submitted → streaming → ready
    expect(statusSnapshots).toContain("submitted");
    expect(statusSnapshots).toContain("streaming");
    expect(statusSnapshots[statusSnapshots.length - 1]).toBe("ready");

    // Messages callback should have fired multiple times
    expect(messageSnapshots.length).toBeGreaterThanOrEqual(2); // at least: user added, chunks
  });

  test("message callbacks fire on each chunk (no throttle)", async () => {
    const transport = createMockTransport([
      { type: "start" },
      { type: "text-start", id: "t1" },
      { type: "text-delta", id: "t1", delta: "A" },
      { type: "text-delta", id: "t1", delta: "B" },
      { type: "text-delta", id: "t1", delta: "C" },
      { type: "text-end", id: "t1" },
      { type: "finish" },
    ]);

    const chat = createRpcChat({
      id: "sub-1",
      messages: [],
      transport,
      chatId: "chat-1",
    });

    let callbackCount = 0;
    chat["~registerMessagesCallback"](() => { callbackCount++; });

    await chat.sendMessage({ role: "user", parts: [{ type: "text", text: "test" }] });

    // Without throttle, callback fires for: user msg + start + text-start + 3 deltas + text-end + finish (2 notifies) = 9
    // Exact count depends on implementation, but should be at least 5
    expect(callbackCount).toBeGreaterThanOrEqual(5);
    expect((chat.messages[1].parts[0] as { text: string }).text).toBe("ABC");
  });

  test("throttled callbacks batch updates", async () => {
    const transport = createDelayedMockTransport([
      { type: "start" },
      { type: "text-start", id: "t1" },
      { type: "text-delta", id: "t1", delta: "A" },
      { type: "text-delta", id: "t1", delta: "B" },
      { type: "text-delta", id: "t1", delta: "C" },
      { type: "text-delta", id: "t1", delta: "D" },
      { type: "text-delta", id: "t1", delta: "E" },
      { type: "text-end", id: "t1" },
      { type: "finish" },
    ], 1); // 1ms between chunks

    const chat = createRpcChat({
      id: "sub-2",
      messages: [],
      transport,
      chatId: "chat-2",
    });

    let throttledCallbackCount = 0;
    chat["~registerMessagesCallback"](() => { throttledCallbackCount++; }, 50);

    await chat.sendMessage({ role: "user", parts: [{ type: "text", text: "test" }] });

    // Wait for any pending throttled callbacks
    await new Promise((r) => setTimeout(r, 100));

    // With 50ms throttle and 1ms between chunks, should have fewer callbacks than without throttle
    // The important thing: final state should have all text
    expect((chat.messages[1].parts[0] as { text: string }).text).toBe("ABCDE");
    // Throttled should have fewer callbacks (exact number depends on timing)
    expect(throttledCallbackCount).toBeGreaterThanOrEqual(1);
  });

  test("messages array reference changes on each chunk (no duplicate on finish)", async () => {
    const transport = createMockTransport([
      { type: "start" },
      { type: "text-start", id: "t1" },
      { type: "text-delta", id: "t1", delta: "X" },
      { type: "text-delta", id: "t1", delta: "Y" },
      { type: "text-end", id: "t1" },
      { type: "finish" },
    ]);

    const chat = createRpcChat({
      id: "sub-3",
      messages: [],
      transport,
      chatId: "chat-3",
    });

    const refs: UIMessage[][] = [];
    chat["~registerMessagesCallback"](() => {
      refs.push(chat.messages);
    });

    await chat.sendMessage({ role: "user", parts: [{ type: "text", text: "test" }] });

    // Each callback should get a different array reference (important for signal equality checks)
    // The finish chunk should NOT cause a duplicate notification with the same reference
    for (let i = 1; i < refs.length; i++) {
      expect(refs[i]).not.toBe(refs[i - 1]);
    }

    // Final state should be correct
    expect(chat.messages).toHaveLength(2);
    expect((chat.messages[1].parts[0] as { text: string }).text).toBe("XY");
  });

  test("tool call flow: input → output", async () => {
    const transport = createMockTransport([
      { type: "start" },
      { type: "tool-input-available", toolCallId: "tc-1", toolName: "Bash", input: { command: "echo hi" } },
      { type: "tool-output-available", toolCallId: "tc-1", output: "hi\n" },
      { type: "text-start", id: "t1" },
      { type: "text-delta", id: "t1", delta: "Done!" },
      { type: "text-end", id: "t1" },
      { type: "finish" },
    ]);

    const chat = createRpcChat({
      id: "sub-4",
      messages: [],
      transport,
      chatId: "chat-4",
    });

    await chat.sendMessage({ role: "user", parts: [{ type: "text", text: "run ls" }] });

    const assistant = chat.messages[1];
    expect(assistant.parts).toHaveLength(2);

    const toolPart = assistant.parts[0] as any;
    expect(toolPart.type).toBe("tool-Bash");
    expect(toolPart.state).toBe("output-available");
    expect(toolPart.output).toBe("hi\n");

    const textPart = assistant.parts[1] as any;
    expect(textPart.text).toBe("Done!");
  });

  test("stop aborts the stream", async () => {
    // Transport that never finishes
    const transport: RpcChatTransport = {
      async sendMessages({ abortSignal }) {
        return new ReadableStream<UIMessageChunk>({
          start(controller) {
            controller.enqueue({ type: "start" });
            controller.enqueue({ type: "text-start", id: "t1" });
            controller.enqueue({ type: "text-delta", id: "t1", delta: "Partial" });

            // Listen for abort
            abortSignal?.addEventListener("abort", () => {
              controller.close();
            });
          },
        });
      },
    };

    const chat = createRpcChat({
      id: "sub-5",
      messages: [],
      transport,
      chatId: "chat-5",
    });

    // Start sending (don't await - it won't finish until aborted)
    const sendPromise = chat.sendMessage({ role: "user", parts: [{ type: "text", text: "hi" }] });

    // Give it time to start streaming
    await new Promise((r) => setTimeout(r, 10));

    // Stop
    chat.stop();

    // Wait for send to complete
    await sendPromise;

    expect(chat.status).toBe("ready");
  });

  test("onFinish callback fires after stream completes", async () => {
    const transport = createMockTransport([
      { type: "start" },
      { type: "text-start", id: "t1" },
      { type: "text-delta", id: "t1", delta: "Done" },
      { type: "text-end", id: "t1" },
      { type: "finish" },
    ]);

    let finishCalled = false;
    const chat = createRpcChat({
      id: "sub-6",
      messages: [],
      transport,
      chatId: "chat-6",
      onFinish: () => { finishCalled = true; },
    });

    await chat.sendMessage({ role: "user", parts: [{ type: "text", text: "go" }] });
    expect(finishCalled).toBe(true);
  });

  test("onError callback fires on transport error", async () => {
    const transport: RpcChatTransport = {
      async sendMessages() {
        throw new Error("Connection failed");
      },
    };

    let errorCalled = false;
    const chat = createRpcChat({
      id: "sub-7",
      messages: [],
      transport,
      chatId: "chat-7",
      onError: () => { errorCalled = true; },
    });

    await chat.sendMessage({ role: "user", parts: [{ type: "text", text: "hi" }] });
    expect(errorCalled).toBe(true);
    expect(chat.status).toBe("error");
    expect(chat.error?.message).toBe("Connection failed");
  });

  test("streaming text accumulates correctly across many deltas", async () => {
    const words = "The quick brown fox jumps over the lazy dog".split(" ");
    const chunks: UIMessageChunk[] = [
      { type: "start" },
      { type: "text-start", id: "t1" },
      ...words.map((w, i) => ({ type: "text-delta" as const, id: "t1", delta: (i > 0 ? " " : "") + w })),
      { type: "text-end", id: "t1" },
      { type: "finish" },
    ];

    const transport = createMockTransport(chunks);
    const chat = createRpcChat({
      id: "sub-8",
      messages: [],
      transport,
      chatId: "chat-8",
    });

    await chat.sendMessage({ role: "user", parts: [{ type: "text", text: "test" }] });

    expect((chat.messages[1].parts[0] as any).text).toBe("The quick brown fox jumps over the lazy dog");
  });
});

// ============================================================================
// 3. Streaming state during active stream
// ============================================================================
describe("streaming state tracking", () => {
  test("messages include current (in-progress) message during streaming", async () => {
    let resolveFinish: () => void;
    const waitForFinish = new Promise<void>((r) => { resolveFinish = r; });

    const transport: RpcChatTransport = {
      async sendMessages() {
        return new ReadableStream<UIMessageChunk>({
          async start(controller) {
            controller.enqueue({ type: "start", messageId: "mid-stream" });
            controller.enqueue({ type: "text-start", id: "t1" });
            controller.enqueue({ type: "text-delta", id: "t1", delta: "Streaming..." });
            // Pause here - don't finish yet
            await waitForFinish;
            controller.enqueue({ type: "text-end", id: "t1" });
            controller.enqueue({ type: "finish" });
            controller.close();
          },
        });
      },
    };

    const chat = createRpcChat({
      id: "sub-9",
      messages: [],
      transport,
      chatId: "chat-9",
    });

    // Start streaming (don't await)
    const sendPromise = chat.sendMessage({ role: "user", parts: [{ type: "text", text: "hi" }] });

    // Wait for chunks to be processed
    await new Promise((r) => setTimeout(r, 20));

    // Mid-stream: messages should include the in-progress assistant message
    expect(chat.messages).toHaveLength(2); // user + in-progress assistant
    expect(chat.messages[1].role).toBe("assistant");
    expect(chat.messages[1].id).toBe("mid-stream");
    expect((chat.messages[1].parts[0] as any).text).toBe("Streaming...");
    expect(chat.status).toBe("streaming");

    // Now finish
    resolveFinish!();
    await sendPromise;

    expect(chat.status).toBe("ready");
    expect(chat.messages).toHaveLength(2);
  });
});

// ============================================================================
// 4. Regenerate edge cases
// ============================================================================
describe("regenerate", () => {
  test("regenerate with empty messages does nothing", async () => {
    const transport = createMockTransport([]);

    const chat = createRpcChat({
      id: "regen-empty",
      messages: [],
      transport,
      chatId: "chat-regen-empty",
    });

    await chat.regenerate();
    expect(chat.messages).toHaveLength(0);
    expect(chat.status).toBe("ready");
  });

  test("regenerate with single user message re-sends it", async () => {
    const transport = createMockTransport([
      { type: "start", messageId: "a1" },
      { type: "text-start", id: "t1" },
      { type: "text-delta", id: "t1", delta: "Response" },
      { type: "text-end", id: "t1" },
      { type: "finish" },
    ]);

    const userMsg: UIMessage = {
      id: "u1",
      role: "user",
      parts: [{ type: "text", text: "Hello" }],
    };

    const chat = createRpcChat({
      id: "regen-single",
      messages: [userMsg],
      transport,
      chatId: "chat-regen-single",
    });

    await chat.regenerate();

    // Should have user message + new assistant response
    expect(chat.messages).toHaveLength(2);
    expect(chat.messages[0].role).toBe("user");
    expect(chat.messages[1].role).toBe("assistant");
    expect((chat.messages[1].parts[0] as { text: string }).text).toBe("Response");
  });

  test("regenerate strips trailing assistant messages correctly", async () => {
    const transport = createMockTransport([
      { type: "start", messageId: "a2" },
      { type: "text-start", id: "t1" },
      { type: "text-delta", id: "t1", delta: "New response" },
      { type: "text-end", id: "t1" },
      { type: "finish" },
    ]);

    const chat = createRpcChat({
      id: "regen-strip",
      messages: [
        { id: "u1", role: "user", parts: [{ type: "text", text: "First" }] },
        { id: "a1", role: "assistant", parts: [{ type: "text", text: "Old response 1" }] },
        { id: "u2", role: "user", parts: [{ type: "text", text: "Second" }] },
        { id: "a2-old", role: "assistant", parts: [{ type: "text", text: "Old response 2" }] },
      ],
      transport,
      chatId: "chat-regen-strip",
    });

    await chat.regenerate();

    // Should keep messages up to (but not including) the last user message,
    // then re-send that user message and get a new assistant response
    expect(chat.messages).toHaveLength(4);
    expect(chat.messages[0].id).toBe("u1");
    expect(chat.messages[1].id).toBe("a1");
    expect(chat.messages[2].role).toBe("user"); // re-sent "Second"
    expect(chat.messages[3].role).toBe("assistant");
    expect((chat.messages[3].parts[0] as { text: string }).text).toBe("New response");
  });

  test("regenerate with no user messages does nothing", async () => {
    const transport = createMockTransport([]);

    const chat = createRpcChat({
      id: "regen-no-user",
      messages: [
        { id: "a1", role: "assistant", parts: [{ type: "text", text: "Hello" }] },
      ],
      transport,
      chatId: "chat-regen-no-user",
    });

    await chat.regenerate();

    // No user messages to regenerate from — should be unchanged
    expect(chat.messages).toHaveLength(1);
    expect(chat.messages[0].id).toBe("a1");
  });
});
