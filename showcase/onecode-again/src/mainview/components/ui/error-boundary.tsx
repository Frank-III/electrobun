import { ErrorBoundary as SolidErrorBoundary, type JSXElement } from "solid-js"
import { AlertCircle } from "lucide-solid"
import { Button } from "./button"

interface ErrorFallbackProps {
  error: Error
  reset: () => void
}

function ErrorFallback(props: ErrorFallbackProps) {
  return (
    <div class="flex flex-col items-center justify-center h-full p-4 gap-4 text-center">
      <AlertCircle class="size-10 text-destructive" />
      <div class="space-y-1">
        <p class="font-medium text-sm">Something went wrong</p>
        <p class="text-sm text-muted-foreground max-w-md">
          {props.error.message || "An unexpected error occurred"}
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={props.reset}>
        Try again
      </Button>
    </div>
  )
}

export interface ErrorBoundaryProps {
  fallback?: (error: Error, reset: () => void) => JSXElement
  children: JSXElement
}

export function ErrorBoundary(props: ErrorBoundaryProps) {
  return (
    <SolidErrorBoundary
      fallback={(err, reset) => {
        const error = err instanceof Error ? err : new Error(String(err))
        if (props.fallback) {
          return props.fallback(error, reset)
        }
        return <ErrorFallback error={error} reset={reset} />
      }}
    >
      {props.children}
    </SolidErrorBoundary>
  )
}

export function ViewerErrorBoundary(props: { children: JSXElement }) {
  return (
    <ErrorBoundary
      fallback={(error, reset) => (
        <div class="flex flex-col items-center justify-center h-full p-8 gap-4">
          <AlertCircle class="size-12 text-destructive" />
          <div class="text-center space-y-2">
            <h3 class="font-semibold">Failed to load viewer</h3>
            <p class="text-sm text-muted-foreground max-w-sm">
              {error.message}
            </p>
          </div>
          <Button onClick={reset}>Reload</Button>
        </div>
      )}
    >
      {props.children}
    </ErrorBoundary>
  )
}
