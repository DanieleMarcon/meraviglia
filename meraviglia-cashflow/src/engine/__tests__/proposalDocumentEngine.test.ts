import { describe, expect, it } from "vitest"
import { buildProposalDocument } from "../proposalDocument/proposalDocumentEngine"
import { ProposalSectionType } from "../../domain/models/ProposalSectionType"
import { createDefaultSectionToggleState } from "../../domain/models/SectionToggleState"
import type { PianoStrategico } from "../../domain/models/PianoStrategico"
import type { Proposta } from "../../domain/models/Proposta"

const piano: PianoStrategico = {
  durataTotale: 12,
  moduli: [{ nome: "Core", meseInizio: 1, durata: 12 }],
}

const baseProposal = (id: string, totalPrice: number): Proposta => ({
  id,
  nome: `Proposta ${id}`,
  servizi: [
    {
      service: {
        id: `${id}-s1`,
        nome: "SEO Pack",
        prezzoPieno: totalPrice,
        prezzoScontato: totalPrice,
        usaPrezzoScontato: false,
        durataOperativa: 1,
        meseInizio: 1,
        consentiRateizzazione: true,
        consentiAcconto: true,
        maxRateConsentite: 12,
      },
      strategiaPagamento: { tipo: "oneShot" },
    },
  ],
})

const meta = {
  clientName: "Client",
  contactPerson: "Owner",
  version: "v1",
}

describe("proposalDocumentEngine", () => {
  it("espone catalogServiceId nel payload ACTIVATED_SERVICES mantenendo id runtime per compatibilità", () => {
    const propostaConCatalogId: Proposta = {
      id: "A",
      nome: "Proposta A",
      servizi: [
        {
          service: {
            id: "runtime-service-id",
            catalogServiceId: "catalog-service-id",
            nome: "SEO Pack",
            prezzoPieno: 1000,
            prezzoScontato: 1000,
            usaPrezzoScontato: false,
            durataOperativa: 1,
            meseInizio: 1,
            consentiRateizzazione: true,
            consentiAcconto: true,
            maxRateConsentite: 12,
          },
          strategiaPagamento: { tipo: "oneShot" },
        },
      ],
    }

    const doc = buildProposalDocument({
      propostaA: propostaConCatalogId,
      piano,
      meta,
    })

    const activatedServices = doc.sections.find(
      (section) => section.type === ProposalSectionType.ACTIVATED_SERVICES
    )

    expect(activatedServices?.payload).toMatchObject({
      services: [
        {
          id: "runtime-service-id",
          catalogServiceId: "catalog-service-id",
          nome: "SEO Pack",
        },
      ],
    })
  })


  it("usa payload ACTIVATED_SERVICES preparato quando fornito", () => {
    const doc = buildProposalDocument({
      propostaA: baseProposal("A", 1000),
      piano,
      meta,
      preparedActivatedServicesPayload: {
        services: [
          {
            id: "prepared-runtime-id",
            catalogServiceId: "prepared-catalog-id",
            nome: "Prepared Service",
            modulo: "Prepared Module",
            prezzo: 123,
            durataOperativa: 3,
            paymentType: "oneShot",
          },
        ],
      },
    })

    const activatedServices = doc.sections.find(
      (section) => section.type === ProposalSectionType.ACTIVATED_SERVICES
    )

    expect(activatedServices?.payload).toEqual({
      services: [
        {
          id: "prepared-runtime-id",
          catalogServiceId: "prepared-catalog-id",
          nome: "Prepared Service",
          modulo: "Prepared Module",
          prezzo: 123,
          durataOperativa: 3,
          paymentType: "oneShot",
        },
      ],
    })
  })



  it("falls back to computed ACTIVATED_SERVICES payload when prepared roundtrip payload is malformed", () => {
    const proposal = baseProposal("A", 1000)

    const doc = buildProposalDocument({
      propostaA: proposal,
      piano,
      meta,
      preparedActivatedServicesPayload: {
        services: [{ id: "broken-service" }],
      } as unknown as { services: [] },
    })

    const activatedServices = doc.sections.find(
      (section) => section.type === ProposalSectionType.ACTIVATED_SERVICES
    )

    expect(activatedServices?.payload).toEqual({
      services: [
        {
          id: "A-s1",
          catalogServiceId: null,
          nome: "SEO Pack",
          modulo: "SEO Pack",
          prezzo: 1000,
          durataOperativa: 1,
          paymentType: "oneShot",
        },
      ],
    })
  })

  it("usa payload STRATEGIC_PLAN preparato quando fornito", () => {
    const doc = buildProposalDocument({
      propostaA: baseProposal("A", 1000),
      piano,
      meta,
      preparedStrategicPlanPayload: {
        durataTotale: 24,
        moduli: [{ nome: "Prepared Strategic Module", meseInizio: 3, durata: 6 }],
      },
    })

    const strategicPlan = doc.sections.find(
      (section) => section.type === ProposalSectionType.STRATEGIC_PLAN
    )

    expect(strategicPlan?.payload).toEqual({
      durataTotale: 24,
      moduli: [{ nome: "Prepared Strategic Module", meseInizio: 3, durata: 6 }],
    })
  })

  it("include tutte le sezioni attese con comparison disabilitata se assente", () => {
    const doc = buildProposalDocument({
      propostaA: baseProposal("A", 1000),
      piano,
      meta,
    })

    expect(doc.sections).toHaveLength(12)

    expect(doc.sections.map((section) => section.type)).toEqual(
      Object.values(ProposalSectionType)
    )

    // Comparison deve essere disabilitata se propostaB non è presente
    const comparison = doc.sections.find(
      (section) => section.type === ProposalSectionType.COMPARISON
    )

    expect(comparison?.enabled).toBe(false)

    // Tutte le altre sezioni devono essere enabled
    const otherSections = doc.sections.filter(
      (section) => section.type !== ProposalSectionType.COMPARISON
    )

    expect(otherSections.every((section) => section.enabled)).toBe(true)
  })

  it("rispetta le sezioni disabilitate non mandatory", () => {
    const toggles = createDefaultSectionToggleState()
    toggles.CASHFLOW = false
    toggles.COMPARISON = false

    const doc = buildProposalDocument({
      propostaA: baseProposal("A", 1000),
      piano,
      meta,
      sectionToggles: toggles,
    })

    const cashflow = doc.sections.find(
      (section) => section.type === ProposalSectionType.CASHFLOW
    )

    const comparison = doc.sections.find(
      (section) => section.type === ProposalSectionType.COMPARISON
    )

    expect(cashflow?.enabled).toBe(false)
    expect(comparison?.enabled).toBe(false)

    // Mandatory sections non possono essere disabilitate
    expect(
      doc.sections.find(
        (section) => section.type === ProposalSectionType.COVER
      )?.enabled
    ).toBe(true)

    expect(
      doc.sections.find(
        (section) => section.type === ProposalSectionType.CLOSING
      )?.enabled
    ).toBe(true)
  })

  it("calcola delta comparison corretto tra due proposte", () => {
    const doc = buildProposalDocument({
      propostaA: baseProposal("A", 1000),
      propostaB: baseProposal("B", 800),
      piano,
      meta,
    })

    const comparison = doc.sections.find(
      (section) => section.type === ProposalSectionType.COMPARISON
    )

    expect(comparison?.enabled).toBe(true)

    expect(comparison?.payload).toMatchObject({
      delta24Mesi: 200,
      deltaPercentuale: 25,
      propostaA: { totale24Mesi: 1000 },
      propostaB: { totale24Mesi: 800 },
    })
  })
})
