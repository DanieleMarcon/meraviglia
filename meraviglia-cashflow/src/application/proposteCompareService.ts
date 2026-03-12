import type { PianoStrategico, Proposta, PropostaService } from "./dto/StrategicPlanDTO"

export interface CashflowMonthData {
  month: string
  [serviceKey: string]: number | string
}

export interface ServiceSeries {
  key: string
  name: string
  color: string
}

const getServiceMonthlyContribution = (propostaService: PropostaService, durata: number): number[] => {
  const contributions = Array<number>(durata).fill(0)
  const { service, strategiaPagamento } = propostaService

  const prezzoEffettivo = service.usaPrezzoScontato
    ? service.prezzoScontato
    : service.prezzoPieno

  switch (strategiaPagamento.tipo) {
    case "oneShot": {
      if (service.meseInizio <= durata) {
        contributions[service.meseInizio - 1] += prezzoEffettivo
      }
      break
    }
    case "rate": {
      const numeroRate = strategiaPagamento.numeroRate ?? 1
      const rata = prezzoEffettivo / numeroRate
      for (let i = 0; i < numeroRate; i += 1) {
        const month = service.meseInizio + i
        if (month <= durata) {
          contributions[month - 1] += rata
        }
      }
      break
    }
    case "abbonamento": {
      for (let i = 0; i < service.durataOperativa; i += 1) {
        const month = service.meseInizio + i
        if (month <= durata) {
          contributions[month - 1] += prezzoEffettivo
        }
      }
      break
    }
    case "accontoRate": {
      const percentuale = strategiaPagamento.percentualeAcconto ?? 0.3
      const numeroRateAcconto = strategiaPagamento.numeroRate ?? 1
      const acconto = prezzoEffettivo * percentuale
      const resto = prezzoEffettivo - acconto
      const rataAcconto = resto / numeroRateAcconto

      if (service.meseInizio <= durata) {
        contributions[service.meseInizio - 1] += acconto
      }

      for (let i = 1; i <= numeroRateAcconto; i += 1) {
        const month = service.meseInizio + i
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
): { data: CashflowMonthData[]; services: ServiceSeries[] } => {
  const data: CashflowMonthData[] = Array.from(
    { length: piano.durataTotale },
    (_, index) => ({ month: `M${index + 1}` }),
  )

  const services = proposta.servizi.map((propostaService) => ({
    key: propostaService.service.id,
    name: propostaService.service.nome,
    color: propostaService.service.color ?? "#111827",
  }))

  proposta.servizi.forEach((propostaService) => {
    const monthlyContribution = getServiceMonthlyContribution(propostaService, piano.durataTotale)

    monthlyContribution.forEach((amount, index) => {
      if (amount <= 0) {
        return
      }

      const serviceKey = propostaService.service.id
      const monthData = data[index]
      const previous = typeof monthData[serviceKey] === "number" ? monthData[serviceKey] as number : 0
      monthData[serviceKey] = previous + amount
    })
  })

  return { data, services }
}
