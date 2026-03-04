import { SupabaseWorkspaceRepository } from "../infra/supabaseWorkspaceRepository"
import type {
  CreateWorkspaceInput,
  UpdateWorkspaceInput,
  WorkspaceDTO,
} from "../repository/workspaceRepository"

const workspaceRepository = new SupabaseWorkspaceRepository()

const requireNonEmpty = (value: string, fieldName: string): string => {
  const normalized = value.trim()

  if (!normalized) {
    throw new Error(`${fieldName} is required`)
  }

  return normalized
}

export const createWorkspace = async (input: CreateWorkspaceInput): Promise<WorkspaceDTO> => {
  const workspace_name = requireNonEmpty(input.workspace_name, "workspace_name")
  const workspace_slug = requireNonEmpty(input.workspace_slug, "workspace_slug")

  return workspaceRepository.createWorkspace({ workspace_name, workspace_slug })
}

export const listWorkspaces = async (): Promise<WorkspaceDTO[]> => {
  return workspaceRepository.listWorkspaces()
}

export const updateWorkspace = async (
  id: string,
  input: UpdateWorkspaceInput,
): Promise<WorkspaceDTO> => {
  const workspaceId = requireNonEmpty(id, "id")

  if (input.workspace_name !== undefined) {
    return workspaceRepository.updateWorkspace(workspaceId, {
      workspace_name: requireNonEmpty(input.workspace_name, "workspace_name"),
    })
  }

  return workspaceRepository.updateWorkspace(workspaceId, input)
}
