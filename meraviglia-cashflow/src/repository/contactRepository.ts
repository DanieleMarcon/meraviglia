export type ContactProvenanceRecord = "manual" | "from_intake" | "from_ai_review"

export type ContactRecord = {
  id: string
  workspace_id: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  role: string | null
  provenance: ContactProvenanceRecord
  created_at: string
  updated_at: string
}

export type CreateContactRecordInput = {
  workspace_id: string
  first_name: string
  last_name: string
  email?: string | null
  phone?: string | null
  role?: string | null
  provenance: ContactProvenanceRecord
}

export type UpdateContactRecordInput = {
  first_name: string
  last_name: string
  email?: string | null
  phone?: string | null
  role?: string | null
  expected_updated_at: string
}

export interface ContactRepository {
  createContact(input: CreateContactRecordInput): Promise<ContactRecord>
  updateContact(id: string, input: UpdateContactRecordInput): Promise<ContactRecord | null>
  listContactsByWorkspace(workspaceId: string): Promise<ContactRecord[]>
}
