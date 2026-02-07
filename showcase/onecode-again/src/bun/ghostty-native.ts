/**
 * Ghostty native FFI layer.
 *
 * Loads libghostty.dylib and exposes the ghostty C embedding API
 * for creating terminal surfaces with GPU-accelerated Metal rendering.
 *
 * See: https://github.com/ghostty-org/ghostty/blob/main/include/ghostty.h
 */
import { dlopen, FFIType, suffix, JSCallback, ptr, toArrayBuffer, CString, type Pointer } from "bun:ffi";
import { join } from "path";

// Load libghostty from the native build output
const libPath = join(
  import.meta.dir,
  "..",
  "native",
  "zig-out",
  "lib",
  `libghostty.${suffix}`,
);

let lib: ReturnType<typeof dlopen> | null = null;

try {
  lib = dlopen(libPath, {
    // Initialization
    ghostty_init: {
      args: [FFIType.u64, FFIType.ptr], // argc, argv
      returns: FFIType.i32,
    },

    // Config
    ghostty_config_new: {
      args: [],
      returns: FFIType.ptr,
    },
    ghostty_config_free: {
      args: [FFIType.ptr],
      returns: FFIType.void,
    },
    ghostty_config_load_default_files: {
      args: [FFIType.ptr],
      returns: FFIType.void,
    },
    ghostty_config_load_recursive_files: {
      args: [FFIType.ptr],
      returns: FFIType.void,
    },
    ghostty_config_finalize: {
      args: [FFIType.ptr],
      returns: FFIType.void,
    },

    // App
    ghostty_app_new: {
      args: [FFIType.ptr, FFIType.ptr],
      returns: FFIType.ptr,
    },
    ghostty_app_free: {
      args: [FFIType.ptr],
      returns: FFIType.void,
    },
    ghostty_app_tick: {
      args: [FFIType.ptr],
      returns: FFIType.void,
    },

    // Surface
    ghostty_surface_new: {
      args: [FFIType.ptr, FFIType.ptr],
      returns: FFIType.ptr,
    },
    ghostty_surface_free: {
      args: [FFIType.ptr],
      returns: FFIType.void,
    },
    ghostty_surface_set_focus: {
      args: [FFIType.ptr, FFIType.bool],
      returns: FFIType.void,
    },
    ghostty_surface_set_size: {
      args: [FFIType.ptr, FFIType.u32, FFIType.u32],
      returns: FFIType.void,
    },
    ghostty_surface_set_content_scale: {
      args: [FFIType.ptr, FFIType.f64, FFIType.f64],
      returns: FFIType.void,
    },
    ghostty_surface_request_close: {
      args: [FFIType.ptr],
      returns: FFIType.void,
    },
    ghostty_surface_complete_clipboard_request: {
      args: [FFIType.ptr, FFIType.cstring, FFIType.ptr, FFIType.bool],
      returns: FFIType.void,
    },

    // Input
    ghostty_surface_key: {
      args: [FFIType.ptr, FFIType.ptr],
      returns: FFIType.bool,
    },
    ghostty_surface_text: {
      args: [FFIType.ptr, FFIType.cstring, FFIType.u64],
      returns: FFIType.void,
    },
    ghostty_surface_mouse_button: {
      args: [FFIType.ptr, FFIType.i32, FFIType.i32, FFIType.i32],
      returns: FFIType.bool,
    },
    ghostty_surface_mouse_pos: {
      args: [FFIType.ptr, FFIType.f64, FFIType.f64, FFIType.i32],
      returns: FFIType.void,
    },
    ghostty_surface_mouse_scroll: {
      args: [FFIType.ptr, FFIType.f64, FFIType.f64, FFIType.i32],
      returns: FFIType.void,
    },
  });
} catch (err) {
  console.warn(
    "[ghostty-native] Failed to load libghostty:",
    (err as Error).message,
  );
  console.warn(
    "[ghostty-native] Native terminal rendering will not be available.",
  );
  console.warn("[ghostty-native] Expected path:", libPath);
}

// Cast to any to work around Bun's dlopen type inference limitations.
// The symbols are properly typed at the FFI level; TypeScript just can't
// infer the call signatures from the dlopen definition object.
// biome-ignore lint: Bun FFI typing limitation
export const ghosttyLib: any = lib?.symbols ?? null;
export const isGhosttyAvailable = lib !== null;
export const ghosttyLibPath = libPath;

// Platform tag enum values
const GHOSTTY_PLATFORM_MACOS = 1;

// Action tag enum values (from ghostty_action_tag_e)
const GHOSTTY_ACTION_RENDER = 27;
const GHOSTTY_ACTION_SET_TITLE = 32;
const GHOSTTY_ACTION_CLOSE_WINDOW = 46;

