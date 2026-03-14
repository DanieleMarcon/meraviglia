import type { PaymentTypeDTO, Proposta } from "../../application/dto/StrategicPlanDTO"

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null

const isString = (value: unknown): value is string => typeof value === "string"
const isNumber = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value)
const isBoolean = (value: unknown): value is boolean => typeof value === "boolean"

const VALID_PAYMENT_TYPES: readonly PaymentTypeDTO[] = [
  "oneShot",
  "rate",
  "abbonamento",
  "accontoRate",
]

const isPaymentType = (value: unknown): value is PaymentTypeDTO =>
  isString(value) && VALID_PAYMENT_TYPES.includes(value as PaymentTypeDTO)

const decodePaymentStrategy = (raw: unknown): Proposta["servizi"][number]["strategiaPagamento"] | null => {
  if (!isObject(raw) || !isPaymentType(raw.tipo)) {
    return null
  }

  const decoded: Proposta["servizi"][number]["strategiaPagamento"] = {
    tipo: raw.tipo,
  }

  if (raw.numeroRate !== undefined) {
    if (!isNumber(raw.numeroRate)) {
      return null
    }

    decoded.numeroRate = raw.numeroRate
  }

  if (raw.percentualeAcconto !== undefined) {
    if (!isNumber(raw.percentualeAcconto)) {
      return null
    }

    decoded.percentualeAcconto = raw.percentualeAcconto
  }

  return decoded
}

const decodeProposalService = (raw: unknown): Proposta["servizi"][number] | null => {
  if (!isObject(raw) || !isObject(raw.service)) {
    return null
  }

  const service = raw.service

  if (
    !isString(service.id)
    || !isString(service.nome)
    || !isNumber(service.prezzoPieno)
    || !isNumber(service.prezzoScontato)
    || !isBoolean(service.usaPrezzoScontato)
    || !isNumber(service.durataOperativa)
    || !isNumber(service.meseInizio)
    || !isBoolean(service.consentiRateizzazione)
    || !isBoolean(service.consentiAcconto)
  ) {
    return null
  }

  const decodedPaymentStrategy = decodePaymentStrategy(raw.strategiaPagamento)

  if (!decodedPaymentStrategy) {
    return null
  }

  const legacyCatalogServiceId = isString(service.catalog_service_id)
    ? service.catalog_service_id
    : undefined
  const catalogServiceId = isString(service.catalogServiceId)
    ? service.catalogServiceId
    : legacyCatalogServiceId

  return {
    service: {
      id: service.id,
      nome: service.nome,
      prezzoPieno: service.prezzoPieno,
      prezzoScontato: service.prezzoScontato,
      usaPrezzoScontato: service.usaPrezzoScontato,
      durataOperativa: service.durataOperativa,
      meseInizio: service.meseInizio,
      consentiRateizzazione: service.consentiRateizzazione,
      consentiAcconto: service.consentiAcconto,
      ...(isNumber(service.maxRateConsentite) ? { maxRateConsentite: service.maxRateConsentite } : {}),
      ...(isString(service.color) ? { color: service.color } : {}),
      ...(catalogServiceId ? { catalogServiceId } : {}),
    },
    strategiaPagamento: decodedPaymentStrategy,
  }
}

export const decodeProposalImportPayload = (raw: unknown): Proposta | null => {
  if (!isObject(raw) || !isString(raw.id) || !isString(raw.nome) || !Array.isArray(raw.servizi)) {
    return null
  }

  const decodedServices: Proposta["servizi"] = []

  for (let index = 0; index < raw.servizi.length; index += 1) {
    const decodedService = decodeProposalService(raw.servizi[index])

    if (!decodedService) {
      return null
    }

    decodedServices.push(decodedService)
  }

  return {
    id: raw.id,
    nome: raw.nome,
    servizi: decodedServices,
  }
}
