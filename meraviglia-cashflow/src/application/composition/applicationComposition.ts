import { IntakeService, setIntakeService } from "../intakeService"
import { setWorkspaceService, WorkspaceService } from "../workspaceService"
import { ContactService, setContactService } from "../contactService"
import { SupabaseIntakeRepository } from "../../infra/supabaseIntakeRepository"
import { SupabaseWorkspaceRepository } from "../../infra/supabaseWorkspaceRepository"
import { SupabaseContactRepository } from "../../infra/supabaseContactRepository"
import { SupabaseAuthRepository } from "../../infra/supabaseAuthRepository"
import { setAuthRepository } from "../authService"

// Composition root: architecture-approved runtime wiring seam where application
// can bind infra implementations. This is a narrow freeze-governed exception and
// must not be copied into generic application service modules.
export const configureApplication = (): void => {
  const workspaceRepository = new SupabaseWorkspaceRepository()
  const workspaceService = new WorkspaceService(workspaceRepository)

  const intakeRepository = new SupabaseIntakeRepository()
  const intakeService = new IntakeService(intakeRepository, workspaceService)

  const contactRepository = new SupabaseContactRepository()
  const contactService = new ContactService(contactRepository)

  const authRepository = new SupabaseAuthRepository()

  setWorkspaceService(workspaceService)
  setIntakeService(intakeService)
  setContactService(contactService)
  setAuthRepository(authRepository)
}
