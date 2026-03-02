import { useAppState } from "./useAppState"

export function useServiceCatalog() {
  const { services, addService, removeService } = useAppState()

  return {
    services,
    addService,
    removeService,
  }
}
