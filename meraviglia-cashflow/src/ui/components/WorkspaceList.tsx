import { useCallback, useEffect, useState } from "react"
import { toUserFacingErrorMessage } from "../../application/toUserFacingErrorMessage"

import { listContactsByWorkspace } from "../../application/contactService"
import { listInteractionsByWorkspace } from "../../application/interactionService"
import type { ContactDTO } from "../../application/dto/ContactDTO"
import type { InteractionDTO } from "../../application/dto/InteractionDTO"
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
  const [interactions, setInteractions] = useState<InteractionDTO[]>([])
  const [isContactsLoading, setIsContactsLoading] = useState(true)
  const [isInteractionsLoading, setIsInteractionsLoading] = useState(true)
  const [contactsErrorMessage, setContactsErrorMessage] = useState<string | null>(null)
  const [interactionsErrorMessage, setInteractionsErrorMessage] = useState<string | null>(null)

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

  const loadInteractionsSummary = useCallback(async () => {
    setIsInteractionsLoading(true)
    setInteractionsErrorMessage(null)

    try {
      const items = await listInteractionsByWorkspace(workspace.id)
      setInteractions(items)
    } catch (error) {
      setInteractionsErrorMessage(toUserFacingErrorMessage(error, "Unable to load interactions"))
    } finally {
      setIsInteractionsLoading(false)
    }
  }, [workspace.id])

  useEffect(() => {
    void loadContacts()
    void loadInteractionsSummary()
  }, [loadContacts, loadInteractionsSummary])

  useEffect(() => {
    if (!isHighlighted) {
      return
    }

    document.getElementById(`workspace-${workspace.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" })
  }, [isHighlighted, workspace.id])

  const isContactsReady = !isContactsLoading
  const usedContactIds = interactions.flatMap((interaction) => interaction.participant_contact_ids)
  const recentInteractions = interactions.filter((interaction) => {
    return Date.now() - new Date(interaction.scheduled_at).getTime() <= 7 * 24 * 60 * 60 * 1000
  })
  const hasRelationships = contacts.length > 0
  const hasEventHistory = interactions.length > 0

  const readinessStatusLabel = !hasRelationships
    ? "Not ready: relationship context missing."
    : !hasEventHistory
      ? "Starting: relationships exist, event history is still thin."
      : "Ready: relationship context and event history are active."

  const readinessSummary = !hasRelationships
    ? "Without a contact, this workspace cannot anchor follow-up continuity."
    : !hasEventHistory
      ? "Relationship context exists, but decisions still rely on memory until the first event is logged."
      : "Recorded events make follow-up decisions faster and more reliable."

  const followUpReadinessHint = !hasRelationships
    ? "Next action: add the first relationship."
    : !hasEventHistory
      ? "Next action: log the first event."
      : "Next action: keep event history current."

  return (
    <li
      id={`workspace-${workspace.id}`}
      style={{
        border: isHighlighted ? "2px solid #2c8a3f" : "1px solid #ddd",
        borderRadius: 8,
        padding: 14,
        marginBottom: 12,
        background: "#fff",
      }}
    >
      <header style={{ marginBottom: 10, paddingBottom: 10, borderBottom: "1px solid #eee" }}>
        <p style={{ margin: "0 0 6px" }}><strong>{workspace.workspace_name}</strong></p>
        <p style={{ margin: "0 0 4px", color: "#555" }}><strong>Slug:</strong> {workspace.workspace_slug}</p>
        <p style={{ margin: "0 0 4px", color: "#555" }}><strong>Created:</strong> {new Date(workspace.created_at).toLocaleString()}</p>
        <p style={{ margin: "0 0 4px", color: "#555" }}>
          Flow status: {contacts.length} relationship{contacts.length === 1 ? "" : "s"}, {interactions.length} event{interactions.length === 1 ? "" : "s"}.
        </p>
        <p style={{ margin: "0 0 4px", color: "#555" }}>{readinessStatusLabel}</p>
        <p style={{ margin: "0 0 4px", color: "#555" }}>Why this matters now: {readinessSummary}</p>
        <p style={{ margin: 0, color: "#555" }}>{followUpReadinessHint}</p>
        {!isInteractionsLoading ? (
          <p style={{ margin: "6px 0 0", color: "#555" }}>
            Recency: {recentInteractions.length === 0 ? "No events recorded in the last 7 days." : `${recentInteractions.length} recorded in the last 7 days.`}
          </p>
        ) : null}
      </header>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 12 }}>
        <WorkspaceContactsPanel
          workspaceId={workspace.id}
          contacts={contacts}
          usedContactIds={usedContactIds}
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
      </div>
      {interactionsErrorMessage ? <p style={{ color: "crimson" }}>{interactionsErrorMessage}</p> : null}
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
