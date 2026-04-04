import { useCallback, useEffect, useState } from "react"
import { toUserFacingErrorMessage } from "../../application/toUserFacingErrorMessage"

import { listIntakes } from "../../application/intakeService"
import type { IntakeDTO } from "../../application/dto/IntakeDTO"
import IntakeForm from "../components/IntakeForm"
import IntakeList from "../components/IntakeList"

const WORKSPACE_CONVERTED_EVENT = "workspace:converted"

function IntakeView() {
  const [intakes, setIntakes] = useState<IntakeDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const loadIntakes = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const results = await listIntakes()
      setIntakes(results)
    } catch (error) {
      setErrorMessage(toUserFacingErrorMessage(error, "Unable to load intakes"))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadIntakes()
  }, [loadIntakes])

  const handleConverted = useCallback(async (workspace: { id: string; workspace_name: string }) => {
    await loadIntakes()
    setSuccessMessage(`Intake converted to workspace context "${workspace.workspace_name}". Continue in Workspaces to add relationships and log events.`)
    window.dispatchEvent(new CustomEvent(WORKSPACE_CONVERTED_EVENT, { detail: workspace }))
    document.getElementById("workspaces-section")?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [loadIntakes])

  return (
    <section style={{ marginTop: 32 }}>
      <h1>Intake Operations</h1>
      <p style={{ marginTop: 0, color: "#444" }}>
        Step 1 — Intake captures the starting request so it can become an actionable workspace context.
      </p>
      <IntakeForm onCreated={loadIntakes} />
      {successMessage ? <p style={{ color: "green" }}>{successMessage}</p> : null}
      {!isLoading ? <p style={{ color: "#555" }}>Progress cue: {intakes.filter((item) => item.status === "converted").length} of {intakes.length} intakes converted into workspace context.</p> : null}
      {isLoading ? <p>Loading intakes...</p> : <IntakeList intakes={intakes} onConverted={handleConverted} />}
      {errorMessage ? <p style={{ color: "crimson" }}>{errorMessage}</p> : null}
    </section>
  )
}

export default IntakeView
