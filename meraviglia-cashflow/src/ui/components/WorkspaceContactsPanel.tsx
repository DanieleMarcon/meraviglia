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
    <section style={{ padding: 12, border: "1px solid #eee", borderRadius: 6, background: "#fcfcfc" }}>
      <h4 style={{ marginTop: 0 }}>Contacts</h4>
      <p style={{ marginTop: 0, color: "#555" }}>Step 3 — Contacts are the relationships in this workspace context.</p>
      {isContactsReady ? (
        <p style={{ marginTop: 0, color: "#555" }}>
          {!hasRelationships
            ? "Current state: no relationships yet."
            : relationshipsInHistory === 0
              ? "Current state: relationships exist, but none are in event history yet."
              : `Current state: ${relationshipsInHistory} relationship${relationshipsInHistory === 1 ? "" : "s"} already anchor event history.`}
        </p>
      ) : null}
      <ContactForm workspaceId={workspaceId} onCreated={onChanged} />
      {!isContactsReady ? <p>Loading contacts...</p> : null}
      {isContactsReady && contacts.length === 0 ? (
        <p>No relationships yet. Add your first contact to unlock interaction event tracking.</p>
      ) : null}
      {isContactsReady && contacts.length > 0 ? (
        <p style={{ color: "#555" }}>
          {relationshipsInHistory === 0
            ? "Next action: log the first event with one of these relationships."
            : "Next action: keep linking events to maintain continuity."}
        </p>
      ) : null}
      {isContactsReady && contacts.length > 0 ? <ContactList contacts={contacts} usedContactIds={usedContactIds} onEdited={onChanged} /> : null}
      {errorMessage ? <p style={{ color: "crimson" }}>{errorMessage}</p> : null}
    </section>
  )
}

export default WorkspaceContactsPanel
