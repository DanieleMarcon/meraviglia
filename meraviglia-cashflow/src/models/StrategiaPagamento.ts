export type TipoPagamento =
  | "oneShot"
  | "rate"
  | "abbonamento"
  | "accontoRate"

export interface StrategiaPagamento {
  tipo: TipoPagamento
  numeroRate?: number
  percentualeAcconto?: number
}