import type { ServiceDefinition } from "../../application/dto/StrategicPlanDTO"

interface Props {
  catalog: ServiceDefinition[]
  propostaName: string
  onAddCatalogService: (catalogServiceId: string) => void
}

export default function AddServiceToProposal({
  catalog,
  propostaName,
  onAddCatalogService,
}: Props) {

  const addServiceToProposal = (serviceDef: ServiceDefinition) => {
    onAddCatalogService(serviceDef.id)
  }

  return (
    <div style={{ marginBottom: 30 }}>
      <h3>Aggiungi servizio a {propostaName}</h3>

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
