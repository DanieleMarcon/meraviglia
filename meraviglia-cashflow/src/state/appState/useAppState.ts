import { useSyncExternalStore, type SetStateAction } from "react"
import { v4 as uuidv4 } from "uuid"

import type {
  PianoStrategico,
  ProposalSectionTypeValue as ProposalSectionType,
  Proposta,
  ServiceDefinition,
} from "../../application/dto/StrategicPlanDTO"
import {
  createDefaultSectionToggleState,
  MANDATORY_PROPOSAL_SECTIONS,
  type SectionToggleState,
} from "../../application/proposalDocumentSectionToggles"
import { normalizeProposalForWrite, sanitizeProposalAtBoundary } from "../../application/strategicPlanningService"
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

const normalizeHue = (value: number): number => ((value % 360) + 360) % 360

const generateDeterministicColorFromId = (id: string): string => {
  let hash = 0

  for (let index = 0; index < id.length; index += 1) {
    hash = ((hash << 5) - hash) + id.charCodeAt(index)
    hash |= 0
  }

  const hue = normalizeHue(hash)
  return `hsl(${hue} 65% 45%)`
}

const ensureServiceColors = (services: ServiceDefinition[]): { services: ServiceDefinition[]; changed: boolean } => {
  let changed = false

  const nextServices = services.map((service) => {
    if (service.color) {
      return service
    }

    changed = true
    return {
      ...service,
      color: generateDeterministicColorFromId(service.id),
    }
  })

  return { services: nextServices, changed }
}

const createInitialState = (): AppStateStore => {
  const persistedCashflow = loadFromStorage(CASHFLOW_STORAGE_KEY, isPersistedCashflowState)
  const persistedServices = loadFromStorage(SERVICE_CATALOG_STORAGE_KEY, isServiceDefinitionArray) ?? []
  const { services, changed } = ensureServiceColors(persistedServices)

  if (changed) {
    saveToStorage(SERVICE_CATALOG_STORAGE_KEY, services)
  }

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
    propostaA: sanitizeProposalAtBoundary(propostaA, piano, services),
    propostaB: sanitizeProposalAtBoundary(propostaB, piano, services),
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
      propostaA: sanitizeProposalAtBoundary(store.propostaA, nextPiano, store.services),
      propostaB: sanitizeProposalAtBoundary(store.propostaB, nextPiano, store.services),
    })
  }

  const setPropostaA = (value: SetStateAction<Proposta>) => {
    const nextPropostaA = typeof value === "function"
      ? value(store.propostaA)
      : value

    setStore({
      ...store,
      propostaA: normalizeProposalForWrite(nextPropostaA, store.piano, store.services),
    })
  }

  const setPropostaB = (value: SetStateAction<Proposta>) => {
    const nextPropostaB = typeof value === "function"
      ? value(store.propostaB)
      : value

    setStore({
      ...store,
      propostaB: normalizeProposalForWrite(nextPropostaB, store.piano, store.services),
    })
  }

  const addService = (data: Omit<ServiceDefinition, "id">) => {
    const id = uuidv4()
    const nextServices = [...store.services, { ...data, id, color: data.color ?? generateDeterministicColorFromId(id) }]

    setStore({
      ...store,
      services: nextServices,
      propostaA: sanitizeProposalAtBoundary(store.propostaA, store.piano, nextServices),
      propostaB: sanitizeProposalAtBoundary(store.propostaB, store.piano, nextServices),
    })
  }

  const removeService = (id: string) => {
    const nextServices = store.services.filter((service) => service.id !== id)

    setStore({
      ...store,
      services: nextServices,
      propostaA: sanitizeProposalAtBoundary(store.propostaA, store.piano, nextServices),
      propostaB: sanitizeProposalAtBoundary(store.propostaB, store.piano, nextServices),
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
