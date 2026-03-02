import type { PianoStrategico } from "../models/PianoStrategico"
import type { Proposta, PropostaService } from "../models/Proposta"
import type { Service } from "../models/Service"
import type { ServiceDefinition } from "../models/ServiceDefinition"
import type { StrategiaPagamento } from "../models/StrategiaPagamento"
import { DomainValidationError } from "../errors/DomainValidationError"

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
      definition.prezzoScontato === service.prezzoScontato
  )

  if (!match) {
    return FALLBACK_MAX_RATE
  }

  return clampInteger(match.maxRateConsentite, 1, Number.MAX_SAFE_INTEGER)
}

const sanitizeStrategiaPagamento = (
  strategiaPagamento: StrategiaPagamento,
  service: Service,
  pianoDurata: number,
  catalog: ServiceDefinition[]
): StrategiaPagamento => {
  const maxRateConsentite = resolveMaxRateConsentite(service, catalog)
  const mesiResidui = Math.max(1, pianoDurata - service.meseInizio + 1)
  const maxRatePerPiano = Math.min(maxRateConsentite, mesiResidui)

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
  catalog: ServiceDefinition[]
): PropostaService => {
  const serviceWithMaxRate: Service = {
    ...propostaService.service,
    maxRateConsentite: resolveMaxRateConsentite(propostaService.service, catalog),
  }

  const mesiResidui = Math.max(1, pianoDurata - serviceWithMaxRate.meseInizio + 1)

  const service: Service = {
    ...serviceWithMaxRate,
    durataOperativa: clampInteger(serviceWithMaxRate.durataOperativa, 1, mesiResidui),
  }

  const strategiaPagamento = sanitizeStrategiaPagamento(
    propostaService.strategiaPagamento,
    service,
    pianoDurata,
    catalog
  )

  return {
    ...propostaService,
    service,
    strategiaPagamento,
  }
}

export const sanitizePropostaAtBoundary = (
  proposta: Proposta,
  piano: PianoStrategico,
  catalog: ServiceDefinition[]
): Proposta => ({
  ...proposta,
  servizi: proposta.servizi.map((propostaService) => sanitizePropostaService(propostaService, piano.durataTotale, catalog)),
})

export const assertValidPaymentStrategy = (
  propostaService: PropostaService,
  piano: PianoStrategico
): void => {
  const { service, strategiaPagamento } = propostaService
  const maxRateConsentite = clampInteger(service.maxRateConsentite ?? FALLBACK_MAX_RATE, 1, Number.MAX_SAFE_INTEGER)
  const mesiResidui = piano.durataTotale - service.meseInizio + 1

  if (mesiResidui < 1) {
    throw new DomainValidationError(
      `Il servizio "${service.nome}" inizia oltre la durata del piano (${service.meseInizio} > ${piano.durataTotale}).`
    )
  }

  if (service.durataOperativa > mesiResidui) {
    throw new DomainValidationError(
      `Il servizio "${service.nome}" eccede la durata piano: durata operativa ${service.durataOperativa}, mesi residui ${mesiResidui}.`
    )
  }

  if (!service.consentiRateizzazione && (strategiaPagamento.tipo === "rate" || strategiaPagamento.tipo === "accontoRate")) {
    throw new DomainValidationError(
      `Il servizio "${service.nome}" non consente rateizzazione ma è stata impostata la strategia "${strategiaPagamento.tipo}".`
    )
  }

  if (!service.consentiAcconto && strategiaPagamento.tipo === "accontoRate") {
    throw new DomainValidationError(
      `Il servizio "${service.nome}" non consente acconto ma è stata impostata la strategia "accontoRate".`
    )
  }

  if (strategiaPagamento.tipo === "rate" || strategiaPagamento.tipo === "accontoRate") {
    const numeroRate = clampInteger(strategiaPagamento.numeroRate ?? 1, 1, Number.MAX_SAFE_INTEGER)
    const maxRatePerPiano = Math.min(maxRateConsentite, mesiResidui)

    if (numeroRate > maxRateConsentite) {
      throw new DomainValidationError(
        `Il servizio "${service.nome}" supera maxRateConsentite (${numeroRate} > ${maxRateConsentite}).`
      )
    }

    if (numeroRate > mesiResidui) {
      throw new DomainValidationError(
        `Il servizio "${service.nome}" supera i mesi disponibili del piano (${numeroRate} > ${mesiResidui}).`
      )
    }

    if (numeroRate > maxRatePerPiano) {
      throw new DomainValidationError(
        `Il servizio "${service.nome}" ha numeroRate invalido (${numeroRate}) rispetto al massimo consentito (${maxRatePerPiano}).`
      )
    }
  }
}
