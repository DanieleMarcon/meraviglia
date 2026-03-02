import { useSyncExternalStore, type SetStateAction } from "react"
import { v4 as uuidv4 } from "uuid"

import type { PianoStrategico } from "../../domain/models/PianoStrategico"
import type { Proposta } from "../../domain/models/Proposta"
import type { ServiceDefinition } from "../../domain/models/ServiceDefinition"
import {
  createDefaultSectionToggleState,
  MANDATORY_PROPOSAL_SECTIONS,
  type SectionToggleState,
} from "../../domain/models/SectionToggleState"
import type { ProposalSectionType } from "../../domain/models/ProposalSectionType"
import { sanitizePropostaAtBoundary } from "../../domain/validation/domainValidation"
import { loadFromStorage, saveToStorage } from "../persistence/storage"

const SERVICE_CATALOG_STORAGE_KEY = "meraviglia-service-catalog"
const CASHFLOW_STORAGE_KEY = "meraviglia-cashflow"

const DEFAULT_PIANO: PianoStrategico = {
  durataTotale: 12,
  moduli: [
    { nome: "Strutturazione", meseInizio: 1, durata: 3 },
    { nome: "Attivazione", meseInizio: 4, durata: 3 },
    { nome: "Ottimizzazione", meseInizio: 7, durata: 3 },
    { nome: "Scaling", meseInizio: 10, durata: 3 },
  ],
}

const createDefaultPropostaA = (): Proposta => ({
  id: uuidv4(),
  nome: "Piano Completo",
  servizi: [],
})

const createDefaultPropostaB = (): Proposta => ({
  id: uuidv4(),
  nome: "Piano Modulato",
  servizi: [],
})

interface PersistedCashflowState {
  propostaA: Proposta
  propostaB: Proposta
  piano: PianoStrategico
  sectionToggles?: SectionToggleState
}

interface AppStateStore {
  services: ServiceDefinition[]
  piano: PianoStrategico
  propostaA: Proposta
  propostaB: Proposta
  sectionToggles: SectionToggleState
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null

const isPersistedCashflowState = (value: unknown): value is PersistedCashflowState => {
  if (!isObject(value)) {
    return false
  }

  return "piano" in value && "propostaA" in value && "propostaB" in value
}

const isServiceDefinitionArray = (value: unknown): value is ServiceDefinition[] =>
  Array.isArray(value)

const isSectionToggleState = (value: unknown): value is SectionToggleState => {
  if (!isObject(value)) {
    return false
  }

  return Object.values(value).every((toggleValue) => typeof toggleValue === "boolean")
}

const createInitialState = (): AppStateStore => {
  const persistedCashflow = loadFromStorage(CASHFLOW_STORAGE_KEY, isPersistedCashflowState)
  const services = loadFromStorage(SERVICE_CATALOG_STORAGE_KEY, isServiceDefinitionArray) ?? []

  const piano = persistedCashflow?.piano ?? DEFAULT_PIANO
  const propostaA = persistedCashflow?.propostaA ?? createDefaultPropostaA()
  const propostaB = persistedCashflow?.propostaB ?? createDefaultPropostaB()
  const sectionToggles = isSectionToggleState(persistedCashflow?.sectionToggles)
    ? { ...createDefaultSectionToggleState(), ...persistedCashflow.sectionToggles }
    : createDefaultSectionToggleState()

  MANDATORY_PROPOSAL_SECTIONS.forEach((sectionType) => {
    sectionToggles[sectionType] = true
  })

  return {
    services,
    piano,
    propostaA: sanitizePropostaAtBoundary(propostaA, piano, services),
    propostaB: sanitizePropostaAtBoundary(propostaB, piano, services),
    sectionToggles,
  }
}

let store: AppStateStore = createInitialState()

const listeners = new Set<() => void>()

const notifyListeners = () => {
  listeners.forEach((listener) => listener())
}

const setStore = (nextStore: AppStateStore) => {
  store = nextStore

  saveToStorage(SERVICE_CATALOG_STORAGE_KEY, store.services)
  saveToStorage(CASHFLOW_STORAGE_KEY, {
    piano: store.piano,
    propostaA: store.propostaA,
    propostaB: store.propostaB,
    sectionToggles: store.sectionToggles,
  })

  notifyListeners()
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

const getSnapshot = () => store

export function useAppState() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot)

  const setPiano = (value: SetStateAction<PianoStrategico>) => {
    const nextPiano = typeof value === "function"
      ? value(store.piano)
      : value

    setStore({
      ...store,
      piano: nextPiano,
      propostaA: sanitizePropostaAtBoundary(store.propostaA, nextPiano, store.services),
      propostaB: sanitizePropostaAtBoundary(store.propostaB, nextPiano, store.services),
    })
  }

  const setPropostaA = (value: SetStateAction<Proposta>) => {
    const nextPropostaA = typeof value === "function"
      ? value(store.propostaA)
      : value

    setStore({
      ...store,
      propostaA: sanitizePropostaAtBoundary(nextPropostaA, store.piano, store.services),
    })
  }

  const setPropostaB = (value: SetStateAction<Proposta>) => {
    const nextPropostaB = typeof value === "function"
      ? value(store.propostaB)
      : value

    setStore({
      ...store,
      propostaB: sanitizePropostaAtBoundary(nextPropostaB, store.piano, store.services),
    })
  }

  const addService = (data: Omit<ServiceDefinition, "id">) => {
    const nextServices = [...store.services, { ...data, id: uuidv4() }]

    setStore({
      ...store,
      services: nextServices,
      propostaA: sanitizePropostaAtBoundary(store.propostaA, store.piano, nextServices),
      propostaB: sanitizePropostaAtBoundary(store.propostaB, store.piano, nextServices),
    })
  }

  const removeService = (id: string) => {
    const nextServices = store.services.filter((service) => service.id !== id)

    setStore({
      ...store,
      services: nextServices,
      propostaA: sanitizePropostaAtBoundary(store.propostaA, store.piano, nextServices),
      propostaB: sanitizePropostaAtBoundary(store.propostaB, store.piano, nextServices),
    })
  }

  const setSectionEnabled = (sectionType: ProposalSectionType, enabled: boolean) => {
    const nextToggles: SectionToggleState = {
      ...store.sectionToggles,
      [sectionType]: MANDATORY_PROPOSAL_SECTIONS.includes(sectionType)
        ? true
        : enabled,
    }

    setStore({
      ...store,
      sectionToggles: nextToggles,
    })
  }

  return {
    ...snapshot,
    setPiano,
    setPropostaA,
    setPropostaB,
    addService,
    removeService,
    setSectionEnabled,
  }
}
