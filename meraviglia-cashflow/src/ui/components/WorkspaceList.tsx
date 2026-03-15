import type { WorkspaceDTO } from "../../application/dto/WorkspaceDTO"
import WorkspaceContactsPanel from "./WorkspaceContactsPanel"
import WorkspaceInteractionsPanel from "./WorkspaceInteractionsPanel"

type WorkspaceListProps = {
  workspaces: WorkspaceDTO[]
}

function WorkspaceList({ workspaces }: WorkspaceListProps) {
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
      {workspaces.map((workspace) => (
        <li
          key={workspace.id}
          style={{ border: "1px solid #ddd", borderRadius: 4, padding: 12, marginBottom: 8 }}
        >
          <p><strong>Name:</strong> {workspace.workspace_name}</p>
          <p><strong>Slug:</strong> {workspace.workspace_slug}</p>
          <p><strong>Created:</strong> {new Date(workspace.created_at).toLocaleString()}</p>
          <WorkspaceContactsPanel workspaceId={workspace.id} />
          <WorkspaceInteractionsPanel workspaceId={workspace.id} />
        </li>
      ))}
    </ul>
  )
}

export default WorkspaceList
