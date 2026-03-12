import type { Service } from "./Service"
import {
  normalizeStrategiaPagamento,
  type StrategiaPagamento,
} from "./StrategiaPagamento"

export interface PropostaService {
  service: Service
  strategiaPagamento: StrategiaPagamento
}

export interface Proposta {
  id: string
  nome: string
  servizi: PropostaService[]
}

export const normalizeProposta = (
  proposta: Proposta,
  normalizePropostaService: (propostaService: PropostaService) => PropostaService,
): Proposta => ({
  ...proposta,
  servizi: proposta.servizi.map(normalizePropostaService),
})

export interface NormalizePropostaServiceOptions {
  maxRatePerPiano: number
}

export const normalizePropostaService = (
  propostaService: PropostaService,
  options: NormalizePropostaServiceOptions,
): PropostaService => ({
  ...propostaService,
  strategiaPagamento: normalizeStrategiaPagamento(propostaService.strategiaPagamento, {
    consentiRateizzazione: propostaService.service.consentiRateizzazione,
    consentiAcconto: propostaService.service.consentiAcconto,
    maxRate: options.maxRatePerPiano,
  }),
})
