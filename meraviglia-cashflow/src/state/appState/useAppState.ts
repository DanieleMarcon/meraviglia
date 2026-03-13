import { useSyncExternalStore, type SetStateAction } from "react"
import { v4 as uuidv4 } from "uuid"

import type {
  PianoStrategico,
  ProposalSectionTypeValue as ProposalSectionType,
  Proposta,
  ServiceDefinition,
  TipoPagamento,
} from "../../application/dto/StrategicPlanDTO"
import {
  MANDATORY_PROPOSAL_SECTIONS,
  type SectionToggleState,
} from "../../application/proposalDocumentSectionToggles"
import { normalizeProposalForWrite } from "../../application/strategicPlanningService"
import { decodeCashflowBootstrapPayload } from "../persistence/cashflowBootstrapDecoder"
import { loadFromStorage, loadRawFromStorage, saveToStorage } from "../persistence/storage"

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

interface AppStateStore {
  services: ServiceDefinition[]
  piano: PianoStrategico
  propostaA: Proposta
  propostaB: Proposta
  sectionToggles: SectionToggleState
}

const isServiceDefinitionArray = (value: unknown): value is ServiceDefinition[] =>
  Array.isArray(value)

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

const areValuesEqual = (left: unknown, right: unknown): boolean => {
  return JSON.stringify(left) === JSON.stringify(right)
}


const buildProposalServiceFromCatalogSelection = (
  catalogServiceId: string,
  services: ServiceDefinition[],
): Proposta["servizi"][number] | null => {
  const serviceDefinition = services.find((service) => service.id === catalogServiceId)

  if (!serviceDefinition) {
    return null
  }

  return {
    service: {
      id: uuidv4(),
      catalogServiceId,
      nome: serviceDefinition.nome,
      prezzoPieno: serviceDefinition.prezzoPieno,
      prezzoScontato: serviceDefinition.prezzoScontato,
      usaPrezzoScontato: true,
      durataOperativa: serviceDefinition.durataStandard,
      meseInizio: 1,
      consentiRateizzazione: serviceDefinition.consentiRateizzazione,
      consentiAcconto: serviceDefinition.consentiAcconto,
      color: serviceDefinition.color,
    },
    strategiaPagamento: {
      tipo: "oneShot",
    },
  }
}

interface PaymentStrategyIntent {
  serviceId: string
  tipo?: TipoPagamento
  numeroRate?: number
}

interface ServiceStartMonthIntent {
  serviceId: string
  month: number
}

const applyPaymentStrategyIntent = (
  proposta: Proposta,
  intent: PaymentStrategyIntent,
): Proposta => ({
  ...proposta,
  servizi: proposta.servizi.map((propostaService) => {
    if (propostaService.service.id !== intent.serviceId) {
      return propostaService
    }

    return {
      ...propostaService,
      strategiaPagamento: {
        ...propostaService.strategiaPagamento,
        ...(intent.tipo ? { tipo: intent.tipo } : {}),
        ...(intent.numeroRate !== undefined ? { numeroRate: intent.numeroRate } : {}),
      },
    }
  }),
})

const applyServiceStartMonthIntent = (
  proposta: Proposta,
  intent: ServiceStartMonthIntent,
): Proposta => ({
  ...proposta,
  servizi: proposta.servizi.map((propostaService) => {
    if (propostaService.service.id !== intent.serviceId) {
      return propostaService
    }

    return {
      ...propostaService,
      service: {
        ...propostaService.service,
        meseInizio: intent.month,
      },
    }
  }),
})

