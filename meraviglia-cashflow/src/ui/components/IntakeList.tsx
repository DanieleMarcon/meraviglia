import type { IntakeDTO } from "../../application/dto/IntakeDTO"
import ConvertIntakeButton from "./ConvertIntakeButton"

type IntakeListProps = {
  intakes: IntakeDTO[]
  onConverted: (workspace: { id: string; workspace_name: string }) => Promise<void> | void
}

function IntakeList({ intakes, onConverted }: IntakeListProps) {
  if (intakes.length === 0) {
    return <p>No intakes found.</p>
  }

  return (
    <div>
      <h2>Intakes</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {intakes.map((intake) => (
          <li key={intake.id} style={{ border: "1px solid #ddd", padding: 12, marginBottom: 8 }}>
            <p><strong>Name:</strong> {intake.first_name} {intake.last_name}</p>
            <p><strong>Email:</strong> {intake.email}</p>
            <p><strong>Status:</strong> {intake.status}</p>
            {intake.notes ? <p><strong>Notes:</strong> {intake.notes}</p> : null}
            <p><strong>Created:</strong> {new Date(intake.created_at).toLocaleString()}</p>

            {intake.status !== "converted" ? (
              <ConvertIntakeButton intakeId={intake.id} onConverted={onConverted} />
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default IntakeList
