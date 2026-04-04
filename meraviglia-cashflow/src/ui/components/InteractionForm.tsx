import { type FormEvent, useState } from "react"
import { toUserFacingErrorMessage } from "../../application/toUserFacingErrorMessage"

import { createInteraction } from "../../application/interactionService"
import { localDateTimeInputToIso } from "../../shared/utils/interactionDateTime"
import type { ContactDTO } from "../../application/dto/ContactDTO"

type InteractionTypeOption = "meeting" | "call" | "follow_up"

type InteractionFormProps = {
  workspaceId: string
  contacts: ContactDTO[]
  onCreated: () => Promise<void>
  onCancel: () => void
  onRequestAddContact: () => void
}

function InteractionForm({ workspaceId, contacts, onCreated, onCancel, onRequestAddContact }: InteractionFormProps) {
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

    if (participantIds.length === 0) {
      setErrorMessage("Choose at least one contact.")
      return
    }

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
      setErrorMessage(toUserFacingErrorMessage(error, "Unable to create interaction"))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 12, border: "1px solid #ddd", borderRadius: 4, padding: 8 }}>
      <p style={{ marginBottom: 8 }}><strong>New interaction</strong></p>
      <p style={{ marginTop: 0, color: "#555" }}>Log the call, meeting, or follow-up.</p>
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
        <legend>Relationship participants</legend>
        {contacts.length === 0 ? <p style={{ margin: 0 }}>No contacts yet.</p> : null}
        {contacts.length > 0 ? <p style={{ margin: "0 0 6px", color: "#555" }}>Pick the contacts involved in this interaction.</p> : null}
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
          {isSubmitting ? "Saving..." : "Record interaction event"}
        </button>
        <button type="button" onClick={onCancel} disabled={isSubmitting}>Cancel</button>
      </div>
      {contacts.length === 0 ? (
        <div style={{ marginTop: 8, border: "1px solid #e6a23c", borderRadius: 6, background: "#fff8e8", padding: 8 }}>
          <p style={{ color: "#5c4500", margin: "0 0 6px" }}>
            Interaction is blocked: no contact is available yet.
          </p>
          <button type="button" onClick={onRequestAddContact} disabled={isSubmitting}>
            Add contact now
          </button>
        </div>
      ) : null}
      {errorMessage ? <p style={{ color: "crimson" }}>{errorMessage}</p> : null}
    </form>
  )
}

export default InteractionForm
