import React, { type Dispatch, type SetStateAction } from "react"

import {
  ProposalSectionType,
  type ProposalDTO,
  type ProposalServiceDTO,
} from "./application/dto/StrategicPlanDTO"

import PaymentEditor from "./ui/components/PaymentEditor"
import ExportButtons from "./ui/components/ExportButtons"
import ServiceCatalogManager from "./ui/components/ServiceCatalogManager"
import AddServiceToProposal from "./ui/components/AddServiceToProposal"
import PianoEditor from "./ui/components/PianoEditor"
import IntakeView from "./ui/views/IntakeView"
import UnauthorizedView from "./ui/views/UnauthorizedView"
import { AuthProvider } from "./auth/AuthProvider"
import ProtectedRoute from "./auth/ProtectedRoute"

import { useServiceCatalog } from "./state/appState/useServiceCatalog"
import { useAppState } from "./state/appState/useAppState"
import { clearStorage } from "./state/persistence/storage"

const STORAGE_KEY = "meraviglia-cashflow"
const SERVICE_CATALOG_STORAGE_KEY = "meraviglia-service-catalog"

const ProposteCompareView = React.lazy(() => import("./ui/views/ProposteCompareView"))

const SECTION_TOGGLE_LABELS = [
  { type: ProposalSectionType.ACTIVATED_SERVICES, label: "Activated Services" },
  { type: ProposalSectionType.STRATEGIC_PLAN, label: "Strategic Plan" },
  { type: ProposalSectionType.FINANCIAL_PROPOSAL, label: "Financial Proposal" },
  { type: ProposalSectionType.CASHFLOW, label: "Cashflow" },
  { type: ProposalSectionType.COMPARISON, label: "Comparison" },
  { type: ProposalSectionType.INVESTMENT_AND_TERMS, label: "Investment and Terms" },
] as const

function CashflowApp() {
  const {
    services: catalog,
    addService,
    removeService,
  } = useServiceCatalog()
  const {
    piano,
    setPiano,
    propostaA,
    setPropostaA,
    propostaB,
    setPropostaB,
    addCatalogServiceToPropostaA,
    updatePropostaAServicePaymentStrategy,
    sectionToggles,
    setSectionEnabled,
  } = useAppState()

  const moveService = (
    propostaSetter: Dispatch<SetStateAction<ProposalDTO>>,
    serviceId: string,
    newMonth: number
  ) => {
    propostaSetter((prev) => ({
      ...prev,
      servizi: prev.servizi.map((s: ProposalServiceDTO) =>
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

      <ServiceCatalogManager
        services={catalog}
        addService={addService}
        removeService={removeService}
      />

      <AddServiceToProposal
        catalog={catalog}
        propostaName={propostaA.nome}
        onAddCatalogService={addCatalogServiceToPropostaA}
      />

      <div style={{ marginBottom: 20 }}>
        <button onClick={resetAll}>
          Reset
        </button>
      </div>

      <ExportButtons elementId="export-area" />

      <div style={{ marginBottom: 20 }}>
        <h3 style={{ marginBottom: 8 }}>Proposal Sections</h3>

        {SECTION_TOGGLE_LABELS
          .filter((item) => item.type !== ProposalSectionType.COMPARISON || Boolean(propostaB))
          .map((item) => (
            <label key={item.type} style={{ display: "block", marginBottom: 4 }}>
              <input
                type="checkbox"
                checked={sectionToggles[item.type]}
                onChange={(event) => setSectionEnabled(item.type, event.target.checked)}
              />
              {" "}
              {item.label}
            </label>
          ))}
      </div>

      <PaymentEditor
        proposta={propostaA}
        piano={piano}
        catalog={catalog}
        onUpdatePaymentStrategy={updatePropostaAServicePaymentStrategy}
      />

      <IntakeView />

      <React.Suspense fallback={<div style={{ padding: 16 }}>Loading...</div>}>
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
      </React.Suspense>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      {window.location.pathname === "/unauthorized" ? (
        <UnauthorizedView />
      ) : (
        <ProtectedRoute>
          <CashflowApp />
        </ProtectedRoute>
      )}
    </AuthProvider>
  )
}

export default App
