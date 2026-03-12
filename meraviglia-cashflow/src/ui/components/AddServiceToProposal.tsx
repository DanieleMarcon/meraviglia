import { v4 as uuidv4 } from "uuid"
import type { Proposta } from "../../application/dto/StrategicPlanDTO"
import type { ServiceDefinition } from "../../application/dto/StrategicPlanDTO"
import type { TipoPagamento } from "../../application/dto/StrategicPlanDTO"

interface Props {
  catalog: ServiceDefinition[]
  proposta: Proposta
  onUpdate: (proposta: Proposta) => void
}

export default function AddServiceToProposal({
  catalog,
  proposta,
  onUpdate,
}: Props) {

  const addServiceToProposal = (serviceDef: ServiceDefinition) => {

    const newService = {
      service: {
        id: uuidv4(),
        catalogServiceId: serviceDef.id,
        nome: serviceDef.nome,
        prezzoPieno: serviceDef.prezzoPieno,
        prezzoScontato: serviceDef.prezzoScontato,
        usaPrezzoScontato: true,
        durataOperativa: serviceDef.durataStandard,
        meseInizio: 1,
        consentiRateizzazione: serviceDef.consentiRateizzazione,
        consentiAcconto: serviceDef.consentiAcconto,
        color: serviceDef.color,
      },
      strategiaPagamento: {
        tipo: "oneShot" as TipoPagamento,
      },
    }

    onUpdate({
      ...proposta,
      servizi: [...proposta.servizi, newService],
    })
  }

  return (
    <div style={{ marginBottom: 30 }}>
      <h3>Aggiungi servizio a {proposta.nome}</h3>

      {catalog.length === 0 && (
        <p>Nessun servizio nel catalogo.</p>
      )}

      {catalog.map((s) => (
        <div
          key={s.id}
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: 8,
            borderBottom: "1px solid #eee",
          }}
        >
          <span>
            {s.nome} — €{s.prezzoPieno}
          </span>

          <button onClick={() => addServiceToProposal(s)}>
            Aggiungi
          </button>
        </div>
      ))}
    </div>
  )
}
