import { buildProposalDocument as buildProposalDocumentEngine, type BuildProposalDocumentMeta } from "../engine/proposalDocument/proposalDocumentEngine"
import { calcolaCashflow } from "../engine/cashflow/cashflowEngine"
import type { ProposalDocument } from "../domain/models/ProposalDocument"
import type {
  ProposalDTO,
  ProposalSectionTypeDTO,
  StrategicPlanDTO,
} from "./dto/StrategicPlanDTO"
import {
  mapProposalDTOToDomain,
  mapStrategicPlanDTOToDomain,
} from "./mappers/strategicPlanningDomainMappers"
import {
  mapFinancialProposalsToComparisonPayload,
  mapFinancialTotalsProjectionToFinancialProposalPayload,
  mapProposalDTOToActivatedServicesPayload,
  mapStrategicPlanDTOToStrategicPlanPayload,
} from "./mappers/proposalDocumentMappers"
import { createDefaultSectionToggleState } from "./proposalDocumentSectionToggles"

export interface BuildProposalDocumentInputDTO {
  propostaA: ProposalDTO
  piano: StrategicPlanDTO
  propostaB?: ProposalDTO
  meta: BuildProposalDocumentMeta
  sectionToggles?: Partial<Record<ProposalSectionTypeDTO, boolean>>
}

export const buildProposalDocument = ({
  propostaA,
  piano,
  propostaB,
  meta,
  sectionToggles,
}: BuildProposalDocumentInputDTO): ProposalDocument => {
  const resolvedSectionToggles = {
    ...createDefaultSectionToggleState(),
    ...sectionToggles,
  }

  const propostaADomain = mapProposalDTOToDomain(propostaA)
  const pianoDomain = mapStrategicPlanDTOToDomain(piano)
  const propostaBDomain = propostaB ? mapProposalDTOToDomain(propostaB) : undefined

  const cashflowA = calcolaCashflow(propostaADomain, pianoDomain)
  const financialProposalPayloadA = mapFinancialTotalsProjectionToFinancialProposalPayload(
    {
      totaleAnno1: cashflowA.totaleAnno1,
      totaleAnno2: cashflowA.totaleAnno2,
      totale24Mesi: cashflowA.totale,
      totaleAcconti: cashflowA.totaleAcconti,
    },
    propostaA.servizi.length,
  )

  const financialProposalPayloadB = propostaBDomain
    ? (() => {
        const cashflowB = calcolaCashflow(propostaBDomain, pianoDomain)

        return mapFinancialTotalsProjectionToFinancialProposalPayload(
          {
            totaleAnno1: cashflowB.totaleAnno1,
            totaleAnno2: cashflowB.totaleAnno2,
            totale24Mesi: cashflowB.totale,
            totaleAcconti: cashflowB.totaleAcconti,
          },
          propostaBDomain.servizi.length,
        )
      })()
    : undefined

  return buildProposalDocumentEngine({
    propostaA: propostaADomain,
    piano: pianoDomain,
    propostaB: propostaBDomain,
    meta,
    sectionToggles: resolvedSectionToggles,
    preparedActivatedServicesPayload: mapProposalDTOToActivatedServicesPayload(propostaA),
    preparedStrategicPlanPayload: mapStrategicPlanDTOToStrategicPlanPayload(piano),
    preparedFinancialProposalPayload: financialProposalPayloadA,
    preparedComparisonPayload:
      financialProposalPayloadB !== undefined
        ? mapFinancialProposalsToComparisonPayload(
            financialProposalPayloadA,
            financialProposalPayloadB,
          )
        : undefined,
  })
}
