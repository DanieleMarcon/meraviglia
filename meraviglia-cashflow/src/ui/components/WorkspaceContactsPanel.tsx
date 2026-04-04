import type { ContactDTO } from "../../application/dto/ContactDTO"
import ContactForm from "./ContactForm"
import ContactList from "./ContactList"

type WorkspaceContactsPanelProps = {
  workspaceId: string
  contacts: ContactDTO[]
  isContactsReady: boolean
  errorMessage: string | null
  onChanged: () => Promise<void>
}

function WorkspaceContactsPanel({ workspaceId, contacts, isContactsReady, errorMessage, onChanged }: WorkspaceContactsPanelProps) {
  return (
    <section style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #eee" }}>
      <h4>Contacts</h4>
      <p style={{ marginTop: 0, color: "#555" }}>Step 3 — Contacts represent the relationships inside this workspace context.</p>
      <ContactForm workspaceId={workspaceId} onCreated={onChanged} />
      {!isContactsReady ? <p>Loading contacts...</p> : null}
      {isContactsReady && contacts.length === 0 ? (
        <p>No relationships yet. Add your first contact to unlock interaction event tracking.</p>
      ) : null}
      {isContactsReady && contacts.length > 0 ? <p style={{ color: "#555" }}>Next step: use these contacts as participants when logging interactions.</p> : null}
      {isContactsReady && contacts.length > 0 ? <ContactList contacts={contacts} onEdited={onChanged} /> : null}
      {errorMessage ? <p style={{ color: "crimson" }}>{errorMessage}</p> : null}
    </section>
  )
}

export default WorkspaceContactsPanel
