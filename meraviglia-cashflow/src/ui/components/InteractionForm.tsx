import { type FormEvent, useState } from "react"

import { createInteraction } from "../../application/interactionService"
import { localDateTimeInputToIso } from "../../shared/utils/interactionDateTime"
import type { ContactDTO } from "../../application/dto/ContactDTO"

type InteractionTypeOption = "meeting" | "call" | "follow_up"

type InteractionFormProps = {
  workspaceId: string
  contacts: ContactDTO[]
  onCreated: () => Promise<void>
  onCancel: () => void
}

function InteractionForm({ workspaceId, contacts, onCreated, onCancel }: InteractionFormProps) {
  const [type, setType] = useState<InteractionTypeOption>("meeting")
  const [scheduledAt, setScheduledAt] = useState("")
  const [notes, setNotes] = useState("")
  const [participantIds, setParticipantIds] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const toggleParticipant = (contactId: string, checked: boolean) => {
    if (checked) {
      setParticipantIds((current) => [...new Set([...current, contactId])])
      return
    }

    setParticipantIds((current) => current.filter((id) => id !== contactId))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const scheduledAtIso = localDateTimeInputToIso(scheduledAt)

      await createInteraction({
        workspace_id: workspaceId,
        type,
        scheduled_at: scheduledAtIso,
        notes,
        participant_contact_ids: participantIds,
      })

      setType("meeting")
      setScheduledAt("")
      setNotes("")
      setParticipantIds([])
      await onCreated()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to create interaction")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 12, border: "1px solid #ddd", borderRadius: 4, padding: 8 }}>
      <p style={{ marginBottom: 8 }}><strong>New interaction</strong></p>
      <label style={{ display: "block", marginBottom: 8 }}>
        Type
        <select value={type} onChange={(event) => setType(event.target.value as InteractionTypeOption)}>
          <option value="meeting">Meeting</option>
          <option value="call">Call</option>
          <option value="follow_up">Follow-up</option>
        </select>
      </label>
      <label style={{ display: "block", marginBottom: 8 }}>
        Date &amp; time
        <input type="datetime-local" value={scheduledAt} onChange={(event) => setScheduledAt(event.target.value)} required />
      </label>
      <fieldset style={{ marginBottom: 8 }}>
        <legend>Participants</legend>
        {contacts.length === 0 ? <p style={{ margin: 0 }}>You need at least one contact before creating an interaction.</p> : null}
        {contacts.map((contact) => (
          <label key={contact.id} style={{ display: "block" }}>
            <input
              type="checkbox"
              checked={participantIds.includes(contact.id)}
              onChange={(event) => toggleParticipant(contact.id, event.target.checked)}
            />
            {" "}
            {contact.first_name} {contact.last_name}
          </label>
        ))}
      </fieldset>
      <label style={{ display: "block", marginBottom: 8 }}>
        Notes
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={3}
          placeholder="Optional context for this interaction"
        />
      </label>
      <div style={{ display: "flex", gap: 8 }}>
        <button type="submit" disabled={isSubmitting || contacts.length === 0}>
          {isSubmitting ? "Saving..." : "Save interaction"}
        </button>
        <button type="button" onClick={onCancel} disabled={isSubmitting}>Cancel</button>
      </div>
      {errorMessage ? <p style={{ color: "crimson" }}>{errorMessage}</p> : null}
    </form>
  )
}

export default InteractionForm
