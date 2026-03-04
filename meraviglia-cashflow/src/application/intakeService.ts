import { createWorkspace } from "./workspaceService"
import { SupabaseIntakeRepository } from "../infra/supabaseIntakeRepository"
import type {
  CreateIntakeInput,
  IntakeDTO,
  UpdateIntakeInput,
} from "../repository/intakeRepository"

const intakeRepository = new SupabaseIntakeRepository()

const requireNonEmpty = (value: string, fieldName: string): string => {
  const normalized = value.trim()
  if (!normalized) throw new Error(`${fieldName} is required`)
  return normalized
}

export const createIntake = async (input: CreateIntakeInput): Promise<IntakeDTO> => {
  return intakeRepository.createIntake({
    ...input,
    first_name: requireNonEmpty(input.first_name, "first_name"),
    last_name: requireNonEmpty(input.last_name, "last_name"),
    email: requireNonEmpty(input.email, "email"),
  })
}

export const listIntakes = async (): Promise<IntakeDTO[]> => intakeRepository.listIntakes()

export const updateIntake = async (id: string, input: UpdateIntakeInput): Promise<IntakeDTO> => {
  return intakeRepository.updateIntake(requireNonEmpty(id, "id"), input)
}

export const convertIntakeToWorkspace = async (
  id: string,
): Promise<{ intake: IntakeDTO; workspace: Awaited<ReturnType<typeof createWorkspace>> }> => {
  const intakeId = requireNonEmpty(id, "id")
  const intake = (await intakeRepository.listIntakes()).find((item) => item.id === intakeId)
  if (!intake) throw new Error("Intake not found")
  if (intake.status === "converted") throw new Error("Intake already converted")

  const workspace = await createWorkspace({
    workspace_name: `${intake.first_name} ${intake.last_name}`.trim(),
    workspace_slug: `${intake.first_name}-${intake.last_name}`.toLowerCase().replace(/\s+/g, "-"),
  })
  const updatedIntake = await intakeRepository.convertToWorkspace(intake.id, workspace.id)

  return { intake: updatedIntake, workspace }
}
