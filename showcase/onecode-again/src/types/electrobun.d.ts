declare module "electrobun" {
  const Electrobun: unknown;
  export default Electrobun;
}

declare module "electrobun/*" {
  const moduleValue: unknown;
  export default moduleValue;
}

declare module "electrobun/view" {
  type RPCTransport = {
    send?: (data: unknown) => void;
    registerHandler?: (handler: (msg: unknown) => void) => void;
    unregisterHandler?: () => void;
  };

  export type RPCWithTransport = {
    setTransport: (transport: RPCTransport) => void;
  };

  type SideRequests<T> = T extends { requests: infer R } ? R : Record<string, never>;
  type SideMessages<T> = T extends { messages: infer M } ? M : Record<string, never>;
  type BunSide<T> = T extends { bun: infer B } ? B : { requests: Record<string, never>; messages: Record<string, never> };
  type WebviewSide<T> = T extends { webview: infer W } ? W : { requests: Record<string, never>; messages: Record<string, never> };

  type RequestFn<TRequest> = TRequest extends { response: infer R }
    ? TRequest extends { params?: infer P }
      ? undefined extends P
        ? (params?: P) => Promise<R>
        : (params: P) => Promise<R>
      : TRequest extends { params: infer P }
        ? (params: P) => Promise<R>
        : () => Promise<R>
    : never;

  type RequestHandlerFn<TRequest> = TRequest extends { response: infer R }
    ? TRequest extends { params?: infer P }
      ? undefined extends P
        ? (params?: P) => R | Promise<R>
        : (params: P) => R | Promise<R>
      : TRequest extends { params: infer P }
        ? (params: P) => R | Promise<R>
        : () => R | Promise<R>
    : never;

  type MessageSenderFn<TPayload> = void extends TPayload
    ? () => void
    : undefined extends TPayload
      ? (payload?: TPayload) => void
      : (payload: TPayload) => void;

  type RequestClient<TRequests> = {
    [K in keyof TRequests]: RequestFn<TRequests[K]>;
  };

  type RequestHandlers<TRequests> = Partial<{
    [K in keyof TRequests]: RequestHandlerFn<TRequests[K]>;
  }>;

  type MessageSenders<TMessages> = {
    [K in keyof TMessages]-?: MessageSenderFn<TMessages[K]>;
  };

  type MessageHandlers<TMessages> = Partial<{
    [K in keyof TMessages]: (payload: TMessages[K]) => void;
  }> & {
    "*"?: (messageName: keyof TMessages, payload: TMessages[keyof TMessages]) => void;
  };

  type AddMessageListener<TMessages> = {
    (message: "*", listener: (messageName: keyof TMessages, payload: TMessages[keyof TMessages]) => void): void;
    <K extends keyof TMessages>(message: K, listener: (payload: TMessages[K]) => void): void;
  };

  type RemoveMessageListener<TMessages> = {
    (message: "*", listener: (messageName: keyof TMessages, payload: TMessages[keyof TMessages]) => void): void;
    <K extends keyof TMessages>(message: K, listener: (payload: TMessages[K]) => void): void;
  };

  type RPCDefinition<TRequests, TSendMessages, TReceiveMessages> = {
    setTransport: (transport: RPCTransport) => void;
    request: RequestClient<TRequests>;
    send: MessageSenders<TSendMessages>;
    addMessageListener: AddMessageListener<TReceiveMessages>;
    removeMessageListener: RemoveMessageListener<TReceiveMessages>;
  };

  export type WebviewRPCDefinition<TSchema> = RPCDefinition<
    SideRequests<BunSide<TSchema>>,
    SideMessages<BunSide<TSchema>>,
    SideMessages<WebviewSide<TSchema>>
  >;

  export class Electroview<T extends RPCWithTransport = RPCWithTransport> {
    rpc?: T;
    constructor(options: { rpc: T });
    static defineRPC<TSchema>(config: {
      maxRequestTime?: number;
      handlers: {
        requests?: RequestHandlers<SideRequests<WebviewSide<TSchema>>>;
        messages?: MessageHandlers<SideMessages<WebviewSide<TSchema>>>;
      };
    }): WebviewRPCDefinition<TSchema>;
  }

  const Electrobun: {
    Electroview: typeof Electroview;
  };

  export default Electrobun;
}

declare module "electrobun/bun" {
  export type RPCSchema<T> = T;
  export type RPCTransport = {
    send?: (data: unknown) => void;
    registerHandler?: (handler: (msg: unknown) => void) => void;
    unregisterHandler?: () => void;
  };
  export type RPCWithTransport = {
    setTransport: (transport: RPCTransport) => void;
  };

  type SideRequests<T> = T extends { requests: infer R } ? R : Record<string, never>;
  type SideMessages<T> = T extends { messages: infer M } ? M : Record<string, never>;
  type BunSide<T> = T extends { bun: infer B } ? B : { requests: Record<string, never>; messages: Record<string, never> };
  type WebviewSide<T> = T extends { webview: infer W } ? W : { requests: Record<string, never>; messages: Record<string, never> };

  type RequestFn<TRequest> = TRequest extends { response: infer R }
    ? TRequest extends { params?: infer P }
      ? undefined extends P
        ? (params?: P) => Promise<R>
        : (params: P) => Promise<R>
      : TRequest extends { params: infer P }
        ? (params: P) => Promise<R>
        : () => Promise<R>
    : never;

