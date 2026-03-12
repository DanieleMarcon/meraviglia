import type {
  WorkspaceRepository,
} from "../repository/workspaceRepository"
import type { CreateWorkspaceInput, UpdateWorkspaceInput } from "./dto/WorkspaceContracts"
import type { WorkspaceDTO } from "./dto/WorkspaceDTO"
import { mapWorkspaceRecordToDTO } from "./mappers/intakeWorkspaceMappers"

const requireNonEmpty = (value: string, fieldName: string): string => {
  const normalized = value.trim()

  if (!normalized) {
    throw new Error(`${fieldName} is required`)
  }

  return normalized
}

export class WorkspaceService {
  private readonly workspaceRepository: WorkspaceRepository

  constructor(workspaceRepository: WorkspaceRepository) {
    this.workspaceRepository = workspaceRepository
  }

  async createWorkspace(input: CreateWorkspaceInput): Promise<WorkspaceDTO> {
    const workspace_name = requireNonEmpty(input.workspace_name, "workspace_name")
    const workspace_slug = requireNonEmpty(input.workspace_slug, "workspace_slug")

    const workspaceRecord = await this.workspaceRepository.createWorkspace({ workspace_name, workspace_slug })

    return mapWorkspaceRecordToDTO(workspaceRecord)
  }

  async listWorkspaces(): Promise<WorkspaceDTO[]> {
    const workspaceRecords = await this.workspaceRepository.listWorkspaces()

    return workspaceRecords.map(mapWorkspaceRecordToDTO)
  }

  async updateWorkspace(id: string, input: UpdateWorkspaceInput): Promise<WorkspaceDTO> {
    const workspaceId = requireNonEmpty(id, "id")

    if (input.workspace_name !== undefined) {
      const workspaceRecord = await this.workspaceRepository.updateWorkspace(workspaceId, {
        workspace_name: requireNonEmpty(input.workspace_name, "workspace_name"),
      })

      return mapWorkspaceRecordToDTO(workspaceRecord)
    }

    const workspaceRecord = await this.workspaceRepository.updateWorkspace(workspaceId, input)

    return mapWorkspaceRecordToDTO(workspaceRecord)
  }
}

let workspaceService: WorkspaceService | null = null

export const setWorkspaceService = (service: WorkspaceService): void => {
  workspaceService = service
}

const getWorkspaceService = (): WorkspaceService => {
  if (!workspaceService) {
    throw new Error("WorkspaceService is not configured")
  }

  return workspaceService
}

export const createWorkspace = async (input: CreateWorkspaceInput): Promise<WorkspaceDTO> => {
  return getWorkspaceService().createWorkspace(input)
}

export const listWorkspaces = async (): Promise<WorkspaceDTO[]> => {
  return getWorkspaceService().listWorkspaces()
}

export const updateWorkspace = async (
  id: string,
  input: UpdateWorkspaceInput,
): Promise<WorkspaceDTO> => {
  return getWorkspaceService().updateWorkspace(id, input)
}
