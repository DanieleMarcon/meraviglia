export interface IntakeDTO {
  id: string
  first_name: string
  last_name: string
  email: string
  address: string | null
  is_online: boolean
  notes: string | null
  status: "draft" | "validated" | "converted"
  workspace_id: string | null
  created_at: string
  updated_at: string
}