export interface ClipboardProvider {
  readText(): string | null;
  writeText(text: string): void;
}

export interface GhosttyAppCallbacks {
  onSurfaceClose?: (surfacePtr: Pointer) => void;
  onSetTitle?: (surfacePtr: Pointer, title: string) => void;
}

/**
 * GhosttyApp manages the lifetime of a ghostty application instance.
 * It handles initialization, runtime callbacks, and surface management.
 */
export class GhosttyApp {
  private app: Pointer | null = null;
  private config: Pointer | null = null;
  private tickTimer: ReturnType<typeof setInterval> | null = null;

  // Keep references to prevent GC of JSCallbacks
  private wakeupCb: JSCallback | null = null;
  private actionCb: JSCallback | null = null;
  private readClipboardCb: JSCallback | null = null;
  private confirmReadClipboardCb: JSCallback | null = null;
  private writeClipboardCb: JSCallback | null = null;
  private closeSurfaceCb: JSCallback | null = null;

  private surfaces = new Map<number, GhostySurface>();
  private surfaceByPtr = new Map<number, number>(); // ptr address -> surface id
  private nextSurfaceId = 1;

  private clipboard: ClipboardProvider | null = null;
  private callbacks: GhosttyAppCallbacks = {};

  constructor(options?: {
    clipboard?: ClipboardProvider;
    callbacks?: GhosttyAppCallbacks;
  }) {
    this.clipboard = options?.clipboard ?? null;
    this.callbacks = options?.callbacks ?? {};
  }

  async init(): Promise<boolean> {
    if (!ghosttyLib) return false;

    // Initialize ghostty global state
    const emptyArgv = new Uint8Array(8);
    const result = ghosttyLib.ghostty_init(0, ptr(emptyArgv));
    if (result !== 0) {
      console.error("[ghostty] Failed to initialize ghostty");
      return false;
    }

    // Create and load config
    this.config = ghosttyLib.ghostty_config_new() as Pointer;
    if (!this.config) {
      console.error("[ghostty] Failed to create config");
      return false;
    }
    ghosttyLib.ghostty_config_load_default_files(this.config);
    ghosttyLib.ghostty_config_load_recursive_files(this.config);
    ghosttyLib.ghostty_config_finalize(this.config);

    // Create runtime callbacks
    this.wakeupCb = new JSCallback(
      (_userdata: Pointer) => {
        if (this.app) {
          ghosttyLib!.ghostty_app_tick(this.app);
        }
      },
      { args: [FFIType.ptr], returns: FFIType.void },
    );

    this.actionCb = new JSCallback(
      (app: Pointer, targetPtr: Pointer, actionPtr: Pointer) => {
        return this.handleAction(app, targetPtr, actionPtr);
      },
      { args: [FFIType.ptr, FFIType.ptr, FFIType.ptr], returns: FFIType.bool },
    );

    this.readClipboardCb = new JSCallback(
      (userdata: Pointer, clipboard: number, request: Pointer) => {
        this.handleReadClipboard(userdata, clipboard, request);
      },
      { args: [FFIType.ptr, FFIType.i32, FFIType.ptr], returns: FFIType.void },
    );

    this.confirmReadClipboardCb = new JSCallback(
      (userdata: Pointer, _content: Pointer, request: Pointer, _type: number) => {
        // Auto-confirm clipboard reads (no confirmation dialog for embedded use)
        this.handleReadClipboard(userdata, 0, request);
      },
      { args: [FFIType.ptr, FFIType.ptr, FFIType.ptr, FFIType.i32], returns: FFIType.void },
    );

    this.writeClipboardCb = new JSCallback(
      (_userdata: Pointer, _clipboard: number, contentPtr: Pointer, count: number, _confirm: boolean) => {
        this.handleWriteClipboard(contentPtr, count);
      },
      { args: [FFIType.ptr, FFIType.i32, FFIType.ptr, FFIType.u64, FFIType.bool], returns: FFIType.void },
    );

    this.closeSurfaceCb = new JSCallback(
      (userdata: Pointer, _processAlive: boolean) => {
        // userdata here is the surface's userdata, which we set to the surface ptr
        if (this.callbacks.onSurfaceClose) {
          this.callbacks.onSurfaceClose(userdata);
        }
      },
      { args: [FFIType.ptr, FFIType.bool], returns: FFIType.void },
    );

    // Build the runtime config struct
    // Layout: userdata(8) + bool(1) + padding(7) + 6 function ptrs(48)
    // Total: 64 bytes (on 64-bit)
    const runtimeConfig = new ArrayBuffer(64);
    const view = new DataView(runtimeConfig);

    view.setBigUint64(0, 0n, true); // userdata = null
    view.setUint8(8, 0); // supports_selection_clipboard = false

    const ptrSize = 8;
    const fnBase = 16;
    const runtimeBuf = new Uint8Array(runtimeConfig);

    const writeFnPtr = (offset: number, cb: JSCallback) => {
      view.setBigUint64(offset, BigInt(cb.ptr as unknown as number), true);
    };

    writeFnPtr(fnBase + 0 * ptrSize, this.wakeupCb);
    writeFnPtr(fnBase + 1 * ptrSize, this.actionCb);
    writeFnPtr(fnBase + 2 * ptrSize, this.readClipboardCb);
    writeFnPtr(fnBase + 3 * ptrSize, this.confirmReadClipboardCb);
    writeFnPtr(fnBase + 4 * ptrSize, this.writeClipboardCb);
    writeFnPtr(fnBase + 5 * ptrSize, this.closeSurfaceCb);

    this.app = ghosttyLib.ghostty_app_new(
      ptr(runtimeBuf),
      this.config,
    ) as Pointer;

    if (!this.app) {
      console.error("[ghostty] Failed to create ghostty app");
      this.destroy();
      return false;
    }

    // Drive the ghostty event loop at ~60fps
    this.tickTimer = setInterval(() => {
      if (this.app) {
        ghosttyLib!.ghostty_app_tick(this.app);
      }
    }, 16);

    console.log("[ghostty] Ghostty app initialized successfully");
    return true;
  }

