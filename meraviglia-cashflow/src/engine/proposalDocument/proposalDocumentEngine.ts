import { calcolaCashflow } from "../cashflow/cashflowEngine"
import type { PianoStrategico } from "../../domain/models/PianoStrategico"
import type { ProposalDocument } from "../../domain/models/ProposalDocument"
import type { ProposalSection } from "../../domain/models/ProposalSection"
import {
  ProposalSectionType,
  type ProposalSectionType as ProposalSectionTypeValue,
} from "../../domain/models/ProposalSectionType"
import type { Proposta } from "../../domain/models/Proposta"
import {
  createDefaultSectionToggleState,
  MANDATORY_PROPOSAL_SECTIONS,
  type SectionToggleState,
} from "../../domain/models/SectionToggleState"

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
  sectionToggles?: SectionToggleState
}

function isSectionEnabled(
  sectionType: ProposalSectionTypeValue,
  sectionToggles: SectionToggleState
): boolean {
  if (MANDATORY_PROPOSAL_SECTIONS.includes(sectionType)) {
    return true
  }

  return sectionToggles[sectionType]
}

interface ActivatedServicesPayload {
  services: Array<{
    id: string
    nome: string
    modulo: string
    prezzo: number
    durataOperativa: number
    paymentType: string
  }>
}

interface StrategicPlanPayload {
  durataTotale: number
  moduli: Array<{
    nome: string
    meseInizio: number
    durata: number
  }>
}

interface FinancialProposalPayload {
  totaleAnno1: number
  totaleAnno2: number
  totale24Mesi: number
  totaleAcconti: number
  numeroServizi: number
}

interface CashflowPayload {
  monthly: number[]
  cumulative: number[]
  peakMonth: number
  peakValue: number
}

interface ComparisonPayload {
  propostaA: {
    totale24Mesi: number
    totaleAnno1: number
    totaleAnno2: number
  }
  propostaB: {
    totale24Mesi: number
    totaleAnno1: number
    totaleAnno2: number
  }
  delta24Mesi: number
  deltaPercentuale: number
}

function getServicePrice(propostaService: Proposta["servizi"][number]): number {
  return propostaService.service.usaPrezzoScontato
    ? propostaService.service.prezzoScontato
    : propostaService.service.prezzoPieno
}

function buildActivatedServicesPayload(proposta: Proposta): ActivatedServicesPayload {
  return {
    services: proposta.servizi.map(({ service, strategiaPagamento }) => ({
      id: service.id,
      nome: service.nome,
      modulo: service.nome,
      prezzo: getServicePrice({ service, strategiaPagamento }),
      durataOperativa: service.durataOperativa,
      paymentType: strategiaPagamento.tipo,
    })),
  }
}

function buildStrategicPlanPayload(piano: PianoStrategico): StrategicPlanPayload {
  return {
    durataTotale: piano.durataTotale,
    moduli: piano.moduli.map((modulo) => ({
      nome: modulo.nome,
      meseInizio: modulo.meseInizio,
      durata: modulo.durata,
    })),
  }
}

function buildFinancialProposalPayload(
  proposta: Proposta,
  piano: PianoStrategico
): FinancialProposalPayload {
  const cashflow = calcolaCashflow(proposta, piano)

  return {
    totaleAnno1: cashflow.totaleAnno1,
    totaleAnno2: cashflow.totaleAnno2,
    totale24Mesi: cashflow.totale,
    totaleAcconti: cashflow.totaleAcconti,
    numeroServizi: proposta.servizi.length,
  }
}

function buildCashflowPayload(proposta: Proposta, piano: PianoStrategico): CashflowPayload {
  const cashflow = calcolaCashflow(proposta, piano)
  const cumulative = cashflow.mesi.reduce<number[]>((acc, value, index) => {
    const previous = index > 0 ? acc[index - 1] : 0
    acc.push(previous + value)
    return acc
  }, [])

  const peakValue = cashflow.mesi.reduce((peak, value) => Math.max(peak, value), 0)
  const peakMonthIndex = cashflow.mesi.findIndex((value) => value === peakValue)

  return {
    monthly: [...cashflow.mesi],
    cumulative,
    peakMonth: peakMonthIndex >= 0 ? peakMonthIndex + 1 : 0,
    peakValue,
  }
}

