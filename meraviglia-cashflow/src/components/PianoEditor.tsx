import type { PianoStrategico, Modulo } from "../models/PianoStrategico"

interface Props {
  piano: PianoStrategico
  onUpdate: (piano: PianoStrategico) => void
}

export default function PianoEditor({ piano, onUpdate }: Props) {

  const updateDurataTotale = (durata: number) => {
    onUpdate({
      ...piano,
      durataTotale: durata,
    })
  }

  const updateModulo = (index: number, updated: Partial<Modulo>) => {
    const nuoviModuli = [...piano.moduli]
    nuoviModuli[index] = { ...nuoviModuli[index], ...updated }

    onUpdate({
      ...piano,
      moduli: nuoviModuli,
    })
  }

  const addModulo = () => {
    onUpdate({
      ...piano,
      moduli: [
        ...piano.moduli,
        {
          nome: "Nuovo Modulo",
          meseInizio: 1,
          durata: 1,
        },
      ],
    })
  }

  const removeModulo = (index: number) => {
    const nuoviModuli = piano.moduli.filter((_, i) => i !== index)
    onUpdate({
      ...piano,
      moduli: nuoviModuli,
    })
  }

  const durataTotaleModuli = piano.moduli.reduce(
    (acc, m) => acc + m.durata,
    0
  )

  const valido = durataTotaleModuli === piano.durataTotale

  return (
    <div style={{ marginBottom: 40 }}>
      <h2>Piano Strategico</h2>

      <div style={{ marginBottom: 15 }}>
        <label>Durata Totale: </label>
        <input
          type="number"
          value={piano.durataTotale}
          onChange={(e) => updateDurataTotale(Number(e.target.value))}
          style={{ width: 80 }}
        />
      </div>

      {piano.moduli.map((m, index) => (
        <div
          key={index}
          style={{
            display: "flex",
            gap: 10,
            marginBottom: 8,
            alignItems: "center",
          }}
        >
          <input
            value={m.nome}
            onChange={(e) =>
              updateModulo(index, { nome: e.target.value })
            }
            placeholder="Nome modulo"
          />

          <input
            type="number"
            value={m.durata}
            onChange={(e) =>
              updateModulo(index, { durata: Number(e.target.value) })
            }
            style={{ width: 70 }}
          />

          <button onClick={() => removeModulo(index)}>
            Delete
          </button>
        </div>
      ))}

      <button onClick={addModulo}>Aggiungi Modulo</button>

      <div style={{ marginTop: 10 }}>
        <strong>
          Somma moduli: {durataTotaleModuli} / {piano.durataTotale}
        </strong>

        {!valido && (
          <span style={{ color: "red", marginLeft: 10 }}>
            ⚠ La somma deve combaciare
          </span>
        )}
      </div>
    </div>
  )
}