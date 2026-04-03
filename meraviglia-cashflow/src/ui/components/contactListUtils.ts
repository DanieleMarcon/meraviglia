import type { ContactDTO } from "../../application/dto/ContactDTO"

export type EditDraft = {
  firstName: string
  lastName: string
  email: string
  phone: string
  role: string
  expectedUpdatedAt: string
}

export const toEditDraft = (contact: ContactDTO): EditDraft => {
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
