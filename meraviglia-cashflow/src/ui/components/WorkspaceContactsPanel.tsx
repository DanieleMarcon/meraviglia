import type { ContactDTO } from "../../application/dto/ContactDTO"
import ContactForm from "./ContactForm"
import ContactList from "./ContactList"

type WorkspaceContactsPanelProps = {
  workspaceId: string
  contacts: ContactDTO[]
  usedContactIds: string[]
  isContactsReady: boolean
  errorMessage: string | null
  onChanged: () => Promise<void>
}

function WorkspaceContactsPanel({ workspaceId, contacts, usedContactIds, isContactsReady, errorMessage, onChanged }: WorkspaceContactsPanelProps) {
  const hasRelationships = contacts.length > 0
  const relationshipsInHistory = contacts.filter((contact) => usedContactIds.includes(contact.id)).length

  return (
    <section style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #eee" }}>
      <h4>Contacts</h4>
      <p style={{ marginTop: 0, color: "#555" }}>Step 3 — Contacts represent the relationships inside this workspace context.</p>
      {isContactsReady ? (
        <p style={{ marginTop: 0, color: "#555" }}>
          Why this matters now: {!hasRelationships
            ? "without at least one relationship, this workspace cannot build usable follow-up continuity."
            : relationshipsInHistory === 0
              ? "relationships exist, but none are linked to events yet."
              : `${relationshipsInHistory} relationship${relationshipsInHistory === 1 ? "" : "s"} already anchor recorded events in workspace history.`}
        </p>
      ) : null}
      <ContactForm workspaceId={workspaceId} onCreated={onChanged} />
      {!isContactsReady ? <p>Loading contacts...</p> : null}
      {isContactsReady && contacts.length === 0 ? (
        <p>No relationships yet. Add your first contact to unlock interaction event tracking.</p>
      ) : null}
      {isContactsReady && contacts.length > 0 ? (
        <p style={{ color: "#555" }}>
          Follow-up readiness: {relationshipsInHistory === 0
            ? "log the first event with one of these relationships."
            : "continue logging events to deepen historical continuity."}
        </p>
      ) : null}
      {isContactsReady && contacts.length > 0 ? <ContactList contacts={contacts} usedContactIds={usedContactIds} onEdited={onChanged} /> : null}
      {errorMessage ? <p style={{ color: "crimson" }}>{errorMessage}</p> : null}
    </section>
  )
}

export default WorkspaceContactsPanel
