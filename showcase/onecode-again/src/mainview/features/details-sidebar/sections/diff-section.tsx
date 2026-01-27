"use client"

import { Button } from "@/components/ui/button"
import { GitCommit } from "lucide-react"
import { IconSpinner, DiffIcon } from "@/components/ui/icons"
import { cn } from "@/lib/utils"
import { getFileIconByExtension } from "@/features/agents/mentions/agents-file-mention"

/** Parsed diff file type */
interface ParsedDiffFile {
  key: string
  oldPath: string
  newPath: string
  additions: number
  deletions: number
  isNewFile?: boolean
  isDeletedFile?: boolean
}

interface DiffSectionProps {
  chatId: string
  isDiffSidebarOpen: boolean
  setIsDiffSidebarOpen: (open: boolean) => void
  diffStats?: { additions: number; deletions: number; fileCount: number } | null
  parsedFileDiffs?: ParsedDiffFile[]
  onCommit?: () => void
  isCommitting?: boolean
  isExpanded?: boolean
}

/**
 * Get file name from path
 */
function getFileName(path: string): string {
  const parts = path.split("/")
  return parts[parts.length - 1] || path
}

/**
 * Get file directory from path
 */
function getFileDir(path: string): string {
  const parts = path.split("/")
  if (parts.length <= 1) return ""
  return parts.slice(0, -1).join("/")
}

export function DiffSection({
  chatId,
  isDiffSidebarOpen,
  setIsDiffSidebarOpen,
  diffStats,
  parsedFileDiffs,
  onCommit,
  isCommitting = false,
  isExpanded = false,
}: DiffSectionProps) {
  const hasChanges = diffStats && diffStats.fileCount > 0
  const files = parsedFileDiffs || []

  // Limit files shown in widget (show first 5)
  const maxFilesToShow = 5
  const visibleFiles = files.slice(0, maxFilesToShow)
  const remainingCount = files.length - maxFilesToShow

  return (
    <div class="px-3 py-2">
      {hasChanges ? (
        <div class="space-y-2">
          {/* Stats summary - same style as agent-diff-view */}
          <div class="flex items-center gap-2 text-xs font-mono">
            <span class="text-muted-foreground">
              {diffStats.fileCount} file{diffStats.fileCount !== 1 ? "s" : ""}
            </span>
            <span class="tabular-nums whitespace-nowrap">
              {diffStats.additions > 0 && (
                <span class="mr-1.5 text-emerald-600 dark:text-emerald-400">
                  +{diffStats.additions}
                </span>
              )}
              {diffStats.deletions > 0 && (
                <span class="text-red-600 dark:text-red-400">
                  -{diffStats.deletions}
                </span>
              )}
            </span>
          </div>

          {/* File list - matching agent-diff-view header style */}
          {visibleFiles.length > 0 && (
            <div class="space-y-0.5">
              {visibleFiles.map((file) => {
                const displayPath = file.newPath || file.oldPath
                const fileName = getFileName(displayPath)
                const dirPath = getFileDir(displayPath)
                const isNewFile = file.isNewFile
                const isDeletedFile = file.isDeletedFile
                const FileIcon = getFileIconByExtension(fileName)

                return (
                  <div
                    key={file.key}
                    class={cn(
                      "group flex items-center gap-2 font-mono text-xs",
                      "py-1 px-1.5 rounded cursor-pointer",
                      "hover:bg-accent/50 transition-colors",
                    )}
                    onClick={() => setIsDiffSidebarOpen(true)}
                  >
                    {/* File icon */}
                    <div class="relative w-3.5 h-3.5 shrink-0">
                      {FileIcon && (
                        <FileIcon class="w-3.5 h-3.5 text-muted-foreground" />
                      )}
                    </div>

                    {/* File name + path + status - same layout as agent-diff-view */}
                    <div class="flex items-center gap-2 min-w-0 flex-1">
                      <span class="font-medium text-foreground shrink-0">
                        {fileName}
                      </span>
                      {dirPath && (
                        <span class="text-muted-foreground truncate text-[11px] min-w-0">
                          {dirPath}
                        </span>
                      )}
                      {isNewFile && (
                        <span class="shrink-0 text-[11px] text-emerald-600 dark:text-emerald-400">
                          (new)
                        </span>
                      )}
                      {isDeletedFile && (
                        <span class="shrink-0 text-[11px] text-red-600 dark:text-red-400">
                          (deleted)
                        </span>
                      )}
                    </div>

                    {/* Stats - same style as agent-diff-view */}
                    <span class="shrink-0 font-mono text-[11px] tabular-nums whitespace-nowrap">
                      {file.additions > 0 && (
                        <span class="mr-1.5 text-emerald-600 dark:text-emerald-400">
                          +{file.additions}
                        </span>
                      )}
                      {file.deletions > 0 && (
                        <span class="text-red-600 dark:text-red-400">
                          -{file.deletions}
                        </span>
                      )}
                    </span>
                  </div>
                )
              })}

              {/* Show more indicator */}
              {remainingCount > 0 && (
                <button
                  class="text-xs text-muted-foreground hover:text-foreground py-1 px-1.5 w-full text-left font-mono"
                  onClick={() => setIsDiffSidebarOpen(true)}
                >
                  +{remainingCount} more file{remainingCount !== 1 ? "s" : ""}...
                </button>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div class="flex gap-2 pt-1">
            {/* Commit button */}
            {onCommit && (
              <Button
                variant="default"
                size="sm"
                class="flex-1 h-7 text-xs"
                onClick={onCommit}
                disabled={isCommitting}
              >
                {isCommitting ? (
                  <IconSpinner class="h-3 w-3 mr-1.5" />
                ) : (
                  <GitCommit class="h-3 w-3 mr-1.5" />
                )}
                Commit
              </Button>
            )}

            {/* View all button */}
            <Button
              variant="outline"
              size="sm"
              class={cn("h-7 text-xs", onCommit ? "flex-1" : "w-full")}
              onClick={() => setIsDiffSidebarOpen(true)}
            >
              <DiffIcon class="h-3 w-3 mr-1.5" />
              View All
            </Button>
          </div>
        </div>
      ) : (
        <div class="flex items-center gap-2 text-xs text-muted-foreground py-2">
          <DiffIcon class="h-3.5 w-3.5" />
          <span>No changes</span>
        </div>
      )}
    </div>
  )
}
