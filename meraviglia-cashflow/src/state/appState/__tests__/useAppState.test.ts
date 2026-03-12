import { beforeEach, describe, expect, it, vi } from "vitest"

import { ProposalSectionType, type PianoStrategico, type Proposta, type ServiceDefinition } from "../../../application/dto/StrategicPlanDTO"

interface PersistedFixtures {
  services?: ServiceDefinition[]
  cashflow?: {
    propostaA: Proposta
    propostaB: Proposta
    piano: PianoStrategico
    sectionToggles?: Partial<Record<ProposalSectionType, boolean>>
  }
}

const basePlan: PianoStrategico = {
  durataTotale: 6,
  moduli: [{ nome: "Launch", meseInizio: 1, durata: 6 }],
}

const baseCatalog: ServiceDefinition[] = [
  {
    id: "svc-rate",
    nome: "Rate Limited Service",
    categoria: "Ops",
    prezzoPieno: 1200,
    prezzoScontato: 1000,
    durataStandard: 4,
    consentiRateizzazione: true,
    consentiAcconto: true,
    maxRateConsentite: 3,
  },
  {
    id: "svc-one-shot",
    nome: "One Shot Service",
    categoria: "Ops",
    prezzoPieno: 900,
    prezzoScontato: 900,
    durataStandard: 3,
    color: "#7c3aed",
    consentiRateizzazione: false,
    consentiAcconto: false,
    maxRateConsentite: 1,
  },
]

const propostaASeed: Proposta = {
  id: "proposal-a",
  nome: "A",
  servizi: [
    {
      service: {
        id: "proposal-a-s1",
        nome: "Rate Limited Service",
        prezzoPieno: 1200,
        prezzoScontato: 1000,
        usaPrezzoScontato: false,
        durataOperativa: 8,
        meseInizio: 5,
        consentiRateizzazione: true,
        consentiAcconto: true,
        maxRateConsentite: 10,
      },
      strategiaPagamento: { tipo: "rate", numeroRate: 9 },
    },
  ],
}

const propostaBSeed: Proposta = {
  id: "proposal-b",
  nome: "B",
  servizi: [
    {
      service: {
        id: "proposal-b-s1",
        nome: "One Shot Service",
        prezzoPieno: 900,
        prezzoScontato: 900,
        usaPrezzoScontato: false,
        durataOperativa: 3,
        meseInizio: 4,
        consentiRateizzazione: false,
        consentiAcconto: false,
      },
      strategiaPagamento: { tipo: "accontoRate", numeroRate: 4, percentualeAcconto: 0.5 },
    },
  ],
}

const propostaBRateSeed: Proposta = {
  id: "proposal-b-rate",
  nome: "B-rate",
  servizi: [
    {
      service: {
        id: "proposal-b-rate-s1",
        nome: "Rate Limited Service",
        prezzoPieno: 1200,
        prezzoScontato: 1000,
        usaPrezzoScontato: false,
        durataOperativa: 6,
        meseInizio: 2,
        consentiRateizzazione: true,
        consentiAcconto: true,
      },
      strategiaPagamento: { tipo: "rate", numeroRate: 6 },
    },
  ],
}

const loadUseAppState = async (fixtures: PersistedFixtures = {}) => {
  vi.resetModules()

  const loadFromStorage = vi.fn((key: string) => {
    if (key === "meraviglia-cashflow") {
      return fixtures.cashflow
    }

    if (key === "meraviglia-service-catalog") {
      return fixtures.services
    }

    return undefined
  })
  const saveToStorage = vi.fn()

  vi.doMock("react", () => ({
    useSyncExternalStore: (_subscribe: unknown, getSnapshot: () => unknown) => getSnapshot(),
  }))

  vi.doMock("uuid", () => ({
    v4: vi.fn(() => "generated-id"),
  }))

  vi.doMock("../../persistence/storage", () => ({
    loadFromStorage,
    saveToStorage,
  }))

  const appState = await import("../useAppState")

  return {
    useAppState: appState.useAppState,
    saveToStorage,
  }
}

