import type { ContactProvenance } from "./ContactProvenance"

export interface Contact {
  id: string
  workspaceId: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  role: string | null
  provenance: ContactProvenance
  createdAt: string
  updatedAt: string
}
