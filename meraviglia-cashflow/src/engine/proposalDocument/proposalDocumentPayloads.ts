export interface ActivatedServicesPayload {
  services: Array<{
    id: string
    catalogServiceId: string | null
    nome: string
    modulo: string
    prezzo: number
    durataOperativa: number
    paymentType: string
  }>
}

export interface FinancialProposalPayload {
  totaleAnno1: number
  totaleAnno2: number
  totale24Mesi: number
  totaleAcconti: number
  numeroServizi: number
}

export interface ComparisonPayload {
  propostaA: {
    totale24Mesi: number
    totaleAnno1: number
    totaleAnno2: number
  }
  propostaB: {
    totale24Mesi: number
    totaleAnno1: number
    totaleAnno2: number
  }
  delta24Mesi: number
  deltaPercentuale: number
}
