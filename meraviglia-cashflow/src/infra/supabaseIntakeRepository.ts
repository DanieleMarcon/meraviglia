import { supabase } from "../lib/supabaseClient"
import { toRepositoryError } from "./authorizationError"
import { decodeIntakeRow, decodeIntakeRows } from "./intakeRowDecoder"
import {
  adaptCreateIntakeWritePayload,
  adaptUpdateIntakeWritePayload,
} from "./intakeWritePayloadAdapter"
import type {
  CreateIntakeRecordInput,
  IntakeRecord,
  IntakeRepository,
  UpdateIntakeRecordInput,
} from "../repository/intakeRepository"

const TABLE_NAME = "intakes"
const SELECT_FIELDS =
  "id, activity_name, first_name, last_name, email, address, is_online, notes, status, workspace_id, created_at, updated_at"

export class SupabaseIntakeRepository implements IntakeRepository {
  async createIntake(input: CreateIntakeRecordInput): Promise<IntakeRecord> {
    const organizationId = await this.resolveCurrentOrganizationId()
    const writePayload = adaptCreateIntakeWritePayload({ ...input, organization_id: organizationId })
    const { data, error } = await supabase.from(TABLE_NAME).insert(writePayload).select(SELECT_FIELDS).single()
    if (error || !data) throw toRepositoryError(error, "Failed to create intake")
    return decodeIntakeRow(data, "createIntake")
  }


  private async resolveCurrentOrganizationId(): Promise<string> {
    const { data, error } = await supabase.rpc("current_user_organization_id")
    if (error) throw toRepositoryError(error, "Failed to resolve current organization")
    if (typeof data !== "string" || !data) {
      throw new Error("Authenticated user organization context is unavailable")
    }

    return data
  }

  async listIntakes(): Promise<IntakeRecord[]> {
    const { data, error } = await supabase.from(TABLE_NAME).select(SELECT_FIELDS).order("created_at", { ascending: false })
    if (error) throw toRepositoryError(error, "Failed to list intakes")
    return decodeIntakeRows(data ?? [], "listIntakes")
  }

  async getIntakeById(id: string): Promise<IntakeRecord | null> {
    const { data, error } = await supabase.from(TABLE_NAME).select(SELECT_FIELDS).eq("id", id).single()
    if (error) {
      if (error.code === "PGRST116") return null
      throw toRepositoryError(error, "Failed to load intake")
    }
    return data ? decodeIntakeRow(data, "getIntakeById") : null
  }

  async updateIntake(id: string, input: UpdateIntakeRecordInput): Promise<IntakeRecord> {
    const writePayload = adaptUpdateIntakeWritePayload(input)
    const { data, error } = await supabase.from(TABLE_NAME).update(writePayload).eq("id", id).select(SELECT_FIELDS).single()
    if (error || !data) throw toRepositoryError(error, "Failed to update intake")
    return decodeIntakeRow(data, "updateIntake")
  }

  async convertToWorkspace(id: string, workspaceId: string): Promise<IntakeRecord> {
    return this.updateIntake(id, { status: "converted", workspace_id: workspaceId })
  }
}
