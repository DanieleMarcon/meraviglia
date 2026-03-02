import type { Proposta } from "../../domain/models/Proposta"
import type { TipoPagamento } from "../../domain/models/StrategiaPagamento"

interface Props {
  proposta: Proposta
  onUpdate: (proposta: Proposta) => void
}

export default function PaymentEditor({ proposta, onUpdate }: Props) {
  const updateTipo = (serviceId: string, tipo: TipoPagamento) => {
    const nuova = {
      ...proposta,
      servizi: proposta.servizi.map((s) =>
        s.service.id === serviceId
          ? {
              ...s,
              strategiaPagamento: {
                ...s.strategiaPagamento,
                tipo,
              },
            }
          : s
      ),
    }
    onUpdate(nuova)
  }

  const updateRate = (serviceId: string, rate: number) => {
    const nuova = {
      ...proposta,
      servizi: proposta.servizi.map((s) =>
        s.service.id === serviceId
          ? {
              ...s,
              strategiaPagamento: {
                ...s.strategiaPagamento,
                numeroRate: rate,
              },
            }
          : s
      ),
    }
    onUpdate(nuova)
  }

  return (
    <div style={{ marginBottom: 40 }}>
      <h3>Configurazione Pagamenti - {proposta.nome}</h3>

      {proposta.servizi.map((ps) => (
        <div
          key={ps.service.id}
          style={{
            border: "1px solid #ddd",
            padding: 15,
            marginBottom: 10,
            borderRadius: 6,
          }}
        >
          <strong>{ps.service.nome}</strong>

          <div style={{ marginTop: 10 }}>
            <label>Tipo pagamento:</label>
            <select
              value={ps.strategiaPagamento.tipo}
              onChange={(e) =>
                updateTipo(
                  ps.service.id,
                  e.target.value as TipoPagamento
                )
              }
              style={{ marginLeft: 10 }}
            >
              <option value="oneShot">One Shot</option>
              <option value="rate">Rate</option>
              <option value="abbonamento">Abbonamento</option>
              <option value="accontoRate">Acconto + Rate</option>
            </select>
          </div>

          {ps.strategiaPagamento.tipo === "rate" && (
            <div style={{ marginTop: 10 }}>
              <label>Numero Rate:</label>
              <input
                type="number"
                value={ps.strategiaPagamento.numeroRate || 1}
                onChange={(e) =>
                  updateRate(
                    ps.service.id,
                    Number(e.target.value)
                  )
                }
                style={{ marginLeft: 10, width: 80 }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}