function buildComparisonPayload(
  propostaA: Proposta,
  propostaB: Proposta,
  piano: PianoStrategico
): ComparisonPayload {
  const financialA = buildFinancialProposalPayload(propostaA, piano)
  const financialB = buildFinancialProposalPayload(propostaB, piano)

  const delta24Mesi = financialA.totale24Mesi - financialB.totale24Mesi
  const deltaPercentuale =
    financialB.totale24Mesi !== 0
      ? (delta24Mesi / financialB.totale24Mesi) * 100
      : 0

  return {
    propostaA: {
      totale24Mesi: financialA.totale24Mesi,
      totaleAnno1: financialA.totaleAnno1,
      totaleAnno2: financialA.totaleAnno2,
    },
    propostaB: {
      totale24Mesi: financialB.totale24Mesi,
      totaleAnno1: financialB.totaleAnno1,
      totaleAnno2: financialB.totaleAnno2,
    },
    delta24Mesi,
    deltaPercentuale,
  }
}

export function buildProposalDocument({
  propostaA,
  piano,
  propostaB,
  meta,
  sectionToggles: sectionTogglesInput,
}: BuildProposalDocumentInput): ProposalDocument {
  const sectionToggles: SectionToggleState = {
    ...createDefaultSectionToggleState(),
    ...sectionTogglesInput,
  }

  const activatedServicesPayload = buildActivatedServicesPayload(propostaA)
  const strategicPlanPayload = buildStrategicPlanPayload(piano)
  const financialProposalPayload = buildFinancialProposalPayload(propostaA, piano)
  const cashflowPayload = buildCashflowPayload(propostaA, piano)

  const sections: ProposalSection[] = [
    {
      type: ProposalSectionType.COVER,
      enabled: isSectionEnabled(ProposalSectionType.COVER, sectionToggles),
      order: 1,
      payload: {
        propostaId: propostaA.id,
      },
    },
    {
      type: ProposalSectionType.PRESENTATION,
      enabled: isSectionEnabled(ProposalSectionType.PRESENTATION, sectionToggles),
      order: 2,
      payload: {
        propostaName: propostaA.nome,
      },
    },
    {
      type: ProposalSectionType.INDEX,
      enabled: isSectionEnabled(ProposalSectionType.INDEX, sectionToggles),
      order: 3,
      payload: {
        sectionCount: 12,
      },
    },
    {
      type: ProposalSectionType.MERAVIGLIA_NUMBERS,
      enabled: isSectionEnabled(ProposalSectionType.MERAVIGLIA_NUMBERS, sectionToggles),
      order: 4,
      payload: {
        placeholder: true,
      },
    },
    {
      type: ProposalSectionType.ACTIVATED_SERVICES,
      enabled: isSectionEnabled(ProposalSectionType.ACTIVATED_SERVICES, sectionToggles),
      order: 5,
      payload: activatedServicesPayload,
    },
    {
      type: ProposalSectionType.STRATEGIC_PLAN,
      enabled: isSectionEnabled(ProposalSectionType.STRATEGIC_PLAN, sectionToggles),
      order: 6,
      payload: strategicPlanPayload,
    },
    {
      type: ProposalSectionType.OPERATIONAL_ARCHITECTURE,
      enabled: isSectionEnabled(ProposalSectionType.OPERATIONAL_ARCHITECTURE, sectionToggles),
      order: 7,
      payload: {
        duration: piano.durataTotale,
      },
    },
    {
      type: ProposalSectionType.FINANCIAL_PROPOSAL,
      enabled: isSectionEnabled(ProposalSectionType.FINANCIAL_PROPOSAL, sectionToggles),
      order: 8,
      payload: financialProposalPayload,
    },
    {
      type: ProposalSectionType.CASHFLOW,
      enabled: isSectionEnabled(ProposalSectionType.CASHFLOW, sectionToggles),
      order: 9,
      payload: cashflowPayload,
    },
    {
      type: ProposalSectionType.INVESTMENT_AND_TERMS,
      enabled: isSectionEnabled(ProposalSectionType.INVESTMENT_AND_TERMS, sectionToggles),
      order: 10,
      payload: {
        placeholder: true,
      },
    },
    {
      type: ProposalSectionType.COMPARISON,
      enabled:
        isSectionEnabled(ProposalSectionType.COMPARISON, sectionToggles) &&
        Boolean(propostaB),
      order: 11,
      payload: propostaB
        ? buildComparisonPayload(propostaA, propostaB, piano)
        : null,
    },
    {
      type: ProposalSectionType.CLOSING,
      enabled: isSectionEnabled(ProposalSectionType.CLOSING, sectionToggles),
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
