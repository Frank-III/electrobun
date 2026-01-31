import type { ExternalApp } from "../../shared/external-apps"
import { createSignal, createEffect, onCleanup, For, Show } from "solid-js"
import { createStoredState } from "../lib/state/signals"
import { desktopRpc } from "../lib/desktop-rpc"
import { Button } from "./ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { ChevronDown, Copy } from "lucide-solid"

// ─── Icon imports ───────────────────────────────────────────────────────────
import cursorIcon from "../assets/app-icons/cursor.svg"
import finderIcon from "../assets/app-icons/finder.png"
import zedIcon from "../assets/app-icons/zed.png"
import sublimeIcon from "../assets/app-icons/sublime.svg"
import xcodeIcon from "../assets/app-icons/xcode.svg"
import itermIcon from "../assets/app-icons/iterm.png"
import warpIcon from "../assets/app-icons/warp.png"
import terminalIcon from "../assets/app-icons/terminal.png"
import ghosttyIcon from "../assets/app-icons/ghostty.svg"
import vscodeIcon from "../assets/app-icons/vscode.svg"
import vscodeInsidersIcon from "../assets/app-icons/vscode-insiders.svg"
import jetbrainsIcon from "../assets/app-icons/jetbrains.svg"
import intellijIcon from "../assets/app-icons/intellij.svg"
import webstormIcon from "../assets/app-icons/webstorm.svg"
import pycharmIcon from "../assets/app-icons/pycharm.svg"
import phpstormIcon from "../assets/app-icons/phpstorm.svg"
import rubymineIcon from "../assets/app-icons/rubymine.svg"
import golandIcon from "../assets/app-icons/goland.svg"
import clionIcon from "../assets/app-icons/clion.svg"
import riderIcon from "../assets/app-icons/rider.svg"
import datagripIcon from "../assets/app-icons/datagrip.svg"
import appcodeIcon from "../assets/app-icons/appcode.svg"
import fleetIcon from "../assets/app-icons/fleet.svg"
import rustroverIcon from "../assets/app-icons/rustrover.svg"

// ─── App option structure ───────────────────────────────────────────────────

interface AppOption {
  id: ExternalApp
  label: string
  icon: string
  displayLabel?: string
}

const APP_OPTIONS: AppOption[] = [
  { id: "finder", label: "Finder", icon: finderIcon },
  { id: "cursor", label: "Cursor", icon: cursorIcon },
  { id: "zed", label: "Zed", icon: zedIcon },
  { id: "sublime", label: "Sublime Text", icon: sublimeIcon },
  { id: "xcode", label: "Xcode", icon: xcodeIcon },
  { id: "iterm", label: "iTerm", icon: itermIcon },
  { id: "warp", label: "Warp", icon: warpIcon },
  { id: "terminal", label: "Terminal", icon: terminalIcon },
  { id: "ghostty", label: "Ghostty", icon: ghosttyIcon },
]

const VSCODE_OPTIONS: AppOption[] = [
  { id: "vscode", label: "Standard", icon: vscodeIcon, displayLabel: "VS Code" },
  { id: "vscode-insiders", label: "Insiders", icon: vscodeInsidersIcon, displayLabel: "VS Code Insiders" },
]

const JETBRAINS_OPTIONS: AppOption[] = [
  { id: "intellij", label: "IntelliJ IDEA", icon: intellijIcon },
  { id: "webstorm", label: "WebStorm", icon: webstormIcon },
  { id: "pycharm", label: "PyCharm", icon: pycharmIcon },
  { id: "phpstorm", label: "PhpStorm", icon: phpstormIcon },
  { id: "rubymine", label: "RubyMine", icon: rubymineIcon },
  { id: "goland", label: "GoLand", icon: golandIcon },
  { id: "clion", label: "CLion", icon: clionIcon },
  { id: "rider", label: "Rider", icon: riderIcon },
  { id: "datagrip", label: "DataGrip", icon: datagripIcon },
  { id: "appcode", label: "AppCode", icon: appcodeIcon },
  { id: "fleet", label: "Fleet", icon: fleetIcon },
  { id: "rustrover", label: "RustRover", icon: rustroverIcon },
]

