import { createSignal, Show, type JSXElement } from "solid-js"
import { ChevronRight, ChevronDown } from "lucide-solid"
import { cn } from "@/lib/utils"

interface MessageJsonDisplayProps {
  label: string
  data: unknown
  defaultOpen?: boolean
}

export function MessageJsonDisplay(props: MessageJsonDisplayProps) {
  const [isOpen, setIsOpen] = createSignal(props.defaultOpen ?? false)

  const formattedJson = () => {
    try {
      return JSON.stringify(props.data, null, 2)
    } catch {
      return String(props.data)
    }
  }

  return (
    <div class="rounded-md border border-border/50 overflow-hidden">
      <button
        class="flex items-center gap-1.5 w-full px-3 py-2 text-left text-xs font-medium text-muted-foreground hover:bg-muted/50 transition-colors"
        onClick={() => setIsOpen(!isOpen())}
      >
        <Show when={isOpen()} fallback={<ChevronRight class="size-3" />}>
          <ChevronDown class="size-3" />
        </Show>
        <span>{props.label}</span>
      </button>
      <Show when={isOpen()}>
        <div class="border-t border-border/50">
          <pre class="p-3 text-xs overflow-x-auto bg-muted/30">
            <code class="text-foreground/80">{formattedJson()}</code>
          </pre>
        </div>
      </Show>
    </div>
  )
}

interface CollapsibleJsonProps {
  children: JSXElement
  label: string
  defaultOpen?: boolean
  class?: string
}

export function CollapsibleJson(props: CollapsibleJsonProps) {
  const [isOpen, setIsOpen] = createSignal(props.defaultOpen ?? false)

  return (
    <div class={cn("rounded-md border border-border/50", props.class)}>
      <button
        class="flex items-center gap-1.5 w-full px-3 py-2 text-left text-xs font-medium text-muted-foreground hover:bg-muted/50 transition-colors"
        onClick={() => setIsOpen(!isOpen())}
      >
        <Show when={isOpen()} fallback={<ChevronRight class="size-3" />}>
          <ChevronDown class="size-3" />
        </Show>
        <span>{props.label}</span>
      </button>
      <Show when={isOpen()}>
        <div class="border-t border-border/50 p-3">
          {props.children}
        </div>
      </Show>
    </div>
  )
}
