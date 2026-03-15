import type { ContactDTO } from "../../application/dto/ContactDTO"
import type { InteractionDTO } from "../../application/dto/InteractionDTO"

type InteractionListProps = {
  interactions: InteractionDTO[]
  contacts: ContactDTO[]
  onComplete: (interactionId: string) => Promise<void>
  onCancel: (interactionId: string) => Promise<void>
}

const resolveParticipants = (participantIds: string[], contacts: ContactDTO[]): string => {
  const names = contacts
    .filter((contact) => participantIds.includes(contact.id))
    .map((contact) => `${contact.first_name} ${contact.last_name}`)

  if (names.length > 0) {
    return names.join(", ")
  }

  return "-"
}

function InteractionList({ interactions, contacts, onComplete, onCancel }: InteractionListProps) {
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
      {interactions.map((interaction) => (
        <li key={interaction.id} style={{ border: "1px solid #ddd", borderRadius: 4, padding: 8, marginBottom: 8 }}>
          <p><strong>Type:</strong> {interaction.type}</p>
          <p><strong>Scheduled:</strong> {new Date(interaction.scheduled_at).toLocaleString()}</p>
          <p><strong>Status:</strong> {interaction.status}</p>
          <p><strong>Participants:</strong> {resolveParticipants(interaction.participant_contact_ids, contacts)}</p>
          {interaction.status === "planned" ? (
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" onClick={() => void onComplete(interaction.id)}>Mark completed</button>
              <button type="button" onClick={() => void onCancel(interaction.id)}>Cancel</button>
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  )
}

export default InteractionList
