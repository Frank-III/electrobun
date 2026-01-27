import { cva, type VariantProps } from "class-variance-authority"
import { splitProps, type ParentComponent, type JSX } from "solid-js"
import { cn } from "../../lib/utils"

const labelVariants = cva(
  "text-[12px] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
)

export interface LabelProps
  extends JSX.LabelHTMLAttributes<HTMLLabelElement>,
    VariantProps<typeof labelVariants> {
  ref?: HTMLLabelElement | ((el: HTMLLabelElement) => void)
}

const Label: ParentComponent<LabelProps> = (props) => {
  const [local, others] = splitProps(props, ["class", "ref", "children"])

  return (
    <label
      ref={local.ref}
      class={cn(labelVariants(), local.class)}
      {...others}
    >
      {local.children}
    </label>
  )
}

export { Label, labelVariants }