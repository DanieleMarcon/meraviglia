import { type FormEvent, useState } from "react"
import { toUserFacingErrorMessage } from "../../application/toUserFacingErrorMessage"

import { createContact } from "../../application/contactService"

type ContactFormProps = {
  workspaceId: string
  onCreated: () => Promise<void>
  isHighlighted?: boolean
}

function ContactForm({ workspaceId, onCreated, isHighlighted = false }: ContactFormProps) {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [role, setRole] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalizedFirstName = firstName.trim()
    const normalizedLastName = lastName.trim()

    if (!normalizedFirstName && !normalizedLastName) {
      setErrorMessage("Add at least a first name or a last name.")
      setSuccessMessage(null)
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      await createContact({
        workspace_id: workspaceId,
        first_name: normalizedFirstName || normalizedLastName,
        last_name: normalizedLastName || "-",
        email,
        phone,
        role,
        provenance: "manual",
      })

      setFirstName("")
      setLastName("")
      setEmail("")
      setPhone("")
      setRole("")
      await onCreated()
      setSuccessMessage("Contact added. You can use it in the next interaction.")
    } catch (error) {
      setErrorMessage(toUserFacingErrorMessage(error, "Unable to create contact"))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      id={`workspace-${workspaceId}-contact-form`}
      onSubmit={handleSubmit}
      style={{ marginBottom: 12, border: isHighlighted ? "2px solid #2c8a3f" : "none", borderRadius: 6, padding: isHighlighted ? 8 : 0 }}
    >
      <p style={{ marginBottom: 8 }}><strong>Add relationship contact</strong></p>
      <p style={{ marginTop: 0, color: "#555" }}>Start with only what you know. First name and last name are both optional, but add at least one.</p>
      <label style={{ display: "block", marginBottom: 8 }}>
        First name
        <input id={`workspace-${workspaceId}-contact-first-name`} value={firstName} onChange={(event) => setFirstName(event.target.value)} />
      </label>
      <label style={{ display: "block", marginBottom: 8 }}>
        Last name
        <input value={lastName} onChange={(event) => setLastName(event.target.value)} />
      </label>
      <label style={{ display: "block", marginBottom: 8 }}>
        Email
        <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" />
      </label>
      <label style={{ display: "block", marginBottom: 8 }}>
        Phone
        <input value={phone} onChange={(event) => setPhone(event.target.value)} />
      </label>
      <label style={{ display: "block", marginBottom: 8 }}>
        Role
        <input value={role} onChange={(event) => setRole(event.target.value)} />
      </label>
      <button type="submit" disabled={isSubmitting}>{isSubmitting ? "Creating..." : "Add contact"}</button>
      {errorMessage ? <p style={{ color: "crimson" }}>{errorMessage}</p> : null}
      {successMessage ? <p style={{ color: "green" }}>{successMessage}</p> : null}
    </form>
  )
}

export default ContactForm
