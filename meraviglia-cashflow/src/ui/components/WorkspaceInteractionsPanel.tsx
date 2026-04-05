import { useCallback, useEffect, useState } from "react"
import { toUserFacingErrorMessage } from "../../application/toUserFacingErrorMessage"

import { STALE_INTERACTION_UPDATE_MESSAGE, listInteractionsByWorkspace, updateInteractionStatus } from "../../application/interactionService"
import type { ContactDTO } from "../../application/dto/ContactDTO"
import type { InteractionDTO } from "../../application/dto/InteractionDTO"
import InteractionForm from "./InteractionForm"
import InteractionList from "./InteractionList"

type WorkspaceInteractionsPanelProps = {
  workspaceId: string
  contacts: ContactDTO[]
  isContactsLoading: boolean
  isContactsReady: boolean
  onRequestAddContact: () => void
}

function WorkspaceInteractionsPanel({ workspaceId, contacts, isContactsLoading, isContactsReady, onRequestAddContact }: WorkspaceInteractionsPanelProps) {
  const [interactions, setInteractions] = useState<InteractionDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const workspaceInteractions = await listInteractionsByWorkspace(workspaceId)
      setInteractions(workspaceInteractions)
    } catch (error) {
      setErrorMessage(toUserFacingErrorMessage(error, "Unable to load interactions"))
    } finally {
      setIsLoading(false)
    }
  }, [workspaceId])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const handleStatusChange = async (
    interactionId: string,
    status: InteractionDTO["status"],
    expectedUpdatedAt: string,
  ) => {
    setErrorMessage(null)
    setFeedbackMessage(null)

    try {
      await updateInteractionStatus(interactionId, { status, expected_updated_at: expectedUpdatedAt })
      await loadData()
      setFeedbackMessage(`Interaction marked as ${status}.`)
    } catch (error) {
      setErrorMessage(toUserFacingErrorMessage(error, "Unable to update interaction"))
      if (toUserFacingErrorMessage(error, "Unable to update interaction") === STALE_INTERACTION_UPDATE_MESSAGE) {
        await loadData()
      }
    }
  }

  const hasNoContacts = !isLoading && isContactsReady && contacts.length === 0
  const canRenderContactDependentUi = isContactsReady
  const isCreateBlocked = isContactsReady && contacts.length === 0
  const hasRelationships = contacts.length > 0
  const hasEventHistory = interactions.length > 0
  const hasRecentInteractions = interactions.some((interaction) => {
    return Date.now() - new Date(interaction.scheduled_at).getTime() <= 7 * 24 * 60 * 60 * 1000
  })

  const handleCreated = async () => {
    await loadData()
    setIsCreateOpen(false)
    setFeedbackMessage("Interaction saved.")
  }

  return (
    <section style={{ padding: 12, border: "1px solid #eee", borderRadius: 6, background: "#fcfcfc" }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
        <h4 style={{ margin: 0 }}>Interactions</h4>
        <button type="button" onClick={() => setIsCreateOpen(true)} disabled={isContactsLoading || isCreateBlocked}>New interaction</button>
      </div>
      <p style={{ marginTop: 0, color: "#555" }}>Step 4 — Interactions are the running history of what happened in this workspace.</p>
      {!isLoading ? (
        <p style={{ color: "#555" }}>
          {!hasRelationships
            ? "add the first relationship."
            : !hasEventHistory
              ? "log the first event."
              : "keep history current."}
        </p>
      ) : null}
      {!isLoading ? <p style={{ color: "#555" }}>{hasRecentInteractions ? "Active this week." : "No interactions in the last 7 days."}</p> : null}

      {isCreateOpen && canRenderContactDependentUi ? (
        <InteractionForm
          workspaceId={workspaceId}
          contacts={contacts}
          onCreated={handleCreated}
          onCancel={() => setIsCreateOpen(false)}
          onRequestAddContact={onRequestAddContact}
        />
      ) : null}

      {isCreateOpen && !canRenderContactDependentUi ? <p>Loading contacts before creating interaction...</p> : null}

      {isLoading ? <p>Loading interactions...</p> : null}

      {!isLoading && interactions.length === 0 ? (
        <div style={{ border: "1px dashed #ccc", borderRadius: 4, padding: 8, marginBottom: 8 }}>
          <p style={{ margin: "0 0 4px" }}><strong>No interactions yet</strong></p>
          <p style={{ margin: "0 0 8px" }}>Log the first call, meeting, or follow-up.</p>
          <button type="button" onClick={() => setIsCreateOpen(true)} disabled={isContactsLoading || isCreateBlocked}>Create first interaction</button>
        </div>
      ) : null}

      {hasNoContacts ? (
        <div style={{ marginBottom: 8, border: "1px solid #e6a23c", borderRadius: 6, background: "#fff8e8", padding: 8 }}>
          <p style={{ margin: "0 0 6px", color: "#5c4500" }}>Interaction creation is blocked: no contacts exist in this workspace yet.</p>
          <button type="button" onClick={onRequestAddContact}>
            Add contact now
          </button>
        </div>
      ) : null}

      {!isLoading && interactions.length > 0 && canRenderContactDependentUi ? (
        <InteractionList interactions={interactions} contacts={contacts} onStatusChange={handleStatusChange} onEdited={loadData} />
      ) : null}

      {!isLoading && interactions.length > 0 && !canRenderContactDependentUi ? <p>Loading contacts...</p> : null}
      {feedbackMessage ? <p style={{ color: "green" }}>{feedbackMessage}</p> : null}
      {errorMessage ? <p style={{ color: "crimson" }}>{errorMessage}</p> : null}
    </section>
  )
}

export default WorkspaceInteractionsPanel
