import type { CreateContactInput, UpdateContactInput } from "./dto/ContactContracts"
import type { ContactDTO } from "./dto/ContactDTO"
import type { ContactRepository } from "../repository/contactRepository"
import { mapContactRecordToDTO } from "./mappers/contactMappers"

const requireNonEmpty = (value: string, fieldName: string): string => {
  const normalized = value.trim()

  if (!normalized) {
    throw new Error(`${fieldName} is required`)
  }

  return normalized
}

const normalizeOptional = (value: string | null | undefined): string | null | undefined => {
  if (value === undefined || value === null) {
    return value
  }

  const normalized = value.trim()
  return normalized ? normalized : null
}

export const STALE_CONTACT_UPDATE_MESSAGE = "This contact was updated elsewhere. Reloaded latest data."
export const CONTACT_REFERENCED_DELETE_MESSAGE = "Contact cannot be deleted because it is referenced by one or more interactions."

export class ContactService {
  private readonly contactRepository: ContactRepository

  constructor(contactRepository: ContactRepository) {
    this.contactRepository = contactRepository
  }

  async createContact(input: CreateContactInput): Promise<ContactDTO> {
    const contactRecord = await this.contactRepository.createContact({
      workspace_id: requireNonEmpty(input.workspace_id, "workspace_id"),
      first_name: requireNonEmpty(input.first_name, "first_name"),
      last_name: requireNonEmpty(input.last_name, "last_name"),
      email: normalizeOptional(input.email) ?? null,
      phone: normalizeOptional(input.phone) ?? null,
      role: normalizeOptional(input.role) ?? null,
      provenance: input.provenance ?? "manual",
    })

    return mapContactRecordToDTO(contactRecord)
  }

  async listContactsByWorkspace(workspaceId: string): Promise<ContactDTO[]> {
    const workspace_id = requireNonEmpty(workspaceId, "workspace_id")
    const records = await this.contactRepository.listContactsByWorkspace(workspace_id)

    return records.map(mapContactRecordToDTO)
  }

  async updateContact(id: string, input: UpdateContactInput): Promise<ContactDTO> {
    const contactId = requireNonEmpty(id, "id")
    const updated = await this.contactRepository.updateContact(contactId, {
      first_name: requireNonEmpty(input.first_name, "first_name"),
      last_name: requireNonEmpty(input.last_name, "last_name"),
      email: normalizeOptional(input.email) ?? null,
      phone: normalizeOptional(input.phone) ?? null,
      role: normalizeOptional(input.role) ?? null,
      expected_updated_at: requireNonEmpty(input.expected_updated_at, "expected_updated_at"),
    })

    if (!updated) {
      throw new Error(STALE_CONTACT_UPDATE_MESSAGE)
    }

    return mapContactRecordToDTO(updated)
  }

  async deleteContact(id: string): Promise<void> {
    const contactId = requireNonEmpty(id, "id")
    const isReferenced = await this.contactRepository.isContactReferencedByAnyInteraction(contactId)

    if (isReferenced) {
      throw new Error(CONTACT_REFERENCED_DELETE_MESSAGE)
    }

    const deleted = await this.contactRepository.deleteContact(contactId)

    if (!deleted) {
      throw new Error("Contact not found")
    }
  }
}

let contactService: ContactService | null = null

export const setContactService = (service: ContactService): void => {
  contactService = service
}

const getContactService = (): ContactService => {
  if (!contactService) {
    throw new Error("ContactService is not configured")
  }

  return contactService
}

export const createContact = async (input: CreateContactInput): Promise<ContactDTO> => {
  return getContactService().createContact(input)
}

export const listContactsByWorkspace = async (workspaceId: string): Promise<ContactDTO[]> => {
  return getContactService().listContactsByWorkspace(workspaceId)
}

export const updateContact = async (id: string, input: UpdateContactInput): Promise<ContactDTO> => {
  return getContactService().updateContact(id, input)
}

export const deleteContact = async (id: string): Promise<void> => {
  return getContactService().deleteContact(id)
}
