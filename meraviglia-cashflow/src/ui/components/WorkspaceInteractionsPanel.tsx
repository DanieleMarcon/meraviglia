import { useCallback, useEffect, useState } from "react"

import { listContactsByWorkspace } from "../../application/contactService"
import { listInteractionsByWorkspace, updateInteractionStatus } from "../../application/interactionService"
import type { ContactDTO } from "../../application/dto/ContactDTO"
import type { InteractionDTO } from "../../application/dto/InteractionDTO"
import InteractionForm from "./InteractionForm"
import InteractionList from "./InteractionList"

type WorkspaceInteractionsPanelProps = {
  workspaceId: string
}

function WorkspaceInteractionsPanel({ workspaceId }: WorkspaceInteractionsPanelProps) {
  const [contacts, setContacts] = useState<ContactDTO[]>([])
  const [interactions, setInteractions] = useState<InteractionDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const [workspaceContacts, workspaceInteractions] = await Promise.all([
        listContactsByWorkspace(workspaceId),
        listInteractionsByWorkspace(workspaceId),
      ])

      setContacts(workspaceContacts)
      setInteractions(workspaceInteractions)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to load interactions")
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

    try {
      await updateInteractionStatus(interactionId, { status, expected_updated_at: expectedUpdatedAt })
      await loadData()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to update interaction")
      if (error instanceof Error && error.message.includes("updated elsewhere")) {
        await loadData()
      }
    }
  }

  const hasNoContacts = !isLoading && contacts.length === 0

  return (
    <section style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #eee" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <h4 style={{ margin: 0 }}>Interactions</h4>
        <button type="button" onClick={() => setIsCreateOpen(true)}>New interaction</button>
      </div>

      {isCreateOpen ? (
        <InteractionForm
          workspaceId={workspaceId}
          contacts={contacts}
          onCreated={loadData}
          onCancel={() => setIsCreateOpen(false)}
        />
      ) : null}

      {isLoading ? <p>Loading interactions...</p> : null}

      {!isLoading && interactions.length === 0 ? (
        <div style={{ border: "1px dashed #ccc", borderRadius: 4, padding: 8, marginBottom: 8 }}>
          <p style={{ margin: "0 0 4px" }}><strong>No interactions yet</strong></p>
          <p style={{ margin: "0 0 8px" }}>Track planned calls, meetings, and follow-ups for this workspace.</p>
          <button type="button" onClick={() => setIsCreateOpen(true)}>Create first interaction</button>
        </div>
      ) : null}

      {hasNoContacts ? (
        <p style={{ color: "#555" }}>You need at least one contact before creating an interaction.</p>
      ) : null}

      {!isLoading && interactions.length > 0 ? (
        <InteractionList interactions={interactions} contacts={contacts} onStatusChange={handleStatusChange} onEdited={loadData} />
      ) : null}
      {errorMessage ? <p style={{ color: "crimson" }}>{errorMessage}</p> : null}
    </section>
  )
}

export default WorkspaceInteractionsPanel
