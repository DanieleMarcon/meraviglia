import { describe, expect, it } from "vitest"
import { calcolaCashflow } from "../cashflow/cashflowEngine"
import { sanitizePropostaAtBoundary } from "../../domain/validation/domainValidation"
import type { PianoStrategico } from "../../domain/models/PianoStrategico"
import type { Proposta, PropostaService } from "../../domain/models/Proposta"

const basePiano = (durataTotale: number): PianoStrategico => ({
  durataTotale,
  moduli: [{ nome: "Modulo A", meseInizio: 1, durata: durataTotale }],
})

const buildService = (overrides: Partial<PropostaService["service"]>): PropostaService["service"] => ({
  id: "svc-1",
  nome: "SEO",
  prezzoPieno: 1200,
  prezzoScontato: 1000,
  usaPrezzoScontato: false,
  durataOperativa: 1,
  meseInizio: 1,
  consentiRateizzazione: true,
  consentiAcconto: true,
  maxRateConsentite: 12,
  ...overrides,
})

const buildProposta = (service: PropostaService["service"], strategia: PropostaService["strategiaPagamento"]): Proposta => ({
  id: "p-1",
  nome: "Proposta Test",
  servizi: [{ service, strategiaPagamento: strategia }],
})

describe("cashflowEngine", () => {
  it("calcola una one-shot su singolo servizio", () => {
    const proposta = buildProposta(buildService({}), { tipo: "oneShot" })

    const result = calcolaCashflow(proposta, basePiano(12))

    expect(result.mesi[0]).toBe(1200)
    expect(result.totale).toBe(1200)
    expect(result.totaleAnno1).toBe(1200)
  })

  it("calcola rateizzazione su 3 mesi", () => {
    const proposta = buildProposta(buildService({ prezzoPieno: 900 }), { tipo: "rate", numeroRate: 3 })

    const result = calcolaCashflow(proposta, basePiano(12))

    expect(result.mesi.slice(0, 4)).toEqual([300, 300, 300, 0])
    expect(result.totale).toBe(900)
  })

  it("calcola scenario acconto + rate", () => {
    const proposta = buildProposta(buildService({ prezzoPieno: 1000 }), {
      tipo: "accontoRate",
      percentualeAcconto: 0.4,
      numeroRate: 3,
    })

    const result = calcolaCashflow(proposta, basePiano(12))

    expect(result.mesi.slice(0, 4)).toEqual([400, 200, 200, 200])
    expect(result.totaleAcconti).toBe(400)
    expect(result.totale).toBe(1000)
  })

  it("enforce maxRateConsentite invalidando numeroRate oltre il massimo", () => {
    const proposta = buildProposta(buildService({ maxRateConsentite: 2, prezzoPieno: 600 }), {
      tipo: "rate",
      numeroRate: 3,
    })

    expect(() => calcolaCashflow(proposta, basePiano(12))).toThrow(/maxRateConsentite/)
  })

  it("clampa la durata operativa al piano via sanitizer", () => {
    const proposta = buildProposta(
      buildService({ durataOperativa: 12, meseInizio: 10, consentiRateizzazione: false }),
      { tipo: "abbonamento" }
    )
    const piano = basePiano(12)

    const sanitized = sanitizePropostaAtBoundary(proposta, piano, [])
    const result = calcolaCashflow(sanitized, piano)

    expect(sanitized.servizi[0].service.durataOperativa).toBe(3)
    expect(result.mesi.slice(9, 12)).toEqual([1200, 1200, 1200])
  })
})
