import { supabase } from "../lib/supabaseClient"
import { decodeContactRow, decodeContactRows } from "./contactRowDecoder"
import { adaptCreateContactWritePayload } from "./contactWritePayloadAdapter"
import type { ContactRepository, ContactRecord, CreateContactRecordInput } from "../repository/contactRepository"

const TABLE_NAME = "contacts"
const SELECT_FIELDS =
  "id, workspace_id, first_name, last_name, email, phone, role, provenance, created_at, updated_at"

export class SupabaseContactRepository implements ContactRepository {
  async createContact(input: CreateContactRecordInput): Promise<ContactRecord> {
    const organizationId = await this.resolveCurrentOrganizationId()
    const writePayload = adaptCreateContactWritePayload({ ...input, organization_id: organizationId })
    const { data, error } = await supabase.from(TABLE_NAME).insert(writePayload).select(SELECT_FIELDS).single()

    if (error || !data) {
      throw new Error(error?.message ?? "Failed to create contact")
    }

    return decodeContactRow(data, "createContact")
  }

  private async resolveCurrentOrganizationId(): Promise<string> {
    const { data, error } = await supabase.rpc("current_user_organization_id")
    if (error) {
      throw new Error(error.message)
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
      throw new Error(error.message)
    }

    return decodeContactRows(data ?? [], "listContactsByWorkspace")
  }
}
