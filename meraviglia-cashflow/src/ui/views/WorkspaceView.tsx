import { useCallback, useEffect, useState } from "react"
import { toUserFacingErrorMessage } from "../../application/toUserFacingErrorMessage"

import { listWorkspaces } from "../../application/workspaceService"
import type { WorkspaceDTO } from "../../application/dto/WorkspaceDTO"
import WorkspaceList from "../components/WorkspaceList"

const WORKSPACE_CONVERTED_EVENT = "workspace:converted"

function WorkspaceView() {
  const [workspaces, setWorkspaces] = useState<WorkspaceDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [highlightWorkspaceId, setHighlightWorkspaceId] = useState<string | null>(null)
  const [conversionMessage, setConversionMessage] = useState<string | null>(null)

  const loadWorkspaces = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const items = await listWorkspaces()
      setWorkspaces(items)
    } catch (error) {
      setErrorMessage(toUserFacingErrorMessage(error, "Unable to load workspaces"))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadWorkspaces()

    const handleWorkspaceConverted = (event: Event) => {
      const convertedEvent = event as CustomEvent<{ id: string; workspace_name: string }>
      if (convertedEvent.detail?.id) {
        setHighlightWorkspaceId(convertedEvent.detail.id)
      }
      if (convertedEvent.detail?.workspace_name) {
        setConversionMessage(`Workspace ready: "${convertedEvent.detail.workspace_name}". Add relationships, then record events.`)
      }
      void loadWorkspaces()
    }

    window.addEventListener(WORKSPACE_CONVERTED_EVENT, handleWorkspaceConverted)

    return () => {
      window.removeEventListener(WORKSPACE_CONVERTED_EVENT, handleWorkspaceConverted)
    }
  }, [loadWorkspaces])

  return (
    <section id="workspaces-section" style={{ marginTop: 24 }}>
      <h2>Workspaces</h2>
      <p style={{ marginTop: 0, color: "#444" }}>
        Step 2 — Workspace is your operating context for relationships and event history.
      </p>
      {conversionMessage ? <p style={{ color: "green" }}>{conversionMessage}</p> : null}
      {isLoading ? <p>Loading workspaces...</p> : null}
      {!isLoading ? <p style={{ color: "#555" }}>Progress: {workspaces.length} workspace context{workspaces.length === 1 ? "" : "s"} available.</p> : null}
      {!isLoading && workspaces.length === 0 ? <p>No workspaces found yet. Convert an intake to create your first workspace context.</p> : null}
      {!isLoading && workspaces.length > 0 ? <WorkspaceList workspaces={workspaces} highlightWorkspaceId={highlightWorkspaceId} /> : null}
      {errorMessage ? <p style={{ color: "crimson" }}>{errorMessage}</p> : null}
    </section>
  )
}

export default WorkspaceView
