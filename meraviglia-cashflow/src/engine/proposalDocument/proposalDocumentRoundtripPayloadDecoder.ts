import type { ActivatedServicesPayload } from "./proposalDocumentPayloads"

const ACTIVATED_SERVICES_ROUNDTRIP_VERSION = 1 as const

interface ActivatedServicesRoundtripEnvelopeV1 {
  version: typeof ACTIVATED_SERVICES_ROUNDTRIP_VERSION
  payload: unknown
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null

const isString = (value: unknown): value is string => typeof value === "string"

const isNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value)

const decodeActivatedServicesPayloadBody = (
  raw: unknown,
): ActivatedServicesPayload | null => {
  if (!isObject(raw) || !Array.isArray(raw.services)) {
    return null
  }

  const services: ActivatedServicesPayload["services"] = []

  for (let index = 0; index < raw.services.length; index += 1) {
    const item = raw.services[index]

    if (!isObject(item)) {
      return null
    }

    const legacyCatalogServiceId = isString(item.catalog_service_id)
      ? item.catalog_service_id
      : null
    const catalogServiceId = isString(item.catalogServiceId)
      ? item.catalogServiceId
      : legacyCatalogServiceId

    if (
      !isString(item.id)
      || !isString(item.nome)
      || !isString(item.modulo)
      || !isNumber(item.prezzo)
      || !isNumber(item.durataOperativa)
      || !isString(item.paymentType)
    ) {
      return null
    }

    services.push({
      id: item.id,
      catalogServiceId,
      nome: item.nome,
      modulo: item.modulo,
      prezzo: item.prezzo,
      durataOperativa: item.durataOperativa,
      paymentType: item.paymentType,
    })
  }

  return { services }
}

const isActivatedServicesRoundtripEnvelopeV1 = (
  raw: unknown,
): raw is ActivatedServicesRoundtripEnvelopeV1 => {
  return isObject(raw) && raw.version === ACTIVATED_SERVICES_ROUNDTRIP_VERSION && "payload" in raw
}

export const decodeActivatedServicesRoundtripPayload = (
  raw: unknown,
): ActivatedServicesPayload | null => {
  if (isActivatedServicesRoundtripEnvelopeV1(raw)) {
    return decodeActivatedServicesPayloadBody(raw.payload)
  }

  if (isObject(raw) && "version" in raw) {
    return null
  }

  return decodeActivatedServicesPayloadBody(raw)
}

export const createActivatedServicesRoundtripEnvelope = (
  payload: ActivatedServicesPayload,
): ActivatedServicesRoundtripEnvelopeV1 => ({
  version: ACTIVATED_SERVICES_ROUNDTRIP_VERSION,
  payload,
})
