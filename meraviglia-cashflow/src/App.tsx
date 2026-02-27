import type { Dispatch, SetStateAction } from "react"

import type { Proposta } from "./models/Proposta"
import type { PropostaService } from "./models/Proposta"

import ProposteCompareView from "./views/ProposteCompareView"
import PaymentEditor from "./components/PaymentEditor"
import ExportButtons from "./components/ExportButtons"
import ServiceCatalogManager from "./components/ServiceCatalogManager"
import AddServiceToProposal from "./components/AddServiceToProposal"
import PianoEditor from "./components/PianoEditor"

import { useServiceCatalog } from "./hooks/useServiceCatalog"
import { useAppState } from "./hooks/useAppState"
import { clearStorage } from "./utils/storage"

const STORAGE_KEY = "meraviglia-cashflow"
const SERVICE_CATALOG_STORAGE_KEY = "meraviglia-service-catalog"

function App() {
  const { services: catalog } = useServiceCatalog()
  const {
    piano,
    setPiano,
    propostaA,
    setPropostaA,
    propostaB,
    setPropostaB,
  } = useAppState()

  const moveService = (
    propostaSetter: Dispatch<SetStateAction<Proposta>>,
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
    clearStorage(SERVICE_CATALOG_STORAGE_KEY)
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
