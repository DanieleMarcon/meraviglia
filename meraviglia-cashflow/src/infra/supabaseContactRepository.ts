import { supabase } from "../lib/supabaseClient"
import { toRepositoryError } from "./authorizationError"
import { decodeContactRow, decodeContactRows } from "./contactRowDecoder"
import { adaptCreateContactWritePayload, adaptUpdateContactWritePayload } from "./contactWritePayloadAdapter"
import type {
  ContactRepository,
  ContactRecord,
  CreateContactRecordInput,
  UpdateContactRecordInput,
} from "../repository/contactRepository"

const TABLE_NAME = "contacts"
const INTERACTION_PARTICIPANTS_TABLE = "interaction_participants"
const SELECT_FIELDS =
  "id, workspace_id, first_name, last_name, email, phone, role, provenance, created_at, updated_at"

export class SupabaseContactRepository implements ContactRepository {
  async createContact(input: CreateContactRecordInput): Promise<ContactRecord> {
    const organizationId = await this.resolveCurrentOrganizationId()
    const writePayload = adaptCreateContactWritePayload({ ...input, organization_id: organizationId })
    const { data, error } = await supabase.from(TABLE_NAME).insert(writePayload).select(SELECT_FIELDS).single()

    if (error || !data) {
      throw toRepositoryError(error, "Failed to create contact")
    }

    return decodeContactRow(data, "createContact")
  }

  private async resolveCurrentOrganizationId(): Promise<string> {
    const { data, error } = await supabase.rpc("current_user_organization_id")
    if (error) {
      throw toRepositoryError(error, "Failed to resolve current organization")
    }

    if (typeof data !== "string" || !data) {
      throw new Error("Authenticated user organization context is unavailable")
    }

    return data
  }

  async listContactsByWorkspace(workspaceId: string): Promise<ContactRecord[]> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select(SELECT_FIELDS)
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })

    if (error) {
      throw toRepositoryError(error, "Failed to list contacts")
    }

    return decodeContactRows(data ?? [], "listContactsByWorkspace")
  }

  async updateContact(id: string, input: UpdateContactRecordInput): Promise<ContactRecord | null> {
    const writePayload = adaptUpdateContactWritePayload(input)

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(writePayload)
      .eq("id", id)
      .eq("updated_at", input.expected_updated_at)
      .select(SELECT_FIELDS)
      .maybeSingle()

    if (error) {
      throw toRepositoryError(error, "Failed to update contact")
    }

    if (!data) {
      return null
    }

    return decodeContactRow(data, "updateContact")
  }

  async isContactReferencedByAnyInteraction(contactId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from(INTERACTION_PARTICIPANTS_TABLE)
      .select("contact_id")
      .eq("contact_id", contactId)
      .limit(1)

    if (error) {
      throw toRepositoryError(error, "Failed to validate contact interaction references")
    }

    return (data ?? []).length > 0
  }

  async deleteContact(id: string): Promise<boolean> {
    const { data, error } = await supabase.from(TABLE_NAME).delete().eq("id", id).select("id").maybeSingle()

    if (error) {
      throw toRepositoryError(error, "Failed to delete contact")
    }

    return Boolean(data)
  }
}
