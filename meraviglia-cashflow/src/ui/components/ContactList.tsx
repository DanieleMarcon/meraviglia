import { useEffect, useState, type FormEvent } from "react"
import { toUserFacingErrorMessage } from "../../application/toUserFacingErrorMessage"

import { STALE_CONTACT_UPDATE_MESSAGE, deleteContact, updateContact } from "../../application/contactService"
import type { ContactDTO } from "../../application/dto/ContactDTO"
import { syncDraftWithLatestContact, toEditDraft, type EditDraft } from "./contactListUtils"

type ContactListProps = {
  contacts: ContactDTO[]
  usedContactIds: string[]
  onEdited: () => Promise<void>
}


function ContactList({ contacts, usedContactIds, onEdited }: ContactListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<EditDraft | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
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
      const message = toUserFacingErrorMessage(error, "Unable to edit contact")

      if (message === STALE_CONTACT_UPDATE_MESSAGE) {
        setShouldSyncDraftFromContacts(true)
        await onEdited()
      }

      setErrorMessage(message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (contactId: string) => {
    setErrorMessage(null)
    setDeletingId(contactId)

    try {
      await deleteContact(contactId)
      if (editingId === contactId) {
        setEditingId(null)
        setDraft(null)
      }
      await onEdited()
    } catch (error) {
      const message = toUserFacingErrorMessage(error, "Unable to delete contact")
      setErrorMessage(message)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {contacts.map((contact) => {
          const isEditing = editingId === contact.id && draft
          const isUsedInHistory = usedContactIds.includes(contact.id)

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
                  <p>
                    <strong>Interaction history:</strong>{" "}
                    {isUsedInHistory
                      ? "Used in event history (this relationship is already part of logged interactions)."
                      : "Not yet linked to any logged event."}
                  </p>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button type="button" onClick={() => beginEdit(contact)} disabled={deletingId === contact.id}>Edit</button>
                    <button type="button" onClick={() => void handleDelete(contact.id)} disabled={deletingId === contact.id}>
                      {deletingId === contact.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
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
