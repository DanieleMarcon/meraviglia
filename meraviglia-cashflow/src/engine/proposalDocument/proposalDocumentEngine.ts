import type { PianoStrategico } from "../../domain/models/PianoStrategico"
import type { ProposalDocument } from "../../domain/models/ProposalDocument"
import type { ProposalSection } from "../../domain/models/ProposalSection"
import { ProposalSectionType } from "../../domain/models/ProposalSectionType"
import type { Proposta } from "../../domain/models/Proposta"

export interface BuildProposalDocumentMeta {
  clientName: string
  contactPerson: string
  version: string
  date?: string
}

export interface BuildProposalDocumentInput {
  propostaA: Proposta
  piano: PianoStrategico
  propostaB?: Proposta
  meta: BuildProposalDocumentMeta
}

export function buildProposalDocument({
  propostaA,
  piano,
  propostaB,
  meta,
}: BuildProposalDocumentInput): ProposalDocument {
  const sections: ProposalSection[] = [
    {
      type: ProposalSectionType.COVER,
      enabled: true,
      order: 1,
      payload: {
        propostaId: propostaA.id,
      },
    },
    {
      type: ProposalSectionType.PRESENTATION,
      enabled: true,
      order: 2,
      payload: {
        propostaName: propostaA.nome,
      },
    },
    {
      type: ProposalSectionType.INDEX,
      enabled: true,
      order: 3,
      payload: {
        sectionCount: 12,
      },
    },
    {
      type: ProposalSectionType.MERAVIGLIA_NUMBERS,
      enabled: true,
      order: 4,
      payload: {
        placeholder: true,
      },
    },
    {
      type: ProposalSectionType.ACTIVATED_SERVICES,
      enabled: true,
      order: 5,
      payload: {
        serviceCount: propostaA.servizi.length,
      },
    },
    {
      type: ProposalSectionType.STRATEGIC_PLAN,
      enabled: true,
      order: 6,
      payload: {
        modulesCount: piano.moduli.length,
      },
    },
    {
      type: ProposalSectionType.OPERATIONAL_ARCHITECTURE,
      enabled: true,
      order: 7,
      payload: {
        duration: piano.durataTotale,
      },
    },
    {
      type: ProposalSectionType.FINANCIAL_PROPOSAL,
      enabled: true,
      order: 8,
      payload: {
        propostaId: propostaA.id,
      },
    },
    {
      type: ProposalSectionType.CASHFLOW,
      enabled: true,
      order: 9,
      payload: {
        durataTotale: piano.durataTotale,
      },
    },
    {
      type: ProposalSectionType.INVESTMENT_AND_TERMS,
      enabled: true,
      order: 10,
      payload: {
        placeholder: true,
      },
    },
    {
      type: ProposalSectionType.COMPARISON,
      enabled: Boolean(propostaB),
      order: 11,
      payload: {
        baseProposalId: propostaA.id,
        compareProposalId: propostaB?.id,
      },
    },
    {
      type: ProposalSectionType.CLOSING,
      enabled: true,
      order: 12,
      payload: {
        placeholder: true,
      },
    },
  ]

  return {
    meta: {
      clientName: meta.clientName,
      contactPerson: meta.contactPerson,
      date: meta.date ?? "",
      proposalVersion: meta.version,
    },
    sections,
  }
}
