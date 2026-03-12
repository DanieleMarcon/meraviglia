export type WorkspaceRecord = {
  id: string
  workspace_name: string
  workspace_slug: string
  created_at: string
  updated_at: string
}

export type CreateWorkspaceRecordInput = {
  workspace_name: string
  workspace_slug: string
}

export type UpdateWorkspaceRecordInput = {
  workspace_name?: string
}

export interface WorkspaceRepository {
  createWorkspace(input: CreateWorkspaceRecordInput): Promise<WorkspaceRecord>
  listWorkspaces(): Promise<WorkspaceRecord[]>
  updateWorkspace(id: string, input: UpdateWorkspaceRecordInput): Promise<WorkspaceRecord>
}
