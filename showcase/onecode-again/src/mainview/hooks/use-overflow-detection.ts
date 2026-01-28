import { createSignal, createEffect, onCleanup, type Accessor } from "solid-js"

/**
 * VS Code style overflow detection hook
 *
 * Detects when an element's content overflows its container using ResizeObserver.
 * This approach avoids layout thrashing by:
 * - Using ResizeObserver instead of window resize events
 * - Batching measurements with requestAnimationFrame
 * - Proper cleanup through dispose pattern
 *
 * @param contentRef - Accessor to the element to observe
 * @returns Accessor<boolean> indicating if the element has overflow
 *
 * @example
 * ```tsx
 * let contentRef: HTMLDivElement | undefined
 * const hasOverflow = useOverflowDetection(() => contentRef)
 *
 * return (
 *   <div ref={contentRef} class="max-h-[100px] overflow-hidden">
 *     {textContent}
 *   </div>
 *   {hasOverflow() && <div class="gradient-overlay" />}
 * )
 * ```
 */
export function useOverflowDetection(
  contentRef: Accessor<HTMLElement | null | undefined>
): Accessor<boolean> {
  const [hasOverflow, setHasOverflow] = createSignal(false)
  let rafIdRef = 0

  createEffect(() => {
    const element = contentRef()
    if (!element) return

    // Dispose pattern - track if effect has been cleaned up
    let disposed = false

    const measureOverflow = () => {
      // Cancel any pending animation frame
      if (rafIdRef) {
        cancelAnimationFrame(rafIdRef)
      }

      // Schedule measurement at next animation frame to batch with browser paint
      rafIdRef = requestAnimationFrame(() => {
        if (disposed) return
        const el = contentRef()
        if (!el) return

        // Single synchronous read - batched with browser's paint cycle
        const overflows = el.scrollHeight > el.clientHeight
        setHasOverflow(overflows)
      })
    }

    // Initial measurement
    measureOverflow()

    // ResizeObserver fires AFTER layout, not during - avoids layout thrashing
    const observer = new ResizeObserver(measureOverflow)
    observer.observe(element)

    // Cleanup (VS Code dispose pattern)
    onCleanup(() => {
      disposed = true
      observer.disconnect()
      if (rafIdRef) {
        cancelAnimationFrame(rafIdRef)
      }
    })
  })

  return hasOverflow
}
