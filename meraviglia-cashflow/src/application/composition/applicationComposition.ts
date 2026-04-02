import { IntakeService, setIntakeService } from "../intakeService"
import { setWorkspaceService, WorkspaceService } from "../workspaceService"
import { ContactService, setContactService } from "../contactService"
import { SupabaseIntakeRepository } from "../../infra/supabaseIntakeRepository"
import { SupabaseWorkspaceRepository } from "../../infra/supabaseWorkspaceRepository"
import { SupabaseContactRepository } from "../../infra/supabaseContactRepository"
import { SupabaseAuthRepository } from "../../infra/supabaseAuthRepository"
import { SupabaseInteractionRepository } from "../../infra/supabaseInteractionRepository"
import { setAuthRepository } from "../authService"
import { InteractionService, setInteractionService } from "../interactionService"
import { SupabaseOrganizationAccessRepository } from "../../infra/supabaseOrganizationAccessRepository"
import { OrganizationAccessService, setOrganizationAccessService } from "../organizationAccessService"

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

  const interactionRepository = new SupabaseInteractionRepository()
  const interactionService = new InteractionService(interactionRepository)

  const authRepository = new SupabaseAuthRepository()
  const organizationAccessRepository = new SupabaseOrganizationAccessRepository()
  const organizationAccessService = new OrganizationAccessService(organizationAccessRepository)

  setWorkspaceService(workspaceService)
  setIntakeService(intakeService)
  setContactService(contactService)
  setInteractionService(interactionService)
  setAuthRepository(authRepository)
  setOrganizationAccessService(organizationAccessService)
}
