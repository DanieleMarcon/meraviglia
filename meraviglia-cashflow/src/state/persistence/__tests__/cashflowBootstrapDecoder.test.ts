import { describe, expect, it } from "vitest"

import { ProposalSectionType } from "../../../application/dto/StrategicPlanDTO"
import { decodeCashflowBootstrapPayload } from "../cashflowBootstrapDecoder"

describe("cashflowBootstrapDecoder", () => {
  it("canonicalizes legacy catalog_service_id aliases", () => {
    const decoded = decodeCashflowBootstrapPayload({
      piano: { durataTotale: 6, moduli: [{ nome: "Launch", meseInizio: 1, durata: 6 }] },
      propostaA: {
        id: "a",
        nome: "A",
        servizi: [{
          service: {
            id: "runtime-a-1",
            nome: "Legacy",
            prezzoPieno: 100,
            prezzoScontato: 90,
            usaPrezzoScontato: false,
            durataOperativa: 2,
            meseInizio: 1,
            consentiRateizzazione: true,
            consentiAcconto: false,
            catalog_service_id: "svc-legacy",
          },
          strategiaPagamento: { tipo: "oneShot" },
        }],
      },
      propostaB: {
        id: "b",
        nome: "B",
        servizi: [],
      },
      sectionToggles: {
        [ProposalSectionType.COVER]: false,
      },
    })

    expect(decoded.payload?.propostaA.servizi[0]?.service.catalogServiceId).toBe("svc-legacy")
    expect(decoded.sectionToggles[ProposalSectionType.COVER]).toBe(true)
  })

  it("rejects invalid payload shape and returns null payload", () => {
    const decoded = decodeCashflowBootstrapPayload({
      propostaA: { id: "a", nome: "A", servizi: [] },
      propostaB: { id: "b", nome: "B", servizi: [] },
    })

    expect(decoded.payload).toBeNull()
  })
})
