import type { Proposta } from "../../domain/models/Proposta"
import type { PianoStrategico } from "../../domain/models/PianoStrategico"
import { assertValidPaymentStrategy } from "../../domain/validation/domainValidation"

export interface CashflowResult {
  mesi: number[]
  totale: number
  totaleAnno1: number
  totaleAnno2: number
  totaleAcconti: number
  totaleRisparmio: number
}

export function calcolaCashflow(
  proposta: Proposta,
  piano: PianoStrategico
): CashflowResult {

  const durata = piano.durataTotale
  const mesi = Array(durata).fill(0)

  let totaleAcconti = 0
  let totaleRisparmio = 0

  proposta.servizi.forEach((ps) => {
    assertValidPaymentStrategy(ps, piano)

    const service = ps.service
    const strategia = ps.strategiaPagamento

    const prezzoEffettivo = service.usaPrezzoScontato
      ? service.prezzoScontato
      : service.prezzoPieno

    totaleRisparmio += service.prezzoPieno - prezzoEffettivo

    const meseInizio = service.meseInizio

    switch (strategia.tipo) {
      case "oneShot": {
        if (meseInizio <= durata) {
          mesi[meseInizio - 1] += prezzoEffettivo
        }
        break
      }

      case "rate": {
        const numeroRate = strategia.numeroRate ?? 1
        const rata = prezzoEffettivo / numeroRate

        for (let i = 0; i < numeroRate; i++) {
          const mese = meseInizio + i
          if (mese <= durata) {
            mesi[mese - 1] += rata
          }
        }
        break
      }

      case "abbonamento": {
        for (let i = 0; i < service.durataOperativa; i++) {
          const mese = meseInizio + i
          if (mese <= durata) {
            mesi[mese - 1] += prezzoEffettivo
          }
        }
        break
      }

      case "accontoRate": {
        const percentuale = strategia.percentualeAcconto ?? 0.3
        const numeroRateAcconto = strategia.numeroRate ?? 1

        const acconto = prezzoEffettivo * percentuale
        const resto = prezzoEffettivo - acconto
        const rataAcconto = resto / numeroRateAcconto

        if (meseInizio <= durata) {
          mesi[meseInizio - 1] += acconto
          totaleAcconti += acconto
        }

        for (let i = 1; i <= numeroRateAcconto; i++) {
          const mese = meseInizio + i
          if (mese <= durata) {
            mesi[mese - 1] += rataAcconto
          }
        }
        break
      }
    }
  })

  const totale = mesi.reduce((a, b) => a + b, 0)

  const totaleAnno1 =
    durata >= 12
      ? mesi.slice(0, 12).reduce((a, b) => a + b, 0)
      : totale

  const totaleAnno2 =
    durata > 12
      ? mesi.slice(12).reduce((a, b) => a + b, 0)
      : 0

  return {
    mesi,
    totale,
    totaleAnno1,
    totaleAnno2,
    totaleAcconti,
    totaleRisparmio,
  }
}
