import { useEffect, useState } from "react"

import { listWorkspaces } from "../../application/workspaceService"
import type { WorkspaceDTO } from "../../application/dto/WorkspaceDTO"
import WorkspaceList from "../components/WorkspaceList"

function WorkspaceView() {
  const [workspaces, setWorkspaces] = useState<WorkspaceDTO[]>([])

  useEffect(() => {
    const loadWorkspaces = async () => {
      const items = await listWorkspaces()
      setWorkspaces(items)
    }

    void loadWorkspaces()
  }, [])

  return (
    <section style={{ marginTop: 24 }}>
      <h2>Workspaces</h2>
      {workspaces.length === 0 ? <p>No workspaces found.</p> : <WorkspaceList workspaces={workspaces} />}
    </section>
  )
}

export default WorkspaceView
