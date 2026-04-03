import { useCallback, useEffect, useState } from "react"

import { listContactsByWorkspace } from "../../application/contactService"
import type { ContactDTO } from "../../application/dto/ContactDTO"
import type { WorkspaceDTO } from "../../application/dto/WorkspaceDTO"
import WorkspaceContactsPanel from "./WorkspaceContactsPanel"
import WorkspaceInteractionsPanel from "./WorkspaceInteractionsPanel"

type WorkspaceListProps = {
  workspaces: WorkspaceDTO[]
}

type WorkspaceListItemProps = {
  workspace: WorkspaceDTO
}

function WorkspaceListItem({ workspace }: WorkspaceListItemProps) {
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
      setContactsErrorMessage(error instanceof Error ? error.message : "Unable to load contacts")
    } finally {
      setIsContactsLoading(false)
    }
  }, [workspace.id])

  useEffect(() => {
    void loadContacts()
  }, [loadContacts])

  const isContactsReady = !isContactsLoading

  return (
    <li
      style={{ border: "1px solid #ddd", borderRadius: 4, padding: 12, marginBottom: 8 }}
    >
      <p><strong>Name:</strong> {workspace.workspace_name}</p>
      <p><strong>Slug:</strong> {workspace.workspace_slug}</p>
      <p><strong>Created:</strong> {new Date(workspace.created_at).toLocaleString()}</p>
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

function WorkspaceList({ workspaces }: WorkspaceListProps) {
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
      {workspaces.map((workspace) => (
        <WorkspaceListItem key={workspace.id} workspace={workspace} />
      ))}
    </ul>
  )
}

export default WorkspaceList
