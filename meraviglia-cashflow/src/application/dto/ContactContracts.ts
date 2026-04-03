import type { ContactProvenance } from "../../domain/contact/ContactProvenance"

export type CreateContactInput = {
  workspace_id: string
  first_name: string
  last_name: string
  email?: string | null
  phone?: string | null
  role?: string | null
  provenance?: ContactProvenance
}

export type UpdateContactInput = {
  first_name: string
  last_name: string
  email?: string | null
  phone?: string | null
  role?: string | null
  expected_updated_at: string
}
