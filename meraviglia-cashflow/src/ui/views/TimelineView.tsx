import { DndContext, useDraggable, type DragEndEvent } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"

import type { PianoStrategico } from "../../domain/models/PianoStrategico"
import type { Proposta, PropostaService } from "../../domain/models/Proposta"

interface Props {
  proposta: Proposta
  piano: PianoStrategico
  pagamenti: number[]
  onMoveService: (serviceId: string, newMonth: number) => void
}

const MONTH_WIDTH = 100

function buildMonths(durata: number): number[] {
  return Array.from({ length: durata }, (_, index) => index + 1)
}

function clampMonth(month: number, durata: number): number {
  if (month < 1) return 1
  if (month > durata) return durata
  return month
}

function getServiceById(
  servizi: PropostaService[],
  serviceId: string
): PropostaService | undefined {
  return servizi.find((entry) => entry.service.id === serviceId)
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

function getShiftedMonth(startMonth: number, deltaX: number, durata: number): number {
  const shift = Math.round(deltaX / MONTH_WIDTH)
  return clampMonth(startMonth + shift, durata)
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

  const handleDragEnd = (event: DragEndEvent) => {
    const serviceId = String(event.active.id)
    const serviceEntry = getServiceById(proposta.servizi, serviceId)

    if (!serviceEntry) return

    const newMonth = getShiftedMonth(
      serviceEntry.service.meseInizio,
      event.delta.x,
      durata
    )

    onMoveService(serviceId, newMonth)
  }

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

      <DndContext onDragEnd={handleDragEnd}>
        {proposta.servizi.map((propostaService) => (
          <ServiceRow
            key={propostaService.service.id}
            propostaService={propostaService}
            durata={durata}
            pagamenti={pagamenti}
            maxPagamento={maxPagamento}
          />
        ))}
      </DndContext>
    </div>
  )
}

interface ServiceRowProps {
  propostaService: PropostaService
  durata: number
  pagamenti: number[]
  maxPagamento: number
}

function ServiceRow({
  propostaService,
  durata,
  pagamenti,
  maxPagamento,
}: ServiceRowProps) {
  const { service, colore } = propostaService
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: service.id,
  })

  const style = {
    transform: CSS.Translate.toString(transform),
  }

  const mesi = buildMonths(durata)

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
                background: getPaymentColor(pagamenti[index], maxPagamento),
              }}
            />
          </div>
        )
      })}
    </div>
  )
}
