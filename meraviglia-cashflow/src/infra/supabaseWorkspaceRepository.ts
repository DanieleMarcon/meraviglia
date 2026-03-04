import { supabase } from "../lib/supabaseClient"
import type {
  CreateWorkspaceInput,
  UpdateWorkspaceInput,
  WorkspaceDTO,
  WorkspaceRepository,
} from "../repository/workspaceRepository"

const TABLE_NAME = "workspaces"

export class SupabaseWorkspaceRepository implements WorkspaceRepository {
  async createWorkspace(input: CreateWorkspaceInput): Promise<WorkspaceDTO> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert({
        workspace_name: input.workspace_name,
        workspace_slug: input.workspace_slug,
      })
      .select("id, workspace_name, workspace_slug, created_at, updated_at")
      .single()

    if (error || !data) {
      throw new Error(error?.message ?? "Failed to create workspace")
    }

    return data
  }

  async listWorkspaces(): Promise<WorkspaceDTO[]> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("id, workspace_name, workspace_slug, created_at, updated_at")
      .order("created_at", { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    return data ?? []
  }

  async updateWorkspace(id: string, input: UpdateWorkspaceInput): Promise<WorkspaceDTO> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update({
        workspace_name: input.workspace_name,
      })
      .eq("id", id)
      .select("id, workspace_name, workspace_slug, created_at, updated_at")
      .single()

    if (error || !data) {
      throw new Error(error?.message ?? "Failed to update workspace")
    }

    return data
  }
}
