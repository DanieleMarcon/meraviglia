import { useState, type FormEvent } from "react"
import { toUserFacingErrorMessage } from "../../application/toUserFacingErrorMessage"

import { createIntake } from "../../application/intakeService"

type IntakeFormProps = {
  onCreated: () => Promise<void> | void
}

type IntakeFormState = {
  activity: string
  email: string
  address: string
  is_online: boolean
  notes: string
}

const INITIAL_STATE: IntakeFormState = {
  activity: "",
  email: "",
  address: "",
  is_online: false,
  notes: "",
}

function IntakeForm({ onCreated }: IntakeFormProps) {
  const [formState, setFormState] = useState<IntakeFormState>(INITIAL_STATE)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setIsSubmitting(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      await createIntake({
        first_name: formState.activity,
        last_name: "Entry",
        email: formState.email,
        address: formState.address || null,
        is_online: formState.is_online,
        notes: formState.notes || null,
      })
      setFormState(INITIAL_STATE)
      setSuccessMessage("Entry saved. Next: qualify it and create a workspace.")
      await onCreated()
    } catch (error) {
      setErrorMessage(toUserFacingErrorMessage(error, "Unable to create intake"))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
      <h2>Create entry</h2>
      <p style={{ marginTop: 0, color: "#555" }}>Start with the activity or business first. Person details can be refined later in workspace contacts.</p>

      <label style={{ display: "block", marginBottom: 8 }}>
        Activity / business
        <input
          value={formState.activity}
          onChange={(event) => setFormState((prev) => ({ ...prev, activity: event.target.value }))}
          required
        />
      </label>

      <label style={{ display: "block", marginBottom: 8 }}>
        Main email
        <input
          type="email"
          value={formState.email}
          onChange={(event) => setFormState((prev) => ({ ...prev, email: event.target.value }))}
          required
        />
      </label>

      <label style={{ display: "block", marginBottom: 8 }}>
        Location / area (optional)
        <input
          value={formState.address}
          onChange={(event) => setFormState((prev) => ({ ...prev, address: event.target.value }))}
        />
      </label>

      <div style={{ marginBottom: 8 }}>
        <label>
          <input
            type="checkbox"
            checked={formState.is_online}
            onChange={(event) => setFormState((prev) => ({ ...prev, is_online: event.target.checked }))}
          />
          {" "}
          Came through an online channel
        </label>
      </div>

      <label style={{ display: "block", marginBottom: 8 }}>
        Notes (optional)
        <textarea
          rows={4}
          value={formState.notes}
          onChange={(event) => setFormState((prev) => ({ ...prev, notes: event.target.value }))}
        />
      </label>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Save entry"}
      </button>

      {errorMessage ? <p style={{ color: "crimson" }}>{errorMessage}</p> : null}
      {successMessage ? <p style={{ color: "green" }}>{successMessage}</p> : null}
    </form>
  )
}

export default IntakeForm
