import { describe, expect, it } from "vitest"
import {
  mapCompareProjectionToServiceSeriesDTO,
  mapProposalServiceToCompareProjection,
} from "../mappers/proposteCompareMappers"
import type { PropostaService } from "../dto/StrategicPlanDTO"

const buildPropostaService = (
  overrides: Partial<PropostaService["service"]> = {},
): PropostaService => ({
  service: {
    id: "runtime-1",
    nome: "SEO",
    prezzoPieno: 1200,
    prezzoScontato: 900,
    usaPrezzoScontato: false,
    durataOperativa: 4,
    meseInizio: 2,
    consentiRateizzazione: true,
    consentiAcconto: true,
    color: undefined,
    ...overrides,
  },
  strategiaPagamento: {
    tipo: "oneShot",
  },
})

describe("proposteCompareMappers", () => {
  it("maps proposal-service DTO to compare projection with explicit identity ownership", () => {
    const projection = mapProposalServiceToCompareProjection(
      buildPropostaService({ catalogServiceId: "catalog-1" }),
    )

    expect(projection).toEqual({
      runtimeServiceId: "runtime-1",
      catalogServiceId: "catalog-1",
      name: "SEO",
      color: "#111827",
      startMonth: 2,
      effectivePrice: 1200,
      operationalDuration: 4,
      paymentStrategy: { tipo: "oneShot" },
    })
  })

  it("keeps deterministic compatibility fallback for catalog identity when missing", () => {
    const projection = mapProposalServiceToCompareProjection(
      buildPropostaService({ catalogServiceId: undefined }),
    )

    expect(projection.catalogServiceId).toBe("runtime-1")
  })

  it("maps compare projection to chart/service DTO without leaking internal projection shape", () => {
    const serviceSeries = mapCompareProjectionToServiceSeriesDTO({
      runtimeServiceId: "runtime-2",
      catalogServiceId: "catalog-2",
      name: "Ads",
      color: "#2563eb",
      startMonth: 1,
      effectivePrice: 300,
      operationalDuration: 2,
      paymentStrategy: { tipo: "rate", numeroRate: 2 },
    })

    expect(serviceSeries).toEqual({
      key: "runtime-2",
      runtimeServiceId: "runtime-2",
      catalogServiceId: "catalog-2",
      name: "Ads",
      color: "#2563eb",
    })
  })
})
