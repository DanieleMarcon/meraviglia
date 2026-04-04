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
}

function WorkspaceInteractionsPanel({ workspaceId, contacts, isContactsLoading, isContactsReady }: WorkspaceInteractionsPanelProps) {
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
      setFeedbackMessage(`Event status is now ${status}. This update is recorded in workspace history below for reliable follow-through.`)
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
    setFeedbackMessage("Interaction event recorded. Review it below to confirm timing, participants, and next follow-up state.")
  }

  return (
    <section style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #eee" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <h4 style={{ margin: 0 }}>Interactions</h4>
        <button type="button" onClick={() => setIsCreateOpen(true)} disabled={isContactsLoading || isCreateBlocked}>New interaction</button>
      </div>
      <p style={{ marginTop: 0, color: "#555" }}>Step 4 — Interactions are your event history for this workspace context.</p>
      {!isLoading ? (
        <p style={{ color: "#555" }}>
          {!hasRelationships
            ? "Current state: history is blocked until the first relationship exists."
            : !hasEventHistory
              ? "Current state: relationship context exists, but history has not started yet."
              : "Current state: recorded events are building reliable workspace history."}
        </p>
      ) : null}
      {!isLoading ? (
        <p style={{ color: "#555" }}>
          Why this matters: {!hasRelationships
            ? "without relationship and event context, follow-up decisions stay fragile."
            : !hasEventHistory
              ? "until the first event is logged, follow-up decisions rely on memory."
              : "history makes follow-up decisions faster and easier to trust."}
        </p>
      ) : null}
      {!isLoading ? (
        <p style={{ color: "#555" }}>
          Next action: {!hasRelationships
            ? "add the first relationship."
            : !hasEventHistory
              ? "log the first event."
              : "keep event history current."}
        </p>
      ) : null}
      {!isLoading ? <p style={{ color: "#555" }}>Recency signal: {hasRecentInteractions ? "Event history is active this week." : "No recent interactions this week yet."}</p> : null}
      {isContactsLoading ? <p style={{ color: "#555" }}>Action status: create interaction is temporarily blocked while relationships are loading.</p> : null}
      {!isContactsLoading && !isCreateBlocked ? <p style={{ color: "#555" }}>Action status: create interaction is enabled.</p> : null}

      {isCreateOpen && canRenderContactDependentUi ? (
        <InteractionForm
          workspaceId={workspaceId}
          contacts={contacts}
          onCreated={handleCreated}
          onCancel={() => setIsCreateOpen(false)}
        />
      ) : null}

      {isCreateOpen && !canRenderContactDependentUi ? <p>Loading contacts before creating interaction...</p> : null}

      {isLoading ? <p>Loading interactions...</p> : null}

      {!isLoading && interactions.length === 0 ? (
        <div style={{ border: "1px dashed #ccc", borderRadius: 4, padding: 8, marginBottom: 8 }}>
          <p style={{ margin: "0 0 4px" }}><strong>No interactions yet</strong></p>
          <p style={{ margin: "0 0 8px" }}>Start a usable historical record by logging the first planned call, meeting, or follow-up.</p>
          <button type="button" onClick={() => setIsCreateOpen(true)} disabled={isContactsLoading || isCreateBlocked}>Create first interaction</button>
        </div>
      ) : null}

      {hasNoContacts ? (
        <p style={{ color: "#555" }}>Interaction creation is blocked: no relationships exist yet. Add at least one contact above, then log the first event.</p>
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
