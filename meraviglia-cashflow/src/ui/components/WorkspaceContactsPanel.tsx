import type { ContactDTO } from "../../application/dto/ContactDTO"
import ContactForm from "./ContactForm"
import ContactList from "./ContactList"

type WorkspaceContactsPanelProps = {
  workspaceId: string
  contacts: ContactDTO[]
  isLoading: boolean
  errorMessage: string | null
  onCreated: () => Promise<void>
}

function WorkspaceContactsPanel({ workspaceId, contacts, isLoading, errorMessage, onCreated }: WorkspaceContactsPanelProps) {
  return (
    <section style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #eee" }}>
      <h4>Contacts</h4>
      <ContactForm workspaceId={workspaceId} onCreated={onCreated} />
      {isLoading ? <p>Loading contacts...</p> : null}
      {!isLoading && contacts.length === 0 ? <p>No contacts found for this workspace.</p> : null}
      {!isLoading && contacts.length > 0 ? <ContactList contacts={contacts} /> : null}
      {errorMessage ? <p style={{ color: "crimson" }}>{errorMessage}</p> : null}
    </section>
  )
}

export default WorkspaceContactsPanel
