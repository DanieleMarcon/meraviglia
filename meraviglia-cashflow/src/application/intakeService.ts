import type {
  IntakeRepository,
} from "../repository/intakeRepository"
import type { IntakeDTO } from "./dto/IntakeDTO"
import type { CreateIntakeInput, UpdateIntakeInput } from "./dto/IntakeContracts"
import type { WorkspaceService } from "./workspaceService"

const requireNonEmpty = (value: string, fieldName: string): string => {
  const normalized = value.trim()
  if (!normalized) throw new Error(`${fieldName} is required`)
  return normalized
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
    return this.intakeRepository.createIntake({
      ...input,
      first_name: requireNonEmpty(input.first_name, "first_name"),
      last_name: requireNonEmpty(input.last_name, "last_name"),
      email: requireNonEmpty(input.email, "email"),
    })
  }

  async listIntakes(): Promise<IntakeDTO[]> {
    return this.intakeRepository.listIntakes()
  }

  async updateIntake(id: string, input: UpdateIntakeInput): Promise<IntakeDTO> {
    return this.intakeRepository.updateIntake(requireNonEmpty(id, "id"), input)
  }

  async convertIntakeToWorkspace(
    id: string,
  ): Promise<{ intake: IntakeDTO; workspace: Awaited<ReturnType<WorkspaceService["createWorkspace"]>> }> {
    const intakeId = requireNonEmpty(id, "id")
    const intake = await this.intakeRepository.getIntakeById(intakeId)
    if (!intake) throw new Error("Intake not found")
    if (intake.status === "converted") throw new Error("Intake already converted")

    const workspace = await this.workspaceService.createWorkspace({
      workspace_name: `${intake.first_name} ${intake.last_name}`.trim(),
      workspace_slug: `${intake.first_name}-${intake.last_name}`.toLowerCase().replace(/\s+/g, "-"),
    })
    const updatedIntake = await this.intakeRepository.convertToWorkspace(intake.id, workspace.id)

    return { intake: updatedIntake, workspace }
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
