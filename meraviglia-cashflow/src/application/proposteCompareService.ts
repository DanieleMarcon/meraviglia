import type {
  CashflowMonthDataDTO,
  CompareCashflowDTO,
  CompareServiceSeriesDTO,
} from "./dto/ProposteCompareDTO"
import type { PianoStrategico, Proposta } from "./dto/StrategicPlanDTO"
import {
  mapCompareProjectionToServiceSeriesDTO,
  mapProposalToCompareProjection,
  type CompareServiceProjection,
} from "./mappers/proposteCompareMappers"

export type CashflowMonthData = CashflowMonthDataDTO
export type ServiceSeries = CompareServiceSeriesDTO

const getServiceMonthlyContribution = (
  projection: CompareServiceProjection,
  durata: number,
): number[] => {
  const contributions = Array<number>(durata).fill(0)
  const { paymentStrategy, effectivePrice, operationalDuration, startMonth } = projection

  switch (paymentStrategy.tipo) {
    case "oneShot": {
      if (startMonth <= durata) {
        contributions[startMonth - 1] += effectivePrice
      }
      break
    }
    case "rate": {
      const numeroRate = paymentStrategy.numeroRate ?? 1
      const rata = effectivePrice / numeroRate
      for (let i = 0; i < numeroRate; i += 1) {
        const month = startMonth + i
        if (month <= durata) {
          contributions[month - 1] += rata
        }
      }
      break
    }
    case "abbonamento": {
      for (let i = 0; i < operationalDuration; i += 1) {
        const month = startMonth + i
        if (month <= durata) {
          contributions[month - 1] += effectivePrice
        }
      }
      break
    }
    case "accontoRate": {
      const percentuale = paymentStrategy.percentualeAcconto ?? 0.3
      const numeroRateAcconto = paymentStrategy.numeroRate ?? 1
      const acconto = effectivePrice * percentuale
      const resto = effectivePrice - acconto
      const rataAcconto = resto / numeroRateAcconto

      if (startMonth <= durata) {
        contributions[startMonth - 1] += acconto
      }

      for (let i = 1; i <= numeroRateAcconto; i += 1) {
        const month = startMonth + i
        if (month <= durata) {
          contributions[month - 1] += rataAcconto
        }
      }
      break
    }
  }

  return contributions
}

export const buildCashflowData = (
  proposta: Proposta,
  piano: PianoStrategico,
): CompareCashflowDTO => {
  const compareProjection = mapProposalToCompareProjection(proposta)

  const data: CashflowMonthData[] = Array.from(
    { length: piano.durataTotale },
    (_, index) => ({ month: `M${index + 1}` }),
  )

  const services = compareProjection.map(mapCompareProjectionToServiceSeriesDTO)

  compareProjection.forEach((projection) => {
    const monthlyContribution = getServiceMonthlyContribution(projection, piano.durataTotale)

    monthlyContribution.forEach((amount, index) => {
      if (amount <= 0) {
        return
      }

      const serviceKey = projection.runtimeServiceId
      const monthData = data[index]
      const previous = typeof monthData[serviceKey] === "number" ? monthData[serviceKey] as number : 0
      monthData[serviceKey] = previous + amount
    })
  })

  return { data, services }
}
