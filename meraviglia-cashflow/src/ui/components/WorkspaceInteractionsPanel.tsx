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

  const handleComplete = async (interactionId: string) => {
    setErrorMessage(null)

    try {
      await updateInteractionStatus(interactionId, { status: "completed" })
      await loadData()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to update interaction")
    }
  }

  const handleCancel = async (interactionId: string) => {
    setErrorMessage(null)

    try {
      await updateInteractionStatus(interactionId, { status: "cancelled" })
      await loadData()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to update interaction")
    }
  }

  return (
    <section style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #eee" }}>
      <h4>Interactions</h4>
      <InteractionForm workspaceId={workspaceId} contacts={contacts} onCreated={loadData} />
      {isLoading ? <p>Loading interactions...</p> : null}
      {!isLoading && interactions.length === 0 ? <p>No interactions found for this workspace.</p> : null}
      {!isLoading && interactions.length > 0 ? (
        <InteractionList interactions={interactions} contacts={contacts} onComplete={handleComplete} onCancel={handleCancel} />
      ) : null}
      {errorMessage ? <p style={{ color: "crimson" }}>{errorMessage}</p> : null}
    </section>
  )
}

export default WorkspaceInteractionsPanel
