import type {
  IntakeRepository,
} from "../repository/intakeRepository"
import type { IntakeDTO } from "./dto/IntakeDTO"
import { mapIntakeRecordToDTO } from "./mappers/intakeWorkspaceMappers"
import type { CreateIntakeInput, UpdateIntakeInput } from "./dto/IntakeContracts"
import type { WorkspaceService } from "./workspaceService"

const requireNonEmpty = (value: string, fieldName: string): string => {
  const normalized = value.trim()
  if (!normalized) throw new Error(`${fieldName} is required`)
  return normalized
}

const normalizeOptionalReferenceName = (value: string | undefined): string => {
  if (!value) {
    return ""
  }

  return value.trim()
}

export class IntakeService {
  private readonly intakeRepository: IntakeRepository

  private readonly workspaceService: Pick<WorkspaceService, "createWorkspace">

  constructor(
    intakeRepository: IntakeRepository,
    workspaceService: Pick<WorkspaceService, "createWorkspace">,
  ) {
    this.intakeRepository = intakeRepository
    this.workspaceService = workspaceService
  }

  async createIntake(input: CreateIntakeInput): Promise<IntakeDTO> {
    const intakeRecord = await this.intakeRepository.createIntake({
      ...input,
      activity_name: requireNonEmpty(input.activity_name, "activity_name"),
      first_name: normalizeOptionalReferenceName(input.first_name),
      last_name: normalizeOptionalReferenceName(input.last_name),
      email: requireNonEmpty(input.email, "email"),
    })

    return mapIntakeRecordToDTO(intakeRecord)
  }

  async listIntakes(): Promise<IntakeDTO[]> {
    const intakeRecords = await this.intakeRepository.listIntakes()

    return intakeRecords.map(mapIntakeRecordToDTO)
  }

  async updateIntake(id: string, input: UpdateIntakeInput): Promise<IntakeDTO> {
    const intakeRecord = await this.intakeRepository.updateIntake(requireNonEmpty(id, "id"), input)

    return mapIntakeRecordToDTO(intakeRecord)
  }

  async convertIntakeToWorkspace(
    id: string,
  ): Promise<{ intake: IntakeDTO; workspace: Awaited<ReturnType<WorkspaceService["createWorkspace"]>> }> {
    const intakeId = requireNonEmpty(id, "id")
    const intakeRecord = await this.intakeRepository.getIntakeById(intakeId)
    if (!intakeRecord) throw new Error("Intake not found")

    const intake = mapIntakeRecordToDTO(intakeRecord)
    if (intake.status === "converted") throw new Error("Intake already converted")

    const workspaceName = intake.activity_name.trim()
    const workspaceSlug = workspaceName.toLowerCase().replace(/\s+/g, "-")

    const workspace = await this.workspaceService.createWorkspace({
      workspace_name: workspaceName,
      workspace_slug: workspaceSlug,
    })
    const updatedIntakeRecord = await this.intakeRepository.convertToWorkspace(intake.id, workspace.id)

    return { intake: mapIntakeRecordToDTO(updatedIntakeRecord), workspace }
  }
}

let intakeService: IntakeService | null = null

export const setIntakeService = (service: IntakeService): void => {
  intakeService = service
}

const getIntakeService = (): IntakeService => {
  if (!intakeService) {
    throw new Error("IntakeService is not configured")
  }

  return intakeService
}

export const createIntake = async (input: CreateIntakeInput): Promise<IntakeDTO> => {
  return getIntakeService().createIntake(input)
}

export const listIntakes = async (): Promise<IntakeDTO[]> => getIntakeService().listIntakes()

export const updateIntake = async (id: string, input: UpdateIntakeInput): Promise<IntakeDTO> => {
  return getIntakeService().updateIntake(id, input)
}

export const convertIntakeToWorkspace = async (
  id: string,
): Promise<{ intake: IntakeDTO; workspace: Awaited<ReturnType<WorkspaceService["createWorkspace"]>> }> => {
  return getIntakeService().convertIntakeToWorkspace(id)
}
