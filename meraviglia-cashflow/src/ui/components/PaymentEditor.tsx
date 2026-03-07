import { useState } from "react"

import type { Proposta } from "../../application/dto/StrategicPlanDTO"
import type { ServiceDefinition } from "../../application/dto/StrategicPlanDTO"
import type { TipoPagamento } from "../../application/dto/StrategicPlanDTO"
import type { PianoStrategico } from "../../application/dto/StrategicPlanDTO"

import { resolvePaymentConstraints } from "../../application/strategicPlanningService"

interface Props {
  proposta: Proposta
  piano: PianoStrategico
  catalog: ServiceDefinition[]
  onUpdate: (proposta: Proposta) => void
}

export default function PaymentEditor({ proposta, piano, catalog, onUpdate }: Props) {
  const [warningsByServiceId, setWarningsByServiceId] = useState<Record<string, string>>({})

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

  const updateRate = (serviceId: string, rate: number, maxRateConsentite: number) => {
    if (rate > maxRateConsentite) {
      setWarningsByServiceId((prev) => ({
        ...prev,
        [serviceId]: `Numero rate non aggiornato: massimo consentito ${maxRateConsentite}.`,
      }))
      return
    }

    setWarningsByServiceId((prev) => {
      const next = { ...prev }
      delete next[serviceId]
      return next
    })

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

      {proposta.servizi.map((ps) => {
        const { maxRateConsentite, maxRatePerPiano } = resolvePaymentConstraints(ps.service, piano.durataTotale, catalog)
        const warning = warningsByServiceId[ps.service.id]

        const prezzoEffettivo = ps.service.usaPrezzoScontato
          ? ps.service.prezzoScontato
          : ps.service.prezzoPieno

        const numeroRate = ps.strategiaPagamento.numeroRate || 1
        const percentualeAcconto = ps.strategiaPagamento.percentualeAcconto ?? 0.3
        const acconto = prezzoEffettivo * percentualeAcconto
        const rata = prezzoEffettivo / numeroRate
        const rataConAcconto = (prezzoEffettivo - acconto) / numeroRate

        let summary = "Pagamento: One Shot"

        if (ps.strategiaPagamento.tipo === "rate") {
          summary = `Pagamento: ${numeroRate} rate da €${rata.toFixed(2)}`
        }

        if (ps.strategiaPagamento.tipo === "accontoRate") {
          summary = `Pagamento: Acconto €${acconto.toFixed(2)} + ${numeroRate} rate da €${rataConAcconto.toFixed(2)}`
        }

        if (ps.strategiaPagamento.tipo === "abbonamento") {
          summary = `Pagamento: Abbonamento €${prezzoEffettivo.toFixed(2)} / mese`
        }

        return (
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
                <option value="rate" disabled={!ps.service.consentiRateizzazione}>Rate</option>
                <option value="abbonamento">Abbonamento</option>
                <option
                  value="accontoRate"
                  disabled={!ps.service.consentiAcconto || !ps.service.consentiRateizzazione}
                >
                  Acconto + Rate
                </option>
              </select>
            </div>

            {!ps.service.consentiRateizzazione && (
              <p style={{ marginTop: 6, marginBottom: 0, fontSize: 12, color: "#6b7280" }}>
                Rateizzazione non consentita per questo servizio
              </p>
            )}

            {!ps.service.consentiAcconto && (
              <p style={{ marginTop: 6, marginBottom: 0, fontSize: 12, color: "#6b7280" }}>
                Acconto non consentito per questo servizio
              </p>
            )}

            <p style={{ marginTop: 6, marginBottom: 0, fontSize: 12, color: "#6b7280" }}>
              Max {maxRateConsentite} rate consentite
            </p>

            {(ps.strategiaPagamento.tipo === "rate" || ps.strategiaPagamento.tipo === "accontoRate") && (
              <div style={{ marginTop: 10 }}>
                <label>Numero Rate:</label>
                <input
                  type="number"
                  min={1}
                  max={maxRatePerPiano}
                  value={ps.strategiaPagamento.numeroRate || 1}
                  onChange={(e) =>
                    updateRate(
                      ps.service.id,
                      Number(e.target.value),
                      maxRateConsentite
                    )
                  }
                  style={{ marginLeft: 10, width: 80 }}
                />
              </div>
            )}

            {warning && (
              <p style={{ marginTop: 6, marginBottom: 0, fontSize: 12, color: "#b91c1c" }}>
                ⚠️ {warning}
              </p>
            )}

            <p style={{ marginTop: 10, marginBottom: 0, fontSize: 13 }}>
              {summary}
            </p>
          </div>
        )
      })}
    </div>
  )
}
