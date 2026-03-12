import { createServiceCatalogService } from "../../application/serviceCatalogService"
import { useAppState } from "./useAppState"

export function useServiceCatalog() {
  const { services, addService, removeService } = useAppState()

  return createServiceCatalogService({
    services,
    addService,
    removeService,
  })
}
