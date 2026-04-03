import { useEffect, useState, type FormEvent } from "react"

import { updateContact } from "../../application/contactService"
import type { ContactDTO } from "../../application/dto/ContactDTO"

type ContactListProps = {
  contacts: ContactDTO[]
  onEdited: () => Promise<void>
}

type EditDraft = {
  firstName: string
  lastName: string
  email: string
  phone: string
  role: string
  expectedUpdatedAt: string
}

const STALE_CONTACT_UPDATE_MESSAGE = "This contact was updated elsewhere. Reloaded latest data."

const toEditDraft = (contact: ContactDTO): EditDraft => {
  return {
    firstName: contact.first_name,
    lastName: contact.last_name,
    email: contact.email ?? "",
    phone: contact.phone ?? "",
    role: contact.role ?? "",
    expectedUpdatedAt: contact.updated_at,
  }
}

export const syncDraftWithLatestContact = (draft: EditDraft | null, editingId: string | null, contacts: ContactDTO[]): EditDraft | null => {
  if (!draft || !editingId) {
    return draft
  }

  const latestContact = contacts.find((contact) => contact.id === editingId)
  if (!latestContact) {
    return draft
  }

  return toEditDraft(latestContact)
}

function ContactList({ contacts, onEdited }: ContactListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<EditDraft | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [shouldSyncDraftFromContacts, setShouldSyncDraftFromContacts] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!shouldSyncDraftFromContacts) {
      return
    }

    setDraft((currentDraft) => syncDraftWithLatestContact(currentDraft, editingId, contacts))
    setShouldSyncDraftFromContacts(false)
  }, [contacts, editingId, shouldSyncDraftFromContacts])

  const beginEdit = (contact: ContactDTO) => {
    setEditingId(contact.id)
    setDraft(toEditDraft(contact))
    setErrorMessage(null)
  }

  const handleSave = async (event: FormEvent<HTMLFormElement>, contactId: string) => {
    event.preventDefault()

    if (!draft) {
      return
    }

    setIsSaving(true)
    setErrorMessage(null)

    try {
      await updateContact(contactId, {
        first_name: draft.firstName,
        last_name: draft.lastName,
        email: draft.email,
        phone: draft.phone,
        role: draft.role,
        expected_updated_at: draft.expectedUpdatedAt,
      })

      setEditingId(null)
      setDraft(null)
      await onEdited()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to edit contact"

      if (message === STALE_CONTACT_UPDATE_MESSAGE) {
        setShouldSyncDraftFromContacts(true)
        await onEdited()
      }

      setErrorMessage(message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {contacts.map((contact) => {
          const isEditing = editingId === contact.id && draft

          return (
            <li key={contact.id} style={{ border: "1px solid #ddd", borderRadius: 4, padding: 8, marginBottom: 8 }}>
              {isEditing ? (
                <form onSubmit={(event) => void handleSave(event, contact.id)}>
                  <label style={{ display: "block", marginBottom: 8 }}>
                    First name
                    <input value={draft.firstName} onChange={(event) => setDraft({ ...draft, firstName: event.target.value })} required />
                  </label>
                  <label style={{ display: "block", marginBottom: 8 }}>
                    Last name
                    <input value={draft.lastName} onChange={(event) => setDraft({ ...draft, lastName: event.target.value })} required />
                  </label>
                  <label style={{ display: "block", marginBottom: 8 }}>
                    Email
                    <input value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} type="email" />
                  </label>
                  <label style={{ display: "block", marginBottom: 8 }}>
                    Phone
                    <input value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} />
                  </label>
                  <label style={{ display: "block", marginBottom: 8 }}>
                    Role
                    <input value={draft.role} onChange={(event) => setDraft({ ...draft, role: event.target.value })} />
                  </label>
                  <p><strong>Provenance:</strong> {contact.provenance}</p>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Save contact"}</button>
                    <button type="button" onClick={() => { setEditingId(null); setDraft(null) }} disabled={isSaving}>Cancel</button>
                  </div>
                </form>
              ) : (
                <>
                  <p><strong>Name:</strong> {contact.first_name} {contact.last_name}</p>
                  <p><strong>Email:</strong> {contact.email ?? "-"}</p>
                  <p><strong>Phone:</strong> {contact.phone ?? "-"}</p>
                  <p><strong>Role:</strong> {contact.role ?? "-"}</p>
                  <p><strong>Provenance:</strong> {contact.provenance}</p>
                  <button type="button" onClick={() => beginEdit(contact)}>Edit</button>
                </>
              )}
            </li>
          )
        })}
      </ul>
      {errorMessage ? <p style={{ color: "crimson" }}>{errorMessage}</p> : null}
    </>
  )
}

export default ContactList
