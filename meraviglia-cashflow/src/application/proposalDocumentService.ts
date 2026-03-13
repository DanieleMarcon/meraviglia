import { buildProposalDocument as buildProposalDocumentEngine, type BuildProposalDocumentMeta } from "../engine/proposalDocument/proposalDocumentEngine"
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
import { mapProposalDTOToActivatedServicesPayload } from "./mappers/proposalDocumentMappers"
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

  return buildProposalDocumentEngine({
    propostaA: mapProposalDTOToDomain(propostaA),
    piano: mapStrategicPlanDTOToDomain(piano),
    propostaB: propostaB ? mapProposalDTOToDomain(propostaB) : undefined,
    meta,
    sectionToggles: resolvedSectionToggles,
    preparedActivatedServicesPayload: mapProposalDTOToActivatedServicesPayload(propostaA),
  })
}
