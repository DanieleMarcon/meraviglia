import type { ProposalDTO, StrategicPlanDTO } from "../dto/StrategicPlanDTO"
import type {
  ActivatedServicesPayload,
  ComparisonPayload,
  FinancialProposalPayload,
  StrategicPlanPayload,
} from "../../engine/proposalDocument/proposalDocumentPayloads"

const getEffectiveServicePrice = (proposal: ProposalDTO["servizi"][number]): number => {
  return proposal.service.usaPrezzoScontato
    ? proposal.service.prezzoScontato
    : proposal.service.prezzoPieno
}

export const mapProposalDTOToActivatedServicesPayload = (
  proposal: ProposalDTO,
): ActivatedServicesPayload => ({
  services: proposal.servizi.map(({ service, strategiaPagamento }) => ({
    id: service.id,
    catalogServiceId: service.catalogServiceId ?? null,
    nome: service.nome,
    modulo: service.nome,
    prezzo: getEffectiveServicePrice({ service, strategiaPagamento }),
    durataOperativa: service.durataOperativa,
    paymentType: strategiaPagamento.tipo,
  })),
})



export const mapStrategicPlanDTOToStrategicPlanPayload = (
  piano: StrategicPlanDTO,
): StrategicPlanPayload => ({
  durataTotale: piano.durataTotale,
  moduli: piano.moduli.map((modulo) => ({
    nome: modulo.nome,
    meseInizio: modulo.meseInizio,
    durata: modulo.durata,
  })),
})

export interface FinancialTotalsProjectionDTO {
  totaleAnno1: number
  totaleAnno2: number
  totale24Mesi: number
  totaleAcconti: number
}

export const mapFinancialTotalsProjectionToFinancialProposalPayload = (
  financialTotals: FinancialTotalsProjectionDTO,
  numeroServizi: number,
): FinancialProposalPayload => ({
  totaleAnno1: financialTotals.totaleAnno1,
  totaleAnno2: financialTotals.totaleAnno2,
  totale24Mesi: financialTotals.totale24Mesi,
  totaleAcconti: financialTotals.totaleAcconti,
  numeroServizi,
})

export const mapFinancialProposalsToComparisonPayload = (
  financialA: FinancialProposalPayload,
  financialB: FinancialProposalPayload,
): ComparisonPayload => {
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
