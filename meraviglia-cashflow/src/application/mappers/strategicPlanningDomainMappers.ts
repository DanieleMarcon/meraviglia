import type {
  PaymentStrategyDTO,
  ProposalDTO,
  ProposalServiceDTO,
  ServiceDTO,
  ServiceDefinitionDTO,
  StrategicPlanDTO,
} from "../dto/StrategicPlanDTO"
import type { StrategiaPagamento } from "../../domain/models/StrategiaPagamento"
import type { Proposta, PropostaService } from "../../domain/models/Proposta"
import type { Service } from "../../domain/models/Service"
import type { ServiceDefinition } from "../../domain/models/ServiceDefinition"
import type { PianoStrategico } from "../../domain/models/PianoStrategico"

export const mapPaymentStrategyDTOToDomain = (
  strategy: PaymentStrategyDTO,
): StrategiaPagamento => ({
  tipo: strategy.tipo,
  numeroRate: strategy.numeroRate,
  percentualeAcconto: strategy.percentualeAcconto,
})

export const mapServiceDTOToDomain = (service: ServiceDTO): Service => ({
  id: service.id,
  catalogServiceId: service.catalogServiceId,
  nome: service.nome,
  prezzoPieno: service.prezzoPieno,
  prezzoScontato: service.prezzoScontato,
  usaPrezzoScontato: service.usaPrezzoScontato,
  durataOperativa: service.durataOperativa,
  meseInizio: service.meseInizio,
  consentiRateizzazione: service.consentiRateizzazione,
  consentiAcconto: service.consentiAcconto,
  maxRateConsentite: service.maxRateConsentite,
  color: service.color,
})

export const mapProposalServiceDTOToDomain = (
  proposalService: ProposalServiceDTO,
): PropostaService => ({
  service: mapServiceDTOToDomain(proposalService.service),
  strategiaPagamento: mapPaymentStrategyDTOToDomain(proposalService.strategiaPagamento),
})

export const mapProposalDTOToDomain = (proposal: ProposalDTO): Proposta => ({
  id: proposal.id,
  nome: proposal.nome,
  servizi: proposal.servizi.map(mapProposalServiceDTOToDomain),
})

export const mapStrategicPlanDTOToDomain = (
  plan: StrategicPlanDTO,
): PianoStrategico => ({
  durataTotale: plan.durataTotale,
  moduli: plan.moduli.map((module) => ({
    nome: module.nome,
    meseInizio: module.meseInizio,
    durata: module.durata,
  })),
})

export const mapServiceDefinitionDTOToDomain = (
  definition: ServiceDefinitionDTO,
): ServiceDefinition => ({
  id: definition.id,
  nome: definition.nome,
  categoria: definition.categoria,
  prezzoPieno: definition.prezzoPieno,
  prezzoScontato: definition.prezzoScontato,
  durataStandard: definition.durataStandard,
  color: definition.color,
  consentiRateizzazione: definition.consentiRateizzazione,
  consentiAcconto: definition.consentiAcconto,
  maxRateConsentite: definition.maxRateConsentite,
})

export const mapCatalogDTOToDomain = (
  catalog: ServiceDefinitionDTO[],
): ServiceDefinition[] => catalog.map(mapServiceDefinitionDTOToDomain)

export const mapPaymentStrategyDomainToDTO = (
  strategy: StrategiaPagamento,
): PaymentStrategyDTO => ({
  tipo: strategy.tipo,
  numeroRate: strategy.numeroRate,
  percentualeAcconto: strategy.percentualeAcconto,
})

export const mapServiceDomainToDTO = (service: Service): ServiceDTO => ({
  id: service.id,
  catalogServiceId: service.catalogServiceId,
  nome: service.nome,
  prezzoPieno: service.prezzoPieno,
  prezzoScontato: service.prezzoScontato,
  usaPrezzoScontato: service.usaPrezzoScontato,
  durataOperativa: service.durataOperativa,
  meseInizio: service.meseInizio,
  consentiRateizzazione: service.consentiRateizzazione,
  consentiAcconto: service.consentiAcconto,
  maxRateConsentite: service.maxRateConsentite,
  color: service.color,
})

export const mapProposalServiceDomainToDTO = (
  proposalService: PropostaService,
): ProposalServiceDTO => ({
  service: mapServiceDomainToDTO(proposalService.service),
  strategiaPagamento: mapPaymentStrategyDomainToDTO(proposalService.strategiaPagamento),
})

export const mapProposalDomainToDTO = (proposal: Proposta): ProposalDTO => ({
  id: proposal.id,
  nome: proposal.nome,
  servizi: proposal.servizi.map(mapProposalServiceDomainToDTO),
})

