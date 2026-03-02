import { calcolaCashflow } from "../../engine/cashflow/cashflowEngine"
import type { PianoStrategico } from "../../domain/models/PianoStrategico"
import type { Proposta, PropostaService } from "../../domain/models/Proposta"
import CashflowChart from "./CashflowChart"
import TimelineView from "./TimelineView"

interface Props {
  piano: PianoStrategico
  propostaA: Proposta
  propostaB: Proposta
  onMoveServiceA: (serviceId: string, newMonth: number) => void
  onMoveServiceB: (serviceId: string, newMonth: number) => void
}

interface ProposalPanelProps {
  piano: PianoStrategico
  proposta: Proposta
  onMoveService: (serviceId: string, newMonth: number) => void
}

interface CashflowMonthData {
  month: string
  [serviceKey: string]: number | string
}

interface ServiceSeries {
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

const buildCashflowData = (proposta: Proposta, piano: PianoStrategico): { data: CashflowMonthData[]; services: ServiceSeries[] } => {
  const data: CashflowMonthData[] = Array.from(
    { length: piano.durataTotale },
    (_, index) => ({ month: `M${index + 1}` })
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

function ProposalPanel({ piano, proposta, onMoveService }: ProposalPanelProps) {
  const risultato = calcolaCashflow(proposta, piano)
  const chart = buildCashflowData(proposta, piano)

  return (
    <div style={{ flex: 1 }}>
      <h2>{proposta.nome}</h2>

      <TimelineView
        proposta={proposta}
        piano={piano}
        pagamenti={risultato.mesi}
        onMoveService={onMoveService}
      />

      <div style={{ marginTop: 40 }}>
        <CashflowChart data={chart.data} services={chart.services} />
      </div>
    </div>
  )
}

export default function ProposteCompareView({
  piano,
  propostaA,
  propostaB,
  onMoveServiceA,
  onMoveServiceB,
}: Props) {
  return (
    <div
      id="export-area"
      style={{
        display: "flex",
        gap: 40,
        marginTop: 40,
        background: "#ffffff",
        padding: 20,
      }}
    >
      <ProposalPanel
        piano={piano}
        proposta={propostaA}
        onMoveService={onMoveServiceA}
      />

      <ProposalPanel
        piano={piano}
        proposta={propostaB}
        onMoveService={onMoveServiceB}
      />
    </div>
  )
}
