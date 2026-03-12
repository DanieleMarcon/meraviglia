import { calcolaCashflow as calculateCashflowEngine } from "../engine/cashflow/cashflowEngine"
import { sanitizePropostaAtBoundary as sanitizePropostaAtBoundaryDomain } from "../domain/validation/domainValidation"
import { resolvePaymentConstraints as resolvePaymentConstraintsDomain } from "../domain/validation/domainValidation"
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
  return calculateCashflowEngine(proposta, piano)
}

export const calcolaCashflow = calculateCashflow

export const sanitizeProposalAtBoundary = (
  proposta: ProposalDTO,
  piano: StrategicPlanDTO,
  catalog: ServiceDefinitionDTO[],
): ProposalDTO => {
  return sanitizePropostaAtBoundaryDomain(proposta, piano, catalog)
}

export const resolvePaymentConstraints = (
  service: ServiceDTO,
  pianoDurata: number,
  catalog: ServiceDefinitionDTO[],
): PaymentConstraintsDTO => {
  return resolvePaymentConstraintsDomain(service, pianoDurata, catalog)
}
