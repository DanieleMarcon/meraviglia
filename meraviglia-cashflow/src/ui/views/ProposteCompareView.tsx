import { calcolaCashflow } from "../../engine/cashflow/cashflowEngine"
import type { PianoStrategico } from "../../domain/models/PianoStrategico"
import type { Proposta } from "../../domain/models/Proposta"
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

function ProposalPanel({ piano, proposta, onMoveService }: ProposalPanelProps) {
  const risultato = calcolaCashflow(proposta, piano)

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
        <CashflowChart mesi={risultato.mesi} />
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
