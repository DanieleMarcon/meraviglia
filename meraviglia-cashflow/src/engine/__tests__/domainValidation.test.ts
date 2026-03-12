import { describe, expect, it } from "vitest"
import {
  assertValidPaymentStrategy,
  sanitizePropostaAtBoundary,
} from "../../domain/validation/domainValidation"
import type { PianoStrategico } from "../../domain/models/PianoStrategico"
import type { Proposta, PropostaService } from "../../domain/models/Proposta"

const piano: PianoStrategico = {
  durataTotale: 12,
  moduli: [{ nome: "Base", meseInizio: 1, durata: 12 }],
}

const buildService = (overrides: Partial<PropostaService["service"]>): PropostaService["service"] => ({
  id: "service-validation",
  nome: "Ads",
  prezzoPieno: 1000,
  prezzoScontato: 850,
  usaPrezzoScontato: false,
  durataOperativa: 6,
  meseInizio: 1,
  consentiRateizzazione: true,
  consentiAcconto: true,
  maxRateConsentite: 4,
  ...overrides,
})

const buildProposta = (service: PropostaService["service"], strategia: PropostaService["strategiaPagamento"]): Proposta => ({
  id: "proposal-validation",
  nome: "Validation",
  servizi: [{ service, strategiaPagamento: strategia }],
})

describe("domainValidation", () => {
  it("se rate non consentite l'assert fallisce", () => {
    const propostaService: PropostaService = {
      service: buildService({ consentiRateizzazione: false }),
      strategiaPagamento: { tipo: "rate", numeroRate: 2 },
    }

    expect(() => assertValidPaymentStrategy(propostaService, piano)).toThrow(/non consente rateizzazione/)
  })

  it("se acconto non consentito l'assert fallisce", () => {
    const propostaService: PropostaService = {
      service: buildService({ consentiAcconto: false }),
      strategiaPagamento: { tipo: "accontoRate", numeroRate: 2, percentualeAcconto: 0.3 },
    }

    expect(() => assertValidPaymentStrategy(propostaService, piano)).toThrow(/non consente acconto/)
  })

  it("over-max-rate viene sanitizzato correttamente al boundary", () => {
    const proposta = buildProposta(buildService({ maxRateConsentite: 3 }), { tipo: "rate", numeroRate: 8 })

    const sanitized = sanitizePropostaAtBoundary(proposta, piano, [])

    expect(sanitized.servizi[0].strategiaPagamento.tipo).toBe("rate")
    expect(sanitized.servizi[0].strategiaPagamento.numeroRate).toBe(3)
  })

  it("acconto non consentito viene normalizzato a rate nel dominio", () => {
    const proposta = buildProposta(
      buildService({ consentiAcconto: false, maxRateConsentite: 2 }),
      { tipo: "accontoRate", numeroRate: 9, percentualeAcconto: 0.6 },
    )

    const sanitized = sanitizePropostaAtBoundary(proposta, piano, [])

    expect(sanitized.servizi[0].strategiaPagamento).toEqual({ tipo: "rate", numeroRate: 2 })
  })

  it("preferisce il match catalogo per id quando la shape non coincide", () => {
    const proposta = buildProposta(
      buildService({
        id: "svc-catalog-id",
        nome: "Legacy Name",
        prezzoPieno: 123,
        prezzoScontato: 111,
        maxRateConsentite: undefined,
      }),
      { tipo: "rate", numeroRate: 8 },
    )

    const catalog = [
      {
        id: "svc-catalog-id",
        nome: "Catalog Canonical",
        categoria: "Ops",
        prezzoPieno: 1000,
        prezzoScontato: 850,
        durataStandard: 6,
        color: "#16a34a",
        consentiRateizzazione: true,
        consentiAcconto: true,
        maxRateConsentite: 2,
      },
    ]

    const sanitized = sanitizePropostaAtBoundary(proposta, piano, catalog)

    expect(sanitized.servizi[0].service.maxRateConsentite).toBe(2)
    expect(sanitized.servizi[0].service.color).toBe("#16a34a")
    expect(sanitized.servizi[0].strategiaPagamento).toEqual({ tipo: "rate", numeroRate: 2 })
  })

  it("propaga l'identita catalogo via catalogServiceId quando l'id runtime differisce", () => {
    const proposta = buildProposta(
      buildService({
        id: "runtime-instance-id",
        catalogServiceId: "svc-catalog-id",
        nome: "Legacy Name",
        prezzoPieno: 123,
        prezzoScontato: 111,
        maxRateConsentite: undefined,
      }),
      { tipo: "rate", numeroRate: 8 },
    )

    const catalog = [
      {
        id: "svc-catalog-id",
        nome: "Catalog Canonical",
        categoria: "Ops",
        prezzoPieno: 1000,
        prezzoScontato: 850,
        durataStandard: 6,
        color: "#16a34a",
        consentiRateizzazione: true,
        consentiAcconto: true,
        maxRateConsentite: 2,
      },
    ]

    const sanitized = sanitizePropostaAtBoundary(proposta, piano, catalog)

    expect(sanitized.servizi[0].service.catalogServiceId).toBe("svc-catalog-id")
    expect(sanitized.servizi[0].service.maxRateConsentite).toBe(2)
    expect(sanitized.servizi[0].service.color).toBe("#16a34a")
    expect(sanitized.servizi[0].strategiaPagamento).toEqual({ tipo: "rate", numeroRate: 2 })
  })


  it("backfilla catalogServiceId su payload legacy quando esiste un match shape univoco", () => {
    const proposta = buildProposta(
      buildService({
        id: "legacy-runtime-id",
        maxRateConsentite: undefined,
      }),
      { tipo: "rate", numeroRate: 8 },
    )

    const catalog = [
      {
        id: "svc-catalog-id",
        nome: "Ads",
        categoria: "Ops",
        prezzoPieno: 1000,
        prezzoScontato: 850,
        durataStandard: 6,
        color: "#16a34a",
        consentiRateizzazione: true,
        consentiAcconto: true,
        maxRateConsentite: 2,
      },
    ]

    const sanitized = sanitizePropostaAtBoundary(proposta, piano, catalog)

    expect(sanitized.servizi[0].service.catalogServiceId).toBe("svc-catalog-id")
    expect(sanitized.servizi[0].service.maxRateConsentite).toBe(2)
  })

  it("disattiva fallback shape-based ambiguo quando esistono collisioni", () => {
    const proposta = buildProposta(
      buildService({ id: "svc-unmapped", maxRateConsentite: undefined }),
      { tipo: "rate", numeroRate: 8 },
    )

    const catalog = [
      {
        id: "svc-a",
        nome: "Ads",
        categoria: "Ops",
        prezzoPieno: 1000,
        prezzoScontato: 850,
        durataStandard: 6,
        color: "#16a34a",
        consentiRateizzazione: true,
        consentiAcconto: true,
        maxRateConsentite: 2,
      },
      {
        id: "svc-b",
        nome: "Ads",
        categoria: "Ops",
        prezzoPieno: 1000,
        prezzoScontato: 850,
        durataStandard: 6,
        color: "#0ea5e9",
        consentiRateizzazione: true,
        consentiAcconto: true,
        maxRateConsentite: 5,
      },
    ]

    const sanitized = sanitizePropostaAtBoundary(proposta, piano, catalog)

    expect(sanitized.servizi[0].service.maxRateConsentite).toBe(12)
    expect(sanitized.servizi[0].service.color).toBeUndefined()
    expect(sanitized.servizi[0].strategiaPagamento).toEqual({ tipo: "rate", numeroRate: 8 })
  })
})
