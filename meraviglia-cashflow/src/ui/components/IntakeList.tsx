import type { IntakeDTO } from "../../application/dto/IntakeDTO"
import ConvertIntakeButton from "./ConvertIntakeButton"

type IntakeListProps = {
  intakes: IntakeDTO[]
  onConverted: (workspace: { id: string; workspace_name: string }) => Promise<void> | void
}

function IntakeList({ intakes, onConverted }: IntakeListProps) {
  const statusLabel: Record<IntakeDTO["status"], string> = {
    draft: "Open entry",
    validated: "Qualified entry",
    converted: "Workspace created",
  }

  if (intakes.length === 0) {
    return <p>No entries yet. Create one to start qualification.</p>
  }

  return (
    <div>
      <h2>Entries</h2>
      <p style={{ marginTop: 0, color: "#555" }}>Review each entry. Promote only the ones with real continuity and interest.</p>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {intakes.map((intake) => (
          <li key={intake.id} style={{ border: "1px solid #ddd", padding: 12, marginBottom: 8 }}>
            <p><strong>Activity / business:</strong> {intake.first_name}</p>
            <p><strong>Entry label:</strong> {intake.last_name}</p>
            <p><strong>Email:</strong> {intake.email}</p>
            <p><strong>Status:</strong> {statusLabel[intake.status]}</p>
            {intake.notes ? <p><strong>Notes:</strong> {intake.notes}</p> : null}
            <p><strong>Created:</strong> {new Date(intake.created_at).toLocaleString()}</p>

            {intake.status !== "converted" ? (
              <ConvertIntakeButton intakeId={intake.id} onConverted={onConverted} />
            ) : <p style={{ color: "#2c8a3f", margin: 0 }}>Workspace exists. Continue in Workspaces for relationships and interaction history.</p>}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default IntakeList
