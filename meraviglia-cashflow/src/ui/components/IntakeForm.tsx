import { useState, type FormEvent } from "react"
import { toUserFacingErrorMessage } from "../../application/toUserFacingErrorMessage"

import { createIntake } from "../../application/intakeService"

type IntakeFormProps = {
  onCreated: () => Promise<void> | void
}

type IntakeFormState = {
  first_name: string
  last_name: string
  email: string
  address: string
  is_online: boolean
  notes: string
}

const INITIAL_STATE: IntakeFormState = {
  first_name: "",
  last_name: "",
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
        first_name: formState.first_name,
        last_name: formState.last_name,
        email: formState.email,
        address: formState.address || null,
        is_online: formState.is_online,
        notes: formState.notes || null,
      })
      setFormState(INITIAL_STATE)
      setSuccessMessage("Intake created. You can now convert it into a workspace.")
      await onCreated()
    } catch (error) {
      setErrorMessage(toUserFacingErrorMessage(error, "Unable to create intake"))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
      <h2>Create Intake</h2>

      <label style={{ display: "block", marginBottom: 8 }}>
        First name
        <input
          value={formState.first_name}
          onChange={(event) => setFormState((prev) => ({ ...prev, first_name: event.target.value }))}
          required
        />
      </label>

      <label style={{ display: "block", marginBottom: 8 }}>
        Last name
        <input
          value={formState.last_name}
          onChange={(event) => setFormState((prev) => ({ ...prev, last_name: event.target.value }))}
          required
        />
      </label>

      <label style={{ display: "block", marginBottom: 8 }}>
        Email
        <input
          type="email"
          value={formState.email}
          onChange={(event) => setFormState((prev) => ({ ...prev, email: event.target.value }))}
          required
        />
      </label>

      <label style={{ display: "block", marginBottom: 8 }}>
        Address
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
          Online intake
        </label>
      </div>

      <label style={{ display: "block", marginBottom: 8 }}>
        Notes
        <textarea
          rows={4}
          value={formState.notes}
          onChange={(event) => setFormState((prev) => ({ ...prev, notes: event.target.value }))}
        />
      </label>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating..." : "Create Intake"}
      </button>

      {errorMessage ? <p style={{ color: "crimson" }}>{errorMessage}</p> : null}
      {successMessage ? <p style={{ color: "green" }}>{successMessage}</p> : null}
    </form>
  )
}

export default IntakeForm
