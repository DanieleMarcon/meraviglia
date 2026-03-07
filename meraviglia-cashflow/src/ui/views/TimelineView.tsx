import type { DragEvent } from "react"

import type { PianoStrategico } from "../../application/dto/StrategicPlanDTO"
import type { Proposta, PropostaService } from "../../application/dto/StrategicPlanDTO"

interface Props {
  proposta: Proposta
  piano: PianoStrategico
  pagamenti: number[]
  onMoveService: (serviceId: string, newMonth: number) => void
}

function buildMonths(durata: number): number[] {
  return Array.from({ length: durata }, (_, index) => index + 1)
}

function getPaymentColor(value: number, max: number): string {
  if (max === 0) return "transparent"

  const ratio = value / max

  if (ratio > 0.75) return "rgba(127,29,29,0.6)"
  if (ratio > 0.5) return "rgba(185,28,28,0.5)"
  if (ratio > 0.3) return "rgba(220,38,38,0.4)"
  if (ratio > 0.1) return "rgba(248,113,113,0.3)"

  return "transparent"
}

function getModuloName(mese: number, piano: PianoStrategico): string {
  const modulo = piano.moduli.find(
    (item) => mese >= item.meseInizio && mese < item.meseInizio + item.durata
  )

  return modulo ? modulo.nome : ""
}

export default function TimelineView({
  proposta,
  piano,
  pagamenti,
  onMoveService,
}: Props) {
  const durata = piano.durataTotale
  const mesi = buildMonths(durata)
  const maxPagamento = Math.max(...pagamenti)

  return (
    <div style={{ marginTop: 40 }}>
      <h2>Timeline Strategica</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${durata}, 1fr)`,
          marginBottom: 5,
        }}
      >
        {mesi.map((mese) => (
          <div
            key={mese}
            style={{
              border: "1px solid #ddd",
              padding: 6,
              fontSize: 12,
              textAlign: "center",
              background: "#fafafa",
            }}
          >
            M{mese}
          </div>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${durata}, 1fr)`,
          marginBottom: 20,
        }}
      >
        {mesi.map((mese) => {
          const moduloName = getModuloName(mese, piano)

          return (
            <div
              key={mese}
              style={{
                border: "1px solid #ddd",
                padding: 6,
                fontSize: 11,
                textAlign: "center",
                background: moduloName ? "#e5e7eb" : "#ffffff",
              }}
            >
              {moduloName}
            </div>
          )
        })}
      </div>

      {proposta.servizi.map((propostaService) => (
        <ServiceRow
          key={propostaService.service.id}
          propostaService={propostaService}
          durata={durata}
          pagamenti={pagamenti}
          maxPagamento={maxPagamento}
          onMoveService={onMoveService}
        />
      ))}
    </div>
  )
}

interface ServiceRowProps {
  propostaService: PropostaService
  durata: number
  pagamenti: number[]
  maxPagamento: number
  onMoveService: (serviceId: string, newMonth: number) => void
}

function ServiceRow({
  propostaService,
  durata,
  pagamenti,
  maxPagamento,
  onMoveService,
}: ServiceRowProps) {
  const { service } = propostaService
  const mesi = buildMonths(durata)

  const handleDragStart = (event: DragEvent<HTMLDivElement>) => {
    event.dataTransfer.setData("text/plain", service.id)
    event.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>, monthIndex: number) => {
    event.preventDefault()
    const serviceId = event.dataTransfer.getData("text/plain")

    if (!serviceId) return

    onMoveService(serviceId, monthIndex)
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${durata}, 1fr)`,
        marginBottom: 10,
        cursor: "grab",
      }}
    >
      {mesi.map((mese, index) => {
        const attivo =
          mese >= service.meseInizio &&
          mese < service.meseInizio + service.durataOperativa

        return (
          <div
            key={mese}
            data-month-index={mese}
            onDragOver={handleDragOver}
            onDrop={(event) => handleDrop(event, mese)}
            style={{
              border: "1px solid #eee",
              height: 40,
              background: attivo ? service.color ?? "#111827" : "#fafafa",
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              color: attivo ? "#fff" : "#aaa",
            }}
          >
            {attivo ? service.nome : ""}

            <div
              style={{
                position: "absolute",
                inset: 0,
                background: getPaymentColor(pagamenti[index], maxPagamento),
                pointerEvents: "none",
              }}
            />
          </div>
        )
      })}
    </div>
  )
}
