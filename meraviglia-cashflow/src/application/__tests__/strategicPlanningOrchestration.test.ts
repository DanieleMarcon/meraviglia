import { describe, expect, it } from "vitest"

import {
  calculateCashflow,
  normalizeProposalForWrite,
  resolvePaymentConstraints,
  sanitizeProposalAtBoundary,
} from "../strategicPlanningService"
import { buildCashflowData } from "../proposteCompareService"
import {
  ProposalSectionType,
  type ProposalDTO,
  type ServiceDefinitionDTO,
  type StrategicPlanDTO,
} from "../dto/StrategicPlanDTO"
import { MANDATORY_PROPOSAL_SECTIONS, createDefaultSectionToggleState } from "../proposalDocumentSectionToggles"

const basePlan: StrategicPlanDTO = {
  durataTotale: 6,
  moduli: [{ nome: "Launch", meseInizio: 1, durata: 6 }],
}

const catalog: ServiceDefinitionDTO[] = [
  {
    id: "svc-rate",
    nome: "Rate Limited Service",
    categoria: "Ops",
    prezzoPieno: 600,
    prezzoScontato: 500,
    durataStandard: 4,
    color: "#2563eb",
    consentiRateizzazione: true,
    consentiAcconto: true,
    maxRateConsentite: 2,
  },
  {
    id: "svc-one-shot",
    nome: "One Shot Service",
    categoria: "Ops",
    prezzoPieno: 900,
    prezzoScontato: 900,
    durataStandard: 2,
    color: "#7c3aed",
    consentiRateizzazione: false,
    consentiAcconto: false,
    maxRateConsentite: 1,
  },
]

const proposalA: ProposalDTO = {
  id: "proposal-a",
  nome: "A",
  servizi: [
    {
      service: {
        id: "proposal-a-s1",
        nome: "Rate Limited Service",
        prezzoPieno: 600,
        prezzoScontato: 500,
        usaPrezzoScontato: false,
        durataOperativa: 8,
        meseInizio: 5,
        consentiRateizzazione: true,
        consentiAcconto: true,
        maxRateConsentite: 12,
      },
      strategiaPagamento: { tipo: "rate", numeroRate: 9 },
    },
  ],
}

const proposalB: ProposalDTO = {
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
      strategiaPagamento: { tipo: "accontoRate", numeroRate: 3, percentualeAcconto: 0.4 },
    },
  ],
}

describe("strategic planning compare/proposal orchestration", () => {
  it("normalizes proposal writes through domain-owned constructors", () => {
    const normalized = normalizeProposalForWrite(proposalA, basePlan, catalog)

    expect(normalized.servizi[0]?.service.durataOperativa).toBe(2)
    expect(normalized.servizi[0]?.strategiaPagamento).toEqual({ tipo: "rate", numeroRate: 2 })
  })

  it("sanitizes proposal input and keeps compare chart totals aligned with cashflow output", () => {
    const sanitizedA = sanitizeProposalAtBoundary(proposalA, basePlan, catalog)

    expect(sanitizedA.servizi[0]?.service.durataOperativa).toBe(2)
    expect(sanitizedA.servizi[0]?.service.maxRateConsentite).toBe(12)
    expect(sanitizedA.servizi[0]?.strategiaPagamento).toEqual({ tipo: "rate", numeroRate: 2 })

    const cashflow = calculateCashflow(sanitizedA, basePlan)
    const compare = buildCashflowData(sanitizedA, basePlan)

    const compareTotal = compare.data.reduce((total, month) => {
      const value = month["proposal-a-s1"]
      return total + (typeof value === "number" ? value : 0)
    }, 0)

    expect(compareTotal).toBe(cashflow.totale)
    expect(cashflow.mesi).toEqual([0, 0, 0, 0, 300, 300])
    expect(compare.services).toEqual([
      { key: "proposal-a-s1", runtimeServiceId: "proposal-a-s1", catalogServiceId: "svc-rate", name: "Rate Limited Service", color: "#2563eb" },
    ])
  })

  it("keeps proposal/compare workflow boundary-safe for non-rateizable services and proposal sections", () => {
    const sanitizedB = sanitizeProposalAtBoundary(proposalB, basePlan, catalog)

    expect(sanitizedB.servizi[0]?.strategiaPagamento).toEqual({ tipo: "oneShot" })
    expect(sanitizedB.servizi[0]?.service.durataOperativa).toBe(3)

    const constraints = resolvePaymentConstraints(sanitizedB.servizi[0]!.service, basePlan.durataTotale, catalog)
    expect(constraints).toEqual({ maxRateConsentite: 1, mesiResidui: 3, maxRatePerPiano: 1 })

    const compare = buildCashflowData(sanitizedB, basePlan)
    expect(compare.data).toEqual([
      { month: "M1" },
      { month: "M2" },
      { month: "M3" },
      { month: "M4", "proposal-b-s1": 900 },
      { month: "M5" },
      { month: "M6" },
    ])

    const toggles = createDefaultSectionToggleState()
    toggles[ProposalSectionType.COVER] = false
    toggles[ProposalSectionType.CLOSING] = false

    MANDATORY_PROPOSAL_SECTIONS.forEach((sectionType) => {
      toggles[sectionType] = true
    })

    expect(toggles[ProposalSectionType.COVER]).toBe(true)
    expect(toggles[ProposalSectionType.CLOSING]).toBe(true)
  })
})
