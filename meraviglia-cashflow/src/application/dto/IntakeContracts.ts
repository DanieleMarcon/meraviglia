export type IntakeStatus = "draft" | "validated" | "converted"

export type CreateIntakeInput = {
  activity_name: string
  first_name?: string
  last_name?: string
  email: string
  address?: string | null
  is_online?: boolean
  notes?: string | null
  status?: IntakeStatus
}

export type UpdateIntakeInput = Partial<Omit<CreateIntakeInput, "status">> & {
  status?: IntakeStatus
  workspace_id?: string | null
}
