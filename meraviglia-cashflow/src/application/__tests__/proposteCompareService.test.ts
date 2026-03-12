import { describe, expect, it } from "vitest"
import { buildCashflowData } from "../proposteCompareService"
import type { PianoStrategico, Proposta, PropostaService } from "../dto/StrategicPlanDTO"

const basePiano = (durataTotale: number): PianoStrategico => ({
  durataTotale,
  moduli: [{ nome: "Modulo A", meseInizio: 1, durata: durataTotale }],
})

const buildService = (
  overrides: Partial<PropostaService["service"]> = {},
): PropostaService["service"] => ({
  id: "svc-1",
  nome: "SEO",
  prezzoPieno: 1200,
  prezzoScontato: 1000,
  usaPrezzoScontato: false,
  durataOperativa: 1,
  meseInizio: 1,
  consentiRateizzazione: true,
  consentiAcconto: true,
  maxRateConsentite: 12,
  ...overrides,
})

const buildProposta = (
  servizi: PropostaService[],
): Proposta => ({
  id: "p-1",
  nome: "Proposta Test",
  servizi,
})

describe("proposteCompareService.buildCashflowData", () => {
  it("calcola oneShot sul mese di inizio", () => {
    const proposta = buildProposta([
      { service: buildService({ meseInizio: 2, prezzoPieno: 800 }), strategiaPagamento: { tipo: "oneShot" } },
    ])

    const result = buildCashflowData(proposta, basePiano(4))

    expect(result.data).toEqual([
      { month: "M1" },
      { month: "M2", "svc-1": 800 },
      { month: "M3" },
      { month: "M4" },
    ])
    expect(result.services).toEqual([{ key: "svc-1", runtimeServiceId: "svc-1", catalogServiceId: "svc-1", name: "SEO", color: "#111827" }])
  })

  it("distribuisce rate su numeroRate dal mese di inizio", () => {
    const proposta = buildProposta([
      { service: buildService({ meseInizio: 3, prezzoPieno: 900 }), strategiaPagamento: { tipo: "rate", numeroRate: 3 } },
    ])

    const result = buildCashflowData(proposta, basePiano(6))

    expect(result.data.map((month) => month["svc-1"] ?? 0)).toEqual([0, 0, 300, 300, 300, 0])
  })

  it("calcola abbonamento per durata operativa entro i limiti del piano", () => {
    const proposta = buildProposta([
      {
        service: buildService({ meseInizio: 4, durataOperativa: 4, prezzoPieno: 250 }),
        strategiaPagamento: { tipo: "abbonamento" },
      },
    ])

    const result = buildCashflowData(proposta, basePiano(6))

    expect(result.data.map((month) => month["svc-1"] ?? 0)).toEqual([0, 0, 0, 250, 250, 250])
  })

  it("calcola accontoRate con acconto iniziale e rate successive", () => {
    const proposta = buildProposta([
      {
        service: buildService({ meseInizio: 2, prezzoPieno: 1000 }),
        strategiaPagamento: { tipo: "accontoRate", percentualeAcconto: 0.4, numeroRate: 3 },
      },
    ])

    const result = buildCashflowData(proposta, basePiano(6))

    expect(result.data.map((month) => month["svc-1"] ?? 0)).toEqual([0, 400, 200, 200, 200, 0])
  })

  it("somma contributi di servizi diversi nello stesso mese mantenendo serie separate", () => {
    const proposta = buildProposta([
      {
        service: buildService({ id: "svc-1", nome: "SEO", prezzoPieno: 1200, meseInizio: 1 }),
        strategiaPagamento: { tipo: "rate", numeroRate: 2 },
      },
      {
        service: buildService({ id: "svc-2", nome: "Ads", prezzoPieno: 300, meseInizio: 2, color: "#2563eb" }),
        strategiaPagamento: { tipo: "oneShot" },
      },
    ])

    const result = buildCashflowData(proposta, basePiano(3))

    expect(result.data).toEqual([
      { month: "M1", "svc-1": 600 },
      { month: "M2", "svc-1": 600, "svc-2": 300 },
      { month: "M3" },
    ])
    expect(result.services).toEqual([
      { key: "svc-1", runtimeServiceId: "svc-1", catalogServiceId: "svc-1", name: "SEO", color: "#111827" },
      { key: "svc-2", runtimeServiceId: "svc-2", catalogServiceId: "svc-2", name: "Ads", color: "#2563eb" },
    ])
  })

  it("usa prezzo scontato quando abilitato", () => {
    const proposta = buildProposta([
      {
        service: buildService({ prezzoPieno: 1200, prezzoScontato: 900, usaPrezzoScontato: true }),
        strategiaPagamento: { tipo: "oneShot" },
      },
    ])

    const result = buildCashflowData(proposta, basePiano(2))

    expect(result.data).toEqual([{ month: "M1", "svc-1": 900 }, { month: "M2" }])
  })

  it("espone catalogServiceId nella serie mantenendo key runtime per compatibilita chart", () => {
    const proposta = buildProposta([
      {
        service: buildService({ id: "runtime-1", catalogServiceId: "catalog-1", nome: "SEO" }),
        strategiaPagamento: { tipo: "oneShot" },
      },
    ])

    const result = buildCashflowData(proposta, basePiano(1))

    expect(result.services).toEqual([
      {
        key: "runtime-1",
        runtimeServiceId: "runtime-1",
        catalogServiceId: "catalog-1",
        name: "SEO",
        color: "#111827",
      },
    ])
    expect(result.data).toEqual([{ month: "M1", "runtime-1": 1200 }])
  })

})
