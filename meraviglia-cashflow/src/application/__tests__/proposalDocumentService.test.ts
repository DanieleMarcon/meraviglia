import { describe, expect, it } from "vitest"
import { buildProposalDocument } from "../proposalDocumentService"
import { ProposalSectionType, type ProposalDTO, type StrategicPlanDTO } from "../dto/StrategicPlanDTO"

const piano: StrategicPlanDTO = {
  durataTotale: 12,
  moduli: [{ nome: "Core", meseInizio: 1, durata: 12 }],
}

const proposta: ProposalDTO = {
  id: "proposal-a",
  nome: "Proposta A",
  servizi: [
    {
      service: {
        id: "runtime-service-id",
        catalogServiceId: "catalog-service-id",
        nome: "SEO Pack",
        prezzoPieno: 1000,
        prezzoScontato: 750,
        usaPrezzoScontato: true,
        durataOperativa: 6,
        meseInizio: 2,
        consentiRateizzazione: true,
        consentiAcconto: true,
        maxRateConsentite: 12,
      },
      strategiaPagamento: { tipo: "rate", numeroRate: 6 },
    },
  ],
}

describe("proposalDocumentService", () => {
  it("usa il mapper application-owned per il payload ACTIVATED_SERVICES", () => {
    const document = buildProposalDocument({
      propostaA: proposta,
      piano,
      meta: {
        clientName: "Client",
        contactPerson: "Owner",
        version: "v1",
      },
    })

    const activatedSection = document.sections.find(
      (section) => section.type === ProposalSectionType.ACTIVATED_SERVICES,
    )

    expect(activatedSection?.payload).toEqual({
      services: [
        {
          id: "runtime-service-id",
          catalogServiceId: "catalog-service-id",
          nome: "SEO Pack",
          modulo: "SEO Pack",
          prezzo: 750,
          durataOperativa: 6,
          paymentType: "rate",
        },
      ],
    })
  })
})
