export interface Service {
  id: string
  catalogServiceId?: string
  nome: string
  prezzoPieno: number
  prezzoScontato: number
  usaPrezzoScontato: boolean

  // durata operativa (non finanziaria)
  durataOperativa: number

  // posizione nella timeline
  meseInizio: number

  // leve strategiche
  consentiRateizzazione: boolean
  consentiAcconto: boolean
  maxRateConsentite?: number
  color?: string
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

export interface NormalizeServiceOptions {
  maxRateConsentite: number
  color?: string
  maxDurataOperativa?: number
}

export const normalizeService = (
  service: Service,
  options: NormalizeServiceOptions,
): Service => {
  const normalizedMaxRate = clampInteger(options.maxRateConsentite, 1, Number.MAX_SAFE_INTEGER)
  const durataMassima = options.maxDurataOperativa ?? Number.MAX_SAFE_INTEGER

  return {
    ...service,
    maxRateConsentite: normalizedMaxRate,
    color: service.color ?? options.color,
    durataOperativa: clampInteger(service.durataOperativa, 1, durataMassima),
    meseInizio: clampInteger(service.meseInizio, 1, Number.MAX_SAFE_INTEGER),
  }
}
