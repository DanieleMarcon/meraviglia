import { describe, expect, it } from "vitest"

import { decodeProposalImportPayload } from "../proposalImportPayloadDecoder"

describe("proposalImportPayloadDecoder", () => {
  it("accepts valid proposal payload and emits canonical proposal", () => {
    const decoded = decodeProposalImportPayload({
      id: "proposal-a",
      nome: "Proposta A",
      servizi: [
        {
          service: {
            id: "runtime-1",
            catalogServiceId: "svc-rate",
            nome: "Servizio Rate",
            prezzoPieno: 1000,
            prezzoScontato: 800,
            usaPrezzoScontato: true,
            durataOperativa: 6,
            meseInizio: 1,
            consentiRateizzazione: true,
            consentiAcconto: true,
            maxRateConsentite: 24,
            color: "#123456",
          },
          strategiaPagamento: {
            tipo: "rate",
            numeroRate: 12,
          },
        },
      ],
    })

    expect(decoded).toEqual({
      id: "proposal-a",
      nome: "Proposta A",
      servizi: [
        {
          service: {
            id: "runtime-1",
            catalogServiceId: "svc-rate",
            nome: "Servizio Rate",
            prezzoPieno: 1000,
            prezzoScontato: 800,
            usaPrezzoScontato: true,
            durataOperativa: 6,
            meseInizio: 1,
            consentiRateizzazione: true,
            consentiAcconto: true,
            maxRateConsentite: 24,
            color: "#123456",
          },
          strategiaPagamento: {
            tipo: "rate",
            numeroRate: 12,
          },
        },
      ],
    })
  })

  it("adapts legacy catalog_service_id to canonical catalogServiceId", () => {
    const decoded = decodeProposalImportPayload({
      id: "proposal-a",
      nome: "Proposta A",
      servizi: [
        {
          service: {
            id: "runtime-legacy",
            catalog_service_id: "svc-legacy",
            nome: "Legacy",
            prezzoPieno: 500,
            prezzoScontato: 450,
            usaPrezzoScontato: true,
            durataOperativa: 3,
            meseInizio: 2,
            consentiRateizzazione: false,
            consentiAcconto: false,
          },
          strategiaPagamento: {
            tipo: "oneShot",
          },
        },
      ],
    })

    expect(decoded?.servizi[0]?.service.catalogServiceId).toBe("svc-legacy")
  })

  it("rejects malformed proposal payload", () => {
    const decoded = decodeProposalImportPayload({
      id: "proposal-a",
      nome: "Proposta A",
      servizi: [
        {
          service: {
            id: "runtime-1",
            nome: "Broken",
            prezzoPieno: "1000",
          },
          strategiaPagamento: {
            tipo: "oneShot",
          },
        },
      ],
    })

    expect(decoded).toBeNull()
  })
})
