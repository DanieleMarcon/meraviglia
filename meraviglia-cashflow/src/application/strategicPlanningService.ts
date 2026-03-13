import { calcolaCashflow as calculateCashflowEngine } from "../engine/cashflow/cashflowEngine"
import {
  normalizePropostaForWrite as normalizePropostaForWriteDomain,
  resolvePaymentConstraints as resolvePaymentConstraintsDomain,
} from "../domain/validation/domainValidation"
import {
  mapCatalogDTOToDomain,
  mapProposalDomainToDTO,
  mapProposalDTOToDomain,
  mapServiceDTOToDomain,
  mapStrategicPlanDTOToDomain,
} from "./mappers/strategicPlanningDomainMappers"
import type {
  ProposalDTO,
  ServiceDTO,
  ServiceDefinitionDTO,
  StrategicPlanDTO,
} from "./dto/StrategicPlanDTO"

export interface PaymentConstraintsDTO {
  maxRateConsentite: number
  mesiResidui: number
  maxRatePerPiano: number
}

export const calculateCashflow = (proposta: ProposalDTO, piano: StrategicPlanDTO) => {
  return calculateCashflowEngine(
    mapProposalDTOToDomain(proposta),
    mapStrategicPlanDTOToDomain(piano),
  )
}

export const calcolaCashflow = calculateCashflow


export const normalizeProposalForWrite = (
  proposta: ProposalDTO,
  piano: StrategicPlanDTO,
  catalog: ServiceDefinitionDTO[],
): ProposalDTO => {
  const normalized = normalizePropostaForWriteDomain(
    mapProposalDTOToDomain(proposta),
    mapStrategicPlanDTOToDomain(piano),
    mapCatalogDTOToDomain(catalog),
  )

  return mapProposalDomainToDTO(normalized)
}

export const sanitizeProposalAtBoundary = (
  proposta: ProposalDTO,
  piano: StrategicPlanDTO,
  catalog: ServiceDefinitionDTO[],
): ProposalDTO => {
  return normalizeProposalForWrite(proposta, piano, catalog)
}

export const resolvePaymentConstraints = (
  service: ServiceDTO,
  pianoDurata: number,
  catalog: ServiceDefinitionDTO[],
): PaymentConstraintsDTO => {
  return resolvePaymentConstraintsDomain(
    mapServiceDTOToDomain(service),
    pianoDurata,
    mapCatalogDTOToDomain(catalog),
  )
}