  private handleAction(_app: Pointer, targetPtr: Pointer, actionPtr: Pointer): boolean {
    if (!ghosttyLib) return false;

    // ghostty_action_s: { tag: i32, padding: 4 bytes, action: union (8+ bytes) }
    const actionBuf = toArrayBuffer(actionPtr, 0, 16);
    const actionView = new DataView(actionBuf);
    const tag = actionView.getInt32(0, true);

    switch (tag) {
      case GHOSTTY_ACTION_RENDER:
        // Render requested — tick will handle it on next frame
        return true;

      case GHOSTTY_ACTION_SET_TITLE: {
        if (!this.callbacks.onSetTitle) return false;
        // ghostty_action_set_title_s: { title: const char* }
        // action union starts at offset 8
        const titlePtrValue = actionView.getBigUint64(8, true);
        if (titlePtrValue === 0n) return false;
        const titleCStr = new CString(Number(titlePtrValue) as unknown as Pointer);
        const title = titleCStr.toString();

        // Extract surface ptr from target: { tag: i32, padding: 4, surface: ptr }
        const targetBuf = toArrayBuffer(targetPtr, 0, 16);
        const targetView = new DataView(targetBuf);
        const targetTag = targetView.getInt32(0, true);
        if (targetTag === 1) { // GHOSTTY_TARGET_SURFACE
          const surfaceAddr = targetView.getBigUint64(8, true);
          this.callbacks.onSetTitle(Number(surfaceAddr) as unknown as Pointer, title);
        }
        return true;
      }

      case GHOSTTY_ACTION_CLOSE_WINDOW:
        return false; // Let the host handle window close

      default:
        return false;
    }
  }

  private handleReadClipboard(_userdata: Pointer, _clipboard: number, request: Pointer): void {
    if (!ghosttyLib) return;

    // Find the surface by userdata (we set userdata to null for now, so find by context)
    // For clipboard, we need to call ghostty_surface_complete_clipboard_request
    // on the surface that requested the clipboard. The userdata is the surface's userdata.
    const text = this.clipboard?.readText() ?? "";
    const textBuf = Buffer.from(text + "\0");

    // We need the surface pointer to complete the request.
    // The userdata for the surface is what we passed in surface_config.
    // Since we set userdata = null, we need to find the right surface.
    // For now, complete on the first surface (most common case: single terminal)
    const firstSurface = this.surfaces.values().next().value;
    if (firstSurface) {
      ghosttyLib.ghostty_surface_complete_clipboard_request(
        firstSurface.ptr,
        ptr(textBuf),
        request,
        true, // confirmed
      );
    }
  }

  private handleWriteClipboard(contentPtr: Pointer, count: number): void {
    if (!this.clipboard || count === 0) return;

    // ghostty_clipboard_content_s: { mime: const char*, data: const char* }
    // Each entry is 16 bytes (two pointers)
    const contentBuf = toArrayBuffer(contentPtr, 0, count * 16);
    const contentView = new DataView(contentBuf);

    // Read the first content entry's data pointer (we primarily care about text)
    for (let i = 0; i < count; i++) {
      const dataAddr = contentView.getBigUint64(i * 16 + 8, true);
      if (dataAddr === 0n) continue;

      const dataCStr = new CString(Number(dataAddr) as unknown as Pointer);
      const text = dataCStr.toString();
      if (text) {
        this.clipboard.writeText(text);
        return;
      }
    }
  }

