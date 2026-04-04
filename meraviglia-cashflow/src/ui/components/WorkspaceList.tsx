import { useCallback, useEffect, useState } from "react"
import { toUserFacingErrorMessage } from "../../application/toUserFacingErrorMessage"

import { listContactsByWorkspace } from "../../application/contactService"
import type { ContactDTO } from "../../application/dto/ContactDTO"
import type { WorkspaceDTO } from "../../application/dto/WorkspaceDTO"
import WorkspaceContactsPanel from "./WorkspaceContactsPanel"
import WorkspaceInteractionsPanel from "./WorkspaceInteractionsPanel"

type WorkspaceListProps = {
  workspaces: WorkspaceDTO[]
  highlightWorkspaceId: string | null
}

type WorkspaceListItemProps = {
  workspace: WorkspaceDTO
  isHighlighted: boolean
}

function WorkspaceListItem({ workspace, isHighlighted }: WorkspaceListItemProps) {
  const [contacts, setContacts] = useState<ContactDTO[]>([])
  const [isContactsLoading, setIsContactsLoading] = useState(true)
  const [contactsErrorMessage, setContactsErrorMessage] = useState<string | null>(null)

  const loadContacts = useCallback(async () => {
    setIsContactsLoading(true)
    setContactsErrorMessage(null)

    try {
      const items = await listContactsByWorkspace(workspace.id)
      setContacts(items)
    } catch (error) {
      setContactsErrorMessage(toUserFacingErrorMessage(error, "Unable to load contacts"))
    } finally {
      setIsContactsLoading(false)
    }
  }, [workspace.id])

  useEffect(() => {
    void loadContacts()
  }, [loadContacts])

  useEffect(() => {
    if (!isHighlighted) {
      return
    }

    document.getElementById(`workspace-${workspace.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" })
  }, [isHighlighted, workspace.id])

  const isContactsReady = !isContactsLoading

  return (
    <li
      id={`workspace-${workspace.id}`}
      style={{ border: isHighlighted ? "2px solid #2c8a3f" : "1px solid #ddd", borderRadius: 4, padding: 12, marginBottom: 8 }}
    >
      <p><strong>Name:</strong> {workspace.workspace_name}</p>
      <p><strong>Slug:</strong> {workspace.workspace_slug}</p>
      <p><strong>Created:</strong> {new Date(workspace.created_at).toLocaleString()}</p>
      <p style={{ color: "#555", marginTop: 0 }}>
        Flow status: {contacts.length} relationship{contacts.length === 1 ? "" : "s"} linked in this context.
      </p>
      <WorkspaceContactsPanel
        workspaceId={workspace.id}
        contacts={contacts}
        isContactsReady={isContactsReady}
        errorMessage={contactsErrorMessage}
        onChanged={loadContacts}
      />
      <WorkspaceInteractionsPanel
        workspaceId={workspace.id}
        contacts={contacts}
        isContactsLoading={isContactsLoading}
        isContactsReady={isContactsReady}
      />
    </li>
  )
}

function WorkspaceList({ workspaces, highlightWorkspaceId }: WorkspaceListProps) {
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
      {workspaces.map((workspace) => (
        <WorkspaceListItem key={workspace.id} workspace={workspace} isHighlighted={highlightWorkspaceId === workspace.id} />
      ))}
    </ul>
  )
}

export default WorkspaceList
