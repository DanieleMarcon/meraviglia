import React from "react"

import {
  ProposalSectionType,
} from "./application/dto/StrategicPlanDTO"

import PaymentEditor from "./ui/components/PaymentEditor"
import ExportButtons from "./ui/components/ExportButtons"
import ServiceCatalogManager from "./ui/components/ServiceCatalogManager"
import AddServiceToProposal from "./ui/components/AddServiceToProposal"
import PianoEditor from "./ui/components/PianoEditor"
import IntakeView from "./ui/views/IntakeView"
import WorkspaceView from "./ui/views/WorkspaceView"
import UnauthorizedView from "./ui/views/UnauthorizedView"
import InviteActivationView from "./ui/views/InviteActivationView"
import OrganizationAccessView from "./ui/views/OrganizationAccessView"
import { AuthProvider } from "./auth/AuthProvider"
import ProtectedRoute from "./auth/ProtectedRoute"
import { useAuth } from "./auth/useAuth"
import { useRbacGate } from "./auth/useRbacGate"

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
  const { signOut, user } = useAuth()
  const { canAccessAdminUi, rbacLoading } = useRbacGate()
  const {
    services: catalog,
    addService,
    removeService,
  } = useServiceCatalog()
  const {
    piano,
    setPiano,
    propostaA,
    propostaB,
    addCatalogServiceToPropostaA,
    updatePropostaAServicePaymentStrategy,
    updatePropostaAServiceStartMonth,
    updatePropostaBServiceStartMonth,
    sectionToggles,
    setSectionEnabled,
  } = useAppState()

  const resetAll = () => {
    clearStorage(STORAGE_KEY)
    clearStorage(SERVICE_CATALOG_STORAGE_KEY)
    window.location.reload()
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Meraviglia Cashflow Engine</h1>

      <div style={{ marginBottom: 20 }}>
        <button type="button" onClick={() => void signOut()}>
          Logout
        </button>
      </div>

      <PianoEditor
        piano={piano}
        onUpdate={setPiano}
      />

      {rbacLoading ? null : canAccessAdminUi ? (
        <>
          <ServiceCatalogManager
            services={catalog}
            addService={addService}
            removeService={removeService}
          />
          <OrganizationAccessView currentUserId={user?.id ?? null} />
        </>
      ) : null}

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

      <WorkspaceView />

      <React.Suspense fallback={<div style={{ padding: 16 }}>Loading...</div>}>
        <ProposteCompareView
          piano={piano}
          propostaA={propostaA}
          propostaB={propostaB}
          onMoveServiceA={(id, month) =>
            updatePropostaAServiceStartMonth({ serviceId: id, month })
          }
          onMoveServiceB={(id, month) =>
            updatePropostaBServiceStartMonth({ serviceId: id, month })
          }
        />
      </React.Suspense>
    </div>
  )
}

function AuthenticatedShell() {
  const { membershipStatus, organizationId, organizationLoading, membershipLoading, user, pendingInviteToken, refreshAuthState, signOut } = useAuth()

  if (membershipLoading || organizationLoading) {
    return <div>Loading...</div>
  }

  if (membershipStatus === "invited") {
    return (
      <InviteActivationView
        email={user?.email ?? null}
        initialInviteToken={pendingInviteToken}
        onActivated={refreshAuthState}
        onLogout={signOut}
      />
    )
  }

  if (membershipStatus === "removed") {
    return <UnauthorizedView />
  }

  if (membershipStatus === "active" && organizationId) {
    return <CashflowApp />
  }

  return <UnauthorizedView />
}

function App() {
  return (
    <AuthProvider>
      {window.location.pathname === "/unauthorized" ? (
        <UnauthorizedView />
      ) : (
        <ProtectedRoute>
          <AuthenticatedShell />
        </ProtectedRoute>
      )}
    </AuthProvider>
  )
}

export default App
