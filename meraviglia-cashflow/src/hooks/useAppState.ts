import { useSyncExternalStore, type SetStateAction } from "react"
import { v4 as uuidv4 } from "uuid"

import type { PianoStrategico } from "../models/PianoStrategico"
import type { Proposta } from "../models/Proposta"
import type { ServiceDefinition } from "../models/ServiceDefinition"
import { loadFromStorage, saveToStorage } from "../utils/storage"

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
}

interface AppStateStore {
  services: ServiceDefinition[]
  piano: PianoStrategico
  propostaA: Proposta
  propostaB: Proposta
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

const createInitialState = (): AppStateStore => {
  const persistedCashflow = loadFromStorage(CASHFLOW_STORAGE_KEY, isPersistedCashflowState)
  const services = loadFromStorage(SERVICE_CATALOG_STORAGE_KEY, isServiceDefinitionArray) ?? []

  return {
    services,
    piano: persistedCashflow?.piano ?? DEFAULT_PIANO,
    propostaA: persistedCashflow?.propostaA ?? createDefaultPropostaA(),
    propostaB: persistedCashflow?.propostaB ?? createDefaultPropostaB(),
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
    })
  }

  const setPropostaA = (value: SetStateAction<Proposta>) => {
    const nextPropostaA = typeof value === "function"
      ? value(store.propostaA)
      : value

    setStore({
      ...store,
      propostaA: nextPropostaA,
    })
  }

  const setPropostaB = (value: SetStateAction<Proposta>) => {
    const nextPropostaB = typeof value === "function"
      ? value(store.propostaB)
      : value

    setStore({
      ...store,
      propostaB: nextPropostaB,
    })
  }

  const addService = (data: Omit<ServiceDefinition, "id">) => {
    setStore({
      ...store,
      services: [...store.services, { ...data, id: uuidv4() }],
    })
  }

  const removeService = (id: string) => {
    setStore({
      ...store,
      services: store.services.filter((service) => service.id !== id),
    })
  }

  return {
    ...snapshot,
    setPiano,
    setPropostaA,
    setPropostaB,
    addService,
    removeService,
  }
}
