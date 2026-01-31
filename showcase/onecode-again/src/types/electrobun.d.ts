declare module "electrobun/view" {
  type RequestMap<T> = T extends { requests: infer R } ? R : Record<string, never>;
  type RequestClient<T> = {
    [K in keyof RequestMap<T>]: (
      params: RequestMap<T>[K] extends { params: infer P } ? P : never
    ) => Promise<RequestMap<T>[K] extends { response: infer R } ? R : never>;
  };

  type MessageMap<T> = T extends { messages: infer M } ? M : Record<string, never>;
  type MessageHandlers<T> = {
    [K in keyof MessageMap<T>]: (payload: MessageMap<T>[K]) => void;
  };

  export type RPCDefinition<T> = {
    maxRequestTime?: number;
    handlers: {
      requests: Partial<RequestClient<T extends { bun: infer B } ? B : never>>;
      messages: Partial<MessageHandlers<T extends { webview: infer W } ? W : never>>;
    };
  };

  export class Electroview<T> {
    rpc?: { request: RequestClient<T extends { bun: infer B } ? B : never> };
    constructor(options: { rpc: RPCDefinition<T> });
    static defineRPC<T>(config: RPCDefinition<T>): RPCDefinition<T>;
  }

  const Electrobun: {
    Electroview: typeof Electroview;
  };

  export default Electrobun;
}

declare module "electrobun/bun" {
  export type RPCSchema<T> = T;

  type RequestMap<T> = T extends { requests: infer R } ? R : Record<string, never>;
  type RequestHandlers<T> = {
    [K in keyof RequestMap<T>]: (
      params: RequestMap<T>[K] extends { params: infer P } ? P : never
    ) => Promise<RequestMap<T>[K] extends { response: infer R } ? R : never> | (RequestMap<T>[K] extends { response: infer R } ? R : never);
  };

  type MessageMap<T> = T extends { messages: infer M } ? M : Record<string, never>;
  type MessageHandlers<T> = {
    [K in keyof MessageMap<T>]: (payload: MessageMap<T>[K]) => void;
  } & {
    "*": (messageName: string, payload: unknown) => void;
  };

  export class BrowserView<T> {
    rpc?: { 
      send: T extends { webview: { messages: infer M } } 
        ? { [K in keyof M]: (payload: M[K]) => void }
        : Record<string, (payload: unknown) => void>;
    };
    on(event: "dom-ready", handler: () => void): void;
    static defineRPC<T>(config: {
      maxRequestTime?: number;
      handlers: {
        requests: Partial<RequestHandlers<T extends { bun: infer B } ? B : never>>;
        messages: Partial<MessageHandlers<T extends { webview: infer W } ? W : never>>;
      };
    }): unknown;
  }

  export class BrowserWindow<T = unknown> {
    id: number;
    webview?: BrowserView<T>;
    constructor(options: {
      title?: string;
      url?: string;
      frame?: { width: number; height: number; x?: number; y?: number };
      titleBarStyle?: "hiddenInset" | "default";
      rpc?: unknown;
    });
    minimize(): void;
    maximize(): void;
    unmaximize(): void;
    isMaximized(): boolean;
    setFullScreen(value: boolean): void;
    isFullScreen(): boolean;
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
