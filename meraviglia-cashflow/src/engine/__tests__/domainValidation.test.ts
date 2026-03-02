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
})
