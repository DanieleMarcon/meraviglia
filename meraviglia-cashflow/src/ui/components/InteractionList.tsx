import { useMemo, useState } from "react"

import { updateInteraction } from "../../application/interactionService"
import { formatIsoToLocalDateTimeInput, localDateTimeInputToIso } from "../../shared/utils/interactionDateTime"
import type { ContactDTO } from "../../application/dto/ContactDTO"
import type { InteractionDTO } from "../../application/dto/InteractionDTO"

type InteractionListProps = {
  interactions: InteractionDTO[]
  contacts: ContactDTO[]
  onStatusChange: (interactionId: string, status: InteractionDTO["status"], expectedUpdatedAt: string) => Promise<void>
  onEdited: () => Promise<void>
}

type EditDraft = {
  type: InteractionDTO["type"]
  scheduledAt: string
  notes: string
  participantIds: string[]
  expectedUpdatedAt: string
}

const TYPE_LABELS: Record<InteractionDTO["type"], string> = {
  meeting: "Meeting",
  call: "Call",
  follow_up: "Follow-up",
}

const STATUS_LABELS: Record<InteractionDTO["status"], string> = {
  planned: "Planned",
  completed: "Completed",
  canceled: "Canceled",
}

const resolveParticipants = (participantIds: string[], contacts: ContactDTO[]): string => {
  const names = participantIds.map((id) => {
    const contact = contacts.find((item) => item.id === id)
    return contact ? `${contact.first_name} ${contact.last_name}` : "Removed contact"
  })

  return names.length > 0 ? names.join(", ") : "Removed contact"
}

function InteractionList({ interactions, contacts, onStatusChange, onEdited }: InteractionListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<EditDraft | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const orderedInteractions = useMemo(() => {
    return [...interactions].sort((left, right) => {
      const scheduledDelta = new Date(right.scheduled_at).getTime() - new Date(left.scheduled_at).getTime()
      if (scheduledDelta !== 0) {
        return scheduledDelta
      }

      return new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
    })
  }, [interactions])

  const beginEdit = (interaction: InteractionDTO) => {
    const datetimeValue = formatIsoToLocalDateTimeInput(interaction.scheduled_at)
    setEditingId(interaction.id)
    setDraft({
      type: interaction.type,
      scheduledAt: datetimeValue,
      notes: interaction.notes ?? "",
      participantIds: interaction.participant_contact_ids,
      expectedUpdatedAt: interaction.updated_at,
    })
    setErrorMessage(null)
  }

  const toggleDraftParticipant = (contactId: string, checked: boolean) => {
    setDraft((current) => {
      if (!current) {
        return current
      }

      if (checked) {
        return { ...current, participantIds: [...new Set([...current.participantIds, contactId])] }
      }

      return { ...current, participantIds: current.participantIds.filter((id) => id !== contactId) }
    })
  }

  const saveEdit = async (interactionId: string) => {
    if (!draft) {
      return
    }

    setIsSaving(true)
    setErrorMessage(null)

    try {
      await updateInteraction(interactionId, {
        type: draft.type,
        scheduled_at: localDateTimeInputToIso(draft.scheduledAt),
        notes: draft.notes,
        participant_contact_ids: draft.participantIds,
        expected_updated_at: draft.expectedUpdatedAt,
      })
      setEditingId(null)
      setDraft(null)
      await onEdited()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to edit interaction")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {orderedInteractions.map((interaction) => {
          const isEditing = editingId === interaction.id && draft

          return (
            <li key={interaction.id} style={{ border: "1px solid #ddd", borderRadius: 4, padding: 8, marginBottom: 8 }}>
                  {isEditing ? (
                    <div>
                      <label style={{ display: "block" }}>
                        Type
                        <select value={draft.type} onChange={(event) => setDraft({ ...draft, type: event.target.value as InteractionDTO["type"] })}>
                          <option value="meeting">Meeting</option>
                          <option value="call">Call</option>
                          <option value="follow_up">Follow-up</option>
                        </select>
                      </label>
                      <label style={{ display: "block" }}>
                        Date &amp; time
                        <input
                          type="datetime-local"
                          value={draft.scheduledAt}
                          onChange={(event) => setDraft({ ...draft, scheduledAt: event.target.value })}
                        />
                      </label>
                      <fieldset>
                        <legend>Participants</legend>
                        {contacts.map((contact) => (
                          <label key={contact.id} style={{ display: "block" }}>
                            <input
                              type="checkbox"
                              checked={draft.participantIds.includes(contact.id)}
                              onChange={(event) => toggleDraftParticipant(contact.id, event.target.checked)}
                            />
                            {" "}
                            {contact.first_name} {contact.last_name}
                          </label>
                        ))}
                      </fieldset>
                      <label style={{ display: "block" }}>
                        Notes
                        <textarea value={draft.notes} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} rows={2} />
                      </label>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button type="button" onClick={() => void saveEdit(interaction.id)} disabled={isSaving}>Save interaction</button>
                        <button type="button" onClick={() => { setEditingId(null); setDraft(null) }} disabled={isSaving}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p><strong>Type:</strong> {TYPE_LABELS[interaction.type]}</p>
                      <p><strong>Date &amp; time:</strong> {new Date(interaction.scheduled_at).toLocaleString()}</p>
                      <p><strong>Status:</strong> {STATUS_LABELS[interaction.status]}</p>
                      <p><strong>Participants:</strong> {resolveParticipants(interaction.participant_contact_ids, contacts)}</p>
                      {interaction.notes ? <p><strong>Notes:</strong> {interaction.notes}</p> : null}
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {interaction.status === "planned" ? (
                          <>
                            <button
                              type="button"
                              onClick={() => void onStatusChange(interaction.id, "completed", interaction.updated_at)}
                            >
                              Mark completed
                            </button>
                            <button
                              type="button"
                              onClick={() => void onStatusChange(interaction.id, "canceled", interaction.updated_at)}
                            >
                              Cancel interaction
                            </button>
                          </>
                        ) : (
                          <button type="button" onClick={() => void onStatusChange(interaction.id, "planned", interaction.updated_at)}>
                            Reopen
                          </button>
                        )}
                        <button type="button" onClick={() => beginEdit(interaction)}>Edit</button>
                      </div>
                    </>
                  )}
            </li>
          )
        })}
      </ul>
      {errorMessage ? <p style={{ color: "crimson" }}>{errorMessage}</p> : null}
    </div>
  )
}

export default InteractionList
