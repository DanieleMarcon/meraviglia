import { useState, type FormEvent } from "react"

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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setIsSubmitting(true)
    setErrorMessage(null)

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
      await onCreated()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to create intake")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
      <h2>Create Intake</h2>

      <div style={{ marginBottom: 8 }}>
        <input
          placeholder="First name"
          value={formState.first_name}
          onChange={(event) => setFormState((prev) => ({ ...prev, first_name: event.target.value }))}
        />
      </div>

      <div style={{ marginBottom: 8 }}>
        <input
          placeholder="Last name"
          value={formState.last_name}
          onChange={(event) => setFormState((prev) => ({ ...prev, last_name: event.target.value }))}
        />
      </div>

      <div style={{ marginBottom: 8 }}>
        <input
          placeholder="Email"
          type="email"
          value={formState.email}
          onChange={(event) => setFormState((prev) => ({ ...prev, email: event.target.value }))}
        />
      </div>

      <div style={{ marginBottom: 8 }}>
        <input
          placeholder="Address"
          value={formState.address}
          onChange={(event) => setFormState((prev) => ({ ...prev, address: event.target.value }))}
        />
      </div>

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

      <div style={{ marginBottom: 8 }}>
        <textarea
          placeholder="Notes"
          rows={4}
          value={formState.notes}
          onChange={(event) => setFormState((prev) => ({ ...prev, notes: event.target.value }))}
        />
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating..." : "Create Intake"}
      </button>

      {errorMessage ? <p style={{ color: "crimson" }}>{errorMessage}</p> : null}
    </form>
  )
}

export default IntakeForm
