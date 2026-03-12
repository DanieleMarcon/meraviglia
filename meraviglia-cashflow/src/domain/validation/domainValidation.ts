import { DomainValidationError } from "../errors/DomainValidationError"
import { normalizePianoStrategico, type PianoStrategico } from "../models/PianoStrategico"
import { normalizeProposta, type Proposta, type PropostaService } from "../models/Proposta"
import { normalizeService, type Service } from "../models/Service"
import type { ServiceDefinition } from "../models/ServiceDefinition"
import type { StrategiaPagamento } from "../models/StrategiaPagamento"

const FALLBACK_MAX_RATE = 12

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

const resolveMaxRateConsentite = (service: Service, catalog: ServiceDefinition[]): number => {
  if (typeof service.maxRateConsentite === "number" && Number.isFinite(service.maxRateConsentite)) {
    return clampInteger(service.maxRateConsentite, 1, Number.MAX_SAFE_INTEGER)
  }

  const match = catalog.find(
    (definition) =>
      definition.nome === service.nome &&
      definition.prezzoPieno === service.prezzoPieno &&
      definition.prezzoScontato === service.prezzoScontato,
  )

  if (!match) {
    return FALLBACK_MAX_RATE
  }

  return clampInteger(match.maxRateConsentite, 1, Number.MAX_SAFE_INTEGER)
}

const resolveCatalogColor = (service: Service, catalog: ServiceDefinition[]): string | undefined => {
  const match = catalog.find(
    (definition) =>
      definition.nome === service.nome &&
      definition.prezzoPieno === service.prezzoPieno &&
      definition.prezzoScontato === service.prezzoScontato,
  )

  return match?.color
}

export interface PaymentConstraints {
  maxRateConsentite: number
  mesiResidui: number
  maxRatePerPiano: number
}

export const resolvePaymentConstraints = (
  service: Service,
  pianoDurata: number,
  catalog: ServiceDefinition[],
): PaymentConstraints => {
  const maxRateConsentite = resolveMaxRateConsentite(service, catalog)
  const mesiResidui = Math.max(1, pianoDurata - service.meseInizio + 1)

  return {
    maxRateConsentite,
    mesiResidui,
    maxRatePerPiano: Math.min(maxRateConsentite, mesiResidui),
  }
}

const sanitizeStrategiaPagamento = (
  strategiaPagamento: StrategiaPagamento,
  service: Service,
  pianoDurata: number,
  catalog: ServiceDefinition[],
): StrategiaPagamento => {
  const { maxRatePerPiano } = resolvePaymentConstraints(service, pianoDurata, catalog)

  if (!service.consentiRateizzazione && (strategiaPagamento.tipo === "rate" || strategiaPagamento.tipo === "accontoRate")) {
    return { tipo: "oneShot" }
  }

  if (!service.consentiAcconto && strategiaPagamento.tipo === "accontoRate") {
    return { tipo: "rate", numeroRate: clampInteger(strategiaPagamento.numeroRate ?? 1, 1, maxRatePerPiano) }
  }

  if (strategiaPagamento.tipo === "rate") {
    return {
      ...strategiaPagamento,
      numeroRate: clampInteger(strategiaPagamento.numeroRate ?? 1, 1, maxRatePerPiano),
    }
  }

  if (strategiaPagamento.tipo === "accontoRate") {
    return {
      ...strategiaPagamento,
      numeroRate: clampInteger(strategiaPagamento.numeroRate ?? 1, 1, maxRatePerPiano),
    }
  }

  return strategiaPagamento
}

const sanitizePropostaService = (
  propostaService: PropostaService,
  pianoDurata: number,
  catalog: ServiceDefinition[],
): PropostaService => {
  const maxRateConsentite = resolveMaxRateConsentite(propostaService.service, catalog)
  const mesiResidui = Math.max(1, pianoDurata - propostaService.service.meseInizio + 1)

  const service = normalizeService(propostaService.service, {
    maxRateConsentite,
    color: resolveCatalogColor(propostaService.service, catalog),
    maxDurataOperativa: mesiResidui,
  })

  const strategiaPagamento = sanitizeStrategiaPagamento(propostaService.strategiaPagamento, service, pianoDurata, catalog)

  return {
    ...propostaService,
    service,
    strategiaPagamento,
  }
}

export const sanitizePropostaAtBoundary = (
  proposta: Proposta,
  piano: PianoStrategico,
  catalog: ServiceDefinition[],
): Proposta => {
  const normalizedPiano = normalizePianoStrategico(piano)

  return normalizeProposta(proposta, (propostaService) =>
    sanitizePropostaService(propostaService, normalizedPiano.durataTotale, catalog),
  )
}

export const assertValidPaymentStrategy = (propostaService: PropostaService, piano: PianoStrategico): void => {
  const normalizedPiano = normalizePianoStrategico(piano)
  const normalizedService = normalizeService(propostaService.service, {
    maxRateConsentite: propostaService.service.maxRateConsentite ?? FALLBACK_MAX_RATE,
  })

  const { strategiaPagamento } = propostaService
  const maxRateConsentite = clampInteger(normalizedService.maxRateConsentite ?? FALLBACK_MAX_RATE, 1, Number.MAX_SAFE_INTEGER)
  const mesiResidui = normalizedPiano.durataTotale - normalizedService.meseInizio + 1

  if (mesiResidui < 1) {
    throw new DomainValidationError(
      `Il servizio "${normalizedService.nome}" inizia oltre la durata del piano (${normalizedService.meseInizio} > ${normalizedPiano.durataTotale}).`,
    )
  }

  if (normalizedService.durataOperativa > mesiResidui) {
    throw new DomainValidationError(
      `Il servizio "${normalizedService.nome}" eccede la durata piano: durata operativa ${normalizedService.durataOperativa}, mesi residui ${mesiResidui}.`,
    )
  }

  if (!normalizedService.consentiRateizzazione && (strategiaPagamento.tipo === "rate" || strategiaPagamento.tipo === "accontoRate")) {
    throw new DomainValidationError(
      `Il servizio "${normalizedService.nome}" non consente rateizzazione ma è stata impostata la strategia "${strategiaPagamento.tipo}".`,
    )
  }

  if (!normalizedService.consentiAcconto && strategiaPagamento.tipo === "accontoRate") {
    throw new DomainValidationError(
      `Il servizio "${normalizedService.nome}" non consente acconto ma è stata impostata la strategia "accontoRate".`,
    )
  }

  if (strategiaPagamento.tipo === "rate" || strategiaPagamento.tipo === "accontoRate") {
    const numeroRate = clampInteger(strategiaPagamento.numeroRate ?? 1, 1, Number.MAX_SAFE_INTEGER)
    const maxRatePerPiano = Math.min(maxRateConsentite, mesiResidui)

    if (numeroRate > maxRateConsentite) {
      throw new DomainValidationError(
        `Il servizio "${normalizedService.nome}" supera maxRateConsentite (${numeroRate} > ${maxRateConsentite}).`,
      )
    }

    if (numeroRate > mesiResidui) {
      throw new DomainValidationError(
        `Il servizio "${normalizedService.nome}" supera i mesi disponibili del piano (${numeroRate} > ${mesiResidui}).`,
      )
    }

    if (numeroRate > maxRatePerPiano) {
      throw new DomainValidationError(
        `Il servizio "${normalizedService.nome}" ha numeroRate invalido (${numeroRate}) rispetto al massimo consentito (${maxRatePerPiano}).`,
      )
    }
  }
}
