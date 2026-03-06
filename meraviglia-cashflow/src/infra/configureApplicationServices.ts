import { IntakeService, setIntakeService } from "../application/intakeService"
import { setWorkspaceService, WorkspaceService } from "../application/workspaceService"
import { SupabaseIntakeRepository } from "./supabaseIntakeRepository"
import { SupabaseWorkspaceRepository } from "./supabaseWorkspaceRepository"

export const configureApplicationServices = (): void => {
  const workspaceRepository = new SupabaseWorkspaceRepository()
  const workspaceService = new WorkspaceService(workspaceRepository)

  const intakeRepository = new SupabaseIntakeRepository()
  const intakeService = new IntakeService(intakeRepository, workspaceService)

  setWorkspaceService(workspaceService)
  setIntakeService(intakeService)
}
