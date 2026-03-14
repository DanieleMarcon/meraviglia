import { supabase } from "../lib/supabaseClient"
import { decodeWorkspaceRow, decodeWorkspaceRows } from "./workspaceRowDecoder"
import {
  adaptCreateWorkspaceWritePayload,
  adaptUpdateWorkspaceWritePayload,
} from "./workspaceWritePayloadAdapter"
import type {
  CreateWorkspaceRecordInput,
  UpdateWorkspaceRecordInput,
  WorkspaceRecord,
  WorkspaceRepository,
} from "../repository/workspaceRepository"

const TABLE_NAME = "workspaces"

export class SupabaseWorkspaceRepository implements WorkspaceRepository {
  async createWorkspace(input: CreateWorkspaceRecordInput): Promise<WorkspaceRecord> {
    const writePayload = adaptCreateWorkspaceWritePayload(input)
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert(writePayload)
      .select("id, workspace_name, workspace_slug, created_at, updated_at")
      .single()

    if (error || !data) {
      throw new Error(error?.message ?? "Failed to create workspace")
    }

    return decodeWorkspaceRow(data, "createWorkspace")
  }

  async listWorkspaces(): Promise<WorkspaceRecord[]> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("id, workspace_name, workspace_slug, created_at, updated_at")
      .order("created_at", { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    return decodeWorkspaceRows(data ?? [], "listWorkspaces")
  }

  async updateWorkspace(id: string, input: UpdateWorkspaceRecordInput): Promise<WorkspaceRecord> {
    const writePayload = adaptUpdateWorkspaceWritePayload(input)
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(writePayload)
      .eq("id", id)
      .select("id, workspace_name, workspace_slug, created_at, updated_at")
      .single()

    if (error || !data) {
      throw new Error(error?.message ?? "Failed to update workspace")
    }

    return decodeWorkspaceRow(data, "updateWorkspace")
  }
}
