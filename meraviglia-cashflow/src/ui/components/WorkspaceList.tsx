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
    ? "Readiness status: not ready for follow-up continuity yet."
    : !hasEventHistory
      ? "Readiness status: relationships are in place, but follow-up history is still thin."
      : "Readiness status: operational history is forming from recorded events."

  const readinessSummary = !hasRelationships
    ? "This workspace exists, but has no relationship context yet. Add the first relationship before event continuity can start."
    : !hasEventHistory
      ? "This workspace has relationship context, but no recorded events yet. Log the first event to make follow-up continuity usable."
      : "This workspace has both relationships and event history. Each new event strengthens continuity for future follow-up decisions."

  const followUpReadinessHint = !hasRelationships
    ? "Next meaningful action: add the first relationship."
    : !hasEventHistory
      ? "Next meaningful action: log the first event."
      : "Next meaningful action: continue building event history."

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
      <p style={{ color: "#555", marginTop: 0 }}>{readinessStatusLabel}</p>
      <p style={{ color: "#555", marginTop: 0 }}>Why this matters now: {readinessSummary}</p>
      <p style={{ color: "#555", marginTop: 0 }}>{followUpReadinessHint}</p>
      {!isInteractionsLoading ? (
        <p style={{ color: "#555", marginTop: 0 }}>
          System signal: {interactions.length} event{interactions.length === 1 ? "" : "s"} in history.
          {recentInteractions.length === 0 ? " No recent interactions in the last 7 days." : ` ${recentInteractions.length} recorded in the last 7 days.`}
        </p>
      ) : null}
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
