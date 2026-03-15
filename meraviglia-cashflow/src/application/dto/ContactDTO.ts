import type { ContactProvenance } from "../../domain/contact/ContactProvenance"

export interface ContactDTO {
  id: string
  workspace_id: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  role: string | null
  provenance: ContactProvenance
  created_at: string
  updated_at: string
}
