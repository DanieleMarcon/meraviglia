import { describe, expect, it } from "vitest"
import { normalizePianoStrategico } from "../../domain/models/PianoStrategico"
import { normalizePropostaService, type PropostaService } from "../../domain/models/Proposta"
import { normalizeService } from "../../domain/models/Service"
import { sanitizePropostaAtBoundary } from "../../domain/validation/domainValidation"
import type { Proposta } from "../../domain/models/Proposta"

describe("domain aggregate hardening", () => {
  it("normalizza i servizi con invarianti minimi", () => {
    const normalized = normalizeService(
      {
        id: "svc-1",
        nome: "SEO",
        prezzoPieno: 100,
        prezzoScontato: 80,
        usaPrezzoScontato: false,
        durataOperativa: 0,
        meseInizio: 0,
        consentiRateizzazione: true,
        consentiAcconto: true,
      },
      { maxRateConsentite: 0 },
    )

    expect(normalized.maxRateConsentite).toBe(1)
    expect(normalized.durataOperativa).toBe(1)
    expect(normalized.meseInizio).toBe(1)
  })

  it("normalizza il piano strategico con durata minima", () => {
    const piano = normalizePianoStrategico({
      durataTotale: 0,
      moduli: [{ nome: "M1", meseInizio: 0, durata: 0 }],
    })

    expect(piano.durataTotale).toBe(1)
    expect(piano.moduli[0].meseInizio).toBe(1)
    expect(piano.moduli[0].durata).toBe(1)
  })

  it("usa il piano normalizzato durante la sanitizzazione proposta", () => {
    const proposta: Proposta = {
      id: "p-1",
      nome: "P1",
      servizi: [
        {
          service: {
            id: "svc-1",
            nome: "SEO",
            prezzoPieno: 1200,
            prezzoScontato: 900,
            usaPrezzoScontato: false,
            durataOperativa: 9,
            meseInizio: 1,
            consentiRateizzazione: true,
            consentiAcconto: true,
          },
          strategiaPagamento: { tipo: "rate", numeroRate: 3 },
        },
      ],
    }

    const sanitized = sanitizePropostaAtBoundary(
      proposta,
      { durataTotale: 0, moduli: [] },
      [],
    )

    expect(sanitized.servizi[0].service.durataOperativa).toBe(1)
  })

  it("normalizza strategia pagamento nel dominio propostaService", () => {
    const propostaService: PropostaService = {
      service: {
        id: "svc-2",
        nome: "Ads",
        prezzoPieno: 500,
        prezzoScontato: 400,
        usaPrezzoScontato: false,
        durataOperativa: 4,
        meseInizio: 2,
        consentiRateizzazione: false,
        consentiAcconto: false,
        maxRateConsentite: 6,
      },
      strategiaPagamento: { tipo: "accontoRate", numeroRate: 10, percentualeAcconto: 0.5 },
    }

    const normalized = normalizePropostaService(propostaService, { maxRatePerPiano: 3 })
    expect(normalized.strategiaPagamento).toEqual({ tipo: "oneShot" })
  })
})
