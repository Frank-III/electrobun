import { useMutation, useQueryClient } from "@tanstack/solid-query"
import { desktopRpc } from "../../../lib/desktop-rpc"
import { toast } from "solid-sonner"
import { selectedAgentChatIdAtom } from "../atoms"
import { chatSourceModeAtom } from "../../../lib/atoms"
import type { RemoteChat } from "../../../lib/remote-api"


interface Project {
  id: string
  name: string
  path: string
  gitOwner: string | null
  gitRepo: string | null
}

export function useAutoImport() {
  const setSelectedChatId = selectedAgentChatIdAtom[1]
  const setChatSourceMode = chatSourceModeAtom[1]
  const queryClient = useQueryClient()

  const importMutation = useMutation(() => ({
    mutationFn: (input: Parameters<typeof desktopRpc.sandboxImport.importSandboxChat.mutate>[0]) =>
      desktopRpc.sandboxImport.importSandboxChat.mutate(input),
    onSuccess: (result) => {
      toast.success("Opened locally")
      setChatSourceMode("local")
      setSelectedChatId(result.chatId)
      queryClient.invalidateQueries({ queryKey: ["chats", "list"] })
    },
    onError: (error: Error) => {
      toast.error(`Import failed: ${error.message}`)
    },
  }))

  const getMatchingProjects = (projects: Project[], remoteChat: RemoteChat): Project[] => {
    console.log(`[OPEN-LOCALLY-MATCH] ========== MATCHING DEBUG ==========`)
    console.log(`[OPEN-LOCALLY-MATCH] Remote chat:`, {
      id: remoteChat.id,
      name: remoteChat.name,
      meta: remoteChat.meta,
    })

    if (!remoteChat.meta?.repository) {
      console.log(`[OPEN-LOCALLY-MATCH] No repository in meta, returning []`)
      return []
    }

    const [owner, repo] = remoteChat.meta.repository.split("/")
    console.log(`[OPEN-LOCALLY-MATCH] Looking for: owner="${owner}", repo="${repo}"`)

    console.log(`[OPEN-LOCALLY-MATCH] All projects (${projects.length}):`)
    projects.forEach((p, i) => {
      console.log(`[OPEN-LOCALLY-MATCH]   ${i + 1}. "${p.name}" at ${p.path}`)
      console.log(`[OPEN-LOCALLY-MATCH]      gitOwner="${p.gitOwner}", gitRepo="${p.gitRepo}"`)
      console.log(`[OPEN-LOCALLY-MATCH]      matches: ${p.gitOwner === owner && p.gitRepo === repo}`)
    })

    const matches = projects.filter((p) => p.gitOwner === owner && p.gitRepo === repo)
    console.log(`[OPEN-LOCALLY-MATCH] Found ${matches.length} matching project(s)`)
    console.log(`[OPEN-LOCALLY-MATCH] ========== END MATCHING DEBUG ==========`)

    return matches
  }

  const autoImport = (remoteChat: RemoteChat, project: Project) => {
    if (!remoteChat.sandbox_id) {
      toast.error("This chat has no sandbox to import")
      return
    }
    importMutation.mutate({
      sandboxId: remoteChat.sandbox_id,
      remoteChatId: remoteChat.id,
      projectId: project.id,
      chatName: remoteChat.name,
    })
  }

  return {
    getMatchingProjects,
    autoImport,
    isImporting: importMutation.isPending,
  }
}