const createInitialState = (): AppStateStore => {
  const rawPersistedCashflow = loadRawFromStorage(CASHFLOW_STORAGE_KEY)
  const decodedBootstrap = decodeCashflowBootstrapPayload(rawPersistedCashflow)
  const persistedCashflow = decodedBootstrap.payload
  const persistedServices = loadFromStorage(SERVICE_CATALOG_STORAGE_KEY, isServiceDefinitionArray) ?? []
  const { services, changed } = ensureServiceColors(persistedServices)

  if (changed) {
    saveToStorage(SERVICE_CATALOG_STORAGE_KEY, services)
  }

  const piano = persistedCashflow?.piano ?? DEFAULT_PIANO
  const propostaA = persistedCashflow?.propostaA ?? createDefaultPropostaA()
  const propostaB = persistedCashflow?.propostaB ?? createDefaultPropostaB()
  const sectionToggles = decodedBootstrap.sectionToggles

  MANDATORY_PROPOSAL_SECTIONS.forEach((sectionType) => {
    sectionToggles[sectionType] = true
  })

  const normalizedPropostaA = normalizeProposalForWrite(propostaA, piano, services)
  const normalizedPropostaB = normalizeProposalForWrite(propostaB, piano, services)

  if (persistedCashflow) {
    const shouldPersistNormalizedCashflow =
      !areValuesEqual(persistedCashflow.propostaA, normalizedPropostaA)
      || !areValuesEqual(persistedCashflow.propostaB, normalizedPropostaB)
      || !areValuesEqual(persistedCashflow.sectionToggles, sectionToggles)

    if (shouldPersistNormalizedCashflow) {
      saveToStorage(CASHFLOW_STORAGE_KEY, {
        piano,
        propostaA: normalizedPropostaA,
        propostaB: normalizedPropostaB,
        sectionToggles,
      })
    }
  }

  return {
    services,
    piano,
    propostaA: normalizedPropostaA,
    propostaB: normalizedPropostaB,
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
      propostaA: normalizeProposalForWrite(store.propostaA, nextPiano, store.services),
      propostaB: normalizeProposalForWrite(store.propostaB, nextPiano, store.services),
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

  const addCatalogServiceToPropostaA = (catalogServiceId: string) => {
    const newService = buildProposalServiceFromCatalogSelection(catalogServiceId, store.services)

    if (!newService) {
      return
    }

    setStore({
      ...store,
      propostaA: normalizeProposalForWrite(
        {
          ...store.propostaA,
          servizi: [...store.propostaA.servizi, newService],
        },
        store.piano,
        store.services,
      ),
    })
  }

  const updatePropostaAServicePaymentStrategy = (intent: PaymentStrategyIntent) => {
    setStore({
      ...store,
      propostaA: normalizeProposalForWrite(
        applyPaymentStrategyIntent(store.propostaA, intent),
        store.piano,
        store.services,
      ),
    })
  }

  const updatePropostaAServiceStartMonth = (intent: ServiceStartMonthIntent) => {
    setStore({
      ...store,
      propostaA: normalizeProposalForWrite(
        applyServiceStartMonthIntent(store.propostaA, intent),
        store.piano,
        store.services,
      ),
    })
  }

  const updatePropostaBServiceStartMonth = (intent: ServiceStartMonthIntent) => {
    setStore({
      ...store,
      propostaB: normalizeProposalForWrite(
        applyServiceStartMonthIntent(store.propostaB, intent),
        store.piano,
        store.services,
      ),
    })
  }

  const addService = (data: Omit<ServiceDefinition, "id">) => {
    const id = uuidv4()
    const nextServices = [...store.services, { ...data, id, color: data.color ?? generateDeterministicColorFromId(id) }]

    setStore({
      ...store,
      services: nextServices,
      propostaA: normalizeProposalForWrite(store.propostaA, store.piano, nextServices),
      propostaB: normalizeProposalForWrite(store.propostaB, store.piano, nextServices),
    })
  }

  const removeService = (id: string) => {
    const nextServices = store.services.filter((service) => service.id !== id)

    setStore({
      ...store,
      services: nextServices,
      propostaA: normalizeProposalForWrite(store.propostaA, store.piano, nextServices),
      propostaB: normalizeProposalForWrite(store.propostaB, store.piano, nextServices),
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
    addCatalogServiceToPropostaA,
    updatePropostaAServicePaymentStrategy,
    updatePropostaAServiceStartMonth,
    updatePropostaBServiceStartMonth,
    addService,
    removeService,
    setSectionEnabled,
  }
}
