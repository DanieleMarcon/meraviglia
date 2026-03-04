export type WorkspaceDTO = {
  id: string
  workspace_name: string
  workspace_slug: string
  created_at: string
  updated_at: string
}

export type CreateWorkspaceInput = {
  workspace_name: string
  workspace_slug: string
}

export type UpdateWorkspaceInput = {
  workspace_name?: string
}

export interface WorkspaceRepository {
  createWorkspace(input: CreateWorkspaceInput): Promise<WorkspaceDTO>
  listWorkspaces(): Promise<WorkspaceDTO[]>
  updateWorkspace(id: string, input: UpdateWorkspaceInput): Promise<WorkspaceDTO>
}
