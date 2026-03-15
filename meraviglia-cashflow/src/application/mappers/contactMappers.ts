import type { ContactDTO } from "../dto/ContactDTO"
import type { ContactRecord } from "../../repository/contactRepository"

export const mapContactRecordToDTO = (record: ContactRecord): ContactDTO => {
  return {
    id: record.id,
    workspace_id: record.workspace_id,
    first_name: record.first_name,
    last_name: record.last_name,
    email: record.email,
    phone: record.phone,
    role: record.role,
    provenance: record.provenance,
    created_at: record.created_at,
    updated_at: record.updated_at,
  }
}
