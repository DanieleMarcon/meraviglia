import { IntakeService, setIntakeService } from "../intakeService"
import { setWorkspaceService, WorkspaceService } from "../workspaceService"
import { SupabaseIntakeRepository } from "../../infra/supabaseIntakeRepository"
import { SupabaseWorkspaceRepository } from "../../infra/supabaseWorkspaceRepository"
import { SupabaseAuthRepository } from "../../infra/supabaseAuthRepository"
import { setAuthRepository } from "../authService"

export const configureApplication = (): void => {
  const workspaceRepository = new SupabaseWorkspaceRepository()
  const workspaceService = new WorkspaceService(workspaceRepository)

  const intakeRepository = new SupabaseIntakeRepository()
  const intakeService = new IntakeService(intakeRepository, workspaceService)

  const authRepository = new SupabaseAuthRepository()

  setWorkspaceService(workspaceService)
  setIntakeService(intakeService)
  setAuthRepository(authRepository)
}
