import type { PianoStrategico } from "../../application/dto/StrategicPlanDTO"

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null

const isString = (value: unknown): value is string => typeof value === "string"
const isNumber = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value)

const decodeModulo = (raw: unknown): PianoStrategico["moduli"][number] | null => {
  if (!isObject(raw) || !isString(raw.nome) || !isNumber(raw.durata)) {
    return null
  }

  // Compatibility bridge for legacy snake_case payloads at read ingress only.
  // Canonical naming remains camelCase and is what downstream flows should persist.
  const meseInizio = isNumber(raw.meseInizio)
    ? raw.meseInizio
    : isNumber(raw.mese_inizio)
      ? raw.mese_inizio
      : null

  if (meseInizio === null) {
    return null
  }

  return {
    nome: raw.nome,
    meseInizio,
    durata: raw.durata,
  }
}

export const decodePianoImportPayload = (raw: unknown): PianoStrategico | null => {
  if (!isObject(raw) || !Array.isArray(raw.moduli)) {
    return null
  }

  // Transitional alias acceptance mirrors old exports; decoder keeps this narrow and
  // structural so business normalization continues in domain/application layers.
  const durataTotale = isNumber(raw.durataTotale)
    ? raw.durataTotale
    : isNumber(raw.durata_totale)
      ? raw.durata_totale
      : null

  if (durataTotale === null) {
    return null
  }

  const decodedModuli: PianoStrategico["moduli"] = []

  for (let index = 0; index < raw.moduli.length; index += 1) {
    const decodedModulo = decodeModulo(raw.moduli[index])

    if (!decodedModulo) {
      return null
    }

    decodedModuli.push(decodedModulo)
  }

  return {
    durataTotale,
    moduli: decodedModuli,
  }
}