  /**
   * Create a new ghostty surface attached to an NSView.
   */
  createSurface(
    nsViewPtr: Pointer,
    scaleFactor: number,
    cwd?: string | null,
    command?: string | null,
  ): number | null {
    if (!ghosttyLib || !this.app) return null;

    // Build the ghostty_surface_config_s struct
    const configSize = 88;
    const config = new ArrayBuffer(configSize);
    const configView = new DataView(config);

    // platform_tag = GHOSTTY_PLATFORM_MACOS (1)
    configView.setInt32(0, GHOSTTY_PLATFORM_MACOS, true);

    // platform.macos.nsview = nsViewPtr
    configView.setBigUint64(8, BigInt(nsViewPtr as unknown as number), true);

    // userdata = null
    configView.setBigUint64(16, 0n, true);

    // scale_factor
    configView.setFloat64(24, scaleFactor);

    // font_size = 0.0 (use default)
    configView.setFloat32(32, 0.0);

    // working_directory
    let cwdBuf: Uint8Array | null = null;
    if (cwd) {
      cwdBuf = Buffer.from(cwd + "\0");
      configView.setBigUint64(40, BigInt(ptr(cwdBuf) as unknown as number), true);
    }

    // command
    let cmdBuf: Uint8Array | null = null;
    if (command) {
      cmdBuf = Buffer.from(command + "\0");
      configView.setBigUint64(48, BigInt(ptr(cmdBuf) as unknown as number), true);
    }

    // env_vars = null, env_var_count = 0
    configView.setBigUint64(56, 0n, true);
    configView.setBigUint64(64, 0n, true);

    // initial_input = null
    configView.setBigUint64(72, 0n, true);

    // wait_after_command = false
    configView.setUint8(80, 0);

    // context = GHOSTTY_SURFACE_CONTEXT_WINDOW (0)
    configView.setInt32(84, 0, true);

    const configBuf = new Uint8Array(config);
    const surface = ghosttyLib.ghostty_surface_new(
      this.app,
      ptr(configBuf),
    ) as Pointer;

    if (!surface) {
      console.error("[ghostty] Failed to create surface");
      return null;
    }

    const id = this.nextSurfaceId++;
    this.surfaces.set(id, { ptr: surface, nsViewPtr });
    this.surfaceByPtr.set(surface as unknown as number, id);

    // Set the content scale for Retina displays
    ghosttyLib.ghostty_surface_set_content_scale(surface, scaleFactor, scaleFactor);

    return id;
  }

  resizeSurface(surfaceId: number, widthPx: number, heightPx: number): void {
    if (!ghosttyLib) return;
    const surface = this.surfaces.get(surfaceId);
    if (!surface) return;

    ghosttyLib.ghostty_surface_set_size(
      surface.ptr,
      Math.round(widthPx),
      Math.round(heightPx),
    );
  }

  focusSurface(surfaceId: number): void {
    if (!ghosttyLib) return;
    const surface = this.surfaces.get(surfaceId);
    if (!surface) return;

    ghosttyLib.ghostty_surface_set_focus(surface.ptr, true);
  }

  destroySurface(surfaceId: number): void {
    if (!ghosttyLib) return;
    const surface = this.surfaces.get(surfaceId);
    if (!surface) return;

    ghosttyLib.ghostty_surface_request_close(surface.ptr);
    ghosttyLib.ghostty_surface_free(surface.ptr);
    this.surfaceByPtr.delete(surface.ptr as unknown as number);
    this.surfaces.delete(surfaceId);
  }

  getSurfaceIdByPtr(surfacePtr: Pointer): number | undefined {
    return this.surfaceByPtr.get(surfacePtr as unknown as number);
  }

  getSurfacePtr(surfaceId: number): Pointer | null {
    const surface = this.surfaces.get(surfaceId);
    return surface?.ptr ?? null;
  }

  destroy(): void {
    if (this.tickTimer) {
      clearInterval(this.tickTimer);
      this.tickTimer = null;
    }

    for (const [id] of this.surfaces) {
      this.destroySurface(id);
    }

    if (this.app && ghosttyLib) {
      ghosttyLib.ghostty_app_free(this.app);
      this.app = null;
    }

    if (this.config && ghosttyLib) {
      ghosttyLib.ghostty_config_free(this.config);
      this.config = null;
    }

    this.wakeupCb?.close();
    this.actionCb?.close();
    this.readClipboardCb?.close();
    this.confirmReadClipboardCb?.close();
    this.writeClipboardCb?.close();
    this.closeSurfaceCb?.close();
  }
}

interface GhostySurface {
  ptr: Pointer;
  nsViewPtr: Pointer;
}