describe("useAppState compare/proposal orchestration", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it("normalizes persisted proposal A/B inputs through the write path and enforces mandatory section toggles on load", async () => {
    const { useAppState, saveToStorage } = await loadUseAppState({
      services: baseCatalog,
      cashflow: {
        piano: basePlan,
        propostaA: propostaASeed,
        propostaB: propostaBSeed,
        sectionToggles: {
          [ProposalSectionType.COVER]: false,
          [ProposalSectionType.CLOSING]: false,
          [ProposalSectionType.PRESENTATION]: false,
        },
      },
    })

    const state = useAppState()

    expect(state.services[0]?.color).toMatch(/^hsl\(/)
    expect(state.propostaA.servizi[0]?.service.durataOperativa).toBe(2)
    expect(state.propostaA.servizi[0]?.strategiaPagamento).toEqual({ tipo: "rate", numeroRate: 2 })
    expect(state.propostaB.servizi[0]?.strategiaPagamento).toEqual({ tipo: "oneShot" })
    expect(state.sectionToggles[ProposalSectionType.COVER]).toBe(true)
    expect(state.sectionToggles[ProposalSectionType.CLOSING]).toBe(true)
    expect(state.sectionToggles[ProposalSectionType.PRESENTATION]).toBe(false)

    expect(saveToStorage).toHaveBeenCalledTimes(1)
    expect(saveToStorage).toHaveBeenCalledWith(
      "meraviglia-service-catalog",
      expect.arrayContaining([
        expect.objectContaining({ id: "svc-rate", color: expect.stringMatching(/^hsl\(/) }),
      ])
    )
  })

  it("sanitizes proposal A on write and persists the full compare payload", async () => {
    const { useAppState, saveToStorage } = await loadUseAppState({
      services: baseCatalog,
      cashflow: {
        piano: basePlan,
        propostaA: propostaASeed,
        propostaB: propostaBSeed,
      },
    })

    const state = useAppState()

    state.setPropostaA((current) => ({
      ...current,
      servizi: [
        {
          ...current.servizi[0]!,
          strategiaPagamento: { tipo: "rate", numeroRate: 99 },
          service: {
            ...current.servizi[0]!.service,
            durataOperativa: 99,
          },
        },
      ],
    }))

    const updated = useAppState()
    expect(updated.propostaA.servizi[0]?.service.durataOperativa).toBe(2)
    expect(updated.propostaA.servizi[0]?.strategiaPagamento).toEqual({ tipo: "rate", numeroRate: 2 })

    expect(saveToStorage).toHaveBeenLastCalledWith("meraviglia-cashflow", {
      piano: updated.piano,
      propostaA: updated.propostaA,
      propostaB: updated.propostaB,
      sectionToggles: updated.sectionToggles,
    })
  })

  it("sanitizes proposal B on write via domain normalization and keeps mandatory section types enabled", async () => {
    const { useAppState, saveToStorage } = await loadUseAppState({
      services: baseCatalog,
      cashflow: {
        piano: basePlan,
        propostaA: propostaASeed,
        propostaB: propostaBSeed,
      },
    })

    const state = useAppState()

    state.setPropostaB((current) => ({
      ...current,
      servizi: [
        {
          ...current.servizi[0]!,
          service: {
            ...current.servizi[0]!.service,
            durataOperativa: 99,
          },
          strategiaPagamento: { tipo: "accontoRate", numeroRate: 7, percentualeAcconto: 0.3 },
        },
      ],
    }))

    state.setSectionEnabled(ProposalSectionType.PRESENTATION, false)
    state.setSectionEnabled(ProposalSectionType.COVER, false)

    const updated = useAppState()

    expect(updated.propostaB.servizi[0]?.service.durataOperativa).toBe(3)
    expect(updated.propostaB.servizi[0]?.strategiaPagamento).toEqual({ tipo: "oneShot" })
    expect(updated.sectionToggles[ProposalSectionType.PRESENTATION]).toBe(false)
    expect(updated.sectionToggles[ProposalSectionType.COVER]).toBe(true)

    expect(saveToStorage).toHaveBeenLastCalledWith("meraviglia-cashflow", {
      piano: updated.piano,
      propostaA: updated.propostaA,
      propostaB: updated.propostaB,
      sectionToggles: updated.sectionToggles,
    })
  })

  it("re-normalizes both proposals when setPiano updates plan duration and persists compare payload", async () => {
    const { useAppState, saveToStorage } = await loadUseAppState({
      services: baseCatalog,
      cashflow: {
        piano: basePlan,
        propostaA: propostaASeed,
        propostaB: propostaBRateSeed,
      },
    })

    const state = useAppState()

    state.setPiano((current) => ({
      ...current,
      durataTotale: 3,
      moduli: [{ nome: "Compressed", meseInizio: 1, durata: 3 }],
    }))

    const updated = useAppState()

    expect(updated.propostaA.servizi[0]?.service.durataOperativa).toBe(1)
    expect(updated.propostaA.servizi[0]?.strategiaPagamento).toEqual({ tipo: "rate", numeroRate: 1 })
    expect(updated.propostaB.servizi[0]?.service.durataOperativa).toBe(2)
    expect(updated.propostaB.servizi[0]?.strategiaPagamento).toEqual({ tipo: "rate", numeroRate: 2 })

    expect(saveToStorage).toHaveBeenLastCalledWith("meraviglia-cashflow", {
      piano: updated.piano,
      propostaA: updated.propostaA,
      propostaB: updated.propostaB,
      sectionToggles: updated.sectionToggles,
    })
  })

  it("re-normalizes proposals when addService introduces catalog constraints and persists both storage keys", async () => {
    const longPlan: PianoStrategico = {
      durataTotale: 12,
      moduli: [{ nome: "Long", meseInizio: 1, durata: 12 }],
    }

    const propostaALongSeed: Proposta = {
      ...propostaASeed,
      servizi: [
        {
          ...propostaASeed.servizi[0]!,
          service: {
            ...propostaASeed.servizi[0]!.service,
            meseInizio: 1,
            durataOperativa: 12,
            maxRateConsentite: undefined,
          },
          strategiaPagamento: { tipo: "rate", numeroRate: 8 },
        },
      ],
    }

    const { useAppState, saveToStorage } = await loadUseAppState({
      services: [],
      cashflow: {
        piano: longPlan,
        propostaA: propostaALongSeed,
        propostaB: propostaBRateSeed,
      },
    })

    const state = useAppState()
    expect(state.propostaA.servizi[0]?.strategiaPagamento).toEqual({ tipo: "rate", numeroRate: 8 })
    expect(state.propostaB.servizi[0]?.strategiaPagamento).toEqual({ tipo: "rate", numeroRate: 6 })
    expect(state.propostaA.servizi[0]?.service.color).toBeUndefined()

    state.addService({
      nome: "Rate Limited Service",
      categoria: "Ops",
      prezzoPieno: 1200,
      prezzoScontato: 1000,
      durataStandard: 4,
      consentiRateizzazione: true,
      consentiAcconto: true,
      maxRateConsentite: 3,
    })

    const updated = useAppState()

    expect(updated.services).toEqual([
      expect.objectContaining({ id: "generated-id", color: expect.stringMatching(/^hsl\(/) }),
    ])
    expect(updated.propostaA.servizi[0]?.strategiaPagamento).toEqual({ tipo: "rate", numeroRate: 8 })
    expect(updated.propostaB.servizi[0]?.strategiaPagamento).toEqual({ tipo: "rate", numeroRate: 6 })
    expect(updated.propostaA.servizi[0]?.service.color).toMatch(/^hsl\(/)

    expect(saveToStorage).toHaveBeenNthCalledWith(1, "meraviglia-service-catalog", updated.services)
    expect(saveToStorage).toHaveBeenNthCalledWith(2, "meraviglia-cashflow", {
      piano: updated.piano,
      propostaA: updated.propostaA,
      propostaB: updated.propostaB,
      sectionToggles: updated.sectionToggles,
    })
  })

  it("removeService updates catalog and persists compare payload while preserving normalized proposals", async () => {
    const { useAppState, saveToStorage } = await loadUseAppState({
      services: baseCatalog,
      cashflow: {
        piano: basePlan,
        propostaA: propostaASeed,
        propostaB: propostaBRateSeed,
      },
    })

    const state = useAppState()

    state.removeService("svc-rate")

    const updated = useAppState()
    expect(updated.services.map((service) => service.id)).toEqual(["svc-one-shot"])
    expect(updated.propostaA.servizi[0]?.strategiaPagamento).toEqual({ tipo: "rate", numeroRate: 2 })
    expect(updated.propostaB.servizi[0]?.strategiaPagamento).toEqual({ tipo: "rate", numeroRate: 3 })

    expect(saveToStorage).toHaveBeenLastCalledWith("meraviglia-cashflow", {
      piano: updated.piano,
      propostaA: updated.propostaA,
      propostaB: updated.propostaB,
      sectionToggles: updated.sectionToggles,
    })
  })
})
