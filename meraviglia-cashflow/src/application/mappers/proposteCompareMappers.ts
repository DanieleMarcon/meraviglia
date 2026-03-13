import type { CompareServiceSeriesDTO } from "../dto/ProposteCompareDTO"
import type { Proposta, PropostaService } from "../dto/StrategicPlanDTO"

export interface CompareServiceProjection {
  runtimeServiceId: string
  catalogServiceId: string
  name: string
  color: string
  startMonth: number
  effectivePrice: number
  operationalDuration: number
  paymentStrategy: PropostaService["strategiaPagamento"]
}

export const mapProposalServiceToCompareProjection = (
  propostaService: PropostaService,
): CompareServiceProjection => {
  const { service, strategiaPagamento } = propostaService
  const effectivePrice = service.usaPrezzoScontato
    ? service.prezzoScontato
    : service.prezzoPieno

  return {
    runtimeServiceId: service.id,
    catalogServiceId: service.catalogServiceId ?? service.id,
    name: service.nome,
    color: service.color ?? "#111827",
    startMonth: service.meseInizio,
    effectivePrice,
    operationalDuration: service.durataOperativa,
    paymentStrategy: strategiaPagamento,
  }
}

export const mapProposalToCompareProjection = (
  proposta: Proposta,
): CompareServiceProjection[] => {
  return proposta.servizi.map(mapProposalServiceToCompareProjection)
}

export const mapCompareProjectionToServiceSeriesDTO = (
  projection: CompareServiceProjection,
): CompareServiceSeriesDTO => {
  return {
    key: projection.runtimeServiceId,
    runtimeServiceId: projection.runtimeServiceId,
    catalogServiceId: projection.catalogServiceId,
    name: projection.name,
    color: projection.color,
  }
}

