import { splitProps, type Component, type JSX } from "solid-js"
import { cn } from "../../lib/utils"

interface TextareaProps extends JSX.TextareaHTMLAttributes<HTMLTextAreaElement> {
  ref?: HTMLTextAreaElement | ((el: HTMLTextAreaElement) => void)
}

const Textarea: Component<TextareaProps> = (props) => {
  const [local, others] = splitProps(props, ["class", "ref"])

  return (
    <textarea
      class={cn(
        "flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm shadow-black/5 transition-shadow placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50",
        local.class,
      )}
      ref={local.ref}
      {...others}
    />
  )
}

export { Textarea }
export type { TextareaProps }
