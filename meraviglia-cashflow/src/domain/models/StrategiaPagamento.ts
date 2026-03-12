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

const clampInteger = (value: number, minimum: number, maximum: number): number => {
  if (!Number.isFinite(value)) {
    return minimum
  }

  const rounded = Math.floor(value)

  if (rounded < minimum) {
    return minimum
  }

  if (rounded > maximum) {
    return maximum
  }

  return rounded
}

export interface NormalizeStrategiaPagamentoOptions {
  consentiRateizzazione: boolean
  consentiAcconto: boolean
  maxRate: number
}

export const normalizeStrategiaPagamento = (
  strategiaPagamento: StrategiaPagamento,
  options: NormalizeStrategiaPagamentoOptions,
): StrategiaPagamento => {
  const maxRate = clampInteger(options.maxRate, 1, Number.MAX_SAFE_INTEGER)

  if (!options.consentiRateizzazione && (strategiaPagamento.tipo === "rate" || strategiaPagamento.tipo === "accontoRate")) {
    return { tipo: "oneShot" }
  }

  if (!options.consentiAcconto && strategiaPagamento.tipo === "accontoRate") {
    return {
      tipo: "rate",
      numeroRate: clampInteger(strategiaPagamento.numeroRate ?? 1, 1, maxRate),
    }
  }

  if (strategiaPagamento.tipo === "rate") {
    return {
      tipo: "rate",
      numeroRate: clampInteger(strategiaPagamento.numeroRate ?? 1, 1, maxRate),
    }
  }

  if (strategiaPagamento.tipo === "accontoRate") {
    return {
      tipo: "accontoRate",
      numeroRate: clampInteger(strategiaPagamento.numeroRate ?? 1, 1, maxRate),
      percentualeAcconto: strategiaPagamento.percentualeAcconto,
    }
  }

  if (strategiaPagamento.tipo === "abbonamento") {
    return { tipo: "abbonamento" }
  }

  return { tipo: "oneShot" }
}
