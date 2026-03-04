import { supabase } from "../lib/supabaseClient"
import type {
  CreateIntakeInput,
  IntakeDTO,
  IntakeRepository,
  UpdateIntakeInput,
} from "../repository/intakeRepository"

const TABLE_NAME = "intakes"
const SELECT_FIELDS =
  "id, first_name, last_name, email, address, is_online, notes, status, workspace_id, created_at, updated_at"

export class SupabaseIntakeRepository implements IntakeRepository {
  async createIntake(input: CreateIntakeInput): Promise<IntakeDTO> {
    const { data, error } = await supabase.from(TABLE_NAME).insert(input).select(SELECT_FIELDS).single()
    if (error || !data) throw new Error(error?.message ?? "Failed to create intake")
    return data
  }

  async listIntakes(): Promise<IntakeDTO[]> {
    const { data, error } = await supabase.from(TABLE_NAME).select(SELECT_FIELDS).order("created_at", { ascending: false })
    if (error) throw new Error(error.message)
    return data ?? []
  }

  async updateIntake(id: string, input: UpdateIntakeInput): Promise<IntakeDTO> {
    const { data, error } = await supabase.from(TABLE_NAME).update(input).eq("id", id).select(SELECT_FIELDS).single()
    if (error || !data) throw new Error(error?.message ?? "Failed to update intake")
    return data
  }

  async convertToWorkspace(id: string, workspaceId: string): Promise<IntakeDTO> {
    return this.updateIntake(id, { status: "converted", workspace_id: workspaceId })
  }
}
