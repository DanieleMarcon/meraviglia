export type IntakeDTO = {
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

export type CreateIntakeInput = {
  first_name: string
  last_name: string
  email: string
  address?: string | null
  is_online?: boolean
  notes?: string | null
  status?: IntakeDTO["status"]
}

export type UpdateIntakeInput = Partial<Omit<CreateIntakeInput, "status">> & {
  status?: IntakeDTO["status"]
  workspace_id?: string | null
}

export interface IntakeRepository {
  createIntake(input: CreateIntakeInput): Promise<IntakeDTO>
  listIntakes(): Promise<IntakeDTO[]>
  updateIntake(id: string, input: UpdateIntakeInput): Promise<IntakeDTO>
  convertToWorkspace(id: string, workspaceId: string): Promise<IntakeDTO>
}
