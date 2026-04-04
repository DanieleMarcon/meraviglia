import type { ContactDTO } from "../../application/dto/ContactDTO"
import ContactForm from "./ContactForm"
import ContactList from "./ContactList"

type WorkspaceContactsPanelProps = {
  workspaceId: string
  contacts: ContactDTO[]
  usedContactIds: string[]
  isContactsReady: boolean
  isCreateHighlightActive: boolean
  errorMessage: string | null
  onChanged: () => Promise<void>
}

function WorkspaceContactsPanel({ workspaceId, contacts, usedContactIds, isContactsReady, isCreateHighlightActive, errorMessage, onChanged }: WorkspaceContactsPanelProps) {
  const hasRelationships = contacts.length > 0
  const relationshipsInHistory = contacts.filter((contact) => usedContactIds.includes(contact.id)).length

  return (
    <section style={{ padding: 12, border: "1px solid #eee", borderRadius: 6, background: "#fcfcfc" }}>
      <h4 style={{ marginTop: 0 }}>Relationships (contacts)</h4>
      <p style={{ marginTop: 0, color: "#555" }}>Step 3 — Add the people involved in this workspace.</p>
      {isContactsReady ? (
        <p style={{ marginTop: 0, color: "#555" }}>
          {!hasRelationships
            ? "No contacts yet."
            : relationshipsInHistory === 0
              ? "Contacts added, but none used in interactions yet."
              : `${relationshipsInHistory} contact${relationshipsInHistory === 1 ? "" : "s"} already used in interactions.`}
        </p>
      ) : null}
      <ContactForm workspaceId={workspaceId} onCreated={onChanged} isHighlighted={isCreateHighlightActive} />
      {!isContactsReady ? <p>Loading contacts...</p> : null}
      {isContactsReady && contacts.length === 0 ? (
        <p>No relationships yet. Add the first one with only known details; you can enrich it later.</p>
      ) : null}
      {isContactsReady && contacts.length > 0 ? (
        <p style={{ color: "#555" }}>
          {relationshipsInHistory === 0
            ? "Next: log the first interaction with one of these contacts."
            : "Next: keep linking interactions to contacts."}
        </p>
      ) : null}
      {isContactsReady && contacts.length > 0 ? <ContactList contacts={contacts} usedContactIds={usedContactIds} onEdited={onChanged} /> : null}
      {errorMessage ? <p style={{ color: "crimson" }}>{errorMessage}</p> : null}
    </section>
  )
}

export default WorkspaceContactsPanel
