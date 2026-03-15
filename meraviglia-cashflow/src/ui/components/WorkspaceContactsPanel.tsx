import { useCallback, useEffect, useState } from "react"

import { listContactsByWorkspace } from "../../application/contactService"
import type { ContactDTO } from "../../application/dto/ContactDTO"
import ContactForm from "./ContactForm"
import ContactList from "./ContactList"

type WorkspaceContactsPanelProps = {
  workspaceId: string
}

function WorkspaceContactsPanel({ workspaceId }: WorkspaceContactsPanelProps) {
  const [contacts, setContacts] = useState<ContactDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const loadContacts = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const items = await listContactsByWorkspace(workspaceId)
      setContacts(items)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to load contacts")
    } finally {
      setIsLoading(false)
    }
  }, [workspaceId])

  useEffect(() => {
    void loadContacts()
  }, [loadContacts])

  return (
    <section style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #eee" }}>
      <h4>Contacts</h4>
      <ContactForm workspaceId={workspaceId} onCreated={loadContacts} />
      {isLoading ? <p>Loading contacts...</p> : null}
      {!isLoading && contacts.length === 0 ? <p>No contacts found for this workspace.</p> : null}
      {!isLoading && contacts.length > 0 ? <ContactList contacts={contacts} /> : null}
      {errorMessage ? <p style={{ color: "crimson" }}>{errorMessage}</p> : null}
    </section>
  )
}

export default WorkspaceContactsPanel
