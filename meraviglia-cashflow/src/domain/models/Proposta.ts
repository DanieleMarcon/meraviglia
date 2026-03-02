import type { Service } from "./Service"
import type { StrategiaPagamento } from "./StrategiaPagamento"

export interface PropostaService {
  service: Service
  strategiaPagamento: StrategiaPagamento
}

export interface Proposta {
  id: string
  nome: string
  servizi: PropostaService[]
}