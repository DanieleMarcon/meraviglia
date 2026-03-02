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
  it("include tutte le sezioni attese", () => {
    const doc = buildProposalDocument({
      propostaA: baseProposal("A", 1000),
      piano,
      meta,
    })

    expect(doc.sections).toHaveLength(12)
    expect(doc.sections.map((section) => section.type)).toEqual(Object.values(ProposalSectionType))
    expect(doc.sections.every((section) => section.enabled)).toBe(true)
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

    const cashflow = doc.sections.find((section) => section.type === ProposalSectionType.CASHFLOW)
    const comparison = doc.sections.find((section) => section.type === ProposalSectionType.COMPARISON)

    expect(cashflow?.enabled).toBe(false)
    expect(comparison?.enabled).toBe(false)
    expect(doc.sections.find((section) => section.type === ProposalSectionType.COVER)?.enabled).toBe(true)
  })

  it("calcola delta comparison corretto tra due proposte", () => {
    const doc = buildProposalDocument({
      propostaA: baseProposal("A", 1000),
      propostaB: baseProposal("B", 800),
      piano,
      meta,
    })

    const comparison = doc.sections.find((section) => section.type === ProposalSectionType.COMPARISON)

    expect(comparison?.enabled).toBe(true)
    expect(comparison?.payload).toMatchObject({
      delta24Mesi: 200,
      deltaPercentuale: 25,
      propostaA: { totale24Mesi: 1000 },
      propostaB: { totale24Mesi: 800 },
    })
  })
})
