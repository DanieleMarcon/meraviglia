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

    const handleWorkspaceConverted = () => {
      void loadWorkspaces()
    }

    window.addEventListener(WORKSPACE_CONVERTED_EVENT, handleWorkspaceConverted)

    return () => {
      window.removeEventListener(WORKSPACE_CONVERTED_EVENT, handleWorkspaceConverted)
    }
  }, [loadWorkspaces])

  return (
    <section style={{ marginTop: 24 }}>
      <h2>Workspaces</h2>
      {isLoading ? <p>Loading workspaces...</p> : null}
      {!isLoading && workspaces.length === 0 ? <p>No workspaces found.</p> : null}
      {!isLoading && workspaces.length > 0 ? <WorkspaceList workspaces={workspaces} /> : null}
      {errorMessage ? <p style={{ color: "crimson" }}>{errorMessage}</p> : null}
    </section>
  )
}

export default WorkspaceView
