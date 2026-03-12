import type { ServiceDefinitionDTO } from "./dto/StrategicPlanDTO"

export type ServiceCatalogPort = {
  services: ServiceDefinitionDTO[]
  addService: (data: Omit<ServiceDefinitionDTO, "id">) => void
  removeService: (id: string) => void
}

export function createServiceCatalogService(port: ServiceCatalogPort): ServiceCatalogPort {
  return port
}
