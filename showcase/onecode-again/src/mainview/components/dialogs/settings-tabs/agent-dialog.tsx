import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { createPortal } from "react-dom"
import { trpc } from "../../../lib/trpc"
import { cn } from "../../../lib/utils"
import { ToolSelector } from "./tool-selector"

interface FileAgent {
  name: string
  description: string
  prompt: string
  tools?: string[]
  disallowedTools?: string[]
  model?: "sonnet" | "opus" | "haiku" | "inherit"
  source: "user" | "project"
  path: string
}

interface AgentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  agent: FileAgent | null
  onSuccess: () => void
}

type ToolMode = "all" | "allowlist" | "denylist"

export function AgentDialog({ open, onOpenChange, agent, onSuccess }: AgentDialogProps) {
  const [mounted, setMounted] = useState(false)
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null)

  // Form state
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [prompt, setPrompt] = useState("")
  const [model, setModel] = useState<"sonnet" | "opus" | "haiku" | "inherit">("inherit")
  const [source, setSource] = useState<"user" | "project">("user")
  const [toolMode, setToolMode] = useState<ToolMode>("all")
  const [selectedTools, setSelectedTools] = useState<string[]>([])

  const createMutation = trpc.agents.create.useMutation({
    onSuccess: () => {
      onSuccess()
      resetForm()
    },
  })

  const updateMutation = trpc.agents.update.useMutation({
    onSuccess: () => {
      onSuccess()
      resetForm()
    },
  })

  const isEditing = agent !== null
  const isLoading = createMutation.isPending || updateMutation.isPending

  // Initialize form when editing
  useEffect(() => {
    if (agent) {
      setName(agent.name)
      setDescription(agent.description)
      setPrompt(agent.prompt)
      setModel(agent.model || "inherit")
      setSource(agent.source)

      if (agent.tools && agent.tools.length > 0) {
        setToolMode("allowlist")
        setSelectedTools(agent.tools)
      } else if (agent.disallowedTools && agent.disallowedTools.length > 0) {
        setToolMode("denylist")
        setSelectedTools(agent.disallowedTools)
      } else {
        setToolMode("all")
        setSelectedTools([])
      }
    } else {
      resetForm()
    }
  }, [agent, open])

  // Ensure portal target only accessed on client
  useEffect(() => {
    setMounted(true)
    if (typeof document !== "undefined") {
      setPortalTarget(document.body)
    }
  }, [])

  // Handle escape key
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        onOpenChange(false)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [open, onOpenChange])

  const resetForm = () => {
    setName("")
    setDescription("")
    setPrompt("")
    setModel("inherit")
    setSource("user")
    setToolMode("all")
    setSelectedTools([])
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const tools = toolMode === "allowlist" ? selectedTools : undefined
    const disallowedTools = toolMode === "denylist" ? selectedTools : undefined

    if (isEditing) {
      updateMutation.mutate({
        originalName: agent.name,
        name: name.toLowerCase().replace(/\s+/g, "-"),
        description,
        prompt,
        tools,
        disallowedTools,
        model,
        source: agent.source,
      })
    } else {
      createMutation.mutate({
        name: name.toLowerCase().replace(/\s+/g, "-"),
        description,
        prompt,
        tools,
        disallowedTools,
        model,
        source,
      })
    }
  }

  const isValid = name.trim() && description.trim() && prompt.trim()

  if (!mounted || !portalTarget || !open) return null

  return createPortal(
    <AnimatePresence mode="wait">
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            class="fixed inset-0 z-[60] bg-black/50"
            onClick={() => onOpenChange(false)}
          />

          {/* Dialog */}
          <div class="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] z-[65]">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              class="w-[90vw] max-w-[600px] max-h-[85vh] flex flex-col rounded-xl bg-background border border-border shadow-2xl overflow-hidden"
              role="dialog"
              aria-modal="true"
            >
              {/* Header */}
              <div class="flex items-center justify-between px-6 py-4 border-b border-border">
                <h2 class="text-lg font-semibold text-foreground">
                  {isEditing ? "Edit Agent" : "Create Agent"}
                </h2>
                <button
                  onClick={() => onOpenChange(false)}
                  class="flex items-center justify-center h-8 w-8 rounded-full hover:bg-foreground/5 transition-colors"
                >
                  <X class="h-4 w-4" />
                </button>
              </div>

              {/* Content */}
              <form onSubmit={handleSubmit} class="flex-1 overflow-y-auto p-6 space-y-5">
                {/* Name */}
                <div class="space-y-1.5">
                  <label class="text-sm font-medium text-foreground">
                    Name <span class="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="code-reviewer"
                    class="w-full px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <p class="text-xs text-muted-foreground">
                    Will be converted to kebab-case (e.g., "code-reviewer")
                  </p>
                </div>

                {/* Description */}
                <div class="space-y-1.5">
                  <label class="text-sm font-medium text-foreground">
                    Description <span class="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Reviews code for quality and best practices"
                    class="w-full px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <p class="text-xs text-muted-foreground">
                    Tells Claude when to use this agent
                  </p>
                </div>

                {/* Prompt */}
                <div class="space-y-1.5">
                  <label class="text-sm font-medium text-foreground">
                    System Prompt <span class="text-red-500">*</span>
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="You are an expert code reviewer. When invoked:

1. Analyze the code structure
2. Check for security issues
3. Suggest improvements"
                    rows={8}
                    class="w-full px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none font-mono"
                  />
                  <p class="text-xs text-muted-foreground">
                    Instructions for the agent when it's invoked
                  </p>
                </div>

                {/* Model */}
                <div class="space-y-1.5">
                  <label class="text-sm font-medium text-foreground">Model</label>
                  <div class="flex flex-wrap gap-2">
                    {(["inherit", "sonnet", "opus", "haiku"] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setModel(m)}
                        class={cn(
                          "px-3 py-1.5 text-sm rounded-md border transition-colors",
                          model === m
                            ? "border-foreground/30 bg-foreground/10 text-foreground"
                            : "border-border bg-background text-muted-foreground hover:border-foreground/20"
                        )}
                      >
                        {m === "inherit" ? "Inherit (default)" : m.charAt(0).toUpperCase() + m.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tools */}
                <div class="space-y-3">
                  <label class="text-sm font-medium text-foreground">Tools</label>
                  <div class="flex flex-wrap gap-2">
                    {(["all", "allowlist", "denylist"] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => {
                          setToolMode(mode)
                          if (mode === "all") setSelectedTools([])
                        }}
                        class={cn(
                          "px-3 py-1.5 text-sm rounded-md border transition-colors",
                          toolMode === mode
                            ? "border-foreground/30 bg-foreground/10 text-foreground"
                            : "border-border bg-background text-muted-foreground hover:border-foreground/20"
                        )}
                      >
                        {mode === "all" && "All Tools"}
                        {mode === "allowlist" && "Only Selected"}
                        {mode === "denylist" && "Except Selected"}
                      </button>
                    ))}
                  </div>

                  {toolMode !== "all" && (
                    <ToolSelector
                      selectedTools={selectedTools}
                      onChange={setSelectedTools}
                      mode={toolMode}
                    />
                  )}
                </div>

                {/* Source (only for new agents) */}
                {!isEditing && (
                  <div class="space-y-1.5">
                    <label class="text-sm font-medium text-foreground">Location</label>
                    <div class="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setSource("user")}
                        class={cn(
                          "px-3 py-1.5 text-sm rounded-md border transition-colors",
                          source === "user"
                            ? "border-foreground/30 bg-foreground/10 text-foreground"
                            : "border-border bg-background text-muted-foreground hover:border-foreground/20"
                        )}
                      >
                        User (~/.claude/agents/)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSource("project")}
                        class={cn(
                          "px-3 py-1.5 text-sm rounded-md border transition-colors",
                          source === "project"
                            ? "border-foreground/30 bg-foreground/10 text-foreground"
                            : "border-border bg-background text-muted-foreground hover:border-foreground/20"
                        )}
                      >
                        Project (.claude/agents/)
                      </button>
                    </div>
                    <p class="text-xs text-muted-foreground">
                      User agents are available globally, project agents only in the current project
                    </p>
                  </div>
                )}
              </form>

              {/* Footer */}
              <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  class="px-4 py-2 text-sm font-medium rounded-md border border-border bg-background text-foreground hover:bg-foreground/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!isValid || isLoading}
                  class={cn(
                    "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                    isValid && !isLoading
                      ? "bg-foreground text-background hover:bg-foreground/90"
                      : "bg-foreground/50 text-background/70 cursor-not-allowed"
                  )}
                >
                  {isLoading ? "Saving..." : isEditing ? "Save Changes" : "Create Agent"}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    portalTarget
  )
}
