export type PaymentTypeDTO =
  | "oneShot"
  | "rate"
  | "abbonamento"
  | "accontoRate"

export interface PaymentStrategyDTO {
  tipo: PaymentTypeDTO
  numeroRate?: number
  percentualeAcconto?: number
}

export interface ServiceDTO {
  id: string
  nome: string
  prezzoPieno: number
  prezzoScontato: number
  usaPrezzoScontato: boolean
  durataOperativa: number
  meseInizio: number
  consentiRateizzazione: boolean
  consentiAcconto: boolean
  maxRateConsentite?: number
  color?: string
}

export interface ProposalServiceDTO {
  service: ServiceDTO
  strategiaPagamento: PaymentStrategyDTO
}

export interface ProposalDTO {
  id: string
  nome: string
  servizi: ProposalServiceDTO[]
}

export interface ModuleDTO {
  nome: string
  meseInizio: number
  durata: number
}

export interface StrategicPlanDTO {
  durataTotale: number
  moduli: ModuleDTO[]
}

export interface ServiceDefinitionDTO {
  id: string
  nome: string
  categoria: string
  prezzoPieno: number
  prezzoScontato: number
  durataStandard: number
  color?: string
  consentiRateizzazione: boolean
  consentiAcconto: boolean
  maxRateConsentite: number
}

// Transitional aliases to keep UI modules stable while moving to DTO-only imports.
export type TipoPagamento = PaymentTypeDTO
export type StrategiaPagamento = PaymentStrategyDTO
export type Service = ServiceDTO
export type PropostaService = ProposalServiceDTO
export type Proposta = ProposalDTO
export type Modulo = ModuleDTO
export type PianoStrategico = StrategicPlanDTO
export type ServiceDefinition = ServiceDefinitionDTO
