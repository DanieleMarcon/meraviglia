import type { ServiceDefinitionDTO } from "./dto/StrategicPlanDTO"
import { useAppState } from "../state/appState/useAppState"

export function useServiceCatalogService() {
  const { services, addService, removeService } = useAppState()

  return {
    services,
    addService,
    removeService,
  } as {
    services: ServiceDefinitionDTO[]
    addService: (data: Omit<ServiceDefinitionDTO, "id">) => void
    removeService: (id: string) => void
  }
}
