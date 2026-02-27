import { useState, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import type { ServiceDefinition } from "../models/ServiceDefinition"

const STORAGE_KEY = "meraviglia-service-catalog"

export function useServiceCatalog() {

  const [services, setServices] = useState<ServiceDefinition[]>([])

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      setServices(JSON.parse(stored))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(services))
  }, [services])

  const addService = (data: Omit<ServiceDefinition, "id">) => {
    const newService: ServiceDefinition = {
      ...data,
      id: uuidv4(),
    }
    setServices(prev => [...prev, newService])
  }

  const removeService = (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id))
  }

  return {
    services,
    addService,
    removeService,
  }
}