const ALL_APP_OPTIONS = [...APP_OPTIONS, ...VSCODE_OPTIONS, ...JETBRAINS_OPTIONS]

function getAppOption(id: ExternalApp): AppOption {
  return ALL_APP_OPTIONS.find((app) => app.id === id) ?? APP_OPTIONS[1]
}

// Persisted preferred editor signal
const [preferredEditor, setPreferredEditor] = createStoredState<ExternalApp>(
  "preferred-editor",
  "cursor"
)

// ─── Component ──────────────────────────────────────────────────────────────

export interface OpenInButtonProps {
  path: string | undefined
  label?: string
}

export function OpenInButton(props: OpenInButtonProps) {
  const currentApp = () => getAppOption(preferredEditor())

  const handleOpenIn = (app: ExternalApp) => {
    if (!props.path) return
    setPreferredEditor(app)
    desktopRpc.openInApp.mutate({ path: props.path, app })
  }

  const handleCopyPath = () => {
    if (!props.path) return
    desktopRpc.clipboardWrite.mutate({ text: props.path })
  }

  const handleOpenLastUsed = () => {
    if (!props.path) return
    desktopRpc.openInApp.mutate({ path: props.path, app: preferredEditor() })
  }

  // Keyboard shortcut: Cmd+Shift+C — copy path
  createEffect(() => {
    const path = props.path
    if (!path) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.metaKey && e.shiftKey && e.key === "c") {
        e.preventDefault()
        desktopRpc.clipboardWrite.mutate({ text: path })
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    onCleanup(() => window.removeEventListener("keydown", handleKeyDown))
  })

  return (
    <div class="inline-flex -space-x-px rounded-md">
      <Show when={props.label}>
        <Button
          variant="outline"
          size="sm"
          class="rounded-r-none gap-1.5 focus:z-10"
          onClick={handleOpenLastUsed}
          disabled={!props.path}
        >
          <img src={currentApp().icon} alt="" class="size-4 object-contain" />
          <span class="font-medium truncate max-w-[120px]">{props.label}</span>
        </Button>
      </Show>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            class={props.label ? "rounded-l-none focus:z-10 gap-1" : "gap-1 focus:z-10"}
            disabled={!props.path}
          >
            <span>Open</span>
            <ChevronDown class="size-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" class="w-48">
          <For each={APP_OPTIONS}>
            {(app) => (
              <DropdownMenuItem
                onClick={() => handleOpenIn(app.id)}
                class="flex items-center gap-2"
              >
                <img src={app.icon} alt="" class="size-4 object-contain" />
                <span>{app.label}</span>
              </DropdownMenuItem>
            )}
          </For>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger class="flex items-center gap-2">
              <img src={vscodeIcon} alt="" class="size-4 object-contain" />
              <span>VS Code</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent class="w-48" sideOffset={6} alignOffset={-4}>
              <For each={VSCODE_OPTIONS}>
                {(app) => (
                  <DropdownMenuItem
                    onClick={() => handleOpenIn(app.id)}
                    class="flex items-center gap-2"
                  >
                    <img src={app.icon} alt="" class="size-4 object-contain" />
                    <span>{app.label}</span>
                  </DropdownMenuItem>
                )}
              </For>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger class="flex items-center gap-2">
              <img src={jetbrainsIcon} alt="" class="size-4 object-contain" />
              <span>JetBrains</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent class="w-48" sideOffset={6} alignOffset={-4}>
              <For each={JETBRAINS_OPTIONS}>
                {(app) => (
                  <DropdownMenuItem
                    onClick={() => handleOpenIn(app.id)}
                    class="flex items-center gap-2"
                  >
                    <img src={app.icon} alt="" class="size-4 object-contain" />
                    <span>{app.label}</span>
                  </DropdownMenuItem>
                )}
              </For>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleCopyPath}
            class="flex items-center justify-between"
          >
            <div class="flex items-center gap-2">
              <Copy class="size-4" />
              <span>Copy path</span>
            </div>
            <span class="text-xs text-muted-foreground">⇧⌘C</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
