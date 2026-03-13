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



  it("usa il mapper application-owned per il payload STRATEGIC_PLAN", () => {
    const document = buildProposalDocument({
      propostaA: proposta,
      piano,
      meta: {
        clientName: "Client",
        contactPerson: "Owner",
        version: "v1",
      },
    })

    const strategicPlanSection = document.sections.find(
      (section) => section.type === ProposalSectionType.STRATEGIC_PLAN,
    )

    expect(strategicPlanSection?.payload).toEqual({
      durataTotale: 12,
      moduli: [{ nome: "Core", meseInizio: 1, durata: 12 }],
    })
  })

  it("usa mappers application-owned per FINANCIAL_PROPOSAL e COMPARISON", () => {
    const proposalB: ProposalDTO = {
      ...proposta,
      id: "proposal-b",
      nome: "Proposta B",
      servizi: [
        {
          ...proposta.servizi[0],
          service: {
            ...proposta.servizi[0].service,
            id: "runtime-service-b",
            prezzoPieno: 600,
            prezzoScontato: 600,
            usaPrezzoScontato: false,
          },
          strategiaPagamento: { tipo: "oneShot" },
        },
      ],
    }

    const document = buildProposalDocument({
      propostaA: proposta,
      propostaB: proposalB,
      piano,
      meta: {
        clientName: "Client",
        contactPerson: "Owner",
        version: "v1",
      },
    })

    const financialSection = document.sections.find(
      (section) => section.type === ProposalSectionType.FINANCIAL_PROPOSAL,
    )

    const comparisonSection = document.sections.find(
      (section) => section.type === ProposalSectionType.COMPARISON,
    )

    expect(financialSection?.payload).toEqual({
      totaleAnno1: 750,
      totaleAnno2: 0,
      totale24Mesi: 750,
      totaleAcconti: 0,
      numeroServizi: 1,
    })

    expect(comparisonSection?.payload).toEqual({
      propostaA: {
        totale24Mesi: 750,
        totaleAnno1: 750,
        totaleAnno2: 0,
      },
      propostaB: {
        totale24Mesi: 600,
        totaleAnno1: 600,
        totaleAnno2: 0,
      },
      delta24Mesi: 150,
      deltaPercentuale: 25,
    })
  })

})
