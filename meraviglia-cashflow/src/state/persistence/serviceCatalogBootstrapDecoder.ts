import type { ServiceDefinition } from "../../application/dto/StrategicPlanDTO"

export const SERVICE_CATALOG_BOOTSTRAP_VERSION = 1 as const

/**
 * Compatibility lifecycle policy (Step 47):
 * - Canonical read/write contract: envelope `{ version: 1, payload }`.
 * - Legacy compatibility bridge: unversioned array payloads are still read.
 * - Backfill behavior: legacy-unversioned reads should be opportunistically
 *   written back as canonical v1 envelope by app-state bootstrap.
 * - Sunset trigger: once no legacy-unversioned reads are observed for a full
 *   release cycle (target not before 2026-06-30), remove legacy fallback.
 */
export const SERVICE_CATALOG_LEGACY_UNVERSIONED_READ_SUNSET_TARGET = "2026-06-30"

interface PersistedServiceCatalogEnvelopeV1 {
  version: typeof SERVICE_CATALOG_BOOTSTRAP_VERSION
  payload: unknown
}

export type ServiceCatalogBootstrapCompatibilityState =
  | "canonical_v1"
  | "legacy_unversioned"
  | "unsupported_version"
  | "invalid_shape"

export interface DecodedServiceCatalogBootstrap {
  payload: ServiceDefinition[]
  compatibilityState: ServiceCatalogBootstrapCompatibilityState
  shouldWriteBackCanonicalEnvelope: boolean
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

export const decodeServiceCatalogBootstrapPayloadWithMigration = (
  raw: unknown,
): DecodedServiceCatalogBootstrap => {
  if (hasPersistedServiceCatalogEnvelopeShape(raw)) {
    return {
      payload: decodePersistedServiceCatalogPayload(raw.payload),
      compatibilityState: "canonical_v1",
      shouldWriteBackCanonicalEnvelope: false,
    }
  }

  if (isObject(raw) && "version" in raw) {
    return {
      payload: [],
      compatibilityState: "unsupported_version",
      shouldWriteBackCanonicalEnvelope: false,
    }
  }

  if (!Array.isArray(raw)) {
    return {
      payload: [],
      compatibilityState: "invalid_shape",
      shouldWriteBackCanonicalEnvelope: false,
    }
  }

  return {
    payload: decodePersistedServiceCatalogPayload(raw),
    compatibilityState: "legacy_unversioned",
    shouldWriteBackCanonicalEnvelope: true,
  }
}

export const decodeServiceCatalogBootstrapPayload = (raw: unknown): ServiceDefinition[] =>
  decodeServiceCatalogBootstrapPayloadWithMigration(raw).payload
