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

export const ProposalSectionType = {
  COVER: "COVER",
  PRESENTATION: "PRESENTATION",
  INDEX: "INDEX",
  MERAVIGLIA_NUMBERS: "MERAVIGLIA_NUMBERS",
  ACTIVATED_SERVICES: "ACTIVATED_SERVICES",
  STRATEGIC_PLAN: "STRATEGIC_PLAN",
  OPERATIONAL_ARCHITECTURE: "OPERATIONAL_ARCHITECTURE",
  FINANCIAL_PROPOSAL: "FINANCIAL_PROPOSAL",
  CASHFLOW: "CASHFLOW",
  INVESTMENT_AND_TERMS: "INVESTMENT_AND_TERMS",
  COMPARISON: "COMPARISON",
  CLOSING: "CLOSING",
} as const

export type ProposalSectionTypeDTO =
  (typeof ProposalSectionType)[keyof typeof ProposalSectionType]

// Transitional aliases to keep UI modules stable while moving to DTO-only imports.
export type TipoPagamento = PaymentTypeDTO
export type StrategiaPagamento = PaymentStrategyDTO
export type Service = ServiceDTO
export type PropostaService = ProposalServiceDTO
export type Proposta = ProposalDTO
export type Modulo = ModuleDTO
export type PianoStrategico = StrategicPlanDTO
export type ServiceDefinition = ServiceDefinitionDTO
export type ProposalSectionTypeValue = ProposalSectionTypeDTO
