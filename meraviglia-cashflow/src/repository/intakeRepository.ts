export type IntakeStatus = "draft" | "validated" | "converted"

export type IntakeRecord = {
  id: string
  activity_name: string
  first_name: string
  last_name: string
  email: string
  address: string | null
  is_online: boolean
  notes: string | null
  status: IntakeStatus
  workspace_id: string | null
  created_at: string
  updated_at: string
}

export type CreateIntakeRecordInput = {
  activity_name: string
  first_name: string
  last_name: string
  email: string
  address?: string | null
  is_online?: boolean
  notes?: string | null
  status?: IntakeStatus
}

export type UpdateIntakeRecordInput = Partial<Omit<CreateIntakeRecordInput, "status">> & {
  status?: IntakeStatus
  workspace_id?: string | null
}

export interface IntakeRepository {
  createIntake(input: CreateIntakeRecordInput): Promise<IntakeRecord>
  listIntakes(): Promise<IntakeRecord[]>
  getIntakeById(id: string): Promise<IntakeRecord | null>
  updateIntake(id: string, input: UpdateIntakeRecordInput): Promise<IntakeRecord>
  convertToWorkspace(id: string, workspaceId: string): Promise<IntakeRecord>
}
