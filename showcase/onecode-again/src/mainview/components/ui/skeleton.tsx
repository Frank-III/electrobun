import { splitProps, type Component, type JSX } from "solid-js"
import { splitProps, type Component, type JSX } from "solid-js"
import { cn } from "../../lib/utils"

interface SkeletonProps extends JSX.HTMLAttributes<HTMLDivElement> {}

const Skeleton: Component<SkeletonProps> = (props) => {
  const [local, others] = splitProps(props, ["class"])

  return (
    <div
      class={cn("animate-pulse rounded-md bg-muted", local.class)}
      {...others}
    />
  )
}

export { Skeleton }
export type { SkeletonProps }
export type { SkeletonProps }
