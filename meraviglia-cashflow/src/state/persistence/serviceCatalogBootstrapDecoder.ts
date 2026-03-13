import type { ServiceDefinition } from "../../application/dto/StrategicPlanDTO"

export const SERVICE_CATALOG_BOOTSTRAP_VERSION = 1 as const

interface PersistedServiceCatalogEnvelopeV1 {
  version: typeof SERVICE_CATALOG_BOOTSTRAP_VERSION
  payload: unknown
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null

const readString = (value: unknown): string | null =>
  typeof value === "string" ? value : null

const readNumber = (value: unknown): number | null =>
  typeof value === "number" && Number.isFinite(value) ? value : null

const readBoolean = (value: unknown): boolean | null =>
  typeof value === "boolean" ? value : null

const hasPersistedServiceCatalogEnvelopeShape = (
  value: unknown,
): value is PersistedServiceCatalogEnvelopeV1 => {
  if (!isObject(value)) {
    return false
  }

  return value.version === SERVICE_CATALOG_BOOTSTRAP_VERSION && "payload" in value
}

const decodeServiceCatalogItem = (value: unknown): ServiceDefinition | null => {
  if (!isObject(value)) {
    return null
  }

  const id = readString(value.id)
  const nome = readString(value.nome)
  const categoria = readString(value.categoria)
  const prezzoPieno = readNumber(value.prezzoPieno)
  const prezzoScontato = readNumber(value.prezzoScontato)
  const durataStandard = readNumber(value.durataStandard)
  const consentiRateizzazione = readBoolean(value.consentiRateizzazione)
  const consentiAcconto = readBoolean(value.consentiAcconto)
  const maxRateConsentite = readNumber(value.maxRateConsentite)

  if (
    !id
    || !nome
    || !categoria
    || prezzoPieno === null
    || prezzoScontato === null
    || durataStandard === null
    || consentiRateizzazione === null
    || consentiAcconto === null
    || maxRateConsentite === null
  ) {
    return null
  }

  const color = readString(value.color)

  return {
    id,
    nome,
    categoria,
    prezzoPieno,
    prezzoScontato,
    durataStandard,
    consentiRateizzazione,
    consentiAcconto,
    maxRateConsentite,
    ...(color ? { color } : {}),
  }
}

const decodePersistedServiceCatalogPayload = (payload: unknown): ServiceDefinition[] => {
  if (!Array.isArray(payload)) {
    return []
  }

  return payload
    .map(decodeServiceCatalogItem)
    .filter((service): service is ServiceDefinition => service !== null)
}

export const createServiceCatalogBootstrapEnvelope = (
  payload: ServiceDefinition[],
): PersistedServiceCatalogEnvelopeV1 => ({
  version: SERVICE_CATALOG_BOOTSTRAP_VERSION,
  payload,
})

export const decodeServiceCatalogBootstrapPayload = (raw: unknown): ServiceDefinition[] => {
  if (hasPersistedServiceCatalogEnvelopeShape(raw)) {
    return decodePersistedServiceCatalogPayload(raw.payload)
  }

  if (isObject(raw) && "version" in raw) {
    return []
  }

  return decodePersistedServiceCatalogPayload(raw)
}