  type RequestHandlerFn<TRequest> = TRequest extends { response: infer R }
    ? TRequest extends { params?: infer P }
      ? undefined extends P
        ? (params?: P) => R | Promise<R>
        : (params: P) => R | Promise<R>
      : TRequest extends { params: infer P }
        ? (params: P) => R | Promise<R>
        : () => R | Promise<R>
    : never;

  type MessageSenderFn<TPayload> = void extends TPayload
    ? () => void
    : undefined extends TPayload
      ? (payload?: TPayload) => void
      : (payload: TPayload) => void;

  type RequestClient<TRequests> = {
    [K in keyof TRequests]: RequestFn<TRequests[K]>;
  };

  type RequestHandlers<TRequests> = Partial<{
    [K in keyof TRequests]: RequestHandlerFn<TRequests[K]>;
  }>;

  type MessageSenders<TMessages> = {
    [K in keyof TMessages]-?: MessageSenderFn<TMessages[K]>;
  };

  type MessageHandlers<TMessages> = Partial<{
    [K in keyof TMessages]: (payload: TMessages[K]) => void;
  }> & {
    "*"?: (messageName: keyof TMessages, payload: TMessages[keyof TMessages]) => void;
  };

  type AddMessageListener<TMessages> = {
    (message: "*", listener: (messageName: keyof TMessages, payload: TMessages[keyof TMessages]) => void): void;
    <K extends keyof TMessages>(message: K, listener: (payload: TMessages[K]) => void): void;
  };

  type RemoveMessageListener<TMessages> = {
    (message: "*", listener: (messageName: keyof TMessages, payload: TMessages[keyof TMessages]) => void): void;
    <K extends keyof TMessages>(message: K, listener: (payload: TMessages[K]) => void): void;
  };

  type RPCDefinition<TRequests, TSendMessages, TReceiveMessages> = {
    setTransport: (transport: RPCTransport) => void;
    request: RequestClient<TRequests>;
    send: MessageSenders<TSendMessages>;
    addMessageListener: AddMessageListener<TReceiveMessages>;
    removeMessageListener: RemoveMessageListener<TReceiveMessages>;
  };

  export type BunRPCDefinition<TSchema> = RPCDefinition<
    SideRequests<WebviewSide<TSchema>>,
    SideMessages<WebviewSide<TSchema>>,
    SideMessages<BunSide<TSchema>>
  >;

  export class BrowserView<T extends RPCWithTransport = RPCWithTransport> {
    rpc?: T;
    on(event: "dom-ready", handler: () => void): void;
    static defineRPC<TSchema>(config: {
      maxRequestTime?: number;
      handlers: {
        requests?: RequestHandlers<SideRequests<BunSide<TSchema>>>;
        messages?: MessageHandlers<SideMessages<BunSide<TSchema>>>;
      };
    }): BunRPCDefinition<TSchema>;
  }

  export class BrowserWindow<T extends RPCWithTransport = RPCWithTransport> {
    id: number;
    webview?: BrowserView<T>;
    constructor(options: {
      title?: string;
      url?: string;
      frame?: { width: number; height: number; x?: number; y?: number };
      titleBarStyle?: "hidden" | "hiddenInset" | "default";
      rpc?: T;
    });
    minimize(): void;
    maximize(): void;
    unmaximize(): void;
    isMaximized(): boolean;
    setFullScreen(value: boolean): void;
    isFullScreen(): boolean;
    setTitle(title: string): void;
    setTrafficLightVisibility(visible: boolean): void;
    setTrafficLightPosition(x: number, y: number): void;
    close(): void;
    on(event: "close", handler: () => void): void;
  }

  export type Point = { x: number; y: number };
  export type Rectangle = { x: number; y: number; width: number; height: number };
  export type Display = {
    id: number;
    bounds: Rectangle;
    workArea: Rectangle;
    scaleFactor: number;
    isPrimary: boolean;
  };

  export const Screen: {
    getPrimaryDisplay: () => Display;
    getAllDisplays: () => Display[];
    getCursorScreenPoint: () => Point;
  };

  export const Utils: {
    openFileDialog: (options: {
      startingFolder?: string;
      allowedFileTypes?: string;
      canChooseFiles?: boolean;
      canChooseDirectory?: boolean;
      allowsMultipleSelection?: boolean;
      directory?: boolean;
      multiple?: boolean;
    }) => Promise<string[]>;
    openExternal: (url: string) => boolean;
    openPath: (path: string) => boolean;
    showItemInFolder: (path: string) => void;
    moveToTrash: (path: string) => boolean;
    clipboardReadText: () => string | null;
    clipboardWriteText: (text: string) => void;
    clipboard: {
      writeText: (text: string) => void;
      readText: () => Promise<string>;
    };
  };

  export const Updater: {
    appDataFolder: () => Promise<string>;
    checkForUpdates: () => Promise<void>;
    localInfo: {
      version: () => Promise<string>;
      hash: () => Promise<string>;
      channel: () => Promise<string>;
      bucketUrl: () => Promise<string>;
    };
    getLocallocalInfo: () => Promise<{
      version: string;
      hash: string;
      channel: string;
      bucketUrl: string;
      name: string;
      identifier: string;
    }>;
    channelBucketUrl: () => Promise<string>;
  };
}
