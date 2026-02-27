import { useState, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"

import type { Proposta } from "./models/Proposta"
import type { PianoStrategico } from "./models/PianoStrategico"
import type { PropostaService } from "./models/Proposta"

import ProposteCompareView from "./views/ProposteCompareView"
import PaymentEditor from "./components/PaymentEditor"
import ExportButtons from "./components/ExportButtons"
import ServiceCatalogManager from "./components/ServiceCatalogManager"
import AddServiceToProposal from "./components/AddServiceToProposal"
import PianoEditor from "./components/PianoEditor"

import { useServiceCatalog } from "./hooks/useServiceCatalog"
import { saveToStorage, clearStorage } from "./utils/storage"

const STORAGE_KEY = "meraviglia-cashflow"

function App() {

  const { services: catalog } = useServiceCatalog()

  const [piano, setPiano] = useState<PianoStrategico>({
    durataTotale: 12,
    moduli: [
      { nome: "Strutturazione", meseInizio: 1, durata: 3 },
      { nome: "Attivazione", meseInizio: 4, durata: 3 },
      { nome: "Ottimizzazione", meseInizio: 7, durata: 3 },
      { nome: "Scaling", meseInizio: 10, durata: 3 },
    ],
  })

  const [propostaA, setPropostaA] = useState<Proposta>({
    id: uuidv4(),
    nome: "Piano Completo",
    servizi: [],
  })

  const [propostaB, setPropostaB] = useState<Proposta>({
    id: uuidv4(),
    nome: "Piano Modulato",
    servizi: [],
  })

  useEffect(() => {
    saveToStorage(STORAGE_KEY, { propostaA, propostaB, piano })
  }, [propostaA, propostaB, piano])

  const moveService = (
    propostaSetter: React.Dispatch<React.SetStateAction<Proposta>>,
    serviceId: string,
    newMonth: number
  ) => {
    propostaSetter((prev) => ({
      ...prev,
      servizi: prev.servizi.map((s: PropostaService) =>
        s.service.id === serviceId
          ? {
              ...s,
              service: {
                ...s.service,
                meseInizio: newMonth,
              },
            }
          : s
      ),
    }))
  }

  const resetAll = () => {
    clearStorage(STORAGE_KEY)
    window.location.reload()
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Meraviglia Cashflow Engine</h1>

      <PianoEditor
        piano={piano}
        onUpdate={setPiano}
      />

      <ServiceCatalogManager />

      <AddServiceToProposal
        catalog={catalog}
        proposta={propostaA}
        onUpdate={setPropostaA}
      />

      <div style={{ marginBottom: 20 }}>
        <button onClick={resetAll}>
          Reset
        </button>
      </div>

      <ExportButtons elementId="export-area" />

      <PaymentEditor
        proposta={propostaA}
        onUpdate={setPropostaA}
      />

      <ProposteCompareView
        piano={piano}
        propostaA={propostaA}
        propostaB={propostaB}
        onMoveServiceA={(id, month) =>
          moveService(setPropostaA, id, month)
        }
        onMoveServiceB={(id, month) =>
          moveService(setPropostaB, id, month)
        }
      />
    </div>
  )
}

export default App