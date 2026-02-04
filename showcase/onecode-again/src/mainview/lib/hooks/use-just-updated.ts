import { onMount, batch } from "solid-js"
import { justUpdatedAtom, justUpdatedVersionAtom } from "../atoms"

const LAST_VERSION_KEY = "app:last-version"

/**
 * Hook to detect if app was just updated
 * Compares current version with stored version and shows "What's New" banner
 */
export function useJustUpdated() {
  const [justUpdated, setJustUpdated] = justUpdatedAtom
  const [justUpdatedVersion, setJustUpdatedVersion] = justUpdatedVersionAtom

  // Check for update on mount
  onMount(() => {
    const checkForUpdate = async () => {
      const api = window.desktopApi
      if (!api) return

      try {
        const currentVersion = await api.getVersion()
        const lastVersion = localStorage.getItem(LAST_VERSION_KEY)

        // If this is first launch or version changed, show "What's New"
        if (lastVersion && lastVersion !== currentVersion) {
          batch(() => {
            setJustUpdated(true)
            setJustUpdatedVersion(currentVersion)
          })
        }

        // Always update stored version
        localStorage.setItem(LAST_VERSION_KEY, currentVersion)
      } catch (error) {
        console.error("[JustUpdated] Error checking version:", error)
      }
    }

    checkForUpdate()
  })

  // Dismiss the "What's New" banner
  const dismissJustUpdated = () => {
    batch(() => {
      setJustUpdated(false)
      setJustUpdatedVersion(null)
    })
  }

  // Open changelog in browser
  const openChangelog = () => {
    const api = window.desktopApi
    if (api) {
      // Link to changelog with anchor to current version
      const version = justUpdatedVersion() ? `#v${justUpdatedVersion()}` : ""
      api.openExternal(`https://1code.dev/changelog${version}`)
    }
    dismissJustUpdated()
  }

  return {
    justUpdated,
    justUpdatedVersion,
    dismissJustUpdated,
    openChangelog,
  }
}
