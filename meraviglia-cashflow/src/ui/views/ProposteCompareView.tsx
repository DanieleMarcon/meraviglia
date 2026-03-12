import React from "react"
import { buildCashflowData } from "../../application/proposteCompareService"
import { calcolaCashflow } from "../../application/strategicPlanningService"
import type { PianoStrategico } from "../../application/dto/StrategicPlanDTO"
import type { Proposta } from "../../application/dto/StrategicPlanDTO"
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

const CashflowChart = React.lazy(() => import("./CashflowChart"))

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
        <React.Suspense fallback={<div style={{ padding: 16 }}>Loading...</div>}>
          <CashflowChart
            data={chart.data}
            services={chart.services}
            monthlyTotals={risultato.mesi}
            totalYearOne={risultato.totaleAnno1}
            total24Months={risultato.totale}
          />
        </React.Suspense>
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
