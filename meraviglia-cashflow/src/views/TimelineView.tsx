import { DndContext, useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"

import type { Proposta } from "../models/Proposta"
import type { PianoStrategico } from "../models/PianoStrategico"
import type { PropostaService } from "../models/Proposta"

interface Props {
  proposta: Proposta
  piano: PianoStrategico
  pagamenti: number[]
  onMoveService: (serviceId: string, newMonth: number) => void
}

function getPaymentColor(value: number, max: number) {
  if (max === 0) return "transparent"
  const ratio = value / max

  if (ratio > 0.75) return "rgba(127,29,29,0.6)"
  if (ratio > 0.5) return "rgba(185,28,28,0.5)"
  if (ratio > 0.3) return "rgba(220,38,38,0.4)"
  if (ratio > 0.1) return "rgba(248,113,113,0.3)"

  return "transparent"
}

export default function TimelineView({
  proposta,
  piano,
  pagamenti,
  onMoveService,
}: Props) {
  const durata = piano.durataTotale
  const mesi = Array.from({ length: durata }, (_, i) => i + 1)
  const maxPagamento = Math.max(...pagamenti)

  return (
    <div style={{ marginTop: 40 }}>
      <h2>Timeline Strategica</h2>

      {/* HEADER MESI */}
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

      {/* MODULI */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${durata}, 1fr)`,
          marginBottom: 20,
        }}
      >
        {mesi.map((mese) => {
          const modulo = piano.moduli.find(
            (m) =>
              mese >= m.meseInizio &&
              mese < m.meseInizio + m.durata
          )

          return (
            <div
              key={mese}
              style={{
                border: "1px solid #ddd",
                padding: 6,
                fontSize: 11,
                textAlign: "center",
                background: modulo ? "#e5e7eb" : "#ffffff",
              }}
            >
              {modulo ? modulo.nome : ""}
            </div>
          )
        })}
      </div>

      {/* SERVIZI */}
      <DndContext
        onDragEnd={(event) => {
          const { active, delta } = event
          const serviceId = active.id as string

          const monthWidth = 100
          const shift = Math.round(delta.x / monthWidth)

          const found = proposta.servizi.find(
            (s) => s.service.id === serviceId
          )

          if (!found) return

          let newMonth = found.service.meseInizio + shift

          if (newMonth < 1) newMonth = 1
          if (newMonth > durata) newMonth = durata

          onMoveService(serviceId, newMonth)
        }}
      >
        {proposta.servizi.map((ps: PropostaService) => (
          <ServiceRow
            key={ps.service.id}
            propostaService={ps}
            durata={durata}
            pagamenti={pagamenti}
            maxPagamento={maxPagamento}
          />
        ))}
      </DndContext>
    </div>
  )
}

function ServiceRow({
  propostaService,
  durata,
  pagamenti,
  maxPagamento,
}: {
  propostaService: PropostaService
  durata: number
  pagamenti: number[]
  maxPagamento: number
}) {
  const { service, colore } = propostaService

  const { attributes, listeners, setNodeRef, transform } =
    useDraggable({
      id: service.id,
    })

  const style = {
    transform: CSS.Translate.toString(transform),
  }

  const mesi = Array.from({ length: durata }, (_, i) => i + 1)

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${durata}, 1fr)`,
        marginBottom: 10,
        cursor: "grab",
        ...style,
      }}
    >
      {mesi.map((mese, index) => {
        const attivo =
          mese >= service.meseInizio &&
          mese < service.meseInizio + service.durataOperativa

        const paymentOverlay = getPaymentColor(
          pagamenti[index],
          maxPagamento
        )

        return (
          <div
            key={mese}
            style={{
              border: "1px solid #eee",
              height: 40,
              background: attivo ? colore || "#111827" : "#fafafa",
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
                background: paymentOverlay,
              }}
            />
          </div>
        )
      })}
    </div>
  )
}