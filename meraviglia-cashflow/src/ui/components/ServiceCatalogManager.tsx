import { useState } from "react"
import type { ServiceDefinition } from "../../domain/models/ServiceDefinition"
import { useServiceCatalog } from "../../state/appState/useServiceCatalog"

export default function ServiceCatalogManager() {

  const { services, addService, removeService } = useServiceCatalog()

  const [form, setForm] = useState<Omit<ServiceDefinition, "id">>({
    nome: "",
    categoria: "",
    prezzoPieno: 0,
    prezzoScontato: 0,
    durataStandard: 1,
    colore: "#1f2937",
    consentiRateizzazione: true,
    consentiAcconto: true,
    maxRateConsentite: 12,
  })

  const handleSubmit = () => {
    if (!form.nome) return
    addService(form)
    setForm({ ...form, nome: "" })
  }

  return (
    <div style={{ marginBottom: 40 }}>
      <h2>Service Catalog</h2>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <input
          placeholder="Nome"
          value={form.nome}
          onChange={e => setForm({ ...form, nome: e.target.value })}
        />

        <input
          placeholder="Categoria"
          value={form.categoria}
          onChange={e => setForm({ ...form, categoria: e.target.value })}
        />

        <input
          type="number"
          placeholder="Prezzo pieno"
          value={form.prezzoPieno}
          onChange={e => setForm({ ...form, prezzoPieno: Number(e.target.value) })}
        />

        <input
          type="number"
          placeholder="Prezzo scontato"
          value={form.prezzoScontato}
          onChange={e => setForm({ ...form, prezzoScontato: Number(e.target.value) })}
        />

        <input
          type="number"
          placeholder="Durata"
          value={form.durataStandard}
          onChange={e => setForm({ ...form, durataStandard: Number(e.target.value) })}
        />

        <input
          type="color"
          value={form.colore}
          onChange={e => setForm({ ...form, colore: e.target.value })}
        />

        <button onClick={handleSubmit}>Add</button>
      </div>

      <div style={{ marginTop: 20 }}>
        {services.map((s: ServiceDefinition) => (
          <div
            key={s.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 5
            }}
          >
            <span>{s.nome} — €{s.prezzoPieno}</span>
            <button onClick={() => removeService(s.id)}>
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}