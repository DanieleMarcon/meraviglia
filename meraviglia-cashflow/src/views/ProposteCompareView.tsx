import type { Proposta } from "../models/Proposta"
import type { PianoStrategico } from "../models/PianoStrategico"
import { calcolaCashflow } from "../engine/cashflowEngine"
import TimelineView from "./TimelineView"
import CashflowChart from "./CashflowChart"

interface Props {
  piano: PianoStrategico
  propostaA: Proposta
  propostaB: Proposta
  onMoveServiceA: (serviceId: string, newMonth: number) => void
  onMoveServiceB: (serviceId: string, newMonth: number) => void
}

export default function ProposteCompareView({
  piano,
  propostaA,
  propostaB,
  onMoveServiceA,
  onMoveServiceB,
}: Props) {
  const risultatoA = calcolaCashflow(propostaA, piano)
  const risultatoB = calcolaCashflow(propostaB, piano)

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
      <div style={{ flex: 1 }}>
        <h2>{propostaA.nome}</h2>

        <TimelineView
          proposta={propostaA}
          piano={piano}
          pagamenti={risultatoA.mesi}
          onMoveService={onMoveServiceA}
        />

        <div style={{ marginTop: 40 }}>
          <CashflowChart mesi={risultatoA.mesi} />
        </div>
      </div>

      <div style={{ flex: 1 }}>
        <h2>{propostaB.nome}</h2>

        <TimelineView
          proposta={propostaB}
          piano={piano}
          pagamenti={risultatoB.mesi}
          onMoveService={onMoveServiceB}
        />

        <div style={{ marginTop: 40 }}>
          <CashflowChart mesi={risultatoB.mesi} />
        </div>
      </div>
    </div>
  )
}